// The owner's ECG area correction brief (ECG_Area_Detailed_Claude_Brief.pdf: Pairs 1-18, A01-A03, M01;
// docs/ecg-area/evidence-audit.md), on the N4 north of the Legon cutting: the ECG office with its white slab and blue
// glass wing, the guesthouse block with its grey gable and blue glazing beside it, the Ghana Water compound behind its
// blue wall and fence, the low cream building with the red roof and its fenced utility yard across the highway, the
// highway itself (the low concrete divider, the planted separation, the rough strips, the kerbs), the utility corridor
// on the east verge, the roadside stalls by the side access. Numbers in ecgplan.ts; everything read from the street
// photographs and the registered aerials is an estimate, said where it is made.
import * as THREE from 'three';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { box, merge, type Part } from './modelkit';
import { SOLIDS } from './solids';
import { Bag, hash, tuft, vnoise, wallSolids } from './enkit';
import { broadleaf } from './nsiaroad';
import { christmasPalm, drapeAt, groundCover } from './kuffourgarden';
import { groundHeight as gh } from './relief';
import { rod, run, latticeTower, type V3 } from './upsa';
import { concrete } from './concrete';
import { Pics, board, compactTree, pic, shrub, text, SLABS } from './okponglo';
import { brick, divider, edges, hFrame, kerbLine, offLine, ribbon, sane, spans, stall, streetLight, stripedPost, utilityPole } from './roadkit';
import {
  CORR, DIV, ECG, EC_KEEP, ESV, FRONT, GUEST, GW, LANE173, LANE_HALF, N4_HALF, NB, PLANT, SB, SIDE174, SIDE175, SIGNS50, STALLS, SUB, SVC_HALF,
  TOWERS, TRADE, VAULTS, WSV, xAt, zAt, type Box, type Line, type P2,
} from './ecgplan';

const drapeMesh = (g: THREE.BufferGeometry) => Object.assign(new THREE.Mesh(g, groundCover()), { receiveShadow: true, userData: { noCollide: true } });
const st = (bay: number, draw: (g: CanvasRenderingContext2D) => void): Style => ({ bay, up: [], ground: [], draw });
const PLAIN = st(3, (g) => render(g, '#ddd'));
type RGB = [number, number, number];
const dryGrass = (x: number, z: number): RGB => { const m = vnoise(x * 0.9, z * 0.9), n = vnoise(x * 0.18, z * 0.22); return n > 0.62 ? [0.6 + m * 0.06, 0.47 + m * 0.04, 0.32] : n > 0.45 ? [0.55 + m * 0.06, 0.53 + m * 0.05, 0.33] : [0.42 + m * 0.07, 0.5 + m * 0.06, 0.27]; };
const earth = (x: number, z: number): RGB => { const m = vnoise(x * 1.1, z * 1.1), n = vnoise(x * 0.2, z * 0.2); return n > 0.66 ? [0.5 + m * 0.05, 0.47 + m * 0.04, 0.32] : [0.66 + m * 0.07, 0.44 + m * 0.05, 0.29 + m * 0.03]; };
const gravel = (x: number, z: number): RGB => { const m = vnoise(x * 3.1, z * 3.1), n = vnoise(x * 0.4, z * 0.4); const v = 0.7 + m * 0.08 - (n > 0.7 ? 0.06 : 0); return [v, v - 0.01, v - 0.04]; };
const worn = (x: number, z: number): RGB => { const m = vnoise(x * 0.7, z * 0.7), s = vnoise(x * 0.15, z * 0.15); const v = 0.6 + m * 0.07 - (s > 0.7 ? 0.08 : 0); return [v + 0.02, v, v - 0.03]; };
const asphalt = (x: number, z: number): RGB => { const m = vnoise(x * 0.8, z * 0.8); const v = 0.3 + m * 0.05; return [v, v, v + 0.01]; };

/** the distance from a point to a polyline */
function distTo(line: Line, x: number, z: number) {
  let d = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, az] = line[i], [bx, bz] = line[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
    d = Math.min(d, Math.hypot(x - ax - dx * t, z - az - dz * t));
  }
  return d;
}
const ROADS: [Line, number][] = [[SB, N4_HALF], [NB, N4_HALF], [ESV, SVC_HALF], [WSV, SVC_HALF], [FRONT, LANE_HALF], [LANE173, LANE_HALF], [SIDE174, LANE_HALF], [SIDE175, LANE_HALF]];
/** how far a point is clear of every mapped road's surface here (negative on one) */
const clearOf = (x: number, z: number) => Math.min(...ROADS.map(([l, h]) => distTo(l, x, z) - h));

