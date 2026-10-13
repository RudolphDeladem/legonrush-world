// The Commonwealth west tennis complex (the owner's Commonwealth west tennis court brief; numbers in tennisplan.ts,
// evidence in docs/tennis-west/evidence-audit.md). The game drew the two mapped pitches here as striped football grass on
// an open lawn under a few orange-crowned trees. The references show a sunken sports terrace in a clearing of dense
// mature trees:
// - one level floor cut into the hill's slope, held on every side by retaining walls of irregular tan, grey and reddish
//   stones in mortar, their exposed height stepping along each side (higher at the corners, lower along the side runs),
//   grass and trees on the higher ground behind them (Pictures 1, 4, 5, 7);
// - west, the hard court: a faded blue playing rectangle in a pale green run-off, thin white lines (doubles and singles
//   sidelines, baselines, service lines, the centre service line), heavily worn (tan and grey patches, scuffs, fine
//   cracks), one net with green posts, dark fine mesh, a pale top tape and a gentle sag (Pictures 1-7: one court seen in
//   successive video frames, not seven);
// - east, the red-soil ground: matte orange-red earth with pale lines, sweep and foot marks, two courts side by side with
//   their own nets (Picture 8), and on east of them more red ground to the trees (Picture 12; no lines are visible there,
//   so none are drawn); the tall slender lattice mast and the chair-like frame at its west edge, drawn plainly;
// - all round, tall chain-link mesh on thin grey posts just inside the walls, diagonal braces at the corners and by the
//   nets (Pictures 1, 4, 5), vines on the red-soil side's fence (Picture 8);
// - the tree belt: broad mature crowns close behind the fence on the north, west and east (one ring; the belt beyond
//   is ghlandscape.ts's instanced crowns), shrubs at the walls' tops, and
//   south the three round trees between the courts and the lawn down to the road (Picture 12); further out the belt is
//   instanced crowns from the aerial (ghlandscape.ts, the same kit as the Great Hall's landscape).
// The fence closes the complex: the pictures show no gate, stair or ramp, so none is invented (an open question).
import * as THREE from 'three';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { canvas, merge, type Part } from './modelkit';
import { Bag, hash, vnoise, wallSolids } from './enkit';
import { broadleaf } from './nsiaroad';
import { groundHeight } from './relief';
import { SOLIDS } from './solids';
import { COURTS, TC, wallHeight } from './tennisplan';
import { tcCover } from './ghlplan';

type P2 = [number, number];
const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#f1efe9') };
const O: P2 = [(TC.x0 + TC.x1) / 2, (TC.z0 + TC.z1) / 2];
const F = TC.floor;
const fbm = (x: number, z: number) => vnoise(x, z) * 0.55 + vnoise(x * 2.1 + 17, z * 2.1 - 9) * 0.3 + vnoise(x * 4.3 - 5, z * 4.3 + 21) * 0.15;

// ---------- the surfaces ----------
/** the court lines of one court, in canvas pixels: centre (cx, cz) world, `px` pixels a metre, origin (x0, z0) */
function courtLines(g: CanvasRenderingContext2D, cx: number, cz: number, x0: number, z0: number, px: number, color: string, worn: number) {
  const C = TC.court, X = (x: number) => (x - x0) * px, Z = (z: number) => (z - z0) * px, w = Math.max(2, 0.05 * px);
  const seg = (ax: number, az: number, bx: number, bz: number) => {
    // a line in short pieces, some fainter (worn paint)
    const L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 0.5);
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, f = hash(ax * 3 + i, az * 7 + bx);
      g.globalAlpha = 1 - worn * (f < 0.18 ? 0.7 : f * 0.35);
      g.strokeStyle = color; g.lineWidth = w;
      g.beginPath(); g.moveTo(X(ax + (bx - ax) * t0), Z(az + (bz - az) * t0)); g.lineTo(X(ax + (bx - ax) * t1), Z(az + (bz - az) * t1)); g.stroke();
    }
    g.globalAlpha = 1;
  };
  const hl = C.len / 2, hd = C.dbl / 2, hs = C.sgl / 2;
  for (const s of [-1, 1]) {
    seg(cx - hd, cz + s * hl, cx + hd, cz + s * hl); // baselines
    seg(cx + s * hd, cz - hl, cx + s * hd, cz + hl); // doubles sidelines
    seg(cx + s * hs, cz - hl, cx + s * hs, cz + hl); // singles sidelines
    seg(cx - hs, cz + s * C.svc, cx + hs, cz + s * C.svc); // service lines
    seg(cx, cz + s * hl, cx, cz + s * (hl - 0.1)); // centre marks
  }
  seg(cx, cz - C.svc, cx, cz + C.svc); // centre service line
}
/** the hard court: the faded blue court in its pale green run-off, worn through to tan and grey substrate in irregular
 *  patches, darker scuffs and fine cracks (Pictures 1-7; under neutral daylight, the canopy's shade is lighting) */
