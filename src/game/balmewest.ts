// South-west of the Balme Library, from the owner's photos and marked aerial (registered at 0.25 m/px; block engine:
// blocks.ts): the French Department (the Faculty of Arts' H-shaped block west of W.E.B. Dubois Road), and inside the
// owner's white circle east of the road the long two-storey block on the Balme square, the Office of the Dean of
// Student Affairs, the University Post Office, the GCB ATM and the mast between them, round a car park.
//
// All of them: white walls, black wooden louvred windows (owner: wood, not glass, and black), orange clay tile roofs,
// gable ends boarded in dark timber; a deep red band round the foot of the walls on the blocks inside the circle; low
// walls and platforms faced in rubble stone with a concrete cap (owner's yellow marks).
//
// French Department: two floors; a door at the south end of its west wing, an open passage (no door, no gate) through
// the range's ground floor beside it, a door next to that (owner's marks).
// The long block (photos 2 and 5): two floors along the square, its gables to the roads north and south, a raised
// lantern with a band of dark louvres over its middle; on the car park side a portico of two tall columns before
// the door in the middle, verandahs with square columns along the upper floor either side, water tanks.
// The Office of the Dean of Student Affairs (photo 2): one floor along the road north of the car park, its name on
// the road side, the internal mail office's door at its east end, a stone-faced bed along its south.
// The Post Office (photo 3): one floor, faded white, darker old tiles; UNIVERSITY POST OFFICE over a recessed porch
// in its west gable, red door and boxes, a stone-faced platform along the verandah on its north side, the wall of
// red post boxes under a canopy; the yellow GCB ATM kiosk on the car park, the red and white mast behind it.
import * as THREE from 'three';
import { box, canvas, merge, speckle, tri2, type Part } from './modelkit';
import { BAND, PL, createSite, render, type Block, type Kit, type Spec, type Style } from './blocks';
import { concrete } from './concrete';
import { garden } from './gardens';
import { hipRoof } from './waccbip';

const WALL = '#f4f2ec', DADO = '#9b2b25', TILE = '#c4623d', BARGE = '#2b221c', TIMBER: [string, string] = ['#33251b', '#4a3526'];

/** a black wooden louvred window: dark slats in a black frame, two leaves, a white sill */
const blackLouvre = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = 'rgba(80,76,70,0.3)'; g.fillRect(x - 6, y - 5, w + 12, h + 10);
  g.fillStyle = '#121212'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  for (let t = y; t < y + h; t += 8) { g.fillStyle = '#2c2a27'; g.fillRect(x, t, w, 5); g.fillStyle = '#0d0d0c'; g.fillRect(x, t + 5, w, 3); }
  g.fillStyle = '#121212'; g.fillRect(x + w / 2 - 2, y, 4, h);
  g.fillStyle = '#e8e6e0'; g.fillRect(x - 7, y + h + 4, w + 14, 5);
};
const paint = (g: CanvasRenderingContext2D, base = WALL) => { render(g, base); speckle(g, 0, 0, 256, 512, 300, ['rgba(140,136,126,0.14)']); };
const dado = (g: CanvasRenderingContext2D) => { g.fillStyle = DADO; g.fillRect(0, 512 - 46, 256, 46); speckle(g, 0, 512 - 46, 256, 46, 120, ['#8a241f', '#a8342c']); };
/** a black louvred window to a bay on each floor (the photos: well spaced), optionally the red band at the foot */
const winStyle = (withDado: boolean, bay: number, w: number, base = WALL): Style => ({
  bay, up: [[128 - w / 2, 50, w, 126]], ground: [[128 - w / 2, 256 + 60, w, 130]],
  draw: (g) => {
    paint(g, base);
    blackLouvre(g, 128 - w / 2, 50, w, 126); blackLouvre(g, 128 - w / 2, 256 + 60, w, 130);
    if (withDado) dado(g);
  },
});
const W_DADO = winStyle(true, 3.0, 76), W_PLAIN = winStyle(false, 3.4, 92), W_DEAN = winStyle(true, 3.3, 96);
/** the long block's upper verandahs on the car park side: deep shade behind the columns, doors and louvres in it */
const W_VERANDAH: Style = {
  bay: 3.2, up: [[60, 40, 60, 200], [150, 70, 70, 110]], ground: [[38, 256 + 64, 70, 124], [148, 256 + 64, 70, 124]],
  draw: (g) => {
    paint(g);
    g.fillStyle = '#3b3935'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#2a2826'; g.fillRect(60, 40, 60, 216);
    blackLouvre(g, 150, 70, 70, 110);
    g.fillStyle = '#4a4741'; g.fillRect(0, 0, 256, 18);
    for (const y of [256 + 64]) { blackLouvre(g, 38, y, 70, 124); blackLouvre(g, 148, y, 70, 124); }
    dado(g);
  },
};
/** the middle of the long block toward the car park: a row of small windows up, louvres and the red band down */
const W_PORTICO: Style = {
  bay: 2.6, up: [[88, 70, 80, 70]], ground: [[70, 256 + 64, 116, 124]],
  draw: (g) => { paint(g); blackLouvre(g, 88, 70, 80, 70); blackLouvre(g, 70, 256 + 64, 116, 124); dado(g); },
};
/** the Dean of Students' south side to the car park: wide windows, black frames and louvres */
const W_WIDE: Style = {
  bay: 3.0, up: [], ground: [[24, 256 + 54, 208, 140]],
  draw: (g) => { paint(g); blackLouvre(g, 24, 256 + 54, 100, 140); blackLouvre(g, 132, 256 + 54, 100, 140); dado(g); },
};
/** the Post Office: faded white, the red band peeling at its foot */
const W_POST: Style = {
  bay: 3.4, up: [], ground: [[60, 256 + 50, 70, 140]],
  draw: (g) => {
    paint(g, '#efede5');
    speckle(g, 0, 0, 256, 512, 500, ['rgba(130,124,110,0.2)']);
    blackLouvre(g, 60, 256 + 50, 70, 140);
    g.fillStyle = '#2a2826'; g.fillRect(160, 256 + 40, 60, 176);
    dado(g);
    for (let i = 0; i < 9; i++) { const x = (i * 61) % 240, w = 8 + (i * 13) % 22; g.fillStyle = 'rgba(232,226,214,0.85)'; g.fillRect(x, 512 - 18 - (i % 3) * 6, w, 10 + (i % 2) * 8); }
  },
};

