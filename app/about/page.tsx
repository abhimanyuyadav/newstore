import PageClient from "./page-client";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata('Our Story', 'Get to know 9TEEN and our approach to bold, comfortable everyday style. Explore the collection and find your next favourite.', '/about');
export default function Page() { return <PageClient />; }
