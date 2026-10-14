// Bani Hostel (the owner's Bani reconstruction brief, 34 pages: the satellite M1 with targets 1-12, the game map M2, the
// photographs R01-R27 and the video V01-V05; docs/bani/). The game drew the hostel's blocks as generic boxes. Now:
// - targets 1-4, the four parallel bars (the mapped outlines, ground plus three upper tiers, R01): terracotta hipped
//   roofs; the faces toward the two paved courts (bar 1's south and bar 2's north, bar 3's south and bar 4's north) in
//   the colourful family (R01, R23, R24): cream walls with a salmon-pink middle section, tan stone-like vertical bands,
//   a grey stone strip up the middle over the flat yellow canopy on its two round yellow columns, deep balcony recesses
//   with pale rails and turquoise, green or blue panels in some; the other long faces (R25): white, projecting balconies
//   with solid white fronts and pale rails before light-blue back walls, red brick strips between the bays, barred
//   ground-floor bays, the small tiled gable canopy over the entry; the ends with a stack of small windows;
// - the strip along the bars' west ends: the two-storey court blocks closing each court's west end (R13, R19, R23,
//   R24: cream below, a salmon band over an open upper gallery with its pale rail, tall round yellow columns, a red
//   tiled hipped roof, conifers before them) and the other two-storey pieces between them;
// - the courts: grey cobble pavers with red paver bands, kerbed beds of white stone round palms, pink edging;
// - the ground east of the bars (target 8): red earth with grass in patches; behind the hostel toward Atomic (target
//   12 and the owner's 20-picture corrections): dense bush.
// The right-hand pair (targets 5 and 6, the plain white blocks) are in banipresec.ts. Dimensions are read from the
// photographs and the mapped outlines, not measured.
import * as THREE from 'three';
import { BUILDINGS, NODE_XZ, ROADS } from './campusmap';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { box, merge, type Part } from './modelkit';
import { Bag, hash, tuft, vnoise, fanPalm } from './enkit';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { hipRoof } from './waccbip';
import { mergeMeshes } from './medkit';
import { fit, type P2 } from './evandyplan';
import { segIndex } from './seggrid';
import { SOLIDS } from './solids';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#f1efe9') };
const ST = 3.0, PL = 0.3, TIERS = 4, EAVE = PL + TIERS * ST;
const CREAM = '#ebdfae', SALMON = '#e2a08c', TAN = '#b99a6e', GREYST = '#8e8a83', WHITE = '#f1f1ec', LBLUE = '#b9d2e2', BRICK = '#a65a42';
const RAIL = '#e9e9e4', YELLOW = '#e3a91f', TURQ = '#36a597', GREEN = '#4fae5c', BLUE = '#2f7fc0', FRAME = '#f4f1e6', DARKWIN = '#3a4046';

// ---------- the mapped outlines ----------
const ringOf = (i: number): P2[] => { const b = BUILDINGS[i]; const r: P2[] = []; if (!b) return r; for (let k = 0; k < b.pts.length; k += 2) r.push([b.pts[k], b.pts[k + 1]]); return r; };
const inRing = (r: P2[], x: number, z: number) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, zi] = r[i], [xj, zj] = r[j]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } return c; };
/** the outline holding a point (the map's indices move when it is rebuilt; points do not) */
const outlineAt = (x: number, z: number): P2[] => { const i = BUILDINGS.findIndex((b) => x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ && inRing(ringOf(BUILDINGS.indexOf(b)), x, z)); return i < 0 ? [] : ringOf(i); };

