// The School of Pharmacy, south of WACCBIP across the road, from the owner's photos (block engine: blocks.ts): its
// side to the road from WACCBIP (photos 2 and 3) and its front to Volta Hall Road (photo 4, the doors marked blue).
//
// One-floor wings under maroon sheet roofs round a car park open to Volta Hall Road: a long wing along the north
// (white, a red band round its foot, glass windows with curtains, an air-conditioner under each, panels boarded up
// here and there), one along the south, one along the west; on the car park side covered walks on slim posts, lit,
// doors along them. At the back of the car park a three-storey block, its paint gone grey and patched, panel lines
// across it, black-framed glass windows; in its middle a taller bay under its own hip. Before it a one-floor front
// wing with the school's two doors and a banner, black water tanks on a stand beside it; a tree and yuccas on the lawn
// by the road.
import * as THREE from 'three';
import { box, canvas, merge, speckle, type Part } from './modelkit';
import { BAND, PL, createSite, render, type Block, type Kit, type Spec, type Style } from './blocks';
import { concrete } from './concrete';
import { garden } from './gardens';
import { hipRoof } from './waccbip';

// (model frame along the wings, which stand 2.5 degrees off east; measured from the OSM and Google outlines)
const O: [number, number] = [-262, -245];
const AX: [number, number] = [49.6, 2.2];
const ROOF = '#7e2b33', BARGE = '#5a1f24', RED = '#b0302a', ST = 3.3;
const E1 = PL + ST + BAND, E3 = PL + 3 * ST + BAND;

const dado = (g: CanvasRenderingContext2D) => { g.fillStyle = RED; g.fillRect(0, 512 - 50, 256, 50); speckle(g, 0, 512 - 50, 256, 50, 120, ['#9f2a25', '#c03a32']); };
const wash = (g: CanvasRenderingContext2D, base = '#f3f3f0') => { render(g, base); speckle(g, 0, 0, 256, 512, 500, ['rgba(130,128,120,0.15)']); };
/** a glass window in a light aluminium frame, curtains drawn behind */
const glassWin = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cols: number, frame = '#cfd2d3') => {
  g.fillStyle = frame; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  g.fillStyle = '#7d8a8f'; g.fillRect(x, y, w, h);
  for (let i = 0; i < cols; i++) {
    const cx = x + (w * i) / cols;
    g.fillStyle = i % 2 ? '#c9c2b0' : '#b9b4a6'; g.fillRect(cx + 4, y + 6, w / cols - 8, h - 10);
    g.fillStyle = 'rgba(255,255,255,0.18)'; for (let t = cx + 8; t < cx + w / cols - 6; t += 9) g.fillRect(t, y + 6, 2, h - 10);
  }
  g.fillStyle = frame; for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - 2, y, 4, h);
  g.fillStyle = '#e8e8e4'; g.fillRect(x - 8, y + h + 4, w + 16, 5);
};
/** a black-framed glass window, panes reflecting the sky */
const blackWin = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cols: number, rows: number) => {
  g.fillStyle = '#16181a'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  const gl = g.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, '#9fb6c6'); gl.addColorStop(0.5, '#5e7586'); gl.addColorStop(1, '#2e3a44');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = '#16181a';
  for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - 2, y, 4, h);
  for (let j = 1; j < rows; j++) g.fillRect(x, y + (h * j) / rows - 2, w, 4);
};
/** the outer faces of the one-floor wings (photo 2): a wide glass window to a bay, a boarded panel beside it */
const P_ONE: Style = {
  bay: 4.4, up: [], ground: [[30, 256 + 50, 150, 96]],
  draw: (g) => {
    wash(g);
    glassWin(g, 30, 256 + 50, 150, 96, 3);
    g.fillStyle = '#a49d92'; g.fillRect(196, 256 + 46, 44, 104);
    g.fillStyle = 'rgba(80,74,66,0.25)'; g.fillRect(196, 256 + 46, 44, 6);
    g.fillStyle = '#d9d9d6'; g.fillRect(20, 256 + 20, 6, 236);
    dado(g);
  },
};
/** the faces on the covered walks round the car park: a door and a window to a bay, notices between */
const P_WALK: Style = {
  bay: 3.4, up: [], ground: [[28, 256 + 40, 64, 170], [120, 256 + 56, 110, 90]],
  draw: (g) => {
    wash(g, '#f1f0ec');
    g.fillStyle = '#3c3f42'; g.fillRect(24, 256 + 36, 72, 220);
    g.fillStyle = '#5c6f7c'; g.fillRect(30, 256 + 44, 60, 90);
    g.fillStyle = '#2b2d30'; g.fillRect(30, 256 + 140, 60, 114);
    glassWin(g, 120, 256 + 56, 110, 90, 2, '#e9eaea');
    g.fillStyle = '#1f56b8'; g.fillRect(140, 256 + 160, 46, 34); g.fillStyle = '#f2f2ee'; g.fillRect(146, 256 + 166, 34, 22);
    dado(g);
  },
};
/** the three-storey block: grey, patched paint, panel lines, black-framed windows of two and four panes */
const P_THREE: Style = {
  bay: 3.6, up: [[70, 40, 116, 120]], ground: [[70, 256 + 50, 116, 120]],
  draw: (g) => {
    wash(g, '#e9e9e6');
    // patches of newer paint, grime, rain streaks
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? 'rgba(250,250,248,0.6)' : 'rgba(170,168,160,0.22)'; g.fillRect((i * 71) % 230, (i * 113) % 470, 30 + (i * 17) % 50, 24 + (i * 29) % 60); }
    for (let i = 0; i < 14; i++) { const x = (i * 37) % 250, y = i % 2 ? 165 : 256 + 175; const gr = g.createLinearGradient(0, y, 0, y + 70); gr.addColorStop(0, 'rgba(110,108,100,0.28)'); gr.addColorStop(1, 'rgba(110,108,100,0)'); g.fillStyle = gr; g.fillRect(x, y, 4, 70); }
    g.fillStyle = 'rgba(150,150,146,0.6)'; g.fillRect(0, 0, 256, 2); g.fillRect(0, 256, 256, 2); g.fillRect(0, 0, 2, 512); g.fillRect(128, 0, 1, 512);
    blackWin(g, 70, 40, 116, 120, 2, 2);
    blackWin(g, 70, 256 + 50, 116, 120, 2, 1);
  },
};
/** the taller middle bay: a wide ribbon of black-framed glass */
const P_BAY: Style = {
  bay: 7.0, up: [[24, 70, 208, 70]], ground: [[40, 256 + 60, 176, 100]],
  draw: (g) => { P_THREE.draw(g); g.fillStyle = '#e9e9e6'; g.fillRect(0, 30, 256, 140); blackWin(g, 24, 70, 208, 70, 6, 1); },
};
/** the front wing to the car park: windows, the doors set in by the model */
const P_FRONT: Style = {
  bay: 3.4, up: [], ground: [[60, 256 + 56, 130, 96]],
  draw: (g) => { wash(g); glassWin(g, 60, 256 + 56, 130, 96, 2, '#e9eaea'); dado(g); },
};

