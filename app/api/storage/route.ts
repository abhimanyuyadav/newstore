import { NextRequest, NextResponse } from "next/server";
import { readStore, writeValue } from "@/lib/server/store";
import { failure, HttpError, isAdmin, jsonBody, requireAdmin } from "@/lib/server/http";
import { ADMIN_KEYS, PUBLIC_KEYS, sanitizeSettings, validateSharedValue } from "@/lib/server/catalog";
import { publicUser } from "@/lib/server/auth";
import type { UserAccount, Review } from "@/lib/types";
import { defaultSiteSettings } from "@/lib/data";
export async function GET(req: NextRequest) {
  try {
    const admin = await isAdmin();
    const key = req.nextUrl.searchParams.get("key");
    const allowed = admin ? [...ADMIN_KEYS, "9teen_user_accounts"] : PUBLIC_KEYS;
    if (key && !allowed.includes(key)) throw new HttpError(403, "This data is private");
    const store = await readStore();
    const result: Record<string, unknown> = {};
    for (const name of allowed) {
      if (!(name in store)) continue;
      const value = store[name];
      result[name] = name === "9teen_site_settings" ? sanitizeSettings(value)
        : name === "9teen_user_accounts" ? (value as UserAccount[] || []).map(publicUser)
        : name === "9teen_reviews" && !admin ? (value as Review[] || []).filter(r => r.status === "approved") : value;
    }
    result["9teen_site_settings"] = {
      ...sanitizeSettings(defaultSiteSettings), ...sanitizeSettings(store["9teen_site_settings"]),
      ...(!admin && (!process.env.ESEWA_SECRET_KEY || !process.env.ESEWA_PRODUCT_CODE || !["test","production"].includes(process.env.ESEWA_ENVIRONMENT || "")) ? { esewaEnabled: false } : {}),
    };
    return NextResponse.json(key ? result[key] ?? null : result, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return failure(error); }
}
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await jsonBody(req);
    if (!body || typeof body.key !== "string" || body.value === undefined) throw new HttpError(400, "A key and value are required");
    if (body.key === "9teen_orders") throw new HttpError(400, "Update order status through the orders API");
    await writeValue(body.key, validateSharedValue(body.key, body.value));
    return NextResponse.json({ ok: true });
  } catch (error) { return failure(error); }
}
export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const body = await jsonBody(req);
    if (!ADMIN_KEYS.includes(body?.key)) throw new HttpError(400, "Unsupported storage key");
    if (body.key === "9teen_orders") throw new HttpError(400, "Cancel orders individually to preserve payment records");
    await writeValue(body.key, null);
    return NextResponse.json({ ok: true });
  } catch (error) { return failure(error); }
}
