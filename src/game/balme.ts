// Round the Balme Library: the CEDI Conference Centre and the building with Standard Chartered and
// Absa, from the owner's photos and marked aerial (block engine: blocks.ts). The two-storey and
// single-storey blocks the owner marked round the square (Economics, the Bookshop, the Faculty of Arts,
// the Dean of Students, the Post Office) keep the generic builder, at their storeys.
//
// CEDI Conference Centre: a big white hall of two tall storeys under a pink hipped roof edged by a white
// parapet, rows of tall narrow windows, a raked white stage tower at the north end. The main entrance is
// on the west face toward Volta Hall, a porch under a red canopy (owner's photo and mark); on the east
// face toward the Balme Library the name runs across the top over the doors.
//
// Standard Chartered and Absa share a one-floor building south of the Bookshop: Standard Chartered on
// the west, Absa on the east by the road, their doors on the north face (owner's marks), Standard
// Chartered's ATMs on the south face toward Legon Hall and Akuafo Hall.
//
// The Balme Library (owner's photos: the front from the south, its arched door 'THE BALME LIBRARY' up a flight of
// steps; a top view from the south; the north-west corner; the north side from the fountain in the Kuffour
// Quadrangle), on the OSM outline (relation 7304886) with its five courtyards: a tall centre block under a stack of
// hipped roofs rising to the clock tower and its red spire, a one-floor entrance range in front of it, two-floor
// inner wings running north-south either side with their hipped ends forward of the entrance, two-floor ranges
// across the middle and along the north, and four-floor outer wings with arms reaching east and west. Behind the
// library, the round fountain with its blue sculpture in the Kuffour Quadrangle.
import * as THREE from 'three';
import { WHITE, box, canvas } from './modelkit';
import { PL, createSite, gableZ, render, window_, type Block, type Kit, type Spec, type Style } from './blocks';
import { stairsOf } from './relief';

// ---------- CEDI Conference Centre ----------
const C: [number, number, number, number] = [-153.4, -106.4, 1.7, 49.7];
const CO: [number, number] = [(C[0] + C[1]) / 2, (C[2] + C[3]) / 2];
const cx = (x: number) => x - CO[0], cz = (z: number) => z - CO[1];
const ST = 5.2, F = 2;
/** white render, pairs of tall narrow dark windows the height of each storey (owner's photos) */
const CEDI_WALL: Style = {
  bay: 3.6,
  up: [[70, 30, 36, 200], [150, 30, 36, 200]],
  ground: [[70, 256 + 30, 36, 200], [150, 256 + 30, 36, 200]],
  draw: (g) => {
    render(g, '#f6f6f3');
    for (const y0 of [0, 256]) for (const x of [70, 150]) { g.fillStyle = '#1f2329'; g.fillRect(x, y0 + 30, 36, 200); g.fillStyle = '#e9e9e5'; g.fillRect(x - 3, y0 + 228, 42, 6); }
  },
};
/** the east face toward the Balme Library (owner's photo): pairs of dark square windows upstairs, tall windows in
 *  brown frames on the ground floor */
