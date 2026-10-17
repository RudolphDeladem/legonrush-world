// The old residence by the road east of Bani's south end (the owner, 2026-10-17: the three small buildings drawn
// there as two-storey blocks are one storey, one compound, its plan the owner's satellite crop, picture 2). Read off
// picture 2 (north up, 0.181 m to a pixel, set on the three mapped outlines x 860.5-889.5, z -1185.5..-1154.4): a long
// west wing; a south wing joining it; an east block; a south-east section whose west half is roofed in newer pale
// sheet; the sandy courtyard they close, a pale lean-to sheet along its west side; the big tree over the north side
// and a smaller one at the south-east corner; the road junction to the north-east and the dirt track down the east.
// Rusted corrugated roofs, faded and stained render, old timber and grilled windows. It is somebody's house: a compound
// wall closes the north side under the tree, the vehicle gate in it toward the road junction, a small gate in the east
// wall toward the track (the gates' places are not shown by the picture; chosen where the road and track are).
import * as THREE from 'three';
import { createSite, type Spec, type Style } from './blocks';
import { box, canvas, speckle, tri2, type Part } from './modelkit';
import { SOLIDS } from './solids';
import { wallSolids } from './enkit';

type P2 = [number, number];
const O: P2 = [875, -1170];
/** picture 2 to the game: x = 860.5 + (px - 35) 0.181, z = -1185.5 + (py - 53) 0.181 (model frame: minus O) */
const px = (p: number) => 860.5 + (p - 35) * 0.181 - O[0], pz = (p: number) => -1185.5 + (p - 53) * 0.181 - O[1];
const ST = 3.0, EAVE = 0.4 + ST + 0.4;
const rnd = (i: number) => { const s = Math.sin(i * 91.7 + 13.3) * 43758.5453; return s - Math.floor(s); };

// ---------- the aged render ----------
/** faded cream, blotched, rain streaks from the eaves, splash and mould along the foot */
function aged(g: CanvasRenderingContext2D, seed: number) {
  g.fillStyle = '#d6c8a4'; g.fillRect(0, 0, 256, 512);
  speckle(g, 0, 0, 256, 512, 2600, ['#cdbf9b', '#ddd0ae', '#c7b894', '#e2d6b6']);
  for (let i = 0; i < 9; i++) { const x = rnd(seed + i) * 256, y = 256 + rnd(seed + i + 40) * 200, r = 10 + rnd(seed + i + 80) * 26; g.fillStyle = `rgba(${i % 2 ? '150,128,90' : '235,226,200'},0.28)`; g.beginPath(); g.ellipse(x, y, r * 1.4, r, 0, 0, Math.PI * 2); g.fill(); }
  for (let i = 0; i < 26; i++) { const x = rnd(seed + i + 200) * 256, l = 30 + rnd(seed + i + 300) * 120; const gr = g.createLinearGradient(0, 256, 0, 256 + l); gr.addColorStop(0, 'rgba(90,70,45,0.32)'); gr.addColorStop(1, 'rgba(90,70,45,0)'); g.fillStyle = gr; g.fillRect(x, 256, 2 + rnd(i) * 4, l); }
  const foot = g.createLinearGradient(0, 512, 0, 430); foot.addColorStop(0, 'rgba(95,80,50,0.75)'); foot.addColorStop(0.5, 'rgba(85,95,55,0.3)'); foot.addColorStop(1, 'rgba(95,80,50,0)'); g.fillStyle = foot; g.fillRect(0, 430, 256, 82);
}
/** an old window: weathered timber frame, faded grey-brown louvre blades, rusty bars in front, a stain under its sill */
function oldWindow(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  g.fillStyle = 'rgba(80,60,35,0.35)'; g.fillRect(x + 6, y + h, w - 12, 50);
  g.fillStyle = '#7a6448'; g.fillRect(x - 6, y - 6, w + 12, h + 12);
  g.fillStyle = '#4a4036'; g.fillRect(x, y, w, h);
  for (let t = y + 4; t < y + h - 3; t += 8) { g.fillStyle = '#8c8270'; g.fillRect(x + 2, t, w - 4, 4); }
  g.fillStyle = '#6e4a32'; for (let t = x + 8; t < x + w; t += 14) g.fillRect(t, y, 3, h);
  g.fillStyle = '#b9ab88'; g.fillRect(x - 10, y + h + 4, w + 20, 7);
}
/** an old door: faded painted timber (blue-green or brown), its panels, the worn foot */
function oldDoor(g: CanvasRenderingContext2D, x: number, w: number, col: string) {
  const y = 256 + 70, h = 512 - 30 - y;
  g.fillStyle = '#6f5a40'; g.fillRect(x - 6, y - 6, w + 12, h + 6);
  g.fillStyle = col; g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x + 8, y + 10, w - 16, h * 0.4); g.fillRect(x + 8, y + h * 0.52, w - 16, h * 0.4);
  speckle(g, x, y, w, h, 160, ['rgba(220,210,190,0.5)', 'rgba(60,45,30,0.4)']);
  g.fillStyle = '#c9b46a'; g.fillRect(x + w - 12, y + h * 0.5, 5, 10);
}
/** outer faces: a small window a bay; the courtyard faces: a door and a window a bay */
const OUTER: Style = { bay: 3.4, up: [], ground: [], draw: (g) => { aged(g, 7); oldWindow(g, 92, 256 + 80, 72, 92); } };
const COURT: Style = { bay: 3.6, up: [], ground: [], draw: (g) => { aged(g, 19); oldDoor(g, 30, 64, '#4f6f66'); oldWindow(g, 140, 256 + 80, 86, 92); } };
const BLANK: Style = { bay: 4, up: [], ground: [], draw: (g) => aged(g, 31) };

