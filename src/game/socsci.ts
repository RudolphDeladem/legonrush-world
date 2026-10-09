// The N Block compound south of the K. Folson Building (the Departments of Political Science and Philosophy), from the
// owner's marked aerial (ten numbered views, registered to the N Block at 0.287 m/px) and the owner's street photos of
// each view (block engine: blocks.ts; the raised ground at the north-east corner: relief.ts).
//
// - N Block (view 6) on Ebenezer Laing Road: a tall hall in the middle, its gable to the road, a band of dark louvred
//   windows high under the eaves, white above dark grey walls; one-floor wings either side; a verandah on grey square
//   columns all along the front and round the wings; red-brown corrugated roofs. The east wing (view 9) is the NASCO
//   ICT Literacy Project, its verandah's columns flaring into a flat white frame.
// - The long range on the car park on the east (views 1 and 8): one floor, white over a dark grey base, red-brown
//   corrugated gable roof, its eaves on diagonal brackets on the west, metal lattice grilles on the windows and doors on
//   the west, louvred windows and air-conditioners on the east, a pitched rubble-stone bank along its east side.
// - The K. Folson Building (views 3 and 4; the board: DEPARTMENT OF POLITICAL SCIENCE, DEPARTMENT OF PHILOSOPHY): an L of
//   two storeys, white piers between dark grey panels holding windows of louvred glass in black frames, air-conditioners
//   in cages, red-brown corrugated roofs with white gables; glass-block panels at the west end of the north face, a black
//   water tank on a steel stand; its entrance near the north end of the east face, the board on two posts.
// - The raised ground at the north-east (view 2): the long range behind the court (one floor, white over a dark red base)
//   and the ground east of it stand 1.2 m up behind pitched banks of rubble stone; a stair between dark red cheek walls
//   climbs to the platform with the blue tent.
// - The paved court between them (view 7): concrete pavers, the big rain trees, the red hexagonal kiosk, the blue canopy
//   with benches.
// - West (view 5): the Department of Social Work, one floor, its verandah on posts with diagonal braces, a dark old roof,
//   its library; the School of Social Sciences, one floor, white, a bright red roof, its board on the porch.
// - North-west (view 10): the Information Studies blocks, one floor, white, dark roofs, louvred windows, air-conditioners.
import * as THREE from 'three';
import { box, merge, speckle, tri2, type Part } from './modelkit';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { concrete, stoneMesh } from './concrete';
import { garden } from './gardens';
import { SOLIDS } from './solids';
import { stairsOf } from './relief';
import { hipRoof } from './waccbip';

const WHITE = '#f1f0ec', GREY = '#55595c', GREY_L = '#8d9195', ROOF_RB = '#9a4630', ROOF_DK = '#4a4542', BARGE = '#5a2a22', DADO_R = '#7e2a24';
const open = { gw: 99, tri: false }, hip = { gw: 0, tri: false };

