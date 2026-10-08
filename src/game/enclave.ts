// The Innovation Enclave south of the School of Engineering Sciences, from the owner's marked aerial and two photos
// (block engine: blocks.ts; the terrace and its steps: relief.ts).
//
// Six one-floor buildings in a row up the hill, on a terrace behind a white retaining wall along the road (the
// westmost is the Department of Plant Biology). Each runs north-south: white walls with a wine-red border round
// the foot, a gable roof of wine-red metal sheets with its gable ends to the road, and a verandah under the long
// eave on white square columns along the side with the doors (the owner's blue marks: many doors to a building,
// wooden doors and windows behind black grilles). Lawns between the buildings, crossed by paved walks. Three
// flights of steps climb from the road through the wall, the middle one wide. The east building has the UG
// logo on its gable to the road, and INNOVATION ENCLAVE in raised blue letters on the wall beside its steps.
import * as THREE from 'three';
import { box, canvas, rnd, speckle } from './modelkit';
import { PL, createSite, type Block, type Kit, type Spec, type Style } from './blocks';
import { garden } from './gardens';
import { letters } from './letters';
import { stairsOf } from './relief';

const O: [number, number] = [447, -312];
const ST = 3.0, WINE = '#74202f', SHEET = '#6f2230', WHITE_E = '#f7f6f2', PAVER = '#a8917d';
const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
/** the terrace's height (relief.ts) */
const T = 2;

// ---------- facades ----------
const white = (g: CanvasRenderingContext2D) => { g.fillStyle = WHITE_E; g.fillRect(0, 0, 256, 512); speckle(g, 0, 0, 256, 512, 1500, ['#efeee9', '#fbfaf7', '#e9e7e1']); };
/** a window behind a black burglar-proof grille */
function grilledWindow(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  g.fillStyle = '#d9d6cf'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  g.fillStyle = '#2b3036'; g.fillRect(x, y, w, h);
  g.fillStyle = '#16181b';
  for (let gx = x + 6; gx < x + w; gx += 10) g.fillRect(gx, y, 3, h);
  for (let gy = y + 8; gy < y + h; gy += 22) g.fillRect(x, gy, w, 3);
}
/** the verandah side: a wooden door and a grilled window to a bay (the ground half of the canvas is the storey) */
const DOORS: Style = {
  bay: 3.2, up: [], ground: [[30, 256 + 40, 70, 210], [130, 256 + 70, 96, 100]],
  draw: (g) => {
    white(g);
    g.fillStyle = '#e1ddd4'; g.fillRect(24, 256 + 34, 82, 222);
    g.fillStyle = '#b4622c'; g.fillRect(30, 256 + 40, 70, 216);
    g.fillStyle = '#8f4a1f'; g.fillRect(64, 256 + 40, 2, 216); g.fillRect(30, 256 + 120, 70, 2);
    g.fillStyle = '#1a1a1a'; g.fillRect(88, 256 + 150, 6, 10);
    grilledWindow(g, 130, 256 + 70, 96, 100);
  },
};
/** the back and the gable ends: grilled windows high in the wall */
const WINS: Style = {
  bay: 3.4, up: [], ground: [[70, 256 + 60, 116, 90]],
  draw: (g) => { white(g); grilledWindow(g, 70, 256 + 60, 116, 90); },
};
let paverMat: THREE.MeshStandardMaterial | null = null;
/** brick pavers laid in a herringbone-ish running bond */
const pavers = () => (paverMat ??= new THREE.MeshStandardMaterial({
  roughness: 1,
  map: (() => {
    const t = canvas(128, 128, (g) => {
      g.fillStyle = '#7d6a5c'; g.fillRect(0, 0, 128, 128);
      for (let y = 0; y < 128; y += 16) for (let x = (y / 16) % 2 ? -16 : 0; x < 128; x += 32) {
        g.fillStyle = ['#a8917d', '#9d8573', '#b29b86', '#a38b76'][(rnd() * 4) | 0];
        g.fillRect(x + 1, y + 1, 30, 14);
      }
    });
    t.repeat.set(1, 1);
    return t;
  })(),
}));

