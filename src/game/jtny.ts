// James Topp Nelson Yankah Hall (the owner's 45-page brief: the satellite M1 with targets 1-12, the game map M2, the
// photographs R01-R23 and the videos V1-V3; docs/jtny/). The two maps register without rotation (north up; road 10 on
// the west). The game drew the hall as generic boxes with a block filling the basketball court. Now:
// - the four long wings 01-04 on their mapped I-shaped outlines, ground plus three upper levels (R07, R11, R19): the
//   long faces deep open galleries behind solid white parapets and piers, brown louvres and doors at the back of the
//   galleries; on the roadside the ground floor behind dark brown vertical bars (R07); the court face of wing 02 an
//   enclosed face of dark window groups (V1-13); the end towers (the outlines' wide ends) standing a little higher under
//   their own hipped caps, broad brown louvre windows on their long sides, a stack of small windows and white
//   perforated vent panels on their ends (R22); the stair bays where the outlines step out into the courts, their
//   perforated screens between near-blank piers (R19 family);
// - the links between wings 01/03 and 02/04 at the middle connection (05), the arched portico with its tall white piers
//   and the blue JAMES TOPP NELSON YANKAH HALL sign in front of the west link (R11; its place along the frontage is
//   provisional); the strip between the two courts kept open and paved;
// - the bottom blocks 08/09 as R19 shows them from the court: galleries, the two projecting piers with hipped tile
//   caps, the white perforated stair screen between them, the small tiled gable canopy over the inner door, the black
//   tank in the roof gap;
// - the basketball court (06): blue surface with white lines, a blue upstand, two blue hoop frames, chain-link fence
//   on posts with angled tops; the lawn court (07) with palms and small broadleaf trees and paths;
// - the frontage on road 10: the herringbone tan walk, the palm verge with white-painted trunk bases, the purple
//   groundcover bed, the low white wall with square white posts, warm brown geometric metal panels and the coiled wire.
// Heights are counted from the photographs (four levels); dimensions follow the mapped outlines, not a survey.
import * as THREE from 'three';
import { NODE_XZ, ROADS } from './campusmap';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { box, type Part } from './modelkit';
import { Bag, hash, tuft, vnoise, fanPalm } from './enkit';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { hipRoof } from './waccbip';
import { mergeMeshes } from './medkit';
import { textPanel, place } from './fskit';
import { SOLIDS } from './solids';
import { wallSolids } from './enkit';

type R4 = [number, number, number, number];
type P2 = [number, number];
const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#f2f1ec') };
const ST = 3.1, PL = 0.35, LV = 4, EAVE = PL + LV * ST;
const WHITE = '#f2f1ec', SHADE = '#d9d6cc', LOUVRE = '#4a3426', LOUVRE2 = '#5c4331', DOOR = '#3d2c22', TAN = '#c9a46a', ROOF = '#c4683c', FASCIA = '#3a2a22';
const G = 2.0; // the galleries' depth

// ---------- the plan (the mapped outlines, osm/ml ids in the docs) ----------
export interface JWing { id: string; main: R4; tower: R4; stair: R4; faces: { w: Kind; e: Kind }; roadside?: boolean }
type Kind = 'gallery' | 'roadGallery' | 'windows';
export const JWINGS: JWing[] = [
  { id: '01', main: [528.3, 544.2, -1629.5, -1594.7], tower: [525.0, 546.4, -1635.6, -1629.5], stair: [544.2, 547.1, -1603.6, -1598.2], faces: { w: 'roadGallery', e: 'gallery' } },
  { id: '02', main: [575.0, 591.3, -1630.2, -1593.7], tower: [571.4, 594.1, -1635.4, -1630.2], stair: [573.2, 575.0, -1604.3, -1597.8], faces: { w: 'windows', e: 'gallery' } },
  { id: '03', main: [527.4, 542.7, -1589.1, -1554.0], tower: [524.8, 546.8, -1554.0, -1548.2], stair: [542.7, 546.1, -1585.4, -1579.0], faces: { w: 'roadGallery', e: 'gallery' } },
  { id: '04', main: [575.4, 591.1, -1588.5, -1553.2], tower: [573.1, 593.7, -1553.2, -1548.2], stair: [572.9, 575.4, -1585.2, -1579.0], faces: { w: 'gallery', e: 'gallery' } },
];
/** the links at the middle connection (05) between 01 and 03, and 02 and 04 */
export const LINKS: R4[] = [[528.3, 542.7, -1594.7, -1589.1], [575.4, 591.1, -1593.7, -1588.5]];
/** the bottom blocks 09 (west) and 08 (east), and the stair bay between them */
export const BOTTOM: { w: R4; e: R4; gap: [number, number] } = { w: [534.5, 552.4, -1537.6, -1522.3], e: [555.3, 579.0, -1540.8, -1522.9], gap: [552.4, 555.3] };
/** the basketball court (06) inside its fence, and the lawn court (07) */
export const COURT: R4 = [549.5, 570.5, -1586.5, -1551.5];
export const LAWN: R4 = [547.2, 571.3, -1629.8, -1598.0];
/** the portico before the west link (R11) */
export const PORTICO = { x: 528.3, z: -1591.9, half: 2.4, depth: 2.6, h: 6.9 };

