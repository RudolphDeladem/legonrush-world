// The owner's 10-pair brief (game views beside Street View photographs; cameras in tenviews.ts): the places east of
// Legon Road between Legon City Mall and the police station, the main gate's surroundings, the Jones-Quartey
// Building's parking court and the overhead crossing. This file draws:
// - GCB Bank near Ernest Chemist (pairs 1, 2): one low blue-and-white bank on its mapped outline, seen from the road
//   (the long front with the recessed central entrance, the square emblem, steps and the ramp on the right) and from the
//   south-west (the white panel-clad side with the deep blue-glass recess, the projecting canopy, stairs, the GCB sign on
//   the roof edge, flags); rough pale earth before it behind a low stained concrete wall and a narrow drain, trees,
//   overhead wires, a parked car;
// - the open parcel behind the bank toward the mall (pair 3): red-brown earth, tall grass, stones, rubble and mounds,
//   banana plants and trees, the small pale shed well back (its mapped outline); the other outlines here are excluded
//   (corrections.json);
// - GMI Motors (pair 4): the low showroom with its sign and large display openings north of the mall's forecourt;
// - the Ghana Dance Ensemble frontage by the main gate (pair 7): the low white range on its red-brown base under
//   weathered red tiles, the deep dark passage behind square piers and grilles, the taller two-storey gable-ended block
//   at its north end with the round vent and the glazed notice boards; planting before it;
// - the unfinished concrete frame north of the Jones-Quartey Building's parking (pair 8) and the light carport on the
//   court's east side;
// - the overhead crossing (pair 9): the stone-edged island inside the ring on its west side, its black-and-yellow
//   chevron boards toward the traffic coming off Danquah Avenue and the blue keep-right sign at its nose.
// Positions come from the mapped outlines and roads; the photographs give appearance, storeys and order. Nothing here is
// measured: sizes not in the map data are read from the photographs and are approximate.
import * as THREE from 'three';
import { BUILDINGS } from './campusmap';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { Bag, RED_BASE, SOFF, TILE, WALL, facesOf, fanPalm, gh, hash, openings, tuft, vnoise, wallSolids, type R4 } from './enkit';
import { gableTri } from './ias';
import { hipRoof } from './waccbip';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { rectsOf } from './rectilinear';
import { car } from './cc';
import { SOLIDS } from './solids';
import { canvas, type Part } from './modelkit';
import { CUT, deckAt } from './cutplan';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, WALL) };
/** the mapped outline whose box is (about) this one */
const footprint = (x0: number, x1: number, z0: number, z1: number) => BUILDINGS.find((b) => Math.abs(b.minX - x0) < 0.4 && Math.abs(b.maxX - x1) < 0.4 && Math.abs(b.minZ - z0) < 0.4 && Math.abs(b.maxZ - z1) < 0.4);
const ringOf = (b: { pts: Float32Array }) => { const r: [number, number][] = []; for (let i = 0; i < b.pts.length; i += 2) r.push([b.pts[i], b.pts[i + 1]]); return r; };
const centre = (b: { pts: Float32Array }): [number, number] => {
  const rs = rectsOf(ringOf(b)), r = rs.reduce((m, q) => ((q[1] - q[0]) * (q[3] - q[2]) > (m[1] - m[0]) * (m[3] - m[2]) ? q : m), rs[0]);
  return [(r[0] + r[1]) / 2, (r[2] + r[3]) / 2];
};
/** a sign face drawn on a canvas, as a plane facing +x (ry turns it), centred at x, y, z (world) */
function board(b: Bag, k: Kit, tex: THREE.Texture, x: number, y: number, z: number, w: number, h: number, ry: number) {
  const g = new THREE.PlaneGeometry(w, h).rotateY(ry).translate(x - b.O[0], y, z - b.O[1]);
  k.meshes.push(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex })));
}
const texCache = new Map<string, THREE.Texture>();
const tex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  let t = texCache.get(key);
  if (!t) { t = canvas(w, h, draw); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; texCache.set(key, t); }
  return t;
};
/** the GCB emblem: the gold mark over the letters on white */
const gcbTex = () => tex('gcb', 256, 256, (g) => {
  g.fillStyle = '#f7f7f4'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#e1a417'; g.lineWidth = 26; g.lineCap = 'round';
  g.beginPath(); g.arc(128, 150, 70, Math.PI * 1.08, Math.PI * 1.72); g.stroke();
  g.strokeStyle = '#f0b81c'; g.lineWidth = 14; g.beginPath(); g.arc(150, 120, 52, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
  g.fillStyle = '#6b6f73'; g.font = 'bold 62px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('GCB', 128, 200);
});
/** the GCB sign's lower panel: the branch and service lines (only the larger ones read) over yellow and orange */
const gcbPylonTex = () => tex('gcbpylon', 128, 300, (g) => {
  g.fillStyle = '#f4f3ef'; g.fillRect(0, 0, 128, 70);
  g.fillStyle = '#3a3a3a'; g.font = 'bold 15px Arial'; g.textAlign = 'center'; g.fillText('Legon Branch', 64, 24); g.fillText('24/7 ATM Banking', 64, 54);
  g.fillStyle = '#c9c9c4'; g.fillRect(0, 34, 128, 3); g.fillRect(0, 68, 128, 3);
  g.fillStyle = '#f2b51c'; g.fillRect(0, 71, 128, 229);
  g.fillStyle = '#e88a18'; g.beginPath(); g.moveTo(0, 300); g.lineTo(0, 190); g.quadraticCurveTo(70, 210, 128, 120); g.lineTo(128, 300); g.closePath(); g.fill();
  g.fillStyle = 'rgba(90,60,20,0.55)'; for (let i = 0; i < 4; i++) g.fillRect(28, 92 + i * 18, 70 - (i % 2) * 14, 6);
});
/** black-and-yellow chevron board */
const chevronTex = () => tex('chev', 128, 64, (g) => {
  g.fillStyle = '#f2c21b'; g.fillRect(0, 0, 128, 64);
  g.fillStyle = '#151515';
  for (const x0 of [10, 52, 94]) { g.beginPath(); g.moveTo(x0, 6); g.lineTo(x0 + 16, 6); g.lineTo(x0 + 34, 32); g.lineTo(x0 + 16, 58); g.lineTo(x0, 58); g.lineTo(x0 + 18, 32); g.closePath(); g.fill(); }
});
/** the round blue keep-right sign */
const keepRightTex = () => tex('keepright', 128, 128, (g) => {
  g.clearRect(0, 0, 128, 128);
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(64, 64, 62, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1d5fb8'; g.beginPath(); g.arc(64, 64, 56, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#ffffff'; g.lineWidth = 12; g.lineCap = 'round';
  g.beginPath(); g.moveTo(40, 38); g.lineTo(82, 80); g.stroke();
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(96, 94); g.lineTo(62, 92); g.lineTo(94, 60); g.closePath(); g.fill();
});
/** the GMI Motors fascia: red letters on white */
const gmiTex = () => tex('gmi', 512, 96, (g) => {
  g.fillStyle = '#f4f3ef'; g.fillRect(0, 0, 512, 96);
  g.fillStyle = '#c4161c'; g.font = 'bold 64px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('GMI MOTORS', 256, 50);
});
/** glazed notice boards: a dark frame, pale papers behind the glass */
const noticeTex = () => tex('notice', 128, 96, (g) => {
  g.fillStyle = '#2b2d2f'; g.fillRect(0, 0, 128, 96);
  g.fillStyle = '#5c6a72'; g.fillRect(6, 6, 116, 84);
  for (let i = 0; i < 9; i++) { g.fillStyle = ['#efeee8', '#e8e2c8', '#dfe8ee'][i % 3]; g.fillRect(12 + (i % 3) * 37, 12 + Math.floor(i / 3) * 26, 30, 20); }
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(6, 6); g.lineTo(50, 6); g.lineTo(6, 70); g.fill();
});
let earthMat: THREE.MeshStandardMaterial | null = null;
/** a tile of rough red-brown earth with pale stones and dry grass, for mounds and heaps */
const earthy = () => (earthMat ??= new THREE.MeshStandardMaterial({ roughness: 1, map: canvas(128, 128, (g) => {
  g.fillStyle = '#8f5a3a'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 700; i++) { g.fillStyle = ['#7d4c30', '#a06a46', '#b8a48a', '#6f7a3a', '#9c8f72'][i % 5]; g.fillRect((i * 37) % 128, (i * 53) % 128, 2 + (i % 3), 2); }
}) }));

// ---------- GCB Bank near Ernest Chemist (pairs 1, 2) ----------
const BANK = footprint(818.3, 841.6, -32.3, -14.3);
const BO: [number, number] = [830, -23];
const bankSpec: Spec = {
  name: 'GCB Bank near Ernest Chemist', axis: [1, 0], origin: BO, storey: 4.6, style: PLAIN, roofColor: '#b9bcbf', fascia: '#e9ecee', pitch: 0.05,
  replaces: BANK ? [centre(BANK)] : [],
  onGround: true,
  blocks: [],
  keep: [[808 - BO[0], 846 - BO[0], -36 - BO[1], -6 - BO[1]]],
  extras: (k: Kit) => {
    if (!BANK) return;
    const b = new Bag(BO), y = gh(830, -23), X0 = 818.5, X1 = 841.5, Z0 = -32.2, Z1 = -14.4, H = y + 4.6, P = 0.55;
    const CL = '#e8ebee', CL2 = '#dfe3e7', BLUE = '#1f5fae', DARK = '#1d2a36', JOINT = '#b9bec4';
    // the body: white and silver panel cladding, a parapet with a broad blue band, panel joints
    b.c.push([b.B(X0, X1, y - 0.3, H, Z0, Z1), CL]);
    b.c.push([b.B(X0 - 0.12, X1 + 0.12, H - 0.9, H + P, Z0 - 0.12, Z1 + 0.12), BLUE]);
    b.c.push([b.B(X0 - 0.14, X1 + 0.14, H + P, H + P + 0.08, Z0 - 0.14, Z1 + 0.14), CL2], [b.B(X0, X1, H - 0.05, H + 0.05, Z0, Z1), '#a9adb1']);
    b.c.push([b.B(X0 - 0.06, X1 + 0.06, y - 0.3, y + 0.35, Z0 - 0.06, Z1 + 0.06), '#9aa0a6']);
    for (let z = Z0 + 1.2; z < Z1; z += 1.2) b.c.push([b.B(X0 - 0.03, X0, y + 0.35, H - 0.9, z - 0.02, z + 0.02), JOINT], [b.B(X1, X1 + 0.03, y + 0.35, H - 0.9, z - 0.02, z + 0.02), JOINT]);
    for (let x = X0 + 1.2; x < X1; x += 1.2) b.c.push([b.B(x - 0.02, x + 0.02, y + 0.35, H - 0.9, Z1, Z1 + 0.03), JOINT], [b.B(x - 0.02, x + 0.02, y + 0.35, H - 0.9, Z0 - 0.03, Z0), JOINT]);
    for (const yy of [y + 1.6, y + 2.8]) b.c.push([b.B(X0 - 0.03, X0, yy - 0.02, yy + 0.02, Z0, Z1), JOINT], [b.B(X0, X1, yy - 0.02, yy + 0.02, Z1, Z1 + 0.03), JOINT]);
    // ---- the road front (pair 1): broad blue vertical zones at the ends, the dark recessed central entrance, the
    // square emblem block over it, shallow steps up to it, the ramp with its metal railing on the right (south) ----
    for (const [a0, a1] of [[Z0, Z0 + 2.4], [Z1 - 2.4, Z1]]) b.c.push([b.B(X0 - 0.1, X0, y + 0.35, H - 0.9, a0, a1), BLUE]);
    for (const [a0, a1] of [[Z0 + 3.2, Z0 + 5.8], [Z1 - 5.8, Z1 - 3.2]]) k.glass.push(b.plane(false, X0 - 0.02, -1, (a0 + a1) / 2, a1 - a0, y + 1.0, y + 3.2));
    const E0 = -25.6, E1 = -20.8, ed = 1.6, land = 0.45;
    b.c.push([b.B(X0 - 0.05, X0 + ed, y + 3.4, H - 0.9, E0, E1), CL2]);
    b.c.push([b.B(X0 + ed - 0.05, X0 + ed, y, y + 3.4, E0, E1), DARK]);
    k.glass.push(b.plane(false, X0 + ed - 0.06, -1, (E0 + E1) / 2, E1 - E0 - 0.6, y + land, y + 3.2));
    for (const z of [E0, E1]) b.c.push([b.B(X0 - 0.05, X0 + ed, y - 0.3, y + 3.4, z - (z === E0 ? 0.3 : 0), z + (z === E1 ? 0.3 : 0)), DARK]);
    b.c.push([b.B(X0, X0 + ed, y - 0.3, y + land, E0, E1), '#c9c6bf']);
    // the emblem block standing over the entrance
    b.c.push([b.B(X0 - 0.35, X0, y + 3.3, H + 0.4, -24.6, -21.8), '#f4f4f2']);
    board(b, k, gcbTex(), X0 - 0.36, y + 3.85 + 0.15, -23.2, 2.4, 2.4, -Math.PI / 2);
    // the steps before the entrance, then the landing; the ramp along the front to the south with its railing
    for (let i = 0; i < 3; i++) b.c.push([b.B(X0 - 1.6 + i * 0.45, X0, y - 0.3, y + (land * (i + 1)) / 3, E0 - 0.4, E1 + 0.4), i % 2 ? '#c4c0b8' : '#cdc9c1']);
    const R0 = E1 + 0.4, R1 = -15.0;
    for (let i = 0; i < 8; i++) { const za = R0 + ((R1 - R0) * i) / 8, zb = R0 + ((R1 - R0) * (i + 1)) / 8; b.c.push([b.B(X0 - 1.6, X0, y - 0.3, y + land * (1 - i / 8), za, zb), '#c9c5bd']); }
    for (let i = 0; i <= 5; i++) { const z = R0 + ((R1 - R0) * i) / 5; b.c.push([b.B(X0 - 1.62, X0 - 1.56, y + land * (1 - i / 5), y + land * (1 - i / 5) + 0.95, z - 0.03, z + 0.03), '#a7adb3']); }
    b.c.push([new THREE.BoxGeometry(0.05, 0.05, R1 - R0).rotateX(Math.atan2(land, R1 - R0)).translate(X0 - 1.59 - BO[0], y + land / 2 + 0.95, (R0 + R1) / 2 - BO[1]), '#a7adb3']);
    // ---- the south side (pair 2): the white panel-clad face, the deep vertical blue-glass recess in its strong
    // rectangular frame, the projecting canopy on two posts over the stairs and the ramp, the sign on the roof edge ----
    const G0 = 826.0, G1 = 831.6;
    b.c.push([b.B(G0 - 0.4, G1 + 0.4, y + 0.2, H + P, Z1 - 0.01, Z1 + 0.5), '#f1f2f2']);
    b.c.push([b.B(G0, G1, y + 0.2, H + 0.2, Z1 + 0.49, Z1 + 0.51), '#284f86']);
    k.glass.push(b.plane(true, Z1 + 0.52, 1, (G0 + G1) / 2, G1 - G0 - 0.3, y + 0.6, H));
    for (let x = G0 + 1.4; x < G1; x += 1.4) b.c.push([b.B(x - 0.04, x + 0.04, y + 0.3, H + 0.2, Z1 + 0.5, Z1 + 0.56), '#c8ced4']);
    const C0 = 832.6, C1 = 838.6;
    b.c.push([b.B(C0, C1, y + 3.2, y + 3.45, Z1, Z1 + 2.6), '#f0f1f1'], [b.B(C0, C1, y + 3.19, y + 3.2, Z1, Z1 + 2.6), SOFF]);
    for (const x of [C0 + 0.25, C1 - 0.25]) { b.c.push([b.B(x - 0.1, x + 0.1, y, y + 3.2, Z1 + 2.3, Z1 + 2.5), '#c9ced3']); SOLIDS.add(x, Z1 + 2.4, 0.18); }
    b.c.push([b.B(C0 + 1.0, C1 - 1.0, y + 0.45, y + 3.0, Z1 - 0.02, Z1 + 0.02), DARK]);
    k.glass.push(b.plane(true, Z1 + 0.03, 1, (C0 + C1) / 2, C1 - C0 - 2.4, y + 0.5, y + 2.9));
    for (let i = 0; i < 3; i++) b.c.push([b.B(C0 + 0.8, C1 - 0.8, y - 0.3, y + (land * (i + 1)) / 3, Z1, Z1 + 2.2 - i * 0.5), '#cdc9c1']);
    b.c.push([b.B(C1 - 0.8, C1 + 4.0, y - 0.3, y + 0.15, Z1, Z1 + 1.4), '#c9c5bd']);
    for (let x = C1; x <= C1 + 4.0; x += 1.0) b.c.push([b.B(x - 0.03, x + 0.03, y, y + 1.05, Z1 + 1.38, Z1 + 1.44), '#a7adb3']);
    b.c.push([b.B(C1, C1 + 4.0, y + 1.0, y + 1.05, Z1 + 1.38, Z1 + 1.44), '#a7adb3']);
    // the GCB sign on the roof edge at the south-west corner, facing south and west
    b.c.push([b.B(X0 + 0.4, X0 + 4.4, H + P, H + P + 1.5, Z1 - 0.3, Z1 - 0.1), '#f4f4f2']);
    board(b, k, gcbTex(), X0 + 2.4, H + P + 0.75, Z1 - 0.09, 1.4, 1.4, 0);
    board(b, k, gcbTex(), X0 - 0.13, H - 0.35 + 0.0, Z1 - 1.2, 1.1, 1.1, -Math.PI / 2);
    // the east and north faces: plain cladding with a few high windows
    for (let z = Z0 + 2; z < Z1 - 1; z += 3.2) k.glass.push(b.plane(false, X1 + 0.02, 1, z + 0.8, 1.4, y + 2.4, y + 3.3));
    for (let x = X0 + 2; x < X1 - 1; x += 3.6) k.glass.push(b.plane(true, Z0 - 0.02, -1, x + 0.8, 1.4, y + 2.4, y + 3.3));
    wallSolids(X0, Z0, X1, Z0); wallSolids(X1, Z0, X1, Z1); wallSolids(X1, Z1, X0, Z1); wallSolids(X0, Z1, X0, Z0);
    // ---- the ground before the bank (pair 1): rough pale-brown earth with sparse weeds; the low stained concrete wall
    // along the road with gaps at the steps and the ramp, the narrow drain inside it; paved access to the south side
    // with planted islands (pair 2) ----
    k.meshes.push(new THREE.Mesh(drapeAt(BO, 810.6, 818.5, -36, -10, 0.5, 0.04, (x, z) => {
      const n = vnoise(x * 0.4, z * 0.4), m = hash(Math.floor(x * 3), Math.floor(z * 3)) * 0.06;
      if (n > 0.74) return [0.44 + m, 0.46 + m, 0.24];
      return [0.66 - m, 0.52 - m, 0.38 - m];
    }), groundCover()));
    k.meshes.push(new THREE.Mesh(drapeAt(BO, 818.5, 846, -14.4, -6.5, 0.5, 0.045, (x, z) => {
      const row = Math.floor(z / 0.25), col = Math.floor((x + (row % 2) * 0.2) / 0.4), t = hash(col, row) * 0.07;
      return [0.66 - t, 0.64 - t, 0.6 - t];
    }), groundCover()));
    const WX = 811.2;
    for (const [z0, z1] of [[-35.5, -26.3], [-14.6, -9.5]]) {
      b.c.push([b.B(WX - 0.12, WX + 0.12, y - 0.2, y + 0.85, z0, z1), '#b7b1a4'], [b.B(WX - 0.14, WX + 0.14, y + 0.85, y + 0.93, z0, z1), '#c8c2b5']);
      for (let z = z0 + 0.4; z < z1; z += 1.1) b.c.push([b.B(WX - 0.125, WX + 0.125, y + 0.1, y + 0.6 + hash(z, 3) * 0.25, z, z + 0.25 + hash(z, 5) * 0.3), '#8f8a80']);
      wallSolids(WX, z0, WX, z1, 0.2);
      b.c.push([b.B(WX + 0.2, WX + 0.6, y - 0.02, y + 0.01, z0, z1), '#3f3c37'], [b.B(WX + 0.6, WX + 0.75, y - 0.05, y + 0.06, z0, z1), '#bdb7aa']);
    }
    for (let i = 0; i < 40; i++) tuft(b, 811.6 + hash(i, 3) * 6.5, -35 + hash(i, 5) * 25, 0.3 + hash(i, 7) * 0.4, ['#8a9450', '#7d8a44', '#9a9a58'][i % 3]);
    // planted islands with low shrubs along the south approach, the flags on slender poles
    for (const [x0, x1] of [[819.2, 824.4], [841.0, 845.0]]) {
      b.c.push([b.B(x0, x1, y - 0.1, y + 0.25, -11.2, -9.0), '#c7c2b8']);
      k.meshes.push(new THREE.Mesh(drapeAt(BO, x0 + 0.15, x1 - 0.15, -11.05, -9.15, 0.3, 0.27, () => [0.36, 0.3, 0.22]), groundCover()));
      for (let x = x0 + 0.6; x < x1 - 0.3; x += 0.9) b.leaf.push([new THREE.IcosahedronGeometry(0.42, 0).scale(1, 0.75, 1).translate(x - BO[0], y + 0.55, -10.1 - BO[1]), ['#3f6d2c', '#527f33', '#4a7a2e'][Math.round(x) % 3]]);
      wallSolids(x0, -10.1, x1, -10.1, 0.5);
    }
    for (const [x, cols] of [[820.0, ['#ce1126', '#fcd116', '#006b3f']], [821.6, ['#e1a417', '#ffffff', '#e1a417']], [823.2, ['#1d3f7a', '#ffffff', '#1d3f7a']]] as [number, string[]][]) {
      const fy = gh(x, -8.2);
      b.c.push([new THREE.CylinderGeometry(0.04, 0.06, 7, 8).translate(x - BO[0], fy + 3.5, -8.2 - BO[1]), '#d9dcdf']);
      for (let i = 0; i < 3; i++) b.c.push([new THREE.BoxGeometry(1.5, 0.3, 0.02).translate(x + 0.8 - BO[0], fy + 6.6 - i * 0.3, -8.2 - BO[1]), cols[i]]);
      SOLIDS.add(x, -8.2, 0.1);
    }
    // the mature spreading trees, the utility poles and their wires along the road, the parked car
    for (const [x, z, h, s] of [[812.4, -54, 9, 14], [814, -4.5, 8.5, 13], [846, -36, 8, 11]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x + z * 3, origin: BO });
    const poles: [number, number][] = [[810.3, -50], [810.3, -20], [810.4, 8]];
    for (const [x, z] of poles) { const py = gh(x, z); b.c.push([new THREE.CylinderGeometry(0.1, 0.14, 8.5, 8).translate(x - BO[0], py + 4.25, z - BO[1]), '#5a4a3b'], [b.B(x - 0.9, x + 0.9, py + 7.9, py + 8.0, z - 0.05, z + 0.05), '#4a3d30']); SOLIDS.add(x, z, 0.2); }
    for (let i = 0; i < poles.length - 1; i++) for (const dx of [-0.8, 0, 0.8]) {
      const [ax, az] = poles[i], [cx, cz] = poles[i + 1], ay = gh(ax, az) + 8.05, cy = gh(cx, cz) + 8.05;
      for (let j = 0; j < 6; j++) {
        const t0 = j / 6, t1 = (j + 1) / 6, s = (t: number) => 0.6 * 4 * t * (1 - t);
        const p = new THREE.Vector3(ax + dx - BO[0], ay + (cy - ay) * t0 - s(t0), az + (cz - az) * t0 - BO[1]), q = new THREE.Vector3(ax + dx - BO[0], ay + (cy - ay) * t1 - s(t1), az + (cz - az) * t1 - BO[1]);
        const d = q.clone().sub(p);
        b.c.push([new THREE.BoxGeometry(0.025, 0.025, d.length()).lookAt(d).translate((p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2), '#2a2a2a']);
      }
    }
    car(k, 816.0 - BO[0], -12.8 - BO[1], '#22262b', gh(816, -12.8), Math.PI / 2);
    // the tall GCB sign on its two legs at the north-west corner by the road (the owner's picture): the white head with the
    // emblem, the yellow and orange lower panel with its service lines; cars nosed in on the red earth either side
    {
      const px = 813.4, pz = -39.6, py = gh(px, pz), w = 1.5, hgt = 5.6;
      b.c.push([b.B(px - 0.18, px + 0.18, py, py + hgt, pz - w / 2, pz + w / 2), '#ededea']);
      for (const s2 of [-1, 1]) b.c.push([b.B(px - 0.22, px + 0.22, py, py + 0.5, pz + s2 * (w / 2 - 0.12) - 0.12, pz + s2 * (w / 2 - 0.12) + 0.12), '#9a958b']);
      board(b, k, gcbTex(), px - 0.19, py + hgt - 0.85, pz, 1.45, 1.45, -Math.PI / 2);
      board(b, k, gcbPylonTex(), px - 0.19, py + 2.2, pz, 1.45, 3.4, -Math.PI / 2);
      board(b, k, gcbTex(), px + 0.19, py + hgt - 0.85, pz, 1.45, 1.45, Math.PI / 2);
      wallSolids(px, pz - w / 2, px, pz + w / 2, 0.3);
      for (const [z, col] of [[-47.2, '#9aa0a6'], [-44.2, '#2f3a4a'], [-35.0, '#1f2328']] as [number, string][]) car(k, 815.6 - BO[0], z - BO[1], col, gh(815.6, z), Math.PI / 2);
    }
    b.finish(k, 0.25);
  },
};

// ---------- the open parcel behind the bank toward the mall, the small shed well back (pair 3) ----------
const SHED = footprint(861.6, 874.3, -78.3, -64.8);
const PO: [number, number] = [843, -72];
const parcelSpec: Spec = {
  name: 'Open parcel behind GCB Bank', axis: [1, 0], origin: PO, storey: 3, style: PLAIN, roofColor: '#3f3934', fascia: '#2f2a26', pitch: 0.4,
  replaces: SHED ? [centre(SHED)] : [],
  onGround: true,
  blocks: [],
  keep: [[809 - PO[0], 880 - PO[0], -128 - PO[1], -34 - PO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(PO);
    // the ground: compacted red-brown earth, patches of tall grass, worn paler tracks, uneven
    k.meshes.push(new THREE.Mesh(drapeAt(PO, 809.6, 878, -127.5, -34.5, 0.7, 0.035, (x, z) => {
      if (x < 818.5 && z > -36) return null;
      const n = vnoise(x * 0.12, z * 0.12), m = vnoise(x * 0.9, z * 0.9), h = hash(Math.floor(x * 2), Math.floor(z * 2)) * 0.05;
      if (n > 0.62) return [0.4 + m * 0.08, 0.45 + m * 0.07, 0.22 + h];
      if (n < 0.12) return [0.64 + h, 0.5 + h, 0.38 + h];
      return [0.58 + m * 0.06 - h, 0.36 + m * 0.04 - h, 0.24 - h];
    }), groundCover()));
    // irregular low mounds of earth and rubble
    for (let i = 0; i < 9; i++) {
      const x = 816 + hash(i, 11) * 56, z = -120 + hash(i, 13) * 74, r = 1.2 + hash(i, 17) * 2.2;
      if (x > 858 && x < 877 && z > -81 && z < -62) continue;
      const g = new THREE.SphereGeometry(r, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.4, 0.32, 1).rotateY(hash(i, 19) * 3).translate(x - PO[0], gh(x, z) - 0.05, z - PO[1]);
      k.meshes.push(new THREE.Mesh(g, earthy()));
    }
    // scattered stones and construction debris (broken blocks), tall grass and banana plants
    for (let i = 0; i < 70; i++) {
      const x = 812 + hash(i, 21) * 64, z = -124 + hash(i, 23) * 86, s = 0.12 + hash(i, 27) * 0.25;
      if (x < 819 && z > -37) continue;
      b.c.push([i % 3 ? new THREE.IcosahedronGeometry(s, 0).translate(x - PO[0], gh(x, z) + s * 0.4, z - PO[1]) : new THREE.BoxGeometry(0.4, 0.2, 0.2).rotateY(hash(i, 29) * 3).translate(x - PO[0], gh(x, z) + 0.08, z - PO[1]), i % 3 ? '#a49c8e' : '#b9b3a6']);
    }
    for (let i = 0; i < 260; i++) {
      const x = 811 + hash(i, 31) * 66, z = -126 + hash(i, 37) * 90;
      if ((x < 819 && z > -37) || vnoise(x * 0.12, z * 0.12) < 0.45) continue;
      tuft(b, x, z, 0.6 + hash(i, 41) * 0.9, ['#8a9450', '#7d8a44', '#9a9a58', '#6b7a3a'][i % 4]);
    }
    for (const [x, z] of [[828, -58], [833, -60.5], [851, -96], [839, -108], [870, -101]] as [number, number][]) {
      const y = gh(x, z);
      b.c.push([new THREE.CylinderGeometry(0.12, 0.16, 2.2, 7).translate(x - PO[0], y + 1.1, z - PO[1]), '#7b8a45']);
      for (let j = 0; j < 6; j++) b.leaf.push([new THREE.BoxGeometry(0.45, 0.04, 2.0).translate(0, 0, 1.0).rotateX(-0.5).rotateY(j * 1.05 + x).translate(x - PO[0], y + 2.1, z - PO[1]), j % 2 ? '#6f9a3a' : '#5d8a33']);
      SOLIDS.add(x, z, 0.2);
    }
    for (const [x, z, h, s] of [[858, -60, 9, 12], [877, -90, 10, 14], [849, -84, 7.5, 9], [823, -118, 8.5, 12], [872, -58, 8, 10]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x * 2 + z, origin: PO });
    // the small pale shed well back: one storey, a low gable roof with a dark edge, few openings (its mapped outline)
    if (SHED) {
      const ring = ringOf(SHED);
      // its long axis (the outline is turned about 15 degrees)
      const [ax, az] = ring[0], [bx, bz] = ring[1], ang = Math.atan2(bz - az, bx - ax);
      const c = centre(SHED), L = 10.5, W = 7.4, eave = 2.9, y = gh(c[0], c[1]);
      const grp: Part[] = [];
      const add = (g: THREE.BufferGeometry, col: string) => grp.push([g, col]);
      add(new THREE.BoxGeometry(L, eave + 0.3, W).translate(0, y + eave / 2 - 0.15, 0), '#e7e2d6');
      add(new THREE.BoxGeometry(L + 0.04, 0.5, W + 0.04).translate(0, y + 0.1, 0), '#a49c8c');
      const ridge = 1.2, slope = Math.hypot(W / 2 + 0.5, ridge);
      for (const s of [-1, 1]) add(new THREE.BoxGeometry(L + 0.8, 0.08, slope).rotateX(s * Math.atan2(ridge, W / 2 + 0.5)).translate(0, y + eave + ridge / 2, s * -(W / 2 + 0.5) / 2), '#5b5650');
      for (const s of [-1, 1]) add(new THREE.BoxGeometry(L + 0.85, 0.18, 0.12).translate(0, y + eave - 0.05, s * (W / 2 + 0.5)), '#2f2a26');
      const tri = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(0, ridge)]);
      for (const s of [-1, 1]) add(new THREE.ShapeGeometry(tri).rotateY(Math.PI / 2 * s).translate(s * L / 2, y + eave, 0), '#e7e2d6');
      add(new THREE.BoxGeometry(0.05, 2.0, 0.9).translate(-L / 2 - 0.02, y + 1.0, 1.2), '#3a3633');
      add(new THREE.BoxGeometry(1.0, 0.7, 0.05).translate(-1.5, y + 1.6, W / 2 + 0.02), '#2c2f31');
      add(new THREE.BoxGeometry(1.0, 0.7, 0.05).translate(2.5, y + 1.6, W / 2 + 0.02), '#2c2f31');
      for (const [g, col] of grp) b.c.push([g.rotateY(-ang).translate(c[0] - PO[0], 0, c[1] - PO[1]), col]);
    }
    b.finish(k, 0.4);
  },
};

// ---------- GMI Motors, north of the mall's forecourt (pair 4) ----------
/** an outline's oriented box: centre, the angle of its longest edge, its length along that edge and its depth */
function oriented(b: { pts: Float32Array }) {
  const r = ringOf(b);
  let best = 0, ang = 0;
  for (let i = 0; i < r.length; i++) { const [ax, az] = r[i], [cx, cz] = r[(i + 1) % r.length], l = Math.hypot(cx - ax, cz - az); if (l > best) { best = l; ang = Math.atan2(cz - az, cx - ax); } }
  // (its front, the local +z side, is the one toward the south)
  if (Math.cos(ang) < 0) ang += Math.PI;
  const ux = Math.cos(ang), uz = Math.sin(ang);
  let a0 = Infinity, a1 = -Infinity, d0 = Infinity, d1 = -Infinity;
  for (const [x, z] of r) { const a = x * ux + z * uz, d = -x * uz + z * ux; a0 = Math.min(a0, a); a1 = Math.max(a1, a); d0 = Math.min(d0, d); d1 = Math.max(d1, d); }
  const am = (a0 + a1) / 2, dm = (d0 + d1) / 2;
  return { c: [am * ux - dm * uz, am * uz + dm * ux] as [number, number], ang, len: a1 - a0, dep: d1 - d0, ux, uz };
}
/** (the owner's Legon City Mall and GM Motors correction brief: GMI Motors is the low signed frontage nearest the road (the
 *  outline osm:way/665125606, blue arrows); the two outlines east of it, farther back toward the mall, are a separate
 *  plain low structure (the green arrow), with no sign) */
const GMI = footprint(782.2, 811.4, -221.8, -204.9);
const LOWB = [footprint(809.9, 844.2, -225.4, -218.7), footprint(843.8, 860.2, -227.0, -213.0)].filter((q) => !!q);
const GO: [number, number] = [815, -215];
const gmiSpec: Spec = {
  name: 'GMI Motors and the low structure behind it', axis: [1, 0], origin: GO, storey: 4.5, style: PLAIN, roofColor: '#9a9a96', fascia: '#5a5a58', pitch: 0.05,
  replaces: [GMI, ...LOWB].filter((q) => !!q).map((q) => oriented(q!).c),
  onGround: true,
  blocks: [],
  keep: [[780 - GO[0], 862 - GO[0], -229 - GO[1], -180 - GO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(GO);
    const corners = (o: ReturnType<typeof oriented>) => [[-o.len / 2, -o.dep / 2], [o.len / 2, -o.dep / 2], [o.len / 2, o.dep / 2], [-o.len / 2, o.dep / 2]].map(([a, d]) => [o.c[0] + a * o.ux - d * o.uz, o.c[1] + a * o.uz + d * o.ux]);
    const place = (o: ReturnType<typeof oriented>, parts: Part[], glass: THREE.BufferGeometry[]) => {
      const rot = (g: THREE.BufferGeometry) => g.rotateY(-o.ang).translate(o.c[0] - GO[0], 0, o.c[1] - GO[1]);
      for (const [g, col] of parts) b.c.push([rot(g), col]);
      for (const g of glass) k.glass.push(rot(g));
      const cs = corners(o);
      for (let i = 0; i < 4; i++) wallSolids(cs[i][0], cs[i][1], cs[(i + 1) % 4][0], cs[(i + 1) % 4][1]);
    };
    // GMI Motors: a low flat-roofed showroom, its long pale sign fascia with the red logo and lettering over a front
    // subdivided by slender vertical mullions into dark glazed bays, red trim, a parapet
    if (GMI) {
      const o = oriented(GMI), y = gh(o.c[0], o.c[1]), L = o.len, D = o.dep, H = 4.2, parts: Part[] = [], glass: THREE.BufferGeometry[] = [];
      parts.push([new THREE.BoxGeometry(L, H + 0.3, D).translate(0, y + (H + 0.3) / 2 - 0.3, 0), '#e9e8e3']);
      parts.push([new THREE.BoxGeometry(L + 0.3, 1.3, 0.35).translate(0, y + H + 0.35, D / 2 + 0.1), '#f6f5f1']);
      parts.push([new THREE.BoxGeometry(L + 0.32, 0.14, 0.38).translate(0, y + H - 0.32, D / 2 + 0.1), '#b8202a'], [new THREE.BoxGeometry(L + 0.32, 0.1, 0.38).translate(0, y + H + 1.02, D / 2 + 0.1), '#b8202a']);
      parts.push([new THREE.BoxGeometry(L + 0.1, 0.5, D + 0.1).translate(0, y, 0), '#8b8780']);
      const n = Math.max(2, Math.round(L / 2.6));
      glass.push(new THREE.PlaneGeometry(L - 0.8, 3.2).translate(0, y + 1.9, D / 2 + 0.03));
      for (let i = 0; i <= n; i++) parts.push([new THREE.BoxGeometry(0.12, 3.4, 0.14).translate(-L / 2 + 0.4 + ((L - 0.8) * i) / n, y + 1.9, D / 2 + 0.08), '#2b2d30']);
      place(o, parts, glass);
      const fx = o.c[0] - (D / 2 + 0.3) * o.uz, fz = o.c[1] + (D / 2 + 0.3) * o.ux;
      board(b, k, gmiTex(), fx, y + H + 0.35, fz, Math.min(L - 2, 12), 1.1, -o.ang);
    }
    // the separate low structure farther back (green arrow): plain pale walls, a few dark openings, a shallow roof
    for (const q of LOWB) {
      const o = oriented(q!), y = gh(o.c[0], o.c[1]), L = o.len, D = o.dep, H = 3.2, parts: Part[] = [];
      parts.push([new THREE.BoxGeometry(L, H + 0.3, D).translate(0, y + (H + 0.3) / 2 - 0.3, 0), '#dcdad3']);
      parts.push([new THREE.BoxGeometry(L + 0.6, 0.12, D + 0.8).rotateX(0.05).translate(0, y + H + 0.15, 0), '#8e9294']);
      const n = Math.max(1, Math.round(L / 6));
      for (let i = 0; i < n; i++) parts.push([new THREE.BoxGeometry(i % 3 === 1 ? 2.4 : 1.4, i % 3 === 1 ? 2.4 : 1.1, 0.06).translate(-L / 2 + (L * (i + 0.5)) / n, y + (i % 3 === 1 ? 1.2 : 1.6), D / 2 + 0.03), '#2a2d30']);
      place(o, parts, []);
    }
    // GMI's gravelly forecourt to the open lot, modest posts with a mesh along its front, a kerb line
    if (GMI) {
      k.meshes.push(new THREE.Mesh(drapeAt(GO, 784, 826, -204.5, -140, 0.4, 0.04, (x, z) => {
        if (z > -186 && x < 790.5) return null;
        const n = vnoise(x * 0.4, z * 0.4), m = hash(Math.floor(x * 4), Math.floor(z * 4)) * 0.07;
        return n > 0.75 ? [0.56, 0.43, 0.32] : [0.7 - m, 0.67 - m, 0.62 - m];
      }), groundCover()));
      for (let x = 786; x <= 824; x += 3.8) { const z = -186.2, yy = gh(x, z); b.c.push([b.B(x - 0.05, x + 0.05, yy, yy + 1.3, z - 0.05, z + 0.05), '#7a3f2a']); SOLIDS.add(x, z, 0.08); }
      b.c.push([b.B(786, 824, gh(805, -186.2) + 1.22, gh(805, -186.2) + 1.27, -186.23, -186.17), '#8a8f93']);
      wallSolids(786, -186.2, 824, -186.2, 0.12);
      for (const [x, z, col] of [[792, -199.5, '#c9ccd0'], [799, -200, '#2b2e33'], [815.5, -199.2, '#e4e4e0']] as [number, number, string][]) car(k, x - GO[0], z - GO[1], col, gh(x, z), 0.05);
    }
    b.finish(k, 0.25);
  },
};

// ---------- the roadside cluster on the south side of the lane to the mall (the mall correction brief, images 3, 4) ----------
const RO: [number, number] = [802, -122];
const clusterSpec: Spec = {
  name: 'Roadside shelter cluster', axis: [1, 0], origin: RO, storey: 3, style: PLAIN, roofColor: '#888', fascia: '#888', pitch: 0.1,
  onGround: true,
  blocks: [],
  keep: [[792 - RO[0], 812 - RO[0], -128 - RO[1], -106 - RO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(RO), y = gh(802, -122);
    // the kerb along the lane's south edge, the compacted vehicle strip, the raised concrete slab with its edge
    for (let x = 792; x < 811.5; x += 1.5) b.c.push([b.B(x, x + 1.5, y - 0.1, y + 0.16, -128.25, -128.05), '#c9c4b8']);
    k.meshes.push(new THREE.Mesh(drapeAt(RO, 792, 809.4, -128.0, -106, 0.35, 0.035, (x, z) => {
      const n = vnoise(x * 0.4, z * 0.4), m = hash(Math.floor(x * 3), Math.floor(z * 3)) * 0.06;
      if (z < -124.5) return [0.5 - m, 0.48 - m, 0.45 - m];
      if (n > 0.6) return [0.62 - m, 0.6 - m, 0.56 - m];
      return [0.56 + n * 0.06, 0.38 + n * 0.04, 0.27];
    }), groundCover()));
    b.c.push([b.B(797.0, 806.0, y - 0.2, y + 0.38, -123.8, -117.8), '#b8b3a8'], [b.B(796.9, 806.1, y + 0.3, y + 0.4, -123.9, -123.7), '#a49f94']);
    // the shelter: a shallow sheet roof on slender metal posts, its frame, mesh and grille sides, items stored beneath
    const sy = y + 0.38, ml: THREE.BufferGeometry[] = [];
    for (const [px, pz] of [[797.6, -123.3], [801.4, -123.3], [805.4, -123.3], [797.6, -118.3], [801.4, -118.3], [805.4, -118.3]]) { b.c.push([b.B(px - 0.05, px + 0.05, sy, sy + 2.7 + (pz > -120 ? -0.3 : 0), pz - 0.05, pz + 0.05), '#5d6266']); SOLIDS.add(px, pz, 0.08); }
    b.c.push([new THREE.BoxGeometry(9.2, 0.05, 6.0).rotateX(-0.06).translate(801.5 - RO[0], sy + 2.6, -120.8 - RO[1]), '#9ea3a6'], [b.B(797.0, 806.0, sy + 2.45, sy + 2.62, -123.5, -123.3), '#3d4246']);
    const meshM = new THREE.MeshStandardMaterial({ map: (() => { const t = canvas(32, 32, (g) => { g.clearRect(0, 0, 32, 32); g.strokeStyle = 'rgba(70,74,78,0.95)'; g.lineWidth = 2; g.strokeRect(1, 1, 30, 30); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })(), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide });
    for (const [ax, az, cx, cz] of [[797.6, -118.3, 805.4, -118.3], [797.6, -123.3, 797.6, -118.3], [805.4, -123.3, 805.4, -118.3]]) {
      const L = Math.hypot(cx - ax, cz - az), g = new THREE.PlaneGeometry(L, 1.9), uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * L * 4, uv.getY(i) * 1.9 * 4);
      ml.push(g.rotateY(-Math.atan2(cz - az, cx - ax)).translate((ax + cx) / 2 - RO[0], sy + 0.95, (az + cz) / 2 - RO[1]));
      wallSolids(ax, az, cx, cz, 0.12);
    }
    const mm = new THREE.Mesh(mergeGeoms(ml), meshM); mm.userData.noCollide = true; k.meshes.push(mm);
    // stored things: stacked tyres, a blue drum, a small container box
    for (let i = 0; i < 4; i++) b.c.push([new THREE.TorusGeometry(0.36, 0.13, 6, 12).rotateX(Math.PI / 2).translate(798.6 - RO[0], sy + 0.13 + i * 0.26, -119.6 - RO[1]), '#1d1e20']);
    b.c.push([new THREE.CylinderGeometry(0.3, 0.3, 0.9, 12).translate(800.2 - RO[0], sy + 0.45, -119.4 - RO[1]), '#2a64b8'], [b.B(802.6, 804.6, sy, sy + 1.1, -120.4, -119.0), '#7d5a42']);
    SOLIDS.add(799.4, -119.5, 0.7); SOLIDS.add(803.6, -119.7, 0.9);
    // the tall advertising panel on its two posts beside the shelter, the small sign panel
    for (const z of [-116.6, -112.2]) { b.c.push([b.B(806.95, 807.05, y, y + 6.2, z - 0.06, z + 0.06), '#5d6266']); SOLIDS.add(807, z, 0.1); }
    b.c.push([b.B(806.8, 807.0, y + 2.6, y + 6.4, -117.2, -111.6), '#e8e6df']);
    k.meshes.push(new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.6).rotateY(-Math.PI / 2).translate(806.78 - RO[0], y + 4.5, -114.4 - RO[1]), new THREE.MeshStandardMaterial({ color: '#c7b49a', roughness: 0.8 })));
    for (const x of [795.2, 796.0]) b.c.push([b.B(x - 0.03, x + 0.03, y, y + 1.6, -124.6, -124.54), '#8f959a']);
    b.c.push([b.B(795.0, 796.2, y + 1.0, y + 1.6, -124.62, -124.56), '#f2f2ee']);
    // the dense irregular trees and the broad banana-like leaves behind and beside it
    for (const [x, z, h, sp] of [[795, -112, 11, 16], [798.2, -106.8, 12, 18], [810, -114, 10, 14]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: sp, seed: x + z * 2, origin: RO });
    for (const [x, z] of [[799, -115], [801.5, -114], [804.5, -115.5], [794, -117]] as [number, number][]) {
      const yy = gh(x, z);
      b.c.push([new THREE.CylinderGeometry(0.12, 0.16, 2.4, 7).translate(x - RO[0], yy + 1.2, z - RO[1]), '#7b8a45']);
      for (let j = 0; j < 7; j++) b.leaf.push([new THREE.BoxGeometry(0.5, 0.04, 2.2).translate(0, 0, 1.1).rotateX(-0.45).rotateY(j * 0.9 + x).translate(x - RO[0], yy + 2.3, z - RO[1]), j % 2 ? '#6f9a3a' : '#5d8a33']);
      SOLIDS.add(x, z, 0.2);
    }
    b.finish(k, 0.4);
  },
};
function mergeGeoms(list: THREE.BufferGeometry[]) {
  const pos: number[] = [], uv: number[] = [], nor: number[] = [];
  for (const g0 of list) { const g = g0.index ? g0.toNonIndexed() : g0; pos.push(...(g.attributes.position.array as Float32Array)); uv.push(...(g.attributes.uv.array as Float32Array)); nor.push(...(g.attributes.normal.array as Float32Array)); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return g;
}

// ---------- the Ghana Dance Ensemble frontage by the main gate (pair 7) ----------
const DANCE = footprint(673.0, 681.1, 162.6, 193.9);
const DO: [number, number] = [677, 178];
const danceSpec: Spec = {
  name: 'Ghana Dance Ensemble frontage', axis: [1, 0], origin: DO, storey: 3.3, style: PLAIN, roofColor: '#9c5236', fascia: '#4a3328', pitch: 0.45, plinth: RED_BASE,
  replaces: DANCE ? [centre(DANCE)] : [],
  onGround: true,
  blocks: [],
  keep: [[672 - DO[0], 694 - DO[0], 160 - DO[1], 199 - DO[1]]],
  extras: (k: Kit) => {
    if (!DANCE) return;
    const b = new Bag(DO), y = gh(677, 178), X0 = 673.4, X1 = 680.9, Z0 = 162.7, ZT = 170.4, Z1 = 193.8, e = y + 3.3, ov = 0.9;
    const M = (x: number, z: number): [number, number] => [x - DO[0], z - DO[1]];
    // the low range: white over the red-brown base, the weathered red-tile roof hipped at the south end
    b.c.push([b.B(X0, X1, y - 0.3, e, ZT, Z1), WALL], [b.B(X0 - 0.04, X1 + 0.04, y - 0.3, y + 0.9, ZT, Z1 + 0.04), '#8c3a2a']);
    k.roof.c = new THREE.Color('#9c5236');
    hipRoof(k, M, X0 - ov, X1 + ov, ZT - 0.2, Z1 + ov, e - ov * 0.45, 0.45, 'z', [{ gw: 99, tri: false }, { gw: 0, tri: false }], b.c, '#4a3328');
    b.c.push([b.B(X0 - ov, X1 + ov, e - ov * 0.45 - 0.06, e - ov * 0.45, ZT, Z1 + ov), SOFF]);
    // the deep dark passage through the middle of the front: square piers, the dark grilles behind them
    const P0 = 179.0, P1 = 186.4, depth = 2.2;
    b.c.push([b.B(X1 - depth, X1 - depth + 0.1, y - 0.3, e - 0.3, P0, P1), '#1f2224']);
    b.grille.push(b.plane(false, X1 - depth + 0.12, 1, (P0 + P1) / 2, P1 - P0 - 0.2, y + 0.1, e - 0.6));
    b.c.push([b.B(X1 - depth, X1 + 0.02, e - 0.6, e, P0, P1), '#efece4']);
    for (const z of [P0, P0 + (P1 - P0) / 3, P0 + (2 * (P1 - P0)) / 3, P1]) { b.c.push([b.B(X1 - 0.5, X1 + 0.05, y - 0.3, e - 0.6, z - 0.28, z + 0.28), '#f1eee6'], [b.B(X1 - 0.52, X1 + 0.07, y - 0.3, y + 0.9, z - 0.3, z + 0.3), '#8c3a2a']); SOLIDS.add(X1 - 0.2, z, 0.3); }
    b.c.push([b.B(X1 - depth, X1 - 0.5, y - 0.3, y + 0.05, P0, P1), '#9e9a92']);
    // dark windows either side, a door, an AC unit
    const F = facesOf([X0, X1, ZT, Z1]);
    openings(b, { ...F.x1, a0: ZT, a1: P0 - 0.4 }, 'WAW', y);
    openings(b, { ...F.x1, a0: P1 + 0.4, a1: Z1 }, 'WDW', y);
    openings(b, F.z1, 'W-', y); openings(b, F.x0, 'W-WW-WW-W', y);
    // the taller two-storey gable-ended block at the north end: its gable toward the road with the round high vent,
    // the glazed notice boards on its front
    const e2 = y + 6.6, half = (ZT - Z0) / 2;
    b.c.push([b.B(X0 - 0.2, X1 + 0.2, y - 0.3, e2, Z0, ZT), '#f3f0e8'], [b.B(X0 - 0.24, X1 + 0.24, y - 0.3, y + 0.9, Z0 - 0.04, ZT + 0.04), '#8c3a2a']);
    hipRoof(k, M, X0 - 0.9, X1 + 1.3, Z0 - 0.6, ZT + 0.6, e2 - 0.3, 0.5, 'x', [{ gw: 99, tri: false }, { gw: 99, tri: false }], b.c, '#4a3328');
    for (const [x, out] of [[X1 + 0.2, 1], [X0 - 0.2, -1]] as [number, number][]) gableTri(b, false, x, out, Z0, ZT, e2, (0.5 * (half + 0.6)) / half * 0.97, '#f3f0e8');
    b.c.push([new THREE.CylinderGeometry(0.55, 0.55, 0.12, 20).rotateZ(Math.PI / 2).translate(X1 + 0.24 - DO[0], e2 + 1.0, (Z0 + ZT) / 2 - DO[1]), '#1e2124']);
    b.c.push([new THREE.TorusGeometry(0.6, 0.07, 6, 20).rotateY(Math.PI / 2).translate(X1 + 0.28 - DO[0], e2 + 1.0, (Z0 + ZT) / 2 - DO[1]), '#e9e5dc']);
    for (let f = 0; f < 2; f++) for (const z of [Z0 + 1.6, ZT - 1.6]) b.win.push(b.plane(false, X1 + 0.22, 1, z, 1.3, y + 1.0 + f * 3.3, y + 2.3 + f * 3.3));
    for (const z of [Z0 + 3.3, Z0 + 4.8]) board(b, k, noticeTex(), X1 + 0.23, y + 1.55, z, 1.3, 0.98, Math.PI / 2);
    b.c.push([b.B(X1 + 0.2, X1 + 0.28, y + 0.95, y + 2.15, Z0 + 2.5, Z0 + 5.6), '#2b2d2f']);
    openings(b, facesOf([X0 - 0.2, X1 + 0.2, Z0, ZT]).z0, 'W-W', y);
    wallSolids(X0, ZT, X0, Z1); wallSolids(X0, Z1, X1, Z1); wallSolids(X1, Z1, X1, P1); wallSolids(X1 - depth, P0, X1 - depth, P1); wallSolids(X1, P0, X1, ZT);
    wallSolids(X0 - 0.2, Z0, X1 + 0.2, Z0); wallSolids(X1 + 0.2, Z0, X1 + 0.2, ZT); wallSolids(X0 - 0.2, Z0, X0 - 0.2, ZT);
    // ---- before it: shaded uneven grass with worn earth, the low stone-edged planted bed, a conical shrub, the gravel
    // heap at the south end, broad-canopy trees and palms ----
    k.meshes.push(new THREE.Mesh(drapeAt(DO, 681.2, 694, 160, 198, 0.6, 0.035, (x, z) => {
      const n = vnoise(x * 0.3, z * 0.3), m = hash(Math.floor(x * 2), Math.floor(z * 2)) * 0.05;
      if (n < 0.3) return [0.58 + m, 0.42 + m, 0.28];
      if (n > 0.8) return [0.62 - m, 0.6 - m, 0.55 - m];
      return null;
    }), groundCover()));
    const [bx0, bx1, bz0, bz1] = [684.0, 688.0, 171.0, 177.5], by = gh(686, 174);
    for (const [x0, x1, z0, z1] of [[bx0, bx1, bz0, bz0 + 0.3], [bx0, bx1, bz1 - 0.3, bz1], [bx0, bx0 + 0.3, bz0, bz1], [bx1 - 0.3, bx1, bz0, bz1]]) b.c.push([b.B(x0, x1, by - 0.1, by + 0.35, z0, z1), '#a99f8c']);
    k.meshes.push(new THREE.Mesh(drapeAt(DO, bx0 + 0.3, bx1 - 0.3, bz0 + 0.3, bz1 - 0.3, 0.3, 0.3, () => [0.36, 0.28, 0.2]), groundCover()));
    for (let i = 0; i < 8; i++) b.leaf.push([new THREE.IcosahedronGeometry(0.35 + hash(i, 2) * 0.2, 0).translate(bx0 + 0.8 + (i % 4) * 0.8 - DO[0], by + 0.6, bz0 + 1.2 + Math.floor(i / 4) * 3.6 - DO[1]), ['#c64a3a', '#3f6d2c', '#e0b43a', '#527f33'][i % 4]]);
    wallSolids(bx0, (bz0 + bz1) / 2, bx1, (bz0 + bz1) / 2, 1.0);
    b.leaf.push([new THREE.ConeGeometry(0.9, 2.6, 9).translate(686 - DO[0], gh(686, 181) + 1.3, 181 - DO[1]), '#355f2a']); SOLIDS.add(686, 181, 0.6);
    k.meshes.push(new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.3, 0.5, 1).translate(689 - DO[0], gh(689, 192) - 0.05, 192 - DO[1]), new THREE.MeshStandardMaterial({ color: '#a59d90', roughness: 1 })));
    SOLIDS.add(689, 192, 1.4);
    for (const [x, z, h, s] of [[690.5, 164, 9.5, 14], [691, 198.5, 9, 13], [684.5, 158.5, 8, 10]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x * 4 + z, origin: DO });
    fanPalm(b, 688.5, 185.5, 8.5, 3); fanPalm(b, 683.2, 167.5, 7.5, 5);
    b.finish(k, 0.4);
  },
};

// ---------- the unfinished concrete frame north of the Jones-Quartey parking, the carport (pair 8) ----------
const FRAME = footprint(547.4, 599.3, -144.5, -96.4);
const FO: [number, number] = [578, -120];
const frameSpec: Spec = {
  name: 'Unfinished frame north of the Jones-Quartey Building', axis: [1, 0], origin: FO, storey: 3.4, style: PLAIN, roofColor: '#9a968e', fascia: '#9a968e', pitch: 0.1,
  replaces: FRAME ? [centre(FRAME)] : [],
  onGround: true,
  blocks: [],
  keep: [[545 - FO[0], 625 - FO[0], -146 - FO[1], -44 - FO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(FO), CON = '#9d998f', CON2 = '#8e8a80', levels = 4, fh = 3.4;
    if (FRAME) {
      const y = Math.min(gh(560, -100), gh(595, -100), gh(560, -140), gh(595, -140));
      // exposed columns on a grid, slabs with bare edges at each level, beams round the bays; open air between, no
      // walls, glazing or roof: the top level is columns with bars standing out of them
      for (const r of rectsOf(ringOf(FRAME))) {
        const [x0, x1, z0, z1] = r, nx = Math.max(1, Math.round((x1 - x0) / 6)), nz = Math.max(1, Math.round((z1 - z0) / 6));
        for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) {
          const x = Math.min(x1 - 0.25, Math.max(x0 + 0.25, x0 + ((x1 - x0) * i) / nx)), z = Math.min(z1 - 0.25, Math.max(z0 + 0.25, z0 + ((z1 - z0) * j) / nz));
          b.c.push([b.B(x - 0.22, x + 0.22, y - 0.3, y + levels * fh + 1.0, z - 0.22, z + 0.22), (i + j) % 3 ? CON : CON2]);
          for (const d of [-0.12, 0.12]) b.c.push([b.B(x + d - 0.015, x + d + 0.015, y + levels * fh + 1.0, y + levels * fh + 1.7, z - 0.015, z + 0.015), '#6b4a36']);
          if (i === 0 || j === 0 || i === nx || j === nz) SOLIDS.add(x, z, 0.35);
        }
        for (let l = 1; l <= levels; l++) {
          const yy = y + l * fh;
          b.c.push([b.B(x0, x1, yy - 0.2, yy, z0, z1), l % 2 ? CON : '#a4a096']);
          for (let i = 0; i <= nx; i++) { const x = x0 + ((x1 - x0) * i) / nx; b.c.push([b.B(Math.max(x0, x - 0.18), Math.min(x1, x + 0.18), yy - 0.6, yy - 0.2, z0, z1), CON2]); }
          for (let j = 0; j <= nz; j++) { const z = z0 + ((z1 - z0) * j) / nz; b.c.push([b.B(x0, x1, yy - 0.6, yy - 0.2, Math.max(z0, z - 0.18), Math.min(z1, z + 0.18)), CON2]); }
        }
        b.c.push([b.B(x0, x1, y - 0.3, y + 0.1, z0, z1), '#a7a399']);
      }
      // a stair core of blockwork rising through the frame, unrendered
      b.c.push([b.B(586.0, 591.0, y - 0.3, y + levels * fh + 0.6, -112.8, -106.8), '#8b8478']);
      wallSolids(586, -112.8, 591, -112.8); wallSolids(586, -106.8, 591, -106.8);
    }
    // the light carport on the parking court's east side: thin posts along the edge, a shallow sheet roof over the bays
    const cz0 = -80.5, cz1 = -51.5, px = 616.4, cy = gh(613, -66);
    for (let z = cz0; z <= cz1 + 0.01; z += (cz1 - cz0) / 5) {
      b.c.push([b.B(px - 0.06, px + 0.06, cy, cy + 2.95, z - 0.06, z + 0.06), '#7d848a'], [new THREE.BoxGeometry(5.6, 0.1, 0.08).translate(613.7 - FO[0], cy + 2.85, z - FO[1]), '#7d848a']);
      SOLIDS.add(px, z, 0.1);
    }
    b.c.push([new THREE.BoxGeometry(6.2, 0.05, cz1 - cz0 + 0.8).rotateZ(-0.06).translate(613.6 - FO[0], cy + 3.05, (cz0 + cz1) / 2 - FO[1]), '#b8bcbf']);
    for (let z = cz0 + 3; z < cz1; z += 5.8) car(k, 613.4 - FO[0], z - FO[1], ['#2a5fa8', '#c9ccd0', '#2b2e33', '#a42c2c', '#e4e4e0'][Math.floor(hash(z, 2) * 5)], gh(613.4, z), Math.PI / 2);
    b.finish(k, 0.5);
  },
};

// ---------- the overhead crossing: the island's chevrons and the keep-right sign (pair 9) ----------
const XO: [number, number] = [758, 124];
const crossingSpec: Spec = {
  name: 'Overhead crossing island signs', axis: [1, 0], origin: XO, storey: 3, style: PLAIN, roofColor: '#888', fascia: '#888', pitch: 0.1,
  onGround: true,
  blocks: [],
  keep: [],
  extras: (k: Kit) => {
    const b = new Bag(XO), R = CUT.ring;
    // the island's raised stone edge along the top of the ring's inner side, west of the cutting
    const at = (deg: number, r: number): [number, number] => [R.x + Math.cos((deg * Math.PI) / 180) * r, R.z + Math.sin((deg * Math.PI) / 180) * r];
    for (let a = 146; a < 214; a += 4) {
      const [ax, az] = at(a, R.r + 1.45), [cx, cz] = at(a + 4, R.r + 1.45), ya = gh(ax, az), yc = gh(cx, cz);
      const len = Math.hypot(cx - ax, cz - az);
      b.c.push([new THREE.BoxGeometry(len + 0.05, 0.3, 0.35).rotateY(-Math.atan2(cz - az, cx - ax)).translate((ax + cx) / 2 - XO[0], (ya + yc) / 2 + 0.1, (az + cz) / 2 - XO[1]), a % 8 ? '#9b958a' : '#8a857b']);
    }
    // the level island in front of the slope: stone gravel heaped in a semicircle between the ring's kerb and a low
    // concrete parapet at the top of the slope (the owner's correction, from the street view: picture 4)
    const ri = R.r - R.shelf, onIsle = (x: number, z: number) => { const d = Math.hypot(x - R.x, z - R.z); return d > ri + 0.15 && d < R.r + 1.3 && x < R.x - 6 && !deckAt(x, z) && !deckAt(x, z - 1) && !deckAt(x, z + 1); };
    k.meshes.push(new THREE.Mesh(drapeAt(XO, R.x - R.r - 2, R.x - 6, R.z - R.r, R.z + R.r, 0.3, 0.14, (x, z) => {
      if (!onIsle(x, z)) return null;
      const h = hash(Math.floor(x * 6), Math.floor(z * 6)), n = vnoise(x * 1.3, z * 1.3);
      return [0.55 + h * 0.18 - n * 0.06, 0.53 + h * 0.16 - n * 0.06, 0.5 + h * 0.15 - n * 0.06];
    }), groundCover()));
    for (let i = 0; i < 180; i++) {
      const a = (138 + hash(i, 3) * 84) * (Math.PI / 180), r = ri + 0.4 + hash(i, 5) * (R.shelf - 0.9), x = R.x + Math.cos(a) * r, z = R.z + Math.sin(a) * r;
      if (!onIsle(x, z)) continue;
      const s = 0.07 + hash(i, 7) * 0.12;
      b.c.push([new THREE.IcosahedronGeometry(s, 0).translate(x - XO[0], gh(x, z) + 0.12 + s * 0.3, z - XO[1]), ['#a8a29a', '#8f8a82', '#bdb6aa', '#77736d'][i % 4]]);
    }
    for (let a = 140; a < 220; a += 3) {
      const [ax, az] = at(a, ri + 0.05), [cx, cz] = at(a + 3, ri + 0.05);
      if (!onIsle(ax, az) && !onIsle(cx, cz) && !onIsle((ax + cx) / 2 + 0.3, (az + cz) / 2)) continue;
      const len = Math.hypot(cx - ax, cz - az), ya = gh(ax + 0.2, az);
      b.c.push([new THREE.BoxGeometry(len + 0.04, 0.75, 0.25).rotateY(-Math.atan2(cz - az, cx - ax)).translate((ax + cx) / 2 - XO[0], ya + 0.25, (az + cz) / 2 - XO[1]), '#b3ada2']);
      SOLIDS.add((ax + cx) / 2, (az + cz) / 2, 0.2);
    }
    // the chevron boards facing the traffic coming round off Danquah Avenue, on two posts each
    for (const a of [160, 172, 184, 196]) {
      const [x, z] = at(a, R.r - 1.1), yy = gh(x, z), ry = Math.PI / 2 - (a * Math.PI) / 180;
      for (const s of [-0.45, 0.45]) { const px = x + Math.sin((a * Math.PI) / 180) * s, pz = z - Math.cos((a * Math.PI) / 180) * s; b.c.push([b.B(px - 0.04, px + 0.04, yy, yy + 1.6, pz - 0.04, pz + 0.04), '#8f959a']); SOLIDS.add(px, pz, 0.08); }
      board(b, k, chevronTex(), x + Math.cos((a * Math.PI) / 180) * 0.06, yy + 1.25, z + Math.sin((a * Math.PI) / 180) * 0.06, 1.2, 0.6, ry);
    }
    // the ring road's west arc between the island and the gate plaza is a broad two-lane curve: asphalt carried out to
    // the plaza's edge (the owner's correction: the space left there was a single narrow lane)
    const RING_W: [number, number][] = [[756.5, 113], [753.7, 118.6], [752.4, 124.7], [752.8, 131], [754.8, 137], [758.3, 142.2]];
    const wx = (z: number) => { for (let i = 0; i < RING_W.length - 1; i++) { const [ax, az] = RING_W[i], [cx, cz] = RING_W[i + 1]; if (z >= az && z <= cz) return ax + ((cx - ax) * (z - az)) / (cz - az); } return NaN; };
    k.meshes.push(new THREE.Mesh(drapeAt(XO, 745.6, 756, 113.5, 142, 0.25, 0.012, (x, z) => {
      const c = wx(z);
      if (Number.isNaN(c) || x > c - 2.4 || x < 745.7) return null;
      const n = vnoise(x * 0.4, z * 0.4) * 0.03, h = hash(Math.floor(x * 3), Math.floor(z * 3)) * 0.03;
      return [0.33 + n + h, 0.33 + n + h, 0.34 + n + h];
    }), groundCover()));
    for (let z = 114.6; z < 138.5; z += 1.5) { const x = 745.6, y = gh(x, z); b.c.push([b.B(x - 0.15, x + 0.05, y - 0.1, y + 0.14, z, z + 1.5), '#d3cec4']); }
    // the keep-right sign at the island's nose toward Danquah Avenue
    const KA = (212 * Math.PI) / 180, [kx, kz] = at(212, R.r - 0.6), ky = gh(kx, kz);
    b.c.push([b.B(kx - 0.04, kx + 0.04, ky, ky + 2.2, kz - 0.04, kz + 0.04), '#8f959a']); SOLIDS.add(kx, kz, 0.08);
    const sign = new THREE.Mesh(new THREE.CircleGeometry(0.38, 24).rotateY(Math.PI / 2 - KA).translate(kx + Math.cos(KA) * 0.06 - XO[0], ky + 2.0, kz + Math.sin(KA) * 0.06 - XO[1]), new THREE.MeshBasicMaterial({ map: keepRightTex(), transparent: true }));
    k.meshes.push(sign);
    b.finish(k, 0.3);
  },
};
void TILE; void hash;

export const tenPairsSite = createSite('ten-pairs', [bankSpec, parcelSpec, gmiSpec, danceSpec, frameSpec, crossingSpec, clusterSpec]);
