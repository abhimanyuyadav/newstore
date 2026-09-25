import { HttpError } from "./http";
export const PUBLIC_KEYS = ["9teen_products", "9teen_categories", "9teen_site_settings", "9teen_coupons", "9teen_reviews"];
export const ADMIN_KEYS = [...PUBLIC_KEYS, "9teen_orders"];
export function sanitizeSettings(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const { adminUsername: _u, adminPassword: _p, ...settings } = value as Record<string, unknown>;
  return settings;
}
export function validateSharedValue(key: string, value: unknown) {
  if (!ADMIN_KEYS.includes(key)) throw new HttpError(400, "Unsupported storage key");
  if (value === null) return value;
  if (key === "9teen_site_settings") return sanitizeSettings(value);
  if (!Array.isArray(value) || value.length > 10000 || value.some(item => !item || typeof item !== "object" || typeof item.id !== "string")) throw new HttpError(400, "Invalid data");
  if (key === "9teen_products" && value.some(p => typeof p.name !== "string" || typeof p.image !== "string" || !Number.isFinite(p.price) || p.price < 0 || !Array.isArray(p.sizes) || p.sizes.some((s: unknown) => typeof s !== "string"))) throw new HttpError(400, "Invalid product");
  return value;
}
