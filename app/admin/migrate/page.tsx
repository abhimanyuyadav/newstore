"use client";
import React, { useState } from 'react';
import { postProducts, postOrders, postUsers } from '@/utils/api/admin';

export default function MigratePage() {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const append = (s: string) => setLog(l => [s, ...l]);

  const run = async () => {
    setRunning(true);
    try {
      // products
      try {
        const rawProducts = localStorage.getItem('9teen_products');
        const products = rawProducts ? JSON.parse(rawProducts) : [];
        if (products.length) {
          const res = await postProducts(products);
          if (res?.error) append(`Products error: ${res.error}`);
          else append(`Products migrated: ${res.inserted ?? JSON.stringify(res)}`);
        } else append('No products found in localStorage');
      } catch (e) { append('Products error: ' + String(e)); }

      // orders
      try {
        const rawOrders = localStorage.getItem('9teen_orders');
        const orders = rawOrders ? JSON.parse(rawOrders) : [];
        if (orders.length) {
          const res = await postOrders(orders);
          if (res?.error) append(`Orders error: ${res.error}`);
          else append(`Orders migrated: ${res.inserted ?? JSON.stringify(res)}`);
        } else append('No orders found in localStorage');
      } catch (e) { append('Orders error: ' + String(e)); }

      // users
      try {
        const rawUsers = localStorage.getItem('9teen_user_accounts');
        const users = rawUsers ? JSON.parse(rawUsers) : [];
        if (users.length) {
          const payload = users.map((u:any) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, address: u.address, city: u.city }));
          const res = await postUsers(payload);
          if (res?.error) append(`Users error: ${res.error}`);
          else append(`Users migrated: ${res.inserted ?? JSON.stringify(res)}`);
        } else append('No users found in localStorage');
      } catch (e) { append('Users error: ' + String(e)); }

      append('Migration finished');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Migrate localStorage → Supabase</h1>
      <p className="mb-4">Run this from the browser where your admin/local data exists. It will POST products, orders, and users to the server API.</p>
      <div className="flex gap-3">
        <button onClick={run} disabled={running} className="rounded bg-blue-600 px-4 py-2 text-white">{running ? 'Running…' : 'Run Migration'}</button>
      </div>
      <div className="mt-6">
        <h2 className="font-semibold">Log</h2>
        <div className="mt-2 max-h-64 overflow-auto p-2 bg-black/10 rounded">{log.map((l, idx) => <div key={idx} className="text-sm">{l}</div>)}</div>
      </div>
    </div>
  );
}
