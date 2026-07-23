"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getOrders } from "@/lib/data";
import { Search, CheckCircle, Package, Truck, Home } from "lucide-react";

const steps = [
  { key: "pending", label: "Order Placed", Icon: CheckCircle },
  { key: "processing", label: "Processing", Icon: Package },
  { key: "shipped", label: "Shipped", Icon: Truck },
  { key: "delivered", label: "Delivered", Icon: Home },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  function search() {
    const orders = getOrders();
    const found = orders.find(o => o.id === orderId.trim());
    if (found) { setOrder(found); setNotFound(false); }
    else { setOrder(null); setNotFound(true); }
  }
  const stepIndex = order ? steps.findIndex(s => s.key === order.status) : -1;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="bg-[#0d0d0d] px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-1">Track Your Order</h1>
          <p className="text-white/40 text-sm">Enter your Order ID to track delivery</p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8">
          <input value={orderId} onChange={e => setOrderId(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Enter Order ID  e.g. 19T-1234567890"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
          <button onClick={search} className="bg-black hover:bg-black text-white px-5 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors">
            <Search className="w-4 h-4" />Track
          </button>
        </div>
        {notFound && <div className="text-center text-gray-400 py-8"><p className="font-semibold">Order not found</p></div>}
        {order && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex justify-between items-start flex-wrap gap-2 mb-6">
              <div><p className="text-xs text-gray-400">Order ID</p><p className="font-mono font-bold text-sm">{order.id}</p></div>
              <div className="text-right"><p className="text-xs text-gray-400">Total</p><p className="font-bold">Rs {order.total?.toLocaleString()}</p></div>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />
              <div className="space-y-5">
                {steps.map((step, i) => {
                  const done = i <= stepIndex;
                  return (
                    <div key={step.key} className="flex items-start gap-3 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${done ? (i === stepIndex ? "bg-[#f97316]" : "bg-green-500") : "bg-gray-100"}`}>
                        <step.Icon className={`w-4 h-4 ${done ? "text-white" : "text-gray-400"}`} />
                      </div>
                      <div className="pt-1">
                        <p className={`font-semibold text-sm ${done ? "text-[#1e293b]" : "text-gray-400"}`}>{step.label}</p>
                        {i === stepIndex && <p className="text-xs text-[#f97316] mt-0.5">Current status</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

