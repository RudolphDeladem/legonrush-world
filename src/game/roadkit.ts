// Roadside pieces shared by the owner's Legon overhead to Okponglo brief (legonfirst.ts) and ECG area brief (ecg.ts):
// utility poles, the paired concrete H-frames, sagging wire spans, the decorative branching street lights, short striped
// posts, the low concrete divider, roadside stalls (umbrellas, canopies, kiosks), boards on posts, red brick paving laid
// along a road. Everything in world coordinates (x east, z south) turned into a model frame by its origin O; heights from
// the ground (relief.ts) under each piece. Sizes are read from the street photographs, not measured.
import * as THREE from 'three';
import { box, type Part } from './modelkit';
import { SOLIDS } from './solids';
import { wallSolids } from './enkit';
import { groundHeight as gh } from './relief';
import { rod, run, type V3 } from './upsa';

export type P2 = [number, number];
export type Line = P2[];

/** a polyline's x at z (lines that run north to south) */
export const xAt = (line: Line, z: number) => {
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, az] = line[i], [bx, bz] = line[i + 1];
    if ((z - az) * (z - bz) <= 0 && az !== bz) return ax + ((bx - ax) * (z - az)) / (bz - az);
  }
  return NaN;
};
/** the point `off` metres east of a north-south line at z, measured square to the line */
export function offLine(line: Line, z: number, off: number): P2 {
  const x = xAt(line, z), dx = xAt(line, z + 1) - xAt(line, z - 1);
  const ddx = Number.isNaN(dx) ? 0 : dx, l = Math.hypot(ddx, 2);
  return [x + (2 / l) * off, z - (ddx / l) * off];
}
/** two edges along a line from z0 to z1, off0 and off1 metres east of it, every `step` metres (for strips) */
export function edges(line: Line, z0: number, z1: number, off0: number, off1: number, step = 2): [P2[], P2[]] {
  const a: P2[] = [], b: P2[] = [], n = Math.max(1, Math.ceil(Math.abs(z1 - z0) / step));
  for (let i = 0; i <= n; i++) { const z = z0 + ((z1 - z0) * i) / n; const p = offLine(line, z, off0), q = offLine(line, z, off1); if (!Number.isNaN(p[0]) && !Number.isNaN(q[0])) { a.push(p); b.push(q); } }
  return [a, b];
}

// ---------- materials ----------
let brickM: THREE.MeshStandardMaterial | null = null;
/** red-brown brick pavers laid herringbone (the footways, the corner, the forecourt crossings), 4 m to a repeat */
export function brick() {
  if (brickM) return brickM;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#6a4a3e'; g.fillRect(0, 0, 256, 256);
  const cols = ['#a2604b', '#9a5a46', '#ad6a53', '#8f5241', '#b07560', '#9c6650'];
  for (let i = -4; i < 12; i++) for (let j = -4; j < 24; j++) {
    const x = i * 25.6 + (j % 2) * 12.8, y = j * 12.8;
    g.fillStyle = cols[(((i * 7 + j * 3) % 6) + 6) % 6];
    if ((i + j) % 2) g.fillRect(x + 1, y + 1, 23.6, 10.8); else g.fillRect(x + 1, y + 1, 10.8, 23.6);
  }
  // worn grey dust and dark stains over it
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '170,160,150' : '60,50,45'},${0.12 + r() * 0.15})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 8 + r() * 30, 5 + r() * 14, r() * 3, 0, Math.PI * 2); g.fill(); }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  brickM = new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 });
  return brickM;
}
/** a flat paved ribbon between two edges (world points), y above the ground under each point; in the frame of O */
export function ribbon(O: P2, a: P2[], b: P2[], lift: number, mat: THREE.Material) {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i < a.length; i++) {
    pos.push(a[i][0] - O[0], gh(a[i][0], a[i][1]) + lift, a[i][1] - O[1], b[i][0] - O[0], gh(b[i][0], b[i][1]) + lift, b[i][1] - O[1]);
    uv.push(a[i][0] / 4, a[i][1] / 4, b[i][0] / 4, b[i][1] / 4);
    if (i) { const q = i * 2; idx.push(q - 2, q, q - 1, q - 1, q, q + 1); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.userData.noCollide = true;
  (m.material as THREE.Material).side = THREE.DoubleSide;
  return m;
}
/** a kerb along a list of world points: a low concrete edge (h above the ground), w wide */
export function kerbLine(c: Part[], O: P2, pts: P2[], h = 0.14, w = 0.22, col = '#b9b4aa') {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
    if (Math.hypot(bx - ax, bz - az) < 0.05) continue;
    const y = Math.min(gh(ax, az), gh(bx, bz));
    c.push([run(ax - O[0], az - O[1], bx - O[0], bz - O[1], y - 0.1, y + h, w), col]);
  }
}

