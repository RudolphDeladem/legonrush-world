// The owner's UPSA landmark pack (LEGONRUSH_UPSA_Landmark_Reconstruction_Brief; numbers in upsalandmarksplan.ts; evidence
// and confidence in docs/upsa-landmarks/evidence-audit.md). Six separate landmarks of the University of Professional
// Studies, Accra, each on its mapped outline (the map sets the place and the heading; the photographs the appearance):
// - the new Main Entrance (G-01 ... G-04): the white square-tiled portal with the quarter arch sweeping up from the ground
//   on the west to the header, the deep soffit with its skylights, the tall tiled block with blue windows on the east, the
//   university's name, motto, "UPSA" and crest on the outer fascia; the booth under the arch, the raised barriers, the
//   ramp with black rails, the planting bed with its curved kerb, the paved apron. The older blue-and-white canopy gate is
//   gone (upsacampus.ts keeps only the campus wall);
// - Kofi Ohene-Konadu Auditorium (KOKA): the white tiled side masses with tall slot windows, the broad convex blue glass
//   curtain wall over the dark-column entrance recessed beneath it, the auditorium's blue metal roof; the paved
//   forecourt; the fountain with its stepped orange rim in the quadrangle, the benches, lamps and the "We love UPSA" letters;
// - the Justice Aryeetey Building (the core block to KOKA's right as one faces it): six white storeys with blue window
//   bands, the broad blue strips along its west front, the central blue circulation bay with its arched cap over the main
//   entrance (the entrance canopy is upsacampus.ts's);
// - the Opoku Ampomah Building / Central Administration Block: the round drum with the curved blue glass band on its
//   upper floors, the OPOKU AMPOMAH BUILDING band under it and the grey CENTRAL ADMINISTRATION band over the entrance
//   glazing, "UPSA" and the crest on the roof edge; its two wings with the blue panels and pale blue hipped roofs;
// - the Joshua Alabi Library: six white storeys with blue windows and white floor bands, the taller central entrance bay
//   with its arched window and pediment, the blue columns either side of the doors, the JOSHUA ALABI LIBRARY sign.
// (The Abednego F. O. Amartey Twin Towers are upsacampus.ts's, on their mapped outline.)
import * as THREE from 'three';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { box, canvas, merge, type Part } from './modelkit';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { Bag, hash, mergeUV, wallSolids } from './enkit';
import { broadleaf } from './nsiaroad';
import { NODE_XZ, ROADS } from './campusmap';
import { pavers, rod, type V3 } from './upsa';
import { place, roofMat, textPanel } from './fskit';
import { GATE } from './upsacampusplan';
import { ADMIN, BENCHES, FOUNTAIN, JA, KOKA, LAMPS, LIBRARY, LOVE_SIGN, PORTAL, adminAt, kokaArc } from './upsalandmarksplan';

const UPSA_BLUE = '#24459c', NAVY = '#1c2a52', GOLD = '#c39a2c';

// ---------- the mapped roads round the campus, so the planting and the trees keep off them ----------
const SEGS: [number, number, number, number, number][] = [];
for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++) {
  const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
  if (Math.max(ax, bx) < 2260 || Math.min(ax, bx) > 2460 || Math.max(az, bz) < -1240 || Math.min(az, bz) > -880) continue;
  SEGS.push([ax, az, bx, bz, [9, 7.4, 6.2, 4.6, 2.6][r.cls] / 2]);
}
const clear = (x: number, z: number, m: number) => !SEGS.some(([ax, az, bx, bz, h]) => {
  const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(ax + dx * t - x, az + dz * t - z) < h + m;
});

// ======================================================================================================
// materials: the small square white tiles, the blue curtain-wall glass, a blue window
// ======================================================================================================
let TILE: THREE.MeshStandardMaterial | null = null;
/** small square cream-white tiles with grey joints (0.3 m; G-01 ... G-04, the KOKA photographs); uvs in metres */
const tileMat = () => (TILE ??= (() => {
  const t = canvas(256, 256, (g) => {
    g.fillStyle = '#c9c7c0'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      const v = 238 + Math.round(hash(i * 3.1, j * 7.7) * 10);
      g.fillStyle = `rgb(${v},${v - 1},${v - 5})`; g.fillRect(i * 32 + 1.5, j * 32 + 1.5, 29, 29);
    }
  });
  t.repeat.set(1 / 2.4, 1 / 2.4);
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.38, metalness: 0.02, side: THREE.DoubleSide });
})());
const glassMats = new Map<string, THREE.MeshStandardMaterial>();
/** blue reflective curtain-wall glass in panels pw by ph metres: light mullions, the sky and the trees in it */
function glassMat(pw: number, ph: number, dark = false) {
  const key = `${pw},${ph},${dark}`;
  let m = glassMats.get(key);
  if (!m) {
    const t = canvas(256, 256, (g) => {
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        const x = i * 64, y = j * 64, gl = g.createLinearGradient(x, y, x + 30, y + 64), h = hash(i * 1.7 + 3, j * 2.3);
        if (dark) { gl.addColorStop(0, '#2a3446'); gl.addColorStop(1, '#141a24'); }
        else { gl.addColorStop(0, h > 0.6 ? '#5f8fd4' : '#3a6ec0'); gl.addColorStop(0.55, '#24529f'); gl.addColorStop(1, h > 0.3 ? '#173a78' : '#2b5aa8'); }
        g.fillStyle = gl; g.fillRect(x, y, 64, 64);
        if (!dark && h > 0.45) { g.fillStyle = 'rgba(200,220,245,0.22)'; g.beginPath(); g.moveTo(x + 10, y + 64); g.lineTo(x + 34, y); g.lineTo(x + 50, y); g.lineTo(x + 26, y + 64); g.fill(); }
      }
      g.fillStyle = dark ? '#5a5f66' : '#a9b7c8';
      for (let i = 0; i <= 4; i++) { g.fillRect(i * 64 - 2, 0, 4, 256); g.fillRect(0, i * 64 - 2, 256, 4); }
    });
    t.repeat.set(1 / (4 * pw), 1 / (4 * ph));
    m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.12, metalness: 0.45, side: THREE.DoubleSide });
    glassMats.set(key, m);
  }
  return m;
}
let BLUE_WIN: THREE.MeshStandardMaterial | null = null;
/** one blue-glazed window in a dark frame with a mullion (the gate's block, G-01, G-04); a plane's own 0..1 uvs */
const blueWin = () => (BLUE_WIN ??= new THREE.MeshStandardMaterial({ roughness: 0.2, metalness: 0.35, side: THREE.DoubleSide, map: canvas(64, 64, (g) => {
  g.fillStyle = '#1b2433'; g.fillRect(0, 0, 64, 64);
  const gl = g.createLinearGradient(0, 0, 40, 64); gl.addColorStop(0, '#4f86d6'); gl.addColorStop(1, '#1d4b9e');
  g.fillStyle = gl; g.fillRect(4, 4, 56, 56);
  g.fillStyle = '#1b2433'; g.fillRect(30, 4, 4, 56);
}) }));
let SKY: THREE.MeshBasicMaterial | null = null;
const skylight = () => (SKY ??= new THREE.MeshBasicMaterial({ color: '#eef4fb', side: THREE.DoubleSide }));

