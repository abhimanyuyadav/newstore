import type { Category, Product, Review, SiteSettings } from "./types";
export interface PublicCatalog {
  products: Product[];
  categories: Category[];
  settings: SiteSettings;
  reviews: Review[];
}

// Keep context identity stable when refreshes or unrelated cart events carry no
// catalog changes, while still publishing edits to any public catalog field.
export function reconcilePublicCatalog(current: PublicCatalog, next: PublicCatalog): PublicCatalog {
  return JSON.stringify(current) === JSON.stringify(next) ? current : next;
}
