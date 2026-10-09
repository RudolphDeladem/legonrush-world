// St. Thomas Aquinas Catholic Church and the Legon Interdenominational Church, on the road behind WACCBIP, and the
// open ground west of them, from the owner's marked aerial (registered to the Interdenominational Church at 0.235 m/px)
// and street photos (block engine: blocks.ts).
//
// St. Thomas Aquinas (photos 2 and 3, its east side toward the back of WACCBIP): the church, one tall storey under a
// brown-red tile hip roof edged by a broad white fascia, its porch on the south toward the paved court; round its north,
// east and west a lower flat-roofed range, white over a khaki base, wide dark windows, a door up steps with black
// handrails in its east face, a white railing round its roof; a white screen wall of pierced blocks south of it, a
// covered walk on posts at its north-east corner, tall white fins on the church's north-east; west of it the long
// two-storey house under red tile hip roofs; car parks of grey pavers east and south; along the road a low white wall
// with dark grey piers and white railings stepped along the top; a wall of pierced blocks to the Interdenominational
// Church on the north; the big rain tree south-east of the church.
// Legon Interdenominational Church (photos 4 and 5): the church's gable to the car park on the east: white, a lavender
// pentagon panel with a fan window high in it, louvred windows either side, a lavender band low on the wall, the
// entrance between rubble-stone panels up two white ramps that sweep down either side; a steep dark brown tile roof;
// behind it a lower hall under orange tiles. South of it the two-storey cross-shaped block under orange tiles, the
// small links, and the gabled two-storey building in scaffolding (its gable faced in stone), a hedge along the church;
// the car park of grey pavers with round planters in white kerbs, palms and trees; along the road a red brick wall
// with brick piers and the black iron gates hung on brick piers carrying white globe lamps.
// West of both (the owner's green line): open ground of red laterite soil and dry grass in patches, tracks worn across
// it, clumps of bushes and trees (read cell by cell from the aerial), a small water tank and a shed.
import * as THREE from 'three';
import { box, canvas, merge, rnd, speckle, tri2, type Part } from './modelkit';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { concrete, panel, pierced, stoneMesh } from './concrete';
import { garden } from './gardens';
import { SOLIDS } from './solids';
import { hipRoof } from './waccbip';

/** the open ground west of the churches, 2 m cells from the aerial: s soil, m soil and grass, g dry grass, t bushes and
 *  trees, . outside the owner's green line; x -486.. , z -445.. */
const FIELD = [
  'gggggggggggggggggggggggggggggggggggggggg..........',
  'ggmmmmmgggggggggggggggttttttttgmgggmmggg..........',
  'ggssssmgggggggtgggggggttttgttgmsmmsmmmgg..........',
  'ggsssmgggggggtttggggggtttgmmmmssssssmmgg..........',
  'ggsssmgggggtttttggggggtttgmsssssssssmmgg..........',
  'ggsssgggggttttttggggggtttgsssssssssssmgg..........',
  'ggssmggtttttttttggggggtttgsmsssssssssmgg..........',
  'ggmsmggtttttttttgggggggggmssssmssssssmmg..........',
  'gggmggttttttgggtgggggggggmssssssssssmmmg..........',
  'gggggttttttggggggggggggtgssssssssssssssg..........',
  'gggggttttgtttgggggggggttgsssssssssssmssm..........',
  'ggggggtttgtttgggggggggtttmsssssssssmmmsm..........',
  'ggggggtttgttgggggggggggttgssssssssmmmmmm..........',
  'gggggtttttggggggmmggggttttgmsssssmmmmmmg..........',
  'ggggtttgtgggggggmgggggtttggmmsssmmmmmmmg..........',
  'ggggtttttgggggggggmgggttttgmmmsmmmmmmmmg..........',
  'gggggttttggggggggmmgggttttgggmmmmmmmmmmg..........',
  'ggggttttttgggggggmmgggtttttggmmmmmmggggg..........',
  'gtggttttttggggggggmmggggttgggggmmmggggg...........',
  'gtgggttttggggggggggmgggttttgggggmmggggg...........',
  'gtttggggggggggggggggggggtttttggggggggg............',
  'gtttggggggtgggggggggggggtttggggggggggg............',
  'gtttggggtttgggmgggggggtttttgggggggggggg...........',
  'gttgggggtttgggggmgggggttttttggggggmgggg...........',
  'gttgggggttttggggggggggtttggggggggsmggggg..........',
  'gttgggggttttggggggggggttggggggmmsssmggggg.........',
  'ggtggggtttttggmgggggggttgggggmsssssmmmggg.........',
  'ggtggggttttggmmggggggtttgggtggmssssssmgggg........',
  'ggtgggggtttggggggggggggttttttggmssssssmgggg.......',
  'ggtggggggggggggggggggggtttttggggsssssssgggg.......',
  'gggggggggggggggggggggggtttttgggssssssssmggg.......',
  'gggggggggggggggggggggggtttttggmssssssssmgtg.......',
  'gggtgggggggggggtggggggggtttgggsssssssssgttg.......',
  'gggtgggggggggggggggggggggttgggmssssssssgttg.......',
  'gggtgggggggggggggtgggggggttgggmssssssssmttg.......',
  'gggtgggggggggggtttgggggggttgggmsssssssssgtg.......',
  'gggtggggggggggttttggmggggtggggmsssssssssmgg.......',
  'gggtggggggggggttttggmgggggggggmssssssssssmg.......',
  'gtgtggggggggggttttggmggggggggggsssssssssssm.......',
  'gtgtggggggggggttttgggggggggggggsssssssssssm.......',
  'gggtgggggggggttttttggggggggggggmsmmmmsssssg.......',
  'gggggggggggggtttttttggggggggggggsmmmmmssssg.......',
  'ggggggggggggtttttttttgggggggggggmmmmmmssssg.......',
  'ggggggggggggttttttttttggggggggggmmmmmmsssmg.......',
  'ggggggggggggttttttttttggggggggggmmmmmmmssmg.......',
  'gggtggggggggttttttttttgggggggggggmmggmmmmmg.......',
  'gggtggggggggtttttttttggggggggggggggggggggmg.......',
  'gggggggttgggtttttttttgggggggggggggtttttgggg.......',
  'ggtgggggggggtgttttttggggggggggggggtttttttgg.......',
  'ggtgggggggggtgtttggggggggmggggggggttttttttg.......',
  'ggtggggggmmggttgtgggggggmmgggggggggtttttttg.......',
  'gggggggggsmgggggggggggggggggggggggttttttttg.......',
  'gtgggggggmggtggggggggggggmmgggggggttttttttg.......',
  'gtggggmgggggtggggggggggggmmgggggggttttttttg.......',
  'gtggggmggggggggggggggmmmmmmggggggtttttttttg.......',
  'gtggggmgggggggtggggggmmmmmmggggggttttttggtg.......',
  'gtggggggggggggggggggggmmmmgggggggttttttggtg.......',
  'ggmmmggggggtgggggggggmmmgggggggggtttttttgtg.......',
  'ggmmmmmgggggggggggggggmmmggggggggtttttttttg.......',
  'ggmmmmmmmgggtttggggggggmmgggggggggtttttttgg.......',
  'gggmmmmmggggtttgggggggggggggggggggtttttgggg.......',
  'gtgmmmmmggggttggttggggggggggggggggttttgggggg......',
  'gtgggmmgggggggggggggggggggggggggggtttttgggtg......',
  'gtgmmmmgggggggggggggggggggggggggggtttttttttg......',
  'gtgmmmgggggggggggggggggggggggggggggggttttttg......',
  'gtgmmmggggggggggggggggggggggggggggggtttttttg......',
  'gttgsmmggggggggggggggggggggggggggggggttttttg......',
  'gtttgsmmgggggggggggggggggggggggggggggttttttg......',
  'gtttgmsmmmggggggggmggggggggggggggggggtttggtg......',
  'gttttgmmmmmggggggggggggggggggggggggggttggmgg......',
  'gttttgggggmggggggggggggggggggggggggggttggssg......',
  'gtttggggggmmggttgggggttggggggggggggggttggsss......',
  'ggtggggggggggggttggggggggggggggggggggtttgmmg......',
  'ggtggggggggggggggggmmmmsmggggggggggggtttgggg......',
  'ggtgggggggtggmmggggggmmsmggggggggggggtttttttg.....',
  'ggtgggggggttgmmgggttggmmmmgggggggggggtttttttg.....',
  'ggtgggggggttgmggtttttgggmmgggggggggggtttttttg.....',
  'gttggggggggggmgtttttttgggmmggggggggggtttttttg.....',
  'gttgggggggggggttttttttggggggggggggggggttttttg.....',
  'gttgggggggggtggtttttttgtgggggggggggggtttttttg.....',
  'gtttttttttgggggttttttggttgtttttggggggttttttttg....',
  'gtttttttttttgggtttttggttttttttttgggttttttttttg....',
  'gtttttttttttggttttttgggtttttttttggtttttttttttg....',
  'gtttttttttttttttttttgggttttttttgggtttttttttttg....',
  'gttttttttttttttttttggggggggggggggggggttttttttg....',
  'gttttttttttttttttgggggggggggggggmgggggggtttttg....',
  'gttttttttttttttttggggttgggggggggggggggggtttttg....',
  'gttttttttttttttttgmgggttgggggggggggmmmggttttttg...',
  'gttttgggggggggtttgggggttttttttttggsmmgggttttttg...',
  'gtttggtttgggggtttgggtggttttttttttgmmmmggttttttg...',
  'gtgggttttggggggtgggttttttttttttttgmssmggttttttg...',
  'gttttttttggggggggggttttttttttttttgmsmmgggtttttg...',
  'gttttttttttggggggggtttttttttttttttgmsmggggttttg...',
  'gttttttttttggttttgtttttttttttttttttggggggggtttg...',
  'gttttttttttggttttttttttttttttttttttttttttggtttg...',
  'gtttttttttttgttttttttttttttttttttttttttttggggtg...',
  'ggggggggggggggggggggggggggggggggggggggggggggggg...'
];
const FX0 = -486, FZ0 = -445, FC = 2;
const hip = { gw: 0, tri: false }, open = { gw: 99, tri: false };
/** the road behind WACCBIP (corrections: owner:waccbip-back-road): the boundary walls stand 6 m west of its middle */
const ROAD: [number, number][] = [[-542.8, -320.0], [-517.9, -320.0], [-501.5, -319.0], [-446.3, -315.3], [-418.4, -313.5], [-382.5, -309.5], [-352.5, -308.9], [-312, -308.0], [-292, -306.6], [-284.6, -304.6]];
const fenceX = (z: number) => {
  for (let i = 0; i < ROAD.length - 1; i++) { const [za, xa] = ROAD[i], [zb, xb] = ROAD[i + 1]; if (z >= za && z <= zb) return xa + ((xb - xa) * (z - za)) / (zb - za) - 6; }
  return (z < ROAD[0][0] ? ROAD[0][1] : ROAD[ROAD.length - 1][1]) - 6;
};

// ---------- facades ----------
const WHITE = '#f3f2ec', KHAKI = '#d6c38b', CREAM = '#eee3c4', BRICK_T = '#b1603e', WOOD = '#4e2f1f', LAVENDER = '#a9a3dc', TILE_BR = '#9a4a36', TILE_RED = '#b5443a', TILE_OR = '#c4683f', TILE_DK = '#5e3a2c';
/** white render over a khaki base, wide dark windows (St. Thomas Aquinas, photos 2 and 3) */
const darkWin = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#dcd8cc'; g.fillRect(x - 6, y - 6, w + 12, h + 12);
  g.fillStyle = '#1a1714'; g.fillRect(x, y, w, h);
  g.fillStyle = '#2c2621'; for (let i = 1; i < 3; i++) g.fillRect(x + (w * i) / 3 - 2, y, 4, h);
};
/** a window in a dark brown wooden frame, glass behind, a white sill (St. Thomas Aquinas, the owner's photos) */
const brownWin = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cols = 2) => {
  g.fillStyle = 'rgba(90,80,70,0.3)'; g.fillRect(x - 6, y - 5, w + 12, h + 10);
  g.fillStyle = '#4a2e1f'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  const gl = g.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, '#5d6a72'); gl.addColorStop(1, '#262b2e');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = '#4a2e1f'; for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - 2, y, 4, h);
  g.fillRect(x, y + h * 0.3, w, 3);
  g.fillStyle = '#f0ede4'; g.fillRect(x - 7, y + h + 4, w + 14, 5);
};
/** glass louvre blade windows in white frames (the house's upper floor, the owner's photo) */
const louvreGlass = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = 'rgba(90,80,70,0.25)'; g.fillRect(x - 6, y - 5, w + 12, h + 10);
  g.fillStyle = '#f2f1ec'; g.fillRect(x - 5, y - 5, w + 10, h + 10);
  g.fillStyle = '#2f3438'; g.fillRect(x, y, w, h);
  for (let t = y + 3; t < y + h - 2; t += 9) { g.fillStyle = '#8fa1ab'; g.fillRect(x + 2, t, w - 4, 5); g.fillStyle = '#c9d4d9'; g.fillRect(x + 2, t, w - 4, 1); }
  g.fillStyle = '#f2f1ec'; g.fillRect(x + w / 2 - 2, y, 4, h);
};
const ST_WALL: Style = {
  bay: 4.2, up: [[40, 60, 176, 110]], ground: [[40, 256 + 104, 176, 100]],
  draw: (g) => {
    render(g, WHITE); speckle(g, 0, 0, 256, 512, 400, ['rgba(140,134,120,0.12)']);
    g.fillStyle = 'rgba(150,146,136,0.45)'; g.fillRect(0, 0, 2, 512); g.fillRect(254, 0, 2, 512);
    brownWin(g, 40, 60, 176, 110, 3);
    g.fillStyle = KHAKI; g.fillRect(0, 512 - 92, 256, 92); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 512 - 94, 256, 2);
    brownWin(g, 52, 256 + 92, 152, 104, 3);
  },
};
/** the church's own walls: tall narrow windows in white surrounds */
const ST_NAVE: Style = {
  bay: 3.6, up: [[100, 30, 56, 200]], ground: [[100, 256 + 40, 56, 150]],
  draw: (g) => { render(g, WHITE); speckle(g, 0, 0, 256, 512, 300, ['rgba(140,134,120,0.12)']); brownWin(g, 100, 30, 56, 200, 1); brownWin(g, 100, 256 + 40, 56, 150, 1); g.fillStyle = KHAKI; g.fillRect(0, 512 - 60, 256, 60); },
};
/** the church's front to the court: white over the yellow-beige base (its door, windows and window are modelled) */
const ST_FRONT: Style = { bay: 4, up: [], ground: [], draw: (g) => { render(g, WHITE); speckle(g, 0, 0, 256, 512, 300, ['rgba(140,134,120,0.12)']); g.fillStyle = KHAKI; g.fillRect(0, 512 - 44, 256, 44); } };
/** the house's ground floor: cream over a base of terracotta brick, brown-framed windows (photo 2) */
const HOUSE_GF: Style = {
  bay: 3.4, up: [], ground: [[64, 256 + 70, 128, 100]],
  draw: (g) => {
    render(g, WHITE); speckle(g, 0, 0, 256, 512, 300, ['rgba(140,130,110,0.12)']);
    brownWin(g, 64, 256 + 70, 128, 100, 3);
    g.fillStyle = BRICK_T; g.fillRect(0, 512 - 64, 256, 64);
    g.fillStyle = 'rgba(80,40,25,0.45)'; for (let y = 512 - 64; y < 512; y += 8) g.fillRect(0, y, 256, 1);
    for (let y = 512 - 64, r = 0; y < 512; y += 8, r++) for (let x = (r % 2) * 16; x < 256; x += 32) g.fillRect(x, y, 1, 8);
  },
};
/** the house's upper floor: cream, glass louvre windows in white frames (photo 3), shown on the ground half (a block
 *  holding only the upper storey) */
