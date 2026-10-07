// The Legon Hall and Akuafo Hall annexes either side of the Athletic Oval, from the owner's photos
// and top views (block engine: blocks.ts).
//
// Legon Annex A and B, and Akuafo Annex A and B: one design, six storeys. A long slab with open
// access galleries (balconies with railings, floors 2 to 6) along its north face, and a shorter tower
// of the same height against that face holding the stairs, plain with slit windows; flat roofs.
// - Legon's two face the same way (north): the entrance is on the ground floor at the east end of the
//   gallery face (owner's blue marks), the railings dark grey.
// - Akuafo's face each other across their courts: A's entrance on its south face, B's on the north face
//   of its stair tower, both in line with the tower (owner's photo); white with blue piers and teal
//   railings (owner's photo); the slab's ground floor is shops; billboards on the west ends.
//
// Akuafo Annex C and D: four storeys, facing each other across a lawn: cream with blue window
// panels and white gallery slabs on the court side, red tile hip roofs; each has a wing on its outer
// side (D's has a plain white front and water tanks). Their entrances face each other in the middle of
// the court sides (owner's blue mark on C).
//
// Legon Annex C (the Graduate Hostel) west of Legon's A and B: two storeys, a long block with wings on
// its west side, dark roofs; its gate on the east face (owner's blue mark).
import * as THREE from 'three';
import { BUILDINGS } from './campusmap';
import { WHITE, box } from './modelkit';
import { PL, createSite, render, slab, window_, type Block, type Kit, type Spec, type Style } from './blocks';
import { rectsOf, type Rect } from './rectilinear';

const ST = 3.1;
/** the gallery face: doors and windows set back behind the walkway (the railings are modelled) */
const gallery = (frame: string, door: string): Style => ({
  bay: 3.6,
  up: [[150, 40, 70, 150]],
  ground: [[150, 256 + 40, 70, 150]],
  draw: (g) => {
    render(g, '#d9d8d2');
    for (const y0 of [0, 256]) {
      g.fillStyle = '#9b9a94'; g.fillRect(0, y0, 256, 26);
      g.fillStyle = door; g.fillRect(30, y0 + 50, 70, 190);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(30, y0 + 50, 70, 8);
      window_(g, [150, y0 + 40, 70, 150], frame, 2, 0.3);
    }
  },
});
const LEGON_GALLERY = gallery('#3e4248', '#4a4f57');
const AKUAFO_GALLERY = gallery('#2f6f73', '#2d4f8a');
/** the plain faces: white render, a few small windows */
const PLAIN_WALL: Style = {
  bay: 4.5,
  up: [[96, 90, 64, 64]],
  ground: [[96, 256 + 90, 64, 64]],
  draw: (g) => {
    render(g, '#f3f2ee');
    for (const y0 of [0, 256]) window_(g, [96, y0 + 90, 64, 64], '#e8e8e4', 1, 0);
  },
};
/** the stair towers: slit windows (owner's photos) */
const STAIR: Style = {
  bay: 4.0,
  up: [[40, 110, 176, 22]],
  ground: [[40, 256 + 110, 176, 22]],
  draw: (g) => {
    render(g, '#f5f4f0');
    for (const y0 of [0, 256]) { g.fillStyle = '#2b2f36'; g.fillRect(40, y0 + 110, 176, 22); g.fillStyle = '#e0ded6'; g.fillRect(0, y0 + 236, 256, 6); }
  },
};
/** Akuafo A and B's ground floor: shop fronts with shutters and signs */
const SHOPS: Style = {
  bay: 4.0,
  up: [],
  ground: [[24, 256 + 70, 208, 170]],
  draw: (g) => {
    render(g, '#f3f2ee');
    g.fillStyle = '#c0392b'; g.fillRect(24, 256 + 40, 100, 26);
    g.fillStyle = '#1f6fb8'; g.fillRect(132, 256 + 40, 100, 26);
    g.fillStyle = '#5b5f66'; g.fillRect(24, 256 + 70, 208, 170);
    g.fillStyle = '#80848b'; for (let y = 256 + 74; y < 256 + 240; y += 10) g.fillRect(24, y, 208, 3);
  },
};
/** Akuafo C and D: cream walls, blue window panels (owner's photo) */
const CD_FACE: Style = {
  bay: 3.4,
  up: [[60, 70, 136, 110]],
  ground: [[60, 256 + 70, 136, 110]],
  draw: (g) => {
    render(g, '#efdcae');
    for (const y0 of [0, 256]) {
      g.fillStyle = '#f4f1e8'; g.fillRect(0, y0 + 210, 256, 46);
      g.fillStyle = '#2b5fa8'; g.fillRect(60, y0 + 70, 40, 110);
      window_(g, [110, y0 + 70, 86, 110], '#f4f1e8', 2, 0);
    }
  },
};
/** Legon Annex C: white render, dark windows */
const C_FACE: Style = {
  bay: 3.2,
  up: [[80, 60, 96, 110]],
  ground: [[80, 256 + 64, 96, 110]],
  draw: (g) => {
    render(g, '#f2f1ec');
    window_(g, [80, 60, 96, 110], '#d9d8d2', 2, 0.3);
    slab(g, 238, 18);
    window_(g, [80, 256 + 64, 96, 110], '#d9d8d2', 2, 0.3);
  },
};