/** the four bars, top (north) to bottom, by a point inside each; which long face looks onto a court */
export const BARS: { at: P2; court: 'north' | 'south' }[] = [
  { at: [792, -1315], court: 'south' },
  { at: [792, -1281], court: 'north' },
  { at: [792, -1256], court: 'south' },
  { at: [792, -1222], court: 'north' },
];
/** the strip along the west ends: the two court blocks (their gallery toward the court, east) and the pieces between */
export const STRIP: { at: P2; court: boolean }[] = [
  { at: [765, -1300], court: true }, { at: [764, -1268], court: false }, { at: [766, -1242], court: true }, { at: [765, -1220], court: false },
];
/** the paved courts between bars 1 and 2, and between bars 3 and 4 (x0, x1, z0, z1) */
export const COURTS: [number, number, number, number][] = [[770, 815, -1307.2, -1289.6], [772, 815, -1248.2, -1230.8]];
/** the ground the hostel's grounds spec draws: the red-earth yard east of the bars, the bush behind toward Atomic */
export const YARD8: [number, number, number, number] = [818, 905, -1335, -1268];
export const BUSH: [number, number, number, number] = [690, 1000, -1430, -1336];

// the mapped roads near the hostel, so ground, trees and beds keep off them
const SEGS: [number, number, number, number, number][] = [];
for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++) {
  const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
  if (Math.max(ax, bx) < 660 || Math.min(ax, bx) > 1010 || Math.max(az, bz) < -1450 || Math.min(az, bz) > -1180) continue;
  SEGS.push([ax, az, bx, bz, [9, 7.4, 6.2, 4.6, 2.6][r.cls] / 2]);
}
const SEG_NEAR = segIndex(SEGS);
const roadGap = (x: number, z: number) => SEG_NEAR(x, z, 12);
const inAnyOutline = (x: number, z: number, pad = 0) => BUILDINGS.some((b) => x > b.minX - pad && x < b.maxX + pad && z > b.minZ - pad && z < b.maxZ + pad && inRing(ringOf(BUILDINGS.indexOf(b)), x, z));

// ---------- a bar ----------
type Seg = { t: 'E' | 'W' | 'B' | 'S' | 'G' | 'b' | 'R' | 'C'; w: number; salmon?: boolean };
/** the court face (R01, read left to right on the photograph; the same order is used on every court face) */
const COURT_FACE: Seg[] = [
  { t: 'E', w: 0.6, salmon: true }, { t: 'W', w: 2.4 }, { t: 'B', w: 3.0 }, { t: 'W', w: 2.0 }, { t: 'B', w: 3.0 }, { t: 'W', w: 2.0 }, { t: 'B', w: 3.0 },
  { t: 'S', w: 1.0 }, { t: 'W', w: 1.8 }, { t: 'B', w: 3.0, salmon: true }, { t: 'B', w: 3.0, salmon: true }, { t: 'G', w: 1.6, salmon: true },
  { t: 'B', w: 3.0, salmon: true }, { t: 'B', w: 3.0, salmon: true }, { t: 'W', w: 1.8 }, { t: 'S', w: 1.0 }, { t: 'B', w: 3.0 }, { t: 'W', w: 2.0 },
  { t: 'B', w: 3.0 }, { t: 'W', w: 2.0 }, { t: 'B', w: 3.0 }, { t: 'W', w: 2.4 }, { t: 'E', w: 0.6, salmon: true },
];
/** the outer face (R25): projecting balconies, brick strips, the tiled canopy over the entry ('C') */
const OUTER_FACE: Seg[] = [
  { t: 'E', w: 1.2 }, { t: 'b', w: 5.6 }, { t: 'R', w: 0.7 }, { t: 'b', w: 4.2 }, { t: 'R', w: 0.7 }, { t: 'W', w: 2.6 }, { t: 'C', w: 3.4 }, { t: 'W', w: 2.6 },
  { t: 'R', w: 0.7 }, { t: 'b', w: 4.2 }, { t: 'R', w: 0.7 }, { t: 'b', w: 5.6 }, { t: 'E', w: 1.2 },
];
const D = 1.3; // the depth of a recessed balcony