function hardTexture() {
  const [x0, x1, z0, z1] = TC.hard, px = 40, W = Math.round((x1 - x0) * px), H = Math.round((z1 - z0) * px);
  const c = COURTS[0], hd = TC.court.dbl / 2, hl = TC.court.len / 2;
  const t = canvas(W, H, (g) => {
    const img = g.createImageData(W, H), d = img.data;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const x = x0 + (i + 0.5) / px, z = z0 + (j + 0.5) / px, fine = (hash(i, j) - 0.5) * 0.05;
      const inCourt = Math.abs(x - c.x) < hd && Math.abs(z - c.z) < hl;
      let r = inCourt ? 0.33 : 0.41, gg = inCourt ? 0.5 : 0.56, b = inCourt ? 0.66 : 0.42;
      const tone = (vnoise(x * 0.4, z * 0.4) - 0.5) * 0.06;
      r += tone + fine; gg += tone + fine; b += tone + fine;
      // the wear: paint lost to a pale tan or grey substrate, in irregular flakes, worst where play is (the baselines'
      // backs and the service boxes)
      const play = Math.exp(-(((Math.abs(z - c.z) - hl + 1.2) / 3) ** 2)) * 0.09 + (inCourt ? 0.03 : 0);
      const m = fbm(x * 1.4, z * 1.4) + (vnoise(x * 4.5, z * 4.5) - 0.5) * 0.16 + play;
      if (m > 0.67) { const k = Math.min(1, (m - 0.67) / 0.03), tan = vnoise(x * 0.7 + 40, z * 0.7) > 0.45; r = r * (1 - k) + (tan ? 0.7 : 0.62) * k + fine; gg = gg * (1 - k) + (tan ? 0.63 : 0.62) * k + fine; b = b * (1 - k) + (tan ? 0.52 : 0.58) * k + fine; }
      else if (m > 0.62) { const k = (m - 0.62) / 0.05; r += 0.06 * k; gg += 0.04 * k; b -= 0.02 * k; }
      // darker scuffs, small
      if (vnoise(x * 3.1 + 9, z * 3.1 - 3) > 0.9) { r -= 0.08; gg -= 0.08; b -= 0.07; }
      const o = (j * W + i) * 4;
      d[o] = Math.max(0, Math.min(255, r * 255)); d[o + 1] = Math.max(0, Math.min(255, gg * 255)); d[o + 2] = Math.max(0, Math.min(255, b * 255)); d[o + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    // fine cracks
    for (let k = 0; k < 90; k++) {
      let x = (hash(k, 1.3) * (x1 - x0)) * px, y = (hash(2.7, k) * (z1 - z0)) * px, a = hash(k, 5) * Math.PI * 2;
      g.strokeStyle = 'rgba(40,46,48,0.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y);
      for (let s = 0; s < 9; s++) { a += (hash(k, s) - 0.5) * 1.1; x += Math.cos(a) * 14; y += Math.sin(a) * 14; g.lineTo(x, y); }
      g.stroke();
    }
    courtLines(g, c.x, c.z, x0, z0, px, '#eef0ea', 0.5);
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 8;
  return t;
}
/** the red-soil ground: matte orange-red earth, fine grain, uneven tone, sweep arcs and foot marks, pale lines on the two
 *  courts (Picture 8) */
function redTexture() {
  const [x0, x1, z0, z1] = TC.red, px = 24, W = Math.round((x1 - x0) * px), H = Math.round((z1 - z0) * px);
  const t = canvas(W, H, (g) => {
    const img = g.createImageData(W, H), d = img.data;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const x = x0 + (i + 0.5) / px, z = z0 + (j + 0.5) / px, fine = (hash(i * 1.3, j * 0.7) - 0.5) * 0.08;
      const tone = (fbm(x * 0.25, z * 0.25) - 0.5) * 0.1;
      let r = 0.74 + tone + fine, gg = 0.4 + tone * 0.8 + fine * 0.8, b = 0.24 + tone * 0.5 + fine * 0.6;
      // the east strip and the edges, less played: a little browner, with dry grass creeping in along the walls
      const edge = Math.min(x - x0, x1 - x, z - z0, z1 - z);
      if (edge < 1.2 && vnoise(x * 1.5, z * 1.5) > 0.55) { r -= 0.1; gg += 0.02; b -= 0.02; }
      const o = (j * W + i) * 4;
      d[o] = Math.max(0, Math.min(255, r * 255)); d[o + 1] = Math.max(0, Math.min(255, gg * 255)); d[o + 2] = Math.max(0, Math.min(255, b * 255)); d[o + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    // sweep arcs (the drag brush) and foot marks round the baselines
    for (let k = 0; k < 160; k++) {
      const cx = hash(k, 3.1) * W, cy = hash(4.7, k) * H, r = (2 + hash(k, 8) * 5) * px;
      g.strokeStyle = hash(k, 9) < 0.5 ? 'rgba(232,150,100,0.18)' : 'rgba(120,58,30,0.14)'; g.lineWidth = 2 + hash(k, 2) * 3;
      g.beginPath(); g.arc(cx, cy, r, hash(k, 4) * 6.28, hash(k, 4) * 6.28 + 0.8 + hash(k, 5)); g.stroke();
    }
    for (const c of COURTS.filter((q) => q.red)) for (let k = 0; k < 220; k++) {
      const s = hash(k, c.x) < 0.5 ? -1 : 1, x = c.x + (hash(c.x, k) - 0.5) * 9, z = c.z + s * (TC.court.len / 2 - 2 + hash(k, 6) * 4.5);
      g.fillStyle = 'rgba(110,52,26,0.22)'; g.beginPath(); g.ellipse((x - x0) * px, (z - z0) * px, 3, 5, hash(k, 7) * 3, 0, 6.28); g.fill();
    }
    for (const c of COURTS.filter((q) => q.red)) courtLines(g, c.x, c.z, x0, z0, px, '#efe4d2', 0.35);
    // the line along the courts' east edge, where the plain red ground begins (Picture 12)
    g.fillStyle = 'rgba(239,228,210,0.75)'; g.fillRect((TC.redCourts[1] - x0) * px - 1, 0, 2, H);
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 8;
  return t;
}

// ---------- the walls ----------
/** irregular stones, tan, grey and reddish, in mortar, a little weathered at the foot (the walls' faces and tops) */
function stoneTexture() {
  return canvas(512, 512, (g) => {
    // mortar, then rubble: irregular stones of mixed size laid roughly in courses, each a polygon round a jittered point
    g.fillStyle = '#8f8576'; g.fillRect(0, 0, 512, 512);
    const tones = ['#b39a7e', '#a88f76', '#9d8a7b', '#b7a487', '#9a7c66', '#a96f55', '#8e8a83', '#c0ab8d', '#a4816a', '#b07a5c', '#968e86'];
    for (let row = 0; row < 18; row++) for (let col = 0; col < 14; col++) {
      const k = row * 31 + col, cx = col * 38 + (row % 2) * 19 + (hash(k, 1) - 0.5) * 16, cy = row * 30 + (hash(k, 2) - 0.5) * 10;
      const rx = 15 + hash(k, 3) * 12, ry = 10 + hash(k, 4) * 7, rot = (hash(k, 5) - 0.5) * 0.5;
      for (const ox of [-512, 0, 512]) for (const oy of [-512, 0, 512]) {
        if (cx + ox < -40 || cx + ox > 552 || cy + oy < -40 || cy + oy > 552) continue;
        g.save(); g.translate(cx + ox, cy + oy); g.rotate(rot);
        g.fillStyle = tones[Math.floor(hash(k, 6) * tones.length)];
        g.beginPath();
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, f = 0.75 + hash(k, 10 + i) * 0.3; if (i) g.lineTo(Math.cos(a) * rx * f, Math.sin(a) * ry * f); else g.moveTo(Math.cos(a) * rx * f, Math.sin(a) * ry * f); }
        g.closePath(); g.fill();
        // relief: a lit upper rim, a shaded lower rim, a few specks
        g.strokeStyle = 'rgba(255,240,220,0.2)'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, -1, rx * 0.8, ry * 0.75, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
        g.strokeStyle = 'rgba(40,30,20,0.32)'; g.beginPath(); g.ellipse(0, 1, rx * 0.85, ry * 0.8, 0, Math.PI * 0.1, Math.PI * 0.9); g.stroke();
        for (let s = 0; s < 4; s++) { g.fillStyle = `rgba(${hash(s, k) < 0.5 ? '60,50,40' : '230,215,190'},0.14)`; g.fillRect((hash(s, k + 1) - 0.5) * rx, (hash(k, s + 2) - 0.5) * ry, 3, 3); }
        g.restore();
      }
    }
    // weathering: darker streaks down from the top, a damp darker foot
    for (let i = 0; i < 26; i++) { g.fillStyle = 'rgba(50,46,38,0.12)'; g.fillRect(hash(i, 4) * 512, 0, 6 + hash(i, 6) * 18, 100 + hash(7, i) * 300); }
    const gr = g.createLinearGradient(0, 512, 0, 380); gr.addColorStop(0, 'rgba(60,52,40,0.35)'); gr.addColorStop(1, 'rgba(60,52,40,0)'); g.fillStyle = gr; g.fillRect(0, 380, 512, 132);
  });
}
/** a wall piece from world corners: its faces' texture coordinates in metres along the face (2 m a picture) */
function wallBox(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2 - O[0], (y0 + y1) / 2, (z0 + z1) / 2 - O[1]);
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const X = p.getX(i) + O[0], Y = p.getY(i), Z = p.getZ(i) + O[1];
    if (Math.abs(n.getY(i)) > 0.5) uv.setXY(i, X / 2, Z / 2);
    else if (Math.abs(n.getX(i)) > 0.5) uv.setXY(i, Z / 2, Y / 2);
    else uv.setXY(i, X / 2, Y / 2);
  }
  return g;
}

// ---------- the fence and the nets ----------
/** chain-link: grey wire in diamonds, transparent between (10 cm a diamond) */
function meshTexture() {
  const t = canvas(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.strokeStyle = 'rgba(150,156,160,0.95)'; g.lineWidth = 2.2;
    for (const o of [-64, 0, 64]) { g.beginPath(); g.moveTo(o, 0); g.lineTo(o + 64, 64); g.stroke(); g.beginPath(); g.moveTo(o + 64, 0); g.lineTo(o, 64); g.stroke(); }
  });
  t.anisotropy = 4;
  return t;
}
/** climbers on the red-soil side's fence (Picture 8): dark green, in irregular masses, thinning upward */
function vineTexture() {
  const t = canvas(256, 256, (g) => {
    g.clearRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      const x = hash(i, 1) * 256, y = 256 - Math.pow(hash(2, i), 0.6) * 256, r = 3 + hash(i, 3) * 9;
      g.fillStyle = ['rgba(44,70,34,0.85)', 'rgba(58,86,40,0.8)', 'rgba(36,58,30,0.85)', 'rgba(70,96,46,0.75)'][i % 4];
      g.beginPath(); g.arc(x, y, r, 0, 6.28); g.fill();
    }
  });
  t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}
/** the net: dark fine square mesh (4.5 cm), transparent between */
function netTexture() {
  const t = canvas(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.strokeStyle = 'rgba(22,24,26,0.95)'; g.lineWidth = 2;
    for (let k = 0; k <= 64; k += 16) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 64); g.stroke(); g.beginPath(); g.moveTo(0, k); g.lineTo(64, k); g.stroke(); }
  });
  return t;
}

