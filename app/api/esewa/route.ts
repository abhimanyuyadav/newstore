import { NextResponse } from "next/server";
import { customerSession, failure, HttpError, jsonBody } from "@/lib/server/http";
import { readValue } from "@/lib/server/store";
import { esewaConfig, signature } from "@/lib/server/esewa";
import type { Order } from "@/lib/types";
export async function POST(req: Request) {
  try {
    const session = await customerSession();
    if (!session) throw new HttpError(401, "Checkout session required");
    const body = await jsonBody(req,8192);
    const order = (await readValue<Order[]>("9teen_orders",[])).find(o => o.id === body?.orderId && o.ownerId === session.sub);
    if (!order || order.paymentMethod !== "esewa" || order.paymentStatus === "paid" || order.status === "cancelled") throw new HttpError(400,"Order is not eligible for payment");
    const config = esewaConfig();
    const base = new URL(process.env.NEXT_PUBLIC_BASE_URL || req.url).origin;
    const total = String(order.total);
    return NextResponse.json({ amount:total,tax_amount:"0",total_amount:total,transaction_uuid:order.id,product_code:config.code,product_service_charge:"0",product_delivery_charge:"0",success_url:base+"/payment/success?orderId="+encodeURIComponent(order.id),failure_url:base+"/payment/failure",signed_field_names:"total_amount,transaction_uuid,product_code",signature:signature("total_amount="+total+",transaction_uuid="+order.id+",product_code="+config.code,config.secret),esewa_url:config.form });
  } catch (error) { return failure(error); }
}
