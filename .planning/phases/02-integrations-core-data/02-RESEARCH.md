# Phase 2: Integrations & Core Data - Research

**Researched:** 2026-05-15
**Domain:** Hostaway API, Prismic CMS, Astro 6 static image optimization, Cloudflare Pages hybrid rendering
**Confidence:** MEDIUM (Hostaway amenity names: LOW, Prismic photo CDN domain: MEDIUM, all other areas: HIGH)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Room listing card shows: one thumbnail photo, room name, "From $X / night" rate, and top 3 amenity badges.
- **D-02:** Rate formatted as "From $X / night" — pull base nightly rate from Hostaway `price` field.
- **D-03:** Amenity badges: show the first 3 amenities returned by Hostaway for the room.
- **D-04:** Room detail page shows: photo gallery (up to 6 photos), full text description, all amenities listed, and nightly rate.
- **D-05:** Static generation via `getStaticPaths()` — all rooms fetched from Hostaway at build time.
- **D-06:** Hostaway API fails at build time → fail the build.
- **D-07:** Prismic CMS fails at build time → fail the build.
- **D-08:** Homepage uses a dedicated `homepage` Prismic document type with `hero_images` group, `body` Slice Zone (RichText + ImageBlock slices), `cta_label`, `cta_url`.
- **D-09:** Generic pages use `page` Prismic document type with `title`, `body` Slice Zone, `meta_description`.
- **D-10:** Page URL determined by Prismic document slug (e.g., `about` → `/about`).
- **D-11:** Prismic draft preview via Cloudflare PR preview deployments with `token` query param.
- **D-12:** Hero carousel: JS fade transitions (3–5 images), client-side only, no library.
- **D-13:** All images use Astro `<Image>` with remote URLs, optimized at build time.
- **D-14:** Add Hostaway and Prismic CDN domains to `image.remotePatterns` in `astro.config.mjs`.
- **D-15:** Thumbnail 600×400px on listing card; gallery photos 1200×800px max on detail page.
- **D-16:** Prismic repository already at `https://bristol-inn-vt.cdn.prismic.io/api/v2`; document types created there.

### Claude's Discretion

- Hostaway API client wrapper interface in `src/lib/hostaway.ts` exposing `getRooms()` and `getRoom(id)`.
- Prismic client wrapper in `src/lib/prismic.ts` exposing `getHomepage()` and `getPage(slug)`.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ROOM-01 | Fetch all rooms from Hostaway API at build time (title, description, amenities, photos, rates) | Pre-generated Bearer token (`HOSTAWAY_ACCESS_TOKEN`), `/listings` endpoint, field mapping verified |
| ROOM-02 | Generate static room listing page (`/rooms`) with thumbnail photos, amenity badges, nightly rates | `getStaticPaths()` pattern, card structure, Astro Image config verified |
| ROOM-03 | Generate individual static room detail pages (`/rooms/:id`) with full-size photos, description, amenities, rates | Dynamic `[id].astro` with `getStaticPaths()` + props pattern verified |
| CONTENT-01 | Homepage renders from Prismic with hero section, inn overview, CTA | Prismic `getSingle`/`getAllByType` + `homepage` doc type approach |
| CONTENT-02 | Generic page template renders Prismic content at slug-determined URL | `[slug].astro` + `client.getByUID("page", slug)` pattern verified |
| CONTENT-03 | Prismic draft content accessible in Cloudflare PR preview deployments | Preview requires SSR route; `export const prerender = false` + cookie approach |
| CONTENT-04 | Contact page displays contact info (email, phone, address) | Rendered via generic `page` Prismic doc type at `/contact` slug |
| CONTENT-08 | About page displays inn story, history, value proposition | Rendered via generic `page` Prismic doc type at `/about` slug |

</phase_requirements>

---

## Summary

Phase 2 connects two external data sources to an Astro 6 static site: the Hostaway booking API (room data) and Prismic CMS (content management). Both integrations fetch data at build time to produce static HTML — this is the right architecture for performance and caching, and it matches Cloudflare Pages' static-first model.

**Hostaway** authentication uses a pre-generated Bearer token stored as `HOSTAWAY_ACCESS_TOKEN` in the environment — no OAuth2 token exchange is needed at build time. The token is passed directly as a `Bearer` header to all `/listings` calls. The API response is well-structured but has one critical gap: `listingAmenities` returns integer `amenityId` values with no human-readable names. The planner must include a task to build a static amenity ID-to-name map.

