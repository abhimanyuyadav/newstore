import AdminLayout from "./layout-client";
import { privateMetadata } from "@/lib/seo";
export const metadata = privateMetadata("Store Administration");
export default function Layout({ children }: { children: React.ReactNode }) { return <AdminLayout>{children}</AdminLayout>; }
