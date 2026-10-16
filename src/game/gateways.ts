// The halls' gateways (the owner, 2026-10-16): "gates are never plane, they have texture and shape"; the hall's gate
// takes you "through the gate of the entrance of the hostels to the inside", into the inner courtyards; the porter's
// lodge is "at the right side when you enter through the gate", on the left at Evandy's main block, Hilla Limann and
// Elizabeth Sey; Evandy's main block, Annex A and Annex B are open entrances with no gate.
//
// For each hall built round courts (the traditional halls, Jubilee, the Diaspora halls, Diamond Jubilee, Evandy Annex
// B) the entrance becomes a real passage: the hall's own model is cut open along the entrance's line from the facade to
// the court (every triangle of it inside the passage's volume is clipped away exactly), the passage is lined (side
// walls, a soffit, paving, a framed opening on the street face), and a pair of gate leaves hangs in the opening. The
// lodge is a room in the passage's side wall with its counter window, its sign over it. The passage is open ground for
// a walker (solids.ts: oriented passages). Other halls and hostels with a gate (Bani, TF, the annexes, ISH, Old Pent)
// get a free-standing gate: two piers and their leaves at the entrance.
// The gate leaves are each hall's own, chosen once per hall from a few makes (most of them timber): vertical boards in
// a frame, framed panels, a steel grille, a painted steel sheet with a bar top.
import * as THREE from 'three';
import { box, canvas, merge, type Part } from './modelkit';
import { concrete } from './concrete';
import { groundHeight as gh } from './relief';
import { BUILDINGS, buildingNear } from './campusmap';
import { RESIDENCES, type Entrance, type Residence } from './residence';
import { gates, grilleLeaf } from './gates';
import { OPASSAGES, SOLIDS } from './solids';
import { roadClearance } from './life';

export type GateMake = 'boards' | 'panels' | 'grille' | 'sheet';
export interface GatewayRecord { residence: string; entrance: string; kind: 'passage' | 'standalone' | 'open passage' | 'none'; depth?: number; width?: number; make?: GateMake | null; lodge?: 'left' | 'right' | null; note?: string }
export const GATEWAYS: GatewayRecord[] = [];

/** the halls built round courts: the entrance is a passage through to the court */
export const COURT_HALLS = new Set(['commonwealth', 'sarbah', 'volta', 'akuafo', 'legon', 'jubilee', 'jean-nelson', 'limann', 'sey', 'kwapong', 'diamond-jubilee']);
/** halls whose gate is modelled by their own site already (vikingslaw.ts, valco.ts, newpent.ts) */
const OWN_GATE = new Set(['vikings', 'valco-1', 'valco-2', 'new-pent']);
/** open entrances, no gate (the owner): Evandy's main block and its annexes */
const NO_GATE = new Set(['evandy']);
/** the lodge on the left going in (the owner) */
const LODGE_LEFT = new Set(['evandy', 'limann', 'sey']);
/** where the lodge is part of the site's own model already (residence.ts existingLodge), or there is none */
const lodgeHere = (r: Residence) => !!r.lodge && !r.existingLodge && r.lodge !== 'L06';

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
/** a hall's gate make: most of them timber */
export const gateMake = (id: string): GateMake => (['boards', 'panels', 'boards', 'grille', 'panels', 'sheet', 'boards'] as GateMake[])[hash(id) % 7];

// ---------- the gate leaves ----------
const woodMats = new Map<string, THREE.MeshStandardMaterial>();
/** a timber texture: boards with grain, knots and dark joints, in one of a few stains */
function wood(stain: string) {
  let m = woodMats.get(stain);
  if (m) return m;
  const tex = canvas(128, 256, (g) => {
    g.fillStyle = stain; g.fillRect(0, 0, 128, 256);
    let s = hash(stain);
    const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 90; i++) {
      const x = r() * 128, w = 0.6 + r() * 1.6;
      g.strokeStyle = `rgba(${r() < 0.5 ? '30,18,8' : '255,235,200'},${0.06 + r() * 0.12})`; g.lineWidth = w;
      g.beginPath(); g.moveTo(x, 0);
      for (let y = 0; y <= 256; y += 32) g.lineTo(x + Math.sin(y / 40 + i) * 2.2, y);
      g.stroke();
    }
    for (let i = 0; i < 4; i++) { const x = r() * 128, y = r() * 256; g.fillStyle = 'rgba(40,22,10,0.45)'; g.beginPath(); g.ellipse(x, y, 2.5, 5, 0, 0, Math.PI * 2); g.fill(); }
    // the joints between the boards
    g.fillStyle = 'rgba(20,12,6,0.65)'; for (let x = 0; x < 128; x += 32) g.fillRect(x, 0, 2, 256);
  });
  m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
  woodMats.set(stain, m);
  return m;
}
const STAINS = ['#7a4a26', '#5e3a1f', '#8a5a30', '#6b3f22'];
let sheetMat: THREE.MeshStandardMaterial | null = null;
const steelSheet = () => (sheetMat ??= new THREE.MeshStandardMaterial({ color: '#2f4a3a', roughness: 0.5, metalness: 0.5 }));
let ironMat: THREE.MeshStandardMaterial | null = null;
const iron = () => (ironMat ??= new THREE.MeshStandardMaterial({ color: '#1d1f22', roughness: 0.45, metalness: 0.6 }));