function barSpec(i: number): Spec | null {
  const B = BARS[i], q = outlineAt(...B.at);
  if (q.length < 4) return null;
  const f = fit(q.length === 4 ? q : q.slice(0, 4));
  return {
    name: `Bani Hostel bar ${i + 1}`, axis: f.axis, origin: f.c, storey: ST, style: PLAIN, roofColor: '#c4683e', fascia: '#efe7d6', pitch: 0.42,
    replaces: [B.at],
    blocks: [],
    keep: [[f.x0 - 3, f.x1 + 3, f.z0 - 4, f.z1 + 4]],
    extras: (k) => {
      const p: Part[] = [], { x0, x1, z0, z1 } = f;
      // the core: the long faces recessed by a balcony's depth; the ends full width
      p.push([box(x0, x1, 0, EAVE, z0 + D, z1 - D), CREAM]);
      const courtSide = B.court === 'north' ? -1 : 1;
      for (const side of [-1, 1] as const) face(k, p, side, side === courtSide ? COURT_FACE : OUTER_FACE, x0, x1, side < 0 ? z0 : z1, i * 10 + (side + 1));
      // the ends: a small window on each floor beside a narrow one (R03, R16 of the family), a band at each floor
      for (const [x, s] of [[x0, -1], [x1, 1]] as [number, number][]) for (let fl = 0; fl < TIERS; fl++) {
        const y = PL + fl * ST;
        for (const [zc, w] of [[(z0 + z1) / 2 - 1.6, 0.9], [(z0 + z1) / 2 + 1.4, 0.6]] as [number, number][]) {
          p.push([box(x + s * 0.02 - 0.04, x + s * 0.02 + 0.04, y + 1.0, y + 2.2, zc - w / 2 - 0.08, zc + w / 2 + 0.08), FRAME]);
          p.push([box(x + s * 0.05 - 0.02, x + s * 0.05 + 0.02, y + 1.06, y + 2.14, zc - w / 2, zc + w / 2), DARKWIN]);
        }
      }
      // the roof: a terracotta hip over the whole bar, a dark fascia and a pale soffit
      k.roof.c = new THREE.Color('#c4683e');
      hipRoof(k, (x, z) => [x, z], x0 - 0.6, x1 + 0.6, z0 - 0.6, z1 + 0.6, EAVE, 0.42, 'x', [{ gw: 0, tri: false }, { gw: 0, tri: false }], p, '#5a3a2a');
      p.push([box(x0 - 0.6, x1 + 0.6, EAVE - 0.06, EAVE, z0 - 0.6, z1 + 0.6), '#ddd3be']);
      k.plain.push(...p);
      mergeMeshes(k);
    },
  };
}

