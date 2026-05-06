# Bristol Inn — V1 Requirements

## Overview

These are the v1 requirements for the Bristol Inn proof-of-concept website. Each requirement is specific, testable, and aligned with the research findings. Requirements are organized by feature category and mapped to phases via the **Traceability** section (updated during roadmap creation).

---

## V1 Requirements (Proof of Concept)

### Room Management (ROOM)

- [ ] **ROOM-01**: Fetch all rooms from Hostaway API at build time, including title, description, amenities, photos, and rates
- [ ] **ROOM-02**: Generate static room listing page (`/rooms`) showing all rooms with thumbnail photos, amenity badges, and nightly rates
- [ ] **ROOM-03**: Generate individual static room detail pages (`/rooms/:id`) with full-size photos, complete description, amenities list, and rates
- [ ] **ROOM-04**: Room listings display high-quality photos from Hostaway using Astro Image component with lazy loading and WebP/AVIF format
- [ ] **ROOM-05**: Amenity badges on room cards (e.g., "WiFi", "Hot Tub", "Water View") visually distinct and scannable
- [ ] **ROOM-06**: Room detail pages include gallery carousel or scrollable photo section with 4+ photos per room
- [ ] **ROOM-07**: Display nightly rate clearly on room cards and detail pages; show estimated total for sample stay (e.g., "3 nights: $450")

### Availability & Booking (BOOK)

- [ ] **BOOK-01**: Implement date picker component that allows guests to select check-in and check-out dates on `/rooms` page
- [ ] **BOOK-02**: Check availability in real-time via API call (not static) when guest selects dates, confirming room is still available
- [ ] **BOOK-03**: Display available rooms filtered by selected dates with updated pricing and availability status
- [ ] **BOOK-04**: Show availability calendar on room detail page indicating blocked/open dates (visual indicator, updated on load)
- [ ] **BOOK-05**: "Book Now" button redirects to Hostaway checkout with pre-filled parameters (room ID, check-in date, check-out date, guest count)
- [ ] **BOOK-06**: Validate booking parameters server-side before redirect (confirm dates are future, checkout > check-in, room ID exists)
- [ ] **BOOK-07**: Clear messaging before redirect: "You will be redirected to Hostaway to complete your booking securely"
- [ ] **BOOK-08**: Availability API endpoint (`GET /api/rooms/:id/availability?checkIn=...&checkOut=...`) returns real-time data from Hostaway
- [ ] **BOOK-09**: Fallback behavior if Hostaway API fails: show cached availability or "Call to book" CTA instead of error

### Content Management (CONTENT)

- [ ] **CONTENT-01**: Homepage (`/`) renders content from Prismic with hero section, inn overview, and call-to-action
- [ ] **CONTENT-02**: Generic page template accepts Prismic content documents and renders at URLs determined by page slug (e.g., `/about`, `/contact`)
- [ ] **CONTENT-03**: Prismic draft content is accessible in Cloudflare PR preview deployments (via preview URL with draft content flag)
- [ ] **CONTENT-04**: Contact page (`/contact`) displays contact information prominently (email, phone, address)
- [ ] **CONTENT-05**: Contact form on `/contact` page with fields: name, email, message; client-side validation
- [ ] **CONTENT-06**: Contact form submission sends data to backend API endpoint (`POST /api/contact/submit`)
- [ ] **CONTENT-07**: Backend contact form handler sends confirmation email to guest and notification email to inn
- [ ] **CONTENT-08**: About page (`/about` or via Prismic slug) displays inn story, history, and value proposition

### Performance & Web Vitals (PERF)

- [ ] **PERF-01**: Largest Contentful Paint (LCP) < 2.5 seconds on 4G mobile network (tested with real device, not DevTools throttling)
- [ ] **PERF-02**: Cumulative Layout Shift (CLS) < 0.1 (no jumping content during page load)
- [ ] **PERF-03**: First Contentful Paint (FCP) < 1.8 seconds
- [ ] **PERF-04**: Time to Interactive (TTI) < 3.8 seconds
- [ ] **PERF-05**: All room listing pages cached by Cloudflare edge for 24 hours to avoid unnecessary rebuilds
- [ ] **PERF-06**: Availability API responses cached on Cloudflare edge for 5-30 minutes (depending on season)
- [ ] **PERF-07**: Static assets (CSS, JS, images) use versioned filenames and cache-forever headers
- [ ] **PERF-08**: Images in room galleries are optimized: multiple sizes (thumbnail 300x300, detail 800x800), lazy-loaded, WebP/AVIF format
- [ ] **PERF-09**: Homepage loads in < 2 seconds on 4G mobile

