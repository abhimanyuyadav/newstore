"use client";

import { useState } from "react";
import { getCategories, saveCategories, resetCategories } from "@/lib/data";
import { postProducts, postOrders, postUsers } from "@/utils/api/admin";
import { Check, X, RefreshCcw, Save } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(getCategories());
  const [saved, setSaved] = useState(false);

  const updateCategory = (index: number, key: keyof typeof categories[number], value: string | string[] | boolean) => {
    setCategories(prev => {
      const next = prev.map((item, idx) => idx === index ? { ...item, [key]: value } : item);
      saveCategories(next);
      return next;
    });
    setSaved(false);
  };

  const toggleEnabled = (index: number) => {
    setCategories(prev => {
      const next = prev.map((item, idx) => idx === index ? { ...item, enabled: !item.enabled } : item);
      saveCategories(next);
      return next;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    saveCategories(categories);
    setSaved(true);
    try {
      const rawProducts = localStorage.getItem('9teen_products');
      const products = rawProducts ? JSON.parse(rawProducts) : [];
      if (products.length) await postProducts(products);
    } catch {}
    try {
      const rawOrders = localStorage.getItem('9teen_orders');
      const orders = rawOrders ? JSON.parse(rawOrders) : [];
      if (orders.length) await postOrders(orders);
    } catch {}
    try {
      const rawUsers = localStorage.getItem('9teen_user_accounts');
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      if (users.length) {
        const payload = users.map((u:any) => ({ id: u.id, name: u.name, email: u.email }));
        await postUsers(payload);
      }
    } catch {}
    setTimeout(() => setSaved(false), 2000);
  };

  const addCategory = () => {
    const id = `cat_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const next = [...categories, { id, name: "New Category", emoji: "🔖", enabled: false, subcategories: [], image: "" }];
    saveCategories(next);
    setCategories(next);
    setSaved(false);
  };

  const deleteCategory = (index: number) => {
    if (!confirm('Delete this category?')) return;
    setCategories(prev => {
      const next = prev.filter((_, i) => i !== index);
      saveCategories(next);
      return next;
    });
    setSaved(false);
  };

  const handleReset = () => {
    resetCategories();
    setCategories(getCategories());
    setSaved(false);
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-red-400">Categories</p>
            <h1 className="text-3xl font-black mt-3">Category Manager</h1>
            <p className="text-sm text-white/70 mt-2">Update category names, emojis, and availability for the storefront.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={addCategory} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition">
              Add Category
            </button>
            <button onClick={handleReset} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition">
              <RefreshCcw className="w-4 h-4" /> Restore Defaults
            </button>
            <button onClick={handleSave} className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 transition">
              <Save className="w-4 h-4" /> Save Categories
            </button>
          </div>
        </div>

        <div className="grid gap-5 mt-6">
          {categories.map((category, index) => (
            <div key={category.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">Category ID</p>
                  <p className="mt-2 text-lg font-semibold text-white">{category.id}</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <button onClick={() => toggleEnabled(index)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${category.enabled ? "bg-green-500 text-black" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                    {category.enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />} {category.enabled ? "Enabled" : "Disabled"}
                  </button>
                  <button onClick={() => deleteCategory(index)} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold bg-white/5 hover:bg-white/10">Delete</button>
                </div>
              </div>

              <div className="grid gap-4 mt-6 md:grid-cols-2">
                <label className="block text-sm text-white/70">
                  Category Name
                  <input value={category.name} onChange={e => updateCategory(index, "name", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
                <label className="block text-sm text-white/70">
                  Emoji
                  <input value={category.emoji} onChange={e => updateCategory(index, "emoji", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
              </div>
              <div className="grid gap-4 mt-4 md:grid-cols-2 items-center">
                <label className="block text-sm text-white/70">
                  Image URL
                  <input value={category.image || ""} onChange={e => updateCategory(index, "image", e.target.value)} placeholder="https://... or upload below"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
                <label className="block text-sm text-white/70">
                  Upload image
                  <input type="file" accept="image/*" onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const maxSize = 2 * 1024 * 1024; // 2MB
                    if (file.size > maxSize) {
                      alert('Image too large. Please use an image under 2MB.');
                      return;
                    }
                    const allowed = ['image/png','image/jpeg','image/webp','image/gif'];
                    if (!allowed.includes(file.type)) {
                      alert('Unsupported image type. Use PNG, JPEG, WEBP or GIF.');
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = async () => {
                      const dataUrl = reader.result as string;

                      // 1) Try server-side upload endpoint
                      try {
                        const res = await fetch('/api/uploads/category', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ fileName: file.name, fileData: dataUrl }),
                        });
                        const json = await res.json();
                        if (res.ok && json.publicUrl) {
                          updateCategory(index, 'image', json.publicUrl);
                          return;
                        }
                      } catch (err) {
                        // continue to next option
                      }

                      // 2) Try Supabase client upload (public bucket) as fallback
                      try {
                        const { createClient } = await import('@/utils/supabase/client');
                        const supabase = createClient();
                        const id = `${category.id}-${Date.now()}-${Math.floor(Math.random()*10000)}`;
                        const ext = file.name.split('.').pop() || 'jpg';
                        const path = `categories/${id}.${ext}`;
                        const { error: uploadError } = await supabase.storage.from('category-images').upload(path, file, { upsert: true });
                        if (!uploadError) {
                          const { data } = supabase.storage.from('category-images').getPublicUrl(path);
                          if (data && data.publicUrl) {
                            updateCategory(index, 'image', data.publicUrl);
                            return;
                          }
                        }
                      } catch (err) {
                        // continue to next option
                      }

                      // 3) Fallback to embedding data URL locally
                      updateCategory(index, "image", dataUrl);
                    };
                    reader.readAsDataURL(file);
                  }}
                    className="mt-2 w-full rounded-2xl px-3 py-2 text-white bg-[#050505]" />
                </label>
              </div>
              {category.image && (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50 mb-2">Preview</p>
                  <div className="w-36 rounded-xl overflow-hidden border border-white/10">
                    <img src={category.image} alt={category.name} className="object-cover w-full h-24" />
                  </div>
                </div>
              )}
              <label className="block mt-4 text-sm text-white/70">
                Subcategories (comma separated)
                <input value={(category.subcategories || []).join(", ")} onChange={e => updateCategory(index, "subcategories", e.target.value.split(",").map(item => item.trim()).filter(Boolean))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
              </label>
            </div>
          ))}
        </div>

        {saved && <p className="mt-4 rounded-3xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-200">Categories saved locally.</p>}
      </div>
    </div>
  );
}
