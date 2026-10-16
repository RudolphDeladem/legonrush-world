// Halls and hostels for the walking and accommodation feature (the owner's Volume A, "Get down. Walk. Enter your own
// room.", and Volume B, the room and lodge construction atlas; the reference pack's room_layouts.json, copied to
// src/data/rooms.json). This file is the shared contract between the two: buildings with stable IDs, their entrances
// and porter's lodge families, room paint, and the room-category catalogue that signup offers and the room builder
// (roomkit.ts) turns into an interior.
//
// Evidence: every room dimension is a working game value, not a survey. Each category keeps the atlas's status
// ("observed detail with inferred shell" or "adapted"); unresolved source notation ("2-1") stays in the catalogue as a
// record that cannot be chosen.
import ROOM_DATA from '../data/rooms.json';
import { ACCESS, placeByName } from './campusmap';
import { djWorld } from './djplan';

// ---------- the room layouts (Volume B, R01-R31 and the service modules S01-S04) ----------
export interface LayoutObject { type: 'bed' | 'bunk' | 'desk' | 'chair' | 'wardrobe' | 'basin' | 'shower' | 'toilet' | 'counter' | 'sink' | 'fridge' | 'sofa' | 'hob' | 'ceiling_fan' | 'ceiling_light' | 'drying_rack'; x: number; y: number; w: number; d: number; z?: number; label?: string; material?: string; mattress_color?: string }
export interface Layout {
  id: string; name: string; capacity: number; width: number; length: number; wall_height: number; wall_color: string;
  traditional_wood: boolean; source: string; status: string;
  rooms: { x: number; y: number; w: number; d: number; label: string }[];
  objects: LayoutObject[];
  /** wall centre lines, x0 y0 x1 y1 (plan metres: x across, y deep, the entry wall at y 0) */
  walls: [number, number, number, number][];
  doors: { x: number; y: number; w: number; axis: 'x' | 'y'; label: string }[];
  windows: [number, number, number, number][];
  spawn: [number, number, number];
  camera_anchor: [number, number, number];
}
export const LAYOUTS: Record<string, Layout> = Object.fromEntries((ROOM_DATA as unknown as Layout[]).map((l) => [l.id, l]));

// ---------- lodges and paint ----------
/** the thirteen porter's lodge families (Volume A section 13): fixed structural templates */
export type LodgeFamily = 'L01' | 'L02' | 'L03' | 'L04' | 'L05' | 'L06' | 'L07' | 'L08' | 'L09' | 'L10' | 'L11' | 'L12' | 'L13';
/** the user's room paint mapping (Volume A section 16, owner 2026-10-16): white (TF included), Bani blue, Evandy cream */
export type PaintKey = 'white' | 'blue' | 'cream';
/** working display swatches, editable: the sources give colour families, not measured colours */
export const PAINT: Record<PaintKey, string> = { white: '#f4f3ee', blue: '#a9c8e2', cream: '#ecdcb8' };

// ---------- buildings ----------
export type Catalogue = 'traditional' | 'annex' | 'diaspora' | 'diamond' | 'jubilee' | 'newpent' | 'oldpent' | 'vikings' | 'ish' | 'valco' | 'evandy' | 'bani' | 'tf';
export interface Entrance {
  /** stable entrance ID */
  id: string;
  label: string;
  /** where the entrance is (game metres) */
  at: [number, number];
  /** compass bearing (degrees) the arriving walker faces at the entrance: into the building or compound */
  facing: number;
  /** where the entrance came from */
  source: string;
}
export interface Residence {
  id: string;
  name: string;
  kind: 'residential';
  catalogue: Catalogue;
  /** null: no lodge of its own (the Volta annex, served by Volta Hall's lodge: see lodgeAt) */
  lodge: LodgeFamily | null;
  paint: PaintKey;
  /** map places this building answers to (the project's own names, not loose substrings) */
  places: string[];
  entrances: Entrance[];
  /** blocks offered at signup, where the source distinguishes them */
  blocks?: { id: string; name: string }[];
  /** notes that stay visible in the coverage report */
  note?: string;
  /** a residence with no lodge of its own: the residence whose lodge serves it */
  lodgeAt?: string;
  /** a porter's lodge already modelled from the owner's photographs (no second one is built) */
  existingLodge?: string;
}

