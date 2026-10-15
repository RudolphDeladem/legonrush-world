// Legon Road (the N4) beside the University of Ghana Sports Stadium, the La Bawaleshie Road junction and the
// neighbourhood east of it (the owner's 19-pair brief "Legon Road and La Bawaleshie", with its annotated aerial and
// satellite crop; numbers in lbplan.ts). The roads, the stadium and the outlines are the mapped ones; this replaces the
// campus template (white walls, red tile hips, lawn) where the photographs show something else:
// - the neighbourhood east of the N4, both sides of La Bawaleshie Road: every mapped outline built as the local mixed
//   fabric: one to four storeys (from its size and whether it fronts a road), walls in the local colours, flat roofs
//   behind parapets with water tanks or low metal roofs, shop bays with roller shutters and sign bands on the faces
//   toward a road, the odd gallery; compacted earth and dust round them, mature trees and palms in the gaps, poles and
//   wires along La Bawaleshie Road and the N4 frontage, a pole-mounted transformer by the corner (Pairs 2, 4, 11, 12,
//   15-19, Additional References 3 to 6);
// - the buildings the photographs single out (lbplan.ts PICKS): the beige institutional block with its tall dark grey
//   face and the lattice mast behind it (Pairs 1, 2), the cream block with orange vertical accents and dark window bands
//   (Pair 4), the retail corner with the orange lower wall (Pairs 12, 19), the green gable-front building and the pale
//   red-trimmed one (Pair 16); and the frontages the map lacks (lbplan.ts MASSES: the low yellow frontage with its dark
//   display, the small metal-roofed shops, the blue frontage, Pairs 11, 17-19);
// - the compound beyond the scrub west of the N4: low grey and white sheds under blue and grey metal roofs (Pair 3);
// - the N4's median: kerbed patchy grass and red earth with young planted trees (Pairs 1, 2, 4, 9, 13);
// - the scrub west of the N4 north of the junction: dense unmanaged shrubs, tall weeds and small trees on uneven ground
//   behind a narrow worn path (Pair 3);
// - the stadium-side verge: the red brick path, rough grass and earth, the steel fence along the car parks with young
//   trees, billboard panels, empty steel frames and a slender lattice mast (Pairs 8, 9, 13, 14);
// - the junction: a signal post on each island, the islands' worn stone paving, the utility cabinet and short bollards
//   (Pairs 5-7, 10).
import * as THREE from 'three';
import { RED_SHED, behindYardFence, inYard } from './jjplan';
import { BUILDINGS, NODE_XZ, ROADS, AREAS, buildingNear } from './campusmap';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { box, canvas, merge, speckle, type Part } from './modelkit';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { groundHeight as gh } from './relief';
import { Bag, fanPalm, hash, tuft, vnoise, wallSolids } from './enkit';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { groundShade, weathering } from './shading';
import { asphaltTexture } from './textures';
import { medianGrass, pavers, rod, run, strip, wires, type V3 } from './upsa';
import { inOkKeep, okOwns } from './okplan';
import {
  CABINET, COMPOUND, E_HALF, HOOD, ISLANDS, JUNCTION, MASSES, MAST, MEDIAN, ROADSIDE, SCRUB, SIGNAL, SIGNALS, VERGE_W, W_HALF,
  N4_WIDE, eastInner, halfOf, inCompound, inHood, offEdge, pickOf, westInner, xEast, xWest, type Mass, type Pick,
} from './lbplan';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#f1efe9') };
const O: [number, number] = [1150, 1250];
const ST = 3.2;
type P2 = [number, number];

// ---------- the mapped roads near the stretch, on a grid (half widths by class; footways flagged) ----------
const SG = 20;
const segs: [number, number, number, number, number, number][] = [];
const grid = new Map<string, number[]>();
for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++) {
  const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
  if (Math.max(ax, bx) < 700 || Math.min(ax, bx) > 1500 || Math.max(az, bz) < 800 || Math.min(az, bz) > 1700) continue;
  const h = halfOf(r);
  const k = segs.length;
  segs.push([ax, az, bx, bz, h, r.cls]);
  for (let gx = Math.floor((Math.min(ax, bx) - 12) / SG); gx <= Math.floor((Math.max(ax, bx) + 12) / SG); gx++)
    for (let gz = Math.floor((Math.min(az, bz) - 12) / SG); gz <= Math.floor((Math.max(az, bz) + 12) / SG); gz++) {
      const key = `${gx},${gz}`;
      (grid.get(key) ?? grid.set(key, []).get(key)!).push(k);
    }
}
// (and the N4's carriageways widened inward to the narrow median, lbplan.ts N4_WIDE)
for (const [ax, az, bx, bz, h] of N4_WIDE) {
  const k = segs.length;
  segs.push([ax, az, bx, bz, h, 0]);
  for (let gx = Math.floor((Math.min(ax, bx) - 12) / SG); gx <= Math.floor((Math.max(ax, bx) + 12) / SG); gx++)
    for (let gz = Math.floor((Math.min(az, bz) - 12) / SG); gz <= Math.floor((Math.max(az, bz) + 12) / SG); gz++) {
      const key = `${gx},${gz}`;
      (grid.get(key) ?? grid.set(key, []).get(key)!).push(k);
    }
}
/** distance from (x, z) to the nearest road's edge (negative on it), within about 12 m; footways only with `paths` */
function clearance(x: number, z: number, paths = false, maxCls = 4) {
  let best = 12;
  for (const k of grid.get(`${Math.floor(x / SG)},${Math.floor(z / SG)}`) ?? []) {
    const [ax, az, bx, bz, h, cls] = segs[k];
    if ((cls === 4 && !paths) || cls > maxCls) continue;
    const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z) - h);
  }
  return best;
}
const clear = (x: number, z: number, m: number, paths = false) => clearance(x, z, paths) > m;

// ---------- facade textures: one storey high, one bay wide, tinted by the wall colour ----------
const facade = (draw: (g: CanvasRenderingContext2D) => void) => {
  const t = canvas(256, 256, (g) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 256); speckle(g, 0, 0, 256, 256, 1600, ['#efefef', '#f7f7f7', '#e6e6e6']); draw(g); });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return weathering(groundShade(new THREE.MeshStandardMaterial({ map: t, vertexColors: true, roughness: 0.9, side: THREE.DoubleSide }), 2.2, 0.3, 'wall'), 'wall', 16, 0.35);
};
/** a window with its aluminium frame and burglar bars */
const win = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = 'rgba(80,72,60,0.35)'; g.fillRect(x - 6, y - 6, w + 12, h + 14);
  g.fillStyle = '#c9ccce'; g.fillRect(x - 3, y - 3, w + 6, h + 6);
  const gl = g.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, '#5a6c7c'); gl.addColorStop(1, '#1f2932');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = '#2a2a2a'; for (let i = 1; i < 6; i++) g.fillRect(x + (w * i) / 6 - 1, y, 2, h);
  g.fillRect(x, y + h / 2 - 1, w, 2);
  g.fillStyle = '#d9d9d6'; g.fillRect(x - 8, y + h + 3, w + 16, 6);
};
let MATS: Record<'win' | 'ribbon' | 'shop' | 'door' | 'blank', THREE.MeshStandardMaterial> | null = null;
const mats = () => (MATS ??= {
  win: facade((g) => { g.fillStyle = '#d6d6d4'; g.fillRect(0, 0, 256, 8); win(g, 70, 70, 116, 104); }),
  // a dark window band across the whole bay (the cream-and-orange block, Pair 4)
  ribbon: facade((g) => { g.fillStyle = '#d6d6d4'; g.fillRect(0, 0, 256, 8); const gl = g.createLinearGradient(0, 70, 0, 180); gl.addColorStop(0, '#3d5d86'); gl.addColorStop(1, '#16253a'); g.fillStyle = gl; g.fillRect(0, 70, 256, 110); g.fillStyle = '#9aa3ab'; for (let x = 0; x < 256; x += 64) g.fillRect(x, 70, 4, 110); }),
  // a shop bay: the lintel, a roller shutter half up over the dark interior, the piers either side
  shop: facade((g) => {
    g.fillStyle = '#20232a'; g.fillRect(18, 52, 220, 204);
    g.fillStyle = '#b4b8bb'; g.fillRect(18, 52, 220, 96);
    g.fillStyle = '#8d9296'; for (let y = 56; y < 148; y += 7) g.fillRect(18, y, 220, 2);
    g.fillStyle = '#6f7478'; g.fillRect(18, 144, 220, 6);
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(40, 170, 80, 70);
  }),
  // the ground storey of a house or back wall: a door and a window
  door: facade((g) => { g.fillStyle = '#5a3d2a'; g.fillRect(32, 70, 64, 186); g.fillStyle = '#3e2a1d'; g.fillRect(36, 74, 56, 180); win(g, 140, 90, 90, 80); }),
  blank: facade(() => undefined),
});

