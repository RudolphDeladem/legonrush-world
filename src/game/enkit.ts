// Shared pieces for the main entrance brief (entrance.ts holds its numbers): the one-storey white wings on a red base
// under tiled hipped roofs that line the gate precinct and La Road, dark windows and doors set into their walls, AC
// condensers, blue chain bollards, brick and earth ground drapes, flagpoles, fan palms, and the per-site finishing
// (merged meshes in the shared weathered material). Everything is in a site's model frame (world minus its origin).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { box, merge, type Part } from './modelkit';
import type { Kit } from './blocks';
import { hipRoof } from './waccbip';
import { SOLIDS } from './solids';
import { concrete } from './concrete';
import { groundHeight } from './relief';

export type R4 = [number, number, number, number];
export const gh = groundHeight;
export const hash = (x: number, z: number) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
export const vnoise = (x: number, z: number) => {
  const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

export const WALL = '#f1eee6', RED_BASE = '#9b3b2b', TILE = '#b65a3c', FASCIA = '#4a3328', SOFF = '#ddd6c8';

const tex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat = false) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};
const mats: Record<string, THREE.Material> = {};
/** a window of dark glass louvres in a white frame, a mullion */
export const winMat = () => (mats.win ??= new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.1, side: THREE.DoubleSide, map: tex(64, 64, (g) => {
  g.fillStyle = '#e9e6de'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#2c3236'; g.fillRect(5, 5, 54, 54);
  for (let y = 7; y < 58; y += 6) { g.fillStyle = '#4a545a'; g.fillRect(6, y, 52, 3); g.fillStyle = '#1c2023'; g.fillRect(6, y + 3, 52, 2); }
  g.fillStyle = '#e9e6de'; g.fillRect(30, 5, 4, 54);
}) }));
/** a dark door (timber or steel), a grille over its top */
export const doorMat = () => (mats.door ??= new THREE.MeshStandardMaterial({ roughness: 0.7, side: THREE.DoubleSide, map: tex(64, 128, (g) => {
  g.fillStyle = '#e9e6de'; g.fillRect(0, 0, 64, 128);
  g.fillStyle = '#3b2b22'; g.fillRect(5, 5, 54, 123);
  g.fillStyle = '#2a1f19'; g.fillRect(9, 34, 21, 90); g.fillRect(34, 34, 21, 90);
  g.fillStyle = '#121212'; for (let x = 8; x < 58; x += 6) g.fillRect(x, 8, 2, 22);
}) }));
/** a dark grille (transoms, recesses behind a colonnade) */
export const grilleMat = () => (mats.grille ??= new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide, map: tex(64, 64, (g) => {
  g.fillStyle = '#16191b'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#3a3f42'; for (let x = 0; x < 64; x += 8) g.fillRect(x, 0, 2, 64); for (let y = 0; y < 64; y += 8) g.fillRect(0, y, 64, 2);
}, true) }));
/** water in a basin */
export const waterMat = () => (mats.water ??= new THREE.MeshStandardMaterial({ color: '#5d8794', roughness: 0.08, metalness: 0.25, transparent: true, opacity: 0.88 }));
/** spray of a jet */
export const sprayMat = () => (mats.spray ??= new THREE.MeshStandardMaterial({ color: '#eef4f6', roughness: 0.3, transparent: true, opacity: 0.55, depthWrite: false }));
/** the trees' and shrubs' foliage (vertex colours) */
export const leafMat = () => (mats.leaf ??= new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide }));

/** planes merged keeping their texture coordinates */
export const mergeUV = (gs: THREE.BufferGeometry[]) => mergeGeometries(gs.map((g) => (g.index ? g.toNonIndexed() : g)));

