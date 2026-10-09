// The small market under the trees between the GCB Lecture Building and the N Block, north of Ebenezer Laing Road
// (the owner's marked aerial, registered to the N Block at 0.277 m/px, and the owner's street photo from the road):
// two stalls under orange canopies, a white and a blue tent behind them, coolers and a counter of printed panels, rows
// of blue benches on concrete posts for sitting, on bare earth in the shade of tall feathery trees. The footpath from
// the road to the north runs past the benches. A grassy hump along the road before it; a utility pole with posters.
import * as THREE from 'three';
import { box, type Part } from './modelkit';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { concrete } from './concrete';
import { merge } from './modelkit';
import { SOLIDS } from './solids';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#eeeeee') };
const O: [number, number] = [-80, -312];
const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));

/** a market canopy: four posts, a pyramid roof of cloth, a valance with a trim along its edge */
function canopy(k: Kit, c: Part[], x: number, z: number, w: number, top: string, trim: string, h = 2.4) {
  const r = w / 2;
  for (const [dx, dz] of [[-r, -r], [r, -r], [-r, r], [r, r]]) { c.push([B(x + dx - 0.03, x + dx + 0.03, 0, h, z + dz - 0.03, z + dz + 0.03), '#c9cdd0']); SOLIDS.add(x + dx, z + dz, 0.12); }
  k.plain.push([new THREE.ConeGeometry(r * Math.SQRT2, w * 0.38, 4, 1, true).rotateY(Math.PI / 4).translate(X(x), h + w * 0.19, Z(z)), top]);
  for (const [x0, x1, z0, z1] of [[x - r, x + r, z - r - 0.02, z - r], [x - r, x + r, z + r, z + r + 0.02], [x - r - 0.02, x - r, z - r, z + r], [x + r, x + r + 0.02, z - r, z + r]]) {
    k.plain.push([B(x0, x1, h - 0.3, h, z0, z1), top], [B(x0, x1, h - 0.34, h - 0.3, z0, z1), trim]);
  }
}

/** a tall tree with a thin pale trunk and flat, feathery crowns (the market's shade trees) */
function feathery(k: Kit, x: number, z: number, h: number, seed: number) {
  k.plain.push([new THREE.CylinderGeometry(0.13, 0.22, h, 7).translate(X(x), h / 2, Z(z)), '#6f665b']);
  for (let i = 0; i < 5; i++) {
    const a = seed * 1.7 + i * 1.26, d = i === 0 ? 0 : 1.6 + ((seed + i) % 3) * 0.5, y = h - 0.4 + ((i * 7 + seed) % 4) * 0.35;
    k.plain.push([new THREE.IcosahedronGeometry(1.9 - (i === 0 ? 0 : 0.4), 1).scale(1.25, 0.42, 1.25).translate(X(x + Math.cos(a) * d), y, Z(z + Math.sin(a) * d)), ['#5f8f35', '#6e9c3c', '#557f2f'][(seed + i) % 3]]);
    if (i) k.plain.push([new THREE.CylinderGeometry(0.05, 0.08, d * 1.1, 5).rotateZ(Math.PI / 2 - 0.5).rotateY(-a).translate(X(x + Math.cos(a) * d * 0.5), y - 0.9, Z(z + Math.sin(a) * d * 0.5)), '#6f665b']);
  }
  SOLIDS.add(x, z, 0.3);
}

