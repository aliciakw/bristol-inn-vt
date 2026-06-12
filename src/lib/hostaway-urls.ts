export function getBookingUrl(hostawayId: number): string {
  return `https://bristolsuites.holidayfuture.com/listings/${hostawayId}`;
}

export function getCheckoutUrl(hostawayId: number, params: { checkIn: string; checkOut: string; guests: number }): string {
  const qs = new URLSearchParams({
    start: params.checkIn,
    end: params.checkOut,
    numberOfGuests: String(params.guests),
  });
  return `https://bristolsuites.holidayfuture.com/checkout/${hostawayId}?${qs.toString()}`;
}

export function getDetailUrl(hostawayId: number, params?: { checkIn: string; checkOut: string; guests: number; pricePerNight?: number; pets?: boolean }): string {
  const base = `/rooms/${hostawayId}`;
  if (!params) return base;
  const qs = new URLSearchParams({
    start: params.checkIn,
    end: params.checkOut,
    numberOfGuests: String(params.guests),
  });
  if (params.pricePerNight !== undefined) qs.set('pricePerNight', String(params.pricePerNight));
  if (params.pets) qs.set('pets', '1');
  return `${base}?${qs.toString()}`;
}