/** one leaf, hinge at the local origin, the leaf along +x, standing on y = 0; `side` mirrors the bracing */
export function gateLeaf(make: GateMake, L: number, H: number, id: string, side: 1 | -1): THREE.Group {
  if (make === 'grille') return grilleLeaf(L, H);
  const g = new THREE.Group();
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material) => { const o = new THREE.Mesh(geo, mat); o.castShadow = true; g.add(o); return o; };
  const y0 = 0.04;
  if (make === 'sheet') {
    // a painted steel sheet in a tube frame, an open bar top with spear heads
    const S = steelSheet(), I = iron(), hs = H * 0.72;
    add(new THREE.BoxGeometry(L - 0.06, hs - 0.08, 0.025).translate(L / 2, y0 + 0.04 + (hs - 0.08) / 2, 0), S);
    for (const x of [0.03, L - 0.03]) add(new THREE.BoxGeometry(0.06, H, 0.06).translate(x, y0 + H / 2, 0), I);
    for (const y of [y0 + 0.03, y0 + hs, y0 + H - 0.03]) add(new THREE.BoxGeometry(L, 0.05, 0.05).translate(L / 2, y, 0), I);
    for (let x = 0.14; x < L - 0.08; x += 0.13) { add(new THREE.BoxGeometry(0.02, H - hs, 0.02).translate(x, y0 + hs + (H - hs) / 2, 0), I); add(new THREE.ConeGeometry(0.025, 0.09, 4).translate(x, y0 + H + 0.03, 0), I); }
    // pressed panels on the sheet
    for (const y of [hs * 0.3, hs * 0.72]) add(new THREE.BoxGeometry(L - 0.3, hs * 0.28, 0.035).translate(L / 2, y0 + y, 0), S);
    return g;
  }
  const W = wood(STAINS[hash(id) % STAINS.length]), dark = wood('#3e2614');
  const tile = (geo: THREE.BufferGeometry, w: number, h: number) => { const uv = geo.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * 1.2, uv.getY(i) * h * 0.5); return geo; };
  // the frame: stiles and rails
  for (const x of [0.05, L - 0.05]) add(tile(new THREE.BoxGeometry(0.1, H, 0.09).translate(x, y0 + H / 2, 0), 0.1, H), dark);
  for (const y of [y0 + 0.06, y0 + H - 0.06]) add(tile(new THREE.BoxGeometry(L, 0.12, 0.09), L, 0.12).translate(L / 2, y, 0), dark);
  if (make === 'boards') {
    // vertical boards between the rails, a Z brace on the inner face, black strap hinges
    add(tile(new THREE.BoxGeometry(L - 0.1, H - 0.2, 0.045), L, H).translate(L / 2, y0 + H / 2, 0), W);
    const mid = y0 + H / 2;
    add(tile(new THREE.BoxGeometry(L - 0.12, 0.1, 0.04), L, 0.1).translate(L / 2, mid, 0.055), dark);
    const dl = Math.hypot(L - 0.2, H / 2 - 0.2), a = Math.atan2(H / 2 - 0.2, L - 0.2) * side;
    for (const yc of [y0 + H * 0.27, y0 + H * 0.73]) add(tile(new THREE.BoxGeometry(dl, 0.09, 0.04), dl, 0.1).rotateZ(a).translate(L / 2, yc, 0.055), dark);
    for (const y of [y0 + 0.35, y0 + H - 0.35]) add(new THREE.BoxGeometry(L * 0.45, 0.05, 0.012).translate(L * 0.225, y, -0.03), iron());
  } else {
    // framed panels: a mid rail, two raised panels each with a moulding, a row of spindles at the top
    const mid = y0 + H * 0.45, top = y0 + H * 0.8;
    for (const y of [mid, top]) add(tile(new THREE.BoxGeometry(L - 0.1, 0.1, 0.08), L, 0.1).translate(L / 2, y, 0), dark);
    for (const [ya, yb] of [[y0 + 0.12, mid - 0.05], [mid + 0.05, top - 0.05]]) {
      add(tile(new THREE.BoxGeometry(L - 0.12, yb - ya, 0.035), L, yb - ya).translate(L / 2, (ya + yb) / 2, 0), W);
      add(tile(new THREE.BoxGeometry(L - 0.36, yb - ya - 0.24, 0.06), L, yb - ya).translate(L / 2, (ya + yb) / 2, 0), W);
    }
    for (let x = 0.16; x < L - 0.1; x += 0.14) add(new THREE.CylinderGeometry(0.022, 0.022, H * 0.2 - 0.18, 6).translate(x, top + (H * 0.2 - 0.06) / 2, 0), dark);
  }
  // a ring handle near the meeting edge
  add(new THREE.TorusGeometry(0.05, 0.012, 6, 12).translate(L - 0.18, y0 + 1.05, 0.07), iron());
  return g;
}

