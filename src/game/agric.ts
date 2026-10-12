// The Agriculture side south of Dr J.B. Danquah Avenue (the owner's 16-pair brief; cameras in agviews.ts, numbers in
// agplan.ts). Each model stands on its mapped outline; the photographs give storeys, roofs, openings and ground:
// - the long east block by E.A. Boateng Road (pairs 1-4): one connected two-level building under red corrugated roofs
//   (a long hip with intersecting cross-gables at both ends), deep black fascia, varied upper windows and vents, a lower
//   storey of doors, windows, recessed bays and blank wall; the asphalt along its north side behind a long weathered
//   corrugated hoarding; the worn hardstand at its east end with the small low shelter, the sheet-metal enclosure, the
//   raised landing with black rails, temporary panels, the large tree;
// - the Child Study Centre (pair 5): low white buildings with colour-blocked lower walls under red tiles, the gable to the
//   north; its yard of pale gravel curving round a bare planted island, red and green edging and painted tyres, a few
//   play pieces; the mesh fence and the tall mesh gate on a concrete threshold by Onyaa Road (closed);
// - the Department of Agriculture Economics and Agribusiness (pair 6): one storey with a covered colonnade on its west
//   side, square white columns with red-brown feet, the tiled veranda a step up, black shutters and doors, the raised
//   planted bed with its low laterite edge, potted plants, short steps;
// - the Biotechnology Centre (pairs 7-9): one L-shaped two-level building, the long tiled wing and the tall mostly blank
//   white gable to the north with its sign, two AC units, the barred entrance recess and the red-brown base; the clipped
//   hedge, the central path, pruned trees; parking toward the road;
// - the West Africa Centre for Crop Improvement building (pairs 10-13): four levels under several intersecting hipped
//   terracotta roofs, the stacked patterned screens on the left of the front, the central recess, the tall glazed entrance
//   on the right between white piers, canopy lines; the rear wing's four tiers of windows and balcony rails on a raised
//   base; black water tanks on a pale plinth; the low service wing; the pale paved forecourt with bays, curved planted
//   islands, a light carport and the big branching tree; grass and a narrow path behind;
// - the low roadside group west of it (pair 14): one-storey white wings on red bases under weathered tile gables, the
//   barred opening, a breeze-block wall, a hedge; the worn asphalt apron and the huge tree in its curbed island;
// - Akuafo Road (pairs 15, 16): the brick footway and the shallow open drain along its west side, the curved brick corner
//   at Onyaa Road, the green sheet fence round the corner plot, the big trunks; Soil Science as low gabled and hipped
//   wings set back behind the trees.
// Nothing is measured: storey heights, depths and positions not in the map data are read from the photographs.
import * as THREE from 'three';
import { BUILDINGS } from './campusmap';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { Bag, RED_BASE, SOFF, WALL, facesOf, gh, hash, lowWing, openings, tuft, vnoise, wallSolids, type R4 } from './enkit';
import { gableTri } from './ias';
import { hipRoof } from './waccbip';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { rectsOf } from './rectilinear';
import { car } from './cc';
import { SOLIDS } from './solids';
import { Roof, canvas, type Part } from './modelkit';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, WALL) };
const footprint = (x0: number, x1: number, z0: number, z1: number) => BUILDINGS.find((b) => Math.abs(b.minX - x0) < 0.4 && Math.abs(b.maxX - x1) < 0.4 && Math.abs(b.minZ - z0) < 0.4 && Math.abs(b.maxZ - z1) < 0.4);
const ringOf = (b: { pts: Float32Array }) => { const r: [number, number][] = []; for (let i = 0; i < b.pts.length; i += 2) r.push([b.pts[i], b.pts[i + 1]]); return r; };
const centre = (b: { pts: Float32Array }): [number, number] => {
  const rs = rectsOf(ringOf(b)), r = rs.reduce((m, q) => ((q[1] - q[0]) * (q[3] - q[2]) > (m[1] - m[0]) * (m[3] - m[2]) ? q : m), rs[0]);
  return [(r[0] + r[1]) / 2, (r[2] + r[3]) / 2];
};
const texCache = new Map<string, THREE.Texture>();
const tex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, clamp = true) => {
  let t = texCache.get(key);
  if (!t) { t = canvas(w, h, draw); if (clamp) t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; texCache.set(key, t); }
  return t;
};
/** a sign face drawn on a canvas, as a plane facing +z turned by ry, centred at world x, y, z */
function board(b: Bag, k: Kit, t: THREE.Texture, x: number, y: number, z: number, w: number, h: number, ry: number) {
  k.meshes.push(new THREE.Mesh(new THREE.PlaneGeometry(w, h).rotateY(ry).translate(x - b.O[0], y, z - b.O[1]), new THREE.MeshBasicMaterial({ map: t })));
}
const matCache = new Map<string, THREE.Material>();
/** a textured, see-through-where-transparent material from a canvas (mesh, lattice, corrugation) */
const mat = (key: string, make: () => THREE.Material) => { let m = matCache.get(key); if (!m) { m = make(); matCache.set(key, m); } return m; };
/** corrugated metal: ribs running down the slope (the roof's u runs along the eaves in 2 m units) */
const corrugated = () => mat('corr', () => {
  const t = canvas(64, 16, (g) => { for (let i = 0; i < 64; i++) { const v = 200 + Math.round(Math.sin((i / 64) * Math.PI * 2 * 13) * 38); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(i, 0, 1, 16); } }, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return new THREE.MeshStandardMaterial({ map: t, vertexColors: true, roughness: 0.6, metalness: 0.35, side: THREE.DoubleSide });
});
/** the weathered corrugated hoarding: grey-silver sheets with rust and grime, vertical ribs */
const hoardTex = () => tex('hoard', 256, 128, (g) => {
  g.fillStyle = '#9da09f'; g.fillRect(0, 0, 256, 128);
  for (let x = 0; x < 256; x += 4) { g.fillStyle = x % 8 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)'; g.fillRect(x, 0, 2, 128); }
  for (let i = 0; i < 40; i++) { const x = (i * 53) % 256, w = 6 + (i % 5) * 5, h = 30 + (i % 7) * 12; const gr = g.createLinearGradient(0, 128 - h, 0, 128); gr.addColorStop(0, 'rgba(120,70,40,0)'); gr.addColorStop(1, 'rgba(120,70,40,0.55)'); g.fillStyle = gr; g.fillRect(x, 128 - h, w, h); }
  for (let x = 0; x < 256; x += 64) { g.fillStyle = 'rgba(30,30,30,0.35)'; g.fillRect(x, 0, 2, 128); }
}, false);
/** the stacked decorative metal screens: a white lattice of interlocking squares, open between */
const latticeMat = () => mat('lattice', () => {
  const t = canvas(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64); g.strokeStyle = '#ecebe6'; g.lineWidth = 5;
    g.strokeRect(6, 6, 52, 52); g.beginPath(); g.moveTo(32, 2); g.lineTo(62, 32); g.lineTo(32, 62); g.lineTo(2, 32); g.closePath(); g.stroke();
    g.beginPath(); g.arc(32, 32, 9, 0, Math.PI * 2); g.stroke();
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6 });
});
/** weld mesh for the fence and gate: green wire squares */
const meshMat = () => mat('weld', () => {
  const t = canvas(32, 32, (g) => { g.clearRect(0, 0, 32, 32); g.strokeStyle = 'rgba(40,70,48,0.95)'; g.lineWidth = 2; g.strokeRect(1, 1, 30, 30); });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.3 });
});
/** a plane of a repeating see-through material from world a to world c (vertical), y0..y1, its texture repeating every `rep` m */
function sheet(b: Bag, list: THREE.BufferGeometry[], ax: number, az: number, cx: number, cz: number, y0: number, y1: number, rep: number) {
  const L = Math.hypot(cx - ax, cz - az), g = new THREE.PlaneGeometry(L, y1 - y0), uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * L) / rep, (uv.getY(i) * (y1 - y0)) / rep);
  list.push(g.rotateY(-Math.atan2(cz - az, cx - ax)).translate((ax + cx) / 2 - b.O[0], (y0 + y1) / 2, (az + cz) / 2 - b.O[1]));
}
const meshOf = (list: THREE.BufferGeometry[], m: THREE.Material) => { const me = new THREE.Mesh(mergeAll(list), m); me.userData.noCollide = true; return me; };
function mergeAll(list: THREE.BufferGeometry[]) {
  const pos: number[] = [], uv: number[] = [], nor: number[] = [];
  for (const g0 of list) { const g = g0.index ? g0.toNonIndexed() : g0; pos.push(...(g.attributes.position.array as Float32Array)); uv.push(...(g.attributes.uv.array as Float32Array)); nor.push(...(g.attributes.normal.array as Float32Array)); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return g;
}
/** worn ground of a given base colour with darker stains (asphalt, hardstand, gravel) */
const worn = (r: number, g: number, bl: number, s = 0.06) => (x: number, z: number): [number, number, number] => {
  const n = vnoise(x * 0.3, z * 0.3), m = hash(Math.floor(x * 3), Math.floor(z * 3)) * s;
  const d = n > 0.72 ? 0.07 : 0;
  return [r - m - d, g - m - d, bl - m - d];
};

// ---------- the long east block by E.A. Boateng Road (pairs 1-4) ----------
const EAST = footprint(516.7, 594.5, 214.4, 249.5);
/** the two small outlines on the hardstand: the low shelter (south) and the sheet-metal enclosure (north) */
const SHELTER = footprint(598.8, 605.2, 242.2, 252.6), ENCL = footprint(600.7, 605.4, 233.4, 238.7);
const EO: [number, number] = [555.6, 232];
const eastSpec: Spec = {
  name: 'East block by E.A. Boateng Road', axis: [1, 0], origin: EO, storey: 3.6, style: PLAIN, roofColor: '#b8473a', fascia: '#1d1b1a', pitch: 0.3,
  replaces: [EAST, SHELTER, ENCL].filter((q) => !!q).map((q) => centre(q!)),
  onGround: true,
  blocks: [],
  keep: [[510 - EO[0], 625 - EO[0], 200 - EO[1], 262 - EO[1]]],
  extras: (k: Kit) => {
    if (!EAST) return;
    const b = new Bag(EO), y = Math.min(gh(517, 215), gh(594, 249), gh(594, 215), gh(517, 249)), X0 = 516.9, X1 = 594.3, Z0 = 215.0, Z1 = 249.0, fh = 3.6, e = y + 2 * fh + 0.4;
    const M = (x: number, z: number): [number, number] => [x - EO[0], z - EO[1]];
    const W2 = '#f0eee8';
    b.c.push([b.B(X0, X1, y - 0.3, e, Z0, Z1), W2], [b.B(X0 - 0.04, X1 + 0.04, y - 0.3, y + 0.45, Z0 - 0.04, Z1 + 0.04), '#8b8478']);
    b.c.push([b.B(X0 - 0.06, X1 + 0.06, y + fh - 0.1, y + fh + 0.15, Z0 - 0.06, Z1 + 0.06), '#e2dfd7']);
    // ---- the roofs: red corrugated metal, a long hip with cross-gables at both ends at the same ridge; a deep black fascia ----
    const roof = new Roof(new THREE.Color('#b8473a')), rk = { roof } as unknown as Kit, ov = 1.2, P = 0.3, half = (Z1 - Z0) / 2 + ov;
    hipRoof(rk, M, X0 + 15 - ov, X1 - 15 + ov, Z0 - ov, Z1 + ov, e, P, 'x', [{ gw: 0, tri: false }, { gw: 0, tri: false }], b.c, '#1d1b1a');
    for (const [w0, w1] of [[X0, X0 + 17], [X1 - 17, X1]]) {
      roof.c = new THREE.Color('#ad4236');
      const a0 = w0 - ov, a1 = w1 + ov, hw = (a1 - a0) / 2, cp = (half * P) / hw;
      hipRoof(rk, M, a0, a1, Z0 - ov, Z1 + ov, e, cp, 'z', [{ gw: 99, tri: false }, { gw: 99, tri: false }], b.c, '#1d1b1a');
      for (const [z, out] of [[Z0, -1], [Z1, 1]] as [number, number][]) gableTri(b, true, z, out, w0, w1, e, ((hw * cp) / ((w1 - w0) / 2)) * 0.97, W2);
    }
    const rm = new THREE.Mesh(roof.geometry(), corrugated()); rm.castShadow = true; rm.receiveShadow = true; k.meshes.push(rm);
    // the black fascia boards and the soffits
    for (const [x0, x1, z0, z1] of [[X0 - ov, X1 + ov, Z0 - ov, Z0 - ov + 0.1], [X0 - ov, X1 + ov, Z1 + ov - 0.1, Z1 + ov], [X0 - ov, X0 - ov + 0.1, Z0 - ov, Z1 + ov], [X1 + ov - 0.1, X1 + ov, Z0 - ov, Z1 + ov]] as R4[]) b.c.push([b.B(x0, x1, e - 0.55, e + 0.05, z0, z1), '#1d1b1a']);
    b.c.push([b.B(X0 - ov, X1 + ov, e - 0.58, e - 0.55, Z0 - ov, Z1 + ov), '#3a3734']);
    // ---- the long sides: an upper storey of larger and smaller dark windows and high vents, the lower storey a sequence
    // of door, window, recessed open bay and blank wall between white piers ----
    const UP = ['L', 'L', 's', 'L', 'v', 'L', 'L', 's', 'v', 'L', 'L', '-', 'L', 's', 'L', 'v', 'L', 'L', 's', 'L'];
    const LO = ['D', 'W', 'R', '-', 'W', 'R', 'R', 'D', '-', 'W', 'R', 'W', '-', 'R', 'D', 'W', '-', 'R', 'W', 'R'];
    for (const [zf, out] of [[Z0, -1], [Z1, 1]] as [number, number][]) {
      const n = 20, step = (X1 - X0) / n;
      for (let i = 0; i < n; i++) {
        const a = X0 + step * (i + 0.5), u = UP[(i + (out > 0 ? 7 : 0)) % UP.length], l = LO[(i + (out > 0 ? 5 : 0)) % LO.length], fz = zf + out * 0.04;
        if (u === 'L') b.win.push(b.plane(true, fz, out, a, 2.1, y + fh + 0.9, y + fh + 2.6));
        if (u === 's') { b.win.push(b.plane(true, fz, out, a - 0.7, 0.8, y + fh + 1.5, y + fh + 2.6)); b.win.push(b.plane(true, fz, out, a + 0.7, 0.8, y + fh + 1.5, y + fh + 2.6)); }
        if (u === 'v' || i % 4 === 1) b.grille.push(b.plane(true, fz, out, a + (u === 'v' ? 0 : 1.3), 1.4, y + fh + 2.75, y + fh + 3.05));
        if (l === 'W') b.grille.push(b.plane(true, fz, out, a, 1.6, y + 0.9, y + 2.4));
        if (l === 'D') b.door.push(b.plane(true, fz, out, a, 1.1, y, y + 2.3));
        if (l === 'R') {
          // an open recessed bay: the wall set back, its dark back, a lintel
          b.c.push([b.B(a - step / 2 + 0.45, a + step / 2 - 0.45, y - 0.25, y + fh - 0.35, Math.min(zf, zf + out * 0.03), Math.max(zf, zf + out * 0.03)), '#262829']);
          for (const s2 of [-1, 1]) b.c.push([b.B(a + s2 * (step / 2 - 0.45) - 0.12, a + s2 * (step / 2 - 0.45) + 0.12, y - 0.3, y + fh - 0.35, Math.min(zf, zf + out * 0.2), Math.max(zf, zf + out * 0.2)), '#f6f5f1']);
        }
        b.c.push([b.B(X0 + step * i - 0.18, X0 + step * i + 0.18, y - 0.3, y + fh, Math.min(zf, zf + out * 0.12), Math.max(zf, zf + out * 0.12)), '#f6f5f1']);
      }
    }
    // the west end toward E.A. Boateng Road: windows both storeys
    openings(b, facesOf([X0, X1, Z0, Z1]).x0, 'W-WW-WW-W', y); openings(b, facesOf([X0, X1, Z0, Z1]).x0, 'W-WW-WW-W', y + fh);
    // ---- the east end (pairs 2, 3): ground-floor entrance recesses, the short raised landing with black rails, varied
    // upper glazing, narrow high vents ----
    for (const [a0, a1] of [[229.5, 232.5], [235.5, 238.5]]) { b.c.push([b.B(X1 - 1.8, X1 + 0.02, y - 0.3, y + 2.9, a0, a1), '#2a2c2d']); b.door.push(b.plane(false, X1 - 1.78, 1, (a0 + a1) / 2, 1.2, y, y + 2.3)); }
    for (const [z, w, y0, y1] of [[218.5, 2.4, 1.0, 2.7], [223.5, 1.4, 1.4, 2.7], [228, 2.4, 1.0, 2.7], [233, 2.4, 1.0, 2.7], [238, 1.6, 1.0, 2.7], [243, 2.4, 1.0, 2.7], [246.6, 1.0, 1.6, 2.7]] as [number, number, number, number][]) b.win.push(b.plane(false, X1 + 0.04, 1, z, w, y + fh + y0, y + fh + y1));
    for (const z of [221, 241]) b.grille.push(b.plane(false, X1 + 0.04, 1, z, 0.3, y + fh + 1.2, y + fh + 3.0));
    for (const z of [244.5]) b.grille.push(b.plane(false, X1 + 0.04, 1, z, 1.6, y + 0.9, y + 2.4));
    const LZ0 = 220.5, LZ1 = 226.5, lh = 0.9;
    b.c.push([b.B(X1, X1 + 2.2, y - 0.3, y + lh, LZ0, LZ1), '#b9b4aa']);
    for (let i = 0; i < 5; i++) b.c.push([b.B(X1 + 2.2, X1 + 2.2 + 0.3 * (5 - i), y - 0.3, y + (lh * (i + 1)) / 5, LZ1 - 1.4, LZ1), '#c2bdb3']);
    for (const z of [LZ0, LZ0 + 2, LZ0 + 4]) b.c.push([b.B(X1 + 2.1, X1 + 2.16, y + lh, y + lh + 1.0, z - 0.03, z + 0.03), '#141414']);
    b.c.push([b.B(X1 + 2.08, X1 + 2.18, y + lh + 0.95, y + lh + 1.02, LZ0, LZ1 - 1.4), '#141414'], [b.B(X1, X1 + 2.18, y + lh + 0.95, y + lh + 1.02, LZ0 - 0.04, LZ0 + 0.04), '#141414']);
    b.door.push(b.plane(false, X1 + 0.03, 1, 223.5, 1.1, y + lh, y + lh + 2.2));
    wallSolids(X1 + 1.1, LZ0, X1 + 1.1, LZ1, 1.1);
    wallSolids(X0, Z0, X1, Z0); wallSolids(X1, Z0, X1, Z1); wallSolids(X1, Z1, X0, Z1); wallSolids(X0, Z1, X0, Z0);
    // ---- the ground: the asphalt along the north side from E.A. Boateng Road to the hardstand, a narrow concrete edge;
    // the worn hardstand at the east end; dusty margins with sparse weeds; bare earth patches ----
    k.meshes.push(new THREE.Mesh(drapeAt(EO, 512.8, 607, 206.5, 213.2, 0.5, 0.04, worn(0.36, 0.36, 0.37, 0.04)), groundCover()));
    k.meshes.push(new THREE.Mesh(drapeAt(EO, 512.8, 594.3, 213.2, 215.0, 0.5, 0.05, worn(0.62, 0.6, 0.56)), groundCover()));
    k.meshes.push(new THREE.Mesh(drapeAt(EO, 594.3, 607, 213.2, 251, 0.5, 0.045, (x, z) => { const n = vnoise(x * 0.25, z * 0.25); return n > 0.68 ? [0.56, 0.48, 0.38] : worn(0.42, 0.41, 0.4, 0.05)(x, z); }), groundCover()));
    k.meshes.push(new THREE.Mesh(drapeAt(EO, 512.8, 594.3, 249.0, 252.5, 0.5, 0.04, (x, z) => (vnoise(x * 0.4, z * 0.4) > 0.5 ? [0.55, 0.42, 0.3] : null)), groundCover()));
    for (let i = 0; i < 60; i++) { const x = 595 + hash(i, 3) * 12, z = 213.5 + hash(i, 5) * 37; if (vnoise(x * 0.25, z * 0.25) > 0.6) tuft(b, x, z, 0.25 + hash(i, 7) * 0.3, ['#8a9450', '#7d8a44', '#9a9a58'][i % 3]); }
    // the long weathered corrugated hoarding along the north side, close to the road's edge, on timber posts
    const hl: THREE.BufferGeometry[] = [];
    for (const [x0, x1] of [[521, 556], [558.5, 591.5]]) {
      sheet(b, hl, x0, 213.6, x1, 213.6, y, y + 2.4, 4.0);
      for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / Math.round((x1 - x0) / 2.6)) { b.c.push([b.B(x - 0.05, x + 0.05, y, y + 2.45, 213.7, 213.82), '#6b5a46']); }
      wallSolids(x0, 213.6, x1, 213.6, 0.2);
    }
    // the temporary panels on the east end's north corner (pair 3)
    sheet(b, hl, 595.0, 214.0, 599.5, 214.0, y, y + 2.2, 4.0); sheet(b, hl, 599.5, 214.0, 599.5, 219.0, y, y + 2.2, 4.0);
    wallSolids(595, 214, 599.5, 214, 0.2); wallSolids(599.5, 214, 599.5, 219, 0.2);
    const hm = new THREE.Mesh(mergeAll(hl), new THREE.MeshStandardMaterial({ map: hoardTex(), roughness: 0.7, metalness: 0.3, side: THREE.DoubleSide })); k.meshes.push(hm);
    // the small low shelter on the hardstand's south side: a hipped corrugated roof on posts, a low grilled front
    {
      const [x0, x1, z0, z1] = [599.2, 604.8, 243.4, 251.4], sy = gh(602, 247), sh = 2.4;
      for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { b.c.push([b.B(px - 0.08, px + 0.08, sy, sy + sh, pz - 0.08, pz + 0.08), '#5d4b3a']); SOLIDS.add(px, pz, 0.12); }
      b.c.push([b.B(x0, x1, sy, sy + 1.0, z1 - 0.1, z1), '#c9c3b6'], [b.B(x0, x0 + 0.1, sy, sy + 1.0, z0, z1), '#c9c3b6']);
      b.grille.push(b.plane(true, z1 - 0.12, -1, (x0 + x1) / 2, x1 - x0 - 0.4, sy + 1.0, sy + 2.2));
      roof.c = new THREE.Color('#9a5a3e');
      const sr = new Roof(new THREE.Color('#a8603f'));
      hipRoof({ roof: sr } as unknown as Kit, M, x0 - 0.5, x1 + 0.5, z0 - 0.5, z1 + 0.5, sy + sh, 0.35, 'x', [{ gw: 0, tri: false }, { gw: 0, tri: false }], b.c, '#3a2f29');
      k.meshes.push(new THREE.Mesh(sr.geometry(), corrugated()));
      wallSolids(x0, z1, x1, z1, 0.2);
    }
    // the sheet-metal service enclosure before the east end
    const ey = gh(603, 236);
    b.c.push([b.B(601.0, 605.1, ey, ey + 2.3, 233.7, 238.4), '#b7bcbf'], [b.B(600.9, 605.2, ey + 2.3, ey + 2.38, 233.6, 238.5), '#9fa5a9']);
    for (let z = 233.9; z < 238.3; z += 0.5) b.c.push([b.B(600.96, 601.0, ey + 0.1, ey + 2.2, z, z + 0.04), '#8e9497']);
    b.door.push(b.plane(false, 600.95, -1, 236.0, 1.0, ey, ey + 2.0));
    wallSolids(601.0, 233.7, 601.0, 238.4, 0.3); wallSolids(605.1, 233.7, 605.1, 238.4, 0.3); wallSolids(601, 233.7, 605.1, 233.7, 0.3); wallSolids(601, 238.4, 605.1, 238.4, 0.3);
    // the large branching tree at the hardstand's north-east, trees behind and beside the block
    broadleaf(k, b.leaf, 604.5, 211.0, { h: 12, spread: 19, seed: 61, origin: EO });
    for (const [x, z, h, s] of [[566, 256.5, 10, 15], [586, 257, 11, 16], [540, 257, 10, 14], [523, 256.5, 9, 13], [530, 203.5, 10, 15], [575, 203.5, 10.5, 16]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x + z, origin: EO });
    // the white pickup on the hardstand (pair 2; a removable prop)
    car(k, 597.6 - EO[0], 244.5 - EO[1], '#e8e6dd', gh(597.6, 244.5), 0.1);
    b.finish(k, 0.45);
  },
};