const CEDI_EAST: Style = {
  bay: 3.6,
  up: [[52, 70, 70, 76], [134, 70, 70, 76]],
  ground: [[60, 256 + 40, 136, 180]],
  draw: (g) => {
    render(g, '#f6f6f3');
    for (const x of [52, 134]) { g.fillStyle = '#1b1f25'; g.fillRect(x, 70, 70, 76); g.fillStyle = '#e4e4df'; g.fillRect(x - 3, 146, 76, 5); }
    g.fillStyle = '#6a4630'; g.fillRect(56, 256 + 36, 144, 188);
    g.fillStyle = '#1b1f25'; for (const [x, y] of [[62, 42], [130, 42], [62, 132], [130, 132]]) g.fillRect(x, 256 + y, 62, 84);
  },
};
const cedi: Spec = {
  name: 'Cedi Conference Centre',
  axis: [1, 0], origin: CO, storey: ST, style: CEDI_WALL, roofColor: '#c8776c', fascia: '#f6f6f3', pitch: 0.3,
  replaces: [CO],
  blocks: [{ x0: cx(C[0]), x1: cx(C[1]), z0: cz(C[2]), z1: cz(C[3]), floors: F, roof: 'none', faces: { x1: CEDI_EAST } }],
  keep: [[cx(C[0]) - 5, cx(C[0]), cz(6), cz(15)], [cx(C[1]), cx(C[1]) + 7, cz(-2), cz(12)], [cx(C[1]), cx(C[1]) + 2, cz(C[2]), cz(C[3])]],
  extras: (k: Kit) => {
    const [x0, x1, z0, z1] = [cx(C[0]), cx(C[1]), cz(C[2]), cz(C[3])];
    const e = k.wallTop(F);
    // the deep white entablature round the roof, in stepped bands (owner's photo of the east face); on the east it
    // stands out over the columns. The pink hipped roof rises inside it (owner's top view)
    const ent = (a: number, b: number, c: number, out: number, eastOut: number) => {
      k.plain.push([box(a - out, a + 0.5, b, c, z0 - out, z1 + out), WHITE], [box(x1 - 0.5, x1 + eastOut, b, c, z0 - out, z1 + out), WHITE]);
      k.plain.push([box(a - out, x1 + eastOut, b, c, z0 - out, z0 + 0.5), WHITE], [box(a - out, x1 + eastOut, b, c, z1 - 0.5, z1 + out), WHITE]);
    };
    ent(x0, e - 0.6, e, 0.25, 1.85);
    ent(x0, e, e + 0.9, 0.1, 1.7);
    ent(x0, e + 0.9, e + 1.25, 0.45, 2.05);
    ent(x0, e + 1.25, e + 2.4, 0.2, 1.8);
    ent(x0, e + 2.4, e + 2.7, 0.5, 2.1);
    // shadow lines between the bands
    for (const y of [e, e + 1.25, e + 2.4]) k.plain.push([box(x1 + 1.6, x1 + 1.72, y - 0.06, y, z0, z1), '#d9d8d2']);
    k.roof.c = new THREE.Color('#c8776c');
    const i = 0.5, w = x1 - x0 - 2 * i, h = z1 - z0 - 2 * i, half = Math.min(w, h) / 2, top = e + 1.2 + half * 0.22;
    const X0 = x0 + i, X1 = x1 - i, Z0 = z0 + i, Z1 = z1 - i, zm = (z0 + z1) / 2, r0 = [X0 + half, top, zm], r1 = [X1 - half, top, zm];
    const ey = e + 1.2;
    k.roof.quad([X0, ey, Z0], [X1, ey, Z0], r1, r0);
    k.roof.quad([X1, ey, Z1], [X0, ey, Z1], r0, r1);
    k.roof.quad([X0, ey, Z1], [X0, ey, Z0], r0, r0);
    k.roof.quad([X1, ey, Z0], [X1, ey, Z1], r1, r1);
    // the raked white stage tower at the north end (owner's photo from the west)
    const tz0 = z0, tz1 = z0 + 11, tx0 = x0 + 6, tx1 = x1 - 6, th = e + 8.5;
    k.plain.push([box(tx0, tx1, e, th - 2.5, tz0, tz1), WHITE]);
    const slope = new THREE.Shape([new THREE.Vector2(tz0, th - 2.5), new THREE.Vector2(tz1, th - 2.5), new THREE.Vector2(tz0, th)].map((v) => v));
    const wedge = new THREE.ExtrudeGeometry(slope, { depth: tx1 - tx0, bevelEnabled: false }).rotateY(-Math.PI / 2).translate(tx1, 0, 0);
    k.plain.push([wedge, WHITE]);
    for (let x = tx0 + 2; x < tx1 - 1; x += 3) k.plain.push([box(x - 0.25, x + 0.25, e + 0.8, th - 3.2, tz0 - 0.04, tz0), '#1f2329']);
    // the main entrance on the west face toward Volta: a porch under a red canopy (owner's photo, marked)
    const pz = cz(10.6);
    k.plain.push([box(x0 - 3.2, x0, 3.2, 3.5, pz - 3.4, pz + 3.4), '#b8483a']);
    k.plain.push([box(x0 - 3.3, x0, 3.5, 3.9, pz - 3.5, pz + 3.5), '#c75a48']);
    for (const dz of [-3, 3]) k.plain.push([box(x0 - 3.1, x0 - 2.8, 0, 3.2, pz + dz - 0.15, pz + dz + 0.15), WHITE]);
    k.plain.push([box(x0 - 0.05, x0, PL, PL + 2.7, pz - 2, pz + 2), '#2b2f36']);
    k.plain.push([box(x0 - 3.4, x0, 0, 0.2, pz - 3.6, pz + 3.6), '#c9c3b5']);
    // the east face toward the Balme Library (owner's photo): round columns the height of both floors stand
    // out from the wall under the entablature; at the north end a tall portico on two columns shelters the doors
    const col = (x: number, z: number, r: number) => {
      k.plain.push([new THREE.CylinderGeometry(r, r * 1.08, e - 0.6, 20).translate(x, (e - 0.6) / 2, z), WHITE]);
      k.plain.push([box(x - r - 0.15, x + r + 0.15, e - 0.9, e - 0.6, z - r - 0.15, z + r + 0.15), WHITE]);
      k.plain.push([box(x - r - 0.1, x + r + 0.1, 0, 0.35, z - r - 0.1, z + r + 0.1), '#e2e1dc']);
    };
    for (let z = z0 + 13; z < z1 - 1; z += 7.2) col(x1 + 1.1, z, 0.42);
    // the portico: a deep canopy at the top of the entablature on two big columns, reaching past the north end
    const pz0 = z0 - 3.5, pz1 = z0 + 9.5;
    k.plain.push([box(x1, x1 + 7.2, e - 0.6, e + 1.2, pz0, pz1), WHITE]);
    k.plain.push([box(x1 + 6.9, x1 + 7.4, e + 0.9, e + 1.35, pz0 - 0.25, pz1 + 0.25), WHITE]);
    k.plain.push([box(x1 + 1.8, x1 + 7.1, e - 0.65, e - 0.6, pz0 + 0.3, pz1 - 0.3), '#e8e7e2']);
    col(x1 + 6.2, z0 - 2.4, 0.62);
    col(x1 + 6.2, z0 + 8.4, 0.62);
    for (const z of [z0 + 1.5, z0 + 5]) k.plain.push([box(x1 + 0.6, x1 + 2.2, e - 0.65, e - 0.6, z - 0.3, z + 0.3), '#fff6d8']);
    const dz = z0 + 4;
    k.plain.push([box(x1, x1 + 0.06, PL, PL + 3.2, dz - 2, dz + 2), '#2b2f36']);
    k.plain.push([box(x1, x1 + 7.2, 0, 0.18, pz0, pz1), '#cfc9bd']);
    // the name on a plaque standing on the entablature, over the middle of the front
    k.plain.push([box(x1 + 1.75, x1 + 1.95, e + 2.7, e + 4.0, -7.5, 1.5), '#e9e8e3']);
    k.signs.push({ text: 'UG  CEDI CONFERENCE CENTRE', x: x1 + 1.97, y: e + 3.45, z: -3, ry: Math.PI / 2, w: 8.4, colors: ['#e9e8e3', '#2a3a6a'] });
    k.signs.push({ text: 'DEPARTMENT OF ECONOMICS', x: x1 + 1.97, y: e + 2.95, z: -3, ry: Math.PI / 2, w: 5.2, colors: ['#e9e8e3', '#2a3a6a'] });
    // air-conditioning units along the foot of the wall
    for (let z = z0 + 14; z < z1 - 2; z += 4.5) k.plain.push([box(x1, x1 + 0.4, 0.2, 0.75, z - 0.45, z + 0.45), '#e6e6e3']);
    // the taller block at the south end, set back from the east front: small square windows (owner's photos)
    const sx0 = x0, sx1 = x1 - 9, sz0 = z1 - 10, top2 = e + 5.6;
    k.plain.push([box(sx0, sx1, e, top2, sz0, z1), WHITE]);
    k.plain.push([box(sx0 - 0.3, sx1 + 0.3, top2, top2 + 0.5, sz0 - 0.3, z1 + 0.3), WHITE]);
    for (const y of [e + 1.2, e + 3.4]) {
      for (let x = sx0 + 3; x < sx1 - 1; x += 4.5) k.plain.push([box(x - 0.55, x + 0.55, y, y + 1.1, z1 - 0.02, z1 + 0.04), '#1b1f25']);
      for (let z = sz0 + 2.5; z < z1 - 1; z += 3.6) k.plain.push([box(sx1 - 0.02, sx1 + 0.04, y, y + 1.1, z - 0.55, z + 0.55), '#1b1f25']);
    }
  },
};