const market: Spec = {
  name: 'N Block market', axis: [1, 0], origin: O, storey: 3, style: PLAIN, roofColor: '#9a4630', fascia: '#5a2a22', pitch: 0.3,
  blocks: [],
  keep: [[X(-99), X(-62), Z(-324), Z(-302)]],
  extras: (k: Kit) => {
    const c: Part[] = [];
    // the bare earth the market stands on, worn paths through the grass
    k.plain.push([B(-97, -66, 0.015, 0.035, -322, -305), '#8a6c4e']);
    for (let i = 0; i < 26; i++) k.plain.push([B(-96 + ((i * 37) % 29), -95 + ((i * 37) % 29), 0.035, 0.04, -321 + ((i * 53) % 15), -320.3 + ((i * 53) % 15)), '#7a5e43']);
    // the two stalls under orange canopies (the near one with the counter of printed panels, coolers beside it)
    canopy(k, c, -86, -308.5, 4.2, '#d8662f', '#2f56a8');
    canopy(k, c, -91.5, -311.5, 3.6, '#cf5f2c', '#2f56a8');
    const panels = ['#3a6fc0', '#e2b42c', '#7a3f8f', '#d84a2a', '#2f9a7a'];
    k.plain.push([B(-88.0, -84.0, 0.85, 0.92, -309.6, -308.6), '#6b5444']);
    for (let i = 0; i < 5; i++) k.plain.push([B(-88.0 + i * 0.8, -87.2 + i * 0.8, 0.05, 0.85, -308.62, -308.58), panels[i]]);
    c.push([B(-88.0, -84.0, 0.05, 0.85, -309.6, -308.62), '#4a3d33']);
    SOLIDS.add(-86, -309.1, 1.6);
    for (const [x, z, col] of [[-89.4, -308.0, '#2a7ad0'], [-89.9, -309.0, '#f2f2ee'], [-89.4, -310.0, '#2a7ad0']] as [number, number, string][]) { c.push([B(x - 0.35, x + 0.35, 0, 0.55, z - 0.3, z + 0.3), col]); SOLIDS.add(x, z, 0.4); }
    for (const [x, z] of [[-84.6, -307.8], [-85.2, -307.6]]) k.plain.push([new THREE.CylinderGeometry(0.16, 0.16, 0.35, 10).translate(X(x), 0.18, Z(z)), '#e2b42c']);
    k.plain.push([B(-93.0, -90.0, 0.8, 0.86, -312.4, -311.0), '#6b5444'], [B(-92.9, -90.1, 0.05, 0.8, -312.3, -311.1), '#3b322b']);
    SOLIDS.add(-91.5, -311.7, 1.2);
    // the white tent and the blue tent behind them
    canopy(k, c, -84.0, -314.5, 3.2, '#f0eee6', '#d9d6cc', 2.3);
    canopy(k, c, -79.6, -312.0, 3.0, '#244a9a', '#1b3570', 2.2);
    k.plain.push([B(-85.6, -82.4, 0.1, 2.0, -316.1, -316.08), '#e6e3da'], [B(-81.1, -78.1, 0.1, 1.9, -313.5, -313.48), '#1d3c80']);
    // the benches for sitting: blue slats on concrete posts, in rows west of the footpath to the north
    const ux = -0.265, uz = -0.964, px = -0.964, pz = 0.265;
    const path = (t: number): [number, number] => [-66.6 + ux * t, -305.5 + uz * t];
    for (const off of [2.6, 5.0]) for (let t = 0; t < 15; t += 2.9) {
      const [x0, z0] = path(t), cx = x0 + px * off, cz = z0 + pz * off, a = Math.atan2(uz, ux);
      const bench = (dx: number, y0: number, y1: number, dz: number, w = 2.4, d = 0.36) => new THREE.BoxGeometry(w, y1 - y0, d).translate(dx, (y0 + y1) / 2, dz).rotateY(-a).translate(X(cx), 0, Z(cz));
      c.push([bench(0, 0.42, 0.47, 0), '#2a52b0'], [bench(0, 0.55, 0.65, 0.2, 2.4, 0.05), '#2a52b0'], [bench(0, 0.75, 0.85, 0.2, 2.4, 0.05), '#2a52b0']);
      for (const e of [-1.25, 1.25]) c.push([bench(e, 0, 0.9, 0.05, 0.22, 0.5), '#a8a49c']);
      SOLIDS.add(cx + ux * 1.25, cz + uz * 1.25, 0.3); SOLIDS.add(cx - ux * 1.25, cz - uz * 1.25, 0.3); SOLIDS.add(cx, cz, 0.3);
    }
    // the shade trees
    for (const [x, z, h, s] of [[-95.5, -305.5, 9, 1], [-88.5, -304.2, 10, 2], [-79.5, -306.0, 9.5, 3], [-72.5, -309.5, 10.5, 4], [-74.0, -318.5, 9, 5], [-90.0, -318.0, 10, 6], [-82.0, -320.5, 9.5, 7], [-96.5, -314.5, 8.5, 8], [-66.0, -318.0, 9, 9]] as [number, number, number, number][]) feathery(k, x, z, h, s);
    // the grassy hump along the road before the market, the utility pole with its posters
    k.plain.push([new THREE.IcosahedronGeometry(1, 2).scale(13, 0.7, 1.6).translate(X(-82), 0.05, Z(-302.6)), '#5f8a35']);
    c.push([new THREE.CylinderGeometry(0.11, 0.13, 8.5, 8).translate(X(-70.5), 4.25, Z(-302.2)), '#c3c6c8']);
    for (const [y, col] of [[1.6, '#6a3f9a'], [2.3, '#f2f2ee'], [3.0, '#3a6fc0']] as [number, string][]) k.plain.push([B(-70.64, -70.36, y, y + 0.55, -302.36, -302.33), col]);
    SOLIDS.add(-70.5, -302.2, 0.2);
    const m = new THREE.Mesh(merge(c), concrete(0.2));
    m.castShadow = true; m.receiveShadow = true;
    k.meshes.push(m);
  },
};

/** the market between the GCB Lecture Building and the N Block */
export const marketSite = createSite('nblock-market', [market]);
