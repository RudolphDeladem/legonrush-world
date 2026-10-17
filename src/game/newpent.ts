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
import { gates } from './gates';
import { BUILDINGS } from './campusmap';
import { box, merge, speckle, tri2, type Part } from './modelkit';
import { PL, createSite, render, type Block, type Spec, type Style } from './blocks';
import { concrete } from './concrete';
import { rectsOf, type Rect } from './rectilinear';
import { SOLIDS } from './solids';
import { stairsOf } from './relief';
import { car } from './cc';

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
/** glass louvre blades in a dark frame (the owner: Pent's windows are glass louvres) */
function louvres(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cols = 2) {
  g.fillStyle = '#2b2e31'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  // dark grey glass blades, a faint sheen along each edge (the owner: the louvres look black / dark from outside)
  for (let yy = y; yy < y + h - 4; yy += 9) { g.fillStyle = '#3d4246'; g.fillRect(x, yy, w, 6); g.fillStyle = '#565d62'; g.fillRect(x, yy, w, 1); g.fillStyle = '#1d2023'; g.fillRect(x, yy + 6, w, 3); }
  g.fillStyle = '#2b2e31'; for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - 2, y, 4, h);
}
/** the long sides behind the balconies (the balconies themselves are geometry): in each bay the balcony's shaded recess,
 *  a glass louvre window and a door with louvres over it */
