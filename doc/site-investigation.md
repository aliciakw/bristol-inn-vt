# Site Investigation Report: bristolsuites.com

**Date:** 2026-04-09  
**URL:** https://www.bristolsuites.com/

---

## 1. Overview

**Bristol Suites** is a small boutique extended-stay hotel located at 19 Main Street, Bristol, Vermont. The site's primary responsibilities are:

- Marketing seven guest rooms and suites to prospective visitors
- Driving reservations through an external booking engine (Hostaway/Holiday Future)
- Showcasing the Vermont Marketplace lobby store (in-person retail, no online sales)
- Providing practical guest information (policies, directions, parking, area attractions)

The property occupies the historic Dunshee Block, an Italianate Revival building. It was purchased by new owner Justin Sandherr in February 2025.

**Tech Stack:**
| Layer | Technology |
|---|---|
| CMS | WordPress 6.8.5 |
| Page Builder | Elementor Pro 3.32.5 |
| Theme | Hello Elementor |
| Booking Engine | Hostaway (via holidayfuture.com subdomain) |
| Analytics | Google Analytics 4 (G-PVJG5DCP46) |
| Monitoring | New Relic (on booking subdomain only) |

---

## 2. Site Map

```
bristolsuites.com
│
├── / (Homepage)
│   ├── → /rooms-and-suites/
│   ├── → /bristol-suites-special-offers/
│   ├── → /contact-us/
│   ├── → /vermont-marketplace/
│   └── → [EXT] bristolsuites.holidayfuture.com/all-listings  (Book Now)
│
├── Rooms & Reservations
│   ├── /rooms-and-suites/
│   │   └── → [EXT] bristolsuites.holidayfuture.com/all-listings
│   ├── /bristol-suites-room-rates/
│   ├── /reservation-and-cancellation-policy/
│   ├── /pet-policy/
│   └── /bristol-suites-special-offers/
│       └── → [EXT] bristolsuites.holidayfuture.com/all-listings
│
├── About & Info
│   ├── /about-tom-and-carol-wells-proprietors/  ⚠ (stale title — new owner since Feb 2025)
│   ├── /what-bristol-has-to-offer/
│   └── /links-to-area-attractions/
│       └── → [EXT] various local attraction websites
│
├── Guest Services
│   ├── /vermont-marketplace/
│   ├── /directions-and-location/
│   └── /guest-parking/
│
└── Contact
    └── /contact-us/
        ├── → [EXT] facebook.com/bristolsuitesvt
        ├── → [EXT] instagram.com/bristolsuites/
        └── → [EXT] tripadvisor.com  (hotel review page)
```

**External Booking Subdomain** (separate domain, Hostaway-powered):

```
bristolsuites.holidayfuture.com
└── /all-listings
    ├── Haymarket Square Suite  (1BR, 4.85★)
    ├── Main Street Suite       (2BR)
    ├── Pocock Suite            (3BR, 4.85★)
    ├── South Mountain Mini-Suite (1BR, 4.85★)
    ├── Deerleap Suite          (2BR, 4.85★)
    ├── Bartlett Falls Suite    (1BR, 4.60★)
    └── Rockydale Room          (1BR, 4.55★)
```

---

## 3. Network Diagram

```
                        ┌─────────────────────────┐
                        │   bristolsuites.com      │
                        │   (WordPress + Elementor)│
                        └────────────┬────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                           │
          ▼                          ▼                           ▼
┌──────────────────┐     ┌────────────────────────┐   ┌─────────────────┐
│  Google Analytics│     │  s.w.org               │   │  Kayak Badge    │
│  (GA4)           │     │  (WordPress emoji CDN) │   │  (travel award) │
│  analytics.google│     └────────────────────────┘   └─────────────────┘
│  .com            │
└──────────────────┘

          │ "Book Now" clicks send user to:
          ▼
┌──────────────────────────────────────────────┐
│  bristolsuites.holidayfuture.com             │
│  (Hostaway Booking Engine)                   │
│                                              │
│  ├── bookingenginecdn.hostaway.com  (images) │
│  ├── booking-engine.hostaway.com   (API)     │
│  └── New Relic  (performance monitoring)     │
└──────────────────────────────────────────────┘

          │ Social / Review links send user to:
          ▼
┌────────────────────────────────────────────┐
│  facebook.com/bristolsuitesvt              │
│  instagram.com/bristolsuites/              │
│  tripadvisor.com  (hotel listing)          │
└────────────────────────────────────────────┘
```

---

## 4. Summary

Bristol Suites is a straightforward brochure-style marketing site with an outsourced booking flow. The WordPress/Elementor stack handles all content pages, while reservations are fully delegated to a **Hostaway-powered booking engine** running on the `bristolsuites.holidayfuture.com` subdomain. This means the main site has no backend reservation logic, no payment processing, and no user accounts — it is essentially a read-only informational site that funnels users to an external SaaS booking tool.

Google Analytics 4 tracks visitor behavior on the WordPress side, but once a user clicks "Book Now" and lands on the Hostaway subdomain, monitoring switches to **New Relic** (Hostaway's own infrastructure monitoring). There is no cross-domain analytics stitching visible, meaning the hotel likely cannot track a full conversion funnel from page visit to completed booking.

The Vermont Marketplace operates as a physical retail storefront with no e-commerce integration — the website page is informational only.

---

## 5. Special Cases & Anomalies

### ⚠ Stale "About" Page URL

The About page URL is `/about-tom-and-carol-wells-proprietors/` — named after the previous owners. The property was sold to Justin Sandherr in **February 2025** and is now managed by innkeepers Niko and Mark. The slug has not been updated and may cause SEO confusion or look unprofessional to visitors who notice the URL.

### ⚠ Special Offers Page Is Empty

`/bristol-suites-special-offers/` currently displays only "Stay tuned for upcoming specials!" — a placeholder with no active promotions. If this page is being indexed and linked from the nav, it creates a dead-end experience for visitors.

### ⚠ No Embedded Map on Directions Page

`/directions-and-location/` provides only text-based driving directions with no Google Maps embed or interactive map. This is a notable omission for a hospitality site where wayfinding is a primary guest need.

### ⚠ Booking Engine on a Separate Domain

All reservations happen at `bristolsuites.holidayfuture.com` — a fully external domain. This creates a jarring brand transition for users and means the hotel has no direct control over the checkout experience, no ability to customize the booking UI, and a broken analytics funnel (see above).

### ⚠ No HTTPS Redirect Verification / CDN

The site does not appear to use Vercel, Cloudflare, or any CDN in front of WordPress. Performance and DDoS resilience depend entirely on the hosting provider.

### ℹ "Rockydale Room" Missing from Main Site

The booking engine lists 7 properties (including the **Rockydale Room**), but the rooms page on the main site only prominently features 6 named suites in its intro copy. Minor inconsistency.

### ℹ No Elevator — Not Disclosed Prominently

The building has no elevator and upper-floor rooms require stair access. This accessibility note is mentioned on the rooms page but is not surfaced on the booking engine, which could lead to booking issues for guests with mobility limitations.

### ℹ Vermont Marketplace Has Seasonal Hours

The lobby store operates on reduced hours January–April (Thu–Sat only). This is noted on the Marketplace page but not cross-referenced in any "plan your visit" or guest info context.