const R = (x0: number, x1: number, z0: number, z1: number, floors: number, more: Partial<Block> = {}): Block => ({ x0, x1, z0, z1, floors, roof: 'none', ...more });
const NB = [-25.0, 24.7, -19.6, -11.1], SB = [-25.0, 24.6, 12.1, 22.45], WB = [-39.75, -27.75, -20.3, 22.5], CEN = [-7.6, 4.7, -11.2, 12.1];
const TOWER = [-7.6, 6.2, 0.0, 6.4], FRONT = [4.7, 13.4, -4.85, 11.2];

const pharmacy: Spec = {
  name: 'School of Pharmacy',
  axis: AX, origin: O, storey: ST, style: P_ONE, roofColor: ROOF, fascia: BARGE, pitch: 0.35, plinth: RED,
  replaces: [[-262, -245], [-295, -245], [-283, -248], [-255, -241]],
  blocks: [
    R(NB[0], NB[1], NB[2], NB[3], 1, { faces: { z1: P_WALK } }),
    R(SB[0], SB[1], SB[2], SB[3], 1, { faces: { z0: P_WALK } }),
    R(WB[0], WB[1], WB[2], WB[3], 1),
    R(-27.8, -24.7, -8.8, 7.3, 1), R(-24.7, -14.9, -6.1, 1.4, 1), R(-24.7, -17.1, 1.4, 4.6, 1),
    R(CEN[0], CEN[1], CEN[2], CEN[3], 3, { faces: { x0: P_THREE, x1: P_THREE, z0: P_THREE, z1: P_THREE }, floorStyle: { 0: P_THREE, 1: P_THREE, 2: P_THREE } }),
    R(TOWER[0], TOWER[1], TOWER[2], TOWER[3], 3, { floorStyle: { 0: P_BAY, 1: P_BAY, 2: P_BAY } }),
    R(FRONT[0], FRONT[1], FRONT[2], FRONT[3], 1, { faces: { x1: P_FRONT } }),
  ],
  // (the car park, the covered walks, the tank stand, the lawn by the road)
  keep: [[FRONT[1], 40, -11.2, 12.2], [5.5, 10, -10.5, -5]],
  extras: (k: Kit) => {
    const c: Part[] = [], old: Part[] = [];
    const M = (x: number, z: number): [number, number] => [x, z];
    const hip = { gw: 0, tri: false }, buried = { gw: 99, tri: false };
    // ---- the roofs: maroon sheets, hips; the three-storey block's taller middle bay under its own hip ----
    hipRoof(k, M, NB[0] - 0.7, NB[1] + 0.7, NB[2] - 0.7, NB[3] + 0.7, E1, 0.32, 'x', [hip, hip], c, BARGE);
    hipRoof(k, M, SB[0] - 0.7, SB[1] + 0.7, SB[2] - 0.7, SB[3] + 0.7, E1, 0.32, 'x', [hip, hip], c, BARGE);
    hipRoof(k, M, WB[0] - 0.7, WB[1] + 0.7, WB[2] - 0.7, WB[3] + 0.7, E1, 0.32, 'z', [hip, hip], c, BARGE);
    hipRoof(k, M, -28.5, -14.2, -9.5, 8.0, E1, 0.3, 'z', [hip, hip], c, BARGE);
    hipRoof(k, M, FRONT[0] - 1, FRONT[1] + 0.7, FRONT[2] - 0.7, FRONT[3] + 0.7, E1, 0.3, 'z', [hip, hip], c, BARGE);
    hipRoof(k, M, CEN[0] - 0.7, CEN[1] + 0.7, CEN[2] - 0.7, CEN[3] + 0.7, E3, 0.4, 'z', [hip, hip], c, BARGE);
    const TE = E3 + 0.9;
    old.push([box(TOWER[0], TOWER[1], E3 - BAND, TE, TOWER[2], TOWER[3]), '#e9e9e6']);
    hipRoof(k, M, TOWER[0] - 0.7, TOWER[1] + 0.7, TOWER[2] - 0.7, TOWER[3] + 0.7, TE, 0.45, 'x', [buried, hip], c, BARGE);
    // ---- the covered walks round the car park: a lean-to of the same sheets on slim posts, lights under it ----
    for (const [x0, x1, zw, s] of [[FRONT[0], NB[1], NB[3], 1], [FRONT[1], SB[1], SB[2], -1]] as [number, number, number, number][]) {
      const zo = zw + s * 2.3;
      k.roof.quad([x0, E1 - 0.1, zw], [x1, E1 - 0.1, zw], [x1, E1 - 0.75, zo], [x0, E1 - 0.75, zo]);
      c.push([box(x0, x1, E1 - 0.95, E1 - 0.75, Math.min(zo, zo - s * 0.12), Math.max(zo, zo - s * 0.12)), BARGE]);
      for (let x = x1 - 0.2; x > x0 + 0.5; x -= 3.4) c.push([box(x - 0.08, x + 0.08, 0, E1 - 0.8, zo - s * 0.2 - 0.08, zo - s * 0.2 + 0.08), '#e6e6e2']);
      k.plain.push([box(x0, x1, 0, 0.12, Math.min(zw, zo), Math.max(zw, zo)), '#b9b6ae']);
      for (let x = x1 - 1.9; x > x0 + 0.5; x -= 3.4) k.plain.push([box(x - 0.35, x + 0.35, E1 - 0.98, E1 - 0.94, zw + s * 1.1 - 0.1, zw + s * 1.1 + 0.1), '#fff3d0']);
      // potted plants along the walk
      for (let x = x1 - 1.0; x > x0 + 1; x -= 2.6) {
        k.plain.push([new THREE.CylinderGeometry(0.25, 0.18, 0.45, 8).translate(x, 0.34, zw + s * 0.45), '#8a4a2e']);
        k.plain.push([new THREE.IcosahedronGeometry(0.35, 0).translate(x, 0.8, zw + s * 0.45), '#3f7a2c']);
      }
    }
    // ---- the front wing's two doors (owner's blue marks), its banner; the school's board ----
    const xf = FRONT[1];
    for (const z of [1.2, -3.3]) {
      k.plain.push([box(xf, xf + 0.06, PL, PL + 2.5, z - 0.8, z + 0.8), '#1f2a33'], [box(xf + 0.06, xf + 0.1, PL + 0.1, PL + 2.4, z - 0.02, z + 0.02), '#55636c']);
      k.plain.push([box(xf, xf + 0.12, PL + 2.5, PL + 2.65, z - 0.95, z + 0.95), '#d9d9d6']);
      k.plain.push([box(xf + 0.6, xf + 1.6, 0, 0.15, z - 1.2, z + 1.2), '#c9c4b8']);
    }
    k.plain.push([box(xf, xf + 0.05, PL + 1.3, PL + 2.4, 4.6, 7.4), '#25348a']);
    k.signs.push({ text: 'UNIVERSITY OF GHANA SCHOOL OF PHARMACY', x: xf + 0.07, y: PL + 1.85, z: 6.0, ry: Math.PI / 2, w: 2.6, colors: ['#25348a', '#ffffff'] });
    k.signs.push({ text: 'SCHOOL OF PHARMACY', x: xf + 0.14, y: PL + 2.95, z: 1.2, ry: Math.PI / 2, w: 1.7, colors: ['#f4f4f1', '#1d3f7a'] });
    for (const z of [9.0, 3.2, -1.0]) k.plain.push([box(xf, xf + 0.3, 0.3, 0.85, z - 0.4, z + 0.4), '#eceeee']);
    // ---- the black water tanks on their stand between the front wing and the north wing ----
    const tx = 7.6, tz = -8.0, th = 4.6;
    for (const [dx, dz] of [[-1.4, -1.6], [1.4, -1.6], [-1.4, 1.6], [1.4, 1.6]]) c.push([box(tx + dx - 0.08, tx + dx + 0.08, 0, th, tz + dz - 0.08, tz + dz + 0.08), '#6d7175']);
    c.push([box(tx - 1.6, tx + 1.6, th, th + 0.15, tz - 1.8, tz + 1.8), '#6d7175']);
    k.plain.push([new THREE.CylinderGeometry(1.0, 1.0, 2.4, 16).translate(tx + 0.3, th + 1.35, tz - 0.6), '#1b1c1f']);
    k.plain.push([new THREE.SphereGeometry(1.0, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.3, 1).translate(tx + 0.3, th + 2.55, tz - 0.6), '#1b1c1f']);
    k.plain.push([new THREE.CylinderGeometry(0.7, 0.7, 1.5, 14).translate(tx - 0.7, th + 0.9, tz + 1.0), '#1b1c1f']);
    // ---- air-conditioners under the north wing's windows (photo 2), downpipes ----
    for (let x = NB[0] + 1.8; x < NB[1] - 1; x += 4.4) k.plain.push([box(x - 0.45, x + 0.45, 0.7, 1.25, NB[2] - 0.35, NB[2]), '#e9ebeb'], [box(x - 0.5, x + 0.5, 0.65, 0.7, NB[2] - 0.45, NB[2]), '#9a9d9f']);
    for (const x of [-18, -4, 10]) k.plain.push([box(x - 0.06, x + 0.06, 0.2, E1 - 0.3, NB[2] - 0.12, NB[2]), '#c9cccd']);
    for (let z = WB[2] + 3; z < WB[3] - 2; z += 8.8) k.plain.push([box(WB[0] - 0.35, WB[0], 0.7, 1.25, z - 0.45, z + 0.45), '#e9ebeb']);
    // ---- the car park: asphalt, bays marked aslant; the lawn by the road with its tree and yuccas ----
    const W = 24, H = 18, x0 = FRONT[1], z0 = -8.6;
    const tex = canvas(W * 10, H * 10, (g) => {
      g.fillStyle = '#55585b'; g.fillRect(0, 0, W * 10, H * 10);
      speckle(g, 0, 0, W * 10, H * 10, 4000, ['#4d5053', '#5f6265']);
      g.strokeStyle = '#e4e4de'; g.lineWidth = 2;
      for (let x = 10; x < W * 10 - 20; x += 28) for (const [y0, y1] of [[0, 50], [H * 10, H * 10 - 50]]) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x + 18, y1); g.stroke(); }
    });
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(W, H).rotateX(-Math.PI / 2).translate(x0 + W / 2, 0.05, z0 + H / 2),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
    pm.receiveShadow = true;
    k.meshes.push(pm);
    const g = garden([-310, -215, -275, -215]);
    g.reseed(47);
    g.tree(k, 34.5, 3.5, 1.5);
    for (const [x, z] of [[32.5, 1.5], [33.0, 6.0], [36.5, 5.8], [35.8, 0.6], [31.6, 4.2]]) for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + x, leaf = new THREE.ConeGeometry(0.05, 0.9, 3).translate(0, 0.45, 0).rotateZ(0.5 + (i % 3) * 0.15).rotateY(a);
      k.plain.push([leaf.translate(x, 0.05, z), i % 2 ? '#4f7f46' : '#6d8f55']);
    }
    for (const [x, z, s] of [[-45, -26, 1.5], [-45, 0, 1.4], [30, -26, 1.6], [-10, 28, 1.4]] as [number, number, number][]) g.tree(k, x, z, s);

    const m = new THREE.Mesh(merge(c), concrete(0.3));
    m.castShadow = true; m.receiveShadow = true;
    const o = new THREE.Mesh(merge(old), concrete(0.9));
    o.castShadow = true; o.receiveShadow = true;
    k.meshes.push(m, o);
  },
};

/** the School of Pharmacy */
export const pharmacySite = createSite('pharmacy', [pharmacy]);
