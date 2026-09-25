"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { DATA_CHANGED_EVENT, defaultSiteSettings, getProducts, getSiteSettings, getCategories } from "@/lib/data";
import type { Product, Category } from "@/lib/types";

export default function HomePage() {
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [heroError, setHeroError] = useState(false);
  useEffect(() => {
    const load = () => { setSettings(getSiteSettings()); setCategories(getCategories()); setProducts(getProducts()); setHeroError(false); };
    load(); window.addEventListener(DATA_CHANGED_EVENT, load);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, load);
  }, []);
  const collections: Record<string, { enabled: boolean; label: string; title: string; items: Product[] }> = {
    products: { enabled: settings.sectionProductsEnabled, label: settings.sectionProductsLabel, title: settings.sectionProductsTitle, items: products },
    newArrivals: { enabled: settings.sectionNewArrivalsEnabled, label: settings.sectionNewArrivalsLabel, title: settings.sectionNewArrivalsTitle, items: products.filter(p => p.newArrival) },
    bestSellers: { enabled: settings.sectionBestSellersEnabled, label: settings.sectionBestSellersLabel, title: settings.sectionBestSellersTitle, items: products.filter(p => p.bestSeller) },
    trending: { enabled: settings.sectionTrendingEnabled, label: settings.sectionTrendingLabel, title: settings.sectionTrendingTitle, items: products.filter(p => p.trending) },
    featured: { enabled: settings.sectionFeaturedEnabled, label: settings.sectionFeaturedLabel, title: settings.sectionFeaturedTitle, items: products.filter(p => p.featured) },
    sale: { enabled: settings.sectionSaleEnabled, label: settings.sectionSaleLabel, title: settings.sectionSaleTitle, items: products.filter(p => p.discountEnabled) },
  };
  const order = settings.sectionOrder?.length ? settings.sectionOrder : defaultSiteSettings.sectionOrder;
  return <div className="storefront"><Navbar /><main id="main-content" className="store-shell">
    <section className="editorial-hero"><div className="hero-copy">
      <p className="eyebrow"><span className="edition-line" />{settings.heroTopLabel}</p>
      <h1>{settings.heroTitle}{settings.heroHighlight && <><br /><em>{settings.heroHighlight}</em></>}</h1>
      <p className="hero-description">{settings.heroSubtitle}</p>
      <Link href="/products" className="store-button">{settings.heroButtonLabel}<ArrowUpRight width={18} height={18} /></Link>
      <Link href="#collections" className="text-link hero-secondary">{settings.heroExploreButtonLabel}<ArrowRight width={16} height={16} /></Link>
      <div className="hero-footnote"><span>THE EVERYDAY EDIT</span><span>01 / {settings.siteName}</span></div>
    </div><div className="hero-photo">{!heroError ? <img src={settings.heroImage || defaultSiteSettings.heroImage} alt="The latest fashion edit" fetchPriority="high" onError={() => setHeroError(true)} /> : <div className="hero-image-fallback">{settings.siteName}</div>}<span className="photo-note">A little expression. Every day.</span></div></section>
    <div className="editorial-intro"><span>YOUR STYLE, YOUR WAY.</span><p>Everyday essentials. A fresh perspective.</p><Link href="/about" className="text-link">Meet {settings.siteName}<ArrowUpRight width={16} height={16} /></Link></div>
    <div id="collections">{order.map(key => {
      if (key === "shopByCategory") return categories.length > 0 && <section key={key} id="categories" className="store-section"><div className="section-heading"><div><p className="eyebrow">{settings.sectionShopByCategoryLabel}</p><h2>{settings.sectionShopByCategoryTitle}</h2></div><Link href="/products" className="text-link">Explore all<ArrowUpRight width={16} height={16} /></Link></div><div className="category-editorial-grid">{categories.map((cat, i) => <Link key={cat.id} href={`/products?cat=${encodeURIComponent(cat.id)}`} className="category-editorial"><div className="category-photo"><span className="category-monogram" aria-hidden="true">{cat.name.charAt(0)}</span>{cat.image ? <img src={cat.image} alt={cat.name} loading="lazy" onError={e => { e.currentTarget.style.visibility = "hidden"; }} /> : null}{!cat.enabled && <span className="product-badge">Coming soon</span>}</div><div className="category-caption"><span><small>{String(i + 1).padStart(2, "0")}</small>{cat.name}</span><ArrowUpRight width={18} height={18} /></div></Link>)}</div></section>;
      if (key === "specialOffer") return settings.sectionSpecialOfferEnabled && <section key={key} className="editorial-offer"><p className="eyebrow">{settings.sectionSpecialOfferLabel}</p><h2>{settings.sectionSpecialOfferTitle}</h2><Link href="/products?collection=sale" className="store-button">{settings.sectionSpecialOfferButtonLabel}<ArrowUpRight width={18} height={18} /></Link></section>;
      const section = collections[key];
      if (!section?.enabled || !section.items.length) return null;
      return <section key={key} className="store-section"><div className="section-heading"><div><p className="eyebrow">{section.label}</p><h2>{section.title}</h2></div><Link href={key === "products" ? "/products" : `/products?collection=${key}`} className="text-link">Shop the edit<ArrowUpRight width={16} height={16} /></Link></div><div className="store-product-grid">{section.items.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}</div></section>;
    })}</div>
    <section className="brand-statement"><p className="eyebrow">MAKE IT YOUR OWN</p><h2>{settings.tagline}</h2><Link href="/products" className="text-link">Find your next favourite<ArrowUpRight width={18} height={18} /></Link></section>
  </main><Footer /></div>;
}
