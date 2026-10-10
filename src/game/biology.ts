// Round the front of the N Block, from the owner's aerial with eleven numbered views (registered to the N Block and the
// GCB Lecture Building at 0.297 m/px) and a PDF of street photos for each view (block engine: blocks.ts):
//
// - The two biology complexes (view 8: the owner says they are the same design): the Department of Animal Biology and
//   Conservation Science west of the avenue (labs.ts uses the ranges here) and the Department of Plant and
//   Environmental Biology east of it. Long one-floor ranges round lawned courts, white with a red-brown band at their
//   foot, brown wooden windows of small panes, a row of small dark vents under the eaves, old orange-red tile hip roofs;
//   along the court sides a verandah under the roof on square white columns with red-brown feet, its floor a step up.
// - Plant Biology's entrance (views 9 to 11) in the open court on its west: a raised paved terrace behind walls of
//   rubble stone, steps up the middle, beds with Norfolk Island pines, clipped round trees and potted plants, a bench;
//   the glazed double door lit in its brown frame; the parking bays before it.
// - The Centre for Biodiversity Conservation Research (view 2): the long range along the north of Animal Biology, on a
//   base of rubble stone, its east end a white gable under old dark brown tiles with a deep brown timber fascia, brown
//   wooden windows, the red stair with black railings up to its north door; before it to the east the forecourt with
//   the board, beds faced in rubble stone, steps up to a gate in a white screen of pierced blocks.
// - Along Ebenezer Laing Road (view 3): the row of weeping ashoka trees (Polyalthia) before the complex.
// - The Ocean Margins Initiative (view 6; Department of Marine and Fisheries Sciences): a white flat-roofed box with a
//   deep fascia carrying its name, a red-brown base, a white-framed glass door, a blue plaque; the blue shed with a red
//   roof beside it; ashoka trees.
// - The lane past the Department of Nutrition and Food Sciences (view 7): its lawn held up behind a wall of rubble stone.
// - The avenue (view 1): two carriageways, between them a grass median edged by strips of brick paving, conifers, lamps.
import * as THREE from 'three';
import { box, canvas, merge, speckle, tri2, type Part } from './modelkit';
import { createSite, render, type Block, type Face, type Kit, type Spec, type Style } from './blocks';
import { concrete, panel, pierced, stoneMesh } from './concrete';
import { garden } from './gardens';
import { SOLIDS } from './solids';
import { hipRoof } from './waccbip';

type R4 = [number, number, number, number];
const WHITE = '#f2f1ec', BASE = '#8a3a2a', WOODF = '#4a2c1c', TILE = '#b5603f';
const hip = { gw: 0, tri: false }, open = { gw: 99, tri: false };

