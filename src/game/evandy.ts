// Evandy Hostel (the owner's Evandy brief, docs/evandy/; numbers in evandyplan.ts):
// - the wings on their mapped outlines, each separately: light cream walls with warm ochre pilaster strips, recessed
//   balcony modules with real slabs, solid lower walls and dark patterned railings, narrow louvred windows, open
//   gallery elevations toward the inner courts, red perforated-brick ventilation panels on the stair ends, terracotta
//   hipped roofs with small gables and arched recesses over selected balcony modules;
// - the main entrance bay between the frontage pair: paired ochre columns, three bands of gold-framed glazing with
//   outward-opening awning panes, the peaked pediment with its arch and UG EVANDY HALL, MAIN BLOCK over the recessed
//   door, shallow steps;
// - the pink-roof courtyard ring (affiliation unresolved), plain, round its open court;
// - the two-storey commercial block facing the road: central gabled arch, cream columns, the open upper gallery with
//   its light gold railing, shopfronts with grilles;
// - the frontage: the circular-pattern paving over the whole compound, oval kerbed planting islands, the fence (low
//   pale wall, square posts, dark vertical bars with pointed tops), the gatehouse, the swing gate, the notice shelter,
//   the EVANDY HOSTEL sign; the west yard's gravel and green basketball slab with its hoop; red-earth patches;
// - the environs: the unfinished open frame and its red-earth yard to the north, the sandy field and scrub to the east.
import * as THREE from 'three';
import { createSite, render, slab, window_, type Kit, type Spec, type Style } from './blocks';
import { box, canvas, merge, speckle, tri2, type Part } from './modelkit';
import { concrete } from './concrete';
import { groundHeight as gh } from './relief';
import { gates } from './gates';
import { PASSAGES, SOLIDS } from './solids';
import { wallSolids } from './enkit';
import { BUILDINGS, ROADS, NODE_XZ } from './campusmap';
import { coverOverlay, crownTiles, hash2, vnoise2, type Crown } from './scrubkit';
import { mergeMeshes, mergedSite, prism, strip, type P2, type R4 } from './medkit';
import {
  A_DECK, A_TANKS, B_SEAM, MKT, B_TANKS, EAST_RANGE, ENTRY, FIELD, FRAME, GATEHOUSE, ISLANDS, MAIN_DECK, MAIN_TANKS, PARKS, RED_YARD, RING, SCRUB, SHELTER, SHOPS, SIGN, SITE, TREES, WINGS, YARD, fit, type Wing,
} from './evandyplan';

const ST = 3.2, CREAM = '#efe6d2', CREAM_D = '#e3d6bb', OCHRE = '#d6ad55', RAIL = '#2b2622', GOLD = '#c9a85a';
const top = (floors: number) => 0.4 + floors * ST + 0.4;

// ---------- facades ----------
const wall = (g: CanvasRenderingContext2D, base = CREAM) => { render(g, base); speckle(g, 0, 0, 256, 512, 900, ['#e9dfca', '#f3ebd9', '#e5dac3']); };
/** a louvre window (the owner: every Evandy window is grey louvre blades, not glass): a pale frame, grey horizontal
 *  blades with thin shadow lines between them, a mullion where it is wide */
const louvred = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, surround = '#f6efe0') => {
  g.fillStyle = 'rgba(90,75,55,0.35)'; g.fillRect(x - 5, y - 5, w + 10, h + 10);
  g.fillStyle = surround; g.fillRect(x - (surround === '#f6efe0' ? 3 : 7), y - (surround === '#f6efe0' ? 3 : 7), w + (surround === '#f6efe0' ? 6 : 14), h + (surround === '#f6efe0' ? 6 : 14));
  g.fillStyle = '#5d6266'; g.fillRect(x, y, w, h);
  for (let t = y + 1; t < y + h - 2; t += 7) { g.fillStyle = '#9aa0a4'; g.fillRect(x + 1, t, w - 2, 4); g.fillStyle = '#c4c8ca'; g.fillRect(x + 1, t, w - 2, 1); }
  g.fillStyle = '#f6efe0';
  const n = Math.max(1, Math.round(w / 34));
  for (let i = 1; i < n; i++) g.fillRect(x + (w * i) / n - 1, y, 3, h);
};
// (the owner's eight-pair brief: the frontage pair's strips yellow (R06); the inner and upper wings' strips a taupe
// brown (R07))
const TAUPE = '#c39d8a', YREC = '#dcb75e';
const pilaster = (g: CanvasRenderingContext2D, ochre: boolean) => { g.fillStyle = ochre ? OCHRE : TAUPE; g.fillRect(0, 0, 13, 512); g.fillStyle = 'rgba(80,60,30,0.25)'; g.fillRect(13, 0, 2, 512); };
/** the balcony module: pilaster, a narrow window, the deep recess (room glazing behind) the geometry fronts */
const front = (ochre: boolean): Style => ({
  bay: 7.8, up: [[26, 60, 30, 120], [96, 50, 120, 150]], ground: [[26, 60, 30, 120], [96, 60, 130, 120]],
  draw: (g) => {
    wall(g); pilaster(g, ochre);
    // the window beside the balconies: framed in yellow on the frontage pair (R06), in tan on the inner wings (R07)
    for (const y0 of [0, 256]) louvred(g, 26, y0 + 60, 30, 120, ochre ? '#e2bd55' : '#d8bfa8');
    // upper: the recess, its back wall painted yellow on the frontage pair (R06), shaded cream elsewhere, doors and
    // windows behind
    g.fillStyle = ochre ? YREC : '#8f8574'; g.fillRect(74, 14, 168, 226); g.fillStyle = ochre ? '#b9973f' : '#6a6255'; g.fillRect(74, 14, 168, 40);
    louvred(g, 96, 60, 70, 130); louvred(g, 176, 70, 52, 110);
    // ground: under each balcony pair, two windows either side of the central dividing wall (R03: the fins run to the
    // ground)
    louvred(g, 86, 256 + 70, 62, 120); louvred(g, 172, 256 + 70, 62, 120);
    slab(g, 236, 20);
  },
});
const FRONT_O = front(true), FRONT = front(false);
/** the open corridor / gallery elevation: deep shade, doors behind, horizontal rails */
const GALLERY: Style = {
  bay: 3.4, up: [[60, 60, 60, 140]], ground: [[60, 60, 60, 140]],
  draw: (g) => {
    wall(g);
    for (const y0 of [0, 256]) {
      g.fillStyle = '#5c554a'; g.fillRect(18, y0 + 24, 220, 200); g.fillStyle = '#3e3932'; g.fillRect(18, y0 + 24, 220, 30);
      g.fillStyle = '#d9cfba'; g.fillRect(70, y0 + 70, 46, 150); louvred(g, 150, y0 + 90, 60, 70);
      g.fillStyle = '#efe6d2'; g.fillRect(18, y0 + 150, 220, 10); g.fillRect(18, y0 + 186, 220, 6); g.fillRect(18, y0 + 214, 220, 10);
      g.fillStyle = '#efe6d2'; g.fillRect(0, y0, 18, 256); g.fillRect(238, y0, 18, 256);
    }
    slab(g, 236, 20);
  },
};
/** red perforated-brick ventilation panels between pale piers (R04) */
const VENT: Style = {
  bay: 3, up: [], ground: [],
  draw: (g) => {
    wall(g);
    for (const y0 of [0, 256]) {
      g.fillStyle = '#a5523a'; g.fillRect(60, y0 + 30, 136, 190);
      for (let y = y0 + 34; y < y0 + 216; y += 12) for (let x = 64; x < 192; x += 12) { g.fillStyle = '#3d1f18'; g.fillRect(x, y, 7, 7); }
    }
    slab(g, 236, 20);
  },
};
/** the wings' plain ends and plain elevations: cream, regular windows */
const PLAIN: Style = {
  bay: 3.4, up: [[86, 70, 84, 110]], ground: [[86, 70, 84, 110]],
  draw: (g) => { wall(g); for (const y0 of [0, 256]) louvred(g, 86, y0 + 70, 84, 110); g.fillStyle = 'rgba(160,110,80,0.35)'; g.fillRect(0, 0, 8, 512); slab(g, 236, 20); },
};
const END: Style = {
  bay: 3, up: [[110, 80, 36, 100]], ground: [[110, 80, 36, 100]],
  draw: (g) => { wall(g); for (const y0 of [0, 256]) louvred(g, 110, y0 + 80, 36, 100); slab(g, 236, 20); },
};
const styleOf = (k: Wing['south'] | Wing['ends'], ochre: boolean) => (k === 'balcony' ? (ochre ? FRONT_O : FRONT) : k === 'gallery' ? GALLERY : k === 'vent' ? VENT : k === 'plain' ? PLAIN : END);

// ---------- materials ----------
let DISC: THREE.MeshStandardMaterial | null = null;
/** the signature paving: large grey-beige discs about 0.9 m across, slightly irregular, in reddish-tan joint (6 m a
 *  tile) */
const discMat = () => (DISC ??= new THREE.MeshStandardMaterial({ roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, map: canvas(256, 256, (g) => {
  // (the owner's eight-pair brief: the discs weathered grey-beige in a dull earthy joint, not bright orange and white)
  g.fillStyle = '#86705f'; g.fillRect(0, 0, 256, 256); speckle(g, 0, 0, 256, 256, 1600, ['#7d685a', '#8f7a68', '#766253']);
  let s = 7; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let j = -1; j < 8; j++) for (let i = -1; i < 7; i++) {
    const x = i * 42.7 + (j % 2) * 21.3 + (r() - 0.5) * 4, y = j * 37 + (r() - 0.5) * 4, rr = 18.5 + r() * 2, t = 128 + ((r() * 28) | 0);
    for (const [dx, dy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) {
      const tt = t + 6;
      g.fillStyle = `rgb(${tt},${tt - 5},${tt - 13})`; g.beginPath(); g.ellipse(x + dx, y + dy, rr, rr * 0.96, r() * 3, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(60,50,40,0.12)'; g.beginPath(); g.arc(x + dx + 3, y + dy + 3, rr * 0.7, 0, Math.PI * 2); g.fill();
    }
  }
}) }));
let DARKH: THREE.MeshStandardMaterial | null = null;
const darkMat = () => (DARKH ??= new THREE.MeshStandardMaterial({ roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, map: canvas(128, 128, (g) => {
  g.fillStyle = '#56585a'; g.fillRect(0, 0, 128, 128); speckle(g, 0, 0, 128, 128, 3000, ['#4d4f51', '#606264', '#5a5b5c']);
}) }));
let HARD: THREE.MeshStandardMaterial | null = null;
const hardMat = () => (HARD ??= new THREE.MeshStandardMaterial({ roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, map: canvas(128, 128, (g) => {
  g.fillStyle = '#8c8880'; g.fillRect(0, 0, 128, 128); speckle(g, 0, 0, 128, 128, 3000, ['#827e76', '#96928a', '#7a766f', '#9c968c']);
}) }));
let GRAVEL: THREE.MeshStandardMaterial | null = null;
const gravelMat = () => (GRAVEL ??= new THREE.MeshStandardMaterial({ roughness: 1, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, map: canvas(128, 128, (g) => {
  g.fillStyle = '#8d9094'; g.fillRect(0, 0, 128, 128); speckle(g, 0, 0, 128, 128, 5000, ['#a3a6aa', '#6e7175', '#b6b8bb', '#7d8084', '#9a8f86']);
}) }));
let SOIL: THREE.MeshStandardMaterial | null = null;
const soilMat = () => (SOIL ??= new THREE.MeshStandardMaterial({ roughness: 1, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, map: canvas(64, 64, (g) => { g.fillStyle = '#8e5238'; g.fillRect(0, 0, 64, 64); speckle(g, 0, 0, 64, 64, 600, ['#844a32', '#9c5d3e', '#a98470']); }) }));
/** the basketball court's paint on the green slab (the owner: the court has its markings; the FIBA layout): the
 *  boundary 0.5 m in from the slab's edge, the centre line and circle (r 1.8 m), at each end the restricted area
 *  (4.9 m wide, 5.8 m to the free-throw line) in a darker shade, the free-throw circle (dashed inside the lane),
 *  the lane's hash marks, the no-charge semicircle (r 1.25 m) and the three-point line (6.75 m from the basket,
 *  straight 0.9 m in from the sidelines); white lines 8 cm wide, a little worn. Its plane is the slab's own frame. */
function courtMesh(pts: P2[], y: number) {
  const f = fit(pts), L = f.x1 - f.x0, Wd = f.z1 - f.z0, s = 40, cw = Math.round(L * s), ch = Math.round(Wd * s);
  const tex = canvas(cw, ch, (g) => {
    g.fillStyle = '#3f9a8c'; g.fillRect(0, 0, cw, ch);
    speckle(g, 0, 0, cw, ch, 9000, ['#3a9184', '#45a194', '#398c80']);
    const m = 0.5, Lc = L - 2 * m, Wc = Math.min(15, Wd - 2 * m), x0 = (L - Lc) / 2, y0 = (Wd - Wc) / 2, cy = Wd / 2, X = (v: number) => v * s;
    // the restricted areas painted darker
    g.fillStyle = '#2c7a6e';
    for (const e of [0, 1]) { const bx = e ? x0 + Lc - 5.8 : x0; g.fillRect(X(bx), X(cy - 2.45), X(5.8), X(4.9)); }
    g.strokeStyle = 'rgba(246,246,240,0.92)'; g.lineWidth = 0.08 * s; g.lineCap = 'butt';
    const arc = (cx: number, cyy: number, r: number, a0: number, a1: number, dash = false) => { g.setLineDash(dash ? [0.35 * s, 0.3 * s] : []); g.beginPath(); g.arc(X(cx), X(cyy), X(r), a0, a1); g.stroke(); g.setLineDash([]); };
    const line = (ax: number, ay: number, bx: number, by: number) => { g.beginPath(); g.moveTo(X(ax), X(ay)); g.lineTo(X(bx), X(by)); g.stroke(); };
    g.strokeRect(X(x0), X(y0), X(Lc), X(Wc));
    line(L / 2, y0, L / 2, y0 + Wc); arc(L / 2, cy, 1.8, 0, Math.PI * 2);
    for (const e of [0, 1]) {
      const d = e ? -1 : 1, base = e ? x0 + Lc : x0, ft = base + d * 5.8, hoop = base + d * 1.575;
      // the lane and the free-throw line, its circle: solid away from the basket, dashed inside the lane
      line(base, cy - 2.45, ft, cy - 2.45); line(base, cy + 2.45, ft, cy + 2.45); line(ft, cy - 2.45, ft, cy + 2.45);
      if (e) { arc(ft, cy, 1.8, Math.PI / 2, Math.PI * 1.5); arc(ft, cy, 1.8, -Math.PI / 2, Math.PI / 2, true); }
      else { arc(ft, cy, 1.8, -Math.PI / 2, Math.PI / 2); arc(ft, cy, 1.8, Math.PI / 2, Math.PI * 1.5, true); }
      // the hash marks along the lane
      for (const t of [1.75, 2.6, 3.45, 4.3]) for (const sy of [-1, 1]) line(base + d * t, cy + sy * 2.45, base + d * t, cy + sy * 2.6);
      // the no-charge semicircle and the three-point line
      const a = Math.asin(Math.min(1, (Wc / 2 - 0.9) / 6.75)), xa = hoop + d * 6.75 * Math.cos(a);
      if (e) { arc(hoop, cy, 1.25, Math.PI / 2, Math.PI * 1.5); arc(hoop, cy, 6.75, Math.PI - a, Math.PI + a); }
      else { arc(hoop, cy, 1.25, -Math.PI / 2, Math.PI / 2); arc(hoop, cy, 6.75, -a, a); }
      line(base, y0 + 0.9, xa, y0 + 0.9); line(base, y0 + Wc - 0.9, xa, y0 + Wc - 0.9);
    }
    // wear: a few scuffed patches over the paint
    for (let i = 0; i < 40; i++) { const x = ((i * 7919) % 997) / 997 * cw, yy = ((i * 104729) % 991) / 991 * ch; g.fillStyle = 'rgba(70,95,85,0.12)'; g.beginPath(); g.ellipse(x, yy, 30, 18, i, 0, Math.PI * 2); g.fill(); }
  });
  tex.anisotropy = 4;
  const g = new THREE.PlaneGeometry(L, Wd).rotateX(-Math.PI / 2);
  const M = new THREE.Matrix4().makeBasis(new THREE.Vector3(f.axis[0], 0, f.axis[1]), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-f.axis[1], 0, f.axis[0]));
  M.setPosition(f.c[0] + ((f.x0 + f.x1) / 2) * f.axis[0] - ((f.z0 + f.z1) / 2) * f.axis[1], y, f.c[1] + ((f.x0 + f.x1) / 2) * f.axis[1] + ((f.z0 + f.z1) / 2) * f.axis[0]);
  g.applyMatrix4(M);
  const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5 }));
  mesh.receiveShadow = true; mesh.userData.noCollide = true;
  return mesh;
}

/** a flat world-coordinate plane over a polygon (the site frames below are world-aligned: origin 0, axis [1, 0]) */
function flatPlane(k: Kit, pts: P2[], y: number, mat: THREE.Material, tile: number) {
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)))).rotateX(-Math.PI / 2).translate(0, y, 0);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / tile, p.getZ(i) / tile);
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.userData.noCollide = true; k.meshes.push(m);
}
const oval = (c: P2, a: number, b: number, n = 24): P2[] => Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return [c[0] + Math.cos(t) * a, c[1] + Math.sin(t) * b]; });

// ---------- a wing ----------
/** the tapered ground-floor divider's side profile (provisional, tuned on R1): width across the facade, the depth under
 *  the balcony slab, the depth of the low return, the height of the return, the slab's underside */
const FIN = { w: 0.5, top: 1.1, low: 0.3, ret: 0.55, under: 0.4 + ST - 0.18 };
/** the fin as an extruded side profile: out from the wall face at z (out: the face's outward sign) */
function taperedFin(xc: number, z: number, out: number, f: typeof FIN) {
  const sh = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(f.low, 0), new THREE.Vector2(f.low, f.ret), new THREE.Vector2(f.top, f.under), new THREE.Vector2(0, f.under)]);
  const g = new THREE.ExtrudeGeometry(sh, { depth: f.w, bevelEnabled: false });
  // shape x (outward) to world z, the extrusion across the facade
  return out > 0 ? g.rotateY(-Math.PI / 2).translate(xc + f.w / 2, 0, z) : g.rotateY(Math.PI / 2).translate(xc - f.w / 2, 0, z);
}
/** a recessed ground-floor window between x a and b on the face at z: the reveal standing out round it, the dark frame,
 *  glass, a mullion and a transom, the security bars in front */
function groundWindow(p: Part[], k: Kit, a: number, b: number, z: number, out: number) {
  const y0 = 1.2, y1 = 3.05, R = 0.2, Z = (d0: number, d1: number) => [Math.min(z + out * d0, z + out * d1), Math.max(z + out * d0, z + out * d1)] as const;
  const [r0, r1] = Z(0, R);
  p.push([box(a - 0.12, a, y0 - 0.12, y1 + 0.1, r0, r1), CREAM_D], [box(b, b + 0.12, y0 - 0.12, y1 + 0.1, r0, r1), CREAM_D], [box(a - 0.12, b + 0.12, y1, y1 + 0.1, r0, r1), CREAM_D], [box(a - 0.12, b + 0.12, y0 - 0.12, y0, ...Z(0, R + 0.05)), '#e6dcc6']);
  const [f0, f1] = Z(0.01, 0.06);
  p.push([box(a, b, y0, y1, ...Z(0.0, 0.01)), '#26282a']);
  for (const [xa, xb, ya, yb] of [[a, b, y0, y0 + 0.06], [a, b, y1 - 0.06, y1], [a, a + 0.06, y0, y1], [b - 0.06, b, y0, y1], [(a + b) / 2 - 0.03, (a + b) / 2 + 0.03, y0, y1], [a, b, y0 + (y1 - y0) * 0.68 - 0.03, y0 + (y1 - y0) * 0.68 + 0.03]]) p.push([box(xa, xb, ya, yb, f0, f1), '#2e2c2a']);
  k.glass.push(box(a + 0.06, b - 0.06, y0 + 0.06, y1 - 0.06, ...Z(0.02, 0.03)));
  const [s0, s1] = Z(0.1, 0.13);
  for (let x = a + 0.1; x < b - 0.05; x += 0.12) p.push([box(x - 0.012, x + 0.012, y0, y1, s0, s1), '#1f1f1f']);
  for (const y of [y0 + 0.4, y0 + (y1 - y0) / 2, y1 - 0.35]) p.push([box(a, b, y - 0.015, y + 0.015, s0, s1), '#1f1f1f']);
}
/** the balcony bays on a long face (R03, R08, P03): each bay a PAIR of recessed balconies divided by a central wall;
 *  that wall and the two side walls run from the ground to the eaves, standing out as deep as the balconies, so that
 *  on the ground floor they frame two windows; each balcony a slab with a solid lower wall and a dark patterned railing
 *  above it; on the top floor an arch over each balcony. The bay is the facade texture's: the recess spans 0.29-0.95. */