// ---------- the colours of the place ----------
const WALLS = ['#efe3c4', '#e2cfa6', '#f1dc8a', '#e9c94e', '#a9c7dc', '#7fb0d6', '#bcd7a6', '#e6a98c', '#f3f2ec', '#d2cdc2', '#efd2b0', '#d9e4e8'];
const METAL = ['#8a5a3c', '#9aa0a3', '#c3c6c8', '#3d6ea8', '#a8443a', '#4f7d55', '#7c8286', '#6d4a34'];
const SIGNS = ['#c62f2f', '#1f5fae', '#e7c21f', '#2e8b4a', '#f2f2ee', '#e06a1c', '#7a2a8c', '#1a1a1a'];
const ACCENTS = ['#e07a2c', '#3a78b8', '#b9302b', '#2e8b4a'];

// ---------- one building of the fabric ----------
interface Plan { storeys: number; wall: string; roof: 'flat' | 'metal'; roofColor: string; accent?: string; shops: boolean; tank: boolean; gallery: boolean; upper: 'win' | 'ribbon' | 'blank'; bay: number; gable?: boolean }
/** walls as batches by facade material: positions, uvs, colours */
class Walls {
  by = new Map<string, { pos: number[]; uv: number[]; col: number[] }>();
  quad(m: string, a: V3, b: V3, c: V3, d: V3, u0: number, u1: number, v0: number, v1: number, col: THREE.Color) {
    let e = this.by.get(m);
    if (!e) this.by.set(m, (e = { pos: [], uv: [], col: [] }));
    const P = [a, b, c, a, c, d], U = [[u0, v0], [u1, v0], [u1, v1], [u0, v0], [u1, v1], [u0, v1]];
    for (let i = 0; i < 6; i++) { e.pos.push(...P[i]); e.uv.push(...U[i]); e.col.push(col.r, col.g, col.b); }
  }
  meshes() {
    const out: THREE.Mesh[] = [];
    const M = mats() as Record<string, THREE.MeshStandardMaterial>;
    for (const [m, e] of this.by) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(e.pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(e.uv, 2));
      g.setAttribute('color', new THREE.Float32BufferAttribute(e.col, 3));
      g.computeVertexNormals();
      const me = new THREE.Mesh(g, M[m]); me.castShadow = true; me.receiveShadow = true;
      out.push(me);
    }
    return out;
  }
}
const lin = (hex: string) => new THREE.Color(hex);
const area = (r: P2[]) => { let a = 0; for (let i = 0; i < r.length; i++) { const [x0, z0] = r[i], [x1, z1] = r[(i + 1) % r.length]; a += x0 * z1 - x1 * z0; } return a / 2; };
const inside = (r: P2[], x: number, z: number) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, zi] = r[i], [xj, zj] = r[j]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } return c; };
/** the footprint's box turned to its longest edge: centre, axis, half extents, and how much of the box it fills */
function oriented(r: P2[]) {
  let best = 0, ux = 1, uz = 0;
  for (let i = 0; i < r.length; i++) { const [ax, az] = r[i], [bx, bz] = r[(i + 1) % r.length], l = Math.hypot(bx - ax, bz - az); if (l > best) { best = l; ux = (bx - ax) / l; uz = (bz - az) / l; } }
  let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
  for (const [x, z] of r) { const a = x * ux + z * uz, b = -x * uz + z * ux; a0 = Math.min(a0, a); a1 = Math.max(a1, a); b0 = Math.min(b0, b); b1 = Math.max(b1, b); }
  const corner = (a: number, b: number): P2 => [a * ux - b * uz, a * uz + b * ux];
  return { ux, uz, a0, a1, b0, b1, corner, fill: Math.abs(area(r)) / ((a1 - a0) * (b1 - b0)) };
}

/** the faces of a footprint toward a road: an edge whose outside, a few metres out, is near a road of class <= 3 */
function frontEdge(a: P2, b: P2, n: P2) {
  const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
  for (const d of [4, 8, 13]) if (clearance(mx + n[0] * d, mz + n[1] * d, false, 3) < 1.5) return true;
  return false;
}