const segsNear = (() => {
  const s: [number, number, number, number, number][] = [];
  for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++) {
    const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
    if (Math.max(ax, bx) < 470 || Math.min(ax, bx) > 640 || Math.max(az, bz) < -1730 || Math.min(az, bz) > -1500) continue;
    s.push([ax, az, bx, bz, [9, 7.4, 6.2, 4.6, 2.6][r.cls] / 2]);
  }
  return s;
})();
const roadGap = (x: number, z: number) => {
  let best = 99;
  for (const [ax, az, bx, bz, h] of segsNear) { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))); best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z) - h); }
  return best;
};
/** road 10's centre line x at z (the mapped polyline) */
const roadX = (z: number) => { const pts: P2[] = [[502, -1553], [502, -1593], [504, -1651], [506, -1698]]; for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1]; if ((z - az) * (z - bz) <= 0) return ax + ((bx - ax) * (z - az)) / (bz - az); } return z > -1553 ? 502 : 506; };

// ---------- builders (world coordinates, made local by O) ----------
class W {
  p: Part[] = [];
  constructor(public O: P2) {}
  B(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c: string) { this.p.push([box(Math.min(x0, x1) - this.O[0], Math.max(x0, x1) - this.O[0], y0, y1, Math.min(z0, z1) - this.O[1], Math.max(z0, z1) - this.O[1]), c]); }
}
/** a frame along a face: u along it, d out from the core line (+ outward), to world x, z */
type Frame = (u: number, d: number) => P2;
const faceX = (x: number, s: number): Frame => (u, d) => [x + s * d, u];
const faceZ = (z: number, s: number): Frame => (u, d) => [u, z + s * d];
/** a box in a face's frame */
const FB = (w: W, F: Frame, u0: number, u1: number, d0: number, d1: number, y0: number, y1: number, c: string) => { const [ax, az] = F(u0, d0), [bx, bz] = F(u1, d1); w.B(ax, bx, y0, y1, az, bz, c); };

/** a brown louvre window on a face (frame, blades) */
function louvreWin(w: W, F: Frame, u: number, d: number, y: number, ww: number, hh: number) {
  FB(w, F, u - ww / 2 - 0.08, u + ww / 2 + 0.08, d, d + 0.04, y - 0.08, y + hh + 0.08, '#efeee8');
  FB(w, F, u - ww / 2, u + ww / 2, d + 0.04, d + 0.06, y, y + hh, LOUVRE);
  for (let yy = y + 0.06; yy < y + hh - 0.02; yy += 0.12) FB(w, F, u - ww / 2, u + ww / 2, d + 0.06, d + 0.08, yy, yy + 0.04, LOUVRE2);
  const n = Math.max(1, Math.round(ww / 0.9));
  for (let i = 1; i < n; i++) { const x = u - ww / 2 + (ww * i) / n; FB(w, F, x - 0.03, x + 0.03, d + 0.06, d + 0.09, y, y + hh, '#2d2119'); }
}
/** a white perforated vent panel (the breeze-block screens): a frame and a grid of dark holes */
function vent(w: W, F: Frame, u: number, d: number, y: number, ww: number, hh: number) {
  FB(w, F, u - ww / 2, u + ww / 2, d, d + 0.06, y, y + hh, '#f4f3ef');
  for (let yy = y + 0.12; yy < y + hh - 0.1; yy += 0.24) for (let x = u - ww / 2 + 0.12; x < u + ww / 2 - 0.1; x += 0.24) FB(w, F, x, x + 0.12, d + 0.06, d + 0.07, yy, yy + 0.12, '#6a6964');
}