// ---------- the Child Study Centre (pair 5) ----------
const CSC = footprint(417.2, 437.0, 286.9, 326.4);
const CO: [number, number] = [427, 300];
const cscSpec: Spec = {
  name: 'Child Study Centre', axis: [1, 0], origin: CO, storey: 3.2, style: PLAIN, roofColor: '#b65a3c', fascia: '#4a3328', pitch: 0.45, plinth: RED_BASE,
  replaces: CSC ? [centre(CSC)] : [],
  onGround: true,
  blocks: [],
  keep: [[415 - CO[0], 440 - CO[0], 266 - CO[1], 328 - CO[1]]],
  extras: (k: Kit) => {
    if (!CSC) return;
    const b = new Bag(CO), y = gh(427, 310), M = (x: number, z: number): [number, number] => [x - CO[0], z - CO[1]];
    // the low gable-fronted building, its gable to the yard, colour-blocked lower walls; the connected low rear range
    const [gx0, gx1, gz0, gz1] = [419.5, 434.5, 303.5, 318.5], ge = y + 3.0;
    b.c.push([b.B(gx0, gx1, y - 0.3, ge, gz0, gz1), WALL]);
    const blocks = ['#c43b2f', '#2f6fb3', '#e0b43a', '#3f8a3a'];
    for (let x = gx0, i = 0; x < gx1 - 0.01; x += 1.5, i++) b.c.push([b.B(x, Math.min(gx1, x + 1.5), y - 0.3, y + 1.0, gz0 - 0.04, gz0), blocks[i % 4]]);
    for (const [x, out] of [[gx0, -1], [gx1, 1]] as [number, number][]) for (let z = gz0, i = 0; z < gz1 - 0.01; z += 1.5, i++) b.c.push([b.B(Math.min(x, x + out * 0.04), Math.max(x, x + out * 0.04), y - 0.3, y + 1.0, z, Math.min(gz1, z + 1.5)), blocks[(i + 2) % 4]]);
    k.roof.c = new THREE.Color('#b65a3c');
    hipRoof(k, M, gx0 - 0.7, gx1 + 0.7, gz0 - 0.8, gz1, ge - 0.3, 0.45, 'z', [{ gw: 99, tri: false }, { gw: 0, tri: false }], b.c, '#4a3328');
    gableTri(b, true, gz0, -1, gx0, gx1, ge, 0.45 * (7.5 + 0.7) / 7.5 * 0.97);
    b.door.push(b.plane(true, gz0 - 0.05, -1, 427, 1.2, y, y + 2.2));
    for (const x of [422.5, 431.5]) b.win.push(b.plane(true, gz0 - 0.05, -1, x, 1.4, y + 1.1, y + 2.3));
    openings(b, facesOf([gx0, gx1, gz0, gz1]).x0, 'W-W-W', y); openings(b, facesOf([gx0, gx1, gz0, gz1]).x1, 'WDW-W', y);
    lowWing(k, b, [417.6, 436.7, 318.5, 326.1], { eave: 2.8, faces: { x0: 'W-', x1: 'WD', z1: 'W-W-W-' }, along: 'x', roof: '#b65a3c', y });
    k.roof.c = new THREE.Color('#b65a3c');
    wallSolids(gx0, gz0, gx1, gz0); wallSolids(gx0, gz0, gx0, gz1); wallSolids(gx1, gz0, gx1, gz1);
    // ---- the yard: pale gravel curving round the bare planted island, the red-and-green edging, painted tyres ----
    const [yx0, yx1, yz0, yz1] = [417.6, 436.6, 268.8, 303.4];
    const islandD = (x: number, z: number) => Math.hypot((x - 432.5) / 4.2, (z - 287) / 9.5);
    k.meshes.push(new THREE.Mesh(drapeAt(CO, yx0, yx1, yz0, yz1, 0.4, 0.05, (x, z) => {
      const m = hash(Math.floor(x * 5), Math.floor(z * 5)) * 0.08, n = vnoise(x * 0.4, z * 0.4);
      if (islandD(x, z) < 1) return [0.5 + n * 0.06, 0.34 + n * 0.04, 0.24];
      return n > 0.75 ? [0.62 - m, 0.58 - m, 0.52 - m] : [0.76 - m, 0.74 - m, 0.7 - m];
    }), groundCover()));
    for (let i = 0; i < 48; i++) {
      const t = (i / 48) * Math.PI * 2, x = 432.5 + Math.cos(t) * 4.25, z = 287 + Math.sin(t) * 9.6;
      if (x > yx1 - 0.3 || x < yx0 + 0.3) continue;
      b.c.push([new THREE.BoxGeometry(0.16, 0.22, 1.3).rotateY(-t).translate(x - CO[0], gh(x, z) + 0.06, z - CO[1]), i % 2 ? '#3f8a3a' : '#c43b2f']);
    }
    for (let i = 0; i < 10; i++) {
      const z = 276 + i * 2.2, x = 421 + Math.sin(i * 0.5) * 1.2, ty = gh(x, z);
      b.c.push([new THREE.TorusGeometry(0.42, 0.14, 6, 14).rotateX(Math.PI / 2).translate(x - CO[0], ty + 0.12, z - CO[1]), ['#e0b43a', '#2f6fb3', '#c43b2f', '#3f8a3a', '#f2f2ee'][i % 5]]);
      SOLIDS.add(x, z, 0.5);
    }
    for (let i = 0; i < 9; i++) tuft(b, 431 + hash(i, 3) * 3, 280 + hash(i, 5) * 14, 0.5 + hash(i, 7) * 0.5, '#6b7a3a');
    // a few play pieces: a small slide and a swing frame near the back, the blue canopy on the right
    const py = gh(424, 299);
    b.c.push([new THREE.BoxGeometry(0.6, 0.06, 3.0).rotateX(0.55).translate(424 - CO[0], py + 0.85, 299 - CO[1]), '#e0b43a'], [b.B(423.6, 424.4, py, py + 1.65, 300.2, 300.6), '#2f6fb3']);
    for (const x of [428.5, 431.5]) for (const z of [297.5, 299.5]) b.c.push([new THREE.CylinderGeometry(0.05, 0.05, 2.3, 6).rotateX(z < 298.5 ? 0.18 : -0.18).translate(x - CO[0], py + 1.1, 298.5 + (z - 298.5) * 0.5 - CO[1]), '#c43b2f']);
    b.c.push([b.B(428.5, 431.5, py + 2.2, py + 2.28, 298.45, 298.55), '#c43b2f']);
    SOLIDS.add(424, 299.5, 0.8); SOLIDS.add(430, 298.5, 1.2);
    for (const [px, pz] of [[433.6, 293], [436.2, 293], [433.6, 298], [436.2, 298]]) b.c.push([b.B(px - 0.05, px + 0.05, py, py + 2.5, pz - 0.05, pz + 0.05), '#d9dcdf']);
    b.c.push([new THREE.BoxGeometry(3.4, 0.06, 6).rotateZ(0.08).translate(434.9 - CO[0], py + 2.6, 295.5 - CO[1]), '#2a64b8']);
    // ---- the mesh fence round the yard and the tall mesh gate on its concrete threshold (closed) ----
    const ml: THREE.BufferGeometry[] = [], fy = gh(427, 268.6), FZ = 268.8, G0 = 424.4, G1 = 429.6;
    const post = (x: number, z: number, h = 2.1) => { b.c.push([b.B(x - 0.04, x + 0.04, fy, fy + h, z - 0.04, z + 0.04), '#2f5a3a']); SOLIDS.add(x, z, 0.08); };
    for (const [ax, az, cx, cz] of [[yx0, FZ, G0, FZ], [G1, FZ, yx1, FZ], [yx0, FZ, yx0, 303.5], [yx1, FZ, yx1, 303.5]] as R4[]) {
      sheet(b, ml, ax, az, cx, cz, fy + 0.05, fy + 2.0, 0.2);
      const L = Math.hypot(cx - ax, cz - az), n = Math.max(1, Math.round(L / 2.5));
      for (let i = 0; i <= n; i++) post(ax + ((cx - ax) * i) / n, az + ((cz - az) * i) / n);
      wallSolids(ax, az, cx, cz, 0.15);
    }
    // the gate: two leaves in heavy green frames between tall posts
    for (const x of [G0, G1]) b.c.push([b.B(x - 0.08, x + 0.08, fy, fy + 2.7, FZ - 0.08, FZ + 0.08), '#245234']);
    for (const [a0, a1] of [[G0 + 0.1, 427 - 0.03], [427 + 0.03, G1 - 0.1]]) {
      sheet(b, ml, a0, FZ, a1, FZ, fy + 0.1, fy + 2.45, 0.2);
      for (const yy of [fy + 0.08, fy + 2.45]) b.c.push([b.B(a0, a1, yy, yy + 0.06, FZ - 0.03, FZ + 0.03), '#245234']);
      for (const x of [a0, a1]) b.c.push([b.B(x - 0.03, x + 0.03, fy + 0.08, fy + 2.5, FZ - 0.03, FZ + 0.03), '#245234']);
    }
    wallSolids(G0, FZ, G1, FZ, 0.2);
    b.c.push([b.B(G0 - 0.4, G1 + 0.4, fy - 0.1, fy + 0.08, FZ - 1.6, FZ + 0.4), '#c3bdb2']);
    k.meshes.push(meshOf(ml, meshMat()));
    for (const [x, z, h, s] of [[440.5, 280, 9, 13], [415.4, 313, 9.5, 14], [440, 318, 8.5, 12]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x + z * 2, origin: CO });
    b.finish(k, 0.35);
  },
};