**Prismic** is integrated via `@prismicio/client` v7. There is no `@prismicio/astro` package on npm — the integration is purely via the JS client. The existing `prismic` devDependency in `package.json` is Prismic's CLI tool, not the query client; `@prismicio/client` must be added as a production dependency. Prismic draft preview requires a server-rendered route (SSR), which in Astro 6 `static` output mode means adding `export const prerender = false` to a `/preview` route and installing `@astrojs/cloudflare` adapter. This is a material architectural addition.

**Astro Image** with remote URLs requires `width` and `height` props, plus the source domain in `image.remotePatterns`. The Prismic CDN is `images.prismic.io`; Hostaway's image URLs will be confirmed at API integration time (domain is ASSUMED until first live API call).

**Primary recommendation:** Install `@prismicio/client` (production dep), `@astrojs/cloudflare` (needed for the SSR preview route), and create a static amenity ID-to-name lookup map before implementing any UI. Rename `HOSTAWAY_API_KEY` → `HOSTAWAY_ACCESS_TOKEN` in `src/lib/env.ts` and Cloudflare env settings.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Room data fetching (Hostaway) | API / Backend (build time) | — | Runs in `getStaticPaths()` at build; never client-side |
| Room listing page | Frontend (SSG) | — | Static HTML generated at build; no runtime server |
| Room detail pages | Frontend (SSG) | — | One static page per room; `getStaticPaths()` generates all |
| Homepage content (Prismic) | Frontend (SSG) | — | Fetched at build via `getSingle("homepage")` |
| Generic CMS pages (`/[slug]`) | Frontend (SSG) | — | Fetched at build via `getAllByType("page")` |
| Prismic draft preview route (`/preview`) | Frontend Server (SSR) | — | Requires cookies; must be `prerender = false`; needs Cloudflare adapter |
| Hero carousel transitions | Browser / Client | — | Vanilla JS fade, no server involvement |
| Image optimization | Frontend (SSG build step) | CDN | Astro Sharp runs at build time; outputs optimized assets |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | 6.3.3 | SSG framework | Already installed; project uses |
| @prismicio/client | 7.21.8 | Prismic CMS query client | Official Prismic JS SDK; getAllByType, getByUID, getSingle, preview ref |
| @astrojs/cloudflare | 13.5.1 | Cloudflare Pages adapter | Required for SSR preview route (`prerender = false`); Astro static output still works for all other pages |

`[VERIFIED: npm registry]`

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| astro:assets (built-in) | bundled with Astro 6 | `<Image>` component for remote URL optimization | All room and Prismic images |
| astro:env (built-in) | bundled with Astro 6 | Type-safe secret access (`HOSTAWAY_API_KEY`, `PRISMIC_TOKEN`) | All API lib files |

### The `prismic` devDependency

The current `package.json` has `"prismic": "^1.8.0"` as a devDependency — this is Prismic's **CLI tool** for the Slice Machine, not the query client. It does not provide `createClient` or any data-fetching API. `@prismicio/client` must be installed separately as a **production** dependency.

`[VERIFIED: npm registry — npm view prismic description → "Prismic's official command line tool"]`

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@prismicio/client` directly | `@prismicio/astro` wrapper | No `@prismicio/astro` exists on npm; community-maintained wrappers are outdated |
| `export const prerender = false` per-page | `output: 'server'` globally | Global server mode requires all pages to be SSR, eliminating static advantages |

**Installation:**
```bash
npm install @prismicio/client @astrojs/cloudflare
```

**Version verification:**
```bash
npm view @prismicio/client version   # 7.21.8
npm view @astrojs/cloudflare version # 13.5.1
```

---

## Architecture Patterns

### System Architecture Diagram

```
Build Time:
  getStaticPaths() [rooms.astro, rooms/[id].astro]
    → src/lib/hostaway.ts: getRooms()
      → GET /v1/listings (Bearer HOSTAWAY_ACCESS_TOKEN) → raw listing array
      → normalize: map listingImages → photos[], amenityId → amenityName, price → rate
    → Static HTML pages emitted: /rooms, /rooms/123, /rooms/456

  [index.astro frontmatter]
    → src/lib/prismic.ts: getHomepage()
      → client.getSingle("homepage") → hero_images[], body slices, cta
    → Static HTML emitted: /

  [slug].astro getStaticPaths()
    → src/lib/prismic.ts: getPages()
      → client.getAllByType("page") → [{uid: "about", ...}, {uid: "contact", ...}]
    → Static HTML emitted: /about, /contact

Runtime (SSR — Cloudflare Worker, preview only):
  GET /preview?token=...
    → export const prerender = false (server-rendered route)
    → Astro.cookies.get("io.prismic.preview") → preview ref
    → client.resolvePreviewURL() → redirect to draft page URL
    → Astro.cookies.set(...) carries draft ref for subsequent requests

