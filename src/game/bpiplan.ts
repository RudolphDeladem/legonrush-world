// The owner's Bani Hostel, PRESEC and IPS Road brief (Bani_PRESEC_IPS_Detailed_Claude_Brief: 20 pairs, R1-R4, G1;
// docs/bani-presec-ips/evidence-audit.md): the numbers banipresec.ts models and the route tests check. Game metres: x
// east, z south. The roads and outlines are the map's (ids kept); the aerials R1-R4 were fitted to them by the mapped
// carriageways, the station roads, the GOIL roofs and the Bani outlines; the street pairs set appearance, heights and
// the order of things along the road. Spots marked "inferred" are read from the photographs, not measured.
import { NODE_XZ, ROADS } from './campusmap';

type Line = [number, number][];
/** the mapped polyline of a road named `name` passing nearest (px, pz) */
function lineNear(name: string, px: number, pz: number): Line {
  let best: Line = [], bd = Infinity;
  for (const r of ROADS) {
    if (r.name !== name) continue;
    const p = r.nodes.map((n) => [NODE_XZ[n * 2], NODE_XZ[n * 2 + 1]] as [number, number]);
    for (let i = 0; i < p.length - 1; i++) {
      const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2));
      const d = Math.hypot(ax + dx * t - px, az + dz * t - pz);
      if (d < bd) { bd = d; best = p; }
    }
  }
  return best;
}
/** x of a north-south line at z (the nearest end beyond it) */
export function xOn(line: Line, z: number) {
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, az] = line[i], [bx, bz] = line[i + 1];
    if ((z - az) * (z - bz) <= 0 && az !== bz) return ax + ((bx - ax) * (z - az)) / (bz - az);
  }
  const [ax, az] = line[0], [bx, bz] = line[line.length - 1];
  return Math.abs(z - az) < Math.abs(z - bz) ? ax : bx;
}
/** J.J. Rawlings Avenue (N4; the screenshots' "Legon E Rd" and, on R1/R3, the misplaced "IPS ROAD" label): the
 *  southbound carriageway on the west, the northbound on the east */
export const AV_W = lineNear('J.J. Rawlings Avenue', 941, -928);
export const AV_E = lineNear('J.J. Rawlings Avenue', 946, -857);
export const AV_E2 = lineNear('J.J. Rawlings Avenue', 1017, -1146);
export const xW = (z: number) => xOn(AV_W, z), xE = (z: number) => (z < -1091 ? xOn(AV_E2, z) : xOn(AV_E, z));
/** a carriageway's half width as drawn (main road class) */
export const AV_HALF = 3.5;
/** the avenue's direction (unit, northward) near z */
export function avDir(z: number): [number, number] {
  const dx = xW(z - 5) - xW(z + 5), dz = -10, l = Math.hypot(dx, dz);
  return [dx / l, dz / l];
}

// ---------- R2, Pairs 1-6: the Shell frontage near Pent, the open parcels, the UGBS side ----------
/** the Shell pylon by the road at the forecourt's way in (Pair 1: in front of the canopy, near the road edge) */
export const SHELL_PYLON = { x: 812.5, z: -603 };
/** the paved forecourt from the canopy out to the avenue's walk, the planted strip with its low kerb along the road
 *  (Pair 1: no lawn setback); between the station's south road and the tyre shop */
export const SHELL_FRONT: Line = [[771.5, -621], [796, -621], [812, -626], [837.5, -626], [821, -581], [792.6, -581], [792.6, -585.2], [771.5, -585.2]];
/** the mature palm with the broad drooping crown beside the walk north of the station (Pair 2) */
export const PALM: [number, number] = [818.5, -607];
/** the skeletal billboard frame farther along the west frontage (Pair 2): open bracing, no panel */
export const FRAME = { x: 810, z: -656, ry: 1.2, w: 7.5, h: 5.5, up: 4.5 };
/** the tall billboard seen edge-on by the walk (Pair 5; R2's square mark), a tall portrait panel on a slim mast */
export const TALL_BB = { x: 867, z: -748.5, ry: 0.62, w: 3.4, h: 11, up: 3 };
/** the lattice towers of the line crossing the open parcel (Pairs 3, 4, 5 sightlines cross here; inferred), joined to
 *  the tower on the UGBS side (upsaplan.ts TOWERS) */
