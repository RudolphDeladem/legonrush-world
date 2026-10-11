// Local ground relief on an otherwise flat campus. Everything that stands on the ground asks
// groundHeight(x, z): the ground patch, roads, verges, areas, props, the ridden route, the rider,
// rivals, coins and the camera. It is 0 everywhere outside the zones, so the rest of the campus is
// untouched.
//
// Three kinds of zone:
// - a hollow: a flat floor sunk below the surrounding ground with straight slopes back up (the
//   School of Engineering Sciences, below the road on its south);
// - a terrace: the same raised above it (Volta Hall, up a short flight of steps from its forecourt);
// - Legon Hill: a ridge along the University Avenue axis rising west from the end of the avenue,
//   gently through Commonwealth Hall and on to the Great Hall at the top (the shape of the
//   Copernicus DEM, eased), falling away to the sides.
// Stairways climb from a foot to the ground at their top in flights with landings between; the
// ground in a stairway is its stair surface (Commonwealth's from the gate houses to the drive,
// Volta's from the forecourt to the entrance).
// Over these, two overrides (the owner's NSIA Road brief): a road's own cut or fill (PATHS: its height along it, flat
// across it, easing into the ground beside it over a bank, narrow where a wall holds it), and a flat pad for a building
// standing lower than the ground round it (PADS). A terrace's floor may also follow a function (`top`) and its west edge
// a line (`west`): the tree belt a wall's height above the lane along NSIA Road.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { NSIA, laneX, northTop } from './nsia';
import { KQ } from './kuffour';

interface Hollow {
  /** hollow: sunk `depth` below the ground; terrace: raised `depth` above it */
  kind: 'hollow' | 'terrace';
  /** the floor: x0..x1, z0..z1 (game metres) and how far below (or above) the ground it is */
  x0: number; x1: number; z0: number; z1: number; depth: number;
  /** length of the slope on each side: west, east, north (z0 side), south (z1 side) */
  w: number; e: number; n: number; s: number;
  /** a floor whose height varies: its height at the nearest point of the floor (instead of `depth`) */
  top?: (x: number, z: number) => number;
  /** a west edge that follows a line (x at z) instead of x0; x0 is then its westmost */
  west?: (z: number) => number;
  /** the ground grid's cell over this zone (default 1 m, 2 m over the big ones): finer where a wall stands on its edge */
  cell?: number;
}
interface Hill {
  kind: 'hill';
  /** height along x (piecewise linear, 0 at both ends) */
  profile: [number, number][];
  /** the ridge line, how far either side it keeps its full height, and how far it then falls away */
  zc: number; full: number; fall: number;
}
/**
 * a stairway: x from the foot (x0) up to the top (x1), z0..z1, in flights of `steps` steps of `tread` m; with
 * `alongZ` it climbs along z instead (x0, x1 are then z values, z0, z1 the x span). It climbs from the ground at its
 * foot to the ground at its top.
 */
interface Stairs { x0: number; x1: number; z0: number; z1: number; flights: number; steps: number; tread: number; alongZ?: boolean }
type Zone = Hollow | Hill;
/**
 * a road's own cut or fill: along the polyline (x, z, height at each point, linear between) the ground is the road's
 * height for `half` metres either side of it, then eases back to the ground the zones make over `bank` metres
 */
interface Path { pts: [number, number, number][]; half: number; bank: number; bankAt?: (x: number, z: number) => number }

/** a smoothstep-eased terrace's height at x, z (the same shape as the terraces below) */
const easedTop = (q: { x0: number; x1: number; z0: number; z1: number; w?: number; e?: number; n: number; s: number }, top: number, z: number) => {
  const t = Math.min(1, z < q.z0 ? (q.z0 - z) / q.n : z > q.z1 ? (z - q.z1) / q.s : 0);
  return top * (1 - t * t * (3 - 2 * t));
};
/** the lane's height along it (its own terrace, below) */
export const laneHeight = (z: number) => easedTop(NSIA.lane, NSIA.lane.top, z);
/** the retaining wall's exposed height at z along the lane: full over the run, falling into the corner at its south end */
export const wallExposed = (z: number) => {
  const W = NSIA.wall, a = W.z1 - W.taper;
  return z <= a ? W.exposed : W.exposed + ((W.endHeight - W.exposed) * Math.min(1, (z - a) / W.taper));
};
/** the wall's face line along the lane (x at z) */
export const wallX = (z: number) => laneX(z) + NSIA.wall.offset;

