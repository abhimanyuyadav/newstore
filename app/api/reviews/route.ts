import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { failure, HttpError, jsonBody, rateLimit } from "@/lib/server/http";
import { readValue, updateValue } from "@/lib/server/store";
import { defaultProducts } from "@/lib/data";
import type { Product, Review } from "@/lib/types";
export async function POST(req: Request) {
  try {
    rateLimit("review:" + (req.headers.get("x-forwarded-for") || "local"), 5, 60000);
    const body = await jsonBody(req, 8192);
    if (typeof body?.name !== "string" || !body.name.trim() || body.name.length > 100 || typeof body.comment !== "string" || !body.comment.trim() || body.comment.length > 2000 || !Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) throw new HttpError(400, "Enter a name, review, and rating from 1 to 5");
    if (!(await readValue<Product[]>("9teen_products", defaultProducts)).some(p => p.id === body.productId)) throw new HttpError(404, "Product not found");
    const review: Review = { id: randomUUID(), productId: body.productId, name: body.name.trim(), comment: body.comment.trim(), rating: body.rating, status: "pending", date: new Date().toISOString().slice(0,10) };
    await updateValue<Review[]>("9teen_reviews", [], reviews => [review, ...reviews]);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) { return failure(error); }
}
