# Architecture Research — Hospitality Website

## System Overview

**Bristol Inn needs a hybrid architecture** that separates static content (fast, SEO-friendly) from real-time availability (dynamic, frequently updated). This prevents stale availability from forcing costly full rebuilds.

```
Static Pages (Home, Room info, CMS content)
  ↓ Built at deploy time
  ↓ Served from Cloudflare edge cache
  ↓ Cache: 30 days

Real-time Data (Room availability, rates)
  ↓ Fetched on-demand or client-side
  ↓ Cloudflare Pages Functions + KV cache
  ↓ Cache: 5-30 minutes
```

This architecture prevents the pitfall: "Availability changes → Full site rebuild needed → 2-3 minute delay → User abandonment."

## Static vs Dynamic Rendering

### What Should Be Static

- **Home page** — Content changes weekly; rebuild daily at off-peak (2am UTC)
- **Room listing pages** — Room descriptions, amenities, photos from Hostaway
- **Room detail pages** — Individual room pages generated at build time
- **Prismic content pages** — About, contact, blog articles
- **Contact page** — Form structure (submission backend separate)
- **Navigation, footers, layouts** — Global UI

**Build frequency:** Daily at 2am UTC (or on-demand via webhook when Prismic publishes)

### What Needs On-Demand/Client-Side Rendering

- **Room availability calendar** — Fetched at build time for "open" marker, but actual availability checked on-demand
- **Booking flow state** — Date picker → availability check → redirect
- **Contact form submission** — Backend API call
- **Analytics tracking** — Client-side (GA4)
- **Error reporting** — Client-side (Sentry)

**Rendering mode:** Astro hybrid mode (static build with on-demand routes for API)

## Data Flow Architecture

### Data Sources & Destinations

```
Hostaway API
  ├─ Rooms (title, description, photos, amenities) → Pre-render room pages
  ├─ Rates (price per night) → Show in listings
  └─ Availability (blocked/open dates) → Client-side check, not in HTML

Prismic CMS
  ├─ Generic pages (content, slugs) → Generate at build time
  ├─ About/contact/blog content → Pre-render pages
  └─ Draft content → Available in preview builds (Cloudflare PR deployments)

User Input
  ├─ Date picker → Check availability API → Validate dates → Redirect to Hostaway
  └─ Contact form → Submit to backend → Email notification → User feedback

Analytics (GA4)
  └─ Page views + custom events (booking_started, contact_submitted) → Client-side only

Error Tracking (Sentry)
  └─ JavaScript errors + API failures → Auto-reported from client
```

### Request Flow: Room Listing Page

1. User visits `/rooms`
2. Cloudflare serves pre-built static HTML (edge cache)
3. JavaScript hydrates date picker, gallery carousel
4. User selects dates → Client-side JS makes API call: `GET /api/rooms?checkIn=2026-05-10&checkOut=2026-05-12`
5. API checks Hostaway real-time availability
6. Response shows available rooms + prices
7. User selects room → "Book Now" redirects to Hostaway checkout

### Request Flow: Individual Room Page

1. User visits `/rooms/sunset-suite`
2. Static HTML already built (Hostaway room data fetched at build time)
3. Page shows room photos, description, amenities, reviews
4. User clicks "Check Availability" → Date picker opens
5. Selects dates → API call to check real-time availability
6. If available: Show price, "Book Now" button
7. Click → Redirect to Hostaway with pre-filled params

### Data Sync Strategy

| Data         | Source       | Sync                | Freshness  | Cache                   |
| ------------ | ------------ | ------------------- | ---------- | ----------------------- |
| Room listing | Hostaway     | Daily build         | 24h        | 30d (static HTML)       |
| Room details | Hostaway     | Daily build         | 24h        | 30d (static HTML)       |
| Room photos  | Hostaway CDN | Referenced in build | Real-time  | Browser (versioned URL) |
| Availability | Hostaway     | On-demand API       | Real-time  | 5-30min (edge)          |
| Rates        | Hostaway     | Daily build         | 24h        | Cloudflare edge cache   |
| CMS content  | Prismic      | On webhook/rebuild  | On publish | 30d (static)            |

## Component Boundaries

### Pages & Routes

```
/                           (Home — static, Prismic content)
  ├─ /rooms                 (Listing — static, Hostaway data at build time)
  ├─ /rooms/:id             (Detail — static per room, route dynamic)
  ├─ /contact               (Form — static page + API backend)
  ├─ /about                 (Static, Prismic)
  ├─ /[...slug]             (Generic Prismic pages via slug)
  └─ /api/                  (Backend API)
      ├─ /rooms/:id/availability    (GET — check real-time availability)
      ├─ /booking/initiate          (POST — validate & redirect to Hostaway)
      ├─ /contact/submit            (POST — process contact form)
      └─ /webhooks/prismic          (POST — handle Prismic publish events)
```

