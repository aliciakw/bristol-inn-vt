# Architecture decisions

This is the compact, durable record of boundaries that should survive tool and agent changes. Update it when a decision changes; do not append task logs or implementation diaries.

## System shape

- Astro 6 is static-first and deployed to Cloudflare Workers. Keep public pages prerendered unless a feature requires a runtime route.
- React islands are reserved for interactive room search and booking UI; ordinary content and layout remain Astro components.
- Sanity is the content system. The Studio is a separate app in `studio-bristol-inn-vt/`.
- Hostaway owns listings, rates, capacity, amenities, photos, and availability. Access it only through `src/lib/hostaway.ts`.
- `src/lib/rooms.ts` is the join boundary: Sanity may override editorial room names, floor, and special instructions using Hostaway IDs, but must not become the availability or pricing authority.
- External dependencies belong behind small wrappers in `src/lib/` so they remain replaceable.

## Rendering and data behavior

- Fail builds when required Hostaway or Sanity content cannot be fetched; Cloudflare should retain the last successful deployment instead of publishing incomplete pages.
- Room detail routes are stable Hostaway-ID URLs. Preserve the legacy redirect map in `astro.config.mjs` when changing routes.
- Availability is checked at runtime through `/api/rooms/availability`; the route validates dates and guest counts before calling Hostaway.
- Content previews use authenticated Sanity draft data. Never expose server tokens to browser bundles.
- Remote images are restricted in `astro.config.mjs`; add explicit hosts instead of permitting arbitrary domains.

## Deployment and security

- GitHub Actions builds and deploys the site; Sanity Studio can request that workflow through `/api/deploy`.
- Keep secrets server-only. Only variables intentionally safe for the browser use the `PUBLIC_` prefix.
- Exact environment names and deployment setup live in `Readme.md` and `src/lib/env.ts`; do not duplicate their full inventory here.
- The booking flow redirects to the Hostaway-hosted HolidayFuture checkout. This project does not process payments or store payment data.

## Quality boundaries

- Strict TypeScript, accessible semantics, canonical metadata, sitemap/robots support, and mobile-first rendering are architectural requirements.
- Use `src/components/ui/` primitives and the `mobile`/`tablet`/`desktop` breakpoint names.
- Add or update focused tests for normalization, joins, security-sensitive routes, and business rules.
