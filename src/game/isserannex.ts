// The ISSER Annex and its neighbours west of the engineering school, from the owner's photos and marked aerial
// (registered at 0.25 m/px; block engine: blocks.ts; its sunken ground: relief.ts).
//
// ISSER Annex (photos 1 and 2): white walls, dark windows in white frames, terracotta tile roofs with dark brown
// fascias, down in a hollow below the road between it and the engineering school (owner: the slope). Three floors in
// the west wing, a gabled porch at its south end; two floors in the long range along the car park, a small gabled
// porch in its middle where the walk from the engineering school arrives (owner's blue arrow), more doors along it and
// along the west wing's court (blue marks); the conference hall behind the range, two tall floors under a big hip; one
// floor in the wing on its east. North of the hall, on a paved plaza between white bench walls and trees, the three
// huts (owner's purple marks): one floor, open, white columns under pyramid tile roofs, benches and a table in each.
// Along the road on the east a white fence: square piers and black fret panels on a low wall, a hedge outside it.
//
// West of the annex (owner's yellow mark, photo 3) a two-storey concrete frame going up behind blue sheet hoarding:
// the ground floor open between its columns, the first floor propped with orange shores, rebar standing over the top
// slab; the contractor's boards on the hoarding; red earth round it.
//
// Beyond that (owner's red mark, photo 4) a one-floor hall: white walls over a dado of rubble stone, a red line at its
// foot; white panelled double doors up a step (the owner's blue marks), a breeze-block screen, a panel of glass
// blocks, small windows, air-conditioners in cages along the wall; an orange-red sheet hip roof with a raised gable
// over its west end, a louvred vent in the gable, solar panels on the roof.
import * as THREE from 'three';
import { box, canvas, merge, speckle, tri2, type Part } from './modelkit';
import { BAND, PL, createSite, render, type Block, type Kit, type Spec, type Style } from './blocks';
import { concrete, panel } from './concrete';
import { garden } from './gardens';
import { hipRoof } from './waccbip';

const TILE = '#c0623f', FASCIA = '#3d2a20', WALL = '#f6f5f1';
const hip = { gw: 0, tri: false }, buried = { gw: 99, tri: false }, gable = { gw: 99, tri: true };

/** a dark window in a white frame, a sill under it */
const win = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cols: number) => {
  g.fillStyle = '#e6e5e0'; g.fillRect(x - 6, y - 6, w + 12, h + 12);
  const gl = g.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, '#556673'); gl.addColorStop(0.6, '#26303a'); gl.addColorStop(1, '#161b21');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = '#e6e5e0'; for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - 2, y, 4, h);
  g.fillRect(x, y + h * 0.3, w, 3);
  g.fillStyle = '#d8d6cf'; g.fillRect(x - 9, y + h + 5, w + 18, 6);
};
const A_WIN: Style = {
  bay: 3.4, up: [[70, 60, 116, 120]], ground: [[70, 256 + 66, 116, 120]],
  draw: (g) => { render(g, WALL); speckle(g, 0, 0, 256, 512, 250, ['rgba(140,136,126,0.12)']); win(g, 70, 60, 116, 120, 2); win(g, 70, 256 + 66, 116, 120, 2); g.fillStyle = '#d9d6cc'; g.fillRect(0, 512 - 14, 256, 14); },
};
/** the hall's walls: tall paired windows */
const A_HALL: Style = {
  bay: 3.6, up: [[60, 30, 50, 190], [146, 30, 50, 190]], ground: [[60, 256 + 40, 50, 180], [146, 256 + 40, 50, 180]],
  draw: (g) => { render(g, WALL); for (const y of [30, 256 + 40]) { win(g, 60, y, 50, 180, 1); win(g, 146, y, 50, 180, 1); } g.fillStyle = '#d9d6cc'; g.fillRect(0, 512 - 14, 256, 14); },
};

// ---------- the ISSER Annex ----------
const AO: [number, number] = [285, -395];
const X = (x: number) => x - AO[0], Z = (z: number) => z - AO[1];
const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
const ST = 3.3;
const E = (f: number) => PL + f * ST + BAND;
const WW = [239.5, 261.0, -410.5, -366.5], SR = [261.0, 316.0, -378.0, -365.5], HALL = [276.5, 306.0, -403.6, -378.0], EW = [315.0, 323.3, -403.5, -383.0];
const W = (r: number[], floors: number, more: Partial<Block> = {}): Block => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors, roof: 'none', ...more });
const HUTS: [number, number][] = [[283.1, -429.1], [301.4, -428.5], [318.5, -428.9]];

