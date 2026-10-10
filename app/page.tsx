import PageClient from "./page-client";
import { DEFAULT_DESCRIPTION, pageMetadata } from "@/lib/seo";
export const metadata = {
  ...pageMetadata('Online Clothing Shopping in Nepal', DEFAULT_DESCRIPTION, '/'),
  title: { absolute: 'Online Clothing Shopping in Nepal | 9TEEN' },
};
export default function Page() { return <PageClient />; }
