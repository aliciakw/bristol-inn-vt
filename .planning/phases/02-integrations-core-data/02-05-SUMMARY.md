---
phase: 02-integrations-core-data
plan: 5
title: 'Prismic Components: HeroCarousel and SliceZone'
subsystem: components
tags: [astro, components, tailwind, prismic, carousel, slicezone]
one_liner: 'Vanilla JS fade carousel with no-JS fallback and Prismic slice dispatcher for RichText and ImageBlock'
requires:
  - 02-03
provides:
  - src/components/HeroCarousel.astro
  - src/components/SliceZone.astro
affects:
  - src/pages/index.astro
  - src/pages/[slug].astro
tech_stack:
  added: []
  patterns:
    - 'Astro Image with remote Prismic CDN URLs'
    - 'Vanilla JS fade via classList toggle (opacity-0/opacity-100)'
    - 'Prismic slice dispatching via slice_type string comparison'
    - 'as-casts for @prismicio/client strict TypeScript types'
key_files:
  created:
    - src/components/HeroCarousel.astro
    - src/components/SliceZone.astro
  modified: []
decisions:
  - 'Used isFilled.image() guard in SliceZone before rendering image_block to avoid null URL runtime errors'
  - 'HeroCarousel script uses default Astro bundling (no is:inline) so the querySelector runs after DOM is ready'
  - "SliceZone uses prismic.SliceZone as prop type rather than PrismicDocument['data']['body'] to avoid generic document constraint"
metrics:
  duration: '~8 minutes'
  completed: '2026-05-16'
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 0
---

# Phase 2 Plan 5: Prismic Components — HeroCarousel and SliceZone Summary

Vanilla JS fade carousel with no-JS fallback and Prismic slice dispatcher for RichText and ImageBlock.

## What Was Built

**HeroCarousel.astro** (`src/components/HeroCarousel.astro`)
Accepts `images: Array<{ url: string; alt: string }>`, `ctaLabel: string`, and `ctaUrl: string`. Renders a full-width hero container with each image as an absolutely-positioned slide. The first slide has `opacity-100` in the Astro template (not set by JS), so the carousel is usable without JavaScript. Subsequent slides start at `opacity-0`. A vanilla `setInterval` at 5000ms cycles the active slide by toggling the Tailwind opacity classes. The interval is only started if there is more than one slide. A dark overlay (`bg-black/30`) ensures CTA text is readable against any image. The CTA button uses `bg-slate-700` per the UI spec accent color.

**SliceZone.astro** (`src/components/SliceZone.astro`)
Accepts `slices: prismic.SliceZone` and maps over the array dispatching by `slice_type`. Handles:

- `rich_text`: renders `prismic.asHTML()` output via `set:html` in a `max-w-prose` wrapper
- `image_block`: renders Astro `<Image>` in a `<figure>`, applying full-width or prose-width layout based on `slice.primary.layout`, with optional figcaption
- unknown types: returns `null` — silent skip, no error, no placeholder

## Decisions Made

1. **isFilled.image() guard**: Before rendering an `image_block`, `prismic.isFilled.image()` is called to ensure the image field is not empty. This prevents a runtime null URL error if a Prismic editor leaves the image field blank — falling back to rendering nothing rather than crashing the build.

2. **Default Astro script bundling (no `is:inline`)**: The carousel script uses Astro's default bundling so the DOM is ready when the querySelector runs. `is:inline` would have run synchronously in the head and missed the slides.

3. **`prismic.SliceZone` as the prop type**: Using the narrower `prismic.SliceZone` type (which resolves to `[Slice | SharedSlice, ...]`) rather than `PrismicDocument['data']['body']` avoids the generic document constraint while still providing full type safety.

## Deviations from Plan

None — plan executed exactly as written.

## Threat Flags

None. Both components receive data exclusively from Prismic CMS editorial fields. The `set:html` usage is covered by T-02-13 (accepted risk: CMS content authors, not end users, control Prismic content).

## Self-Check: PASSED

- `src/components/HeroCarousel.astro` exists — FOUND
- `src/components/SliceZone.astro` exists — FOUND
- Commit `4e57d59` (HeroCarousel) — FOUND
- Commit `f1e09ea` (SliceZone) — FOUND
- `npm run build` exits 0 — CONFIRMED
- All grep verification checks passed
