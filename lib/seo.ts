import type { Metadata } from "next";

// This is the verified production alias, never a Vercel preview hostname.
const configured = new URL(process.env.SEO_SITE_URL || "https://9teen-collection.vercel.app");
if (configured.protocol !== "https:" || configured.username || configured.password || configured.pathname !== "/" || configured.search || configured.hash) {
  throw new Error("SEO_SITE_URL must be an HTTPS origin without credentials, path, query, or fragment");
}
export const SITE_URL = configured.origin;
export const SITE_NAME = "9TEEN";
export const DEFAULT_DESCRIPTION = "Explore clothing, accessories and everyday style at 9TEEN. Browse the latest collection and find your next favourite.";
export const SOCIAL_IMAGE = "/images/campaign/warm-hero.png";
export const publicPaths = ["/", "/products", "/about", "/lookbook"];
export function isPublicPage(path: string) {
  return publicPaths.includes(path) || /^\/product\/[^/]+$/.test(path);
}
export function indexingEnabled() {
  return process.env.APP_SURFACE !== "admin" && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production");
}
export function absoluteUrl(path: string) { return new URL(path, SITE_URL).href; }
export function pageMetadata(title: string, description: string, path: string, image = SOCIAL_IMAGE): Metadata {
  title = title.trim();
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title, description, alternates: { canonical: absoluteUrl(path) },
    robots: { index: indexingEnabled(), follow: true },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", title: fullTitle, description, url: absoluteUrl(path), images: [{ url: absoluteUrl(image), alt: title }] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [absoluteUrl(image)] },
  };
}
export function privateMetadata(title: string): Metadata {
  return { title, description: `${title} for your 9TEEN account.`, robots: { index: false, follow: false }, alternates: { canonical: null } };
}
export function jsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
