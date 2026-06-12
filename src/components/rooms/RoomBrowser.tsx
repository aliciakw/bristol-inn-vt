import { useState, useEffect } from 'react';
import { AvailabilitySearchForm } from './AvailabilitySearchForm';
import type { SearchParams } from './AvailabilitySearchForm';
import { RoomCardReact } from './RoomCardReact';
import { TextStyle } from '@components/ui/TextStyle';
import { getBookingUrl, getCheckoutUrl, getDetailUrl } from '@lib/hostaway-urls';

interface RoomBrowserRoom {
  id: number;
  name: string;
  bedroomsLabel: string;
  price: number;
  personCapacity: number;
  floorNumber?: number;
  numberOfBeds?: number;
  numberOfBathrooms?: number;
  dogsAllowed?: boolean;
  photo: { url: string; caption: string };
  amenities: string[];
}

interface AvailabilityResult {
  listingId: number;
  available: boolean;
  pricePerNight?: number;
}

type SearchState = { status: 'idle' } | { status: 'loading' } | { status: 'results'; availability: AvailabilityResult[] } | { status: 'error'; message: string };

interface Props {
  rooms: RoomBrowserRoom[];
}

const desktopColsClass = {
  2: '',
  3: 'desktop:grid-cols-3',
} satisfies Record<number, string>;

interface RoomGridProps {
  title?: string;
  rooms: RoomBrowserRoom[];
  isLoading?: boolean;
  availability?: AvailabilityResult[];
  desktopCols?: 2 | 3;
  lastSearch?: SearchParams | null;
}

function RoomGrid({ title, rooms, isLoading, availability, desktopCols = 2, lastSearch }: RoomGridProps) {
  return (
    <section className="flex flex-col gap-6">
      {title && (
        <TextStyle variant="h4" element="h2" className="">
          {title}
        </TextStyle>
      )}
      {/* eslint-disable-next-line security/detect-object-injection */}
      <div className={['grid grid-cols-1 tablet:grid-cols-2 gap-6', desktopColsClass[desktopCols]].join(' ')}>
        {rooms.map((room) => (
          <RoomCardReact
            key={room.id}
            id={room.id}
            name={room.name}
            bedroomsLabel={room.bedroomsLabel}
            personCapacity={room.personCapacity}
            floorNumber={room.floorNumber}
            numberOfBeds={room.numberOfBeds}
            numberOfBathrooms={room.numberOfBathrooms}
            dogsAllowed={room.dogsAllowed}
            price={room.price}
            photo={room.photo}
            amenities={room.amenities}
            availability={availability?.find((a) => a.listingId === room.id)}
            isLoading={isLoading ?? false}
            bookingUrl={lastSearch ? getCheckoutUrl(room.id, lastSearch) : getBookingUrl(room.id)}
            detailUrl={getDetailUrl(room.id, lastSearch ? { ...lastSearch, pricePerNight: availability?.find((a) => a.listingId === room.id)?.pricePerNight } : undefined)}
          />
        ))}
      </div>
    </section>
  );
}

function RoomSections({ rooms, availability, lastSearch }: { rooms: RoomBrowserRoom[]; availability: AvailabilityResult[]; lastSearch: SearchParams }) {
  const available = rooms.filter((r) => availability.find((a) => a.listingId === r.id)?.available);
  const unavailable = rooms.filter((r) => !availability.find((a) => a.listingId === r.id)?.available);

  return (
    <div className="flex flex-col gap-12">
      <RoomGrid title={`Available (${available.length})`} rooms={available} availability={availability} lastSearch={lastSearch} />
      {unavailable.length > 0 && <RoomGrid title={`Others (${unavailable.length})`} rooms={unavailable} availability={availability} desktopCols={3} lastSearch={lastSearch} />}
    </div>
  );
}

export function RoomBrowser({ rooms }: Props) {
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  const [lastSearch, setLastSearch] = useState<SearchParams | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const checkIn = sp.get('checkIn') ?? '';
    const checkOut = sp.get('checkOut') ?? '';
    const guests = parseInt(sp.get('guests') ?? '', 10) || 0;
    if (checkIn && checkOut && guests > 0) {
      handleSearch({
        checkIn,
        checkOut,
        guests,
        groundFloor: sp.get('groundFloor') === '1',
        pets: sp.get('pets') === '1',
      });
    }
  }, []);

  async function handleSearch(params: SearchParams) {
    setLastSearch(params);
    setState({ status: 'loading' });
    try {
      const qs = new URLSearchParams({
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: String(params.guests),
      });
      if (params.pets) qs.set('pets', '1');
      if (params.groundFloor) qs.set('groundFloor', '1');
      const res = await fetch(`/api/rooms/availability?${qs.toString()}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? 'Request failed');
      }
      const availability = (await res.json()) as AvailabilityResult[];
      setState({ status: 'results', availability });
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Unable to check availability. Please try again.',
      });
    }
  }

  function handleClear() {
    setState({ status: 'idle' });
    setLastSearch(null);
  }

  const isLoading = state.status === 'loading';
  const hasResults = state.status === 'results' || state.status === 'error';

  return (
    <div className="flex flex-col gap-12">
      <div className="top-[var(--nav-top-bar-height)] z-10">
        <AvailabilitySearchForm onSearch={handleSearch} onClear={handleClear} isLoading={isLoading} hasResults={hasResults} showResetButton={true} />

        {state.status === 'error' && (
          <p role="alert" className="text-red-600 text-sm mb-6">
            {state.message}
          </p>
        )}
      </div>

      {rooms.length === 0 ? (
        <p className="text-center text-gray-600">No rooms available at this time. Please check back soon.</p>
      ) : state.status === 'results' && lastSearch ? (
        <RoomSections rooms={rooms} availability={state.availability} lastSearch={lastSearch} />
      ) : (
        <RoomGrid title={`Everything (${rooms.length})`} rooms={rooms} isLoading={isLoading} lastSearch={lastSearch} />
      )}
    </div>
  );
}