/** rubble stone facing: irregular stones in browns and greys, dark mortar (owner's yellow marks), in world metres */
let rubbleMat: THREE.MeshStandardMaterial | null = null;
function rubble() {
  if (rubbleMat) return rubbleMat;
  let s = 3;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const tex = canvas(256, 256, (g) => {
    g.fillStyle = '#6d665a'; g.fillRect(0, 0, 256, 256);
    const cols = ['#b49a7a', '#a08868', '#c2ad8e', '#8f7a62', '#9c9384', '#b8a58a', '#7f725f', '#a9a08f', '#c8b79a'];
    for (let j = 0; j < 8; j++) for (let i = 0; i < 7; i++) {
      const cx = i * 37 + (j % 2) * 18 + r() * 8, cy = j * 32 + r() * 6, rx = 14 + r() * 6, ry = 11 + r() * 5, n = 6 + ((r() * 3) | 0);
      const col = cols[(r() * cols.length) | 0];
      for (const [ox, oy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) {
        g.beginPath();
        for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2 + r() * 0.3, f = 0.75 + r() * 0.3; g[k ? 'lineTo' : 'moveTo'](cx + ox + Math.cos(a) * rx * f, cy + oy + Math.sin(a) * ry * f); }
        g.closePath(); g.fillStyle = col; g.fill();
        g.strokeStyle = 'rgba(40,36,30,0.55)'; g.lineWidth = 2; g.stroke();
      }
    }
    speckle(g, 0, 0, 256, 256, 1200, ['rgba(50,46,40,0.25)', 'rgba(220,210,190,0.15)']);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.rbTex = { value: tex };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRbP;\nvarying vec3 vRbN;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvRbP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvRbN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRbP;\nvarying vec3 vRbN;\nuniform sampler2D rbTex;')
      .replace('#include <map_fragment>', `#include <map_fragment>
  vec3 rbA = abs(vRbN);
  vec2 rbUv = rbA.y > 0.6 ? vRbP.xz / 1.6 : vec2((rbA.x > rbA.z ? vRbP.z : vRbP.x) / 1.6, vRbP.y / 1.6);
  diffuseColor.rgb *= texture2D(rbTex, rbUv).rgb;`);
  };
  m.customProgramCacheKey = () => 'rubble-stone';
  return (rubbleMat = m);
}
/** a low wall or platform faced in rubble stone (world x, z), its concrete cap overhanging a little */
function stoneWall(k: Kit, O: [number, number], st: Part[], x0: number, x1: number, z0: number, z1: number, h: number, y = 0) {
  st.push([box(x0 - O[0], x1 - O[0], y, y + h, z0 - O[1], z1 - O[1]), '#ffffff']);
  k.plain.push([box(x0 - O[0] - 0.06, x1 - O[0] + 0.06, y + h, y + h + 0.1, z0 - O[1] - 0.06, z1 - O[1] + 0.06), '#bdb8ac']);
}
const stoneMesh = (k: Kit, st: Part[]) => { if (!st.length) return; const m = new THREE.Mesh(merge(st), rubble()); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m); };
const frame = (O: [number, number]) => ({
  X: (x: number) => x - O[0], Z: (z: number) => z - O[1],
  B: (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(x0 - O[0], x1 - O[0], y0, y1, z0 - O[1], z1 - O[1]),
  M: (x: number, z: number): [number, number] => [x - O[0], z - O[1]],
});
const gableEnd = { gw: 99, tri: true }, buried = { gw: 99, tri: false }, hip = { gw: 0, tri: false };

// ---------- the French Department ----------
const FO: [number, number] = [-137, 94];
const FST = 3.0, FE = PL + 2 * FST + BAND;
/** the open passage through the range's ground floor, beside the west wing */
const PX = [-162.6, -159.8];
const W_BLANK: Style = { bay: 3.4, up: [], ground: [], draw: (g) => paint(g) };
const FW = [-176.0, -163.6, 78.9, 110.7], FEW = [-110.0, -97.8, 77.4, 109.2], FBAR = [-163.6, -110.0, 87.0, 98.3];
const french: Spec = (() => {
  const { X, Z, B, M } = frame(FO);
  const blk = (r: number[], more: Partial<Block> = {}): Block => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors: 2, roof: 'none', ...more });
  return {
    name: 'Faculty of Arts, Languages',
    axis: [1, 0], origin: FO, storey: FST, style: W_PLAIN, roofColor: TILE, fascia: BARGE, pitch: 0.5, plinth: '#d9d6cc',
    // the range split round the open passage (owner's yellow mark): over it only the upper floor
    blocks: [
      blk(FW), blk(FEW),
      blk([FBAR[0], PX[0], FBAR[2], FBAR[3]], { faces: { x1: W_BLANK } }),
      blk([PX[0] + 0.02, PX[1] - 0.02, FBAR[2], FBAR[3]], { floors: 1, y: FST }),
      blk([PX[1], FBAR[1], FBAR[2], FBAR[3]], { faces: { x0: W_BLANK } }),
    ],
    keep: [[X(-111), X(-95.5), Z(109), Z(113)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      // the roofs: the wings' ridges north-south, their gable ends boarded in dark timber; the range between them
      hipRoof(k, M, FW[0] - 0.7, FW[1] + 0.7, FW[2] - 0.6, FW[3] + 0.6, FE, 0.55, 'z', [gableEnd, gableEnd], c, BARGE, TIMBER);
      hipRoof(k, M, FEW[0] - 0.7, FEW[1] + 0.7, FEW[2] - 0.6, FEW[3] + 0.6, FE, 0.55, 'z', [gableEnd, gableEnd], c, BARGE, TIMBER);
      hipRoof(k, M, (FW[0] + FW[1]) / 2, (FEW[0] + FEW[1]) / 2, FBAR[2] - 0.7, FBAR[3] + 0.7, FE, 0.5, 'x', [buried, buried], c, BARGE, TIMBER);
      const F1 = PL + FST;
      // (the porch with the balcony over it, once here, belongs to the long block by the Post Office: owner)
      // the door at the west end of the west wing's south end (owner's blue mark), on a step
      const zw = FW[3];
      k.plain.push([B(-175.0, -173.4, PL, PL + 2.4, zw, zw + 0.06), '#2a2522'], [B(-174.23, -174.17, PL, PL + 2.4, zw + 0.06, zw + 0.08), '#4a4440']);
      k.plain.push([B(-175.2, -173.2, PL + 2.4, PL + 2.55, zw, zw + 0.5), WALL], [B(-175.4, -173.0, 0, PL, zw, zw + 0.9), '#cfcac0']);
      // the open passage through the range's ground floor beside the west wing (owner's yellow mark): no door, no
      // gate; a paved floor through to the court, a white lintel each side under the upper floor, a lamp in its ceiling
      const zb = FBAR[3], [px0, px1] = PX;
      k.plain.push([B(px0, px1, 0.02, 0.07, FBAR[2] - 1.2, zb + 0.8), '#a9a497']);
      for (const z of [FBAR[2], zb]) c.push([B(px0 - 0.02, px1 + 0.02, PL + 2.8, F1 + PL, z - 0.08, z + 0.08), WALL]);
      c.push([B(px0, px1, PL + 2.8, PL + 2.88, FBAR[2], zb), '#e6e3dc']);
      k.plain.push([B(px0 + 1.0, px1 - 1.0, PL + 2.74, PL + 2.8, (FBAR[2] + zb) / 2 - 0.3, (FBAR[2] + zb) / 2 + 0.3), '#f6efd6']);
      // the door just east of it (owner's blue mark)
      k.plain.push([B(-158.9, -157.4, PL, PL + 2.4, zb, zb + 0.06), '#2a2522'], [B(-159.1, -157.2, PL + 2.4, PL + 2.55, zb, zb + 0.45), WALL]);
      // the loggia in the range's south face, upstairs (photo 1)
      k.plain.push([B(-152, -141, F1 + 0.1, FE - 0.6, FBAR[3] - 0.02, FBAR[3] + 0.01), '#26241f']);
      c.push([B(-152.2, -140.8, F1, F1 + 1.0, FBAR[3], FBAR[3] + 0.25), WALL]);
      for (const x of [-148.3, -144.6]) c.push([B(x - 0.18, x + 0.18, F1 + 1.0, FE - 0.6, FBAR[3], FBAR[3] + 0.25), WALL]);
      stoneMesh(k, st);
      const m = new THREE.Mesh(merge(c), concrete(0.15));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

// ---------- inside the owner's white circle ----------
const CO: [number, number] = [-48, 77];
const LST = 3.4, LE = PL + 2 * LST + BAND, OE = PL + LST + BAND;
const LN = [-41.1, -28.1, 45.6, 65.3], LM = [-44.0, -24.9, 65.3, 89.0], LS = [-41.1, -27.8, 89.0, 109.5];
const DEAN = [-70.0, -47.0, 47.0, 58.9], POST = [-69.8, -48.5, 94.0, 107.8];
/** the post office's verandah along its north side: its wall set back behind square columns */
const PV = 96.6;
const PORCH: [number, number] = [100.2, 103.8];
const circle: Spec = (() => {
  const { X, Z, B, M } = frame(CO);
  const blk = (r: number[], floors: number, more: Partial<Block> = {}): Block => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors, roof: 'none', ...more });
  return {
    name: 'Department of Economics, University of Ghana',
    axis: [1, 0], origin: CO, storey: LST, style: W_DADO, roofColor: TILE, fascia: BARGE, pitch: 0.5, plinth: DADO,
    replaces: [[-58.5, 53], [-59, 101]],
    blocks: [
      blk(LN, 2, { faces: { x0: W_VERANDAH } }),
      blk(LM, 2, { faces: { x0: W_PORTICO } }),
      blk(LS, 2, { faces: { x0: W_VERANDAH } }),
      blk(DEAN, 1, { faces: { z0: W_DEAN, z1: W_WIDE } }),
      blk([POST[0], POST[1], PV, POST[3]], 1, { faces: { x0: W_POST, x1: W_POST, z0: W_POST, z1: W_POST } }),
    ],
    keep: [[X(-67), X(-45.5), Z(59.2), Z(93.6)], [X(-72), X(-69.5), Z(99.5), Z(104.5)], [X(-45.5), X(-43.5), Z(73), Z(81)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [], old: Part[] = [];

      // ---- the long block ----
      // gables to the roads north and south boarded in dark timber; the middle under a hip with the raised lantern
      hipRoof(k, M, LN[0] - 0.7, LN[1] + 0.7, LN[2] - 0.6, 72, LE, 0.5, 'z', [gableEnd, buried], c, BARGE, TIMBER);
      hipRoof(k, M, LS[0] - 0.7, LS[1] + 0.7, 81.5, LS[3] + 0.6, LE, 0.5, 'z', [buried, gableEnd], c, BARGE, TIMBER);
      const mTop = hipRoof(k, M, LM[0] - 0.7, LM[1] + 0.7, LM[2] - 0.7, LM[3] + 0.7, LE, 0.5, 'z', [hip, hip], c, BARGE, TIMBER);
      // the porch at the south end of the long block by the Post Office (owner: moved here from the French Department):
      // two columns, the first-floor balcony over it with a solid white parapet, steps up between stone-faced planters
      {
        const zf = LS[3], F1 = PL + LST, xa = -36.5, xb = -29.1, xm = (xa + xb) / 2;
        c.push([B(xa, xb, F1 - 0.25, F1, zf, zf + 2.0), WALL]);
        c.push([B(xa, xb, F1, F1 + 1.0, zf + 1.8, zf + 2.0), WALL], [B(xa, xa + 0.2, F1, F1 + 1.0, zf, zf + 2.0), WALL], [B(xb - 0.2, xb, F1, F1 + 1.0, zf, zf + 2.0), WALL]);
        c.push([B(xa - 0.1, xb + 0.1, F1 + 1.0, F1 + 1.08, zf, zf + 2.08), '#e2dfd8']);
        for (const x of [xa + 0.5, xb - 0.5]) c.push([B(x - 0.22, x + 0.22, 0, F1 - 0.25, zf + 1.5, zf + 1.94), WALL]);
        // (the doors stand in the gable's third bay, where its windows were)
        k.plain.push([B(xm - 1.0, xm + 1.0, PL, PL + 2.7, zf, zf + 0.06), '#141414'], [B(xm - 0.03, xm + 0.03, PL, PL + 2.7, zf + 0.06, zf + 0.08), '#2c2a27']);
        k.plain.push([B(xm - 1.0, xm + 1.0, F1, F1 + 2.8, zf, zf + 0.06), '#1d1b19'], [B(xm - 0.03, xm + 0.03, F1, F1 + 2.8, zf + 0.06, zf + 0.08), '#2c2a27']);
        for (let i = 1; i <= 3; i++) c.push([B(xm - 1.6, xm + 1.6, 0, (PL * (4 - i)) / 3 + 0.05, zf, zf + 2.0 + 0.32 * i), '#cfcac0']);
        stoneWall(k, CO, st, xa - 3.2, xm - 1.7, zf + 0.1, zf + 2.6, 0.7);
        stoneWall(k, CO, st, xm + 1.7, xb + 1.2, zf + 2.0, zf + 3.0, 0.6);
        k.plain.push([B(xa - 3.0, xm - 1.9, 0.7, 0.9, zf + 0.3, zf + 2.4), '#4a6b2e'], [B(xm + 1.9, xb + 1.0, 0.6, 0.8, zf + 2.2, zf + 2.8), '#4a6b2e']);
        for (const x of [xa - 2.2, xa - 0.6]) k.plain.push([new THREE.IcosahedronGeometry(0.55, 0).scale(1.2, 0.8, 1).translate(X(x), 1.15, Z(zf + 1.3)), '#3f6f2c']);
      }
      // the lantern: white walls rising out of the roof, a band of dark louvres all round under its own hip
      const lx0 = -36.6, lx1 = -32.4, lz0 = 72.0, lz1 = 82.5, lb = mTop - 0.55, lt = lb + 0.95;
      c.push([B(lx0, lx1, LE + 2, lb, lz0, lz1), WALL]);
      k.plain.push([B(lx0 - 0.02, lx1 + 0.02, lb, lt, lz0 - 0.02, lz1 + 0.02), '#1d1b19']);
      for (let y = lb + 0.12; y < lt - 0.05; y += 0.16) {
        k.plain.push([B(lx0 - 0.07, lx1 + 0.07, y, y + 0.06, lz0 - 0.07, lz0 - 0.02), '#3a3631'], [B(lx0 - 0.07, lx1 + 0.07, y, y + 0.06, lz1 + 0.02, lz1 + 0.07), '#3a3631']);
        k.plain.push([B(lx0 - 0.07, lx0 - 0.02, y, y + 0.06, lz0, lz1), '#3a3631'], [B(lx1 + 0.02, lx1 + 0.07, y, y + 0.06, lz0, lz1), '#3a3631']);
      }
      hipRoof(k, M, lx0 - 0.6, lx1 + 0.6, lz0 - 0.6, lz1 + 0.6, lt, 0.45, 'z', [hip, hip], c, BARGE, TIMBER);
      // the portico before the door in the middle: two tall columns to the eaves, a beam across, the door, its sign
      const xw = LM[0], zc = 77.0;
      for (const z of [zc - 2.9, zc + 2.9]) c.push([B(xw - 1.3, xw - 0.8, 0, LE - 0.3, z - 0.25, z + 0.25), WALL]);
      c.push([B(xw - 1.35, xw, LE - 0.75, LE - 0.3, zc - 3.2, zc + 3.2), WALL], [B(xw - 1.3, xw, PL, PL + 0.1, zc - 3.2, zc + 3.2), '#c9c4b8']);
      k.plain.push([B(xw - 0.05, xw, PL, PL + 2.4, zc - 0.9, zc + 0.9), '#141414']);
      for (const z of [zc - 0.45, zc + 0.45]) k.glass.push(B(xw - 0.08, xw - 0.05, PL + 1.0, PL + 2.1, z - 0.3, z + 0.3));
      k.signs.push({ text: 'DEPARTMENT OF ECONOMICS', x: X(xw) - 0.08, y: PL + 2.85, z: Z(zc), ry: -Math.PI / 2, w: 1.9, colors: ['#f4f4f1', '#1d3f7a'] });
      for (const z of [zc - 1.8, zc + 1.8]) k.plain.push([B(xw - 0.3, xw, PL + 0.25, PL + 0.8, z - 0.4, z + 0.4), '#eceeee']);
      // the upper verandahs: square columns along the edge, a parapet rail; the black water tanks below
      for (const [z0, z1] of [[LN[2], LN[3]], [LS[2], LS[3]]]) {
        for (let z = z0 + 0.3; z <= z1 - 0.2; z += 3.2) c.push([B(LN[0] - 0.3, LN[0] + 0.02, PL + LST, LE - 0.3, z - 0.18, z + 0.18), WALL]);
        c.push([B(LN[0] - 0.3, LN[0] + 0.02, PL + LST, PL + LST + 0.95, z0 + 0.2, z1 - 0.2), WALL], [B(LN[0] - 0.36, LN[0] + 0.02, PL + LST + 0.95, PL + LST + 1.02, z0 + 0.2, z1 - 0.2), '#e2dfd8']);
      }
      for (const z of [61.2, 63.0]) {
        k.plain.push([new THREE.CylinderGeometry(0.7, 0.7, 1.6, 14).translate(X(-42.2), 0.8, Z(z)), '#1b1c1f']);
        k.plain.push([new THREE.SphereGeometry(0.7, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.3, 1).translate(X(-42.2), 1.6, Z(z)), '#1b1c1f']);
      }

      // ---- the Office of the Dean of Student Affairs ----
      hipRoof(k, M, DEAN[0] - 0.7, DEAN[1] + 0.7, DEAN[2] - 0.7, DEAN[3] + 0.7, OE, 0.5, 'x', [gableEnd, gableEnd], c, BARGE, TIMBER);
      k.signs.push({ text: 'OFFICE OF THE DEAN OF STUDENT AFFAIRS', x: X(-62.5), y: OE - 0.65, z: Z(DEAN[2]) - 0.03, ry: Math.PI, w: 3.4, colors: ['#f4f4f1', '#1d3f7a'] });
      // the internal mail office's door at the east end of the road side
      k.plain.push([B(-50.9, -49.5, PL, PL + 2.3, DEAN[2] - 0.05, DEAN[2]), '#141414']);
      k.signs.push({ text: 'INTERNAL MAIL OFFICE', x: X(-50.2), y: PL + 2.65, z: Z(DEAN[2]) - 0.06, ry: Math.PI, w: 1.3, colors: ['#f4f4f1', '#1d3f7a'] });
      stoneWall(k, CO, st, DEAN[0], DEAN[1], DEAN[3] + 0.15, DEAN[3] + 1.2, 0.45);
      k.plain.push([B(DEAN[0] + 0.1, DEAN[1] - 0.1, 0.45, 0.6, DEAN[3] + 0.25, DEAN[3] + 1.1), '#4a6b2e']);
      // the board at the corner (owner's blue arrow)
      for (const x of [-74.6, -72.6]) k.plain.push([new THREE.CylinderGeometry(0.05, 0.05, 2.6, 8).translate(X(x), 1.3, Z(41.2)), '#8a8d90']);
      k.plain.push([B(-74.8, -72.4, 1.2, 2.5, 41.15, 41.25), '#f4f4f1']);
      k.signs.push({ text: 'UNIVERSITY OF GHANA', x: X(-73.6), y: 2.2, z: Z(41.12), ry: Math.PI, w: 1.7, colors: ['#f4f4f1', '#1d3f7a'] });
      k.signs.push({ text: 'OFFICE OF THE DEAN OF STUDENT AFFAIRS', x: X(-73.6), y: 1.75, z: Z(41.12), ry: Math.PI, w: 2.1, colors: ['#f4f4f1', '#1d3f7a'] });

      // ---- the Post Office ----
      const [px0, px1, pz0, pz1] = POST, ze0 = pz0 - 0.4, ze1 = pz1 + 0.7, zm = (ze0 + ze1) / 2;
      // old tiles gone darker; plain white gables (no boarding), wide dark bargeboards
      k.roof.c = new THREE.Color('#8f4334');
      const pTop = hipRoof(k, M, px0 - 0.9, px1 + 0.9, ze0, ze1, OE, 0.55, 'x', [buried, buried], c, '#1f1a17', TIMBER);
      k.roof.c = new THREE.Color(TILE);
      for (const x of [px0, px1]) {
        old.push([tri2([X(x), OE - 0.05, Z(ze0 + 0.15)], [X(x), OE - 0.05, Z(ze1 - 0.15)], [X(x), pTop - 0.1, Z(zm)]), '#efede5']);
        old.push([B(x - 0.02, x + 0.02, OE - 0.1, OE, ze0 + 0.15, ze1 - 0.15), '#efede5']);
        k.plain.push([B(x + (x < -60 ? -0.05 : 0), x + (x < -60 ? 0 : 0.05), OE + 1.1, OE + 1.6, 100.7, 101.2), '#141414']);
      }
      for (const [x, s] of [[px0 - 0.9, 1], [px1 + 0.9, -1]] as [number, number][]) {
        const half = (ze1 - ze0) / 2, len = Math.hypot(half, pTop - OE);
        for (const d of [-1, 1]) k.plain.push([new THREE.BoxGeometry(0.06, 0.3, len).rotateX(-d * Math.atan((pTop - OE) / half)).translate(X(x + s * 0.03), (OE + pTop) / 2, Z(zm - (d * half) / 2)), '#1f1a17']);
      }
      // the verandah on the north side: square columns, a red-banded floor edge, its ceiling
      old.push([B(px0, px1, 0, PL, pz0, PV), '#efede5'], [B(px0 - 0.02, px1 + 0.02, 0, PL + 0.02, pz0 - 0.02, pz0 + 0.3), DADO]);
      for (const x of [-51.0, -54.0, -57.0, -60.0]) old.push([B(x - 0.2, x + 0.2, PL, OE - 0.3, pz0 + 0.2, pz0 + 0.6), '#efede5']);
      old.push([B(px0, px1, OE - 0.4, OE, pz0, pz0 + 0.5), '#efede5']);
      // the recessed porch in the west gable: UNIVERSITY POST OFFICE over it, a red door, black grilles each side
      const [qz0, qz1] = PORCH;
      // (the recess drawn on the wall: its white sides and ceiling in shade, the red door at the back)
      k.plain.push([B(px0 - 0.03, px0, PL, OE - 1.0, qz0, qz1), '#cfcbc0'], [B(px0 - 0.04, px0, OE - 1.25, OE - 1.0, qz0, qz1), '#9d998e']);
      k.plain.push([B(px0 - 0.06, px0, PL, PL + 2.5, qz0 + 0.45, qz1 - 0.45), '#a8222a']);
      for (let z = qz0 + 0.55; z < qz1 - 0.5; z += 0.25) k.plain.push([B(px0 - 0.08, px0, PL, PL + 2.5, z - 0.02, z + 0.02), '#7a1a1f']);
      k.plain.push([B(px0 - 0.07, px0, PL, PL + 0.25, qz0, qz1), '#b9b4a6']);
      for (const z of [qz0 - 0.15, qz1 + 0.15]) old.push([B(px0 - 0.1, px0 + 0.05, 0, OE - 0.95, z - 0.25, z + 0.25), '#efede5']);
      old.push([B(px0 - 0.1, px0 + 0.05, OE - 1.05, OE - 0.4, qz0 - 0.4, qz1 + 0.4), '#efede5']);
      for (const z of [qz0 - 0.75, qz1 + 0.75]) k.plain.push([B(px0 - 0.05, px0, PL + 0.3, PL + 2.6, z - 0.28, z + 0.28), '#141414']);
      k.signs.push({ text: 'UNIVERSITY POST OFFICE', x: X(px0) - 0.06, y: OE - 0.15, z: Z((qz0 + qz1) / 2), ry: -Math.PI / 2, w: 2.6, colors: ['#efede5', '#2c2c2c'] });
      // two stone-faced steps up into it
      for (let i = 1; i <= 2; i++) stoneWall(k, CO, st, px0 - 0.4 * i, px0, qz0 - 0.3, qz1 + 0.3, (PL * (3 - i)) / 2 - 0.1);
      // the red post boxes on the gable south of the porch, a letter box and a notice board
      const boxes = (ax: number, bx: number, az: number, bz: number, y0: number, y1: number) => {
        k.plain.push([B(ax, bx, y0, y1, az, bz), '#a8222a']);
        const alongZ = bz - az > bx - ax;
        for (let t = 0.12; t < (alongZ ? bz - az : bx - ax); t += 0.24) k.plain.push(alongZ ? [B(ax - 0.02, bx + 0.02, y0, y1, az + t - 0.015, az + t + 0.015), '#6e161b'] : [B(ax + t - 0.015, ax + t + 0.015, y0, y1, az - 0.02, bz + 0.02), '#6e161b']);
        for (let y = y0 + 0.2; y < y1; y += 0.2) k.plain.push([B(ax - 0.02, bx + 0.02, y - 0.012, y + 0.012, az - 0.02, bz + 0.02), '#6e161b']);
      };
      boxes(px0 - 0.08, px0, 105.3, 107.0, PL + 0.1, PL + 2.4);
      k.plain.push([B(px0 - 0.25, px0, PL + 1.2, PL + 1.75, 99.1, 99.5), '#2b2b2b'], [B(px0 - 0.04, px0, PL + 1.3, PL + 2.2, 97.0, 98.4), '#e9e6dc']);
      // the wall of post boxes on the north, a white pier with a letter box, the canopy over them
      boxes(-66.6, -62.8, pz0 - 0.55, pz0 - 0.3, 0.6, 2.55);
      old.push([B(-62.8, -62.1, 0, 2.7, pz0 - 0.65, pz0 - 0.2), '#efede5'], [B(-66.9, -66.6, 0, 2.7, pz0 - 0.65, pz0 - 0.2), '#efede5']);
      old.push([B(-66.9, -62.1, 0, 0.6, pz0 - 0.65, pz0 - 0.2), DADO]);
      k.plain.push([B(-62.6, -62.3, 1.2, 1.6, pz0 - 0.95, pz0 - 0.65), '#e8e8e4']);
      k.plain.push([B(-67.6, -61.6, 2.8, 3.0, pz0 - 1.5, pz0 + 0.1), '#b0563a']);
      // the verandah's west end walled up to the roof, a grey, stained screen wall before it
      old.push([B(px0, px0 + 0.2, 0, OE, pz0, PV), '#efede5']);
      old.push([B(px0, -67.2, 0, 1.8, pz0 - 0.3, pz0 - 0.1), '#b5b1a6']);
      // the stone-faced platform along the north (owner: the stone-like slab), a stone kerb by the road
      stoneWall(k, CO, st, -66.2, -50.6, pz0 - 1.7, pz0 - 0.6, 0.5);
      stoneWall(k, CO, st, -77.6, -71.4, 92.4, 93.0, 0.35);

      // ---- the car park, the GCB ATM and the mast ----
      carPark(k, CO, -66.6, -45.6, 59.6, 92.0);
      const ax0 = -52.8, ax1 = -50.6, az0 = 87.6, az1 = 90.4;
      k.plain.push([B(ax0 - 0.1, ax1 + 0.1, 0, 0.15, az0 - 0.1, az1 + 0.1), '#e9e6dc']);
      k.plain.push([B(ax0 + 0.05, ax1, 0.15, 2.5, az0 + 0.25, az1 - 0.25), '#f2b100']);
      for (const z of [az0 + 0.12, az1 - 0.12]) k.plain.push([B(ax0, ax1, 0.15, 2.5, z - 0.13, z + 0.13), '#efe6c8']);
      k.plain.push([B(ax0 - 0.3, ax1 + 0.15, 2.5, 2.75, az0 - 0.15, az1 + 0.15), '#5d7fa3']);
      k.plain.push([B(ax0 - 0.02, ax0 + 0.05, 1.0, 1.75, (az0 + az1) / 2 - 0.4, (az0 + az1) / 2 + 0.4), '#c9c9c4'], [B(ax0 - 0.04, ax0, 1.35, 1.65, (az0 + az1) / 2 - 0.22, (az0 + az1) / 2 + 0.22), '#203040']);
      k.signs.push({ text: '24/7 GCB BANKING', x: X(ax0) - 0.05, y: 2.25, z: Z((az0 + az1) / 2), ry: -Math.PI / 2, w: 1.3, colors: ['#f2b100', '#3a2a10'] });
      mast(k, CO, -49.4, 83.2, 24);

      // ---- trees and hedges ----
      const g = garden([-90, -5, 35, 120]);
      g.reseed(33);
      for (const [x, z, sc] of [[-77.5, 44.5, 1.7], [-76.5, 67.5, 1.4], [-75.5, 81, 1.3], [-52, 109.5, 1.8], [-18.5, 48, 1.8], [-18.5, 64, 1.7], [-18.5, 83, 1.8], [-19, 99, 1.6], [-46, 42.5, 1.2]] as [number, number, number][]) g.tree(k, X(x), Z(z), sc);
      g.hedge(k, X(-70.5), Z(44.3), X(-49), Z(44.3));
      g.hedge(k, X(-46.5), Z(44.0), X(-44.5), Z(44.0));
      for (const z of [109.6, 111.2]) g.palm(k, X(-73.5), Z(z), 7.5);

      stoneMesh(k, st);
      const m = new THREE.Mesh(merge(c), concrete(0.15));
      m.castShadow = true; m.receiveShadow = true;
      const o = new THREE.Mesh(merge(old), concrete(0.9));
      o.castShadow = true; o.receiveShadow = true;
      k.meshes.push(m, o);
    },
  };
})();

/** the car park between the Dean of Students and the Post Office: asphalt, two rows of bays (world x, z) */
function carPark(k: Kit, O: [number, number], x0: number, x1: number, z0: number, z1: number) {
  const PPM = 10, W = Math.round((x1 - x0) * PPM), H = Math.round((z1 - z0) * PPM);
  const tex = canvas(W, H, (g) => {
    g.fillStyle = '#4f5154'; g.fillRect(0, 0, W, H);
    speckle(g, 0, 0, W, H, W * H * 0.03, ['#474a4d', '#5a5c5f', '#434548']);
    g.fillStyle = '#d9d9d2';
    for (let x = 2; x < x1 - x0 - 4; x += 2.6) { g.fillRect(x * PPM, 0, 2, 5 * PPM); g.fillRect(x * PPM, H - 5 * PPM, 2, 5 * PPM); }
  });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate((x0 + x1) / 2 - O[0], 0.05, (z0 + z1) / 2 - O[1]),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
  m.receiveShadow = true;
  k.meshes.push(m);
}
/** a lattice telecom mast, red and white in turns, panels and a dish near the top (world x, z) */
function mast(k: Kit, O: [number, number], x: number, z: number, h: number) {
  const cx = x - O[0], cz = z - O[1];
  const w = (y: number) => 1.6 - (0.9 * y) / h;
  const col = (y: number) => (Math.floor(y / 3) % 2 ? '#f2f2ee' : '#c8202a');
  const leg = (sx: number, sz: number) => {
    for (let y = 0; y < h; y += 3) {
      const a = new THREE.Vector3(cx + (sx * w(y)) / 2, y, cz + (sz * w(y)) / 2), b = new THREE.Vector3(cx + (sx * w(y + 3)) / 2, y + 3, cz + (sz * w(y + 3)) / 2);
      const d = b.clone().sub(a);
      k.plain.push([new THREE.CylinderGeometry(0.05, 0.05, d.length(), 5).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())).translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2), col(y)]);
    }
  };
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) leg(sx, sz);
  // the bracing: a cross on each face every 1.5 m, a ring at each joint
  for (let y = 0; y < h; y += 1.5) {
    const y1 = y + 1.5, a = w(y) / 2, b = w(y1) / 2;
    const faces: [number, number, number, number][] = [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]];
    for (const [sx0, sz0, sx1, sz1] of faces) {
      const p = new THREE.Vector3(cx + sx0 * a, y, cz + sz0 * a), q = new THREE.Vector3(cx + sx1 * b, y1, cz + sz1 * b);
      const d = q.clone().sub(p);
      k.plain.push([new THREE.CylinderGeometry(0.025, 0.025, d.length(), 4).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())).translate((p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2), col(y)]);
      k.plain.push([box(cx + Math.min(sx0, sx1) * b - 0.03, cx + Math.max(sx0, sx1) * b + 0.03, y1 - 0.03, y1 + 0.03, cz + Math.min(sz0, sz1) * b - 0.03, cz + Math.max(sz0, sz1) * b + 0.03), col(y)]);
    }
  }
  // the antennas, a dish, the cabinet at its foot
  for (const [dx, dz] of [[0.6, 0], [-0.6, 0], [0, 0.6], [0, -0.6]]) k.plain.push([box(cx + dx - 0.12, cx + dx + 0.12, h - 2.2, h - 0.6, cz + dz - 0.12, cz + dz + 0.12), '#e8e8e4']);
  k.plain.push([new THREE.CylinderGeometry(0.45, 0.2, 0.25, 14).rotateZ(Math.PI / 2).translate(cx - 0.75, h - 4.5, cz), '#e2e2de']);
  k.plain.push([box(cx + 1.0, cx + 2.0, 0, 1.6, cz - 0.5, cz + 0.4), '#cfd2d4']);
}