### Responsive Design & Mobile (MOBILE)

- [ ] **MOBILE-01**: All pages render correctly on mobile (375px width) without horizontal scroll
- [ ] **MOBILE-02**: Room listing page is single-column on mobile, multi-column on tablet/desktop (Tailwind responsive)
- [ ] **MOBILE-03**: Date picker is touch-friendly on mobile with 44x44px minimum tap targets; uses native `<input type="date">` (falls back to native mobile picker)
- [ ] **MOBILE-04**: Photo galleries are scrollable (swipe) on mobile; carousel auto-pauses on user interaction
- [ ] **MOBILE-05**: Booking flow form fields are readable (16px+ text) and tappable (44x44px targets) on mobile without zoom
- [ ] **MOBILE-06**: Fixed headers do not consume more than 15% of mobile viewport height
- [ ] **MOBILE-07**: Contact form is usable on mobile (single column, large inputs, visible submit button)
- [ ] **MOBILE-08**: Navigation menu is accessible on mobile (hamburger menu or expandable nav)

### Accessibility (A11Y)

- [ ] **A11Y-01**: All images have descriptive alt text (e.g., "Sunset Suite with hot tub on private balcony", not "room.jpg")
- [ ] **A11Y-02**: Color contrast meets WCAG AA minimum (4.5:1 for normal text, 3:1 for large text)
- [ ] **A11Y-03**: Entire booking flow is navigable via keyboard only (Tab through inputs, Enter to submit)
- [ ] **A11Y-04**: Focus indicators are visible and clear (do not remove browser default)
- [ ] **A11Y-05**: Form inputs have associated labels (via `<label>` or `aria-label`)
- [ ] **A11Y-06**: Headings use semantic hierarchy (`<h1>` once per page, `<h2>` for major sections)
- [ ] **A11Y-07**: Decorative images use `alt=""` (empty alt attribute)
- [ ] **A11Y-08**: Page is navigable without JavaScript (graceful degradation)

### SEO & Discoverability (SEO)

- [ ] **SEO-01**: Each page has unique `<title>` tag with keyword (e.g., "Sunset Suite with Hot Tub - Bristol Inn")
- [ ] **SEO-02**: Each page has unique `<meta name="description">` (160 chars, compelling CTA)
- [ ] **SEO-03**: Homepage includes schema.org Hotel markup (JSON-LD) with name, address, contact, photos
- [ ] **SEO-04**: Each room detail page includes schema.org Room markup with name, description, amenities, rates, photos
- [ ] **SEO-05**: Contact information structured with schema.org (email, phone, address on contact page)
- [ ] **SEO-06**: Auto-generated `sitemap.xml` includes all pages and room detail URLs
- [ ] **SEO-07**: `robots.txt` allows search engines and disallows `/api/` endpoints
- [ ] **SEO-08**: Open Graph meta tags (og:title, og:description, og:image) for social sharing
- [ ] **SEO-09**: Canonical tags prevent duplicate content issues

### Error Tracking & Monitoring (MONITOR)

- [ ] **MONITOR-01**: Sentry is initialized and configured with correct DSN in production environment
- [ ] **MONITOR-02**: JavaScript errors are automatically captured and sent to Sentry
- [ ] **MONITOR-03**: API errors (Hostaway, Prismic, contact form) are logged to Sentry with error context
- [ ] **MONITOR-04**: Sentry dashboard has alerts configured for error spikes (e.g., 5+ errors in 5 minutes)
- [ ] **MONITOR-05**: Sentry breadcrumbs capture user actions before errors (navigation, form interactions)
- [ ] **MONITOR-06**: PII (email, phone, credit card data) is NOT captured by Sentry (scrubbed/filtered)

### Analytics (GA4)

