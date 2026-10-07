// Mensah Sarbah Hall, Akuafo Hall and Legon Hall, the halls round courts north and south of the
// avenue, modelled from the owner's photos and the UG layout aerials (block engine: blocks.ts). Their
// blocks are the mapped footprints, cut into rectangles (rectilinear.ts), each under its own tile
// hip roof; the entrance buildings are modelled from the photos.
//
// Mensah Sarbah Hall: three-storey cross-shaped blocks (owner) round the court with the fountain,
// white with maroon window frames. The entrance is the Administration and Porters' Lodge on the
// north side (the owner's red mark): toward the semicircular drive, two storeys of small windows and
// the gate in the middle (blue); on the court side one tall storey of seven louvred windows over a
// stone wall and steps, a raised roof with a lantern on it, and a doorway at each end (the owner's
// two blue marks).
//
// Akuafo Hall and Legon Hall, twins either side of the avenue: two-storey blocks (the entrance
// photos) in lanes and bars round long courts. Akuafo's entrance is the gatehouse on the north with
// a row of square windows under deep eaves, dark doors between white piers over a teal base, the
// gate (owner's blue mark) into the fountain court; Legon's is its north block, three arches on
// the ground floor with the entrance in the middle one (blue), a recessed balcony above, banners.
import * as THREE from 'three';
import { BUILDINGS, type Building } from './campusmap';
import { PAVE, WHITE, box } from './modelkit';
import { PL, createSite, render, slab, window_, type Block, type Kit, type Spec, type Style } from './blocks';
import { garden } from './gardens';
import { rectsOf } from './rectilinear';

const ROOF = '#b85a37', FASCIA = '#5a3a2c', STONE = '#8f7a63';

/** white render, dark windows in maroon frames (Sarbah, owner photo) */
const SARBAH_WIN: Style = {
  bay: 3.2,
  up: [[76, 58, 104, 120]],
  ground: [[76, 256 + 62, 104, 120]],
  draw: (g) => {
    render(g, '#f7f6f1');
    window_(g, [76, 58, 104, 120], '#7a2a24', 2, 0.3);
    slab(g, 238, 18);
    window_(g, [76, 256 + 62, 104, 120], '#7a2a24', 2, 0.3);
  },
};
/** the lodge's court side: tall louvred windows in brown frames, one storey high (drawn across both floors) */
const LOUVRE = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#6b4a30'; g.fillRect(x - 6, y - 6, w + 12, h + 12);
  g.fillStyle = '#3a2a1e'; g.fillRect(x, y, w, h);
  g.fillStyle = '#8a6440';
  for (let t = y + 6; t < y + h; t += 12) g.fillRect(x + 4, t, w - 8, 5);
  g.fillStyle = '#6b4a30'; g.fillRect(x + w / 2 - 3, y, 6, h);
};
/** the lodge is one tall storey: the court side has a louvred window the full height of each bay */
const LODGE_COURT: Style = { bay: 2.6, up: [], ground: [[70, 256 + 28, 116, 214]], draw: (g) => { render(g, '#f8f7f3'); LOUVRE(g, 70, 256 + 28, 116, 214); } };
/** ...the drive side and the ends two rows of small windows (owner's aerial) */
const LODGE_FRONT: Style = {
  bay: 3.4,
  up: [],
  ground: [[86, 256 + 40, 84, 70], [86, 256 + 150, 84, 70]],
  draw: (g) => {
    render(g, '#f7f6f1');
    window_(g, [86, 256 + 40, 84, 70], '#7a2a24', 2, 0);
    window_(g, [86, 256 + 150, 84, 70], '#7a2a24', 2, 0);
  },
};
/** Akuafo and Legon: white render, dark windows in white frames */
const TWIN_WIN: Style = {
  bay: 3.2,
  up: [[74, 56, 108, 118]],
  ground: [[74, 256 + 60, 108, 118]],
  draw: (g) => {
    render(g, '#f7f6f2');
    window_(g, [74, 56, 108, 118], '#ecebe6', 2, 0.3);
    slab(g, 238, 18);
    window_(g, [74, 256 + 60, 108, 118], '#ecebe6', 2, 0.3);
    g.fillStyle = '#d6d0c4'; g.fillRect(0, 490, 256, 22);
  },
};
/** Akuafo's gatehouse: square dark windows above, dark doors between white piers over a teal base (owner photo) */
const AKUAFO_FRONT: Style = {
  bay: 3.0,
  up: [[64, 70, 128, 110]],
  ground: [[56, 256 + 40, 144, 200]],
  draw: (g) => {
    render(g, '#f7f6f2');
    window_(g, [64, 70, 128, 110], '#2f2a26', 3, 0);
    slab(g, 238, 18);
    g.fillStyle = '#3a2c22'; g.fillRect(56, 256 + 40, 144, 216);
    g.fillStyle = '#5a4434'; for (let x = 66; x < 196; x += 22) g.fillRect(x, 256 + 50, 14, 200);
    g.fillStyle = '#58b5a6'; g.fillRect(0, 440, 56, 72); g.fillRect(200, 440, 56, 72);
  },
};