// ======================================================================================================
// geometry with uvs in metres
// ======================================================================================================
/** uvs in metres by the face's direction (tiles and glass line up across a model) */
function metreUV(g: THREE.BufferGeometry) {
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    if (ay > 0.7) uv.setXY(i, p.getX(i), p.getZ(i)); else if (ax > 0.7) uv.setXY(i, p.getZ(i), p.getY(i)); else uv.setXY(i, p.getX(i), p.getY(i));
  }
  uv.needsUpdate = true;
  return g;
}
const tbox = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => metreUV(box(x0, x1, y0, y1, z0, z1));
/** a flat polygon of the model frame (x, z) raised from y0 to y1; uvs in metres */
function prism(pts: [number, number][], y0: number, y1: number) {
  const s = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  return new THREE.ExtrudeGeometry(s, { depth: y1 - y0, bevelEnabled: false, curveSegments: 1 }).rotateX(-Math.PI / 2).translate(0, y0, 0);
}
/** a surface between two runs of points (a: along the bottom or one end, b: the other); u along a, v across */
function ribbon(a: V3[], b: V3[]) {
  const pos: number[] = [], uv: number[] = [];
  let u = 0;
  const v1 = Math.hypot(b[0][0] - a[0][0], b[0][1] - a[0][1], b[0][2] - a[0][2]);
  for (let i = 0; i < a.length - 1; i++) {
    const l = Math.hypot(a[i + 1][0] - a[i][0], a[i + 1][1] - a[i][1], a[i + 1][2] - a[i][2]);
    pos.push(...a[i], ...a[i + 1], ...b[i + 1], ...a[i], ...b[i + 1], ...b[i]);
    uv.push(u, 0, u + l, 0, u + l, v1, u, 0, u + l, v1, u, v1);
    u += l;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}
/** paving on a polygon of the model frame, its uvs in metres for the paver texture (2 m to a repeat) */
function paving(pts: [number, number][], y: number) {
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)))).rotateX(-Math.PI / 2).translate(0, y, 0);
  const p = g.attributes.position, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 2, p.getZ(i) / 2);
  return g;
}
function addMesh(k: Kit, gs: THREE.BufferGeometry[], m: THREE.Material | THREE.Material[], shadow = true) {
  if (!gs.length) return;
  const me = new THREE.Mesh(gs.length === 1 ? gs[0] : mergeUV(gs), m); me.castShadow = shadow; me.receiveShadow = true; k.meshes.push(me);
}
/** the UPSA crest: a gold shield with its dark emblem (G-01, G-03; drawn plainly, not copied) */
function crest(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  g.save(); g.translate(x, y);
  const shield = () => { g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h * 0.6); g.quadraticCurveTo(w, h * 0.9, w / 2, h); g.quadraticCurveTo(0, h * 0.9, 0, h * 0.6); g.closePath(); };
  shield(); g.fillStyle = '#7a5410'; g.fill();
  g.scale(0.86, 0.88); g.translate(w * 0.08, h * 0.06); shield(); g.fillStyle = GOLD; g.fill();
  g.fillStyle = '#3a2a10';
  g.fillRect(w * 0.47, h * 0.14, w * 0.06, h * 0.66);
  for (let i = 0; i < 5; i++) g.fillRect(w * 0.26, h * (0.2 + i * 0.12), w * 0.48, h * 0.035);
  g.restore();
}