/** an entrance from the map's access data for a place */
const fromPlace = (place: string, id: string, label = 'Entrance'): Entrance | null => {
  const p = placeByName(place), a = p && ACCESS.get(place);
  if (!p || !a) return null;
  return { id, label, at: [a.entrance[0], a.entrance[1]], facing: a.facing, source: `map access (${a.type}, ${a.confidence} confidence)` };
};
const ent = (list: (Entrance | null)[]) => list.filter((e): e is Entrance => !!e);

/** Diamond Jubilee Hall's entrance feature on its front (djplan.ts): it has no map place of its own */
const djEntrance = (): Entrance => {
  const [x, z] = djWorld(-4.6, -24.5), [ix, iz] = djWorld(-4.6, -20);
  return { id: 'diamond-jubilee:front', label: 'Front entrance', at: [x, z], facing: (Math.atan2(ix - x, -(iz - z)) * 180) / Math.PI, source: 'djplan.ts entrance feature' };
};

const R = (id: string, name: string, catalogue: Catalogue, lodge: LodgeFamily | null, paint: PaintKey, places: string[], extra: Partial<Residence> = {}): Residence => ({
  id, name, kind: 'residential', catalogue, lodge, paint, places,
  entrances: ent(places.map((p, i) => fromPlace(p, `${id}:${i ? p.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'main'}`, places.length > 1 ? p : 'Main entrance'))),
  ...extra,
});

