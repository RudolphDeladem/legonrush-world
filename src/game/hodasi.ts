// J.K.M. Hodasi Road's bend west of the Volta Hall Annex, to the owner's Commonwealth and Great Hall brief (pairs 5 to 7,
// map M1: the views south along the bend, across it toward the Annex, and north again). One shaded two-lane road: its
// dashed centre line (world.ts), a concrete kerb along both edges, the narrow brick footway on its west side with a
// utility cover or two and a few slender poles, the tall mixed grass and scrub of the east verge on darker earth, and
// mature broadleaf trees close along both sides, their crowns meeting over it, a second row to the east screening the
// Annex and its water tower so that only a roof shows through. The generic verges and drains stay out (agplan.ts
// HODASI). The road's line is the mapped one; nothing here is measured.
import * as THREE from 'three';
import { createSite, type Kit, type Spec } from './blocks';
import { Bag, gh, hash, tuft, vnoise } from './enkit';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { HODASI, nearLine } from './agplan';
import { BUILDINGS, NODE_XZ, ROADS } from './campusmap';
import { SOLIDS } from './solids';

const O: [number, number] = [-360, -80];
const P = HODASI.pts, H = HODASI.half;
/** the other roads meeting the bend (their mouths stay open): segments and half widths */
const SIDE: [number, number, number, number, number][] = [];
for (const r of ROADS) {
  if (r.name === 'J.K.M. Hodasi Road') continue;
  for (let i = 0; i < r.nodes.length - 1; i++) {
    const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
    if (Math.max(ax, bx) < -420 || Math.min(ax, bx) > -280 || Math.max(az, bz) < -170 || Math.min(az, bz) > 15) continue;
    SIDE.push([ax, az, bx, bz, [9, 7.4, 6.2, 4.6, 2.6][r.cls] / 2]);
  }
}
const nearSide = (x: number, z: number, pad: number) => SIDE.some(([ax, az, bx, bz, h]) => {
  const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(ax + dx * t - x, az + dz * t - z) < h + pad;
});
/** points along the bend every `step` metres: position, the left (west) normal, the ground */
function along(step: number) {
  const out: { x: number; z: number; nx: number; nz: number; dx: number; dz: number }[] = [];
  for (let i = 0; i < P.length - 1; i++) {
    const [ax, az] = P[i], [bx, bz] = P[i + 1], l = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / l, dz = (bz - az) / l;
    for (let t = 0; t < l; t += step) out.push({ x: ax + dx * t, z: az + dz * t, nx: -dz, nz: dx, dx, dz });
  }
  return out;
}
const brick = (x: number, z: number): [number, number, number] => {
  const h = hash(Math.floor(x * 4.1), Math.floor(z * 4.1)), n = vnoise(x * 0.3, z * 0.3);
  return [0.55 + h * 0.12 - n * 0.06, 0.3 + h * 0.06 - n * 0.04, 0.22 + h * 0.04];
};

