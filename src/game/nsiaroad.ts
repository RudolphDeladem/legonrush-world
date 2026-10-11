// NSIA Road by the Frank Torto Chemistry Building, the owner's reconstruction brief (six game/photo pairs and an overhead
// map; the levels are in relief.ts, the adjustable numbers in nsia.ts). Built here, in world coordinates over the
// ground the relief makes:
// - the stone-faced retaining wall along the lane's east side, holding the tree belt up: irregular warm tan, rust,
//   brown and pale stones in dark mortar, a dark coping strip; its exposed height follows the levels either side and it
//   tapers out into the bank at the corner by the connecting road (pairs 2, 3, 5); dark asphalt from the lane to its foot;
// - the corner: the kerb sweeping round from the lane into the connecting road, the reddish path worn down the bank to
//   it, slim lit poles and a small sign on the belt (pair 5);
// - the porch on the chemistry range's end toward the lane: a broad white pier either side, a shallow flat roof with a
//   reddish fascia, a black grid gate, the concrete apron and its narrow open drain along the road (pair 2);
// - the verge by the car-park road under the big tree: reddish bare soil, leaf litter, roots and a few weeds, the long
//   grated drain along the road edge, the low dark planting strip, the cream wall with its dark red foot (pair 4);
// - the telecommunications mast among the trees on the belt (pair 3);
// - the mature broadleaf trees: high-forked trunks, overlapping crowns, one pruned and sparse (pairs 3 to 6);
// - dry ground: straw-brown and olive grass with reddish earth and litter, worn by feet under the trees;
// - the short retained stretch of NSIA Road's east bank, easing into the bank at its ends (pair 6);
// - the car park's small planted islands in curved kerbs (pair 1).
import * as THREE from 'three';
import { box, merge, type Part } from './modelkit';
import { createSite, type Kit, type Spec } from './blocks';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { NSIA, laneX } from './nsia';
import { groundHeight, wallX } from './relief';

const O: [number, number] = [215, -60];
const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
const gh = groundHeight;

/** a small deterministic noise for colours and jitter */
const hash = (x: number, z: number) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
const vnoise = (x: number, z: number) => {
  const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

// ---------- materials ----------
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return t;
};
let stoneMat: THREE.MeshStandardMaterial | null = null;
/** the wall's face: irregular stones of several sizes, warm tan, rust, brown and pale, in dark mortar, laid in world
 *  space over 2.6 m so the pattern does not repeat at an obvious scale */
