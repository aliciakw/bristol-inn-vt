---
phase: 02-integrations-core-data
plan: 2
title: "Hostaway API Library: getRooms, getRoom, and amenity map"
subsystem: data
tags: [hostaway, api-wrapper, typescript, tdd, amenities]
key-files:
  created:
    - src/lib/hostaway.ts
    - src/lib/hostaway-amenities.ts
    - tests/lib/hostaway.test.ts
decisions:
  - "AMENITY_NAMES seeded with 48+ entries from partial third-party source; marked LOW confidence with inline instructions to expand from live API data"
  - "normalizeRoom logs first image URL once (not the token) to enable Hostaway CDN domain discovery for image.remotePatterns"
  - "_firstImageLogged module-level flag ensures CDN diagnostic log fires once per build, not per room"
  - "photos sliced to 6 max after sort-by-sortOrder, per D-04"
  - "vrboCaption used as caption fallback when caption is empty string"
metrics:
  duration: "~12 minutes"
  completed: "2026-05-15"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 2 Plan 2: Hostaway API Library Summary

**One-liner:** Typed Hostaway API wrapper with Bearer auth, RawListing-to-HostawayRoom normalization, amenity ID resolution, and 13-test TDD-verified coverage.

## Commits

| Task | Commit  | Message                                                          |
|------|---------|------------------------------------------------------------------|
| 1    | 07ae258 | feat(02-02): create hostaway-amenities.ts static amenity ID-to-name map |
| TDD  | dfc04ca | test(02-02): add failing tests for hostaway.ts getRooms and getRoom |
| 2    | c607ea9 | feat(02-02): implement hostaway.ts API wrapper with normalization |

## Tasks Completed

1. **Create hostaway-amenities.ts** — Static `Record<number, string>` map seeded with 48+ known amenity IDs (IDs 2–59 from a partial third-party source). Includes required IDs: 2 (Internet), 3 (WiFi), 7 (Kitchen), 13/14 (Washer/Dryer), 17 (Hair Dryer), 18 (Heating). Comment block at top explains LOW confidence and instructs developer to log `listingAmenities` on first live API call to discover actual IDs. Hot Tub, Water View, and Balcony IDs noted as unknown.

2. **Create hostaway.ts** — API wrapper implementing `getRooms()` and `getRoom(id)` with full TDD cycle (RED → GREEN). Internal `RawListing`, `RawListingImage`, `RawListingAmenity` interfaces not exported. `HostawayRoom` exported as the clean domain type. `normalizeRoom()` sorts photos by `sortOrder` asc, slices to 6 max, resolves `amenityId` → name via `AMENITY_NAMES`, filters unknowns. Logs first image URL once for CDN discovery. Token never logged.

## TDD Gate Compliance

- RED commit `dfc04ca` — 13 failing tests (module not found); RED gate confirmed.
- GREEN commit `c607ea9` — all 13 tests pass; GREEN gate confirmed.
- REFACTOR — no refactor needed; implementation was clean on first pass.

## Deviations from Plan

None — plan executed exactly as written. The amenity map was seeded with more entries (48+) than the plan's minimum of 6, sourced from the same third-party reference cited in RESEARCH.md Pattern 3. This is additive and aligned with the plan's intent to be as complete as possible while noting LOW confidence.

## Success Criteria Verification

- [x] `src/lib/hostaway.ts` exports: `HostawayRoom` interface, `getRooms()`, `getRoom()`
- [x] `src/lib/hostaway-amenities.ts` exports: `AMENITY_NAMES` with 48+ seeded entries (minimum 6 required)
- [x] Normalization filters unknown amenityIds before returning `amenityNames`
- [x] First image URL logged to console for Hostaway CDN domain discovery (token NOT logged)
- [x] TypeScript strict: `npx tsc --noEmit` exits 0
- [x] `npm run build` exits 0
- [x] 13 vitest tests pass

## Known Stubs

None — this plan creates library code only; no UI components with placeholder values.

## Threat Flags

No new threat surface beyond the plan's threat model:
- T-02-05 (token in logs): mitigated — `HOSTAWAY_ACCESS_TOKEN` appears only in import and `Authorization: Bearer` header; no `console.log` of the token.
- T-02-06 (raw API response tampering): mitigated — `RawListing` typed cast; `normalizeRoom` produces clean `HostawayRoom`; unknown amenityIds silently filtered.
- T-02-07 (rate limit): accepted — build fetches only at build time for a small inn.

## Post-Integration Action Required

After the first live `getRooms()` call (in plan 02-03 when rooms pages are wired up), check the build log for:

```
[hostaway] First image URL (add domain to image.remotePatterns): https://...
```

Extract the hostname and add it to `astro.config.mjs`:

```js
{ protocol: 'https', hostname: '<hostaway-cdn-hostname>' }
```

Without this, Astro `<Image>` will reject Hostaway room photos at build time.

## Self-Check: PASSED

- [x] `src/lib/hostaway.ts` exists at correct path
- [x] `src/lib/hostaway-amenities.ts` exists at correct path
- [x] `tests/lib/hostaway.test.ts` exists at correct path
- [x] Commits 07ae258, dfc04ca, c607ea9 exist in git log
- [x] `npx tsc --noEmit` exits 0
- [x] `npm run build` exits 0 (confirmed: `[build] Complete!`)
- [x] All 13 vitest tests pass