function balconies(k: Kit, x0: number, x1: number, z: number, out: 1 | -1, floors: number, gables: boolean, ochre: boolean, skip?: (u: number) => boolean) {
  const len = x1 - x0, n = Math.max(1, Math.round(len / 7.8)), b = len / n, parts: Part[] = [], d = 1.1, tf = 0.4 + floors * ST;
  for (let i = 0; i < n; i++) {
    if (skip?.(x0 + i * b + b / 2)) continue;
    const a0 = x0 + i * b + b * 0.29, a1 = x0 + i * b + b * 0.95, am = (a0 + a1) / 2, zf = z + out * d, zm = Math.min(z, zf), zM = Math.max(z, zf);
    // the side walls and the central dividing wall, ground to eaves
    for (const [ax, w] of [[a0, 0.14], [a1, 0.14]] as [number, number][]) parts.push([box(ax - w, ax + w, 0, tf, zm, zM), CREAM_D]);
    // the central wall: upright above the first floor; on the ground floor between the two windows it is slanted (the
    // owner's circled R03): a wedge whose two faces run out from the wall to an edge at the balconies' front line
    const g1 = 0.4 + ST;
    parts.push([box(am - 0.13, am + 0.13, g1 - 0.18, tf, zm, zM), CREAM_D]);
    if (ochre) {
      // the main block frontage (the owner's tapered-partition brief, R1): the ground-floor divider is a fin whose side
      // profile tapers: as deep as the balconies under the slab, sloping back to a low narrow return at the foot of the
      // wall; constant width across the facade
      parts.push([taperedFin(am, z, out, FIN), CREAM_D]);
      // the two ground-floor windows either side of it: recessed in a reveal, dark frames, mullion and transom, security
      // bars (not louvres) over the facade texture's openings
      for (const [f0, f1] of [[0.336, 0.578], [0.672, 0.914]] as P2[]) groundWindow(parts, k, x0 + i * b + b * f0, x0 + i * b + b * f1, z, out);
    } else parts.push([prism([[am - 0.36, z], [am + 0.36, z], [am + 0.05, zf], [am - 0.05, zf]], 0, g1 - 0.18), CREAM_D]);
    for (const [h0, h1] of [[a0 + 0.14, am - 0.13], [am + 0.13, a1 - 0.14]] as P2[]) {
      for (let f = 1; f < floors; f++) {
        const y = 0.4 + f * ST;
        parts.push([box(h0, h1, y - 0.18, y, zm, zM), CREAM]);
        // the solid lower wall, then the railing on it: rails, uprights and a run of crossed bars
        if (ochre) {
          // the frontage pair (the owner's eight-pair brief, R06): a thick light solid parapet to rail height, a short
          // dark rail standing on its middle only
          parts.push([box(h0, h1, y, y + 0.95, zf - out * 0.1 - 0.1, zf - out * 0.1 + 0.1), '#f4efe4']);
          const r0 = h0 + (h1 - h0) * 0.22, r1 = h1 - (h1 - h0) * 0.22;
          parts.push([box(r0, r1, y + 1.27, y + 1.3, zf - out * 0.1 - 0.02, zf - out * 0.1 + 0.02), RAIL]);
          for (let x = r0; x <= r1 + 0.01; x += 0.16) parts.push([box(x - 0.012, x + 0.012, y + 0.95, y + 1.28, zf - out * 0.1 - 0.012, zf - out * 0.1 + 0.012), RAIL]);
          continue;
        }
        parts.push([box(h0, h1, y, y + 0.42, zf - out * 0.07 - 0.07, zf - out * 0.07 + 0.07), CREAM]);
        parts.push([box(h0, h1, y + 1.0, y + 1.04, zf - 0.03, zf + 0.03), RAIL], [box(h0, h1, y + 0.44, y + 0.47, zf - 0.03, zf + 0.03), RAIL]);
        for (let x = h0 + 0.2; x < h1 - 0.1; x += 0.42) {
          parts.push([box(x - 0.015, x + 0.015, y + 0.47, y + 1.0, zf - 0.02, zf + 0.02), RAIL]);
          parts.push([new THREE.BoxGeometry(0.02, 0.34, 0.02).rotateZ(0.6).translate(x + 0.21, y + 0.74, zf), RAIL], [new THREE.BoxGeometry(0.02, 0.34, 0.02).rotateZ(-0.6).translate(x + 0.21, y + 0.74, zf), RAIL]);
        }
      }
      // the arch over the top floor's balcony: a solid head with a half-round opening
      const yt = 0.4 + (floors - 1) * ST, w = h1 - h0, r = w / 2, ya = tf - 0.25 - r;
      const head = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(-w / 2, tf - 0.2 - ya), new THREE.Vector2(w / 2, tf - 0.2 - ya), new THREE.Vector2(w / 2, 0)]);
      head.holes.push(new THREE.Path().absarc(0, 0, r - 0.02, 0, Math.PI, false));
      parts.push([new THREE.ExtrudeGeometry(head, { depth: 0.18, bevelEnabled: false }).translate((h0 + h1) / 2, ya, zf - (out > 0 ? 0.18 : 0)), CREAM]);
      void yt;
    }
    // a small gable over every second bay, its roof running back into the main slope
    if (gables && i % 2 === 0) {
      const t = top(floors), w = (a1 - a0) / 2 + 0.3, xm = am, h = 1.9, zg = z + out * 0.5;
      parts.push([tri2([xm - w, t, zg], [xm + w, t, zg], [xm, t + h, zg]), CREAM], [tri2([xm + w, t, zg], [xm - w, t, zg], [xm, t + h, zg]), CREAM]);
      parts.push([new THREE.CircleGeometry(0.7, 12, 0, Math.PI).rotateY(out > 0 ? 0 : Math.PI).translate(xm, t + 0.25, zg + out * 0.02), ochre ? '#cdb37a' : '#d8ccb2']);
      const back = z - out * 3.2;
      k.roof.quad([xm - w - 0.25, t - 0.05, zg + out * 0.3], [xm - w - 0.25, t - 0.05, back], [xm, t + h + 0.2, back], [xm, t + h + 0.2, zg + out * 0.3]);
      k.roof.quad([xm + w + 0.25, t - 0.05, back], [xm + w + 0.25, t - 0.05, zg + out * 0.3], [xm, t + h + 0.2, zg + out * 0.3], [xm, t + h + 0.2, back]);
    }
  }
  k.plain.push(...parts);
}
let SLOT: THREE.MeshStandardMaterial | null = null;
/** the tall pale strip of the recessed slot: glass blocks in a fine grid (R18, P03, P04) */
const slotMat = () => (SLOT ??= new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvas(32, 256, (g) => {
  g.fillStyle = '#e9ecee'; g.fillRect(0, 0, 32, 256);
  g.fillStyle = 'rgba(150,165,175,0.55)'; for (let y = 0; y < 256; y += 8) g.fillRect(0, y, 32, 1); for (let x = 0; x < 32; x += 8) g.fillRect(x, 0, 1, 256);
}) }));
/** the recessed vertical slot (the owner's purple arrows on R18): a full-height pale glass-block strip set back between
 *  two ochre fins that stand out from the wall face, in the window column of the bay at u (model frame) */
function slot(k: Kit, u: number, z: number, out: 1 | -1, floors: number, ochre: boolean) {
  const tf = 0.4 + floors * ST, w = 1.0, dep = 0.45, col = ochre ? OCHRE : CREAM_D;
  k.plain.push([box(u - w / 2 - 0.3, u - w / 2, 0, tf, Math.min(z, z + out * dep), Math.max(z, z + out * dep)), col], [box(u + w / 2, u + w / 2 + 0.3, 0, tf, Math.min(z, z + out * dep), Math.max(z, z + out * dep)), col]);
  const g = new THREE.PlaneGeometry(w, tf - 0.6).translate(u, (tf - 0.6) / 2 + 0.6, z + out * 0.03);
  if (out < 0) g.rotateY(Math.PI).translate(2 * u, 0, 2 * z);
  const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) * (tf - 0.6) / 8);
  const m = new THREE.Mesh(g, slotMat()); m.receiveShadow = true; m.userData.noCollide = true; k.meshes.push(m);
}
/** a blank cream face (the service volumes build their own openings in geometry) */
const BLANK_C: Style = { bay: 6, up: [], ground: [], draw: (g) => { wall(g); slab(g, 236, 20); } };
let PERF: THREE.MeshStandardMaterial | null = null;
/** terracotta perforated blocks (R05): a frame of blocks with a dark hole in each, 4 x 8 to a texture */
const perfMat = () => (PERF ??= new THREE.MeshStandardMaterial({ roughness: 0.9, map: (() => { const t = canvas(128, 256, (g) => {
  g.fillStyle = '#b4583a'; g.fillRect(0, 0, 128, 256);
  for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) { g.fillStyle = '#4a2318'; g.fillRect(i * 32 + 7, j * 32 + 7, 18, 18); g.fillStyle = 'rgba(255,220,190,0.18)'; g.fillRect(i * 32 + 2, j * 32 + 2, 28, 3); }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })() }));
/** a perforated panel on a face: centre (u along x or z), its plane, size; repeats one block grid every 0.25 m */
function perfPanel(k: Kit, alongX: boolean, at: number, out: number, a: number, w: number, y0: number, y1: number) {
  const g = new THREE.PlaneGeometry(w, y1 - y0);
  const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * (y1 - y0) / 2);
  if (alongX) { if (out < 0) g.rotateY(Math.PI); g.translate(a, (y0 + y1) / 2, at + out * 0.06); } else { g.rotateY(out > 0 ? Math.PI / 2 : -Math.PI / 2); g.translate(at + out * 0.06, (y0 + y1) / 2, a); }
  const m = new THREE.Mesh(g, perfMat()); m.receiveShadow = true; m.userData.noCollide = true; k.meshes.push(m);
  // the white frame round it
  k.plain.push(alongX ? [box(a - w / 2 - 0.12, a + w / 2 + 0.12, y0 - 0.12, y1 + 0.12, Math.min(at, at + out * 0.05), Math.max(at, at + out * 0.05)), '#f2ece0'] : [box(Math.min(at, at + out * 0.05), Math.max(at, at + out * 0.05), y0 - 0.12, y1 + 0.12, a - w / 2 - 0.12, a + w / 2 + 0.12), '#f2ece0']);
}
/** a stack of curved balconies standing out of a face along z at x = at (out -1: west): a light solid half-round
 *  parapet on each slab, a thin rail on it, the dark opening behind (R05) */
function curvedStack(k: Kit, at: number, out: number, zc: number, w: number, d: number, floors: number, groundGrille: boolean) {
  for (let fl = 1; fl < floors; fl++) {
    const y = 0.4 + fl * ST;
    const slabG = new THREE.CylinderGeometry(w / 2, w / 2, 0.18, 20, 1, false, 0, Math.PI).scale(d / (w / 2), 1, 1).rotateY(out < 0 ? Math.PI : 0).translate(at, y - 0.09, zc);
    k.plain.push([slabG, '#efe9dc']);
    const wallG = new THREE.CylinderGeometry(w / 2, w / 2, 0.95, 20, 1, true, 0, Math.PI).scale(d / (w / 2), 1, 1).rotateY(out < 0 ? Math.PI : 0).translate(at, y + 0.475, zc);
    const m = new THREE.Mesh(wallG, new THREE.MeshStandardMaterial({ color: '#f4efe4', roughness: 0.9, side: THREE.DoubleSide })); m.castShadow = true; k.meshes.push(m);
    k.plain.push([box(Math.min(at, at + out * 0.03), Math.max(at, at + out * 0.03), y, y + 2.3, zc - w / 2 + 0.3, zc + w / 2 - 0.3), '#3b3833']);
    k.plain.push([box(Math.min(at, at + out * (d - 0.1)), Math.max(at, at + out * (d - 0.1)), y + 1.12, y + 1.15, zc - 0.5, zc + 0.5), RAIL]);
  }
  if (groundGrille) { k.plain.push([box(Math.min(at, at + out * 0.04), Math.max(at, at + out * 0.04), 0.9, 2.6, zc - w / 2, zc + w / 2), '#3b3833']); for (let z = zc - w / 2 + 0.1; z < zc + w / 2; z += 0.15) k.plain.push([box(Math.min(at, at + out * 0.08), Math.max(at, at + out * 0.08), 0.9, 2.6, z - 0.015, z + 0.015), '#6b625a']); }
}
/** a stack of curved balconies wrapped round a corner at (cx, cz), the outside the quarter x < cx, z > cz (R05 and the
 *  owner's notes: the two walls at the edge share the balcony): a rounded slab, a light solid parapet round the three
 *  outer quarters with a thin rail on it, the dark openings behind on both walls; under them a grilled window on each */
function cornerStack(k: Kit, cx: number, cz: number, r: number, floors: number) {
  const mat = new THREE.MeshStandardMaterial({ color: '#f4efe4', roughness: 0.9, side: THREE.DoubleSide });
  for (let fl = 1; fl < floors; fl++) {
    const y = 0.4 + fl * ST;
    k.plain.push([new THREE.CylinderGeometry(r, r, 0.18, 28).translate(cx, y - 0.09, cz), '#efe9dc']);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.95, 28, 1, true, Math.PI, Math.PI * 1.5).translate(cx, y + 0.475, cz), mat); wall.castShadow = true; k.meshes.push(wall);
    k.plain.push([new THREE.CylinderGeometry(r - 0.06, r - 0.06, 0.04, 28, 1, true, Math.PI, Math.PI * 1.5).translate(cx, y + 1.17, cz), RAIL]);
    for (let i = 0; i <= 9; i++) { const t = Math.PI + (Math.PI * 1.5 * i) / 9; k.plain.push([box(cx + Math.sin(t) * (r - 0.06) - 0.012, cx + Math.sin(t) * (r - 0.06) + 0.012, y + 0.95, y + 1.17, cz + Math.cos(t) * (r - 0.06) - 0.012, cz + Math.cos(t) * (r - 0.06) + 0.012), RAIL]); }
    k.plain.push([box(cx - 0.03, cx, y, y + 2.3, cz - r + 0.2, cz - 0.25), '#3b3833'], [box(cx + 0.25, cx + r - 0.2, y, y + 2.3, cz, cz + 0.03), '#3b3833']);
  }
  const bar = (a: number, b: number, alongZ: boolean) => {
    k.plain.push(alongZ ? [box(cx - 0.04, cx, 0.9, 2.6, a, b), '#3b3833'] : [box(a, b, 0.9, 2.6, cz, cz + 0.04), '#3b3833']);
    for (let u = a + 0.1; u < b; u += 0.15) k.plain.push(alongZ ? [box(cx - 0.08, cx - 0.04, 0.9, 2.6, u - 0.015, u + 0.015), '#6b625a'] : [box(u - 0.015, u + 0.015, 0.9, 2.6, cz + 0.04, cz + 0.08), '#6b625a']);
  };
  bar(cz - r - 0.4, cz - 0.3, true); bar(cx + 0.3, cx + r + 0.4, false);
}
/** front-w's west end (pair 5, R05, and the owner's notes on it): the connector, four storeys under a roof terrace,
 *  and the screened tower south of it, a storey taller under its cap and tank, its south-west corner cut on the angle
 *  (the satellite and the owner's purple arrows: the faces turn like the corners of a hexagon); the hipped roof starts
 *  behind them. The link north of the connector, to the west block, is the junctions' (below). */
const SVC = 7.5, CH = 2.5;
/** a skin T deep standing out of a face along z at x = at (out -1: west), from v0 to v1 and 0 to y1, with the openings
 *  cut out of it (each a recess behind, with a two-bar rail at its sill when railed; 'open': a way through, no back) */
function skinZ(p: Part[], at: number, out: number, v0: number, v1: number, y1: number, T: number, holes: [number, number, number, number, boolean, string?][]) {
  const vs = [...new Set([v0, v1, ...holes.flatMap(([a, b]) => [a, b])])].sort((m, n) => m - n);
  const ys = [...new Set([0, y1, ...holes.flatMap(([, , c, d]) => [c, d])])].sort((m, n) => m - n);
  const xa = Math.min(at, at + out * T), xb = Math.max(at, at + out * T);
  for (let i = 1; i < vs.length; i++) for (let j = 1; j < ys.length; j++) {
    const vm = (vs[i - 1] + vs[i]) / 2, ym = (ys[j - 1] + ys[j]) / 2;
    if (!holes.some(([a, b, c, d]) => vm > a && vm < b && ym > c && ym < d)) p.push([box(xa, xb, ys[j - 1], ys[j], vs[i - 1], vs[i]), '#efe6d2']);
  }
  for (const [a, b, c, d, rail, back] of holes) {
    if (back !== 'open') p.push([box(Math.min(at, at + out * 0.02), Math.max(at, at + out * 0.02), c, d, a, b), back ?? '#35322e']);
    // the shade on the soffit of the void
    p.push([box(Math.min(at, at + out * T), Math.max(at, at + out * T), d - 0.03, d, a, b), '#bdb5a6']);
    if (rail) {
      const xa = Math.min(at + out * (T - 0.08), at + out * (T - 0.05)), xb = Math.max(at + out * (T - 0.08), at + out * (T - 0.05));
      for (const yy of [c + 0.45, c + 0.9]) p.push([box(xa, xb, yy - 0.02, yy + 0.02, a, b), '#6f6a62']);
      for (let v = a + 0.25; v < b; v += 0.25) p.push([box(xa, xb, c, c + 0.9, v - 0.012, v + 0.012), '#6f6a62']);
    }
  }
}
/** builds details on a face from a to b (the spec's frame; the outside on the right going from a to b) in the face's
 *  own frame: the face is the plane x = 0, outward -x, running along z from 0 to L */
function onFace(k: Kit, a: P2, b: P2, build: (fk: Kit, L: number) => void) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), dx = (b[0] - a[0]) / L, dz = (b[1] - a[1]) / L;
  const M = new THREE.Matrix4().set(dz, 0, dx, a[0], 0, 1, 0, 0, -dx, 0, dz, a[1], 0, 0, 0, 1);
  const fk = { ...k, plain: [] as Part[], glass: [] as THREE.BufferGeometry[], meshes: [] as THREE.Mesh[] } as Kit;
  build(fk, L);
  for (const [g] of fk.plain) g.applyMatrix4(M);
  for (const g of fk.glass) g.applyMatrix4(M);
  for (const m of fk.meshes) m.geometry.applyMatrix4(M);
  k.plain.push(...fk.plain); k.glass.push(...fk.glass); k.meshes.push(...fk.meshes);
}
/** a stack of box balconies standing out of a face along z at x = at (out -1: west), R05's tower: a slab, a solid
 *  parapet on three sides with a thin rail on it, the dark opening behind, a roof slab over the top one */
function boxStack(p: Part[], at: number, out: number, zc: number, w: number, d: number, floors: number) {
  const X = (a: number, b: number) => [Math.min(at + out * a, at + out * b), Math.max(at + out * a, at + out * b)] as const;
  for (let fl = 1; fl < floors; fl++) {
    const y = 0.4 + fl * ST, [s0, s1] = X(0, d), [f0, f1] = X(d - 0.12, d);
    p.push([box(s0, s1, y - 0.2, y, zc - w / 2, zc + w / 2), '#efe9dc'], [box(f0, f1, y, y + 1.0, zc - w / 2, zc + w / 2), '#f2ede2']);
    for (const z of [zc - w / 2, zc + w / 2 - 0.12]) p.push([box(s0, s1, y, y + 1.0, z, z + 0.12), '#f2ede2']);
    p.push([box(...X(0, 0.03), y, y + 2.3, zc - w / 2 + 0.2, zc + w / 2 - 0.2), '#3b3833']);
    const [r0, r1] = X(d - 0.08, d - 0.04);
    p.push([box(r0, r1, y + 1.28, y + 1.32, zc - w / 2 + 0.1, zc + w / 2 - 0.1), '#7a756c']);
    for (let z = zc - w / 2 + 0.2; z < zc + w / 2 - 0.1; z += 0.3) p.push([box(r0, r1, y + 1.0, y + 1.3, z - 0.012, z + 0.012), '#7a756c']);
    // the side walls of the box up to the next slab
    for (const z of [zc - w / 2, zc + w / 2 - 0.1]) p.push([box(s0, s1, y + 1.0, y + ST - 0.2, z, z + 0.1), '#ece6d8']);
  }
  const yt = 0.4 + floors * ST, [s0, s1] = X(0, d + 0.1);
  p.push([box(s0, s1, yt - 0.25, yt, zc - w / 2 - 0.05, zc + w / 2 + 0.05), '#efe9dc']);
}
function frontWestEnd(k: Kit, f: ReturnType<typeof fit>) {
  const x0 = f.x0, z1 = f.z1, zm = f.z0 + (f.z1 - f.z0) * 0.5, p: Part[] = [], fy = (fl: number) => 0.4 + fl * ST;
  // (the connector's west face, in its two planes, is the junctions' below; this block only fills behind it)
  // the tower: five storeys, its corner cut; on its west face the stacked box balconies (the owner's light-green arrow:
  // cubes, not half-rounds) and, close to the corner, the perforated panels; on the cut face the second column of
  // panels close to the same corner (the owner's yellow arrows); three sizes a column, a large one over the top two
  // floors, a mid one, a low one, white wall between; the cap and the tank
  const tt = fy(5) + 0.6, poly: P2[] = [[x0, zm], [x0 + SVC, zm], [x0 + SVC, z1], [x0 + CH, z1], [x0, z1 - CH]];
  p.push([prism(poly, 0, tt - 0.6), '#efe6d2']);
  const edge: P2[] = [[x0, zm], [x0, z1 - CH], [x0 + CH, z1], [x0 + SVC, z1]];
  for (let fl = 1; fl < 5; fl++) p.push([strip(edge, fy(fl) - 0.06, fy(fl) + 0.06, 0.03), '#e2d9c5']);
  p.push([prism([[x0 - 0.12, zm], [x0 + SVC, zm], [x0 + SVC, z1 + 0.12], [x0 + CH + 0.05, z1 + 0.12], [x0 - 0.12, z1 - CH - 0.05]], tt - 0.6, tt), '#e9e2d3']);
  p.push([new THREE.CylinderGeometry(0.9, 0.9, 1.9, 16).translate(x0 + 3.2, tt + 0.95, (zm + z1) / 2), '#1c1d20']);
  boxStack(p, x0, -1, zm + 1.05, 1.8, 1.0, 5);
  const PAN: [number, number][] = [[fy(3.3), fy(4.45)], [fy(2.25), fy(2.75)], [fy(1.25), fy(1.7)]];
  for (const [y0, y1] of PAN) perfPanel(k, false, x0, -1, z1 - CH - 0.6, 0.9, y0, y1);
  onFace(k, [x0, z1 - CH], [x0 + CH, z1], (fk) => { for (const [y0, y1] of PAN) perfPanel(fk, false, 0, -1, 0.85, 1.1, y0 + 0.1, y1); });
  for (let i = 1; i < edge.length; i++) wallSolids(...wpt(f, ...edge[i - 1]), ...wpt(f, ...edge[i]), 0.3);
  // (the cut corner is open ground: the wing's mapped outline still covers it)
  { const c = [wpt(f, x0, z1 - CH), wpt(f, x0 + CH, z1), wpt(f, x0, z1)], xs = c.map((q) => q[0]), zs = c.map((q) => q[1]);
    PASSAGES.push([Math.min(...xs) - 0.4, Math.max(...xs), Math.min(...zs), Math.max(...zs) + 0.4]); }
  k.plain.push(...p);
}
/** a model-frame point of a wing to world */
const wpt = (f: ReturnType<typeof fit>, u: number, v: number): [number, number] => [f.c[0] + u * f.axis[0] - v * f.axis[1], f.c[1] + u * f.axis[1] + v * f.axis[0]];

