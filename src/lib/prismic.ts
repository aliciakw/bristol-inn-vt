/**
 * Prismic CMS client wrapper — Phase 2
 *
 * Thin typed wrapper over @prismicio/client that exposes only what Phase 2
 * needs: getHomepage(), getPage(), getPages(), and the raw client for the
 * preview route (getClient()).
 *
 * Design decisions:
 *   - Singleton client: one instance per build; avoids repeated DNS lookups.
 *   - No try/catch: errors propagate to the build — per D-07, a Prismic failure
 *     should fail the build (Cloudflare keeps the previous successful deploy).
 *   - PRISMIC_TOKEN is never logged or exposed outside createClient options.
 *   - Imports from '@prismicio/client' only — NOT from 'prismic' (the CLI tool).
 *
 * Usage in page files:
 *   import { getHomepage, getPage, getPages } from '../lib/prismic';
 *
 * Usage in preview route (preview.astro):
 *   import { getClient } from '../lib/prismic';
 *   const client = getClient();
 *   const url = await client.resolvePreviewURL({ ... });
 */

import * as prismic from '@prismicio/client';
import { PRISMIC_TOKEN } from 'astro:env/server';

/** Prismic repository name — matches https://bristol-inn-vt.cdn.prismic.io/api/v2 */
const REPO_NAME = 'bristol-inn-vt';

/** Singleton client instance. Initialised lazily on first call. */
let _client: prismic.Client | null = null;

/**
 * Returns the Prismic client, creating it on first call (singleton).
 *
 * Exported for use in preview.astro which needs direct client access to call
 * client.resolvePreviewURL(). All other page files should use the typed
 * wrapper functions below.
 */
export function getClient(): prismic.Client {
  if (_client) return _client;
  _client = prismic.createClient(REPO_NAME, { accessToken: PRISMIC_TOKEN });
  return _client;
}

/**
 * Fetches the singleton 'homepage' Prismic document.
 *
 * Used in src/pages/index.astro to render the hero carousel, overview text,
 * and CTA from the homepage document type (D-08).
 *
 * @throws Prismic API error — let build fail per D-07.
 */
export async function getHomepage(): Promise<prismic.PrismicDocument> {
  return getClient().getSingle('homepage');
}

/**
 * Fetches a single 'page' Prismic document by UID (slug).
 *
 * Used in src/pages/[slug].astro to render generic CMS pages (about, contact,
 * etc.) at their slug-determined URLs (D-10).
 *
 * @param slug — the Prismic document UID (e.g. 'about', 'contact')
 * @throws Prismic 404 error for unknown UIDs — propagates to 404 page.
 */
export async function getPage(slug: string): Promise<prismic.PrismicDocument> {
  return getClient().getByUID('page', slug);
}

/**
 * Fetches all 'page' Prismic documents.
 *
 * Used in src/pages/[slug].astro getStaticPaths() to enumerate all published
 * pages at build time (D-05 pattern for CMS pages).
 *
 * @throws Prismic API error — let build fail per D-07.
 */
export async function getPages(): Promise<prismic.PrismicDocument[]> {
  return getClient().getAllByType('page');
}