/** the parts of one site, gathered and merged at the end */
export class Bag {
  c: Part[] = []; leaf: Part[] = []; win: THREE.BufferGeometry[] = []; door: THREE.BufferGeometry[] = []; grille: THREE.BufferGeometry[] = [];
  water: THREE.BufferGeometry[] = []; spray: THREE.BufferGeometry[] = [];
  constructor(public O: [number, number]) {}
  /** a box from world coordinates */
  B(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) { return box(x0 - this.O[0], x1 - this.O[0], y0, y1, z0 - this.O[1], z1 - this.O[1]); }
  /** a vertical plane on a face: along x (facing ±z) or along z (facing ±x); a: centre along, w wide, y0..y1 */
  plane(alongX: boolean, at: number, out: number, a: number, w: number, y0: number, y1: number) {
    const g = new THREE.PlaneGeometry(w, y1 - y0);
    if (alongX) { if (out < 0) g.rotateY(Math.PI); g.translate(a - this.O[0], (y0 + y1) / 2, at - this.O[1]); }
    else { g.rotateY(out > 0 ? Math.PI / 2 : -Math.PI / 2); g.translate(at - this.O[0], (y0 + y1) / 2, a - this.O[1]); }
    return g;
  }
  finish(k: Kit, strength = 0.3) {
    const add = (g: THREE.BufferGeometry | null, m: THREE.Material, shadow = true, collide = true) => { if (!g) return; const me = new THREE.Mesh(g, m); me.castShadow = shadow; me.receiveShadow = true; if (!collide) me.userData.noCollide = true; k.meshes.push(me); };
    if (this.c.length) add(merge(this.c), concrete(strength));
    // (foliage and long grass never stop the bike: trunks have their own round solids)
    if (this.leaf.length) add(merge(this.leaf), leafMat(), true, false);
    if (this.win.length) add(mergeUV(this.win), winMat(), false);
    if (this.door.length) add(mergeUV(this.door), doorMat(), false);
    if (this.grille.length) add(mergeUV(this.grille), grilleMat(), false);
    if (this.water.length) add(mergeUV(this.water), waterMat(), false);
    if (this.spray.length) add(mergeUV(this.spray), sprayMat(), false);
  }
}

/** a face of a rectangle: the wall's plane (z for x-running faces), which way out, its span */
export interface Face { alongX: boolean; at: number; out: 1 | -1; a0: number; a1: number }
export const facesOf = ([x0, x1, z0, z1]: R4): Record<'z0' | 'z1' | 'x0' | 'x1', Face> => ({
  z0: { alongX: true, at: z0, out: -1, a0: x0, a1: x1 }, z1: { alongX: true, at: z1, out: 1, a0: x0, a1: x1 },
  x0: { alongX: false, at: x0, out: -1, a0: z0, a1: z1 }, x1: { alongX: false, at: x1, out: 1, a0: z0, a1: z1 },
});
/** a box standing out from a face: along a0..a1, d0..d1 out from the wall, y0..y1 */
export const onFace = (b: Bag, F: Face, a0: number, a1: number, y0: number, y1: number, d0: number, d1: number) => {
  const p = F.at + F.out * d0, q = F.at + F.out * d1, lo = Math.min(p, q), hi = Math.max(p, q);
  return F.alongX ? b.B(a0, a1, y0, y1, lo, hi) : b.B(lo, hi, y0, y1, a0, a1);
};
/** a point d out from a face at a */
export const facePt = (F: Face, a: number, d: number): [number, number] => (F.alongX ? [a, F.at + F.out * d] : [F.at + F.out * d, a]);

/** collision along a wall: a row of round solids */
export function wallSolids(x0: number, z0: number, x1: number, z1: number, r = 0.45) {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / (r * 1.4)));
  for (let i = 0; i <= n; i++) SOLIDS.add(x0 + ((x1 - x0) * i) / n, z0 + ((z1 - z0) * i) / n, r);
}

/** openings along a face, by letters: W window, w small high window, D door, A window with an AC unit under it, - blank */
export function openings(b: Bag, F: Face, pattern: string, y: number, o: { winH?: number; sill?: number; w?: number } = {}) {
  const n = pattern.length, step = (F.a1 - F.a0) / n, wh = o.winH ?? 1.3, sill = o.sill ?? 1.05, ww = o.w ?? Math.min(1.5, step * 0.6);
  for (let i = 0; i < n; i++) {
    const a = F.a0 + step * (i + 0.5), ch = pattern[i];
    if (ch === '-') continue;
    if (ch === 'D') {
      b.door.push(b.plane(F.alongX, F.at + F.out * 0.04, F.out, a, 1.05, y, y + 2.15));
      b.c.push([onFace(b, F, a - 0.62, a + 0.62, y + 2.15, y + 2.32, 0, 0.12), '#e6e2d8']);
      continue;
    }
    const small = ch === 'w', h = small ? 0.55 : wh, s = small ? 2.0 : sill, W = small ? Math.min(0.9, ww) : ww;
    b.win.push(b.plane(F.alongX, F.at + F.out * 0.04, F.out, a, W, y + s, y + s + h));
    // a sill standing out, a shallow head
    b.c.push([onFace(b, F, a - W / 2 - 0.08, a + W / 2 + 0.08, y + s - 0.08, y + s, 0, 0.14), '#e2ddd2']);
    b.c.push([onFace(b, F, a - W / 2 - 0.05, a + W / 2 + 0.05, y + s + h, y + s + h + 0.1, 0, 0.08), '#e2ddd2']);
    if (ch === 'A') {
      const ax = a + (hash(a, F.at) > 0.5 ? 0.15 : -0.15);
      b.c.push([onFace(b, F, ax - 0.42, ax + 0.42, y + s + h + 0.18, y + s + h + 0.74, 0.05, 0.36), '#dcdcd6']);
      b.c.push([onFace(b, F, ax - 0.3, ax + 0.3, y + s + h + 0.26, y + s + h + 0.66, 0.36, 0.37), '#4a4d50']);
    }
  }
}

