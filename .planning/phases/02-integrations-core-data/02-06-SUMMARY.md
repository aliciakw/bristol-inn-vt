---
phase: 02-integrations-core-data
plan: 6
title: 'Room Pages: /rooms listing and /rooms/[id] detail'
subsystem: pages
tags: [astro, pages, hostaway, rooms, static-paths]
depends_on: [02-02, 02-04]
provides: [rooms-listing-page, room-detail-page]
tech_stack:
  patterns: [getStaticPaths, astro-props-via-paths, static-site-generation]
key_files:
  created:
    - src/pages/rooms.astro
    - src/pages/rooms/[id].astro
decisions:
  - 'No try/catch per D-06: errors propagate and fail the build, preventing silent bad deploys'
  - 'Room data passed via getStaticPaths props to avoid a second API call per listing'
  - 'PRISMIC_TOKEN made optional in astro.config.mjs — Prismic public repos work without token for published content, and .env uses PRISMIC_CLIENT_SECRET naming'
  - 'Build requires .dev.vars (Cloudflare miniflare convention) in worktree root for secrets during prerender'
metrics:
  completed: '2026-05-16'
  tasks_completed: 2
  tasks_total: 2
---

# Phase 02 Plan 06: Room Pages Summary

Implemented both room pages for the Bristol Inn Hostaway integration.

## What Was Built

**Task 1 — `src/pages/rooms.astro` (listing page):** Fetches all Hostaway rooms via `getRooms()` and renders them in a responsive grid using `RoomCard` components. Falls back to a "no rooms available" message if the API returns an empty array.

**Task 2 — `src/pages/rooms/[id].astro` (detail page):** Uses `getStaticPaths()` to statically generate one page per Hostaway room. Each detail page shows the room name, price-per-night, a `RoomGallery` photo grid, description, `AmenityBadge` chips for amenities, and a "Book This Room" CTA linking to `hostaway.com/book/[id]`.

The build generates room pages for all active Hostaway listings (e.g., `/rooms/403827/`, `/rooms/403828/`, etc.) at build time — fully static, no client-side JS.

## Key Decisions

- **No try/catch (D-06):** `getRooms()` throws on non-ok API responses; the build fails loudly rather than deploying silently broken pages.
- **Props via `getStaticPaths`:** Room data is fetched once in `getStaticPaths` and passed as `props: { room }`. The detail page does not make a second `getRoom(id)` call, avoiding N+1 API requests at build time.
- **`PRISMIC_TOKEN` optional:** `astro.config.mjs` marks `PRISMIC_TOKEN` as `optional: true` because the project's `.env` uses `PRISMIC_CLIENT_SECRET` naming and Prismic public repos work without a token for published content.
- **Build env — `.dev.vars`:** The Cloudflare miniflare prerender server reads secrets from `.dev.vars` (not from the shell environment or Vite's `.env` loading). A `.dev.vars` file in the worktree root with `HOSTAWAY_ACCESS_TOKEN` and `PRISMIC_TOKEN` is required for `npm run build` to succeed locally.
- **Booking URL (TODO Phase 3):** The CTA links to `https://www.hostaway.com/book/${room.id}`. This is a placeholder; Phase 3 should replace it with a validated Hostaway booking redirect URL.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing prerequisite source files in worktree**

- **Found during:** Task 2 setup
- **Issue:** The worktree branch was based on `e0853d8` (pre-Phase-2) and lacked `src/lib/hostaway.ts`, `src/components/RoomGallery.astro`, `src/components/AmenityBadge.astro`, and other Phase 2 prerequisites.
- **Fix:** Cherry-picked commits from `scaffold/phase2` up through `f187179` (Task 1 commit) onto the worktree branch to bring in all prerequisite files.
- **Files affected:** All Phase 2 prerequisite source files
- **Commits:** Multiple cherry-picks from `scaffold/phase2`

**2. [Rule 3 - Blocking] Build fails: HOSTAWAY_ACCESS_TOKEN missing from miniflare prerender context**

- **Found during:** Task 2 verification (build step)
- **Issue:** The `@astrojs/cloudflare` adapter's miniflare prerender server does not read env vars from shell environment or Vite's `.env` discovery. It reads exclusively from `.dev.vars` in the project root. The worktree had no `.dev.vars`, so `HOSTAWAY_ACCESS_TOKEN` (required, non-optional in schema) caused a 500 error during `getStaticPaths`.
- **Fix:** Created `.dev.vars` in the worktree root with `HOSTAWAY_ACCESS_TOKEN` and `PRISMIC_TOKEN` values sourced from the main project's `.env`. Note: `.dev.vars` is gitignored (Cloudflare convention for local secrets).
- **Files affected:** `.dev.vars` (not committed — gitignored)

## Known Stubs

- **Booking URL:** `src/pages/rooms/[id].astro` links to `https://www.hostaway.com/book/${room.id}` with a TODO comment. Phase 3 should replace with a validated Hostaway booking/inquiry redirect URL.

## Self-Check: PASSED

- `src/pages/rooms.astro` — exists
- `src/pages/rooms/[id].astro` — exists
- `npm run build` — exits 0
- `dist/client/rooms/` — contains room ID subdirectories (403814, 403815, 403827, 403828, 403829, 403866, 403873)
