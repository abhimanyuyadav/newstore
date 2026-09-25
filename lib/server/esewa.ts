import { createHmac } from "node:crypto";
import { HttpError } from "./http";
export function esewaConfig() {
  const code = process.env.ESEWA_PRODUCT_CODE, secret = process.env.ESEWA_SECRET_KEY;
  const mode = process.env.ESEWA_ENVIRONMENT;
  if (!code || !secret || !["test","production"].includes(mode || "")) throw new HttpError(503, "Online payment is not configured");
  const production = mode === "production";
  if (production && code === "EPAYTEST") throw new HttpError(503, "Production merchant credentials are required");
  return { code, secret, form: production ? "https://epay.esewa.com.np/api/epay/main/v2/form" : "https://rc-epay.esewa.com.np/api/epay/main/v2/form", status: production ? "https://esewa.com.np/api/epay/transaction/status/" : "https://rc.esewa.com.np/api/epay/transaction/status/" };
}
export function signature(message: string, secret: string) { return createHmac("sha256", secret).update(message).digest("base64"); }