const ZONES: Zone[] = [
  // School of Engineering Sciences: the building, its forecourt and the car park on the floor;
  // the access road from the main road on the south comes down the 23 m slope, which levels out a few metres
  // short of that road and of Annie Jiagge Road on the east, so neither tips into it (owner)
  { kind: 'hollow', x0: 372, x1: 494, z0: -458, z1: -372, depth: 4.5, w: 22, e: 10, n: 20, s: 23 },
  // Legon Hill: the end of the avenue (x -362) at 0; Commonwealth's stairway climbs 9 m to the drive and
  // the front block (x -464 to -500); the hall rises 6 m more to its west end; the Great Hall's summit
  // about 21 m up; then down again behind it
  {
    kind: 'hill', zc: 128, full: 150, fall: 140,
    profile: [[-1260, 0], [-1160, 11], [-1060, 21], [-960, 21], [-900, 19.5], [-780, 16.5], [-740, 15.5], [-500, 9.3], [-488, 9], [-464, 9], [-372, 0], [-362, 0]],
  },
  // Volta Hall: the hall stands 2.4 m above Volta Hall Road, its east front over a stone retaining
  // wall; the Annex to the north is at road level. Two rectangles over the hall's blocks only (the courts
  // and the east front; the west block), so the lawn corner south-west of the hall and the road round it
  // stay at road level; on the south, toward the Department of History, a rubble-stone wall in two tiers holds the
  // terrace up over Volta Road (owner's second reference PDF, page 30)
  { kind: 'terrace', x0: -336, x1: -258.6, z0: -27, z1: 99.6, depth: 2.4, w: 6, e: 2, n: 10, s: 1.5 },
  { kind: 'terrace', x0: -365, x1: -336, z0: 44, z1: 86, depth: 2.4, w: 5, e: 0.1, n: 5, s: 4 },
  // the building with the porch and balcony at the hall's south-east corner stands up on the same terrace, the stone wall
  // in its two tiers carried on under it along Volta Road and returned up its east side and along the forecourt (the
  // owner's photo from Volta Road and marked satellite view)
  { kind: 'terrace', x0: -258.8, x1: -241.0, z0: 86.6, z1: 99.6, depth: 2.4, w: 0.3, e: 0.3, n: 0.3, s: 1.5 },
  // The Balme Library stands above University Square and the long pool before it (owner's photo from the pool):
  // the pool deck 2.4 m below the road in front of the library, a middle terrace 1.2 m below it, each behind a
  // stone retaining wall, the central stairs climbing from the pool to the road; the side lanes stay up
  // each level drops at its retaining wall (owner: the paving outside runs flat to the wall, no slope)
  // (the owner's Balme and Pentagon brief, pairs 1 and 2: only the pool and its walking strips are down on the deck; the
  // lawns either side stand higher, at the middle terrace's level, behind low stone retaining edges)
  { kind: 'hollow', x0: 0.7, x1: 15.3, z0: 60.3, z1: 93.5, depth: 2.4, w: 0.3, e: 0.3, n: 0.3, s: 0.5 },
  { kind: 'hollow', x0: -6.6, x1: 24.6, z0: 60.3, z1: 93.5, depth: 1.2, w: 0.5, e: 0.5, n: 0.3, s: 0.5 },
  { kind: 'hollow', x0: -6.6, x1: 24.6, z0: 49, z1: 60.6, depth: 1.2, w: 0.5, e: 0.5, n: 0.3, s: 0.3 },
  // The Innovation Enclave, south of the engineering school: its six buildings stand up the hill on a terrace 2 m
  // above the road on its north, behind a white retaining wall that three flights of steps climb (owner's photos);
  // the ground falls away gently on the other sides
  { kind: 'terrace', x0: 397, x1: 497, z0: -332.1, z1: -296, depth: 2, w: 6, e: 4, n: 0.3, s: 8 },
  // the paved ground before the RIPS building, between ISSER and Computer Science: downhill from RIPS, seven steps
  // (1.26 m) below the car park north of the Mathematics and Statistics departments (owner); the drive along ISSER's
  // front ramps down into it from the west
  { kind: 'hollow', x0: 321, x1: 349.4, z0: -282, z1: -277.5, depth: 1.26, w: 4, e: 0.3, n: 8, s: 0.3 },
  // the GCB Lecture Building stands up the slope from the road before the New N Block (owner's photos): its ground
  // floor, the deep gallery on its north and the paving round it are 2.4 m above that road behind white retaining walls
  // (north, east, and west of the gallery); the car park on its west is up at the same level; the ground falls to
  // Ebenezer Laing Road on the south. Before the gallery, at road level, the stair and the two ramps climb to it.
  { kind: 'terrace', x0: -160, x1: -117.5, z0: -395, z1: -306, depth: 2.4, w: 0.3, e: 0.3, n: 0.3, s: 2 },
  { kind: 'terrace', x0: -178, x1: -160, z0: -360, z1: -306, depth: 2.4, w: 2, e: 0.3, n: 6, s: 2 },
  // the ISSER Annex, like the engineering school east of it, lies below the road between them (owner's photo from
  // that road): its buildings, the huts' plaza and the car park on a floor 1.2 m down, the slopes up to the road on
  // the east, to the road on the south (short of it) and to the open ground west and north
  { kind: 'hollow', x0: 236, x1: 334, z0: -446, z1: -342, depth: 1.2, w: 4, e: 5, n: 8, s: 3 },
  // the Department of Earth Science stands on ground raised 1.5 m behind rubble-stone retaining walls on its front and
  // sides (owner's photos), a broad stair up to its entrance; behind it the ground falls gently to the road on the north
  // (its west wall stands clear of Nsia Road's pavement: the road and its kerb run flat past it, owner)
  { kind: 'terrace', x0: 241, x1: 356, z0: 28, z1: 99.3, depth: 1.5, w: 0.3, e: 0.3, n: 5, s: 0.3 },
  // the Department of Physics stands up the hill from Danquah Avenue (owner's photos): its ranges 1.5 m up, a grass
  // bank down to a low stone wall along the pavement and to Cruise O'Brien Road; a stone retaining wall on the east
  { kind: 'terrace', x0: 106, x1: 205.3, z0: 52, z1: 106.5, depth: 1.5, w: 5, e: 0.3, n: 5, s: 5.6 },
  // the Faculty of Arts (the French Department) and the Economic Policy Management office stand 1 m above Danquah
  // Avenue (owner's street photo from before Legon Hall): a rubble-stone retaining wall along the road, kept back
  // behind the footway and its pavement, and down the east side; the ground slopes down to the lane on the west
  { kind: 'terrace', x0: -188.5, x1: -101.3, z0: 50.6, z1: 108.0, depth: 1.0, w: 3, e: 0.3, n: 0.3, s: 0.3 },
  // the N Block compound (owner's views 2 and 1, and the photo of the court): the court, the range behind it (the
  // Department of Psychology) and the long range stand at the level of Ebenezer Laing Road; the ground north of them
  // round the K. Folson Building lies 1.2 m lower, below a pitched bank of rubble stone along the north of the range and
  // of the platform with the blue tent (two stairs climb it), and the car park east of the long range falls toward it
  { kind: 'hollow', x0: 13, x1: 104, z0: -418, z1: -391, depth: 1.2, w: 4, e: 6, n: 6, s: 2.8 },
  { kind: 'hollow', x0: 31, x1: 104, z0: -391, z1: -376.8, depth: 1.2, w: 2, e: 6, n: 0.3, s: 2.3 },
  { kind: 'hollow', x0: 86.5, x1: 104, z0: -418, z1: -368, depth: 1.2, w: 2.8, e: 6, n: 6, s: 23 },
  // the Chemistry Department Extension behind the Balme Library (owner's reference PDF, pages 25-29): it stands about
  // 1 m up behind a rubble-stone retaining wall topped by a clipped hedge, along Cruise O'Brien Road on the west and
  // J.K.M. Hodasi Road on the north; the ground falls gently on the east and to the lane on the south
  // (the owner's Kuffour Quadrangle brief, pair 5: the wall set back from Cruise O'Brien Road behind a narrow footway
  // and a grassy rise up to its foot, so that it shows its stone above the grass, not flush with the road)
  { kind: 'terrace', x0: KQ.croEast.wallX + 0.4, x1: 207.5, z0: -153.0, z1: -97.0, depth: 1.0, w: 0.3, e: 4, n: 0.3, s: 3.5 },
  { kind: 'terrace', x0: KQ.croEast.wallX + 0.4, x1: 207.5, z0: KQ.croEast.z0, z1: KQ.croEast.z1, depth: KQ.croEast.rise, w: 3.6, e: 0.3, n: 0.3, s: 0.3 },
  // the Kuffour Quadrangle (the owner's brief, pairs 1 to 3): the garden stands a little above the roads round it,
  // held by the low stone walls along Hodasi Road and the road south of it, where they jog out toward the roads in the
  // middle; on the west and east it falls gently to the paths
  { kind: 'terrace', x0: KQ.garden.x0, x1: KQ.garden.x1, z0: KQ.garden.z0, z1: KQ.garden.z1, depth: KQ.garden.h, w: 1.6, e: 1.6, n: 0.3, s: 0.3, cell: 0.5 },
  { kind: 'terrace', x0: KQ.garden.jx0, x1: KQ.garden.jx1, z0: KQ.garden.nz, z1: KQ.garden.sz, depth: KQ.garden.h, w: 0.3, e: 0.3, n: 0.3, s: 0.3, cell: 0.5 },
  // the back of Akuafo Hall Main: the lawn between the south wings stands 0.45 m up behind a low white concrete edge,
  // above the hexagonal pavers before it (owner's second reference PDF, pages 48-54)
  { kind: 'terrace', x0: 138.6, x1: 174.8, z0: 366.4, z1: 381.6, depth: 0.45, w: 0.15, e: 0.15, n: 0.15, s: 0.15 },
  // Block A's car park between its east side and Pent Road (the owner's Pent PDF, pages 25-27, and the owner's later
  // correction: the photos were taken from Block A's south-east, the road on the rise is Pent Road, not the road between
  // Blocks A and B, which is level): it lies 1.3 m below the road behind a rendered retaining wall with steps up it
  { kind: 'hollow', x0: 597, x1: 618.6, z0: -633, z1: -606, depth: 1.3, w: 5, e: 0.3, n: 4, s: 4, cell: 0.5 },
  // the lane from Physics north to Frank Torto (owner's second reference PDF, pages 21-30): it climbs from Physics to a
  // crest by the turning east to LECIAD, then runs down again to the Chemistry Extension and Frank Torto, which stand
  // low; east of it the ground of LECIAD and its neighbours stands higher still behind a bank of grass and red earth
  { kind: 'terrace', x0: NSIA.lane.x0, x1: NSIA.lane.x1, z0: NSIA.lane.z0, z1: NSIA.lane.z1, depth: NSIA.lane.top, w: 2, e: 3, n: NSIA.lane.n, s: NSIA.lane.s },
  { kind: 'terrace', x0: 219, x1: 345, z0: -72, z1: 2, depth: 2.8, w: 5, e: 10, n: 20, s: 22 },
  // the tree belt between the lane and NSIA Road (the owner's NSIA Road brief, pairs 2, 3 and 5): raised above the lane
  // behind a stone-faced retaining wall along the lane's east side, its top a wall's height over the lane wherever the
  // lane climbs or falls, the wall losing its height into the corner by the connecting road; a bank at its north end
  // toward the low building by the car park (pair 1). Its east side and NSIA Road: the road's cut (PATHS) eases it down
  {
    // (its edge a little behind the wall's face, under the wall's body, so no slope of grass shows in front of the stones)
    kind: 'terrace', x0: Math.min(...[-79, -60, -48, -40, -29.5].map(wallX)) + 0.3, west: (z) => wallX(z) + 0.3, x1: NSIA.belt.x1, z0: NSIA.belt.z0, z1: NSIA.belt.z1,
    depth: 0, top: (_x, z) => laneHeight(z) + wallExposed(z), w: 0.25, e: 0.5, n: NSIA.belt.north, s: NSIA.belt.south, cell: 0.25,
  },
  // the hill's continuation north along NSIA Road to J.K.M. Hodasi Road (the owner's NSIA hillside correction): east of
  // the low building from the belt's end, then across from the Frank Torto tower to NSIA Road's cut north of the passage
  // between them, held at the passage's end by a low stone wall, easing down to Hodasi Road at the junction
  { kind: 'terrace', x0: NSIA.north.x0e, x1: NSIA.north.x1, z0: NSIA.north.passEnd, z1: NSIA.north.z1e, depth: NSIA.north.h, w: 0.6, e: 0.5, n: 0.3, s: 2.5, cell: 0.5 },
  { kind: 'terrace', x0: NSIA.north.x0, x1: NSIA.north.x1, z0: NSIA.north.z0, z1: NSIA.north.passEnd, depth: 0, top: (_x, z) => northTop(z), w: NSIA.north.west, e: 0.5, n: NSIA.north.n, s: 0.25, cell: 0.5 },
  // the lane past the Department of Nutrition and Food Sciences (owner's photo up the lane from J.K.M. Hodasi Road):
  // it runs down a little toward its north end, below the lawn held up behind its rubble-stone wall on the west, and
  // climbs gently back along its leg east to Animal Biology
  { kind: 'hollow', x0: -162, x1: -157, z0: -275, z1: -262, depth: 1.0, w: 0.6, e: 2.5, n: 6, s: 96 },
  { kind: 'hollow', x0: -157, x1: -150, z0: -279, z1: -271, depth: 1.0, w: 0.6, e: 18, n: 4, s: 3 },
];
const STAIRS: Stairs[] = [
  // Commonwealth: from the gate houses up Legon Hill to the drive
  { x0: -372, x1: -464, z0: 118, z1: 138, flights: 7, steps: 9, tread: 0.4 },
  // Volta: from the forecourt up to the entrance
  { x0: -245, x1: -258.6, z0: 60, z1: 72, flights: 3, steps: 5, tread: 0.4 },
  // the Balme Library: from the pool deck up to the middle terrace and on up to the road before the library
  { x0: 61.6, x1: 43, z0: 1.5, z1: 14.5, flights: 2, steps: 8, tread: 0.4, alongZ: true },
  // the Innovation Enclave: up from the road through the retaining wall to the terrace, west, middle and east
  { x0: -333, x1: -328.2, z0: 415, z1: 419, flights: 1, steps: 12, tread: 0.4, alongZ: true },
  { x0: -333, x1: -328.2, z0: 445.5, z1: 451.5, flights: 1, steps: 12, tread: 0.4, alongZ: true },
  { x0: -333, x1: -328.2, z0: 478, z1: 481.5, flights: 1, steps: 12, tread: 0.4, alongZ: true },
  // the small stairs at the end of the drive, from the paved ground before RIPS up to the car park (owner)
  { x0: -277.5, x1: -275.4, z0: 336.6, z1: 339.4, flights: 1, steps: 7, tread: 0.3, alongZ: true },
  // the GCB Lecture Building: the broad stair up the middle between the two ramps, to the gallery (owner)
  { x0: -415, x1: -395, z0: -138.7, z1: -133.7, flights: 4, steps: 4, tread: 0.45, alongZ: true },
  // Earth Science: the broad stair from the lawn up to the entrance, in two flights (owner's photos)
  { x0: 106.5, x1: 99.3, z0: 322.5, z1: 331.5, flights: 2, steps: 5, tread: 0.45, alongZ: true },
  // Physics: the steps from the end of the lane on the east up to its door
  { x0: 207.6, x1: 205.4, z0: 84, z1: 89, flights: 1, steps: 7, tread: 0.3 },
  // the Faculty of Arts: the stairs up through the retaining wall from the footway along Danquah Avenue (owner)
  { x0: 110.0, x1: 107.9, z0: -146.0, z1: -143.0, flights: 1, steps: 6, tread: 0.35, alongZ: true },
  // the N Block compound (owner's view 2): the two stairs between dark red cheek walls up the bank from the ground round
  // the K. Folson Building, one into the lane between the range behind the court and the long range, one before the range
  { x0: -377.1, x1: -374.3, z0: 68.6, z1: 71.0, flights: 1, steps: 8, tread: 0.34, alongZ: true },
  { x0: -377.1, x1: -374.3, z0: 58.8, z1: 61.2, flights: 1, steps: 8, tread: 0.34, alongZ: true },
  // Block A: the steps up the retaining wall from the car park to Pent Road (the owner's Pent PDF, page 26)
  { x0: 616.6, x1: 619.2, z0: -616.4, z1: -614.0, flights: 1, steps: 7, tread: 0.37 },
  // the back of Akuafo Hall Main (owner's second reference PDF, pages 48-54): three steps up from the hexagonal pavers
  // through the white edge of the raised lawn between the south wings
  { x0: 383.0, x1: 381.6, z0: 153.6, z1: 156.6, flights: 1, steps: 3, tread: 0.45, alongZ: true },
];