Browser:
  Hero carousel: vanilla JS fade transitions over Prismic hero_images[]
  All other pages: zero JavaScript
```

### Recommended Project Structure

```
src/
├── lib/
│   ├── hostaway.ts       # API wrapper: getToken(), getRooms(), getRoom(id)
│   ├── hostaway-amenities.ts  # Static amenity ID→name lookup map
│   └── prismic.ts        # CMS wrapper: getHomepage(), getPage(slug), getPages()
├── pages/
│   ├── index.astro       # Replace placeholder — Prismic homepage
│   ├── rooms.astro       # Replace placeholder — Hostaway room listing
│   ├── rooms/
│   │   └── [id].astro    # New — Hostaway room detail
│   ├── [slug].astro      # New — Generic Prismic page template
│   └── preview.astro     # New — Prismic draft preview SSR route
└── components/
    ├── RoomCard.astro     # New — card component (thumbnail, name, rate, badges)
    ├── RoomGallery.astro  # New — up to 6 photos on detail page
    ├── AmenityBadge.astro # New — single badge atom
    ├── HeroCarousel.astro # New — carousel shell + client:only JS
    └── SliceZone.astro    # New — Prismic slice dispatcher
```

### Pattern 1: Hostaway Bearer Token Usage

**What:** Read the pre-generated Bearer token from `HOSTAWAY_ACCESS_TOKEN` env var and pass it directly to all API calls. No token exchange or caching needed.
**When to use:** All Hostaway API calls at build time.

```typescript
// src/lib/hostaway.ts
// Source: https://api.hostaway.com/documentation [VERIFIED: WebFetch from official docs]

import { HOSTAWAY_ACCESS_TOKEN } from 'astro:env/server';

const BASE_URL = 'https://api.hostaway.com/v1';

// No token fetch needed — HOSTAWAY_ACCESS_TOKEN is a pre-generated Bearer token
// stored in .env / Cloudflare environment variables
```

Note: `HOSTAWAY_ACCESS_TOKEN` replaces the previous `HOSTAWAY_API_KEY` env var. Update `src/lib/env.ts`, `astro.config.mjs` env schema, and Cloudflare environment settings to use the new name.

### Pattern 2: Hostaway Listings Fetch + Normalization

**What:** Fetch all listings; normalize raw Hostaway response into typed domain objects.
**When to use:** `getStaticPaths()` in `rooms.astro` and `rooms/[id].astro`.

```typescript
// src/lib/hostaway.ts (continued)
// Source: https://api.hostaway.com/documentation [VERIFIED: WebFetch from official docs]

import { HOSTAWAY_ACCESS_TOKEN } from 'astro:env/server';
import { AMENITY_NAMES } from './hostaway-amenities.ts';

export interface HostawayRoom {
  id: number;
  name: string;
  description: string;
  price: number;             // base nightly rate (field is "price" in API)
  photos: Array<{ url: string; caption: string; sortOrder: number }>;
  amenityNames: string[];    // resolved from amenityId integers via AMENITY_NAMES map
  bedroomsNumber: number;
  bathroomsNumber: number;
  personCapacity: number;
}

