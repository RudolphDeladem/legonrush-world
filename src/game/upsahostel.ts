// The UPSA Hostel and the Vice Chancellors Ghana Office Complex on IPS Road (the owner's site brief, IMG-03 to IMG-09,
// and the road brief's R27-R30; numbers in ipsplan.ts), on their mapped outlines:
// - the hostel (osm:way/1217291474): a cream block of ten storeys round a courtyard, its two end wings standing forward
//   toward the road with the middle set back (the outline's own shape, IMG-04, R29, R30); the wings' fronts in columns
//   of recessed balconies, pairs of small windows and grey louvre strips; the central bay standing forward a little,
//   a storey taller, its larger blue-glazed windows, the UPSA HOSTEL letters, the fanlight in its gable and the entrance
//   canopy; low red-brown hipped roofs; open galleries with railings round the courtyard (assumed: no photograph of the
//   courtyard was supplied with these briefs);
// - the hostel's long block to the east (osm:way/394252035, IMG-03, R10, R11): the same family, white, nine storeys;
// - the hostel's frontage: the red-roofed shop at the fence line west of the gate (osm:way/1217291473, IMG-04), the white
//   wall-and-railing fence, the gate on the hostel road with its sliding leaf parked open, the grey-paved forecourt with
//   its parked cars, the paved walk and red earth outside the fence;
// - the VCG office (osm:way/1217291476): white, four storeys, flat-roofed behind a parapet; the stepped front: the
//   projecting box over the entrance with its large dark window, the broad layered canopy on two square columns, the
//   recessed dark ground-floor glazing, the blue sign on the top storey; bands of grey-framed windows (IMG-05, IMG-08,
//   IMG-09, R27);
// - the VCG compound: the white wall with its zig-zag top between square pillars and the black railing over it (IMG-05,
//   IMG-09), the black gate leaves swung open on the side drive (IMG-07), the small red-roofed gatehouse, the brick-paved
//   forecourt and side drive, planted beds, parked cars (IMG-06, IMG-07, R28).
import * as THREE from 'three';
import { BUILDINGS } from './campusmap';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { box, canvas, merge, tri2, type Part } from './modelkit';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { Bag, hash, lowWing, tuft, vnoise, wallSolids, type R4 } from './enkit';
import { hipRoof } from './waccbip';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { rectsOf } from './rectilinear';
import { car } from './cc';
import { pave, pavers } from './upsa';
import { HOSTEL, VCG, zFront, FRONT_HALF } from './ipsplan';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#efe9dc') };
const O: [number, number] = [1735, -815];
const L = (x: number, z: number): [number, number] => [x - O[0], z - O[1]];
const HIP = { gw: 0, tri: false }, OPEN = { gw: 99, tri: false };
const CREAM = '#e7dbc0', HWHITE = '#ecebe5', VWHITE = '#f4f4f1';