/** one long face: its segments scaled to the face's length; `side` -1 the north (z0) face, +1 the south */
function face(k: Kit, p: Part[], side: -1 | 1, prog: Seg[], x0: number, x1: number, zf: number, seed: number) {
  const total = prog.reduce((s, g) => s + g.w, 0), sc = (x1 - x0) / total;
  // z of a point `d` metres out from the core face toward the outside
  const zc = zf - side * D, Z = (d: number) => zc + side * d, zz = (a: number, b: number): [number, number] => [Math.min(Z(a), Z(b)), Math.max(Z(a), Z(b))];
  let u = x0;
  const court = prog === COURT_FACE;
  for (const [n, g] of prog.entries()) {
    const a = u, b = u + g.w * sc, m = (a + b) / 2, w = b - a;
    u = b;
    const wall = g.salmon ? SALMON : court ? CREAM : WHITE;
    const win = (cx: number, y: number, ww: number, hh: number, barred: boolean) => {
      const [f0, f1] = zz(D - 0.02, D + 0.04);
      p.push([box(cx - ww / 2 - 0.08, cx + ww / 2 + 0.08, y - 0.08, y + hh + 0.08, f0, f1), FRAME]);
      const [g0, g1] = zz(D + 0.04, D + 0.06);
      p.push([box(cx - ww / 2, cx + ww / 2, y, y + hh, g0, g1), DARKWIN]);
      if (barred) for (let x = cx - ww / 2 + 0.1; x < cx + ww / 2; x += 0.14) { const [h0, h1] = zz(D + 0.06, D + 0.09); p.push([box(x - 0.015, x + 0.015, y, y + hh, h0, h1), '#2b2d2f']); }
    };
    if (g.t === 'E' || g.t === 'W' || g.t === 'C') {
      const [f0, f1] = zz(0, D);
      p.push([box(a, b, 0, EAVE, f0, f1), wall]);
      if (g.t === 'W') for (let fl = 0; fl < TIERS; fl++) win(m, PL + fl * ST + 0.95, Math.min(0.9, w - 0.5), 1.25, fl === 0);
      if (g.t === 'C') {
        // the entry: a dark door under the small tiled gable canopy on two pale posts (R25), windows above
        const [d0, d1] = zz(D + 0.02, D + 0.05);
        p.push([box(m - 0.75, m + 0.75, PL, PL + 2.3, d0, d1), '#5c4632']);
        for (let fl = 1; fl < TIERS; fl++) win(m, PL + fl * ST + 0.95, 1.2, 1.25, false);
        const cz = Z(D + 2.4), y = PL + 2.8;
        for (const x of [m - 1.7, m + 1.7]) { p.push([box(x - 0.12, x + 0.12, 0, y, ...zz(D + 2.3, D + 2.55)), FRAME]); SOLIDS.add(...world(k, x, cz), 0.2); }
        k.roof.c = new THREE.Color('#b9653d');
        hipRoof(k, (x, z) => [x, z], m - 2.3, m + 2.3, ...zz(D - 0.2, D + 2.9), y, 0.5, 'z', side < 0 ? [{ gw: 99, tri: false }, { gw: 0, tri: false }] : [{ gw: 0, tri: false }, { gw: 99, tri: false }], p, '#5a3a2a');
        p.push([box(m - 2.3, m + 2.3, y - 0.05, y, ...zz(D - 0.2, D + 2.9)), '#ddd3be']);
      }
    } else if (g.t === 'S') {
      // the tan stone band standing a little forward, its courses shaded floor by floor
      for (let fl = 0; fl < TIERS; fl++) p.push([box(a, b, fl * ST, (fl + 1) * ST + (fl === TIERS - 1 ? PL : 0), ...zz(0, D + 0.18)), fl % 2 ? TAN : '#a98a62']);
    } else if (g.t === 'G') {
      // the grey stone strip up the middle (the stair), the flat yellow canopy on its round yellow columns at its foot,
      // the turquoise doors under it (R01, R24)
      p.push([box(a, b, 0, EAVE + 0.4, ...zz(0, D + 0.1)), GREYST]);
      for (let fl = 1; fl < TIERS; fl++) { const y = PL + fl * ST + 0.7; p.push([box(a + 0.25, b - 0.25, y, y + 1.6, ...zz(D + 0.1, D + 0.13)), '#6e6b66']); }
      const [d0, d1] = zz(D + 0.1, D + 0.14);
      p.push([box(a - 0.6, b + 0.6, PL, PL + 2.4, d0, d1), TURQ]);
      const cw = 2.3, cd = 2.6, ch = PL + 3.0;
      p.push([box(m - cw, m + cw, ch, ch + 0.45, ...zz(D, D + cd)), YELLOW]);
      for (const x of [m - cw + 0.35, m + cw - 0.35]) {
        p.push([new THREE.CylinderGeometry(0.2, 0.22, ch, 12).translate(x, ch / 2, Z(D + cd - 0.35)), YELLOW]);
        SOLIDS.add(...world(k, x, Z(D + cd - 0.35)), 0.25);
      }
      p.push([box(m - cw, m + cw, 0, PL, ...zz(D, D + cd)), '#d9cfbf'], [box(m - cw + 0.3, m + cw - 0.3, 0, PL * 0.5, ...zz(D + cd, D + cd + 0.4)), '#d9cfbf']);
    } else if (g.t === 'B') {
      // a recessed balcony bay: side cheeks to the face line, the slab at each upper floor, a pale rail on a low upstand,
      // the back wall with its door and window; some back walls or cheeks in the accent colours (R01, R23)
      const acc = hash(n * 3.1, seed);
      const back = acc < 0.22 ? TURQ : acc < 0.32 ? GREEN : wall;
      const cheek = acc > 0.82 ? BLUE : wall;
      for (const x of [a, b - 0.25]) p.push([box(x, x + 0.25, PL + ST, EAVE, ...zz(0, D)), cheek]);
      // the ground floor under it closed, a barred window
      p.push([box(a, b, 0, PL + ST, ...zz(0, D)), wall]);
      win(m, PL + 0.95, Math.min(1.4, w - 0.8), 1.3, true);
      for (let fl = 1; fl < TIERS; fl++) {
        const y = PL + fl * ST;
        p.push([box(a + 0.25, b - 0.25, y - 0.15, y + 0.05, ...zz(0, D)), '#efe9da']);
        p.push([box(a + 0.25, b - 0.25, y + 0.05, y + 0.3, ...zz(D - 0.08, D)), wall]);
        p.push([box(a + 0.25, b - 0.25, y + 0.95, y + 1.0, ...zz(D - 0.05, D - 0.01)), RAIL]);
        for (let x = a + 0.4; x < b - 0.3; x += 0.5) p.push([box(x - 0.02, x + 0.02, y + 0.3, y + 0.95, ...zz(D - 0.05, D - 0.01)), RAIL]);
        p.push([box(a + 0.25, b - 0.25, y + 0.62, y + 0.65, ...zz(D - 0.05, D - 0.01)), RAIL]);
        if (back !== wall && (fl === TIERS - 1 || acc < 0.12)) p.push([box(a + 0.3, b - 0.3, y + 0.05, y + ST - 0.2, ...zz(0.02, 0.05)), back]);
        // the door and window in the back wall
        p.push([box(a + 0.45, a + 1.25, y + 0.05, y + 2.2, ...zz(0.02, 0.06)), '#5c4632']);
        p.push([box(a + 1.5, b - 0.45, y + 0.9, y + 2.1, ...zz(0.02, 0.06)), DARKWIN]);
      }
      p.push([box(a + 0.25, b - 0.25, EAVE - 0.3, EAVE, ...zz(0, D)), wall]);
    } else if (g.t === 'b') {
      // a projecting balcony (R25): white wall face behind, light-blue back walls, slabs standing out 1.2 m with a solid
      // white front and a pale rail above it; the ground floor bay closed by steel bars
      p.push([box(a, b, 0, PL + ST, ...zz(0, D)), WHITE]);
      for (let x = a + 0.2; x < b - 0.1; x += 0.16) p.push([box(x - 0.02, x + 0.02, PL, PL + 2.6, ...zz(D + 0.6, D + 0.64)), '#3a3c3e']);
      p.push([box(a, b, PL + 2.6, PL + 2.7, ...zz(D, D + 0.64)), '#3a3c3e']);
      for (let fl = 1; fl < TIERS; fl++) {
        const y = PL + fl * ST;
        p.push([box(a, b, y, y + ST, ...zz(0, D)), LBLUE]);
        p.push([box(a + 0.2, b - 0.2, y - 0.18, y + 0.02, ...zz(D, D + 1.2)), '#eeeeea']);
        p.push([box(a + 0.2, b - 0.2, y + 0.02, y + 0.55, ...zz(D + 1.1, D + 1.2)), WHITE]);
        p.push([box(a + 0.2, b - 0.2, y + 1.0, y + 1.04, ...zz(D + 1.13, D + 1.17)), RAIL]);
        for (let x = a + 0.3; x < b - 0.2; x += 0.35) p.push([box(x - 0.015, x + 0.015, y + 0.55, y + 1.0, ...zz(D + 1.13, D + 1.17)), RAIL]);
        p.push([box(a + 0.6, a + 1.4, y + 0.05, y + 2.2, ...zz(D + 0.01, D + 0.05)), '#5c4632'], [box(a + 1.8, b - 0.6, y + 0.9, y + 2.1, ...zz(D + 0.01, D + 0.05)), DARKWIN]);
      }
      p.push([box(a, b, EAVE - 0.4, EAVE, ...zz(0, D)), WHITE]);
    } else if (g.t === 'R') {
      p.push([box(a, b, 0, EAVE, ...zz(0, D + 0.1)), BRICK]);
      for (let y = 0.2; y < EAVE; y += 0.3) p.push([box(a - 0.005, b + 0.005, y, y + 0.02, ...zz(D + 0.09, D + 0.11)), '#8a4634']);
    }
  }
}
/** a model-frame point of the spec being built, to world (for the solids) */
function world(k: Kit, x: number, z: number): [number, number] { return k.world(x, z); }

