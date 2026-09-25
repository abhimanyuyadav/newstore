import { NextResponse } from "next/server";
import { customerSession, failure, HttpError, jsonBody, rateLimit } from "@/lib/server/http";
import { readValue, updateValue } from "@/lib/server/store";
import { esewaConfig } from "@/lib/server/esewa";
import type { Order } from "@/lib/types";
export async function POST(req: Request) {
  try {
    const session = await customerSession();
    if (!session) throw new HttpError(401,"Checkout session required");
    rateLimit("verify:"+session.sub,10,60000);
    const body = await jsonBody(req,8192);
    const order = (await readValue<Order[]>("9teen_orders",[])).find(o => o.id === body?.orderId && o.ownerId === session.sub);
    if (!order || order.paymentMethod !== "esewa") throw new HttpError(404,"Order not found");
    if (order.paymentStatus === "paid") return NextResponse.json(order);
    const config = esewaConfig();
    const url = new URL(config.status);
    url.search = new URLSearchParams({ product_code:config.code,total_amount:String(order.total),transaction_uuid:order.id }).toString();
    const result = await fetch(url,{ cache:"no-store",signal:AbortSignal.timeout(10000) });
    if (!result.ok) throw new HttpError(502,"Payment verification is temporarily unavailable");
    const payment = await result.json();
    if (payment.status !== "COMPLETE" || payment.product_code !== config.code || payment.transaction_uuid !== order.id || Number(payment.total_amount) !== order.total || !payment.ref_id) throw new HttpError(409,"Payment has not been confirmed. Please retry or contact the store.");
    const orders = await updateValue<Order[]>("9teen_orders",[],rows => rows.map(o => o.id === order.id ? { ...o,paymentStatus:"paid",status:o.status === "pending" ? "processing" : o.status } : o));
    return NextResponse.json(orders.find(o => o.id === order.id));
  } catch (error) { return failure(error); }
}