function wingSpec(w: Wing): Spec {
  const f = fit(w.quad), ochre = !!w.ochre, svc = w.id === 'front-w';
  const endS = w.ends === 'balcony' ? END : styleOf(w.ends, ochre);
  const faces = { z1: styleOf(w.south, ochre), z0: styleOf(w.north, ochre), x0: w.ends === 'balcony' ? BLANK_C : endS, x1: endS };
  const zm = f.z0 + (f.z1 - f.z0) * 0.5;
  // (R05: the west block's south face, between its west face and the link, is blank)
  if (w.ends === 'balcony') faces.z1 = BLANK_C;
  return {
    name: `Evandy wing ${w.id}`, axis: f.axis, origin: f.c, storey: ST, style: PLAIN, roofColor: w.roof, fascia: '#efe7d6', pitch: 0.42,
    replaces: [f.c],
    blocks: svc ? [
      { x0: f.x0 + SVC, x1: f.x1, z0: f.z0, z1: f.z1, floors: w.floors, faces },
      { x0: f.x0, x1: f.x0 + SVC, z0: f.z0, z1: zm, floors: 4, roof: 'flat', faces: { x0: BLANK_C, z0: BLANK_C, z1: BLANK_C, x1: BLANK_C } },
    ] : [{ x0: f.x0, x1: f.x1, z0: f.z0, z1: f.z1, floors: w.floors, faces }],
    keep: [],
    extras: (k) => {
      if (svc) frontWestEnd(k, f);
      // (the audit, C05: no balconies where Annex A's central connection stands against the north bar's face; EV-014: nor
      // in the bay of the south bar's court face that takes Annex A's entrance)
      const underDeck = w.id.startsWith('upper-n') ? (u: number) => { const [x] = wpt(f, u, f.z1); return x > A_DECK.x0 - 1 && x < A_DECK.x1 + 1; }
        : w.id === 'upper-s-e' ? (u: number) => wpt(f, u, f.z1)[0] < A_GATE_X : undefined;
      if (w.south === 'balcony') balconies(k, svc ? f.x0 + SVC : f.x0, f.x1, f.z1, 1, w.floors, !!w.gables, ochre, underDeck);
      // the recessed slot in the window column of the second bay from the wing's outer end (front-e: east; others: west)
      if (w.slot) { const n = Math.max(1, Math.round((f.x1 - f.x0) / 7.8)), b = (f.x1 - f.x0) / n, u = w.slot === 'x1' ? f.x1 - b + b * 0.13 : f.x0 + b + b * 0.13; slot(k, u, f.z1, 1, w.floors, ochre); }
      if (w.north === 'balcony') balconies(k, f.x0, f.x1, f.z0, -1, w.floors, !!w.gables, ochre);
      // the stacked small balconies on a balcony end (the west stair end, R04)
      // (the owner's eight-pair brief, pair 5: the west block's stack of curved light balconies on its west face, the
      // wide grilled window under it, a small front gable over it)
      if (w.ends === 'balcony') {
        // (R05 and the owner's notes, the left mass read north to south: the small stacked balconies at the north-west
        // corner; on the west face a tall slot, two small square windows and a second tall slot a floor; the curved
        // balconies wrapped round the south-west corner, one a floor from the first, shared by the two walls, grilled
        // windows under them; the south face blank)
        const at = f.x0, Z = (s: number) => f.z0 + (f.z1 - f.z0) * s, p: Part[] = [];
        cornerStack(k, at, f.z1, 1.7, w.floors);
        for (let fl = 0; fl < w.floors; fl++) {
          const y = 0.4 + fl * ST;
          for (const s of [0.18, 0.55]) p.push([box(at - 0.04, at, y + 0.7, y + 2.5, Z(s), Z(s) + 0.45), '#3b3833']);
          for (const s of [0.3, 0.4]) p.push([box(at - 0.04, at, y + 1.6, y + 2.05, Z(s), Z(s) + 0.42), '#3b3833']);
          if (fl) {
            p.push([box(at - 0.05, at + 1.3, y - 0.15, y, f.z0 - 0.9, f.z0), '#efe9dc']);
            for (let x = at; x < at + 1.3; x += 0.13) p.push([box(x - 0.012, x + 0.012, y, y + 0.95, f.z0 - 0.88, f.z0 - 0.85), RAIL]);
            p.push([box(at - 0.05, at + 1.3, y + 0.93, y + 0.97, f.z0 - 0.9, f.z0 - 0.83), RAIL], [box(at + 0.1, at + 1.0, y, y + 2.2, f.z0 - 0.03, f.z0), '#3b3833']);
          } else p.push([box(at + 0.15, at + 1.15, 0.9, 2.3, f.z0 - 0.03, f.z0), '#3b3833']);
        }
        k.plain.push(...p);
        const t = top(w.floors), gc = Z(0.17), hw = 1.9, gh = 1.6;
        k.plain.push([tri2([f.x0 - 0.3, t, gc + hw], [f.x0 - 0.3, t, gc - hw], [f.x0 - 0.3, t + gh, gc]), CREAM], [tri2([f.x0 - 0.3, t, gc - hw], [f.x0 - 0.3, t, gc + hw], [f.x0 - 0.3, t + gh, gc]), CREAM]);
        k.roof.quad([f.x0 - 0.9, t - 0.05, gc - hw - 0.3], [f.x0 + 3, t - 0.05, gc - hw - 0.3], [f.x0 + 3, t + gh + 0.2, gc], [f.x0 - 0.9, t + gh + 0.2, gc]);
        k.roof.quad([f.x0 + 3, t - 0.05, gc + hw + 0.3], [f.x0 - 0.9, t - 0.05, gc + hw + 0.3], [f.x0 - 0.9, t + gh + 0.2, gc], [f.x0 + 3, t + gh + 0.2, gc]);
      }
      // downpipes at the ends of the long faces
      for (const x of svc ? [f.x1 - 0.4] : [f.x0 + 0.4, f.x1 - 0.4]) for (const z of [f.z0 - 0.12, f.z1 + 0.12]) k.plain.push([new THREE.CylinderGeometry(0.06, 0.06, top(w.floors), 6).translate(x, top(w.floors) / 2, z), '#e4dccb']);
      mergeMeshes(k);
    },
  };
}

// ---------- the shared pieces of the audit's corrections ----------
/** a polygon clipped to the half-plane a x + b z <= c (Sutherland-Hodgman) */
function clipHalf(poly: P2[], a: number, b: number, c: number): P2[] {
  const out: P2[] = [], f = (p: P2) => a * p[0] + b * p[1] - c;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], fp = f(p), fq = f(q);
    if (fp <= 0) out.push(p);
    if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) { const t = fp / (fp - fq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
  }
  return out;
}
/** a polygon pulled in toward its centroid by d (no coplanar faces with the wings it meets) */
const shrink = (poly: P2[], d: number): P2[] => {
  const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cz = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  return poly.map(([x, z]) => { const l = Math.hypot(x - cx, z - cz); return [x - ((x - cx) / l) * d, z - ((z - cz) / l) * d]; });
};
/** the deck height of the tank-bearing sections (the owner: a few metres lower than the buildings): their roof slab at
 *  the third-floor ceiling, a storey under the wings' eaves and some 7 m under their ridges (relative, not measured) */
const DECK = 0.4 + 3 * ST + 0.3;
/** a black polytank (I03's dark circles; R04, V2): the drum, its ribs, the lid, a short concrete plinth under it */
function tank(p: Part[], x: number, z: number, r: number, y: number) {
  const h = r > 0.7 ? 1.85 : 1.25;
  p.push([new THREE.CylinderGeometry(r + 0.08, r + 0.08, 0.22, 14).translate(x, y + 0.11, z), '#bdb7ab']);
  p.push([new THREE.CylinderGeometry(r, r * 0.97, h, 18).translate(x, y + 0.22 + h / 2, z), '#1c1d20']);
  for (const t of [0.3, 0.62]) p.push([new THREE.CylinderGeometry(r + 0.02, r + 0.02, 0.06, 18).translate(x, y + 0.22 + h * t, z), '#26272a']);
  p.push([new THREE.SphereGeometry(r, 18, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.25, 1).translate(x, y + 0.22 + h, z), '#1c1d20']);
  p.push([new THREE.CylinderGeometry(r * 0.32, r * 0.32, 0.12, 12).translate(x, y + 0.22 + h + r * 0.25, z), '#2a2b2e']);
}
/** places parts built in a local frame (x across, y up, z out of the face) at (x, z) facing the outward normal yaw */
const placed = (parts: Part[], glass: THREE.BufferGeometry[], x: number, z: number, yaw: number, y = 0) => {
  const M = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  for (const [g] of parts) g.applyMatrix4(M);
  for (const g of glass) g.applyMatrix4(M);
};
const GOLDF = '#c9a14b';
/** the shared annex glass gate (I09 and I10, the same gate from its two sides; the owner: Annex A and Annex B share
 *  it): warm gold frames with depth round dark glazing, a mid rail across each leaf; the left bay the doorway with its
 *  leaf swung open and its handle, a cream pier with the no-smoking sign, the right bay a closed glazed leaf with its
 *  pull handle; the threshold step. Local frame: the face at z 0, outward +z, centred on x 0, W wide. The unseen
 *  bottom fittings and the leaf count beyond these two bays are not invented. */
function glassGate(W: number, H: number, inward = true) {
  const p: Part[] = [], gl: THREE.BufferGeometry[] = [], fw = 0.09, fd = 0.12, x0 = -W / 2, x1 = W / 2, pier = 0.42;
  const xm = x0 + (W - pier) * 0.55, xp = xm + pier;
  const frame = (a: number, b: number, z: number) => {
    p.push([box(a, a + fw, 0.12, H, z, z + fd), GOLDF], [box(b - fw, b, 0.12, H, z, z + fd), GOLDF], [box(a, b, H - fw, H, z, z + fd), GOLDF], [box(a, b, 0.12, 0.12 + fw, z, z + fd), GOLDF]);
    p.push([box(a, b, H * 0.46 - 0.04, H * 0.46 + 0.04, z, z + fd), GOLDF]);
  };
  // the right bay: the closed leaf
  frame(xp, x1, 0); gl.push(box(xp + fw, x1 - fw, 0.12 + fw, H - fw, 0.05, 0.07));
  p.push([box(xp + 0.18, xp + 0.22, H * 0.3, H * 0.62, fd, fd + 0.06), '#b9b4a8'], [box(xp + 0.18, xp + 0.22, H * 0.3, H * 0.33, 0.04, fd + 0.06), '#b9b4a8'], [box(xp + 0.18, xp + 0.22, H * 0.59, H * 0.62, 0.04, fd + 0.06), '#b9b4a8']);
  // the pier and its sign (the red circle on white, the small red label under it)
  p.push([box(xm, xp, 0, H + 0.4, -0.15, 0.1), '#e8d7a6'], [box(xm + 0.08, xp - 0.08, 1.35, 1.75, 0.1, 0.115), '#f4f2ee'], [new THREE.TorusGeometry(0.1, 0.018, 4, 16).translate((xm + xp) / 2, 1.58, 0.12), '#c8302a'], [box(xm + 0.1, xp - 0.1, 1.38, 1.44, 0.1, 0.12), '#d9542e']);
  // the doorway: its fixed frame, the leaf swung open inward against its jamb, the interior's shade behind
  p.push([box(x0, x0 + fw, 0.12, H, 0, fd), GOLDF], [box(xm - fw, xm, 0.12, H, 0, fd), GOLDF], [box(x0, xm, H - fw, H, 0, fd), GOLDF]);
  { const L = xm - x0 - 2 * fw, leaf: Part[] = [], lg: THREE.BufferGeometry[] = [];
    leaf.push([box(0, fw, 0.14, H - fw, 0, 0.06), GOLDF], [box(L - fw, L, 0.14, H - fw, 0, 0.06), GOLDF], [box(0, L, H - 2 * fw, H - fw, 0, 0.06), GOLDF], [box(0, L, 0.14, 0.14 + fw, 0, 0.06), GOLDF], [box(0, L, H * 0.46 - 0.04, H * 0.46 + 0.04, 0, 0.06), GOLDF]);
    leaf.push([box(L - 0.25, L - 0.21, H * 0.3, H * 0.62, -0.06, 0), '#b9b4a8']);
    lg.push(box(fw, L - fw, 0.14 + fw, H - 2 * fw, 0.02, 0.04));
    const M = new THREE.Matrix4().makeRotationY(inward ? 1.35 : -1.35).setPosition(x0 + fw, 0, inward ? 0 : fd);
    for (const [g] of leaf) g.applyMatrix4(M); for (const g of lg) g.applyMatrix4(M);
    p.push(...leaf); gl.push(...lg); }
  // the threshold step and the head over the opening
  p.push([box(x0 - 0.25, x1 + 0.25, 0, 0.13, 0, 0.55), '#cfc8b8'], [box(x0 - 0.12, x1 + 0.12, H, H + 0.35, -0.1, 0.12), '#efe6d2']);
  // a gate set on a wall (the annexes): the lobby's shade behind the doorway
  if (!inward) p.push([box(x0 + fw, xm - fw, 0.12, H - fw, -0.02, 0.01), '#2b2723']);
  return { p, gl };
}

// ---------- the main block's centre: the tank deck and the entrance (the audit's C02, C03, C08, C09, EV-013) ----------
/** the deck in the entrance's frame (origin ENTRY.c, world axes), carried 0.25 m into the wings it joins so no slit shows
 *  between them (the wings stand on their outlines' fitted boxes) */