/** a long face of a wing: galleries (with the roadside variant), or an enclosed face of window groups */
function longFace(w: W, F: Frame, u0: number, u1: number, kind: Kind, seed: number) {
  if (kind === 'windows') {
    FB(w, F, u0, u1, -0.01, 0, 0, EAVE, WHITE);
    const n = Math.round((u1 - u0) / 3.3);
    for (let i = 0; i < n; i++) {
      const u = u0 + ((u1 - u0) * (i + 0.5)) / n;
      for (let f = 0; f < LV; f++) {
        const y = PL + f * ST;
        if (hash(i, seed) < 0.2 && f === 0) { FB(w, F, u - 0.5, u + 0.5, 0, 0.04, y, y + 2.2, DOOR); continue; }
        louvreWin(w, F, u - 0.55, 0, y + 0.95, 0.9, 1.25); louvreWin(w, F, u + 0.55, 0, y + 0.95, 0.9, 1.25);
      }
      for (let f = 1; f < LV; f++) FB(w, F, u0, u1, 0, 0.12, PL + f * ST - 0.1, PL + f * ST + 0.1, '#ecebe5');
    }
    return;
  }
  // the gallery: the back wall set G back, slabs and solid parapets at the face line, piers every bay
  const n = Math.max(2, Math.round((u1 - u0) / 3.3)), bay = (u1 - u0) / n;
  FB(w, F, u0, u1, -G - 0.01, -G, 0, EAVE, SHADE);
  for (let f = 1; f < LV; f++) {
    const y = PL + f * ST;
    FB(w, F, u0, u1, -G, 0, y - 0.18, y + 0.02, '#ecebe5');
    FB(w, F, u0, u1, -0.18, 0, y + 0.02, y + 1.05, WHITE);
    FB(w, F, u0, u1, -G, -0.18, y + 0.02, y + 0.12, TAN);
  }
  FB(w, F, u0, u1, -G, 0, EAVE - 0.5, EAVE, WHITE);
  for (let i = 0; i <= n; i++) { const u = u0 + i * bay; FB(w, F, u - 0.22, u + 0.22, -G, 0.05, 0, EAVE, WHITE); }
  for (let i = 0; i < n; i++) {
    const u = u0 + (i + 0.5) * bay;
    for (let f = 0; f < LV; f++) {
      const y = PL + f * ST;
      if (f === 0 && kind === 'roadGallery') continue;
      // at the back of each bay: a door and a louvre window
      FB(w, F, u - bay / 2 + 0.45, u - bay / 2 + 1.3, -G, -G + 0.04, y, y + 2.2, DOOR);
      louvreWin(w, F, u + 0.55, -G, y + 0.9, 1.1, 1.25);
    }
    if (kind === 'roadGallery') {
      // the roadside ground floor behind dark brown vertical bars between the piers (R07)
      FB(w, F, u - bay / 2 + 0.22, u + bay / 2 - 0.22, -1.2, -1.18, PL, PL + 2.7, '#2a211c');
      for (let x = u - bay / 2 + 0.3; x < u + bay / 2 - 0.25; x += 0.13) FB(w, F, x - 0.025, x + 0.025, -0.25, -0.2, PL, PL + 2.6, '#5a3c28');
      FB(w, F, u - bay / 2 + 0.22, u + bay / 2 - 0.22, -0.3, 0, PL + 2.6, PL + 2.75, WHITE);
    }
  }
}

/** a hipped roof over a rectangle (world), its fascia and soffit */
function roofOver(k: Kit, w: W, r: R4, eave: number, ov: number, pitch: number) {
  k.roof.c = new THREE.Color(ROOF);
  hipRoof(k, (x, z) => [x - w.O[0], z - w.O[1]], r[0] - ov, r[1] + ov, r[2] - ov, r[3] + ov, eave, pitch, r[1] - r[0] > r[3] - r[2] ? 'x' : 'z', [{ gw: 0, tri: false }, { gw: 0, tri: false }], w.p, FASCIA);
  w.B(r[0] - ov, r[1] + ov, eave - 0.06, eave, r[2] - ov, r[3] + ov, '#ddd8cc');
}

/** a stair bay standing out of a long face (R19 family): two near-blank piers with small windows and the white
 *  perforated screen between them, a hipped cap; the inner door under a small tiled gable canopy */
function stairBay(k: Kit, w: W, F: Frame, u0: number, u1: number, d0: number, d1: number, roofR: R4) {
  const um = (u0 + u1) / 2, pw = Math.min(1.6, (u1 - u0) * 0.3);
  FB(w, F, u0, u1, d0, d1 - 0.3, 0, EAVE + 0.8, WHITE);
  for (const [a, b] of [[u0, u0 + pw], [u1 - pw, u1]]) {
    FB(w, F, a, b, d1 - 0.3, d1, 0, EAVE + 0.8, WHITE);
    for (let f = 0; f < LV; f++) { const y = PL + f * ST; FB(w, F, (a + b) / 2 - 0.3, (a + b) / 2 + 0.3, d1, d1 + 0.04, y + 1.2, y + 1.8, LOUVRE); }
  }
  for (let f = 1; f < LV; f++) vent(w, F, um, d1 - 0.3, PL + f * ST + 0.4, u1 - u0 - 2 * pw - 0.3, 2.2);
  FB(w, F, um - 0.8, um + 0.8, d1 - 0.3, d1 - 0.26, PL, PL + 2.3, DOOR);
  // the small tiled gable canopy on light side walls
  const [cx0, cz0] = F(um - 1.2, d1), [cx1, cz1] = F(um + 1.2, d1 + 1.6);
  for (const u of [um - 1.15, um + 1.15]) FB(w, F, u - 0.1, u + 0.1, d1, d1 + 1.5, 0, 2.6, '#efeee8');
  k.roof.c = new THREE.Color('#b65a36');
  const along = Math.abs(cx1 - cx0) > Math.abs(cz1 - cz0) ? 'z' : 'x';
  hipRoof(k, (x, z) => [x - w.O[0], z - w.O[1]], Math.min(cx0, cx1) - 0.2, Math.max(cx0, cx1) + 0.2, Math.min(cz0, cz1) - 0.2, Math.max(cz0, cz1) + 0.2, 2.65, 0.7, along === 'x' ? 'z' : 'x', [{ gw: 99, tri: false }, { gw: 99, tri: false }], w.p, FASCIA);
  roofOver(k, w, roofR, EAVE + 0.8, 0.5, 0.5);
}

