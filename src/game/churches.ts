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
const ROAD: [number, number][] = [[-446.3, -315.3], [-418.4, -313.5], [-382.5, -309.5], [-352.5, -308.9], [-312, -308.0], [-292, -306.6], [-284.6, -304.6]];
const fenceX = (z: number) => {
  for (let i = 0; i < ROAD.length - 1; i++) { const [za, xa] = ROAD[i], [zb, xb] = ROAD[i + 1]; if (z >= za && z <= zb) return xa + ((xb - xa) * (z - za)) / (zb - za) - 6; }
  return (z < ROAD[0][0] ? ROAD[0][1] : ROAD[ROAD.length - 1][1]) - 6;
};

// ---------- facades ----------
const WHITE = '#f3f2ec', KHAKI = '#b9ad8e', LAVENDER = '#a9a3dc', TILE_BR = '#9a4a36', TILE_RED = '#b5443a', TILE_OR = '#c4683f', TILE_DK = '#5e3a2c';
/** white render over a khaki base, wide dark windows (St. Thomas Aquinas, photos 2 and 3) */
const darkWin = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#dcd8cc'; g.fillRect(x - 6, y - 6, w + 12, h + 12);
  g.fillStyle = '#1a1714'; g.fillRect(x, y, w, h);
  g.fillStyle = '#2c2621'; for (let i = 1; i < 3; i++) g.fillRect(x + (w * i) / 3 - 2, y, 4, h);
};
const ST_WALL: Style = {
  bay: 4.2, up: [[40, 60, 176, 110]], ground: [[40, 256 + 104, 176, 100]],
  draw: (g) => {
    render(g, WHITE); speckle(g, 0, 0, 256, 512, 400, ['rgba(140,134,120,0.12)']);
    g.fillStyle = 'rgba(150,146,136,0.45)'; g.fillRect(0, 0, 2, 512); g.fillRect(254, 0, 2, 512);
    darkWin(g, 40, 60, 176, 110);
    g.fillStyle = KHAKI; g.fillRect(0, 512 - 92, 256, 92); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 512 - 94, 256, 2);
    darkWin(g, 40, 256 + 104, 176, 100);
  },
};
/** the church's own walls: tall narrow windows in white surrounds */
const ST_NAVE: Style = {
  bay: 3.6, up: [[100, 30, 56, 200]], ground: [[100, 256 + 40, 56, 150]],
  draw: (g) => { render(g, WHITE); speckle(g, 0, 0, 256, 512, 300, ['rgba(140,134,120,0.12)']); darkWin(g, 100, 30, 56, 200); darkWin(g, 100, 256 + 40, 56, 150); g.fillStyle = KHAKI; g.fillRect(0, 512 - 60, 256, 60); },
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
const NAVE = [-373.5, -346.5, -345.0, -312.0], PORCH = [-360.8, -350.2, -312.0, -303.5];
const AN_E = [-346.5, -336.0, -350.5, -321.0], AN_N = [-382.0, -346.5, -350.5, -345.0], AN_W = [-382.0, -373.5, -345.0, -329.0];
const HOUSE_N = [-397.0, -372.5, -326.0, -284.1], HOUSE_S = [-389.6, -371.0, -284.1, -251.0], LODGE = [-392.0, -384.0, -354.0, -343.0];
const SST = 3.6;
const stThomas: Spec = (() => {
  const { X, Z, B } = frameOf(SO);
  const R = (r: number[], floors: number, more: object = {}) => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors, ...more });
  return {
    name: 'St. Thomas Aquinas Catholic Church',
    axis: [1, 0], origin: SO, storey: SST, style: ST_WALL, roofColor: TILE_BR, fascia: WHITE, pitch: 0.42, plinth: '#a89c7d',
    replaces: [[-358, -330], [-385, -305], [-380, -265], [-388, -348.5], [-344.8, -349.1], [-380, -331.5]],
    blocks: [
      R(NAVE, 2, { faces: { x0: ST_NAVE, x1: ST_NAVE, z0: ST_NAVE, z1: ST_NAVE } }),
      R(PORCH, 1, { faces: { z1: ST_NAVE } }),
      R(AN_E, 1, { roof: 'flat' }), R(AN_N, 1, { roof: 'flat' }), R(AN_W, 1, { roof: 'flat' }),
      R(HOUSE_N, 2, { roofColor: TILE_RED, faces: { x0: ST_HOUSE, x1: ST_HOUSE, z0: ST_HOUSE, z1: ST_HOUSE } }),
      R(HOUSE_S, 2, { roofColor: TILE_RED, faces: { x0: ST_HOUSE, x1: ST_HOUSE, z0: ST_HOUSE, z1: ST_HOUSE } }),
      R(LODGE, 1, { roofColor: '#6b4a3a', faces: { x0: ST_HOUSE, x1: ST_HOUSE, z0: ST_HOUSE, z1: ST_HOUSE } }),
    ],
    keep: [[X(-370), X(-338), Z(-303.5), Z(-288)], [X(-337), X(-329), Z(-353), Z(-345)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      const e1 = k.wallTop(1), e2 = k.wallTop(2);
      // the church's broad white fascia under its roof
      for (const [a, b, z0, z1] of [[NAVE[0] - 0.85, NAVE[1] + 0.85, NAVE[2] - 0.85, NAVE[2] - 0.75], [NAVE[0] - 0.85, NAVE[1] + 0.85, NAVE[3] + 0.75, NAVE[3] + 0.85], [NAVE[0] - 0.85, NAVE[0] - 0.75, NAVE[2] - 0.85, NAVE[3] + 0.85], [NAVE[1] + 0.75, NAVE[1] + 0.85, NAVE[2] - 0.85, NAVE[3] + 0.85]]) c.push([B(a, b, e2 - 0.75, e2 + 0.05, z0, z1), WHITE]);
      // the low range round it: a parapet, a white railing round its roof
      for (const r of [AN_E, AN_N, AN_W]) {
        c.push([B(r[0], r[1], e1, e1 + 0.5, r[2], r[2] + 0.2), WHITE], [B(r[0], r[1], e1, e1 + 0.5, r[3] - 0.2, r[3]), WHITE]);
        c.push([B(r[0], r[0] + 0.2, e1, e1 + 0.5, r[2], r[3]), WHITE], [B(r[1] - 0.2, r[1], e1, e1 + 0.5, r[2], r[3]), WHITE]);
      }
      const rail = (ax: number, az: number, bx: number, bz: number) => {
        const len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 1.2));
        k.plain.push([new THREE.BoxGeometry(len, 0.05, 0.05).rotateY(-Math.atan2(bz - az, bx - ax)).translate(X((ax + bx) / 2), e1 + 1.45, Z((az + bz) / 2)), '#f4f4f2']);
        for (let i = 0; i <= n; i++) { const x = ax + ((bx - ax) * i) / n, z = az + ((bz - az) * i) / n; k.plain.push([B(x - 0.03, x + 0.03, e1 + 0.5, e1 + 1.45, z - 0.03, z + 0.03), '#f4f4f2']); }
      };
      rail(AN_E[1] - 0.1, AN_E[2] + 0.1, AN_E[1] - 0.1, AN_E[3] - 0.1); rail(AN_N[0] + 0.1, AN_N[2] + 0.1, AN_E[1] - 0.1, AN_N[2] + 0.1);
      // the door up steps in the range's east face (photo 3), black handrails
      const ex = AN_E[1], dz = -334.5;
      k.plain.push([B(ex, ex + 0.04, 0.9, 3.5, dz - 1.0, dz + 1.0), '#3a2620'], [B(ex + 0.04, ex + 0.06, 0.95, 3.45, dz - 0.02, dz + 0.02), '#5a3e30']);
      for (let i = 0; i < 4; i++) c.push([B(ex, ex + 1.6 - i * 0.4, 0, 0.9 - i * 0.22, dz - 1.2, dz + 1.2), '#cfcac0']);
      for (const z of [dz - 1.15, dz + 1.15]) k.plain.push([new THREE.BoxGeometry(1.8, 0.05, 0.05).rotateZ(-0.5).translate(X(ex) + 0.8, 1.6, Z(z)), '#161616'], [B(ex + 1.5, ex + 1.56, 0, 1.1, z - 0.03, z + 0.03), '#161616']);
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
      // the porch: double doors in the church's south side, steps down to the court
      k.plain.push([B(-357.2, -353.8, 0.4, 3.4, PORCH[3], PORCH[3] + 0.04), '#3a2620']);
      for (let i = 0; i < 3; i++) c.push([B(-358 - i * 0.3, -353 + i * 0.3, 0, 0.4 - i * 0.13, PORCH[3], PORCH[3] + 0.5 + i * 0.4), '#cfcac0']);
      // the paved court south of the church: a lawn strip down its middle, a statue on a plinth
      k.plain.push([B(-368, -340, 0.02, 0.07, -303.5, -289.5), '#a7a399'], [B(-357.5, -353.5, 0.07, 0.1, -302, -290.5), '#6f8f3c']);
      c.push([B(-344.5, -343.5, 0, 1.0, -298, -297), '#d9d6cc']);
      k.plain.push([new THREE.CylinderGeometry(0.22, 0.3, 1.6, 10).translate(X(-344), 1.8, Z(-297.5)), '#f2f0ea'], [new THREE.SphereGeometry(0.2, 10, 8).translate(X(-344), 2.75, Z(-297.5)), '#f2f0ea']);
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
      fence(-354.8, -288.5); fence(-277.0, -262.5);
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
      wallRun(-446.0, gz0); wallRun(gz1, -355.2);
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

// ---------- the open ground west of the churches (the owner's green line) ----------
const FO: [number, number] = [-436, -348];
const field: Spec = (() => {
  const { X, Z, B } = frameOf(FO);
  const H = FIELD.length, W = FIELD[0].length;
  return {
    name: 'open ground west of the churches', axis: [1, 0], origin: FO, storey: 2.4, style: ST_HOUSE, roofColor: '#7d7a72', fascia: '#e9e8e3', pitch: 0.2,
    replaces: [[-428, -400], [-427.7, -385.7]],
    blocks: [],
    keep: [],
    extras: (k: Kit) => {
      const P = 10;
      const soil = ['#a8714a', '#b27d52', '#9d6943'], mixed = ['#9a7c4c', '#8d7a49', '#a2814f'], grass = ['#7c8a45', '#6e7f3e', '#879348', '#8a8a4c'];
      const tex = canvas(W * P, H * P, (g) => {
        g.clearRect(0, 0, W * P, H * P);
        for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
          const ch = FIELD[j][i];
          if (ch === '.') continue;
          const pal = ch === 's' ? soil : ch === 'm' ? mixed : grass;
          g.fillStyle = pal[(i * 7 + j * 13) % pal.length]; g.fillRect(i * P, j * P, P, P);
        }
        // soften the cells into patches: blobs of each cell's colour overlapping its neighbours
        for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
          const ch = FIELD[j][i];
          if (ch === '.') continue;
          const pal = ch === 's' ? soil : ch === 'm' ? mixed : grass;
          g.fillStyle = pal[((i + 1) * (j + 3)) % pal.length]; g.globalAlpha = 0.6;
          g.beginPath(); g.ellipse((i + 0.5) * P + (rnd() - 0.5) * 4, (j + 0.5) * P + (rnd() - 0.5) * 4, P * 0.9, P * 0.75, rnd() * 3, 0, Math.PI * 2); g.fill();
        }
        g.globalAlpha = 1;
        speckle(g, 0, 0, W * P, H * P, 9000, ['rgba(70,90,40,0.35)', 'rgba(150,100,60,0.35)', 'rgba(200,170,120,0.25)']);
        // a little gap round the outside cells keeps them transparent
        g.globalCompositeOperation = 'destination-out';
        for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (FIELD[j][i] === '.') g.fillRect(i * P - 2, j * P - 2, P + 4, P + 4);
        g.globalCompositeOperation = 'source-over';
      });
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, transparent: true, alphaTest: 0.5 });
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(W * FC, H * FC).rotateX(-Math.PI / 2), mat);
      ground.position.set(X(FX0 + (W * FC) / 2), 0.03, Z(FZ0 + (H * FC) / 2));
      ground.receiveShadow = true;
      k.meshes.push(ground);
      // the bushes and trees where the aerial shows them: a tree on some cells, bushes on the others
      const g = garden([FX0 - 5, FX0 + W * FC + 5, FZ0 - 5, FZ0 + H * FC + 5]);
      g.reseed(71);
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
        if (FIELD[j][i] !== 't') continue;
        const x = FX0 + (i + 0.5) * FC + (g.rand() - 0.5) * 1.2, z = FZ0 + (j + 0.5) * FC + (g.rand() - 0.5) * 1.2;
        if ((i + 2 * j) % 5 === 0) g.tree(k, X(x), Z(z), 1.3 + g.rand() * 0.8);
        else if ((i + j) % 2 === 0) g.bush(k, X(x), Z(z), 0.8 + g.rand() * 0.6);
      }
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

/** St. Thomas Aquinas, the Interdenominational Church and the open ground west of them */
export const churchSite = createSite('churches', [stThomas, lic, field]);
