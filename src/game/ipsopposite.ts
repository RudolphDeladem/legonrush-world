// IPS Road's commercial frontage opposite UPSA (the owner's IPS Road Opposite UPSA reference pack: nine stills and the
// 270° Street View recording, September 2024). A separate pack from the UPSA campus landmarks: the Abednego F. O. Amartey
// Towers across the road keep their model (upsacampus.ts) and are only checked from this side.
// - Prestige: the long commercial and hostel block on the mapped row along the road's south side (osm:way/885510982;
//   stills 02, 04-08, recording frames 8-13): four storeys, a tan panel grid between grey projecting slab bands at every
//   floor, a grey cap, repeated framed windows, grey pilasters every few bays; shops along the ground floor behind roller
//   shutters under coloured sign boards (replaceable details, no invented names); the entrance bay with its tall ochre
//   columns, recessed dark blue glazing and the projecting canopy with its small emblem (still 04); the red PRESTIGE
//   letters along the roofline east of the bay and HOSTEL west of it (the signage the stills show); the paved forecourt to the lay-by.
// - Northill Heights (stills 01, 08; recording frames 1-6): on the corner past the side street east of the row. No
//   source maps its outline: its spot is read from the recording's sequence (the row's east end, the side street, the
//   corner beyond it) and is an estimate to confirm. A glazed retail ground floor with a red-framed glazed corner unit and
//   dark cladding on one shopfront, a recessed level of narrow vertical windows behind a continuous balcony rail, the
//   off-white box of the upper floors projecting over both street faces with its grid of large dark louvred panels, the
//   red NORTHILL HEIGHTS letters on top of the front and the side; the broad paved apron before it.
// No parked cars are baked in; the lay-by, the side street and the shop fronts stay open.
import * as THREE from 'three';
import { BUILDINGS, NODE_XZ, ROADS, type Building } from './campusmap';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { box, canvas, merge, type Part } from './modelkit';
import { concrete } from './concrete';
import { Bag, hash, vnoise, wallSolids } from './enkit';
import { drapeAt, groundCover } from './kuffourgarden';
import { halfOf } from './lbplan';
import { louvreMat, place, textPanel } from './fskit';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#f1efe9') };
type P2 = [number, number];

/** Prestige's row, by a point inside its mapped outline; the entrance bay's middle (world x) and width; the letters */
export const PRESTIGE_ROW = { at: [2210, -851] as P2, bay: 2210, bayW: 7.6, floors: 4 };
/** Northill Heights' ground floor (world x0, x1, z0, z1: its front on z0, toward the road) and how far the upper box
 *  projects over the front and the side street; its apron. Inferred from the recording, not mapped. */
export const NORTHILL = { r: [2271.6, 2287, -857.4, -844] as [number, number, number, number], over: 1.5, apron: [2269.2, 2296, -870.4, -857.4] as [number, number, number, number] };

// ---------- the roads near the frontage ----------
const segs: [number, number, number, number, number][] = [];
for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++) {
  const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
  if (Math.max(ax, bx) < 2120 || Math.min(ax, bx) > 2330 || Math.max(az, bz) < -900 || Math.min(az, bz) > -800) continue;
  segs.push([ax, az, bx, bz, halfOf(r)]);
}
export function ipsClear(x: number, z: number) {
  let best = 50;
  for (const [ax, az, bx, bz, h] of segs) {
    const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z) - h);
  }
  return best;
}
const inRing = (b: Building, x: number, z: number) => {
  let c = false;
  for (let i = 0, j = b.pts.length - 2; i < b.pts.length; j = i, i += 2) {
    const zi = b.pts[i + 1], zj = b.pts[j + 1];
    if ((zi > z) !== (zj > z) && x < ((b.pts[j] - b.pts[i]) * (z - zi)) / (zj - zi) + b.pts[i]) c = !c;
  }
  return c;
};
const ROW = BUILDINGS.find((b) => inRing(b, ...PRESTIGE_ROW.at));
/** the row as an oriented rectangle: centre, long axis (pointing east), length, width */
function oriented(b: Building) {
  const p: P2[] = []; for (let i = 0; i < b.pts.length; i += 2) p.push([b.pts[i], b.pts[i + 1]]);
  let best = 0, ux = 1, uz = 0;
  for (let i = 0; i < p.length; i++) { const [ax, az] = p[i], [bx, bz] = p[(i + 1) % p.length], l = Math.hypot(bx - ax, bz - az); if (l > best) { best = l; ux = (bx - ax) / l; uz = (bz - az) / l; } }
  if (ux < 0) { ux = -ux; uz = -uz; }
  let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
  for (const [x, z] of p) { const a = x * ux + z * uz, c = -x * uz + z * ux; a0 = Math.min(a0, a); a1 = Math.max(a1, a); b0 = Math.min(b0, c); b1 = Math.max(b1, c); }
  const am = (a0 + a1) / 2, bm = (b0 + b1) / 2;
  return { cx: am * ux - bm * uz, cz: am * uz + bm * ux, ux, uz, L: a1 - a0, W: b1 - b0 };
}

