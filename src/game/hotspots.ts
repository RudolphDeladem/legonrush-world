// The two hotspot comfort zones south of the roundabout at the end of the avenue between Legon Hall and Akuafo Hall,
// beside the lane to the Athletic Oval (owner's marked aerial, registered to the avenue and the loop at 0.3 m/px, and
// night photos of their fronts). New buildings, freshly painted white:
// - the University of Ghana Alumni Association's (yellow): two levels; a solid block on each side (a tall grey
//   louvred vent and planters on the east one, the stair up to the deck at the west one), between them the open
//   sitting area on the ground floor and the deck above it behind a black railing; a deep band under the eaves with
//   UNIVERSITY OF GHANA ALUMNI ASSOCIATION and HOTSPOT COMFORT ZONE on dark brown; a dark brown hip roof on a white
//   fascia; two steel struts in a V from one foot up to the band; a paved front with planter boxes.
// - First Bank Ghana's (red): the same design, its board FIRST BANK GHANA / HOTSPOT COMFORT ZONE on navy, the ceilings
//   of both levels painted blue with a yellow frame round the deck's opening, a colourful mural of patterns and faces on
//   the wall at the west side of the sitting area; ceiling fans; benches and tables.
// Both face north, toward the loop.
import * as THREE from 'three';
import { box, merge, type Part } from './modelkit';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { concrete } from './concrete';
import { garden } from './gardens';
import { SOLIDS } from './solids';

const WHITE_NEW = '#f6f6f2', ROOF = '#3e2a22', FASCIA_W = '#f2f1ec', PLANTER = '#4a3328';
const H1 = 3.4, H2 = 6.4, EAVE = 7.6;
const W_PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, WHITE_NEW) };

interface Hot { name: string; r: [number, number, number, number]; band: string; board: string; boardText: string; boardSub: [string, string]; first: boolean }
const HOTS: Hot[] = [
  { name: 'Alumni Association hotspot comfort zone', r: [-18.0, -4.0, 286.0, 298.0], band: '#4a2e22', board: '#4a2e22', boardText: 'UNIVERSITY OF GHANA ALUMNI ASSOCIATION', boardSub: ['#4a2e22', '#e8c23a'], first: false },
  { name: 'First Bank Ghana hotspot comfort zone', r: [16.5, 34.5, 286.0, 298.5], band: '#9a6a4a', board: '#1d2740', boardText: 'FIRST BANK GHANA', boardSub: ['#1d2740', '#f0a03a'], first: true },
];

/** a mural of bright geometric patterns and faces (First Bank's) */
function mural(k: Kit, x: number, z0: number, z1: number, y0: number, y1: number, s = 1) {
  const cols = ['#f2b21a', '#e2552a', '#2a6fd0', '#1d1d1d', '#f6f6f2', '#2fa36b', '#c23b6a'];
  const nz = 6, ny = 10, dz = (z1 - z0) / nz, dy = (y1 - y0) / ny;
  for (let i = 0; i < nz; i++) for (let j = 0; j < ny; j++) {
    const c = cols[(i * 3 + j * 5 + ((i * j) % 3)) % cols.length];
    k.plain.push([box(Math.min(x, x + s * 0.02), Math.max(x, x + s * 0.02), y0 + j * dy, y0 + (j + 1) * dy, z0 + i * dz, z0 + (i + 1) * dz), c]);
    if ((i + j) % 3 === 0) k.plain.push([new THREE.CircleGeometry(Math.min(dz, dy) * 0.35, 12).rotateY(s * Math.PI / 2).translate(x + s * 0.03, y0 + (j + 0.5) * dy, z0 + (i + 0.5) * dz), cols[(i + j + 2) % cols.length]]);
  }
}