// ======================================================================================================
// the Main Entrance
// ======================================================================================================
const P = PORTAL;
const GO: [number, number] = [(P.x0 + P.x1) / 2, (P.zS + P.zN) / 2];
const gx = (x: number) => x - GO[0], gz = (z: number) => z - GO[1];
/** the quarter ellipses of the arch's outer and inner edges, from the ground to the header */
function archCurve(outer: boolean, n = 28): [number, number][] {
  const a = P.apex - (outer ? P.foot : P.footIn), b = outer ? P.top : P.soffit, out: [number, number][] = [];
  for (let i = 0; i <= n; i++) { const t = (i / n) * (Math.PI / 2); out.push([P.apex - a * Math.cos(t), b * Math.sin(t)]); }
  return out;
}
const portal: Spec = {
  name: 'UPSA Main Entrance', axis: [1, 0], origin: GO, storey: 3.4, style: { bay: 4, up: [], ground: [], draw: (g) => render(g, '#f3f2ee') },
  roofColor: '#e9e8e3', fascia: '#e9e8e3', pitch: 0,
  replaces: [[GATE.roadX + 0.5, -913]],
  blocks: [],
  keep: [[gx(P.x0) - 2, gx(P.x1) + 2, gz(P.zN) - 4, gz(-896)]],
  extras: (k: Kit) => {
    const b = new Bag(GO), c: Part[] = [], tiles: THREE.BufferGeometry[] = [], wins: THREE.BufferGeometry[] = [], sky: THREE.BufferGeometry[] = [];
    const zS = gz(P.zS), zN = gz(P.zN), outer = archCurve(true), inner = archCurve(false);
    // ---- the faces: the band between the arch's two edges running on into the header's fascia, on both fronts ----
    const face: THREE.Vector2[] = [];
    for (const [x, y] of outer) face.push(new THREE.Vector2(gx(x), y));
    face.push(new THREE.Vector2(gx(P.east), P.top), new THREE.Vector2(gx(P.east), P.soffit));
    for (let i = inner.length - 1; i >= 0; i--) face.push(new THREE.Vector2(gx(inner[i][0]), inner[i][1]));
    for (const z of [zS - P.fin, zN]) tiles.push(new THREE.ExtrudeGeometry(new THREE.Shape(face), { depth: P.fin, bevelEnabled: false, curveSegments: 1 }).translate(0, 0, z));
    // the arch's curved back (its top) and its curved underside, running through the portal's depth
    tiles.push(ribbon(outer.map(([x, y]) => [gx(x), y, zN] as V3), outer.map(([x, y]) => [gx(x), y, zS] as V3)));
    tiles.push(ribbon(inner.map(([x, y]) => [gx(x), y, zN + P.fin] as V3), inner.map(([x, y]) => [gx(x), y, zS - P.fin] as V3)));
    // the header between the fronts: its roof and the deep soffit; the skylights in the soffit (G-01, G-03)
    tiles.push(tbox(gx(P.apex), gx(P.east), P.soffit, P.top, zN + P.fin, zS - P.fin));
    for (let i = 0; i < 4; i++) for (const zz of [-2.6, 1.4]) {
      const x = gx(P.apex) + 0.6 + i * 1.95;
      sky.push(new THREE.PlaneGeometry(1.2, 1.2).rotateX(Math.PI / 2).translate(x + 0.6, P.soffit - 0.02, zz + 0.6));
    }
    // a parapet along the top
    for (const z of [zS - 0.25, zN + 0.25]) tiles.push(tbox(gx(P.apex) - 0.2, gx(P.x1), P.top, P.top + 0.35, z - 0.15, z + 0.15));
    // ---- the tall tiled block on the east: blue windows on the fronts and toward the road, the guard post's door ----
    const ex0 = gx(P.east), ex1 = gx(P.x1);
    tiles.push(tbox(ex0, ex1, 0, P.top, zN, zS));
    for (const [z, out] of [[zS, 1], [zN, -1]] as [number, number][]) {
      const w = (x0: number, x1: number, y0: number, y1: number) => {
        const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0); if (out < 0) g.rotateY(Math.PI);
        wins.push(g.translate((x0 + x1) / 2, (y0 + y1) / 2, z + out * 0.03));
        c.push([box(x0 - 0.12, x1 + 0.12, y0 - 0.12, y0, z, z + out * 0.16), '#e4e2dc']);
      };
      w(ex0 + 1.3, ex0 + 4.1, 4.3, 6.6); w(ex0 + 2.6, ex0 + 4.6, 1.2, 3.1);
    }
    for (const [z0, z1, y0, y1] of [[-4.6, -2.2, 4.3, 6.5], [1.6, 4.0, 4.3, 6.5], [-4.0, -2.2, 1.4, 3.3]]) {
      wins.push(new THREE.PlaneGeometry(z1 - z0, y1 - y0).rotateY(-Math.PI / 2).translate(ex0 - 0.03, (y0 + y1) / 2, (z0 + z1) / 2));
    }
    b.door.push(new THREE.PlaneGeometry(1.0, 2.2).rotateY(-Math.PI / 2).translate(ex0 - 0.04, 1.1, 2.6));
    wallSolids(P.east, P.zS, P.east, P.zN, 0.3);
    // ---- the security booth under the arch, west of the road ----
    const [bx0, bx1, bz0, bz1] = P.booth;
    tiles.push(tbox(gx(bx0), gx(bx1), 0, 2.6, gz(bz0), gz(bz1)));
    c.push([box(gx(bx0) - 0.15, gx(bx1) + 0.15, 2.6, 2.75, gz(bz0) - 0.15, gz(bz1) + 0.15), '#d9d7d0']);
    wins.push(new THREE.PlaneGeometry(2.4, 1.0).rotateY(Math.PI / 2).translate(gx(bx1) + 0.03, 1.65, gz(bz0) + 2.2));
    b.door.push(new THREE.PlaneGeometry(0.9, 2.05).rotateY(Math.PI / 2).translate(gx(bx1) + 0.04, 1.03, gz(bz1) - 1.3));
    wallSolids(bx1, bz0, bx1, bz1, 0.3); wallSolids(bx0, bz0, bx0, bz1, 0.3);
    // the arch's foot on both fronts stops a bike
    for (const z of [P.zS - 0.25, P.zN + 0.25]) wallSolids(P.foot + 0.2, z, P.footIn - 0.1, z, 0.3);
    // ---- the lettering on the outer fascia (G-01, G-02): the name, the motto, UPSA; the crest at the arch's top ----
    const L = textPanel(12.7, 2.6, [
      { t: 'UNIVERSITY OF PROFESSIONAL STUDIES, ACCRA', s: 0.33, c: '#2b3f9c', b: true },
      { t: 'Scholarship with Professionalism', s: 0.21, c: '#b38a26', f: 'Georgia, "Times New Roman", serif' },
      { t: 'UPSA', s: 0.25, c: '#2b3f9c', b: true },
    ], null);
    k.meshes.push(place(L, gx(P.apex) + 7.0, P.soffit + 1.5, zS + 0.03, 0));
    const C = textPanel(1.5, 1.8, [], null, (g, W, H) => crest(g, W * 0.06, H * 0.04, W * 0.88, H * 0.92));
    k.meshes.push(place(C, gx(P.apex) - 0.4, P.soffit + 1.45, zS + 0.035, 0));
    // ---- the lift barriers, raised ----
    for (const [bxx, s] of [[GATE.clear[0] + 0.35, 1], [GATE.clear[1] - 0.35, -1]] as [number, number][]) {
      const x = gx(bxx), z = 0;
      c.push([box(x - 0.18, x + 0.18, 0, 1.05, z - 0.18, z + 0.18), '#e8e6e0'], [box(x - 0.19, x + 0.19, 0.9, 1.05, z - 0.19, z + 0.19), '#c8392f']);
      for (let i = 0; i < 6; i++) {
        const a: V3 = [x + s * 0.1 + s * i * 0.12, 1.0 + i * 0.6, z], e: V3 = [x + s * 0.1 + s * (i + 1) * 0.12, 1.0 + (i + 1) * 0.6, z];
        c.push([rod(a, e, 0.08), i % 2 ? '#c8392f' : '#f2f2f2']);
      }
      SOLIDS.add(bxx, GO[1], 0.25);
    }
    // ---- outside: the planting bed with its curved kerb at the arch's foot, the ramp with black rails (G-02, G-03) ----
    const bedC: [number, number] = [gx(P.foot) + 0.35, zS + 0.1];
    {
      const kerb: [number, number][] = [], soil: [number, number][] = [[bedC[0], bedC[1]]];
      for (let i = 0; i <= 16; i++) { const t = (i / 16) * (Math.PI / 2); kerb.push([bedC[0] + 2.0 * Math.sin(t), bedC[1] + 1.9 * Math.cos(t)]); }
      for (let i = 0; i < kerb.length - 1; i++) {
        const [ax, az] = kerb[i], [qx, qz] = kerb[i + 1];
        c.push([rod([ax, 0.15, az], [qx, 0.15, qz], 0.13), '#d2cfc6']);
      }
      soil.push(...kerb);
      c.push([prism(soil.map(([x, z]) => [x, z] as [number, number]), 0, 0.22), '#5b3f2c']);
      for (let i = 0; i < 9; i++) {
        const t = hash(i, 4.2) * (Math.PI / 2), r = 0.5 + hash(i, 7.1) * 1.3, x = bedC[0] + r * Math.sin(t), z = bedC[1] + r * Math.cos(t) * 0.85;
        const h = 0.5 + hash(i, 2.9) * 0.9, col = ['#c8382c', '#2f6a2a', '#d24a3a', '#3f7d33', '#8a2f2a'][i % 5];
        b.leaf.push([new THREE.IcosahedronGeometry(0.35 + h * 0.25, 0).scale(1, h, 1).translate(x, 0.22 + h * 0.4, z), col]);
      }
      wallSolids(P.foot + 0.45, P.zS + 2.0, P.foot + 2.35, P.zS + 0.1, 0.25);
    }
    {
      const r0 = gx(P.footIn) + 0.8, r1 = gx(2291.9 - 2.3) - 0.5, rz0 = zS + 0.3, rz1 = zS + 1.9;
      const ramp = new THREE.BufferGeometry();
      ramp.setAttribute('position', new THREE.Float32BufferAttribute([r1, 0.02, rz0, r0, 0.38, rz0, r0, 0.38, rz1, r1, 0.02, rz0, r0, 0.38, rz1, r1, 0.02, rz1], 3));
      ramp.computeVertexNormals();
      c.push([ramp, '#b9b4aa'], [box(r0 - 0.9, r0, 0, 0.38, rz0, rz1), '#b9b4aa']);
      for (const z of [rz0, rz1]) {
        c.push([rod([r1, 0.9, z], [r0, 1.26, z], 0.045), '#16181a']);
        for (const x of [r1, (r0 + r1) / 2, r0]) c.push([rod([x, 0, z], [x, 0.9 + (0.36 * (r1 - x)) / (r1 - r0), z], 0.04), '#16181a']);
      }
    }
    // ---- the paved apron in front and the paved passage, either side of the entrance road ----
    const road = (z: number) => { const t = (z + 881.5) / (-906.8 + 881.5); return z > -906.8 ? 2293.1 + (2291.9 - 2293.1) * t : 2291.9 + (2290.0 - 2291.9) * ((z + 906.8) / (-919.3 + 906.8)); };
    const half = 2.3 + 0.12, zA = -897.5;
    const pv = [
      paving([[gx(P.foot) + 2.4, zS], [gx(road(P.zS) - half), zS], [gx(road(zA) - half), gz(zA)], [gx(P.foot) + 2.4, gz(zA)]], 0.035),
      paving([[gx(road(P.zS) + half), zS], [gx(P.x1), zS], [gx(P.x1), gz(zA)], [gx(road(zA) + half), gz(zA)]], 0.035),
      paving([[gx(P.footIn), zN], [gx(road(P.zN) - half), zN], [gx(road(P.zS) - half), zS], [gx(P.footIn), zS]], 0.035),
      paving([[gx(road(P.zN) + half), zN], [gx(P.east), zN], [gx(P.east), zS], [gx(road(P.zS) + half), zS]], 0.035),
    ];
    addMesh(k, pv, pavers('grey'), false);
    addMesh(k, tiles, tileMat());
    addMesh(k, wins, blueWin(), false);
    addMesh(k, sky, skylight(), false);
    const m = new THREE.Mesh(merge(c), concrete(0.2)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.finish(k, 0.2);
  },
};

