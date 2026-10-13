// The land behind and around the Great Hall, and the tennis complex's tree belt (the owner's Great Hall surrounding
// landscape brief and Commonwealth west tennis court brief; ghlplan.ts, tennisplan.ts, landcover.ts;
// docs/great-hall-landscape/evidence-audit.md, docs/tennis-west/evidence-audit.md).
// The game had this land as one mown lawn. Here it is drawn as the aerials show it:
// - the ground: the aerials' patches laid over the grass as one painted picture following the ground (scrubkit.ts
//   coverOverlay): low green cover, dry olive cover, exposed red-orange soil, the pale clearing, dark litter under the
//   thickets; the patch edges loosened a little so the 4 m grid never shows; faded out over the last metres inside the
//   blue boundary so the work area meets the lawn round it softly;
// - the narrow worn earth tracks, every mapped path and track here (and the service roads the aerials show unsealed), in
//   compacted red-brown earth with trampled verges instead of asphalt or concrete (the routes over them are unchanged);
// - the plants, by the aerials' dense green: thickets and short-stemmed trees with their foliage near the ground, of
//   varied crown sizes, open gaps between the clusters, an occasional larger crown where the aerial's clusters are
//   biggest, scattered small shrubs on the green and dry cover, small dark shrubs on the dark brown ground; deterministic
//   (the same everywhere, every time); no orchard rows, no tall identical trunks. Trunk heights are not shown by the
//   aerials: the numbers below are the owner's short-stem preference, to adjust;
// - the tennis complex's belt beyond the trees modelled round its fence: mature crowns where Picture 12 is dense, outside
//   the mapped wood (whose trees the campus already plants) and outside the developed compounds.
// What it leaves alone: the Great Hall's and the Vice Chancellor's compounds, the Research and Innovation compound, every
// building, every sealed road, the tennis complex itself. The pale rectangle south-west of the Great Hall is ground, not
// a building (paleSite).
import * as THREE from 'three';
import { AREAS, BUILDINGS, NODE_XZ, ROADS, buildingNear } from './campusmap';
import { createSite, render, type Spec, type Style } from './blocks';
import { coverOverlay, crownTiles, hash2, type Crown, type P2, type RGBA, type Tuft } from './scrubkit';
import {
  EARTH_ROADS, GHL_BOX, GHL_EXCLUDE, GHL_SCOPE, PALE, PALE_AT, TC_EARTH, earthDist, earthLines, ghCover, inGhl, onSealed, tcCover,
} from './ghlplan';
import { TC, inTcFloor } from './tennisplan';

