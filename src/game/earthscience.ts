// The Department of Earth Science on Nsia Road, from the owner's marked aerial (registered at 0.25 m/px) and photos of
// its front and the back of its storey building (block engine: blocks.ts; its raised ground and front stair:
// relief.ts).
//
// The whole complex stands on ground raised behind rubble-stone retaining walls (the owner's photos of the front).
// The storey building (owner's yellow lines) is one connected building: a long bar of three floors along the north, a
// taller cross block in its middle with a porch of tall columns on its north side, and two arms south from it. White,
// glass windows in grey frames, a deep red band round its foot; along its back (north, photo 5) galleries on both
// upper floors behind a railing of square-gridded metal bars, over a covered walk on columns with red feet.
// The one-floor ranges (violet lines) are connected without gaps round the courtyard: west along the road, across the
// middle, along the front (south) and up the east. White, black wooden windows with lattice bars, verandahs on square
// white columns with red feet. In the middle of the front the entrance block, one floor: a porch between two columns,
// black lattice windows each side of the door (the owner's blue mark), its name over it; the broad stair up to it in
// two flights between stone-faced planters, the stone walls running off either side with the lawn raised behind them.
import * as THREE from 'three';
import { box, canvas, merge, speckle, type Part } from './modelkit';
import { BAND, PL, createSite, render, type Block, type Kit, type Spec, type Style } from './blocks';
import { concrete, panel, stoneMesh } from './concrete';
import { garden } from './gardens';
import { hipRoof } from './waccbip';
import { stairsOf } from './relief';

const O: [number, number] = [300, 60];
const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
const M = (x: number, z: number): [number, number] => [X(x), Z(z)];
/** the raised ground (relief.ts): the model stands on it, so the ground in front of the walls is this far down */
const RISE = 1.5;
const TILE = '#c25d39', FASCIA = '#3a2a22', WALL = '#f5f4f0', RED = '#a8312b';
const hip = { gw: 0, tri: false }, buried = { gw: 99, tri: false };

/** a glass window in a grey aluminium frame */
const glassWin = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cols: number) => {
  g.fillStyle = '#9ea4a8'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  const gl = g.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, '#5d7080'); gl.addColorStop(0.6, '#27313a'); gl.addColorStop(1, '#171d22');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = '#9ea4a8'; for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - 2, y, 4, h);
  g.fillRect(x, y + h * 0.3, w, 3);
};
/** a black wooden window with lattice bars (the one-floor ranges, owner) */
const latticeWin = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#141210'; g.fillRect(x - 5, y - 5, w + 10, h + 10);
  g.fillStyle = '#2b2622'; g.fillRect(x, y, w, h);
  g.fillStyle = '#0d0b0a';
  for (let t = x + w / 6; t < x + w - 2; t += w / 6) g.fillRect(t - 1.5, y, 3, h);
  for (let t = y + h / 8; t < y + h - 2; t += h / 8) g.fillRect(x, t - 1.5, w, 3);
  g.fillStyle = '#e8e6e0'; g.fillRect(x - 7, y + h + 5, w + 14, 5);
};
const wash = (g: CanvasRenderingContext2D) => { render(g, WALL); speckle(g, 0, 0, 256, 512, 300, ['rgba(130,126,116,0.14)']); };
/** the storey building: glass windows, a red band at the foot */
const Y_WIN: Style = {
  bay: 3.4, up: [[58, 54, 140, 120]], ground: [[58, 256 + 50, 140, 120]],
  draw: (g) => { wash(g); glassWin(g, 58, 54, 140, 120, 3); glassWin(g, 58, 256 + 50, 140, 120, 3); g.fillStyle = RED; g.fillRect(0, 512 - 60, 256, 60); },
};
/** its end walls (photo 5): small high windows, a red foot */
const Y_END: Style = {
  bay: 3.0, up: [[100, 40, 56, 70]], ground: [[40, 256 + 100, 176, 40]],
  draw: (g) => { wash(g); glassWin(g, 100, 40, 56, 70, 1); glassWin(g, 40, 256 + 100, 176, 40, 4); for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(120,116,104,0.18)'; g.fillRect(20 + i * 60, 140, 10, 90); } g.fillStyle = RED; g.fillRect(0, 512 - 60, 256, 60); },
};
/** the one-floor ranges: a black lattice window to a bay, a thin red skirting */
const O_WIN: Style = {
  bay: 3.2, up: [], ground: [[78, 256 + 56, 100, 132]],
  draw: (g) => { wash(g); latticeWin(g, 78, 256 + 56, 100, 132); g.fillStyle = RED; g.fillRect(0, 512 - 20, 256, 20); },
};

// (the aerial, measured)
const BAR = [239.9, 350.3, 31.2, 45.4], CROSS = [285.7, 304.5, 27.0, 51.3], WARM = [253.7, 265.6, 45.4, 68.9], EARM = [324.0, 336.0, 45.4, 68.9];
const WR = [241.8, 251.8, 51.3, 90.8], NR = [251.8, 295.1, 68.9, 82.0], SR = [288.2, 355.4, 82.0, 97.7], EB = [318.3, 336.5, 82.0, 97.0], ER = [339.0, 352.2, 53.2, 82.0];
const YST = 3.3, OST = 3.3, YE = PL + 3 * YST + BAND, OE = PL + OST + BAND;
const R = (r: number[], floors: number, faces: Partial<Record<'x0' | 'x1' | 'z0' | 'z1', Style>> = {}, more: Partial<Block> = {}): Block => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors, roof: 'none', faces, ...more });

