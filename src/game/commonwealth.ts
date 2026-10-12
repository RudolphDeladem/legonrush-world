// Commonwealth Hall (Vandals) on Legon Hill, modelled from the owner's labelled aerial and photos and rebuilt to the
// owner's Commonwealth and Great Hall brief (block engine: blocks.ts; the hill, its levels and its stairways: relief.ts).
//
// The hall: a long east-west plan up the hill. Two pairs of two-storey lanes run west from the front
// (the vertical lanes on the owner's aerial); three-storey bars cross them (the horizontal ones,
// marked in purple: one floor above the lanes): long crossbars either side of the central court and
// shorter stubs further along. The front is a row of two-storey blocks on a terrace above the drive: the entrance block
// in the middle (brief pairs 1 and 3: a broad red-tile hip roof with deep dark eaves, a two-storey recess between
// strong white piers with the dark grilled doors in it, a patterned ventilation band under the eaves; no lantern or
// chimney), joined to the wings either side; the lanes' gabled ends either side of it, the south one the pharmacy (pair
// 4: deep shaded eaves, louvred shutters, a projecting entrance bay with its sign, stone-faced planting terraces and
// steps down to the parking), and a small block at each end. From the gate a paved walk runs west through the courts
// to the end building, level between the flights of steps that climb the hill (S8), past the Bacchus statue in the
// first court (S7), with the amphitheatre beyond it and the way on up to the Great Hall.
// White render, dark-brown framed windows, weathered orange tile hip roofs with white eaves.
//
// The approach (pair 2): two single-storey gate houses (white, aged gable roofs toward the road, blue signs) either
// side of the foot, white piers and short walls at the gateway; the street steps, a level landing through the gateway,
// then flights separated by level walks between stone walls, shorter higher up (relief.ts), palms on the landings,
// pools on the second, past the stone arches below the forecourt to the drive; the entrance's broad steps rise from the
// asphalt parking in front of the gate. Gardens, bushes and trees all round.
//
// Every block stands on the ground under it (Spec.onGround): the lanes are built in short lengths that step up the
// hill's levels.
import * as THREE from 'three';
import { PAVE, WHITE, box, canvas, flat, tri2 } from './modelkit';
import { PL, createSite, render, slab, window_, type Block, type Kit, type Spec, type Style } from './blocks';
import { garden } from './gardens';
import { CW_LEVELS, groundHeight, stairsOf } from './relief';
import { NODE_XZ, ROADS } from './campusmap';
import { car } from './cc';
import { wallSolids } from './enkit';
import { SOLIDS } from './solids';

const ROOF = '#c4613a', AGED = '#b25a3c', FASCIA = '#fbf9f3', FRAME = '#5a3b28', STONE = '#9b8a72', STONE_DARK = '#7d6d58', SOFFIT_DARK = '#4a3a30';
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

/** the pharmacy wing (pair 4): narrow dark louvred shutters on both floors, a small high vent over each */
const louvre = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#4a3a2c'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  g.fillStyle = '#6b5440'; g.fillRect(x, y, w, h);
  g.fillStyle = '#3a2d22';
  for (let yy = y + 6; yy < y + h - 3; yy += 9) g.fillRect(x + 2, yy, w - 4, 3);
  g.fillRect(x + w / 2 - 1, y, 2, h);
};
const CW_SHUT: Style = {
  bay: 2.4,
  up: [],
  ground: [],
  draw: (g) => {
    render(g, '#f4f1ea');
    louvre(g, 100, 60, 56, 150); g.fillStyle = '#3a332d'; g.fillRect(104, 18, 48, 20);
    slab(g, 238, 18);
    louvre(g, 100, 316, 56, 150);
  },
};
/** the entrance block's ventilation band (pairs 1 and 3): a row of dark panels with a light lattice in them */
let ventMat: THREE.MeshStandardMaterial | null = null;
const vent = () => (ventMat ??= new THREE.MeshStandardMaterial({ roughness: 0.85, map: canvas(64, 32, (g) => {
  g.fillStyle = '#efebe3'; g.fillRect(0, 0, 64, 32);
  g.fillStyle = '#2e2a27'; g.fillRect(5, 5, 54, 22);
  g.strokeStyle = '#d9d3c7'; g.lineWidth = 2.4;
  g.beginPath(); g.moveTo(5, 16); g.lineTo(18, 5); g.lineTo(32, 16); g.lineTo(46, 5); g.lineTo(59, 16); g.lineTo(46, 27); g.lineTo(32, 16); g.lineTo(18, 27); g.closePath(); g.stroke();
  g.fillStyle = '#d9d3c7'; for (const x of [18, 32, 46]) g.fillRect(x - 1.5, 14.5, 3, 3);
}) }));
/** a vertical band facing +x at x, z0..z1, y0..y1, one lattice panel per `panel` metres */
function ventBand(k: Kit, x: number, z0: number, z1: number, y0: number, y1: number, panel = 1.3) {
  const g = new THREE.PlaneGeometry(z1 - z0, y1 - y0).rotateY(Math.PI / 2).translate(x, (y0 + y1) / 2, (z0 + z1) / 2);
  const uv = g.attributes.uv as THREE.BufferAttribute, n = Math.max(1, Math.round((z1 - z0) / panel));
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * n);
  const m = new THREE.Mesh(g, vent());
  m.receiveShadow = true;
  k.meshes.push(m);
}

