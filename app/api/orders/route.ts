import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { defaultProducts, categories as defaultCategories, defaultSiteSettings } from "@/lib/data";
import type { Order, Product, Category, SiteSettings } from "@/lib/types";
import { readValue, updateValue } from "@/lib/server/store";
import { cookieOptions, customerSession, failure, HttpError, isAdmin, jsonBody, rateLimit, requireAdmin } from "@/lib/server/http";
import { CUSTOMER_COOKIE, createSession } from "@/lib/session";
export async function GET() {
  try {
    const admin = await isAdmin();
    const session = await customerSession();
    if (!admin && !session) {
      const result = NextResponse.json([]);
      if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32) result.cookies.set(CUSTOMER_COOKIE, await createSession("customer", "guest:" + randomUUID()), cookieOptions);
      return result;
    }
    const orders = await readValue<Order[]>("9teen_orders", []);
    return NextResponse.json(admin ? orders : orders.filter(o => o.ownerId === session?.sub), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return failure(error); }
}
export async function POST(req: Request) {
  try {
    rateLimit("orders:" + (req.headers.get("x-forwarded-for") || "local"), 20, 60000);
    const body = await jsonBody(req);
    if (Array.isArray(body)) throw new HttpError(400, "Use PATCH to update order statuses");
    if (!body || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 100) throw new HttpError(400, "Your cart must contain between 1 and 100 items");
    if (!["whatsapp", "esewa"].includes(body.paymentMethod)) throw new HttpError(400, "Invalid payment method");
    if (typeof body.requestId !== "string" || !/^[a-f0-9-]{36}$/.test(body.requestId)) throw new HttpError(400, "A checkout request ID is required");
    const settings = await readValue<SiteSettings>("9teen_site_settings", defaultSiteSettings);
    if (body.paymentMethod === "esewa" && (settings.esewaEnabled === false || !process.env.ESEWA_SECRET_KEY || !process.env.ESEWA_PRODUCT_CODE)) throw new HttpError(503, "Online payment is unavailable. Please choose WhatsApp.");
    const customer = body.customer;
    for (const [key, max] of [["name",100],["phone",20],["address",500],["city",100]] as const) {
      if (typeof customer?.[key] !== "string" || !customer[key].trim() || customer[key].length > max) throw new HttpError(400, "Enter valid delivery details");
    }
    if (typeof customer.email !== "string" || customer.email.length > 254 || (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))) throw new HttpError(400, "Invalid email address");
    const products = await readValue<Product[]>("9teen_products", defaultProducts);
    const categories = await readValue<Category[]>("9teen_categories", defaultCategories);
    const items = body.items.map((item: any) => {
      const product = products.find(p => p.id === item?.id);
      if (!product || !product.inStock || categories.some(c => c.id === product.category && !c.enabled)) throw new HttpError(400, "A cart item is no longer available");
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 || !product.sizes.includes(item.size) || !Number.isFinite(product.price) || product.price <= 0) throw new HttpError(400, "Invalid item quantity, size, or price");
      const selections: Record<string,string> = {};
      for (const variant of product.variants || []) {
        const choice = item.variantSelections?.[variant.name];
        if (!variant.values.includes(choice)) throw new HttpError(400, "Select a valid product variant");
        selections[variant.name] = choice;
      }
      return { id: product.id, name: product.name, image: product.image, price: product.price, size: item.size, quantity: item.quantity, variantSelections: selections };
    });
    const session = await customerSession();
    const ownerId = session?.sub || "guest:" + randomUUID();
    const token = await createSession("customer", ownerId);
    const order: Order = { id: "19T-" + randomUUID(), ownerId, requestId: body.requestId, items, customer: { name:customer.name.trim(),phone:customer.phone.trim(),email:customer.email.trim().toLowerCase(),address:customer.address.trim(),city:customer.city.trim() }, total: Math.round(items.reduce((n: number,i: any) => n + i.price * i.quantity,0)*100)/100, paymentMethod: body.paymentMethod, paymentStatus:"pending",status:"pending",createdAt:new Date().toISOString(),whatsappMessage:typeof body.whatsappMessage === "string" ? body.whatsappMessage.slice(0,2000) : undefined };
    const orders = await updateValue<Order[]>("9teen_orders", [], rows => rows.some(o => o.ownerId === ownerId && o.requestId === body.requestId) ? rows : [order,...rows]);
    const saved = orders.find(o => o.ownerId === ownerId && o.requestId === body.requestId)!;
    const response = NextResponse.json(saved, { status: 201 });
    response.cookies.set(CUSTOMER_COOKIE, token, cookieOptions);
    return response;
  } catch (error) { return failure(error); }
}
export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await jsonBody(req);
    if (!Array.isArray(body) || body.some(o => typeof o?.id !== "string" || !["pending","processing","shipped","delivered","cancelled"].includes(o.status))) throw new HttpError(400,"Invalid order status update");
    await updateValue<Order[]>("9teen_orders", [], orders => orders.map(order => {
      const update = body.find(item => item.id === order.id);
      return update ? { ...order, status: update.status } : order;
    }));
    return NextResponse.json({ ok: true });
  } catch (error) { return failure(error); }
}
