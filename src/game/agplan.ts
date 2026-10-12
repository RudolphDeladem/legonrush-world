// Numbers for the owner's 16-pair brief (agric.ts draws them; pure data). Game metres: x east, z south. Read from the
// annotated aerial registered to the mapped roads; nothing measured.

/** where the models draw a road's edge themselves (x0, x1, z0, z1): the brick footway and open drain on Akuafo Road's west
 *  side (pair 16), the curved brick corner at its junction with Onyaa Road and the worn apron before the low roadside group
 *  (pairs 14, 15), the WACCI forecourt along Onyaa Road (pairs 11, 12), the Child Study Centre's gate (pair 5), the
 *  asphalt along the east block's north side where it leaves E.A. Boateng Road (pair 4). There the campus's generic verges
 *  and drains (life.ts) and a ridden route's generic pavements (world.ts) stay out. */
export const AG_OWNED: [number, number, number, number][] = [
  [225.5, 233.6, 139, 262.5],
  [236.6, 245, 265.2, 296],
  [236.6, 262, 265.6, 272],
  [268, 325, 265.6, 269.5],
  [415, 439, 265.6, 269.5],
  [511, 516.5, 204, 214.5],
  // (not the Agriculture side: the ring road's west arc at the main gate, widened toward the plaza, tenpairs.ts)
  [743.5, 761, 112.5, 143.5],
];
export const agOwns = (x: number, z: number) => AG_OWNED.some(([x0, x1, z0, z1]) => x > x0 && x < x1 && z > z0 && z < z1);
