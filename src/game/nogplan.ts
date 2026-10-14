// Numbers for the Noguchi Memorial Institute for Medical Research and the West African Genetic Medicine Centre
// (nog.ts, the generic finishes in world.ts), from the owner's Noguchi + WAGMC brief (docs/noguchi-wagmc/). The Apple
// satellite views registered on the game map: M1 (close) at 2.617 px/m, x = 192.2 + px / 2.617, z = 1703.3 + py / 2.617;
// M2 (overall) at 2.242 px/m, x = 191.2 + px / 2.242, z = 1703.8 + py / 2.242; no rotation. Two site frames, each on its
// own grid (U along it, V across): Noguchi's (origin the old courtyard ring's centre) and WAGMC's (origin the circular
// island before its entrance). Heights: WAGMC two storeys (the drone frames W01-W49); Noguchi's laboratory relative to its
// photographs N01-N07; the satellite-only buildings provisional (docs/noguchi-wagmc/evidence-ledger.md).

export type P2 = [number, number];
export type R4 = [number, number, number, number];

const frame = (origin: P2, deg: number) => {
  const a = (deg * Math.PI) / 180, ux = Math.cos(a), uz = Math.sin(a);
  return {
    origin, axis: [ux, uz] as P2, yaw: Math.atan2(-uz, ux),
    world: (u: number, v: number): P2 => [origin[0] + ux * u - uz * v, origin[1] + uz * u + ux * v],
    local: (x: number, z: number): P2 => [(x - origin[0]) * ux + (z - origin[1]) * uz, -(x - origin[0]) * uz + (z - origin[1]) * ux],
  };
};
/** Noguchi's frame: origin at the courtyard ring's centre, U along the ring's north side */
export const NG = frame([416.9, 1943.3], -15);
/** WAGMC's frame: origin at the circular island, U from the building toward it */
export const WG = frame([290.3, 1891.2], -27);

// ---------- WAGMC ----------
/** the U: two forward wings, the base with the portal between them, the rear extension, the small flat service
 *  enclosure; two storeys under red-brown hipped roofs with dark fascias (W18, W34, W40-W45) */
export const WAG = {
  north: [-56, -19, -25, -11] as R4, south: [-62, -19, 12, 26] as R4, base: [-50, -36, -11, 12] as R4, rear: [-68, -50, -5, 15] as R4,
  service: [-66, -60, -27, -21] as R4, floors: 2, storey: 3.6,
  /** the thick white portal frame on the base's court face, the pale entry platform, the salmon forecourt */
  portal: [-36, -32.5, -6.5, 6.5] as R4, platform: [-32.5, -29, -5, 5] as R4, forecourt: [-29, -16, -7, 7] as R4,
  /** the low planted plots either side of the forecourt (light kerbs) and the tree in the north one (W18 #5) */
  plots: [[-34, -18, -11, -7.5], [-34, -18, 7.5, 12]] as R4[], tree: [-24, -9.3] as P2,
  /** the circular planted island in its low pale kerb (W40-W45) */
  island: { c: [0, -1.2] as P2, r: 4.6 },
  /** the boundary wall and its openings (the front drive; where the mapped service road crosses: assumption) */
  wall: [-78, 18, -38, 37] as R4, gaps: { north: [-8, 16] as P2, east: [3, 21] as P2, south: [[-41, -27], [3, 14]] as P2[] },
  gate: [13.6, 17.4, -35.5, -31] as R4,
  /** the open metal-framed shade structures over the parking beside the wing ends */
  shelters: [[-21, -14, -26, -17], [-21, -14, 17, 26]] as R4[],
  /** the asphalt drive from the main road to the island, and the parking round it */
  drive: [-8, 16, -38, 31] as R4,
  lawn: [-70, -16, -34, -26] as R4,
  lamps: [[-20, -9.5], [-20, 9.6], [-6, -18], [3, -32], [-12, 16]] as P2[],
};
export const WAG_OUTLINE: P2[] = [[-56, -25], [-19, -25], [-19, -11], [-36, -11], [-36, 12], [-19, 12], [-19, 26], [-62, 26], [-62, 15], [-68, 15], [-68, -5], [-50, -5], [-50, -11], [-56, -11]];

