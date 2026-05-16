# Phase 2: Integrations & Core Data - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect to Hostaway API and Prismic CMS; replace all placeholder pages with real data-driven content. Deliver static room listing and detail pages from Hostaway data, a Prismic-powered homepage with hero carousel, and a generic Prismic page template for about/contact-info pages.

**Not in this phase:** Date picker, availability API, booking flow (Phase 3); contact form submission/email backend (Phase 4); image performance tuning to Web Vitals targets (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Room Listing Cards
- **D-01:** Room listing card shows: one thumbnail photo, room name, `"From $X / night"` rate, and top 3 amenity badges (e.g., "WiFi", "Hot Tub", "Water View").
- **D-02:** Rate formatted as `"From $X / night"` — pull base nightly rate from Hostaway response.
- **D-03:** Amenity badges: show the first 3 amenities returned by Hostaway for the room.

### Room Detail Pages
- **D-04:** Room detail page shows: photo gallery (up to 6 photos), full text description, all amenities listed, and nightly rate.
- **D-05:** Static generation via `getStaticPaths()` — all rooms fetched from Hostaway at build time, one page per room.

### Build Failure Handling
- **D-06:** If Hostaway API fails at build time → **fail the build**. Cloudflare keeps the previous successful deployment; no stale or broken rooms page goes live.
- **D-07:** If Prismic CMS fails at build time → **fail the build**. Same rationale: better a failed build than a broken homepage.

### Prismic Schema
- **D-08:** Homepage uses a dedicated `homepage` Prismic document type (not a generic page). Fields:
  - `hero_images` — repeatable group of image fields (3–5 images for the carousel)
  - `body` — Slice Zone with at least two slice types: `RichText` and `ImageBlock` (image + optional caption, with layout options)
  - `cta_label` — text field
  - `cta_url` — link field
- **D-09:** Generic pages use a separate `page` Prismic document type. Fields:
  - `title` — title field
  - `body` — same Slice Zone as homepage (`RichText` + `ImageBlock` slices)
  - `meta_description` — text field (for SEO)
- **D-10:** Page URL is determined by the Prismic document slug (e.g., slug `about` → `/about`).
- **D-11:** Prismic draft preview works via Cloudflare PR preview deployments — the preview URL passes a `token` query param that signals Prismic to return draft content.

### Homepage Hero Carousel
- **D-12:** Hero carousel: 3–5 images cycling with JavaScript fade transitions. Client-side JS only (no server logic). Images from the `hero_images` Prismic group field.

### Photo Strategy
- **D-13:** All images (Hostaway room photos + Prismic content images) use Astro's `<Image>` component with remote URLs. Optimized, resized, and converted to WebP at build time.
- **D-14:** Add both Hostaway and Prismic CDN domains to `astro.config.mjs` image allowlist (`image.domains` or `image.remotePatterns`).
- **D-15:** Thumbnail size on listing card: 600×400px. Gallery photos on detail page: 1200×800px max. Astro `<Image>` handles these via `width`/`height` props.

### API Wrapper Pattern
- **Claude's Discretion:** Structure the Hostaway API client as a typed wrapper in `src/lib/hostaway.ts` that exposes `getRooms()` and `getRoom(id)` functions. The planner should design the interface; implementation detail is Claude's call.
- **Claude's Discretion:** Structure the Prismic client as a typed wrapper in `src/lib/prismic.ts` exposing `getHomepage()` and `getPage(slug)` functions.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Foundation
- `.planning/PROJECT.md` — Core value, scope constraints, key decisions (especially "Hostaway read-only + external redirect" and "Draft content in previews")
- `.planning/REQUIREMENTS.md` — Full requirement list; Phase 2 requirements are ROOM-01 through ROOM-03, CONTENT-01 through CONTENT-04, CONTENT-08
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, inputs, outputs, and risks

### Codebase Starting Points
- `src/layouts/BaseLayout.astro` — Base layout with title/description props; extend for SEO meta tags in this phase
- `src/pages/rooms.astro` — Placeholder to replace with `getStaticPaths()` + Hostaway data
- `src/pages/index.astro` — Placeholder to replace with Prismic homepage content
- `src/lib/env.ts` — Existing env validation scaffold (HOSTAWAY_API_KEY, PRISMIC_TOKEN already defined)
- `astro.config.mjs` — Must add `image.domains` or `image.remotePatterns` for Hostaway + Prismic CDN URLs
- `CLAUDE.md` — Project constraints: wrap dependencies for swappability, composability over configuration, strict TypeScript, mobile-first Tailwind

### No external ADRs — decisions fully captured above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/layouts/BaseLayout.astro` — Already has `title` and `description` props; slot-based; extend meta tags here for SEO
- `src/components/Header.astro`, `Footer.astro`, `Navigation.astro` — Already composed in BaseLayout; no changes needed in Phase 2
- `src/lib/env.ts` — `validateEnv()` already validates HOSTAWAY_API_KEY and PRISMIC_TOKEN; call this at startup of new lib clients

### Established Patterns
- Tailwind responsive grid already used in `rooms.astro`: `grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3` — reuse this for the real room grid
- Custom breakpoint names (`tablet:`, `desktop:`) are defined in `tailwind.config.mjs` — use these, not `md:` / `lg:`
- TypeScript strict mode throughout — all Hostaway and Prismic API responses must be typed

### Integration Points
- `src/pages/rooms.astro` → `src/lib/hostaway.ts` (new) — `getStaticPaths()` calls `getRooms()`
- `src/pages/rooms/[id].astro` (new) → `src/lib/hostaway.ts` — `getStaticPaths()` calls `getRooms()`, page calls `getRoom(id)`
- `src/pages/index.astro` → `src/lib/prismic.ts` (new) — homepage fetches `getHomepage()`
- `src/pages/[slug].astro` (new) → `src/lib/prismic.ts` — generic page fetches `getPage(slug)`

</code_context>

<specifics>
## Specific Ideas

- Hero carousel: JavaScript fade transitions (not slide), 3–5 images from Prismic `hero_images` group. No autoplay library needed — a small vanilla JS snippet is fine for PoC.
- Room listing grid: reuse the existing `grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3` pattern from the placeholder in `rooms.astro`.
- Prismic slice types: at minimum `RichText` slice and `ImageBlock` slice. Image block should have a layout option (full-width vs inline) for editor flexibility.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 2-integrations-core-data*
*Context gathered: 2026-05-15*