// ---------- cheap noise for the painting (a table, not trigonometry: two million pixels) ----------
const NT = 256, TABLE = new Float32Array(NT * NT);
for (let i = 0; i < TABLE.length; i++) TABLE[i] = hash2(i % NT, Math.floor(i / NT) + 0.5);
const tn = (x: number, z: number) => {
  const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi, i0 = xi & 255, j0 = zi & 255, i1 = (i0 + 1) & 255, j1 = (j0 + 1) & 255;
  const a = TABLE[j0 * NT + i0], b = TABLE[j0 * NT + i1], c = TABLE[j1 * NT + i0], d = TABLE[j1 * NT + i1];
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

// ---------- where the work is ----------
const WOODS = AREAS.filter((a) => a.kind === 'wood' && a.pts.some((v, i) => i % 2 === 0 && v > -800 && v < -350));
const inWood = (x: number, z: number) => WOODS.some((a) => {
  let c = false;
  for (let i = 0, j = a.pts.length - 2; i < a.pts.length; j = i, i += 2) if ((a.pts[i + 1] > z) !== (a.pts[j + 1] > z) && x < ((a.pts[j] - a.pts[i]) * (z - a.pts[i + 1])) / (a.pts[j + 1] - a.pts[i + 1]) + a.pts[i]) c = !c;
  return c;
});
/** the tennis complex's belt: the part of Picture 12 outside the Great Hall's work area */
const TC_BELT: [number, number, number, number] = [-744, -412, -200, -18];
// (bounded on the south by the curved road: its sealed roads' centre lines across the box, z at x)
const ROAD_S: [number, number, number, number][] = [];
for (const r of ROADS) {
  if (r.cls > 2) continue;
  for (let k = 0; k < r.nodes.length - 1; k++) {
    const ax = NODE_XZ[r.nodes[k] * 2], az = NODE_XZ[r.nodes[k] * 2 + 1], bx = NODE_XZ[r.nodes[k + 1] * 2], bz = NODE_XZ[r.nodes[k + 1] * 2 + 1];
    if (Math.max(ax, bx) > -760 && Math.min(ax, bx) < -400 && Math.min(az, bz) > -80 && Math.max(az, bz) < 10 && Math.abs(bx - ax) > 0.1) ROAD_S.push([ax, az, bx, bz]);
  }
}
const roadZ = (x: number) => {
  let z = Infinity;
  for (const [ax, az, bx, bz] of ROAD_S) if ((x - ax) * (x - bx) <= 0) z = Math.min(z, az + ((bz - az) * (x - ax)) / (bx - ax));
  return z;
};
const inBelt = (x: number, z: number) => x > TC_BELT[0] && x < TC_BELT[1] && z > TC_BELT[2] && z < TC_BELT[3] && z < roadZ(x) - 2 && !inGhl(x, z) && !GHL_EXCLUDE.some(([a, b, c, d]) => x > a - 4 && x < b + 4 && z > c - 4 && z < d + 4);
/** the complex and the ring of trees tennis.ts models round it */
const inComplexRing = (x: number, z: number) => x > TC.x0 - 8 && x < TC.x1 + 8 && z > TC.z0 - 8 && z < TC.z1 + 6;

// a distance to the work area's edge, on a 4 m grid (for the soft fade inside the boundary)
const EG = 4, [BX0, BX1, BZ0, BZ1] = GHL_BOX, ENX = Math.ceil((BX1 - BX0) / EG), ENZ = Math.ceil((BZ1 - BZ0) / EG);
let EDGE: Float32Array | null = null;
function edgeDist() {
  if (EDGE) return EDGE;
  EDGE = new Float32Array(ENX * ENZ);
  const rings = [GHL_SCOPE, ...GHL_EXCLUDE.map(([a, b, c, d]) => [[a, c], [b, c], [b, d], [a, d]] as P2[])];
  for (let j = 0; j < ENZ; j++) for (let i = 0; i < ENX; i++) {
    const x = BX0 + (i + 0.5) * EG, z = BZ0 + (j + 0.5) * EG;
    if (!inGhl(x, z)) { EDGE[j * ENX + i] = -1; continue; }
    let best = Infinity;
    for (const r of rings) for (let k = 0, l = r.length - 1; k < r.length; l = k++) {
      const [ax, az] = r[l], [bx, bz] = r[k], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
      best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z));
    }
    EDGE[j * ENX + i] = best;
  }
  return EDGE;
}
const edgeAt = (x: number, z: number) => {
  const i = Math.floor((x - BX0) / EG), j = Math.floor((z - BZ0) / EG);
  return i < 0 || j < 0 || i >= ENX || j >= ENZ ? -1 : edgeDist()[j * ENX + i];
};

// ---------- the colours of the ground ----------
/** per class: base colour (sRGB) and how opaque over the grass */
const GROUND: Record<number, [number, number, number, number]> = {
  0: [104, 122, 58, 0.45],
  1: [72, 78, 44, 0.94],
  2: [104, 122, 58, 0.82],
  3: [150, 140, 88, 0.93],
  4: [172, 112, 72, 0.97],
  5: [204, 188, 156, 0.97],
  6: [122, 90, 62, 0.95],
};
function groundColor(cls: number, x: number, z: number, fade: number): RGBA {
  const [r0, g0, b0, a0] = GROUND[cls];
  const tone = (tn(x * 0.21 + 50, z * 0.21) - 0.5) * 22, fine = (TABLE[((Math.floor(x * 1.7) & 255) * NT + (Math.floor(z * 1.7) & 255))] - 0.5) * 16;
  let r = r0 + tone + fine, g = g0 + tone + fine, b = b0 + tone * 0.7 + fine;
  // speckles: straw and soil in the dry cover, dry grass on the soil, greener tufts on the low cover
  const sp = TABLE[((Math.floor(x * 2.3 + 7) & 255) * NT + (Math.floor(z * 2.3 - 3) & 255))];
  if (cls === 3 && sp > 0.82) { r = 178; g = 160; b = 104; } else if (cls === 3 && sp < 0.12) { r = 152; g = 112; b = 78; }
  if (cls === 4 && sp > 0.86) { r = 128; g = 126; b = 70; }
  if (cls === 2 && sp > 0.84) { r -= 18; g -= 6; b -= 14; }
  return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b)), a0 * fade];
}

