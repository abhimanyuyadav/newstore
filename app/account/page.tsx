"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, getOrders, logoutUser } from "@/lib/data";
import type { UserAccount } from "@/lib/types";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div className="min-h-screen bg-white text-black flex items-center justify-center">Loading account…</div>;
  }

  const orders = getOrders().filter(order => order.customer.email.toLowerCase() === user.email.toLowerCase());

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-400">Account</p>
            <h1 className="text-4xl font-bold mt-2">Welcome, {user.name}</h1>
            <p className="text-gray-700 mt-2">Manage your delivery details and see your order history.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Back to home</Link>
            <button onClick={() => { logoutUser(); router.push("/"); }} className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">Logout</button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-xl font-bold mb-4">Profile</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p><span className="font-semibold text-black">Name:</span> {user.name}</p>
              <p><span className="font-semibold text-black">Email:</span> {user.email}</p>
              <p><span className="font-semibold text-black">Phone:</span> {user.phone}</p>
              <p><span className="font-semibold text-black">City:</span> {user.city}</p>
              <p><span className="font-semibold text-black">Address:</span> {user.address}</p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold mb-4">Order history</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders yet. Your recent purchases will appear here.</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-black">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Status:</span> {order.status}
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-700">
                      <p>Total: NPR {order.total.toLocaleString()}</p>
                      <p>Payment: {order.paymentMethod.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