// ---------- the six buildings ----------
interface House { x0: number; x1: number; z0: number; z1: number; door: 'w' | 'e'; roof: string }
const HOUSES: House[] = [
  { x0: 401.6, x1: 411.2, z0: -326.4, z1: -299.8, door: 'e', roof: '#c9806c' }, // the Department of Plant Biology
  { x0: 421, x1: 429.8, z0: -326.6, z1: -298.9, door: 'w', roof: SHEET },
  { x0: 433.2, x1: 442.1, z0: -326.9, z1: -298.2, door: 'w', roof: SHEET },
  { x0: 452.5, x1: 461.2, z0: -325.9, z1: -298, door: 'e', roof: SHEET },
  { x0: 464.4, x1: 473.6, z0: -326.3, z1: -298, door: 'w', roof: SHEET },
  { x0: 483.5, x1: 492, z0: -325.1, z1: -297.8, door: 'w', roof: SHEET },
];
const VER = 2.0, OVH = 0.45, PITCH = 0.32;
/** the enclosed part of a building: the outline less the verandah and the eaves */
const core = (h: House): Block => {
  const x0 = h.x0 + OVH + (h.door === 'w' ? VER : 0), x1 = h.x1 - OVH - (h.door === 'e' ? VER : 0);
  return { x0: X(x0), x1: X(x1), z0: Z(h.z0 + OVH), z1: Z(h.z1 - OVH), floors: 1, roof: 'none', y: T, faces: { [h.door === 'w' ? 'x0' : 'x1']: DOORS } };
};