/** the Great Hall's land: the aerials' patches, their edges loosened by a few metres of noise */
function ghlColor(x: number, z: number): RGBA | null {
  const e = edgeAt(x, z);
  if (e < 0 || !inGhl(x, z)) return null;
  const jx = (tn(x * 0.17, z * 0.17) - 0.5) * 6 + (tn(x * 0.6, z * 0.6 + 13) - 0.5) * 2, jz = (tn(x * 0.17 + 91, z * 0.17 - 37) - 0.5) * 6 + (tn(x * 0.6 - 7, z * 0.6) - 0.5) * 2;
  const fade = Math.min(1, Math.max(0, (e - 2 + (tn(x * 0.1, z * 0.1) - 0.5) * 8) / 10));
  if (fade <= 0) return null;
  // (two samples a little apart, blended: soft patch edges close up)
  const a = groundColor(ghCover(x + jx, z + jz)[0], x, z, fade), b = groundColor(ghCover(x + jx + 1.3, z + jz - 1.1)[0], x, z, fade);
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, (a[3] + b[3]) / 2];
}
/** the tennis complex's surroundings: the forest floor, the lawn and its sandy patches south of the courts */
function tcColor(x: number, z: number): RGBA | null {
  if (!inBelt(x, z) || inTcFloor(x, z, 0.8)) return null;
  const jx = (tn(x * 0.3, z * 0.3) - 0.5) * 4 + (tn(x * 1.1, z * 1.1 + 5) - 0.5) * 1.5, jz = (tn(x * 0.3 + 31, z * 0.3 - 7) - 0.5) * 4 + (tn(x * 1.1 - 9, z * 1.1) - 0.5) * 1.5;
  // (the lawns read olive in this sharper picture: the green low cover; its bare and pale spots sandy, not red or white)
  const cls = (c: number) => (c === 4 || c === 6 || c === 5 ? 3 : c);
  const c0 = tcCover(x + jx, z + jz)[0], c1 = tcCover(x + jx + 0.9, z + jz - 0.8)[0], c2 = tcCover(x + jx - 0.8, z + jz + 0.9)[0];
  if (c0 === 0) return null;
  const edge = Math.min(x - TC_BELT[0], TC_BELT[1] - x, z - TC_BELT[2], roadZ(x) - 2 - z);
  const f = Math.min(1, Math.max(0, edge / 6));
  const cs = [c0, c1 || c0, c2 || c0].map((c) => groundColor(cls(c), x, z, f * (cls(c) === 2 ? 0.7 : 1)));
  return [0, 1, 2, 3].map((k) => (cs[0][k] + cs[1][k] + cs[2][k]) / 3) as RGBA;
}

// ---------- the plants ----------
const DENSE = ['#2f4a24', '#365229', '#3d5a2c', '#2c4520', '#41602f', '#4a6633', '#38552a'];
const OLIVE = ['#5b6a34', '#66713a', '#55643a', '#4e6230'];
const DARK = ['#344a26', '#3c4f2a', '#2e4424'];
const pick = (a: string[], h: number) => a[Math.floor(h * a.length) % a.length];
/** off the roads, the tracks, the buildings and the compounds */
const free = (x: number, z: number, r: number) => !onSealed(x, z, r + 0.6) && earthDist(x, z) > r * 0.6 + 1.6 && !buildingNear(x, z, r * 0.7 + 1.5) && !(PALE && x > PALE.minX - 2 && x < PALE.maxX + 2 && z > PALE.minZ - 2 && z < PALE.maxZ + 2);

