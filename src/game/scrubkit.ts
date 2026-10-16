// Ground cover and low vegetation over large open areas read from the owner's aerials (the Great Hall's landscape,
// ghlandscape.ts; the tennis complex's tree belt, tennis.ts):
// - coverOverlay: one painted picture laid over the grass, following the ground: the aerial's patches of soil, dry cover
//   and green cover as a texture (a metre or so a pixel), the earth tracks stroked into it, sealed roads and buildings
//   left clear; cut into tiles so the camera draws only what is in view;
// - Crowns: shrubs and short-stemmed trees as instanced lumpy crowns (the game's own canopy style: clustered faceted
//   blobs), a fuller crown near the camera and a single blob further off (LOD), per tile, with round solids at trunks.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { groundHeight } from './relief';
import { groundShade, nearCut } from './shading';
import { SOLIDS } from './solids';

export type P2 = [number, number];
export type Box = [number, number, number, number];
export type RGBA = [number, number, number, number];

export const hash2 = (x: number, z: number) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
export const vnoise2 = (x: number, z: number) => {
  const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

// ---------- the painted ground ----------
export interface Overlay {
  box: Box;
  /** metres a pixel */
  mpp: number;
  /** the ground grid's cell (m) and its tiles (m) */
  cell: number;
  tile: number;
  /** the colour (0-255) and opacity (0-1) of the ground at a point, null where the overlay leaves the grass alone */
  color: (x: number, z: number) => RGBA | null;
  /** earth tracks stroked over the patches: centre lines and half widths */
  tracks?: { pts: P2[]; half: number }[];
  /** cleared after the tracks: sealed roads (centre lines, half widths) and outlines (buildings, floors) */
  clearLines?: { pts: P2[]; half: number }[];
  clearRings?: P2[][];
  /** the work area's outlines: the tracks are clipped to them */
  clip?: P2[][];
  /** whether the ground grid has a cell centred at x, z */
  cellIn: (x: number, z: number) => boolean;
  lift?: number;
  /** take a cell where any of its corners is in (the painted alpha then draws the true edge, not the cells' notches;
   *  the colour must be null outside the cover) */
  pixelEdge?: boolean;
}

let DETAIL: THREE.Texture | null = null;
/** grey grain that tiles: specks, clods and short blades */
function detailTexture() {
  if (DETAIL) return DETAIL;
  const S = 256, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d')!, img = g.createImageData(S, S), d = img.data;
  for (let i = 0; i < S * S; i++) {
    const x = i % S, y = Math.floor(i / S), v = 0.55 + (hash2(x, y) - 0.5) * 0.35 + (hash2(x >> 2, y >> 2) - 0.5) * 0.25;
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = Math.max(0, Math.min(255, v * 255)); d[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  for (let k = 0; k < 900; k++) {
    const x = hash2(k, 1.7) * S, y = hash2(3.1, k) * S, a = hash2(k, 4) * 6.28;
    g.strokeStyle = hash2(k, 5) < 0.5 ? 'rgba(40,40,40,0.35)' : 'rgba(230,230,230,0.3)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 5, y + Math.sin(a) * 5); g.stroke();
  }
  DETAIL = new THREE.CanvasTexture(cv);
  DETAIL.wrapS = DETAIL.wrapT = THREE.RepeatWrapping; DETAIL.colorSpace = THREE.NoColorSpace; DETAIL.anisotropy = 8;
  return DETAIL;
}

export function coverOverlay(o: Overlay): THREE.Mesh[] {
  ((globalThis as any).__DRAPES ??= []).push({ kind: 'overlay', box: o.box, at: (new Error().stack ?? '').split('\n')[2] }); // TEMPINV
  const [x0, x1, z0, z1] = o.box, W = Math.ceil((x1 - x0) / o.mpp), H = Math.ceil((z1 - z0) / o.mpp);
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  const img = g.createImageData(W, H), d = img.data;
  for (let j = 0; j < H; j++) {
    const z = z0 + (j + 0.5) * o.mpp;
    for (let i = 0; i < W; i++) {
      const c = o.color(x0 + (i + 0.5) * o.mpp, z);
      if (!c) continue;
      const k = (j * W + i) * 4;
      d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = Math.round(c[3] * 255);
    }
  }
  g.putImageData(img, 0, 0);
  const P = (p: P2) => [(p[0] - x0) / o.mpp, (p[1] - z0) / o.mpp] as const;
  const path = (pts: P2[]) => { g.beginPath(); pts.forEach((p, i) => { const [u, v] = P(p); if (i) g.lineTo(u, v); else g.moveTo(u, v); }); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (o.tracks?.length) {
    g.save();
    if (o.clip) {
      g.beginPath();
      for (const r of o.clip) r.forEach((p, i) => { const [u, v] = P(p); if (i) g.lineTo(u, v); else g.moveTo(u, v); });
      g.clip();
    }
    // the worn verge (trampled grass, a little darker), then the compacted earth, then its lighter middle
    for (const t of o.tracks) { path(t.pts); g.strokeStyle = 'rgba(122,104,64,0.55)'; g.lineWidth = ((t.half + 0.8) * 2) / o.mpp; g.stroke(); }
    for (const t of o.tracks) { path(t.pts); g.strokeStyle = 'rgba(172,128,86,0.96)'; g.lineWidth = (t.half * 2) / o.mpp; g.stroke(); }
    for (const t of o.tracks) { path(t.pts); g.strokeStyle = 'rgba(196,156,110,0.55)'; g.lineWidth = Math.max(1, (t.half * 0.8) / o.mpp); g.stroke(); }
    g.restore();
  }
  g.globalCompositeOperation = 'destination-out';
  for (const t of o.clearLines ?? []) { path(t.pts); g.strokeStyle = '#000'; g.lineWidth = (t.half * 2) / o.mpp; g.stroke(); }
  for (const r of o.clearRings ?? []) { path(r); g.closePath(); g.fillStyle = '#000'; g.fill(); g.lineWidth = 1.2 / o.mpp; g.strokeStyle = '#000'; g.stroke(); }
  g.globalCompositeOperation = 'source-over';
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;

  const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
  // close up, a fine grain over the painted patches (grit, clods, short grass): a small tiling noise in world space
  const det = detailTexture();
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.detail = { value: det };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vDet;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvDet = position.xz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vDet;\nuniform sampler2D detail;').replace('#include <map_fragment>', `#include <map_fragment>
      float dg = texture2D(detail, vDet / 2.7).r * 0.6 + texture2D(detail, vDet / 0.83 + 0.31).r * 0.4;
      diffuseColor.rgb *= 0.74 + 0.52 * dg;`);
  };
  mat.customProgramCacheKey = () => 'cover-overlay';
  const lift = o.lift ?? 0.04, meshes: THREE.Mesh[] = [];
  for (let tx = x0; tx < x1; tx += o.tile) for (let tz = z0; tz < z1; tz += o.tile) {
    const ex = Math.min(x1, tx + o.tile), ez = Math.min(z1, tz + o.tile);
    const nx = Math.round((ex - tx) / o.cell), nz = Math.round((ez - tz) / o.cell);
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const x = tx + ((ex - tx) * i) / nx, z = tz + ((ez - tz) * j) / nz;
      pos.push(x, groundHeight(x, z) + lift, z);
      uv.push((x - x0) / (W * o.mpp), 1 - (z - z0) / (H * o.mpp));
    }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const cx = tx + ((ex - tx) * (i + 0.5)) / nx, cz = tz + ((ez - tz) * (j + 0.5)) / nz;
      const ddx = (ex - tx) / nx / 2, ddz = (ez - tz) / nz / 2;
      if (!o.cellIn(cx, cz) && !(o.pixelEdge && (o.cellIn(cx - ddx, cz - ddz) || o.cellIn(cx + ddx, cz - ddz) || o.cellIn(cx - ddx, cz + ddz) || o.cellIn(cx + ddx, cz + ddz)))) continue;
      const a = j * (nx + 1) + i, c = a + nx + 1;
      idx.push(a, c, a + 1, a + 1, c, c + 1);
    }
    if (!idx.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.receiveShadow = true; m.renderOrder = -1; m.userData.noCollide = true; m.name = 'cover-overlay';
    meshes.push(m);
  }
  return meshes;
}

// ---------- the crowns ----------
export interface Crown {
  x: number; z: number;
  /** crown radius and height (m), the bottom of the foliage above the ground (m), the trunk's radius (0: a shrub) */
  r: number; h: number; base: number; trunk: number;
  color: string;
  seed: number;
  /** a round solid at the trunk (the bike stops at trunks, never at foliage) */
  solid?: boolean;
}
const hash3 = (a: number, b: number, c: number) => hash2(a + c * 17.13, b - c * 3.71);
/** a lumpy crown of radius 1 and height 1 standing on y 0 (faceted blobs, the game's canopy style), with a sunlit top
 *  and shaded underside baked into its vertex colour */
function crownGeometry(blobs: number, seed: number) {
  const parts: THREE.BufferGeometry[] = [new THREE.IcosahedronGeometry(0.78, 0).scale(1, 0.5, 1).translate(0, 0.5, 0)];
  for (let i = 0; i < blobs; i++) {
    const a = i * 2.39996 + seed, t = (i + 0.5) / blobs, y = 0.25 + 0.55 * (1 - t), rad = 0.5 + 0.2 * hash3(i, seed, 1);
    const rb = (blobs > 6 ? 0.34 : 0.42) + 0.14 * hash3(seed, i, 2);
    parts.push(new THREE.IcosahedronGeometry(rb, 0).scale(1, 0.62, 1).translate(Math.cos(a) * rad, y, Math.sin(a) * rad));
  }
  const g = mergeGeometries(parts.map((p) => p.toNonIndexed()))!;
  const pos = g.attributes.position, nrm = new Float32Array(pos.count * 3), col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    // the whole crown shades as one squashed dome
    let nx = pos.getX(i), ny = (pos.getY(i) - 0.35) * 2.2, nz = pos.getZ(i);
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    nrm[i * 3] = nx; nrm[i * 3 + 1] = ny; nrm[i * 3 + 2] = nz;
    const k = (0.62 + 0.38 * (ny * 0.5 + 0.5)) * (0.9 + 0.2 * hash3(pos.getX(i) * 9, pos.getY(i) * 9, pos.getZ(i) * 9));
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = k;
  }
  g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.deleteAttribute('uv');
  return g;
}
let NEAR: THREE.BufferGeometry | null = null, FAR: THREE.BufferGeometry | null = null, TRUNK: THREE.BufferGeometry | null = null;
let LEAF_MAT: THREE.MeshStandardMaterial | null = null, BARK_MAT: THREE.MeshStandardMaterial | null = null;
const geos = () => {
  NEAR ??= crownGeometry(5, 0.7);
  FAR ??= crownGeometry(0, 0);
  if (!TRUNK) {
    TRUNK = new THREE.CylinderGeometry(0.7, 1, 1, 6, 1, true).translate(0, 0.5, 0);
    const c = new Float32Array(TRUNK.attributes.position.count * 3).fill(1);
    TRUNK.setAttribute('color', new THREE.BufferAttribute(c, 3));
    TRUNK.deleteAttribute('uv');
  }
  LEAF_MAT ??= nearCut(groundShade(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }), 1.2, 0.35, 'scrub'));
  BARK_MAT ??= new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  return { near: NEAR, far: FAR, trunk: TRUNK!, leaf: LEAF_MAT, bark: BARK_MAT };
};

/** The crowns, instanced per tile: a THREE.LOD per tile (the fuller crowns and the trunks within `nearM` metres, single
 *  blobs beyond, nothing past the fog). Heights from the ground under each. */
export interface Tuft { x: number; z: number; s: number; color: string }
let TUFT: THREE.BufferGeometry | null = null;
/** a clump of five thin blades, 1 m high, leaning out */
function tuftGeometry() {
  if (TUFT) return TUFT;
  const pos: number[] = [], col: number[] = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4 * hash2(i, 3), lean = 0.2 + 0.25 * hash2(i, 5), w = 0.05, px = -Math.sin(a) * w, pz = Math.cos(a) * w;
    const tx = Math.cos(a) * lean, tz = Math.sin(a) * lean, hh = 0.75 + 0.25 * hash2(i, 7);
    pos.push(-px, 0, -pz, px, 0, pz, tx, hh, tz);
    col.push(0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 1.1, 1.1, 1.1);
  }
  TUFT = new THREE.BufferGeometry();
  TUFT.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  TUFT.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  TUFT.computeVertexNormals();
  // (lit from above whichever way a blade faces)
  const n = TUFT.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, n.getX(i) * 0.3, 1, n.getZ(i) * 0.3);
  return TUFT;
}
let TUFT_MAT: THREE.MeshStandardMaterial | null = null;

export function crownTiles(list: Crown[], tile = 100, nearM = 75, tufts: Tuft[] = []): THREE.Object3D[] {
  const G = geos(), byTile = new Map<string, Crown[]>(), tuftTile = new Map<string, Tuft[]>();
  for (const t of tufts) { const k = `${Math.floor(t.x / tile)},${Math.floor(t.z / tile)}`; (tuftTile.get(k) ?? tuftTile.set(k, []).get(k)!).push(t); if (!byTile.has(k)) byTile.set(k, []); }
  for (const c of list) {
    const k = `${Math.floor(c.x / tile)},${Math.floor(c.z / tile)}`;
    (byTile.get(k) ?? byTile.set(k, []).get(k)!).push(c);
    if (c.solid && c.trunk > 0) SOLIDS.add(c.x, c.z, c.trunk + 0.1);
  }
  const out: THREE.Object3D[] = [];
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
  for (const [key, cs] of byTile) {
    const [ti, tj] = key.split(',').map(Number), cx = (ti + 0.5) * tile, cz = (tj + 0.5) * tile;
    const leafM = new Float32Array(cs.length * 16), leafC = new Float32Array(cs.length * 3);
    const trunks = cs.filter((c) => c.trunk > 0), barkM = new Float32Array(Math.max(1, trunks.length) * 16), barkC = new Float32Array(Math.max(1, trunks.length) * 3);
    cs.forEach((c, i) => {
      const y = groundHeight(c.x, c.z);
      q.setFromAxisAngle(Y, c.seed * 6.283);
      m.compose(p.set(c.x - cx, y + c.base, c.z - cz), q, s.set(c.r, c.h, c.r * (0.85 + 0.3 * hash2(c.seed, 3))));
      m.toArray(leafM, i * 16);
      col.set(c.color).toArray(leafC, i * 3);
    });
    trunks.forEach((c, i) => {
      const y = groundHeight(c.x, c.z);
      m.compose(p.set(c.x - cx, y - 0.2, c.z - cz), q.identity(), s.set(c.trunk, c.base + 0.2 + c.h * 0.35, c.trunk));
      m.toArray(barkM, i * 16);
      col.set(['#4f4236', '#5a4a3b', '#463a2f'][Math.floor(hash2(c.seed, 7) * 3)]).toArray(barkC, i * 3);
    });
    const inst = (geo: THREE.BufferGeometry, mat: THREE.Material, mats: Float32Array, cols: Float32Array, n: number) => {
      const im = new THREE.InstancedMesh(geo, mat, n);
      im.instanceMatrix = new THREE.InstancedBufferAttribute(mats, 16);
      im.instanceColor = new THREE.InstancedBufferAttribute(cols, 3);
      im.castShadow = true; im.receiveShadow = true; im.userData.noCollide = true;
      im.computeBoundingSphere();
      return im;
    };
    const lod = new THREE.LOD();
    lod.position.set(cx, 0, cz);
    const near = new THREE.Group(), far = new THREE.Group();
    if (cs.length) {
      near.add(inst(G.near, G.leaf, leafM, leafC, cs.length));
      far.add(inst(G.far, G.leaf, leafM, leafC, cs.length));
    }
    if (trunks.length) near.add(inst(G.trunk, G.bark, barkM, barkC, trunks.length));
    // the grass tufts, only near
    const ts = tuftTile.get(key) ?? [];
    if (ts.length) {
      TUFT_MAT ??= new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide });
      const tm = new Float32Array(ts.length * 16), tc = new Float32Array(ts.length * 3);
      ts.forEach((t, i) => {
        q.setFromAxisAngle(Y, hash2(t.x, t.z) * 6.283);
        m.compose(p.set(t.x - cx, groundHeight(t.x, t.z), t.z - cz), q, s.set(t.s, t.s, t.s));
        m.toArray(tm, i * 16);
        col.set(t.color).toArray(tc, i * 3);
      });
      const im = inst(tuftGeometry(), TUFT_MAT, tm, tc, ts.length);
      im.castShadow = false;
      near.add(im);
    }
    // (the tile's own reach: switch where the nearest crowns are nearMetres off)
    const rad = tile * 0.71;
    lod.addLevel(near, 0);
    lod.addLevel(far, nearM + rad * 0.5);
    // nothing past the fog
    lod.addLevel(new THREE.Object3D(), 345 + rad * 0.5);
    lod.userData.noRelief = true; lod.userData.noCollide = true;
    lod.name = 'crowns';
    out.push(lod);
  }
  return out;
}