export const TOWERS_W: [number, number][] = [[825, -699], [690, -692]];
/** the distribution poles with crossarms along the west verge (Pairs 1-4: wires along the road; spacing inferred) */
export const POLES_W: number[] = [-615, -655, -695, -735, -775, -815];
export const POLE_OFF = 7.5;
/** billboards on their own supports along the corridor (Pairs 3, 6, 7: a sequence on both verges and the median;
 *  inferred spots, artwork not copied): x, z, facing yaw, width, height, height of the panel's foot */
export const BOARDS: [number, number, number, number, number, number][] = [
  [866.5, -712, -0.3, 3.2, 4.2, 3.2], [885.5, -768, -0.3, 6.4, 3.2, 4.6], [900.5, -806, -0.35, 3.0, 4.0, 3.0],
  [913, -842, -0.35, 6.0, 3.0, 4.2], [926, -821, -0.35, 3.2, 4.4, 3.4], [925, -798, 2.8, 6.4, 3.2, 4.6],
];
/** the new UGBS graduate building south of the red-roof Graduate Block (the owner's Okponglo signals and UGBS brief:
 *  picture 9 registered on the game by the old block's outline, x = 1002 + (px - 385) / 3.73, z = -751 + (py - 195) / 3.73;
 *  pictures 7/8 for its current finish). It replaces the provisional unroofed frame an earlier brief placed 45 m west
 *  (ugbsnew.ts). The site: the building's working ground and the yard east of it inside the boundary */
export const UGBS_NEW = {
  /** the rounded wing: its centre and half axes (convex, projecting west) */
  round: { c: [975, -656] as [number, number], rx: 14, rz: 12.5, east: 988 },
  core: [988, 998, -672, -650] as [number, number, number, number],
  north: [997, 1022, -677, -656] as [number, number, number, number],
  south: [989, 1025, -650, -632] as [number, number, number, number],
  site: [940, 1150, -693, -612] as [number, number, number, number],
};
export const inUgbsSite = (x: number, z: number, pad = 0) => { const [a, b, c, d] = UGBS_NEW.site; return x > a - pad && x < b + pad && z > c - pad && z < d + pad; };
/** the open scrub and soil west of the avenue between the station and the Pent blocks, and east of it by the UGBS
 *  side (R2; Pairs 2-6) */
export const SCRUB_W: [number, number, number, number] = [745, 900, -805, -598];
export const SCRUB_E: [number, number, number, number] = [895, 1000, -700, -560];

// ---------- R1/R3, Pairs 7-10: the IPS Road junction and the GOIL corner ----------
/** the overhead signal arm on the approach from the south (Pair 7): its mast in the median, the arm over the
 *  southbound carriageway, four heads (facing south) */
export const SIG_IPS = { x: 938.7, z: -870, armTo: 926, heads: 4, yaw: 0 };
/** the corner between the slip road and the GOIL access (Pairs 8, 9; R3): the block-paved walk along the slip road, the
 *  stone-lined open drain beside it with the short crossing slab, the white cabinets, the exposed rust-coloured frame
 *  with its shallow roof pieces, the covered stall roof, the tall mast */