// ---------- UGCS (University of Ghana Computing Systems), north of CEDI ----------
// (owner's photo of the side facing CEDI): four floors, white, windows in brown frames in a regular grid, a long
// roof of orange tiles over a brown fascia; at the west end a flat-topped bay with a blank board on it and barred
// openings below; along the ground floor right of the middle, a porch under a tiled roof over the glazed entrance
const U: [number, number, number, number] = [-125.9, -87.8, -53.2, -32.4];
const UO: [number, number] = [(U[0] + U[1]) / 2, (U[2] + U[3]) / 2];
const UGCS_WALL: Style = {
  bay: 3.3,
  up: [[66, 52, 124, 120]],
  ground: [[66, 256 + 56, 124, 120]],
  draw: (g) => {
    render(g, '#f4f3ef');
    for (const y0 of [0, 256]) {
      g.fillStyle = '#7a5434'; g.fillRect(60, y0 + 46, 136, 132);
      g.fillStyle = '#2a2a2a'; g.fillRect(66, y0 + 52, 124, 120);
      g.fillStyle = '#7a5434'; g.fillRect(126, y0 + 52, 4, 120); g.fillRect(66, y0 + 92, 124, 4);
      g.fillStyle = 'rgba(230,226,214,0.35)'; g.fillRect(70, y0 + 56, 50, 34);
    }
  },
};
const UGCS_BAY: Style = { bay: 3, up: [], ground: [], draw: (g) => render(g, '#f4f3ef') };
const ugcs: Spec = {
  name: 'University of Ghana Computing Systems (UGCS)',
  axis: [1, 0], origin: UO, storey: 3.4, style: UGCS_WALL, roofColor: '#b8653a', fascia: '#6b4a2e', pitch: 0.42,
  replaces: [UO],
  blocks: [
    { x0: U[0] + 6 - UO[0], x1: U[1] - UO[0], z0: U[2] - UO[1], z1: U[3] - UO[1], floors: 4 },
    { x0: U[0] - UO[0], x1: U[0] + 6 - UO[0], z0: U[2] - UO[1], z1: U[3] - UO[1], floors: 4, roof: 'flat', faces: { z1: UGCS_BAY, x0: UGCS_BAY } },
  ],
  keep: [[-118.8 - UO[0], -104.8 - UO[0], U[3] - UO[1], U[3] - UO[1] + 4]],
  extras: (k: Kit) => {
    const z1 = U[3] - UO[1], e = k.wallTop(4), wx0 = U[0] - UO[0], wx1 = wx0 + 6;
    // the brown fascia band under the eaves
    k.plain.push([box(wx1, U[1] - UO[0], e - 0.5, e, z1, z1 + 0.06), '#6b4a2e']);
    // the west bay: a parapet, the blank board, and barred openings on the ground floor
    k.plain.push([box(wx0, wx1, e, e + 0.7, U[2] - UO[1], z1), '#f4f3ef']);
    k.plain.push([box(wx0 + 0.6, wx1 - 0.6, 5.2, 9.4, z1, z1 + 0.06), '#7a5434'], [box(wx0 + 0.75, wx1 - 0.75, 5.35, 9.25, z1 + 0.06, z1 + 0.1), '#f2f1ec']);
    k.plain.push([box(wx0, wx1 + 7, 3.4, 3.9, z1, z1 + 0.12), '#f2f1ec']);
    for (let x = wx0 + 0.4; x < wx1 + 6.6; x += 0.25) k.plain.push([box(x, x + 0.06, PL, 3.3, z1 + 0.02, z1 + 0.08), '#3a3a3a']);
    // the porch over the entrance: a tiled roof on posts, glass and notice boards behind
    const px0 = -118.8 - UO[0], px1 = -104.8 - UO[0], d = 3.6;
    k.plain.push([box(px0, px1, PL, 3.1, z1, z1 + 0.06), '#33404a']);
    for (let x = px0 + 1.4; x < px1 - 1; x += 2.6) k.plain.push([box(x, x + 1.4, 1.2, 2.3, z1 + 0.06, z1 + 0.1), '#d9dde2']);
    k.roof.c = new THREE.Color('#b8653a');
    const ey = 3.3, top = 4.5;
    k.roof.quad([px0 - 0.4, ey, z1 + d], [px0 - 0.4, ey, z1], [px0 + 1.2, top, z1], [px0 + 1.2, top, z1 + d - 1.2]);
    k.roof.quad([px1 + 0.4, ey, z1], [px1 + 0.4, ey, z1 + d], [px1 - 1.2, top, z1 + d - 1.2], [px1 - 1.2, top, z1]);
    k.roof.quad([px1 + 0.4, ey, z1 + d], [px0 - 0.4, ey, z1 + d], [px0 + 1.2, top, z1 + d - 1.2], [px1 - 1.2, top, z1 + d - 1.2]);
    k.plain.push([box(px0 - 0.4, px1 + 0.4, ey - 0.4, ey, z1 + d - 0.05, z1 + d + 0.05), '#6b4a2e']);
    for (const x of [px0 + 0.2, px1 - 0.2]) k.plain.push([box(x - 0.15, x + 0.15, 0, ey, z1 + d - 0.35, z1 + d - 0.05), '#f2f1ec']);
    k.plain.push([box(px0, px1, 0, 0.15, z1, z1 + d), '#cfc9bd']);
    // air-conditioning units on the wall
    for (const [x, y] of [[-106, 4.4], [-100, 4.4], [-96, 4.4], [-113, 4.4]]) k.plain.push([box(x - UO[0] - 0.45, x - UO[0] + 0.45, y, y + 0.6, z1, z1 + 0.35), '#e6e6e3']);
    k.roof.c = new THREE.Color('#b8653a');
  },
};

