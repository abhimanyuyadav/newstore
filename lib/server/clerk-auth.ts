import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { CUSTOMER_COOKIE, verifySession } from "../session";
import { allowedClerkAdmin } from "../clerk-policy";
import { readValue, updateValue } from "./store";
import type { Order, UserAccount } from "../types";
export async function revokeClerkSession() {
  const { sessionId } = await auth();
  if (sessionId) await (await clerkClient()).sessions.revokeSession(sessionId);
}

export async function isClerkAdmin() {
  if (process.env.APP_SURFACE === "storefront") return false;
  const { userId } = await auth();
  return Boolean(userId && allowedClerkAdmin(await currentUser(), process.env.CLERK_ADMIN_EMAILS || ""));
}

export async function clerkCustomer() {
  if (process.env.APP_SURFACE === "admin") return null;
  const { userId } = await auth();
  if (!userId) return null;
  const identity = await currentUser();
  const email = identity?.emailAddresses.find(e => e.id === identity.primaryEmailAddressId && e.verification?.status === "verified")?.emailAddress.toLowerCase();
  if (!identity || !email) return null;
  const profile = { clerkUserId: identity.id, email, name: identity.fullName || identity.firstName || email.split("@")[0] };
  const existing = await readValue<UserAccount[]>("9teen_user_accounts", []);
  const findAccount = (rows: UserAccount[]) => rows.find(u => u.clerkUserId === identity.id) || rows.find(u => !u.clerkUserId && u.email.toLowerCase() === email);
  let account = findAccount(existing);
  if (!account || account.clerkUserId !== identity.id || account.email !== email || account.name !== profile.name) {
    const users = await updateValue<UserAccount[]>("9teen_user_accounts", [], rows => {
      const found = findAccount(rows);
      if (found) return rows.map(u => u.id === found.id ? { ...u, ...profile, password: undefined } : u);
      return [...rows, { ...profile, id: `clerk:${identity.id}`, phone: "", address: "", city: "", createdAt: new Date().toISOString() }];
    });
    account = users.find(u => u.clerkUserId === identity.id);
  }
  // Only transfer orders belonging to a signed guest cookie from this browser.
  const previous = await verifySession((await cookies()).get(CUSTOMER_COOKIE)?.value);
  if (account && previous?.role === "customer" && previous.sub.startsWith("guest:")) {
    const orders = await readValue<Order[]>("9teen_orders", []);
    if (orders.some(o => o.ownerId === previous.sub)) await updateValue<Order[]>("9teen_orders", [], rows => rows.map(o => o.ownerId === previous.sub ? { ...o, ownerId: account!.id } : o));
  }
  return account || null;
}
