# Stack Research — Hospitality Website

## Executive Summary

Building with Astro 5.x + Prismic CMS + Hostaway API on Cloudflare is a solid modern stack for hospitality websites. Static-first rendering with on-demand fallback handles content freshness. Key gotcha: Astro adapter no longer supports Cloudflare Pages directly — consider Cloudflare Workers for full feature support, or use static-only Pages deployment.

## Astro Framework

**Current Version:** Astro 5.x (Astro 6 beta available, requires Node 22+)  
**Node Requirement:** 5.x requires Node 18.17.1+; 6.x requires Node 22+  
**Confidence:** HIGH

### Why Astro for Inn Websites

- **Static-first by default** — Perfect for fast load times on poor internet (your requirement)
- **On-demand rendering** — Can generate pages at request time for frequently-changing data (room availability)
- **Framework-agnostic** — Minimal JavaScript by default; components use Astro's own templating
- **SEO-friendly** — Meta tags, sitemap generation built-in
- **Excellent Prismic integration** — Official CMS integration guide available

### Rendering Modes

Astro provides a hybrid approach:

1. **Static (Default)** — Pages pre-rendered at build time; fastest, recommended until you need on-demand
2. **Hybrid/Partial** — Mix static and on-demand routes; enables caching static content while generating dynamic pages
3. **Server** — All routes rendered on-demand; most flexible but less performant

**For your project:** Start with Static mode for most pages (home, about, contact). Use hybrid mode for room listings/details if availability changes hourly. Avoid full Server mode unless necessary.

### Key Gotchas

- **Build times** — With Hostaway and Prismic data fetching, builds can be slow; plan build optimization early
- **Cache invalidation** — ISR (incremental static regeneration) not native to Astro; Cloudflare has limited support
- **Node memory** — Large data fetches during build (all rooms + availability) can exceed memory limits

## Hostaway Integration

**API Type:** REST API (JSON)  
**Capabilities:** Read rooms/rates/availability, sync reservations  
**Rate Limits:** Standard REST API limits (check docs.hostaway.com for exact numbers)  
**Confidence:** HIGH

### What You Can Do with Hostaway API

- ✅ Fetch property/room listings (with photos, amenities, descriptions)
- ✅ Get real-time availability calendars and rates
- ✅ Check availability for specific dates
- ✅ Create/update reservations
- ✅ Sync with external booking channels (Airbnb, Booking.com, Vrbo)

### Integration Patterns

**Build-time fetching:**

```
Astro build → Fetch all rooms from Hostaway → Pre-render room listing/detail pages
```

**Best for:** Static room pages that update weekly

**On-demand rendering:**

```
User requests → Hostaway API call → Render availability in real-time
```

**Best for:** Booking flow where availability changes hourly

**Hybrid (Recommended for v1):**

```
Build-time: Pre-render room pages with basic info
On-request: Check availability for selected dates when user books
```

### Data Freshness Strategy

For your use case (availability updates daily/hourly):

- **Room listings** — Rebuild daily at off-peak hours (e.g., 2am UTC)
- **Availability** — Fetch on-demand during booking flow (lightweight API call)
- **Rates** — Rebuild with room listings

**Hostaway API considerations:**

