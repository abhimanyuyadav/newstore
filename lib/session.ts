export type Session = { role: "admin" | "customer"; sub: string; exp: number };
export const ADMIN_COOKIE = "admin_session";
export const CUSTOMER_COOKIE = "customer_session";
const encoder = new TextEncoder();

async function signingKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
function encode(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decode(value: string) {
  return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
}
export async function createSession(role: Session["role"], sub: string) {
  const payload = encode(encoder.encode(JSON.stringify({ role, sub, exp: Date.now() + 86400000 })));
  const signature = await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(payload));
  return `${payload}.${encode(new Uint8Array(signature))}`;
}
export async function verifySession(token?: string): Promise<Session | null> {
  try {
    if (!token || token.length > 2048) return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    if (!await crypto.subtle.verify("HMAC", await signingKey(), decode(signature), encoder.encode(payload))) return null;
    const value = JSON.parse(new TextDecoder().decode(decode(payload)));
    return (value.role === "admin" || value.role === "customer") && typeof value.sub === "string" && Number.isFinite(value.exp) && value.exp > Date.now() ? value : null;
  } catch { return null; }
}