function building(W: Walls, c: Part[], ring: P2[], p: Plan, seed: number, opts: { solid?: boolean; shopFace?: P2; display?: boolean; darkFace?: boolean; orange?: boolean } = {}) {
  if (area(ring) < 0) ring = [...ring].reverse();
  const n = ring.length, H = p.storeys * ST, wallC = lin(p.wall);
  const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
  const fronts: { a: P2; b: P2; n: P2; len: number }[] = [];
  for (let i = 0; i < n; i++) {
    const a = ring[i], b = ring[(i + 1) % n], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 0.3) continue;
    // outward normal (the ring is counter-clockwise in x-z with z south: the outside is to the left of a->b)
    let nn: P2 = [(b[1] - a[1]) / len, -(b[0] - a[0]) / len];
    const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
    if (inside(ring, mx + nn[0] * 0.3, mz + nn[1] * 0.3)) nn = [-nn[0], -nn[1]];
    const front = p.shops && len >= 2.6 && (opts.shopFace ? nn[0] * opts.shopFace[0] + nn[1] * opts.shopFace[1] > 0.7 : frontEdge(a, b, nn));
    if (front) fronts.push({ a, b, n: nn, len });
    for (let s = 0; s < p.storeys; s++) {
      const y0 = s * ST, y1 = y0 + ST;
      const m = len < 1.6 ? 'blank' : s === 0 ? (front ? 'shop' : (hash(seed, i) < 0.5 ? 'door' : 'blank')) : p.upper;
      const bay = m === 'shop' ? 3 : p.bay, nb = Math.max(1, Math.round(len / bay));
      W.quad(m, [X(a[0]), y0, Z(a[1])], [X(b[0]), y0, Z(b[1])], [X(b[0]), y1, Z(b[1])], [X(a[0]), y1, Z(a[1])], 0, nb, 0, 1, wallC);
    }
    // the plinth, and the coloured lower wall where the photographs show one (the corner block's orange)
    const lower = opts.orange && p.accent ? p.accent : '#8a8178';
    c.push([run(X(a[0]), Z(a[1]), X(b[0]), Z(b[1]), 0, opts.orange ? 1.1 : 0.35, 0.06, -0.03), lower]);
    if (opts.solid) wallSolids(a[0], a[1], b[0], b[1], 0.35);
  }
  // ---- the roof ----
  const ob = oriented(ring);
  if (p.roof === 'flat') {
    // the slab behind a parapet, its cap; a black water tank on many
    const sh = new THREE.Shape(ring.map(([x, z]) => new THREE.Vector2(X(x), -Z(z))));
    c.push([new THREE.ShapeGeometry(sh).rotateX(-Math.PI / 2).translate(0, H + 0.05, 0), '#a9a59c']);
    for (let i = 0; i < n; i++) {
      const a = ring[i], b = ring[(i + 1) % n];
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.3) continue;
      W.quad('blank', [X(a[0]), H, Z(a[1])], [X(b[0]), H, Z(b[1])], [X(b[0]), H + 0.9, Z(b[1])], [X(a[0]), H + 0.9, Z(a[1])], 0, 1, 0, 0.3, wallC);
      c.push([run(X(a[0]), Z(a[1]), X(b[0]), Z(b[1]), H + 0.9, H + 1.0, 0.28, 0.14), '#d6d3cc']);
    }
    if (p.tank) {
      const [tx, tz] = ob.corner((ob.a0 * 0.3 + ob.a1 * 0.7), (ob.b0 + ob.b1) / 2);
      if (inside(ring, tx, tz)) c.push([new THREE.CylinderGeometry(0.7, 0.75, 1.5, 12).translate(X(tx), H + 0.8, Z(tz)), hash(seed, 3) < 0.7 ? '#1b1c1f' : '#2f6fb3']);
    }
  } else if (ob.fill > 0.84) {
    // a low metal roof over the footprint's box: hipped, or a gable to the road (the green building, Pair 16)
    const o = 0.5, pitch = 0.2, a0 = ob.a0 - o, a1 = ob.a1 + o, b0 = ob.b0 - o, b1 = ob.b1 + o;
    const half = Math.min(a1 - a0, b1 - b0) / 2, ridgeY = H + half * pitch, Y = H - 0.05;
    const v = (a: number, b: number, y: number): V3 => { const [x, z] = ob.corner(a, b); return [X(x), y, Z(z)]; };
    const metal = p.roofColor;
    const tri = (A: V3, B: V3, C: V3) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([...A, ...B, ...C], 3)); g.computeVertexNormals(); c.push([g, metal]); const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute([...A, ...C, ...B], 3)); g2.computeVertexNormals(); c.push([g2, metal]); };
    if (p.gable) {
      const bm = (b0 + b1) / 2, ry = H + ((b1 - b0) / 2) * 0.45;
      tri(v(a0, b0, Y), v(a1, b0, Y), v(a1, bm, ry)); tri(v(a0, b0, Y), v(a1, bm, ry), v(a0, bm, ry));
      tri(v(a0, b1, Y), v(a1, b1, Y), v(a1, bm, ry)); tri(v(a0, b1, Y), v(a1, bm, ry), v(a0, bm, ry));
      // the gable ends, walled in the wall colour
      for (const a of [ob.a0, ob.a1]) tri(v(a, ob.b0, H), v(a, ob.b1, H), v(a, bm, ry - 0.1));
      W.quad('blank', v(ob.a0, ob.b0, H), v(ob.a0, ob.b1, H), v(ob.a0, bm, ry - 0.1), v(ob.a0, bm, ry - 0.1), 0, 1, 0, 1, wallC);
      W.quad('blank', v(ob.a1, ob.b0, H), v(ob.a1, ob.b1, H), v(ob.a1, bm, ry - 0.1), v(ob.a1, bm, ry - 0.1), 0, 1, 0, 1, wallC);
    } else if (a1 - a0 >= b1 - b0) {
      const m0 = a0 + half, m1 = a1 - half, bm = (b0 + b1) / 2;
      tri(v(a0, b0, Y), v(a1, b0, Y), v(m1, bm, ridgeY)); tri(v(a0, b0, Y), v(m1, bm, ridgeY), v(m0, bm, ridgeY));
      tri(v(a0, b1, Y), v(a1, b1, Y), v(m1, bm, ridgeY)); tri(v(a0, b1, Y), v(m1, bm, ridgeY), v(m0, bm, ridgeY));
      tri(v(a0, b0, Y), v(a0, b1, Y), v(m0, bm, ridgeY)); tri(v(a1, b0, Y), v(a1, b1, Y), v(m1, bm, ridgeY));
    } else {
      const m0 = b0 + half, m1 = b1 - half, am = (a0 + a1) / 2;
      tri(v(a0, b0, Y), v(a0, b1, Y), v(am, m1, ridgeY)); tri(v(a0, b0, Y), v(am, m1, ridgeY), v(am, m0, ridgeY));
      tri(v(a1, b0, Y), v(a1, b1, Y), v(am, m1, ridgeY)); tri(v(a1, b0, Y), v(am, m1, ridgeY), v(am, m0, ridgeY));
      tri(v(a0, b0, Y), v(a1, b0, Y), v(am, m0, ridgeY)); tri(v(a0, b1, Y), v(a1, b1, Y), v(am, m1, ridgeY));
    }
  } else {
    // an irregular outline under metal: a nearly flat sheet roof with a narrow upstand
    const sh = new THREE.Shape(ring.map(([x, z]) => new THREE.Vector2(X(x), -Z(z))));
    c.push([new THREE.ShapeGeometry(sh).rotateX(-Math.PI / 2).translate(0, H + 0.15, 0), p.roofColor]);
    for (let i = 0; i < n; i++) { const a = ring[i], b = ring[(i + 1) % n]; if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 0.3) W.quad('blank', [X(a[0]), H, Z(a[1])], [X(b[0]), H, Z(b[1])], [X(b[0]), H + 0.3, Z(b[1])], [X(a[0]), H + 0.3, Z(a[1])], 0, 1, 0, 0.1, wallC); }
  }
  // ---- the shop faces: sign bands in a row of colours, an awning on some, the gallery rail on some upper floors ----
  for (const [fi, f] of fronts.entries()) {
    const nb = Math.max(1, Math.round(f.len / 3)), ux = (f.b[0] - f.a[0]) / f.len, uz = (f.b[1] - f.a[1]) / f.len;
    let t = 0;
    while (t < nb) {
      const w = Math.min(nb - t, 1 + Math.floor(hash(seed + fi, t) * 3)), s0 = (t / nb) * f.len + 0.15, s1 = ((t + w) / nb) * f.len - 0.15;
      const ax = f.a[0] + ux * s0 + f.n[0] * 0.12, az = f.a[1] + uz * s0 + f.n[1] * 0.12, bx = f.a[0] + ux * s1 + f.n[0] * 0.12, bz = f.a[1] + uz * s1 + f.n[1] * 0.12;
      const col = SIGNS[(hash(seed + t, fi + 7) * SIGNS.length) | 0];
      c.push([run(X(ax), Z(az), X(bx), Z(bz), ST - 0.75, ST - 0.12, 0.12), col]);
      // a pale stripe across it (the lettering itself is not copied)
      c.push([run(X(ax), Z(az), X(bx), Z(bz), ST - 0.5, ST - 0.38, 0.14), col === '#f2f2ee' ? '#c62f2f' : '#f4f1e8']);
      t += w;
    }
    if (p.storeys === 1 && hash(seed, fi + 40) < 0.45 && clear((f.a[0] + f.b[0]) / 2 + f.n[0] * 2, (f.a[1] + f.b[1]) / 2 + f.n[1] * 2, 0.6)) {
      // a metal awning on two thin posts
      const d = 1.6, A = [f.a[0] + f.n[0] * d, f.a[1] + f.n[1] * d], B = [f.b[0] + f.n[0] * d, f.b[1] + f.n[1] * d];
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([X(f.a[0]), ST - 0.8, Z(f.a[1]), X(f.b[0]), ST - 0.8, Z(f.b[1]), X(B[0]), ST - 1.15, Z(B[1]), X(f.a[0]), ST - 0.8, Z(f.a[1]), X(B[0]), ST - 1.15, Z(B[1]), X(A[0]), ST - 1.15, Z(A[1])], 3));
      g.computeVertexNormals();
      c.push([g, METAL[(hash(seed, 9) * METAL.length) | 0]]);
      for (const q of [A, B]) { c.push([box(X(q[0]) - 0.04, X(q[0]) + 0.04, 0, ST - 1.15, Z(q[1]) - 0.04, Z(q[1]) + 0.04), '#5f6366']); SOLIDS.add(q[0], q[1], 0.12); }
    }
    if (p.gallery) for (let s = 1; s < p.storeys; s++) {
      const y = s * ST;
      c.push([run(X(f.a[0] + f.n[0] * 1.2), Z(f.a[1] + f.n[1] * 1.2), X(f.b[0] + f.n[0] * 1.2), Z(f.b[1] + f.n[1] * 1.2), y - 0.15, y, 1.3, 0), '#cfcbc2']);
      c.push([run(X(f.a[0] + f.n[0] * 1.85), Z(f.a[1] + f.n[1] * 1.85), X(f.b[0] + f.n[0] * 1.85), Z(f.b[1] + f.n[1] * 1.85), y, y + 1.0, 0.06), '#2d3033']);
    }
    if (opts.display && fi === 0) {
      // the dark display face over the yellow frontage (Pair 17)
      const m = 0.5, ax = f.a[0] + ux * f.len * 0.25 + f.n[0] * 0.18, az = f.a[1] + uz * f.len * 0.25 + f.n[1] * 0.18, bx = f.a[0] + ux * f.len * (0.25 + m) + f.n[0] * 0.18, bz = f.a[1] + uz * f.len * (0.25 + m) + f.n[1] * 0.18;
      c.push([run(X(ax), Z(az), X(bx), Z(bz), ST + 0.2, ST + 2.6, 0.2), '#16181b'], [run(X(ax), Z(az), X(bx), Z(bz), ST + 0.1, ST + 0.2, 0.3), '#5d6166']);
    }
  }
  // the tall dark grey face (Pairs 1, 2): on the face toward the N4, at its north end, rising above the parapet
  if (opts.darkFace) {
    const w = ring.reduce((m, q) => (q[0] < m[0] ? q : m), ring[0]);
    // (it wraps the north-west corner, standing proud of both faces)
    const zN = Math.min(...ring.map((q) => q[1])), x0 = w[0] - 0.3;
    c.push([box(X(x0), X(x0 + 7.5), 0.3, H + 1.8, Z(zN - 0.3), Z(zN + 7.0)), '#4b4f55']);
    c.push([box(X(x0) - 0.05, X(x0 + 0.1), 2.0, 2.6, Z(zN + 1.5), Z(zN + 5.5)), '#2b2f34']);
  }
}