const HOUSE_UP: Style = {
  bay: 3.3, up: [], ground: [[60, 256 + 60, 136, 120]],
  draw: (g) => { render(g, CREAM); speckle(g, 0, 0, 256, 512, 300, ['rgba(140,130,110,0.12)']); louvreGlass(g, 60, 256 + 60, 136, 120); },
};
/** the house's upper floor: white, big glass windows in dark brown frames (the owner's photo of its open porch) */
const HOUSE_UPW: Style = {
  bay: 3.6, up: [], ground: [[50, 256 + 56, 156, 128]],
  draw: (g) => { render(g, WHITE); speckle(g, 0, 0, 256, 512, 300, ['rgba(140,134,120,0.12)']); brownWin(g, 50, 256 + 56, 156, 128, 2); },
};
/** behind the verandah: cream over the yellow-beige base, a brown door and a window to a bay */
const HOUSE_VER: Style = {
  bay: 3.3, up: [], ground: [[30, 256 + 50, 70, 206], [140, 256 + 80, 90, 100]],
  draw: (g) => {
    render(g, CREAM); g.fillStyle = KHAKI; g.fillRect(0, 512 - 50, 256, 50);
    g.fillStyle = '#3a2418'; g.fillRect(30, 256 + 50, 70, 206); g.fillStyle = '#5a3826'; g.fillRect(36, 256 + 56, 58, 200);
    brownWin(g, 140, 256 + 80, 90, 100, 2);
  },
};
/** the house west of it: two floors, dark windows in white surrounds, the khaki base */
const ST_HOUSE: Style = {
  bay: 3.4, up: [[78, 70, 100, 110]], ground: [[78, 256 + 76, 100, 116]],
  draw: (g) => { render(g, WHITE); darkWin(g, 78, 70, 100, 110); darkWin(g, 78, 256 + 76, 100, 116); g.fillStyle = KHAKI; g.fillRect(0, 512 - 50, 256, 50); },
};
/** the Interdenominational Church's walls: white, louvred windows, a lavender band low down */
const louvred = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#e7e4dc'; g.fillRect(x - 6, y - 6, w + 12, h + 12);
  g.fillStyle = '#2a2a2c'; g.fillRect(x, y, w, h);
  g.fillStyle = '#5b5d63'; for (let t = y + 4; t < y + h; t += 10) g.fillRect(x + 3, t, w - 6, 4);
};
const LIC_WALL: Style = {
  bay: 3.8, up: [[70, 70, 116, 90]], ground: [[70, 256 + 70, 116, 100]],
  draw: (g) => {
    render(g, WHITE); speckle(g, 0, 0, 256, 512, 300, ['rgba(140,134,120,0.12)']);
    louvred(g, 70, 70, 116, 90); louvred(g, 70, 256 + 70, 116, 100);
    g.fillStyle = LAVENDER; g.fillRect(0, 512 - 56, 256, 56);
  },
};
/** the cross-shaped block: two floors, the ground floor lit through glazed doors */
const LIC_BLOCK: Style = {
  bay: 3.4, up: [[70, 64, 116, 96]], ground: [[54, 256 + 50, 148, 180]],
  draw: (g) => {
    render(g, WHITE); louvred(g, 70, 64, 116, 96);
    g.fillStyle = '#d9d4c4'; g.fillRect(48, 256 + 44, 160, 212);
    g.fillStyle = '#f2e3b8'; g.fillRect(54, 256 + 50, 148, 180);
    g.fillStyle = '#4a4744'; g.fillRect(126, 256 + 50, 4, 180); g.fillRect(54, 256 + 110, 148, 3);
    g.fillStyle = LAVENDER; g.fillRect(0, 512 - 30, 256, 30);
  },
};