function hotspot(h: Hot): Spec {
  const [wx0, wx1, wz0, wz1] = h.r, O: [number, number] = [(wx0 + wx1) / 2, (wz0 + wz1) / 2];
  const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
  // (facing north: the stair block on the west, the wider block with the vent on the east, as the photos show)
  const sw = 2.6, se = 4.0, bx0 = wx0 + sw, bx1 = wx1 - se;
  return {
    name: h.name, axis: [1, 0], origin: O, storey: 3, style: W_PLAIN, roofColor: ROOF, fascia: FASCIA_W, pitch: 0.3,
    blocks: [],
    keep: [[X(wx0) - 1, X(wx1) + 1, Z(wz0) - 6, Z(wz1) + 1]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      // the solid blocks either side, two levels, white
      for (const [a, b] of [[wx0, bx0], [bx1, wx1]]) c.push([B(a, b, 0, EAVE, wz0, wz1), WHITE_NEW]);
      // the back wall of the sitting area (half height, open above to the trees behind) and the deck's back wall
      c.push([B(bx0, bx1, 0.15, 1.0, wz1 - 0.25, wz1), WHITE_NEW]);
      // the floors: the paved sitting area a step up, the deck's slab with a white face, the ceilings
      c.push([B(wx0 - 0.3, wx1 + 0.3, 0, 0.15, wz0 - 0.4, wz1 + 0.3), '#d4d0c6']);
      c.push([B(bx0, bx1, H1, H1 + 0.45, wz0, wz1), WHITE_NEW]);
      const ceil = h.first ? '#2a5fd0' : '#f2f1ec';
      k.plain.push([B(bx0, bx1, H1 - 0.03, H1, wz0 + 0.3, wz1), ceil], [B(bx0, bx1, H2 - 0.03, H2, wz0 + 1.2, wz1), ceil]);
      // the deck: set back a little behind a black railing of horizontal bars, its back wall with a door
      const rz = wz0 + 0.6;
      for (const y of [H1 + 0.6, H1 + 0.85, H1 + 1.1, H1 + 1.35]) k.plain.push([B(bx0 + 0.3, bx1 - 0.3, y - 0.025, y + 0.025, rz - 0.02, rz + 0.02), '#1b1b1b']);
      for (let x = bx0 + 0.3; x <= bx1 - 0.29; x += 1.6) k.plain.push([B(x - 0.03, x + 0.03, H1 + 0.45, H1 + 1.4, rz - 0.03, rz + 0.03), '#1b1b1b']);
      c.push([B(bx0, bx1, H1 + 0.45, H2, wz1 - 0.25, wz1), WHITE_NEW]);
      k.plain.push([B((bx0 + bx1) / 2 - 0.6, (bx0 + bx1) / 2 + 0.6, H1 + 0.45, H1 + 2.6, wz1 - 0.27, wz1 - 0.25), '#2a2a2a']);
      if (h.first) {
        // the yellow frame round the deck's opening, blue soffits, the mural on the east block's face to the sitting area
        for (const [a, b] of [[bx0, bx0 + 0.3], [bx1 - 0.3, bx1]]) k.plain.push([B(a, b, H1 + 0.45, H2, wz0 + 0.3, wz0 + 0.45), '#f2c21a']);
        k.plain.push([B(bx0, bx1, H2 - 0.35, H2, wz0 + 0.3, wz0 + 0.45), '#f2c21a']);
        mural(k, bx0, wz0 + 1.0, wz0 + 5.5, 0.3, H1 - 0.2, 1);
        for (const z of [wz0 + 3, wz0 + 7]) for (const x of [bx0 + 3, bx1 - 3]) k.plain.push([new THREE.CylinderGeometry(0.6, 0.6, 0.03, 10).translate(X(x), H1 - 0.3, Z(z)), '#e8e8e8']);
      }
      // the band under the eaves across the front, the board on it, the white soffit and fascia over it
      c.push([B(wx0, wx1, H2, EAVE, wz0 - 0.4, wz0), h.band]);
      c.push([B(wx0 - 0.6, wx1 + 0.6, EAVE - 0.1, EAVE + 0.2, wz0 - 0.9, wz1 + 0.6), FASCIA_W]);
      const xm = (wx0 + wx1) / 2;
      k.plain.push([B(xm - 3.6, xm + 3.6, H2 + 0.1, EAVE - 0.1, wz0 - 0.46, wz0 - 0.4), h.board]);
      k.signs.push({ text: h.boardText, x: X(xm), y: H2 + 0.82, z: Z(wz0) - 0.47, ry: Math.PI, w: 6.4, colors: [h.board, '#f4f1e6'] });
      k.signs.push({ text: 'HOTSPOT COMFORT ZONE', x: X(xm), y: H2 + 0.38, z: Z(wz0) - 0.47, ry: Math.PI, w: 3.6, colors: h.boardSub });
      // the dark brown hip roof
      k.roof.c = new THREE.Color(ROOF);
      const X0 = X(wx0) - 0.6, X1 = X(wx1) + 0.6, Z0 = Z(wz0) - 0.9, Z1 = Z(wz1) + 0.6, e = EAVE + 0.2, half = (Z1 - Z0) / 2, top = e + half * 0.32, zm = (Z0 + Z1) / 2;
      const r0 = [X0 + half, top, zm], r1 = [X1 - half, top, zm];
      k.roof.quad([X0, e, Z0], [X1, e, Z0], r1, r0); k.roof.quad([X1, e, Z1], [X0, e, Z1], r0, r1);
      k.roof.quad([X0, e, Z1], [X0, e, Z0], r0, r0); k.roof.quad([X1, e, Z0], [X1, e, Z1], r1, r1);
      // the V: two steel struts from one foot before the middle up to the band
      const fz = wz0 - 0.9, foot: [number, number, number] = [X(xm), 0.15, Z(fz)];
      for (const s of [-1, 1]) {
        const top2: [number, number, number] = [X(xm + s * 2.4), H2 + 0.2, Z(wz0 - 0.5)];
        const v = new THREE.Vector3(top2[0] - foot[0], top2[1] - foot[1], top2[2] - foot[2]), len = v.length();
        const g = new THREE.CylinderGeometry(0.09, 0.09, len, 8);
        g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()));
        k.plain.push([g.translate((foot[0] + top2[0]) / 2, (foot[1] + top2[1]) / 2, (foot[2] + top2[2]) / 2), '#5a4a42']);
      }
      c.push([B(xm - 0.5, xm + 0.5, 0, 0.35, fz - 0.5, fz + 0.5), '#6a4e40']);
      SOLIDS.add(xm, fz, 0.6);
      // the west block's tall grey louvred vent, planter boxes before the blocks, benches and tables in the sitting area
      k.plain.push([B(wx1 - 2.6, wx1 - 1.4, 0.5, 3.0, wz0 - 0.03, wz0), '#8d9093']);
      for (let y = 0.6; y < 3.0; y += 0.12) k.plain.push([B(wx1 - 2.55, wx1 - 1.45, y, y + 0.04, wz0 - 0.06, wz0 - 0.03), '#6a6d70']);
      c.push([B(wx1 - 3.6, wx1 + 0.2, 0.15, 0.6, wz0 - 1.4, wz0 - 0.4), PLANTER], [B(xm - 0.4, xm + 1.8, 0.15, 0.6, wz0 + 1.0, wz0 + 1.8), PLANTER]);
      for (const x of [wx1 - 0.3, wx1 - 1.5, wx1 - 3.0, xm + 1.4, xm + 0.2]) k.plain.push([new THREE.IcosahedronGeometry(0.4, 0).scale(1, 0.9, 1).translate(X(x), 0.85, Z(x > xm + 2 ? wz0 - 0.9 : wz0 + 1.4)), '#4f8a35']);
      for (const [x, z] of [[bx1 - 1.5, wz0 + 4], [bx1 - 4.5, wz0 + 4], [bx1 - 1.5, wz0 + 8], [bx0 + 2, wz0 + 8]]) {
        if (x < bx0 + 1) continue;
        k.plain.push([B(x - 0.9, x + 0.9, 0.85, 0.92, z - 0.4, z + 0.4), '#6b5444'], [B(x - 0.9, x + 0.9, 0.5, 0.56, z - 1.0, z - 0.7), '#6b5444'], [B(x - 0.9, x + 0.9, 0.5, 0.56, z + 0.7, z + 1.0), '#6b5444']);
        for (const dx of [-0.8, 0.8]) k.plain.push([B(x + dx - 0.04, x + dx + 0.04, 0.15, 0.85, z - 1.0, z + 1.0), '#3a3a3a']);
      }
      // the stair up to the deck at the west block's front, a black handrail
      for (let i = 0; i < 10; i++) c.push([B(wx0 + 0.2, bx0 - 0.2, 0, 0.15 + (i + 1) * 0.33, wz0 - 0.2 - 3.0 + i * 0.3, wz0 - 0.2 - 3.0 + (i + 1) * 0.3), '#d4d0c6']);
      k.plain.push([new THREE.BoxGeometry(0.05, 0.05, 3.4).rotateX(-0.83).translate(X(bx0 - 0.25), 2.6, Z(wz0 - 1.7)), '#1b1b1b']);
      // a paved walk from the loop to the front, the paved apron
      c.push([B(xm - 1.2, xm + 1.2, 0, 0.06, 262, wz0 - 0.4), '#c9c3b5'], [B(wx0 - 2, wx1 + 2, 0, 0.05, wz0 - 4, wz0 - 0.4), '#c9c3b5']);
      // walls and struts block the bike; the open sitting area is open
      for (const [a, b] of [[wx0, bx0], [bx1, wx1]]) for (let x = a; x <= b; x += 0.5) for (let z = wz0; z <= wz1; z += 0.5) SOLIDS.add(x, z, 0.3);
      // trees round it
      const g = garden([wx0 - 12, wx1 + 12, wz0 - 12, wz1 + 10]);
      g.reseed(h.first ? 41 : 43);
      for (const [x, z, s] of [[wx0 - 3, wz0 - 6, 1.6], [wx1 + 3.5, wz0 - 5, 1.5], [wx0 - 4, wz1 + 4, 1.8], [wx1 + 4, wz1 + 3, 1.7]] as [number, number, number][]) g.tree(k, X(x), Z(z), s);
      const m = new THREE.Mesh(merge(c), concrete(0.08));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
}

/** the hotspot comfort zones south of the loop at the end of the avenue */
export const hotspotSite = createSite('hotspots', HOTS.map(hotspot));
