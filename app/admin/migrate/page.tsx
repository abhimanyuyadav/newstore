import Link from "next/link";
export default function MigrationPage() {
  return <div className="p-8 max-w-2xl"><h1 className="text-2xl font-bold mb-4">Data migration</h1><p className="text-white/70 mb-4">Browser account and order imports are disabled to protect customer identities and payment records. Existing data must be migrated by the site owner after a backup and ownership review.</p><Link href="/admin/products" className="underline">Manage products</Link></div>;
}