/** a vertical panel from (ax, az) to (bx, bz), y0..y1 (world), texture repeat every `rep` m along and up */
function panel(ax: number, az: number, bx: number, bz: number, y0: number, y1: number, rep: number, topAt?: (t: number) => number) {
  const L = Math.hypot(bx - ax, bz - az), n = topAt ? 12 : 1, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = ax + (bx - ax) * t - O[0], z = az + (bz - az) * t - O[1], top = topAt ? topAt(t) : y1;
    pos.push(x, y0, z, x, top, z);
    uv.push((t * L) / rep, 0, (t * L) / rep, (top - y0) / rep);
    if (i < n) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
/** a round rod between two world points (posts, rails, braces) */
function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, seg = 6) {
  const L = a.distanceTo(b), g = new THREE.CylinderGeometry(r, r, L, seg).translate(0, L / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()));
  return g.translate(a.x - O[0], a.y, a.z - O[1]);
}
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** shrubs at the walls' tops and in the belt's understorey (visual only: the bike pushes through foliage) */
function shrub(leaf: Part[], x: number, z: number, i: number, size = 1) {
  const y = groundHeight(x, z), rad = (0.6 + hash(i, 6) * 0.9) * size, up = 0.7 + hash(i, 7) * 0.6;
  const cols = ['#2f5526', '#36602a', '#3b5f2a', '#2c4f24', '#41662e', '#34582a'];
  // two or three overlapping lumps, flatter than tall
  const n = 2 + (hash(i, 8) < 0.5 ? 1 : 0);
  for (let j = 0; j < n; j++) {
    const a = hash(i, 10 + j) * 6.283, d = j ? rad * (0.5 + hash(i, 20 + j) * 0.3) : 0, r = rad * (j ? 0.7 : 1);
    leaf.push([new THREE.IcosahedronGeometry(r, 0).scale(1.2, up, 1.2).translate(x + Math.cos(a) * d - O[0], y + r * up * 0.7, z + Math.sin(a) * d - O[1]), cols[(i + j) % cols.length]]);
  }
}