/** a modelled stairway (relief.ts) in a model's frame: each step and landing a solid block down into the ground, a
 *  nosing at the front of each step */
type Stair = ReturnType<typeof stairsOf>[number];
function drawStair(k: Kit, s: Stair, X: (x: number) => number, Z: (z: number) => number, step: [string, string], landing: string, nose: string, depth = 1.6) {
  const dir = Math.sign(s.x1 - s.x0);
  s.segs.forEach((q, i) => {
    const xa = X(s.x0 + dir * q.u0), xb = X(s.x0 + dir * q.u1);
    k.plain.push([box(Math.min(xa, xb), Math.max(xa, xb), q.h - depth, q.h + 0.02, Z(s.z0), Z(s.z1)), q.landing ? landing : step[i % 2]]);
    if (!q.landing) k.plain.push([box(xa - 0.05, xa + 0.05, q.h - 0.12, q.h + 0.03, Z(s.z0), Z(s.z1)), nose]);
  });
}
/** stone cheek walls along both sides of a stairway, stepping with it (world x, z; X, Z the model frame) */
function cheeks(k: Kit, s: Stair, X: (x: number) => number, Z: (z: number) => number, over = 0.45, t = 0.35) {
  const dir = Math.sign(s.x1 - s.x0);
  for (const q of s.segs) {
    const xa = X(s.x0 + dir * q.u0), xb = X(s.x0 + dir * q.u1);
    for (const z of [s.z0 - t / 2, s.z1 + t / 2]) k.plain.push([box(Math.min(xa, xb), Math.max(xa, xb), q.h - 1.2, q.h + over, Z(z) - t / 2, Z(z) + t / 2), STONE]);
  }
  wallSolids(s.x0, s.z0 - t / 2, s.x1, s.z0 - t / 2, 0.3); wallSolids(s.x0, s.z1 + t / 2, s.x1, s.z1 + t / 2, 0.3);
}

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
/** the front terrace's height (relief.ts): the front row and the first court stand on it */
const FH = CW_LEVELS.front.h;
const FRONT = [
  W(-502.4, -491.8, 73.6, 87.8, 2),
  W(-502, -490.5, 89, 114, 2),
  // the entrance block's joins to the wings either side (the aerial's continuous front: a wall set back, a roof return)
  W(-501.4, -492.2, 113.6, 118.4, 2),
  W(-501.7, -491.1, 118.1, 136.7, 2, { faces: { x0: CW_TALL }, roof: 'none' }),
  W(-501.4, -492.2, 136.4, 141.4, 2),
  W(-502, -490.5, 141, 159.5, 2),
  // the lower wing beside the pharmacy (pair 4)
  W(-502, -490.5, 159.5, 166, 1),
  W(-502.3, -490.3, 167.4, 184.5, 2),
  // the end building, across the walk at the top of the court
  W(-722.6, -704, 116.8, 137.6, 2),
];
/** the lanes' ends, past the front row, under gables facing the forecourt (owner photo): the north one, and the south one
 *  the pharmacy (pair 4); both on the front terrace's level, their walls down to the drive's ground below its edge */
const END_N: [number, number, number, number] = [-502, -485.5, 95.9, 107.2];
const PHARM: [number, number, number, number] = [-502, -483.2, 148, 159.5];
const ENDS = [W(...END_N, 2, { roof: 'none', y: FH }), W(...PHARM, 2, { roof: 'none', y: FH, faces: { x1: CW_SHUT, z0: CW_SHUT, z1: CW_SHUT } })];

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
/** a deep gable (the pharmacy, pair 4): the walls x0..x1, z0..z1 up to `eave`; the roof runs `over` past the gable end
 *  and the sides, its underside dark; the gable wall white to the ridge with a group of small high vents */
