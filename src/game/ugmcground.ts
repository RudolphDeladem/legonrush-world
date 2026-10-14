// The UGMC precinct's planting (the owner's UGMC brief, pages 17-18 and 24; numbers in ugmcplan.ts): the roundabout's
// dense low planting, the clipped hedge round garden 10, the young trees along the north lot and on the lots' islands,
// and the woodland the satellite shows outside the precinct (west of the west road and north of the main road), kept
// off the roads, lots and outlines. Instanced low-poly crowns (scrubkit.ts: per tile, a fuller crown near the camera);
// only tree trunks are solid.
import * as THREE from 'three';
import { BUILDINGS, ROADS, NODE_XZ } from './campusmap';
import { crownTiles, hash2, vnoise2, type Crown } from './scrubkit';
import { GARDEN, LOTS, ROUND, ugLocal, ugWorld } from './ugmcplan';

const SHRUB = ['#4c6f30', '#557a35', '#5f8238', '#486a2d'];
const HEDGE = ['#3f6428', '#456c2c', '#3b5e25'];
const TREE = ['#4d7a35', '#5a8a3c', '#43702f', '#638f43'];
const WOOD = ['#2f5a26', '#3a6b2c', '#355f28', '#44722f'];
const HALF = [4.5, 3.7, 3.1, 2.3, 1.3];
const segDist = (x: number, z: number, ax: number, az: number, bx: number, bz: number) => {
  const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz, t = l ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l)) : 0;
  return Math.hypot(x - ax - dx * t, z - az - dz * t);
};

export function buildUgmcGrounds() {
  // the roads and outlines round the precinct, in site-frame terms
  const segs: [number, number, number, number, number][] = [];
  for (const r of ROADS) for (let i = 1; i < r.nodes.length; i++) {
    const [ax, az] = ugLocal(NODE_XZ[r.nodes[i - 1] * 2], NODE_XZ[r.nodes[i - 1] * 2 + 1]), [bx, bz] = ugLocal(NODE_XZ[r.nodes[i] * 2], NODE_XZ[r.nodes[i] * 2 + 1]);
    if (Math.min(ax, bx) > 200 || Math.max(ax, bx) < -340 || Math.min(az, bz) > 260 || Math.max(az, bz) < -220) continue;
    segs.push([ax, az, bx, bz, HALF[r.cls]]);
  }
  const roadGap = (u: number, v: number) => segs.reduce((m, [ax, az, bx, bz, h]) => Math.min(m, segDist(u, v, ax, az, bx, bz) - h), Infinity);
  const [cx, cz] = ugWorld(-60, 30);
  const blds = BUILDINGS.filter((b) => Math.abs((b.minX + b.maxX) / 2 - cx) < 330 && Math.abs((b.minZ + b.maxZ) / 2 - cz) < 330);
  const inBld = (u: number, v: number, pad: number) => { const [x, z] = ugWorld(u, v); return blds.some((b) => x > b.minX - pad && x < b.maxX + pad && z > b.minZ - pad && z < b.maxZ + pad); };
  const inLot = (u: number, v: number, pad = 0) => LOTS.some((l) => { const us = l.ring.map((p) => p[0]), vs = l.ring.map((p) => p[1]); return u > Math.min(...us) - pad && u < Math.max(...us) + pad && v > Math.min(...vs) - pad && v < Math.max(...vs) + pad; });

  const crowns: Crown[] = [];
  const add = (u: number, v: number, c: Omit<Crown, 'x' | 'z'>) => { const [x, z] = ugWorld(u, v); crowns.push({ x, z, ...c }); };
  // the roundabout's dense low planting inside its white stone ring
  for (let r = 1; r < 5.6; r += 1.1) for (let a = 0; a < Math.PI * 2; a += 1.1 / r) {
    const s = hash2(r * 7, a * 13);
    add(ROUND.c[0] + Math.cos(a) * r, ROUND.c[1] + Math.sin(a) * r, { r: 0.6 + s * 0.3, h: 0.7 + s * 0.5, base: 0.38, trunk: 0, color: SHRUB[(s * 4) | 0], seed: s });
  }
  // the clipped hedge round garden 10 (A44-A47: a continuous low bank along the road edges)
  for (const [a, b] of GARDEN.hedge) {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let t = 0.4; t < l; t += 0.8) {
      const u = a[0] + ((b[0] - a[0]) * t) / l, v = a[1] + ((b[1] - a[1]) * t) / l, s = hash2(u, v);
      add(u + 1.0 * Math.sign(GARDEN.lawn[1] - u) * (a[0] === b[0] ? 1 : 0), v + 1.0 * (a[1] === b[1] ? 1 : 0), { r: 0.85, h: 0.95 + s * 0.15, base: 0, trunk: 0, color: HEDGE[(s * 3) | 0], seed: s });
    }
  }
  // young trees along the north lot's road edge, and on the lots' islands
  for (let u = -134; u < -32; u += 9.5) add(u, -120.3, { r: 2.4, h: 2.6, base: 2.0, trunk: 0.16, color: TREE[((u * 7) & 3)], seed: hash2(u, 1), solid: true });
  for (const l of LOTS) for (const [x0, x1, z0, z1] of l.islands) {
    const along = x1 - x0 > z1 - z0, n = Math.max(1, Math.floor((along ? x1 - x0 : z1 - z0) / 14));
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, u = along ? x0 + (x1 - x0) * t : (x0 + x1) / 2, v = along ? (z0 + z1) / 2 : z0 + (z1 - z0) * t;
      add(u, v, { r: 1.8, h: 2.0, base: 1.8, trunk: 0.12, color: TREE[i & 3], seed: hash2(u, v), solid: true }); }
  }
  // the woodland outside the precinct (M1-M3): west of the west road and north of the main road; ragged, with gaps
  const wood = (u0: number, u1: number, v0: number, v1: number) => {
    for (let v = v0; v < v1; v += 6.5) for (let u = u0; u < u1; u += 6.5) {
      const pu = u + (hash2(u, v) - 0.5) * 5, pv = v + (hash2(v, u) - 0.5) * 5;
      if (vnoise2(pu / 18, pv / 18) < 0.32 || roadGap(pu, pv) < 3 || inBld(pu, pv, 3) || inLot(pu, pv, 2)) continue;
      const s = hash2(pu * 3, pv);
      add(pu, pv, { r: 3.4 + s * 2, h: 3.5 + s * 2.5, base: 2 + s * 2, trunk: 0.28, color: WOOD[(s * 4) | 0], seed: s, solid: true });
    }
  };
  wood(-330, -192, -128, 10);
  wood(-270, 130, -200, -140);

  const group = new THREE.Group();
  group.name = 'ugmc-grounds';
  group.userData.noRelief = true;
  group.add(...crownTiles(crowns, 100, 75));
  group.userData.crowns = crowns.length;
  return group;
}
