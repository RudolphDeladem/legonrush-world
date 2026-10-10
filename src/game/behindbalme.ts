// Behind the Balme Library, from the owner's reference PDF of game views beside street photos
// (docs/CAMPUS_REFERENCE_AUDIT.md, pages 25-34; block engine: blocks.ts; the terrace: relief.ts):
//
// - The Chemistry Department Extension (pages 25-29; its ranges are modelled in physics.ts) stands about 1 m up behind
//   a retaining wall of rubble stone with a concrete cap, a thick clipped hedge along its top; below it a strip of
//   lawn, the kerbed pavement and the road, tall grey street lamps on single arms; on the north side toward Plant
//   Biology palms and young trees before the wall.
// - Across Cruise O'Brien Road from it, where the car park was, the uncompleted building (page 30): a two-floor
//   concrete frame, its walls bare render and its openings empty, under a dark hipped roof, inside a hoarding of blue
//   corrugated sheet hung with posters along the road; a brick-paved forecourt before it; a row of tall columnar
//   ashoka trees on its west.
// - The Chemistry Department's two-floor building, joined to the ranges by the covered walk (pages 31-34): white over
//   a red-brown dado; along its west front toward the drive a verandah on slender white posts under a lean-to of
//   clay tiles, a band of louvres over its openings; the upper floor above it with a row of windows under a hipped
//   tile roof; at the north end a portico of three tall square columns rising the height of both floors before the
//   glazed doors, louvre panels high between them.
import * as THREE from 'three';
import { box, merge, speckle, type Part } from './modelkit';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { concrete, stoneMesh } from './concrete';
import { garden } from './gardens';
import { ashoka } from './biology';
import { hipRoof } from './waccbip';
import { SOLIDS } from './solids';

const TILE = '#a5502f', DADO = '#8e2f22', WHITE = '#f2f0ea';
const hip = { gw: 0, tri: false };
const frame = (O: [number, number]) => ({
  X: (x: number) => x - O[0], Z: (z: number) => z - O[1],
  B: (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(x0 - O[0], x1 - O[0], y0, y1, z0 - O[1], z1 - O[1]),
  M: (x: number, z: number): [number, number] => [x - O[0], z - O[1]],
});
const finish = (k: Kit, c: Part[], st: Part[] = [], strength = 0.25) => {
  stoneMesh(k, st);
  if (!c.length) return;
  const m = new THREE.Mesh(merge(c), concrete(strength));
  m.castShadow = true; m.receiveShadow = true;
  k.meshes.push(m);
};
/** a tall grey street lamp on a single arm reaching out over the road (dx: which way the arm points in x) */
const lamp = (c: Part[], B: ReturnType<typeof frame>['B'], X: (x: number) => number, Z: (z: number) => number, x: number, z: number, dx: number, dz: number) => {
  c.push([new THREE.CylinderGeometry(0.07, 0.12, 8.5, 8).translate(X(x), 4.25, Z(z)), '#9a9ea2']);
  c.push([B(Math.min(x, x + dx * 1.6) - 0.04, Math.max(x, x + dx * 1.6) + 0.04, 8.35, 8.45, Math.min(z, z + dz * 1.6) - 0.04, Math.max(z, z + dz * 1.6) + 0.04), '#9a9ea2']);
  c.push([B(x + dx * 1.6 - 0.25, x + dx * 1.6 + 0.25, 8.25, 8.4, z + dz * 1.6 - 0.12, z + dz * 1.6 + 0.12), '#e9e7da']);
  SOLIDS.add(x, z, 0.18);
};
const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, WHITE) };