const B = (r: Rect, o: [number, number], floors: number, extra: Partial<Block> = {}): Block =>
  ({ x0: r[0] - o[0], x1: r[1] - o[0], z0: r[2] - o[1], z1: r[3] - o[1], floors, ...extra });

/** galleries (floors 2 to 6) along a slab's north face, x0..x1 at z (model frame), railings in `rail` */
function galleries(k: Kit, x0: number, x1: number, z: number, floors: number, rail: string, piers: string) {
  for (let f = 1; f < floors; f++) {
    const y = PL + f * ST;
    k.plain.push([box(x0, x1, y - 0.18, y, z - 1.6, z), '#e8e7e2']);
    k.plain.push([box(x0, x1, y, y + 1.0, z - 1.66, z - 1.58), rail]);
    k.plain.push([box(x0, x1, y + 0.95, y + 1.08, z - 1.7, z - 1.55), '#e8e7e2']);
  }
  for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / Math.max(1, Math.round((x1 - x0) / 4.5))) k.plain.push([box(x - 0.18, x + 0.18, PL, PL + floors * ST, z - 1.7, z - 1.4), piers]);
}

interface Tall { name: string; slab: Rect; tower: Rect; door: [number, number]; doorFace: 'north' | 'south'; rail: string; piers: string; gallery: Style; shops: boolean; billboard?: [string, string] }
/** one of the six-storey annexes: the gallery slab and its stair tower */
function tall(t: Tall): Spec {
  const o: [number, number] = [(t.slab[0] + t.slab[1]) / 2, (t.slab[2] + t.slab[3]) / 2];
  const F = 6;
  return {
    name: t.name, axis: [1, 0], origin: o, storey: ST, style: PLAIN_WALL, roofColor: '#c9c3b5', fascia: '#e8e7e2', pitch: 0.1,
    replaces: [o, [(t.tower[0] + t.tower[1]) / 2, (t.tower[2] + t.tower[3]) / 2]],
    blocks: [
      B(t.slab, o, F, { roof: 'flat', faces: { z0: t.gallery }, ...(t.shops && { floorStyle: { 0: SHOPS } }) }),
      B(t.tower, o, F, { roof: 'flat', faces: { z0: STAIR, z1: STAIR, x0: STAIR, x1: STAIR } }),
    ],
    keep: [],
    extras: (k) => {
      const [sx0, sx1, sz0] = [t.slab[0] - o[0], t.slab[1] - o[0], t.slab[2] - o[1]];
      const [tx0, tx1] = [t.tower[0] - o[0], t.tower[1] - o[0]];
      // the galleries either side of the tower
      if (tx0 - sx0 > 1) galleries(k, sx0, tx0, sz0, F, t.rail, t.piers);
      if (sx1 - tx1 > 1) galleries(k, tx1, sx1, sz0, F, t.rail, t.piers);
      // the low pale roofs, a parapet, and the stair tower's roof hut
      const top = PL + F * ST + 0.4;
      k.plain.push([box(sx0, sx1, top, top + 0.5, t.slab[2] - o[1], t.slab[3] - o[1]), '#d8cfb8']);
      const tz0 = t.tower[2] - o[1], tz1 = t.tower[3] - o[1];
      k.plain.push([box(tx0 + 1, tx0 + 4, top, top + 2.4, tz0 + 1, tz0 + 4), WHITE]);
      // the entrance on the ground floor (owner's blue marks)
      const [dx, dz] = [t.door[0] - o[0], t.door[1] - o[1]], s = t.doorFace === 'north' ? -1 : 1;
      k.plain.push([box(dx - 1.4, dx + 1.4, PL, PL + 2.6, dz - 0.05 * s - 0.03, dz + 0.05 * s + 0.03), '#23262b']);
      k.plain.push([box(dx - 2, dx + 2, PL + 2.7, PL + 2.9, Math.min(dz, dz + s * 1.6), Math.max(dz, dz + s * 1.6)), '#e8e7e2']);
      k.plain.push([box(dx - 2.2, dx + 2.2, 0, PL, Math.min(dz, dz + s * 2.2), Math.max(dz, dz + s * 2.2)), '#c9c3b5']);
      // a billboard on the west end (owner's photos)
      if (t.billboard) {
        const [a, b] = t.billboard;
        k.plain.push([box(sx0 - 0.08, sx0, PL + 0.6 * ST, PL + 4.2 * ST, -2.6, 2.6), a]);
        k.plain.push([box(sx0 - 0.1, sx0 - 0.07, PL + 1.2 * ST, PL + 3.6 * ST, -1.6, 1.6), b]);
      }
    },
  };
}

