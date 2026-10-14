// The ground round the School of Engineering Sciences (engplan.ts; the owner's SES brief and the owner's words on the
// satellite picture, 2026-10-14):
// - low bush between the back of the building and the track behind it, a service strip kept clear of the building;
// - thick forest beyond the track, north to Evandy Hostel's latitude: overlapping canopy crowns on solid trunks, an
//   understorey along its edge, the forest floor painted dark under it;
// - the track itself brown earth (the pale path is not drawn there: science.ts offAsphalt);
// - pale concrete sidewalks with a low kerb beside the roads round the school's lawns.
// The plants are instanced low-poly crowns, per tile, a fuller crown near the camera and a single blob further off
// (scrubkit.ts). Only tree trunks are solid; bushes never block the bike.
import * as THREE from 'three';
import { BUILDINGS, ROADS, NODE_XZ } from './campusmap';
import { groundHeight } from './relief';
import { coverOverlay, crownTiles, hash2, vnoise2, type Crown, type P2 } from './scrubkit';
import { concreteTexture } from './textures';
import { ENG_GROUND, ENG_TRACK, ENG_TRACK_HALF, ENG_TRACK_INDEX, roadNear, trackZ } from './engplan';

const LOW = ['#5d7f3a', '#6b8a42', '#55763a', '#728d48'];
const BUSH = ['#4f7a35', '#5d8a3c', '#46702f', '#6b8f45', '#557f37'];
const FOREST = ['#2f5a26', '#3a6b2c', '#355f28', '#44722f', '#2c5223'];
const HALF = [4.5, 3.7, 3.1, 2.3, 1.3];

const xz = (n: number): P2 => [NODE_XZ[n * 2], NODE_XZ[n * 2 + 1]];
const segDist = (x: number, z: number, ax: number, az: number, bx: number, bz: number) => {
  const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz, t = l ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l)) : 0;
  return Math.hypot(x - ax - dx * t, z - az - dz * t);
};

