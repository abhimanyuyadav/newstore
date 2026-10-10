"use client";
import { usePublicCatalog } from "@/components/DataProvider";
import Image from "@/components/StoreImage";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, ArrowUpRight } from "lucide-react";
import { DATA_CHANGED_EVENT, getCategories, getWishlist, toggleWishlist } from "@/lib/data";
import { swatchColor } from "@/lib/design";
import { Product } from "@/lib/types";
export default function ProductCard({ product, disabled }: { product: Product; disabled?: boolean }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => { const load = () => setWishlist(getWishlist()); load(); window.addEventListener(DATA_CHANGED_EVENT, load); return () => window.removeEventListener(DATA_CHANGED_EVENT, load); }, []);
  useEffect(() => setFailed(false), [product.image]);
  const category = usePublicCatalog().categories.find(c => c.id === product.category);
  const unavailable = disabled || category?.enabled === false;
  const colors = product.variants?.find(v => /^(color|colour|shade)$/i.test(v.name))?.values || [];
  const saved = wishlist.includes(product.id);
  return <article className="editorial-product">
    <div className="product-photo">
      <Link href={`/product/${encodeURIComponent(product.id)}`} aria-label={`View ${product.name}`} className="product-image-link">
        {product.image && !failed ? <Image src={product.image} alt={product.name} fill sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw" className="product-image" onError={() => setFailed(true)} /> : <span className="product-image-placeholder">{product.name}</span>}
      </Link>
      {(unavailable || !product.inStock || product.newArrival || product.discountEnabled) && <span className="product-badge">{unavailable ? "Coming soon" : !product.inStock ? "Sold out" : product.discountEnabled ? "Sale" : "New arrival"}</span>}
      <button type="button" className={`product-heart ${saved ? "is-saved" : ""}`} aria-label={`${saved ? "Remove" : "Save"} ${product.name} ${saved ? "from" : "to"} wishlist`} aria-pressed={saved} onClick={() => setWishlist(toggleWishlist(product.id))}><Heart width={18} height={18} fill={saved ? "currentColor" : "none"} /></button>
      <Link href={`/product/${encodeURIComponent(product.id)}`} className="product-shop-link">{unavailable || !product.inStock ? "View details" : "Choose options"}<ArrowUpRight width={16} height={16} /></Link>
    </div>
    <div className="product-caption"><p className="product-category">{category?.name || product.category}</p><div className="product-name-price"><Link href={`/product/${encodeURIComponent(product.id)}`}>{product.name}</Link><span>{product.price === 0 && (unavailable || !product.inStock) ? "Price coming soon" : `NPR ${product.price.toLocaleString()}`}</span></div>{product.discountEnabled && product.originalPrice && product.originalPrice > product.price && <s className="product-original">NPR {product.originalPrice.toLocaleString()}</s>}<p className="product-sizes">{product.sizes?.join(" / ") || "One size"}</p><div className="product-swatches">{colors.slice(0,6).map(color => <span key={color} className="color-dot" style={{background:swatchColor(color)}} title={color} aria-label={color}/>)}<Link href={`/product/${encodeURIComponent(product.id)}`} className="product-card-more" aria-label={`${unavailable || !product.inStock ? "View details for" : "Choose options for"} ${product.name}`}>+</Link></div></div>
  </article>;
}
