// The agriculture precinct round the West Africa Centre for Crop Improvement (WACCI), to the owner's Crop Improvement and
// Agriculture Precinct brief (pictures 1 to 9; cameras crop1 ... crop9 in cropviews.ts). The generic two- and three-storey
// classroom boxes the map's outlines produced are replaced by the low white family the photographs show: rendered walls
// on a red lower band, weathered red tile hips and gables with deep eaves over a pale soffit, smaller dark windows,
// louvres and doors that vary from face to face (enkit.ts lowWing). Each mass keeps its mapped outline (cut into the
// rectangles of its plan) and its own storey count:
// - the department group north of Onyaa Road (pictures 6 to 9): low front wings with their gable ends to the road, the
//   longer middle buildings stepping up to two storeys in their middle parts only, the U of wings round a court, the
//   broad-roofed Agric Science Extension with its veranda, the rear rows broken into lengths with a gap between them and
//   a covered passage across it; patchy grass, worn earth under the trees, narrow concrete walks through the courts;
// - east of the WACCI forecourt (pictures 2, 3): the low group beyond the carport, a hipped block and a gabled wing with a
//   shaded veranda, no upper storey; behind them (pictures 4, 5) the compact one-storey annex under its broad aged hip,
//   sparse openings, a wall unit, its ground of patchy grass and red earth with a narrow path to the tanks;
// - by the Child Study Centre (picture 1): the two-storey block brought down to one storey in the same family, and its
//   neighbours with it.
// The College of Agric and Consumer Science, Soil Science, Agriculture Economics, WACCI and its tanks keep their models
// (agric.ts and the College's); nothing here is measured, the storey counts are read from the photographs.
import * as THREE from 'three';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { Bag, WALL, facesOf, gh, hash, lowWing, openings, vnoise, type R4 } from './enkit';
import { broadleaf } from './nsiaroad';
import { gableTri } from './ias';
import { drapeAt, groundCover } from './kuffourgarden';
import { NODE_XZ, ROADS } from './campusmap';
import { SOLIDS } from './solids';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, WALL) };
const TILES = ['#a9563c', '#9c5236', '#b25e40', '#94503a'];

/** one mass of the precinct: its rectangle (world), storeys, ridge direction, gable ends (gw: 9 a gable, 0 a hip), roof,
 *  openings per face for the ground floor and (two storeys) the upper floor */
interface Mass { r: R4; lv: 1 | 2; along: 'x' | 'z'; ends?: [number, number]; roof?: number; faces: Partial<Record<'z0' | 'z1' | 'x0' | 'x1', string>>; up?: Partial<Record<'z0' | 'z1' | 'x0' | 'x1', string>>; over?: number }

/** the roads near a point (their half widths), so ground drapes and trees keep off them */
const SEGS: [number, number, number, number, number][] = [];
for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++) {
  const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
  if (Math.max(ax, bx) < 240 || Math.min(ax, bx) > 490 || Math.max(az, bz) < 140 || Math.min(az, bz) > 390) continue;
  SEGS.push([ax, az, bx, bz, [9, 7.4, 6.2, 4.6, 2.6][r.cls] / 2]);
}
const nearRoad = (x: number, z: number, pad: number) => SEGS.some(([ax, az, bx, bz, h]) => {
  const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(ax + dx * t - x, az + dz * t - z) < h + pad;
});

