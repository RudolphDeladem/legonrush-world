// ISSER, the RIPS building and the Department of Computer Science, from the owner's four photos (block engine:
// blocks.ts). One connected range north of the Mathematics and Statistics departments, not three separate
// buildings: the outlines are reshaped to Google Open Buildings' roofs, which meet (corrections.json).
//
// - ISSER (the Institute of Statistical, Social and Economic Research), west: a long bar of three floors in fresh
//   white paint. Its front faces the Mathematics department across the drive: brown louvred windows deep-set
//   between projecting piers, a deep ledge along the first floor and a band along the second, air-conditioner
//   units on the ledges. The entrance (marked blue) is east of the middle at the head of the drive: glazed doors
//   up three steps under a canopy with the institute's name on its fascia. At the back the ground floor is set
//   in behind columns, the floors above standing over it, and a stair tower faced with lattice blocks stands out
//   toward the car park.
// - The RIPS building east of it, joined to it: three floors with galleries on solid parapets toward the drive.
// - Computer Science, east again, joined by a link: old white paint washed grey and peeling. A tall wing runs
//   north-south: its south end, the front in the owner's first photo, has barred windows on the ground floor, a
//   long window band with curtains on the first and a blank stained wall above, louvred vents between piers on its
//   sides and a small room on the roof with a dish. The department's door (marked blue) is on the wing's west
//   face, north of RIPS, toward the car park behind ISSER. East of the wing a stair tower behind tall vertical
//   fins and the long east block with balconies: solid parapets, windows behind them, air-conditioners. Before
//   it the diesel generator house (blue fascia, orange doors behind lattice grilles) and a car shed.
import * as THREE from 'three';
import { box, merge, speckle, type Part } from './modelkit';
import { PL, createSite, type Block, type Kit, type Spec, type Style } from './blocks';
import { aged, breeze, concrete, door, grille, pane, panel as panelAt, peeling, rails, wall } from './concrete';
import { garden } from './gardens';
import { letters } from './letters';
import { stairsOf } from './relief';
import { SOLIDS } from './solids';

const ST = 3.5;
const O: [number, number] = [335, -292];
const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(x0 - O[0], x1 - O[0], y0, y1, z0 - O[1], z1 - O[1]);
const blk = (x0: number, x1: number, z0: number, z1: number, floors: number, more: Partial<Block> = {}): Block =>
  ({ x0: x0 - O[0], x1: x1 - O[0], z0: z0 - O[1], z1: z1 - O[1], floors, roof: 'none', ...more });
const panel = (k: Kit, mat: THREE.Material, ax: number, az: number, bx: number, bz: number, y0: number, y1: number, tile: number, tileY = tile) => panelAt(O, k, mat, ax, az, bx, bz, y0, y1, tile, tileY);

const FRESH = '#f6f5f1', GREYED = '#e6e3da', WASHED = '#dcd8ce', STEP = '#b5ada0';

