import { describe, expect, it } from 'vitest';
import { roomMeetsPreferences, sortRooms } from '../../src/components/rooms/room-search';
import type { RoomBrowserRoom } from '../../src/components/rooms/RoomCardReact';

function room(overrides: Partial<RoomBrowserRoom> = {}): RoomBrowserRoom {
  return {
    id: 1,
    name: 'Maple',
    price: 200,
    personCapacity: 2,
    floorNumber: 1,
    dogsAllowed: false,
    photo: { url: '', caption: '' },
    amenities: [],
    ...overrides,
  };
}

describe('room search preferences', () => {
  it('requires enough capacity and each selected preference', () => {
    const candidate = room({ personCapacity: 4, floorNumber: 2, dogsAllowed: true });
    expect(roomMeetsPreferences(candidate, { guests: 4, groundFloor: false, pets: true })).toBe(true);
    expect(roomMeetsPreferences(candidate, { guests: 5, groundFloor: false, pets: true })).toBe(false);
    expect(roomMeetsPreferences(candidate, { guests: 4, groundFloor: true, pets: true })).toBe(false);
  });

  it('sorts without mutating the source room list', () => {
    const rooms = [room({ id: 1, name: 'Maple', price: 300 }), room({ id: 2, name: 'Birch', price: 150 })];
    expect(sortRooms(rooms, 'price-low').map(({ id }) => id)).toEqual([2, 1]);
    expect(rooms.map(({ id }) => id)).toEqual([1, 2]);
  });
});