// ---------- the biology ranges (view 8) ----------
/** a brown wooden window of small panes: a frame, mullions and transoms, glass behind */
const paneWin = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = 'rgba(90,80,70,0.3)'; g.fillRect(x - 6, y - 5, w + 12, h + 10);
  g.fillStyle = WOODF; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  const gl = g.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, '#5f6c74'); gl.addColorStop(1, '#22282c');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = WOODF;
  for (let i = 1; i < 3; i++) g.fillRect(x + (w * i) / 3 - 2, y, 4, h);
  for (let j = 1; j < 4; j++) g.fillRect(x, y + (h * j) / 4 - 2, w, 4);
  g.fillStyle = '#ece9e1'; g.fillRect(x - 7, y + h + 4, w + 14, 5);
};
/** the small dark vents in a row under the eaves */
const vents = (g: CanvasRenderingContext2D) => { g.fillStyle = '#2a2622'; for (let x = 30; x < 250; x += 64) g.fillRect(x, 256 + 14, 22, 12); };
const base = (g: CanvasRenderingContext2D) => { g.fillStyle = BASE; g.fillRect(0, 512 - 40, 256, 40); speckle(g, 0, 512 - 40, 256, 40, 80, ['#7a3020', '#9a4430']); };
/** the outer walls: a window to a bay */
export const BIO_WALL: Style = {
  bay: 3.2, up: [], ground: [[80, 256 + 70, 96, 116]],
  draw: (g) => { render(g, WHITE); speckle(g, 0, 0, 256, 512, 500, ['rgba(130,124,110,0.15)']); vents(g); paneWin(g, 80, 256 + 70, 96, 116); base(g); },
};
/** behind the verandah: a brown door and a window by turns */
export const BIO_VER: Style = {
  bay: 3.4, up: [], ground: [[24, 256 + 52, 66, 164], [124, 256 + 70, 104, 116]],
  draw: (g) => {
    render(g, WHITE); speckle(g, 0, 0, 256, 512, 400, ['rgba(130,124,110,0.12)']); vents(g);
    g.fillStyle = '#3a2418'; g.fillRect(24, 256 + 52, 66, 164); g.fillStyle = '#5a3826'; g.fillRect(29, 256 + 57, 56, 159);
    g.fillStyle = '#2a1a12'; g.fillRect(56, 256 + 57, 2, 159);
    paneWin(g, 124, 256 + 70, 104, 116); base(g);
  },
};
export interface BioRange { r: R4; ver?: Face[] }
/** the verandah's depth */
export const VER_D = 2.4;
/** the ranges as blocks (model frame through X, Z): their walls set back behind the verandahs; roofs drawn by bioParts */
export function bioBlocks(X: (x: number) => number, Z: (z: number) => number, ranges: BioRange[]): Block[] {
  return ranges.map(({ r, ver = [] }) => {
    const [x0, x1, z0, z1] = [r[0] + (ver.includes('x0') ? VER_D : 0), r[1] - (ver.includes('x1') ? VER_D : 0), r[2] + (ver.includes('z0') ? VER_D : 0), r[3] - (ver.includes('z1') ? VER_D : 0)];
    const faces: Partial<Record<Face, Style>> = {};
    for (const f of ver) faces[f] = BIO_VER;
    return { x0: X(x0), x1: X(x1), z0: Z(z0), z1: Z(z1), floors: 1, roof: 'none' as const, faces };
  });
}
/** the roofs over the whole ranges (verandahs included) and the verandahs: columns, floor, beam */
export function bioParts(k: Kit, O: [number, number], ranges: BioRange[], c: Part[], roof = TILE) {
  const M = (x: number, z: number): [number, number] => [x - O[0], z - O[1]];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(x0 - O[0], x1 - O[0], y0, y1, z0 - O[1], z1 - O[1]);
  const e = k.wallTop(1);
  k.roof.c = new THREE.Color(roof);
  for (const { r, ver = [] } of ranges) {
    const along = r[1] - r[0] >= r[3] - r[2] ? 'x' : 'z';
    hipRoof(k, M, r[0] - 0.6, r[1] + 0.6, r[2] - 0.6, r[3] + 0.6, e, 0.42, along, [hip, hip], c, '#f0eee8');
    for (const f of ver) {
      // the edge the columns stand on, and the strip under the verandah
      const alongX = f === 'z0' || f === 'z1';
      const edge = f === 'x0' ? r[0] + 0.25 : f === 'x1' ? r[1] - 0.25 : f === 'z0' ? r[2] + 0.25 : r[3] - 0.25;
      const [a0, a1] = alongX ? [r[0], r[1]] : [r[2], r[3]];
      const s = f === 'x0' || f === 'z0' ? 1 : -1;
      const [d0, d1] = [Math.min(edge - s * 0.25, edge - s * 0.25 + s * VER_D), Math.max(edge - s * 0.25, edge - s * 0.25 + s * VER_D)];
      c.push(alongX ? [B(a0, a1, 0, 0.22, d0, d1), '#cfc9bc'] : [B(d0, d1, 0, 0.22, a0, a1), '#cfc9bc']);
      c.push(alongX ? [B(a0, a1, 0, 0.22, edge - 0.06, edge + 0.06), BASE] : [B(edge - 0.06, edge + 0.06, 0, 0.22, a0, a1), BASE]);
      c.push(alongX ? [B(a0, a1, e - 0.4, e, edge - 0.18, edge + 0.18), WHITE] : [B(edge - 0.18, edge + 0.18, e - 0.4, e, a0, a1), WHITE]);
      const n = Math.max(1, Math.round((a1 - a0) / 3.4));
      for (let i = 0; i <= n; i++) {
        const t = a0 + 0.3 + ((a1 - a0 - 0.6) * i) / n;
        const [x, z] = alongX ? [t, edge] : [edge, t];
        c.push([B(x - 0.17, x + 0.17, 0.22, e - 0.4, z - 0.17, z + 0.17), WHITE], [B(x - 0.19, x + 0.19, 0.22, 0.75, z - 0.19, z + 0.19), BASE]);
        SOLIDS.add(x, z, 0.25);
      }
    }
  }
}

/** a verandah along an outer face (the owner's corrections PDF, page 2: the range's front toward the road stands
 *  behind a row of square white pillars with red-brown feet under the roof carried out over them): from a0 to a1 along
 *  the face at `wall` (x, or z when alongX), reaching out on side s (+1 or -1) */
export function frontVerandah(k: Kit, O: [number, number], c: Part[], a0: number, a1: number, wall: number, s: number, alongX: boolean, roof = TILE) {
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(x0 - O[0], x1 - O[0], y0, y1, z0 - O[1], z1 - O[1]);
  const P = (a: number, d: number, y: number): [number, number, number] => (alongX ? [a - O[0], y, wall + s * d - O[1]] : [wall + s * d - O[0], y, a - O[1]]);
  const R = (a0_: number, a1_: number, d0: number, d1: number, y0: number, y1: number) => {
    const [lo, hi] = [Math.min(wall + s * d0, wall + s * d1), Math.max(wall + s * d0, wall + s * d1)];
    return alongX ? B(a0_, a1_, y0, y1, lo, hi) : B(lo, hi, y0, y1, a0_, a1_);
  };
  const e = k.wallTop(1), D = 2.2, edge = D - 0.25;
  // the floor a step up, its red-brown edge; the beam over the pillars; the roof carried out over them
  c.push([R(a0, a1, 0, D, 0, 0.22), '#cfc9bc'], [R(a0, a1, edge - 0.06, edge + 0.06, 0, 0.22), BASE]);
  c.push([R(a0, a1, edge - 0.18, edge + 0.18, e - 0.55, e - 0.2), WHITE]);
  // the boarded ceiling under the roof, shading the wall behind the pillars
  c.push([R(a0, a1, 0, D, e - 0.3, e - 0.2), '#6a5a4c']);
  k.roof.c = new THREE.Color(roof);
  const q = (a: number, b: number) => (s > 0) === alongX ? [P(b, 0, e + 0.15), P(a, 0, e + 0.15), P(a, D + 0.4, e - 0.45), P(b, D + 0.4, e - 0.45)] : [P(a, 0, e + 0.15), P(b, 0, e + 0.15), P(b, D + 0.4, e - 0.45), P(a, D + 0.4, e - 0.45)];
  k.roof.quad(...(q(a0 - 0.3, a1 + 0.3) as [[number, number, number], [number, number, number], [number, number, number], [number, number, number]]));
  const n = Math.max(1, Math.round((a1 - a0) / 3.4));
  for (let i = 0; i <= n; i++) {
    const t = a0 + 0.3 + ((a1 - a0 - 0.6) * i) / n;
    c.push([R(t - 0.17, t + 0.17, edge - 0.17, edge + 0.17, 0.22, e - 0.55), WHITE], [R(t - 0.19, t + 0.19, edge - 0.19, edge + 0.19, 0.22, 0.75), BASE]);
    const [wx, wz] = alongX ? [t, wall + s * edge] : [wall + s * edge, t];
    SOLIDS.add(wx, wz, 0.25);
  }
}

