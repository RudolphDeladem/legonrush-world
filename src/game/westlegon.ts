// West of Legon Hall, south of Commonwealth Hall: the Language Centre and the buildings round it, and the zone of
// ground-floor houses behind them (owner's photos and marked aerial; block engine: blocks.ts).
//
// - The Department of Modern Languages: four floors, a cross of hipped red roofs with a glass lantern where they
//   meet, a glazed bay of tall columns and a car-port canopy on the east, toward its car park.
// - The Confucius Institute south of it: a long block of three floors under a weathered dark sheet roof.
// - South again, the building the map calls the Legon Hall barbeque joint: two floors, a red hipped roof with solar
//   panels, an arcade at its west end and a porch under a small dark-red gable on the south.
// - The Language Centre, north-east: two floors under orange tiles, a small raised roof over the middle.
// - Behind them to the west (circled white on the owner's aerial): ground-floor bungalows built round small
//   courtyards, and their small outbuildings, under red tiles; each house has one door, on the side toward the road.
import * as THREE from 'three';
import { WHITE, box } from './modelkit';
import { PL, createSite, render, window_, type Block, type Kit, type Spec, type Style } from './blocks';
import { rectsOf } from './rectilinear';

const WALL: Style = {
  bay: 3.2, up: [[86, 60, 84, 110]], ground: [[86, 256 + 66, 84, 110]],
  draw: (g) => { render(g, '#f4f3ee'); window_(g, [86, 60, 84, 110], '#e2e2dc', 2, 0.3); window_(g, [86, 256 + 66, 84, 110], '#e2e2dc', 2, 0.3); g.fillStyle = '#9b3b30'; g.fillRect(0, 512 - 20, 256, 20); },
};
/** narrow windows in pairs, louvred (the Confucius Institute's long block) */
const LONG_WALL: Style = {
  bay: 2.6, up: [[40, 70, 70, 80], [146, 70, 70, 80]], ground: [[40, 256 + 70, 70, 80], [146, 256 + 70, 70, 80]],
  draw: (g) => {
    render(g, '#f2f1ec');
    for (const y0 of [0, 256]) for (const x of [40, 146]) { g.fillStyle = '#2a3038'; g.fillRect(x, y0 + 70, 70, 80); g.fillStyle = 'rgba(200,200,190,0.35)'; for (let y = y0 + 74; y < y0 + 150; y += 8) g.fillRect(x, y, 70, 2); }
    g.fillStyle = '#9b3b30'; g.fillRect(0, 512 - 22, 256, 22);
  },
};
const HOUSE_WALL: Style = {
  bay: 3.4, up: [], ground: [[90, 256 + 70, 76, 100]],
  draw: (g) => { render(g, '#f1ede3'); window_(g, [90, 256 + 70, 76, 100], '#d8d2c4', 2, 0.3); g.fillStyle = '#8f7a63'; g.fillRect(0, 512 - 18, 256, 18); },
};
const rect = (r: number[], o: [number, number], floors: number, more: Partial<Block> = {}): Block => ({ x0: r[0] - o[0], x1: r[1] - o[0], z0: r[2] - o[1], z1: r[3] - o[1], floors, ...more });