export const RESIDENCES: Residence[] = [
  // L01: the Diaspora group (photo-led indoor reception)
  R('jean-nelson', 'Jean Nelson Aka Hall', 'diaspora', 'L01', 'white', ['Jean Nelson Aka Hall']),
  R('limann', 'Hilla Limann Hall', 'diaspora', 'L01', 'white', ['Dr. Hilla Limann Hall']),
  R('sey', 'Elizabeth Frances Sey Hall', 'diaspora', 'L01', 'white', ['Elizabeth Frances Sey Hall']),
  R('kwapong', 'Alexander Kwapong Hall', 'diaspora', 'L01', 'white', ['Alexander Kwapong Hall']),
  { id: 'diamond-jubilee', name: 'Diamond Jubilee Hall', kind: 'residential', catalogue: 'diamond', lodge: 'L01', paint: 'white', places: [], entrances: [djEntrance()], note: 'Kept separate from Jubilee Hall (L10).' },
  // L02, L03: the traditional main halls
  R('commonwealth', 'Commonwealth Hall', 'traditional', 'L02', 'white', ['Commonwealth Hall']),
  R('sarbah', 'Mensah Sarbah Hall', 'traditional', 'L02', 'white', ['Mensah Sarbah Hall'], { existingLodge: "the Administration and Porters' Lodge at the entrance (greathalls.ts, the owner's entrance photos)" }),
  R('volta', 'Volta Hall', 'traditional', 'L02', 'white', ['Volta Hall']),
  R('akuafo', 'Akuafo Hall', 'traditional', 'L03', 'white', ['Akuafo Hall Main']),
  R('legon', 'Legon Hall', 'traditional', 'L03', 'white', ['Legon Hall']),
  // L04, L05: New Pent and Old Pent, kept apart
  R('new-pent', 'New Pent', 'newpent', 'L04', 'white', ['New Pent Block A', 'New Pent Block B', 'New Pent Block C'], { blocks: [{ id: 'a', name: 'Block A' }, { id: 'b', name: 'Block B' }, { id: 'c', name: 'Block C' }] }),
  R('old-pent', 'Old Pent', 'oldpent', 'L05', 'white', ['Dar es Salaam Court', 'Nairobi Court', 'Kampala Court', 'Addis Ababa Court'], { note: 'The Pentagon courts are taken as the Old Pent buildings (project place names); confirm the alias.' }),
  R('evandy', 'Evandy Hostel', 'evandy', 'L06', 'cream', ['Evandy Hostel'], { blocks: [{ id: 'main', name: 'Main' }, { id: 'annex-a', name: 'Annex A' }, { id: 'annex-b', name: 'Annex B' }] }),
  R('bani', 'Bani Hostel', 'bani', 'L07', 'blue', ['Bani Hostel'], {
    blocks: [{ id: 'ordinary', name: 'Ordinary rooms' }, { id: 'abc', name: 'Blocks A, B, C' }, { id: 'annex', name: 'Annex' }, { id: 'adm', name: 'ADM201' }, { id: 'd', name: 'Block D' }, { id: 'admin', name: 'Admin block' }, { id: 'f', name: 'F rooms' }, { id: 'new', name: 'New Bani / Perseverance' }],
  }),
  R('tf', 'James Topp Nelson Yankah Hall (TF)', 'tf', 'L08', 'white', ['James Topp Nelson Yankah Hall']),
  R('ish-1', 'International Students Hostel 1', 'ish', 'L09', 'white', ['International Students Hostel 1, ISH 1']),
  R('ish-2', 'International Students Hostel 2', 'ish', 'L09', 'white', ['International Students Hostel 2, ISH 2']),
  R('jubilee', 'Jubilee Hall', 'jubilee', 'L10', 'white', ['Jubilee Hall'], { blocks: [{ id: 'main', name: 'Main hall' }, { id: 'w', name: 'W-block (converted)' }] }),
  R('valco-1', 'Valco Trust Hostel Phase 1', 'valco', 'L11', 'white', ['Valco Trust Hostel Phase 1']),
  R('valco-2', 'Valco Trust Hostel Phase 2', 'valco', 'L11', 'white', ['Valco Trust Hostel Phase 2']),
  R('vikings', 'Vikings Hall', 'vikings', 'L12', 'white', ['Mensah Sarbah Vikings Hostel']),
  // L13: the named annexes. The Volta annex has no lodge of its own (owner 2026-10-16): Volta Hall's lodge, at the main
  // hall's main entrance, serves it
  R('akuafo-annexes', 'Akuafo Hall annexes', 'annex', 'L13', 'white', ['Akuafo Hall Annex A', 'Akuafo Hall Annex B', 'Akuafo Hall Annex C', 'Akuafo Hall Annex D'], { blocks: [{ id: 'a', name: 'Annex A' }, { id: 'b', name: 'Annex B' }, { id: 'c', name: 'Annex C' }, { id: 'd', name: 'Annex D' }] }),
  R('sarbah-annexes', 'Mensah Sarbah annexes', 'annex', 'L13', 'white', ['Mensah Sarbah Annex A', 'Mensah Sarbah Annex B', 'Mensah Sarbah Annex C', 'Mensah Sarbah Annex D'], { blocks: [{ id: 'a', name: 'Annex A' }, { id: 'b', name: 'Annex B' }, { id: 'c', name: 'Annex C' }, { id: 'd', name: 'Annex D' }] }),
  R('legon-annexes', 'Legon Hall annexes', 'annex', 'L13', 'white', ['Legon Hall Annex A', 'Legon Hall Annex B', 'Legon Hall Annex C (Graduate Hostel)'], { blocks: [{ id: 'a', name: 'Annex A' }, { id: 'b', name: 'Annex B' }, { id: 'c', name: 'Annex C' }] }),
  R('volta-annex', 'Volta Hall Annex', 'annex', null, 'white', ['Volta Hall Annex'], { note: "No separate porter's lodge: Volta Hall's lodge at the main hall's main entrance serves the annex.", lodgeAt: 'volta' }),
];
export const residenceById = (id: string) => RESIDENCES.find((r) => r.id === id);
/** the residence a map place belongs to */
export const residenceOfPlace = (place: string) => RESIDENCES.find((r) => r.places.includes(place));

