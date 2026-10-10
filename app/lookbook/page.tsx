import PageClient from "./page-client";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata('Fashion Lookbook Nepal', 'Explore the 9TEEN fashion lookbook for shoppers in Nepal. View current clothing images, discover outfit ideas and open each product for sizes and prices.', '/lookbook');
export default function Page() { return <PageClient />; }
