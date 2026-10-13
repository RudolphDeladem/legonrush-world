// The UPSA Hostel to the UPSA campus (the owner's brief, RW01-RW15; docs/upsa-hostel-to-school/evidence-audit.md): the
// numbers upsacampus.ts models and the route tests check. Game metres: x east, z south. Positions come from the UPSA
// extension (OpenStreetMap via Overture, data/geography/sources/upsa-extension.geojson, ids kept); the photographs set
// appearance and order only. Spots marked "inferred" are read from the photographs, not measured.
import { ROADS, NODE_XZ } from './campusmap';
import { zOn } from './upsa';
import { zIps } from './ipsplan';

type Line = [number, number][];
/** the pieces of IPS Road east of the roundabout on one carriageway, joined west to east */
function carriageway(north: boolean): Line {
  const pts: Line = [];
  for (const r of ROADS) {
    if (r.name !== 'IPS Road') continue;
    const p = r.nodes.map((n) => [NODE_XZ[n * 2], NODE_XZ[n * 2 + 1]] as [number, number]);
    if (p.some(([x]) => x < 1989 || x > 2294)) continue;
    const mz = p.reduce((s, q) => s + q[1], 0) / p.length;
    if (north === mz < -883) pts.push(...p);
  }
  pts.sort((a, b) => a[0] - b[0]);
  return pts.filter((q, i) => i === 0 || q[0] - pts[i - 1][0] > 0.05);
}
/** the divided road (osm:way/515974987 westbound on the north, osm:way/1492309154 eastbound on the south, RW10, RW11),
 *  from the roundabout to where the carriageways meet at the Main Gate (x 2293.1) */
export const NORTH_CW = carriageway(true);
export const SOUTH_CW = carriageway(false);
export const zNorth = (x: number) => zOn(NORTH_CW, x);
export const zSouth = (x: number) => zOn(SOUTH_CW, x);
/** both carriageways are mapped 7 m wide */
export const CW_HALF = 3.5;

/** the roundabout at IPS Road / Trinity Avenue (osm:way/1491866764, /1491866766, /1491866767; RW09): its centre, the
 *  ring's centreline radius, the kerb of the central island */
export const RING = { x: 1976.6, z: -873.2, r: 19.6, island: 15.2 };

/** the stretch between the UPSA Hostel corridor (ipsplan.ts CORRIDOR, to x 1845) and the roundabout: the north sidewalk,
 *  the strip and the verges carry on as before (RW01-RW08) */
export const WEST = { x0: 1845, x1: 1952 };
/** the blue panel hoarding along the north side (RW06, RW08, RW09): from the end of PRESEC's white wall past the
 *  roundabout to the UPSA campus wall (extent inferred) */
export const HOARDING = { x0: 1845, x1: 2155.4, off: 9.4, h: 2.6 };
/** the hoarding's line: off PRESEC's wall line west of the roundabout, round its north side, then along the divided
 *  road's north carriageway to the campus wall */
export const HOARD_LINE: [number, number][] = [];
{
  for (let x = HOARDING.x0; x <= 1950; x += 2.4) HOARD_LINE.push([x, zIps(x) - HOARDING.off]);
  HOARD_LINE.push([1962, -903.5], [1992, -903.5]);
  for (let x = 2004; x < HOARDING.x1; x += 2.4) HOARD_LINE.push([x, zNorth(x) - CW_HALF - 7]);
  HOARD_LINE.push([HOARDING.x1, -902.3]);
}
/** the fork at the tower (RW08): the link to Trinity Avenue (osm:way/1499858647) leaves the frontage road here */
export const FORK = { x: 1916.9, z: -867.5 };
/** the tyre stalls on the red earth by the tower (RW07; inferred spots) */
export const TYRES: [number, number][] = [[1872, -858.5], [1879, -859.2], [1886, -858.4], [1902, -859.1]];

/** the grass median between the carriageways (RW10, RW11), kerbed, from the roundabout's exit until the carriageways
 *  close up toward the gate */
export const MEDIAN = { x0: 2000, x1: 2200, min: 1.2 };
/** the south verge: red earth with an open concrete drain along it (RW10), the wooden distribution poles (inferred
 *  spacing), the next lattice tower of the line on from x 1893 (RW11: at the verge before the shop row, west of its mapped lay-by; spot inferred) */