// ---------- the room-category catalogue (Volume A sections 17-21, Volume B pages 26-31) ----------
export type Bath = 'private' | 'shared' | 'unresolved';
export type Kitchen = 'private' | 'communal' | 'none' | 'unresolved';
export interface RoomCategory {
  id: string;
  label: string;
  catalogue: Catalogue;
  /** blocks it is offered in; absent: every block (or the building has none) */
  blocks?: string[];
  /** occupants, the player included */
  capacity: number;
  layout: string;
  /** a service module attached to the bedroom (S01 Pent services, S02 separated wet compartments, V2 the filmed Vikings
   *  double's wet area and balcony) */
  module?: 'S01' | 'S02' | 'V2';
  bath: Bath;
  kitchen: Kitchen;
  ac: 'with' | 'without' | 'unspecified';
  balcony?: boolean;
  /** the atlas's scale variants of one shell (Evandy singles) */
  scale?: number;
  /** brown wooden bed frames (traditional halls and their adaptations), overriding the layout's material */
  wood?: boolean;
  evidence: 'observed detail, inferred shell' | 'adapted';
  /** a source entry that cannot be chosen until its meaning is confirmed */
  unresolved?: string;
  note?: string;
}
const C = (c: RoomCategory) => c;
export const CATEGORIES: RoomCategory[] = [
  // New Pent: 1 AC / non-AC, 2 AC / non-AC, 4; en-suite (S01 services observed)
  C({ id: 'np-1-ac', label: 'Single, AC', catalogue: 'newpent', capacity: 1, layout: 'R01', module: 'S01', bath: 'private', kitchen: 'private', ac: 'with', evidence: 'observed detail, inferred shell' }),
  C({ id: 'np-1', label: 'Single, no AC', catalogue: 'newpent', capacity: 1, layout: 'R01', module: 'S01', bath: 'private', kitchen: 'private', ac: 'without', evidence: 'observed detail, inferred shell' }),
  C({ id: 'np-2-ac', label: 'Two in a room, AC', catalogue: 'newpent', capacity: 2, layout: 'R02', module: 'S01', bath: 'private', kitchen: 'private', ac: 'with', evidence: 'observed detail, inferred shell' }),
  C({ id: 'np-2', label: 'Two in a room, no AC', catalogue: 'newpent', capacity: 2, layout: 'R02', module: 'S01', bath: 'private', kitchen: 'private', ac: 'without', evidence: 'observed detail, inferred shell' }),
  C({ id: 'np-4', label: 'Four in a room', catalogue: 'newpent', capacity: 4, layout: 'R03', module: 'S01', bath: 'private', kitchen: 'private', ac: 'unspecified', evidence: 'observed detail, inferred shell', note: 'No AC choice is supplied for four.' }),
  // Old Pent: 2 / 4, no AC, shared facilities
  C({ id: 'op-2', label: 'Two in a room (shared facilities)', catalogue: 'oldpent', capacity: 2, layout: 'R02', bath: 'shared', kitchen: 'none', ac: 'without', evidence: 'adapted' }),
  C({ id: 'op-4', label: 'Four in a room (shared facilities)', catalogue: 'oldpent', capacity: 4, layout: 'R03', bath: 'shared', kitchen: 'none', ac: 'without', evidence: 'adapted' }),
  // the four listed Diaspora halls: 2 / 4 self-contained
  C({ id: 'dia-2', label: 'Two in a room, self-contained', catalogue: 'diaspora', capacity: 2, layout: 'R05', module: 'S02', bath: 'private', kitchen: 'none', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'dia-4', label: 'Four in a room, self-contained', catalogue: 'diaspora', capacity: 4, layout: 'R04', module: 'S02', bath: 'private', kitchen: 'none', ac: 'unspecified', evidence: 'observed detail, inferred shell' }),
  // Diamond Jubilee: 4; 2 en-suite; 1 en-suite; 1 shared
  C({ id: 'dj-4', label: 'Four in a room', catalogue: 'diamond', capacity: 4, layout: 'R06', bath: 'unresolved', kitchen: 'none', ac: 'unspecified', evidence: 'observed detail, inferred shell', note: 'The four-person bathroom arrangement is unknown.' }),
  C({ id: 'dj-2-ensuite', label: 'Two in a room, en-suite', catalogue: 'diamond', capacity: 2, layout: 'R05', module: 'S02', bath: 'private', kitchen: 'none', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'dj-1-ensuite', label: 'Single, en-suite', catalogue: 'diamond', capacity: 1, layout: 'R09', module: 'S02', bath: 'private', kitchen: 'none', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'dj-1-shared', label: 'Single, shared facilities', catalogue: 'diamond', capacity: 1, layout: 'R09', bath: 'shared', kitchen: 'none', ac: 'unspecified', evidence: 'adapted' }),
  // Vikings: 1; 2 without / with AC; 4. The double is the filmed V2 room (Vikings double correction, 2026-10-16): two
  // dark metal singles, paired desks, louvres both sides, cream cupboards, its own basin/shower area with a separate WC
  // and a room balcony with a drying rack. The fan or a missing unit does not say which AC category was filmed.
  C({ id: 'vk-1', label: 'Single', catalogue: 'vikings', capacity: 1, layout: 'R09', bath: 'unresolved', kitchen: 'none', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'vk-2', label: 'Two in a room, no AC', catalogue: 'vikings', capacity: 2, layout: 'R08', module: 'V2', bath: 'private', kitchen: 'none', ac: 'without', balcony: true, evidence: 'observed detail, inferred shell' }),
  C({ id: 'vk-2-ac', label: 'Two in a room, AC', catalogue: 'vikings', capacity: 2, layout: 'R08', module: 'V2', bath: 'private', kitchen: 'none', ac: 'with', balcony: true, evidence: 'observed detail, inferred shell', note: 'AC unit position is a game assumption.' }),
  C({ id: 'vk-4', label: 'Four in a room', catalogue: 'vikings', capacity: 4, layout: 'R07', bath: 'unresolved', kitchen: 'none', ac: 'unspecified', evidence: 'observed detail, inferred shell' }),
  // ISH 1 and ISH 2: ordinary single / double, shared; converted 2 / 3 / 4 / 8 (communal washrooms and kitchen)
  C({ id: 'ish-1', label: 'Single, shared facilities', catalogue: 'ish', capacity: 1, layout: 'R09', bath: 'shared', kitchen: 'communal', ac: 'unspecified', evidence: 'observed detail, inferred shell' }),
  C({ id: 'ish-2', label: 'Double, shared facilities', catalogue: 'ish', capacity: 2, layout: 'R10', bath: 'shared', kitchen: 'communal', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'ish-c2', label: 'Converted room, two', catalogue: 'ish', capacity: 2, layout: 'R10', bath: 'shared', kitchen: 'communal', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'ish-c3', label: 'Converted room, three', catalogue: 'ish', capacity: 3, layout: 'R11', bath: 'shared', kitchen: 'communal', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'ish-c4', label: 'Converted room, four', catalogue: 'ish', capacity: 4, layout: 'R12', bath: 'shared', kitchen: 'communal', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'ish-c8', label: 'Converted room, eight', catalogue: 'ish', capacity: 8, layout: 'R13', bath: 'shared', kitchen: 'communal', ac: 'unspecified', evidence: 'adapted' }),
  // the traditional main halls: 1 (small inner chamber) / 2 / 3 (two outer + one inner) / 4; brown wooden beds
  C({ id: 'trad-1', label: 'Single (small inner chamber)', catalogue: 'traditional', capacity: 1, layout: 'R14', bath: 'shared', kitchen: 'none', ac: 'unspecified', wood: true, evidence: 'adapted' }),
  C({ id: 'trad-2', label: 'Two in a room', catalogue: 'traditional', capacity: 2, layout: 'R15', bath: 'shared', kitchen: 'none', ac: 'unspecified', wood: true, evidence: 'adapted', note: 'Outer/inner sleeping split provisional: both beds outer, the inner a study.' }),
  C({ id: 'trad-3', label: 'Three in a room (two outer, one inner)', catalogue: 'traditional', capacity: 3, layout: 'R16', bath: 'shared', kitchen: 'none', ac: 'unspecified', wood: true, evidence: 'adapted' }),
  C({ id: 'trad-4', label: 'Four in a room', catalogue: 'traditional', capacity: 4, layout: 'R17', bath: 'shared', kitchen: 'none', ac: 'unspecified', wood: true, evidence: 'adapted', note: 'Outer/inner sleeping split provisional: both bunks outer, the inner a study.' }),
  // the named annexes: four, two brown wooden bunks
  C({ id: 'annex-4', label: 'Four in a room', catalogue: 'annex', capacity: 4, layout: 'R18', bath: 'shared', kitchen: 'none', ac: 'unspecified', wood: true, evidence: 'adapted' }),
  // Jubilee Hall: the traditional choices, a self-contained double, the "2-in-1" double, the W-block converted rooms
  C({ id: 'jub-1', label: 'Single (small inner chamber)', catalogue: 'jubilee', blocks: ['main'], capacity: 1, layout: 'R14', bath: 'shared', kitchen: 'none', ac: 'unspecified', wood: true, evidence: 'adapted' }),
  C({ id: 'jub-2', label: 'Two in a room (shared facilities)', catalogue: 'jubilee', blocks: ['main'], capacity: 2, layout: 'R15', bath: 'shared', kitchen: 'none', ac: 'unspecified', wood: true, evidence: 'adapted' }),
  C({ id: 'jub-3', label: 'Three in a room (two outer, one inner)', catalogue: 'jubilee', blocks: ['main'], capacity: 3, layout: 'R16', bath: 'shared', kitchen: 'none', ac: 'unspecified', wood: true, evidence: 'adapted' }),
  C({ id: 'jub-4', label: 'Four in a room', catalogue: 'jubilee', blocks: ['main'], capacity: 4, layout: 'R17', bath: 'shared', kitchen: 'none', ac: 'unspecified', wood: true, evidence: 'adapted' }),
  C({ id: 'jub-2-sc', label: 'Self-contained double', catalogue: 'jubilee', blocks: ['main'], capacity: 2, layout: 'R02', module: 'S02', bath: 'private', kitchen: 'none', ac: 'unspecified', wood: true, evidence: 'adapted' }),
  // "2-in-1" (owner 2026-10-16): the general two-person hostel room, two separate single beds; no flat or inner room
  C({ id: 'jub-2-in-1', label: 'Two in a room ("2-in-1")', catalogue: 'jubilee', blocks: ['main'], capacity: 2, layout: 'R02', bath: 'shared', kitchen: 'none', ac: 'unspecified', wood: true, evidence: 'adapted', note: 'The general two-person hostel room (R02), as the owner directed; brown wooden singles, as in the rest of Jubilee Hall.' }),
  C({ id: 'jub-w-3', label: 'Converted room, three', catalogue: 'jubilee', blocks: ['w'], capacity: 3, layout: 'R19', bath: 'shared', kitchen: 'none', ac: 'unspecified', wood: true, evidence: 'adapted' }),
  C({ id: 'jub-w-3-k', label: 'Converted room, three, with kitchenette', catalogue: 'jubilee', blocks: ['w'], capacity: 3, layout: 'R19', bath: 'shared', kitchen: 'private', ac: 'unspecified', wood: true, evidence: 'adapted' }),
  C({ id: 'jub-w-4', label: 'Converted room, four', catalogue: 'jubilee', blocks: ['w'], capacity: 4, layout: 'R18', bath: 'shared', kitchen: 'none', ac: 'unspecified', wood: true, evidence: 'adapted' }),
  C({ id: 'jub-w-4-k', label: 'Converted room, four, with kitchenette', catalogue: 'jubilee', blocks: ['w'], capacity: 4, layout: 'R18', bath: 'shared', kitchen: 'private', ac: 'unspecified', wood: true, evidence: 'adapted' }),
  C({ id: 'jub-w-5', label: 'Converted room, five', catalogue: 'jubilee', blocks: ['w'], capacity: 5, layout: 'R31', bath: 'shared', kitchen: 'none', ac: 'unspecified', wood: true, evidence: 'adapted' }),
  C({ id: 'jub-w-5-k', label: 'Converted room, five, with kitchenette', catalogue: 'jubilee', blocks: ['w'], capacity: 5, layout: 'R31', bath: 'shared', kitchen: 'private', ac: 'unspecified', wood: true, evidence: 'adapted' }),
  // Evandy (cream): the block matrix (Volume B page 30)
  C({ id: 'ev-2', label: 'Two in a room', catalogue: 'evandy', blocks: ['main', 'annex-a', 'annex-b'], capacity: 2, layout: 'R21', bath: 'unresolved', kitchen: 'unresolved', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'ev-3', label: 'Three in a room', catalogue: 'evandy', blocks: ['main', 'annex-a', 'annex-b'], capacity: 3, layout: 'R19', bath: 'unresolved', kitchen: 'unresolved', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'ev-3-inner', label: 'Three in a room with inner room', catalogue: 'evandy', blocks: ['main'], capacity: 3, layout: 'R16', bath: 'unresolved', kitchen: 'unresolved', ac: 'unspecified', wood: false, evidence: 'adapted', note: 'R16 geometry with cream walls; bed material unconfirmed (metal used).' }),
  C({ id: 'ev-4', label: 'Four in a room', catalogue: 'evandy', blocks: ['main', 'annex-b'], capacity: 4, layout: 'R22', bath: 'unresolved', kitchen: 'unresolved', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'ev-1-std', label: 'Single, standard', catalogue: 'evandy', blocks: ['main', 'annex-a', 'annex-b'], capacity: 1, layout: 'R20', bath: 'unresolved', kitchen: 'unresolved', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'ev-1-med-balcony', label: 'Single, medium, balcony with kitchenette', catalogue: 'evandy', blocks: ['main', 'annex-a'], capacity: 1, layout: 'R20', scale: 1.12, balcony: true, bath: 'unresolved', kitchen: 'private', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'ev-1-med', label: 'Single, medium, no balcony', catalogue: 'evandy', blocks: ['annex-a', 'annex-b'], capacity: 1, layout: 'R20', scale: 1.12, bath: 'unresolved', kitchen: 'unresolved', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'ev-1-small', label: 'Single, small, no balcony', catalogue: 'evandy', blocks: ['main'], capacity: 1, layout: 'R20', scale: 0.88, bath: 'unresolved', kitchen: 'unresolved', ac: 'unspecified', evidence: 'adapted' }),
  // Bani (blue): block-specific categories (Volume B page 31)
  C({ id: 'bani-4', label: 'Four, self-contained', catalogue: 'bani', blocks: ['ordinary'], capacity: 4, layout: 'R25', bath: 'private', kitchen: 'none', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'bani-2-abc', label: 'Two, self-contained', catalogue: 'bani', blocks: ['abc'], capacity: 2, layout: 'R24', bath: 'private', kitchen: 'none', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'bani-2-annex', label: 'Two, self-contained', catalogue: 'bani', blocks: ['annex'], capacity: 2, layout: 'R24', bath: 'private', kitchen: 'none', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'bani-2-adm201', label: 'Two, self-contained, AC and kitchen', catalogue: 'bani', blocks: ['adm'], capacity: 2, layout: 'R24', bath: 'private', kitchen: 'private', ac: 'with', evidence: 'adapted' }),
  C({ id: 'bani-1-d-middle', label: 'One, self-contained, shared kitchen (middle)', catalogue: 'bani', blocks: ['d'], capacity: 1, layout: 'R23', bath: 'private', kitchen: 'communal', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'bani-1-d-side', label: 'One, self-contained, shared kitchen (side-by-side)', catalogue: 'bani', blocks: ['d'], capacity: 1, layout: 'R23', bath: 'private', kitchen: 'communal', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'bani-1-cd-kitchen', label: 'One, self-contained, kitchen (Blocks C/D)', catalogue: 'bani', blocks: ['d', 'abc'], capacity: 1, layout: 'R23', bath: 'private', kitchen: 'private', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'bani-1-ab-kitchen', label: 'One, self-contained, kitchen (Blocks A/B)', catalogue: 'bani', blocks: ['abc'], capacity: 1, layout: 'R23', bath: 'private', kitchen: 'private', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'bani-1-admin', label: 'One, self-contained, shared kitchen', catalogue: 'bani', blocks: ['admin'], capacity: 1, layout: 'R23', bath: 'private', kitchen: 'communal', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'bani-1-f-shared', label: 'One, self-contained, shared kitchen (F202/F210)', catalogue: 'bani', blocks: ['f'], capacity: 1, layout: 'R23', bath: 'private', kitchen: 'communal', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'bani-1-f-ac-shared', label: 'One, self-contained, AC, shared kitchen (F203-F207)', catalogue: 'bani', blocks: ['f'], capacity: 1, layout: 'R23', bath: 'private', kitchen: 'communal', ac: 'with', evidence: 'adapted' }),
  C({ id: 'bani-1-f-ac-kitchen', label: 'One, self-contained, AC and kitchen (F105/F106/F201/F208)', catalogue: 'bani', blocks: ['f'], capacity: 1, layout: 'R23', bath: 'private', kitchen: 'private', ac: 'with', evidence: 'adapted' }),
  C({ id: 'bani-2-f101', label: 'Two, self-contained, kitchen (F101)', catalogue: 'bani', blocks: ['f'], capacity: 2, layout: 'R24', bath: 'private', kitchen: 'private', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'bani-4-new', label: 'Four, self-contained, balcony kitchenette', catalogue: 'bani', blocks: ['new'], capacity: 4, layout: 'R25', bath: 'private', kitchen: 'private', balcony: true, ac: 'unspecified', evidence: 'adapted' }),
  // Valco Trust, both phases: one / two study-bedrooms, en-suite; one communal kitchen per twelve rooms
  C({ id: 'valco-1', label: 'Single study-bedroom, en-suite', catalogue: 'valco', capacity: 1, layout: 'R26', bath: 'private', kitchen: 'communal', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'valco-2', label: 'Double study-bedroom, en-suite', catalogue: 'valco', capacity: 2, layout: 'R27', bath: 'private', kitchen: 'communal', ac: 'unspecified', evidence: 'adapted' }),
  // TF / James Topp Nelson Yankah: 2 SC; 4 SC; 4 / 6 / 8 shared (white rooms)
  C({ id: 'tf-2-sc', label: 'Two, self-contained', catalogue: 'tf', capacity: 2, layout: 'R02', module: 'S02', bath: 'private', kitchen: 'none', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'tf-4-sc', label: 'Four, self-contained', catalogue: 'tf', capacity: 4, layout: 'R28', module: 'S02', bath: 'private', kitchen: 'none', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'tf-4', label: 'Four, shared facilities', catalogue: 'tf', capacity: 4, layout: 'R28', bath: 'shared', kitchen: 'none', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'tf-6', label: 'Six, shared facilities', catalogue: 'tf', capacity: 6, layout: 'R29', bath: 'shared', kitchen: 'none', ac: 'unspecified', evidence: 'adapted' }),
  C({ id: 'tf-8', label: 'Eight, shared facilities', catalogue: 'tf', capacity: 8, layout: 'R30', bath: 'shared', kitchen: 'none', ac: 'unspecified', evidence: 'adapted' }),
];
export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id);
/** the categories a residence offers in a block (the unresolved ones included, so the menu can show them disabled) */
export const categoriesFor = (r: Residence, block?: string) =>
  CATEGORIES.filter((c) => c.catalogue === r.catalogue && (!c.blocks || !r.blocks || (block !== undefined && c.blocks.includes(block))));

