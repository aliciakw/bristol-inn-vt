import { getBookingUrl } from '@lib/hostaway-urls';
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

export function RoomDetailHeader({ roomId, name, bedroomsLabel, personCapacity, floorNumber, basePrice }: Props) {
  const personCapacityLabel = `Up to ${personCapacity} ${personCapacity === 1 ? 'guest' : 'guests'}`;
  const estimatedPriceLabel = `From $${Math.round(basePrice)} / night`;
  const floorNumberLabel = floorNumber !== undefined ? `${floorNumber === 1 ? '1st' : floorNumber === 2 ? '2nd' : floorNumber === 3 ? '3rd' : floorNumber} Floor` : '';
  const meta = [bedroomsLabel, floorNumberLabel, personCapacityLabel, estimatedPriceLabel].filter(Boolean).join(' · ');

  return (
    <div className="flex flex-col" data-room-detail-header data-room-id={roomId} data-base-price={basePrice}>
      <TextStyle variant="h2" element="h1" className="line-height-tight">
        {name}
      </TextStyle>
      <TextStyle variant="label" element="p" className="text-iron mt-1">
        {meta}
      </TextStyle>
      <p className="font-serif text-h5 tablet:text-h5-tablet desktop:text-h5-desktop font-medium mt-2 hidden" data-booking-details>
        <span data-booking-price />
        <span data-booking-date />
        <span data-booking-guests />
      </p>
      <div className="flex flex-col justify-between mt-6 desktop:max-w-[50%]">
        <span data-default-booking-link>
          <ButtonLink href={getBookingUrl(roomId)} bg="sand-200" target="_blank" rel="noopener noreferrer">
            Make a Reservation
          </ButtonLink>
        </span>
        <span className="hidden" data-search-booking-link>
          <ButtonLink href={getBookingUrl(roomId)} bg="prussian-700" textColor="white" target="_blank" className="hover:bg-prussian-500" rel="noopener noreferrer">
            Book Now!
          </ButtonLink>
        </span>
      </div>
    </div>
  );
}
