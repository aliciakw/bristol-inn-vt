# Bristol Inn — Phase Roadmap

## Overview

**Phases:** 6  
**Granularity:** Standard  
**Total v1 Requirements:** 73  
**Coverage:** 73/73 requirements mapped ✓  
**Execution:** Sequential (one phase at a time)  
**Timeline estimate:** 4-6 weeks to Phase 6 completion

The roadmap derives phases from natural dependencies and critical path requirements. Phase 1 establishes the foundation; Phase 2 connects to Hostaway and Prismic; Phase 3 implements the core booking flow; Phase 4 adds content richness; Phase 5 optimizes performance and mobile; Phase 6 handles monitoring, analytics, and launch readiness.

---

## Phase Breakdown

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Foundation & Infrastructure | Scaffold Astro project with TypeScript, Tailwind, routing, and deployment infrastructure | CODE-01, CODE-02, CODE-03, CODE-04, CODE-05, CODE-06, INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05 | 5 |
| 2 | Integrations & Core Data | 1/8 | In Progress|  |
| 3 | Availability & Booking | Implement date picker, real-time availability API, booking parameter validation, and Hostaway redirect | BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05, BOOK-06, BOOK-07, BOOK-08, BOOK-09 | 5 |
| 4 | Content & Contact | Add contact form, contact page, about page, and email notification backend | CONTENT-05, CONTENT-06, CONTENT-07 | 3 |
| 5 | Performance & Mobile | Optimize images, implement caching strategy, ensure mobile responsiveness and Web Vitals targets | ROOM-04, ROOM-05, ROOM-06, ROOM-07, PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PERF-07, PERF-08, PERF-09, MOBILE-01, MOBILE-02, MOBILE-03, MOBILE-04, MOBILE-05, MOBILE-06, MOBILE-07, MOBILE-08 | 5 |
| 6 | Monitoring, Analytics & Launch | Configure Sentry, GA4 tracking, accessibility validation, SEO completion, and deployment to production | A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, A11Y-07, A11Y-08, SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07, SEO-08, SEO-09, MONITOR-01, MONITOR-02, MONITOR-03, MONITOR-04, MONITOR-05, MONITOR-06, GA4-01, GA4-02, GA4-03, GA4-04, GA4-05, GA4-06, GA4-07, INFRA-06, INFRA-07 | 5 |

---

## Phase Details

### Phase 1: Foundation & Infrastructure

**Goal:** Scaffold a production-ready Astro project with TypeScript strict mode, Tailwind CSS, routing, and Cloudflare Pages deployment infrastructure in place.

**Requirements mapped:**
- CODE-01: All source code is written in TypeScript with `strict: true` in `tsconfig.json`
- CODE-02: API endpoints type request and response data
- CODE-03: Component props are typed with interfaces/types
- CODE-04: No `any` types used (or documented with explanation)
- CODE-05: Environment variables are validated at startup (missing vars cause clear error messages)
- CODE-06: API keys and secrets are stored in environment variables, not in source code
- INFRA-01: Project deployed to Cloudflare Pages with automatic builds on main branch pushes
- INFRA-02: Pull request deployments are automatic with unique preview URLs
- INFRA-03: Cloudflare environment variables are configured (HOSTAWAY_API_KEY, PRISMIC_TOKEN, SENTRY_DSN, GA4_ID)
- INFRA-04: Build succeeds locally and on Cloudflare with identical environment variables
- INFRA-05: Build time is < 90 seconds for 1-10 rooms (acceptable for PoC)

**Success Criteria:**
1. Astro project initializes with TypeScript strict mode enabled; `npm run build` succeeds without type errors
2. Tailwind CSS is configured for mobile-first responsive design (3 breakpoints: mobile, tablet, desktop)
3. Project routes correctly: `/` (home), `/rooms` (listing), `/contact` (contact), `/api/*` (backend endpoints)
4. Environment variables are validated at startup; missing critical vars (HOSTAWAY_API_KEY, PRISMIC_TOKEN) cause clear error messages
5. Cloudflare Pages deployment pipeline is configured; PR preview URLs auto-generate on branch pushes; build succeeds in CF environment

