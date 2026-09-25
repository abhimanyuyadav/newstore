import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createSession } from "@/lib/session";
import { cookieOptions, failure, HttpError, isAdmin, jsonBody, rateLimit, sameOrigin } from "@/lib/server/http";
export async function GET() { return NextResponse.json({ authenticated: await isAdmin() }); }
export async function POST(req: Request) {
  try {
    if (process.env.APP_SURFACE === "storefront") throw new HttpError(404, "Use the separate admin site to sign in");
    rateLimit(`admin:${req.headers.get("x-forwarded-for") || "local"}`, 5, 900000);
    const body = await jsonBody(req, 8192);
    const expected = process.env.ADMIN_PASSWORD;
    const username = process.env.ADMIN_USERNAME;
    if (!expected || !username || !process.env.SESSION_SECRET) throw new HttpError(503, "Administrator access is not configured on the server");
    const password = typeof body?.password === "string" ? body.password : "";
    const a = Buffer.from(password), b = Buffer.from(expected);
    if (body?.username !== username || a.length !== b.length || !timingSafeEqual(a, b)) throw new HttpError(401, "Incorrect username or password");
    const result = NextResponse.json({ authenticated: true });
    result.cookies.set(ADMIN_COOKIE, await createSession("admin", username), cookieOptions);
    return result;
  } catch (error) { return failure(error); }
}
export async function DELETE(req: Request) {
  try {
    sameOrigin(req);
    const result = NextResponse.json({ ok: true });
    result.cookies.set(ADMIN_COOKIE, "", { ...cookieOptions, maxAge: 0 });
    return result;
  } catch (error) { return failure(error); }
}