// ---------- the Department of Modern Languages: x -323.9..-284.1, z 239.4..277.8 ----------
const ML = [-323.9, -284.1, 239.4, 277.8];
const MLO: [number, number] = [(ML[0] + ML[1]) / 2, (ML[2] + ML[3]) / 2];
const modernLanguages: Spec = {
  name: 'Modern language department',
  axis: [1, 0], origin: MLO, storey: 3.4, style: WALL, roofColor: '#b8473f', fascia: '#f4f3ee', pitch: 0.42,
  replaces: [MLO],
  // a cross of hipped roofs: a bar each way through the middle, and the four corners a floor lower under their own hips
  blocks: [
    rect([ML[0], ML[1], ML[2] + 9, ML[3] - 9], MLO, 4),
    rect([ML[0] + 9, ML[1] - 9, ML[2], ML[3]], MLO, 4),
    rect([ML[0], ML[0] + 9, ML[2], ML[2] + 9], MLO, 3), rect([ML[1] - 9, ML[1], ML[2], ML[2] + 9], MLO, 3),
    rect([ML[0], ML[0] + 9, ML[3] - 9, ML[3]], MLO, 3), rect([ML[1] - 9, ML[1], ML[3] - 9, ML[3]], MLO, 3),
  ],
  keep: [[ML[1] - MLO[0], ML[1] - MLO[0] + 9, -8, 8]],
  extras: (k: Kit) => {
    const e = k.wallTop(4), hx = (ML[1] - ML[0]) / 2;
    // the glass lantern where the roofs cross: a frame of white posts round glass, under a glass pyramid
    const L = 4.2, top = e + 0.42 * ((ML[3] - ML[2] - 18) / 2 + 0.8) + 0.2;
    for (const [x, z] of [[-L, -L], [L, -L], [-L, L], [L, L]]) k.plain.push([box(x - 0.15, x + 0.15, e, top + 2.6, z - 0.15, z + 0.15), WHITE]);
    k.plain.push([box(-L - 0.2, L + 0.2, top + 2.5, top + 2.75, -L - 0.2, L + 0.2), WHITE]);
    // clear glass reads pale from outside: light panels between the posts, mullions, and a pale glass pyramid
    for (const [a, b, c, d] of [[-L, L, -L - 0.03, -L + 0.03], [-L, L, L - 0.03, L + 0.03], [-L - 0.03, -L + 0.03, -L, L], [L - 0.03, L + 0.03, -L, L]]) k.plain.push([box(a, b, top - 0.4, top + 2.5, c, d), '#cfdde3']);
    for (const t of [-L / 2, 0, L / 2]) for (const [x, z] of [[t, -L - 0.06], [t, L + 0.06], [-L - 0.06, t], [L + 0.06, t]]) k.plain.push([box(x - 0.06, x + 0.06, top - 0.4, top + 2.5, z - 0.06, z + 0.06), WHITE]);
    k.plain.push([new THREE.ConeGeometry(L * 1.42, 2.2, 4).rotateY(Math.PI / 4).translate(0, top + 2.75 + 1.1, 0), '#dbe6ea']);
    // the east front: a glazed bay between tall columns, and the car-port canopy at its foot
    for (const z of [-6, -2, 2, 6]) k.plain.push([new THREE.CylinderGeometry(0.35, 0.35, e - 0.2, 12).translate(hx + 0.6, (e - 0.2) / 2, z), WHITE]);
    k.glass.push(box(hx, hx + 0.08, PL, e - 1, -7, 7));
    k.plain.push([box(hx, hx + 9, 3.6, 3.95, -7.5, 7.5), '#e9e8e3']);
    for (const z of [-7, 7]) k.plain.push([box(hx + 8.5, hx + 8.9, 0, 3.6, z - 0.2, z + 0.2), '#e9e8e3']);
    k.plain.push([box(hx, hx + 9, 0, 0.12, -7.5, 7.5), '#cfcac0']);
  },
};

