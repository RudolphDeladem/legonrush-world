// The West African Centre for Cell Biology of Infectious Pathogens (WACCBIP), the car-park shades before it, the old
// shed north of it and the unfinished concrete frame further north, from the owner's marked aerial (front F east to
// Volta Hall Road, back B west) and photos (block engine: blocks.ts).
//
// WACCBIP: three storeys of bright white paint (new, hardly weathered) on a ground floor raised a metre, under dark
// red hip roofs with a dark louvred gablet at the ends of the wings and over the front. Its front: two wings reaching
// east to the drive, between them the deep galleries the owner calls large balconies, on every floor, solid white
// parapets, columns to the eaves, lights under the slabs; in the middle a pavilion under its own gablet roof with a
// broad stair up to the entrance (the blue round it on the owner's photos marks it; the paint is white). Paired dark windows, warm-lit at dusk; a tall glazed stair window up
// the east end of each wing. The back (photo 4): tall narrow windows, the entrance up three steps under a lattice gate
// between white planters with the centre's board over it, palms beside it, a raised box on the roof.
// Before the front: interlocking brick paving; under the blue tensile shades on white curved posts, the car parks
// (owner's red marks); grass islands of yuccas by the road.
// The old shed (owner's white mark, photo 5): one floor, old clay tiles gone dark, white paint stained and mouldy,
// old plank doors (one standing open on a dark room), louvred windows, overgrown with bush.
// The unfinished frame (owner's green mark, photo 2): raw grey concrete columns, a first-floor slab, column stubs
// with their rebar standing above it, some bays walled in blockwork, weeds and trees growing through.
import * as THREE from 'three';
import { box, canvas, merge, speckle, tri2, type Part } from './modelkit';
import { BAND, PL, createSite, render, type Block, type Kit, type Spec, type Style } from './blocks';
import { concrete, grille, panel } from './concrete';
import { garden } from './gardens';

// ---------- WACCBIP ----------
const WO: [number, number] = [-270, -330];
const WX = (x: number) => x - WO[0], WZ = (z: number) => z - WO[1];
/** a box given in world x and z */
const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(WX(x0), WX(x1), y0, y1, WZ(z0), WZ(z1));
const RAISE = 0.6, WST = 3.6;
/** the ground floor, the first and second floors, the eaves */
const F0 = RAISE + PL, F1 = F0 + WST, F2 = F1 + WST, EAVE = F0 + 3 * WST + BAND;
const PAINT = '#f6f5f1', WROOF = '#86302c', WFASCIA = '#5e201d', FRAME = '#34383c';
/** a dark aluminium window: frame, two panes, a sill */
const win = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cols = 2) => {
  g.fillStyle = 'rgba(120,118,110,0.25)'; g.fillRect(x - 5, y - 5, w + 10, h + 10);
  g.fillStyle = FRAME; g.fillRect(x - 3, y - 3, w + 6, h + 6);
  const gl = g.createLinearGradient(0, y, 0, y + h);
  gl.addColorStop(0, '#5a6c7c'); gl.addColorStop(0.55, '#2a343e'); gl.addColorStop(1, '#1a2026');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = FRAME;
  for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - 2, y, 4, h);
  g.fillStyle = '#e4e2dc'; g.fillRect(x - 6, y + h + 3, w + 12, 5);
};
const paint = (g: CanvasRenderingContext2D) => {
  render(g, PAINT);
  // a hint of age only: the white must read as white (owner)
  speckle(g, 0, 0, 256, 512, 200, ['rgba(150,146,134,0.12)']);
  g.fillStyle = 'rgba(160,156,146,0.25)'; g.fillRect(0, 254, 256, 3);
};
/** the wings and the ends: a pair of dark windows to a bay on every floor */
const W_WIN: Style = {
  bay: 3.6, up: [[26, 56, 88, 104], [142, 56, 88, 104]], ground: [[26, 256 + 56, 88, 104], [142, 256 + 56, 88, 104]],
  draw: (g) => { paint(g); for (const y of [56, 256 + 56]) { win(g, 26, y, 88, 104); win(g, 142, y, 88, 104); } },
};
/** the walls behind the galleries: a door and a wide window to a bay */
const W_GAL: Style = {
  bay: 4.0, up: [[24, 76, 60, 180], [120, 70, 112, 96]], ground: [[24, 256 + 76, 60, 180], [120, 256 + 70, 112, 96]],
  draw: (g) => {
    paint(g);
    for (const y of [76, 256 + 76]) {
      g.fillStyle = FRAME; g.fillRect(21, y - 3, 66, 183);
      const gl = g.createLinearGradient(0, y, 0, y + 180); gl.addColorStop(0, '#4d5d6b'); gl.addColorStop(1, '#1d242b');
      g.fillStyle = gl; g.fillRect(24, y, 60, 180);
      g.fillStyle = FRAME; g.fillRect(24, y + 60, 60, 4); g.fillRect(52, y + 64, 4, 116);
      win(g, 120, y - 6, 112, 96, 3);
    }
  },
};
/** the back: a tall narrow window to a bay, floor over floor */
const W_BACK: Style = {
  bay: 4.4, up: [[98, 18, 60, 226]], ground: [[98, 256 + 30, 60, 214]],
  draw: (g) => {
    paint(g);
    for (const [y, h] of [[18, 226], [256 + 30, 214]]) {
      g.fillStyle = FRAME; g.fillRect(94, y - 4, 68, h + 8);
      const gl = g.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, '#617487'); gl.addColorStop(0.6, '#26303a'); gl.addColorStop(1, '#151a20');
      g.fillStyle = gl; g.fillRect(98, y, 60, h);
      g.fillStyle = FRAME; g.fillRect(126, y, 4, h); g.fillRect(98, y + h * 0.3, 60, 4);
    }
  },
};
/** the back face of the west range: plain white, its windows set in by the model (photo 4) */
const W_BLANK: Style = { bay: 4.0, up: [], ground: [], draw: (g) => paint(g) };
const W = (x0: number, x1: number, z0: number, z1: number, more: Partial<Block> = {}): Block => ({ x0: WX(x0), x1: WX(x1), z0: WZ(z0), z1: WZ(z1), floors: 3, y: RAISE, roof: 'none', ...more });
// (the footprint's rings, squared: the wings, the spine between them with the galleries before it, the pavilion in
// the middle of the front, the block behind the spine with the back entrance)
const NW = [-289.3, -249.6, -362.3, -348.5], SW = [-294.0, -252.7, -309.6, -292.6], NUB = [-277.9, -264.2, -367.5, -362.3];
const SPINE = [-280.5, -269.5, -348.5, -309.6], PAV = [-269.5, -264, -338.2, -328.8];
/** the west range along the back road (owner's yellow mark), its two arms east to the spine either side of a light
 *  well, the block between the well and the spine */
const WR = [-301.6, -294.6, -353.1, -311.4], NA = [-294.6, -280.5, -353.1, -338.8], SA = [-294.6, -280.5, -322.0, -311.4], CB = [-288.2, -280.5, -338.8, -322.0];
/** the gallery front: the recesses' edge, the pavilion's edge */
const GE = -266.5, PE = -259.8, ENZ = -333.5;
const wBlocks: Block[] = [
  W(NW[0], NW[1], NW[2], NW[3], { faces: { x0: W_BACK } }),
  W(NUB[0], NUB[1], NUB[2], NUB[3]),
  W(SPINE[0], SPINE[1], SPINE[2], SPINE[3], { faces: { x1: W_GAL } }),
  W(WR[0], WR[1], WR[2], WR[3], { faces: { x0: W_BLANK } }),
  W(NA[0], NA[1], NA[2], NA[3]),
  W(SA[0], SA[1], SA[2], SA[3]),
  W(CB[0], CB[1], CB[2], CB[3]),
  W(PAV[0], PAV[1], PAV[2], PAV[3], { faces: { x1: W_GAL } }),
  W(SW[0], SW[1], SW[2], SW[3], { faces: { x0: W_BACK } }),
];

