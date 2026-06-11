import { ButtonLink } from '@components/ui/ButtonLink';
import { TextStyle } from '@components/ui/TextStyle';

interface Availability {
  available: boolean;
  pricePerNight?: number;
}

interface Props {
  id: number;
  name: string;
  bedroomsLabel: string;
  personCapacity: number;
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
}

export function RoomCardReact({ name, bedroomsLabel, price, photo, availability, isLoading, bookingUrl, detailUrl }: Props) {
  const baseRate = Math.round(price);
  const isUnavailable = availability !== undefined && !availability.available;
  const dimmed = isLoading || isUnavailable;

  let priceDisplay: string;
  if (!isLoading && availability?.available && availability.pricePerNight !== undefined) {
    priceDisplay = `$${Math.round(availability.pricePerNight)} / night`;
  } else {
    priceDisplay = `From $${baseRate}`;
  }

  return (
    <article className={['bg-white rounded-lg  shadow-sm ', dimmed ? 'opacity-50' : 'hover:shadow-md pointer', 'transition-opacity duration-150'].join(' ')}>
      <div className="relative">
        <a href={detailUrl}>
          <img src={photo.url} alt={photo.caption || name} width={600} height={400} loading="lazy" className="w-full object-cover aspect-[3/2] rounded-lg" />
        </a>
        <div className="absolute top-3 left-[12px] bg-white max-w-[calc(66%-24px)] rounded-sm">
          <TextStyle variant="h5" element="h5" className="font-medium px-2 pt-1">
            {name}
          </TextStyle>
          <TextStyle variant="caption" element="p" className="px-2 pb-1 text-iron">
            {bedroomsLabel}
          </TextStyle>
        </div>
        <TextStyle variant="caption" element="span" className="absolute top-3 right-3 bg-white/80 text-ink-900 backdrop-blur-sm max-w-[calc(33%)] whitespace-nowrap overflow-hidden text-ellipsis px-3 py-1.5 rounded-sm">
          {priceDisplay}
        </TextStyle>
        <div className="flex flex-row gap-2 justify-end absolute bottom-3 right-3">
          <ButtonLink href={bookingUrl} bg="prussian-200" size="small" target="_blank" rel="noopener noreferrer" aria-disabled={isUnavailable || undefined} tabIndex={isUnavailable ? -1 : undefined}>
            Book Now!
          </ButtonLink>
          <ButtonLink href={detailUrl} bg="sand-200" size="small" aria-disabled={isUnavailable || undefined} tabIndex={isUnavailable ? -1 : undefined}>
            More Info
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
