import type { MetadataRoute } from "next";
import { getPublicCatalog } from "@/lib/server/public-catalog";
import { absoluteUrl, indexingEnabled, publicPaths } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexingEnabled()) return [];
  const { products } = await getPublicCatalog();
  const paths = [...publicPaths, ...products.map(product => `/product/${encodeURIComponent(product.id)}`)];
  return [...new Set(paths)].map(path => ({ url: absoluteUrl(path) }));
}