export async function getRooms(): Promise<HostawayRoom[]> {
  const res = await fetch(`${BASE_URL}/listings`, {
    headers: { Authorization: `Bearer ${HOSTAWAY_ACCESS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Hostaway listings failed: ${res.status}`);
  const data = await res.json() as { result: RawListing[] };
  return data.result.map(normalizeRoom);
}

export async function getRoom(id: number): Promise<HostawayRoom | null> {
  const res = await fetch(`${BASE_URL}/listings/${id}`, {
    headers: { Authorization: `Bearer ${HOSTAWAY_ACCESS_TOKEN}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Hostaway listing ${id} failed: ${res.status}`);
  const data = await res.json() as { result: RawListing };
  return normalizeRoom(data.result);
}
```

### Pattern 3: Amenity ID Lookup Map

**What:** Static map from Hostaway `amenityId` integers to human-readable badge names.
**When to use:** During normalization in `getRooms()` / `getRoom()`.

```typescript
// src/lib/hostaway-amenities.ts
// Source: partial list from lymebayescapes.co.uk/hostaway-listing-amenities/ [LOW confidence]
// IMPORTANT: Complete map must be verified against actual API responses at integration time

export const AMENITY_NAMES: Record<number, string> = {
  2: 'Internet',
  3: 'WiFi',
  7: 'Kitchen',
  13: 'Washer',
  17: 'Hair Dryer',
  18: 'Heating',
  // ... expand with actual IDs from first live API call
  // Hot Tub, Water View, Balcony — IDs unknown until live data verified [ASSUMED]
};
```

### Pattern 4: Prismic Client Wrapper

**What:** Thin typed wrapper exposing only the methods Phase 2 needs.
**When to use:** All Prismic content fetches at build time.

```typescript
// src/lib/prismic.ts
// Source: https://github.com/prismicio/prismic-client (Context7 + npm) [VERIFIED]

import * as prismic from '@prismicio/client';
import { PRISMIC_TOKEN } from 'astro:env/server';

const REPO_NAME = 'bristol-inn-vt';
// Matches existing repo: https://bristol-inn-vt.cdn.prismic.io/api/v2

let _client: prismic.Client | null = null;

function getClient(): prismic.Client {
  if (_client) return _client;
  _client = prismic.createClient(REPO_NAME, {
    accessToken: PRISMIC_TOKEN,
  });
  return _client;
}

export async function getHomepage() {
  return getClient().getSingle('homepage');
}

export async function getPage(slug: string) {
  return getClient().getByUID('page', slug);
}

export async function getPages() {
  return getClient().getAllByType('page');
}
```

### Pattern 5: Prismic Draft Preview Route (SSR)

**What:** A single SSR route that reads the Prismic preview cookie and redirects to the correct draft page.
**When to use:** CONTENT-03 — draft preview in Cloudflare PR deployments.

```typescript
// src/pages/preview.astro
// Must have: export const prerender = false
// Requires: @astrojs/cloudflare adapter in astro.config.mjs

---
export const prerender = false;
import * as prismic from '@prismicio/client';

const previewCookie = Astro.cookies.get('io.prismic.preview')?.value;

const linkResolver = (doc: prismic.PrismicDocument): string => {
  if (doc.type === 'page') return `/${doc.uid}`;
  if (doc.type === 'homepage') return '/';
  return '/';
};

const url = await prismic.createClient('bristol-inn-vt').resolvePreviewURL({
  linkResolver,
  defaultURL: '/',
  // ref is read from the preview cookie automatically by resolvePreviewURL
});

return Astro.redirect(url);
---
```

Configure in Prismic dashboard: "Preview URL" → `https://YOUR-DEPLOY.pages.dev/preview`

### Pattern 6: Astro Image with Remote URLs

**What:** Remote images require `width`, `height`, and the source domain in `image.remotePatterns`.
**When to use:** All room photos and Prismic content images.

```typescript
// astro.config.mjs — add to existing defineConfig
// Source: Context7 /withastro/docs [VERIFIED]

export default defineConfig({
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.prismic.io' },
      { protocol: 'https', hostname: '**.prismic.io' },
      // Hostaway image hostname: UNKNOWN until first API call — see Open Questions #2
      // Add here after confirming: { protocol: 'https', hostname: 'images.hostaway.com' }
    ],
  },
  // ... rest of config
});
```

```astro
<!-- In RoomCard.astro — thumbnail -->
<Image
  src={room.photos[0].url}
  alt={room.photos[0].caption || room.name}
  width={600}
  height={400}
  format="webp"
  loading="lazy"
/>

<!-- In RoomGallery.astro — detail page photos -->
<Image
  src={photo.url}
  alt={photo.caption || room.name}
  width={1200}
  height={800}
  format="webp"
  loading={index === 0 ? 'eager' : 'lazy'}
/>
```

For remote images where dimensions are unknown at build time, use `inferSize={true}` — this triggers an additional network request per image at build time but avoids hardcoded dimensions. `[CITED: Context7 /withastro/astro]`

### Pattern 7: getStaticPaths() in Astro 6 with env secrets

**What:** `getStaticPaths()` can import from `astro:env/server` to access secrets at build time.
**When to use:** `rooms.astro`, `rooms/[id].astro`, `[slug].astro`.

```astro
---
// src/pages/rooms.astro
import { getRooms } from '../lib/hostaway';
import BaseLayout from '../layouts/BaseLayout.astro';
import RoomCard from '../components/RoomCard.astro';

const rooms = await getRooms();
// If getRooms() throws, the build fails (D-06 behaviour)
---

<BaseLayout title="Rooms - Bristol Inn" description="Browse our rooms">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Our Rooms</h1>
    <div class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
      {rooms.map(room => <RoomCard room={room} />)}
    </div>
  </div>
</BaseLayout>
```

Note: `rooms.astro` is a **non-dynamic static page** (no `getStaticPaths()`). Only `rooms/[id].astro` and `[slug].astro` use `getStaticPaths()`.

### Anti-Patterns to Avoid

- **Using `process.env` directly for secrets in Astro 6:** Astro 6 no longer transforms `import.meta.env` to `process.env`. Use `import { HOSTAWAY_API_KEY } from 'astro:env/server'` instead. `[VERIFIED: Astro v6 upgrade guide via Context7]`
- **Installing `@prismicio/astro`:** This package does not exist on npm. Do not add it.
- **Setting `output: 'server'` globally:** This forces all pages to SSR; defeats static-first goal. Use `output: 'static'` (default) and add `export const prerender = false` only to the preview route.
- **Using `inferSize` on every image:** Adds one HTTP HEAD request per image at build time. Use only when dimensions are truly unknowable; prefer explicit `width`/`height` from API response where possible.
- **Assuming amenity names from Hostaway API:** The API returns only integer `amenityId` values, never string names. The name lookup map must be built separately.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image resizing/format conversion | Custom Sharp pipeline | Astro `<Image>` component | Astro wraps Sharp internally; handles format, resize, lazy loading |
| Prismic document fetching | Raw `fetch` to REST API | `@prismicio/client` `getAllByType`, `getByUID`, `getSingle` | Client handles CDN routing, pagination, preview ref injection |
| Prismic rich text rendering | Manual HTML serialization | `prismic.asHTML(field)` from `@prismicio/client` | Handles all nested node types, links, images |
| Prismic preview URL resolution | Manual `?ref=` query param parsing | `client.resolvePreviewURL()` | Official method handles the cookie-to-ref mapping |

**Key insight:** Both Hostaway and Prismic provide well-maintained JS clients. The only custom logic needed is the amenity ID-to-name map (unavoidable) and the normalization adapter between raw API shapes and TypeScript domain types.

---

## Runtime State Inventory

Not applicable — this is a greenfield integration phase; no rename/refactor/migration involved.

---

## Common Pitfalls

### Pitfall 1: Amenity ID-only API Response

**What goes wrong:** `listingAmenities` returns `[{ id: 3449, amenityId: 2 }]` — no name. Badge displays "2" instead of "WiFi."
**Why it happens:** Hostaway API does not expose a `/amenities` lookup endpoint. `amenityId` integers are a reference to an internal enum.
**How to avoid:** Build `src/lib/hostaway-amenities.ts` as a static `Record<number, string>` map BEFORE implementing any UI. Seed it from first live API call — log the full amenity list from a real listing response and derive the IDs.
**Warning signs:** Room cards show numbers instead of text; TypeScript may not catch this since the type would still be `string` if the lookup returns `undefined` with a fallback.

### Pitfall 2: `@astrojs/cloudflare` Adapter Not Installed

**What goes wrong:** Adding `export const prerender = false` to `preview.astro` fails at build with "Cannot use server-rendered routes without an adapter."
**Why it happens:** Astro `static` output allows per-page SSR opt-in but requires an adapter in `astro.config.mjs`.
**How to avoid:** Install `@astrojs/cloudflare` and add `adapter: cloudflare()` to `astro.config.mjs` before creating the preview route.
**Warning signs:** Build error mentioning "adapter required."

### Pitfall 3: `prismic` CLI vs `@prismicio/client` Confusion

**What goes wrong:** Code imports from `prismic` (the CLI devDependency) and gets a CLI module, not a query client. TypeScript errors on `createClient`.
**Why it happens:** `package.json` has `"prismic": "^1.8.0"` as devDependency — this is Prismic's Slice Machine CLI, not the data client.
**How to avoid:** Install `@prismicio/client` as a production dependency; import from `"@prismicio/client"` not `"prismic"`.
**Warning signs:** `import * as prismic from 'prismic'` → no `createClient` export.

### Pitfall 4: Hostaway Image Domain Unknown Until First API Call



**What goes wrong:** `astro.config.mjs` image allowlist is missing the Hostaway CDN domain; Astro refuses to optimize images from that domain; images display as broken or unoptimized.
**Why it happens:** Hostaway's image CDN domain was not found in documentation. It may be `images.hostaway.com`, an AWS S3 URL, or per-account S3 bucket.
**How to avoid:** On first API call during integration, log `listing.listingImages[0].url` and extract the hostname. Add it to `image.remotePatterns` immediately.
**Warning signs:** Astro build warning "Image from external domain not allowed."

### Pitfall 5: Prismic Preview Requires SSR — Not Pure Static

**What goes wrong:** Adding a `preview.astro` route that reads cookies fails silently or throws at build because `Astro.cookies` is not available in static mode.
**Why it happens:** Cookie access requires a server runtime. In Astro `static` output, all pages are pre-rendered; there's no server to read cookies.
**How to avoid:** Add `export const prerender = false` to `preview.astro` AND install `@astrojs/cloudflare` adapter. The rest of the site remains static.
**Warning signs:** `Astro.cookies is not available in static mode` error at build.

### Pitfall 6: Astro 6 env Secret Validation at Build Time

**What goes wrong:** Importing from `astro:env/server` in any file triggers validation of ALL secrets defined in the schema — even ones not used in that file. If `PRISMIC_TOKEN` is missing during a Hostaway-only local test, build fails.
**Why it happens:** Astro v6 validates the env schema when any module from `astro:env/server` is imported.
**How to avoid:** Ensure ALL env vars are provided in `.env.local` for local development. Document this clearly in `.env.example`.
**Warning signs:** `Missing environment variable: PRISMIC_TOKEN` when only running Hostaway code, or `Missing environment variable: HOSTAWAY_ACCESS_TOKEN` when only running Prismic code.

---

## Code Examples

### Hostaway: Complete normalized type

```typescript
// src/lib/hostaway.ts
// Source: https://api.hostaway.com/documentation [VERIFIED: WebFetch]

interface RawListingImage {
  id: number;
  caption: string;
  vrboCaption: string;
  airbnbCaption: string;
  url: string;
  sortOrder: number;
}

interface RawListingAmenity {
  id: number;
  amenityId: number;
}

interface RawListing {
  id: number;
  name: string;
  description: string;
  price: number;             // base nightly rate
  bedroomsNumber: number;
  bathroomsNumber: number;
  personCapacity: number;
  listingImages: RawListingImage[];
  listingAmenities: RawListingAmenity[];
}
```

### Prismic: Query all pages for `getStaticPaths()`

```typescript
// src/pages/[slug].astro
// Source: Context7 /prismicio/prismic-client [VERIFIED]

export async function getStaticPaths() {
  const pages = await getPages(); // client.getAllByType("page")
  return pages.map(page => ({
    params: { slug: page.uid },
    props: { page },
  }));
}
```

### Prismic: Render rich text field

```typescript
// In any .astro component
// Source: @prismicio/client v7 docs [VERIFIED: npm + Context7]
import * as prismic from '@prismicio/client';

// For simple rendering:
const html = prismic.asHTML(page.data.body);
// Use set:html={html} in Astro template

// For custom component rendering, iterate slice zone manually
// (no PrismicRichText component — that's React only)
```

### Prismic: Preview cookie pattern

```astro
---
// src/pages/preview.astro
// Source: community.prismic.io/t/previews-with-astro [MEDIUM confidence]
export const prerender = false;

import * as prismic from '@prismicio/client';

const previewCookie = Astro.cookies.get('io.prismic.preview')?.value;

if (!previewCookie) {
  return Astro.redirect('/');
}

const client = prismic.createClient('bristol-inn-vt');
const url = await client.resolvePreviewURL({
  linkResolver: (doc) => {
    if (doc.type === 'page') return `/${doc.uid ?? ''}`;
    if (doc.type === 'homepage') return '/';
    return '/';
  },
  defaultURL: '/',
});

return Astro.redirect(url);
---
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `output: 'hybrid'` in Astro | Merged into `output: 'static'`; use `prerender = false` per page | Astro v5.0 | No need for hybrid config; per-page SSR opt-in just works |
| `import.meta.env.MY_SECRET` | `import { MY_SECRET } from 'astro:env/server'` | Astro v5/v6 | Type-safe; schema-validated; `process.env` fallback no longer automatic in v6 |
| `prismic.getApi(endpoint)` (v4/v5 style) | `prismic.createClient(repoName)` (v6/v7) | @prismicio/client v6 | Simpler client creation; pass repo name not full URL |
| `image.domains` array | `image.remotePatterns` array with protocol + hostname | Astro 2+ | More granular; wildcard subdomains supported via `**.hostname.com` |

**Deprecated/outdated:**
- `@prismicio/helpers`: Merged into `@prismicio/client` v7 — `asHTML`, `asText`, `asImageSrc` now exported from `@prismicio/client` directly.
- `import.meta.env` for server secrets in Astro 6: No longer auto-transformed; use `astro:env/server`.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Hostaway CDN image domain is something like `images.hostaway.com` | Pitfall 4 / remotePatterns | Images not optimized by Astro; must update `image.remotePatterns` after first API call |
| A2 | Hostaway amenity IDs: partial list (WiFi=3, Internet=2, etc.); Hot Tub/Water View IDs unknown | Pattern 3 / Don't Hand-Roll | Amenity badges display blank or wrong text; map must be verified from live API data |
| A3 | Prismic `resolvePreviewURL` correctly handles the `io.prismic.preview` cookie value without the full `Astro.request` context | Pattern 5 | Preview redirect goes to wrong page; may need `client.enableAutoPreviewsFromReq(request)` instead |
| A4 | `PRISMIC_TOKEN` is a read-only API token sufficient for `createClient` (no additional auth) | Pattern 4 | Client throws 403; may need `accessToken` configured differently for private repo |

---

## Open Questions

1. **What is the Hostaway image CDN domain?**
   - What we know: `listingImages[].url` is a string URL; domain not documented.
   - What's unclear: The exact hostname needed for `image.remotePatterns`.
   - Recommendation: First task in Wave 1 is a diagnostic `console.log` of a listing's first image URL. Block Astro Image config on this value.

2. **Does Prismic `resolvePreviewURL` work without the full request object in Astro?**
   - What we know: `@prismicio/client` has `client.enableAutoPreviewsFromReq(req)` for server environments; cookie-based approach works per community guides.
   - What's unclear: Whether passing the raw cookie value to `resolvePreviewURL` is sufficient, or whether the full request headers must be passed via `enableAutoPreviewsFromReq`.
   - Recommendation: Implement with cookie value first (simpler); test against a real Prismic preview link. If it fails, switch to `enableAutoPreviewsFromReq(new Request(Astro.request.url, { headers: Astro.request.headers }))`.

3. **Is the Prismic repository private (requires `PRISMIC_TOKEN` for all reads)?**
   - What we know: `PRISMIC_TOKEN` env var is defined and passed as `accessToken` to `createClient`.
   - What's unclear: Public Prismic repos don't need an access token for published content; private repos require it for all reads. Draft/preview content always requires a token.
   - Recommendation: Pass `PRISMIC_TOKEN` to `createClient` unconditionally. This is correct for both private and preview access.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build runtime | ✓ | >=22.12.0 (package.json engine) | — |
| npm | Package management | ✓ | (system) | — |
| Hostaway API access | ROOM-01 through ROOM-03 | [ASSUMED] | n/a | Fail build (D-06) |
| Prismic repo `bristol-inn-vt` | CONTENT-01 through CONTENT-04, CONTENT-08 | ✓ (D-16 confirms repo exists) | n/a | Fail build (D-07) |
| HOSTAWAY_ACCESS_TOKEN env var | All Hostaway calls | Must be set in Cloudflare + `.env` (pre-generated) | n/a | Build fails |
| PRISMIC_TOKEN env var | All Prismic calls | Must be set in Cloudflare + `.env.local` | n/a | Build fails |

**Missing dependencies with no fallback:**
- Hostaway Bearer token (`HOSTAWAY_ACCESS_TOKEN`): Pre-generated and already in `.env`; must also be configured in Cloudflare environment variables before deploying.
- Prismic access token: Must be confirmed (dashboard: Settings → API & Security → Generate a token).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no jest.config, vitest.config, or pytest.ini found in project |
| Config file | Wave 0 gap — must create `vitest.config.ts` |
| Quick run command | `npx vitest run` (once configured) |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ROOM-01 | `getRooms()` returns typed array with required fields | unit (mock fetch) | `npx vitest run tests/lib/hostaway.test.ts` | ❌ Wave 0 |
| ROOM-02 | `/rooms` page renders room grid with names, prices, badges | smoke (build check) | `npm run build && ls dist/rooms/index.html` | ❌ Wave 0 |
| ROOM-03 | `/rooms/:id` pages generated for each room | smoke (build check) | `npm run build && ls dist/rooms/` | ❌ Wave 0 |
| CONTENT-01 | `/` renders hero images and CTA from Prismic | smoke (build check) | `npm run build && ls dist/index.html` | ❌ Wave 0 |
| CONTENT-02 | `/[slug]` renders Prismic page content | unit (mock client) | `npx vitest run tests/lib/prismic.test.ts` | ❌ Wave 0 |
| CONTENT-03 | `/preview` route returns 302 redirect | manual | Load preview URL in browser after deploy | manual-only |
| CONTENT-04 | `/contact` renders contact info from Prismic | smoke (build check) | `npm run build && ls dist/contact/index.html` | ❌ Wave 0 |
| CONTENT-08 | `/about` renders inn story from Prismic | smoke (build check) | `npm run build && ls dist/about/index.html` | ❌ Wave 0 |

Note: CONTENT-03 (Prismic draft preview) is manual-only — it requires a live Cloudflare PR deployment and an active Prismic preview session. Cannot be meaningfully automated.

### Sampling Rate

- **Per task commit:** `npm run build` (full static build; confirms no type errors and pages generate)
- **Per wave merge:** `npm run build && npx vitest run`
- **Phase gate:** Full suite green + manual CONTENT-03 verification before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `vitest` and `@vitest/coverage-v8` — install as devDependencies
- [ ] `vitest.config.ts` — create with TypeScript config
- [ ] `tests/lib/hostaway.test.ts` — unit tests for `getRooms()` and `getRoom()` with mocked fetch
- [ ] `tests/lib/prismic.test.ts` — unit tests for `getHomepage()`, `getPage()`, `getPages()` with mocked client

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No user auth in this phase |
| V3 Session Management | No | No user sessions; preview cookie is read-only |
| V4 Access Control | No | All pages public |
| V5 Input Validation | Yes | Prismic slug from URL param used in `getByUID()` — must validate against allow-list (only published UIDs) |
| V6 Cryptography | No | OAuth2 Bearer token over HTTPS; no custom crypto |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Server-side request forgery via Prismic `[slug]` param | Tampering | `getByUID` only queries Prismic; Prismic throws 404 for unknown UIDs — no arbitrary URL fetching |
| API key exposure in client bundle | Information Disclosure | `HOSTAWAY_API_KEY` and `PRISMIC_TOKEN` are `context: "server"` in Astro env schema — never in client bundle |
| Hostaway Bearer token in git | Information Disclosure | Token stored in `.env` / Cloudflare env vars; never in source code. `.env` in `.gitignore`. |
| Preview cookie manipulation | Tampering | Prismic preview refs are cryptographically signed by Prismic; an attacker cannot forge a valid ref |
| Image proxy abuse | Elevation of Privilege | `image.remotePatterns` explicitly allowlists domains; Astro rejects unauthorized domains |

---

## Sources

### Primary (HIGH confidence)
- `https://api.hostaway.com/documentation` — Hostaway API v1: authentication flow, listings endpoint, response field names, rate limits (15 req/10s per IP, 20 req/10s per account)
- Context7 `/withastro/docs` — Astro Image component (`inferSize`, `remotePatterns`, `width`/`height` requirements for remote URLs)
- Context7 `/withastro/docs` — `getStaticPaths()` pattern, `export const prerender = false`, Astro v5 hybrid merge into static, Cloudflare env var access patterns
- Context7 `/withastro/astro` — Image and Picture component API reference
- Context7 `/prismicio/prismic-client` — `createClient`, `getAllByType`, `getByUID`, `getSingle` API

### Secondary (MEDIUM confidence)
- `https://www.saykiat.com/essay/astrojs-prismic-preview-setup-guide/` — Prismic preview implementation with Astro cookies API; cookie name `io.prismic.preview`
- `https://community.prismic.io/t/previews-with-astro/12858` — SSR requirement for Prismic preview; `export const prerender = false` approach
- npm registry — all package versions verified via `npm view [package] version`
- WebSearch (Prismic CDN domains) — `images.prismic.io` confirmed as primary Prismic image CDN

### Tertiary (LOW confidence)
- `https://lymebayescapes.co.uk/hostaway-listing-amenities/` — Partial Hostaway amenity ID-to-name mapping (48 amenities); Hot Tub/Water View IDs not found — must verify from live API

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 2 |
|-----------|-------------------|
| Static-first Astro preference | Default `output: 'static'`; SSR only for `/preview` route |
| Wrap dependencies for swappability | `src/lib/hostaway.ts` and `src/lib/prismic.ts` as typed wrappers with domain types |
| Composability over configuration | `RoomCard`, `RoomGallery`, `AmenityBadge`, `HeroCarousel` as discrete composable components |
| TypeScript strict mode | All API response types fully typed; no `any`; `RawListing` → `HostawayRoom` normalization |
| Mobile-first Tailwind (3 breakpoints: mobile, tablet, desktop) | Room grid reuses existing `grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3` pattern from placeholder |
| No library for one-line if statements | Hero carousel fade logic can use ternaries; no side-effect-heavy animation library |

---

## Metadata

**Confidence breakdown:**
- Hostaway API (auth via pre-generated Bearer token, endpoints, field names): HIGH — verified via official docs WebFetch
- Hostaway amenity ID-to-name map: LOW — partial third-party list; Hot Tub/Water View unknown
- Hostaway image CDN domain: LOW — not in documentation; must check from live API response
- Prismic client API (createClient, getAllByType, getByUID, getSingle): HIGH — verified via Context7 + npm
- Prismic preview via SSR cookie route: MEDIUM — community-verified approach; `resolvePreviewURL` behavior assumed
- Astro Image remote URL configuration: HIGH — verified via Context7
- Astro 6 env secrets at build time: HIGH — verified via Astro docs
- `@astrojs/cloudflare` adapter requirement for SSR: HIGH — verified via Astro docs

**Research date:** 2026-05-15
**Valid until:** 2026-06-15 (stable ecosystem; Astro minor versions may add features)
