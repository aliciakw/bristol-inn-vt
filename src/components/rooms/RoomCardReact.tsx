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

export function RoomCardReact({ room, availability, isLoading, detailUrl }: Props) {
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
    <a href={detailUrl} className="pointer group fade-in-500">
      <article className={['rounded-xl border-1 border-ink-900 overflow-hidden shadow--card', dimmed ? 'opacity-50' : '', 'transition-opacity duration-150'].join(' ')}>
        <div className="rounded-sm">
          <div className="flex flex-col justify-center bg-sand-100 group-hover:bg-sand-050/50 border-b-1 border-ink-900 px-3 pt-2 pb-2 gap-1 rounded-t-lg relative group-hover:shadow-lg group-hover:text-prussian-500 transition-colors duration-700 ease-out">
            <TextStyle variant="h4" element="h5" className="text-ink-900 overflow-hidden text-ellipsis font-medium leading-none line-clamp-1 mt-1 transition-colors duration-700 ease-out">
              {name}
            </TextStyle>
            <div className="flex flex-row">
              <TextStyle variant="paragraph" element="p" className="max-w-[calc(100%)] text-nowrap overflow-hidden leading-none text-ellipsis text-iron">
                {infoText}
              </TextStyle>
            </div>
          </div>

          <div className="relative bg-sand-050 overflow-hidden">
            <img src={photo.url} alt={photo.caption || name} width={600} height={400} loading="lazy" className="w-full object-cover aspect-[3/2] transition duration-300 ease-out group-hover:opacity-80" />
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