// ---------- the strip along the west ends ----------
function stripSpec(i: number): Spec | null {
  const S = STRIP[i], q = outlineAt(...S.at);
  if (q.length < 4) return null;
  let bx0 = Infinity, bx1 = -Infinity, bz0 = Infinity, bz1 = -Infinity;
  for (const [x, z] of q) { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); bz0 = Math.min(bz0, z); bz1 = Math.max(bz1, z); }
  const O: P2 = [(bx0 + bx1) / 2, (bz0 + bz1) / 2];
  return {
    name: `Bani Hostel ${S.court ? 'court block' : 'west strip'} ${i + 1}`, axis: [1, 0], origin: O, storey: 3.0, style: PLAIN, roofColor: '#b9573a', fascia: '#efe7d6', pitch: 0.45,
    replaces: [S.at],
    blocks: [],
    keep: [[bx0 - O[0] - 1, bx1 - O[0] + 3, bz0 - O[1] - 1, bz1 - O[1] + 1]],
    extras: (k) => {
      const p: Part[] = [], X = (x: number) => x - O[0], Zl = (z: number) => z - O[1];
      // the main body: the outline's bounding box less a gallery's depth on the east when it is a court block
      const gal = S.court ? 2.2 : 0, e1 = PL + 2 * 3.0;
      p.push([box(X(bx0), X(bx1) - gal, 0, e1, Zl(bz0), Zl(bz1)), CREAM]);
      if (S.court) {
        // the upper gallery behind its pale rail on a salmon band, the tall round yellow columns, the stair at the north
        p.push([box(X(bx1) - gal, X(bx1), PL + 2.9, PL + 3.2, Zl(bz0), Zl(bz1)), '#efe9da']);
        p.push([box(X(bx1) - 0.12, X(bx1), PL + 3.2, PL + 3.75, Zl(bz0), Zl(bz1)), SALMON]);
        for (let z = bz0 + 0.3; z < bz1; z += 0.5) p.push([box(X(bx1) - 0.08, X(bx1) - 0.04, PL + 3.75, PL + 4.2, Zl(z) - 0.02, Zl(z) + 0.02), RAIL]);
        p.push([box(X(bx1) - 0.08, X(bx1) - 0.04, PL + 4.2, PL + 4.25, Zl(bz0), Zl(bz1)), RAIL]);
        p.push([box(X(bx1) - gal - 0.05, X(bx1) - gal, PL + 3.2, e1 - 0.2, Zl(bz0) + 0.3, Zl(bz1) - 0.3), SALMON]);
        const n = Math.max(2, Math.round((bz1 - bz0) / 4.2));
        for (let j = 0; j <= n; j++) { const z = bz0 + 0.35 + ((bz1 - bz0 - 0.7) * j) / n; p.push([new THREE.CylinderGeometry(0.2, 0.22, e1, 12).translate(X(bx1) - 0.3, e1 / 2, Zl(z)), YELLOW]); SOLIDS.add(bx1 - 0.3, z, 0.25); }
        for (let j = 0; j < n; j++) { const z = bz0 + 0.35 + ((bz1 - bz0 - 0.7) * (j + 0.5)) / n; p.push([box(X(bx1) - gal + 0.02, X(bx1) - gal + 0.06, PL, PL + 2.2, Zl(z) - 0.5, Zl(z) + 0.5), '#5c4632'], [box(X(bx1) - gal + 0.02, X(bx1) - gal + 0.06, PL + 3.6, PL + 5.0, Zl(z) - 0.9, Zl(z) + 0.9), DARKWIN]); }
      } else {
        for (let z = bz0 + 1.6; z < bz1 - 1; z += 3.2) for (const y of [PL + 1.0, PL + 4.0]) p.push([box(X(bx1), X(bx1) + 0.05, y, y + 1.2, Zl(z) - 0.5, Zl(z) + 0.5), DARKWIN]);
      }
      p.push([box(X(bx0) - 0.04, X(bx1) + 0.04, 0, PL + 0.4, Zl(bz0) - 0.04, Zl(bz1) + 0.04), '#c9b98e']);
      k.roof.c = new THREE.Color('#b9573a');
      hipRoof(k, (x, z) => [x - O[0], z - O[1]], bx0 - 0.6, bx1 + 0.6, bz0 - 0.6, bz1 + 0.6, e1, 0.45, 'z', [{ gw: 0, tri: false }, { gw: 0, tri: false }], p, '#5a3a2a');
      k.plain.push(...p);
      mergeMeshes(k);
    },
  };
}