export function wallStone() {
  if (stoneMat) return stoneMat;
  let s = 29;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const tex = canvasTex(512, 512, (g) => {
    g.fillStyle = '#4a4036'; g.fillRect(0, 0, 512, 512);
    const cols = ['#b88a5c', '#a26a45', '#c9a275', '#8f5b3c', '#d6c09a', '#9c7a58', '#b5714a', '#c7b08c', '#7f5236', '#d9c7a6', '#a8835e'];
    for (let i = 0; i < 900; i++) {
      const cx = r() * 512, cy = r() * 512, rx = 10 + r() * 18, ry = 7 + r() * 11, n = 6 + ((r() * 4) | 0), col = cols[(r() * cols.length) | 0];
      for (const [ox, oy] of [[0, 0], [512, 0], [-512, 0], [0, 512], [0, -512]]) {
        g.beginPath();
        for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2 + r() * 0.35, f = 0.7 + r() * 0.35; g[k ? 'lineTo' : 'moveTo'](cx + ox + Math.cos(a) * rx * f, cy + oy + Math.sin(a) * ry * f); }
        g.closePath(); g.fillStyle = col; g.fill();
        g.strokeStyle = 'rgba(30,24,20,0.6)'; g.lineWidth = 2; g.stroke();
      }
    }
    for (let i = 0; i < 4000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(40,30,22,0.18)' : 'rgba(235,220,190,0.12)'; g.fillRect(r() * 512, r() * 512, 2, 2); }
  });
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, side: THREE.DoubleSide });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.nsTex = { value: tex };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vNsP;\nvarying vec3 vNsN;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvNsP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvNsN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vNsP;\nvarying vec3 vNsN;\nuniform sampler2D nsTex;')
      .replace('#include <map_fragment>', `#include <map_fragment>
  vec3 nsA = abs(vNsN);
  vec2 nsUv = nsA.y > 0.6 ? vNsP.xz / 2.6 : vec2((nsA.x > nsA.z ? vNsP.z : vNsP.x) / 2.6, vNsP.y / 2.6);
  diffuseColor.rgb *= texture2D(nsTex, nsUv).rgb * 1.25;`);
  };
  m.customProgramCacheKey = () => 'nsia-wall-stone';
  return (stoneMat = m);
}
let groundMat: THREE.MeshStandardMaterial | null = null;
/** ground cover: fine blades and grit over the vertex colours (straw, olive, red earth) */
function coverMat() {
  if (groundMat) return groundMat;
  let s = 7;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const tex = canvasTex(256, 256, (g) => {
    g.fillStyle = '#d8d8d8'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5000; i++) { const v = 150 + r() * 105; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 3); }
  });
  tex.repeat.set(1, 1);
  groundMat = new THREE.MeshStandardMaterial({ vertexColors: true, map: tex, roughness: 1, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
  return groundMat;
}

// ---------- geometry helpers ----------
/** a grid over x0..x1, z0..z1 following the ground `lift` above it, coloured by `col` (null leaves a cell out) */
function drape(x0: number, x1: number, z0: number, z1: number, cell: number, lift: number, col: (x: number, z: number) => [number, number, number] | null) {
  const nx = Math.max(1, Math.round((x1 - x0) / cell)), nz = Math.max(1, Math.round((z1 - z0) / cell));
  const pos: number[] = [], color: number[] = [], uv: number[] = [], idx: number[] = [];
  const keep: boolean[] = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = x0 + ((x1 - x0) * i) / nx, z = z0 + ((z1 - z0) * j) / nz, c = col(x, z);
    keep.push(!!c);
    pos.push(X(x), gh(x, z) + lift, Z(z)); uv.push(x / 3, z / 3);
    const cc = c ?? [0, 0, 0]; color.push(cc[0] ** 2.2, cc[1] ** 2.2, cc[2] ** 2.2);
  }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
    if (keep[a] && keep[b] && keep[c] && keep[d]) idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(color, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
/** a strip along a polyline (world x, z), from offset a to offset b across it (left positive), following the ground */
function ribbon(pts: [number, number][], a: number, b: number, lift: number, step = 1) {
  const pos: number[] = [], idx: number[] = [];
  const dense: [number, number, number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(len / step));
    for (let k = i ? 1 : 0; k <= n; k++) dense.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n, (bx - ax) / len, (bz - az) / len]);
  }
  for (const [x, z, ux, uz] of dense) for (const o of [a, b]) { const px = x - uz * o, pz = z + ux * o; pos.push(X(px), gh(px, pz) + lift, Z(pz)); }
  for (let i = 0; i < dense.length - 1; i++) { const p = i * 2; idx.push(p, p + 2, p + 1, p + 1, p + 2, p + 3); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
/** a quad strip between two lines of points (each [x, y, z] in world coordinates) */
function sheet(a: [number, number, number][], b: [number, number, number][]) {
  const pos: number[] = [], idx: number[] = [];
  for (let i = 0; i < a.length; i++) pos.push(X(a[i][0]), a[i][1], Z(a[i][2]), X(b[i][0]), b[i][1], Z(b[i][2]));
  for (let i = 0; i < a.length - 1; i++) { const p = i * 2; idx.push(p, p + 1, p + 2, p + 1, p + 3, p + 2); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// ---------- the trees ----------
/** a mature broadleaf tree (in the frame of a model whose origin is `origin`, NSIA Road's by default): a heavy rough trunk forking high into two or three limbs, a broad crown of overlapping masses
 *  (sparse: a pruned trunk with thin, broken foliage). Its trunk is solid to the bike; roots and litter are not. */
export function broadleaf(_k: Kit | null, parts: Part[], x: number, z: number, o: { h?: number; spread?: number; sparse?: boolean; lean?: number; seed?: number; origin?: [number, number]; round?: boolean } = {}) {
  const org = o.origin ?? O, X = (v: number) => v - org[0], Z = (v: number) => v - org[1];
  const h = o.h ?? 7.5, spread = o.spread ?? 7, seed = o.seed ?? x * 3 + z, y = gh(x, z);
  const rr = (i: number) => hash(seed + i * 1.7, seed * 0.3 - i);
  const bark = ['#4f4236', '#5a4a3b', '#463a2f'];
  // the trunk, flared at the foot, a little crooked
  const lean = o.lean ?? (rr(1) - 0.5) * 0.25, tr = 0.2 + spread * 0.02;
  const trunk = new THREE.CylinderGeometry(tr * 0.75, tr * 1.25, h, 9, 4).translate(0, h / 2, 0);
  const tp = trunk.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < tp.count; i++) { const yy = tp.getY(i), f = 1 + (hash(i, seed) - 0.5) * 0.18; tp.setX(i, tp.getX(i) * f + lean * yy * 0.4); tp.setZ(i, tp.getZ(i) * f); }
  trunk.computeVertexNormals();
  parts.push([trunk.translate(X(x), y - 0.3, Z(z)), bark[Math.abs(seed | 0) % 3]]);
  // root flares at the foot (visual only)
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + rr(i); parts.push([new THREE.CylinderGeometry(0.06, 0.2, 1.6, 5).rotateZ(Math.PI / 2 - 0.25).rotateY(a).translate(X(x) + Math.cos(a) * 0.7, y + 0.08, Z(z) - Math.sin(a) * 0.7), '#4a3d31']); }
  // the limbs: two or three from the fork, spreading
  const nLimb = o.sparse ? 3 : 2 + ((rr(2) * 2) | 0), top = h - 0.3, ends: [number, number, number][] = [];
  for (let i = 0; i < nLimb; i++) {
    const a = (i / nLimb) * Math.PI * 2 + rr(3 + i) * 1.2, out = spread * (0.35 + rr(5 + i) * 0.2), up = 2.2 + rr(7 + i) * 2.2;
    const ex = Math.cos(a) * out, ez = Math.sin(a) * out, L = Math.hypot(ex, up, ez);
    const limb = new THREE.CylinderGeometry(tr * 0.32, tr * 0.6, L, 7).translate(0, L / 2, 0);
    limb.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(ex, up, ez).normalize()));
    parts.push([limb.translate(X(x) + lean * top * 0.4, y + top, Z(z)), bark[i % 3]]);
    ends.push([x + lean * top * 0.4 + ex, y + top + up, z + ez]);
  }
  // the crown: overlapping masses over the limbs' ends and between them, darker underneath
  const greens = o.sparse ? ['#55663a', '#61703f', '#4a5c33'] : ['#2f4a25', '#36552a', '#3e5d2e', '#2a4322', '#45632f'];
  const masses = o.sparse ? 6 : o.round ? 22 : 14, flat = o.round ? 0.85 : 0.62;
  for (let i = 0; i < masses; i++) {
    const e = ends[i % ends.length], a = rr(20 + i) * Math.PI * 2, d = rr(40 + i) * spread * 0.35, r = (o.sparse ? 0.9 : 1.6) + rr(60 + i) * (o.sparse ? 0.8 : 1.6);
    const cx = e[0] + Math.cos(a) * d, cz = e[2] + Math.sin(a) * d, cy = e[1] + (rr(80 + i) - 0.3) * 1.4;
    parts.push([new THREE.IcosahedronGeometry(r, 1).scale(1.25, flat, 1.25).translate(X(cx), cy + (o.round ? (rr(90 + i) - 0.2) * 1.6 : 0), Z(cz)), greens[i % greens.length]]);
  }
  if (!o.sparse) parts.push([new THREE.IcosahedronGeometry(spread * 0.42, 1).scale(1.3, o.round ? 0.75 : 0.45, 1.3).translate(X(x) + lean * top * 0.4, y + top + (o.round ? 3.0 : 2.6), Z(z)), '#2c4624']);
  SOLIDS.add(x, z, tr * 1.1);
}