// ---------- the rusted corrugated sheet ----------
const sheet = (base: [number, number, number], rust: number) => {
  const t = canvas(256, 256, (g) => {
    g.fillStyle = `rgb(${base.join(',')})`; g.fillRect(0, 0, 256, 256);
    for (let x = 0; x < 256; x += 8) { g.fillStyle = 'rgba(255,240,220,0.12)'; g.fillRect(x, 0, 3, 256); g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(x + 5, 0, 2, 256); }
    for (let i = 0; i < 70 * rust; i++) { const x = rnd(i + 500) * 256, y = rnd(i + 900) * 256, r = 4 + rnd(i + 1300) * 22; g.fillStyle = i % 3 ? 'rgba(92,42,20,0.45)' : 'rgba(170,90,40,0.4)'; g.beginPath(); g.ellipse(x, y, r * 0.6, r, 0, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 30 * rust; i++) { const x = rnd(i + 1700) * 256; g.fillStyle = 'rgba(70,30,15,0.3)'; g.fillRect(x, rnd(i + 1900) * 200, 3, 40 + rnd(i) * 60); }
    // the laps between sheets
    for (let y = 0; y < 256; y += 128) { g.fillStyle = 'rgba(40,20,10,0.4)'; g.fillRect(0, y, 256, 3); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.85, metalness: 0.15, side: THREE.DoubleSide });
};
let RUST: THREE.MeshStandardMaterial | null = null, PALE: THREE.MeshStandardMaterial | null = null;
const rustMat = () => (RUST ??= sheet([108, 60, 40], 1.3));
const paleMat = () => (PALE ??= sheet([196, 196, 190], 0.25));

/** a low gable of corrugated sheet over a box (ridge along z or x), overhanging, the gable ends in the aged render */
function gable(k: { meshes: THREE.Mesh[]; plain: Part[] }, x0: number, x1: number, z0: number, z1: number, alongZ: boolean, mat: THREE.Material, pitch = 0.22, ov = 0.45) {
  const w = alongZ ? x1 - x0 : z1 - z0, L = (alongZ ? z1 - z0 : x1 - x0) + 2 * ov, run = w / 2 + ov, rise = pitch * run, slope = Math.hypot(run, rise), ang = Math.atan2(rise, run);
  const ridge = EAVE + pitch * (w / 2), xm = (x0 + x1) / 2, zm = (z0 + z1) / 2;
  for (const s of [-1, 1]) {
    const g = alongZ ? new THREE.BoxGeometry(slope, 0.05, L).rotateZ(s * ang).translate(xm + (s * run) / 2, ridge - rise / 2 + 0.02, zm)
      : new THREE.BoxGeometry(L, 0.05, slope).rotateX(-s * ang).translate(xm, ridge - rise / 2 + 0.02, zm + (s * run) / 2);
    const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (alongZ ? slope : L) / 2, uv.getY(i) * (alongZ ? L : slope) / 2);
    const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  }
  const end = (a: [number, number, number], b: [number, number, number], c: [number, number, number]) => k.plain.push([tri2(a, b, c), '#cfc09b'], [tri2(b, a, c), '#cfc09b']);
  if (alongZ) for (const z of [z0, z1]) end([x0, EAVE, z], [x1, EAVE, z], [xm, ridge, z]);
  else for (const x of [x0, x1]) end([x, EAVE, z0], [x, EAVE, z1], [x, ridge, zm]);
}

// the parts of the house (model frame), from picture 2
const W = { x0: px(35), x1: px(67), z0: pz(53), z1: pz(213) };
const S = { x0: px(67), x1: px(115), z0: pz(180), z1: pz(213) };
const E = { x0: px(135), x1: px(195), z0: pz(98), z1: pz(180) };
const SE = { x0: px(115), x1: px(195), z0: pz(180), z1: pz(225) };
const SE_PALE = px(163);

const house: Spec = {
  name: 'Old residence by the road east of Bani', axis: [1, 0], origin: O, storey: ST, style: OUTER, roofColor: '#7a3e26', fascia: '#8a7458', pitch: 0.22,
  // the three mapped outlines the generic blocks stood on
  replaces: [[866, -1170], [881.5, -1181.5], [883, -1165]],
  plinth: '#8f8468',
  blocks: [
    { ...W, floors: 1, roof: 'none', faces: { x1: COURT, z0: BLANK } },
    { ...S, floors: 1, roof: 'none', faces: { z0: COURT, x0: BLANK } },
    { ...E, floors: 1, roof: 'none', faces: { x0: COURT, z1: BLANK } },
    { ...SE, floors: 1, roof: 'none', faces: { z0: COURT, x0: BLANK } },
  ],
  keep: [[px(20), px(240), pz(0), pz(240)]],
  extras: (k) => {
    const p: Part[] = [];
    // the rusted roofs; the south-east section's west half in newer pale sheet (picture 2's white facet)
    gable(k, W.x0, W.x1, W.z0, W.z1, true, rustMat());
    gable(k, S.x0 - 0.3, S.x1, S.z0, S.z1, false, rustMat());
    gable(k, E.x0, E.x1, E.z0, E.z1, true, rustMat());
    gable(k, SE.x0, SE_PALE, SE.z0, SE.z1, false, paleMat());
    gable(k, SE_PALE, SE.x1, SE.z0, SE.z1, false, rustMat());
    // a faded patch of replaced sheet on the east block (picture 2's light square)
    p.push([box(px(137), px(153), EAVE + 0.75, EAVE + 0.8, pz(143), pz(172)), '#9d9a92']);
    // the sagging timber fascia boards
    for (const b of [W, S, E, SE]) for (const z of [b.z0 - 0.45, b.z1 + 0.45]) p.push([box(b.x0 - 0.45, b.x1 + 0.45, EAVE - 0.22, EAVE, z - 0.03, z + 0.03), '#6a5640']);
    // the courtyard: sandy, a few weeds; the pale lean-to sheet along its west side on thin posts
    const cx0 = W.x1, cx1 = E.x0, cz0 = pz(85), cz1 = S.z0;
    p.push([box(cx0, cx1, 0, 0.04, cz0, cz1), '#c8b28a'], [box(cx0, E.x1, 0, 0.04, W.z0, cz0), '#a99a76']);
    for (let i = 0; i < 14; i++) { const x = cx0 + 0.6 + rnd(i) * (cx1 - cx0 - 1.2), z = cz0 + 0.6 + rnd(i + 60) * (cz1 - cz0 - 1.2); p.push([new THREE.IcosahedronGeometry(0.25 + rnd(i + 9) * 0.3, 0).scale(1, 0.6, 1).translate(x, 0.12, z), i % 2 ? '#6f7a3c' : '#5b6b32']); }
    { const x1 = px(80), z0 = pz(105), z1 = pz(155), h = 2.5;
      const g = new THREE.BoxGeometry(x1 - cx0 + 0.3, 0.04, z1 - z0).rotateZ(-0.12).translate((cx0 + x1) / 2, h, (z0 + z1) / 2);
      const m = new THREE.Mesh(g, paleMat()); m.castShadow = true; k.meshes.push(m);
      for (const z of [z0 + 0.2, (z0 + z1) / 2, z1 - 0.2]) { p.push([box(x1 - 0.05, x1 + 0.05, 0, h - 0.1, z - 0.05, z + 0.05), '#5a4a3a']); SOLIDS.add(O[0] + x1, O[1] + z, 0.12); } }
    // the compound wall: along the north side under the tree, down the east side to the east block; old rendered block,
    // stained, a coping; the vehicle gate in the north wall toward the road junction, a pedestrian gate in the east wall
    const WH = 2.1, gx0 = px(150), gx1 = px(150) + 4.2, gz0 = pz(68), gz1 = gz0 + 1.1;
    const wall = (a: P2, b: P2) => {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = -Math.atan2(b[1] - a[1], b[0] - a[0]), mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
      p.push([new THREE.BoxGeometry(L, WH, 0.22).rotateY(ang).translate(mx, WH / 2, mz), '#c8b994'], [new THREE.BoxGeometry(L + 0.1, 0.1, 0.3).rotateY(ang).translate(mx, WH + 0.05, mz), '#a89a7a']);
      p.push([new THREE.BoxGeometry(L, 0.5, 0.24).rotateY(ang).translate(mx, 0.25, mz), '#8a7c5c']);
      wallSolids(a[0] + O[0], a[1] + O[1], b[0] + O[0], b[1] + O[1], 0.25);
    };
    const n = W.z0, xe = E.x1;
    wall([W.x1, n], [gx0 - 0.25, n]); wall([gx1 + 0.25, n], [xe, n]); wall([xe, n], [xe, gz0 - 0.15]); wall([xe, gz1 + 0.15], [xe, E.z0]);
    // gate piers, then the two sheet-steel leaves of the vehicle gate (faded green over rust), closed
    for (const x of [gx0 - 0.25, gx1 + 0.25]) { p.push([box(x - 0.25, x + 0.25, 0, 2.5, n - 0.25, n + 0.25), '#c2b28c'], [box(x - 0.3, x + 0.3, 2.5, 2.6, n - 0.3, n + 0.3), '#a89a7a']); SOLIDS.add(x + O[0], n + O[1], 0.3); }
    for (const [a, b] of [[gx0, (gx0 + gx1) / 2 - 0.02], [(gx0 + gx1) / 2 + 0.02, gx1]]) {
      p.push([box(a, b, 0.08, 2.2, n - 0.03, n + 0.03), '#4d6a52']);
      for (let x = a + 0.15; x < b; x += 0.45) p.push([box(x - 0.02, x + 0.02, 0.08, 2.2, n - 0.05, n + 0.05), '#3f5a45']);
      for (const y of [0.1, 1.1, 2.15]) p.push([box(a, b, y - 0.04, y + 0.04, n - 0.06, n + 0.06), '#3a4f3d']);
      for (let i = 0; i < 8; i++) { const x = a + rnd(i + a) * (b - a), y = 0.2 + rnd(i + 30 + a) * 1.8; p.push([box(x - 0.07, x + 0.07, y - 0.12, y + 0.12, n - 0.065, n + 0.065), '#5e4331']); }
    }
    wallSolids(gx0 + O[0], n + O[1], gx1 + O[0], n + O[1], 0.25);
    // the pedestrian gate in the east wall: a narrow steel leaf, closed
    for (const z of [gz0 - 0.15, gz1 + 0.15]) p.push([box(xe - 0.2, xe + 0.2, 0, 2.4, z - 0.2, z + 0.2), '#c2b28c']);
    p.push([box(xe - 0.03, xe + 0.03, 0.08, 2.1, gz0, gz1), '#4d6a52'], [box(xe + 0.03, xe + 0.06, 1.0, 1.1, gz1 - 0.2, gz1 - 0.1), '#2e2e2e']);
    wallSolids(xe + O[0], gz0 + O[1], xe + O[0], gz1 + O[1], 0.2);
    // the big tree over the north side (outside the wall) and the smaller one at the south-east corner
    const tree = (x: number, z: number, r: number, h: number) => {
      p.push([new THREE.CylinderGeometry(0.28, 0.45, h, 8).translate(x, h / 2, z), '#5a4634']);
      for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, d = i ? r * 0.55 : 0; p.push([new THREE.IcosahedronGeometry(r * (i ? 0.5 : 0.62), 1).scale(1, 0.6, 1).translate(x + Math.cos(a) * d, h + 1.2 + rnd(i + x) * 1.2, z + Math.sin(a) * d), ['#3c6a2c', '#467634', '#335d26'][i % 3]]); }
      SOLIDS.add(x + O[0], z + O[1], 0.45);
    };
    tree(px(120), pz(30), 7, 4.5);
    tree(px(205), pz(178), 3.2, 3.2);
    k.plain.push(...p);
  },
};

/** the old residence (picture 2) */
export const oldHouseSite = createSite('old-residence-east-of-bani', [house]);
