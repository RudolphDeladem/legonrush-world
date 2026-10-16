// Builds one allocated room interior from the atlas's layout (residence.ts LAYOUTS) and the selected category: full
// height walls with the doors and windows of the plan, a ceiling, tiled floors, the furniture of the plan, the
// category's service module and balcony, paint and lights. Plan x runs across the room, plan y into it (the entry wall
// at y 0), plan z is height; in the game x is x, plan y is +z, height is y. The room is built away from the campus
// (ROOM_ORIGIN) and only one room exists at a time: the player's own (Volume A section 16, privacy); roomplay.ts places
// it in its building for the view out of its windows and from its balcony (the campus itself, drawn from there).
//
// Besides the meshes it returns what walking in the room needs (the floor rectangles, the wall and parapet lines, the
// solid furniture), the room's working parts (curtains, louvre blades, the balcony door, cupboard doors, the fan), and
// the sleeping places in bed order for the occupants.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LAYOUTS, PAINT, categoryById, residenceById, type Accommodation, type Layout, type LayoutObject, type RoomCategory } from './residence';
import VIKINGS_MODULES from '../data/vikings-modules.json';

/** where the room is built: far outside the campus, so nothing of the campus can be seen or reached from it */
export const ROOM_ORIGIN = new THREE.Vector3(30000, 0, 30000);
const WALL_T = 0.12, DOOR_H = 2.1, SILL = 0.95, HEAD = 2.15;

export interface RoomView { label: string; pos: THREE.Vector3; yaw: number; bounds: [number, number, number, number] }
/** a working part of the room (group-local coordinates: plan x, height, plan y) */
export interface Interactable {
  id: string;
  kind: 'curtains' | 'louvres' | 'door' | 'cupboard' | 'fan';
  /** the point the character reaches for, and the way into the room from it (unit x, z) */
  at: THREE.Vector3; normal: [number, number];
  open: boolean;
  label(): string;
  toggle(): void;
  /** eases its parts toward the open or closed state */
  update(dt: number): void;
}
/** what walking in the room needs (group-local x, z) */
export interface WalkArea {
  /** floor rectangles x0, z0, x1, z1 (rooms, wet compartments, balcony) */
  rects: [number, number, number, number][];
  /** solid lines: walls (windows included: glass and blades are never passable), parapets, light wells */
  segs: [number, number, number, number][];
  /** door openings: a line that is solid while its door is closed */
  doors: { seg: [number, number, number, number]; door: Interactable | null }[];
  /** solid furniture footprints */
  boxes: [number, number, number, number][];
}
/** a sleeping place (bed order: the occupants' bed numbers): the mattress centre and top, the way the head lies */
export interface SleepPlace { x: number; z: number; h: number; along: 'x' | 'z'; head: 1 | -1; upper: boolean; bed: number }
export interface BuiltRoom {
  group: THREE.Group;
  /** where the character stands on arrival (world), and the way they face */
  spawn: THREE.Vector3; spawnYaw: number;
  /** the look-around anchors: the plan's camera anchor first, then each other compartment of the unit */
  views: RoomView[];
  /** counts for the acceptance checks */
  singles: number; bunks: number; wood: boolean; paint: string;
  layout: string;
  walk: WalkArea;
  interactables: Interactable[];
  places: SleepPlace[];
  /** the outer face the room's windows and balcony look out of: a point on it (group-local, floor level) and the
   *  outward direction; the side windows that do not face out open onto a light well */
  facade: { x: number; z: number; nx: number; nz: number };
  hasBalcony: boolean;
  windowStyle: 'louvres' | 'curtains';
  dispose(): void;
}