/** a plan for a mapped outline of the fabric, from its size, its frontage and a hash of where it stands */
function planFor(ring: P2[], cx: number, cz: number, h?: number): Plan {
  const A = Math.abs(area(ring)), r = hash(cx * 0.37, cz * 0.53), r2 = hash(cz * 0.71, cx * 0.19), r3 = hash(cx + cz, 5.5);
  const front = ring.some((a, i) => { const b = ring[(i + 1) % ring.length], mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2; return clearance(mx, mz, false, 2) < 12; });
  let storeys = h ? Math.max(1, Math.round(h / 3.3)) : A < 35 ? 1 : A < 110 ? (r < (front ? 0.45 : 0.25) ? 2 : 1) : A < 300 ? (r < 0.15 ? 1 : r < (front ? 0.75 : 0.85) ? 2 : 3) : r < 0.45 ? 2 : r < 0.85 ? 3 : 4;
  storeys = Math.min(storeys, 5);
  const roof: Plan['roof'] = storeys >= 2 ? (r2 < 0.72 ? 'flat' : 'metal') : r2 < 0.25 && A > 35 ? 'flat' : 'metal';
  return {
    storeys, roof, wall: WALLS[(r3 * WALLS.length) | 0], roofColor: METAL[(r2 * 97 % 1 * METAL.length) | 0],
    accent: r3 < 0.25 ? ACCENTS[(r * ACCENTS.length) | 0] : undefined,
    shops: front || A < 60, tank: roof === 'flat' && r < 0.6, gallery: storeys >= 2 && front && r2 > 0.6, upper: 'win', bay: 3.2,
  };
}

/** a point inside a footprint (its centroid when that is inside), for the generic builder to skip it */
function inner(ring: P2[]): P2 {
  const cx = ring.reduce((s, q) => s + q[0], 0) / ring.length, cz = ring.reduce((s, q) => s + q[1], 0) / ring.length;
  if (inside(ring, cx, cz)) return [cx, cz];
  for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 2) % ring.length], m: P2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; if (inside(ring, m[0], m[1])) return m; }
  return ring[0];
}

// the outlines this site builds: the neighbourhood's and the compound's
// (the outlines the Okponglo brief rebuilds, okponglo.ts, are left to it)
const RINGS = BUILDINGS.filter((b) => { const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2; return (inHood(cx, cz) || inCompound(cx, cz)) && !okOwns(b); })
  .map((b) => { const r: P2[] = []; for (let i = 0; i < b.pts.length; i += 2) r.push([b.pts[i], b.pts[i + 1]]); return { b, ring: r }; });
const MASS_RING = (m: Mass): P2[] => [[m.r[0], m.r[2]], [m.r[1], m.r[2]], [m.r[1], m.r[3]], [m.r[0], m.r[3]]];
const FACE: Record<Mass['shopFace'], P2> = { z0: [0, -1], z1: [0, 1], x0: [-1, 0], x1: [1, 0] };

// ======================================================================================================
// the neighbourhood
// ======================================================================================================
const hood: Spec = {
  name: 'La Bawaleshie neighbourhood', axis: [1, 0], origin: O, storey: ST, style: PLAIN, roofColor: '#9aa0a3', fascia: '#6d5a4a', pitch: 0.2,
  replaces: RINGS.map(({ ring }) => inner(ring)),
  blocks: [],
  onGround: true,
  // (the frontage kept clear of generated trees and lamps: KEEP below)
  keep: [],
  extras: (k: Kit) => {
    const W = new Walls(), c: Part[] = [], b = new Bag(O);
    // ---- the mapped outlines ----
    for (const { b: bd, ring } of RINGS) {
      const cx = (bd.minX + bd.maxX) / 2, cz = (bd.minZ + bd.maxZ) / 2, pick = pickOf(bd);
      if (inCompound(cx, cz)) {
        // the compound beyond the scrub: plain grey and white sheds under blue and grey sheet roofs, no shops
        const r = hash(cx, cz);
        // (inside the J.J. Rawlings corridor brief's yard, jjplan.ts: low weathered grey service sheds, one storey; the
        // red-roof building of its picture 13 callout 2)
        const yard = inYard(cx, cz), red = yard && cx > RED_SHED[0] && cx < RED_SHED[1] && cz > RED_SHED[2] && cz < RED_SHED[3];
        building(W, c, ring, { storeys: yard ? 1 : Math.abs(area(ring)) > 250 && r < 0.4 ? 2 : 1, wall: yard ? (r < 0.5 ? '#b9b8b2' : '#c9c8c2') : r < 0.5 ? '#e4e3de' : '#c9c8c2', roof: 'metal', roofColor: red ? '#a8432f' : r < 0.55 ? '#3d6ea8' : '#9aa0a3', shops: false, tank: false, gallery: false, upper: 'win', bay: 4 }, cx * 3 + cz);
        continue;
      }
      if (pick) { buildPick(W, c, ring, pick, cx * 3 + cz); continue; }
      building(W, c, ring, planFor(ring, cx, cz, bd.height), cx * 3 + cz);
    }
    // ---- the frontages the map lacks ----
    for (const [i, m] of MASSES.entries()) {
      building(W, c, MASS_RING(m), { storeys: m.storeys, wall: m.wall, roof: m.roof, roofColor: m.roofColor ?? '#9aa0a3', accent: m.accent, shops: true, tank: m.roof === 'flat', gallery: m.storeys > 1 && i % 2 === 1, upper: 'win', bay: 3.2 }, 500 + i * 17, { solid: true, shopFace: FACE[m.shopFace], display: m.display, orange: !!m.accent && m.accent === '#e07a2c' });
    }
    for (const me of W.meshes()) k.meshes.push(me);

    // ---- the ground: compacted earth and dust, worn grass in patches, paved forecourts along the frontage ----
    k.meshes.push(new THREE.Mesh(drapeAt(O, 990, HOOD.x1, HOOD.z0, HOOD.z1, 2.5, 0.03, (x, z) => {
      if (!inHood(x, z) || clearance(x, z) < 0.3) return null;
      const n = vnoise(x * 0.06, z * 0.06), m = vnoise(x * 0.9, z * 0.9), f = clearance(x, z, false, 2);
      if (f < 9 && n > 0.3) return [0.58 + m * 0.05, 0.55 + m * 0.05, 0.5];
      return n > 0.62 ? [0.42 + m * 0.06, 0.47 + m * 0.05, 0.27] : n > 0.4 ? [0.6 + m * 0.06, 0.43 + m * 0.05, 0.3] : [0.56 + m * 0.05, 0.5 + m * 0.04, 0.42];
    }), groundCover()));
    // ---- mature trees and palms in the gaps; tall narrow trees by the 15-16 frontage (Pair 16) ----
    // (and the frontages and compounds the Okponglo brief models and plants itself)
    const taken = (x: number, z: number, r: number) => !!buildingNear(x, z, r) || MASSES.some((m) => x > m.r[0] - r && x < m.r[1] + r && z > m.r[2] - r && z < m.r[3] + r) || inOkKeep(x, z, r);
    let trees = 0;
    for (let i = 0; i < 900 && trees < 95; i++) {
      const x = 1000 + hash(i, 1.7) * (HOOD.x1 - 1000), z = HOOD.z0 + hash(2.3, i) * (HOOD.z1 - HOOD.z0);
      if (!inHood(x, z) || !clear(x, z, 3) || taken(x, z, 4)) continue;
      if (hash(i, 9) < 0.14) fanPalm(b, x, z, 7 + hash(i, 4) * 5, i);
      else broadleaf(k, b.leaf, x, z, { h: 7 + hash(i, 5) * 5, spread: 8 + hash(i, 6) * 6, seed: i * 3.1, origin: O });
      trees++;
    }
    for (const [x, z, h] of [[1080, 1527, 15], [1084, 1547, 13], [1118, 1540, 14]] as [number, number, number][]) {
      if (taken(x, z, 1.5) || !clear(x, z, 1.5)) continue;
      const X = x - O[0], Z = z - O[1];
      c.push([new THREE.CylinderGeometry(0.18, 0.3, h * 0.55, 8).translate(X, h * 0.27, Z), '#5a4a3b']);
      for (let j = 0; j < 5; j++) b.leaf.push([new THREE.ConeGeometry(2.4 - j * 0.38, 3.2, 9).translate(X, h * 0.35 + j * 2.0, Z), j % 2 ? '#2f5a2e' : '#36652f']);
      SOLIDS.add(x, z, 0.35);
    }

    // ---- poles and wires along La Bawaleshie Road and the N4 frontage; the transformer by the corner (Pair 19) ----
    const pole = (x: number, z: number, concreteP: boolean): V3[] => {
      const X = x - O[0], Z = z - O[1];
      c.push([new THREE.CylinderGeometry(concreteP ? 0.12 : 0.11, concreteP ? 0.17 : 0.15, 9.5, 7).translate(X, 4.75, Z), concreteP ? '#a9a69f' : '#6b5844']);
      c.push([box(X - 1.0, X + 1.0, 8.8, 8.92, Z - 0.06, Z + 0.06), '#4f4234']);
      SOLIDS.add(x, z, 0.2);
      return [[X - 0.85, 9.1, Z], [X + 0.85, 9.1, Z], [X, 7.6, Z]];
    };
    const span = (ps: V3[][]) => { const out: [V3, V3][] = []; for (let i = 0; i < ps.length - 1; i++) for (let j = 0; j < 3; j++) out.push([ps[i][j], ps[i + 1][j]]); return out; };
    // La Bawaleshie Road's line, west to east
    const lb = ROADS.filter((r) => r.name === 'La Bawaleshi Road' && r.cls === 1).flatMap((r) => r.nodes.map((nd) => [NODE_XZ[nd * 2], NODE_XZ[nd * 2 + 1]] as P2)).filter(([x]) => x > 1022 && x < HOOD.x1).sort((a, bb) => a[0] - bb[0]);
    const zLb = (x: number) => { for (let i = 0; i < lb.length - 1; i++) if (x >= lb[i][0] && x <= lb[i + 1][0] && lb[i + 1][0] > lb[i][0]) return lb[i][1] + ((lb[i + 1][1] - lb[i][1]) * (x - lb[i][0])) / (lb[i + 1][0] - lb[i][0]); return NaN; };
    for (const side of [-1, 1]) {
      const ps: V3[][] = [];
      for (let x = 1030 + (side > 0 ? 17 : 0); x < HOOD.x1 - 5; x += 34) {
        const z = zLb(x) + side * 6.2;
        if (Number.isNaN(z) || !clear(x, z, 0.4) || taken(x, z, 0.8)) continue;
        ps.push(pole(x, z, side > 0));
      }
      k.meshes.push(wires(span(ps), 0.6));
    }
    {
      const ps: V3[][] = [];
      for (let z = 975; z < 1640; z += 38) {
        if (z > JUNCTION.z0 - 6 && z < JUNCTION.z1 + 6) continue;
        const [x, zz] = offEdge(z, 'E', 2.4);
        if (Number.isNaN(x) || !clear(x, zz, 0.4) || taken(x, zz, 0.8)) continue;
        ps.push(pole(x, zz, true));
      }
      k.meshes.push(wires(span(ps), 0.7));
    }
    {
      // the pole-mounted transformer: two concrete poles, the drum on its platform, the diagonal stay, the cabinet
      const [tx, tz] = [1051.5, 1241], X = tx - O[0], Z = tz - O[1];
      for (const dz of [-1.1, 1.1]) { c.push([new THREE.CylinderGeometry(0.13, 0.18, 10, 7).translate(X, 5, Z + dz), '#a9a69f']); SOLIDS.add(tx, tz + dz, 0.22); }
      c.push([box(X - 0.5, X + 0.5, 4.3, 4.4, Z - 1.4, Z + 1.4), '#5d6166'], [new THREE.CylinderGeometry(0.45, 0.45, 1.2, 12).translate(X, 5.0, Z), '#7d8488']);
      c.push([rod([X, 8.5, Z + 1.1], [X + 3.2, 0.05, Z + 2.6], 0.03), '#2d2d2d']);
      c.push([box(X + 0.8, X + 1.6, 0, 1.4, Z - 0.6, Z + 0.6), '#c9cbc6']);
      SOLIDS.add(tx + 1.2, tz, 0.5);
    }
    // the lattice communications mast behind the beige block (Pairs 1, 2)
    lattice(c, MAST[0] - O[0], MAST[1] - O[1], MAST[2], true);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) SOLIDS.add(MAST[0] + sx * 1.2, MAST[1] + sz * 1.2, 0.3);

    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.finish(k, 0.3);
  },
};