/** the footprints in a box (larger than `min` m², not named in `skip`, not containing a `drop` point), as rings */
function footprints(x0: number, x1: number, z0: number, z1: number, min = 100, skip: RegExp | null = null, drop: [number, number][] = []) {
  const out: { b: Building; ring: [number, number][] }[] = [];
  for (const b of BUILDINGS) {
    const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
    if (cx < x0 || cx > x1 || cz < z0 || cz > z1 || (skip && b.name && skip.test(b.name))) continue;
    if (drop.some(([x, z]) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ)) continue;
    const ring: [number, number][] = [];
    for (let i = 0; i < b.pts.length; i += 2) ring.push([b.pts[i], b.pts[i + 1]]);
    let a = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
    if (Math.abs(a / 2) >= min) out.push({ b, ring });
  }
  return out;
}
/** the blocks of the footprints (frame: map axes at origin o) and a point inside each footprint for `replaces` */
function blocksOf(fps: { ring: [number, number][] }[], o: [number, number], floors: number, extra: Partial<Block> = {}) {
  const blocks: Block[] = [], points: [number, number][] = [];
  for (const { ring } of fps) {
    const rs = rectsOf(ring);
    for (const [x0, x1, z0, z1] of rs) blocks.push({ x0: x0 - o[0], x1: x1 - o[0], z0: z0 - o[1], z1: z1 - o[1], floors, ...extra });
    // the middle of the biggest rectangle lies inside the footprint
    const big = rs.reduce((a, r) => ((r[1] - r[0]) * (r[3] - r[2]) > (a[1] - a[0]) * (a[3] - a[2]) ? r : a), rs[0]);
    if (big) points.push([(big[0] + big[1]) / 2, (big[2] + big[3]) / 2]);
  }
  return { blocks, points };
}
const inRect = (x: number, z: number, [x0, x1, z0, z1]: number[]) => x >= x0 && x <= x1 && z >= z0 && z <= z1;
const gs = garden([-220, 220, 140, 760]);