// ---------- the Confucius Institute: x -312.5..-271.6, z 296.8..313.5 ----------
const CI = [-312.5, -271.6, 296.9, 313.4];
const CIO: [number, number] = [(CI[0] + CI[1]) / 2, (CI[2] + CI[3]) / 2];
const confucius: Spec = {
  name: 'Confusious Institute',
  axis: [1, 0], origin: CIO, storey: 3.3, style: LONG_WALL, roofColor: '#57544c', fascia: '#e9e8e2', pitch: 0.3,
  replaces: [CIO],
  blocks: [rect(CI, CIO, 3)],
  keep: [[CI[1] - CIO[0], CI[1] - CIO[0] + 3, -3, 3]],
  extras: (k: Kit) => {
    // its door at the east end, toward the road
    const x = CI[1] - CIO[0];
    k.plain.push([box(x, x + 0.06, PL, PL + 2.4, -1.1, 1.1), '#3a4652']);
    k.plain.push([box(x, x + 2.2, 2.9, 3.15, -1.8, 1.8), '#e9e8e2']);
    k.plain.push([box(x, x + 2.2, 0, 0.15, -1.8, 1.8), '#cfcac0']);
    k.signs.push({ text: 'CONFUCIUS INSTITUTE', x: x + 0.07, y: 3.6, z: 0, ry: Math.PI / 2, w: 5, colors: ['#b8262b', '#f6e7b0'] });
  },
};

// ---------- the solar-roofed building ('Legon hall barbeque joint' on the map): x -309.4..-271.5, z 336.1..351.3 ----------
const BQ = [-309.4, -271.5, 336.2, 351.2];
const BQO: [number, number] = [(BQ[0] + BQ[1]) / 2, (BQ[2] + BQ[3]) / 2];
const BQ_PITCH = 0.42;
const barbeque: Spec = {
  name: 'Legon hall barbeque joint',
  axis: [1, 0], origin: BQO, storey: 3.4, style: WALL, roofColor: '#b8473f', fascia: '#f4f3ee', pitch: BQ_PITCH,
  replaces: [BQO],
  blocks: [rect(BQ, BQO, 2)],
  keep: [[BQ[1] - BQO[0] - 9, BQ[1] - BQO[0] - 2, BQ[3] - BQO[1], BQ[3] - BQO[1] + 4]],
  extras: (k: Kit) => {
    const e = k.wallTop(2), hz = (BQ[3] - BQ[2]) / 2 + 0.8, ang = Math.atan(BQ_PITCH);
    // solar panels on both long slopes, tilted with the roof
    for (const s of [-1, 1]) for (const x of [-11, -3, 5]) {
      const run = hz * 0.55;
      k.plain.push([new THREE.BoxGeometry(6.5, 0.08, run / Math.cos(ang)).rotateX(-s * ang).translate(x, e + run / 2 * BQ_PITCH + 0.12 + hz * 0.15 * BQ_PITCH, s * (hz - hz * 0.15 - run / 2)), '#2c3a55']);
    }
    // the porch on the south face near the east end, under a small dark-red gable
    const px = BQ[1] - BQO[0] - 5.5, pz = BQ[3] - BQO[1];
    k.plain.push([box(px - 1.3, px + 1.3, PL, PL + 2.4, pz, pz + 0.06), '#3a4652']);
    for (const s of [-1, 1]) {
      k.plain.push([box(px + s * 1.7 - 0.15, px + s * 1.7 + 0.15, 0, 3.1, pz + 2.6, pz + 2.9), WHITE]);
      k.plain.push([new THREE.BoxGeometry(2.2, 0.1, 3.3).rotateZ(-s * 0.55).translate(px + s * 0.95, 3.6, pz + 1.6), '#6e2a26']);
    }
    k.plain.push([box(px - 2.2, px + 2.2, 0, 0.18, pz, pz + 3.2), '#cfcac0']);
    // the arcade at the west end of the ground floor
    const wx = BQ[0] - BQO[0];
    for (const x of [wx + 1, wx + 4, wx + 7]) k.plain.push([box(x - 0.2, x + 0.2, 0, 3.4, pz - 0.2, pz + 0.2), WHITE]);
  },
};

