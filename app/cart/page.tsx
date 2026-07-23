"use client";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, dispatch, total, count } = useCart();
  if (items.length === 0) return (
    <div className="min-h-screen bg-[#fafafa]"><Navbar />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mb-6">Add some items to get started!</p>
        <Link href="/products" className="bg-black text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-black transition-colors">Browse Products</Link>
      </div><Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Your Cart ({count} items)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => {
              const variantKey = Object.entries(item.variantSelections || {}).map(([key, value]) => `${key}:${value}`).join("-");
              const itemKey = `${item.id}-${item.size}-${variantKey}`;
              const decrease = () => {
                if (item.quantity <= 1) {
                  dispatch({ type: "REMOVE", id: item.id, size: item.size, variantSelections: item.variantSelections });
                } else {
                  dispatch({ type: "UPDATE_QTY", id: item.id, size: item.size, qty: item.quantity - 1, variantSelections: item.variantSelections });
                }
              };
              const increase = () => dispatch({ type: "UPDATE_QTY", id: item.id, size: item.size, qty: item.quantity + 1, variantSelections: item.variantSelections });
              const remove = () => dispatch({ type: "REMOVE", id: item.id, size: item.size, variantSelections: item.variantSelections });
              return (
                <div key={itemKey} className="bg-white rounded-xl p-3 flex gap-3 items-start border border-gray-100">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-50">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight line-clamp-2">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Size: {item.size}</p>
                    {item.variantSelections && Object.keys(item.variantSelections).length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">{Object.entries(item.variantSelections).map(([key, value]) => `${key}: ${value}`).join(" • ")}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1">
                        <button onClick={decrease} className="cursor-pointer"><Minus className="w-3 h-3 text-gray-500" /></button>
                        <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                        <button onClick={increase} className="cursor-pointer"><Plus className="w-3 h-3 text-gray-500" /></button>
                      </div>
                      <p className="font-bold text-sm">Rs {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={remove} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors shrink-0"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
              );
            })}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 h-fit sticky top-16">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>Rs {total.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="text-green-600 font-semibold">FREE</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span>Rs {total.toLocaleString()}</span></div>
            </div>
            <Link href="/checkout" className="mt-4 w-full bg-black hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">Proceed to Checkout <ArrowRight className="w-4 h-4" /></Link>
            <button onClick={() => dispatch({ type: "CLEAR" })} className="mt-2 w-full text-red-400 hover:text-red-600 text-xs font-medium py-2 transition-colors">Clear Cart</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