function house(k: Kit, h: House) {
  const eave = T + PL + ST + 0.4, mid = (h.x0 + h.x1) / 2, half = (h.x1 - h.x0) / 2, ridge = eave + half * PITCH;
  const zn = h.z0, zs = h.z1;
  // the roof: two slopes of sheeting, a ridge cap, dark fascias along the eaves
  const slope = Math.hypot(half, half * PITCH), a = Math.atan(PITCH);
  for (const s of [-1, 1]) {
    k.plain.push([new THREE.BoxGeometry(slope, 0.08, zs - zn).rotateZ(-s * a).translate(X(mid + (s * half) / 2), (eave + ridge) / 2 + 0.04, Z((zn + zs) / 2)), h.roof]);
    k.plain.push([B(s < 0 ? h.x0 - 0.04 : h.x1, s < 0 ? h.x0 : h.x1 + 0.04, eave - 0.22, eave + 0.04, zn, zs), '#4a1620']);
  }
  k.plain.push([B(mid - 0.18, mid + 0.18, ridge + 0.02, ridge + 0.14, zn, zs), '#5a1a26']);
  // the gable triangles (white), and their barge boards
  const cx0 = h.x0 + OVH, cx1 = h.x1 - OVH, top = T + PL + ST + 0.4;
  for (const [zz, dir] of [[zn + OVH, -1], [zs - OVH, 1]] as [number, number][]) {
    const tri = new THREE.Shape([new THREE.Vector2(X(cx0), top), new THREE.Vector2(X(cx1), top), new THREE.Vector2(X(mid), top + (half - OVH) * PITCH)]);
    k.plain.push([new THREE.ShapeGeometry(tri).translate(0, 0, Z(zz) + dir * 0.01), WHITE_E]);
    k.plain.push([new THREE.ShapeGeometry(tri).rotateY(Math.PI).translate(2 * X(mid), 0, Z(zz) - dir * 0.01), WHITE_E]);
    for (const s of [-1, 1]) k.plain.push([new THREE.BoxGeometry(slope, 0.25, 0.06).rotateZ(-s * a).translate(X(mid + (s * half) / 2), (eave + ridge) / 2 - 0.08, Z(dir < 0 ? zn : zs)), '#4a1620']);
    // a lamp high on the gable end
    k.plain.push([B(mid - 0.15, mid + 0.15, top - 0.5, top - 0.2, zz + dir * 0.02, zz + dir * 0.25), '#2c2c2c']);
  }
  // the verandah: a raised floor with a wine-red edge, square white columns to the eave, wine-red feet
  const v0 = h.door === 'w' ? h.x0 + OVH : h.x1 - OVH - VER, v1 = v0 + VER, edge = h.door === 'w' ? v0 + 0.15 : v1 - 0.15;
  k.plain.push([B(v0, v1, T - 0.1, T + PL - 0.05, zn + OVH, zs - OVH), WINE], [B(v0 + 0.03, v1 - 0.03, T + PL - 0.05, T + PL, zn + OVH + 0.03, zs - OVH - 0.03), '#d8d2c6']);
  for (let z = zn + OVH + 0.2; z <= zs - OVH - 0.1; z += 3.2) {
    k.plain.push([B(edge - 0.15, edge + 0.15, T + PL, eave - 0.05, z - 0.15, z + 0.15), WHITE_E]);
    k.plain.push([B(edge - 0.17, edge + 0.17, T + PL, T + PL + 0.35, z - 0.17, z + 0.17), WINE]);
  }
  // a brick-paved walk along the verandah, a step down to it
  const w0 = h.door === 'w' ? h.x0 - 1.6 : h.x1, w1 = w0 + 1.6;
  const walk = new THREE.Mesh(new THREE.PlaneGeometry(w1 - w0, zs - zn).rotateX(-Math.PI / 2), pavers());
  (walk.geometry.attributes.uv as THREE.BufferAttribute).array.forEach((_, j, arr) => { (arr as Float32Array)[j] *= j % 2 ? (zs - zn) / 2 : (w1 - w0) / 2; });
  walk.position.set(X((w0 + w1) / 2), T + 0.03, Z((zn + zs) / 2));
  walk.receiveShadow = true;
  k.meshes.push(walk);
}

