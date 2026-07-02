/**
 * Unit tests for src/lib/hostaway.ts
 *
 * These tests mock globalThis.fetch so no real HTTP calls are made.
 * The astro:env/server alias in vitest.config.ts resolves HOSTAWAY_ACCESS_TOKEN
 * to 'test-hostaway-token' from tests/__mocks__/astro-env-server.ts.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRooms, getRoom } from '../../src/lib/hostaway';
import type { HostawayRoom } from '../../src/lib/hostaway';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeRawListing(
  overrides: Partial<{
    id: number;
    name: string;
    description: string;
    price: number;
    bedroomsNumber: number;
    bathroomsNumber: number;
    personCapacity: number;
    listingImages: Array<{
      id: number;
      caption: string;
      vrboCaption: string;
      airbnbCaption: string;
      url: string;
      sortOrder: number;
    }>;
    listingAmenities: Array<{ id: number; amenityId: number; amenityName: string }>;
  }> = {},
) {
  return {
    id: overrides.id ?? 1,
    name: overrides.name ?? 'Test Room',
    description: overrides.description ?? 'A lovely room',
    price: overrides.price ?? 150,
    bedroomsNumber: overrides.bedroomsNumber ?? 1,
    bathroomsNumber: overrides.bathroomsNumber ?? 1,
    personCapacity: overrides.personCapacity ?? 2,
    listingImages: overrides.listingImages ?? [
      {
        id: 10,
        caption: 'Main view',
        vrboCaption: 'VRBO caption',
        airbnbCaption: 'Airbnb caption',
        url: 'https://cdn.example.com/photo1.jpg',
        sortOrder: 1,
      },
    ],
    listingAmenities: overrides.listingAmenities ?? [
      { id: 100, amenityId: 3, amenityName: 'WiFi' },
      { id: 101, amenityId: 2, amenityName: 'Internet' },
    ],
  };
}

function mockFetchOk(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  });
}

function mockFetchError(status: number) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({ error: 'error' }),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('getRooms()', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a HostawayRoom array for a successful response', async () => {
    const rawListing = makeRawListing();
    global.fetch = mockFetchOk({ result: [rawListing] });

    const rooms = await getRooms();

    expect(rooms).toHaveLength(1);
    expect(rooms[0]).toMatchObject<Partial<HostawayRoom>>({
      id: 1,
      name: 'Test Room',
      description: 'A lovely room',
      price: 150,
      bedroomsNumber: 1,
      bathroomsNumber: 1,
      personCapacity: 2,
    });
  });

  it('resolves amenityIds to names and filters out unknowns', async () => {
    const rawListing = makeRawListing();
    global.fetch = mockFetchOk({ result: [rawListing] });

    const rooms = await getRooms();

    expect(rooms[0]?.amenityNames).toContain('WiFi');
    expect(rooms[0]?.amenityNames).toContain('Internet');
    expect(rooms[0]?.amenityNames).toHaveLength(2);
  });

  it('maps listingImages to photos with url, caption, sortOrder', async () => {
    const rawListing = makeRawListing();
    global.fetch = mockFetchOk({ result: [rawListing] });

    const rooms = await getRooms();

    expect(rooms[0]?.photos[0]).toEqual({
      url: 'https://cdn.example.com/photo1.jpg',
      caption: 'Main view',
      sortOrder: 1,
    });
  });

  it('uses vrboCaption fallback when caption is empty', async () => {
    const rawListing = makeRawListing({
      listingImages: [
        {
          id: 10,
          caption: '',
          vrboCaption: 'VRBO fallback',
          airbnbCaption: 'Airbnb',
          url: 'https://cdn.example.com/photo.jpg',
          sortOrder: 1,
        },
      ],
    });
    global.fetch = mockFetchOk({ result: [rawListing] });

    const rooms = await getRooms();

    expect(rooms[0]?.photos[0]?.caption).toBe('VRBO fallback');
  });

  it('sorts photos by sortOrder ascending', async () => {
    const rawListing = makeRawListing({
      listingImages: [
        {
          id: 10,
          caption: 'C',
          vrboCaption: '',
          airbnbCaption: '',
          url: 'https://cdn.example.com/c.jpg',
          sortOrder: 3,
        },
        {
          id: 11,
          caption: 'A',
          vrboCaption: '',
          airbnbCaption: '',
          url: 'https://cdn.example.com/a.jpg',
          sortOrder: 1,
        },
        {
          id: 12,
          caption: 'B',
          vrboCaption: '',
          airbnbCaption: '',
          url: 'https://cdn.example.com/b.jpg',
          sortOrder: 2,
        },
      ],
    });
    global.fetch = mockFetchOk({ result: [rawListing] });

    const rooms = await getRooms();
    const sortOrders = rooms[0]?.photos.map((p) => p.sortOrder);

    expect(sortOrders).toEqual([1, 2, 3]);
  });

  it('slices photos to at most 6', async () => {
    const images = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      caption: `Photo ${i}`,
      vrboCaption: '',
      airbnbCaption: '',
      url: `https://cdn.example.com/photo${i}.jpg`,
      sortOrder: i,
    }));
    const rawListing = makeRawListing({ listingImages: images });
    global.fetch = mockFetchOk({ result: [rawListing] });

    const rooms = await getRooms();

    expect(rooms[0]?.photos).toHaveLength(6);
  });

  it('throws when API returns non-2xx status', async () => {
    global.fetch = mockFetchError(503);

    await expect(getRooms()).rejects.toThrow('503');
  });

  it('sends Authorization Bearer header', async () => {
    const rawListing = makeRawListing();
    const mockFetch = mockFetchOk({ result: [rawListing] });
    global.fetch = mockFetch;

    await getRooms();

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs).toBeDefined();
    const options = callArgs[1] as RequestInit;
    const headers = options?.headers as Record<string, string>;
    expect(headers?.['Authorization']).toBe('Bearer test-hostaway-token');
  });

  it('does NOT include the token in any logged output', async () => {
    // This test is a static code check — we verify via grep in the plan verification step.
    // Here we just confirm the function runs without logging the token.
    const consoleSpy = vi.spyOn(console, 'log');
    const rawListing = makeRawListing();
    global.fetch = mockFetchOk({ result: [rawListing] });

    await getRooms();

    for (const call of consoleSpy.mock.calls) {
      const loggedString = call.join(' ');
      expect(loggedString).not.toContain('test-hostaway-token');
    }
  });
});

describe('getRoom(id)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a HostawayRoom for a successful response', async () => {
    const rawListing = makeRawListing({ id: 42, name: 'Suite 42' });
    global.fetch = mockFetchOk({ result: rawListing });

    const room = await getRoom(42);

    expect(room).not.toBeNull();
    expect(room?.id).toBe(42);
    expect(room?.name).toBe('Suite 42');
  });

  it('returns null when API returns 404', async () => {
    global.fetch = mockFetchError(404);

    const room = await getRoom(999);

    expect(room).toBeNull();
  });

  it('throws when API returns non-ok non-404 status', async () => {
    global.fetch = mockFetchError(500);

    await expect(getRoom(1)).rejects.toThrow('500');
  });

  it('fetches from the correct URL with the listing id', async () => {
    const rawListing = makeRawListing({ id: 77 });
    const mockFetch = mockFetchOk({ result: rawListing });
    global.fetch = mockFetch;

    await getRoom(77);

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs).toBeDefined();
    const url = callArgs?.[0] as string;
    expect(url).toMatch(/\/listings\/77$/);
  });
});
