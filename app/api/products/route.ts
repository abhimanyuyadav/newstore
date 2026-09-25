import { NextResponse } from "next/server";
import { defaultProducts } from "@/lib/data";
import { readValue, updateValue } from "@/lib/server/store";
import type { Product } from "@/lib/types";
import { failure, jsonBody, requireAdmin } from "@/lib/server/http";
import { validateSharedValue } from "@/lib/server/catalog";
export async function GET() {
  try { return NextResponse.json(await readValue("9teen_products", defaultProducts)); } catch (error) { return failure(error); }
}
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await jsonBody(req);
    const rows = Array.isArray(body) ? body : [body];
    validateSharedValue("9teen_products", rows);
    await updateValue<Product[]>("9teen_products", defaultProducts, products => {
      const merged = new Map(products.map(product => [product.id, product]));
      rows.forEach(product => merged.set(product.id, product));
      return [...merged.values()];
    });
    return NextResponse.json({ success: true, inserted: rows.length });
  } catch (error) { return failure(error); }
}