// ---------- facade textures: one bay by one storey each, repeated across the faces ----------
type Tex = 'win' | 'bal' | 'louv' | 'big' | 'gal' | 'vwin' | 'vblank';
const BAY: Record<Tex, number> = { win: 3.0, bal: 3.0, louv: 1.5, big: 5.25, gal: 3.2, vwin: 3.6, vblank: 3.6 };
const STOREY = { h: 2.9, v: 3.6 };
const texCache = new Map<string, THREE.MeshStandardMaterial>();
function facadeMat(kind: Tex, bg: string) {
  const key = kind + bg;
  let m = texCache.get(key);
  if (m) return m;
  const W = 128, H = 128;
  const t = canvas(W, H, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    // a faint floor band at the slab line, a little weathering under it
    g.fillStyle = 'rgba(120,100,70,0.12)'; g.fillRect(0, H - 6, W, 6);
    g.fillStyle = 'rgba(90,80,60,0.06)'; g.fillRect(0, 0, W, 18);
    const win = (x: number, y: number, w: number, h: number, glass = '#2d3034', frame = '#7c7f80') => {
      g.fillStyle = frame; g.fillRect(x - 2, y - 2, w + 4, h + 4);
      const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, glass); gr.addColorStop(1, '#1a1c1e');
      g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.fillStyle = frame; g.fillRect(x + w / 2 - 1, y, 2, h);
    };
    if (kind === 'win') { win(30, 34, 24, 40); win(74, 34, 24, 40); }
    if (kind === 'bal') {
      // the recess: dark, a door and a window at the back, the parapet across its foot with a rail on it
      g.fillStyle = '#3b3530'; g.fillRect(14, 12, 100, 104);
      g.fillStyle = '#4f463e'; g.fillRect(28, 30, 22, 70); g.fillStyle = '#2a2724'; g.fillRect(64, 36, 34, 34);
      g.fillStyle = bg; g.fillRect(14, 78, 100, 38);
      g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(14, 78, 100, 4);
      g.fillStyle = '#8c8f90'; g.fillRect(14, 70, 100, 3);
    }
    if (kind === 'louv') {
      g.fillStyle = '#4a4c4d'; g.fillRect(20, 8, 88, 112);
      for (let x = 24; x < 106; x += 8) { g.fillStyle = '#6c6f70'; g.fillRect(x, 8, 4, 112); }
    }
    if (kind === 'big') { win(16, 22, 40, 62, '#5d7f9e', '#eeeeea'); win(72, 22, 40, 62, '#5d7f9e', '#eeeeea'); g.fillStyle = '#eeeeea'; g.fillRect(16, 50, 40, 2); g.fillRect(72, 50, 40, 2); }
    if (kind === 'gal') {
      g.fillStyle = '#4a433b'; g.fillRect(0, 10, W, 106);
      for (const x of [14, 78]) { g.fillStyle = '#6b4a32'; g.fillRect(x, 34, 22, 74); }
      g.fillStyle = '#2b2d2f'; g.fillRect(46, 42, 20, 22); g.fillRect(108, 42, 18, 22);
      g.fillStyle = bg; g.fillRect(0, 84, W, 32); g.fillRect(0, 0, W, 10);
      g.fillStyle = '#9a9c9c'; g.fillRect(0, 78, W, 3);
      for (let x = 4; x < W; x += 10) g.fillRect(x, 78, 2, 8);
    }
    if (kind === 'vwin') {
      g.fillStyle = '#d9dbdc'; g.fillRect(0, H - 14, W, 8);
      g.fillStyle = '#9a9ea2'; g.fillRect(12, 30, 104, 56);
      g.fillStyle = '#2b3138'; g.fillRect(15, 33, 98, 50);
      g.fillStyle = '#9a9ea2'; for (const x of [39, 63, 87]) g.fillRect(x, 33, 3, 50);
      g.fillRect(15, 50, 98, 2);
    }
    if (kind === 'vblank') { g.fillStyle = '#d9dbdc'; g.fillRect(0, H - 14, W, 8); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.85, side: THREE.DoubleSide });
  texCache.set(key, m);
  return m;
}
/** the facade quads of one model, gathered per texture */
class Faces {
  sets = new Map<string, { kind: Tex; bg: string; pos: number[]; uv: number[]; idx: number[] }>();
  constructor(private o: [number, number]) {}
  /** a vertical face: along x (alongX) at z = at, or along z at x = at; from a0 to a1; y0..y1; storey height sh */
  add(kind: Tex, bg: string, alongX: boolean, at: number, a0: number, a1: number, y0: number, y1: number, sh: number) {
    const key = kind + bg;
    let s = this.sets.get(key);
    if (!s) this.sets.set(key, (s = { kind, bg, pos: [], uv: [], idx: [] }));
    const P = (a: number, y: number) => (alongX ? [a - this.o[0], y, at - this.o[1]] : [at - this.o[0], y, a - this.o[1]]);
    const n = s.pos.length / 3, w = BAY[kind];
    s.pos.push(...P(a0, y0), ...P(a1, y0), ...P(a1, y1), ...P(a0, y1));
    s.uv.push(0, y0 / sh, Math.abs(a1 - a0) / w, y0 / sh, Math.abs(a1 - a0) / w, y1 / sh, 0, y1 / sh);
    s.idx.push(n, n + 1, n + 2, n, n + 2, n + 3);
  }
  /** a face divided along its length into bays of the given kinds in turn (a pattern string of w b l), each its width */
  pattern(pat: string, bg: string, alongX: boolean, at: number, a0: number, a1: number, y0: number, y1: number, sh: number) {
    const kinds = [...pat].map((ch) => ({ w: 'win', b: 'bal', l: 'louv' }[ch] as Tex));
    const tot = kinds.reduce((s, k) => s + BAY[k], 0), f = (a1 - a0) / tot;
    let a = a0;
    for (const k of kinds) { const e = a + BAY[k] * f; this.add(k, bg, alongX, at, a, e, y0, y1, sh); a = e; }
  }
  finish(k: Kit) {
    for (const s of this.sets.values()) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(s.pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(s.uv, 2));
      g.setIndex(s.idx); g.computeVertexNormals();
      const m = new THREE.Mesh(g, facadeMat(s.kind, s.bg)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    }
  }
}

const outline = (x0: number, x1: number, z0: number, z1: number) => BUILDINGS.find((b) => Math.abs(b.minX - x0) < 0.3 && Math.abs(b.maxX - x1) < 0.3 && Math.abs(b.minZ - z0) < 0.3 && Math.abs(b.maxZ - z1) < 0.3);
const ring = (b: { pts: Float32Array }) => { const r: [number, number][] = []; for (let i = 0; i < b.pts.length; i += 2) r.push([b.pts[i], b.pts[i + 1]]); return r; };

// ======================================================================================================
// the UPSA Hostel
// ======================================================================================================
/** the main block's parts (world): the wings, the middle range, the central bay, the south range, the courtyard */
const HB = {
  ww: [1711.1, 1725.8, -809.7, -756.5] as R4, ew: [1752.2, 1767.4, -811.7, -757.5] as R4,
  mid: [1725.8, 1752.2, -801.2, -789] as R4, bay: [1734.4, 1744.9, -805.4, -801.2] as R4, south: [1725.8, 1752.2, -769, -756.8] as R4,
  court: [1725.8, 1752.2, -789, -769] as R4, floors: 10,
};
/** the east block's box (its outline turned square to the axes) */
const EB: R4 = [1777.7, 1808.1, -840, -759.4];
const SHOP = outline(1698.5, 1710.8, -846.1, -823.6);

