// Valco Trust Hostel, Phase 1 and Phase 2, from the owner's photo (block engine: blocks.ts).
//
// Two long slabs of five floors under low hipped roofs of orange tiles, standing back to back: Phase 1 is entered
// on its north face, Phase 2 on its south face (owner: the back of Phase 1 faces the back of Phase 2). White walls
// with pilasters between pairs of wide dark windows and small square vents, a maroon base, and a stair bay with
// tall narrow windows over the entrance porch, a little east of the middle of Phase 1's front.
import { PL, createSite, render, type Kit, type Spec, type Style } from './blocks';
import * as THREE from 'three';
import { box } from './modelkit';
import { gates, grilleLeaf } from './gates';
import { groundHeight } from './relief';

const ST = 3.1, F = 5;
/** two window units per bay: a pilaster, then a wide dark window and a small square vent, twice */
const VALCO_WALL: Style = {
  bay: 6.4,
  up: [[30, 70, 76, 92], [150, 70, 76, 92]],
  ground: [[30, 256 + 70, 76, 92], [150, 256 + 70, 76, 92]],
  draw: (g) => {
    render(g, '#f1f0eb');
    for (const y0 of [0, 256]) {
      g.fillStyle = '#e1dfd7'; g.fillRect(0, y0, 14, 256);
      g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(14, y0, 3, 256);
      for (const x of [30, 150]) {
        g.fillStyle = '#c9c6bd'; g.fillRect(x - 4, y0 + 66, 84, 100);
        g.fillStyle = '#2a3038'; g.fillRect(x, y0 + 70, 76, 92);
        g.fillStyle = '#4a525c'; g.fillRect(x + 37, y0 + 70, 3, 92);
        g.fillStyle = '#5b5f63'; g.fillRect(x + 92, y0 + 104, 14, 14);
      }
    }
    // the maroon base of the ground floor
    g.fillStyle = '#8e2f2a'; g.fillRect(0, 512 - 26, 256, 26);
  },
};
/** the stair bay: tall narrow windows */
const STAIR: Style = {
  bay: 1.6,
  up: [[44, 30, 40, 170]],
  ground: [[44, 256 + 30, 40, 170]],
  draw: (g) => {
    render(g, '#f3f2ed');
    for (const y0 of [0, 256]) { g.fillStyle = '#2a3038'; g.fillRect(44, y0 + 30, 40, 170); }
    g.fillStyle = '#8e2f2a'; g.fillRect(0, 512 - 26, 256, 26);
  },
};

/**
 * One phase: the mapped outline's corners (north-west, north-east, south-east, south-west), whether the front is
 * the north face, and the entrance's distance from the middle along the front (+ toward the front's right).
 */
