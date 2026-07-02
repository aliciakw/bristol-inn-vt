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

const RoomCardTag = ({ children }: { children: React.ReactNode }) => (
  <TextStyle
    variant="h5"
    element="span"
    className="bg-sand-050/80 backdrop-blur-sm text-ink-900 max-w-[calc(40%)] border-1 border-ink-900 whitespace-nowrap overflow-hidden px-3 py-1 rounded-lg font-medium"
  >
    <span className="inline-flex flex-row items-center gap-1 whitespace-nowrap">{children}</span>
  </TextStyle>
);

const RoomCardPill = ({ text, className }: { text?: string; className?: string }) =>
  text && (
    <TextStyle variant="caption" element="span" className={`bg-sand-100 border-1 border-ink-900 px-3 py-1 rounded-full italic flex-none ${className || ''}`}>
      {text}
    </TextStyle>
  );

const PriceTag = ({ price }: { price: number | string }) => (
  <TextStyle
    variant="h4"
    element="span"
    className="bg-white border-3 border-white text-black max-w-[calc(50%)] whitespace-nowrap overflow-hidden text-ellipsis px-2 py-[2px] rounded-full tracking-tight px-4 shadow-sm"
  >
    ${price}
    <span className="text-sm">{`/ ${' '}night`}</span>
  </TextStyle>
);

export function RoomCardReact({ room, availability, isLoading, detailUrl }: Props) {
  const { name, bedroomsLabel, dogsAllowed, price, photo, floorNumber, personCapacity } = room;
  const baseRate = Math.round(price);
  const isUnavailable = availability !== undefined && !availability.available;
  const dimmed = isLoading || isUnavailable;

  const actualPrice = availability?.available && availability.pricePerNight !== undefined ? Math.round(availability?.pricePerNight ?? baseRate) : null;

  const floorNumberLabel = floorNumber !== undefined ? `${floorNumber === 1 ? '1st' : floorNumber === 2 ? '2nd' : floorNumber === 3 ? '3rd' : floorNumber} Floor` : '';
  const personCapacityLabel = `${personCapacity} ${personCapacity === 1 ? 'guest' : 'guests'}`;

  return (
    <a href={detailUrl} className="pointer group fade-in-500">
      <article className={['rounded-xl border-1 border-ink-900 overflow-hidden shadow--card', dimmed ? 'opacity-50' : '', 'transition-opacity duration-150'].join(' ')}>
        <div className="rounded-sm">
          <div className="flex flex-col justify-center bg-sand-050 group-hover:bg-sand-050/50 border-b-1 border-ink-900 px-3 pt-3 pb-3 gap-1 rounded-t-lg relative group-hover:shadow-lg transition-colors duration-700 ease-out">
            <TextStyle
              variant="h3"
              element="h4"
              className="text-ink-900 overflow-hidden text-ellipsis font-normal leading-none line-clamp-1 mt-1 transition-colors duration-700 ease-out"
            >
              {name}
            </TextStyle>
            <div className="flex flex-row flex-wrap gap-2 mt-2">
              {[bedroomsLabel, floorNumberLabel, personCapacityLabel].filter(Boolean).map((label) => (
                <RoomCardPill key={label} text={label} />
              ))}
            </div>
          </div>

          <div className="relative bg-sand-050 overflow-hidden">
            <img
              src={photo.url}
              alt={photo.caption || name}
              width={600}
              height={400}
              loading="lazy"
              className="w-full object-cover aspect-[4/3] tablet:aspect-[3/2] transition duration-300 ease-out group-hover:opacity-80"
            />
            <div className={`absolute bottom-3 right-3 left-3 flex gap-4 items-end ${dogsAllowed ? 'justify-between' : 'justify-end'}`}>
              {dogsAllowed && (
                <RoomCardTag>
                  <span className="inline-flex flex-row items-center gap-1 whitespace-nowrap">
                    Dogs allowed <PawPrint size={16} className="text-ink-900 mb-1 ml-1" aria-label="Dogs allowed" />
                  </span>
                </RoomCardTag>
              )}
              {actualPrice ? <PriceTag price={actualPrice} /> : baseRate && <PriceTag price={`${baseRate}+`} />}
            </div>
          </div>
        </div>
      </article>
    </a>
  );
}
