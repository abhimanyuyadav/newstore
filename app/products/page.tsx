"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { DATA_CHANGED_EVENT, getProducts, getCategories } from "@/lib/data";
import type { Category, Product } from "@/lib/types";
import { Search, X } from "lucide-react";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [selectedCat, setSelectedCat] = useState(searchParams.get("cat") || "all");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("featured");
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadData = () => {
      setProducts(getProducts());
      setCategories(getCategories());
    };

    loadData();
    setSelectedCat(searchParams.get("cat") || "all");
    setSearch(searchParams.get("search") || "");

    const handleDataChange = () => loadData();
    window.addEventListener(DATA_CHANGED_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, handleDataChange);
  }, [searchParams]);
  const collection = searchParams.get("collection") || "";
  const selectedCategory = selectedCat !== "all" ? categories.find(c => c.id === selectedCat) : undefined;
  const filtered = useMemo(() => {
    let p = [...products];
    const flags: Record<string, keyof Product> = { newArrivals: "newArrival", bestSellers: "bestSeller", trending: "trending", featured: "featured", sale: "discountEnabled" };
    if (flags[collection]) p = p.filter(product => Boolean(product[flags[collection]]));

    if (selectedCat !== "all") {
      p = p.filter(x => x.category === selectedCat);
    }

    if (search) {
      const q = search.toLowerCase();
      p = p.filter(x => [x.name, x.description, x.category].some(value => value.toLowerCase().includes(q)));
    }

    if (showInStockOnly) {
      p = p.filter(x => x.inStock);
    }

    if (showFeaturedOnly) {
      p = p.filter(x => x.featured);
    }

    if (sortBy === "price-low") {
      p.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      p.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      p.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "newest") {
      p.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
    } else {
      p.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return p;
  }, [products, selectedCat, search, sortBy, showInStockOnly, showFeaturedOnly, collection]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="catalog-header">
        <div className="store-shell">
          <h1 >{collection ? "The curated edit" : "The collection"}</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} item{filtered.length === 1 ? "" : "s"}</p>
        </div>
      </div>
      <div className="store-shell py-6">
        <div className="flex flex-col gap-3 mb-5 lg:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} aria-label="Search collection" placeholder="Search products..."
              className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
            {search && <button aria-label="Clear search" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
          </div>
          <select aria-label="Sort products" value={sortBy} onChange={e => setSortBy(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black">
            <option value="featured">Sort: Featured</option>
            <option value="newest">Sort: Newest</option>
            <option value="price-low">Sort: Price Low to High</option>
            <option value="price-high">Sort: Price High to Low</option>
            <option value="name">Sort: Name A-Z</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setSelectedCat("all")} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedCat === "all" ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-black"}`}>All</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setSelectedCat(c.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedCat === c.id ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-black"}`}>
              {c.image ? <img src={c.image} alt="" onError={e => { e.currentTarget.style.display = "none"; }} className="w-6 h-6 rounded-full object-cover" /> : <span>{c.emoji}</span>} {c.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button type="button" onClick={() => setShowInStockOnly(prev => !prev)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${showInStockOnly ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-black"}`}>
            In stock only
          </button>
          <button type="button" onClick={() => setShowFeaturedOnly(prev => !prev)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${showFeaturedOnly ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-black"}`}>
            Featured only
          </button>
        </div>
        {selectedCategory && !selectedCategory.enabled && (
          <div className="rounded-3xl border border-orange-300 bg-orange-50 p-6 text-orange-900 mb-6">
            <h2 className="text-xl font-bold">{selectedCategory.name} Coming Soon</h2>
            <p className="mt-2 text-sm text-orange-800">This category is currently unavailable. Browse other collections while we prepare the latest items.</p>
          </div>
        )}
        {filtered.length === 0
          ? <div className="text-center py-16 text-gray-400"><p className="text-lg font-semibold">No products found</p></div>
          : <div className="store-product-grid">{filtered.map(p => <ProductCard key={p.id} product={p} disabled={categories.find(cat => cat.id === p.category)?.enabled === false} />)}</div>
        }
      </div>
      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa]" />}>
      <ProductsPageContent />
    </Suspense>
  );
}
