// The abandoned concrete shell between the back of New Pent Block B and Evandy Hostel (the owner's aerials of
// 2026-10-17, pictures 3 and 4): the only structure in that open ground. Four storeys of bare reinforced-concrete frame
// left uncompleted - floor slabs on a grid of square columns, no walls, no roof but the top slab - round an overgrown
// courtyard, its outline the map's (osm relation 19263473, which matches picture 4 bar for bar: the north-west bar
// standing out north, the north bar running past the east bar, the south bar past the west bar, the east bar reaching
// further south). Old weathered concrete: grey, darkened in patches and streaked down the slab edges, rusty starter
// bars standing on the top slab, scrub and young trees growing in the courtyard and against the frame.
import * as THREE from 'three';
import { BUILDINGS } from './campusmap';
import { createSite, type Spec, type Style } from './blocks';
import { box, merge, type Part } from './modelkit';
import { concrete } from './concrete';
import { SOLIDS } from './solids';

type P2 = [number, number];
const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => { g.fillStyle = '#8f8c86'; g.fillRect(0, 0, 256, 512); } };
/** a point inside the shell's west bar */
const AT: P2 = [688, -1120];
const B = BUILDINGS.find((b) => AT[0] > b.minX && AT[0] < b.maxX && AT[1] > b.minZ && AT[1] < b.maxZ);
const O: P2 = B ? [(B.minX + B.maxX) / 2, (B.minZ + B.maxZ) / 2] : AT;
const ringOf = (a: Float32Array): P2[] => { const r: P2[] = []; for (let i = 0; i < a.length; i += 2) r.push([a[i] - O[0], a[i + 1] - O[1]]); return r; };
const inRing = (r: P2[], x: number, z: number) => { let o = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > z) !== (r[j][1] > z) && x < ((r[j][0] - r[i][0]) * (z - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) o = !o; return o; };
const distToRing = (r: P2[], x: number, z: number) => {
  let d = Infinity;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [ax, az] = r[j], [bx, bz] = r[i], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
    d = Math.min(d, Math.hypot(ax + dx * t - x, az + dz * t - z));
  }
  return d;
};
/** storey height and the four levels: the slabs at the first, second and third floors and the top slab */
const ST = 3.2, LEVELS = [1, 2, 3, 4].map((i) => i * ST);
const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