// ---------- pictures ----------
/** the blue reflective curtain wall: deep blue panes with light reflections, thin pale mullions (Pairs 12, 13) */
const CURTAIN = () => pic('ecgCurtain', 256, 256, (g) => {
  const grd = g.createLinearGradient(0, 0, 256, 256); grd.addColorStop(0, '#1f4f8f'); grd.addColorStop(0.5, '#3f78b8'); grd.addColorStop(1, '#183f78');
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  let s = 17; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(200,225,255,${0.06 + r() * 0.12})`; g.fillRect(r() * 256, r() * 256, 20 + r() * 60, 10 + r() * 40); }
  g.fillStyle = '#c9ced3'; for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 3, 256); for (let y = 0; y < 256; y += 64) g.fillRect(0, y, 256, 4);
}, { rough: 0.15 });
/** the ECG mark high on the white slab: a blue square with the gold round emblem (no lettering legible) */
const ECG_MARK = () => board('ecgMark', 64, 64, (g, w) => { g.fillStyle = '#1d4a96'; g.fillRect(0, 0, w, w); g.fillStyle = '#f0c419'; g.beginPath(); g.arc(32, 32, 20, 0, Math.PI * 2); g.fill(); g.fillStyle = '#1d4a96'; g.beginPath(); g.arc(32, 32, 13, 0, Math.PI * 2); g.fill(); g.fillStyle = '#f0c419'; g.fillRect(28, 20, 8, 24); });
/** the roadside board: ECG GOES CASHLESS legible, the smaller lines and the panel at its foot not (left as bands) */
const CASHLESS = () => board('ecgCashless', 256, 320, (g, w, h) => {
  g.fillStyle = '#f4f6f8'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1d4a96'; g.fillRect(0, 0, w, 86); text(g, 'ECG GOES', w / 2, 30, 30, '#ffffff', 900); text(g, 'CASHLESS', w / 2, 64, 30, '#f0c419', 900);
  g.fillStyle = '#d23a2a'; g.fillRect(16, 104, w - 32, 22); g.fillStyle = '#2a2a2a'; for (let y = 140; y < 236; y += 16) g.fillRect(20, y, 120 + ((y * 7) % 80), 7);
  g.fillStyle = '#f0c419'; g.fillRect(170, 140, 70, 96); g.fillStyle = '#1d4a96'; g.fillRect(0, h - 70, w, 70); g.fillStyle = '#ffffff'; g.fillRect(16, h - 50, 150, 10); g.fillRect(16, h - 30, 100, 8);
});
/** the circular 50 speed limit (Pairs 6, 7) */
const FIFTY = () => board('ecgFifty', 64, 64, (g, w) => { g.clearRect(0, 0, w, w); g.fillStyle = '#d0201c'; g.beginPath(); g.arc(32, 32, 31, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(32, 32, 24, 0, Math.PI * 2); g.fill(); text(g, '50', 32, 34, 26, '#1a1a1a', 900); });
/** the compound's roadside board (Pair 10): white with blue bands; its words not legible in the photographs */
const GW_BOARD = () => board('gwBoard', 96, 160, (g, w, h) => { g.fillStyle = '#f4f6f8'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f55a8'; g.fillRect(0, 0, w, 22); g.fillRect(0, h - 26, w, 26); g.fillStyle = '#2a4f8a'; for (let y = 36; y < h - 40; y += 14) g.fillRect(10, y, 50 + ((y * 13) % 30), 6); });
/** the advertisement on the concrete pole by the stalls (Pair 16): its lines not legible, left as bands */
const POLE_AD = () => board('ecgPoleAd', 96, 192, (g, w, h) => { g.fillStyle = '#e9ecef'; g.fillRect(0, 0, w, h); g.fillStyle = '#2f6db5'; g.fillRect(0, 0, w, 34); g.fillStyle = '#3a8a4a'; g.fillRect(0, 34, w, 30); g.fillStyle = '#9fc4e6'; g.fillRect(6, 74, w - 12, 80); g.fillStyle = '#2a2a2a'; g.fillRect(6, 164, w - 12, 18); });
/** the blue vertical sign at the guesthouse entrance (Pair 14): blue with a gold emblem, no lettering legible */
const BLUE_SIGN = () => board('guestSign', 48, 256, (g, w, h) => { g.fillStyle = '#1f3f8f'; g.fillRect(0, 0, w, h); g.fillStyle = '#f0c419'; g.beginPath(); g.arc(24, 30, 15, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffffff'; for (let y = 60; y < h - 20; y += 22) g.fillRect(10, y, 28, 8); });
/** the guesthouse gable's large blue glazed bay (Pair 14): blue panes in a grid */
const GABLE_GLASS = () => pic('guestGlass', 256, 192, (g) => {
  g.fillStyle = '#2459a8'; g.fillRect(0, 0, 256, 192);
  let s = 23; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 10; i++) { g.fillStyle = `rgba(190,220,255,${0.08 + r() * 0.12})`; g.fillRect(r() * 256, r() * 192, 30 + r() * 50, 12 + r() * 30); }
  g.fillStyle = '#dfe3e6'; for (let x = 0; x <= 256; x += 32) g.fillRect(x - 2, 0, 4, 192); for (let y = 0; y <= 192; y += 48) g.fillRect(0, y - 2, 256, 4);
}, { rough: 0.2 });
/** the blue painted lower wall of the compound with its weathering (Pairs 2, 10, 11) */
const BLUE = '#1f45b8', BLUE_DARK = '#183a9a';

// ---------- small pieces ----------
/** a banana plant: a soft stem, broad leaves arching out from its top, a torn yellowing one (Pairs 2, 9, 11) */
function banana(leaf: Part[], wood: Part[], O: P2, x: number, z: number, h: number, seed: number) {
  const X = x - O[0], Z = z - O[1], y = gh(x, z), r = (i: number) => hash(seed + i * 1.7, seed * 0.37 - i);
  const sh = h * 0.5;
  wood.push([new THREE.CylinderGeometry(0.1, 0.16, sh, 7).translate(X, y + sh / 2, Z), '#6f7f3c']);
  const n = 6 + ((r(1) * 3) | 0);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r(i + 2) * 0.8, L = h * (0.42 + r(i + 9) * 0.18), tilt = 0.35 + r(i + 20) * 0.7;
    const g = new THREE.BoxGeometry(L, 0.03, 0.42 + r(i + 30) * 0.2).translate(L / 2, 0, 0).rotateZ(tilt).rotateY(-a).translate(X, y + sh, Z);
    leaf.push([g, i === 0 && r(40) < 0.6 ? '#a59d4c' : ['#6f9a3a', '#7fae45', '#5e8a32', '#86b04c'][i % 4]]);
  }
  leaf.push([new THREE.BoxGeometry(0.16, h * 0.4, 0.16).translate(X, y + sh + h * 0.2, Z), '#7fa843']);
}
/** a slender lattice mast: four legs tapering from `base` to a narrow top, braced in panels; red and white in bands or
 *  plain galvanised steel. Returns the attachment points of its top crossarm (model frame). */
function slimMast(c: Part[], O: P2, x: number, z: number, h: number, base: number, banded: boolean, arm = 0): V3[] {
  const X = x - O[0], Z = z - O[1], y = gh(x, z), top = Math.max(0.5, base * 0.25);
  const half = (yy: number) => (base + (top - base) * (yy / h)) / 2;
  const panel = 2.4, n = Math.ceil(h / panel);
  const col = (i: number) => (banded ? (Math.floor((i * panel) / 3) % 2 ? '#e8e8e4' : '#c8261e') : '#8e9396');
  const corner = (yy: number, sx: number, sz: number): V3 => [X + sx * half(yy), y + yy, Z + sz * half(yy)];
  const cs: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (let i = 0; i < n; i++) {
    const y0 = i * panel, y1 = Math.min(h, y0 + panel);
    for (let k = 0; k < 4; k++) {
      const [ax, az] = cs[k], [bx, bz] = cs[(k + 1) % 4];
      c.push([rod(corner(y0, ax, az), corner(y1, ax, az), 0.09), col(i)]);
      c.push([rod(corner(y1, ax, az), corner(y1, bx, bz), 0.05), col(i)]);
      c.push([rod(corner(y0, ax, az), corner(y1, bx, bz), 0.035), col(i)], [rod(corner(y0, bx, bz), corner(y1, ax, az), 0.035), col(i)]);
    }
  }
  const at: V3[] = [];
  if (arm > 0) {
    for (const yy of [h - 1.2, h - 4]) {
      c.push([rod([X - arm, y + yy, Z], [X + arm, y + yy, Z], 0.1), '#7d8285']);
      for (const s of [-arm + 0.2, arm - 0.2]) at.push([X + s, y + yy - 0.3, Z]);
    }
  } else {
    // dishes and panels on the telecom mast
    for (const [dx, dz, a] of [[0.6, 0, 0], [-0.6, 0, Math.PI], [0, 0.6, Math.PI / 2]] as [number, number, number][]) c.push([new THREE.CylinderGeometry(0.45, 0.45, 0.14, 12).rotateZ(Math.PI / 2).rotateY(-a).translate(X + dx, y + h - 2.5, Z + dz), '#e4e4e0']);
    c.push([box(X - 0.15, X + 0.15, y + h, y + h + 2.5, Z - 0.15, Z + 0.15), '#c8261e']);
  }
  SOLIDS.add(x, z, Math.max(0.6, base * 0.6));
  return at;
}
/** a white masonry boundary with square posts every few metres and a light railing over it, along a run of world
 *  points (the ECG frontage, Pairs 12, 13; the guesthouse, Pair 14) */
function postWall(c: Part[], O: P2, pts: P2[], h: number, railH: number, step = 3.2, col = '#eeece6') {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], len = Math.hypot(bx - ax, bz - az), y = Math.min(gh(ax, az), gh(bx, bz));
    if (len < 0.2) continue;
    c.push([run(ax - O[0], az - O[1], bx - O[0], bz - O[1], y - 0.2, y + h, 0.22), col]);
    c.push([run(ax - O[0], az - O[1], bx - O[0], bz - O[1], y + h, y + h + 0.08, 0.3), '#d9d6ce']);
    if (railH > 0) {
      for (const yy of [y + h + 0.15, y + h + railH]) c.push([run(ax - O[0], az - O[1], bx - O[0], bz - O[1], yy - 0.03, yy + 0.03, 0.04), '#9aa0a4']);
      const m = Math.max(1, Math.round(len / 0.14));
      for (let j = 0; j < m; j += 1) { const t = j / m, px = ax + (bx - ax) * t - O[0], pz = az + (bz - az) * t - O[1]; c.push([box(px - 0.012, px + 0.012, y + h + 0.1, y + h + railH, pz - 0.012, pz + 0.012), '#a3a8ab']); }
    }
    const np = Math.max(1, Math.round(len / step));
    for (let j = 0; j <= np; j++) { const t = j / np, px = ax + (bx - ax) * t - O[0], pz = az + (bz - az) * t - O[1]; c.push([box(px - 0.22, px + 0.22, y - 0.2, y + h + railH + 0.25, pz - 0.22, pz + 0.22), col], [box(px - 0.26, px + 0.26, y + h + railH + 0.25, y + h + railH + 0.36, pz - 0.26, pz + 0.26), '#d9d6ce']); }
    wallSolids(ax, az, bx, bz, 0.25);
  }
}
/** the compound's boundary: a blue lower wall, square blue posts, thin blue vertical pickets above (Pairs 2, 9-11, 18) */
function blueFence(c: Part[], O: P2, a: P2, b: P2, wallH: number, h: number) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]), y = Math.min(gh(a[0], a[1]), gh(b[0], b[1]));
  c.push([run(a[0] - O[0], a[1] - O[1], b[0] - O[0], b[1] - O[1], y - 0.2, y + wallH, 0.24), BLUE]);
  c.push([run(a[0] - O[0], a[1] - O[1], b[0] - O[0], b[1] - O[1], y - 0.2, y + 0.18, 0.27), '#5b6a8c']);
  for (const yy of [y + wallH + 0.12, y + h - 0.1]) c.push([run(a[0] - O[0], a[1] - O[1], b[0] - O[0], b[1] - O[1], yy - 0.03, yy + 0.03, 0.05), BLUE_DARK]);
  const m = Math.max(1, Math.round(len / 0.16));
  for (let j = 0; j <= m; j++) { const t = j / m, px = a[0] + (b[0] - a[0]) * t - O[0], pz = a[1] + (b[1] - a[1]) * t - O[1]; c.push([box(px - 0.015, px + 0.015, y + wallH, y + h, pz - 0.015, pz + 0.015), BLUE_DARK]); }
  const np = Math.max(1, Math.round(len / 3.0));
  for (let j = 0; j <= np; j++) { const t = j / np, px = a[0] + (b[0] - a[0]) * t - O[0], pz = a[1] + (b[1] - a[1]) * t - O[1]; c.push([box(px - 0.25, px + 0.25, y - 0.2, y + h + 0.1, pz - 0.25, pz + 0.25), BLUE]); }
  wallSolids(a[0], a[1], b[0], b[1], 0.25);
}
/** kerbs along both edges of a mapped road from z0 to z1, broken where another road meets it */
function kerbs(c: Part[], O: P2, line: Line, half: number, z0: number, z1: number, sides: number[] = [-1, 1]) {
  for (const s of sides) {
    const [pts] = edges(line, z0, z1, s * (half + 0.1), s * (half + 0.1), 2);
    let runPts: P2[] = [];
    const flush = () => { if (runPts.length > 1) kerbLine(c, O, runPts, 0.14, 0.22); runPts = []; };
    for (const p of pts) { if (clearOf(p[0], p[1]) > -0.05) runPts.push(p); else flush(); }
    flush();
  }
}
/** the keep tiles (a model's keep boxes count only within 150 m of its origin, so the long boxes are laid as tiles) */
function keepTiles(name: string, boxes: Box[]): Spec[] {
  return boxes.flatMap(([x0, x1, z0, z1], i) => {
    const nx = Math.ceil((x1 - x0) / 200), nz = Math.ceil((z1 - z0) / 200), out: Spec[] = [];
    for (let a = 0; a < nx; a++) for (let q = 0; q < nz; q++) {
      const ax = x0 + ((x1 - x0) * a) / nx, bx = x0 + ((x1 - x0) * (a + 1)) / nx, az = z0 + ((z1 - z0) * q) / nz, bz = z0 + ((z1 - z0) * (q + 1)) / nz;
      const org: P2 = [(ax + bx) / 2, (az + bz) / 2];
      out.push({ name: `${name} keep ${i}.${a}.${q}`, axis: [1, 0], origin: org, storey: 3, style: PLAIN, roofColor: '#9aa0a3', fascia: '#6d5a4a', pitch: 0.2, blocks: [], keep: [[ax - org[0], bx - org[0], az - org[1], bz - org[1]]], extras: () => undefined });
    }
    return out;
  });
}
const finish = (k: Kit, c: Part[], wood: Part[], leaf: Part[], b: Bag, P: Pics, name: string) => {
  b.leaf.push(...leaf);
  const m = new THREE.Mesh(merge(sane([...c, ...wood], name)), concrete(0.22)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  b.leaf = sane(b.leaf, name + ' leaf'); b.c = sane(b.c, name);
  k.plain.splice(0, k.plain.length, ...sane(k.plain, name + ' plain'));
  b.finish(k, 0.25);
  P.finish(k);
};

// ======================================================================================================
// the ECG office and the curved roofs behind it
// ======================================================================================================
const EO: P2 = [707, -364];
/** the slab's east face: the narrow dark glazed recess up its middle, a blue window either side on every floor */
const SLAB_EAST: Style = st((ECG.slab[3] - ECG.slab[2]), (g) => {
  render(g, '#f4f4f1');
  g.fillStyle = '#d8d9d6'; g.fillRect(104, 0, 48, 512); g.fillStyle = '#22344c'; g.fillRect(112, 0, 32, 512);
  g.fillStyle = '#3a5f8e'; for (let y = 6; y < 512; y += 30) g.fillRect(114, y, 28, 20);
  for (const x of [30, 186]) { g.fillStyle = '#2f5a92'; g.fillRect(x, 170, 40, 180); g.fillStyle = '#dfe2e4'; g.fillRect(x - 3, 166, 46, 4); }
});
/** the slab's broad faces: plain white panels, a few narrow horizontal windows (Pair 11) */
const SLAB_SIDE: Style = st(6.2, (g) => {
  render(g, '#f4f4f1');
  g.fillStyle = '#e1e1dd'; g.fillRect(0, 0, 2, 512);
  for (const x of [40, 150]) { g.fillStyle = '#2b3a4c'; g.fillRect(x, 220, 66, 26); g.fillStyle = '#dfe2e4'; g.fillRect(x - 2, 246, 70, 4); }
});
const SLAB_PLAIN: Style = st(6, (g) => { render(g, '#f2f2ef'); g.fillStyle = '#e1e1dd'; g.fillRect(0, 0, 2, 512); });
const ecgOffice: Spec = {
  name: 'ECG Legon office', axis: [1, 0], origin: EO, storey: ECG.storey, style: SLAB_PLAIN, roofColor: '#c9c4ba', fascia: '#e8e8e4', pitch: 0.1,
  replaces: [[707, -364], [707, -370], [707, -355], ...VAULTS.map(([a, b, c, d]) => [(a + b) / 2, (c + d) / 2] as P2)],
  blocks: [
    { x0: ECG.slab[0] - EO[0], x1: ECG.slab[1] - EO[0], z0: ECG.slab[2] - EO[1], z1: ECG.slab[3] - EO[1], floors: ECG.slabFloors, roof: 'flat', faces: { x1: SLAB_EAST, z1: SLAB_SIDE, x0: SLAB_SIDE, z0: SLAB_PLAIN } },
  ],
  keep: [],
  onGround: true,
  extras: (k) => {
    const c: Part[] = [], leaf: Part[] = [], wood: Part[] = [], b = new Bag(EO), P = new Pics(EO);
    const [w0, w1, wz0, wz1] = ECG.wing, y = Math.min(gh(w0, wz0), gh(w1, wz1)), H = ECG.wingH;
    // ---------- the wing: blue reflective glass all round, its north corners rounded, the pale panelled fascia ----------
    const R = 4.2, shape = new THREE.Shape();
    const X = (x: number) => x - EO[0], Z = (z: number) => z - EO[1];
    // (the shape in x, -z so that the extrusion turned upright stands on the ground in model x, z)
    const pts: [number, number][] = [];
    pts.push([X(w0), Z(wz1)], [X(w1), Z(wz1)]);
    for (let i = 0; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); pts.push([X(w1) - R + Math.cos(a) * R, Z(wz0) + R - Math.sin(a) * R]); }
    for (let i = 0; i <= 8; i++) { const a = Math.PI / 2 + (i / 8) * (Math.PI / 2); pts.push([X(w0) + R + Math.cos(a) * R, Z(wz0) + R - Math.sin(a) * R]); }
    shape.moveTo(pts[0][0], -pts[0][1]); for (const [px, pz] of pts.slice(1)) shape.lineTo(px, -pz);
    const ring = (y0: number, h: number, grow: number) => {
      const s = new THREE.Shape(); const cx = (X(w0) + X(w1)) / 2, cz = (Z(wz0) + Z(wz1)) / 2;
      const q = pts.map(([px, pz]) => [cx + (px - cx) * (1 + grow / 10), cz + (pz - cz) * (1 + grow / 9)] as [number, number]);
      s.moveTo(q[0][0], -q[0][1]); for (const [px, pz] of q.slice(1)) s.lineTo(px, -pz);
      return new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, y0, 0);
    };
    const glass = new THREE.ExtrudeGeometry(shape, { depth: H - 1.3, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, y + 0.4, 0);
    // the glass's uvs by world metres round the walls: one picture to 4 m
    { const p = glass.attributes.position as THREE.BufferAttribute, uv = glass.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + p.getZ(i)) / 4, (p.getY(i) - y) / 4); }
    glass.setIndex([...Array(glass.attributes.position.count).keys()]);
    P.add(CURTAIN(), glass);
    c.push([ring(y, 0.4, 0.05), '#8c8a84']);
    c.push([ring(y + H - 0.9, 1.15, 0.12), '#e3e2dc'], [ring(y + H - 0.9 + 1.15, 0.12, 0.2), '#cfcdc6']);
    // the fascia's panel joints on the east face; the projecting trim at the rounded end
    for (let zz = wz0 + R; zz < wz1; zz += 1.6) c.push([box(X(w1) + 0.1, X(w1) + 0.16, y + H - 0.88, y + H + 0.2, Z(zz) - 0.02, Z(zz) + 0.02), '#b9b7b0']);
    c.push([box(X(w1) - 2.5, X(w1) + 1.2, y + H + 0.27, y + H + 0.4, Z(wz0) - 0.6, Z(wz0) + 3), '#d7d6d0']);
    // the entrance framing in the glass (Pair 13): a white surround, the doors
    c.push([box(X(w1) + 0.02, X(w1) + 0.25, y + 0.4, y + 3.6, Z(-369) - 2.2, Z(-369) - 1.95), '#f1f1ee'], [box(X(w1) + 0.02, X(w1) + 0.25, y + 0.4, y + 3.6, Z(-369) + 1.95, Z(-369) + 2.2), '#f1f1ee'], [box(X(w1) + 0.02, X(w1) + 0.3, y + 3.4, y + 3.7, Z(-369) - 2.3, Z(-369) + 2.3), '#f1f1ee']);
    k.plain.push([box(X(w1) - 0.05, X(w1) + 0.05, y + 0.4, y + 2.7, Z(-369) - 1.8, Z(-369) + 1.8), '#24364f']);
    // the sloping glazed section climbing from the wing's roof to the slab (Pair 13)
    {
      const sy = gh(ECG.slab[0], ECG.slab[2]), top = sy + ECG.slabFloors * ECG.storey - 1.0, xa = X(ECG.slab[0] + 3), xb = X(ECG.slab[1] - 2);
      const za = Z(ECG.slab[2]), zb = Z(ECG.slab[2] - 5.5), yb = y + H + 0.2;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([xa, yb, zb, xb, yb, zb, xb, top, za, xa, top, za], 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, (xb - xa) / 4, 0, (xb - xa) / 4, 2, 0, 2], 2));
      g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals(); P.add(CURTAIN(), g);
      for (const xx of [xa, xb]) { const s = new THREE.BufferGeometry(); s.setAttribute('position', new THREE.Float32BufferAttribute([xx, yb, zb, xx, yb, za, xx, top, za], 3)); s.setIndex([0, 1, 2]); s.computeVertexNormals(); c.push([s, '#f2f2ef']); }
    }
    // the small ECG marks high on the slab (east and south faces)
    {
      const sy = gh(ECG.slab[1], ECG.slab[3]) + ECG.slabFloors * ECG.storey;
      P.wall(ECG_MARK(), ECG.slab[1] + 0.06, ECG.slab[3] - 1.4, ECG.slab[1] + 0.06, ECG.slab[3] - 3.0, sy - 2.4, sy - 0.8);
      P.wall(ECG_MARK(), ECG.slab[1] - 1.2, ECG.slab[3] + 0.06, ECG.slab[1] - 2.8, ECG.slab[3] + 0.06, sy - 2.4, sy - 0.8);
    }
    wallSolids(w0, wz1, w1, wz1, 0.3); wallSolids(w1, wz0 + R, w1, wz1, 0.3); wallSolids(w0, wz0 + R, w0, wz1, 0.3); wallSolids(w0 + R, wz0, w1 - R, wz0, 0.3);
    // ---------- the frontage: the low white wall with posts and railing, planting behind, the board, worn paving ----------
    const [g0, g1] = ECG.gate;
    postWall(c, EO, [[ECG.wallX, ECG.wall[0]], [ECG.wallX, g0]], ECG.wallH, 0.75);
    postWall(c, EO, [[ECG.wallX, g1], [ECG.wallX, ECG.wall[1]]], ECG.wallH, 0.75);
    postWall(c, EO, [[ECG.wallX, ECG.wall[0]], [w0 - 1.5, ECG.wall[0]]], ECG.wallH, 0.75);
    k.meshes.push(drapeMesh(drapeAt(EO, ECG.wallX - 0.2, 726, ECG.wall[0] - 2, ECG.wall[1] + 1, 0.8, 0.035, (x, z) => {
      const fx = xAt(FRONT, z); if (!Number.isNaN(fx) && x > fx - LANE_HALF - 0.2) return null;
      return vnoise(x * 0.3, z * 0.3) > 0.6 ? earth(x, z) : worn(x, z);
    })));
    k.meshes.push(drapeMesh(drapeAt(EO, w1 + 0.3, ECG.wallX - 0.25, ECG.wall[0] + 0.3, ECG.wall[1] - 0.3, 0.6, 0.03, (x, z) => (z > g0 - 1 && z < g1 + 1 ? worn(x, z) : earth(x, z)))));
    for (let z = ECG.wall[0] + 1.2, i = 0; z < ECG.wall[1] - 0.8; z += 1.6 + hash(i, 2.2) * 1.4, i++) {
      if (z > g0 - 1.5 && z < g1 + 1.5) continue;
      const x = w1 + 0.9 + hash(i, 3.1) * (ECG.wallX - w1 - 1.6), yy = gh(x, z);
      if (hash(i, 4.4) < 0.3) compactTree(leaf, wood, EO, x, z, yy, 2.4 + hash(i, 5) * 1.4, 1.4 + hash(i, 6) * 0.8, i + 300);
      else shrub(leaf, EO, x, z, yy, 0.8 + hash(i, 7) * 0.7, i + 310, ['#4f8a34', '#5e9a3a', '#3f7a2b', '#7aa63e']);
    }
    // ECG GOES CASHLESS on its two posts (Pairs 12, 13)
    {
      const [x, z] = ECG.board, yy = gh(x, z);
      for (const s of [-1.1, 1.1]) { c.push([box(x - 0.08 - EO[0], x + 0.08 - EO[0], yy, yy + 4.3, z + s - 0.08 - EO[1], z + s + 0.08 - EO[1]), '#2b2d30']); SOLIDS.add(x, z + s, 0.15); }
      P.wall(CASHLESS(), x + 0.05, z + 1.25, x + 0.05, z - 1.25, yy + 1.4, yy + 4.5);
      P.wall(CASHLESS(), x - 0.05, z - 1.25, x - 0.05, z + 1.25, yy + 1.4, yy + 4.5);
    }
    // ---------- the low halls with the yellow-green curved roofs behind (Pair 13; outlines 849, 850) ----------
    for (const [x0, x1, z0, z1] of VAULTS) {
      const yy = Math.min(gh(x0, z0), gh(x1, z1)), wh = 3.2, r = (z1 - z0) / 2;
      c.push([box(X(x0), X(x1), yy, yy + wh, Z(z0) + 0.3, Z(z1) - 0.3), '#efede6']);
      const vault = new THREE.CylinderGeometry(r, r, x1 - x0 + 0.6, 18, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).scale(1, 0.55, 1);
      c.push([vault.translate((X(x0) + X(x1)) / 2, yy + wh, (Z(z0) + Z(z1)) / 2), '#b9c86a']);
      for (let x = x0 + 1; x < x1; x += 3) for (const z of [z0 + 0.4, z1 - 0.4]) SOLIDS.add(x, z, 0.4);
      wallSolids(x0, z0 + 0.3, x0, z1 - 0.3, 0.3); wallSolids(x1, z0 + 0.3, x1, z1 - 0.3, 0.3);
    }
    finish(k, c, wood, leaf, b, P, 'ecg office');
  },
};

// ======================================================================================================
// the guesthouse block (grey gable, blue glazing) and its small green-roofed huts
// ======================================================================================================
const BO: P2 = [690, -406];
const HALL_SIDE: Style = st(4, (g) => {
  render(g, '#f3f2ee');
  g.fillStyle = '#2d3946'; g.fillRect(90, 120, 76, 70); g.fillStyle = '#e4e6e8'; g.fillRect(86, 190, 84, 5);
  g.fillStyle = '#d6d3cb'; g.fillRect(0, 488, 256, 24);
});
const HALL_END: Style = st(3.2, (g) => { render(g, '#f3f2ee'); g.fillStyle = '#d6d3cb'; g.fillRect(0, 488, 256, 24); g.fillStyle = '#3e5f95'; g.fillRect(100, 300, 56, 70); });
const WEST_WALL: Style = st(3.4, (g) => { render(g, '#efe9dc'); g.fillStyle = '#2f3a44'; g.fillRect(80, 290, 96, 110); g.fillStyle = '#cfc6b4'; g.fillRect(0, 490, 256, 22); });
const HUT_WALL: Style = st(3, (g) => { render(g, '#f4f3ef'); g.fillStyle = '#2f3a46'; g.fillRect(84, 300, 88, 96); g.fillStyle = '#cfccc4'; g.fillRect(0, 490, 256, 22); });
const [hx0, hx1, hz0, hz1] = GUEST.hall, [wx0, wx1, wz0, wz1] = GUEST.west;
const guesthouse: Spec = {
  name: 'Guesthouse block by the ECG office', axis: [1, 0], origin: BO, storey: GUEST.hallH / 2, style: HALL_SIDE, roofColor: '#7e8286', fascia: '#e8e6e0', pitch: 0.3,
  replaces: [[700, -406], [665, -406], [690, -400]],
  blocks: [
    { x0: hx0 - BO[0], x1: hx1 - BO[0], z0: hz0 - BO[1], z1: hz1 - BO[1], floors: 2, roof: 'none', faces: { z0: HALL_SIDE, z1: HALL_SIDE, x1: HALL_END, x0: HALL_END } },
    { x0: wx0 - BO[0], x1: wx1 - BO[0] - 0.4, z0: wz0 - BO[1] + 1, z1: wz1 - BO[1] - 1, floors: 2, roof: 'hip', roofColor: '#8a5a3c', pitch: 0.28, faces: { x0: WEST_WALL, z0: WEST_WALL, z1: WEST_WALL, x1: WEST_WALL } },
  ],
  keep: [],
  onGround: true,
  extras: (k) => {
    const c: Part[] = [], leaf: Part[] = [], wood: Part[] = [], b = new Bag(BO), P = new Pics(BO);
    const X = (x: number) => x - BO[0], Z = (z: number) => z - BO[1];
    const y = Math.min(gh(hx0, hz0), gh(hx1, hz1)), e = y + GUEST.hallH, top = e + GUEST.ridge, zm = (hz0 + hz1) / 2, ov = 0.7;
    // ---------- the broad grey gable roof, its ridge west-east, the gable to the road (Pair 14) ----------
    {
      const roofCol = '#7c8085', q = (pts: number[][]) => {
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3));
        g.setIndex(pts.length === 4 ? [0, 1, 2, 0, 2, 3] : [0, 1, 2]); g.computeVertexNormals(); return g;
      };
      const xa = X(hx0) - 0.2, xb = X(hx1) + ov;
      c.push([q([[xa, e - 0.35, Z(hz0) - ov], [xb, e - 0.35, Z(hz0) - ov], [xb, top, Z(zm)], [xa, top, Z(zm)]]), roofCol]);
      c.push([q([[xb, e - 0.35, Z(hz1) + ov], [xa, e - 0.35, Z(hz1) + ov], [xa, top, Z(zm)], [xb, top, Z(zm)]]), roofCol]);
      // the roof's thickness and its sheets' ribs
      for (let x = xa + 0.6; x < xb; x += 0.9) for (const s of [-1, 1]) c.push([rod([x, e - 0.3, Z(s < 0 ? hz0 : hz1) + s * ov], [x, top + 0.04, Z(zm)], 0.04), '#6b6f73']);
      // the gable walls: white triangles at both ends, the east one under the overhang
      for (const xx of [X(hx0) + 0.02, X(hx1) - 0.02]) c.push([q([[xx, e, Z(hz0)], [xx, e, Z(hz1)], [xx, top - 0.3, Z(zm)]]), '#f3f2ee']);
      c.push([q([[X(hx1) + 0.01, e, Z(hz1)], [X(hx1) + 0.01, e, Z(hz0)], [X(hx1) + 0.01, top - 0.3, Z(zm)]]), '#f3f2ee']);
      c.push([box(X(hx1) + ov - 0.25, X(hx1) + ov, e - 0.4, e - 0.2, Z(hz0) - ov, Z(hz1) + ov), '#e8e6e0']);
      // the vent stack on the ridge (Pair 14)
      c.push([box(X(hx1) - 9, X(hx1) - 7.6, top - 0.6, top + 1.6, Z(zm) - 0.7, Z(zm) + 0.7), '#5e6266']);
    }
    // the large blue glazed bay in the middle of the east gable, its frame; the small side windows
    {
      const gw = 9.5, gz0 = zm - gw / 2, gz1 = zm + gw / 2;
      P.wall(GABLE_GLASS(), hx1 + 0.08, gz1, hx1 + 0.08, gz0, y + 1.2, e + 2.2);
      c.push([box(X(hx1), X(hx1) + 0.2, y + 1.0, y + 1.2, Z(gz0) - 0.25, Z(gz1) + 0.25), '#dfe1e2'], [box(X(hx1), X(hx1) + 0.2, e + 2.2, e + 2.45, Z(gz0) - 0.25, Z(gz1) + 0.25), '#dfe1e2']);
      for (const zz of [gz0 - 0.2, gz1 + 0.2]) c.push([box(X(hx1), X(hx1) + 0.2, y + 1.0, e + 2.45, Z(zz) - 0.15, Z(zz) + 0.15), '#dfe1e2']);
      for (const zz of [hz0 + 2.5, hz1 - 2.5]) k.plain.push([box(X(hx1) + 0.02, X(hx1) + 0.1, y + 4.6, y + 5.6, Z(zz) - 0.5, Z(zz) + 0.5), '#3e5f95']);
    }
    // ---------- the frontage: the low wall and railing with its gate, the paved apron to the road, the tank stand ----------
    postWall(c, BO, [[GUEST.fenceX, GUEST.fence[0]], [GUEST.fenceX, -404.5]], 0.9, 0.85, 3.4);
    postWall(c, BO, [[GUEST.fenceX, -398.0], [GUEST.fenceX, GUEST.fence[1]]], 0.9, 0.85, 3.4);
    k.meshes.push(drapeMesh(drapeAt(BO, hx1 + 0.3, 738, -444, -389, 0.8, 0.035, (x, z) => {
      if (clearOf(x, z) < 0.2) return null;
      if (z < -428 && x < 717) return null;
      return vnoise(x * 0.25, z * 0.25) > 0.68 ? earth(x, z) : worn(x, z);
    })));
    {
      const [x, z] = GUEST.tank, yy = gh(x, z);
      for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { c.push([box(X(x + dx) - 0.08, X(x + dx) + 0.08, yy, yy + 6.2, Z(z + dz) - 0.08, Z(z + dz) + 0.08), '#5b5f63']); SOLIDS.add(x + dx, z + dz, 0.12); }
      for (const h of [2, 4, 6.2]) c.push([box(X(x) - 1.1, X(x) + 1.1, yy + h - 0.08, yy + h, Z(z) - 1.1, Z(z) + 1.1), '#5b5f63']);
      for (const h of [4.1, 6.3]) c.push([new THREE.CylinderGeometry(0.85, 0.85, 1.7, 14).translate(X(x), yy + h + 0.85, Z(z)), '#1d1e20']);
    }
    // the blue vertical sign at the entrance (Pair 14)
    { const [x, z] = GUEST.sign, yy = gh(x, z); c.push([box(X(x) - 0.06, X(x) + 0.06, yy, yy + 0.5, Z(z) - 0.4, Z(z) + 0.4), '#8a8d90']); P.wall(BLUE_SIGN(), x + 0.07, z + 0.4, x + 0.07, z - 0.4, yy + 0.5, yy + 4.2); P.wall(BLUE_SIGN(), x - 0.07, z - 0.4, x - 0.07, z + 0.4, yy + 0.5, yy + 4.2); c.push([box(X(x) - 0.06, X(x) + 0.06, yy + 0.5, yy + 4.2, Z(z) - 0.4, Z(z) + 0.4), '#1f3f8f']); SOLIDS.add(x, z, 0.4); }
    for (const [x, z] of [[738, -436], [744, -452]] as P2[]) if (clearOf(x, z) > 2) broadleaf(k, leaf, x, z, { h: 8, spread: 8, seed: x + z, origin: BO, round: true });
    for (const [x, z, h] of [[716.5, -429.0, 4.5], [731.0, -430.0, 5.0]] as [number, number, number][]) if (clearOf(x, z) > 1) christmasPalm(leaf, wood, BO, x, z, h, x + z);
    finish(k, c, wood, leaf, b, P, 'guesthouse');
  },
};
const HO: P2 = [724, -428];
const huts: Spec = {
  name: 'Guesthouse entrance huts', axis: [1, 0], origin: HO, storey: 3.0, style: HUT_WALL, roofColor: '#a9cf9c', fascia: '#e8e6e0', pitch: 0.32,
  replaces: GUEST.huts.map(([a, b, c, d]) => [(a + b) / 2, (c + d) / 2] as P2),
  blocks: GUEST.huts.map(([x0, x1, z0, z1]) => ({ x0: x0 - HO[0], x1: x1 - HO[0], z0: z0 - HO[1], z1: z1 - HO[1], floors: 1, roof: 'hip' as const })),
  keep: [],
  onGround: true,
  extras: () => undefined,
};

// ======================================================================================================
// the Ghana Water compound
// ======================================================================================================
const GO: P2 = [690, -315];
const OFFICE_WALL: Style = st(3.0, (g) => {
  render(g, '#f5f5f2');
  g.fillStyle = '#1f2c3a'; g.fillRect(70, 150, 116, 150); g.fillStyle = '#e9ebec'; g.fillRect(126, 150, 4, 150); g.fillRect(70, 222, 116, 4);
  g.fillStyle = '#dcdad4'; g.fillRect(0, 0, 256, 18); g.fillStyle = '#9fa6ad'; g.fillRect(0, 490, 256, 22);
});
const GUARD_WALL: Style = st(2.7, (g) => {
  render(g, '#f5f5f2'); g.fillStyle = BLUE; g.fillRect(0, 300, 256, 212);
  g.fillStyle = '#2b3e5e'; g.fillRect(60, 150, 136, 150); g.fillStyle = '#8fa3c0'; for (let x = 64; x < 196; x += 12) g.fillRect(x, 154, 4, 142);
});
const ANNEX_WALL: Style = st(3, (g) => { render(g, '#f4f4f1'); g.fillStyle = '#2a3542'; g.fillRect(90, 170, 76, 100); g.fillStyle = BLUE; g.fillRect(0, 470, 256, 42); });
const [ox0, ox1, oz0, oz1] = GW.office;
const compound: Spec = {
  name: 'Ghana Water compound', axis: [1, 0], origin: GO, storey: 3.4, style: OFFICE_WALL, roofColor: '#cfcac0', fascia: '#efeeea', pitch: 0.2,
  replaces: [[663.6, -319.5], [674.5, -327], [678.8, -329], [712, -295]],
  blocks: [
    // the stepped office: a deeper middle with the recessed entrance, the wings stepping forward either side (Pair 10)
    { x0: ox0 - GO[0], x1: ox1 - GO[0] - 2.5, z0: oz0 - GO[1], z1: oz1 - GO[1], floors: 2, roof: 'flat' },
    { x0: ox1 - GO[0] - 2.5, x1: ox1 - GO[0], z0: oz0 - GO[1], z1: oz0 - GO[1] + 8.5, floors: 2, roof: 'flat' },
    { x0: ox1 - GO[0] - 2.5, x1: ox1 - GO[0], z0: oz1 - GO[1] - 8.0, z1: oz1 - GO[1], floors: 2, roof: 'flat' },
    { x0: GW.guard[0] - GO[0], x1: GW.guard[1] - GO[0], z0: GW.guard[2] - GO[1], z1: GW.guard[3] - GO[1], floors: 1, roof: 'none', faces: { x0: GUARD_WALL, x1: GUARD_WALL, z0: GUARD_WALL, z1: GUARD_WALL } },
    ...GW.annex.map(([x0, x1, z0, z1]) => ({ x0: x0 - GO[0], x1: x1 - GO[0], z0: z0 - GO[1], z1: z1 - GO[1], floors: 1, roof: 'flat' as const, faces: { x0: ANNEX_WALL, x1: ANNEX_WALL, z0: ANNEX_WALL, z1: ANNEX_WALL } })),
  ],
  keep: [],
  onGround: true,
  extras: (k) => {
    const c: Part[] = [], leaf: Part[] = [], wood: Part[] = [], b = new Bag(GO), P = new Pics(GO);
    const X = (x: number) => x - GO[0], Z = (z: number) => z - GO[1];
    const y = Math.min(gh(ox0, oz0), gh(ox1, oz1)), e = y + 2 * 3.4;
    // the raised cap on the office's roof (its use unknown: a plain white box under a thin overhanging slab, Pair 10)
    {
      const [x0, x1, z0, z1] = GW.cap;
      c.push([box(X(x0), X(x1), e + 0.2, e + 2.6, Z(z0), Z(z1)), '#f5f5f2'], [box(X(x0) - 0.6, X(x1) + 0.6, e + 2.6, e + 2.85, Z(z0) - 0.6, Z(z1) + 0.6), '#e4e3de']);
      for (const zz of [z0 + 2.2, z1 - 3.4]) k.plain.push([box(X(x1) + 0.01, X(x1) + 0.05, e + 0.9, e + 1.9, Z(zz), Z(zz) + 1.4), '#1f2c3a']);
      // the parapets and the recessed entrance's dark doorway and steps
      c.push([box(X(ox1) - 2.6, X(ox1) - 2.4, y, y + 2.6, Z(oz0 + 8.5) + 2.0, Z(oz1 - 8.0) - 2.0), '#2a2f34']);
      c.push([box(X(ox1) - 2.5, X(ox1) + 0.6, y, y + 0.32, Z(oz0 + 8.5), Z(oz1 - 8.0)), '#d6d1c6']);
      // the canopy of slim columns over the entrance
      c.push([box(X(ox1) - 2.5, X(ox1) + 0.8, y + 3.2, y + 3.45, Z(oz0 + 8.5), Z(oz1 - 8.0)), '#efeeea']);
      for (const zz of [oz0 + 9.2, oz1 - 8.7]) { c.push([box(X(ox1) + 0.5, X(ox1) + 0.75, y, y + 3.2, Z(zz) - 0.12, Z(zz) + 0.12), '#efeeea']); SOLIDS.add(ox1 + 0.6, zz, 0.2); }
    }
    // the guardhouse's blue hipped sheet roof (Pair 10)
    {
      const [x0, x1, z0, z1] = GW.guard, gy = Math.min(gh(x0, z0), gh(x1, z1)) + 2.7, o = 0.7, xm = (x0 + x1) / 2, zm = (z0 + z1) / 2, t = gy + 1.5;
      const q = (pts: number[][]) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3)); g.setIndex(pts.length === 4 ? [0, 1, 2, 0, 2, 3] : [0, 1, 2]); g.computeVertexNormals(); return g; };
      const A = [X(x0 - o), gy, Z(z0 - o)], B = [X(x1 + o), gy, Z(z0 - o)], C = [X(x1 + o), gy, Z(z1 + o)], D = [X(x0 - o), gy, Z(z1 + o)];
      const r0 = [X(xm) - 0.3, t, Z(zm)], r1 = [X(xm) + 0.3, t, Z(zm)];
      c.push([q([A, B, r1, r0]), '#4f8fd6'], [q([C, D, r0, r1]), '#4f8fd6'], [q([D, A, r0]), '#4a88cf'], [q([B, C, r1]), '#4a88cf']);
      for (let i = 0; i <= 10; i++) { const tt = i / 10; c.push([rod([A[0] + (B[0] - A[0]) * tt, gy + 0.03, A[2]], [r0[0] + (r1[0] - r0[0]) * tt, t + 0.03, r0[2]], 0.03), '#3d7cc4']); }
      // the lamp over its door
      c.push([box(X(x1) + 0.05, X(x1) + 0.3, gy - 0.6, gy - 0.35, Z(zm) - 0.2, Z(zm) + 0.2), '#2a2a2a']);
    }
    // ---------- the boundary: the blue wall and fence along the road, open at the gate; the gate posts and leaves ----------
    const [f0, f1] = GW.fence, [gt0, gt1] = GW.gate, fx = GW.fenceX;
    blueFence(c, GO, [fx, f0], [fx, gt0], GW.wallH, GW.fenceH);
    blueFence(c, GO, [fx, gt1], [fx, f1], GW.wallH, GW.fenceH);
    // the side fences back from the road (the aerial's compound edges)
    blueFence(c, GO, [fx, f0], [700, f0], GW.wallH, GW.fenceH);
    blueFence(c, GO, [fx, f1], [690, f1], GW.wallH, GW.fenceH);
    for (const zz of [gt0, gt1]) { const yy = gh(fx, zz); c.push([box(X(fx) - 0.42, X(fx) + 0.42, yy, yy + 2.9, Z(zz) - 0.42, Z(zz) + 0.42), BLUE], [box(X(fx) - 0.48, X(fx) + 0.48, yy + 2.9, yy + 3.05, Z(zz) - 0.48, Z(zz) + 0.48), '#e9e9e6']); SOLIDS.add(fx, zz, 0.5); }
    // the two gate leaves standing open inward against the fence (Pair 10)
    for (const [zz, s] of [[gt0, -1], [gt1, 1]] as [number, number][]) { // (each folded back beside its post, clear of the opening)
      const yy = gh(fx, zz), ax = fx - 0.5, bx = fx - 0.5 - 3.2;
      for (const h of [0.15, 1.1, 2.05]) c.push([run(X(ax), Z(zz + s * 0.6), X(bx), Z(zz + s * 0.9), yy + h, yy + h + 0.06, 0.05), BLUE_DARK]);
      for (let j = 0; j <= 20; j++) { const t = j / 20, px = X(ax + (bx - ax) * t), pz = Z(zz + s * (0.6 + 0.3 * t)); c.push([box(px - 0.015, px + 0.015, yy + 0.15, yy + 2.1, pz - 0.015, pz + 0.015), BLUE_DARK]); }
      wallSolids(ax, zz + s * 0.6, bx, zz + s * 0.9, 0.12);
    }
    // ---------- the ground: the hard court inside, the gravel verge outside, brick by the road, the lane's mouth ----------
    const [cx0, cx1, cz0, cz1] = GW.court;
    k.meshes.push(drapeMesh(drapeAt(GO, cx0, cx1, cz0, cz1, 0.8, 0.035, (x, z) => {
      if (x > fx - 0.25) return null;
      if (x > ox0 - 1 && x < ox1 + 0.2 && z > oz0 - 0.2 && z < oz1 + 0.2) return null;
      if (x > fx - 3.5 && (z < gt0 - 4 || z > gt1 + 4)) return vnoise(x, z) > 0.5 ? [0.36, 0.48, 0.26] : earth(x, z);
      return worn(x, z);
    })));
    k.meshes.push(drapeMesh(drapeAt(GO, fx + 0.2, 732, f0 - 6, f1 + 1, 0.6, 0.035, (x, z) => {
      if (clearOf(x, z) < 1.9) return null;
      return gravel(x, z);
    })));
    // the brick paving along the service road's kerb, the island at the lane's mouth, the short striped posts
    {
      const [a, bb] = edges(WSV, f0 - 6, gt0 - 2.6, -(SVC_HALF + 0.1), -(SVC_HALF + 1.9));
      k.meshes.push(ribbon(GO, a, bb, 0.08, brick())); kerbLine(c, GO, a, 0.14);
      const [a2, b2] = edges(WSV, gt1 + 2.6, f1 + 1, -(SVC_HALF + 0.1), -(SVC_HALF + 1.9));
      k.meshes.push(ribbon(GO, a2, b2, 0.08, brick())); kerbLine(c, GO, a2, 0.14);
      for (const p of [...a.filter((_, i) => i % 2 === 1), ...a2.filter((_, i) => i % 2 === 1)]) { const [px, pz] = offLine(WSV, p[1], -(SVC_HALF + 2.3)); if (clearOf(px, pz) > 1.9) stripedPost(c, GO, px, pz, { h: 0.95 }); }
      // the brick walk from the road to the gate beside the lane (Pairs 9, 18) and the lane's kerb returns
      const lz = (x: number) => zAt(LANE173, x);
      const wa: P2[] = [], wb: P2[] = [], ka: P2[] = [], kb: P2[] = [];
      for (let x = fx; x <= xAt(WSV, -300) - SVC_HALF - 0.2; x += 1) { wa.push([x, lz(x) + LANE_HALF + 0.1]); wb.push([x, lz(x) + LANE_HALF + 2.0]); ka.push([x, lz(x) + LANE_HALF + 0.1]); kb.push([x, lz(x) - LANE_HALF - 0.1]); }
      k.meshes.push(ribbon(GO, wb, wa, 0.08, brick())); kerbLine(c, GO, ka, 0.14); kerbLine(c, GO, kb, 0.14);
    }
    // the roadside board at the mouth (Pair 10)
    { const x = fx + 4.2, z = gt1 + 3.2, yy = gh(x, z); for (const s of [-0.5, 0.5]) c.push([box(X(x) - 0.05, X(x) + 0.05, yy, yy + 2.6, Z(z + s) - 0.05, Z(z + s) + 0.05), '#6d7276']); P.wall(GW_BOARD(), x + 0.06, z + 0.6, x + 0.06, z - 0.6, yy + 1.0, yy + 2.8); P.wall(GW_BOARD(), x - 0.06, z - 0.6, x - 0.06, z + 0.6, yy + 1.0, yy + 2.8); SOLIDS.add(x, z, 0.5); }
    // ---------- the towers: the lattice tower on the verge (Pair 11), the red and white mast behind the guardhouse ----------
    { const [x, z, h] = GW.tower; slimMast(c, GO, x, z, h, 2.6, false, 1.6); }
    { const [x, z, h] = GW.mast; slimMast(c, GO, x, z, h, 1.8, true); }
    // ---------- the planting: the sparse mature tree, banana plants and small palms along the fence, shrubs ----------
    broadleaf(k, leaf, GW.tree[0], GW.tree[1], { h: 12, spread: 13, sparse: true, seed: 71, origin: GO });
    broadleaf(k, leaf, 700, -345, { h: 8, spread: 9, sparse: true, seed: 73, origin: GO });
    for (let z = f0 + 1.5, i = 0; z < f1 - 1; z += 2.2 + hash(i, 1.3) * 2.2, i++) {
      if (z > gt0 - 2 && z < gt1 + 6) continue;
      const x = fx - 1.0 - hash(i, 2.7) * 2.0;
      if (SOLIDS.at(x, z, 0.7)) continue;
      const r = hash(i, 3.9);
      if (r < 0.5) banana(leaf, wood, GO, x, z, 3.2 + hash(i, 4) * 1.4, i + 40);
      else if (r < 0.72) christmasPalm(leaf, wood, GO, x, z, 2.6 + hash(i, 5) * 1.6, i + 60);
      else shrub(leaf, GO, x, z, gh(x, z), 0.9 + hash(i, 6) * 0.7, i + 80);
    }
    for (let i = 0; i < 18; i++) { const x = ox1 + 3 + hash(i, 8.1) * 26, z = oz0 - 4 + hash(8.3, i) * 40; if (SOLIDS.at(x, z, 1.2) || (z > -312 && z < -296)) continue; if (hash(i, 9) < 0.4) banana(leaf, wood, GO, x, z, 3 + hash(i, 1) * 1.5, i + 120); else shrub(leaf, GO, x, z, gh(x, z), 0.7 + hash(i, 2) * 0.6, i + 140); }
    // the light canopy north of the lane's end (Pair 10): slim posts, a shallow blue sheet roof
    {
      const [x0, x1, z0, z1] = GW.canopy, yy = Math.min(gh(x0, z0), gh(x1, z1));
      for (const xx of [x0, x1]) for (const zz of [z0, z1]) { c.push([box(X(xx) - 0.06, X(xx) + 0.06, yy, yy + 2.6, Z(zz) - 0.06, Z(zz) + 0.06), '#d9d9d6']); SOLIDS.add(xx, zz, 0.1); }
      c.push([box(X(x0) - 0.4, X(x1) + 0.4, yy + 2.6, yy + 2.7, Z(z0) - 0.4, Z(z1) + 0.4), '#3f7fcf']);
    }
    finish(k, c, wood, leaf, b, P, 'ghana water');
  },
};

// ======================================================================================================
// the low cream building with the red roof and the fenced utility yard
// ======================================================================================================
const SO: P2 = [800, -365];
const CREAM: Style = st(3.1, (g) => {
  render(g, '#eadfc4');
  g.fillStyle = '#2b2a28'; g.fillRect(92, 230, 72, 86); g.fillStyle = '#d8ccae'; g.fillRect(88, 316, 80, 6);
  g.fillStyle = '#c9bb98'; g.fillRect(0, 480, 256, 32);
});
const substation: Spec = {
  name: 'Utility yard building', axis: [1, 0], origin: SO, storey: 3.5, style: CREAM, roofColor: '#b5432f', fascia: '#e2d8be', pitch: 0.42,
  replaces: [[788.4, -357.5], [821.5, -373.6]],
  blocks: [
    { x0: SUB.house[0] - SO[0], x1: SUB.house[1] - SO[0], z0: SUB.house[2] - SO[1], z1: SUB.house[3] - SO[1], floors: 1, roof: 'hip' },
    { x0: SUB.small[0] - SO[0], x1: SUB.small[1] - SO[0], z0: SUB.small[2] - SO[1], z1: SUB.small[3] - SO[1], floors: 1, roof: 'hip', pitch: 0.5 },
  ],
  keep: [],
  onGround: true,
  extras: (k) => {
    const c: Part[] = [], leaf: Part[] = [], wood: Part[] = [], b = new Bag(SO), P = new Pics(SO);
    const X = (x: number) => x - SO[0], Z = (z: number) => z - SO[1];
    // ---------- the fence along the service road: a cream base, cream posts, black vertical pickets, the gate ----------
    const [f0, f1] = SUB.fence, [g0, g1] = SUB.gate, fo = SVC_HALF + SUB.fenceOff;
    const fenceRun = (za: number, zb: number) => {
      for (let z = za; z < zb - 0.01; z += 3) {
        const z2 = Math.min(zb, z + 3), [ax, az] = offLine(ESV, z, fo), [bx, bz] = offLine(ESV, z2, fo), yy = Math.min(gh(ax, az), gh(bx, bz));
        c.push([run(X(ax), Z(az), X(bx), Z(bz), yy - 0.2, yy + 0.6, 0.3), '#e4d8b8']);
        for (const h of [0.75, 2.05]) c.push([run(X(ax), Z(az), X(bx), Z(bz), yy + h - 0.03, yy + h + 0.03, 0.05), '#1c1c1c']);
        for (let j = 0; j < 20; j++) { const t = j / 20, px = X(ax + (bx - ax) * t), pz = Z(az + (bz - az) * t); c.push([box(px - 0.014, px + 0.014, yy + 0.6, yy + 2.15, pz - 0.014, pz + 0.014), '#1c1c1c']); }
        c.push([box(X(ax) - 0.24, X(ax) + 0.24, yy - 0.2, yy + 2.4, Z(az) - 0.24, Z(az) + 0.24), '#ece2c6'], [box(X(ax) - 0.28, X(ax) + 0.28, yy + 2.4, yy + 2.5, Z(az) - 0.28, Z(az) + 0.28), '#d9cdae']);
        wallSolids(ax, az, bx, bz, 0.25);
      }
    };
    fenceRun(f0, g0); fenceRun(g1, f1);
    // the gate: two black leaves, closed
    { const [ax, az] = offLine(ESV, g0, fo), [bx, bz] = offLine(ESV, g1, fo), yy = gh(ax, az); c.push([run(X(ax), Z(az), X(bx), Z(bz), yy + 0.05, yy + 2.1, 0.06), '#202020']); for (const [px, pz] of [[ax, az], [bx, bz]]) c.push([box(X(px) - 0.3, X(px) + 0.3, yy - 0.2, yy + 2.6, Z(pz) - 0.3, Z(pz) + 0.3), '#ece2c6']); wallSolids(ax, az, bx, bz, 0.25); }
    // the yard's other sides: a plain block wall
    { const [nx, nz] = offLine(ESV, f0, fo), [sx, sz] = offLine(ESV, f1, fo), [x0, x1, z0, z1] = SUB.yard;
      for (const [a, bb] of [[[nx, nz], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [sx, sz]]] as [P2, P2][]) { const yy = Math.min(gh(a[0], a[1]), gh(bb[0], bb[1])); c.push([run(X(a[0]), Z(a[1]), X(bb[0]), Z(bb[1]), yy - 0.2, yy + 2.2, 0.22), '#d9d1bf']); wallSolids(a[0], a[1], bb[0], bb[1], 0.2); }
      void x0;
    }
    // ---------- the yard: gravel, patchy grass, the equipment frames and the dark tank (conservative shapes) ----------
    const inYard = (x: number, z: number) => z > f0 && z < f1 && x > offLine(ESV, z, fo)[0] + 0.3 && x < SUB.yard[1] - 0.2;
    k.meshes.push(drapeMesh(drapeAt(SO, 783, SUB.yard[1], f0, f1, 0.8, 0.035, (x, z) => {
      if (!inYard(x, z)) return null;
      if (x > SUB.house[0] - 1 && x < SUB.house[1] + 1 && z > SUB.small[2] - 1 && z < SUB.house[3] + 1) return worn(x, z);
      return vnoise(x * 0.3, z * 0.3) > 0.55 ? [0.38 + vnoise(x, z) * 0.05, 0.5, 0.27] : gravel(x, z);
    })));
    const yat: V3[][] = [];
    for (const [x, z] of [[808, -385], [808, -370], [808, -355], [822, -385], [822, -370], [822, -355], [822, -342]] as P2[]) {
      const yy = gh(x, z);
      // a steel gantry of two posts and a beam, insulators and a box under it
      for (const s of [-1.6, 1.6]) { c.push([box(X(x) - 0.12, X(x) + 0.12, yy, yy + 6.5, Z(z + s) - 0.12, Z(z + s) + 0.12), '#9ea3a6']); SOLIDS.add(x, z + s, 0.2); }
      c.push([box(X(x) - 0.1, X(x) + 0.1, yy + 6.2, yy + 6.5, Z(z) - 2.0, Z(z) + 2.0), '#9ea3a6']);
      c.push([box(X(x) - 1.0, X(x) + 1.0, yy, yy + 2.0, Z(z) - 0.9, Z(z) + 0.9), '#6c7074'], [box(X(x) - 1.05, X(x) + 1.05, yy, yy + 0.3, Z(z) - 0.95, Z(z) + 0.95), '#55585b']);
      SOLIDS.add(x, z, 1.2);
      const at: V3[] = []; for (const s of [-1.2, 0, 1.2]) { c.push([new THREE.CylinderGeometry(0.06, 0.08, 0.5, 6).translate(X(x), yy + 6.8, Z(z + s)), '#d9d5cb']); at.push([X(x), yy + 7.0, Z(z + s)]); }
      yat.push(at);
    }
    spans(c, [yat[0], yat[1], yat[2]], 0.3); spans(c, [yat[3], yat[4], yat[5], yat[6]], 0.3);
    { const [x, z] = SUB.tank, yy = gh(x, z); c.push([new THREE.CylinderGeometry(1.5, 1.5, 3.2, 16).translate(X(x), yy + 1.6, Z(z)), '#232426'], [new THREE.CylinderGeometry(1.55, 1.55, 0.15, 16).translate(X(x), yy + 3.25, Z(z)), '#3a3b3d']); SOLIDS.add(x, z, 1.6); }
    for (let i = 0; i < 40; i++) { const x = 802 + hash(i, 1.7) * 28, z = f0 + 2 + hash(2.9, i) * (f1 - f0 - 4); if (!inYard(x, z) || SOLIDS.at(x, z, 1.4)) continue; if (hash(i, 3) < 0.35) shrub(leaf, SO, x, z, gh(x, z), 0.6 + hash(i, 4) * 0.6, i + 500); else tuft(b, x, z, 0.4 + hash(i, 5) * 0.3, ['#7d8a44', '#8d9450', '#6b7a3a'][i % 3], i + 520); }
    finish(k, c, wood, leaf, b, P, 'utility yard');
  },
};

// ======================================================================================================
// the highway: the divider, the planted separation, the strips, the kerbs; the utility corridor on the east verge
// ======================================================================================================
const CO: P2 = [775, -360];
const corridor: Spec = {
  name: 'N4 by the ECG office', axis: [1, 0], origin: CO, storey: 3, style: PLAIN, roofColor: '#888', fascia: '#888', pitch: 0.2,
  replaces: [], blocks: [], keep: [], onGround: true,
  extras: (k) => {
    const c: Part[] = [], leaf: Part[] = [], wood: Part[] = [], b = new Bag(CO), P = new Pics(CO);
    // ---------- the kerbs of every road here (the generic verge strips stay out) ----------
    const zN = -500, zS = -308;
    kerbs(c, CO, SB, N4_HALF, zN, zS); kerbs(c, CO, NB, N4_HALF, zN, zS);
    kerbs(c, CO, ESV, SVC_HALF, zN, zS); kerbs(c, CO, WSV, SVC_HALF, zN, zS, [1]);
    kerbs(c, CO, WSV, SVC_HALF, zN, -352, [-1]); kerbs(c, CO, FRONT, LANE_HALF, -485, -336);
    // ---------- the median: asphalt to the low concrete divider in the middle (Pairs 7, 8), a low kerb toward the cut ----------
    const mid = (z: number): P2 => [(xAt(SB, z) + xAt(NB, z)) / 2, z];
    const inMedian = (x: number, z: number) => { const a = xAt(SB, z) + N4_HALF, bb = xAt(NB, z) - N4_HALF; return !Number.isNaN(a) && !Number.isNaN(bb) && x > a - 0.05 && x < bb + 0.05; };
    k.meshes.push(drapeMesh(drapeAt(CO, 735, 800, DIV.z0 - 2, zS, 0.6, 0.02, (x, z) => (inMedian(x, z) ? asphalt(x, z) : null))));
    { const hi: P2[] = [], lo: P2[] = []; for (let z = DIV.z0; z <= DIV.low; z += 3) hi.push(mid(z)); for (let z = DIV.low; z <= DIV.z1; z += 3) lo.push(mid(z)); divider(c, CO, hi, DIV.h); divider(c, CO, lo, DIV.lowH); }
    // ---------- the planted separation between the northbound carriageway and the east service road (Pairs 3, 4):
    // grass with bare patches; compact trees on short stems and low shrubs in an uneven line; the banded twin lights ----------
    const sep = (z: number): [number, number] => [xAt(NB, z) + N4_HALF + 0.3, xAt(ESV, z) - SVC_HALF - 0.3];
    k.meshes.push(drapeMesh(drapeAt(CO, 740, 800, PLANT.z0, PLANT.z1, 0.8, 0.03, (x, z) => {
      const [a, bb] = sep(z); if (Number.isNaN(a) || Number.isNaN(bb) || x < a || x > bb) return null;
      const n = vnoise(x * 0.5, z * 0.2), m = vnoise(x * 2, z * 2);
      return n > 0.66 ? [0.58 + m * 0.05, 0.45, 0.31] : [0.34 + m * 0.07, 0.5 + m * 0.06, 0.24];
    })));
    for (let z = PLANT.z0 + 3, i = 0; z < PLANT.z1 - 2; z += 3.5 + hash(z, 1.9) * 5, i++) {
      const [a, bb] = sep(z); if (Number.isNaN(a) || Number.isNaN(bb) || bb - a < 1.5) continue;
      if (hash(z, 2.4) < 0.15) continue; // the gaps
      const x = a + (bb - a) * (0.3 + hash(z, 3.3) * 0.4), y = gh(x, z);
      if (SOLIDS.at(x, z, 1.0)) continue;
      // trees (a short stem, the crown reaching low) where the photographs show crowns over the shrubs, else shrubs
      if (hash(z, 5.7) < 0.45) compactTree(leaf, wood, CO, x, z, y, 2.8 + hash(z, 6) * 1.6, Math.min(bb - a + 1, 2.0 + hash(z, 7) * 1.4), Math.round(-z * 3));
      else shrub(leaf, CO, x, z, y, 0.8 + hash(z, 8) * 0.8, i, ['#4e7a32', '#5b8438', '#3f6b2b', '#6a8a3e']);
    }
    for (let i = 0; i < 160; i++) { const z = PLANT.z0 + hash(i, 6.6) * (PLANT.z1 - PLANT.z0), [a, bb] = sep(z); if (Number.isNaN(a) || bb - a < 1) continue; const x = a + hash(1.1, i) * (bb - a); if (SOLIDS.at(x, z, 0.5)) continue; tuft(b, x, z, 0.3 + hash(i, 2) * 0.35, ['#7d8a44', '#8d9450', '#6b7a3a'][i % 3], i + 7000); }
    for (let z = PLANT.z0 + 8; z < PLANT.z1; z += 36) { const [a, bb] = sep(z); if (Number.isNaN(a) || bb - a < 1.2) continue; const x = (a + bb) / 2; if (SOLIDS.at(x, z, 0.8)) continue; streetLight(c, CO, x, z, 0, { twin: true, bands: true, h: 10.5 }); }
    // ---------- the west strip between the southbound carriageway and the west service road: rough grass, a few shrubs ----------
    const wstrip = (z: number): [number, number] => [xAt(WSV, z) + SVC_HALF + 0.3, xAt(SB, z) - N4_HALF - 0.3];
    k.meshes.push(drapeMesh(drapeAt(CO, 725, 785, zN, zS, 0.8, 0.03, (x, z) => { const [a, bb] = wstrip(z); if (Number.isNaN(a) || Number.isNaN(bb) || x < a || x > bb) return null; return dryGrass(x, z); })));
    for (let i = 0; i < 70; i++) { const z = zN + hash(i, 4.6) * (zS - zN), [a, bb] = wstrip(z); if (Number.isNaN(a) || bb - a < 1.5) continue; const x = a + 0.5 + hash(2.2, i) * (bb - a - 1); if (SOLIDS.at(x, z, 0.8)) continue; if (hash(i, 7) < 0.15) shrub(leaf, CO, x, z, gh(x, z), 0.6 + hash(i, 8) * 0.5, i + 900); else tuft(b, x, z, 0.35 + hash(i, 9) * 0.4, ['#8d9450', '#9a9455', '#7d8a44'][i % 3], i + 7400); }
    for (let z = zN + 20; z < zS - 10; z += 40) { const [a, bb] = wstrip(z); if (Number.isNaN(a) || bb - a < 1.2) continue; streetLight(c, CO, (a + bb) / 2, z, Math.PI, { twin: true, h: 10 }); }
    // the circular 50 signs where the photographs show them (Pairs 6, 7)
    for (const [x, z, f] of SIGNS50) {
      const y = gh(x, z); c.push([new THREE.CylinderGeometry(0.04, 0.04, 2.5, 6).translate(x - CO[0], y + 1.25, z - CO[1]), '#8a8d90']);
      const g = new THREE.PlaneGeometry(0.75, 0.75).rotateY(Math.PI / 2 - f).translate(x - CO[0] + Math.cos(f) * 0.05, y + 2.45, z - CO[1] + Math.sin(f) * 0.05);
      P.add(FIFTY(), g); SOLIDS.add(x, z, 0.1);
    }
    // ---------- the east verge: grass, the brick sidewalk, the paired concrete frames with their wires, the rough land
    // with dry grass, scrub and patchy taller growth, the lattice towers behind (Pairs 1, 5, 7, 8) ----------
    const v0 = SVC_HALF + CORR.verge, v1 = v0 + CORR.walk;
    const subFence = (z: number) => z > SUB.fence[0] - 0.5 && z < SUB.fence[1] + 0.5;
    {
      const [a, bb] = edges(ESV, CORR.z0, CORR.z1, v0, v1);
      k.meshes.push(ribbon(CO, a, bb, 0.07, brick()));
    }
    k.meshes.push(drapeMesh(drapeAt(CO, 760, 900, CORR.z0, CORR.z1, 1.0, 0.03, (x, z) => {
      const kx = xAt(ESV, z); if (Number.isNaN(kx)) return null;
      const d = x - kx; if (d < SVC_HALF + 0.2 || d > SVC_HALF + CORR.depth) return null;
      if (subFence(z) && d > SVC_HALF + SUB.fenceOff - 0.2 && x < SUB.yard[1] + 1) return null;
      if (d < v0) return [0.4 + vnoise(x, z) * 0.06, 0.52, 0.27];
      return dryGrass(x, z);
    })));
    const fsets: V3[][] = [];
    for (let z = CORR.z0 + 6; z < CORR.z1 - 2; z += CORR.frameStep) {
      if (subFence(z)) { if (fsets.length) { spans(c, fsets.splice(0), 0.7); } continue; }
      const [x, zz] = offLine(ESV, z, SVC_HALF + CORR.frameOff), dx = xAt(ESV, z + 1) - xAt(ESV, z - 1);
      fsets.push(hFrame(c, CO, x, zz, Math.atan2(-dx, 2), 10.5, 1.8));
    }
    if (fsets.length) spans(c, fsets, 0.7);
    for (let i = 0; i < 900; i++) {
      const z = CORR.z0 + hash(i, 0.71) * (CORR.z1 - CORR.z0), kx = xAt(ESV, z); if (Number.isNaN(kx)) continue;
      const d = v1 + 1 + Math.pow(hash(0.53, i), 1.3) * (CORR.depth - v1 - 2), x = kx + d;
      if (subFence(z) && x < SUB.yard[1] + 2) continue;
      if (SOLIDS.at(x, z, 0.9) || clearOf(x, z) < 1) continue;
      const r = hash(i, 0.97);
      if (r < 0.2) shrub(leaf, CO, x, z, gh(x, z), 0.7 + hash(i, 3) * 0.9, i + 1200, ['#56783a', '#647f3c', '#4a6b30', '#7a8a44']);
      else if (r < 0.24 && d > 12) compactTree(leaf, wood, CO, x, z, gh(x, z), 3 + hash(i, 4) * 2, 2.2 + hash(i, 5) * 1.5, i + 1300);
      else tuft(b, x, z, 0.35 + hash(i, 6) * 0.5, ['#9a9455', '#8d9450', '#a8a060', '#7d8a44'][i % 4], i + 8000);
    }
    for (const [x, z, h] of TOWERS) {
      const at = latticeTower(c, x - CO[0], z - CO[1], gh(x, z));
      const far: V3[] = at.map((p) => [p[0] + 60, p[1] - 3, p[2] + 160]);
      for (let j = 0; j < 6; j++) { const q = at[j], f = far[j], n: V3 = [q[0] + (f[0] - q[0]) * 0.4, q[1] - 3, q[2] + (f[2] - q[2]) * 0.4]; c.push([rod(q, n, 0.035), '#262626']); }
      SOLIDS.add(x, z, 3.2); void h;
    }
    // the sidewalk along the yard's fence (Pair 5) is the same brick ribbon; a few slender poles along the west service road
    const wpoles: V3[][] = [];
    for (let z = zN + 15; z < -352; z += 40) { const [x, zz] = offLine(WSV, z, -(SVC_HALF + 2.2)); if (clearOf(x, zz) > 1 && !SOLIDS.at(x, zz, 1)) wpoles.push(utilityPole(c, CO, x, zz, 0, 9.5)); }
    spans(c, wpoles, 0.5);
    finish(k, c, wood, leaf, b, P, 'ecg corridor');
  },
};

// ======================================================================================================
// the roadside trading frontage by the side access
// ======================================================================================================
const TO: P2 = [745, -478];
const trading: Spec = {
  name: 'Stalls by the ECG side access', axis: [1, 0], origin: TO, storey: 3, style: PLAIN, roofColor: '#888', fascia: '#888', pitch: 0.2,
  replaces: [], blocks: [], keep: [], onGround: true,
  extras: (k) => {
    const c: Part[] = [], leaf: Part[] = [], wood: Part[] = [], b = new Bag(TO), P = new Pics(TO);
    const inLot = (x: number, z: number) => x > 728 && z < zAt(SIDE175, Math.min(743, Math.max(696, x))) - LANE_HALF - 0.4 && z > -502 && clearOf(x, z) > 2.2 && !(x < 727.8 && z < -476);
    // the bare orange-brown earth, worn hardstanding, sparse grass
    k.meshes.push(drapeMesh(drapeAt(TO, 726, 770, -503, -450, 0.7, 0.035, (x, z) => {
      if (clearOf(x, z) < 0.25) return null;
      if (clearOf(x, z) < 2.2) return [0.38 + vnoise(x, z) * 0.06, 0.5, 0.27];
      if (!inLot(x, z)) return null;
      const n = vnoise(x * 0.3, z * 0.3); return n > 0.72 ? worn(x, z) : n < 0.2 ? [0.45, 0.5, 0.3] : earth(x, z);
    })));
    // the narrow paved footway along the frontage road, its kerb, the short posts, the drain opening (Pairs 16, 17)
    {
      const pts: P2[] = [], out: P2[] = [];
      for (let z = -500; z <= -456; z += 2) { const [x, zz] = offLine(FRONT, z, -(LANE_HALF + 1.2)), [x2, zz2] = offLine(FRONT, z, -(LANE_HALF + 2.6)); if (Number.isNaN(x) || Number.isNaN(x2)) continue; pts.push([x, zz]); out.push([x2, zz2]); }
      k.meshes.push(ribbon(TO, out, pts, 0.07, SLABS()));
      for (let i = 2; i < pts.length - 2; i += 3) { const [x, z] = out[i]; if (!SOLIDS.at(x, z, 0.5)) stripedPost(c, TO, x - 0.2, z, { h: 0.9, band: '#2a2a2a' }); }
      const [dx, dz] = offLine(FRONT, -472, -(LANE_HALF + 1.0)), dy = gh(dx, dz);
      c.push([box(dx - 0.5 - TO[0], dx + 0.5 - TO[0], dy - 0.05, dy + 0.12, dz - 0.35 - TO[1], dz + 0.35 - TO[1]), '#3a3a38'], [box(dx - 0.4 - TO[0], dx + 0.4 - TO[0], dy + 0.12, dy + 0.13, dz - 0.25 - TO[1], dz + 0.25 - TO[1]), '#151515']);
    }
    // the stalls, each by itself, their fronts to the road (Pairs 15-17)
    STALLS.forEach(([x, z, kind, w, d, h], i) => {
      if (!inLot(x, z)) return;
      const f = (hash(i, 1.1) - 0.5) * 0.3;
      stall(c, TO, kind, x, z, f, w, d, h, i + 3, undefined, (m, g) => P.add(m, g));
    });
    // the large rough rocks on the earth
    for (const [x, z, r] of TRADE.rocks) { const y = gh(x, z); c.push([new THREE.DodecahedronGeometry(r, 0).scale(1.3, 0.7, 1).rotateY(x).translate(x - TO[0], y + r * 0.45, z - TO[1]), '#9c6a4a']); SOLIDS.add(x, z, r * 1.1); }
    // the concrete pole with the advertisement (Pair 16)
    { const [x, z] = TRADE.pole, y = gh(x, z); c.push([new THREE.CylinderGeometry(0.16, 0.2, 9, 8).translate(x - TO[0], y + 4.5, z - TO[1]), '#b1ada4']); P.wall(POLE_AD(), x + 0.22, z + 0.8, x + 0.22, z - 0.8, y + 3.6, y + 6.8); P.wall(POLE_AD(), x + 0.18, z - 0.8, x + 0.18, z + 0.8, y + 3.6, y + 6.8); SOLIDS.add(x, z, 0.25); }
    // the service poles and the wires along the frontage
    const poles: V3[][] = [];
    for (const z of [-498, -466]) { const [x, zz] = offLine(FRONT, z, -(LANE_HALF + 3.2)); if (!Number.isNaN(x) && !SOLIDS.at(x, zz, 1)) poles.push(utilityPole(c, TO, x, zz, 0, 9.5)); }
    spans(c, poles, 0.5);
    // the mature trees and palms behind and between the stalls
    for (const [x, z, h, s] of [[731.5, -497, 10, 11], [736.5, -458.5, 8, 8]] as [number, number, number, number][]) if (inLot(x, z)) broadleaf(k, leaf, x, z, { h, spread: s, seed: x + z, origin: TO, round: true });
    for (const [x, z, h] of [[729.5, -468.5, 8], [752.5, -498.5, 9], [735, -484, 7.5]] as [number, number, number][]) if (inLot(x, z)) christmasPalm(leaf, wood, TO, x, z, h, x * 3 + z);
    for (let i = 0; i < 30; i++) { const x = 728 + hash(i, 5.1) * 30, z = -500 + hash(5.3, i) * 46; if (!inLot(x, z) || SOLIDS.at(x, z, 1.5)) continue; tuft(b, x, z, 0.3 + hash(i, 2) * 0.3, ['#8d9450', '#7d8a44'][i % 2], i + 9100); }
    finish(k, c, wood, leaf, b, P, 'ecg stalls');
  },
};

/** the ECG area */
export const ecgSite = createSite('ecg-area', [ecgOffice, guesthouse, huts, compound, substation, corridor, trading, ...keepTiles('ecg area', EC_KEEP)]);
