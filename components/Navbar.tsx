"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, Menu, X, Heart, User } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { DATA_CHANGED_EVENT, getSiteSettings, defaultSiteSettings, getCurrentUser, isUserLoggedIn } from "@/lib/data";

export default function Navbar() {
  const router = useRouter();
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [user, setUser] = useState(getCurrentUser());
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const loadSettings = () => {
      setSettings(getSiteSettings());
      setUser(getCurrentUser());
    };

    loadSettings();
    window.addEventListener(DATA_CHANGED_EVENT, loadSettings);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, loadSettings);
  }, []);

  const handleSearchSubmit = () => {
    const query = q.trim();
    router.push(`/products${query ? `?search=${encodeURIComponent(query)}` : ""}`);
  };

  return (
    <header className="bg-white border-b border-gray-100">
      {/* Promo */}
      <div className="bg-black text-white text-xs py-1">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">{settings.promoText}</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-md hover:bg-gray-100">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/" className="font-black text-lg">19<span className="text-[#f97316]">TEEN</span></Link>
        </div>

        <nav className="hidden md:flex ml-6 gap-4 text-sm text-gray-600 items-center">
          <Link href="/products" className="hover:text-[#f97316]">{settings.navLabelShop}</Link>
          <Link href="/products?cat=dresses" className="hover:text-[#f97316]">{settings.navLabelCategories}</Link>
          <Link href="/products" className="hover:text-[#f97316]">{settings.navLabelCollections}</Link>
          <Link href="/track-order" className="hover:text-[#f97316]">{settings.navLabelTrackOrder}</Link>
          <Link href="/about" className="hover:text-[#f97316]">{settings.navLabelAbout}</Link>
          <Link href={isUserLoggedIn() ? "/account" : "/login"} className="hover:text-[#f97316]">{user ? user.name.split(" ")[0] : settings.navLabelLogin}</Link>
          <Link href="/admin" className="hover:text-[#f97316]">Admin</Link>
        </nav>

        <div className="flex-1 hidden md:flex items-center justify-center px-4">
          <div className="w-full max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearchSubmit()} placeholder={settings.searchPlaceholder}
              className="w-full border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Link href={isUserLoggedIn() ? "/account" : "/login"} className="hidden md:inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f97316]">{user ? user.name.split(" ")[0] : settings.navLabelLogin}</Link>
          <Link href="/wishlist" className="hidden md:inline-flex p-2 rounded-md hover:bg-gray-100"><Heart className="w-5 h-5" /></Link>
          <Link href="/account" className="hidden md:inline-flex p-2 rounded-md hover:bg-gray-100"><User className="w-5 h-5" /></Link>
          <Link href="/cart" className="relative p-2 rounded-md hover:bg-gray-100">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && <span className="absolute -top-1 -right-1 bg-[#f97316] text-white rounded-full text-[10px] px-1">{count}</span>}
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-3 space-y-2">
            <Link href="/products" className="block py-2">{settings.navLabelShop}</Link>
            <Link href="/products?cat=dresses" className="block py-2">{settings.navLabelCategories}</Link>
            <Link href="/products" className="block py-2">{settings.navLabelCollections}</Link>
            <Link href="/track-order" className="block py-2">{settings.navLabelTrackOrder}</Link>
            <Link href="/about" className="block py-2">{settings.navLabelAbout}</Link>
            <Link href={isUserLoggedIn() ? "/account" : "/login"} className="block py-2">{user ? user.name.split(" ")[0] : settings.navLabelLogin}</Link>
            <Link href="/wishlist" className="block py-2">Wishlist</Link>
            <Link href="/account" className="block py-2">Account</Link>
            <Link href="/admin" className="block py-2">Admin Panel</Link>
          </div>
        </div>
      )}
    </header>
  );
}
