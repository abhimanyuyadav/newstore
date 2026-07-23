"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getWishlist, getProducts, toggleWishlist } from "@/lib/data";
import type { Product } from "@/lib/types";
import { Heart, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = () => {
      setWishlistIds(getWishlist());
      setProducts(getProducts());
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const wishlistProducts = products.filter(product => wishlistIds.includes(product.id));
  const removeItem = (productId: string) => setWishlistIds(toggleWishlist(productId));

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">Wishlist</h1>
            <p className="text-gray-600 mt-2">Save items you love and come back later to purchase them.</p>
          </div>
          <div className="text-sm text-gray-500">{wishlistProducts.length} item{wishlistProducts.length === 1 ? "" : "s"}</div>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-12 text-center">
            <Heart className="mx-auto mb-4 w-12 h-12 text-red-500" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Add products from the shop to save them here.</p>
            <Link href="/products" className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-900 transition">Browse Products</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {wishlistProducts.map(product => (
              <div key={product.id} className="rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="relative h-56 overflow-hidden rounded-t-3xl bg-gray-100">
                  <img src={product.image} alt={product.name} className="object-cover w-full h-full" onError={event => { (event.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23717171' font-size='24'%3ENo image%3C/text%3E%3C/svg%3E"; }} />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">Rs {product.price.toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeItem(product.id)} className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/product/${product.id}`} className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 text-center">View</Link>
                    <Link href="/cart" className="flex-1 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white text-center hover:bg-gray-900">Go to Cart</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
