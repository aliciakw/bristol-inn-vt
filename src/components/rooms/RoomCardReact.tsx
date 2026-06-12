import { PawPrint } from 'lucide-react';
import { ButtonLink } from '@components/ui/ButtonLink';
import { TextStyle } from '@components/ui/TextStyle';
import type { SearchParams } from './AvailabilitySearchForm';

interface Availability {
  available: boolean;
  pricePerNight?: number;
}

interface Props {
  id: number;
  name: string;
  bedroomsLabel: string;
  personCapacity: number;
  floorNumber?: number;
  numberOfBeds?: number;
  numberOfBathrooms?: number;
  dogsAllowed?: boolean;
  price: number;
  photo: { url: string; caption: string };
  amenities: string[];
  availability?: Availability;
  isLoading: boolean;
  bookingUrl: string;
  detailUrl: string;
  lastSearch?: SearchParams | null;
}

export function RoomCardReact({ name, bedroomsLabel, personCapacity, floorNumber, dogsAllowed, price, photo, availability, isLoading, bookingUrl, detailUrl, lastSearch }: Props) {
  const baseRate = Math.round(price);
  const isUnavailable = availability !== undefined && !availability.available;
  const dimmed = isLoading || isUnavailable;

  let priceDisplay: string;
  if (!isLoading && availability?.available && availability.pricePerNight !== undefined) {
    priceDisplay = `$${Math.round(availability.pricePerNight)} / night`;
  } else {
    priceDisplay = `From $${baseRate} / night`;
  }

  const floorNumberLabel = floorNumber !== undefined ? `${floorNumber === 1 ? '1st' : floorNumber === 2 ? '2nd' : floorNumber === 3 ? '3rd' : floorNumber} Floor` : '';

  return (
    <a href={detailUrl}>
      <article className={['bg-white rounded-lg shadow-sm ', dimmed ? 'opacity-50' : 'hover:shadow-md pointer', 'transition-opacity duration-150'].join(' ')}>
        <div className="rounded-sm">
          <div className="flex flex-col justify-between bg-sand-100 p-1 border-1 border-ink-900 rounded-t-lg px-2 relative">
            <TextStyle variant="h4" element="h5" className="overflow-hidden text-ellipsis font-medium max-w-[calc(100%-140px)] line-clamp-1 mt-1">
              {name}
            </TextStyle>
            <div className="flex flex-row">
              <TextStyle variant="caption" element="p" className="max-w-[calc(100%)] text-nowrap overflow-hidden text-ellipsis text-iron">
                {bedroomsLabel} {' · '}
                {floorNumberLabel} {' · '}
                Up to {personCapacity} {personCapacity === 1 ? 'guest' : 'guests'}
                {floorNumberLabel ? ' · ' : ''}
                {priceDisplay}
              </TextStyle>
              <div className="absolute top-2 right-2">
                {!isUnavailable && !!lastSearch ? (
                  <ButtonLink href={bookingUrl} bg="prussian-500" textColor="white" size="x-small" className="hover:bg-prussian-700 border-0" target="_blank" rel="noopener noreferrer" aria-disabled={isUnavailable || undefined} tabIndex={isUnavailable ? -1 : undefined}>
                    Book Now!
                  </ButtonLink>
                ) : (
                  <ButtonLink href={detailUrl} textColor="ink-900" size="x-small" className="bg-white/80 border-0" target="_blank" rel="noopener noreferrer" aria-disabled={isUnavailable || undefined} tabIndex={isUnavailable ? -1 : undefined}>
                    More Info
                  </ButtonLink>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <img src={photo.url} alt={photo.caption || name} width={600} height={400} loading="lazy" className="w-full object-cover aspect-[3/2] rounded-b-lg" />
            <div className="absolute bottom-2 right-2 left-2 flex justify-end gap-1">
              {dogsAllowed && (
                <TextStyle variant="caption" element="span" className="bg-sand-200/80 backdrop-blur-sm text-ink-900  max-w-[calc(33%)] whitespace-nowrap overflow-hidden text-ellipsis px-2 py-1 rounded-sm">
                  <span className="inline-flex flex-row items-center gap-1 whitespace-nowrap">
                    Dogs allowed <PawPrint size={12} className="text-ink-900" aria-label="Dogs allowed" />
                  </span>
                </TextStyle>
              )}
              <TextStyle variant="caption" element="span" className="bg-white/80 backdrop-blur-sm text-ink-900  max-w-[calc(33%)] whitespace-nowrap overflow-hidden text-ellipsis px-2 py-1 rounded-sm">
                {priceDisplay}
              </TextStyle>
            </div>
          </div>
        </div>
      </article>
    </a>
  );
}