const hostelSpec: Spec = {
  name: 'UPSA Hostel', axis: [1, 0], origin: O, storey: STOREY.h, style: PLAIN, roofColor: '#8f4f3c', fascia: '#6d5a4a', pitch: 0.25,
  replaces: [[1740, -785], [1792, -800], ...(SHOP ? [[1702, -835] as [number, number]] : [])],
  onGround: true,
  blocks: [],
  keep: [[1698.5 - O[0], 1815 - O[0], -866 - O[1], -750 - O[1]]],
  extras: (k: Kit) => {
    const f = new Faces(O), b = new Bag(O), c: Part[] = [];
    const M = (x: number, z: number): [number, number] => [x - O[0], z - O[1]];
    const sh = STOREY.h, H = HB.floors * sh;
    k.roof.c = new THREE.Color('#8f4f3c');
    // ---- the main block's faces ----
    const [wx0, wx1, wz0, wz1] = HB.ww, [ex0, ex1, ez0, ez1] = HB.ew, [mx0, mx1, mz0, mz1] = HB.mid, [cx0, cx1, cz0, cz1] = HB.court;
    // the wings' fronts toward the road (IMG-04: louvre strips at the outer edges, balcony columns, pairs of windows)
    f.pattern('lbwbwl', CREAM, true, wz0, wx0, wx1, 0, H, sh);
    f.pattern('lbwbwl', CREAM, true, ez0, ex0, ex1, 0, H, sh);
    // their outer sides, long (IMG-03: louvre strips between groups of windows and balconies)
    f.pattern('lwwblwwblwwbl', CREAM, false, wx0, wz0, wz1, 0, H, sh);
    f.pattern('lwwblwwblwwbl', CREAM, false, ex1, ez0, ez1, 0, H, sh);
    // their inner returns toward the set-back middle, their backs
    f.pattern('bw', CREAM, false, wx1, wz0, mz0, 0, H, sh); f.pattern('wb', CREAM, false, ex0, ez0, mz0, 0, H, sh);
    f.pattern('wwwww', CREAM, true, wz1, wx0, wx1, 0, H, sh); f.pattern('wwwww', CREAM, true, ez1, ex0, ex1, 0, H, sh);
    // the middle range's front either side of the bay (balconies in the inner corners, pairs of windows)
    f.pattern('bww', CREAM, true, mz0, mx0, HB.bay[0], 0, H, sh); f.pattern('wwb', CREAM, true, mz0, HB.bay[1], mx1, 0, H, sh);
    // the south range's back
    f.pattern('wwwwwwww', CREAM, true, HB.south[3], HB.south[0], HB.south[1], 0, H, sh);
    // the courtyard: open galleries with their railings on all four sides
    f.add('gal', CREAM, true, cz0, cx0, cx1, sh, H, sh); f.add('gal', CREAM, true, cz1, cx0, cx1, sh, H, sh);
    f.add('gal', CREAM, false, cx0, cz0, cz1, sh, H, sh); f.add('gal', CREAM, false, cx1, cz0, cz1, sh, H, sh);
    for (const [al, at, a0, a1] of [[true, cz0, cx0, cx1], [true, cz1, cx0, cx1], [false, cx0, cz0, cz1], [false, cx1, cz0, cz1]] as [boolean, number, number, number][]) f.add('win', CREAM, al, at, a0, a1, 0, sh, sh);
    // ---- the central bay: a storey taller, larger blue-glazed windows, the letters, the gable with its fanlight ----
    const [bx0, bx1, bz0, bz1] = HB.bay, BH = H + sh;
    f.add('big', CREAM, true, bz0, bx0, bx1, sh, BH, sh);
    f.add('win', CREAM, false, bx0, bz0, bz1, 0, BH, sh); f.add('win', CREAM, false, bx1, bz0, bz1, 0, BH, sh);
    // (the bay runs back through the middle range: its sides and back above the range's eaves)
    f.add('win', CREAM, false, bx0, bz1, mz1 - 2, H, BH, sh); f.add('win', CREAM, false, bx1, bz1, mz1 - 2, H, BH, sh); f.add('win', CREAM, true, mz1 - 2, bx0, bx1, H, BH, sh);
    // its ground storey: the dark glazed entrance under a flat canopy on two posts
    c.push([box(...L2(bx0, bx1), 0, sh, ...Lz(bz0 + 0.02, bz0 + 0.04)), '#2b2e31']);
    b.door.push(b.plane(true, bz0 - 0.05, -1, (bx0 + bx1) / 2, 2.4, 0, 2.4));
    c.push([box(...L2(bx0 + 0.6, bx1 - 0.6), sh - 0.25, sh, ...Lz(bz0 - 2.6, bz0)), '#e9e6de']);
    for (const x of [bx0 + 1.2, bx1 - 1.2]) { c.push([box(...L2(x - 0.15, x + 0.15), 0, sh - 0.25, ...Lz(bz0 - 2.4, bz0 - 2.1)), '#d9d5cc']); SOLIDS.add(x, bz0 - 2.25, 0.25); }
    k.signs.push({ text: 'UPSA  HOSTEL', x: (bx0 + bx1) / 2 - O[0], y: 4 * sh + 1.5, z: bz0 - 0.03 - O[1], ry: Math.PI, w: 7.4, colors: [CREAM, '#27427f'] });
    // the gable: a cream triangle over the bay's front, the fanlight in it, the bay's own roof behind
    const gy = BH, gh = (bx1 - bx0) / 2 * 0.55;
    c.push([tri2([bx0 - 0.4 - O[0], gy, bz0 - 0.3 - O[1]], [bx1 + 0.4 - O[0], gy, bz0 - 0.3 - O[1]], [(bx0 + bx1) / 2 - O[0], gy + gh + 0.2, bz0 - 0.3 - O[1]]), CREAM]);
    const fan = new THREE.CircleGeometry(1.9, 20, 0, Math.PI).translate((bx0 + bx1) / 2 - O[0], gy + 0.15, bz0 - 0.36 - O[1]).rotateY(0);
    c.push([fan, '#6d93b5']);
    hipRoof(k, M, bx0 - 0.4, bx1 + 0.4, bz0 - 0.3, mz1 - 2, gy, 0.55, 'z', [OPEN, HIP], c, '#6d5a4a');
    // the mast on the roof (IMG-04)
    c.push([new THREE.CylinderGeometry(0.05, 0.08, 6, 6).translate((bx0 + bx1) / 2 - O[0], H + 6, (mz0 + mz1) / 2 - O[1]), '#9a9c9c']);
    // ---- the roofs: low red-brown hips over the wings and the ranges ----
    hipRoof(k, M, wx0 - 0.6, wx1 + 0.6, wz0 - 0.6, wz1 + 0.6, H, 0.25, 'z', [HIP, HIP], c, '#6d5a4a');
    hipRoof(k, M, ex0 - 0.6, ex1 + 0.6, ez0 - 0.6, ez1 + 0.6, H, 0.25, 'z', [HIP, HIP], c, '#6d5a4a');
    hipRoof(k, M, mx0, mx1, mz0 - 0.6, mz1 + 0.6, H, 0.25, 'x', [OPEN, OPEN], c, '#6d5a4a');
    hipRoof(k, M, HB.south[0], HB.south[1], HB.south[2] - 0.6, HB.south[3] + 0.6, H, 0.25, 'x', [OPEN, OPEN], c, '#6d5a4a');
    // the eaves' soffits and a slab line at the top of the walls
    for (const [x0, x1, z0, z1] of [HB.ww, HB.ew, [mx0, mx1, mz0, mz1], HB.south] as R4[]) c.push([box(...L2(x0 - 0.6, x1 + 0.6), H - 0.12, H, ...Lz(z0 - 0.6, z1 + 0.6)), '#d8cdb4']);
    // ---- the courtyard: a lawn crossed by paved paths, a tree, the ground-floor walk round it ----
    k.meshes.push(new THREE.Mesh(drapeAt(O, cx0, cx1, cz0, cz1, 0.5, 0.04, (x, z) => {
      if (x < cx0 + 2.2 || x > cx1 - 2.2 || z < cz0 + 2.2 || z > cz1 - 2.2) return [0.62, 0.6, 0.56];
      if (Math.abs(x - (cx0 + cx1) / 2) < 1.0 || Math.abs(z - (cz0 + cz1) / 2) < 1.0) return [0.66, 0.63, 0.58];
      const n = vnoise(x * 0.4, z * 0.4); return [0.36 + n * 0.06, 0.5 + n * 0.08, 0.24];
    }), groundCover()));
    broadleaf(k, b.leaf, (cx0 + cx1) / 2 + 5.5, (cz0 + cz1) / 2 + 4.5, { h: 6.5, spread: 8, seed: 41, origin: O, round: true });
    // ---- the east block: white, nine storeys, the same family ----
    {
      const [x0, x1, z0, z1] = EB, H2 = 9 * sh;
      f.pattern('lbwwbl', HWHITE, true, z0, x0, x1, 0, H2, sh);
      f.pattern('lwwblwwblwwblwwblwwbl', HWHITE, false, x0, z0, z1, 0, H2, sh);
      f.pattern('lwwblwwblwwblwwblwwbl', HWHITE, false, x1, z0, z1, 0, H2, sh);
      f.pattern('wwwwwwwwww', HWHITE, true, z1, x0, x1, 0, H2, sh);
      hipRoof(k, M, x0 - 0.6, x1 + 0.6, z0 - 0.6, z1 + 0.6, H2, 0.22, 'z', [HIP, HIP], c, '#6d5a4a');
      c.push([box(...L2(x0 - 0.6, x1 + 0.6), H2 - 0.12, H2, ...Lz(z0 - 0.6, z1 + 0.6)), '#dcdad2']);
      wallSolids(x0, z0, x1, z0); wallSolids(x1, z0, x1, z1); wallSolids(x1, z1, x0, z1); wallSolids(x0, z1, x0, z0);
    }
    // the main block's outline and the courtyard's walls stop a bike
    const hr = outline(1711.1, 1770.5, -811.9, -755.8);
    if (hr) { const r = ring(hr); for (let i = 0; i < r.length; i++) wallSolids(r[i][0], r[i][1], r[(i + 1) % r.length][0], r[(i + 1) % r.length][1]); }

    // ---- the frontage: the shop by the gate, the fence, the gate, the forecourt ----
    if (SHOP) for (const r of rectsOf(ring(SHOP))) lowWing(k, b, r as R4, { eave: 3.0, pitch: 0.42, roof: '#a3442f', faces: { z0: 'WDW', x0: 'W-W', x1: 'W-W' }, y: 0 });
    const fz = HOSTEL.front, g0 = HOSTEL.gate.x - HOSTEL.gate.half, g1 = HOSTEL.gate.x + HOSTEL.gate.half;
    const fence = (x0: number, x1: number) => {
      const n = Math.max(1, Math.round((x1 - x0) / 2.8));
      for (let j = 0; j <= n; j++) {
        const x = x0 + ((x1 - x0) * j) / n, [px, pz] = L(x, fz);
        c.push([box(px - 0.22, px + 0.22, 0, 2.0, pz - 0.22, pz + 0.22), '#f1efe9'], [box(px - 0.28, px + 0.28, 2.0, 2.12, pz - 0.28, pz + 0.28), '#dedbd2']);
        if (j === n) break;
        const xb = x0 + ((x1 - x0) * (j + 1)) / n, [qx] = L(xb, fz);
        c.push([box(px, qx, 0, 0.9, pz - 0.12, pz + 0.12), '#f1efe9'], [box(px, qx, 0.9, 0.98, pz - 0.15, pz + 0.15), '#dedbd2'], [box(px, qx, 1.82, 1.88, pz - 0.04, pz + 0.04), '#f4f4f1']);
        for (let x2 = px + 0.15; x2 < qx - 0.05; x2 += 0.14) c.push([box(x2 - 0.02, x2 + 0.02, 0.98, 1.85, pz - 0.02, pz + 0.02), '#f4f4f1']);
      }
      wallSolids(x0, fz, x1, fz, 0.25);
    };
    fence(SHOP ? SHOP.maxX : HOSTEL.x0, g0); fence(g1, HOSTEL.x1);
    // the gate's sliding leaf, white railings on a bottom rail, parked open behind the fence east of the opening
    {
      const [ax, az] = L(g1 + 0.3, fz + 0.5), [bx2] = L(g1 + 6.5, fz);
      c.push([box(ax, bx2, 0.08, 0.18, az - 0.03, az + 0.03), '#f4f4f1'], [box(ax, bx2, 1.72, 1.8, az - 0.03, az + 0.03), '#f4f4f1']);
      for (let x = ax; x < bx2; x += 0.14) c.push([box(x - 0.02, x + 0.02, 0.18, 1.72, az - 0.02, az + 0.02), '#f4f4f1']);
    }
    // the forecourt: grey pavers to the building, a kerb round the lawn strip inside the fence, parked cars
    pave(k, 1711 - O[0], 1772 - O[0], fz + 0.2 - O[1], -805.6 - O[1], pavers('grey'));
    k.meshes.push(new THREE.Mesh(drapeAt(O, 1711.2, 1771.8, fz + 0.3, fz + 2.6, 0.5, 0.06, (x) => (x > g0 - 0.5 && x < g1 + 0.5 ? null : [0.38, 0.52, 0.25])), groundCover()));
    for (let x = 1713; x < 1771; x += 6.5 + hash(x, 3) * 3) if (x < g0 - 2 || x > g1 + 2) b.leaf.push([new THREE.IcosahedronGeometry(0.6, 1).scale(1.3, 0.8, 1.1).translate(x - O[0], 0.5, fz + 1.4 - O[1]), '#4f7a34']);
    const ck = { ...k, plain: [] as Part[] } as Kit;
    // (in the bays between the forecourt's mapped drives, osm:way/794296950-794296952)
    for (const [x, z, col, ry] of [[1748, -820, '#dcdcdc', Math.PI / 2], [1748, -826.5, '#20242b', Math.PI / 2], [1764, -822, '#7d1f22', Math.PI / 2], [1764, -828.5, '#e6e6e4', Math.PI / 2]] as [number, number, string, number][]) {
      car(ck, x - O[0], z - O[1], col, 0.03, ry); SOLIDS.add(x - 1.6, z, 1.0); SOLIDS.add(x, z, 1.2); SOLIDS.add(x + 1.6, z, 1.0);
    }
    for (const p of ck.plain) c.push(p);
    // outside the fence: a paved walk along it, red earth to the frontage road's kerb (IMG-04, R30)
    k.meshes.push(new THREE.Mesh(drapeAt(O, HOSTEL.x0, HOSTEL.x1, -866, fz - 0.2, 0.5, 0.035, (x, z) => {
      const zr = zFront(x) + FRONT_HALF + 0.2;
      if (z < zr || (x > g0 - 0.3 && x < g1 + 0.3)) return null;
      if (z > fz - 2.0) { const h = hash(Math.floor(x * 2), Math.floor(z * 2)) * 0.04; return [0.6 - h, 0.58 - h, 0.54 - h]; }
      const m = vnoise(x * 1.2, z * 1.2); return [0.6 + m * 0.07, 0.38 + m * 0.05, 0.25];
    }), groundCover()));
    pave(k, g0 - O[0], g1 - O[0], -864.9 - O[1], fz + 0.2 - O[1], pavers('grey'));
    // trees inside the fence and beside the blocks
    for (const [x, z, h, sp] of [[1704, -817, 8, 11], [1773, -846, 7.5, 10], [1803, -853, 8, 11]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: sp, seed: x + z, origin: O });
    f.finish(k);
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.finish(k, 0.3);
  },
};
function L2(x0: number, x1: number): [number, number] { return [x0 - O[0], x1 - O[0]]; }
function Lz(z0: number, z1: number): [number, number] { return [z0 - O[1], z1 - O[1]]; }