// ---------- the Department of Agriculture Economics and Agribusiness colonnade (pair 6) ----------
const AGE = footprint(397.4, 406.4, 231.0, 254.2);
const AO: [number, number] = [402, 242.6];
const agEconSpec: Spec = {
  name: 'Department of Agriculture Economics and Agribusiness', axis: [1, 0], origin: AO, storey: 3.3, style: PLAIN, roofColor: '#9a4f36', fascia: '#2a2421', pitch: 0.42, plinth: RED_BASE,
  replaces: AGE ? [centre(AGE)] : [],
  onGround: true,
  blocks: [],
  keep: [[392 - AO[0], 408 - AO[0], 229 - AO[1], 257 - AO[1]]],
  extras: (k: Kit) => {
    if (!AGE) return;
    const b = new Bag(AO), y = gh(402, 242.6), X0 = 397.5, XW = 400.5, X1 = 406.3, Z0 = 231.1, Z1 = 254.1, e = y + 3.2, fl = 0.3;
    const M = (x: number, z: number): [number, number] => [x - AO[0], z - AO[1]];
    // the rooms behind the veranda: white, a red-brown base; the roof over both, deep dark eaves
    b.c.push([b.B(XW, X1, y - 0.3, e, Z0, Z1), WALL], [b.B(XW - 0.04, X1 + 0.04, y - 0.3, y + 0.9, Z0 - 0.04, Z1 + 0.04), '#8c3a2a']);
    k.roof.c = new THREE.Color('#9a4f36');
    hipRoof(k, M, X0 - 0.8, X1 + 0.8, Z0 - 0.8, Z1 + 0.8, e - 0.3, 0.42, 'z', [{ gw: 0, tri: false }, { gw: 0, tri: false }], b.c, '#2a2421');
    b.c.push([b.B(X0 - 0.8, X1 + 0.8, e - 0.36, e - 0.3, Z0 - 0.8, Z1 + 0.8), '#3a332e']);
    // the veranda: its tiled floor a step up with a dark edge, the square white columns with red-brown feet
    b.c.push([b.B(X0, XW, y - 0.3, y + fl, Z0, Z1), '#a8553c'], [b.B(X0 - 0.05, X0 + 0.15, y - 0.3, y + fl + 0.02, Z0, Z1), '#6e3a2a']);
    for (let z = Z0 + 0.3; z <= Z1 - 0.29; z += (Z1 - Z0 - 0.6) / 7) {
      b.c.push([b.B(X0 + 0.05, X0 + 0.45, y + fl, e - 0.3, z - 0.2, z + 0.2), '#f4f2ec'], [b.B(X0 + 0.03, X0 + 0.47, y + fl, y + fl + 0.95, z - 0.22, z + 0.22), '#8c3a2a']);
      SOLIDS.add(X0 + 0.25, z, 0.28);
    }
    // black shuttered windows and doors along the back wall, a plaque, potted plants and a bench
    const F = facesOf([XW, X1, Z0, Z1]);
    const doors = [234.5, 241.0, 248.5], wins = [237.6, 244.6, 251.6];
    for (const z of doors) { b.c.push([b.B(XW - 0.04, XW, y + fl, y + fl + 2.2, z - 0.55, z + 0.55), '#16181a']); }
    for (const z of wins) { b.c.push([b.B(XW - 0.05, XW, y + 1.0, y + 2.4, z - 0.75, z + 0.75), '#1d2022']); for (let yy = y + 1.1; yy < y + 2.35; yy += 0.16) b.c.push([b.B(XW - 0.09, XW - 0.05, yy, yy + 0.05, z - 0.72, z + 0.72), '#2e3235']); }
    b.c.push([b.B(XW - 0.05, XW, y + 1.6, y + 1.95, 245.9, 246.3), '#c9a54a']);
    for (const z of [236.0, 243.0, 250.0]) { b.c.push([new THREE.CylinderGeometry(0.28, 0.2, 0.55, 10).translate(X0 + 1.0 - AO[0], y + fl + 0.28, z - AO[1]), '#9c4a2e']); b.leaf.push([new THREE.IcosahedronGeometry(0.45, 0).translate(X0 + 1.0 - AO[0], y + fl + 0.85, z - AO[1]), '#3f6d2c']); SOLIDS.add(X0 + 1.0, z, 0.3); }
    b.c.push([b.B(XW - 0.7, XW - 0.3, y + fl + 0.42, y + fl + 0.5, 239.0, 240.6), '#2a64b8']);
    openings(b, F.x1, 'W-WDW-W', y);
    // the short steps at the north end, up to the veranda
    for (let i = 0; i < 2; i++) b.c.push([b.B(X0, XW, y - 0.3, y + (fl * (i + 1)) / 3, Z1 + 0.7 - i * 0.35, Z1 + 1.05 - i * 0.35), '#a9a59c']);
    wallSolids(XW, Z0, XW, Z1, 0.35); wallSolids(XW, Z0, X1, Z0); wallSolids(X1, Z0, X1, Z1); wallSolids(XW, Z1, X1, Z1);
    // the raised planted bed before the veranda: its low laterite edge, grass and shrubs; the narrow paved strip
    const [px0, px1] = [393.6, 397.0];
    k.meshes.push(new THREE.Mesh(drapeAt(AO, px0, px1, Z0, Z1, 0.4, 0.36, (x, z) => { const n = vnoise(x * 0.6, z * 0.6); return n > 0.7 ? [0.45, 0.33, 0.24] : [0.36 + n * 0.08, 0.5 + n * 0.06, 0.22]; }), groundCover()));
    b.c.push([b.B(px0 - 0.2, px0, y - 0.2, y + 0.38, Z0, Z1), '#9a5a3a'], [b.B(px1, px1 + 0.18, y - 0.2, y + 0.38, Z0, Z1), '#9a5a3a']);
    for (const z of [Z0, Z1]) b.c.push([b.B(px0 - 0.2, px1 + 0.18, y - 0.2, y + 0.38, z - 0.1, z + 0.1), '#9a5a3a']);
    for (let i = 0; i < 9; i++) b.leaf.push([new THREE.IcosahedronGeometry(0.35 + hash(i, 2) * 0.25, 0).translate(395.3 + (hash(i, 4) - 0.5) * 2 - AO[0], y + 0.7, Z0 + 1.5 + i * 2.5 - AO[1]), ['#3f6d2c', '#527f33', '#c64a3a'][i % 3]]);
    wallSolids(395.3, Z0, 395.3, Z1, 1.4);
    k.meshes.push(new THREE.Mesh(drapeAt(AO, px1 + 0.18, X0, Z0, Z1, 0.3, 0.05, worn(0.62, 0.6, 0.56)), groundCover()));
    broadleaf(k, b.leaf, 410.5, 257.5, { h: 9, spread: 13, seed: 17, origin: AO });
    b.finish(k, 0.4);
  },
};