// ---------- posts, poles, wires, lights ----------
/** a short post with dark (or red) bands, white between (Pairs 1, 2, 5, 8, 10; ECG Pairs 9, 11, 18) */
export function stripedPost(c: Part[], O: P2, x: number, z: number, o: { h?: number; band?: string; solid?: boolean } = {}) {
  const h = o.h ?? 1.0, y = gh(x, z), X = x - O[0], Z = z - O[1], band = o.band ?? '#c8261e';
  c.push([new THREE.CylinderGeometry(0.075, 0.08, h, 8).translate(X, y + h / 2, Z), '#ecebe6']);
  for (const t of [0.22, 0.55]) c.push([new THREE.CylinderGeometry(0.081, 0.081, 0.13, 8).translate(X, y + h * t, Z), band]);
  c.push([new THREE.CylinderGeometry(0.081, 0.081, 0.07, 8).translate(X, y + h - 0.04, Z), band]);
  if (o.solid !== false) SOLIDS.add(x, z, 0.14);
}
/** a concrete utility pole with a crossarm and three insulators; returns the wire attachment points (model frame) */
export function utilityPole(c: Part[], O: P2, x: number, z: number, face: number, h = 9.5, col = '#a7a39b'): V3[] {
  const y = gh(x, z), X = x - O[0], Z = z - O[1], ux = Math.cos(face), uz = Math.sin(face);
  c.push([new THREE.CylinderGeometry(0.11, 0.17, h, 7).translate(X, y + h / 2, Z), col]);
  c.push([rod([X - ux * 1.0, y + h - 0.5, Z - uz * 1.0], [X + ux * 1.0, y + h - 0.5, Z + uz * 1.0], 0.1), '#7b746a']);
  const at: V3[] = [];
  for (const s of [-0.85, 0, 0.85]) {
    const p: V3 = [X + ux * s, y + h - 0.35 + (s === 0 ? 0.35 : 0), Z + uz * s];
    c.push([new THREE.CylinderGeometry(0.05, 0.06, 0.22, 6).translate(p[0], p[1], p[2]), '#e2ded4']);
    at.push([p[0], p[1] + 0.1, p[2]]);
  }
  SOLIDS.add(x, z, 0.22);
  return at;
}
/**
 * a pair of slim concrete uprights carrying two crossbars with insulators (the paired electrical supports, ECG Pairs 1, 6,
 * 7; Pairs 5, 9, 15): `face` the direction the crossbars run; the dark protective sleeves round their feet. Returns the
 * wire attachment points (model frame).
 */