/** a cylinder from p to q (world x, y, z) */
function rod(p: [number, number, number], q: [number, number, number], r: number, O: [number, number]) {
  const a = new THREE.Vector3(p[0] - O[0], p[1], p[2] - O[1]), b = new THREE.Vector3(q[0] - O[0], q[1], q[2] - O[1]);
  const d = b.clone().sub(a), g = new THREE.CylinderGeometry(r, r, d.length(), 8);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()));
  return g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
}

/** A hip roof in world coordinates x0..x1, z0..z1 (at the eave), its ridge along `along`; each end of the ridge either
 *  a hip, a hip rising to a small dark louvred gablet (gw: its half width) or, buried in a neighbour's roof, a gable
 *  (gw >= half, tri false; with tri, a gable end boarded in timber). `M` maps world x, z to the model frame. */
export function hipRoof(k: Kit, M: (x: number, z: number) => [number, number], x0: number, x1: number, z0: number, z1: number, e: number, pitch: number,
  along: 'x' | 'z', ends: [{ gw: number; tri: boolean }, { gw: number; tri: boolean }], parts: Part[], barge = WFASCIA, timber: [string, string] = ['#3a3431', '#57504b']) {
  const [A0, A1, B0, B1] = along === 'x' ? [x0, x1, z0, z1] : [z0, z1, x0, x1];
  const P = (a: number, y: number, b: number): number[] => { const [x, z] = along === 'x' ? M(a, b) : M(b, a); return [x, y, z]; };
  const half = (B1 - B0) / 2, bm = (B0 + B1) / 2, top = e + half * pitch;
  const g0 = Math.min(ends[0].gw, half), g1 = Math.min(ends[1].gw, half);
  const h0 = e + (half - g0) * pitch, h1 = e + (half - g1) * pitch;
  const a0 = A0 + half - g0, a1 = A1 - half + g1;
  // the two long slopes up to the gablets' feet, then the strips above them to the ridge
  k.roof.quad(P(A0, e, B0), P(A1, e, B0), P(a1, h1, bm - g1), P(a0, h0, bm - g0));
  k.roof.quad(P(A1, e, B1), P(A0, e, B1), P(a0, h0, bm + g0), P(a1, h1, bm + g1));
  const r0 = a0 - (ends[0].tri ? 0.5 : 0), r1 = a1 + (ends[1].tri ? 0.5 : 0);
  if (g0 > 0 || g1 > 0) {
    k.roof.quad(P(a0, h0, bm - g0), P(a1, h1, bm - g1), P(r1, top, bm), P(r0, top, bm));
    k.roof.quad(P(a1, h1, bm + g1), P(a0, h0, bm + g0), P(r0, top, bm), P(r1, top, bm));
  }
  // the hipped ends
  if (g0 < half) k.roof.quad(P(A0, e, B1), P(A0, e, B0), P(a0, h0, bm - g0), P(a0, h0, bm + g0));
  if (g1 < half) k.roof.quad(P(A1, e, B0), P(A1, e, B1), P(a1, h1, bm + g1), P(a1, h1, bm - g1));
  // the gablets: a dark louvred triangle, red bargeboards
  for (const [i, a, g, h, s] of [[0, a0, g0, h0, -1], [1, a1, g1, h1, 1]] as [number, number, number, number, number][]) {
    if (!ends[i].tri || g <= 0) continue;
    const T = (aa: number, y: number, b: number) => P(aa, y, b) as [number, number, number];
    parts.push([tri2(T(a + s * 0.04, h, bm - g), T(a + s * 0.04, h, bm + g), T(a + s * 0.04, top, bm)), timber[0]]);
    for (let y = h + 0.18; y < top - 0.2; y += 0.22) {
      const w = (g * (top - y)) / (top - h) - 0.12;
      if (w > 0.1) parts.push([tri2(T(a + s * 0.08, y, bm - w), T(a + s * 0.08, y, bm + w), T(a + s * 0.12, y - 0.08, bm)), timber[1]]);
    }
    for (const b of [-1, 1]) {
      const p = T(a + s * 0.06, h - 0.05, bm + b * (g + 0.1)), q = T((i ? r1 : r0) + s * 0.06, top + 0.05, bm);
      const d = new THREE.Vector3(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
      const geo = new THREE.BoxGeometry(0.14, 0.24, d.length()).lookAt(d).translate((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2);
      parts.push([geo, barge]);
    }
  }
  // the ridge
  const ra = P(r0, top + 0.05, bm), rb = P(r1, top + 0.05, bm);
  const d = new THREE.Vector3(rb[0] - ra[0], 0, rb[2] - ra[2]);
  if (d.length() > 0.2) parts.push([new THREE.BoxGeometry(0.3, 0.14, d.length()).lookAt(d).translate((ra[0] + rb[0]) / 2, top + 0.05, (ra[2] + rb[2]) / 2), barge]);
  // fascia round the eaves, the soffit under them
  const [X0, Z0] = M(x0, z0), [X1, Z1] = M(x1, z1);
  const [lx, hx, lz, hz] = [Math.min(X0, X1), Math.max(X0, X1), Math.min(Z0, Z1), Math.max(Z0, Z1)];
  parts.push([box(lx, hx, e - 0.32, e + 0.03, lz - 0.06, lz + 0.06), barge], [box(lx, hx, e - 0.32, e + 0.03, hz - 0.06, hz + 0.06), barge]);
  parts.push([box(lx - 0.06, lx + 0.06, e - 0.32, e + 0.03, lz, hz), barge], [box(hx - 0.06, hx + 0.06, e - 0.32, e + 0.03, lz, hz), barge]);
  parts.push([box(lx, hx, e - 0.34, e - 0.3, lz, hz), '#eeede8']);
  return top;
}

/** a car-park shade: blue tensile fabric on white posts that curve over at the top (owner's red marks), the posts
 *  along the side at `post` ('x0' or 'x1'), world x0..x1, z0..z1 */
function shade(k: Kit, c: Part[], x0: number, x1: number, z0: number, z1: number, post: 'x0' | 'x1') {
  const s = post === 'x0' ? 1 : -1, xp = post === 'x0' ? x0 + 0.3 : x1 - 0.3, xf = post === 'x0' ? x1 : x0;
  const hp = 3.15, hf = 2.55;
  const n = Math.max(2, Math.round((z1 - z0) / 4.6)), zs = Array.from({ length: n + 1 }, (_, i) => z0 + 0.3 + ((z1 - z0 - 0.6) * i) / n);
  for (const z of zs) {
    // the post, its arm bending over and running out under the fabric to the far edge
    c.push([rod([xp, 0, z], [xp, 2.3, z], 0.1, WO), '#f1f1ee']);
    let prev: [number, number, number] = [xp, 2.3, z];
    for (let i = 1; i <= 4; i++) {
      const a = (i / 4) * (Math.PI / 2), p: [number, number, number] = [xp + s * 0.7 * (1 - Math.cos(a)), 2.3 + 0.7 * Math.sin(a) + 0.12 * (i / 4), z];
      c.push([rod(prev, p, 0.09, WO), '#f1f1ee']);
      prev = p;
    }
    c.push([rod(prev, [xf - s * 0.1, hf - 0.06, z], 0.07, WO), '#f1f1ee']);
  }
  for (let i = 0; i < n; i++) {
    const za = zs[i], zb = zs[i + 1], zm = (za + zb) / 2;
    const A = [WX(xp), hp, WZ(za)] as [number, number, number], Bp = [WX(xp), hp, WZ(zb)] as [number, number, number];
    const C = [WX(xf), hf, WZ(zb)] as [number, number, number], D = [WX(xf), hf, WZ(za)] as [number, number, number];
    const Mid = [WX((xp + xf) / 2), (hp + hf) / 2 - 0.22, WZ(zm)] as [number, number, number];
    for (const [p, q] of [[A, Bp], [Bp, C], [C, D], [D, A]]) k.plain.push([tri2(p, q, Mid), '#1f62b8']);
  }
  // the hems along the long edges
  k.plain.push([B(xp - 0.05, xp + 0.05, hp - 0.08, hp + 0.02, z0 + 0.3, z1 - 0.3), '#184f96']);
  k.plain.push([B(xf - 0.05, xf + 0.05, hf - 0.08, hf + 0.02, z0 + 0.3, z1 - 0.3), '#184f96']);
}

/** interlocking brick paving laid in world metres (the forecourt, owner's photo 3) */
let brickMat: THREE.MeshStandardMaterial | null = null;
function bricks() {
  if (brickMat) return brickMat;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#7d7871'; g.fillRect(0, 0, 256, 256);
  // a herringbone of 20 x 10 cm pavers, 64 px to the metre
  const cols = ['#a39c92', '#988f84', '#aaa398', '#8f877c', '#9e978d'];
  for (let i = -4; i < 12; i++) for (let j = -4; j < 24; j++) {
    const x = i * 25.6 + (j % 2) * 12.8, y = j * 12.8;
    g.fillStyle = cols[(i * 7 + j * 3 + 100) % 5];
    if ((i + j) % 2) g.fillRect(x + 1, y + 1, 23.6, 10.8); else g.fillRect(x + 1, y + 1, 10.8, 23.6);
  }
  speckle(g, 0, 0, 256, 256, 1500, ['rgba(60,58,54,0.25)', 'rgba(200,196,186,0.2)']);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  brickMat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
  return brickMat;
}
function paving(k: Kit, x0: number, x1: number, z0: number, z1: number) {
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate(WX((x0 + x1) / 2), 0.05, WZ((z0 + z1) / 2));
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * (x1 - x0)) / 4, (uv.getY(i) * (z1 - z0)) / 4);
  const m = new THREE.Mesh(geo, bricks());
  m.receiveShadow = true;
  k.meshes.push(m);
}
/** a yucca: stiff blade leaves fanning up and out from a short trunk */
function yucca(k: Kit, x: number, z: number, s: number, seed: number) {
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + seed, tilt = 0.35 + ((i * 37 + seed * 11) % 7) * 0.12;
    const leaf = new THREE.ConeGeometry(0.06 * s, 1.1 * s, 3).translate(0, 0.55 * s, 0).rotateZ(tilt).rotateY(a);
    k.plain.push([leaf.translate(WX(x), 0.35 * s, WZ(z)), i % 3 ? '#4f7f46' : '#7a9a5e']);
  }
  k.plain.push([new THREE.CylinderGeometry(0.12 * s, 0.16 * s, 0.4 * s, 6).translate(WX(x), 0.2 * s, WZ(z)), '#5f5440']);
}

