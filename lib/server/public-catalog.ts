import "server-only";
import { cache } from "react";
import { readValue } from "./store";
import { sanitizeSettings } from "./catalog";
import { defaultSiteSettings } from "../data";
import type { Category, Product, Review, SiteSettings } from "../types";
import type { PublicCatalog } from "../public-catalog";

// React cache deduplicates only within a render; never cache customer/session data.
export const getPublicCatalog = cache(async (): Promise<PublicCatalog> => {
  const [products, categories, savedSettings, reviews] = await Promise.all([
    readValue<Product[]>("9teen_products", []),
    readValue<Category[]>("9teen_categories", []),
    readValue<Partial<SiteSettings>>("9teen_site_settings", {}),
    readValue<Review[]>("9teen_reviews", []),
  ]);
  const publicSettings = sanitizeSettings(savedSettings);
  const settings = Object.fromEntries(Object.keys(defaultSiteSettings)
    .filter(key => key !== "adminUsername" && key !== "adminPassword")
    .map(key => [key, (publicSettings as Record<string, unknown>)[key] ?? defaultSiteSettings[key as keyof SiteSettings]])) as unknown as SiteSettings;
  if (!process.env.ESEWA_SECRET_KEY || !process.env.ESEWA_PRODUCT_CODE || !["test", "production"].includes(process.env.ESEWA_ENVIRONMENT || "")) settings.esewaEnabled = false;
  return { products: products || [], categories: categories || [], settings, reviews: (reviews || []).filter(review => review.status === "approved") };
});
