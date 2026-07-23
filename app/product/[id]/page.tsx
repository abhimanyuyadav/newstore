"use client";
import { useEffect, useState } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/components/CartContext";
import { DATA_CHANGED_EVENT, getProducts, getCategories, getReviews, addReview, getSiteSettings, buildWhatsappLink } from "@/lib/data";
import type { Category, Product, Review } from "@/lib/types";
import { ShoppingCart, ArrowLeft, Check, Star } from "lucide-react";

export default function ProductPage() {
  const params = useParams();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const productId = routeId ?? "";
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const loadData = () => {
      setProducts(getProducts());
      setCategories(getCategories());
      setHydrated(true);
    };
    loadData();
    const handleDataChange = () => loadData();
    window.addEventListener(DATA_CHANGED_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, handleDataChange);
  }, []);
  const product = products.find(p => p.id === productId);
  const { dispatch } = useCart();
  const router = useRouter();
  const [size, setSize] = useState("");
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [variantSelections, setVariantSelections] = useState<Record<string, string>>({});
  const settings = getSiteSettings();

  if (!hydrated) {
    return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center"><div className="text-sm text-gray-500">Loading product…</div></div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Product not found</h1>
          <p className="text-gray-500 mb-6">The item you are looking for is unavailable or has been removed.</p>
          <Link href="/products" className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white">Browse products</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const category = categories.find(c => c.id === product.category);
  const categoryDisabled = category ? !category.enabled : false;
  const { id, name, price, image, variants } = product;

  useEffect(() => {
    const loadReviews = () => setReviews(getReviews().filter(review => review.productId === productId && review.status === "approved"));
    loadReviews();
    window.addEventListener(DATA_CHANGED_EVENT, loadReviews);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, loadReviews);
  }, [productId]);

  function addToCart() {
    if (!size) { alert("Please select a size"); return; }
    if (variants) {
      for (const variant of variants) {
        if (!variantSelections[variant.name]) { alert(`Please select ${variant.name}`); return; }
      }
    }
    dispatch({ type: "ADD", item: { id, name, price, image, size, quantity: 1, variantSelections } });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function buyNow() {
    if (!size) { alert("Please select a size"); return; }
    if (variants) {
      for (const variant of variants) {
        if (!variantSelections[variant.name]) { alert(`Please select ${variant.name}`); return; }
      }
    }
    dispatch({ type: "ADD", item: { id, name, price, image, size, quantity: 1, variantSelections } });
    router.push("/checkout");
  }
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      alert("Please enter your name and a review message.");
      return;
    }
    addReview({
      id: `r${Date.now()}${Math.floor(Math.random() * 1000)}`,
      productId: productId,
      name: reviewForm.name.trim(),
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
      status: "pending",
      date: new Date().toISOString().slice(0, 10),
    });
    setReviewSubmitted(true);
    setReviewForm({ name: "", rating: 5, comment: "" });
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#f97316] mb-6 transition-colors"><ArrowLeft className="w-4 h-4" />Back</Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="relative h-80 md:h-[500px] rounded-2xl overflow-hidden bg-gray-100">
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width:768px) 100vw,50vw" />
              {product.badge && <span className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full">{product.badge}</span>}
          </div>
          <div className="flex flex-col">
              <p className="text-xs font-bold uppercase tracking-widest text-black mb-2 capitalize">{product.category}</p>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3">{product.name}</h1>
            <div className="flex items-baseline gap-3 mb-4">
              {categoryDisabled ? (
                <span className="text-2xl font-bold text-orange-700">Price coming soon</span>
              ) : (
                <>
                  <span className="text-2xl font-bold">Rs {product.price.toLocaleString()}</span>
                  {product.originalPrice && <><span className="text-gray-400 line-through text-base">Rs {product.originalPrice.toLocaleString()}</span><span className="text-green-600 text-sm font-semibold">Save Rs {(product.originalPrice - product.price).toLocaleString()}</span></>}
                </>
              )}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">{product.description}</p>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSize(s)} className={`min-w-[42px] h-10 px-3 border rounded-lg text-sm font-semibold transition-all ${size === s ? "bg-black text-white border-black" : "border-gray-200 text-gray-700 hover:border-black"}`}>{s}</button>
                ))}
              </div>
            </div>
            {product.variants?.map(variant => (
              <div key={variant.name} className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{variant.name}</p>
                <div className="flex flex-wrap gap-2">
                  {variant.values.map(value => (
                    <button key={value} onClick={() => setVariantSelections(prev => ({ ...prev, [variant.name]: value }))}
                      className={`min-w-[42px] h-10 px-3 border rounded-lg text-sm font-semibold transition-all ${variantSelections[variant.name] === value ? "bg-black text-white border-black" : "border-gray-200 text-gray-700 hover:border-black"}`}>
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {categoryDisabled && (
              <div className="rounded-3xl border border-orange-300 bg-orange-50 text-orange-900 p-4 mb-5">
                <p className="font-semibold">Coming Soon</p>
                <p className="text-sm">This category is currently disabled. Pricing and checkout are not available for this collection yet.</p>
              </div>
            )}
            <div className="flex flex-col gap-3 mt-auto">
                {added ? <><Check className="w-4 h-4" />Added!</> : <><ShoppingCart className="w-4 h-4" />Add to Cart</>}
                <button onClick={addToCart} disabled={!product.inStock || categoryDisabled} className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${added ? "bg-green-500 text-white" : "bg-black hover:bg-black text-white"} disabled:opacity-50`}>
                  {added ? <><Check className="w-4 h-4" />Added!</> : <><ShoppingCart className="w-4 h-4" />Add to Cart</>}
                </button>
              <button onClick={() => {
                if (!product.inStock || categoryDisabled) return;
                const message = `Hi, I am interested in ${product.name} priced at NPR ${product.price.toLocaleString()}. Please send details.`;
                window.open(buildWhatsappLink(settings.whatsappNumber, message), "_blank");
              }} disabled={!product.inStock || categoryDisabled} className="w-full py-3.5 rounded-xl font-bold text-sm border border-green-500 text-green-700 bg-white hover:bg-green-50 transition-colors disabled:opacity-50">
                Message on WhatsApp
              </button>
              <button onClick={buyNow} disabled={!product.inStock || categoryDisabled} className="w-full py-3.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-black text-center transition-colors disabled:opacity-50">
                Buy Now with eSewa
              </button>
            </div>
            <div className="mt-4 p-3 bg-white rounded-xl border border-gray-100 text-xs text-gray-500 flex flex-wrap gap-3">
              <span>Free delivery in Kathmandu</span><span>7-day returns</span><span>100% Authentic</span>
            </div>
          </div>
        </div>
        <div className="mt-12 rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">Customer Reviews</h2>
              <p className="text-sm text-gray-500">Approved reviews for this product.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700">
              <Star className="w-4 h-4 text-amber-500" />
              {reviews.length > 0 ? `${(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)} (${reviews.length})` : "No reviews yet"}
            </div>
          </div>
          {reviews.length === 0 ? (
            <p className="text-gray-500">There are no approved reviews for this item yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"><Star className="w-3 h-3" />{review.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-3">{review.date}</p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="mt-8 rounded-3xl border border-gray-100 bg-gray-50 p-5">
            <h3 className="text-lg font-semibold mb-4">Write a review</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block text-sm text-gray-600">
                Your name
                <input value={reviewForm.name} onChange={e => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
              </label>
              <label className="block text-sm text-gray-600">
                Rating
                <select value={reviewForm.rating} onChange={e => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]">
                  {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} stars</option>)}
                </select>
              </label>
              <label className="block text-sm text-gray-600">
                Date
                <input value={new Date().toISOString().slice(0, 10)} disabled
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-400" />
              </label>
            </div>
            <label className="block text-sm text-gray-600 mt-4">
              Review
              <textarea value={reviewForm.comment} onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} rows={4}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
            </label>
            <button type="submit" className="mt-4 inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-900 transition">Submit Review</button>
            {reviewSubmitted && <p className="mt-3 text-sm text-green-600">Thank you! Your review has been submitted for approval.</p>}
          </form>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-5">You might also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">{related.map(p => <ProductCard key={p.id} product={p} />)}</div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
