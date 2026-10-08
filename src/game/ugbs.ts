// The University of Ghana Business School, from the owner's photos and marked aerial (block engine: blocks.ts).
//
// The owner's aerial marks the front (F) on the west, toward the car park by the road, and the side the owner calls
// the west side (W) on the north, toward the big car park. Three linked blocks on the mapped outline:
//
// - The main block (white): three floors and a fourth set back under a deep flat roof slab that overhangs all round.
//   The front: a white panel and a tall perforated screen at the north end, an open bay in the middle the height of
//   the building with floor slabs and balconies (the College of Humanities sign on the first-floor parapet, the two
//   computer laboratories on the second floor in front of the bay), then a wider screen and a big blank panel scored
//   in squares at the south end. The entrance is at the foot of the open bay. The north side: long bands of windows
//   between white piers, balconies standing out on the first floor, barred windows on the ground floor. On the roof,
//   low red hipped roofs and a small penthouse under a red roof.
// - North-east of it, the middle block (beige concrete): a big grid of white-framed windows over three floors in a
//   beige surround on its north face, a recessed ground floor of grilles and glass, and an open storey on top under
//   a flat roof frame on posts.
// - Behind it, the east block (beige): four floors of deep-set windows between projecting fins, under a flat
//   overhanging roof.
import * as THREE from 'three';
import { WHITE, box } from './modelkit';
import { PL, createSite, render, type Block, type Kit, type Spec, type Style } from './blocks';

const ST = 3.6;
const BEIGE = '#cdb48c', BEIGE_D = '#b89c74', GREY = '#e9e9e6';

// ---------- facades ----------
/** a long band of glass between white piers, a sill band under it; barred on the ground floor */
const BANDS: Style = {
  bay: 3.2, up: [[18, 40, 220, 150]], ground: [[18, 256 + 46, 220, 150]],
  draw: (g) => {
    render(g, '#f3f3f0');
    for (const y0 of [0, 256]) {
      g.fillStyle = '#2b3138'; g.fillRect(18, y0 + 40, 220, 150);
      g.fillStyle = '#6d747b'; for (const x of [18, 90, 162, 234]) g.fillRect(x, y0 + 40, 4, 150);
      g.fillRect(18, y0 + 96, 220, 4);
      g.fillStyle = 'rgba(210,220,228,0.25)'; g.fillRect(24, y0 + 44, 60, 50);
      g.fillStyle = '#dcdcd8'; g.fillRect(0, y0 + 196, 256, 16);
    }
    g.fillStyle = 'rgba(40,40,40,0.8)'; for (let x = 26; x < 238; x += 12) g.fillRect(x, 256 + 46, 3, 150);
  },
};
/** the big blank panels of the front, scored in squares */
const PANEL: Style = {
  bay: 3.6, up: [], ground: [],
  draw: (g) => { render(g, '#f2f2ef'); g.fillStyle = '#cfcfca'; for (const y of [0, 128, 256, 384]) g.fillRect(0, y, 256, 4); g.fillRect(0, 0, 4, 512); },
};
/** the recessed top storey under the roof slab: a dark band of glass */
const TOP: Style = {
  bay: 3, up: [[0, 40, 256, 170]], ground: [[0, 256 + 40, 256, 170]],
  draw: (g) => { render(g, '#dedede'); for (const y0 of [0, 256]) { g.fillStyle = '#323940'; g.fillRect(0, y0 + 40, 256, 170); g.fillStyle = '#5c646c'; g.fillRect(126, y0 + 40, 4, 170); } },
};
/** the back of the open bay: glass and doors */
const GLAZED: Style = {
  bay: 2.4, up: [[10, 30, 236, 190]], ground: [[10, 256 + 30, 236, 200]],
  draw: (g) => { render(g, '#e8e8e5'); for (const y0 of [0, 256]) { g.fillStyle = '#3a4650'; g.fillRect(10, y0 + 30, 236, 190); g.fillStyle = '#9aa3a8'; g.fillRect(124, y0 + 30, 6, 190); g.fillRect(10, y0 + 120, 236, 5); } },
};
/** beige concrete with small deep-set windows */
const BEIGE_WALL: Style = {
  bay: 3.4, up: [[92, 60, 72, 110]], ground: [[92, 256 + 60, 72, 110]],
  draw: (g) => {
    g.fillStyle = BEIGE; g.fillRect(0, 0, 256, 512);
    g.fillStyle = BEIGE_D; for (const y of [0, 256]) g.fillRect(0, y, 256, 5);
    for (const y0 of [0, 256]) { g.fillStyle = '#7d6a52'; g.fillRect(86, y0 + 54, 84, 122); g.fillStyle = '#262a2e'; g.fillRect(92, y0 + 60, 72, 110); }
  },
};
/** the middle block's north face: the big grid of white-framed windows, the AC units in it */
const GRID: Style = {
  bay: 1.6, up: [[8, 8, 240, 240]], ground: [[8, 256 + 8, 240, 240]],
  draw: (g) => {
    for (const y0 of [0, 256]) {
      g.fillStyle = '#f4f4f2'; g.fillRect(0, y0, 256, 256);
      g.fillStyle = '#39424a'; g.fillRect(14, y0 + 14, 228, 104); g.fillRect(14, y0 + 138, 228, 104);
      g.fillStyle = '#f4f4f2'; g.fillRect(124, y0 + 14, 8, 228);
      g.fillStyle = 'rgba(220,226,230,0.3)'; g.fillRect(20, y0 + 20, 60, 40);
    }
    g.fillStyle = '#e8e8e6'; g.fillRect(150, 160, 70, 46);
  },
};
const BEIGE_PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => { g.fillStyle = BEIGE; g.fillRect(0, 0, 256, 512); g.fillStyle = BEIGE_D; g.fillRect(0, 0, 256, 4); g.fillRect(0, 256, 256, 4); } };

