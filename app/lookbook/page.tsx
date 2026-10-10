import PageClient from "./page-client";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata('Fashion Lookbook', 'Explore the 9TEEN lookbook for everyday outfit inspiration. Browse current product images and discover pieces from the collection.', '/lookbook');
export default function Page() { return <PageClient />; }
