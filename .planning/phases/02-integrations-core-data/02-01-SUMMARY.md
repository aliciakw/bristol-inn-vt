---
phase: 02-integrations-core-data
plan: 1
title: 'Foundation Setup: Dependencies, Config, Env, and Vitest'
subsystem: tooling
tags: [dependencies, cloudflare, prismic, vitest, env, astro-config]
key-files:
  created:
    - vitest.config.ts
    - tests/__mocks__/astro-env-server.ts
  modified:
    - package.json
    - package-lock.json
    - astro.config.mjs
    - src/lib/env.ts
    - .env.example
decisions:
  - '@astrojs/cloudflare adapter registered; no output: server — per-page prerender=false only'
  - 'src/lib/env.ts reduced to documentation-only; Astro 6 envField schema handles all validation'
  - '@sentry/cloudflare installed alongside @astrojs/cloudflare (required peer)'
metrics:
  duration: '~8 minutes'
  completed: '2026-05-15'
  tasks_completed: 3
  tasks_total: 3
---

# Phase 2 Plan 1: Foundation Setup Summary

**One-liner:** Installed @prismicio/client and @astrojs/cloudflare, configured Cloudflare adapter with Prismic image remotePatterns, and set up Vitest with an astro:env/server mock alias.

## Commits

| Task | Commit  | Message                                                                     |
| ---- | ------- | --------------------------------------------------------------------------- |
| 1    | 6e53626 | feat(02-01): install deps and clean env.ts                                  |
| 2    | 1e7eb8f | feat(02-01): configure Cloudflare adapter, image.remotePatterns, and Vitest |
| 3    | b68ee82 | feat(02-01): create astro:env/server mock for vitest                        |

## Tasks Completed

1. **Install dependencies and update env.ts** — Added `@prismicio/client ^7.21.8`, `@astrojs/cloudflare ^13.5.1` as production deps; `vitest ^4.1.6`, `@vitest/coverage-v8 ^4.1.6` as dev deps. Rewrote `src/lib/env.ts` as documentation-only, removing `HOSTAWAY_API_KEY` and `process.env` references. Updated `.env.example` with correct `HOSTAWAY_ACCESS_TOKEN` name and descriptive comments for all five vars.

2. **Configure Cloudflare adapter, image.remotePatterns, and Vitest** — Added `import cloudflare from '@astrojs/cloudflare'` and `adapter: cloudflare()` to `astro.config.mjs`. Added `image.remotePatterns` for `images.prismic.io` and `**.prismic.io` with a TODO comment for the Hostaway CDN hostname. Created `vitest.config.ts` with node environment, `tests/**/*.test.ts` include, and `astro:env/server` alias pointing to the test mock.

3. **Create astro:env/server mock for tests** — Created `tests/__mocks__/astro-env-server.ts` exporting `HOSTAWAY_ACCESS_TOKEN = 'test-hostaway-token'` and `PRISMIC_TOKEN = 'test-prismic-token'`. No import from `astro:env/server` (avoids circular resolution).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Install @sentry/cloudflare peer dependency**

- **Found during:** Task 2 build verification
- **Issue:** `@sentry/astro` requires `@sentry/cloudflare` when the Cloudflare adapter is registered. Build failed with: `You are using the Cloudflare adapter but @sentry/cloudflare is not installed.`
- **Fix:** Ran `npm install @sentry/cloudflare`; build then succeeded with exit 0.
- **Files modified:** package.json, package-lock.json
- **Commit:** 1e7eb8f (included in Task 2 commit)

## Success Criteria Verification

- [x] `@prismicio/client` in package.json dependencies
- [x] `@astrojs/cloudflare` in package.json dependencies
- [x] `vitest` in package.json devDependencies
- [x] `@vitest/coverage-v8` in package.json devDependencies
- [x] `astro.config.mjs` registers Cloudflare adapter (`adapter: cloudflare()`)
- [x] `astro.config.mjs` contains `remotePatterns` with `images.prismic.io`
- [x] `astro.config.mjs` does NOT contain `output: 'server'`
- [x] `src/lib/env.ts` contains no `HOSTAWAY_API_KEY` or `process.env`
- [x] `vitest.config.ts` exists with node environment and `astro:env/server` alias
- [x] `tests/__mocks__/astro-env-server.ts` exports `HOSTAWAY_ACCESS_TOKEN` and `PRISMIC_TOKEN`
- [x] `npm run build` exits 0

## Known Stubs

None — this plan installs infrastructure only; no UI or data components with placeholder values.

## Threat Flags

No new threat surface introduced beyond what is documented in the plan's threat model (T-02-01 through T-02-04). All mitigations confirmed:

- `HOSTAWAY_ACCESS_TOKEN` and `PRISMIC_TOKEN` are `context: "server"` in astro.config.mjs env schema — never emitted to client bundle.
- `.env.example` contains placeholder strings only.
- `tests/__mocks__/astro-env-server.ts` contains fake test tokens only.

## Self-Check: PASSED

- [x] `vitest.config.ts` exists at project root
- [x] `tests/__mocks__/astro-env-server.ts` exists
- [x] `src/lib/env.ts` rewritten (no HOSTAWAY_API_KEY, no process.env)
- [x] `.env.example` updated (HOSTAWAY_ACCESS_TOKEN present, HOSTAWAY_API_KEY absent)
- [x] Commits 6e53626, 1e7eb8f, b68ee82 exist in git log
- [x] Build exits 0
