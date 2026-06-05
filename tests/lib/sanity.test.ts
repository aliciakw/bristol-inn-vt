/**
 * Unit tests for src/lib/sanity.ts
 *
 * Mocks @sanity/client so no real HTTP calls are made.
 * The astro:env/server alias in vitest.config.ts resolves SANITY_API_TOKEN
 * to 'test-sanity-token' from tests/__mocks__/astro-env-server.ts.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock @sanity/client before importing the module under test
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();
const mockCreateClient = vi.fn();

vi.mock('@sanity/client', () => ({
  createClient: mockCreateClient,
}));

// Import after mocking so the module picks up the mock
const { getHomepage, getPage, getPages, getClient } = await import('../../src/lib/sanity');

// Capture createClient args from the singleton initialisation (first call).
getClient();
const initialCreateClientArgs = mockCreateClient.mock.calls[0] as
  | [Record<string, unknown>]
  | undefined;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();

  mockCreateClient.mockReturnValue({ fetch: mockFetch });
});

// ---------------------------------------------------------------------------
// getClient()
// ---------------------------------------------------------------------------

describe('getClient()', () => {
  it('calls createClient with projectId "4rk27ty6"', () => {
    expect(initialCreateClientArgs).toBeDefined();
    expect(initialCreateClientArgs?.[0]).toMatchObject({ projectId: '4rk27ty6' });
  });

  it('passes SANITY_API_TOKEN as token', () => {
    expect(initialCreateClientArgs?.[0]).toMatchObject({ token: 'test-sanity-token' });
  });

  it('uses dataset "production"', () => {
    expect(initialCreateClientArgs?.[0]).toMatchObject({ dataset: 'production' });
  });

  it('does NOT include the token in any logged console output', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    getClient();
    for (const call of consoleSpy.mock.calls) {
      expect(call.join(' ')).not.toContain('test-sanity-token');
    }
  });
});

// ---------------------------------------------------------------------------
// getHomepage()
// ---------------------------------------------------------------------------

describe('getHomepage()', () => {
  it('calls fetch with a query targeting the homepage type and the singleton document id', async () => {
    mockFetch.mockResolvedValue({ heroImages: [], ctaLabel: '', ctaUrl: '', body: [] });

    await getHomepage();

    expect(mockFetch).toHaveBeenCalledOnce();
    const query: string = mockFetch.mock.calls[0][0];
    expect(query).toContain('"homepage"');
    const params = mockFetch.mock.calls[0][1];
    expect(params).toMatchObject({ id: '6e561f5f-23ec-49fa-863f-141c005904c3' });
  });

  it('returns the document returned by fetch', async () => {
    const doc = {
      heroImages: [{ url: 'https://cdn.sanity.io/img.jpg', alt: 'test' }],
      ctaLabel: 'Book Now',
      ctaUrl: '/rooms',
      body: [],
    };
    mockFetch.mockResolvedValue(doc);

    const result = await getHomepage();

    expect(result).toBe(doc);
  });

  it('propagates errors from fetch (no try/catch)', async () => {
    mockFetch.mockRejectedValue(new Error('Sanity 503'));

    await expect(getHomepage()).rejects.toThrow('Sanity 503');
  });
});

// ---------------------------------------------------------------------------
// getPage(slug)
// ---------------------------------------------------------------------------

describe('getPage(slug)', () => {
  it('calls fetch with params containing the slug', async () => {
    const doc = { title: 'About', metaDescription: '', body: [], uid: 'about' };
    mockFetch.mockResolvedValue(doc);

    await getPage('about');

    expect(mockFetch).toHaveBeenCalledOnce();
    const params = mockFetch.mock.calls[0][1];
    expect(params).toMatchObject({ slug: 'about' });
  });

  it('returns the document returned by fetch', async () => {
    const doc = { title: 'Contact', metaDescription: 'Contact us', body: [], uid: 'contact' };
    mockFetch.mockResolvedValue(doc);

    const result = await getPage('contact');

    expect(result).toBe(doc);
  });

  it('propagates a 404-style error for unknown slugs (no try/catch)', async () => {
    mockFetch.mockRejectedValue(new Error('404 Not Found'));

    await expect(getPage('nonexistent')).rejects.toThrow('404 Not Found');
  });
});

// ---------------------------------------------------------------------------
// getPages()
// ---------------------------------------------------------------------------

describe('getPages()', () => {
  it('calls fetch with a query targeting the page type', async () => {
    mockFetch.mockResolvedValue([]);

    await getPages();

    expect(mockFetch).toHaveBeenCalledOnce();
    const query: string = mockFetch.mock.calls[0][0];
    expect(query).toContain('"page"');
  });

  it('returns all documents returned by fetch', async () => {
    const docs = [{ uid: 'about' }, { uid: 'contact' }];
    mockFetch.mockResolvedValue(docs);

    const result = await getPages();

    expect(result).toHaveLength(2);
    expect(result).toBe(docs);
  });

  it('returns an empty array when no pages exist', async () => {
    mockFetch.mockResolvedValue([]);

    const result = await getPages();

    expect(result).toEqual([]);
  });

  it('propagates errors from fetch (no try/catch)', async () => {
    mockFetch.mockRejectedValue(new Error('Sanity network error'));

    await expect(getPages()).rejects.toThrow('Sanity network error');
  });
});