export function hFrame(c: Part[], O: P2, x: number, z: number, face: number, h = 10, spread = 1.7): V3[] {
  const y = gh(x, z), X = x - O[0], Z = z - O[1], ux = Math.cos(face), uz = Math.sin(face);
  for (const s of [-1, 1]) {
    const px = X + ux * s * spread / 2, pz = Z + uz * s * spread / 2;
    c.push([box(px - 0.11, px + 0.11, y, y + h, pz - 0.11, pz + 0.11), '#b3afa6']);
    c.push([box(px - 0.15, px + 0.15, y, y + 1.9, pz - 0.15, pz + 0.15), '#2f2d2b']);
    SOLIDS.add(x + ux * s * spread / 2, z + uz * s * spread / 2, 0.2);
  }
  const at: V3[] = [];
  for (const [yy, reach] of [[h - 0.4, 1.4], [h - 2.0, 1.1]] as [number, number][]) {
    c.push([rod([X - ux * reach, y + yy, Z - uz * reach], [X + ux * reach, y + yy, Z + uz * reach], 0.12), '#8d887f']);
    for (const s of [-reach + 0.2, 0, reach - 0.2]) {
      c.push([new THREE.CylinderGeometry(0.05, 0.07, 0.3, 6).translate(X + ux * s, y + yy + 0.2, Z + uz * s), '#d8d4ca']);
      if (yy > h - 1) at.push([X + ux * s, y + yy + 0.35, Z + uz * s]);
    }
  }
  // a small transformer box on one, the drop wires
  c.push([box(X - 0.35, X + 0.35, y + h - 4.2, y + h - 3.2, Z - 0.35, Z + 0.35), '#6f7376']);
  return at;
}
/** a wire span between two attachment points (model frame), sagging `sag` metres at the middle */
export function wire(c: Part[], a: V3, b: V3, sag = 0.5) {
  const n = 8;
  let prev = a;
  for (let i = 1; i <= n; i++) {
    const t = i / n, s = 4 * t * (1 - t) * sag;
    const p: V3 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - s, a[2] + (b[2] - a[2]) * t];
    c.push([rod(prev, p, 0.035), '#262626']);
    prev = p;
  }
}
/** spans between consecutive supports: each attachment of one to the matching attachment of the next */
export function spans(c: Part[], sets: V3[][], sag = 0.5) {
  for (let i = 0; i < sets.length - 1; i++) {
    const a = sets[i], b = sets[i + 1], n = Math.min(a.length, b.length);
    if (Math.hypot(a[0][0] - b[0][0], a[0][2] - b[0][2]) > 70) continue;
    for (let j = 0; j < n; j++) wire(c, a[j], b[j], sag);
  }
}
/**
 * a slender decorative street light: a tapering grey pole, at the top one or two (branching) arms curving out over the
 * road(s), a flat lantern on each; `face` the direction of the first arm. Optional bands round the pole (the red, gold
 * and green rings of the ECG stretch, ECG Pairs 3, 4) and a small board on it (Pairs 11, 13).
 */
export function streetLight(c: Part[], O: P2, x: number, z: number, face: number, o: { twin?: boolean; h?: number; bands?: boolean; board?: string } = {}) {
  const h = o.h ?? 10, y = gh(x, z), X = x - O[0], Z = z - O[1];
  c.push([new THREE.CylinderGeometry(0.07, 0.14, h, 8).translate(X, y + h / 2, Z), '#a3a8ab']);
  c.push([new THREE.CylinderGeometry(0.2, 0.24, 0.5, 8).translate(X, y + 0.25, Z), '#8d9295']);
  const arms = o.twin ? [face, face + Math.PI] : [face];
  for (const a of arms) {
    const ux = Math.cos(a), uz = Math.sin(a);
    const p0: V3 = [X, y + h - 0.6, Z], p1: V3 = [X + ux * 0.7, y + h + 0.5, Z + uz * 0.7], p2: V3 = [X + ux * 1.7, y + h + 0.95, Z + uz * 1.7], p3: V3 = [X + ux * 2.6, y + h + 0.85, Z + uz * 2.6];
    c.push([rod(p0, p1, 0.07), '#a3a8ab'], [rod(p1, p2, 0.06), '#a3a8ab'], [rod(p2, p3, 0.05), '#a3a8ab']);
    c.push([new THREE.BoxGeometry(0.9, 0.12, 0.32).rotateY(-a).translate(p3[0] + ux * 0.35, p3[1] - 0.05, p3[2] + uz * 0.35), '#d6d3cb']);
  }
  if (o.bands) {
    const cols = ['#c8261e', '#e2b616', '#2e7d3a'];
    for (let i = 0; i < 9; i++) c.push([new THREE.CylinderGeometry(0.115 - i * 0.004, 0.115 - i * 0.004, 0.32, 8).translate(X, y + 3.2 + i * 0.32, Z), cols[i % 3]]);
  }
  if (o.board) {
    const ux = Math.cos(face + Math.PI / 2), uz = Math.sin(face + Math.PI / 2);
    c.push([new THREE.BoxGeometry(0.06, 1.7, 0.5).rotateY(-(face + Math.PI / 2)).translate(X + ux * 0.3 + Math.cos(face) * 0.1, y + 3.6, Z + uz * 0.3 + Math.sin(face) * 0.1), o.board]);
    c.push([rod([X, y + 2.9, Z], [X + ux * 0.3, y + 2.9, Z + uz * 0.3], 0.04), '#7d8285'], [rod([X, y + 4.3, Z], [X + ux * 0.3, y + 4.3, Z + uz * 0.3], 0.04), '#7d8285']);
  }
  SOLIDS.add(x, z, 0.2);
}
/** the low weathered concrete divider between the carriageways along a run of world points (Pair 14; ECG Pairs 2, 6-8):
 *  a broad foot, the sloping faces, the narrow top, a dark joint every 6 m */
