import type { MetadataRoute } from "next";
import { absoluteUrl, indexingEnabled } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  // Let crawlers read noindex on HTML pages. robots.txt is not access control.
  if (!indexingEnabled()) return { rules: { userAgent: "*", allow: "/", disallow: "/api/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: absoluteUrl("/sitemap.xml") };
}