const spec: Spec = {
  name: 'Commonwealth west tennis complex', axis: [1, 0], origin: O, storey: 3, style: PLAIN, roofColor: '#9aa0a3', fascia: '#6d5a4a', pitch: 0.2,
  blocks: [],
  onGround: true,
  // the map's two pitches: the game drew them as striped grass; the model draws the courts
  covers: [[(TC.hard[0] + TC.hard[1]) / 2, -73], [(TC.redCourts[0] + TC.redCourts[1]) / 2, -73]],
  // the complex, its walls' tops and the ring of trees round it: no generic trees, lamps or props
  keep: [[TC.x0 - 14 - O[0], TC.x1 + 14 - O[0], TC.z0 - 14 - O[1], TC.z1 + 9 - O[1]]],
  extras: (k: Kit) => {
    const leaf: Part[] = [], metal: Part[] = [], green: Part[] = [], trees: Part[] = [];

    // ----- the floors -----
    const surf = (b: [number, number, number, number], tex: THREE.Texture, rough: number) => {
      const [x0, x1, z0, z1] = b;
      const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate((x0 + x1) / 2 - O[0], F + 0.02, (z0 + z1) / 2 - O[1]);
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: rough, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
      m.receiveShadow = true; m.userData.noCollide = true;
      k.meshes.push(m);
    };
    surf(TC.hard, hardTexture(), 0.85);
    surf(TC.red, redTexture(), 1);

    // ----- the retaining walls: each side in its runs, the face on the floor's edge, the top level with the ground behind
    const stone = new THREE.MeshStandardMaterial({ map: stoneTexture(), roughness: 0.95 });
    const walls: THREE.BufferGeometry[] = [], caps: THREE.BufferGeometry[] = [], T = TC.wall;
    const runs = (side: 'north' | 'south' | 'west' | 'east', a0: number, a1: number) => {
      const r = TC.walls[side];
      return r.map(([a, h], i) => [Math.max(a0, a), Math.min(a1, i + 1 < r.length ? r[i + 1][0] : a1), h] as [number, number, number]).filter(([a, b]) => b > a);
    };
    for (const [a, b, h] of runs('north', TC.x0 - T, TC.x1 + T)) { walls.push(wallBox(a, b, F - 0.3, F + h, TC.z0 - T, TC.z0)); caps.push(wallBox(a, b, F + h - 0.02, F + h + 0.07, TC.z0 - T - 0.04, TC.z0 + 0.04)); }
    for (const [a, b, h] of runs('south', TC.x0 - T, TC.x1 + T)) { walls.push(wallBox(a, b, F - 0.3, F + h, TC.z1, TC.z1 + T)); caps.push(wallBox(a, b, F + h - 0.02, F + h + 0.07, TC.z1 - 0.04, TC.z1 + T + 0.04)); }
    for (const [a, b, h] of runs('west', TC.z0, TC.z1)) { walls.push(wallBox(TC.x0 - T, TC.x0, F - 0.3, F + h, a, b)); caps.push(wallBox(TC.x0 - T - 0.04, TC.x0 + 0.04, F + h - 0.02, F + h + 0.07, a, b)); }
    for (const [a, b, h] of runs('east', TC.z0, TC.z1)) { walls.push(wallBox(TC.x1, TC.x1 + T, F - 0.3, F + h, a, b)); caps.push(wallBox(TC.x1 - 0.04, TC.x1 + T + 0.04, F + h - 0.02, F + h + 0.07, a, b)); }
    // (between the hard court and the red-soil ground: no wall, the two share the floor; a fence parts them)
    const wm = new THREE.Mesh(mergeAll(walls), stone);
    wm.castShadow = true; wm.receiveShadow = true;
    const cm = new THREE.Mesh(mergeAll(caps), new THREE.MeshStandardMaterial({ map: stone.map, roughness: 0.95, color: '#d8d0c4' }));
    cm.castShadow = true; cm.receiveShadow = true;
    k.meshes.push(wm, cm);
    // small shrubs and grass on the higher ground just behind the walls' tops (the photos' grass at the walls)
    let n = 0;
    for (const [side, a0, a1] of [['north', TC.x0, TC.x1], ['south', TC.x0, TC.x1], ['west', TC.z0, TC.z1], ['east', TC.z0, TC.z1]] as const) {
      const along = side === 'north' || side === 'south', out = side === 'north' || side === 'west' ? -1 : 1;
      const edge = side === 'north' ? TC.z0 : side === 'south' ? TC.z1 : side === 'west' ? TC.x0 : TC.x1;
      for (let a = a0 + 0.8; a < a1 - 0.5; a += 1.6) {
        const i = n++;
        if (hash(i, 2) > 0.55) continue;
        const off = edge + out * (T + 0.6 + hash(i, 3) * 1.5), slide = a + (hash(i, 5) - 0.5);
        shrub(leaf, along ? slide : off, along ? off : slide, i, 0.6 + hash(i, 4) * 0.7);
      }
    }

    // ----- the fence: posts just inside the walls, rails, chain-link, braces; a fence between the two surfaces
    const mesh = new THREE.MeshStandardMaterial({ map: meshTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: 0.6, metalness: 0.3, alphaTest: 0.04 });
    const vine = new THREE.MeshStandardMaterial({ map: vineTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: 0.9, alphaTest: 0.2 });
    const panels: THREE.BufferGeometry[] = [], vines: THREE.BufferGeometry[] = [];
    const H = TC.fence.h, I = TC.fence.inset, POST = '#8e9397';
    const fx0 = TC.x0 + I, fx1 = TC.x1 - I, fz0 = TC.z0 + I, fz1 = TC.z1 - I;
    const line = (ax: number, az: number, bx: number, bz: number, braceAt: number[], vined: boolean) => {
      const L = Math.hypot(bx - ax, bz - az), nb = Math.max(1, Math.round(L / TC.fence.bay));
      for (let i = 0; i <= nb; i++) {
        const t = i / nb, x = ax + (bx - ax) * t, z = az + (bz - az) * t;
        metal.push([rod(V(x, F, z), V(x, F + H + 0.05, z), 0.035), POST]);
        SOLIDS.add(x, z, 0.12);
      }
      metal.push([rod(V(ax, F + H, az), V(bx, F + H, bz), 0.022), POST]);
      metal.push([rod(V(ax, F + 0.08, az), V(bx, F + 0.08, bz), 0.012), POST]);
      panels.push(panel(ax, az, bx, bz, F + 0.03, F + H, 0.1));
      if (vined) vines.push(panel(ax, az, bx, bz, F + 0.03, F + H * 0.85, 2.6));
      // diagonal braces from a post at mid-height down to the floor a step along (Pictures 1, 4)
      const ux = (bx - ax) / L, uz = (bz - az) / L;
      for (const t of braceAt) {
        const px = ax + ux * t, pz = az + uz * t, s = t < L / 2 ? 1 : -1;
        metal.push([rod(V(px, F + 1.9, pz), V(px + ux * s * 1.5, F + 0.02, pz + uz * s * 1.5), 0.02), POST]);
      }
      // the bike stops at the mesh
      wallSolids(ax, az, bx, bz, 0.25);
    };
    const netZ = COURTS[0].z;
    line(fx0, fz0, fx1, fz0, [0, fx1 - fx0], false);
    line(fx0, fz1, fx1, fz1, [0, fx1 - fx0], false);
    line(fx0, fz0, fx0, fz1, [0, netZ - fz0 - 1.5, fz1 - fz0], false);
    line(fx1, fz0, fx1, fz1, [0, netZ - fz0 - 1.5, fz1 - fz0], true);
    line(TC.hard[1], fz0, TC.hard[1], fz1, [0, fz1 - fz0], false);
    // the vines on the red-soil side's north and south runs too
    vines.push(panel(TC.red[0], fz0, fx1, fz0, F + 0.03, F + H * 0.85, 2.6), panel(TC.red[0], fz1, fx1, fz1, F + 0.03, F + H * 0.8, 2.6));
    const pm = new THREE.Mesh(mergeAll(panels), mesh); pm.renderOrder = 2;
    const vm = new THREE.Mesh(mergeAll(vines), vine); vm.renderOrder = 2; vm.userData.noCollide = true;
    k.meshes.push(pm, vm);

    // ----- the nets: green posts, dark mesh sagging to the middle, a pale top tape
    const netMat = new THREE.MeshStandardMaterial({ map: netTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: 0.8, alphaTest: 0.05 });
    const nets: THREE.BufferGeometry[] = [];
    for (const [i, c] of COURTS.entries()) {
      const half = TC.court.dbl / 2 + TC.court.post, ax = c.x - half, bx = c.x + half;
      const top = (t: number) => F + TC.court.hPost - (TC.court.hPost - TC.court.hMid) * (1 - (2 * t - 1) ** 2);
      nets.push(panel(ax, c.z, bx, c.z, F + 0.04 + 0.02 * hash(i, 1), F + 1, 0.045, top));
      // the tape along the top, a strip that follows the sag
      for (let s = 0; s < 12; s++) {
        const t0 = s / 12, t1 = (s + 1) / 12;
        green.push([rod(V(ax + (bx - ax) * t0, top(t0) - 0.03, c.z), V(ax + (bx - ax) * t1, top(t1) - 0.03, c.z), 0.03, 4), '#e8e6dc']);
      }
      for (const x of [ax, bx]) { green.push([rod(V(x, F, c.z), V(x, F + TC.court.hPost + 0.04, c.z), 0.045, 8), c.red ? '#2c4a36' : '#2f6b3f']); SOLIDS.add(x, c.z, 0.12); }
      green.push([rod(V(c.x, F, c.z), V(c.x, F + TC.court.hMid, c.z), 0.012, 4), '#dddcd2']);
    }
    const nm = new THREE.Mesh(mergeAll(nets), netMat); nm.renderOrder = 2; nm.userData.noCollide = true;
    k.meshes.push(nm);

    // ----- the tall slender lattice mast and the chair-like frame (Picture 8): plain, conservative
    {
      const [mx, mz] = TC.mast, RUST = '#7a3d2c';
      for (const dx of [-0.18, 0.18]) metal.push([rod(V(mx + dx, F, mz), V(mx + dx, F + 9.5, mz), 0.04), RUST]);
      for (let y = 0.5; y < 9.5; y += 0.5) {
        metal.push([rod(V(mx - 0.18, F + y, mz), V(mx + 0.18, F + y, mz), 0.015), RUST]);
        metal.push([rod(V(mx - 0.18, F + y, mz), V(mx + 0.18, F + y + 0.5, mz), 0.012), RUST]);
      }
      SOLIDS.add(mx, mz, 0.4);
      const [cx, cz] = TC.chair, DARK = '#3a3f44';
      // an open frame: four splayed legs, a small seat on top, a back rail, rungs up one side
      for (const [dx, dz] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) metal.push([rod(V(cx + dx, F, cz + dz), V(cx + dx * 0.55, F + 1.8, cz + dz * 0.55), 0.025), DARK]);
      for (const [ax, az, bx, bz] of [[-0.2, -0.2, 0.2, -0.2], [0.2, -0.2, 0.2, 0.2], [0.2, 0.2, -0.2, 0.2], [-0.2, 0.2, -0.2, -0.2]]) metal.push([rod(V(cx + ax, F + 1.8, cz + az), V(cx + bx, F + 1.8, cz + bz), 0.02), DARK]);
      metal.push([new THREE.BoxGeometry(0.4, 0.04, 0.4).translate(cx - O[0], F + 1.83, cz - O[1]), '#5a5f64']);
      for (const dz of [-0.18, 0.18]) metal.push([rod(V(cx - 0.2, F + 1.8, cz + dz), V(cx - 0.2, F + 2.35, cz + dz), 0.018), DARK]);
      metal.push([rod(V(cx - 0.2, F + 2.35, cz - 0.18), V(cx - 0.2, F + 2.35, cz + 0.18), 0.018), DARK]);
      for (let y = 0.35; y < 1.8; y += 0.35) metal.push([rod(V(cx + 0.33, F + y, cz - 0.18), V(cx + 0.33, F + y, cz + 0.18), 0.015), DARK]);
      SOLIDS.add(cx, cz, 0.5);
    }

    // ----- the tree belt close round the complex: broad mature crowns behind the fence (north, west, east; where the aerial
    // is dense), and south the three round trees by the red-soil courts (Picture 12)
    let ti = 0;
    // (low forks, broad full crowns: the photos' foliage reaches down toward the fence)
    const tree = (x: number, z: number, big: boolean) => broadleaf(k, trees, x, z, { h: big ? 5 + hash(x, z) * 2.2 : 4.2 + hash(z, x) * 1.6, spread: big ? 10 + hash(x, 2) * 3 : 8 + hash(x, 3) * 2.5, seed: ti++ * 3.1 + 7, origin: O, round: hash(x, 9) < 0.35 });
    for (const [x, z] of [[-614.5, -50.3], [-600.7, -50.0], [-587.4, -50.6]] as P2[]) tree(x, z, true);
    const ring = (d: number, step: number, big: boolean) => {
      const L = 2 * (TC.x1 - TC.x0 + TC.z1 - TC.z0 + 4 * d);
      for (let s = 0; s < L; s += step) {
        // walk round the floor at distance d
        const w = TC.x1 - TC.x0 + 2 * d, h = TC.z1 - TC.z0 + 2 * d;
        let x: number, z: number;
        if (s < w) { x = TC.x0 - d + s; z = TC.z0 - d; }
        else if (s < w + h) { x = TC.x1 + d; z = TC.z0 - d + (s - w); }
        else if (s < 2 * w + h) { x = TC.x1 + d - (s - w - h); z = TC.z1 + d; }
        else { x = TC.x0 - d; z = TC.z1 + d - (s - 2 * w - h); }
        x += (hash(s, d) - 0.5) * step * 0.6; z += (hash(d, s) - 0.5) * step * 0.6;
        if (z > TC.z1 + 2) continue; // the south side is the lawn and the three trees
        const [c, q] = tcCover(x, z);
        if (c !== 1 && q < 2) continue;
        tree(x, z, big);
      }
    };
    ring(4.6, 7, true);
    // shrubs under them, along the walls' tops, thickest where the aerial is densest
    for (let i = 0; i < 500; i++) {
      const x = TC.x0 - 8 + hash(i, 0.37) * (TC.x1 - TC.x0 + 16), z = TC.z0 - 8 + hash(0.53, i) * (TC.z1 - TC.z0 + 12);
      if (x > TC.x0 - 1.4 && x < TC.x1 + 1.4 && z > TC.z0 - 1.4 && z < TC.z1 + 1.4) continue;
      const [c, q] = tcCover(x, z);
      if (z > TC.z1 + 1.4 || (c !== 1 && q < 2) || hash(i, 5) > 0.55) continue;
      shrub(leaf, x, z, i, 0.9 + hash(i, 8) * 0.8);
    }

    const add = (parts: Part[], mat: THREE.Material, shadow = true) => {
      if (!parts.length) return;
      const m = new THREE.Mesh(merge(parts), mat); m.castShadow = shadow; m.receiveShadow = true;
      k.meshes.push(m);
      return m;
    };
    add(metal, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.35 }));
    add(green, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }));
    // (foliage and trunks drawn together, as the other sites' broadleaf trees: the trunks have their round solids)
    const b = new Bag(O);
    b.leaf.push(...leaf, ...trees);
    b.finish(k, 0.15);
  },
};
function mergeAll(gs: THREE.BufferGeometry[]) {
  const parts = gs.map((g) => {
    const n = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') n.deleteAttribute(k);
    return n;
  });
  const pos: number[] = [], nrm: number[] = [], uv: number[] = [];
  for (const p of parts) {
    pos.push(...(p.attributes.position.array as Float32Array));
    nrm.push(...(p.attributes.normal.array as Float32Array));
    uv.push(...(p.attributes.uv.array as Float32Array));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return g;
}

export const tennisSite = createSite('tennis', [spec]);
