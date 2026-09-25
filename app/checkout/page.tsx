"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/components/CartContext";
import { saveOrder, getSiteSettings, formatWhatsappMessage, formatEmailSubject, formatEmailBody, buildMailtoLink, buildWhatsappLink, getCurrentUser } from "@/lib/data";
import Footer from "@/components/Footer";
import Image from "@/components/StoreImage";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const settings = getSiteSettings();
  const { items, total } = useCart();
  const formRef = useRef<HTMLFormElement>(null);
  const [esewaData, setEsewaData] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"esewa"|"whatsapp">(settings.esewaEnabled === false ? "whatsapp" : "esewa");
  const [whatsappMessage, setWhatsappMessage] = useState(settings.whatsappMessage);
  const paymentOptions = [
    ...(settings.esewaEnabled !== false ? [{ value: "esewa" as const, label: settings.esewaLabel || "eSewa" }] : []),
    { value: "whatsapp" as const, label: settings.footerWhatsAppButtonLabel || "WhatsApp" },
  ];
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "Kathmandu" });

  useEffect(() => { requestId.current = null; }, [form, items, paymentMethod, whatsappMessage]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    setForm({
      name: currentUser.name || "",
      phone: currentUser.phone || "",
      email: currentUser.email || "",
      address: currentUser.address || "",
      city: currentUser.city || "Kathmandu",
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || loading) return;
    setLoading(true); setError("");
    try {
    requestId.current ||= crypto.randomUUID();
    const orderId = `19T-${Date.now()}`;
    const order = {
      id: orderId,
      requestId: requestId.current,
      items,
      customer: form,
      total,
      status: "pending" as const,
      paymentStatus: "pending" as const,
      paymentMethod,
      whatsappMessage: paymentMethod === "whatsapp" ? whatsappMessage : undefined,
      createdAt: new Date().toISOString(),
    };
    const savedOrder = await saveOrder(order);

    if (paymentMethod === "esewa") {
      try {
        const res = await fetch("/api/esewa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: savedOrder.id }) });
        const data = await res.json();
        if (!res.ok || typeof data !== "object" || !data?.esewa_url) {
          const message = data?.error || "Invalid eSewa response.";
          throw new Error(message);
        }
        const { esewa_url, ...fields } = data;
        setEsewaData({ ...fields, _url: esewa_url });
      } catch (error) {
        console.error("Checkout eSewa error:", error);
        setError(error instanceof Error ? error.message : "Please try again.");
        setLoading(false);
      }
    } else {
      const whatsappText = formatWhatsappMessage(settings, savedOrder);
      window.location.href = buildWhatsappLink(settings.whatsappNumber, whatsappText);
    }
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to place order"); setLoading(false); }
  };

  useEffect(() => {
    if (esewaData?._url) {
      formRef.current?.submit();
    }
  }, [esewaData]);

  return (
    <div className="min-h-screen bg-white shopping-page">
      <Navbar />
      <div className="store-shell checkout-content">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-5 transition-colors"><ArrowLeft className="w-4 h-4" />Back to Cart</Link>
        <h1 className="text-2xl font-bold mb-6">Checkout</h1><div className="checkout-guide"><span><b>1</b> Your details</span><span><b>2</b> Choose payment</span><span><b>3</b> Place order</span></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
            {error && <p role="alert" className="bg-red-50 text-red-700 p-3 rounded-sm">{error}</p>}
            <div className="bg-white rounded-sm p-4 border border-gray-100 space-y-3">
              <h2 className="font-bold">Delivery Information</h2>
              {[
                { key: "name", label: "Full Name", type: "text", placeholder: "Your full name" },
                { key: "phone", label: "Phone Number", type: "tel", placeholder: "+977 98XXXXXXXX" },
                { key: "email", label: "Email (optional)", type: "email", placeholder: "your@email.com", req: false },
                { key: "address", label: "Delivery Address", type: "text", placeholder: "Street, Tole, Ward No." },
                { key: "city", label: "City", type: "text", placeholder: "Kathmandu" },
              ].map(f => (
                <div key={f.key}>
                  <label htmlFor={f.key} className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{f.label}</label>
                  <input id={f.key} required={f.req !== false} type={f.type} placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
              ))}
              <div className="rounded-sm border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Payment method</p>
                <div className="grid grid-cols-2 gap-3">
                  {paymentOptions.map(option => (
                    <button key={option.value} aria-pressed={paymentMethod === option.value} type="button" onClick={() => setPaymentMethod(option.value)}
                      className={`rounded-sm border px-4 py-3 text-sm font-semibold transition ${paymentMethod === option.value ? "border-black bg-gray-100 text-black" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`}>
                      {option.label}
                    </button>
                  ))}
                </div>
                {paymentMethod === "esewa" && settings.esewaQrImage && (
                  <div className="mt-4 rounded-sm border border-dashed border-gray-300 bg-white p-4 text-center">
                    <p className="text-sm text-gray-600 mb-3">{settings.esewaDescription || "Scan this QR in your eSewa app to pay faster."}</p>
                    <img src={settings.esewaQrImage} alt="eSewa QR" className="mx-auto h-40 object-contain" />
                  </div>
                )}
                {paymentMethod === "whatsapp" && (
                  <div className="mt-4 rounded-sm border border-gray-200 bg-white p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">WhatsApp Message</p>
                    <textarea aria-label="WhatsApp message" value={whatsappMessage} onChange={e => setWhatsappMessage(e.target.value)} rows={4}
                      className="w-full rounded-sm border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                )}
              </div>
            </div>
            <button type="submit" disabled={loading || items.length === 0}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-sm text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Preparing your order...</> : paymentMethod === "esewa" ? `Pay Rs ${total.toLocaleString()} via ${settings.esewaLabel || "eSewa"}` : `Place order for Rs ${total.toLocaleString()} via WhatsApp`}
            </button>
          </form>
          <div className="order-summary md:col-span-2 bg-white rounded-sm border border-gray-100 p-4 h-fit">
            <h2 className="font-bold mb-3">Order Summary</h2>
            <div className="space-y-3 text-sm">
              {items.map(i => (
                <div key={`${i.id}-${i.size}-${Object.entries(i.variantSelections || {}).map(([key, value]) => `${key}:${value}`).join("-")}`} className="space-y-1">
                  <div className="checkout-product"><div className="checkout-thumbnail"><Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover"/></div><span className="truncate pr-2">{i.name} ×{i.quantity}</span><span>Rs {(i.price * i.quantity).toLocaleString()}</span></div>
                  {i.variantSelections && Object.keys(i.variantSelections).length > 0 && (
                    <p className="text-xs text-gray-500">{Object.entries(i.variantSelections).map(([key, value]) => `${key}: ${value}`).join(" • ")}</p>
                  )}
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span>Rs {total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {esewaData && (
        <form ref={formRef} method="POST" action={esewaData._url} className="hidden">
          {Object.entries(esewaData).filter(([k]) => k !== "_url").map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        </form>
      )}
    </div>
  );
}
