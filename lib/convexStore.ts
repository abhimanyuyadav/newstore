// All shared data goes through the authenticated server boundary.
async function request(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Unable to save data");
  return data;
}
export function readSharedValue(key: string) { return request("/api/storage?key=" + encodeURIComponent(key)); }
export function readAllSharedValues() { return request("/api/storage"); }
export async function writeSharedValue(key: string, value: unknown) {
  await request("/api/storage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value }) });
  return true;
}
export async function deleteSharedValue(key: string) {
  await request("/api/storage", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
  return true;
}