// ---------- Akuafo Annex C and D ----------
function courtBlock(name: string, slabR: Rect, wing: Rect, door: [number, number], courtFace: 'x0' | 'x1', tanks: boolean): Spec {
  const o: [number, number] = [(slabR[0] + slabR[1]) / 2, (slabR[2] + slabR[3]) / 2];
  const F = 4;
  return {
    name, axis: [1, 0], origin: o, storey: ST, style: CD_FACE, roofColor: '#b8572f', fascia: '#5a3a2c', pitch: 0.45,
    replaces: [o, [(wing[0] + wing[1]) / 2, (wing[2] + wing[3]) / 2]],
    blocks: [B(slabR, o, F), B(wing, o, F, { faces: { [courtFace === 'x0' ? 'x1' : 'x0']: PLAIN_WALL }, roof: tanks ? 'flat' : undefined })],
    keep: [],
    extras: (k) => {
      // white gallery slabs along the court side on every upper floor
      const x = (courtFace === 'x0' ? slabR[0] : slabR[1]) - o[0], s = courtFace === 'x0' ? -1 : 1;
      const z0 = slabR[2] - o[1], z1 = slabR[3] - o[1];
      for (let f = 1; f < F; f++) {
        const y = PL + f * ST;
        k.plain.push([box(Math.min(x, x + s * 1.3), Math.max(x, x + s * 1.3), y - 0.15, y + 0.95, z0, z1), '#f4f1e8']);
      }
      // the entrance in the middle of the court side (owner's blue mark on C)
      const dz = door[1] - o[1];
      k.plain.push([box(Math.min(x, x + s * 0.06), Math.max(x, x + s * 0.06), PL, PL + 2.6, dz - 1.5, dz + 1.5), '#2b2724']);
      k.plain.push([box(Math.min(x, x + s * 2.2), Math.max(x, x + s * 2.2), 0, PL, dz - 2.5, dz + 2.5), '#c9c3b5']);
      if (tanks) {
        // D's wing: a raised roof with a red patch, black water tanks beside it (owner's photo)
        const wx0 = wing[0] - o[0], wx1 = wing[1] - o[0], wz0 = wing[2] - o[1], wz1 = wing[3] - o[1], e = k.wallTop(F);
        k.plain.push([box(wx0 + 1, wx1 - 1, e, e + 1.4, wz0 + 1, wz1 - 1), '#e9e7e2']);
        k.plain.push([box(wx0 + 1.2, wx1 - 1.2, e + 1.4, e + 1.6, wz0 + 1.2, wz1 - 1.2), '#b85a45']);
        for (let i = 0; i < 4; i++) {
          const tz = wz1 + 1.6 + i * 2.2;
          k.plain.push([new THREE.CylinderGeometry(0.85, 0.85, 1.9, 14).translate(wx0 + 2, 1.25, tz), '#1b1c1f']);
        }
        k.plain.push([box(wx0 + 0.5, wx0 + 3.5, 0, 0.3, wz1 + 0.4, wz1 + 10), '#a9a59b']);
      }
    },
  };
}