// ======================================================================================================
// Kofi Ohene-Konadu Auditorium, its forecourt and the fountain court
// ======================================================================================================
const KO: [number, number] = [2376, -1195];
const kx = (x: number) => x - KO[0], kz = (z: number) => z - KO[1];
const koka: Spec = {
  name: 'Kofi Ohene-Konadu Auditorium (KOKA)', axis: [1, 0], origin: KO, storey: 4, style: { bay: 4, up: [], ground: [], draw: (g) => render(g, '#f3f2ee') },
  roofColor: '#6f8fbf', fascia: '#e9e8e3', pitch: 0,
  replaces: [[2376, -1200]],
  blocks: [],
  keep: [[kx(KOKA.plaza[0]), kx(KOKA.plaza[1]), kz(KOKA.plaza[2]) - 12, kz(KOKA.plaza[3])], [kx(2290), kx(2350), kz(-1130), kz(-1075)]],
  extras: (k: Kit) => {
    const b = new Bag(KO), c: Part[] = [], tiles: THREE.BufferGeometry[] = [], glass: THREE.BufferGeometry[] = [], dark: THREE.BufferGeometry[] = [], navy: THREE.BufferGeometry[] = [];
    const R = (r: [number, number, number, number]) => [kx(r[0]), kx(r[1]), kz(r[2]), kz(r[3])] as [number, number, number, number];
    // ---- the side masses: white tiles, tall dark slot windows on their fronts and sides ----
    for (const r of [KOKA.west, KOKA.east]) {
      const [x0, x1, z0, z1] = R(r);
      tiles.push(tbox(x0, x1, 0, KOKA.sideH, z0, z1));
      tiles.push(tbox(x0 - 0.15, x1 + 0.15, KOKA.sideH, KOKA.sideH + 0.5, z0 - 0.15, z1 + 0.15));
      for (const f of [0.3, 0.66]) { const x = x0 + (x1 - x0) * f; c.push([box(x - 0.45, x + 0.45, 3.5, KOKA.sideH - 2.5, z1, z1 + 0.06), '#2a3140']); }
      const sx = r === KOKA.west ? x0 : x1, s = r === KOKA.west ? -1 : 1;
      for (let z = z0 + 6; z < z1 - 3; z += 8.5) c.push([box(Math.min(sx, sx + s * 0.06), Math.max(sx, sx + s * 0.06), 3.5, KOKA.sideH - 2.5, z - 0.4, z + 0.4), '#2a3140']);
    }
    // ---- the auditorium: tiled walls, the blue metal roof on two slopes, tiled gables ----
    {
      const [x0, x1, z0, z1] = R(KOKA.hall), H = KOKA.hallH, xm = (x0 + x1) / 2, rise = 0.18 * (x1 - x0) / 2;
      tiles.push(tbox(x0, x1, 0, H, z0, z1 - 0.2));
      const roof = [
        ribbon([[x0 - 0.6, H - 0.1, z0 - 0.6], [x0 - 0.6, H - 0.1, z1 + 0.2]], [[xm, H + rise, z0 - 0.6], [xm, H + rise, z1 + 0.2]]),
        ribbon([[xm, H + rise, z0 - 0.6], [xm, H + rise, z1 + 0.2]], [[x1 + 0.6, H - 0.1, z0 - 0.6], [x1 + 0.6, H - 0.1, z1 + 0.2]]),
      ];
      addMesh(k, roof, roofMat('#6f8fbf'));
      for (const z of [z0, z1 - 0.2]) {
        const tri = new THREE.Shape([new THREE.Vector2(x0, H), new THREE.Vector2(x1, H), new THREE.Vector2(xm, H + rise)]);
        tiles.push(new THREE.ExtrudeGeometry(tri, { depth: 0.3, bevelEnabled: false }).translate(0, 0, z - 0.15));
      }
    }
    // ---- the lobby under the curtain wall ----
    const n = 30, arc: [number, number][] = [];
    for (let i = 0; i <= n; i++) { const [x, z] = kokaArc(-KOKA.arc.half + (2 * KOKA.arc.half * i) / n); arc.push([kx(x), kz(z)]); }
    const door = kz(KOKA.door), lx0 = arc[0][0], lx1 = arc[n][0];
    tiles.push(tbox(kx(KOKA.hall[0]), kx(KOKA.hall[1]), 0, KOKA.lobbyH + 0.8, kz(KOKA.hall[3]), door));
    for (const x of [lx0, lx1]) tiles.push(tbox(x - 0.7, x + 0.7, 0, KOKA.lobbyH + 0.8, door, arc[0][1] + 0.3));
    const plate: [number, number][] = [[lx0, door], ...arc, [lx1, door]];
    navy.push(prism(plate, KOKA.glass0 - 1.0, KOKA.glass0));
    tiles.push(prism(plate, KOKA.lobbyH, KOKA.lobbyH + 0.8));
    // the broad convex blue glass curtain wall
    glass.push(ribbon(arc.map(([x, z]) => [x, KOKA.glass0, z] as V3), arc.map(([x, z]) => [x, KOKA.lobbyH, z] as V3)));
    // the recessed entrance: the glazed wall set back, the dark columns along the curve, the steps
    dark.push(ribbon([[lx0 + 0.7, 0.45, door + 0.03], [lx1 - 0.7, 0.45, door + 0.03]], [[lx0 + 0.7, KOKA.glass0 - 1.0, door + 0.03], [lx1 - 0.7, KOKA.glass0 - 1.0, door + 0.03]]));
    for (let i = 1; i < 8; i++) {
      const [x, z] = kokaArc(-KOKA.arc.half + (2 * KOKA.arc.half * i) / 8), cx = kx(x), cz = kz(z) - 0.7;
      c.push([box(cx - 0.38, cx + 0.38, 0.45, KOKA.glass0 - 1.0, cz - 0.38, cz + 0.38), '#383d45']);
      const [wx, wz] = k.world(cx, cz); SOLIDS.add(wx, wz, 0.45);
    }
    for (let s = 0; s < 3; s++) {
      const out = 1.6 - s * 0.5, pts: [number, number][] = [[lx0 - 0.2, door]];
      for (let i = 0; i <= n; i++) { const t = -KOKA.arc.half + (2 * KOKA.arc.half * i) / n; const [x, z] = kokaArc(t); pts.push([kx(x) + Math.sin(t) * out, kz(z) + Math.cos(t) * out]); }
      pts.push([lx1 + 0.2, door]);
      c.push([prism(pts, s * 0.15, (s + 1) * 0.15), '#d8d4cb']);
    }
    // ---- the paved forecourt to the walk, the lamps, its trees ----
    const P0 = KOKA.plaza, fc: [number, number][] = [[kx(P0[0]), kz(P0[3])], [kx(P0[1]), kz(P0[3])], [kx(P0[1]), kz(-1173.4)], [kx(2395.7), kz(-1173.4)], [lx1 + 0.8, arc[n][1]]];
    for (let i = n; i >= 0; i--) fc.push([arc[i][0] + (i === 0 || i === n ? 0 : 0), arc[i][1] + 1.7]);
    fc.push([lx0 - 0.8, arc[0][1]], [kx(2357.0), kz(-1174.6)], [kx(P0[0]), kz(-1174.6)]);
    addMesh(k, [paving(fc, 0.04)], pavers('grey'), false);
    for (const [x, z] of LAMPS) {
      const [lx, lz] = [kx(x), kz(z)];
      c.push([new THREE.CylinderGeometry(0.07, 0.1, 7.5, 8).translate(lx, 3.75, lz), '#9aa0a6']);
      for (const s of [-1, 1]) { c.push([rod([lx, 7.3, lz], [lx + s * 0.9, 7.6, lz], 0.04), '#9aa0a6'], [box(lx + s * 0.9 - 0.3, lx + s * 0.9 + 0.3, 7.5, 7.62, lz - 0.14, lz + 0.14), '#2b2e33']); }
      c.push([box(lx - 0.55, lx + 0.55, 7.7, 7.75, lz - 0.35, lz + 0.35), '#24324f']);
      SOLIDS.add(x, z, 0.2);
    }
    for (const [x, z] of [[2360.5, -1147.5], [2391, -1147.5], [2351, -1158], [2401, -1155]] as [number, number][]) {
      if (clear(x, z, 2.5)) broadleaf(k, b.leaf, x, z, { h: 6.5, spread: 6.5, seed: x * 0.7 + z, origin: KO });
    }
    // ---- the fountain in the quadrangle: the stepped orange-brown rim, the water, the jets, the white pebbles ----
    {
      const fx = kx(FOUNTAIN.x), fz = kz(FOUNTAIN.z), F = FOUNTAIN;
      c.push([new THREE.RingGeometry(F.rim, F.pebbles, 40).rotateX(-Math.PI / 2).translate(fx, 0.05, fz), '#e4e1d9']);
      c.push([new THREE.CylinderGeometry(F.rim, F.rim, 0.3, 40).translate(fx, 0.15, fz), '#b4552a']);
      c.push([new THREE.CylinderGeometry(F.rim - 0.45, F.rim - 0.45, 0.62, 40).translate(fx, 0.31, fz), '#c86a33']);
      c.push([new THREE.CylinderGeometry(F.rim - 0.75, F.rim - 0.75, 0.5, 40).translate(fx, 0.25, fz), '#6d8e9a']);
      c.push([new THREE.CylinderGeometry(0.9, 1.0, 0.85, 20).translate(fx, 0.43, fz), '#c86a33']);
      b.water.push(new THREE.CircleGeometry(F.rim - 0.75, 40).rotateX(-Math.PI / 2).translate(fx, 0.55, fz));
      b.spray.push(new THREE.CylinderGeometry(0.06, 0.45, 4.6, 12, 1, true).translate(fx, 0.85 + 2.3, fz));
      b.spray.push(new THREE.CylinderGeometry(0.5, 0.2, 0.9, 12, 1, true).translate(fx, 0.85 + 4.4, fz));
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2, x = fx + Math.cos(a) * 2.1, z = fz + Math.sin(a) * 2.1;
        b.spray.push(new THREE.CylinderGeometry(0.04, 0.2, 2.2, 8, 1, true).translate(x, 0.55 + 1.1, z));
      }
      SOLIDS.add(F.x, F.z, F.rim);
    }
    // ---- the benches beside the walks: grey concrete seats on two legs ----
    for (const [x, z, ry] of BENCHES) {
      const g = [box(-0.85, 0.85, 0.4, 0.48, -0.25, 0.25), box(-0.7, -0.5, 0, 0.4, -0.2, 0.2), box(0.5, 0.7, 0, 0.4, -0.2, 0.2), box(-0.85, 0.85, 0.48, 0.9, 0.2, 0.27)];
      for (const q of g) c.push([q.rotateY(ry).translate(kx(x), 0, kz(z)), '#a8a49c']);
      SOLIDS.add(x, z, 0.8);
    }
    // ---- the "We love UPSA" letters on the lawn, toward the court (the court photographs) ----
    {
      const sx = kx(LOVE_SIGN.x), sz = kz(LOVE_SIGN.z), ry = LOVE_SIGN.ry;
      c.push([box(-3.1, 3.1, 0, 0.35, -0.35, 0.35).rotateY(ry).translate(sx, 0, sz), '#161616']);
      const S = textPanel(6.0, 1.5, [], null, (g, W, H) => {
        g.textBaseline = 'middle'; g.font = `bold ${Math.round(H * 0.8)}px Arial, Helvetica, sans-serif`; g.lineJoin = 'round';
        const y = H * 0.55;
        g.fillStyle = '#1b2240'; g.fillText('We', W * 0.03, y);
        g.fillStyle = '#d81f2a'; g.beginPath(); const hx = W * 0.33, hy = H * 0.3, hs = H * 0.32;
        g.moveTo(hx, hy + hs * 0.6); g.bezierCurveTo(hx - hs * 1.3, hy - hs * 0.4, hx - hs * 0.4, hy - hs * 1.3, hx, hy - hs * 0.25);
        g.bezierCurveTo(hx + hs * 0.4, hy - hs * 1.3, hx + hs * 1.3, hy - hs * 0.4, hx, hy + hs * 0.6 + hs * 0.9); g.fill();
        g.lineWidth = H * 0.06; g.strokeStyle = '#1b1b1b'; g.strokeText('UPSA', W * 0.43, y); g.fillStyle = '#f6f6f2'; g.fillText('UPSA', W * 0.43, y);
        crest(g, W * 0.88, H * 0.12, W * 0.1, H * 0.8);
      });
      k.meshes.push(place(S, sx, 0.35 + 0.75, sz, ry));
      SOLIDS.add(LOVE_SIGN.x, LOVE_SIGN.z, 1.0);
      wallSolids(LOVE_SIGN.x - 2.9 * Math.cos(ry), LOVE_SIGN.z + 2.9 * Math.sin(ry), LOVE_SIGN.x + 2.9 * Math.cos(ry), LOVE_SIGN.z - 2.9 * Math.sin(ry), 0.3);
    }
    addMesh(k, tiles, tileMat());
    addMesh(k, glass, glassMat(1.6, 1.45));
    addMesh(k, dark, glassMat(1.8, 2.2, true), false);
    addMesh(k, navy, new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.5 }));
    const m = new THREE.Mesh(merge(c), concrete(0.2)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.finish(k, 0.2);
  },
};

