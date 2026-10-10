import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import { clerkMiddleware, clerkClient } from "@clerk/nextjs/server";
import { clerkEnabled, allowedClerkAdmin } from "./lib/clerk-policy";
import { SITE_URL, indexingEnabled, isPublicPage } from "./lib/seo";
import { ADMIN_COOKIE, verifySession } from "./lib/session";
async function route(request: NextRequest, clerkUserId?: string | null) {
  const pathname = request.nextUrl.pathname;
  const adminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  if (process.env.APP_SURFACE === "storefront" && adminPage) {
    if (!process.env.ADMIN_APP_URL) return new NextResponse("Not found", { status: 404 });
    return NextResponse.redirect(new URL(pathname, process.env.ADMIN_APP_URL));
  }
  if (process.env.APP_SURFACE === "admin") {
    if (pathname === "/") return NextResponse.redirect(new URL("/admin", request.url));
    if (!adminPage && !["/robots.txt", "/sitemap.xml"].includes(pathname) && !pathname.startsWith("/api/")) return new NextResponse("Not found", { status: 404 });
  }
  if (adminPage && pathname !== "/admin") {
    const allowed = clerkEnabled()
      ? Boolean(clerkUserId && allowedClerkAdmin(await (await clerkClient()).users.getUser(clerkUserId), process.env.CLERK_ADMIN_EMAILS || ""))
      : (await verifySession(request.cookies.get(ADMIN_COOKIE)?.value))?.role === "admin";
    if (!allowed) return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}
const withClerk = clerkMiddleware(async (auth, request) => route(request, (await auth()).userId), {
  authorizedParties: process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL].filter(Boolean).map(host => `https://${host}`)
    : process.env.NEXT_PUBLIC_BASE_URL ? [process.env.NEXT_PUBLIC_BASE_URL] : undefined,
});
export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  // Next can use an internal hostname in request.nextUrl behind a reverse proxy.
  const hostname = request.headers.get("host")?.replace(/:\d+$/, "").toLowerCase() || request.nextUrl.hostname;
  const formerProductionAliases = ["9teenonlinestore.vercel.app", "9teen-six.vercel.app", "9teen-abhimanyuyadav-6285s-projects.vercel.app"];
  if (process.env.VERCEL_ENV === "production" && process.env.APP_SURFACE !== "admin"
    && formerProductionAliases.includes(hostname)
    && hostname !== new URL(SITE_URL).hostname
    && ["GET", "HEAD"].includes(request.method)
    && !request.nextUrl.pathname.startsWith("/api/")
    && !["/robots.txt", "/sitemap.xml"].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL(request.nextUrl.pathname + request.nextUrl.search, SITE_URL), 308);
  }
  const response = (clerkEnabled() ? await withClerk(request, event) : await route(request)) || NextResponse.next();
  const privatePage = !isPublicPage(request.nextUrl.pathname) && !["/robots.txt", "/sitemap.xml"].includes(request.nextUrl.pathname);
  if (!indexingEnabled() || hostname !== new URL(SITE_URL).hostname || privatePage) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}
export const config = { matcher: ["/((?!_next/|images/|favicon.svg|site.webmanifest).*)"] };
