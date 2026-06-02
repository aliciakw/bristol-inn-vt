# Bristol Inn — Content Website

## What This Is

A proof-of-concept website for a small inn that demonstrates integration of modern web technologies. The site scaffolds all key integrations (Hostaway for room management, Sanity for content, Sentry for error tracking, GA4 for analytics, Cloudflare Pages for hosting) with spare, minimal implementation. Visual polish and a composable component library are deferred to a later phase.

The website prioritizes:
- Fast load times on poor internet (leverage Astro static-first)
- SEO and accessibility best practices
- Proof of all critical integrations
- Foundation for future polish without rework

## Core Value

Guests can browse rooms, check availability, and start the booking flow on a fast, SEO-optimized website. Site teams can manage content through Sanity Studio and track user behavior with GA4. Site errors are captured in Sentry for debugging.

## Scope — V1

### Pages & Routes

- **Home/Landing** — Marketing overview of the inn
- **Room Listings** — Browse all rooms with basic details (powered by Hostaway API)
- **Room Details** — Individual room page with amenities, photos, availability calendar
- **Booking Flow** — Date picker → room selection → redirect to Hostaway checkout
- **Contact/Inquiry** — Contact form for general questions
- **Generic Page** — Sanity-driven page that renders any content document at its slug URL

### Hostaway Integration

- Read-only: Fetch and display rooms, availability, rates
- Checkout redirects to Hostaway's booking interface (no embedded payment handling)

### Sanity CMS

- Generic page template for flexible content management
- No auth required for v1 — all pages public

### Integrations

- **Sentry** — Error tracking and debugging
- **GA4** — Page view tracking; basic event tracking (TBD which metrics)
- **Cloudflare Pages** — Hosting with PR preview deployments
- **Cloudflare Pages Functions** — Minimal backend if needed (anticipated: very little to none)

### Data Freshness

- Hostaway updates frequently (daily/hourly)
- Site strategy: On-demand or scheduled incremental rebuilds to stay fresh
- Content managed via Sanity Studio at ./studio-bristol-inn-vt

### Architecture (Scaffolded, Not Visual)

- TypeScript strict mode throughout
- Astro for static-first rendering
- Tailwind CSS for styling (mobile-first, 3 breakpoints)
- Component structure prepared for atoms → molecules → composite pattern (implementation deferred to polish phase)

## What's NOT in V1

- Embedded payment processing
- User authentication or guest accounts
- Advanced analytics (only basic page view / event tracking)
- Visual polish or high-fidelity design
- Responsive component library (scaffolded; actual atoms/molecules built in polish phase)
- Admin panel

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Start with proof of concept, defer polish | Get all integrations working before perfecting visuals; easier to refactor structure than to add missing tech later | Spare scaffold now, beautiful later |
| Hostaway read-only + external redirect | Simplify v1; defer complex booking mutations until core flow is proven | Faster time-to-working prototype |
| Draft content in previews | Content teams can review unpublished changes before going live | Better collaboration workflow |
| Cloudflare Pages + Functions | Aligned with static-first philosophy; minimal backend if needed | Cost-effective, fast, integrates well with Astro |
| No auth in v1 | All pages public; simplifies initial scope | Revisit when guest accounts become valuable |

## Context

This is a greenfield project built by a single developer (Alicia Willett) for a small inn. The immediate goal is to validate the tech stack and get a working site live. Future iterations will add visual polish and deeper feature sets (guest accounts, advanced booking, reviews, etc.) based on user feedback.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Home page displaying inn overview (from Sanity)
- [ ] Room listings fetched from Hostaway API with real-time availability
- [ ] Individual room detail pages with amenities and photos
- [ ] Booking flow that checks availability and redirects to Hostaway checkout
- [ ] Contact/inquiry form with basic validation
- [ ] Generic Sanity page template that renders any content document
- [ ] Sentry error tracking configured and reporting
- [ ] GA4 page view tracking implemented
- [ ] Cloudflare Pages deployment with PR preview links
- [ ] TypeScript strict mode enforced throughout
- [ ] Tailwind CSS styling with mobile-first approach
- [ ] Component structure prepared for atoms → molecules architecture (not yet visual implementation)

### Out of Scope

- Embedded payment processing — redirects to Hostaway instead
- User authentication or guest accounts — all public for v1
- Advanced analytics and custom event tracking — only basic metrics
- Visual polish and responsive design system — minimal, scaffolded only
- Admin panel — manage content through Sanity Studio directly
- Cloudflare Pages Functions backend — deferred until needed

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

*Last updated: 2026-05-05 after initialization*
