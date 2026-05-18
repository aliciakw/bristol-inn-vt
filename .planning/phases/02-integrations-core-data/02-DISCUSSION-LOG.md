# Phase 2: Integrations & Core Data - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-15
**Phase:** 02-integrations-core-data
**Areas discussed:** Room card content, Build failure handling, Prismic schema, Photo strategy

---

## Room Card Content

| Option | Description | Selected |
|--------|-------------|----------|
| Name + price + 3 amenity badges | Name, nightly rate, top 3 amenities as small badges, one thumbnail | ✓ |
| Name + price only | Absolute minimum — name, rate, one photo, no badges | |
| Name + price + all amenities | Show every amenity from Hostaway | |

**User's choice:** Name + price + 3 amenity badges (recommended)
**Notes:** Rate formatted as "From $X / night". Top 3 amenities from Hostaway response.

---

| Option | Description | Selected |
|--------|-------------|----------|
| "From $X / night" | Show base nightly rate with "From" prefix | ✓ |
| "$X / night" only | No "From" prefix | |
| You decide | Claude picks format | |

**User's choice:** "From $X / night"

---

| Option | Description | Selected |
|--------|-------------|----------|
| Full description + all amenities + multiple photos | Complete Hostaway data: full description, all amenities, gallery up to 6 photos | ✓ |
| Full description + all amenities + single hero photo | Skip gallery, one large photo | |
| You decide | Claude picks detail page layout | |

**User's choice:** Full description + all amenities + multiple photos (up to 6 in gallery)

---

## Build Failure Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Fail the build | Keep previous deployment if API unreachable | ✓ |
| Build succeeds with empty /rooms | Rooms page shows "No rooms available" | |
| You decide | Claude picks safest strategy | |

**User's choice:** Fail the build (Hostaway)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — fail the build | Consistent with Hostaway: fail if Prismic unreachable | ✓ |
| Succeed with fallback text | Render static placeholder text if Prismic down | |

**User's choice:** Fail the build (Prismic) — consistent policy across both APIs

---

## Prismic Schema

| Option | Description | Selected |
|--------|-------------|----------|
| Separate types (homepage + page) | Homepage gets its own type with dedicated fields; generic pages use page type | ✓ |
| One flexible 'page' type | Homepage is just a page with slug 'home' | |

**User's choice:** Separate types

---

**Freeform answer for homepage fields:**
"The hero will be a collection of 3-5 images that cycle through using a javascript carousel with fade transitions. The body will be an array of 'Blocks' which can include rich text, images, in different layouts that an editor can compose. There will be a CTA button."

**Interpretation:** Homepage type: `hero_images` (repeatable image group), `body` Slice Zone (RichText + ImageBlock slices), `cta_label` + `cta_url` fields.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Same slice zone for generic pages | Reuse RichText + ImageBlock slices on all pages | ✓ |
| Single rich text field only | Generic pages use one rich text field, no image blocks | |

**User's choice:** Same slice zone

---

## Photo Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Astro <Image> with remote URLs | Build-time optimization, WebP conversion, resizing | ✓ |
| Plain <img> with loading=lazy | Simpler, no optimization | |
| You decide | Claude picks based on static-first philosophy | |

**User's choice:** Astro <Image> with remote URLs (Hostaway photos)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — Astro <Image> for Prismic images too | Consistent approach across all images | ✓ |
| Prismic's built-in imgix optimization | Use Prismic URL parameters instead | |

**User's choice:** Astro <Image> for Prismic images too. Add both CDN domains to allowlist.

---

## Claude's Discretion

- Hostaway API client interface design (`src/lib/hostaway.ts` — `getRooms()`, `getRoom(id)`)
- Prismic client interface design (`src/lib/prismic.ts` — `getHomepage()`, `getPage(slug)`)
- Hero carousel implementation details (vanilla JS fade, no library required for PoC)

## Deferred Ideas

None raised during discussion.
