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
import * as THREE from 'three';
import { WHITE, box } from './modelkit';
import { PL, createSite, render, window_, type Kit, type Spec, type Style } from './blocks';

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
const cedi: Spec = {
  name: 'Cedi Conference Centre',
  axis: [1, 0], origin: CO, storey: ST, style: CEDI_WALL, roofColor: '#c8776c', fascia: '#f6f6f3', pitch: 0.3,
  replaces: [CO],
  blocks: [{ x0: cx(C[0]), x1: cx(C[1]), z0: cz(C[2]), z1: cz(C[3]), floors: F, roof: 'none' }],
  keep: [[cx(C[0]) - 5, cx(C[0]), cz(6), cz(15)], [cx(C[1]), cx(C[1]) + 4, cz(20), cz(30)]],
  extras: (k: Kit) => {
    const [x0, x1, z0, z1] = [cx(C[0]), cx(C[1]), cz(C[2]), cz(C[3])];
    const e = k.wallTop(F);
    // the white parapet round the roof, and the pink hipped roof rising inside it (owner's top view)
    for (const [a, b, c, d] of [[x0, x1, z0, z0 + 0.5], [x0, x1, z1 - 0.5, z1], [x0, x0 + 0.5, z0, z1], [x1 - 0.5, x1, z0, z1]]) k.plain.push([box(a, b, e, e + 1.4, c, d), WHITE]);
    k.roof.c = new THREE.Color('#c8776c');
    const i = 0.5, w = x1 - x0 - 2 * i, h = z1 - z0 - 2 * i, half = Math.min(w, h) / 2, top = e + 0.6 + half * 0.22;
    const X0 = x0 + i, X1 = x1 - i, Z0 = z0 + i, Z1 = z1 - i, zm = (z0 + z1) / 2, r0 = [X0 + half, top, zm], r1 = [X1 - half, top, zm];
    const ey = e + 0.6;
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
    // the east face toward the Balme Library: the name across the top, doors under a canopy (owner's photo)
    const ezm = cz(25.7);
    k.signs.push({ text: 'CEDI CONFERENCE CENTRE', x: x1 + 0.05, y: e - 1.3, z: ezm, ry: Math.PI / 2, w: 12, colors: ['#f6f6f3', '#1f3a93'] });
    k.plain.push([box(x1, x1 + 2.6, 3.0, 3.3, ezm - 5, ezm + 5), WHITE]);
    k.plain.push([box(x1, x1 + 0.05, PL, PL + 2.6, ezm - 3, ezm + 3), '#2b2f36']);
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

/** the CEDI Conference Centre and the Standard Chartered and Absa building */
export const balmeSite = createSite('balme', [cedi, banks]);