const MD = shrink(MAIN_DECK.map(([x, z]) => [x - ENTRY.c[0], z - ENTRY.c[1]] as P2), -0.25);
/** the through way on the ground floor, front door to the rear court: its half width; the stair tower's back line */
const CW = 1.6, TOWER = 3.2;
const entrance: Spec = {
  name: 'Evandy main block entrance and tank deck', axis: [1, 0], origin: ENTRY.c, storey: ST, style: PLAIN, roofColor: '#c4633a', fascia: '#efe7d6', pitch: 0.42,
  blocks: [],
  keep: [[-5, 5, ENTRY.d / 2 - 1.5, ENTRY.d / 2 + 3], [-7.5, 7.5, -25, 7]],
  extras: (k) => {
    const z = ENTRY.d / 2, t = top(4), parts: Part[] = [], W = (x: number, zz: number): [number, number] => [x + ENTRY.c[0], zz + ENTRY.c[1]];
    // the central strip (I03): the deck, a storey under the wings' eaves, from the wings' inner ends; at its front the
    // stair tower behind the glazed bay, to the eaves; on the ground floor the way through, front door to rear gate
    const deck = clipHalf(MD, 0, 1, TOWER), tower = clipHalf(clipHalf(MD, 0, -1, -TOWER), 0, 1, z - 0.9);
    for (const [poly, y1] of [[deck, DECK], [tower, t - 0.4]] as [P2[], number][]) {
      if (poly.length < 3) continue;
      parts.push([prism(poly, 3.6, y1), CREAM]);
      parts.push([prism(clipHalf(poly, 1, 0, -CW), 0, 3.6), CREAM], [prism(clipHalf(poly, -1, 0, -CW), 0, 3.6), CREAM]);
    }
    parts.push([prism(tower, t - 0.4, t - 0.15), '#d8d3c8'], [prism(deck, DECK - 0.02, DECK + 0.08), '#cdc8bc']);
    // the deck's parapet along its open edges (the waists to the inner courts, the rear), its tanks
    const edge = (a: P2, b: P2) => parts.push([strip([a, b], DECK, DECK + 0.85, 0.11), '#ece5d4'], [strip([a, b], DECK + 0.85, DECK + 0.92, 0.15), '#dcd3c0']);
    for (let i = 0; i < deck.length; i++) { const a = deck[i], b = deck[(i + 1) % deck.length]; if (Math.abs(a[1] - TOWER) > 0.01 || Math.abs(b[1] - TOWER) > 0.01) edge(a, b); }
    for (const [x, zz, r] of MAIN_TANKS) tank(parts, x - ENTRY.c[0], zz - ENTRY.c[1], r, DECK + 0.08);
    // the faces into the inner courts and the rear: a louvred window a floor; the rear's first floor a band of them
    for (const [a, b] of [[MD[1], MD[2]], [MD[5], MD[6]]] as [P2, P2][]) onFace(k, b, a, (fk, L) => { const q: Part[] = []; for (let fl = 0; fl < 3; fl++) louvreWin(q, L / 2, 0.4 + fl * ST + 1.0, 1.0, 1.3); fk.plain.push(...q); });
    onFace(k, MD[4], MD[3], (fk, L) => { const q: Part[] = []; for (let fl = 1; fl < 3; fl++) for (const u of [L * 0.22, L * 0.78]) louvreWin(q, u, 0.4 + fl * ST + 1.0, 1.0, 1.3); fk.plain.push(...q); });
    // the way through: its screed, a light over it
    { const zr = MD[3][1] + ((MD[4][1] - MD[3][1]) * (CW - MD[3][0])) / (MD[4][0] - MD[3][0]) - 0.6;
      parts.push([box(-CW, CW, 0, 0.05, zr, z - 2.5), '#cdc6b6'], [box(-CW, CW, 3.5, 3.6, zr, z - 2.5), '#e9e3d6']);
      for (let zz = z - 5; zz > zr + 1; zz -= 6) parts.push([box(-0.3, 0.3, 3.44, 3.5, zz - 0.06, zz + 0.06), '#f4f2ea']);
      // the rear entrance (the owner, EV-013): a metal gate in the rear opening, painted the fence's bronze-brown (I11),
      // its two leaves standing open against the reveals (Evandy's entrances are open: the owner, 2026-10-16); the bar
      // pattern and leaf count are unverified (no photograph of the rear)
      const zb = zr + 0.6, BR = '#7c6c50';
      parts.push([box(-CW - 0.15, -CW, 0, 2.9, zb - 0.1, zb + 0.15), BR], [box(CW, CW + 0.15, 0, 2.9, zb - 0.1, zb + 0.15), BR], [box(-CW - 0.15, CW + 0.15, 2.75, 2.9, zb - 0.1, zb + 0.15), BR]);
      for (const s of [-1, 1]) {
        const x = s * (CW - 0.1), L = CW - 0.1;
        for (let u = 0.08; u < L - 0.02; u += 0.12) parts.push([box(x - 0.016, x + 0.016, 0.05, 2.6, zb + u - 0.016, zb + u + 0.016), BR]);
        for (const y of [0.12, 1.3, 2.55]) parts.push([box(x - 0.025, x + 0.025, y - 0.03, y + 0.03, zb, zb + L), BR]);
      }
      // the rear reveals and the head over the opening, the walls' solids
      wallSolids(...W(-CW - 0.05, zr + 0.6), ...W(-CW - 0.05, z - 2.5), 0.12); wallSolids(...W(CW + 0.05, zr + 0.6), ...W(CW + 0.05, z - 2.5), 0.12); }
    for (const [a, b] of [[MD[1], MD[2]], [MD[5], MD[6]]] as [P2, P2][]) wallSolids(...W(...a), ...W(...b), 0.3);
    // the paired columns, full height, each side of the glazing (R08, I11: slender, yellow)
    for (const x of [-3.5, -2.85, 2.85, 3.5]) parts.push([new THREE.CylinderGeometry(0.26, 0.28, t, 14).translate(x, t / 2, z - 0.35), OCHRE]);
    // the front wall of the bay above the entry: spandrels and the glazing bands (I11: warm yellow-gold frames in a grid
    // of five lights by two over each band, the glass reflecting; the old dark awning panes withdrawn)
    parts.push([box(-3.2, 3.2, 3.6, t, z - 0.9, z - 0.7), CREAM]);
    for (let f = 1; f < 4; f++) {
      const y = 0.4 + f * ST + 0.4, h = ST - 1.0;
      k.glass.push(box(-2.3, 2.3, y, y + h, z - 0.72, z - 0.66));
      for (let x = -2.3; x <= 2.31; x += 0.92) parts.push([box(x - 0.045, x + 0.045, y, y + h, z - 0.66, z - 0.56), GOLDF]);
      for (const yy of [y, y + h * 0.5, y + h]) parts.push([box(-2.36, 2.36, yy - 0.05, yy + 0.05, z - 0.66, z - 0.56), GOLDF]);
      parts.push([box(-2.45, 2.45, y - 0.18, y - 0.06, z - 0.66, z - 0.5), '#f4efe4']);
    }
    // the ground entry (I11 blue rectangle; C09): the glass gate across the way's mouth, recessed under the lintel, the
    // MAIN BLOCK sign on the lintel, the low steps, the planters
    parts.push([box(-3.2, 3.2, 3.0, 3.6, z - 0.95, z - 0.7), CREAM], [box(-3.2, -CW, 0, 3.0, z - 0.95, z - 0.7), CREAM], [box(CW, 3.2, 0, 3.0, z - 0.95, z - 0.7), CREAM]);
    { const g = glassGate(2 * CW, 2.95); placed(g.p, g.gl, 0, z - 2.5, 0); parts.push(...g.p); k.glass.push(...g.gl); }
    parts.push([box(-CW, CW, 0, 0.06, z - 2.5, z - 0.7), '#d9cdb5'], [box(-2.4, 2.4, 0, 0.1, z - 0.7, z + 0.6), '#d9cdb5']);
    k.signs.push({ text: 'MAIN BLOCK', x: 0, y: 3.32, z: z - 0.68, ry: 0, w: 2.2, colors: ['#f4f1ea', '#203a78'] });
    for (const x of [-2.4, 2.4]) parts.push([new THREE.CylinderGeometry(0.35, 0.3, 0.5, 12).translate(x, 0.25, z - 0.2), '#b0583a']);
    wallSolids(...W(-3.2, z - 0.8), ...W(-CW - 0.1, z - 0.8), 0.2); wallSolids(...W(CW + 0.1, z - 0.8), ...W(3.2, z - 0.8), 0.2);
    // the pediment over the column pairs (R08, R03, R18): a pale pentagon (short upright sides, a peak), on it a white
    // semicircular band carrying EVANDY letter by letter along its curve, UG and HALL at the band's two feet, the
    // shaded half-round recess inside the band; drawn as one picture on the pediment's face, the solid behind it
    const pw = 4.1, pu = 1.4, ph = 4.3, zp = z - 0.3;
    const pent = new THREE.Shape([new THREE.Vector2(-pw, 0), new THREE.Vector2(pw, 0), new THREE.Vector2(pw, pu), new THREE.Vector2(0, ph), new THREE.Vector2(-pw, pu)]);
    parts.push([new THREE.ExtrudeGeometry(pent, { depth: 0.6, bevelEnabled: false }).translate(0, t, zp - 0.6), CREAM]);
    parts.push([strip([[-pw - 0.1, zp + 0.06], [pw + 0.1, zp + 0.06]], t - 0.2, t, 0.12), '#f5efe2']);
    { const W = 1024, H = Math.round((1024 * ph) / (2 * pw)), sx = W / (2 * pw), cx = W / 2, by = H - 2;
      const tex = canvas(W, H, (g) => {
        g.clearRect(0, 0, W, H);
        g.beginPath(); g.moveTo(0, by); g.lineTo(W, by); g.lineTo(W, by - pu * sx); g.lineTo(cx, by - ph * sx); g.lineTo(0, by - pu * sx); g.closePath();
        g.fillStyle = '#efe6d2'; g.fill(); g.strokeStyle = '#f7f2e6'; g.lineWidth = 10; g.stroke();
        const R0 = 2.05 * sx, R1 = 2.9 * sx, oy = by - 0.05 * sx;
        g.beginPath(); g.arc(cx, oy, R1, Math.PI, 0); g.arc(cx, oy, R0, 0, Math.PI, true); g.closePath(); g.fillStyle = '#fbf8f1'; g.fill();
        g.lineWidth = 4; g.strokeStyle = 'rgba(150,135,110,0.5)'; g.beginPath(); g.arc(cx, oy, R1, Math.PI, 0); g.stroke(); g.beginPath(); g.arc(cx, oy, R0, Math.PI, 0); g.stroke();
        const gr = g.createLinearGradient(0, oy - R0, 0, oy); gr.addColorStop(0, '#d6c9ad'); gr.addColorStop(1, '#efe6d2');
        g.beginPath(); g.arc(cx, oy, R0 - 6, Math.PI, 0); g.closePath(); g.fillStyle = gr; g.fill();
        g.beginPath(); g.arc(cx, oy, 1.55 * sx, Math.PI, 0); g.strokeStyle = '#f6f0e3'; g.lineWidth = 14; g.stroke();
        g.fillStyle = '#1f4fb0'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 ${Math.round(0.62 * sx)}px Sora, system-ui, sans-serif`;
        const Rm = (R0 + R1) / 2, letters = 'EVANDY';
        letters.split('').forEach((ch, i) => { const a = Math.PI * (0.78 - (i * 0.56) / (letters.length - 1)); g.save(); g.translate(cx + Math.cos(a) * Rm, oy - Math.sin(a) * Rm); g.rotate(Math.PI / 2 - a); g.fillText(ch, 0, 0); g.restore(); });
        g.font = `700 ${Math.round(0.4 * sx)}px Sora, system-ui, sans-serif`;
        for (const [txt, a] of [['UG', Math.PI * 0.91], ['HALL', Math.PI * 0.095]] as [string, number][]) { g.save(); g.translate(cx + Math.cos(a) * Rm, oy - Math.sin(a) * Rm); g.rotate(Math.PI / 2 - a); g.fillText(txt, 0, 0); g.restore(); }
      });
      const face = new THREE.Mesh(new THREE.PlaneGeometry(2 * pw, ph).translate(0, t + ph / 2, zp + 0.02), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5, roughness: 0.85 }));
      face.userData.noCollide = true; k.meshes.push(face); }
    // the column capitals under the pediment
    for (const x of [-3.5, -2.85, 2.85, 3.5]) parts.push([box(x - 0.36, x + 0.36, t - 0.25, t, z - 0.71, z + 0.01), '#f5efe2']);
    k.plain.push(...parts);
    mergeMeshes(k);
  },
};

// ---------- the main block's east range: the side facing Bani (the audit's C12, I13 BLUE) ----------
// The owner (I13): this is MAIN BLOCK's side toward Bani, the blue arrows; the red-arrow end opposite (the west end and
// its junctions above) is already corrected and is not touched here. I03 shows a pale flat-roofed range along the east
// ends of the wings, joining them past the east link, its outer face gently faceted; I13 its elevation: long
// horizontal opening bands, pale wall between, structural piers spanning them, four tiers. Bay counts, rails and door
// positions behind the bands are not resolved by the aerial and are provisional (one pier about every 4.2 m).
const ER0: P2 = [642, -1246];
const eastRange: Spec = {
  name: 'Evandy main block east range', axis: [1, 0], origin: ER0, storey: ST, style: PLAIN, roofColor: '#c4633a', fascia: '#efe7d6', pitch: 0.42,
  blocks: [],
  keep: [[-5, 5, -26, 25]],
  extras: (k) => {
    const L = EAST_RANGE.map(([x, z]) => [x - ER0[0], z - ER0[1]] as P2), p: Part[] = [], tw = 0.4 + 4 * ST, fy = (fl: number) => 0.4 + fl * ST;
    p.push([prism(L, 0, tw), CREAM], [prism(L, tw, tw + 0.2), '#d3cec2']);
    const outer = L.slice(0, 6);
    for (const run of [outer, [L[12], L[0]], [L[5], L[6]]]) p.push([strip(run, tw, tw + 0.9, 0.12), '#efe8d8'], [strip(run, tw + 0.9, tw + 0.98, 0.16), '#dcd3c0']);
    // the outer face, facet by facet (outside on the right going north)
    for (let i = outer.length - 1; i > 0; i--) onFace(k, outer[i], outer[i - 1], (fk, len) => {
      const q: Part[] = [], n = Math.max(1, Math.round(len / 4.2)), b = len / n, pier = 0.55;
      const holes: [number, number, number, number, boolean, string?][] = [];
      for (let j = 0; j < n; j++) {
        const u0 = j * b + pier / 2, u1 = (j + 1) * b - pier / 2;
        // the upper tiers: a long opening over a solid parapet, the gallery's back wall in shade behind
        for (let fl = 1; fl < 4; fl++) holes.push([u0, u1, fy(fl) + 1.0, fy(fl) + 2.65, false, '#8d8475']);
        // the ground: a grilled window in each bay
        holes.push([u0 + 0.5, u1 - 0.5, 1.0, 2.5, false, '#3b3833']);
      }
      skinZ(q, 0, -1, 0, len, tw, 0.6, holes);
      for (let j = 0; j < n; j++) {
        const u0 = j * b + pier / 2, u1 = (j + 1) * b - pier / 2, um = (u0 + u1) / 2;
        // behind each band the rooms' doors and louvred windows (R07: tan-framed louvres), the soffit's light
        for (let fl = 1; fl < 4; fl++) { const y = fy(fl); q.push([box(-0.04, 0, y + 0.1, y + 2.3, um - 0.95, um - 0.15), '#5b4632']); louvreWin(q, um + 0.75, y + 1.1, 0.9, 1.2); }
        for (let u = u0 + 0.62; u < u1 - 0.5; u += 0.13) q.push([box(-0.34, -0.31, 1.0, 2.5, u - 0.012, u + 0.012), '#6b625a']);
      }
      // the floor lines standing out a little past the skin
      for (let fl = 1; fl < 5; fl++) q.push([box(-0.68, -0.6, fy(fl) - 0.12, fy(fl) + 0.08, 0, len), '#f3eee3']);
      fk.plain.push(...q);
    });
    // the court faces between the wings and the ends: a louvred window a floor
    for (const [a, b] of [[L[8], L[7]], [L[10], L[9]], [L[12], L[11]], [L[0], L[12]], [L[6], L[5]]] as [P2, P2][]) onFace(k, a, b, (fk, len) => { const q: Part[] = []; for (let fl = 0; fl < 4; fl++) louvreWin(q, len / 2, fy(fl) + 1.0, 0.9, 1.3); fk.plain.push(...q); });
    for (let i = 0; i < EAST_RANGE.length; i++) { const a = EAST_RANGE[i], b = EAST_RANGE[(i + 1) % EAST_RANGE.length]; wallSolids(a[0], a[1], b[0], b[1], 0.3); }
    k.plain.push(...p);
    mergeMeshes(k);
  },
};

// ---------- Annex A's central tank-bearing connection (the audit's C04, C05) ----------
/** a piecewise line through points sorted by x, at x */
const along = (pts: P2[], x: number) => { for (let i = 1; i < pts.length; i++) if (x <= pts[i][0] || i === pts.length - 1) { const [ax, az] = pts[i - 1], [bx, bz] = pts[i]; return az + ((bz - az) * (x - ax)) / (bx - ax); } return pts[0][1]; };
/** the facing edges of A's two bent bars (their mapped outlines): the south bar's north edge, the north bar's south edge */
// (from the wings' fitted boxes, which their models stand on, carried 0.25 m into the bars so no slit shows)
const wfit = (id: string) => fit(WINGS.find((w) => w.id === id)!.quad);
const edgeOf = (ids: string[], side: 'z0' | 'z1', into: number): P2[] => ids.flatMap((id) => { const f = wfit(id), v = f[side] + (side === 'z0' ? into : -into); return [wpt(f, f.x0, v), wpt(f, f.x1, v)]; }).sort((a, b) => a[0] - b[0]);
const A_S = edgeOf(['upper-s-w', 'upper-s-e'], 'z0', 0.25), A_N = edgeOf(['upper-n-w', 'upper-n-e'], 'z1', 0.25);
const AD0: P2 = [613.5, -1304.5];
/** the south bar's court face where its two arms meet (the entrance, provisional: below) */
const ASE = wfit('upper-s-e'), A_V = wpt(ASE, ASE.x0, ASE.z1), A_E = wpt(ASE, ASE.x1, ASE.z1);
/** the entrance along that face from its fitted corner (east of where the west arm's box stands in front of it), and
 *  the line west of which the face's balcony bay gives way to it */
const A_GATE_T = 5.0;
const A_GATE_X = 620.5;
const aDeck: Spec = {
  name: 'Evandy Annex A tank connection', axis: [1, 0], origin: AD0, storey: ST, style: PLAIN, roofColor: '#c4633a', fascia: '#efe7d6', pitch: 0.42,
  blocks: [],
  keep: [[-11, 11, -7, 6], [2, 6, 13, 19]],
  extras: (k) => {
    const { x0, x1 } = A_DECK, l = ([x, z]: P2): P2 => [x - AD0[0], z - AD0[1]], p: Part[] = [], fy = (fl: number) => 0.4 + fl * ST;
    // the connection between the bars (I03): their facing edges from x0 to x1, a storey under their eaves
    const inner = (pts: P2[]) => pts.filter(([x]) => x > x0 + 0.3 && x < x1 - 0.3);
    const poly = ([[x0, along(A_S, x0)], ...inner(A_S), [x1, along(A_S, x1)], [x1, along(A_N, x1)], ...inner(A_N).reverse(), [x0, along(A_N, x0)]] as P2[]).map(l);
    const nS = 2 + inner(A_S).length;
    p.push([prism(poly, 0, DECK), CREAM], [prism(poly, DECK - 0.02, DECK + 0.08), '#cdc8bc']);
    for (const [a, b] of [[poly[0], poly[poly.length - 1]], [poly[nS - 1], poly[nS]]] as [P2, P2][]) p.push([strip([a, b], DECK, DECK + 0.85, 0.11), '#ece5d4'], [strip([a, b], DECK + 0.85, DECK + 0.92, 0.15), '#dcd3c0']);
    // the eight tanks, two rows of four across the gap (I03)
    for (const [x, row] of A_TANKS) { const zc = (along(A_S, x) + along(A_N, x)) / 2; tank(p, x - AD0[0], zc + (row ? 1.0 : -1.0) - AD0[1], 0.85, DECK + 0.08); }
    // its two open ends (to the west and east parts of the gap): a louvred window a floor
    for (const [a, b] of [[poly[poly.length - 1], poly[0]], [poly[nS - 1], poly[nS]]] as [P2, P2][]) onFace(k, a, b, (fk, len) => { const q: Part[] = []; for (let fl = 0; fl < 3; fl++) louvreWin(q, len / 2, fy(fl) + 1.0, 0.9, 1.3); fk.plain.push(...q); });
    wallSolids(x0, along(A_S, x0), x0, along(A_N, x0), 0.3); wallSolids(x1, along(A_S, x1), x1, along(A_N, x1), 0.3);
    // Annex A's entrance (EV-014): the shared glass gate (I09, I10) with its ANNEX A sign over it. No photograph or mark
    // places it; it stands where the plan suggests, on the court face where the south bar's two arms meet, beside the
    // central connection (provisional: the owner to confirm or mark the door)
    onFace(k, l(A_V), l(A_E), (fk) => { const g = glassGate(2.4, 2.45, false); placed(g.p, g.gl, 0, A_GATE_T, -Math.PI / 2); fk.plain.push(...g.p); fk.glass.push(...g.gl); });
    { const L = Math.hypot(A_E[0] - A_V[0], A_E[1] - A_V[1]), dx = (A_E[0] - A_V[0]) / L, dz = (A_E[1] - A_V[1]) / L, nx = -dz, nz = dx;
      k.signs.push({ text: 'ANNEX A', x: A_V[0] + dx * A_GATE_T + nx * 0.17 - AD0[0], y: 3.2, z: A_V[1] + dz * A_GATE_T + nz * 0.17 - AD0[1], ry: Math.atan2(nx, nz), w: 1.9, colors: ['#f4efe4', '#5b3f8f'] }); }
    k.plain.push(...p);
    mergeMeshes(k);
  },
};

// ---------- the ancillary buildings by the west yard (the audit's C14-C17; the owner's locator I04) ----------
// I04 (the game, the owner's marks): BLUE, the plain building of I05, and VIOLET, the veranda building of I06, stand
// side by side north of the Tropiks block, their enclosed bodies aligned and touching, only I06's veranda coming
// forward; the RED arrows mark the building by the basketball slab (map outline #17) to be replaced by a low
// market-style building (I07 as a template, I08 the real covered aisle): one storey, a walk-through centre, enclosed
// sides with louvred windows, no blue awning. Dimensions are from the photographs' proportions (not measured).
const AN0: P2 = [520, -1252];
/** the two bodies (world): their common front line, the joint between them; the veranda's depth */
const ANC = { x0: 517.4, xf: 523.6, zS: -1221.6, zJ: -1229.1, zN: -1238.2, ver: 2.3 };
let LATTICE: THREE.MeshStandardMaterial | null = null;
/** the terracotta lattice of I06: diagonal strips crossing in open diamonds (cut out, the shade shows through) */
const latticeMat = () => (LATTICE ??= new THREE.MeshStandardMaterial({ roughness: 0.9, alphaTest: 0.5, side: THREE.DoubleSide, map: (() => { const t = canvas(128, 128, (g) => {
  g.clearRect(0, 0, 128, 128); g.strokeStyle = '#c47a4c'; g.lineWidth = 15; g.lineCap = 'square';
  for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64 + 128, 128); g.stroke(); g.beginPath(); g.moveTo(i * 64 + 128, 0); g.lineTo(i * 64, 128); g.stroke(); }
  g.strokeStyle = 'rgba(120,60,30,0.35)'; g.lineWidth = 3;
  for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 64 + 6, 0); g.lineTo(i * 64 + 134, 128); g.stroke(); }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })() }));
/** a louvred window on a face along z at x = at (out: its outward sign): the frame, its blades angled, a sill */
function louvreZ(p: Part[], at: number, out: number, zc: number, w: number, y0: number, h: number) {
  const X = (a: number, b: number) => [Math.min(at + out * a, at + out * b), Math.max(at + out * a, at + out * b)] as const;
  p.push([box(...X(0, 0.02), y0, y0 + h, zc - w / 2, zc + w / 2), '#2f3134'], [box(...X(0, 0.08), y0 - 0.08, y0, zc - w / 2 - 0.1, zc + w / 2 + 0.1), '#e2dccd']);
  for (const [a, b, c, d] of [[y0, y0 + h, zc - w / 2 - 0.06, zc - w / 2], [y0, y0 + h, zc + w / 2, zc + w / 2 + 0.06], [y0 + h, y0 + h + 0.06, zc - w / 2 - 0.06, zc + w / 2 + 0.06]]) p.push([box(...X(0, 0.07), a, b, c, d), '#d8d2c4']);
  for (let y = y0 + 0.07; y < y0 + h - 0.03; y += 0.1) p.push([new THREE.BoxGeometry(0.02, 0.07, w).rotateZ(out * 0.5).translate(at + out * 0.04, y, zc), '#8e9398']);
}
/** the same along x at z = at */
function louvreX(p: Part[], at: number, out: number, xc: number, w: number, y0: number, h: number) {
  const Z = (a: number, b: number) => [Math.min(at + out * a, at + out * b), Math.max(at + out * a, at + out * b)] as const;
  p.push([box(xc - w / 2, xc + w / 2, y0, y0 + h, ...Z(0, 0.02)), '#2f3134'], [box(xc - w / 2 - 0.1, xc + w / 2 + 0.1, y0 - 0.08, y0, ...Z(0, 0.08)), '#e2dccd']);
  for (const [a, b, c, d] of [[xc - w / 2 - 0.06, xc - w / 2, y0, y0 + h], [xc + w / 2, xc + w / 2 + 0.06, y0, y0 + h], [xc - w / 2 - 0.06, xc + w / 2 + 0.06, y0 + h, y0 + h + 0.06]]) p.push([box(a, b, c, d, ...Z(0, 0.07)), '#d8d2c4']);
  for (let y = y0 + 0.07; y < y0 + h - 0.03; y += 0.1) p.push([new THREE.BoxGeometry(w, 0.07, 0.02).rotateX(-out * 0.5).translate(xc, y, at + out * 0.04), '#8e9398']);
}
const ancillary: Spec = {
  name: 'Evandy ancillary buildings by the west yard', axis: [1, 0], origin: AN0, storey: 3.2, style: PLAIN, roofColor: '#9a4a2e', fascia: '#efe7d6', pitch: 0.3,
  replaces: [[520.3, -1279]],
  blocks: [],
  keep: [[ANC.x0 - AN0[0] - 1, ANC.xf + ANC.ver - AN0[0] + 1.5, ANC.zN - AN0[1] - 1, ANC.zS - AN0[1] + 1], [MKT.x0 - AN0[0] - 1, MKT.x1 - AN0[0] + 1, MKT.z0 - AN0[1] - 1, MKT.z1 - AN0[1] + 1]],
  extras: (k) => {
    const p: Part[] = [], X = (x: number) => x - AN0[0], Z = (z: number) => z - AN0[1];
    const { x0, xf, zS, zJ, zN, ver } = ANC, h = 3.2;
    // the two enclosed bodies, one wall line (cream render, a grey plinth)
    for (const [za, zb] of [[zJ, zS], [zN, zJ]]) p.push([box(X(x0), X(xf), 0, h, Z(za), Z(zb)), '#efe4cc'], [box(X(x0) - 0.03, X(xf) + 0.03, 0, 0.3, Z(za) - 0.03, Z(zb) + 0.03), '#a9a39a']);
    p.push([box(X(xf) - 0.02, X(xf) + 0.04, 0.3, h, Z(zJ) - 0.04, Z(zJ) + 0.04), '#d9cdb3']);
    // BLUE (I05), its front read left to right (south to north): the carved timber double door on dark steps, a broad
    // grilled window, a smaller grilled window; the low corrugated roof falling to the front over a pale fascia
    { const f = X(xf), door = (zc: number) => {
        p.push([box(f, f + 0.06, 0.32, 2.45, Z(zc) - 0.78, Z(zc) + 0.78), '#e9dfc8'], [box(f + 0.02, f + 0.07, 0.36, 2.35, Z(zc) - 0.68, Z(zc) + 0.68), '#a8742e']);
        for (const s of [-1, 1]) for (const [y0, y1] of [[0.55, 1.35], [1.5, 2.2]]) p.push([box(f + 0.07, f + 0.09, y0, y1, Z(zc) + s * 0.36 - 0.24, Z(zc) + s * 0.36 + 0.24), '#8e5f24']);
        p.push([box(f + 0.07, f + 0.1, 0.36, 2.35, Z(zc) - 0.015, Z(zc) + 0.015), '#6b4419'], [box(f + 0.09, f + 0.12, 1.15, 1.35, Z(zc) - 0.1, Z(zc) - 0.07), '#c9b37a'], [box(f + 0.09, f + 0.12, 1.15, 1.35, Z(zc) + 0.07, Z(zc) + 0.1), '#c9b37a']);
        p.push([box(f, f + 0.55, 0, 0.3, Z(zc) - 0.9, Z(zc) + 0.9), '#45474a'], [box(f + 0.55, f + 0.95, 0, 0.15, Z(zc) - 0.9, Z(zc) + 0.9), '#45474a']); };
      const grilled = (zc: number, w: number, y0: number, hh: number) => {
        p.push([box(f, f + 0.05, y0, y0 + hh, Z(zc) - w / 2, Z(zc) + w / 2), '#2d2e30'], [box(f, f + 0.08, y0 - 0.08, y0, Z(zc) - w / 2 - 0.08, Z(zc) + w / 2 + 0.08), '#e6dccb']);
        for (let z = Z(zc) - w / 2 + 0.08; z < Z(zc) + w / 2; z += 0.11) p.push([box(f + 0.05, f + 0.08, y0, y0 + hh, z - 0.014, z + 0.014), '#4d4f52']);
        for (const y of [y0 + 0.03, y0 + hh - 0.03]) p.push([box(f + 0.05, f + 0.08, y - 0.03, y + 0.03, Z(zc) - w / 2, Z(zc) + w / 2), '#4d4f52']); };
      door(zS - 1.4); grilled(zS - 3.9, 2.0, 1.15, 1.15); grilled(zS - 6.0, 0.9, 1.25, 1.0);
      // the roof: corrugated sheet falling to the front, the pale fascia, its underside
      const rise = 0.45, ov = 0.5, X0 = X(x0) - 0.3, X1 = f + ov, Za = Z(zJ) + 0.02, Zb = Z(zS) + 0.3, ang = Math.atan2(rise, X1 - X0);
      p.push([new THREE.BoxGeometry(Math.hypot(X1 - X0, rise), 0.06, Zb - Za).rotateZ(-ang).translate((X0 + X1) / 2, h + rise / 2 + 0.08, (Za + Zb) / 2), '#b7b4ad']);
      for (let z = Za + 0.1; z < Zb; z += 0.18) p.push([new THREE.BoxGeometry(Math.hypot(X1 - X0, rise), 0.035, 0.05).rotateZ(-ang).translate((X0 + X1) / 2, h + rise / 2 + 0.12, z), '#a6a39c']);
      p.push([box(X1 - 0.06, X1, h - 0.1, h + 0.2, Za, Zb), '#f1ede4'], [box(f, X1, h - 0.02, h, Za, Zb), '#d7d2c6']);
      for (const zz of [zS, zJ]) wallSolids(x0, zz, xf, zz, 0.25);
      wallSolids(xf, zS, xf, zJ, 0.25); }
    // VIOLET (I06): the body on the same line, the veranda in front: terracotta lattice along its front and returned at
    // its end, slender pale posts, the low dark-brown fascia and the roof carried out over it, the dark glazing and
    // doors in the body's front behind it, a planting line at its foot; the blue service unit at its south end
    { const f = X(xf), fv = f + ver, za = Z(zN), zb = Z(zJ), H = 2.95;
      for (const zc of [zb - 1.5, zb - 3.6, zb - 6.6]) { p.push([box(f, f + 0.05, 0.9, 2.3, zc - 0.75, zc + 0.75), '#2a2c2f'], [box(f, f + 0.08, 0.84, 0.9, zc - 0.8, zc + 0.8), '#e6dccb']); k.glass.push(box(f + 0.03, f + 0.06, 0.95, 2.25, zc - 0.7, zc + 0.7)); p.push([box(f + 0.05, f + 0.08, 0.9, 2.3, zc - 0.02, zc + 0.02), '#3a3b3d']); }
      p.push([box(f, f + 0.05, 0.3, 2.35, zb - 5.3, zb - 4.4), '#3b2a20']);
      for (const zc of [zb - 2.55, zb - 5.65, zb - 7.8]) p.push([box(f + 0.02, f + 0.12, 2.45, 2.62, zc - 0.08, zc + 0.08), '#2b2b2b']);
      // the veranda floor and its kerb, the posts, the lattice screen (front and return), the roof
      p.push([box(f, fv, 0, 0.18, za, zb), '#c9c2b4']);
      const posts = [zb - 0.15, zb - 2.6, zb - 5.0, zb - 7.4, za + 0.15];
      for (const z of posts) { p.push([box(fv - 0.18, fv - 0.06, 0.18, H, z - 0.06, z + 0.06), '#e9e6df']); SOLIDS.add(AN0[0] + fv - 0.12, AN0[1] + z, 0.15); }
      const screen = (a: [number, number, number], b: [number, number, number], len: number, ry: number) => {
        const g = new THREE.PlaneGeometry(len, 1.05); const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len / 0.32, uv.getY(i) * 1.05 / 0.32);
        g.rotateY(ry).translate(...a); void b; const m = new THREE.Mesh(g, latticeMat()); m.castShadow = true; k.meshes.push(m); };
      const s0 = zb - 1.3, s1 = za + 0.1;
      screen([fv - 0.12, 0.18 + 0.525, (s0 + s1) / 2], [0, 0, 0], s0 - s1, Math.PI / 2);
      screen([(f + fv) / 2, 0.18 + 0.525, za + 0.08], [0, 0, 0], ver - 0.2, 0);
      p.push([box(fv - 0.17, fv - 0.07, 1.23, 1.3, s1, s0), '#b86e42'], [box(fv - 0.17, fv - 0.07, 0.18, 0.24, s1, s0), '#b86e42'], [box(f, fv - 0.07, 1.23, 1.3, za + 0.03, za + 0.13), '#b86e42']);
      for (let z = s1; z < s0; z += 0.6) SOLIDS.add(AN0[0] + fv - 0.12, AN0[1] + z, 0.2);
      // the roof: low, carried out over the veranda; the deep dark-brown fascia; the pale soffit
      const rt = H + 0.35, X0 = X(x0) - 0.3, X1 = fv + 0.25, ang = Math.atan2(0.4, X1 - X0);
      p.push([new THREE.BoxGeometry(Math.hypot(X1 - X0, 0.4), 0.07, zb - za + 0.5).rotateZ(-ang).translate((X0 + X1) / 2, rt + 0.2, (za + zb) / 2), '#7a3a26']);
      p.push([box(X1 - 0.08, X1, H - 0.05, rt + 0.05, za - 0.25, zb + 0.25), '#5a2c1e'], [box(X1 - 0.6, X1, H + 0.15, H + 0.38, za - 0.25, za + 0.05), '#5a2c1e'], [box(f, X1 - 0.08, H - 0.04, H, za, zb), '#ede8de']);
      p.push([box(X(x0) - 0.05, f, h, H + 0.3, za, zb), '#efe4cc']);
      // the base planting before the screen
      for (let z = s1 + 0.5; z < s0; z += 1.4) p.push([new THREE.IcosahedronGeometry(0.32 + ((z * 7) % 1) * 0.1, 0).scale(1, 0.8, 1).translate(fv + 0.3, 0.28, z), z % 2 > 1 ? '#4f7a33' : '#5d8a3a']);
      // the blue service unit (I06's far left; equipment, not the omitted awning)
      p.push([new THREE.CylinderGeometry(0.42, 0.42, 1.05, 16).translate(f + 0.55, 0.62, zb - 0.6), '#2f62b0'], [box(f + 0.15, f + 0.95, 0, 0.1, zb - 1.0, zb - 0.2), '#9b978f']);
      wallSolids(x0, zN, xf, zN, 0.25); wallSolids(x0, zN, x0, zS, 0.25);
    }
    // the market-style building (C15, C16): two enclosed halves under one low roof, the open aisle through the middle
    // (I07's blue rectangle; I08's covered walk), louvred windows in the outer walls, the units' doors on the aisle; no
    // upper storey, no blue awning
    { const { x0: mx0, x1: mx1, z0: mz0, z1: mz1, aisle } = MKT, zc = (mz0 + mz1) / 2, eave = 3.0, ridge = 4.3, ov = 0.6;
      for (const [za, zb, out] of [[mz0, zc - aisle, -1], [zc + aisle, mz1, 1]] as [number, number, number][]) {
        p.push([box(X(mx0), X(mx1), 0, eave, Z(za), Z(zb)), '#efe9dc'], [box(X(mx0) - 0.03, X(mx1) + 0.03, 0, 0.35, Z(za) - 0.03, Z(zb) + 0.03), '#9c9890']);
        // the outer long wall: louvred windows; the ends: one each
        const zo = out < 0 ? Z(za) : Z(zb);
        for (const xm of [X(mx0) + 1.9, X(mx0) + 5.55, X(mx1) - 1.9]) louvreX(p, zo, out, xm, 1.3, 1.1, 1.2);
        for (const [xe, o] of [[X(mx0), -1], [X(mx1), 1]] as [number, number][]) louvreZ(p, xe, o, (Z(za) + Z(zb)) / 2, 1.2, 1.1, 1.2);
        // the units' doors on the aisle, three a side (I08: repeated units off the walk)
        const zi = out < 0 ? Z(zb) : Z(za), oi = -out;
        for (const xm of [X(mx0) + 1.85, X(mx0) + 5.55, X(mx1) - 1.85]) {
          p.push([box(xm - 0.55, xm + 0.55, 0.05, 2.3, Math.min(zi, zi + oi * 0.04), Math.max(zi, zi + oi * 0.04)), '#4a3a2c'], [box(xm - 0.65, xm + 0.65, 2.3, 2.4, Math.min(zi, zi + oi * 0.06), Math.max(zi, zi + oi * 0.06)), '#e2dccd']);
        }
        wallSolids(mx0, za, mx1, za, 0.25); wallSolids(mx0, zb, mx1, zb, 0.25); wallSolids(mx0, za, mx0, zb, 0.25); wallSolids(mx1, za, mx1, zb, 0.25);
      }
      // the aisle: its screed floor, the roof over it all (ridge along the aisle), its timber underside and rafters
      p.push([box(X(mx0) - 0.4, X(mx1) + 0.4, 0, 0.06, Z(zc - aisle), Z(zc + aisle)), '#cfc9bc']);
      { const R = (mz1 - mz0) / 2, D = ridge - eave, run = R + ov, drop = (D * run) / R, len = Math.hypot(run, drop), ang = Math.atan2(D, R);
        for (const s of [-1, 1]) {
          const zm = Z(zc) + (s * run) / 2, ym = ridge - drop / 2 + 0.06;
          p.push([new THREE.BoxGeometry(mx1 - mx0 + 2 * ov, 0.08, len).rotateX(s * ang).translate(X((mx0 + mx1) / 2), ym, zm), '#9a4a2e']);
          for (let x = mx0 + 0.4; x < mx1; x += 1.2) p.push([new THREE.BoxGeometry(0.08, 0.12, len).rotateX(s * ang).translate(X(x), ym - 0.1, zm), '#4a3526']);
        } }
      for (const x of [mx0, mx1]) p.push([tri2([X(x), eave, Z(mz0)], [X(x), eave, Z(mz1)], [X(x), ridge, Z(zc)]), '#efe9dc'], [tri2([X(x), eave, Z(mz1)], [X(x), eave, Z(mz0)], [X(x), ridge, Z(zc)]), '#efe9dc']);
      // (the gable ends stand over the aisle's mouths: openings there under a beam)
      for (const x of [mx0, mx1]) p.push([box(X(x) - 0.12, X(x) + 0.12, eave - 0.3, eave, Z(zc - aisle), Z(zc + aisle)), '#4a3526']);
      PASSAGES.push([mx0 - 1, mx1 + 1, zc - aisle + 0.15, zc + aisle - 0.15]);
    }
    k.plain.push(...p);
    mergeMeshes(k);
  },
};

// ---------- the pink-roof ring ----------
/** the ring's south face behind its skin (the owner's eight-pair brief, pair 4): plain wall, the skin builds the depth */
const RING_BLANK: Style = { bay: 6, up: [], ground: [], draw: (g) => { g.fillStyle = '#ebe8df'; g.fillRect(0, 0, 256, 512); } };
/** the ring's south face (pair 4, R04, read left to right from the west end; 0.0305 m to a pixel, from the storey
 *  height): a 0.4 m skin of white wall standing in front of the wall plane, so that the openings and the yellow strips
 *  are real recesses. S solid, O a wide opening (upper floors: a recessed opening over a solid parapet, an inner grille
 *  window behind; ground floor: a large grilled window), P the pier pairing two openings, Y a yellow recessed strip, C
 *  the white service strip with two small square vents a floor and a pipe, E the end section of small windows and a
 *  wider grilled one. R04 covers the west 28.5 m; the rest of the face (unseen) repeats it mirrored (provisional). */
const RING_FACE: [string, number][] = [['S', 3.05], ['O', 3.05], ['Y', 1.2], ['O', 2.9], ['S', 1.37], ['C', 2.3], ['S', 1.37], ['O', 2.9], ['P', 0.45], ['O', 2.75], ['S', 1.07], ['Y', 1.22], ['E', 4.9]];
function ringSouth(k: Kit, x0: number, x1: number, zf: number) {
  const prog = [...RING_FACE, ...RING_FACE.slice(0, -1).reverse()], sum = prog.reduce((a, [, w]) => a + w, 0);
  const pad = x1 - x0 - sum, T = 0.4, tf = top(RING.floors) - 0.4, W = '#f1efe8', Y = '#e6b941', p: Part[] = [];
  const grille = (a: number, b: number, y0: number, y1: number, z: number) => {
    p.push([box(a, b, y0, y1, z, z + 0.04), '#3b3a38']);
    for (let x = a + 0.12; x < b; x += 0.14) p.push([box(x - 0.015, x + 0.015, y0, y1, z + 0.04, z + 0.07), '#6b625a']);
    for (const y of [y0 + (y1 - y0) * 0.5]) p.push([box(a, b, y - 0.02, y + 0.02, z + 0.04, z + 0.07), '#6b625a']);
  };
  let u = x0;
  for (const [i, [t, w0]] of prog.entries()) {
    const w = w0 + (i === prog.length - 1 ? pad : 0), a = u, b = u + w; u = b;
    if (t === 'Y') { p.push([box(a, b, 0.3, tf, zf, zf + 0.03), Y]); continue; }
    if (t === 'S' || t === 'P' || t === 'C' || t === 'E') {
      p.push([box(a, b, 0, tf, zf, zf + T), W]);
      for (let f = 0; f < RING.floors; f++) {
        const y = 0.4 + f * ST;
        if (t === 'C') for (const x of [a + 0.35, b - 0.8]) p.push([box(x, x + 0.45, y + 1.6, y + 2.05, zf + T, zf + T + 0.02), '#4a4744']);
        if (t === 'E' && f) { for (const x of [a + 0.3, a + 1.05]) grille(x, x + 0.55, y + 1.2, y + 2.1, zf + T); grille(a + 2.2, b - 0.5, y + 1.0, y + 2.1, zf + T); }
      }
      if (t === 'C') p.push([new THREE.CylinderGeometry(0.06, 0.06, tf, 6).translate((a + b) / 2, tf / 2, zf + T + 0.1), '#e2ded4']);
      if (t === 'E') {
        // (the owner's notes on pair 4: the block's entrance is here, at the ground of the middle section, and its
        // black polytanks stand on the roof above it)
        const m = (a + b) / 2;
        // (the audit, EV-015: the shared annex glass gate of I09 and I10 in its doorway, the ANNEX B sign over the canopy)
        { const g = glassGate(2.5, 2.3, false); placed(g.p, g.gl, m, zf + T + 0.02, 0, 0.3); p.push(...g.p); k.glass.push(...g.gl); }
        k.signs.push({ text: 'ANNEX B', x: m, y: 3.3, z: zf + T + 0.04, ry: 0, w: 1.9, colors: ['#f4efe4', '#5b3f8f'] });
        p.push([box(m - 1.4, m + 1.4, 2.75, 2.9, zf + T, zf + T + 1.2), '#efede6'], [box(m - 1.3, m + 1.3, 0, 0.3, zf + T, zf + T + 1.0), '#d9d4c8'], [box(m - 1.3, m + 1.3, 0, 0.15, zf + T + 1.0, zf + T + 1.4), '#d9d4c8']);
        for (const x of [a + 0.3, a + 1.05]) grille(x, x + 0.55, 1.6, 2.5, zf + T);
        const yt = top(RING.floors) + 1.2, zt = zf - 3.0;
        p.push([box(m - 1.9, m + 1.9, yt - 1.4, yt, zt - 1.0, zt + 1.0), '#d8d3c8']);
        for (const x of [m - 0.85, m + 0.85]) { p.push([new THREE.CylinderGeometry(0.72, 0.72, 1.6, 18).translate(x, yt + 0.8, zt), '#1c1d20'], [new THREE.CylinderGeometry(0.25, 0.25, 0.15, 12).translate(x, yt + 1.67, zt), '#1c1d20']); }
      }
      continue;
    }
    // O: the skin round the opening, floor by floor
    for (let f = 0; f < RING.floors; f++) {
      const y = 0.4 + f * ST, s0 = f ? y + 1.0 : y + 0.9, s1 = f ? y + 2.45 : y + 2.4, yb = f ? y : 0;
      p.push([box(a, b, yb, s0, zf, zf + T), W], [box(a, b, s1, y + ST, zf, zf + T), W]);
      grille(a + 0.15, b - 0.15, s0, s1, f ? zf + 0.02 : zf + 0.15);
      // the reveals' shade at the head of a recessed opening
      if (f) p.push([box(a, b, s1 - 0.04, s1, zf, zf + T - 0.02), '#cfcac0']);
    }
    p.push([box(a, b, 0.4 + RING.floors * ST, tf, zf, zf + T), W]);
  }
  k.plain.push(...p);
}
const [ro0, ro1, rz0, rz1] = RING.outer, [rc0, rc1, rcz0, rcz1] = RING.court;
const ring: Spec = {
  name: 'Pink-roof courtyard block by Evandy', axis: [1, 0], origin: [(ro0 + ro1) / 2, (rz0 + rz1) / 2], storey: ST, style: PLAIN, roofColor: RING.roof, fascia: '#efe7d6', pitch: 0.42,
  replaces: [[560, -1290]],
  blocks: (() => {
    const cx = (ro0 + ro1) / 2, cz = (rz0 + rz1) / 2, L = (x: number) => x - cx, M = (z: number) => z - cz;
    return [
      // (the audit, C06, C07: the north range in two halves either side of the narrow lower strip that carries tanks, I03)
      { x0: L(ro0), x1: L(B_SEAM.x0), z0: M(rz0), z1: M(rcz0), floors: RING.floors },
      { x0: L(B_SEAM.x1), x1: L(ro1), z0: M(rz0), z1: M(rcz0), floors: RING.floors },
      { x0: L(B_SEAM.x0), x1: L(B_SEAM.x1), z0: M(rz0), z1: M(rcz0), floors: RING.floors - 1, roof: 'flat' as const },
      { x0: L(ro0), x1: L(ro1), z0: M(rcz1), z1: M(rz1), floors: RING.floors, faces: { z1: RING_BLANK } },
      { x0: L(ro0), x1: L(rc0), z0: M(rcz0), z1: M(rcz1), floors: RING.floors, roof: 'crossZ' as const },
      { x0: L(rc1), x1: L(ro1), z0: M(rcz0), z1: M(rcz1), floors: RING.floors, roof: 'crossZ' as const },
    ];
  })(),
  keep: [],
  extras: (k) => {
    const cx = (ro0 + ro1) / 2, cz = (rz0 + rz1) / 2;
    flatPlaneLocal(k, [[rc0 - cx, rcz0 - cz], [rc1 - cx, rcz0 - cz], [rc1 - cx, rcz1 - cz], [rc0 - cx, rcz1 - cz]], 0.05, gravelMat(), cx, cz);
    ringSouth(k, ro0 - cx, ro1 - cx, rz1 - cz);
    // the tanks along B's seams (I03): on the north strip's flat roof; along the line where the south range meets the
    // west and east ranges, on a slab in the roofs' valley there (its level is not resolved by the top view)
    const p: Part[] = [], strip3 = k.wallTop(RING.floors - 1) + 0.2, eave = k.wallTop(RING.floors);
    for (const [x, z] of B_TANKS) {
      const onStrip = x > B_SEAM.x0 - 0.5 && x < B_SEAM.x1 + 0.5;
      if (!onStrip) p.push([box(x - cx - 1.2, x - cx + 1.2, eave - 0.1, eave + 0.12, z - cz - 1.15, z - cz + 1.15), '#cfc9bc']);
      tank(p, x - cx, z - cz, 0.85, onStrip ? strip3 : eave + 0.12);
    }
    k.plain.push(...p);
    mergeMeshes(k);
  },
};
function flatPlaneLocal(k: Kit, pts: P2[], y: number, mat: THREE.Material, ox: number, oz: number) {
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)))).rotateX(-Math.PI / 2).translate(0, y, 0);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + ox) / 3, (p.getZ(i) + oz) / 3);
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.userData.noCollide = true; k.meshes.push(m);
}

// ---------- the commercial block ----------
const sf = fit(SHOPS.quad);
/** the commercial block's plain sides and back (R11, P05: blank cream walls, no windows) */
const SHOP_BLANK: Style = { bay: 6, up: [], ground: [], draw: (g) => { g.fillStyle = '#efe6d2'; g.fillRect(0, 0, 256, 512); speckle(g, 0, 0, 256, 512, 700, ['#e9dfca', '#f3ebd9']); g.fillStyle = 'rgba(150,130,100,0.25)'; g.fillRect(0, 300, 256, 2); } };
/** its front behind the walkway and the gallery: shopfronts with folding grilles below, the gallery's glazing above */
const SHOP: Style = {
  bay: 4, up: [[30, 40, 196, 170]], ground: [[30, 50, 196, 180]],
  draw: (g) => {
    g.fillStyle = '#f1e2b5'; g.fillRect(0, 0, 256, 512);
    // (the owner's eight-pair brief, R08: the upper gallery a deep shaded corridor; the rooms' doors and windows at its
    // back, not a glass front)
    g.fillStyle = '#7d7466'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#5c554b'; g.fillRect(0, 0, 256, 60);
    g.fillStyle = '#3d3027'; g.fillRect(30, 70, 62, 180);
    window_(g, [120, 100, 100, 90], '#d9cfba', 2, 0);
    g.fillStyle = '#37393c'; g.fillRect(26, 300, 204, 196);
    g.fillStyle = '#b39a5e'; for (let x = 30; x < 228; x += 9) g.fillRect(x, 300, 3, 196);
    for (let y = 312; y < 496; y += 30) { g.fillStyle = 'rgba(179,154,94,0.8)'; for (let x = 30; x < 228; x += 18) { g.fillRect(x, y, 9, 2); g.fillRect(x + 9, y + 15, 9, 2); } }
    g.fillStyle = '#efe6d2'; g.fillRect(0, 0, 10, 512); g.fillRect(246, 0, 10, 512);
  },
};
const shops: Spec = {
  name: 'Evandy commercial block', axis: sf.axis, origin: sf.c, storey: 3.3, style: SHOP_BLANK, roofColor: '#c4633a', fascia: '#efe7d6', pitch: 0.45,
  replaces: [sf.c],
  // the ground floor set back 2.4 m behind the walkway; the main roof is built here (gable ends, R11, P05)
  blocks: [{ x0: sf.x0, x1: sf.x1, z0: sf.z0, z1: sf.z1 - 2.4, floors: 2, roof: 'none', faces: { z1: SHOP } }],
  keep: [],
  extras: (k) => {
    const z = sf.z1, zw = sf.z1 - 2.4, y1 = 0.4 + 3.3, t = 0.4 + 2 * 3.3 + 0.4, parts: Part[] = [];
    const Z0 = sf.z0 - 0.7, Z1 = z + 0.9, X0 = sf.x0 - 0.5, X1 = sf.x1 + 0.5, zr = (Z0 + Z1) / 2, rise = ((Z1 - Z0) / 2) * 0.45;
    // the raised walkway with its step, the gallery floor over it (cantilevered: no columns along it, R06, R13)
    parts.push([box(sf.x0, sf.x1, 0, 0.35, zw, z + 0.2), '#cfc2a6'], [box(sf.x0, sf.x1, 0, 0.18, z + 0.2, z + 0.6), '#cfc2a6']);
    parts.push([box(sf.x0, sf.x1, y1 - 0.3, y1, zw, z - 0.55), CREAM]);
    // the gallery's front: a solid white band at the floor, the light gold railing with its looped panels on it
    parts.push([box(sf.x0 + 0.1, sf.x1 - 0.1, y1 - 0.75, y1 + 0.35, z - 0.75, z - 0.55), '#f6f1e6']);
    parts.push([box(sf.x0 + 0.1, sf.x1 - 0.1, y1 + 1.05, y1 + 1.1, z - 0.68, z - 0.62), GOLD], [box(sf.x0 + 0.1, sf.x1 - 0.1, y1 + 0.4, y1 + 0.44, z - 0.68, z - 0.62), GOLD]);
    for (let x = sf.x0 + 0.1; x < sf.x1 - 0.1; x += 1.0) {
      parts.push([box(x - 0.025, x + 0.025, y1 + 0.35, y1 + 1.1, z - 0.68, z - 0.62), GOLD]);
      parts.push([new THREE.BoxGeometry(0.02, 0.85, 0.02).rotateZ(0.88).translate(x + 0.5, y1 + 0.75, z - 0.65), GOLD], [new THREE.BoxGeometry(0.02, 0.85, 0.02).rotateZ(-0.88).translate(x + 0.5, y1 + 0.75, z - 0.65), GOLD]);
      parts.push([new THREE.TorusGeometry(0.13, 0.015, 4, 10).translate(x + 0.5, y1 + 0.75, z - 0.65), GOLD]);
    }
    // the four round cream columns: two pairs at the centre, at the front edge of the walkway, in front of the gallery
    // band and the shopfronts, from the walkway up to the eaves
    for (const x of [-2.45, -1.75, 1.75, 2.45]) {
      parts.push([new THREE.CylinderGeometry(0.21, 0.23, t - 0.35, 14).translate(x, 0.35 + (t - 0.35) / 2, z - 0.1), '#f1e3b8'], [box(x - 0.3, x + 0.3, t - 0.25, t, z - 0.4, z + 0.2), '#f6f1e6']);
      const [wx, wz] = [sf.c[0] + x * sf.axis[0] - (z - 0.1) * sf.axis[1], sf.c[1] + x * sf.axis[1] + (z - 0.1) * sf.axis[0]]; SOLIDS.add(wx, wz, 0.3);
    }
    // the board between the column pairs on the gallery front (R13: a white board with a pink script name)
    k.signs.push({ text: 'Waffle', x: 0, y: y1 + 0.75, z: z - 0.5, ry: 0, w: 2.6, colors: ['#f4f0f2', '#b0336e'] });
    parts.push([box(-1.42, 1.42, y1 + 0.2, y1 + 1.3, z - 0.56, z - 0.52), '#6f6a6e']);
    // the main roof: one long gabled roof parallel to the front, carried out over the gallery; gable walls at the ends
    k.roof.c = new THREE.Color('#c4633a');
    k.roof.quad([X1, t, Z1], [X0, t, Z1], [X0, t + rise, zr], [X1, t + rise, zr]);
    k.roof.quad([X0, t, Z0], [X1, t, Z0], [X1, t + rise, zr], [X0, t + rise, zr]);
    for (const x of [sf.x0, sf.x1]) parts.push([tri2([x, t, sf.z0], [x, t, zw], [x, t + rise * 0.9, zr]), '#efe6d2'], [tri2([x, t, zw], [x, t, sf.z0], [x, t + rise * 0.9, zr]), '#efe6d2']);
    // the boarded cream soffit under the eaves, the fascia with its row of shallow arches between brackets (R06)
    parts.push([box(X0, X1, t - 0.08, t, zw, Z1), '#e7d7a8'], [box(X0, X1, t - 0.45, t, Z1 - 0.12, Z1), '#f3ece0']);
    // (R08: shallow arches under the eave between the gallery's posts: solid white spandrel panels with a segmental
    // arch cut out of each, the posts carrying them standing on the gallery front)
    for (let x = sf.x0 + 1.6; x < sf.x1 - 1.0; x += 3.2) {
      if (Math.abs(x) < 3.2) continue;
      const sp = new THREE.Shape([new THREE.Vector2(-1.6, 0), new THREE.Vector2(1.6, 0), new THREE.Vector2(1.6, 0.9), new THREE.Vector2(-1.6, 0.9)]);
      const hole = new THREE.Path(); hole.moveTo(-1.45, 0); hole.lineTo(1.45, 0); hole.absellipse(0, 0, 1.45, 0.55, 0, Math.PI, false); sp.holes.push(hole);
      parts.push([new THREE.ExtrudeGeometry(sp, { depth: 0.18, bevelEnabled: false, curveSegments: 10 }).translate(x, t - 0.9, z - 0.62), '#f6f1e6']);
    }
    for (let x = sf.x0 + 0.0; x < sf.x1 + 0.1; x += 3.2) { if (Math.abs(x) < 3.2) continue; parts.push([box(x - 0.11, x + 0.11, y1 + 0.35, t - 0.9, z - 0.66, z - 0.5), '#f6f1e6']); }
    // the central front gable over the column pairs: its roof slopes, the plain cream gable face with the arch springing
    // from the column pairs
    const gw = 3.1, gh = 2.4, zf = z + 0.5, zb = zr;
    k.roof.quad([-gw - 0.35, t, zf + 0.2], [-gw - 0.35, t, zb], [0, t + gh + 0.15, zb], [0, t + gh + 0.15, zf + 0.2]);
    k.roof.quad([gw + 0.35, t, zb], [gw + 0.35, t, zf + 0.2], [0, t + gh + 0.15, zf + 0.2], [0, t + gh + 0.15, zb]);
    parts.push([tri2([-gw, t, zf], [gw, t, zf], [0, t + gh, zf]), '#efe6d2'], [tri2([gw, t, zf], [-gw, t, zf], [0, t + gh, zf]), '#efe6d2']);
    const arch = new THREE.Shape([new THREE.Vector2(-gw, 0), new THREE.Vector2(gw, 0), new THREE.Vector2(gw, 2.6), new THREE.Vector2(-gw, 2.6)]);
    arch.holes.push(new THREE.Path().moveTo(-1.45, 0).lineTo(1.45, 0).lineTo(1.45, 0.9).absarc(0, 0.9, 1.45, 0, Math.PI, false).lineTo(-1.45, 0));
    parts.push([new THREE.ExtrudeGeometry(arch, { depth: 0.35, bevelEnabled: false }).translate(0, t - 2.6, zf - 0.35), '#f3ece0']);
    k.plain.push(...parts);
    mergeMeshes(k);
  },
};

// ---------- the frontage, the yard and the environs (a world-aligned frame) ----------
const site: Spec = {
  name: 'Evandy Hostel grounds', axis: [1, 0], origin: [0, 0], storey: 3, style: PLAIN, roofColor: '#c4633a', fascia: '#efe7d6', pitch: 0.42,
  // the mapped basketball pitch and the frontage parking are drawn here
  covers: [[522, -1258], ...PARKS.map((r) => [(r[0][0] + r[1][0]) / 2, (r[0][1] + r[2][1]) / 2] as P2)],
  replaces: [],
  blocks: [],
  keep: [[SITE.x0, SITE.x1, SITE.z0, SITE.zFence + 3.5], [FRAME.box[0] - 2, FRAME.box[1] + 2, FRAME.box[2] - 2, FRAME.box[3] + 2]],
  extras: (k) => {
    const parts: Part[] = [];
    // the circular-pattern paving over the compound and out to the road before the gate and the shops
    flatPlane(k, [[SITE.x0, SITE.z0], [SITE.x1, SITE.z0], [SITE.x1, SITE.zFence], [SITE.x0, SITE.zFence]], 0.05, discMat(), 6);
    flatPlane(k, [[SITE.gate[0] - 6, SITE.zFence], [647, SITE.zFence], [647, -1199.4], [SITE.gate[0] - 6, -1199.4]], 0.05, discMat(), 6);
    flatPlane(k, [[SITE.x0, SITE.zFence], [SITE.westMouth[1], SITE.zFence], [SITE.westMouth[1], -1199.4], [SITE.x0, -1199.4]], 0.05, discMat(), 6);
    // the dark grey hardstand before the administration block's porch and stair (pair 1, R01)
    flatPlane(k, [[527.3, -1222.5], [540, -1222.5], [540, -1203.2], [527.3, -1203.2]], 0.062, darkMat(), 4);
    // the west yard: grey gravel, red-earth patches along its edges, the green slab and its hoop
    const [gx0, gx1, gz0, gz1] = YARD.box;
    flatPlane(k, [[gx0, gz0], [gx1, gz0], [gx1, gz1], [gx0, gz1]], 0.06, gravelMat(), 3);
    // (the owner's eight-pair brief, pair 4: the yard is open hardstand; only the strip along the west wall keeps its earth)
    for (const [c, a, b] of [[[509, -1238], 2.4, 7]] as [P2, number, number][]) flatPlane(k, oval(c, a, b, 18), 0.07, soilMat(), 2);
    k.meshes.push(courtMesh(YARD.slab, 0.08));
    // the two hoops (the owner, 2026-10-17: a second at the south end), each over its painted basket (courtMesh: the
    // rim 1.575 m in from the baseline): the grey post just past the baseline, its arm, the white board, the rim
    { const f = fit(YARD.slab), vc = (f.z0 + f.z1) / 2;
      for (const s of [-1, 1]) {
        const u = s < 0 ? f.x0 + 2.075 : f.x1 - 2.075, [rx, rz] = wpt(f, u, vc), dx = s * f.axis[0], dz = s * f.axis[1], ry = Math.atan2(dx, dz);
        const at = (g: THREE.BufferGeometry) => g.rotateY(ry).translate(rx, 0, rz);
        parts.push([at(new THREE.CylinderGeometry(0.08, 0.1, 3.05, 8).translate(0, 1.52, 1.8)), '#5b6066'], [at(box(-0.06, 0.06, 2.9, 3.0, 0.39, 1.8)), '#5b6066'],
          [at(box(-0.9, 0.9, 2.9, 3.95, 0.33, 0.39)), '#f2f2f0'], [at(new THREE.TorusGeometry(0.23, 0.02, 4, 12).rotateX(Math.PI / 2).translate(0, 3.05, 0)), '#d8592c']);
        SOLIDS.add(rx + dx * 1.8, rz + dz * 1.8, 0.25);
      } }
    // the inner court (pair 7): open weathered hardstand, the circular pattern worn through to smoother grey repairs in
    // patches; no planted island
    for (const [c, a, b] of [[[600, -1276], 9, 4], [[622, -1272], 7, 3.5], [[585, -1279], 5, 2.6], [[575, -1215], 8, 2.5], [[628, -1210], 6, 2.2]] as [P2, number, number][]) flatPlane(k, oval(c, a, b, 22), 0.065, hardMat(), 3);
    // the oval planting islands in their pale kerbs (shrubs: buildEvandyGrounds)
    for (const { c, a, b } of ISLANDS) { parts.push([prism(oval(c, a, b), 0, 0.3), '#eeeae2']); parts.push([prism(oval(c, a - 0.2, b - 0.2), 0, 0.34), '#5a4535']); SOLIDS.add(c[0], c[1], Math.min(a, b)); for (const s of [-1, 1]) { SOLIDS.add(c[0] + s * (a - b) * 0.7, c[1], b); SOLIDS.add(c[0] + s * (a - 0.7), c[1], 0.75); } }
    // the fence along the road: low pale wall, square posts with caps, dark vertical bars with pointed tops; the
    // openings at the west lane and the gate
    const fence = (xa: number, xb: number) => {
      const z = SITE.zFence;
      parts.push([box(xa, xb, 0, 0.6, z - 0.15, z + 0.15), '#ebe4d4'], [box(xa, xb, 0.6, 0.66, z - 0.18, z + 0.18), '#dcd3c0']);
      const n = Math.max(1, Math.round((xb - xa) / 2.8));
      for (let i = 0; i <= n; i++) { const x = xa + ((xb - xa) * i) / n; parts.push([box(x - 0.22, x + 0.22, 0, 1.9, z - 0.22, z + 0.22), '#efe9dc'], [box(x - 0.27, x + 0.27, 1.9, 2.0, z - 0.27, z + 0.27), '#dcd3c0']); }
      for (let x = xa + 0.12; x < xb; x += 0.14) parts.push([box(x - 0.018, x + 0.018, 0.66, 1.75, z - 0.02, z + 0.02), '#4a3a2c'], [new THREE.ConeGeometry(0.035, 0.1, 4).translate(x, 1.8, z), '#4a3a2c']);
      for (const y of [0.85, 1.6]) parts.push([box(xa, xb, y - 0.025, y + 0.025, z - 0.03, z + 0.03), '#4a3a2c']);
      wallSolids(xa, z, xb, z, 0.3);
    };
    // (the owner's eight-pair brief, pairs 2-3: no fence before the Tropiks shopfront: it opens onto its forecourt)
    fence(SITE.westMouth[1], SITE.gate[0]);
    // the boundary walls on the other sides: west along the road, north, east
    const wallRun = (a: P2, b: P2) => { parts.push([strip([a, b], 0, 2.2, 0.13), '#ece6d8'], [strip([a, b], 2.2, 2.32, 0.18), '#dcd3c0']); wallSolids(a[0], a[1], b[0], b[1], 0.3); };
    // (the owner's notes on batch 143, marked on the Tropiks view: the wall along the road west of the administration
    // block up to its corner; east of it a small gate under a lintel of wall, a short wall, then the car entrance to
    // the lane)
    { const zf = SITE.zFence, bx0 = AO[0] + ADMIN.x0, bx1 = AO[0] + ADMIN.x1, bz = AO[1] + ADMIN.z1, g0 = bx1 + 0.05;
      // (the owner's notes on batch 146: west of the block not a full wall but a railing fence, their picture: a low
      // cream wall, square pillars with caps, bronze bars with spear tops between two rails; east of the block the
      // small gate beside the block's corner, the short wall on its other side)
      const rail = (a: P2, b: P2) => {
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, n = Math.max(1, Math.round(L / 2.9));
        parts.push([strip([a, b], 0, 0.9, 0.14), '#ebe3d1'], [strip([a, b], 0.9, 0.97, 0.18), '#ddd3bd']);
        for (let i = 0; i <= n; i++) { const x = a[0] + (ux * L * i) / n, z = a[1] + (uz * L * i) / n; parts.push([box(x - 0.24, x + 0.24, 0, 2.2, z - 0.24, z + 0.24), '#ebe3d1'], [box(x - 0.3, x + 0.3, 2.2, 2.32, z - 0.3, z + 0.3), '#ddd3bd']); }
        for (let t = 0.3; t < L - 0.2; t += 0.13) { const x = a[0] + ux * t, z = a[1] + uz * t; parts.push([box(x - 0.016, x + 0.016, 0.97, 1.95, z - 0.016, z + 0.016), '#8a7a58'], [new THREE.ConeGeometry(0.03, 0.12, 4).translate(x, 2.01, z), '#8a7a58']); }
        for (const y of [1.15, 1.8]) parts.push([strip([a, b], y - 0.025, y + 0.025, 0.03), '#8a7a58']);
        wallSolids(a[0], a[1], b[0], b[1], 0.3);
      };
      rail([SITE.x0, zf], [bx0, zf]); rail([bx0, zf], [bx0, bz]);
      // (the owner's notes on batches 147-149: the brown gate stands in the slot between the block's corner and the
      // road wall, facing the forecourt; the road wall runs on unbroken to its end pier, then the car entrance)
      const q1 = g0 + 2.1;
      wallRun([g0, zf], [q1, zf]);
      parts.push([box(q1 - 0.24, q1 + 0.24, 0, 2.7, zf - 0.24, zf + 0.24), '#ece6d8'], [box(q1 - 0.3, q1 + 0.3, 2.7, 2.8, zf - 0.3, zf + 0.3), '#dcd3c0']);
      // the gate: posts at the block's corner and at the wall, a lintel over, the brown bar leaves between
      const za = bz + 0.05, zb = zf - 0.15;
      parts.push([box(g0 - 0.15, g0 + 0.15, 0, 2.6, zb - 0.1, zf + 0.15), '#ece6d8'], [box(g0 - 0.15, g0 + 0.15, 2.2, 2.6, za, zb), '#ece6d8'], [box(g0 - 0.2, g0 + 0.2, 2.6, 2.7, za - 0.05, zf + 0.2), '#dcd3c0']);
      // (the walking feature, Volume A section 11: the bar leaf is a hinged gate that opens for a walker and closes once
      // they have left; it is built on its own, hinged at the block's corner, and its collision follows it: gates.ts)
      { const L = zb - za, leafParts: Part[] = [];
        for (let t = 0.08; t < L - 0.05; t += 0.12) leafParts.push([box(t - 0.018, t + 0.018, 0.05, 2.15, -0.02, 0.02), '#5a4a3a']);
        for (const y of [0.1, 1.0, 2.1]) leafParts.push([box(0, L, y - 0.03, y + 0.03, -0.03, 0.03), '#5a4a3a']);
        const leaf = new THREE.Mesh(merge(leafParts), concrete(0.2)); leaf.castShadow = true; leaf.userData.noCollide = true;
        leaf.position.y = gh(g0, (za + zb) / 2);
        // (the owner, 2026-10-16: Evandy's entrances are open, with no gate: the leaf stands swung open against the
        // block's corner and never closes)
        leaf.position.x = g0; leaf.position.z = za; leaf.rotation.y = -Math.atan2(1, 0) - 1.35;
        gates.group.add(leaf);
        wallSolids(g0, zb, g0, zf, 0.3); }
      }
    wallRun([SITE.x0, SITE.zFence], [SITE.x0, SITE.z0]); wallRun([SITE.x0, SITE.z0], [SITE.x1, SITE.z0]); wallRun([SITE.x1, SITE.z0], [SITE.x1, -1216]);
    // east of the gate: the curved pale entrance wall to the commercial block (R18)
    { const pts: P2[] = Array.from({ length: 7 }, (_, i) => { const t = (i / 6) * Math.PI / 2; return [SITE.gate[1] + 0.5 + Math.sin(t) * 1.0, SITE.zFence - (1 - Math.cos(t)) * 2.6] as P2; });
      parts.push([strip(pts, 0, 1.6, 0.14), '#f1ede4']); for (const p of pts) SOLIDS.add(p[0], p[1], 0.3); }
    // the gate: square pillars with lamp globes, two leaves of dark vertical bars swung open
    for (const x of SITE.gate) { parts.push([box(x - 0.35, x + 0.35, 0, 2.4, SITE.zFence - 0.35, SITE.zFence + 0.35), '#efe9dc'], [box(x - 0.42, x + 0.42, 2.4, 2.5, SITE.zFence - 0.42, SITE.zFence + 0.42), '#dcd3c0'], [new THREE.CylinderGeometry(0.1, 0.14, 0.18, 8).translate(x, 2.59, SITE.zFence), '#3b3631'], [new THREE.SphereGeometry(0.22, 12, 10).scale(1, 1.25, 1).translate(x, 2.92, SITE.zFence), '#cfc8b4'], [new THREE.ConeGeometry(0.2, 0.18, 8).translate(x, 3.27, SITE.zFence), '#3b3631'], [new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6).translate(x, 3.41, SITE.zFence), '#3b3631']); SOLIDS.add(x, SITE.zFence, 0.45); }
    for (const [x, s] of [[SITE.gate[0] + 0.4, 1], [SITE.gate[1] - 0.4, -1]] as [number, number][]) {
      const L = 4.2, a = -1.25, dx = Math.cos(a) * s, dz = Math.sin(a);
      for (let t = 0.1; t < L; t += 0.13) { const px = x + dx * t, pz = SITE.zFence + dz * t; parts.push([box(px - 0.02, px + 0.02, 0.1, 2.0, pz - 0.02, pz + 0.02), '#5a4a3a']); }
      for (const y of [0.15, 1.0, 2.0]) parts.push([strip([[x, SITE.zFence], [x + dx * L, SITE.zFence + dz * L]], y - 0.04, y + 0.04, 0.03), '#5a4a3a']);
      for (let t = 0.3; t < L; t += 0.6) SOLIDS.add(x + dx * t, SITE.zFence + dz * t, 0.25);
    }
    // the gatehouse: pale cream, red hipped tile roof, a door and a window, an entry pad with two steps (P05, P06)
    { const [x0, x1, z0, z1] = GATEHOUSE, h = 2.8, e = 0.6, xm = (x0 + x1) / 2, zm = (z0 + z1) / 2, rt = h + 1.5;
      parts.push([box(x0, x1, 0, h, z0, z1), '#efe8da'], [box(x0 - 0.05, x1 + 0.05, h - 0.25, h, z0 - 0.05, z1 + 0.05), '#e3d9c6']);
      k.roof.c = new THREE.Color('#b8502e');
      k.roof.quad([x0 - e, h, z1 + e], [x1 + e, h, z1 + e], [xm + 0.4, rt, zm], [xm - 0.4, rt, zm]);
      k.roof.quad([x1 + e, h, z0 - e], [x0 - e, h, z0 - e], [xm - 0.4, rt, zm], [xm + 0.4, rt, zm]);
      k.roof.quad([x0 - e, h, z0 - e], [x0 - e, h, z1 + e], [xm - 0.4, rt, zm], [xm - 0.4, rt, zm]);
      k.roof.quad([x1 + e, h, z1 + e], [x1 + e, h, z0 - e], [xm + 0.4, rt, zm], [xm + 0.4, rt, zm]);
      // the door on the court side, a louvred window on each of the other three walls (R11, P05, P06), sills under them
      parts.push([box(x0 + 0.6, x0 + 1.5, 0.3, 2.3, z0 - 0.04, z0), '#3c3d3a']);
      const win = (a: P2, b: P2) => { const cx = (a[0] + b[0]) / 2, cz = (a[1] + b[1]) / 2, along = a[1] === b[1];
        parts.push([along ? box(cx - 0.6, cx + 0.6, 1.0, 2.0, cz - 0.04, cz + 0.04) : box(cx - 0.04, cx + 0.04, 1.0, 2.0, cz - 0.6, cz + 0.6), '#2c3034']);
        for (let y = 1.08; y < 2.0; y += 0.13) parts.push([along ? box(cx - 0.56, cx + 0.56, y, y + 0.03, cz - 0.05, cz + 0.05) : box(cx - 0.05, cx + 0.05, y, y + 0.03, cz - 0.56, cz + 0.56), '#6b6f73']);
        parts.push([along ? box(cx - 0.7, cx + 0.7, 0.92, 1.0, cz - 0.1, cz + 0.1) : box(cx - 0.1, cx + 0.1, 0.92, 1.0, cz - 0.7, cz + 0.7), '#e3d9c6']); };
      win([x0 + 2.2, z1], [x1, z1]); win([x0, z0], [x0, z1]); win([x1, z0], [x1, z1]); win([x0 + 1.8, z0], [x1 - 0.2, z0]);
      parts.push([box(x0 - 0.2, x0 + 2.2, 0, 0.3, z0 - 1.6, z0), '#e4e0d6'], [box(x0 - 0.2, x0 + 2.2, 0, 0.15, z0 - 2.1, z0 - 1.6), '#e4e0d6']); }
    // the notice shelter: thin pale frame, weathered curved roof, the board, by the fence
    { const [x0, x1, z0, z1] = SHELTER, h = 2.5;
      for (const x of [x0, x1]) for (const z of [z0, z1]) parts.push([box(x - 0.05, x + 0.05, 0, h, z - 0.05, z + 0.05), '#e9e6df']);
      parts.push([box(x0 - 0.3, x1 + 0.3, h, h + 0.08, z0 - 0.4, z1 + 0.3), '#a98a62'], [box(x0 + 0.1, x1 - 0.1, 0.9, 2.1, z1 - 0.08, z1 - 0.02), '#2f3a5a']);
      for (let i = 0; i < 9; i++) parts.push([box(x0 + 0.4 + (i % 5) * 1.0, x0 + 1.1 + (i % 5) * 1.0, 1.2 + Math.floor(i / 5) * 0.45, 1.55 + Math.floor(i / 5) * 0.45, z1 - 0.1, z1 - 0.08), ['#e9c46a', '#f4a3b8', '#9ad0ec', '#f2f2f2'][i % 4]]);
      for (const x of [x0, x1]) SOLIDS.add(x, (z0 + z1) / 2, 0.2); }
    // the EVANDY HOSTEL sign: blue-grey base, the white slab on two posts
    { const [x, z] = SIGN;
      parts.push([box(x - 1.6, x + 1.6, 0, 0.75, z - 0.5, z + 0.5), '#6f8aa8'], [box(x - 1.15, x - 1.08, 0.75, 1.3, z - 0.03, z + 0.03), '#2f5ea8'], [box(x + 1.08, x + 1.15, 0.75, 1.3, z - 0.03, z + 0.03), '#2f5ea8'], [box(x - 1.2, x + 1.2, 1.3, 2.6, z - 0.05, z + 0.05), '#2f5ea8']);
      k.signs.push({ text: 'EVANDY', x, y: 2.15, z: z + 0.06, ry: 0, w: 2.0, colors: ['#ffffff', '#1f3d7a'] });
      k.signs.push({ text: 'HOSTEL', x, y: 1.7, z: z + 0.06, ry: 0, w: 2.0, colors: ['#ffffff', '#1f3d7a'] });
      SOLIDS.add(x - 1, z, 0.6); SOLIDS.add(x + 1, z, 0.6); }
    // 9 the unfinished open frame: grey concrete columns on a 5 m grid, floor slabs, a few infill panels, no roof
    { const [x0, x1, z0, z1] = FRAME.box, fh = 3.2;
      for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 4) for (let z = z0; z <= z1 + 0.01; z += (z1 - z0) / 13) { parts.push([box(x - 0.2, x + 0.2, 0, FRAME.floors * fh + 0.6, z - 0.2, z + 0.2), '#9fa1a0']); SOLIDS.add(x, z, 0.35); }
      for (let f = 1; f <= FRAME.floors; f++) parts.push([box(x0 - 0.3, x1 + 0.3, f * fh - 0.25, f * fh, z0 - 0.3, z1 + 0.3), '#b1b2ae']);
      for (let i = 0; i < 6; i++) { const z = z0 + 4 + i * 11; parts.push([box(x0 - 0.1, x0 + 0.1, 0, fh * 2, z, z + 5), '#c0b8a8']); }
      flatPlane(k, [[RED_YARD[0], RED_YARD[2]], [RED_YARD[1], RED_YARD[2]], [RED_YARD[1], RED_YARD[3]], [RED_YARD[0], RED_YARD[3]]], 0.05, soilMat(), 4); }
    k.plain.push(...parts);
    mergeMeshes(k);
  },
};

// ---------- the administration block (the owner's eight-pair brief, pairs 1-3) ----------
// One building on the south-west corner of the compound (osm outline at x 516.6-527.2, z -1220.2..-1204.9; M1's labels
// 1, 2 and 3): two storeys in pale yellow under a red tile roof whose ridge runs north-south, hipped at the north,
// gabled at the south over the road. Its east face (R01, read south to north, left to right): a window on each floor; the porch: four
// slender yellow columns at the ground under the projecting balcony slab, the white roller shutter between the middle
// pair, the upper porch's columns and arch under a front gable of its own, the doors behind the light rail; the
// external stair: a flight climbing north to a landing on the low projecting block, a second flight back up to the
// balcony. Its south face (R02, R03): the Tropiks frontage: two framed upper windows with grilles in light surrounds, the
// white sign, the wine band over the shopfront, the display window and the four-leaf glass doors, the tiled step and
// landing, the boarded soffit under the gable. The west and north faces are unseen (two windows a floor, provisional).
const AO: P2 = [521.9, -1212.55];
const ADMIN = { x0: -5.3, x1: 5.3, z0: -7.65, z1: 7.65, e: 6.8, g: 3.3 };
const admin: Spec = {
  name: 'Evandy administration block (Tropiks)', axis: [1, 0], origin: AO, storey: 3.3, style: PLAIN, roofColor: '#c25a33', fascia: '#efe7d6', pitch: 0.45,
  replaces: [[522, -1213]],
  blocks: [],
  keep: [[-6, 8, -8.5, 12]],
  extras: (k) => {
    const { x0, x1, z0, z1, e, g } = ADMIN, Y = '#ead290', COL = '#e1c45e', p: Part[] = [], W = (x: number, z: number): [number, number] => [x + AO[0], z + AO[1]];
    p.push([box(x0, x1, 0, e, z0, z1), Y], [box(x0 - 0.03, x1 + 0.03, 0, 0.35, z0 - 0.03, z1 + 0.03), '#d8bf78']);
    p.push([box(x0 - 0.04, x1 + 0.04, g - 0.12, g, z0 - 0.04, z1 + 0.04), '#e4cb86']);
    // a framed window on a face along z (east/west, out ±1) or along x (north/south)
    const winZ = (x: number, out: number, zc: number, w: number, y0: number, h: number, grille: boolean) => {
      p.push([box(Math.min(x, x + out * 0.08), Math.max(x, x + out * 0.08), y0 - 0.12, y0 + h + 0.12, zc - w / 2 - 0.12, zc + w / 2 + 0.12), '#f6f1e2']);
      k.glass.push(box(Math.min(x, x + out * 0.09), Math.max(x, x + out * 0.09), y0, y0 + h, zc - w / 2, zc + w / 2));
      p.push([box(Math.min(x, x + out * 0.1), Math.max(x, x + out * 0.1), y0, y0 + h, zc - 0.03, zc + 0.03), '#f6f1e2']);
      if (grille) for (let z = zc - w / 2 + 0.15; z < zc + w / 2; z += 0.16) p.push([box(Math.min(x, x + out * 0.11), Math.max(x, x + out * 0.11), y0, y0 + h, z - 0.01, z + 0.01), '#3a3631']);
    };
    const winX = (z: number, out: number, xc: number, w: number, y0: number, h: number, grille: boolean) => {
      const za = Math.min(z, z + out * 0.12), zb = Math.max(z, z + out * 0.12);
      p.push([box(xc - w / 2 - 0.15, xc + w / 2 + 0.15, y0 - 0.15, y0, za, zb), '#d6bd86'], [box(xc - w / 2 - 0.15, xc + w / 2 + 0.15, y0 + h, y0 + h + 0.15, za, zb), '#d6bd86']);
      p.push([box(xc - w / 2 - 0.15, xc - w / 2, y0, y0 + h, za, zb), '#d6bd86'], [box(xc + w / 2, xc + w / 2 + 0.15, y0, y0 + h, za, zb), '#d6bd86']);
      k.glass.push(box(xc - w / 2, xc + w / 2, y0, y0 + h, Math.min(z, z + out * 0.03), Math.max(z, z + out * 0.03)));
      p.push([box(xc - 0.04, xc + 0.04, y0, y0 + h, Math.min(z, z + out * 0.13), Math.max(z, z + out * 0.13)), '#d6bd86']);
      if (grille) { for (let x = xc - w / 2 + 0.1; x < xc + w / 2; x += 0.22) p.push([box(x - 0.008, x + 0.008, y0, y0 + h, Math.min(z + out * 0.035, z + out * 0.045), Math.max(z + out * 0.035, z + out * 0.045)), '#5a554d']); for (let y = y0 + 0.3; y < y0 + h; y += 0.4) p.push([box(xc - w / 2, xc + w / 2, y - 0.008, y + 0.008, Math.min(z + out * 0.035, z + out * 0.045), Math.max(z + out * 0.035, z + out * 0.045)), '#5a554d']); }
    };
    // ---- the east face (R01) ----
    winZ(x1, 1, 4.6, 1.7, 1.1, 1.2, false); winZ(x1, 1, 4.6, 1.7, 4.3, 1.2, false);
    const zc = -0.6, xf = x1 + 1.6;
    // the ground portico: four slender yellow columns, the balcony slab over them, the white roller shutter
    for (const z of [zc - 2.95, zc - 2.45, zc + 2.45, zc + 2.95]) { p.push([new THREE.CylinderGeometry(0.17, 0.19, g, 14).translate(xf - 0.2, g / 2, z), COL]); SOLIDS.add(...W(xf - 0.2, z), 0.45); }
    p.push([box(x1, xf + 0.05, g - 0.05, g + 0.25, zc - 3.3, zc + 3.3), '#f2e6b8']);
    p.push([box(x1 + 0.01, x1 + 0.05, 0, 2.5, zc - 1.35, zc + 1.35), '#f3f3ef']);
    for (let y = 0.15; y < 2.5; y += 0.18) p.push([box(x1 + 0.05, x1 + 0.07, y, y + 0.02, zc - 1.35, zc + 1.35), '#d6d6d0']);
    p.push([box(x1, xf + 0.1, 0, 0.12, zc - 3.4, zc + 3.4), '#cfc5b0']);
    // the upper porch: its columns, the rail along the front and returns, the doors behind, the small window beside
    for (const z of [zc - 2.45, zc + 2.45, zc + 2.95]) p.push([new THREE.CylinderGeometry(0.16, 0.18, e - g - 0.25, 14).translate(xf - 0.25, g + 0.25 + (e - g - 0.25) / 2, z), COL]);
    for (const [a, b] of [[[xf, zc - 3.25], [xf, zc + 3.25]], [[x1, zc - 3.25], [xf, zc - 3.25]], [[x1, zc + 3.25], [xf, zc + 3.25]]] as [P2, P2][]) {
      p.push([strip([a, b], g + 1.2, g + 1.25, 0.05), '#cfd0cc']);
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      for (let t = 0; t <= L; t += 0.13) { const x = a[0] + ((b[0] - a[0]) * t) / L, z = a[1] + ((b[1] - a[1]) * t) / L; p.push([box(x - 0.012, x + 0.012, g + 0.25, g + 1.22, z - 0.012, z + 0.012), '#cfd0cc']); }
    }
    p.push([box(x1 + 0.01, x1 + 0.05, g + 0.25, g + 2.5, zc - 1.55, zc - 0.6), '#5b3624'], [box(x1 + 0.01, x1 + 0.05, g + 0.25, g + 2.4, zc + 0.85, zc + 1.6), '#e9dfc2']);
    winZ(x1, 1, zc - 4.4, 0.6, g + 1.1, 0.7, false); winZ(x1, 1, zc - 4.4, 0.6, 1.0, 0.7, false);
    // the porch's front gable with the arch under it, carried on the upper columns
    const ga = e - 0.15, gw = 3.4, gp = 0.6;
    const front = new THREE.Shape([new THREE.Vector2(-gw, ga - 1.5), new THREE.Vector2(gw, ga - 1.5), new THREE.Vector2(gw, ga), new THREE.Vector2(0, ga + gw * gp), new THREE.Vector2(-gw, ga)]);
    front.holes.push(new THREE.Path().moveTo(-1.6, ga - 1.5).lineTo(1.6, ga - 1.5).absarc(0, ga - 1.5, 1.6, 0, Math.PI, false).lineTo(-1.6, ga - 1.5));
    p.push([new THREE.ExtrudeGeometry(front, { depth: 0.3, bevelEnabled: false, curveSegments: 14 }).rotateY(Math.PI / 2).translate(xf - 0.3, 0, zc), Y]);
    k.roof.quad([xf + 0.35, ga, zc - gw - 0.35], [x1 - 2.5, ga, zc - gw - 0.35], [x1 - 2.5, ga + (gw + 0.35) * gp, zc], [xf + 0.35, ga + (gw + 0.35) * gp, zc]);
    k.roof.quad([x1 - 2.5, ga, zc + gw + 0.35], [xf + 0.35, ga, zc + gw + 0.35], [xf + 0.35, ga + (gw + 0.35) * gp, zc], [x1 - 2.5, ga + (gw + 0.35) * gp, zc]);
    // the external stair: up north to the landing on the low projecting block, then back south to the balcony
    const zl0 = z0 + 1.3, hl = 1.9, n1 = 11, n2 = 8, zb2 = zc - 3.3;
    p.push([box(x1, x1 + 2.1, 0, hl, z0, zl0), Y], [box(x1 + 1.95, x1 + 2.1, hl, hl + 1.0, z0, zl0), Y]);
    SOLIDS.add(...W(x1 + 1.05, (zl0 + z0) / 2), 0.9);
    const zs0 = zc - 3.35;
    for (let i = 0; i < n1; i++) { const za = zs0 + ((zl0 - zs0) * i) / n1, zb = zs0 + ((zl0 - zs0) * (i + 1)) / n1, y = (hl * (i + 1)) / n1; p.push([box(x1 + 1.1, x1 + 2.1, y - 0.18, y, Math.min(za, zb), Math.max(za, zb)), '#f2e6b8']); }
    p.push([new THREE.BoxGeometry(0.04, 0.04, Math.hypot(zl0 - zs0, hl)).rotateX(-Math.atan2(hl, zl0 - zs0)).translate(x1 + 2.08, hl / 2 + 1.0, (zs0 + zl0) / 2), '#cfd0cc']);
    for (let i = 0; i < n2; i++) { const za = zl0 + ((zb2 - zl0) * i) / n2, zb = zl0 + ((zb2 - zl0) * (i + 1)) / n2, y = hl + ((g + 0.25 - hl) * (i + 1)) / n2; p.push([box(x1 + 0.05, x1 + 1.05, y - 0.18, y, Math.min(za, zb), Math.max(za, zb)), '#f2e6b8']); }
    p.push([new THREE.BoxGeometry(0.04, 0.04, Math.hypot(zb2 - zl0, g - hl)).rotateX(-Math.atan2(g - hl, zb2 - zl0)).translate(x1 + 1.07, (hl + g) / 2 + 1.0, (zl0 + zb2) / 2), '#cfd0cc']);
    for (let z = zl0; z < zs0; z += 0.8) SOLIDS.add(...W(x1 + 1.6, z), 0.5);
    // (the low space under the upper flight: closed to the bike)
    for (let z = zl0; z < zb2; z += 0.7) SOLIDS.add(...W(x1 + 0.55, z), 0.55);
    // ---- the south face: the Tropiks frontage (R02, R03) ----
    // (the owner's notes on batch 143: the three upper windows the same size)
    for (const xc of [-3.35, 0, 3.35]) winX(z1, 1, xc, 2.2, 4.5, 1.5, true);
    p.push([box(x0 - 0.3, x1 + 0.3, 2.85, 3.15, z1, z1 + 0.95), '#7a2630'], [box(x0 - 0.3, x1 + 0.3, 2.7, 2.85, z1 + 0.85, z1 + 0.95), '#6a1f28']);
    p.push([box(-2.0, 1.3, 3.3, 4.25, z1 + 0.02, z1 + 0.08), '#f7f7f5']);
    k.signs.push({ text: 'TROPIKS', x: -0.35, y: 3.98, z: z1 + 0.09, ry: 0, w: 2.6, colors: ['#f7f7f5', '#2b2f86'] });
    k.signs.push({ text: 'Restaurant | Grill', x: -0.35, y: 3.55, z: z1 + 0.09, ry: 0, w: 2.6, colors: ['#f7f7f5', '#2a2a2a'] });
    // the shopfront: the display window, the four glass leaves of the doors in dark frames, a white pier at the east
    k.glass.push(box(-4.9, -1.6, 0.45, 2.65, z1 + 0.01, z1 + 0.05), box(-1.0, 3.7, 0.45, 2.65, z1 + 0.01, z1 + 0.05));
    for (const x of [-4.9, -3.25, -1.6, -1.0, 0.18, 1.35, 2.52, 3.7]) p.push([box(x - 0.05, x + 0.05, 0.45, 2.65, z1 + 0.02, z1 + 0.07), '#3a3a3a']);
    for (const y of [0.45, 2.65]) p.push([box(-4.95, 3.75, y - 0.05, y + 0.05, z1 + 0.02, z1 + 0.07), '#3a3a3a']);
    p.push([box(-1.6, -1.0, 0.35, 2.85, z1, z1 + 0.06), '#f3f1ea'], [box(3.7, x1, 0.35, 2.85, z1, z1 + 0.06), '#f3f1ea']);
    p.push([box(x0, x1, 0, 0.32, z1, z1 + 1.3), '#cfae7c'], [box(x0, x1, 0, 0.16, z1 + 1.3, z1 + 1.7), '#cfae7c']);
    // the gable over the road, its boarded soffit and rakes
    const ov = 0.6, rise = ((x1 - x0) / 2 + ov) * 0.45;
    p.push([tri2([x0, e, z1], [x1, e, z1], [0, e + ((x1 - x0) / 2) * 0.45, z1]), Y], [tri2([x1, e, z1], [x0, e, z1], [0, e + ((x1 - x0) / 2) * 0.45, z1]), Y]);
    for (const s of [-1, 1]) {
      const L = Math.hypot((x1 - x0) / 2 + ov, rise);
      p.push([new THREE.BoxGeometry(L, 0.06, 0.9).rotateZ(-s * Math.atan2(rise, (x1 - x0) / 2 + ov)).translate(s * ((x1 - x0) / 4 + ov / 2), e + rise / 2 - 0.1, z1 + 0.45), '#b48e5c']);
      p.push([new THREE.BoxGeometry(L, 0.22, 0.06).rotateZ(-s * Math.atan2(rise, (x1 - x0) / 2 + ov)).translate(s * ((x1 - x0) / 4 + ov / 2), e + rise / 2 - 0.05, z1 + ov + 0.3), '#d9b98a']);
    }
    // ---- the unseen west and north faces: two windows a floor (provisional) ----
    for (const y of [1.1, 4.3]) { winZ(x0, -1, -3, 1.4, y, 1.2, false); winZ(x0, -1, 3, 1.4, y, 1.2, false); winX(z0, -1, -2.4, 1.4, y, 1.2, false); winX(z0, -1, 2.4, 1.4, y, 1.2, false); }
    // ---- the roof: ridge north-south, hipped at the north, gabled at the south ----
    const X0 = x0 - ov, X1 = x1 + ov, Zn = z0 - ov, Zs = z1 + ov + 0.3, R = e + rise, hz = Zn + (X1 - X0) / 2;
    k.roof.c = new THREE.Color('#c25a33');
    k.roof.quad([X0, e, Zs], [X0, e, Zn], [0, R, hz], [0, R, Zs]);
    k.roof.quad([X1, e, Zn], [X1, e, Zs], [0, R, Zs], [0, R, hz]);
    k.roof.quad([X0, e, Zn], [X1, e, Zn], [0, R, hz], [0, R, hz]);
    p.push([box(X0, X1, e - 0.06, e, Zn, z1), '#e3d2a8']);
    wallSolids(...W(x0, z0), ...W(x1, z0), 0.25); wallSolids(...W(x0, z1), ...W(x1, z1), 0.25); wallSolids(...W(x0, z0), ...W(x0, z1), 0.25); wallSolids(...W(x1, z0), ...W(x1, z1), 0.25);
    k.plain.push(...p);
    mergeMeshes(k);
  },
};

// ---------- the west junctions ----------
// The satellite (the owner's M2 and the marked crop, notes on batches 143-145): along the west end the wings are one
// block. Between the west block's south face and front-w's tower, the connector, its west face in two planes that meet
// in a corner standing out toward the west (R05, the owner's violet arrows: the vertex points outward). Its north plane
// (R05's left part): the open entrance two storeys high with the dark gate at its base (the owner's blue and black
// marks), a way through behind it to the inner court, the stair's openings a half storey up over it and a narrow bay a
// floor beside. Its south plane (R05's right part): the first floor's two broad voids between piers, a narrow and a
// wide bay a floor above; four storeys under the roof terrace. Between the west block's north face and inner-w's
// south-west corner a second link, its west face also on the angle (the owner's blue arrows; R05's narrow far-left
// face): small stacked balconies, slots, five storeys under a flat roof. Their court faces carry a louvred window a
// floor. World frame.
/** the model frame's origin (the parts are drawn in world terms and moved to it) */
const JO: P2 = [553, -1245];
const FW = fit(WINGS.find((w) => w.id === 'front-w')!.quad), FWM = FW.z0 + (FW.z1 - FW.z0) * 0.5;
/** the connector's west face: from the west block's south face (JA) out to the corner (JV), back to the tower (JT) */
const JA: P2 = [551.04, -1238.6], JT = wpt(FW, FW.x0, FWM), JCZ = -1235.8, JX = 559.7;
const JV: P2 = (() => { const dx = JT[0] - JA[0], dz = JT[1] - JA[1], L = Math.hypot(dx, dz); return [JA[0] + dx * 0.4 - (dz / L) * 1.5, JA[1] + dz * 0.4 + (dx / L) * 1.5]; })();
/** the way through: its north and south sides */
const JW = [-1238.35, -1236.55] as const;
const JE: P2 = [549.8, -1248.6], JF: P2 = [553.4, -1255.1];
function louvreWin(p: Part[], u: number, y: number, w: number, h: number) {
  p.push([box(-0.08, 0, y - 0.1, y + h + 0.1, u - w / 2 - 0.1, u + w / 2 + 0.1), '#e6dfd0'], [box(-0.1, -0.08, y, y + h, u - w / 2, u + w / 2), '#8e9398']);
  for (let yy = y + 0.08; yy < y + h; yy += 0.11) p.push([box(-0.12, -0.1, yy - 0.02, yy + 0.02, u - w / 2, u + w / 2), '#5f646a']);
}
const junctions: Spec = {
  name: 'Evandy west junctions', axis: [1, 0], origin: JO, storey: ST, style: PLAIN, roofColor: '#c4633a', fascia: '#efe7d6', pitch: 0.42,
  replaces: [],
  blocks: [],
  // (model frame; the second: the approach to the entrance, kept clear of hedges)
  keep: [[547 - JO[0], 561 - JO[0], -1256 - JO[1], -1227 - JO[1]], [538 - JO[0], 552 - JO[0], -1239.2 - JO[1], -1235.6 - JO[1]]],
  extras: (k) => {
    const p: Part[] = [], W = '#efe6d2', fy = (fl: number) => 0.4 + fl * ST, ct = fy(4), EH = fy(2) - 0.5;
    // the connector: above the way through, the whole outline; at the ground, the parts either side of the way
    const xA = (z: number) => JA[0] + ((JV[0] - JA[0]) * (z - JA[1])) / (JV[1] - JA[1]);
    const Tin = wpt(FW, FW.x0 + 0.6, FWM), Bin = wpt(FW, FW.x0 + 0.6, FW.z0);
    p.push([prism([[xA(-1238.9), -1238.9], JV, JT, Tin, Bin, [JX, JCZ], [JX, -1238.9]], 2.6, ct), W]);
    p.push([prism([[xA(JW[1]), JW[1]], JV, JT, Tin, Bin, [JX, JCZ], [JX, JW[1]]], 0, 2.6), W], [prism([[xA(-1238.9), -1238.9], [xA(JW[0]), JW[0]], [JX, JW[0]], [JX, -1238.9]], 0, 2.6), W]);
    p.push([box(xA(JW[0]) + 0.1, JX, 2.55, 2.6, JW[0], JW[1]), '#d6cfc0']);
    // the north plane: the entrance (t from JA), the way at t0..t1
    const L1 = Math.hypot(JV[0] - JA[0], JV[1] - JA[1]), tOf = (z: number) => ((z - JA[1]) / (JV[1] - JA[1])) * L1, t0 = tOf(JW[0]), t1 = tOf(JW[1]);
    const L2 = Math.hypot(JT[0] - JV[0], JT[1] - JV[1]), BAY = '#4e4943', VOID = '#a59c8c';
    const parapet = (q: Part[], L: number) => {
      q.push([box(-0.8, 0, ct, ct + 1.0, 0, L), W]);
      for (let z = 0.3; z < L; z += 0.6) q.push([box(-0.7, -0.67, ct + 1.0, ct + 1.6, z - 0.015, z + 0.015), RAIL]);
      q.push([box(-0.7, -0.67, ct + 1.58, ct + 1.62, 0, L), RAIL]);
    };
    onFace(k, JA, JV, (fk) => {
      const q: Part[] = [];
      const holes: [number, number, number, number, boolean, string?][] = [[t0, t1, 0, EH, false, 'open']];
      holes.push([t0 + 0.1, t1 - 0.3, fy(3) - 0.2, fy(3) + 1.1, true, BAY], [t1 + 0.35, L1 - 0.3, fy(2) + 0.9, fy(2) + 2.35, true, BAY], [t1 + 0.35, L1 - 0.3, fy(3) + 0.9, fy(3) + 2.35, true, BAY], [t1 + 0.35, L1 - 0.3, fy(1) + 0.9, fy(1) + 2.0, false, BAY]);
      skinZ(q, 0, -1, 0, L1, ct, 0.8, holes);
      // the entrance's back above the way, in shade; the dark gate at its base, closed, its bars and rails
      q.push([box(-0.02, 0, 2.6, EH, t0, t1), '#c9c0ae']);
      for (let z = t0 + 0.08; z < t1; z += 0.12) q.push([box(-0.46, -0.42, 0.05, 2.2, z - 0.015, z + 0.015), '#2f2c29']);
      for (const y of [0.1, 1.1, 2.15]) q.push([box(-0.47, -0.41, y - 0.04, y + 0.04, t0, t1), '#2f2c29']);
      q.push([box(-0.47, -0.41, 0.05, 1.0, t0, t1), '#3a3632']);
      parapet(q, L1);
      fk.plain.push(...q);
    });
    // the south plane
    onFace(k, JV, JT, (fk) => {
      const q: Part[] = [];
      const holes: [number, number, number, number, boolean, string?][] = [[0.35, 2.9, fy(1) + 0.15, fy(1) + 2.7, false, VOID], [3.4, L2 - 0.3, fy(1) + 0.15, fy(1) + 2.7, false, VOID]];
      for (const fl of [2, 3]) holes.push([0.35, 1.6, fy(fl) + 0.9, fy(fl) + 2.35, true, BAY], [2.6, L2 - 0.5, fy(fl) + 0.9, fy(fl) + 2.45, true, VOID]);
      skinZ(q, 0, -1, 0, L2, ct, 0.8, holes);
      parapet(q, L2);
      fk.plain.push(...q);
    });
    // the corner where the two planes meet (the owner's notes on batch 148: no gap down it): the wedge between the two
    // skins filled from the ground to the parapet's top, and over it a small wall slab joining the two rails
    { const n = (a: P2, b: P2): P2 => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); return [-(b[1] - a[1]) / L, (b[0] - a[0]) / L]; };
      const d = (a: P2, b: P2): P2 => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / L, (b[1] - a[1]) / L]; };
      const n1 = n(JA, JV), n2 = n(JV, JT), d1 = d(JA, JV), d2 = d(JV, JT), T = 0.8, at = (s1: number, k1: number, s2: number, k2: number): P2 => [JV[0] + d1[0] * s1 + n1[0] * k1 + d2[0] * s2 + n2[0] * k2, JV[1] + d1[1] * s1 + n1[1] * k1 + d2[1] * s2 + n2[1] * k2];
      p.push([prism([JV, at(0, T, 0, 0), at(0, 0, 0, T)], 0, ct + 1.0), W]);
      p.push([prism([at(-0.45, 0, 0, 0), at(-0.45, T, 0, 0), at(0, T, 0, 0), at(0, 0, 0, T), at(0, 0, 0.45, T), at(0, 0, 0.45, 0)], ct + 1.0, ct + 1.65), W]);
      p.push([prism([at(-0.5, -0.02, 0, 0), at(-0.5, T + 0.03, 0, 0), at(0, T + 0.03, 0, 0), at(0, 0, 0, T + 0.03), at(0, 0, 0.5, T + 0.03), at(0, 0, 0.5, -0.02)], ct + 1.65, ct + 1.72), '#e2d9c5']); }
    { const out = (a: P2, b: P2, r: number) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L, nz = (b[0] - a[0]) / L; wallSolids(a[0] + nx * 0.4, a[1] + nz * 0.4, b[0] + nx * 0.4, b[1] + nz * 0.4, r); };
      out([xA(JW[1]), JW[1]], JV, 0.5); out(JV, JT, 0.5); out(JA, [xA(JW[0]), JW[0]], 0.4);
      wallSolids(xA(JW[0]) - 0.44, JW[0], xA(JW[1]) - 0.44, JW[1], 0.15);
      wallSolids(JX, JCZ, JX, JW[1], 0.3); wallSolids(JX, JW[0], JX, -1238.9, 0.3); }
    // its court face: a louvred window a floor over the way out
    onFace(k, [JX, JCZ], [JX, -1238.9], (fk) => { const q: Part[] = []; for (let fl = 1; fl < 4; fl++) louvreWin(q, 1.6, fy(fl) + 1.0, 0.9, 1.3); fk.plain.push(...q); });
    // the north link: five storeys under a flat roof with a parapet
    const t5 = fy(5), xN = (z: number) => JF[0] + ((JE[0] - JF[0]) * (z - JF[1])) / (JE[1] - JF[1]);
    p.push([prism([[xN(-1255.4), -1255.4], [xN(-1248.3), -1248.3], [559.8, -1248.3], [559.8, -1253.8]], 0, t5 + 0.9), W]);
    p.push([strip([[xN(-1255.4), -1255.4], [xN(-1248.3), -1248.3]], t5 + 0.75, t5 + 0.9, 0.08), '#e2d9c5']);
    onFace(k, JF, JE, (fk, L2) => {
      const q: Part[] = [];
      for (let fl = 0; fl < 5; fl++) {
        const y = fy(fl);
        q.push([box(-0.04, 0, y + 0.7, y + 2.5, 1.4, 1.85), '#3b3833'], [box(-0.04, 0, y + 1.6, y + 2.05, 2.8, 3.2), '#3b3833']);
        if (fl) {
          // the small stacked balconies near the west block
          const a = L2 - 2.6, b = L2 - 1.2;
          q.push([box(-0.9, 0, y - 0.15, y, a, b), '#efe9dc'], [box(-0.03, 0, y, y + 2.2, a + 0.2, b - 0.2), '#3b3833']);
          for (let z = a + 0.05; z < b; z += 0.13) q.push([box(-0.88, -0.85, y, y + 0.95, z - 0.012, z + 0.012), RAIL]);
          q.push([box(-0.9, -0.83, y + 0.93, y + 0.97, a, b), RAIL]);
        } else q.push([box(-0.04, 0, 0.9, 2.3, L2 - 2.6, L2 - 1.2), '#3b3833']);
        for (const z of [L2 - 2.62, L2 - 1.18]) if (fl) q.push([box(-0.9, 0, y, y + 0.95, z - 0.02, z + 0.02), RAIL]);
      }
      fk.plain.push(...q);
    });
    { const o = (z: number): P2 => [xN(z) - 0.3, z]; wallSolids(...o(-1255.1), ...o(-1248.6), 0.4); wallSolids(559.8, -1248.6, 559.8, -1253.5, 0.3); }
    onFace(k, [559.8, -1248.6], [559.8, -1253.5], (fk) => { const q: Part[] = []; for (let fl = 0; fl < 5; fl++) louvreWin(q, 2.4, fy(fl) + 1.0, 0.9, 1.3); fk.plain.push(...q); });
    k.plain.push(...p);
    for (const [g] of k.plain) g.translate(-JO[0], 0, -JO[1]);
    for (const g of k.glass) g.translate(-JO[0], 0, -JO[1]);
    for (const m of k.meshes) m.geometry.translate(-JO[0], 0, -JO[1]);
    mergeMeshes(k);
  },
};

/** Evandy Hostel and its environs */
export const evandySite = mergedSite(createSite('evandy', [...WINGS.map(wingSpec), junctions, entrance, eastRange, aDeck, ancillary, ring, shops, admin, site]));

// ---------- planting and the ground round the compound ----------
const SHRUB = ['#4d7032', '#5c7f36', '#3f6428', '#6a8f3f'];
const TREE = ['#3f6a2c', '#4b7733', '#557f37'];
const SCRUBC = ['#56723a', '#647c3f', '#4b6634', '#7a8446'];
const segDist = (x: number, z: number, ax: number, az: number, bx: number, bz: number) => {
  const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz, t = l ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l)) : 0;
  return Math.hypot(x - ax - dx * t, z - az - dz * t);
};
export function buildEvandyGrounds() {
  const crowns: Crown[] = [];
  // the islands' clipped shrubs and spiky ornamentals
  for (const { c, a, b } of ISLANDS) for (let i = 0; i < 9; i++) { const t = (i / 9) * Math.PI * 2, r = i % 3 ? 0.55 : 0.2, s = hash2(c[0] + i, c[1]);
    crowns.push({ x: c[0] + Math.cos(t) * (a - 0.9) * r * 1.6, z: c[1] + Math.sin(t) * (b - 0.6) * r * 1.6, r: 0.6 + s * 0.3, h: 0.7 + s * 0.5, base: 0.34, trunk: 0, color: SHRUB[(s * 4) | 0], seed: s }); }
  // the short shrubs below the frontage windows
  for (let x = 556; x < 640; x += 3.1) { if (Math.abs(x - 597) < 5) continue; const z = x < 597 ? -1221.4 + (x - 556) * 0.175 : -1229 + (x - 600) * 0.257 + 0.8, s = hash2(x, 9);
    crowns.push({ x, z: z + 1.2, r: 0.6, h: 0.75, base: 0, trunk: 0, color: SHRUB[(s * 4) | 0], seed: s }); }
  // the court tree and the inner courts' trees
  for (const { at, r } of TREES) crowns.push({ x: at[0], z: at[1], r, h: r * 1.1, base: r * 0.6 + 1.5, trunk: 0.35, color: TREE[(hash2(at[0], at[1]) * 3) | 0], seed: hash2(at[1], at[0]), solid: true });
  // the scrub and woodland east of the compound round the open field (M2): patchy, the field left open
  const [s0, s1, t0, t1] = SCRUB, [fx, fz] = FIELD.c;
  const blds = BUILDINGS.filter((b) => b.maxX > s0 - 5 && b.minX < s1 + 5 && b.maxZ > t0 - 5 && b.minZ < t1 + 5);
  const segs: [number, number, number, number][] = [];
  for (const r of ROADS) for (let i = 1; i < r.nodes.length; i++) { const ax = NODE_XZ[r.nodes[i - 1] * 2], az = NODE_XZ[r.nodes[i - 1] * 2 + 1], bx = NODE_XZ[r.nodes[i] * 2], bz = NODE_XZ[r.nodes[i] * 2 + 1]; if (Math.max(ax, bx) > s0 - 10 && Math.min(az, bz) < t1 + 10 && Math.max(az, bz) > t0 - 10) segs.push([ax, az, bx, bz]); }
  for (let z = t0; z < t1 - 6; z += 4.2) for (let x = s0; x < s1; x += 4.2) {
    const px = x + (hash2(x, z) - 0.5) * 3.5, pz = z + (hash2(z, x) - 0.5) * 3.5;
    const d = Math.hypot((px - fx) / (FIELD.rx + 3), (pz - fz) / (FIELD.rz + 3));
    if (d < 1 || vnoise2(px / 14, pz / 14) < 0.35 || segs.some(([ax, az, bx, bz]) => segDist(px, pz, ax, az, bx, bz) < 5) || blds.some((b) => px > b.minX - 2 && px < b.maxX + 2 && pz > b.minZ - 2 && pz < b.maxZ + 2)) continue;
    const s = hash2(px * 3, pz), tree = s < 0.22;
    crowns.push(tree ? { x: px, z: pz, r: 3 + s * 6, h: 4, base: 2.5, trunk: 0.3, color: TREE[(s * 9) % 3 | 0], seed: s, solid: true } : { x: px, z: pz, r: 1.4 + s * 1.4, h: 1.3 + s * 1.2, base: 0, trunk: 0, color: SCRUBC[(s * 4) | 0], seed: s });
  }
  const group = new THREE.Group();
  group.name = 'evandy-grounds';
  group.userData.noRelief = true;
  group.add(...crownTiles(crowns, 100, 75));
  // the open sandy field and the patchy dry ground of the scrub, painted over the grass
  const over = coverOverlay({
    box: [s0, s1, t0, t1], mpp: 1, cell: 4, tile: 120,
    color: (x, z) => {
      const d = Math.hypot((x - fx) / FIELD.rx, (z - fz) / FIELD.rz) + (vnoise2(x / 7, z / 7) - 0.5) * 0.35;
      if (d < 1) return [196, 150, 104, 0.95];
      const n = vnoise2(x / 11, z / 11);
      return n < 0.4 ? [150, 120, 78, 0.5] : null;
    },
    cellIn: () => true,
  });
  for (const m of over) { m.userData.noRelief = true; group.add(m); }
  group.userData.crowns = crowns.length;
  return group;
}
