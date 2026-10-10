"use client";
import { usePublicCatalog } from "@/components/DataProvider";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { DATA_CHANGED_EVENT, getProducts, getCategories } from "@/lib/data";
import type { Category, Product } from "@/lib/types";
import { swatchColor } from "@/lib/design";

function ProductsPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState(params.get("cat") || "all");
  const [search, setSearch] = useState(params.get("search") || "");
  const [sort, setSort] = useState("featured");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [price, setPrice] = useState("all");
  const [stock, setStock] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { products, categories } = usePublicCatalog();
  useEffect(() => { setCategory(params.get("cat") || "all"); setSearch(params.get("search") || ""); }, [params]);
  const collection = params.get("collection") || "";
  const sizes = [...new Set(products.flatMap(p => p.sizes))];
  const colors = [...new Set(products.flatMap(p => p.variants?.filter(v => /^(color|colour|shade)$/i.test(v.name)).flatMap(v => v.values) || []))];
  const filtered = useMemo(() => {
    const flags: Record<string,keyof Product> = {newArrivals:"newArrival",bestSellers:"bestSeller",featured:"featured",trending:"trending",sale:"discountEnabled"};
    const results = products.filter(p => (!flags[collection] || p[flags[collection]]) && (category === "all" || p.category === category) && (!search || `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(search.toLowerCase())) && (!size || p.sizes.includes(size)) && (!color || p.variants?.some(v => /^(color|colour|shade)$/i.test(v.name) && v.values.includes(color))) && (!stock || p.inStock && categories.find(c => c.id === p.category)?.enabled !== false) && (price === "all" || price === "under" && p.price < 1000 || price === "middle" && p.price >= 1000 && p.price <= 2000 || price === "over" && p.price > 2000));
    return results.sort((a,b) => sort === "low" ? a.price-b.price : sort === "high" ? b.price-a.price : sort === "new" ? Number(b.newArrival)-Number(a.newArrival) : Number(b.featured)-Number(a.featured));
  },[products,categories,category,search,size,color,stock,price,sort,collection]);
  const clear = () => {setCategory("all");setSearch("");setSize("");setColor("");setStock(false);setPrice("all");if (params.toString()) router.replace("/products", { scroll: false });};
  return <div className="storefront"><Navbar /><main>
    <div className="catalog-header"><div className="store-shell"><h1>{collection ? "The collection" : "Shop clothing in Nepal"}</h1><p>Explore 9TEEN Collection online. Compare prices in NPR, check available sizes and find your next favourite.</p>{collection && <Link href="/products" className="text-link mt-3">View all collections →</Link>}</div></div>
    <div className="store-shell catalog-layout">
      <button className="mobile-filter-toggle" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={()=>setFiltersOpen(!filtersOpen)}>{filtersOpen ? "Hide filters" : "Filter products"}</button>
      <aside id="catalog-filters" className={`catalog-sidebar ${filtersOpen ? "is-open" : ""}`} aria-label="Product filters">
        <fieldset><legend>Categories</legend>{[{id:"all",name:"All products"},...categories].map(c=><label className="filter-check" key={c.id}><input type="radio" name="category" checked={category===c.id} onChange={()=>setCategory(c.id)}/>{c.name}</label>)}</fieldset>
        <fieldset><legend>Size</legend><div className="filter-sizes">{sizes.map(s=><button key={s} aria-pressed={size===s} onClick={()=>setSize(size===s ? "" : s)}>{s}</button>)}</div></fieldset>
        {!!colors.length && <fieldset><legend>Color</legend><div className="filter-sizes">{colors.map(c=><button key={c} aria-label={`Filter color ${c}`} title={c} aria-pressed={color===c} onClick={()=>setColor(color===c ? "" : c)}><span className="color-dot" style={{background:swatchColor(c)}}/></button>)}</div></fieldset>}
        <fieldset><legend>Price range</legend>{[{value:"all",label:"All prices"},{value:"under",label:"Under NPR 1,000"},{value:"middle",label:"NPR 1,000 – 2,000"},{value:"over",label:"Over NPR 2,000"}].map(p=><label className="filter-check" key={p.value}><input type="radio" name="price" checked={price===p.value} onChange={()=>setPrice(p.value)}/>{p.label}</label>)}</fieldset>
        <label className="filter-check"><input type="checkbox" checked={stock} onChange={e=>setStock(e.target.checked)}/>In stock only</label><button className="filter-clear" onClick={clear}>Clear filters</button>
      </aside>
      <section aria-label="Products"><div className="catalog-toolbar"><input aria-label="Search collection" placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)}/><select aria-label="Sort products" value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select><span role="status">{filtered.length} product{filtered.length===1 ? "" : "s"}</span></div>
        {filtered.length ? <div className="store-product-grid catalog-grid">{filtered.map(p=><ProductCard key={p.id} product={p}/>)}</div> : <div className="py-16 text-center"><h2 className="font-bold">No matching products</h2><p className="text-sm text-gray-500 my-3">Try a different size, color, or price range.</p><button className="store-button" onClick={clear}>Clear filters</button></div>}
      </section>
    </div>
  </main><Footer /></div>;
}
export default function ProductsPage() { return <Suspense fallback={<div role="status">Loading collection…</div>}><ProductsPageContent/></Suspense>; }