// ---------- the main block: x -193.4..-140.8, z -131.9..-90.1 ----------
const MO: [number, number] = [-167.1, -111.0];
const X = (x: number) => x - MO[0], Z = (z: number) => z - MO[1];
const R = (x0: number, x1: number, z0: number, z1: number, floors: number, more: Partial<Block> = {}): Block =>
  ({ x0: X(x0), x1: X(x1), z0: Z(z0), z1: Z(z1), floors, roof: 'none', ...more });
// the front (west, x -193.4), north to south: the north wall, a screen, the open bay, a wider screen, the blank panel
const BAY0 = -126.0, BAY1 = -109.6, BAY_D = 4.0;
const H3 = PL + 3 * ST; // the top of the third floor

/** a tall perforated screen of white concrete: a frame, slender fins, cross bars and a fin in every other cell */
function screen(k: Kit, x: number, z0: number, z1: number, y0: number, y1: number, depth: number, faceX: boolean) {
  const at = (a0: number, a1: number, b0: number, b1: number, c0: number, c1: number) =>
    faceX ? box(x - c1, x - c0, b0, b1, a0, a1) : box(a0, a1, b0, b1, x + c0, x + c1);
  const parts: [number, number, number, number, number, number][] = [];
  const n = Math.max(2, Math.round((z1 - z0) / 0.6));
  for (let i = 0; i <= n; i++) { const t = z0 + ((z1 - z0) * i) / n; parts.push([t - 0.06, t + 0.06, y0, y1, 0, depth]); }
  const rows = Math.round((y1 - y0) / 0.9);
  for (let j = 0; j <= rows; j++) { const y = y0 + ((y1 - y0) * j) / rows; parts.push([z0, z1, y - 0.06, y + 0.06, 0, depth]); }
  for (let j = 0; j < rows; j++) for (let i = 0; i < n; i++) if ((i + j) % 2 === 0) {
    const t = z0 + ((z1 - z0) * (i + 0.5)) / n, y = y0 + ((y1 - y0) * j) / rows;
    parts.push([t - 0.04, t + 0.04, y + 0.15, y + (y1 - y0) / rows - 0.15, 0.05, depth - 0.05]);
  }
  for (const p of parts) k.plain.push([at(...p), '#f1f1ee']);
}

