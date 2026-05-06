# Features Research — Hospitality Websites

## Table Stakes Features (Must Have or Users Leave)

These are baseline expectations. Guests will abandon if missing.

### Room Browsing & Discovery

- **Photo galleries (4+ photos per room)** — Users expect clear visuals: bed, bathroom, view, amenities. Missing photos = credibility loss and immediate exit.
- **Room descriptions with amenity list** — Clear statement of what's included (bed type, WiFi, AC, bathroom amenities). Vague descriptions increase refund requests.
- **Room pricing visibility** — Nightly rates visible without email capture. Hidden pricing causes abandonment.
- **Availability calendar** — Visual confirmation room is available on desired dates before booking. Essential for conversion.

### Booking & Checkout Flow

- **Date picker (check-in/check-out)** — Frictionless date selection. Poor date picker UX is a top abandonment trigger.
- **Real-time availability check** — Confirm room is available before redirecting to Hostaway. Discovering unavailability at checkout kills trust.
- **Clear booking instructions** — Guests must understand they're redirecting to Hostaway and what to expect. Surprise redirects cause confusion.
- **Price calculation visibility** — Total stay cost shown before payment. Prevents sticker shock.

### Responsive Mobile Design

- **Mobile-optimized room browsing** — 60-70% of initial inn research is on mobile. Poor mobile UX = lost bookings.
- **Touch-friendly date pickers** — Large tap targets (44x44px minimum), scrollable galleries, readable text.
- **Fast load on poor internet** — Critical for rural areas. Each 1-second delay = ~7% booking abandonment.

### Core Web Vitals & Performance

- **Page load under 2-3 seconds** — Guests have low patience for booking sites.
- **Image optimization** — Photos load progressively; don't block page rendering.
- **No layout shift during load** — Prevent accidental clicks during load (CLS < 0.1).

### Accessibility Basics

- **Image alt text** — For screen readers and image load failures.
- **Keyboard navigation** — Booking flow fully accessible without mouse.
- **Color contrast** — WCAG AA minimum (4.5:1). Excludes users with vision impairment if missing.

### Contact & Support

- **Contact form or email prominently visible** — Guests have pre-booking questions; easy contact increases conversions.
- **Clear response time expectations** — "We reply within 24 hours" reduces support burden.

## Differentiators (Competitive Advantage)

Features less common in small inns that provide competitive edge.

### Guest Testimonials & Social Proof ⭐

- **Reviews/ratings displayed on site** — Inns with 4.5+ stars convert at 2-3x rate of unreviewed competitors.
- **Guest photos & video testimonials** — User-generated content (guests in room, at breakfast) builds trust more than professional photos.
- **Detailed review snippets** — Specific details ("Cozy space, delicious breakfast, walking distance to downtown") drive booking more than generic praise.

**Complexity:** Medium  
**Payoff:** Very high (2-3x conversion lift)  
**For v1:** Integrate Hostaway reviews API; display 3-5 top reviews

### Storytelling & Inn Personality

- **Owner/staff bios with photos** — Guests buy experiences, not beds. Personal connection justifies premium pricing.
- **About page with inn history** — Creates emotional connection and differentiation.
- **Behind-the-scenes content** — Breakfast prep, seasonal updates show authenticity and care.

**Complexity:** Low (pure content)  
**Payoff:** High (increases perceived value)  
**For v1:** Write compelling about page + team bios; add photos in Phase 2

### Virtual Tours & 360 Photos

- **Interactive 360-degree room photos** — Reduces booking uncertainty; guests see layout from all angles.
- **Video walk-throughs** — 2-3 minute video of rooms, breakfast, grounds reduces cancellations by 5-10%.

**Complexity:** Medium-High  
**Payoff:** High (reduces cancellations)  
**For v1:** Defer; add in Phase 2 post-launch

### Location Intelligence

- **Interactive map showing inn location** — Shows proximity to attractions, restaurants, hiking.
- **Walking distance guide** — "Downtown: 5 min walk, Best restaurant: 10 min walk" helps guests plan.

**Complexity:** Low-Medium  
**Payoff:** Medium (helps decision-making)  
**For v1:** Simple map + nearby attractions list

### SEO & Content Discovery

- **Individual room pages optimized for search** — Long-tail keywords like "luxury B&B with hot tub near [town]".
- **Blog or location guides** — "Top 5 hikes near Bristol Inn" drives organic discovery.
- **Schema markup (JSON-LD)** — Helps Google understand rooms, pricing, reviews; improves SERP appearance.

**Complexity:** Low-Medium  
**Payoff:** High (organic traffic)  
**For v1:** Implement SEO scaffolding + schema markup

### Seasonal Promotions & Dynamic Pricing

- **Highlighted seasonal deals** — "Spring Package: 20% off, includes breakfast + wine tasting".
- **Early-bird discounts** — "Book 30+ days ahead, save 15%" encourages forward bookings.

**Complexity:** Medium  
**Payoff:** Medium (increases off-season bookings)  
**For v1:** Defer; implement in Phase 2 if Hostaway pricing API allows

### Smart Room Filtering