/** a building the photographs single out */
function buildPick(W: Walls, c: Part[], ring: P2[], p: Pick, seed: number) {
  const plan: Plan = { storeys: p.storeys, wall: p.wall, roof: p.roof, roofColor: p.roofColor ?? '#9aa0a3', accent: p.accent, shops: true, tank: p.roof === 'flat', gallery: false, upper: 'win', bay: 3.2 };
  if (p.name === 'gra') Object.assign(plan, { shops: false, bay: 5.5, tank: false });
  if (p.name === 'creamorange') Object.assign(plan, { upper: 'ribbon', bay: 4 });
  if (p.name === 'beigeback') Object.assign(plan, { shops: false });
  if (p.name === 'greengable') Object.assign(plan, { gable: true });
  if (p.name === 'diamed') Object.assign(plan, { shops: false });
  building(W, c, ring, plan, seed, { darkFace: p.name === 'gra', orange: p.name.startsWith('corner') });
  const X = (x: number) => x - O[0], Z = (z: number) => z - O[1], H = p.storeys * ST;
  if (p.name === 'creamorange') {
    // orange vertical accents at the corners and up the stair in the middle of the road face (Pair 4)
    const ob = oriented(ring);
    for (const [a, b2] of [[ob.a0, ob.b0], [ob.a1, ob.b0], [ob.a1, ob.b1], [ob.a0, ob.b1]] as P2[]) {
      const [x, z] = ob.corner(a, b2);
      c.push([box(X(x) - 0.55, X(x) + 0.55, 0, H + 1.4, Z(z) - 0.55, Z(z) + 0.55), p.accent!]);
    }
    const xw = Math.min(...ring.map((q) => q[0])), zm = (Math.min(...ring.map((q) => q[1])) + Math.max(...ring.map((q) => q[1]))) / 2;
    c.push([box(X(xw) - 0.4, X(xw) + 0.2, 0, H + 1.6, Z(zm) - 1.6, Z(zm) + 1.6), p.accent!]);
  }
  if (p.name === 'diamed' || p.name === 'redtrim') {
    for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; c.push([run(X(a[0]), Z(a[1]), X(b[0]), Z(b[1]), H - 0.5, H - 0.2, 0.08, -0.04), p.accent!]); }
  }
}

/** a lattice mast: three tapering legs braced in bays, antenna panels and a dish near the top (a communications mast),
 *  or bare (the slender verge mast) */
export function lattice(c: Part[], px: number, pz: number, h: number, antennas: boolean) {
  const steel = '#9aa0a4', legs = 3, r = (y: number) => 1.6 - (1.25 * y) / h;
  const P = (y: number, i: number): V3 => [px + r(y) * Math.cos((i / legs) * Math.PI * 2), y, pz + r(y) * Math.sin((i / legs) * Math.PI * 2)];
  const bays = Math.round(h / 3);
  for (let j = 0; j < bays; j++) {
    const y0 = (h * j) / bays, y1 = (h * (j + 1)) / bays;
    for (let i = 0; i < legs; i++) {
      c.push([rod(P(y0, i), P(y1, i), 0.12), steel], [rod(P(y1, i), P(y1, (i + 1) % legs), 0.05), steel], [rod(P(y0, i), P(y1, (i + 1) % legs), 0.04), steel]);
    }
  }
  if (antennas) {
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, x = px + Math.cos(a) * 0.9, z = pz + Math.sin(a) * 0.9; c.push([box(x - 0.15, x + 0.15, h - 4, h - 1.6, z - 0.15, z + 0.15), '#e8e8e4']); }
    c.push([new THREE.CylinderGeometry(0.6, 0.6, 0.25, 14).rotateZ(Math.PI / 2).translate(px + 0.9, h - 8, pz), '#ececea']);
  }
  c.push([new THREE.CylinderGeometry(0.03, 0.03, 3, 5).translate(px, h + 1.5, pz), steel]);
}