// ---------- facades ----------
/** both halves of a facade canvas drawn alike (blocks whose every storey looks the same) */
const both = (base: string, one: (g: CanvasRenderingContext2D, y0: number) => void) => (g: CanvasRenderingContext2D) => { wall(g, base); one(g, 0); one(g, 256); };
/** a louvred window in silver-grey aluminium: a frame round angled glass blades, deep-set in the white, dark behind */
function louvred(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(x - 6, y - 6, w + 12, h + 10);
  g.fillStyle = '#8e9398'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  g.fillStyle = '#3b4146'; g.fillRect(x, y, w, h);
  for (let s = y + 2; s < y + h - 2; s += 7) { g.fillStyle = '#b9bec3'; g.fillRect(x + 2, s, w - 4, 3); g.fillStyle = '#d4d8db'; g.fillRect(x + 2, s, w - 4, 1); }
  g.fillStyle = '#8e9398'; g.fillRect(x + w / 2 - 2, y, 4, h);
}
const ISS_UP: Style = {
  bay: 2.625, up: [[34, 64, 188, 112]], ground: [[34, 256 + 64, 188, 112]],
  draw: both(FRESH, (g, y0) => louvred(g, 34, y0 + 64, 188, 112)),
};
const ISS_GF: Style = {
  bay: 3.5, up: [[16, 50, 224, 140]], ground: [[16, 256 + 50, 224, 140]],
  draw: both(FRESH, (g, y0) => { louvred(g, 16, y0 + 50, 224, 140); g.fillStyle = 'rgba(120,118,110,0.25)'; g.fillRect(0, y0 + 236, 256, 20); }),
};
/** the back: plain white with dark two-pane windows */
const ISS_BACK: Style = {
  bay: 3.0, up: [[44, 70, 168, 100]], ground: [[44, 256 + 70, 168, 100]],
  draw: both(FRESH, (g, y0) => { pane(g, 44, y0 + 70, 168, 100, 2); g.fillStyle = '#ffffff'; g.fillRect(36, y0 + 172, 184, 6); }),
};
/** the ground floor at the back, in the shade under the floors above: grey render, louvred windows, doors */
const ISS_UNDER: Style = {
  bay: 4.0, up: [[30, 60, 120, 120]], ground: [[30, 256 + 60, 120, 120]],
  draw: both('#cfcdc6', (g, y0) => { louvred(g, 30, y0 + 60, 120, 120); door(g, 176, y0 + 40, 56, 206, '#3b3532'); }),
};
const ISS_END: Style = { bay: 4, up: [], ground: [], draw: (g) => { wall(g, FRESH); speckle(g, 0, 0, 256, 512, 300, ['rgba(150,150,140,0.2)']); } };
/** the stair tower: a panel of lattice blocks (small dark openings in a white grid) to a storey, a door below */
const ISS_TOWER: Style = {
  bay: 7.6, up: [[20, 30, 216, 170]], ground: [],
  draw: (g) => {
    wall(g, FRESH);
    for (const y0 of [0, 256]) for (let y = y0 + 34; y < y0 + 196; y += 14) for (let x = 24; x < 232; x += 12) { g.fillStyle = '#4b4d50'; g.fillRect(x, y, 8, 9); }
    g.fillStyle = FRESH; g.fillRect(0, 256 + 150, 256, 106);
    door(g, 100, 256 + 120, 56, 136, '#3b3532');
  },
};
/** RIPS behind its galleries: greyed white, dark doors and windows */
const RIPS_GAL: Style = {
  bay: 3.2, up: [[30, 50, 50, 190], [104, 60, 130, 110]], ground: [[30, 256 + 50, 50, 190], [104, 256 + 60, 130, 110]],
  draw: (g) => { wall(g, GREYED); for (const y0 of [0, 256]) { door(g, 30, y0 + 50, 50, 190, '#3a3634'); pane(g, 104, y0 + 60, 130, 110, 2); } aged(g, [176, 256 + 176, 240, 500]); },
};
const RIPS_WIN: Style = {
  bay: 3.2, up: [[40, 70, 176, 100]], ground: [[40, 256 + 70, 176, 100]],
  draw: (g) => { wall(g, GREYED); for (const y0 of [0, 256]) pane(g, 40, y0 + 70, 176, 100, 2); aged(g, [176, 256 + 176]); },
};
/** Computer Science, washed out and peeling: windows with white grilles over them */
function grilled(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  pane(g, x, y, w, h, 3);
  g.fillStyle = '#e9e7e1'; for (let gx = x + 8; gx < x + w; gx += 11) g.fillRect(gx, y, 3, h);
  g.fillRect(x, y + h / 2 - 2, w, 4);
}
const CS_WIN: Style = {
  bay: 3.2, up: [[36, 70, 184, 96]], ground: [[36, 256 + 70, 184, 96]],
  draw: (g) => { wall(g, WASHED); pane(g, 36, 70, 184, 96, 3); grilled(g, 36, 256 + 70, 184, 96); aged(g, [166, 256 + 166, 0, 256]); peeling(g, 14); },
};
/** the front of the tall wing: barred windows below, a long window band with curtains above */
const CS_FRONT: Style = {
  bay: 3.8, up: [[0, 70, 256, 96]], ground: [[30, 256 + 70, 196, 110]],
  draw: (g) => {
    wall(g, WASHED);
    g.fillStyle = '#3d3f40'; g.fillRect(0, 66, 256, 104);
    for (let x = 0; x < 256; x += 64) { g.fillStyle = ['#e8e1cf', '#d9d4c6', '#2e3236', '#e3dccb'][(x / 64) | 0]; g.fillRect(x + 4, 70, 58, 96); g.fillStyle = 'rgba(0,0,0,0.12)'; for (let f = x + 8; f < x + 60; f += 9) g.fillRect(f, 70, 3, 96); }
    g.fillStyle = '#efede7'; for (let x = 0; x <= 256; x += 64) g.fillRect(x - 3, 66, 6, 104);
    g.fillRect(0, 170, 256, 8);
    grilled(g, 30, 256 + 70, 196, 110);
    aged(g, [178, 256 + 182, 0, 256]); peeling(g, 22);
  },
};
/** the east block's east end toward the yard (the owner's science campus brief, pair 9): barred windows, small low
 *  openings, dark runoff stains under the solid bands */