- **Filter rooms by amenity** — "I need WiFi and a hot tub" → show matching rooms.
- **Sort by price, size, view** — Smart users want control; reduces decision paralysis.

**Complexity:** Low-Medium  
**Payoff:** Low (small inn has only 3-10 rooms; not critical)  
**For v1:** Defer; easy to add later if needed

## Anti-Features (Don't Build These)

### Embedded Payment Processing
- **Why avoid:** PCI compliance liability, fraud handling, refund complexity.
- **What to do instead:** Clear redirect messaging; Hostaway handles all payments.

### User Accounts & Guest Logins (v1)
- **Why avoid:** Authentication adds complexity without v1 benefit. Guests book once; no need for accounts.
- **What to do instead:** Anonymous booking. Revisit if loyalty program becomes valuable.

### Detailed Room Filtering (v1)
- **Why avoid:** Small inns (3-10 rooms) don't require complex filtering. Guests browse all options.
- **What to do instead:** Simple listing with clear amenity highlights ("has hot tub", "water view", "family suite").

### Live Chat Support
- **Why avoid:** Requires 24/7 staffing. Small inns lack resources.
- **What to do instead:** Email form with clear response time + FAQ.

### Heavy Third-Party Widgets
- **Why avoid:** Each widget adds HTTP requests, JavaScript, and page bloat. Kills performance.
- **What to do instead:** Choose 1-2 essential integrations (Hostaway + Prismic + analytics).

### Upsells & Ancillary Products (v1)
- **Why avoid:** Adds checkout friction and abandonment.
- **What to do instead:** Mention extras in room descriptions ("Activities available upon request").

## Feature Complexity Estimates

### High-Effort (3+ weeks)
- Virtual tours / 360 photos
- Custom booking engine
- User accounts with loyalty program
- Multi-language support
- Advanced analytics dashboard

### Medium-Effort (1-2 weeks)
- Guest testimonials display
- Seasonal promotions with conditional rendering
- Room filtering by amenity
- Blog or location guides
- Location map & attractions
- Contact form with backend

### Low-Effort (< 1 week)
- Room descriptions + amenities
- Photo galleries (use Hostaway photos)
- Availability calendar
- About page + staff bios
- Mobile responsiveness
- Accessibility basics
- SEO metadata & schema.org
- Contact form (frontend)

## Room Browsing & Discovery Best Practices

**What works:**
- Hero image or carousel per room
- Grid layout (2-3 cols desktop, 1 mobile)
- Quick date picker at top (sticky while browsing)
- Room cards show: photo, name, amenities badge, price
- Cards link to detail pages (enables SEO, sharing)

**Common UX patterns:**
- Related/similar rooms at bottom of detail page
- Price shown in card and detail page
- Visual badges ("Best Value", "Hot Tub", "Water View")
- Amenity icons (WiFi, AC, hot tub, etc.)

**SEO considerations:**
- Unique titles: `Sunset Suite with Hot Tub - Bristol Inn`
- Room names searchable ("Ocean View Deluxe", not "Room A")
- Amenity list in text + schema markup
- Internal linking (listings → detail → about → contact)
- Unique meta descriptions with key details

## Booking & Availability Best Practices

**Standard flow:**
1. Browse rooms → Select dates → View available rooms → Pick room → See total → Book Now → Hostaway

**Hostaway integration patterns:**
- Fetch room catalog daily (keep inventory fresh)
- Check real-time availability before redirect
- Pass pre-filled data to Hostaway (room ID, dates, guests)

**Common friction points:**
- **Availability conflicts** → Room shown available, unavailable at checkout. Solution: Real-time check before redirect.
- **Price surprises** → $120/night listed, $180 final with fees. Solution: Show "from $X"; calculate total before redirect.
- **Unclear checkout** → Guest doesn't understand they're leaving your site. Solution: "Complete payment securely through Hostaway".
- **Mobile UX** → Date picker + form unreadable on small screens. Solution: Touch-friendly picker, clear steps, progress indicator.
- **No cancellation policy** → Guests don't know if locked in. Solution: Display policy before "Book Now".

## Content & Storytelling

**Why important for inns:** Guests choose small inns over hotels for experience + personality. Storytelling creates emotional connection.

**Content that converts:**
- Owner story: "Sarah & Mike left corporate jobs to open Bristol Inn in 2018..."
- Inn history: "Built in 1895, lovingly restored..."
- Staff bios: "Chef James, 15 years farm-to-table experience..."
- Seasonal updates: "Fall apple picking Sept 1st. Recommend the orchard 2 miles south..."

**Photo galleries:**
- 4-6 photos minimum per room
- Show: bed, bathroom, view, unique feature, ambiance
- Natural lighting > staged

**Staff bios:**
- Photos + names (personal touch)
- Brief background (2-3 sentences)
- Personality details (dog lover, makes the best croissants)

**About page:**
- Start with "why" — Why did you open this inn?
- Include timeline — Founding, renovations, evolution
- Highlight unique points — "Only inn with hot spring access"
- Community connections — "Partner with local artists"
- CTA — "Book a stay" or "Contact us"

## Guest Reviews & Social Proof