const SPEC: Spec = {
  name: 'Innovation Enclave',
  axis: [1, 0], origin: O, storey: ST, style: WINS, roofColor: SHEET, fascia: '#4a1620', pitch: PITCH,
  plinth: WINE,
  onGround: true,
  replaces: HOUSES.map((h) => [(h.x0 + h.x1) / 2 + (h.door === 'w' ? 1.5 : -1.5), (h.z0 + h.z1) / 2] as [number, number]),
  blocks: HOUSES.map(core),
  keep: [
    [X(397), X(497), Z(-333.4), Z(-326.9)],
    ...HOUSES.map((h) => [X(h.door === 'w' ? h.x0 - 1.7 : h.x1 - 2.5), X(h.door === 'w' ? h.x0 + 2.5 : h.x1 + 1.7), Z(h.z0), Z(h.z1)] as [number, number, number, number]),
  ],
  extras: (k: Kit) => {
    for (const h of HOUSES) house(k, h);

    // the retaining wall along the road, white, with a parapet; gaps for the three flights of steps (it stands clear
    // of the road's verge and drain, which stay at road level)
    const stairs = stairsOf().filter((s) => s.alongZ && s.z0 > 400);
    const gaps = stairs.map((s) => [s.z0, s.z1]).sort((a, b) => a[0] - b[0]);
    let from = 397;
    for (const [g0, g1] of [...gaps, [497, 497]]) {
      if (g0 - from > 0.1) {
        k.plain.push([B(from, g0, -0.3, T + 0.9, -332.5, -332.1), WHITE_E]);
        k.plain.push([B(from, g0, T + 0.9, T + 1.0, -332.6, -332.0), '#e6e3dc']);
      }
      from = g1;
    }
    // the steps: treads and risers, white cheek walls either side stepping up with them
    for (const s of stairs) {
      const n = s.steps, run = Math.abs(s.x1 - s.x0) / n;
      for (let j = 0; j < n; j++) {
        const za = s.x0 + j * run, y = s.at(za + run / 2);
        k.plain.push([B(s.z0, s.z1, y - 0.25, y, za, za + run + 0.02), '#cfcac0']);
      }
      for (const x of [s.z0 - 0.3, s.z1]) {
        for (let j = 0; j < n; j++) {
          const za = s.x0 + j * run, y = s.at(za + run / 2);
          k.plain.push([B(x, x + 0.3, -0.3, y + 0.9, za, za + run + 0.02), WHITE_E]);
        }
        k.plain.push([B(x, x + 0.3, -0.3, T + 0.9, s.x1, -326.9), WHITE_E]);
      }
    }
    // a paved walk along the top of the wall in front of the buildings, and walks across the lawns
    for (const [x0, x1, z0, z1] of [[399, 495, -328.1, -327.0], [411.2, 421, -312.8, -311.6], [442.1, 452.5, -312.8, -311.6], [473.6, 483.5, -310.8, -309.6]]) {
      k.plain.push([B(x0, x1, T - 0.05, T + 0.03, z0, z1), '#d6d1c6']);
    }
    // the UG logo on the east building's gable to the road, and INNOVATION ENCLAVE in raised blue letters on the
    // wall beside its steps (owner)
    const e = HOUSES[5], ex = (e.x0 + e.x1) / 2;
    k.plain.push([B(ex - 1.55, ex - 1.0, T + 2.1, T + 2.85, e.z0 + OVH - 0.08, e.z0 + OVH), '#1d3f8f']);
    k.plain.push([B(ex - 1.48, ex - 1.07, T + 2.2, T + 2.75, e.z0 + OVH - 0.1, e.z0 + OVH - 0.08), '#e9c45a']);
    letters(k, 'UG', X(ex + 0.2), T + 2.45, Z(e.z0 + OVH), Math.PI, 0.7, 0.08, '#1d2a4f');
    letters(k, 'INNOVATION', X(487), 1.9, Z(-332.5), Math.PI, 0.34, 0.06, '#1f56b8');
    letters(k, 'ENCLAVE', X(487), 1.35, Z(-332.5), Math.PI, 0.34, 0.06, '#1f56b8');
    // sign boards on posts: the university's board before the middle buildings, the enclave's by the road
    const board = (x: number, z: number, y: number, text: string, w: number) => {
      for (const s of [-1, 1]) k.plain.push([B(x + s * (w / 2 - 0.1) - 0.04, x + s * (w / 2 - 0.1) + 0.04, y, y + 2.4, z - 0.04, z + 0.04), '#9ea2a6']);
      k.plain.push([B(x - w / 2, x + w / 2, y + 1.3, y + 2.4, z - 0.05, z + 0.03), '#f4f4f1']);
      k.signs.push({ text, x: X(x), y: y + 2.1, z: Z(z - 0.07), ry: Math.PI, w: w * 0.85, colors: ['#f4f4f1', '#1d3f8f'] });
    };
    board(457, -330, T, 'UNIVERSITY OF GHANA', 1.6);
    board(494.5, -334.6, 0, 'INNOVATION ENCLAVE', 1.8);

    const g = garden([395, 500, -336, -294]);
    g.reseed(29);
    for (const [x, z] of [[431.5, -322], [446.5, -305], [478, -320], [396.5, -318], [495.5, -305]]) g.bush(k, X(x), Z(z), 0.9);
    for (const [x, z] of [[447.2, -318.5], [478.2, -305], [416, -303]]) g.tree(k, X(x), Z(z), 0.8);
  },
};

/** the Innovation Enclave's six buildings on their terrace */
export const enclave = createSite('enclave', [SPEC]);
