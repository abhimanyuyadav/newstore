async function post(url: string, value: unknown, method = "POST") {
  const response = await fetch(url, { method, headers: { "Content-Type":"application/json" }, body:JSON.stringify(value) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Save failed");
  return result;
}
export function postProducts(products: unknown[]) { return post("/api/products", products); }
export function postOrders(orders: unknown[]) { return post("/api/orders", orders, "PATCH"); }
export function postUsers(_users: unknown[]): Promise<{ error?: string; inserted: number }> { return Promise.reject(new Error("Bulk account import is disabled. Customers must register securely.")); }
export async function migrateAll(payload: { products?: unknown[]; orders?: unknown[]; users?: unknown[] }) {
  return {
    products: payload.products ? await postProducts(payload.products) : { skipped:true },
    orders: payload.orders ? await postOrders(payload.orders) : { skipped:true },
    users: { skipped:true, reason:"Customers must register securely" },
  };
}