### Layout Components

```
_layouts/
  ├─ BaseLayout             (Header, nav, footer, global styles)
  ├─ ContentLayout          (For pages with hero + body + sidebar)
  ├─ BlogLayout             (For blog articles)
  └─ FormLayout             (For forms with validation feedback)
```

### Feature Modules (Pre-Component Structure)

```
_modules/
  ├─ rooms/
  │   ├─ useHostawayRooms.ts    (Fetch & cache room data)
  │   ├─ useAvailability.ts      (Check real-time availability)
  │   └─ validateDates.ts        (Business logic: validate check-in/out)
  │
  ├─ booking/
  │   ├─ buildHostawayURL.ts     (Generate Hostaway redirect URL)
  │   ├─ validateBookingParams.ts (Validate dates, room ID, guests)
  │   └─ handleCheckout.ts        (Client-side form → API → Hostaway)
  │
  ├─ cms/
  │   ├─ usePrismic.ts           (Fetch Prismic docs)
  │   └─ generateSlugs.ts        (Create routes from CMS slugs)
  │
  ├─ analytics/
  │   └─ trackEvent.ts           (GA4 event tracking wrapper)
  │
  └─ errors/
      └─ reportError.ts          (Sentry error reporting)
```

**Note:** This is not yet the composable atoms/molecules/composite structure (Phase 2, visual polish). Phase 1 keeps code minimal and sparse.

## Caching Strategy (3-Tier)

### Tier 1: Browser Cache

```
Static assets (CSS, JS, images):
  Cache-Control: public, max-age=31536000, immutable
  (Versioned filenames: app.a1b2c3d4.js)

HTML pages:
  Cache-Control: public, max-age=3600  (1 hour)
  or no-cache if content changes frequently

API responses:
  Cache-Control: no-store, no-cache
  (Always fetch fresh from origin)
```

### Tier 2: Cloudflare Edge Cache

```
Static HTML pages:
  Cache-Control: public, max-age=2592000  (30 days)

Room listings / details:
  Cache-Control: public, max-age=86400  (1 day)
  Purge on: Daily rebuild, on-demand

API responses (availability):
  Cache-Control: public, max-age=1800  (30 min)
  or Cache-Control: public, max-age=300  (5 min) during peak season

Prismic content:
  Cache-Control: public, max-age=2592000  (30 days)
  Purge on: Webhook (Prismic publish)
```

### Tier 3: Cloudflare KV Store (Optional, Phase 2)

```
Purpose: Cache Hostaway availability data for cold starts / fallback

Key: `room:{roomId}:availability:{date}`
Value: JSON availability object
TTL: 30 minutes

Use case:
  - User requests availability
  - API checks Hostaway
  - If API is down: Fall back to KV cache
  - User sees "Latest available: [cached data from 10 min ago]"
```

## Hosting & Deployment

### Cloudflare Pages Configuration

```
Project settings:
  - Build command: npm run build
  - Output directory: dist/
  - Node.js version: 20 (or 22)
  - Environment variables: HOSTAWAY_API_KEY, PRISMIC_TOKEN, SENTRY_DSN
```

### Build & Deploy Process

```
1. Developer pushes to branch
2. Cloudflare detects change
3. Runs build:
   - npm install
   - Fetch room data from Hostaway
   - Fetch pages from Prismic
   - Generate static HTML per room
   - Generate static HTML per CMS page
   - Build assets (CSS, JS)
   - Output: dist/
4. Deploy to Cloudflare edge
5. Set cache headers per route
6. Purge old cache (optional)
7. PR deployment: live preview URL generated
```

**Build time estimate:** 30-60 seconds for 1-10 rooms; scale with Hostaway data fetch time.

### Preview Deployments

```
Pull request:
  ├─ Automatic Cloudflare PR deployment (unique URL)
  ├─ Draft Prismic content available (ref=preview query param)
  ├─ Room data from Hostaway (latest)
  └─ Share preview URL with stakeholders for review

Merge to main:
  ├─ Production build triggered
  ├─ Cloudflare Pages domain updated
  ├─ All cached content invalidated
  └─ Live
```

## Error Handling & Fallbacks

### Graceful Degradation

**If Hostaway is down:**

```
- Room listing pages still serve static HTML
- Show cached room data from last successful build
- "Latest available: [timestamp]" message
- Availability API returns 503 with fallback cached data
- User sees "Unable to check availability. Please call [phone] to book."
```

**If Prismic is down:**

```
- Static pages from last build still serve
- No ability to publish new content until Prismic recovers
- Sentry captures the error
```

