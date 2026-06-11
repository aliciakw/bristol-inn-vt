import { useState, useEffect } from 'react';
import { getBookingUrl, getCheckoutUrl } from '@lib/hostaway-urls';
import { ButtonLink } from '@components/ui/ButtonLink';
import { TextStyle } from '@components/ui/TextStyle';

interface Props {
  roomId: number;
  name: string;
  bedroomsLabel: string;
  personCapacity: number;
  floorNumber?: number;
  basePrice: number;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function RoomDetailHeader({ roomId, name, bedroomsLabel, personCapacity, floorNumber, basePrice }: Props) {
  const [booking, setBooking] = useState<{
    start: string;
    end: string;
    numberOfGuests: number;
    pricePerNight: number;
  } | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const start = sp.get('start');
    const end = sp.get('end');
    const guests = parseInt(sp.get('numberOfGuests') ?? '', 10);
    if (start && end && guests > 0) {
      const rawPrice = parseFloat(sp.get('pricePerNight') ?? '');
      setBooking({ start, end, numberOfGuests: guests, pricePerNight: isFinite(rawPrice) ? rawPrice : basePrice });
    }
  }, [basePrice]);

  const bookingUrl = booking ? getCheckoutUrl(roomId, { checkIn: booking.start, checkOut: booking.end, guests: booking.numberOfGuests }) : getBookingUrl(roomId);

  const personCapacityLabel = `Up to ${personCapacity} ${personCapacity === 1 ? 'guest' : 'guests'}`;
  const bookingDateLabel = booking ? `${formatDate(booking.start)} – ${formatDate(booking.end)}` : null;
  const bookingPriceLabel = booking ? `$${Math.round(booking?.pricePerNight)} / night` : null;
  const numberOfGuestsLabel = `${booking?.numberOfGuests} ${booking?.numberOfGuests === 1 ? 'guest' : 'guests'}`;
  const floorNumberLabel = floorNumber !== undefined ? `Floor ${floorNumber}` : null;
  const meta = [bedroomsLabel, floorNumberLabel, personCapacityLabel].filter(Boolean).join(' · ');

  return (
    <div className="flex flex-col mb-6 bg-white p-4 rounded-sm">
      <TextStyle variant="h2" element="h1" className="line-height-tight">
        {name}
      </TextStyle>
      <TextStyle variant="label" element="p" className="text-iron mt-1">
        {meta}
      </TextStyle>

      <div className="flex flex-col gap-1 mt-3">
        {booking ? (
          <div className="flex flex-row gap-2">
            <TextStyle variant="h5" element="p" className="font-medium">
              {bookingPriceLabel}
            </TextStyle>
            <TextStyle variant="paragraph" element="span" className="ml-2 text-iron">
              {bookingDateLabel} · {numberOfGuestsLabel}
            </TextStyle>
          </div>
        ) : (
          <TextStyle variant="h4" element="p">
            From ${Math.round(basePrice)} / night
          </TextStyle>
        )}
      </div>
      <div className="flex flex-col justify-between mt-6">
        <ButtonLink href={bookingUrl} bg="prussian-700" textColor="white" target="_blank" className="hover:bg-prussian-500" rel="noopener noreferrer">
          {booking ? 'Book Now!' : 'Reserve This Room'}
        </ButtonLink>
      </div>
    </div>
  );
}
