// The J.J. Rawlings Avenue corridor between the Okponglo junction and Legon First, from the owner's corridor brief
// (docs/jj-rawlings/ledger.md; numbers in jjplan.ts):
// - the yard west of the avenue (pairs 5, 6; pictures 13, 16): its bare floor, the grey rows (low masses: their use
//   unresolved), the blue-grey sheet-panel enclosure with grey wall portions along the road, the green container, the
//   yellow boom machine; its sheds one storey (labawaleshie.ts), the scrub only in front of the enclosure (okponglo.ts);
// - the east frontage (pairs 2-4): the dusty opening, the one billboard, the open frame fence and gate, the pots and
//   tyre planters, the small slender trees, the grey walking strip along the road, the grey pad south of the opening;
// - the Ghana Revenue Authority frontage (pair 1): the railing on its low wall with the entrance gap, the grey forecourt,
//   the GRA sign; the ground (buildJjGrounds): the yard's and the field's soil, the opening's dust, the earth track.
import * as THREE from 'three';
import { createSite, type Spec, type Style } from './blocks';
import { box, canvas, type Part } from './modelkit';
import { strip } from './medkit';
import { SOLIDS } from './solids';
import { wallSolids } from './enkit';
import { NODE_XZ, ROADS } from './campusmap';
import { coverOverlay, crownTiles, hash2, vnoise2, type Crown } from './scrubkit';
import {
  BOARD, CONTAINER, CRANE, EARTH_BOX, FENCE, FIELD, FRAME, GRA, OPENING, POTS, ROWS, SMALL_TREES, SOUTH_PAD, STRIP, WALL_Z, YARD,
  eastKerb, inYard, type P2,
} from './jjplan';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => { g.fillStyle = '#d8d6cf'; g.fillRect(0, 0, 256, 512); } };
const inPoly = (p: P2[], x: number, z: number) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > z) !== (p[j][1] > z) && x < ((p[j][0] - p[i][0]) * (z - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; };

let PANEL: THREE.MeshStandardMaterial | null = null, POSTER: THREE.MeshStandardMaterial | null = null;
/** blue-grey corrugated sheet, weathered (pair 5) */
const panelMat = () => (PANEL ??= new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.35, side: THREE.DoubleSide, map: (() => {
  const t = canvas(64, 64, (g) => { g.fillStyle = '#6f8ea6'; g.fillRect(0, 0, 64, 64); for (let x = 0; x < 64; x += 8) { g.fillStyle = '#5c7a92'; g.fillRect(x, 0, 3, 64); g.fillStyle = '#86a2b8'; g.fillRect(x + 5, 0, 1, 64); } g.fillStyle = 'rgba(80,60,40,0.18)'; g.fillRect(0, 54, 64, 10); });
  t.wrapS = THREE.RepeatWrapping; return t; })() }));
/** the billboard's poster (its advertisement changes: a purple and white poster, no words copied) */
const posterMat = () => (POSTER ??= new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvas(128, 96, (g) => {
  g.fillStyle = '#f2f0f4'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#6a4fa0'; g.fillRect(0, 0, 128, 30); g.fillRect(8, 40, 70, 8); g.fillRect(8, 54, 90, 6); g.fillRect(8, 66, 60, 6);
  g.fillStyle = '#c9b8e6'; g.beginPath(); g.arc(104, 60, 16, 0, 6.3); g.fill(); g.strokeStyle = '#4a4a4a'; g.lineWidth = 4; g.strokeRect(0, 0, 128, 96);
}) }));

const O: P2 = [860, 900];
/** the roads (any class) near the yard: no stock or machine on them */
const YARD_ROADS = ROADS.map((r) => r.nodes.map((n) => [NODE_XZ[n * 2], NODE_XZ[n * 2 + 1]] as P2)).filter((p) => p.some(([x, z]) => x > 740 && x < 930 && z > 820 && z < 1030));
const nearRoad = (x: number, z: number, hx: number, hz = hx) => YARD_ROADS.some((p) => p.some((q, i) => { if (!i) return false; for (let t = 0; t <= 1; t += 0.1) { const px = p[i - 1][0] + (q[0] - p[i - 1][0]) * t, pz = p[i - 1][1] + (q[1] - p[i - 1][1]) * t; if (Math.abs(px - x) < hx + 3 && Math.abs(pz - z) < hz + 3) return true; } return false; }));
const L = (x: number, z: number): P2 => [x - O[0], z - O[1]];

