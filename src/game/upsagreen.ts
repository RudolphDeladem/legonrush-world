// The UPSA campus's planting and the bush west of its wall, from the owner's Apple hybrid aerial (docs/upsa-campus/;
// read into UPSA_COVER by scripts/landcover/cover.py). Every clip of the owner's UPSA packs shows thick bush and trees
// up to the campus's west wall, and shade trees on the lawns and round the car parks; the game had lawn.
// - West of the wall: the aerial's cover painted over the grass (thicket floor, green low cover, dry cover, bare red
//   and pale patches), with crowns by the aerial's dense green: trees on short trunks in the thickest cells, low bushes
//   round them, scattered shrubs on the open patches.
// - On the campus: shade trees only where the aerial shows crowns (dense green), off the roads and paths, the buildings,
//   the car-park bays and the models' courts and pitch.
// Deterministic (hashes of position). The trees' heights and trunks are estimates: the aerial shows crowns, not trunks.
import * as THREE from 'three';
import { AREAS, BUILDINGS, NODE_XZ, ROADS, buildingAt } from './campusmap';
import { UPSA_COVER } from './landcover';
import { coverAt } from './ghlplan';
import { coverOverlay, crownTiles, hash2, vnoise2, type Crown, type P2, type RGBA } from './scrubkit';
import { segIndex, type Seg5 } from './seggrid';
import { BLOCK_SITES } from './sites';
import { UPSA_LAND } from './upsawestplan';

const cover = (x: number, z: number) => coverAt(UPSA_COVER, x, z);
/** the aerial's extent, and the campus's west wall (x 2136 along the strip the aerial covers) */
const BOX: [number, number, number, number] = [UPSA_COVER.x0, UPSA_COVER.x0 + UPSA_COVER.nx * UPSA_COVER.cell, UPSA_COVER.z0, UPSA_COVER.z0 + UPSA_COVER.nz * UPSA_COVER.cell];
const WALL_X = 2135;
const WEST: [number, number, number, number] = [BOX[0], WALL_X, BOX[2], -892];

const inPoly = (r: P2[], x: number, z: number) => {
  let o = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > z) !== (r[j][1] > z) && x < ((r[j][0] - r[i][0]) * (z - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) o = !o;
  return o;
};
const inRingF = (p: Float32Array, x: number, z: number) => {
  let o = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) o = !o;
  return o;
};

// the roads and paths round the aerial (half widths by class), indexed
const SEGS: Seg5[] = [];
const LINES: { pts: P2[]; half: number }[] = [];
for (const r of ROADS) {
  const pts = r.nodes.map((n) => [NODE_XZ[n * 2], NODE_XZ[n * 2 + 1]] as P2);
  if (!pts.some(([x, z]) => x > BOX[0] - 40 && x < BOX[1] + 40 && z > BOX[2] - 40 && z < BOX[3] + 40)) continue;
  const half = [4.5, 3.7, 3.1, 2.3, 1.3][r.cls];
  LINES.push({ pts, half: half + 0.4 });
  for (let i = 0; i < pts.length - 1; i++) SEGS.push([pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], half]);
}
const roadGap = segIndex(SEGS);
const PARKING = AREAS.filter((a) => a.kind === 'parking' && a.pts.some((v, i) => (i % 2 ? v > BOX[2] && v < BOX[3] : v > BOX[0] && v < BOX[1])));
const inParking = (x: number, z: number) => PARKING.some((a) => inRingF(a.pts, x, z));

/** a plant of radius r at x, z stands clear of the roads, the buildings, the car-park bays and the models */
const free = (x: number, z: number, r: number) =>
  roadGap(x, z, 12) > r * 0.6 + 0.8 && !buildingAt(x, z, r * 0.7 + 1.2) && !inParking(x, z) && !BLOCK_SITES.some((s) => s.keepsOut(x, z, r * 0.5));

// ---------- the ground west of the wall ----------
/** per class: colour (sRGB) and opacity over the grass; the thicket floor dark, the bare patches red-brown and pale */
const GROUND: Record<number, [number, number, number, number]> = {
  1: [70, 80, 44, 0.92], 2: [98, 120, 56, 0.75], 3: [146, 138, 86, 0.9], 4: [160, 106, 70, 0.95], 5: [196, 180, 148, 0.92], 6: [118, 92, 64, 0.94],
};
function westColor(x: number, z: number): RGBA | null {
  if (x > WALL_X || x < WEST[0] + 1 || z < WEST[2] + 1 || z > WEST[3]) return null;
  const jx = (vnoise2(x * 0.2, z * 0.2) - 0.5) * 5, jz = (vnoise2(x * 0.2 + 41, z * 0.2 - 17) - 0.5) * 5;
  const c = cover(x + jx, z + jz)[0];
  if (!c) return null;
  // faded out over the last 8 m toward the aerial's edges and the wall
  const edge = Math.min(WALL_X - x, x - WEST[0], z - WEST[2], WEST[3] - z), fade = Math.min(1, Math.max(0, edge / 8));
  const [r0, g0, b0, a0] = GROUND[c], t = (vnoise2(x * 0.3 + 9, z * 0.3) - 0.5) * 20, f = (hash2(Math.floor(x * 1.6), Math.floor(z * 1.6)) - 0.5) * 14;
  return [r0 + t + f, g0 + t + f, b0 + t * 0.7 + f, a0 * fade];
}

// ---------- the plants ----------
const DENSE = ['#2f4a24', '#365229', '#3d5a2c', '#2c4520', '#41602f', '#4a6633', '#38552a'];
const SHADE = ['#3d5f2e', '#466a33', '#3a5a2b', '#4f7238', '#41632f'];
const OLIVE = ['#5b6a34', '#66713a', '#55643a', '#4e6230'];
const pick = (a: string[], h: number) => a[Math.floor(h * a.length) % a.length];

