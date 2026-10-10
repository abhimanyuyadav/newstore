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
  const { product, catalog } = await productFor(params);
  const name = product.name.trim();
  const price = product.price > 0 ? ` Price: NPR ${new Intl.NumberFormat("en-NP").format(product.price)}.` : "";
  const category = catalog.categories.find(item => item.id === product.category)?.name;
  const sizes = product.sizes.filter(Boolean).join(", ");
  const details = product.description.trim().replace(/\s+/g, " ") || [category ? `Explore ${category.toLowerCase()} at 9TEEN Collection.` : "Explore 9TEEN Collection.", sizes ? `Sizes: ${sizes}.` : "Check current availability."].join(" ");
  const description = `Shop ${name} online in Nepal.${price} ${details}`;
  const snippet = description.length > 180 ? `${description.slice(0, 177).replace(/\s+\S*$/, "")}…` : description;
  return pageMetadata(`${name} in Nepal`, snippet, `/product/${encodeURIComponent(product.id)}`, product.image || undefined);
}
export default async function Page({ params }: Props) {
  const { product, catalog } = await productFor(params);
  const url = absoluteUrl(`/product/${encodeURIComponent(product.id)}`);
  const available = product.inStock && catalog.categories.find(category => category.id === product.category)?.enabled !== false;
  const category = catalog.categories.find(category => category.id === product.category)?.name;
  const schema = {
    "@context": "https://schema.org", "@type": "Product", name: product.name,
    description: product.description, url,
    ...(category ? { category } : {}),
    ...(product.sizes.length ? { size: product.sizes } : {}),
    ...(product.variants?.length ? { additionalProperty: product.variants.map(variant => ({ "@type": "PropertyValue", name: variant.name, value: variant.values.join(", ") })) } : {}),
    ...(product.image ? { image: [absoluteUrl(product.image)] } : {}),
    ...(product.price > 0 ? { offers: { "@type": "Offer", url, price: product.price, priceCurrency: "NPR", availability: `https://schema.org/${available ? "InStock" : "OutOfStock"}`, seller: { "@type": "OnlineStore", "@id": absoluteUrl('/#store'), name: "9TEEN Collection", url: absoluteUrl('/') } } } : {}),
  };
  const breadcrumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "9TEEN Collection", item: absoluteUrl('/') },
    { "@type": "ListItem", position: 2, name: "Shop clothing", item: absoluteUrl('/products') },
    { "@type": "ListItem", position: 3, name: product.name.trim(), item: url },
  ] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} /><PageClient /></>;
}
