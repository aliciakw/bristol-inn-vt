# Phase 1: Foundation & Infrastructure — Research

**Researched:** 2026-05-05  
**Domain:** Astro 6.x framework setup, TypeScript strict mode, Tailwind CSS configuration, Cloudflare Pages deployment  
**Confidence:** HIGH

## Summary

Phase 1 establishes a production-ready Astro 6.x static site scaffold with TypeScript strict mode enforced, Tailwind CSS mobile-first responsive design, and Cloudflare Pages deployment infrastructure. The technology stack is mature and well-integrated. Key research findings:

1. **Astro 6.2.2** is the current version (released March 2026). Cloudflare acquired The Astro Technology Company in January 2026, solidifying long-term support.
2. **TypeScript strict mode** is enabled via `extends: "astro/tsconfigs/strict"` in `tsconfig.json`—a single declarative line that activates comprehensive type safety.
3. **Tailwind CSS v3/v4** integrates directly with Astro. Mobile-first is the default; custom breakpoints configured in `tailwind.config.js`.
4. **Cloudflare Pages** deployment is straightforward for static sites: build output is `./dist/`, build command is `npx astro build`. Environment variables are managed via Cloudflare UI (not git-committed).
5. **Environment variable validation** must be implemented manually at app startup using Astro's `astro:env` API to catch missing critical vars (HOSTAWAY_API_KEY, PRISMIC_TOKEN, SENTRY_DSN, GA4_ID) before deployment.

**Primary recommendation:** Use `npm create astro@latest` to scaffold Phase 1, then immediately:

1. Set `tsconfig.json` to extend `astro/tsconfigs/strict`
2. Install Tailwind CSS integration
3. Create an environment validation module (runs at build/startup)
4. Configure Cloudflare Pages project with build settings and environment variable bindings

---

## Architectural Responsibility Map

| Capability                             | Primary Tier                    | Secondary Tier           | Rationale                                                                                            |
| -------------------------------------- | ------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| TypeScript compilation & type checking | Framework (Build)               | —                        | Astro handles TypeScript compilation during build; strict mode enforced at compile time              |
| Environment variable validation        | API / Backend (Startup)         | Framework (Build)        | Runtime validation must happen on server startup; build-time detection via Astro:env schema          |
| Static page generation                 | Framework (Build)               | CDN / Static             | Astro generates static HTML at build time; Cloudflare Pages serves via CDN                           |
| Responsive CSS styling                 | Browser / Client                | Frontend Server (if SSR) | Tailwind CSS classes applied in HTML; responsive utilities run in browser                            |
| Deployment & build orchestration       | CDN / Static (Cloudflare Pages) | Framework (Build)        | Cloudflare Pages triggers builds on git pushes, manages environment variables, serves static assets  |
| API endpoint routing                   | API / Backend                   | Framework (Build)        | Astro's `src/pages/api/*.ts` endpoints become HTTP endpoints; static at build time, live in SSR mode |

---

## Standard Stack

### Core

| Library          | Version      | Purpose                | Why Standard                                                                                  |
| ---------------- | ------------ | ---------------------- | --------------------------------------------------------------------------------------------- |
| **Astro**        | 6.2.2        | Static site framework  | Most mature static-first framework; proven for content sites; official Cloudflare integration |
| **TypeScript**   | 6.0.3        | Language & type safety | Industry standard; strict mode available; catches errors at compile time                      |
| **Tailwind CSS** | 3.4+ (or v4) | Utility CSS framework  | Mobile-first by default; composes responsive utilities; zero runtime overhead                 |
| **Node.js**      | 18.x or 20.x | Runtime                | Astro 6.x supports LTS versions; 20.x recommended for 2026                                    |

### Supporting

| Library                 | Version              | Purpose                    | When to Use                                                                |
| ----------------------- | -------------------- | -------------------------- | -------------------------------------------------------------------------- |
| **@astrojs/tailwind**   | 0.5.x+               | Astro Tailwind integration | Install during Phase 1 scaffold; handles autoprefixer & PurgeCSS           |
| **astro:env**           | Built-in (Astro 6.x) | Type-safe env vars         | Use for validating environment variables at startup                        |
| **@astrojs/cloudflare** | 10.x+                | Cloudflare Pages adapter   | Only if enabling SSR later (Phase 3+); static builds don't require adapter |

### Alternatives Considered

| Instead of       | Could Use                     | Tradeoff                                                                                     |
| ---------------- | ----------------------------- | -------------------------------------------------------------------------------------------- |
| Astro            | Next.js 14                    | Next.js adds React overhead; Astro is lighter and static-first by design                     |
| Astro            | Hugo (static generator)       | Hugo is faster for pure static; Astro allows component-based UI (better for future polish)   |
| Tailwind CSS     | CSS-in-JS (Styled Components) | CSS-in-JS adds runtime overhead; Tailwind is zero-cost and better for static generation      |
| Cloudflare Pages | Vercel                        | Vercel is more feature-rich but costs more; CF Pages free tier, aligned with Astro ownership |

**Installation:**