const corridor: Spec = {
  name: 'J.J. Rawlings Avenue yard and frontages', axis: [1, 0], origin: O, storey: 3, style: PLAIN, roofColor: '#9aa0a3', fascia: '#6d6a64', pitch: 0.2,
  blocks: [], keep: [], onGround: true,
  extras: (k) => {
    const c: Part[] = [], g = (x: number, z: number) => k.ground(x - O[0], z - O[1]);
    // ===== the yard's enclosure: sheet panels on posts, grey wall portions =====
    { const pos: number[] = [], uv: number[] = [], idx: number[] = [];
      for (let i = 1; i < FENCE.length; i++) {
        const [ax, az] = FENCE[i - 1], [bx, bz] = FENCE[i], len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 2.5));
        for (let j = 0; j < n; j++) {
          const x0 = ax + ((bx - ax) * j) / n, z0 = az + ((bz - az) * j) / n, x1 = ax + ((bx - ax) * (j + 1)) / n, z1 = az + ((bz - az) * (j + 1)) / n;
          const y0 = g(x0, z0), y1 = g(x1, z1), [lx0, lz0] = L(x0, z0), [lx1, lz1] = L(x1, z1), zm = (z0 + z1) / 2;
          if (WALL_Z.some(([a, b]) => zm > a && zm < b)) c.push([strip([[lx0, lz0], [lx1, lz1]], Math.min(y0, y1) - 0.3, Math.max(y0, y1) + 2.2, 0.22), '#a7a59e']);
          else {
            const h = 2.3 + hash2(j, i) * 0.25, b = pos.length / 3;
            pos.push(lx0, y0 + 0.05, lz0, lx1, y1 + 0.05, lz1, lx1, y1 + h, lz1, lx0, y0 + h, lz0); uv.push(0, 0, 2.5, 0, 2.5, 1, 0, 1); idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
            c.push([box(lx0 - 0.06, lx0 + 0.06, y0 - 0.2, y0 + h + 0.1, lz0 - 0.06, lz0 + 0.06), '#5f6467']);
          }
          wallSolids(x0, z0, x1, z1, 0.2);
        }
      }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, panelMat()); m.castShadow = true; k.meshes.push(m); }
    // ===== the grey rows: low masses in their groups (their use unresolved) =====
    for (const [gi, { box: [x0, x1, z0, z1], along, step }] of ROWS.entries()) {
      const [a0, a1, b0, b1] = along === 'x' ? [x0, x1, z0, z1] : [z0, z1, x0, x1];
      for (let w = b0 + 1.2; w < b1 - 1; w += step) for (let s = a0; s < a1 - 2; s += 6.5) {
        const e = Math.min(a1, s + 5.8), hh = 0.9 + hash2(w * 3 + gi, s) * 0.6, [cx, cz] = along === 'x' ? [(s + e) / 2, w] : [w, (s + e) / 2];
        if (Math.hypot(cx - CRANE[0], cz - CRANE[1]) < 7 || !inYard(cx, cz) || nearRoad(cx, cz, (along === 'x' ? (e - s) / 2 : 1.2) + 3.2, along === 'x' ? 1.2 : (e - s) / 2)) continue;
        const y = g(cx, cz), [lx, lz] = L(cx, cz), hx = along === 'x' ? (e - s) / 2 : 1.2, hz = along === 'x' ? 1.2 : (e - s) / 2;
        c.push([box(lx - hx, lx + hx, y, y + hh, lz - hz, lz + hz), hash2(s, w) < 0.5 ? '#8f989e' : '#a2a9ae'], [box(lx - hx + 0.1, lx + hx - 0.1, y + hh, y + hh + 0.04, lz - hz + 0.1, lz + hz - 0.1), '#b5bbbf']);
        SOLIDS.add(cx, cz, Math.min(hx, hz) + 0.2);
      }
    }
    // ===== the green container-like volume by the enclosure =====
    { const [x, z] = CONTAINER, y = g(x, z), [lx, lz] = L(x, z);
      c.push([box(lx - 1.22, lx + 1.22, y, y + 2.6, lz - 3.05, lz + 3.05), '#3e7a48']);
      for (let i = -5; i <= 5; i++) c.push([box(lx - 1.24, lx + 1.24, y + 0.1, y + 2.5, lz + i * 0.55 - 0.04, lz + i * 0.55 + 0.04), '#346b3e']);
      wallSolids(x, z - 3, x, z + 3, 1.3); }
    // ===== the yellow boom machine: carrier, cab, wheels, the boom raised over the enclosure (pairs 5, 6) =====
    { const [x, z] = CRANE, y = g(x, z), [lx, lz] = L(x, z), Y = '#e2b21d';
      c.push([box(lx - 1.3, lx + 1.3, y + 0.9, y + 2.0, lz - 4.8, lz + 4.8), Y], [box(lx - 1.25, lx + 1.25, y + 2.0, y + 3.3, lz - 4.6, lz - 2.6), '#d9a816'], [box(lx - 1.1, lx + 0.2, y + 2.0, y + 3.0, lz + 0.5, lz + 3.4), Y]);
      c.push([box(lx - 1.0, lx + 0.1, y + 2.3, y + 2.9, lz - 4.65, lz - 4.62), '#2a3238']);
      for (const s of [-1, 1]) for (const dz of [-3.6, -2.2, 2.2, 3.6]) c.push([new THREE.CylinderGeometry(0.55, 0.55, 0.45, 12).rotateZ(Math.PI / 2).translate(lx + s * 1.25, y + 0.55, lz + dz), '#1f2224']);
      // the boom: a tapering box from the pivot at the carrier's rear up toward the north-east (55 degrees), the hook rope
      const L0 = 17, a = (55 * Math.PI) / 180, dir = new THREE.Vector3(0.35, Math.sin(a), -Math.cos(a)).normalize();
      const bg = new THREE.BoxGeometry(0.7, L0, 0.8).translate(0, L0 / 2, 0); bg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
      c.push([bg.translate(lx, y + 3.0, lz + 2.5), Y]);
      const tip = new THREE.Vector3(lx, y + 3.0, lz + 2.5).addScaledVector(dir, L0);
      c.push([new THREE.CylinderGeometry(0.03, 0.03, tip.y - y - 5, 4).translate(tip.x, (tip.y + y + 5) / 2, tip.z), '#222'], [box(tip.x - 0.2, tip.x + 0.2, y + 4.6, y + 5.1, tip.z - 0.2, tip.z + 0.2), '#2a2a2a']);
      SOLIDS.add(x, z, 1.6); SOLIDS.add(x, z - 3.5, 1.4); SOLIDS.add(x, z + 3.5, 1.4); }

    // ===== the east frontage: the grey walking strip along the kerb =====
    { const pts: P2[] = [];
      for (let z = STRIP.z0; z <= STRIP.z1; z += 2) { const e = eastKerb(z); if (!Number.isNaN(e)) pts.push(L(e + 0.1 + STRIP.w / 2, z)); }
      c.push([strip(pts, 0.02, 0.09, STRIP.w), '#a9a7a0']);
      for (let z = STRIP.z0; z <= STRIP.z1; z += 1.5) { const e = eastKerb(z); if (Number.isNaN(e)) continue; const [lx, lz] = L(e + 0.1 + STRIP.w / 2, z); c.push([box(lx - STRIP.w / 2, lx + STRIP.w / 2, 0.09, 0.095, lz - 0.03, lz + 0.03), '#8e8c86']); } }
    // ===== the billboard: one pole, its frame and poster, the back and edges plain (pairs 2, 3, 4) =====
    { const [x, z] = BOARD.at, y = g(x, z), [lx, lz] = L(x, z), [fx, fz] = BOARD.face, ry = Math.atan2(fx, fz);
      c.push([new THREE.CylinderGeometry(0.22, 0.28, BOARD.y + 0.4, 10).translate(lx, y + (BOARD.y + 0.4) / 2, lz), '#7d8186']);
      const frame = new THREE.BoxGeometry(BOARD.w + 0.3, BOARD.h + 0.3, 0.35).rotateY(ry).translate(lx, y + BOARD.y + BOARD.h / 2, lz);
      c.push([frame, '#5a5e63']);
      const face = new THREE.PlaneGeometry(BOARD.w, BOARD.h).rotateY(ry).translate(lx + fx * 0.19, y + BOARD.y + BOARD.h / 2, lz + fz * 0.19);
      k.meshes.push(new THREE.Mesh(face, posterMat()));
      SOLIDS.add(x, z, 0.4); }
    // ===== the open frame fence behind the pots and its framed gate: slender posts and rails, gaps between =====
    { const [[ax, az], [bx, bz]] = FRAME, len = Math.hypot(bx - ax, bz - az), n = Math.round(len / 2.4);
      for (let i = 0; i <= n; i++) { const x = ax + ((bx - ax) * i) / n, z = az + ((bz - az) * i) / n, y = g(x, z), [lx, lz] = L(x, z); c.push([box(lx - 0.05, lx + 0.05, y, y + 1.7, lz - 0.05, lz + 0.05), '#6b5a48']); }
      for (const h of [0.5, 1.5]) c.push([strip([L(ax, az), L(bx, bz)], g(ax, az) + h, g(ax, az) + h + 0.06, 0.05), '#6b5a48']);
      // the framed gate at the east end, open (a rectangle of tube, swung back)
      const [gx, gz] = L(bx + 0.5, bz + 1.6), gy = g(bx, bz);
      for (const [x0, x1, y0, y1] of [[0, 0.06, 0, 1.8], [2.4, 2.46, 0, 1.8], [0, 2.46, 1.74, 1.8], [0, 2.46, 0.2, 0.26]]) c.push([box(gx + x0 * 0.2, gx + x1 * 0.2 + 0.05, gy + y0, gy + y1, gz + x0, gz + x1), '#6b5a48']);
      wallSolids(ax, az, bx, bz, 0.12); }
    // ===== the pots and tyre planters with small plants, clustered (pairs 2, 4) =====
    for (const [[ax, az], [bx, bz]] of POTS) {
      const len = Math.hypot(bx - ax, bz - az);
      for (let t = 0; t < len; t += 0.75) {
        const x = ax + ((bx - ax) * t) / len + (hash2(t, ax) - 0.5) * 0.6, z = az + ((bz - az) * t) / len + (hash2(ax, t) - 0.5) * 0.6, y = g(x, z), [lx, lz] = L(x, z), r = hash2(t, az);
        if (r < 0.35) c.push([new THREE.TorusGeometry(0.32, 0.13, 6, 12).rotateX(Math.PI / 2).translate(lx, y + 0.13, lz), '#232323']);
        else c.push([new THREE.CylinderGeometry(0.22 + r * 0.12, 0.16 + r * 0.08, 0.35 + r * 0.25, 10).translate(lx, y + 0.2 + r * 0.12, lz), ['#c0612f', '#a8502a', '#d98a3c', '#8a4a2e'][Math.floor(r * 4)]]);
        c.push([new THREE.IcosahedronGeometry(0.28 + hash2(z, t) * 0.25, 0).scale(1, 1.3, 1).translate(lx, y + 0.7 + r * 0.2, lz), hash2(x, z) < 0.5 ? '#4f7a32' : '#5f8a3a']);
      }
    }
    // ===== the grey pad south of the opening; the GRA's forecourt, railing on its low wall, the entrance gap, its sign =====
    { const [x0, x1, z0, z1] = SOUTH_PAD, [a0, b0] = L(x0, z0), [a1, b1] = L(x1, z1); c.push([box(a0, a1, 0.01, 0.08, b0, b1), '#a3a19b']); }
    { const [x0, x1, z0, z1] = GRA.pave, [a0, b0] = L(x0, z0), [a1, b1] = L(x1, z1); c.push([box(a0, a1, 0.01, 0.08, b0, b1), '#9e9c96']);
      const [gp0, gp1] = GRA.gap;
      for (const [s0, s1] of [[GRA.z0, gp0], [gp1, GRA.z1]] as P2[]) {
        const [lx, la] = L(GRA.x, s0), [, lb] = L(GRA.x, s1), y = g(GRA.x, (s0 + s1) / 2);
        c.push([box(lx - 0.15, lx + 0.15, y - 0.1, y + 0.55, la, lb), '#d9d4c6'], [box(lx - 0.04, lx + 0.04, y + 1.55, y + 1.6, la, lb), '#3f4448']);
        for (let z = s0; z <= s1 + 0.01; z += 0.25) { const [, l] = L(GRA.x, z); c.push([box(lx - 0.015, lx + 0.015, y + 0.55, y + 1.58, l - 0.015, l + 0.015), '#3f4448']); }
        for (let z = s0; z <= s1 + 0.01; z += 2.5) { const [, l] = L(GRA.x, z); c.push([box(lx - 0.2, lx + 0.2, y - 0.1, y + 1.7, l - 0.2, l + 0.2), '#d9d4c6']); }
        wallSolids(GRA.x, s0, GRA.x, s1, 0.2);
      }
      const [sx, sz] = GRA.sign, y = g(sx, sz), [lx, lz] = L(sx, sz);
      c.push([box(lx - 0.06, lx + 0.06, y, y + 3.4, lz - 0.06, lz + 0.06), '#8d9296'], [box(lx - 0.08, lx - 0.02, y + 1.9, y + 3.3, lz - 0.6, lz + 0.6), '#1f4e9b']);
      k.signs.push({ text: 'GRA', x: lx - 0.09, y: y + 2.9, z: lz, ry: -Math.PI / 2, w: 1.0, colors: ['#1f4e9b', '#ffffff'] });
      SOLIDS.add(sx, sz, 0.2); }
    k.plain.push(...c);
  },
};