/** the masses of one model: walls, red band, roof, openings; a slab line and the upper openings for two storeys */
function build(k: Kit, b: Bag, masses: Mass[]) {
  masses.forEach((m, i) => {
    const [x0, x1, z0, z1] = m.r;
    const y = Math.min(gh(x0, z0), gh(x1, z0), gh(x0, z1), gh(x1, z1));
    const eave = m.lv === 2 ? 6.6 : 3.3;
    const ends = m.ends ?? [0, 0];
    lowWing(k, b, m.r, { eave, faces: m.faces, along: m.along, roof: TILES[(m.roof ?? i) % TILES.length], ends, over: m.over ?? 1.0, y });
    // the gable ends' walls up to the ridge
    ends.forEach((gw, e) => {
      if (!gw) return;
      if (m.along === 'x') gableTri(b, false, e ? x1 : x0, e ? 1 : -1, z0, z1, y + eave, 0.45 * 0.97);
      else gableTri(b, true, e ? z1 : z0, e ? 1 : -1, x0, x1, y + eave, 0.45 * 0.97);
    });
    if (m.lv === 2) {
      const F = facesOf(m.r);
      b.c.push([b.B(x0 - 0.05, x1 + 0.05, y + 3.25, y + 3.42, z0 - 0.05, z1 + 0.05), '#e7e2d6']);
      for (const [side, pat] of Object.entries(m.up ?? {}) as ['z0' | 'z1' | 'x0' | 'x1', string][]) openings(b, F[side], pat, y + 3.3, { winH: 1.2, sill: 1.0 });
    }
  });
}
/** a ground drape over a box: patchy grass, worn reddish earth, leaf litter; off the roads, the masses and their aprons */
function ground(k: Kit, O: [number, number], box: R4, masses: R4[]) {
  const [x0, x1, z0, z1] = box;
  k.meshes.push(new THREE.Mesh(drapeAt(O, x0, x1, z0, z1, 0.8, 0.035, (x, z) => {
    if (nearRoad(x, z, 0.8) || masses.some(([a, b2, c, d]) => x > a - 0.6 && x < b2 + 0.6 && z > c - 0.6 && z < d + 0.6)) return null;
    const n = vnoise(x * 0.28, z * 0.28), m = vnoise(x * 0.6 + 7, z * 0.6);
    // (the bare earth under the trees and in the courts, not along the road's verge)
    if (n > 0.72 && !nearRoad(x, z, 6)) return [0.48 + m * 0.05, 0.38, 0.28];
    if (n > 0.58 && m > 0.6) return [0.44, 0.43, 0.28];
    if (m < 0.2) return [0.38, 0.46, 0.23];
    return null;
  }), groundCover()));
}
/** a narrow concrete walk along a polyline, on the ground */
function walk(k: Kit, O: [number, number], pts: [number, number][], w = 1.4) {
  let bx0 = Infinity, bx1 = -Infinity, bz0 = Infinity, bz1 = -Infinity;
  for (const [x, z] of pts) { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); bz0 = Math.min(bz0, z); bz1 = Math.max(bz1, z); }
  const d = (x: number, z: number) => {
    let best = Infinity;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [cx, cz] = pts[i + 1], dx = cx - ax, dz = cz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
      best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z));
    }
    return best;
  };
  k.meshes.push(new THREE.Mesh(drapeAt(O, bx0 - w, bx1 + w, bz0 - w, bz1 + w, 0.3, 0.05, (x, z) => {
    if (d(x, z) > w / 2 || nearRoad(x, z, 0.2)) return null;
    const h = hash(Math.floor(x * 1.2), Math.floor(z * 1.2)) * 0.05;
    return [0.68 - h, 0.66 - h, 0.62 - h];
  }), groundCover()));
}