/** a weeping ashoka tree (Polyalthia longifolia, owner's views 3 and 6): a tall narrow column of drooping foliage */
export function ashoka(k: Kit, x: number, z: number, h: number, seed: number) {
  const y = k.ground(x, z), r0 = 1.05 + (seed % 3) * 0.12;
  k.plain.push([new THREE.CylinderGeometry(0.1, 0.16, 1.4, 6).translate(x, y + 0.7, z), '#5a4636']);
  // a narrow column of drooping foliage, near-straight sides, rounding to a point at the top; the leaves hang in
  // skirts, each a little wider at its foot, in two greens
  const tiers = 9;
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers, t1 = (i + 1) / tiers;
    const rb = r0 * (t < 0.65 ? 1 - t * 0.18 : (1 - 0.65 * 0.18) * (1 - (t - 0.65) / 0.38));
    const rt = rb * 0.78, hh = (h - 1.0) / tiers + 0.35, yy = y + 1.0 + (h - 1.0) * t;
    const col = ['#2f4f27', '#3a5e2e', '#2a4523'][(i + seed) % 3];
    k.plain.push([new THREE.CylinderGeometry(Math.max(0.08, rt), Math.max(0.15, rb), hh, 9, 1, false).translate(x + ((i * 7 + seed) % 3 - 1) * 0.06, yy + hh / 2, z), col]);
    void t1;
  }
  k.plain.push([new THREE.ConeGeometry(0.28, 0.9, 7).translate(x, y + h + 0.35, z), '#3a5e2e']);
}

