import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySession } from "./lib/session";
export async function middleware(request: NextRequest) {
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
  if (adminPage && pathname !== "/admin" && (await verifySession(request.cookies.get(ADMIN_COOKIE)?.value))?.role !== "admin") return NextResponse.redirect(new URL("/admin", request.url));
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/|images/|favicon.svg|site.webmanifest).*)"] };
