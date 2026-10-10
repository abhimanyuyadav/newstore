import PageClient from "./page-client";
import { absoluteUrl, DEFAULT_DESCRIPTION, jsonLd, pageMetadata, SITE_NAME } from "@/lib/seo";
export const metadata = {
  ...pageMetadata('Online Fashion Store in Nepal', DEFAULT_DESCRIPTION, '/'),
  title: { absolute: '9TEEN Collection | Online Fashion Store in Nepal' },
};
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": absoluteUrl('/#website'), name: SITE_NAME, alternateName: "9TEEN", url: absoluteUrl('/'), inLanguage: "en-NP", publisher: { "@id": absoluteUrl('/#store') } },
      { "@type": "OnlineStore", "@id": absoluteUrl('/#store'), name: SITE_NAME, alternateName: "9TEEN", url: absoluteUrl('/'), logo: absoluteUrl('/favicon.png'), description: DEFAULT_DESCRIPTION },
    ],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} /><PageClient /></>;
}