// ---------- the Language Centre: x -275..-258.3, z 197.9..229.8 ----------
const LC = [-275, -258.3, 197.9, 229.8];
const LCO: [number, number] = [(LC[0] + LC[1]) / 2, (LC[2] + LC[3]) / 2];
const languageCentre: Spec = {
  name: 'Language Center',
  axis: [1, 0], origin: LCO, storey: 3.4, style: WALL, roofColor: '#c4683a', fascia: '#f4f3ee', pitch: 0.42,
  replaces: [LCO],
  blocks: [rect(LC, LCO, 2)],
  keep: [[LC[1] - LCO[0], LC[1] - LCO[0] + 3, -3, 3]],
  extras: (k: Kit) => {
    const e = k.wallTop(2);
    // the small raised roof over the middle of the ridge
    k.plain.push([box(-2, 2, e + 2.2, e + 4.2, -2.5, 2.5), WHITE]);
    k.plain.push([new THREE.ConeGeometry(3.6, 1.4, 4).rotateY(Math.PI / 4).scale(1, 1, 1.2).translate(0, e + 4.9, 0), '#c4683a']);
    // its door on the east face, toward the road
    const x = LC[1] - LCO[0];
    k.plain.push([box(x, x + 0.06, PL, PL + 2.4, -1.1, 1.1), '#3a4652']);
    k.plain.push([box(x, x + 2, 2.9, 3.15, -1.8, 1.8), '#f4f3ee']);
    k.plain.push([box(x, x + 2, 0, 0.15, -1.8, 1.8), '#cfcac0']);
    k.signs.push({ text: 'LANGUAGE CENTRE', x: x + 0.07, y: 3.55, z: 0, ry: Math.PI / 2, w: 4, colors: ['#1f3a93', '#ffffff'] });
  },
};