const waccbip: Spec = {
  name: 'West African Centre for Cell Biology of Infectious Pathogens, WACCBIP',
  axis: [1, 0], origin: WO, storey: WST, style: W_WIN, roofColor: WROOF, fascia: WFASCIA, pitch: 0.45,
  plinth: '#e2e0d9',
  blocks: wBlocks,
  // (the galleries and the stair, the walk to the road between the shades, the back entrance and its palms)
  keep: [[WX(-270), WX(-257.4), WZ(-349), WZ(-309)], [WX(-257.4), WX(-225.4), WZ(ENZ - 3.0), WZ(ENZ + 2.8)], [WX(-316), WX(-301.4), WZ(-354), WZ(-311)]],
  extras: (k: Kit) => {
    const c: Part[] = [];
    // the raised ground floor: a white base under every block
    for (const b of [NW, SW, NUB, SPINE, WR, NA, SA, CB, PAV]) c.push([B(b[0] - 0.05, b[1] + 0.05, 0, RAISE, b[2] - 0.05, b[3] + 0.05), '#e2e0d9']);

    // ---- the galleries across the front (owner: large balconies), every floor ----
    const recs: [number, number][] = [[NW[3], PAV[2]], [PAV[3], SW[2]]];
    for (const [za, zb] of recs) {
      // the ground floor's walk, a step down along its edge
      c.push([B(SPINE[1], GE, 0, F0, za, zb), '#e2e0d9']);
      k.plain.push([B(SPINE[1], GE - 0.02, F0, F0 + 0.03, za, zb), '#c9c6bd']);
      for (const F of [F1, F2]) {
        c.push([B(SPINE[1], GE, F - 0.3, F, za, zb), PAINT]);
        k.plain.push([B(SPINE[1], GE - 0.2, F, F + 0.03, za, zb), '#c9c6bd']);
        c.push([B(GE - 0.2, GE, F, F + 1.05, za, zb), PAINT], [B(GE - 0.26, GE + 0.06, F + 1.05, F + 1.12, za, zb), '#e6e4de']);
      }
      // columns at the edge to the eaves, lights under the slabs and the soffit
      const n = Math.max(1, Math.round((zb - za) / 4.6));
      for (let i = 0; i <= n; i++) {
        const z = za + 0.25 + ((zb - za - 0.5) * i) / n;
        c.push([B(GE - 0.18, GE + 0.18, F0, EAVE - 0.3, z - 0.18, z + 0.18), PAINT]);
      }
      for (let i = 0; i < n; i++) {
        const z = za + 0.25 + ((zb - za - 0.5) * (i + 0.5)) / n;
        for (const y of [F1 - 0.32, F2 - 0.32, EAVE - 0.36]) k.plain.push([B(GE - 1.9, GE - 1.1, y - 0.03, y, z - 0.3, z + 0.3), '#fff4d6']);
      }
    }
    // the pavilion's gallery: deeper, round columns at its front corners, the broad stair up to the entrance
    c.push([B(PAV[1], PE, 0, F0, PAV[2], PAV[3]), '#e2e0d9']);
    k.plain.push([B(PAV[1], PE, F0, F0 + 0.03, PAV[2], PAV[3]), '#c9c6bd']);
    for (const F of [F1, F2]) {
      c.push([B(PAV[1], PE, F - 0.3, F, PAV[2] - 0.2, PAV[3] + 0.2), PAINT]);
      k.plain.push([B(PAV[1], PE - 0.2, F, F + 0.03, PAV[2], PAV[3]), '#c9c6bd']);
      c.push([B(PE - 0.2, PE, F, F + 1.05, PAV[2] - 0.2, PAV[3] + 0.2), PAINT], [B(PE - 0.26, PE + 0.06, F + 1.05, F + 1.12, PAV[2] - 0.26, PAV[3] + 0.26), '#e6e4de']);
      for (const z of [PAV[2] - 0.2, PAV[3]]) c.push([B(GE, PE, F, F + 1.05, z, z + 0.2), PAINT]);
      for (const z of [-336.5, -333.5, -330.5]) k.plain.push([B(-262.6, -261.2, F - 0.35, F - 0.32, z - 0.3, z + 0.3), '#fff4d6']);
    }
    for (const z of [PAV[2] + 0.35, PAV[3] - 0.35]) c.push([new THREE.CylinderGeometry(0.36, 0.36, EAVE - 0.3 - F0, 16).translate(WX(PE + 0.4), (F0 + EAVE - 0.3) / 2, WZ(z)), PAINT]);
    for (let i = 1; i <= 6; i++) c.push([B(PE, PE + 0.36 * i, 0, (F0 * (7 - i)) / 6, ENZ - 4, ENZ + 4), '#d9d6ce']);
    // white cheeks with planters at the sides of the stair
    for (const z of [ENZ - 4.5, ENZ + 4.0]) {
      c.push([B(PE, PE + 2.2, 0, F0 + 0.1, z, z + 0.5), PAINT]);
      k.plain.push([new THREE.IcosahedronGeometry(0.45, 0).scale(1.3, 0.8, 0.6).translate(WX(PE + 1.6), F0 + 0.35, WZ(z + 0.25)), '#3f7a2c']);
    }
    // the entrance: glass doors in the pavilion's wall in a white surround (the blue on the owner's photos marks it)
    k.glass.push(B(PAV[1] + 0.01, PAV[1] + 0.05, F0, F0 + 2.7, ENZ - 1.6, ENZ + 1.6));
    k.plain.push([B(PAV[1], PAV[1] + 0.08, F0 + 2.7, F0 + 2.85, ENZ - 1.7, ENZ + 1.7), FRAME], [B(PAV[1], PAV[1] + 0.08, F0, F0 + 2.7, ENZ - 0.04, ENZ + 0.04), FRAME]);
    c.push([B(PAV[1], PAV[1] + 0.25, F0, F0 + 3.1, ENZ - 2.0, ENZ - 1.7), PAINT], [B(PAV[1], PAV[1] + 0.25, F0, F0 + 3.1, ENZ + 1.7, ENZ + 2.0), PAINT], [B(PAV[1], PAV[1] + 0.25, F0 + 2.85, F0 + 3.1, ENZ - 2.0, ENZ + 2.0), PAINT]);
    k.signs.push({ text: 'WACCBIP', x: WX(PE + 0.08), y: F1 + 0.55, z: WZ(ENZ), ry: Math.PI / 2, w: 3.0, colors: ['#f4f6f8', '#1d3f7a'] });

    // ---- the tall glazed stair windows up the wings' east ends ----
    for (const [x, za, zb] of [[NW[1], -360.6, -358.2], [SW[1], -296.6, -294.2]] as [number, number, number][]) {
      k.glass.push(B(x, x + 0.08, F0 + 0.6, EAVE - 0.9, za, zb));
      c.push([B(x, x + 0.14, F0 + 0.45, F0 + 0.6, za - 0.15, zb + 0.15), PAINT], [B(x, x + 0.14, EAVE - 0.9, EAVE - 0.75, za - 0.15, zb + 0.15), PAINT]);
      for (const z of [za - 0.06, (za + zb) / 2, zb + 0.06]) k.plain.push([B(x + 0.05, x + 0.12, F0 + 0.6, EAVE - 0.9, z - 0.04, z + 0.04), FRAME]);
      for (let y = F0 + 0.6 + 1.8; y < EAVE - 1; y += 1.8) k.plain.push([B(x + 0.05, x + 0.12, y - 0.03, y + 0.03, za, zb), FRAME]);
    }
    // air-conditioners on the wings' outer walls
    for (const [z, y] of [[-355.5, F0 + 0.4], [-352.4, F1 + 0.4], [-355.5, F2 + 0.4]]) k.plain.push([B(-249.6, -249.3, y, y + 0.55, z - 0.4, z + 0.4), '#eceeee']);
    for (const x of [-284, -276, -268, -260]) for (const y of [F0 + 0.3, F1 + 0.3]) {
      k.plain.push([B(x - 0.4, x + 0.4, y, y + 0.55, NW[2] - 0.3, NW[2]), '#eceeee']);
      k.plain.push([B(x + 2 - 0.4, x + 2 + 0.4, y + 0.2, y + 0.75, SW[3], SW[3] + 0.3), '#eceeee']);
    }

    // ---- the back (owner's marked aerial, yellow, and photo 4): the whole west face of the west range, the two arms'
    // gablets at its ends, the entrance near the middle up three steps, the centre's full board over it ----
    const bx = WR[0], bz = -330.0;
    for (let i = 1; i <= 3; i++) c.push([B(bx - 0.35 * i, bx, 0, (F0 * (4 - i)) / 3, bz - 1.9, bz + 1.9), '#d9d6ce']);
    c.push([B(bx - 0.5, bx, F0 + 2.75, F0 + 3.0, bz - 1.7, bz + 1.7), PAINT]);
    for (const s of [-1, 1]) c.push([B(bx - 0.5, bx, F0, F0 + 2.75, bz + s * 1.6 - 0.1, bz + s * 1.6 + 0.1), PAINT]);
    k.plain.push([B(bx - 0.04, bx, F0, F0 + 2.75, bz - 1.5, bz + 1.5), '#f3e6c4']);
    k.glass.push(B(bx - 0.1, bx - 0.06, F0, F0 + 2.6, bz - 1.2, bz + 1.2));
    // (owner's photo of the door: a collapsible lattice gate drawn across the top of the opening, the glass door under
    // it with the university's plate, a camera in the corner, a gold strip light under the board)
    panel(WO, k, grille(), bx - 0.08, bz - 1.2, bx - 0.08, bz + 1.2, F0 + 1.35, F0 + 2.6, 0.45);
    k.plain.push([B(bx - 0.12, bx - 0.06, F0 + 1.3, F0 + 1.38, bz - 1.25, bz + 1.25), '#9a9d9f'], [B(bx - 0.14, bx - 0.08, F0 + 0.8, F0 + 1.15, bz - 0.55, bz + 0.15), '#1d3f7a']);
    k.signs.push({ text: 'UNIVERSITY OF GHANA', x: WX(bx) - 0.15, y: F0 + 0.98, z: WZ(bz - 0.2), ry: -Math.PI / 2, w: 0.62, colors: ['#1d3f7a', '#ffffff'] });
    k.plain.push([B(bx - 0.3, bx - 0.5, F0 + 2.45, F0 + 2.6, bz + 1.15, bz + 1.35), '#e9e9e6']);
    k.plain.push([B(bx - 0.14, bx - 0.02, F0 + 3.06, F0 + 3.14, bz - 0.95, bz + 0.95), '#d8b24a']);
    // the centre's board as it reads (owner's photo): the university's and WACCBIP's marks, the centre's name, the
    // African Centre of Excellence, the department (annex), the college, the addresses
    const boardTex = canvas(1024, 560, (g) => {
      g.fillStyle = '#9aa0a6'; g.fillRect(0, 0, 1024, 560);
      g.fillStyle = '#fbfbfa'; g.fillRect(8, 8, 1008, 544);
      g.fillStyle = '#1d3f7a'; g.fillRect(150, 34, 40, 48); g.fillStyle = '#d8b24a'; g.fillRect(158, 42, 24, 30);
      g.textBaseline = 'middle'; g.textAlign = 'left';
      g.fillStyle = '#1d3f7a'; g.font = 'bold 34px sans-serif'; g.fillText('UNIVERSITY', 202, 46); g.fillText('OF GHANA', 202, 80);
      g.fillStyle = '#b9bcc0'; g.fillRect(470, 30, 3, 60);
      g.strokeStyle = '#1d3f7a'; g.lineWidth = 3; g.strokeRect(520, 32, 330, 58);
      g.fillStyle = '#1d3f7a'; g.font = 'bold 44px sans-serif'; g.fillText('WACCBIP', 540, 62);
      g.fillStyle = '#7b8a99'; g.beginPath(); g.moveTo(790, 40); g.lineTo(830, 48); g.lineTo(822, 84); g.lineTo(800, 78); g.closePath(); g.fill();
      g.textAlign = 'center';
      g.fillStyle = '#4b6cb7'; g.font = 'bold 40px sans-serif'; g.fillText('WEST AFRICAN CENTRE FOR CELL BIOLOGY OF', 512, 150); g.fillText('INFECTIOUS PATHOGENS', 512, 198);
      g.fillStyle = '#8a6fc0'; g.font = 'bold 24px sans-serif'; g.fillText('AFRICAN CENTRE OF EXCELLENCE FOR HIGHER EDUCATION', 512, 240);
      g.fillStyle = '#2a2d33'; g.font = 'bold 26px sans-serif'; g.fillText('DEPARTMENT OF BIOCHEMISTRY, CELL & MOLECULAR BIOLOGY (ANNEX)', 512, 300);
      g.font = 'bold 32px sans-serif'; g.fillText('COLLEGE OF BASIC & APPLIED SCIENCES', 512, 350);
      g.fillStyle = '#c3c6ca'; g.fillRect(120, 380, 784, 2);
      g.fillStyle = '#3a3d42'; g.font = '22px sans-serif'; g.fillText('waccbipleader@ug.edu.gh  |  waccbipadmin@ug.edu.gh', 512, 420); g.fillText('www.waccbip.org', 512, 456);
    });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.64), new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.6 }));
    board.position.set(WX(bx) - 0.11, F0 + 4.0, WZ(bz));
    board.rotation.y = -Math.PI / 2;
    k.meshes.push(board);
    k.plain.push([B(bx - 0.1, bx, F0 + 3.15, F0 + 4.85, bz - 1.56, bz + 1.56), '#9aa0a6']);
    // the planters each side, the window with its brown grille over the door, iron grilles each side of it
    for (const [s, w] of [[-1, 1.0], [1, 1.8]] as [number, number][]) {
      const zc = bz + s * (2.0 + w / 2);
      c.push([B(bx - 1.3, bx - 0.1, 0, 0.55, zc - w / 2, zc + w / 2), PAINT]);
      k.plain.push([new THREE.IcosahedronGeometry(0.4, 0).scale(1.2 * w, 0.7, 1).translate(WX(bx - 0.7), 0.75, WZ(zc)), '#4a7a32']);
      k.plain.push([B(bx - 0.06, bx, F1 + 1.2, F1 + 1.7, bz + s * 4.5 - 0.8, bz + s * 4.5 + 0.8), '#2a2a2a']);
      for (let z = bz + s * 4.5 - 0.7; z < bz + s * 4.5 + 0.75; z += 0.2) k.plain.push([B(bx - 0.09, bx - 0.05, F1 + 1.25, F1 + 1.65, z - 0.02, z + 0.02), '#4a4a48']);
    }
    k.glass.push(B(bx - 0.06, bx - 0.02, F1 + 0.8, F1 + 2.5, bz - 0.9, bz + 0.9));
    for (let z = bz - 0.9; z <= bz + 0.91; z += 0.3) k.plain.push([B(bx - 0.1, bx - 0.06, F1 + 0.8, F1 + 2.5, z - 0.03, z + 0.03), '#6b4a2e']);
    // the tall windows over two floors near each end, black frames; slit and small windows; pilasters; lamps
    const tall = (zc: number, w: number, y0: number, y1: number, cols: number, rows: number) => {
      k.glass.push(B(bx - 0.06, bx - 0.02, y0, y1, zc - w / 2, zc + w / 2));
      k.plain.push([B(bx - 0.1, bx, y0 - 0.08, y0, zc - w / 2 - 0.08, zc + w / 2 + 0.08), '#1c1d1f'], [B(bx - 0.1, bx, y1, y1 + 0.08, zc - w / 2 - 0.08, zc + w / 2 + 0.08), '#1c1d1f']);
      for (let i = 0; i <= cols; i++) { const z = zc - w / 2 + (w * i) / cols; k.plain.push([B(bx - 0.1, bx - 0.02, y0, y1, z - 0.05, z + 0.05), '#1c1d1f']); }
      for (let j = 1; j < rows; j++) { const y = y0 + ((y1 - y0) * j) / rows; k.plain.push([B(bx - 0.1, bx - 0.02, y - 0.04, y + 0.04, zc - w / 2, zc + w / 2), '#1c1d1f']); }
      c.push([B(bx - 0.12, bx, y0 - 0.25, y0 - 0.08, zc - w / 2 - 0.2, zc + w / 2 + 0.2), '#e6e4de']);
    };
    tall(-348.6, 1.9, F0 + 0.7, F1 + 2.8, 2, 3);
    tall(-320.2, 1.9, F0 + 0.7, F1 + 2.8, 2, 3);
    tall(-341.0, 0.5, F1 - 1.2, F1 + 2.4, 1, 2);
    tall(-338.4, 1.3, F1 + 0.4, F1 + 2.6, 2, 1);
    tall(-324.9, 0.9, F0 + 1.0, F0 + 1.9, 1, 1);
    for (let z = -325.3; z < -324.4; z += 0.15) k.plain.push([B(bx - 0.12, bx - 0.08, F0 + 1.0, F0 + 1.9, z - 0.015, z + 0.015), '#2a2a2a']);
    for (const z of [-342.0, -317.3]) c.push([B(bx - 0.3, bx, 0, EAVE - 0.3, z - 0.35, z + 0.35), PAINT]);
    for (const z of [-346.1, -322.5]) k.plain.push([B(bx - 0.15, bx, F0 + 2.3, F0 + 2.45, z - 0.4, z + 0.4), '#fff1c4']);
    // a white ventilation grille low under the north tall window, an air-conditioner by the pilaster
    k.plain.push([B(bx - 0.08, bx, 0.5, 1.3, -348.1, -345.4), '#ecebe6']);
    for (let y = 0.6; y < 1.25; y += 0.12) k.plain.push([B(bx - 0.12, bx - 0.08, y, y + 0.05, -348.0, -345.5), '#bdbbb4']);
    k.plain.push([B(bx - 0.3, bx, F0 + 2.6, F0 + 3.15, -341.9, -341.1), '#eceeee']);
    // the paving between the back and the road, a post and chain along it
    paving(k, -305.0, bx, WR[2], WR[3]);
    for (const z of [-320.5, -316.2, -312.0]) k.plain.push([new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8).translate(WX(-304.4), 0.5, WZ(z)), '#6d7175']);
    for (let z = -320.5; z < -312.1; z += 0.25) { const t = ((z + 320.5) % 4.3) / 4.3, sag = 0.25 * Math.sin(Math.PI * t); k.plain.push([B(-304.42, -304.38, 0.9 - sag, 0.94 - sag, z, z + 0.22), '#3a3a3a']); }
    const g = garden([-310, -220, -372, -286]);
    g.reseed(61);
    for (const [z, h] of [[-340.2, 4.6], [-339.0, 5.6], [-337.6, 4.2], [-336.2, 5.2], [-335.0, 4.8]] as [number, number][]) g.palm(k, WX(bx - 1.0), WZ(z), h);
    // the light well between the west range and the spine: paving, planted boxes
    paving(k, WR[1], CB[0], NA[3], SA[2]);
    for (const z of [-336.5, -333.2, -329.9, -326.6, -323.6]) { c.push([B(-292.4, -290.4, 0, 0.6, z - 0.9, z + 0.9), PAINT]); k.plain.push([new THREE.IcosahedronGeometry(0.75, 0).scale(1.2, 0.8, 1).translate(WX(-291.4), 1.0, WZ(z)), '#3f6f2c']); }
    // the raised box on the roof over the back (photo 4), weathered
    const rb = new THREE.Mesh(merge([[B(-299.8, -295.6, EAVE - 0.4, EAVE + 2.4, -334.5, -325.5), '#d4d1c8'], [B(-300.1, -295.3, EAVE + 2.4, EAVE + 2.65, -334.8, -325.2), '#bdb9af']]), concrete(0.6));
    rb.castShadow = true;
    k.meshes.push(rb);

    // ---- the roofs: hips with gablets on the wings and the pavilion, the spine's ends buried in the wings ----
    const M = (x: number, z: number): [number, number] => [WX(x), WZ(z)];
    const O = 0.8, hip = { gw: 0, tri: false }, gab = { gw: 2.2, tri: true }, buried = { gw: 99, tri: false };
    hipRoof(k, M, NW[0] - O, NW[1] + O, NW[2] - O, NW[3] + O, EAVE, 0.45, 'x', [gab, gab], c);
    hipRoof(k, M, SW[0] - O, SW[1] + O, SW[2] - O, SW[3] + O, EAVE, 0.45, 'x', [gab, gab], c);
    hipRoof(k, M, NUB[0] - O, NUB[1] + O, NUB[2] - O, NUB[3] + 2, EAVE, 0.45, 'x', [hip, hip], c);
    hipRoof(k, M, SPINE[0] - O, GE + O, -355.4, -301.1, EAVE, 0.45, 'z', [buried, buried], c);
    // the west range under a hip along the back, the arms' gablets over its ends (photo 4), the block by the well
    hipRoof(k, M, WR[0] - O, WR[1] + O, WR[2] - O, WR[3] + O, EAVE, 0.45, 'z', [hip, hip], c);
    hipRoof(k, M, WR[0] - O, NA[1] + 2, NA[2] - O, NA[3] + O, EAVE, 0.45, 'x', [gab, buried], c);
    hipRoof(k, M, WR[0] - O, SA[1] + 2, SA[2] - O, SA[3] + O, EAVE, 0.45, 'x', [gab, buried], c);
    hipRoof(k, M, CB[0] - O, CB[1] + 2, CB[2], CB[3], EAVE, 0.45, 'z', [buried, buried], c);
    hipRoof(k, M, -273.5, PE + O, PAV[2] - O, PAV[3] + O, EAVE, 0.45, 'x', [buried, gab], c);

    // ---- before the front: brick paving, the shades over the car parks, yucca islands by the road ----
    paving(k, GE + 0.2, -249.3, NW[3] + 0.1, SW[2] - 0.1);
    paving(k, -245.0, -233.6, -363, -313.5);
    paving(k, -233.6, -225.4, ENZ - 3.1, ENZ + 2.9);
    shade(k, c, -258.7, -251.2, -348.2, -338.0, 'x0');
    shade(k, c, -260.0, -251.4, -329.4, -321.0, 'x0');
    shade(k, c, -243.0, -234.0, -362.5, -336.8, 'x1');
    shade(k, c, -243.5, -234.0, -330.6, -314.0, 'x1');
    for (const [za, zb] of [[-362.5, ENZ - 3.1], [ENZ + 2.9, -313.5]]) {
      k.plain.push([B(-233.75, -233.45, 0, 0.18, za, zb), '#d8d6cf']);
      for (const z of [za, zb]) k.plain.push([B(-233.6, -225.6, 0, 0.18, z - 0.15, z + 0.15), '#d8d6cf']);
      for (let z = za + 1.4; z < zb - 1; z += 2.3) for (const [x, sc] of [[-231.6, 0.9], [-228.4, 1.1]] as [number, number][]) yucca(k, x + ((z * 13) % 3) * 0.2, z + (x > -230 ? 1.1 : 0), sc, z * 0.7);
    }
    // the centre's board by the road, lamp posts along the walk
    for (const z of [-339.6, -338.0]) k.plain.push([new THREE.CylinderGeometry(0.07, 0.07, 3.2, 8).translate(WX(-230.6), 1.6, WZ(z)), '#8a8d90']);
    k.plain.push([B(-230.7, -230.5, 1.7, 3.0, -339.8, -337.8), '#f4f4f1']);
    k.signs.push({ text: 'WACCBIP', x: WX(-230.48), y: 2.6, z: WZ(-338.8), ry: Math.PI / 2, w: 1.6, colors: ['#f4f6f8', '#1d3f7a'] });
    for (const z of [-338.6, -328.4]) {
      k.plain.push([new THREE.CylinderGeometry(0.08, 0.11, 8, 8).translate(WX(-250.8), 4, WZ(z)), '#8a8d90']);
      k.plain.push([B(-251.6, -250.8, 7.85, 8.0, z - 0.12, z + 0.12), '#8a8d90'], [B(-251.8, -251.3, 7.7, 7.85, z - 0.15, z + 0.15), '#fff1c4']);
    }
    // shade trees on the lawns south of the front and by the road
    for (const [x, z, sc] of [[-230.5, -301, 1.3], [-238.5, -297.5, 1.1], [-228.5, -366, 1.3]] as [number, number, number][]) g.tree(k, WX(x), WZ(z), sc);

    const m = new THREE.Mesh(merge(c), concrete(0.1));
    m.castShadow = true; m.receiveShadow = true;
    k.meshes.push(m);
  },
};

