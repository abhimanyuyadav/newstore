"use client";
import { useMemo } from "react";
import type { Product } from "@/lib/types";
import { getOrders, getProducts } from "@/lib/data";
import { ChartBar, ShoppingBag, Users, Package, ArrowUpRight, Clock, ClipboardList } from "lucide-react";

export default function AdminDashboardPage() {
  const orders = getOrders();
  const products = getProducts();

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
  const totalCustomers = useMemo(() => new Set(orders.map(order => order.customer.phone || order.customer.email)).size, [orders]);
  const totalOrders = orders.length;
  const totalProducts = products.length;

  const salesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach(order => order.items.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return;
      map.set(product.category, (map.get(product.category) || 0) + item.quantity);
    }));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [orders, products]);

  const topProducts = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach(order => order.items.forEach(item => counts.set(item.id, (counts.get(item.id) || 0) + item.quantity)));
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, sold]) => {
        const product = products.find(p => p.id === id);
        return product ? { ...product, sold } : null;
      })
      .filter((product): product is (Product & { sold: number }) => product !== null);
  }, [orders, products]);

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="max-w-8xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-red-400">Admin Dashboard</p>
            <h1 className="text-4xl font-black mt-3">Store Overview</h1>
            <p className="text-sm text-white/60 mt-2">Manage products, orders, and WhatsApp messaging from one central panel.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 inline-flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400" /> Today: Jul 11, 2025
          </div>
        </div>

        <div className="grid gap-4 mt-6 xl:grid-cols-4">
          {[
            { label: "Total Revenue", value: `NPR ${totalRevenue.toLocaleString()}`, Icon: ShoppingBag },
            { label: "Total Orders", value: totalOrders.toString(), Icon: Package },
            { label: "Total Customers", value: totalCustomers.toString(), Icon: Users },
            { label: "Total Products", value: totalProducts.toString(), Icon: ClipboardList },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">{label}</p>
                <Icon className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-3xl font-black">{value}</p>
              <p className="text-xs text-white/50 mt-2">+9.4% from yesterday</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 mt-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 xl:col-span-2">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Sales Overview</p>
                <h2 className="text-xl font-bold mt-2">Weekly performance</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-red-300">Live</span>
            </div>
            <div className="space-y-4">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, index) => {
                const amount = 20000 + index * 5000;
                return (
                  <div key={day} className="flex items-center gap-3">
                    <span className="w-12 text-xs text-white/60">{day}</span>
                    <div className="h-3 flex-1 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-red-400" style={{ width: `${40 + index * 8}%` }} />
                    </div>
                    <span className="w-20 text-right text-xs text-white/70">NPR {amount.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Recent Orders</p>
                <h2 className="text-xl font-bold mt-2">Latest sales</h2>
              </div>
              <span className="text-xs text-white/50">View All</span>
            </div>
            <div className="space-y-4">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="rounded-3xl border border-white/5 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold">#{order.id}</span>
                    <span className="text-white/60">NPR {order.total.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/60">
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-red-300">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 mt-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Top Products</p>
                <h2 className="text-xl font-bold mt-2">Best sellers</h2>
              </div>
            </div>
            <div className="space-y-4">
              {topProducts.map(product => (
                <div key={product.id} className="flex items-center gap-4 rounded-3xl border border-white/5 bg-black/20 p-4">
                  <div className="h-14 w-14 overflow-hidden rounded-3xl bg-white/10">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{product.name}</p>
                    <p className="text-xs text-white/50">{product.sold} sold</p>
                  </div>
                  <span className="ml-auto text-sm text-white/60">NPR {product.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Sales by Category</p>
                <h2 className="text-xl font-bold mt-2">Category mix</h2>
              </div>
            </div>
            <div className="space-y-3">
              {salesByCategory.map(([category, qty]) => (
                <div key={category} className="flex items-center gap-3">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="min-w-[80px] text-sm text-white/70 capitalize">{category}</span>
                  <div className="h-3 flex-1 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-red-400" style={{ width: `${Math.min((qty / (salesByCategory[0]?.[1] || 1)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-xs text-white/50">{qty} sold</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