/** a one-storey wing: white rendered walls on a red base band, its openings by face (openings() letters, one per bay),
 *  a hipped tiled roof with deep eaves over a pale soffit and a dark fascia; the walls stop a bike */
export function lowWing(k: Kit, b: Bag, r: R4, o: { eave?: number; pitch?: number; over?: number; base?: number; y?: number; along?: 'x' | 'z'; faces?: Partial<Record<'z0' | 'z1' | 'x0' | 'x1', string>>; roof?: string; ends?: [number, number] }) {
  const [x0, x1, z0, z1] = r, y = o.y ?? 0, e = y + (o.eave ?? 3.4), base = o.base ?? 0.85, over = o.over ?? 0.9, pitch = o.pitch ?? 0.45;
  b.c.push([b.B(x0, x1, y - 0.3, e, z0, z1), WALL]);
  b.c.push([b.B(x0 - 0.04, x1 + 0.04, y - 0.3, y + base, z0 - 0.04, z1 + 0.04), RED_BASE]);
  // run-off staining under the eaves
  for (let i = 0; i < 6; i++) {
    const f = hash(x0 + i, z0 - i), along = (x1 - x0) >= (z1 - z0);
    const p = along ? x0 + (x1 - x0) * f : z0 + (z1 - z0) * f;
    b.c.push([along ? b.B(p, p + 0.12 + f * 0.2, e - 1.1 - f, e - 0.05, z0 - 0.015, z1 + 0.015) : b.B(x0 - 0.015, x1 + 0.015, e - 1.1 - f, e - 0.05, p, p + 0.12 + f * 0.2), '#d9d4c8']);
  }
  const F = facesOf(r);
  for (const [side, pat] of Object.entries(o.faces ?? {}) as ['z0' | 'z1' | 'x0' | 'x1', string][]) openings(b, F[side], pat, y);
  const along = o.along ?? ((x1 - x0) >= (z1 - z0) ? 'x' : 'z');
  k.roof.c = new THREE.Color(o.roof ?? TILE);
  const ends = o.ends ?? [0, 0];
  hipRoof(k, (x, z) => [x - b.O[0], z - b.O[1]], x0 - over, x1 + over, z0 - over, z1 + over, e - over * pitch * 0.5, pitch, along,
    [{ gw: ends[0], tri: false }, { gw: ends[1], tri: false }], b.c, FASCIA);
  // the soffit under the overhang
  b.c.push([b.B(x0 - over, x1 + over, e - over * pitch * 0.5 - 0.06, e - over * pitch * 0.5, z0 - over, z1 + over), SOFF]);
  wallSolids(x0, z0, x1, z0); wallSolids(x1, z0, x1, z1); wallSolids(x1, z1, x0, z1); wallSolids(x0, z1, x0, z0);
}

