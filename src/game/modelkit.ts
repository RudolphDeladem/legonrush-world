// Shared pieces for buildings modelled from reference photos (halls.ts, hostels.ts): canvas
// textures, textured facade runs, merged vertex-coloured parts, tiled roof slopes and signs.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export function canvas(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}
let seed = 9137;
export const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
export const speckle = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, n: number, cols: string[]) => {
  for (let i = 0; i < n; i++) { g.fillStyle = cols[(rnd() * cols.length) | 0]; g.fillRect(x + rnd() * w, y + rnd() * h, 1 + rnd(), 1 + rnd()); }
};

/** a building's name on a sign board: white letters on blue unless colours are given */
export function signTexture(text: string, [bg, fg]: [string, string] = ['#1f4f9a', '#ffffff']) {
  const c = document.createElement('canvas');
  const g = c.getContext('2d')!;
  const font = '700 44px Sora, system-ui, sans-serif';
  g.font = font;
  c.width = Math.ceil(g.measureText(text).width) + 48;
  c.height = 64;
  g.fillStyle = bg;
  g.fillRect(0, 0, c.width, 64);
  g.font = font;
  g.fillStyle = fg;
  g.textBaseline = 'middle';
  g.fillText(text, 24, 34);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return { tex: t, aspect: c.width / 64 };
}

/** textured facade quads: uv into the facade atlas, uv1 counts bays and storeys for the night lights */
export class Facade {
  pos: number[] = []; uv: number[] = []; uv1: number[] = []; idx: number[] = [];
  bays = 0;
  quad(x0: number, z0: number, x1: number, z1: number, y0: number, y1: number, u1: number, v0: number, v1: number, l0: number, l1: number, s: number) {
    const b = this.pos.length / 3;
    this.pos.push(x0, y0, z0, x1, y0, z1, x1, y1, z1, x0, y1, z0);
    this.uv.push(0, v0, u1, v0, u1, v1, 0, v1);
    this.uv1.push(l0, s, l1, s, l1, s + 1, l0, s + 1);
    this.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('uv1', new THREE.Float32BufferAttribute(this.uv1, 2));
    g.setIndex(this.idx);
    g.computeVertexNormals();
    return g;
  }
}

/** coloured parts merged into one geometry (position, normal, color) */
export type Part = [THREE.BufferGeometry, string];
export function merge(parts: Part[]) {
  const geos = parts.map(([g, c]) => {
    const n = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal') n.deleteAttribute(k);
    if (!n.attributes.normal) n.computeVertexNormals();
    const col = new THREE.Color(c);
    const arr = new Float32Array(n.attributes.position.count * 3);
    for (let i = 0; i < arr.length; i += 3) { arr[i] = col.r; arr[i + 1] = col.g; arr[i + 2] = col.b; }
    n.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    return n;
  });
  return mergeGeometries(geos);
}
export const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
/** a flat polygon in a vertical plane facing +z at depth z */
export const flat = (pts: [number, number][], z: number) => {
  const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  return new THREE.ShapeGeometry(s).translate(0, 0, z);
};

export const WHITE = '#f7f4ec', TRIM = '#fbf9f3', SOFFIT = '#d8cfbf', PLINTH = '#8c8174', DARK = '#2a2d33', TANK = '#1b1c1f', PAVE = '#d2ccc0', BRONZE = '#5e4a38';

/** Roof slopes: quads from an eave edge (a, b) up to a ridge edge (c, d), tiles laid by metres. */
export class Roof {
  pos: number[] = []; uv: number[] = []; col: number[] = []; idx: number[] = [];
  /** colour of the slopes added next (a site can switch it per block) */
  constructor(public c: THREE.Color) {}
  quad(a: number[], b: number[], c: number[], d: number[]) {
    const ex = b[0] - a[0], ez = b[2] - a[2], el = Math.hypot(ex, ez) || 1;
    const ux = ex / el, uz = ez / el;
    const base = this.pos.length / 3;
    for (const p of [a, b, c, d]) {
      const dx = p[0] - a[0], dz = p[2] - a[2];
      const along = dx * ux + dz * uz, across = Math.abs(-dx * uz + dz * ux), up = p[1] - a[1];
      this.pos.push(p[0], p[1], p[2]);
      this.uv.push(along / 2, Math.hypot(across, up) / 2);
      this.col.push(this.c.r, this.c.g, this.c.b);
    }
    this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setIndex(this.idx);
    g.computeVertexNormals();
    return g;
  }
}

export /** reverses triangle winding after a mirror so faces still point outward (applyMatrix4 mirrors the normals) */
function flipWinding(g: THREE.BufferGeometry) {
  if (!g.index) return;
  const a = g.index.array as Uint16Array | Uint32Array;
  for (let i = 0; i < a.length; i += 3) { const t = a[i + 1]; a[i + 1] = a[i + 2]; a[i + 2] = t; }
  g.index.needsUpdate = true;
}

/** a flat triangle between three points, seen from both sides (gable ends) */
export function tri2(a: [number, number, number], b: [number, number, number], c: [number, number, number]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...b], 3));
  g.computeVertexNormals();
  return g;
}
