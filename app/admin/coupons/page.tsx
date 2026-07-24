"use client";
import { useState } from "react";
import { getCoupons, saveCoupons } from "@/lib/data";
import { postProducts, postOrders, postUsers } from "@/utils/api/admin";
import { Tag, Save } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState(getCoupons());
  const [saved, setSaved] = useState(false);

  const updateCoupon = (id: string, key: keyof typeof coupons[number], value: string | number | boolean) => {
    setCoupons(coupons.map(c => c.id === id ? { ...c, [key]: value } : c));
    setSaved(false);
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-red-400">Coupons</p>
            <h1 className="text-3xl font-black mt-3">Coupon Manager</h1>
            <p className="text-sm text-white/70 mt-2">Create and edit discount coupons for your store.</p>
          </div>
          <button onClick={async () => { saveCoupons(coupons); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 transition">
            <Save className="w-4 h-4" /> Save Coupons
          </button>
        </div>
        <div className="grid gap-4 mt-6">
          {coupons.map(coupon => (
            <div key={coupon.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-white/70">
                  Code
                  <input value={coupon.code} onChange={e => updateCoupon(coupon.id, "code", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
                <label className="block text-sm text-white/70">
                  Discount (%)
                  <input type="number" value={coupon.discount} onChange={e => updateCoupon(coupon.id, "discount", Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
              </div>
              <label className="block text-sm text-white/70 mt-4">
                Description
                <input value={coupon.description || ""} onChange={e => updateCoupon(coupon.id, "description", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
              <label className="inline-flex items-center gap-2 mt-4 text-sm text-white/70">
                <input type="checkbox" checked={coupon.active} onChange={e => updateCoupon(coupon.id, "active", e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-[#050505] text-red-400 focus:ring-red-400" />
                Active
              </label>
            </div>
          ))}
        </div>
        {saved && <p className="mt-4 rounded-3xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-200">Coupon settings saved locally.</p>}
      </div>
    </div>
  );
}
