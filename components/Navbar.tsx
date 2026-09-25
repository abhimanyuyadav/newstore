"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, Menu, X, Heart, User } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { DATA_CHANGED_EVENT, getSiteSettings, defaultSiteSettings, getCurrentUser } from "@/lib/data";
export default function Navbar() {
  const router = useRouter();
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [user, setUser] = useState(getCurrentUser());
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  useEffect(() => { const load = () => { setSettings(getSiteSettings()); setUser(getCurrentUser()); }; load(); window.addEventListener(DATA_CHANGED_EVENT, load); return () => window.removeEventListener(DATA_CHANGED_EVENT, load); }, []);
  useEffect(() => { const close = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setSearchOpen(false); } }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, []);
  const links = [{ href: "/products", label: settings.navLabelShop }, { href: "/#categories", label: settings.navLabelCategories }, { href: "/#collections", label: settings.navLabelCollections }, { href: "/about", label: settings.navLabelAbout }];
  return <header className="store-header">
    {settings.promoText && <div className="store-announcement">{settings.promoText}</div>}
    <div className="store-nav store-shell">
      <button className="icon-button mobile-menu-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => { setOpen(!open); setSearchOpen(false); }}>{open ? <X /> : <Menu />}</button>
      <Link href="/" className="store-wordmark" aria-label={`${settings.siteName} home`}>{settings.siteName}</Link>
      <nav className="desktop-navigation" aria-label="Main navigation">{links.map(link => <Link key={link.label} href={link.href}>{link.label}</Link>)}</nav>
      <div className="nav-actions">
        <button className="icon-button" aria-label={searchOpen ? "Close search" : "Search products"} aria-expanded={searchOpen} aria-controls="store-search" onClick={() => { setSearchOpen(!searchOpen); setOpen(false); }}><Search /></button>
        <Link className="icon-button account-icon" href={user ? "/account" : "/login"} aria-label={user ? "My account" : "Sign in"}><User /></Link>
        <Link className="icon-button wishlist-icon" href="/wishlist" aria-label="Wishlist"><Heart /></Link>
        <Link className="icon-button bag-link" href="/cart" aria-label={`Shopping bag, ${count} items`}><ShoppingBag />{count > 0 && <span className="bag-count">{count}</span>}</Link>
      </div>
    </div>
    {searchOpen && <form id="store-search" role="search" className="store-search store-shell" onSubmit={e => { e.preventDefault(); setSearchOpen(false); router.push(`/products${q.trim() ? `?search=${encodeURIComponent(q.trim())}` : ""}`); }}><Search width={18} height={18} /><input aria-label="Search products" autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={settings.searchPlaceholder} /><button type="submit" className="text-link">Search</button></form>}
    {open && <nav id="mobile-navigation" className="mobile-navigation store-shell" aria-label="Mobile navigation">{[...links, { href: "/track-order", label: settings.navLabelTrackOrder }, { href: user ? "/account" : "/login", label: user ? "My account" : settings.navLabelLogin }, { href: "/wishlist", label: "Wishlist" }].map(link => <Link key={link.label} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}</nav>}
  </header>;
}
