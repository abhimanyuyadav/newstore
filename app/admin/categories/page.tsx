"use client";

import { useState } from "react";
import { getCategories, saveCategories, resetCategories } from "@/lib/data";
import { Check, X, RefreshCcw, Save } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(getCategories());
  const [saved, setSaved] = useState(false);

  const updateCategory = (index: number, key: keyof typeof categories[number], value: string | string[] | boolean) => {
    setCategories(prev => prev.map((item, idx) => idx === index ? { ...item, [key]: value } : item));
    setSaved(false);
  };

  const toggleEnabled = (index: number) => {
    setCategories(prev => prev.map((item, idx) => idx === index ? { ...item, enabled: !item.enabled } : item));
    setSaved(false);
  };

  const handleSave = () => {
    saveCategories(categories);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => toggleEnabled(index)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${category.enabled ? "bg-green-500 text-black" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                    {category.enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />} {category.enabled ? "Enabled" : "Disabled"}
                  </button>
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