// ---------- the Standard Chartered and Absa building ----------
const B: [number, number, number, number] = [65, 83, 94.7, 106.3];
const BO: [number, number] = [(B[0] + B[1]) / 2, (B[2] + B[3]) / 2];
const BANK_WALL: Style = {
  bay: 3.2,
  up: [],
  ground: [[60, 256 + 70, 136, 120]],
  draw: (g) => { render(g, '#f4f3ef'); window_(g, [60, 256 + 70, 136, 120], '#e9e9e5', 2, 0.3); },
};
const banks: Spec = {
  name: 'Standard Chartered and Absa',
  axis: [1, 0], origin: BO, storey: 3.4, style: BANK_WALL, roofColor: '#bf6a3e', fascia: '#f4f3ef', pitch: 0.4,
  replaces: [BO],
  blocks: [{ x0: B[0] - BO[0], x1: B[1] - BO[0], z0: B[2] - BO[1], z1: B[3] - BO[1], floors: 1 }],
  keep: [],
  extras: (k) => {
    const z0 = B[2] - BO[1], z1 = B[3] - BO[1];
    // the doors on the north face: Standard Chartered on the west, Absa on the east by the road (owner's marks)
    for (const [x, band, accent, text] of [[70.2, '#0d6ab0', '#38a046', 'Standard Chartered'], [78, '#a50034', '#e31c3d', 'Absa']] as [number, string, string, string][]) {
      const lx = x - BO[0];
      k.plain.push([box(lx - 1.75, lx + 1.75, PL, PL + 2.55, z0 - 0.03, z0), '#f4f3ef']);
      k.plain.push([box(lx - 1.1, lx + 1.1, PL, PL + 2.5, z0 - 0.05, z0), '#2b2f36']);
      k.plain.push([box(lx - 1.6, lx + 1.6, PL + 2.55, PL + 3.15, z0 - 0.08, z0), band]);
      k.plain.push([box(lx - 1.6, lx + 1.6, PL + 2.55, PL + 2.68, z0 - 0.1, z0 - 0.06), accent]);
      k.signs.push({ text, x: lx, y: PL + 2.86, z: z0 - 0.11, ry: Math.PI, w: 2.6, colors: [band, '#ffffff'] });
      k.plain.push([box(lx - 1.8, lx + 1.8, 0, 0.18, z0 - 1.6, z0), '#c9c3b5']);
    }
    // Standard Chartered's ATMs on the south face, toward Legon Hall and Akuafo Hall
    const ax = 70.2 - BO[0];
    k.plain.push([box(ax - 2.6, ax + 2.6, PL, PL + 2.2, z1, z1 + 0.03), '#f4f3ef']);
    k.plain.push([box(ax - 2.6, ax + 2.6, PL + 2.2, PL + 2.9, z1, z1 + 0.06), '#0d6ab0']);
    for (const dx of [-1.4, 0, 1.4]) {
      k.plain.push([box(ax + dx - 0.45, ax + dx + 0.45, 0, 1.7, z1, z1 + 0.35), '#2f3540']);
      k.plain.push([box(ax + dx - 0.3, ax + dx + 0.3, 1.0, 1.45, z1 + 0.35, z1 + 0.38), '#7fb2d9']);
    }
    k.signs.push({ text: 'Standard Chartered ATM', x: ax, y: PL + 2.55, z: z1 + 0.08, ry: 0, w: 3.6, colors: ['#0d6ab0', '#ffffff'] });
  },
};

// ---------- the Balme Library ----------
const LO: [number, number] = [5.15, -25.6]; // the middle of the centre block, under the clock tower
const L = (x0: number, x1: number, z0: number, z1: number, floors: number, more: Partial<Block> = {}): Block =>
  ({ x0: x0 - LO[0], x1: x1 - LO[0], z0: z0 - LO[1], z1: z1 - LO[1], floors, ...more });