// ---------- materials ----------
let MATS: { win: THREE.MeshStandardMaterial; shutter: THREE.MeshStandardMaterial; glass: THREE.MeshStandardMaterial; panel: THREE.MeshStandardMaterial } | null = null;
const mats = () => (MATS ??= {
  // a window in a pale aluminium frame: two panes, a mullion, a sill line
  win: new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.2, side: THREE.DoubleSide, map: canvas(64, 64, (g) => {
    g.fillStyle = '#d9dad6'; g.fillRect(0, 0, 64, 64);
    const gl = g.createLinearGradient(0, 4, 0, 60); gl.addColorStop(0, '#6f8798'); gl.addColorStop(1, '#2d3a44'); g.fillStyle = gl; g.fillRect(5, 5, 54, 54);
    g.fillStyle = '#d9dad6'; g.fillRect(30, 5, 4, 54); g.fillRect(5, 22, 54, 3);
    g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(8, 26, 10, 30);
  }) }),
  // a roller shutter, ribbed, part way up over a dark shop
  shutter: new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.3, side: THREE.DoubleSide, map: canvas(64, 64, (g) => {
    g.fillStyle = '#1e2124'; g.fillRect(0, 0, 64, 64);
    g.fillStyle = '#a8adb0'; g.fillRect(0, 0, 64, 40);
    g.fillStyle = '#8b9093'; for (let y = 2; y < 40; y += 4) g.fillRect(0, y, 64, 1.5);
    g.fillStyle = '#6d7275'; g.fillRect(0, 38, 64, 3);
  }) }),
  // dark blue curtain glazing in a grid of mullions (the entrance bay)
  glass: new THREE.MeshStandardMaterial({ roughness: 0.15, metalness: 0.5, side: THREE.DoubleSide, map: canvas(64, 64, (g) => {
    const gl = g.createLinearGradient(0, 0, 64, 64); gl.addColorStop(0, '#3b5d8a'); gl.addColorStop(1, '#16273f'); g.fillStyle = gl; g.fillRect(0, 0, 64, 64);
    g.fillStyle = '#9aa3aa'; g.fillRect(0, 0, 64, 2); g.fillRect(0, 0, 2, 64); g.fillRect(31, 0, 2, 64);
  }) }),
  // Northill's off-white cladding panels with their joints
  panel: new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide, map: (() => { const t = canvas(128, 128, (g) => {
    g.fillStyle = '#ebe9e4'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#c9c7c1'; for (let x = 0; x < 128; x += 64) g.fillRect(x, 0, 2, 128); for (let y = 0; y < 128; y += 42) g.fillRect(0, y, 128, 2);
  }); t.repeat.set(1 / 2.4, 1 / 1.6); return t; })() }),
});
/** a textured plane on a face: along x (facing ±z) at depth z, or along z (facing ±x) at x; world-free model coords */
function face(list: THREE.BufferGeometry[], alongX: boolean, at: number, out: number, a: number, w: number, y0: number, y1: number) {
  const g = new THREE.PlaneGeometry(w, y1 - y0);
  if (alongX) { if (out < 0) g.rotateY(Math.PI); g.translate(a, (y0 + y1) / 2, at); }
  else { g.rotateY(out > 0 ? Math.PI / 2 : -Math.PI / 2); g.translate(at, (y0 + y1) / 2, a); }
  list.push(g);
}
const meshOf = (k: Kit, gs: THREE.BufferGeometry[], m: THREE.Material, shadow = false) => {
  if (!gs.length) return;
  const g = gs.length === 1 ? gs[0] : (() => { const all = gs.map((x) => (x.index ? x.toNonIndexed() : x)); const pos: number[] = [], uv: number[] = []; for (const x of all) { pos.push(...(x.attributes.position.array as Float32Array)); uv.push(...(x.attributes.uv.array as Float32Array)); } const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); r.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); r.computeVertexNormals(); return r; })();
  const me = new THREE.Mesh(g, m); me.castShadow = shadow; me.receiveShadow = true; k.meshes.push(me);
};
const SIGNS = ['#1f5fae', '#c62f2f', '#e7c21f', '#2e8b4a', '#f2f2ee', '#e06a1c', '#7a2a8c', '#1a1a1a', '#0e7d8c'];

