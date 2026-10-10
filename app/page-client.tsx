"use client";
import { usePublicCatalog } from "@/components/DataProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "@/components/StoreImage";
import { ArrowUpRight, ArrowRight, Truck, Shield, ShoppingBag, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { DATA_CHANGED_EVENT, defaultSiteSettings, getProducts, getSiteSettings, getCategories } from "@/lib/data";
import type { Product, Category } from "@/lib/types";

export default function HomePage() {
  const { settings, categories, products } = usePublicCatalog();
  const kurti = products.find(product => /\bkurtis?\b/i.test(product.name) && product.inStock && categories.find(category => category.id === product.category)?.enabled !== false);
  const [heroError, setHeroError] = useState(false);
  useEffect(() => setHeroError(false), [settings.heroImage]);
  const collections: Record<string, { enabled: boolean; label: string; title: string; items: Product[] }> = {
    products: { enabled: settings.sectionProductsEnabled, label: settings.sectionProductsLabel, title: settings.sectionProductsTitle, items: products },
    newArrivals: { enabled: settings.sectionNewArrivalsEnabled, label: settings.sectionNewArrivalsLabel, title: settings.sectionNewArrivalsTitle, items: products.filter(p => p.newArrival) },
    bestSellers: { enabled: settings.sectionBestSellersEnabled, label: settings.sectionBestSellersLabel, title: settings.sectionBestSellersTitle, items: products.filter(p => p.bestSeller) },
    trending: { enabled: settings.sectionTrendingEnabled, label: settings.sectionTrendingLabel, title: settings.sectionTrendingTitle, items: products.filter(p => p.trending) },
    featured: { enabled: settings.sectionFeaturedEnabled, label: settings.sectionFeaturedLabel, title: settings.sectionFeaturedTitle, items: products.filter(p => p.featured) },
    sale: { enabled: settings.sectionSaleEnabled, label: settings.sectionSaleLabel, title: settings.sectionSaleTitle, items: products.filter(p => p.discountEnabled) },
  };
  const heroSource = !settings.heroImage || settings.heroImage === defaultSiteSettings.heroImage ? "/images/campaign/warm-hero.png" : settings.heroImage;
  const campaignBanners = <section className="campaign-banners" aria-label="Collection highlights"><article className="campaign-banner"><Image src="/images/campaign/warm-bag.png" alt="Tan handbag campaign still life" fill sizes="(max-width:640px) 100vw, 50vw"/><div><p className="eyebrow">THE EVERYDAY EDIT</p><h2>Considered style.<br/>Every day.</h2><p>Discover your next favourite.</p><Link href="/products" className="store-button">Shop Now</Link></div></article><article className="campaign-banner"><Image src="/images/campaign/warm-sunglasses.png" alt="Sunglasses campaign still life" fill sizes="(max-width:640px) 100vw, 50vw"/><div><p className="eyebrow">NEW ARRIVALS</p><h2>Discover The<br/>Latest Trends</h2><Link href="/products?collection=newArrivals" className="store-button">Explore Now</Link></div></article></section>;
  const order = settings.sectionOrder?.length ? settings.sectionOrder : defaultSiteSettings.sectionOrder;
  return <div className="storefront"><Navbar /><main id="main-content" className="store-shell">
    <section className="editorial-hero"><div className="hero-copy">
      <p className="eyebrow"><span className="edition-line" />{settings.heroTopLabel}</p>
      <h1>{settings.heroTitle === defaultSiteSettings.heroTitle ? <>Elevate Your<br />Everyday Style</> : <>{settings.heroTitle}{settings.heroHighlight && <><br /><em>{settings.heroHighlight}</em></>}</>}</h1>
      <p className="hero-description">{settings.heroSubtitle === defaultSiteSettings.heroSubtitle ? "Discover everyday pieces chosen for comfort, style and a little self-expression." : settings.heroSubtitle}</p>
      <div className="hero-actions"><Link href="/products" className="store-button">{settings.heroButtonLabel}<ArrowUpRight width={18} height={18} /></Link>
      <Link href="/lookbook" className="text-link hero-secondary">View Collection<ArrowRight width={16} height={16} /></Link></div>
      <div className="hero-footnote"><span>THE EVERYDAY EDIT</span><span>01 / {settings.siteName}</span></div>
    </div><div className="hero-photo">{!heroError ? <Image src={heroSource} alt="Neutral fashion collection in a sunlit interior" fill priority sizes="(max-width: 540px) calc(100vw - 32px), (max-width: 760px) calc(100vw - 40px), (max-width: 1050px) calc(100vw - 52px), (max-width: 1440px) calc(100vw - 96px), 1344px" onError={() => setHeroError(true)} /> : <div className="hero-image-fallback">{settings.siteName}</div>}<span className="photo-note">A little expression. Every day.</span></div><section className="store-benefits" aria-label="Shopping services">{[{Icon:ShoppingBag,title:"Find your fit",text:"Sizes for your everyday"},{Icon:Truck,title:"Order tracking",text:"Follow your delivery"},{Icon:Shield,title:"Your own account",text:"Keep your orders together"},{Icon:MessageCircle,title:"Here to help",text:"Chat with our team"}].map(({Icon,title,text})=><div key={title}><span><Icon width={20} height={20}/></span><div><h2>{title}</h2><p>{text}</p></div></div>)}</section></section>

    <div id="collections">{!order.includes("shopByCategory") && campaignBanners}{order.map(key => {
      if (key === "shopByCategory") return categories.length > 0 && <div key={key}><section id="categories" className="store-section"><div className="section-heading"><div><p className="eyebrow">{settings.sectionShopByCategoryLabel}</p><h2>{settings.sectionShopByCategoryTitle}</h2></div><Link href="/products" className="text-link">Explore all<ArrowUpRight width={16} height={16} /></Link></div><div className="category-editorial-grid">{categories.map((cat, i) => <Link key={cat.id} href={`/products?cat=${encodeURIComponent(cat.id)}`} className="category-editorial"><div className="category-photo"><span className="category-monogram" aria-hidden="true">{cat.name.charAt(0)}</span>{cat.image ? <Image src={cat.image} alt={cat.name} fill sizes="110px" onError={e => { e.currentTarget.style.visibility = "hidden"; }} /> : null}{!cat.enabled && <span className="product-badge">Coming soon</span>}</div><div className="category-caption"><span><small>{String(i + 1).padStart(2, "0")}</small>{cat.name}</span><ArrowUpRight width={18} height={18} /></div><p className="category-count">{products.filter(p=>p.category===cat.id).length} item{products.filter(p=>p.category===cat.id).length===1 ? "" : "s"}</p></Link>)}</div></section>{campaignBanners}</div>;
      if (key === "specialOffer") return settings.sectionSpecialOfferEnabled && products.some(p => p.discountEnabled && p.inStock && p.originalPrice && p.originalPrice > p.price && categories.find(c => c.id === p.category)?.enabled !== false) && <section key={key} className="editorial-offer"><p className="eyebrow">{settings.sectionSpecialOfferLabel}</p><h2>{settings.sectionSpecialOfferTitle}</h2><Link href="/products?collection=sale" className="store-button">{settings.sectionSpecialOfferButtonLabel}<ArrowUpRight width={18} height={18} /></Link></section>;
      const section = collections[key];
      if (!section?.enabled || !section.items.length) return null;
      return <section key={key} className="store-section"><div className="section-heading"><div><p className="eyebrow">{section.label}</p><h2>{section.title}</h2></div><Link href={key === "products" ? "/products" : `/products?collection=${key}`} className="text-link">Shop the edit<ArrowUpRight width={16} height={16} /></Link></div><div className="store-product-grid">{section.items.slice(0, 5).map(product => <ProductCard key={product.id} product={product} />)}</div></section>;
    })}</div>
    <section className="lookbook-banner"><div><p className="eyebrow">THE {settings.siteName} LOOKBOOK</p><h2>Built for your everyday.</h2><Link href="/lookbook" className="store-button">Explore Lookbook<ArrowRight width={16} height={16}/></Link></div><Image src={heroSource} alt="Explore the lookbook" width={660} height={460} sizes="(max-width: 1320px) 50vw, 660px" onError={e=>{e.currentTarget.style.visibility="hidden";}}/></section>
    <section className="brand-statement"><p className="eyebrow">9TEEN COLLECTION — FASHION STORE IN NEPAL</p><h2>{settings.tagline}</h2><p className="max-w-xl mx-auto text-sm leading-8 text-gray-600 mb-6">9TEEN Collection, also known as 9TEEN, is an online fashion store in Nepal. Shop clothing, browse new arrivals, compare prices in Nepalese rupees, and choose from the sizes available for each style.</p>{kurti && <p className="max-w-xl mx-auto text-sm leading-8 text-gray-600 mb-6">Explore kurtis online in Nepal, including our <Link href={`/product/${encodeURIComponent(kurti.id)}`} className="underline">{kurti.name.trim()}</Link>. Open the product for photos, sizes and current availability.</p>}<Link href="/products" className="text-link">Shop the clothing collection<ArrowUpRight width={18} height={18} /></Link></section>
  </main><Footer /></div>;
}
