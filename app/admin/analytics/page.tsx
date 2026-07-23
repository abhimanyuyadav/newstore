"use client";
import { useMemo } from "react";
import { getOrders, getProducts } from "@/lib/data";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";

export default function AdminAnalyticsPage() {
  const orders = getOrders();
  const products = getProducts();

  const revenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
  const averageOrder = useMemo(() => orders.length ? revenue / orders.length : 0, [orders, revenue]);
  const productSales = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach(order => order.items.forEach(item => map.set(item.id, (map.get(item.id) || 0) + item.quantity)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, sold]) => ({ ...(products.find(p => p.id === id) || { name: id }), sold }));
  }, [orders, products]);

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-red-400">Analytics</p>
            <h1 className="text-3xl font-black mt-3">Sales Insights</h1>
            <p className="text-sm text-white/70 mt-2">Track revenue, average order value, and top products.</p>
          </div>
        </div>

        <div className="grid gap-4 mt-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-red-400" />
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Revenue</p>
            </div>
            <p className="text-3xl font-black">NPR {revenue.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-red-400" />
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Average Order</p>
            </div>
            <p className="text-3xl font-black">NPR {averageOrder.toFixed(0)}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="w-5 h-5 text-red-400" />
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Top Products</p>
            </div>
            <div className="space-y-3">
              {productSales.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between gap-3 text-sm">
                  <p className="font-semibold">{index + 1}. {product.name}</p>
                  <span className="text-white/50">{product.sold} sold</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
