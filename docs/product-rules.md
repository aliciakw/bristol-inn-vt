# Product and business rules

This file records guest-facing rules that are easy to lose during refactors. Keep it about current behavior, not aspirations or task history.

## Product scope

- Guests can browse rooms, inspect room details, search dates and party size, and continue to Hostaway's HolidayFuture checkout.
- Hostaway is read-only from this application. Booking completion and payments occur on Hostaway.
- Public marketing and informational content is managed in Sanity; there are no guest accounts or site-local payment flows.

## Rooms and availability

- A room's stable identity is its numeric Hostaway listing ID.
- Hostaway owns base price, capacity, bedrooms, bathrooms, amenities, photos, dog policy, and calendar availability.
- Sanity room records join by `hostawayId` and may supply the editorial name, floor, and special instructions.
- Room photos are ordered by Hostaway `sortOrder` and limited to six in the normalized room model.
- Search accepts ISO dates (`YYYY-MM-DD`), requires checkout after check-in, and accepts 1–20 guests.
- Eligibility filters by capacity. Pet searches include only dog-friendly rooms; ground-floor searches include only rooms whose CMS floor is 1.
- If a room's calendar request fails, report it as unavailable; do not guess availability.
- Preserve check-in, checkout, guest count, optional price, and pet selection when linking from search results to a room and onward to checkout.

## Content and routing

- Sanity page slugs map to public routes; homepage, contact, FAQ, rooms, preview, and API routes have dedicated implementations.
- Preserve canonical URLs and legacy redirects when renaming pages.
- Images require meaningful alt text in CMS-backed types and components; decorative images should use empty alt text intentionally.

## Non-goals unless explicitly approved

- Embedded or site-local payment processing.
- Guest authentication/accounts.
- Writing booking or availability mutations back to Hostaway.
- Silently publishing partial CMS or listing data after a required build-time fetch fails.
