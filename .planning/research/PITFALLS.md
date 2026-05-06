# Pitfalls Research — Hospitality Websites

## Executive Summary

Bristol Inn's proof-of-concept is vulnerable to **15 specific pitfalls** across technical, product, operational, and team domains. The most critical: availability data desync, Hostaway API rate limiting, and scope creep derailing the PoC. This research maps each pitfall to detection signals, prevention strategies, and which phase should address it.

## Critical Pitfalls (Address in Phase 1)

### 1. Availability Data Desync — CRITICAL

**What happens:**
Static HTML shows "Available" for dates, but Hostaway API says "Booked" when user tries to check availability. User feels misled and abandons.

**How to detect:**
- Test: Build site → Immediately book a room on Hostaway → Reload room page → Check availability → See stale "Available" badge
- Warning sign: Build timestamps don't match Hostaway data fetch time

**How to prevent:**
- **NEVER** bake availability into static HTML
- Always fetch availability on-demand (client-side API call or server-side before redirect)
- For static HTML: Show "Check availability" button, not "Available/Unavailable"
- Validate availability server-side before redirecting to Hostaway
- Re-check availability with client-side API if user selected same dates twice

**Phase to address:** Phase 1 (mandatory; without this, booking flow is broken)

**Implementation:**
```javascript
// WRONG: Baking into HTML at build time
<div>Available: May 10-12</div>

// RIGHT: Fetch on-demand
<button onclick="checkAvailability(dates)">Check Availability</button>
// → API call → Real-time Hostaway data → Show fresh result
```

### 2. Hostaway API Rate Limiting — CRITICAL

**What happens:**
During build or peak traffic, API calls to Hostaway exceed rate limit. API returns 429 (Too Many Requests). Build fails mid-deploy; site shows error or stale data.

**How to detect:**
- Test: Run 3 concurrent builds while users check availability → Monitor API response codes
- Warning sign: Build times vary wildly (10s one time, 90s next time)

**How to prevent:**
- **Batch requests** — Fetch 10 rooms per request, not 1 room per request
- **Implement exponential backoff retry** — 1s, 2s, 4s, 8s delays between retries
- **Circuit breaker pattern** — If API fails 3x in a row, fail fast instead of retrying forever
- **Cache aggressively** — Keep Hostaway data in Cloudflare KV for 30 minutes
- **Monitor API response codes** — Log all non-2xx responses to Sentry
- **Contact Hostaway support** — Clarify rate limits per your API tier upfront

**Phase to address:** Phase 1 (spike week 1)

**Open question needing Phase 1 spike:**
> How many requests/minute does Hostaway allow? What's the optimal batch size?

### 3. Image & Video Performance Drag — CRITICAL (Mobile)

**What happens:**
Room photos load slowly (unoptimized 5MB JPEGs). LCP > 5s on 4G. Mobile users see blank room cards for 10 seconds. 7% of potential bookings lost per second of delay.

**How to detect:**
- Test: Open `/rooms` on mobile 4G → Time until room photos visible
- Warning sign: LCP > 2.5s in Lighthouse; users report slow experience

**How to prevent:**
- **Use Astro `<Image>` component** — Automatic optimization, lazy loading, AVIF/WebP
- **Serve multiple sizes** — Thumbnail 300x300, detail 800x800, hero 1200x1200
- **Enable lazy loading** — Images below fold don't load until needed
- **Use WebP/AVIF** — 60-70% smaller than JPEG
- **Optimize in Hostaway** — Download photos from Hostaway, re-encode at optimal sizes
- **Test on real 4G** — DevTools can throttle, but test on actual mobile network

**Phase to address:** Phase 1 (non-negotiable for mobile)

**Metrics to monitor:**
- LCP < 2.5s (requirement)
- Time to first room image < 1.5s
- Total image payload < 2MB for `/rooms` page

### 4. Cloudflare Cache Invalidation Blindness — CRITICAL

**What happens:**
After deploying new room data, Cloudflare edge still serves 30-day cached old pages. Users see stale room descriptions, outdated amenities, or old prices for hours.

**How to detect:**
- Test: Deploy update → Check Cloudflare status → See pages still cached
- Warning sign: User reports "I saw different amenities yesterday"

**How to prevent:**
- **Set cache headers per route** — Not all pages need 30 days
  - Static pages (about, contact): 30 days
  - Room listings: 24 hours (changes daily)
  - Room details: 24 hours
  - API responses: 5-30 minutes
