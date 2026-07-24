
import { Product, Order, Category, SiteSettings, Coupon, Review, UserAccount } from "./types";

const PRODUCT_STORAGE_KEY = "9teen_products";
const CATEGORIES_STORAGE_KEY = "9teen_categories";
const SITE_SETTINGS_KEY = "9teen_site_settings";
const COUPON_STORAGE_KEY = "9teen_coupons";
const REVIEW_STORAGE_KEY = "9teen_reviews";
const WISHLIST_STORAGE_KEY = "9teen_wishlist";
const USER_ACCOUNTS_KEY = "9teen_user_accounts";
const USER_SESSION_KEY = "9teen_user_session";
const ADMIN_STORAGE_KEY = "9teen_admin";
const LEGACY_ADMIN_STORAGE_KEY = "19teen_admin";
export const DATA_CHANGED_EVENT = "9teen-data-changed";

const SHARED_STORAGE_KEYS = [
	PRODUCT_STORAGE_KEY,
	CATEGORIES_STORAGE_KEY,
	SITE_SETTINGS_KEY,
	COUPON_STORAGE_KEY,
	REVIEW_STORAGE_KEY,
	WISHLIST_STORAGE_KEY,
	USER_ACCOUNTS_KEY,
	USER_SESSION_KEY,
	"9teen_orders",
	"9teen_last_order",
	"9teen_cart",
];

let sharedHydrationPromise: Promise<void> | null = null;

function migrateLegacyStorageKeys() {
	if (typeof window === "undefined") return;

	try {
		const legacyAdminValue = localStorage.getItem(LEGACY_ADMIN_STORAGE_KEY);
		if (legacyAdminValue && !localStorage.getItem(ADMIN_STORAGE_KEY)) {
			localStorage.setItem(ADMIN_STORAGE_KEY, legacyAdminValue);
		}
		if (localStorage.getItem(ADMIN_STORAGE_KEY)) {
			localStorage.removeItem(LEGACY_ADMIN_STORAGE_KEY);
		}
	} catch {}
}

function notifyDataChanged() {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT));
		// Schedule refresh with small delay to avoid race conditions
		setTimeout(() => {
			void refreshFromSharedStorage();
		}, 100);
	}
}

async function refreshFromSharedStorage() {
	if (typeof window === "undefined") return;
	if (sharedHydrationPromise) return sharedHydrationPromise;

	sharedHydrationPromise = (async () => {
		try {
			const res = await fetch(`/api/storage`);
			if (!res.ok) {
				console.warn("Failed to fetch shared storage");
				return;
			}
			const store = await res.json() as Record<string, unknown>;
			
			// Update localStorage with all keys from storage
			for (const [key, value] of Object.entries(store)) {
				if (value !== null && value !== undefined) {
					try {
						localStorage.setItem(key, JSON.stringify(value));
					} catch (error) {
						console.warn(`Failed to set localStorage key ${key}:`, error);
					}
				}
			}
		} catch (error) {
			console.warn("Error refreshing from shared storage:", error);
		}
	})().finally(() => {
		sharedHydrationPromise = null;
	});

	return sharedHydrationPromise;
}

async function writeSharedValue(key: string, value: unknown) {
	if (typeof window === "undefined") return; // Only run on client

	try {
		const response = await fetch('/api/storage', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ key, value }),
		});
		
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.warn(`Failed to save ${key} to storage:`, errorData);
			return false;
		}
		
		return true;
	} catch (error) {
		console.warn(`Error writing shared value for ${key}:`, error);
		// Still fail gracefully - data is in localStorage
		return false;
	}
}

function getLocalValue<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}

function setLocalValue(key: string, value: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}