// ---------- cutting the opening ----------
/** the passage's volume: from the facade (a0) to the court (a1) along u, half width hw across it, y0..y1 */
interface Cut { ox: number; oz: number; ux: number; uz: number; a0: number; a1: number; hw: number; y0: number; y1: number }
const planes = (c: Cut) => [
  (x: number, _y: number, z: number) => (x - c.ox) * c.ux + (z - c.oz) * c.uz - c.a0,
  (x: number, _y: number, z: number) => c.a1 - ((x - c.ox) * c.ux + (z - c.oz) * c.uz),
  (x: number, _y: number, z: number) => (x - c.ox) * -c.uz + (z - c.oz) * c.ux + c.hw,
  (x: number, _y: number, z: number) => c.hw - ((x - c.ox) * -c.uz + (z - c.oz) * c.ux),
  (_x: number, y: number) => y - c.y0,
  (_x: number, y: number) => c.y1 - y,
];
type V = Float32Array; // [world x, y, z, ...the vertex's attributes]
/** the part of a convex polygon where f >= 0 (Sutherland-Hodgman; attributes interpolated) */
function clip(poly: V[], f: (v: V) => number): V[] {
  const out: V[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], da = f(a), db = f(b);
    if (da >= 0) out.push(a);
    if ((da >= 0) !== (db >= 0)) {
      const t = da / (da - db), v = new Float32Array(a.length);
      for (let k = 0; k < a.length; k++) v[k] = a[k] + (b[k] - a[k]) * t;
      out.push(v);
    }
  }
  return out;
}
/**
 * Cuts the passage's volume out of a mesh: every triangle wholly inside goes, every triangle across its faces is
 * clipped exactly (the part outside is kept, as convex pieces). Returns whether anything changed.
 */