// ---------- the site ----------
const nsiaSpec: Spec = {
  name: 'NSIA Road by the Frank Torto Building',
  axis: [1, 0], origin: O, storey: 3, style: { bay: 3, up: [], ground: [], draw: (g) => { g.fillStyle = '#ccc'; g.fillRect(0, 0, 256, 512); } }, roofColor: '#888', fascia: '#888', pitch: 0.1,
  onGround: true,
  blocks: [],
  // the belt, the verge under the tree, the porch's apron, NSIA Road's east bank: nothing generic placed on them
  keep: [[X(213), X(232), Z(-84), Z(-27)], [X(223.6), X(232), Z(-95), Z(-84)], [X(160), X(205), Z(-89.3), Z(-80.9)], [X(203), X(208.5), Z(-79), Z(-66)], [X(239), X(248), Z(-56), Z(8)], [X(203.5), X(232), Z(-158), Z(-79)]],
  extras: (k: Kit) => {
    const c: Part[] = [], stone: Part[] = [], trees: Part[] = [];
    const W = NSIA.wall, B = NSIA.belt;

    // ----- the retaining wall along the lane: its face where the belt's edge is, from below the asphalt to the coping, its
    // top the belt's ground (which falls away at its north end and into the corner at its south end)
    {
      const zs: number[] = [];
      for (let z = B.z0 - B.north; z <= B.z1 + 0.01; z += 0.5) zs.push(Math.min(z, B.z1));
      const runs: number[][] = [[]];
      for (const z of zs) {
        const fx = wallX(z), base = gh(fx - 0.35, z), top = gh(fx + 0.75, z);
        if (top - base > 0.06) runs[runs.length - 1].push(z); else if (runs[runs.length - 1].length) runs.push([]);
      }
      for (const run of runs) {
        if (run.length < 2) continue;
        const face: [number, number, number][] = [], faceTop: [number, number, number][] = [], back: [number, number, number][] = [];
        const capF: [number, number, number][] = [], capT: [number, number, number][] = [], capB: [number, number, number][] = [];
        for (const z of run) {
          const fx = wallX(z), base = gh(fx - 0.35, z) - 0.3, top = gh(fx + 0.75, z);
          face.push([fx, base, z]); faceTop.push([fx, top - 0.06, z]);
          capF.push([fx - 0.05, top - 0.07, z]); capT.push([fx - 0.05, top + 0.07, z]); capB.push([fx + 0.6, top + 0.07, z]);
          back.push([fx + 0.6, top - 0.06, z]);
        }
        stone.push([sheet(faceTop, face), '#ffffff'], [sheet(back, faceTop), '#ffffff']);
        c.push([sheet(capT, capF), '#3b342d'], [sheet(capB, capT), '#453d35']);
        // the end of the run: a little return into the ground
        for (const z of [run[0], run[run.length - 1]]) {
          const fx = wallX(z), base = gh(fx - 0.35, z) - 0.3, top = gh(fx + 0.75, z);
          stone.push([box(X(fx), X(fx + 0.4), base, top, Z(z) - 0.03, Z(z) + 0.03), '#ffffff']);
        }
        for (const z of run) SOLIDS.add(wallX(z) + 0.15, z, 0.3);
      }
      // dark asphalt from the lane's edge to the wall's foot (the corridor runs right up to it)
      const lane: [number, number][] = [];
      for (let z = B.z0 - B.north; z <= B.z1 + 2; z += 1) lane.push([laneX(z), z]);
      c.push([ribbon(lane, -1.9, -(W.offset + 0.02), 0.035), '#3d3e40']);
    }

    // ----- the corner by the connecting road (pair 5): the kerb sweeping round from the lane into the connecting road,
    // the path worn down the bank to it, poles and a small sign on the belt
    {
      const wf = wallX(-32), R = 2.6, cz = -32.1, kerbPts: [number, number][] = [];
      for (let i = 0; i <= 10; i++) { const t = (i / 10) * (Math.PI / 2); kerbPts.push([wf + R - R * Math.cos(t), cz + R * Math.sin(t)]); }
      kerbPts.push([224, -29.55], [232, -29.6]);
      for (let i = 0; i < kerbPts.length - 1; i++) {
        const [ax, az] = kerbPts[i], [bx, bz] = kerbPts[i + 1], len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(len / 1.2));
        for (let j = 0; j < n; j++) {
          const x = ax + ((bx - ax) * (j + 0.5)) / n, z = az + ((bz - az) * (j + 0.5)) / n, y = Math.min(gh(x, z), gh(x - (bz - az) / len * 0.3, z + (bx - ax) / len * 0.3));
          // a little uneven, as an old kerb is
          c.push([new THREE.BoxGeometry(len / n + 0.02, 0.17 + hash(x, z) * 0.03, 0.18).rotateY(Math.atan2(-(bz - az), bx - ax)).translate(X(x), y + 0.06, Z(z)), j % 2 ? '#bdb8ae' : '#b5afa4']);
        }
      }
      // the worn path: reddish earth through patchy turf, from among the trees down to the kerb
      const path: [number, number][] = [[223.5, -44], [222.0, -39], [220.4, -34.5], [219.0, -30.6], [218.2, -28.6]];
      c.push([ribbon(path, -0.65, 0.65, 0.05, 0.5), '#9a5a3c']);
      for (const [x, z] of [[216.2, -36], [226.5, -48]]) {
        const y = gh(x, z);
        c.push([new THREE.CylinderGeometry(0.05, 0.07, 6, 8).translate(X(x), y + 3, Z(z)), '#8d9196'], [box(X(x) - 0.25, X(x) + 0.25, y + 5.9, y + 6.05, Z(z) - 0.12, Z(z) + 0.12), '#2c2e31']);
        c.push([box(X(x) - 0.2, X(x) + 0.2, y + 5.85, y + 5.9, Z(z) - 0.08, Z(z) + 0.08), '#fff4cc']);
        SOLIDS.add(x, z, 0.1);
      }
      { const x = 224.6, z = -31.4, y = gh(x, z);
        for (const dz of [-0.45, 0.45]) c.push([box(X(x) - 0.03, X(x) + 0.03, y, y + 1.4, Z(z) + dz - 0.03, Z(z) + dz + 0.03), '#5d6166']);
        c.push([box(X(x) - 0.03, X(x) + 0.03, y + 0.9, y + 1.45, Z(z) - 0.55, Z(z) + 0.55), '#e8e4d6'], [box(X(x) + 0.03, X(x) + 0.035, y + 1.05, y + 1.3, Z(z) - 0.45, Z(z) + 0.45), '#1d4f8f']);
        SOLIDS.add(x, z, 0.3); }
    }

    // ----- the porch on the range's end toward the lane (pair 2)
    {
      const x0 = 203.6, x1 = 206.3, z0 = -76.2, z1 = -68.8, y = gh(205, -72.5), H = 2.95;
      for (const z of [z0, z1 - 0.7]) c.push([box(X(x0), X(x1), y - 0.2, y + H, Z(z), Z(z + 0.7)), '#f1efe8']);
      c.push([box(X(x0) - 0.1, X(x1 + 0.25), y + H, y + H + 0.18, Z(z0 - 0.3), Z(z1 + 0.3)), '#eceae3']);
      c.push([box(X(x1 + 0.2), X(x1 + 0.3), y + H - 0.08, y + H + 0.26, Z(z0 - 0.3), Z(z1 + 0.3)), '#9a4632']);
      for (const z of [z0 - 0.3, z1 + 0.3]) c.push([box(X(x0) - 0.1, X(x1 + 0.3), y + H - 0.08, y + H + 0.26, Z(z) - 0.05, Z(z) + 0.05), '#9a4632']);
      // the black gate: a frame and a grid of flat bars
      const gx = x1 - 0.15, ga = z0 + 0.7, gb = z1 - 0.7, gt = y + 2.45;
      for (const [a, b] of [[y + 0.05, y + 0.12], [gt - 0.07, gt], [y + 1.25, y + 1.3]]) c.push([box(X(gx) - 0.03, X(gx) + 0.03, a, b, Z(ga), Z(gb)), '#151515']);
      for (let z = ga; z <= gb + 0.01; z += 0.16) c.push([box(X(gx) - 0.025, X(gx) + 0.025, y + 0.05, gt, Z(z) - 0.012, Z(z) + 0.012), '#151515']);
      c.push([box(X(gx) - 0.03, X(gx) + 0.03, y + 0.05, gt, Z((ga + gb) / 2) - 0.03, Z((ga + gb) / 2) + 0.03), '#151515']);
      for (let z = ga; z < gb; z += 0.8) SOLIDS.add(gx, z, 0.25);
      // the concrete apron to the road, the narrow open drain along its road edge
      const re = laneX(-72) - 2.3;
      const grey = () => [1, 1, 1] as [number, number, number];
      c.push([drape(x0, re - 0.4, -78.5, -66.5, 0.5, 0.05, grey), '#b8b3a8']);
      c.push([drape(re - 0.4, re - 0.32, -78.5, -66.5, 0.5, 0.07, grey), '#9e9a92'], [drape(re - 0.32, re - 0.04, -78.5, -66.5, 0.5, 0.015, grey), '#1c1a18']);
    }

    // ----- the low building's pad (pair 1): a plain concrete retaining edge where the ground beside it stands higher, on
    // its south and east, so its front stands exposed below the dry ground
    {
      const P = NSIA.lowPad;
      const edge = (pts: [number, number][], out: [number, number]) => {
        const face: [number, number, number][] = [], top: [number, number, number][] = [], cap: [number, number, number][] = [];
        let any = false;
        for (const [x, z] of pts) {
          const t = gh(x + out[0] * (P.bank + 0.1), z + out[1] * (P.bank + 0.1));
          face.push([x, P.h - 0.2, z]); top.push([x, Math.max(P.h + 0.02, t), z]); cap.push([x + out[0] * 0.25, Math.max(P.h + 0.02, t) + 0.04, z + out[1] * 0.25]);
          if (t - P.h > 0.1) { any = true; SOLIDS.add(x + out[0] * 0.15, z + out[1] * 0.15, 0.25); }
        }
        if (!any) return;
        c.push([sheet(face, top), '#aba597'], [sheet(top, cap), '#8f8a7e']);
      };
      const south: [number, number][] = [], east: [number, number][] = [];
      for (let x = P.x0; x <= P.x1 + 0.01; x += 0.5) south.push([Math.min(x, P.x1), P.z1]);
      for (let z = P.z0; z <= P.z1 + 0.01; z += 0.5) east.push([P.x1, Math.min(z, P.z1)]);
      edge(south, [0, 1]); edge(east, [1, 0]);
    }

    // ----- the verge before the chemistry range, by the car-park road (pair 4): reddish bare soil in the big tree's shade,
    // leaf litter, small roots and a few weeds; the long grated drain along the road's edge; the low dark planting strip
    // across its west end, between the soil and the lawn beyond
    {
      const D = NSIA.drain, V = NSIA.verge, vz0 = D.z + D.width / 2 + 0.08;
      k.meshes.push(new THREE.Mesh(drape(V.x0, V.x1, vz0, V.z1, 0.5, 0.025, (x, z) => {
        const n = vnoise(x * 0.6, z * 0.6), m = hash(x * 3.1, z * 2.7);
        if (x < 167.2) return null;
        return n > 0.84 ? [0.42, 0.44, 0.28] : [0.62 + n * 0.1 + m * 0.04, 0.4 + n * 0.05, 0.3 + n * 0.04];
      }), coverMat()));
      for (let i = 0; i < 320; i++) {
        const x = 167.5 + hash(i, 3) * (V.x1 - 167.5), z = vz0 + hash(i, 7) * (V.z1 - vz0), yy = gh(x, z) + 0.035, r = 0.05 + hash(i, 9) * 0.07;
        c.push([new THREE.CircleGeometry(r, 5).rotateX(-Math.PI / 2).rotateY(hash(i, 11) * 6).translate(X(x), yy, Z(z)), ['#8a6a3a', '#a57d42', '#6d5530', '#b39250'][i % 4]]);
      }
      for (let i = 0; i < 34; i++) {
        const x = 168 + hash(i, 13) * (V.x1 - 168.5), z = vz0 + hash(i, 17) * (V.z1 - vz0), yy = gh(x, z);
        c.push([new THREE.ConeGeometry(0.1, 0.25 + hash(i, 19) * 0.2, 4).translate(X(x), yy + 0.12, Z(z)), '#566b32']);
      }
      c.push([box(X(166.5), X(167.2), gh(166.8, -85) - 0.05, gh(166.8, -85) + 0.42, Z(vz0), Z(V.z1)), '#24361e']);
      // the grated drain along the road's edge: concrete lips, the dark channel, the transverse bars
      const y = (x: number) => gh(x, D.z);
      const dz0 = D.z - D.width / 2, dz1 = D.z + D.width / 2;
      const one = () => [1, 1, 1] as [number, number, number];
      c.push([drape(D.x0, D.x1, dz0 - 0.08, dz0, 0.5, 0.045, one), '#a29d94'], [drape(D.x0, D.x1, dz1, dz1 + 0.08, 0.5, 0.045, one), '#a29d94']);
      c.push([drape(D.x0, D.x1, dz0, dz1, 0.5, 0.012, one), '#0f0e0d']);
      for (let x = D.x0 + 0.04; x < D.x1; x += D.barGap + 0.035) c.push([box(X(x), X(x + 0.035), y(x) + 0.015, y(x) + 0.045, Z(dz0), Z(dz1)), '#1d1c1b']);
      for (const z of [dz0 + 0.02, dz1 - 0.02]) c.push([ribbon([[D.x0, z], [D.x1, z]], -0.012, 0.012, 0.046), '#262523']);
    }

    // ----- the telecommunications mast among the trees on the belt (pair 3): a greenish tapering pole, the pale panels
    // in a small cluster near the top, a cable down it
    {
      const x = 225.4, z = -45.5, y = gh(x, z), H = 23;
      c.push([new THREE.CylinderGeometry(0.16, 0.34, H, 10).translate(X(x), y + H / 2, Z(z)), '#7f8c74']);
      c.push([new THREE.CylinderGeometry(0.75, 0.75, 0.08, 14).translate(X(x), y + H - 2.4, Z(z)), '#6c7562']);
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; c.push([box(X(x) + Math.cos(a) * 0.62 - 0.12, X(x) + Math.cos(a) * 0.62 + 0.12, y + H - 2.3, y + H - 0.6, Z(z) + Math.sin(a) * 0.62 - 0.06, Z(z) + Math.sin(a) * 0.62 + 0.06), '#dfe2dc']); }
      for (let i = 0; i < 2; i++) c.push([new THREE.CylinderGeometry(0.22, 0.22, 0.12, 10).rotateZ(Math.PI / 2).translate(X(x) + 0.3, y + H - 4 - i * 1.2, Z(z) + (i ? 0.3 : -0.3)), '#e6e7e2']);
      c.push([box(X(x) + 0.17, X(x) + 0.2, y, y + H - 2.4, Z(z) - 0.02, Z(z) + 0.02), '#262626']);
      c.push([box(X(x) - 0.6, X(x) + 0.6, y, y + 0.25, Z(z) - 0.6, Z(z) + 0.6), '#a9a49a']);
      SOLIDS.add(x, z, 0.5);
    }

    // ----- the ground cover: straw-brown and olive grass, reddish earth, worn bare under the trees (the belt, NSIA Road's
    // east bank); restrained, not a bright lawn
    {
      const dry = (x: number, z: number): [number, number, number] => {
        const n = vnoise(x * 0.18, z * 0.18), m = vnoise(x * 0.9 + 9, z * 0.9 - 3), e = vnoise(x * 0.31 - 5, z * 0.37 + 2);
        // exposed reddish earth in blotches, more of it where feet and shade wear the grass away
        if (e > 0.72 && m > 0.45) return [0.58 + m * 0.05, 0.4, 0.29];
        const straw = Math.min(1, Math.max(0, n * 1.25 - 0.1));
        return [0.5 + straw * 0.2 + m * 0.03, 0.52 + straw * 0.1, 0.3 + straw * 0.03];
      };
      const P = NSIA.lowPad;
      k.meshes.push(new THREE.Mesh(drape(214, B.x1 - 0.5, -95, B.z1 + B.south - 0.4, 0.5, 0.035, (x, z) => {
        if (z >= B.z0 - 0.5 ? x < wallX(z) + 0.4 : x < 214.6) return null;
        if (x > P.x0 - 0.45 && x < P.x1 + 0.45 && z > P.z0 - 0.45 && z < P.z1 + 0.45) return null;
        return dry(x, z);
      }), coverMat()));
      k.meshes.push(new THREE.Mesh(drape(239.8, 247, -56, 10, 0.5, 0.035, (x, z) => (x < 235 + NSIA.nsiaHalf + 0.25 ? null : dry(x, z))), coverMat()));
      for (const m of k.meshes.slice(-2)) m.receiveShadow = true;
    }

    // ----- NSIA Road's short retained stretch on the east (pair 6): the stone face where the bank stands steep, easing
    // into the bank at its ends
    {
      const R = NSIA.eastWall, face: [number, number, number][] = [], top: [number, number, number][] = [], capF: [number, number, number][] = [], capT: [number, number, number][] = [];
      for (let z = R.z0 - R.ease * 0.6; z <= R.z1 + R.ease * 0.6 + 0.01; z += 0.5) {
        const fx = 235 + NSIA.nsiaHalf + 0.02, base = gh(fx - 0.3, z) - 0.2, t = gh(fx + Math.max(0.3, R.bank) + 0.05, z);
        face.push([fx, base, z]); top.push([fx, t - 0.05, z]); capF.push([fx - 0.04, t - 0.06, z]); capT.push([fx - 0.04, t + 0.06, z]);
        SOLIDS.add(fx + 0.15, z, 0.25);
      }
      stone.push([sheet(face, top), '#ffffff']);
      c.push([sheet(capF, capT), '#3b342d']);
    }

    // ----- the car park's small planted islands in curved kerbs (pair 1)
    for (const [x, z, r] of [[177.5, -101.5, 1.6], [183.2, -95.8, 1.2]] as [number, number, number][]) {
      const y = gh(x, z);
      c.push([new THREE.CylinderGeometry(r, r, 0.16, 20, 1, true).translate(X(x), y + 0.08, Z(z)), '#c9c4b8'], [new THREE.CircleGeometry(r - 0.05, 20).rotateX(-Math.PI / 2).translate(X(x), y + 0.15, Z(z)), '#5a4632']);
      for (let i = 0; i < 5; i++) c.push([new THREE.IcosahedronGeometry(0.35, 0).scale(1.2, 0.8, 1.2).translate(X(x) + Math.cos(i * 1.3) * r * 0.5, y + 0.4, Z(z) + Math.sin(i * 1.3) * r * 0.5), '#3d5e2c']);
      SOLIDS.add(x, z, r);
    }

    // ----- the trees: on the belt (the pruned, sparse trunk and the fuller tree beside it in pair 3; the big trunks by the
    // worn path in pair 5); over the verge by the car-park road (pair 4); on NSIA Road's east bank (pair 6)
    broadleaf(k, trees, 218.6, -73.5, { h: 8, spread: 9, seed: 11 });
    broadleaf(k, trees, 224.5, -66, { h: 7, spread: 8, seed: 23 });
    broadleaf(k, trees, 219.4, -55.5, { h: 9, spread: 4, sparse: true, seed: 31 });
    broadleaf(k, trees, 227.8, -53, { h: 8.5, spread: 10, seed: 37 });
    broadleaf(k, trees, 219.6, -44.5, { h: 9, spread: 8.5, seed: 41 });
    broadleaf(k, trees, 228.6, -36.5, { h: 8, spread: 9, seed: 53 });
    broadleaf(k, trees, 221.8, -33.4, { h: 7.5, spread: 7, seed: 59 });
    broadleaf(k, trees, 230.0, -76, { h: 7, spread: 7, seed: 61 });
    broadleaf(k, trees, NSIA.verge.tree[0], NSIA.verge.tree[1], { h: 4.6, spread: 11, lean: -0.1, seed: 67 });
    broadleaf(k, trees, 174.5, -84.6, { h: 5.5, spread: 7, seed: 69 });
    broadleaf(k, trees, 244.8, -4.5, { h: 7.5, spread: 12, seed: 71 });
    broadleaf(k, trees, 243.2, -30, { h: 7, spread: 9, seed: 73 });

    // ----- the hill's continuation north to J.K.M. Hodasi Road (the owner's NSIA hillside correction; relief.ts): the low
    // stone wall holding it at the end of the passage beside the Frank Torto tower, a dark coping; the dry ground cover
    // on it; mature broadleaf trees in an irregular mass with shrubs under them
    {
      const N = NSIA.north, zw = N.passEnd;
      const face: [number, number, number][] = [], top: [number, number, number][] = [], capF: [number, number, number][] = [], capT: [number, number, number][] = [], capB: [number, number, number][] = [];
      for (let x = N.x0 - 1.2; x <= N.x0e + 0.4; x += 0.5) {
        const base = gh(x, zw + 0.5) - 0.3, t = gh(x, zw - 0.6);
        if (t - base < 0.35) continue;
        face.push([x, base, zw]); top.push([x, t - 0.06, zw]);
        capF.push([x, t - 0.07, zw + 0.05]); capT.push([x, t + 0.07, zw + 0.05]); capB.push([x, t + 0.07, zw - 0.55]);
        SOLIDS.add(x, zw - 0.2, 0.3);
      }
      stone.push([sheet(face, top), '#ffffff']);
      c.push([sheet(capF, capT), '#3b342d'], [sheet(capT, capB), '#453d35']);
      const dry = (x: number, z: number): [number, number, number] => {
        const n = vnoise(x * 0.18, z * 0.18), m = vnoise(x * 0.9 + 9, z * 0.9 - 3), e = vnoise(x * 0.31 - 5, z * 0.37 + 2);
        if (e > 0.7 && m > 0.45) return [0.56 + m * 0.05, 0.39, 0.28];
        const straw = Math.min(1, Math.max(0, n * 1.2 - 0.15));
        return [0.42 + straw * 0.2 + m * 0.03, 0.5 + straw * 0.1, 0.27 + straw * 0.03];
      };
      const P = NSIA.lowPad;
      k.meshes.push(new THREE.Mesh(drape(N.x0 - 0.5, N.x1 - 0.5, N.z0 - N.n + 0.5, N.z1e, 0.5, 0.035, (x, z) => {
        if (z > zw - 0.4 && x < N.x0e - 0.4) return null;
        if (x > P.x0 - 0.45 && x < P.x1 + 0.45 && z > P.z0 - 0.45 && z < P.z1 + 0.45) return null;
        return dry(x, z);
      }), coverMat()));
      k.meshes[k.meshes.length - 1].receiveShadow = true;
      // the trees: dense and irregular, bigger toward NSIA Road, a few along the tower's side
      const T: [number, number, number, number][] = [[212.5, -106, 7.5, 9], [220.5, -104.5, 8.5, 11], [228.5, -100, 8, 10], [228, -88, 7.5, 9], [216, -114, 7, 8],
        [225, -116, 9, 12], [209.5, -124, 6.5, 8], [219, -128, 8, 10], [228.6, -131, 8.5, 11], [213, -139, 7.5, 9], [222.5, -143, 8, 10], [229, -150, 6.5, 8], [208, -146, 6, 7]];
      T.forEach(([x, z, h, sp], i) => broadleaf(k, trees, x, z, { h, spread: sp, seed: 101 + i * 7, sparse: i === 6 }));
      for (let i = 0; i < 46; i++) {
        const x = N.x0 + 1 + ((i * 37) % 97) / 97 * (N.x1 - N.x0 - 4), z = N.z0 + 1 + ((i * 61) % 89) / 89 * (zw - N.z0 - 3), y = gh(x, z), r = 0.6 + (i % 4) * 0.25;
        trees.push([new THREE.IcosahedronGeometry(r, 1).scale(1.3, 0.75, 1.1).translate(X(x), y + r * 0.5, Z(z)), ['#2f4a25', '#3e5d2e', '#36552a', '#4a6332'][i % 4]]);
      }
    }

    stoneMeshOf(k, stone);
    const m = new THREE.Mesh(merge(c), concrete(0.25)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    const t = new THREE.Mesh(merge(trees), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 })); t.castShadow = true; t.receiveShadow = true; k.meshes.push(t);
  },
};