- Payments handled externally (you redirect to Hostaway checkout, don't process payments)
- No webhook support for real-time changes (pull-based only)
- Rate limits are generous for read operations

## Prismic CMS

**Type:** Headless, API-first  
**SDKs:** Official Astro integration available  
**Features:** Draft content, webhooks, multilingual support  
**Confidence:** HIGH

### For Your Project

Prismic is excellent for:

- **Generic page templates** — Create content once, publish at any URL (using slug field)
- **Draft content in previews** — PR builds can render unpublished content for review
- **Content scheduling** — Schedule multiple changes to go live together
- **Media management** — Host images/videos in Prismic CDN

### Key Integration Points

**Content models to create:**

- `GenericPage` — Slug, title, body, metadata (SEO)
- `RoomPage` — Linked to Hostaway room data, custom content overlay
- `ContactPage` — Form content and contact info

**Fetching during build:**

```astro
const allPages = await fetch('https://your-space.cdn.prismic.io/api/v2/documents?type=page')
```

**Preview mode:**

- Pass `ref=preview` query param in Prismic link previews
- Astro can detect and fetch draft content for PR deployments
- Webhook: Rebuild site when content is published

### Gotchas

- **No native webhook + Cloudflare Pages** — Webhooks work, but manually trigger rebuilds or use Cloudflare Workers
- **Media optimization** — Prismic CDN is good but consider adding `next/image`-like optimization for large galleries
- **Query depth limits** — Complex nested queries may hit limits; break into multiple requests

## Cloudflare Pages & Workers

**Status:** Pages support is changing in 2025/2026  
**Key Update:** Astro adapter no longer supports Cloudflare Pages directly  
**Confidence:** HIGH (but requires decision)

### Important Decision Required

As of 2025, Astro's official Cloudflare adapter **does not recommend Cloudflare Pages** for dynamic/on-demand rendering. Options:

1. **Static-only on Pages** — Works fine for pure static sites; no on-demand rendering
2. **Migrate to Cloudflare Workers** — Full support, on-demand rendering, edge compute
3. **Stay with Astro + Pages (legacy)** — Possible but not recommended; limited to static builds

### Current Cloudflare Pages Capabilities

- ✅ Git integration (GitHub, GitLab)
- ✅ Automatic PR preview deployments (with unique URLs)
- ✅ 500 free builds/month on Free plan
- ✅ Unlimited preview deployments
- ✅ Global CDN for static assets
- ✅ Rollback to previous versions
- ✅ Custom domain support

### For Your Project

**Recommended approach:**

- Use Cloudflare Pages for now (static builds work fine)
- If you later need on-demand rendering for availability checks, plan migration to Workers
- Alternative: Implement caching headers for room availability data on static pages

**Build configuration for Pages:**

```
Build command: npm run build
Output directory: dist
Node version: 18 (or 20, 22 available)
```

### Preview Deployments

Excellent news: Cloudflare Pages **automatically creates preview URLs for all PR branches**. Enables your workflow:

- User opens PR
- Cloudflare builds preview version with draft Prismic content
- Preview URL shared for stakeholder review
- Merge to main → Production build

## Sentry Error Tracking

**Setup:** ~5 minutes for basic setup  
**Package:** `@sentry/astro` or `@sentry/node`  
**Confidence:** HIGH

### Why Sentry

- Captures uncaught errors and exceptions
- Source maps for readable stack traces
- Breadcrumbs (user actions before error)
- Performance monitoring (optional)
- Free tier: 5K events/month

### Integration for Astro

Install via npm:

```bash
npm install @sentry/astro
```

Add to `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import sentry from '@sentry/astro';

export default defineConfig({
  integrations: [sentry()],
});
```

Then in your app:

```javascript
import * as Sentry from '@sentry/astro';
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### Gotchas

- **Source maps** — Enable source map upload to Sentry for readable errors
- **PII** — Configure breadcrumb scrubbing to avoid capturing sensitive data
- **Sampling** — Set error sampling ratio (0.1 = 10%) to control quota usage

## GA4 Analytics

**Setup:** ~10 minutes  
**Packages:** `gtag.js` (official) or `@react-ga/core`  
**Confidence:** HIGH

### Why GA4

- Page view tracking out of the box
- Event tracking (custom events you define)
- Conversion tracking (booking flow steps)
- Device and audience insights
- Free tier: Unlimited events

### For Your Project

Minimal setup in v1:

- Page views (automatic)
- Custom event: "booking_started" when user clicks booking flow
- Custom event: "contact_form_submitted"
- **Don't track** user PII or sensitive data

### Integration in Astro

Add to your base layout:

```html
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

For custom events (booking flow):

```javascript
gtag('event', 'booking_started', { property_id: roomId });
```

### Gotchas

- **Event naming** — GA4 requires consistent naming; plan event taxonomy early
- **Custom dimensions** — Limited free dimensions; use sparingly
- **GDPR** — Disable cookie consent until user opts in (use consent mode)
- **Testing** — GA4 requires 24h+ to process data; use real-time reports while testing

## TypeScript + Tailwind

**TypeScript:** Astro supports strict mode out of box  
**Tailwind:** Official Astro integration available  
**Confidence:** HIGH

### TypeScript Best Practices

- Enable `strict: true` in `tsconfig.json` (you required this)
- Type your Astro props:

```typescript
interface Props {
  roomId: string;
  availability: Record<string, boolean>;
}
const { roomId, availability } = Astro.props;
```

- Use `as const` for literal types
- Type async data fetching:

```typescript
const rooms: Room[] = await fetch('...').then((r) => r.json());
```

### Tailwind + Responsive Design

Your CLAUDE.md mentions mobile-first with 3 breakpoints. Tailwind defaults:

- Mobile (no prefix) — 0px+
- Tablet (md) — 768px+
- Desktop (lg) — 1024px+
- Add `2xl` — 1536px+ for large monitors

Example:

```html
<button class="px-4 md:px-6 lg:px-8">Button</button>
```

## Stack Summary

| Layer              | Choice           | Version | Confidence |
| ------------------ | ---------------- | ------- | ---------- |
| **Framework**      | Astro            | 5.x     | HIGH       |
| **CMS**            | Prismic          | Latest  | HIGH       |
| **Booking API**    | Hostaway         | REST    | HIGH       |
| **Hosting**        | Cloudflare Pages | Latest  | MEDIUM\*   |
| **Error Tracking** | Sentry           | Latest  | HIGH       |
| **Analytics**      | GA4              | Latest  | HIGH       |
| **Language**       | TypeScript       | 5.x     | HIGH       |
| **Styling**        | Tailwind         | Latest  | HIGH       |

\*Cloudflare Pages support is shifting; monitor for potential migration to Workers.

## Key Gotchas & Workarounds

1. **Availability freshness vs build times** → Use on-demand rendering for booking flow; keep room listing static
2. **Cloudflare Pages adapter deprecation** → If you need on-demand rendering, plan for Workers migration
3. **Large data fetches during build** → Paginate Hostaway room queries; monitor build memory
4. **Prismic webhooks + Pages** → Can't auto-trigger rebuilds; use manual triggers or Workers
5. **Analytics privacy** → GA4 requires consent; implement consent banner before deploying

## Recommendations for V1

1. **Start with static Astro** → No on-demand rendering yet; build daily at 2am UTC
2. **Read-only Hostaway** → Fetch rooms/rates at build time; redirect to Hostaway for checkout
3. **Hybrid approach for availability** → Static room pages + on-demand availability checks during booking
4. **Prismic for content** → Generic page template with slug routing; enables content team to publish without deploys
5. **Cloudflare Pages for now** → Static builds work perfectly; revisit architecture if on-demand rendering becomes critical
6. **Basic error tracking** → Sentry with 10% sample rate to control costs
7. **Basic analytics** → GA4 page views + 2-3 custom events for booking flow

---

**Sources:**

- [Astro On-Demand Rendering Guide](https://docs.astro.build/en/guides/on-demand-rendering/)
- [Astro Releases](https://github.com/withastro/astro/releases)
- [Cloudflare Pages Astro Guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Astro Cloudflare Deployment](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Hostaway Public API](https://api.hostaway.com/documentation)
- [Prismic & Astro Integration](https://docs.astro.build/en/guides/cms/prismic/)
- [Hotel Booking System Design](https://phptravels.com/blog/hotel-reservation-system-design)

_Last updated: 2026-05-05 with current ecosystem research_
