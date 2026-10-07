// Volta Hall and the Volta Hall Annex, modelled from the owner's aerial (registered to the OSM
// footprints, 0.27 m/px, north up) and photos (block engine: blocks.ts; the terrace and the steps:
// relief.ts).
//
// The hall: two storeys throughout (owner), white render, dark windows in white frames, terracotta
// hip roofs with dark fascias. Two lanes run north-south round the central court, crossed by
// blocks either side of it; the south court is closed by the blocks along the south. The hall
// stands on a terrace 2.4 m above Volta Hall Road, behind a stone retaining wall; the entrance (the
// owner's blue mark) is on the east face of the front block: an arched doorway with its gate under
// a small tile canopy, round windows above, reached up a short flight of steps between stone walls
// and planters from the forecourt. A two-storey building stands either side of the climb (the
// owner's purple mark). A paved walk lined with white pots runs north through the courts toward
// the Annex, with lawns, palms and bushes either side.
//
// The Annex, north of the hall at road level: four storeys (owner), white, long bands of windows,
// balconies along the court sides, low tile roofs; a court open to the west and a closed one.
import * as THREE from 'three';
import { WHITE, box } from './modelkit';
import { PL, createSite, render, slab, window_, type Block, type Kit, type Spec, type Style } from './blocks';
import { garden } from './gardens';
import { groundHeight, stairsOf } from './relief';

const ROOF = '#b9593a', FASCIA = '#4a3428', STONE = '#9a7d62', STONE_DARK = '#7f6650';
const ST = 3.2;

/** white render, a dark window in a white frame per bay on both floors (owner photos) */
const VOLTA_WIN: Style = {
  bay: 3.2,
  up: [[72, 60, 112, 116]],
  ground: [[72, 256 + 64, 112, 116]],
  draw: (g) => {
    render(g, '#f7f6f2');
    window_(g, [72, 60, 112, 116], '#f4f3ef', 2, 0.3);
    slab(g, 238, 18);
    window_(g, [72, 256 + 64, 112, 116], '#f4f3ef', 2, 0.3);
    g.fillStyle = '#d9d4ca'; g.fillRect(0, 488, 256, 24);
  },
};
/** the Annex: long bands of windows under white slab edges (owner photo) */
const ANNEX_WIN: Style = {
  bay: 3.0,
  up: [[0, 70, 256, 110]],
  ground: [[0, 256 + 70, 256, 110]],
  draw: (g) => {
    render(g, '#f3f3f1');
    for (const y0 of [0, 256]) {
      const gl = g.createLinearGradient(0, y0 + 70, 0, y0 + 180);
      gl.addColorStop(0, '#5d6f80'); gl.addColorStop(1, '#2a3540');
      g.fillStyle = gl; g.fillRect(0, y0 + 70, 256, 110);
      g.fillStyle = '#e9e9e6'; g.fillRect(0, y0 + 70, 6, 110); g.fillRect(126, y0 + 70, 6, 110);
      g.fillStyle = '#ffffff'; g.fillRect(0, y0 + 180, 256, 14);
      g.fillStyle = '#c9c9c4'; g.fillRect(0, y0 + 194, 256, 3);
    }
  },
};

// ---------- the hall (frame: map axes; local = world - origin) ----------
const O: [number, number] = [-290, 40];
const W = (x0: number, x1: number, z0: number, z1: number, extra: Partial<Block> = {}): Block =>
  ({ x0: x0 - O[0], x1: x1 - O[0], z0: z0 - O[1], z1: z1 - O[1], floors: 2, ...extra });
/** the hall's blocks (world coordinates, from the OSM footprints, which land on the roofs of the owner's aerial) */
const HALL: Block[] = [
  // west lane and the bar across its north end
  W(-320, -297.5, -22.8, -13.9), W(-320, -305.2, -13.9, 30.7),
  // east lane ("Volta Hall") and the bar across its north end
  W(-280.6, -259.5, -26.7, -17.2), W(-268.1, -259.4, -17.2, 33.1),
  // the blocks across the lanes' south ends, either side of the walk
  W(-316.5, -292, 35.3, 45.7), W(-316.5, -307.7, 45.7, 55), W(-327.5, -316.5, 50.6, 55.3),
  W(-285.4, -259.7, 35, 44.8), W(-268.2, -259.7, 44.8, 51.5),
  // the front block with the entrance (east face), and the blocks closing the south court
  W(-269.6, -258.9, 55.3, 76.8), W(-268.4, -260.3, 79.5, 98),
  W(-303, -270.7, 88.3, 99.2), W(-317.2, -307, 76.4, 98.6),
  // the west block and its wings
  W(-348.3, -336.3, 45.9, 84.7), W(-364.5, -348.3, 60.7, 72.6), W(-364, -355, 48.5, 60.7),
];
/** the two buildings either side of the climb to the entrance (owner's purple mark), on the forecourt */
const FLANKS: Block[] = [W(-255.8, -243.3, 32.3, 44.4), W(-256.4, -241.7, 88.2, 98.1)];

const g = garden([-380, -200, -110, 125]);
const stair = stairsOf()[1];