/** white render, a dark window with a white frame in every bay (owner's photos) */
const LIB_WALL: Style = {
  bay: 3.4,
  up: [[86, 48, 84, 150]],
  ground: [[86, 256 + 56, 84, 150]],
  draw: (g) => { render(g, '#f7f5ef'); window_(g, [86, 48, 84, 150], '#ffffff', 2, 0.3); window_(g, [86, 256 + 56, 84, 150], '#ffffff', 2, 0.3); },
};
/** the centre block: tall narrow windows (owner's top view) */
const LIB_TALL: Style = {
  bay: 2.4,
  up: [[96, 18, 64, 220]],
  ground: [[96, 256 + 24, 64, 214]],
  draw: (g) => { render(g, '#f7f5ef'); window_(g, [96, 18, 64, 220], '#ffffff', 1, 0.2); window_(g, [96, 256 + 24, 64, 214], '#ffffff', 1, 0.2); },
};
const TILE = '#b9592f';
/** a tiled roof sloping from an outer rectangle at y0 up to an inner one at y1 (round a tower stage) */
function collar(k: Kit, [ox0, ox1, oz0, oz1]: number[], [ix0, ix1, iz0, iz1]: number[], y0: number, y1: number) {
  k.roof.quad([ox0, y0, oz0], [ox1, y0, oz0], [ix1, y1, iz0], [ix0, y1, iz0]);
  k.roof.quad([ox1, y0, oz1], [ox0, y0, oz1], [ix0, y1, iz1], [ix1, y1, iz1]);
  k.roof.quad([ox1, y0, oz0], [ox1, y0, oz1], [ix1, y1, iz1], [ix1, y1, iz0]);
  k.roof.quad([ox0, y0, oz1], [ox0, y0, oz0], [ix0, y1, iz0], [ix0, y1, iz1]);
  k.plain.push([box(ox0, ox1, y0 - 0.3, y0 + 0.03, oz0 - 0.06, oz0 + 0.06), WHITE], [box(ox0, ox1, y0 - 0.3, y0 + 0.03, oz1 - 0.06, oz1 + 0.06), WHITE]);
  k.plain.push([box(ox0 - 0.06, ox0 + 0.06, y0 - 0.3, y0 + 0.03, oz0, oz1), WHITE], [box(ox1 - 0.06, ox1 + 0.06, y0 - 0.3, y0 + 0.03, oz0, oz1), WHITE]);
}
/** a square stage of white wall, half-width h, from y0 to y1, with n dark windows on each face */
function stage(k: Kit, h: number, y0: number, y1: number, n: number, ww: number, wy0: number, wy1: number) {
  k.plain.push([box(-h, h, y0, y1, -h, h), WHITE]);
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : (i / (n - 1) - 0.5) * (2 * h - 2.2);
    k.plain.push([box(t - ww / 2, t + ww / 2, wy0, wy1, -h - 0.05, h + 0.05), '#2a2f38'], [box(-h - 0.05, h + 0.05, wy0, wy1, t - ww / 2, t + ww / 2), '#2a2f38']);
  }
}
let clockTex: THREE.Texture | null = null;
const clockFace = () => (clockTex ??= canvas(128, 128, (x) => {
  x.fillStyle = '#f7f3e8'; x.beginPath(); x.arc(64, 64, 60, 0, Math.PI * 2); x.fill();
  x.strokeStyle = '#1d2333'; x.lineWidth = 6; x.stroke();
  x.fillStyle = '#1d2333';
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; x.fillRect(64 + Math.sin(a) * 46 - 3, 64 - Math.cos(a) * 46 - 3, 6, 6); }
  x.lineCap = 'round';
  x.lineWidth = 7; x.beginPath(); x.moveTo(64, 64); x.lineTo(88, 50); x.stroke();
  x.lineWidth = 5; x.beginPath(); x.moveTo(64, 64); x.lineTo(60, 22); x.stroke();
}));
const library: Spec = {
  name: 'The Balme Library',
  axis: [1, 0], origin: LO, storey: 4.4, style: LIB_WALL, roofColor: TILE, fascia: '#f7f5ef', pitch: 0.62,
  blocks: [
    L(-45, 57.1, -56.3, -48.3, 2), // the north range
    L(-23.9, -9.2, -58.3, 11.3, 2), // the inner west wing, its hipped end forward of the entrance
    L(19.6, 34.5, -58.3, 11.3, 2), // the inner east wing
    L(-45, -23.9, -32.7, -18.1, 2), // the range across the middle, west
    L(34.5, 57.1, -32.7, -18.1, 2), // and east
    L(-9.2, 19.6, -32.7, -18.1, 2), // and behind the centre block
    L(-5.3, 15.6, -36.5, -14.7, 3, { roof: 'none', faces: { x0: LIB_TALL, x1: LIB_TALL, z0: LIB_TALL, z1: LIB_TALL } }), // the centre block
    L(-9.2, 19.6, -1.8, 6.9, 1, { pitch: 0.5 }), // the entrance range
  ],
  keep: [[-6, 6, 32.4, 38]],
  extras: (k: Kit) => {
    // the stack over the centre block (owner's photos): a broad hipped roof round a square stage with three
    // windows a side, its own hipped roof round the clock tower, the clock faces over a railed balcony, a small
    // hipped cap, an open lantern and the red spire
    const E = k.wallTop(3), bx = 10.45 + 0.8, bz = 10.9 + 0.8;
    const S1 = 4.6, s1top = E + 7;
    stage(k, S1, E, s1top, 3, 1.1, E + 4.4, E + 6.2);
    collar(k, [-bx, bx, -bz, bz], [-S1, S1, -S1, S1], E, E + 3.6);
    const C = 1.7, ctop = s1top + 7.4;
    k.plain.push([box(-C, C, s1top, ctop, -C, C), WHITE]);
    collar(k, [-S1 - 1.1, S1 + 1.1, -S1 - 1.1, S1 + 1.1], [-C, C, -C, C], s1top, s1top + 1.9);
    // the balcony round the foot of the clock stage, and its railing
    const by = s1top + 3.2;
    k.plain.push([box(-C - 0.5, C + 0.5, by - 0.2, by, -C - 0.5, C + 0.5), WHITE]);
    for (const [a, b, c, d] of [[-C - 0.5, C + 0.5, -C - 0.5, -C - 0.42], [-C - 0.5, C + 0.5, C + 0.42, C + 0.5], [-C - 0.5, -C - 0.42, -C - 0.5, C + 0.5], [C + 0.42, C + 0.5, -C - 0.5, C + 0.5]]) k.plain.push([box(a, b, by + 0.85, by + 0.95, c, d), '#e9e6de']);
    for (let t = -C - 0.45; t <= C + 0.46; t += 0.45) for (const [x, z] of [[t, -C - 0.46], [t, C + 0.46], [-C - 0.46, t], [C + 0.46, t]]) k.plain.push([box(x - 0.04, x + 0.04, by, by + 0.9, z - 0.04, z + 0.04), '#e9e6de']);
    // tall narrow openings under the clocks
    for (const [x, z, w, d] of [[0, -C, 0.5, 0.1], [0, C, 0.5, 0.1], [-C, 0, 0.1, 0.5], [C, 0, 0.1, 0.5]]) k.plain.push([box(x - w / 2 - 0.02, x + w / 2 + 0.02, by + 0.3, by + 2.3, z - d / 2 - 0.02, z + d / 2 + 0.02), '#2a2f38']);
    const cy = ctop - 1.6, mat = new THREE.MeshStandardMaterial({ map: clockFace(), roughness: 0.6 });
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2, f = new THREE.Mesh(new THREE.CircleGeometry(1.15, 24), mat);
      f.position.set(Math.sin(a) * (C + 0.03), cy, Math.cos(a) * (C + 0.03));
      f.rotation.y = a;
      k.meshes.push(f);
    }
    const capTop = ctop + 1.3, L2 = 0.85;
    collar(k, [-C - 0.6, C + 0.6, -C - 0.6, C + 0.6], [-L2, L2, -L2, L2], ctop, capTop);
    // the lantern: four posts and a slab, then the red spire and its finial
    for (const [x, z] of [[-L2, -L2], [L2, -L2], [-L2, L2], [L2, L2]]) k.plain.push([box(x - 0.2, x + 0.2, capTop, capTop + 1.5, z - 0.2, z + 0.2), WHITE]);
    k.plain.push([box(-L2 - 0.1, L2 + 0.1, capTop + 1.5, capTop + 1.75, -L2 - 0.1, L2 + 0.1), WHITE]);
    k.plain.push([new THREE.ConeGeometry(1.3, 4.2, 4).rotateY(Math.PI / 4).translate(0, capTop + 1.75 + 2.1, 0), '#b3262b']);
    k.plain.push([box(-0.05, 0.05, capTop + 5.9, capTop + 7, -0.05, 0.05), '#3a3a3a']);
    // the entrance on the south face of the entrance range (owner's photo): a round-arched doorway with a grey
    // shutter, 'THE BALME LIBRARY' over the arch, windows and notice boards either side, up a flight of steps
    const fz = 6.9 - LO[1], ax = 0;
    k.plain.push([box(ax - 2.6, ax + 2.6, PL, PL + 4.1, fz, fz + 0.25), '#fbf9f3']);
    k.plain.push([box(ax - 1.5, ax + 1.5, PL, PL + 2.6, fz + 0.25, fz + 0.3), '#8d9399']);
    k.plain.push([new THREE.CylinderGeometry(1.5, 1.5, 0.05, 20, 1, false, -Math.PI / 2, Math.PI).rotateX(-Math.PI / 2).translate(ax, PL + 2.6, fz + 0.3), '#8d9399']);
    for (const dx of [-0.75, 0, 0.75]) k.plain.push([box(ax + dx - 0.03, ax + dx + 0.03, PL, PL + 3.5, fz + 0.3, fz + 0.33), '#6b7177']);
    k.signs.push({ text: 'THE BALME LIBRARY', x: ax, y: PL + 4.45, z: fz + 0.27, ry: 0, w: 4.4, colors: ['#fbf9f3', '#1d2333'] });
    for (const sx of [-1, 1]) {
      k.plain.push([box(ax + sx * 3.6 - 0.55, ax + sx * 3.6 + 0.55, PL + 0.9, PL + 2.9, fz, fz + 0.06), '#5a2a22']);
      k.plain.push([box(ax + sx * 5.2 - 0.6, ax + sx * 5.2 + 0.6, PL + 1.1, PL + 2.3, fz, fz + 0.06), '#dfe3e6']);
      k.plain.push([box(ax + sx * 4.6 - 0.6, ax + sx * 4.6 + 0.6, 0, 0.9, fz + 1.2, fz + 2.2), '#9a8f80']);
    }
    for (let i = 0; i < 4; i++) k.plain.push([box(ax - 5 - i * 0.3, ax + 5 + i * 0.3, 0, PL - i * 0.1, fz, fz + 1.2 + i * 1.1), '#cfc8bb']);
  },
};
/** the outer wings (owner's photo of the west side): bands of wide dark windows, narrow ones near the gable ends */
const OUTER_WALL: Style = {
  bay: 3.4,
  up: [[40, 70, 176, 100]],
  ground: [[40, 256 + 74, 176, 100]],
  draw: (g) => {
    render(g, '#f8f7f3');
    for (const y0 of [0, 256]) { g.fillStyle = '#1c2026'; g.fillRect(40, y0 + 70, 176, 100); g.fillStyle = '#3a3f46'; g.fillRect(126, y0 + 70, 4, 100); }
    g.fillStyle = '#8e2f2a'; g.fillRect(0, 512 - 24, 256, 24);
  },
};
/** perforated concrete blocks: a white screen wall with square openings, on a maroon base */
let screenMat: THREE.MeshStandardMaterial | null = null;
const screen = () => (screenMat ??= (() => {
  const t = canvas(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.fillStyle = '#ecebe5'; g.fillRect(0, 0, 64, 64);
    g.clearRect(10, 10, 18, 18); g.clearRect(36, 10, 18, 18); g.clearRect(10, 36, 18, 18); g.clearRect(36, 36, 18, 18);
  });
  return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.9 });
})());
/** a screen wall from (ax, az) to (bx, bz): the perforated panel over a solid maroon base, with piers */
function screenWall(k: Kit, ax: number, az: number, bx: number, bz: number) {
  const len = Math.hypot(bx - ax, bz - az), ang = -Math.atan2(bz - az, bx - ax), mx = (ax + bx) / 2, mz = (az + bz) / 2;
  k.plain.push([new THREE.BoxGeometry(len, 0.7, 0.25).rotateY(ang).translate(mx, 0.35, mz), '#8e2f2a']);
  const geo = new THREE.PlaneGeometry(len, 1.8);
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len / 0.4, uv.getY(i) * 1.8 / 0.4);
  const m = new THREE.Mesh(geo, screen());
  m.position.set(mx, 0.7 + 0.9, mz); m.rotation.y = ang; m.castShadow = true;
  k.meshes.push(m);
  const n = Math.max(1, Math.round(len / 4));
  for (let i = 0; i <= n; i++) k.plain.push([box(ax + ((bx - ax) * i) / n - 0.2, ax + ((bx - ax) * i) / n + 0.2, 0, 2.6, az + ((bz - az) * i) / n - 0.2, az + ((bz - az) * i) / n + 0.2), '#ecebe5']);
}
/** a hipped pyramid roof of tiles over a square, with a dark fascia */
function pyramid(k: Kit, x0: number, x1: number, z0: number, z1: number, y: number, rise: number, o = 0.9) {
  const X0 = x0 - o, X1 = x1 + o, Z0 = z0 - o, Z1 = z1 + o, c = [(X0 + X1) / 2, y + rise, (Z0 + Z1) / 2];
  k.roof.c = new THREE.Color(TILE);
  k.roof.quad([X0, y, Z0], [X1, y, Z0], c, c); k.roof.quad([X1, y, Z1], [X0, y, Z1], c, c);
  k.roof.quad([X1, y, Z0], [X1, y, Z1], c, c); k.roof.quad([X0, y, Z1], [X0, y, Z0], c, c);
  for (const [a, b, cc, d] of [[X0, X1, Z0 - 0.05, Z0 + 0.05], [X0, X1, Z1 - 0.05, Z1 + 0.05], [X0 - 0.05, X0 + 0.05, Z0, Z1], [X1 - 0.05, X1 + 0.05, Z0, Z1]]) k.plain.push([box(a, b, y - 0.35, y, cc, d), '#3a2a22']);
}
const lx = (x: number) => x - LO[0], lz = (z: number) => z - LO[1];
const libraryWings: Spec = {
  name: 'Balme Library wings',
  axis: [1, 0], origin: LO, storey: 3.4, style: OUTER_WALL, roofColor: TILE, fascia: '#3a2a22', pitch: 0.62,
  // the four small corner kiosks (satellite outlines and the 'Balme Library extension') are drawn here
  replaces: [[-74.5, -50.3], [86, -50.2], [-73.9, 0.3], [86.2, 0.1]],
  blocks: [
    L(-59.1, -45, -58.3, 7.1, 4, { roof: 'none' }), // the outer west wing
    L(-74.3, -59.1, -32.7, -18.1, 1, { roof: 'none' }), // its gatehouse to the west, one floor
    L(57.1, 71.1, -58.3, 7.1, 4, { roof: 'none' }), // the outer east wing
    L(71.1, 85.9, -32.7, -18.1, 1, { roof: 'none' }), // its gatehouse to the east
    L(71.1, 76.9, -52.7, -44, 1), // the small annex on the east
  ],
  keep: [[lx(-80), lx(-59), lz(-50), lz(5)], [lx(71), lx(92), lz(-50), lz(5)]],
  extras: (k: Kit) => {
    const e4 = k.wallTop(4), e1 = k.wallTop(1);
    // the four-floor wings (owner's photo of the west side): a tiled roof along the wing, its ends gabled with dark
    // boarded triangles under the tiles, and a small lantern on the ridge in the middle
    for (const [wx0, wx1] of [[-59.1, -45], [57.1, 71.1]]) {
      const x0 = lx(wx0) - 0.8, x1 = lx(wx1) + 0.8, z0 = lz(-58.3) - 0.8, z1 = lz(7.1) + 0.8, pitch = 0.62;
      k.roof.c = new THREE.Color(TILE);
      gableZ(k, x0, x1, z0, z1, e4, pitch, [false, false]);
      const xc = (x0 + x1) / 2, top = e4 + ((x1 - x0) / 2) * pitch;
      for (const z of [z0 + 0.7, z1 - 0.8]) {
        const tri = new THREE.Shape([new THREE.Vector2(x0 + 0.9, e4), new THREE.Vector2(x1 - 0.9, e4), new THREE.Vector2(xc, top - 0.55)]);
        k.plain.push([new THREE.ExtrudeGeometry(tri, { depth: 0.1, bevelEnabled: false }).translate(0, 0, z), '#3a2a22']);
      }
      for (const [a, b, c, d] of [[x0, x1, z0 - 0.05, z0 + 0.05], [x0, x1, z1 - 0.05, z1 + 0.05], [x0 - 0.05, x0 + 0.05, z0, z1], [x1 - 0.05, x1 + 0.05, z0, z1]]) k.plain.push([box(a, b, e4 - 0.35, e4, c, d), '#3a2a22']);
      const lzm = lz(-25.4);
      k.plain.push([box(xc - 1.3, xc + 1.3, top - 0.6, top + 1.1, lzm - 1.3, lzm + 1.3), WHITE]);
      for (const sx of [-1, 1]) k.plain.push([box(xc + sx * 1.3 - 0.02, xc + sx * 1.3 + 0.02, top, top + 0.8, lzm - 0.9, lzm + 0.9), '#1c2026']);
      pyramid(k, xc - 1.3, xc + 1.3, lzm - 1.3, lzm + 1.3, top + 1.1, 1.0, 0.5);
      // the maroon base
      for (const [a, b, c, d] of [[lx(wx0) - 0.06, lx(wx0), lz(-58.3), lz(7.1)], [lx(wx1), lx(wx1) + 0.06, lz(-58.3), lz(7.1)]]) k.plain.push([box(a, b, 0, 0.8, c, d), '#8e2f2a']);
    }
    // the one-floor gatehouses on the arms, under steep pyramid roofs; on the west a dark doorway
    for (const [gx0, gx1] of [[-74.3, -59.1], [71.1, 85.9]]) pyramid(k, lx(gx0), lx(gx1), lz(-32.7), lz(-18.1), e1, 4.2);
    const gz = lz(-25.4), gx = lx(-74.3);
    k.plain.push([new THREE.CylinderGeometry(1.25, 1.25, 0.08, 8).rotateZ(Math.PI / 2).rotateX(Math.PI / 8).translate(gx - 0.04, 2.0, gz), '#1c1c1e']);
    for (const [a, b, c, d] of [[gx - 0.06, gx, lz(-32.7), lz(-18.1)], [lx(85.9), lx(85.9) + 0.06, lz(-32.7), lz(-18.1)]]) k.plain.push([box(a, b, 0, 0.8, c, d), '#8e2f2a']);
    // the four corner kiosks: white, one floor, pyramid tile roofs
    for (const [kx0, kx1, kz0, kz1] of [[-77.9, -71, -53.8, -46.8], [82.7, 89.3, -53.8, -46.5], [-77.4, -70.4, -3.2, 3.8], [82.6, 89.8, -3.6, 3.8]]) {
      k.plain.push([box(lx(kx0), lx(kx1), 0, 3.2, lz(kz0), lz(kz1)), WHITE]);
      k.plain.push([box(lx(kx0) - 0.05, lx(kx1) + 0.05, 0, 0.7, lz(kz0) - 0.05, lz(kz1) + 0.05), '#8e2f2a']);
      for (const [a, b, c, d] of [[kx0 - 0.03, kx0 + 0.03, (kz0 + kz1) / 2 - 0.8, (kz0 + kz1) / 2 + 0.8], [kx1 - 0.03, kx1 + 0.03, (kz0 + kz1) / 2 - 0.8, (kz0 + kz1) / 2 + 0.8]]) k.plain.push([box(lx(a), lx(b), 1.3, 2.4, lz(c), lz(d)), '#1c2026']);
      pyramid(k, lx(kx0), lx(kx1), lz(kz0), lz(kz1), 3.2, 2.6, 0.7);
    }
    // the screen walls between them along the roads, west and east, with the gatehouses between
    for (const wx of [-74.3, 85.9]) {
      screenWall(k, lx(wx), lz(-46.8), lx(wx), lz(-32.7));
      screenWall(k, lx(wx), lz(-18.1), lx(wx), lz(-3.4));
    }
    // a porch under a tiled lean-to on the west face of the west wing near its south end
    const px = lx(-59.1), pz = lz(-1.5);
    k.plain.push([box(px - 0.05, px, PL, PL + 2.6, pz - 2.5, pz + 2.5), '#1c2026']);
    k.roof.c = new THREE.Color(TILE);
    k.roof.quad([px - 2.6, 3.0, pz + 3.2], [px - 2.6, 3.0, pz - 3.2], [px, 4.0, pz - 3.2], [px, 4.0, pz + 3.2]);
    k.plain.push([box(px - 2.7, px - 2.5, 2.7, 3.0, pz - 3.2, pz + 3.2), '#3a2a22']);
    k.roof.c = new THREE.Color(TILE);
  },
};

