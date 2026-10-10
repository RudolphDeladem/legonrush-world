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
import { PL, createSite, louvre, render, slab, type Block, type Kit, type Spec, type Style } from './blocks';
import { garden } from './gardens';
import { groundHeight, stairsOf } from './relief';
import { SOLIDS } from './solids';
import { stoneMesh } from './concrete';

const ROOF = '#b9593a', FASCIA = '#4a3428', STONE = '#9a7d62', STONE_DARK = '#7f6650';
const ST = 3.2;

/** white render, a wooden louvred window per bay on both floors (owner: wooden, not glass) */
const VOLTA_WIN: Style = {
  bay: 3.2,
  up: [[72, 60, 112, 116]],
  ground: [[72, 256 + 64, 112, 116]],
  draw: (g) => {
    render(g, '#f7f6f2');
    louvre(g, [72, 60, 112, 116]);
    slab(g, 238, 18);
    louvre(g, [72, 256 + 64, 112, 116]);
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
  // the block joining the east lane's north bar to the Annex (owner: straight, white, part of the hall)
  W(-268.4, -259.5, -38.9, -26.7),
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
  replaces: [[-263.5, -33], [-265.2, 87], [-265.3, 63.9], [-342, 65], [-287, 94], [-312, 88], [-249.5, 38.4], [-249, 93], [-304, 40], [-312, 0], [-264, 0], [-264, 40]],
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
      k.plain.push([box(Math.min(xa, xb), Math.max(xa, xb), h - 1.2, h + 0.02, Z(stair.z0), Z(stair.z1)), s === stair.steps ? '#8a8781' : s % 2 ? '#7d7a75' : '#86837d']);
    }
    // its side walls and planters faced in rubble stone (owner's second reference PDF, page 31); a stone-faced
    // planter with a clipped bush splits the upper flights; shrubs and a tall clipped conifer in the beds at the foot
    const st: [THREE.BufferGeometry, string][] = [];
    for (const zw of [stair.z0, stair.z1]) for (let x = stair.x0; dir * (stair.x1 - x) > 0; x += dir) {
      const hs = Math.max(stair.at(x), stair.at(x + dir * 0.99), 0.6);
      st.push([box(X(x), X(x + dir * 1.01), -0.2, hs + 0.6, Z(zw) - 0.45, Z(zw) + 0.45), '#ffffff']);
    }
    { const seg2 = stair.x0 + dir * seg * 1.05, zm = (stair.z0 + stair.z1) / 2, top = stair.at(stair.x1) + 0.8;
      st.push([box(X(seg2), X(stair.x1) + 0.4, -0.2, top, Z(zm - 1.3), Z(zm + 1.3)), '#ffffff']);
      k.plain.push([new THREE.IcosahedronGeometry(1.0, 1).scale(1.1, 0.75, 1).translate((X(seg2) + X(stair.x1)) / 2, top + 0.55, Z(zm)), '#3b6a2a']);
      for (let x = Math.min(seg2, stair.x1); x <= Math.max(seg2, stair.x1); x += 0.8) SOLIDS.add(x, zm, 1.3); }
    for (const zw of [stair.z0 - 1.2, stair.z1 + 1.2]) {
      st.push([box(X(stair.x0) - 2.4, X(stair.x0), -0.2, 1.1, Z(zw) - 1.2, Z(zw) + 1.2), '#ffffff']);
      k.plain.push([new THREE.IcosahedronGeometry(0.75, 1).scale(1, 0.8, 1).translate(X(stair.x0) - 1.2, 1.6, Z(zw)), '#45742f']);
      g.bush(k, X(stair.x0) - 1.2, Z(zw) + (zw < stair.z0 ? -0.6 : 0.6), 0.6);
    }
    { const cx = X(-247.4), cz = Z(55.6);
      k.plain.push([new THREE.CylinderGeometry(0.2, 0.28, 2, 6).translate(cx, 1, cz), '#4a3a2c']);
      for (let i = 0; i < 6; i++) k.plain.push([new THREE.ConeGeometry(2.3 - i * 0.33, 2.0, 9).translate(cx, 1.8 + i * 1.25, cz), i & 1 ? '#22401f' : '#264823']);
      SOLIDS.add(-247.4, 55.6, 0.6); }
    // a red post box on the wall, the reserved bays at the foot of the steps: posts banded red and white with boards
    k.plain.push([box(X(-246.6), X(-246.1), 1.1, 1.75, Z(57.8), Z(58.3)), '#c8261e']);
    for (const [z, text] of [[58.6, 'TUTOR'], [70.8, 'DEPUTY SENIOR TUTOR']] as [number, string][]) {
      const x = X(-242.6);
      k.plain.push([box(x - 0.06, x + 0.06, 0, 1.3, Z(z) - 0.06, Z(z) + 0.06), '#f2f2ef']);
      for (const y of [0.3, 0.75]) k.plain.push([box(x - 0.065, x + 0.065, y, y + 0.12, Z(z) - 0.065, Z(z) + 0.065), '#c8261e']);
      k.plain.push([box(x + 0.07, x + 0.1, 1.05, 1.45, Z(z) - 0.55, Z(z) + 0.55), '#f6f6f3']);
      k.signs.push({ text, x: x + 0.11, y: 1.25, z: Z(z), ry: Math.PI / 2, w: 1.0, colors: ['#f6f6f3', '#1b1b1b'] });
      SOLIDS.add(-242.6, z, 0.15);
    }
    // the stone retaining wall along the terrace's east edge, open at the steps
    const wx = -258.4;
    for (let z = -27; z < 99.5; z += 2) {
      if (z + 2 > stair.z0 && z < stair.z1) continue;
      const top = groundHeight(wx - 1, z + 1);
      st.push([box(X(wx), X(wx + 0.8), -0.3, top + 0.5, Z(z), Z(z + 2.02)), '#ffffff']);
    }
    // the south side toward the Department of History (owner's second reference PDF, page 30): the terrace held up by
    // a rubble-stone wall in two tiers along Volta Road, shrubs at its foot, the street's green name board
    for (let x = -336; x < -258.6; x += 2) {
      const x1 = Math.min(-258.6, x + 2.02);
      st.push([box(X(x), X(x1), -0.3, 2.4 + 0.45, Z(99.6), Z(100.4)), '#ffffff'], [box(X(x), X(x1), -0.3, 1.25, Z(100.4), Z(101.3)), '#ffffff']);
      k.plain.push([box(X(x), X(x1), 1.25, 1.3, Z(100.4), Z(101.3)), '#b3a48f']);
    }
    for (let x = -332; x < -262; x += 3.3) g.bush(k, X(x + g.rand()), Z(102.2 + g.rand() * 0.8), 0.7 + g.rand() * 0.3);
    { const sx = X(-300), sz = Z(104.2), sy = groundHeight(-300, 104.2);
      for (const dx of [-0.85, 0.85]) k.plain.push([box(sx + dx - 0.04, sx + dx + 0.04, sy, sy + 1.9, sz - 0.04, sz + 0.04), '#8b9094']);
      k.plain.push([box(sx - 1.0, sx + 1.0, sy + 1.3, sy + 1.85, sz - 0.03, sz + 0.03), '#2f5f47']);
      k.signs.push({ text: 'Volta Road', x: sx, y: sy + 1.57, z: sz + 0.04, ry: 0, w: 1.8, colors: ['#2f5f47', '#ffffff'] });
      SOLIDS.add(-300.85, 104.2, 0.1); SOLIDS.add(-299.15, 104.2, 0.1); }
    stoneMesh(k, st);
    // a hedge and bushes along the top of the wall (owner photos)
    g.hedge(k, X(-259.2), Z(-20), X(-259.2), Z(30));
    for (let z = 78; z < 98; z += 3) g.bush(k, X(-259.6), Z(z), 0.6);
    // the forecourt: pavers from Volta Hall Road to the foot of the steps, between the two front buildings
    k.plain.push([box(X(-256), X(-221), -0.3, 0.08, Z(48), Z(84)), '#8a8680']);
    for (let x = -255; x < -222; x += 3) k.plain.push([box(X(x), X(x + 0.08), 0.08, 0.1, Z(48), Z(84)), '#75716b']);
    // the bays painted on the pavers before the steps
    for (let z = 52; z <= 80; z += 2.6) if (z < stair.z0 - 1 || z > stair.z1 + 1) k.plain.push([box(X(-243.5), X(-238.5), 0.08, 0.11, Z(z), Z(z + 0.1)), '#e8e6e0']);

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
    g.scatter(-340, -230, 102.5, 112, 25, (x, z) => g.tree(k, X(x), Z(z), 0.8 + g.rand() * 0.4));
  },
};

