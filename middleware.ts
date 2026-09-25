import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import { clerkMiddleware, clerkClient } from "@clerk/nextjs/server";
import { clerkEnabled, allowedClerkAdmin } from "./lib/clerk-policy";
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
    if (!adminPage && !pathname.startsWith("/api/")) return new NextResponse("Not found", { status: 404 });
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
export default function middleware(request: NextRequest, event: NextFetchEvent) {
  return clerkEnabled() ? withClerk(request, event) : route(request);
}
export const config = { matcher: ["/((?!_next/|images/|favicon.svg|site.webmanifest).*)"] };
