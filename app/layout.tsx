import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";

export const metadata = {
  title: "9TEEN Shop | Style for Every Season",
  description: "Browse the latest curated streetwear, beauty, and accessories from 9TEEN. Shop products, categories, and exclusive offers on the homepage.",
};

const playfair = Playfair_Display({ subsets:["latin"], weight:["700","900"], style:["normal","italic"], variable:"--font-playfair", display:"swap" });
const dmSans = DM_Sans({ subsets:["latin"], weight:["300","400","500","600"], variable:"--font-dm-sans", display:"swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${playfair.variable} ${dmSans.variable}`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