const CS_EAST: Style = {
  bay: 3.0, up: [[70, 80, 116, 90]], ground: [[50, 256 + 60, 156, 110]],
  draw: (g) => {
    wall(g, WASHED);
    grilled(g, 70, 80, 116, 90); grilled(g, 50, 256 + 60, 156, 110);
    g.fillStyle = '#2b2c2d'; g.fillRect(96, 256 + 196, 64, 30); g.fillStyle = '#6b6d70'; for (let y = 256 + 200; y < 256 + 226; y += 7) g.fillRect(96, y, 64, 2);
    for (let i = 0; i < 7; i++) { const x = 8 + i * 36, gr = g.createLinearGradient(0, 0, 0, 200); gr.addColorStop(0, 'rgba(60,58,52,0.45)'); gr.addColorStop(1, 'rgba(60,58,52,0)'); g.fillStyle = gr; g.fillRect(x, 0, 5 + (i % 3) * 3, 200); }
    aged(g, [176, 256 + 176, 0, 256]); peeling(g, 18);
  },
};
const CS_BLANK: Style = { bay: 4, up: [], ground: [], draw: (g) => { wall(g, WASHED); g.fillStyle = 'rgba(120,118,108,0.4)'; g.fillRect(0, 120, 256, 5); g.fillRect(0, 376, 256, 5); aged(g, [0, 125, 256, 381]); aged(g, [60, 300]); peeling(g, 30); } };
/** the sides of the wing's south end: piers with dark louvred vents between them */
const CS_LOUVRE: Style = {
  bay: 1.6, up: [], ground: [],
  draw: both(WASHED, (g, y0) => {
    g.fillStyle = '#2f3134'; g.fillRect(70, y0 + 40, 140, 170);
    g.fillStyle = '#6b6d70'; for (let y = y0 + 44; y < y0 + 206; y += 9) g.fillRect(70, y, 140, 3);
    g.fillStyle = '#ece9e2'; g.fillRect(0, y0, 40, 256);
    aged(g, [y0 + 210]); peeling(g, 4);
  }),
};
/** the east block behind its balconies: windows with grilles */
const CS_GAL: Style = {
  bay: 3.2, up: [[30, 60, 196, 110]], ground: [[30, 256 + 60, 196, 110]],
  draw: (g) => { wall(g, WASHED); grilled(g, 30, 60, 196, 110); grilled(g, 30, 256 + 60, 196, 110); aged(g, [176, 256 + 176]); peeling(g, 10); },
};

// ---------- parts ----------
/** balconies on a south face from x0 to x1 (wall at zWall, edge at zEdge > zWall): slabs on the first and second
 *  floors and the roof, solid parapets, short fins dividing them into bays, air-conditioners on the walls */
function balconies(c: Part[], k: Kit, x0: number, x1: number, zWall: number, zEdge: number, col: string, fins = 6.4) {
  for (const f of [1, 2]) {
    const y = PL + f * ST;
    c.push([B(x0, x1, y - 0.3, y, zWall, zEdge), col], [B(x0, x1, y, y + 1.0, zEdge - 0.2, zEdge), col]);
  }
  c.push([B(x0, x1, PL + 3 * ST, PL + 3 * ST + 0.9, zWall, zEdge + 0.3), col]);
  for (let x = x0; x <= x1 + 0.01; x += fins) for (const f of [1, 2]) c.push([B(x - 0.12, x + 0.12, PL + f * ST + 1.0, PL + (f + 1) * ST - 0.3, zEdge - 0.6, zEdge), col]);
  for (let x = x0 + 1.6, i = 0; x < x1 - 1; x += 3.2, i++) for (const f of [1, 2]) if ((i + f) % 3) k.plain.push([B(x - 0.4, x + 0.4, PL + f * ST + 1.1, PL + f * ST + 1.65, zWall + 0.02, zWall + 0.32), '#e8e8e5']);
}

