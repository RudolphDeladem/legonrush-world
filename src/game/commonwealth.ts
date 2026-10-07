// Commonwealth Hall (Vandals) on Legon Hill, modelled from the owner's labelled aerial and photos
// (block engine: blocks.ts; the hill and its stairway: relief.ts).
//
// The hall: a long east-west plan up the hill. Two pairs of two-storey lanes run west from the front
// (the vertical lanes on the owner's aerial); three-storey bars cross them (the horizontal ones,
// marked in purple: one floor above the lanes): long crossbars either side of the central court and
// shorter stubs further along. The front is a row of two-storey blocks: the entrance block in the
// middle (a portico of two white columns round the dark gate, facing the stairs; tall windows over
// a canopy on the court side; a lantern on the roof), the lanes' gabled ends either side of it, and
// a small block at each end. A paved walk runs from the gate up the court to the end building, the
// ground still rising gently, with the amphitheatre beyond it and the way on up to the Great Hall.
// White render, dark-brown framed windows, orange tile hip roofs with white eaves.
//
// The approach: two single-storey gate houses (white, dark hip roofs, blue signs) at the road by
// the foot of the stairway; the stairway climbs the hill in flights with landings between stone
// walls, palms either side, pools on the first landing, past the stone arches below the forecourt,
// to the forecourt and the drive in front of the gate. Gardens, bushes and trees all round.
//
// Every block stands on the ground under it (Spec.onGround): the lanes are built in short lengths
// that step up the hill.
import * as THREE from 'three';
import { PAVE, WHITE, box, flat } from './modelkit';
import { PL, createSite, render, slab, window_, type Block, type Kit, type Spec, type Style } from './blocks';
import { garden } from './gardens';
import { groundHeight, stairsOf } from './relief';

const ROOF = '#c4613a', FASCIA = '#fbf9f3', FRAME = '#5a3b28', STONE = '#9b8a72', STONE_DARK = '#7d6d58';
const ST = 3.3;

/** white render, a dark window in a brown frame per bay on both floors */
const CW_WIN: Style = {
  bay: 3.4,
  up: [[70, 56, 116, 120]],
  ground: [[70, 256 + 60, 116, 120]],
  draw: (g) => {
    render(g, '#f8f6f1');
    window_(g, [70, 56, 116, 120], FRAME, 2, 0.28);
    slab(g, 238, 18);
    window_(g, [70, 256 + 60, 116, 120], FRAME, 2, 0.28);
  },
};
/** the entrance block's court side: tall narrow windows through the upper floor, plain wall below */
const CW_TALL: Style = {
  bay: 1.9,
  up: [[78, 18, 100, 220]],
  ground: [],
  draw: (g) => {
    render(g, '#f8f6f1');
    window_(g, [78, 18, 100, 220], '#4a3426', 1, 0.62);
    g.fillStyle = '#f2efe8'; g.fillRect(0, 256, 256, 256);
  },
};

// ---------- the hall (frame: map axes, origin on the axis at the court; local = world - origin) ----------
const O: [number, number] = [-610, 128];
const L = (x: number) => x - O[0], Lz = (z: number) => z - O[1];
/** a block from world coordinates */
const W = (x0: number, x1: number, z0: number, z1: number, floors: number, extra: Partial<Block> = {}): Block =>
  ({ x0: L(x0), x1: L(x1), z0: Lz(z0), z1: Lz(z1), floors, ...extra });
/** a lane (world x0..x1) cut into lengths between the bars that cross it, each on its own ground */
const lane = (x0: number, x1: number, z0: number, z1: number, cuts: [number, number][]) => {
  const out: Block[] = [];
  let a = x0;
  for (const [c0, c1] of [...cuts, [x1, x1] as [number, number]]) {
    if (c0 - a > 1) out.push(W(a, c0, z0, z1, 2));
    a = c1;
  }
  return out;
};

