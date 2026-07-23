
import { Product, Order, Category, SiteSettings, Coupon, Review, UserAccount } from "./types";

const PRODUCT_STORAGE_KEY = "19teen_products";
const SITE_SETTINGS_KEY = "19teen_site_settings";
const COUPON_STORAGE_KEY = "19teen_coupons";
const REVIEW_STORAGE_KEY = "19teen_reviews";
const WISHLIST_STORAGE_KEY = "19teen_wishlist";
const USER_ACCOUNTS_KEY = "9teen_user_accounts";
const USER_SESSION_KEY = "9teen_user_session";
export const DATA_CHANGED_EVENT = "19teen-data-changed";

function notifyDataChanged() {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT));
	}
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
	{ id: "men", name: "Men", emoji: "👕", enabled: true, subcategories: ["Tops", "Jackets", "Shirts"] },
	{ id: "dresses", name: "Dresses", emoji: "👗", enabled: true, subcategories: ["Casual", "Party", "Evening"] },
	{ id: "footwear", name: "Footwear", emoji: "👟", enabled: true, subcategories: ["Sneakers", "Sandals", "Boots"] },
	{ id: "accessories", name: "Accessories", emoji: "🧢", enabled: false, subcategories: ["Bags", "Jewelry", "Hats"] },
	{ id: "cosmetics", name: "Cosmetics", emoji: "💄", enabled: false, subcategories: ["Makeup", "Skincare", "Fragrance"] },
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
	heroTopLabel: "New collection 2025",
	heroTitle: "Summer Vibes",
	heroHighlight: "Unleashed",
	heroSubtitle: "Discover the latest trends that define your style. Stay confident, stay 9TEEN.",
	heroImage: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1400&auto=format&fit=crop",
	heroButtonLabel: "Shop Now",
	heroExploreButtonLabel: "Explore Collection",
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
	esewaQrImage: "",
	whatsappNumber: "9779812345678",
	whatsappMessage: "Hi, I just placed an order from 9TEEN. Order ID: {orderId}, Total: NPR {total}. Please confirm the details.",
	notificationEmail: "info@9teen.com",
	emailSubject: "Your 9TEEN Order {orderId}",
	emailBody: "Hello {name},\n\nThanks for shopping with {siteName}. Your order #{orderId} is confirmed. Total: NPR {total}.\n\nDelivery address:\n{address}, {city}\n\nWe’ll notify you once your items ship.\n\nCheers,\n{siteName} Team",
	adminUsername: "admin",
	adminPassword: "9teen12@",
	footerContactEmail: "info@9teen.com",
	footerContactPhone: "+977 9800000000",
	footerContactLocation: "Kathmandu, Nepal",
	footerDeveloperText: "Website developed by 9TEEN developer.",
	footerDeveloperLink: "https://www.instagram.com/9teen.official",
	footerDeveloperLinkLabel: "Contact Developer",
	footerMiddleText: "Need help with your order or payment? Message us on WhatsApp in the middle section below.",
	footerWhatsAppButtonLabel: "WhatsApp Support",
	footerUpdatedDate: "22/07/2026",
	designImages: [
		"https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=900&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=900&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=900&auto=format&fit=crop",
	],
};

export function getCategories(): Category[] {
	try {
		const raw = localStorage.getItem("19teen_categories");
		if (!raw) return categories;
		const saved = JSON.parse(raw) as Category[];
		return saved.map(c => ({ ...categories.find(d => d.id === c.id) ?? c, ...c }));
	} catch {
		return categories;
	}
}

export function saveCategories(categoryList: Category[]) {
	try {
		localStorage.setItem("19teen_categories", JSON.stringify(categoryList));
		notifyDataChanged();
	} catch {}
}

export function getProducts(): Product[] {
	try {
		const raw = localStorage.getItem(PRODUCT_STORAGE_KEY);
		if (!raw) return defaultProducts;
		const saved = JSON.parse(raw) as Product[];
		return saved.map(p => ({ ...defaultProducts.find(d => d.id === p.id) ?? p, ...p }));
	} catch {
		return defaultProducts;
	}
}

export function saveProducts(products: Product[]) {
	try {
		localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
		notifyDataChanged();
	} catch {}
}

export function getSiteSettings(): SiteSettings {
	try {
		const raw = localStorage.getItem(SITE_SETTINGS_KEY);
		return raw ? { ...defaultSiteSettings, ...JSON.parse(raw) } : defaultSiteSettings;
	} catch {
		return defaultSiteSettings;
	}
}

export function saveSiteSettings(settings: SiteSettings) {
	try {
		localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(settings));
		notifyDataChanged();
	} catch {}
}

