"use client";
import { usePublicCatalog } from "@/components/DataProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { defaultSiteSettings, getSiteSettings, DATA_CHANGED_EVENT } from "@/lib/data";
export default function AboutPage() {
  const { settings } = usePublicCatalog();
  return <div className="storefront"><Navbar /><main className="store-shell"><section className="brand-statement"><p className="eyebrow">THE STORY OF {settings.siteName}</p><h1 className="text-5xl md:text-7xl tracking-tight my-8">{settings.tagline}</h1><p className="max-w-xl text-sm leading-8 text-gray-600 mb-8">{settings.siteName} Collection brings online clothing shopping to customers in Nepal. Explore our current styles, read product details and compare prices in Nepalese rupees. Each product page shows available sizes and stock information to help you choose your next piece.</p><Link href="/products" className="store-button">Explore the collection<ArrowUpRight width={18} height={18} /></Link></section></main><Footer /></div>;
}