// ---------- a wing ----------
function wingSpec(J: JWing): Spec {
  const [x0, x1, z0, z1] = J.main, O: P2 = [(x0 + x1) / 2, (z0 + z1) / 2];
  const towerN = J.tower[3] <= z0 + 0.5; // the tower at the north end (01, 02) or the south (03, 04)
  return {
    name: `James Topp Nelson Yankah Hall wing ${J.id}`, axis: [1, 0], origin: O, storey: ST, style: PLAIN, roofColor: ROOF, fascia: FASCIA, pitch: 0.42,
    replaces: [O, [(J.tower[0] + J.tower[1]) / 2, (J.tower[2] + J.tower[3]) / 2]],
    blocks: [],
    keep: [[J.tower[0] - O[0] - 1, J.tower[1] - O[0] + 1, Math.min(J.tower[2], z0) - O[1] - 1, Math.max(J.tower[3], z1) - O[1] + 1]],
    extras: (k) => {
      const w = new W(O);
      // the core between the galleries
      w.B(x0 + G, x1 - G, 0, EAVE, z0, z1, WHITE);
      const zs0 = towerN ? z0 : z0, zs1 = towerN ? z1 : z1;
      longFace(w, faceX(x0, -1), zs0, zs1, J.faces.w, 3 + +J.id);
      longFace(w, faceX(x1, 1), zs0, zs1, J.faces.e, 7 + +J.id);
      // the far end (not the tower): a plain end with a stack of small windows
      const endZ = towerN ? z1 : z0, s = towerN ? 1 : -1, FE = faceZ(endZ, s);
      FB(w, FE, x0, x1, -0.01, 0.01, 0, EAVE, WHITE);
      for (let f = 0; f < LV; f++) louvreWin(w, FE, (x0 + x1) / 2, 0.01, PL + f * ST + 1.0, 0.7, 1.1);
      // the tower: full width, a little higher, broad louvres on its long sides, small windows and vents on its end
      const [tx0, tx1, tz0, tz1] = J.tower, TE = EAVE + 0.7;
      w.B(tx0, tx1, 0, TE, tz0, tz1, WHITE);
      for (const [xx, ss] of [[tx0, -1], [tx1, 1]] as [number, number][]) for (let f = 0; f < LV; f++) louvreWin(w, faceX(xx, ss), (tz0 + tz1) / 2, 0, PL + f * ST + 0.8, Math.min(3.0, tz1 - tz0 - 1.2), 1.5);
      const tEnd = towerN ? tz0 : tz1, ts = towerN ? -1 : 1, FT = faceZ(tEnd, ts);
      for (let f = 0; f < LV; f++) {
        const y = PL + f * ST;
        for (const u of [tx0 + 2.4, tx1 - 2.4]) louvreWin(w, FT, u, 0, y + 0.9, 0.8, 1.4);
        vent(w, FT, (tx0 + tx1) / 2 - 3.5, 0, y + 1.0, 2.4, 1.4); vent(w, FT, (tx0 + tx1) / 2 + 3.5, 0, y + 1.0, 2.4, 1.4);
        louvreWin(w, FT, (tx0 + tx1) / 2, 0, y + 0.9, 1.6, 1.5);
      }
      // the stair bay into the court
      const st = J.stair, inE = st[0] >= x1 - 0.5;
      stairBay(k, w, faceX(inE ? x1 : x0, inE ? 1 : -1), st[2], st[3], 0, inE ? st[1] - x1 : x0 - st[0], st);
      roofOver(k, w, J.main, EAVE, 0.6, 0.42);
      roofOver(k, w, J.tower, TE, 0.7, 0.45);
      for (const [a, b] of [[[tx0, tz0], [tx1, tz0]], [[tx0, tz1], [tx1, tz1]], [[tx0, tz0], [tx0, tz1]], [[tx1, tz0], [tx1, tz1]]] as [P2, P2][]) wallSolids(a[0], a[1], b[0], b[1], 0.2);
      k.plain.push(...w.p);
      mergeMeshes(k);
    },
  };
}