if (typeof window !== "undefined") {
	migrateLegacyStorageKeys();
	void refreshFromSharedStorage();
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
	adminUsername: "admin",
	adminPassword: "9Teen12@",
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

export function getCategories(): Category[] {
	try {
		const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
		if (!raw) return categories;
		const saved = JSON.parse(raw) as Category[];
		return saved.map(c => ({ ...categories.find(d => d.id === c.id) ?? c, ...c }));
	} catch {
		return categories;
	}
}

export function saveCategories(categoryList: Category[]) {
	try {
		setLocalValue(CATEGORIES_STORAGE_KEY, categoryList);
		void writeSharedValue(CATEGORIES_STORAGE_KEY, categoryList);
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
		setLocalValue(PRODUCT_STORAGE_KEY, products);
		void writeSharedValue(PRODUCT_STORAGE_KEY, products);
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
		setLocalValue(SITE_SETTINGS_KEY, settings);
		void writeSharedValue(SITE_SETTINGS_KEY, settings);
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
		setLocalValue(USER_ACCOUNTS_KEY, accounts);
		void writeSharedValue(USER_ACCOUNTS_KEY, accounts);
		notifyDataChanged();
	} catch {}
}

// Simple hash function for demo (NOT for production - use bcrypt in real app)
function simpleHash(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash).toString(16);
}

function validatePassword(password: string): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	if (password.length < 8) errors.push("Password must be at least 8 characters");
	if (!/[A-Z]/.test(password)) errors.push("Password must contain uppercase letter");
	if (!/[0-9]/.test(password)) errors.push("Password must contain number");
	if (!/[!@#$%^&*]/.test(password)) errors.push("Password must contain special character");
	return { valid: errors.length === 0, errors };
}

function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email) && email.length <= 254;
}

export function registerUser(input: { name: string; email: string; phone: string; password: string; address: string; city: string }) {
	try {
		// Validate inputs
		if (!input.name || input.name.length < 2 || input.name.length > 100) return null;
		if (!validateEmail(input.email)) return null;
		if (!input.phone || input.phone.length < 10 || input.phone.length > 20) return null;
		if (input.address.length > 500) return null;
		if (input.city.length > 100) return null;

		const passwordValidation = validatePassword(input.password);
		if (!passwordValidation.valid) return null;

		const accounts = getUserAccounts();
		const emailExists = accounts.some(account => account.email.toLowerCase() === input.email.toLowerCase());
		if (emailExists) return null;

		const newAccount: UserAccount = {
			id: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
			name: input.name.trim(),
			email: input.email.trim().toLowerCase(),
			phone: input.phone.trim(),
			password: simpleHash(input.password),
			address: input.address.trim(),
			city: input.city.trim(),
			createdAt: new Date().toISOString(),
		};

		accounts.push(newAccount);
		saveUserAccounts(accounts);
		setLocalValue(USER_SESSION_KEY, newAccount);
		void writeSharedValue(USER_SESSION_KEY, newAccount);
		notifyDataChanged();
		return newAccount;
	} catch {
		return null;
	}
}

export function loginUser(email: string, password: string) {
	try {
		// Validate inputs
		if (!validateEmail(email) || !password || password.length < 1) return null;

		const accounts = getUserAccounts();
		const account = accounts.find(item => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === simpleHash(password));
		if (!account) return null;

		// Create session with timestamp for expiry validation
		const sessionData = { ...account, sessionCreated: Date.now() };
		setLocalValue(USER_SESSION_KEY, sessionData);
		void writeSharedValue(USER_SESSION_KEY, sessionData);
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
		void writeSharedValue(USER_SESSION_KEY, null);
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
		saveOrders(getOrders());
		saveUserAccounts(getUserAccounts());
		saveWishlist(getWishlist());
		const cart = getLocalValue("9teen_cart", []);
		setLocalValue("9teen_cart", cart);
		void writeSharedValue("9teen_cart", cart);
		const lastOrder = getLocalValue("9teen_last_order", null);
		setLocalValue("9teen_last_order", lastOrder);
		void writeSharedValue("9teen_last_order", lastOrder);
		const session = getCurrentUser();
		if (session) {
			setLocalValue(USER_SESSION_KEY, session);
			void writeSharedValue(USER_SESSION_KEY, session);
		}
		notifyDataChanged();
	} catch {}
}

export function resetProducts() {
	try { 
		localStorage.removeItem(PRODUCT_STORAGE_KEY);
		void writeSharedValue(PRODUCT_STORAGE_KEY, null);
		notifyDataChanged(); 
	} catch {}
}

export function resetCategories() {
	try { 
		localStorage.removeItem(CATEGORIES_STORAGE_KEY);
		void writeSharedValue(CATEGORIES_STORAGE_KEY, null);
		notifyDataChanged(); 
	} catch {}
}

