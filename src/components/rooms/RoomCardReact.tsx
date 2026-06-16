import { PawPrint } from 'lucide-react';
import { TextStyle } from '@components/ui/TextStyle';
import type { SearchParams } from './AvailabilitySearchForm';

interface Availability {
  available: boolean;
  pricePerNight?: number;
}

export type RoomBrowserRoom = {
  id: number;
  name: string;
  price: number;
  personCapacity: number;
  bedroomsLabel?: string;
  numberOfBathrooms?: number;
  floorNumber?: number;
  dogsAllowed?: boolean;
  photo: { url: string; caption: string };
  amenities: string[];
};

interface Props {
  room: RoomBrowserRoom;
  availability?: Availability;
  isLoading: boolean;
  bookingUrl: string;
  detailUrl: string;
  lastSearch?: SearchParams | null;
}

export function RoomCardReact({ room, availability, isLoading, bookingUrl, detailUrl, lastSearch }: Props) {
  const { name, bedroomsLabel, dogsAllowed, price, photo, floorNumber, personCapacity } = room;
  const baseRate = Math.round(price);
  const isUnavailable = availability !== undefined && !availability.available;
  const dimmed = isLoading || isUnavailable;

  const estimatedPriceLabel = `From $${baseRate} / night`;
  const actualPrice = availability?.available && availability.pricePerNight !== undefined ? Math.round(availability?.pricePerNight ?? baseRate) : null;

  const floorNumberLabel = floorNumber !== undefined ? `${floorNumber === 1 ? '1st' : floorNumber === 2 ? '2nd' : floorNumber === 3 ? '3rd' : floorNumber} Floor` : '';
  const personCapacityLabel = `Up to ${personCapacity} ${personCapacity === 1 ? 'guest' : 'guests'}`;
  const infoText = [bedroomsLabel, personCapacityLabel, floorNumberLabel, estimatedPriceLabel].filter(Boolean).join(' · ');

  return (
    <a href={lastSearch ? detailUrl : bookingUrl} className="pointer">
      <article className={['bg-white rounded-lg shadow-lg', dimmed ? 'opacity-50' : '', 'transition-opacity duration-150'].join(' ')}>
        <div className="rounded-sm">
          <div className="flex flex-col justify-between bg-sand-100 p-1 border-1 border-ink-900 rounded-t-lg px-2 relative">
            <TextStyle variant="h4" element="h5" className="overflow-hidden text-ellipsis font-medium line-clamp-1 mt-1">
              {name}
            </TextStyle>
            <div className="flex flex-row">
              <TextStyle variant="caption" element="p" className="max-w-[calc(100%)] text-nowrap overflow-hidden text-ellipsis text-iron">
                {infoText}
              </TextStyle>
              {/* <div className="absolute top-2 right-2">
                {!isUnavailable && !!lastSearch ? (
                  <ButtonLink href={bookingUrl} bg="prussian-500" textColor="white" size="x-small" className="hover:bg-prussian-700 border-0" target="_blank" rel="noopener noreferrer" aria-disabled={isUnavailable || undefined} tabIndex={isUnavailable ? -1 : undefined}>
                    Book Now!
                  </ButtonLink>
                ) : (
                  <ButtonLink href={detailUrl} textColor="ink-900" size="x-small" className="bg-white/80 border-0" target="_blank" rel="noopener noreferrer" aria-disabled={isUnavailable || undefined} tabIndex={isUnavailable ? -1 : undefined}>
                    More Info
                  </ButtonLink>
                )}
              </div> */}
            </div>
          </div>

          <div className="relative bg-ink-900/20 rounded-b-xl overflow-hidden">
            <img src={photo.url} alt={photo.caption || name} width={600} height={400} loading="lazy" className="w-full object-cover aspect-[3/2] transition-opacity duration-300" />
            <div className="absolute bottom-2 right-2 left-2 flex gap-1 justify-between items-end">
              {actualPrice && (
                <TextStyle variant="h4" element="span" className="bg-white border-3 border-white text-black max-w-[calc(50%)] whitespace-nowrap overflow-hidden text-ellipsis px-2 py-[2px] rounded-full tracking-tight px-4 shadow-sm">
                  ${actualPrice}*<span className="text-xs ml-[-8px]">/ night</span>
                </TextStyle>
              )}
              {dogsAllowed && (
                <TextStyle variant="caption" element="span" className="bg-sand-200/80 backdrop-blur-sm text-ink-900  max-w-[calc(33%)] whitespace-nowrap overflow-hidden text-ellipsis px-2 py-1 rounded-sm">
                  <span className="inline-flex flex-row items-center gap-1 whitespace-nowrap">
                    Dogs allowed <PawPrint size={12} className="text-ink-900" aria-label="Dogs allowed" />
                  </span>
                </TextStyle>
              )}
            </div>
          </div>
        </div>
      </article>
    </a>
  );
}