/** black fret panels between the fence piers (photo 2): a Greek-key band over upright bars */
let fretMat: THREE.MeshStandardMaterial | null = null;
const fret = () => (fretMat ??= (() => {
  const t = canvas(128, 64, (g) => {
    g.clearRect(0, 0, 128, 64);
    g.fillStyle = '#1c1d1f';
    g.fillRect(0, 0, 128, 4); g.fillRect(0, 60, 128, 4); g.fillRect(0, 0, 4, 64); g.fillRect(124, 0, 4, 64);
    for (let x = 0; x < 128; x += 32) { g.fillRect(x + 4, 12, 22, 3); g.fillRect(x + 23, 12, 3, 22); g.fillRect(x + 10, 31, 16, 3); g.fillRect(x + 10, 20, 3, 14); g.fillRect(x + 10, 20, 8, 3); }
    for (let x = 6; x < 128; x += 10) g.fillRect(x, 40, 3, 20);
  });
  t.wrapS = THREE.RepeatWrapping;
  return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.4 });
})());

const annex: Spec = {
  name: 'Institute of Statistical and Social and Economic Research (ISSER) Annex',
  axis: [1, 0], origin: AO, storey: ST, style: A_WIN, roofColor: TILE, fascia: FASCIA, pitch: 0.45, plinth: '#d9d6cc',
  replaces: [[272.5, -383.6], [292.7, -393.1], [320, -392.9], ...HUTS],
  blocks: [
    W(WW, 3), W(SR, 2), W(HALL, 2, { faces: { x0: A_HALL, x1: A_HALL, z0: A_HALL } }), W(EW, 1),
    // the west wing's porch at its south end, the small block north of the hall court
    W([252.0, 258.6, -366.5, -359.0], 2), W([252.5, 265.0, -422.0, -412.0], 1),
  ],
  keep: [[X(232), X(338), Z(-446), Z(-358)]],
  extras: (k: Kit) => {
    const c: Part[] = [];
    const M = (x: number, z: number): [number, number] => [X(x), Z(z)];
    // ---- roofs: the west wing's hip, a gable over its porch; the range's hip, the hall's big hip, the east wing ----
    hipRoof(k, M, WW[0] - 0.8, WW[1] + 0.8, WW[2] - 0.8, WW[3] + 0.8, E(3), 0.5, 'z', [hip, hip], c, FASCIA);
    hipRoof(k, M, 251.4, 259.2, -367.5, -358.4, E(2), 0.55, 'z', [buried, gable], c, FASCIA, ['#f2f1ec', '#e2e0d9']);
    hipRoof(k, M, SR[0] - 1, SR[1] + 0.8, SR[2] - 0.8, SR[3] + 0.8, E(2), 0.5, 'x', [buried, hip], c, FASCIA);
    hipRoof(k, M, HALL[0] - 0.8, HALL[1] + 0.8, HALL[2] - 0.8, HALL[3] + 2, E(2) + 1.2, 0.5, 'x', [hip, hip], c, FASCIA);
    c.push([B(HALL[0], HALL[1], E(2) - BAND, E(2) + 1.2, HALL[2], HALL[3]), WALL]);
    hipRoof(k, M, EW[0] - 0.8, EW[1] + 0.8, EW[2] - 0.8, EW[3] + 0.8, E(1), 0.5, 'z', [hip, hip], c, FASCIA);
    hipRoof(k, M, 252.0, 265.6, -422.6, -411.4, E(1), 0.45, 'x', [hip, hip], c, FASCIA);
    // the west wing's porch: a maroon panel in the gable, columns, the door
    k.plain.push([B(253.6, 257.0, PL + ST + 0.4, E(2) - 0.6, -358.98, -358.95), '#7a2a2c']);
    for (const x of [252.4, 258.2]) c.push([B(x - 0.22, x + 0.22, 0, PL + ST, -358.8, -358.4), WALL]);
    k.plain.push([B(253.8, 256.8, PL, PL + 2.5, -359.04, -358.99), '#2a3138']);
    // ---- the range's porch where the walk from the engineering school arrives (owner's blue arrow) ----
    const pz = SR[3];
    for (const x of [299.3, 303.7]) c.push([B(x - 0.2, x + 0.2, 0, PL + 3.0, pz + 3.2, pz + 3.6), WALL]);
    hipRoof(k, M, 298.6, 304.4, pz - 0.2, pz + 4.0, PL + 3.1, 0.6, 'z', [buried, gable], c, FASCIA, ['#f2f1ec', '#e2e0d9']);
    k.plain.push([B(300.2, 302.8, PL, PL + 2.5, pz, pz + 0.05), '#2a3138'], [B(301.47, 301.53, PL, PL + 2.5, pz + 0.05, pz + 0.08), '#5a6670']);
    k.plain.push([B(298.4, 304.6, 0, PL, pz, pz + 4.0), '#d6d2c8']);
    for (let i = 1; i <= 2; i++) k.plain.push([B(298.4, 304.6, 0, PL - 0.13 * i, pz + 4.0, pz + 4.0 + 0.35 * i), '#cfcac0']);
    // the other doors along the range and the west wing's court (owner's blue marks)
    for (const x of [287.0, 295.6]) k.plain.push([B(x - 0.8, x + 0.8, PL, PL + 2.4, pz, pz + 0.05), '#2a3138'], [B(x - 1.0, x + 1.0, PL + 2.4, PL + 2.6, pz, pz + 0.6), WALL]);
    for (const z of [-395.5, -386.2, -379.6]) k.plain.push([B(WW[1], WW[1] + 0.05, PL, PL + 2.4, z - 0.8, z + 0.8), '#2a3138'], [B(WW[1], WW[1] + 0.6, PL + 2.4, PL + 2.6, z - 1.0, z + 1.0), WALL]);
    k.signs.push({ text: 'ISSER ANNEX', x: X(301.5), y: PL + 3.5, z: Z(pz + 4.05), ry: 0, w: 2.2, colors: ['#f4f4f1', '#1d3f7a'] });
    k.signs.push({ text: 'ISSER CONFERENCE HALL', x: X(296), y: PL + 2.9, z: Z(HALL[3]) - 0.02, ry: Math.PI, w: 2.6, colors: ['#f4f4f1', '#1d3f7a'] });
    // ---- the courts: paved, planters; a covered walk north of the hall ----
    k.plain.push([B(WW[1], HALL[0], 0, 0.04, HALL[2], SR[2]), '#cdc8bc'], [B(HALL[1], EW[0], 0, 0.04, HALL[2], SR[2]), '#cdc8bc']);
    for (const [x, z] of [[268, -400], [268, -390], [270.5, -383], [310.5, -398], [310.5, -388]]) c.push([B(x - 1.1, x + 1.1, 0, 0.55, z - 1.1, z + 1.1), WALL]);
    for (const [x, z] of [[268, -400], [268, -390], [270.5, -383], [310.5, -398], [310.5, -388]]) k.plain.push([new THREE.IcosahedronGeometry(0.9, 0).scale(1, 0.8, 1).translate(X(x), 1.2, Z(z)), '#3f7a2c']);
    c.push([B(280.5, 306.0, 2.9, 3.1, -411.0, -404.6), WALL]);
    for (const x of [281, 287.5, 293.5, 299.5, 305.5]) for (const z of [-410.6]) c.push([B(x - 0.12, x + 0.12, 0, 2.9, z - 0.12, z + 0.12), WALL]);
    // ---- the huts (owner's purple marks): open, white columns, pyramid tile roofs, benches and a table ----
    for (const [hx, hz] of HUTS) {
      const r = 4.7, e = 2.9;
      k.plain.push([B(hx - r, hx + r, 0, 0.3, hz - r, hz + r), '#d8d3c6']);
      for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) c.push([B(hx + dx * (r - 0.5) - 0.2, hx + dx * (r - 0.5) + 0.2, 0.3, e, hz + dz * (r - 0.5) - 0.2, hz + dz * (r - 0.5) + 0.2), WALL]);
      c.push([B(hx - r + 0.3, hx + r - 0.3, e - 0.35, e, hz - r + 0.3, hz - r + 0.6), WALL], [B(hx - r + 0.3, hx + r - 0.3, e - 0.35, e, hz + r - 0.6, hz + r - 0.3), WALL]);
      c.push([B(hx - r + 0.3, hx - r + 0.6, e - 0.35, e, hz - r + 0.3, hz + r - 0.3), WALL], [B(hx + r - 0.6, hx + r - 0.3, e - 0.35, e, hz - r + 0.3, hz + r - 0.3), WALL]);
      hipRoof(k, M, hx - r - 0.3, hx + r + 0.3, hz - r - 0.3, hz + r + 0.3, e, 0.7, 'x', [hip, hip], c, FASCIA);
      // benches round three sides, a table in the middle
      for (const [a, b2, z0, z1] of [[hx - r + 0.8, hx + r - 0.8, hz - r + 0.7, hz - r + 1.2], [hx - r + 0.7, hx - r + 1.2, hz - r + 1.2, hz + r - 0.8], [hx + r - 1.2, hx + r - 0.7, hz - r + 1.2, hz + r - 0.8]]) c.push([B(a, b2, 0.3, 0.75, z0, z1), '#e9e7e1']);
      k.plain.push([new THREE.CylinderGeometry(0.9, 0.9, 0.08, 16).translate(X(hx), 1.05, Z(hz)), '#e9e7e1'], [new THREE.CylinderGeometry(0.12, 0.18, 0.75, 8).translate(X(hx), 0.67, Z(hz)), '#e9e7e1']);
    }
    // the plaza under them: paving, white bench walls along its north and south edges, trees between them
    k.plain.push([B(274.6, 331.0, 0, 0.04, -442.0, -416.5), '#d2ccc0']);
    for (let x = 276; x < 330; x += 13.5) for (const z of [-441.6, -417.0]) c.push([B(x, x + 9.5, 0, 0.55, z - 0.5, z + 0.5), WALL]);
    c.push([B(274.6, 275.4, 0, 0.55, -421, -416.5), WALL]);
    const g = garden([230, 345, -470, -330]);
    g.reseed(37);
    for (let x = 287.2; x < 330; x += 13.5) for (const z of [-441.6, -417.0]) g.tree(k, X(x), Z(z), 0.65);
    // the hedge of trees between the west wing's court and the plaza, the tree by the car park, the corner tree
    for (const z of [-438, -431, -424, -417, -410]) g.tree(k, X(269), Z(z), 0.9);
    g.tree(k, X(266), Z(-343), 1.3);
    g.tree(k, X(325.5), Z(-369.5), 0.8);
    // the bare red earth north of the plaza (the aerial)
    const earth = new THREE.Mesh(new THREE.PlaneGeometry(64, 18).rotateX(-Math.PI / 2).translate(X(302), 0.04, Z(-454)), new THREE.MeshStandardMaterial({ color: '#a46a45', roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
    earth.receiveShadow = true;
    k.meshes.push(earth);
    // ---- the palms along the front of the range, a planted strip between the car rows ----
    for (let x = 266; x < 333; x += 5.5) if (Math.abs(x - 301.5) > 3) g.palm(k, X(x), Z(-362.5), 4.2 + ((x * 7) % 10) / 6);
    // ---- the fence along the road on the east (photo 2): piers, a low wall, black fret panels, the hedge outside ----
    const fx = 336.2;
    for (let z = -446; z < -340; z += 3.2) {
      c.push([B(fx - 0.3, fx + 0.3, 0, 2.3, z - 0.3, z + 0.3), WALL], [B(fx - 0.36, fx + 0.36, 2.3, 2.45, z - 0.36, z + 0.36), '#e9e7e1']);
      if (z + 3.2 < -340) { c.push([B(fx - 0.15, fx + 0.15, 0, 0.55, z + 0.3, z + 2.9), WALL]); panel(AO, k, fret(), fx, z + 0.3, fx, z + 2.9, 0.55, 1.9, 2.6, 1.35); }
    }
    g.hedge(k, X(fx + 1.2), Z(-446), X(fx + 1.2), Z(-341));
    const m = new THREE.Mesh(merge(c), concrete(0.12));
    m.castShadow = true; m.receiveShadow = true;
    k.meshes.push(m);
  },
};

// ---------- the concrete frame going up behind blue hoarding (owner's yellow mark, photo 3) ----------
const PO: [number, number] = [206, -367];
const plot: Spec = (() => {
  const PX = (x: number) => x - PO[0], PZ = (z: number) => z - PO[1];
  const PB = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(PX(x0), PX(x1), y0, y1, PZ(z0), PZ(z1));
  const [x0, x1, z0, z1] = [177.5, 236.0, -397.0, -337.0];
  return {
    name: 'building under construction west of the ISSER Annex',
    axis: [1, 0], origin: PO, storey: 3.4, style: A_WIN, roofColor: TILE, fascia: FASCIA, pitch: 0.3,
    blocks: [],
    keep: [[PX(x0), PX(x1), PZ(z0), PZ(z1) + 2]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      let s = 21;
      const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
      // red earth inside the hoarding and before it
      const earth = new THREE.MeshStandardMaterial({ color: '#9c6a4a', roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
      for (const [a, b, c0, c1] of [[x0, x1, z0, z1], [x0 - 4, x1 + 2, z1, z1 + 9]]) {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(b - a, c1 - c0).rotateX(-Math.PI / 2).translate(PX((a + b) / 2), 0.04, PZ((c0 + c1) / 2)), earth);
        p.receiveShadow = true; k.meshes.push(p);
      }
      // the hoarding: blue corrugated sheets on posts, a stretch of dark sheets at the west end of the front, a gate
      const sheets = (blue: boolean) => canvas(64, 64, (g) => { g.fillStyle = blue ? '#1d4fa8' : '#2c2f33'; g.fillRect(0, 0, 64, 64); for (let x = 0; x < 64; x += 8) { g.fillStyle = blue ? '#2a62c2' : '#3a3e43'; g.fillRect(x, 0, 3, 64); g.fillStyle = blue ? '#173f86' : '#222528'; g.fillRect(x + 5, 0, 2, 64); } });
      const tBlue = sheets(true), tDark = sheets(false);
      for (const t of [tBlue, tDark]) t.wrapS = t.wrapT = THREE.RepeatWrapping;
      const mBlue = new THREE.MeshStandardMaterial({ map: tBlue, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.3 }), mDark = new THREE.MeshStandardMaterial({ map: tDark, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.3 });
      const H = 2.5;
      panel(PO, k, mDark, x0, z1, 192, z1, 0, H, 1.0, 2.5);
      panel(PO, k, mBlue, 192, z1, 226.5, z1, 0, H, 1.0, 2.5);
      panel(PO, k, mBlue, 229.5, z1, x1, z1, 0, H, 1.0, 2.5);
      panel(PO, k, mBlue, x0, z0, x1, z0, 0, H, 1.0, 2.5);
      panel(PO, k, mBlue, x0, z0, x0, z1, 0, H, 1.0, 2.5);
      panel(PO, k, mBlue, x1, z0, x1, z1, 0, H, 1.0, 2.5);
      for (let x = x0; x <= x1; x += 3) for (const z of [z0, z1]) c.push([PB(x - 0.05, x + 0.05, 0, H + 0.1, z - 0.05, z + 0.05), '#6d7175']);
      // the site gate: two pale leaves in the front near the east end
      k.plain.push([PB(226.5, 229.5, 0, H, z1 - 0.04, z1), '#e4e2dc']);
      // the contractor's boards on the front (MARLEYROSSI), the site notices
      const board = (x: number, w: number, h: number, y: number, text: string, colors: [string, string]) => {
        k.plain.push([PB(x - w / 2, x + w / 2, y, y + h, z1 + 0.02, z1 + 0.06), colors[0]]);
        k.signs.push({ text, x: PX(x), y: y + h / 2, z: PZ(z1) + 0.08, ry: 0, w: w * 0.9, colors });
      };
      board(213, 2.6, 1.6, 0.7, 'MARLEYROSSI', ['#222326', '#ffffff']);
      board(196.5, 1.3, 1.9, 0.3, 'SITE NOTICE', ['#f2f2ee', '#1d3f7a']);
      board(181.5, 0.9, 1.9, 0.3, 'SAFETY FIRST', ['#f2f2ee', '#2e7d4f']);
      board(234.2, 1.4, 2.0, 0.4, 'MARLEYROSSI', ['#f2f2ee', '#1d3f7a']);
      // red and white barriers before it
      for (const x of [183, 188]) { k.plain.push([PB(x - 1.0, x + 1.0, 0.75, 0.9, z1 + 3.0, z1 + 3.1), '#c0392b']); for (const dx of [-0.9, 0.9]) k.plain.push([PB(x + dx - 0.04, x + dx + 0.04, 0, 0.9, z1 + 3.0, z1 + 3.1), '#e9e7e1']); }
      // the frame: columns on a grid, the first-floor slab, the upper floor's columns with orange shores and
      // formwork between them, the top slab, rebar standing over it
      const fx0 = 205, fx1 = 233, fz0 = -388, fz1 = -372, F1 = 3.6, F2 = 7.0;
      const xs = Array.from({ length: 6 }, (_, i) => fx0 + 0.3 + (i * (fx1 - fx0 - 0.6)) / 5), zs = [fz0 + 0.3, (fz0 + fz1) / 2, fz1 - 0.3];
      c.push([PB(fx0, fx1, 0, 0.2, fz0, fz1), '#9b998f']);
      for (const x of xs) for (const z of zs) {
        c.push([PB(x - 0.22, x + 0.22, 0.2, F1, z - 0.22, z + 0.22), '#a7a59d'], [PB(x - 0.2, x + 0.2, F1 + 0.25, F2, z - 0.2, z + 0.2), '#a7a59d']);
        for (const [dx, dz] of [[-0.12, -0.12], [0.12, 0.12], [-0.12, 0.12]]) k.plain.push([PB(x + dx - 0.015, x + dx + 0.015, F2 + 0.25, F2 + 1.1 + r() * 0.4, z + dz - 0.015, z + dz + 0.015), '#5b4535']);
      }
      for (const y of [F1, F2]) {
        c.push([PB(fx0 - 0.3, fx1 + 0.3, y, y + 0.25, fz0 - 0.3, fz1 + 0.3), '#b2b0a8']);
        c.push([PB(fx0 - 0.3, fx1 + 0.3, y - 0.45, y, fz1 - 0.1, fz1 + 0.3), '#9d9b93'], [PB(fx0 - 0.3, fx1 + 0.3, y - 0.45, y, fz0 - 0.3, fz0 + 0.1), '#9d9b93']);
      }
      // the shores under the top slab, orange, close set; the plywood of the formwork along the upper floor
      for (let x = fx0 + 0.8; x < fx1 - 0.5; x += 0.9) for (const z of [fz0 + 1.5, fz0 + 5, (fz0 + fz1) / 2 + 2.5, fz1 - 1.5]) k.plain.push([PB(x - 0.04, x + 0.04, F1 + 0.25, F2 - 0.05, z - 0.04, z + 0.04), r() < 0.7 ? '#d0622b' : '#b9502a']);
      k.plain.push([PB(fx0 + 0.5, fx1 - 0.5, F2 - 0.6, F2 - 0.05, fz1 - 0.6, fz1 - 0.5), '#c2552b']);
      // a ladder, heaps of sand and gravel, a stack of blocks
      k.plain.push([new THREE.ConeGeometry(1.6, 1.1, 12).translate(PX(195), 0.55, PZ(-385)), '#c9a46a'], [new THREE.ConeGeometry(1.3, 0.9, 12).translate(PX(199), 0.45, PZ(-380)), '#8d8a84']);
      for (let i = 0; i < 4; i++) c.push([PB(186, 189, 0, 0.2 * (4 - i), -392 + i * 0.5, -391.6 + i * 0.5), '#aeaca4']);
      // the tree before the hoarding (photo 3)
      const g = garden([170, 245, -400, -320]);
      g.reseed(53);
      g.tree(k, PX(205), PZ(-332), 1.5);
      const m = new THREE.Mesh(merge(c), concrete(1.3));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

// ---------- the one-floor hall with the stone dado (owner's red mark, photo 4) ----------
const HO: [number, number] = [149.5, -362.7];
const HU: [number, number] = [36.8, 4.5];
const HL = 18.55, HW = 8.4;
/** white wall over the stone dado: drawn plain, the model sets in the doors, the screen and the windows */
const H_WALL: Style = {
  bay: 4.0, up: [], ground: [],
  draw: (g) => { render(g, '#f2f1ec'); speckle(g, 0, 0, 256, 512, 300, ['rgba(130,126,116,0.15)']); for (let i = 0; i < 8; i++) { const gr = g.createLinearGradient(0, 256, 0, 400); gr.addColorStop(0, 'rgba(110,106,96,0.2)'); gr.addColorStop(1, 'rgba(110,106,96,0)'); g.fillStyle = gr; g.fillRect((i * 37) % 250, 256, 4, 144); } },
};
let stoneMat: THREE.MeshStandardMaterial | null = null;
function stone() {
  if (stoneMat) return stoneMat;
  let s = 7;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const tex = canvas(256, 256, (g) => {
    g.fillStyle = '#5f5a52'; g.fillRect(0, 0, 256, 256);
    const cols = ['#b8ab98', '#a39886', '#c9bfae', '#8f8577', '#d4cab8', '#9c8f7c'];
    for (let j = 0; j < 9; j++) for (let i = 0; i < 6; i++) {
      const cx = i * 44 + (j % 2) * 22 + r() * 8, cy = j * 29 + r() * 6, rx = 18 + r() * 8, ry = 10 + r() * 5, n = 5 + ((r() * 3) | 0), col = cols[(r() * cols.length) | 0];
      for (const [ox, oy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) {
        g.beginPath();
        for (let q = 0; q < n; q++) { const a = (q / n) * Math.PI * 2 + r() * 0.4, f = 0.7 + r() * 0.35; g[q ? 'lineTo' : 'moveTo'](cx + ox + Math.cos(a) * rx * f, cy + oy + Math.sin(a) * ry * f); }
        g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = 'rgba(40,36,30,0.6)'; g.lineWidth = 2; g.stroke();
      }
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.sdTex = { value: tex };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSdP;\nvarying vec3 vSdN;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvSdP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvSdN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSdP;\nvarying vec3 vSdN;\nuniform sampler2D sdTex;')
      .replace('#include <map_fragment>', `#include <map_fragment>
  vec3 sdA = abs(vSdN);
  vec2 sdUv = sdA.y > 0.6 ? vSdP.xz / 1.8 : vec2((sdA.x > sdA.z ? vSdP.z : vSdP.x) / 1.8, vSdP.y / 1.8);
  diffuseColor.rgb *= texture2D(sdTex, sdUv).rgb;`);
  };
  m.customProgramCacheKey = () => 'stone-dado';
  return (stoneMat = m);
}
const stoneHall: Spec = {
  name: 'hall west of the ISSER Annex',
  axis: HU, origin: HO, storey: 3.2, style: H_WALL, roofColor: '#cf5a35', fascia: '#3a3d42', pitch: 0.4, plinth: '#a8312b',
  replaces: [[149.5, -362.7]],
  blocks: [{ x0: -HL, x1: HL, z0: -HW, z1: HW, floors: 1, roof: 'none' }],
  keep: [[-HL - 1.5, HL + 1.5, -HW - 1.5, HW + 2.5]],
  extras: (k: Kit) => {
    const c: Part[] = [], st: Part[] = [];
    const e = PL + 3.2 + BAND;
    const M = (x: number, z: number): [number, number] => [x, z];
    // the roof: orange-red sheets, a hip; over the west end a raised cross gable, its gable to the south with a
    // louvred vent; solar panels on the slopes
    hipRoof(k, M, -HL - 0.8, HL + 0.8, -HW - 0.8, HW + 0.8, e, 0.38, 'x', [hip, hip], c, '#3a3d42');
    // the raised gable sits on the roof over the west end, its gable to the south (photo 4): white walls rising out
    // of the roof, the same sheets on it, a dark louvred vent filling the gable
    const gx0 = -HL + 2.5, gx1 = -HL + 9.5, gm = (gx0 + gx1) / 2, gz = 3.6, geave = e + 2.2, gtop = geave + (gm - gx0 + 0.5) * 0.6;
    c.push([box(gx0, gx1, e + 0.5, geave, -gz, gz), '#efeee9']);
    k.roof.quad([gx0 - 0.5, geave, gz + 0.6], [gx0 - 0.5, geave, -gz - 0.6], [gm, gtop, -gz - 0.6], [gm, gtop, gz + 0.6]);
    k.roof.quad([gx1 + 0.5, geave, -gz - 0.6], [gx1 + 0.5, geave, gz + 0.6], [gm, gtop, gz + 0.6], [gm, gtop, -gz - 0.6]);
    for (const zz of [gz + 0.02, -gz - 0.02]) k.plain.push([tri2([gx0, geave, zz], [gx1, geave, zz], [gm, gtop - 0.15, zz]), '#efeee9']);
    k.plain.push([tri2([gx0 + 0.6, geave + 0.15, gz + 0.04], [gx1 - 0.6, geave + 0.15, gz + 0.04], [gm, gtop - 0.5, gz + 0.04]), '#3c3f44']);
    for (let y = geave + 0.3; y < gtop - 0.6; y += 0.2) { const w = ((gtop - 0.5 - y) / (gtop - 0.5 - geave - 0.15)) * (gm - gx0 - 0.6) - 0.1; if (w > 0.1) k.plain.push([box(gm - w, gm + w, y, y + 0.06, gz + 0.05, gz + 0.1), '#62666c']); }
    k.plain.push([box(gx0 - 0.55, gx1 + 0.55, geave - 0.2, geave, gz + 0.55, gz + 0.65), '#3a3d42']);
    // solar panels on the south slope, toward the west end (photo 4)
    const sl = Math.atan(0.38);
    for (const [x0, x1] of [[-15.5, -11.0], [-10.5, -6.0]]) for (const zc of [2.2, 5.2]) {
      const y = e + (HW + 0.8 - zc) * 0.38 + 0.09;
      k.plain.push([new THREE.BoxGeometry(x1 - x0, 0.06, 2.6).rotateX(sl).translate((x0 + x1) / 2, y, zc), '#22304f']);
      k.plain.push([new THREE.BoxGeometry(x1 - x0 + 0.1, 0.04, 2.7).rotateX(sl).translate((x0 + x1) / 2, y - 0.03, zc), '#b9bcc0']);
    }
    // the stone dado all round, the red line at its foot
    for (const [a, b, z0, z1] of [[-HL, HL, HW, HW + 0.08], [-HL, HL, -HW - 0.08, -HW], [-HL - 0.08, -HL, -HW, HW], [HL, HL + 0.08, -HW, HW]]) {
      st.push([box(a, b, 0.15, 0.9, z0, z1), '#ffffff']);
      k.plain.push([box(a - 0.01, b + 0.01, 0, 0.15, z0 - 0.01, z1 + 0.01), '#a8312b']);
    }
    // the south face (photo 4), west to east: the steps up at the west end, a breeze-block screen, a door, an
    // air-conditioner in its cage, a door, the panel of glass blocks, cages, small windows, a door at the east
    const z = HW + 0.09;
    const door = (x: number) => {
      k.plain.push([box(x - 0.8, x + 0.8, 0.9, 3.1, z - 0.06, z), '#eeede8'], [box(x - 0.9, x + 0.9, 3.1, 3.2, z - 0.06, z + 0.04), '#e2e0da']);
      for (const dx of [-0.4, 0.4]) for (const y of [1.2, 2.2]) k.plain.push([box(x + dx - 0.28, x + dx + 0.28, y, y + 0.7, z, z + 0.02), '#dcdbd5']);
      k.plain.push([box(x - 0.02, x + 0.02, 0.9, 3.1, z, z + 0.03), '#b9b8b2'], [box(x - 0.14, x - 0.08, 1.8, 2.1, z, z + 0.05), '#2a2a2a'], [box(x + 0.08, x + 0.14, 1.8, 2.1, z, z + 0.05), '#2a2a2a']);
      st.push([box(x - 1.1, x + 1.1, 0, 0.45, z, z + 0.6), '#ffffff'], [box(x - 1.1, x + 1.1, 0, 0.9, z, z + 0.3), '#ffffff']);
    };
    door(-12.5); door(-1.5);
    // the breeze-block screen at the west end
    k.plain.push([box(-17.6, -14.2, 1.0, 2.9, z - 0.05, z), '#eeede8']);
    for (let x = -17.4; x < -14.3; x += 0.42) for (let y = 1.1; y < 2.8; y += 0.42) k.plain.push([box(x, x + 0.3, y, y + 0.3, z, z + 0.02), '#cfcec8']);
    // the steps and the ramp at the west end
    for (let i = 1; i <= 4; i++) k.plain.push([box(-HL - 0.4 * i, -HL, 0, 0.9 - 0.22 * i, HW - 3, HW - 0.2), '#c9c4b8']);
    // the glass-block panel
    k.plain.push([box(1.6, 5.4, 1.2, 2.9, z - 0.05, z), '#9fa8ad']);
    for (let x = 1.7; x < 5.35; x += 0.3) for (let y = 1.25; y < 2.88; y += 0.3) k.plain.push([box(x, x + 0.25, y, y + 0.25, z, z + 0.02), '#c7d0d4']);
    // small dark windows toward the east, a pale door at the east end
    for (const x of [11.5, 13.3, 15.1]) k.plain.push([box(x - 0.4, x + 0.4, 2.0, 2.6, z - 0.04, z + 0.02), '#2a3036']);
    k.plain.push([box(16.6, 17.8, 0.9, 2.9, z - 0.05, z + 0.01), '#e2e0da']);
    // air-conditioners in their cages along the wall
    for (const x of [-10.2, -8.2, 7.5, 9.7, 12.4, 14.6, 16.9]) {
      k.plain.push([box(x - 0.45, x + 0.45, 0.05, 0.75, z + 0.2, z + 0.7), '#e6e8e8']);
      for (let dx = -0.48; dx <= 0.49; dx += 0.12) k.plain.push([box(x + dx - 0.015, x + dx + 0.015, 0.05, 0.85, z + 0.72, z + 0.75), '#2d2f31']);
      k.plain.push([box(x - 0.5, x + 0.5, 0.82, 0.86, z + 0.15, z + 0.75), '#2d2f31']);
    }
    // a light over each door, the apron round the hall
    for (const x of [-12.5, -1.5]) k.plain.push([box(x - 0.15, x + 0.15, 3.4, 3.55, z, z + 0.12), '#fff3d0']);
    k.plain.push([box(-HL - 1.2, HL + 1.2, 0, 0.05, -HW - 1.2, HW + 1.2), '#bdb7aa']);
    // a big tree before it (photo 4), red earth tracks
    const g = garden([110, 190, -390, -330]);
    g.reseed(29);
    g.tree(k, 6, HW + 7, 1.7);
    const earth = new THREE.MeshStandardMaterial({ color: '#a8643f', roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(HL * 2 + 10, 3.0).rotateX(-Math.PI / 2).translate(0, 0.04, HW + 5.5), earth);
    p.receiveShadow = true; k.meshes.push(p);
    const sm = new THREE.Mesh(merge(st), stone());
    sm.castShadow = true; sm.receiveShadow = true;
    const m = new THREE.Mesh(merge(c), concrete(0.4));
    m.castShadow = true; m.receiveShadow = true;
    k.meshes.push(sm, m);
  },
};

/** the ISSER Annex, the frame going up west of it, and the hall beyond */
export const isserAnnexSite = createSite('isser-annex', [annex, plot, stoneHall]);