- **Purge cache on-demand** — After Hostaway fetch, tell Cloudflare to invalidate
- **Use stale-while-revalidate** — Serve cached copy while fetching fresh
- **Monitor cache hit rate** — Cloudflare dashboard shows if cache is working
- **Webhook-triggered rebuilds** — Prismic publishes → Webhook → Rebuild + cache purge

**Phase to address:** Phase 1 (set up correctly from start)

**Implementation checklist:**
```
✓ Define cache headers per route in Astro config
✓ Test cache headers with DevTools (response headers)
✓ Set up Cloudflare cache purge on successful build
✓ Monitor cache behavior in staging before production
```

### 5. Booking Redirect Loop / Handoff Friction — CRITICAL

**What happens:**
URL parameters malformed or availability check fails → User clicks "Book Now" → Redirected to Hostaway with bad params → Hostaway redirects back with error → Loop or confusion.

**How to detect:**
- Test: Book a room → Capture Hostaway redirect URL → Verify params are correct
- Warning sign: Users report "Button didn't work" or "Confused about where to complete booking"

**How to prevent:**
- **Build Hostaway URL carefully** — Verify exact format: room ID format, date format (YYYY-MM-DD or MM/DD/YYYY?), guest count required?
- **Validate params before redirect** — Check that room ID exists, dates are in future, checkout > checkin
- **Test in Hostaway sandbox** — Before production, test entire flow in Hostaway test environment
- **Re-check availability server-side** — Before redirect, confirm room still available
- **Clear messaging** — "You are about to be redirected to Hostaway to complete payment" + confirmation button
- **Handle Hostaway failures** — If Hostaway is down, show "Unable to book right now, please call [number]"

**Phase to address:** Phase 1 (mandatory for checkout flow)

**Open questions needing Phase 1 spike:**
> What's the exact Hostaway redirect URL format? What params are required? What happens if a param is missing?

### 6. Sentry Misconfiguration — CRITICAL

**What happens:**
JavaScript errors occur silently (no Sentry initialization, wrong DSN, filter misconfig). Errors go unreported. You have no visibility into user issues.

**How to detect:**
- Test: Trigger an error (console.error("test")) → Check Sentry dashboard → Confirm event received
- Warning sign: Error messages in console but nothing in Sentry; no Sentry events after 1 week live

**How to prevent:**
- **Initialize Sentry early** — Phase 1, before any other integrations
- **Set correct DSN** — Get it from Sentry project settings
- **Test in staging** — Trigger test error → Verify Sentry captures it
- **Route all API errors** — Catch fetch errors, log to Sentry
- **Set sample rate appropriately** — 10% for high-volume sites, 100% for low-traffic MVPs
- **Set up Sentry alerts** — Get notified of new errors immediately
- **Scrub PII** — Configure breadcrumb scrubbing to avoid capturing sensitive data

**Phase to address:** Phase 1 (no delay; errors go undetected otherwise)

**Checklist:**
```
✓ npm install @sentry/astro
✓ Add to astro.config.js
✓ Set SENTRY_DSN environment variable
✓ Test with console.error("test")
✓ Configure alerts in Sentry dashboard
✓ Set error sampling rate (10% for MVP)
```

## Technical Pitfalls (Address by Phase 2)

### 7. Analytics Tracking Debt — HIGH

**What happens:**
Event names inconsistent ("booking_started" vs "book_started" vs "check_booking"). PII tracked (email, phone captured in events). No funnel visibility. After 1 month, data is useless.

**How to detect:**
- Check GA4: Event names have typos or inconsistent naming
- Check: PII fields in event parameters (email, phone, credit card)
- Test: Can't create funnel report because event names don't match

**How to prevent:**
- **Define event taxonomy upfront** — "What 5 events matter for booking flow?"
  - page_view (automatic)
  - booking_started (user clicks "Check Availability")
  - room_selected (user picks a room)
  - checkout_initiated (redirect to Hostaway)
  - form_submitted (contact form)
- **Use consistent naming** — snake_case, e.g., `booking_started`
- **No PII in events** — Track `room_id`, not `guest_email`
- **Use custom dimensions** — For properties like `inn_region`, `season`, `device_type`
- **Don't over-instrument** — Start with 5 events; add more if you see gaps
- **Review monthly** — Does this event tell us something useful? If not, remove.

**Phase to address:** Phase 1 (plan it), Phase 2 (implement fully)

