"use client";
import { getOrders } from "@/lib/data";
import { Package, Clock, CheckCircle, ArrowRight } from "lucide-react";

export default function AdminOrdersPage() {
  const orders = getOrders();

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-red-400">Orders</p>
            <h1 className="text-3xl font-black mt-3">Recent Orders</h1>
            <p className="text-sm text-white/70 mt-2">Review customer orders and update statuses.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition">
            <ArrowRight className="w-4 h-4" /> View All
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          {orders.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">No orders yet.</div>
          ) : orders.map(order => (
            <div key={order.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">Order ID</p>
                  <p className="text-xl font-semibold mt-2">{order.id}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"><Package className="w-4 h-4 text-red-400" /> {order.items.length} items</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"><Clock className="w-4 h-4 text-red-400" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">{order.paymentMethod === "esewa" ? "eSewa" : "WhatsApp"}</span>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-[#050505] p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">Customer</p>
                  <p className="mt-2 text-sm">{order.customer.name}</p>
                  <p className="text-sm text-white/50">{order.customer.phone}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-[#050505] p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">Total</p>
                  <p className="mt-2 text-xl font-semibold">NPR {order.total.toLocaleString()}</p>
                  <p className="text-sm text-white/50">{order.paymentStatus}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-[#050505] p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">Message</p>
                  <p className="mt-2 text-sm text-white/70 break-words">{order.whatsappMessage || "No WhatsApp message"}</p>
                </div>
              </div>
              <div className="mt-5 rounded-3xl border border-white/10 bg-[#050505] p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Order Items</p>
                <div className="mt-3 space-y-3">
                  {order.items.map(item => (
                    <div key={`${item.id}-${item.size}-${Object.entries(item.variantSelections || {}).map(([key, value]) => `${key}:${value}`).join("-")}`} className="rounded-2xl bg-white/5 p-3">
                      <p className="text-sm font-semibold">{item.name} ×{item.quantity}</p>
                      <p className="text-xs text-white/50">Size: {item.size}</p>
                      {item.variantSelections && Object.keys(item.variantSelections).length > 0 && (
                        <p className="text-xs text-white/50 mt-1">{Object.entries(item.variantSelections).map(([key, value]) => `${key}: ${value}`).join(" • ")}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
