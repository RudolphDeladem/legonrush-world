// What a free-ridden bike bumps into that has no footprint on the map: the walls, fences, planters, parked cars,
// benches, kiosks and posts the modelled sites, the halls and the roadside life draw. Rather than every model listing
// its own colliders, the drawn geometry itself is rasterised, tile by tile as the rider comes near, into a fine grid:
// a cell is solid where some surface stands between knee and chest height above the ground there (a kerb, a ground
// drape or a roof never does, nor leaves: green-dominant vertex colours). Trees and palms keep their round solids (solids.ts); buildings their footprints.
import * as THREE from 'three';
import { groundHeight } from './relief';

const CELL = 0.35, TILE = 42, N = Math.round(TILE / CELL);
/** the height band (above the ground) in which a surface stops a bike */
const LOW = 0.3, HIGH = 1.4;

interface Src { mesh: THREE.Mesh; x0: number; x1: number; z0: number; z1: number }
const roots: THREE.Object3D[] = [];
let srcs: Src[] | null = null;
const tiles = new Map<number, Uint8Array>();
const tkey = (i: number, j: number) => (i + 2048) * 4096 + (j + 2048);

/** the groups whose meshes collide (built once, when the campus is built) */
export function collisionRoots(...r: THREE.Object3D[]) { roots.push(...r); srcs = null; tiles.clear(); }

function sources() { return (srcs ??= collect(roots)); }
function collect(list: THREE.Object3D[]) {
  const out: Src[] = [];
  const box = new THREE.Box3();
  for (const root of list) {
    root.updateWorldMatrix(true, true);
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || (m as unknown as THREE.InstancedMesh).isInstancedMesh || (m as unknown as THREE.SkinnedMesh).isSkinnedMesh || m.userData.noCollide) return;
      const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.Material & { opacity?: number };
      if (mat && mat.transparent && (mat.opacity ?? 1) < 0.95) return;
      const g = m.geometry;
      if (!g?.attributes?.position || !(g.attributes.position as THREE.BufferAttribute).array) return;
      if (!g.boundingBox) g.computeBoundingBox();
      box.copy(g.boundingBox!).applyMatrix4(m.matrixWorld);
      out.push({ mesh: m, x0: box.min.x, x1: box.max.x, z0: box.min.z, z1: box.max.z });
    });
  }
  return out;
}

function buildTile(ti: number, tj: number) {
  const cells = new Uint8Array(N * N), tx0 = ti * TILE, tz0 = tj * TILE, tx1 = tx0 + TILE, tz1 = tz0 + TILE;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const mark = (x: number, z: number) => {
    const i = Math.floor((x - tx0) / CELL), j = Math.floor((z - tz0) / CELL);
    if (i >= 0 && i < N && j >= 0 && j < N) cells[j * N + i] = 1;
  };
  for (const s of sources()) {
    if (s.x1 < tx0 || s.x0 > tx1 || s.z1 < tz0 || s.z0 > tz1) continue;
    const g = s.mesh.geometry, pos = g.attributes.position as THREE.BufferAttribute, idx = g.index, M = s.mesh.matrixWorld;
    const col = g.attributes.color as THREE.BufferAttribute | undefined;
    const nt = (idx ? idx.count : pos.count) / 3;
    for (let t = 0; t < nt; t++) {
      const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
      // foliage (green-dominant vertex colours: crowns, hedges' leaves, grass) never stops the bike; trunks have solids
      if (col) { const r = col.getX(i0), gg = col.getY(i0), bb = col.getZ(i0); if (gg > r * 1.08 && gg > bb * 1.12) continue; }
      a.fromBufferAttribute(pos, i0).applyMatrix4(M); b.fromBufferAttribute(pos, i1).applyMatrix4(M); c.fromBufferAttribute(pos, i2).applyMatrix4(M);
      const minX = Math.min(a.x, b.x, c.x), maxX = Math.max(a.x, b.x, c.x), minZ = Math.min(a.z, b.z, c.z), maxZ = Math.max(a.z, b.z, c.z);
      if (maxX < tx0 || minX > tx1 || maxZ < tz0 || minZ > tz1) continue;
      const g0 = groundHeight((minX + maxX) / 2, (minZ + maxZ) / 2), lo = g0 + LOW, hi = g0 + HIGH;
      const minY = Math.min(a.y, b.y, c.y), maxY = Math.max(a.y, b.y, c.y);
      if (maxY < lo || minY > hi) continue;
      // sample the triangle finely enough to mark every cell it crosses, keeping the samples in the band
      const L = Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)), n = Math.min(600, Math.max(1, Math.ceil(L / (CELL * 0.6))));
      for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) {
        const u = i / n, v = j / n, y = a.y + (b.y - a.y) * u + (c.y - a.y) * v;
        if (y < lo || y > hi) continue;
        mark(a.x + (b.x - a.x) * u + (c.x - a.x) * v, a.z + (b.z - a.z) * u + (c.z - a.z) * v);
      }
    }
  }
  return cells;
}