// ---------- the fountain in the Kuffour Quadrangle, behind the library ----------
const FO: [number, number] = [5.4, -124.8];
const fountain: Spec = {
  name: 'Kuffour Quadrangle fountain',
  axis: [1, 0], origin: FO, storey: 3, style: LIB_WALL, roofColor: TILE, fascia: WHITE, pitch: 0.5,
  blocks: [],
  keep: [[-7, 7, -7, 7]],
  extras: (k: Kit) => {
    // a round basin with a white rim banded in blue, a blue-and-white pedestal under a square blue table, and on it
    // the blue sculpture of interlocking rings (owner's photo from behind the library)
    const basin = new THREE.Shape().absarc(0, 0, 6.4, 0, Math.PI * 2, false);
    basin.holes.push(new THREE.Path().absarc(0, 0, 6.0, 0, Math.PI * 2, true));
    k.plain.push([new THREE.ExtrudeGeometry(basin, { depth: 0.6, bevelEnabled: false, curveSegments: 40 }).rotateX(-Math.PI / 2), '#f3f1ec']);
    k.plain.push([new THREE.CylinderGeometry(6.43, 6.43, 0.2, 40, 1, true).translate(0, 0.42, 0), '#2f7fc8']);
    k.plain.push([new THREE.CircleGeometry(6.0, 40).rotateX(-Math.PI / 2).translate(0, 0.42, 0), '#4f9fcf']);
    k.plain.push([box(-0.55, 0.55, 0.5, 2.4, -0.55, 0.55), '#3d7fc4']);
    for (const y of [0.9, 1.5, 2.0]) k.plain.push([box(-0.58, 0.58, y, y + 0.18, -0.58, 0.58), '#f3f1ec']);
    k.plain.push([box(-1.3, 1.3, 2.4, 2.7, -1.3, 1.3), '#2f7fc8']);
    k.plain.push([new THREE.TorusGeometry(1.1, 0.2, 10, 28).translate(0, 3.9, 0), '#4a90d0']);
    k.plain.push([new THREE.TorusGeometry(0.85, 0.18, 10, 24).rotateY(Math.PI / 2).rotateX(0.5).translate(0.2, 3.7, 0), '#9fd0ee']);
  },
};