**Inputs:**
- Blank git repository
- Project.md and Requirements.md completed
- No external API keys yet (configure placeholders)

**Outputs:**
- Working Astro project on `main` branch, deployable to Cloudflare Pages
- TypeScript strict configuration enforced
- Environment variable schema documented
- PR preview deployments working
- Local build time established (~30-60s baseline)

**Risks:**
- Cloudflare Pages may require specific build configuration; verify build succeeds in CF environment by end of phase
- TypeScript strict mode may uncover design issues; allocate time for refactoring

**UI hint:** yes

---

### Phase 2: Integrations & Core Data

**Goal:** Connect to Hostaway API and Prismic CMS; fetch real room data and content; generate room listing and detail pages, plus generic content pages powered by Prismic.

**Requirements mapped:**
- ROOM-01: Fetch all rooms from Hostaway API at build time, including title, description, amenities, photos, and rates
- ROOM-02: Generate static room listing page (`/rooms`) showing all rooms with thumbnail photos, amenity badges, and nightly rates
- ROOM-03: Generate individual static room detail pages (`/rooms/:id`) with full-size photos, complete description, amenities list, and rates
- CONTENT-01: Homepage (`/`) renders content from Prismic with hero section, inn overview, and call-to-action
- CONTENT-02: Generic page template accepts Prismic content documents and renders at URLs determined by page slug (e.g., `/about`, `/contact`)
- CONTENT-03: Prismic draft content is accessible in Cloudflare PR preview deployments (via preview URL with draft content flag)
- CONTENT-04: Contact page (`/contact`) displays contact information prominently (email, phone, address)
- CONTENT-08: About page (`/about` or via Prismic slug) displays inn story, history, and value proposition

**Success Criteria:**
1. Hostaway API authentication works; room data (title, description, amenities, photos, rates) is fetched successfully at build time
2. Room listing page (`/rooms`) renders with all rooms, thumbnail images, amenity badges, and nightly rates visible
3. Individual room detail pages (`/rooms/:id`) generate statically for each room with full-size photos, complete description, and amenities
4. Prismic CMS integration is working; homepage (`/`) renders hero section and inn overview from Prismic content
5. Generic page template renders any Prismic content document at its slug URL; draft content visible in Cloudflare PR previews

**Inputs:**
- Phase 1 complete: Astro, TypeScript, Tailwind configured
- Hostaway API key obtained; Hostaway sandbox access available
- Prismic project created and repository linked
- Critical spikes answered: Hostaway response format, Prismic webhook format

**Outputs:**
- Room listing page at `/rooms` with real data
- Room detail pages at `/rooms/:id` (static generation)
- Homepage at `/` with Prismic content
- Generic page template working (about page, future contact page)
- Prismic draft preview working in PR deployments
- Hostaway API rate limits documented

**Risks:**
- Hostaway API response format unknown until integration; may require adapter
- Prismic webhook reliability untested; fallback to manual trigger if needed
- Photo URLs from Hostaway may be inconsistent; plan image proxy/resize strategy

**UI hint:** yes

**Plans:** 1/8 plans executed

Plans:
- [x] 02-01-PLAN.md — Foundation setup: dependencies, Cloudflare adapter, image.remotePatterns, Vitest
- [ ] 02-02-PLAN.md — Hostaway API library: getRooms(), getRoom(), HostawayRoom type, amenity map
- [ ] 02-03-PLAN.md — Prismic CMS library: getHomepage(), getPage(), getPages()
- [ ] 02-04-PLAN.md — Room components: AmenityBadge, RoomCard, RoomGallery
- [ ] 02-05-PLAN.md — Prismic components: HeroCarousel, SliceZone
- [ ] 02-06-PLAN.md — Room pages: /rooms listing and /rooms/[id] detail pages
- [ ] 02-07-PLAN.md — Prismic pages: homepage, [slug] generic template, preview SSR route
- [ ] 02-08-PLAN.md — Unit tests: Hostaway and Prismic library tests, full build gate

