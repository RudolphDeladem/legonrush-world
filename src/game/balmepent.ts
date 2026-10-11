// The Balme Library front and the Pentagon, the owner's eleven-pairs brief: the adjustable numbers (the fountain's jets,
// the statues, the roundabout's edge), the roundabout island before the library, and the eleven comparison cameras.
// The pool, its terraces and stairs are in balme.ts (levels in relief.ts); the new Pentagon blocks in newpent.ts; the
// old courts, the administration block and the Addis Ababa gate in pentagon.ts. Nothing is surveyed.
import * as THREE from 'three';
import { merge, type Part } from './modelkit';
import { createSite, type Kit, type Spec } from './blocks';
import { concrete } from './concrete';
import { SOLIDS } from './solids';

export const BP = {
  /** the pool's jets: on (spray drawn) or off (the elevated reference shows little or none) */
  jets: true,
  /** the pale figurative statues on the raised lawns either side of the pool (pair 2), world x, z */
  statues: [[-3.5, 66.5], [-3.5, 76.5], [-3.5, 86.5], [19.5, 66.5], [19.5, 76.5], [19.5, 86.5]] as [number, number][],
  /** the two short white cylinders with dark tops at the south end (pair 2's foreground) */
  posts: [[-4.5, 96.6], [21.5, 96.6]] as [number, number][],
  /** the roundabout island before the library (pair 11, a 2014 reference state): its centre, the lawn's radius, the
   *  pale curb, the open drain outside it and the pale outer edge (radial widths), heights above the road */
  island: { c: [6.7, 125.3] as [number, number], lawn: 16.3, curb: 0.3, drain: 0.5, edge: 0.55, curbH: 0.32, edgeH: 0.14, lawnH: 0.26 },
};

/** the eleven comparison cameras (eye, look: heights above the ground; vertical field of view). Estimated from the
 *  photos and the owner's map, not measured. */
export const BP_VIEWS: { name: string; eye: [number, number, number]; look: [number, number, number]; fov: number; note: string }[] = [
  { name: 'bp1', eye: [2.0, 1.6, 92.9], look: [11.5, 2.4, 52], fov: 62, note: 'the pool from its south-west corner on the deck, the clock tower beyond' },
  { name: 'bp2', eye: [8.5, 13, 112], look: [8.5, -1.5, 52], fov: 52, note: 'the library front from above the road south of the pool' },
  { name: 'bp3', eye: [637, 1.6, -644], look: [657, 3.0, -686], fov: 55, note: 'Block C and its parking from Pent Road (red arrow)' },
  { name: 'bp4', eye: [690, 1.6, -647], look: [700, 5.0, -690], fov: 60, note: 'Block C\'s south front from the road (white arrows)' },
  { name: 'bp5', eye: [628, 1.6, -652], look: [600, 5.0, -676], fov: 55, note: 'Block A\'s north-east side from Pent Road (yellow arrows)' },
  { name: 'bp6', eye: [688, 1.6, -652], look: [615, 4.0, -662], fov: 55, note: 'Block A\'s east side from Block C (green arrows)' },
  { name: 'bp7', eye: [563, 1.6, -588], look: [569.5, 4.0, -625], fov: 55, note: 'the approach to Block A\'s entrance (blue arrows)' },
  { name: 'bp8', eye: [662, 1.6, -557], look: [673, 6.0, -530], fov: 62, note: 'Kampala Court\'s front and porch' },
  { name: 'bp9', eye: [629, 1.6, -553], look: [632, 5.0, -522], fov: 62, note: 'the administration block (Ghana Hostels) from the road' },
  { name: 'bp10', eye: [523.5, 1.6, -537.5], look: [508, 1.5, -532], fov: 60, note: 'the security post at the entrance before Addis Ababa Court' },
  { name: 'bp11', eye: [9, 1.5, 106.4], look: [2, 0, 117], fov: 60, note: 'the roundabout island\'s edge before the library (2014 reference)' },
];

// ---------- the roundabout island before the library (pair 11) ----------
const IO = BP.island.c;
const ring = (r0: number, r1: number, y0: number, y1: number, seg = 96) => {
  const s = new THREE.Shape().absarc(0, 0, r1, 0, Math.PI * 2, false);
  s.holes.push(new THREE.Path().absarc(0, 0, r0, 0, Math.PI * 2, true));
  return new THREE.ExtrudeGeometry(s, { depth: y1 - y0, bevelEnabled: false, curveSegments: seg }).rotateX(-Math.PI / 2).translate(0, y0, 0);
};
const islandSpec: Spec = {
  name: 'Balme roundabout island', axis: [1, 0], origin: IO, storey: 3, style: { bay: 3, up: [], ground: [], draw: (g) => { g.fillStyle = '#ccc'; g.fillRect(0, 0, 256, 512); } }, roofColor: '#888', fascia: '#888', pitch: 0.1,
  blocks: [],
  // no generic trees, benches or people on the island (the reference shows clipped shrubs only)
  keep: [[-18, 18, -18, 18]],
  extras: (k: Kit) => {
    const I = BP.island, c: Part[] = [];
    const r1 = I.lawn, r2 = r1 + I.curb, r3 = r2 + I.drain, r4 = r3 + I.edge;
    // the lawn, raised behind the curb; the pale curb; the open drain between it and the outer edge (its floor a little
    // above the road, its sides the curb and the edge); the pale outer edge against the road
    const lawn = new THREE.CylinderGeometry(r1, r1, I.lawnH, 96).translate(0, I.lawnH / 2 - 0.05, 0);
    c.push([lawn, '#5f8f3a'], [ring(r1, r2, -0.05, I.curbH), '#dcd8cd'], [ring(r2, r3, -0.05, 0.03), '#4b4842'], [ring(r3, r4, -0.05, I.edgeH), '#cfcabe']);
    // worn paint on the curb: stained patches along its top
    for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2 + (i % 3) * 0.07, r = (r1 + r2) / 2; c.push([new THREE.BoxGeometry(I.curb + 0.01, 0.01, 0.5 + (i % 4) * 0.3).rotateY(-a).translate(Math.cos(a) * r, I.curbH + 0.003, Math.sin(a) * r), i % 2 ? '#b9b3a6' : '#a9a397']); }
    // leaves gathered in the drain
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2, r = (r2 + r3) / 2;
      c.push([new THREE.CircleGeometry(0.12 + (i % 3) * 0.05, 5).rotateX(-Math.PI / 2).translate(Math.cos(a) * r, 0.035, Math.sin(a) * r), ['#7a5c34', '#9b7a44', '#5f4c2c'][i % 3]]);
    }
    // small irregular clipped shrubs on the lawn, in clumps near its edge (the reference's planting)
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39996, r = 4 + ((i * 37) % 100) / 100 * (r1 - 5.2), s = 0.45 + ((i * 13) % 7) * 0.08;
      c.push([new THREE.IcosahedronGeometry(s, 1).scale(1.3, 0.8, 1.1).translate(Math.cos(a) * r, I.lawnH + s * 0.55, Math.sin(a) * r), ['#3d6b2d', '#4a7a33', '#2f5a24', '#5b8a3c'][i % 4]]);
    }
    const m = new THREE.Mesh(merge(c), concrete(0.25)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2; SOLIDS.add(IO[0] + Math.cos(a) * (r2 - 0.15), IO[1] + Math.sin(a) * (r2 - 0.15), 0.25); }
  },
};

/** the roundabout island before the Balme Library */
export const balmeFrontSite = createSite('balme-front', [islandSpec]);
