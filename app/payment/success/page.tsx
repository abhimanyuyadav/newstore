"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { CheckCircle, Package } from "lucide-react";

export default function PaymentSuccess() {
  const { dispatch } = useCart();
  const [order, setOrder] = useState<any>(null);
  useEffect(() => {
    const last = localStorage.getItem("9teen_last_order");
    if (last) {
      const o = JSON.parse(last);
      o.paymentStatus = "paid"; o.status = "processing";
      setOrder(o);
      const orders = JSON.parse(localStorage.getItem("9teen_orders") || "[]");
      const idx = orders.findIndex((x: any) => x.id === o.id);
      if (idx !== -1) { orders[idx] = o; localStorage.setItem("9teen_orders", JSON.stringify(orders)); }
    }
    dispatch({ type: "CLEAR" });
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-500" /></div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 text-sm mb-5">Your 9TEEN order has been confirmed.</p>
        {order && <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <p className="text-xs text-gray-400 mb-1">Order ID</p>
          <p className="font-mono font-bold text-sm">{order.id}</p>
          <p className="text-xs text-gray-400 mt-2 mb-1">Total Paid</p>
          <p className="font-bold">Rs {order.total?.toLocaleString()}</p>
        </div>}
        <div className="flex flex-col gap-2">
          <Link href="/track-order" className="bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2"><Package className="w-4 h-4" />Track My Order</Link>
          <Link href="/" className="bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
