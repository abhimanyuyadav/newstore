"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Heart, Star } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { getSiteSettings, buildWhatsappLink, getWishlist, toggleWishlist, getReviews } from "@/lib/data";
import { Product } from "@/lib/types";

const IMAGE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23717171' font-size='24'%3ENo image%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product, disabled }: { product: Product; disabled?: boolean }) {
  const router = useRouter();
  const settings = getSiteSettings();
  const { dispatch } = useCart();
  const [added, setAdded] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>(getWishlist());
  const [imageSrc, setImageSrc] = useState(product.image || IMAGE_PLACEHOLDER);

  const imageUrl = imageSrc || IMAGE_PLACEHOLDER;
  const isDataUrl = imageUrl.startsWith("data:");
  const available = product.inStock && !disabled;
  const defaultSize = product.sizes?.[0] || "One Size";
  const defaultVariants = product.variants?.reduce((acc, variant) => {
    acc[variant.name] = variant.values?.[0] ?? "";
    return acc;
  }, {} as Record<string, string>);

  const addToCart = () => {
    dispatch({
      type: "ADD",
      item: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: defaultSize,
        quantity: 1,
        variantSelections: defaultVariants,
      },
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const inWishlist = wishlistIds.includes(product.id);
  const toggleWishlistItem = () => {
    const next = toggleWishlist(product.id);
    setWishlistIds(next);
  };

  const productReviews = useMemo(() => {
    const reviews = getReviews().filter(review => review.productId === product.id && review.status === "approved");
    const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
    return { count: reviews.length, average };
  }, [product.id]);
  const buyNow = () => {
    if (!available) return;
    addToCart();
    router.push("/checkout");
  };

  const openWhatsapp = () => {
    const message = `Hi, I am interested in ${product.name} for NPR ${product.price.toLocaleString()}. Please share more details.`;
    window.open(buildWhatsappLink(settings.whatsappNumber, message), "_blank");
  };

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-up">
      <div className="relative">
        <Link href={`/product/${product.id}`} className="block relative w-full h-44 bg-gray-100">
          {isDataUrl ? (
            <img src={imageUrl} alt={product.name} className="object-cover w-full h-full" onError={() => setImageSrc(IMAGE_PLACEHOLDER)} />
          ) : (
            <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width:768px) 100vw,33vw" onError={() => setImageSrc(IMAGE_PLACEHOLDER)} />
          )}
        </Link>
        <button type="button" onClick={toggleWishlistItem} className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white">
          <Heart className={`w-5 h-5 ${inWishlist ? "text-red-500" : "text-gray-400"}`} />
        </button>
      </div>
      <div className="p-4">
        <Link href={`/product/${product.id}`} className="block">
          <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
        </Link>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <div className="inline-flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>{productReviews.average ? productReviews.average.toFixed(1) : "New"}</span>
          </div>
          <span>•</span>
          <span>{productReviews.count} review{productReviews.count === 1 ? "" : "s"}</span>
        </div>
        {disabled ? (
          <p className="text-xs text-orange-600 mt-1">Category coming soon</p>
        ) : !product.inStock ? (
          <p className="text-xs text-red-500 mt-1">Out of stock</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">Rs {product.price.toLocaleString()}</p>
        )}

        <div className="mt-4 grid gap-2">
          <button type="button" onClick={addToCart} disabled={!available}
            className={`w-full rounded-2xl px-3 py-2 text-sm font-semibold transition ${available ? "bg-black text-white hover:bg-gray-900" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
            {added ? "Added to cart" : "Add to cart"}
          </button>
          <button type="button" onClick={openWhatsapp} className="w-full rounded-2xl border border-green-500 bg-white px-3 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 transition">
            WhatsApp
          </button>
          <button type="button" onClick={buyNow} disabled={!available}
            className={`w-full rounded-2xl px-3 py-2 text-sm font-semibold transition ${available ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
            Buy with eSewa
          </button>
        </div>
      </div>
    </div>
  );
}