// ---------- facade pieces ----------
const grime = (g: CanvasRenderingContext2D, a = 0.12) => speckle(g, 0, 0, 256, 512, 500, [`rgba(120,116,106,${a})`, `rgba(140,136,126,${a * 0.8})`]);
/** a window of grey louvred glass in a black frame */
const louvres = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#141414'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  g.fillStyle = '#2b3034'; g.fillRect(x, y, w, h);
  for (let t = y + 3; t < y + h - 2; t += 9) { g.fillStyle = '#7d8a92'; g.fillRect(x + 2, t, w - 4, 5); g.fillStyle = '#b5c0c6'; g.fillRect(x + 2, t, w - 4, 1); }
  g.fillStyle = '#141414'; g.fillRect(x + w / 2 - 2, y, 4, h); g.fillRect(x, y + h / 2 - 2, w, 4);
};
/** a metal lattice grille over a dark window or door (the long range's west side, view 8) */
const lattice = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#3a3c3e'; g.fillRect(x, y, w, h);
  g.fillStyle = '#9a9c98';
  for (let t = x; t <= x + w; t += 12) g.fillRect(t, y, 3, h);
  for (let t = y; t <= y + h; t += 12) g.fillRect(x, t, w, 3);
  g.fillStyle = '#b8bab5'; g.fillRect(x - 3, y - 3, w + 6, 4); g.fillRect(x - 3, y + h - 1, w + 6, 4); g.fillRect(x - 3, y, 4, h); g.fillRect(x + w - 1, y, 4, h);
};
/** an air-conditioner on the wall */
const acUnit = (g: CanvasRenderingContext2D, x: number, y: number) => {
  g.fillStyle = '#e6e7e5'; g.fillRect(x, y, 34, 26); g.fillStyle = '#8e9294'; g.beginPath(); g.arc(x + 13, y + 13, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c9cbc9'; g.fillRect(x + 25, y + 4, 6, 18);
};
/** white over a dark grey base, a louvred window and an air-conditioner under it (the long range's east side, view 1) */
const RANGE_E: Style = {
  bay: 3.6, up: [], ground: [[78, 256 + 70, 100, 84]],
  draw: (g) => { render(g, WHITE); grime(g); louvres(g, 78, 256 + 70, 100, 84); g.fillStyle = GREY; g.fillRect(0, 512 - 70, 256, 70); acUnit(g, 112, 512 - 66); },
};
/** white over the grey base, a lattice grille over the window or door (the long range's west side, view 8) */
const RANGE_W: Style = {
  bay: 3.8, up: [], ground: [[56, 256 + 64, 144, 128]],
  draw: (g) => { render(g, WHITE); grime(g); g.fillStyle = GREY; g.fillRect(0, 512 - 70, 256, 70); lattice(g, 56, 256 + 64, 144, 140); },
};
/** a plain white gable end over the grey base, a small notice */
const END_GREY: Style = { bay: 4, up: [], ground: [], draw: (g) => { render(g, WHITE); grime(g); g.fillStyle = GREY; g.fillRect(0, 512 - 70, 256, 70); g.fillStyle = '#8f9396'; g.fillRect(150, 256 + 120, 26, 18); } };
/** the K. Folson Building: white piers either side, a dark grey panel between them holding the louvred window */
const KF_WALL: Style = {
  bay: 3.4, up: [[72, 36, 112, 136]], ground: [[72, 256 + 36, 112, 136]],
  draw: (g) => {
    render(g, WHITE); grime(g, 0.08);
    for (const y0 of [0, 256]) { g.fillStyle = '#5b5f62'; g.fillRect(52, y0, 152, 256); louvres(g, 72, y0 + 36, 112, 136); }
    g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(50, 0, 2, 512); g.fillRect(204, 0, 2, 512);
  },
};
/** its gable ends: white, a grey band between the floors */
const KF_END: Style = { bay: 4, up: [], ground: [], draw: (g) => { render(g, WHITE); grime(g, 0.08); g.fillStyle = '#5b5f62'; g.fillRect(0, 200, 256, 100); g.fillRect(0, 512 - 40, 256, 40); } };
/** the N Block: dark grey walls behind the verandah, black doors and windows with air-conditioners */
const NB_WALL: Style = {
  bay: 3.6, up: [], ground: [[30, 256 + 40, 70, 216], [140, 256 + 70, 90, 90]],
  draw: (g) => {
    render(g, '#5a5e61'); g.fillStyle = '#5a5e61'; g.fillRect(0, 0, 256, 512); speckle(g, 0, 0, 256, 512, 300, ['rgba(40,42,44,0.18)', 'rgba(80,84,86,0.15)']);
    g.fillStyle = '#1b1b1b'; g.fillRect(30, 256 + 40, 70, 216); g.fillStyle = '#2b2b2b'; g.fillRect(64, 256 + 40, 2, 216);
    g.fillStyle = '#111'; g.fillRect(140, 256 + 70, 90, 90); g.fillStyle = '#3e4246'; for (let x = 146; x < 230; x += 10) g.fillRect(x, 256 + 70, 3, 90);
    acUnit(g, 168, 256 + 170);
  },
};
/** the hall: dark grey below; above the verandah roof white, the band of dark louvred windows under the eaves */
const NB_HALL: Style = {
  bay: 3.6, up: [[10, 60, 236, 110]], ground: [[30, 256 + 40, 70, 216]],
  draw: (g) => {
    render(g, WHITE); grime(g, 0.1);
    g.fillStyle = '#151515'; g.fillRect(6, 56, 244, 118); g.fillStyle = '#2c3034'; g.fillRect(10, 60, 236, 110);
    g.fillStyle = '#151515'; for (let x = 10; x < 250; x += 39) g.fillRect(x, 60, 4, 110);
    for (let y = 66; y < 170; y += 10) { g.fillStyle = 'rgba(140,150,156,0.35)'; g.fillRect(10, y, 236, 2); }
    // the ground half again (render cleared it): the dark grey walls and doors
    g.fillStyle = '#5a5e61'; g.fillRect(0, 256, 256, 256);
    g.fillStyle = '#1b1b1b'; g.fillRect(30, 256 + 40, 70, 216); g.fillStyle = '#111'; g.fillRect(140, 256 + 70, 90, 90);
  },
};
/** white over a dark red base, black louvred windows, an air-conditioner (the long range behind the court, view 2) */
const PSY_WALL: Style = {
  bay: 3.6, up: [], ground: [[86, 256 + 76, 84, 84]],
  draw: (g) => { render(g, WHITE); grime(g); louvres(g, 86, 256 + 76, 84, 84); g.fillStyle = DADO_R; g.fillRect(0, 512 - 52, 256, 52); acUnit(g, 180, 256 + 40); },
};
/** white, glass windows in white frames (the School of Social Sciences, view 5) */
const SSS_WALL: Style = {
  bay: 3.4, up: [], ground: [[70, 256 + 70, 116, 96]],
  draw: (g) => {
    render(g, WHITE); grime(g, 0.08);
    g.fillStyle = '#e8e8e4'; g.fillRect(64, 256 + 64, 128, 108); g.fillStyle = '#56656f'; g.fillRect(70, 256 + 70, 116, 96);
    g.fillStyle = '#e8e8e4'; g.fillRect(126, 256 + 70, 4, 96); g.fillRect(70, 256 + 116, 116, 4);
    g.fillStyle = '#c9c4b6'; g.fillRect(0, 512 - 26, 256, 26);
  },
};
/** white, a black door and a window with a notice board (the Department of Social Work behind its verandah, view 5) */
const SW_WALL: Style = {
  bay: 3.8, up: [], ground: [[24, 256 + 50, 60, 206], [126, 256 + 70, 100, 100]],
  draw: (g) => {
    render(g, WHITE); grime(g, 0.14);
    g.fillStyle = '#161616'; g.fillRect(24, 256 + 50, 60, 206);
    g.fillStyle = '#1d1f21'; g.fillRect(126, 256 + 70, 100, 100); g.fillStyle = '#c7b48a'; g.fillRect(140, 256 + 84, 72, 70);
    g.fillStyle = '#9a9c98'; g.fillRect(0, 512 - 22, 256, 22);
  },
};
/** white, louvred windows, an air-conditioner (the Information Studies blocks, view 10) */
const IS_WALL: Style = {
  bay: 3.6, up: [], ground: [[80, 256 + 60, 96, 90]],
  draw: (g) => { render(g, WHITE); grime(g, 0.16); louvres(g, 80, 256 + 60, 96, 90); acUnit(g, 110, 256 + 166); g.fillStyle = '#b3b0a6'; g.fillRect(0, 512 - 24, 256, 24); },
};

// ---------- helpers ----------
type R4 = [number, number, number, number];
const frame = (O: [number, number]) => ({
  X: (x: number) => x - O[0], Z: (z: number) => z - O[1],
  B: (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(x0 - O[0], x1 - O[0], y0, y1, z0 - O[1], z1 - O[1]),
  M: (x: number, z: number): [number, number] => [x - O[0], z - O[1]],
});
/** a corrugated gable roof over r (world) at eave e, ridge `along`, overhanging ov, its gable ends white triangles */
function gable(k: Kit, O: [number, number], r: R4, e: number, pitch: number, along: 'x' | 'z', ov: number, col: string, parts: Part[], wall = WHITE) {
  const { M, X, Z } = frame(O);
  k.roof.c = new THREE.Color(col);
  const top = hipRoof(k, M, r[0] - ov, r[1] + ov, r[2] - ov, r[3] + ov, e, pitch, along, [open, open], parts, BARGE);
  const ap = top - ov * pitch;
  if (along === 'x') for (const x of [r[0], r[1]]) parts.push([tri2([X(x), e - 0.02, Z(r[2])], [X(x), e - 0.02, Z(r[3])], [X(x), ap, Z((r[2] + r[3]) / 2)]), wall]);
  else for (const z of [r[2], r[3]]) parts.push([tri2([X(r[0]), e - 0.02, Z(z)], [X(r[1]), e - 0.02, Z(z)], [X((r[0] + r[1]) / 2), ap, Z(z)]), wall]);
  return top;
}
const finish = (k: Kit, c: Part[], st: Part[] = [], strength = 0.35) => {
  stoneMesh(k, st);
  if (!c.length) return;
  const m = new THREE.Mesh(merge(c), concrete(strength));
  m.castShadow = true; m.receiveShadow = true;
  k.meshes.push(m);
};
/** solid circles along a wall line (world) so the free-ridden bike stops at it */
const solidLine = (ax: number, az: number, bx: number, bz: number, r = 0.3) => {
  const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.4));
  for (let i = 0; i <= n; i++) SOLIDS.add(ax + ((bx - ax) * i) / n, az + ((bz - az) * i) / n, r);
};