const LANES = [
  // north and south lanes, east halves (to the front row) and west halves (to the end)
  ...lane(-591.6, -502, 95.9, 107.2, [[-581.5, -571.1], [-535.2, -525]]),
  ...lane(-590.4, -502, 148, 159.5, [[-583.2, -572], [-535.2, -525]]),
  ...lane(-725, -617.6, 97.2, 106.3, [[-715.7, -705], [-682.4, -670.6], [-635, -625]]),
  ...lane(-734.4, -619.9, 147, 160.6, [[-715.7, -705], [-684, -673], [-635, -625]]),
];
const BARS = [
  // the crossbars either side of the central court
  W(-635, -625, 81.3, 118.2, 3), W(-635, -625, 137.5, 193.7, 3),
  W(-581.5, -571.1, 78.6, 116.7, 3), W(-583.2, -572, 137, 192.3, 3),
  // the stubs across the lanes further along
  W(-715.7, -705, 94, 111.3, 3), W(-715.7, -705, 143, 165, 3),
  W(-682.4, -670.6, 93, 113, 3), W(-684, -673, 140, 165, 3),
  W(-535.2, -525, 91, 117, 3), W(-535.2, -525, 139, 162, 3),
];
/** the two-storey pavilions on the walk through the court (a passage through each) */
const PAVILIONS: [number, number, number, number][] = [[-582.5, -575, 120.3, 134], [-634, -624.1, 120.4, 136.2]];
const FRONT = [
  W(-502.4, -491.8, 73.6, 87.8, 2),
  W(-502, -490.5, 89, 114, 2),
  W(-501.7, -491.1, 118.1, 136.7, 2, { faces: { x0: CW_TALL }, roof: 'none' }),
  W(-502, -490.5, 141, 166, 2),
  W(-502.3, -490.3, 167.4, 184.5, 2),
  // the end building, across the walk at the top of the court
  W(-722.6, -704, 116.8, 137.6, 2),
];
/** the lanes' ends, past the front row, under gables facing the forecourt (owner photo) */
const ENDS: [number, number, number, number][] = [[-502, -485.5, 95.9, 107.2], [-502, -483.2, 148, 159.5]];

/** the lowest ground under a rectangle of the model frame */
const baseOf = (k: Kit, x0: number, x1: number, z0: number, z1: number) => Math.min(k.ground(x0, z0), k.ground(x1, z0), k.ground(x0, z1), k.ground(x1, z1));

/** a gable roof with its ridge along x, a white pediment at the x1 end */
function gableX(k: Kit, x0: number, x1: number, z0: number, z1: number, eave: number, pitch: number) {
  const zm = (z0 + z1) / 2, top = eave + ((z1 - z0) / 2) * pitch;
  k.roof.quad([x0, eave, z0], [x1, eave, z0], [x1, top, zm], [x0, top, zm]);
  k.roof.quad([x1, eave, z1], [x0, eave, z1], [x0, top, zm], [x1, top, zm]);
  const i = 0.5;
  k.plain.push([flat([[-(z0 + i), eave], [-(z1 - i), eave], [-zm, top - i * pitch]], 0).rotateY(Math.PI / 2).translate(x1 - i - 0.02, 0, 0), WHITE]);
  for (const z of [z0, z1]) k.plain.push([box(x0, x1, eave - 0.3, eave + 0.03, z - 0.06, z + 0.06), FASCIA]);
  // rake boards
  const rake = Math.hypot((z1 - z0) / 2, top - eave), ang = Math.atan2(top - eave, (z1 - z0) / 2);
  for (const s of [-1, 1]) k.plain.push([new THREE.BoxGeometry(0.1, 0.28, rake).rotateX(s * ang).translate(x1 + 0.02, (eave + top) / 2 - 0.1, zm + (s * (z1 - z0)) / 4), FASCIA]);
}
/** a hip roof over a rectangle, white fascia */
function hip(k: Kit, x0: number, x1: number, z0: number, z1: number, eave: number, pitch: number) {
  const w = x1 - x0, d = z1 - z0, half = Math.min(w, d) / 2, top = eave + half * pitch;
  if (w >= d) {
    const zm = (z0 + z1) / 2, r0 = [x0 + half, top, zm], r1 = [x1 - half, top, zm];
    k.roof.quad([x0, eave, z0], [x1, eave, z0], r1, r0); k.roof.quad([x1, eave, z1], [x0, eave, z1], r0, r1);
    k.roof.quad([x0, eave, z1], [x0, eave, z0], r0, r0); k.roof.quad([x1, eave, z0], [x1, eave, z1], r1, r1);
  } else {
    const xm = (x0 + x1) / 2, r0 = [xm, top, z0 + half], r1 = [xm, top, z1 - half];
    k.roof.quad([x1, eave, z0], [x1, eave, z1], r1, r0); k.roof.quad([x0, eave, z1], [x0, eave, z0], r0, r1);
    k.roof.quad([x0, eave, z0], [x1, eave, z0], r0, r0); k.roof.quad([x1, eave, z1], [x0, eave, z1], r1, r1);
  }
  for (const z of [z0, z1]) k.plain.push([box(x0, x1, eave - 0.3, eave + 0.03, z - 0.06, z + 0.06), FASCIA]);
  for (const x of [x0, x1]) k.plain.push([box(x - 0.06, x + 0.06, eave - 0.3, eave + 0.03, z0, z1), FASCIA]);
  return top;
}

