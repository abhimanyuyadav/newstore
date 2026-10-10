# 9TEEN search setup

The preferred production origin is `https://9teen-collection.vercel.app`.
Set `SEO_SITE_URL` to that HTTPS origin; never use `VERCEL_URL` for canonicals.
`NEXT_PUBLIC_BASE_URL` must also match the production storefront because the existing
application uses it for origin checks and payment return URLs.

## Implementation

### Nepal search audience

The owner confirmed Nepal as the target market. Public titles, descriptions and
visible copy now describe online clothing shopping in Nepal; the document language
is `en-NP` and Open Graph locale is `en_NP` (the content remains English).

| Search intent | Destination |
| --- | --- |
| 9TEEN Collection Nepal; online clothing shopping in Nepal | Homepage |
| Shop clothing online in Nepal; clothing prices in NPR | Product catalog |
| Product name + in Nepal; product name + online Nepal | The actual product page |
| Kurtis online in Nepal; orange kurti in Nepal | Existing kurti product, linked from the homepage only while a kurti is available |
| Fashion lookbook Nepal; about 9TEEN Collection Nepal | Lookbook and about pages |

These are relevance targets, not measured search volumes or ranking guarantees.
Product prices and descriptions remain tied to the catalog. No fabricated fabric,
shipping, location, review, or discount claims are added. Do not add keyword lists,
hidden text, unsupported city pages, or meta-keywords tags. Google does not use the
meta-keywords tag for ranking. Expand category content when there is a real range
of products to support it.

### Technical setup

- The root layout uses Next.js metadata and `verification.google` from
  `GOOGLE_SITE_VERIFICATION`. Keep the real token in Vercel environment variables;
  never commit it or use a placeholder value.
- Public route wrappers export page-specific metadata. The existing client views
  retain filtering, cart, wishlist, reviews, account flows, and visual styles.
- A request-scoped public catalog supplies initial HTML and client hydration.
  Only catalog fields, approved reviews, and sanitized settings are serialized.
  Customer records, orders, and administrator credentials are never included.
- `/sitemap.xml` reads the actual catalog and contains `/`, `/products`, `/about`,
  `/lookbook`, and current product detail routes. There are no fabricated dates.
  Missing products call `notFound()` before metadata is streamed.
- `/robots.txt` allows public crawling, blocks `/api/`, and references the
  production sitemap. Private HTML pages use noindex rather than a robots block,
  so crawlers can see the directive. Authentication remains the access boundary.
- Search/filter URLs consolidate to `/products` and are noindex, follow.
- Preview environments and noncanonical hosts receive noindex headers. Preview
  and admin sitemaps are empty. The confirmed old production aliases redirect
  HTML GET/HEAD requests to the canonical origin in one hop, preserving the path
  and query. Deployment-specific URLs stay available for pre-release testing.
- Product JSON-LD uses actual catalog names, descriptions, images, prices, NPR,
  and availability. No ratings, reviews, brand, return policy, or business address
  are fabricated. Products without an announced positive price omit offers.
- Existing image assets are reused, additional images use Next Image, primary
  product images are prioritized, and the Apple icon is derived from the favicon.
  The existing font uses next/font with display swap and fallback metric adjustment.

## Validation

Run `npm ci`, `npm run lint` (TypeScript checking), `npm run build`, then
`npm test`. `tests/seo.test.cjs` exercises production HTTP responses against an
isolated local catalog, plus preview and admin environments. It checks initial
HTML, unique metadata, canonical URLs, product structured data escaping, private
data exclusion, real 404s, alias redirects, sitemap entries, and noindex behavior.
The existing suite checks authentication, cart, payment signing, order handling,
and store/admin boundaries. Never run tests against production storage.

Use a production deployment with `--skip-domain` for testing real environment
configuration before assigning the public aliases. Do not disable deployment
protection; use authenticated `vercel curl` where required. Check the preferred
domain after promotion because noncanonical deployment URLs deliberately return
an X-Robots-Tag noindex header.

## Google Search Console

1. Select or add the URL-prefix property `https://9teen-collection.vercel.app/`.
2. Under ownership verification, choose HTML tag. Store the exact `content` value
   as `GOOGLE_SITE_VERIFICATION` for this Vercel project's production environment.
3. Deploy. Confirm exactly one matching meta tag is in the homepage's rendered
   HTML. Click Verify in Search Console. Keep the environment variable afterward.
4. In Sitemaps, submit `https://9teen-collection.vercel.app/sitemap.xml`.
5. In URL Inspection, inspect the homepage, run Test live URL, then Request
   indexing. Repeat for important product pages if needed.
6. Review Page indexing and Performance for actual Google results. Submission and
   verification do not establish that a page is indexed or guarantee a ranking.

Official references:
- https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- https://support.google.com/webmasters/answer/9008080
- https://support.google.com/webmasters/answer/7451001
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl

Field Core Web Vitals and search positions require real traffic and Search Console
data; a successful build or a local viewport check is not a field performance score.