// ---------- the Chemistry Department Extension's retaining wall, hedge, pavement and lamps ----------
const CXO: [number, number] = [100, -158];
const WALL_W = 104.2, WALL_N = -153.2;
const cxGrounds: Spec = (() => {
  const { X, Z, B } = frame(CXO);
  return {
    name: 'Chemistry Department Extension terrace', axis: [1, 0], origin: CXO, storey: 3, style: PLAIN, roofColor: TILE, fascia: WHITE, pitch: 0.3,
    blocks: [],
    keep: [[X(100.5), X(107), Z(-153.5), Z(-96)], [X(100.5), X(208), Z(-159), Z(-152.5)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      // the wall of rubble stone up to the terrace, its concrete cap; the hedge along its top
      st.push([B(WALL_W, WALL_W + 0.45, 0, 1.15, WALL_N, -97.0), '#ffffff'], [B(WALL_W, 207.5, 0, 1.15, WALL_N, WALL_N + 0.45), '#ffffff']);
      c.push([B(WALL_W - 0.05, WALL_W + 0.5, 1.15, 1.25, WALL_N - 0.05, -97.0), '#c9c4b8'], [B(WALL_W - 0.05, 207.5, 1.15, 1.25, WALL_N - 0.05, WALL_N + 0.5), '#c9c4b8']);
      k.plain.push([B(WALL_W + 0.6, WALL_W + 2.0, 1.0, 2.55, WALL_N + 0.6, -98.0), '#2f5a26'], [B(WALL_W + 0.6, 206.5, 1.0, 2.55, WALL_N + 0.6, WALL_N + 2.0), '#2f5a26']);
      for (let z = WALL_N + 1; z < -98.5; z += 1.1) k.plain.push([new THREE.IcosahedronGeometry(0.72, 0).scale(1, 0.8, 1.2).translate(X(WALL_W + 1.3), 2.45 + ((z * 7) % 3) * 0.06, Z(z)), (Math.round(z) % 3) ? '#356329' : '#2b5322']);
      for (let x = WALL_W + 1.6; x < 206; x += 1.1) k.plain.push([new THREE.IcosahedronGeometry(0.72, 0).scale(1.2, 0.8, 1).translate(X(x), 2.45 + ((x * 7) % 3) * 0.06, Z(WALL_N + 1.3)), (Math.round(x) % 3) ? '#356329' : '#2b5322']);
      for (let z = WALL_N; z <= -97; z += 0.4) SOLIDS.add(WALL_W + 0.22, z, 0.3);
      for (let x = WALL_W; x <= 207.5; x += 0.4) SOLIDS.add(x, WALL_N + 0.22, 0.3);
      // the strip of lawn, the kerbed pavement of pavers along Cruise O'Brien Road, the lamps over the road
      k.plain.push([B(101.4, WALL_W, 0.02, 0.06, WALL_N - 3, -97), '#9c9384']);
      for (let z = WALL_N - 3; z < -97; z += 0.5) k.plain.push([B(101.4, WALL_W, 0.06, 0.062, z, z + 0.03), '#7f776a']);
      c.push([B(101.2, 101.45, 0, 0.18, WALL_N - 3, -97), '#d6d3cb']);
      for (let z = -150; z < -98; z += 26) lamp(c, B, X, Z, 102.0, z, -1, 0);
      // the north side toward Plant Biology: palms and young trees before the wall, the lamps along J.K.M. Hodasi Road
      k.plain.push([B(104, 207.5, 0.02, 0.05, -159.2, WALL_N), '#5f7d3a']);
      const g = garden([100, 210, -162, -95]); g.reseed(251);
      for (let x = 112; x < 205; x += 11) g.palm(k, X(x), Z(-155.6), 3.4 + (x % 3) * 0.4);
      for (let x = 117.5; x < 200; x += 22) g.tree(k, X(x), Z(-156.4), 0.8);
      for (let x = 125; x < 205; x += 30) lamp(c, B, X, Z, x, -158.8, 0, -1);
      finish(k, c, st);
    },
  };
})();

// ---------- the uncompleted building across the road, in its blue hoarding ----------
const UO: [number, number] = [82, -125];
const UB: [number, number, number, number] = [76.5, 90.5, -142.0, -127.0];
const HOARD: [number, number][] = [[72, -152], [93, -152], [93, -113], [72, -113]];
/** the bare frame: rendered concrete gone grey-beige, its openings empty and dark */
const BARE: Style = {
  bay: 3.6, up: [[62, 50, 132, 130]], ground: [[62, 256 + 50, 132, 150]],
  draw: (g) => {
    render(g, '#cdc3ae');
    speckle(g, 0, 0, 256, 512, 1500, ['rgba(120,110,90,0.25)', 'rgba(170,160,140,0.25)', 'rgba(90,84,72,0.2)']);
    g.fillStyle = '#2a2622'; g.fillRect(62, 50, 132, 130); g.fillRect(62, 256 + 50, 132, 150);
    g.fillStyle = '#b8ae98'; g.fillRect(0, 236, 256, 20);
  },
};
const unfinished: Spec = (() => {
  const { X, Z, B, M } = frame(UO);
  return {
    name: 'uncompleted building behind the Balme Library', axis: [1, 0], origin: UO, storey: 3.4, style: BARE, roofColor: '#3d3633', fascia: '#2e2a28', pitch: 0.42, plinth: '#a9a08c',
    blocks: [{ x0: X(UB[0]), x1: X(UB[1]), z0: Z(UB[2]), z1: Z(UB[3]), floors: 2, roof: 'none' }],
    keep: [[X(66), X(95), Z(-155), Z(-94)]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      const e = k.wallTop(2);
      k.roof.c = new THREE.Color('#3d3633');
      hipRoof(k, M, UB[0] - 0.9, UB[1] + 0.9, UB[2] - 0.9, UB[3] + 0.9, e, 0.42, 'x', [hip, hip], c, '#2e2a28');
      // the frame's columns standing proud at the corners, a scaffold pole or two, the ground of the site
      for (const [x, z] of [[UB[0], UB[2]], [UB[1], UB[2]], [UB[0], UB[3]], [UB[1], UB[3]]]) c.push([B(x - 0.3, x + 0.3, 0, e, z - 0.3, z + 0.3), '#c9bfaa']);
      k.plain.push([B(HOARD[0][0], HOARD[1][0], 0.02, 0.05, HOARD[0][1], HOARD[2][1]), '#8f7a62']);
      for (let i = 0; i < 5; i++) c.push([B(78 + i * 2.6, 78.1 + i * 2.6, 0, 6.5, -126.2, -126.1), '#7d8186']);
      // the blue corrugated hoarding, ribbed, posters along the road side
      for (let i = 0; i < 4; i++) {
        const [ax, az] = HOARD[i], [bx, bz] = HOARD[(i + 1) % 4];
        const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len, ox = uz, oz = -ux;
        c.push([new THREE.BoxGeometry(len, 2.5, 0.06).rotateY(-Math.atan2(bz - az, bx - ax)).translate(X((ax + bx) / 2), 1.25, Z((az + bz) / 2)), '#3f72aa']);
        for (let t = 0.3; t < len; t += 0.3) c.push([new THREE.BoxGeometry(0.05, 2.5, 0.04).translate(X(ax + ux * t + ox * 0.04), 1.25, Z(az + uz * t + oz * 0.04)), '#34618f']);
        const n = Math.ceil(len / 0.4);
        for (let j = 0; j <= n; j++) SOLIDS.add(ax + ((bx - ax) * j) / n, az + ((bz - az) * j) / n, 0.25);
      }
      const posters = ['#e2b42c', '#1d2f6a', '#c23a2e', '#f2f2ee', '#5b2d8a', '#2f8a5a'];
      for (let z = -150; z < -115; z += 1.4) if ((z * 3) % 4 < 2.6) k.plain.push([B(93.05, 93.08, 1.0 + ((z * 7) % 3) * 0.12, 1.75 + ((z * 7) % 3) * 0.12, z, z + 0.85), posters[Math.abs(Math.round(z * 1.3)) % posters.length]]);
      // the brick-paved forecourt before it, kerbed, the way in from the road
      k.plain.push([B(72, 93, 0.02, 0.05, -113, -96.5), '#a08c74']);
      for (let z = -113; z < -96.5; z += 0.45) k.plain.push([B(72, 93, 0.05, 0.052, z, z + 0.03), '#836f59']);
      c.push([B(71.8, 93, 0, 0.16, -96.7, -96.4), '#d9d6ce'], [B(71.7, 72, 0, 0.16, -113, -96.4), '#d9d6ce']);
      // the row of tall columnar ashoka trees on the west (leaving the end of the footpath from the west clear)
      let s = 1;
      for (let z = -151; z < -97; z += 3.4) if (Math.abs(z + 120) > 4) ashoka(k, X(68.6), Z(z), 12 + (s % 3), s++);
      finish(k, c);
    },
  };
})();

// ---------- the Chemistry Department's two-floor building on the covered walk ----------
const CDO: [number, number] = [156.4, -22.4];
const CD: [number, number, number, number] = [151.6, 163.4, -47.9, 3.2];
const VX = 149.4;
/** white over the red-brown dado; a pair of windows to a bay (the ground floor behind the verandah, the floor over it) */
const CD_WALL: Style = {
  bay: 3.2, up: [[30, 70, 90, 116], [136, 70, 90, 116]], ground: [[40, 256 + 60, 70, 130], [146, 256 + 40, 60, 216]],
  draw: (g) => {
    render(g, '#f4f2ec');
    speckle(g, 0, 0, 256, 512, 400, ['rgba(120,116,106,0.1)', 'rgba(150,146,136,0.1)']);
    for (const x of [30, 136]) { g.fillStyle = '#1b1a18'; g.fillRect(x, 70, 90, 116); g.fillStyle = '#f4f2ec'; g.fillRect(x + 43, 70, 4, 116); g.fillRect(x, 120, 90, 4); }
    g.fillStyle = '#1f1d1a'; g.fillRect(40, 256 + 60, 70, 130); g.fillStyle = '#d8d3c6'; g.fillRect(40, 256 + 120, 70, 3);
    g.fillStyle = '#5a3b26'; g.fillRect(146, 256 + 40, 60, 216);
    g.fillStyle = DADO; g.fillRect(0, 512 - 40, 256, 40);
  },
};
const chemDept: Spec = (() => {
  const { X, Z, B, M } = frame(CDO);
  return {
    name: 'Chemistry Department, University of Ghana', axis: [1, 0], origin: CDO, storey: 3.5, style: CD_WALL, roofColor: TILE, fascia: '#efede6', pitch: 0.45, plinth: DADO,
    blocks: [{ x0: X(CD[0]), x1: X(CD[1]), z0: Z(CD[2]), z1: Z(CD[3]), floors: 2, roof: 'none' }],
    keep: [[X(146.5), X(CD[0]), Z(CD[2]), Z(CD[3])]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      const e1 = k.wallTop(1), e2 = k.wallTop(2);
      k.roof.c = new THREE.Color(TILE);
      hipRoof(k, M, CD[0] - 0.9, CD[1] + 0.9, CD[2] - 0.9, CD[3] + 0.9, e2, 0.45, 'z', [hip, hip], c, '#3a2a22');
      // the verandah along the west front: its floor a step up, slender white posts, the band of louvres over the
      // openings, the lean-to of tiles over it falling from under the upper floor's windows
      c.push([B(VX, CD[0], 0, 0.3, CD[2] + 7.5, CD[3]), '#c9c3b5'], [B(VX - 0.05, CD[0], 0, 0.3, CD[2] + 7.5, CD[3]), DADO]);
      for (let z = CD[2] + 8; z <= CD[3] - 0.2; z += 3.2) { c.push([B(VX + 0.05, VX + 0.3, 0.3, e1 - 0.5, z - 0.12, z + 0.12), '#f6f5f0']); SOLIDS.add(VX + 0.17, z, 0.2); }
      c.push([B(VX, CD[0], e1 - 0.95, e1 - 0.5, CD[2] + 7.5, CD[3]), '#f2f0ea']);
      for (let y = e1 - 0.9; y < e1 - 0.55; y += 0.09) k.plain.push([B(VX - 0.03, VX, y, y + 0.05, CD[2] + 7.5, CD[3]), '#3a3632']);
      k.roof.quad([X(VX - 0.6), e1 - 0.45, Z(CD[3] + 0.6)], [X(VX - 0.6), e1 - 0.45, Z(CD[2] + 7.5)], [X(CD[0]), e1 + 0.45, Z(CD[2] + 7.5)], [X(CD[0]), e1 + 0.45, Z(CD[3] + 0.6)]);
      k.roof.quad([X(VX - 0.6), e1 - 0.45, Z(CD[2] + 7.5)], [X(VX - 0.6), e1 - 0.45, Z(CD[3] + 0.6)], [X(CD[0]), e1 + 0.45, Z(CD[3] + 0.6)], [X(CD[0]), e1 + 0.45, Z(CD[2] + 7.5)]);
      c.push([B(VX - 0.65, VX - 0.55, e1 - 0.7, e1 - 0.42, CD[2] + 7.5, CD[3] + 0.6), '#3a2a22']);
      // the portico at the north end: three tall square columns the height of both floors, louvre panels high up
      // between them, a deep white head; the glazed doors behind with grilles; steps up
      const pz0 = CD[2], pz1 = CD[2] + 7.5;
      for (const z of [pz0 + 0.5, (pz0 + pz1) / 2, pz1 - 0.5]) { c.push([B(VX - 2.6, VX - 1.9, 0.3, e2 - 0.4, z - 0.35, z + 0.35), '#f8f7f3']); SOLIDS.add(VX - 2.25, z, 0.4); }
      c.push([B(VX - 2.8, CD[0], e2 - 0.9, e2 - 0.1, pz0 - 0.2, pz1 + 0.2), '#f8f7f3']);
      c.push([B(VX - 2.9, CD[0], 0, 0.3, pz0, pz1), '#c9c3b5'], [B(VX - 3.4, VX - 2.9, 0, 0.15, pz0, pz1), '#b9b3a5']);
      for (const [za, zb] of [[pz0 + 0.85, (pz0 + pz1) / 2 - 0.35], [(pz0 + pz1) / 2 + 0.35, pz1 - 0.85]]) {
        for (let y = e2 - 3.4; y < e2 - 1.0; y += 0.16) k.plain.push([B(VX - 2.3, VX - 2.2, y, y + 0.09, za, zb), '#3a3632']);
        k.plain.push([B(VX - 2.32, VX - 2.18, e2 - 3.45, e2 - 3.35, za, zb), '#f8f7f3']);
      }
      for (const z of [pz0 + 1.8, pz1 - 1.8]) {
        k.plain.push([B(CD[0] - 0.02, CD[0] + 0.02, 0.3, 2.6, z - 0.7, z + 0.7), '#1b1a18']);
        for (let y = 0.5; y < 2.5; y += 0.3) k.plain.push([B(CD[0] - 0.05, CD[0] - 0.02, y, y + 0.05, z - 0.65, z + 0.65), '#8a8a86']);
      }
      for (const z of [pz0 + 3.75]) k.plain.push([B(CD[0] - 0.05, CD[0], e1 + 0.3, e2 - 1.2, z - 1.2, z + 1.2), '#e6d58a']);
      // the drive looping before it, agaves and shrubs, a palm
      const g = garden([135, 170, -55, 10]); g.reseed(261);
      for (const [x, z] of [[146.2, -20], [146.5, -6]]) for (let i = 0; i < 12; i++) k.plain.push([new THREE.ConeGeometry(0.08, 1.2, 3).translate(0, 0.6, 0).rotateZ(0.6).rotateY((i / 12) * Math.PI * 2).translate(X(x), 0, Z(z)), '#6d8f5c']);
      for (const [x, z, r] of [[146.0, -30, 1.1], [146.3, -12, 0.9], [145.8, 1, 1.2]] as [number, number, number][]) k.plain.push([new THREE.IcosahedronGeometry(r, 1).scale(1.2, 0.85, 1).translate(X(x), r * 0.6, Z(z)), '#3f6a2c']);
      g.palm(k, X(144.5), Z(-44), 7.5);
      finish(k, c);
    },
  };
})();

/** behind the Balme Library: the Chemistry Extension's wall and hedge, the uncompleted building, the Chemistry
 *  Department's two-floor building */
export const behindBalmeSite = createSite('behind-balme', [cxGrounds, unfinished, chemDept]);