// ======================================================================================================
// the Vice Chancellors Ghana Office Complex
// ======================================================================================================
const VO: [number, number] = [1682, -820];
/** the office's parts (world), its front to the north toward the road: the four-storey body, the volume standing
 *  forward over the entrance (floors 1 and 2; the top storey behind it carries the sign), the canopy's footprint before
 *  it, the wing at the back (the outline's steps) */
const V = {
  body: [1666.5, 1697.0, -822.8, -805.4] as R4, box: [1670.7, 1688.3, -829.2, -822.8] as R4, canopy: [1675.1, 1682.8, -833.8, -829.2] as R4,
  back: [1675.3, 1694.4, -805.4, -797.3] as R4, floors: 4,
};
const vcgSpec: Spec = {
  name: 'Vice Chancellors Ghana Office Complex', axis: [1, 0], origin: VO, storey: STOREY.v, style: PLAIN, roofColor: '#bdbcb6', fascia: '#e9e9e5', pitch: 0.1,
  replaces: [[1685, -815]],
  onGround: true,
  blocks: [],
  keep: [[VCG.x0 - VO[0], VCG.x1 - VO[0], -866 - VO[1], VCG.back - VO[1]]],
  extras: (k: Kit) => {
    const f = new Faces(VO), b = new Bag(VO), c: Part[] = [];
    const X = (x: number) => x - VO[0], Z = (z: number) => z - VO[1];
    const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(Math.min(x0, x1)), X(Math.max(x0, x1)), y0, y1, Z(Math.min(z0, z1)), Z(Math.max(z0, z1)));
    const sh = STOREY.v, H = V.floors * sh;
    const [x0, x1, z0, z1] = V.body, [bx0, bx1, bz0, bz1] = V.box, [cx0, cx1, cz0] = V.canopy, [kx0, kx1, , kz1] = V.back;
    const face = (kind: Tex, al: boolean, at: number, a0: number, a1: number, y0: number, y1: number) => f.add(kind, VWHITE, al, at, a0, a1, y0, y1, sh);
    // the body: bands of grey-framed windows on every face; the front either side of the forward volume
    face('vwin', true, z0, x0, bx0, 0, H); face('vwin', true, z0, bx1, x1, 0, H);
    face('vblank', true, z0, bx0, bx1, 3 * sh, H);
    face('vwin', false, x0, z0, z1, 0, H); face('vwin', false, x1, z0, z1, 0, H);
    face('vwin', true, z1, x0, kx0, 0, H); face('vwin', true, z1, kx1, x1, 0, H);
    face('vwin', false, kx0, z1, kz1, 0, H); face('vwin', false, kx1, z1, kz1, 0, H); face('vwin', true, kz1, kx0, kx1, 0, H);
    // the forward volume over the entrance (floors 1 and 2): a row of windows over the large dark window, its sides
    c.push([B(bx0, bx1, sh, 3 * sh, bz0, bz1), VWHITE], [B(bx0 - 0.05, bx1 + 0.05, 3 * sh - 0.05, 3 * sh + 0.3, bz0 - 0.05, bz1), '#e4e4e0']);
    face('vwin', true, bz0 - 0.01, bx0, bx1, 2 * sh, 3 * sh);
    const mx = (bx0 + bx1) / 2;
    c.push([B(mx - 2.6, mx + 2.6, sh + 0.7, 2 * sh - 0.2, bz0 - 0.04, bz0 - 0.01), '#1d2126']);
    for (const s2 of [-1, 1]) c.push([B(mx + s2 * 2.62 - 0.08, mx + s2 * 2.62 + 0.08, sh + 0.7, 2 * sh - 0.2, bz0 - 0.06, bz0 - 0.01), '#9a9ea2']);
    for (const s2 of [-1, 1]) c.push([B(mx + s2 * 6.2 - 1.4, mx + s2 * 6.2 + 1.4, sh + 0.8, 2 * sh - 0.4, bz0 - 0.04, bz0 - 0.01), '#2b3138']);
    // under it: the recessed dark glazing, the layered canopy on two square columns over the entrance (IMG-08)
    c.push([B(bx0 + 0.6, bx1 - 0.6, 0, sh - 0.1, bz1 - 0.04, bz1 - 0.02), '#1f2328']);
    for (let x = bx0 + 1.6; x < bx1 - 1; x += 1.8) c.push([B(x - 0.04, x + 0.04, 0, sh - 0.1, bz1 - 0.07, bz1 - 0.03), '#7c8287']);
    b.door.push(b.plane(true, bz1 - 0.08, -1, (cx0 + cx1) / 2, 2.0, 0, 2.4));
    c.push([B(cx0 - 1.2, cx1 + 1.2, sh - 0.25, sh + 0.05, cz0 - 0.4, bz1), '#f2f2ef'], [B(cx0 - 0.8, cx1 + 0.8, sh + 0.05, sh + 0.32, cz0, bz1), '#e6e6e2'], [B(cx0 - 1.2, cx1 + 1.2, sh - 0.3, sh - 0.25, cz0 - 0.4, bz1), '#cfd0cd']);
    for (const x of [cx0 + 0.6, cx1 - 0.6]) { c.push([B(x - 0.3, x + 0.3, 0, sh - 0.25, cz0 + 0.1, cz0 + 0.7), '#eeeeea']); SOLIDS.add(x, cz0 + 0.4, 0.4); }
    // the sign on the top storey over the forward volume (IMG-05, IMG-08): blue, white letters, two lines
    c.push([B(mx - 3.2, mx + 3.2, 3 * sh + 0.6, 3 * sh + 2.5, z0 - 0.12, z0 - 0.04), '#203f8c']);
    k.signs.push({ text: 'VICE CHANCELLORS GHANA', x: X(mx), y: 3 * sh + 1.95, z: Z(z0 - 0.13), ry: Math.PI, w: 5.8, colors: ['#203f8c', '#ffffff'] });
    k.signs.push({ text: 'OFFICE COMPLEX', x: X(mx), y: 3 * sh + 1.15, z: Z(z0 - 0.13), ry: Math.PI, w: 3.6, colors: ['#203f8c', '#ffffff'] });
    // the parapets round the flat roofs, the roofs, the stair head and an antenna; pale grey corner bands
    for (const [a0, a1, b0, b1] of [[x0, x1, z0, z1], [kx0, kx1, z1, kz1]] as R4[]) {
      c.push([B(a0, a1, H - 0.1, H + 0.05, b0, b1), '#bdbcb6']);
      for (const [p, q, r, t] of [[a0, a1, b0, b0 + 0.25], [a0, a1, b1 - 0.25, b1], [a0, a0 + 0.25, b0, b1], [a1 - 0.25, a1, b0, b1]]) c.push([B(p, q, H, H + 0.9, r, t), VWHITE]);
    }
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) c.push([B(x - 0.3, x + 0.3, 0, H + 0.9, z - 0.3, z + 0.3), '#e1e2e0']);
    c.push([B(1680, 1686, H, H + 2.8, -818, -813), VWHITE], [new THREE.CylinderGeometry(0.04, 0.06, 5, 6).translate(X(1690), H + 2.5, Z(-815)), '#8e9295']);
    const vr = outline(1666.1, 1697.1, -833.8, -797.2);
    if (vr) { const r = ring(vr); for (let i = 0; i < r.length; i++) wallSolids(r[i][0], r[i][1], r[(i + 1) % r.length][0], r[(i + 1) % r.length][1]); }

    // ---------- the compound ----------
    // the brick-paved forecourt and side drive (IMG-06, IMG-07, R28)
    {
      const g = new THREE.PlaneGeometry(VCG.x1 - VCG.x0 - 0.4, VCG.back - VCG.front - 0.4).rotateX(-Math.PI / 2).translate(X((VCG.x0 + VCG.x1) / 2), 0.03, Z((VCG.front + VCG.back) / 2));
      const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 4, p.getZ(i) / 4);
      const me = new THREE.Mesh(g, brickPavers()); me.receiveShadow = true; k.meshes.push(me);
    }
    // planted beds either side of the entrance, small trees and shrubs, a kerb round each (IMG-06, IMG-08)
    for (const [a0, a1, b0, b1] of [[1666.8, 1672.5, -838, -833.5], [1686.5, 1693.5, -838, -833.5]] as R4[]) {
      k.meshes.push(new THREE.Mesh(drapeAt(VO, a0, a1, b0, b1, 0.4, 0.08, () => [0.36, 0.5, 0.24]), groundCover()));
      for (const [p, q, r, s] of [[a0, a1, b0 - 0.1, b0 + 0.1], [a0, a1, b1 - 0.1, b1 + 0.1], [a0 - 0.1, a0 + 0.1, b0, b1], [a1 - 0.1, a1 + 0.1, b0, b1]]) c.push([B(p, q, 0, 0.18, r, s), '#d8d6cf']);
      broadleaf(k, b.leaf, (a0 + a1) / 2, (b0 + b1) / 2, { h: 4.5, spread: 5, seed: a0, origin: VO, round: true });
      for (let x = a0 + 0.7; x < a1 - 0.5; x += 1.3) b.leaf.push([new THREE.IcosahedronGeometry(0.5, 1).scale(1.2, 0.8, 1.2).translate(X(x), 0.45, Z(b1 - 0.7)), '#4e7d35']);
    }
    // parked cars along the east side of the forecourt (IMG-06)
    const ck = { ...k, plain: [] as Part[] } as Kit;
    // (along the east wall, clear of the drive inside the front wall and of the canopy)
    for (const [x, z, col] of [[1695.6, -842, '#e8e8e6'], [1695.6, -836, '#c9ccd0'], [1695.6, -828, '#1e2228']] as [number, number, string][]) {
      const ry = Math.PI / 2;
      car(ck, X(x), Z(z), col, 0.03, ry);
      if (ry) { SOLIDS.add(x, z - 1.6, 1.0); SOLIDS.add(x, z, 1.2); SOLIDS.add(x, z + 1.6, 1.0); } else { SOLIDS.add(x - 1.6, z, 1.0); SOLIDS.add(x, z, 1.2); SOLIDS.add(x + 1.6, z, 1.0); }
    }
    for (const p of ck.plain) c.push(p);
    // the front wall: square white pillars with caps, between them a white panel whose top dips and rises in a zig-zag,
    // the black railing standing over it (IMG-05, IMG-09); the gate leaves (IMG-07)
    const gx0 = VCG.gate.x - VCG.gate.half, gx1 = VCG.gate.x + VCG.gate.half;
    const zz = (x0: number, x1: number, zl: number, alongX = true) => {
      const n = Math.max(1, Math.round((x1 - x0) / 3));
      for (let j = 0; j <= n; j++) {
        const a = x0 + ((x1 - x0) * j) / n, P = (u: number): [number, number] => (alongX ? [X(u), Z(zl)] : [X(zl), Z(u)]);
        const [px, pz] = P(a);
        c.push([box(px - 0.24, px + 0.24, 0, 1.75, pz - 0.24, pz + 0.24), '#f2f2ef'], [box(px - 0.31, px + 0.31, 1.75, 1.9, pz - 0.31, pz + 0.31), '#dcdcd7'], [box(px - 0.2, px + 0.2, 1.9, 2.15, pz - 0.2, pz + 0.2), '#f2f2ef']);
        if (j === n) break;
        const e = x0 + ((x1 - x0) * (j + 1)) / n;
        // the panel's outline: up the pillar's side, the W along the top, back down
        const w = e - a, sh2 = new THREE.Shape();
        const top = [[0, 1.35], [0.25, 0.75], [0.5, 1.25], [0.75, 0.75], [1, 1.35]];
        sh2.moveTo(0, 0); for (const [t, y] of top) sh2.lineTo(t * w, y); sh2.lineTo(w, 0); sh2.lineTo(0, 0);
        const g = new THREE.ExtrudeGeometry(sh2, { depth: 0.2, bevelEnabled: false }).translate(0, 0, -0.1);
        if (!alongX) g.rotateY(-Math.PI / 2);
        const [qx, qz] = P(a);
        c.push([g.translate(qx, 0, qz), '#f2f2ef']);
        // the railing: black bars from the panel's top to a rail
        for (let t = 0.06; t < 0.97; t += 0.05) {
          const yb = t < 0.25 ? 1.35 - (t / 0.25) * 0.6 : t < 0.5 ? 0.75 + ((t - 0.25) / 0.25) * 0.5 : t < 0.75 ? 1.25 - ((t - 0.5) / 0.25) * 0.5 : 0.75 + ((t - 0.75) / 0.25) * 0.6;
          const [bx2, bz2] = P(a + t * w);
          c.push([box(bx2 - 0.02, bx2 + 0.02, yb, 1.85, bz2 - 0.02, bz2 + 0.02), '#151617']);
        }
        const [ax, az] = P(a), [ex2, ez] = P(e);
        c.push([alongX ? box(ax, ex2, 1.8, 1.86, az - 0.025, az + 0.025) : box(ax - 0.025, ax + 0.025, 1.8, 1.86, Math.min(az, ez), Math.max(az, ez)), '#151617']);
      }
      if (alongX) wallSolids(x0, zl, x1, zl, 0.25); else wallSolids(zl, x0, zl, x1, 0.25);
    };
    zz(gx1 + 0.3, VCG.x1, VCG.front);
    zz(VCG.x0, gx0 - 0.3, VCG.front);
    // the side walls (inferred lines): the same profile down the west side, plain white with a railing on the east
    zz(VCG.front, VCG.back, VCG.x0, false);
    {
      const [ax, az] = [X(VCG.x1), Z(VCG.front)], [, ez] = [X(VCG.x1), Z(VCG.back)];
      c.push([box(ax - 0.12, ax + 0.12, 0, 1.4, az, ez), '#f2f2ef'], [box(ax - 0.15, ax + 0.15, 1.4, 1.48, az, ez), '#dcdcd7']);
      for (let z = az + 0.15; z < ez; z += 0.15) c.push([box(ax - 0.02, ax + 0.02, 1.48, 2.0, z - 0.02, z + 0.02), '#151617']);
      wallSolids(VCG.x1, VCG.front, VCG.x1, VCG.back, 0.25);
    }
    // the gate's two black leaves, swung open inward against the wall either side (vertical bars over a dark plate
    // with arched cut-outs, IMG-07); the gate piers
    for (const s of [-1, 1]) {
      const pier = s < 0 ? gx0 - 0.3 : gx1 + 0.3, [px, pz] = [X(pier), Z(VCG.front)];
      c.push([box(px - 0.3, px + 0.3, 0, 2.3, pz - 0.3, pz + 0.3), '#f2f2ef'], [box(px - 0.36, px + 0.36, 2.3, 2.45, pz - 0.36, pz + 0.36), '#dcdcd7']);
      SOLIDS.add(pier, VCG.front, 0.35);
      const lx = px - s * 0.45;
      c.push([box(lx - 0.03, lx + 0.03, 0.15, 1.1, pz + 0.3, pz + 3.4), '#141516']);
      for (let z = pz + 0.35; z < pz + 3.4; z += 0.13) c.push([box(lx - 0.02, lx + 0.02, 1.1, 2.0, z - 0.015, z + 0.015), '#141516']);
      c.push([box(lx - 0.03, lx + 0.03, 1.95, 2.02, pz + 0.3, pz + 3.4), '#141516']);
    }
    // the small gatehouse just inside, white under a red hipped roof (IMG-07)
    // (a slim booth: the compound's mapped drive runs along the inside of the wall just behind it)
    lowWing(k, b, [1669.6, 1672.8, -852.25, -850.75], { eave: 2.5, pitch: 0.5, roof: '#a3442f', base: 0.3, over: 0.4, faces: { z0: 'w', x0: 'D' }, y: 0 });
    // the verge outside the wall: grass with red earth showing, down to the frontage road's kerb (IMG-05)
    k.meshes.push(new THREE.Mesh(drapeAt(VO, VCG.x0 - 6, VCG.x1, -866, VCG.front - 0.15, 0.5, 0.035, (x, z) => {
      if (z < zFront(x) + FRONT_HALF + 0.2 || (x > gx0 - 0.3 && x < gx1 + 0.3)) return null;
      const n = vnoise(x * 0.35, z * 0.35), m = vnoise(x * 1.4, z * 1.4);
      return n > 0.6 ? [0.58 + m * 0.07, 0.38 + m * 0.05, 0.25] : [0.38 + m * 0.07, 0.5 + n * 0.08, 0.23];
    }), groundCover()));
    for (let i = 0; i < 40; i++) { const x = VCG.x0 - 5 + hash(i, 61) * (VCG.x1 - VCG.x0 + 5), z = VCG.front - 0.6 - hash(62, i) * 2.5; if (x > gx0 - 1 && x < gx1 + 1) continue; tuft(b, x, z, 0.5 + hash(i, 63) * 0.5, ['#7d8a44', '#6b7a3a', '#8d9450'][i % 3], i + 3000); }
    pave(k, X(gx0), X(gx1), Z(zFront(VCG.gate.x) + FRONT_HALF), Z(VCG.front), brickPavers());
    // hedges and trees showing over the wall (IMG-05, IMG-09)
    for (let x = 1676; x < 1697; x += 1.4) b.leaf.push([new THREE.IcosahedronGeometry(0.75, 1).scale(1.2, 1.1, 1).translate(X(x), 1.1, Z(VCG.front + 1.0)), '#3f6f2c']);
    broadleaf(k, b.leaf, 1693, -800, { h: 7, spread: 9, seed: 77, origin: VO, round: true });
    f.finish(k);
    const m = new THREE.Mesh(merge(c), concrete(0.25)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.finish(k, 0.25);
  },
};
let brickMat: THREE.MeshStandardMaterial | null = null;
/** red-brown interlocking brick pavers laid herringbone (IMG-06, IMG-07): drawn over the ground and the mapped drive */
function brickPavers() {
  if (brickMat) return brickMat;
  const t = canvas(256, 256, (g) => {
    g.fillStyle = '#6e3f2c'; g.fillRect(0, 0, 256, 256);
    const cols = ['#a65a3c', '#9c5236', '#b06446', '#97503a', '#a95f42'];
    for (let i = -4; i < 12; i++) for (let j = -4; j < 24; j++) {
      const x = i * 25.6 + (j % 2) * 12.8, y = j * 12.8;
      g.fillStyle = cols[(((i * 7 + j * 3) % 5) + 5) % 5];
      if ((i + j) % 2) g.fillRect(x + 1, y + 1, 23.6, 10.8); else g.fillRect(x + 1, y + 1, 10.8, 23.6);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  brickMat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -3.5, polygonOffsetUnits: -7 });
  return brickMat;
}

export const upsaHostelSite = createSite('upsa-hostel', [hostelSpec, vcgSpec]);
