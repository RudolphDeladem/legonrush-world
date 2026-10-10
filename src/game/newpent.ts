// New Pent (Ghana Hostels) Blocks A, B and C, from the owner's third reference PDF (pages 31-58) and the labelled aerial
// (block engine: blocks.ts). The owner: Block B stands behind Block A in the same orientation and of the same design;
// Block C is of the same design too. So every wing of the three blocks is built here from its mapped footprint to one
// design: four storeys of white render over a dark grey base, hipped roofs of red-brown tiles with dark fascias; along
// the long sides balconies, a small panel of facing brick on each balcony front; every end wall faced in brick from
// the base to the eaves, a white strip up its middle carrying the stair's tall barred windows under an arched head.
// Each block's entrance (the owner's blue marks) is a white tower over a gabled porch: the porch's rendered gable with
// the block's name, a tall arched opening between square columns on grey feet, the tower's open loggia at the top
// under its own small tiled gable.
//
// Each block's front structure, before its entrance toward the car park, is lower, its whole front faced in brick with
// the white stair strip up the middle, its sides white with balconies (the owner's photo of Block A's front).
//
// Round them: the generators under a grey sheet roof by Block A's east side; the red and white lattice mast by Pent
// Road between Blocks A and B; on Block C's west side a brick-paved drive, the transformer in its cage beside it, and
// the generator under a sheet roof on cream round columns on a raised platform against a brick end wall; the yellow
// Boba tea kiosk with its seats on the corner by Block C only (the owner: none by Blocks A and B). The walls along Pent
// Road are left out until the owner shows how the blocks are fenced.
import * as THREE from 'three';
import { BUILDINGS } from './campusmap';
import { box, merge, speckle, tri2, type Part } from './modelkit';
import { PL, createSite, render, type Block, type Spec, type Style } from './blocks';
import { concrete } from './concrete';
import { rectsOf, type Rect } from './rectilinear';
import { SOLIDS } from './solids';

const NST = 3.2, NF = 4, WHITE_NP = '#f3f2ee', GREY_BASE = '#55585c', ROOF_NP = '#a9472f', FASCIA_NP = '#2f2a28';
/** where the New Pent blocks stand (the yellow zone on the owner's aerial) */
export const NEW_PENT = [[507, 635, -839, -585], [632, 756, -797, -641]];
const inZone = (x: number, z: number) => NEW_PENT.some(([x0, x1, z0, z1]) => x > x0 && x < x1 && z > z0 && z < z1);

/** the brick courses on a canvas region */
function bricks(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, course = 7) {
  g.fillStyle = '#c7b6a3'; g.fillRect(x, y, w, h);
  const cols = ['#a4482f', '#9c4129', '#ad5236', '#93412c', '#a9503a'];
  for (let r = 0, yy = y; yy < y + h; r++, yy += course) for (let xx = x - ((r % 2) * course * 1.4); xx < x + w; xx += course * 2.8) {
    g.fillStyle = cols[(r * 3 + Math.round(xx) * 7) % cols.length];
    g.fillRect(Math.max(x, xx + 1), yy + 1, Math.min(course * 2.8 - 1.5, x + w - Math.max(x, xx + 1)), course - 1.5);
  }
}
/** the long sides: a balcony to each bay, its white front with a small brick panel, the dark recess and door behind */
const NP_LONG: Style = {
  bay: 3.3, up: [[60, 40, 136, 100]], ground: [[60, 256 + 40, 136, 100]],
  draw: (g) => {
    render(g, WHITE_NP);
    for (const y0 of [0, 256]) {
      g.fillStyle = '#4c4f52'; g.fillRect(40, y0 + 30, 176, 190);
      g.fillStyle = '#26282a'; g.fillRect(60, y0 + 40, 60, 150); g.fillRect(140, y0 + 40, 56, 100);
      g.fillStyle = '#3a3c3e'; for (let y = y0 + 46; y < y0 + 136; y += 9) g.fillRect(142, y, 52, 3);
      // the balcony front, white, its brick panel
      g.fillStyle = '#f7f6f2'; g.fillRect(30, y0 + 150, 196, 76);
      g.fillStyle = 'rgba(90,90,85,0.35)'; g.fillRect(30, y0 + 222, 196, 6);
      bricks(g, 140, y0 + 160, 54, 46, 6);
    }
    g.fillStyle = GREY_BASE; g.fillRect(0, 512 - 60, 256, 60);
    speckle(g, 0, 0, 256, 512, 200, ['rgba(140,136,126,0.12)']);
  },
};
/** the end walls: facing brick from the grey base to the eaves */
const NP_END: Style = {
  bay: 3.3, up: [], ground: [],
  draw: (g) => { bricks(g, 0, 0, 256, 512, 9); g.fillStyle = GREY_BASE; g.fillRect(0, 512 - 60, 256, 60); },
};

