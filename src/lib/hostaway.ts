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
// Public domain type
// ---------------------------------------------------------------------------

export interface HostawayRoom {
  id: number;
  name: string;
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
    .map(img => ({
      url: img.url,
      caption: img.caption || img.vrboCaption || '',
      sortOrder: img.sortOrder,
    }));

  if (!_firstImageLogged) {
    _firstImageLogged = true;
    // eslint-disable-next-line no-console
    console.log('[hostaway] First image URL (add domain to image.remotePatterns):', photos[0]?.url);
  }

  const amenityNames = raw.listingAmenities
    .map(a => AMENITY_NAMES[a.amenityId])
    .filter((name): name is string => name !== undefined);

  return {
    id: raw.id,
    name: raw.name,
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
  const data = await res.json() as { result: RawListing[] };
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
  const data = await res.json() as { result: RawListing };
  return normalizeRoom(data.result);
}
