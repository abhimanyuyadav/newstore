import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import DataProvider from "@/components/DataProvider";
import { CartProvider } from "@/components/CartContext";
import { AuthenticationProvider } from "@/components/ClerkAuthentication";
import { getPublicCatalog } from "@/lib/server/public-catalog";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, indexingEnabled } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: process.env.APP_SURFACE === "admin" ? "9TEEN | Store Administration" : "9TEEN Collection | Online Clothing Shopping in Nepal", template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  // Public pages opt in individually; Next's automatic 404 noindex stays unambiguous.
  ...(!indexingEnabled() ? { robots: { index: false, follow: false } } : {}),
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
  manifest: "/site.webmanifest",
};
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-dm-sans", display: "swap" });
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialCatalog = process.env.APP_SURFACE === "admin" ? undefined : await getPublicCatalog();
  return <html lang="en-NP"><body className={dmSans.variable}><AuthenticationProvider><DataProvider initialCatalog={initialCatalog}><CartProvider>{children}</CartProvider></DataProvider></AuthenticationProvider></body></html>;
}