function ghlCrowns(out: Crown[]) {
  const B = 8;
  for (let bx = BX0; bx < BX1; bx += B) for (let bz = BZ0; bz < BZ1; bz += B) {
    const cx = bx + B / 2, cz = bz + B / 2;
    if (!inGhl(cx, cz) || edgeAt(cx, cz) < 3) continue;
    const cells: [number, number, number, number][] = [];
    for (const [ox, oz] of [[2, 2], [6, 2], [2, 6], [6, 6]]) { const [c, q] = ghCover(bx + ox, bz + oz); cells.push([bx + ox, bz + oz, c, q]); }
    const dense = cells.filter((c) => c[2] === 1), h = (k: number) => hash2(cx * 0.37 + k, cz * 0.53 - k * 1.7);
    const put = (x: number, z: number, r: number, hh: number, base: number, trunk: number, color: string, seed: number) => {
      if (free(x, z, r) && inGhl(x, z)) out.push({ x, z, r, h: hh, base, trunk, color, seed, solid: trunk > 0 });
    };
    if (dense.length >= 2) {
      let mx = 0, mz = 0;
      for (const c of dense) { mx += c[0]; mz += c[1]; }
      mx = mx / dense.length + (h(1) - 0.5) * 3; mz = mz / dense.length + (h(2) - 0.5) * 3;
      if (dense.length === 4 && h(3) < 0.06) {
        // an occasional larger crown, where the aerial's clusters are biggest
        const r = 5 + h(4) * 1.5;
        put(mx, mz, r, r * (1.1 + h(5) * 0.3), 1.8 + h(6) * 0.8, 0.28, pick(DENSE, h(7)), h(8));
      } else {
        const r = 2.2 + dense.length * 0.55 + h(4) * 0.8, tree = h(5) < 0.35;
        put(mx, mz, r, r * (tree ? 1.05 + h(6) * 0.3 : 0.75 + h(6) * 0.35), tree ? 0.9 + h(7) * 0.7 : 0.15 + h(7) * 0.4, tree ? 0.16 + h(9) * 0.06 : 0, pick(DENSE, h(8)), h(10));
      }
      if (dense.length >= 3 && h(11) < 0.5) {
        const a = h(12) * 6.283, d = 3 + h(13) * 1.5, r = 1.4 + h(14) * 0.8;
        put(mx + Math.cos(a) * d, mz + Math.sin(a) * d, r, r * (0.8 + h(15) * 0.4), 0.1 + h(16) * 0.3, 0, pick(DENSE, h(17)), h(18));
      }
    } else if (dense.length === 1) {
      const [x, z] = dense[0], r = 1.5 + h(4) * 0.9, tree = h(5) < 0.35;
      put(x + (h(1) - 0.5) * 2, z + (h(2) - 0.5) * 2, r, r * (tree ? 1.2 : 0.85), tree ? 0.8 + h(7) * 0.6 : 0.15, tree ? 0.14 : 0, pick(DENSE, h(8)), h(10));
    } else {
      // no dense green: the commonest class decides the scattered shrubs
      const counts = [0, 0, 0, 0, 0, 0, 0];
      let qs = 0;
      for (const c of cells) { counts[c[2]]++; qs += c[3]; }
      const cls = counts.indexOf(Math.max(...counts)), lift = qs * 0.04;
      const x = cx + (h(1) - 0.5) * 6, z = cz + (h(2) - 0.5) * 6;
      if (cls === 2 && h(3) < 0.22 + lift) { const r = 1 + h(4) * 0.8; put(x, z, r, r * 0.9, 0.1, 0, pick(DENSE, h(5)), h(6)); }
      else if (cls === 2 && h(3) < 0.28 + lift) { const r = 2 + h(4); put(x, z, r, r * 1.2, 1.0, 0.13, pick(DENSE, h(5)), h(6)); }
      else if (cls === 3 && h(3) < 0.14 + lift) { const r = 0.8 + h(4) * 0.7; put(x, z, r, r * 0.9, 0.1, 0, pick(OLIVE, h(5)), h(6)); }
      else if (cls === 3 && h(3) < 0.18 + lift) { const r = 1.8 + h(4) * 0.8; put(x, z, r, r * 1.15, 0.9, 0.12, pick(DENSE, h(5)), h(6)); }
      else if (cls === 4 && h(3) < 0.07 + lift) { const r = 0.9 + h(4) * 0.6; put(x, z, r, r * 0.9, 0.1, 0, pick(OLIVE, h(5)), h(6)); }
      // (the red soil's scattered small dark shrubs, the dots in the aerials)
      if (cls === 4) for (let k = 0; k < 2; k++) if (h(40 + k) < 0.4) { const r = 0.35 + h(42 + k) * 0.35; put(cx + (h(44 + k) - 0.5) * 7, cz + (h(46 + k) - 0.5) * 7, r, r * 1.1, 0.05, 0, pick(DARK, h(48 + k)), h(50 + k)); }
      if (cls === 6) for (let k = 0; k < 2; k++) if (h(20 + k) < 0.8) { const r = 0.6 + h(22 + k) * 0.5; put(cx + (h(24 + k) - 0.5) * 7, cz + (h(26 + k) - 0.5) * 7, r, r, 0.05, 0, pick(DARK, h(28 + k)), h(30 + k)); }
    }
  }
}
function beltCrowns(out: Crown[]) {
  const B = 6;
  for (let bx = TC_BELT[0]; bx < TC_BELT[1]; bx += B) for (let bz = TC_BELT[2]; bz < TC_BELT[3]; bz += B) {
    const cx = bx + B / 2, cz = bz + B / 2;
    if (!inBelt(cx, cz) || inComplexRing(cx, cz)) continue;
    let nd = 0;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (tcCover(bx + 1 + i * 2, bz + 1 + j * 2)[0] === 1) nd++;
    // (in the mapped wood the campus already plants its woodland trees: fewer of these there)
    const h = (k: number) => hash2(cx * 0.41 + k, cz * 0.29 - k * 2.3), wood = inWood(cx, cz);
    const x = cx + (h(1) - 0.5) * 3, z = cz + (h(2) - 0.5) * 3;
    if (!free(x, z, 2)) continue;
    if (nd >= 4 && (!wood || h(9) < 0.6)) {
      // mature trees: broad layered crowns, foliage from a couple of metres up (the belt round the courts, Pictures 5-8)
      const r = 3.8 + h(3) * 2.4, hh = r * (1.2 + h(4) * 0.35);
      out.push({ x, z, r, h: hh, base: 1.2 + h(5) * 1.4, trunk: 0.24 + h(6) * 0.1, color: pick(DENSE, h(7)), seed: h(8), solid: true });
      // and the understorey: dense shrubs and saplings under and between them
      if (h(10) < 0.8) { const a = h(11) * 6.283, d = 2 + h(12) * 2, rr = 1.3 + h(13) * 1.1; out.push({ x: x + Math.cos(a) * d, z: z + Math.sin(a) * d, r: rr, h: rr * 1.1, base: 0.1, trunk: 0, color: pick(DENSE, h(14)), seed: h(15) }); }
    } else if (nd >= 1 && h(3) < 0.7) {
      const r = 1.5 + h(4) * 1.1;
      out.push({ x, z, r, h: r * 1.0, base: 0.2 + h(5) * 0.5, trunk: 0, color: pick(DENSE, h(7)), seed: h(8) });
    } else if (h(3) < 0.04) {
      const r = 2.5 + h(4);
      out.push({ x, z, r, h: r * 1.2, base: 1.6, trunk: 0.18, color: pick(DENSE, h(7)), seed: h(8), solid: true });
    }
  }
}

