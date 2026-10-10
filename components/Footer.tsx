"use client";
import { usePublicCatalog } from "@/components/DataProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DATA_CHANGED_EVENT, getSiteSettings, defaultSiteSettings, buildWhatsappLink } from "@/lib/data";
export default function Footer() {
  const { settings } = usePublicCatalog();
  const support = buildWhatsappLink(settings.whatsappNumber, `Hi, I need help with an order from ${settings.siteName}.`);
  return <footer className="store-footer"><div className="store-shell">
    <div className="footer-grid"><div className="footer-brand"><Link href="/" className="store-wordmark">{settings.siteName.startsWith("9") ? <><span className="brand-nine">9</span>{settings.siteName.slice(1)}</> : settings.siteName}</Link><p>{settings.tagline}</p><span>{settings.footerContactLocation}</span></div>
      <nav aria-label="Footer shop links"><h2>Explore</h2><Link href="/products">Shop all</Link><Link href="/products?collection=newArrivals">New arrivals</Link><Link href="/#categories">Categories</Link><Link href="/about">Our story</Link></nav>
      <nav aria-label="Customer service"><h2>Here to help</h2><Link href="/track-order">Track your order</Link><Link href="/account">My account</Link><Link href="/wishlist">Your wishlist</Link><Link href={support} target="_blank" rel="noreferrer">{settings.footerWhatsAppButtonLabel}<ArrowUpRight width={14} height={14} /></Link></nav>
      <div className="footer-contact"><h2>Let's stay connected</h2><a href={`mailto:${settings.footerContactEmail}`}>{settings.footerContactEmail}</a><a href={`tel:${settings.footerContactPhone.replace(/[^+0-9]/g, "")}`}>{settings.footerContactPhone}</a><p>Questions about a piece? We're a message away.</p></div>
    </div><div className="footer-bottom"><span>© {new Date().getFullYear()} {settings.siteName}</span><span>Made for your everyday.</span><Link href="/admin">Store admin</Link></div>
  </div></footer>;
}