const mainBlock: Spec = {
  name: 'University of Ghana Business School',
  axis: [1, 0], origin: MO, storey: ST, style: BANDS, roofColor: '#b9473c', fascia: WHITE, pitch: 0.18,
  replaces: [[-170, -110], [-120, -122], [-105, -100]],
  blocks: [
    // the body behind the open bay, three floors
    R(-193.4 + BAY_D, -140.8, -131.9, -90.1, 3, { faces: { x0: GLAZED } }),
    // the front's north piece and its south part, flush with the front
    R(-193.4, -193.4 + BAY_D, -131.9, BAY0, 3, { faces: { x0: PANEL, z1: PANEL } }),
    R(-193.4, -193.4 + BAY_D, BAY1, -90.1, 3, { faces: { x0: PANEL, z0: PANEL } }),
    // the top floor, set back under the roof slab
    R(-192.0, -142.2, -130.5, -91.5, 1, { y: 3 * ST, faces: { x0: TOP, x1: TOP, z0: TOP, z1: TOP } }),
  ],
  keep: [[X(-200), X(-193.4), Z(BAY0), Z(BAY1)], [X(-196), X(-193.4), Z(-131.9), Z(-90.1)]],
  extras: (k: Kit) => {
    const fx = X(-193.4), bx = X(-193.4 + BAY_D), top = H3 + ST + 0.2;
    // the deep flat roof slab, overhanging all round, its thick white edge
    k.plain.push([box(X(-195.0), X(-139.2), top, top + 0.35, Z(-133.5), Z(-88.5)), '#f4f4f1']);
    k.plain.push([box(X(-195.2), X(-139.0), top + 0.35, top + 1.25, Z(-133.7), Z(-88.3)), '#f4f4f1']);
    k.plain.push([box(X(-195.0), X(-139.2), top - 0.02, top, Z(-133.5), Z(-88.5)), '#c9c9c4']);
    // on the roof: low red hipped roofs over the west part, a flat brown roof over the east, and the penthouse
    k.roof.c = new THREE.Color('#b9473c');
    const hip = (x0: number, x1: number, z0: number, z1: number, y: number, p: number) => {
      const w = x1 - x0, d = z1 - z0, half = Math.min(w, d) / 2, t = y + half * p;
      if (w >= d) { const zm = (z0 + z1) / 2, a = [x0 + half, t, zm], b = [x1 - half, t, zm]; k.roof.quad([x0, y, z0], [x1, y, z0], b, a); k.roof.quad([x1, y, z1], [x0, y, z1], a, b); k.roof.quad([x0, y, z1], [x0, y, z0], a, a); k.roof.quad([x1, y, z0], [x1, y, z1], b, b); }
      else { const xm = (x0 + x1) / 2, a = [xm, t, z0 + half], b = [xm, t, z1 - half]; k.roof.quad([x1, y, z0], [x1, y, z1], b, a); k.roof.quad([x0, y, z1], [x0, y, z0], a, b); k.roof.quad([x0, y, z0], [x1, y, z0], a, a); k.roof.quad([x1, y, z1], [x0, y, z1], b, b); }
    };
    const ry = top + 1.25;
    hip(X(-192), X(-158), Z(-130.5), Z(-117), ry, 0.25);
    hip(X(-192), X(-158), Z(-104), Z(-91.5), ry, 0.25);
    k.plain.push([box(X(-187), X(-165), ry, ry + 0.25, Z(-117), Z(-104)), '#e4e2dc']);
    k.plain.push([box(X(-158), X(-142), ry, ry + 0.3, Z(-130.5), Z(-91.5)), '#a07a5a']);
    // the penthouse with small windows under a red roof (front photo, top right)
    const px0 = X(-176), px1 = X(-166), pz0 = Z(-108), pz1 = Z(-98);
    k.plain.push([box(px0, px1, ry, ry + 3.2, pz0, pz1), '#efefec']);
    for (let z = pz0 + 1.5; z < pz1 - 1; z += 2.4) k.plain.push([box(px0 - 0.03, px0, ry + 1.2, ry + 2.3, z - 0.5, z + 0.5), '#3a3a3a']);
    hip(px0 - 0.5, px1 + 0.5, pz0 - 0.5, pz1 + 0.5, ry + 3.2, 0.3);
    k.roof.c = new THREE.Color('#b9473c');
    // ---------- the front ----------
    // the north screen and the wide south screen, standing off the front
    screen(k, fx, Z(-128.4), Z(BAY0), 0.4, H3, 0.35, true);
    screen(k, fx, Z(BAY1), Z(BAY1) + 5.2, 0.4, H3, 0.35, true);
    // the open bay: floor slabs at each level, columns at the front
    for (let f = 1; f <= 3; f++) k.plain.push([box(fx, bx, PL + f * ST - 0.3, PL + f * ST, Z(BAY0), Z(BAY1)), GREY]);
    for (const z of [Z(BAY0) + 0.4, Z(BAY0) + 6.4, Z(BAY0) + 11.2]) k.plain.push([box(fx + 0.2, fx + 0.75, 0, H3, z - 0.28, z + 0.28), '#f1f1ee']);
    // first floor: a parapet across the bay, the College of Humanities sign on it
    k.plain.push([box(fx - 0.25, fx + 0.05, PL + ST, PL + ST + 1.15, Z(BAY0), Z(BAY1)), '#f4f4f1']);
    k.signs.push({ text: 'UNIVERSITY OF GHANA  |  UGBS  (College of Humanities)', x: fx - 0.27, y: PL + ST + 0.6, z: Z(BAY0) + 7.5, ry: -Math.PI / 2, w: 5.4, colors: ['#ffffff', '#1d2a6b'] });
    // second floor: the two computer laboratories standing out in front of the bay, their windows and signs
    for (const [z0, z1] of [[Z(BAY0) + 4.4, Z(BAY0) + 9.7], [Z(BAY0) + 9.9, Z(BAY1) - 0.6]]) {
      k.plain.push([box(fx - 1.2, bx - 1.5, PL + 2 * ST - 0.35, PL + 2 * ST, z0, z1), '#f4f4f1']);
      k.plain.push([box(fx - 1.2, fx - 0.95, PL + 2 * ST, PL + 2 * ST + 1.05, z0, z1), '#f4f4f1']);
      k.plain.push([box(fx + 0.3, fx + 0.5, PL + 2 * ST, PL + 3 * ST - 0.3, z0, z1), '#f1f1ee']);
      k.plain.push([box(fx + 0.25, fx + 0.3, PL + 2 * ST + 1.1, PL + 2 * ST + 2.6, (z0 + z1) / 2 - 1.4, (z0 + z1) / 2 + 1.4), '#3a4650']);
      for (const dz of [-0.9, 0.9]) k.plain.push([box(fx + 0.22, fx + 0.25, PL + 2 * ST + 1.2, PL + 2 * ST + 2.3, (z0 + z1) / 2 + dz - 0.35, (z0 + z1) / 2 + dz + 0.35), '#c4473a']);
      k.signs.push({ text: 'UGBS  COMPUTER LABORATORY', x: fx + 0.24, y: PL + 3 * ST - 0.75, z: (z0 + z1) / 2, ry: -Math.PI / 2, w: 2.6, colors: ['#eceef4', '#1d2a6b'] });
    }
    // the entrance at the foot of the bay: glass doors and a step
    k.plain.push([box(bx - 0.06, bx, PL, PL + 2.6, Z(-119.5), Z(-116)), '#1e2329']);
    k.plain.push([box(fx, bx, 0, 0.15, Z(BAY0), Z(BAY1)), '#d2cec5']);
    // ---------- the north side (the owner's W): balconies standing out on the first floor ----------
    const nz = Z(-131.9);
    for (const x of [X(-188), X(-176), X(-164), X(-152)]) {
      k.plain.push([box(x - 2.2, x + 2.2, PL + ST - 0.3, PL + ST, nz - 1.3, nz), '#f4f4f1']);
      k.plain.push([box(x - 2.2, x + 2.2, PL + ST, PL + ST + 1.1, nz - 1.3, nz - 1.1), '#f4f4f1']);
      for (const s of [-1, 1]) k.plain.push([box(x + s * 2.2 - 0.2, x + s * 2.2, PL + ST, PL + ST + 1.1, nz - 1.3, nz), '#f4f4f1']);
    }
    // white piers between the bays of the north side, up to the slab
    for (let x = X(-193.4) + 3.2; x < X(-140.8) - 1; x += 6.4) k.plain.push([box(x - 0.25, x + 0.25, 0, H3, nz - 0.45, nz), '#f1f1ee']);
    // flagpoles on the lawn south of the entrance
    for (const z of [Z(-96), Z(-93), Z(-90)]) k.plain.push([new THREE.CylinderGeometry(0.05, 0.07, 9, 6).translate(fx - 8, 4.5, z), '#d9d9d4']);
  },
};