// ---------- N Block (views 6 and 9) ----------
const NBW: R4 = [-33.6, -7.6, -330.0, -311.0], NBH: R4 = [-7.6, 20.5, -335.0, -311.0], NBE: R4 = [20.5, 47.5, -330.0, -311.0];
const VER = 2.4, NST = 3.4;
const nBlock: Spec = (() => {
  const O: [number, number] = [7, -322];
  const { X, Z, B, M } = frame(O);
  const wall = (r: R4, s: number, n: number, w: number, e: number): R4 => [r[0] + w, r[1] - e, r[2] + n, r[3] - s];
  const WW = wall(NBW, VER, VER, VER, 0), HH = wall(NBH, VER, 0, 0, 0), EE = wall(NBE, VER, VER, 0, VER);
  const R = (r: R4, floors: number, faces: Style) => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors, roof: 'none' as const, faces: { x0: faces, x1: faces, z0: faces, z1: faces } });
  return {
    name: 'N Block', axis: [1, 0], origin: O, storey: NST, style: NB_WALL, roofColor: ROOF_RB, fascia: BARGE, pitch: 0.3, plinth: '#8f9396',
    replaces: [[-20, -320], [31, -321], [6.5, -322]],
    blocks: [R(WW, 1, NB_WALL), R(HH, 2, NB_HALL), R(EE, 1, NB_WALL)],
    keep: [[X(-34), X(48), Z(-336), Z(-302)]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      const e1 = k.wallTop(1), e2 = k.wallTop(2);
      // the wings' roofs: low red-brown hips over the verandahs; the hall's gable to the road, its ridge north-south
      k.roof.c = new THREE.Color(ROOF_RB);
      hipRoof(k, M, NBW[0] - 0.5, NBW[1], NBW[2] - 0.5, NBW[3] + 0.5, e1 + 0.2, 0.22, 'x', [hip, open], c, BARGE);
      hipRoof(k, M, NBE[0], NBE[1] + 0.5, NBE[2] - 0.5, NBE[3] + 0.5, e1 + 0.2, 0.22, 'x', [{ gw: 1.2, tri: true }, hip], c, BARGE);
      gable(k, O, HH, e2, 0.3, 'z', 0.8, ROOF_RB, c);
      // the verandah: grey square columns along the front of all three, round the wings; a flat white beam on them
      const colAt = (x: number, z: number, flare: boolean) => {
        c.push([B(x - 0.2, x + 0.2, 0, e1 - 0.1, z - 0.2, z + 0.2), GREY_L], [B(x - 0.22, x + 0.22, 0, 0.5, z - 0.22, z + 0.22), GREY]);
        if (flare) c.push([B(x - 0.35, x + 0.35, e1 - 0.45, e1 - 0.1, z - 0.35, z + 0.35), '#e8e8e4']);
        SOLIDS.add(x, z, 0.3);
      };
      const zf = NBW[3] - 0.35;
      for (let x = NBW[0] + 0.4; x <= NBE[1] - 0.3; x += 3.6) if (x < 4.0 || x > 9.0) colAt(x, zf, x > NBE[0]);
      for (const r of [NBW, NBE]) for (let z = r[2] + 0.4; z < zf - 1; z += 3.6) colAt(r === NBW ? r[0] + 0.4 : r[1] - 0.4, z, r === NBE);
      for (let x = NBW[0] + 0.4; x <= NBW[1]; x += 3.6) colAt(x, NBW[2] + 0.4, false);
      for (let x = NBE[0] + 1.5; x <= NBE[1] - 0.3; x += 3.6) colAt(x, NBE[2] + 0.4, true);
      c.push([B(NBW[0], NBE[1], e1 - 0.1, e1 + 0.2, zf - 0.3, zf + 0.3), '#e8e8e4']);
      for (const r of [NBW, NBE]) { const x = r === NBW ? r[0] + 0.4 : r[1] - 0.4; c.push([B(x - 0.3, x + 0.3, e1 - 0.1, e1 + 0.2, r[2], r[3]), '#e8e8e4'], [B(r[0], r[1], e1 - 0.1, e1 + 0.2, r[2] + 0.1, r[2] + 0.7), '#e8e8e4']); }
      // the verandah floor, a step up; its ceiling
      c.push([B(NBW[0], NBE[1], 0, 0.18, NBH[3] - VER, NBH[3]), '#a7a59e']);
      for (const r of [NBW, NBE]) c.push([B(r[0], r[1], 0, 0.18, r[2], r[3]), '#a7a59e']);
      // the hall's entrance (view 6): glass double doors in dark frames under the verandah, the paved walk from the road
      const dx = (NBH[0] + NBH[1]) / 2, dz = HH[3];
      k.plain.push([B(dx - 1.3, dx + 1.3, 0.18, 2.7, dz, dz + 0.05), '#2a2420']);
      k.glass.push(B(dx - 1.2, dx - 0.05, 0.25, 2.6, dz + 0.05, dz + 0.07), B(dx + 0.05, dx + 1.2, 0.25, 2.6, dz + 0.05, dz + 0.07));
      // the board of the ICT literacy project on the east wing's frame (view 9)
      k.plain.push([B(NBE[1] - 0.35, NBE[1] - 0.3, e1 - 0.5, e1 + 0.5, -318.5, -313.5), '#f2f2ee']);
      k.signs.push({ text: 'NASCO FEEDING MINDS - ICT LITERACY PROJECT', x: X(NBE[1] - 0.29), y: e1, z: Z(-316), ry: Math.PI / 2, w: 4.6, colors: ['#f2f2ee', '#1d2a3a'] });
      // before it (view 6): the paved walk to the hall's doors, hedges either side, two conifers, a yellow-flowered bush
      k.plain.push([B(dx - 2.2, dx + 2.2, 0.02, 0.06, -308.5 + 2.6, NBH[3]), '#9a8c7a']);
      for (let z = -306; z < NBH[3]; z += 0.6) k.plain.push([B(dx - 2.2, dx + 2.2, 0.06, 0.065, z, z + 0.04), '#7d705f']);
      const g = garden([-40, 55, -340, -300]); g.reseed(101);
      g.hedge(k, X(-7.0), Z(-309.0), X(dx - 2.8), Z(-309.0)); g.hedge(k, X(dx + 2.8), Z(-309.0), X(19.8), Z(-309.0));
      for (const x of [dx - 3.6, dx + 3.8]) { k.plain.push([new THREE.ConeGeometry(0.9, 4.6, 9).translate(X(x), 2.6, Z(-308.2)), '#2c4f28'], [new THREE.CylinderGeometry(0.1, 0.12, 0.6, 6).translate(X(x), 0.3, Z(-308.2)), '#4e3d30']); SOLIDS.add(x, -308.2, 0.4); }
      for (const [x, y, z] of [[dx - 5.2, 0.9, -307.6], [dx - 5.6, 1.5, -307.9], [dx - 4.8, 1.3, -307.3]]) {
        k.plain.push([new THREE.IcosahedronGeometry(0.6, 0).translate(X(x), y, Z(z)), '#3f6f2c']);
        for (let i = 0; i < 5; i++) k.plain.push([new THREE.IcosahedronGeometry(0.12, 0).translate(X(x + Math.cos(i) * 0.5), y + Math.sin(i * 2) * 0.3, Z(z + Math.sin(i) * 0.5)), '#f2d23a']);
      }
      finish(k, c);
    },
  };
})();

