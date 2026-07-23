export interface Product {
  id: string; name: string; category: string; price: number;
  originalPrice?: number; image: string; description: string;
  sizes: string[]; badge?: string; featured: boolean; inStock: boolean;
  discountEnabled?: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  trending: boolean;
  variants?: { name: string; values: string[] }[];
}
export interface CartItem { id: string; name: string; price: number; image: string; size: string; quantity: number; variantSelections?: Record<string, string>; }
export interface Order {
  id: string; items: CartItem[];
  customer: { name: string; phone: string; email: string; address: string; city: string; };
  total: number; status: "pending"|"processing"|"shipped"|"delivered"|"cancelled";
  paymentStatus: "pending"|"paid"|"failed";
  paymentMethod: "esewa"|"whatsapp";
  whatsappMessage?: string;
  createdAt: string;
}
export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  createdAt: string;
}
export interface SiteSettings {
  siteName: string;
  tagline: string;
  heroTopLabel: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroImage: string;
  heroButtonLabel: string;
  heroExploreButtonLabel: string;
  navLabelShop: string;
  navLabelCategories: string;
  navLabelCollections: string;
  navLabelTrackOrder: string;
  navLabelAbout: string;
  navLabelLogin: string;
  promoText: string;
  searchPlaceholder: string;
  sectionShopByCategoryLabel: string;
  sectionShopByCategoryTitle: string;
  sectionProductsEnabled: boolean;
  sectionProductsLabel: string;
  sectionProductsTitle: string;
  sectionNewArrivalsEnabled: boolean;
  sectionNewArrivalsLabel: string;
  sectionNewArrivalsTitle: string;
  sectionBestSellersEnabled: boolean;
  sectionBestSellersLabel: string;
  sectionBestSellersTitle: string;
  sectionTrendingEnabled: boolean;
  sectionTrendingLabel: string;
  sectionTrendingTitle: string;
  sectionFeaturedEnabled: boolean;
  sectionFeaturedLabel: string;
  sectionFeaturedTitle: string;
  sectionSaleEnabled: boolean;
  sectionSaleLabel: string;
  sectionSaleTitle: string;
  sectionSpecialOfferEnabled: boolean;
  sectionSpecialOfferLabel: string;
  sectionSpecialOfferTitle: string;
  sectionSpecialOfferButtonLabel: string;
  sectionOrder: string[];
  esewaQrImage: string;
  whatsappNumber: string;
  whatsappMessage: string;
  notificationEmail: string;
  emailSubject: string;
  emailBody: string;
  adminUsername: string;
  adminPassword: string;
  footerContactEmail: string;
  footerContactPhone: string;
  footerContactLocation: string;
  footerDeveloperText: string;
  footerDeveloperLink: string;
  footerDeveloperLinkLabel: string;
  footerMiddleText: string;
  footerWhatsAppButtonLabel: string;
  footerUpdatedDate: string;
  designImages: string[];
}
export interface Category { id: string; name: string; emoji: string; enabled: boolean; subcategories?: string[]; }
export interface Coupon { id: string; code: string; discount: number; active: boolean; description?: string; }
export interface Review { id: string; productId: string; name: string; rating: number; comment: string; status: "pending"|"approved"|"rejected"; date: string; }
