// LECIAD (Legon Centre for International Affairs and Diplomacy) and the small buildings west of it, from the owner's
// street photo (taken from the west at night) and marked aerial (registered to LECIAD's outline at 0.225 m/px).
//
// LECIAD (violet): four parts round a paved service court full of air-conditioning plant: the broad south block, four
// storeys, the tallest and nearest in the photo; the west wing, the north-east wing and the range between them,
// three storeys. Cream walls, a red-brown band round their foot, glass windows in dark frames set in white surrounds
// between pale piers, air-conditioners on the walls; terracotta hip roofs on dark fascias; a flat-roofed strip on the
// east side; an entrance under a flat canopy in the west wing's west face and a small one at the north-east wing's
// west end.
// West of it, by the road: two small square one-floor buildings, the same design (white marks): white walls a little
// dirty from the road (about 15 %), a red-brown band at the foot, a low gable roof of dark sheets, a dark door in the
// west face (blue mark) and a small square window high beside it; a big shade tree over the first one's roof (red).
// North of them the power plant (light green): a generator on a concrete pad under a dark hipped canopy on six posts.
import * as THREE from 'three';
import { box, merge, speckle, tri2, type Part } from './modelkit';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { concrete } from './concrete';
import { SOLIDS } from './solids';

const CREAM = '#ede3c6', PIER = '#f4eedb', SURROUND = '#f7f4ea', FRAME = '#2e3134', DADO = '#8a3a25';
const ROOF = '#b0613f', FASCIA = '#4f3427';

/** cream render with light grime, the red-brown band at the foot of the ground storey */
const cream = (g: CanvasRenderingContext2D, ground: boolean) => {
  render(g, CREAM);
  speckle(g, 0, 0, 256, 512, 500, ['rgba(150,138,110,0.12)', 'rgba(120,110,90,0.08)']);
  // pale piers either side of the bay, the floor slab's line at the top of each storey
  g.fillStyle = PIER; g.fillRect(0, 0, 12, 512); g.fillRect(244, 0, 12, 512);
  g.fillStyle = 'rgba(150,140,118,0.35)'; g.fillRect(12, 0, 2, 512); g.fillRect(242, 0, 2, 512);
  for (const y of [0, 256]) { g.fillStyle = PIER; g.fillRect(0, y, 256, 14); g.fillStyle = 'rgba(150,140,118,0.4)'; g.fillRect(0, y + 14, 256, 2); }
  if (ground) {
    g.fillStyle = DADO; g.fillRect(0, 512 - 46, 256, 46);
    speckle(g, 0, 512 - 46, 256, 46, 120, ['#7a3020', '#9a4430']);
    g.fillStyle = 'rgba(120,60,40,0.35)'; g.fillRect(0, 512 - 48, 256, 2);
  }
};
/** a glass window in a dark frame inside a white surround */
const glazed = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cols: number) => {
  g.fillStyle = SURROUND; g.fillRect(x - 12, y - 12, w + 24, h + 26);
  g.fillStyle = 'rgba(140,130,110,0.35)'; g.fillRect(x - 12, y + h + 12, w + 24, 2);
  g.fillStyle = FRAME; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  const gl = g.createLinearGradient(0, y, 0, y + h);
  gl.addColorStop(0, '#62778a'); gl.addColorStop(0.5, '#2f3c48'); gl.addColorStop(1, '#1a2028');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(255,255,255,0.09)';
  g.beginPath(); g.moveTo(x + w * 0.12, y); g.lineTo(x + w * 0.3, y); g.lineTo(x + w * 0.08, y + h); g.lineTo(x, y + h); g.fill();
  g.fillStyle = FRAME;
  for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - 2, y, 4, h);
  g.fillRect(x, y + h * 0.3, w, 4);
};
/** the long faces: a wide window of glass to each bay */
const L_WIN: Style = {
  bay: 3.6, up: [[46, 74, 164, 110]], ground: [[46, 256 + 74, 164, 110]],
  draw: (g) => { cream(g, true); glazed(g, 46, 74, 164, 110, 3); glazed(g, 46, 256 + 74, 164, 110, 3); },
};
/** the south block: windows in pairs, a pier between them (the photo's tall block) */
const L_PAIR: Style = {
  bay: 3.4, up: [[40, 74, 76, 110], [140, 74, 76, 110]], ground: [[40, 256 + 74, 76, 110], [140, 256 + 74, 76, 110]],
  draw: (g) => {
    cream(g, true);
    for (const y of [74, 256 + 74]) { glazed(g, 40, y, 76, 110, 2); glazed(g, 140, y, 76, 110, 2); g.fillStyle = PIER; g.fillRect(124, y - 14, 8, 138); }
  },
};
/** the ends: cream between piers, a narrow window */
const L_END: Style = {
  bay: 4.2, up: [[106, 70, 44, 110]], ground: [[106, 256 + 70, 44, 110]],
  draw: (g) => { cream(g, true); glazed(g, 106, 70, 44, 110, 1); glazed(g, 106, 256 + 70, 44, 110, 1); },
};

