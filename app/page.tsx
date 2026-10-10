import PageClient from "./page-client";
import { pageMetadata } from "@/lib/seo";
export const metadata = {
  ...pageMetadata('Shop Clothing & Everyday Style', 'Discover clothing, accessories and everyday style at 9TEEN. Explore the latest collection and shop your favourite pieces.', '/'),
  title: { absolute: 'Shop Clothing & Everyday Style | 9TEEN' },
};
export default function Page() { return <PageClient />; }