const NP_LONG: Style = {
  bay: 3.3, up: [[30, 24, 196, 210]], ground: [[30, 256 + 24, 196, 210]],
  draw: (g) => {
    render(g, WHITE_NP);
    for (const y0 of [0, 256]) {
      g.fillStyle = '#8b8d8f'; g.fillRect(26, y0 + 16, 204, 224);
      louvres(g, 42, y0 + 50, 80, 110);
      g.fillStyle = '#3a2a22'; g.fillRect(146, y0 + 70, 62, 166);
      louvres(g, 146, y0 + 36, 62, 30, 1);
    }
    g.fillStyle = GREY_BASE; g.fillRect(0, 512 - 60, 256, 60);
    speckle(g, 0, 0, 256, 512, 200, ['rgba(140,136,126,0.12)']);
  },
};
/** the front structures' ground floor: large windows of glass louvres, no balconies (the owner's Pent PDF, page 17) */
const NP_LARGE: Style = {
  bay: 3.3, up: [], ground: [[26, 256 + 46, 204, 170]],
  draw: (g) => { render(g, WHITE_NP); louvres(g, 26, 256 + 46, 204, 170, 3); g.fillStyle = GREY_BASE; g.fillRect(0, 512 - 60, 256, 60); },
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
/** within d metres of a New Pent wing's walls: the generated hedges, beds and trees stay clear of the facades (the owner's
 *  Pent Block correction brief: oversized trees hid the entrances and brick elevations; no hedges in the photos) */
export const nearNewPentWing = (x: number, z: number, d: number) =>
  inZone(x, z) && WINGS.some(({ rects }) => rects.some(([x0, x1, z0, z1]) => x > x0 - d && x < x1 + d && z > z0 - d && z < z1 + d));
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
/** ends of wings that are rendered, not brick: the wall left of Block C's entrance (its west arm's east end) is white with
 *  louvred windows in the owner's Block C photo, as the wall right of Block A's entrance is in the Block A photo */
const WHITE_FACES: [number, number, 'x0' | 'x1' | 'z0' | 'z1'][] = [[675.6, -680.5, 'x1']];
const FRONTS: [number, number][] = [[582, -612], [543.2, -601.5], [576.4, -751.8], [539.9, -740.9], [704.7, -676.5]];
function wing(i: number): Spec {
  const { b, rects } = WINGS[i];
  // (the front structures are two floors: the owner's Balme and Pentagon brief, pairs 3, 5 and 7 - a low wing under a broad
  // hipped roof before the taller accommodation wings)
  const front = FRONTS.some(([x, z]) => x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ), FL = front ? 2 : NF;
  /** the faces of a rectangle faced in brick: its two ends, or a front structure's front (+z) */
  const ends = (r: Rect): ('x0' | 'x1' | 'z0' | 'z1')[] => ((front ? ['z1'] : r[1] - r[0] >= r[3] - r[2] ? ['x0', 'x1'] : ['z0', 'z1']) as ('x0' | 'x1' | 'z0' | 'z1')[])
    .filter((side) => !WHITE_FACES.some(([x, z, f]) => f === side && (side[0] === 'x' ? Math.abs((side === 'x0' ? r[0] : r[1]) - x) < 0.8 && z > r[2] && z < r[3] : Math.abs((side === 'z0' ? r[2] : r[3]) - z) < 0.8 && x > r[0] && x < r[1])));
  const O: [number, number] = [(b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2];
  const all = WINGS.flatMap((w) => w.rects);
  const blocks: Block[] = rects.map((r) => {
    const faces: Block['faces'] = {};
    for (const f of ends(r)) faces[f] = NP_END;
    return { x0: r[0] - O[0], x1: r[1] - O[0], z0: r[2] - O[1], z1: r[3] - O[1], floors: FL, faces, ...(front ? { floorStyle: { 0: NP_LARGE }, faceFirst: true } : {}) };
  });
  const biggest = rects.reduce((m, r) => ((r[1] - r[0]) * (r[3] - r[2]) > (m[1] - m[0]) * (m[3] - m[2]) ? r : m), rects[0]);
  return {
    name: `New Pent wing ${i + 1}`,
    axis: [1, 0], origin: O, storey: NST, style: NP_LONG, roofColor: ROOF_NP, fascia: FASCIA_NP, pitch: 0.6,
    replaces: [[(biggest[0] + biggest[1]) / 2, (biggest[2] + biggest[3]) / 2]],
    blocks,
    keep: [],
    extras: (k) => {
      const e = k.wallTop(FL), c: Part[] = [];
      // the balconies (the owner's Pent PDF, pages 17-20): on every floor of the long sides, one to each bay, the slab
      // standing out, a white parapet with its panel of facing brick, white cheeks between them; not on a front
      // structure's ground floor, which has large windows
      for (const r of rects) for (const side of ['x0', 'x1', 'z0', 'z1'] as const) {
        if (ends(r).includes(side) || all.some((o) => o !== r && touches(r, o, side))) continue;
        const alongX = side[0] === 'z', s = side.endsWith('0') ? -1 : 1;
        const face = (alongX ? (s < 0 ? r[2] : r[3]) - O[1] : (s < 0 ? r[0] : r[1]) - O[0]);
        const [a0, a1] = alongX ? [r[0] - O[0], r[1] - O[0]] : [r[2] - O[1], r[3] - O[1]];
        const len = a1 - a0, n = Math.max(1, Math.round(len / NP_LONG.bay)), bw = len / n, D = 1.1;
        const Q = (p0: number, p1: number, y0: number, y1: number, d0: number, d1: number) => {
          const [lo, hi] = [face + s * Math.min(d0, d1), face + s * Math.max(d0, d1)];
          return alongX ? box(p0, p1, y0, y1, Math.min(lo, hi), Math.max(lo, hi)) : box(Math.min(lo, hi), Math.max(lo, hi), y0, y1, p0, p1);
        };
        for (let f = front ? 1 : 0; f < FL; f++) {
          const y = PL + f * NST;
          for (let i = 0; i < n; i++) {
            const p0 = a0 + i * bw, p1 = p0 + bw;
            c.push([Q(p0, p1, y - 0.18, y + 0.02, 0, D), WHITE_NP], [Q(p0 + 0.08, p1 - 0.08, y + 0.02, y + 1.05, D - 0.14, D), WHITE_NP]);
            const m = (p0 + p1) / 2;
            k.plain.push([Q(m + 0.05, m + 0.85, y + 0.25, y + 0.85, D, D + 0.02), '#a4482f']);
            for (let yy = y + 0.33; yy < y + 0.85; yy += 0.12) k.plain.push([Q(m + 0.05, m + 0.85, yy, yy + 0.015, D + 0.02, D + 0.025), '#c7b6a3']);
            c.push([Q(p0, p0 + 0.18, y, y + NST - 0.18, 0, D), WHITE_NP]);
          }
          c.push([Q(a1 - 0.18, a1, y, y + NST - 0.18, 0, D), WHITE_NP]);
        }
      }
      if (c.length) { const m = new THREE.Mesh(merge(c), concrete(0.15)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m); }
      // the white render framing every brick face at its corners, base to eaves (the owner's Pent Block brief, slides 8, 16, 23
      // and 35: the brick panels stand between pale vertical strips)
      const pil: Part[] = [];
      for (const r of rects) for (const side of ends(r)) {
        if (all.some((o) => o !== r && touches(r, o, side))) continue;
        const s = side.endsWith('0') ? -1 : 1, alongX = side[0] === 'z';
        const at = (alongX ? (s < 0 ? r[2] : r[3]) - O[1] : (s < 0 ? r[0] : r[1]) - O[0]);
        const [a0, a1] = alongX ? [r[0] - O[0], r[1] - O[0]] : [r[2] - O[1], r[3] - O[1]];
        for (const [p0, p1] of [[a0 - 0.02, a0 + 0.5], [a1 - 0.5, a1 + 0.02]]) {
          const [d0, d1] = s > 0 ? [at - 0.02, at + 0.07] : [at - 0.07, at + 0.02];
          pil.push([alongX ? box(p0, p1, PL, e, d0, d1) : box(d0, d1, PL, e, p0, p1), WHITE_NP]);
        }
      }
      if (pil.length) { const m = new THREE.Mesh(merge(pil), concrete(0.15)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m); }
      // red-brown interlocking pavers along the foot of every open wall, 1.5 m out (the brief's slides 8-16: a paved walk
      // along the blocks between the walls and the lawns or the car parks)
      { const pos: number[] = [], uv: number[] = [], idx: number[] = [];
        for (const r of rects) for (const side of ['x0', 'x1', 'z0', 'z1'] as const) {
          if (all.some((o) => o !== r && touches(r, o, side))) continue;
          const s = side.endsWith('0') ? -1 : 1, alongX = side[0] === 'z', W = 1.5;
          const at = (alongX ? (s < 0 ? r[2] : r[3]) - O[1] : (s < 0 ? r[0] : r[1]) - O[0]);
          const [a0, a1] = alongX ? [r[0] - O[0] - W, r[1] - O[0] + W] : [r[2] - O[1], r[3] - O[1]];
          const n = Math.max(1, Math.ceil((a1 - a0) / 2));
          for (let i = 0; i <= n; i++) for (const d of [0, W]) {
            const p = a0 + ((a1 - a0) * i) / n, q = at + s * (d + 0.02);
            const [x, z] = alongX ? [p, q] : [q, p];
            pos.push(x, 0.05, z); uv.push((x + O[0]) / 1.1, (z + O[1]) / 0.95);
          }
          const b0 = pos.length / 3 - (n + 1) * 2;
          for (let i = 0; i < n; i++) { const v = b0 + i * 2; idx.push(v, v + 1, v + 3, v, v + 3, v + 2, v, v + 3, v + 1, v, v + 2, v + 3); }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
        // (both windings, so the normals are set up rather than averaged to nothing)
        g.setAttribute('normal', new THREE.Float32BufferAttribute(Array.from({ length: pos.length }, (_, i) => (i % 3 === 1 ? 1 : 0)), 3));
        const m = new THREE.Mesh(g, redHex()); m.receiveShadow = true; k.meshes.push(m); }
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
// Rebuilt from the owner's three entrance photos (Block A's front, its paved approach, the classic front view): Blocks A
// and B are the same, Block C the mirror image (mirror = -1 swaps the stair tower's open side and its louvred side).
//  - The stair tower: a white gabled middle with a tall round-headed recess over the top two floors, a ledge across it;
//    on one side open landings at every floor behind solid white parapets, on the other a rendered wall with dark
//    louvred windows; its own tiled gable roof, the ridge running back from the front.
//  - The porch before it, two storeys high: the tall arch between two thick white piers in the middle, two slender
//    square columns on each side, all on dark grey feet; two white beams across the front and the sides, a white band
//    above them; a low tiled roof over the whole width, hipped at the ends, the middle raised as a gable whose white
//    pediment carries BLOCK A / B / C over the arch; behind, the dark lobby closed by black steel grille gates; a
//    concrete landing at the foot of the paved approach.
function entrance(name: string, letter: string, at: [number, number], mirror: 1 | -1 = 1): Spec {
  return {
    name,
    axis: [1, 0], origin: at, storey: NST, style: NP_LONG, roofColor: ROOF_NP, fascia: FASCIA_NP, pitch: 0.5,
    blocks: [],
    keep: [[-6.2, 6.2, -1.5, 9]],
    extras: (k) => {
      const e = PL + NF * NST + 0.4, c: Part[] = [], m = mirror;
      const X = (x0: number, x1: number) => (m > 0 ? [x0, x1] : [-x1, -x0]) as [number, number];
      // ----- the stair tower: the gabled middle, the louvred side and the open side (the photos: as wide as the porch) -----
      const [l0, l1] = X(2.3, 5.4), [o0, o1] = X(-5.4, -2.3);
      // (the middle's front 0.7 m is built round the recess below, so the recess has depth)
      const y0 = PL + (NF - 2) * NST + 0.3, sp = e - 1.6, r = 1.05;
      c.push([box(-2.3, 2.3, 0, e, -1.5, 1.8), WHITE_NP], [box(-2.3, 2.3, 0, y0, 1.8, 2.5), WHITE_NP], [box(l0, l1, 0, e, -1.5, 2.0), WHITE_NP], [box(o0, o1, 0, e, -1.5, 0.6), WHITE_NP]);
      { const sh = new THREE.Shape(); sh.moveTo(-2.3, y0); sh.lineTo(2.3, y0); sh.lineTo(2.3, e); sh.lineTo(-2.3, e); sh.lineTo(-2.3, y0);
        const hole = new THREE.Path(); hole.moveTo(-r, y0 + 0.03); hole.lineTo(-r, sp); hole.absarc(0, sp, r, Math.PI, 0, true); hole.lineTo(r, y0 + 0.03); hole.lineTo(-r, y0 + 0.03);
        sh.holes.push(hole);
        c.push([new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: false, curveSegments: 16 }).translate(0, 0, 1.8), WHITE_NP]); }
      k.plain.push([box(-2.31, 2.31, 0, 0.9, -1.5, 2.51), GREY_BASE], [box(l0 - 0.01, l1 + 0.01, 0, 0.9, -1.5, 2.01), GREY_BASE]);
      // the open side: its ground floor closed behind the porch, above it a landing at every floor - the slab, the solid
      // white parapet, the shade of the landing inside, the end wall
      c.push([box(o0, o1, 0, PL + NST, 0.6, 2.0), WHITE_NP]);
      { const ex = m > 0 ? [-5.4, -5.1] : [5.1, 5.4];
        c.push([box(ex[0], ex[1], 0, e, 0.6, 2.0), WHITE_NP], [box(o0, o1, e - 0.3, e, 0.6, 2.0), WHITE_NP]); }
      k.plain.push([box(o0, o1, PL + NST, e - 0.3, 0.6, 0.62), '#3c3d3e']);
      for (let f = 1; f < NF; f++) {
        const y = PL + f * NST;
        c.push([box(o0, o1, y - 0.2, y, 0.6, 2.0), WHITE_NP], [box(o0, o1, y, y + 1.0, 1.8, 2.0), WHITE_NP]);
        // the louvred side: a dark window of glass louvres on every floor
        const [w0, w1] = X(3.0, 4.7);
        k.plain.push([box(w0, w1, y + 0.6, y + 2.3, 2.005, 2.04), '#2b2e31']);
        for (let yy = y + 0.7; yy < y + 2.25; yy += 0.14) k.plain.push([box(w0 + 0.05, w1 - 0.05, yy, yy + 0.05, 2.04, 2.06), '#4a5055']);
      }
      // the middle below the recess: an open landing across it on the first and second floors
      for (let f = 1; f < NF - 2; f++) {
        const y = PL + f * NST;
        k.plain.push([box(-2.0, 2.0, y + 1.0, y + NST - 0.5, 2.505, 2.53), '#3c3d3e']);
        c.push([box(-2.3, 2.3, y - 0.2, y + 1.0, 2.5, 2.7), WHITE_NP]);
      }
      // the tall round-headed recess over the top two floors: a pale open void 0.7 m deep (the Block C correction: not a
      // flat dark panel), the corridor's slab and parapet crossing it, the shade deepening toward its head; its moulded frame
      k.plain.push([box(-r, r, y0, sp, 1.805, 1.83), '#e2d9c7'], [new THREE.CircleGeometry(r, 16, 0, Math.PI).translate(0, sp, 1.831), '#d6ccb8']);
      { const fy = PL + (NF - 1) * NST;
        c.push([box(-r, r, fy - 0.2, fy, 1.8, 2.5), WHITE_NP], [box(-r, r, fy, fy + 1.0, 2.25, 2.4), WHITE_NP]);
        k.plain.push([box(-r + 0.05, r - 0.05, fy + 1.0, sp + r - 0.1, 1.84, 1.86), '#c9bfab']); }
      { const sh = new THREE.Shape(); sh.moveTo(-r - 0.25, y0); sh.lineTo(-r - 0.25, sp); sh.absarc(0, sp, r + 0.25, Math.PI, 0, true); sh.lineTo(r + 0.25, y0); sh.lineTo(r, y0); sh.lineTo(r, sp); sh.absarc(0, sp, r, 0, Math.PI, false); sh.lineTo(-r, y0); sh.lineTo(-r - 0.25, y0);
        c.push([new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: false, curveSegments: 14 }).translate(0, 0, 2.5), WHITE_NP]); }
      // the tower's gable roof (ridge running back), its white pediment to the front; flat tops beside it
      { const top = e + 2.9 * 0.6;
        k.roof.c = new THREE.Color(ROOF_NP);
        k.roof.quad([-2.9, e, 3.1], [-2.9, e, -2.1], [0, top, -2.1], [0, top, 3.1]);
        k.roof.quad([2.9, e, -2.1], [2.9, e, 3.1], [0, top, 3.1], [0, top, -2.1]);
        k.plain.push([tri2([-2.3, e, 2.52], [2.3, e, 2.52], [0, top - 0.3, 2.52]), WHITE_NP]);
        for (const sx of [-1, 1]) { const L = Math.hypot(2.9, top - e); k.plain.push([new THREE.BoxGeometry(L, 0.28, 0.08).rotateZ(-sx * Math.atan2(top - e, 2.9)).translate(sx * 1.45, (e + top) / 2, 3.12), FASCIA_NP]); }
        for (const sx of [-1, 1]) c.push([box(sx > 0 ? 2.3 : -5.4, sx > 0 ? 5.4 : -2.3, e, e + 0.5, -1.5, sx * m > 0 ? 2.0 : 0.6), WHITE_NP]); }
      // ----- the porch (the Block C correction: broad and deep, a wide front gable with a large sign, substantial cream
      // columns with grey lower parts, a few heavy beams, separate gated bays behind) -----
      const pz = 6.8, E = 4.6, GREY_LOW = 1.5;
      const pillar = (x0: number, x1: number, z0: number, z1: number, h: number) => {
        c.push([box(x0, x1, GREY_LOW, h, z0, z1), WHITE_NP]);
        k.plain.push([box(x0, x1, 0, GREY_LOW, z0, z1), '#7b7d80']);
        SOLIDS.add(...k.world((x0 + x1) / 2, (z0 + z1) / 2), Math.max(x1 - x0, z1 - z0) / 2 + 0.1);
      };
      // the thick piers either side of the arch, the raised arch head between them
      for (const sx of [-1, 1]) pillar(sx > 0 ? 0.95 : -1.7, sx > 0 ? 1.7 : -0.95, pz - 0.6, pz, E);
      { const sh = new THREE.Shape(); sh.moveTo(-1.7, 3.4); sh.lineTo(-1.7, E); sh.lineTo(1.7, E); sh.lineTo(1.7, 3.4); sh.lineTo(0.95, 3.4); sh.absarc(0, 3.4, 0.95, 0, Math.PI, false); sh.lineTo(-1.7, 3.4);
        c.push([new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false, curveSegments: 16 }).translate(0, 0, pz - 0.6), WHITE_NP]); }
      // the square columns, two each side, and their pairs at the back against the building
      for (const x of [-5.05, -2.85, 2.85, 5.05]) { pillar(x - 0.26, x + 0.26, pz - 0.52, pz, E - 0.55); pillar(x - 0.22, x + 0.22, 2.5, 2.94, E - 0.55); }
      // two heavy beams across the front, down the sides and back from every column to the building
      for (const [y0, y1] of [[2.45, 2.8], [3.3, 3.62]]) {
        for (const sx of [-1, 1]) c.push([box(sx > 0 ? 1.7 : -5.31, sx > 0 ? 5.31 : -1.7, y0, y1, pz - 0.42, pz - 0.08), WHITE_NP]);
        for (const x of [-5.05, -2.85, 2.85, 5.05]) c.push([box(x - 0.17, x + 0.17, y0, y1, 2.94, pz - 0.42), WHITE_NP]);
      }
      // the band over them and the pale ceiling of the porch
      c.push([box(-5.35, 5.35, E - 0.55, E, 2.5, pz), WHITE_NP]);
      k.plain.push([box(-5.3, 5.3, E - 0.57, E - 0.55, 2.5, pz - 0.02), '#e8e0cf']);
      // the low roof over the whole porch, hipped at the ends
      { const W = 5.95, zb = 2.0, zf = pz + 0.55, d = zf - zb, Rh = E + d * 0.28;
        k.roof.quad([W, E, zf], [-W, E, zf], [-W + d, Rh, zb], [W - d, Rh, zb]);
        k.roof.quad([-W, E, zf], [-W, E, zb], [-W + d, Rh, zb], [-W + d, Rh, zb]);
        k.roof.quad([W, E, zb], [W, E, zf], [W - d, Rh, zb], [W - d, Rh, zb]);
        k.plain.push([box(-W, W, E - 0.28, E + 0.02, zf - 0.06, zf + 0.04), FASCIA_NP]);
        k.plain.push([box(-W, -5.35, E - 0.3, E - 0.27, zb, zf), '#e8e0cf'], [box(5.35, W, E - 0.3, E - 0.27, zb, zf), '#e8e0cf'], [box(-W, W, E - 0.3, E - 0.27, pz, zf), '#e8e0cf']); }
      // the broad front gable over the columns, its white pediment carrying a large BLOCK sign over the arch; dark fascias
      // along its rakes, pale soffits under them
      { const hw = 4.75, z0 = 2.5, z1 = pz + 0.75, E2 = E + 0.12, T = E2 + hw * 0.52;
        k.roof.quad([-hw, E2, z1], [-hw, E2, z0], [0, T, z0], [0, T, z1]);
        k.roof.quad([hw, E2, z0], [hw, E2, z1], [0, T, z1], [0, T, z0]);
        k.plain.push([tri2([-hw + 0.35, E2, pz + 0.01], [hw - 0.35, E2, pz + 0.01], [0, T - 0.2, pz + 0.01]), WHITE_NP]);
        k.plain.push([box(-hw + 0.3, hw - 0.3, E, E2 + 0.02, 2.5, pz + 0.01), WHITE_NP]);
        const L = Math.hypot(hw, T - E2), ang = Math.atan2(T - E2, hw);
        for (const sx of [-1, 1]) {
          k.plain.push([new THREE.BoxGeometry(L, 0.3, 0.09).rotateZ(-sx * ang).translate(sx * hw / 2, (E2 + T) / 2, z1 + 0.02), FASCIA_NP]);
          k.plain.push([new THREE.BoxGeometry(L, 0.03, z1 - pz).rotateZ(-sx * ang).translate(sx * hw / 2, (E2 + T) / 2 - 0.2, (z1 + pz) / 2), '#e8e0cf']);
        }
        k.plain.push([box(-1.45, 1.45, 5.05, 5.85, pz + 0.02, pz + 0.06), '#f7f7f4'], [box(-1.5, 1.5, 5.0, 5.05, pz + 0.02, pz + 0.07), '#c9c4b8'], [box(-1.5, 1.5, 5.85, 5.9, pz + 0.02, pz + 0.07), '#c9c4b8']);
        k.signs.push({ text: `BLOCK ${letter}`, x: 0, y: 5.45, z: pz + 0.07, ry: 0, w: 2.7, colors: ['#f7f7f4', '#1f2f5a'] }); }
      // behind the columns the recessed circulation: a cream wall at the back with separate bays - the doorway behind the
      // arch and a gated bay either side - each closed by its own black steel grille gate, the shaded lobby beyond
      { const bays: [number, number, number][] = [[-0.85, 0.85, 2.75], [-4.75, -3.15, 2.45], [-2.55, -1.95, 2.45], [1.95, 2.55, 2.45], [3.15, 4.75, 2.45]];
        let prev = -5.3;
        for (const [b0, b1] of [...bays].sort((p, q) => p[0] - q[0])) { if (b0 > prev) c.push([box(prev, b0, 0, E - 0.55, 2.5, 2.62), WHITE_NP]); prev = b1; }
        c.push([box(prev, 5.3, 0, E - 0.55, 2.5, 2.62), WHITE_NP]);
        for (const [b0, b1, h] of bays) {
          c.push([box(b0, b1, h, E - 0.55, 2.5, 2.62), WHITE_NP]);
          k.plain.push([box(b0, b1, 0, h, 2.45, 2.47), '#2b2a28']);
          // the gate: a frame, a few uprights and a lattice of diagonals (a folding grille), not a cage of bars
          k.plain.push([box(b0, b1, h - 0.06, h, 2.56, 2.6), '#161718'], [box(b0, b1, 0.05, 0.11, 2.56, 2.6), '#161718']);
          for (let x = b0; x <= b1 + 0.01; x += (b1 - b0) / Math.max(1, Math.round((b1 - b0) / 0.55))) k.plain.push([box(x - 0.025, x + 0.025, 0.05, h, 2.56, 2.6), '#161718']);
          const n = Math.max(1, Math.round((b1 - b0) / 0.35)), w = (b1 - b0) / n;
          for (let i = 0; i < n; i++) for (const sgn of [-1, 1]) {
            const g = new THREE.BoxGeometry(0.025, Math.hypot(w, h - 0.2), 0.02).rotateZ(sgn * Math.atan2(w, h - 0.2)).translate(b0 + w * (i + 0.5), h / 2, 2.58);
            k.plain.push([g, '#1d1e1f']);
          }
        }
        k.plain.push([box(-5.3, 5.3, 0, 0.6, 2.62, 2.66), '#8d8f91']); }
      // the concrete landing, a step at its front
      k.plain.push([box(-6.1, 6.1, 0, 0.14, 2.5, pz + 1.5), '#d3cdc2'], [box(-6.1, 6.1, 0, 0.07, pz + 1.5, pz + 1.85), '#c6c0b4']);
      const mesh = new THREE.Mesh(merge(c), concrete(0.25)); mesh.castShadow = true; k.meshes.push(mesh);
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
  keep: [[596 - SO[0], 619 - SO[0], -712 - SO[1], -595 - SO[1]], [633 - SO[0], 656 - SO[0], -770 - SO[1], -650 - SO[1]], [552 - SO[0], 573 - SO[0], -622 - SO[1], -596 - SO[1]], [563 - SO[0], 614 - SO[0], -716 - SO[1], -697 - SO[1]], [557 - SO[0], 613 - SO[0], -612 - SO[1], -586 - SO[1]], [650 - SO[0], 736 - SO[0], -666 - SO[1], -655 - SO[1]], [549 - SO[0], 613 - SO[0], -746 - SO[1], -731 - SO[1]]],
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
      // the grey steel gate: a hinged leaf that opens for someone walking up to it (gates.ts) and closes after them;
      // its collision follows the leaf (the bike's and the walker's both check gates.blocked)
      const L = gate[0] - gate[1] - 0.6, leaf = new THREE.Group();
      const plate = new THREE.MeshStandardMaterial({ color: '#a9adb1', roughness: 0.55, metalness: 0.4 }), bar = new THREE.MeshStandardMaterial({ color: '#8a8e92', roughness: 0.5, metalness: 0.45 });
      leaf.add(new THREE.Mesh(new THREE.BoxGeometry(L, h + 0.05, 0.1).translate(L / 2, (h + 0.15) / 2, 0), plate));
      for (let t = 0.2; t < L - 0.05; t += 0.5) leaf.add(new THREE.Mesh(new THREE.BoxGeometry(0.04, h + 0.05, 0.14).translate(t, (h + 0.15) / 2, 0), bar));
      leaf.traverse((o) => { if (o instanceof THREE.Mesh) o.castShadow = true; });
      leaf.position.y = y;
      gates.register({ id: `new-pent:gate@${x.toFixed(1)}`, buildingId: 'new-pent', hinge: [x, gate[1] + 0.3], dir: [0, 1], length: L, open: -1.35, leaf });
    };
    // (Block A's and Block B's walls joined to the wings at both ends, behind Block A's generator: the owner's Pent PDF,
    // pages 19-20)
    wall(604.7, -649.1, -672.4, [-652.6, -656.8]);
    wall(598.5, -789.0, -810.6, [-792.6, -796.8]);
    wall(634.5, -709.4, -745.8, [-714, -720]);
    k.plain.push([B(625.5, 634.2, gy(630, -717), gy(630, -717) + 0.04, -720.2, -713.8), '#9a5644']);
    // the paved drives from Pent Road in to the gates of Blocks A and B: grey interlocking blocks (the Pent Block brief,
    // slides 21 and 24), laid in 2 m strips that follow the ground, the joints across them
    for (const [xa, xb, za, zb] of [[604.95, 622.0, -657.2, -652.2], [598.75, 616.6, -797.2, -792.2]]) {
      for (let x = xa; x < xb - 0.01; x += 2) {
        const x1 = Math.min(xb, x + 2), y = gy((x + x1) / 2, (za + zb) / 2);
        k.plain.push([B(x, x1, y + 0.01, y + 0.05, za, zb), '#8e8a83']);
        for (let xx = x + 0.5; xx < x1; xx += 0.5) k.plain.push([B(xx - 0.015, xx + 0.015, y + 0.05, y + 0.053, za, zb), '#6f6c66']);
      }
    }
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
    genShed(612.4, 617.2, -642.0, -635.6, gy(614.8, -638.8), false);
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
    // ----- Block A's car park below Pent Road (relief.ts; the owner's Pent PDF, pages 25-27, placed by the owner's later
    // correction): the rendered retaining wall along the road, the steps up it with their rails and cheek walls, the
    // gravel floor, cars along it, trees at its ends
    { const xw = 618.75, s0 = -616.4, s1 = -614.0, top = gy(621.5, -620) + 0.15;
      for (let z = -633; z < -606; z += 2) {
        const z1 = Math.min(-606, z + 2);
        if (z1 > s0 && z < s1) continue;
        c.push([B(xw - 0.15, xw + 0.15, -1.6, top, z, z1), '#c19a85']);
        for (let zz = z; zz < z1; zz += 0.8) SOLIDS.add(xw, zz, 0.2);
      }
      const st = stairsOf().find((q) => !q.alongZ && q.z0 === s0)!;
      for (let i = 0; i < st.steps; i++) {
        const xa = st.x0 + i * st.tread, y = st.at(xa + st.tread / 2);
        c.push([B(xa, xa + st.tread + 0.02, -1.6, y, s0, s1), '#b9b2a6']);
      }
      for (const z of [s0 - 0.2, s1]) {
        c.push([B(st.x0, st.x1, -1.6, top, z, z + 0.2), '#c19a85']);
        k.plain.push([B(st.x0, st.x0 + 0.05, -1.3, -0.3, z + 0.08, z + 0.12), '#a9adb1'], [B(st.x1 - 0.05, st.x1, 0, 1.0, z + 0.08, z + 0.12), '#a9adb1']);
        const len = Math.hypot(st.x1 - st.x0, 1.3), ang = Math.atan2(1.3, st.x1 - st.x0);
        k.plain.push([new THREE.BoxGeometry(len, 0.05, 0.05).rotateZ(ang).translate(X((st.x0 + st.x1) / 2), -0.65 + 1.0, Z(z + 0.1)), '#a9adb1']);
      }
      // the gravel floor and the cars along the wall and along the block
      const fy = gy(608, -620);
      k.plain.push([B(600, 618.5, fy + 0.01, fy + 0.04, -632, -607), '#a59b8c']);
      const CAR = ['#e9e9ea', '#1b1d22', '#9aa1a8', '#7a1e1e', '#2b3b5a', '#c9ccd0'];
      let ci = 0;
      for (let z = -631.5; z + 2.6 <= -607.5; z += 2.7) {
        if (z + 2.6 > s0 - 1.2 && z < s1 + 1.2) continue;
        if ((ci * 7 + 3) % 5 !== 0) car(k, X(615.0), Z(z + 1.35), CAR[ci % CAR.length], fy + 0.04, -Math.PI / 2);
        if ((ci * 5 + 1) % 4 !== 0) car(k, X(603.2), Z(z + 1.35), CAR[(ci + 3) % CAR.length], fy + 0.04, Math.PI / 2);
        ci++;
      }
      for (const [x, z] of [[609, -633.5], [609, -605.5]]) {
        const y = gy(x, z);
        k.plain.push([new THREE.CylinderGeometry(0.25, 0.4, 6, 7).translate(X(x), y + 3, Z(z)), '#5b4636']);
        for (const [dx, dy, dz, r] of [[0, 7.2, 0, 3.4], [2.2, 6.4, -1.3, 2.4], [-2.0, 6.6, 1.4, 2.6]]) k.plain.push([new THREE.IcosahedronGeometry(r, 1).scale(1, 0.65, 1).translate(X(x) + dx, y + dy, Z(z) + dz), '#3f6b2c']);
        SOLIDS.add(x, z, 0.45);
      } }
    // ----- the car parks (the owner's second Pent corrections: the blocks' car parks paved in concrete, cars parked in
    // them; photos of Block A's front and of the car park along its back wing): before the front structures of Blocks A
    // and B toward the road, below the rise behind Block A, and along the drive on Block C's west side
    { const CAR = ['#e9e9ea', '#1b1d22', '#9aa1a8', '#7a1e1e', '#2b3b5a', '#c9ccd0', '#3d4a3f', '#a33a2a'];
      let ci = 0;
      const pad = (x0: number, x1: number, z0: number, z1: number) => {
        const y = Math.min(gy(x0, z0), gy(x1, z1), gy(x0, z1), gy(x1, z0));
        k.plain.push([B(x0, x1, y + 0.005, y + 0.04, z0, z1), '#b3afa6']);
        for (let x = x0 + 6; x < x1 - 1; x += 6) k.plain.push([B(x - 0.02, x + 0.02, y + 0.04, y + 0.043, z0, z1), '#8f8b83']);
        return y;
      };
      /** a row of bays along x at z (the bays' lines from za to zb), a car in most; the cars nose toward zb */
      const rowX = (x0: number, x1: number, za: number, zb: number, y: number, skip: [number, number][] = []) => {
        for (let x = x0; x + 2.6 <= x1; x += 2.7) {
          if (skip.some(([a, b]) => x + 2.6 > a && x < b)) continue;
          k.plain.push([B(x, x + 0.1, y + 0.04, y + 0.045, Math.min(za, zb), Math.max(za, zb)), '#ecebe4']);
          if ((ci * 7 + 3) % 5 !== 0) car(k, X(x + 1.35), Z((za + zb) / 2), CAR[ci % CAR.length], y + 0.04, zb < za ? 0 : Math.PI);
          ci++;
        }
      };
      /** the same along z at x, the cars nosing toward xb */
      const rowZ = (z0: number, z1: number, xa: number, xb: number, y: number) => {
        for (let z = z0; z + 2.6 <= z1; z += 2.7) {
          k.plain.push([B(Math.min(xa, xb), Math.max(xa, xb), y + 0.04, y + 0.045, z, z + 0.1), '#ecebe4']);
          if ((ci * 7 + 3) % 5 !== 0) car(k, X((xa + xb) / 2), Z(z + 1.35), CAR[ci % CAR.length], y + 0.04, xb < xa ? Math.PI / 2 : -Math.PI / 2);
          ci++;
        }
      };
      // Block A, before the front structures
      { const y = pad(573.5, 612, -600.5, -585.9); rowX(574, 612, -593.8, -599.4, y); }
      // behind Block A, along its back wing and the road to Block B
      { const y = pad(563, 614, -714.2, -697.6); rowX(565, 612, -703.4, -697.8, y); rowX(565, 612, -705.2, -710.8, y); }
      // Block B, before the front structures either side of the entrance
      { const y = pad(549.5, 567.5, -740, -731.5); rowX(550, 567.5, -733, -738.6, y); }
      // (the hardstand reaches the road between Blocks A and B: no lawn between them, the brief's slides 20 and 22; a row
      // of cars along the road's kerb, the aerial's row on Block B's south side)
      { const y = pad(549.5, 612, -731.5, -720.3); rowX(568, 584.5, -726.8, -721.2, y); }
      { const y = pad(585.5, 612, -745, -731.5); rowX(586, 612, -733, -738.6, y); rowX(586, 612, -744.6, -739.2, y); }
      // Block C, along the drive on its west side
      { const y = pad(636.5, 643.8, -690, -684.2); rowZ(-689.5, -684.2, 643.6, 638.0, y); }
      { const y = pad(650.5, 655.0, -690, -672); rowZ(-689.5, -672, 650.6, 655.0, y); } }
    // ----- the approach to each block's entrance (the owner's entrance photos and the Block A / C corrections): from the
    // porch's concrete landing a straight path of red-brown interlocking pavers to the car park or road, a branch path
    // across it a little before the porch, lawns in the four quarters behind low concrete kerbs, a few young trees and a
    // clipped conical shrub by the landing, a lamp post beside the path; Block A's approach meets the car park strip
    { const hexStrip = (x0: number, x1: number, z0: number, z1: number) => {
        // in pieces of at most 4 m along z so the paving follows the ground
        for (let z = z0; z < z1 - 0.01; z += 4) {
          const za = z, zb = Math.min(z1, z + 4), g = new THREE.PlaneGeometry(x1 - x0, zb - za).rotateX(-Math.PI / 2);
          const uv = g.attributes.uv as THREE.BufferAttribute;
          for (let i = 0; i < uv.count; i++) uv.setXY(i, (x0 + uv.getX(i) * (x1 - x0)) / 1.1, (za + uv.getY(i) * (zb - za)) / 0.95);
          const m = new THREE.Mesh(g, redHex()); m.position.set(X((x0 + x1) / 2), gy((x0 + x1) / 2, (za + zb) / 2) + 0.035, Z((za + zb) / 2)); m.receiveShadow = true; k.meshes.push(m);
        }
      };
      const kerb = (x0: number, x1: number, z0: number, z1: number) => {
        const y = gy((x0 + x1) / 2, (z0 + z1) / 2);
        for (const [a0, a1, b0, b1] of [[x0, x1, z0, z0 + 0.15], [x0, x1, z1 - 0.15, z1], [x0, x0 + 0.15, z0, z1], [x1 - 0.15, x1, z0, z1]]) c.push([B(a0, a1, y - 0.05, y + 0.13, b0, b1), '#cfcabf']);
      };
      const youngTree = (x: number, z: number, h: number) => {
        const y = gy(x, z) + 0.05;
        k.plain.push([new THREE.CylinderGeometry(0.06, 0.1, h * 0.6, 6).translate(X(x), y + h * 0.3, Z(z)), '#5b4636']);
        for (let i = 0; i < 6; i++) k.plain.push([new THREE.IcosahedronGeometry(0.5 + (i % 3) * 0.15, 1).scale(1.1, 0.8, 1.1).translate(X(x) + Math.cos(i * 1.7) * 0.45, y + h * 0.65 + (i % 2) * 0.35, Z(z) + Math.sin(i * 1.7) * 0.45), ['#4d8a33', '#5d9a3c', '#3f7a2c'][i % 3]]);
        SOLIDS.add(x, z, 0.15);
      };
      /** cx: the porch's middle; zl: the front of its landing; ze: where the path meets the car park or road; xl, xr: the
       *  walls either side of the court */
      const approach = (cx: number, zl: number, ze: number, xl: number, xr: number) => {
        const zc = zl + 4.2, pw = 1.3, cw = 0.8;
        hexStrip(cx - pw, cx + pw, zl, ze);
        hexStrip(xl, cx - pw, zc - cw, zc + cw); hexStrip(cx + pw, xr, zc - cw, zc + cw);
        // the lawns: between the landing and the branch, and between the branch and the far end
        for (const [x0, x1] of [[xl, cx - pw], [cx + pw, xr]]) { kerb(x0 + 0.05, x1 - 0.05, zl + 0.05, zc - cw - 0.05); kerb(x0 + 0.05, x1 - 0.05, zc + cw + 0.05, ze - 0.05); }
        youngTree(cx - pw - 2.6, zc + 4.5, 3.0); youngTree(cx + pw + 3.2, zc + 6.5, 2.6); youngTree(cx - pw - 3.5, zl + 1.8, 2.4);
        // the clipped conical shrub by the landing, on the lawn beside the path
        { const x = cx - pw - 1.2, z = zl + 1.5, y = gy(x, z);
          k.plain.push([new THREE.ConeGeometry(0.75, 2.3, 10).translate(X(x), y + 1.15, Z(z)), '#2f5a24']); SOLIDS.add(x, z, 0.5); }
        // the lamp post beside the path
        { const x = cx - pw - 0.4, z = zc + 2.5, y = gy(x, z);
          k.plain.push([new THREE.CylinderGeometry(0.05, 0.08, 5.5, 8).translate(X(x), y + 2.75, Z(z)), '#b9bdc0'], [new THREE.CylinderGeometry(0.3, 0.12, 0.18, 10).translate(X(x), y + 5.55, Z(z)), '#d9dcdc']);
          SOLIDS.add(x, z, 0.12); }
      };
      approach(562.5, -628 + 8.65, -586.5, 557.0, 571.9);
      approach(558.2, -766 + 8.65, -740.0, 548.4, 568.0);
      approach(685.8, -701.5 + 8.65, -665.8, 676.2, 695.4);
      // the paved strip along the road before Block A's approach
      k.plain.push([B(557.5, 573.5, gy(565, -588) + 0.01, gy(565, -588) + 0.045, -590.0, -586.5), '#9a5444']);
      // the service strip and the AC condensers on the east front structure's west wall
      k.plain.push([B(572.5, 572.8, gy(572.6, -608) + 0.01, gy(572.6, -608) + 0.05, -621.8, -602.2), '#b5b0a5']);
      for (const z of [-606.2, -604.9, -603.6]) {
        const y = gy(572.3, z) + 0.05;
        c.push([B(572.05, 572.75, y, y + 0.55, z - 0.4, z + 0.4), '#eceeed']);
        k.plain.push([new THREE.CircleGeometry(0.2, 12).rotateY(-Math.PI / 2).translate(X(572.04), y + 0.28, Z(z) - 0.08), '#3a3c3e']);
        k.plain.push([B(572.6, 572.65, y + 0.5, y + 2.4, z + 0.3, z + 0.34), '#d9d6cf']);
        SOLIDS.add(572.4, z, 0.4);
      } }
    // ----- before Block C's south front (the owner's Balme and Pentagon brief, pair 4): asphalt from the road to the
    // building, parking along the front, the two mature trees in kerbed beds in the middle, slim lamps
    { const y = gy(700, -660);
      k.plain.push([B(651, 735, y + 0.01, y + 0.035, -665.8, -655.2), '#5a5a5d']);
      for (let x = 652; x < 734; x += 2.7) k.plain.push([B(x, x + 0.08, y + 0.035, y + 0.04, -665.6, -661.0), '#e7e6e0']);
      const CARC = ['#e9e9ea', '#1b1d22', '#9aa1a8', '#2b3b5a', '#c9ccd0'];
      let i = 0;
      for (let x = 652.2; x < 732; x += 2.7, i++) if (i % 3 !== 1 && (x < 693 || x > 717)) car(k, X(x + 1.3), Z(-663.4), CARC[i % CARC.length], y + 0.035, 0);
      for (const tx of [699.5, 711.5]) {
        c.push([B(tx - 2.2, tx + 2.2, y, y + 0.18, -664.8, -660.2), '#d6d2c8']);
        k.plain.push([B(tx - 2.05, tx + 2.05, y + 0.18, y + 0.2, -664.65, -660.35), '#4f7a33']);
        k.plain.push([new THREE.CylinderGeometry(0.35, 0.5, 5.2, 8).translate(X(tx), y + 2.6, Z(-662.5)), '#5b4636']);
        for (const [dx, dy, dz, r] of [[0, 7.2, 0, 3.8], [2.6, 6.4, -1.4, 2.8], [-2.4, 6.6, 1.5, 3.0], [0.8, 8.4, 1.0, 2.4]]) k.plain.push([new THREE.IcosahedronGeometry(r, 1).scale(1.1, 0.75, 1.1).translate(X(tx) + dx, y + dy, Z(-662.5) + dz), '#355f27']);
        SOLIDS.add(tx, -662.5, 2.2);
      }
      for (const x of [690, 721]) { k.plain.push([new THREE.CylinderGeometry(0.05, 0.08, 7, 8).translate(X(x), y + 3.5, Z(-656)), '#9ba0a4'], [B(x - 0.35, x + 0.35, y + 6.9, y + 7.05, -656.15, -655.85), '#3a3c3e']); SOLIDS.add(x, -656, 0.12); } }
    // ----- by Block A's entrance (the owner's Pent PDF, pages 21-24; its paved forecourt is now the approach above): the open
    // way through the ground floor of the front structure east of the porch (no gate); west of the porch, before the
    // other front structure's large ground-floor windows, a terrace closed by low walls of brick panels in grey frames,
    // a glazed orange food cabinet on it, satellite dishes on the balconies above
    {
      // the open passage through the east front structure's west face
      k.plain.push([B(572.72, 572.8, 0, 2.7, -610.6, -607.8), '#1c1e20'], [B(572.6, 572.8, 2.7, 2.95, -610.8, -607.6), '#f3f2ee']);
      for (const z of [-610.75, -607.65]) k.plain.push([B(572.45, 572.8, 0, 2.95, z - 0.15, z + 0.15), '#f3f2ee'], [B(572.44, 572.81, 0, 0.9, z - 0.16, z + 0.16), GREY_BASE]);
      // the terrace with its low brick walls before the west front structure
      const tw = (ax: number, az: number, bx: number, bz: number) => {
        const len = Math.hypot(bx - ax, bz - az), a2 = Math.atan2(bz - az, bx - ax), mx = X((ax + bx) / 2), mz = Z((az + bz) / 2), y = gy((ax + bx) / 2, (az + bz) / 2);
        k.plain.push([new THREE.BoxGeometry(len, 1.0, 0.24).rotateY(-a2).translate(mx, y + 0.5, mz), '#a4482f'], [new THREE.BoxGeometry(len + 0.1, 0.12, 0.34).rotateY(-a2).translate(mx, y + 1.06, mz), '#7f8285']);
        for (const [px, pz] of [[ax, az], [bx, bz]]) c.push([B(px - 0.2, px + 0.2, y, y + 1.15, pz - 0.2, pz + 0.2), '#7f8285']);
        const n = Math.ceil(len / 0.8);
        for (let i = 0; i <= n; i++) SOLIDS.add(ax + ((bx - ax) * i) / n, az + ((bz - az) * i) / n, 0.2);
      };
      tw(552.2, -608.2, 556.8, -608.2); tw(556.8, -608.2, 556.8, -604.0); tw(556.8, -601.8, 556.8, -596.6); tw(556.8, -596.6, 552.2, -596.6);
      k.plain.push([B(552.2, 556.8, 0.01, 0.06, -608.2, -596.6), '#9a5644']);
      { const y = gy(554.6, -599.5);
        k.plain.push([B(554.0, 555.2, y, y + 1.0, -599.9, -599.1), '#e8621f'], [B(554.0, 555.2, y + 1.0, y + 1.75, -599.9, -599.1), '#dfe6ea'], [B(553.95, 555.25, y + 1.75, y + 1.85, -599.95, -599.05), '#e8621f']);
        SOLIDS.add(554.6, -599.5, 0.7); }
      for (const [y, z] of [[PL + NST + 1.6, -605.5], [PL + NST + 1.6, -600.0], [PL + 2 * NST + 1.6, -603.0]]) k.plain.push([new THREE.CylinderGeometry(0.42, 0.42, 0.05, 16).rotateZ(Math.PI / 2).translate(X(553.4), gy(553, z) + y, Z(z)), '#e9e9e6']); }
    // the Boba tea kiosk by Block C (the owner's Pent PDF, page 16; placed by the owner's later correction: on Block C's
    // west side by Pent Road where the tree stood, its front facing west to the road): a yellow box on a dark base,
    // painted with drinks, its wide serving window under a yellow awning, the BoBa logo board standing on its roof;
    // before it a square of artificial turf with black high tables and stools, black planter boxes of spiky palms along
    // its edges, a lamp post
    { const x0 = 638.4, x1 = 641.0, z0 = -680.2, z1 = -675.8, y = gy(639.7, -678);
      k.plain.push([B(632.2, x0, y + 0.01, y + 0.05, -683.6, -672.4), '#4f9a3a']);
      k.plain.push([B(x0, x1, y, y + 0.35, z0, z1), '#2a2c2e'], [B(x0, x1, y + 0.35, y + 2.7, z0, z1), '#f2d22a']);
      // the serving window and its counter on the west front, the drinks painted on it and on the ends
      k.plain.push([B(x0 - 0.03, x0, y + 1.2, y + 2.3, z0 + 0.4, z1 - 0.4), '#2a2826'], [B(x0 - 0.45, x0, y + 1.1, y + 1.18, z0 + 0.3, z1 - 0.3), '#e9e7e0']);
      for (const [z, col] of [[z1 - 0.85, '#7a4a2a'], [z0 + 0.25, '#f4efe2']] as [number, string][]) k.plain.push([B(x0 - 0.02, x0, y + 0.6, y + 1.05, z, z + 0.6), col]);
      for (const zz of [z0 - 0.02, z1]) for (const [xx, col] of [[x0 + 0.4, '#7a4a2a'], [x0 + 1.3, '#f4efe2']] as [number, string][]) k.plain.push([B(xx, xx + 0.7, y + 0.8, y + 2.2, zz, zz + 0.02), col]);
      const r = new THREE.BufferGeometry();
      r.setAttribute('position', new THREE.Float32BufferAttribute([X(x0), y + 2.75, Z(z0 - 0.1), X(x0), y + 2.75, Z(z1 + 0.1), X(x0 - 1.6), y + 2.3, Z(z1 + 0.1), X(x0 - 1.6), y + 2.3, Z(z0 - 0.1)], 3));
      r.setIndex([0, 2, 1, 0, 3, 2, 0, 1, 2, 0, 2, 3]); r.computeVertexNormals();
      k.plain.push([r, '#f5d84a'], [B(x0 - 1.62, x0 - 1.55, y + 2.1, y + 2.32, z0 - 0.1, z1 + 0.1), '#e8c21a']);
      // the logo board on the roof, facing the road
      k.plain.push([B(x0 + 0.1, x0 + 0.15, y + 2.7, y + 3.5, z1 - 2.4, z1 - 0.1), '#f7f2e6'], [B(x0 + 0.08, x0 + 0.1, y + 2.75, y + 3.45, z1 - 0.8, z1 - 0.15), '#f2c41e']);
      k.signs.push({ text: 'BoBa Udous', x: X(x0 + 0.07), y: y + 3.1, z: Z(z1 - 1.25), ry: -Math.PI / 2, w: 2.1, colors: ['#f7f2e6', '#6a3a1e'] });
      for (let z = z0; z <= z1; z += 0.8) SOLIDS.add(639.7, z, 1.4);
      // high tables and stools on the turf
      for (const [tx, tz] of [[636.4, -681.6], [634.6, -678.8], [636.2, -675.6], [634.0, -674.2]]) {
        k.plain.push([new THREE.CylinderGeometry(0.32, 0.32, 0.05, 12).translate(X(tx), y + 1.05, Z(tz)), '#1d1d1d'], [new THREE.CylinderGeometry(0.04, 0.04, 1.05, 6).translate(X(tx), y + 0.52, Z(tz)), '#1d1d1d']);
        for (const a of [0.4, 2.6, 4.4]) { const sx = X(tx) + Math.cos(a) * 0.62, sz = Z(tz) + Math.sin(a) * 0.62; k.plain.push([new THREE.CylinderGeometry(0.17, 0.17, 0.04, 10).translate(sx, y + 0.78, sz), '#1d1d1d'], [new THREE.CylinderGeometry(0.025, 0.025, 0.78, 5).translate(sx, y + 0.39, sz), '#1d1d1d']); }
        SOLIDS.add(tx, tz, 0.5);
      }
      // black planter boxes of spiky palms along the turf's road edge and its ends, a gap left in the middle
      for (const [px, pz, alongX] of [[632.6, -682.0, false], [632.6, -674.0, false], [634.6, -683.2, true], [634.6, -672.8, true]] as [number, number, boolean][]) {
        const hx = alongX ? 1.1 : 0.35, hz = alongX ? 0.35 : 1.1;
        k.plain.push([B(px - hx, px + hx, y, y + 0.55, pz - hz, pz + hz), '#2c2e30']);
        for (let i = 0; i < 4; i++) {
          const lx = px + (alongX ? -0.7 + i * 0.46 : 0), lz = pz + (alongX ? 0 : -0.7 + i * 0.46);
          for (let j = 0; j < 6; j++) k.plain.push([new THREE.ConeGeometry(0.05, 0.95, 3).translate(0, 0.47, 0).rotateZ(0.55).rotateY(j * 1.05 + i).translate(X(lx), y + 0.55, Z(lz)), j & 1 ? '#3f7a35' : '#4f8a3a']);
        }
        SOLIDS.add(px, pz, Math.max(hx, hz));
      }
      // the lamp post
      k.plain.push([new THREE.CylinderGeometry(0.06, 0.09, 7, 8).translate(X(632.4), y + 3.5, Z(-684.4)), '#9ba0a4'], [B(632.0, 632.8, y + 6.9, y + 7.05, -684.55, -684.25), '#3a3c3e']);
      SOLIDS.add(632.4, -684.4, 0.15); }
    // the tree on the corner where the kiosk stood (the two swapped places: the owner)
    { const x = 639.2, z = -657.8, y = gy(x, z);
      k.plain.push([new THREE.CylinderGeometry(0.22, 0.36, 4.5, 7).translate(X(x), y + 2.25, Z(z)), '#5b4636']);
      for (const [dx, dy, dz, r] of [[0, 5.6, 0, 2.8], [1.8, 5.0, -1.0, 2.0], [-1.6, 5.2, 1.2, 2.2]]) k.plain.push([new THREE.IcosahedronGeometry(r, 1).scale(1, 0.7, 1).translate(X(x) + dx, y + dy, Z(z) + dz), '#3f6b2c']);
      SOLIDS.add(x, z, 0.4); }
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

let redHexMat: THREE.MeshStandardMaterial | null = null;
/** red-brown hexagonal pavers (Block A's forecourt) */
function redHex() {
  if (redHexMat) return redHexMat;
  const cv = document.createElement('canvas');
  cv.width = 128; cv.height = 110;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#5b3328'; g.fillRect(0, 0, 128, 110);
  const r = 16, w = Math.sqrt(3) * r;
  for (let row = -1; row < 5; row++) for (let col = -1; col < 6; col++) {
    const cx = col * w + (row & 1 ? w / 2 : 0), cy = row * r * 1.5;
    g.beginPath();
    for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; g.lineTo(cx + (r - 1.6) * Math.cos(a), cy + (r - 1.6) * Math.sin(a)); }
    g.closePath(); g.fillStyle = ['#9a5444', '#93503f', '#a05a48', '#8c4b3c'][(row * 7 + col * 3 + 16) % 4]; g.fill();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  redHexMat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
  return redHexMat;
}

/** New Pent Blocks A, B and C: their wings, entrances, walls and services */
export const newPentSite = createSite('new-pent', [
  ...WINGS.map((_, i) => wing(i)),
  // (each porch in the middle of its court between the wings either side: the Block A / C corrections, the owner's New
  // Pent corrections for Block B; Block A's had stood against the wing on its east)
  entrance('New Pent Block A', 'A', [562.5, -628]),
  entrance('New Pent Block B', 'B', [558.2, -766]),
  // (Block C is Blocks A's and B's mirror image: the owner; its tower against the wing's face, z -701.5, as Block A's is)
  entrance('New Pent Block C', 'C', [685.8, -701.5], -1),
  grounds,
]);
