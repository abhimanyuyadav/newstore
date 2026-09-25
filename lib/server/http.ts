import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, CUSTOMER_COOKIE, verifySession } from "../session";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function isAdmin() {
  return (await verifySession((await cookies()).get(ADMIN_COOKIE)?.value))?.role === "admin";
}
export async function requireAdmin() {
  if (!await isAdmin()) throw new HttpError(401, "Administrator sign-in required");
}
export async function customerSession() {
  const session = await verifySession((await cookies()).get(CUSTOMER_COOKIE)?.value);
  return session?.role === "customer" ? session : null;
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  // Next may construct Request.url with an internal hostname behind a proxy.
  const expected = process.env.NEXT_PUBLIC_BASE_URL
    ? new URL(process.env.NEXT_PUBLIC_BASE_URL).origin
    : new URL(req.url).protocol + "//" + (req.headers.get("host") || new URL(req.url).host);
  if ((origin && origin !== expected) || req.headers.get("sec-fetch-site") === "cross-site") throw new HttpError(403, "Cross-site request rejected");
}
export async function jsonBody(req: Request, limit = 1024 * 1024) {
  sameOrigin(req);
  if (Number(req.headers.get("content-length")) > limit) throw new HttpError(413, "Request too large");
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, "JSON body required");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); throw new HttpError(413, "Request too large"); }
    chunks.push(value);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || typeof value !== "object") throw new Error("Expected object or array");
    return value;
  }
  catch { throw new HttpError(400, "Invalid JSON body"); }
}
export function failure(error: unknown) {
  return NextResponse.json({ error: error instanceof HttpError ? error.message : "Service unavailable. Please try again." }, { status: error instanceof HttpError ? error.status : 503 });
}
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 86400 };
const attempts = new Map<string, { count: number; expires: number }>();
export function rateLimit(key: string, max = 20, window = 60000) {
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.expires <= now) attempts.delete(key);
  if (attempts.size >= 10000 && !attempts.has(key)) throw new HttpError(429, "Please try again later");
  const entry = attempts.get(key) ?? { count: 0, expires: now + window };
  if (++entry.count > max) throw new HttpError(429, "Too many attempts. Please try again later.");
  attempts.set(key, entry);
}
