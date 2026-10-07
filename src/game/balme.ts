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
import { PL, createSite, render, window_, type Block, type Kit, type Spec, type Style } from './blocks';

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
/** the four-floor outer wings: rows of square windows (owner's photo of the north-west corner) */
const WING_WALL: Style = {
  bay: 3.1,
  up: [[72, 70, 112, 120]],
  ground: [[72, 256 + 74, 112, 120]],
  draw: (g) => { render(g, '#f7f5ef'); window_(g, [72, 70, 112, 120], '#ffffff', 2, 0.3); window_(g, [72, 256 + 74, 112, 120], '#ffffff', 2, 0.3); },
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
const libraryWings: Spec = {
  name: 'Balme Library wings',
  axis: [1, 0], origin: LO, storey: 3.4, style: WING_WALL, roofColor: TILE, fascia: '#f7f5ef', pitch: 0.62,
  blocks: [
    L(-59.1, -45, -58.3, 7.1, 4), // the outer west wing
    L(-74.3, -59.1, -32.7, -18.1, 4), // its arm to the west
    L(57.1, 71.1, -58.3, 7.1, 4), // the outer east wing
    L(71.1, 85.9, -32.7, -18.1, 4), // its arm to the east
    L(71.1, 76.9, -52.7, -44, 1), // the small annex on the east
  ],
  keep: [],
  extras: () => {},
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
  extras: (k: Kit) => {
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

/** the CEDI Conference Centre, the Standard Chartered and Absa building, the Balme Library, the pool in front of it and the Kuffour Quadrangle fountain */
export const balmeSite = createSite('balme', [cedi, banks, library, libraryWings, pool, fountain]);