// ---------- the middle block: x -136.2..-98, z -131.3..-116.1, and the link to the main block ----------
const DO: [number, number] = [-117.1, -123.7];
const mid: Spec = {
  name: 'UGBS middle block',
  axis: [1, 0], origin: DO, storey: 3.5, style: BEIGE_WALL, roofColor: BEIGE, fascia: BEIGE, pitch: 0.1,
  blocks: [
    { x0: -136.2 - DO[0], x1: -98 - DO[0], z0: -131.3 - DO[1], z1: -116.1 - DO[1], floors: 4, roof: 'flat', faces: { z0: BEIGE_PLAIN } },
    { x0: -140.8 - DO[0], x1: -136.2 - DO[0], z0: -126.7 - DO[1], z1: -123.9 - DO[1], floors: 3, roof: 'flat' },
  ],
  keep: [],
  extras: (k: Kit) => {
    const z0 = -131.3 - DO[1], x0 = -136.2 - DO[0], x1 = -98 - DO[0], e = k.wallTop(4);
    // the north face (owner's photo): the window grid over three floors in a deep beige surround
    const gx0 = x0 + 5, gx1 = x1 - 9, gy0 = PL + 3.5, gy1 = PL + 4 * 3.5 - 0.3;
    k.plain.push([box(gx0 - 0.6, gx1 + 0.6, gy0 - 0.6, gy1 + 0.6, z0 - 0.7, z0), BEIGE]);
    const cols = Math.round((gx1 - gx0) / 1.25), rows = 6;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const a = gx0 + ((gx1 - gx0) * i) / cols, b = gx0 + ((gx1 - gx0) * (i + 1)) / cols, c = gy0 + ((gy1 - gy0) * j) / rows, d = gy0 + ((gy1 - gy0) * (j + 1)) / rows;
      k.plain.push([box(a + 0.08, b - 0.08, c + 0.08, d - 0.08, z0 - 0.78, z0 - 0.72), j % 2 ? '#3a434b' : '#2e363d']);
    }
    for (let i = 0; i <= cols; i++) { const a = gx0 + ((gx1 - gx0) * i) / cols; k.plain.push([box(a - 0.08, a + 0.08, gy0, gy1, z0 - 0.84, z0 - 0.7), '#f4f4f2']); }
    for (let j = 0; j <= rows; j++) { const c = gy0 + ((gy1 - gy0) * j) / rows; k.plain.push([box(gx0, gx1, c - (j % 2 ? 0.05 : 0.12), c + (j % 2 ? 0.05 : 0.12), z0 - 0.84, z0 - 0.7), '#f4f4f2']); }
    for (const [x, y] of [[gx0 + 4, gy0 + 1.2], [gx0 + 11, gy0 + 4.6], [gx0 + 7, gy0 + 8.1], [gx1 - 5, gy0 + 1.2], [gx1 - 9, gy0 + 4.6]]) k.plain.push([box(x - 0.45, x + 0.45, y, y + 0.6, z0 - 1.1, z0 - 0.8), '#e6e6e3']);
    // the ground floor below it: recessed, panels of white grilles and glass
    k.plain.push([box(gx0 - 0.6, gx1 + 0.6, 0, PL + 3.5 - 0.6, z0 - 0.02, z0 + 0.02), '#2c3237']);
    for (let x = gx0; x < gx1; x += 0.3) k.plain.push([box(x, x + 0.08, 0.6, 2.7, z0 - 0.08, z0 - 0.02), '#f1f1ee']);
    // the open storey on the roof: a flat frame on posts
    const ft = e + 3.2;
    for (let x = x0 + 1; x <= x1 - 1; x += 6.2) for (const z of [z0 + 1, -116.1 - DO[1] - 1]) k.plain.push([box(x - 0.25, x + 0.25, e, ft, z - 0.25, z + 0.25), BEIGE]);
    k.plain.push([box(x0 - 0.8, x1 + 0.8, ft, ft + 0.9, z0 - 0.8, -116.1 - DO[1] + 0.8), BEIGE]);
    k.plain.push([box(x0 - 0.8, x1 + 0.8, ft - 0.03, ft, z0 - 0.8, -116.1 - DO[1] + 0.8), BEIGE_D]);
  },
};