const frameOf = (O: [number, number]) => ({
  X: (x: number) => x - O[0], Z: (z: number) => z - O[1],
  B: (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(x0 - O[0], x1 - O[0], y0, y1, z0 - O[1], z1 - O[1]),
  M: (x: number, z: number): [number, number] => [x - O[0], z - O[1]],
});

// ---------- St. Thomas Aquinas Catholic Church ----------
const SO: [number, number] = [-360, -330];
const ST_ROOF = '#93392f', MAROON_T = '#6e2420';
const NAVE = [-372.0, -346.5, -345.0, -312.0], PORCH = [-364.85, -353.65, -312.0, -304.0];
const AN_E = [-346.5, -336.0, -350.5, -321.0], AN_N = [-382.0, -346.5, -350.5, -345.0], AN_W = [-382.0, -372.0, -345.0, -329.0];
const HOUSE_N = [-397.0, -375.5, -326.0, -284.1], HOUSE_S = [-389.6, -371.0, -284.1, -251.0], LODGE = [-392.0, -384.0, -354.0, -343.0];
const SST = 3.6;
/** the east range (owner: it is the two-storey building with the verandah, facing the back of WACCBIP): its ground
 *  floor stands back to AE_VX behind the verandah; the house's open porch under the balcony (owner's photo) is HP, in
 *  front of the north part's east face where the south part stands forward */
const AE_VX = -338.6, HP = [-375.5, -371.0, -294.0, -284.1];
const stThomas: Spec = (() => {
  const { X, Z, B } = frameOf(SO);
  const R = (r: number[], floors: number, more: object = {}) => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors, ...more });
  return {
    name: 'St. Thomas Aquinas Catholic Church',
    axis: [1, 0], origin: SO, storey: SST, style: ST_WALL, roofColor: ST_ROOF, fascia: WHITE, pitch: 0.42, plinth: '#c4b27d',
    replaces: [[-358, -330], [-385, -305], [-380, -265], [-388, -348.5], [-344.8, -349.1], [-380, -331.5]],
    blocks: [
      R(NAVE, 2, { roof: 'none', faces: { x0: ST_NAVE, x1: ST_NAVE, z0: ST_NAVE, z1: ST_FRONT } }),
      // the east range: two floors, its ground floor set back behind the verandah to the gravel car park (owner)
      R([AN_E[0], AE_VX, AN_E[2], AN_E[3]], 1, { roof: 'none', faces: { x1: HOUSE_VER } }),
      R(AN_E, 1, { roof: 'none', y: SST, plinth: CREAM, faces: { x0: HOUSE_UP, x1: HOUSE_UP, z0: HOUSE_UP, z1: HOUSE_UP } }),
      R(AN_N, 1, { roof: 'flat' }), R(AN_W, 1, { roof: 'flat' }),
      // the house west of the church: white over a terracotta brick base, brown-framed windows (owner's photo)
      R(HOUSE_N, 1, { roof: 'none', faces: { x0: HOUSE_GF, x1: HOUSE_GF, z0: HOUSE_GF, z1: HOUSE_GF } }),
      R(HOUSE_N, 1, { roof: 'none', y: SST, plinth: WHITE, faces: { x0: HOUSE_UPW, x1: HOUSE_UPW, z0: HOUSE_UPW, z1: HOUSE_UPW } }),
      R(HOUSE_S, 1, { roof: 'none', faces: { x0: HOUSE_GF, x1: HOUSE_GF, z0: HOUSE_GF, z1: HOUSE_GF } }),
      R(HOUSE_S, 1, { roof: 'none', y: SST, plinth: WHITE, faces: { x0: HOUSE_UPW, x1: HOUSE_UPW, z0: HOUSE_UPW, z1: HOUSE_UPW } }),
      R(LODGE, 1, { roofColor: '#6b4a3a', faces: { x0: ST_HOUSE, x1: ST_HOUSE, z0: ST_HOUSE, z1: ST_HOUSE } }),
    ],
    keep: [[X(-370), X(-338), Z(-304), Z(-288)], [X(-337), X(-329), Z(-353), Z(-345)], [X(AN_E[1]), X(-333), Z(-351), Z(-321)], [X(HP[0]), X(-369.5), Z(-296), Z(-284)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      const e1 = k.wallTop(1), e2 = k.wallTop(2);
      const { M } = frameOf(SO);
      // the church's roof (photo 1): its gable to the court on the south, hipped at the north; a white band under the
      // eaves along the sides, maroon barge boards up the gable
      k.roof.c = new THREE.Color(ST_ROOF);
      const top = hipRoof(k, M, NAVE[0] - 0.9, NAVE[1] + 0.9, NAVE[2] - 0.9, NAVE[3] + 0.35, e2, 0.42, 'z', [hip, open], c, MAROON_T);
      for (const [a, b, z0, z1] of [[NAVE[0] - 0.9, NAVE[1] + 0.9, NAVE[2] - 0.9, NAVE[2] - 0.8], [NAVE[0] - 0.9, NAVE[0] - 0.8, NAVE[2] - 0.9, NAVE[3] + 0.35], [NAVE[1] + 0.8, NAVE[1] + 0.9, NAVE[2] - 0.9, NAVE[3] + 0.35]]) c.push([B(a, b, e2 - 0.55, e2 + 0.05, z0, z1), WHITE]);
      const xm = (NAVE[0] + NAVE[1]) / 2, fz = NAVE[3];
      c.push([tri2([X(NAVE[0] - 0.9), e2 - 0.02, Z(fz) + 0.02], [X(NAVE[1] + 0.9), e2 - 0.02, Z(fz) + 0.02], [X(xm), top - 0.1, Z(fz) + 0.02]), WHITE]);
      // the front stepped: the middle of the gable wall stands forward between two broad piers
      for (const x of [xm - 6.2, xm + 6.2]) c.push([B(x - 0.5, x + 0.5, 0, e2 + 0.2, fz, fz + 0.35), WHITE], [B(x - 0.52, x + 0.52, 0, 1.0, fz, fz + 0.37), KHAKI]);
      // the stained-glass window high in the gable, in a dark frame
      const wy = e2 + 0.4;
      k.plain.push([B(xm - 1.0, xm + 1.0, wy - 0.12, wy + 2.62, fz + 0.02, fz + 0.06), '#2e2622']);
      for (const [a, b, col] of [[-0.9, -0.3, '#3a5a9a'], [-0.3, 0.3, '#c8a23a'], [0.3, 0.9, '#9a3a3a']] as [number, number, string][]) k.plain.push([B(xm + a, xm + b, wy, wy + 2.5, fz + 0.06, fz + 0.08), col]);
      for (const y of [wy + 0.8, wy + 1.65]) k.plain.push([B(xm - 0.9, xm + 0.9, y, y + 0.06, fz + 0.08, fz + 0.1), '#2e2622']);
      // the porch (photo 1): a steep gable roof of maroon sheets on two pairs of round columns, white over a yellow
      // foot, the timber ceiling under it; the wooden double door (blue) in the front, windows either side; a step
      const [p0, p1, pz0, pz1] = PORCH, pe = 3.7;
      k.roof.c = new THREE.Color('#8a2e28');
      const ptop = hipRoof(k, M, p0 - 0.5, p1 + 0.5, pz0, pz1 + 0.4, pe, 0.62, 'z', [open, open], c, MAROON_T);
      const pmx = (p0 + p1) / 2;
      c.push([tri2([X(p0 - 0.3), pe - 0.05, Z(pz1) + 0.2], [X(p1 + 0.3), pe - 0.05, Z(pz1) + 0.2], [X(pmx), ptop - 0.25, Z(pz1) + 0.2]), '#5a3826']);
      for (let i = 1; i < 8; i++) { const x = p0 - 0.3 + ((p1 - p0 + 0.6) * i) / 8, h = (ptop - 0.25 - pe) * (1 - Math.abs(x - pmx) / ((p1 - p0) / 2 + 0.3)); if (h > 0.1) k.plain.push([B(x - 0.03, x + 0.03, pe - 0.05, pe - 0.05 + h, pz1 + 0.21, pz1 + 0.23), '#3e2618']); }
      c.push([B(p0 - 0.4, p1 + 0.4, pe - 0.3, pe, pz1 - 0.3, pz1 + 0.3), WHITE]);
      for (const x of [p0 + 0.4, p0 + 1.35, p1 - 1.35, p1 - 0.4]) {
        k.plain.push([new THREE.CylinderGeometry(0.3, 0.3, pe - 0.3 - 1.2, 14).translate(X(x), 1.2 + (pe - 1.5) / 2, Z(pz1 - 0.4)), WHITE]);
        k.plain.push([new THREE.CylinderGeometry(0.31, 0.31, 1.2, 14).translate(X(x), 0.6, Z(pz1 - 0.4)), KHAKI]);
        SOLIDS.add(x, pz1 - 0.4, 0.35);
      }
      c.push([B(p0 - 0.6, p1 + 0.6, 0, 0.15, pz0, pz1 + 0.3), '#c9c2b2']);
      k.plain.push([B(xm - 1.3, xm + 1.3, 0.15, 3.1, fz, fz + 0.05), WOOD]);
      for (const dx of [-0.65, 0.65]) for (const y of [0.5, 1.8]) k.plain.push([B(xm + dx - 0.5, xm + dx + 0.5, y, y + 1.0, fz + 0.05, fz + 0.07), '#6a4230']);
      k.plain.push([B(xm - 0.02, xm + 0.02, 0.15, 3.1, fz + 0.05, fz + 0.08), '#2a1a12']);
      for (const x of [xm - 3.9, xm + 3.9]) {
        k.plain.push([B(x - 0.9, x + 0.9, 1.0, 2.6, fz + 0.36, fz + 0.4), '#4a2e1f'], [B(x - 0.8, x + 0.8, 1.1, 2.5, fz + 0.4, fz + 0.42), '#2c3236']);
      }
      // the low range round it: a parapet, a white railing round its roof
      for (const r of [AN_N, AN_W]) {
        c.push([B(r[0], r[1], e1, e1 + 0.5, r[2], r[2] + 0.2), WHITE], [B(r[0], r[1], e1, e1 + 0.5, r[3] - 0.2, r[3]), WHITE]);
        c.push([B(r[0], r[0] + 0.2, e1, e1 + 0.5, r[2], r[3]), WHITE], [B(r[1] - 0.2, r[1], e1, e1 + 0.5, r[2], r[3]), WHITE]);
      }
      const rail = (ax: number, az: number, bx: number, bz: number) => {
        const len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 1.2));
        k.plain.push([new THREE.BoxGeometry(len, 0.05, 0.05).rotateY(-Math.atan2(bz - az, bx - ax)).translate(X((ax + bx) / 2), e1 + 1.45, Z((az + bz) / 2)), '#f4f4f2']);
        for (let i = 0; i <= n; i++) { const x = ax + ((bx - ax) * i) / n, z = az + ((bz - az) * i) / n; k.plain.push([B(x - 0.03, x + 0.03, e1 + 0.5, e1 + 1.45, z - 0.03, z + 0.03), '#f4f4f2']); }
      };
      rail(AN_N[0] + 0.1, AN_N[2] + 0.1, AN_N[1] - 0.1, AN_N[2] + 0.1);
      // the white screen of pierced blocks south of the range, a coping and piers
      panel(SO, k, pierced(), -338.0, -321.0, -338.0, -313.5, 0.3, 4.4, 0.4);
      c.push([B(-338.2, -337.8, 4.4, 4.6, -321.0, -313.5), WHITE], [B(-338.25, -337.75, 0, 0.3, -321.0, -313.5), KHAKI]);
      for (const z of [-321.0, -313.7]) c.push([B(-338.3, -337.7, 0, 4.6, z, z + 0.2), WHITE]);
      for (let z = -321; z <= -313.5; z += 0.4) SOLIDS.add(-338.0, z, 0.25);
      // the covered walk at the range's north-east corner: a flat canopy on posts, a black railing between them
      c.push([B(-336.0, -329.5, 2.9, 3.15, -352.5, -346.0), WHITE]);
      for (const [x, z] of [[-329.8, -352.2], [-329.8, -346.3], [-333, -352.2]]) { c.push([B(x - 0.15, x + 0.15, 0, 2.9, z - 0.15, z + 0.15), WHITE]); SOLIDS.add(x, z, 0.25); }
      for (const y of [0.4, 0.9]) k.plain.push([B(-329.85, -329.75, y, y + 0.04, -352.2, -346.3), '#161616']);
      for (let z = -352.2; z < -346.3; z += 0.15) k.plain.push([B(-329.83, -329.77, 0.1, 0.94, z, z + 0.02), '#161616']);
      // the tall white fins on the church's north-east (photo 3)
      for (let x = -353.5; x <= -347.4; x += 0.85) c.push([B(x - 0.13, x + 0.13, e1, e2 - 0.75, NAVE[2] - 0.7, NAVE[2]), WHITE]);
      // the arched wooden door (blue) in the east range's south end, steps; an air-conditioner beside it (photo 1)
      { const dx = -341.6, dz = AN_E[3];
        const arch = new THREE.Shape(); arch.moveTo(-0.75, 0); arch.lineTo(0.75, 0); arch.lineTo(0.75, 1.9); arch.absarc(0, 1.9, 0.75, 0, Math.PI, false); arch.lineTo(-0.75, 0);
        k.plain.push([new THREE.ShapeGeometry(arch).translate(X(dx), 0.5, Z(dz) + 0.03), WOOD]);
        const ring = new THREE.Shape(); ring.absarc(0, 1.9, 1.0, 0, Math.PI, false); ring.lineTo(-0.75, 1.9); ring.absarc(0, 1.9, 0.75, Math.PI, 0, true); ring.lineTo(1.0, 1.9);
        k.plain.push([new THREE.ShapeGeometry(ring).translate(X(dx), 0.5, Z(dz) + 0.04), '#3a7bd0']);
        for (let i = 0; i < 3; i++) c.push([B(dx - 1.1 - i * 0.2, dx + 1.1 + i * 0.2, 0, 0.5 - i * 0.16, dz, dz + 0.4 + i * 0.35), '#cfcac0']);
        k.plain.push([B(-338.6, -337.8, 2.6, 3.15, dz, dz + 0.3), '#e9ebeb']); }
      // the court before the church (photo 1): concrete paving in big squares (owner), grass in the joints; the
      // lawn on its west behind a white kerb, flowering oleanders by the church
      const slabs = canvas(256, 256, (g) => {
        // (owner: concrete paving in squares, not red soil) grey joints with a little grass in them
        g.fillStyle = '#8d8a82'; g.fillRect(0, 0, 256, 256);
        speckle(g, 0, 0, 256, 256, 500, ['#6e8a3c', '#7c9445']);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
          const sh = ['#cbc6ba', '#c2bdb1', '#d1ccc0', '#c6c1b5'][(i * 3 + j) % 4];
          g.fillStyle = sh; g.fillRect(i * 64 + 3, j * 64 + 3, 58, 58);
          speckle(g, i * 64 + 3, j * 64 + 3, 58, 58, 80, ['rgba(90,86,78,0.18)', 'rgba(240,236,228,0.25)']);
        }
      });
      slabs.wrapS = slabs.wrapT = THREE.RepeatWrapping; slabs.repeat.set(26 / 4, 15 / 4);
      const court = new THREE.Mesh(new THREE.PlaneGeometry(26, 15).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: slabs, roughness: 0.95 }));
      court.position.set(X(-349), 0.05, Z(-296.75)); court.receiveShadow = true; k.meshes.push(court);
      k.plain.push([B(-368.5, -362, 0.02, 0.07, -311.5, -289.5), '#6f8f3c'], [B(-362.15, -361.85, 0, 0.18, -311.5, -289.5), '#f2f2ee']);
      { const gg = garden([-370, -355, -315, -288]); gg.reseed(91);
        for (const [x, z] of [[-367, -310], [-365.6, -309.2], [-367.4, -307.6], [-365.2, -306.8]]) { gg.bush(k, X(x), Z(z), 0.8); k.plain.push([new THREE.IcosahedronGeometry(0.35, 0).translate(X(x + 0.3), 1.2, Z(z)), '#e98aa8']); }
        for (const [x, z] of [[-357.2, -304.6], [-362.8, -304.6], [-348.5, -321.6]]) { k.plain.push([new THREE.CylinderGeometry(0.28, 0.2, 0.5, 10).translate(X(x), 0.25, Z(z)), '#efeee8'], [new THREE.IcosahedronGeometry(0.35, 0).translate(X(x), 0.75, Z(z)), '#4f8a35']); } }
      // ----- the house west of the church: its maroon-edged red tile hip roofs over both parts
      k.roof.c = new THREE.Color(TILE_RED);
      hipRoof(k, M, HOUSE_N[0] - 0.8, HOUSE_N[1] + 0.8, HOUSE_N[2] - 0.8, HOUSE_N[3] + 0.4, e2, 0.42, 'z', [hip, open], c, MAROON_T);
      hipRoof(k, M, HOUSE_S[0] - 0.8, HOUSE_S[1] + 0.8, HOUSE_S[2] - 0.4, HOUSE_S[3] + 0.8, e2, 0.42, 'z', [open, hip], c, MAROON_T);
      c.push([B(HOUSE_N[1] + 0.8, HOUSE_N[1] + 0.9, e2 - 0.35, e2 + 0.05, HOUSE_N[2] - 0.8, HOUSE_N[3] + 0.4), MAROON_T], [B(HOUSE_S[1] + 0.8, HOUSE_S[1] + 0.9, e2 - 0.35, e2 + 0.05, HOUSE_S[2] - 0.4, HOUSE_S[3] + 0.8), MAROON_T]);
      // its open porch (owner's photo; the three entrances in blue): before the north part's east face where the south
      // part stands forward, under the balcony: two tall round columns at its outer corner, white over a yellow foot,
      // the three open entrances with glass doors behind them, the balcony's band of terracotta brick and brown railing,
      // the roof over it; a raised paved platform, steps down to the yard, potted plants
      const [q0, q1, r0, r1] = HP;
      for (const x of [q1 - 0.4, q1 - 1.5]) {
        k.plain.push([new THREE.CylinderGeometry(0.3, 0.3, e2 - 1.75, 14).translate(X(x), 1.75 + (e2 - 1.75) / 2, Z(r0 + 0.4)), WHITE], [new THREE.CylinderGeometry(0.31, 0.31, 1.2, 14).translate(X(x), 0.55 + 0.6, Z(r0 + 0.4)), KHAKI]);
        SOLIDS.add(x, r0 + 0.4, 0.35);
      }
      c.push([B(q0, q1, SST - 0.1, SST + 0.25, r0, r1), '#e8e4d8']);
      c.push([B(q1 - 0.25, q1 + 0.05, SST + 0.25, SST + 0.8, r0, r1), BRICK_T], [B(q0, q1 + 0.05, SST + 0.25, SST + 0.8, r0 - 0.05, r0 + 0.2), BRICK_T]);
      for (const y of [SST + 1.1, SST + 1.5]) k.plain.push([B(q1 - 0.14, q1 - 0.08, y, y + 0.05, r0, r1), '#5a2a22'], [B(q0, q1, y, y + 0.05, r0 + 0.08, r0 + 0.14), '#5a2a22']);
      for (let z = r0 + 0.3; z < r1; z += 0.25) k.plain.push([B(q1 - 0.13, q1 - 0.09, SST + 0.8, SST + 1.55, z - 0.015, z + 0.015), '#5a2a22']);
      for (let x = q0 + 0.2; x < q1; x += 0.25) k.plain.push([B(x - 0.015, x + 0.015, SST + 0.8, SST + 1.55, r0 + 0.09, r0 + 0.13), '#5a2a22']);
      c.push([B(q0, q1 + 0.6, e2 - 0.1, e2 + 0.15, r0 - 0.6, r1), '#e8e4d8'], [B(q1 + 0.5, q1 + 0.62, e2 - 0.35, e2 + 0.15, r0 - 0.6, r1), MAROON_T], [B(q0, q1 + 0.62, e2 - 0.35, e2 + 0.15, r0 - 0.62, r0 - 0.5), MAROON_T]);
      for (const [za, zb] of [[r0 + 0.8, r0 + 2.9], [r0 + 3.6, r0 + 5.7], [r0 + 6.4, r1 - 0.8]] as [number, number][]) {
        k.plain.push([B(q0 - 0.02, q0, 0.55, 3.1, za, zb), '#2a2f33']);
        k.glass.push(B(q0, q0 + 0.02, 0.6, 3.05, za + 0.05, zb - 0.05));
        k.plain.push([B(q0, q0 + 0.03, 0.55, 3.1, (za + zb) / 2 - 0.02, (za + zb) / 2 + 0.02), '#5a3826']);
      }
      // the sliding glass door onto the balcony upstairs
      k.plain.push([B(q0 - 0.02, q0, SST + 0.45, SST + 2.9, r0 + 2.5, r0 + 7.0), '#4a2e1f']);
      k.glass.push(B(q0, q0 + 0.02, SST + 0.55, SST + 2.8, r0 + 2.6, r0 + 6.9));
      c.push([B(q0, q1 + 0.4, 0, 0.55, r0 - 0.2, r1), '#cfcac0']);
      for (let i = 0; i < 3; i++) c.push([B(q0 + 0.6, q1 + 0.4, 0, 0.55 - (i + 1) * 0.16, r0 - 0.2 - (i + 1) * 0.35, r0 - 0.2 - i * 0.35), '#cfcac0']);
      for (const [x, z] of [[q1 - 0.2, r0 + 2.2], [q1 + 0.1, r1 - 1.2], [q0 + 0.6, r0 - 0.9]]) k.plain.push([new THREE.CylinderGeometry(0.3, 0.22, 0.55, 10).translate(X(x), z > r0 ? 0.82 : 0.27, Z(z)), '#f2f1ec'], [new THREE.IcosahedronGeometry(0.45, 0).translate(X(x), z > r0 ? 1.3 : 0.75, Z(z)), '#4f8a35']);
      // the narrow yard of grey pavers between the house and the church; air-conditioners on the house
      k.plain.push([B(HOUSE_N[1], NAVE[0], 0.02, 0.06, HOUSE_N[2], r0 - 0.2), '#8f9294']);
      for (const z of [-312.5, -305.0, -299.0]) k.plain.push([B(HOUSE_N[1], HOUSE_N[1] + 0.3, SST + 2.2, SST + 2.75, z - 0.4, z + 0.4), '#e9ebeb']);
      // ----- the east range's verandah (owner: the building facing the back of WACCBIP; photo): dark brown square posts
      // under the upper floor, its floor raised, steps up to the doors with black railings of scrolls, beds of red,
      // orange and yellow flowers behind a white kerb, a balcony at the south end; the gravel car park before it
      const vx = AN_E[1], vy = 0.75, V0 = AN_E[2], V1 = AN_E[3];
      k.roof.c = new THREE.Color(ST_ROOF);
      hipRoof(k, M, AN_E[0] - 0.4, AN_E[1] + 0.9, V0 - 0.4, V1 + 0.9, e2, 0.4, 'z', [hip, hip], c, MAROON_T);
      c.push([B(AN_E[1] + 0.8, AN_E[1] + 0.9, e2 - 0.35, e2 + 0.05, V0 - 0.4, V1 + 0.9), MAROON_T]);
      c.push([B(AE_VX, vx, 0, vy, V0, V1), '#cfc6b4'], [B(vx - 0.05, vx + 0.05, 0, vy + 0.02, V0, V1), '#f2f2ee']);
      c.push([B(AE_VX, vx, SST - 0.05, SST + 0.4, V0, V1), '#e8e4d8']);
      for (let z = V0 + 0.3; z <= V1 - 0.2; z += 3.3) { c.push([B(vx - 0.45, vx - 0.1, vy, SST, z - 0.18, z + 0.18), '#4a2a1e']); SOLIDS.add(vx - 0.27, z, 0.3); }
      const scroll = (x: number, z0: number, z1: number, y0: number, y1: number) => {
        // a black iron railing along z at x: posts, rails, scrolls between them, rising from y0 to y1
        const n = Math.max(2, Math.round(Math.abs(z1 - z0) / 0.5));
        for (let i = 0; i <= n; i++) { const t = i / n, z = z0 + (z1 - z0) * t, y = y0 + (y1 - y0) * t; k.plain.push([B(x - 0.02, x + 0.02, y, y + 0.95, z - 0.02, z + 0.02), '#121212']); }
        const len = Math.hypot(z1 - z0, y1 - y0), ang = Math.atan2(y1 - y0, Math.abs(z1 - z0)) * Math.sign(z1 - z0);
        for (const h of [0.15, 0.95]) k.plain.push([new THREE.BoxGeometry(0.04, 0.05, len).rotateX(-ang).translate(X(x), (y0 + y1) / 2 + h, Z((z0 + z1) / 2)), '#121212']);
        for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, z = z0 + (z1 - z0) * t, y = y0 + (y1 - y0) * t + 0.55; k.plain.push([new THREE.TorusGeometry(0.16, 0.018, 5, 14).rotateY(Math.PI / 2).translate(X(x), y, Z(z)), '#121212']); }
      };
      const STEPS = [-346.0, -336.0, -326.0];
      for (const zc of STEPS) {
        for (let i = 0; i < 4; i++) c.push([B(vx + i * 0.32, vx + (i + 1) * 0.32, 0, vy - i * 0.19, zc - 0.9, zc + 0.9), '#d4cdbd']);
        for (const zz of [zc - 0.95, zc + 0.95]) {
          const n = 6;
          for (let i = 0; i <= n; i++) { const x = vx + 1.28 * (1 - i / n), y = vy * (i / n); k.plain.push([B(x - 0.02, x + 0.02, y, y + 0.95, zz - 0.02, zz + 0.02), '#121212']); }
          for (const h of [0.2, 0.95]) k.plain.push([new THREE.BoxGeometry(1.45, 0.05, 0.04).rotateZ(-Math.atan2(vy, 1.28)).translate(X(vx + 0.64), vy / 2 + h, Z(zz)), '#121212']);
          for (let i = 0; i < 3; i++) k.plain.push([new THREE.TorusGeometry(0.15, 0.018, 5, 14).translate(X(vx + 0.2 + i * 0.42), vy * (1 - (0.2 + i * 0.42) / 1.28) + 0.55, Z(zz)), '#121212']);
        }
        scroll(vx - 0.05, zc + 1.0, Math.min(V1 - 0.2, zc + 4.0), vy, vy); scroll(vx - 0.05, Math.max(V0 + 0.2, zc - 4.0), zc - 1.0, vy, vy);
      }
      for (let z = V0 + 0.5; z < V1 - 0.4; z += 0.9) {
        if (STEPS.some((q) => Math.abs(z - q) < 1.3)) continue;
        k.plain.push([new THREE.IcosahedronGeometry(0.42, 0).scale(1.2, 0.7, 1).translate(X(vx + 0.75), 0.3, Z(z)), (Math.round(z * 2) % 3) ? '#3f6f2c' : '#355f26']);
        k.plain.push([new THREE.IcosahedronGeometry(0.16, 0).translate(X(vx + 0.65 + (z % 0.3)), 0.62, Z(z + 0.2)), ['#d93a2a', '#f08a2a', '#e8c23a'][Math.abs(Math.round(z * 3)) % 3]]);
      }
      k.plain.push([B(vx + 0.2, vx + 1.4, 0, 0.12, V0 + 0.2, V1 - 0.2), '#f2f2ee']);
      c.push([B(vx, vx + 1.6, SST + 0.25, SST + 0.45, V1 - 4.0, V1), '#e8e4d8'], [B(vx + 1.45, vx + 1.6, SST + 0.45, SST + 1.4, V1 - 4.0, V1), WHITE]);
      const gravel = canvas(128, 128, (g) => { g.fillStyle = '#a6a29a'; g.fillRect(0, 0, 128, 128); speckle(g, 0, 0, 128, 128, 2600, ['#8c8880', '#bdb9b0', '#79756e', '#c9c5bc']); });
      gravel.wrapS = gravel.wrapT = THREE.RepeatWrapping; gravel.repeat.set(2, 12);
      for (const [x0, x1] of [[vx + 1.4, -332.3], [-327.4, -318.4]]) {
        const gr = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, V1 - V0 - 0.6).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: gravel, roughness: 1 }));
        gr.position.set(X((x0 + x1) / 2), 0.045, Z((V0 + V1) / 2)); gr.receiveShadow = true; k.meshes.push(gr);
      }
      { const gg = garden([-375, -355, -260, -248]); gg.reseed(97); gg.tree(k, X(-360), Z(-252.5), 1.6); }
      // ----- along the road: a low white wall, dark grey piers, white railings stepped along the top (photo 2)
      const fence = (z0: number, z1: number) => {
        for (let z = z0; z < z1 - 0.1; z += 3.2) {
          const za = z, zb = Math.min(z1, z + 3.2), xa = fenceX(za), xb = fenceX(zb);
          k.plain.push([new THREE.BoxGeometry(0.28, 0.75, Math.hypot(zb - za, xb - xa)).rotateY(Math.atan2(xb - xa, zb - za)).translate(X((xa + xb) / 2), 0.375, Z((za + zb) / 2)), '#ecebe6']);
          c.push([B(xa - 0.25, xa + 0.25, 0, 1.75, za - 0.25, za + 0.25), '#5d6064']);
          const n = 12;
          for (let i = 1; i < n; i++) {
            const t = i / n, zz = za + (zb - za) * t, xx = xa + (xb - xa) * t, h = 0.75 + 0.8 + (Math.abs(i - n / 2) < 2 ? 0.25 : Math.abs(i - n / 2) < 4 ? 0.12 : 0);
            k.plain.push([B(xx - 0.02, xx + 0.02, 0.75, h, zz - 0.02, zz + 0.02), '#f4f4f2']);
          }
          for (const y of [0.85, 1.5]) k.plain.push([new THREE.BoxGeometry(0.05, 0.05, Math.hypot(zb - za, xb - xa)).rotateY(Math.atan2(xb - xa, zb - za)).translate(X((xa + xb) / 2), y, Z((za + zb) / 2)), '#f4f4f2']);
          for (let s = za; s <= zb; s += 0.4) SOLIDS.add(fenceX(s), s, 0.25);
        }
      };
      fence(-348.6, -288.5); fence(-277.0, -262.5);
      // the gateway where the service lane comes in from the road (owner: open, a metal gate of horizontal slats):
      // two leaves swung in against the inside of the fence
      const GN = -354.8, GS = -348.6;
      for (const z of [GN, GS]) c.push([B(fenceX(z) - 0.3, fenceX(z) + 0.3, 0, 2.0, z - 0.3, z + 0.3), '#5d6064']);
      const slatLeaf = (hz: number, dir: number) => {
        // hinged at the pier at hz, swung through a right angle: the leaf lies along -x (inside), dir: which side of the hinge
        const hx = fenceX(hz) - 0.3, w = (GS - GN) / 2 - 0.35, z = hz + dir * 0.35;
        k.plain.push([B(hx - w, hx, 0.1, 0.16, z - 0.03, z + 0.03), '#8d9196'], [B(hx - w, hx, 1.74, 1.8, z - 0.03, z + 0.03), '#8d9196']);
        for (const x of [hx - w, hx - 0.06]) k.plain.push([B(x, x + 0.06, 0.1, 1.8, z - 0.03, z + 0.03), '#8d9196']);
        for (let y = 0.24; y < 1.72; y += 0.12) k.plain.push([B(hx - w + 0.06, hx - 0.06, y, y + 0.08, z - 0.015, z + 0.015), '#b3b8bd']);
        for (let x = hx - w; x <= hx; x += 0.4) SOLIDS.add(x, z, 0.12);
      };
      slatLeaf(GN, 1); slatLeaf(GS, -1);
      for (const z of [-288.5, -277.0]) c.push([B(fenceX(z) - 0.3, fenceX(z) + 0.3, 0, 2.0, z - 0.3, z + 0.3), '#5d6064']);
      // ----- the wall of pierced blocks to the Interdenominational Church on the north (photo 3)
      const bz = -355.0, bx0 = -382.0, bx1 = fenceX(bz);
      panel(SO, k, pierced(), bx0, bz, bx1, bz, 0.35, 2.0, 0.4);
      c.push([B(bx0, bx1, 2.0, 2.15, bz - 0.15, bz + 0.15), '#cfccc4'], [B(bx0, bx1, 0, 0.35, bz - 0.12, bz + 0.12), '#9f9d97']);
      for (let x = bx0; x <= bx1; x += 3.0) c.push([B(x - 0.2, x + 0.2, 0, 2.2, bz - 0.2, bz + 0.2), '#bdbab2']);
      for (let x = bx0; x <= bx1; x += 0.4) SOLIDS.add(x, bz, 0.25);
      // the big rain tree south-east of the church and the trees round the car parks
      const g = garden([-400, -300, -360, -245]);
      g.reseed(61);
      g.tree(k, X(-327.5), Z(-307.5), 3.2);
      for (const [x, z, s] of [[-354, -273.5, 1.6], [-341, -260.5, 1.8], [-332, -264, 1.5], [-321.5, -305, 1.3]] as [number, number, number][]) g.tree(k, X(x), Z(z), s);
      for (const z of [-338, -330, -322]) g.palm(k, X(-339.5), Z(z), 5.5);
      stoneMesh(k, st);
      const m = new THREE.Mesh(merge(c), concrete(0.2));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