const hall: Spec = {
  name: 'Volta Hall',
  axis: [1, 0], origin: O, storey: ST, style: VOLTA_WIN, roofColor: ROOF, fascia: FASCIA, pitch: 0.5,
  onGround: true,
  replaces: [[-265.2, 87], [-265.3, 63.9], [-342, 65], [-287, 94], [-312, 88], [-249.5, 38.4], [-249, 93], [-304, 40], [-312, 0], [-264, 0], [-264, 40]],
  blocks: [...HALL, ...FLANKS],
  keep: [[-258.6 - O[0], -220 - O[0], 54 - O[1], 78 - O[1]], [-292 - O[0], -286 - O[0], -30 - O[1], 88 - O[1]]],
  extras: (k) => {
    g.reseed(5);
    const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
    for (const b of [...HALL, ...FLANKS]) g.clear.push([b.x0 + O[0] - 2, b.x1 + O[0] + 2, b.z0 + O[1] - 2, b.z1 + O[1] + 2]);
    g.clear.push([-292, -286, -40, 88], [-260, -219, 52, 80]);

    // the entrance (east face of the front block, x -258.9): an arched doorway with its gate, a small
    // tile canopy over it, round windows either side above, the hall's name board (owner photo)
    const ex = X(-258.9), ez = Z(66), ey = k.ground(ex - 2, ez);
    k.plain.push([box(ex, ex + 0.5, ey, ey + 3.4, ez - 2.3, ez + 2.3), WHITE]);
    k.plain.push([box(ex + 0.5, ex + 0.53, ey + 0.2, ey + 2.5, ez - 1.5, ez + 1.5), '#2a2420']);
    k.plain.push([new THREE.CircleGeometry(1.5, 16, 0, Math.PI).rotateY(Math.PI / 2).translate(ex + 0.53, ey + 2.5, ez), '#2a2420']);
    for (let z = -1.3; z <= 1.31; z += 0.26) k.plain.push([box(ex + 0.55, ex + 0.6, ey + 0.2, ey + 2.4, ez + z - 0.03, ez + z + 0.03), '#5a5a5a']);
    k.roof.c = new THREE.Color(ROOF);
    const cy = ey + 3.5;
    k.roof.quad([ex + 1.6, cy - 0.5, ez + 2.8], [ex + 1.6, cy - 0.5, ez - 2.8], [ex, cy + 0.3, ez - 2.8], [ex, cy + 0.3, ez + 2.8]);
    k.plain.push([box(ex, ex + 1.65, cy - 0.62, cy - 0.5, ez - 2.8, ez + 2.8), FASCIA]);
    for (const dz of [-4.2, 4.2]) {
      k.plain.push([new THREE.CircleGeometry(0.55, 16).rotateY(Math.PI / 2).translate(ex + 0.03, ey + PL + ST + 1.6, ez + dz), '#2b3440']);
      k.plain.push([new THREE.RingGeometry(0.55, 0.7, 16).rotateY(Math.PI / 2).translate(ex + 0.04, ey + PL + ST + 1.6, ez + dz), '#f4f3ef']);
    }
    k.signs.push({ text: 'VOLTA HALL', x: ex + 0.05, y: ey + PL + ST + 1.6, z: ez, ry: Math.PI / 2, w: 3.0, colors: ['#f4ead2', '#5a2f22'] });

    // the steps from the forecourt up to the door between stone walls with planters on them
    const dir = Math.sign(stair.x1 - stair.x0), len = Math.abs(stair.x1 - stair.x0), seg = len / stair.flights;
    for (let f = 0; f < stair.flights; f++) for (let s = 0; s <= stair.steps; s++) {
      const u0 = f * seg + s * stair.tread, u1 = s < stair.steps ? u0 + stair.tread : (f + 1) * seg;
      const xa = X(stair.x0 + dir * u0), xb = X(stair.x0 + dir * Math.min(len, u1)), h = stair.at(stair.x0 + dir * (u0 + 0.01));
      k.plain.push([box(Math.min(xa, xb), Math.max(xa, xb), h - 1.2, h + 0.02, Z(stair.z0), Z(stair.z1)), s === stair.steps ? '#b98a6a' : s % 2 ? '#c49474' : '#b8866a']);
    }
    for (const zw of [stair.z0, stair.z1]) for (let x = stair.x0; dir * (stair.x1 - x) > 0; x += dir) {
      const hs = Math.max(stair.at(x), stair.at(x + dir * 0.99), 0.6);
      k.plain.push([box(X(x), X(x + dir * 1.01), -0.2, hs + 0.6, Z(zw) - 0.45, Z(zw) + 0.45), (Math.floor(x) & 1) ? STONE : STONE_DARK]);
    }
    // planters with palms on the walls at the foot (owner photos)
    for (const zw of [stair.z0 - 1.2, stair.z1 + 1.2]) {
      k.plain.push([box(X(stair.x0) - 2.4, X(stair.x0), -0.2, 1.1, Z(zw) - 1.2, Z(zw) + 1.2), STONE]);
      g.palm(k, X(stair.x0) - 1.2, Z(zw), 2.4);
      g.bush(k, X(stair.x0) - 1.2, Z(zw) + (zw < stair.z0 ? -0.5 : 0.5), 0.7);
    }
    // the stone retaining wall along the terrace's east edge, open at the steps
    const wx = -258.4;
    for (let z = -27; z < 99.5; z += 2) {
      if (z + 2 > stair.z0 && z < stair.z1) continue;
      const top = groundHeight(wx - 1, z + 1);
      k.plain.push([box(X(wx), X(wx + 0.8), -0.3, top + 0.5, Z(z), Z(z + 2.02)), (z / 2) & 1 ? STONE : STONE_DARK]);
    }
    // a hedge and bushes along the top of the wall (owner photos)
    g.hedge(k, X(-259.2), Z(-20), X(-259.2), Z(30));
    for (let z = 78; z < 98; z += 3) g.bush(k, X(-259.6), Z(z), 0.6);
    // the forecourt: pavers from Volta Hall Road to the foot of the steps, between the two front buildings
    k.plain.push([box(X(-256), X(-221), -0.3, 0.08, Z(48), Z(84)), '#a99d8f']);
    for (let x = -255; x < -222; x += 3) k.plain.push([box(X(x), X(x + 0.08), 0.08, 0.1, Z(48), Z(84)), '#8e8376']);

    // the walk through the courts toward the Annex, lined with white pots; lawns, palms and bushes
    for (let z = -30; z < 88; z += 2) {
      const y = k.ground(X(-289), Z(z + 1));
      k.plain.push([box(X(-291), X(-287), y - 0.3, y + 0.08, Z(z), Z(z + 2.02)), '#cfc3b0']);
    }
    for (let z = -26; z < 86; z += 6) for (const x of [-292, -286]) if (g.clearOf(x + (x < -289 ? -0.6 : 0.6), z) || z < 33) g.pot(k, X(x), Z(z));
    for (const [x0, x1, z0, z1] of [[-304, -292, -12, 32], [-286, -269, -15, 32], [-306, -292, 57, 86], [-286, -271, 54, 86]] as [number, number, number, number][]) {
      g.scatter(x0, x1, z0, z1, 6, (x, z) => g.palm(k, X(x), Z(z), 5 + g.rand() * 2.5));
      g.scatter(x0, x1, z0, z1, 10, (x, z) => g.bush(k, X(x), Z(z), 0.6 + g.rand() * 0.4));
    }
    // trees round the hall
    g.scatter(-380, -322, -30, 110, 50, (x, z) => g.tree(k, X(x), Z(z), 0.9 + g.rand() * 0.5));
    g.scatter(-340, -230, 100, 112, 25, (x, z) => g.tree(k, X(x), Z(z), 0.8 + g.rand() * 0.4));
  },
};

