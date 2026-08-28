import type { SearchParams } from './AvailabilitySearchForm';
import type { RoomBrowserRoom } from './RoomCardReact';

export type RoomSort = 'floor' | 'price-low' | 'price-high' | 'capacity' | 'name';

export interface RoomPreferences {
  guests: number;
  groundFloor: boolean;
  pets: boolean;
}

export function preferencesFromSearch(search: SearchParams): RoomPreferences {
  return {
    guests: search.guests,
    groundFloor: search.groundFloor,
    pets: search.pets,
  };
}

export function roomMeetsPreferences(room: RoomBrowserRoom, preferences: RoomPreferences): boolean {
  if (room.personCapacity < preferences.guests) return false;
  if (preferences.pets && !room.dogsAllowed) return false;
  if (preferences.groundFloor && room.floorNumber !== 1) return false;
  return true;
}

export function sortRooms(rooms: RoomBrowserRoom[], sort: RoomSort): RoomBrowserRoom[] {
  return rooms.slice().sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price || a.name.localeCompare(b.name);
    if (sort === 'price-high') return b.price - a.price || a.name.localeCompare(b.name);
    if (sort === 'capacity') return b.personCapacity - a.personCapacity || a.name.localeCompare(b.name);
    if (sort === 'name') return a.name.localeCompare(b.name);

    const floorA = a.floorNumber ?? Number.MAX_SAFE_INTEGER;
    const floorB = b.floorNumber ?? Number.MAX_SAFE_INTEGER;
    return floorA - floorB || a.name.localeCompare(b.name);
  });
}
