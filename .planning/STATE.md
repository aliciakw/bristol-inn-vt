---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 03
status: in_progress
last_updated: '2026-06-03T00:00:00.000Z'
progress:
  total_phases: 6
  completed_phases: 2
  total_plans: 10
  completed_plans: 7
  percent: 33
---

# Project State — Bristol Inn

**Created:** 2026-05-05  
**Current Phase:** 03
**Total Phases:** 6  
**Requirements Mapped:** 73/73  
**Coverage:** 100%

---

## Core Reference

**Project:** Bristol Inn — Proof-of-concept hospitality website  
**Vision:** Guests can browse rooms, check availability, and start booking on a fast, SEO-optimized website. Site teams can manage content through Sanity Studio and track user behavior with GA4.

**Technology Stack:**

- Framework: Astro 6.x (static-first, hybrid SSR for API routes)
- UI: React 19 (client islands via @astrojs/react for interactive components)
- CMS: Sanity (content management, studio at ./studio-bristol-inn-vt)
- Booking: Hostaway API (room data, availability, checkout redirect)
- Hosting: Cloudflare Workers (static assets + SSR API routes; `wrangler dev` for local preview)
- Error Tracking: Sentry (error visibility)
- Analytics: GA4 (page views, custom events)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS (mobile-first)

**CLAUDE.md Constraints:**

- Leverage Astro's static-first preference for fast load times
- Use TypeScript strict mode throughout
- Wrap dependencies for easy swapping
- Prefer composability over configuration in components
- Tailwind for styling (mobile-first, 3 breakpoints)

---

## Phase Status Overview

| Phase | Name                           | Status                                    | Requirements | Completed |
| ----- | ------------------------------ | ----------------------------------------- | ------------ | --------- |
| 1     | Foundation & Infrastructure    | ✅ Complete                               | 11           | 11/11     |
| 2     | Integrations & Core Data       | ✅ Complete                               | 8            | 8/8       |
| 3     | Availability & Booking         | In progress (BOOK-01–03, 06, 08 complete) | 9            | 5/9       |
| 4     | Content & Contact              | Pending                                   | 3            | 0/3       |
| 5     | Performance & Mobile           | Pending                                   | 21           | 0/21      |
| 6     | Monitoring, Analytics & Launch | Pending                                   | 21           | 0/21      |

**Total: 24/73 requirements completed** (Phase 1: 11; Phase 2: ROOM-01–03, CONTENT-01, CONTENT-02, CONTENT-04, CONTENT-08 = 8; Phase 3 partial: BOOK-01–03, BOOK-06, BOOK-08 = 5)

---

## Critical Path

Sequential execution (one phase at a time):

```
Phase 1: Foundation & Infrastructure
  → Astro scaffolding, TypeScript strict, Tailwind, Cloudflare Pages setup
  → Outputs: Deployable project, env var validation, CI/CD working

Phase 2: Integrations & Core Data
  → Hostaway API integration, Sanity CMS setup, room pages, generic content
  → Outputs: Room listing/detail pages, homepage, generic page template working

Phase 3: Availability & Booking
  → Date picker, real-time availability API, booking validation, Hostaway redirect
  → Outputs: Complete booking flow, end-to-end user journey

Phase 4: Content & Contact
  → Contact form, contact page, email backend
  → Outputs: Content richness, guest communication channel

Phase 5: Performance & Mobile
  → Image optimization, Web Vitals tuning, mobile responsiveness, caching
  → Outputs: LCP < 2.5s on 4G, all mobile targets met

Phase 6: Monitoring, Analytics & Launch
  → Sentry error tracking, GA4 analytics, accessibility audit, SEO completion
  → Outputs: Production-ready, error visibility, analytics funnel
```

---

## Key Decisions

| Decision                                                   | Rationale                                                                                                                                                                                                                               | Phase |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Static rooms + on-demand availability                      | Avoid stale booking data; always check real-time                                                                                                                                                                                        | 3     |
| Redirect to Hostaway instead of embedded payment           | Simplify v1; let Hostaway handle PCI compliance                                                                                                                                                                                         | 3     |
| Cloudflare Pages for hosting                               | Fast, free tier, global CDN, PR previews                                                                                                                                                                                                | 1     |
| Sanity for CMS                                             | Structured content, GROQ queries, co-located Studio, Portable Text                                                                                                                                                                      | 2     |
| TypeScript strict from day 1                               | Catch errors at compile time; enforce quality                                                                                                                                                                                           | 1     |
| AMENITY_NAMES seeded LOW confidence                        | Third-party partial list; must verify from live API data after first getRooms() call                                                                                                                                                    | 2     |
| Hostaway CDN domain resolved                               | `hostaway-platform.s3.us-west-2.amazonaws.com` added to `image.remotePatterns`; logging removed after discovery                                                                                                                         | 2     |
| photos sliced to 6 max after sort                          | D-04: gallery shows up to 6 photos; consistent with detail page spec                                                                                                                                                                    | 2     |
| Sanity errors propagate (no try/catch)                     | Build fails on Sanity outage — Cloudflare keeps last good deploy                                                                                                                                                                        | 2     |
| Homepage singleton enforced via Sanity Studio structure    | Fixed document ID prevents accidental duplicates; GROQ queries by \_id                                                                                                                                                                  | 2     |
| Sentry from day 1                                          | Silent errors are worse than crashes; visibility essential                                                                                                                                                                              | 6     |
| Mobile-first responsive design                             | 60-70% initial research on mobile; non-negotiable                                                                                                                                                                                       | 5     |
| SEO in v1, not deferred                                    | Cheap to include now; expensive to add later                                                                                                                                                                                            | 6     |
| React island for availability search (`client:load`)       | Astro SSR-seeds the island to static HTML; idle render matches the previous static grid exactly so hydration causes zero CLS                                                                                                            | 3     |
| Batch availability API (`GET /api/rooms/availability`)     | One request for all rooms vs. per-room endpoint as originally specified; fewer round trips, simpler client code                                                                                                                         | 3     |
| `wrangler dev` for local preview                           | `astro preview` does not inject `.dev.vars` secrets into the Worker runtime — the adapter's config customizer strips `configPath`, so `@cloudflare/vite-plugin` never emits the secrets file; `wrangler dev` reads `.dev.vars` directly | 3     |
| `.dev.vars` must be populated separately from `.env.local` | Vite loads `.env.local` for `astro dev`; Wrangler only reads `.dev.vars` for Worker runtime — both files are gitignored and must each contain `HOSTAWAY_ACCESS_TOKEN` and `SANITY_API_TOKEN`                                            | 3     |