function deepGable(k: Kit, x0: number, x1: number, z0: number, z1: number, eave: number, pitch: number, over: number) {
  const zm = (z0 + z1) / 2, half = (z1 - z0) / 2, top = eave + half * pitch, e = eave - over * pitch, X1 = x1 + over;
  k.roof.quad([x0, e, z0 - over], [X1, e, z0 - over], [X1, top, zm], [x0, top, zm]);
  k.roof.quad([X1, e, z1 + over], [x0, e, z1 + over], [x0, top, zm], [X1, top, zm]);
  // the dark underside: under the overhang past the gable, and along both sides
  const d = 0.07;
  const under = (p: [number, number, number][]) => { const q = p.map(([x, y, z]) => [x, y - d, z] as [number, number, number]); k.plain.push([tri2(q[0], q[1], q[2]), SOFFIT_DARK], [tri2(q[0], q[2], q[3]), SOFFIT_DARK]); };
  under([[x1, e, z0 - over], [X1, e, z0 - over], [X1, top, zm], [x1, top, zm]]);
  under([[x1, e, z1 + over], [X1, e, z1 + over], [X1, top, zm], [x1, top, zm]]);
  under([[x0, e, z0 - over], [x1, e, z0 - over], [x1, eave, z0], [x0, eave, z0]]);
  under([[x0, e, z1 + over], [x1, e, z1 + over], [x1, eave, z1], [x0, eave, z1]]);
  // the gable wall, the fascia boards along the eaves and the rakes
  k.plain.push([flat([[-z0, eave], [-z1, eave], [-zm, top]], 0).rotateY(Math.PI / 2).translate(x1, 0, 0), WHITE]);
  for (const z of [z0 - over, z1 + over]) k.plain.push([box(x0, X1, e - 0.28, e + 0.03, z - 0.06, z + 0.06), '#e9e3d6']);
  const rake = Math.hypot(half + over, top - e), ang = Math.atan2(top - e, half + over);
  for (const s of [-1, 1]) k.plain.push([new THREE.BoxGeometry(0.12, 0.3, rake).rotateX(s * ang).translate(X1 + 0.03, (e + top) / 2 - 0.12, zm + (s * (half + over)) / 2), '#e9e3d6']);
  // the high vents in the gable
  for (const dz of [-1.1, 0, 1.1]) k.plain.push([box(x1, x1 + 0.05, top - 2.3, top - 1.5, zm + dz - 0.3, zm + dz + 0.3), '#2f2925']);
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

/** the Bacchus statue (S7): a bronze figure, one arm raised, on a stone plinth; at the foot `y`, facing +x (model frame) */
function bacchus(k: Kit, x: number, z: number, y: number, yaw: number) {
  const parts: [THREE.BufferGeometry, string][] = [];
  const BR = '#4a4237', BR2 = '#3a332b';
  // the plinth: a stepped base, a tapering shaft, a cap
  parts.push([box(-0.85, 0.85, -0.3, 0.25, -0.85, 0.85), '#b8ad9a']);
  parts.push([new THREE.CylinderGeometry(0.5, 0.66, 1.5, 4).rotateY(Math.PI / 4).translate(0, 1.0, 0), '#c6bba7']);
  parts.push([box(-0.58, 0.58, 1.75, 1.92, -0.58, 0.58), '#b3a893']);
  const f = 1.92;
  // the figure (about 2 m): legs apart, torso leaning back a little, the right arm raised high, the left down by the side
  for (const [dz, lean] of [[-0.16, 0.08], [0.18, -0.12]]) parts.push([new THREE.CylinderGeometry(0.1, 0.075, 0.95, 7).rotateX(lean).translate(0, f + 0.48, dz), BR]);
  parts.push([new THREE.CylinderGeometry(0.2, 0.15, 0.75, 8).rotateZ(-0.08).translate(-0.02, f + 1.3, 0), BR]);
  parts.push([new THREE.SphereGeometry(0.13, 10, 8).translate(-0.05, f + 1.83, 0), BR]);
  parts.push([new THREE.CylinderGeometry(0.05, 0.06, 0.85, 6).rotateX(-0.45).rotateZ(-0.25).translate(0.06, f + 2.05, 0.3), BR2]);
  parts.push([new THREE.SphereGeometry(0.06, 6, 5).translate(0.14, f + 2.43, 0.48), BR2]);
  parts.push([new THREE.CylinderGeometry(0.05, 0.045, 0.7, 6).rotateX(0.18).translate(0, f + 1.25, -0.3), BR2]);
  for (const [g, c] of parts) k.plain.push([g.rotateY(yaw).translate(x, y, z), c]);
  SOLIDS.add(...k.world(x, z), 1.0);
}

// ---------- gardens (gardens.ts): the hall, the hill round it and the stairway's slopes ----------
const g = garden([-820, -330, 0, 260]);
const courtFlights = stairsOf().filter((s) => s.z0 === CW_LEVELS.walk[0] && s.z1 === CW_LEVELS.walk[1]);
const entranceSteps = stairsOf().find((s) => s.x0 === CW_LEVELS.front.steps.x0 && s.x1 === CW_LEVELS.front.steps.x1)!;

const hall: Spec = {
  name: 'Commonwealth Hall',
  axis: [1, 0], origin: O, storey: ST, style: CW_WIN, roofColor: ROOF, fascia: FASCIA, pitch: 0.5,
  onGround: true,
  replaces: [[-540, 101.5], [-672, 101.8], [-654, 154.4], [-534.5, 154.6], [-713.3, 127.2], [-497.1, 80.7], [-496.4, 127.4], [-496.3, 175.9], [-578.8, 127.2], [-629, 128.3]],
  blocks: [...LANES, ...BARS, ...FRONT, ...ENDS],
  keep: [[L(-735), L(-478), -6, 6], [L(-760), L(-730), -18, 18], [L(-490), L(-476), Lz(145), Lz(163)]],
  extras: (k) => {
    g.reseed(7);
    for (const b of [...LANES, ...BARS, ...FRONT, ...ENDS]) g.clear.push([b.x0 + O[0] - 2, b.x1 + O[0] + 2, b.z0 + O[1] - 2, b.z1 + O[1] + 2]);
    g.clear.push([-760, -478, 122, 134], [-760, -728, 108, 148], [-492, -476, 70, 188]);
    // the retaining walls across the courts at each flight's foot are drawn below; keep bushes off them
    for (const [f] of CW_LEVELS.flights) g.clear.push([f - 1, f + 2.2, 70, 188]);

    // the north lane's gabled end facing the forecourt, a balcony slab across it (owner photo)
    {
      const [x0, x1, z0, z1] = END_N;
      gableX(k, L(x0), L(x1) + 0.8, Lz(z0) - 0.8, Lz(z1) + 0.8, FH + k.wallTop(2), 0.5);
      k.plain.push([box(L(x1), L(x1) + 1.2, FH + PL + ST - 0.1, FH + PL + ST + 0.1, Lz(z0) + 2, Lz(z1) - 2), WHITE]);
      k.plain.push([box(L(x1) + 1.1, L(x1) + 1.2, FH + PL + ST + 0.1, FH + PL + ST + 1.1, Lz(z0) + 2, Lz(z1) - 2), WHITE]);
    }

    // ---- the front terrace's edge above the drive: a stone-faced retaining wall with a low coping, open at the
    // entrance's steps and where the gabled ends stand forward of it
    const gy = k.ground(L(-484), 0), edge = CW_LEVELS.front.x1;
    for (const [za, zb] of [[72, END_N[2]], [END_N[3], entranceSteps.z0 - 0.35], [entranceSteps.z1 + 0.35, PHARM[2]], [PHARM[3], 186]] as [number, number][]) {
      k.plain.push([box(L(edge) - 0.15, L(edge) + 1.15, gy - 0.4, FH + 0.4, Lz(za), Lz(zb)), STONE]);
      k.plain.push([box(L(edge) - 0.25, L(edge) + 1.25, FH + 0.4, FH + 0.52, Lz(za), Lz(zb)), '#b8a88e']);
      wallSolids(edge + 0.5, za, edge + 0.5, zb, 0.6);
      for (let z = za + 2; z < zb - 1; z += 3.2 + g.rand() * 2) g.bush(k, L(edge + 2.2), Lz(z), 0.6 + g.rand() * 0.3);
    }

    // ---- the entrance block (pairs 1 and 3): the walls a little higher than the wings, a broad hip roof with deep eaves
    // over a dark soffit, the ventilation band under them; the doorway set back between strong white piers rising
    // through both floors; its broad weathered steps down to the parking
    const ex0 = L(-501.7), ex1 = L(-491.1), ez0 = Lz(118.1), ez1 = Lz(136.7);
    const ey = baseOf(k, ex0, ex1, ez0, ez1), wt = ey + k.wallTop(2), eave = wt + 0.9, ov = 1.7;
    k.plain.push([box(ex0, ex1, wt - 0.2, eave, ez0, ez1), WHITE]);
    k.roof.c = new THREE.Color(AGED);
    hip(k, ex0 - ov, ex1 + ov, ez0 - ov, ez1 + ov, eave, 0.42);
    k.roof.c = new THREE.Color(ROOF);
    for (const [a, b, c, d] of [[ex0 - ov, ex1 + ov, ez0 - ov, ez0], [ex0 - ov, ex1 + ov, ez1, ez1 + ov], [ex0 - ov, ex0, ez0, ez1], [ex1, ex1 + ov, ez0, ez1]]) k.plain.push([box(a, b, eave - 0.1, eave - 0.03, c, d), SOFFIT_DARK]);
    ventBand(k, ex1 + 0.03, ez0 + 0.4, ez1 - 0.4, wt + 0.05, eave - 0.2);
    // the recess: its back wall (the facade) plain between the piers, the dark grilled doors, a transom with the name,
    // the dark glazing of the upper floor; the piers and the head across them standing 1.2 m out
    const P = 1.2, rz = 3.1, fy = ey;
    k.plain.push([box(ex1, ex1 + 0.04, fy, eave - 0.2, -rz, rz), '#ebe7de']);
    k.plain.push([box(ex1 + 0.04, ex1 + 0.1, fy + PL, fy + PL + 3.0, -2.5, 2.5), '#2b2420']);
    for (let z = -2.4; z <= 2.41; z += 0.3) k.plain.push([box(ex1 + 0.1, ex1 + 0.14, fy + PL, fy + PL + 3.0, z - 0.025, z + 0.025), '#5c4b3b']);
    for (const z of [-2.55, -0.85, 0.85, 2.55]) k.plain.push([box(ex1 + 0.04, ex1 + 0.16, fy + PL, fy + PL + 3.1, z - 0.07, z + 0.07), '#e6e1d6']);
    k.plain.push([box(ex1 + 0.04, ex1 + 0.16, fy + PL + 3.0, fy + PL + 3.2, -2.6, 2.6), '#e6e1d6']);
    k.signs.push({ text: 'COMMONWEALTH HALL', x: ex1 + 0.09, y: fy + PL + 3.55, z: 0, ry: Math.PI / 2, w: 3.6, colors: ['#f7f4ec', '#7a2430'] });
    k.plain.push([box(ex1 + 0.04, ex1 + 0.09, fy + PL + ST + 0.5, wt - 0.5, -2.4, 2.4), '#2f3438']);
    for (let z = -2.4; z <= 2.41; z += 1.2) k.plain.push([box(ex1 + 0.09, ex1 + 0.13, fy + PL + ST + 0.5, wt - 0.5, z - 0.05, z + 0.05), '#e6e1d6']);
    for (const s of [-1, 1]) k.plain.push([box(ex1, ex1 + P, fy, eave - 0.15, s > 0 ? rz : -rz - 1.3, s > 0 ? rz + 1.3 : -rz), WHITE]);
    k.plain.push([box(ex1, ex1 + P, wt - 0.15, eave - 0.15, -rz, rz), WHITE]);
    ventBand(k, ex1 + P + 0.02, -rz - 1.3, rz + 1.3, wt - 0.05, eave - 0.25, 1.25);
    // the threshold under the recess, a step up from the terrace
    k.plain.push([box(ex1, ex1 + P, fy - 0.3, fy + PL * 0.5, -rz, rz), '#a8735c']);
    // the broad steps from the parking up to the terrace (relief.ts stairway; weathered red) and their stone cheeks
    drawStair(k, entranceSteps, L, Lz, ['#a4664f', '#9b5f4a'], '#a86c55', '#8a5442', 2);
    cheeks(k, entranceSteps, L, Lz, 0.5, 0.45);
    // the court side (west): a canopy slab over the ground floor and the door under it (owner photo)
    k.plain.push([box(ex0 - 2.4, ex0, fy + PL + ST - 0.25, fy + PL + ST, -5, 5), WHITE]);
    k.plain.push([box(ex0 - 0.06, ex0, fy + PL, fy + PL + 2.8, -1.3, 1.3), '#4a3426']);

    // ---- the pharmacy (pair 4): deep shaded gable, louvred shutters (CW_SHUT), the entrance bay standing forward with
    // its sign, the walls below the terrace's level faced in stone; stone-faced planting terraces either side of the steps
    // down to the parking apron, shrubs and a small palm
    {
      const [x0, x1, z0, z1] = PHARM, zm = (z0 + z1) / 2, py = FH, pe = py + k.wallTop(2);
      deepGable(k, L(x0), L(x1), Lz(z0), Lz(z1), pe, 0.5, 1.5);
      const dy = k.ground(L(x1 + 1), Lz(zm));
      k.plain.push([box(L(x1), L(x1) + 0.12, dy - 0.3, py + 0.1, Lz(z0) - 0.06, Lz(z1) + 0.06), STONE_DARK]);
      // the bay: x1 .. x1 + 1.8, a flat roof slab, glazed doors, the sign over them
      const bx = L(x1), bw = 2.1, b0 = Lz(zm) - bw, b1 = Lz(zm) + bw;
      k.plain.push([box(bx, bx + 1.8, py - 0.2, py + PL + 3.4, b0, b1), '#f1eee6']);
      k.plain.push([box(bx - 0.1, bx + 2.3, py + PL + 3.4, py + PL + 3.65, b0 - 0.35, b1 + 0.35), '#e4ded2']);
      k.glass.push(box(bx + 1.8, bx + 1.84, py + PL, py + PL + 2.4, b0 + 0.5, b1 - 0.5));
      k.plain.push([box(bx + 1.8, bx + 1.86, py + PL + 2.4, py + PL + 2.5, b0 + 0.4, b1 - 0.4), '#3a3430']);
      k.plain.push([box(bx + 1.8, bx + 1.86, py + PL, py + PL + 2.4, Lz(zm) - 0.04, Lz(zm) + 0.04), '#3a3430']);
      k.signs.push({ text: 'PHARMACY', x: bx + 1.87, y: py + PL + 2.95, z: Lz(zm), ry: Math.PI / 2, w: 3.2, colors: ['#f4f7f3', '#1d6b47'] });
      k.plain.push([box(bx, bx + 1.8, dy - 0.3, py - 0.2, b0, b1), STONE_DARK]);
      // the steps down to the apron, between the planters
      const n = 7, run = 0.32, rise = (py - dy) / n;
      for (let i = 0; i < n; i++) k.plain.push([box(bx + 1.8 + i * run, bx + 1.8 + (i + 1) * run, dy - 0.3, py - rise * (i + 1) + rise, b0 + 0.6, b1 - 0.6), i % 2 ? '#c9bba5' : '#bfb19a']);
      // the planting terraces: two tiers of stone-faced beds, soil and shrubs on top
      for (const [za, zb] of [[Lz(z0) + 0.1, b0 + 0.55], [b1 - 0.55, Lz(z1) - 0.1]] as [number, number][]) {
        k.plain.push([box(bx, bx + 2.4, dy - 0.3, dy + 0.95, za, zb), STONE]);
        k.plain.push([box(bx + 0.1, bx + 2.3, dy + 0.95, dy + 1.0, za + 0.1, zb - 0.1), '#5b4636']);
        k.plain.push([box(bx + 2.4, bx + 4.0, dy - 0.3, dy + 0.5, za, zb), STONE_DARK]);
        k.plain.push([box(bx + 2.5, bx + 3.9, dy + 0.5, dy + 0.55, za + 0.1, zb - 0.1), '#5b4636']);
        for (let z = za + 0.6; z < zb - 0.3; z += 1.1) { g.bush(k, bx + 1.2, z, 0.55); g.bush(k, bx + 3.2, z + 0.4, 0.45); }
        wallSolids(...k.world(bx + 4, za), ...k.world(bx + 4, zb), 0.35);
      }
      g.palm(k, bx + 1.4, Lz(z1) - 1.2, 4.2);
      // the parking apron before it, along the drive
      k.plain.push([box(bx + 4.0, L(-477.4), dy - 0.3, dy + 0.04, Lz(z0) - 2, Lz(z1) + 3), '#6a6b6c']);
      k.plain.push([box(bx + 4.0, bx + 4.2, dy, dy + 0.14, Lz(z0) - 2, Lz(z1) + 3), '#bdb6a8']);
    }

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

    // ---- the courts' levels (S8): the flights up the walk, stone cheeks either side, and across the courts at each
    // flight's foot a retaining wall with a coping (open where the walk climbs)
    for (const s of courtFlights) {
      drawStair(k, s, L, Lz, ['#d6cab6', '#cbbfaa'], '#cfc6b6', '#a99a82', 1.6);
      cheeks(k, s, L, Lz, 0.5, 0.35);
      const lo = s.foot, hi = s.top, x = s.x0;
      for (const [za, zb] of [[CW_LEVELS.z[0], s.z0 - 0.35], [s.z1 + 0.35, CW_LEVELS.z[1]]] as [number, number][]) {
        k.plain.push([box(L(x) - 0.05, L(x) + 1.2, lo - 0.4, hi + 0.35, Lz(za), Lz(zb)), STONE]);
        k.plain.push([box(L(x) - 0.12, L(x) + 1.27, hi + 0.35, hi + 0.47, Lz(za), Lz(zb)), '#b8a88e']);
        wallSolids(x + 0.6, za, x + 0.6, zb, 0.6);
      }
    }
    // the walk from the gate up the courts to the end building: slabs on each level, the flights between them
    const inFlight = (x: number) => courtFlights.some((s) => x > Math.min(s.x0, s.x1) - 0.01 && x < Math.max(s.x0, s.x1) + 0.01);
    for (let x = -704; x < -502; x += 1) {
      if (inFlight(x) || inFlight(x + 1)) continue;
      const y = k.ground(L(x + 0.5), 0);
      k.plain.push([box(L(x), L(x + 1.01), y - 0.3, y + 0.08, -3, 3), (x & 3) ? '#cfc6b6' : '#c6bcab']);
      k.plain.push([box(L(x), L(x + 1.01), y - 0.3, y + 0.14, -3.3, -3), '#a99f8f'], [box(L(x), L(x + 1.01), y - 0.3, y + 0.14, 3, 3.3), '#a99f8f']);
    }
    // the courts: lawns with hedges along the walk, flower bushes and palms (S7: small planting islands either side)
    for (const [x0, x1] of [[-700, -690], [-670, -636], [-620, -583], [-569, -536], [-524, -503]] as [number, number][]) {
      for (const s of [-1, 1]) {
        g.hedge(k, L(x0) + 1, s * 4.5, L(x1) - 1, s * 4.5);
        for (let x = x0 + 4; x < x1 - 2; x += 8) g.palm(k, L(x), s * 7.5, 6 + g.rand() * 2);
      }
      g.scatter(x0, x1, 108, 145, 10, (x, z) => g.bush(k, L(x), Lz(z), 0.7 + g.rand() * 0.5));
    }
    // Bacchus (S7, S8's blue mark): in the first court beside the walk, facing back east toward the rear of the entrance
    bacchus(k, L(-547), Lz(133.7), k.ground(L(-547), Lz(133.7)), 0);

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
// found by its place, not its order in the list (a stair added at the top once handed this model another's)
const stair = stairsOf().find((s) => s.x0 === -372 && s.x1 === -464)!;
// (set back from the road loop at the end of the avenue, either side of the foot of the stairs: x -382 to -373; their
// gable roofs drawn in the extras)
const gateHouse = (z0: number, z1: number): Block => ({ x0: -382 - A[0], x1: -373 - A[0], z0: z0 - A[1], z1: z1 - A[1], floors: 1, roof: 'none' });
const GATE_HOUSES: [number, number][] = [[106.5, 116], [140, 149.5]];
const approach: Spec = {
  name: 'Commonwealth Hall stairway',
  axis: [1, 0], origin: A, storey: 3.2, style: CW_WIN, roofColor: '#7d4f3e', fascia: '#4e3b30', pitch: 0.45,
  onGround: true,
  replaces: [[-452.4, 131.5]],
  blocks: GATE_HOUSES.map(([a, b]) => gateHouse(a, b)),
  keep: [[-464 - A[0], -360 - A[0], -14, 14], [-490 - A[0], -464 - A[0], -22, 22], [-383 - A[0], -363 - A[0], -23, 23]],
  extras: (k) => {
    g.reseed(11);
    const X = (x: number) => x - A[0], Z = (z: number) => z - A[1];
    g.clear.push([-492, -360, 112, 144], [-384, -361, 104, 152]);
    // the stairway (relief.ts, pair 2): the street steps, the level landing through the gateway, then flights with level
    // walks between them, each step and landing a solid block down into the hill
    drawStair(k, stair, X, Z, ['#d8cbb5', '#cfc1aa'], '#c9b9a0', '#a99a82');
    const dir = Math.sign(stair.x1 - stair.x0);
    // stone walls along both sides, stepping with the stairs over the slope beside them
    for (let x = stair.x0; dir * (stair.x1 - x) > 0; x += dir * 1) {
      const xm = x + dir * 0.5, hs = Math.max(stair.at(x), stair.at(x + dir * 0.99));
      for (const [zw, zo] of [[stair.z0, stair.z0 - 1.2], [stair.z1, stair.z1 + 1.2]]) {
        const ho = groundHeight(xm, zo), lo = Math.min(hs, ho) - 0.6, hi = Math.max(hs, ho) + 0.7;
        k.plain.push([box(X(x), X(x + dir * 1.01), lo, hi, Z(zw) - 0.35, Z(zw) + 0.35), (Math.floor(x) & 1) ? STONE : STONE_DARK]);
      }
    }
    // pools either side of the walk on the second landing (owner photo), palms beside each landing above the gateway
    const lands = stair.segs.filter((q) => q.landing);
    {
      const L1 = lands[1], l0 = stair.x0 + dir * (L1.u0 + 1.5), l1 = stair.x0 + dir * (L1.u1 - 1.5), lh = L1.h;
      for (const [pz0, pz1] of [[stair.z0 + 1.5, 124.6], [131.4, stair.z1 - 1.5]]) {
        k.plain.push([box(Math.min(X(l0), X(l1)), Math.max(X(l0), X(l1)), lh, lh + 0.4, Z(pz0), Z(pz1)), '#c08a6a']);
        k.plain.push([box(Math.min(X(l0), X(l1)) + 0.3, Math.max(X(l0), X(l1)) - 0.3, lh + 0.3, lh + 0.33, Z(pz0) + 0.3, Z(pz1) - 0.3), '#4f9cb8']);
      }
    }
    for (const q of lands.slice(1)) {
      const x = stair.x0 + dir * (q.u0 + 2);
      for (const z of [stair.z0 - 3, stair.z1 + 3]) g.palm(k, X(x), Z(z), 6.5 + g.rand() * 2);
    }
    // the gateway (pair 2): white piers either side of the opening at the road and at the back of the landing, short
    // white walls joining them along it; the gate houses' aged gable roofs, their ends toward the road
    for (const [za, zb] of [[116.3, 117.7], [138.3, 139.7]]) for (const xp of [-374.2, -381.2]) {
      const py = k.ground(X(xp), Z((za + zb) / 2));
      k.plain.push([box(X(xp), X(xp + 1.3), py - 0.3, py + 3.1, Z(za), Z(zb)), WHITE]);
      k.plain.push([box(X(xp) - 0.12, X(xp + 1.3) + 0.12, py + 3.1, py + 3.32, Z(za) - 0.12, Z(zb) + 0.12), '#e9e4d8']);
      SOLIDS.add(xp + 0.65, (za + zb) / 2, 0.75);
    }
    for (const zc of [117.0, 139.0]) {
      const wy = k.ground(X(-377.6), Z(zc));
      k.plain.push([box(X(-380.0), X(-374.2), wy - 0.3, wy + 1.15, Z(zc) - 0.2, Z(zc) + 0.2), '#efebe3']);
      k.plain.push([box(X(-380.0), X(-374.2), wy + 1.15, wy + 1.25, Z(zc) - 0.26, Z(zc) + 0.26), '#d8d2c6']);
      wallSolids(-380, zc, -374.2, zc, 0.3);
    }
    k.roof.c = new THREE.Color('#7d4f3e');
    for (const [z0, z1] of GATE_HOUSES) {
      const x0 = X(-382), x1 = X(-373), y = baseOf(k, x0, x1, Z(z0), Z(z1)), e = y + k.wallTop(1);
      gableX(k, x0 - 0.7, x1 + 0.7, Z(z0) - 0.7, Z(z1) + 0.7, e - 0.3, 0.45);
      k.plain.push([flat([[Z(z0) - 0.2, e - 0.3], [Z(z1) + 0.2, e - 0.3], [(Z(z0) + Z(z1)) / 2, e - 0.3 + ((z1 - z0) / 2 + 0.2) * 0.45]], 0).rotateY(-Math.PI / 2).translate(x0 - 0.2, 0, 0), WHITE]);
      // weathering streaks on the old tiles, a stone-faced plinth round the walls
      for (let i = 0; i < 5; i++) k.plain.push([box(x0 + 0.5 + i * 1.8, x0 + 1.1 + i * 1.8, e + 0.15, e + 0.2, Z(z0) - 0.4, Z(z1) + 0.4), '#5e3d31']);
      k.plain.push([box(x0 - 0.06, x1 + 0.06, y - 0.4, y + 0.55, Z(z0) - 0.06, Z(z1) + 0.06), STONE_DARK]);
    }
    k.roof.c = new THREE.Color(ROOF);
    // the stone arches below the forecourt at the top of the stairs (owner photos): the walk passes north of them
    const ax0 = X(-457), ax1 = X(-448), az0 = Z(124), az1 = Z(stair.z1), aTop = stair.top;
    k.plain.push([box(ax0, ax1, stair.at(-448) - 1, aTop + 1.0, az0, az1), STONE]);
    k.plain.push([box(ax0, ax1 + 0.1, aTop + 0.9, aTop + 1.1, az0 - 0.1, az1 + 0.1), '#b8a88e']);
    for (const zc of [-1.8, 3, 7.8]) {
      const y0 = stair.at(-448) + 0.1;
      k.plain.push([box(ax1, ax1 + 0.04, y0, y0 + 2.2, zc - 1.1, zc + 1.1), '#3a3129']);
      k.plain.push([new THREE.CircleGeometry(1.1, 12, 0, Math.PI).rotateY(Math.PI / 2).translate(ax1 + 0.04, y0 + 2.2, zc), '#3a3129']);
    }
    // the forecourt (pairs 1 and 3): asphalt parking from the foot of the entrance's steps to the drive, aged stone paving
    // from the drive to the top of the stairway; no painted circle (laid on the ground, a little behind the roads in
    // depth so the drive across it stays on top; owner: the road was covered by the red)
    const fy = k.ground(X(-478), 0);
    // the roads and footpaths across it, which the paving goes under
    const ways: [number, number, number, number, number][] = [];
    for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++) {
      const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
      if (Math.max(ax, bx) < -500 || Math.min(ax, bx) > -450 || Math.max(az, bz) < 95 || Math.min(az, bz) > 160) continue;
      ways.push([ax, az, bx, bz, [9, 7.4, 6.2, 4.6, 2.6][r.cls] / 2 + 0.4]);
    }
    const underWay = (wx: number, wz: number) => ways.some(([ax, az, bx, bz, h]) => {
      const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((wx - ax) * dx + (wz - az) * dz) / (dx * dx + dz * dz || 1)));
      return Math.hypot(wx - ax - dx * t, wz - az - dz * t) < h;
    });
    const onGround = (geo: THREE.BufferGeometry, color: string, lift: number, layer: number) => {
      const p = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) p.setY(i, k.ground(p.getX(i), p.getZ(i)) + (underWay(...k.world(p.getX(i), p.getZ(i))) ? -0.25 : lift));
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -layer, polygonOffsetUnits: -layer * 2 }));
      m.receiveShadow = true;
      k.meshes.push(m);
    };
    const plane = (x0: number, x1: number, z0: number, z1: number) => new THREE.PlaneGeometry(X(x1) - X(x0), Z(z1) - Z(z0), Math.ceil((x1 - x0) * 1.5), Math.ceil((z1 - z0) / 1.5)).rotateX(-Math.PI / 2).translate((X(x0) + X(x1)) / 2, 0, (Z(z0) + Z(z1)) / 2);
    onGround(plane(-488.2, -475, 108, 148), '#55575a', 0.025, 1);
    onGround(plane(-475, -464, 108, 148), '#ad9f8b', 0.025, 1);
    // the parking bays' lines, a few cars nosed in toward the steps (comparison props, the walk to the steps left free)
    for (let z = 111.4; z < 145; z += 2.75) if (z < 123 || z > 133) onGround(plane(-484, -479.2, z - 0.06, z + 0.06), '#e8e6df', 0.03, 2);
    const cols = ['#1f4f9a', '#9aa1a8', '#e9e9ea', '#1b1d22', '#7a1e1e', '#c9c4b8'];
    [112.8, 115.5, 120.9, 135.3, 138.0, 143.5].forEach((z, i) => car(k, X(-481.7), Z(z), cols[i], k.ground(X(-481.7), Z(z)), Math.PI / 2));
    // the hall crest on its stone plinth, front left of the steps (pair 3), low planting round it
    {
      const cx = X(-486.0), cz = Z(137.6), cy = k.ground(cx, cz);
      k.plain.push([box(cx - 0.8, cx + 0.8, cy - 0.2, cy + 1.2, cz - 0.8, cz + 0.8), STONE]);
      k.plain.push([box(cx - 0.9, cx + 0.9, cy + 1.2, cy + 1.32, cz - 0.9, cz + 0.9), '#b8a88e']);
      k.plain.push([box(cx + 0.82, cx + 0.86, cy + 1.35, cy + 2.6, cz - 0.6, cz + 0.6), '#7a2430']);
      k.plain.push([box(cx - 0.2, cx + 0.82, cy + 1.32, cy + 2.7, cz - 0.7, cz + 0.7), '#8c7d68']);
      SOLIDS.add(-486.0, 137.6, 1.1);
      for (const dz of [-1.6, 1.4]) g.bush(k, cx - 0.4, cz + dz, 0.55);
    }
    // palms and shade trees at the parking's ends (pair 3)
    for (const z of [109.6, 146.6]) g.palm(k, X(-485.6), Z(z), 7.5 + g.rand());
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