export function divider(c: Part[], O: P2, pts: P2[], h = 0.85) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], len = Math.hypot(bx - ax, bz - az);
    if (len < 0.1) continue;
    const ux = (bx - ax) / len, uz = (bz - az) / len, n = Math.max(1, Math.round(len / 6));
    for (let j = 0; j < n; j++) {
      const s0 = (len * j) / n + 0.03, s1 = (len * (j + 1)) / n - 0.03;
      const p = [ax + ux * s0 - O[0], az + uz * s0 - O[1]], q = [ax + ux * s1 - O[0], az + uz * s1 - O[1]];
      const y = Math.min(gh(ax + ux * s0, az + uz * s0), gh(ax + ux * s1, az + uz * s1));
      const tone = ['#b8b2a6', '#ada79b', '#bfb9ad', '#a59f93'][(j + i) % 4];
      c.push([run(p[0], p[1], q[0], q[1], y - 0.1, y + 0.28, 0.62), tone]);
      c.push([run(p[0], p[1], q[0], q[1], y + 0.28, y + h * 0.7, 0.42), tone]);
      c.push([run(p[0], p[1], q[0], q[1], y + h * 0.7, y + h, 0.26), tone]);
      // the dark stain along its foot
      c.push([run(p[0], p[1], q[0], q[1], y - 0.02, y + 0.14, 0.64), '#6f685d']);
    }
    wallSolids(ax, az, bx, bz, 0.3);
  }
}

// ---------- roadside stalls ----------
export type StallKind = 'umbrella' | 'canopy' | 'kiosk' | 'greenKiosk' | 'posterShop' | 'blueCanopy' | 'darkKiosk' | 'shack';
/**
 * one roadside stall, its front facing `face` (the direction out of its front, toward the road): an umbrella over a
 * table, an open stall under a sheet canopy on slim legs, an enclosed kiosk (painted, the dark green one with the red
 * trim, the light shop with posters, the larger dark kiosk), a blue fabric canopy over a table, a rough sheet shack.
 * w along the front, d deep, h tall; `seed` varies the colours.
 */
