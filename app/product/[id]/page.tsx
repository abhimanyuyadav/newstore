import { notFound } from "next/navigation";
import PageClient from "./page-client";
import { getPublicCatalog } from "@/lib/server/public-catalog";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";
type Props = { params: Promise<{ id: string }> };
async function productFor(params: Props["params"]) {
  const { id } = await params;
  const catalog = await getPublicCatalog();
  const product = catalog.products.find(item => item.id === id);
  if (!product) notFound();
  return { product, catalog };
}
export async function generateMetadata({ params }: Props) {
  const { product } = await productFor(params);
  const name = product.name.trim();
  const price = product.price > 0 ? ` Price: NPR ${new Intl.NumberFormat("en-NP").format(product.price)}.` : "";
  const details = product.description.trim() || "View available sizes and current availability at 9TEEN Collection.";
  const description = `Shop ${name} online in Nepal.${price} ${details}`;
  const snippet = description.length > 180 ? `${description.slice(0, 177).replace(/\s+\S*$/, "")}…` : description;
  return pageMetadata(`${name} in Nepal`, snippet, `/product/${encodeURIComponent(product.id)}`, product.image || undefined);
}
export default async function Page({ params }: Props) {
  const { product, catalog } = await productFor(params);
  const url = absoluteUrl(`/product/${encodeURIComponent(product.id)}`);
  const available = product.inStock && catalog.categories.find(category => category.id === product.category)?.enabled !== false;
  const schema = {
    "@context": "https://schema.org", "@type": "Product", name: product.name,
    description: product.description, url,
    ...(product.image ? { image: [absoluteUrl(product.image)] } : {}),
    ...(product.price > 0 ? { offers: { "@type": "Offer", url, price: product.price, priceCurrency: "NPR", availability: `https://schema.org/${available ? "InStock" : "OutOfStock"}` } } : {}),
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} /><PageClient /></>;
}