// the roads' own cuts (the owner's NSIA Road brief): NSIA Road lies lower than the ground either side of it, the tree belt
// on the west and LECIAD's ground on the east, with a gentle hump of its own along it; the connecting road runs down
// from the lane's crest to it between banks; the road east to LECIAD climbs out of it gently
const nsiaX = (z: number) => (z < -77 ? 236 - ((z + 162) / 85) * 1 : z > 20 ? 235 + ((z - 20) / 94) * 1 : 235);
const PATHS: Path[] = [
  // (on the east, a short stretch held by a retaining wall instead of the bank: pair 6, its ends easing into the bank)
  {
    pts: NSIA.nsiaProfile.map(([z, h]) => [nsiaX(z), z, h]), half: NSIA.nsiaHalf, bank: NSIA.nsiaBank,
    bankAt: (x, z) => {
      const R = NSIA.eastWall;
      if (x < nsiaX(z) || z < R.z0 - R.ease || z > R.z1 + R.ease) return NSIA.nsiaBank;
      const f = z < R.z0 ? (R.z0 - z) / R.ease : z > R.z1 ? (z - R.z1) / R.ease : 0;
      return R.bank + (NSIA.nsiaBank - R.bank) * f;
    },
  },
  { pts: NSIA.connector, half: NSIA.connectorHalf, bank: NSIA.connectorBank },
  { pts: NSIA.eastRoad, half: NSIA.eastRoadHalf, bank: NSIA.eastRoadBank },
];

