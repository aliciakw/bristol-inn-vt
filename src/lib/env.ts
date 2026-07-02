/**
 * Environment variable documentation — Phase 2
 *
 * All secret and public env vars are validated by Astro 6's built-in env schema
 * defined in astro.config.mjs via `envField`. No runtime validation code is
 * needed here; Astro throws a clear error at build time if any required var is
 * missing.
 *
 * Server-only secrets (never emitted into client bundle):
 *   HOSTAWAY_ACCESS_TOKEN — Hostaway API Bearer token (pre-generated, exp 2028-05-15)
 *   SANITY_API_TOKEN      — Sanity CMS read token
 *   SENTRY_AUTH_TOKEN     — Sentry source-map upload token (optional)
 *   CLOUDFLARE_ACCOUNT_ID         — Cloudflare account id for Pages API calls
 *   CLOUDFLARE_PAGES_PROJECT_NAME — Cloudflare Pages project name
 *   CLOUDFLARE_API_TOKEN          — Cloudflare API token with Pages edit/read access
 *   DEPLOY_ALLOWED_ORIGINS        — Comma-separated Studio origins allowed to call /api/deploy
 *   DEPLOY_TRIGGER_TOKEN          — Optional bearer token for POST /api/deploy
 *
 * Public vars (safe to expose in client JS):
 *   PUBLIC_SENTRY_DSN — Sentry DSN for browser error reporting (optional)
 *   PUBLIC_GA4_ID     — Google Analytics 4 measurement ID (optional)
 *
 * Usage in server-only lib files (e.g. src/lib/hostaway.ts, src/lib/sanity.ts):
 *   import { HOSTAWAY_ACCESS_TOKEN, SANITY_API_TOKEN } from 'astro:env/server';
 *
 * Usage in client components (e.g. src/components/Analytics.astro):
 *   import { PUBLIC_SENTRY_DSN, PUBLIC_GA4_ID } from 'astro:env/client';
 *
 * For local development:
 *   Copy .env.example to .env.local and fill in all values.
 *   Do NOT commit .env.local to git.
 *
 * For Cloudflare Pages production:
 *   Configure all vars in Cloudflare project settings → Environment Variables.
 *   Use PUBLIC_ prefix only for client-visible vars.
 */