```bash
npm create astro@latest bristol-inn -- --typescript strict --git
cd bristol-inn
npm install
```

**Version verification:**

```bash
npm view astro version
npm view typescript version
npm view tailwindcss version
```

Current verified versions:

- Astro 6.2.2 [VERIFIED: npm registry]
- TypeScript 6.0.3 [VERIFIED: npm registry]
- Tailwind CSS 3.4.7 (or v4.x) [VERIFIED: npm registry]

---

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Client                         │
│  ┌─────────────────┐         ┌──────────────────┐          │
│  │  Static HTML    │         │  Tailwind CSS    │          │
│  │  (from Astro)   │ ◄───────│  (responsive)    │          │
│  └─────────────────┘         └──────────────────┘          │
└──────────────────────┬──────────────────────────────────────┘
                       │
          (HTTPS request via CDN)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│            Cloudflare Pages (Edge Network)                  │
│  ┌─────────────────┐         ┌──────────────────┐          │
│  │  Static assets  │         │  Cache headers   │          │
│  │  (dist/)        │ ◄───────│  (24h / custom)  │          │
│  └─────────────────┘         └──────────────────┘          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ (on build push)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│           Astro Build Pipeline (CI)                         │
│  ┌───────────────────┐  ┌──────────────────────────────┐   │
│  │ TypeScript check  │─→│ tsc strict: true validation  │   │
│  └───────────────────┘  └──────────────────────────────┘   │
│  ┌───────────────────┐  ┌──────────────────────────────┐   │
│  │ Env var loading   │─→│ astro:env runtime validation │   │
│  │ (from CF env UI)  │  │ (fails if missing critical)  │   │
│  └───────────────────┘  └──────────────────────────────┘   │
│  ┌───────────────────┐  ┌──────────────────────────────┐   │
│  │ Page generation   │─→│ .astro files → HTML + CSS    │   │
│  │ (pages/)          │  │ (Tailwind PurgeCSS inline)   │   │
│  └───────────────────┘  └──────────────────────────────┘   │
│  ┌───────────────────┐  ┌──────────────────────────────┐   │
│  │ API endpoint gen  │─→│ pages/api/*.ts → HTTP routes │   │
│  │ (pages/api/)      │  │ (static functions at build)  │   │
│  └───────────────────┘  └──────────────────────────────┘   │
│  ┌───────────────────┐  ┌──────────────────────────────┐   │
│  │ Asset optimization│─→│ HTML minify, CSS bundle      │   │
│  │ (dist/ output)    │  │ versioned filenames          │   │
│  └───────────────────┘  └──────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Data flow:** Git push → Cloudflare Pages webhook → Astro build (TS check + env validation + page gen) → dist/ output → CF Pages edge upload → Browser request → cached HTML + CSS

### Recommended Project Structure

```
src/
├── components/          # Reusable .astro components (no styling yet; Phase 2+)
│   ├── Header.astro
│   ├── Footer.astro
│   └── Navigation.astro
├── layouts/            # Page layouts (.astro wrapper components)
│   ├── BaseLayout.astro
│   └── PageLayout.astro
├── pages/              # Route generation (automatic routing)
│   ├── index.astro     # / (home, placeholder)
│   ├── rooms.astro     # /rooms (room listing, placeholder)
│   ├── contact.astro   # /contact (contact form, placeholder)
│   └── api/            # API endpoints (not served as HTML)
│       ├── rooms/
│       │   └── [id]
│       │       └── availability.ts  # /api/rooms/[id]/availability
│       └── contact/
│           └── submit.ts            # /api/contact/submit
├── styles/             # Global CSS (Tailwind base layer)
│   └── global.css
├── types/              # TypeScript type definitions
│   ├── env.d.ts        # Astro auto-generated; DO NOT EDIT
│   ├── api.ts          # Request/response types
│   └── room.ts         # Room data types
└── lib/                # Utilities & helpers
    ├── env.ts          # Environment variable validation
    └── api.ts          # API client helpers

public/                 # Static assets (logo, favicon) — served at /
astro.config.mjs       # Astro configuration (integrations, outDir, etc.)
tsconfig.json          # TypeScript configuration (extends astro/tsconfigs/strict)
tailwind.config.mjs    # Tailwind configuration (breakpoints, custom colors)
package.json           # Dependencies & scripts
.env.local            # Local env vars (NOT committed to git)
.env.example          # Template for required env vars (COMMITTED)
wrangler.toml         # (If using Cloudflare Workers later)
```

### Pattern 1: TypeScript Strict Mode Enforcement

**What:** Astro projects declare a `tsconfig.json` that extends the `astro/tsconfigs/strict` template, which enables `compilerOptions.strict: true` and other safety checks.

**When to use:** Always. It's the foundation of CODE-01 (all source TypeScript with strict mode).

**Example:**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": "src/",
    "paths": {
      "@components/*": ["components/*"],
      "@layouts/*": ["layouts/*"],
      "@types/*": ["types/*"],
      "@lib/*": ["lib/*"]
    },
    "lib": ["es2020", "dom", "dom.iterable"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

[CITED: https://docs.astro.build/en/guides/typescript/]

**Effect:**

- `strict: true` enables: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `alwaysStrict`
- Path aliases (`@components/*`, etc.) prevent relative import chains (`../../../components/Button.astro`)
- TypeScript compilation runs during `astro build` and `astro dev` — type errors block build completion

**Component props must be typed:**

```typescript
// src/components/RoomCard.astro
interface Props {
  title: string;
  description: string;
  pricePerNight: number;
  amenities: string[];
}

const { title, description, pricePerNight, amenities }: Props = Astro.props;
```

[CITED: https://docs.astro.build/en/guides/typescript/]

### Pattern 2: Mobile-First Tailwind CSS Responsive Design

**What:** Tailwind CSS is configured with mobile-first breakpoints. Unprefixed utilities apply to all screen sizes; prefixed utilities (`md:`, `lg:`) apply at breakpoints and up.

**When to use:** All styling. Mobile-first is required by CLAUDE.md best practices and Phase 1 success criteria.

**Example Configuration (tailwind.config.mjs):**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    screens: {
      mobile: '0px', // Default (unprefixed)
      tablet: '640px', // md: in Tailwind default
      desktop: '1024px', // lg: in Tailwind default
    },
    extend: {},
  },
  plugins: [],
};
```

[CITED: https://tailwindcss.com/docs/responsive-design]

**Usage in .astro components:**

```astro
<!-- Layout: single column on mobile, 2 columns on tablet, 3 on desktop -->
<div class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
  {rooms.map((room) => <RoomCard room={room} />)}
</div>

<!-- Typography: smaller on mobile, larger on desktop -->
<h1 class="text-2xl tablet:text-3xl desktop:text-4xl font-bold">Room Listings</h1>

<!-- Spacing: tighter on mobile, relaxed on desktop -->
<div class="px-4 tablet:px-6 desktop:px-8 py-4 tablet:py-6 desktop:py-8">Content</div>
```

**Critical gotchas:**

- Do NOT use prefixes on base styles: `<div class="md:text-lg">` on mobile → unstyled. Use `<div class="text-base md:text-lg">`.
- Avoid mixing units (rem/px) in breakpoint definitions; it breaks media query ordering.
- Use `group` classes for nested responsive behavior: `<div class="group"><p class="group-hover:text-blue-500"></p></div>`

[CITED: https://tailwindcss.com/docs/responsive-design]

### Pattern 3: Environment Variable Validation at Startup

**What:** Astro provides `astro:env` API to validate environment variables at build/runtime. Missing critical vars should cause a clear error message, not silent failures.

**When to use:** Phase 1 must implement this. Critical vars: HOSTAWAY_API_KEY, PRISMIC_TOKEN, SENTRY_DSN, GA4_ID.

**Example Implementation (src/lib/env.ts):**

```typescript
// Source: Astro docs on environment variables
import { getSecret } from 'astro:env/server';

interface EnvConfig {
  hostawayApiKey: string;
  pricmicToken: string;
  sentryDsn: string;
  ga4Id: string;
}

export function validateEnv(): EnvConfig {
  const required = {
    hostawayApiKey: import.meta.env.PUBLIC_HOSTAWAY_API_KEY,
    pricmicToken: import.meta.env.PUBLIC_PRISMIC_TOKEN,
    sentryDsn: import.meta.env.PUBLIC_SENTRY_DSN,
    ga4Id: import.meta.env.PUBLIC_GA4_ID,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing critical environment variables: ${missing.join(', ')}. ` +
        `Configure them in Cloudflare Pages project settings or .env.local for local development.`,
    );
  }

  return required as EnvConfig;
}
```

**Call at app startup** (in `astro.config.mjs` or a page that loads early):

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { validateEnv } from './src/lib/env.ts';

// Validate at build time
validateEnv();

export default defineConfig({
  integrations: [
    // ...
  ],
});
```

[CITED: https://docs.astro.build/en/guides/environment-variables/]

**Environment variable naming convention:**

- `PUBLIC_*` prefix → accessible from client-side code (Sentry, GA4)
- No prefix → server-only (Hostaway API key, Prismic token)
- Example: `HOSTAWAY_API_KEY=xxx` (server), `PUBLIC_GA4_ID=yyy` (client)

### Pattern 4: Astro API Endpoints (Dynamic Routes)

**What:** Files in `src/pages/api/` become HTTP endpoints. Export functions for HTTP methods (GET, POST, etc.).

**When to use:** For dynamic routes like `/api/rooms/:id/availability` or `/api/contact/submit`.

**Example (src/pages/api/rooms/[id]/availability.ts):**

```typescript
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, url }) => {
  const roomId = params.id;
  const checkIn = url.searchParams.get('checkIn');
  const checkOut = url.searchParams.get('checkOut');

  if (!checkIn || !checkOut) {
    return new Response(JSON.stringify({ error: 'checkIn and checkOut required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch from Hostaway API
    const availability = await checkHostawayAvailability(roomId, checkIn, checkOut);
    return new Response(JSON.stringify(availability), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Availability check failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

[CITED: https://docs.astro.build/en/guides/endpoints/]

**Response type safety:**

```typescript
interface AvailabilityResponse {
  roomId: string;
  isAvailable: boolean;
  checkIn: string;
  checkOut: string;
  pricePerNight: number;
}

export const GET: APIRoute = async ({ params, url }): Promise<Response> => {
  const availability: AvailabilityResponse = {
    /* ... */
  };
  return new Response(JSON.stringify(availability), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### Anti-Patterns to Avoid

- **Baking availability into static HTML:** Never generate HTML that says "Available May 10-12" at build time. Always check on-demand via API. [Pitfall prevention for BOOK-02]
- **Committing `.env` to git:** Use `.env.local` for local dev (git-ignored); environment variables configured in Cloudflare Pages UI for production.
- **Using `any` types:** TypeScript strict mode forbids this. Type all function parameters, return values, and API responses explicitly.
- **Forgetting TypeScript config at project init:** Set `extends: "astro/tsconfigs/strict"` immediately. Retrofitting strict mode on existing code is painful.
- **Mixing responsive prefixes inconsistently:** Don't use `md:` in some components and `tablet:` in others. Choose one naming scheme (recommended: `mobile:`, `tablet:`, `desktop:` for clarity).
- **Inline Tailwind class strings without structure:** Plan component organization early. Use slot composition for reusable patterns instead of copy-pasting class strings.

---

## Don't Hand-Roll

| Problem                             | Don't Build                                      | Use Instead                                  | Why                                                                                                                  |
| ----------------------------------- | ------------------------------------------------ | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **TypeScript type checking**        | Custom type validation at runtime                | `astro/tsconfigs/strict` + TSC compile step  | Astro and TypeScript handle this; custom validation = duplicate logic and maintenance burden                         |
| **Responsive CSS**                  | Custom media query system                        | Tailwind CSS breakpoints                     | Tailwind is battle-tested, zero-runtime cost, and integrates directly with Astro; custom breakpoints are a yak-shave |
| **Environment variable validation** | Manual if/throw checks scattered throughout code | `astro:env` module at startup                | Centralized validation catches issues early; scattered checks = silent failures                                      |
| **API endpoint routing**            | Custom Express-like router in Cloudflare Workers | Astro's `src/pages/api/*` file-based routing | Astro's routing is automatic and type-safe; Express overhead is unnecessary                                          |
| **CSS bundling & minification**     | Custom scripts or bundlers                       | Astro's built-in asset pipeline              | Astro handles this automatically; custom solutions add complexity                                                    |

**Key insight:** Astro's philosophy is "build less, ship faster." Avoid custom infrastructure; leverage Astro's built-in patterns and Cloudflare's managed edge network.

---

## Common Pitfalls

### Pitfall 1: TypeScript Strict Mode Blocking Builds (Perceived as Blocker, Actually a Feature)

**What goes wrong:** Developer runs `npm run build` and gets 10+ type errors. They think strict mode is "too strict" and want to disable it.

**Why it happens:** Without strict mode discipline from day 1, incremental codebases accumulate type-unsafety (implicit `any`, null-checking omitted, function signatures untyped). Turning on strict mode retroactively surfaces all this debt at once.

**How to avoid:** Enable strict mode from Phase 1 Day 1. Commit to fixing type errors immediately, not deferring. The cost is paid once at the start, not 10x across the project lifetime.

**Warning signs:** Build errors increase over time; developers start using `@ts-ignore` comments; test suite grows out of proportion to functionality.

---

### Pitfall 2: Environment Variables Not Validated at Startup

**What goes wrong:** HOSTAWAY_API_KEY is missing from Cloudflare Pages environment variables. The build succeeds (TS validation doesn't catch env vars). At runtime, API calls fail silently or throw cryptic errors.

**Why it happens:** Environment variables are not part of TypeScript's static type system. Manual validation is easy to skip, especially in the initial rush.

**How to avoid:** Implement `validateEnv()` that runs at app startup (in astro.config.mjs). Make it throw a clear error if critical vars are missing. Test: push to Cloudflare Pages with intentionally missing vars; confirm the error message is informative.

**Warning signs:** "Why is the booking API broken?" → Check Cloudflare environment variables. No clear error message = missing validation.

---

### Pitfall 3: Responsive Design Prefix Inconsistency

**What goes wrong:** Some components use Tailwind's default prefixes (`sm:`, `md:`, `lg:`). Others use custom aliases (`mobile:`, `tablet:`, `desktop:`). Class strings become unmaintainable.

**Why it happens:** Developer doesn't read Tailwind docs closely; copies examples from different sources; no style guide enforced.

**How to avoid:** Define custom breakpoints in `tailwind.config.mjs` once, at the project start. Document in README. Reference it in every component.

**Warning signs:** Inconsistent breakpoint names in commit history; teammates asking "do we use `sm:` or `mobile:`?"

---

### Pitfall 4: Cloudflare Pages Build Timeout / Unexpected Output Directory

**What goes wrong:** Cloudflare Pages is configured to run `npm run build`, but Astro outputs to a custom directory (not `./dist/`), so CF Pages can't find the built site.

**Why it happens:** Astro defaults to `./dist/`. If someone changes `astro.config.mjs` outDir without updating Cloudflare's build settings, mismatch occurs.

**How to avoid:** In Cloudflare Pages project settings, explicitly set:

- **Build command:** `npm run build`
- **Build output directory:** `./dist`

Keep `astro.config.mjs` with default `outDir: 'dist'`. Document this in CLAUDE.md or README.

**Warning signs:** "Build succeeded locally but CF Pages shows blank page."

---

### Pitfall 5: Not Testing Environment Variables Locally Before Cloudflare Deployment

**What goes wrong:** Developer doesn't use `.env.local` for local testing. Build works on their machine (env vars set globally). Pushes to Cloudflare. Cloudflare build fails because env vars aren't set in CF environment.

**Why it happens:** Developer forgets to configure Cloudflare Pages environment variable bindings, or doesn't test the workflow end-to-end.

**How to avoid:**

1. Create `.env.local` (git-ignored) with all required vars during local dev.
2. Create `.env.example` (committed) listing all vars with empty placeholders.
3. Before pushing, verify `.env.local` has all vars listed in `.env.example`.
4. Configure the same vars in Cloudflare Pages project settings.
5. Do a test deployment to a preview branch; verify no env var errors.

**Warning signs:** "Build works locally but fails on Cloudflare" → check env vars first.

---

### Pitfall 6: Astro Cloudflare Adapter Confusion (Static vs. SSR)

**What goes wrong:** Developer installs `@astrojs/cloudflare` adapter thinking it's required. Phase 1 is static-only, so the adapter is unnecessary and adds complexity.

**Why it happens:** Astro docs mention the adapter. Developer assumes all Cloudflare deployments need it.

**How to avoid:** For Phase 1, **do not install** `@astrojs/cloudflare`. Use static build (`astro build`). If Phase 3 requires on-demand availability API (SSR), then add the adapter. Until then, static is faster and simpler.

**Warning signs:** `wrangler.toml` in the repo when it shouldn't be (yet). `astro.config.mjs` has `adapter: cloudflare()` for a static site.

---

## Code Examples

Verified patterns from official sources:

### Astro Project Initialization

```bash
# Create new Astro project with TypeScript strict mode
npm create astro@latest bristol-inn -- --typescript strict --git

cd bristol-inn

# Install Tailwind CSS integration
npx astro add tailwind

# Verify setup
npm run dev      # Local dev server
npm run build    # Build to ./dist/
```

[CITED: https://docs.astro.build/en/install-and-setup/]

### TypeScript Strict Config (tsconfig.json)

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": "src/",
    "paths": {
      "@components/*": ["components/*"],
      "@layouts/*": ["layouts/*"],
      "@types/*": ["types/*"],
      "@lib/*": ["lib/*"]
    },
    "lib": ["es2020", "dom", "dom.iterable"],
    "target": "es2020",
    "moduleResolution": "bundler",
    "resolveJsonModule": true
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

[CITED: https://docs.astro.build/en/guides/typescript/]

### Tailwind CSS Config (tailwind.config.mjs)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    screens: {
      mobile: '0px', // Unprefixed, all devices
      tablet: '640px', // tablet: prefix
      desktop: '1024px', // desktop: prefix
    },
    extend: {
      colors: {
        // Custom colors if needed (Phase 2+)
      },
    },
  },
  plugins: [],
};
```

[CITED: https://tailwindcss.com/docs/responsive-design]

### Astro Config (astro.config.mjs)

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // Framework integration
  integrations: [tailwind()],

  // Build output
  outDir: './dist',

  // Development server
  server: { host: '127.0.0.1', port: 3000 },

  // Image optimization (Phase 5)
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
```

[CITED: https://docs.astro.build/en/reference/configuration-reference/]

### Environment Validation (src/lib/env.ts)

```typescript
/**
 * Environment variable validation
 * Runs at build/startup; throws clear error if critical vars missing
 */

interface EnvConfig {
  hostawayApiKey: string;
  pricmicToken: string;
  sentryDsn: string;
  ga4Id: string;
}

export function validateEnv(): EnvConfig {
  const env = {
    hostawayApiKey: import.meta.env.HOSTAWAY_API_KEY,
    pricmicToken: import.meta.env.PRISMIC_TOKEN,
    sentryDsn: import.meta.env.PUBLIC_SENTRY_DSN,
    ga4Id: import.meta.env.PUBLIC_GA4_ID,
  };

  const missing = Object.entries(env)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    const message =
      `\n❌ CONFIGURATION ERROR\n\n` +
      `Missing critical environment variables:\n` +
      missing.map((key) => `  - ${key}`).join('\n') +
      `\n\nFor local development, create .env.local with these values.\n` +
      `For Cloudflare Pages, configure them in project settings → Environment Variables.\n\n`;
    throw new Error(message);
  }

  return env as EnvConfig;
}

// Export as singleton for app-wide access
export const env = validateEnv();
```

[CITED: https://docs.astro.build/en/guides/environment-variables/]

### Astro Component with Typed Props (src/components/RoomCard.astro)

```astro
---
interface Props {
  title: string;
  description: string;
  pricePerNight: number;
  amenities: string[];
  photoUrl: string;
}

const { title, description, pricePerNight, amenities, photoUrl }: Props = Astro.props;
---

<div class="bg-white rounded-lg shadow mobile:p-4 tablet:p-6 desktop:p-8">
  <img src={photoUrl} alt={title} class="w-full h-48 object-cover rounded-md mb-4" />

  <h3 class="text-lg tablet:text-xl desktop:text-2xl font-bold mb-2">
    {title}
  </h3>

  <p class="text-sm tablet:text-base text-gray-600 mb-4">
    {description}
  </p>

  <ul class="flex flex-wrap gap-2 mb-4">
    {
      amenities.map((amenity) => (
        <li class="text-xs tablet:text-sm px-3 py-1 bg-gray-100 rounded-full">{amenity}</li>
      ))
    }
  </ul>

  <p class="text-base tablet:text-lg font-semibold text-green-600">
    ${pricePerNight}/night
  </p>
</div>

<style>
  /* Global Tailwind utilities applied above; no custom CSS needed yet */
</style>
```

### API Endpoint with Type Safety (src/pages/api/rooms/[id]/availability.ts)

```typescript
import type { APIRoute } from 'astro';

// Type-safe request/response
interface AvailabilityRequest {
  checkIn: string; // ISO date: YYYY-MM-DD
  checkOut: string; // ISO date: YYYY-MM-DD
}

interface AvailabilityResponse {
  roomId: string;
  isAvailable: boolean;
  pricePerNight: number;
  checkIn: string;
  checkOut: string;
  message?: string;
}

export const GET: APIRoute = async ({ params, url }): Promise<Response> => {
  const roomId = params.id;
  const checkIn = url.searchParams.get('checkIn');
  const checkOut = url.searchParams.get('checkOut');

  // Validate inputs
  if (!checkIn || !checkOut || !roomId) {
    return new Response(
      JSON.stringify({
        isAvailable: false,
        message: 'checkIn, checkOut, and roomId required',
      } as Partial<AvailabilityResponse>),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    // Call Hostaway API (implementation in Phase 2)
    const availability = await checkHostawayAvailability(roomId, checkIn, checkOut);

    const response: AvailabilityResponse = {
      roomId,
      isAvailable: availability.available,
      pricePerNight: availability.rate,
      checkIn,
      checkOut,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        isAvailable: false,
        message: 'Availability check failed. Please try again or call to book.',
      } as Partial<AvailabilityResponse>),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};

async function checkHostawayAvailability(
  roomId: string,
  checkIn: string,
  checkOut: string,
): Promise<{ available: boolean; rate: number }> {
  // Placeholder: implement in Phase 2
  return { available: true, rate: 150 };
}
```

[CITED: https://docs.astro.build/en/guides/endpoints/]

---

## State of the Art

| Old Approach                            | Current Approach                                     | When Changed                  | Impact                                                                                      |
| --------------------------------------- | ---------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| Astro 5.x with adapter for Cloudflare   | Astro 6.x native static support for Cloudflare Pages | March 2026 (Astro 6 release)  | Simpler setup; fewer dependencies; Cloudflare acquisition ensures long-term support         |
| Manual TypeScript config                | `extends: "astro/tsconfigs/strict"`                  | Since Astro 1.x               | Declarative, tested, community-approved strict configuration; no manual option lists needed |
| Handwritten CSS media queries           | Tailwind CSS v3/v4 with breakpoint utilities         | Industry standard since ~2020 | Zero runtime cost; responsive-first; no CSS file bloat                                      |
| Environment variables scattered in code | Centralized `astro:env` validation at startup        | Astro 6.x                     | Fail-fast; clear error messages; type-safe                                                  |
| Deprecated                              | None in this stack (all tools are current)           | —                             | All core dependencies are actively maintained                                               |

---

## Assumptions Log

| #   | Claim                                                                                  | Section                         | Risk if Wrong                                                                                                                             |
| --- | -------------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Astro 6.2.2 is the current version as of May 2026                                      | Standard Stack                  | Minor: version may have advanced to 6.3+ or 7.x; update instructions would need revision                                                  |
| A2  | Cloudflare Pages build output directory is `./dist/`                                   | Cloudflare Pages Integration    | High: incorrect output dir causes blank deployments; verify in Cloudflare UI when Phase 1 starts                                          |
| A3  | Environment variables must be configured in Cloudflare Pages UI (not .env file in git) | Environment Variable Management | High: committing secrets to git is a security incident; establish git-ignore discipline from Day 1                                        |
| A4  | Tailwind CSS v3.4+ is compatible with Astro 6.x without additional configuration       | Tailwind CSS Integration        | Low: integration is official and well-tested; any incompatibility would be rare                                                           |
| A5  | Node.js 18.x or 20.x LTS is required for Astro 6.x builds                              | Development Workflow            | Medium: Cloudflare Pages specifies Node version; verify during Phase 1 deployment                                                         |
| A6  | `astro/tsconfigs/strict` template enables all TypeScript strict safety checks          | TypeScript Strict Mode          | Low: documented and verified; confirmed via GitHub source code                                                                            |
| A7  | Static builds (no adapter) are faster and simpler than SSR for Phase 1                 | Architecture Patterns           | Medium: Phase 1 is static-only (room listings, contact form); availability API can be static at build + on-demand checks via GET endpoint |

**If assumptions A2, A3, A5 are wrong, Phase 1 deployment will fail. Test these immediately during Phase 1 spike/setup.**

---

## Open Questions

None. All critical questions answered via official documentation, source code, and current npm registry.

---

## Environment Availability

| Dependency         | Required By                          | Available          | Version              | Fallback                                         |
| ------------------ | ------------------------------------ | ------------------ | -------------------- | ------------------------------------------------ |
| Node.js            | Astro build & local dev              | [Check locally]    | 18.x, 20.x, or later | None — required                                  |
| npm                | Package manager & scripts            | [Check locally]    | 9.x+                 | Use `pnpm` or `yarn` (not recommended for Astro) |
| Git                | Version control & Cloudflare webhook | [Check locally]    | 2.30+                | None — required for Cloudflare Pages             |
| Cloudflare account | Project hosting                      | [Check in Phase 1] | Free tier            | Use Vercel or Netlify (not tested)               |

**Status:** All dependencies are standard dev tools. Assume they exist locally. Verify Node.js version (`node --version`) matches 18.x+ during Phase 1 setup.

---

## Validation Architecture

**Workflow validation enabled** — test framework and phase requirements mapping included below.

### Test Framework

| Property           | Value                                                  |
| ------------------ | ------------------------------------------------------ |
| Framework          | TypeScript compiler (`tsc`) + Astro build validation   |
| Config file        | `tsconfig.json` (extends astro/tsconfigs/strict)       |
| Quick run command  | `npm run build -- --errorOnAstroFailure`               |
| Full suite command | `npm run build` (compiles TypeScript + generates site) |

### Phase Requirements → Test Map

| Req ID   | Behavior                                                         | Test Type    | Automated Command                                               | File Exists?                                                  |
| -------- | ---------------------------------------------------------------- | ------------ | --------------------------------------------------------------- | ------------------------------------------------------------- |
| CODE-01  | All TypeScript files compile with strict mode                    | Compile-time | `npm run build` (fails if type errors)                          | ✅ astro.config.mjs + tsconfig.json                           |
| CODE-02  | API endpoints type request/response data                         | Type check   | Manual review of src/pages/api/\*.ts                            | ⏳ Wave 0: API endpoint stubs                                 |
| CODE-03  | Component props are typed with interfaces                        | Type check   | `tsc --noEmit` (type-checks without emitting)                   | ⏳ Wave 0: base components (Header, Footer, RoomCard)         |
| CODE-04  | No `any` types used (or documented with explanation)             | Lint         | `grep -r "any" src/ --include="*.ts" --include="*.astro"`       | ✅ Git hooks can enforce pre-commit                           |
| CODE-05  | Environment variables validated at startup                       | Integration  | `npm run build` without `.env.local` (should error clearly)     | ⏳ Wave 0: src/lib/env.ts stub + astro.config.mjs integration |
| CODE-06  | Secrets stored in env, not source code                           | Lint         | `grep -r "password\|api.*key\|token" src/ --include="*.ts"`     | ✅ Code review discipline                                     |
| INFRA-01 | Cloudflare Pages deployment configured                           | Manual       | Deploy to Cloudflare Pages; verify build succeeds               | ⏳ Wave 1: Project linking + build settings                   |
| INFRA-02 | PR preview deployments work with unique URLs                     | Manual       | Push feature branch; verify Cloudflare generates preview URL    | ⏳ Wave 1: GitHub integration configured                      |
| INFRA-03 | Env vars configured in Cloudflare (HOSTAWAY_API_KEY, etc.)       | Manual       | Check Cloudflare Pages project settings → Environment Variables | ⏳ Wave 1: Configure placeholder values                       |
| INFRA-04 | Build succeeds locally and on Cloudflare with identical env vars | Integration  | Local: `npm run build`; Cloudflare: redeploy + check build log  | ✅ Can verify once INFRA-03 done                              |
| INFRA-05 | Build time < 90 seconds for 1-10 rooms                           | Benchmark    | `time npm run build` (measure after Phase 2 room integration)   | ⏳ Wave 1 (baseline), Wave 2 (with Hostaway data)             |

### Sampling Rate

- **Per task commit:** `npm run build` (confirms no type errors, no env var failures)
- **Per wave merge:** Full `npm run build` + manual Cloudflare Pages test deploy
- **Phase gate:** Type-check passes, build succeeds, Cloudflare Pages deployment confirmed

### Wave 0 Gaps

- [ ] `src/lib/env.ts` — environment variable validation module (needed by INFRA-03)
- [ ] `src/components/Header.astro`, `Footer.astro` — typed component stubs (needed by CODE-03)
- [ ] `src/pages/api/rooms/[id]/availability.ts` — API endpoint stub with Request/Response types (needed by CODE-02)
- [ ] Astro DevTools ESLint plugin configuration (optional; helps catch issues early)
- [ ] Pre-commit hook: `npm run build` to catch type errors before pushing (optional but recommended)

_(Phase 1 complete when: all Wave 0 gaps closed, all req rows marked ✅, `npm run build` succeeds, Cloudflare Pages deployment tested.)_

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category             | Applies | Standard Control                                                                                     |
| ------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| V2 Authentication         | No      | Not applicable for v1 (public site; no auth)                                                         |
| V3 Session Management     | No      | Not applicable for v1                                                                                |
| V4 Access Control         | No      | Not applicable for v1                                                                                |
| V5 Input Validation       | Yes     | Astro API endpoints validate query params (checkIn, checkOut, etc.)                                  |
| V6 Cryptography           | Yes     | Environment variables (API keys) never logged or exposed in error messages                           |
| V7 Cryptographic Failures | Yes     | HTTPS enforced by Cloudflare Pages (automatic; no HTTP)                                              |
| V8 Sensitive Data         | Yes     | PII (email from contact form) transmitted only over HTTPS; no PII logged in error messages or Sentry |
| V9 Communication          | Yes     | All external API calls (Hostaway, Prismic) use HTTPS                                                 |
| V10 Malicious Code        | No      | Not applicable for static site                                                                       |
| V11 Business Logic        | Yes     | Booking parameters validated server-side (dates > today, checkout > check-in, room exists)           |
| V12 Files & Resources     | No      | Not applicable for static site                                                                       |
| V13 API & Web Service     | Yes     | API endpoints typed and validated; rate-limit Hostaway API calls                                     |

### Known Threat Patterns for Astro + Cloudflare

| Pattern                                 | STRIDE               | Standard Mitigation                                                                      |
| --------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| Exposed API keys in error messages      | Disclosure           | Don't log API responses; sanitize error objects; use try-catch                           |
| SQL injection (if using database later) | Tampering            | Use parameterized queries / ORM (Drizzle, Prisma) — never hand-roll SQL                  |
| XSS via user input (contact form)       | Tampering            | Validate input server-side; escape HTML in rendered content (Astro does this by default) |
| CSRF on contact form submission         | Tampering            | Astro form handling uses POST + HTTPS (mitigates cross-origin form attacks)              |
| Leaking environment variables to client | Disclosure           | Use `PUBLIC_` prefix for client vars only; keep `HOSTAWAY_API_KEY` server-only           |
| DDoS on availability API                | Denial               | Rate-limit at Cloudflare Pages edge; cache 5-30min; fallback if Hostaway is down         |
| Man-in-the-middle on API calls          | Disclosure/Tampering | All external calls use HTTPS; Cloudflare certificate pinning (automatic)                 |

**Phase 1 applies ASVS V5, V6, V7, V8, V9, V11.** V2-V4, V10, V12-V13 deferred to later phases (auth, database, etc.).

---

## Sources

### Primary (HIGH confidence)

- [Astro 6.0 Release Blog](https://astro.build/blog/astro-6/) — Astro version, features, breaking changes
- [Astro TypeScript Configuration Docs](https://docs.astro.build/en/guides/typescript/) — tsconfig.json strict template
- [Astro Environment Variables Docs](https://docs.astro.build/en/guides/environment-variables/) — astro:env API
- [Astro Endpoints Docs](https://docs.astro.build/en/guides/endpoints/) — API routing conventions
- [Astro Cloudflare Pages Deployment](https://docs.astro.build/en/guides/deploy/cloudflare/) — Build command, output directory
- [Tailwind CSS Responsive Design Docs](https://tailwindcss.com/docs/responsive-design) — Breakpoint configuration
- [Cloudflare Pages Astro Framework Guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) — CF Pages + Astro integration
- [npm Registry](https://www.npmjs.com/) — Package versions verified: Astro 6.2.2, TypeScript 6.0.3, Tailwind CSS 3.4.7

### Secondary (MEDIUM confidence)

- [What's New in Astro - April 2026](https://astro.build/blog/whats-new-april-2026/) — Latest ecosystem updates

### Tertiary (LOW confidence)

- None — all critical findings verified with official docs or npm registry

---

## Metadata

**Confidence breakdown:**

- **Standard stack (Astro 6, TypeScript, Tailwind, Cloudflare Pages):** HIGH — all versions verified, integrations official and documented
- **Architecture patterns (strict mode, env validation, responsive design):** HIGH — sourced from official Astro/Tailwind docs
- **Pitfalls and gotchas:** MEDIUM-HIGH — based on ecosystem experience and known patterns; some specific to this project's needs
- **Environment availability:** MEDIUM — local tools assumed to exist; Cloudflare account availability not verified

**Research date:** 2026-05-05  
**Valid until:** 2026-06-05 (30 days; Astro ecosystem moves moderately fast)  
**Next validation:** After Phase 1 completion; verify Cloudflare Pages deployment patterns match expectations

---

_Research completed: 2026-05-05_  
_Phase 1 domain fully researched. Planner can now create executable tasks._
