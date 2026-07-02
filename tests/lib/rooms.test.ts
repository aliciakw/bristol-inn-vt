import { describe, expect, it } from 'vitest';
import { decorateRoomsWithCms } from '../../src/lib/rooms';
import type { HostawayRoom } from '../../src/lib/hostaway';
import type { SanityRoom } from '../../src/lib/sanity';

function makeHostawayRoom(overrides: Partial<HostawayRoom> = {}): HostawayRoom {
  return {
    id: overrides.id ?? 42,
    name: overrides.name ?? 'Hostaway Name',
    bedroomsLabel: overrides.bedroomsLabel ?? '1 Bedroom',
    description: overrides.description ?? 'Room description',
    price: overrides.price ?? 150,
    photos: overrides.photos ?? [],
    amenityNames: overrides.amenityNames ?? [],
    bedroomsNumber: overrides.bedroomsNumber ?? 1,
    bathroomsNumber: overrides.bathroomsNumber ?? 1,
    personCapacity: overrides.personCapacity ?? 2,
    floorNumber: overrides.floorNumber,
    dogsAllowed: overrides.dogsAllowed ?? false,
    groundFloor: overrides.groundFloor ?? false,
  };
}

describe('decorateRoomsWithCms()', () => {
  it('uses Sanity name and floor when hostawayId matches', () => {
    const rooms = decorateRoomsWithCms([makeHostawayRoom({ id: 42, name: 'Hostaway Room', floorNumber: 3, groundFloor: false })], [{ hostawayId: 42, name: 'CMS Room', floor: 1 }]);

    expect(rooms[0]).toMatchObject({
      id: 42,
      name: 'CMS Room',
      floorNumber: 1,
      groundFloor: true,
      price: 150,
    });
  });

  it('does not infer floor from Hostaway when no Sanity room exists', () => {
    const rooms = decorateRoomsWithCms([makeHostawayRoom({ id: 42, name: 'Hostaway Room', floorNumber: 1, groundFloor: true })], []);

    expect(rooms[0]?.name).toBe('Hostaway Room');
    expect(rooms[0]?.floorNumber).toBeUndefined();
    expect(rooms[0]?.groundFloor).toBe(false);
  });

  it('keeps the Hostaway name when a matching Sanity name is blank', () => {
    const sanityRoom: SanityRoom = { hostawayId: 42, name: '   ', floor: 2 };

    const rooms = decorateRoomsWithCms([makeHostawayRoom({ id: 42, name: 'Hostaway Room' })], [sanityRoom]);

    expect(rooms[0]?.name).toBe('Hostaway Room');
    expect(rooms[0]?.floorNumber).toBe(2);
  });

  it('copies Sanity special instructions onto the decorated room', () => {
    const specialInstructions = [
      {
        _type: 'block',
        _key: 'instructions',
        children: [{ _type: 'span', text: 'Use the side entrance.' }],
      },
    ];

    const rooms = decorateRoomsWithCms([makeHostawayRoom({ id: 42 })], [{ hostawayId: 42, name: 'CMS Room', floor: 2, specialInstructions }]);

    expect(rooms[0]?.specialInstructions).toBe(specialInstructions);
  });
});