function phase(name: string, nw: [number, number], ne: [number, number], se: [number, number], sw: [number, number], frontNorth: boolean, door: number): Spec {
  const cx = (nw[0] + ne[0] + se[0] + sw[0]) / 4, cz = (nw[1] + ne[1] + se[1] + sw[1]) / 4;
  const lx = ne[0] - nw[0], lz = ne[1] - nw[1], len = Math.hypot(lx, lz);
  const depth = Math.hypot(sw[0] - nw[0], sw[1] - nw[1]);
  // the model's z0 face is the front: for a south front the frame turns round
  const axis: [number, number] = frontNorth ? [lx / len, lz / len] : [-lx / len, -lz / len];
  const [ux, uz] = axis;
  const x0 = -len / 2, x1 = len / 2, z0 = -depth / 2, z1 = depth / 2;
  return {
    name,
    axis, origin: [cx, cz], storey: ST, style: VALCO_WALL, roofColor: '#c0703f', fascia: '#efede6', pitch: 0.3,
    blocks: [
      { x0, x1, z0, z1, floors: F },
      // the stair bay standing a little forward of the front, under the main roof
      { x0: door - 3.2, x1: door + 3.2, z0: z0 - 0.7, z1: z0 + 0.2, floors: F, roof: 'flat', faces: { z0: STAIR, x0: STAIR, x1: STAIR } },
    ],
    keep: [[door - 4, door + 4, z0 - 5, z0]],
    extras: (k: Kit) => {
      const fz = z0 - 0.7;
      // the entrance block (the owner's photo of 2026-10-16, blue mark): a low white porch building before the stair bay,
      // the hostel's name on its fascia and dishes on its flat roof; its entrance with a dark steel grille gate in two
      // leaves, and on the right as one goes in (the left of the front from outside: the frame's -x) the porter's lodge
      // with its window (red mark). Proportions read from the photo, not measured.
      const pz = fz - 3, H = 3.2, gx0 = door + 0.2, gx1 = door + 2.6;
      k.plain.push([box(door - 2.8, door + 2.8, 0, 0.15, pz - 0.6, fz), '#cfc9bd']);
      k.plain.push([box(door - 2.8, door - 2.6, 0.15, H, pz, fz), '#f4f3ee'], [box(door + 2.6, door + 2.8, 0.15, H, pz, fz), '#f4f3ee']);
      k.plain.push([box(door - 2.9, door + 2.9, H, H + 0.25, pz - 0.15, fz), '#f4f3ee'], [box(door - 2.9, door + 2.9, H + 0.25, H + 0.75, pz - 0.15, pz - 0.05), '#f4f3ee']);
      // the lodge front: wall, a dark window over a sill
      k.plain.push([box(door - 2.6, gx0 - 0.25, 0.15, H, pz, pz + 0.2), '#f4f3ee']);
      k.glass.push(box(door - 2.3, gx0 - 0.55, 1.0, 2.45, pz - 0.01, pz));
      k.plain.push([box(door - 2.38, gx0 - 0.47, 0.92, 1.0, pz - 0.12, pz), '#d9d5cc'], [box(door - 2.38, gx0 - 0.47, 2.45, 2.52, pz - 0.04, pz), '#3a4652']);
      // the entrance: jambs and lintel, the shaded hall behind the gate
      k.plain.push([box(gx0 - 0.25, gx0, 0.15, H, pz - 0.05, pz + 0.2), '#f4f3ee'], [box(gx0, gx1, 2.75, H, pz - 0.05, pz + 0.2), '#f4f3ee']);
      k.plain.push([box(gx0, gx1, 0.15, 2.75, fz - 0.02, fz), '#2a2d31'], [box(gx0, gx1, 0.15, 0.17, pz, fz), '#8e8a82']);
      k.signs.push({ text: name.replace(' Hostel', ''), x: door, y: H + 0.5, z: pz - 0.16, ry: Math.PI, w: 4.8, colors: ['#f4f3ee', '#8e2f2a'] });
      for (const dx of [-1.6, 0.9]) {
        k.plain.push([box(door + dx - 0.04, door + dx + 0.04, H + 0.75, H + 1.25, fz - 1.2, fz - 1.12), '#9a9a96']);
        k.plain.push([new THREE.CylinderGeometry(0.42, 0.3, 0.1, 18).rotateX(-1.15).translate(door + dx, H + 1.3, fz - 1.3), '#e7e6e1']);
      }
      // (the gate's leaves on the gate system, in the world frame of this model; they swing out to either side)
      const w = (x: number, z: number): [number, number] => [cx + x * ux - z * uz, cz + x * uz + z * ux];
      const L = (gx1 - gx0) / 2, hy = groundHeight(...w(door + 1.4, pz)) + 0.15;
      for (const [hx, s] of [[gx0, 1], [gx1, -1]] as [number, number][]) {
        const leaf = grilleLeaf(L, 2.55); leaf.position.y = hy;
        // a leaf along +x (s = 1) or -x (s = -1) of the frame, opening outward (toward the frame's -z)
        const d: [number, number] = [ux * s, uz * s];
        gates.register({ id: `${name}:gate${s > 0 ? 'L' : 'R'}`, buildingId: frontNorth ? 'valco-1' : 'valco-2', hinge: w(hx, pz - 0.1), dir: d, length: L, open: s > 0 ? 1.45 : -1.45, leaf });
      }
      // the maroon base round the walls
      for (const [a, b, c, d] of [[x0 - 0.06, x1 + 0.06, z0 - 0.06, z0], [x0 - 0.06, x1 + 0.06, z1, z1 + 0.06], [x0 - 0.06, x0, z0, z1], [x1, x1 + 0.06, z0, z1]]) k.plain.push([box(a, b, 0, 0.75, c, d), '#8e2f2a']);
    },
  };
}

/** the two Valco Trust Hostel blocks (mapped outlines: OSM ways 278303038 and 278303034) */
export const valco = createSite('valco', [
  phase('Valco Trust Hostel Phase 1', [-15.6, 770.2], [63.8, 771.2], [63.6, 787.5], [-15.8, 786.5], true, 3.3),
  phase('Valco Trust Hostel Phase 2', [-12.2, 830.2], [67.3, 831.1], [67.1, 847.4], [-12.4, 846.5], false, 3.3),
]);