const SPEC: Spec = {
  name: 'ISSER, RIPS and Computer Science',
  axis: [1, 0], origin: O, storey: ST, style: CS_WIN, roofColor: '#c9c6bd', fascia: FRESH, pitch: 0.3,
  plinth: '#bdb9ad',
  replaces: [[290, -288], [330, -296], [372, -287], [355, -310]],
  blocks: [
    // ISSER: the ground floor (set back at the back) and the two floors above, standing over it
    blk(276.3, 318.3, -292.3, -283.3, 1, { faces: { z1: ISS_GF, z0: ISS_UNDER, x0: ISS_END, x1: ISS_END } }),
    blk(276.3, 318.3, -294.5, -283.3, 2, { y: ST, faces: { z1: ISS_UP, z0: ISS_BACK, x0: ISS_END, x1: ISS_END } }),
    blk(302.2, 310.2, -300.8, -294.5, 3, { faces: { z0: ISS_TOWER, x0: ISS_END, x1: ISS_END } }),
    // RIPS and the link to Computer Science
    blk(318.3, 344.7, -300.9, -292, 3, { faces: { z1: RIPS_GAL, z0: RIPS_WIN, x0: RIPS_WIN, x1: RIPS_WIN } }),
    blk(344.7, 350, -299, -293, 3, { faces: { z1: RIPS_WIN, z0: RIPS_WIN } }),
    // Computer Science: the tall wing, its south end (front), the room on its roof, the east block
    blk(349.6, 361.4, -320.1, -282.4, 3),
    blk(350, 361.4, -282.4, -277, 2, { faces: { z1: CS_FRONT, x0: CS_LOUVRE, x1: CS_LOUVRE } }),
    blk(350, 361.4, -282.4, -277, 1, { y: 2 * ST, faces: { z1: CS_BLANK, x0: CS_LOUVRE, x1: CS_LOUVRE } }),
    blk(352, 359.5, -292, -284.5, 1, { y: 3 * ST + 0.4, faces: { z1: CS_FRONT } }),
    blk(361.4, 393.8, -291.5, -282.4, 3, { faces: { z1: CS_GAL, x1: CS_EAST } }),
  ],
  keep: [
    [306 - O[0], 318.3 - O[0], -283.3 - O[1], -279 - O[1]],
    [361.2 - O[0], 393.8 - O[0], -282.4 - O[1], -273.8 - O[1]],
    [347.5 - O[0], 349.6 - O[0], -312 - O[1], -307 - O[1]],
    [276.3 - O[0], 318.3 - O[0], -294.6 - O[1], -292.3 - O[1]],
  ],
  extras: (k: Kit) => {
    const fresh: Part[] = [], old: Part[] = [], washed: Part[] = [];
    const top = PL + 3 * ST; // 10.9

    // --- ISSER ---
    // the first-floor ledge, the second-floor band and the roof with its parapet
    fresh.push([B(276.1, 318.5, ST - 0.05, ST + 0.45, -283.3, -282.45), FRESH], [B(276.1, 318.5, 2 * ST + 0.1, 2 * ST + 0.45, -283.3, -282.8), FRESH]);
    fresh.push([B(276.1, 318.5, top, top + 0.5, -294.7, -282.9), FRESH], [B(276.4, 318.2, top + 0.5, top + 0.52, -294.4, -283.2), '#cfcfca']);
    for (const [a, b, cc, d] of [[276.1, 318.5, -283.1, -282.9], [276.1, 318.5, -294.7, -294.5], [276.1, 276.3, -294.7, -282.9], [318.3, 318.5, -294.7, -282.9]]) fresh.push([B(a, b, top + 0.5, top + 1.0, cc, d), FRESH]);
    // projecting piers every three windows on the upper floors
    for (const i of [0, 3, 6, 9, 12, 15, 16]) { const x = Math.min(318.0, Math.max(276.6, 276.3 + i * 2.625)); fresh.push([B(x - 0.35, x + 0.35, ST + 0.45, top, -283.3, -282.7), FRESH]); }
    // air-conditioners on the ledges under the windows
    for (let i = 0; i < 16; i++) for (const f of [1, 2]) if ((i * 7 + f * 3) % 4 !== 0) {
      const x = 276.3 + (i + 0.5) * 2.625 + (f === 1 ? -0.4 : 0.4), y = f === 1 ? ST + 0.45 : 2 * ST + 0.45;
      if (x > 307 && x < 318 && f === 1) continue;
      k.plain.push([B(x - 0.42, x + 0.42, y, y + 0.58, -283.2, -282.9), '#ecebe7'], [B(x - 0.3, x + 0.3, y + 0.1, y + 0.48, -282.9, -282.88), '#9da0a3']);
    }
    // the entrance (owner's photo): a lobby set in under a canopy whose deep fascia carries the institute's name in
    // raised grey letters; glazed doors in silver frames and a side light on the left, the framed ISSER emblem and a
    // small blue sign on the white back wall, big potted plants, an air-conditioner on the floor; four wide tiled
    // steps with stainless rails, running on past the canopy to the left; on the right a raised step edged in
    // dark red with a steel railing; an EXIT sign on a post before the steps
    const L0 = 307.7, L1 = 317.3, lob = 0.75, zf = -283.3, zc = -280.7;
    k.plain.push([B(L0 + 0.6, L1 - 0.6, 0, ST + 0.05, zf, zf + 0.03), '#f4f3ef']);
    fresh.push([B(L0, L0 + 0.6, 0, ST + 0.05, zf, -281.2), FRESH], [B(L1 - 0.7, L1, 0, ST + 0.05, zf, -281.2), FRESH]);
    fresh.push([B(L0 - 0.1, L1 + 0.1, ST + 0.05, ST + 0.3, zf, zc), FRESH]);
    fresh.push([new THREE.BoxGeometry(L1 - L0 + 0.2, 0.8, 0.22).rotateX(-0.18).translate((L0 + L1) / 2 - O[0], ST + 0.5, zc + 0.02 - O[1]), FRESH]);
    letters(k, 'INSTITUTE OF STATISTICAL, SOCIAL AND ECONOMIC RESEARCH', (L0 + L1) / 2 - O[0], ST + 0.5, zc + 0.14 - O[1], 0, 0.26, 0.05, '#686d72', { wide: 0.58, gap: 0.28, stroke: 0.26 });
    k.plain.push([B(L0 + 0.4, L1 - 0.4, ST - 0.02, ST + 0.05, zf, zc - 0.1), '#e8e6e0']);
    for (const x of [L0 + 2.6, L1 - 3.0]) k.plain.push([B(x - 0.5, x + 0.5, ST - 0.04, ST - 0.01, -282.3, -282.1), '#f6f3e6']);
    // the lobby floor and the steps down to the drive, wider than the canopy to the left
    old.push([B(L0 + 0.6, L1 - 0.7, 0, lob, zf, -281.5), '#d8cbb3']);
    for (let i = 1; i <= 4; i++) old.push([B(L0 - 1.2, L1 - 0.7, 0, lob - (lob / 4) * i + lob / 4, -281.5 + 0.32 * (i - 1), -281.5 + 0.32 * i), i % 2 ? '#d3c5ac' : '#cdbfa5']);
    // glazed doors in silver frames and a side light
    const D0 = L0 + 0.9, D1 = D0 + 2.3;
    k.plain.push([B(D0 - 0.08, D1 + 0.75, lob, lob + 2.45, zf + 0.03, zf + 0.06), '#a7abb0']);
    k.glass.push(B(D0, D0 + 1.1, lob + 0.05, lob + 2.3, zf + 0.06, zf + 0.08), B(D0 + 1.2, D1, lob + 0.05, lob + 2.3, zf + 0.06, zf + 0.08), B(D1 + 0.1, D1 + 0.67, lob + 0.05, lob + 2.3, zf + 0.06, zf + 0.08));
    for (const x of [D0 + 1.0, D0 + 1.3]) k.plain.push([B(x - 0.02, x + 0.02, lob + 0.9, lob + 1.4, zf + 0.08, zf + 0.14), '#c9ccd0']);
    // the framed emblem and the small blue sign on the back wall
    k.plain.push([B(D1 + 1.3, D1 + 2.15, lob + 1.0, lob + 1.95, zf + 0.03, zf + 0.06), '#1f1f22']);
    k.signs.push({ text: 'ISSER', x: D1 + 1.725 - O[0], y: lob + 1.475, z: zf + 0.07 - O[1], ry: 0, w: 0.7, colors: ['#e9e7e1', '#3a4a6a'] });
    k.plain.push([B(D1 + 0.75, D1 + 1.2, lob + 1.45, lob + 1.62, zf + 0.03, zf + 0.06), '#2c5fb3']);
    // potted plants and the air-conditioner on the lobby floor
    for (const x of [D1 + 0.95, L1 - 1.25]) {
      k.plain.push([B(x - 0.25, x + 0.25, lob, lob + 0.65, -282.95, -282.45), '#c9b48f']);
      for (let j = 0; j < 5; j++) k.plain.push([new THREE.ConeGeometry(0.1, 0.9, 4).rotateZ((j - 2) * 0.35).translate(x - O[0] + (j - 2) * 0.08, lob + 1.05, -282.7 - O[1]), j % 2 ? '#3f7a2c' : '#4f8f36']);
    }
    k.plain.push([B(L1 - 2.35, L1 - 1.6, lob, lob + 0.6, zf + 0.03, zf + 0.33), '#ecebe7'], [new THREE.CylinderGeometry(0.2, 0.2, 0.02, 16).rotateX(Math.PI / 2).translate(L1 - 1.97 - O[0], lob + 0.3, zf + 0.34 - O[1]), '#5f6366']);
    // stainless rails on the steps, left and right
    for (const x of [L0 - 0.7, L1 - 0.95]) {
      for (const z of [-281.4, -280.2]) k.plain.push([new THREE.CylinderGeometry(0.025, 0.025, 1.0, 6).translate(x - O[0], (z < -281 ? lob : 0.2) + 0.5, z - O[1]), '#c7cbcf']);
      const a = Math.atan2(lob - 0.2, 1.2);
      k.plain.push([new THREE.CylinderGeometry(0.025, 0.025, 1.35, 6).rotateX(Math.PI / 2 - a).translate(x - O[0], (lob + 0.2) / 2 + 1.0, -280.8 - O[1]), '#c7cbcf']);
    }
    // the raised step on the right, edged in dark red, with a steel railing
    old.push([B(L1 - 0.7, 318.3, 0, lob, zf, -281.7), '#d8cbb3'], [B(L1 - 0.7, 318.3, 0, 0.3, -281.72, -281.66), '#6e2a22']);
    k.plain.push([B(L1 - 0.7, 318.3, lob + 0.95, lob + 1.0, -281.75, -281.7), '#c7cbcf']);
    for (const x of [L1 - 0.6, 318.2]) k.plain.push([B(x - 0.02, x + 0.02, lob, lob + 1.0, -281.75, -281.7), '#c7cbcf']);
    // the EXIT sign on its post before the steps
    k.plain.push([B(311.0, 311.06, 0, 1.15, -279.5, -279.44), '#3a3a3a'], [B(310.65, 311.4, 1.0, 1.4, -279.44, -279.4), '#2a2a2a']);
    k.signs.push({ text: 'EXIT', x: 311.03 - O[0], y: 1.2, z: -279.38 - O[1], ry: 0, w: 0.6, colors: ['#f2f2ef', '#1d1d1d'] });
    // the back: the floors above standing over the ground floor on columns, a soffit under them
    fresh.push([B(276.3, 318.3, ST - 0.05, ST + 0.4, -294.5, -292.3), FRESH]);
    for (let x = 278.5; x < 318; x += 5.25) if (x < 301.6 || x > 310.8) fresh.push([B(x - 0.25, x + 0.25, 0, ST, -294.4, -293.9), FRESH]);
    fresh.push([B(302, 310.4, top, top + 1.3, -301.0, -294.5), FRESH]);
    for (const x of [279.5, 296.5, 316.6]) k.plain.push([new THREE.CylinderGeometry(0.06, 0.06, top, 6).translate(x - O[0], top / 2, -294.62 - O[1]), '#e3e3e0']);

    // --- RIPS: galleries on solid parapets toward the drive, and the link ---
    balconies(old, k, 318.3, 344.7, -292, -290, GREYED, 6.6);
    // the paved ground before RIPS falls from the galleries to a floor seven steps (1.26 m) below the car park on its
    // south: a retaining face with a coping along that edge, the stairs' cheek walls, and a face along the Computer
    // Science wing where the ground drops beside it
    const LOW = -1.26;
    for (const x of [336.35, 339.4]) old.push([B(x, x + 0.25, LOW - 0.05, 0.45, -277.55, -275.4), '#d9d4c8']);
    old.push([B(317, 336.35, LOW - 0.05, 0.01, -277.55, -277.2), '#cfc9bd'], [B(339.65, 349.65, LOW - 0.05, 0.01, -277.55, -277.2), '#cfc9bd']);
    old.push([B(317, 336.35, 0, 0.12, -277.58, -277.1), '#e2ddd2'], [B(339.65, 349.65, 0, 0.12, -277.58, -277.1), '#e2ddd2']);
    old.push([B(349.35, 349.65, LOW - 0.05, 0.01, -290, -277.2), '#cfc9bd']);
    const small = stairsOf().find((q) => q.alongZ && q.z0 === 336.6)!;
    for (let j = 0; j < small.steps; j++) { const za = small.x0 + j * small.tread, y = small.at(za + small.tread / 2); old.push([B(small.z0, small.z1, LOW - 0.05, y, za, za + small.tread + 0.02), STEP]); }
    // the white sign board on the second-floor parapet (owner): REGIONAL INSTITUTE FOR on the first line, POPULATION
    // STUDIES (RIPS) under it
    k.plain.push([B(322.9, 329.1, 2 * ST + 0.42, 2 * ST + 1.55, -289.99, -289.93), '#fbfbf9'], [B(322.8, 329.2, 2 * ST + 0.39, 2 * ST + 1.58, -290.0, -289.97), '#c9ccd0']);
    k.signs.push({ text: 'REGIONAL INSTITUTE FOR', x: 326 - O[0], y: 2 * ST + 1.26, z: -289.92 - O[1], ry: 0, w: 4.4, colors: ['#fbfbf9', '#1d2f6b'] });
    k.signs.push({ text: 'POPULATION STUDIES (RIPS)', x: 326 - O[0], y: 2 * ST + 0.76, z: -289.92 - O[1], ry: 0, w: 4.9, colors: ['#fbfbf9', '#1d2f6b'] });
    old.push([B(318.1, 344.9, top, top + 0.6, -301.1, -292), GREYED], [B(344.5, 350.2, top, top + 0.5, -299.2, -292.8), GREYED]);
    for (let x = 319; x < 344.5; x += 6.6) old.push([B(x - 0.2, x + 0.2, 0, PL + ST - 0.3, -290.5, -290.1), GREYED]);

    // --- Computer Science ---
    // the wing's roof slabs, the south end's parapet and the room on the roof with its dish and tanks
    washed.push([B(349.4, 361.6, top, top + 0.6, -320.3, -282.4), WASHED], [B(349.8, 361.6, top, top + 1.1, -282.4, -276.8), WASHED]);
    washed.push([B(351.8, 359.7, top + 0.4 + ST, top + 0.9 + ST, -292.2, -284.3), WASHED]);
    k.plain.push([new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6).translate(358.6 - O[0], top + 0.9 + ST + 0.8, -285 - O[1]), '#8e9196']);
    k.plain.push([new THREE.SphereGeometry(0.55, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.35, 1).rotateX(-0.9).translate(358.6 - O[0], top + 0.9 + ST + 1.6, -285 - O[1]), '#e9e9e6']);
    for (const z of [-316, -312]) k.plain.push([new THREE.CylinderGeometry(0.75, 0.75, 1.5, 12).translate(355.5 - O[0], top + 1.35, z - O[1]), '#1b1c1f']);
    // the department's door on the wing's west face: a porch slab on two posts, glazed doors, two steps
    washed.push([B(347.4, 349.6, 3.0, 3.3, -311.5, -307.5), WASHED]);
    for (const z of [-311.3, -307.7]) washed.push([B(347.5, 347.75, 0, 3.0, z - 0.12, z + 0.12), WASHED]);
    k.plain.push([B(349.56, 349.6, PL, 2.8, -310.5, -308.5), '#2a333b'], [B(349.55, 349.56, PL, 2.8, -309.53, -309.47), '#8d9196']);
    washed.push([B(348.4, 349.6, 0, PL, -311.1, -307.9), STEP], [B(347.9, 348.4, 0, PL / 2, -311.1, -307.9), STEP]);
    k.signs.push({ text: 'DEPARTMENT OF COMPUTER SCIENCE', x: 347.36 - O[0], y: 3.15, z: -309.5 - O[1], ry: -Math.PI / 2, w: 3.4, colors: ['#ffffff', '#1d3f7a'] });
    // the stair tower east of the wing: flights and landings seen through tall fins, a cap slab
    washed.push([B(366.4, 366.7, 0, top + 2.4, -284.6, -279.5), WASHED], [B(361.2, 366.9, top + 2.4, top + 3.1, -284.8, -279.3), WASHED]);
    for (let x = 361.75; x < 366.4; x += 0.55) washed.push([B(x - 0.07, x + 0.07, 0.5, top + 2.4, -279.7, -279.3), WASHED]);
    const flight = (xa: number, xb: number, ya: number, yb: number, z0: number, z1: number) => {
      const len = Math.hypot(xb - xa, yb - ya), a = Math.atan2(yb - ya, xb - xa);
      washed.push([new THREE.BoxGeometry(len, 0.22, z1 - z0).rotateZ(a).translate((xa + xb) / 2 - O[0], (ya + yb) / 2, (z0 + z1) / 2 - O[1]), '#d3d0c7']);
    };
    for (let f = 0; f < 4; f++) {
      const y = f * ST;
      flight(362.0, 365.0, y, y + ST / 2, -281.4, -280.0);
      washed.push([B(365.0, 366.4, y + ST / 2 - 0.22, y + ST / 2, -283.0, -280.0), '#d3d0c7']);
      flight(365.0, 362.0, y + ST / 2, y + ST, -283.0, -281.6);
      washed.push([B(361.4, 362.0, y + ST - 0.22, y + ST, -283.0, -280.0), '#d3d0c7']);
      panel(k, rails(), 362.0, -281.5, 365.0, -281.5, y + ST / 2, y + ST / 2 + 0.9, 0.15, 0.9);
    }
    // the east block: balconies with solid parapets, its roof slab
    balconies(washed, k, 366.7, 393.8, -282.4, -280.6, WASHED, 6.4);
    washed.push([B(361.2, 394.0, top, top + 0.7, -291.7, -282.4), WASHED]);
    // its east end over the yard (the owner's science campus brief, pair 9): heavy solid bands at the floors, AC units on
    // the wall
    for (const f of [1, 2]) washed.push([B(393.8, 394.6, PL + f * ST - 0.35, PL + f * ST + 0.25, -291.7, -280.6), WASHED]);
    for (const [z, y] of [[-289.2, PL + 2.1], [-285.0, PL + ST + 2.2]] as [number, number][]) k.plain.push([B(393.8, 394.15, y, y + 0.6, z - 0.45, z + 0.45), '#e9e9e6'], [B(394.15, 394.17, y + 0.08, y + 0.52, z - 0.36, z + 0.36), '#9aa0a3']);
    // the diesel generator house: grey walls, orange doors behind collapsible grilles, a blue fascia, a tin roof
    washed.push([B(364, 377, 0, 2.9, -278.6, -274.6), '#cfccc4']);
    for (const [a, b] of [[365.0, 369.6], [370.6, 375.2]]) {
      k.plain.push([B(a, b, 0.1, 2.4, -274.62, -274.56), '#d4953a']);
      for (let x = a + 0.55; x < b; x += 0.55) k.plain.push([B(x - 0.02, x + 0.02, 0.15, 2.3, -274.6, -274.55), '#9a6624']);
      panel(k, grille(), a, -274.45, b, -274.45, 0.1, 2.4, 0.5, 0.5);
    }
    k.plain.push([B(363.8, 377.2, 2.55, 3.1, -274.55, -274.3), '#24427a'], [B(363.7, 377.3, 3.1, 3.2, -278.9, -274.25), '#8b9094']);
    k.signs.push({ text: 'Diesel Generator', x: 367.3 - O[0], y: 1.9, z: -274.52 - O[1], ry: 0, w: 1.0, colors: ['#d4953a', '#1d1d1d'] });
    // the car shed east of it: steel posts, a red-brown sheet roof, a low wall and mesh along the front
    for (let x = 378; x <= 393.6; x += 3.9) for (const z of [-281.6, -275.2]) k.plain.push([B(x - 0.08, x + 0.08, 0, 2.9, z - 0.08, z + 0.08), '#5a5d61']);
    k.plain.push([new THREE.BoxGeometry(16.2, 0.1, 7.0).rotateX(-0.05).translate(385.8 - O[0], 3.05, -278.4 - O[1]), '#7b3a2c']);
    washed.push([B(378, 393.6, 0, 0.8, -275.3, -275.1), WASHED]);
    panel(k, rails(), 378, -275.2, 393.6, -275.2, 0.8, 2.6, 0.12, 1.8);
    for (let x = 365; x < 377; x += 1.4) SOLIDS.add(x, -276.6, 2.0);

    // --- ground: hedges along ISSER's drive, trees, a palm ---
    const g = garden([270, 400, -330, -262]);
    g.reseed(61);
    g.hedge(k, 311.6 - O[0], -278.5 - O[1], 311.6 - O[0], -268 - O[1]);
    g.hedge(k, 318.4 - O[0], -278.5 - O[1], 318.4 - O[0], -268 - O[1]);
    g.hedge(k, 300 - O[0], -278.3 - O[1], 310.6 - O[0], -278.3 - O[1]);
    g.hedge(k, 319.4 - O[0], -276.6 - O[1], 330 - O[0], -276.6 - O[1]);
    g.tree(k, 297 - O[0], -274 - O[1], 1.4);
    g.tree(k, 342.5 - O[0], -275 - O[1], 1.6);
    g.tree(k, 396.5 - O[0], -276 - O[1], 1.5);
    g.palm(k, 346.3 - O[0], -279.5 - O[1], 3.2);
    // big shade trees over the concrete car park north of the Mathematics and Statistics departments (owner's
    // aerial: trees, not grass; the cars park under them)
    for (const [x, z, sc] of [[325.5, -272, 1.7], [330.5, -265.8, 1.9], [334.2, -261, 1.6], [344.5, -268.5, 1.9], [348.2, -261.8, 1.7], [350.8, -273.4, 1.5]]) g.tree(k, x - O[0], z - O[1], sc);
    g.palm(k, 346 - O[0], -311 - O[1], 4.5);
    for (const [x, z] of [[352.5, -275.6], [357.6, -275.5]]) g.bush(k, x - O[0], z - O[1], 1.1);

    for (const [parts, s] of [[fresh, 0.35], [old, 1.0], [washed, 1.5]] as [Part[], number][]) {
      const m = new THREE.Mesh(merge(parts), concrete(s));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    }
  },
};

/** ISSER, RIPS and Computer Science as one connected range */
export const isserCs = createSite('issercs', [SPEC]);