// ======================================================================================================
// the N4 corridor: the median, the scrub, the stadium-side verge, the junction, the roadside structures
// ======================================================================================================
const CO: [number, number] = [985, 1250];
const corridor: Spec = {
  name: 'Legon Road by the stadium', axis: [1, 0], origin: CO, storey: 3, style: PLAIN, roofColor: '#9aa0a3', fascia: '#6d5a4a', pitch: 0.2,
  blocks: [],
  onGround: true,
  keep: [],
  extras: (k: Kit) => {
    const b = new Bag(CO), c: Part[] = [], edge: Part[] = [], A = (x: number, z: number): P2 => [x - CO[0], z - CO[1]];

    // ---------- the median: kerbed patchy grass and red earth ----------
    {
      const runs: [number, number, number][][] = [];
      let cur: [number, number, number][] = [];
      for (let z = MEDIAN.z0; z <= MEDIAN.z1; z += 1.5) {
        const a = westInner(z) + 0.05, o = eastInner(z) - 0.05;
        const ok = !(z > MEDIAN.gap[0] && z < MEDIAN.gap[1]) && !Number.isNaN(a) && !Number.isNaN(o) && o - a > 1.2 && clearance((a + o) / 2, z) > -0.2;
        if (!ok) { if (cur.length > 1) runs.push(cur); cur = []; continue; }
        cur.push([z, a, o]);
      }
      if (cur.length > 1) runs.push(cur);
      for (const r of runs) strip(k, r.map(([z, a]) => A(a, z)), r.map(([z, , o]) => A(o, z)), 0.16, medianGrass(), edge, '#cfcbc2', [0.2, 0.2]);
      // (its planting: compact trees, shrubs and the open stretch's boards, okponglo.ts, the Okponglo brief's Pairs 1, 2,
      // 4, 13, 14)
    }

    // ---------- the scrub west of the N4 north of the junction (Pair 3) ----------
    {
      const kerb = (z: number) => xWest(z) - W_HALF;
      for (let z = SCRUB.z0; z < SCRUB.z1; z += 2) {
        const [ax, az] = A(kerb(z), z), [bx, bz] = A(kerb(z + 2), z + 2);
        if (Number.isNaN(ax) || Number.isNaN(bx)) continue;
        edge.push([run(ax, az, bx, bz, 0, 0.15, 0.18, 0.09), '#cfcbc2']);
      }
      const pond = AREAS.filter((a) => a.kind === 'water');
      const inPond = (x: number, z: number) => pond.some((a) => { let ins = false; const p = a.pts, n = p.length / 2; for (let i = 0, j = n - 1; i < n; j = i++) { const xi = p[i * 2], zi = p[i * 2 + 1], xj = p[j * 2], zj = p[j * 2 + 1]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) ins = !ins; } return ins; });
      const off = (x: number, z: number) => kerb(z) - x;
      k.meshes.push(new THREE.Mesh(drapeAt(CO, 860, 985, SCRUB.z0, SCRUB.z1, 1.6, 0.03, (x, z) => {
        const d = off(x, z);
        if (Number.isNaN(d) || d < 0.2 || d > SCRUB.depth + 6 || inPond(x, z) || clearance(x, z) < 0.2 || behindYardFence(x, z)) return null;
        const m = vnoise(x * 1.1, z * 1.1);
        if (d > SCRUB.path[0] && d < SCRUB.path[1] + (vnoise(z * 0.2, 1) - 0.5)) return [0.62 + m * 0.05, 0.42 + m * 0.04, 0.29];
        return d < SCRUB.path[0] ? [0.5 + m * 0.05, 0.52, 0.32] : [0.33 + m * 0.07, 0.36 + m * 0.06, 0.2];
      }), groundCover()));
      // (its planting over the raised bank behind the stone face: okponglo.ts, the Okponglo brief's Pair 3)
      void inPond;
    }

    // ---------- the stadium-side verge (Pairs 8, 14): the red brick path, rough ground, the steel fence ----------
    {
      const kerb = (z: number) => xWest(z) - W_HALF;
      const brick = pavers('goil');
      const rows: [number, number, number][] = [];
      for (let z = VERGE_W.z0; z <= VERGE_W.z1; z += 2) { const kz = kerb(z); if (!Number.isNaN(kz) && clear(kz - VERGE_W.path[1], z, 0.3)) rows.push([z, kz - VERGE_W.path[0], kz - VERGE_W.path[1]]); else if (rows.length) break; }
      if (rows.length > 1) strip(k, rows.map(([z, a]) => A(a, z)), rows.map(([z, , o]) => A(o, z)), 0.06, brick, edge, '#9c8a76', null);
      for (let z = VERGE_W.z0; z < VERGE_W.z1; z += 2) {
        const [ax, az] = A(kerb(z), z), [bx, bz] = A(kerb(z + 2), z + 2);
        if (!Number.isNaN(ax) && !Number.isNaN(bx)) edge.push([run(ax, az, bx, bz, 0, 0.15, 0.18, 0.09), '#cfcbc2']);
      }
      k.meshes.push(new THREE.Mesh(drapeAt(CO, 935, 1060, VERGE_W.z0, VERGE_W.z1, 1.6, 0.03, (x, z) => {
        const d = kerb(z) - x;
        if (Number.isNaN(d) || d < VERGE_W.path[1] + 0.1 || clearance(x, z) < 0.3 || clearance(x, z, true) < 0.1) return null;
        const m = vnoise(x * 1.2, z * 1.2), n = vnoise(x * 0.15, z * 0.15);
        return n > 0.6 ? [0.52 + m * 0.05, 0.42 + m * 0.04, 0.3] : n > 0.45 ? [0.46 + m * 0.05, 0.47 + m * 0.04, 0.3] : [0.4 + m * 0.06, 0.48 + m * 0.05, 0.26];
      }), groundCover()));
      for (let i = 0; i < 900; i++) {
        const z = VERGE_W.z0 + hash(i, 3.3) * (VERGE_W.z1 - VERGE_W.z0), x = kerb(z) - VERGE_W.path[1] - 0.8 - hash(4.4, i) * 30;
        if (Number.isNaN(x) || !clear(x, z, 0.8, true)) continue;
        tuft(b, x, z, 0.6 + hash(i, 5) * 0.8, ['#7d8a44', '#8d9450', '#6b7a3a', '#a39a5a'][i % 4], i + 9000);
      }
      // the steel palisade along the car parks' service road (osm:way/1533364953), young trees inside it
      const svc = ROADS.flatMap((r) => r.cls === 3 ? [r.nodes.map((nd) => [NODE_XZ[nd * 2], NODE_XZ[nd * 2 + 1]] as P2)] : [])
        .find((p) => p.some(([x, z]) => Math.hypot(x - 962.1, z - 1335.9) < 1));
      if (svc) {
        for (let i = 0; i < svc.length - 1; i++) {
          const [ax, az] = svc[i], [bx, bz] = svc[i + 1], L = Math.hypot(bx - ax, bz - az), nx = (bz - az) / L, nz = -(bx - ax) / L, off = 5.2;
          const s = nx > 0 ? 1 : -1;
          const fa: P2 = [ax + nx * off * s, az + nz * off * s], fb: P2 = [bx + nx * off * s, bz + nz * off * s];
          const steps = Math.max(1, Math.round(L / 2.4));
          for (let j = 0; j <= steps; j++) {
            const x = fa[0] + ((fb[0] - fa[0]) * j) / steps, z = fa[1] + ((fb[1] - fa[1]) * j) / steps;
            if (!clear(x, z, 0.4, true)) continue;
            const [px, pz] = A(x, z);
            c.push([box(px - 0.05, px + 0.05, 0, 2.1, pz - 0.05, pz + 0.05), '#3c4a44']);
            for (let q = -2; q <= 2; q++) c.push([box(px - 0.02 + (q * (fb[0] - fa[0])) / steps / 5, px + 0.02 + (q * (fb[0] - fa[0])) / steps / 5, 0.1, 1.95, pz - 0.02 + (q * (fb[1] - fa[1])) / steps / 5, pz + 0.02 + (q * (fb[1] - fa[1])) / steps / 5), '#46544d']);
            if (j < steps) { const [qx, qz] = A(fa[0] + ((fb[0] - fa[0]) * (j + 1)) / steps, fa[1] + ((fb[1] - fa[1]) * (j + 1)) / steps); c.push([run(px, pz, qx, qz, 1.7, 1.78, 0.05), '#3c4a44'], [run(px, pz, qx, qz, 0.35, 0.43, 0.05), '#3c4a44']); }
            SOLIDS.add(x, z, 0.18);
            if (j % 6 === 3 && clear(x + nx * s * 2.2, z + nz * s * 2.2, 1.2, true)) broadleaf(k, b.leaf, x + nx * s * 2.2, z + nz * s * 2.2, { h: 3.5 + hash(x, z) * 1.5, spread: 3, seed: x + z, origin: CO, sparse: true });
          }
        }
      }
    }

    // ---------- the junction's paved core (the owner's junction brief, 2026-10-15) ----------
    // The mapped carriageways are separate ribbons: between them, where they meet the cross roads, the ground showed
    // through as green triangles and wedges, and the corner drapes painted it pale. The real junction is one open
    // asphalt area. Here every point of the junction's core that is not road but has road on at least seven of eight
    // sides within 26 m is the junction's own surface, laid in the roads' asphalt under the roads' paint layer. (The
    // approaches take five cars abreast from the carriageways' widening, lbplan.ts.) The corner verges, kerbs and
    // footways stay.
    const JC = { x0: 958, x1: 1024, z0: 1190, z1: 1240 }, CELL = 0.25;
    const cgw = Math.round((JC.x1 - JC.x0 + 56) / CELL), cgh = Math.round((JC.z1 - JC.z0 + 56) / CELL), cg = new Float32Array(cgw * cgh);
    for (let j = 0; j < cgh; j++) for (let i = 0; i < cgw; i++) cg[j * cgw + i] = clearance(JC.x0 - 28 + i * CELL, JC.z0 - 28 + j * CELL);
    const cl = (x: number, z: number) => { const i = Math.round((x - JC.x0 + 28) / CELL), j = Math.round((z - JC.z0 + 28) / CELL); return i < 0 || j < 0 || i >= cgw || j >= cgh ? 12 : cg[j * cgw + i]; };
    const enclosed = (x: number, z: number) => {
      let n = 0;
      for (let d = 0; d < 8; d++) {
        const a = (d / 8) * Math.PI * 2, ux = Math.cos(a), uz = Math.sin(a);
        for (let t = 0.75; t <= 26; t += 0.75) if (cl(x + ux * t, z + uz * t) < 0) { n++; break; }
      }
      return n >= 7;
    };
    // (road points inside the core are included too, so no sliver of ground shows along the ribbons' edges; the roads draw
    // over it)
    const junctionPaved = (x: number, z: number) => (x > JC.x0 && x < JC.x1 && z > JC.z0 && z < JC.z1 && enclosed(x, z));
    {
      const pos: number[] = [];
      for (let z = JC.z0 - 30; z < JC.z1 + 30; z += CELL) for (let x = JC.x0 - 8; x < JC.x1 + 8; x += CELL) {
        if (!junctionPaved(x + CELL / 2, z + CELL / 2)) continue;
        const q = [[x, z], [x + CELL, z], [x + CELL, z + CELL], [x, z + CELL]].map(([a, b]) => { const [px, pz] = A(a, b); return [px, gh(a, b) + 0.012, pz]; });
        pos.push(...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]);
      }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      const uv: number[] = []; for (let i = 0; i < pos.length; i += 3) uv.push((pos[i] + CO[0]) / 6, (pos[i + 2] + CO[1]) / 6);
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.computeVertexNormals();
      const am = new THREE.MeshStandardMaterial({ color: '#f2f2f2', map: asphaltTexture(false), roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
      const m = new THREE.Mesh(geo, am); m.receiveShadow = true; m.userData.noCollide = true; k.meshes.push(m);
    }

    // ---------- the zebra crossings on the four arms (the satellite, the owner's Street View at the stop line) ----------
    {
      const pos: number[] = [];
      /** stripes 0.5 m wide every 1.1 m along the line from p to q, each `len` long across it, only on the road */
      const zebra = ([px, pz]: P2, [qx, qz]: P2, len: number) => {
        const L = Math.hypot(qx - px, qz - pz), ux = (qx - px) / L, uz = (qz - pz) / L;
        for (let t = 0.3; t + 0.5 <= L; t += 1.1) {
          const x = px + ux * (t + 0.25), z = pz + uz * (t + 0.25);
          if (clearance(x, z) > -0.4 || westInner(z) + 0.2 < x && x < eastInner(z) - 0.2 && z > 1100 && z < 1300 && x > 975 && x < 1010) continue;
          const q = [[t, -len / 2], [t + 0.5, -len / 2], [t + 0.5, len / 2], [t, len / 2]].map(([a, b]) => {
            const wx = px + ux * a - uz * b, wz = pz + uz * a + ux * b, [lx, lz] = A(wx, wz);
            return [lx, gh(wx, wz) + 0.03, lz];
          });
          pos.push(...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]);
        }
      };
      zebra([xWest(1191) - 6, 1191], [xEast(1191) + 6, 1191], 3);
      zebra([xWest(1237) - 6, 1237], [xEast(1237) + 6, 1237], 3);
      zebra([965, 1200], [965, 1240], 3);
      zebra([1018, 1195], [1018, 1235], 3);
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
      const pm = new THREE.MeshStandardMaterial({ color: '#e9e6dc', roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 });
      const zm = new THREE.Mesh(geo, pm); zm.receiveShadow = true; zm.userData.noCollide = true; k.meshes.push(zm);
    }

    // ---------- the junction: signal posts, the islands' worn stone paving, the cabinet, bollards ----------
    for (const [key, [cx, cz]] of Object.entries(ISLANDS)) {
      // (the medians' noses, mn and ms, are the kerbed median itself now: no pale paving drawn over them)
      if (key !== 'mn' && key !== 'ms') k.meshes.push(new THREE.Mesh(drapeAt(CO, cx - 9, cx + 9, cz - 9, cz + 9, 0.5, 0.06, (x, z) => {
        if (clearance(x, z) < 0.15 || junctionPaved(x, z)) return null;
        const m = vnoise(x * 2.3, z * 2.3), n = vnoise(x * 0.6, z * 0.6);
        return n > 0.62 ? [0.55 + m * 0.05, 0.42, 0.3] : [0.56 + m * 0.08, 0.52 + m * 0.07, 0.47];
      }), groundCover()));
      // the post where the island has most room
      let best: P2 | null = null, bc = 0.5;
      for (let i = 0; i < 60; i++) { const x = cx + (hash(i, cx) - 0.5) * 5, z = cz + (hash(cz, i) - 0.5) * 5, cl = clearance(x, z); if (cl > 0.6 && !junctionPaved(x, z) && (!best || Math.hypot(x - cx, z - cz) < Math.hypot(best[0] - cx, best[1] - cz))) { bc = cl; best = [x, z]; } }
      void bc;
      if (!best) continue;
      // (the Okponglo signals brief, pictures 1, 2, 11: tall slender grey masts with a long overhead arm over the lanes of
      // the approach each serves, two heads standing on the arm and a second head part way down the mast, all facing the
      // approaching traffic; on the two other corners a tall pole with an upper and a lower head)
      const [px, pz] = A(...best), sig = SIGNALS[key as keyof typeof SIGNALS];
      const [fx, fz] = sig.face, ry = Math.atan2(fx, fz), H = sig.reach ? SIGNAL.mast : SIGNAL.pole;
      c.push([new THREE.CylinderGeometry(0.11, 0.16, H, 10).translate(px, H / 2, pz), '#9aa0a5'], [new THREE.CylinderGeometry(0.28, 0.3, 0.25, 10).translate(px, 0.12, pz), '#8c9196']);
      /** a head: dark housing, three lenses with visors on its face side only, a bracket back to its support */
      const head = (x: number, y: number, z: number) => {
        c.push([box(-0.17, 0.17, y, y + 1.05, -0.15, 0.15).rotateY(ry).translate(x, 0, z), '#1d1f22']);
        for (const [dy, col] of [[0.86, '#8a1f1f'], [0.53, '#8a6a12'], [0.2, '#1f7a2f']] as [number, string][]) {
          c.push([new THREE.CylinderGeometry(0.1, 0.1, 0.05, 10).rotateX(Math.PI / 2).translate(0, y + dy, 0.17).rotateY(ry).translate(x, 0, z), col]);
          c.push([box(-0.13, 0.13, y + dy + 0.1, y + dy + 0.13, 0.15, 0.32).rotateY(ry).translate(x, 0, z), '#1d1f22']);
        }
      };
      if (sig.reach) {
        const [ax, az] = sig.arm, L = sig.reach, y = SIGNAL.armY;
        const g = new THREE.CylinderGeometry(0.06, 0.09, L, 8).rotateZ(Math.PI / 2).rotateY(-Math.atan2(az, ax)).translate(px + (ax * L) / 2, y, pz + (az * L) / 2);
        c.push([g, '#9aa0a5']);
        // the joint and a short brace under the arm
        c.push([box(px - 0.2, px + 0.2, y - 0.25, y + 0.25, pz - 0.2, pz + 0.2), '#8c9196']);
        { const b0 = new THREE.Vector3(px, y - 1.4, pz), b1 = new THREE.Vector3(px + ax * 2.2, y, pz + az * 2.2), d = b1.clone().sub(b0), bg = new THREE.CylinderGeometry(0.035, 0.035, d.length(), 6);
          bg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())); c.push([bg.translate((b0.x + b1.x) / 2, (b0.y + b1.y) / 2, (b0.z + b1.z) / 2), '#9aa0a5']); }
        for (const t of SIGNAL.heads) { const hx = px + ax * L * t, hz = pz + az * L * t; c.push([box(hx - 0.05, hx + 0.05, y + 0.05, y + 0.2, hz - 0.05, hz + 0.05), '#55595d']); head(hx, y + 0.2, hz); }
      } else head(px + fx * 0.25, SIGNAL.pole - 1.3, pz + fz * 0.25);
      // the second head part way down the mast
      c.push([box(px - 0.05, px + 0.05, SIGNAL.lowY + 0.4, SIGNAL.lowY + 0.5, pz - 0.05, pz + 0.05).translate(fx * 0.12, 0, fz * 0.12), '#55595d']);
      head(px + fx * 0.28, SIGNAL.lowY, pz + fz * 0.28);
      SOLIDS.add(best[0], best[1], 0.2);
    }
    {
      // the cabinet on the north-west island, short black-and-yellow bollards along its edge (Pair 6)
      const [x, z] = CABINET;
      if (clear(x, z, 0.6)) {
        const [px, pz] = A(x, z);
        c.push([box(px - 0.6, px + 0.6, 0.25, 1.45, pz - 0.35, pz + 0.35), '#d7d8d3'], [box(px - 0.65, px + 0.65, 1.45, 1.55, pz - 0.4, pz + 0.4), '#c3c4bf']);
        for (const dx of [-0.5, 0.5]) c.push([box(px + dx - 0.04, px + dx + 0.04, 0, 0.25, pz - 0.3, pz + 0.3), '#6b6e70']);
        SOLIDS.add(x, z, 0.7);
      }
      const [ix, iz] = ISLANDS.nw;
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2, x2 = ix + Math.cos(a) * 4.5, z2 = iz + Math.sin(a) * 4.5;
        if (clearance(x2, z2) < 0.35 || clearance(x2, z2) > 1.6) continue;
        const [px, pz] = A(x2, z2);
        c.push([new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8).translate(px, 0.4, pz), '#1d1d1d'], [new THREE.CylinderGeometry(0.085, 0.085, 0.16, 8).translate(px, 0.62, pz), '#e7c21f']);
        SOLIDS.add(x2, z2, 0.12);
      }
    }

    // ---------- the roadside structures: billboard panels, empty frames, the verge mast ----------
    for (const [z, side, off, kind] of ROADSIDE) {
      const [x, zz] = offEdge(z, side, off);
      if (Number.isNaN(x) || !clear(x, zz, 0.6)) continue;
      const [px, pz] = A(x, zz), face = side === 'W' ? 1 : -1;
      // (on the raised stadium-side verge, the Okponglo brief's Pair 21: everything stands on the ground there)
      const c0 = c.length, yg = gh(x, zz);
      const lift = () => { if (yg) for (let q = c0; q < c.length; q++) c[q][0].translate(0, yg, 0); };
      if (kind === 'mast') { lattice(c, px, pz, 26, false); lift(); for (const sx of [-1, 1]) for (const sz of [-1, 1]) SOLIDS.add(x + sx * 1.1, zz + sz * 1.1, 0.25); continue; }
      if (kind === 'frame') {
        // an empty steel frame: two red-brown uprights, the grid of a missing panel (Pair 14)
        const col = '#7a3a2c', w = 5.2, y0 = 5, y1 = 12;
        for (const dz of [-w / 2, w / 2]) c.push([box(px - 0.18, px + 0.18, 0, y1, pz + dz - 0.18, pz + dz + 0.18), col]);
        for (let y = y0; y <= y1 + 0.01; y += (y1 - y0) / 4) c.push([box(px - 0.06, px + 0.06, y - 0.06, y + 0.06, pz - w / 2, pz + w / 2), col]);
        for (let dz = -w / 2; dz <= w / 2 + 0.01; dz += w / 3) c.push([box(px - 0.06, px + 0.06, y0, y1, pz + dz - 0.05, pz + dz + 0.05), col]);
        c.push([rod([px, y0, pz - w / 2], [px, y1, pz + w / 2], 0.06), col], [rod([px, y0, pz + w / 2], [px, y1, pz - w / 2], 0.06), col]);
        SOLIDS.add(x, zz - w / 2, 0.3); SOLIDS.add(x, zz + w / 2, 0.3);
        lift();
        continue;
      }
      // a panel on a single steel post: wide (panel) or tall and narrow (tall), its face a plain colour field
      const tall = kind === 'tall', w = tall ? 3.2 : 6.4, h = tall ? 6 : 3.2, y0 = tall ? 4 : 5.2;
      c.push([new THREE.CylinderGeometry(0.22, 0.26, y0 + h, 10).translate(px, (y0 + h) / 2, pz), '#7d8286']);
      c.push([box(px - 0.15, px + 0.15, y0, y0 + h, pz - w / 2, pz + w / 2), '#e9e9e6']);
      const cols = ['#1f5fae', '#c62f2f', '#2e8b4a', '#e7c21f', '#7a2a8c', '#e06a1c'], i0 = (hash(z, 7) * cols.length) | 0;
      c.push([box(px + face * 0.15, px + face * 0.2, y0 + 0.2, y0 + h * 0.55, pz - w / 2 + 0.2, pz + w / 2 - 0.2), cols[i0]]);
      c.push([box(px + face * 0.15, px + face * 0.2, y0 + h * 0.55, y0 + h - 0.2, pz - w / 2 + 0.2, pz + w / 2 - 0.2), cols[(i0 + 2) % cols.length]]);
      c.push([box(px + face * 0.15, px + face * 0.21, y0 + h * 0.3, y0 + h * 0.4, pz - w / 2 + 0.6, pz + w / 4), '#f4f1e8']);
      SOLIDS.add(x, zz, 0.3);
      lift();
    }

    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    if (edge.length) { const e = new THREE.Mesh(merge(edge), concrete(0.2)); e.receiveShadow = true; k.meshes.push(e); }
    b.finish(k, 0.3);
    void COMPOUND; void JUNCTION;
  },
};

