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

function sources() {
  if (srcs) return srcs;
  srcs = [];
  const box = new THREE.Box3();
  for (const root of roots) {
    root.updateWorldMatrix(true, true);
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || (m as unknown as THREE.InstancedMesh).isInstancedMesh || (m as unknown as THREE.SkinnedMesh).isSkinnedMesh || m.userData.noCollide) return;
      const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.Material & { opacity?: number };
      if (mat && mat.transparent && (mat.opacity ?? 1) < 0.95) return;
      const g = m.geometry;
      if (!g?.attributes?.position) return;
      if (!g.boundingBox) g.computeBoundingBox();
      box.copy(g.boundingBox!).applyMatrix4(m.matrixWorld);
      srcs!.push({ mesh: m, x0: box.min.x, x1: box.max.x, z0: box.min.z, z1: box.max.z });
    });
  }
  return srcs;
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
export function resetCollision() { tiles.clear(); srcs = null; }