// ---------- the Annex (moved onto its roof in the owner's aerial: corrections.json reshape) ----------
const A: [number, number] = [-286, -62];
/** the ranges' plain white ends either side of the louvred back toward the Graduate School (the owner's PDF no. 1,
 *  page 21; no. 2, page 1: that side is the back, not the front) */
const ANNEX_END: Style = { bay: 4, up: [], ground: [], draw: (g) => { render(g, '#f3f3f1'); g.fillStyle = 'rgba(120,118,110,0.08)'; for (let i = 0; i < 40; i++) g.fillRect((i * 37) % 250, (i * 53) % 500, 3, 40); } };
/** the front toward the Business School (the owner's PDF no. 2, page 4): on the three floors over the ground floor a
 *  recessed balcony to each bay, a window and a glazed door in dark frames behind a black railing, white piers between
 *  with a cream band at their foot; the ground floor a plain white wall with a small window now and then */
const ANNEX_BAL: Style = {
  bay: 3.5, up: [[34, 34, 186, 186]], ground: [[150, 256 + 120, 40, 40]],
  draw: (g) => {
    render(g, '#f3f3f1');
    g.fillStyle = '#d9d7d0'; g.fillRect(26, 20, 204, 210);
    g.fillStyle = '#24282b'; g.fillRect(40, 40, 76, 120); g.fillRect(132, 40, 84, 176);
    g.fillStyle = '#5d6a73'; g.fillRect(46, 46, 30, 108); g.fillRect(82, 46, 30, 108); g.fillRect(138, 46, 34, 164); g.fillRect(178, 46, 34, 164);
    g.fillStyle = '#d7cdb2'; g.fillRect(0, 196, 26, 34); g.fillRect(230, 196, 26, 34);
    g.fillStyle = '#1b1c1d'; g.fillRect(26, 160, 204, 6); for (let x = 30; x < 230; x += 12) g.fillRect(x, 160, 3, 70);
    g.fillStyle = '#f6f6f3'; g.fillRect(0, 230, 256, 26);
    g.fillStyle = 'rgba(110,108,100,0.12)'; for (let i = 0; i < 12; i++) g.fillRect((i * 41) % 250, 256 + (i * 29) % 200, 3, 50);
    g.fillStyle = '#2a2e31'; g.fillRect(150, 256 + 120, 40, 40);
  },
};
const WA = (x0: number, x1: number, z0: number, z1: number, end = false): Block => ({ x0: x0 - A[0], x1: x1 - A[0], z0: z0 - A[1], z1: z1 - A[1], floors: 4, faces: end ? { x0: ANNEX_END, x1: ANNEX_BAL } : { x1: ANNEX_BAL } });
// the east front toward the Business School is continuous: the two ranges and the east cross block flush along it
const ANNEX: Block[] = [WA(-317.3, -255.7, -86, -74.8, true), WA(-317.4, -255.7, -49, -38.9, true), WA(-302.1, -288.7, -74.8, -49), WA(-267.3, -255.7, -74.8, -49)];
const annex: Spec = {
  name: 'Volta Hall Annex',
  axis: [1, 0], origin: A, storey: 3.1, style: ANNEX_WIN, roofColor: '#c46d4c', fascia: '#e9e7e2', pitch: 0.22,
  onGround: true,
  replaces: [[-310, -80]],
  blocks: ANNEX,
  keep: [[-256 - A[0], -224 - A[0], -88 - A[1], -37 - A[1]], [-328 - A[0], -317 - A[0], -88 - A[1], -37 - A[1]]],
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
    // ----- the back toward the Graduate School (the owner's PDF no. 1, pages 21-23, placed on the east by mistake; no. 2,
    // page 1): between the plain white ends of the two ranges, the west cross block's three upper floors behind a
    // screen of white vertical louvre fins (the ranges' inner faces have the galleries above); a white wall before it
    // with sloping wing walls back to the ranges' corners, a black gate in the middle where the drive from J.K.M. Hodasi
    // Road ends, a red steel lattice water tower carrying a round tank over the gate; short posts and the bins
    const x0 = -302.1 - A[0];
    for (let f = 1; f < 4; f++) {
      const fy = y + PL + f * 3.1;
      k.plain.push([box(x0, x0 + 0.05, fy, fy + 2.9, -74.8 - A[1], -49 - A[1]), '#2f3438']);
      k.plain.push([box(x0 - 0.9, x0, fy - 0.25, fy, -74.8 - A[1], -49 - A[1]), '#ecebe7']);
    }
    for (let z = -74.6; z < -49.1; z += 0.42) k.plain.push([box(x0 - 0.65, x0 - 0.1, y + PL + 3.1, y + PL + 4 * 3.1 - 0.2, z - A[1], z + 0.07 - A[1]), '#f4f4f1']);
    k.plain.push([box(x0 - 0.7, x0 - 0.05, y + PL + 4 * 3.1 - 0.25, y + PL + 4 * 3.1 + 0.35, -74.8 - A[1], -49 - A[1]), '#f4f4f1']);
    k.plain.push([box(x0, x0 + 0.04, y + 0.4, y + 2.8, -70 - A[1], -54 - A[1]), '#2a2e31']);
    const XW = -321, xw = XW - A[0], gz0 = -72, gz1 = -68;
    for (const [z0, z1] of [[-86, gz0], [gz1, -38.9]]) k.plain.push([box(xw, xw + 0.3, y, y + 2.4, z0 - A[1], z1 - A[1]), '#f4f4f1']);
    for (const z of [-86, -38.9]) {
      const wing = new THREE.BufferGeometry();
      const zz = z - A[1], ax = -317.3 - A[0];
      wing.setAttribute('position', new THREE.Float32BufferAttribute([xw, y, zz, ax, y, zz, ax, y + 5.5, zz, xw, y + 2.4, zz], 3));
      const back = wing.clone();
      wing.setIndex([0, 1, 2, 0, 2, 3]); wing.computeVertexNormals();
      back.setIndex([0, 2, 1, 0, 3, 2]); back.computeVertexNormals();
      k.plain.push([wing, '#f4f4f1'], [back, '#f4f4f1']);
    }
    for (const z of [gz0 + 0.05, (gz0 + gz1) / 2 + 0.03]) k.plain.push([box(xw + 0.1, xw + 0.2, y, y + 2.3, z - A[1], z + 1.92 - A[1]), '#151617']);
    // the water tower: four steel legs braced in a lattice, a platform, the round tank
    const tx = XW + 1.6 - A[0], tz = (gz0 + gz1) / 2 - A[1], th = 13.5;
    for (const [dx, dz] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]]) k.plain.push([box(tx + dx - 0.09, tx + dx + 0.09, y, y + th, tz + dz - 0.09, tz + dz + 0.09), '#8a3a2a']);
    for (let h = 1.2; h < th; h += 1.5) for (const [ax, az, bx, bz] of [[-1.1, -1.1, 1.1, -1.1], [-1.1, 1.1, 1.1, 1.1], [-1.1, -1.1, -1.1, 1.1], [1.1, -1.1, 1.1, 1.1]]) {
      k.plain.push([box(tx + Math.min(ax, bx) - 0.04, tx + Math.max(ax, bx) + 0.04, y + h - 0.04, y + h + 0.04, tz + Math.min(az, bz) - 0.04, tz + Math.max(az, bz) + 0.04), '#8a3a2a']);
      const l = Math.hypot(bx - ax, bz - az, 1.5), mx = tx + (ax + bx) / 2, mz = tz + (az + bz) / 2;
      k.plain.push([new THREE.BoxGeometry(0.06, 0.06, l).lookAt(new THREE.Vector3(bx - ax, 1.5, bz - az)).translate(mx, y + h + 0.75, mz), '#8a3a2a']);
    }
    k.plain.push([box(tx - 1.5, tx + 1.5, y + th, y + th + 0.15, tz - 1.5, tz + 1.5), '#7a3324']);
    k.plain.push([new THREE.SphereGeometry(1.45, 16, 12).translate(tx, y + th + 1.6, tz), '#8f3f2c']);
    for (let z = -86; z <= -38.9; z += 0.4) if (z < gz0 || z > gz1) SOLIDS.add(XW + 0.15, z, 0.25);
    for (const [dx, dz] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]]) SOLIDS.add(tx + A[0] + dx, tz + A[1] + dz, 0.2);
    for (let z = gz1 + 1; z < gz1 + 8; z += 1.6) k.plain.push([box(xw - 2.0, xw - 1.86, y, y + 0.8, z - A[1], z + 0.14 - A[1]), '#d6d8da']);
    for (const [z, col] of [[gz0 - 1.4, '#2f5fa8'], [gz0 - 2.3, '#2f6a3a'], [gz0 - 3.2, '#2f6a3a']] as [number, string][]) k.plain.push([box(xw - 1.2, xw - 0.5, y, y + 1.05, z - 0.35 - A[1], z + 0.35 - A[1]), col]);
    // ----- the front toward the Business School (the owner's PDF no. 2, page 4): the slab edges standing out a little at
    // each floor along the balconies; before it a white wall topped by coils of razor wire, a black gate where the drive
    // comes in from Volta Hall Road; cars parked along the road, the big mango tree
    const xe = -255.7 - A[0];
    for (let f = 1; f < 4; f++) { const fy = y + PL + f * 3.1; k.plain.push([box(xe, xe + 0.25, fy - 0.2, fy, -86 - A[1], -38.9 - A[1]), '#f6f6f3']); }
    const XB = -249.5, xb = XB - A[0], dz0 = -64.5, dz1 = -60.5;
    for (const [z0, z1] of [[-90, dz0], [dz1, -35]]) {
      k.plain.push([box(xb - 0.3, xb, y, y + 2.2, z0 - A[1], z1 - A[1]), '#f2f1ec']);
      for (let z = z0; z < z1; z += 3) k.plain.push([box(xb - 0.35, xb + 0.05, y, y + 2.35, z - A[1], z + 0.3 - A[1]), '#e6e5df']);
      for (let z = z0 + 0.3; z < z1; z += 0.6) k.plain.push([new THREE.TorusGeometry(0.28, 0.025, 4, 10).rotateY(Math.PI / 2).translate(xb - 0.15, y + 2.55, z - A[1]), '#9a9ea2']);
      for (let z = z0; z <= z1; z += 0.4) SOLIDS.add(XB - 0.15, z, 0.25);
    }
    for (const z of [dz0 + 0.05, (dz0 + dz1) / 2 + 0.03]) k.plain.push([box(xb - 0.2, xb - 0.1, y, y + 2.2, z - A[1], z + 1.92 - A[1]), '#151617']);
    k.plain.push([box(xb, -224 - A[0], y + 0.015, y + 0.045, dz0 - A[1], dz1 - A[1]), '#45484b']);
    // the hall's walk arrives at the Annex's south face: an entrance there
    k.plain.push([box(-291 - A[0], -287 - A[0], y + 0.1, y + 2.8, -38.9 - A[1], -38.85 - A[1]), '#2d3540']);
    k.plain.push([box(-292 - A[0], -286 - A[0], y + 2.8, y + 3.0, -38.9 - A[1], -36.9 - A[1]), WHITE]);
  },
};

/** Volta Hall and its Annex */
export const volta = createSite('volta', [hall, annex]);
