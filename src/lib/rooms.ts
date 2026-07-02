import { getRooms as getHostawayRooms, type HostawayRoom } from './hostaway';
import { getSanityRooms, type SanityRoom } from './sanity';

export type Room = HostawayRoom & {
  floorNumber?: SanityRoom['floor'];
  specialInstructions?: SanityRoom['specialInstructions'];
};

export function decorateRoomsWithCms(hostawayRooms: HostawayRoom[], sanityRooms: SanityRoom[]): Room[] {
  const sanityRoomsByHostawayId = new Map(sanityRooms.map((room) => [room.hostawayId, room]));

  return hostawayRooms.map((hostawayRoom) => {
    const sanityRoom = sanityRoomsByHostawayId.get(hostawayRoom.id);
    const floorNumber = sanityRoom?.floor;

    return {
      ...hostawayRoom,
      name: sanityRoom?.name.trim() || hostawayRoom.name,
      floorNumber,
      groundFloor: floorNumber === 1,
      specialInstructions: sanityRoom?.specialInstructions,
    };
  });
}

export async function getRooms(): Promise<Room[]> {
  const [hostawayRooms, sanityRooms] = await Promise.all([getHostawayRooms(), getSanityRooms()]);

  return decorateRoomsWithCms(hostawayRooms, sanityRooms);
}
