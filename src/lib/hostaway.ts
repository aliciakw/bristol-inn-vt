/**
 * Hostaway API wrapper — server-only (build time).
 *
 * Exposes only the domain types and functions that downstream pages need.
 * Raw API shapes are internal to this file and never exported.
 *
 * Security: HOSTAWAY_ACCESS_TOKEN is never logged. Only the first image URL
 * is logged (once) to help determine the Hostaway CDN hostname for
 * image.remotePatterns in astro.config.mjs.
 */

import { HOSTAWAY_ACCESS_TOKEN } from 'astro:env/server';
import { AMENITY_NAMES } from './hostaway-amenities';

// ---------------------------------------------------------------------------
// Internal raw API types (not exported)
// ---------------------------------------------------------------------------

interface RawListingImage {
  id: number;
  caption: string;
  vrboCaption: string;
  airbnbCaption: string;
  url: string;
  sortOrder: number;
}

interface RawListingAmenity {
  id: number;
  amenityId: number;
}

interface RawListing {
  id: number;
  name: string;
  description: string;
  price: number;
  bedroomsNumber: number;
  bathroomsNumber: number;
  personCapacity: number;
  listingImages: RawListingImage[];
  listingAmenities: RawListingAmenity[];
}

// ---------------------------------------------------------------------------
// Internal calendar types (not exported)
// ---------------------------------------------------------------------------

interface RawCalendarDay {
  date: string; // "YYYY-MM-DD"
  isAvailable: 0 | 1;
  price: number;
  minimumStay: number;
}

// ---------------------------------------------------------------------------
// Public domain types
// ---------------------------------------------------------------------------

export interface RoomAvailability {
  listingId: number;
  available: boolean;
  /** Price per night for the stay; undefined when unavailable */
  pricePerNight?: number;
}

export interface HostawayRoom {
  id: number;
  name: string;
  /** Human-readable bedroom count, e.g. "2 Bedrooms" or "1 Bedroom" */
  bedroomsLabel: string;
  description: string;
  /** Base nightly rate (from raw "price" field) */
  price: number;
  photos: Array<{ url: string; caption: string; sortOrder: number }>;
  /** Resolved from amenityId via AMENITY_NAMES; unknown IDs are filtered out */
  amenityNames: string[];
  bedroomsNumber: number;
  bathroomsNumber: number;
  personCapacity: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = 'https://api.hostaway.com/v1';

/** Log the first image URL exactly once so the developer can determine the
 *  Hostaway CDN domain and add it to image.remotePatterns in astro.config.mjs.
 *  Logged only on the first normalizeRoom() call. */
let _firstImageLogged = false;

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

function normalizeRoom(raw: RawListing): HostawayRoom {
  const photos = raw.listingImages
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 6)
    .map((img) => ({
      url: img.url,
      caption: img.caption || img.vrboCaption || '',
      sortOrder: img.sortOrder,
    }));

  if (!_firstImageLogged) {
    _firstImageLogged = true;
    console.log('[hostaway] First image URL (add domain to image.remotePatterns):', photos[0]?.url);
  }

  const amenityNames = raw.listingAmenities.map((a) => AMENITY_NAMES[a.amenityId]).filter((name): name is string => name !== undefined);

  const n = raw.bedroomsNumber;
  return {
    id: raw.id,
    name: raw.name.replace(/\s*\(\d+ Bedrooms?\)\s*$/i, '').trim(),
    bedroomsLabel: n === 1 ? '1 Bedroom' : `${n} Bedrooms`,
    description: raw.description,
    price: raw.price,
    photos,
    amenityNames,
    bedroomsNumber: raw.bedroomsNumber,
    bathroomsNumber: raw.bathroomsNumber,
    personCapacity: raw.personCapacity,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch all Hostaway listings and return them as typed domain objects.
 * Throws if the API returns a non-ok response (build fails per D-06).
 */
export async function getRooms(): Promise<HostawayRoom[]> {
  const res = await fetch(`${BASE_URL}/listings`, {
    headers: { Authorization: `Bearer ${HOSTAWAY_ACCESS_TOKEN}` },
  });
  if (!res.ok) {
    throw new Error(`Hostaway listings failed: ${res.status}`);
  }
  const data = (await res.json()) as { result: RawListing[] };
  return data.result.map(normalizeRoom);
}

/**
 * Fetch a single Hostaway listing by ID.
 * Returns null if the listing is not found (404).
 * Throws for any other non-ok response (build fails per D-06).
 */
export async function getRoom(id: number): Promise<HostawayRoom | null> {
  const res = await fetch(`${BASE_URL}/listings/${id}`, {
    headers: { Authorization: `Bearer ${HOSTAWAY_ACCESS_TOKEN}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Hostaway listing ${id} failed: ${res.status}`);
  }
  const data = (await res.json()) as { result: RawListing };
  return normalizeRoom(data.result);
}

/**
 * Check real-time availability for a set of listings over a date range.
 * checkIn/checkOut are ISO date strings "YYYY-MM-DD"; checkOut is the departure day
 * (not counted as an occupied night). Fetches each listing's calendar in parallel.
 *
 * NOTE: RawCalendarDay shape is based on Hostaway v1 docs — validate against
 * the live API response on first run and adjust field names if needed.
 */
export async function checkAvailability(listingIds: number[], checkIn: string, checkOut: string): Promise<RoomAvailability[]> {
  const settled = await Promise.allSettled(
    listingIds.map(async (id): Promise<RoomAvailability> => {
      const url = `${BASE_URL}/listings/${id}/calendar?startDate=${checkIn}&endDate=${checkOut}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${HOSTAWAY_ACCESS_TOKEN}` },
      });
      if (!res.ok) {
        throw new Error(`Hostaway calendar for listing ${id} failed: ${res.status}`);
      }
      const data = (await res.json()) as { result: RawCalendarDay[] };
      const nights = data.result.filter((day) => day.date >= checkIn && day.date < checkOut);
      const numNights = nights.length;
      const available = numNights > 0 && nights.every((day) => day.isAvailable === 1) && nights.every((day) => numNights >= day.minimumStay);
      return {
        listingId: id,
        available,
        pricePerNight: available ? nights[0]?.price : undefined,
      };
    }),
  );
  return listingIds.map((id, i) => {
    // eslint-disable-next-line security/detect-object-injection
    const result = settled[i];
    return result?.status === 'fulfilled' ? result.value : { listingId: id, available: false };
  });
}
