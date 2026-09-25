"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DATA_CHANGED_EVENT, getProducts, getCategories } from "@/lib/data";
import type { Category, Product } from "@/lib/types";
export default function LookbookPage() {
  const [products,setProducts]=useState<Product[]>([]);
  const [categories,setCategories]=useState<Category[]>([]);
  const [category,setCategory]=useState("all");
  useEffect(()=>{ const load=()=>{setProducts(getProducts());setCategories(getCategories());};load();window.addEventListener(DATA_CHANGED_EVENT,load);return()=>window.removeEventListener(DATA_CHANGED_EVENT,load);},[]);
  const visible=products.filter(p=>p.image && (category==="all" || p.category===category));
  return <div className="storefront"><Navbar/><main className="store-shell lookbook-page"><h1>Lookbook</h1><p className="text-sm text-gray-500 mt-2">Fresh perspectives. Your everyday style.</p><div className="lookbook-filters">{[{id:"all",name:"All"},...categories.filter(c=>products.some(p=>p.category===c.id))].map(c=><button key={c.id} aria-pressed={category===c.id} onClick={()=>setCategory(c.id)}>{c.name}</button>)}</div>{visible.length ? <div className="lookbook-grid">{visible.map(p=><Link href={`/product/${p.id}`} key={p.id} className="lookbook-tile"><img src={p.image} alt={p.name} loading="lazy" onError={e=>{e.currentTarget.style.visibility="hidden";}}/><span>{p.name}<b>↗</b></span></Link>)}</div> : <p className="py-12 text-gray-500">New looks will appear here when products are added.</p>}</main><Footer/></div>;
}