**Display locations:**
- Homepage — Testimonial carousel ("4.8 stars, 180+ guests")
- Room detail pages — "Guests loved the hot tub" with relevant snippets
- Booking flow — Quote just before "Book Now" reduces abandonment
- Footer — Awards, certifications, media mentions

**Integration options:**
1. Hostaway native reviews (if available via API)
2. Google My Business reviews (many guests review here)
3. TripAdvisor / Airbnb reviews (if inn lists there)
4. Custom review form (maximum control)
5. **Recommended:** Hybrid approach

**Impact:** 4.5+ stars + 10+ reviews = 2-3x booking conversion lift

## Mobile & Responsiveness Critical Details

**Touch-friendly patterns:**
- Tap targets 44x44px minimum, 8px spacing
- Scrollable galleries (swipe left/right)
- Expandable forms (date picker full-screen on mobile)
- Readable text (16px+ on mobile)
- Bottom-aligned CTAs (avoid sticky headers eating 25% of screen)

**Mobile breakpoints (Tailwind mobile-first):**
- Mobile (0-640px): Single column, large fonts, touch-friendly
- Tablet (640-1024px): Two-column grid, optimized gallery
- Desktop (1024px+): Three-column grid, full experience

**Common mobile mistakes:**
- Fixed headers consuming 25%+ of screen
- Unoptimized images (5MB photos = 10s load on 4G)
- Unresponsive date picker (tiny on mobile)
- Horizontal scroll requirement
- Auto-rotating carousels (stop on user interaction)

## Accessibility & Performance Requirements

### Core Metrics

- **LCP (Largest Contentful Paint):** < 2.5s — First image/text visible
- **FID (First Input Delay):** < 100ms — Responsive to interaction
- **CLS (Cumulative Layout Shift):** < 0.1 — No jumping content
- **FCP (First Contentful Paint):** < 1.8s — First pixel
- **TTI (Time to Interactive):** < 3.8s — Fully interactive

### Accessibility Checklist

- **Images:** Descriptive alt text ("Sunset Suite with hot tub on private deck", not "room.jpg")
- **Color contrast:** WCAG AA minimum (4.5:1 text, 3:1 large text)
- **Keyboard navigation:** Tab through all interactive elements; no keyboard traps
- **Focus visible:** Clear focus indicator (don't remove browser default)
- **Form labels:** Every input has `<label>` or `aria-label`
- **Headings:** `<h1>` once, `<h2>` for major sections, `<h3>` for subsections
- **Lists:** Use `<ul>`/`<ol>`, not divs
- **Decorative images:** Use `alt=""` (empty)
- **Video:** Captions for deaf viewers, transcripts
- **ARIA:** Use sparingly; prefer semantic HTML

### Common Pitfalls

- Relying on color alone ("Green = available, Red = unavailable")
- Unlabeled form inputs (placeholder ≠ label)
- Auto-playing audio/video
- Time limits without pause
- Moving elements during load (CLS issues)

## Feature Dependencies & Recommended Roadmap

### Phase 1: MVP (Proof of Concept)

**Goal:** Validate all integrations; prove core booking flow works

- ✓ Room listings from Hostaway (read-only)
- ✓ Availability calendar
- ✓ Date picker + availability check
- ✓ "Book Now" redirect to Hostaway
- ✓ Mobile responsiveness
- ✓ Performance optimization (LCP < 2.5s)
- ✓ Home page (Prismic)
- ✓ Contact form (frontend only)
- ✓ Sentry error tracking
- ✓ GA4 page view tracking

**Not in v1:**
- Virtual tours, guest accounts, payment processing, blog, advanced analytics

### Phase 2: Content & Trust (Week 2-4)

- About + inn story
- Staff bios + photos
- Guest testimonials (Hostaway reviews integration)
- Contact form backend (email notifications)
- Team photos on home
- SEO optimization (schema markup, meta descriptions)

### Phase 3: Discoverability & Engagement (Month 2)

- Blog / location guides
- Room filtering (by amenity, price)
- Email newsletter signup
- GA4 ecommerce event tracking (booking funnel)
- Location map + attractions

### Phase 4: Premium Experience (Month 3+)

- Virtual tours / 360 photos
- Seasonal promotions + dynamic pricing
- Repeat booking discounts
- Customer email follow-up automation

### Phase 5: Advanced (Post-validation)

- User accounts + loyalty program
- Embedded payment (only if clear ROI)
- Advanced analytics + cohort analysis

## Summary: What to Build in Bristol Inn V1

**Start with table stakes only:**
- Room browsing with real photos
- Availability calendar + date picker
- Complete booking flow to Hostaway checkout
- Mobile-first responsive design
- Core Web Vitals < 2.5s LCP

**Add immediately after launch (week 2-3):**
- About page + inn story (high conversion impact)
- Staff bios (personal touch)
- Testimonials from Hostaway reviews
- Contact form with response time promise

**Defer to Phase 2+:**
- Virtual tours, complex filtering, guest accounts, blog, upsells

This balances **proof of concept** (validate tech stack + booking flow) with **credibility** (compelling story + social proof).

---

*Last updated: 2026-05-05 with current ecosystem research*