// ---------- Mensah Sarbah Hall ----------
const SO: [number, number] = [5, 645];
const sarbahBlocks = blocksOf(footprints(-80, 90, 580, 700, 400, /Dining|Lodge/), SO, 3);
/** the Administration and Porters' Lodge: the entrance building (map x -4.3..14.1, z 609.1..622.7) */
const LODGE = [-4.3, 14.1, 609.1, 622.7];
const LST = 7.2;
const sarbah: Spec = {
  name: 'Mensah Sarbah Hall',
  axis: [1, 0], origin: SO, storey: 3.2, style: SARBAH_WIN, roofColor: ROOF, fascia: FASCIA, pitch: 0.5,
  replaces: sarbahBlocks.points,
  blocks: sarbahBlocks.blocks,
  keep: [],
  extras: (k) => {
    // the fountain in the middle of the court (layout: the star-shaped basin), the walks to it, palms and bushes
    const fx = 7.6 - SO[0], fz = 640 - SO[1];
    k.plain.push([new THREE.CylinderGeometry(4.2, 4.2, 0.55, 8).translate(fx, 0.27, fz), '#e3dccd']);
    k.plain.push([new THREE.CylinderGeometry(3.6, 3.6, 0.1, 8).translate(fx, 0.56, fz), '#4f9cb8']);
    k.plain.push([new THREE.CylinderGeometry(0.5, 0.8, 1.8, 10).translate(fx, 0.9, fz), '#efe9dc']);
    k.plain.push([box(fx - 1.4, fx + 1.4, -0.25, 0.08, 622.7 - SO[1], 698 - SO[1]), '#cfc3b0']);
    k.plain.push([box(-14 - SO[0], 23 - SO[0], -0.25, 0.08, fz - 1.4, fz + 1.4), '#cfc3b0']);
    gs.reseed(11);
    gs.scatter(-14, 23, 626, 696, 14, (x, z) => (Math.abs(x - 7.6) > 3 && Math.abs(z - 640) > 6 ? gs.palm(k, x - SO[0], z - SO[1], 5 + gs.rand() * 2.5) : undefined));
    gs.scatter(-14, 23, 626, 696, 18, (x, z) => gs.bush(k, x - SO[0], z - SO[1], 0.6 + gs.rand() * 0.4));
  },
};
const lodge: Spec = {
  name: 'Mensah Sarbah Hall lodge',
  axis: [1, 0], origin: [(LODGE[0] + LODGE[1]) / 2, (LODGE[2] + LODGE[3]) / 2], storey: LST, style: LODGE_FRONT, roofColor: ROOF, fascia: FASCIA, pitch: 0.45,
  replaces: [[4.9, 616]],
  blocks: [{ x0: -9.2, x1: 9.2, z0: -6.8, z1: 6.8, floors: 1, roof: 'none', faces: { z1: LODGE_COURT } }],
  keep: [[-10, 10, -14, -6.8], [-10, 10, 6.8, 12]],
  extras: (k: Kit) => {
    const e = k.wallTop(1);
    // the hip roof, a raised clerestory along the ridge and the lantern on it (owner photos)
    k.roof.c = new THREE.Color(ROOF);
    const hx = 10, hz = 7.6, top = e + hz * 0.45;
    k.roof.quad([-hx, e, -hz], [hx, e, -hz], [hx - hz, top, 0], [-hx + hz, top, 0]);
    k.roof.quad([hx, e, hz], [-hx, e, hz], [-hx + hz, top, 0], [hx - hz, top, 0]);
    k.roof.quad([-hx, e, hz], [-hx, e, -hz], [-hx + hz, top, 0], [-hx + hz, top, 0]);
    k.roof.quad([hx, e, -hz], [hx, e, hz], [hx - hz, top, 0], [hx - hz, top, 0]);
    for (const z of [-hz, hz]) k.plain.push([box(-hx, hx, e - 0.3, e + 0.03, z - 0.06, z + 0.06), FASCIA]);
    for (const x of [-hx, hx]) k.plain.push([box(x - 0.06, x + 0.06, e - 0.3, e + 0.03, -hz, hz), FASCIA]);
    const cy = top - 1.2;
    k.plain.push([box(-4.5, 4.5, cy, cy + 1.6, -2.4, 2.4), '#2e2a27']);
    k.roof.quad([-5, cy + 1.6, -2.9], [5, cy + 1.6, -2.9], [4, cy + 2.4, 0], [-4, cy + 2.4, 0]);
    k.roof.quad([5, cy + 1.6, 2.9], [-5, cy + 1.6, 2.9], [-4, cy + 2.4, 0], [4, cy + 2.4, 0]);
    const ly = cy + 2.3;
    k.plain.push([box(-0.9, 0.9, ly, ly + 1.2, -0.9, 0.9), '#2e2a27']);
    k.glass.push(box(-0.7, 0.7, ly + 1.2, ly + 2.4, -0.7, 0.7));
    for (const [x, z] of [[-0.75, -0.75], [0.75, -0.75], [-0.75, 0.75], [0.75, 0.75]]) k.plain.push([box(x - 0.08, x + 0.08, ly + 1.2, ly + 2.4, z - 0.08, z + 0.08), '#f2efe6']);
    k.plain.push([new THREE.ConeGeometry(1.05, 0.9, 8).translate(0, ly + 2.85, 0), '#c8a24a']);
    // the front, toward the drive (north, z -6.8): the gate in the middle (owner's blue mark)
    k.plain.push([box(-1.8, 1.8, 0, 3.4, -6.84, -6.8), '#2a2420']);
    k.plain.push([new THREE.CircleGeometry(1.8, 16, 0, Math.PI).rotateY(Math.PI).translate(0, 3.4, -6.85), '#2a2420']);
    for (let x = -1.6; x <= 1.61; x += 0.32) k.plain.push([box(x - 0.03, x + 0.03, 0.1, 3.3, -6.9, -6.86), '#6d6d6d']);
    k.plain.push([box(-3, 3, 0, 0.18, -9, -6.8), PAVE]);
    // the court side (south): the stone wall and steps in front (owner photo) and a doorway at each end (blue marks)
    k.plain.push([box(-7.5, 7.5, 0, 1.0, 7.4, 8.6), STONE]);
    for (let i = 0; i < 3; i++) k.plain.push([box(-3 - i * 0.5, 3 + i * 0.5, 0, 0.5 - i * 0.16, 6.8, 8.6 + i * 0.45), PAVE]);
    for (const x of [-8.3, 8.3]) {
      k.plain.push([box(x - 0.8, x + 0.8, 0, 2.6, 6.8, 6.86), '#2a2420']);
      k.plain.push([box(x - 1.1, x + 1.1, 2.6, 2.8, 6.8, 7.1), WHITE]);
      k.plain.push([new THREE.CircleGeometry(0.45, 14).translate(x, PL + 5.4, 6.87), '#2b3440']);
    }
  },
};

