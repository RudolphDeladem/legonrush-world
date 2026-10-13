// Numbers for the UPSA campus's second layer (upsawest.ts): the Astro Turf, the hard courts, the Professional Christian
// Union Building and the blocks round them, read from the owner's Apple hybrid aerial registered on the game map at
// 2.42 px/m (x = 2359.7 + (px - 805) / 2.42, z = -969.6 + (py - 700) / 2.42; docs/upsa-campus/), with the drone clips and
// photos for heights and finishes. Game metres, x east, z south. Estimates are marked in docs/upsa-campus/evidence-ledger.md.

type R4 = [number, number, number, number];

/** the Rev. J. K. Antwi Astro Turf: the synthetic pitch, its red track edge round it, the fence just outside that */
export const TURF = {
  /** the turf itself (aerial: the dark green rectangle) */
  turf: [2206.3, 2274.5, -1236.6, -1134.3] as R4,
  /** the red edge round it */
  edge: 1.2,
  /** the fence: offset outside the red edge, height (welded mesh on grey posts; photos 17, 26, 28, 33, 35, 36) */
  fence: { off: 0.4, h: 3.4, bay: 2.5 },
  /** floodlight masts: height, and their spots (the four corners; two along the east walk, photos 28, 29) */
  mastH: 18,
};
/** the pitch's markings inside the turf (standard dimensions; the photos show the full set) */
export const FIELD = { inset: 1.6 };

/** the stand on the turf's west side (aerial: blue and white seat rows; the walkway west of it stays clear) and the small
 *  two-storey pavilion in its middle (the clips' white and blue block among the seats) */
export const STAND = { x0: 2199.6, x1: 2204.9, z0: -1208, z1: -1160, tiers: 6, rise: 0.45, pav: [-1189, -1178] as [number, number], pavH: 7 };

/** the hard courts west of the Astro Turf: one fenced red surround, two green courts with basketball posts north, two
 *  green tennis courts south (aerial; IMG_9677j 10-16 s; photos 22, 23) */
export const COURTS_NW = {
  outer: [2142.8, 2187.8, -1209, -1120.4] as R4,
  /** the north pair (basketball), the south pair (tennis): court rectangles */
  north: [[2146.5, 2160.8, -1200.3, -1172.3], [2167.0, 2182.0, -1200.3, -1172.3]] as R4[],
  south: [[2150.5, 2161.5, -1157.0, -1133.2], [2169.5, 2180.5, -1157.0, -1133.2]] as R4[],
  /** the fence between the two pairs */
  midZ: -1164.5,
  fenceH: 4,
};

/** the hard court beside the towers: a red surround and one court (aerial; IMG_9677 34-38 s) */
export const COURT_TOWER = { outer: [2145.9, 2186, -974.8, -952] as R4, court: [2154.1, 2179.9, -970.6, -958.2] as R4, fenceH: 3.5 };

/** the Professional Christian Union Building: the long block behind the Astro Turf's north goal (IMG_9677j 20-46 s, the
 *  sign; aerial: its roof, cut by the picture's top edge). South face from the aerial; the depth is an estimate kept clear
 *  of the mapped road 17 m north. The blue glass bay at its east end (IMG_9677j 26, 46 s). */
export const PCU = { x0: 2228.5, x1: 2288.4, z0: -1260, z1: -1247.5, bay: 9, storey: 3.8, floors: 3 };

/** the six-storey block north of the hard courts (the "Western Union" pin; IMG_9677j 18 s: six storeys, a white frame with
 *  curved fins round blue windows, Pack 1's U-01): its footprint from the aerial roof less the lean of a 20 m block */
export const WU = { x0: 2144, x1: 2170, z0: -1240, z1: -1214, floors: 6 };

/** the long low block between the hard courts and the four-storey blocks (aerial: a light grey metal roof; IMG_9677j 8 s);
 *  its east end kept clear of the walkway along the pitch */
export const GREY = { x0: 2149, x1: 2194, z0: -1115.7, z1: -1101.5, floors: 2 };

/** the slate-roofed four-storey block at the west of the four-storey group (aerial; IMG_9677 44-48 s) */
export const SLATE = { x0: 2139.7, x1: 2163, z0: -1075, z1: -1041, floors: 4 };

/** the round fountain in the four-storey group's courtyard (IMG_9677j 4 s) */
export const FOUNTAIN = { x: 2190, z: -1051, r: 3 };

/** the campus as the aerial shows it, for the generic blocks' UPSA finish: the mapped outline (osm:way/309660062) taken out
 *  west to the campus wall and north round the Astro Turf and the PCU building */
export const UPSA_LAND: [number, number][] = [
  [2312.4, -898.9], [2136, -904], [2136, -1262], [2290, -1262], [2290, -1237], [2309.7, -1236.9], [2308.4, -1261.3],
  [2374.5, -1260.9], [2437.8, -1261.5], [2438.4, -1227.5], [2453.2, -1225.9], [2442.9, -1154.2], [2430.9, -978.6],
  [2430.5, -938.3], [2399.2, -938.7], [2397.2, -894.4],
];

/** per-building finishes inside UPSA_LAND that the clips show (a point inside the outline): the four-storey group's roofs
 *  (IMG_9677 44-48 s: a red pitched roof, a green flat roof, a tan flat roof), the small hipped house by the tower court
 *  (IMG_9677 34 s) */
export const UPSA_FINISH: { at: [number, number]; roof?: string; hip?: boolean; storeys?: number; plain?: boolean }[] = [
  { at: [2199, -1087], roof: '#b0503f', hip: true, storeys: 4 },
  { at: [2191.6, -1071], roof: '#d6d5cf', storeys: 4 },
  { at: [2190.6, -1031.7], roof: '#7d9c78', storeys: 4 },
  { at: [2203.7, -1011], roof: '#c8a27c', storeys: 4 },
  { at: [2226, -1050], storeys: 4 },
  { at: [2185.3, -936.5], roof: '#9a4a3a', hip: true, storeys: 1, plain: true },
];