// ---------- the Biotechnology Centre (pairs 7-9) ----------
const BIO = footprint(361.8, 393.2, 298.2, 326.3);
const BO: [number, number] = [377, 312];
const bioTex = () => tex('bio', 512, 200, (g) => {
  g.fillStyle = '#f4f4f1'; g.fillRect(0, 0, 512, 200); g.strokeStyle = '#2a3a6a'; g.lineWidth = 6; g.strokeRect(3, 3, 506, 194);
  g.fillStyle = '#1f3d7a'; g.beginPath(); g.moveTo(22, 40); g.lineTo(82, 40); g.lineTo(82, 100); g.quadraticCurveTo(52, 130, 22, 100); g.closePath(); g.fill();
  g.fillStyle = '#d6b44a'; g.fillRect(38, 56, 28, 7); g.fillRect(48, 48, 8, 40);
  g.fillStyle = '#1d2a4a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 40px Arial'; g.fillText('BIOTECHNOLOGY CENTRE', 290, 52);
  g.font = 'bold 30px Arial'; g.fillText('UNIVERSITY OF GHANA', 290, 110); g.fillText('LEGON', 290, 158);
});
const bioSpec: Spec = {
  name: 'Biotechnology Centre', axis: [1, 0], origin: BO, storey: 3.4, style: PLAIN, roofColor: '#a9523a', fascia: '#1f1c1b', pitch: 0.45, plinth: RED_BASE,
  replaces: BIO ? [centre(BIO)] : [],
  onGround: true,
  blocks: [],
  keep: [[356 - BO[0], 400 - BO[0], 283 - BO[1], 330 - BO[1]]],
  extras: (k: Kit) => {
    if (!BIO) return;
    const b = new Bag(BO), y = Math.min(gh(368, 299), gh(392, 325)), fh = 3.4, e = y + 2 * fh + 0.3;
    const M = (x: number, z: number): [number, number] => [x - BO[0], z - BO[1]];
    const WW: R4 = [362.4, 373.6, 298.4, 325.8], SW: R4 = [373.6, 393.0, 313.2, 325.8];
    for (const r of [WW, SW]) b.c.push([b.B(r[0], r[1], y - 0.3, e, r[2], r[3]), WALL], [b.B(r[0] - 0.04, r[1] + 0.04, y - 0.3, y + 0.8, r[2] - 0.04, r[3] + 0.04), '#8c3a2a']);
    // the roofs: the west wing gabled to the north (the tall signed gable), the long south wing hipped at its east end
    k.roof.c = new THREE.Color('#a9523a');
    const ov = 0.8, pw = 0.5;
    hipRoof(k, M, WW[0] - ov, WW[1] + ov, WW[2] - 0.5, WW[3] + ov, e - ov * pw * 0.5, pw, 'z', [{ gw: 99, tri: false }, { gw: 0, tri: false }], b.c, '#1f1c1b');
    const rw = (WW[1] - WW[0]) / 2 + ov, top = e - ov * pw * 0.5 + rw * pw, sh = (SW[3] - SW[2]) / 2 + ov, ps = (top - (e - ov * 0.3)) / sh;
    k.roof.c = new THREE.Color('#9e4c36');
    hipRoof(k, M, (WW[0] + WW[1]) / 2, SW[1] + ov, SW[2] - ov, SW[3] + ov, e - ov * 0.3, ps, 'x', [{ gw: 99, tri: false }, { gw: 0, tri: false }], b.c, '#1f1c1b');
    gableTri(b, true, WW[2], -1, WW[0], WW[1], e, ((pw * rw) / ((WW[1] - WW[0]) / 2)) * 0.97);
    // the dark roof edge over the gable: bargeboards
    for (const s of [-1, 1]) {
      const p = new THREE.Vector3(((WW[0] + WW[1]) / 2 + s * (rw)) - BO[0], e - ov * pw * 0.5, WW[2] - 0.5 - BO[1]), q = new THREE.Vector3((WW[0] + WW[1]) / 2 - BO[0], top, WW[2] - 0.5 - BO[1]), d = q.clone().sub(p);
      b.c.push([new THREE.BoxGeometry(0.16, 0.34, d.length()).lookAt(d).translate((p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2), '#1f1c1b']);
    }
    // ---- the gable (pairs 8, 9): blank white, the sign high, two AC units on the wall, the barred entrance recess ----
    const gz = WW[2], gx = (WW[0] + WW[1]) / 2;
    board(b, k, bioTex(), gx + 0.6, y + 5.0, gz - 0.06, 2.9, 1.13, Math.PI);
    b.c.push([b.B(gx - 0.95, gx + 2.15, y + 4.38, y + 5.62, gz - 0.05, gz), '#d9d9d4']);
    for (const x of [gx - 2.6, gx + 3.2]) { b.c.push([b.B(x - 0.42, x + 0.42, y + 3.2, y + 3.85, gz - 0.38, gz - 0.02), '#e2e2dc'], [b.B(x - 0.3, x + 0.3, y + 3.3, y + 3.75, gz - 0.39, gz - 0.38), '#4a4d50'], [b.B(x - 0.4, x - 0.36, y + 3.1, y + 3.2, gz - 0.4, gz), '#8a8d90']); }
    b.c.push([b.B(gx - 1.6, gx + 1.6, y - 0.3, y + 2.6, gz, gz + 1.4), '#232628']);
    b.grille.push(b.plane(true, gz - 0.02, -1, gx, 3.0, y, y + 2.5));
    b.c.push([b.B(gx - 1.8, gx + 1.8, y - 0.3, y + 0.12, gz - 1.0, gz), '#b7b1a6']);
    // ---- the long wing's elevations: an upper dark window band, lower barred windows and entrance recesses ----
    const band = (alongX: boolean, at: number, out: number, a0: number, a1: number) => {
      b.win.push(b.plane(alongX, at + out * 0.04, out, (a0 + a1) / 2, a1 - a0 - 1.2, y + fh + 1.0, y + fh + 2.3));
      const n = Math.max(1, Math.round((a1 - a0) / 3.2));
      for (let i = 0; i < n; i++) { const a = a0 + ((a1 - a0) * (i + 0.5)) / n; b.grille.push(b.plane(alongX, at + out * 0.04, out, a, 1.3, y + 1.0, y + 2.3)); }
      for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; b.c.push([alongX ? b.B(a - 0.12, a + 0.12, y + fh + 0.9, y + fh + 2.4, Math.min(at, at + out * 0.06), Math.max(at, at + out * 0.06)) : b.B(Math.min(at, at + out * 0.06), Math.max(at, at + out * 0.06), y + fh + 0.9, y + fh + 2.4, a - 0.12, a + 0.12), WALL]); }
    };
    band(false, WW[1], 1, WW[2] + 1, SW[2] - 0.5); band(false, WW[0], -1, WW[2] + 1, WW[3] - 1); band(true, SW[2], -1, SW[0] + 0.5, SW[1] - 1); band(true, SW[3], 1, WW[0] + 1, SW[1] - 1);
    for (const z of [306.5]) { b.c.push([b.B(WW[1] - 1.2, WW[1] + 0.02, y - 0.3, y + 2.6, z - 1.0, z + 1.0), '#26292b']); b.door.push(b.plane(false, WW[1] - 1.18, 1, z, 1.4, y, y + 2.3)); }
    for (const x of [386.5]) { b.c.push([b.B(x - 1.0, x + 1.0, y - 0.3, y + 2.6, SW[2] - 0.02, SW[2] + 1.2), '#26292b']); b.door.push(b.plane(true, SW[2] + 1.18, -1, x, 1.4, y, y + 2.3)); }
    b.grille.push(b.plane(false, SW[1] + 0.04, 1, 319.5, 1.4, y + 1.0, y + 2.3));
    wallSolids(WW[0], WW[2], WW[1], WW[2]); wallSolids(WW[0], WW[2], WW[0], WW[3]); wallSolids(WW[1], WW[2], WW[1], SW[2]); wallSolids(WW[1], SW[2], SW[1], SW[2]); wallSolids(SW[1], SW[2], SW[1], SW[3]); wallSolids(WW[0], SW[3], SW[1], SW[3]);
    // ---- before the gable: short turf, the narrow central path, the clipped hedge either side, pruned trees in wells ----
    k.meshes.push(new THREE.Mesh(drapeAt(BO, gx - 0.9, gx + 0.9, 288.6, gz - 1.0, 0.3, 0.05, worn(0.68, 0.66, 0.62)), groundCover()));
    for (const [a0, a1] of [[WW[0] - 4, gx - 1.3], [gx + 1.3, WW[1] + 6]]) {
      b.leaf.push([new THREE.BoxGeometry(a1 - a0, 1.1, 1.0).translate((a0 + a1) / 2 - BO[0], gh((a0 + a1) / 2, 289.6) + 0.55, 289.6 - BO[1]), '#3c6a2c']);
      for (let x = a0 + 0.4; x < a1; x += 0.9) b.leaf.push([new THREE.IcosahedronGeometry(0.42, 0).scale(1, 0.6, 0.9).translate(x - BO[0], gh(x, 289.6) + 1.1, 289.6 + (hash(x, 1) - 0.5) * 0.3 - BO[1]), hash(x, 2) > 0.5 ? '#43722f' : '#36622a']);
      wallSolids(a0, 289.6, a1, 289.6, 0.5);
    }
    for (const x of [gx - 4.6, gx - 2.2, gx + 2.4, gx + 4.8]) {
      const ty = gh(x, 295.8);
      b.c.push([new THREE.CylinderGeometry(0.08, 0.11, 1.6, 7).translate(x - BO[0], ty + 0.8, 295.8 - BO[1]), '#5a4a3b'], [b.B(x - 0.55, x + 0.55, ty - 0.05, ty + 0.1, 295.25, 296.35), '#9a958b']);
      b.leaf.push([new THREE.IcosahedronGeometry(0.85, 1).scale(0.9, 1.15, 0.9).translate(x - BO[0], ty + 2.25, 295.8 - BO[1]), '#3a6a2e']);
      SOLIDS.add(x, 295.8, 0.2);
    }
    // the parking toward the road: pale paving, a few cars and the white bus (removable props)
    k.meshes.push(new THREE.Mesh(drapeAt(BO, 375.5, 399, 284.2, 297, 0.5, 0.045, worn(0.6, 0.58, 0.55)), groundCover()));
    for (const [x, col] of [[379, '#c9ccd0'], [382.2, '#2b2e33'], [385.4, '#8a8f95'], [391.5, '#e4e4e0']] as [number, string][]) car(k, x - BO[0], 292 - BO[1], col, gh(x, 292), 0);
    {
      const bx = 395.4, bz = 291.5, by = gh(bx, bz), bus: Part[] = [[new THREE.BoxGeometry(2.4, 2.7, 9.5).translate(0, by + 1.65, 0), '#f1f1ee'], [new THREE.BoxGeometry(2.42, 0.9, 9.0).translate(0, by + 2.1, 0), '#2a3038'], [new THREE.BoxGeometry(2.42, 0.25, 9.52).translate(0, by + 0.6, 0), '#2f6fb3']];
      for (const [dx, dz] of [[-1.1, -3.2], [1.1, -3.2], [-1.1, 3.2], [1.1, 3.2]]) bus.push([new THREE.CylinderGeometry(0.45, 0.45, 0.3, 12).rotateZ(Math.PI / 2).translate(dx, by + 0.45, dz), '#1b1c1f']);
      for (const [g, col] of bus) b.c.push([g.translate(bx - BO[0], 0, bz - BO[1]), col]);
      SOLIDS.add(bx, bz - 3, 1.3); SOLIDS.add(bx, bz, 1.3); SOLIDS.add(bx, bz + 3, 1.3);
    }
    for (const [x, z, h, s] of [[358, 288, 9, 13], [398, 330, 10, 14], [356.5, 320, 9, 12]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x * 3 + z, origin: BO });
    b.finish(k, 0.35);
  },
};