function carveMesh(m: THREE.Mesh, cuts: { c: Cut; x0: number; x1: number; z0: number; z1: number }[]) {
  const g0 = m.geometry, M = m.matrixWorld, w = new THREE.Vector3();
  const p0 = g0.attributes.position as THREE.BufferAttribute, idx = g0.index;
  const nt = (idx ? idx.count : p0.count) / 3, vi = (t: number, k: number) => (idx ? idx.getX(t * 3 + k) : t * 3 + k);
  // which triangles reach into a cut's box (the rest are copied as they are)
  const near = new Uint8Array(nt);
  let any = false;
  const xs = [0, 0, 0], ys = [0, 0, 0], zs = [0, 0, 0];
  for (let t = 0; t < nt; t++) {
    for (let k = 0; k < 3; k++) { w.fromBufferAttribute(p0, vi(t, k)).applyMatrix4(M); xs[k] = w.x; ys[k] = w.y; zs[k] = w.z; }
    const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    if (cuts.some((k) => x1 > k.x0 && x0 < k.x1 && z1 > k.z0 && z0 < k.z1 && y1 > k.c.y0 && y0 < k.c.y1)) { near[t] = 1; any = true; }
  }
  if (!any) return false;
  const names = Object.keys(g0.attributes);
  const attrs = names.map((k) => g0.attributes[k] as THREE.BufferAttribute);
  const sizes = attrs.map((a) => a.itemSize), stride = 3 + sizes.reduce((a, b) => a + b, 0);
  const fs = cuts.map((k) => planes(k.c));
  const vert = (i: number): V => {
    const v = new Float32Array(stride);
    w.fromBufferAttribute(p0, i).applyMatrix4(M); v[0] = w.x; v[1] = w.y; v[2] = w.z;
    let o = 3;
    for (let a = 0; a < attrs.length; a++) for (let k = 0; k < sizes[a]; k++) v[o++] = attrs[a].getComponent(i, k);
    return v;
  };
  const count = idx ? idx.count : p0.count;
  const groups = g0.groups.length ? g0.groups : [{ start: 0, count, materialIndex: 0 }];
  const out: number[][] = attrs.map(() => []), newGroups: { start: number; count: number; materialIndex?: number }[] = [];
  let changed = false, n = 0;
  const emitV = (v: V) => { let o = 3; for (let a = 0; a < attrs.length; a++) for (let k = 0; k < sizes[a]; k++) out[a].push(v[o++]); n++; };
  const emitI = (i: number) => { for (let a = 0; a < attrs.length; a++) for (let k = 0; k < sizes[a]; k++) out[a].push(attrs[a].getComponent(i, k)); n++; };
  for (const grp of groups) {
    const start = n, end = Math.min(count, grp.start + grp.count);
    for (let s = grp.start; s + 2 < end; s += 3) {
      const t = s / 3;
      if (!near[t]) { emitI(vi(t, 0)); emitI(vi(t, 1)); emitI(vi(t, 2)); continue; }
      let pieces: V[][] = [[vert(vi(t, 0)), vert(vi(t, 1)), vert(vi(t, 2))]];
      for (const f of fs) {
        const next: V[][] = [];
        for (const p of pieces) {
          // wholly outside one face of the box: untouched
          const d = p.map((v) => f.map((h) => h(v[0], v[1], v[2])));
          if (f.some((_, i) => d.every((dv) => dv[i] < 0))) { next.push(p); continue; }
          changed = true;
          // the outside part, one face at a time; what is left inside every face is dropped
          let rem = p;
          for (const h of f) {
            const o = clip(rem, (v) => -h(v[0], v[1], v[2]));
            if (o.length >= 3) next.push(o);
            rem = clip(rem, (v) => h(v[0], v[1], v[2]));
            if (rem.length < 3) break;
          }
        }
        pieces = next;
      }
      for (const p of pieces) for (let i = 1; i + 1 < p.length; i++) { emitV(p[0]); emitV(p[i]); emitV(p[i + 1]); }
    }
    newGroups.push({ start, count: n - start, materialIndex: grp.materialIndex });
  }
  if (!changed) return false;
  const g = new THREE.BufferGeometry();
  attrs.forEach((a, i) => g.setAttribute(names[i], new THREE.Float32BufferAttribute(out[i], a.itemSize)));
  if (g0.groups.length) for (const gr of newGroups) g.addGroup(gr.start, gr.count, gr.materialIndex);
  g.computeBoundingBox(); g.computeBoundingSphere();
  g.userData = { ...g0.userData };
  m.geometry = g;
  return true;
}

// ---------- the passages and gates ----------
/** courts the map's outlines leave in (no hole drawn): Jubilee Hall's long courtyard between its wings (hostels.ts,
 *  its model frame: x along (36.3, 103.2) from the footprint's centre, the court x -26.4..63.2, z -34.1..9.7) */