function tileOf(x: number, z: number) {
  const ti = Math.floor(x / TILE), tj = Math.floor(z / TILE), k = tkey(ti, tj);
  let t = tiles.get(k);
  if (!t) { t = buildTile(ti, tj); tiles.set(k, t); }
  return { t, tx0: ti * TILE, tz0: tj * TILE };
}

/** some drawn surface at bike height within `pad` of x, z */
export function meshBlocked(x: number, z: number, pad = 0.2) {
  if (!roots.length) return false;
  const r = Math.ceil(pad / CELL);
  for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
    const px = x + di * CELL, pz = z + dj * CELL, { t, tx0, tz0 } = tileOf(px, pz);
    if (t[Math.floor((pz - tz0) / CELL) * N + Math.floor((px - tx0) / CELL)]) return true;
  }
  return false;
}

/** builds the tile under a point (the start of a free ride); warmOne then builds the ones round it frame by frame */
export function warmCollision(x: number, z: number) {
  if (roots.length) tileOf(x, z);
}
/** builds at most one missing tile of the 3 x 3 round a point (called every frame of a free ride: the tiles ahead are
 *  ready before the bike reaches them, without a stall) */
export function warmOne(x: number, z: number) {
  if (!roots.length) return;
  const ti = Math.floor(x / TILE), tj = Math.floor(z / TILE);
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
    const k = tkey(ti + di, tj + dj);
    if (!tiles.has(k)) { tiles.set(k, buildTile(ti + di, tj + dj)); return; }
  }
}
/** the geometries the grid is rasterised from (their arrays must stay in memory: memory.ts frees the others' after upload) */
export function collisionGeometries() {
  return new Set(sources().map((s) => s.mesh.geometry));
}
/** forget the grid (after the campus changes) */
export function resetCollision() { tiles.clear(); wtiles.clear(); srcs = null; }