- [ ] **GA4-01**: GA4 tracking code installed; page views are automatically tracked
- [ ] **GA4-02**: Custom event "booking_started" fires when user clicks "Check Availability" button
- [ ] **GA4-03**: Custom event "room_selected" fires when user selects a specific room to book
- [ ] **GA4-04**: Custom event "checkout_initiated" fires when user is redirected to Hostaway
- [ ] **GA4-05**: Custom event "contact_form_submitted" fires when contact form is successfully submitted
- [ ] **GA4-06**: No PII is captured in GA4 events (email, phone, credit card data are filtered)
- [ ] **GA4-07**: GA4 funnels can be created: page_view → booking_started → room_selected → checkout_initiated

### TypeScript & Code Quality (CODE)

- [ ] **CODE-01**: All source code is written in TypeScript with `strict: true` in `tsconfig.json`
- [ ] **CODE-02**: API endpoints type request and response data
- [ ] **CODE-03**: Component props are typed with interfaces/types
- [ ] **CODE-04**: No `any` types used (or documented with explanation)
- [ ] **CODE-05**: Environment variables are validated at startup (missing vars cause clear error messages)
- [ ] **CODE-06**: API keys and secrets are stored in environment variables, not in source code
- [ ] **CODE-07**: Error handling: try-catch blocks around API calls with fallback UI

### Infrastructure & Deployment (INFRA)

- [ ] **INFRA-01**: Project deployed to Cloudflare Pages with automatic builds on main branch pushes
- [ ] **INFRA-02**: Pull request deployments are automatic with unique preview URLs
- [ ] **INFRA-03**: Cloudflare environment variables are configured (HOSTAWAY_API_KEY, PRISMIC_TOKEN, SENTRY_DSN, GA4_ID)
- [ ] **INFRA-04**: Build succeeds locally and on Cloudflare with identical environment variables
- [ ] **INFRA-05**: Build time is < 90 seconds for 1-10 rooms (acceptable for PoC)
- [ ] **INFRA-06**: Cache headers are set per route (see PERF requirements)
- [ ] **INFRA-07**: Rollback capability: can revert to previous working version via Cloudflare UI

---

## V2 Requirements (Deferred to Phase 2+)

These are valuable features to add after v1 validation. They are lower priority than table stakes.

### Content & Storytelling

- [ ] Staff bios with photos and backgrounds
- [ ] About page with inn history and timeline
- [ ] Guest testimonials integration (fetch from Hostaway reviews API)
- [ ] Seasonal updates or behind-the-scenes blog posts

### Booking Experience

- [ ] Room filtering by amenity (e.g., "Hot Tub", "Water View", "WiFi")
- [ ] Sorting options (price, size, rating)
- [ ] Guest count selector in date picker (impacts availability)
- [ ] Seasonal promotions or package deals (conditional pricing)

### Discovery & Marketing

- [ ] Location intelligence (map, nearby attractions, walking distances)
- [ ] Blog or location guides ("Top 5 hikes near Bristol Inn")
- [ ] Referral program or email newsletter signup
- [ ] Social media integration (Instagram feed, reviews)

### Advanced Analytics

- [ ] GA4 ecommerce tracking (booking funnel revenue tracking)
- [ ] Cohort analysis (repeat booking rates)
- [ ] Utm parameter tracking for marketing campaigns
- [ ] Custom dashboards in GA4

### Visual Polish (Phase 3+)

- [ ] Component library: atoms (button, image, link, input)
- [ ] Component library: molecules (card, form group, gallery)
- [ ] Component library: composites (room card, booking panel, contact form)
- [ ] Design system documentation
- [ ] Virtual tours or 360-degree room photos
- [ ] Video walkthrough of inn and rooms

---

## Out of Scope (V1 and Beyond)

These features will NOT be built, and the reasoning behind each decision.