/** the wings: every four-storey footprint in the zone, its rectangles (world) */
const WINGS = BUILDINGS.filter((b) => inZone((b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2) && (b.height ?? 0) >= 12).map((b) => {
  const ring: [number, number][] = [];
  for (let i = 0; i < b.pts.length; i += 2) ring.push([b.pts[i], b.pts[i + 1]]);
  return { b, rects: rectsOf(ring) };
});
const touches = (a: Rect, b: Rect, side: 'x0' | 'x1' | 'z0' | 'z1') => {
  const e = 0.6;
  const overX = Math.min(a[1], b[1]) - Math.max(a[0], b[0]) > 1, overZ = Math.min(a[3], b[3]) - Math.max(a[2], b[2]) > 1;
  if (side === 'x0') return overZ && Math.abs(b[1] - a[0]) < e;
  if (side === 'x1') return overZ && Math.abs(b[0] - a[1]) < e;
  if (side === 'z0') return overX && Math.abs(b[3] - a[2]) < e;
  return overX && Math.abs(b[2] - a[3]) < e;
};
/** the front structures of the blocks, before each entrance toward its car park (inside each footprint): the owner's
 *  photo of Block A's front - its whole front face is brick, a white strip with the arched stair window up the middle,
 *  its sides white with balconies; lower than the wings behind it. The same on every block (the owner) */
const FRONTS: [number, number][] = [[582, -612], [543.2, -601.5], [576.4, -751.8], [539.9, -740.9], [704.7, -676.5]];
function wing(i: number): Spec {
  const { b, rects } = WINGS[i];
  const front = FRONTS.some(([x, z]) => x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ), FL = front ? NF - 1 : NF;
  /** the faces of a rectangle faced in brick: its two ends, or a front structure's front (+z) */
  const ends = (r: Rect): ('x0' | 'x1' | 'z0' | 'z1')[] => (front ? ['z1'] : r[1] - r[0] >= r[3] - r[2] ? ['x0', 'x1'] : ['z0', 'z1']);
  const O: [number, number] = [(b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2];
  const all = WINGS.flatMap((w) => w.rects);
  const blocks: Block[] = rects.map((r) => {
    const faces: Block['faces'] = {};
    for (const f of ends(r)) faces[f] = NP_END;
    return { x0: r[0] - O[0], x1: r[1] - O[0], z0: r[2] - O[1], z1: r[3] - O[1], floors: FL, faces };
  });
  const biggest = rects.reduce((m, r) => ((r[1] - r[0]) * (r[3] - r[2]) > (m[1] - m[0]) * (m[3] - m[2]) ? r : m), rects[0]);
  return {
    name: `New Pent wing ${i + 1}`,
    axis: [1, 0], origin: O, storey: NST, style: NP_LONG, roofColor: ROOF_NP, fascia: FASCIA_NP, pitch: 0.42,
    replaces: [[(biggest[0] + biggest[1]) / 2, (biggest[2] + biggest[3]) / 2]],
    blocks,
    keep: [],
    extras: (k) => {
      const e = k.wallTop(FL);
      // the white strip up the middle of each open brick wall, the stair's tall barred windows in it under an arched head
      for (const r of rects) {
        for (const side of ends(r)) {
          if (all.some((o) => o !== r && touches(r, o, side))) continue;
          const w = side[0] === 'x' ? r[3] - r[2] : r[1] - r[0];
          if (w < 6) continue;
          const s = side.endsWith('0') ? -1 : 1, at = (side[0] === 'x' ? (s < 0 ? r[0] : r[1]) - O[0] : (s < 0 ? r[2] : r[3]) - O[1]) + s * 0.03;
          const m = side[0] === 'x' ? (r[2] + r[3]) / 2 - O[1] : (r[0] + r[1]) / 2 - O[0];
          const B = (a0: number, a1: number, y0: number, y1: number, d0: number, d1: number) => side[0] === 'x' ? box(at + Math.min(d0, d1) * s, at + Math.max(d0, d1) * s, y0, y1, m + a0, m + a1) : box(m + a0, m + a1, y0, y1, at + Math.min(d0, d1) * s, at + Math.max(d0, d1) * s);
          const Bs = (a0: number, a1: number, y0: number, y1: number, d0: number, d1: number) => { const g = B(a0, a1, y0, y1, d0, d1); return g; };
          k.plain.push([s > 0 ? B(-1.3, 1.3, 0.9, e - 1.2, 0, 0.04) : Bs(-1.3, 1.3, 0.9, e - 1.2, -0.04, 0), WHITE_NP]);
          const arch = new THREE.CircleGeometry(1.3, 16, 0, Math.PI);
          if (side[0] === 'x') arch.rotateY(s > 0 ? Math.PI / 2 : -Math.PI / 2).translate(at + s * 0.04, e - 1.2, m);
          else arch.rotateY(s > 0 ? 0 : Math.PI).translate(m, e - 1.2, at + s * 0.04);
          k.plain.push([arch, WHITE_NP]);
          for (let f = 0; f < FL; f++) {
            const y = PL + f * NST + 0.6;
            k.plain.push([s > 0 ? B(-0.55, 0.55, y, y + (f === FL - 1 ? 2.2 : 1.9), 0.04, 0.06) : B(-0.55, 0.55, y, y + (f === FL - 1 ? 2.2 : 1.9), -0.06, -0.04), '#26282a']);
            for (let a = -0.45; a <= 0.46; a += 0.15) k.plain.push([s > 0 ? B(a - 0.015, a + 0.015, y, y + 1.9, 0.06, 0.08) : B(a - 0.015, a + 0.015, y, y + 1.9, -0.08, -0.06), '#d9d9d4']);
          }
        }
      }
    },
  };
}

// ---------- the entrances (frame: map axes, origin at the owner's mark, front to +z) ----------
function entrance(name: string, letter: string, at: [number, number]): Spec {
  return {
    name,
    axis: [1, 0], origin: at, storey: NST, style: NP_LONG, roofColor: ROOF_NP, fascia: FASCIA_NP, pitch: 0.5,
    blocks: [],
    keep: [[-4, 4, -1.5, 8]],
    extras: (k) => {
      const e = PL + NF * NST + 0.4, c: Part[] = [];
      // the white tower, its open loggia at the top under a small tiled gable, a window on each floor below
      c.push([box(-3.6, 3.6, 0, e, -1.5, 2.5), WHITE_NP]);
      k.plain.push([box(-3.61, 3.61, 0, 0.9, -1.5, 2.51), GREY_BASE]);
      for (const x of [-1.5, 1.5]) {
        k.plain.push([box(x - 0.9, x + 0.9, e - 3.0, e - 0.9, 2.5, 2.54), '#3a3c3e']);
        k.plain.push([new THREE.CircleGeometry(0.9, 14, 0, Math.PI).translate(x, e - 0.9, 2.55), '#3a3c3e']);
        k.plain.push([box(x - 0.9, x + 0.9, e - 3.0, e - 2.0, 2.54, 2.6), WHITE_NP]);
      }
      for (let f = 1; f < NF - 1; f++) { const y = PL + f * NST + 0.6; k.plain.push([box(-0.7, 0.7, y, y + 1.6, 2.5, 2.54), '#2a2c2e']); }
      const top = e + 4.3 * 0.55;
      k.roof.c = new THREE.Color(ROOF_NP);
      k.roof.quad([-4.3, e, 3.1], [-4.3, e, -2.1], [0, top, -2.1], [0, top, 3.1]);
      k.roof.quad([4.3, e, -2.1], [4.3, e, 3.1], [0, top, 3.1], [0, top, -2.1]);
      k.plain.push([tri2([-3.6, e, 2.52], [3.6, e, 2.52], [0, top - 0.25, 2.52]), WHITE_NP]);
      for (const sx of [-1, 1]) { const L = Math.hypot(4.3, top - e); k.plain.push([new THREE.BoxGeometry(L, 0.3, 0.08).rotateZ(-sx * Math.atan2(top - e, 4.3)).translate(sx * 2.15, (e + top) / 2, 3.12), FASCIA_NP]); }
      // the porch: square columns on grey feet, the tall arch in the middle, the rendered gable with the block's name
      const ph = 3.6, pz = 6.2;
      for (const x of [-2.9, -1.3, 1.3, 2.9]) { c.push([box(x - 0.3, x + 0.3, 0, ph, pz - 0.6, pz), WHITE_NP]); k.plain.push([box(x - 0.31, x + 0.31, 0, 0.9, pz - 0.61, pz + 0.01), GREY_BASE]); }
      c.push([box(-3.2, 3.2, ph, ph + 0.9, 2.5, pz), WHITE_NP]);
      k.plain.push([new THREE.CircleGeometry(1.0, 16, 0, Math.PI).translate(0, ph - 0.6, pz + 0.01), '#3a3c3e'], [box(-1.0, 1.0, 0, ph - 0.6, pz - 0.02, pz - 0.01), '#3a3c3e']);
      const pt = ph + 0.9 + 3.5 * 0.5;
      k.roof.quad([-3.5, ph + 0.9, pz + 0.3], [-3.5, ph + 0.9, 2.5], [0, pt, 2.5], [0, pt, pz + 0.3]);
      k.roof.quad([3.5, ph + 0.9, 2.5], [3.5, ph + 0.9, pz + 0.3], [0, pt, pz + 0.3], [0, pt, 2.5]);
      k.plain.push([tri2([-3.2, ph + 0.9, pz + 0.02], [3.2, ph + 0.9, pz + 0.02], [0, pt - 0.2, pz + 0.02]), WHITE_NP]);
      k.plain.push([box(-1.2, 1.2, ph + 1.05, ph + 1.55, pz + 0.02, pz + 0.06), '#f7f7f4']);
      k.signs.push({ text: `BLOCK ${letter}`, x: 0, y: ph + 1.3, z: pz + 0.07, ry: 0, w: 2.0, colors: ['#f7f7f4', '#1f2f5a'] });
      // the doors and grilles inside, the paved approach
      k.plain.push([box(-2.8, 2.8, 0.1, 2.6, 2.5, 2.54), '#2a2c2e']);
      for (let x = -2.7; x < 2.8; x += 0.2) k.plain.push([box(x, x + 0.03, 0.1, 2.6, 2.54, 2.57), '#7d8084']);
      k.plain.push([box(-3.4, 3.4, 0, 0.12, 2.5, pz + 1.5), '#9a5644']);
      const m = new THREE.Mesh(merge(c), concrete(0.25)); m.castShadow = true; k.meshes.push(m);
    },
  };
}

// ---------- the walls, gates, generators, the mast and the Boba kiosk (frame: map axes) ----------
const SO: [number, number] = [628, -680];
const grounds: Spec = {
  name: 'New Pent walls and services',
  axis: [1, 0], origin: SO, storey: 3, style: NP_LONG, roofColor: ROOF_NP, fascia: FASCIA_NP, pitch: 0.4,
  onGround: true,
  blocks: [],
  keep: [[608 - SO[0], 619 - SO[0], -712 - SO[1], -595 - SO[1]], [633 - SO[0], 650 - SO[0], -770 - SO[1], -655 - SO[1]]],
  extras: (k) => {
    const X = (x: number) => x - SO[0], Z = (z: number) => z - SO[1];
    const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
    const gy = (x: number, z: number) => k.ground(X(x), Z(z));
    const c: Part[] = [];
    // the brick walls (the owner's photos after the third PDF): along Pent Road a wall of brick panels between square
    // cream-white pillars only from one wing's end to the next, a grey steel gate in it - on Blocks A and B between the
    // wing on the road and the wing north of it, the gate near the north wing; on Block C's west side from the
    // generator's platform to the transformer, the gate on the brick-paved drive
    const wall = (x: number, za: number, zb: number, gate: [number, number], h = 2.3) => {
      for (let z = za; z > zb + 0.01; z -= 3) {
        const z1 = Math.max(zb, z - 3), y = gy(x, z);
        c.push([B(x - 0.25, x + 0.25, y - 0.1, y + h + 0.2, z - 0.25, z + 0.25), '#ece6d2']);
        if (z1 < gate[0] && z > gate[1]) continue;
        k.plain.push([B(x - 0.11, x + 0.11, y - 0.1, y + h, z1, z), '#a4482f']);
        for (let yy = y + 0.25; yy < y + h; yy += 0.3) k.plain.push([B(x - 0.115, x + 0.115, yy, yy + 0.02, z1, z), '#c7b6a3']);
        k.plain.push([B(x - 0.15, x + 0.15, y + h, y + h + 0.08, z1, z), '#ece6d2']);
        for (let zz = z; zz > z1; zz -= 0.9) SOLIDS.add(x, zz, 0.2);
      }
      c.push([B(x - 0.25, x + 0.25, gy(x, zb) - 0.1, gy(x, zb) + h + 0.2, zb - 0.25, zb + 0.25), '#ece6d2']);
      const y = gy(x, (gate[0] + gate[1]) / 2);
      c.push([B(x - 0.3, x + 0.3, y, y + h + 0.4, gate[0] - 0.3, gate[0] + 0.3), '#ece6d2'], [B(x - 0.3, x + 0.3, y, y + h + 0.4, gate[1] - 0.3, gate[1] + 0.3), '#ece6d2']);
      k.plain.push([B(x - 0.05, x + 0.05, y + 0.05, y + h + 0.1, gate[1] + 0.3, gate[0] - 0.3), '#a9adb1']);
      for (let zz = gate[1] + 0.5; zz < gate[0] - 0.3; zz += 0.5) k.plain.push([B(x - 0.07, x + 0.07, y + 0.05, y + h + 0.1, zz, zz + 0.04), '#8a8e92']);
      for (let zz = gate[1]; zz < gate[0]; zz += 0.9) SOLIDS.add(x, zz, 0.2);
    };
    wall(611.6, -649.4, -672.2, [-664.6, -668.8]);
    wall(605.6, -789.3, -810.4, [-802.4, -806.6]);
    wall(634.5, -709.4, -745.8, [-714, -720]);
    k.plain.push([B(625.5, 634.2, gy(630, -717), gy(630, -717) + 0.04, -720.2, -713.8), '#9a5644']);
    // the transformer in its caged pen beside the gate
    { const x = 636.5, z = -710.5, y = gy(x, z);
      k.plain.push([B(x - 0.9, x + 0.9, y, y + 1.9, z - 0.6, z + 0.6), '#5c6a62'], [B(x - 0.25, x + 0.25, y + 1.2, y + 1.6, z - 0.62, z - 0.6), '#f2c400']);
      SOLIDS.add(x, z, 1.1); }
    // generators under grey sheet roofs: behind Block A's wall, and on the raised platform against Block C's west end
    const genShed = (x0: number, x1: number, z0: number, z1: number, y: number, round: boolean) => {
      for (const x of [x0, x1]) for (const z of [z0, z1]) {
        if (round) c.push([new THREE.CylinderGeometry(0.22, 0.22, 3.0, 10).translate(X(x), y + 1.5, Z(z)), '#e8dcc0']);
        else k.plain.push([B(x - 0.05, x + 0.05, y, y + 3.0, z - 0.05, z + 0.05), '#8d9094']);
      }
      const r = new THREE.BufferGeometry();
      r.setAttribute('position', new THREE.Float32BufferAttribute([X(x0 - 0.6), y + 3.25, Z(z0 - 0.6), X(x1 + 0.6), y + 3.25, Z(z0 - 0.6), X(x1 + 0.6), y + 3.0, Z(z1 + 0.6), X(x0 - 0.6), y + 3.0, Z(z1 + 0.6)], 3));
      r.setIndex([0, 2, 1, 0, 3, 2, 0, 1, 2, 0, 2, 3]); r.computeVertexNormals();
      k.plain.push([r, '#6f7579']);
      k.plain.push([B(x0 + 0.3, x1 - 0.3, y, y + 1.9, z0 + 0.4, z1 - 0.4), '#e9e8e2']);
      for (let x = x0 + 0.5; x < x1 - 0.4; x += 0.25) k.plain.push([B(x, x + 0.06, y + 0.4, y + 1.6, z1 - 0.42, z1 - 0.4), '#b9bab5']);
      SOLIDS.add((x0 + x1) / 2, (z0 + z1) / 2, Math.max(x1 - x0, z1 - z0) / 2);
    };
    genShed(606.0, 610.8, -679.5, -673.2, gy(608, -676), false);
    { const y = gy(640.5, -752) + 0.9;
      k.plain.push([B(636.2, 643.0, y - 1.2, y, -757.5, -746.5), '#b9b3a6']);
      genShed(637.0, 642.2, -756.5, -747.5, y, true); }
    // the red and white lattice mast by Pent Road between Blocks A and B
    { const mx = X(614.5), mz = Z(-706), mh = 36, y = gy(614.5, -706);
      for (let yy = 0; yy < mh; yy += 2) {
        const w = 1.3 - (yy / mh) * 0.9, col = Math.floor(yy / 4) % 2 ? '#d33a2c' : '#f2f2ee';
        for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) k.plain.push([box(mx + sx * w - 0.04, mx + sx * w + 0.04, y + yy, y + yy + 2, mz + sz * w - 0.04, mz + sz * w + 0.04), col]);
        for (const [a, b2] of [[[-1, -1], [1, 1]], [[1, -1], [-1, 1]]]) { const g = new THREE.BoxGeometry(0.04, Math.hypot(2 * w, 2), 0.04).rotateZ(Math.atan2(2 * w, 2)).translate(mx, y + yy + 1, mz + (a[1] + b2[1]) * 0); k.plain.push([g, col]); }
        k.plain.push([box(mx - w, mx + w, y + yy + 1.95, y + yy + 2, mz - w, mz + w), col]);
      }
      for (const [dx, dz] of [[0.6, 0], [-0.6, 0], [0, 0.6]]) k.plain.push([box(mx + dx - 0.15, mx + dx + 0.15, y + mh - 3, y + mh - 1, mz + dz - 0.15, mz + dz + 0.15), '#e8e8e4']);
      SOLIDS.add(614.5, -706, 1.4); }
    // the Boba tea kiosk on the corner by Block C: a yellow box with its awning, seats and planters round it
    { const x0 = 637.0, x1 = 641.5, z0 = -659.2, z1 = -656.6, y = gy(639, -658);
      k.plain.push([B(x0, x1, y, y + 0.3, z0, z1), '#3a3c3e'], [B(x0, x1, y + 0.3, y + 2.6, z0, z1), '#f2d22a']);
      k.plain.push([B(x0 + 0.6, x1 - 0.6, y + 1.1, y + 2.1, z1, z1 + 0.04), '#2a2826'], [B(x0 + 0.5, x1 - 0.5, y + 1.0, y + 1.08, z1, z1 + 0.4), '#e9e7e0']);
      const r = new THREE.BufferGeometry();
      r.setAttribute('position', new THREE.Float32BufferAttribute([X(x0), y + 2.6, Z(z1), X(x1), y + 2.6, Z(z1), X(x1), y + 2.2, Z(z1 + 1.4), X(x0), y + 2.2, Z(z1 + 1.4)], 3));
      r.setIndex([0, 2, 1, 0, 3, 2, 0, 1, 2, 0, 2, 3]); r.computeVertexNormals();
      k.plain.push([r, '#f5d84a']);
      k.plain.push([B(x0 + 0.6, x1 - 0.6, y + 2.6, y + 3.2, z1 - 0.05, z1), '#4a2a1a']);
      k.signs.push({ text: 'BoBa', x: X((x0 + x1) / 2), y: y + 2.9, z: Z(z1) + 0.01, ry: 0, w: 1.8, colors: ['#4a2a1a', '#f2d22a'] });
      for (const [tx, tz] of [[x0 - 1.4, z1 + 1.2], [x1 + 1.2, z1 + 1.6], [x1 + 1.0, z0 - 0.4]]) {
        k.plain.push([new THREE.CylinderGeometry(0.35, 0.35, 0.05, 12).translate(X(tx), y + 1.05, Z(tz)), '#2a2a2a'], [new THREE.CylinderGeometry(0.04, 0.04, 1.05, 6).translate(X(tx), y + 0.52, Z(tz)), '#2a2a2a']);
        for (const a of [0, Math.PI]) k.plain.push([new THREE.CylinderGeometry(0.18, 0.18, 0.04, 10).translate(X(tx) + Math.cos(a) * 0.6, y + 0.75, Z(tz) + Math.sin(a) * 0.6), '#2a2a2a']);
        SOLIDS.add(tx, tz, 0.4);
      }
      for (const px of [x0 - 0.2, x1 + 0.2]) { k.plain.push([B(px - 0.5, px + 0.5, y, y + 0.5, z1 + 2.4, z1 + 2.9), '#2f3133']); for (let i = 0; i < 3; i++) k.plain.push([new THREE.ConeGeometry(0.25, 0.9, 5).translate(X(px - 0.3 + i * 0.3), y + 0.95, Z(z1 + 2.65)), '#3f7a35']); }
      SOLIDS.add(639.2, -657.9, 2.4); }
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

/** New Pent Blocks A, B and C: their wings, entrances, walls and services */
export const newPentSite = createSite('new-pent', [
  ...WINGS.map((_, i) => wing(i)),
  // (Block A's porch stands west of the owner's mark, clear of the wing beside it on the east: owner's photo 41)
  entrance('New Pent Block A', 'A', [569.5, -628]),
  entrance('New Pent Block B', 'B', [568.4, -766]),
  entrance('New Pent Block C', 'C', [686.8, -698]),
  grounds,
]);