// ---------- the Department of Plant and Environmental Biology (views 8 to 11) ----------
const PO: [number, number] = [80, -210];
const PLANT: BioRange[] = [
  { r: [38.8, 129.2, -242.9, -229.4], ver: ['z1'] },
  { r: [35.4, 38.8, -240.5, -231.3] }, { r: [129.2, 130.9, -240.8, -231.6] },
  { r: [51.7, 65.5, -229.4, -205.4], ver: ['x1'] },
  { r: [108.3, 122.3, -229.4, -205.4], ver: ['x0'] },
  { r: [38.9, 190.2, -205.4, -191.4], ver: ['z0'] },
  { r: [35.5, 38.9, -203.0, -193.3] },
  { r: [51.7, 65.6, -191.4, -176.3] }, { r: [108.5, 122.2, -191.4, -176.5] },
];
const plant: Spec = (() => {
  const X = (x: number) => x - PO[0], Z = (z: number) => z - PO[1];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
  return {
    name: 'Department of Plant and Environmental Biology', axis: [1, 0], origin: PO, storey: 3.5, style: BIO_WALL, roofColor: TILE, fascia: '#f0eee8', pitch: 0.42, plinth: BASE,
    replaces: [[80, -198]],
    blocks: bioBlocks(X, Z, PLANT),
    keep: [[X(22), X(51.7), Z(-232), Z(-200)], [X(65.5), X(108.3), Z(-229.4), Z(-205.4)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      bioParts(k, PO, PLANT, c);
      // the front toward J.K.M. Hodasi Road and the Chemistry Extension (the owner's corrections PDF, page 2): the long
      // range's south face behind its row of pillars, between the wings standing out south
      for (const [a0, a1] of [[38.9, 51.7], [65.6, 108.5], [122.2, 190.2]]) frontVerandah(k, PO, c, a0, a1, -191.4, 1, true);
      // ----- the entrance (views 9 to 11) in the open court on the west: the terrace, its rubble-stone walls, the steps
      const tx0 = 45.0, tx1 = 51.7, tz0 = -228.8, tz1 = -205.8, th = 0.75, sz0 = -219.2, sz1 = -214.8;
      c.push([B(tx0, tx1, 0, th, tz0, tz1), '#cfc9bc']);
      for (const [a, b] of [[tz0, sz0], [sz1, tz1]]) {
        st.push([B(tx0 - 0.35, tx0, 0, th + 0.55, a, b), '#ffffff']);
        c.push([B(tx0 - 0.4, tx0 + 0.05, th + 0.55, th + 0.62, a, b), '#c9c4b8']);
        for (let z = a; z <= b; z += 0.4) SOLIDS.add(tx0 - 0.2, z, 0.25);
      }
      for (let i = 0; i < 4; i++) c.push([B(tx0 - 0.4 - (i + 1) * 0.32, tx0 - 0.4 - i * 0.32, 0, th - i * 0.19, sz0, sz1), '#d6d0c4']);
      st.push([B(tx0 - 1.7, tx0, 0, th + 0.05, sz0 - 0.3, sz0), '#ffffff'], [B(tx0 - 1.7, tx0, 0, th + 0.05, sz1, sz1 + 0.3), '#ffffff']);
      // the beds on the terrace, the pines, the clipped trees, the pots, a bench
      const g = garden([20, 135, -250, -170]); g.reseed(131);
      for (const [a, b] of [[tz0 + 0.4, sz0 - 1.0], [sz1 + 1.0, tz1 - 0.4]]) {
        st.push([B(tx0 + 0.2, tx0 + 2.2, th, th + 0.45, a, b), '#ffffff']);
        k.plain.push([B(tx0 + 0.35, tx0 + 2.05, th + 0.45, th + 0.48, a + 0.15, b - 0.15), '#4a3a2c']);
      }
      for (const z of [tz0 + 2.5, tz1 - 2.5]) { pine(k, X(tx0 + 1.2), Z(z), 9.5, th + 0.45); SOLIDS.add(tx0 + 1.2, z, 0.4); }
      for (const z of [sz0 - 3.2, sz1 + 3.2]) k.plain.push([new THREE.IcosahedronGeometry(1.25, 1).scale(1, 1.3, 1).translate(X(tx0 + 1.2), th + 0.45 + 1.6, Z(z)), '#4f5a2e'], [new THREE.CylinderGeometry(0.08, 0.1, 0.8, 6).translate(X(tx0 + 1.2), th + 0.85, Z(z)), '#4e3d30']);
      for (const z of [sz0 - 0.6, sz1 + 0.6, tz0 + 5, tz1 - 5]) k.plain.push([new THREE.CylinderGeometry(0.24, 0.17, 0.42, 10).translate(X(tx0 + 0.25), th + 0.21, Z(z)), '#b4593a'], [new THREE.IcosahedronGeometry(0.3, 0).translate(X(tx0 + 0.25), th + 0.6, Z(z)), '#4f8a35']);
      c.push([B(tx0 + 2.6, tx0 + 3.1, th + 0.42, th + 0.48, tz1 - 3.2, tz1 - 1.4), '#6b5444']);
      // the glazed double door in its brown frame, lit, under the verandah's porch
      const dx = 51.7, dz = (sz0 + sz1) / 2;
      k.plain.push([B(dx - 0.05, dx, th, th + 2.7, dz - 1.4, dz + 1.4), WOODF]);
      for (const zz of [dz - 0.68, dz + 0.68]) k.plain.push([B(dx - 0.07, dx - 0.05, th + 0.1, th + 2.6, zz - 0.6, zz + 0.6), '#f4e2b0']);
      for (const zz of [dz - 0.68, dz + 0.68]) for (let y = th + 0.5; y < th + 2.6; y += 0.42) k.plain.push([B(dx - 0.09, dx - 0.07, y - 0.02, y + 0.02, zz - 0.6, zz + 0.6), WOODF]);
      k.plain.push([B(dx - 0.09, dx - 0.07, th + 0.1, th + 2.6, dz - 0.03, dz + 0.03), WOODF]);
      // the asphalt before it, its parking bays (empty, as the photos show)
      k.plain.push([B(24.5, tx0 - 1.8, 0.02, 0.05, -231, -203), '#4b4c4e']);
      for (let z = -230.5; z <= -203.5; z += 2.7) k.plain.push([B(32.5, tx0 - 1.9, 0.05, 0.055, z - 0.05, z + 0.05), '#e8e8e4']);
      // the big tree in a round kerbed bed at the north-west corner (view 11), the court's round bed, trees in the courts
      k.plain.push([new THREE.CylinderGeometry(2.4, 2.4, 0.3, 24).translate(X(31.5), 0.15, Z(-236.5)), '#d8d4ca'], [new THREE.CylinderGeometry(2.2, 2.2, 0.32, 24).translate(X(31.5), 0.16, Z(-236.5)), '#3f5a2c']);
      g.tree(k, X(31.5), Z(-236.5), 2.6);
      k.plain.push([new THREE.TorusGeometry(2.2, 0.12, 6, 24).rotateX(Math.PI / 2).translate(X(92), 0.12, Z(-217.5)), '#e8e6e0']);
      for (const [x, z, s] of [[72, -224, 1.3], [101, -210.5, 1.2], [58.5, -183.5, 1.6], [88, -183, 1.8], [100, -186, 1.4], [140, -183, 1.6], [168, -184, 1.5], [75, -210, 1.0]] as [number, number, number][]) g.tree(k, X(x), Z(z), s);
      // the big trees between the complex and Ebenezer Laing Road (the aerial: dense), and along the avenue (view 1)
      g.reseed(137);
      g.scatter(26, 128, -294, -248, 70, (x, z) => g.tree(k, X(x), Z(z), 1.6 + g.rand() * 1.2));
      stoneMesh(k, st);
      const m = new THREE.Mesh(merge(c), concrete(0.3));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();
/** a Norfolk Island pine standing on y0: a straight trunk, tiers of flat branches */
function pine(k: Kit, x: number, z: number, h: number, y0 = 0) {
  k.plain.push([new THREE.CylinderGeometry(0.1, 0.25, h, 7).translate(x, y0 + h / 2, z), '#5a4436']);
  const n = Math.round(h / 1.1);
  for (let i = 2; i < n; i++) { const t = i / n, r = (1 - t) * h * 0.2 + 0.3; k.plain.push([new THREE.ConeGeometry(r, 0.65, 9).translate(x, y0 + h * t, z), i % 2 ? '#26402a' : '#2d4a30']); }
  k.plain.push([new THREE.ConeGeometry(0.3, 1.0, 7).translate(x, y0 + h + 0.3, z), '#2d4a30']);
}

// ---------- the Centre for Biodiversity Conservation Research (view 2) ----------
const CB: R4 = [-113.2, -24.9, -277.5, -263.3];
const CBO: [number, number] = [-69, -270.4];
const CB_RAISE = 0.9;
const CB_WALL: Style = {
  bay: 3.6, up: [], ground: [[100, 256 + 56, 56, 128]],
  draw: (g) => {
    render(g, '#f4f4f1'); speckle(g, 0, 0, 256, 512, 300, ['rgba(130,124,110,0.12)']);
    g.fillStyle = '#e2ded4'; g.fillRect(94, 256 + 50, 68, 140);
    g.fillStyle = '#3e2416'; g.fillRect(100, 256 + 56, 56, 128);
    for (let y = 256 + 62; y < 256 + 180; y += 9) { g.fillStyle = '#5e3a26'; g.fillRect(104, y, 48, 5); }
    g.fillStyle = '#3e2416'; g.fillRect(126, 256 + 56, 4, 128);
  },
};
const CB_END: Style = { bay: 4, up: [], ground: [], draw: (g) => { render(g, '#f4f4f1'); speckle(g, 0, 0, 256, 512, 200, ['rgba(130,124,110,0.1)']); } };
const cbcr: Spec = (() => {
  const X = (x: number) => x - CBO[0], Z = (z: number) => z - CBO[1];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
  const M = (x: number, z: number): [number, number] => [X(x), Z(z)];
  return {
    name: 'Centre for Biodiversity Conservation Research', axis: [1, 0], origin: CBO, storey: 3.4, style: CB_WALL, roofColor: '#6e4433', fascia: '#5a3a28', pitch: 0.4, plinth: '#f4f4f1',
    replaces: [[-70, -270]],
    blocks: [{ x0: X(CB[0]), x1: X(CB[1]), z0: Z(CB[2]), z1: Z(CB[3]), floors: 1, roof: 'none', y: CB_RAISE, faces: { x0: CB_END, x1: CB_END } }],
    keep: [[X(-34), X(-4), Z(-264), Z(-238)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      const e = CB_RAISE + k.wallTop(1);
      // its base of rubble stone, the gable roof of old dark brown tiles, the deep brown timber fascia and barge boards
      st.push([B(CB[0] - 0.1, CB[1] + 0.1, 0, CB_RAISE + 0.05, CB[2] - 0.1, CB[3] + 0.1), '#ffffff']);
      k.roof.c = new THREE.Color('#6e4433');
      const top = hipRoof(k, M, CB[0] - 0.9, CB[1] + 0.9, CB[2] - 0.9, CB[3] + 0.9, e, 0.4, 'x', [open, open], c, '#5a3a28');
      for (const x of [CB[0], CB[1]]) c.push([tri2([X(x), e - 0.02, Z(CB[2])], [X(x), e - 0.02, Z(CB[3])], [X(x), top - 0.3, Z((CB[2] + CB[3]) / 2)]), '#f4f4f1']);
      for (const z of [CB[2] - 0.9, CB[3] + 0.9]) c.push([B(CB[0] - 0.9, CB[1] + 0.9, e - 0.55, e + 0.05, z - 0.06, z + 0.06), '#5a3a28']);
      // the east gable (view 2): two brown windows, the board under a lamp
      for (const z of [-274.5, -266.3]) k.plain.push([B(CB[1], CB[1] + 0.05, CB_RAISE + 1.0, CB_RAISE + 2.9, z - 0.45, z + 0.45), '#3e2416']);
      k.plain.push([B(CB[1], CB[1] + 0.04, CB_RAISE + 2.4, CB_RAISE + 3.0, -272.6, -269.0), '#e9ecef']);
      k.signs.push({ text: 'CENTRE FOR BIODIVERSITY CONSERVATION RESEARCH', x: X(CB[1]) + 0.05, y: CB_RAISE + 2.7, z: Z(-270.8), ry: Math.PI / 2, w: 3.4, colors: ['#e9ecef', '#1d3f7a'] });
      k.plain.push([B(CB[1], CB[1] + 0.25, CB_RAISE + 3.15, CB_RAISE + 3.3, -271.0, -270.6), '#fff6dc']);
      // the red stair with black railings up to the north door near the east end
      const sz0 = CB[2] - 1.5, sz1 = CB[2], sx1 = CB[1] - 2.0, sx0 = sx1 - 3.0;
      c.push([B(sx1, sx1 + 1.4, 0, CB_RAISE, sz0, sz1), '#a8402c']);
      for (let i = 0; i < 5; i++) c.push([B(sx0 + i * 0.6, sx0 + (i + 1) * 0.6, 0, (CB_RAISE * (i + 1)) / 5, sz0, sz1), '#b5493a']);
      k.plain.push([B(sx1 + 0.1, sx1 + 1.3, CB_RAISE, CB_RAISE + 2.4, CB[2] - 0.03, CB[2]), '#3e2416']);
      const len = Math.hypot(3.0, CB_RAISE);
      k.plain.push([new THREE.BoxGeometry(len, 0.05, 0.05).rotateZ(Math.atan2(CB_RAISE, 3.0)).translate(X(sx0 + 1.5), CB_RAISE / 2 + 0.95, Z(sz0)), '#141414']);
      for (let i = 0; i <= 6; i++) { const x = sx0 + i * 0.5, y = (CB_RAISE * i) / 6; k.plain.push([B(x - 0.02, x + 0.02, y, y + 0.95, sz0 - 0.02, sz0 + 0.02), '#141414']); }
      for (let x = sx1; x <= sx1 + 1.4; x += 0.35) k.plain.push([B(x - 0.02, x + 0.02, CB_RAISE, CB_RAISE + 0.95, sz0 - 0.02, sz0 + 0.02), '#141414']);
      k.plain.push([B(sx1, sx1 + 1.4, CB_RAISE + 0.93, CB_RAISE + 0.97, sz0 - 0.03, sz0 + 0.03), '#141414']);
      // ----- the forecourt east of it (view 2): the white screen of pierced blocks, beds faced in rubble stone either
      // side of the steps up to its gate, the gate a black grille swung open on a red tiled step; the board; the asphalt
      const wx = -27.2, gz0 = -253.6, gz1 = -249.8;
      for (const [a, b] of [[-262.6, gz0], [gz1, -240.6]]) {
        panel(CBO, k, pierced(), wx, a, wx, b, 0.8, 3.0, 0.4);
        c.push([B(wx - 0.12, wx + 0.12, 3.0, 3.15, a, b), '#f4f4f1']);
        for (let z = a; z <= b; z += 0.4) SOLIDS.add(wx, z, 0.25);
        st.push([B(wx + 0.15, wx + 2.6, 0, 0.8, a, b), '#ffffff']);
        c.push([B(wx + 0.1, wx + 2.65, 0.8, 0.86, a, b), '#c9c4b8']);
        for (let z = a; z <= b; z += 0.4) SOLIDS.add(wx + 1.4, z, 1.2);
        for (let z = a + 0.8; z < b - 0.6; z += 1.2) k.plain.push([new THREE.IcosahedronGeometry(0.45, 0).translate(X(wx + 1.3), 1.15, Z(z)), z % 2 > 1 ? '#4f8a35' : '#3f6f2c']);
      }
      for (const z of [gz0, gz1]) c.push([B(wx - 0.2, wx + 0.2, 0, 3.15, z - 0.2, z + 0.2), '#f4f4f1']);
      for (let i = 0; i < 4; i++) c.push([B(wx + 0.2 + i * 0.6, wx + 0.8 + i * 0.6, 0, 0.8 - i * 0.2, gz0, gz1), '#d6d0c4']);
      k.plain.push([B(wx - 1.2, wx + 0.2, 0.78, 0.82, gz0, gz1), '#a8402c']);
      for (let x = wx - 1.8; x <= wx - 0.2; x += 0.14) k.plain.push([B(x - 0.015, x + 0.015, 0.8, 2.7, gz1 - 0.06, gz1 - 0.03), '#161616']);
      const bx = -12.5, bz = -262.0;
      for (const s of [-1.1, 1.1]) c.push([B(bx - 0.05, bx + 0.05, 0, 2.7, bz + s - 0.05, bz + s + 0.05), '#f2f2ee']);
      k.plain.push([B(bx - 0.04, bx + 0.04, 1.25, 2.6, bz - 1.2, bz + 1.2), '#f6f6f3']);
      k.plain.push([B(bx + 0.04, bx + 0.06, 2.15, 2.5, bz - 1.05, bz - 0.7), '#1d3f7a']);
      k.signs.push({ text: 'UNIVERSITY OF GHANA', x: X(bx) + 0.07, y: 2.35, z: Z(bz + 0.25), ry: Math.PI / 2, w: 1.5, colors: ['#f6f6f3', '#1d3f7a'] });
      k.signs.push({ text: 'CENTRE FOR BIODIVERSITY CONSERVATION RESEARCH', x: X(bx) + 0.07, y: 1.75, z: Z(bz), ry: Math.PI / 2, w: 2.1, colors: ['#f6f6f3', '#1d2a3a'] });
      k.plain.push([B(wx + 2.7, -5.0, 0.02, 0.05, -262.6, -240.6), '#4b4c4e']);
      stoneMesh(k, st);
      const m = new THREE.Mesh(merge(c), concrete(0.15));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

// ---------- the Ocean Margins Initiative, its blue shed, the lane wall, the ashoka row, the avenue's median ----------
const OM: R4 = [-181.6, -172.8, -256.5, -245.5];
const SH: R4 = [-168.0, -162.6, -272.0, -255.0];
const OM_WALL: Style = { bay: 4, up: [], ground: [], draw: (g) => { render(g, '#f4f4f1'); speckle(g, 0, 0, 256, 512, 200, ['rgba(130,124,110,0.1)']); g.fillStyle = '#a5402e'; g.fillRect(0, 512 - 84, 256, 84); } };
/** blue corrugated sheets */
const SHED: Style = { bay: 3, up: [], ground: [], draw: (g) => { g.fillStyle = '#2d5aa8'; g.fillRect(0, 0, 256, 512); for (let x = 0; x < 256; x += 12) { g.fillStyle = '#244a8c'; g.fillRect(x, 0, 4, 512); } } };
const grounds: Spec = (() => {
  const O: [number, number] = [-100, -250];
  const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
  return {
    name: 'Ocean Margins Initiative', axis: [1, 0], origin: O, storey: 3.0, style: OM_WALL, roofColor: '#d9d6cf', fascia: '#f4f4f1', pitch: 0.1, plinth: '#a5402e',
    replaces: [[-177.8, -250.5]],
    blocks: [
      { x0: X(OM[0]), x1: X(OM[1]), z0: Z(OM[2]), z1: Z(OM[3]), floors: 1, roof: 'flat' },
      { x0: X(SH[0]), x1: X(SH[1]), z0: Z(SH[2]), z1: Z(SH[3]), floors: 1, roof: 'none', faces: { x0: SHED, x1: SHED, z0: SHED, z1: SHED } },
    ],
    // the Ocean Margins box, and the avenue's median (view 1: grass, conifers and lamps only, no generic street trees)
    keep: [[X(OM[0] - 1), X(OM[1] + 1), Z(OM[2] - 3), Z(OM[3] + 1)], [X(1.5), X(17.5), Z(-298), Z(-221)], [X(2.3), X(17.8), Z(-216), Z(-162)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      const e = k.wallTop(1);
      // the Ocean Margins Initiative (view 6): the deep white fascia all round, its name on the north, a glass door, the
      // blue plaque, air-conditioners in cages on the east, steps and white low walls, a red cordyline
      c.push([B(OM[0] - 0.6, OM[1] + 0.6, e - 0.1, e + 0.7, OM[2] - 0.6, OM[3] + 0.6), '#f4f4f1']);
      k.plain.push([B(-178.6, -175.8, e - 0.05, e + 0.6, OM[2] - 0.62, OM[2] - 0.6), '#f4f4f1']);
      k.signs.push({ text: 'OCEAN MARGINS INITIATIVE - DEPT. OF MARINE AND FISHERIES SCIENCES', x: X(-177.2), y: e + 0.32, z: Z(OM[2] - 0.63), ry: Math.PI, w: 2.6, colors: ['#f4f4f1', '#1d2a3a'] });
      const dx = -179.4;
      k.plain.push([B(dx - 0.55, dx + 0.55, 0.3, 2.5, OM[2] - 0.04, OM[2]), '#f0f0ee'], [B(dx - 0.45, dx + 0.45, 0.4, 2.4, OM[2] - 0.06, OM[2] - 0.04), '#a9b8c0']);
      k.plain.push([new THREE.CircleGeometry(0.32, 16).rotateY(Math.PI).translate(X(dx - 1.3), 1.9, Z(OM[2]) - 0.03), '#2f6ab8']);
      for (let i = 0; i < 2; i++) c.push([B(dx - 0.9, dx + 0.9, 0, 0.3 - i * 0.15, OM[2] - 0.6 - i * 0.35, OM[2] - i * 0.35), '#e8e8e4']);
      c.push([B(OM[0] - 1.5, dx - 1.0, 0, 0.35, OM[2] - 1.2, OM[2] - 0.9), '#f0f0ee']);
      for (const z of [-253.5, -249.5]) c.push([B(OM[1], OM[1] + 0.5, 0.2, 0.9, z - 0.45, z + 0.45), '#d9dad8']);
      k.plain.push([new THREE.ConeGeometry(0.4, 0.8, 6).translate(X(dx - 2.0), 0.55, Z(OM[2] - 0.5)), '#b51f4a']);
      // the blue shed's low red roof
      k.roof.c = new THREE.Color('#b5443a');
      k.roof.quad([X(SH[0] - 0.4), e, Z(SH[3] + 0.4)], [X(SH[0] - 0.4), e, Z(SH[2] - 0.4)], [X((SH[0] + SH[1]) / 2), e + 0.6, Z(SH[2] - 0.4)], [X((SH[0] + SH[1]) / 2), e + 0.6, Z(SH[3] + 0.4)]);
      k.roof.quad([X(SH[1] + 0.4), e, Z(SH[2] - 0.4)], [X(SH[1] + 0.4), e, Z(SH[3] + 0.4)], [X((SH[0] + SH[1]) / 2), e + 0.6, Z(SH[3] + 0.4)], [X((SH[0] + SH[1]) / 2), e + 0.6, Z(SH[2] - 0.4)]);
      for (let x = SH[0]; x <= SH[1]; x += 0.5) for (const z of [SH[2], SH[3]]) SOLIDS.add(x, z, 0.3);
      for (let z = SH[2]; z <= SH[3]; z += 0.5) for (const x of [SH[0], SH[1]]) SOLIDS.add(x, z, 0.3);
      // ashoka trees before the Ocean Margins Initiative (view 6) and round it
      for (const [x, z, h] of [[-180.5, -259.5, 9], [-177.0, -259.8, 10], [-173.8, -259.0, 9.5], [-171.0, -251.5, 8.5], [-184.5, -252, 9]] as [number, number, number][]) { ashoka(k, X(x), Z(z), h, Math.round(-x)); SOLIDS.add(x, z, 0.35); }
      // ----- the row of weeping ashoka trees along Ebenezer Laing Road before the biology complex (view 3), a low kerb
      // at their foot on the grass bank
      let n = 0;
      for (let x = -152; x <= -28; x += 2.6) {
        for (const [dz, dh] of [[-288.2, 0], [-285.0, 1.5]] as [number, number][]) {
          if (dz === -285.0 && n % 2) continue;
          const h = 11 + ((n * 7) % 5) + dh;
          ashoka(k, X(x + (dz === -285 ? 1.3 : 0)), Z(dz), h, n);
          SOLIDS.add(x + (dz === -285 ? 1.3 : 0), dz, 0.35);
        }
        n++;
      }
      c.push([B(-153, -27, 0, 0.25, -290.6, -290.3), '#8a8174']);
      // ----- the lane past the Department of Nutrition and Food Sciences (view 7): a wall of rubble stone holding its
      // lawn up on the west, a concrete cap; the lawn falls back from the top of the wall
      const lane = (z: number) => (z > -202.5 ? -160.3 + ((-162.0 + 160.3) * (z + 202.5)) / (-161.5 + 202.5) : -160.3 + ((-157.6 + 160.3) * (z + 202.5)) / (-269 + 202.5));
      for (let z = -244; z < -166; z += 2) {
        const xa = lane(z) - 3.5, xb = lane(z + 2) - 3.5, xm = (xa + xb) / 2;
        // the lane runs down toward its north end (relief.ts): the wall's foot follows it, its top stays level
        const yb = Math.min(0, k.ground(X(xm + 0.3), Z(z + 1)), k.ground(X(xm + 0.3), Z(z + 2))) - 0.05;
        st.push([new THREE.BoxGeometry(0.4, 1.05 - yb, 2.02).translate(X(xm), (1.05 + yb) / 2, Z(z + 1)), '#ffffff']);
        k.plain.push([new THREE.BoxGeometry(0.5, 0.08, 2.02).translate(X(xm), 1.09, Z(z + 1)), '#c9c4b8']);
        const wedge = new THREE.BufferGeometry();
        const p = [X(xm - 0.2), 1.0, Z(z), X(xm - 0.2), 1.0, Z(z + 2), X(xm - 3.2), 0.02, Z(z + 2), X(xm - 3.2), 0.02, Z(z)];
        wedge.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); wedge.setIndex([0, 2, 1, 0, 3, 2]); wedge.computeVertexNormals();
        k.plain.push([wedge, '#6f8f3c']);
        SOLIDS.add(xm, z + 1, 0.45);
      }
      // ----- the avenue's median (view 1): strips of brick paving along both edges, grass between, conifers, lamps
      const med = (z: number) => z < -218.5 ? [-1.3 + ((-0.5 + 1.3) * (z + 298)) / 80, 20.0 + ((18.7 - 20.0) * (z + 298)) / 80] : [-0.5 + (0.5 * (z + 218.5)) / 56, 18.7 + (1.3 * (z + 218.5)) / 56];
      for (let z = -296; z < -165; z += 3) {
        if (z > -221 && z < -216) continue;
        const [w0, w1] = med(z + 1.5), a = w0 + 4.4, b = w1 - 4.4;
        c.push([B(a, a + 1.6, 0.02, 0.1, z, z + 3), '#a65a40'], [B(b - 1.6, b, 0.02, 0.1, z, z + 3), '#a65a40']);
        for (let zz = z + 0.3; zz < z + 3; zz += 0.3) k.plain.push([B(a, a + 1.6, 0.1, 0.105, zz, zz + 0.03), '#7d3f2c'], [B(b - 1.6, b, 0.1, 0.105, zz, zz + 0.03), '#7d3f2c']);
      }
      for (let z = -285; z < -170; z += 14) {
        const [w0, w1] = med(z), xm = (w0 + w1) / 2;
        if (z > -224 && z < -213) continue;
        c.push([new THREE.CylinderGeometry(0.07, 0.11, 9, 8).translate(X(xm), 4.5, Z(z)), '#b9bcbf']);
        c.push([B(xm - 1.4, xm + 1.4, 8.9, 9.0, z - 0.1, z + 0.1), '#b9bcbf']);
        SOLIDS.add(xm, z, 0.2);
        const cx = xm + ((z / 14) % 2 ? 3.2 : -3.2), cz = z + 6;
        k.plain.push([new THREE.ConeGeometry(0.9, 4.2, 9).translate(X(cx), 2.5, Z(cz)), '#2f5428'], [new THREE.CylinderGeometry(0.1, 0.12, 0.5, 6).translate(X(cx), 0.25, Z(cz)), '#4e3d30']);
        SOLIDS.add(cx, cz, 0.4);
      }
      stoneMesh(k, st);
      const m = new THREE.Mesh(merge(c), concrete(0.2));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

/** Plant Biology, the Centre for Biodiversity, the Ocean Margins Initiative and the grounds round the N Block's front */
export const biologySite = createSite('biology', [plant, cbcr, grounds]);
