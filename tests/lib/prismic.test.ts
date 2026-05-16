/**
 * Unit tests for src/lib/prismic.ts
 *
 * These tests mock @prismicio/client so no real HTTP calls are made.
 * The astro:env/server alias in vitest.config.ts resolves PRISMIC_TOKEN
 * to 'test-prismic-token' from tests/__mocks__/astro-env-server.ts.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock @prismicio/client before importing the module under test
// ---------------------------------------------------------------------------

const mockGetSingle = vi.fn();
const mockGetByUID = vi.fn();
const mockGetAllByType = vi.fn();
const mockCreateClient = vi.fn();

vi.mock('@prismicio/client', () => ({
  createClient: mockCreateClient,
}));

// Import after mocking so the module picks up the mock
const { getHomepage, getPage, getPages, getClient } = await import('../../src/lib/prismic');

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

/** Minimal stand-in for a prismic.PrismicDocument */
function makeDocument(overrides: Partial<{ type: string; uid: string; id: string }> = {}) {
  return {
    id: overrides.id ?? 'doc-id-1',
    uid: overrides.uid ?? null,
    type: overrides.type ?? 'page',
    data: {},
    lang: 'en-us',
    alternate_languages: [],
    href: 'https://bristol-inn-vt.cdn.prismic.io/api/v2/documents/search',
    tags: [],
    slugs: [],
    linked_documents: [],
    first_publication_date: '2024-01-01T00:00:00+0000',
    last_publication_date: '2024-01-01T00:00:00+0000',
  };
}

// ---------------------------------------------------------------------------
// Setup: configure the mock client returned by createClient
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();

  mockCreateClient.mockReturnValue({
    getSingle: mockGetSingle,
    getByUID: mockGetByUID,
    getAllByType: mockGetAllByType,
  });
});

// ---------------------------------------------------------------------------
// getClient()
// ---------------------------------------------------------------------------

describe('getClient()', () => {
  it('calls createClient with repo name "bristol-inn-vt"', () => {
    getClient();
    expect(mockCreateClient).toHaveBeenCalledWith(
      'bristol-inn-vt',
      expect.objectContaining({ accessToken: 'test-prismic-token' }),
    );
  });

  it('passes PRISMIC_TOKEN as accessToken', () => {
    getClient();
    const [, options] = mockCreateClient.mock.calls[0]!;
    expect(options).toMatchObject({ accessToken: 'test-prismic-token' });
  });

  it('does NOT include the token in any logged console output', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    getClient();
    for (const call of consoleSpy.mock.calls) {
      expect(call.join(' ')).not.toContain('test-prismic-token');
    }
  });
});

// ---------------------------------------------------------------------------
// getHomepage()
// ---------------------------------------------------------------------------

describe('getHomepage()', () => {
  it('calls getSingle with "homepage"', async () => {
    const doc = makeDocument({ type: 'homepage', uid: null });
    mockGetSingle.mockResolvedValue(doc);

    await getHomepage();

    expect(mockGetSingle).toHaveBeenCalledWith('homepage');
  });

  it('returns the document returned by getSingle', async () => {
    const doc = makeDocument({ type: 'homepage', uid: null, id: 'homepage-id' });
    mockGetSingle.mockResolvedValue(doc);

    const result = await getHomepage();

    expect(result).toBe(doc);
  });

  it('propagates errors from getSingle (no try/catch)', async () => {
    mockGetSingle.mockRejectedValue(new Error('Prismic 503'));

    await expect(getHomepage()).rejects.toThrow('Prismic 503');
  });
});

// ---------------------------------------------------------------------------
// getPage(slug)
// ---------------------------------------------------------------------------

describe('getPage(slug)', () => {
  it('calls getByUID with type "page" and the given slug', async () => {
    const doc = makeDocument({ type: 'page', uid: 'about' });
    mockGetByUID.mockResolvedValue(doc);

    await getPage('about');

    expect(mockGetByUID).toHaveBeenCalledWith('page', 'about');
  });

  it('returns the document returned by getByUID', async () => {
    const doc = makeDocument({ type: 'page', uid: 'contact' });
    mockGetByUID.mockResolvedValue(doc);

    const result = await getPage('contact');

    expect(result).toBe(doc);
  });

  it('propagates a 404 error for unknown slugs (no try/catch)', async () => {
    mockGetByUID.mockRejectedValue(new Error('404 Not Found'));

    await expect(getPage('nonexistent')).rejects.toThrow('404 Not Found');
  });
});

// ---------------------------------------------------------------------------
// getPages()
// ---------------------------------------------------------------------------

describe('getPages()', () => {
  it('calls getAllByType with "page"', async () => {
    mockGetAllByType.mockResolvedValue([]);

    await getPages();

    expect(mockGetAllByType).toHaveBeenCalledWith('page');
  });

  it('returns all documents returned by getAllByType', async () => {
    const docs = [
      makeDocument({ type: 'page', uid: 'about' }),
      makeDocument({ type: 'page', uid: 'contact' }),
    ];
    mockGetAllByType.mockResolvedValue(docs);

    const result = await getPages();

    expect(result).toHaveLength(2);
    expect(result).toBe(docs);
  });

  it('returns an empty array when no pages exist', async () => {
    mockGetAllByType.mockResolvedValue([]);

    const result = await getPages();

    expect(result).toEqual([]);
  });

  it('propagates errors from getAllByType (no try/catch)', async () => {
    mockGetAllByType.mockRejectedValue(new Error('Prismic network error'));

    await expect(getPages()).rejects.toThrow('Prismic network error');
  });
});
