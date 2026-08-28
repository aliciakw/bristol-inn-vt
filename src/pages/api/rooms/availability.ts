import type { APIContext } from 'astro';
import { checkAvailability } from '../../../lib/hostaway';
import { getRooms } from '../../../lib/rooms';

export const prerender = false;

function isValidDate(str: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str);
  return !isNaN(d.getTime()) && d.toISOString().startsWith(str);
}

function localDateISO(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays) d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function GET({ url }: APIContext): Promise<Response> {
  const checkIn = url.searchParams.get('checkIn') ?? '';
  const checkOut = url.searchParams.get('checkOut') ?? '';
  const guestsRaw = url.searchParams.get('guests') ?? '';
  const guests = parseInt(guestsRaw, 10);

  if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
    return Response.json({ error: 'checkIn and checkOut must be valid YYYY-MM-DD dates' }, { status: 400 });
  }
  if (checkIn < localDateISO(-1)) {
    return Response.json({ error: 'checkIn must be today or in the future' }, { status: 400 });
  }
  if (checkOut <= checkIn) {
    return Response.json({ error: 'checkOut must be after checkIn' }, { status: 400 });
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
    return Response.json({ error: 'guests must be an integer between 1 and 20' }, { status: 400 });
  }

  try {
    const rooms = await getRooms();
    const listingIds = rooms.map((room) => room.id);
    return Response.json(await checkAvailability(listingIds, checkIn, checkOut));
  } catch {
    return Response.json({ error: 'Unable to check availability. Please try again.' }, { status: 500 });
  }
}