// ---------- the long pool in front of the library (the mapped 'Balme Library Fountain') ----------
const PO: [number, number] = [8, 78];
const pool: Spec = {
  name: 'Balme Library pool',
  axis: [1, 0], origin: PO, storey: 3, style: LIB_WALL, roofColor: TILE, fascia: WHITE, pitch: 0.5,
  blocks: [],
  keep: [[-6.7, 6.7, -16.6, 16.6]],
  // University Square and the pool's paved area are drawn by the steps model below, level by level
  covers: [[8.6, 49.9], [8, 78]],
  extras: (k: Kit) => {
    // the pool sits on the deck 2.4 m below the road before the library (relief.ts); its jets stand in a row
    for (const z of [-9, -3, 3, 9]) k.plain.push([new THREE.CylinderGeometry(0.12, 0.12, 0.9, 8).translate(0, 0.45, z), '#55585c']);
    // a long pool of still water in a dark stone kerb on the library's axis, big white planters with small palms
    // along both sides (owner's photo of the front)
    const [x0, x1, z0, z1] = [-4.6, 4.6, -15, 15];
    for (const [a, b, c, d] of [[x0 - 0.45, x1 + 0.45, z0 - 0.45, z0], [x0 - 0.45, x1 + 0.45, z1, z1 + 0.45], [x0 - 0.45, x0, z0, z1], [x1, x1 + 0.45, z0, z1]]) k.plain.push([box(a, b, 0, 0.5, c, d), '#3a3d40']);
    k.plain.push([box(x0, x1, 0, 0.32, z0, z1), '#4d7f78']);
    for (let z = z0 + 1.5; z <= z1 - 1.4; z += 4.6) for (const x of [x0 - 1.2, x1 + 1.2]) {
      k.plain.push([new THREE.CylinderGeometry(0.5, 0.36, 0.75, 12).translate(x, 0.375, z), '#f4f2ee']);
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; k.plain.push([box(-0.05, 0.05, 0, 0.9, -0.3, 0.3).rotateX(0.5).rotateY(a).translate(x, 0.75, z), '#4f8a3a']); }
    }
  },
};