**Checklist:**
```
✓ List 5-10 key events (page_view, booking_started, etc.)
✓ Define exactly what triggers each event
✓ No PII in event data
✓ Verify events in GA4 real-time dashboard
✓ Create funnel report: page_view → booking_started → room_selected → checkout_initiated
```

### 8. Mobile Booking Flow Abandonment — HIGH

**What happens:**
Form fields too small to tap on mobile. Date picker not mobile-optimized. Progress indicator missing. 40% of users start checkout, 30% abandon before submitting dates.

**How to detect:**
- Test on actual iPhone 12 / Android: Can you tap form fields easily?
- Google Analytics: Session drop-off before checkout completion
- User testing: "This is frustrating to fill out on mobile"

**How to prevent:**
- **Mobile-first layout** — Design for 375px width first; expand for desktop
- **Touch targets 44x44px minimum** — Buttons, inputs, date picker selections
- **Native date picker** — Use `<input type="date">` on mobile; falls back to native picker
- **Real device testing** — Don't just use DevTools; test on real phone on 4G
- **Progress indicator** — Show "Step 1 of 3" so user knows they're almost done
- **Auto-fill form fields** — Pre-fill guest count, email if available
- **Visible validation errors** — Red border + error message below field (not tiny red text)
- **Bottom-aligned CTAs** — Avoid floating headers pushing CTA off-screen

**Phase to address:** Phase 1 (non-negotiable for mobile conversion)

**Test checklist:**
```
✓ Fill out booking form on mobile without zoom
✓ Date picker functional and usable on mobile
✓ All interactive elements 44px+ tap targets
✓ Form submission < 1 second
✓ Error messages visible and clear
✓ Progress indicator shows steps remaining
```

### 9. SEO Ignored Until Too Late — HIGH

**What happens:**
Launch site with no meta tags, no schema.org markup, no sitemap. Google can't understand what the site is. Zero organic search traffic for 6 months. Regret.

**How to detect:**
- Check: `<title>` missing or duplicated across pages
- Check: `<meta name="description">` missing or vague
- Check: No `robots.txt` or sitemap
- Google Search Console: 0 impressions after 1 month

**How to prevent:**
- **SEO is mandatory in v1** — Not deferrable to Phase 2
- **Unique titles per page** — `Bristol Inn: Luxury B&B with Hot Tub near [Town]`
- **Unique meta descriptions** — 160 chars, call to action: `Book your stay at Bristol Inn. Hot tub, farm-to-table breakfast, walking distance to downtown.`
- **Heading hierarchy** — One `<h1>` per page, `<h2>` for major sections
- **Schema markup (JSON-LD)** — Hotel + Room + AggregateOffer schema
  ```json
  {
    "@context": "schema.org",
    "@type": "Hotel",
    "name": "Bristol Inn",
    "url": "https://bristolinn.com",
    "description": "Luxury B&B with hot tub near downtown",
    "image": "https://...",
    "address": {...},
    "telephone": "+1...",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "95",
      "highPrice": "195"
    }
  }
  ```
- **Sitemap** — Auto-generated by Astro; submit to Google Search Console
- **robots.txt** — Allow Googlebot, disallow `/api/` endpoints
- **Open Graph tags** — For social sharing (meta og:title, og:image, etc.)

**Phase to address:** Phase 1 (not deferrable)

**Implementation checklist:**
```
✓ Generate <title> and <meta name="description"> per page
✓ Add schema.org Hotel + Room markup to pages
✓ Create sitemap.xml (Astro handles this)
✓ Create robots.txt
✓ Add Open Graph tags
✓ Submit sitemap to Google Search Console
✓ Test with Google Rich Results Test
```

## Operational Pitfalls

### 10. Deployment Surprises — MEDIUM

**What happens:**
Build succeeds locally, fails on Cloudflare (missing env var, API key wrong, network timeout). Site goes down or shows error page.

**How to detect:**
- Deploying to production → Build fails → Site broken for 10 minutes
- Error: "HOSTAWAY_API_KEY is not defined"

**How to prevent:**
- **Externalize all config** — No hardcoded API keys, URLs, or environment-specific settings
- **Use Cloudflare environment secrets** — Don't commit API keys to git
- **Test build locally with env vars** — Before merging: `SENTRY_DSN=... npm run build`
- **Logs visible in Cloudflare** — Check build logs after each deploy
- **Notify on build failure** — Slack/email alert when deploy fails
- **Rollback strategy** — Know how to revert to previous working version

**Phase to address:** Phase 1 (set up from day 1)