/** the ground this work draws itself, kept clear of the generated campus trees and lamps: the median, the scrub, the
 *  verges, the junction, the frontage along La Bawaleshie Road and the N4's east side. (A site's keep boxes count within
 *  150 m of its model's origin, so the long strips are laid as tiles, each its own empty model.) */
const KEEP: [number, number, number, number][] = [[880, 1000, 870, 1195], [955, 1030, 1190, 1265], [940, 1075, 1260, 1645], [1012, 1462, 1180, 1250], [990, 1120, 958, 1648]];
const KEEP_TILES: Spec[] = KEEP.flatMap(([x0, x1, z0, z1], i) => {
  const nx = Math.ceil((x1 - x0) / 200), nz = Math.ceil((z1 - z0) / 200), out: Spec[] = [];
  for (let a = 0; a < nx; a++) for (let c = 0; c < nz; c++) {
    const ax = x0 + ((x1 - x0) * a) / nx, bx = x0 + ((x1 - x0) * (a + 1)) / nx, az = z0 + ((z1 - z0) * c) / nz, bz = z0 + ((z1 - z0) * (c + 1)) / nz;
    const org: [number, number] = [(ax + bx) / 2, (az + bz) / 2];
    out.push({ name: `la-bawaleshie keep ${i}.${a}.${c}`, axis: [1, 0], origin: org, storey: 3, style: PLAIN, roofColor: '#9aa0a3', fascia: '#6d5a4a', pitch: 0.2, blocks: [], keep: [[ax - org[0], bx - org[0], az - org[1], bz - org[1]]], extras: () => undefined });
  }
  return out;
});

export const laBawaleshieSite = createSite('la-bawaleshie', [hood, corridor, ...KEEP_TILES]);
