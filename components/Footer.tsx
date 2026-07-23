"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DATA_CHANGED_EVENT, getSiteSettings, defaultSiteSettings } from "@/lib/data";

export default function Footer() {
  const [settings, setSettings] = useState(defaultSiteSettings);

  useEffect(() => {
    const loadSettings = () => setSettings(getSiteSettings());
    loadSettings();
    window.addEventListener(DATA_CHANGED_EVENT, loadSettings);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, loadSettings);
  }, []);

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(settings.whatsappMessage)}`;

  return (
    <footer className="bg-[#080808] text-white border-t border-white/10 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-8 lg:grid-cols-4">
        <div className="space-y-3">
          <p className="text-xl font-bold tracking-[0.3em]">{settings.siteName}</p>
          <p className="text-sm text-white/60 max-w-sm">{settings.tagline}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">Quick Links</p>
          <div className="space-y-2 text-sm text-white/70">
            <Link href="/" className="block hover:text-white">Home</Link>
            <Link href="/products" className="block hover:text-white">Shop</Link>
            <Link href="/products" className="block hover:text-white">Categories</Link>
            <Link href="/about" className="block hover:text-white">About</Link>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">Need help?</p>
            <p className="text-sm text-white/70">{settings.footerMiddleText}</p>
          </div>
          <Link href={whatsappUrl} target="_blank" rel="noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-black hover:bg-[#1ebe5b] transition">
            {settings.footerWhatsAppButtonLabel}
          </Link>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">Contact</p>
            <p className="text-sm text-white/70">{settings.footerContactEmail}</p>
            <p className="text-sm text-white/70">{settings.footerContactPhone}</p>
            <p className="text-sm text-white/70">{settings.footerContactLocation}</p>
          </div>
          <div className="text-sm text-white/70 space-y-2">
            <p>{settings.footerDeveloperText}</p>
            <Link href={settings.footerDeveloperLink} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white underline">
              {settings.footerDeveloperLinkLabel}
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">Updated: {settings.footerUpdatedDate}</div>
    </footer>
  );
}