const EXTRA_COURTS: { x: number; z: number; ux: number; uz: number; a0: number; a1: number; hw: number }[] = (() => {
  const b = BUILDINGS.find((o) => o.name === 'Jubilee Hall');
  if (!b) return [];
  let cx = 0, cz = 0;
  const n = b.pts.length / 2;
  for (let i = 0; i < b.pts.length; i += 2) { cx += b.pts[i]; cz += b.pts[i + 1]; }
  cx /= n; cz /= n;
  const l = Math.hypot(36.3, 103.2), ux = 36.3 / l, uz = 103.2 / l, zc = (-34.1 + 9.7) / 2;
  // (local z -> (-uz, ux)); the court's centre line along local x at z = zc
  return [{ x: cx - zc * uz, z: cz + zc * ux, ux, uz, a0: -26.4, a1: 63.2, hw: (9.7 + 34.1) / 2 }];
})();
OPASSAGES.push(...EXTRA_COURTS);
const inExtraCourt = (x: number, z: number) => EXTRA_COURTS.some((p) => { const dx = x - p.x, dz = z - p.z, a = dx * p.ux + dz * p.uz, b = -dx * p.uz + dz * p.ux; return a > p.a0 && a < p.a1 && Math.abs(b) < p.hw; });
const solidAt = (x: number, z: number) => !!buildingNear(x, z, 0.1) && !inExtraCourt(x, z);
/** how far in from the entrance point the court's open ground begins (null: none within reach) */
function courtDepth(e: Entrance, ux: number, uz: number) {
  let inB = false;
  for (let t = -1; t <= 30; t += 0.25) {
    const x = e.at[0] + ux * t, z = e.at[1] + uz * t;
    const b = solidAt(x, z);
    if (b) inB = true;
    else if (inB) {
      // open ground for a couple of metres: the court
      let open = true;
      for (let s = 0.25; s <= 2; s += 0.25) if (solidAt(x + ux * s, z + uz * s)) { open = false; break; }
      if (open) return t;
    }
  }
  return inB ? null : 0;
}
/** where the building's outline begins along the entrance line (the facade) */
function facadeAt(e: Entrance, ux: number, uz: number) {
  for (let t = -4; t <= 6; t += 0.1) if (buildingNear(e.at[0] + ux * t, e.at[1] + uz * t, 0.05)) return t;
  return 0;
}

/**
 * Builds every gateway: cuts the courts' passages through the hall models under `roots` (after the relief has been
 * applied), lines them, hangs the gates, and places the lodges at them. Returns the group of what it added.
 */
