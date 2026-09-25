import type { Product, Order, Category, SiteSettings, Coupon, Review, UserAccount } from "./types";
import { readAllSharedValues, writeSharedValue } from "./convexStore";
export const DATA_CHANGED_EVENT = "9teen-data-changed";
const cache: Record<string, unknown> = {};
let admin = false;
const pending = new Set<Promise<unknown>>();
const queues = new Map<string, Promise<unknown>>();
let saveFailure: Error | null = null;
const browser = () => typeof window !== "undefined";
function notify() { if (browser()) window.dispatchEvent(new Event(DATA_CHANGED_EVENT)); }
function cached<T>(key: string, fallback: T): T { return (cache[key] ?? fallback) as T; }
function report(error: unknown) {
  saveFailure = error instanceof Error ? error : new Error("Unable to save changes");
  if (browser()) window.dispatchEvent(new CustomEvent("9teen-save-error", { detail: saveFailure.message }));
}
async function request(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const value = await response.json();
  if (!response.ok) throw new Error(value?.error || "Request failed");
  return value;
}
function json(method: string, value: unknown): RequestInit { return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) }; }
function persist(key: string, value: unknown) {
  cache[key] = value;
  notify();
  const work = (queues.get(key) || Promise.resolve()).catch(() => undefined).then(() => key === "9teen_orders" ? request("/api/orders", json("PATCH", value)) : writeSharedValue(key, value));
  queues.set(key, work);
  pending.add(work);
  void work.catch(report).finally(() => { pending.delete(work); if (queues.get(key) === work) queues.delete(key); });
  return work;
}
function local<T>(key: string, fallback: T): T {
  if (!browser()) return fallback;
  try { return JSON.parse(window.localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}
function saveLocal(key: string, value: unknown) {
  if (browser()) { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { report(new Error("Your browser could not save this item")); } }
  notify();
}
export async function initializeData() {
  const results = await Promise.allSettled([
    readAllSharedValues().then(store => { for (const key of Object.keys(cache)) if (key !== "9teen_user_session" && key !== "9teen_orders") delete cache[key]; Object.assign(cache,store); }),
    request("/api/auth/customer").then(user => { cache["9teen_user_session"] = user; }),
    request("/api/auth/admin").then(value => { admin = value.authenticated === true; }),
    request("/api/orders").then(orders => { cache["9teen_orders"] = orders; }),
  ]);
  notify();
  const failed = results.find(r => r.status === "rejected");
  if (failed?.status === "rejected") throw failed.reason;
}
export const defaultCoupons: Coupon[] = [
	{ id: "c1", code: "TEEN10", discount: 10, active: true, description: "10% off sitewide" },
	{ id: "c2", code: "FREESHIP", discount: 0, active: true, description: "Free shipping on orders over NPR 2,999" },
];

export const defaultReviews: Review[] = [
	{ id: "r1", productId: "p1", name: "Asha", rating: 5, comment: "Great fit and quick delivery.", status: "approved", date: "2025-07-10" },
	{ id: "r2", productId: "p3", name: "Priya", rating: 4, comment: "Loved the dress color.", status: "pending", date: "2025-07-11" },
];

export const categories: Category[] = [
	{ id: "men", name: "Men", emoji: "👕", enabled: true, subcategories: ["Tops", "Jackets", "Shirts"], image: "https://images.unsplash.com/photo-1520975680306-5d7d6f4f4b4a?q=80&w=600&auto=format&fit=crop" },
	{ id: "dresses", name: "Dresses", emoji: "👗", enabled: true, subcategories: ["Casual", "Party", "Evening"], image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop" },
	{ id: "footwear", name: "Footwear", emoji: "👟", enabled: true, subcategories: ["Sneakers", "Sandals", "Boots"], image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop" },
	{ id: "accessories", name: "Accessories", emoji: "🧢", enabled: false, subcategories: ["Bags", "Jewelry", "Hats"], image: "https://images.unsplash.com/photo-1495121605193-b116b5b09f3b?q=80&w=600&auto=format&fit=crop" },
	{ id: "cosmetics", name: "Cosmetics", emoji: "💄", enabled: false, subcategories: ["Makeup", "Skincare", "Fragrance"], image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop" },
];

export const defaultProducts: Product[] = [
	{ id: "p1", name: "Classic Tee", category: "men", price: 799, originalPrice: 999, image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop", description: "Comfortable cotton tee.", sizes: ["S","M","L"], variants:[{ name:"Color", values:["Black","White","Gray"] }], featured: true, badge: "New", inStock: true, newArrival: true, bestSeller: true, trending: false },
	{ id: "p2", name: "Denim Jacket", category: "men", price: 2499, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop", description: "Stylish denim jacket", sizes: ["M","L"], variants:[{ name:"Color", values:["Blue","Black"] }], featured: true, inStock: true, newArrival: false, bestSeller: true, trending: false },
	{ id: "p3", name: "Summer Dress", category: "dresses", price: 1299, image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1200&auto=format&fit=crop", description: "Light summer dress", sizes: ["S","M"], variants:[{ name:"Color", values:["Red","White"] }], featured: true, inStock: true, newArrival: true, bestSeller: false, trending: false },
	{ id: "p4", name: "Sneakers", category: "footwear", price: 1999, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop", description: "Comfort sneakers", sizes: ["8","9","10"], featured: false, inStock: true, newArrival: false, bestSeller: false, trending: true },
	{ id: "p5", name: "Luxury Lipstick", category: "cosmetics", price: 599, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop", description: "Bold color lipstick.", sizes: ["One Size"], variants:[{ name:"Shade", values:["Cherry Red","Nude","Plum"] }], featured: false, inStock: true, discountEnabled: true, newArrival: false, bestSeller: false, trending: false },
];

export const defaultSiteSettings: SiteSettings = {
	siteName: "9TEEN",
	tagline: "Wear your confidence",
	heroTopLabel: "Premium streetwear",
	heroTitle: "Wear Your Story.",
	heroHighlight: "",
	heroSubtitle: "High quality. Bold designs. Made for those who lead, not follow.",
	heroImage: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1400&auto=format&fit=crop",
	heroButtonLabel: "Shop Collection",
	heroExploreButtonLabel: "New Arrivals",
	navLabelShop: "Shop",
	navLabelCategories: "Categories",
	navLabelCollections: "Collections",
	navLabelTrackOrder: "Track Order",
	navLabelAbout: "About",
	navLabelLogin: "Login",
	promoText: "FREE SHIPPING ON ORDERS OVER NPR 2,999",
	searchPlaceholder: "Search products, categories...",
	sectionShopByCategoryLabel: "Shop by category",
	sectionShopByCategoryTitle: "Shop by Category",
	sectionProductsEnabled: true,
	sectionProductsLabel: "New products",
	sectionProductsTitle: "Latest arrivals",
	sectionNewArrivalsEnabled: true,
	sectionNewArrivalsLabel: "New arrivals",
	sectionNewArrivalsTitle: "Fresh Picks",
	sectionBestSellersEnabled: true,
	sectionBestSellersLabel: "Best sellers",
	sectionBestSellersTitle: "Top Picks",
	sectionTrendingEnabled: true,
	sectionTrendingLabel: "Trending",
	sectionTrendingTitle: "Trending",
	sectionFeaturedEnabled: true,
	sectionFeaturedLabel: "Featured",
	sectionFeaturedTitle: "Featured Collection",
	sectionSaleEnabled: true,
	sectionSaleLabel: "Sale",
	sectionSaleTitle: "Sale Finds",
	sectionSpecialOfferEnabled: true,
	sectionSpecialOfferLabel: "Special offer",
	sectionSpecialOfferTitle: "Up to 50% off on selected items",
	sectionSpecialOfferButtonLabel: "Shop Now",
	sectionOrder: ["shopByCategory", "products", "newArrivals", "bestSellers", "trending", "featured", "sale", "specialOffer"],
	esewaEnabled: true,
	esewaLabel: "eSewa",
	esewaTitle: "Pay with eSewa",
	esewaDescription: "Scan this QR in your eSewa app to pay faster.",
	esewaButtonLabel: "Pay with eSewa",
	esewaQrImage: "",
	whatsappNumber: "9779812345678",
	whatsappMessage: "Hi, I just placed an order from 9TEEN. Order ID: {orderId}, Total: NPR {total}. Please confirm the details.",
	notificationEmail: "info@9teen.com",
	emailSubject: "Your 9TEEN Order {orderId}",
	emailBody: "Hello {name},\n\nThanks for shopping with {siteName}. Your order #{orderId} is confirmed. Total: NPR {total}.\n\nDelivery address:\n{address}, {city}\n\nWe'll notify you once your items ship.\n\nCheers,\n{siteName} Team",
	adminUsername: "",
	adminPassword: "",
	footerContactEmail: "info@9teen.com",
	footerContactPhone: "+977 9800000000",
	footerContactLocation: "Kathmandu, Nepal",
	footerDeveloperText: "Website developed by 9TEEN developer.",
	footerDeveloperLink: "https://www.instagram.com/9teen.official",
	footerDeveloperLinkLabel: "Contact Developer",
	footerMiddleText: "Need help with your order or payment? Message us on WhatsApp in the middle section below.",
	footerWhatsAppButtonLabel: "WhatsApp Support",
	footerUpdatedDate: "24/07/2026 09:03",
	designImages: [
		"https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=900&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=900&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=900&auto=format&fit=crop",
	],
};


export function getProducts(): Product[] { return cached("9teen_products", defaultProducts); }
export function getCategories(): Category[] { return cached("9teen_categories", categories); }
export function getSiteSettings(): SiteSettings { return { ...defaultSiteSettings, ...cached<Partial<SiteSettings>>("9teen_site_settings", {}) }; }
export function getCoupons(): Coupon[] { return cached("9teen_coupons", defaultCoupons); }
export function getReviews(): Review[] { return cached("9teen_reviews", defaultReviews); }
export function getUserAccounts(): UserAccount[] { return cached("9teen_user_accounts", []); }
export function getOrders(): Order[] { return cached("9teen_orders", []); }
export function getCurrentUser(): UserAccount | null { return cached("9teen_user_session", null); }
export function isUserLoggedIn() { return Boolean(getCurrentUser()); }
export function isAdminLoggedIn() { return admin; }
export function saveProducts(value: Product[]) { return persist("9teen_products", value); }
export function saveCategories(value: Category[]) { return persist("9teen_categories", value); }
export function saveSiteSettings(value: SiteSettings) { const { adminUsername: _u, adminPassword: _p, ...settings } = value; return persist("9teen_site_settings", settings); }
export function saveCoupons(value: Coupon[]) { return persist("9teen_coupons", value); }
export function saveReviews(value: Review[]) { return persist("9teen_reviews", value); }
export function saveOrders(value: Order[]) { return persist("9teen_orders", value); }
export async function registerUser(input: { name:string; email:string; phone:string; password:string; address:string; city:string }) {
  const user = await request("/api/auth/customer", json("POST", { ...input, action:"register" }));
  cache["9teen_user_session"] = user;
  cache["9teen_orders"] = await request("/api/orders"); notify(); return user as UserAccount;
}
export async function loginUser(email: string, password: string) {
  const user = await request("/api/auth/customer", json("POST",{ email,password,action:"login" }));
  cache["9teen_user_session"] = user;
  cache["9teen_orders"] = await request("/api/orders"); notify(); return user as UserAccount;
}
export async function logoutUser() {
  await request("/api/auth/customer", { method:"DELETE" });
  cache["9teen_user_session"] = null; cache["9teen_orders"] = []; saveLastOrder(null); notify();
}
export async function adminLogin(username: string, password: string) {
  await request("/api/auth/admin", json("POST",{ username,password }));
  admin = true; await initializeData(); return true;
}
export async function adminLogout() {
  await request("/api/auth/admin", { method:"DELETE" });
  admin = false; delete cache["9teen_user_accounts"]; cache["9teen_orders"] = [];
  await initializeData();
}
export async function saveAllAdminData() {
  await Promise.all([...pending]);
  if (saveFailure) { const error = saveFailure; saveFailure = null; throw error; }
  await Promise.all([saveProducts(getProducts()),saveCategories(getCategories()),saveSiteSettings(getSiteSettings()),saveCoupons(getCoupons()),saveReviews(getReviews())]);
}
export function getWishlist(): string[] { const value = local<unknown>("9teen_wishlist", []); return Array.isArray(value) ? value.filter(v => typeof v === "string") : []; }
export function saveWishlist(value: string[]) { saveLocal("9teen_wishlist",value); }
export function toggleWishlist(id: string) { const old = getWishlist(); const next = old.includes(id) ? old.filter(x=>x!==id) : [...old,id]; saveWishlist(next); return next; }
export function getLastOrder(): Order | null {
  if (!browser()) return null;
  try { return JSON.parse(sessionStorage.getItem("9teen_last_order") || "null"); } catch { return null; }
}
export function saveLastOrder(value: Order | null) {
  if (browser()) { try { sessionStorage.setItem("9teen_last_order",JSON.stringify(value)); } catch {} }
}
export async function saveOrder(value: Order) {
  const saved = await request("/api/orders",json("POST",value)) as Order;
  cache["9teen_orders"] = [saved,...getOrders().filter(o=>o.id!==saved.id)];
  saveLastOrder(saved); notify(); return saved;
}
export async function addReview(value: Review) { await request("/api/reviews",json("POST",value)); }
export function resetProducts() { return saveProducts(defaultProducts); }
export function resetCategories() { return saveCategories(categories); }
export function resetSiteSettings() { return saveSiteSettings(defaultSiteSettings); }
export function resetOrders() { report(new Error("Order deletion is disabled. Cancel orders individually to preserve payment records.")); }
export function resetAllData() { resetProducts(); resetCategories(); resetSiteSettings(); saveCoupons(defaultCoupons); saveReviews(defaultReviews); }
export function formatWhatsappMessage(settings: SiteSettings, order: Order) {
	return (order.whatsappMessage || settings.whatsappMessage)
		.replace(/{orderId}/g, order.id)
		.replace(/{total}/g, order.total.toLocaleString())
		.replace(/{siteName}/g, settings.siteName)
		.replace(/{name}/g, order.customer.name)
		.replace(/{address}/g, order.customer.address)
		.replace(/{city}/g, order.customer.city);
}

export function formatEmailSubject(settings: SiteSettings, order: Order) {
	return settings.emailSubject
		.replace(/{orderId}/g, order.id)
		.replace(/{total}/g, order.total.toLocaleString())
		.replace(/{siteName}/g, settings.siteName);
}

export function formatEmailBody(settings: SiteSettings, order: Order) {
	return settings.emailBody
		.replace(/{orderId}/g, order.id)
		.replace(/{total}/g, order.total.toLocaleString())
		.replace(/{siteName}/g, settings.siteName)
		.replace(/{name}/g, order.customer.name)
		.replace(/{address}/g, order.customer.address)
		.replace(/{city}/g, order.customer.city)
		.replace(/{paymentMethod}/g, order.paymentMethod)
		.replace(/{status}/g, order.status);
}

export function buildMailtoLink(to: string, subject: string, body: string) {
	return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildWhatsappLink(number: string, message: string) {
	const cleaned = number.replace(/[^0-9]/g, "");
	return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
