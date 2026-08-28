import { useState, useEffect } from 'react';
import { AvailabilitySearchForm } from './AvailabilitySearchForm';
import type { SearchParams } from './AvailabilitySearchForm';
import { RoomCardReact, type RoomBrowserRoom } from './RoomCardReact';
import { TextStyle } from '@components/ui/TextStyle';
import { FormCheckbox } from '@components/ui/FormCheckbox';
import { getBookingUrl, getCheckoutUrl, getDetailUrl } from '@lib/hostaway-urls';
import { preferencesFromSearch, roomMeetsPreferences, sortRooms, type RoomPreferences, type RoomSort } from './room-search';

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
      <div className={['grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-2 gap-[var(--grid-gutter)]'].join(' ')}>
        {rooms.map((room) => {
          const roomAvailability = availability?.find((a) => a.listingId === room.id);
          const { bookingUrl, detailUrl } = getRoomUrls(room.id, lastSearch, roomAvailability?.pricePerNight);
          return (
            <RoomCardReact
              key={room.id}
              room={room}
              availability={roomAvailability}
              isLoading={isLoading ?? false}
              bookingUrl={bookingUrl}
              detailUrl={detailUrl}
              lastSearch={lastSearch}
            />
          );
        })}
      </div>
    </section>
  );
}

function resultHeading(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

interface RoomSectionsProps {
  rooms: RoomBrowserRoom[];
  availability: AvailabilityResult[];
  lastSearch: SearchParams | null;
  preferences: RoomPreferences;
}

function RoomSections({ rooms, availability, lastSearch, preferences }: RoomSectionsProps) {
  const effectiveSearch = lastSearch ? { ...lastSearch, pets: preferences.pets, groundFloor: preferences.groundFloor } : null;
  const calendarAvailable = rooms.filter((room) => availability.find((result) => result.listingId === room.id)?.available);
  const available = calendarAvailable.filter((room) => roomMeetsPreferences(room, preferences));
  const didNotMeetRequirements = calendarAvailable.filter((room) => !roomMeetsPreferences(room, preferences));
  const unavailable = rooms.filter((room) => !availability.find((result) => result.listingId === room.id)?.available);

  return (
    <div className="flex flex-col gap-12">
      <RoomGrid title={`Available (${available.length})`} rooms={available} availability={availability} lastSearch={effectiveSearch} />
      {didNotMeetRequirements.length > 0 && (
        <RoomGrid
          title={resultHeading(didNotMeetRequirements.length, 'room did not meet your requirements', 'rooms did not meet your requirements')}
          rooms={didNotMeetRequirements}
          availability={availability}
          lastSearch={effectiveSearch}
        />
      )}
      {unavailable.length > 0 && (
        <details className="group border-y border-khaki-300">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 desktop:py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-prussian-500 [&::-webkit-details-marker]:hidden">
            <TextStyle variant="h4" element="span" className="text-ink-900 hover-italic flex-1">
              {resultHeading(unavailable.length, 'room was unavailable', 'rooms were unavailable')}
            </TextStyle>
            <span aria-hidden="true" className="relative size-5 shrink-0">
              <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-sm bg-ink-900" />
              <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-sm bg-ink-900 transition-[transform,opacity] duration-300 ease-in-out group-open:scale-y-0 group-open:opacity-0" />
            </span>
          </summary>
          <div className="pb-10 pt-1 desktop:pb-12">
            <RoomGrid rooms={unavailable} availability={availability} lastSearch={effectiveSearch} />
          </div>
        </details>
      )}
    </div>
  );
}

interface ResultsToolbarProps {
  sort: RoomSort;
  onSortChange: (sort: RoomSort) => void;
  preferences: RoomPreferences;
  onPreferencesChange: (preferences: RoomPreferences) => void;
}

function ResultsToolbar({ sort, onSortChange, preferences, onPreferencesChange }: ResultsToolbarProps) {
  return (
    <div aria-label="Sort and filter rooms" className="flex flex-col tablet:flex-row tablet:items-end gap-5 rounded-lg border border-ink-900 bg-sand-050 px-4 py-4 shadow--card">
      <label className="flex flex-col gap-1.5 min-w-52 font-serif text-ink-900">
        <TextStyle variant="label" element="span" className="font-medium">
          Sort rooms
        </TextStyle>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as RoomSort)}
          className="rounded-lg border border-ink-900 bg-white/50 px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-ink-900"
        >
          <option value="floor">Floor, low to high</option>
          <option value="price-low">Price, low to high</option>
          <option value="price-high">Price, high to low</option>
          <option value="capacity">Guest capacity</option>
          <option value="name">Room name</option>
        </select>
      </label>
      <fieldset className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:pb-1.5">
        <legend className="sr-only">Filter available rooms</legend>
        <FormCheckbox
          name="filter-pets"
          label="Dogs permitted"
          checked={preferences.pets}
          onChange={(event) => onPreferencesChange({ ...preferences, pets: event.target.checked })}
        />
        <FormCheckbox
          name="filter-ground-floor"
          label="Ground floor only"
          checked={preferences.groundFloor}
          onChange={(event) => onPreferencesChange({ ...preferences, groundFloor: event.target.checked })}
        />
      </fieldset>
    </div>
  );
}

export function RoomBrowser({ rooms }: Props) {
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  const [lastSearch, setLastSearch] = useState<SearchParams | null>(null);
  const [sort, setSort] = useState<RoomSort>('floor');
  const [preferences, setPreferences] = useState<RoomPreferences>({ guests: 2, groundFloor: false, pets: false });
  const sortedRooms = sortRooms(rooms, sort);

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
    setPreferences(preferencesFromSearch(params));
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
    setSort('floor');
  }

  const isLoading = state.status === 'loading';
  const hasResults = state.status === 'results' || state.status === 'error';

  return (
    <div className="Grid">
      <div className="Grid__Row--full z-10 mb-12">
        <div className="desktop:w-[66%]">
          <AvailabilitySearchForm onSearch={handleSearch} onClear={handleClear} isLoading={isLoading} hasResults={hasResults} showResetButton={true} hideSpecialNeeds />
        </div>
        {state.status === 'error' && (
          <p role="alert" className="text-red-600 text-sm mb-6">
            {state.message}
          </p>
        )}
      </div>
      <div className="Grid__Row--full">
        {state.status === 'results' && (
          <div className="mb-10">
            <ResultsToolbar sort={sort} onSortChange={setSort} preferences={preferences} onPreferencesChange={setPreferences} />
          </div>
        )}
        {sortedRooms.length === 0 ? (
          <p className="text-center text-gray-600">No rooms available at this time. Please check back soon.</p>
        ) : state.status === 'results' ? (
          <RoomSections rooms={sortedRooms} availability={state.availability} lastSearch={lastSearch} preferences={preferences} />
        ) : (
          <RoomGrid title={`All Rooms & Suites (${sortedRooms.length})`} rooms={sortedRooms} isLoading={isLoading} lastSearch={lastSearch} />
        )}
      </div>
    </div>
  );
}
