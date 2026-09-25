import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySession } from "./lib/session";
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/admin" && (await verifySession(request.cookies.get(ADMIN_COOKIE)?.value))?.role !== "admin") return NextResponse.redirect(new URL("/admin", request.url));
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