// ---------- the old shed (owner's white mark, photo 5) ----------
const SO: [number, number] = [-238.55, -377.65];
const SX = (x: number) => x - SO[0], SZ = (z: number) => z - SO[1];
const SB = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(SX(x0), SX(x1), y0, y1, SZ(z0), SZ(z1));
const SH = { x0: -241.4, x1: -235.75, z0: -383.3, z1: -372.0 }, SHE = 3.0, SHP = 0.55;
const oldShed: Spec = {
  name: 'old shed north of WACCBIP',
  axis: [1, 0], origin: SO, storey: 3, style: W_WIN, roofColor: '#8a4a37', fascia: '#5a4a3e', pitch: SHP,
  replaces: [[-238.6, -377.7]],
  blocks: [],
  keep: [[SX(SH.x0) - 0.5, SX(SH.x1) + 2.5, SZ(SH.z0) - 0.5, SZ(SH.z1) + 0.5]],
  extras: (k: Kit) => {
    const c: Part[] = [];
    const OW = '#e3e0d6';
    const { x0, x1, z0, z1 } = SH, xm = (x0 + x1) / 2;
    // the walls, a doorway's gap in the east wall for the open door
    c.push([SB(x0, x0 + 0.2, 0, SHE, z0, z1), OW], [SB(x0, x1, 0, SHE, z0, z0 + 0.2), OW], [SB(x0, x1, 0, SHE, z1 - 0.2, z1), OW]);
    c.push([SB(x1 - 0.2, x1, 0, SHE, z0, -379.0), OW], [SB(x1 - 0.2, x1, 0, SHE, -377.4, z1), OW], [SB(x1 - 0.2, x1, 2.4, SHE, -379.0, -377.4), OW]);
    k.plain.push([SB(x0 + 0.2, x1 - 0.2, 0, 0.05, z0 + 0.2, z1 - 0.2), '#6d665c']);
    // the dark room inside the open door, rubbish on its floor
    k.plain.push([SB(x0 + 0.25, x1 - 0.25, 0.05, SHE - 0.05, z0 + 0.25, z1 - 0.25), '#151311']);
    k.plain.push([SB(x1 - 1.6, x1 - 0.6, 0.05, 0.5, -378.8, -377.8), '#3b3026']);
    // the gable ends: white triangles, stained
    const top = SHE + ((x1 - x0) / 2 + 0.5) * SHP;
    for (const z of [z0 - 0.01, z1 + 0.01]) c.push([tri2([SX(x0), SHE, SZ(z)], [SX(x1), SHE, SZ(z)], [SX(xm), top - 0.3, SZ(z)]), OW]);
    // mould and damp up the foot of the walls, rain stains hanging from the eaves
    let s = 5;
    const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const stain = (ax: number, az: number, bx: number, bz: number, nx: number, nz: number) => {
      const len = Math.hypot(bx - ax, bz - az), n = Math.ceil(len / 0.3);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t, w = len / n / 2 + 0.05;
        const h = 0.15 + r() * 0.45 + (r() < 0.15 ? r() * 0.5 : 0), col = ['#9a9c8c', '#8e9282', '#a8a898', '#848a78'][(r() * 4) | 0];
        k.plain.push([box(SX(x) - (nz ? w : 0.01), SX(x) + (nz ? w : 0.01), 0, h, SZ(z) - (nx ? w : 0.01), SZ(z) + (nx ? w : 0.01)).translate(nx * 0.02, 0, nz * 0.02), col]);
        if (r() < 0.3) k.plain.push([box(SX(x) - (nz ? 0.06 : 0.01), SX(x) + (nz ? 0.06 : 0.01), SHE - 0.6 - r() * 1.2, SHE - 0.1, SZ(z) - (nx ? 0.06 : 0.01), SZ(z) + (nx ? 0.06 : 0.01)).translate(nx * 0.02, 0, nz * 0.02), '#b4b1a4']);
      }
    };
    stain(x1, z0, x1, -379.1, 1, 0); stain(x1, -377.3, x1, z1, 1, 0);
    stain(x0, z0, x0, z1, -1, 0); stain(x0, z0, x1, z0, 0, -1); stain(x0, z1, x1, z1, 0, 1);
    // patches where the paint has gone and the grey render shows
    for (let i = 0; i < 10; i++) {
      const z = z0 + 0.6 + r() * (z1 - z0 - 1.2), y = 0.9 + r() * 1.6, w = 0.2 + r() * 0.5;
      if (z > -379.3 && z < -377.1) continue;
      k.plain.push([SB(x1, x1 + 0.02, y, y + w * 0.6, z - w / 2, z + w / 2), '#b9b4a6']);
    }
    // the old plank doors: one shut, its top a louvre; the other standing open on the dark room, its foot broken
    const plank = (ax: number, az: number, bx: number, bz: number, h: number, open: boolean) => {
      const len = Math.hypot(bx - ax, bz - az), n = Math.round(len / 0.14);
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 0.9) / n, foot = open && i > n - 4 ? 0.25 + (n - i) * 0.05 : 0.04;
        const pa = [ax + (bx - ax) * t0, az + (bz - az) * t0], pb = [ax + (bx - ax) * t1, az + (bz - az) * t1];
        k.plain.push([box(Math.min(SX(pa[0]), SX(pb[0])) - 0.02, Math.max(SX(pa[0]), SX(pb[0])) + 0.02, foot, h - (i % 3) * 0.02, Math.min(SZ(pa[1]), SZ(pb[1])) - 0.02, Math.max(SZ(pa[1]), SZ(pb[1])) + 0.02), ['#7b6b58', '#6c5e4d', '#857462', '#5f5244'][i % 4]]);
      }
    };
    // (south to north along the east wall, photo 5: the bush, the shut door, the open door, a small high window)
    // the shut door, its louvre at the top
    plank(x1 + 0.03, -376.9, x1 + 0.03, -375.7, 2.2, false);
    for (let y = 1.5; y < 2.15; y += 0.12) k.plain.push([SB(x1 + 0.05, x1 + 0.1, y, y + 0.05, -376.8, -375.8), '#4a3f33']);
    k.plain.push([SB(x1, x1 + 0.08, 2.2, 2.35, -377.05, -375.55), '#5a4a3e']);
    // the open door: hinged at the doorway's north side, swung out east
    plank(x1 + 0.05, -379.0, x1 + 1.4, -379.45, 2.3, true);
    k.plain.push([SB(x1, x1 + 0.1, 2.3, 2.45, -379.1, -377.3), '#5a4a3e']);
    for (const z of [-379.05, -377.35]) k.plain.push([SB(x1, x1 + 0.08, 0, 2.3, z - 0.05, z + 0.05), '#5a4a3e']);
    // louvred windows, dark and old: high on the north gable end and in the west wall
    for (const [ax, az, bx, bz, y0, y1] of [[x1 + 0.04, -381.8, x1 + 0.04, -380.8, 1.9, 2.6], [-239.0, z0 - 0.04, -237.9, z0 - 0.04, 1.6, 2.4], [x0 - 0.04, -379.5, x0 - 0.04, -378.2, 1.2, 2.3], [x0 - 0.04, -375.2, x0 - 0.04, -373.9, 1.2, 2.3]]) {
      const alongX = ax !== bx, lo = (a: number, b: number) => Math.min(a, b), hi = (a: number, b: number) => Math.max(a, b);
      k.plain.push([SB(lo(ax, bx) - (alongX ? 0.06 : 0.03), hi(ax, bx) + (alongX ? 0.06 : 0.03), y0 - 0.06, y1 + 0.06, lo(az, bz) - (alongX ? 0.03 : 0.06), hi(az, bz) + (alongX ? 0.03 : 0.06)), '#4d4034']);
      for (let y = y0 + 0.08; y < y1 - 0.04; y += 0.11) k.plain.push([SB(lo(ax, bx) - 0.02 - (alongX ? 0 : 0.03), hi(ax, bx) + 0.02 + (alongX ? 0 : 0.03), y, y + 0.05, lo(az, bz) - (alongX ? 0.05 : 0), hi(az, bz) + (alongX ? 0.05 : 0)), '#6a5a48']);
    }
    // the roof: old clay tiles gone dark, moss in patches, a ridge of capping tiles, worn bargeboards
    const ex0 = x0 - 0.5, ex1 = x1 + 0.5, ez0 = z0 - 0.45, ez1 = z1 + 0.45;
    k.roof.quad([SX(ex0), SHE - 0.25, SZ(ez1)], [SX(ex0), SHE - 0.25, SZ(ez0)], [SX(xm), top, SZ(ez0)], [SX(xm), top, SZ(ez1)]);
    k.roof.quad([SX(ex1), SHE - 0.25, SZ(ez0)], [SX(ex1), SHE - 0.25, SZ(ez1)], [SX(xm), top, SZ(ez1)], [SX(xm), top, SZ(ez0)]);
    const slope = (top - SHE + 0.25) / (xm - ex0);
    for (let i = 0; i < 26; i++) {
      const side = i % 2 ? 1 : -1, d = 0.4 + r() * (xm - ex0 - 0.8), z = ez0 + 0.5 + r() * (ez1 - ez0 - 1), w = 0.25 + r() * 0.5, l = 0.3 + r() * 0.8;
      const x = xm + side * d, y = top - d * slope + 0.04;
      const p = new THREE.BoxGeometry(w, 0.02, l).rotateZ(-side * Math.atan(slope)).translate(SX(x), y, SZ(z));
      k.plain.push([p, ['#4a4a36', '#3d4330', '#54503a', '#5e3a2c'][i % 4]]);
    }
    for (let t = 0.3; t < xm - ex0; t += 0.32) for (const side of [-1, 1]) {
      const x = xm + side * t, y = top - t * slope + 0.025;
      k.plain.push([new THREE.BoxGeometry(0.035, 0.03, ez1 - ez0).rotateZ(-side * Math.atan(slope)).translate(SX(x), y, SZ((ez0 + ez1) / 2)), '#6a3828']);
    }
    k.plain.push([new THREE.CylinderGeometry(0.13, 0.13, ez1 - ez0, 8).rotateX(Math.PI / 2).translate(SX(xm), top, SZ((ez0 + ez1) / 2)), '#74392a']);
    for (const z of [ez0, ez1]) for (const side of [-1, 1]) {
      const len = Math.hypot(xm - ex0, top - SHE + 0.25);
      k.plain.push([new THREE.BoxGeometry(len, 0.22, 0.05).rotateZ(-side * Math.atan(slope)).translate(SX(xm + side * (xm - ex0) / 2), (top + SHE - 0.25) / 2 - 0.08, SZ(z)), '#5a4a3e']);
    }
    // the bush grown up over its south-east corner, tall grass round its foot
    for (const [x, z, rr] of [[-234.6, -373.4, 1.5], [-234.3, -371.6, 1.2], [-235.5, -370.8, 1.1], [-236.8, -370.6, 0.9], [-234.5, -375.3, 0.9]] as [number, number, number][]) {
      k.plain.push([new THREE.IcosahedronGeometry(rr, 1).scale(1, 0.85, 1).translate(SX(x), rr * 0.75, SZ(z)), ['#3f6a2a', '#365f24', '#4a7531'][(rr * 10) % 3 | 0]]);
    }
    for (let i = 0; i < 40; i++) {
      const side = (i % 4) as 0 | 1 | 2 | 3, t = r();
      const [x, z] = side === 0 ? [x0 - 0.3, z0 + t * (z1 - z0)] : side === 1 ? [x1 + 0.3, z0 + t * (z1 - z0)] : side === 2 ? [x0 + t * (x1 - x0), z0 - 0.3] : [x0 + t * (x1 - x0), z1 + 0.3];
      if (side === 1 && z > -379.2 && z < -377.2) continue;
      k.plain.push([new THREE.ConeGeometry(0.18, 0.5 + r() * 0.5, 4).translate(SX(x), 0.3, SZ(z)), r() < 0.5 ? '#557a34' : '#6a8a3e']);
    }
    const m = new THREE.Mesh(merge(c), concrete(1.8));
    m.castShadow = true; m.receiveShadow = true;
    k.meshes.push(m);
  },
};