// ---------- the grounds ----------
const grounds: Spec = {
  name: 'Bani Hostel grounds', axis: [1, 0], origin: [800, -1300], storey: 3, style: PLAIN, roofColor: '#c4683e', fascia: '#efe7d6', pitch: 0.4,
  blocks: [],
  onGround: true,
  keep: [[YARD8[0] - 800, YARD8[1] - 800, YARD8[2] + 1300, YARD8[3] + 1300], ...COURTS.map(([x0, x1, z0, z1]) => [x0 - 800, x1 - 800, z0 + 1300, z1 + 1300] as [number, number, number, number]),
    [BUSH[0] - 800, BUSH[1] - 800, BUSH[2] + 1300, BUSH[3] + 1300]],
  extras: (k) => {
    const b = new Bag([800, -1300]);
    // the courts: grey cobble pavers, two red paver bands across, kerbed beds of white stone with palms along the faces
    for (const [x0, x1, z0, z1] of COURTS) {
      const zm = (z0 + z1) / 2;
      k.meshes.push(new THREE.Mesh(drapeAt(b.O, x0, x1, z0, z1, 0.4, 0.05, (x, z) => {
        const band = Math.abs(z - zm - (x - x0) * 0.08) < 0.7 || Math.abs(x - (x0 + 6)) < 0.6;
        const t = hash(Math.floor(x / 0.22), Math.floor(z / 0.11)) * 0.06, n = vnoise(x * 0.2, z * 0.2) * 0.05;
        return band ? [0.6 - t, 0.33 - t, 0.3 - t] : [0.62 - t - n, 0.6 - t - n, 0.57 - t - n];
      }), groundCover()));
      for (let x = x0 + 4; x < x1 - 3; x += 7.5) for (const [zb, s] of [[z0 + 1.2, 1], [z1 - 1.2, -1]] as [number, number][]) {
        const zc = zb + s * 0.2;
        b.c.push([new THREE.CylinderGeometry(1.0, 1.0, 0.2, 16).translate(x - b.O[0], 0.1, zc - b.O[1]), '#d99b8a'], [new THREE.CylinderGeometry(0.85, 0.85, 0.22, 16).translate(x - b.O[0], 0.11, zc - b.O[1]), '#e9e6e0']);
        if (hash(x, zb) < 0.6) fanPalm(b, x, zc, 4.5 + hash(zb, x) * 2, x + zb); else for (let j = 0; j < 3; j++) b.leaf.push([new THREE.IcosahedronGeometry(0.45, 1).scale(1.2, 0.8, 1.2).translate(x - b.O[0] + (j - 1) * 0.45, 0.45, zc - b.O[1]), '#3f6a2a']);
        SOLIDS.add(x, zc, 0.9);
      }
      // the conifers before the court block at the west end (R23)
      for (const z of [z0 + 4, z1 - 4]) { const x = x0 + 2.5; b.c.push([new THREE.CylinderGeometry(0.12, 0.18, 2, 6).translate(x - b.O[0], 1, z - b.O[1]), '#5a4a3b']); for (let j = 0; j < 4; j++) b.leaf.push([new THREE.ConeGeometry(1.6 - j * 0.32, 3.2, 8).translate(x - b.O[0], 2.6 + j * 2.0, z - b.O[1]), '#2f5a26']); SOLIDS.add(x, z, 0.3); }
    }
    // the red-earth yard east of the bars (target 8), grass in patches
    k.meshes.push(new THREE.Mesh(drapeAt(b.O, YARD8[0], YARD8[1], YARD8[2], YARD8[3], 1.0, 0.03, (x, z) => {
      if (roadGap(x, z) < 0.4 || inAnyOutline(x, z, 0.5)) return null;
      const n = vnoise(x * 0.08, z * 0.08), m = vnoise(x * 0.5, z * 0.5) * 0.05;
      return n > 0.62 ? [0.4 + m, 0.47 + m, 0.24] : [0.63 + m, 0.4 + m, 0.27];
    }), groundCover()));
    // the dense bush behind the hostel toward Atomic: layered masses, a tree now and then, the tracks kept open
    k.meshes.push(new THREE.Mesh(drapeAt(b.O, BUSH[0], BUSH[1], BUSH[2], BUSH[3], 1.5, 0.03, (x, z) => {
      if (roadGap(x, z) < 0.5) return null;
      const n = vnoise(x * 0.05, z * 0.05), m = vnoise(x * 0.4, z * 0.4) * 0.05;
      return n > 0.7 ? [0.6 + m, 0.42 + m, 0.27] : [0.3 + m, 0.4 + m, 0.18];
    }), groundCover()));
    for (let i = 0; i < 5200; i++) {
      const x = BUSH[0] + hash(i, 0.71) * (BUSH[1] - BUSH[0]), z = BUSH[2] + hash(0.33, i) * (BUSH[3] - BUSH[2]);
      if (roadGap(x, z) < 2 || inAnyOutline(x, z, 1) || vnoise(x * 0.05, z * 0.05) > 0.7) continue;
      const r = hash(i, 5.7);
      if (r < 0.03) broadleaf(k, b.leaf, x, z, { h: 6 + hash(i, 2) * 4, spread: 6 + hash(i, 3) * 3, seed: i, origin: b.O, round: true });
      else if (r < 0.75) { const s = 0.8 + hash(i, 4) * 1.3, up = 0.8 + hash(i, 6) * 0.6; b.leaf.push([new THREE.IcosahedronGeometry(s, 1).scale(1.3, up, 1.2).translate(x - b.O[0], s * up * 0.7, z - b.O[1]), ['#3f6a2a', '#4d7a31', '#36602a', '#557331', '#2f5526'][i % 5]]); }
      else tuft(b, x, z, 0.8 + hash(i, 8) * 0.8, ['#7d8a44', '#6b7a3a', '#8d9450'][i % 3], i + 400);
    }
    b.finish(k, 0.3);
  },
};

export const BANI_TARGETS = { bars: BARS.length, strip: STRIP.length };
export const baniSite = createSite('bani-hostel', [...BARS.map((_, i) => barSpec(i)), ...STRIP.map((_, i) => stripSpec(i)), grounds].filter((s): s is Spec => !!s));
void merge;