// ======================================================================================================
// Prestige: the long row along the road
// ======================================================================================================
function prestigeSpecs(): Spec[] {
  if (!ROW) return [];
  const f = oriented(ROW);
  // the local frame: x along the row (east), z across it (south); the front toward the road is at z0
  const L = f.L, W = f.W, x0 = -L / 2, x1 = L / 2, z0 = -W / 2, z1 = W / 2;
  const toLocalX = (wx: number) => (wx - f.cx) * f.ux;
  const GF = 3.8, FL = 3.2, top = GF + (PRESTIGE_ROW.floors - 1) * FL, cap = top + 1.0;
  const bayM = toLocalX(PRESTIGE_ROW.bay), bay0 = bayM - PRESTIGE_ROW.bayW / 2, bay1 = bayM + PRESTIGE_ROW.bayW / 2;
  return [{
    name: 'Prestige commercial and hostel block', axis: [f.ux, f.uz], origin: [f.cx, f.cz], storey: FL, style: PLAIN, roofColor: '#8d8f8e', fascia: '#6d6f70', pitch: 0,
    replaces: [PRESTIGE_ROW.at],
    blocks: [],
    onGround: true,
    // the forecourt before the front: no generic trees or lamps on it
    keep: [[x0 - 2, x1 + 2, z0 - 7, z0]],
    extras: (k: Kit) => {
      const c: Part[] = [], M = mats(), wins: THREE.BufferGeometry[] = [], shut: THREE.BufferGeometry[] = [], glass: THREE.BufferGeometry[] = [], dark: THREE.BufferGeometry[] = [];
      const TAN = '#cdb68f', GREY = '#8f918f', PIL = '#a2a39f';
      // the body, the grey cap, the roof slab
      // (the entrance bay is recessed: the body stops short of the front there)
      const rz0 = z0 + 1.2;
      for (const [a, b2, zf] of [[x0, bay0, z0], [bay0, bay1, rz0], [bay1, x1, z0]] as [number, number, number][]) c.push([box(a, b2, -0.3, top, zf, z1), TAN], [box(a - 0.05, b2 + 0.05, top, cap, zf - 0.35, z1 + 0.05), GREY]);
      c.push([box(x0 + 0.3, x1 - 0.3, cap, cap + 0.12, z0 + 0.3, z1 - 0.3), '#9c9e9b']);
      // the ground floor's base and the projecting grey slab bands at each floor (not across the entrance bay)
      for (let i = 0; i < PRESTIGE_ROW.floors; i++) {
        const y = GF + i * FL - 0.12;
        for (const [a, b2] of [[x0, bay0], [bay1, x1]]) c.push([box(a, b2, y, y + 0.24, z0 - (i === 0 ? 1.2 : 0.7), z0 + 0.02), GREY]);
      }
      // grey pilasters every three window bays on the upper floors
      const step = 2.7;
      for (let x = x0 + 0.4; x < x1; x += step * 3) if (x < bay0 - 0.5 || x > bay1 + 0.5) c.push([box(x - 0.25, x + 0.25, GF, top, z0 - 0.22, z0 + 0.02), PIL]);
      // the windows, floor by floor (a few left open: a sash tilted out)
      for (let i = 0; i < PRESTIGE_ROW.floors - 1; i++) {
        const y = GF + i * FL + 0.9;
        for (let x = x0 + 1.75; x < x1 - 0.8; x += step) {
          if (x > bay0 - 1.2 && x < bay1 + 1.2) continue;
          face(wins, true, z0 - 0.03, -1, x, 1.55, y, y + 1.45);
          face(wins, true, z1 + 0.03, 1, x, 1.3, y + 0.1, y + 1.35);
          if (hash(x, i) < 0.12) c.push([new THREE.BoxGeometry(0.72, 1.3, 0.03).rotateX(0.35).translate(x + 0.38, y + 0.85, z0 - 0.28), '#9fb3bf']);
        }
        for (const [xe, out] of [[x0, -1], [x1, 1]] as [number, number][]) for (let zz = z0 + 2.5; zz < z1 - 1.5; zz += step) face(wins, false, xe + out * 0.03, out, zz, 1.3, y + 0.1, y + 1.35);
      }
      // the shops: openings with roller shutters part way up, coloured sign boards over them, piers between
      let s = 0;
      for (let x = x0 + 0.6; x < x1 - 3.4; x += 4.2, s++) {
        if (x + 3.6 > bay0 - 0.4 && x < bay1 + 0.4) continue;
        face(shut, true, z0 - 0.04, -1, x + 1.8, 3.4, 0, 2.85);
        c.push([box(x + 0.05, x + 3.55, 2.95, 3.55, z0 - 0.16, z0 - 0.05), SIGNS[Math.floor(hash(s, 3) * SIGNS.length)]]);
        c.push([box(x + 0.4, x + 3.2, 3.12, 3.38, z0 - 0.18, z0 - 0.16), hash(s, 5) > 0.5 ? '#f4f2ea' : '#1c1c1c']);
        c.push([box(x - 0.6, x, -0.3, GF - 0.12, z0 - 0.12, z0 + 0.02), '#bfa985']);
      }
      // ---- the entrance bay (still 04): recessed glazing, the tall ochre columns, the canopy with its emblem ----
      {
        const OCH = '#c49a3c', rz = z0 + 1.2;
        c.push([box(bay0, bay1, -0.3, cap + 1.6, rz, rz + 0.3), '#d3bc94']);
        face(glass, true, rz - 0.02, -1, bayM, PRESTIGE_ROW.bayW - 1.4, GF + 0.4, top - 0.2);
        face(glass, true, rz - 0.02, -1, bayM, 3.2, 0, 2.9);
        for (const t of [0, 0.33, 0.67, 1]) {
          const x = bay0 + 0.35 + t * (PRESTIGE_ROW.bayW - 0.7);
          c.push([box(x - 0.3, x + 0.3, 0, cap + 1.3, z0 - 0.45, z0 + 0.15), OCH], [box(x - 0.36, x + 0.36, -0.3, 0.35, z0 - 0.5, z0 + 0.2), '#8a6a2a']);
        }
        c.push([box(bay0 - 0.2, bay1 + 0.2, cap + 1.3, cap + 1.7, z0 - 0.6, rz + 0.3), '#d8c39b']);
        c.push([box(bay0 + 0.3, bay1 - 0.3, GF, GF + 0.3, z0 - 2.0, z0), '#e2dccd']);
        c.push([box(bayM - 0.45, bayM + 0.45, GF + 0.6, GF + 1.5, z0 - 0.5, z0 - 0.45), '#2a2a2a'], [box(bayM - 0.3, bayM + 0.3, GF + 0.75, GF + 1.35, z0 - 0.52, z0 - 0.5), '#d4b04a']);
        face(dark, true, rz - 0.03, -1, bayM, PRESTIGE_ROW.bayW - 1.4, 2.95, GF + 0.4);
      }
      // ---- the red letters along the roofline: PRESTIGE east of the bay, HOSTEL west of it ----
      const letters = (t: string, xm: number, w: number) => {
        const p = textPanel(w, 1.7, [{ t, s: 0.9, c: '#c8221d', b: true, f: 'Impact, Arial Black, sans-serif' }], null);
        k.meshes.push(place(p, xm, cap + 0.95, z0 - 0.2, Math.PI));
        c.push([box(xm - w / 2, xm + w / 2, cap + 0.1, cap + 0.18, z0 - 0.15, z0 + 0.4), '#5d5f60']);
      };
      // (the row's local x runs east: seen from the road the east side is on the left, as still 04 has PRESTIGE)
      letters('PRESTIGE', bay1 + 8.5, 14);
      letters('HOSTEL', bay0 - 5.5, 9);
      meshOf(k, wins, M.win); meshOf(k, shut, M.shutter); meshOf(k, glass, M.glass); meshOf(k, dark, new THREE.MeshStandardMaterial({ color: '#202428', roughness: 0.6, side: THREE.DoubleSide }));
      const m = new THREE.Mesh(merge(c), concrete(0.4)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    },
  }];
}

// ======================================================================================================
// Northill Heights on the corner past the side street (placement inferred from the recording)
// ======================================================================================================
const NO: P2 = [2279, -851];
const northill: Spec = {
  name: 'Northill Heights', axis: [1, 0], origin: NO, storey: 3.4, style: PLAIN, roofColor: '#cfcfcb', fascia: '#3a3a3a', pitch: 0,
  blocks: [],
  onGround: true,
  keep: [[NORTHILL.apron[0] - NO[0], NORTHILL.r[1] + 3 - NO[0], NORTHILL.apron[2] - NO[1], NORTHILL.r[3] - NO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(NO), c: Part[] = [], M = mats(), wins: THREE.BufferGeometry[] = [], glass: THREE.BufferGeometry[] = [], louv: THREE.BufferGeometry[] = [], pan: THREE.BufferGeometry[] = [];
    const X = (x: number) => x - NO[0], Z = (z: number) => z - NO[1];
    const [gx0, gx1, gz0, gz1] = NORTHILL.r, o = NORTHILL.over, GF = 4.2, L1 = 7.5, TOP = 14.2;
    // ---- the glazed retail ground floor: a slab, glazing between dark piers, the red-framed corner unit, dark cladding ----
    c.push([box(X(gx0), X(gx1), -0.3, GF, Z(gz0) + 0.6, Z(gz1)), '#dcdad4']);
    face(glass, true, Z(gz0) + 0.55, -1, X((gx0 + gx1) / 2), gx1 - gx0 - 0.4, 0.1, GF - 0.5);
    face(glass, false, X(gx0) - 0.02, -1, Z((gz0 + gz1) / 2) + 0.3, gz1 - gz0 - 1.2, 0.1, GF - 0.5);
    for (let x = gx0 + 5; x < gx1 - 0.5; x += 3.6) c.push([box(X(x) - 0.2, X(x) + 0.2, 0, GF, Z(gz0) + 0.35, Z(gz0) + 0.6), '#2e2f31']);
    // the corner unit: red frames round its glazing on both street faces
    const RED = '#c0202a', cx1 = gx0 + 5;
    for (const yy of [0.05, GF - 0.55, GF - 0.15]) c.push([box(X(gx0) - 0.08, X(cx1), yy, yy + 0.14, Z(gz0) + 0.4, Z(gz0) + 0.5), RED], [box(X(gx0) - 0.12, X(gx0) - 0.02, yy, yy + 0.14, Z(gz0) + 0.45, Z(gz0) + 7), RED]);
    for (const x of [gx0, gx0 + 2.5, cx1]) c.push([box(X(x) - 0.07, X(x) + 0.07, 0, GF - 0.15, Z(gz0) + 0.4, Z(gz0) + 0.5), RED]);
    for (const z of [gz0 + 3.5, gz0 + 7]) c.push([box(X(gx0) - 0.12, X(gx0) - 0.02, 0, GF - 0.15, Z(z) - 0.07, Z(z) + 0.07), RED]);
    // dark stone cladding on one shopfront, sign bands over the shops
    c.push([box(X(gx1 - 4.2), X(gx1), 0, GF - 0.2, Z(gz0) + 0.3, Z(gz0) + 0.6), '#353535']);
    for (const [x, col] of [[gx0 + 7.6, '#2e8b4a'], [gx0 + 11.5, '#f2f2ee']] as [number, string][]) c.push([box(X(x) - 1.6, X(x) + 1.6, GF - 0.85, GF - 0.35, Z(gz0) + 0.3, Z(gz0) + 0.36), col]);
    // ---- the recessed level: narrow vertical windows behind the columns and the continuous balcony rail ----
    c.push([box(X(gx0) + 1.0, X(gx1), GF, L1, Z(gz0) + 1.2, Z(gz1)), '#e2e0db']);
    c.push([box(X(gx0) - 0.1, X(gx1) + 0.1, GF - 0.05, GF + 0.25, Z(gz0) - 0.2, Z(gz1)), '#cfcdc8']);
    for (let x = gx0 + 1.8; x < gx1 - 0.5; x += 1.25) face(wins, true, Z(gz0) + 1.17, -1, X(x), 0.6, GF + 0.6, L1 - 0.5);
    for (let z = gz0 + 2.4; z < gz1 - 0.5; z += 1.25) face(wins, false, X(gx0) + 0.97, -1, Z(z), 0.6, GF + 0.6, L1 - 0.5);
    for (const x of [gx0, gx0 + 5, gx0 + 10, gx1]) c.push([box(X(x) - 0.18, X(x) + 0.18, GF, L1, Z(gz0) - 0.1, Z(gz0) + 0.26), '#d4d2cc']);
    const railY = GF + 1.1;
    c.push([box(X(gx0) - 0.1, X(gx1) + 0.1, railY - 0.04, railY + 0.02, Z(gz0) - 0.12, Z(gz0) - 0.06), '#3b3d40'], [box(X(gx0) - 0.12, X(gx0) - 0.06, railY - 0.04, railY + 0.02, Z(gz0) - 0.1, Z(gz1)), '#3b3d40']);
    for (let x = gx0; x <= gx1; x += 0.14) c.push([box(X(x) - 0.012, X(x) + 0.012, GF + 0.25, railY, Z(gz0) - 0.1, Z(gz0) - 0.08), '#3b3d40']);
    for (let z = gz0; z <= gz1; z += 0.14) c.push([box(X(gx0) - 0.1, X(gx0) - 0.08, GF + 0.25, railY, Z(z) - 0.012, Z(z) + 0.012), '#3b3d40']);
    // ---- the upper box, projecting over the front and the side street: off-white panels, the grid of dark louvres ----
    const bx0 = gx0 - o, bz0 = gz0 - o;
    c.push([box(X(bx0), X(gx1), L1, TOP, Z(bz0), Z(gz1)), '#ebe9e4'], [box(X(bx0) - 0.05, X(gx1) + 0.05, L1 - 0.3, L1, Z(bz0) - 0.05, Z(gz1)), '#d0cec8']);
    face(pan, true, Z(bz0) - 0.02, -1, X((bx0 + gx1) / 2), gx1 - bx0, L1, TOP);
    face(pan, false, X(bx0) - 0.02, -1, Z((bz0 + gz1) / 2), gz1 - bz0, L1, TOP);
    for (const [r, y] of [[0, L1 + 0.7], [1, L1 + 3.8]] as [number, number][]) {
      for (let x = bx0 + 1.6, i = 0; x < gx1 - 1; x += 3.4, i++) face(louv, true, Z(bz0) - 0.04, -1, X(x), 1.5, y, y + 2.3);
      for (let z = bz0 + 2.0; z < gz1 - 1; z += 3.4) face(louv, false, X(bx0) - 0.04, -1, Z(z), 1.5, y, y + 2.3);
      void r;
    }
    // small dark fixtures on the box
    for (let x = bx0 + 3.3; x < gx1 - 1; x += 3.4) c.push([box(X(x) - 0.1, X(x) + 0.1, TOP - 0.9, TOP - 0.6, Z(bz0) - 0.12, Z(bz0)), '#2a2a2a']);
    // ---- the red letters on top of the front and the side ----
    k.meshes.push(place(textPanel(13.5, 1.5, [{ t: 'NORTHILL HEIGHTS', s: 0.85, c: '#c8221d', b: true, f: 'Arial Black, Impact, sans-serif' }], null), X((bx0 + gx1) / 2), TOP + 0.85, Z(bz0) + 0.2, Math.PI));
    k.meshes.push(place(textPanel(11, 1.2, [{ t: 'NORTHILL HEIGHTS', s: 0.85, c: '#c8221d', b: true, f: 'Arial Black, Impact, sans-serif' }], null), X(bx0) + 0.2, TOP + 0.7, Z((bz0 + gz1) / 2), -Math.PI / 2));
    c.push([box(X(bx0) + 0.1, X(gx1) - 0.1, TOP, TOP + 0.6, Z(bz0) + 0.1, Z(gz1) - 0.1), '#d8d6d0']);
    // ---- Prestige's paved forecourt, from its front to the lay-by and the verge (world frame; drawn here) ----
    if (ROW) {
      const f = oriented(ROW);
      k.meshes.push(new THREE.Mesh(drapeAt(NO, 2168, 2253, -872, -838, 0.35, 0.05, (x, z) => {
        const lx = (x - f.cx) * f.ux + (z - f.cz) * f.uz, lz = -(x - f.cx) * f.uz + (z - f.cz) * f.ux;
        if (Math.abs(lx) > f.L / 2 + 1.5 || lz > -f.W / 2 || lz < -f.W / 2 - 8 || ipsClear(x, z) < 0.3) return null;
        const m = vnoise(x * 0.9, z * 0.9) * 0.05, n = vnoise(x * 0.2, z * 0.2);
        return n > 0.6 ? [0.7 + m, 0.62 + m, 0.5] : [0.6 + m, 0.59 + m, 0.56 + m];
      }), groundCover()));
    }
    // ---- the broad paved apron before it ----
    const [ax0, ax1, az0, az1] = NORTHILL.apron;
    k.meshes.push(new THREE.Mesh(drapeAt(NO, ax0, ax1, az0, az1 + 0.3, 0.4, 0.05, (x, z) => {
      if (ipsClear(x, z) < 0.2) return null;
      const m = vnoise(x * 0.9, z * 0.9) * 0.04, j = Math.abs((x % 1.2) + 1.2) % 1.2 < 0.06 || Math.abs((z % 1.2) + 1.2) % 1.2 < 0.06;
      return j ? [0.5, 0.49, 0.47] : [0.66 + m, 0.64 + m, 0.6 + m];
    }), groundCover()));
    c.push([box(X(ax0), X(ax1), 0, 0.14, Z(az0) - 0.15, Z(az0)), '#d3cec2']);
    // its walls stop a bike (no mapped outline carries them)
    wallSolids(gx0, gz0 + 0.5, gx1, gz0 + 0.5); wallSolids(gx1, gz0, gx1, gz1); wallSolids(gx1, gz1, gx0, gz1); wallSolids(gx0, gz1, gx0, gz0);
    meshOf(k, wins, M.win); meshOf(k, glass, M.glass); meshOf(k, louv, louvreMat()); meshOf(k, pan, M.panel);
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.finish(k, 0.3);
  },
};

export const ipsOppositeSite = createSite('ips-opposite-upsa', [...prestigeSpecs(), northill]);