export const CORNER = {
  walk: [[969.5, -944], [969, -930], [970.5, -916], [975.5, -903], [984, -894]] as Line,
  drainOff: 2.6, walkW: 2.2, drainW: 0.9, slab: 1,
  cabinets: [[979.4, -921.5], [980.9, -920.3], [982.4, -919.1]] as [number, number][],
  frame: [983, 989, -915, -909] as [number, number, number, number],
  stall: [985.5, 994.5, -931.5, -924.5] as [number, number, number, number],
  kiosks: [[981, -955.5, 0.25], [985.5, -958, 0.25], [990.5, -950.5, 1.3]] as [number, number, number][],
  umbrellas: [[973.2, -935.8, '#f2c21a'], [979.5, -949, '#2e8fd0'], [988, -946.5, '#f2c21a']] as [number, number, string][],
  mast: [979.5, -911.5] as [number, number],
  trees: [[991, -905, 8.5, 9], [995, -938, 9, 10], [979.5, -945.5, 6, 6]] as [number, number, number, number][],
  boards: [[987, -899.5, 2.3, 5.2, 4.4, 4.6], [979, -906, 2.5, 3.0, 4.0, 3.4], [998.5, -918, 2.2, 6.4, 3.2, 5.0]] as [number, number, number, number, number, number][],
};
/** the roadside trading ground east of the corner to the GOIL forecourt (Pair 9; R3): compacted soil and paving */
export const TRADE = [966, 1032, -962, -888] as [number, number, number, number];
/** the large pale concrete roadside shelter at the "UPS" stop (Pair 10; R3): its deep roof slab, the rounded wall at
 *  its south end, the shaped support wall; the tall portrait billboard behind it, the horizontal board farther north */
export const SHELTER = { z: -985, off: 9.5, len: 13, depth: 4.2, h: 3.6, slab: 0.55, over: 1.8 };
export const SHELTER_BB = { z: -991, off: 15, w: 4.2, h: 6.5, up: 6.2 };
export const AHEAD_BB = { z: -1032, off: 13, w: 9, h: 3.4, up: 6.4 };

// ---------- R4, Pairs 11-20: the PRESEC junction and gate, the Bani side ----------
/** the overhead signal arms at the PRESEC / Bani junction (Pairs 11, 20): one on the median south of the junction over
 *  the northbound lanes (heads facing south), one north of it over the southbound lanes (heads facing north) */
export const SIG_PJ = [
  { x: 999.5, z: -1163, armTo: 1024, heads: 3, yaw: 0 },
  { x: 1007, z: -1207, armTo: 991.5, heads: 3, yaw: Math.PI },
];
/** PRESEC's gate where its entry road (the map's road from (1023, -1174)) crosses the school boundary (osm:way/339022268):
 *  the pale span with PRESEC on it on red piers; the splayed wing walls with the school's name; the blue stepped plinth
 *  before the north wing; the white boundary wall along the avenue; the stone-faced raised verges and the walks */
// (the owner's second corrections, A10/A11: the gate taller and wider than first built, its clear opening over the
// entry road and both walks; the proportions are read from the Street View, not measured)
export const GATE = { x: 1040, z: -1170.6, dir: [0.98, 0.196] as [number, number], open: 12.2, h: 6.3 };
export const WING = 12;
export const WALL_N: Line = [[1033.4, -1186.4], [1046, -1235], [1059, -1286]];
export const WALL_S: Line = [[1029.6, -1156.4], [1029, -1127], [1023, -1128], [1005, -1076]];
export const WALL_H = 2.3;
/** the portrait boards by the entry road (Pair 12; artwork not copied) */
export const PJ_BOARDS: [number, number, number][] = [[1025.9, -1166.5, -1.9], [1028.2, -1165.2, -1.9], [1030.5, -1163.9, -1.9]];
/** the Bani blocks by the avenue (R4 outlines; storeys from the visible floor bands): the larger cream block with the
 *  dark red hip roof (Pairs 15, 16, 18) and, west of it, the peach and pale block with the weathered tiled roof seen
 *  over the low wall (Pair 19; pale in Pair 18's distance). The four Bani Hostel blocks farther west (osm:way/1186044050,
 *  1186044051, 1184497715, 1184497716) are in no pair: they keep the generic model (their heights unverified) */
