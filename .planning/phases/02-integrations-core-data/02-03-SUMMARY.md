---
phase: 02-integrations-core-data
plan: 3
title: 'Prismic CMS Library: getHomepage, getPage, getPages'
subsystem: cms-integration
tags: [prismic, cms, typescript, wrapper, tdd]
dependency-graph:
  requires:
    - 02-01 (Foundation Setup — @prismicio/client installed, astro:env/server mock in place)
  provides:
    - src/lib/prismic.ts → getHomepage(), getPage(), getPages(), getClient()
  affects:
    - src/pages/index.astro (will call getHomepage())
    - src/pages/[slug].astro (will call getPage(), getPages())
    - src/pages/preview.astro (will call getClient() for resolvePreviewURL)
tech-stack:
  added: []
  patterns:
    - Singleton factory pattern for Prismic client (one instance per build)
    - TDD RED/GREEN cycle with vitest module mocking via vi.mock('@prismicio/client')
    - Top-level await import for post-mock module loading in tests
key-files:
  created:
    - src/lib/prismic.ts
    - tests/lib/prismic.test.ts
  modified: []
decisions:
  - 'Singleton _client initialized lazily on first getClient() call; null-guarded'
  - 'No try/catch on any function — build fails on Prismic error per D-07'
  - 'PRISMIC_TOKEN passed to createClient options only; never logged'
  - 'getClient() exported for preview.astro direct use (resolvePreviewURL)'
  - 'Test captures initialCreateClientArgs before beforeEach clears mocks — solves singleton isolation'
metrics:
  duration: '~12 minutes'
  completed: '2026-05-15'
  tasks_completed: 1
  tasks_total: 1
requirements:
  - CONTENT-01
  - CONTENT-02
  - CONTENT-03
  - CONTENT-04
  - CONTENT-08
---

# Phase 2 Plan 3: Prismic CMS Library Summary

**One-liner:** Singleton Prismic client wrapper using @prismicio/client v7 with getHomepage (getSingle), getPage (getByUID), getPages (getAllByType), all errors propagating to fail the build per D-07.

## Commits

| Task  | Commit  | Message                                                     |
| ----- | ------- | ----------------------------------------------------------- |
| RED   | 02656ac | test(02-03): add failing tests for prismic.ts wrapper       |
| GREEN | 81ec084 | feat(02-03): implement Prismic CMS client wrapper           |
| FIX   | 20668ad | fix(02-03): fix makeDocument fixture uid type to allow null |

## TDD Gate Compliance

- RED gate: commit 02656ac — 0 tests passing (module not found), 0 tests total
- GREEN gate: commit 81ec084 — 13 tests passing, 0 failing
- REFACTOR: not needed; implementation clean on first pass
- Type fix (20668ad): strict TypeScript in test fixture (`uid: string | null`) — not a logic change

## Tasks Completed

1. **Create src/lib/prismic.ts (TDD RED/GREEN)** — Wrote failing tests first (module-not-found RED), then implemented the wrapper. Singleton `_client` pattern with lazy init. All four exports (`getClient`, `getHomepage`, `getPage`, `getPages`) typed with `prismic.PrismicDocument` / `prismic.Client`. No `any` types, no `try/catch`, no token logging.

## Verification Results

- `grep "export.*getHomepage|export.*getPage|export.*getPages|export.*getClient"` → 4 matches
- `grep "^import.*from 'prismic'"` → 0 matches (only `@prismicio/client`)
- `grep "bristol-inn-vt" src/lib/prismic.ts` → 2 matches (JSDoc comment + REPO_NAME constant)
- `npx tsc --noEmit` → exit 0
- `npx vitest run` → 26 tests passed (13 prismic + 13 hostaway)
- `npm run build` → exit 0

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript strict null in test fixture**

- **Found during:** Post-GREEN `tsc --noEmit`
- **Issue:** `makeDocument` fixture typed `uid: string` but the override site passed `uid: null` (valid for homepage documents); TypeScript strict mode flagged `Type 'null' is not assignable to type 'string | undefined'`
- **Fix:** Changed fixture overrides type to `uid: string | null` — matches `prismic.PrismicDocument.uid`
- **Files modified:** tests/lib/prismic.test.ts
- **Commit:** 20668ad

**2. [Rule 1 - Bug] Singleton breaks per-test mock call isolation**

- **Found during:** First GREEN run (12/13 tests passing)
- **Issue:** `_client` singleton is set on first `getClient()` call; `beforeEach` clears mock call counts but the cached client means `createClient` is never called again — second test saw 0 `mockCreateClient.mock.calls`
- **Fix:** Captured `initialCreateClientArgs` at module load time (before any `beforeEach` runs) by calling `getClient()` immediately after the dynamic import; each `getClient()` describe test references this pre-captured value
- **Files modified:** tests/lib/prismic.test.ts
- **Commit:** 81ec084 (included in GREEN)

## Known Stubs

None — `src/lib/prismic.ts` is a pure data-fetching library with no UI or hardcoded content. Values flow from the live Prismic API at build time.

## Threat Flags

No new threat surface beyond the plan's threat model. Mitigations confirmed:

- **T-02-08** (PRISMIC_TOKEN disclosure): Token appears only in `createClient` options object; no `console.log` of token value anywhere in `prismic.ts`
- **T-02-09** (slug param in getByUID): `getPage(slug)` passes the slug only to `client.getByUID('page', slug)`; Prismic's API returns 404 for unknown UIDs — no SSRF, no arbitrary URL construction

## Self-Check: PASSED

- [x] `src/lib/prismic.ts` exists with all 4 exports
- [x] `tests/lib/prismic.test.ts` exists with 13 tests
- [x] Commits 02656ac, 81ec084, 20668ad exist in git log
- [x] `npx tsc --noEmit` exits 0
- [x] `npx vitest run` → 26/26 passing
- [x] `npm run build` exits 0
- [x] `REPO_NAME = 'bristol-inn-vt'` in prismic.ts
- [x] No `any` types; no `try/catch`; no token logging