// ---------- LECIAD ----------
const LO: [number, number] = [311, -40];
const LST = 3.3;
const S = [283.0, 339.2, -35.7, -15.0], W = [284.8, 298.2, -51.3, -35.7], C = [310.1, 325.7, -48.4, -35.7], NE = [301.5, 339.3, -65.5, -48.4], EF = [325.7, 330.0, -46.3, -38.2];
/** the paved service court between the wings */
const CT = [298.2, 310.1, -48.4, -35.7];
const frame = (O: [number, number]) => {
  const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
  return { X, Z, B };
};
const liciad: Spec = (() => {
  const { X, Z, B } = frame(LO);
  const R = (r: number[], floors: number, roof: 'hip' | 'flat' | 'crossZ', faces: Spec['blocks'][number]['faces'] = {}) => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors, roof, faces });
  return {
    name: 'LECIAD, Legon',
    axis: [1, 0], origin: LO, storey: LST, style: L_WIN, roofColor: ROOF, fascia: FASCIA, pitch: 0.38, plinth: DADO,
    blocks: [
      R(S, 4, 'hip', { z0: L_PAIR, z1: L_PAIR, x0: L_PAIR, x1: L_PAIR }),
      R(W, 3, 'hip', { z0: L_END }),
      R(NE, 3, 'hip', { x0: L_END, x1: L_END }),
      R(C, 3, 'crossZ'),
      R(EF, 3, 'flat', { x1: L_END }),
    ],
    keep: [[X(CT[0]), X(CT[1]), Z(CT[2]), Z(CT[3])], [X(W[0]) - 3.5, X(W[0]), Z(-46), Z(-40)]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      // the service court: paving, rows of air-conditioning condensers and their pipes, a plant room door
      k.plain.push([B(CT[0], CT[1], 0.02, 0.08, CT[2], CT[3]), '#b9b4a8']);
      for (let i = 0; i < 8; i++) {
        const x = CT[0] + 1.6 + (i % 4) * 2.6, z = CT[2] + 2.5 + Math.floor(i / 4) * 5.5;
        c.push([B(x - 0.5, x + 0.5, 0.08, 0.9, z - 0.4, z + 0.4), '#d9dad6']);
        k.plain.push([new THREE.CylinderGeometry(0.3, 0.3, 0.04, 12).translate(X(x), 0.92, Z(z)), '#3a3d40']);
      }
      for (const x of [CT[0] + 3, CT[0] + 8.2]) c.push([B(x, x + 1.8, 0.08, 1.6, CT[3] - 2.8, CT[3] - 1.4), '#c8c9c4']);
      k.plain.push([B(CT[0] + 0.3, CT[1] - 0.3, 3.2, 3.3, CT[3] - 0.25, CT[3] - 0.1), '#8d9093']);
      // the entrance in the west wing's west face: glass doors under a flat canopy on two columns, a step
      const wx = W[0], zm = (W[2] + W[3]) / 2;
      k.plain.push([B(wx - 0.03, wx, 0.4, 2.8, zm - 1.4, zm + 1.4), FRAME]);
      for (const z of [zm - 1.3, zm]) {
        const gl = new THREE.BoxGeometry(0.02, 2.2, 1.2).translate(X(wx) - 0.04, 1.55, Z(z + 0.65));
        k.glass.push(gl);
      }
      c.push([B(wx - 2.2, wx, 3.15, 3.45, zm - 2.3, zm + 2.3), SURROUND]);
      for (const z of [zm - 2.0, zm + 2.0]) c.push([B(wx - 2.05, wx - 1.75, 0, 3.15, z - 0.15, z + 0.15), SURROUND]);
      c.push([B(wx - 2.4, wx, 0, 0.18, zm - 2.5, zm + 2.5), '#cfc9bc'], [B(wx - 0.9, wx, 0.18, 0.36, zm - 1.6, zm + 1.6), '#cfc9bc']);
      k.plain.push([B(wx - 1.2, wx - 0.9, 3.1, 3.15, zm - 0.3, zm + 0.3), '#fff3d0']);
      // a small door with a canopy at the north-east wing's west end
      const nx = NE[0], nz = -57;
      k.plain.push([B(nx - 0.03, nx, 0.4, 2.6, nz - 0.9, nz + 0.9), FRAME], [B(nx - 0.05, nx - 0.03, 0.5, 2.5, nz - 0.8, nz + 0.8), '#3a4652']);
      c.push([B(nx - 1.5, nx, 2.85, 3.05, nz - 1.4, nz + 1.4), SURROUND], [B(nx - 1.2, nx, 0, 0.3, nz - 1.2, nz + 1.2), '#cfc9bc']);
      // air-conditioners on the walls (photo): on the south block's west end and here and there on the long faces
      const ac = (x: number, z: number, y: number, nxs: number, nzs: number) => {
        const w = 0.8, d = 0.3, h = 0.55;
        if (nxs) c.push([B(x + (nxs < 0 ? -d : 0), x + (nxs < 0 ? 0 : d), y, y + h, z - w / 2, z + w / 2), '#eceeed']);
        else c.push([B(x - w / 2, x + w / 2, y, y + h, z + (nzs < 0 ? -d : 0), z + (nzs < 0 ? 0 : d)), '#eceeed']);
      };
      for (const [z, f] of [[-31.2, 3], [-24.4, 1], [-19.8, 2], [-28.0, 0]]) ac(S[0], z, 0.4 + f * LST + 2.3, -1, 0);
      for (const [x, f] of [[292, 1], [306, 2], [318, 0], [331, 1]]) ac(x, S[3], 0.4 + f * LST + 2.3, 0, 1);
      for (const [x, f] of [[309, 1], [322, 2], [334, 0]]) ac(x, NE[2], 0.4 + f * LST + 2.3, 0, -1);
      const m = new THREE.Mesh(merge(c), concrete(0.35));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

// ---------- the two small square buildings west of LECIAD, the power plant, the tree ----------
const WHITE_DIRTY = '#ebe8df', SHEET = '#3f3631', SHEET_RIB = '#2f2824', BARGE = '#2f2824';
/** white render about 15 % dirty from the road: grime splashed up from the foot, streaks from the eaves; the band */
const S_WALL: Style = {
  bay: 4.0, up: [], ground: [],
  draw: (g) => {
    render(g, WHITE_DIRTY);
    speckle(g, 0, 0, 256, 512, 900, ['rgba(130,122,104,0.16)', 'rgba(110,100,84,0.12)', 'rgba(150,140,120,0.1)']);
    for (let i = 0; i < 10; i++) { const x = (i * 29 + 7) % 250, gr = g.createLinearGradient(0, 256, 0, 380); gr.addColorStop(0, 'rgba(110,100,84,0.2)'); gr.addColorStop(1, 'rgba(110,100,84,0)'); g.fillStyle = gr; g.fillRect(x, 256, 3 + (i % 3) * 2, 124); }
    const sp = g.createLinearGradient(0, 512 - 140, 0, 512 - 34); sp.addColorStop(0, 'rgba(140,110,80,0)'); sp.addColorStop(1, 'rgba(140,110,80,0.28)');
    g.fillStyle = sp; g.fillRect(0, 512 - 140, 256, 106);
    g.fillStyle = DADO; g.fillRect(0, 512 - 34, 256, 34);
    speckle(g, 0, 512 - 34, 256, 34, 120, ['#7a3020', '#9a4430', '#6e2c1e']);
  },
};
const SQ1 = [247.2, 255.4, -29.0, -20.4], SQ2 = [248.2, 256.4, -17.2, -8.6];
const PP = [247.3, 253.7, -34.3, -30.4];
const TREE: [number, number] = [260.8, -23.8];
const SO: [number, number] = [252.3, -12.9];
const SE = 3.0;
const smallBlocks: Spec = (() => {
  const { X, Z, B } = frame(SO);
  return {
    name: 'small square buildings west of LECIAD',
    axis: [1, 0], origin: SO, storey: SE - 0.8, style: S_WALL, roofColor: SHEET, fascia: BARGE, pitch: 0.3, plinth: DADO,
    replaces: [[252.3, -12.9]],
    blocks: [SQ1, SQ2].map((q) => ({ x0: X(q[0]), x1: X(q[1]), z0: Z(q[2]), z1: Z(q[3]), floors: 1, roof: 'none' as const })),
    keep: [[X(SQ1[0]) - 1, X(SQ1[1]) + 1, Z(SQ1[2]) - 1, Z(SQ1[3]) + 1], [X(PP[0]) - 0.8, X(PP[1]) + 0.8, Z(PP[2]) - 0.8, Z(PP[3]) + 0.8], [X(TREE[0]) - 1.5, X(TREE[0]) + 1.5, Z(TREE[1]) - 1.5, Z(TREE[1]) + 1.5]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      const e = k.wallTop(1);
      for (const q of [SQ1, SQ2]) {
        // the low gable roof of dark sheets: ridge along z, eaves out past the walls, ribs down the slopes
        const ox = 0.45, oz = 0.35, x0 = q[0] - ox, x1 = q[1] + ox, z0 = q[2] - oz, z1 = q[3] + oz, xm = (q[0] + q[1]) / 2;
        const rise = ((q[1] - q[0]) / 2 + ox) * 0.3, top = e + rise;
        const P = (x: number, y: number, z: number): [number, number, number] => [X(x), y, Z(z)];
        for (const [xa, xb] of [[x0, xm], [x1, xm]]) {
          c.push([tri2(P(xa, e, z0), P(xa, e, z1), P(xb, top, z1)), SHEET], [tri2(P(xa, e, z0), P(xb, top, z1), P(xb, top, z0)), SHEET]);
          const len = Math.hypot(xb - xa, rise), ang = Math.atan2(rise, xb - xa);
          for (let z = z0 + 0.2; z < z1 - 0.1; z += 0.3) {
            c.push([new THREE.BoxGeometry(len, 0.03, 0.05).rotateZ(ang).translate((X(xa) + X(xb)) / 2, (e + top) / 2 + 0.03, Z(z)), SHEET_RIB]);
          }
        }
        c.push([B(xm - 0.15, xm + 0.15, top - 0.02, top + 0.08, z0, z1), SHEET_RIB]);
        // the white gables under it, dark barge boards along their slopes, a dark fascia along the eaves
        for (const z of [q[2], q[3]]) {
          c.push([tri2(P(q[0], e, z), P(q[1], e, z), P(xm, top - 0.05, z)), WHITE_DIRTY]);
          for (const [xa, xb] of [[x0, xm], [x1, xm]]) {
            const zz = z === q[2] ? z0 : z1, len = Math.hypot(xb - xa, rise), ang = Math.atan2(rise, xb - xa);
            c.push([new THREE.BoxGeometry(len, 0.18, 0.05).rotateZ(ang).translate((X(xa) + X(xb)) / 2, (e + top) / 2 - 0.06, Z(zz)), BARGE]);
          }
        }
        for (const x of [x0, x1]) c.push([B(x - 0.03, x + 0.03, e - 0.18, e + 0.02, z0, z1), BARGE]);
        // the door in the west face (blue mark): dark, in a plain frame, on a step; the small square window high beside it
        const fx = q[0], dz = q[3] - 3.0;
        k.plain.push([B(fx - 0.02, fx, 0.4, 2.45, dz - 0.5, dz + 0.5), '#1a1816']);
        for (let z = dz - 0.42; z < dz + 0.45; z += 0.21) k.plain.push([B(fx - 0.04, fx - 0.02, 0.45, 2.4, z - 0.02, z + 0.02), '#2c2925']);
        c.push([B(fx - 0.08, fx, 2.45, 2.55, dz - 0.6, dz + 0.6), '#d8d4ca']);
        for (const z of [dz - 0.6, dz + 0.5]) c.push([B(fx - 0.08, fx, 0.4, 2.45, z, z + 0.1), '#d8d4ca']);
        c.push([B(fx - 0.6, fx, 0, 0.4, dz - 0.8, dz + 0.8), '#b7b1a5']);
        k.plain.push([B(fx - 0.02, fx, 2.2, 2.55, dz - 1.75, dz - 1.4), '#1d1b19']);
        // walls the bike can't pass (the northern one has no mapped outline)
        if (q === SQ1) {
          for (let x = q[0]; x <= q[1]; x += 0.5) for (const z of [q[2], q[3]]) SOLIDS.add(x, z, 0.3);
          for (let z = q[2]; z <= q[3]; z += 0.5) for (const x of [q[0], q[1]]) SOLIDS.add(x, z, 0.3);
          for (let x = q[0] + 1; x < q[1]; x += 1.4) for (let z = q[2] + 1; z < q[3]; z += 1.4) SOLIDS.add(x, z, 0.8);
        }
      }
      // the power plant (light green): a concrete pad, the generator in its cream canopy, a dark hipped roof on six posts
      const [p0, p1, q0, q1] = PP, pm = (q0 + q1) / 2, eh = 2.7, ph = eh + 1.2;
      c.push([B(p0 - 0.2, p1 + 0.2, 0, 0.15, q0 - 0.2, q1 + 0.2), '#bdb8ad']);
      for (const x of [p0 + 0.1, (p0 + p1) / 2, p1 - 0.1]) for (const z of [q0 + 0.1, q1 - 0.1]) {
        c.push([B(x - 0.05, x + 0.05, 0.15, eh, z - 0.05, z + 0.05), '#26282a']);
        SOLIDS.add(x, z, 0.12);
      }
      for (const z of [q0 + 0.1, q1 - 0.1]) c.push([B(p0, p1, eh - 0.12, eh, z - 0.05, z + 0.05), '#26282a']);
      const P = (x: number, y: number, z: number): [number, number, number] => [X(x), y, Z(z)];
      const a0 = p0 - 0.35, a1 = p1 + 0.35, b0 = q0 - 0.35, b1 = q1 + 0.35, half = (b1 - b0) / 2;
      const r0 = P(a0 + half, ph, pm), r1 = P(a1 - half, ph, pm);
      c.push([tri2(P(a0, eh, b0), P(a1, eh, b0), r1), SHEET], [tri2(P(a0, eh, b0), r1, r0), SHEET]);
      c.push([tri2(P(a1, eh, b1), P(a0, eh, b1), r0), SHEET], [tri2(P(a1, eh, b1), r0, r1), SHEET]);
      c.push([tri2(P(a0, eh, b1), P(a0, eh, b0), r0), SHEET], [tri2(P(a1, eh, b0), P(a1, eh, b1), r1), SHEET]);
      const gx0 = (p0 + p1) / 2 - 1.15, gx1 = gx0 + 2.3, gz0 = pm - 0.55, gz1 = pm + 0.55;
      c.push([B(gx0 - 0.1, gx1 + 0.1, 0.15, 0.3, gz0 - 0.08, gz1 + 0.08), '#2d2f31']);
      c.push([B(gx0, gx1, 0.3, 1.75, gz0, gz1), '#e8e4d8'], [B(gx0 + 0.05, gx1 - 0.05, 1.75, 1.82, gz0 + 0.05, gz1 - 0.05), '#d6d1c4']);
      for (const z of [gz0 - 0.01, gz1 + 0.01]) for (let x = gx0 + 0.3; x < gx1 - 0.3; x += 0.55) k.plain.push([B(x, x + 0.35, 0.6, 1.4, z - 0.005, z + 0.005), '#5a5d60']);
      k.plain.push([B(gx1 - 0.01, gx1 + 0.01, 0.55, 1.5, gz0 + 0.15, gz1 - 0.15), '#4a4d50']);
      k.plain.push([new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8).translate(X(gx1 - 0.35), 2.05, Z(pm)), '#3a3a38']);
      for (let x = gx0; x <= gx1; x += 0.5) for (const z of [gz0, gz1]) SOLIDS.add(x, z, 0.3);
      // the big shade tree over the first one's roof (red mark): a thick trunk, a wide dark crown
      const [tx, tz] = TREE;
      SOLIDS.add(tx, tz, 0.55);
      c.push([new THREE.CylinderGeometry(0.4, 0.6, 6.0, 7).translate(X(tx), 3.0, Z(tz)), '#4e3d30']);
      for (const [dx, dz, ry] of [[-1.2, 0.4, 0.5], [1.4, -1.0, -0.4], [0.2, 1.6, 0.3]] as const) c.push([new THREE.CylinderGeometry(0.16, 0.26, 3.2, 5).rotateZ(ry).rotateX(dz * 0.2).translate(X(tx) + dx * 0.6, 6.5, Z(tz) + dz * 0.5), '#4e3d30']);
      for (const [dx, dy, dz, r, col] of [[0, 8.6, 0, 5.4, '#2f5a2a'], [-4.2, 7.6, 0.8, 3.8, '#36622e'], [3.4, 7.9, -1.5, 3.8, '#2a5226'], [0.8, 10.4, 0.6, 3.6, '#3a6a31'], [-1.5, 8.2, -3.2, 3.2, '#2f5a2a'], [1.2, 8.0, 3.4, 3.4, '#33602d']] as const) {
        c.push([new THREE.IcosahedronGeometry(r, 1).scale(1, 0.62, 1).translate(X(tx) + dx, dy, Z(tz) + dz), col]);
      }
      const m = new THREE.Mesh(merge(c), concrete(0.25));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

/** LECIAD and the small buildings, power plant and tree west of it */
export const liciadSite = createSite('liciad', [liciad, smallBlocks]);