// ---------- the department group north of Onyaa Road (pictures 6 to 9) ----------
const NORTH: Mass[] = [
  // the rear row, in two lengths with a covered passage across the gap between them
  { r: [268.9, 292.4, 158.3, 170.7], lv: 1, along: 'x', ends: [9, 0], faces: { z1: 'W-WDW-W-W', z0: 'w-w-w-w-w', x0: 'W-W' } },
  { r: [294.6, 319.6, 158.3, 170.7], lv: 1, along: 'x', ends: [0, 9], roof: 2, faces: { z1: 'W-WW-DW-W', z0: 'w-w-w-w-w', x1: 'WDW' } },
  // the longer middle building: one storey at its ends, two in the middle (its window rows), the roofs stepping
  { r: [266.2, 280.0, 196.6, 210.5], lv: 1, along: 'x', faces: { z1: 'W-DW', z0: 'w-w-w', x0: 'W-W' } },
  { r: [280.0, 311.0, 196.6, 210.5], lv: 2, along: 'x', roof: 1, faces: { z1: 'W-WD-WW-DW-W', z0: 'W-W-W-W-W-W' }, up: { z1: 'W-W-W-W-W-W-W', z0: 'w-w-w-w-w-w' } },
  { r: [311.0, 324.5, 196.6, 210.5], lv: 1, along: 'x', roof: 3, faces: { z1: 'WD-W', z0: 'w-w-w', x1: 'W-W' } },
  // the low wing west of the court
  { r: [260.2, 268.7, 216.8, 237.2], lv: 1, along: 'z', ends: [0, 9], faces: { x0: 'W-W-W-W', x1: 'W-DW-W', z1: 'W' } },
  // the U of wings round the court (open to the south)
  { r: [269.2, 274.7, 217.3, 238.7], lv: 1, along: 'z', ends: [0, 9], roof: 2, faces: { x1: 'W-D-W-W', z1: 'D' } },
  { r: [274.7, 294.0, 217.3, 221.4], lv: 1, along: 'x', roof: 1, faces: { z1: 'W-WDW-W', z0: 'w-w-w-w' } },
  { r: [294.0, 299.2, 217.1, 238.8], lv: 1, along: 'z', ends: [0, 9], roof: 2, faces: { x0: 'W-W-D-W', z1: 'D' } },
  // the Agric Science Extension: broad deep roof, the veranda's shade toward the road
  { r: [309.0, 328.3, 219.1, 244.9], lv: 1, along: 'z', over: 1.8, roof: 3, faces: { z1: 'W-WDDW-W', x0: 'W-W-W-W-W', x1: 'W-WD-W-W', z0: 'w-w-w-w' } },
  // the long range east of it, one storey at the ends and two in its middle length
  { r: [332.4, 356.0, 216.7, 226.2], lv: 1, along: 'x', faces: { z1: 'W-WDW-W-W', z0: 'w-w-w-w-w', x0: 'W-W' } },
  { r: [356.0, 384.0, 216.7, 226.2], lv: 2, along: 'x', roof: 2, faces: { z1: 'W-W-DW-W-W', z0: 'W-W-W-W-W' }, up: { z1: 'W-W-W-W-W-W', z0: 'w-w-w-w-w' } },
  { r: [384.0, 406.4, 216.7, 226.2], lv: 1, along: 'x', roof: 1, faces: { z1: 'W-DW-W-W', z0: 'w-w-w-w', x1: 'W-W' } },
  // the front wings, their gable ends to the road
  { r: [350.6, 358.0, 231.5, 253.8], lv: 1, along: 'z', ends: [0, 9], roof: 3, faces: { x0: 'W-W-W-W', x1: 'W-D-W-W', z1: 'W' } },
  { r: [375.4, 381.0, 228.6, 248.5], lv: 1, along: 'z', ends: [0, 9], faces: { x0: 'W-D-W', x1: 'W-W-W-W', z1: 'W' } },
  { r: [371.6, 375.4, 227.5, 236.8], lv: 1, along: 'x', roof: 2, faces: { x0: 'D', z1: 'W' } },
  { r: [383.7, 391.4, 231.5, 253.4], lv: 1, along: 'z', ends: [0, 9], roof: 1, faces: { x0: 'W-W-D-W', x1: 'W-W-W-W', z1: 'W' } },
  // the small block behind the College
  { r: [364.0, 374.1, 194.2, 208.1], lv: 1, along: 'z', roof: 2, faces: { x0: 'W-W-W', x1: 'W-DW', z1: 'W-W' } },
  // the far rows to the east (the Department of Animal Science side): one in two lengths, one of two storeys
  { r: [418.3, 441.5, 195.9, 208.7], lv: 1, along: 'x', ends: [9, 0], faces: { z1: 'W-WDW-W-W', z0: 'w-w-w-w', x0: 'W-W' } },
  { r: [443.7, 469.0, 195.9, 208.7], lv: 1, along: 'x', ends: [0, 9], roof: 3, faces: { z1: 'W-W-DW-W-W', z0: 'w-w-w-w', x1: 'WD' } },
  // (one storey: the courtyard complex is a low perimeter of wings round an open court, the owner's Fire Station and Child
  // Lab brief, R1 and Pair 1; boateng.ts draws the court)
  { r: [419.5, 470.2, 159.3, 172.1], lv: 1, along: 'x', roof: 1, faces: { z1: 'W-W-WDW-W-W-W-W', z0: 'W-W-W-W-W-W-W-W' } },
];
const NO: [number, number] = [365, 210];
const northSpec: Spec = {
  name: 'Agriculture departments north of Onyaa Road',
  axis: [1, 0], origin: NO, storey: 3.3, style: PLAIN, roofColor: '#a9563c', fascia: '#4a3328', pitch: 0.45,
  onGround: true,
  replaces: [[264.4, 227], [295.4, 202], [294.2, 164.5], [271.9, 228], [284, 219.4], [296.6, 228], [318.6, 232], [369.4, 221.4], [354.3, 242.6], [378.5, 240], [387.5, 242.4], [369, 201], [443.6, 202.3], [444.8, 165.7]],
  blocks: [],
  keep: [],
  extras: (k: Kit) => {
    const b = new Bag(NO);
    build(k, b, NORTH);
    // the covered passage across the rear row's gap: a tile slab on posts
    const py = gh(293.5, 164.5);
    b.c.push([b.B(292.2, 294.8, py + 3.0, py + 3.2, 161.0, 168.0), '#9c5236']);
    for (const z of [161.3, 167.7]) for (const x of [292.6, 294.4]) { b.c.push([b.B(x - 0.1, x + 0.1, py, py + 3.0, z - 0.1, z + 0.1), '#ece8de']); SOLIDS.add(x, z, 0.15); }
    // the ground: patchy grass and worn earth between the wings, narrow walks through the courts
    ground(k, NO, [258, 472, 154, 259], NORTH.map((m) => m.r));
    walk(k, NO, [[363.2, 258.5], [363.2, 229.5], [331, 229.5], [331, 213.0], [262, 213.0]]);
    walk(k, NO, [[284, 238.5], [284, 222.5]]);
    walk(k, NO, [[293.5, 171.5], [293.5, 195.5]]);
    walk(k, NO, [[395, 258.5], [395, 228.5], [410, 228.5]], 1.2);
    // mature trees of varied crowns between the rows, over the courts and in the drive's loop
    for (const [x, z, h, s] of [[276, 183, 10, 15], [307, 186, 11, 16], [284, 231, 8, 11], [342, 246, 10, 14], [364.5, 242, 9, 12], [428, 246, 10, 14], [445, 184, 11, 15], [415, 186, 9, 12], [262.5, 247, 9, 13]] as [number, number, number, number][]) {
      if (!nearRoad(x, z, 3)) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x * 3 + z, origin: NO });
    }
    b.finish(k, 0.35);
  },
};