export function buildGateways(roots: THREE.Object3D[]): THREE.Group {
  const group = new THREE.Group();
  group.name = 'hall gateways';
  GATEWAYS.length = 0;
  const parts: Part[] = [], cuts: Cut[] = [];
  const lodgeSigns: THREE.BufferGeometry[] = [];
  for (const r of RESIDENCES) r.entrances.forEach((e, ei) => {
    const rec: GatewayRecord = { residence: r.id, entrance: e.id, kind: 'none' };
    GATEWAYS.push(rec);
    if (OWN_GATE.has(r.id)) { rec.note = "the site's own gate"; return; }
    const f = (e.facing * Math.PI) / 180, ux = Math.sin(f), uz = -Math.cos(f), nx = Math.cos(f), nz = Math.sin(f);
    const court = COURT_HALLS.has(r.id) || (r.id === 'evandy' && r.blocks?.[ei]?.id === 'annex-b');
    const gated = !NO_GATE.has(r.id);
    const lodgeSide: 1 | -1 = LODGE_LEFT.has(r.id) ? -1 : 1;
    const make = gated ? gateMake(r.id) : null;
    rec.make = make;
    const at = (a: number, b: number): [number, number] => [e.at[0] + ux * a + nx * b, e.at[1] + uz * a + nz * b];
    const mat = (a: number, b: number, yaw = 0) => {
      // local x across (toward +n), z along (toward +u), y up, at (a, b) along/across
      const [x, z] = at(a, b);
      const m4 = new THREE.Matrix4().makeBasis(new THREE.Vector3(nx, 0, nz), new THREE.Vector3(0, 1, 0), new THREE.Vector3(ux, 0, uz));
      m4.premultiply(new THREE.Matrix4().makeRotationY(yaw));
      return m4.setPosition(x, 0, z);
    };
    // (a court the entrance line misses: the nearest line beside it that reaches one, the gateway moved across to it;
    // Diamond Jubilee's front is between its two courts)
    if (court && !(courtDepth(e, ux, uz)! >= 1)) {
      for (const b of [2, -2, 4, -4, 6, -6, 8, -8, 10, -10, 12, -12, 14, -14]) {
        const e2: Entrance = { ...e, at: [e.at[0] + nx * b, e.at[1] + nz * b] }, d = courtDepth(e2, ux, uz);
        if (d !== null && d >= 1 && d < 26) { e = e2; rec.note = `the gateway is ${Math.abs(b)} m to the ${b > 0 ? 'right' : 'left'} of the mapped entrance point, in line with the court`; break; }
      }
    }
    let depth = court ? courtDepth(e, ux, uz) : null;
    if (court && (depth === null || depth < 1)) { rec.note = 'no court found along the entrance line'; depth = null; }
    if (court && depth !== null) {
      // ----- a passage through to the court -----
      const a0 = facadeAt(e, ux, uz) - 0.6, a1 = depth + 0.4, W = r.id.startsWith('dia') || ['jean-nelson', 'limann', 'sey', 'kwapong'].includes(r.id) ? 3.0 : 3.6, hw = W / 2, H = 3.1;
      let gmin = Infinity, gmax = -Infinity;
      for (let a = a0; a <= a1; a += 0.5) for (const b of [-hw, 0, hw]) { const [x, z] = at(a, b), g = gh(x, z); gmin = Math.min(gmin, g); gmax = Math.max(gmax, g); }
      cuts.push({ ox: e.at[0], oz: e.at[1], ux, uz, a0, a1, hw, y0: gmin + 0.04, y1: gmax + H });
      Object.assign(rec, { kind: gated ? 'passage' : 'open passage', depth: +(a1 - a0).toFixed(1), width: W, lodge: lodgeHere(r) ? (lodgeSide > 0 ? 'right' : 'left') : null });
      OPASSAGES.push({ x: e.at[0], z: e.at[1], ux, uz, a0: a0 - 1.5, a1: a1 + 1, hw: hw - 0.3 });
      // the lining, piece by piece along the passage (it follows the ground)
      const step = 1.0, lodgeA = Math.max(a0 + 1.6, Math.min(a1 - 2.2, a0 + 2.4));
      for (let a = a0; a < a1 - 1e-3; a += step) {
        const b2 = Math.min(a1, a + step), [cx, cz] = at((a + b2) / 2, 0), g = gh(cx, cz);
        const seg = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, col: string) => parts.push([box(x0, x1, y0, y1, z0, z1).applyMatrix4(mat(0, 0)).translate(0, g, 0), col]);
        const za = a, zb = b2;
        // paving (cement screed), the soffit, the side walls; the lodge's window opens in its wall
        seg(-hw, hw, -0.3, 0.03, za, zb, '#c9c3b6');
        seg(-hw - 0.3, hw + 0.3, H - 0.02 + (gmax - g), H + 0.25 + (gmax - g), za, zb, '#ece6d8');
        for (const s of [-1, 1]) {
          const x0 = s * hw, x1 = s * (hw + 0.3);
          const lo = Math.min(x0, x1), hi = Math.max(x0, x1);
          const win = lodgeHere(r) && s === lodgeSide && za < lodgeA + 1.6 && zb > lodgeA;
          if (!win) seg(lo, hi, -0.3, H + (gmax - g), za, zb, '#f1ece0');
          else {
            // under the counter, over the window; the window itself is the lodge (built below)
            seg(lo, hi, -0.3, 0.95, za, zb, '#f1ece0');
            seg(lo, hi, 2.05, H + (gmax - g), za, zb, '#f1ece0');
            if (za < lodgeA) seg(lo, hi, 0.95, 2.05, za, lodgeA, '#f1ece0');
            if (zb > lodgeA + 1.6) seg(lo, hi, 0.95, 2.05, lodgeA + 1.6, zb, '#f1ece0');
          }
          // a dado line along the walls
          seg(s > 0 ? hw - 0.02 : -hw - 0.0, s > 0 ? hw : -hw + 0.02, 0.9, 1.0, za, zb, '#b9b1a1');
        }
      }
      // the street face: piers either side, a lintel over, the hall's name over the lintel
      const gf = gh(...at(a0, 0));
      const fr = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, col: string) => parts.push([box(x0, x1, y0, y1, z0, z1).applyMatrix4(mat(0, 0)).translate(0, gf, 0), col]);
      for (const s of [-1, 1]) fr(s > 0 ? hw : -hw - 0.55, s > 0 ? hw + 0.55 : -hw, -0.3, H + 0.45, a0 - 0.35, a0 + 0.4, '#fbf8f0');
      fr(-hw - 0.55, hw + 0.55, H - 0.05, H + 0.45, a0 - 0.35, a0 + 0.4, '#fbf8f0');
      fr(-hw - 0.65, hw + 0.65, H + 0.45, H + 0.6, a0 - 0.45, a0 + 0.5, '#d9d1bf');
      // the court face: a plain frame
      const gc = gh(...at(a1, 0));
      for (const s of [-1, 1]) parts.push([box(s > 0 ? hw : -hw - 0.35, s > 0 ? hw + 0.35 : -hw, -0.3, H + 0.3, a1 - 0.3, a1 + 0.15).applyMatrix4(mat(0, 0)).translate(0, gc, 0), '#fbf8f0']);
      parts.push([box(-hw - 0.35, hw + 0.35, H - 0.05, H + 0.3, a1 - 0.3, a1 + 0.15).applyMatrix4(mat(0, 0)).translate(0, gc + (gmax - gc), 0), '#fbf8f0']);
      // the lodge: a room behind the side wall, its counter window on the passage
      if (lodgeHere(r)) {
        const s = lodgeSide, [lx, lz] = at(lodgeA + 0.8, 0), gl = gh(lx, lz);
        const L = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, col: string) => parts.push([box(s > 0 ? x0 : -x1, s > 0 ? x1 : -x0, y0, y1, z0, z1).applyMatrix4(mat(0, 0)).translate(0, gl, 0), col]);
        // the room's inside (dim), the counter sill, the glazing bars, the key cubbies on the back wall
        L(hw + 0.3, hw + 2.4, 0, 0.02, lodgeA, lodgeA + 1.6, '#6b5e4e');
        L(hw + 2.4, hw + 2.5, 0, 2.3, lodgeA - 0.1, lodgeA + 1.7, '#d8cfbf');
        L(hw + 0.3, hw + 2.5, 0, 2.3, lodgeA - 0.1, lodgeA, '#d8cfbf');
        L(hw + 0.3, hw + 2.5, 0, 2.3, lodgeA + 1.6, lodgeA + 1.7, '#d8cfbf');
        L(hw + 0.3, hw + 2.5, 2.05, 2.3, lodgeA, lodgeA + 1.6, '#e6decd');
        L(hw - 0.12, hw + 0.45, 0.95, 1.02, lodgeA - 0.05, lodgeA + 1.65, '#7c4523');
        L(hw + 0.3, hw + 0.9, 0, 0.95, lodgeA + 0.1, lodgeA + 1.5, '#a2622f');
        for (const z of [lodgeA + 0.53, lodgeA + 1.07]) L(hw + 0.1, hw + 0.16, 1.02, 2.05, z - 0.03, z + 0.03, '#2f3236');
        for (let z = lodgeA + 0.15; z < lodgeA + 1.45; z += 0.22) for (let y = 1.2; y < 2.0; y += 0.2) L(hw + 2.3, hw + 2.4, y, y + 0.17, z, z + 0.19, '#5a3a26');
        // the door into the lodge, further along
        const dA = lodgeA + 2.0;
        if (dA + 1 < a1) parts.push([box(s > 0 ? hw - 0.04 : -hw - 0.0, s > 0 ? hw : -hw + 0.04, 0, 2.1, dA, dA + 0.95).applyMatrix4(mat(0, 0)).translate(0, gh(...at(dA, 0)), 0), '#5a3a26']);
        lodgeSigns.push(new THREE.PlaneGeometry(1.5, 0.28).rotateY(s > 0 ? -Math.PI / 2 : Math.PI / 2).translate(s * (hw - 0.03), 2.3, lodgeA + 0.8).applyMatrix4(mat(0, 0)).translate(0, gl, 0));
      }
      if (gated) hang(r, e, make!, at(a0 + 0.1, 0), ux, uz, nx, nz, W - 0.1, Math.min(2.7, H - 0.15), gf);
      return;
    }
    if (!gated || court) { rec.note = rec.note ?? 'open entrance'; return; }
    // ----- a free-standing gate at the entrance: two piers with caps, a short wall either side, the leaves -----
    const W = 3.2, hw = W / 2, a00 = Math.min(0, facadeAt(e, ux, uz) - 1.2);
    // (never across a road or path the bike rides: the leaves would close it. An entrance point on the road: the gate
    // stands at the first place along the way in, else out, clear of it)
    const clear = (a: number) => [-hw - 1.9, 0, hw + 1.9].every((b) => roadClearance(...at(a, b), 6, -1, true) >= 0.4) && ![-hw - 1, 0, hw + 1].some((b) => buildingNear(...at(a, b), 0.2));
    const a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, -1, -2, -3, -4, -5, -6].map((d) => a00 + d).find(clear);
    if (a === undefined) { rec.note = 'the entrance is on a road with no clear place near it: no gate placed'; return; }
    if (a !== a00) rec.note = `the gate stands ${Math.abs(a - a00).toFixed(0)} m ${a > a00 ? 'in' : 'out'} from the entrance point, clear of the road`;
    const [cx, cz] = at(a, 0), g = gh(cx, cz);
    const P = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, col: string) => parts.push([box(x0, x1, y0, y1, z0, z1).applyMatrix4(mat(a, 0)).translate(0, g, 0), col]);
    for (const s of [-1, 1]) {
      P(s * hw - 0.25, s * hw + 0.25, -0.3, 2.5, -0.25, 0.25, '#efe9dc');
      P(s * hw - 0.32, s * hw + 0.32, 2.5, 2.62, -0.32, 0.32, '#d8cfbd');
      P(s > 0 ? hw + 0.25 : -hw - 1.85, s > 0 ? hw + 1.85 : -hw - 0.25, -0.3, 1.6, -0.12, 0.12, '#efe9dc');
      for (const k of [0, 0.5, 1]) { const [px, pz] = at(a, s * (hw + 0.25 + k * 1.6)); SOLIDS.add(px, pz, 0.3); }
    }
    Object.assign(rec, { kind: 'standalone', width: W, lodge: null });
    hang(r, e, make!, [cx, cz], ux, uz, nx, nz, W - 0.5, 2.2, g);
  });
  /** two leaves across the opening at (cx, cz), meeting in the middle, hinged at its sides, opening inward */
  function hang(r: Residence, e: Entrance, make: GateMake, [cx, cz]: [number, number], ux: number, uz: number, nx: number, nz: number, W: number, H: number, y: number) {
    const L = W / 2;
    for (const s of [-1, 1] as const) {
      // the hinge at the side s; the closed leaf points across toward the middle (-s n); it swings in toward +u
      const leaf = gateLeaf(make, L, H, `${e.id}${s}`, s);
      leaf.traverse((o) => { o.userData.noCollide = true; });
      leaf.position.y = y;
      gates.register({ id: `${e.id}:gate${s > 0 ? 'R' : 'L'}`, buildingId: r.id, hinge: [cx + nx * s * L, cz + nz * s * L], dir: [-s * nx, -s * nz], length: L, open: s < 0 ? 1.45 : -1.45, leaf, near: 12, exit: 26 });
    }
    void ux; void uz;
  }
  // cut the passages out of the halls' models
  if (cuts.length) {
    const box3 = new THREE.Box3(), cb = cuts.map((c) => {
      const pts = [[c.a0, -c.hw], [c.a0, c.hw], [c.a1, -c.hw], [c.a1, c.hw]].map(([a, b]) => [c.ox + c.ux * a - c.uz * b, c.oz + c.uz * a + c.ux * b]);
      return { c, x0: Math.min(...pts.map((p) => p[0])), x1: Math.max(...pts.map((p) => p[0])), z0: Math.min(...pts.map((p) => p[1])), z1: Math.max(...pts.map((p) => p[1])) };
    });
    let carved = 0;
    for (const root of roots) {
      root.updateWorldMatrix(true, true);
      root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh || (m as unknown as THREE.InstancedMesh).isInstancedMesh || !m.geometry?.attributes?.position) return;
        if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
        box3.copy(m.geometry.boundingBox!).applyMatrix4(m.matrixWorld);
        const hit = cb.filter((k) => box3.max.x > k.x0 && box3.min.x < k.x1 && box3.max.z > k.z0 && box3.min.z < k.z1 && box3.max.y > k.c.y0 && box3.min.y < k.c.y1)
        if (hit.length && carveMesh(m, hit)) carved++;
      });
    }
    group.userData.carved = carved;
  }
  if (parts.length) { const mesh = new THREE.Mesh(merge(parts), concrete(0.3)); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); }
  if (lodgeSigns.length) {
    const sign = new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvas(256, 48, (g) => { g.fillStyle = '#16365f'; g.fillRect(0, 0, 256, 48); g.fillStyle = '#ffffff'; g.font = 'bold 26px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText("PORTER'S LODGE", 128, 25); }) });
    for (const geo of lodgeSigns) group.add(new THREE.Mesh(geo, sign));
  }
  return group;
}
/** whether an entrance's lodge is built in its gateway (lodges.ts then builds none there) */
export const lodgeInGateway = (residence: string, entrance: string) => GATEWAYS.some((g) => g.residence === residence && g.entrance === entrance && (g.kind === 'passage' || g.kind === 'open passage') && g.lodge);
