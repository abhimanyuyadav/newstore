import type { Metadata } from "next";
import PageClient from "./page-client";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const query = await searchParams;
  const metadata = pageMetadata("Shop Clothing Online in Nepal", "Browse the 9TEEN clothing collection in Nepal. Compare prices in NPR and filter current products by category, size, colour and availability.", "/products");
  // Facets and internal searches remain usable but consolidate to the main catalog.
  if (Object.values(query).some(value => value !== undefined)) metadata.robots = { index: false, follow: true };
  return metadata;
}
export default function Page() { return <PageClient />; }