// ---------- the player's accommodation ----------
export interface Accommodation {
  buildingId: string;
  blockId?: string;
  categoryId: string;
  /** stable private room ID, derived from the character and the selection (never random per visit) */
  roomId: string;
  /** Valco: the communal kitchen group (twelve room IDs per group) */
  kitchenGroupId?: string;
  /** the bed the player holds (0-based), and whether the room and bed are the server's shared allocation */
  bed?: number;
  shared?: boolean;
  v: 1;
}
/** checks a saved or chosen combination against the same catalogue the menus are built from */
export function validAccommodation(a: Partial<Accommodation> | null | undefined): a is Accommodation {
  if (!a || !a.buildingId || !a.categoryId) return false;
  const r = residenceById(a.buildingId), c = categoryById(a.categoryId);
  if (!r || !c || c.unresolved || c.catalogue !== r.catalogue) return false;
  if (r.blocks) { if (!a.blockId || !r.blocks.some((b) => b.id === a.blockId)) return false; if (c.blocks && !c.blocks.includes(a.blockId)) return false; }
  return true;
}
const hashStr = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
/** resolves the stable room for a character: the same character and selection always give the same room */
export function allocate(characterId: string, buildingId: string, categoryId: string, blockId?: string): Accommodation | null {
  const a: Partial<Accommodation> = { buildingId, categoryId, blockId, v: 1 };
  if (!validAccommodation(a)) return null;
  const r = residenceById(buildingId)!, h = hashStr(`${characterId}|${buildingId}|${blockId ?? ''}|${categoryId}`);
  const floor = 1 + (h % 3), num = 1 + ((h >>> 4) % 36);
  const prefix = (blockId ? blockId.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) : r.id.split('-').map((w) => w[0]).join('').toUpperCase()) || 'R';
  const roomId = `${prefix}${floor}${String(num).padStart(2, '0')}`;
  return { ...(a as Accommodation), roomId, ...(r.catalogue === 'valco' && { kitchenGroupId: `${r.id}-K${floor}${Math.floor((num - 1) / 12) + 1}` }) };
}
/** the sleeping places a layout provides: singles count one, bunks two */
export const sleepingPlaces = (l: Layout) => l.objects.reduce((n, o) => n + (o.type === 'bed' ? 1 : o.type === 'bunk' ? 2 : 0), 0);