const shell: Spec = {
  name: 'Abandoned concrete shell', axis: [1, 0], origin: O, storey: ST, style: PLAIN, roofColor: '#8f8c86', fascia: '#8f8c86', pitch: 0,
  blocks: [], onGround: true,
  replaces: [AT],
  keep: B ? [[B.minX - O[0] - 1, B.maxX - O[0] + 1, B.minZ - O[1] - 1, B.maxZ - O[1] + 1]] : [],
  extras: (k) => {
    if (!B) return;
    const outer = ringOf(B.pts), holes = B.holes.map(ringOf);
    const inside = (x: number, z: number, m: number) => inRing(outer, x, z) && !holes.some((h) => inRing(h, x, z)) && distToRing(outer, x, z) > m && holes.every((h) => distToRing(h, x, z) > m);
    // the frame stands on the lowest ground under it
    let base = Infinity;
    for (const [x, z] of outer) base = Math.min(base, k.ground(x, z));
    const c: Part[] = [], stain: Part[] = [];
    // the slabs: the outline with its courtyard, 0.3 m thick, a ground slab barely above the earth
    const shape = new THREE.Shape(outer.map(([x, z]) => new THREE.Vector2(x, z)));
    for (const h of holes) shape.holes.push(new THREE.Path(h.map(([x, z]) => new THREE.Vector2(x, z))));
    const slab = (y: number, t: number) => new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false }).rotateX(Math.PI / 2).translate(0, base + y, 0);
    c.push([slab(0.15, 0.6), '#8a8781']);
    for (const y of LEVELS) c.push([slab(y, 0.3), '#918e88']);
    // the columns: a grid of 0.4 m square columns about 4.5 m apart over the whole plan, up to the top slab
    const b0 = new THREE.Box2(); for (const [x, z] of outer) b0.expandByPoint(new THREE.Vector2(x, z));
    const cols: P2[] = [];
    for (let x = b0.min.x + 0.45; x < b0.max.x; x += 4.5) for (let z = b0.min.y + 0.45; z < b0.max.y; z += 4.5) if (inside(x, z, 0.35)) cols.push([x, z]);
    cols.forEach(([x, z], i) => {
      c.push([box(x - 0.2, x + 0.2, base + 0.15, base + LEVELS[3] - 0.3, z - 0.2, z + 0.2), i % 7 === 3 ? '#7f7c76' : '#8d8a84']);
      SOLIDS.add(x + O[0], z + O[1], 0.32);
      // rusty starter bars left standing on the top slab where the next storey was to rise
      if (i % 3 === 0) for (const [dx, dz] of [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]]) stain.push([box(x + dx - 0.012, x + dx + 0.012, base + LEVELS[3], base + LEVELS[3] + 0.7 + rnd(i) * 0.4, z + dz - 0.012, z + dz + 0.012), '#6b4a36']);
    });
    // weathering: dark patches on the top slab (the dark blotches of the aerial), streaks down the slab edges
    for (let i = 0; i < 160; i++) {
      const x = b0.min.x + rnd(i) * (b0.max.x - b0.min.x), z = b0.min.y + rnd(i + 500) * (b0.max.y - b0.min.y);
      if (!inside(x, z, 0.6)) continue;
      const r = 0.8 + rnd(i + 900) * 1.8;
      stain.push([box(x - r, x + r, base + LEVELS[3] + 0.001, base + LEVELS[3] + 0.012, z - r * 0.8, z + r * 0.8), rnd(i + 70) < 0.5 ? '#5f5d58' : '#6c6a64']);
    }
    for (let i = 0; i < outer.length; i++) {
      const [ax, az] = outer[i], [bx, bz] = outer[(i + 1) % outer.length], len = Math.hypot(bx - ax, bz - az);
      const nx = (bz - az) / (len || 1), nz = -(bx - ax) / (len || 1);
      const out = inRing(outer, (ax + bx) / 2 + nx * 0.3, (az + bz) / 2 + nz * 0.3) ? -1 : 1;
      for (let s = 0.6; s < len - 0.4; s += 1.1 + rnd(i * 31 + s) * 1.6) {
        const x = ax + ((bx - ax) * s) / len + nx * out * 0.02, z = az + ((bz - az) * s) / len + nz * out * 0.02, w = 0.25 + rnd(s + i) * 0.5;
        for (const y of LEVELS) if (rnd(i + s * 3 + y) < 0.6) stain.push([box(x - w * Math.abs(nz) - 0.02, x + w * Math.abs(nz) + 0.02, base + y - 0.32 - rnd(s * y) * 1.4, base + y - 0.3, z - w * Math.abs(nx) - 0.02, z + w * Math.abs(nx) + 0.02), '#5c5a55']);
      }
    }
    const m = new THREE.Mesh(merge(c), concrete(0.4)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    k.plain.push(...stain);
    // scrub and young trees in the overgrown courtyard and against the frame (pictures 3 and 4)
    const greens = ['#3f6b2c', '#4c7a33', '#355f27', '#56853a'];
    for (const h of holes) {
      const hb = new THREE.Box2(); for (const [x, z] of h) hb.expandByPoint(new THREE.Vector2(x, z));
      for (let i = 0; i < 70; i++) {
        const x = hb.min.x + 1 + rnd(i + 40) * (hb.max.x - hb.min.x - 2), z = hb.min.y + 1 + rnd(i + 80) * (hb.max.y - hb.min.y - 2);
        if (!inRing(h, x, z)) continue;
        const y = k.ground(x, z), tree = i % 9 === 0, r = tree ? 1.8 : 0.6 + rnd(i) * 0.8;
        if (tree) { k.plain.push([new THREE.CylinderGeometry(0.1, 0.16, 3.5, 6).translate(x, y + 1.75, z), '#5b4636']); SOLIDS.add(x + O[0], z + O[1], 0.2); }
        k.plain.push([new THREE.IcosahedronGeometry(r, 0).scale(1, 0.7, 1).translate(x, y + (tree ? 4.2 : r * 0.5), z), greens[i % 4]]);
      }
    }
  },
};

/** the abandoned concrete shell behind New Pent Block B */
export const shellSite = createSite('abandoned-shell', [shell]);