---

### Phase 3: Availability & Booking

**Goal:** Implement real-time availability checking and complete booking flow: date picker → availability verification → booking parameter validation → redirect to Hostaway checkout.

**Requirements mapped:**
- BOOK-01: Implement date picker component that allows guests to select check-in and check-out dates on `/rooms` page
- BOOK-02: Check availability in real-time via API call (not static) when guest selects dates, confirming room is still available
- BOOK-03: Display available rooms filtered by selected dates with updated pricing and availability status
- BOOK-04: Show availability calendar on room detail page indicating blocked/open dates (visual indicator, updated on load)
- BOOK-05: "Book Now" button redirects to Hostaway checkout with pre-filled parameters (room ID, check-in date, check-out date, guest count)
- BOOK-06: Validate booking parameters server-side before redirect (confirm dates are future, checkout > check-in, room ID exists)
- BOOK-07: Clear messaging before redirect: "You will be redirected to Hostaway to complete your booking securely"
- BOOK-08: Availability API endpoint (`GET /api/rooms/:id/availability?checkIn=...&checkOut=...`) returns real-time data from Hostaway
- BOOK-09: Fallback behavior if Hostaway API fails: show cached availability or "Call to book" CTA instead of error

**Success Criteria:**
1. Date picker component on `/rooms` allows guest to select check-in and check-out dates via native `<input type="date">` (falls back to native mobile picker)
2. Availability API (`GET /api/rooms/:id/availability`) returns real-time data from Hostaway; checks room availability for selected date range
3. Available rooms are displayed filtered by selected dates; unavailable dates clearly marked on availability calendar
4. "Book Now" redirects to Hostaway checkout with correct parameters (room ID, dates, guest count) pre-filled in URL
5. Server-side validation prevents invalid bookings (past dates, check-out before check-in, non-existent room); fallback to "Call to book" if Hostaway API fails

**Inputs:**
- Phase 2 complete: Room pages and Prismic integration working
- Hostaway booking redirect URL format confirmed
- Availability API endpoint architecture designed (static vs. on-demand rendering)

**Outputs:**
- Availability API endpoint at `/api/rooms/:id/availability` working with real-time data
- Date picker component functional and touch-friendly
- Booking redirect URL with correct parameters
- Parameter validation logic in place
- Fallback behavior documented and tested

**Risks:**
- Availability data desync is the biggest risk; hybrid architecture (static pages + on-demand API) must be implemented carefully
- Hostaway API rate limits may impact real-time checks; circuit breaker and exponential backoff required
- Booking redirect URL format must be exact; test in Hostaway sandbox before launch

**UI hint:** yes

---

### Phase 4: Content & Contact

**Goal:** Add contact form functionality, contact page, about page (if not in Prismic), and backend email notifications. Enrich Prismic workflow with review/draft capabilities.

**Requirements mapped:**
- CONTENT-05: Contact form on `/contact` page with fields: name, email, message; client-side validation
- CONTENT-06: Contact form submission sends data to backend API endpoint (`POST /api/contact/submit`)
- CONTENT-07: Backend contact form handler sends confirmation email to guest and notification email to inn

**Success Criteria:**
1. Contact form on `/contact` has fields: name, email, message with required validation; client-side error messages clear
2. Contact form submits to `POST /api/contact/submit` endpoint; server validates input and rejects invalid data
3. Backend sends confirmation email to guest; notification email to inn with guest message and contact details
4. Contact form submission succeeds without exposing API keys or internal errors to user

**Inputs:**
- Phase 2 complete: Prismic integration, contact page structure in place
- Email service selected (SMTP, SendGrid, Mailgun, or serverless email provider)
- Email templates designed (confirmation, notification)

**Outputs:**
- Contact form fully functional with backend
- Email notifications working (confirmed by test submissions)
- Prismic review workflow for content teams
- Contact page live

**Risks:**
- Email deliverability depends on provider; test domain authentication (SPF, DKIM) early
- Cloudflare Pages Functions or Workers may be required for email backend (if not using external service)
- Spam filtering may prevent confirmation emails; monitor delivery

