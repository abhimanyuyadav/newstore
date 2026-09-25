import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE, createSession } from "@/lib/session";
import { cookieOptions, customerSession, failure, HttpError, jsonBody, rateLimit, sameOrigin } from "@/lib/server/http";
import { publicUser, hashPassword, verifyPassword } from "@/lib/server/auth";
import { readValue, updateValue } from "@/lib/server/store";
import type { UserAccount, Order } from "@/lib/types";
export async function GET() {
  try {
    const session = await customerSession();
    if (!session) return NextResponse.json(null);
    const users = await readValue<UserAccount[]>("9teen_user_accounts", []);
    const user = users.find(user => user.id === session.sub);
    return NextResponse.json(user ? publicUser(user) : null);
  } catch (error) { return failure(error); }
}
export async function POST(req: Request) {
  try {
    rateLimit(`customer:${req.headers.get("x-forwarded-for") || "local"}`, 10, 900000);
    const body = await jsonBody(req, 8192);
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new HttpError(503, "Account service is not configured");
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length > 128) throw new HttpError(400, "Enter a valid email and password");
    let user: UserAccount;
    if (body.action === "register") {
      if (password.length < 8) throw new HttpError(400, "Password must contain at least 8 characters");
      for (const [key, min, max] of [["name", 2, 100], ["phone", 10, 20], ["address", 1, 500], ["city", 1, 100]] as const) {
        if (typeof body[key] !== "string" || body[key].trim().length < min || body[key].length > max) throw new HttpError(400, `Enter a valid ${key}`);
      }
      user = { id: randomUUID(), email, password: await hashPassword(password), name: body.name.trim(), phone: body.phone.trim(), address: body.address.trim(), city: body.city.trim(), createdAt: new Date().toISOString() };
      await updateValue<UserAccount[]>("9teen_user_accounts", [], users => {
        if (users.some(u => u.email.toLowerCase() === email)) throw new HttpError(409, "An account with this email already exists");
        return [...users, user];
      });
    } else if (body.action === "login") {
      const users = await readValue<UserAccount[]>("9teen_user_accounts", []);
      const match = users.find(u => u.email.toLowerCase() === email);
      if (!match || !await verifyPassword(password, match.password || "")) throw new HttpError(401, "Invalid email or password");
      user = match;
    } else throw new HttpError(400, "Invalid action");
    const previous = await customerSession();
    if (previous?.sub.startsWith("guest:")) {
      await updateValue<Order[]>("9teen_orders", [], orders => orders.map(order => order.ownerId === previous.sub ? { ...order, ownerId: user.id } : order));
    }
    const result = NextResponse.json(publicUser(user));
    result.cookies.set(CUSTOMER_COOKIE, await createSession("customer", user.id), cookieOptions);
    return result;
  } catch (error) { return failure(error); }
}
export async function DELETE(req: Request) {
  try {
    sameOrigin(req);
    const result = NextResponse.json({ ok: true });
    result.cookies.set(CUSTOMER_COOKIE, "", { ...cookieOptions, maxAge: 0 });
    return result;
  } catch (error) { return failure(error); }
}