const boxOf = (q: Zone) => q.kind !== 'hill'
  ? { x0: q.x0 - q.w, x1: q.x1 + q.e, z0: q.z0 - q.n, z1: q.z1 + q.s }
  : { x0: Math.min(...q.profile.map((p) => p[0])), x1: Math.max(...q.profile.map((p) => p[0])), z0: q.zc - q.full - q.fall, z1: q.zc + q.full + q.fall };
const pathBox = (p: Path) => {
  const r = p.half + p.bank;
  return { x0: Math.min(...p.pts.map((q) => q[0])) - r, x1: Math.max(...p.pts.map((q) => q[0])) + r, z0: Math.min(...p.pts.map((q) => q[1])) - r, z1: Math.max(...p.pts.map((q) => q[1])) + r };
};
/** a box on the whole metres round it: a fine ground grid over a small zone then meets the coarser grids of the zones it
 *  lies in cell for cell, with no gap between them */
const snap = (b: { x0: number; x1: number; z0: number; z1: number }) => ({ x0: Math.floor(b.x0), x1: Math.ceil(b.x1), z0: Math.floor(b.z0), z1: Math.ceil(b.z1) });
const ZONE_BOXES = ZONES.map((q) => (q.kind !== 'hill' && q.cell ? snap(boxOf(q)) : boxOf(q)));
/** the area each zone touches (the zones, then the roads' cuts) */
export const RELIEF_BOXES = [...ZONE_BOXES, ...PATHS.map((p) => snap(pathBox(p))), snap({ x0: NSIA.lowPad.x0 - NSIA.lowPad.bank, x1: NSIA.lowPad.x1 + NSIA.lowPad.bank, z0: NSIA.lowPad.z0 - NSIA.lowPad.bank, z1: NSIA.lowPad.z1 + NSIA.lowPad.bank })];
/** the ground grid's cell over each box */
const BOX_CELL = [...ZONES.map((q) => (q.kind !== 'hill' ? q.cell : undefined)), ...PATHS.map(() => 0.5), 0.25];

