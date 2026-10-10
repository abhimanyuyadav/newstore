import PageClient from "./page-client";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata('About 9TEEN Collection Nepal', 'Get to know 9TEEN Collection, an online clothing store for shoppers in Nepal. Explore current styles, product details and prices in Nepalese rupees.', '/about');
export default function Page() { return <PageClient />; }