/** grass and herb tufts, near the camera only: thick on the green and dry cover, sparse on the soil */
const STRAW = ['#a39a5a', '#b3a464', '#9a8f52', '#8d9450'], GRASS = ['#7d8a44', '#6b7a3a', '#5f7a35', '#8d9450'];
function tuftsOf(out: Tuft[]) {
  const C = 3;
  for (let x = BX0; x < BX1; x += C) for (let z = BZ0; z < BZ1; z += C) {
    const h = (k: number) => hash2(x * 0.71 + k, z * 0.37 - k * 1.3), px = x + h(1) * C, pz = z + h(2) * C;
    if (edgeAt(px, pz) < 1 || !inGhl(px, pz)) continue;
    const [c] = ghCover(px, pz), p = [0, 0.35, 0.75, 0.8, 0.3, 0.06, 0.45][c];
    if (h(3) > p || onSealed(px, pz, 0.4) || earthDist(px, pz) < 1.6 || buildingNear(px, pz, 0.5)) continue;
    out.push({ x: px, z: pz, s: c === 3 ? 0.45 + h(4) * 0.5 : 0.3 + h(4) * 0.45, color: c === 3 || c === 4 ? pick(STRAW, h(5)) : pick(GRASS, h(5)) });
  }
  for (let x = TC_BELT[0]; x < TC_BELT[1]; x += C) for (let z = TC_BELT[2]; z < TC_BELT[3]; z += C) {
    const h = (k: number) => hash2(x * 0.53 + k, z * 0.61 - k * 1.9), px = x + h(1) * C, pz = z + h(2) * C;
    if (!inBelt(px, pz) || inComplexRing(px, pz) || h(3) > 0.45 || onSealed(px, pz, 0.4) || earthDist(px, pz) < 1.6 || buildingNear(px, pz, 0.5)) continue;
    out.push({ x: px, z: pz, s: 0.3 + h(4) * 0.4, color: pick(GRASS, h(5)) });
  }
}

