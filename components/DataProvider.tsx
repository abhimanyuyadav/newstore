"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DATA_CHANGED_EVENT, defaultSiteSettings, getProducts, getCategories, getSiteSettings, getReviews, initializeData, refreshSharedData } from "@/lib/data";
import type { PublicCatalog } from "@/lib/public-catalog";

const CatalogContext = createContext<PublicCatalog>({ products: [], categories: [], settings: defaultSiteSettings, reviews: [] });
export const usePublicCatalog = () => useContext(CatalogContext);
export default function DataProvider({ children, initialCatalog }: { children: React.ReactNode; initialCatalog?: PublicCatalog }) {
  const pathname = usePathname();
  const publicPage = ["/", "/products", "/about", "/lookbook"].includes(pathname) || /^\/product\/[^/]+$/.test(pathname);
  const [catalog, setCatalog] = useState(initialCatalog || { products: [], categories: [], settings: defaultSiteSettings, reviews: [] });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (initialCatalog) setCatalog(initialCatalog); }, [initialCatalog]);
  useEffect(() => {
    let active = true;
    let initialized = false;
    let refreshing = false;
    const load = () => { if (active && initialized) setCatalog({ products: getProducts(), categories: getCategories(), settings: getSiteSettings(), reviews: getReviews().filter(review => review.status === "approved") }); };
    const refresh = async () => {
      if (!initialized || refreshing || document.visibilityState === "hidden") return;
      refreshing = true;
      try { await refreshSharedData(); } catch (e) { if (active) setError(e instanceof Error ? e.message : "Unable to refresh catalog"); }
      finally { refreshing = false; }
    };
    const onStorage = (event: StorageEvent) => { if (event.key === "9teen-catalog-updated") void refresh(); };
    const onError = (event: Event) => setError((event as CustomEvent<string>).detail);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("storage", onStorage);
    window.addEventListener("9teen-save-error", onError);
    window.addEventListener(DATA_CHANGED_EVENT, load);
    initializeData().then(() => { initialized = true; load(); }).catch(e => { if (active) setError(e.message); }).finally(() => { initialized = true; if (active) setReady(true); });
    return () => { active = false; window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); window.removeEventListener("storage", onStorage); window.removeEventListener("9teen-save-error", onError); window.removeEventListener(DATA_CHANGED_EVENT, load); };
  }, []);
  if (!ready && !(publicPage && initialCatalog)) return <div className="min-h-screen grid place-items-center" role="status">Loading store…</div>;
  return <CatalogContext.Provider value={catalog}>{error && <div role="alert" className="bg-red-50 text-red-800 p-4 text-center relative z-50">{error} <button className="underline ml-3" onClick={() => window.location.reload()}>Reload</button><button className="ml-3" aria-label="Dismiss error" onClick={() => setError("")}>×</button></div>}{children}</CatalogContext.Provider>;
}
