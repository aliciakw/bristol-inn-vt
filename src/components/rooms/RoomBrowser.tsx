import { useState } from 'react';
import { AvailabilitySearchForm } from './AvailabilitySearchForm';
import type { SearchParams } from './AvailabilitySearchForm';
import { RoomCardReact } from './RoomCardReact';

interface RoomBrowserRoom {
  id: number;
  name: string;
  price: number;
  personCapacity: number;
  photo: { url: string; caption: string };
  amenities: string[];
}

interface AvailabilityResult {
  listingId: number;
  available: boolean;
  pricePerNight?: number;
}

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'results'; availability: AvailabilityResult[] }
  | { status: 'error'; message: string };

interface Props {
  rooms: RoomBrowserRoom[];
}

export function RoomBrowser({ rooms }: Props) {
  const [state, setState] = useState<SearchState>({ status: 'idle' });

  async function handleSearch(params: SearchParams) {
    setState({ status: 'loading' });
    try {
      const qs = new URLSearchParams({
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: String(params.guests),
      });
      const res = await fetch(`/api/rooms/availability?${qs.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? 'Request failed');
      }
      const availability = await res.json() as AvailabilityResult[];
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
  }

  const isLoading = state.status === 'loading';
  const hasResults = state.status === 'results' || state.status === 'error';

  function getAvailability(roomId: number): AvailabilityResult | undefined {
    if (state.status !== 'results') return undefined;
    return state.availability.find(a => a.listingId === roomId);
  }

  return (
    <div>
      <AvailabilitySearchForm
        onSearch={handleSearch}
        onClear={handleClear}
        isLoading={isLoading}
        hasResults={hasResults}
      />

      {state.status === 'error' && (
        <p role="alert" className="text-red-600 text-sm mb-6">
          {state.message}
        </p>
      )}

      {rooms.length === 0 ? (
        <p className="text-center text-gray-600">No rooms available at this time. Please check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCardReact
              key={room.id}
              id={room.id}
              name={room.name}
              price={room.price}
              photo={room.photo}
              amenities={room.amenities}
              availability={getAvailability(room.id)}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
