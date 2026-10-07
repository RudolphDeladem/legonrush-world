// Pentagon (Pent), modelled from the owner's labelled aerial and photos (block engine: blocks.ts).
//
// Old Pent: four courts in a row, west to east Dar es Salaam, Kampala, (the admin block), Addis
// Ababa and Nairobi, all one design: four three-storey white blocks round a cross of open gaps, joined
// by a central stair core that rises into a tower with a front gable and an arched window; terracotta
// hipped roofs with dark fascias, a red base, and a small tiled porch at the foot of the core on the
// north face (the entrance, toward the road). The admin block (Ghana Hostels) sits in the middle: two
// four-storey towers with front gables and brick-red corner panels either side of a recessed centre
// with a balcony, a tiled veranda along the ground floor and a gabled porch with a sunburst gable and
// the GHANA HOSTELS LTD sign.
//
// New Pent blocks A, B and C (one design): their wings are the mapped footprints, built by the
// generic builder at four storeys in cream with terracotta roofs (newPentStyle); this module adds each
// block's entrance pavilion (a projecting tower with an arched window under a front gable, over a
// columned porch with an arched opening and a small tile gable), facing the car park on the south.
import * as THREE from 'three';
import type { Building } from './campusmap';
import { PAVE, TRIM, WHITE, box } from './modelkit';
import { PL, createSite, gableZ, render, slab, window_, type Kit, type Spec, type Style } from './blocks';

const RED_BASE = '#b4523a', BRICK = '#a5533a', FASCIA = '#3a2c26';

/** Old Pent: white render, a pair of dark windows in brown frames per bay, the red base on the ground floor */
const OLD_WIN: Style = {
  bay: 3.2,
  up: [[40, 64, 72, 100], [144, 64, 72, 100]],
  ground: [[40, 64, 72, 100], [144, 64, 72, 100]],
  draw: (g) => {
    render(g, '#f6f5f1');
    for (const y0 of [0, 256]) for (const x of [40, 144]) window_(g, [x, y0 + 64, 72, 100], '#6b4a33', 2, 0.3);
    slab(g, 232, 24);
    g.fillStyle = RED_BASE; g.fillRect(0, 440, 256, 72);
  },
};
/** the admin block: white render, wide white-framed windows */
const ADMIN_WIN: Style = {
  bay: 3.6,
  up: [[48, 70, 160, 100]],
  ground: [[40, 60, 176, 150]],
  draw: (g) => {
    render(g, '#f7f6f2');
    window_(g, [48, 70, 160, 100], '#f2f2ee', 3, 0.3);
    slab(g, 232, 24);
    window_(g, [40, 256 + 60, 176, 150], '#4a4038', 4, 0.25);
  },
};

// ---------- Old Pent courts ----------
// court frame: x along the row (the courts are turned about 5 degrees), z to the south; the north face is z = -16
const COURT_AXIS: [number, number] = [0.9964, -0.085];
const C3 = 3;
function court(name: string, origin: [number, number], replaces: [number, number][]): Spec {
  return {
    name,
    axis: COURT_AXIS, origin, storey: 3.2, style: OLD_WIN, roofColor: '#b0573a', fascia: FASCIA, pitch: 0.45,
    replaces,
    blocks: [
      { x0: -19.5, x1: -2.5, z0: -16, z1: -1.5, floors: C3 },
      { x0: 2.5, x1: 19.5, z0: -16, z1: -1.5, floors: C3 },
      { x0: -19.5, x1: -2.5, z0: 1.5, z1: 16, floors: C3 },
      { x0: 2.5, x1: 19.5, z0: 1.5, z1: 16, floors: C3 },
      // the central stair core, a little taller than the blocks
      { x0: -2.5, x1: 2.5, z0: -14, z1: 14, floors: C3, roof: 'none' },
    ],
    keep: [[-4, 4, -20, -14]],
    extras: (k) => {
      const top = k.wallTop(C3) + 1.4;
      // the core rises into a tower with a front gable and an arched window (owner photo)
      k.plain.push([box(-2.5, 2.5, k.wallTop(C3), top, -14, 14), WHITE]);
      gableZ(k, -3.1, 3.1, -14.6, 14.6, top, 0.55, [true, true]);
      for (let f = 1; f < C3; f++) {
        const y = PL + f * 3.2 + 0.6;
        k.glass.push(box(-0.8, 0.8, y, y + 1.6, -14.04, -14));
      }
      k.glass.push(box(-0.7, 0.7, top - 2.2, top - 0.6, -14.04, -14));
      k.plain.push([new THREE.CircleGeometry(0.7, 14, 0, Math.PI).rotateY(Math.PI).translate(0, top - 0.6, -14.05), '#2b3a48']);
      // the entrance porch at the foot of the core, on the north face: white posts under a tiled gable
      for (const x of [-1.9, 1.9]) k.plain.push([box(x - 0.18, x + 0.18, 0, 3.0, -17.6, -17.2), WHITE]);
      gableZ(k, -2.6, 2.6, -18, -14, 3.0, 0.5, [true, false]);
      k.plain.push([box(-2.2, 2.2, 0, 0.2, -18, -14), PAVE]);
      k.glass.push(box(-1.2, 1.2, PL, 2.7, -14.04, -14));
      // the red base round the core
      k.plain.push([box(-2.55, 2.55, 0, 1.2, -14.05, 14.05), RED_BASE]);
    },
  };
}