// ---------- Legon Annex C: the long block and its wings, from the mapped footprints ----------
const legonC = (() => {
  const o: [number, number] = [-185, 490];
  const pts: [number, number][] = [[-179, 490], [-201, 486], [-190, 434], [-191, 543]];
  const blocks: Block[] = [];
  for (const [px, pz] of pts) {
    const b = BUILDINGS.find((q) => px >= q.minX && px <= q.maxX && pz >= q.minZ && pz <= q.maxZ && q.pts.length >= 8);
    if (!b) continue;
    const ring: [number, number][] = [];
    for (let i = 0; i < b.pts.length; i += 2) ring.push([b.pts[i], b.pts[i + 1]]);
    for (const r of rectsOf(ring)) blocks.push(B(r, o, 2));
  }
  const spec: Spec = {
    name: 'Legon Hall Annex C (Graduate Hostel)', axis: [1, 0], origin: o, storey: 3.2, style: C_FACE, roofColor: '#5d5a55', fascia: '#3e3c39', pitch: 0.35,
    replaces: pts,
    blocks,
    keep: [],
    extras: (k) => {
      // the gate on the long block's east face (owner's blue mark)
      const x = -173 - o[0], z = 497 - o[1];
      k.plain.push([box(x, x + 0.06, 0, 2.8, z - 1.6, z + 1.6), '#2a2420']);
      for (let t = -1.4; t <= 1.41; t += 0.35) k.plain.push([box(x + 0.06, x + 0.1, 0.1, 2.7, z + t - 0.03, z + t + 0.03), '#6d6d6d']);
      k.plain.push([box(x, x + 1.6, 2.8, 3.0, z - 2.2, z + 2.2), WHITE]);
    },
  };
  return spec;
})();

/** Legon Hall's and Akuafo Hall's annexes */
export const annexes = createSite('annexes', [
  tall({ name: 'Legon Hall Annex A', slab: [-174.3, -115.9, 424.8, 432.9], tower: [-150, -130.1, 411.7, 424.8], door: [-120.5, 424.8], doorFace: 'north', rail: '#3e4248', piers: '#e8e7e2', gallery: LEGON_GALLERY, shops: false }),
  tall({ name: 'Legon Hall Annex B', slab: [-175.9, -115.4, 538.1, 547.1], tower: [-161, -142.6, 524, 538.1], door: [-120.5, 538.1], doorFace: 'north', rail: '#3e4248', piers: '#e8e7e2', gallery: LEGON_GALLERY, shops: false }),
  tall({ name: 'Akuafo Hall Annex A', slab: [124.9, 187.1, 426.8, 437.6], tower: [151.5, 161.8, 410.2, 426.8], door: [156.6, 437.6], doorFace: 'south', rail: '#2f8a86', piers: '#2d5fa8', gallery: AKUAFO_GALLERY, shops: true, billboard: ['#f3f2ee', '#3d5fa8'] }),
  tall({ name: 'Akuafo Hall Annex B', slab: [127.6, 189.5, 539.9, 547.4], tower: [153.9, 162.5, 524.5, 539.9], door: [158.2, 524.5], doorFace: 'north', rail: '#2f8a86', piers: '#2d5fa8', gallery: AKUAFO_GALLERY, shops: true, billboard: ['#f3f2ee', '#3d8fb0'] }),
  courtBlock('Akuafo Hall Annex C', [196.6, 207.2, 452.7, 514.3], [207.2, 220.9, 480.2, 499.5], [196.6, 483.5], 'x0', false),
  courtBlock('Akuafo Hall Annex D', [130.6, 142, 458.4, 518.1], [118.3, 130.6, 474.7, 494.3], [142, 488], 'x1', true),
  legonC,
]);