/** stone-faced parts as one mesh in the kit, in the irregular warm stone of the retaining walls */
export function stoneMeshOf(k: Kit, parts: Part[]) {
  if (!parts.length) return;
  const geos = parts.map(([g]) => {
    const n = g.index ? g.toNonIndexed() : g;
    if (!n.attributes.normal) n.computeVertexNormals();
    const cnt = n.attributes.position.count, col = new Float32Array(cnt * 3), p = n.attributes.position as THREE.BufferAttribute;
    // a slow tint along the wall so the stones' colour drifts, as weathering does
    for (let i = 0; i < cnt; i++) { const v = 0.86 + vnoise(p.getX(i) * 0.3, p.getZ(i) * 0.3) * 0.22; col[i * 3] = v; col[i * 3 + 1] = v * 0.97; col[i * 3 + 2] = v * 0.94; }
    n.setAttribute('color', new THREE.BufferAttribute(col, 3));
    for (const key of Object.keys(n.attributes)) if (key !== 'position' && key !== 'normal' && key !== 'color') n.deleteAttribute(key);
    return n;
  });
  const m = new THREE.Mesh(merge(geos.map((g) => [g, '#ffffff'] as Part)), wallStone());
  m.castShadow = true; m.receiveShadow = true;
  k.meshes.push(m);
}

/** NSIA Road by the Frank Torto Building (the owner's reconstruction brief) */
export const nsiaSite = createSite('nsia-road', [nsiaSpec]);