function westCrowns(out: Crown[]) {
  const B = 6;
  for (let bx = WEST[0]; bx < WEST[1]; bx += B) for (let bz = WEST[2]; bz < WEST[3]; bz += B) {
    const cx = bx + B / 2, cz = bz + B / 2, h = (k: number) => hash2(cx * 0.41 + k, cz * 0.57 - k * 1.3);
    let nd = 0, mx = 0, mz = 0;
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const x = bx + 1 + i * 2, z = bz + 1 + j * 2, [c] = cover(x, z);
      counts[c]++;
      if (c === 1) { nd++; mx += x; mz += z; }
    }
    const put = (x: number, z: number, r: number, hh: number, base: number, trunk: number, color: string, seed: number) => {
      if (x + r < WALL_X && free(x, z, r)) out.push({ x, z, r, h: hh, base, trunk, color, seed, solid: trunk > 0 });
    };
    if (nd >= 5) {
      mx = mx / nd + (h(1) - 0.5) * 2; mz = mz / nd + (h(2) - 0.5) * 2;
      // a tree on a short trunk with its foliage low (the thickets in the clips), now and then a taller crown
      const big = h(3) < 0.18, r = big ? 4 + h(4) * 1.6 : 2.6 + h(4) * 1.2;
      put(mx, mz, r, r * (big ? 1.4 : 1.15), big ? 2 + h(5) : 0.7 + h(5) * 0.7, big ? 0.26 : 0.17, pick(DENSE, h(6)), h(7));
      if (h(8) < 0.6) { const a = h(9) * 6.283, d = 2.5 + h(10) * 1.5, rr = 1.3 + h(11) * 0.9; put(mx + Math.cos(a) * d, mz + Math.sin(a) * d, rr, rr * 0.9, 0.1, 0, pick(DENSE, h(12)), h(13)); }
    } else if (nd >= 2) {
      mx = mx / nd + (h(1) - 0.5) * 2; mz = mz / nd + (h(2) - 0.5) * 2;
      const r = 1.5 + nd * 0.3 + h(4) * 0.7;
      put(mx, mz, r, r * 0.95, 0.15, 0, pick(DENSE, h(6)), h(7));
    } else {
      const cls = counts.indexOf(Math.max(...counts.slice(1)), 1), x = cx + (h(1) - 0.5) * 4, z = cz + (h(2) - 0.5) * 4;
      if (cls === 2 && h(3) < 0.3) { const r = 0.9 + h(4) * 0.8; put(x, z, r, r * 0.9, 0.1, 0, pick(DENSE, h(5)), h(6)); }
      else if (cls === 3 && h(3) < 0.18) { const r = 0.8 + h(4) * 0.6; put(x, z, r, r * 0.9, 0.1, 0, pick(OLIVE, h(5)), h(6)); }
      else if ((cls === 4 || cls === 6) && h(3) < 0.1) { const r = 0.6 + h(4) * 0.5; put(x, z, r, r, 0.05, 0, pick(OLIVE, h(5)), h(6)); }
    }
  }
}

/** shade trees on the campus where the aerial shows crowns */
function campusCrowns(out: Crown[]) {
  const B = 6;
  for (let bx = WALL_X + 2; bx < BOX[1]; bx += B) for (let bz = BOX[2]; bz < BOX[3]; bz += B) {
    const cx = bx + B / 2, cz = bz + B / 2;
    if (!inPoly(UPSA_LAND, cx, cz)) continue;
    let nd = 0, mx = 0, mz = 0;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const x = bx + 1 + i * 2, z = bz + 1 + j * 2;
      if (cover(x, z)[0] === 1) { nd++; mx += x; mz += z; }
    }
    if (nd < 4) continue;
    const h = (k: number) => hash2(cx * 0.37 + k, cz * 0.61 - k * 1.9);
    mx = mx / nd + (h(1) - 0.5) * 1.5; mz = mz / nd + (h(2) - 0.5) * 1.5;
    const r = 2.6 + (nd - 4) * 0.3 + h(3) * 1.0;
    if (!inPoly(UPSA_LAND, mx, mz) || !free(mx, mz, r)) continue;
    out.push({ x: mx, z: mz, r, h: r * (1.15 + h(4) * 0.25), base: 2.2 + h(5) * 1.0, trunk: 0.22 + h(6) * 0.08, color: pick(SHADE, h(7)), seed: h(8), solid: true });
  }
}

/** Everything this file draws: the painted ground west of the wall and the crowns, in tiles. */
export function buildUpsaGreen() {
  const group = new THREE.Group();
  group.name = 'upsa-green';
  const rings: P2[][] = [];
  for (const b of BUILDINGS) {
    if (b.maxX < WEST[0] || b.minX > WEST[1] || b.maxZ < WEST[2] || b.minZ > WEST[3]) continue;
    const r: P2[] = [];
    for (let i = 0; i < b.pts.length; i += 2) r.push([b.pts[i], b.pts[i + 1]]);
    rings.push(r);
  }
  const overlays = coverOverlay({ box: WEST, mpp: 1, cell: 2, tile: 120, color: westColor, clearLines: LINES, clearRings: rings, cellIn: (x, z) => x < WALL_X + 1 && cover(x, z)[0] > 0 });
  for (const m of overlays) { m.userData.noRelief = true; group.add(m); }
  const crowns: Crown[] = [];
  westCrowns(crowns);
  campusCrowns(crowns);
  group.add(...crownTiles(crowns, 100, 75));
  group.userData.cullMeshes = overlays;
  group.userData.crowns = crowns.length;
  return group;
}