export const SOUTH_VERGE = { x0: 2000, x1: 2290, drainOff: 2.6, drainW: 0.9 };
export const S_POLES = [2012, 2049, 2087, 2124, 2161, 2203, 2241, 2279];
export const TOWER_S: [number, number] = [2176, -866.4];

/** the UPSA campus wall along IPS Road, either side of the Main Gate (osm:way/1009392392, osm:way/1009392393) */
export const WALL_W: [number, number][] = [[2155.4, -902.3], [2250.2, -901.9], [2251.3, -904.4], [2278.2, -904.7]];
export const WALL_E: [number, number][] = [[2300.1, -905.8], [2315.7, -906.0], [2316.4, -901.7], [2393.1, -898.3]];
export const WALL_H = 2.4;

/** the UPSA Main Gate: its outline (osm:way/1009392399), the entrance road (osm:way/1009392398) through it, the opening
 *  kept clear for it (the new tiled portal on it: upsalandmarksplan.ts PORTAL) */
export const GATE = { x0: 2279.8, x1: 2303.1, z0: -919.6, z1: -906.5, roadX: 2291.0, clear: [2285.2, 2297.2] as [number, number], h: 6.2 };
/** the "UPS" bus stop on the north verge west of the gate (osm:node/4988349723) */
export const BUS_STOP: [number, number] = [2262, -893];

/** the Abednego F. O. Amartey Towers (two blocks of ten levels, bridges between them over five levels, commissioned
 *  December 2024): the two parallel mapped slabs north of IPS Road, osm:way/885510985 (south, the owner's correction of
 *  batch 114) and osm:way/885510984 (north) with osm:way/1009392391 at its west end, 18 m apart. The owner's Apple aerial
 *  shows two towers there, each with its own roof and plant; the game had drawn both blocks side by side on the south
 *  slab and the north slab as an ordinary block (docs/upsa-campus/evidence-ledger.md). The bridges' spot along the gap
 *  and their levels (1 to 5) are estimates. */
export const TOWERS_AM = {
  south: [2220.4, 2272.4, -957.7, -942.5] as [number, number, number, number],
  north: [2206.2, 2271.6, -985.4, -975.7] as [number, number, number, number],
  bridge: [2242, 2251, -975.7, -957.7] as [number, number, number, number],
  /** the south block's road face: the blue curtain wall over its west part (the owner's photos 1-3, the clips IMG_9677
   *  16-30 s) */
  curtain: [2221.6, 2240.5] as [number, number],
  floors: 10, storey: 3.4, bridgeFloors: 5,
};

/** the academic core: the block east of the central quadrangle (osm:relation/13514869), its west door at the mapped drive
 *  (osm:way/958917244) between the car-park strips; the quadrangle's lawns (osm:way/1009392417-1009392421) */
export const CORE = { x0: 2388.7, x1: 2435.9, z0: -1152.9, z1: -1084.3, door: [2389.2, -1114.7] as [number, number] };
export const QUAD = { x0: 2285, x1: 2349, z0: -1127, z1: -1077 };

/** Prestige Hostel (osm:way/1238177036, RW14): four storeys behind a paved forecourt with chained bollards */
export const PRESTIGE = { x0: 2176.1, x1: 2196.7, z0: -824.5, z1: -797.5 };

/** the solids the models put beside the ride (not the poles and lamps, which the model sets only where they clear the
 *  roads), for the route checks: x, z, radius */
export function upsaPosts(): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (const [x, z] of HOARD_LINE) out.push([x, z, 0.3]);
  for (const [x, z] of [WALL_W[0], WALL_W[WALL_W.length - 1], WALL_E[0], WALL_E[WALL_E.length - 1]]) out.push([x, z, 0.25]);
  for (const [x, z] of TYRES) out.push([x, z, 0.5]);
  out.push([1895, -861.5, 1.6]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) out.push([TOWER_S[0] + sx * 3, TOWER_S[1] + sz * 3, 0.45]);
  out.push([BUS_STOP[0], BUS_STOP[1], 1.6]);
  // (the Main Entrance's solids: upsalandmarksplan.ts landmarkPosts)
  // the roundabout island's stall and billboard, the core's canopy columns
  out.push([RING.x - 9, RING.z + 4, 1.4], [RING.x + 7.9, RING.z - 3, 0.2], [RING.x + 11.1, RING.z - 3, 0.2]);
  for (const dz of [-3.2, 3.2]) out.push([CORE.door[0] - 2.6, CORE.door[1] + dz, 0.3]);
  return out;
}