// ---------- the stone terraces and stairs between the pool and the library (owner's photo from the pool) ----------
// relief.ts sinks University Square and the pool below the road before the library: the pool deck 2.4 m down, a
// middle terrace 1.2 m down, each behind a laterite stone retaining wall, the central stairs climbing between them
const SO: [number, number] = [8.5, 70];
const STONE = '#9b6e4a', STONE_L = '#b7865f', PAVE_B = '#d6d0c2';
const steps: Spec = {
  name: 'Balme Library steps',
  axis: [1, 0], origin: SO, storey: 3, style: LIB_WALL, roofColor: TILE, fascia: WHITE, pitch: 0.5,
  blocks: [],
  onGround: true,
  // no generated props on the stairs or in the sunken square
  keep: [[1 - SO[0], 15 - SO[0], 42 - SO[1], 62 - SO[1]], [-8 - SO[0], 26 - SO[0], 48 - SO[1], 94 - SO[1]]],
  extras: (k: Kit) => {
    const st = stairsOf().find((q) => q.alongZ)!;
    const x = (wx: number) => wx - SO[0], z = (wz: number) => wz - SO[1];
    const xa = x(-6.6), xb = x(24.6), deck = st.foot, mid = deck / 2;
    // the paving of the pool deck and of the middle terrace
    k.plain.push([box(xa, xb, deck - 0.2, deck + 0.04, z(60.6), z(93.5)), PAVE_B]);
    k.plain.push([box(xa, xb, mid - 0.2, mid + 0.04, z(49.2), z(60.6)), PAVE_B]);
    // a laterite stone wall from (x0..x1, z0..z1), y0 to y1, with a lighter capping
    const wall = (x0: number, x1: number, z0: number, z1: number, y0: number, y1: number) => {
      k.plain.push([box(x0, x1, y0, y1, z0, z1), STONE]);
      k.plain.push([box(x0 - 0.06, x1 + 0.06, y1, y1 + 0.12, z0 - 0.06, z1 + 0.06), STONE_L]);
    };
    // the lower wall (pool deck up to the middle terrace) and the upper wall (up to the road), open at the stairs,
    // each standing 0.7 m above the level behind it as a parapet
    for (const [z0, y0, y1] of [[60.3, deck, mid + 0.7], [48.7, mid, 0.7]] as [number, number, number][]) {
      wall(xa, x(st.z0), z(z0), z(z0 + 0.6), y0, y1);
      wall(x(st.z1), xb, z(z0), z(z0 + 0.6), y0, y1);
    }
    // the side walls along the lanes, open where the footpath crosses the square
    for (const wx of [-7.2, 24.6]) {
      wall(x(wx), x(wx + 0.6), z(48.7), z(56.4), mid, 0.7);
      wall(x(wx), x(wx + 0.6), z(59.6), z(93.5), deck, 0.7);
    }
    // white planters with small shrubs along the tops of the walls (owner's photo)
    for (const [y, zz] of [[mid + 0.82, 60.6], [0.82, 49]] as [number, number][]) for (const wx of [-5, -1.5, 17, 20, 23]) {
      k.plain.push([new THREE.CylinderGeometry(0.42, 0.32, 0.7, 12).translate(x(wx), y + 0.35, z(zz)), '#f2f0eb']);
      k.plain.push([new THREE.IcosahedronGeometry(0.42, 0).translate(x(wx), y + 0.85, z(zz)), '#4f8a3a']);
    }
    // the stairs: flights of stone steps with a landing between, each step a block reaching down into the ground
    const dir = Math.sign(st.x1 - st.x0), len = Math.abs(st.x1 - st.x0), seg = len / st.flights;
    for (let f = 0; f < st.flights; f++) for (let i = 0; i <= st.steps; i++) {
      const u0 = f * seg + i * st.tread, u1 = i < st.steps ? u0 + st.tread : (f + 1) * seg;
      const za = z(st.x0 + dir * u0), zb = z(st.x0 + dir * Math.min(len, u1)), h = st.at(st.x0 + dir * (u0 + 0.01));
      k.plain.push([box(x(st.z0), x(st.z1), h - 1.4, h + 0.02, Math.min(za, zb), Math.max(za, zb)), i === st.steps ? PAVE_B : i % 2 ? '#c9b597' : '#bfa98a']);
    }
    // the statue on the upper level, to the east of the stairs (owner's photo)
    const sx = x(23.5), sz = z(45.5);
    k.plain.push([box(sx - 0.7, sx + 0.7, 0, 1.6, sz - 0.7, sz + 0.7), '#e6e3dc']);
    k.plain.push([new THREE.CylinderGeometry(0.32, 0.42, 1.5, 12).translate(sx, 2.35, sz), '#eeece6']);
    k.plain.push([new THREE.CylinderGeometry(0.3, 0.32, 0.55, 12).translate(sx, 3.35, sz), '#eeece6']);
    k.plain.push([new THREE.SphereGeometry(0.2, 12, 10).translate(sx, 3.85, sz), '#eeece6']);
  },
};

/** the CEDI Conference Centre, the Standard Chartered and Absa building, the Balme Library, the pool in front of it and the Kuffour Quadrangle fountain */
export const balmeSite = createSite('balme', [cedi, ugcs, banks, library, libraryWings, pool, steps, fountain]);
