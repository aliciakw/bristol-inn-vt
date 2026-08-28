import { useState, useEffect, type ReactNode } from 'react';
import { AvailabilitySearchForm } from './AvailabilitySearchForm';
import type { SearchParams } from './AvailabilitySearchForm';
import { RoomCardReact, type RoomBrowserRoom } from './RoomCardReact';
import { TextStyle } from '@components/ui/TextStyle';
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
  headerAction?: ReactNode;
}

function RoomGrid({ title, rooms, isLoading, availability, lastSearch, headerAction }: RoomGridProps) {
  return (
    <section className="flex flex-col gap-6">
      {(title || headerAction) && (
        <div className="flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between">
          {title && (
            <TextStyle variant="h4" element="h2" className="shrink-0">
              {title}
            </TextStyle>
          )}
          {headerAction}
        </div>
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
  toolbar: ReactNode;
}

function RoomSections({ rooms, availability, lastSearch, preferences, toolbar }: RoomSectionsProps) {
  const effectiveSearch = lastSearch ? { ...lastSearch, pets: preferences.pets, groundFloor: preferences.groundFloor } : null;
  const calendarAvailable = rooms.filter((room) => availability.find((result) => result.listingId === room.id)?.available);
  const available = calendarAvailable.filter((room) => roomMeetsPreferences(room, preferences));
  const didNotMeetRequirements = calendarAvailable.filter((room) => !roomMeetsPreferences(room, preferences));
  const unavailable = rooms.filter((room) => !availability.find((result) => result.listingId === room.id)?.available);

  return (
    <div className="flex flex-col gap-12">
      <RoomGrid title={`Available (${available.length})`} rooms={available} availability={availability} lastSearch={effectiveSearch} headerAction={toolbar} />
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

interface BrowseSectionsProps {
  rooms: RoomBrowserRoom[];
  preferences: RoomPreferences;
  toolbar: ReactNode;
  isLoading: boolean;
  lastSearch: SearchParams | null;
}

function BrowseSections({ rooms, preferences, toolbar, isLoading, lastSearch }: BrowseSectionsProps) {
  const matching = rooms.filter((room) => roomMeetsPreferences(room, preferences));
  const didNotMeetRequirements = rooms.filter((room) => !roomMeetsPreferences(room, preferences));

  return (
    <div className="flex flex-col gap-12">
      <RoomGrid title={`All Rooms & Suites (${matching.length})`} rooms={matching} isLoading={isLoading} lastSearch={lastSearch} headerAction={toolbar} />
      {didNotMeetRequirements.length > 0 && (
        <RoomGrid
          title={resultHeading(didNotMeetRequirements.length, 'room did not meet your requirements', 'rooms did not meet your requirements')}
          rooms={didNotMeetRequirements}
          isLoading={isLoading}
          lastSearch={lastSearch}
        />
      )}
    </div>
  );
}

interface SortAndFilterToolbarProps {
  sort: RoomSort;
  onSortChange: (sort: RoomSort) => void;
  preferences: RoomPreferences;
  onPreferencesChange: (preferences: RoomPreferences) => void;
}

function SortAndFilterToolbar({ sort, onSortChange, preferences, onPreferencesChange }: SortAndFilterToolbarProps) {
  return (
    <div aria-label="Sort and filter rooms" className="flex flex-wrap items-center gap-x-5 gap-y-2 tablet:justify-end font-serif text-ink-900">
      <label className="inline-flex items-center gap-2 whitespace-nowrap">
        <TextStyle variant="label" element="span" className="font-medium">
          Sort:
        </TextStyle>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as RoomSort)}
          className="border-b border-ink-900 bg-transparent py-1 pr-7 focus:outline-none focus:ring-1 focus:ring-prussian-500"
        >
          <option value="floor">Floor, low to high</option>
          <option value="price-low">Price, low to high</option>
          <option value="price-high">Price, high to low</option>
          <option value="capacity">Guest capacity</option>
          <option value="name">Room name</option>
        </select>
      </label>
      <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <legend className="sr-only">Filter available rooms</legend>
        <label className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap">
          <input
            name="filter-pets"
            type="checkbox"
            checked={preferences.pets}
            onChange={(event) => onPreferencesChange({ ...preferences, pets: event.target.checked })}
            className="size-4 accent-prussian-500"
          />
          Dogs permitted
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap">
          <input
            name="filter-ground-floor"
            type="checkbox"
            checked={preferences.groundFloor}
            onChange={(event) => onPreferencesChange({ ...preferences, groundFloor: event.target.checked })}
            className="size-4 accent-prussian-500"
          />
          Ground floor only
        </label>
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
  const toolbar = <SortAndFilterToolbar sort={sort} onSortChange={setSort} preferences={preferences} onPreferencesChange={setPreferences} />;

  return (
    <div className="Grid">
      <div className="Grid__Row--full z-10 mb-8">
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
        {sortedRooms.length === 0 ? (
          <div className="flex flex-col gap-6">
            <div className="tablet:ml-auto">{toolbar}</div>
            <p className="text-center text-gray-600">No rooms available at this time. Please check back soon.</p>
          </div>
        ) : state.status === 'results' ? (
          <RoomSections rooms={sortedRooms} availability={state.availability} lastSearch={lastSearch} preferences={preferences} toolbar={toolbar} />
        ) : (
          <BrowseSections rooms={sortedRooms} preferences={preferences} toolbar={toolbar} isLoading={isLoading} lastSearch={lastSearch} />
        )}
      </div>
    </div>
  );
}
