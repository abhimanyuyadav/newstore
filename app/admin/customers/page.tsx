"use client";
import { useMemo } from "react";
import { getOrders } from "@/lib/data";
import { Users, Mail, Smartphone } from "lucide-react";

export default function AdminCustomersPage() {
  const orders = getOrders();
  const customers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; email: string; orders: number; total: number }>();
    orders.forEach(order => {
      const key = order.customer.phone || order.customer.email;
      if (!map.has(key)) {
        map.set(key, { name: order.customer.name, phone: order.customer.phone, email: order.customer.email, orders: 0, total: 0 });
      }
      const customer = map.get(key)!;
      customer.orders += 1;
      customer.total += order.total;
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [orders]);

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-red-400">Customers</p>
            <h1 className="text-3xl font-black mt-3">Customer Insights</h1>
            <p className="text-sm text-white/70 mt-2">View your customer list and total spend.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {customers.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">No customers found.</div>
          ) : customers.map(customer => (
            <div key={customer.phone || customer.email} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-white/50">{customer.name}</p>
                  <p className="text-xs text-white/50 mt-1"><Mail className="inline-block mr-2" />{customer.email}</p>
                  <p className="text-xs text-white/50"><Smartphone className="inline-block mr-2" />{customer.phone}</p>
                </div>
                <div className="grid gap-2 text-right text-sm">
                  <span className="font-semibold">Orders: {customer.orders}</span>
                  <span className="font-semibold">Total: NPR {customer.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
