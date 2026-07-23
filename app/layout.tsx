import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";

const playfair = Playfair_Display({ subsets:["latin"], weight:["700","900"], style:["normal","italic"], variable:"--font-playfair", display:"swap" });
const dmSans = DM_Sans({ subsets:["latin"], weight:["300","400","500","600"], variable:"--font-dm-sans", display:"swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable}`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
