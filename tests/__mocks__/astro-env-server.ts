/**
 * Test-only mock for the 'astro:env/server' Astro virtual module.
 *
 * Used exclusively during vitest runs via the alias in vitest.config.ts:
 *   'astro:env/server' → './tests/__mocks__/astro-env-server.ts'
 *
 * This file is NEVER imported in production code (src/). It exists solely to
 * allow unit tests for lib files (e.g. src/lib/hostaway.ts, src/lib/prismic.ts)
 * to resolve env var imports without requiring the Astro runtime.
 *
 * Values here are fake test tokens — not real credentials.
 */

export const HOSTAWAY_ACCESS_TOKEN = 'test-hostaway-token';
export const SANITY_API_TOKEN = 'test-sanity-token';
export const CLOUDFLARE_ACCOUNT_ID = 'test-cloudflare-account';
export const CLOUDFLARE_PAGES_PROJECT_NAME = 'test-pages-project';
export const CLOUDFLARE_API_TOKEN = 'test-cloudflare-token';
export const DEPLOY_ALLOWED_ORIGINS = 'https://studio.example.com,http://localhost:3333';
export const DEPLOY_TRIGGER_TOKEN = 'test-deploy-trigger-token';