/** the sealed roads and the buildings the paintings leave clear */
function clears(box: [number, number, number, number]) {
  const [x0, x1, z0, z1] = box, earth = new Set(EARTH_ROADS);
  const lines: { pts: P2[]; half: number }[] = [];
  ROADS.forEach((r, ri) => {
    if (earth.has(ri)) return;
    const pts = r.nodes.map((n) => [NODE_XZ[n * 2], NODE_XZ[n * 2 + 1]] as P2);
    if (!pts.some(([x, z]) => x > x0 - 30 && x < x1 + 30 && z > z0 - 30 && z < z1 + 30)) return;
    lines.push({ pts, half: [4.5, 3.7, 3.1, 2.3, 1.3][r.cls] + 0.4 });
  });
  const rings: P2[][] = [];
  for (const b of BUILDINGS) {
    if (b === PALE || b.maxX < x0 || b.minX > x1 || b.maxZ < z0 || b.minZ > z1) continue;
    const r: P2[] = [];
    for (let i = 0; i < b.pts.length; i += 2) r.push([b.pts[i], b.pts[i + 1]]);
    rings.push(r);
  }
  return { lines, rings };
}

/** Everything this file draws, outside the block-model sites (it is not a model: tiles of ground and plants). */
export function buildScrubLands() {
  const group = new THREE.Group();
  group.name = 'scrub-lands';
  const ghClear = clears(GHL_BOX);
  const ghTracks = earthLines().map((l) => ({ pts: l.pts, half: l.half }));
  const overlays = [
    ...coverOverlay({ box: GHL_BOX, mpp: 1, cell: 4, tile: 160, color: ghlColor, tracks: ghTracks, clip: [GHL_SCOPE], clearLines: ghClear.lines, clearRings: ghClear.rings, cellIn: (x, z) => edgeAt(x, z) >= 0 || inGhl(x, z) }),
    ...coverOverlay({
      box: TC_BELT, mpp: 0.5, cell: 2, tile: 120, color: tcColor, tracks: ghTracks, clearLines: clears(TC_BELT).lines, clearRings: clears(TC_BELT).rings,
      clip: TC_EARTH.map(([a, b, c, d]) => [[a, c], [b, c], [b, d], [a, d]] as P2[]),
      cellIn: (x, z) => inBelt(x, z) && !inTcFloor(x, z, 1.2),
    }),
  ];
  for (const m of overlays) { m.userData.noRelief = true; group.add(m); }
  const crowns: Crown[] = [];
  ghlCrowns(crowns);
  beltCrowns(crowns);
  const tufts: Tuft[] = [];
  tuftsOf(tufts);
  group.add(...crownTiles(crowns, 100, 75, tufts));
  group.userData.cullMeshes = overlays;
  group.userData.crowns = crowns.length;
  group.userData.tufts = tufts.length;
  return group;
}

// ---------- the pale rectangle: ground, not a building ----------
const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#f1efe9') };
const paleSpec: Spec = {
  name: 'the pale clearing south-west of the Great Hall', axis: [1, 0], origin: PALE_AT, storey: 3, style: PLAIN, roofColor: '#9aa0a3', fascia: '#6d5a4a', pitch: 0.2,
  replaces: [PALE_AT], blocks: [], onGround: true,
  keep: PALE ? [[PALE.minX - PALE_AT[0], PALE.maxX - PALE_AT[0], PALE.minZ - PALE_AT[1], PALE.maxZ - PALE_AT[1]]] : [],
  extras: () => {},
};
export const paleSite = createSite('pale-clearing', [paleSpec]);
