"use client";
import { useState } from "react";
import { getReviews, saveReviews } from "@/lib/data";
import { postProducts, postOrders, postUsers } from "@/utils/api/admin";
import { Star, Save } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState(getReviews());
  const [saved, setSaved] = useState(false);

  const updateReview = (id: string, key: keyof typeof reviews[number], value: string | number | boolean) => {
    setReviews(reviews.map(review => review.id === id ? { ...review, [key]: value } : review));
    setSaved(false);
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-red-400">Reviews</p>
            <h1 className="text-3xl font-black mt-3">Review Manager</h1>
            <p className="text-sm text-white/70 mt-2">Approve or reject product reviews before they show in the store.</p>
          </div>
          <button onClick={async () => { saveReviews(reviews); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 transition">
            <Save className="w-4 h-4" /> Save Reviews
          </button>
        </div>
        <div className="grid gap-4 mt-6">
          {reviews.map(review => (
            <div key={review.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">{review.name}</p>
                  <p className="text-sm text-white/70 mt-1">{review.comment}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                  <Star className="w-4 h-4 text-yellow-300" /> {review.rating}
                </div>
              </div>
              <div className="grid gap-4 mt-4 md:grid-cols-3">
                <label className="block text-sm text-white/70">
                  Product ID
                  <input value={review.productId} onChange={e => updateReview(review.id, "productId", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
                <label className="block text-sm text-white/70">
                  Status
                  <select value={review.status} onChange={e => updateReview(review.id, "status", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>
                <label className="block text-sm text-white/70">
                  Date
                  <input value={review.date} onChange={e => updateReview(review.id, "date", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </label>
              </div>
            </div>
          ))}
        </div>
        {saved && <p className="mt-4 rounded-3xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-200">Review settings saved locally.</p>}
      </div>
    </div>
  );
}