/** a railing of square-gridded metal bars (photo 5) */
let gridMat: THREE.MeshStandardMaterial | null = null;
const gridRail = () => (gridMat ??= (() => {
  const t = canvas(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.fillStyle = '#26282b';
    g.fillRect(0, 0, 64, 5); g.fillRect(0, 60, 64, 4);
    for (let x = 0; x < 64; x += 16) g.fillRect(x, 0, 3, 64);
    for (let y = 0; y < 64; y += 16) g.fillRect(0, y, 64, 3);
  });
  return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.5 });
})());

const earthScience: Spec = {
  name: 'Earth Science',
  axis: [1, 0], origin: O, storey: YST, style: Y_WIN, roofColor: TILE, fascia: FASCIA, pitch: 0.45, plinth: RED,
  replaces: [[263.3, 40.1], [296.4, 38.1], [327.3, 41.1], [262.3, 54.5], [328.4, 55.3], [247, 73.9], [272.8, 76.8], [323.3, 91.7], [341.8, 71.1]],
  blocks: [
    R(BAR, 3, { x0: Y_END, x1: Y_END }), R(CROSS, 3), R(WARM, 3), R(EARM, 3),
    R(WR, 1, {}, { floorStyle: { 0: O_WIN } }), R(NR, 1, {}, { floorStyle: { 0: O_WIN } }), R(SR, 1, {}, { floorStyle: { 0: O_WIN } }),
    R(EB, 1, {}, { floorStyle: { 0: O_WIN } }), R(ER, 1, {}, { floorStyle: { 0: O_WIN } }),
  ],
  keep: [[X(238), X(357), Z(20), Z(100)], [X(320), X(334), Z(99), Z(107)]],
  extras: (k: Kit) => {
    const c: Part[] = [], st: Part[] = [];
    // ---- the storey building's roofs: a hip along the bar, the arms buried in it, the cross block taller ----
    hipRoof(k, M, BAR[0] - 0.8, BAR[1] + 0.8, 28.6, BAR[3] + 0.8, YE, 0.45, 'x', [hip, hip], c, FASCIA);
    for (const a of [WARM, EARM]) hipRoof(k, M, a[0] - 0.8, a[1] + 0.8, 40, a[3] + 0.8, YE, 0.45, 'z', [buried, hip], c, FASCIA);
    c.push([B(CROSS[0], CROSS[1], YE - BAND, YE + 1.0, CROSS[2], CROSS[3]), WALL]);
    hipRoof(k, M, CROSS[0] - 0.8, CROSS[1] + 0.8, 23.6, CROSS[3] + 0.8, YE + 1.0, 0.5, 'z', [hip, hip], c, FASCIA);
    // the porch of tall columns before the cross block, rising from the paving down the slope to its roof
    for (const x of [287.0, 291.5, 298.7, 303.2]) {
      const y0 = k.ground(X(x), Z(24.4)) - RISE;
      c.push([B(x - 0.3, x + 0.3, y0, YE + 0.8, 24.1, 24.7), WALL], [B(x - 0.32, x + 0.32, y0, y0 + 0.9, 24.08, 24.72), RED]);
    }
    c.push([B(CROSS[0], CROSS[1], YE + 0.5, YE + 1.0, 23.6, CROSS[2]), WALL]);
    // ---- the galleries along the back (photo 5): a covered walk on columns, both upper floors behind grid railings ----
    const gz = 28.9, wz = BAR[2];
    for (let f = 1; f <= 2; f++) {
      const y = PL + f * YST;
      for (const [a, b] of [[BAR[0] + 0.4, CROSS[0]], [CROSS[1], BAR[1] - 0.4]]) {
        c.push([B(a, b, y - 0.28, y, gz, wz), WALL]);
        panel(O, k, gridRail(), a, gz + 0.05, b, gz + 0.05, y, y + 1.05, 0.9, 1.05);
        k.plain.push([B(a, b, y + 1.02, y + 1.08, gz, gz + 0.12), '#26282b']);
      }
    }
    for (const [a, b] of [[BAR[0] + 0.4, CROSS[0]], [CROSS[1], BAR[1] - 0.4]]) {
      k.plain.push([B(a, b, 0, 0.06, gz, wz), '#c9c4b8']);
      for (let x = a; x <= b + 0.01; x += (b - a) / Math.round((b - a) / 4.2)) {
        c.push([B(x - 0.2, x + 0.2, 0, YE - BAND, gz - 0.1, gz + 0.3), WALL], [B(x - 0.22, x + 0.22, 0, 0.8, gz - 0.12, gz + 0.32), RED]);
      }
      for (let x = a + 2; x < b - 1; x += 4.2) for (const y of [PL + YST - 0.32, PL + 2 * YST - 0.32]) k.plain.push([B(x - 0.4, x + 0.4, y - 0.03, y, gz + 0.8, gz + 1.2), '#fff3d0']);
    }
    // doors and lit rooms along the galleries, a breeze-block panel by the stair at the east end
    for (let x = BAR[0] + 3; x < BAR[1] - 2; x += 7.4) if (x < CROSS[0] - 1 || x > CROSS[1] + 1) for (let f = 0; f < 3; f++) k.plain.push([B(x - 0.5, x + 0.5, PL + f * YST, PL + f * YST + 2.2, wz - 0.04, wz), f ? '#2a2c2f' : '#c9673e']);
    k.plain.push([B(342.5, 344.8, 0.4, PL + YST - 0.4, wz - 0.06, wz), '#e6e4dc']);
    for (let x = 342.6; x < 344.7; x += 0.38) for (let y = 0.5; y < PL + YST - 0.5; y += 0.38) k.plain.push([B(x, x + 0.28, y, y + 0.28, wz - 0.08, wz - 0.05), '#cfcdc6']);
    // ---- the one-floor ranges' roofs, connected round the courtyard ----
    hipRoof(k, M, WR[0] - 0.8, WR[1] + 0.8, WR[2] - 0.8, WR[3] + 0.8, OE, 0.4, 'z', [hip, hip], c, FASCIA);
    hipRoof(k, M, NR[0] - 2, NR[1] + 0.8, NR[2] - 0.8, NR[3] + 0.8, OE, 0.4, 'x', [buried, hip], c, FASCIA);
    hipRoof(k, M, SR[0] - 0.8, SR[1] + 0.8, SR[2] - 0.8, SR[3] + 0.8, OE, 0.4, 'x', [hip, hip], c, FASCIA);
    hipRoof(k, M, ER[0] - 0.8, ER[1] + 0.8, ER[2] - 0.8, ER[3] + 2, OE, 0.4, 'z', [hip, buried], c, FASCIA);
    hipRoof(k, M, EB[0] - 0.8, EB[1] + 0.8, EB[2], 99.6, OE + 0.3, 0.3, 'x', [hip, hip], c, FASCIA);
    // verandahs: square white columns with red feet along the front range and the courtyard side of the middle range
    const cols = (x0: number, x1: number, z: number) => { for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / Math.max(1, Math.round((x1 - x0) / 3.2))) c.push([B(x - 0.18, x + 0.18, 0, OE - 0.3, z - 0.18, z + 0.18), WALL], [B(x - 0.2, x + 0.2, 0, 0.55, z - 0.2, z + 0.2), RED]); };
    cols(SR[0] + 0.4, EB[0] - 0.4, SR[3] + 0.5); cols(EB[1] + 0.4, SR[1] - 0.4, SR[3] + 0.5); cols(NR[0] + 0.4, NR[1] - 0.4, NR[2] - 0.6);
    // ---- the entrance block's porch (owner's blue mark): the door between two columns, lattice windows each side ----
    const pz = EB[3];
    k.plain.push([B(EB[0] + 0.5, EB[1] - 0.5, 0, 0.05, pz, 99.4), '#c9c4b8']);
    for (const x of [324.6, 330.2]) c.push([B(x - 0.25, x + 0.25, 0, OE - 0.2, 98.8, 99.3), WALL], [B(x - 0.27, x + 0.27, 0, 0.6, 98.78, 99.32), RED]);
    k.plain.push([B(326.0, 328.8, 0, 2.4, pz, pz + 0.05), '#1c1a18'], [B(327.37, 327.43, 0, 2.4, pz + 0.05, pz + 0.07), '#3a3430']);
    k.plain.push([B(326.4, 327.3, 1.3, 2.0, pz + 0.07, pz + 0.09), '#f2f0e8']);
    for (const x of [321.8, 333.0]) k.plain.push([B(x - 1.6, x + 1.6, 0.6, 2.6, pz, pz + 0.05), '#141210'], ...Array.from({ length: 7 }, (_, i) => [B(x - 1.6 + i * 0.53, x - 1.55 + i * 0.53, 0.6, 2.6, pz + 0.05, pz + 0.08), '#3a332c'] as Part), ...Array.from({ length: 5 }, (_, i) => [B(x - 1.6, x + 1.6, 0.6 + i * 0.5, 0.65 + i * 0.5, pz + 0.05, pz + 0.08), '#3a332c'] as Part));
    k.plain.push([B(325.6, 329.2, OE - 0.6, OE - 0.15, 99.35, 99.42), '#f2f2ee']);
    k.signs.push({ text: 'DEPARTMENT OF EARTH SCIENCE', x: X(327.4), y: OE - 0.38, z: Z(99.43), ry: 0, w: 3.4, colors: ['#f2f2ee', '#2a2a2a'] });
    // ---- the front: rubble-stone retaining walls along the raised ground, the stair in two flights between planters ----
    const s = stairsOf().find((q) => q.alongZ && q.z0 === 322.5)!;
    for (const [a, b] of [[238.4, s.z0 - 1.6], [s.z1 + 1.6, 356.2]]) st.push([B(a, b, -RISE, 0.35, 99.3, 99.75), '#ffffff']);
    for (const [a, b, z0, z1] of [[238.0, 238.45, 26, 99.75], [356.0, 356.45, 26, 99.75]]) st.push([B(a, b, -RISE, 0.35, z0, z1), '#ffffff']);
    for (let z = s.x1; z < s.x0 - 1e-3; z += 0.45) {
      const y = s.at(Math.min(s.x0 - 0.01, z + 0.22)) - RISE;
      c.push([B(s.z0, s.z1, -RISE, y, z, Math.min(s.x0, z + 0.46)), '#cfcac0']);
    }
    // the planters faced in stone flanking the stair, palms and shrubs in them; the planter walls step down the slope
    for (const [a, b] of [[s.z0 - 1.6, s.z0], [s.z1, s.z1 + 1.6]]) for (let z = 99.3; z < 106.4; z += 1.4) {
      const y = s.at(Math.min(s.x0 - 0.01, z + 0.7)) - RISE;
      st.push([B(a, b, -RISE, y + 0.5, z, z + 1.4), '#ffffff']);
      k.plain.push([B(a + 0.12, b - 0.12, y + 0.5, y + 0.55, z + 0.1, z + 1.3), '#5a4a35']);
    }
    const g = garden([230, 370, 15, 120]);
    g.reseed(67);
    g.palm(k, X(s.z1 + 0.8), Z(101.2), 2.6);
    g.palm(k, X(s.z0 - 0.8), Z(102.6), 2.2);
    for (const [x, z] of [[s.z1 + 0.8, 104.4], [s.z0 - 0.8, 105.6]]) k.plain.push([new THREE.IcosahedronGeometry(0.55, 0).scale(1.2, 0.8, 1).translate(X(x), k.ground(X(x), Z(z)) - RISE + 0.9, Z(z)), '#3f7a2c']);
    // the department's board on two posts beside the stair (photo 3)
    for (const x of [312.2, 314.4]) k.plain.push([B(x - 0.05, x + 0.05, -RISE, -RISE + 2.6, 104.8, 104.9), '#c9ccd0']);
    k.plain.push([B(311.9, 314.7, -RISE + 1.3, -RISE + 2.7, 104.9, 104.96), '#f6f6f3']);
    k.signs.push({ text: 'UNIVERSITY OF GHANA', x: X(313.3), y: -RISE + 2.4, z: Z(104.97), ry: 0, w: 2.3, colors: ['#f6f6f3', '#1d3f7a'] });
    k.signs.push({ text: 'DEPT. OF EARTH SCIENCE', x: X(313.3), y: -RISE + 1.75, z: Z(104.97), ry: 0, w: 2.3, colors: ['#f6f6f3', '#2a2a2a'] });
    // the courtyard: paving, grass plots crossed by paths
    k.plain.push([B(WARM[1], EARM[0], 0, 0.04, BAR[3], 68.9), '#cdc6b6'], [B(NR[1], ER[0], 0, 0.04, 68.9, SR[2]), '#cdc6b6']);
    for (const [a, b, z0, z1] of [[296.5, 309.0, 69.5, 73.5], [310.5, 323.0, 69.5, 73.5], [296.5, 309.0, 75.0, 80.5], [310.5, 323.0, 75.0, 80.5], [324.5, 337.5, 70.5, 80.5]]) k.plain.push([B(a, b, 0.04, 0.08, z0, z1), '#5d8a3a']);
    // the interlocking paving along the back (photo 5), following the ground down to the road
    const pave = canvas(128, 128, (g) => {
      g.fillStyle = '#8a8378'; g.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 8; i++) for (let j = 0; j < 16; j++) { g.fillStyle = ['#a59d91', '#9a9286', '#aea699', '#948c80'][(i * 3 + j) % 4]; g.fillRect(i * 16 + (j % 2) * 8 + 1, j * 8 + 1, 14, 6); }
    });
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    const roadZ = (x: number) => 19.6 - ((x - 234.9) * 9.9) / 138.6 + 2.3;
    const nx = 56, nz = 16;
    for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) {
      const x = 240 + (110 * i) / nx, z0 = roadZ(x), z = z0 + ((BAR[2] - z0) * j) / nz;
      pos.push(X(x), k.ground(X(x), Z(z)) - RISE + 0.05, Z(z)); uv.push(x / 2, z / 2);
    }
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const a0 = i * (nz + 1) + j, b0 = a0 + nz + 1; idx.push(a0, a0 + 1, b0, a0 + 1, b0 + 1, b0); }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); pg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); pg.setIndex(idx); pg.computeVertexNormals();
    const pm = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ map: pave, roughness: 0.95, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
    pm.receiveShadow = true;
    k.meshes.push(pm);
    // the lawn raised behind the walls in front of the ranges
    k.plain.push([B(238.5, 356, 0, 0.03, 97.7, 99.3), '#6b9440']);
    stoneMesh(k, st);
    const m = new THREE.Mesh(merge(c), concrete(0.3));
    m.castShadow = true; m.receiveShadow = true;
    k.meshes.push(m);
  },
};

/** the Department of Earth Science */
export const earthScienceSite = createSite('earth-science', [earthScience]);
