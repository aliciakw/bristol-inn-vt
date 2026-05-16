---
phase: 2
slug: integrations-core-data
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-15
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None detected — Wave 0 must create `vitest.config.ts` |
| **Config file** | `vitest.config.ts` (Wave 0 gap) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~30 seconds (once configured) |

---

## Sampling Rate

- **After every task commit:** `npm run build` (confirms no type errors, pages generate)
- **After every plan wave:** `npm run build && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite green + manual CONTENT-03 verification
- **Max feedback latency:** ~60 seconds (build time estimate)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-xx-01 | xx | 1 | ROOM-01 | — | API key not logged | unit (mock fetch) | `npx vitest run tests/lib/hostaway.test.ts` | ❌ Wave 0 | ⬜ pending |
| 2-xx-02 | xx | 1 | ROOM-02 | — | N/A | smoke | `npm run build && ls dist/rooms/index.html` | ❌ Wave 0 | ⬜ pending |
| 2-xx-03 | xx | 1 | ROOM-03 | — | N/A | smoke | `npm run build && ls dist/rooms/` | ❌ Wave 0 | ⬜ pending |
| 2-xx-04 | xx | 2 | CONTENT-01 | — | N/A | smoke | `npm run build && ls dist/index.html` | ❌ Wave 0 | ⬜ pending |
| 2-xx-05 | xx | 2 | CONTENT-02 | — | N/A | unit (mock client) | `npx vitest run tests/lib/prismic.test.ts` | ❌ Wave 0 | ⬜ pending |
| 2-xx-06 | xx | 2 | CONTENT-03 | — | Preview token not leaked | manual | Load preview URL in browser after CF PR deploy | manual-only | ⬜ pending |
| 2-xx-07 | xx | 2 | CONTENT-04 | — | N/A | smoke | `npm run build && ls dist/contact/index.html` | ❌ Wave 0 | ⬜ pending |
| 2-xx-08 | xx | 2 | CONTENT-08 | — | N/A | smoke | `npm run build && ls dist/about/index.html` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — vitest configuration with TypeScript support
- [ ] `tests/lib/hostaway.test.ts` — unit tests for `getRooms()` / `getRoom(id)` with mocked fetch (validates typed response shape)
- [ ] `tests/lib/prismic.test.ts` — unit tests for `getHomepage()` / `getPage(slug)` with mocked Prismic client

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Prismic draft preview redirects correctly | CONTENT-03 | Requires live CF PR deployment + active Prismic preview session | 1. Push branch to CF PR preview. 2. Open Prismic draft. 3. Click "Share Preview". 4. Confirm redirect lands on correct PR preview URL with draft content visible. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