// ---------- Noguchi ----------
/** 03 the old square courtyard complex: the dark pitched-roof ring round an open court, the small central hipped
 *  pavilion, the entry link east to the curved loop (M1, M2; no side elevations: height provisional) */
export const RING = { outer: 44, outerV: [-43, 44] as P2, band: 14, floors: 2, storey: 3.5, pavilion: [-6, 8, -9, 6] as R4, link: [44, 56, -11.7, -5] as R4 };
/** 02 the Advanced Research Laboratories (N01-N07): the long hipped wing with white piers, the white entrance frame at its
 *  west end, the taller signed east end with stairs and balconies, the pale flat service block behind, the west arm */
export const LAB = {
  front: [125.5, 182, -143, -129] as R4, end: [182, 201, -143, -118] as R4, service: [142, 182, -129, -118] as R4, arm: [125.5, 142, -129, -86] as R4,
  storey: 4.2, endFloors: 4, frame: [126.5, 139] as P2,
  /** the freestanding sign in its kerbed island on the approach (N02) */
  island: [88.5, 117.5, -141.3, -122.8] as R4, sign: [108, -133] as P2,
};
export const LAB_OUTLINE: P2[] = [[125.5, -143], [201, -143], [201, -118], [142, -118], [142, -86], [125.5, -86]];
/** 04 the small red courtyard building: a ring round its open green centre (never filled) */
export const RED04 = { outer: [-6, 39.5, -144, -115] as R4, court: [7, 27, -135, -124] as R4 };
/** 17 / 18 the two gridded fields of repeated dark panels in rows with pale aisles (resemble ground-mounted panel
 *  arrays; the function is inferred, not verified) */
export const ARRAYS: { r: R4; rows: number }[] = [
  { r: [160, 221, 66, 116], rows: 9 }, { r: [224, 253, 66, 116], rows: 9 }, { r: [213, 243, 120, 153], rows: 6 }, { r: [110, 157, 121, 196], rows: 13 },
];
/** 21 the small red shed in the open lawn (M2; no mapped outline) */
export const SHED21 = [146, 150, 13, 17] as R4;
/** the block-paved parking north and east of the laboratory (N06: grey-beige blocks, white bays) */
export const NOG_LOTS: { name: string; ring: P2[]; rows: { v: P2; u: P2; face: 1 | -1 }[]; across?: boolean; fill: number }[] = [
  { name: 'noguchi-lab-north', ring: [[94, -168], [236, -168], [236, -155], [94, -155]], fill: 0.5, rows: [{ v: [-166, -161], u: [96, 234], face: 1 }] },
  { name: 'noguchi-lab-east', ring: [[203, -146], [216.4, -146], [216.4, -100], [203, -100]], fill: 0.45, across: true, rows: [{ v: [-144, -102], u: [204, 209], face: 1 }, { v: [-144, -102], u: [210.6, 215.6], face: -1 }] },
];
export const WAG_LOTS: { name: string; ring: P2[]; rows: { v: P2; u: P2; face: 1 | -1 }[]; across?: boolean; fill: number }[] = [
  { name: 'wagmc-south', ring: [[-16, 13], [-3, 13], [-3, 23], [-16, 23]], fill: 0.6, rows: [{ v: [17, 22], u: [-15, -4], face: 1 }] },
  { name: 'wagmc-north', ring: [[-6, -34], [14, -34], [14, -14], [-6, -14]], fill: 0.5, across: true, rows: [{ v: [-32, -16], u: [8.5, 13.5], face: -1 }] },
];

/** generic finishes for the surrounding small buildings (the brief's register 05-24, roof colours from M1/M2): a point
 *  inside each mapped outline, in Noguchi's frame */
