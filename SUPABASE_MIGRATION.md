# Storage migration

The app's canonical store is the existing `admin_storage` key/value table, accessed exclusively by the server. See README.md for required configuration and rollout steps.

Apply `sql/migrations/secure_admin_storage.sql` after backing up and selecting the intended project. Never apply a migration to a guessed project. Configure the service-role credential only in the server environment.

Do not import demo-hashed passwords or browser session/cart/wishlist keys into shared storage. Legacy tables/files may contain unverified payment flags and orders with no authenticated owner. Review those records before moving them into the canonical store; do not automatically infer payment completion or account ownership from an email field.

The old generic table migration script is retired because it wrote a different schema than the live storefront consumed.
