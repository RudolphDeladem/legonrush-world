// The owner's UPSA landmark pack (LEGONRUSH_UPSA_Landmark_Reconstruction_Brief; docs/upsa-landmarks/evidence-audit.md):
// the numbers upsalandmarks.ts models and the route tests check. Game metres: x east, z south. Every position is a mapped
// outline of the UPSA extension (OpenStreetMap, ids kept) or a point of a mapped walk; the photographs set appearance and
// proportion only. Heights and the splits inside an outline are read from the photographs: estimates, not measurements.
import { GATE } from './upsacampusplan';

/** the new Main Entrance on the gate's outline (osm:way/1009392399; G-01 ... G-04): a white square-tiled portal. Its west
 *  side is a quarter arch sweeping from the ground at the outline's west edge (foot) up to the header (apex), the inner
 *  edge of the band from footIn; a deep soffit at `soffit` with skylights under the header, the header's top at `top`;
 *  the tall tiled block with the blue windows on the east (east ... x1); a security booth under the arch west of the road
 *  (`booth`). The road's opening (GATE.clear) stays open its whole height. */
export const PORTAL = {
  x0: GATE.x0, x1: GATE.x1, zS: -906.8, zN: -919.3,
  foot: 2280.1, footIn: 2282.4, apex: 2289.6, east: 2297.5,
  soffit: 7.2, top: 10.2, fin: 0.5,
  booth: [2283.5, 2284.9, -916.0, -909.8] as [number, number, number, number],
};
/** the inner edge of the arch's band: its height above the ground at x (0 west of the foot, the soffit east of the apex) */
export function archInner(x: number) {
  const a = PORTAL.apex - PORTAL.footIn, d = PORTAL.apex - x;
  if (d <= 0) return PORTAL.soffit;
  if (d >= a) return 0;
  return PORTAL.soffit * Math.sqrt(1 - (d / a) ** 2);
}

/** Kofi Ohene-Konadu Auditorium (osm:way/1009392441): the auditorium hall between two tall white tiled side masses, the
 *  lobby in front of it under the broad convex blue glass curtain wall (its arc through the outline's south bulge), the
 *  dark-column entrance recessed beneath; the paved forecourt before it to the walk along the quadrangle's north side */
export const KOKA = {
  west: [2347.0, 2357.2, -1224.6, -1174.9] as [number, number, number, number],
  east: [2395.5, 2404.2, -1224.0, -1173.9] as [number, number, number, number],
  hall: [2357.2, 2395.5, -1224.3, -1174.8] as [number, number, number, number],
  /** the glass arc: its centre and radius, its half angle (from the chord's ends at x 2357.4 and 2395.3) */
  arc: { x: 2376.35, z: -1215.45, r: 51.7, half: 0.375 },
  /** the glazed entrance wall set back under the curtain wall */
  door: -1170.5,
  plaza: [2349, 2402, -1163, -1142] as [number, number, number, number],
  sideH: 23.5, hallH: 19, lobbyH: 20.2, glass0: 8.4,
};
export const kokaArc = (t: number): [number, number] => [KOKA.arc.x + KOKA.arc.r * Math.sin(t), KOKA.arc.z + KOKA.arc.r * Math.cos(t)];

/** the fountain at the middle of the quadrangle in front of KOKA (the court photographs and the pack's aerials): in the
 *  diamond where the mapped walks meet (osm footways round 2318, -1106); its stepped orange rim, its pebble ring */
export const FOUNTAIN = { x: 2318.0, z: -1105.1, rim: 3.9, pebbles: 4.4 };
/** the "We love UPSA" letters on the lawn north-east of the fountain, toward KOKA (the court photographs) */
export const LOVE_SIGN = { x: 2335.5, z: -1119.5, ry: -0.64 };
/** benches along the quadrangle's walks and lamp posts round the court (spots inferred from the photographs) */
export const BENCHES: [number, number, number][] = [
  [2300, -1108.8, 0], [2335, -1107.4, 0], [2300, -1103.4, 0], [2335, -1102.0, 0],
  [2321.2, -1121, Math.PI / 2], [2305, -1125.5, 0], [2331, -1124.5, 0], [2356, -1123.6, 0],
];
export const LAMPS: [number, number][] = [[2352.5, -1160], [2398.5, -1160], [2352.5, -1146], [2398.5, -1146], [2324, -1098.5], [2311.5, -1113.5]];

/** the Justice Aryeetey Building: the academic core block next to KOKA (osm:relation/13514869, upsacampusplan.ts CORE),
 *  six storeys round two courtyards; its long west front faces the quadrangle with the main entrance and the central
 *  blue circulation bay with its arched cap at the mapped drive (CORE.door), the broad blue strips along it */
export const JA = {
  x0: 2388.7, x1: 2435.9, z0: -1152.9, z1: -1084.3,
  courts: [[2407.9, 2425.4, -1111.3, -1099.4], [2407.8, 2425.8, -1140.1, -1126.0]] as [number, number, number, number][],
  floors: 6, storey: 3.4, bay: -1114.7,
  strips: [-1146.5, -1134.5, -1124.5, -1104.9, -1095, -1089.5],
};