// ---------- on foot: steps, porches and landings to stand on, what stands in the way at body height above them ----------
// (the owner, 2026-10-16: a character on foot climbs every modelled step and stair, not only the ones registered by
// hand.) A second grid for walking is rasterised from the same drawn geometry: in each cell the tops of the near-level,
// upward-facing surfaces (a tread, a porch slab, a landing, a raised walk) up to three of them, and the heights at
// which anything else stands (a riser, a wall, a railing) in 0.125 m bins from 1 m below the ground to 7 m above it.
// A walker stands on the highest top within a step of their feet and is stopped by what stands between knee and head
// height above that floor, so a riser under the next tread never stops them and a wall always does.
const W_BIN = 0.125, W_LO = -1, W_TOPS = 3;
interface WTile { tops: Float32Array; mask: Uint32Array; g: Float32Array }
const wtiles = new Map<number, WTile>();
function buildWalkTile(ti: number, tj: number): WTile {
  const NN = N * N, tops = new Float32Array(NN * W_TOPS).fill(NaN), mask = new Uint32Array(NN * 2), g = new Float32Array(NN).fill(NaN);
  const tx0 = ti * TILE, tz0 = tj * TILE, tx1 = tx0 + TILE, tz1 = tz0 + TILE;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
  const ground = (k: number) => { if (Number.isNaN(g[k])) g[k] = groundHeight(tx0 + ((k % N) + 0.5) * CELL, tz0 + (Math.floor(k / N) + 0.5) * CELL); return g[k]; };
  const cellOf = (x: number, z: number) => { const i = Math.floor((x - tx0) / CELL), j = Math.floor((z - tz0) / CELL); return i >= 0 && i < N && j >= 0 && j < N ? j * N + i : -1; };
  const addTop = (k: number, y: number) => {
    const o = k * W_TOPS;
    for (let q = 0; q < W_TOPS; q++) { const v = tops[o + q]; if (!Number.isNaN(v) && Math.abs(v - y) < 0.06) { tops[o + q] = Math.max(v, y); return; } }
    for (let q = 0; q < W_TOPS; q++) if (Number.isNaN(tops[o + q])) { tops[o + q] = y; return; }
    // (full: the highest kept, the lowest replaced)
    let lo = 0; for (let q = 1; q < W_TOPS; q++) if (tops[o + q] < tops[o + lo]) lo = q;
    if (y > tops[o + lo]) tops[o + lo] = y;
  };
  const addBin = (k: number, y: number) => { const bi = Math.floor((y - ground(k) - W_LO) / W_BIN); if (bi >= 0 && bi < 64) mask[k * 2 + (bi >> 5)] |= 1 << (bi & 31); };
  for (const s of sources()) {
    if (s.x1 < tx0 || s.x0 > tx1 || s.z1 < tz0 || s.z0 > tz1) continue;
    const gm = s.mesh.geometry, pos = gm.attributes.position as THREE.BufferAttribute, idx = gm.index, M = s.mesh.matrixWorld;
    const col = gm.attributes.color as THREE.BufferAttribute | undefined;
    const nt = (idx ? idx.count : pos.count) / 3;
    for (let t = 0; t < nt; t++) {
      const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
      if (col) { const r = col.getX(i0), gg = col.getY(i0), bb = col.getZ(i0); if (gg > r * 1.08 && gg > bb * 1.12) continue; }
      a.fromBufferAttribute(pos, i0).applyMatrix4(M); b.fromBufferAttribute(pos, i1).applyMatrix4(M); c.fromBufferAttribute(pos, i2).applyMatrix4(M);
      const minX = Math.min(a.x, b.x, c.x), maxX = Math.max(a.x, b.x, c.x), minZ = Math.min(a.z, b.z, c.z), maxZ = Math.max(a.z, b.z, c.z);
      if (maxX < tx0 || minX > tx1 || maxZ < tz0 || minZ > tz1) continue;
      e1.subVectors(b, a); e2.subVectors(c, a); e1.cross(e2);
      const nl = e1.length(); if (nl < 1e-9) continue;
      const level = Math.abs(e1.y / nl) > 0.85;
      const L = Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)), n = Math.min(600, Math.max(1, Math.ceil(L / (CELL * 0.6))));
      for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) {
        const u = i / n, v = j / n, x = a.x + (b.x - a.x) * u + (c.x - a.x) * v, z = a.z + (b.z - a.z) * u + (c.z - a.z) * v, y = a.y + (b.y - a.y) * u + (c.y - a.y) * v;
        const k = cellOf(x, z); if (k < 0) continue;
        // (a level face is something to stand on, as well as something in the way at its height: a table's top is not
        // walked through; the winding does not say which side is up, so the underside of a slab counts as a top too,
        // which is harmless: it is never within a step of the feet below it)
        if (level) { const gk = ground(k); if (y > gk + 0.04 && y < gk + 7) addTop(k, y); }
        addBin(k, y);
      }
    }
  }
  return { tops, mask, g };
}
const wtileOf = (x: number, z: number) => {
  const ti = Math.floor(x / TILE), tj = Math.floor(z / TILE), k = tkey(ti, tj);
  let t = wtiles.get(k);
  if (!t) { t = buildWalkTile(ti, tj); wtiles.set(k, t); }
  return { t, k: Math.floor((z - tj * TILE) / CELL) * N + Math.floor((x - ti * TILE) / CELL) };
};
/** the highest modelled top (a tread, a porch) at (x, z) reachable from feet at height y (a step up of at most `step`), or null */
export function walkTopAt(x: number, z: number, y: number, step = 0.46): number | null {
  if (!roots.length) return null;
  const { t, k } = wtileOf(x, z);
  let best: number | null = null;
  for (let q = 0; q < W_TOPS; q++) { const v = t.tops[k * W_TOPS + q]; if (!Number.isNaN(v) && v <= y + step && v >= y - 1.2 && (best === null || v > best)) best = v; }
  return best;
}
/** something drawn standing between knee and head height above a floor at height `floor` at (x, z) (a wall, a riser
 *  higher than a step, a railing): it stops a person on foot */
export function walkBlocked(x: number, z: number, floor: number, pad = 0.18) {
  if (!roots.length) return false;
  const r = Math.ceil(pad / CELL);
  for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
    const { t, k } = wtileOf(x + di * CELL, z + dj * CELL);
    const g0 = Number.isNaN(t.g[k]) ? groundHeight(x + di * CELL, z + dj * CELL) : t.g[k];
    const lo = Math.max(0, Math.floor((floor + 0.5 - g0 - W_LO) / W_BIN)), hi = Math.min(63, Math.floor((floor + 1.6 - g0 - W_LO) / W_BIN));
    for (let bi = lo; bi <= hi; bi++) if (t.mask[k * 2 + (bi >> 5)] & (1 << (bi & 31))) return true;
  }
  return false;
}
/** builds at most one missing walking tile round a point (called each frame on foot) */
export function warmWalk(x: number, z: number) {
  if (!roots.length) return;
  const ti = Math.floor(x / TILE), tj = Math.floor(z / TILE);
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
    const k = tkey(ti + di, tj + dj);
    if (!wtiles.has(k)) { wtiles.set(k, buildWalkTile(ti + di, tj + dj)); return; }
  }
}
// (development builds: the walking grid for the in-app tests)
if (import.meta.env.DEV && typeof window !== 'undefined') (window as unknown as { __walkgrid: object }).__walkgrid = { walkTopAt, walkBlocked, warmWalk };