// ---------- gardens (gardens.ts): the hall, the hill round it and the stairway's slopes ----------
const g = garden([-820, -330, 0, 260]);

const hall: Spec = {
  name: 'Commonwealth Hall',
  axis: [1, 0], origin: O, storey: ST, style: CW_WIN, roofColor: ROOF, fascia: FASCIA, pitch: 0.5,
  onGround: true,
  replaces: [[-540, 101.5], [-672, 101.8], [-654, 154.4], [-534.5, 154.6], [-713.3, 127.2], [-497.1, 80.7], [-496.4, 127.4], [-496.3, 175.9], [-578.8, 127.2], [-629, 128.3]],
  blocks: [...LANES, ...BARS, ...FRONT, ...ENDS.map(([x0, x1, z0, z1]) => W(x0, x1, z0, z1, 2, { roof: 'none' as const }))],
  keep: [[L(-735), L(-484), -6, 6], [L(-760), L(-730), -18, 18]],
  extras: (k) => {
    g.reseed(7);
    for (const b of [...LANES, ...BARS, ...FRONT]) g.clear.push([b.x0 + O[0] - 2, b.x1 + O[0] + 2, b.z0 + O[1] - 2, b.z1 + O[1] + 2]);
    g.clear.push([-760, -484, 122, 134], [-760, -728, 108, 148]);

    // the lanes' gabled ends facing the forecourt
    for (const [x0, x1, z0, z1] of ENDS) {
      const y = baseOf(k, L(x0), L(x1), Lz(z0), Lz(z1));
      gableX(k, L(x0), L(x1) + 0.8, Lz(z0) - 0.8, Lz(z1) + 0.8, y + k.wallTop(2), 0.5);
      // a balcony slab across the gable front (owner photo)
      k.plain.push([box(L(x1), L(x1) + 1.2, y + PL + ST - 0.1, y + PL + ST + 0.1, Lz(z0) + 2, Lz(z1) - 2), WHITE]);
      k.plain.push([box(L(x1) + 1.1, L(x1) + 1.2, y + PL + ST + 0.1, y + PL + ST + 1.1, Lz(z0) + 2, Lz(z1) - 2), WHITE]);
    }

    // the entrance block (local x 108.3..118.9, z -9.9..8.7): a higher hip roof with the lantern
    const ex0 = L(-501.7), ex1 = L(-491.1), ez0 = Lz(118.1), ez1 = Lz(136.7);
    const ey = baseOf(k, ex0, ex1, ez0, ez1), eave = ey + k.wallTop(2) + 0.6;
    k.plain.push([box(ex0, ex1, ey + k.wallTop(2), eave, ez0, ez1), WHITE]);
    k.roof.c = new THREE.Color(ROOF);
    const top = hip(k, ex0 - 0.8, ex1 + 0.8, ez0 - 0.8, ez1 + 0.8, eave, 0.5);
    // the lantern on the ridge and the brick stack above it (owner photo)
    const lx = (ex0 + ex1) / 2;
    k.plain.push([box(lx - 1.6, lx + 1.6, top - 0.6, top + 1.2, -1.6, 1.6), WHITE]);
    for (const s of [-1, 1]) k.glass.push(box(lx - 1.0, lx + 1.0, top - 0.2, top + 0.9, s * 1.62 - 0.02, s * 1.62 + 0.02));
    k.roof.c = new THREE.Color('#4e3b30');
    hip(k, lx - 2.0, lx + 2.0, -2.0, 2.0, top + 1.2, 0.45);
    k.plain.push([box(lx - 0.55, lx + 0.55, top + 1.6, top + 5.2, -0.55, 0.55), '#7b4a35']);
    k.plain.push([box(lx - 0.75, lx + 0.75, top + 5.2, top + 5.5, -0.75, 0.75), '#5a3626']);
    k.roof.c = new THREE.Color(ROOF);
    // the front (east, toward the stairs): a portico of two white columns round the dark gate under a lattice frieze
    const fy = ey;
    for (const z of [-3.2, 3.2]) k.plain.push([box(ex1 + 1.6, ex1 + 2.4, fy, fy + k.wallTop(2) - 0.4, z - 0.4, z + 0.4), WHITE]);
    k.plain.push([box(ex1, ex1 + 2.6, fy + k.wallTop(2) - 0.4, fy + k.wallTop(2) + 0.4, -4.4, 4.4), WHITE]);
    for (let z = -3.6; z <= 3.6; z += 0.9) k.plain.push([box(ex1 + 2.6, ex1 + 2.64, fy + k.wallTop(2) - 0.3, fy + k.wallTop(2) + 0.3, z - 0.3, z + 0.3), '#3b3430']);
    k.plain.push([box(ex1, ex1 + 0.06, fy + PL, fy + PL + 3.4, -1.5, 1.5), '#2b211b']);
    k.plain.push([box(ex1 + 0.06, ex1 + 0.09, fy + PL, fy + PL + 3.4, -0.04, 0.04), '#8a6a4a']);
    k.plain.push([box(ex1, ex1 + 2.6, fy, fy + 0.25, -4.4, 4.4), PAVE]);
    // stone plinths with the hall crest either side of the steps
    for (const z of [-6.2, 6.2]) {
      k.plain.push([box(ex1 + 2.6, ex1 + 4.4, fy, fy + 1.1, z - 1.0, z + 1.0), STONE]);
      k.plain.push([box(ex1 + 4.42, ex1 + 4.46, fy + 1.1, fy + 2.3, z - 0.6, z + 0.6), '#7a2430']);
    }
    k.signs.push({ text: 'COMMONWEALTH HALL', x: ex1 + 0.04, y: fy + PL + 3.75, z: 0, ry: Math.PI / 2, w: 3.4, colors: ['#f7f4ec', '#7a2430'] });
    // the court side (west): a canopy slab over the ground floor and the door under it (owner photo)
    k.plain.push([box(ex0 - 2.4, ex0, fy + PL + ST - 0.25, fy + PL + ST, -5, 5), WHITE]);
    k.plain.push([box(ex0 - 0.06, ex0, fy + PL, fy + PL + 2.8, -1.3, 1.3), '#4a3426']);
    for (let i = 0; i < 3; i++) k.plain.push([box(ex0 - 2.4 - i * 0.4, ex0, fy, fy + 0.18 * (3 - i), -5, 5), PAVE]);

    // the pavilions on the walk: a dark passage through each
    for (const [x0, x1, z0, z1] of PAVILIONS) {
      const a = L(x0), b = L(x1), c = Lz(z0), d = Lz(z1), y = baseOf(k, a, b, c, d);
      k.plain.push([box(a, b, y, y + k.wallTop(2), c, d), WHITE]);
      k.plain.push([box(a, b, y, y + PL, c - 0.05, d + 0.05), '#8c8174']);
      for (const x of [a - 0.03, b + 0.03]) k.plain.push([box(x - 0.02, x + 0.02, y + PL, y + 3.2, -1.6, 1.6), '#2f2a26']);
      for (const z of [c, d]) for (let x = a + 1.6; x < b - 1; x += 2.6) k.glass.push(box(x, x + 1.1, y + PL + ST + 0.6, y + PL + ST + 2.2, z - 0.04, z + 0.04));
      k.roof.c = new THREE.Color(ROOF);
      hip(k, a - 0.8, b + 0.8, c - 0.8, d + 0.8, y + k.wallTop(2), 0.5);
    }

    // the walk from the gate up the court to the end building, in slabs that follow the ground
    for (let x = L(-704); x < L(-502); x += 2) {
      const y = k.ground(x + 1, 0);
      k.plain.push([box(x, x + 2.02, y - 0.3, y + 0.08, -3, 3), '#cfc6b6']);
      k.plain.push([box(x, x + 2.02, y - 0.3, y + 0.14, -3.3, -3), '#a99f8f'], [box(x, x + 2.02, y - 0.3, y + 0.14, 3, 3.3), '#a99f8f']);
    }
    // the courts: lawns with hedges along the walk, flower bushes and palms
    for (const [x0, x1] of [[-700, -682], [-670, -636], [-624, -583], [-571, -536], [-524, -503]] as [number, number][]) {
      for (const s of [-1, 1]) {
        g.hedge(k, L(x0) + 1, s * 4.5, L(x1) - 1, s * 4.5);
        for (let x = x0 + 4; x < x1 - 2; x += 8) g.palm(k, L(x), s * 7.5, 6 + g.rand() * 2);
      }
      g.scatter(x0, x1, 108, 145, 10, (x, z) => g.bush(k, L(x), Lz(z), 0.7 + g.rand() * 0.5));
    }

    // the amphitheatre west of the end building: stepped seats rising west round a stage
    const ax = L(-736), ay = k.ground(ax, 0);
    k.plain.push([new THREE.CylinderGeometry(5.5, 5.5, 0.6, 20).translate(ax, ay + 0.1, 0), '#cfc6b6']);
    for (let i = 0; i < 6; i++) {
      // each tier a ring of stone blocks, a step higher than the one inside it
      const r = 7.1 + i * 1.3, n = 14, h = ay + 0.42 * (i + 1);
      for (let j = 0; j < n; j++) {
        const a = Math.PI / 2 + ((j + 0.5) / n) * Math.PI, w = (Math.PI * (r + 0.65)) / n + 0.15;
        k.plain.push([new THREE.BoxGeometry(1.3, h - ay + 0.5, w).translate(0, (h + ay - 0.5) / 2, 0).rotateY(-a).translate(ax + Math.cos(a) * r, 0, -Math.sin(a) * r), i % 2 ? '#b7ad9d' : '#c9bfae']);
      }
    }

    // gardens all round: trees on the slopes, bushes along the blocks
    g.scatter(-745, -480, 50, 93, 70, (x, z) => (g.rand() < 0.75 ? g.tree(k, L(x), Lz(z), 0.9 + g.rand() * 0.5) : g.bush(k, L(x), Lz(z))));
    g.scatter(-745, -480, 162, 210, 80, (x, z) => (g.rand() < 0.75 ? g.tree(k, L(x), Lz(z), 0.9 + g.rand() * 0.5) : g.bush(k, L(x), Lz(z))));
    g.scatter(-800, -745, 70, 190, 60, (x, z) => g.tree(k, L(x), Lz(z), 1 + g.rand() * 0.6));
    g.scatter(-740, -505, 92, 164, 60, (x, z) => g.bush(k, L(x), Lz(z), 0.6 + g.rand() * 0.4));
  },
};