// ---------- the Annex (moved onto its roof in the owner's aerial: corrections.json reshape) ----------
const A: [number, number] = [-286, -62];
const WA = (x0: number, x1: number, z0: number, z1: number): Block => ({ x0: x0 - A[0], x1: x1 - A[0], z0: z0 - A[1], z1: z1 - A[1], floors: 4 });
const ANNEX: Block[] = [WA(-317.3, -255.7, -86, -74.8), WA(-317.4, -255.7, -49, -38.9), WA(-302.1, -288.7, -74.8, -49), WA(-267.3, -255.7, -74.8, -49)];
const annex: Spec = {
  name: 'Volta Hall Annex',
  axis: [1, 0], origin: A, storey: 3.1, style: ANNEX_WIN, roofColor: '#c46d4c', fascia: '#e9e7e2', pitch: 0.22,
  onGround: true,
  replaces: [[-310, -80]],
  blocks: ANNEX,
  keep: [],
  extras: (k: Kit) => {
    const y = k.ground(0, 0);
    // balconies along the court sides, on every upper floor (the grey strips on the aerial)
    for (let f = 1; f < 4; f++) {
      const by = y + PL + f * 3.1 - 0.1;
      for (const [x0, x1, z] of [[-288.7, -267.3, -74.8], [-288.7, -267.3, -49], [-317.3, -302.1, -74.8], [-317.3, -302.1, -49]] as [number, number, number][]) {
        const zz = z - A[1], d = z < -60 ? 1.6 : -1.6;
        k.plain.push([box(x0 - A[0], x1 - A[0], by, by + 0.18, Math.min(zz, zz + d), Math.max(zz, zz + d)), '#e4e3df']);
        k.plain.push([box(x0 - A[0], x1 - A[0], by + 0.18, by + 1.05, zz + d - 0.06, zz + d + 0.06), '#d9d8d3']);
      }
    }
    // the hall's walk arrives at the Annex's south face: an entrance there
    k.plain.push([box(-291 - A[0], -287 - A[0], y + 0.1, y + 2.8, -38.9 - A[1], -38.85 - A[1]), '#2d3540']);
    k.plain.push([box(-292 - A[0], -286 - A[0], y + 2.8, y + 3.0, -38.9 - A[1], -36.9 - A[1]), WHITE]);
  },
};

/** Volta Hall and its Annex */
export const volta = createSite('volta', [hall, annex]);