export const NOG_FINISH: { at: P2; roof: string; wall?: string; flat?: boolean; storeys?: number }[] = [
  { at: [-32, -130], roof: '#d48a6a', storeys: 1 },                 // 05 salmon hipped roof
  { at: [-68, -118], roof: '#cdc7bb', storeys: 1 },                 // 06 pale L
  { at: [12, -61], roof: '#7c7f83', storeys: 2 },                   // 07 grey rectangle
  { at: [-22, 70], roof: '#8a8079', storeys: 1 },                   // 09 small hip below the ring
  { at: [20, 83], roof: '#7e8285', storeys: 1 },                    // 10 grey long roof
  { at: [110, -86], roof: '#d8d5cb', storeys: 2, flat: true },      // 11 pale compact block
  { at: [115, -48], roof: '#a9c4a0', storeys: 1 },                  // 12 pale green roof
  { at: [168, -55], roof: '#c27a43', storeys: 1 },                  // 13 orange roof
  { at: [200, -60], roof: '#9a9c9c', storeys: 1 },                  // 13 nearby units
  { at: [190, -50], roof: '#9a9c9c', storeys: 1 },
  { at: [146, -6], roof: '#76716c', storeys: 1 },                   // 14 grey hip by the loop
  { at: [189, -157], roof: '#d6d7d4', storeys: 1, flat: true },     // 15 entry-side unit
  { at: [235, -108], roof: '#3e4144', storeys: 1 },                 // 16 slim dark roof
  { at: [232, -137], roof: '#55585b', storeys: 1 },
  { at: [-18, 137], roof: '#b0442f', storeys: 1 },                  // 19 lower red roof
  { at: [114, 116], roof: '#b5452f', storeys: 1 },                  // 20 narrow red shed
  { at: [155, 96], roof: '#b5452f', storeys: 1 },                   // 24 shed beside the upper field
  { at: [-48, 96], roof: '#7f98ad', storeys: 1 },                   // 23 small blue / pale / grey roofs
  { at: [-46, 142], roof: '#b9bcbd', storeys: 1 },
  // 08 the mixed-roof compound beside WAGMC: red, greenish and weathered grey low roofs
  { at: [-80, -5], roof: '#a8432f', storeys: 1 }, { at: [-110, -26], roof: '#6f8f78', storeys: 1 }, { at: [-95, -18], roof: '#8c8f8f', storeys: 1 },
  { at: [-108, 2], roof: '#a14a35', storeys: 1 },
];

type Lot = (typeof NOG_LOTS)[number];
/** car spots in a lot of a frame (site frame u, v, heading: 0 lengthwise along V) */
function spots(l: Lot): [number, number, number][] {
  const out: [number, number, number][] = [];
  let seed = l.name.length * 613;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (const r of l.rows) {
    if (l.across) { for (let v = r.v[0] + 1.3; v < r.v[1] - 1.2; v += 2.6) if (rnd() < l.fill) out.push([(r.u[0] + r.u[1]) / 2, v, r.face > 0 ? Math.PI / 2 : -Math.PI / 2]); continue; }
    for (let u = r.u[0] + 1.3; u < r.u[1] - 1.2; u += 2.6) if (rnd() < l.fill) out.push([u, (r.v[0] + r.v[1]) / 2, r.face > 0 ? 0 : Math.PI]);
  }
  return out;
}
const inRect = (ring: P2[], u: number, v: number) => { const us = ring.map((p) => p[0]), vs = ring.map((p) => p[1]); return u > Math.min(...us) && u < Math.max(...us) && v > Math.min(...vs) && v < Math.max(...vs); };
/** the Noguchi and WAGMC lots' car spots in the world (x, z, heading), for life.ts */
export function nogSpots(x: number, z: number): [number, number, number][] | undefined {
  for (const [F, lots] of [[NG, NOG_LOTS], [WG, WAG_LOTS]] as const) {
    const [u, v] = F.local(x, z), l = lots.find((o) => inRect(o.ring, u, v));
    if (l) return spots(l).map(([a, b, h]) => { const [wx, wz] = F.world(a, b); return [wx, wz, h + F.yaw]; });
  }
  return undefined;
}