export function getUserAccounts(): UserAccount[] {
	try {
		const raw = localStorage.getItem(USER_ACCOUNTS_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export function saveUserAccounts(accounts: UserAccount[]) {
	try {
		localStorage.setItem(USER_ACCOUNTS_KEY, JSON.stringify(accounts));
		notifyDataChanged();
	} catch {}
}

export function registerUser(input: { name: string; email: string; phone: string; password: string; address: string; city: string }) {
	try {
		const accounts = getUserAccounts();
		const emailExists = accounts.some(account => account.email.toLowerCase() === input.email.toLowerCase());
		if (emailExists) return null;

		const newAccount: UserAccount = {
			id: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
			name: input.name.trim(),
			email: input.email.trim().toLowerCase(),
			phone: input.phone.trim(),
			password: input.password,
			address: input.address.trim(),
			city: input.city.trim(),
			createdAt: new Date().toISOString(),
		};

		accounts.push(newAccount);
		saveUserAccounts(accounts);
		localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newAccount));
		notifyDataChanged();
		return newAccount;
	} catch {
		return null;
	}
}

export function loginUser(email: string, password: string) {
	try {
		const accounts = getUserAccounts();
		const account = accounts.find(item => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);
		if (!account) return null;
		localStorage.setItem(USER_SESSION_KEY, JSON.stringify(account));
		notifyDataChanged();
		return account;
	} catch {
		return null;
	}
}

export function getCurrentUser(): UserAccount | null {
	try {
		const raw = localStorage.getItem(USER_SESSION_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

export function isUserLoggedIn() {
	try {
		return Boolean(localStorage.getItem(USER_SESSION_KEY));
	} catch {
		return false;
	}
}

export function logoutUser() {
	try {
		localStorage.removeItem(USER_SESSION_KEY);
		notifyDataChanged();
	} catch {}
}

export function saveAllAdminData() {
	try {
		saveProducts(getProducts());
		saveCategories(getCategories());
		saveSiteSettings(getSiteSettings());
		saveCoupons(getCoupons());
		saveReviews(getReviews());
		notifyDataChanged();
	} catch {}
}

export function resetProducts() {
	try { localStorage.removeItem(PRODUCT_STORAGE_KEY); notifyDataChanged(); } catch {}
}

export function resetCategories() {
	try { localStorage.removeItem("19teen_categories"); notifyDataChanged(); } catch {}
}

export function resetSiteSettings() {
	try { localStorage.removeItem(SITE_SETTINGS_KEY); notifyDataChanged(); } catch {}
}

export function resetOrders() {
	try { localStorage.removeItem("19teen_orders"); localStorage.removeItem("19teen_last_order"); notifyDataChanged(); } catch {}
}

export function resetAllData() {
	try {
		localStorage.removeItem(PRODUCT_STORAGE_KEY);
		localStorage.removeItem("19teen_categories");
		localStorage.removeItem(SITE_SETTINGS_KEY);
		localStorage.removeItem("19teen_orders");
		localStorage.removeItem("19teen_last_order");
		localStorage.removeItem(COUPON_STORAGE_KEY);
		localStorage.removeItem(REVIEW_STORAGE_KEY);
		localStorage.removeItem("19teen_cart");
		notifyDataChanged();
	} catch {}
}

export function getCoupons(): Coupon[] {
	try {
		const raw = localStorage.getItem(COUPON_STORAGE_KEY);
		return raw ? JSON.parse(raw) : defaultCoupons;
	} catch { return defaultCoupons; }
}

export function saveCoupons(coupons: Coupon[]) {
	try {
		localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupons));
		notifyDataChanged();
	} catch {}
}

export function getReviews(): Review[] {
	try {
		const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
		return raw ? JSON.parse(raw) : defaultReviews;
	} catch { return defaultReviews; }
}

export function saveReviews(reviews: Review[]) {
	try {
		localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
		notifyDataChanged();
	} catch {}
}

export function getWishlist(): string[] {
	try {
		const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export function saveWishlist(ids: string[]) {
	try {
		localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
		notifyDataChanged();
	} catch {}
}

export function toggleWishlist(productId: string) {
	const current = getWishlist();
	const next = current.includes(productId) ? current.filter(id => id !== productId) : [...current, productId];
	saveWishlist(next);
	return next;
}

export function addReview(review: Review) {
	try {
		const reviews = getReviews();
		reviews.unshift(review);
		localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
		notifyDataChanged();
	} catch {}
}

export function saveOrder(order: Order) {
	try {
		const raw = localStorage.getItem("19teen_orders");
		const arr: Order[] = raw ? JSON.parse(raw) : [];
		arr.unshift(order);
		localStorage.setItem("19teen_orders", JSON.stringify(arr));
		notifyDataChanged();
	} catch {}
}

export function formatWhatsappMessage(settings: SiteSettings, order: Order) {
	return settings.whatsappMessage
		.replace(/{orderId}/g, order.id)
		.replace(/{total}/g, order.total.toLocaleString())
		.replace(/{siteName}/g, settings.siteName)
		.replace(/{name}/g, order.customer.name)
		.replace(/{address}/g, order.customer.address)
		.replace(/{city}/g, order.customer.city);
};

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

export function getOrders(): Order[] {
	try {
		const raw = localStorage.getItem("19teen_orders");
		return raw ? JSON.parse(raw) : [];
	} catch { return []; }
}

export function adminLogin(username: string, pw: string) {
	try {
		const settings = getSiteSettings();
		if (username === settings.adminUsername && pw === settings.adminPassword) {
			localStorage.setItem("19teen_admin", "1");
			return true;
		}
	} catch {}
	return false;
}

export function isAdminLoggedIn() { try { return localStorage.getItem("19teen_admin") === "1"; } catch { return false; } }
export function adminLogout() { try { localStorage.removeItem("19teen_admin"); } catch {} }

// keep types exported from types.ts for consumers