// ---------- the links and the portico ----------
const linkSpec: Spec = {
  name: 'James Topp Nelson Yankah Hall links and portico', axis: [1, 0], origin: [560, -1591.5], storey: ST, style: PLAIN, roofColor: ROOF, fascia: FASCIA, pitch: 0.42,
  blocks: [],
  keep: [[PORTICO.x - PORTICO.depth - 1 - 560, -15, -5, 5]],
  extras: (k) => {
    const w = new W([560, -1591.5]);
    for (const [i, L] of LINKS.entries()) {
      const [x0, x1, z0, z1] = L;
      // a link block of the wings' height, its flat roof below the wings' eaves (the satellite's pale band), louvre
      // windows on its faces; a passage through its ground floor to the strip between the courts
      w.B(x0, x1, PL + ST - 0.2, EAVE - 0.4, z0, z1, WHITE);
      w.B(x0, x1, EAVE - 0.4, EAVE - 0.2, z0 - 0.3, z1 + 0.3, '#d5d2c9');
      for (const [xx, s] of [[x0, -1], [x1, 1]] as [number, number][]) for (let f = 1; f < LV; f++) for (const dz of [-1.5, 1.5]) louvreWin(w, faceX(xx, s), (z0 + z1) / 2 + dz, 0, PL + f * ST + 0.8, 1.6, 1.4);
      w.B(x0, x1, 0, 0.05, z0, z1, '#cdbf9f');
      if (i === 0) {
        // the sign band over the passage on the roadside, the blue sign (R11)
        w.B(x0 - 0.2, x0 + 0.2, PL + ST - 0.6, PL + ST, z0, z1, WHITE);
      }
    }
    // the portico: two tall square piers standing forward, the arched lintel between them, a cap with a small hip
    const P = PORTICO, px = P.x - P.depth, zA = P.z - P.half, zB = P.z + P.half;
    for (const z of [zA, zB]) { w.B(px - 0.35, px + 0.35, 0, P.h, z - 0.35, z + 0.35, WHITE); SOLIDS.add(px, z, 0.45); w.B(px - 0.35, P.x, P.h - 0.6, P.h, z - 0.3, z + 0.3, WHITE); }
    const sh = new THREE.Shape([new THREE.Vector2(zA - 0.35 - w.O[1], 0), new THREE.Vector2(zB + 0.35 - w.O[1], 0), new THREE.Vector2(zB + 0.35 - w.O[1], 1.7), new THREE.Vector2(zA - 0.35 - w.O[1], 1.7)]);
    sh.holes.push(new THREE.Path().absarc(P.z - w.O[1], 0, P.half - 0.35, 0, Math.PI, false));
    const arch = new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: false, curveSegments: 16 }).rotateY(Math.PI / 2).translate(px - 0.35 - w.O[0], P.h - 2.0, 0);
    w.p.push([arch, WHITE]);
    w.B(px - 0.5, P.x, P.h - 0.3, P.h, zA - 0.5, zB + 0.5, '#ecebe5');
    k.roof.c = new THREE.Color(ROOF);
    hipRoof(k, (x, z) => [x - w.O[0], z - w.O[1]], px - 0.7, P.x, zA - 0.7, zB + 0.7, P.h, 0.45, 'z', [{ gw: 0, tri: false }, { gw: 0, tri: false }], w.p, FASCIA);
    // the sign: hall letters over the blue panel, on the band behind the portico
    k.meshes.push(place(textPanel(5.0, 0.9, [{ t: 'JAMES TOPP NELSON YANKAH HALL', s: 0.36, c: '#1f2f5a', b: true }], '#f4f3ef'), P.x - 0.24 - w.O[0], PL + ST - 0.2 + 0.25, P.z - w.O[1], -Math.PI / 2));
    k.meshes.push(place(textPanel(4.2, 0.55, [{ t: 'TF HOSTEL  ·  030 731 0951', s: 0.26, c: '#ffffff', b: true }], '#1f4f9a'), P.x - 0.25 - w.O[0], PL + ST - 0.75, P.z - w.O[1], -Math.PI / 2));
    // the paved strip between the courts (05), open
    w.B(546, 573, 0, 0.05, -1597.5, -1587.5, '#cdbf9f');
    k.plain.push(...w.p);
    mergeMeshes(k);
  },
};

// ---------- the bottom blocks 08 and 09 (R19) ----------
const bottomSpec: Spec = {
  name: 'James Topp Nelson Yankah Hall bottom blocks', axis: [1, 0], origin: [556, -1531], storey: ST, style: PLAIN, roofColor: ROOF, fascia: FASCIA, pitch: 0.42,
  replaces: [[543, -1530], [567, -1531]],
  blocks: [],
  keep: [[-24, 25, -12, 10]],
  extras: (k) => {
    const w = new W([556, -1531]), { w: A, e: Bk, gap } = BOTTOM;
    for (const [i, r] of [A, Bk].entries()) {
      const [x0, x1, z0, z1] = r;
      w.B(x0, x1, 0, EAVE, z0 + G, z1, WHITE);
      // the court (north) face: galleries, the projecting pier with its hipped cap at the inner end by the stair bay
      const pierA = i === 0 ? x1 - 3.4 : x0, pierB = i === 0 ? x1 : x0 + 3.4;
      longFace(w, faceZ(z0, -1), i === 0 ? x0 : pierB, i === 0 ? pierA : x1, 'gallery', 21 + i);
      w.B(pierA, pierB, 0, EAVE + 0.6, z0 - 0.6, z0 + G, WHITE);
      for (let f = 0; f < LV; f++) { const y = PL + f * ST, F = faceZ(z0 - 0.6, -1), u = (pierA + pierB) / 2; louvreWin(w, F, u - 0.9, 0, y + 1.0, 0.45, 0.5); louvreWin(w, F, u, 0, y + 0.9, 0.7, 0.9); louvreWin(w, F, u + 0.9, 0, y + 1.0, 0.45, 0.5); }
      roofOver(k, w, [pierA, pierB, z0 - 0.6, z0 + 3], EAVE + 0.6, 0.6, 0.5);
      // the south face plain with windows, the ends
      longFace(w, faceZ(z1, 1), x0, x1, 'windows', 31 + i);
      roofOver(k, w, r, EAVE, 0.6, 0.42);
    }
    // the stair bay in the gap: the white perforated screens over the inner door, the canopy, the black tank above
    const um = (gap[0] + gap[1]) / 2, z0 = Math.max(A[2], Bk[2]);
    w.B(gap[0], gap[1], 0, EAVE - 0.6, z0 + 0.8, A[3], WHITE);
    for (let f = 1; f < LV; f++) vent(w, faceZ(z0 + 0.8, -1), um, 0, PL + f * ST + 0.4, gap[1] - gap[0] - 0.4, 2.2);
    w.B(um - 0.8, um + 0.8, PL, PL + 2.3, z0 + 0.72, z0 + 0.8, DOOR);
    for (const x of [um - 1.3, um + 1.3]) w.B(x - 0.1, x + 0.1, 0, 2.6, z0 - 1.0, z0 + 0.8, '#efeee8');
    k.roof.c = new THREE.Color('#b65a36');
    hipRoof(k, (x, z) => [x - w.O[0], z - w.O[1]], um - 1.5, um + 1.5, z0 - 1.2, z0 + 0.8, 2.65, 0.7, 'z', [{ gw: 99, tri: false }, { gw: 0, tri: false }], w.p, FASCIA);
    w.p.push([new THREE.CylinderGeometry(0.75, 0.75, 1.5, 14).translate(um - w.O[0], EAVE - 0.6 + 0.75, (z0 + A[3]) / 2 - w.O[1]), '#1c1d1f']);
    // the paved approach from the court with its raised side edge (R19)
    w.B(um - 1.6, um + 1.6, 0, 0.06, -1548, z0 - 1.0, '#c7ad86');
    w.B(um + 1.6, um + 1.85, 0, 0.45, -1548, z0 - 1.0, '#d8cfb8');
    k.plain.push(...w.p);
    mergeMeshes(k);
  },
};

