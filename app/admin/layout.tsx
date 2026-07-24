"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { isAdminLoggedIn, adminLogout, getSiteSettings, saveAllAdminData } from "@/lib/data";
import { postProducts, postOrders, postUsers } from "@/utils/api/admin";
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Tag, Star, LogOut, Menu, X, Settings, LayoutGrid, Save } from "lucide-react";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/categories", label: "Categories", Icon: LayoutGrid },
  { href: "/admin/customers", label: "Customers", Icon: Users },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/admin/coupons", label: "Coupons", Icon: Tag },
  { href: "/admin/reviews", label: "Reviews", Icon: Star },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const siteSettings = getSiteSettings();
  const [savingAll, setSavingAll] = useState(false);
  const [messages, setMessages] = useState<Array<{id:number; entity:string; status:"success"|"error"; text:string}>>([]);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      if (pathname !== "/admin") {
        router.replace("/admin");
      } else {
        setReady(true);
      }
    } else {
      setReady(true);
    }
  }, [router, pathname]);

  if (!ready) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#070707] text-white flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#070707] border-r border-white/10 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="px-6 py-7 border-b border-white/10">
          <p className="font-black text-white text-2xl" style={{ fontFamily: "var(--font-playfair)" }}>{siteSettings.siteName.slice(0, 1)}<span className="text-red-500">{siteSettings.siteName.slice(1)}</span></p>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 py-5 space-y-2">
          {nav.map(({ href, label, Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${pathname === href ? "bg-red-500/10 text-red-400" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
              <Icon className="w-5 h-5" />{label}
            </Link>
          ))}
        </nav>
        <div className="px-4 pb-6">
          <button onClick={() => { adminLogout(); router.push("/admin"); }} className="flex w-full items-center justify-center gap-2 rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/15 transition">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setOpen(false)} />}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="bg-[#0d0d0d] border-b border-white/10 px-4 h-16 flex items-center gap-3">
          <button onClick={() => setOpen(!open)} className="md:hidden rounded-2xl border border-white/10 p-2 text-white/80 hover:bg-white/5">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="font-semibold text-sm uppercase tracking-[0.2em] text-white/70">{nav.find(n => n.href === pathname)?.label || "Admin"}</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <button onClick={async () => {
                  setSavingAll(true);
                  setMessages([]);
                  const results: Array<{id:number; entity:string; status:"success"|"error"; text:string}> = [];
                  try {
                    saveAllAdminData();
                    results.push({ id: 1, entity: 'all', status: 'success', text: 'All data saved to Supabase' });
                  } catch (err:any) {
                    results.push({ id: 1, entity: 'all', status: 'error', text: err?.message || 'Save failed' });
                  } finally {
                    setSavingAll(false);
                    setMessages(results);
                    setTimeout(() => setMessages([]), 6000);
                  }
                }} className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-400 transition">
                <Save className="w-4 h-4" /> {savingAll ? 'Saving…' : 'Save All'}
              </button>

              {/* Toasts */}
              <div className="absolute right-0 top-12 w-72 z-50">
                {messages.map(m => (
                  <div key={m.id} className={`mb-2 rounded-md p-2 text-xs font-medium ${m.status === 'success' ? 'bg-green-600/90 text-white' : 'bg-red-700/95 text-white'}`}>
                    <div className="truncate"><strong className="uppercase">{m.entity}</strong>: {m.text}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-white/50">View Store: <Link href="/" className="text-red-400 hover:text-red-300">Open</Link></div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