// ---------- the east block: x -114.2..-97.9, z -113.1..-88.4 ----------
const EO: [number, number] = [-106.05, -100.75];
const east: Spec = {
  name: 'UGBS extention',
  axis: [1, 0], origin: EO, storey: 3.5, style: BEIGE_WALL, roofColor: BEIGE, fascia: BEIGE, pitch: 0.1,
  blocks: [{ x0: -114.2 - EO[0], x1: -97.9 - EO[0], z0: -113.1 - EO[1], z1: -88.4 - EO[1], floors: 5, roof: 'flat' }],
  keep: [],
  extras: (k: Kit) => {
    const x0 = -114.2 - EO[0], x1 = -97.9 - EO[0], z0 = -113.1 - EO[1], z1 = -88.4 - EO[1], e = k.wallTop(5);
    // projecting fins between the windows, and the flat overhanging roof
    for (let x = x0 + 1.7; x < x1 - 0.5; x += 3.4) for (const z of [z0, z1]) k.plain.push([box(x - 0.2, x + 0.2, PL, e, z - (z === z0 ? 0.6 : 0), z + (z === z1 ? 0.6 : 0)), BEIGE]);
    for (let z = z0 + 1.7; z < z1 - 0.5; z += 3.4) for (const x of [x0, x1]) k.plain.push([box(x - (x === x0 ? 0.6 : 0), x + (x === x1 ? 0.6 : 0), PL, e, z - 0.2, z + 0.2), BEIGE]);
    k.plain.push([box(x0 - 1, x1 + 1, e, e + 0.9, z0 - 1, z1 + 1), BEIGE]);
    k.plain.push([box(x0 - 1, x1 + 1, e - 0.03, e, z0 - 1, z1 + 1), BEIGE_D]);
  },
};

/** the Business School's three blocks */
export const ugbs = createSite('ugbs', [mainBlock, mid, east]);