// ---------- the admin block (frame: the courts' axis, origin at the footprint's middle) ----------
const ADMIN_F = 4;
const admin: Spec = {
  name: 'Pent Admin Block',
  axis: COURT_AXIS, origin: [632, -514], storey: 3.4, style: ADMIN_WIN, roofColor: '#b0573a', fascia: FASCIA, pitch: 0.45,
  replaces: [[622, -515]],
  blocks: [
    { x0: -14.1, x1: -1.5, z0: -13, z1: 12.5, floors: ADMIN_F, roof: 'none' },
    { x0: 5.4, x1: 14.1, z0: -13.3, z1: 12.3, floors: ADMIN_F, roof: 'none' },
    { x0: -1.5, x1: 5.4, z0: 3.4, z1: 12.3, floors: ADMIN_F - 1, pitch: 0.35 },
  ],
  keep: [[-16, 16, -19, -13]],
  extras: (k) => {
    const e = k.wallTop(ADMIN_F);
    // the two towers: front-facing gables (owner photo), roofs running back
    gableZ(k, -14.8, -0.8, -13.8, 13.2, e, 0.55, [true, true]);
    gableZ(k, 4.7, 14.8, -14.1, 13, e, 0.7, [true, true]);
    // brick-red panels up the towers' outer corners
    for (const [x0, x1] of [[-14.1, -12.1], [12.1, 14.1]] as [number, number][]) k.plain.push([box(x0, x1, PL, e - 0.3, -13.4, -13.25), BRICK]);
    // the recessed centre: a balcony with a railing on the second and third floors
    for (const f of [2, 3]) {
      const y = PL + f * 3.4;
      k.plain.push([box(-1.5, 5.4, y - 0.1, y + 0.05, -1, 3.4), '#e9e7e1']);
      k.plain.push([box(-1.5, 5.4, y + 1.0, y + 1.08, -1, -0.9), '#4a4d52']);
      for (let x = -1.3; x < 5.3; x += 0.25) k.plain.push([box(x - 0.02, x + 0.02, y, y + 1.0, -1, -0.95), '#4a4d52']);
    }
    // the tiled veranda along the ground floor
    const vy = 3.6;
    k.roof.c = new THREE.Color('#b8603a');
    k.roof.quad([-15, vy - 0.6, -16.2], [15, vy - 0.6, -16.2], [15, vy + 0.4, -13.3], [-15, vy + 0.4, -13.3]);
    for (const x of [-14.6, -9, -4.5, 9.5, 14.6]) k.plain.push([box(x - 0.15, x + 0.15, 0, vy - 0.6, -16.1, -15.8), WHITE]);
    // the gabled porch between the towers, with the sunburst gable and the sign
    const px0 = -2.2, px1 = 6.1, pz0 = -18.2, pz1 = -13, ph = 4.0;
    for (const x of [px0 + 0.3, px1 - 0.3]) k.plain.push([box(x - 0.25, x + 0.25, 0.3, ph, pz0 + 0.2, pz0 + 0.7), WHITE]);
    k.plain.push([box(px0, px1, ph, ph + 0.8, pz0, pz1), '#f1e7d2']);
    gableZ(k, px0 - 0.4, px1 + 0.4, pz0 - 0.4, pz1, ph + 0.8, 0.6, [true, false]);
    const gx = (px0 + px1) / 2;
    for (let i = 0; i < 7; i++) {
      const a = (i / 6) * Math.PI;
      k.plain.push([new THREE.BoxGeometry(0.06, 1.9, 0.04).translate(0, 0.95, 0).rotateZ(Math.PI / 2 - a).translate(gx, ph + 0.85, pz0 + 0.18), '#8b6a4a']);
    }
    k.signs.push({ text: 'GHANA HOSTELS LTD', x: gx, y: ph + 0.4, z: pz0 - 0.01, ry: Math.PI, w: 4.2, colors: ['#3b3a36', '#f4ead2'] });
    for (let i = 0; i < 3; i++) k.plain.push([box(px0 + 0.3 - i * 0.2, px1 - 0.3 + i * 0.2, 0, 0.3 - i * 0.1, pz0 - i * 0.4, pz1), PAVE]);
    k.glass.push(box(gx - 2.2, gx + 2.2, 0.3, 3.0, -13.04, -13));
  },
};

