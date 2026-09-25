"use client";
import { useEffect, useState } from "react";
import { initializeData, refreshSharedData } from "@/lib/data";
export default function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready,setReady] = useState(false);
  const [error,setError] = useState("");
  useEffect(() => {
    let active = true;
    let initialized = false;
    let refreshing = false;
    const refresh = async () => {
      if (!initialized || refreshing || document.visibilityState === "hidden") return;
      refreshing = true;
      try { await refreshSharedData(); } catch (e) { if (active) setError(e instanceof Error ? e.message : "Unable to refresh catalog"); }
      finally { refreshing = false; }
    };
    const onStorage = (event: StorageEvent) => { if (event.key === "9teen-catalog-updated") void refresh(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("storage", onStorage);
    const onError = (event: Event) => setError((event as CustomEvent<string>).detail);
    window.addEventListener("9teen-save-error",onError);
    initializeData().catch(e => { if (active) setError(e.message); }).finally(() => { initialized = true; if (active) setReady(true); });
    return () => { active = false; window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); window.removeEventListener("storage", onStorage); window.removeEventListener("9teen-save-error",onError); };
  },[]);
  if (!ready) return <div className="min-h-screen grid place-items-center" role="status">Loading store…</div>;
  return <>{error && <div role="alert" className="bg-red-50 text-red-800 p-4 text-center relative z-50">{error} <button className="underline ml-3" onClick={() => window.location.reload()}>Reload</button><button className="ml-3" aria-label="Dismiss error" onClick={()=>setError("")}>×</button></div>}{children}</>;
}