// ---------- the long range on the east car park (views 1 and 8) ----------
const PR: R4 = [72.5, 83.7, -368.0, -311.0];
const range: Spec = (() => {
  const O: [number, number] = [78.1, -339.5];
  const { X, Z, B } = frame(O);
  return {
    name: 'Political Science Department', axis: [1, 0], origin: O, storey: 3.5, style: RANGE_E, roofColor: ROOF_RB, fascia: BARGE, pitch: 0.3, plinth: GREY,
    replaces: [O],
    blocks: [{ x0: X(PR[0]), x1: X(PR[1]), z0: Z(PR[2]), z1: Z(PR[3]), floors: 1, roof: 'none', faces: { x0: RANGE_W, x1: RANGE_E, z0: END_GREY, z1: END_GREY } }],
    keep: [[X(PR[1]), X(PR[1] + 3.2), Z(-368), Z(-345)], [X(73), X(85), Z(-311), Z(-306.5)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      const e = k.wallTop(1);
      // the corrugated gable roof, its eaves standing well out on the west on diagonal brackets (view 8)
      gable(k, O, PR, e, 0.3, 'z', 1.0, ROOF_RB, c);
      k.roof.c = new THREE.Color(ROOF_RB);
      k.roof.quad([X(PR[0] - 1.0), e, Z(PR[3] + 1.0)], [X(PR[0] - 1.0), e, Z(PR[2] - 1.0)], [X(PR[0] - 2.2), e - 0.35, Z(PR[2] - 1.0)], [X(PR[0] - 2.2), e - 0.35, Z(PR[3] + 1.0)]);
      c.push([B(PR[0] - 2.25, PR[0] - 2.1, e - 0.6, e - 0.3, PR[2] - 1.0, PR[3] + 1.0), BARGE]);
      for (let z = PR[2] + 1.6; z < PR[3]; z += 3.8) {
        const br = new THREE.BoxGeometry(0.1, 0.1, 2.4).rotateX(0.75).rotateY(Math.PI / 2).translate(X(PR[0] - 1.0), e - 0.75, Z(z));
        c.push([br, '#2f2b28'], [B(PR[0] - 0.08, PR[0], e - 1.6, e - 0.2, z - 0.06, z + 0.06), '#2f2b28']);
      }
      c.push([B(PR[0] - 1.8, PR[0], 0, 0.12, PR[2], PR[3]), '#bdb9b0']);
      // the pitched bank of rubble stone along the north part of its east side (view 1), sloping down to the car park
      for (let z = -368; z < -345; z += 1) {
        const w = 2.8, h = 0.85, len = Math.hypot(w, h);
        st.push([new THREE.BoxGeometry(len, 0.12, 1.02).rotateZ(-Math.atan2(h, w)).translate(X(PR[1] + w / 2), h / 2, Z(z + 0.5)), '#ffffff']);
      }
      solidLine(PR[1] + 1.4, -368, PR[1] + 1.4, -345, 0.9);
      // the bed of agaves and shrubs before its south end, a white kerb (view 8)
      c.push([B(73.5, 84.2, 0, 0.18, -308.6, -306.6), '#efeee8']);
      for (let x = 74.5; x < 84; x += 1.3) {
        for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; k.plain.push([new THREE.ConeGeometry(0.07, 0.9, 4).rotateZ(Math.cos(a) * 0.6).rotateX(Math.sin(a) * 0.6).translate(X(x), 0.6, Z(-307.6)), '#4f7a3a']); }
      }
      finish(k, c, st);
    },
  };
})();