// ---------- Legon Interdenominational Church ----------
const IO: [number, number] = [-372, -410];
const MAIN = [-382.6, -351.4, -440.4, -412.8], HALL = [-400.8, -382.6, -440.4, -412.8], LINK = [-387.8, -378.4, -412.8, -401.0];
const WBLK = [-396.1, -384.9, -405.2, -389.3], CR_W = [-384.9, -375.0, -401.0, -387.0], CR_A = [-375.0, -355.5, -398.0, -372.8], CR_B = [-375.0, -358.0, -404.0, -398.0];
const SCAF = [-358.0, -349.0, -409.0, -397.0];
const IST = 3.8;
const lic: Spec = (() => {
  const { X, Z, B, M } = frameOf(IO);
  const R = (r: number[], floors: number, more: object = {}) => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors, ...more });
  return {
    name: 'Legon Interdenominational Church',
    axis: [1, 0], origin: IO, storey: IST, style: LIC_WALL, roofColor: TILE_OR, fascia: '#4a3328', pitch: 0.42, plinth: '#8f89c4',
    replaces: [[-370, -376], [-383, -406], [-390, -397]],
    blocks: [
      R(MAIN, 2, { roof: 'none' }), R(HALL, 1, { roof: 'hip', faces: { x0: LIC_WALL } }), R(LINK, 1), R(WBLK, 1, { pitch: 0.25 }),
      R(CR_W, 1, { faces: { z0: LIC_BLOCK, z1: LIC_BLOCK, x0: LIC_BLOCK } }), R(CR_A, 2, { faces: { x1: LIC_BLOCK, z1: LIC_BLOCK, x0: LIC_BLOCK } }), R(CR_B, 2),
      R(SCAF, 2, { roof: 'none' }),
    ],
    keep: [[X(-351.4), X(-345), Z(-440), Z(-413)], [X(-349), X(-345), Z(-409), Z(-397)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      const e2 = k.wallTop(2);
      // the church: a steep roof of dark brown tiles, its ridge east-west; white gables, the east one to the car park
      k.roof.c = new THREE.Color(TILE_DK);
      const top = hipRoof(k, M, MAIN[0] - 0.4, MAIN[1] + 0.9, MAIN[2] - 0.8, MAIN[3] + 0.8, e2, 0.62, 'x', [open, open], c, '#3a2a22');
      k.roof.c = new THREE.Color(TILE_OR);
      const zm = (MAIN[2] + MAIN[3]) / 2, ex = MAIN[1];
      for (const x of [MAIN[0], MAIN[1]]) c.push([tri2([X(x), e2 - 0.02, Z(MAIN[2])], [X(x), e2 - 0.02, Z(MAIN[3])], [X(x), top - 0.15, Z(zm)]), WHITE]);
      // the east gable (photo 5): the lavender pentagon round a fan window, louvred windows, the lavender band low down
      const pz0 = zm - 3.2, pz1 = zm + 3.2, f = X(ex) + 0.03;
      const pent = new THREE.Shape();
      // (shape x is -z: turned a quarter about y it faces east, on the gable)
      pent.moveTo(-Z(pz0), 2.6); pent.lineTo(-Z(pz1), 2.6); pent.lineTo(-Z(pz1), 10.4); pent.lineTo(-Z(zm), 12.6); pent.lineTo(-Z(pz0), 10.4); pent.lineTo(-Z(pz0), 2.6);
      k.plain.push([new THREE.ShapeGeometry(pent).rotateY(Math.PI / 2).translate(f, 0, 0), LAVENDER]);
      const fan = new THREE.Shape(); fan.absarc(0, 0, 2.0, 0, Math.PI, false); fan.lineTo(-2.0, 0);
      k.plain.push([new THREE.ShapeGeometry(fan).rotateY(Math.PI / 2).translate(f + 0.02, 9.4, Z(zm)), '#1d2230']);
      for (let i = 1; i < 6; i++) { const a = (i / 6) * Math.PI; k.plain.push([new THREE.BoxGeometry(0.06, 2.0, 0.08).translate(0, 1.0, 0).rotateX(a - Math.PI / 2).translate(f + 0.04, 9.4, Z(zm)), '#e8e6f2']); }
      k.plain.push([B(ex, ex + 0.05, 9.3, 9.45, pz0 + 1.2, pz1 - 1.2), '#e8e6f2']);
      for (const z of [zm - 8.2, zm + 8.2]) {
        k.plain.push([B(ex, ex + 0.04, 6.0, 7.2, z - 1.6, z + 1.6), '#26272b']);
        for (let y = 6.1; y < 7.15; y += 0.14) k.plain.push([B(ex + 0.04, ex + 0.07, y, y + 0.06, z - 1.55, z + 1.55), '#5b5d63']);
      }
      k.plain.push([B(ex, ex + 0.03, 2.6, 4.2, MAIN[2] + 0.5, pz0), LAVENDER], [B(ex, ex + 0.03, 2.6, 4.2, pz1, MAIN[3] - 0.5), LAVENDER]);
      // the entrance up from the car park: a landing before glazed doors between rubble-stone panels, two white ramps
      // sweeping down either side along the gable, their solid white parapets
      const LH = 1.2, ld = 3.4, lz0 = zm - 2.4, lz1 = zm + 2.4;
      c.push([B(ex, ex + ld, 0, LH, lz0, lz1), WHITE]);
      k.plain.push([B(ex, ex + 0.04, LH, LH + 2.8, zm - 1.6, zm + 1.6), '#2a2f38']);
      k.glass.push(B(ex + 0.04, ex + 0.06, LH + 0.1, LH + 2.7, zm - 1.5, zm + 1.5));
      for (const s of [-1, 1]) {
        st.push([B(ex, ex + 0.3, 0, 4.4, zm + s * 1.7 - 0.6, zm + s * 1.7 + 0.6), '#ffffff']);
        // the ramp: from the landing down to the car park, 7 m along the gable
        const za = s < 0 ? lz0 : lz1, zb = za + s * 7.0;
        const n = 14;
        for (let i = 0; i < n; i++) {
          const t0 = i / n, t1 = (i + 1) / n, y = LH * (1 - t1) + 0.02;
          c.push([B(ex, ex + ld, 0, Math.max(0.06, y), Math.min(za + (zb - za) * t0, za + (zb - za) * t1), Math.max(za + (zb - za) * t0, za + (zb - za) * t1)), '#d6d2c8']);
        }
        // its solid white parapet along the outer edge, stepping down with it
        for (let i = 0; i < n; i++) {
          const t0 = i / n, t1 = (i + 1) / n, y = LH * (1 - t0);
          c.push([B(ex + ld - 0.3, ex + ld, 0, y + 0.95, Math.min(za + (zb - za) * t0, za + (zb - za) * t1), Math.max(za + (zb - za) * t0, za + (zb - za) * t1)), WHITE]);
        }
        for (let z = Math.min(za, zb); z <= Math.max(za, zb); z += 0.5) SOLIDS.add(ex + ld - 0.15, z, 0.25);
      }
      c.push([B(ex + ld - 0.3, ex + ld, LH, LH + 1.0, lz0, lz1), WHITE]);
      for (let z = lz0; z <= lz1; z += 0.5) SOLIDS.add(ex + ld - 0.15, z, 0.25);
      // the gabled building in scaffolding south of it (photo 4): its gable faced in stone below two small windows
      k.roof.c = new THREE.Color(TILE_DK);
      const t2 = hipRoof(k, M, SCAF[0] - 0.4, SCAF[1] + 0.6, SCAF[2] - 0.6, SCAF[3] + 0.6, e2, 0.6, 'x', [open, open], c, '#3a2a22');
      k.roof.c = new THREE.Color(TILE_OR);
      const sm = (SCAF[2] + SCAF[3]) / 2;
      c.push([tri2([X(SCAF[1]), e2 - 0.02, Z(SCAF[2])], [X(SCAF[1]), e2 - 0.02, Z(SCAF[3])], [X(SCAF[1]), t2 - 0.12, Z(sm)]), WHITE]);
      const sp = new THREE.Shape();
      sp.moveTo(-Z(sm - 2.4), 0.4); sp.lineTo(-Z(sm + 2.4), 0.4); sp.lineTo(-Z(sm + 2.4), e2 + 0.6); sp.lineTo(-Z(sm), e2 + 2.2); sp.lineTo(-Z(sm - 2.4), e2 + 0.6); sp.lineTo(-Z(sm - 2.4), 0.4);
      st.push([new THREE.ExtrudeGeometry(sp, { depth: 0.12, bevelEnabled: false }).rotateY(Math.PI / 2).translate(X(SCAF[1]), 0, 0), '#ffffff']);
      for (const z of [sm - 0.9, sm + 0.9]) k.plain.push([B(SCAF[1] + 0.12, SCAF[1] + 0.15, 4.6, 5.4, z - 0.4, z + 0.4), '#2a2a2c']);
      // the scaffolding: steel tubes in two towers either side of the gable
      for (const zc of [SCAF[2] + 1.0, SCAF[3] - 1.0]) {
        for (const dx of [0.3, 1.5]) for (const dz of [-0.6, 0.6]) k.plain.push([B(SCAF[1] + dx - 0.03, SCAF[1] + dx + 0.03, 0, e2 + 1.5, zc + dz - 0.03, zc + dz + 0.03), '#8d9196']);
        for (let y = 1.6; y < e2 + 1.5; y += 1.8) k.plain.push([B(SCAF[1] + 0.3, SCAF[1] + 1.5, y - 0.03, y + 0.03, zc - 0.6, zc + 0.6), '#8d9196'], [B(SCAF[1] + 0.27, SCAF[1] + 1.53, y - 0.06, y, zc - 0.65, zc + 0.65), '#9a7a52']);
      }
      // the hedge along the church's south side, the trees and palms round the car park, the round planters in white kerbs
      const g = garden([-405, -300, -450, -350]);
      g.reseed(67);
      g.hedge(k, X(-378.0), Z(-410.0), X(-359.5), Z(-410.0));
      for (const [x, z] of [[-340.0, -424.0], [-324.5, -393.0], [-350.0, -385.0]]) {
        k.plain.push([new THREE.CylinderGeometry(2.0, 2.0, 0.3, 24).translate(X(x), 0.15, Z(z)), '#f2f1ec'], [new THREE.CylinderGeometry(1.8, 1.8, 0.32, 24).translate(X(x), 0.16, Z(z)), '#5f7e36']);
        g.palm(k, X(x), Z(z), 4.5);
        for (let a = 0; a < 6.2; a += 1.3) g.bush(k, X(x + Math.cos(a) * 1.2), Z(z + Math.sin(a) * 1.2), 0.45);
      }
      for (const [x, z, s] of [[-337.6, -393.0, 1.6], [-322.2, -378.5, 1.7], [-321.6, -366.0, 1.9], [-353.4, -414.5, 1.2], [-367, -366, 1.6], [-376, -364, 1.8], [-398, -380, 1.7], [-345, -446, 1.5]] as [number, number, number][]) g.tree(k, X(x), Z(z), s);
      // ----- along the road: a red brick wall on brick piers; the black iron gates hung on brick piers with globe lamps
      const brick = '#a4513a', brickD = '#8a4230';
      const gz0 = -386.5, gz1 = -377.5;
      const wallRun = (z0: number, z1: number) => {
        for (let z = z0; z < z1 - 0.1; z += 3.0) {
          const za = z, zb = Math.min(z1, z + 3.0), xa = fenceX(za), xb = fenceX(zb), len = Math.hypot(zb - za, xb - xa), ry = Math.atan2(xb - xa, zb - za);
          k.plain.push([new THREE.BoxGeometry(0.3, 1.2, len).rotateY(ry).translate(X((xa + xb) / 2), 0.6, Z((za + zb) / 2)), brick]);
          for (let y = 0.15; y < 1.2; y += 0.15) k.plain.push([new THREE.BoxGeometry(0.31, 0.015, len).rotateY(ry).translate(X((xa + xb) / 2), y, Z((za + zb) / 2)), '#c9a58f']);
          k.plain.push([new THREE.BoxGeometry(0.36, 0.08, len).rotateY(ry).translate(X((xa + xb) / 2), 1.24, Z((za + zb) / 2)), brickD]);
          c.push([B(xa - 0.3, xa + 0.3, 0, 1.75, za - 0.3, za + 0.3), brick]);
          for (let s = za; s <= zb; s += 0.4) SOLIDS.add(fenceX(s), s, 0.25);
        }
      };
      wallRun(-443.5, gz0); wallRun(gz1, -355.2);
      for (const z of [gz0, gz1]) {
        const x = fenceX(z);
        c.push([B(x - 0.45, x + 0.45, 0, 2.1, z - 0.45, z + 0.45), brick], [B(x - 0.5, x + 0.5, 2.1, 2.2, z - 0.5, z + 0.5), brickD]);
        k.plain.push([B(x - 0.48, x + 0.48, 1.2, 1.5, z - 0.46, z - 0.44), '#3a5aa8']);
        k.plain.push([new THREE.SphereGeometry(0.32, 14, 10).translate(X(x), 2.55, Z(z)), '#f6f6f2']);
      }
      // the gate: the north leaf closed across half the way, the south one swung back against the wall; arched tops
      const gx = fenceX((gz0 + gz1) / 2), gm = (gz0 + gz1) / 2;
      for (const [za, zb] of [[gm, gz1 - 0.45]] as [number, number][]) {
        k.plain.push([B(gx - 0.03, gx + 0.03, 0.1, 0.15, za, zb), '#141414'], [B(gx - 0.03, gx + 0.03, 1.6, 1.65, za, zb), '#141414']);
        for (let z = za; z <= zb; z += 0.14) k.plain.push([B(gx - 0.015, gx + 0.015, 0.1, 1.65 + 0.5 * Math.sin(((z - za) / (zb - za)) * Math.PI), z - 0.015, z + 0.015), '#141414']);
      }
      for (let i = 0; i <= 14; i++) { const x = gx - 0.45 - i * 0.28; k.plain.push([B(x - 0.015, x + 0.015, 0.1, 1.65 + 0.5 * Math.sin((i / 14) * Math.PI), gz0 + 0.5, gz0 + 0.53), '#141414']); }
      stoneMesh(k, st);
      const m = new THREE.Mesh(merge(c), concrete(0.2));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

// ---------- the Anglican church and its hall, north of the Interdenominational Church (owner's pictures 2 to 5) ----------
// The church (blue): one tall storey under a steep roof of maroon sheets with deep eaves, hipped at the west, its gable
// to the road on the east carrying the big stained-glass window (a cross, the figure in red) over three small arched
// windows; its long sides a band of pierced blocks under the eaves over white wall and windows between pillars. The
// hall (yellow): a tall single storey, cool white walls between pilasters, small windows high, air-conditioners, a
// maroon hip roof with a small louvred gablet at each end of its ridge; the arched glazed entrance in its north face
// to the paved court, steps; the two-storey block on its west under red tiles. Norfolk Island pines and bushy coconut
// palms; along the road a low red brick wall, white piers and maroon iron railings arched along their tops; the gates
// on red brick piers with white globe lamps: the drive's gate swung open, the one beside it shut (owner).
const MAROON = '#7a2f33', ANG_CREAM = '#efe4c6', HALL_W = '#e4e7e8', BRICK = '#a4513a', IRON = '#4a2620';
/** the church's long sides: pierced blocks under the eaves, white wall, a dark window between pillars */
const ANG_SIDE: Style = {
  bay: 3.2, up: [], ground: [[60, 256 + 150, 136, 70]],
  draw: (g) => {
    render(g, ANG_CREAM); speckle(g, 0, 0, 256, 512, 300, ['rgba(140,134,120,0.12)']);
    g.fillStyle = '#d8cdb0'; g.fillRect(14, 256 + 24, 228, 92);
    g.fillStyle = '#2a2622'; for (let x = 22; x < 236; x += 22) for (let y = 256 + 32; y < 256 + 110; y += 26) g.fillRect(x, y, 12, 16);
    g.fillStyle = '#f2e9cf'; g.fillRect(0, 0, 14, 512); g.fillRect(242, 0, 14, 512);
    g.fillStyle = 'rgba(120,116,104,0.35)'; g.fillRect(14, 0, 2, 512); g.fillRect(240, 0, 2, 512);
    darkWin(g, 60, 256 + 150, 136, 70);
  },
};
/** the church's east end to the road: plain white (the windows are modelled) */
const ANG_END: Style = { bay: 4, up: [], ground: [], draw: (g) => { render(g, ANG_CREAM); speckle(g, 0, 0, 256, 512, 300, ['rgba(140,134,120,0.12)']); g.fillStyle = '#cfcac0'; g.fillRect(0, 512 - 20, 256, 20); } };
/** the hall's walls: cool white between pilasters, a small window high */
const HALL_WALL: Style = {
  bay: 6.0, up: [], ground: [[96, 256 + 40, 64, 30]],
  draw: (g) => {
    render(g, HALL_W); speckle(g, 0, 0, 256, 512, 400, ['rgba(120,124,128,0.14)']);
    g.fillStyle = '#d3d7d9'; g.fillRect(0, 0, 18, 512);
    g.fillStyle = 'rgba(90,96,100,0.35)'; g.fillRect(18, 0, 2, 512);
    g.fillStyle = '#2b2d30'; g.fillRect(96, 256 + 40, 64, 30); g.fillStyle = '#c9cdcf'; g.fillRect(92, 256 + 72, 72, 4);
    g.fillStyle = '#b9b3a6'; g.fillRect(0, 512 - 24, 256, 24);
  },
};
/** with a lower window and a door here and there (its west and north sides) */
const HALL_LOW: Style = {
  bay: 4.2, up: [], ground: [[96, 256 + 40, 64, 30], [70, 256 + 150, 116, 70]],
  draw: (g) => { HALL_WALL.draw(g); darkWin(g, 70, 256 + 150, 116, 70); },
};
const AO: [number, number] = [-356, -528];
const ACH = [-373.5, -338.5, -538.5, -517.5];
const AST = 5.0;
const anglicanChurch: Spec = (() => {
  const { X, Z, B, M } = frameOf(AO);
  return {
    name: 'Anglican Church- Main Church',
    axis: [1, 0], origin: AO, storey: AST, style: ANG_SIDE, roofColor: MAROON, fascia: '#efeeea', pitch: 0.7, plinth: '#cfcac0',
    blocks: [{ x0: X(ACH[0]), x1: X(ACH[1]), z0: Z(ACH[2]), z1: Z(ACH[3]), floors: 1, roof: 'none', faces: { x1: ANG_END } }],
    keep: [[X(ACH[1]), X(ACH[1] + 4), Z(-536), Z(-519)]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      const e = k.wallTop(1);
      // the steep maroon roof, deep eaves, hipped at the west, the gable to the road on the east
      // (the gable is the building's own wall, flush under the roof's edge: owner)
      const top = hipRoof(k, M, ACH[0] - 1.4, ACH[1] + 0.35, ACH[2] - 1.4, ACH[3] + 1.4, e, 0.7, 'x', [hip, open], c, '#3a2422');
      const zm = (ACH[2] + ACH[3]) / 2, ex = ACH[1];
      c.push([tri2([X(ex), e - 0.02, Z(ACH[2] - 1.4)], [X(ex), e - 0.02, Z(ACH[3] + 1.4)], [X(ex), top - 0.05, Z(zm)]), ANG_CREAM]);
      c.push([B(ex, ex + 0.3, e - 0.3, e, ACH[2] - 1.4, ACH[2]), ANG_CREAM], [B(ex, ex + 0.3, e - 0.3, e, ACH[3], ACH[3] + 1.4), ANG_CREAM]);
      // the stained-glass window high on the gable (picture 4): a cross on blue and gold on the left, the figure in red
      // on the right, in white frames; three small arched windows under it, lit
      const gx = X(ex) + 0.04, sy0 = e + 0.4, sy1 = e + 4.6, sz0 = zm - 3.4, sz1 = zm + 3.4;
      k.plain.push([B(ex, ex + 0.04, sy0 - 0.15, sy1 + 0.15, sz0 - 0.15, sz1 + 0.15), '#f4f4f0']);
      const panes: [number, number, string][] = [[0, 0.22, '#e8c23a'], [0.22, 0.45, '#2f5fae'], [0.45, 0.72, '#c23b2e'], [0.72, 1, '#e2b04a']];
      for (const [a, b, col] of panes) k.plain.push([B(ex + 0.04, ex + 0.06, sy0, sy1, sz1 - (sz1 - sz0) * b, sz1 - (sz1 - sz0) * a), col]);
      // the cross (left as seen from the road) and the figure (right)
      const czc = sz1 - (sz1 - sz0) * 0.22;
      k.plain.push([B(ex + 0.06, ex + 0.08, sy0 + 0.4, sy1 - 0.4, czc - 0.12, czc + 0.12), '#f6f1dc'], [B(ex + 0.06, ex + 0.08, sy1 - 1.6, sy1 - 1.35, czc - 0.7, czc + 0.7), '#f6f1dc']);
      const fz = sz1 - (sz1 - sz0) * 0.6;
      k.plain.push([B(ex + 0.06, ex + 0.08, sy0 + 0.4, sy1 - 1.4, fz - 0.6, fz + 0.6), '#d23a2a'], [new THREE.CircleGeometry(0.35, 12).rotateY(Math.PI / 2).translate(gx + 0.05, sy1 - 1.0, Z(fz)), '#f0c8a0']);
      for (let i = 1; i < 6; i++) k.plain.push([B(ex + 0.06, ex + 0.09, sy0, sy1, sz1 - ((sz1 - sz0) * i) / 6 - 0.03, sz1 - ((sz1 - sz0) * i) / 6 + 0.03), '#f4f4f0']);
      for (const dz of [-1.3, 0, 1.3]) {
        const z = zm + dz;
        k.plain.push([B(ex, ex + 0.05, 1.8, 3.0, z - 0.35, z + 0.35), '#f0d27a'], [new THREE.CircleGeometry(0.35, 12, 0, Math.PI).rotateY(Math.PI / 2).translate(gx + 0.01, 3.0, Z(z)), '#f0d27a']);
        k.plain.push([B(ex + 0.05, ex + 0.07, 1.8, 3.0, z - 0.02, z + 0.02), '#3a3633']);
      }
      // a door under them, steps
      k.plain.push([B(ex, ex + 0.04, 0.4, 1.6, zm + 2.4, zm + 3.6), '#3a2620']);
      for (let i = 0; i < 2; i++) c.push([B(ex, ex + 0.8 - i * 0.3, 0, 0.4 - i * 0.2, zm + 2.2, zm + 3.8), '#cfcac0']);
      // the porch on the south side toward the court: a flat canopy on two pillars over double doors
      const pz = ACH[3];
      k.plain.push([B(-357, -354, 0.4, 3.0, pz, pz + 0.04), '#3a2620']);
      c.push([B(-358.5, -352.5, 3.3, 3.55, pz, pz + 2.6), WHITE]);
      for (const x of [-358.2, -352.8]) { c.push([B(x - 0.18, x + 0.18, 0, 3.3, pz + 2.2, pz + 2.56), WHITE]); SOLIDS.add(x, pz + 2.4, 0.3); }
      // the paved court south of it, its parking bays marked in white
      for (let x = -371; x < -342; x += 2.6) k.plain.push([B(x, x + 0.08, 0.06, 0.07, -514.5, -509.5), '#f2f2ee']);
      const m = new THREE.Mesh(merge(c), concrete(0.2));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

const HO: [number, number] = [-370, -470];
const HBAR = [-390.0, -339.0, -475.0, -453.0], HWING = [-390.0, -376.0, -489.0, -475.0], HWEST = [-404.0, -391.0, -481.0, -453.5];
const HST = 6.6;
/** a Norfolk Island pine: a straight trunk, tiers of flat branches shrinking upward */
function araucaria(k: Kit, x: number, z: number, h: number) {
  const y = k.ground(x, z);
  k.plain.push([new THREE.CylinderGeometry(0.12, 0.32, h, 7).translate(x, y + h / 2, z), '#5a4436']);
  const tiers = Math.round(h / 1.3);
  for (let i = 2; i < tiers; i++) {
    const t = i / tiers, r = (1 - t) * h * 0.22 + 0.35, yy = y + h * t;
    k.plain.push([new THREE.ConeGeometry(r, 0.7, 9).translate(x, yy, z), i % 2 ? '#26402a' : '#2d4a30']);
  }
  k.plain.push([new THREE.ConeGeometry(0.35, 1.2, 7).translate(x, y + h + 0.3, z), '#2d4a30']);
}
/** a bushy coconut palm: a leaning trunk, a big head of long drooping fronds (picture 4) */
function coconut(k: Kit, x: number, z: number, h: number, lean: number) {
  const y = k.ground(x, z);
  k.plain.push([new THREE.CylinderGeometry(0.16, 0.24, h, 7).rotateZ(lean).translate(x - Math.sin(lean) * h / 2, y + h / 2, z), '#7d6e5c']);
  const tx = x - Math.sin(lean) * h, ty = y + h * Math.cos(lean);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2, droop = 0.5 + (i % 3) * 0.25;
    const f = new THREE.ConeGeometry(0.5, 4.2, 3, 1).rotateX(Math.PI / 2).translate(0, 0, 2.1).scale(1, 0.15, 1).rotateX(droop).rotateY(a);
    k.plain.push([f.translate(tx, ty, z), i % 2 ? '#3f6a2c' : '#4d7a34']);
  }
  SOLIDS.add(x, z, 0.3);
}
const anglicanHall: Spec = (() => {
  const { X, Z, B, M } = frameOf(HO);
  const R = (r: number[], floors: number, more: object = {}) => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors, roof: 'none' as const, ...more });
  return {
    name: 'Anglican Church Legon Hall',
    axis: [1, 0], origin: HO, storey: HST, style: HALL_WALL, roofColor: MAROON, fascia: '#efeeea', pitch: 0.4, plinth: '#b9b3a6',
    blocks: [R(HBAR, 1, { faces: { z0: HALL_LOW } }), R(HWING, 1, { faces: { x0: HALL_LOW, z0: HALL_LOW } }), R(HWEST, 2, { roof: 'hip', roofColor: TILE_RED, faces: { x0: ST_HOUSE, x1: ST_HOUSE, z0: ST_HOUSE, z1: ST_HOUSE } }, )],
    keep: [[X(-352), X(-341), Z(-482), Z(-475)]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      const e = k.wallTop(1);
      // the maroon hip roofs, a louvred gablet at each end of the ridge (picture 2)
      const gab = { gw: 1.4, tri: true };
      hipRoof(k, M, HBAR[0] - 1.0, HBAR[1] + 1.0, HBAR[2] - 1.0, HBAR[3] + 1.0, e, 0.4, 'x', [gab, gab], c, '#3a2422', ['#2a2624', '#4a4440']);
      hipRoof(k, M, HWING[0] - 1.0, HWING[1] + 1.0, HWING[2] - 1.0, HBAR[2] + 1.0, e, 0.4, 'z', [hip, { gw: 99, tri: false }], c, '#3a2422');
      // the arched glazed entrance in the bar's north face near its east end, lit; steps down to the court
      const ax = -349.5, fz = HBAR[2];
      const arch = new THREE.Shape(); arch.moveTo(-1.6, 0); arch.lineTo(1.6, 0); arch.lineTo(1.6, 3.4); arch.absarc(0, 3.4, 1.6, 0, Math.PI, false); arch.lineTo(-1.6, 0);
      k.plain.push([new THREE.ShapeGeometry(arch).rotateY(Math.PI).translate(X(ax), 0.5, Z(fz) - 0.03), '#f0d088']);
      for (let i = -2; i <= 2; i++) k.plain.push([B(ax + i * 0.64 - 0.03, ax + i * 0.64 + 0.03, 0.5, 4.9 - Math.abs(i) * 0.25, fz - 0.06, fz - 0.03), '#3a3633']);
      for (const y of [1.6, 3.0]) k.plain.push([B(ax - 1.6, ax + 1.6, y - 0.03, y + 0.03, fz - 0.06, fz - 0.03), '#3a3633']);
      for (let i = 0; i < 3; i++) c.push([B(ax - 2.2 - i * 0.3, ax + 2.2 + i * 0.3, 0, 0.5 - i * 0.16, fz - 0.6 - i * 0.4, fz), '#cfcac0']);
      // air-conditioners on its east face (to the road), a lamp
      for (const [z, y] of [[-470.5, 2.2], [-466.0, 2.2], [-459.5, 1.0]]) k.plain.push([B(HBAR[1], HBAR[1] + 0.3, y, y + 0.55, z - 0.4, z + 0.4), '#e9ebeb']);
      k.plain.push([B(HBAR[1], HBAR[1] + 0.2, 5.4, 5.6, -468.5, -468.1), '#fff6dc']);
      // the court north of it: pavers, a bed of shrubs
      k.plain.push([B(-376, -341, 0.02, 0.06, -489, -475.6), '#a7a399']);
      const g = garden([-380, -335, -495, -470]);
      g.reseed(83);
      for (const [x, z] of [[-366, -482], [-363, -480.5], [-360, -482], [-357, -480.5]]) g.bush(k, X(x), Z(z), 0.8);
      const m = new THREE.Mesh(merge(c), concrete(0.15));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
      // ----- the trees: Norfolk Island pines by the hall and the church, bushy coconut palms along the road
      for (const [x, z, h] of [[-344.5, -479.5, 16], [-362, -513.5, 17], [-344, -513, 15], [-392, -492, 14]] as [number, number, number][]) { araucaria(k, X(x), Z(z), h); SOLIDS.add(x, z, 0.35); }
      for (const [x, z, h, l] of [[-333.8, -534, 6.5, 0.15], [-334.2, -527, 7.5, -0.1], [-333.6, -520.5, 6.8, 0.2], [-334, -462, 6.0, -0.12]] as [number, number, number, number][]) coconut(k, X(x), Z(z), h, l);
      for (const [x, z, s] of [[-385, -545, 2.0], [-368, -545.5, 1.8], [-352, -544, 1.9]] as [number, number, number][]) g.tree(k, X(x), Z(z), s);
      // ----- along the road: a low red brick wall, white piers, maroon iron railings with arched tops (pictures 2 to 4)
      const fence = (z0: number, z1: number) => {
        for (let z = z0; z < z1 - 0.1; z += 3.4) {
          const za = z, zb = Math.min(z1, z + 3.4), xa = fenceX(za), xb = fenceX(zb), len = Math.hypot(zb - za, xb - xa), ry = Math.atan2(xb - xa, zb - za);
          k.plain.push([new THREE.BoxGeometry(0.3, 0.5, len).rotateY(ry).translate(X((xa + xb) / 2), 0.25, Z((za + zb) / 2)), BRICK]);
          k.plain.push([B(xa - 0.2, xa + 0.2, 0, 1.95, za - 0.2, za + 0.2), '#f0efea'], [B(xa - 0.24, xa + 0.24, 1.95, 2.05, za - 0.24, za + 0.24), '#dcdad3']);
          const n = 14;
          for (let i = 1; i < n; i++) {
            const t = i / n, zz = za + (zb - za) * t, xx = xa + (xb - xa) * t, h = 1.5 + 0.35 * Math.sin(t * Math.PI);
            k.plain.push([B(xx - 0.018, xx + 0.018, 0.5, h, zz - 0.018, zz + 0.018), IRON]);
          }
          k.plain.push([new THREE.BoxGeometry(0.05, 0.05, len).rotateY(ry).translate(X((xa + xb) / 2), 0.62, Z((za + zb) / 2)), IRON]);
          // the arched top rail in short pieces
          for (let i = 0; i < 8; i++) {
            const t0 = i / 8, t1 = (i + 1) / 8, ya = 1.5 + 0.35 * Math.sin(t0 * Math.PI), yb = 1.5 + 0.35 * Math.sin(t1 * Math.PI);
            const pa = [xa + (xb - xa) * t0, za + (zb - za) * t0], pb = [xa + (xb - xa) * t1, za + (zb - za) * t1], l = Math.hypot(pb[0] - pa[0], pb[1] - pa[1], yb - ya);
            const geo = new THREE.BoxGeometry(0.05, 0.06, l).rotateX(-Math.atan2(yb - ya, Math.hypot(pb[0] - pa[0], pb[1] - pa[1]))).rotateY(ry);
            k.plain.push([geo.translate(X((pa[0] + pb[0]) / 2), (ya + yb) / 2, Z((pa[1] + pb[1]) / 2)), IRON]);
          }
          for (let s = za; s <= zb; s += 0.4) SOLIDS.add(fenceX(s), s, 0.25);
        }
      };
      // the gates by the drive (owner's blue marks): three red brick piers with white globe lamps; the drive's gate
      // swung open inward, the one beside it shut
      const P0 = -504.4, PM = -497.8, P1 = -492.6, PW = 0.8;
      fence(-540.0, P0 - PW / 2); fence(P1 + PW / 2, -448.6);
      for (const z of [P0, PM, P1]) {
        const x = fenceX(z);
        k.plain.push([B(x - 0.4, x + 0.4, 0, 2.2, z - PW / 2, z + PW / 2), BRICK], [B(x - 0.45, x + 0.45, 2.2, 2.3, z - 0.45, z + 0.45), '#8a4230']);
        k.plain.push([new THREE.SphereGeometry(0.3, 14, 10).translate(X(x), 2.6, Z(z)), '#f6f6f2']);
        for (let y = 0.15; y < 2.2; y += 0.15) k.plain.push([B(x - 0.41, x + 0.41, y, y + 0.012, z - PW / 2 - 0.01, z + PW / 2 + 0.01), '#c9a58f']);
        SOLIDS.add(x, z, 0.5);
      }
      // the IN plate on the drive's north pier
      k.plain.push([B(fenceX(PM) + 0.4, fenceX(PM) + 0.42, 1.3, 1.7, PM - 0.3, PM + 0.3), '#f4f4f0']);
      k.signs.push({ text: 'IN', x: X(fenceX(PM)) + 0.43, y: 1.5, z: Z(PM), ry: Math.PI / 2, w: 0.5, colors: ['#f4f4f0', '#c22a2a'] });
      // a gate leaf: arched, maroon iron, hinged at (hx, hz); `ang` 0 = shut across the opening toward +z
      const leaf = (hx: number, hz: number, w: number, ang: number) => {
        const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang)), n = 10;
        for (let i = 0; i <= n; i++) {
          const t = i / n, x = hx + dir.x * w * t, z = hz + dir.z * w * t, h = 1.7 + 0.4 * Math.sin(t * Math.PI);
          k.plain.push([B(x - 0.022, x + 0.022, 0.08, h, z - 0.022, z + 0.022), IRON]);
        }
        for (const y of [0.1, 0.9]) {
          const geo = new THREE.BoxGeometry(0.05, 0.06, w).rotateY(ang);
          k.plain.push([geo.translate(X(hx + dir.x * w / 2), y, Z(hz + dir.z * w / 2)), IRON]);
        }
        for (let i = 0; i < 6; i++) {
          const t0 = i / 6, t1 = (i + 1) / 6, ya = 1.7 + 0.4 * Math.sin(t0 * Math.PI), yb = 1.7 + 0.4 * Math.sin(t1 * Math.PI), l = Math.hypot(w / 6, yb - ya);
          const geo = new THREE.BoxGeometry(0.05, 0.06, l).rotateX(-Math.atan2(yb - ya, w / 6)).rotateY(ang);
          k.plain.push([geo.translate(X(hx + dir.x * w * (t0 + t1) / 2), (ya + yb) / 2, Z(hz + dir.z * w * (t0 + t1) / 2)), IRON]);
        }
      };
      // the drive's gate: hinged on the south pier, swung in against the inside of the wall (open)
      const hzS = P0 + PW / 2, gw1 = PM - PW / 2 - hzS;
      leaf(fenceX(hzS) - 0.3, hzS, gw1, -Math.PI * 0.45);
      // the gate beside it: swung open too (owner)
      const hzN = P1 - PW / 2, gw2 = hzN - (PM + PW / 2);
      leaf(fenceX(hzN) - 0.3, hzN, gw2, Math.PI * 1.45);
      // the church's board on its posts outside the drive's north pier (picture 4): navy, lines in yellow
      const bx = fenceX(P1) + 1.6, bz = P1 + 1.8;
      for (const dz of [-0.9, 0.9]) k.plain.push([B(bx - 0.05, bx + 0.05, 0, 3.4, bz + dz - 0.05, bz + dz + 0.05), '#2a3a8a']);
      k.plain.push([B(bx - 0.05, bx + 0.05, 1.5, 3.3, bz - 1.0, bz + 1.0), '#1d2a5a']);
      for (let y = 1.8; y < 3.2; y += 0.28) k.plain.push([B(bx + 0.05, bx + 0.06, y, y + 0.12, bz - 0.8, bz + 0.8), '#e8c23a']);
      // flowering bushes at the foot of the pier, the paved bays outside the fence, numbered, yellow lines
      for (const dz of [1.0, 2.2, 3.4]) g.bush(k, X(fenceX(P1) + 0.9), Z(P1 + dz), 0.55);
      const px0 = fenceX(-520) + 0.3;
      k.plain.push([B(px0, px0 + 2.6, 0.03, 0.05, -540, -505.5), '#a9a59c']);
      for (let z = -539; z < -506; z += 2.6) k.plain.push([B(px0, px0 + 2.6, 0.05, 0.055, z, z + 0.08), '#e2c23a']);
    },
  };
})();

// ---------- the open ground west of the churches (the owner's green and red lines) ----------
/** paint ground cells (s soil, m soil and grass, g dry grass, t bushes and trees, . nothing) from a cell grid at x0, z0
 *  (world) of cs-metre cells onto the ground, and plant the bushes and trees (a tree on one cell in treeEvery) */
function openGround(k: Kit, O: [number, number], rows: string[], x0: number, z0: number, cs: number, seed: number, treeEvery: number, bushEvery: number) {
  const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
  const H = rows.length, W = rows[0].length, P = cs >= 3 ? 8 : 10;
  const soil = ['#a8714a', '#b27d52', '#9d6943'], mixed = ['#9a7c4c', '#8d7a49', '#a2814f'], grass = ['#7c8a45', '#6e7f3e', '#879348', '#8a8a4c'];
  const tex = canvas(W * P, H * P, (g) => {
    g.clearRect(0, 0, W * P, H * P);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const ch = rows[j][i];
      if (ch === '.') continue;
      const pal = ch === 's' ? soil : ch === 'm' ? mixed : grass;
      g.fillStyle = pal[(i * 7 + j * 13) % pal.length]; g.fillRect(i * P, j * P, P, P);
    }
    // soften the cells into patches: blobs of each cell's colour overlapping its neighbours
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const ch = rows[j][i];
      if (ch === '.') continue;
      const pal = ch === 's' ? soil : ch === 'm' ? mixed : grass;
      g.fillStyle = pal[((i + 1) * (j + 3)) % pal.length]; g.globalAlpha = 0.6;
      g.beginPath(); g.ellipse((i + 0.5) * P + (rnd() - 0.5) * 4, (j + 0.5) * P + (rnd() - 0.5) * 4, P * 0.9, P * 0.75, rnd() * 3, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    speckle(g, 0, 0, W * P, H * P, Math.round(W * H * 2), ['rgba(70,90,40,0.35)', 'rgba(150,100,60,0.35)', 'rgba(200,170,120,0.25)']);
    // tracks worn across it: the soil cells that run in lines show through a little lighter
    g.globalCompositeOperation = 'destination-out';
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (rows[j][i] === '.') g.fillRect(i * P - 2, j * P - 2, P + 4, P + 4);
    g.globalCompositeOperation = 'source-over';
  });
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, transparent: true, alphaTest: 0.5 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(W * cs, H * cs).rotateX(-Math.PI / 2), mat);
  ground.position.set(X(x0 + (W * cs) / 2), 0.03, Z(z0 + (H * cs) / 2));
  ground.receiveShadow = true;
  k.meshes.push(ground);
  // the bushes and trees where the aerial shows them
  const g = garden([x0 - 5, x0 + W * cs + 5, z0 - 5, z0 + H * cs + 5]);
  g.reseed(seed);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    if (rows[j][i] !== 't') continue;
    const x = x0 + (i + 0.5) * cs + (g.rand() - 0.5) * cs * 0.6, z = z0 + (j + 0.5) * cs + (g.rand() - 0.5) * cs * 0.6;
    if ((i + 2 * j) % treeEvery === 0) g.tree(k, X(x), Z(z), 1.3 + g.rand() * 0.8);
    else if ((i + j) % bushEvery === 0) g.bush(k, X(x), Z(z), 0.8 + g.rand() * 0.6);
  }
}
const FO: [number, number] = [-436, -348];
const field: Spec = (() => {
  const { X, Z, B } = frameOf(FO);
  return {
    name: 'open ground west of the churches', axis: [1, 0], origin: FO, storey: 2.4, style: ST_HOUSE, roofColor: '#7d7a72', fascia: '#e9e8e3', pitch: 0.2,
    replaces: [[-428, -400], [-427.7, -385.7]],
    blocks: [],
    keep: [],
    extras: (k: Kit) => {
      openGround(k, FO, FIELD, FX0, FZ0, FC, 71, 5, 2);
      // the small water tank and the shed on it (aerial)
      const c: Part[] = [];
      c.push([B(-430.1, -422.5, 0, 2.0, -404.0, -398.1), '#8fa7ad'], [B(-430.3, -422.3, 2.0, 2.15, -404.2, -397.9), '#7d939a']);
      c.push([B(-429.5, -426.0, 0, 2.4, -388.1, -383.4), '#e9e6dc']);
      k.plain.push([new THREE.BoxGeometry(4.0, 0.08, 5.3).rotateX(0.08).translate(X(-427.75), 2.55, Z(-385.75)), '#8b8b86']);
      const m = new THREE.Mesh(merge(c), concrete(0.4));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();
/** the wider open ground behind the three churches (the owner's red line): red soil mostly, grass in patches, tracks,
 *  bushes and trees, and the woods to the north round the Miracle Centre; 3 m cells from the aerial (0.45 m/px), the
 *  part read before at 2 m left out; x -849.., z -636.. */
const FIELD2 = [
  '.............................................................................................................................................................................................',
  '..tssssssssmggmmsmgmmmmgggmmggm...sgmsssmtgggtttggtttg...................................................................................................tttttttttttttttttttttttttttttttss...',
  '..sssmsssssssssssssmmmmmmssmgmmm...sssgtttgggttttgtttttttgtttggggtttggmmmgggmssssmmggmsssssssssssssssssssssssssssss....stttttttttttttttggttttttttttttttmmmmmmsssmmmmmmmmmmmgggggggggtttttt...',
  '..sssssssssmggmmsmgmmmmgggmmggmg...smsssmtgggtttggtttgggggggggggggtgggmmmgttgsssmmmmggmssssssssssssssssssssssssssss....ttttttttttttttggtttttttttttttttttttttttttttttttttttttttttttttttttst...',
  '..sssssssgggmmmmggggmmmmmmmgggmg...gtggmsssssmttggggtgggtgtttggggtttggmmmgggmssssmmggmsssssssssssssssssssssssssssss....ttttttttttttttttggttttttttttttttttttttttttttttttttttttttttttttttttt...',
  '..msmssssggggmmgggggggmmggggggmg...tttttttgsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssmmmssssssss....ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt...',
  '..msmsssssmggmgggggggggmggggmmm...tmtttttttttttggsgggggggtttttggggggggggggmsssssssmgmssssssssssssggmssssmssssssssss...tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt...',
  '..sssssmssssmggmmmmmgggggggmsms...gsgttttttttttggsmgggtgggttttggggggtgggggsssssmsmggmssssssssssssmgmssssmmsssssssss...tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt...',
  '..sgsssmsmmssmmssmgmmgttgggmmmm...gmgttttttttttggsmgggggmgggggggggggggggggsssssmmmgmsssssssssssssmmssssmmmssmssssms...ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt..',
  '..mtmmssmmmmmmssssmsmgtttgmssss...tmtttttttttttggssgggmmsmggmmmgmmmmmsmgggmssssmmgmssssssssssssssmsssssmmmsssssssgs...ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt..',
  '..gtggmsmmmmmssssssssmgtggmssss...gmgttttttttttgmsmgggmsssgmsssmsssssssmmssssssmmgmssssssssssssssssssssmmsssssssmgm...ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt..',
  '..gtggmsmmssssssmsssssggggmmsm...msmgttttttttttgmgmmmmmssgmsssssssssssmssssssssmmgmssssssssssssssssssssssssssssmggg...ttttttttttttttgtttttttttttttttttttttttttttttttttttttttttttttttttttttt..',
  '..mtmssmmmsssssmgmsssmggggmmsm...gmgtgmgtttttttggmmsmmsmggmssssssssssmmmsssssssmmmmssssssmmmsssssssssssssssssssmgmg...tgttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt..',
  '..mtmssmggmssssgtgmssmmmmmmmm....ttttsmtttttttttmmgggmsmmmgmmssssssssmmmssssssssmmssssssssmssssssmmmmssssssssssmmsm....tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt..',
  '..mtmssmmmgmsssgtgmssssmmmmmm...gmgttmmttttttttgmmgggmsssmmgmsssmmmssmssssssssssssssssssssssssssmggmmmsssssssssssss.....ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt..',
  '..mtmsmmmmmmsssmmmsmmmsmmmmm....gggggggttttttttgsmggmmsssssmmssssssmmgsssssssssssssssssssssssssmggmmmmsssssssssmssss....tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttgt..',
  '..mtmmmmmsmssssmmsmmgggggmmm...tttttttgggggttttgmgggmssssssmgmmgsssgmgsssssmssssssssssssssssssmggggmmsssssssssmmmmsss...tttttttttttgggttttttttttttttttttttttttttttttttttttggtttgtttttttttgt..',
  '..mtmgmmssmssmmmmsmmggggmmm....ttttgtttgttttttggggmmmmsssssgttttmsmgmgsssssmsmmmssssssssssssssmgggggmssssssssmggmmsss....ttttttttttgttttttttttttttttttttttttttttttttttttttgtttggtggggttggggg.',
  '..mtmmmssmmssmmmsssssmmsss....tttttttttttttttgggggmmmmssssgtttttgsmgmmsmsssmmmgmsssssssssssssmmgggtgmssssssssmmmmssss....tttttttttgttttttttttttttttgtttttttttttttttttttttttttttttttttttttttt.',
  '..mtmmmsssssssmmsssssssss....tttttttttttttttggmgtggmmmsssmgttttttmsmmssmsssmgmmmsssssssssssssmmggggmmsssssssmmmmsssss....tttttttttgttttttttttttttttttttttttttttttttttttttttttttttttttttttttt.',
  '..mtmmmssssssssmmsssssss....ttttttttttttttttgsmtttggggsssmgtttttttmmmmsmsssmggggmsssssssssssssmmgggggsssssssmmmsssssss...tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttgt.',
  '..mtmmmssssssssssssmmsss...ttttttttttgtttttgssgtttggggmssmtttttttttggmsssssmgggggmmmmmssssssssssmmmgmsssssssssssssssss...tgttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt.',
  '..mtmmssmgssssssssmmmsm...ttttttttttgttttttmsmttttggmmsssmttttttttttgmsssssmmggggmgmmmssmsssssssssmmssssssssssssssssss....tttttttttttttttgttttttttttttssssssssssssssssssssmttttttttttttttttt.',
  '..mtmmsmgtgsssssmmmmmsm...ttttttttttttttggmssgtttggssssssmttttttttttgmssssmmmmgggmgmmmsmmmsssssssssssssssssssssssssmgm....ttttttttttttttttttttttttt.....ttttttttttttgtgtttmsssstttttttttttgt.',
  '..mtmssssgmsssssmmmmmm...gggttttttttttttgssssttggtgggmsmsmgtttttttttgmsssssmmmmggggmmssmmmssssssssssssssssssssssssmgggg...ttttttttgggttttttttggttt....................ssssmttttttttttttttttt.',
  '..gtgssssssssssmmmmmmm...smsgttttttggttgmsssmttgggggggggmsmtttttttttgmssssssssmggggmmsssgmssssssssssssssssmmmssssssgggg...ttttttttttttttttttttgtg....................................tttttgs.',
  '...mtmsssssssssmmmmmm...gggmsmtttggggggsssssmggggggggtttgmmgtttttttggmssssssssmggggggsssmgmmmmmssssssssssmgttgsssssmmmm....ttttttttttttttttttttt.............................................',
  '....sgsssssssssmmmmmm...ggggmsmtttggggmsssssmgttttgggtttmmgttttttttgmmssssssssmggggggsssmgggttgssssssssssmmttggmsssssss....tttttttttttttttttttt..............................................',
  '.....smsssssssssmmmm...gggggggsgttggggggssssmgtttttgggggmggttttttttgmmssssssssmgggggmssmmgttttmssssssssmmmmggtgggmmssss.....tttttttttttttttttt...............................................',
  '......msmsssssmsmmm....ggggggggmttgmmgtgssssmgttmmgggggggggtttttttggmmmsssssssggggggmssmmgttttmssssssssmgggggtggggmsssss.....tttttttttttttttt................................................',
  '..s....gggssssmsms....mgmmggtggmsmgmmggmssssmggmssmmggggttggttttttggmmmssssssmgggmmmsssmmgggggssssssssmggggggttggggmsssss.....tttttttttttttt.................................................',
  '..st....sssssssmmm...gtggmggggtgssggggmsssmmmmmssmggggtgtttgtttttttgmmsssssssmmmgmssssmmmmggggmsssssssmgggtgtttgmmmssssmtm.....ttttttttttttt.................................................',
  '..sts...sssssssms....gtgggggggtggmsmggmssmgmmggmmgggggtttttgttttttttmsssssssssmmmmssssgmmggggtggmssssssmggttttttggmmmmgtttt.....tttttttttttt.................................................',
  '..stst...sssssss....tgtggggggggggmsssmssgggmmggggggttggggtgmgtttttttmssssssssmmgmmmssmgggggggtgggmssssssmgtttttttttttttttttt.....ttttttttttt.................................................',
  '..stst....smsss....mmmmgtgggggtggmmmsssgggsssgggggtttttggggmgtttttttmssssssmggggggmssmggggggtgggggmsssssmgggttttttttttttttttt.....tttttttttt.................................................',
  '..mtmmm...smsm....ggggmmtttgggtggggggmgggmsmggttttttttggtttggtttttttgssssssgggggggssmggggggtttttggmssssssmmggtttttttttttttttgt......tttttttt.................................................',
  '..tttttt...ms....ggggtgmgtttggtmgggggtttgmmgggtttttttgggtttttgttttttgmsssmmgtggggmssmggggmgttttttgmssssssmmmstttttttttttttttmsm........ttttt.................................................',
  '..tttttt........gggmgttgmgtgggtggggggtttgssmgggttttttggttttttttttttttmssmggtttgggsssggggmmgttttttgsssssssmmssttttttttttttttgssss...........tt................................................',
  '..gtgggtg......gggmssmggmmgmmgttgggmgttttgssmggttttttttttttttttttttttmssgtttttgggmssmgmgmgtttttttmsssssssmsssgtttttttttttttsssssss...........................................................',
  '..gtgmmsms....tmttgmssmmmssmggttttgmmgttttgmgggtttttggttttttttttttgttmsmgtttttttgssmggmmgggtttttgmssssssmmsssmttttttttttttgsmmmssgsgt........................................................',
  '..gtgmmmsss..sssmgtmggmmmgggggttttgmmmgtttttgggtttttggttttttttttggtttssgttttttttmsmggggmmggtttttgsssssssmmmggmtttttttttttgmsggggsgtttttt.....................................................',
  '..gtgssmssssssssssmggggmmgtggtttttgmmmgttttttgttttttgttttttttttggtttgssgttttttttmsgggggmgggttttgssssssssmggggggtttttttttgmssmgggmgttttttttttt................................................',
  '..gtgmmmsssssssssssggggggggggttggggmmgtttttttgtttttttttttttttttgttgggssgtttttttgmsmgmmmmggtttttmmsssssssmggggggtttttttttmsssssmgggttttttttttt................................................',
  '..tttggmsssssssssssmgggttgmmgtgggtggggttttttttgggtttttttttttttttttggmsmggttttttgssmgmmsgggtttttmmmsssssmmmgggggttttttttgsssssssmmgttttttttttt................................................',
  '..ttttmmsssssssssssmggtttgssgttgtttgggtggtttttgmmtggtgggtttttttttttgssmgtttttttgssmgmmmgtttttttggmsssssmmgggggtttttttttmssssssmssmgtttttttttt................................................',
  '..tttgmmsssssssssssmggggtgmmgtttgttggggggtttttgmmmggtgttttttttttttttmsmgtttttttgsgmmmsmggttttttgggsssssmggggggtttttttttgsssssssssmgtttttttttt................................................',
  '..tttmsmsssssssssssmgggggttgttttgttggggggtttttggmggtttttttttttttttttmssgggtttttgmggmssmmgtttttggggssssmmggmmmgttttttttttmssssssssmttttttttttt................................................',
  '..mgmmssssssssssssmmmmggggtgttttgggmmggggtttttgtggtttttttttttttttttgssssggggtttgmggmssmmgtggtggggmssssssmmmmmgttttttttttgssssssssmttttttttttt................................................',
  '..mgmssssssssssssggmmmggmggggttggggmsgggggtttttttgtttttttttttttttttmssssggmmgggmmgggmmmgttggtttggmssssssggmssmgtttttttttgsssssssssgtttttttttt................................................',
  '..mgmmssmmmssssssmgmgggmmggmggggmmmsssmmmggggttttttttttggtttttttttgsssssmmmssmgmggggmmmgttggtttgmssssssmggmsmggtttttttttgmmsssssssstttttttttt................................................',
  '..gmggsssmgmmssssggmmggmsssmgggmmmssssssmgggggtttttttggggtgtttttttmssssssmsmssmggggggggggtggtttgmsssssmmmmmmgtttttttttttgggmsssssssgttttttttt................................................',
  '..tstgmssmgggmsssggmmmgmssssmggmmmmsssssmggggttttttgggggggggtttttgssssssssmmmssmmmmggggggttttttgmssssmmmmssgttttttttttttggtmsssssssmtttttttttt...............................................',
  '..gsggsssmggggmsssmmmggmsssssgggmmmsssssmggtggttgggggggggggggtttgmssssssssmmmssmmmgggggmgttttttgmssssgggmssmgttgttttttttgggmsssssssmtttggttttt...............................................',
  '..tstgggggggggmsssmmgggmsssssggggmmssssssmggggggssmgggggggggggggmssmmsssssmmssmggggggtgmmgttgggmssssmgggmsssmmgggttttttttmsssssssssmttttggtttt...............................................',
  '..tstggggggggggmsmgggggmmmmsmgggggmssssssmmmggmsssgtggmggggggggssssmmmsssmmsssgtttgggtgggttgggmsssssmgggmsssmmmmmgtttttttgsssssssssgtttttgtttt...............................................',
  '..tstgggggtgggggmgggmmmssmmmgtgggmsssmssssssmmmssmgtgggggggggggssssmmgmmmmmssmgtttgggggggttggmsssssssmmmssssmmmmmmgggttttgmsssssssgttttttttttt...............................................',
  '..tstttgggtgmgggggggsssssssmggmmsssssmmsssssssmmmgggtttgggggggmsssmmmggmgggmmgggttgggggmmgttgssssssssssmssmmmmmsssmmmmgtttgmmmsmggtttttttttttt...............................................',
  '..tsttggggtgsssmggggsssssssssmmmmssssmsssssssssmggggtttgggggggmsssmmgggggggggmmsmgttggggmgtgmmmsssmmmssmmmmmmgmmmmmmmmmmgggmmmmgtttttttttttttt...............................................',
  '..tsttggggggsssmggtgmsssssmmsmgggmssmmssssmssmmgggggttggmgggggmmmmgggttgggggmgggggttgmmmgttmsggmsmggmmsmmmmmgggmmmmssmmmssmmmmgttttttttttttttt...............................................',
  '..gsgttggmmmmssmgttgmssmmmmmmmgtggmmmmssssmmmggggmgggggggggggggggmggtttggggmmgttttttgmsmgtggggggggggmssmmmgggggmmmmssmmmmmmmmmgttttttttttttttt...............................................',
  '..gsggggggggggggttggmssggmmmsgggggggmmmssssggtttgmggggmmgggmmmggggggttggggmssmgggggggmmmgggggggggttggsssmmgggmmmmmmmmmmmmmmmmsmgtttttttttttttt...............................................',
  '..msmssmtttgggggttggmgmggmsssmggmmgggmmsssmgttttgggggmgmggmsmmmgggggtggggmsmgggmmggggggggtgggmgttttggmmmmmmggmmssmmmmmmmmmmgmmmggttttttttttttt...............................................',
  '..ssssssgtttggmmgttgggmsgmsssmmmmmmggmmsmgttttttggggmmmmmsssssssmmgggggggmsmgggggggggttgtttgmmgtttgmgmmsssmmmsssssmmmsssmmmmmmmgggtgtttttttttt...............................................',
  '..sssssmgttttgsssggttgssmgsssmmsssmggggggtttttttmggmmmmmssssssssssmggggggssgtggttttgttttttttgggttggmmsssssmmmssssmmssssssssgmmmggttttttttttttg...............................................',
  '..sssssggtttttmssmggtgsssmmssmmsssmmgttttttttttgmggmmmmssssmmssmssmgggggmssgtttttttggtttttttggtttgmmmsssssmgmssssmmssssss....................................................................',
  '..sgsssmgtttttgssgggggmsssssmgmsssmggttttttttttgggggggsssmmmmmmgmmmmggggssmggggttttgggttttttgggttgmmgsssssmgmssmmmmmmmsss....................................................................',
  '..stsssmggtttgggssggmmmssssmggmmmsmgttttttttttttggggggssmggggggggggggggmssgttgggtttgggttttttgggtgmmggmmmmmmmmmmggmmmmmmsm....................................................................',
  '..stsssmmsgttgttssssssmmsssmgmsgggttttttttttttttggggggssmgggggttgttggmsssmgtgtttttgggggggttggmgggmmmmmggmggmmggggggmmmsss....................................................................',
  '..stsssssmttttttgssssmgtgmmmmmmgttttttttttttttttggttgmmmmggttttttttggmsssmgggttttggmggggttggmmmmmggmmmgggmggggggggggmgmsm....................................................................',
  '..mtmmsssgtttttttgmsmggttgssmmmgtttttttttttttggggtttgsmggmgttttggggmmmmsssgggtttggggggggttgggggmmmgmmmmmmmmmggggggggggmmm....................................................................',
  '..tttggsmgtttttttttgmgtgggmsssmgtttttttttttttttttttgssmgmmggttgmmmmmgttgmmgggttgggggttggttgmgtttgmsmmmmmmmmgggggggggggmmm....................................................................',
  '..ttttgsggtgggttttttgmgmsmmssmgggttttttttttttttttggsssmggggttggmmmmgttttgmgggttgggggtttttgmsgtttmssmmmmmmmmggggggggggggmg....................................................................',
  '..ttttgstttggtttttttgsssssssgtgmgtttttttttttttttgmsssmggttggggggggggttttgggggtgggggttttggmssmgggsssmmmmmmmmggggmmgggggggg....................................................................',
  '..ttttgsttttttttttttggmsssmgttgmggtttttttttttttggssssmmggggmmmggggtggttgmmgggttggmmgtttgmmmgggsssssmggggmmgggggmmgggggggg....................................................................',
  '..ttttgsttttttttttttttgssmggtggggtttttttttttttggmsssssssmmmsssmmmmggmmmmgggggtttggmgtttgggggtgggmsmmggggmmgttggggggmggggg....................................................................',
  '..ttttgsttttttttttttttgmmmggttggtttttttttttttgggmssssssssmmssssssmggmsssggggttgggggttttggggttggmsmggggggmmggtgggggtgggggg....................................................................',
  '..ttttgsttttttttttttttttgggtttmgttttgtttggmttttgmssssssssssmmmssssmggsssmgggtttttttttttgmmggggmssmggmmmmmmgggggggtttgmmmm....................................................................',
  '..ttttmsttttttttgttttttggttttgggtttttgggssmttttgsssssssssssmmmmsssmmmsssmgtttttttttttttgmmsmmmsssmgmmmmmmggggggggtttmssss....................................................................',
  '..ttttsstttttgtgttttttgggttttttggttttgmgmmgtggggmssssssssssmmmmmmsmmmgmssgggttttttgttttggmsmmssssmgmmmmgggggggtgggtgssmmm....................................................................',
  '..ttttsstttttggttttttgggtttttgggmgtttgggmmttggggsssssssssssmsssmmmmggggmsmggggggttttttttggmmsssssmmsmmmgggtgggttggggmgggg....................................................................',
  '..ttttsstttttgggttttgggtttttgttgmttgggggggttggggssssssmmmmmmssssmmmgggmmmmggmmmmtttttttttgmsssssssmsmsmgggggggttggggggggg....................................................................',
  '..ttttssttttggggtttgggttttgtttttgtggggggggttgggmssssssmgmmmmmssmmgggggmggmggmmmgtttttttttgmssssssmmsssmmggggggggggggggggg....................................................................',
  '..tttgssttggtgtgggggggttttttttttggggggtgggttggggssssssmgmmmmmmmmmgtggggggmmgggggttttttggggssssssmmmsssmmggggggggggggggggg....................................................................',
  '..stsssstttggttggggggttttttttttttggggggggttgggtgmssssmmmmmmmmgggggttttgmmmmgggtttttttgmmggmsssmsmgmsmmmgggggggggggggggggg....................................................................',
  '..mtmsssttttttgtgmmttttttttttttttgggggggggggggggmmmssmmmmmmmgtttggggggssmmmmgtttttttgmsmmmmsssssmmmmmmmggggggggmggggggggg....................................................................',
  '..mtmssmttttttgtgmmtttttttttttttttggtttggtggggggmmmmsmmmmmmmggtggggggmssssmggttttttggmmmmmsssssssmmmmmmgggggggggggggggggg....................................................................',
  '..gtgmsgttttttgggggtttttttttttttttgggtggggggggggmsmmmmmmmmssmmmmmgggmmsssmggtttttttggsmmmmsssmmmmmmmmsmgggggggggggggggggg....................................................................',
  '..gtgmsttttttttttgmgttttttttttttttgggtggggggggggmssmmmmmmmsssssssggggmsssmggtttttttmmmmggmsssggggmmssmmgggggggggggggggggg....................................................................',
  '..gtgmstttttttttttmmmggttttttttttttggtggggggggggmsssmmmmmmggmmmssmgttgmsssmgggttttgmssmmmsssmgggmmmsmgggggggggggmmmgggmmm....................................................................',
  '..gtgmsgtttttggtttgmsmggttttttttttttggggggggggggmmsmmmmmmggggggsmggttttgggmggggggmsssssssssgttttgggmmmmmggmgggggggmgggmmm....................................................................',
  '..gtggsgtgtttgggtggmmmmgttttttttttttgggggggggmgmmmmmmmmmgggtttgmmgttttttttggggmmssssssssssmtttttgttggssmmmmmgggggggggmmmm....................................................................',
  '..tttgstttttttgggggmmmmggttttttttttttttgggggmmgggggmmmmmgggtttgmmtttttttgttttgggmmssssssssgtttttgtttgsssmmmmggggmmgggmmmm....................................................................',
  '..tttgsttttttttggggmmmmmmgttttttttttttttggggggggggggmmmgggggtttggggtttttggtttttgttgssssssgtttttggttttgmmmmmmggggmmggmmggg....................................................................',
  '..gtggsttgttttgggggmmmmsssggggttttttttttggttgmmmmggmmmmmgtgtttttgggttttttttttttttttggssssgttttttgtttttmmsmmgggggmmggmmggg....................................................................',
  '..tttgstggttgggggggmmgmsssmgggttttttttggggttgssssmgmsssmgttttttggggtttttttttttttttttttgggttttggttgttttmmsmggggggggggggggg....................................................................',
  '..gtggsggggttgggtggmggmsssssgtttttttttggggtttggggttgggggtttttttmsmggttttttttttttttttttttttttttggggttttgssmggggggggggggggg....................................................................',
  '..tttmstgggttgggggggggggmsssmgtttttttggttttttttttttttttttttttttmsmmmgttttttttttgtttttttttttttggggtttttgmsmmmmgggggggggggg....................................................................',
  '..tttmstggggtttggggmmggggmmssmgttttgggtttttttttttttttttttttttttmsmmsmttttttttttggtttttttgttttgggtttgttgmsssssggmmmmgggggg....................................................................',
  '..tttmstgmggtttggggmmggggggmmmgtgggtttttttttttttgttgtttttttttttmsssmgttttttttttgttttttttggtttggttttttttgmssssmgmmsmgggmmm....................................................................',
  '..tttsstggggtttgggmmmggggggggggtgttttttttttttttgmttttttttttttttgssmgttttttttttttttttttttttttttttttttttttmssssmmmmmmmmsmmm....................................................................',
  '..tttssgggggttttgmmmggggggggggttttttttttttttttgmmttttttttttttttmssmtttttttttttttttttttttttttttttttttttttgssssssmmmmmmgggg....................................................................',
  '..tttssggtgtttttmmmgggggggggggtgtttttgtttttttgmsmtttttttttttgmssssgttttttttttttttttttttggggttttttttttttttgggmssmmmmssmggg....................................................................',
  '..tttssgttggggggmmmggggttttggttgttttggttttttgggsmtttttgmmmgmssssssgtttttttttgmggtttggttgmmggttttttttggtttttttgggmmmsssmmm....................................................................',
  '..gtgsmtttgggggggmggggttttttggtggttgsgttttttmggmmtttttmsssssssssssgtttttgtttmmsmgtttttttmmsmggmsmtttggggttttttttgggmmmmgm....................................................................',
  '..tttsgttgggtttttgggggggtgggggggtgtmsmmmgtttsmgmmggttgmsssssssssssgtttttgtttmmmmmgttttttgssssssssggmgggtttttttttttttttttt....................................................................',
  '..gtgsttttgttttttggggggggggggttttttgsmsssgtgssssgtttgsssssggggmssmgttttgmgggmmggggggtttttsssssmsmgmggmgtttttttttttttttttt....................................................................',
  '..gtgsggttgtttttgggggmmmgggggttttttgssssmgmsssssgttgmssssgttttttggttgtgmssssgttgggggtttttgssssmsmggttmmgttttttttttttttttt....................................................................',
  '..mtmsgggggttttgmmgggmmgggggggtttttgmssssssssssssmmmssssstttttttttttttgmmgggtttttgmgtttttgsmmggmmttttmmggmmgttttttttttttt....................................................................',
  '..mtmsgggggtttgmmmmggmmgggggggtgttttgsssssssssssssssssssgttttttttttttttgttttttttttmsgttttgmttttggttttggtgmsmtttgggttttttt....................................................................',
  '..stssmmmmtttgmmmmggmggggggggggggttttgssssssssssssssmmggttttttttttttttttttttttttttgmgtttgmmtttttggttttttttggttttgtttttttt....................................................................',
  '..stssmmsstttgmmmmgggggggggtttmmsgttttmssssssssssssmtttttttttttttttttttttttttttttttttttggmstttttgmgtttttttttttttttttttttt....................................................................',
  '..stssmssmtttgmmmmmmgggggttgggmmsmtttttmmgggmssssssgttttttttttttttttttttttttttttttttttttgmmgttttmmgtttttttttttttttttttttt....................................................................',
  '..stssmgggggggmmmmmmggggggggmsmmmgttttttttttgssssssgtttttttttttttttttttttttttttttttttttgmmmggtttggttttttttttttttttttttttt....................................................................',
  '..stsstttttgggggggggggggggggmsmggtttttgttttttmmssssgttttttttttttttttttttttttttttttttttttgttggggttttgttgttttttttttttttttgt....................................................................',
  '..stsstttttttgmgggggggggggmggmmgtttgtgggtttttttgsssttttttttttttttttttttttttttttttttttttttttttggttttggggtttttttttttttttttt....................................................................',
  '..stsstttttttgmgggggggggggsmgggtttgggggggtttggggmsmttttttttttttttttttttttttttttttttttttttttttttgttggmgttttttttttttttttttt....................................................................',
  '..stsstttttttgsmmgggggggggmgttggtggggggggttggggggggtttttttttttttttttttttttttttttttttttttttttttttgttggtttttttttttttttttttt....................................................................',
  '..stsstttttttggttttgggggggmgttmmgttggggggtgggmmmmgttttttttggttttttttttttttttttttttttttttttttttttgtttttttttttttttttttttttt....................................................................',
  '..stsmtttttttttttttgggggggggtgmsgttggggggggggmmmmggttttttttgtttttttttttttttttttttttttttttgggtttttgttttttttttttttttttttttt....................................................................',
  '..stsgttttttttttttttttttggggtgmsgtgmggggggggmsmsssmggttgttttttttttttttttttttttttttttttttttggtttttggggtttttttttttttttttttt....................................................................',
  '..stsmtttttttttttttttttttgggtmssmtggggggggggsssssssmmtttttttttttttttttttttgtttttttttttttttggtttttggmgggttttttttttttgttttt....................................................................',
  '..stssttttttttttttttttttttggggssmgggggggttgmsssssssmsggggttttttgtttttttttggtttttttttttttttgtttttgggmgttttttttttttttgttttt....................................................................',
  '..stssgttttttttttttttttttttgggmsmgggggggttggmsssssssssssmtttgggmsmgtttttttgtttttttttgtttttttttttttttttttttttttttttttttttt....................................................................',
  '..stssttttttttggttttttttttttgggmmgggmgggttggmsssssssssssmggsssssssssssssssmtttttttttgtttttttttttttttttttttttttttttttttttt....................................................................',
  '..stssttttttttggttttttttttttgttmsggmmgggtggmsssssssssssmmmsssssmgmssssssmssssttttttggtggggtttgttttttttttttttttttttttttttt....................................................................',
  '..stssttttttttgtttttttttttttgggmmgggggggggmssssssssssmmmmssmmgggggggggmmmgttssssgtttggggggtttttttttttttttttttttttttgttmsm....................................................................',
  '..gtgsttttttttgtttttttttttgggggmmmmgggggggsssssssssssmmssssggg..gtgtggggmsmggggssssssmggggttttttttttttttttttttgssssssssss....................................................................',
  '..tttgsmttttttgttttttttttgggmmmmmmmmmgtgtgmssssssssssmmmmssmmg.....gggmmmgttssssgtttggggggtttttttttttttttttttttttttgttmst....................................................................',
  '..ttttgsssgttgggttttttttttgggggmmmmgggg......................................................................................................................................................',
  '..tttgsmttttttgtttttt........................................................................................................................................................................',
  '..t..........................................................................................................................................................................................'
];
const F2O: [number, number] = [-560, -440];
const field2: Spec = {
  name: 'open ground behind the churches', axis: [1, 0], origin: F2O, storey: 2.4, style: ST_HOUSE, roofColor: '#7d7a72', fascia: '#e9e8e3', pitch: 0.2,
  blocks: [], keep: [],
  extras: (k: Kit) => openGround(k, F2O, FIELD2, -849, -636, 3, 73, 9, 4),
};

/** St. Thomas Aquinas, the Interdenominational Church, the Anglican church and hall, and the open ground west of them */
export const churchSite = createSite('churches', [stThomas, lic, anglicanChurch, anglicanHall, field, field2]);
