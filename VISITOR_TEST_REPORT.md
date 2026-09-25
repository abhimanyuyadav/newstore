# Visitor verification — 2026-09-25

Tested the local store while signed out as a customer, with the five reference drafts. No real payment, external message, or customer order was submitted.

Fixed:
- Draft and disabled-category products show Price coming soon consistently on cards, detail pages and the wishlist.
- Product details display category names instead of storage IDs and use customer-facing availability text.
- Discount savings appear only for an enabled, positive discount.
- The special-offer banner is hidden when no purchasable discounted products exist.
- Clear filters removes URL collection/search/category constraints, so visitors can recover from an empty sale collection.
- Empty checkout shows an empty-cart message and browse link instead of requesting delivery information for a zero-item order.
- Wishlist removal buttons have accessible names.

Verified in browser:
- Shop navigation, search returning one matching watch, wishlist save and removal, empty cart.
- Empty checkout recovery.
- Sale collection clear action returns all five products.
- Five cards display pending prices; detail purchase button remains disabled.
- 390px mobile navigation and stock filters; no horizontal document overflow on the catalog.
- Homepage has no broken loaded images or empty-sale promotion.

Build passed. All six automated tests passed, covering guest checkout/account isolation, cart quantities, session validation, payment signing and sales calculations. Added an API regression assertion that out-of-stock products cannot be ordered.

Limit: a purchasable-item browser checkout cannot be completed with the current draft-only catalog. Guest order creation is covered using disposable test data on a separate local test server. Production deployment and real payment-provider transactions were not tested.