// ======================================================================================================
// the Justice Aryeetey Building
// ======================================================================================================
const winBlue = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cols = 3) => {
  g.fillStyle = '#9aa6b4'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  const gl = g.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, '#5b8bd2'); gl.addColorStop(1, '#1f4a94');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = '#d6dde5'; for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - 2, y, 4, h);
};
/** white walls, a wide blue-glazed window to a bay, a white slab band each storey (image 9, the court photographs) */
const JA_FACE: Style = {
  bay: 3.6, up: [[34, 64, 188, 128]], ground: [[34, 256 + 64, 188, 128]],
  draw: (g) => { render(g, '#f5f5f2'); for (const y0 of [0, 256]) { g.fillStyle = '#e4e4df'; g.fillRect(0, y0, 256, 22); g.fillStyle = '#c9cbc7'; g.fillRect(0, y0 + 22, 256, 3); winBlue(g, 34, y0 + 64, 188, 128); } },
};
const JO: [number, number] = [2412.3, -1118.6];
const jx = (x: number) => x - JO[0], jz = (z: number) => z - JO[1];
const [cA, cB] = JA.courts;
const justice: Spec = {
  name: 'Justice Aryeetey Building', axis: [1, 0], origin: JO, storey: JA.storey, style: JA_FACE, roofColor: '#d9d8d3', fascia: '#ecebe6', pitch: 0,
  replaces: [[2398, -1120]],
  blocks: [
    { x0: jx(JA.x0), x1: jx(cA[0]), z0: jz(JA.z0), z1: jz(JA.z1), floors: JA.floors, roof: 'flat' },
    { x0: jx(cA[1]), x1: jx(JA.x1), z0: jz(JA.z0), z1: jz(JA.z1), floors: JA.floors, roof: 'flat' },
    { x0: jx(cA[0]), x1: jx(cA[1]), z0: jz(JA.z0), z1: jz(cB[2]), floors: JA.floors, roof: 'flat' },
    { x0: jx(cA[0]), x1: jx(cA[1]), z0: jz(cB[3]), z1: jz(cA[2]), floors: JA.floors, roof: 'flat' },
    { x0: jx(cA[0]), x1: jx(cA[1]), z0: jz(cA[3]), z1: jz(JA.z1), floors: JA.floors, roof: 'flat' },
  ],
  keep: [],
  extras: (k: Kit) => {
    const c: Part[] = [], top = k.wallTop(JA.floors), x0 = jx(JA.x0), dark: THREE.BufferGeometry[] = [];
    // the broad blue strips up the west front, and two on each end
    for (const z of JA.strips) c.push([box(x0 - 0.3, x0 + 0.05, 0.5, top + 0.4, jz(z) - 1.25, jz(z) + 1.25), UPSA_BLUE]);
    for (const zf of [jz(JA.z0), jz(JA.z1)]) {
      const s = zf < 0 ? -1 : 1;
      for (const x of [jx(2396), jx(2428)]) c.push([box(x - 1.25, x + 1.25, 0.5, top + 0.4, Math.min(zf, zf + s * 0.3), Math.max(zf, zf + s * 0.3)), UPSA_BLUE]);
    }
    // the central circulation bay over the main entrance: two blue piers standing proud, the recessed dark glazing of the
    // stair between them, the white arched cap over the top
    const zb = jz(JA.bay);
    for (const dz of [-3.6, 3.6]) c.push([box(x0 - 0.9, x0 + 0.05, 0, top + 2.6, zb + dz - 0.6, zb + dz + 0.6), UPSA_BLUE]);
    dark.push(ribbon([[x0 - 0.04, 5.2, zb - 3.0], [x0 - 0.04, 5.2, zb + 3.0]], [[x0 - 0.04, top + 1.6, zb - 3.0], [x0 - 0.04, top + 1.6, zb + 3.0]]));
    c.push([box(x0 - 0.4, x0 + 1, top, top + 1.6, zb - 3.0, zb + 3.0), '#f2f2ee']);
    c.push([new THREE.CylinderGeometry(4.2, 4.2, 1.2, 28, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).translate(x0 - 0.3, top + 2.6, zb), '#f4f4f0']);
    c.push([new THREE.CylinderGeometry(3.3, 3.3, 1.25, 28, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).translate(x0 - 0.3, top + 2.6, zb), UPSA_BLUE]);
    // the parapets
    c.push([box(x0 - 0.1, jx(JA.x1) + 0.1, top, top + 0.9, jz(JA.z0) - 0.1, jz(JA.z0) + 0.25), '#efefea'], [box(x0 - 0.1, jx(JA.x1) + 0.1, top, top + 0.9, jz(JA.z1) - 0.25, jz(JA.z1) + 0.1), '#efefea']);
    c.push([box(x0 - 0.1, x0 + 0.25, top, top + 0.9, jz(JA.z0), jz(JA.z1)), '#efefea']);
    addMesh(k, dark, glassMat(1.5, 1.7));
    const m = new THREE.Mesh(merge(c), concrete(0.2)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

// ======================================================================================================
// the Opoku Ampomah Building / Central Administration Block
// ======================================================================================================
let ADMIN_WALL: THREE.MeshStandardMaterial | null = null;
/** the drum's walls: light render, a dark glazed window a bay, 4 m storeys; uvs in metres (3 m bays) */
const adminWall = () => (ADMIN_WALL ??= (() => {
  const t = canvas(128, 128, (g) => {
    g.fillStyle = '#ece6da'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#d8d0c2'; g.fillRect(0, 0, 128, 6);
    g.fillStyle = '#c9c2b4'; g.fillRect(20, 40, 88, 62);
    g.fillStyle = '#26303c'; g.fillRect(24, 44, 80, 54);
    g.fillStyle = '#596779'; g.fillRect(62, 44, 4, 54);
  });
  t.repeat.set(1 / 3, 1 / 4); t.offset.set(0, -0.25);
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.85, side: THREE.DoubleSide });
})());
/** the wings: blue cladding panels round white-framed windows, white piers (REF A-02) */
const WING_FACE: Style = {
  bay: 3.4, up: [[78, 72, 100, 112]], ground: [[78, 256 + 72, 100, 112]],
  draw: (g) => {
    render(g, '#eef0f1');
    for (const y0 of [0, 256]) {
      g.fillStyle = '#2b55a6'; g.fillRect(26, y0 + 18, 204, 220);
      g.fillStyle = '#3a66b8'; g.beginPath(); g.moveTo(128, y0 + 22); g.lineTo(222, y0 + 128); g.lineTo(128, y0 + 234); g.lineTo(34, y0 + 128); g.closePath(); g.fill();
      g.fillStyle = '#f4f4f1'; g.fillRect(70, y0 + 64, 116, 128);
      winBlue(g, 78, y0 + 72, 100, 112, 2);
    }
  },
};
const AO: [number, number] = [ADMIN.cx, ADMIN.cz];
const admin: Spec = {
  name: 'Opoku Ampomah Building (Central Administration)', axis: [1, 0], origin: AO, storey: 4, style: WING_FACE, roofColor: '#d6d4cd', fascia: '#ecebe6', pitch: 0,
  replaces: [[2360, -969]],
  blocks: [],
  keep: [[-34, -21, -18, 18]],
  extras: (k: Kit) => {
    const c: Part[] = [], tiles: THREE.BufferGeometry[] = [], glass: THREE.BufferGeometry[] = [], dark: THREE.BufferGeometry[] = [];
    const L = (pts: [number, number][]) => pts.map(([x, z]) => [x - AO[0], z - AO[1]] as [number, number]);
    // the drum: the whole outline to the second floor, the drum without its links above (the light walls, dark windows)
    const low = prism(L(ADMIN.outline), 0, ADMIN.low), up = prism(L(ADMIN.drum), ADMIN.low, ADMIN.top - 0.4);
    for (const g of [low, up]) { const me = new THREE.Mesh(g, [new THREE.MeshStandardMaterial({ color: '#d9d6cf', roughness: 0.9 }), adminWall()]); me.castShadow = true; me.receiveShadow = true; k.meshes.push(me); }
    // the curved blue glass band on the west front, leaning out, white bands above and below it; the lettering
    const n = 26, A = (i: number) => ADMIN.a0 + ((ADMIN.a1 - ADMIN.a0) * i) / n, at = (a: number, r: number): [number, number] => { const [x, z] = adminAt(a, r); return [x - AO[0], z - AO[1]]; };
    const ring = (r0: number, r1: number) => { const pts: [number, number][] = []; for (let i = 0; i <= n; i++) pts.push(at(A(i), r1)); for (let i = n; i >= 0; i--) pts.push(at(A(i), r0)); return pts; };
    const bot: V3[] = [], tp: V3[] = [];
    for (let i = 0; i <= n; i++) { const [x0, z0] = at(A(i), 21.9), [x1, z1] = at(A(i), 23.1); bot.push([x0, ADMIN.band0, z0]); tp.push([x1, ADMIN.band1, z1]); }
    glass.push(ribbon(bot, tp));
    tiles.push(prism(ring(ADMIN.r - 0.6, 22.2), ADMIN.band0 - 0.75, ADMIN.band0));
    tiles.push(prism(ring(ADMIN.r - 0.6, 23.4), ADMIN.band1, ADMIN.top));
    const [mx, mz] = at(Math.PI, 22.25);
    k.meshes.push(place(textPanel(9.5, 0.62, [{ t: 'OPOKU AMPOMAH BUILDING', s: 0.8, c: '#1a1a1a', b: true }], null), mx - 0.02, ADMIN.band0 - 0.38, mz, -Math.PI / 2));
    // "UPSA" and the crest standing on the roof edge over the middle
    const [ux, uz] = at(Math.PI, 22.6);
    c.push([box(ux - 0.15, ux + 0.15, ADMIN.top, ADMIN.top + 1.5, uz - 2.6, uz + 2.6), '#f4f4f1']);
    k.meshes.push(place(textPanel(5.0, 1.3, [{ t: '     UPSA', s: 0.75, c: '#24459c', b: true }], null, (g, W, H) => crest(g, W * 0.1, H * 0.08, W * 0.14, H * 0.84)), ux - 0.17, ADMIN.top + 0.75, uz, -Math.PI / 2));
    // the first floor's windows round the front under the band, the grey CENTRAL ADMINISTRATION band, the entrance glazing
    const fb: V3[] = [], ft: V3[] = [], eb: V3[] = [], et: V3[] = [];
    for (let i = 0; i <= n; i++) {
      const a = A(i), [x, z] = at(a, ADMIN.r + 0.04); fb.push([x, 4.6, z]); ft.push([x, 7.0, z]);
      const ae = Math.PI - 0.32 + (0.64 * i) / n, [ex, ez] = at(ae, ADMIN.r + 0.04); eb.push([ex, 0.3, ez]); et.push([ex, 3.2, ez]);
    }
    dark.push(ribbon(fb, ft), ribbon(eb, et));
    const [gx0, gz0] = at(Math.PI, ADMIN.r);
    c.push([box(gx0 - 2.6, gx0 + 2.5, 3.4, 4.9, gz0 - 8, gz0 + 8), '#7d828a'], [box(gx0 - 2.3, gx0 + 3.6, 3.25, 3.4, gz0 - 8.6, gz0 + 8.6), '#8c9098']);
    k.meshes.push(place(textPanel(11, 0.9, [{ t: 'CENTRAL ADMINISTRATION', s: 0.62, c: '#e9dcc0', b: true, f: 'Georgia, "Times New Roman", serif' }], null), gx0 - 2.63, 4.15, gz0, -Math.PI / 2));
    // the flagpole by the entrance (REF A-02)
    const [fx, fz] = at(Math.PI + 0.38, ADMIN.r + 6);
    c.push([new THREE.CylinderGeometry(0.05, 0.07, 9, 8).translate(fx, 4.5, fz), '#d8d8d8']);
    SOLIDS.add(fx + AO[0], fz + AO[1], 0.2);
    addMesh(k, tiles, tileMat());
    addMesh(k, glass, glassMat(1.5, 2.8));
    addMesh(k, dark, glassMat(1.6, 1.2, true), false);
    const m = new THREE.Mesh(merge(c), concrete(0.2)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};
const R4 = (r: number[]) => ({ x0: r[0], x1: r[1], z0: r[2], z1: r[3] });
const wings: Spec[] = ADMIN.wings.map((w, i) => ({
  name: `Central Administration ${i ? 'south-west' : 'north-west'} wing`, axis: w.axis, origin: w.c, storey: 3.5, style: WING_FACE, roofColor: '#8fb5dc', fascia: '#eef0f1', pitch: 0.5,
  replaces: [w.c],
  blocks: [{ ...R4(w.main), floors: 3 }, ...w.bays.map((r) => ({ ...R4(r), floors: 3 }))],
  keep: [],
  extras: () => {},
}));

// ======================================================================================================
// the Joshua Alabi Library
// ======================================================================================================
/** white walls with a white floor band standing out, a blue-glazed window to a bay with the breeze-block squares beside
 *  it (REF L-01, L-02) */
const LIB_FACE: Style = {
  bay: 3.3, up: [[64, 70, 128, 120]], ground: [[64, 256 + 70, 128, 120]],
  draw: (g) => {
    render(g, '#f6f6f3');
    for (const y0 of [0, 256]) {
      g.fillStyle = '#fbfbf9'; g.fillRect(0, y0 + 210, 256, 34); g.fillStyle = '#cfd1cd'; g.fillRect(0, y0 + 244, 256, 4);
      winBlue(g, 64, y0 + 70, 128, 120, 2);
      g.fillStyle = '#9da3a8'; for (const x of [18, 36, 214, 232]) for (const y of [96, 116, 136]) g.fillRect(x, y0 + y, 10, 10);
    }
  },
};
/** the central bay: a narrower window to a bay, white surround */
const LIB_CENTRE: Style = {
  bay: 3.6, up: [[88, 64, 80, 132]], ground: [[88, 256 + 64, 80, 132]],
  draw: (g) => { render(g, '#f7f7f4'); for (const y0 of [0, 256]) { g.fillStyle = '#e9e9e5'; g.fillRect(0, y0, 256, 8); winBlue(g, 88, y0 + 64, 80, 132, 2); } },
};
const LB = LIBRARY, [lc0, lc1, lcz0] = LB.centre, LTOP = LB.floors * LB.storey;
const library: Spec = {
  name: 'Joshua Alabi Library', axis: LB.axis, origin: LB.c, storey: LB.storey, style: LIB_FACE, roofColor: '#d9d8d3', fascia: '#f2f2ee', pitch: 0,
  replaces: [[2413, -1040]],
  blocks: [
    ...LB.ranges.map((r) => ({ ...R4(r), floors: LB.floors, roof: 'flat' as const })),
    { ...R4(LB.centre), floors: LB.floors, roof: 'flat' as const, faces: { z0: LIB_CENTRE, x0: LIB_CENTRE, x1: LIB_CENTRE } },
    { x0: lc0, x1: lc1, z0: lcz0, z1: lcz0 + 9, floors: 1, roof: 'flat' as const, y: LTOP, faces: { z0: LIB_CENTRE, x0: LIB_CENTRE, x1: LIB_CENTRE, z1: LIB_CENTRE } },
  ],
  keep: [[lc0 - 1, lc1 + 1, lcz0 - 1.2, lcz0]],
  extras: (k: Kit) => {
    const b = new Bag([0, 0]), c: Part[] = [], xm = (lc0 + lc1) / 2, zf = lcz0, T = LTOP + LB.storey;
    // the parapets of the wings, the central bay's pediment over its arched top window
    for (const r of LB.ranges) c.push([box(r[0] - 0.05, r[1] + 0.05, LTOP, LTOP + 0.7, r[2] - 0.05, r[3] + 0.05), '#f1f1ed']);
    const ped = new THREE.Shape([new THREE.Vector2(lc0 - 0.4, 0), new THREE.Vector2(lc1 + 0.4, 0), new THREE.Vector2(xm, 2.4)]);
    c.push([new THREE.ExtrudeGeometry(ped, { depth: 9.4, bevelEnabled: false }).translate(0, T, zf - 0.4), '#f5f5f2']);
    c.push([box(lc0 - 0.4, lc1 + 0.4, T - 0.25, T, zf - 0.45, zf + 9.0), '#e6e6e1']);
    // the arched window in the top storey: blue glass under a semicircle, its white glazing bars
    const aw = new THREE.Shape(); aw.moveTo(xm - 2.4, T - 3.0); aw.lineTo(xm + 2.4, T - 3.0); aw.lineTo(xm + 2.4, T - 1.9); aw.absarc(xm, T - 1.9, 2.4, 0, Math.PI, false); aw.closePath();
    const awg = new THREE.ShapeGeometry(aw, 20).rotateY(Math.PI).translate(2 * xm, 0, zf - 0.06);
    k.meshes.push(new THREE.Mesh(awg, new THREE.MeshStandardMaterial({ color: '#3d6fbf', roughness: 0.2, metalness: 0.35, side: THREE.DoubleSide })));
    for (let i = 0; i <= 4; i++) { const a = (i / 4) * Math.PI; c.push([rod([xm, T - 1.9, zf - 0.09], [xm + Math.cos(a) * 2.4, T - 1.9 + Math.sin(a) * 2.4, zf - 0.09], 0.05), '#f4f4f1']); }
    c.push([box(xm - 2.5, xm + 2.5, T - 1.95, T - 1.85, zf - 0.12, zf - 0.05), '#f4f4f1']);
    // the entrance: the blue columns in pairs either side of the glazed doors, the sign over them, the steps
    for (const x of [xm - 3.5, xm - 2.6, xm + 2.6, xm + 3.5]) c.push([box(x - 0.28, x + 0.28, 0.45, 2 * LB.storey + 0.6, zf - 0.6, zf - 0.04), '#2c56a6']);
    b.door.push(new THREE.PlaneGeometry(3.2, 2.6).rotateY(Math.PI).translate(xm, 0.45 + 1.3, zf - 0.04));
    k.meshes.push(place(textPanel(5.6, 0.55, [{ t: 'JOSHUA ALABI LIBRARY', s: 0.62, c: '#1d2d5c', b: true }], '#f7f7f4'), xm, 2 * LB.storey + 1.1, zf - 0.07, Math.PI));
    for (let s = 0; s < 3; s++) c.push([box(xm - 4.6 + s * 0.25, xm + 4.6 - s * 0.25, s * 0.15, (s + 1) * 0.15, zf - 0.9 + s * 0.3, zf), '#d6d3cb']);
    for (const x of [xm - 3.5, xm + 3.5]) { const [wx, wz] = k.world(x, zf - 0.35); SOLIDS.add(wx, wz, 0.35); }
    const m = new THREE.Mesh(merge(c), concrete(0.2)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.finish(k, 0.2);
  },
};

export const upsaLandmarksSite = createSite('upsa-landmarks', [portal, koka, justice, admin, ...wings, library]);