/** a hill's height along its axis */
function profileAt(p: [number, number][], x: number) {
  for (let i = 0; i < p.length - 1; i++) {
    const [ax, ah] = p[i], [bx, bh] = p[i + 1];
    if (x >= ax && x <= bx) return ah + ((bh - ah) * (x - ax)) / (bx - ax || 1);
  }
  return 0;
}
/** a point in a stairway's own terms: how far along its climb (u, the x of an x stairway) and across it */
const along = (s: Stairs, x: number, z: number) => (s.alongZ ? [z, x] : [x, z]);
/** the top of a stairway's tread at u (x, or z): flights of steps going up from its foot toward its top, landings between */
function stairAt(s: Stairs, foot: number, top: number, x: number) {
  const dir = Math.sign(s.x1 - s.x0), len = Math.abs(s.x1 - s.x0), u = (x - s.x0) * dir;
  if (u <= 0) return foot;
  if (u >= len) return top;
  const seg = len / s.flights, rise = (top - foot) / s.flights, r = rise / s.steps, k = Math.floor(u / seg), w = u - k * seg;
  return foot + k * rise + Math.min(s.steps, Math.floor(w / s.tread) + 1) * r;
}
const inCorridor = (s: Stairs, x: number, z: number) => { const [u, c] = along(s, x, z); return c > s.z0 && c < s.z1 && u < Math.max(s.x0, s.x1) && u > Math.min(s.x0, s.x1); };
/** the ground at the top and at the foot of a stairway */
const endOf = (s: Stairs, u: number) => { const c = (s.z0 + s.z1) / 2; return s.alongZ ? zoneHeight(c, u) : zoneHeight(u, c); };
const topOf = (s: Stairs) => endOf(s, s.x1);
const footOf = (s: Stairs) => endOf(s, s.x0 - Math.sign(s.x1 - s.x0) * 0.5);
/** where the stairways are, the height of their top and foot, and the tread height along the climb */
export function stairsOf() {
  return STAIRS.map((s) => { const top = topOf(s), foot = footOf(s); return { ...s, top, foot, at: (u: number) => stairAt(s, foot, top, u) }; });
}