**UI hint:** yes

---

### Phase 5: Performance & Mobile

**Goal:** Optimize images for Core Web Vitals, implement caching strategy, ensure mobile responsiveness, and validate Web Vitals on real 4G devices.

**Requirements mapped:**
- ROOM-04: Room listings display high-quality photos from Hostaway using Astro Image component with lazy loading and WebP/AVIF format
- ROOM-05: Amenity badges on room cards (e.g., "WiFi", "Hot Tub", "Water View") visually distinct and scannable
- ROOM-06: Room detail pages include gallery carousel or scrollable photo section with 4+ photos per room
- ROOM-07: Display nightly rate clearly on room cards and detail pages; show estimated total for sample stay (e.g., "3 nights: $450")
- PERF-01: Largest Contentful Paint (LCP) < 2.5 seconds on 4G mobile network (tested with real device, not DevTools throttling)
- PERF-02: Cumulative Layout Shift (CLS) < 0.1 (no jumping content during page load)
- PERF-03: First Contentful Paint (FCP) < 1.8 seconds
- PERF-04: Time to Interactive (TTI) < 3.8 seconds
- PERF-05: All room listing pages cached by Cloudflare edge for 24 hours to avoid unnecessary rebuilds
- PERF-06: Availability API responses cached on Cloudflare edge for 5-30 minutes (depending on season)
- PERF-07: Static assets (CSS, JS, images) use versioned filenames and cache-forever headers
- PERF-08: Images in room galleries are optimized: multiple sizes (thumbnail 300x300, detail 800x800), lazy-loaded, WebP/AVIF format
- PERF-09: Homepage loads in < 2 seconds on 4G mobile
- MOBILE-01: All pages render correctly on mobile (375px width) without horizontal scroll
- MOBILE-02: Room listing page is single-column on mobile, multi-column on tablet/desktop (Tailwind responsive)
- MOBILE-03: Date picker is touch-friendly on mobile with 44x44px minimum tap targets; uses native `<input type="date">` (falls back to native mobile picker)
- MOBILE-04: Photo galleries are scrollable (swipe) on mobile; carousel auto-pauses on user interaction
- MOBILE-05: Booking flow form fields are readable (16px+ text) and tappable (44x44px targets) on mobile without zoom
- MOBILE-06: Fixed headers do not consume more than 15% of mobile viewport height
- MOBILE-07: Contact form is usable on mobile (single column, large inputs, visible submit button)
- MOBILE-08: Navigation menu is accessible on mobile (hamburger menu or expandable nav)

**Success Criteria:**
1. All images use Astro Image component with lazy loading, WebP/AVIF format, and multiple sizes (thumbnail 300x300, detail 800x800)
2. Web Vitals measured on real iPhone 12 on 4G network: LCP < 2.5s, FCP < 1.8s, CLS < 0.1, TTI < 3.8s
3. Cloudflare cache headers configured: room pages 24h, availability API 5-30min, static assets cache-forever with versioned filenames
4. All pages render single-column on 375px mobile viewport; no horizontal scroll; multi-column on tablet/desktop via Tailwind responsive classes
5. Touch targets are 44x44px minimum; text is 16px+ on mobile; fixed headers consume <15% of viewport; forms are usable without zoom

**Inputs:**
- Phase 3 complete: Booking flow working
- Real iPhone 12 or similar device available for testing
- Cloudflare cache configuration documented

**Outputs:**
- Images optimized and lazy-loaded
- Web Vitals targets met (measured on real 4G device)
- Mobile-first responsive design validated
- Caching strategy implemented
- Performance regression tests in CI (optional but recommended)

**Risks:**
- LCP target (< 2.5s) on real 4G may require aggressive image optimization
- Mobile device testing with real 4G may reveal unexpected bottlenecks; allocate time for debugging
- Cloudflare cache header syntax varies; test locally before deploying

**UI hint:** yes

---

### Phase 6: Monitoring, Analytics & Launch

