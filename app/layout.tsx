import { DM_Sans } from "next/font/google";
import "./globals.css";
import DataProvider from "@/components/DataProvider";
import { CartProvider } from "@/components/CartContext";

export const metadata = {
  title: process.env.APP_SURFACE === "admin" ? "9TEEN | Store Administration" : "9TEEN Shop | Style for Every Season",
  ...(process.env.APP_SURFACE === "admin" ? { robots: { index: false, follow: false } } : {}),
  description: "Browse the latest curated streetwear, beauty, and accessories from 9TEEN. Shop products, categories, and exclusive offers on the homepage.",
};

const dmSans = DM_Sans({ subsets:["latin"], weight:["300","400","500","600","700","800"], variable:"--font-dm-sans", display:"swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={dmSans.variable}>
        <DataProvider><CartProvider>{children}</CartProvider></DataProvider>
      </body>
    </html>
  );
}