| Feature | Why Out of Scope | Alternative |
|---------|-----------------|-------------|
| **User Accounts / Guest Logins** | No repeat booking demand identified yet; adds auth complexity to PoC | Revisit after v1 if return visitors justify it |
| **Direct Payment Processing** | PCI compliance, fraud handling, refunds = complex liability | Hostaway handles all payments securely |
| **Loyalty Program** | Requires user accounts first | Defer to Phase 4 if repeat bookings justify |
| **Live Chat Support** | Small inn cannot staff 24/7; adds operational burden | Email form with 24h response time promise |
| **Multi-Language Support** | No demand identified; impacts content maintenance | Revisit after validating local market |
| **Mobile App** | Web-responsive enough for mobile; app adds maintenance burden | Progressive web app optional in Phase 4 |
| **Advanced Admin Dashboard** | Prismic already handles content management; additional dashboard adds no value | Use Prismic UI for content; Hostaway UI for bookings |
| **Custom Booking Engine** | Hostaway integration is simpler and more reliable than building from scratch | Use Hostaway API + redirect |
| **Third-Party Integrations** (Slack, Zapier, etc.) | Adds complexity; no demand identified yet | Revisit after validating core workflow |
| **Accessibility Beyond WCAG AA** | WCAG AA is sufficient for legal compliance and good UX | Exceed standards in Phase 2 if feedback suggests |
| **Heavy Third-Party Widgets** | Each widget = more JavaScript, slower page load | Choose 1-2 essential tools; avoid bloat |

---

## Requirement Quality Checklist

✓ **Specific and testable** — "User can reset password via email link" (not "Handle password reset")  
✓ **User-centric** — "User can check availability" (not "System queries database")  
✓ **Atomic** — One capability per requirement (not "login and manage profile")  
✓ **Independent** — Minimal dependencies on other requirements  
✓ **No vague language** — Not "Handle authentication" or "Support sharing"  

---

## Traceability Matrix

This section is populated during roadmap creation. Each requirement is mapped to the phase that will implement it.

