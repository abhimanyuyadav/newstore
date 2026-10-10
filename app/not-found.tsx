import Link from "next/link";
export default function NotFound() {
  return <main className="store-shell py-20 text-center"><h1 className="text-3xl font-bold mb-4">Page not found</h1><p className="mb-6">This page or product is unavailable or has been removed.</p><Link href="/products" className="store-button">Browse products</Link></main>;
}