---

## Assumptions & Risks

**Assumptions:**

- Hostaway API rate limits are sufficient for POC (single inn, <10 rooms)
- Cloudflare Pages build time < 90s for 1-10 rooms
- Sanity CDN is available and serves content reliably during builds
- Email service (SMTP or external provider) available for contact form

**Risks:**

- **Availability data desync** — Mitigated by hybrid architecture (on-demand API checks)
- **Hostaway API unknown specifics** — Mitigated by critical spikes in Phase 1 week 1
- **Image performance** — Mitigated by Astro Image component + early 4G testing
- **Mobile booking abandonment** — Mitigated by real device testing in Phase 5
- **Sanity content missing at build time** — Mitigated by Sanity Studio setup before build; build fails loudly (no silent empty pages)
- **Sentry misconfiguration** — Mitigated by Day 1 setup and test error
- **Scope creep** — Mitigated by locked PROJECT.md and explicit v2 backlog

---

## Performance Targets

**Web Vitals (Phase 5):**

- LCP (Largest Contentful Paint): < 2.5s on 4G mobile (real device)
- FCP (First Contentful Paint): < 1.8s
- CLS (Cumulative Layout Shift): < 0.1
- TTI (Time to Interactive): < 3.8s
- Homepage: < 2s on 4G mobile

**Build & Deployment (Phase 1):**

- Build time: < 90s for 1-10 rooms
- PR preview deployments: < 3 minutes from push
- Rollback: < 1 minute via Cloudflare UI

---

## Backlog & Out of Scope (V2+)

**Deferred to Phase 2+ (Low priority for PoC):**

- Staff bios + photos
- Guest testimonials (Hostaway reviews integration)
- Room filtering by amenity
- Advanced GA4 ecommerce tracking
- Component library atoms/molecules (scaffolded structure only)
- Location map + nearby attractions
- Blog / location guides

**Permanently Out of Scope (Low ROI or complexity):**

- User authentication / guest logins
- Direct payment processing
- Loyalty program
- Live chat support
- Multi-language support
- Mobile app (web-responsive sufficient)
- Admin dashboard (Sanity Studio handles content)
- Custom booking engine (Hostaway handles)

---

## Session Continuity

**Current state (as of 2026-06-03):**

Phase 3 is in progress. The availability search UI and API are working end-to-end. Remaining Phase 3 work:

- **BOOK-04**: Availability calendar on `/rooms/:id` detail page (blocked dates visual, loaded on page load)
- **BOOK-05**: "Book Now" redirect to Hostaway with pre-filled params (room ID, check-in, check-out, guests); current CTA is a placeholder URL
- **BOOK-07**: User-facing redirect notice ("You will be redirected to Hostaway to complete your booking securely")
- **BOOK-09**: Graceful fallback when Hostaway availability API fails — show "Call to book" CTA instead of error message

**Environment setup reminder:**

- `.env.local` — used by `astro dev` (Vite). Must contain `HOSTAWAY_ACCESS_TOKEN`, `SANITY_API_TOKEN`, optional `PUBLIC_SENTRY_DSN`, `PUBLIC_GA4_ID`.
- `.dev.vars` — used by `wrangler dev` / `npm run preview` (Cloudflare Worker runtime). Must also contain `HOSTAWAY_ACCESS_TOKEN` and `SANITY_API_TOKEN`. File exists but must be populated separately.

**Next action:** Plan BOOK-04, BOOK-05, BOOK-07, BOOK-09 to complete Phase 3.

---

## Metrics & Monitoring

**Tracked during execution:**

- Phase completion rate (plans completed / plans in phase)
- Build time trend (watch for regressions as room data grows)
- Web Vitals (measured real device, 4G)
- Deployment success rate (CF Pages builds)
- Error rate (Sentry, once configured)
- Booking conversion funnel (GA4, once instrumented)

---

_State initialized: 2026-05-05_  
_Last updated: 2026-06-03_  
_Next action: Plan BOOK-04, BOOK-05, BOOK-07, BOOK-09 — complete Phase 3 booking flow_