export const BANI_CREAM = { id: 'osm:way/1334286313', pt: [930, -1240] as [number, number], floors: 5 };
// (the owner's Bani brief: both right-hand blocks are the plain white family, ground plus four upper tiers)
export const BANI_PEACH = { id: 'osm:way/1334286314', pt: [885, -1240] as [number, number], floors: 5 };
/** the side road opposite PRESEC (the map's road at z -1196 from the avenue west into Bani): its dusty mouth, the low
 *  grey block wall along its north side with the small boards on posts (Pair 19), the shaded gathering ground under the
 *  trees at the mouth's north corner (Pairs 16-18), the two small sheds on its south side (R4: they replace a
 *  machine-detected 38 m bar, excluded) */
export const SIDE_Z = -1195.8;
export const LOW_WALL: [number, number] = [868, 952];
export const SIDE_BOARDS = [878, 889, 902, 915, 931];
export const GATHER = [960, 984, -1214, -1201] as [number, number, number, number];
export const SHEDS: [number, number, number, number][] = [[907, 919.5, -1185.6, -1181.6], [932.5, 944.8, -1185.2, -1180.8]];
/** the elevated Peugeot-style billboard over the corridor north of the junction (Pairs 15, 16; R4's long thin roof) */
export const BIG_BB = { x: 984.5, z: -1258, w: 13, h: 4.2, up: 8.5, yaw: 0.2 };
/** the low roadside shops and the "Presec" stop's shelter on the west verge (Pair 20): blue-toned and poster-covered */
export const ROADSIDE: { z: number; len: number; kind: 'shelter' | 'kiosk' }[] = [
  { z: -1104, len: 6.5, kind: 'shelter' }, { z: -1121, len: 4, kind: 'kiosk' }, { z: -1127, len: 4.6, kind: 'kiosk' }, { z: -1133.5, len: 3.6, kind: 'kiosk' },
];
export const ROADSIDE_OFF = 10;

/** the transport places whose generic shuttle shelter this brief replaces (life.ts skips them): the concrete shelter at
 *  "UPS" (Pair 10), the open trading corner at "UPSA Taxi Rank" (Pairs 8, 9: no standard shelter there), the roadside
 *  shelter at "Presec" (Pair 20) */
// (Legon Taxi Rank and the two stops on Jubilee Drive by it: the Okponglo entrance audit, okgate.ts: no shuttle shelter,
// the open plot's verge has only a slim sign frame)
export const MODELLED_STOPS = ['UPS', 'UPSA Taxi Rank', 'Presec', 'Legon Taxi Rank', 'Legon Traffic Light', 'Legon (near Emporium Pharmacy)'];

/** the solids these models put beside the ride, for the route checks: x, z, radius */
export function bpiPosts(): [number, number, number][] {
  const out: [number, number, number][] = [];
  out.push([SHELL_PYLON.x, SHELL_PYLON.z, 0.9], [PALM[0], PALM[1], 0.4], [FRAME.x, FRAME.z, 0.4], [TALL_BB.x, TALL_BB.z, 0.5]);
  for (const [x, z] of TOWERS_W) out.push([x, z, 3.2]);
  for (const z of POLES_W) out.push([xW(z) - POLE_OFF, z, 0.2]);
  for (const [x, z] of BOARDS) out.push([x, z, 0.4]);
  out.push([SIG_IPS.x, SIG_IPS.z, 0.3], [CORNER.mast[0], CORNER.mast[1], 0.35]);
  for (const [x, z] of CORNER.boards) out.push([x, z, 0.35]);
  for (const s of SIG_PJ) out.push([s.x, s.z, 0.3]);
  for (const [x, z] of PJ_BOARDS) out.push([x, z, 0.3]);
  out.push([BIG_BB.x, BIG_BB.z, 0.6]);
  return out;
}
