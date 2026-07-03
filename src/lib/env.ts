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
 *   PREVIEW_SECRET        — Shared secret required by Sanity Studio preview URLs
 *   SENTRY_AUTH_TOKEN     — Sentry source-map upload token (optional)
 *   GITHUB_DEPLOY_TOKEN       — GitHub token with Actions read/write for workflow dispatch
 *   GITHUB_DEPLOY_OWNER       — GitHub repository owner for the deploy workflow
 *   GITHUB_DEPLOY_REPO        — GitHub repository name for the deploy workflow
 *   GITHUB_DEPLOY_WORKFLOW_ID — GitHub Actions workflow file/id to dispatch
 *   GITHUB_DEPLOY_REF         — Git ref to dispatch, usually main
 *   DEPLOY_ALLOWED_ORIGINS        — Comma-separated Studio origins allowed to call /api/deploy
 *   DEPLOY_TRIGGER_TOKEN          — Optional bearer token for POST /api/deploy
 *
 * Public vars (safe to expose in client JS):
 *   PUBLIC_SENTRY_DSN — Sentry DSN for browser error reporting (optional)
 *   PUBLIC_GA4_ID     — Google Analytics 4 measurement ID (optional)
 *
 * Usage in server-only lib files (e.g. src/lib/hostaway.ts, src/lib/sanity.ts):
 *   import { HOSTAWAY_ACCESS_TOKEN, SANITY_API_TOKEN, PREVIEW_SECRET } from 'astro:env/server';
 *
 * Usage in client components (e.g. src/components/Analytics.astro):
 *   import { PUBLIC_SENTRY_DSN, PUBLIC_GA4_ID } from 'astro:env/client';
 *
 * For local development:
 *   Copy .env.example to .env.local and fill in all values.
 *   Do NOT commit .env.local to git.
 *
 * For Cloudflare Worker production:
 *   Configure runtime vars in Cloudflare Worker settings → Variables and Secrets.
 *   Configure build/deploy vars in GitHub Actions secrets and variables.
 *   Use PUBLIC_ prefix only for client-visible vars.
 */