**Checklist:**
```
✓ All API keys in .env.local (not in source)
✓ Cloudflare: Environment variables set (HOSTAWAY_API_KEY, PRISMIC_TOKEN, etc.)
✓ Test build locally: npm run build (should succeed with env vars set)
✓ Check Cloudflare build logs after each deploy
✓ Know how to rollback: git revert + push
```

### 11. Prismic Workflow Not Enforcing Review — MEDIUM

**What happens:**
Non-technical team member edits About page → Publishes directly → Typo goes live → Looks unprofessional. No approval step.

**How to detect:**
- "There's a typo on the About page" message from user
- Checking Prismic: Anyone can publish without review

**How to prevent:**
- **Enable Prismic draft + review workflow** — Publish goes to review queue, not live
- **Assign a reviewer** — Content manager approves before going live
- **Preview before publish** — Use Cloudflare PR preview to review content changes
- **Webhook on publish** — Automatically rebuild site when content goes live
- **Schedule releases** — Prismic can publish multiple changes together at scheduled time

**Phase to address:** Phase 1 (set up review workflow)

**Checklist:**
```
✓ Prismic: Turn on draft + publish states
✓ Create review workflow in Prismic dashboard
✓ Assign reviewers (who approves before live?)
✓ Test: Edit content → Save as draft → Preview in PR URL → Approve → Watch rebuild
```

### 12. Monitoring Blindness — MEDIUM

**What happens:**
Hostaway API is down for 2 hours. You don't know. Users can't check availability. They contact support. Eventually you notice.

**How to detect:**
- Manual status checks (checking Hostaway status page daily)
- User complaints ("Availability checker isn't working")
- Sentry errors spike (customers reporting in errors)

**How to prevent:**
- **Monitor API health** — Set up automated health checks
  - Every 5 minutes: `curl https://api.hostaway.com/health`
  - If fails 3x: Alert (Slack/email/PagerDuty)
- **Sentry alerts for error spikes** — "5+ [specific error] in last 5 minutes → alert"
- **Cloudflare analytics** — Monitor 4xx/5xx error rates
- **Manual status page subscription** — Follow Hostaway's status page for outages
- **Fallback behavior** — If Hostaway is down, show "Booking temporarily unavailable. Please call [number]."

**Phase to address:** Phase 2 (Phase 1 is small enough to handle manually)

**Checklist:**
```
✓ Set up Sentry alerts for error spikes
✓ Cloudflare: Monitor 4xx/5xx error rates
✓ Subscribe to Hostaway status page (Twitter, email)
✓ Implement fallback: If API fails, show cached availability or "call to book"
✓ Create runbook: "Hostaway is down. What do we do?" (answer: show fallback message)
```

## Team & Process Pitfalls

### 13. Scope Creep in PoC — CRITICAL

**What happens:**
Stakeholder asks: "Can we also add guest accounts, payment processing, and a blog?" Your "2-week PoC" becomes 2 months. You never ship.

**How to detect:**
- New requirements added after PROJECT.md is locked
- Scope keeps expanding week-to-week
- Team says "We're still working on the PoC"

**How to prevent:**
- **Lock scope in PROJECT.md** — "What This Is" and "Out of Scope" sections
- **Create backlog** — "We'll add this in Phase 2"
- **Define "PoC done"** — Specific, measurable: "Users can browse rooms, check availability, and redirect to Hostaway checkout"
- **Review scope weekly** — If new requests come in, log to backlog; don't retrofit into PoC
- **Communicate clearly** — "We're shipping a sparse proof of concept first. Polish comes after validation."

**Phase to address:** Phase 1 (start of project)

**Checklist:**
```
✓ PROJECT.md locked (scope agreed on)
✓ Backlog created (feature requests logged for Phase 2+)
✓ Team understands: sparse PoC first, then polish
✓ Weekly check-in: Any new scope requests? (log to backlog, don't change plan)
✓ Success criteria defined: "PoC done when users can book end-to-end"
```

### 14. PoC → Production Refactoring Debt — MEDIUM

**What happens:**
"Just ship it" during PoC phase. Code is sparse, error handling minimal. Ship to production. Later realize you need to refactor 50% of code.

**How to prevent:**
- **Plan for refactoring** — Block 20% of Phase 2 for tech debt cleanup
- **Document decision rationale** — "We deferred X because Y; we'll address in Phase 2"
- **Keep code clean during PoC** — Sparse ≠ sloppy. Proper error handling, typed inputs, separated concerns
- **Test core flows end-to-end** — Before shipping: Can user book? Can they contact us?
- **Code review before shipping** — Even PoC should have basic standards