/** short blue posts linked by sagging dark chains, from a to b */
export function chainBollards(b: Bag, a: [number, number], c: [number, number], step = 2.4) {
  const L = Math.hypot(c[0] - a[0], c[1] - a[1]), n = Math.max(1, Math.round(L / step));
  let prev: THREE.Vector3 | null = null;
  for (let i = 0; i <= n; i++) {
    const x = a[0] + ((c[0] - a[0]) * i) / n, z = a[1] + ((c[1] - a[1]) * i) / n, y = gh(x, z);
    b.c.push([new THREE.CylinderGeometry(0.06, 0.07, 0.95, 8).translate(x - b.O[0], y + 0.47, z - b.O[1]), '#2f6fb3']);
    b.c.push([new THREE.SphereGeometry(0.075, 8, 5).translate(x - b.O[0], y + 0.95, z - b.O[1]), '#2a62a0']);
    const top = new THREE.Vector3(x - b.O[0], y + 0.82, z - b.O[1]);
    if (prev) {
      // the chain: a few straight links hanging in a curve
      const m = 6;
      for (let j = 0; j < m; j++) {
        const t0 = j / m, t1 = (j + 1) / m, sag = (t: number) => 0.32 * 4 * t * (1 - t);
        const p = prev.clone().lerp(top, t0); p.y -= sag(t0);
        const q = prev.clone().lerp(top, t1); q.y -= sag(t1);
        const d = q.clone().sub(p);
        b.c.push([new THREE.BoxGeometry(0.03, 0.03, d.length()).lookAt(d).translate((p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2), '#232323']);
      }
    }
    prev = top;
    SOLIDS.add(x, z, 0.12);
  }
}

/** a flagpole with its flag (stripes of the given colours, horizontal or vertical) */
export function flagpole(b: Bag, x: number, z: number, h: number, cols: string[], vertical = false, yaw = 0) {
  const y = gh(x, z), X = x - b.O[0], Z = z - b.O[1];
  b.c.push([new THREE.CylinderGeometry(0.045, 0.07, h, 8).translate(X, y + h / 2, Z), '#d9dcdf']);
  b.c.push([new THREE.SphereGeometry(0.08, 8, 5).translate(X, y + h + 0.05, Z), '#c9a54a']);
  b.c.push([new THREE.CylinderGeometry(0.22, 0.26, 0.4, 10).translate(X, y + 0.2, Z), '#cfcac0']);
  const fw = 1.7, fh = 1.1, n = cols.length;
  for (let i = 0; i < n; i++) {
    const g = vertical ? new THREE.BoxGeometry(fw / n, fh, 0.02).translate(-fw / 2 + (fw / n) * (i + 0.5), 0, 0) : new THREE.BoxGeometry(fw, fh / n, 0.02).translate(0, fh / 2 - (fh / n) * (i + 0.5), 0);
    // a little ripple: shear the flag along its length
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let j = 0; j < p.count; j++) p.setZ(j, p.getZ(j) + Math.sin((p.getX(j) + fw / 2) * 3.2) * 0.08);
    b.c.push([g.translate(fw / 2 + 0.06, 0, 0).rotateY(yaw).translate(X, y + h - fh / 2 - 0.1, Z), cols[i]]);
  }
  SOLIDS.add(x, z, 0.15);
}

/** a fan palm (the tall Washingtonia-like palms of the plaza and the gate): a tall straight grey trunk, a skirt of dead
 *  fronds under a round crown of stiff green fans */
export function fanPalm(b: Bag, x: number, z: number, h: number, seed: number) {
  const y = gh(x, z), X = x - b.O[0], Z = z - b.O[1], r = (i: number) => hash(seed + i * 1.37, seed * 0.71 - i);
  const lean = (r(1) - 0.5) * 0.4, lz = (r(2) - 0.5) * 0.4;
  b.c.push([new THREE.CylinderGeometry(0.2, 0.3, h, 9).translate(0, h / 2, 0).applyMatrix4(new THREE.Matrix4().makeShear(0, 0, lean / h, 0, lz / h, 0)).translate(X, y, Z), '#8d8478']);
  const top = new THREE.Vector3(X + lean, y + h, Z + lz);
  b.leaf.push([new THREE.CylinderGeometry(0.55, 0.3, 1.4, 9).translate(top.x, top.y - 0.6, top.z), '#7c6a4c']);
  const nf = 18;
  for (let i = 0; i < nf; i++) {
    const az = (i / nf) * Math.PI * 2 + r(10 + i) * 0.3, up = -0.2 + r(30 + i) * 0.9, len = 1.9 + r(50 + i) * 0.6;
    const dir = new THREE.Vector3(Math.cos(az) * Math.cos(up), Math.sin(up), Math.sin(az) * Math.cos(up));
    const fan = new THREE.CircleGeometry(len * 0.62, 7, -0.85, 1.7).rotateZ(-Math.PI / 2).rotateX(-Math.PI / 2 + 0.25);
    fan.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir));
    b.leaf.push([fan.translate(top.x + dir.x * len * 0.45, top.y + 0.2 + dir.y * len * 0.45, top.z + dir.z * len * 0.45), ['#56783a', '#4a6c33', '#62833f'][i % 3]]);
  }
  SOLIDS.add(x, z, 0.3);
}