export function stall(c: Part[], O: P2, kind: StallKind, x: number, z: number, face: number, w: number, d: number, h: number, seed: number, posters?: THREE.Material, quads?: (m: THREE.Material, g: THREE.BufferGeometry) => void) {
  const y = gh(x, z), X = x - O[0], Z = z - O[1];
  const fx = Math.cos(face), fz = Math.sin(face), sx = -fz, sz = fx; // front normal, side direction
  // a box in the stall's frame: s across the front (-w/2..w/2), t from back (-d/2) to front (d/2), y0..y1
  const B = (s0: number, s1: number, t0: number, t1: number, y0: number, y1: number) => {
    const g = new THREE.BoxGeometry(s1 - s0, y1 - y0, t1 - t0);
    g.rotateY(-Math.atan2(fz, fx) + Math.PI / 2);
    const cs = (s0 + s1) / 2, ct = (t0 + t1) / 2;
    return g.translate(X + sx * cs + fx * ct, y + (y0 + y1) / 2, Z + sz * cs + fz * ct);
  };
  const pick = <T,>(a: T[]) => a[Math.abs(Math.floor(seed * 7.3)) % a.length];
  if (kind === 'umbrella') {
    const col = pick(['#e9e4d8', '#d9443a', '#2b6cc4', '#e8c23a', '#d8d2c2']);
    c.push([new THREE.CylinderGeometry(0.03, 0.03, h, 6).translate(X, y + h / 2, Z), '#5c5e60']);
    c.push([new THREE.ConeGeometry(w / 2 + 0.2, 0.55, 10).translate(X, y + h - 0.1, Z), col]);
    c.push([B(-w * 0.32, w * 0.32, -d * 0.25, d * 0.25, 0.72, 0.8), '#8a6a48'], [B(-w * 0.3, -w * 0.26, -0.05, 0.05, 0, 0.72), '#6f5a44'], [B(w * 0.26, w * 0.3, -0.05, 0.05, 0, 0.72), '#6f5a44']);
    c.push([B(-w * 0.28, w * 0.28, -d * 0.2, d * 0.2, 0.8, 1.05), pick(['#c7a14a', '#5e8a3a', '#b8432f', '#e0d8c8'])]);
    SOLIDS.add(x, z, Math.min(w, d) * 0.35);
  } else if (kind === 'canopy' || kind === 'blueCanopy') {
    const col = kind === 'blueCanopy' ? pick(['#1f4fb5', '#2559c4', '#1c46a0']) : pick(['#e3b62c', '#c9372b', '#2f6db5', '#e8e2d2', '#4f8a3a']);
    for (const s of [-w / 2 + 0.1, w / 2 - 0.1]) for (const t of [-d / 2 + 0.1, d / 2 - 0.1]) c.push([B(s - 0.03, s + 0.03, t - 0.03, t + 0.03, 0, h - 0.1 + (t > 0 ? 0 : 0.25)), '#6c6f71']);
    if (kind === 'blueCanopy') {
      // a pitched fabric top
      const g = new THREE.ConeGeometry(Math.hypot(w, d) / 2, 0.7, 4, 1).rotateY(Math.PI / 4).scale(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414);
      g.rotateY(-Math.atan2(fz, fx) + Math.PI / 2);
      c.push([g.translate(X, y + h + 0.25, Z), col]);
      c.push([B(-w / 2, w / 2, d / 2 - 0.03, d / 2, h - 0.35, h - 0.05), col]);
    } else c.push([B(-w / 2 - 0.15, w / 2 + 0.15, -d / 2 - 0.1, d / 2 + 0.3, h, h + 0.08), col]);
    c.push([B(-w * 0.45, w * 0.45, d * 0.05, d * 0.4, 0, 0.85), pick(['#8a6a48', '#9d7b52', '#6e5a46'])]);
    c.push([B(-w * 0.42, w * 0.42, d * 0.08, d * 0.38, 0.85, 1.05), pick(['#d4b44a', '#7aa04a', '#c25a3a', '#e6dfcf', '#d98a2b'])]);
    SOLIDS.add(x + fx * d * 0.2, z + fz * d * 0.2, Math.min(w, d) * 0.3);
  } else {
    const wall = kind === 'greenKiosk' ? '#2f5a3a' : kind === 'posterShop' ? '#e3ddcf' : kind === 'darkKiosk' ? '#3a3330' : kind === 'shack' ? pick(['#8a7a68', '#6f6a62', '#9b8a72']) : pick(['#d8cfb8', '#c9d6dc', '#e2c7a0', '#cfd8c4', '#e6e0d2']);
    c.push([B(-w / 2, w / 2, -d / 2, d / 2, 0, h), wall]);
    // the open front: a dark serving hatch over a counter
    c.push([B(-w / 2 + 0.25, w / 2 - 0.25, d / 2, d / 2 + 0.02, 1.0, h - 0.45), '#24221f'], [B(-w / 2 + 0.2, w / 2 - 0.2, d / 2, d / 2 + 0.35, 0.95, 1.02), '#8a6a48']);
    const roof = kind === 'greenKiosk' ? '#b8332a' : kind === 'darkKiosk' ? '#5a4d44' : pick(['#8f969a', '#a0703f', '#7c8287', '#b2402f']);
    c.push([B(-w / 2 - 0.2, w / 2 + 0.2, -d / 2 - 0.2, d / 2 + 0.55, h, h + 0.08), roof]);
    if (kind === 'greenKiosk') c.push([B(-w / 2 - 0.01, w / 2 + 0.01, d / 2, d / 2 + 0.03, h - 0.35, h - 0.1), '#c8332a'], [B(-w / 2, w / 2, -d / 2, d / 2 + 0.02, 0, 0.3), '#c8332a']);
    if (kind === 'posterShop' && posters && quads) {
      // the poster-covered panels on its front either side of the hatch
      const pg = new THREE.PlaneGeometry(w - 0.3, h - 0.6);
      pg.rotateY(-Math.atan2(fz, fx) + Math.PI / 2);
      quads(posters, pg.translate(X + fx * (d / 2 + 0.05), y + (h - 0.6) / 2 + 0.3, Z + fz * (d / 2 + 0.05)));
    }
    if (kind === 'shack') c.push([B(-w / 2 + 0.3, w / 2 - 0.3, d / 2, d / 2 + 0.02, 0.2, h - 0.2), '#5a5249']);
    const r = Math.max(w, d) / 2;
    wallSolids(x - sx * (w / 2 - 0.3), z - sz * (w / 2 - 0.3), x + sx * (w / 2 - 0.3), z + sz * (w / 2 - 0.3), Math.min(r, d / 2));
  }
}

