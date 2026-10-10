"use client";
import { usePublicCatalog } from "@/components/DataProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "@/components/StoreImage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DATA_CHANGED_EVENT, getProducts, getCategories } from "@/lib/data";
import type { Category, Product } from "@/lib/types";
export default function LookbookPage() {
  const { products, categories } = usePublicCatalog();
  const [category,setCategory]=useState("all");
  const visible=products.filter(p=>p.image && (category==="all" || p.category===category));
  return <div className="storefront"><Navbar/><main className="store-shell lookbook-page"><h1>Lookbook</h1><p className="text-sm text-gray-500 mt-2">Fresh perspectives. Your everyday style.</p><div className="lookbook-filters">{[{id:"all",name:"All"},...categories.filter(c=>products.some(p=>p.category===c.id))].map(c=><button key={c.id} aria-pressed={category===c.id} onClick={()=>setCategory(c.id)}>{c.name}</button>)}</div>{visible.length ? <div className="lookbook-grid">{visible.map(p=><Link href={`/product/${encodeURIComponent(p.id)}`} key={p.id} className="lookbook-tile"><Image src={p.image} alt={p.name} fill sizes="(max-width: 760px) 50vw, 33vw" onError={e=>{e.currentTarget.style.visibility="hidden";}}/><span>{p.name}<b>↗</b></span></Link>)}</div> : <p className="py-12 text-gray-500">New looks will appear here when products are added.</p>}</main><Footer/></div>;
}