| REQ-ID | Requirement | Phase | Status |
|--------|-------------|-------|--------|
| ROOM-01 | Fetch rooms from Hostaway API | TBD | Pending |
| ROOM-02 | Generate room listing page | TBD | Pending |
| ROOM-03 | Generate room detail pages | TBD | Pending |
| ROOM-04 | Optimize photos with Astro Image | TBD | Pending |
| ROOM-05 | Amenity badges on cards | TBD | Pending |
| ROOM-06 | Room gallery carousel | TBD | Pending |
| ROOM-07 | Display pricing | TBD | Pending |
| BOOK-01 | Date picker component | TBD | Pending |
| BOOK-02 | Real-time availability check | TBD | Pending |
| BOOK-03 | Filter rooms by dates | TBD | Pending |
| BOOK-04 | Availability calendar | TBD | Pending |
| BOOK-05 | Redirect to Hostaway | TBD | Pending |
| BOOK-06 | Server-side parameter validation | TBD | Pending |
| BOOK-07 | Redirect messaging | TBD | Pending |
| BOOK-08 | Availability API endpoint | TBD | Pending |
| BOOK-09 | Fallback for API failures | TBD | Pending |
| CONTENT-01 | Homepage rendering | TBD | Pending |
| CONTENT-02 | Generic page template | TBD | Pending |
| CONTENT-03 | Prismic draft preview | TBD | Pending |
| CONTENT-04 | Contact page display | TBD | Pending |
| CONTENT-05 | Contact form validation | TBD | Pending |
| CONTENT-06 | Contact form API | TBD | Pending |
| CONTENT-07 | Email notifications | TBD | Pending |
| CONTENT-08 | About page | TBD | Pending |
| PERF-01 | LCP < 2.5s on 4G | TBD | Pending |
| PERF-02 | CLS < 0.1 | TBD | Pending |
| PERF-03 | FCP < 1.8s | TBD | Pending |
| PERF-04 | TTI < 3.8s | TBD | Pending |
| PERF-05 | Edge cache 24h (rooms) | TBD | Pending |
| PERF-06 | Edge cache 5-30min (availability) | TBD | Pending |
| PERF-07 | Versioned assets cache-forever | TBD | Pending |
| PERF-08 | Optimize room images | TBD | Pending |
| PERF-09 | Homepage < 2s on 4G | TBD | Pending |
| MOBILE-01 | No horizontal scroll on mobile | TBD | Pending |
| MOBILE-02 | Responsive columns (mobile → desktop) | TBD | Pending |
| MOBILE-03 | Touch-friendly date picker | TBD | Pending |
| MOBILE-04 | Swipeable galleries | TBD | Pending |
| MOBILE-05 | Mobile booking form | TBD | Pending |
| MOBILE-06 | Header height < 15% viewport | TBD | Pending |
| MOBILE-07 | Contact form mobile UX | TBD | Pending |
| MOBILE-08 | Mobile navigation | TBD | Pending |
| A11Y-01 | Descriptive alt text | TBD | Pending |
| A11Y-02 | WCAG AA color contrast | TBD | Pending |
| A11Y-03 | Keyboard navigation | TBD | Pending |
| A11Y-04 | Visible focus indicators | TBD | Pending |
| A11Y-05 | Form input labels | TBD | Pending |
| A11Y-06 | Semantic heading hierarchy | TBD | Pending |
| A11Y-07 | Decorative image handling | TBD | Pending |
| A11Y-08 | Works without JavaScript | TBD | Pending |
| SEO-01 | Unique page titles | TBD | Pending |
| SEO-02 | Unique meta descriptions | TBD | Pending |
| SEO-03 | Hotel schema markup | TBD | Pending |
| SEO-04 | Room schema markup | TBD | Pending |
| SEO-05 | Contact schema markup | TBD | Pending |
| SEO-06 | Auto-generated sitemap | TBD | Pending |
| SEO-07 | robots.txt | TBD | Pending |
| SEO-08 | Open Graph tags | TBD | Pending |
| SEO-09 | Canonical tags | TBD | Pending |
| MONITOR-01 | Sentry initialized | TBD | Pending |
| MONITOR-02 | JavaScript errors captured | TBD | Pending |
| MONITOR-03 | API errors logged | TBD | Pending |
| MONITOR-04 | Sentry alerts configured | TBD | Pending |
| MONITOR-05 | Breadcrumbs captured | TBD | Pending |
| MONITOR-06 | PII scrubbed from Sentry | TBD | Pending |
| GA4-01 | Page view tracking | TBD | Pending |
| GA4-02 | booking_started event | TBD | Pending |
| GA4-03 | room_selected event | TBD | Pending |
| GA4-04 | checkout_initiated event | TBD | Pending |
| GA4-05 | contact_form_submitted event | TBD | Pending |
| GA4-06 | PII filtered from GA4 | TBD | Pending |
| GA4-07 | Funnel creation enabled | TBD | Pending |
| CODE-01 | TypeScript strict mode | TBD | Pending |
| CODE-02 | API type safety | TBD | Pending |
| CODE-03 | Component prop types | TBD | Pending |
| CODE-04 | No `any` types | TBD | Pending |
| CODE-05 | Env var validation | TBD | Pending |
| CODE-06 | Secrets in env, not source | TBD | Pending |
| CODE-07 | Error handling & fallbacks | TBD | Pending |
| INFRA-01 | Cloudflare Pages deployment | TBD | Pending |
| INFRA-02 | PR preview deployments | TBD | Pending |
| INFRA-03 | Environment variables configured | TBD | Pending |
| INFRA-04 | Build consistency (local → Cloudflare) | TBD | Pending |
| INFRA-05 | Build time < 90s | TBD | Pending |
| INFRA-06 | Cache headers per route | TBD | Pending |
| INFRA-07 | Rollback capability | TBD | Pending |

---

## Success Criteria for V1

All requirements in the **V1 Requirements** section must be satisfied before considering the PoC complete.

**Non-negotiable (must have):**
- All room, booking, and content requirements (ROOM, BOOK, CONTENT categories)
- Performance metrics (LCP < 2.5s, CLS < 0.1)
- Mobile usability (responsive, touch-friendly)
- Core accessibility (alt text, contrast, keyboard navigation)
- SEO scaffolding (titles, descriptions, schema)
- Error tracking (Sentry working)

**Highly recommended (should have):**
- All monitoring and analytics requirements
- Full accessibility compliance
- Deployment to Cloudflare Pages

**Nice to have (defer if timeline pressure):**
- Some advanced SEO features (if foundational SEO is done)
- Advanced GA4 setup (if basic tracking is done)

---

## Evolution

This document evolves as the project progresses.

**After each phase transition:**
1. Requirements completed? → Move to validated section
2. Requirements invalidated? → Move to out of scope
3. New requirements emerged? → Add to V2/V3 sections

**After each milestone:**
1. Full review of all requirement sections
2. Core Value check — are these the right priorities?
3. Out of Scope audit — reasons still valid?

---

*Last updated: 2026-05-05 after requirement gathering*
