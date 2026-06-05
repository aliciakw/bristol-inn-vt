interface Availability {
  available: boolean;
  pricePerNight?: number;
}

interface Props {
  id: number;
  name: string;
  price: number;
  photo: { url: string; caption: string };
  amenities: string[];
  availability?: Availability;
  isLoading: boolean;
}

export function RoomCardReact({
  id,
  name,
  price,
  photo,
  amenities,
  availability,
  isLoading,
}: Props) {
  const baseRate = Math.round(price);
  const isUnavailable = availability !== undefined && !availability.available;
  const dimmed = isLoading || isUnavailable;

  let priceDisplay: string;
  if (!isLoading && availability?.available && availability.pricePerNight !== undefined) {
    priceDisplay = `$${Math.round(availability.pricePerNight)} / night`;
  } else {
    priceDisplay = `From $${baseRate} / night`;
  }

  return (
    <article
      className={[
        'bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200',
        dimmed ? 'opacity-50' : 'hover:shadow-md',
        'transition-opacity duration-150',
      ].join(' ')}
    >
      <img
        src={photo.url}
        alt={photo.caption || name}
        width={600}
        height={400}
        loading="lazy"
        className="w-full object-cover aspect-[3/2]"
      />
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        <p className="text-base font-normal text-gray-700">{priceDisplay}</p>
        {/* Pre-allocated badge slot — keeps card height stable when badge appears */}
        <div className="min-h-[22px]">
          {!isLoading && isUnavailable && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-slate-500">
              Unavailable for these dates
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => (
            <span
              key={a}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-slate-700"
            >
              {a}
            </span>
          ))}
        </div>
        <a
          href={`/rooms/${id}`}
          className="inline-block mt-2 text-slate-700 font-normal underline-offset-2 hover:underline"
          aria-disabled={isUnavailable || undefined}
          tabIndex={isUnavailable ? -1 : undefined}
        >
          View Room
        </a>
      </div>
    </article>
  );
}
