"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { saveLastOrder } from "@/lib/data";
import type { Order } from "@/lib/types";
export default function PaymentSuccess() {
  const { dispatch } = useCart();
  const [order,setOrder] = useState<Order|null>(null);
  const [error,setError] = useState("");
  const [attempt,setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const orderId = new URLSearchParams(window.location.search).get("orderId");
    if (!orderId) { setError("No payment reference was provided."); return; }
    setError("");
    fetch("/api/esewa/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId})})
      .then(async r => { const value = await r.json(); if (!r.ok) throw new Error(value.error || "Unable to verify payment"); return value; })
      .then(value => { if (!cancelled) { setOrder(value); saveLastOrder(value); dispatch({type:"CLEAR"}); } })
      .catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  },[dispatch,attempt]);
  return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
    <h1 className="text-2xl font-bold mb-4">{order ? "Payment confirmed" : error ? "Payment not confirmed" : "Verifying payment…"}</h1>
    {error && <><p role="alert" className="text-red-600 mb-4">{error}</p><button className="underline mb-4" onClick={() => setAttempt(n=>n+1)}>Retry verification</button></>}
    {order && <p className="mb-5">Order {order.id}<br/>Paid: Rs {order.total.toLocaleString()}</p>}
    <Link href="/track-order" className="block rounded-xl bg-black text-white p-3 mb-3">Track my order</Link><Link href="/cart">Return to cart</Link>
  </div></div>;
}