// ---------- east of the WACCI forecourt: the low group, the gabled wing, the rear annex (pictures 2 to 5) ----------
const EAST: Mass[] = [
  // the low block beyond the carport: one storey under a hip
  { r: [322.6, 335.8, 287.0, 297.8], lv: 1, along: 'x', faces: { z0: 'W-DW-W', x1: 'W-W', x0: 'W' } },
  // the compact annex behind it, the broad aged hip (picture 5)
  { r: [322.6, 335.6, 297.8, 308.4], lv: 1, along: 'x', over: 1.5, roof: 3, faces: { z1: 'w-W-w', x1: 'W-D', x0: '-w' } },
  // its small neighbour to the south, a gable to the east
  { r: [328.0, 337.6, 311.8, 318.6], lv: 1, along: 'x', ends: [0, 9], roof: 1, faces: { z0: 'W-D', z1: 'w-w', x1: 'W' } },
  // the gabled wing farther east with its veranda (the detached two-storey box in picture 2, now low)
  { r: [350.2, 356.5, 287.1, 299.4], lv: 1, along: 'z', ends: [9, 9], roof: 2, faces: { x0: 'WDW-W', x1: 'W-W-W', z0: 'W' } },
];
const EO: [number, number] = [338, 300];
const eastSpec: Spec = {
  name: 'Low group and annex east of WACCI',
  axis: [1, 0], origin: EO, storey: 3.3, style: PLAIN, roofColor: '#a9563c', fascia: '#4a3328', pitch: 0.45,
  onGround: true,
  replaces: [[329, 297], [332.8, 315.2], [353.4, 293.3]],
  blocks: [],
  keep: [[346.6 - EO[0], 350.2 - EO[0], 288 - EO[1], 299 - EO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(EO);
    build(k, b, EAST);
    // the gabled wing's veranda on its west side: a lean-to on slender posts
    const vy = gh(348.5, 293);
    b.c.push([new THREE.BoxGeometry(2.8, 0.12, 12.6).rotateZ(0.12).translate(348.8 - EO[0], vy + 2.85, 293.25 - EO[1]), '#9c5236']);
    for (const z of [287.5, 291.5, 295.5, 299.0]) { b.c.push([b.B(347.4, 347.6, vy, vy + 2.7, z - 0.1, z + 0.1), '#ece8de']); SOLIDS.add(347.5, z, 0.15); }
    b.c.push([b.B(347.2, 350.2, vy - 0.2, vy + 0.15, 287.1, 299.4), '#c8c2b6']);
    // the annex's wall unit (picture 5), the narrow path from the yard to the tanks
    const ay = gh(335.6, 303);
    b.c.push([b.B(335.62, 335.96, ay + 2.2, ay + 2.75, 302.4, 303.3), '#dcdcd6'], [b.B(335.96, 335.98, ay + 2.28, ay + 2.67, 302.5, 303.2), '#4a4d50']);
    walk(k, EO, [[318.6, 312.0], [323.0, 312.0], [326.5, 309.6]], 1.1);
    ground(k, EO, [320, 360, 284, 330], EAST.map((m) => m.r));
    broadleaf(k, b.leaf, 344.0, 316.5, { h: 9, spread: 12, seed: 233, origin: EO });
    b.finish(k, 0.4);
  },
};

// ---------- by the Child Study Centre (picture 1): one storey, the same family ----------
const SOUTH: Mass[] = [
  { r: [444.2, 465.9, 289.4, 301.6], lv: 1, along: 'x', ends: [9, 0], faces: { z0: 'W-wDW-W', z1: 'w-W-w-W', x0: 'W-W', x1: 'WD' } },
  { r: [403.3, 413.3, 283.2, 291.2], lv: 1, along: 'x', roof: 2, faces: { z0: 'WDW', z1: 'w-w', x1: 'W' } },
  { r: [408.2, 413.1, 354.8, 370.4], lv: 1, along: 'z', roof: 1, faces: { x0: 'W-W-W', x1: 'W-D-W', z0: 'W' } },
  { r: [413.1, 428.7, 366.2, 374.3], lv: 1, along: 'x', roof: 3, faces: { z0: 'W-WDW', z1: 'w-w-w-w' } },
  // (its north end is CEGENSA's gable, the owner's Fire Station and Child Lab brief, Pair 9: the gable wall up to the ridge;
  // boateng.ts adds its sign, vent, louvre and awning; the wall units on the east face, Pair 13)
  { r: [425.7, 432.8, 354.5, 366.2], lv: 1, along: 'z', ends: [9, 0], roof: 1, faces: { x0: 'W-D', x1: 'A-W-A', z0: '-' } },
];
const SO: [number, number] = [435, 320];
const southSpec: Spec = {
  name: 'Low buildings by the Child Study Centre',
  axis: [1, 0], origin: SO, storey: 3.3, style: PLAIN, roofColor: '#a9563c', fascia: '#4a3328', pitch: 0.45,
  onGround: true,
  replaces: [[455, 295.5], [408.3, 287.2], [430, 360]],
  blocks: [],
  keep: [],
  extras: (k: Kit) => {
    const b = new Bag(SO);
    build(k, b, SOUTH);
    b.finish(k, 0.4);
  },
};

/** the agriculture precinct's corrected buildings and grounds */
export const agPrecinctSite = createSite('agprecinct', [northSpec, eastSpec, southSpec]);