/** a board on posts: two posts, a frame, its face (a material picture) turned to `face`, bottom at y0 */
export function postBoard(c: Part[], O: P2, x: number, z: number, face: number, w: number, hb: number, y0: number, faceAdd: (g: THREE.BufferGeometry) => void, posts = 2) {
  const y = gh(x, z), X = x - O[0], Z = z - O[1], fx = Math.cos(face), fz = Math.sin(face), sx = -fz, sz = fx;
  const offs = posts === 1 ? [0] : [-w / 2 + 0.25, w / 2 - 0.25];
  for (const s of offs) { c.push([new THREE.CylinderGeometry(0.07, 0.08, y0 + hb, 7).translate(X + sx * s, y + (y0 + hb) / 2, Z + sz * s), '#6b6f72']); SOLIDS.add(x + sx * s, z + sz * s, 0.15); }
  const back = new THREE.BoxGeometry(w + 0.1, hb + 0.1, 0.1).rotateY(-Math.atan2(fz, fx) + Math.PI / 2).translate(X + fx * 0.05, y + y0 + hb / 2, Z + fz * 0.05);
  c.push([back, '#4a4d50']);
  const g = new THREE.PlaneGeometry(w, hb).rotateY(-Math.atan2(fz, fx) + Math.PI / 2).translate(X + fx * 0.11, y + y0 + hb / 2, Z + fz * 0.11);
  faceAdd(g);
}

/** the parts whose geometry is finite (a point off a mapped line's ends comes back NaN, and one NaN vertex would leave
 *  the whole merged mesh's bounds NaN, so that it is culled): the rest are dropped, counted in the console in dev */
export function sane(parts: Part[], where = '') {
  const ok = parts.filter(([g]) => { const a = g.attributes.position.array; for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) return false; return true; });
  if (ok.length < parts.length && import.meta.env?.DEV) console.warn(`roadkit: ${parts.length - ok.length} parts with NaN dropped ${where}`);
  return ok;
}