// ---------- the K. Folson Building (views 3 and 4) ----------
const KB: R4 = [14.9, 69.7, -414.0, -403.0], KW: R4 = [58.8, 69.5, -403.0, -379.1];
const kFolson: Spec = (() => {
  const O: [number, number] = [45, -400];
  const { X, Z, B, M } = frame(O);
  return {
    name: 'K Folson Building', axis: [1, 0], origin: O, storey: 3.4, style: KF_WALL, roofColor: ROOF_RB, fascia: BARGE, pitch: 0.3, plinth: '#5b5f62',
    blocks: [
      { x0: X(KB[0]), x1: X(KB[1]), z0: Z(KB[2]), z1: Z(KB[3]), floors: 2, roof: 'none', faces: { x0: KF_END } },
      { x0: X(KW[0]), x1: X(KW[1]), z0: Z(KW[2]), z1: Z(KW[3]), floors: 2, roof: 'none', faces: { z1: KF_END } },
    ],
    keep: [[X(69.5), X(76), Z(-413), Z(-404)]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      const e = k.wallTop(2);
      // red-brown corrugated roofs: the north range's ridge east-west, the east wing's north-south, white gables
      gable(k, O, KB, e, 0.3, 'x', 0.7, ROOF_RB, c);
      k.roof.c = new THREE.Color(ROOF_RB);
      const top = hipRoof(k, M, KW[0] - 0.7, KW[1] + 0.7, (KB[2] + KB[3]) / 2, KW[3] + 0.7, e, 0.3, 'z', [open, open], c, BARGE);
      c.push([tri2([X(KW[0]), e - 0.02, Z(KW[3])], [X(KW[1]), e - 0.02, Z(KW[3])], [X((KW[0] + KW[1]) / 2), top - 0.21, Z(KW[3])]), WHITE]);
      // glass-block panels at the west end of the north face, both floors (view 4)
      for (const y of [1.0, 4.4]) {
        k.plain.push([B(16.0, 22.5, y, y + 2.0, KB[2] - 0.04, KB[2]), '#9fb4c0']);
        for (let x = 16.0; x <= 22.5; x += 0.3) k.plain.push([B(x - 0.015, x + 0.015, y, y + 2.0, KB[2] - 0.06, KB[2] - 0.04), '#d8e2e6']);
        for (let yy = y; yy <= y + 2.0; yy += 0.3) k.plain.push([B(16.0, 22.5, yy - 0.015, yy + 0.015, KB[2] - 0.06, KB[2] - 0.04), '#d8e2e6']);
      }
      // the black water tank on its steel stand before the north face, a ladder up it, a black tank on the ground
      const tx = 26.0, tz = KB[2] - 1.6, th = 6.6;
      for (const [dx, dz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) c.push([B(tx + dx - 0.04, tx + dx + 0.04, 0, th, tz + dz - 0.04, tz + dz + 0.04), '#5a3b2a']);
      for (let y = 1.5; y < th; y += 1.6) for (const dz of [-0.8, 0.8]) c.push([B(tx - 0.8, tx + 0.8, y - 0.03, y + 0.03, tz + dz - 0.03, tz + dz + 0.03), '#5a3b2a']);
      c.push([B(tx - 0.95, tx + 0.95, th, th + 0.08, tz - 0.95, tz + 0.95), '#5a3b2a']);
      k.plain.push([new THREE.CylinderGeometry(0.75, 0.75, 1.6, 16).translate(X(tx), th + 0.85, Z(tz)), '#1c1c1c']);
      for (let y = 0.3; y < th; y += 0.35) c.push([B(tx - 0.95, tx - 0.92, y - 0.02, y + 0.02, tz - 0.25, tz + 0.25), '#5a3b2a']);
      k.plain.push([new THREE.CylinderGeometry(0.6, 0.6, 1.3, 14).translate(X(19.5), 0.65, Z(KB[2] - 1.2)), '#1c1c1c']);
      SOLIDS.add(tx, tz, 1.2); SOLIDS.add(19.5, KB[2] - 1.2, 0.7);
      // air-conditioners in steel cages on both faces
      for (const x of [29, 36, 44, 51, 57, 63]) for (const y of [3.0, 6.4]) if ((x * 7 + y) % 3 < 2) {
        c.push([B(x - 0.45, x + 0.45, y, y + 0.6, KB[2] - 0.4, KB[2]), '#e6e7e5']);
        for (const xx of [x - 0.48, x + 0.48]) c.push([B(xx - 0.02, xx + 0.02, y - 0.05, y + 0.7, KB[2] - 0.45, KB[2]), '#5a3b2a']);
      }
      for (const z of [-384, -390, -396]) for (const y of [3.0, 6.4]) c.push([B(KW[1], KW[1] + 0.4, y, y + 0.6, z - 0.45, z + 0.45), '#e6e7e5']);
      // the entrance near the north end of the east face: a recess, a small canopy over it; the board on two posts
      const ez = -409.5;
      k.plain.push([B(KB[1] - 0.05, KB[1], 0.4, 2.9, ez - 1.4, ez + 1.4), '#2c2a28'], [B(KB[1] - 0.06, KB[1] - 0.05, 0.45, 2.85, ez - 0.02, ez + 0.02), '#555']);
      k.roof.c = new THREE.Color('#7b7f82');
      k.roof.quad([X(KB[1] + 1.4), 3.2, Z(ez - 1.8)], [X(KB[1] + 1.4), 3.2, Z(ez + 1.8)], [X(KB[1]), 3.6, Z(ez + 1.8)], [X(KB[1]), 3.6, Z(ez - 1.8)]);
      c.push([B(KB[1], KB[1] + 1.6, 0, 0.18, ez - 1.6, ez + 1.6), '#cfcac0']);
      const bx = 73.5, bz = -411.5;
      for (const dz of [-1.2, 1.2]) c.push([B(bx - 0.05, bx + 0.05, 0, 2.6, bz + dz - 0.05, bz + dz + 0.05), '#e8e8e4']);
      k.plain.push([B(bx - 0.04, bx + 0.04, 1.3, 2.5, bz - 1.25, bz + 1.25), '#f4f4f0'], [B(bx + 0.04, bx + 0.06, 2.0, 2.35, bz - 1.1, bz - 0.75), '#1d3f7a']);
      k.signs.push({ text: 'DEPARTMENT OF POLITICAL SCIENCE', x: X(bx) + 0.07, y: 2.2, z: Z(bz + 0.2), ry: Math.PI / 2, w: 1.7, colors: ['#f4f4f0', '#1d2a3a'] });
      k.signs.push({ text: 'DEPARTMENT OF PHILOSOPHY', x: X(bx) + 0.07, y: 1.75, z: Z(bz + 0.2), ry: Math.PI / 2, w: 1.7, colors: ['#f4f4f0', '#1d2a3a'] });
      finish(k, c);
    },
  };
})();

// ---------- the raised ground at the north-east (view 2): the range behind the court, the banks, the stair, the tent
const PSY: R4 = [17.3, 63.6, -369.9, -357.9];
const TER: R4 = [16.5, 70.2, -376.8, -357.5];
const psy: Spec = (() => {
  const O: [number, number] = [40.5, -364];
  const { X, Z, B } = frame(O);
  return {
    name: 'Psychology Department', axis: [1, 0], origin: O, storey: 3.4, style: PSY_WALL, roofColor: '#8e3a30', fascia: BARGE, pitch: 0.3, plinth: DADO_R,
    replaces: [O],
    blocks: [{ x0: X(PSY[0]), x1: X(PSY[1]), z0: Z(PSY[2]), z1: Z(PSY[3]), floors: 1, roof: 'none' }],
    keep: [[X(TER[0]), X(TER[1] + 2), Z(TER[2]), Z(TER[3] + 0.4)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      const e = k.wallTop(1), lift = k.ground(0, 0);
      gable(k, O, PSY, e, 0.3, 'x', 0.8, '#8e3a30', c);
      // the rubble-stone face of the raised ground along the court (south) and toward the K. Folson Building (north)
      st.push([B(TER[0], TER[1], -lift - 0.1, 0.05, TER[3], TER[3] + 0.35), '#ffffff'], [B(TER[0], TER[1], -lift - 0.1, 0.05, TER[2] - 0.35, TER[2]), '#ffffff']);
      // the pitched banks of rubble stone down to the lane on the east (view 2), leaving the stair
      const s = stairsOf().find((q) => !q.alongZ && q.x1 === 70.1)!;
      for (let z = TER[2]; z < TER[3]; z += 0.8) {
        if (z + 0.8 > s.z0 - 0.3 && z < s.z1 + 0.3) continue;
        const w = 2.0, len = Math.hypot(w, lift);
        st.push([new THREE.BoxGeometry(len, 0.14, 0.82).rotateZ(-Math.atan2(lift, w)).translate(X(TER[1] + w / 2), -lift / 2, Z(z + 0.4)), '#ffffff']);
      }
      // the stair between dark red cheek walls (relief.ts), concrete treads
      for (let u = s.x1; u < s.x0 - 1e-3; u += 0.34) {
        const y = s.at(Math.min(s.x0 - 0.01, u + 0.17)) - lift;
        c.push([B(u, Math.min(s.x0, u + 0.35), -lift, y, s.z0, s.z1), '#bdb9b0']);
      }
      for (const z of [s.z0 - 0.3, s.z1]) {
        const len = Math.hypot(s.x0 - s.x1, lift);
        c.push([new THREE.BoxGeometry(len, 0.9, 0.3).rotateZ(-Math.atan2(lift, s.x0 - s.x1)).translate(X((s.x0 + s.x1) / 2), -lift / 2 + 0.45, Z(z + 0.15)), '#8a2e28']);
        c.push([new THREE.BoxGeometry(len, 0.08, 0.34).rotateZ(-Math.atan2(lift, s.x0 - s.x1)).translate(X((s.x0 + s.x1) / 2), -lift / 2 + 0.92, Z(z + 0.15)), '#2a2a2a']);
        solidLine(s.x1, z + 0.15, s.x0, z + 0.15, 0.2);
      }
      // the blue tent on the platform: a blue sheet roof on white posts, dark drapes at the back, a table
      const [t0, t1, u0, u1] = [61.5, 68.5, -376.0, -371.5];
      for (const [x, z] of [[t0, u0], [t1, u0], [t0, u1], [t1, u1]]) { c.push([B(x - 0.05, x + 0.05, 0, 2.5, z - 0.05, z + 0.05), '#e8e8e4']); SOLIDS.add(x, z, 0.15); }
      k.roof.c = new THREE.Color('#2a5ab8');
      k.roof.quad([X(t0 - 0.3), 2.5, Z(u1 + 0.3)], [X(t1 + 0.3), 2.5, Z(u1 + 0.3)], [X(t1 + 0.3), 3.1, Z((u0 + u1) / 2)], [X(t0 - 0.3), 3.1, Z((u0 + u1) / 2)]);
      k.roof.quad([X(t1 + 0.3), 2.5, Z(u0 - 0.3)], [X(t0 - 0.3), 2.5, Z(u0 - 0.3)], [X(t0 - 0.3), 3.1, Z((u0 + u1) / 2)], [X(t1 + 0.3), 3.1, Z((u0 + u1) / 2)]);
      k.plain.push([B(t0, t1, 0.1, 2.4, u0, u0 + 0.04), '#3a3433'], [B(t0 + 1, t0 + 3.2, 0.75, 0.8, u0 + 0.6, u0 + 1.4), '#6b5444']);
      for (let x = t0 + 0.4; x < t1; x += 1.5) c.push([B(x - 0.03, x + 0.03, 0, 0.8, u1 - 0.03, u1 + 0.03), '#6b5444']);
      finish(k, c, st);
    },
  };
})();

// ---------- the court (view 7), the buildings west and north-west (views 5 and 10), the trees ----------
interface Plain { name: string; r: R4; style: Style; roof: string; pitch: number; along: 'x' | 'z'; st?: number; replaces?: [number, number][] }
const PLAIN: Plain[] = [
  { name: 'School of Social Science', r: [-40.3, -5.3, -367.8, -357.7], style: SSS_WALL, roof: '#c43b2e', pitch: 0.3, along: 'x' },
  { name: 'Social Work Department', r: [-60.3, -52.0, -387.7, -311.9], style: SW_WALL, roof: ROOF_DK, pitch: 0.28, along: 'z' },
  { name: 'Information Studies Labs', r: [-57.1, -10.5, -401.0, -391.5], style: IS_WALL, roof: '#3e3b38', pitch: 0.3, along: 'x' },
  { name: 'Information Studies Department', r: [-17.6, 29.0, -388.2, -377.4], style: IS_WALL, roof: '#46403b', pitch: 0.3, along: 'x' },
  { name: 'building north of the N Block', r: [-3.2, 16.1, -349.7, -339.0], style: IS_WALL, roof: '#4a443f', pitch: 0.3, along: 'x', replaces: [[6.4, -344.3]] },
];
const plainSpec = (p: Plain): Spec => {
  const O: [number, number] = [(p.r[0] + p.r[1]) / 2, (p.r[2] + p.r[3]) / 2];
  const { X, Z, B } = frame(O);
  return {
    name: p.name, axis: [1, 0], origin: O, storey: p.st ?? 3.4, style: p.style, roofColor: p.roof, fascia: BARGE, pitch: p.pitch, plinth: '#a9a59c',
    replaces: p.replaces ?? [O],
    blocks: [{ x0: X(p.r[0]), x1: X(p.r[1]), z0: Z(p.r[2]), z1: Z(p.r[3]), floors: 1, roof: 'none' }],
    keep: p.name.startsWith('Social Work') ? [[X(-52), X(-49), Z(-388), Z(-312)]] : [],
    extras: (k: Kit) => {
      const c: Part[] = [];
      const e = k.wallTop(1);
      gable(k, O, p.r, e, p.pitch, p.along, 0.8, p.roof, c);
      if (p.name.startsWith('Social Work')) {
        // the verandah along its east side (view 5): its roof carried on, posts with diagonal braces, a raised floor;
        // the library's board on the fascia
        const x1 = p.r[1], vx = -49.2;
        k.roof.c = new THREE.Color(ROOF_DK);
        k.roof.quad([X(x1 + 0.8), e, Z(p.r[3] + 0.8)], [X(x1 + 0.8), e, Z(p.r[2] - 0.8)], [X(vx + 0.5), e - 0.5, Z(p.r[2] - 0.8)], [X(vx + 0.5), e - 0.5, Z(p.r[3] + 0.8)]);
        c.push([B(vx + 0.4, vx + 0.55, e - 0.8, e - 0.45, p.r[2] - 0.8, p.r[3] + 0.8), '#232323']);
        for (let z = p.r[2] + 1; z < p.r[3]; z += 3.8) {
          c.push([B(vx - 0.08, vx + 0.08, 0, e - 0.6, z - 0.08, z + 0.08), '#232323'], [new THREE.BoxGeometry(0.08, 0.08, 1.7).rotateX(0.0).rotateZ(0).translate(0, 0, 0).rotateY(Math.PI / 2).rotateZ(-0.6).translate(X(vx - 1.2), e - 1.1, Z(z)), '#232323']);
          SOLIDS.add(vx, z, 0.2);
        }
        c.push([B(x1, vx + 0.3, 0, 0.2, p.r[2], p.r[3]), '#b8b5ad']);
        k.plain.push([B(vx + 0.56, vx + 0.6, e - 1.2, e - 0.7, -323.5, -320.5), '#f4f4f0']);
        k.signs.push({ text: 'LIBRARY', x: X(vx + 0.61), y: e - 0.95, z: Z(-322), ry: Math.PI / 2, w: 2.4, colors: ['#f4f4f0', '#1d3f7a'] });
      }
      if (p.name === 'School of Social Science') {
        // the porch at its west end (view 5): a small gabled canopy on two posts, its board UG SSS SCHOOL OF SOCIAL
        // SCIENCES; hedges and a lawn before it
        const x0 = p.r[0], zm = (p.r[2] + p.r[3]) / 2;
        c.push([B(x0 - 2.2, x0, 2.9, 3.15, zm - 2.0, zm + 2.0), WHITE]);
        for (const z of [zm - 1.8, zm + 1.8]) { c.push([B(x0 - 2.1, x0 - 1.8, 0, 2.9, z - 0.15, z + 0.15), WHITE]); SOLIDS.add(x0 - 1.95, z, 0.25); }
        k.plain.push([B(x0, x0 + 0.04, 0.3, 2.6, zm - 0.9, zm + 0.9), '#2a2622']);
        k.plain.push([B(x0 - 2.25, x0 - 2.2, 3.15, 3.75, zm - 1.7, zm + 1.7), '#f4f4f0']);
        k.signs.push({ text: 'UG SSS  SCHOOL OF SOCIAL SCIENCES', x: X(x0 - 2.26), y: 3.45, z: Z(zm), ry: -Math.PI / 2, w: 3.2, colors: ['#f4f4f0', '#1d3f7a'] });
        const g = garden([x0 - 8, x0 + 10, p.r[2] - 6, p.r[3] + 6]); g.reseed(103);
        g.hedge(k, X(x0 - 3.4), Z(p.r[3] + 1.2), X(x0 - 3.4), Z(zm + 2.4)); g.hedge(k, X(x0 - 3.4), Z(zm - 2.4), X(x0 - 3.4), Z(p.r[2] - 0.5));
      }
      finish(k, c);
    },
  };
};

const court: Spec = (() => {
  const O: [number, number] = [20, -350];
  const { X, Z, B } = frame(O);
  return {
    name: 'N Block court', axis: [1, 0], origin: O, storey: 3, style: IS_WALL, roofColor: ROOF_RB, fascia: BARGE, pitch: 0.3,
    blocks: [],
    // the court, and the car parks kept nearly empty as the owner's photos show them (a few cars where they stand)
    keep: [[X(17), X(71), Z(-356.5), Z(-335.5)],
      [X(47), X(66), Z(-331), Z(-302)], [X(66), X(73), Z(-318), Z(-302)],
      [X(84), X(102), Z(-371), Z(-302)],
      [X(69), X(93), Z(-413), Z(-386)],
      [X(-49), X(-34), Z(-332), Z(-322)], [X(-49), X(-34), Z(-315), Z(-302)]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      // the court of concrete pavers between the N Block and the range behind it (view 7)
      k.plain.push([B(17.0, 71.8, 0.02, 0.06, -357.0, -330.6), '#a29c90']);
      for (let x = 17.0; x < 71.8; x += 0.9) k.plain.push([B(x, x + 0.035, 0.06, 0.065, -357.0, -330.6), '#857f74']);
      for (let z = -357.0; z < -330.6; z += 0.9) k.plain.push([B(17.0, 71.8, 0.06, 0.065, z, z + 0.035), '#857f74']);
      // the red hexagonal kiosk on posts, benches round it
      const kx = 30, kz = -347;
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; c.push([B(kx + Math.cos(a) * 2.2 - 0.07, kx + Math.cos(a) * 2.2 + 0.07, 0, 2.5, kz + Math.sin(a) * 2.2 - 0.07, kz + Math.sin(a) * 2.2 + 0.07), '#4a3a32']); SOLIDS.add(kx + Math.cos(a) * 2.2, kz + Math.sin(a) * 2.2, 0.15); }
      k.plain.push([new THREE.ConeGeometry(3.1, 1.6, 6).translate(X(kx), 3.3, Z(kz)), '#a8302a'], [new THREE.CylinderGeometry(3.1, 3.1, 0.12, 6).translate(X(kx), 2.5, Z(kz)), '#8a2622']);
      for (let i = 0; i < 6; i++) { const a = ((i + 0.5) / 6) * Math.PI * 2; c.push([new THREE.BoxGeometry(1.8, 0.06, 0.35).rotateY(-a).translate(X(kx + Math.cos(a) * 1.6), 0.45, Z(kz + Math.sin(a) * 1.6)), '#6b5444']); }
      // the blue canopy with its benches (PUSSY EXECUTIVES on its valance)
      const [a0, a1, b0, b1] = [48.5, 55.5, -345.5, -340.5];
      for (const [x, z] of [[a0, b0], [a1, b0], [a0, b1], [a1, b1]]) { c.push([B(x - 0.05, x + 0.05, 0, 2.6, z - 0.05, z + 0.05), '#d9dcdf']); SOLIDS.add(x, z, 0.15); }
      k.roof.c = new THREE.Color('#2a4f9a');
      k.roof.quad([X(a0 - 0.4), 2.6, Z(b1 + 0.4)], [X(a1 + 0.4), 2.6, Z(b1 + 0.4)], [X(a1 + 0.4), 3.4, Z((b0 + b1) / 2)], [X(a0 - 0.4), 3.4, Z((b0 + b1) / 2)]);
      k.roof.quad([X(a1 + 0.4), 2.6, Z(b0 - 0.4)], [X(a0 - 0.4), 2.6, Z(b0 - 0.4)], [X(a0 - 0.4), 3.4, Z((b0 + b1) / 2)], [X(a1 + 0.4), 3.4, Z((b0 + b1) / 2)]);
      k.plain.push([B(a0 - 0.4, a1 + 0.4, 2.3, 2.6, b1 + 0.38, b1 + 0.42), '#1d2f5a']);
      k.signs.push({ text: 'PUSSY EXECUTIVES', x: X((a0 + a1) / 2), y: 2.45, z: Z(b1 + 0.43), ry: 0, w: 3.2, colors: ['#1d2f5a', '#f4f4f0'] });
      for (const z of [b0 + 1.2, b1 - 1.2]) for (const x of [a0 + 1.4, a1 - 1.4]) c.push([B(x - 1.0, x + 1.0, 0.45, 0.5, z - 0.25, z + 0.25), '#2a4f9a'], [B(x - 0.95, x + 0.95, 0, 0.45, z - 0.2, z - 0.15), '#2a4f9a']);
      // the trees (the aerial): the big rain trees over the court's east, a row along the north, the groups between the
      // buildings on the west and north
      const g = garden([-70, 100, -432, -300]); g.reseed(107);
      for (const [x, z, s] of [[52, -352, 2.8], [63.5, -343.5, 3.3], [44.5, -338.5, 2.2], [40, -379.5, 2.6], [49, -382.5, 2.4], [-43, -380, 3.0], [-32, -375.5, 2.6], [-25, -386.5, 2.4], [-30.5, -355, 1.6], [9.5, -353.5, 1.6], [-45, -343, 2.0], [-38, -332, 1.6]] as [number, number, number][]) g.tree(k, X(x), Z(z), s);
      for (let x = -40; x <= 60; x += 12.5) g.tree(k, X(x), Z(-424.5), 1.3);
      finish(k, c);
    },
  };
})();

/** the N Block compound: the N Block, the long range on the east car park, the K. Folson Building, the range behind
 *  the court on its raised ground, the court, and the buildings on the west and north-west */
export const socSciSite = createSite('social-sciences', [nBlock, range, kFolson, psy, court, ...PLAIN.map(plainSpec)]);