const spec: Spec = {
  name: 'J.K.M. Hodasi Road bend',
  axis: [1, 0], origin: O, storey: 3, style: { bay: 3, up: [], ground: [], draw: (g) => { g.fillStyle = '#ccc'; g.fillRect(0, 0, 256, 512); } }, roofColor: '#888', fascia: '#888', pitch: 0.1,
  onGround: true,
  blocks: [],
  keep: [],
  extras: (k: Kit) => {
    const b = new Bag(O), X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
    const [x0, x1, z0, z1] = [-402, -296, -158, 6];
    // ---- the brick footway on the west side (pairs 5, 7), clear of the side roads' mouths
    k.meshes.push(new THREE.Mesh(drapeAt(O, x0, x1, z0, z1, 0.35, 0.07, (x, z) => {
      const n = nearLine(P, x, z), e = n.d - H;
      return n.side > 0 && e > 0.3 && e < 2.5 && !nearSide(x, z, 0.4) ? brick(x, z) : null;
    }), groundCover()));
    // ---- the verges: darker earth and dry grass under the trees on the east, rougher grass beyond the footway on the west
    k.meshes.push(new THREE.Mesh(drapeAt(O, x0, x1, z0, z1, 0.7, 0.04, (x, z) => {
      const n = nearLine(P, x, z), e = n.d - H;
      if (e < 0.35 || e > 10.5 || nearSide(x, z, 0.5) || (n.side > 0 && e < 2.6)) return null;
      const v = vnoise(x * 0.18, z * 0.18), w = vnoise(x * 0.7 + 3, z * 0.7);
      if (n.side < 0) return v > 0.62 ? [0.4, 0.33, 0.24] : w > 0.55 ? [0.48, 0.5, 0.26] : [0.33 + v * 0.08, 0.42 + v * 0.06, 0.2];
      return v > 0.7 ? [0.42, 0.36, 0.26] : null;
    }), groundCover()));
    // ---- the kerbs along both edges, in short lengths on the ground; open at the side roads
    for (const p of along(1.5)) for (const s of [1, -1]) {
      const cx = p.x + p.nx * s * (H + 0.15), cz = p.z + p.nz * s * (H + 0.15);
      if (nearSide(cx, cz, 0.3)) continue;
      const y = gh(cx, cz);
      b.c.push([new THREE.BoxGeometry(1.52, 0.32, 0.22).rotateY(-Math.atan2(p.dz, p.dx)).translate(X(cx), y - 0.04, Z(cz)), '#c9c4b8']);
    }
    // ---- a utility cover or two on the footway (pair 6), slender poles along it, few
    for (const [i, kind] of [[22, 'cover'], [61, 'cover'], [9, 'pole'], [47, 'pole'], [88, 'pole']] as [number, string][]) {
      const pts = along(2), p = pts[Math.min(pts.length - 1, i)];
      const cx = p.x + p.nx * (H + (kind === 'pole' ? 2.3 : 1.4)), cz = p.z + p.nz * (H + (kind === 'pole' ? 2.3 : 1.4));
      if (nearSide(cx, cz, 0.8)) continue;
      const y = gh(cx, cz);
      if (kind === 'cover') b.c.push([new THREE.BoxGeometry(1.0, 0.1, 0.7).rotateY(-Math.atan2(p.dz, p.dx)).translate(X(cx), y + 0.06, Z(cz)), '#8f8b84']);
      else { b.c.push([new THREE.CylinderGeometry(0.07, 0.1, 7.5, 6).translate(X(cx), y + 3.7, Z(cz)), '#8a8d90']); SOLIDS.add(cx, cz, 0.2); }
    }
    // ---- tall mixed grass and scrub on the east verge, sparser tufts beyond the west footway
    for (const p of along(0.8)) {
      for (let j = 0; j < 9; j++) {
        const r = hash(p.x * 3 + j, p.z * 5 - j), e = 0.7 + j * 1.05 + r * 0.5, cx = p.x - p.nx * (H + e), cz = p.z - p.nz * (H + e);
        if (r < 0.25 || nearSide(cx, cz, 0.6)) continue;
        tuft(b, cx, cz, 0.55 + hash(cz, cx) * 0.75, r > 0.8 ? '#7d8a3c' : r > 0.5 ? '#5f7a2e' : '#8a8a4a');
      }
      const r = hash(p.z * 7, p.x), e = 3.0 + r * 6, cx = p.x + p.nx * (H + e), cz = p.z + p.nz * (H + e);
      if (r > 0.55 && !nearSide(cx, cz, 0.6)) tuft(b, cx, cz, 0.5 + r * 0.4, '#6c7f33');
    }
    // ---- the mature trees: close along both sides, their crowns over the road; a second row east screening the Annex
    const trees = b.leaf;
    const inBuilding = (x: number, z: number, pad: number) => BUILDINGS.some((q) => x > q.minX - pad && x < q.maxX + pad && z > q.minZ - pad && z < q.maxZ + pad);
    const plant = (step: number, off: [number, number], s: number, seed: number, keepOut = 4) => {
      for (const p of along(step)) {
        const r = hash(p.x * seed, p.z), r2 = hash(p.z * seed, p.x + seed);
        if (r2 < 0.18) continue;
        const e = off[0] + r * (off[1] - off[0]), j = (r2 - 0.5) * step * 0.8;
        const cx = p.x + p.nx * s * (H + e) + p.dx * j, cz = p.z + p.nz * s * (H + e) + p.dz * j;
        if (nearSide(cx, cz, keepOut) || inBuilding(cx, cz, 6)) continue;
        broadleaf(k, trees, cx, cz, { h: 8 + r2 * 6, spread: 11 + r * 9, seed: seed + cx * 3 + cz, origin: O, lean: (r - 0.5) * 0.4 });
      }
    };
    plant(9, [4.5, 9], 1, 13);
    plant(10, [3.5, 8], -1, 29);
    // the screen east of the road, between it and the Annex (pairs 6, 7): trees in depth with scrub under them
    plant(8, [12, 22], -1, 41);
    plant(9, [22, 34], -1, 47);
    plant(11, [34, 46], -1, 59);
    plant(12, [12, 22], 1, 53);
    // the understorey: low trees and tall scrub through the screen, so the Annex shows only through gaps (pair 6)
    for (const p of along(5.5)) for (let j = 0; j < 3; j++) {
      const r = hash(p.x * 1.7 + j * 13, p.z), e = 13 + j * 9 + r * 8, cx = p.x - p.nx * (H + e) + p.dx * (r - 0.5) * 4, cz = p.z - p.nz * (H + e) + p.dz * (r - 0.5) * 4;
      if (r < 0.2 || nearSide(cx, cz, 3) || inBuilding(cx, cz, 4)) continue;
      broadleaf(k, trees, cx, cz, { h: 3.2 + r * 2.6, spread: 6 + r * 4, seed: 71 + cx + cz * 2, origin: O, round: true });
    }
    for (const p of along(2.2)) for (let j = 0; j < 4; j++) {
      const r = hash(p.x + j * 7, p.z * 3), e = 11 + r * 30, cx = p.x - p.nx * (H + e) + p.dx * (r - 0.5) * 2, cz = p.z - p.nz * (H + e) + p.dz * (r - 0.5) * 2;
      if (r < 0.3 || nearSide(cx, cz, 1.5) || inBuilding(cx, cz, 2)) continue;
      const y = gh(cx, cz), sz = 0.7 + hash(cz, cx) * 0.9;
      b.leaf.push([new THREE.IcosahedronGeometry(sz, 0).scale(1.3, 0.75, 1.3).translate(X(cx), y + sz * 0.5, Z(cz)), r > 0.7 ? '#46612c' : '#3a5326']);
    }
    b.finish(k, 0.25);
  },
};

/** J.K.M. Hodasi Road's bend by the Volta Hall Annex */
export const hodasiSite = createSite('hodasi', [spec]);