// ---------- the unfinished frame (owner's green mark, photo 2) ----------
// (model frame along the frame's long side; its rectangles measured from the two satellite outlines)
const FU: [number, number] = [0.46947, -0.88295];
const FRAME_RECTS: { r: [number, number, number, number]; slab: boolean; stubs: [number, number] | null }[] = [
  { r: [-45.6, -26.9, -4.4, 10.0], slab: true, stubs: [-36, -26.9] },
  { r: [-26.9, -6.9, -17.7, 8.2], slab: true, stubs: [-26.9, -6.9] },
  { r: [2.2, 34.7, -5.2, 9.1], slab: true, stubs: [26, 34.7] },
  { r: [38.4, 46.6, -5.2, 9.0], slab: false, stubs: null },
];
const unfinished: Spec = {
  name: 'unfinished building north of WACCBIP',
  axis: FU, origin: [-220, -440], storey: 3.6, style: W_WIN, roofColor: WROOF, fascia: WFASCIA, pitch: 0.3,
  replaces: [[-232.1, -427.3], [-209.6, -455.4]],
  blocks: [],
  keep: [],
  extras: (k: Kit) => {
    const c: Part[] = [];
    let s = 9;
    const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const H = 3.6, SL = 0.22, GREY = '#a3a199', DARK = '#8f8c84', REBAR = '#5b4535';
    const grid = (a: number, b: number) => { const n = Math.max(1, Math.round((b - a) / 4.8)); return Array.from({ length: n + 1 }, (_, i) => a + 0.25 + ((b - a - 0.5) * i) / n); };
    const g = garden([-260, -180, -495, -390]);
    g.reseed(91);
    for (const { r: [x0, x1, z0, z1], slab, stubs } of FRAME_RECTS) {
      const xs = grid(x0, x1), zs = grid(z0, z1);
      // the ground slab, dirty, weeds through its cracks
      c.push([box(x0, x1, 0, 0.15, z0, z1), DARK]);
      for (const x of xs) for (const z of zs) {
        c.push([box(x - 0.2, x + 0.2, 0.15, H, z - 0.25, z + 0.25), GREY]);
        if (stubs && x >= stubs[0] - 0.3 && x <= stubs[1] + 0.3) {
          // a stub of the next floor's column, its bars standing out of it
          const sh = 1.6 + r() * 1.4;
          c.push([box(x - 0.2, x + 0.2, H + SL, H + SL + sh, z - 0.25, z + 0.25), GREY]);
          for (const [dx, dz] of [[-0.12, -0.17], [0.12, -0.17], [-0.12, 0.17], [0.12, 0.17]]) k.plain.push([box(x + dx - 0.015, x + dx + 0.015, H + SL + sh, H + SL + sh + 0.6 + r() * 0.5, z + dz - 0.015, z + dz + 0.015), REBAR]);
        } else if (!slab) {
          for (const [dx, dz] of [[-0.12, -0.17], [0.12, 0.17]]) k.plain.push([box(x + dx - 0.015, x + dx + 0.015, H, H + 0.7, z + dz - 0.015, z + dz + 0.015), REBAR]);
        }
      }
      // beams along the grid lines, the first-floor slab over them
      for (const z of zs) c.push([box(x0 + 0.05, x1 - 0.05, H - 0.5, H, z - 0.15, z + 0.15), GREY]);
      for (const x of xs) c.push([box(x - 0.15, x + 0.15, H - 0.5, H, z0 + 0.05, z1 - 0.05), GREY]);
      if (slab) c.push([box(x0 - 0.1, x1 + 0.1, H, H + SL, z0 - 0.1, z1 + 0.1), '#9b998f']);
      // blockwork in some bays round the edge, never finished: some to the beams, some half way
      for (let i = 0; i < xs.length - 1; i++) for (const z of [zs[0], zs[zs.length - 1]]) {
        if (r() < 0.55) continue;
        const h = r() < 0.5 ? H - 0.5 : 1.0 + r() * 1.4;
        c.push([box(xs[i] + 0.2, xs[i + 1] - 0.2, 0.15, h, z - 0.08, z + 0.08), '#b0ada3']);
      }
      for (let i = 0; i < zs.length - 1; i++) for (const x of [xs[0], xs[xs.length - 1]]) {
        if (r() < 0.6) continue;
        const h = r() < 0.5 ? H - 0.5 : 1.0 + r() * 1.4;
        c.push([box(x - 0.08, x + 0.08, 0.15, h, zs[i] + 0.25, zs[i + 1] - 0.25), '#b0ada3']);
      }
      // weeds and young trees grown up inside
      for (let i = 0; i < Math.round(((x1 - x0) * (z1 - z0)) / 70); i++) {
        const x = x0 + 1 + r() * (x1 - x0 - 2), z = z0 + 1 + r() * (z1 - z0 - 2);
        if (r() < 0.25) g.tree(k, x, z, 0.5 + r() * 0.3);
        else k.plain.push([new THREE.IcosahedronGeometry(0.5 + r() * 0.5, 0).scale(1.2, 0.7, 1).translate(x, 0.45, z), ['#4a7531', '#5d7f38', '#3f6a2a'][i % 3]]);
      }
    }
    // the bit of slab joining the long block's two parts
    c.push([box(34.7, 38.4, 0, 0.15, -5.2, -2.0), DARK]);
    const m = new THREE.Mesh(merge(c), concrete(1.3));
    m.castShadow = true; m.receiveShadow = true;
    k.meshes.push(m);
  },
};

/** WACCBIP, its car-park shades, the old shed and the unfinished frame north of it */
export const waccbipSite = createSite('waccbip', [waccbip, oldShed, unfinished]);
