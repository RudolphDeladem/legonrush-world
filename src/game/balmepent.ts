// The Balme Library front and the Pentagon, the owner's eleven-pairs brief: the adjustable numbers (the fountain's jets,
// the statues, the roundabout's edge), the roundabout island before the library, and the eleven comparison cameras.
// The pool, its terraces and stairs are in balme.ts (levels in relief.ts); the new Pentagon blocks in newpent.ts; the
// old courts, the administration block and the Addis Ababa gate in pentagon.ts. Nothing is surveyed.
import * as THREE from 'three';
import { merge, type Part } from './modelkit';
import { createSite, type Kit, type Spec } from './blocks';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { graduates, type StatueKind } from './statues';

export const BP = {
  /** the pool's jets: on (spray drawn) or off (the elevated reference shows little or none) */
  jets: true,
  /** the pale figurative statues on the raised lawns either side of the pool (pair 2), world x, z */
  statues: [[-3.5, 66.5], [-3.5, 76.5], [-3.5, 86.5], [19.5, 66.5], [19.5, 76.5], [19.5, 86.5]] as [number, number][],
  /** who stands where (the audit's elevated photo I030 and the ground photos): the west lawn from the library end, the
   *  footballer by the cross wall (I053), the dancer in the wrap before him, the woman holding the cloth nearest the road (the owner's photos); the east lawn, the book-holder by the cross
   *  wall (I067, the owner's arrow), the draped woman with the raised arm (I018, I067), the suited man with the long
   *  object nearest the road (I014). */
  statueKinds: ['football', 'dancer', 'cloth', 'book', 'draped', 'suited'] as StatueKind[],
  /** the two white pedestals with urns in the corner beds at the south end (the owner's marked aerial) */
  posts: [[-3.6, 97.8], [20.3, 97.8]] as [number, number][],
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
  // no generic trees, benches or people on the island (its own planting and statue only)
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
    // the planting round the statue (the audit's C23, photos I066, I037, I040): irregular groups of shrubs of different
    // sizes, some in flower (red and yellow), prickly-pear cactus clumps and pale rocks about the plinth, gaps of lawn
    // between the groups; no ring of equal round bushes
    const R = (i: number) => ((Math.sin(i * 127.1) * 43758.5453) % 1 + 1) % 1;
    // (the owner's marked aerial: the planting is a bed round the plinth only; the rest is a patchy lawn with short
    // bollard lights and two flat plaques)
    const groups = [[0.4, 2.6], [1.5, 3.2], [2.4, 2.8], [3.3, 3.6], [4.2, 3.0], [5.3, 3.4]];
    groups.forEach(([a, r], gi) => {
      const n = 3 + Math.floor(R(gi) * 4);
      for (let j = 0; j < n; j++) {
        const aa = a + (R(gi * 7 + j) - 0.5) * (2.2 / r), rr = r + (R(gi * 11 + j) - 0.5) * 1.6, s = 0.32 + R(gi * 13 + j) * 0.5;
        const px = Math.cos(aa) * rr, pz = Math.sin(aa) * rr;
        c.push([new THREE.IcosahedronGeometry(s, 1).scale(1.25, 0.75 + R(j + gi) * 0.4, 1.1).translate(px, I.lawnH + s * 0.5, pz), ['#3d6b2d', '#4a7a33', '#2f5a24', '#5b8a3c', '#476f2e'][(gi + j) % 5]]);
        if ((gi + j) % 3 === 0) for (let q = 0; q < 7; q++) {
          const fa = R(gi * 31 + j * 5 + q) * Math.PI * 2;
          c.push([new THREE.IcosahedronGeometry(0.07, 0).translate(px + Math.cos(fa) * s * 1.0, I.lawnH + s * (0.75 + R(q + j) * 0.35), pz + Math.sin(fa) * s * 0.9), gi % 2 ? '#d4372a' : '#e6c31f']);
        }
      }
    });
    // prickly-pear cactus clumps: flat oval pads stacked on each other
    for (const [a, r] of [[0.9, 2.4], [2.9, 2.6], [4.6, 2.3]]) {
      const px = Math.cos(a) * r, pz = Math.sin(a) * r;
      for (let q = 0; q < 9; q++) {
        const h = I.lawnH + 0.35 + (q % 3) * 0.42, ox = (R(q + a * 10) - 0.5) * 0.9, oz = (R(q * 3 + r) - 0.5) * 0.6;
        c.push([new THREE.SphereGeometry(0.24, 7, 6).scale(1, 1.3, 0.28).rotateZ((R(q + 9) - 0.5) * 0.9).rotateY(R(q + 4) * 3).translate(px + ox, h, pz + oz), '#5e8a4a']);
      }
    }
    // pale rocks set about the plinth's foot and the beds
    for (let i = 0; i < 14; i++) {
      const a = i * 0.45 + R(i) * 0.3, r = 1.6 + R(i + 40) * 1.6, s = 0.18 + R(i + 80) * 0.22;
      c.push([new THREE.DodecahedronGeometry(s, 0).scale(1, 0.8 + R(i) * 0.6, 0.9).translate(Math.cos(a) * r, I.lawnH + s * 0.5, Math.sin(a) * r), ['#d8d3c8', '#c7c1b4', '#e2ded6'][i % 3]]);
    }
    const m = new THREE.Mesh(merge(c), concrete(0.25)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2; SOLIDS.add(IO[0] + Math.cos(a) * (r2 - 0.15), IO[1] + Math.sin(a) * (r2 - 0.15), 0.25); }
    // the two graduates with the torch on their tall plinth in the middle (C22, photo I066), their fronts toward the road
    // beside the Bookshop, east-north-east (the owner's marked aerial)
    k.meshes.push(...graduates(0, I.lawnH - 0.05, 0, Math.atan2(29.5 - IO[0], 110 - IO[1])));
    SOLIDS.add(IO[0], IO[1], 1.1);
    // short dark bollard lights round the lawn, two flat dark plaques set in it, dry patches in the grass
    {
      const t: Part[] = [];
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + 0.2, r = 10.5; t.push([new THREE.CylinderGeometry(0.09, 0.1, 0.6, 8).translate(Math.cos(a) * r, I.lawnH + 0.3, Math.sin(a) * r), '#26282b'], [new THREE.CylinderGeometry(0.11, 0.11, 0.08, 8).translate(Math.cos(a) * r, I.lawnH + 0.62, Math.sin(a) * r), '#d9d6c8']); }
      for (const [px, pz, ry] of [[1.2, 4.6, 0.1], [9.2, -2.2, 0.4]]) t.push([new THREE.BoxGeometry(1.4, 0.12, 0.9).rotateY(ry).translate(px, I.lawnH + 0.03, pz), '#3c3a37'], [new THREE.BoxGeometry(1.2, 0.02, 0.7).rotateY(ry).translate(px, I.lawnH + 0.1, pz), '#5a5a58']);
      for (let i = 0; i < 9; i++) { const a = i * 2.1, r = 5 + (i * 1.37) % 9; t.push([new THREE.CircleGeometry(1.2 + (i % 3) * 0.8, 10).rotateX(-Math.PI / 2).translate(Math.cos(a) * r, I.lawnH + 0.005, Math.sin(a) * r), i % 2 ? '#8f8656' : '#a0915e']); }
      const pm = new THREE.Mesh(merge(t), concrete(0.1)); pm.receiveShadow = true; k.meshes.push(pm);
    }
  },
};

/** the roundabout island before the Balme Library */
export const balmeFrontSite = createSite('balme-front', [islandSpec]);