// ---------- the University Bookshop, east across the square (owner's street view: its south end and west side) ----------
// The twin of the long block opposite: two floors under orange tiles, its gables north and south boarded in dark timber,
// the raised lantern over its middle; along the west side a tiled pent roof over the ground floor's tall dark shop
// windows; at the south end the entrance under a first-floor balcony with a solid white parapet, a step up from a
// platform faced in rubble stone (the owner's yellow marks) between low red railings.
const KO: [number, number] = [49.3, 75];
/** the shop's ground floor along the square: tall dark glass windows in black frames */
const W_SHOP: Style = {
  bay: 3.2, up: [[128 - 38, 50, 76, 126]], ground: [[20, 256 + 30, 216, 200]],
  draw: (g) => {
    paint(g);
    blackLouvre(g, 128 - 38, 50, 76, 126);
    g.fillStyle = '#121212'; g.fillRect(16, 256 + 26, 224, 208);
    const gl = g.createLinearGradient(0, 256 + 30, 0, 256 + 230); gl.addColorStop(0, '#46525c'); gl.addColorStop(1, '#14191e');
    g.fillStyle = gl; g.fillRect(20, 256 + 30, 216, 200);
    g.fillStyle = '#121212'; g.fillRect(126, 256 + 30, 4, 200); g.fillRect(20, 256 + 96, 216, 4);
  },
};
const bookshop: Spec = (() => {
  const { X, Z, B, M } = frame(KO);
  const BN = [42.7, 55.7, 44.4, 63.8], BM = [39.8, 58.9, 63.8, 87.6], BS = [42.7, 56.0, 87.6, 106.2];
  const blk = (r: number[], more: Partial<Block> = {}): Block => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors: 2, roof: 'none', ...more });
  return {
    name: 'University of Ghana Bookshop',
    axis: [1, 0], origin: KO, storey: LST, style: W_PLAIN, roofColor: TILE, fascia: BARGE, pitch: 0.5, plinth: '#cfcac0',
    blocks: [blk(BN, { faces: { x0: W_SHOP } }), blk(BM, { faces: { x0: W_SHOP } }), blk(BS, { faces: { x0: W_SHOP } })],
    keep: [[X(37), X(60), Z(106), Z(111)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      // the roofs: gables north and south, the hip over the middle with its lantern
      hipRoof(k, M, BN[0] - 0.7, BN[1] + 0.7, BN[2] - 0.6, 71, LE, 0.5, 'z', [gableEnd, buried], c, BARGE, TIMBER);
      hipRoof(k, M, BS[0] - 0.7, BS[1] + 0.7, 80.5, BS[3] + 0.6, LE, 0.5, 'z', [buried, gableEnd], c, BARGE, TIMBER);
      const mTop = hipRoof(k, M, BM[0] - 0.7, BM[1] + 0.7, BM[2] - 0.7, BM[3] + 0.7, LE, 0.5, 'z', [hip, hip], c, BARGE, TIMBER);
      const lx0 = 47.2, lx1 = 51.4, lz0 = 70.5, lz1 = 81.0, lb = mTop - 0.55, lt = lb + 0.95;
      c.push([B(lx0, lx1, LE + 2, lb, lz0, lz1), WALL]);
      k.plain.push([B(lx0 - 0.02, lx1 + 0.02, lb, lt, lz0 - 0.02, lz1 + 0.02), '#1d1b19']);
      for (let y = lb + 0.12; y < lt - 0.05; y += 0.16) {
        k.plain.push([B(lx0 - 0.07, lx1 + 0.07, y, y + 0.06, lz0 - 0.07, lz0 - 0.02), '#3a3631'], [B(lx0 - 0.07, lx1 + 0.07, y, y + 0.06, lz1 + 0.02, lz1 + 0.07), '#3a3631']);
        k.plain.push([B(lx0 - 0.07, lx0 - 0.02, y, y + 0.06, lz0, lz1), '#3a3631'], [B(lx1 + 0.02, lx1 + 0.07, y, y + 0.06, lz0, lz1), '#3a3631']);
      }
      hipRoof(k, M, lx0 - 0.6, lx1 + 0.6, lz0 - 0.6, lz1 + 0.6, lt, 0.45, 'z', [hip, hip], c, BARGE, TIMBER);
      // the tiled pent roof along the west side over the shop windows
      const pe = PL + LST - 0.15, po = 1.6;
      for (const [x, z0, z1] of [[BN[0], BN[2] + 0.6, BN[3]], [BM[0], BM[2], BM[3]], [BS[0], BS[2], BS[3] - 0.6]] as [number, number, number][]) {
        k.roof.quad([X(x - po), pe - 0.75, Z(z1)], [X(x - po), pe - 0.75, Z(z0)], [X(x), pe, Z(z0)], [X(x), pe, Z(z1)]);
        k.plain.push([B(x - po - 0.05, x - po + 0.05, pe - 0.95, pe - 0.7, z0, z1), BARGE]);
      }
      // the south end: the entrance under the first-floor balcony on two columns, the balcony's solid white parapet
      const zs = BS[3], F1 = PL + LST, xa = 47.0, xb = 54.6, xm = (xa + xb) / 2;
      c.push([B(xa, xb, F1 - 0.25, F1, zs, zs + 2.0), WALL]);
      c.push([B(xa, xb, F1, F1 + 1.05, zs + 1.82, zs + 2.0), WALL], [B(xa, xa + 0.18, F1, F1 + 1.05, zs, zs + 2.0), WALL], [B(xb - 0.18, xb, F1, F1 + 1.05, zs, zs + 2.0), WALL]);
      c.push([B(xa - 0.04, xb + 0.04, F1 + 1.05, F1 + 1.12, zs, zs + 2.06), '#e2dfd8']);
      for (const x of [xa + 0.3, xb - 0.3]) c.push([B(x - 0.22, x + 0.22, 0.6, F1 - 0.25, zs + 1.55, zs + 1.95), WALL]);
      k.plain.push([B(xm - 1.0, xm + 1.0, 0.6, 0.6 + 2.4, zs, zs + 0.05), '#22272c'], [B(xm - 0.03, xm + 0.03, 0.6, 3.0, zs + 0.05, zs + 0.07), '#4a5258']);
      k.glass.push(B(xm - 0.9, xm + 0.9, 1.5, 2.9, zs + 0.06, zs + 0.08));
      k.plain.push([B(xm - 1.1, xm + 1.1, 3.2, 3.55, zs, zs + 0.06), '#f4f4f1']);
      k.signs.push({ text: 'UNIVERSITY OF GHANA BOOKSHOP', x: X(xm), y: 3.37, z: Z(zs) + 0.07, ry: 0, w: 2.0, colors: ['#f4f4f1', '#1d3f7a'] });
      // the platform before it faced in rubble stone, the step up in the middle, red railings either side
      stoneWall(k, KO, st, 43.0, xm - 1.6, zs, zs + 3.4, 0.6);
      stoneWall(k, KO, st, xm + 1.6, 56.0, zs, zs + 2.8, 0.6);
      for (let i = 0; i < 4; i++) k.plain.push([B(xm - 1.6, xm + 1.6, 0, 0.6 - 0.15 * i, zs, zs + 2.0 + 0.35 * i), '#cfcac0']);
      for (const [a, b2] of [[43.4, 46.6], [52.2, 55.4]]) {
        k.plain.push([B(a, b2, 1.45, 1.5, zs + 3.6, zs + 3.65), '#a8312b'], [B(a, b2, 1.0, 1.04, zs + 3.6, zs + 3.65), '#a8312b']);
        for (let x = a; x <= b2 + 0.01; x += 0.4) k.plain.push([B(x - 0.02, x + 0.02, 0.6, 1.5, zs + 3.6, zs + 3.65), '#a8312b']);
      }
      // a stone-faced bed along the west front, shrubs in it
      stoneWall(k, KO, st, 37.8, 39.6, 64.5, 87.0, 0.45);
      for (let z = 66; z < 86; z += 4) k.plain.push([new THREE.IcosahedronGeometry(0.55, 0).scale(1.2, 0.8, 1).translate(X(38.7), 0.85, Z(z)), '#3f6f2c']);
      stoneMesh(k, st);
      const m = new THREE.Mesh(merge(c), concrete(0.15));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

/** the French Department, the buildings in the owner's white circle, and the Bookshop across the square */
export const balmeWest = createSite('balme-west', [french, circle, bookshop]);