// ---------- the ground-floor bungalows and their outbuildings (owner: circled white) ----------
interface House { id: string; shed: boolean; ring: [number, number][]; door: [number, number]; out: [number, number] }
const HOUSES: House[] = [
  { id: '492729612', shed: false, ring: [[-354.3, 243.9],[-338.6, 252.3],[-341.5, 257.7],[-337.4, 259.9],[-344.1, 272.3],[-348.2, 270.1],[-351.5, 276.3],[-367.0, 268.1],[-363.6, 261.7],[-351.6, 268.1],[-344.6, 254.9],[-356.7, 248.5]], door: [-365.3, 264.9], out: [-0.882, -0.472] }, // Career and councelling dept
  { id: '492729613', shed: false, ring: [[-472.1, 501.4],[-466.4, 518.1],[-472.3, 520.1],[-470.9, 524.5],[-484.3, 528.9],[-485.8, 524.5],[-492.5, 526.8],[-498.1, 510.2],[-491.1, 507.9],[-486.9, 520.7],[-472.6, 516.0],[-477.0, 503.0]], door: [-477.6, 526.7], out: [0.314, 0.949] },
  { id: '492729614', shed: false, ring: [[-339.2, 407.9],[-323.7, 416.5],[-326.7, 421.9],[-322.6, 424.2],[-329.6, 436.5],[-333.6, 434.2],[-337.1, 440.3],[-352.4, 431.8],[-348.8, 425.5],[-337.0, 432.1],[-329.7, 419.1],[-341.7, 412.4]], door: [-326.1, 430.3], out: [0.872, 0.49] },
  { id: '492729619', shed: false, ring: [[-453.3, 412.1],[-444.9, 427.7],[-450.4, 430.6],[-448.2, 434.6],[-460.7, 441.3],[-462.9, 437.2],[-469.1, 440.5],[-477.4, 425.1],[-471.0, 421.7],[-464.6, 433.6],[-451.3, 426.6],[-457.8, 414.5]], door: [-455.6, 413.3], out: [-0.47, -0.882] },
  { id: '492729625', shed: false, ring: [[-435.9, 271.7],[-424.2, 285.0],[-428.8, 289.1],[-425.8, 292.5],[-436.4, 301.8],[-439.5, 298.4],[-444.8, 303.0],[-456.4, 289.9],[-450.9, 285.1],[-442.0, 295.2],[-430.7, 285.4],[-439.8, 275.1]], door: [-437.8, 273.4], out: [-0.658, -0.753] },
  { id: '492729632', shed: false, ring: [[-459.6, 335.9],[-449.2, 350.2],[-454.2, 353.9],[-451.5, 357.6],[-462.9, 365.9],[-465.7, 362.1],[-471.4, 366.2],[-481.7, 352.1],[-475.8, 347.9],[-467.8, 358.8],[-455.7, 350.0],[-463.8, 338.9]], door: [-476.5, 359.2], out: [-0.807, 0.59] },
  { id: '492729633', shed: false, ring: [[-390.9, 461.8],[-381.3, 476.6],[-386.5, 479.9],[-384.0, 483.8],[-395.9, 491.5],[-398.4, 487.6],[-404.3, 491.4],[-413.9, 476.8],[-407.7, 472.8],[-400.4, 484.1],[-387.8, 476.0],[-395.3, 464.5]], door: [-389.9, 487.6], out: [0.541, 0.841] },
  { id: '492729636', shed: false, ring: [[-273.9, 424.6],[-273.9, 442.3],[-267.7, 442.3],[-267.7, 446.9],[-253.5, 446.9],[-253.5, 442.3],[-246.5, 442.3],[-246.4, 424.9],[-253.7, 424.9],[-253.8, 438.3],[-268.8, 438.3],[-268.7, 424.6]], door: [-271.3, 424.6], out: [0.002, -1.0] },
  { id: '492729639', shed: false, ring: [[-385.9, 370.9],[-378.4, 386.9],[-384.1, 389.5],[-382.1, 393.7],[-395.0, 399.6],[-396.9, 395.4],[-403.3, 398.4],[-410.7, 382.5],[-404.1, 379.5],[-398.4, 391.7],[-384.8, 385.4],[-390.6, 373.0]], door: [-407.4, 381.0], out: [-0.419, -0.908] },
  { id: '492729855', shed: false, ring: [[-259.2, 497.7],[-248.4, 498.6],[-250.2, 519.5],[-261.1, 518.6],[-261.4, 522.2],[-270.8, 521.4],[-270.0, 512.1],[-260.5, 512.9]], door: [-270.4, 516.8], out: [-0.996, -0.086] },
  { id: '492729708', shed: true, ring: [[-379.8, 368.5],[-377.9, 372.8],[-382.2, 374.8],[-384.2, 370.5]], door: [-382.0, 369.5], out: [-0.403, -0.915] },
  { id: '492729710', shed: true, ring: [[-321.1, 497.9],[-318.3, 501.7],[-322.1, 504.5],[-324.9, 500.7]], door: [-323.0, 499.3], out: [-0.591, -0.807] },
  { id: '492729716', shed: true, ring: [[-385.2, 458.6],[-382.7, 462.6],[-386.7, 465.1],[-389.2, 461.1]], door: [-384.7, 463.9], out: [0.527, 0.85] },
  { id: '492729726', shed: true, ring: [[-465.7, 499.8],[-464.3, 504.3],[-468.8, 505.7],[-470.3, 501.2]], door: [-466.6, 505.0], out: [0.298, 0.955] },
  { id: '492729732', shed: true, ring: [[-447.3, 409.4],[-445.2, 413.6],[-449.4, 415.8],[-451.5, 411.6]], door: [-449.4, 410.5], out: [-0.452, -0.892] },
  { id: '492729763', shed: true, ring: [[-335.6, 402.5],[-331.5, 404.9],[-333.9, 408.9],[-338.0, 406.6]], door: [-333.6, 403.7], out: [0.5, -0.866] },
  { id: '492729789', shed: true, ring: [[-272.4, 487.4],[-259.8, 488.3],[-260.7, 500.9],[-273.3, 500.0]], door: [-272.8, 493.7], out: [-0.997, -0.071] },
  { id: '492729792', shed: true, ring: [[-430.7, 267.8],[-427.6, 271.4],[-431.3, 274.4],[-434.3, 270.8]], door: [-429.2, 269.6], out: [0.759, -0.651] },
  { id: '492729799', shed: true, ring: [[-453.3, 332.9],[-450.6, 336.8],[-454.5, 339.5],[-457.2, 335.6]], door: [-455.8, 337.6], out: [-0.818, 0.575] },
  { id: '492729800', shed: true, ring: [[-280.4, 425.1],[-280.3, 429.8],[-275.6, 429.7],[-275.7, 425.0]], door: [-280.4, 427.4], out: [-1.0, 0.016] },
];
function bungalow(h: House): Spec {
  const n = h.ring.length;
  let cx = 0, cz = 0;
  for (const [x, z] of h.ring) { cx += x / n; cz += z / n; }
  // the house's own square: the direction of its longest side, folded into a quarter turn
  let best = 0, ang = 0;
  for (let i = 0; i < n; i++) {
    const [ax, az] = h.ring[i], [bx, bz] = h.ring[(i + 1) % n], l = Math.hypot(bx - ax, bz - az);
    if (l > best) { best = l; ang = Math.atan2(bz - az, bx - ax); }
  }
  ang = ((ang % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
  const ux = Math.cos(ang), uz = Math.sin(ang);
  const loc = (x: number, z: number): [number, number] => [(x - cx) * ux + (z - cz) * uz, -(x - cx) * uz + (z - cz) * ux];
  const blocks: Block[] = rectsOf(h.ring.map(([x, z]) => loc(x, z)), 0.9, 1.2).map(([x0, x1, z0, z1]) => ({ x0, x1, z0, z1, floors: 1 }));
  const [dx, dz] = loc(...h.door);
  const [ox, oz] = [h.out[0] * ux + h.out[1] * uz, -h.out[0] * uz + h.out[1] * ux];
  const face = Math.atan2(ox, oz);
  const b0 = blocks[0];
  return {
    name: `house ${h.id}`,
    axis: [ux, uz], origin: [cx, cz], storey: h.shed ? 2.8 : 3.2, style: HOUSE_WALL, roofColor: h.shed ? '#a5543b' : '#b24c3a', fascia: '#efebe1', pitch: 0.45,
    replaces: [[cx + ((b0.x0 + b0.x1) / 2) * ux - ((b0.z0 + b0.z1) / 2) * uz, cz + ((b0.x0 + b0.x1) / 2) * uz + ((b0.z0 + b0.z1) / 2) * ux]],
    blocks,
    keep: [[dx - 1.5 + ox * 1.2, dx + 1.5 + ox * 1.2, dz - 1.5 + oz * 1.2, dz + 1.5 + oz * 1.2]],
    onGround: true,
    extras: (k: Kit) => {
      // one door, on the side toward the road: a panelled door, a step and a little canopy over it
      const g = Math.min(...blocks.map((b) => Math.min(k.ground(b.x0, b.z0), k.ground(b.x1, b.z0), k.ground(b.x0, b.z1), k.ground(b.x1, b.z1))));
      const at = (geo: THREE.BufferGeometry, off: number, y: number) => geo.rotateY(face).translate(dx + ox * off, g + y, dz + oz * off);
      k.plain.push([at(new THREE.BoxGeometry(1.0, 2.1, 0.08), 0.04, PL + 1.05), '#6b4a33']);
      k.plain.push([at(new THREE.BoxGeometry(1.8, 0.2, 1.1), 0.55, 0.1), '#cfc8bb']);
      if (!h.shed) k.plain.push([at(new THREE.BoxGeometry(2.0, 0.1, 1.2), 0.6, 2.75), '#b24c3a']);
    },
  };
}

/** the Language Centre and its neighbours, and the bungalows behind them */
export const westLegon = createSite('westlegon', [modernLanguages, confucius, barbeque, languageCentre, ...HOUSES.map(bungalow)]);