**If Cloudflare is down:**

```
- No origin server to fall back to (static-only)
- DNS failover to backup host (if configured)
- Immediate customer notification (status page)
```

**If GA4 fails:**

```
- Site continues normally
- No analytics collected
- User experience unaffected
```

**If Sentry fails:**

```
- Errors still logged to browser console
- No error reporting, but site functions
```

## Suggested Build Order

| Phase | Task                                 | Outcome                          | Dependencies     |
| ----- | ------------------------------------ | -------------------------------- | ---------------- |
| 1     | Astro setup + TypeScript config      | Foundation, testing environment  | Node 20+         |
| 2     | Base layout + routing                | Static pages render              | —                |
| 3     | Hostaway API integration (read-only) | Fetch room data                  | Hostaway API key |
| 4     | Generate room pages statically       | All rooms visible                | Phase 3          |
| 5     | Prismic integration                  | Fetch CMS content                | Prismic token    |
| 6     | Generic page template                | Dynamic content pages            | Phase 5          |
| 7     | Availability API endpoint            | Real-time checks                 | Phase 3          |
| 8     | Booking flow UX                      | Date picker + availability check | Phase 7          |
| 9     | Redirect to Hostaway                 | Complete booking flow            | Phase 8          |
| 10    | Contact form (frontend)              | Contact page with form           | —                |
| 11    | Contact form (backend API)           | Email notifications              | Mailer service   |
| 12    | Sentry integration                   | Error tracking                   | Sentry account   |
| 13    | GA4 integration                      | Analytics + page views           | GA4 account      |
| 14    | Cloudflare Pages setup               | Production deployment            | Git repo         |
| 15    | Cache headers optimization           | Performance tuning               | Phase 14         |

**Critical path:** 1 → 2 → 3 → 4 → 7 → 8 → 9 (rooms + booking)

## Scalability Path

| Scale      | Rooms  | Build Time | Architecture              | Strategy                              |
| ---------- | ------ | ---------- | ------------------------- | ------------------------------------- |
| MVP        | 1-5    | 10-15s     | Single Hostaway fetch     | In-memory room cache                  |
| Small      | 10-50  | 30-45s     | Paginate Hostaway queries | Batch fetches                         |
| Medium     | 50-500 | 2-3 min    | Distributed fetch         | Cloudflare KV cache + webhook rebuild |
| Large      | 500+   | 5-10 min   | Real-time data layer      | Redis + continuous deployment         |
| Enterprise | 1000+  | Continuous | Microservices             | Dedicated API layer                   |

**For Bristol Inn (small inn, 3-10 rooms):** Start at MVP level, plan for "Small" during Phase 2.

## Common Architecture Mistakes (& How to Avoid)

| Mistake                                | How It Manifests                                  | Prevention                                         |
| -------------------------------------- | ------------------------------------------------- | -------------------------------------------------- |
| Statically build availability          | Site shows "Available" but Hostaway says "Booked" | Fetch availability on-demand; never bake into HTML |
| Cache all API responses                | User sees 30-min-old availability                 | Use short cache TTL (5-30min) or cache-busting     |
| No error handling for third-party APIs | Silent failures; users see partial pages          | Implement try-catch, fallbacks, Sentry reporting   |
| Hardcode environment variables         | API keys in source code; security breach          | Use `.env` file + Cloudflare environment secrets   |
| No logging / observability             | "It worked yesterday" — mysterious failures       | Implement Sentry from day 1; log API calls         |
| Assuming Hostaway never changes        | API responds differently; pages break             | Version API responses; handle schema changes       |
| Ignoring mobile performance            | Mobile users abandon during booking               | Mobile-first testing, LCP < 2.5s on 4G             |
| Full site rebuild on every code change | 5-min wait for minor bug fix                      | Separate static content rebuild from code deploy   |

## Key Decisions for Architecture

| Decision                                 | Rationale                                         | Outcome                                             |
| ---------------------------------------- | ------------------------------------------------- | --------------------------------------------------- |
| Static-first with on-demand availability | Balances fast page loads + real-time booking data | Room pages instant; availability always fresh       |
| Separate build for room data             | Decouple content changes from code deployments    | Can rebuild rooms daily without touching code       |
| Cloudflare Pages (for now)               | Cheap, integrates with GitHub, PR previews        | Revisit if on-demand rendering becomes critical     |
| No user accounts in v1                   | Adds complexity without clear benefit             | Faster launch; add later if repeat bookings justify |
| Hybrid static+on-demand rendering        | Best of both worlds: fast + fresh                 | Astro's sweet spot; proven pattern                  |

---

_Last updated: 2026-05-05 with current ecosystem research_
