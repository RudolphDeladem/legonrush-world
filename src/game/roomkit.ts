// Builds one allocated room interior from the atlas's layout (residence.ts LAYOUTS) and the selected category: full
// height walls with the doors and windows of the plan, a ceiling, tiled floors, the furniture of the plan, the
// category's service module, paint and lights. Plan x runs across the room, plan y into it (the entry wall at y 0),
// plan z is height; in the game x is x, plan y is +z, height is y. The room is built away from the campus (ROOM_ORIGIN)
// and only one room exists at a time: the player's own (Volume A section 16, privacy). Windows show frosted daylight
// behind louvres or bars, never a view into another room.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LAYOUTS, PAINT, categoryById, residenceById, type Accommodation, type Layout, type LayoutObject, type RoomCategory } from './residence';

/** where the room is built: far outside the campus, so nothing of the campus can be seen or reached from it */
export const ROOM_ORIGIN = new THREE.Vector3(30000, 0, 30000);
const WALL_T = 0.12, DOOR_H = 2.1, SILL = 0.95, HEAD = 2.15;

export interface RoomView { label: string; pos: THREE.Vector3; yaw: number; bounds: [number, number, number, number] }
export interface BuiltRoom {
  group: THREE.Group;
  /** where the character stands on arrival (world), and the way they face */
  spawn: THREE.Vector3; spawnYaw: number;
  /** the look-around anchors: the plan's camera anchor first, then each other compartment of the unit */
  views: RoomView[];
  /** counts for the acceptance checks */
  singles: number; bunks: number; wood: boolean; paint: string;
  layout: string;
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

// ---------- furniture ----------
/** which end of a bed or bunk is the head: the end against the nearer wall across its length */
function headEnd(o: LayoutObject, l: Layout) {
  const alongY = o.d >= o.w;
  if (alongY) return o.y < l.length - (o.y + o.d) ? 'y0' : 'y1';
  return o.x < l.width - (o.x + o.w) ? 'x0' : 'x1';
}
function bed(p: Part[], o: LayoutObject, l: Layout, wood: boolean, bunk: boolean, yellow: boolean) {
  const frame = std(wood ? WOOD : bunk && yellow ? SILVER : METAL, wood ? { roughness: 0.7 } : { metalness: 0.5, roughness: 0.4 });
  const x0 = o.x, x1 = o.x + o.w, y0 = o.y, y1 = o.y + o.d, alongY = o.d >= o.w, he = headEnd(o, l);
  const decks = bunk ? [0.42, 1.52] : [0.42];
  const top = bunk ? 1.85 : wood ? 0.85 : 0.7;
  const r = wood ? 0.035 : 0.025;
  // corner posts (square timber or round tube)
  for (const [px, py] of [[x0 + r, y0 + r], [x1 - r, y0 + r], [x0 + r, y1 - r], [x1 - r, y1 - r]]) p.push([wood ? pbox(px - r, px + r, py - r, py + r, 0, top) : cyl(r, 0, top, px, py), frame]);
  for (const h of decks) {
    // the deck frame rails, the base, the mattress and a folded sheet, a pillow at the head
    p.push([pbox(x0, x1, y0, y0 + 0.04, h - 0.1, h), frame], [pbox(x0, x1, y1 - 0.04, y1, h - 0.1, h), frame], [pbox(x0, x0 + 0.04, y0, y1, h - 0.1, h), frame], [pbox(x1 - 0.04, x1, y0, y1, h - 0.1, h), frame]);
    p.push([pbox(x0 + 0.03, x1 - 0.03, y0 + 0.03, y1 - 0.03, h - 0.04, h), std(wood ? WOOD_DARK : '#6d7176')]);
    p.push([pbox(x0 + 0.05, x1 - 0.05, y0 + 0.05, y1 - 0.05, h, h + 0.16), std(yellow ? '#5a3a35' : MATTRESS, { roughness: 0.95 })]);
    const pil = 0.42;
    if (he === 'y0') p.push([pbox(x0 + 0.12, x1 - 0.12, y0 + 0.08, y0 + 0.08 + pil, h + 0.16, h + 0.27), std(SHEET, { roughness: 0.95 })]);
    if (he === 'y1') p.push([pbox(x0 + 0.12, x1 - 0.12, y1 - 0.08 - pil, y1 - 0.08, h + 0.16, h + 0.27), std(SHEET, { roughness: 0.95 })]);
    if (he === 'x0') p.push([pbox(x0 + 0.08, x0 + 0.08 + pil, y0 + 0.12, y1 - 0.12, h + 0.16, h + 0.27), std(SHEET, { roughness: 0.95 })]);
    if (he === 'x1') p.push([pbox(x1 - 0.08 - pil, x1 - 0.08, y0 + 0.12, y1 - 0.12, h + 0.16, h + 0.27), std(SHEET, { roughness: 0.95 })]);
    // the head and foot panels (a wooden headboard; Diamond Jubilee's yellow panels)
    const panel = yellow ? std('#d9a227', { roughness: 0.6 }) : frame;
    const ph0 = h + 0.05, ph1 = h + (bunk ? 0.38 : wood ? 0.45 : 0.3);
    if (alongY) { p.push([pbox(x0 + 0.03, x1 - 0.03, y0, y0 + 0.03, ph0, ph1), panel], [pbox(x0 + 0.03, x1 - 0.03, y1 - 0.03, y1, ph0, ph1), panel]); }
    else { p.push([pbox(x0, x0 + 0.03, y0 + 0.03, y1 - 0.03, ph0, ph1), panel], [pbox(x1 - 0.03, x1, y0 + 0.03, y1 - 0.03, ph0, ph1), panel]); }
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
function furniture(p: Part[], o: LayoutObject, l: Layout, c: RoomCategory, nearWall: (x: number, y: number) => 'x0' | 'x1' | 'y0' | 'y1' | null) {
  const x0 = o.x, x1 = o.x + o.w, y0 = o.y, y1 = o.y + o.d, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const wood = std(WOOD, { roughness: 0.7 }), steel = std(METAL, { metalness: 0.5, roughness: 0.45 }), white = std('#f2f2ef', { roughness: 0.3 }), chrome = std('#c8ccd0', { metalness: 0.8, roughness: 0.25 });
  switch (o.type) {
    case 'bed': case 'bunk': {
      const isWood = c.wood ?? (o.material === 'wood' || l.traditional_wood);
      bed(p, o, l, isWood, o.type === 'bunk', c.catalogue === 'diamond');
      break;
    }
    case 'desk': {
      p.push([pbox(x0, x1, y0, y1, 0.72, 0.76), wood]);
      for (const [px, py] of [[x0 + 0.04, y0 + 0.04], [x1 - 0.04, y0 + 0.04], [x0 + 0.04, y1 - 0.04], [x1 - 0.04, y1 - 0.04]]) p.push([cyl(0.018, 0, 0.72, px, py), steel]);
      // the high shelf on the wall behind it (Pent, Diaspora), unless a window is there
      const w0 = nearWall(cx, cy), clash = l.windows.some(([a, , b]) => Math.min(a, b) < x1 + 0.3 && Math.max(a, b) > x0 - 0.3);
      const w = clash ? null : w0;
      if (w === 'y1') p.push([pbox(x0, x1, l.length - 0.3, l.length - WALL_T / 2, 1.55, 1.58), wood]);
      if (w === 'y0') p.push([pbox(x0, x1, WALL_T / 2, 0.3, 1.55, 1.58), wood]);
      break;
    }
    case 'chair': {
      p.push([pbox(x0 + 0.02, x1 - 0.02, y0 + 0.02, y1 - 0.02, 0.43, 0.47), std('#b8864f', { roughness: 0.7 })]);
      for (const [px, py] of [[x0 + 0.04, y0 + 0.04], [x1 - 0.04, y0 + 0.04], [x0 + 0.04, y1 - 0.04], [x1 - 0.04, y1 - 0.04]]) p.push([cyl(0.012, 0, 0.45, px, py), steel]);
      // the back away from the desk (the desk is the nearer of the plan's end walls)
      const back = cy < l.length / 2 ? y0 : y1 - 0.03;
      p.push([pbox(x0 + 0.03, x1 - 0.03, back, back + 0.03, 0.47, 0.88), std('#b8864f', { roughness: 0.7 })]);
      break;
    }
    case 'wardrobe': {
      p.push([pbox(x0, x1, y0, y1, 0, 1.95), wood]);
      // the door faces: the long side away from the wall
      const w = nearWall(cx, cy), n = Math.max(1, Math.round(Math.max(o.w, o.d) / 0.55));
      const dark = std(WOOD_DARK);
      if (w === 'y0' || w === 'y1') {
        const fy = w === 'y0' ? y1 : y0, s = w === 'y0' ? 1 : -1;
        for (let i = 1; i < n; i++) { const x = x0 + (o.w * i) / n; p.push([pbox(x - 0.006, x + 0.006, fy - 0.004 * s, fy + 0.004 * s, 0.05, 1.9), dark]); }
        for (let i = 0; i < n; i++) { const x = x0 + (o.w * (i + 0.5)) / n + (i % 2 ? -1 : 1) * 0.08; p.push([pbox(x - 0.01, x + 0.01, fy, fy + 0.03 * s, 0.95, 1.15), chrome]); }
      } else {
        const fx = w === 'x0' ? x1 : x0, s = w === 'x0' ? 1 : -1;
        for (let i = 1; i < n; i++) { const y = y0 + (o.d * i) / n; p.push([pbox(fx - 0.004 * s, fx + 0.004 * s, y - 0.006, y + 0.006, 0.05, 1.9), dark]); }
        for (let i = 0; i < n; i++) { const y = y0 + (o.d * (i + 0.5)) / n + (i % 2 ? -1 : 1) * 0.08; p.push([pbox(fx, fx + 0.03 * s, y - 0.01, y + 0.01, 0.95, 1.15), chrome]); }
      }
      break;
    }
    case 'basin': p.push([pbox(x0, x1, y0, y1, 0.78, 0.86), white], [cyl(0.06, 0, 0.78, cx, cy), white], [pbox(cx - 0.02, cx + 0.02, cy - 0.02, cy + 0.02, 0.86, 1.0), chrome]); break;
    case 'toilet': p.push([pbox(x0 + 0.1, x1 - 0.1, y0 + 0.1, y1 - 0.15, 0, 0.42), white], [pbox(x0 + 0.05, x1 - 0.05, y0 + 0.05, y1 - 0.1, 0.42, 0.46), white]);
      { const w = nearWall(cx, cy); if (w) { const [a0, a1, b0, b1] = w === 'y0' ? [x0 + 0.08, x1 - 0.08, y0, y0 + 0.18] : w === 'y1' ? [x0 + 0.08, x1 - 0.08, y1 - 0.18, y1] : w === 'x0' ? [x0, x0 + 0.18, y0 + 0.08, y1 - 0.08] : [x1 - 0.18, x1, y0 + 0.08, y1 - 0.08]; p.push([pbox(a0, a1, b0, b1, 0.4, 0.8), white]); } }
      break;
    case 'shower': {
      p.push([pbox(x0, x1, y0, y1, 0, 0.05), std('#cfd8da', { roughness: 0.3 })]);
      const w = nearWall(cx, cy) ?? 'y1', [hx, hy] = w === 'y1' ? [cx, y1 - 0.1] : w === 'y0' ? [cx, y0 + 0.1] : w === 'x0' ? [x0 + 0.1, cy] : [x1 - 0.1, cy];
      p.push([cyl(0.012, 0.05, 2.0, hx, hy), chrome], [cyl(0.07, 1.98, 2.02, hx, hy), chrome]);
      // a curtain rail and a curtain along the open side (P1)
      const side = w === 'y1' || w === 'y0' ? (w === 'y1' ? y0 : y1) : (w === 'x1' ? x0 : x1);
      if (w === 'y1' || w === 'y0') p.push([pbox(x0, x1, side - 0.01, side + 0.01, 1.98, 2.0), chrome], [pbox(x0 + 0.05, x0 + 0.45, side - 0.03, side + 0.03, 0.4, 1.95), std('#7fb3c9', { roughness: 0.9, side: THREE.DoubleSide })]);
      else p.push([pbox(side - 0.01, side + 0.01, y0, y1, 1.98, 2.0), chrome], [pbox(side - 0.03, side + 0.03, y0 + 0.05, y0 + 0.45, 0.4, 1.95), std('#7fb3c9', { roughness: 0.9, side: THREE.DoubleSide })]);
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
  }
}

// ---------- the shell ----------
interface Plan { l: Layout; objects: LayoutObject[]; walls: [number, number, number, number][]; doors: Layout['doors']; windows: Layout['windows']; rooms: Layout['rooms']; wet: Set<number> }

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
function wallsWithDoors(l: Layout) {
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

function shell(p: Part[], plan: Plan, H: number, paint: THREE.Material, wetPaint: THREE.Material) {
  const { l } = plan;
  // the floors: room tiles; wet rooms in small pale tiles
  plan.rooms.forEach((r, i) => {
    const wet = plan.wet.has(i), tm = tileTexture(wet ? '#d9dcd8' : '#d8d2c4', wet ? '#b9bdb9' : '#b8b0a0', wet ? 10 : 6);
    const g = pbox(r.x, r.x + r.w, r.y, r.y + r.d, -0.05, 0), uv = g.attributes.uv as THREE.BufferAttribute, pos = g.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, pos.getX(k) / (wet ? 1.2 : 2.4), pos.getZ(k) / (wet ? 1.2 : 2.4));
    p.push([g, tm]);
    // the ceiling
    p.push([pbox(r.x, r.x + r.w, r.y, r.y + r.d, H, H + 0.05), std('#f7f7f4', { roughness: 0.9 })]);
  });
  // a skirting band and the walls (with the windows cut out of them)
  const roomOf = (x: number, y: number) => plan.rooms.findIndex((r) => x >= r.x - 0.2 && x <= r.x + r.w + 0.2 && y >= r.y - 0.2 && y <= r.y + r.d + 0.2);
  for (const [ax, ay, bx, by] of plan.walls) {
    const L = Math.hypot(bx - ax, by - ay); if (L < 0.01) continue;
    const ux = (bx - ax) / L, uy = (by - ay) / L;
    // window spans on this wall
    const spans: [number, number][] = [];
    for (const [wx0, wy0, wx1, wy1] of plan.windows) {
      const cr = (px: number, py: number) => Math.abs(ux * (py - ay) - uy * (px - ax));
      if (cr(wx0, wy0) > 0.03 || cr(wx1, wy1) > 0.03) continue;
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
      windowOpening(p, ax + ux * s0, ay + uy * s0, ax + ux * s1, ay + uy * s1, ux, uy);
      t = s1;
    }
    if (t < L) seg(t, L, 0, H);
  }
  // doors: lintels over every opening; the entry door closed (the corridor beyond is never shown), inner doors open
  for (const d of plan.doors) {
    const [x0, y0, x1, y1] = d.axis === 'x' ? [d.x, d.y, d.x + d.w, d.y] : [d.x, d.y, d.x, d.y + d.w];
    const L = d.w, ux = (x1 - x0) / L, uy = (y1 - y0) / L;
    const lin = new THREE.BoxGeometry(L, H - DOOR_H, WALL_T).rotateY(-Math.atan2(uy, ux)).translate((x0 + x1) / 2, (DOOR_H + H) / 2, (y0 + y1) / 2);
    const mid = roomOf((x0 + x1) / 2 + uy * 0.3, (y0 + y1) / 2 - ux * 0.3);
    p.push([lin, plan.wet.has(mid) ? wetPaint : paint]);
    // the frame
    const frame = std('#4a2e1c', { roughness: 0.6 });
    for (const [px, py] of [[x0, y0], [x1, y1]]) p.push([new THREE.BoxGeometry(0.06, DOOR_H, WALL_T + 0.04).rotateY(-Math.atan2(uy, ux)).translate(px, DOOR_H / 2, py), frame]);
    const leaf = std(d.label === 'ENTRY' ? '#5a3522' : '#6b4a33', { roughness: 0.6 });
    if (d.label === 'ENTRY') {
      p.push([new THREE.BoxGeometry(L - 0.04, DOOR_H - 0.02, 0.045).rotateY(-Math.atan2(uy, ux)).translate((x0 + x1) / 2, DOOR_H / 2, (y0 + y1) / 2), leaf]);
      const hx = x0 + ux * (L - 0.12), hy = y0 + uy * (L - 0.12);
      p.push([new THREE.BoxGeometry(0.03, 0.03, 0.14).rotateY(-Math.atan2(uy, ux)).translate(hx, 1.0, hy), std('#c8ccd0', { metalness: 0.8, roughness: 0.25 })]);
    } else {
      // swung open against the wall, into the inner compartment
      const g = new THREE.BoxGeometry(0.04, DOOR_H - 0.02, L - 0.04).translate(0, DOOR_H / 2, (L - 0.04) / 2);
      g.rotateY(-Math.atan2(uy, ux)).translate(x0, 0, y0);
      p.push([g, leaf]);
    }
  }
}
/** a window opening: frosted daylight behind glass louvres in a dark frame (the louvre language of the references) */
function windowOpening(p: Part[], x0: number, y0: number, x1: number, y1: number, ux: number, uy: number) {
  const L = Math.hypot(x1 - x0, y1 - y0), a = -Math.atan2(uy, ux), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const glow = mat('daylight', () => new THREE.MeshBasicMaterial({ color: '#eef4fa' }));
  p.push([new THREE.BoxGeometry(L, HEAD - SILL, 0.02).rotateY(a).translate(cx, (SILL + HEAD) / 2, cy), glow]);
  const frame = std('#2b2d30', { roughness: 0.5 });
  p.push([new THREE.BoxGeometry(L, 0.05, WALL_T + 0.02).rotateY(a).translate(cx, SILL, cy), frame], [new THREE.BoxGeometry(L, 0.05, WALL_T + 0.02).rotateY(a).translate(cx, HEAD, cy), frame]);
  for (const t of [0, 0.5, 1]) { const px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t; p.push([new THREE.BoxGeometry(0.05, HEAD - SILL, WALL_T + 0.02).rotateY(a).translate(px, (SILL + HEAD) / 2, py), frame]); }
  const slat = std('#c9d3d9', { roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.55 });
  for (let h = SILL + 0.1; h < HEAD - 0.05; h += 0.13) p.push([new THREE.BoxGeometry(L - 0.06, 0.012, 0.09).rotateX(0.5).rotateY(a).translate(cx, h, cy), slat]);
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
  const plan: Plan = { l, objects, walls: wallsWithDoors(l), doors: [...l.doors], windows: [...l.windows], rooms: [...l.rooms], wet: new Set() };
  l.rooms.forEach((rm, i) => { if (/ENSUITE|BATH|SHOWER|WC|BASIN/.test(rm.label) && c.bath === 'private') plan.wet.add(i); });
  if (c.module) attachModule(plan, LAYOUTS[c.module]);
  const H = l.wall_height;
  const paintHex = PAINT[r.paint];
  const paint = std(paintHex, { roughness: 0.92 }), wetPaint = tileTexture('#eef0ee', '#cdd2cf', 8);
  const p: Part[] = [];
  shell(p, plan, H, paint, wetPaint);
  const nearWall = (x: number, y: number) => {
    const rm = plan.rooms.find((q) => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.d) ?? plan.rooms[0];
    const d = { x0: x - rm.x, x1: rm.x + rm.w - x, y0: y - rm.y, y1: rm.y + rm.d - y };
    const k = (Object.keys(d) as (keyof typeof d)[]).reduce((a, b) => (d[a] < d[b] ? a : b));
    return d[k] < 0.8 ? k : null;
  };
  for (const o of plan.objects) furniture(p, o, l, c, nearWall);
  // an AC unit where the category has one, over the entry wall; a ceiling fan in the Diaspora rooms (observed)
  if (c.ac === 'with') p.push([pbox(l.width / 2 + 0.4, l.width / 2 + 1.3, 0.06, 0.32, 2.3, 2.6), std('#f4f4f2', { roughness: 0.4 })], [pbox(l.width / 2 + 0.45, l.width / 2 + 1.25, 0.3, 0.33, 2.33, 2.38), std('#c9cdd0')]);
  const group = new THREE.Group();
  group.name = `room ${acc.roomId} (${c.layout})`;
  for (const m of mergeParts(p)) group.add(m);
  if (c.catalogue === 'diaspora' || c.catalogue === 'diamond') {
    const fan = new THREE.Group(); fan.name = 'fan';
    fan.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6).translate(0, -0.2, 0), std('#e8e8e4')), new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 12).translate(0, -0.42, 0), std('#e8e8e4')));
    for (let i = 0; i < 3; i++) fan.add(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.012, 0.11).translate(0.38, -0.45, 0).rotateY((i * Math.PI * 2) / 3), std('#ece9e2')));
    fan.position.set(l.camera_anchor[0], H, l.camera_anchor[1] + 0.4);
    group.add(fan);
  }
  // lights: a ceiling panel and a warm point light in each compartment
  for (const rm of plan.rooms) {
    const cx = rm.x + rm.w / 2, cy = rm.y + rm.d / 2;
    group.add(new THREE.Mesh(new THREE.BoxGeometry(Math.min(0.9, rm.w * 0.4), 0.03, 0.25).translate(cx, H - 0.02, cy), mat('lamp', () => new THREE.MeshBasicMaterial({ color: '#fffbea' }))));
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
    views.push({ label: name.charAt(0).toUpperCase() + name.slice(1), pos: W(q.x + q.w / 2, q.y + q.d / 2, 1.55), yaw: 0, bounds: [q.x, q.x + q.w, q.y, q.y + q.d] });
  }
  for (const v of views) v.bounds = [v.bounds[0] + ROOM_ORIGIN.x, v.bounds[1] + ROOM_ORIGIN.x, v.bounds[2] + ROOM_ORIGIN.z, v.bounds[3] + ROOM_ORIGIN.z];
  const singles = plan.objects.filter((o) => o.type === 'bed').length, bunks = plan.objects.filter((o) => o.type === 'bunk').length;
  return {
    group, spawn: W(l.spawn[0], l.spawn[1] + 0.9), spawnYaw: Math.PI, views, singles, bunks,
    wood: c.wood ?? (l.traditional_wood || plan.objects.some((o) => (o.type === 'bed' || o.type === 'bunk') && o.material === 'wood')), paint: paintHex, layout: l.id,
    dispose() { group.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose(); }); group.removeFromParent(); },
  };
}