// ---------- materials ----------
const mats = new Map<string, THREE.Material>();
const mat = (key: string, make: () => THREE.Material) => { let m = mats.get(key); if (!m) mats.set(key, (m = make())); return m; };
const std = (color: string, o: THREE.MeshStandardMaterialParameters = {}) => mat(`s${color}${JSON.stringify(o)}`, () => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o }));
function tileTexture(base: string, line: string, n: number) {
  return mat(`tile${base}${line}${n}`, () => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d')!;
    g.fillStyle = base; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${90 + Math.random() * 60},${85 + Math.random() * 50},${70 + Math.random() * 40},${0.05 + Math.random() * 0.08})`; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
    g.strokeStyle = line; g.lineWidth = 2;
    for (let i = 0; i <= n; i++) { const p = (i * 256) / n; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 256); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(256, p); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.55 });
  }) as THREE.MeshStandardMaterial;
}
const WOOD = '#7a4a2a', WOOD_DARK = '#5c3820', METAL = '#8d9196', SILVER = '#b9bdc2', MATTRESS = '#5f9ea0', SHEET = '#e8e6df';
const DARK_METAL = '#2a2c30', CREAM_PANEL = '#e6d7a6', LIGHT_TIMBER = '#d9b27c', GREY_METAL = '#a3a8ad';

// ---------- geometry helpers (plan coordinates in, local room coordinates out) ----------
type Part = [THREE.BufferGeometry, THREE.Material];
const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  new THREE.BoxGeometry(Math.max(0.005, x1 - x0), Math.max(0.005, y1 - y0), Math.max(0.005, z1 - z0)).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
/** a box given in plan terms: x across, y deep (plan y, the game's z), h0..h1 high */
const pbox = (x0: number, x1: number, y0: number, y1: number, h0: number, h1: number) => box(x0, x1, h0, h1, y0, y1);
const cyl = (r: number, h0: number, h1: number, x: number, y: number) => new THREE.CylinderGeometry(r, r, h1 - h0, 8).translate(x, (h0 + h1) / 2, y);

function mergeParts(parts: Part[]) {
  const by = new Map<THREE.Material, THREE.BufferGeometry[]>();
  for (const [g, m] of parts) { const flat = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(flat.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') flat.deleteAttribute(k); if (!flat.attributes.uv) flat.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(flat.attributes.position.count * 2), 2)); (by.get(m) ?? by.set(m, []).get(m)!).push(flat); }
  const out: THREE.Mesh[] = [];
  for (const [m, gs] of by) { const mesh = new THREE.Mesh(mergeGeometries(gs), m); mesh.castShadow = false; mesh.receiveShadow = true; out.push(mesh); }
  return out;
}

/** the moving parts and what they answer to, collected while building */
interface Dyn { group: THREE.Group; ints: Interactable[] }
/** eases a 0..1 state toward its target */
const ease = (t: number, open: boolean, dt: number, rate = 2.2) => Math.max(0, Math.min(1, t + (open ? 1 : -1) * dt * rate));
const smooth = (t: number) => t * t * (3 - 2 * t);

// ---------- furniture ----------
/** which end of a bed or bunk is the head: the end against the nearer wall across its length (or the plan's own) */
function headEnd(o: LayoutObject, l: Layout) {
  const alongY = o.d >= o.w;
  if (o.label && /SINGLE [AB]/.test(o.label) && l.id === 'R08') return 'y1';
  if (alongY) return o.y < l.length - (o.y + o.d) ? 'y0' : 'y1';
  return o.x < l.width - (o.x + o.w) ? 'x0' : 'x1';
}
function bed(p: Part[], o: LayoutObject, l: Layout, wood: boolean, bunk: boolean, yellow: boolean) {
  const dark = !wood && /dark/.test(o.material ?? '');
  const frame = std(wood ? WOOD : dark ? DARK_METAL : bunk && yellow ? SILVER : METAL, wood ? { roughness: 0.7 } : { metalness: 0.5, roughness: 0.4 });
  const x0 = o.x, x1 = o.x + o.w, y0 = o.y, y1 = o.y + o.d, alongY = o.d >= o.w, he = headEnd(o, l);
  const decks = bunk ? [0.42, 1.52] : [dark ? 0.36 : 0.42];
  const top = bunk ? 1.85 : wood ? 0.85 : 0.7;
  const r = wood ? 0.035 : 0.025;
  const mattress = std(o.mattress_color ?? (yellow ? '#5a3a35' : MATTRESS), { roughness: 0.95 });
  // corner posts (square timber or round tube); a low dark frame has its own end frames below
  if (!dark) for (const [px, py] of [[x0 + r, y0 + r], [x1 - r, y0 + r], [x0 + r, y1 - r], [x1 - r, y1 - r]]) p.push([wood ? pbox(px - r, px + r, py - r, py + r, 0, top) : cyl(r, 0, top, px, py), frame]);
  for (const h of decks) {
    // the deck frame rails, the base, the mattress and a folded sheet, a pillow at the head
    p.push([pbox(x0, x1, y0, y0 + 0.04, h - 0.1, h), frame], [pbox(x0, x1, y1 - 0.04, y1, h - 0.1, h), frame], [pbox(x0, x0 + 0.04, y0, y1, h - 0.1, h), frame], [pbox(x1 - 0.04, x1, y0, y1, h - 0.1, h), frame]);
    p.push([pbox(x0 + 0.03, x1 - 0.03, y0 + 0.03, y1 - 0.03, h - 0.04, h), std(wood ? WOOD_DARK : '#6d7176')]);
    p.push([pbox(x0 + 0.05, x1 - 0.05, y0 + 0.05, y1 - 0.05, h, h + 0.16), mattress]);
    const pil = 0.42;
    if (he === 'y0') p.push([pbox(x0 + 0.12, x1 - 0.12, y0 + 0.08, y0 + 0.08 + pil, h + 0.16, h + 0.27), std(SHEET, { roughness: 0.95 })]);
    if (he === 'y1') p.push([pbox(x0 + 0.12, x1 - 0.12, y1 - 0.08 - pil, y1 - 0.08, h + 0.16, h + 0.27), std(SHEET, { roughness: 0.95 })]);
    if (he === 'x0') p.push([pbox(x0 + 0.08, x0 + 0.08 + pil, y0 + 0.12, y1 - 0.12, h + 0.16, h + 0.27), std(SHEET, { roughness: 0.95 })]);
    if (he === 'x1') p.push([pbox(x1 - 0.08 - pil, x1 - 0.08, y0 + 0.12, y1 - 0.12, h + 0.16, h + 0.27), std(SHEET, { roughness: 0.95 })]);
    if (dark) continue;
    // the head and foot panels (a wooden headboard; Diamond Jubilee's yellow panels)
    const panel = yellow ? std('#d9a227', { roughness: 0.6 }) : frame;
    const ph0 = h + 0.05, ph1 = h + (bunk ? 0.38 : wood ? 0.45 : 0.3);
    if (alongY) { p.push([pbox(x0 + 0.03, x1 - 0.03, y0, y0 + 0.03, ph0, ph1), panel], [pbox(x0 + 0.03, x1 - 0.03, y1 - 0.03, y1, ph0, ph1), panel]); }
    else { p.push([pbox(x0, x0 + 0.03, y0 + 0.03, y1 - 0.03, ph0, ph1), panel], [pbox(x1 - 0.03, x1, y0 + 0.03, y1 - 0.03, ph0, ph1), panel]); }
  }
  if (dark && alongY) {
    // the filmed Vikings singles (V2 F0197, F0211): low dark tubular frames, a curved top rail and vertical bars at the
    // head end, a lower barred rail at the foot
    for (const [y, hi] of [[he === 'y1' ? y1 - 0.02 : y0 + 0.02, 0.98], [he === 'y1' ? y0 + 0.02 : y1 - 0.02, 0.62]] as [number, number][]) {
      for (const x of [x0 + 0.02, x1 - 0.02]) p.push([cyl(0.017, 0, hi, x, y), frame]);
      const n = 9;
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = x0 + 0.02 + (x1 - x0 - 0.04) * t, bow = hi + Math.sin(t * Math.PI) * (hi > 0.9 ? 0.07 : 0.02);
        if (i < n) { const xa = x, xb = x0 + 0.02 + (x1 - x0 - 0.04) * ((i + 1) / n), ba = bow, bb = hi + Math.sin(((i + 1) / n) * Math.PI) * (hi > 0.9 ? 0.07 : 0.02); p.push([new THREE.CylinderGeometry(0.014, 0.014, Math.hypot(xb - xa, bb - ba), 6).rotateZ(Math.PI / 2 - Math.atan2(bb - ba, xb - xa)).translate((xa + xb) / 2, (ba + bb) / 2, y), frame]); }
        if (i > 0 && i < n) p.push([cyl(0.008, 0.45, bow, x, y), frame]);
      }
    }
  }
  if (bunk) {
    // the upper deck's guard rail on the room side and the ladder at the foot
    const room = alongY ? (o.x + o.w / 2 < l.width / 2 ? 'x1' : 'x0') : (o.y + o.d / 2 < l.length / 2 ? 'y1' : 'y0');
    const foot = { y0: 'y1', y1: 'y0', x0: 'x1', x1: 'x0' }[he] as 'x0' | 'x1' | 'y0' | 'y1';
    const H = 1.52;
    if (room === 'x1' || room === 'x0') {
      const x = room === 'x1' ? x1 - 0.02 : x0 + 0.02;
      p.push([pbox(x - 0.02, x + 0.02, y0 + 0.2, y1 - 0.6, H + 0.3, H + 0.34), frame]);
      const ly0 = foot === 'y1' ? y1 - 0.45 : y0 + 0.05, ly1 = ly0 + 0.4;
      p.push([pbox(x - 0.02, x + 0.02, ly0, ly0 + 0.03, 0, H + 0.3), frame], [pbox(x - 0.02, x + 0.02, ly1 - 0.03, ly1, 0, H + 0.3), frame]);
      for (let h = 0.35; h < H + 0.2; h += 0.3) p.push([pbox(x - 0.02, x + 0.02, ly0, ly1, h, h + 0.03), frame]);
    } else {
      const y = room === 'y1' ? y1 - 0.02 : y0 + 0.02;
      p.push([pbox(x0 + 0.2, x1 - 0.6, y - 0.02, y + 0.02, H + 0.3, H + 0.34), frame]);
      const lx0 = foot === 'x1' ? x1 - 0.45 : x0 + 0.05, lx1 = lx0 + 0.4;
      p.push([pbox(lx0, lx0 + 0.03, y - 0.02, y + 0.02, 0, H + 0.3), frame], [pbox(lx1 - 0.03, lx1, y - 0.02, y + 0.02, 0, H + 0.3), frame]);
      for (let h = 0.35; h < H + 0.2; h += 0.3) p.push([pbox(lx0, lx1, y - 0.02, y + 0.02, h, h + 0.03), frame]);
    }
  }
}
/** a cupboard: an open-fronted carcass with a shelf and a rail, and hinged doors the character can open */
function cupboard(p: Part[], dyn: Dyn, o: LayoutObject, w: 'x0' | 'x1' | 'y0' | 'y1' | null, cream: boolean) {
  const x0 = o.x, x1 = o.x + o.w, y0 = o.y, y1 = o.y + o.d, H = 1.95, t = 0.02;
  const body = std(cream ? CREAM_PANEL : WOOD, { roughness: 0.7 }), inner = std(cream ? '#d8c995' : WOOD_DARK, { roughness: 0.85 });
  // the front faces away from its wall
  const side = w ?? (o.w >= o.d ? 'y0' : 'x0');
  // (nearWall answers with the nearest wall; a cupboard's back is against it)
  const front = side === 'y0' ? 'y1' : side === 'y1' ? 'y0' : side === 'x0' ? 'x1' : 'x0';
  const fx = front === 'x1' ? x1 : front === 'x0' ? x0 : 0, fy = front === 'y1' ? y1 : front === 'y0' ? y0 : 0;
  // carcass: back, sides, top, bottom, a shelf and a hanging rail
  p.push([pbox(x0, x1, y0, y1, 0, 0.06), body], [pbox(x0, x1, y0, y1, H - t, H), body]);
  if (front === 'y0' || front === 'y1') {
    const by = front === 'y1' ? y0 : y1 - t;
    p.push([pbox(x0, x1, by, by + t, 0, H), inner], [pbox(x0, x0 + t, y0, y1, 0, H), body], [pbox(x1 - t, x1, y0, y1, 0, H), body]);
    p.push([pbox(x0 + t, x1 - t, y0, y1, 1.55, 1.57), inner], [cyl(0.012, 1.4, 1.42, (x0 + x1) / 2, (y0 + y1) / 2).scale(1, 1, 1), inner]);
  } else {
    const bx = front === 'x1' ? x0 : x1 - t;
    p.push([pbox(bx, bx + t, y0, y1, 0, H), inner], [pbox(x0, x1, y0, y0 + t, 0, H), body], [pbox(x0, x1, y1 - t, y1, 0, H), body]);
    p.push([pbox(x0, x1, y0 + t, y1 - t, 1.55, 1.57), inner]);
  }
  // the doors: one per 0.55 m of front, in pairs hinged at their outer edges, swinging out of the front
  const nx = front === 'x1' ? 1 : front === 'x0' ? -1 : 0, nz = front === 'y1' ? 1 : front === 'y0' ? -1 : 0;
  const ux = nz, uz = -nx, beta = Math.atan2(nx, nz);
  const span = front === 'y0' || front === 'y1' ? o.w : o.d, n = Math.max(1, Math.round(span / 0.55)), dw = span / n;
  const leaves: { g: THREE.Object3D; dir: number }[] = [];
  const knob = std('#c9b98e', { metalness: 0.4, roughness: 0.4 });
  // the front line's start, the end that the u direction runs away from
  const fa = front === 'y0' || front === 'y1' ? [x0, fy] : [fx, y0], fb = front === 'y0' || front === 'y1' ? [x1, fy] : [fx, y1];
  const start = (fb[0] - fa[0]) * ux + (fb[1] - fa[1]) * uz > 0 ? fa : fb;
  for (let i = 0; i < n; i++) {
    const outerFirst = i % 2 === 0;
    const hingeAt = outerFirst ? i * dw : (i + 1) * dw;
    const hinge = new THREE.Group();
    const s2 = outerFirst ? 1 : -1;
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(dw - 0.01, H - 0.1, 0.02).translate((s2 * dw) / 2, H / 2, 0.01), body);
    const k = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6).translate(s2 * (dw - 0.07), 1.0, 0.035), knob);
    hinge.add(leaf, k);
    hinge.position.set(start[0] + ux * hingeAt + nx * 0.005, 0, start[1] + uz * hingeAt + nz * 0.005);
    hinge.rotation.y = beta;
    dyn.group.add(hinge);
    leaves.push({ g: hinge, dir: s2 });
  }
  const base = leaves.map((l) => l.g.rotation.y);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let t0 = 0;
  const it: Interactable = {
    id: `cupboard-${dyn.ints.length}`, kind: 'cupboard', open: false,
    at: new THREE.Vector3(cx + nx * (o.w / 2), 1.1, cy + nz * (o.d / 2)), normal: [nx, nz],
    label: () => (it.open ? 'Close cupboard' : 'Open cupboard'),
    toggle: () => { it.open = !it.open; },
    update: (dt) => {
      t0 = ease(t0, it.open, dt, 1.8);
      const e = smooth(t0);
      // (a leaf running along +x turns toward +z, out of the front, with a negative turn about y)
      leaves.forEach((l, i) => { l.g.rotation.y = base[i] - l.dir * e * 1.75; });
    },
  };
  dyn.ints.push(it);
}
function furniture(p: Part[], dyn: Dyn, o: LayoutObject, l: Layout, c: RoomCategory, nearWall: (x: number, y: number) => 'x0' | 'x1' | 'y0' | 'y1' | null, H: number) {
  const x0 = o.x, x1 = o.x + o.w, y0 = o.y, y1 = o.y + o.d, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const v2 = l.id === 'R08';
  const wood = std(v2 ? LIGHT_TIMBER : WOOD, { roughness: 0.7 }), steel = std(v2 ? GREY_METAL : METAL, { metalness: 0.5, roughness: 0.45 }), white = std('#f2f2ef', { roughness: 0.3 }), chrome = std('#c8ccd0', { metalness: 0.8, roughness: 0.25 });
  switch (o.type) {
    case 'bed': case 'bunk': {
      const isWood = c.wood ?? (o.material === 'wood' || l.traditional_wood);
      bed(p, o, l, isWood, o.type === 'bunk', c.catalogue === 'diamond');
      break;
    }
    case 'desk': {
      p.push([pbox(x0, x1, y0, y1, 0.72, 0.76), wood]);
      for (const [px, py] of [[x0 + 0.04, y0 + 0.04], [x1 - 0.04, y0 + 0.04], [x0 + 0.04, y1 - 0.04], [x1 - 0.04, y1 - 0.04]]) p.push([cyl(0.018, 0, 0.72, px, py), steel]);
      if (v2) { p.push([pbox(x0 + 0.05, x1 - 0.05, y0 + 0.05, y1 - 0.05, 0.6, 0.62), steel]); break; }
      // the high shelf on the wall behind it (Pent, Diaspora), unless a window is there
      const w0 = nearWall(cx, cy), clash = l.windows.some(([a, , b]) => Math.min(a, b) < x1 + 0.3 && Math.max(a, b) > x0 - 0.3);
      const w = clash ? null : w0;
      if (w === 'y1') p.push([pbox(x0, x1, l.length - 0.3, l.length - WALL_T / 2, 1.55, 1.58), wood]);
      if (w === 'y0') p.push([pbox(x0, x1, WALL_T / 2, 0.3, 1.55, 1.58), wood]);
      break;
    }
    case 'chair': {
      const seat = std(v2 ? LIGHT_TIMBER : '#b8864f', { roughness: 0.7 });
      p.push([pbox(x0 + 0.02, x1 - 0.02, y0 + 0.02, y1 - 0.02, 0.43, 0.47), seat]);
      for (const [px, py] of [[x0 + 0.04, y0 + 0.04], [x1 - 0.04, y0 + 0.04], [x0 + 0.04, y1 - 0.04], [x1 - 0.04, y1 - 0.04]]) p.push([cyl(0.012, 0, 0.45, px, py), steel]);
      // the back away from the desk (the desk is the nearer of the plan's end walls)
      const back = cy < l.length / 2 ? y0 : y1 - 0.03;
      p.push([pbox(x0 + 0.03, x1 - 0.03, back, back + 0.03, 0.47, 0.88), seat]);
      break;
    }
    case 'wardrobe': cupboard(p, dyn, o, nearWall(cx, cy), v2 || /cream/.test(o.material ?? '')); break;
    case 'basin': p.push([pbox(x0, x1, y0, y1, 0.78, 0.86), white], [cyl(0.06, 0, 0.78, cx, cy), white], [pbox(cx - 0.02, cx + 0.02, cy - 0.02, cy + 0.02, 0.86, 1.0), chrome]); break;
    case 'toilet': p.push([pbox(x0 + 0.1, x1 - 0.1, y0 + 0.1, y1 - 0.15, 0, 0.42), white], [pbox(x0 + 0.05, x1 - 0.05, y0 + 0.05, y1 - 0.1, 0.42, 0.46), white]);
      { const w = nearWall(cx, cy); if (w) { const [a0, a1, b0, b1] = w === 'y0' ? [x0 + 0.08, x1 - 0.08, y0, y0 + 0.18] : w === 'y1' ? [x0 + 0.08, x1 - 0.08, y1 - 0.18, y1] : w === 'x0' ? [x0, x0 + 0.18, y0 + 0.08, y1 - 0.08] : [x1 - 0.18, x1, y0 + 0.08, y1 - 0.08]; p.push([pbox(a0, a1, b0, b1, 0.4, 0.8), white]); } }
      break;
    case 'shower': {
      p.push([pbox(x0, x1, y0, y1, 0, 0.05), std('#cfd8da', { roughness: 0.3 })]);
      const w = nearWall(cx, cy) ?? 'y1', [hx, hy] = w === 'y1' ? [cx, y1 - 0.1] : w === 'y0' ? [cx, y0 + 0.1] : w === 'x0' ? [x0 + 0.1, cy] : [x1 - 0.1, cy];
      p.push([cyl(0.012, 0.05, 2.0, hx, hy), chrome], [cyl(0.07, 1.98, 2.02, hx, hy), chrome]);
      // a curtain rail and a curtain along the open side (P1; V2 F0108 patterned curtain)
      const side = w === 'y1' || w === 'y0' ? (w === 'y1' ? y0 : y1) : (w === 'x1' ? x0 : x1);
      const cur = std(v2 ? '#cfdcef' : '#7fb3c9', { roughness: 0.9, side: THREE.DoubleSide });
      if (w === 'y1' || w === 'y0') p.push([pbox(x0, x1, side - 0.01, side + 0.01, 1.98, 2.0), chrome], [pbox(x0 + 0.05, x0 + 0.45, side - 0.03, side + 0.03, 0.4, 1.95), cur]);
      else p.push([pbox(side - 0.01, side + 0.01, y0, y1, 1.98, 2.0), chrome], [pbox(side - 0.03, side + 0.03, y0 + 0.05, y0 + 0.45, 0.4, 1.95), cur]);
      break;
    }
    case 'counter': {
      // a speckled worktop on masonry supports, open underneath (ISH kitchen, Pent service strip)
      p.push([pbox(x0, x1, y0, y1, 0.86, 0.92), std('#7d7a76', { roughness: 0.5 })]);
      for (const px of [x0 + 0.06, (x0 + x1) / 2, x1 - 0.06]) p.push([pbox(px - 0.06, px + 0.06, y0 + 0.04, y1 - 0.02, 0, 0.86), std('#d8d4cc')]);
      break;
    }
    case 'sink': p.push([pbox(x0, x1, y0, y1, 0.9, 0.93), chrome], [pbox(x0 + 0.05, x1 - 0.05, y0 + 0.05, y1 - 0.05, 0.8, 0.9), std('#9da3a8', { metalness: 0.7, roughness: 0.3 })], [pbox(cx - 0.015, cx + 0.015, y1 - 0.05, y1 - 0.02, 0.93, 1.15), chrome]); break;
    case 'fridge': p.push([pbox(x0, x1, y0, y1, 0, 1.45), std('#a7abaf', { metalness: 0.35, roughness: 0.4 })], [pbox(x0 + 0.05, x0 + 0.08, y0 - 0.02, y0, 0.9, 1.3), chrome]); break;
    case 'hob': p.push([pbox(x0, x1, y0, y1, 0.92, 0.97), std('#2a2c2f', { roughness: 0.5 })]); break;
    case 'sofa': p.push([pbox(x0, x1, y0, y1, 0.1, 0.42), std('#3c3f48', { roughness: 0.9 })], [pbox(x1 - 0.18, x1, y0, y1, 0.42, 0.85), std('#3c3f48', { roughness: 0.9 })]); break;
    case 'ceiling_light': p.push([new THREE.CylinderGeometry(0.16, 0.16, 0.05, 20).translate(cx, H - 0.03, cy), mat('lamp', () => new THREE.MeshBasicMaterial({ color: '#fffbea' }))]); break;
    case 'ceiling_fan': ceilingFan(dyn, cx, cy, H, 0.55); break;
    case 'drying_rack': {
      // V2 F0164: a free-standing dark metal A-frame with yellow lines along its length
      const rack = std(DARK_METAL, { metalness: 0.5, roughness: 0.45 }), line = std('#e8c93a', { roughness: 0.8 });
      const along = o.d >= o.w, L0 = along ? y0 : x0, L1 = along ? y1 : x1, c0 = along ? cx : cy;
      const P = (a: number, b: number, h: number): [number, number, number] => (along ? [c0 + b, h, a] : [a, h, c0 + b]);
      const rod = (a: [number, number, number], b: [number, number, number], r = 0.012, m = rack) => { const v = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const g = new THREE.CylinderGeometry(r, r, v.length(), 6); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize())); g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); p.push([g, m]); };
      for (const a of [L0, L1]) { rod(P(a, -0.22, 0), P(a, 0, 1.2)); rod(P(a, 0.22, 0), P(a, 0, 1.2)); rod(P(a, -0.12, 0.6), P(a, 0.12, 0.6)); }
      rod(P(L0, 0, 1.2), P(L1, 0, 1.2));
      for (const b of [-0.16, -0.08, 0.08, 0.16]) { const h = 1.2 - Math.abs(b) * (1.2 / 0.22); rod(P(L0, b, h), P(L1, b, h), 0.006, line); }
      break;
    }
  }
}
/** a three-blade ceiling fan that the character can switch on and off */
function ceilingFan(dyn: Dyn, x: number, y: number, H: number, len: number) {
  const fan = new THREE.Group(); fan.name = 'fan';
  const white = std('#ece9e2');
  fan.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6).translate(0, -0.2, 0), white), new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 12).translate(0, -0.42, 0), white));
  const blades = new THREE.Group();
  for (let i = 0; i < 3; i++) blades.add(new THREE.Mesh(new THREE.BoxGeometry(len, 0.012, 0.11).translate(len / 2 + 0.08, -0.45, 0).rotateY((i * Math.PI * 2) / 3), white));
  fan.add(blades);
  fan.position.set(x, H, y);
  dyn.group.add(fan);
  let speed = 0;
  const it: Interactable = {
    id: `fan-${dyn.ints.length}`, kind: 'fan', open: true, at: new THREE.Vector3(x, 1.4, y), normal: [0, 0],
    label: () => (it.open ? 'Switch the fan off' : 'Switch the fan on'),
    toggle: () => { it.open = !it.open; },
    update: (dt) => { speed += ((it.open ? 9 : 0) - speed) * Math.min(1, dt * 0.8); blades.rotation.y += speed * dt; },
  };
  dyn.ints.push(it);
}

// ---------- the shell ----------
interface Balcony { x0: number; x1: number; y0: number; y1: number; side: 'y1' | 'x1' }
interface Plan {
  l: Layout; objects: LayoutObject[]; walls: [number, number, number, number][]; doors: Layout['doors']; windows: Layout['windows'];
  rooms: Layout['rooms']; wet: Set<number>;
  /** lines that are parapets (solid to 1.05 m, open above) */
  parapets: [number, number, number, number][];
  balcony: Balcony | null;
  /** the outer face: 'y1' (the plans' back wall) or 'x1' (the Vikings double, V2), and its line */
  facade: { side: 'y1' | 'x1'; at: number };
}

/** the plan scaled about its origin (the atlas's single-room scale variants; furniture keeps its size) */
function scaled(l: Layout, s: number): Layout {
  if (s === 1) return l;
  const S = (v: number) => +(v * s).toFixed(3);
  return {
    ...l, width: S(l.width), length: S(l.length),
    rooms: l.rooms.map((r) => ({ ...r, x: S(r.x), y: S(r.y), w: S(r.w), d: S(r.d) })),
    walls: l.walls.map(([a, b, c2, d]) => [S(a), S(b), S(c2), S(d)]),
    // (door openings keep their width, re-centred on the scaled position)
    doors: l.doors.map((d) => ({ ...d, x: S(d.x + d.w / 2) - d.w / 2, y: S(d.y) })),
    windows: l.windows.map(([a, b, c2, d]) => [S(a), S(b), S(c2), S(d)]),
    objects: l.objects.map((o) => ({ ...o, x: S(o.x + o.w / 2) - o.w / 2, y: S(o.y + o.d / 2) - o.d / 2 })),
    spawn: [S(l.spawn[0]), S(l.spawn[1]), 0], camera_anchor: [S(l.camera_anchor[0]), S(l.camera_anchor[1]), l.camera_anchor[2]],
  };
}
/** a door's gap in its wall line: the walls in the plan already stop at it; re-cut for scaled plans */
function wallsWithDoors(l: { walls: [number, number, number, number][]; doors: Layout['doors'] }) {
  const out: [number, number, number, number][] = [];
  for (const [ax, ay, bx, by] of l.walls) {
    let segs: [number, number][] = [[0, 1]];
    const L = Math.hypot(bx - ax, by - ay);
    for (const d of l.doors) {
      const [dx0, dy0, dx1, dy1] = d.axis === 'x' ? [d.x, d.y, d.x + d.w, d.y] : [d.x, d.y, d.x, d.y + d.w];
      // on this wall's line?
      const cross = (px: number, py: number) => Math.abs((bx - ax) * (py - ay) - (by - ay) * (px - ax)) / (L || 1);
      if (cross(dx0, dy0) > 0.02 || cross(dx1, dy1) > 0.02) continue;
      const t = (px: number, py: number) => ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / (L * L || 1);
      let t0 = t(dx0, dy0), t1 = t(dx1, dy1); if (t0 > t1) [t0, t1] = [t1, t0];
      segs = segs.flatMap(([s0, s1]) => (t1 <= s0 || t0 >= s1 ? [[s0, s1]] : [[s0, Math.max(s0, t0)], [Math.min(s1, t1), s1]].filter(([a, b]) => b - a > 1e-3)) as [number, number][]);
    }
    for (const [s0, s1] of segs) out.push([ax + (bx - ax) * s0, ay + (by - ay) * s0, ax + (bx - ax) * s1, ay + (by - ay) * s1]);
  }
  return out;
}
const onLine = (ax: number, ay: number, bx: number, by: number, px: number, py: number, tol = 0.03) => {
  const L = Math.hypot(bx - ax, by - ay) || 1, ux = (bx - ax) / L, uy = (by - ay) / L;
  const t = (px - ax) * ux + (py - ay) * uy;
  return Math.abs(ux * (py - ay) - uy * (px - ax)) < tol && t > -tol && t < L + tol;
};

function shell(p: Part[], dyn: Dyn, plan: Plan, H: number, paint: THREE.Material, wetPaint: THREE.Material, style: 'louvres' | 'curtains', walk: WalkArea) {
  // the floors: room tiles; wet rooms in small pale tiles
  plan.rooms.forEach((r, i) => {
    const wet = plan.wet.has(i), tm = tileTexture(wet ? '#d9dcd8' : '#d8d2c4', wet ? '#b9bdb9' : '#b8b0a0', wet ? 10 : 6);
    const g = pbox(r.x, r.x + r.w, r.y, r.y + r.d, -0.05, 0), uv = g.attributes.uv as THREE.BufferAttribute, pos = g.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, pos.getX(k) / (wet ? 1.2 : 2.4), pos.getZ(k) / (wet ? 1.2 : 2.4));
    p.push([g, tm]);
    // the ceiling (a balcony has the slab of the floor above over it)
    p.push([pbox(r.x, r.x + r.w, r.y, r.y + r.d, H, H + 0.05), std('#f7f7f4', { roughness: 0.9 })]);
    walk.rects.push([r.x, r.y, r.x + r.w, r.y + r.d]);
  });
  const roomOf = (x: number, y: number) => plan.rooms.findIndex((r) => x >= r.x - 0.2 && x <= r.x + r.w + 0.2 && y >= r.y - 0.2 && y <= r.y + r.d + 0.2);
  const inside = (x: number, y: number) => plan.rooms.some((r) => x > r.x + 0.02 && x < r.x + r.w - 0.02 && y > r.y + 0.02 && y < r.y + r.d - 0.02);
  // the walls (with the windows cut out of them)
  for (const [ax, ay, bx, by] of plan.walls) {
    const L = Math.hypot(bx - ax, by - ay); if (L < 0.01) continue;
    walk.segs.push([ax, ay, bx, by]);
    const ux = (bx - ax) / L, uy = (by - ay) / L;
    // window spans on this wall
    const spans: [number, number][] = [];
    for (const [wx0, wy0, wx1, wy1] of plan.windows) {
      if (!onLine(ax, ay, bx, by, wx0, wy0) || !onLine(ax, ay, bx, by, wx1, wy1)) continue;
      let t0 = (wx0 - ax) * ux + (wy0 - ay) * uy, t1 = (wx1 - ax) * ux + (wy1 - ay) * uy; if (t0 > t1) [t0, t1] = [t1, t0];
      if (t1 < 0 || t0 > L) continue;
      spans.push([Math.max(0, t0), Math.min(L, t1)]);
    }
    spans.sort((a, b) => a[0] - b[0]);
    const mid = roomOf(ax + ux * L / 2, ay + uy * L / 2), wm = plan.wet.has(mid) ? wetPaint : paint;
    const seg = (t0: number, t1: number, h0: number, h1: number) => {
      // (the wall's own ends run on half a wall thickness, so corners close without a separate post)
      if (t0 <= 1e-6) t0 = -WALL_T / 2;
      if (t1 >= L - 1e-6) t1 = L + WALL_T / 2;
      const x0 = ax + ux * t0, y0 = ay + uy * t0, x1 = ax + ux * t1, y1 = ay + uy * t1;
      const g = new THREE.BoxGeometry(t1 - t0, h1 - h0, WALL_T);
      g.rotateY(-Math.atan2(uy, ux)).translate((x0 + x1) / 2, (h0 + h1) / 2, (y0 + y1) / 2);
      p.push([g, wm]);
    };
    let t = 0;
    for (const [s0, s1] of spans) {
      if (s0 > t) seg(t, s0, 0, H);
      seg(s0 - 0.01, s1 + 0.01, 0, SILL); seg(s0 - 0.01, s1 + 0.01, HEAD, H);
      // which side is outside: the side with no indoor room of the plan (a balcony counts as outside)
      const mx = ax + ux * (s0 + s1) / 2, my = ay + uy * (s0 + s1) / 2;
      const b = plan.balcony, onBal = (x: number, y: number) => !!b && x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1;
      let nx = uy, ny = -ux;
      if (inside(mx + nx * 0.3, my + ny * 0.3) && !onBal(mx + nx * 0.3, my + ny * 0.3)) { nx = -nx; ny = -ny; }
      const out = !inside(mx + nx * 0.3, my + ny * 0.3);
      const facing = plan.facade.side === 'y1' ? ny > 0.5 : nx > 0.5;
      windowOpening(p, dyn, ax + ux * s0, ay + uy * s0, ax + ux * s1, ay + uy * s1, ux, uy, nx, ny, style);
      // a window that does not look out of the building's face opens onto a light well (an inferred shaft wall), so the
      // campus is never seen through the building from the wrong side
      if (out && !facing) {
        const w = s1 - s0 + 1.2, cx = mx + nx * 1.1, cy = my + ny * 1.1;
        p.push([new THREE.BoxGeometry(w, H + 2, 0.1).rotateY(-Math.atan2(uy, ux)).translate(cx, H / 2, cy), std('#dcd9cf', { roughness: 0.95 })]);
        for (const k of [-1, 1]) { const ex = mx + ux * k * (w / 2), ey = my + uy * k * (w / 2); p.push([new THREE.BoxGeometry(0.1, H + 2, 1.1).rotateY(-Math.atan2(uy, ux)).translate(ex + nx * 0.55, H / 2, ey + ny * 0.55), std('#dcd9cf', { roughness: 0.95 })]); }
      }
      t = s1;
    }
    if (t < L) seg(t, L, 0, H);
  }
  // parapets: solid to 1.05 m with a darker cap (V2 F0164), open above
  for (const [ax, ay, bx, by] of plan.parapets) {
    const L = Math.hypot(bx - ax, by - ay), a = -Math.atan2(by - ay, bx - ax), cx = (ax + bx) / 2, cy = (ay + by) / 2;
    p.push([new THREE.BoxGeometry(L + 0.15, 1.0, 0.15).rotateY(a).translate(cx, 0.5, cy), paint]);
    p.push([new THREE.BoxGeometry(L + 0.2, 0.06, 0.22).rotateY(a).translate(cx, 1.03, cy), std('#8d8a84', { roughness: 0.8 })]);
    // the slab edge below and the soffit band above, so the balcony reads as part of the building's face
    p.push([new THREE.BoxGeometry(L + 0.2, 0.3, 0.2).rotateY(a).translate(cx, -0.15, cy), paint], [new THREE.BoxGeometry(L + 0.2, 0.25, 0.2).rotateY(a).translate(cx, H + 0.1, cy), paint]);
    walk.segs.push([ax, ay, bx, by]);
  }
  // doors: lintels over every opening; the entry door closed (the corridor beyond is never shown); the balcony door a
  // working door; other inner doors stand open
  for (const d of plan.doors) {
    const [x0, y0, x1, y1] = d.axis === 'x' ? [d.x, d.y, d.x + d.w, d.y] : [d.x, d.y, d.x, d.y + d.w];
    const L = d.w, ux = (x1 - x0) / L, uy = (y1 - y0) / L;
    const lin = new THREE.BoxGeometry(L, H - DOOR_H, WALL_T).rotateY(-Math.atan2(uy, ux)).translate((x0 + x1) / 2, (DOOR_H + H) / 2, (y0 + y1) / 2);
    const mid = roomOf((x0 + x1) / 2 + uy * 0.3, (y0 + y1) / 2 - ux * 0.3);
    p.push([lin, plan.wet.has(mid) ? wetPaint : paint]);
    // the frame
    const frame = std('#4a2e1c', { roughness: 0.6 });
    for (const [px, py] of [[x0, y0], [x1, y1]]) p.push([new THREE.BoxGeometry(0.06, DOOR_H, WALL_T + 0.04).rotateY(-Math.atan2(uy, ux)).translate(px, DOOR_H / 2, py), frame]);
    const leaf = std(d.label === 'ENTRY' ? '#5a3522' : d.label === 'BALCONY' ? '#e9dfb8' : '#6b4a33', { roughness: 0.6 });
    if (d.label === 'ENTRY') {
      p.push([new THREE.BoxGeometry(L - 0.04, DOOR_H - 0.02, 0.045).rotateY(-Math.atan2(uy, ux)).translate((x0 + x1) / 2, DOOR_H / 2, (y0 + y1) / 2), leaf]);
      const hx = x0 + ux * (L - 0.12), hy = y0 + uy * (L - 0.12);
      p.push([new THREE.BoxGeometry(0.03, 0.03, 0.14).rotateY(-Math.atan2(uy, ux)).translate(hx, 1.0, hy), std('#c8ccd0', { metalness: 0.8, roughness: 0.25 })]);
      walk.doors.push({ seg: [x0, y0, x1, y1], door: null });
    } else if (d.label === 'BALCONY') {
      // a panelled door hinged at its first jamb, swinging into the room
      const hinge = new THREE.Group();
      const g = new THREE.Mesh(new THREE.BoxGeometry(L - 0.04, DOOR_H - 0.02, 0.045).translate((L - 0.04) / 2, DOOR_H / 2, 0), leaf);
      const k = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.14).translate(L - 0.14, 1.0, 0), std('#c8ccd0', { metalness: 0.8, roughness: 0.25 }));
      hinge.add(g, k);
      hinge.position.set(x0, 0, y0); const base = -Math.atan2(uy, ux); hinge.rotation.y = base;
      // into the room: the side the plan's room is on
      const inX = -uy, inY = ux, sign = roomOf((x0 + x1) / 2 + inX * 0.4, (y0 + y1) / 2 + inY * 0.4) >= 0 && !(plan.balcony && (x0 + x1) / 2 + inX * 0.4 > plan.balcony.x0 && (y0 + y1) / 2 + inY * 0.4 > plan.balcony.y0 && (x0 + x1) / 2 + inX * 0.4 < plan.balcony.x1 && (y0 + y1) / 2 + inY * 0.4 < plan.balcony.y1) ? 1 : -1;
      dyn.group.add(hinge);
      let t0 = 0;
      const it: Interactable = {
        id: 'balcony-door', kind: 'door', open: false,
        at: new THREE.Vector3((x0 + x1) / 2, 1.1, (y0 + y1) / 2), normal: [inX * sign, inY * sign],
        label: () => (it.open ? 'Close the balcony door' : 'Open the balcony door'),
        toggle: () => { it.open = !it.open; },
        update: (dt) => { t0 = ease(t0, it.open, dt, 1.6); hinge.rotation.y = base + sign * smooth(t0) * 1.6; },
      };
      dyn.ints.push(it);
      walk.doors.push({ seg: [x0, y0, x1, y1], door: it });
    } else {
      // swung open against the wall, into the inner compartment
      const g = new THREE.BoxGeometry(0.04, DOOR_H - 0.02, L - 0.04).translate(0, DOOR_H / 2, (L - 0.04) / 2);
      g.rotateY(-Math.atan2(uy, ux)).translate(x0, 0, y0);
      p.push([g, leaf]);
    }
  }
}
/**
 * A window opening in a dark frame (the references' window language): louvre blades of frosted glass on their pivots
 * (most rooms; V2 F0059), or clear glass with curtains (ISH 1, its study window). The opening never becomes passable:
 * its wall line stays solid.
 */
function windowOpening(p: Part[], dyn: Dyn, x0: number, y0: number, x1: number, y1: number, ux: number, uy: number, nx: number, ny: number, style: 'louvres' | 'curtains') {
  const L = Math.hypot(x1 - x0, y1 - y0), a = -Math.atan2(uy, ux), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const frame = std('#2b2d30', { roughness: 0.5 });
  p.push([new THREE.BoxGeometry(L, 0.05, WALL_T + 0.02).rotateY(a).translate(cx, SILL, cy), frame], [new THREE.BoxGeometry(L, 0.05, WALL_T + 0.02).rotateY(a).translate(cx, HEAD, cy), frame]);
  const cols = Math.max(1, Math.round(L / 0.75));
  for (let i = 0; i <= cols; i++) { const t = i / cols, px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t; p.push([new THREE.BoxGeometry(0.05, HEAD - SILL, WALL_T + 0.02).rotateY(a).translate(px, (SILL + HEAD) / 2, py), frame]); }
  // the side the room is on (the character reaches from there)
  const inX = -nx, inY = -ny;
  const id = `window-${dyn.ints.length}`;
  if (style === 'louvres') {
    // each pane a stack of blades turning about their own long axes (clips in the jambs)
    const blade = std('#cfd9de', { roughness: 0.25, metalness: 0.05, transparent: true, opacity: 0.72 });
    const blades: THREE.Mesh[] = [];
    const panes = new THREE.Group(); panes.position.set(cx, 0, cy); panes.rotation.y = a; dyn.group.add(panes);
    const pw = L / cols;
    for (let i = 0; i < cols; i++) for (let h = SILL + 0.09; h < HEAD - 0.04; h += 0.1) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(pw - 0.06, 0.006, 0.11), blade);
      b.position.set(-L / 2 + pw * (i + 0.5), h, 0);
      panes.add(b); blades.push(b);
    }
    const CLOSED = 1.22, OPEN = 0.1;
    let t0 = 0;
    for (const b of blades) b.rotation.x = CLOSED;
    const it: Interactable = {
      id, kind: 'louvres', open: false, at: new THREE.Vector3(cx + inX * 0.1, 1.45, cy + inY * 0.1), normal: [inX, inY],
      label: () => (it.open ? 'Close louvres' : 'Open louvres'),
      toggle: () => { it.open = !it.open; },
      update: (dt) => { t0 = ease(t0, it.open, dt, 1.5); const r = CLOSED + (OPEN - CLOSED) * smooth(t0); for (const b of blades) b.rotation.x = r; },
    };
    dyn.ints.push(it);
  } else {
    // clear glass in the frame, a rail and two curtains on the room side
    p.push([new THREE.BoxGeometry(L - 0.04, HEAD - SILL - 0.04, 0.01).rotateY(a).translate(cx, (SILL + HEAD) / 2, cy), mat('glass', () => new THREE.MeshStandardMaterial({ color: '#cfe3ee', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.16, depthWrite: false }))]);
    const g = new THREE.Group(); g.position.set(cx + inX * 0.12, 0, cy + inY * 0.12); g.rotation.y = a; dyn.group.add(g);
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, L + 0.5, 6).rotateZ(Math.PI / 2).translate(0, HEAD + 0.14, 0), std('#c8ccd0', { metalness: 0.7, roughness: 0.3 })));
    const cloth = std('#b7a07a', { roughness: 0.95, side: THREE.DoubleSide });
    const half = (L + 0.4) / 2, drop = HEAD + 0.12 - (SILL - 0.25);
    const panels = [-1, 1].map((s) => {
      // pleated: a folded strip, its hanging edge at the window's middle when drawn
      const geo = new THREE.PlaneGeometry(half, drop, 12, 1), pos = geo.attributes.position as THREE.BufferAttribute;
      for (let k = 0; k < pos.count; k++) pos.setZ(k, Math.sin((pos.getX(k) / half) * Math.PI * 12) * 0.025);
      geo.computeVertexNormals();
      geo.translate(-s * half / 2, HEAD + 0.12 - drop / 2, 0);
      const m = new THREE.Mesh(geo, cloth); m.position.x = s * (L + 0.4) / 2; g.add(m); return { m, s };
    });
    let t0 = 0;
    const it: Interactable = {
      id, kind: 'curtains', open: false, at: new THREE.Vector3(cx + inX * 0.15, 1.45, cy + inY * 0.15), normal: [inX, inY],
      label: () => (it.open ? 'Close curtains' : 'Open curtains'),
      toggle: () => { it.open = !it.open; },
      update: (dt) => { t0 = ease(t0, it.open, dt, 1.3); const e = smooth(t0); for (const { m } of panels) m.scale.x = 1 - e * 0.78; },
    };
    dyn.ints.push(it);
  }
}

/** moves a service module (S01, S02) alongside the bedroom's right wall, its entry on a free stretch of that wall */
function attachModule(plan: Plan, mod: Layout) {
  const l = plan.l, W = l.width;
  const entry = mod.doors.find((d) => d.label === 'ENTRY')!;
  const span = entry.w + 0.1;
  // a free stretch of the right wall: nothing within 0.75 m of the wall there
  const busy = (y: number) => plan.objects.some((o) => o.x + o.w > W - 0.75 && y + span > o.y - 0.1 && y < o.y + o.d + 0.1);
  let gy = -1;
  for (let y = 0.25; y + span < l.length - 0.2; y += 0.05) if (!busy(y)) { gy = y; break; }
  if (gy < 0) return false;
  // module plan (mx, my) -> bedroom plan: x = W + my, y = y0 + mx, with the module's entry centre on the gap's centre
  const y0 = gy + span / 2 - (entry.x + entry.w / 2);
  const T = (mx: number, my: number): [number, number] => [W + my, y0 + mx];
  // cut the gap in the bedroom's right wall
  const cut: [number, number, number, number][] = [];
  for (const w of plan.walls) {
    const [ax, ay, bx, by] = w;
    if (Math.abs(ax - W) < 0.02 && Math.abs(bx - W) < 0.02) {
      const lo = Math.min(ay, by), hi = Math.max(ay, by), g0 = gy + 0.05, g1 = gy + span - 0.05;
      if (g1 <= lo || g0 >= hi) { cut.push(w); continue; }
      if (g0 > lo) cut.push([W, lo, W, g0]);
      if (g1 < hi) cut.push([W, g1, W, hi]);
    } else cut.push(w);
  }
  plan.walls = cut;
  plan.doors.push({ x: W, y: gy + 0.05, w: span - 0.1, axis: 'y', label: 'SERVICE' });
  const base = plan.rooms.length;
  for (const r of mod.rooms) { const [a, b] = T(r.x, r.y); plan.rooms.push({ x: a, y: b, w: r.d, d: r.w, label: r.label }); }
  // every module compartment is a wet or service room except a balcony/kitchen with a window
  for (let i = base; i < plan.rooms.length; i++) plan.wet.add(i);
  for (const [ax, ay, bx, by] of wallsWithDoors(mod)) {
    // (the module's own entry wall is the bedroom's right wall: not doubled)
    if (Math.abs(ay) < 0.02 && Math.abs(by) < 0.02) continue;
    const [a, b] = T(ax, ay), [c, d] = T(bx, by); plan.walls.push([a, b, c, d]);
  }
  for (const d of mod.doors) if (d.label !== 'ENTRY') { const [a, b] = T(d.x, d.y); plan.doors.push({ x: a, y: b, w: d.w, axis: d.axis === 'x' ? 'y' : 'x', label: d.label }); }
  for (const [ax, ay, bx, by] of mod.windows) { const [a, b] = T(ax, ay), [c, d] = T(bx, by); plan.windows.push([a, b, c, d]); }
  for (const o of mod.objects) { const [a, b] = T(o.x, o.y); plan.objects.push({ ...o, x: a, y: b, w: o.d, d: o.w }); }
  return true;
}
/**
 * The filmed Vikings double's services (V2; vikings-modules.json, proposed fit): the wet area behind the bedroom's
 * "WET AREA" door on the entry wall (basin and curtained shower in one compartment, the WC behind its own partition and
 * door), and the balcony beyond the "BALCONY" door (tiled, solid parapet with a cap, the drying rack). Offsets are
 * game assumptions, as the pack says.
 */
function attachVikings(plan: Plan) {
  const [wet, bal] = (VIKINGS_MODULES as { modules: { id: string; width: number; length: number; objects: { type: string; x: number; y: number; w: number; d: number }[] }[] }).modules;
  const door = plan.doors.find((d) => d.label === 'WET AREA');
  if (door) {
    // the module's opening (its x 0.9..1.7) under the bedroom's wet-area door; fixtures on its far side
    const ox = door.x - 0.85, W = wet.width, D = wet.length;
    const base = plan.rooms.length;
    plan.rooms.push({ x: ox, y: -D, w: W, d: D, label: 'WASH AREA' });
    plan.wet.add(base);
    plan.walls.push([ox, 0, 0, 0], [ox, 0, ox, -D], [ox, -D, ox + W, -D], [ox + W, -D, ox + W, 0]);
    // the WC compartment: a partition and its door (stands open)
    const px = ox + 0.85;
    plan.walls.push([px, -0.95, px, -D]);
    plan.doors.push({ x: ox, y: -0.95, w: 0.85, axis: 'x', label: 'WC' });
    for (const o of wet.objects) plan.objects.push({ type: o.type as LayoutObject['type'], x: ox + o.x, y: -(o.y + o.d), w: o.w, d: o.d });
  }
  const bd = plan.doors.find((d) => d.label === 'BALCONY');
  if (bd) {
    const W = plan.l.width, y0 = 1.2, y1 = y0 + bal.length, x1 = W + bal.width;
    plan.rooms.push({ x: W, y: y0, w: bal.width, d: bal.length, label: 'BALCONY' });
    plan.walls.push([W, y0, x1, y0], [W, y1, x1, y1]);
    plan.parapets.push([x1, y0, x1, y1]);
    plan.balcony = { x0: W, x1, y0, y1, side: 'x1' };
    for (const o of bal.objects) plan.objects.push({ type: o.type as LayoutObject['type'], x: W + o.x, y: y0 + o.y, w: o.w, d: o.d });
  }
  plan.facade = { side: 'x1', at: bd ? W_OF(plan) + bal.width : W_OF(plan) };
}
const W_OF = (plan: Plan) => plan.l.width;
/**
 * A balcony for a category that has one (Evandy medium single, New Bani four): New Bani's own "balcony / kitchenette"
 * compartment opens as a balcony (its outer wall becomes a parapet, its service door a balcony door); otherwise a
 * 1.25 m balcony is added outside the back wall with a door at the end away from the window. Dimensions are working
 * values.
 */
function addBalcony(plan: Plan) {
  const l = plan.l, W = l.width, L = l.length;
  const own = plan.rooms.findIndex((r) => /BALCONY/.test(r.label));
  if (own >= 0) {
    const r = plan.rooms[own];
    plan.wet.delete(own);
    // the outer wall of the compartment becomes a parapet; its window goes
    const outer = (w: [number, number, number, number]) => Math.abs(w[1] - L) < 0.02 && Math.abs(w[3] - L) < 0.02;
    const next: [number, number, number, number][] = [];
    for (const w of plan.walls) {
      if (!outer(w)) { next.push(w); continue; }
      const lo = Math.min(w[0], w[2]), hi = Math.max(w[0], w[2]), a = r.x, b = r.x + r.w;
      if (hi <= a || lo >= b) { next.push(w); continue; }
      if (lo < a) next.push([lo, L, a, L]);
      if (hi > b) next.push([b, L, hi, L]);
      plan.parapets.push([Math.max(lo, a), L, Math.min(hi, b), L]);
    }
    plan.walls = next;
    plan.windows = plan.windows.filter(([x0, y0, x1]) => !(Math.abs(y0 - L) < 0.02 && Math.max(x0, x1) <= r.x + r.w + 0.01));
    const d = plan.doors.find((q) => q.label === 'SERVICE' && Math.abs(q.y - r.y) < 0.05);
    if (d) d.label = 'BALCONY';
    plan.balcony = { x0: r.x, x1: r.x + r.w, y0: r.y, y1: r.y + r.d, side: 'y1' };
    return;
  }
  const D = 1.25;
  // the door at the end of the back wall away from the window
  const win = plan.windows.find(([, y0, , y1]) => Math.abs(y0 - L) < 0.02 && Math.abs(y1 - L) < 0.02);
  const wl = win ? Math.min(win[0], win[2]) : W / 2, wr = win ? Math.max(win[0], win[2]) : W / 2;
  const dw = 0.85, dx = W - wr > wl ? Math.min(W - dw - 0.2, wr + 0.3) : Math.max(0.2, wl - 0.3 - dw);
  plan.doors.push({ x: dx, y: L, w: dw, axis: 'x', label: 'BALCONY' });
  plan.walls = wallsWithDoors({ walls: plan.walls, doors: [{ x: dx, y: L, w: dw, axis: 'x', label: 'BALCONY' }] });
  plan.rooms.push({ x: 0, y: L, w: W, d: D, label: 'BALCONY' });
  plan.walls.push([0, L, 0, L + D], [W, L, W, L + D]);
  plan.parapets.push([0, L + D, W, L + D]);
  plan.balcony = { x0: 0, x1: W, y0: L, y1: L + D, side: 'y1' };
  plan.facade = { side: 'y1', at: L + D };
}

/** Builds the room for an accommodation. Returns null when the category or its layout is missing (the caller keeps the
 *  player at the entrance and says so). */
export function buildRoom(acc: Accommodation): BuiltRoom | null {
  const c = categoryById(acc.categoryId), r = residenceById(acc.buildingId);
  if (!c || !r || c.unresolved) return null;
  const src = LAYOUTS[c.layout];
  if (!src) return null;
  const l = scaled(src, c.scale ?? 1);
  // facilities the category does not have are left out of the shell it shares
  const KITCHEN = new Set(['counter', 'sink', 'hob']), BATH = new Set(['shower', 'toilet', 'basin']);
  const objects = l.objects.filter((o) => (c.kitchen === 'private' || !KITCHEN.has(o.type)) && (c.bath === 'private' || !BATH.has(o.type)));
  const plan: Plan = { l, objects, walls: wallsWithDoors(l), doors: l.doors.map((d) => ({ ...d })), windows: [...l.windows], rooms: [...l.rooms], wet: new Set(), parapets: [], balcony: null, facade: { side: 'y1', at: l.length } };
  l.rooms.forEach((rm, i) => { if (/ENSUITE|BATH|SHOWER|WC|BASIN/.test(rm.label) && c.bath === 'private') plan.wet.add(i); });
  if (c.module === 'V2') attachVikings(plan);
  else if (c.module) attachModule(plan, LAYOUTS[c.module]);
  if (c.balcony && c.module !== 'V2') addBalcony(plan);
  // (a layout's own balcony door with no balcony for this category stays a plain open inner doorway)
  if (!plan.balcony) for (const d of plan.doors) if (d.label === 'BALCONY') d.label = 'SERVICE';
  const H = l.wall_height;
  const paintHex = PAINT[r.paint];
  const paint = std(paintHex, { roughness: 0.92 }), wetPaint = tileTexture('#eef0ee', '#cdd2cf', 8);
  const style: 'louvres' | 'curtains' = c.catalogue === 'ish' ? 'curtains' : 'louvres';
  const p: Part[] = [];
  const dyn: Dyn = { group: new THREE.Group(), ints: [] };
  const walk: WalkArea = { rects: [], segs: [], doors: [], boxes: [] };
  shell(p, dyn, plan, H, paint, wetPaint, style, walk);
  const nearWall = (x: number, y: number) => {
    const rm = plan.rooms.find((q) => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.d) ?? plan.rooms[0];
    const d = { x0: x - rm.x, x1: rm.x + rm.w - x, y0: y - rm.y, y1: rm.y + rm.d - y };
    const k = (Object.keys(d) as (keyof typeof d)[]).reduce((a, b) => (d[a] < d[b] ? a : b));
    return d[k] < 0.8 ? k : null;
  };
  for (const o of plan.objects) furniture(p, dyn, o, l, c, nearWall, H);
  // solid furniture for walking (a shower tray and ceiling fittings are not in the way)
  const SOLID = new Set(['bed', 'bunk', 'desk', 'chair', 'wardrobe', 'basin', 'toilet', 'counter', 'sink', 'fridge', 'sofa', 'hob', 'drying_rack']);
  for (const o of plan.objects) if (SOLID.has(o.type)) walk.boxes.push([o.x, o.y, o.x + o.w, o.y + o.d]);
  // an AC unit where the category has one, over the entry wall; a ceiling fan in the Diaspora rooms (observed)
  if (c.ac === 'with') p.push([pbox(l.width / 2 + 0.4, l.width / 2 + 1.3, 0.06, 0.32, 2.3, 2.6), std('#f4f4f2', { roughness: 0.4 })], [pbox(l.width / 2 + 0.45, l.width / 2 + 1.25, 0.3, 0.33, 2.33, 2.38), std('#c9cdd0')]);
  if ((c.catalogue === 'diaspora' || c.catalogue === 'diamond') && !plan.objects.some((o) => o.type === 'ceiling_fan')) ceilingFan(dyn, l.camera_anchor[0], l.camera_anchor[1] + 0.4, H, 0.62);
  const group = new THREE.Group();
  group.name = `room ${acc.roomId} (${c.layout})`;
  for (const m of mergeParts(p)) group.add(m);
  group.add(dyn.group);
  // lights: a ceiling panel and a warm point light in each indoor compartment (the balcony is lit by the day)
  for (const rm of plan.rooms) {
    if (/BALCONY/.test(rm.label) && plan.balcony) continue;
    const cx = rm.x + rm.w / 2, cy = rm.y + rm.d / 2;
    if (!plan.objects.some((o) => o.type === 'ceiling_light' && o.x >= rm.x && o.x <= rm.x + rm.w && o.y >= rm.y && o.y <= rm.y + rm.d)) group.add(new THREE.Mesh(new THREE.BoxGeometry(Math.min(0.9, rm.w * 0.4), 0.03, 0.25).translate(cx, H - 0.02, cy), mat('lamp', () => new THREE.MeshBasicMaterial({ color: '#fffbea' }))));
    const pl = new THREE.PointLight('#fff4e0', rm.w * rm.d > 6 ? 7 : 4, 9, 1.6); pl.position.set(cx, H - 0.25, cy); group.add(pl);
  }
  group.add(new THREE.AmbientLight('#ffffff', 0.55));
  group.position.copy(ROOM_ORIGIN);
  const W = (x: number, y: number, h = 0) => new THREE.Vector3(ROOM_ORIGIN.x + x, ROOM_ORIGIN.y + h, ROOM_ORIGIN.z + y);
  // the look-around views: the plan's anchor (looking in from the entry), then the other compartments of the unit
  const ca = l.camera_anchor, main = plan.rooms.find((q) => ca[0] >= q.x && ca[0] <= q.x + q.w && ca[1] >= q.y && ca[1] <= q.y + q.d) ?? plan.rooms[0];
  const views: RoomView[] = [{ label: main.label.toLowerCase().includes('outer') ? 'Outer room' : 'Room', pos: W(ca[0], ca[1], ca[2]), yaw: 0, bounds: [main.x, main.x + main.w, main.y, main.y + main.d] }];
  for (const q of plan.rooms) {
    if (q === main || q.w * q.d < 1.2) continue;
    const name = q.label.replace(/ - PROVISIONAL STUDY| - 1 PLACE/, '').toLowerCase();
    views.push({ label: (name.charAt(0).toUpperCase() + name.slice(1)).replace(/\bwc\b/i, 'WC').replace(/\bac\b/i, 'AC'), pos: W(q.x + q.w / 2, q.y + q.d / 2, 1.55), yaw: 0, bounds: [q.x, q.x + q.w, q.y, q.y + q.d] });
  }
  for (const v of views) v.bounds = [v.bounds[0] + ROOM_ORIGIN.x, v.bounds[1] + ROOM_ORIGIN.x, v.bounds[2] + ROOM_ORIGIN.z, v.bounds[3] + ROOM_ORIGIN.z];
  // the sleeping places, in bed order: each single, then each bunk's lower and upper deck
  const places: SleepPlace[] = [];
  for (const o of plan.objects) {
    if (o.type !== 'bed' && o.type !== 'bunk') continue;
    const along = o.d >= o.w ? 'z' : 'x', he = headEnd(o, l), head = he === 'y1' || he === 'x1' ? 1 : -1;
    const base = { x: o.x + o.w / 2, z: o.y + o.d / 2, along, head } as const;
    if (o.type === 'bed') places.push({ ...base, h: (/dark/.test(o.material ?? '') ? 0.36 : 0.42) + 0.16, upper: false, bed: places.length });
    else { places.push({ ...base, h: 0.58, upper: false, bed: places.length }); places.push({ ...base, h: 1.68, upper: true, bed: places.length }); }
  }
  // where the character arrives: just inside the entry door, clear of the furniture
  const sp = new THREE.Vector3(l.spawn[0], 0, l.spawn[1] + 0.9);
  const singles = plan.objects.filter((o) => o.type === 'bed').length, bunks = plan.objects.filter((o) => o.type === 'bunk').length;
  const f = plan.facade;
  const facade = f.side === 'y1' ? { x: l.width / 2, z: f.at, nx: 0, nz: 1 } : { x: f.at, z: l.length / 2, nx: 1, nz: 0 };
  return {
    group, spawn: W(sp.x, sp.z), spawnYaw: Math.PI, views, singles, bunks,
    wood: c.wood ?? (l.traditional_wood || plan.objects.some((o) => (o.type === 'bed' || o.type === 'bunk') && o.material === 'wood')), paint: paintHex, layout: l.id,
    walk, interactables: dyn.ints, places, facade, hasBalcony: !!plan.balcony, windowStyle: style,
    dispose() { group.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose(); }); group.removeFromParent(); },
  };
}
