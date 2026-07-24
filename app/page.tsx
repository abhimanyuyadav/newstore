"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { DATA_CHANGED_EVENT, defaultSiteSettings, getProducts, getSiteSettings, getCategories } from "@/lib/data";
import type { Product, Category } from "@/lib/types";
import { Truck, RotateCcw, Shield, ShoppingBag, Search } from "lucide-react";

const IMAGE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='hero.png' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23717171' font-size='24'%3ENo image%3C/text%3E%3C/svg%3E";

export default function HomePage() {
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [heroImage, setHeroImage] = useState(defaultSiteSettings.heroImage);
  const [heroError, setHeroError] = useState(false);
  const [loading, setLoading] = useState(true);
  const heroSource = heroError ? IMAGE_PLACEHOLDER : (heroImage || defaultSiteSettings.heroImage);

  useEffect(() => {
    const loadData = () => {
      const siteSettings = getSiteSettings();
      const nextHeroImage = siteSettings.heroImage?.trim() ? siteSettings.heroImage : defaultSiteSettings.heroImage;
      setSettings(siteSettings);
      setCategories(getCategories());
      setProducts(getProducts());
      setHeroImage(nextHeroImage);
      setHeroError(false);
      setLoading(false);
    };

    loadData();

    const handler = () => {
      setLoading(true);
      requestAnimationFrame(() => loadData());
    };

    window.addEventListener(DATA_CHANGED_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(DATA_CHANGED_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const homeProducts = products.slice(0, 4);
  const newArrivals = products.filter(p => p.newArrival).slice(0, 4);
  const featured = products.filter(p => p.featured).slice(0, 4);
  const bestSellers = products.filter(p => p.bestSeller).slice(0, 4);
  const trending = products.filter(p => p.trending).slice(0, 4);
  const sale = products.filter(p => p.discountEnabled).slice(0, 4);

  const skeletonCards = Array.from({ length: 4 }, (_, index) => (
    <div key={`skeleton-${index}`} className="rounded-3xl border border-gray-200 bg-gray-100 p-6 animate-pulse">
      <div className="h-44 rounded-3xl bg-gray-200" />
      <div className="mt-4 h-5 w-3/4 rounded-full bg-gray-200" />
      <div className="mt-2 h-4 w-1/2 rounded-full bg-gray-200" />
    </div>
  ));

  const skeletonCategoryCards = Array.from({ length: 6 }, (_, index) => (
    <div key={`cat-skeleton-${index}`} className="rounded-3xl border border-gray-200 bg-white p-4 animate-pulse">
      <div className="mx-auto mb-3 h-20 w-20 rounded-full bg-gray-200" />
      <div className="h-4 w-16 rounded-full bg-gray-200 mx-auto" />
    </div>
  ));

  const sectionRenderers: Record<string, JSX.Element | null> = {
    shopByCategory: (
      <section className="py-8" key="shopByCategory">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-2">{settings.sectionShopByCategoryLabel}</p>
            <h2 className="text-3xl font-bold">{settings.sectionShopByCategoryTitle}</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-black underline-offset-4 hover:underline">View All</Link>
        </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {loading ? skeletonCategoryCards : categories.map(cat => (
            <Link key={cat.id} href={`/products?cat=${cat.id}`} className="group flex flex-col items-center gap-2 rounded-3xl border border-gray-200 bg-white p-4 text-center transition hover:border-black">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-gray-100 overflow-hidden transition group-hover:border-black">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-2xl">{cat.emoji}</div>
                )}
                {!cat.enabled && <span className="absolute bottom-0 right-0 rounded-full bg-red-500 text-white text-[10px] px-2 py-1">Soon</span>}
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">{cat.name}</span>
            </Link>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {categories.map(category => {
            const categoryProducts = products.filter(product => product.category === category.id);
            const previewProduct = categoryProducts[0];
            return previewProduct ? (
              <ProductCard key={category.id} product={previewProduct} disabled={!category.enabled} />
            ) : (
              <div key={category.id} className="rounded-3xl border border-gray-200 bg-white p-5 text-center text-sm text-gray-500">
                <p className="font-semibold mb-2">{category.name}</p>
                <p>No products yet</p>
              </div>
            );
          })}
        </div>
      </section>
    ),
    products: settings.sectionProductsEnabled ? (
      <section className="py-8" key="products">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-2">{settings.sectionProductsLabel}</p>
            <h2 className="text-3xl font-bold">{settings.sectionProductsTitle}</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-black underline-offset-4 hover:underline">View All Products</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? skeletonCards : homeProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    ) : null,
    newArrivals: settings.sectionNewArrivalsEnabled ? (
      <section className="py-8" key="newArrivals">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-2">{settings.sectionNewArrivalsLabel}</p>
            <h2 className="text-3xl font-bold">{settings.sectionNewArrivalsTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {loading ? skeletonCards : newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    ) : null,
    bestSellers: settings.sectionBestSellersEnabled ? (
      <section className="py-8" key="bestSellers">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-2">{settings.sectionBestSellersLabel}</p>
            <h2 className="text-3xl font-bold">{settings.sectionBestSellersTitle}</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {loading ? skeletonCards.slice(0, 2) : bestSellers.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    ) : null,
    trending: settings.sectionTrendingEnabled ? (
      <section className="py-8" key="trending">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-2">{settings.sectionTrendingLabel}</p>
            <h2 className="text-3xl font-bold">{settings.sectionTrendingTitle}</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {loading ? skeletonCards.slice(0, 2) : trending.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    ) : null,
    featured: settings.sectionFeaturedEnabled ? (
      <section className="py-8" key="featured">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-2">{settings.sectionFeaturedLabel}</p>
            <h2 className="text-3xl font-bold">{settings.sectionFeaturedTitle}</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-black underline-offset-4 hover:underline">Shop Featured</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {loading ? skeletonCards : featured.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    ) : null,
    sale: settings.sectionSaleEnabled ? (
      <section className="py-8" key="sale">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-2">{settings.sectionSaleLabel}</p>
            <h2 className="text-3xl font-bold">{settings.sectionSaleTitle}</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-black underline-offset-4 hover:underline">Shop Sale</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {sale.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    ) : null,
    specialOffer: settings.sectionSpecialOfferEnabled ? (
      <section className="rounded-[2rem] bg-black px-8 py-12 text-white" key="specialOffer">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.4em] text-gray-400 mb-3">{settings.sectionSpecialOfferLabel}</p>
            <h2 className="text-4xl font-black">{settings.sectionSpecialOfferTitle}</h2>
          </div>
          <Link href="/products" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-black">{settings.sectionSpecialOfferButtonLabel}</Link>
        </div>
      </section>
    ) : null,
  };

  const orderedSectionKeys = (settings.sectionOrder?.length ? settings.sectionOrder : defaultSiteSettings.sectionOrder).filter((sectionKey) => sectionKey in sectionRenderers);

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="relative overflow-hidden rounded-[2rem] py-16 bg-black text-white animate-float-in">
          <div className="absolute inset-0">
            <img src={heroSource} alt="Hero" className="object-cover w-full h-full opacity-70" onError={() => setHeroError(true)} />
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
              <div className="space-y-6 animate-fade-up">
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">{settings.heroTopLabel}</span>
                <h1 className="text-5xl md:text-6xl font-black leading-tight">
                  {settings.heroTitle}
                  {settings.heroHighlight ? <><br />{settings.heroHighlight}</> : null}
                </h1>
                <p className="max-w-xl text-white/80 text-base md:text-lg leading-relaxed">{settings.heroSubtitle}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/products" className="inline-flex items-center justify-center rounded-full border border-white bg-white px-8 py-3 text-sm font-semibold text-black transition">{settings.heroButtonLabel}</Link>
                  <Link href="/products" className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white/10 px-8 py-3 text-sm font-semibold text-white transition">{settings.heroExploreButtonLabel}</Link>
                  <Link href="/admin" className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition">Admin Panel</Link>
                </div>
              </div>

              <div className="hidden md:block relative rounded-[2rem] overflow-hidden border border-white/20 bg-white/10 min-h-[420px] animate-fade-up">
                <img src={heroSource} alt="Hero" className="object-cover w-full h-full" onError={() => setHeroError(true)} />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="group relative overflow-hidden rounded-[2rem] bg-black text-white p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-[0.4em] text-white/60">Summer Collection ’24</span>
                <h2 className="text-4xl font-black">Light. Comfortable. Effortless.</h2>
                <p className="max-w-xl text-sm text-white/70">New seasonal styles for bold streetwear looks. Shop the freshest drop while it lasts.</p>
              </div>
              <Link href="/products" className="mt-6 inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black">Explore Now</Link>
            </div>
            <div className="group relative overflow-hidden rounded-[2rem] bg-white border border-gray-200 p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-[0.4em] text-gray-400">Limited edition drop</span>
                <h2 className="text-4xl font-black">Exclusive pieces. Limited stock.</h2>
                <p className="max-w-xl text-sm text-gray-600">Shop select styles before they sell out. Premium looks engineered for next-level streetwear.</p>
              </div>
              <Link href="/products" className="mt-6 inline-flex items-center rounded-full border border-black px-6 py-3 text-sm font-semibold text-black">Shop Limited</Link>
            </div>
          </div>
        </section>

        {orderedSectionKeys.map(sectionKey => sectionRenderers[sectionKey] ?? null)}

        <section className="py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-2">Follow us</p>
              <h2 className="text-2xl font-bold">@9TEEN.OFFICIAL</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {featured.slice(0, 5).map(product => (
              <div key={product.id} className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
                <img src={product.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23717171' font-size='24'%3ENo image%3C/text%3E%3C/svg%3E"} alt={product.name} className="object-cover w-full h-40" />
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