export function buildEngineeringGrounds() {
  const G = ENG_GROUND, F = G.forest;
  const box = [F.x0 - 10, 515, F.z0 - 10, -330] as const;
  const inBox = (x: number, z: number) => x > box[0] && x < box[1] && z > box[2] && z < box[3];
  // the roads (with their drawn half widths) and outlines round it, in 32 m cells for quick lookups
  const CELL = 32, roadCells = new Map<string, [number, number, number, number, number][]>();
  for (const r of ROADS) for (let i = 1; i < r.nodes.length; i++) {
    const [ax, az] = xz(r.nodes[i - 1]), [bx, bz] = xz(r.nodes[i]);
    if (!inBox(ax, az) && !inBox(bx, bz)) continue;
    const s: [number, number, number, number, number] = [ax, az, bx, bz, HALF[r.cls]];
    for (let ci = Math.floor((Math.min(ax, bx) - 12) / CELL); ci <= Math.floor((Math.max(ax, bx) + 12) / CELL); ci++)
      for (let cj = Math.floor((Math.min(az, bz) - 12) / CELL); cj <= Math.floor((Math.max(az, bz) + 12) / CELL); cj++) {
        const k = `${ci},${cj}`; (roadCells.get(k) ?? roadCells.set(k, []).get(k)!).push(s);
      }
  }
  const roadGap = (x: number, z: number) => {
    let best = Infinity;
    for (const [ax, az, bx, bz, h] of roadCells.get(`${Math.floor(x / CELL)},${Math.floor(z / CELL)}`) ?? []) best = Math.min(best, segDist(x, z, ax, az, bx, bz) - h);
    return best;
  };
  const blds = BUILDINGS.filter((b) => inBox((b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2) || (b.maxX > box[0] && b.minX < box[1] && b.maxZ > box[2] && b.minZ < box[3]));
  const nearBld = (x: number, z: number, pad: number) => blds.some((b) => x > b.minX - pad && x < b.maxX + pad && z > b.minZ - pad && z < b.maxZ + pad);
  /** north of the track (or, west of its start, north of the woods' line): the forest's side */
  const beyond = (x: number, z: number, pad: number) => {
    const tz = trackZ(x);
    return Number.isNaN(tz) ? (x < 400 ? z < F.zw - pad : false) : z < tz - pad;
  };
  // (its far edges ragged, not ruled)
  const inForest = (x: number, z: number, pad = 0) => x > F.x0 + pad + 24 * vnoise2(3.1, z / 45) && x < F.x1 && z > F.z0 + pad + 20 * vnoise2(x / 45, 7.3) && beyond(x, z, ENG_TRACK_HALF + 2.5 + pad);

  const crowns: Crown[] = [];
  const jit = (x: number, z: number, step: number): P2 => [x + (hash2(x, z) - 0.5) * step * 0.9, z + (hash2(z, x) - 0.5) * step * 0.9];
  // the low bush behind the building, between it and the track
  { const b = G.bush;
    for (let z = b.z0; z < b.z1; z += 2.2) for (let x = b.x0; x < b.x1; x += 2.2) {
      const [px, pz] = jit(x, z, 2.2);
      if (beyond(px, pz, 0) || vnoise2(px / 7, pz / 7) < 0.2) continue;
      const r = 0.9 + hash2(pz, px * 5) * 0.8, seed = hash2(px, pz * 3);
      if (roadGap(px, pz) < r * 0.6 + ENG_TRACK_HALF + 0.6 || nearBld(px, pz, G.strip + r * 0.6)) continue;
      crowns.push({ x: px, z: pz, r, h: 0.7 + seed * 0.8, base: 0, trunk: 0, color: LOW[(seed * 4) | 0], seed });
    } }
  // the trees and bush between the east block and Annie Jiagge Road
  { const b = G.east;
    for (let z = b.z0; z < b.z1; z += 2.8) for (let x = b.x0; x < b.x1; x += 2.8) {
      const [px, pz] = jit(x, z, 2.8), tree = hash2(px * 3, pz) < 0.3, seed = hash2(px, pz * 3), r = tree ? 2.6 : 1.4;
      if (roadGap(px, pz) < (tree ? 1.5 : r) + 1 || nearBld(px, pz, G.strip + (tree ? 1 : r * 0.6))) continue;
      crowns.push(tree
        ? { x: px, z: pz, r, h: 2.8 + seed, base: 2.4 + seed, trunk: 0.22, color: BUSH[(seed * 5) | 0], seed, solid: true }
        : { x: px, z: pz, r, h: 1.2 + seed * 0.8, base: 0, trunk: 0, color: BUSH[(seed * 5) | 0], seed });
    } }
  // the forest: canopy crowns close enough to close over, on trunks, with an understorey along the track
  for (let z = F.z0, row = 0; z < -440; z += 6.6, row++) for (let x = F.x0 + (row % 2) * 3.7; x < F.x1; x += 7.4) {
    const [px, pz] = jit(x, z, 7.4);
    if (!inForest(px, pz)) continue;
    const seed = hash2(px, pz * 3), big = hash2(pz * 7, px) < 0.25, r = big ? 6 + seed * 2 : 3.8 + hash2(pz, px * 5) * 2;
    if (roadGap(px, pz) < 2.5 || nearBld(px, pz, 3)) continue;
    crowns.push({ x: px, z: pz, r, h: (big ? 6 : 4) + seed * 3, base: (big ? 3.5 : 1.6) + seed * 2.2, trunk: big ? 0.4 : 0.26, color: FOREST[(seed * 5) | 0], seed, solid: true });
  }
  // the undergrowth: thick along the track, thinner through the rest of the forest
  for (let z = F.z0; z < -440; z += 3.4) for (let x = F.x0; x < F.x1; x += 3.4) {
    const [px, pz] = jit(x + 1.1, z + 1.7, 3.4);
    if (!inForest(px, pz)) continue;
    const edge = !beyond(px, pz, ENG_TRACK_HALF + 2.5 + 20);
    if (!edge && hash2(px * 2, pz * 9) > 0.3) continue;
    const seed = hash2(px * 5, pz), r = 1.4 + seed * 1.3;
    if (roadGap(px, pz) < r * 0.6 + 1 || nearBld(px, pz, 2)) continue;
    crowns.push({ x: px, z: pz, r, h: 1.4 + seed * 1.8, base: 0, trunk: 0, color: FOREST[((seed * 7) | 0) % 5], seed });
  }

  const group = new THREE.Group();
  group.name = 'engineering-grounds';
  group.userData.noRelief = true;
  group.add(...crownTiles(crowns, 100, 75));
  group.userData.crowns = crowns.length;

  // the forest floor under the canopy and the brown track behind the school, painted over the grass
  const clearLines = ROADS.flatMap((r, ri) => (ri === ENG_TRACK_INDEX ? [] : [{ pts: r.nodes.map(xz), half: HALF[r.cls] + 0.3 }]));
  const clearRings = blds.map((b) => { const r: P2[] = []; for (let i = 0; i < b.pts.length; i += 2) r.push([b.pts[i], b.pts[i + 1]]); return r; });
  const floor = coverOverlay({
    box: [F.x0, F.x1 + 8, F.z0, -420], mpp: 2, cell: 4, tile: 160,
    color: (x, z) => (inForest(x, z, -3) ? [58, 72, 38, 0.55 + 0.3 * vnoise2(x / 11, z / 11)] : null),
    tracks: [{ pts: ENG_TRACK, half: ENG_TRACK_HALF }], clearLines, clearRings,
    cellIn: (x, z) => inForest(x, z, -6) || ENG_TRACK.some((p, i) => i > 0 && segDist(x, z, ENG_TRACK[i - 1][0], ENG_TRACK[i - 1][1], p[0], p[1]) < 5),
  });
  for (const m of floor) { m.userData.noRelief = true; group.add(m); }

  // the sidewalks: a pale concrete strip a little above the grass, its kerb face toward the road
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const quad = (a: number[], b: number[], c: number[], d: number[]) => {
    const k = pos.length / 3;
    for (const p of [a, b, c, d]) { pos.push(p[0], p[1], p[2]); uv.push(p[0] / 4, p[2] / 4); }
    idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
  };
  for (const w of G.walks) {
    const ri = roadNear(w.at);
    if (ri < 0) continue;
    const pts = ROADS[ri].nodes.map(xz), dense: P2[] = [];
    for (let i = 1; i < pts.length; i++) {
      const [ax, az] = pts[i - 1], [bx, bz] = pts[i], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 2));
      for (let j = 0; j < n; j++) dense.push([ax + ((bx - ax) * j) / n, az + ((bz - az) * j) / n]);
    }
    dense.push(pts[pts.length - 1]);
    const at = (i: number): [P2, P2, P2] | null => {
      const [x, z] = dense[i], [px, pz] = dense[Math.max(0, i - 1)], [nx, nz] = dense[Math.min(dense.length - 1, i + 1)];
      const dx = nx - px, dz = nz - pz, l = Math.hypot(dx, dz) || 1, lx = (dz / l) * w.side, lz = (-dx / l) * w.side;
      const v = w.along === 'x' ? x : z;
      if (v < w.range[0] || v > w.range[1]) return null;
      const inner: P2 = [x + lx * w.off[0], z + lz * w.off[0]], outer: P2 = [x + lx * w.off[1], z + lz * w.off[1]];
      // (a gap where another road comes in)
      const mid: P2 = [(inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2];
      let other = Infinity;
      ROADS.forEach((r, rj) => { if (rj === ri || r.cls > 3) return; for (let k = 1; k < r.nodes.length; k++) { const [ax, az] = xz(r.nodes[k - 1]), [bx, bz] = xz(r.nodes[k]); other = Math.min(other, segDist(mid[0], mid[1], ax, az, bx, bz) - HALF[r.cls]); } });
      return other < 1 ? null : [inner, outer, [lx, lz]];
    };
    for (let i = 1; i < dense.length; i++) {
      const a = at(i - 1), b = at(i);
      if (!a || !b) continue;
      const y = (p: P2) => groundHeight(p[0], p[1]);
      const top = 0.12;
      quad([a[0][0], y(a[0]) + top, a[0][1]], [a[1][0], y(a[1]) + top, a[1][1]], [b[0][0], y(b[0]) + top, b[0][1]], [b[1][0], y(b[1]) + top, b[1][1]]);
      // the kerb face toward the road
      quad([a[0][0], y(a[0]) - 0.05, a[0][1]], [a[0][0], y(a[0]) + top, a[0][1]], [b[0][0], y(b[0]) - 0.05, b[0][1]], [b[0][0], y(b[0]) + top, b[0][1]]);
    }
  }
  if (idx.length) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    const walk = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#d9d6cf', map: concreteTexture(), roughness: 0.95, side: THREE.DoubleSide }));
    walk.receiveShadow = true; walk.userData.noCollide = true; walk.userData.noRelief = true; walk.name = 'engineering-sidewalks';
    group.add(walk);
  }
  return group;
}
