import type { Category, Product, Review, SiteSettings } from "./types";
export interface PublicCatalog {
  products: Product[];
  categories: Category[];
  settings: SiteSettings;
  reviews: Review[];
}