// ---------- Akuafo Hall and Legon Hall (twins) ----------
const twin = (name: string, o: [number, number], box_: [number, number, number, number], front: [number, number, number, number], skip: RegExp | null, drop: [number, number][], entrance: (k: Kit) => void, frontStyle: Style): Spec => {
  const fps = footprints(...box_, 120, skip, drop).filter(({ b }) => !inRect((b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2, front));
  const main = blocksOf(fps, o, 2);
  const fr = footprints(...front, 120);
  const gate = blocksOf(fr, o, 2, { faces: { z0: frontStyle } });
  return {
    name, axis: [1, 0], origin: o, storey: 3.3, style: TWIN_WIN, roofColor: ROOF, fascia: FASCIA, pitch: 0.5,
    replaces: [...main.points, ...gate.points],
    blocks: [...main.blocks, ...gate.blocks],
    keep: [],
    extras: entrance,
  };
};

const AO: [number, number] = [157, 165];
const akuafo = twin('Akuafo Hall Main', AO, [85, 215, 150, 390], [140, 175, 154, 174], null, [], (k) => {
  // the gate into the fountain court (owner's blue mark) on the north face of the gatehouse, z 156.3
  const z = 156.3 - AO[1];
  k.plain.push([box(-1.6, 1.6, 0, 3.0, z - 0.06, z - 0.02), '#2a221c']);
  k.plain.push([box(-1.9, 1.9, 3.0, 3.25, z - 0.1, z), WHITE]);
  k.plain.push([box(-4, 4, 0, 0.12, z - 5, z), '#b7a58c']);
  // the fountain court behind it
  const fz = 185 - AO[1];
  k.plain.push([new THREE.CylinderGeometry(7, 7, 0.5, 32).translate(0, 0.25, fz), '#cfc6b6']);
  k.plain.push([new THREE.CylinderGeometry(5.6, 5.6, 0.12, 32).translate(0, 0.52, fz), '#4f9cb8']);
  k.plain.push([new THREE.CylinderGeometry(0.6, 0.9, 1.6, 12).translate(0, 0.8, fz), '#e8e2d6']);
  k.plain.push([new THREE.CylinderGeometry(1.4, 0.4, 0.4, 14).translate(0, 1.7, fz), '#e8e2d6']);
  greenCourts(k, AO, [[128, 186, 222, 287], [128, 186, 301, 351]]);
}, AKUAFO_FRONT);

const LO: [number, number] = [-147, 165];
// (the hall mirrors Akuafo across the avenue's axis; the satellite-detected outline at (-82, 378) is not part of it)
const legon = twin('Legon Hall', LO, [-215, -50, 150, 390], [-165, -129, 154, 174], /Maison/, [[-82, 378]], (k) => {
  // the north front (z 156.6): three arches on the ground floor, the entrance in the middle one (owner's blue mark),
  // a recessed balcony above, banners either side
  const z = 156.6 - LO[1];
  for (const x of [-5, 0, 5]) {
    k.plain.push([box(x - 1.6, x + 1.6, 0, 2.4, z - 0.05, z - 0.01), x === 0 ? '#2a221c' : '#3d3632']);
    k.plain.push([new THREE.CircleGeometry(1.6, 16, 0, Math.PI).rotateY(Math.PI).translate(x, 2.4, z - 0.05), x === 0 ? '#2a221c' : '#3d3632']);
  }
  k.plain.push([box(-7.5, 7.5, PL + 3.3 + 0.1, PL + 3.3 + 0.25, z - 1.2, z), WHITE]);
  k.plain.push([box(-7.5, 7.5, PL + 3.3 + 0.25, PL + 3.3 + 1.2, z - 1.25, z - 1.15), WHITE]);
  for (const [x, c] of [[-7.8, '#2e7d4f'], [4.6, '#c98a2b'], [6.6, '#2f5d9a']] as [number, string][]) k.plain.push([box(x - 0.8, x + 0.8, 4.2, 7.0, z - 0.12, z - 0.08), c]);
  k.plain.push([box(-9, 9, 0, 0.1, z - 9, z), '#c9b8a0']);
  greenCourts(k, LO, [[-175, -119, 222, 287], [-175, -119, 298, 350]]);
}, TWIN_WIN);

/** the long courts between the lanes: a walk down the middle, lawns, palms and bushes */
function greenCourts(k: Kit, o: [number, number], courts: [number, number, number, number][]) {
  gs.reseed(Math.round(o[0]));
  for (const [x0, x1, z0, z1] of courts) {
    const xm = (x0 + x1) / 2 - o[0];
    k.plain.push([box(xm - 1.6, xm + 1.6, -0.25, 0.08, z0 - o[1], z1 - o[1]), '#cfc3b0']);
    for (let z = z0 + 4; z < z1 - 2; z += 9) for (const s of [-1, 1]) gs.palm(k, xm + s * 6 - 0, z - o[1], 5.5 + gs.rand() * 2);
    gs.scatter(x0 + 2, x1 - 2, z0 + 2, z1 - 2, 10, (x, z) => gs.bush(k, x - o[0], z - o[1], 0.6 + gs.rand() * 0.4));
  }
}

/** Mensah Sarbah Hall (and its lodge), Akuafo Hall and Legon Hall */
export const greatHalls = createSite('great-halls', [sarbah, lodge, akuafo, legon]);