**Goal:** Configure error tracking (Sentry), analytics (GA4), accessibility validation, SEO completion, and launch to production with confidence.

**Requirements mapped:**
- A11Y-01: All images have descriptive alt text (e.g., "Sunset Suite with hot tub on private balcony", not "room.jpg")
- A11Y-02: Color contrast meets WCAG AA minimum (4.5:1 for normal text, 3:1 for large text)
- A11Y-03: Entire booking flow is navigable via keyboard only (Tab through inputs, Enter to submit)
- A11Y-04: Focus indicators are visible and clear (do not remove browser default)
- A11Y-05: Form inputs have associated labels (via `<label>` or `aria-label`)
- A11Y-06: Headings use semantic hierarchy (`<h1>` once per page, `<h2>` for major sections)
- A11Y-07: Decorative images use `alt=""` (empty alt attribute)
- A11Y-08: Page is navigable without JavaScript (graceful degradation)
- SEO-01: Each page has unique `<title>` tag with keyword (e.g., "Sunset Suite with Hot Tub - Bristol Inn")
- SEO-02: Each page has unique `<meta name="description">` (160 chars, compelling CTA)
- SEO-03: Homepage includes schema.org Hotel markup (JSON-LD) with name, address, contact, photos
- SEO-04: Each room detail page includes schema.org Room markup with name, description, amenities, rates, photos
- SEO-05: Contact information structured with schema.org (email, phone, address on contact page)
- SEO-06: Auto-generated `sitemap.xml` includes all pages and room detail URLs
- SEO-07: `robots.txt` allows search engines and disallows `/api/` endpoints
- SEO-08: Open Graph meta tags (og:title, og:description, og:image) for social sharing
- SEO-09: Canonical tags prevent duplicate content issues
- MONITOR-01: Sentry is initialized and configured with correct DSN in production environment
- MONITOR-02: JavaScript errors are automatically captured and sent to Sentry
- MONITOR-03: API errors (Hostaway, Prismic, contact form) are logged to Sentry with error context
- MONITOR-04: Sentry dashboard has alerts configured for error spikes (e.g., 5+ errors in 5 minutes)
- MONITOR-05: Sentry breadcrumbs capture user actions before errors (navigation, form interactions)
- MONITOR-06: PII (email, phone, credit card data) is NOT captured by Sentry (scrubbed/filtered)
- GA4-01: GA4 tracking code installed; page views are automatically tracked
- GA4-02: Custom event "booking_started" fires when user clicks "Check Availability" button
- GA4-03: Custom event "room_selected" fires when user selects a specific room to book
- GA4-04: Custom event "checkout_initiated" fires when user is redirected to Hostaway
- GA4-05: Custom event "contact_form_submitted" fires when contact form is successfully submitted
- GA4-06: No PII is captured in GA4 events (email, phone, credit card data are filtered)
- GA4-07: GA4 funnels can be created: page_view → booking_started → room_selected → checkout_initiated
- INFRA-06: Cache headers are set per route (see PERF requirements)
- INFRA-07: Rollback capability: can revert to previous working version via Cloudflare UI

**Success Criteria:**
1. All images have descriptive alt text; color contrast meets WCAG AA (4.5:1 normal, 3:1 large); focus indicators visible; keyboard navigation works end-to-end
2. Heading hierarchy is semantic (`<h1>` once per page, `<h2>` for sections); form inputs have labels; decorative images have empty alt; pages are navigable without JavaScript
3. Each page has unique title and meta description; schema.org markup (Hotel, Room, Contact) present in JSON-LD; Open Graph tags and canonical tags in place
4. `sitemap.xml` auto-generates all pages and room URLs; `robots.txt` allows search engines, disallows `/api/*`; page views tracked in GA4
5. Sentry captures JavaScript and API errors with breadcrumbs; alerts configured for error spikes; PII scrubbed; GA4 custom events (booking_started, room_selected, checkout_initiated, contact_form_submitted) firing correctly; funnels can be created

