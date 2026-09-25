# 9TEEN store

Next.js storefront and administration UI with server-side sessions, private carts, validated checkout, and Convex persistence (with an optional legacy Supabase adapter).

## Run locally

Use Node.js 22 or later. Run `npm ci`. Copy `.env.example` to `.env.local` and configure:

- `SESSION_SECRET`: at least 32 random characters. Generate locally with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `ADMIN_USERNAME` and a strong `ADMIN_PASSWORD`: server-only credentials.
- `STORE_BACKEND=local`: explicitly enables the local development JSON store. Optionally set `STORE_FILE` to an isolated absolute path.

Run `npm run dev`, then open http://localhost:3000. Admin sign-in is at /admin. There are no default admin credentials. An empty saved catalog remains empty; use Add Demo Product or the explicit catalog reset in the admin UI when desired.

## Production setup — required before rollout

1. Run `npx convex dev` to select the intended Convex team/project, then `npx convex deploy` to publish production functions and schema.
2. Generate a random `STORE_SERVER_SECRET` of at least 32 characters. Set it on the production Convex deployment and the Next.js host. This server-only secret protects all database and image upload functions; never use a `NEXT_PUBLIC_` prefix.
3. On the Next.js host, set `STORE_BACKEND=convex`, `CONVEX_URL` to the production deployment URL, `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `NEXT_PUBLIC_BASE_URL` to the HTTPS storefront origin. Product and category uploads use Convex file storage after admin authorization and accept PNG/JPEG/WebP/GIF files up to 2 MB.
4. Back up and explicitly migrate the current catalog/settings before switching traffic. Do not replace existing production data with demonstration fixtures. The old public Convex handlers in `convex/appData.ts` remain disabled.
5. If eSewa is used, configure `ESEWA_ENVIRONMENT`, `ESEWA_PRODUCT_CODE`, and `ESEWA_SECRET_KEY`. Complete a provider sandbox transaction before enabling real payments. Missing merchant configuration keeps eSewa unavailable.
6. Build with `npm run build`, then run `npm test`. Deploy the Next.js application to Vercel with the production environment above. Local JSON storage is for development only.

For the legacy Supabase adapter, apply `sql/migrations/secure_admin_storage.sql`, set `STORE_BACKEND=supabase`, `NEXT_PUBLIC_SUPABASE_URL`, and server-only `SUPABASE_SERVICE_ROLE_KEY`. Image uploads require public-read `product-images` and `category-images` buckets with writes restricted to the service role.

Old admin credentials were embedded in source/shared settings; replace them before rollout. Removing tracked environment/build/data files does not erase Git history. Review historical exposure separately; do not reuse an old exposed password. Existing customer records using the old unsalted demo hash cannot sign in through the new authentication endpoint. This repository has no automated password-recovery/email service; existing affected accounts require an identity-verified migration/recovery plan. The checked-in local data contained no customer accounts.

## Behavior and boundaries

- Admin and customer identities are validated on the server using signed, expiring HttpOnly cookies. Customer passwords use salted scrypt; hashes never appear in API responses.
- Carts and wishlists belong to the current browser. Login sessions and the most recent order are never read from globally shared visitor keys.
- Catalog/settings/reviews are published through filtered public reads. Customer/account/order data stays private. Bulk customer imports are deliberately disabled.
- Orders are created on the server using current catalog prices, available sizes/variants, and stock/category availability. Client totals and paid flags are ignored. A checkout request ID prevents duplicate submission within a session.
- Guest order access is tied to its cookie and transferred on sign-in/registration in the same browser. There is no public order-ID lookup exposing another customer's order. Older orders without an owner ID remain available to admins and need a reviewed ownership migration before appearing in customer history.
- Payment initiation uses signed eSewa ePay v2 fields. The return page queries the provider status from the server and only marks paid after matching merchant, order, amount, completion, and reference. Visiting the success URL alone cannot mark an order paid. See [eSewa's integration documentation](https://developer.esewa.com.np/pages/Epay).
- Provider calls time out. Missing configuration or persistence failures return errors rather than claiming a successful save. eSewa stays unavailable to shoppers until configured.
- Convex and Supabase writes use revision compare-and-swap with bounded retries. Local writes are serialized and atomically renamed within one server process.
- Rate limits are bounded in-memory limits per process. A distributed rate limiter or edge rule is still needed for robust protection across multiple instances.
- WhatsApp checkout prepares a message for the shopper to send. It does not automatically send email, WhatsApp messages, or confirm a payment.

## Checks

```sh
npm run lint
npm run build
npm test
npm audit
```

`lint` is the TypeScript check. `npm test` expects a completed production build and launches an isolated local server with a temporary store and generated test credentials. It exercises forged sessions, private data access, price tampering, checkout idempotency, public review filtering, registration/login/logout, and server-side order status updates. Unit tests cover token tampering/expiry, salted password hashing, cart variant/quantity behavior, and a standard HMAC test vector.

These checks do not validate a real Supabase project, existing policies, image bucket permissions, eSewa merchant credentials, or an actual payment. A clean dependency audit is not a claim that the entire system is vulnerability-free.