/** the J.J. Rawlings Avenue corridor */
export const jjSite = createSite('jj-rawlings', [corridor]);

// ======================================================================================================
// the ground and the planting (world frame)
// ======================================================================================================
const TRACKS = ROADS.map((r) => r.nodes.map((n) => [NODE_XZ[n * 2], NODE_XZ[n * 2 + 1]] as P2)).filter((p) => p.some(([x, z]) => x > EARTH_BOX[0] && x < EARTH_BOX[1] && z > EARTH_BOX[2] && z < EARTH_BOX[3]));
const segD = (x: number, z: number, [ax, az]: P2, [bx, bz]: P2) => { const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)); return Math.hypot(x - ax - dx * f, z - az - dz * f); };
/** distance to the earth track (roads 30 and 1516 inside EARTH_BOX) */
export const jjTrackDist = (x: number, z: number) => {
  if (x < EARTH_BOX[0] || x > EARTH_BOX[1] || z < EARTH_BOX[2] || z > EARTH_BOX[3]) return Infinity;
  let b = Infinity; for (const p of TRACKS) for (let i = 1; i < p.length; i++) b = Math.min(b, segD(x, z, p[i - 1], p[i])); return b;
};
export function buildJjGrounds() {
  const group = new THREE.Group();
  group.name = 'jj-rawlings-grounds';
  const color = (x: number, z: number): [number, number, number, number] | null => {
    const n = vnoise2(x / 7, z / 7), m = vnoise2(x / 2.2 + 3, z / 2.2), t = hash2(Math.floor(x * 2), Math.floor(z * 2)) * 0.06;
    if (jjTrackDist(x, z) < 2 + (m - 0.5) * 0.6) return [170 - t * 200, 120 - t * 140, 82 - t * 90, 0.95];
    // the yard: pale compacted soil, darker where worked
    if (inYard(x, z)) return n > 0.68 ? [150 - t * 200, 128 - t * 160, 96 - t * 100, 0.95] : [196 - t * 200, 170 - t * 160, 128 - t * 100, 0.95];
    // the dusty opening: tan, a little red, grit
    if (inPoly(OPENING, x, z)) return [192 - t * 200, 150 - t * 160, 108 - t * 100, 0.95];
    // the field west of the yard: dry grass and bare patches, no pitch
    if (inPoly(FIELD, x, z)) return n > 0.5 ? [176 - t * 200, 146 - t * 150, 104 - t * 100, 0.85] : [138, 128, 74, 0.7];
    return null;
  };
  const cellIn = (x: number, z: number) => inYard(x, z) || inPoly(FIELD, x, z) || inPoly(OPENING, x, z) || jjTrackDist(x, z) < 3;
  const soil = [...coverOverlay({ box: [720, 920, 830, 1070], mpp: 0.5, cell: 2, tile: 100, color, cellIn }), ...coverOverlay({ box: [926, 992, 760, 824], mpp: 0.5, cell: 2, tile: 66, color, cellIn }), ...coverOverlay({ box: [826, 872, 1070, 1241], mpp: 0.5, cell: 2, tile: 86, color, cellIn })];
  for (const m of soil) m.userData.noRelief = true;
  group.add(...soil);
  // the small slender roadside trees on the east frontage (pair 4); the scrub at the yard's north edge stays generic
  const crowns: Crown[] = SMALL_TREES.map(([x, z], i) => ({ x, z, r: 1.6 + hash2(x, z) * 0.9, h: 2.2 + hash2(z, x) * 0.8, base: 2.2 + hash2(i, 3) * 0.8, trunk: 0.12, color: ['#4e7a32', '#5b8438', '#456f2e'][i % 3], seed: hash2(x, i), solid: true }));
  group.add(...crownTiles(crowns, 100, 75));
  return group;
}
