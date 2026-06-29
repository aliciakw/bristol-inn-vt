import { useState, useEffect } from 'react';
import { AvailabilitySearchForm } from './AvailabilitySearchForm';
import type { SearchParams } from './AvailabilitySearchForm';
import { RoomCardReact, type RoomBrowserRoom } from './RoomCardReact';
import { TextStyle } from '@components/ui/TextStyle';
import { getBookingUrl, getCheckoutUrl, getDetailUrl } from '@lib/hostaway-urls';

interface AvailabilityResult {
  listingId: number;
  available: boolean;
  pricePerNight?: number;
}

type SearchState = { status: 'idle' } | { status: 'loading' } | { status: 'results'; availability: AvailabilityResult[] } | { status: 'error'; message: string };

interface Props {
  rooms: RoomBrowserRoom[];
}

function getRoomUrls(roomId: number, lastSearch: SearchParams | null, pricePerNight?: number) {
  if (!lastSearch) {
    return { bookingUrl: getBookingUrl(roomId), detailUrl: getDetailUrl(roomId) };
  }
  const { checkIn, checkOut, guests, pets } = lastSearch;
  return {
    bookingUrl: getCheckoutUrl(roomId, { checkIn, checkOut, guests }),
    detailUrl: getDetailUrl(roomId, { checkIn, checkOut, guests, pricePerNight, pets }),
  };
}

interface RoomGridProps {
  title?: string;
  rooms: RoomBrowserRoom[];
  isLoading?: boolean;
  availability?: AvailabilityResult[];
  lastSearch: SearchParams | null;
  desktopCols?: 2 | 3;
}

function RoomGrid({ title, rooms, isLoading, availability, lastSearch }: RoomGridProps) {
  return (
    <section className="flex flex-col gap-6">
      {title && (
        <TextStyle variant="h4" element="h2" className="">
          {title}
        </TextStyle>
      )}
      {}
      <div className={['grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-[var(--grid-gutter)]'].join(' ')}>
        {rooms.map((room) => {
          const roomAvailability = availability?.find((a) => a.listingId === room.id);
          const { bookingUrl, detailUrl } = getRoomUrls(room.id, lastSearch, roomAvailability?.pricePerNight);
          return <RoomCardReact key={room.id} room={room} availability={roomAvailability} isLoading={isLoading ?? false} bookingUrl={bookingUrl} detailUrl={detailUrl} lastSearch={lastSearch} />;
        })}
      </div>
    </section>
  );
}

function RoomSections({ rooms, availability, lastSearch }: { rooms: RoomBrowserRoom[]; availability: AvailabilityResult[]; lastSearch: SearchParams | null }) {
  const filteredRooms = rooms.filter((room) => {
    if (lastSearch?.pets && !room.dogsAllowed) return false;
    if (lastSearch?.groundFloor && room.floorNumber !== 1) return false;
    return true;
  });
  const available = filteredRooms.filter((r) => availability.find((a) => a.listingId === r.id)?.available);
  const unavailable = filteredRooms.filter((r) => !availability.find((a) => a.listingId === r.id)?.available);
  const showUnavailable = true; // !lastSearch?.pets && !lastSearch?.groundFloor;

  return (
    <div className="flex flex-col gap-12">
      <RoomGrid title={`Available (${available.length})`} rooms={available} availability={availability} lastSearch={lastSearch} />
      {showUnavailable && unavailable.length > 0 && <RoomGrid title={`Others (${unavailable.length})`} rooms={unavailable} availability={availability} lastSearch={lastSearch} desktopCols={3} />}
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
    setState({ status: 'loading' });
    setLastSearch(params);
    try {
      const qs = new URLSearchParams({
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: String(params.guests),
      });
      if (params.groundFloor) qs.set('groundFloor', '1');
      if (params.pets) qs.set('pets', '1');
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
    <div className="flex flex-col gap-12 mb-8">
      <div className="top-[var(--nav-top-bar-height)] z-10 desktop:max-w-[66.66%] mb-12">
        <AvailabilitySearchForm onSearch={handleSearch} onClear={handleClear} isLoading={isLoading} hasResults={hasResults} showResetButton={true} />

        {state.status === 'error' && (
          <p role="alert" className="text-red-600 text-sm mb-6">
            {state.message}
          </p>
        )}
      </div>

      {rooms.length === 0 ? (
        <p className="text-center text-gray-600">No rooms available at this time. Please check back soon.</p>
      ) : state.status === 'results' ? (
        <RoomSections rooms={rooms} availability={state.availability} lastSearch={lastSearch} />
      ) : (
        <RoomGrid title={`Everything (${rooms.length})`} rooms={rooms} isLoading={isLoading} lastSearch={lastSearch} />
      )}
    </div>
  );
}