**Inputs:**
- Phase 5 complete: All features working, Web Vitals met
- Sentry project created and DSN obtained
- GA4 property created and measurement ID obtained
- Accessibility audit tools available (axe, WAVE, NVDA screen reader)
- SEO checklists ready

**Outputs:**
- Sentry fully configured and tested
- GA4 tracking complete; custom events firing
- Accessibility audit passed (WCAG AA)
- SEO audit passed; all pages have titles, descriptions, schema markup
- Cloudflare cache headers optimized
- Deployment to production with rollback capability

**Risks:**
- Accessibility audit may uncover issues requiring design changes; allocate time for remediation
- GA4 event naming and taxonomy must be consistent; document event tracking plan early
- PII scrubbing in Sentry may require custom configuration; test before launch
- Page speed may regress after adding Sentry/GA4; validate Web Vitals again

**UI hint:** yes

---

## Requirement Traceability

| REQ-ID | Requirement | Phase | Status |
|--------|-------------|-------|--------|
| ROOM-01 | Fetch rooms from Hostaway API | 2 | Pending |
| ROOM-02 | Generate room listing page | 2 | Pending |
| ROOM-03 | Generate room detail pages | 2 | Pending |
| ROOM-04 | Optimize photos with Astro Image | 5 | Pending |
| ROOM-05 | Amenity badges on cards | 5 | Pending |
| ROOM-06 | Room gallery carousel | 5 | Pending |
| ROOM-07 | Display pricing | 5 | Pending |
| BOOK-01 | Date picker component | 3 | Pending |
| BOOK-02 | Real-time availability check | 3 | Pending |
| BOOK-03 | Filter rooms by dates | 3 | Pending |
| BOOK-04 | Availability calendar | 3 | Pending |
| BOOK-05 | Redirect to Hostaway | 3 | Pending |
| BOOK-06 | Server-side parameter validation | 3 | Pending |
| BOOK-07 | Redirect messaging | 3 | Pending |
| BOOK-08 | Availability API endpoint | 3 | Pending |
| BOOK-09 | Fallback for API failures | 3 | Pending |
| CONTENT-01 | Homepage rendering | 2 | Pending |
| CONTENT-02 | Generic page template | 2 | Pending |
| CONTENT-03 | Prismic draft preview | 2 | Pending |
| CONTENT-04 | Contact page display | 2 | Pending |
| CONTENT-05 | Contact form validation | 4 | Pending |
| CONTENT-06 | Contact form API | 4 | Pending |
| CONTENT-07 | Email notifications | 4 | Pending |
| CONTENT-08 | About page | 2 | Pending |
| PERF-01 | LCP < 2.5s on 4G | 5 | Pending |
| PERF-02 | CLS < 0.1 | 5 | Pending |
| PERF-03 | FCP < 1.8s | 5 | Pending |
| PERF-04 | TTI < 3.8s | 5 | Pending |
| PERF-05 | Edge cache 24h (rooms) | 5 | Pending |
| PERF-06 | Edge cache 5-30min (availability) | 5 | Pending |
| PERF-07 | Versioned assets cache-forever | 5 | Pending |
| PERF-08 | Optimize room images | 5 | Pending |
| PERF-09 | Homepage < 2s on 4G | 5 | Pending |
| MOBILE-01 | No horizontal scroll on mobile | 5 | Pending |
| MOBILE-02 | Responsive columns (mobile → desktop) | 5 | Pending |
| MOBILE-03 | Touch-friendly date picker | 5 | Pending |
| MOBILE-04 | Swipeable galleries | 5 | Pending |
| MOBILE-05 | Mobile booking form | 5 | Pending |
| MOBILE-06 | Header height < 15% viewport | 5 | Pending |
| MOBILE-07 | Contact form mobile UX | 5 | Pending |
| MOBILE-08 | Mobile navigation | 5 | Pending |
| A11Y-01 | Descriptive alt text | 6 | Pending |
| A11Y-02 | WCAG AA color contrast | 6 | Pending |
| A11Y-03 | Keyboard navigation | 6 | Pending |
| A11Y-04 | Visible focus indicators | 6 | Pending |
| A11Y-05 | Form input labels | 6 | Pending |
| A11Y-06 | Semantic heading hierarchy | 6 | Pending |
| A11Y-07 | Decorative image handling | 6 | Pending |
| A11Y-08 | Works without JavaScript | 6 | Pending |
| SEO-01 | Unique page titles | 6 | Pending |
| SEO-02 | Unique meta descriptions | 6 | Pending |
| SEO-03 | Hotel schema markup | 6 | Pending |
| SEO-04 | Room schema markup | 6 | Pending |
| SEO-05 | Contact schema markup | 6 | Pending |
| SEO-06 | Auto-generated sitemap | 6 | Pending |
| SEO-07 | robots.txt | 6 | Pending |
| SEO-08 | Open Graph tags | 6 | Pending |
| SEO-09 | Canonical tags | 6 | Pending |
| MONITOR-01 | Sentry initialized | 6 | Pending |
| MONITOR-02 | JavaScript errors captured | 6 | Pending |
| MONITOR-03 | API errors logged | 6 | Pending |
| MONITOR-04 | Sentry alerts configured | 6 | Pending |
| MONITOR-05 | Breadcrumbs captured | 6 | Pending |
| MONITOR-06 | PII scrubbed from Sentry | 6 | Pending |
| GA4-01 | Page view tracking | 6 | Pending |
| GA4-02 | booking_started event | 6 | Pending |
| GA4-03 | room_selected event | 6 | Pending |
| GA4-04 | checkout_initiated event | 6 | Pending |
| GA4-05 | contact_form_submitted event | 6 | Pending |
| GA4-06 | PII filtered from GA4 | 6 | Pending |
| GA4-07 | Funnel creation enabled | 6 | Pending |
| CODE-01 | TypeScript strict mode | 1 | Pending |
| CODE-02 | API type safety | 1 | Pending |
| CODE-03 | Component prop types | 1 | Pending |
| CODE-04 | No `any` types | 1 | Pending |
| CODE-05 | Env var validation | 1 | Pending |
| CODE-06 | Secrets in env, not source | 1 | Pending |
| CODE-07 | Error handling & fallbacks | 3 | Pending |
| INFRA-01 | Cloudflare Pages deployment | 1 | Pending |
| INFRA-02 | PR preview deployments | 1 | Pending |
| INFRA-03 | Environment variables configured | 1 | Pending |
| INFRA-04 | Build consistency (local → Cloudflare) | 1 | Pending |
| INFRA-05 | Build time < 90s | 1 | Pending |
| INFRA-06 | Cache headers per route | 6 | Pending |
| INFRA-07 | Rollback capability | 6 | Pending |