export function resetSiteSettings() {
	try { 
		localStorage.removeItem(SITE_SETTINGS_KEY);
		void writeSharedValue(SITE_SETTINGS_KEY, null);
		notifyDataChanged(); 
	} catch {}
}

export function resetOrders() {
	try { 
		localStorage.removeItem("9teen_orders");
		localStorage.removeItem("9teen_last_order");
		void writeSharedValue("9teen_orders", null);
		void writeSharedValue("9teen_last_order", null);
		notifyDataChanged(); 
	} catch {}
}

export function resetAllData() {
	try {
		const keysToDelete = [
			PRODUCT_STORAGE_KEY,
			CATEGORIES_STORAGE_KEY,
			SITE_SETTINGS_KEY,
			"9teen_orders",
			"9teen_last_order",
			COUPON_STORAGE_KEY,
			REVIEW_STORAGE_KEY,
			WISHLIST_STORAGE_KEY,
			USER_ACCOUNTS_KEY,
			USER_SESSION_KEY,
			"9teen_cart"
		];
		keysToDelete.forEach(key => {
			localStorage.removeItem(key);
			void writeSharedValue(key, null);
		});
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
		setLocalValue(COUPON_STORAGE_KEY, coupons);
		void writeSharedValue(COUPON_STORAGE_KEY, coupons);
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
		setLocalValue(REVIEW_STORAGE_KEY, reviews);
		void writeSharedValue(REVIEW_STORAGE_KEY, reviews);
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
		setLocalValue(WISHLIST_STORAGE_KEY, ids);
		void writeSharedValue(WISHLIST_STORAGE_KEY, ids);
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
		setLocalValue(REVIEW_STORAGE_KEY, reviews);
		void writeSharedValue(REVIEW_STORAGE_KEY, reviews);
		notifyDataChanged();
	} catch {}
}

export function saveOrders(orders: Order[]) {
	try {
		setLocalValue("9teen_orders", orders);
		void writeSharedValue("9teen_orders", orders);
		notifyDataChanged();
	} catch {}
}

export function saveOrder(order: Order) {
	try {
		const raw = localStorage.getItem("9teen_orders");
		const arr: Order[] = raw ? JSON.parse(raw) : [];
		arr.unshift(order);
		saveOrders(arr);
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
		const raw = localStorage.getItem("9teen_orders");
		return raw ? JSON.parse(raw) : [];
	} catch { return []; }
}

export function adminLogin(username: string, pw: string) {
	try {
		// Validate inputs
		if (!username || !pw || username.length < 1 || pw.length < 1) return false;

		const settings = getSiteSettings();
		// Check if admin credentials are configured
		if (!settings.adminUsername || !settings.adminPassword) {
			console.warn("Admin credentials not configured");
			return false;
		}

		if (username === settings.adminUsername && pw === settings.adminPassword) {
			// Store session with timestamp
			localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({ authenticated: true, timestamp: Date.now() }));
			localStorage.removeItem(LEGACY_ADMIN_STORAGE_KEY);
			return true;
		}
	} catch (error) {
		console.warn("Admin login error");
	}
	return false;
}

export function isAdminLoggedIn() {
	try {
		const token = localStorage.getItem(ADMIN_STORAGE_KEY);
		if (!token) return localStorage.getItem(LEGACY_ADMIN_STORAGE_KEY) === "1";

		try {
			const parsed = JSON.parse(token);
			// Check if session is still valid (24 hours)
			const sessionTimeout = 24 * 60 * 60 * 1000;
			const isExpired = Date.now() - parsed.timestamp > sessionTimeout;
			if (isExpired) {
				localStorage.removeItem(ADMIN_STORAGE_KEY);
				return false;
			}
			return parsed.authenticated === true;
		} catch {
			return false;
		}
	} catch {
		return false;
	}
}
export function adminLogout() {
	try {
		localStorage.removeItem(ADMIN_STORAGE_KEY);
		localStorage.removeItem(LEGACY_ADMIN_STORAGE_KEY);
		notifyDataChanged();
	} catch {}
}

// keep types exported from types.ts for consumers