**Phase to address:** Phase 1 (build sustainably from start)

**Practices to adopt:**
```
✓ TypeScript strict mode (catches many bugs)
✓ Try-catch around API calls (graceful errors)
✓ Dependency wrapping (easy to swap Hostaway for competitor later)
✓ Env var management (no hardcoded config)
✓ Error tracking (Sentry from day 1)
✓ Code review before merge (even for PoC)
```

### 15. Unknown Unknowns (API Limitations) — HIGH

**What happens:**
Hostaway API doesn't support feature you assumed. Prismic webhook is unreliable. Cloudflare rate-limits redirects. Discover mid-Phase 2.

**How to detect:**
- Reading API docs: "Oh, this isn't supported"
- Testing: Feature doesn't work as expected

**How to prevent:**
- **Phase 1 spikes** — Spend 2-3 days testing critical APIs before planning
  - Hostaway: Can we fetch all rooms? Photos? Availability? Rates? Redirects?
  - Prismic: How do webhooks work? Can we preview draft content in PR?
  - Cloudflare Pages: Build time? Preview URLs? Cache headers?
- **Read API docs thoroughly** — Not training data; official docs only
- **Test in sandboxes** — Hostaway has a sandbox; test there first
- **Ask vendors directly** — Email support with specific questions

**Phase to address:** Phase 1 week 1 (spike before planning)

**Critical questions for Phase 1 spike:**
```
Hostaway:
  ✓ What's the maximum number of concurrent API calls?
  ✓ Rate limits (per minute, per day)?
  ✓ Response format for room photos? Size? Resolution options?
  ✓ Redirect URL format for booking (exact params)?
  ✓ Can we fetch availability for bulk date ranges?
  ✓ Webhook support for new bookings/changes?

Prismic:
  ✓ How do preview URLs work? Do they work with Cloudflare PR URLs?
  ✓ Draft content accessible via API or dashboard only?
  ✓ Webhook format when content is published?
  ✓ Max API calls per day?

Cloudflare Pages:
  ✓ Exact build time for 10-room site?
  ✓ Can we set cache headers per route?
  ✓ Webhook API for cache purging?
  ✓ How reliable are PR preview URLs?
```

## Summary: Pitfalls by Severity

| Pitfall | Severity | Phase | Action |
|---------|----------|-------|--------|
| Availability desync | CRITICAL | 1 | Never bake into HTML; always on-demand |
| API rate limiting | CRITICAL | 1 | Spike to verify limits; implement backoff |
| Image performance | CRITICAL | 1 | Use Astro Image; test LCP on 4G |
| Cache invalidation | CRITICAL | 1 | Set cache headers per route |
| Booking redirect | CRITICAL | 1 | Validate params; test Hostaway sandbox |
| Sentry misconfiguration | CRITICAL | 1 | Initialize day 1; test with dummy error |
| Analytics debt | HIGH | 1 | Plan; implement in Phase 2 fully |
| Mobile abandonment | HIGH | 1 | Mobile-first design; real device test |
| SEO ignored | HIGH | 1 | Not deferrable; include in v1 |
| Deployment surprises | MEDIUM | 1 | Externalize config; test locally |
| Prismic review workflow | MEDIUM | 1 | Enable draft/review in Prismic |
| Monitoring blindness | MEDIUM | 2 | Set up alerts; subscribe to status pages |
| Scope creep | CRITICAL | 1 | Lock scope; create backlog |
| PoC → refactoring debt | MEDIUM | 1 | Code cleanly; plan refactor phase |
| Unknown API limitations | HIGH | 1 | Spike week 1; test APIs thoroughly |

## Phase 1 Success Criteria (Avoiding These Pitfalls)

✓ Availability never stale (always on-demand check)  
✓ API rate limiting tested (know the limits)  
✓ LCP < 2.5s on 4G mobile  
✓ Cache headers per route validated  
✓ Booking redirect working end-to-end in sandbox  
✓ Sentry initialized + test error logged  
✓ Event taxonomy defined (implement in Phase 2)  
✓ Mobile booking flow tested on real device  
✓ SEO scaffolding in place (titles, descriptions, schema)  
✓ Env vars externalized; no secrets in source  
✓ Scope locked; backlog created  
✓ Code clean (error handling, typed inputs)  
✓ Critical API limitations surfaced (from spikes)  

---

*Last updated: 2026-05-05 with hospitality website pattern analysis*
