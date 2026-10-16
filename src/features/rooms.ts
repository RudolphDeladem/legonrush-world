// Room places and roommates (the owner's instructions of 2026-10-16, sections 5-7). Signed in, the player's place comes
// from the server (supabase/sql/50-rooms.sql): claim_room() matches them at random with players who chose the same
// building, block and exact room category, keeps the same room and bed on every later sign-in, and never overfills a
// room; room_roster() lists their own room's residents only. Every bed nobody holds is shown with an NPC roommate, so
// a player who is alone in a four-person room sees three NPCs, and a real player who joins later takes one of those
// beds. Signed out (or before the server functions are installed), the game says so plainly and shows the player's
// own room with NPCs: that is not matchmaking with real players, and it is never presented as such.
import * as cloud from '../cloud';
import { allocate, categoryById, type Accommodation } from '../game/residence';
import type { Occupant } from '../game/roomplay';
import type { RiderLook } from '../game/models';

export interface RoomPlace {
  /** the room ID shown to the player and the bed they hold (0-based) */
  roomId: string;
  bed: number;
  capacity: number;
  /** real residents of the room, the player included */
  residents: { bed: number; name: string; you: boolean; look?: RiderLook; id?: string }[];
  /** cloud: the server's shared allocation; local: this device only (no real roommates) */
  source: 'cloud' | 'local';
  /** why the shared allocation was not used, when it was not */
  note?: string;
}

const NPC_NAMES = ['Kwame', 'Ama', 'Kofi', 'Akosua', 'Yaw', 'Abena', 'Kojo', 'Efua', 'Kwesi', 'Adwoa', 'Fiifi', 'Esi'];
const hashStr = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
export const npcName = (roomKey: string, bed: number) => NPC_NAMES[hashStr(`${roomKey}@${bed}`) % NPC_NAMES.length];

/** the room's occupants for the game: the real residents on their beds, an NPC on every other bed, never above capacity */
export function occupantsOf(place: RoomPlace, roomKey: string, youName: string): Occupant[] {
  const out: Occupant[] = [];
  for (let bed = 0; bed < place.capacity; bed++) {
    const r = place.residents.find((x) => x.bed === bed);
    if (r) out.push({ bed, kind: r.you ? 'you' : 'player', name: r.you ? youName : r.name, look: r.look, online: undefined, id: r.id });
    else out.push({ bed, kind: 'npc', name: npcName(roomKey, bed) });
  }
  return out;
}

type Rpc = (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
async function rpc(): Promise<Rpc | null> {
  if (!cloud.account) return null;
  const c = await cloud.realtimeClient();
  return (fn, args) => c.rpc(fn, args) as unknown as ReturnType<Rpc>;
}

/** the local place: the stable room from allocate(), the player on the first bed, NPCs on the rest */
export function localPlace(acc: Accommodation, note: string): RoomPlace {
  const c = categoryById(acc.categoryId);
  return { roomId: acc.roomId, bed: 0, capacity: c?.capacity ?? 1, residents: [{ bed: 0, name: 'You', you: true }], source: 'local', note };
}

/**
 * Claims (or keeps) the player's place for an accommodation. With an account it is the server's shared allocation;
 * the returned accommodation carries the server's room ID and bed so it can be saved with the profile.
 */
export async function claimPlace(acc: Accommodation): Promise<{ acc: Accommodation; place: RoomPlace }> {
  const call = await rpc().catch(() => null);
  if (!call) return { acc, place: localPlace(acc, 'Signed out: your roommates are NPCs. Sign in to be matched with real players.') };
  try {
    const { data, error } = await call('claim_room', { p_building: acc.buildingId, p_block: acc.blockId ?? '', p_category: acc.categoryId });
    if (error) throw new Error(error.message);
    const row = (data as { room: string; bed: number; capacity: number }[])[0];
    const next: Accommodation = { ...acc, roomId: row.room, bed: row.bed, shared: true };
    return { acc: next, place: await rosterOf(next) };
  } catch (e) {
    const missing = /function|schema cache|does not exist/i.test(String((e as Error).message));
    return { acc, place: localPlace(acc, missing ? 'Room matching is not set up on the server yet: your roommates are NPCs for now.' : 'No connection to the room server: your roommates are NPCs for now.') };
  }
}

/** the player's own room as the server has it now (their real roommates, offline ones included) */
export async function rosterOf(acc: Accommodation): Promise<RoomPlace> {
  const call = await rpc().catch(() => null);
  if (!call || !acc.shared) return localPlace(acc, call ? 'Your place was chosen before room matching: choose your room again to be matched.' : 'Signed out: your roommates are NPCs. Sign in to be matched with real players.');
  try {
    const { data, error } = await call('room_roster');
    if (error) throw new Error(error.message);
    const rows = data as { room: string; capacity: number; bed: number; name: string; look: RiderLook | null; you: boolean; user_id: string }[];
    const me = rows.find((r) => r.you);
    if (!me) return localPlace(acc, 'Your place was released: choose your room again.');
    return { roomId: me.room, bed: me.bed, capacity: me.capacity, residents: rows.map((r) => ({ bed: r.bed, name: r.name, you: r.you, look: r.look ?? undefined, id: r.user_id })), source: 'cloud' };
  } catch {
    return localPlace(acc, 'No connection to the room server: your roommates are NPCs for now.');
  }
}

/** gives up the shared place (the player chose no hall or hostel) */
export async function leavePlace() {
  const call = await rpc().catch(() => null);
  if (call) await call('leave_room').catch(() => undefined);
}

/** the local fallback's room for a character (the same as before the server existed) */
export const localRoom = (characterId: string, acc: Accommodation) => allocate(characterId, acc.buildingId, acc.categoryId, acc.blockId);