// ---------- the approach (frame: map axes, origin at the middle of the stairway) ----------
const A: [number, number] = [-420, 128];
const stair = stairsOf()[0];
// (set back from the road loop at the end of the avenue, either side of the foot of the stairs: x -382 to -373)
const gateHouse = (z0: number, z1: number): Block => ({ x0: -382 - A[0], x1: -373 - A[0], z0: z0 - A[1], z1: z1 - A[1], floors: 1 });
const approach: Spec = {
  name: 'Commonwealth Hall stairway',
  axis: [1, 0], origin: A, storey: 3.2, style: CW_WIN, roofColor: '#4e3b30', fascia: '#4e3b30', pitch: 0.45,
  onGround: true,
  replaces: [[-452.4, 131.5]],
  blocks: [gateHouse(106.5, 116), gateHouse(140, 149.5)],
  keep: [[-464 - A[0], -360 - A[0], -14, 14], [-490 - A[0], -464 - A[0], -22, 22], [-383 - A[0], -363 - A[0], -23, 23]],
  extras: (k) => {
    g.reseed(11);
    const X = (x: number) => x - A[0], Z = (z: number) => z - A[1];
    const z0 = Z(stair.z0), z1 = Z(stair.z1);
    g.clear.push([-492, -360, 112, 144], [-384, -361, 104, 152]);
    // the stairway: each step and landing a solid block down into the hill
    const dir = Math.sign(stair.x1 - stair.x0), len = Math.abs(stair.x1 - stair.x0), seg = len / stair.flights;
    for (let f = 0; f < stair.flights; f++) {
      for (let s = 0; s <= stair.steps; s++) {
        const u0 = f * seg + s * stair.tread, u1 = s < stair.steps ? u0 + stair.tread : (f + 1) * seg;
        const xa = X(stair.x0 + dir * u0), xb = X(stair.x0 + dir * Math.min(len, u1)), h = stair.at(stair.x0 + dir * (u0 + 0.01));
        const landing = s === stair.steps;
        k.plain.push([box(Math.min(xa, xb), Math.max(xa, xb), h - 1.6, h + 0.02, z0, z1), landing ? '#c9b9a0' : s % 2 ? '#d8cbb5' : '#cfc1aa']);
        // the nosing of each step
        if (!landing) k.plain.push([box(Math.min(xa, xb) - 0.02, Math.min(xa, xb) + 0.05, h - 0.12, h + 0.03, z0, z1), '#a99a82']);
      }
    }
    // stone walls along both sides, stepping with the stairs over the slope beside them
    for (let x = stair.x0; dir * (stair.x1 - x) > 0; x += dir * 1) {
      const xm = x + dir * 0.5, hs = Math.max(stair.at(x), stair.at(x + dir * 0.99));
      for (const [zw, zo] of [[stair.z0, stair.z0 - 1.2], [stair.z1, stair.z1 + 1.2]]) {
        const ho = groundHeight(xm, zo), lo = Math.min(hs, ho) - 0.6, hi = Math.max(hs, ho) + 0.7;
        k.plain.push([box(X(x), X(x + dir * 1.01), lo, hi, Z(zw) - 0.35, Z(zw) + 0.35), (Math.floor(x) & 1) ? STONE : STONE_DARK]);
      }
    }
    // pools either side of the walk on the first landing (owner photo), palms along the stairs
    const l0 = stair.x0 + dir * (stair.steps * stair.tread + 1.5), l1 = stair.x0 + dir * (seg - 1.5), lh = stair.at(l0);
    for (const [pz0, pz1] of [[stair.z0 + 1.5, 124.6], [131.4, stair.z1 - 1.5]]) {
      k.plain.push([box(Math.min(X(l0), X(l1)), Math.max(X(l0), X(l1)), lh, lh + 0.4, Z(pz0), Z(pz1)), '#c08a6a']);
      k.plain.push([box(Math.min(X(l0), X(l1)) + 0.3, Math.max(X(l0), X(l1)) - 0.3, lh + 0.3, lh + 0.33, Z(pz0) + 0.3, Z(pz1) - 0.3), '#4f9cb8']);
    }
    for (let f = 0; f < stair.flights; f++) {
      const x = stair.x0 + dir * (f * seg + stair.steps * stair.tread + 2);
      for (const z of [stair.z0 - 3, stair.z1 + 3]) g.palm(k, X(x), Z(z), 6.5 + g.rand() * 2);
    }
    // the stone arches below the forecourt at the top of the stairs (owner photos): the walk passes north of them
    const ax0 = X(-457), ax1 = X(-448), az0 = Z(124), az1 = Z(stair.z1), aTop = stair.top;
    k.plain.push([box(ax0, ax1, stair.at(-448) - 1, aTop + 1.0, az0, az1), STONE]);
    k.plain.push([box(ax0, ax1 + 0.1, aTop + 0.9, aTop + 1.1, az0 - 0.1, az1 + 0.1), '#b8a88e']);
    for (const zc of [-1.8, 3, 7.8]) {
      const y0 = stair.at(-448) + 0.1;
      k.plain.push([box(ax1, ax1 + 0.04, y0, y0 + 2.2, zc - 1.1, zc + 1.1), '#3a3129']);
      k.plain.push([new THREE.CircleGeometry(1.1, 12, 0, Math.PI).rotateY(Math.PI / 2).translate(ax1 + 0.04, y0 + 2.2, zc), '#3a3129']);
    }
    // the forecourt: red paving with the hall crest in a ring, in front of the gate
    const fy = k.ground(X(-478), 0);
    k.plain.push([box(X(-489), X(-464), fy - 0.3, fy + 0.08, Z(108), Z(148)), '#a85a43']);
    k.plain.push([new THREE.RingGeometry(3.4, 4.1, 32).rotateX(-Math.PI / 2).translate(X(-483), fy + 0.1, 0), '#e8dccb']);
    k.plain.push([new THREE.CircleGeometry(1.7, 24).rotateX(-Math.PI / 2).translate(X(-483), fy + 0.1, 0), '#c8a13a']);
    // a low wall along the forecourt's edge above the slope, open to the stairs
    for (const [za, zb] of [[108, stair.z0 - 0.4], [stair.z1 + 0.4, 148]]) k.plain.push([box(X(-465), X(-464), fy, fy + 0.9, Z(za), Z(zb)), STONE]);
    // landing at the foot: paving from the road to the first step, and the low stone walls by the gate houses (owner photo)
    k.plain.push([box(X(-372), X(-363.5), -0.2, 0.08, Z(116), Z(140)), '#c9b9a0']);
    for (const z of [116.3, 139.7]) k.plain.push([box(X(-372.8), X(-364), 0, 0.8, Z(z) - 0.35, Z(z) + 0.35), STONE]);
    // the gate houses: blue signs toward the road
    for (const [zc, text] of [[111, 'UNIVERSITY OF GHANA'], [145, 'COMMONWEALTH HALL']] as [number, string][]) {
      const gy = k.ground(X(-373), Z(zc));
      k.signs.push({ text, x: X(-373) + 0.03, y: gy + 2.1, z: Z(zc), ry: Math.PI / 2, w: 3.8, colors: ['#1f4f9a', '#ffffff'] });
      k.plain.push([box(X(-373), X(-372.9), gy + 0.4, gy + 2.6, Z(zc) - 4, Z(zc) - 2.6), '#3a3f47']);
    }
    // trees and bushes on the slopes either side of the stairway
    g.scatter(-464, -378, 40, 112, 90, (x, z) => (g.rand() < 0.7 ? g.tree(k, X(x), Z(z), 0.9 + g.rand() * 0.6) : g.bush(k, X(x), Z(z))));
    g.scatter(-464, -378, 144, 216, 90, (x, z) => (g.rand() < 0.7 ? g.tree(k, X(x), Z(z), 0.9 + g.rand() * 0.6) : g.bush(k, X(x), Z(z))));
    for (let x = -460; x < -380; x += 7) for (const z of [stair.z0 - 6, stair.z1 + 6]) if (g.clearOf(x, z)) g.bush(k, X(x), Z(z), 0.8);
  },
};

/** Commonwealth Hall and its approach up Legon Hill */
export const commonwealth = createSite('commonwealth', [hall, approach]);