// ---------- New Pent entrance pavilions (frame: map axes, origin at the owner's mark, front to +z) ----------
const NEW_F = 4, NEW_STOREY = 3.4;
function pavilion(name: string, at: [number, number]): Spec {
  return {
    name,
    axis: [1, 0], origin: at, storey: NEW_STOREY, style: OLD_WIN, roofColor: '#b5532f', fascia: FASCIA, pitch: 0.5,
    blocks: [],
    keep: [[-5, 5, -1.5, 6]],
    extras: (k) => {
      const CREAM = '#efe4cc', e = PL + NEW_F * NEW_STOREY + 0.4;
      // the projecting tower, the height of the block, with an arched window high up and a front gable
      k.plain.push([box(-4.2, 4.2, 0, e, -1.5, 2.5), CREAM]);
      gableZ(k, -4.8, 4.8, -2, 3.1, e, 0.6, [false, true]);
      k.glass.push(box(-0.8, 0.8, e - 3.4, e - 1.2, 2.5, 2.54));
      k.plain.push([new THREE.CircleGeometry(0.8, 14, 0, Math.PI).translate(0, e - 1.2, 2.55), '#2b3a48']);
      k.plain.push([box(-1.1, 1.1, e - 3.6, e - 3.4, 2.5, 2.7), TRIM]);
      // a balcony row above the porch
      k.glass.push(box(-3, 3, PL + 2 * NEW_STOREY + 0.6, PL + 2 * NEW_STOREY + 2.4, 2.5, 2.54));
      k.plain.push([box(-3.2, 3.2, PL + 2 * NEW_STOREY + 0.5, PL + 2 * NEW_STOREY + 1.4, 2.5, 2.75), CREAM]);
      // the porch: columns, an arched opening, a small tile gable over it (owner photo)
      for (const x of [-3.6, -1.4, 1.4, 3.6]) k.plain.push([box(x - 0.25, x + 0.25, 0, 3.6, 4.9, 5.4), CREAM]);
      k.plain.push([box(-4, 4, 3.6, 4.4, 2.5, 5.5), CREAM]);
      k.plain.push([new THREE.CircleGeometry(1.15, 16, 0, Math.PI).translate(0, 2.45, 5.42), '#3b2e26']);
      gableZ(k, -4.4, 4.4, 2.5, 5.9, 4.4, 0.55, [false, true]);
      k.plain.push([box(-4, 4, 0, 0.2, 2.5, 6), '#b9805a']);
      k.glass.push(box(-1.6, 1.6, 0.2, 3.0, 2.5, 2.54));
      k.plain.push([box(-4.25, 4.25, 0, 1.0, 2.5, 2.56), RED_BASE]);
    },
  };
}

/** Old Pent courts, the admin block and the New Pent entrance pavilions */
export const pentagon = createSite('pentagon', [
  court('Dar es Salaam Court', [540.5, -510], [[530, -501], [552, -502], [551, -520], [529, -517], [541, -509]]),
  court('Kampala Court', [589.75, -514], [[579, -522], [579, -505], [600, -523], [601, -506], [591, -515]]),
  court('Addis Ababa Court', [672, -522.4], [[672, -525]]),
  court('Nairobi Court', [722, -526.5], [[722, -529]]),
  admin,
  pavilion('New Pent Block A', [575.6, -628]),
  pavilion('New Pent Block B', [568.4, -766]),
  pavilion('New Pent Block C', [686.8, -698]),
]);

/** where the New Pent blocks stand (the yellow zone on the owner's aerial) */
const NEW_PENT = [[507, 635, -839, -585], [632, 756, -797, -641]];
/** New Pent's wings: cream render and terracotta roofs (owner photo); undefined for every other building */
export function newPentStyle(b: Building) {
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  return NEW_PENT.some(([x0, x1, z0, z1]) => cx > x0 && cx < x1 && cz > z0 && cz < z1) ? { wall: '#f1e6cf', roof: '#b5532f' } : undefined;
}
