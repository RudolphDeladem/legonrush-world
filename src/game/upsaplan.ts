// The UPSA junction's measured layout (upsa.ts models it; scripts/route-tests.mjs checks that nothing solid here stands
// on a road or a ridden route). Game metres: x east, z south. Positions come from the map (the UGBS landuse outline,
// the roads, the footprints) and the owner's field photos and Street View frames (docs/LEGON_BUILDINGS.md, UPSA
// junction section); the ones marked "inferred" are placed from photographs, not measured.

/** the north boundary wall of the UGBS Graduate Campus: the landuse outline's north edge, west to east, broken by the
 *  gate (its gatehouses take the gap), and its short run east of the gate (d5_23, inferred length) */
export const WALL_WEST: [number, number][] = [[984.8, -846.4], [1007.4, -853.5], [1096.0, -863.0], [1097.6, -862.98]];
export const WALL_EAST: [number, number][] = [[1124.4, -862.4], [1140.0, -862.4]];
/** the UGBS gate where the campus road (x 1111) passes the wall: the opening between the piers, the gatehouses. The
 *  opening (12 m) is wider than the photograph suggests (about 8-9 m) so that a ride turning west onto the service road
 *  just outside clears the west pier */
export const GATE = { x: 1111, z: -862.7, open: 6.0, pier: 1.0, house: 5.8, houseFront: -1.2, houseBack: 3.4 };
/** the wall line's z at x (Infinity off its ends): the sidewalk keeps clear of it */
export function wallZ(x: number) {
  for (const run of [WALL_WEST, [WALL_WEST[WALL_WEST.length - 1], [GATE.x, GATE.z] as [number, number], WALL_EAST[0]], WALL_EAST]) {
    for (let i = 0; i < run.length - 1; i++) {
      const [ax, az] = run[i], [bx, bz] = run[i + 1];
      if (x >= ax && x <= bx) return az + ((bz - az) * (x - ax)) / (bx - ax || 1);
    }
  }
  return Infinity;
}

/** concrete H-frame distribution poles in the verge between the sidewalk and the wall (F07, F08, Street View) */
export const H_POLES: [number, number][] = [[1012, -865.3], [1062, -863.2], [1150, -859.3], [1200, -858.1]];
/** lattice transmission towers on the UGBS side (Street View heading west from GOIL; F07, F10, F15: inferred spots) */
export const TOWERS: [number, number][] = [[972, -861], [1290, -855]];
/** wooden distribution poles along the north verge of IPS Road (Street View frames at GOIL and the workshops) */
export const WOOD_POLES: [number, number][] = [[1003, -891], [1060, -893], [1100, -891.5], [1150, -892], [1200, -892]];
/** traffic signal poles at the corners of the J.J. Rawlings Avenue (N4) / IPS Road junction (F01, F03) */
export const SIGNALS: [number, number, number][] = [[957.0, -876.5, 0], [959.1, -888.3, 1], [943.3, -879.1, 2], [945.4, -890.9, 3]];

/** GOIL: the shop and lube-bay block's frame (its footprint's long axis), the canopy and the pumps in that frame */
export const GOIL = {
  origin: [1069.5, -955.6] as [number, number], axis: [0.906, 0.423] as [number, number],
  shop: [-14.6, 14.6, -5.25, 5.25],
  canopy: [-10.8, 11.6, 18.2, 29.0], canopyH: 5.6,
  columns: [[-3.8, 21.4], [3.4, 21.4], [-3.8, 25.8], [3.4, 25.8]] as [number, number][],
  islands: [21.4, 25.8], islandX: [-5.2, 4.2],
};
/** the GOIL pylon sign on its kerbed island between the way in and the way out (Street View, F05) */
export const GOIL_SIGN = { x: 1045.3, z: -890.5, island: [1041.8, 1048.8, -897.5, -885.6] };
/** the ATM row (GCB, Standard Chartered, National Investment Bank, Stanbic) facing the forecourt, the yellow container
 *  shop beside it, the telecom mast behind (Street View at the way out; d4_08). Kept 5 m east of the mapped ATM points:
 *  a ride to them runs out past its arrival node toward them */
export const ATM = { x: 1078.6, z: -915.0, axis: [0.87, 0.5] as [number, number], len: 7.2, depth: 1.6 };
export const CONTAINER = { x: 1084.0, z: -911.6 };
export const MAST: [number, number] = [1089.0, -920.5];

/** every solid post (x, z, radius) the junction adds outside the buildings, for the route checks */
export function junctionPosts(): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (const [x, z] of H_POLES) out.push([x, z - 0.8, 0.25], [x, z + 0.8, 0.25]);
  for (const [x, z] of TOWERS) out.push([x, z, 3.2]);
  for (const [x, z] of WOOD_POLES) out.push([x, z, 0.2]);
  for (const [x, z] of SIGNALS) out.push([x, z, 0.2]);
  out.push([GOIL_SIGN.x, GOIL_SIGN.z, 1.0], [MAST[0], MAST[1], 0.7], [CONTAINER.x, CONTAINER.z, 3.0]);
  const [ux, uz] = GOIL.axis, [ox, oz] = GOIL.origin;
  for (const [x, z] of GOIL.columns) out.push([ox + x * ux - z * uz, oz + x * uz + z * ux, 0.45]);
  for (const z of GOIL.islands) for (const x of [-1.6, 2.2]) out.push([ox + x * ux - z * uz, oz + x * uz + z * ux, 0.6]);
  for (let s = -3; s <= 3; s += 1.2) out.push([ATM.x + s * ATM.axis[0], ATM.z + s * ATM.axis[1], 0.9]);
  for (const sx of [-1, 1]) out.push([GATE.x + sx * (GATE.open + GATE.pier / 2), GATE.z, 0.7]);
  return out;
}