/** the Opoku Ampomah Building / Central Administration Block (osm:way/1009392440): the round drum (centre, radius from
 *  its west front), its convex front toward the car park on the west, the curved blue glass band on the upper floors
 *  between the angles a0 ... a1 (measured from +x, toward +z), the wings joined to it on the north-west
 *  (osm:way/376818534) and the south-west (osm:way/885510988) */
export const ADMIN = {
  cx: 2359.7, cz: -969.6, r: 21.3, a0: (138 * Math.PI) / 180, a1: (224 * Math.PI) / 180,
  low: 8.0, band0: 8.2, band1: 13.8, top: 14.4,
  /** the drum without the two links (the outline's points, west round to east) */
  drum: [[2367.2, -989.6], [2375.2, -984.9], [2380.9, -975.3], [2371.9, -971.9], [2371.2, -964.5], [2380.4, -960.4], [2374.4, -952.6],
    [2365.7, -948.0], [2355.3, -947.8], [2357.7, -957.9], [2351.0, -961.5], [2343.4, -955.9], [2340.2, -961.4], [2338.4, -969.6],
    [2340.2, -977.0], [2344.5, -983.5], [2351.8, -976.7], [2358.6, -980.0], [2357.7, -990.2]] as [number, number][],
  /** the whole outline, links included */
  outline: [[2367.2, -989.6], [2375.2, -984.9], [2380.9, -975.3], [2371.9, -971.9], [2371.2, -964.5], [2380.4, -960.4], [2374.4, -952.6],
    [2365.7, -948.0], [2355.3, -947.8], [2357.7, -957.9], [2355.3, -958.9], [2349.0, -949.9], [2347.1, -951.3], [2353.0, -960.0],
    [2351.0, -961.5], [2343.4, -955.9], [2340.2, -961.4], [2338.4, -969.6], [2340.2, -977.0], [2344.5, -983.5], [2351.8, -976.7],
    [2353.9, -978.5], [2349.8, -987.5], [2351.9, -988.6], [2356.1, -979.6], [2358.6, -980.0], [2357.7, -990.2]] as [number, number][],
  /** the wings as oriented rectangles (centre, long axis, the main range and the stair bays either side, model frame) */
  wings: [
    { id: 'osm:way/376818534', c: [2343.99, -1001.16] as [number, number], axis: [0.4370, 0.8995] as [number, number],
      main: [-14.6, 14.6, -6.2, 7.0], bays: [[-0.7, 5.5, -9.6, -6.2], [-0.8, 6.2, 7.0, 9.6]] },
    { id: 'osm:way/885510988', c: [2340.51, -938.36] as [number, number], axis: [-0.5550, 0.8318] as [number, number],
      main: [-14.2, 14.2, -6.1, 6.6], bays: [[-5.8, 0.7, -9.0, -6.1], [-5.5, 0.7, 6.6, 9.0]] },
  ],
};
export const adminAt = (a: number, r: number): [number, number] => [ADMIN.cx + r * Math.cos(a), ADMIN.cz + r * Math.sin(a)];

/** the Joshua Alabi Library (osm:way/885510989): six storeys on the mapped plan of ranges and arms; the model frame turned
 *  with the outline (3.4 degrees), x east, z south. The front is the north face toward the mapped road: the central
 *  arm (`centre`) is the taller entrance bay with the arched top, the wings either side (REF L-01, L-02) */
export const LIBRARY = {
  c: [2406.74, -1031.30] as [number, number], axis: [0.9982, 0.0593] as [number, number],
  ranges: [
    [-24.9, -10.9, -5.9, 9.8], [-17.8, -9.6, -23.2, -5.9], [-10.9, 4.5, 9.8, 25.4], [-10.9, -0.1, -6.0, 9.8],
    [-0.1, 4.5, 6.5, 9.8], [10.8, 15.4, -7.6, 6.5], [15.4, 24.9, -7.6, 22.5], [18.5, 24.9, -22.3, -7.6],
  ] as [number, number, number, number][],
  centre: [-0.1, 10.8, -25.4, 6.5] as [number, number, number, number],
  floors: 6, storey: 3.4,
};

/** the solids these models put beside the ride, for the route checks: x, z, radius */
export function landmarkPosts(): [number, number, number][] {
  const out: [number, number, number][] = [];
  const P = PORTAL, zc = (P.zS + P.zN) / 2;
  // the arch's foot, the booth, the east block's corners on the road side, the barrier posts
  out.push([P.foot + 0.6, P.zS - 0.3, 0.4], [P.foot + 0.6, P.zN + 0.3, 0.4]);
  for (const z of [P.booth[2], P.booth[3]]) out.push([P.booth[1], z, 0.3]);
  for (const z of [P.zS, P.zN]) out.push([P.east + 0.2, z, 0.3]);
  out.push([GATE.clear[0] + 0.35, zc, 0.25], [GATE.clear[1] - 0.35, zc, 0.25]);
  out.push([FOUNTAIN.x, FOUNTAIN.z, FOUNTAIN.rim], [LOVE_SIGN.x, LOVE_SIGN.z, 1.0]);
  for (const [x, z] of LAMPS) out.push([x, z, 0.2]);
  for (const [x, z] of BENCHES) out.push([x, z, 0.8]);
  return out;
}
