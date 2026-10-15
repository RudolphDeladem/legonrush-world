// Numbers for the Okponglo entrance (okgate.ts), from the owner's Okponglo entrance correction audit
// (docs/okponglo/gate/ledger.md): Google satellite M2 registered on the game map by New University Road, the N4 junction,
// the taxi lot's outline and the pavilion (x = 654 + (px - 75) / 3.3, z = 1232.5 + (py - 357) / 3.3; north up, no
// rotation); the gate photograph S04, the taxi lot S06, the plot S12/S14/S16, the stadium edge S02/S08/S10.
// Game metres, x east, z south.

export type P2 = [number, number];
export type R4 = [number, number, number, number];

/** Jubilee Drive's centre line through the work (the game road), west to east */
export const DRIVE: P2[] = [[690, 1231.6], [700, 1232], [711, 1233], [722, 1234], [802, 1240], [834, 1242], [865, 1239], [893, 1236], [923, 1232], [939, 1234], [966, 1232]];
/** the drive's centre z at x (linear between the nodes) */
export function driveZ(x: number) {
  for (let i = 1; i < DRIVE.length; i++) { const [ax, az] = DRIVE[i - 1], [bx, bz] = DRIVE[i]; if (x >= ax && x <= bx) return az + ((bz - az) * (x - ax)) / (bx - ax); }
  return x < DRIVE[0][0] ? DRIVE[0][1] : DRIVE[DRIVE.length - 1][1];
}
/** the drive's half width (the game's class-1 road) */
export const DRIVE_HALF = 3.7;

/** the gatehouse (S04; M2: its roof 12.7 m along the road, from 13.3 m north of the centre line to 11 m south): the
 *  site frame U along the road, V across it (positive south), origin on the centre line at the gate */
export const GATE = {
  origin: [705, 1232.4] as P2, axis: [0.9959, 0.0905] as P2,
  u: [-6.3, 6.3] as P2, v: [-13.3, 11] as P2,
  /** the north side rooms (white over the wine base, the round grille high on the approach faces, barred openings) */
  rooms: [-5.3, 5.3, -13.3, -5.6] as R4,
  /** the clear portal over the carriageway and its verges */
  portal: [-5.6, 4.6] as P2,
  /** the south bay under the roof: two slender round columns each side of the walk, the broad end pier */
  walk: [4.6, 8.4] as P2, pier: [-2.6, 2.6, 8.4, 11] as R4,
  wall: 5.2, beam: 6.5, eave: 0.7, pitch: 0.45,
};

/** the taxi lot (the game's parking area osm:way/1339325946, registered on M2): frame S along its front edge from the
 *  south-west corner, T back into the lot (north) */
export const LOT = {
  corner: [674.1, 1214.4] as P2, axis: [0.9952, 0.099] as P2, len: 107, depth: 30,
  /** bay rows (T from, T to, S from, S to): the front row and the middle double row (the aisles carry the lot's service
   *  roads at T 6 and T 26) */
  rows: [[0.6, 5.2, 2, 104], [11, 16, 3, 103], [16, 21, 3, 103]] as R4[],
  /** the kerbed tree islands across the middle rows (M2: the two crowns inside the lot) */
  islands: [[26.5, 31.5], [76.5, 81.5]] as P2[],
  /** where the lot's entry and cross road (the game's way through it, S 50) runs: no bays */
  gaps: [[46.5, 53.5]] as P2[],
  fill: 0.55,
};
/** the lot frame to the world */
export const lotWorld = (s: number, t: number): P2 => [LOT.corner[0] + LOT.axis[0] * s + LOT.axis[1] * t, LOT.corner[1] + LOT.axis[1] * s - LOT.axis[0] * t];

/** the open red-roof waiting pavilion at the lot's north-east corner (S06; M1/M2; the map's outline osm:way/1326372690) */
export const PAVILION: R4 = [772.3, 785.4, 1188.2, 1193.3];

/** the bare plot east of the lot (S12, S14, S16; M1 4, M2 9): reddish soil and dry grass with tracks, from the trees
 *  east of the lot to the N4's verge, back from the drive's north footway */
export const PLOT: P2[] = [[806, 1226], [806, 1150], [870, 1112], [952, 1112], [956, 1150], [956, 1222], [930, 1224], [893, 1228], [865, 1231], [834, 1234]];
/** the localized broadleaf groups over raised dry ground (S12-S16; M2 9's crowns) and the trees round the lot (M2) */
export const TREES: [number, number, number][] = [
  // the plot's tree group
  [872, 1172, 4.2], [880, 1166, 3.8], [889, 1170, 4.4], [898, 1175, 3.6], [906, 1168, 4], [915, 1173, 3.4], [884, 1180, 3.2],
  [862, 1189, 3.2], [869, 1196, 3.8], [879, 1200, 4.2], [890, 1195, 3.6], [900, 1199, 3.4],
  // the belt east of the lot (dense crowns on M1/M2)
  [792, 1186, 4.5], [800, 1196, 4.2], [796, 1206, 4], [806, 1182, 3.8], [812, 1200, 3.6],
  // the lot's front verge (between its front row and the drive), its island crowns, the trees west of it
  [688, 1221.6, 3.2], [731, 1226.2, 3.4], [745, 1227.6, 3], [760, 1229, 3.2], [771, 1230.2, 2.8],
  [704.5, 1201.4, 4.2], [754.3, 1206.3, 4],
  // the dense group south of the drive west of the gate (M2)
  [684, 1245, 4], [693, 1247, 4.4], [703, 1248, 3.8], [713, 1249, 4], [722, 1250, 3.6],
];
/** the palms the photographs show near the gate and the lot (S04 left of the gate; S06) */
export const PALMS: P2[] = [[694, 1219], [790, 1222]];

/** the stadium-side boundary fence along the drive's south verge (S02, S08, S10): light metal, behind a planted strip */
export const FENCE_S = { x0: 735, x1: 960, off: 9.5 };
/** the north footway (tan pavers) and the open channel behind it with crossing slabs at the lot's entries (S02, S04) */
export const WALK = { x0: 680, x1: 968, w: 2.2, drain: 0.9 };

/** the slim sign frame on the plot's verge by the stop (S12, S14, S16; its plate unreadable: left blank) */
export const SIGN_FRAME: P2 = [893.5, 1228.2];

/** where this work draws the drive's edges itself (the generic painted kerbs, lamps and street trees stay out) */
export function ownsOg(x: number, z: number) {
  if (x < 676 || x > 975 || z < 1105 || z > 1262) return false;
  const c = driveZ(x);
  return z > c - 130 && z < c + 14;
}

/** the taxi lot's cars in its bays (x, z, heading), deterministic: life.ts stands them there */
export function ogSpots(cx: number, cz: number): [number, number, number][] | undefined {
  if (cx < 674 || cx > 784 || cz < 1184 || cz > 1226) return undefined;
  const out: [number, number, number][] = [], yaw = -Math.atan2(LOT.axis[1], LOT.axis[0]);
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (const [t0, t1, s0, s1] of LOT.rows) for (let s = s0 + 1.3; s < s1 - 1.2; s += 2.6) {
    if (LOT.islands.some(([a, b]) => s > a - 1.9 && s < b + 1.9) || (LOT.gaps.some(([a, b]) => s > a - 1.3 && s < b + 1.3)) || rnd() > LOT.fill) continue;
    const [x, z] = lotWorld(s, (t0 + t1) / 2); out.push([x, z, yaw]);
  }
  return out;
}