/** inside a stairway (its steps are modelled: the ground mesh keeps below them) */
export const inStairs = (x: number, z: number) => STAIRS.some((s) => inCorridor(s, x, z));

/** the ground the zones make, without the stairways */
function zoneHeight(x: number, z: number) {
  let hill = 0, low = 0, high = 0;
  for (let i = 0; i < ZONES.length; i++) {
    const q = ZONES[i], bx = ZONE_BOXES[i];
    if (x < bx.x0 || x > bx.x1 || z < bx.z0 || z > bx.z1) continue;
    if (q.kind !== 'hill') {
      // how far up (or down) the slope, 0 on the floor, 1 at its foot: the steeper of the two directions wins
      const x0 = q.west ? q.west(Math.min(q.z1, Math.max(q.z0, z))) : q.x0;
      const tx = x < x0 ? (x0 - x) / q.w : x > q.x1 ? (x - q.x1) / q.e : 0;
      const tz = z < q.z0 ? (q.z0 - z) / q.n : z > q.z1 ? (z - q.z1) / q.s : 0;
      const t = Math.min(1, Math.max(tx, tz));
      // eased at the top and the foot of the slope: no sharp edge for a road or the ground mesh to cut across
      const e = 1 - t * t * (3 - 2 * t);
      const depth = q.top ? q.top(Math.min(q.x1, Math.max(x0, x)), Math.min(q.z1, Math.max(q.z0, z))) : q.depth;
      if (q.kind === 'hollow') low = Math.min(low, -depth * e);
      else high = Math.max(high, depth * e);
    } else {
      const d = Math.abs(z - q.zc), t = d <= q.full ? 1 : d >= q.full + q.fall ? 0 : 1 - (d - q.full) / q.fall;
      hill += profileAt(q.profile, x) * t * t * (3 - 2 * t);
    }
  }
  return hill + low + high;
}