// ---------- the courts, the frontage ----------
const groundsSpec: Spec = {
  name: 'James Topp Nelson Yankah Hall grounds', axis: [1, 0], origin: [550, -1590], storey: 3, style: PLAIN, roofColor: ROOF, fascia: FASCIA, pitch: 0.4,
  blocks: [],
  onGround: true,
  keep: [[COURT[0] - 550, COURT[1] - 550, COURT[2] + 1590, COURT[3] + 1590], [LAWN[0] - 550, LAWN[1] - 550, LAWN[2] + 1590, LAWN[3] + 1590], [500 - 550, 523 - 550, -1690 + 1590, -1520 + 1590]],
  extras: (k) => {
    const b = new Bag([550, -1590]), w = new W([550, -1590]);
    // ---- the basketball court: the blue playing surface on its blue upstand, white lines, the hoops, the fence ----
    const [cx0, cx1, cz0, cz1] = COURT, xm = (cx0 + cx1) / 2, zm = (cz0 + cz1) / 2;
    const fx0 = xm - 7.5 - 1.5, fx1 = xm + 7.5 + 1.5, fz0 = zm - 14 - 2, fz1 = zm + 14 + 2;
    w.B(fx0, fx1, 0, 0.12, fz0, fz1, '#2d5f93');
    w.B(xm - 7.5, xm + 7.5, 0.12, 0.13, zm - 14, zm + 14, '#3f74ad');
    const line = (x0: number, x1: number, z0: number, z1: number) => w.B(x0, x1, 0.13, 0.14, z0, z1, '#f2f2ee');
    line(xm - 7.5, xm + 7.5, zm - 14, zm - 13.94); line(xm - 7.5, xm + 7.5, zm + 13.94, zm + 14); line(xm - 7.5, xm - 7.44, zm - 14, zm + 14); line(xm + 7.44, xm + 7.5, zm - 14, zm + 14); line(xm - 7.5, xm + 7.5, zm - 0.03, zm + 0.03);
    const ring = (r: number, cz: number, a0: number, a1: number) => { for (let i = 0; i < 28; i++) { const t0 = a0 + ((a1 - a0) * i) / 28, t1 = a0 + ((a1 - a0) * (i + 1)) / 28, x = xm + Math.cos((t0 + t1) / 2) * r, z = cz + Math.sin((t0 + t1) / 2) * r, L = r * Math.abs(t1 - t0) + 0.02; w.p.push([new THREE.BoxGeometry(L, 0.01, 0.06).rotateY(-((t0 + t1) / 2 + Math.PI / 2)).translate(x - w.O[0], 0.135, z - w.O[1]), '#f2f2ee']); } };
    ring(1.8, zm, 0, Math.PI * 2);
    for (const s of [-1, 1]) {
      const ez = zm + s * 14;
      line(xm - 2.45, xm - 2.39, Math.min(ez, ez - s * 5.8), Math.max(ez, ez - s * 5.8)); line(xm + 2.39, xm + 2.45, Math.min(ez, ez - s * 5.8), Math.max(ez, ez - s * 5.8));
      line(xm - 2.45, xm + 2.45, ez - s * 5.8 - 0.03, ez - s * 5.8 + 0.03);
      ring(1.8, ez - s * 5.8, s < 0 ? 0 : Math.PI, s < 0 ? Math.PI : Math.PI * 2);
      ring(6.75, ez - s * 1.575, s < 0 ? 0.15 : Math.PI + 0.15, s < 0 ? Math.PI - 0.15 : 2 * Math.PI - 0.15);
      // the hoop: the blue frame bent out over the line, the board, the rim
      const hz = ez + s * 1.2;
      w.B(xm - 0.15, xm + 0.15, 0, 3.4, hz - 0.15, hz + 0.15, '#2a7fc0');
      w.p.push([new THREE.BoxGeometry(0.14, 0.14, 1.4).rotateX(s * 0.5).translate(xm - w.O[0], 3.6, hz - s * 0.6 - w.O[1]), '#2a7fc0']);
      w.B(xm - 0.9, xm + 0.9, 2.9, 3.95, ez - s * 0.05 - 0.03, ez - s * 0.05 + 0.03, '#f4f4f0');
      w.B(xm - 0.3, xm + 0.3, 3.05, 3.5, ez - s * 0.09 - 0.01, ez - s * 0.09 + 0.01, '#d23a2a');
      w.p.push([new THREE.TorusGeometry(0.23, 0.02, 6, 14).rotateX(Math.PI / 2).translate(xm - w.O[0], 3.05, ez - s * 0.35 - w.O[1]), '#e0552a']);
      SOLIDS.add(xm, hz, 0.3);
      w.B(xm - 1.6, xm + 1.6, 0, 0.6, hz + s * 0.5 - 0.6, hz + s * 0.5 + 0.6, '#2a7fc0');
    }
    // the fence: slender posts with angled tops, chain-link panels (see-through), an opening on the west side
    const posts: P2[] = [];
    for (let z = fz0; z <= fz1 + 0.01; z += 2.5) posts.push([fx0, z], [fx1, z]);
    for (let x = fx0 + 2.5; x < fx1 - 0.1; x += 2.5) posts.push([x, fz0], [x, fz1]);
    for (const [x, z] of posts) { w.B(x - 0.04, x + 0.04, 0, 3.0, z - 0.04, z + 0.04, '#3a3d40'); const dx = x === fx0 ? 1 : x === fx1 ? -1 : 0, dz = z === fz0 ? 1 : z === fz1 ? -1 : 0; w.p.push([new THREE.BoxGeometry(0.05, 0.6, 0.05).rotateZ(-dx * 0.5).rotateX(dz * 0.5).translate(x + dx * 0.15 - w.O[0], 3.25, z + dz * 0.15 - w.O[1]), '#3a3d40']); }
    const mesh = new THREE.MeshStandardMaterial({ color: '#8e9396', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
    const fence = (ax: number, az: number, bx: number, bz: number) => { const L = Math.hypot(bx - ax, bz - az), g = new THREE.PlaneGeometry(L, 3.0).rotateY(-Math.atan2(bz - az, bx - ax)).translate((ax + bx) / 2 - w.O[0], 1.5, (az + bz) / 2 - w.O[1]); const m = new THREE.Mesh(g, mesh); m.userData.noCollide = true; k.meshes.push(m); wallSolids(ax, az, bx, bz, 0.1); };
    fence(fx0, fz0, fx1, fz0); fence(fx0, fz1, fx1, fz1); fence(fx1, fz0, fx1, fz1);
    fence(fx0, fz0, fx0, zm - 1.2); fence(fx0, zm + 1.2, fx0, fz1);
    // the narrow worn-grass and earth verge round the fence, the paved paths beside it
    k.meshes.push(new THREE.Mesh(drapeAt(b.O, cx0 - 2.5, cx1 + 2.5, cz0 - 2, cz1 + 2, 0.5, 0.03, (x, z) => {
      if (x > fx0 - 0.05 && x < fx1 + 0.05 && z > fz0 - 0.05 && z < fz1 + 0.05) return null;
      const n = vnoise(x * 0.4, z * 0.4); return n > 0.6 ? [0.55, 0.42, 0.28] : [0.4, 0.48, 0.24];
    }), groundCover()));
    // ---- the lawn court: lawn with dry patches, palms and small broadleaf trees, the cross path ----
    const [lx0, lx1, lz0, lz1] = LAWN;
    k.meshes.push(new THREE.Mesh(drapeAt(b.O, lx0, lx1, lz0, lz1, 0.5, 0.03, (x, z) => {
      if (Math.abs(z - (lz0 + lz1) / 2) < 1.1 || Math.abs(x - (lx0 + lx1) / 2) < 1.0) { const t = hash(Math.floor(x / 0.25), Math.floor(z / 0.12)) * 0.05; return [0.76 - t, 0.66 - t, 0.5 - t]; }
      const n = vnoise(x * 0.25, z * 0.25); return n > 0.7 ? [0.55, 0.5, 0.3] : [0.38, 0.5, 0.22];
    }), groundCover()));
    for (const [x, z, h] of [[551.5, -1625, 9], [567, -1604, 10], [552, -1606, 8.5]] as [number, number, number][]) fanPalm(b, x, z, h, x + z);
    for (const [x, z, h, s] of [[566, -1624, 4.5, 5], [553, -1614.5, 4, 4.5], [565, -1613, 3.8, 4]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x * 2 + z, origin: b.O, round: true });
    for (const [x, z] of [[556, -1601], [562, -1627.5]] as P2[]) for (let j = 0; j < 3; j++) b.leaf.push([new THREE.IcosahedronGeometry(0.55, 1).scale(1.2, 0.8, 1.2).translate(x + j * 0.7 - b.O[0], 0.5, z - b.O[1]), '#3f6a2a']);
    // ---- the frontage on road 10: walk, verge with palms, purple bed, the wall with its posts, panels and wire ----
    const zA = -1686, zB = -1530, gates: P2[] = [[-1596.5, -1589.5], [-1684, -1678]];
    for (let z = zA; z < zB; z += 2.6) {
      const z1 = Math.min(zB, z + 2.6), x = roadX((z + z1) / 2) + 10.2;
      if (gates.some(([a, c]) => z1 > a && z < c)) continue;
      w.B(x - 0.12, x + 0.12, 0, 0.9, z, z1, '#f1f0eb');
      w.B(x - 0.24, x + 0.24, 0, 2.3, z - 0.24, z + 0.24, '#f1f0eb');
      wallSolids(x, z, x, z1, 0.2);
    }
    k.meshes.push(...frontPanels(roadX, zA, zB, gates, w.O));
    // the coiled wire over the wall: rings along it
    const wireG: THREE.BufferGeometry[] = [];
    for (let z = zA; z < zB; z += 0.45) { if (gates.some(([a, c]) => z > a && z < c)) continue; const x = roadX(z) + 10.2; wireG.push(new THREE.TorusGeometry(0.32, 0.012, 4, 14).rotateY(Math.PI / 2 + (hash(z, 3) - 0.5) * 0.3).translate(x - w.O[0], 2.45, z - w.O[1])); }
    const wm = new THREE.Mesh(mergeGeo(wireG), new THREE.MeshStandardMaterial({ color: '#b7bcc0', metalness: 0.6, roughness: 0.4 })); wm.userData.noCollide = true; k.meshes.push(wm);
    // the herringbone tan walk, the verge with palms (white-painted bases), the purple groundcover bed by the wall
    k.meshes.push(new THREE.Mesh(drapeAt(b.O, 505, 513, zA, zB, 0.25, 0.04, (x, z) => {
      const d = x - roadX(z);
      if (d < 4.3 || d > 10.0 || roadGap(x, z) < 0) return null;
      if (d < 6.6) { const u = Math.floor((x + z) / 0.3), v = Math.floor((x - z) / 0.3), t = ((u + v) & 1) * 0.04 + hash(u, v) * 0.04; return [0.72 - t, 0.55 - t, 0.38 - t]; }
      if (d < 8.0) return [0.38, 0.5, 0.24];
      const n = hash(Math.floor(x * 3), Math.floor(z * 3)); return n > 0.45 ? [0.42, 0.22, 0.42] : [0.36, 0.26, 0.2];
    }), groundCover()));
    for (let z = zA + 4; z < zB; z += 9) {
      if (gates.some(([a, c]) => z > a - 2 && z < c + 2)) continue;
      const x = roadX(z) + 7.3;
      fanPalm(b, x, z, 7.5 + hash(z, 1) * 2.5, z);
      w.B(x - 0.24, x + 0.24, 0, 0.9, z - 0.24, z + 0.24, '#f4f4f0');
    }
    for (let i = 0; i < 160; i++) { const z = zA + hash(i, 11) * (zB - zA), x = roadX(z) + 8.3 + hash(i, 13) * 1.5; if (gates.some(([a, c]) => z > a && z < c)) continue; b.leaf.push([new THREE.IcosahedronGeometry(0.1 + hash(i, 15) * 0.06, 0).scale(1.6, 0.5, 1.6).translate(x - b.O[0], 0.07, z - b.O[1]), i % 3 ? '#5e2f62' : '#4d2a55']); }
    // the dense woodland across the road (12's other side) is the map's wood; the open field east of the hall
    k.plain.push(...w.p);
    b.finish(k, 0.3);
  },
};
/** the brown geometric metal panels between the wall's posts (a canvas of offset rectangles, alpha-cut) */
let PANEL: THREE.MeshStandardMaterial | null = null;
function frontPanels(rx: (z: number) => number, zA: number, zB: number, gates: P2[], O: P2) {
  PANEL ??= new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, alphaTest: 0.5, roughness: 0.7, map: (() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d')!;
    g.clearRect(0, 0, 256, 128); g.strokeStyle = '#8a5530'; g.lineWidth = 7;
    g.strokeRect(4, 4, 248, 120);
    for (let x = 20; x < 256; x += 22) { g.beginPath(); g.moveTo(x, 4); g.lineTo(x, 124); g.stroke(); }
    for (const [x0, y0, x1, y1] of [[30, 40, 110, 40], [110, 40, 110, 90], [60, 90, 160, 90], [160, 30, 160, 90], [160, 30, 230, 30], [190, 70, 240, 70]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })() });
  const out: THREE.Mesh[] = [];
  for (let z = zA; z < zB; z += 2.6) {
    const z1 = Math.min(zB, z + 2.6);
    if (gates.some(([a, c]) => z1 > a && z < c)) continue;
    const x = rx((z + z1) / 2) + 10.2, g = new THREE.PlaneGeometry(z1 - z - 0.5, 1.25).rotateY(Math.PI / 2).translate(x - O[0], 1.55, (z + z1) / 2 - O[1]);
    const m = new THREE.Mesh(g, PANEL); m.userData.noCollide = true; out.push(m);
  }
  return out;
}
function mergeGeo(list: THREE.BufferGeometry[]) {
  const pos: number[] = [], nor: number[] = [];
  for (const g0 of list) { const g = g0.index ? g0.toNonIndexed() : g0; pos.push(...(g.attributes.position.array as Float32Array)); nor.push(...(g.attributes.normal.array as Float32Array)); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return g;
}

export const jtnySite = createSite('james-topp-nelson-yankah-hall', [...JWINGS.map(wingSpec), linkSpec, bottomSpec, groundsSpec]);
void tuft;
