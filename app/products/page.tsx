import type { Metadata } from "next";
import PageClient from "./page-client";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const query = await searchParams;
  const metadata = pageMetadata("Shop the Collection", "Browse the 9TEEN collection. Filter clothing and accessories by category, size, colour and price to find your next favourite.", "/products");
  // Facets and internal searches remain usable but consolidate to the main catalog.
  if (Object.values(query).some(value => value !== undefined)) metadata.robots = { index: false, follow: true };
  return metadata;
}
export default function Page() { return <PageClient />; }