/** a flat pad for a building standing lower than the ground round it (or higher): the ground is `h` over the rectangle
 *  and eases back to the zones' ground over `bank` metres (a short bank is a retaining edge, modelled where it stands) */
interface Pad { x0: number; x1: number; z0: number; z1: number; h: number; bank: number }
const PADS: Pad[] = [NSIA.lowPad];
const PAD_BOXES = PADS.map((p) => ({ x0: p.x0 - p.bank, x1: p.x1 + p.bank, z0: p.z0 - p.bank, z1: p.z1 + p.bank }));
const PATH_BOXES = PATHS.map(pathBox);
/** a road's cut at x, z: how much it decides the ground there (1 on the road, easing to 0 at the bank's foot) and its height */
function pathAt(p: Path, x: number, z: number): [number, number, number] {
  let best = Infinity, h = 0;
  for (let i = 0; i < p.pts.length - 1; i++) {
    const [ax, az, ah] = p.pts[i], [bx, bz, bh] = p.pts[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
    const t = Math.min(1, Math.max(0, ((x - ax) * dx + (z - az) * dz) / l2)), d = Math.hypot(ax + dx * t - x, az + dz * t - z);
    if (d < best) { best = d; h = ah + (bh - ah) * t; }
  }
  const bank = p.bankAt ? p.bankAt(x, z) : p.bank;
  if (best >= p.half + bank) return [0, 0, best];
  if (best <= p.half) return [1, h, best];
  const t = (best - p.half) / bank;
  return [1 - t * t * (3 - 2 * t), h, best];
}

/** Height of the ground at a point (0 on the flat campus, negative in a hollow, positive on a hill or terrace). */
export function groundHeight(x: number, z: number) {
  for (const s of STAIRS) if (inCorridor(s, x, z)) return stairAt(s, footOf(s), topOf(s), along(s, x, z)[0]);
  const base = zoneHeight(x, z);
  // a road's cut decides the ground on it and eases into the ground beside it; where two meet the stronger wins, and on
  // both roads at once (a junction) the one whose line is nearer
  let W = 0, H = 0, D = Infinity;
  for (let i = 0; i < PATHS.length; i++) {
    const b = PATH_BOXES[i];
    if (x < b.x0 || x > b.x1 || z < b.z0 || z > b.z1) continue;
    const [w, h, d] = pathAt(PATHS[i], x, z);
    if (w > W + 1e-9 || (w > 0 && Math.abs(w - W) <= 1e-9 && d < D)) { W = w; H = h; D = d; }
  }
  for (let i = 0; i < PADS.length; i++) {
    const p = PADS[i], b = PAD_BOXES[i];
    if (x < b.x0 || x > b.x1 || z < b.z0 || z > b.z1) continue;
    const d = Math.hypot(Math.max(p.x0 - x, 0, x - p.x1), Math.max(p.z0 - z, 0, z - p.z1)), t = d / p.bank;
    const w = d <= 0 ? 1 : t >= 1 ? 0 : 1 - t * t * (3 - 2 * t);
    if (w > W + 1e-9) { W = w; H = p.h; }
  }
  return W > 0 ? base + (H - base) * W : base;
}

const inBox = (x: number, z: number, pad = 0) => RELIEF_BOXES.some((b) => x > b.x0 - pad && x < b.x1 + pad && z > b.z0 - pad && z < b.z1 + pad);

/** Adds points every `step` metres to the parts of a polyline inside a relief zone, so it can follow the slope. */
export function densify(pts: [number, number][], step = 2): [number, number][] {
  if (pts.length < 2 || !pts.some(([x, z]) => inBox(x, z, 40))) return pts;
  const out: [number, number][] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i];
    const len = Math.hypot(bx - ax, bz - az);
    const n = inBox(ax, az, 5) || inBox(bx, bz, 5) || inBox((ax + bx) / 2, (az + bz) / 2, 5) ? Math.ceil(len / step) : 1;
    for (let k = 1; k <= n; k++) out.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
  }
  return out;
}