// ---------- the West Africa Centre for Crop Improvement building (pairs 10-13) ----------
const WAC = footprint(277.6, 319.6, 288.1, 315.6);
const SERVICE = footprint(275.4, 287.0, 280.4, 286.3);
const WO: [number, number] = [298, 300.6];
const wacSpec: Spec = {
  name: 'West Africa Centre for Crop Improvement', axis: [1, 0], origin: WO, storey: 3.4, style: PLAIN, roofColor: '#b0563a', fascia: '#4a3328', pitch: 0.5,
  replaces: [WAC, SERVICE].filter((q) => !!q).map((q) => centre(q!)),
  onGround: true,
  blocks: [],
  keep: [[268 - WO[0], 326 - WO[0], 266 - WO[1], 336 - WO[1]]],
  extras: (k: Kit) => {
    if (!WAC) return;
    const b = new Bag(WO), y = Math.min(gh(283, 290), gh(319, 307), gh(296, 315)), base = 0.6, fh = 3.4, M = (x: number, z: number): [number, number] => [x - WO[0], z - WO[1]];
    // the masses (from the mapped outline): the west wing, its lower west projection, the central recessed block, the east
    // block with the tall entrance; each with its own hipped terracotta roof
    const MASS: { r: R4; lv: number; along: 'x' | 'z' }[] = [
      { r: [283.1, 296.0, 289.8, 315.6], lv: 4, along: 'z' },
      { r: [277.6, 283.1, 295.8, 310.3], lv: 3, along: 'z' },
      { r: [296.0, 304.2, 293.9, 309.2], lv: 4, along: 'x' },
      { r: [304.2, 316.3, 288.1, 307.4], lv: 4, along: 'z' },
      { r: [316.3, 319.6, 295.2, 307.4], lv: 3, along: 'z' },
    ];
    // the raised base all round, a grey paved apron at the back
    b.c.push([b.B(277.2, 320.0, y - 0.3, y + base, 287.7, 316.0), '#a9a49a']);
    for (const m of MASS) {
      const [x0, x1, z0, z1] = m.r, top = y + base + m.lv * fh + 0.3;
      b.c.push([b.B(x0, x1, y + base - 0.05, top, z0, z1), '#f3f2ee']);
      for (let l = 1; l < m.lv; l++) b.c.push([b.B(x0 - 0.06, x1 + 0.06, y + base + l * fh - 0.12, y + base + l * fh + 0.08, z0 - 0.06, z1 + 0.06), '#e6e4dd']);
      k.roof.c = new THREE.Color(m.lv === 4 ? '#b0563a' : '#a85138');
      hipRoof(k, M, x0 - 0.7, x1 + 0.7, z0 - 0.7, z1 + 0.7, top - 0.2, 0.5, m.along, [{ gw: 0, tri: false }, { gw: 0, tri: false }], b.c, '#4a3328');
      b.c.push([b.B(x0 - 0.7, x1 + 0.7, top - 0.27, top - 0.2, z0 - 0.7, z1 + 0.7), SOFF]);
    }
    const yb = y + base;
    // ---- the front (pair 11; from the road the east block is on the left): the east block's stacked patterned screens,
    // the central recess, the tall glazed entrance in the west wing between white piers ----
    const lat: THREE.BufferGeometry[] = [];
    for (let l = 0; l < 3; l++) for (const a of [307.0, 313.2]) {
      const y0 = yb + 0.5 + l * fh, y1 = y0 + fh - 0.9;
      b.win.push(b.plane(true, 288.1 - 0.06, -1, a, 3.4, y0, y1));
      sheet(b, lat, a - 1.8, 288.1 - 0.45, a + 1.8, 288.1 - 0.45, y0 - 0.05, y1 + 0.05, 0.9);
      b.c.push([b.B(a - 1.95, a + 1.95, y1 + 0.05, y1 + 0.2, 288.1 - 0.6, 288.1), '#f6f5f1']);
    }
    for (const x of [304.6, 310.1, 315.9]) b.c.push([b.B(x - 0.2, x + 0.2, yb, yb + 3 * fh + 0.2, 287.5, 288.1), '#f6f5f1']);
    b.win.push(b.plane(true, 288.1 - 0.04, -1, 310.1, 2.6, yb + 3 * fh + 0.6, yb + 4 * fh - 0.6));
    // the central recess: narrow vertical dark glazing, a canopy line at each level
    for (let l = 0; l < 4; l++) { b.win.push(b.plane(true, 293.9 - 0.04, -1, 300.1, 1.6, yb + l * fh + 0.6, yb + (l + 1) * fh - 0.5)); b.c.push([b.B(296, 304.2, yb + (l + 1) * fh - 0.1, yb + (l + 1) * fh + 0.05, 292.6, 293.9), '#f6f5f1']); }
    for (const x of [297.6, 302.6]) b.grille.push(b.plane(true, 293.9 - 0.04, -1, x, 1.0, yb + 0.4, yb + 4 * fh - 0.6));
    // the tall entrance: glazing to three levels in a deep frame between white piers, mullions, the doors, canopy lines
    const E0 = 285.6, E1 = 292.8, eh = yb + 3 * fh - 0.2, FZ = 289.8;
    k.glass.push(b.plane(true, FZ - 0.05, -1, (E0 + E1) / 2, E1 - E0, yb, eh));
    for (let x = E0; x <= E1 + 0.01; x += (E1 - E0) / 4) b.c.push([b.B(x - 0.06, x + 0.06, yb, eh, FZ - 0.12, FZ - 0.02), '#2a3036']);
    for (const l of [1, 2]) b.c.push([b.B(E0, E1, yb + l * fh - 0.08, yb + l * fh + 0.04, FZ - 0.14, FZ - 0.02), '#2a3036']);
    b.door.push(b.plane(true, FZ - 0.13, -1, (E0 + E1) / 2, 2.4, yb, yb + 2.6));
    for (const x of [E0 - 0.45, E1 + 0.45]) b.c.push([b.B(x - 0.45, x + 0.45, y + base - 0.05, eh + 0.5, FZ - 1.6, FZ), '#f8f7f3']);
    b.c.push([b.B(E0 - 0.9, E1 + 0.9, eh, eh + 0.5, FZ - 1.6, FZ), '#f8f7f3']);
    for (const l of [1, 2]) b.c.push([b.B(E0 - 0.9, E1 + 0.9, yb + l * fh - 0.08, yb + l * fh + 0.06, FZ - 1.4, FZ - 1.2), '#f6f5f1']);
    for (const [a, l] of [[294.6, 1], [294.6, 2], [284.0, 1], [284.0, 2], [289.2, 3]] as [number, number][]) b.win.push(b.plane(true, FZ - 0.04, -1, a, 1.2, yb + l * fh + 0.8, yb + (l + 1) * fh - 0.6));
    for (let i = 0; i < 4; i++) b.c.push([b.B(E0 - 0.4 + i * 0.5, E1 + 0.4 - i * 0.5, y - 0.3, y + (base * (i + 1)) / 4, FZ - 3.4 + i * 0.45, FZ - 1.6), '#cfcac1']);
    // ---- the rear (pair 13): the projecting wing's four tiers of windows and metal balcony rails ----
    for (let l = 0; l < 4; l++) for (const a of [286.4, 292.6]) {
      const y0 = yb + l * fh + 0.5;
      b.win.push(b.plane(true, 315.6 + 0.04, 1, a, 2.0, y0, y0 + 2.2));
      if (l > 0) { b.c.push([b.B(a - 1.3, a + 1.3, y0 - 0.12, y0 - 0.02, 315.6, 316.5), '#e9e7e1']); for (let x = a - 1.25; x <= a + 1.26; x += 0.25) b.c.push([b.B(x - 0.015, x + 0.015, y0 - 0.02, y0 + 0.95, 316.42, 316.48), '#3a3d40']); b.c.push([b.B(a - 1.3, a + 1.3, y0 + 0.93, y0 + 0.98, 316.4, 316.5), '#3a3d40']); }
    }
    // side and back windows elsewhere (fewer, in rows)
    for (let l = 0; l < 4; l++) {
      for (const z of [298, 303, 308]) b.win.push(b.plane(false, 277.6 - 0.04, -1, z, 1.2, yb + l * fh + 0.9, yb + l * fh + 2.4));
      for (const z of [297.5, 301.5, 305]) b.win.push(b.plane(false, 319.6 + 0.04, 1, z, 1.2, yb + l * fh + 0.9, yb + l * fh + 2.4));
      for (const x of [299, 303, 308, 312.5]) b.win.push(b.plane(true, (x < 304.2 ? 309.2 : 307.4) + 0.04, 1, x, 1.3, yb + l * fh + 0.9, yb + l * fh + 2.4));
    }
    k.meshes.push(meshOf(lat, latticeMat()));
    for (const r of MASS.map((m) => m.r)) { wallSolids(r[0], r[2], r[1], r[2]); wallSolids(r[1], r[2], r[1], r[3]); wallSolids(r[1], r[3], r[0], r[3]); wallSolids(r[0], r[3], r[0], r[2]); }
    // the low service wing at the front corner (its own outline): one storey under tiles, a door and a window
    if (SERVICE) lowWing(k, b, [275.5, 286.9, 280.5, 286.0], { eave: 3.0, faces: { z0: 'WD-W', x0: 'W' }, along: 'x', roof: '#a85138', y: gh(281, 283) });
    k.roof.c = new THREE.Color('#b0563a');
    // the black tanks on their pale plinth at the south-east
    const ty = gh(315, 312);
    b.c.push([b.B(311.0, 318.4, ty - 0.2, ty + 0.55, 309.8, 313.2), '#d9d6ce']);
    for (const x of [312.4, 315.0, 317.4]) { b.c.push([new THREE.CylinderGeometry(1.0, 1.0, 2.2, 16).translate(x - WO[0], ty + 0.55 + 1.1, 311.5 - WO[1]), '#151515'], [new THREE.SphereGeometry(1.0, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.25, 1).translate(x - WO[0], ty + 2.75, 311.5 - WO[1]), '#151515']); }
    wallSolids(311, 311.5, 318.4, 311.5, 1.6);
    // ---- the forecourt (pairs 11, 12): pale interlocking pavers to the road, the bay lines, curved planted islands, the
    // narrow walk to the entrance, the light carport on the east side, a few cars ----
    k.meshes.push(new THREE.Mesh(drapeAt(WO, 270, 324, 266.8, 288.0, 0.25, 0.045, (x, z) => {
      if (x < 287.2 && z > 280.2) return null;
      const row = Math.floor(z / 0.22), col = Math.floor((x + (row % 2) * 0.11) / 0.22), h = hash(col, row) * 0.05;
      return [0.74 - h, 0.72 - h, 0.68 - h];
    }), groundCover()));
    for (let x = 289; x < 304; x += 2.6) b.c.push([b.B(x - 0.05, x + 0.05, gh(x, 280) + 0.06, gh(x, 280) + 0.075, 275.5, 281), '#f4f4f0']);
    for (const [cx, cz, rx, rz] of [[276.5, 272.5, 5.0, 1.6], [296.5, 271.0, 6.5, 1.3], [312.5, 279.5, 1.4, 4.2]] as [number, number, number, number][]) {
      const cy = gh(cx, cz);
      k.meshes.push(new THREE.Mesh(drapeAt(WO, cx - rx, cx + rx, cz - rz, cz + rz, 0.2, 0.17, (x, z) => (((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2 < 0.85 ? [0.34, 0.5, 0.22] : null)), groundCover()));
      for (let i = 0; i < 28; i++) { const t = (i / 28) * Math.PI * 2, x = cx + Math.cos(t) * rx * 0.95, z = cz + Math.sin(t) * rz * 0.95; b.c.push([new THREE.BoxGeometry(0.15, 0.18, (2 * Math.PI * Math.max(rx, rz) * 0.95) / 28 + 0.05).rotateY(-t).translate(x - WO[0], cy + 0.09, z - WO[1]), '#f2f1ec']); }
      SOLIDS.add(cx, cz, Math.min(rx, rz) * 0.8);
    }
    const cy = gh(320, 277);
    for (const z of [271, 276, 281, 286]) { b.c.push([b.B(322.6, 322.75, cy, cy + 2.7, z - 0.07, z + 0.07), '#4a4f54']); SOLIDS.add(322.7, z, 0.1); }
    b.c.push([new THREE.BoxGeometry(6.2, 0.05, 16.4).rotateZ(-0.06).translate(319.8 - WO[0], cy + 2.85, 278.5 - WO[1]), '#3d4246']);
    for (const [x, z, col, ry] of [[319.6, 273.5, '#2b2e33', 0], [319.6, 281, '#8a8f95', 0], [293.8, 278.3, '#c9ccd0', 0], [301.6, 278.3, '#a42c2c', 0]] as [number, number, string, number][]) car(k, x - WO[0], z - WO[1], col, gh(x, z), ry);
    // the big branching tree before the forecourt's west side (pair 12), trees round the rear
    broadleaf(k, b.leaf, 286.2, 272.2, { h: 12, spread: 19, lean: 0.12, seed: 91, origin: WO });
    for (const [x, z, h, s] of [[270.5, 322, 10, 15], [326, 325, 10, 14], [304, 332, 11, 16]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x + z, origin: WO });
    // ---- behind: imperfect grass with reddish patches, small utility covers, the narrow hard path along the west side ----
    k.meshes.push(new THREE.Mesh(drapeAt(WO, 272, 324, 316.2, 334, 0.6, 0.035, (x, z) => { const n = vnoise(x * 0.25, z * 0.25); return n > 0.66 ? [0.55, 0.38, 0.26] : n < 0.25 ? [0.42, 0.5, 0.24] : null; }), groundCover()));
    k.meshes.push(new THREE.Mesh(drapeAt(WO, 273.6, 275.2, 288, 334, 0.4, 0.05, worn(0.63, 0.61, 0.57)), groundCover()));
    for (const [x, z] of [[290, 322], [306, 320], [282, 327]]) b.c.push([b.B(x - 0.35, x + 0.35, gh(x, z) - 0.05, gh(x, z) + 0.06, z - 0.35, z + 0.35), '#7f7a72']);
    b.finish(k, 0.3);
  },
};

// ---------- the low roadside group west of the WACCI building, the big tree in its island (pair 14) ----------
const LOWS = [footprint(258.6, 272.3, 274.1, 284.4), footprint(256.3, 271.4, 298.4, 306.3), footprint(255.9, 271.1, 317.3, 325.2)].filter((q) => !!q);
const LO: [number, number] = [258, 290];
const lowsSpec: Spec = {
  name: 'Low roadside group west of WACCI', axis: [1, 0], origin: LO, storey: 3.2, style: PLAIN, roofColor: '#a9563c', fascia: '#4a3328', pitch: 0.45, plinth: RED_BASE,
  replaces: LOWS.map((q) => centre(q!)),
  onGround: true,
  blocks: [],
  keep: [[237 - LO[0], 274 - LO[0], 266 - LO[1], 328 - LO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(LO);
    LOWS.forEach((q, i) => {
      const r = rectsOf(ringOf(q!))[0] as R4, y = gh((r[0] + r[1]) / 2, (r[2] + r[3]) / 2);
      // two roof heights: the first building's west end a lower gabled wing (the grilled front), the rest higher
      if (i === 0) {
        const xm = r[0] + 5.2;
        lowWing(k, b, [r[0], xm, r[2], r[3]], { eave: 2.8, faces: { x0: 'D' }, along: 'x', roof: '#9c5236', ends: [9, 0], y });
        gableTri(b, false, r[0], -1, r[2], r[3], y + 2.8, 0.45 * 0.97);
        b.grille.push(b.plane(false, r[0] - 0.05, -1, (r[2] + r[3]) / 2 + 2.6, 2.4, y + 0.5, y + 2.4));
        lowWing(k, b, [xm, r[1], r[2], r[3]], { eave: 3.3, faces: { x1: 'W-', z0: 'W-W', z1: 'W-W-' }, along: 'z', roof: '#a9563c', ends: [9, 9], y });
        for (const [z, out] of [[r[2], -1], [r[3], 1]] as [number, number][]) gableTri(b, true, z, out, xm, r[1], y + 3.3, 0.45 * 0.97);
        // the breeze-block wall section joining the front, its perforations dark
        const wy = y, wx = r[0] - 0.1;
        for (let z = r[3] + 0.2; z < r[3] + 4.6; z += 0.4) for (let yy = wy + 0.4; yy < wy + 1.7; yy += 0.4) b.c.push([b.B(wx - 0.1, wx + 0.1, yy, yy + 0.32, z, z + 0.32), (Math.floor(z / 0.4) + Math.floor(yy / 0.4)) % 2 ? '#e9e6de' : '#d8d4ca']);
        b.c.push([b.B(wx - 0.12, wx + 0.12, wy - 0.2, wy + 0.4, r[3], r[3] + 4.6), '#8c3a2a'], [b.B(wx - 0.14, wx + 0.14, wy + 1.75, wy + 1.85, r[3], r[3] + 4.6), '#e3dfd5']);
        wallSolids(wx, r[3], wx, r[3] + 4.6, 0.2);
      } else lowWing(k, b, r, { eave: 3.1, faces: { x0: i === 1 ? 'WDW' : 'W-W', z0: 'W-W', z1: 'W-W' }, along: 'x', roof: '#a9563c', ends: [9, 0], y });
      if (i > 0) gableTri(b, false, r[0], -1, r[2], r[3], y + 3.1, 0.45 * 0.97);
    });
    k.roof.c = new THREE.Color('#a9563c');
    // the hedge partly screening the fronts
    for (const [z0, z1] of [[286.5, 296.5], [308, 315.5]]) {
      b.leaf.push([new THREE.BoxGeometry(1.1, 1.0, z1 - z0).translate(254.6 - LO[0], gh(254.6, (z0 + z1) / 2) + 0.5, (z0 + z1) / 2 - LO[1]), '#3c6a2c']);
      wallSolids(254.6, z0, 254.6, z1, 0.5);
    }
    // the worn asphalt apron between Akuafo Road and the fronts, patchy, the curbed island with the huge tree
    k.meshes.push(new THREE.Mesh(drapeAt(LO, 238.4, 254.0, 267.5, 296, 0.4, 0.04, (x, z) => (Math.hypot(x - 247.5, z - 281) < 3.6 ? null : worn(0.38, 0.38, 0.38, 0.06)(x, z))), groundCover()));
    const iy = gh(247.5, 281);
    for (let i = 0; i < 32; i++) { const t = (i / 32) * Math.PI * 2; b.c.push([new THREE.BoxGeometry(0.2, 0.22, 0.75).rotateY(-t).translate(247.5 + Math.cos(t) * 3.4 - LO[0], iy + 0.08, 281 + Math.sin(t) * 3.4 - LO[1]), '#d6d2c8']); }
    k.meshes.push(new THREE.Mesh(drapeAt(LO, 244.2, 250.8, 277.7, 284.3, 0.3, 0.12, (x, z) => (Math.hypot(x - 247.5, z - 281) < 3.3 ? (vnoise(x, z) > 0.5 ? [0.48, 0.36, 0.26] : [0.38, 0.46, 0.22]) : null)), groundCover()));
    broadleaf(k, b.leaf, 247.5, 281, { h: 15, spread: 24, seed: 141, origin: LO });
    b.c.push([new THREE.CylinderGeometry(1.15, 1.9, 1.2, 10).translate(247.5 - LO[0], iy + 0.5, 281 - LO[1]), '#4f4236']);
    SOLIDS.add(247.5, 281, 1.6);
    b.c.push([b.B(250.9, 250.98, iy, iy + 0.9, 277.5, 277.58), '#d9dcdf'], [b.B(250.7, 251.2, iy + 0.75, iy + 0.85, 277.5, 277.58), '#d9dcdf']);
    b.finish(k, 0.4);
  },
};

// ---------- Akuafo Road: the brick footway and drain, the corner with Onyaa Road, the fence, Soil Science (pairs 15, 16) ----------
const SOIL = footprint(250.0, 259.7, 157.3, 213.4);
const KO: [number, number] = [245, 210];
/** brick in a herringbone-like stretcher bond: warm reds varying brick by brick */
const brick = (x: number, z: number): [number, number, number] => {
  const row = Math.floor(z / 0.2), col = Math.floor((x + (row % 2) * 0.1) / 0.2), h = hash(col, row), j = Math.abs(((x / 0.2 + (row % 2) * 0.5) % 1)) < 0.08 || Math.abs((z / 0.2) % 1) < 0.08;
  return j ? [0.4, 0.33, 0.3] : [0.52 + h * 0.08, 0.3 + h * 0.05, 0.25 + h * 0.04];
};
const akuafoSpec: Spec = {
  name: 'Akuafo Road and Soil Science', axis: [1, 0], origin: KO, storey: 3.2, style: PLAIN, roofColor: '#8f4a33', fascia: '#3a2a22', pitch: 0.45, plinth: RED_BASE,
  replaces: SOIL ? [centre(SOIL)] : [],
  onGround: true,
  blocks: [],
  keep: [[225 - KO[0], 262 - KO[0], 139 - KO[1], 272 - KO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(KO);
    // ---- the west side of Akuafo Road (pair 16): the shallow open drain at the asphalt's edge, the broad brick footway ----
    const RX = 232.2;
    k.meshes.push(new THREE.Mesh(drapeAt(KO, RX - 3.6, RX - 0.7, 141, 262, 0.2, 0.06, brick), groundCover()));
    for (let z = 141; z < 262; z += 4) {
      const z1 = Math.min(262, z + 4), dy = gh(RX - 0.4, z + 2);
      b.c.push([b.B(RX - 0.7, RX - 0.62, dy - 0.25, dy + 0.06, z, z1), '#b9b4aa'], [b.B(RX - 0.08, RX, dy - 0.25, dy + 0.03, z, z1), '#b9b4aa'], [b.B(RX - 0.62, RX - 0.08, dy - 0.24, dy - 0.2, z, z1), '#3a3632']);
    }
    // ---- the corner with Onyaa Road (pair 15): the curved brick pavement round the south-east corner, its kerb ----
    const CX = 238.4, CZ = 267.5, R0 = 3.0, R1 = 5.8;
    k.meshes.push(new THREE.Mesh(drapeAt(KO, CX - 0.2, CX + 22, CZ - 0.2, CZ + 26, 0.25, 0.06, (x, z) => {
      const along = x < CX + R1 && z < CZ + R1, d = Math.hypot(x - (CX + R1), z - (CZ + R1));
      if (x - CX < R1 - R0 && z > CZ + R1) return brick(x, z);
      if (z - CZ < R1 - R0 && x > CX + R1) return brick(x, z);
      if (along && d > R0 && d < R1 + 0.01) return brick(x, z);
      return null;
    }), groundCover()));
    for (let i = 0; i <= 12; i++) {
      const t = Math.PI + (i / 12) * (Math.PI / 2), x = CX + R1 + Math.cos(t) * R1, z = CZ + R1 + Math.sin(t) * R1;
      b.c.push([new THREE.BoxGeometry(0.18, 0.2, (R1 * Math.PI) / 2 / 12 + 0.05).rotateY(-t).translate(x - KO[0], gh(x, z) + 0.06, z - KO[1]), '#c9c4b8']);
    }
    // ---- the green sheet fence round the plot north-east of the junction, a gate gap, slim poles and the sign ----
    const fl: THREE.BufferGeometry[] = [], FX = 240.4, FZ = 259.8, fy = gh(250, 258);
    const fenceMat = new THREE.MeshStandardMaterial({ color: '#2f7a46', roughness: 0.7, metalness: 0.2, side: THREE.DoubleSide });
    const run = (ax: number, az: number, cx: number, cz: number) => {
      sheet(b, fl, ax, az, cx, cz, fy, fy + 2.3, 2);
      const L = Math.hypot(cx - ax, cz - az), n = Math.max(1, Math.round(L / 2.5));
      for (let i = 0; i <= n; i++) { const x = ax + ((cx - ax) * i) / n, z = az + ((cz - az) * i) / n; b.c.push([b.B(x - 0.04, x + 0.04, fy, fy + 2.4, z - 0.04, z + 0.04), '#2a5a36']); }
      wallSolids(ax, az, cx, cz, 0.15);
    };
    run(FX, 226.5, FX, FZ); run(FX, FZ, 262, FZ); run(268, FZ, 300, FZ);
    k.meshes.push(new THREE.Mesh(mergeAll(fl), fenceMat));
    for (const [x, z] of [[243.5, 270.8], [251, 270.4]] as [number, number][]) { b.c.push([new THREE.CylinderGeometry(0.06, 0.08, 7, 8).translate(x - KO[0], gh(x, z) + 3.5, z - KO[1]), '#9aa0a5']); SOLIDS.add(x, z, 0.12); }
    {
      const sx = 242.4, sz = 270.2, sy = gh(sx, sz);
      b.c.push([b.B(sx - 0.04, sx + 0.04, sy, sy + 2.1, sz - 0.04, sz + 0.04), '#8f959a']);
      k.meshes.push(new THREE.Mesh(new THREE.CircleGeometry(0.32, 20).rotateY(Math.PI).translate(sx - KO[0], sy + 1.95, sz - 0.05 - KO[1]), new THREE.MeshStandardMaterial({ color: '#f2f2ee', roughness: 0.6 })));
      SOLIDS.add(sx, sz, 0.08);
    }
    // ---- Soil Science (pair 16): low gabled and hipped wings set back behind the trunks, varied dark small windows,
    // doors and porch openings toward the road, the freestanding board ----
    if (SOIL) {
      const rs = rectsOf(ringOf(SOIL)) as R4[];
      rs.forEach((r, i) => {
        const y = gh((r[0] + r[1]) / 2, (r[2] + r[3]) / 2), long = r[3] - r[2] > 8;
        lowWing(k, b, r, { eave: 3.2, faces: { x0: long ? ['WwDW-W', 'W-wWDw', 'WDW-w'][i % 3] : 'D', x1: 'W-W' }, along: long ? 'z' : 'x', roof: i % 2 ? '#8f4a33' : '#874530', ends: long ? [i === 0 ? 9 : 0, 0] : [0, 0], y });
        if (long && i === 0) gableTri(b, true, r[2], -1, r[0], r[1], y + 3.2, 0.45 * 0.97);
        b.c.push([b.B(r[0] - 0.05, r[1] + 0.05, y - 0.3, y + 1.0, r[2] - 0.05, r[3] + 0.05), '#9a3b2b']);
      });
      k.roof.c = new THREE.Color('#8f4a33');
      // a porch: a short hipped roof on two posts over the main door
      const py = gh(248, 185);
      for (const z of [183.3, 186.7]) { b.c.push([b.B(247.4, 247.6, py, py + 2.6, z - 0.1, z + 0.1), '#efece4']); SOLIDS.add(247.5, z, 0.15); }
      b.c.push([b.B(247.0, 250.0, py + 2.6, py + 2.8, 182.8, 187.2), '#7d4030']);
      const bx = 243.2, bz = 176, by = gh(bx, bz);
      for (const dz of [-0.9, 0.9]) { b.c.push([b.B(bx - 0.05, bx + 0.05, by, by + 2.1, bz + dz - 0.05, bz + dz + 0.05), '#d9d7d0']); SOLIDS.add(bx, bz + dz, 0.1); }
      b.c.push([b.B(bx - 0.03, bx + 0.03, by + 1.1, by + 2.0, bz - 1.0, bz + 1.0), '#f1f0eb']);
      for (let i = 0; i < 4; i++) b.c.push([b.B(bx - 0.06, bx - 0.04, by + 1.75 - i * 0.18, by + 1.82 - i * 0.18, bz - 0.8, bz + 0.2 + (i % 2) * 0.5), i ? '#8c9096' : '#1d3f7a']);
    }
    // the big trunks with their roots and wide crowns along the road, scattered earth under them
    for (const [x, z, h, s] of [[244.2, 165, 14, 22], [244.6, 198, 15, 24], [226.4, 231, 13, 20], [244.2, 236, 12, 18]] as [number, number, number, number][]) {
      broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x * 7 + z, origin: KO });
      const ty = gh(x, z);
      b.c.push([new THREE.CylinderGeometry(0.75, 1.5, 0.9, 9).translate(x - KO[0], ty + 0.35, z - KO[1]), '#4f4236']);
      for (let i = 0; i < 6; i++) { const t = i + hash(x, i), L = 1.6 + hash(z, i); b.c.push([new THREE.BoxGeometry(L, 0.22, 0.35).translate(L / 2, 0.05, 0).rotateY(t).translate(x - KO[0], ty, z - KO[1]), '#4a3d31']); }
      SOLIDS.add(x, z, 1.1);
      k.meshes.push(new THREE.Mesh(drapeAt(KO, x - 3.5, x + 3.5, z - 3.5, z + 3.5, 0.35, 0.03, (px, pz) => (Math.hypot(px - x, pz - z) < 3.2 && vnoise(px, pz) > 0.35 ? [0.5, 0.38, 0.27] : null)), groundCover()));
    }
    b.finish(k, 0.4);
  },
};

export const agricSite = createSite('agriculture-side', [eastSpec, cscSpec, agEconSpec, bioSpec, wacSpec, lowsSpec, akuafoSpec]);
