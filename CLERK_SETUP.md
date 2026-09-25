# Clerk / Google sign-in rollout

The Clerk integration is deployed to both preview sites but not activated on either live site. Existing production authentication remains the default until production setup and browser verification finish.

## Test deployments (September 25, 2026)

- Store login: https://9teen-blzu9fk4h-abhimanyuyadav-6285s-projects.vercel.app/login
- Admin login: https://9teen-store-admin-bvyboj4ey-abhimanyuyadav-6285s-projects.vercel.app/admin
- Clerk application: 9TEEN Store, development instance `premium-wildcat-5141.clerk.accounts.dev`; Google and email enabled.
- Both previews use the separate Convex development deployment `marvelous-porpoise-883`. They do not use the production catalog database.
- Admin access is restricted to the verified owner email `avi202869@gmail.com`. Customer sign-up cannot grant admin access.
- Clerk keys are scoped to Vercel Preview, with the secret stored as a Secret variable. They are not included in the downloadable build or source.
- Preview session origins are restricted to the deployment and branch hosts supplied by Vercel.

Production still needs an owned custom domain and production Google OAuth configuration. The existing `vercel.app` addresses cannot supply the DNS records Clerk requires. Browser OAuth verification remains pending; passing automated tests does not establish that Google sign-in has completed successfully.

## Configuration

Use NEXT_PUBLIC_AUTH_PROVIDER=clerk only on a deployment configured with its corresponding NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and server-only CLERK_SECRET_KEY. On the admin project also configure CLERK_ADMIN_EMAILS with the exact authorized emails. An empty list denies everyone. Admin authorization requires a verified email from Clerk; client metadata and customer sign-up cannot grant access. Keep APP_SURFACE and each project's NEXT_PUBLIC_BASE_URL as configured for the separate deployments.

Enable Google sign-in/sign-up in Clerk. For production, configure an owned domain and the Google OAuth client in accordance with Clerk's deployment guide. The two current vercel.app domains have not been configured as production Clerk domains. Separate Clerk applications can keep login sessions independent; alternatively, use one correctly configured application on an owned storefront domain and its admin subdomain. Do not assume production keys work on arbitrary Vercel preview domains.

Official setup: https://clerk.com/docs/guides/development/deployment/production
Google setup: https://clerk.com/docs/guides/configure/auth-strategies/social-connections/google

## Account and order continuity

A verified Clerk primary email can link an existing legacy customer profile while preserving its customer ID, delivery fields, and order ownership. An existing Clerk ID takes priority over email matching. A profile already linked to a different Clerk identity is not relinked by email. Password hashes are removed when a legacy profile is linked. Order access remains based on owner ID, never on the email supplied at checkout. Guest orders transfer only from the same browser's cryptographically signed guest cookie. Clerk mode ignores old signed account cookies and retains guest cookies solely for guest checkout.

While Clerk mode is enabled, the old password login/register API endpoints are disabled. Logout revokes the Clerk session. The old provider remains in the source for a controlled rollout, but reverting it after users migrate requires an account recovery plan; do not assume removed password hashes can be recovered.

## Verification before activation

Run npm run lint, npm run build, then npm test. Clerk-specific tests cover verified admin allowlisting, account ID preservation, guest ownership transfer, logout revocation, and rejection of legacy account cookies. These use a mocked Clerk SDK and do not prove Google OAuth works.

On configured test deployments, sign in with an authorized administrator and a normal Google customer. Check admin denial for the customer, product save/readback on the store, account history after guest checkout, logout, and session isolation. Only then activate the matching production keys and promote both deployments. No Clerk keys or Google OAuth credentials belong in source control.