/**
 * Sets the ground under everything in a group: a merged world-space mesh has each vertex dropped
 * by the ground height at its x, z; an instanced mesh each instance by the height under its origin;
 * a placed object (a model, a sign, an arch) as a whole by the height under its position.
 */
export function applyRelief(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const m = new THREE.Matrix4(), v = new THREE.Vector3(), I = new THREE.Matrix4();
  const visit = (o: THREE.Object3D) => {
    if (o.name === 'relief-ground' || o.userData.noRelief) return;
    if (o !== root && !o.matrix.equals(I)) {
      // a placed object: it stands where its origin is
      o.getWorldPosition(v);
      const h = groundHeight(v.x, v.z);
      if (h !== 0) { o.position.y += h; o.updateMatrixWorld(true); }
      return;
    }
    const mesh = o as THREE.Mesh;
    if ((mesh as THREE.InstancedMesh).isInstancedMesh) {
      const im = mesh as THREE.InstancedMesh;
      let touched = false;
      for (let i = 0; i < im.count; i++) {
        im.getMatrixAt(i, m);
        const e = m.elements, h = groundHeight(e[12], e[14]);
        if (h !== 0) { e[13] += h; im.setMatrixAt(i, m); touched = true; }
      }
      if (touched) { im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); }
    } else if (mesh.isMesh && mesh.geometry) {
      const geo = mesh.geometry;
      if (!geo.boundingBox) geo.computeBoundingBox();
      const bb = geo.boundingBox!;
      if (RELIEF_BOXES.some((b) => bb.max.x > b.x0 && bb.min.x < b.x1 && bb.max.z > b.z0 && bb.min.z < b.z1)) {
        const pos = geo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
          const h = groundHeight(pos.getX(i), pos.getZ(i));
          if (h !== 0) pos.setY(i, pos.getY(i) + h);
        }
        pos.needsUpdate = true;
        geo.computeBoundingBox();
        geo.computeBoundingSphere();
      }
    }
    for (const c of o.children) visit(c);
  };
  visit(root);
}

/**
 * The ground over the relief zones: a grid that follows groundHeight, in the campus grass
 * material (its UVs line up with the flat ground tiles: u = x / tile, v = -z / tile).
 * Each patch of ground is drawn by one grid only: where a small zone (a terrace, a hollow) lies inside a
 * big one (the hill), the big grid leaves its cells to the small zone's finer grid (two surfaces sampled
 * differently disagree across a slope's edge by up to a metre: grass over the road, a rider half sunk).
 * `sink` lowers the grid under the roads: a road's strip is flat across its width, the ground under it is not, and
 * on a slope crossed at an angle the grass would otherwise show through the middle of the road.
 */
export function reliefGround(material: THREE.Material, tile: number, sink: (x: number, z: number) => number = () => 0) {
  const geos: THREE.BufferGeometry[] = [];
  const area = (b: (typeof RELIEF_BOXES)[number]) => (b.x1 - b.x0) * (b.z1 - b.z0);
  RELIEF_BOXES.forEach((b, bi) => {
    const big = area(b) > 200000, cell = BOX_CELL[bi] ?? (big ? 2 : 1);
    // the smaller zones overlapping this one draw their own ground
    const others = RELIEF_BOXES.filter((o, oi) => oi !== bi && area(o) < area(b) && o.x1 > b.x0 && o.x0 < b.x1 && o.z1 > b.z0 && o.z0 < b.z1);
    const nx = Math.ceil((b.x1 - b.x0) / cell), nz = Math.ceil((b.z1 - b.z0) / cell);
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const x = b.x0 + ((b.x1 - b.x0) * i) / nx, z = b.z0 + ((b.z1 - b.z0) * j) / nz;
      pos.push(x, groundHeight(x, z) - (inStairs(x, z) ? 0.6 : sink(x, z)), z);
      uv.push(x / tile, -z / tile);
    }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const cx = b.x0 + ((b.x1 - b.x0) * (i + 0.5)) / nx, cz = b.z0 + ((b.z1 - b.z0) * (j + 0.5)) / nz;
      if (others.some((o) => cx > o.x0 && cx < o.x1 && cz > o.z0 && cz < o.z1)) continue;
      const a = j * (nx + 1) + i, c = a + nx + 1;
      idx.push(a, c, a + 1, a + 1, c, c + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    geos.push(g);
  });
  const mesh = new THREE.Mesh(geos.length > 1 ? mergeGeometries(geos) : geos[0], material);
  mesh.receiveShadow = true;
  mesh.name = 'relief-ground';
  return mesh;
}