**Mapped: 73/73 ✓**

---

## Critical Path & Dependencies

```
Phase 1 (Foundation)
  ↓ (Astro + TypeScript + Tailwind + Deployment)
Phase 2 (Integrations)
  ↓ (Hostaway API + Prismic CMS + Room pages)
Phase 3 (Availability & Booking)
  ↓ (Date picker + API + Redirect)
Phase 4 (Content & Contact)
  ↓ (Contact form + Email backend)
Phase 5 (Performance & Mobile)
  ↓ (Images + Web Vitals + Responsive)
Phase 6 (Monitoring, Analytics & Launch)
  ↓ (Sentry + GA4 + A11Y + SEO + Production)
```

Each phase depends on the previous. Sequential execution recommended.

---

## Success Criteria for Roadmap Completion

- [x] All 73 v1 requirements mapped to exactly one phase
- [x] No orphaned requirements
- [x] Each phase has 2-5 observable success criteria (not tasks)
- [x] Dependencies between phases are clear and unidirectional
- [x] Critical path identified (Astro → Integrations → Booking → Quality → Launch)
- [x] Granularity appropriate for standard project (6 phases, ~12 requirements each)

---

*Roadmap created: 2026-05-05*  
*Next: User approval → `/gsd-plan-phase 1` to decompose Phase 1 into executable plans*
