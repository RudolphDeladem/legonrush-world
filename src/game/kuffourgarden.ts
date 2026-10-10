// The Kuffour Quadrangle behind the Balme Library, the owner's reconstruction brief (seven game/photo pairs and an
// overhead map; the adjustable numbers are in kuffour.ts, the raised garden in relief.ts). Built here, in world
// coordinates over the ground the relief makes:
// - the garden's outline from the map: a low wall of warm irregular stone with a pale coping along Hodasi Road and
//   along the road south of it, jogging out toward the roads in the middle, open on the axis; the ground behind it
//   raised; a strip of reddish earth between the asphalt and the wall (pairs 2 and 3);
// - the memorial approach on the axis from Hodasi Road (pair 1): a tiled floor with pale worn repairs between low stone
//   side walls with a broad light coping, steps up, the red-paved landing with its raised red edge, the black upright
//   portrait memorial on its stepped plinth, two palms framing it, red-edged beds of small plants;
// - the dark standing statue on its rectangular pedestal beside the landing (pair 2);
// - the paved square in the middle behind white planter walls with low hedges; the round fountain at its centre with
//   the pale sculpture of interlocking loops (pairs 1 and 2: the earlier photo shows it blue, see kuffour.ts); round it
//   the ring of segmented features from the map: curved water basins east, west and south, a curved planted bed north,
//   eight round shrub beds between them;
// - the lawns either side of the square, the east-west path across the garden and the path to the south gate, the
//   lawns' low red-painted edges, short blue-and-white bollard lights, small palms, shrubs and the leaning tree by the
//   north-east corner (pair 3);
// - the zebra crossings over Hodasi Road, one on the approach's axis (pair 3);
// - the mature broadleaf trees between the garden and the library that screen its north front (pair 2).
import * as THREE from 'three';
import { box, merge, type Part } from './modelkit';
import { createSite, type Kit, type Spec } from './blocks';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { groundHeight } from './relief';
import { KQ } from './kuffour';
import { broadleaf, stoneMeshOf } from './nsiaroad';

const O: [number, number] = KQ.centre;
const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
const gh = groundHeight;
const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(Math.min(x0, x1)), X(Math.max(x0, x1)), y0, y1, Z(Math.min(z0, z1)), Z(Math.max(z0, z1)));

/** a small deterministic noise for colours and jitter */
const hash = (x: number, z: number) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
const vnoise = (x: number, z: number) => {
  const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

/** a grid over x0..x1, z0..z1 following the ground `lift` above it, coloured by `col` (null leaves a cell out) */
export function drapeAt(org: [number, number], x0: number, x1: number, z0: number, z1: number, cell: number, lift: number, col: (x: number, z: number) => [number, number, number] | null) {
  const nx = Math.max(1, Math.round((x1 - x0) / cell)), nz = Math.max(1, Math.round((z1 - z0) / cell));
  const pos: number[] = [], color: number[] = [], idx: number[] = [], keep: boolean[] = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = x0 + ((x1 - x0) * i) / nx, z = z0 + ((z1 - z0) * j) / nz, c = col(x, z);
    keep.push(!!c);
    pos.push(x - org[0], gh(x, z) + lift, z - org[1]);
    const cc = c ?? [0, 0, 0]; color.push(cc[0] ** 2.2, cc[1] ** 2.2, cc[2] ** 2.2);
  }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
    if (keep[a] && keep[b] && keep[c] && keep[d]) idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(color, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
const drape = (x0: number, x1: number, z0: number, z1: number, cell: number, lift: number, col: (x: number, z: number) => [number, number, number] | null) => drapeAt(O, x0, x1, z0, z1, cell, lift, col);
let coverMat: THREE.MeshStandardMaterial | null = null;
/** the ground drapes: vertex colours, drawn over the grass */
export const groundCover = () => (coverMat ??= new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));

/** a Christmas palm (pair 1): a slender ringed grey trunk, a little crooked, a green crownshaft, a dense crown of arching
 *  fronds with their leaflets hanging either side (drawn double-sided) */
export function christmasPalm(fronds: Part[], trunk: Part[], org: [number, number], x: number, z: number, h: number, seed: number) {
  const y = gh(x, z), r = (i: number) => hash(seed + i * 1.37, seed * 0.71 - i);
  const lx = (r(1) - 0.5) * 0.5, lz = (r(2) - 0.5) * 0.5;
  const tx = x - org[0], tz = z - org[1];
  const n = 6;
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n, b = t0 * t0, c = t1 * t1;
    const a = new THREE.Vector3(tx + lx * b, y + h * t0, tz + lz * b), e = new THREE.Vector3(tx + lx * c, y + h * t1, tz + lz * c);
    const L = a.distanceTo(e), seg = new THREE.CylinderGeometry(0.13 - t1 * 0.03, 0.16 - t0 * 0.03, L, 8).translate(0, L / 2, 0);
    seg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), e.clone().sub(a).normalize()));
    trunk.push([seg.translate(a.x, a.y, a.z), i % 2 ? '#9d968a' : '#8e877b']);
  }
  const top = new THREE.Vector3(tx + lx, y + h, tz + lz);
  trunk.push([new THREE.CylinderGeometry(0.12, 0.14, 0.9, 8).translate(top.x, top.y + 0.45, top.z), '#6f8a3e']);
  const nf = 20;
  for (let i = 0; i < nf; i++) {
    const az = (i / nf) * Math.PI * 2 + r(10 + i) * 0.4, up = 0.55 + r(30 + i) * 0.6 - (i % 3) * 0.25, len = 2.2 + r(50 + i) * 0.8;
    const pos: number[] = [], idx: number[] = [];
    const m = 9;
    for (let k = 0; k <= m; k++) {
      const s = k / m, d = len * s, rise = Math.sin(up) * d - 0.55 * d * d / len * (1.2 - up * 0.3);
      const cx = Math.cos(az) * Math.cos(up * 0.6) * d, cz = Math.sin(az) * Math.cos(up * 0.6) * d;
      const w = 0.78 * Math.sin(Math.PI * Math.min(1, s * 1.15)) + 0.04, droop = 0.28 * w;
      const px = -Math.sin(az), pz = Math.cos(az);
      pos.push(top.x + cx - px * w, top.y + 0.9 + rise - droop, top.z + cz - pz * w);
      pos.push(top.x + cx, top.y + 0.9 + rise, top.z + cz);
      pos.push(top.x + cx + px * w, top.y + 0.9 + rise - droop, top.z + cz + pz * w);
      if (k < m) { const p = k * 3; idx.push(p, p + 1, p + 3, p + 1, p + 4, p + 3, p + 1, p + 2, p + 4, p + 2, p + 5, p + 4); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    fronds.push([g, ['#3f6b2a', '#4d7a31', '#5a8636', '#36602a'][i % 4]]);
  }
  SOLIDS.add(x, z, 0.2);
}

/** a flat annular sector round the centre (angles from north, clockwise, radians), extruded `h` up from y */
const sector = (r0: number, r1: number, a0: number, a1: number, y: number, h: number) => {
  const s = new THREE.Shape(), n = 16;
  for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; s[i ? 'lineTo' : 'moveTo'](Math.sin(a) * r1, Math.cos(a) * r1); }
  for (let i = n; i >= 0; i--) { const a = a0 + ((a1 - a0) * i) / n; s.lineTo(Math.sin(a) * r0, Math.cos(a) * r0); }
  return new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 4 }).rotateX(-Math.PI / 2).translate(X(KQ.centre[0]), y, Z(KQ.centre[1]));
};

let portraitMat: THREE.MeshStandardMaterial | null = null;
/** the memorial's face: polished black with a pale portrait (head and shoulders) in a thin frame; no inscription is
 *  invented, only faint lines where the photo shows lettering */
function portrait() {
  if (portraitMat) return portraitMat;
  const c = document.createElement('canvas'); c.width = 256; c.height = 320;
  const g = c.getContext('2d')!;
  g.fillStyle = '#121212'; g.fillRect(0, 0, 256, 320);
  g.strokeStyle = '#5a5a58'; g.lineWidth = 2; g.strokeRect(14, 14, 228, 292);
  for (const [y, w] of [[34, 150], [44, 110]] as [number, number][]) { g.fillStyle = '#3c3c3a'; g.fillRect(128 - w / 2, y, w, 3); }
  const gr = g.createRadialGradient(128, 130, 10, 128, 140, 70);
  gr.addColorStop(0, '#d8d6d0'); gr.addColorStop(0.7, '#a9a7a2'); gr.addColorStop(1, '#3a3a38');
  g.fillStyle = '#2b2b29'; g.beginPath(); g.ellipse(128, 104, 50, 34, 0, Math.PI, 0); g.fill();
  g.fillStyle = gr; g.beginPath(); g.ellipse(128, 136, 44, 56, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#4a4a47'; for (const x of [110, 146]) { g.beginPath(); g.ellipse(x, 128, 9, 5, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#6a6864'; g.fillRect(124, 134, 8, 18); g.fillRect(112, 166, 32, 5);
  g.fillStyle = '#8f8d88'; g.beginPath(); g.moveTo(40, 280); g.quadraticCurveTo(64, 200, 128, 196); g.quadraticCurveTo(192, 200, 216, 280); g.closePath(); g.fill();
  for (let y = 286; y < 300; y += 6) { g.fillStyle = '#3c3c3a'; g.fillRect(70, y, 116, 2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return (portraitMat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, metalness: 0.1 }));
}

const kqSpec: Spec = {
  name: 'Kuffour Quadrangle',
  axis: [1, 0], origin: O, storey: 3, style: { bay: 3, up: [], ground: [], draw: (g) => { g.fillStyle = '#ccc'; g.fillRect(0, 0, 256, 512); } }, roofColor: '#888', fascia: '#888', pitch: 0.1,
  onGround: true,
  blocks: [],
  // the garden and its frontage on Hodasi Road; the ground under the trees before the library: nothing generic on them
  keep: [[X(-31), X(43), Z(-160), Z(-88.6)], [X(-6), X(17), Z(-168), Z(-158)]],
  // the mapped plaza in the garden: the square is drawn here
  covers: [[5.7, -124.8]],
  extras: (k: Kit) => {
    const c: Part[] = [], stone: Part[] = [], trees: Part[] = [], fronds: Part[] = [], trunks: Part[] = [];
    const G = KQ.garden, W = KQ.wall, Q = KQ.square, gate = KQ.gate, [cx, cz] = KQ.centre;
    const H = G.h;

    // ----- the garden's walls along the roads: stone from below the ground to the coping; segments [x0, z0, x1, z1]
    // with the side the road is on (dz: -1 north, +1 south; dx for the short returns)
    const COPING = '#d9d2c2';
    const runs: [number, number, number, number, number, number][] = [];
    for (const [z, jz, s] of [[G.z0, G.nz, -1], [G.z1, G.sz, 1]] as [number, number, number][]) {
      runs.push([G.x0, z, G.jx0, z, 0, s], [G.jx0, z, G.jx0, jz, -1, 0], [G.jx0, jz, gate.x0, jz, 0, s]);
      runs.push([gate.x1, jz, G.jx1, jz, 0, s], [G.jx1, jz, G.jx1, z, 1, 0], [G.jx1, z, G.x1, z, 0, s]);
    }
    for (const [x0, z0, x1, z1, dx, dz] of runs) {
      const T = W.thick, alongX = z0 === z1;
      // the wall stands on the road side of the line; its top a fixed height over the ground outside
      const ox = (x0 + x1) / 2 + dx * (T + 0.8), oz = (z0 + z1) / 2 + dz * (T + 0.8);
      const top = gh(ox, oz) + W.top, base = Math.min(gh(ox, oz), 0) - 0.3;
      const [a0, a1] = alongX ? [Math.min(x0, x1), Math.max(x0, x1)] : [Math.min(z0, z1), Math.max(z0, z1)];
      if (alongX) {
        const zf = z0 + dz * T; // the face toward the road
        stone.push([B(a0, a1, base, top - W.coping, Math.min(z0, zf), Math.max(z0, zf)), '#ffffff']);
        c.push([B(a0 - W.over, a1 + W.over, top - W.coping, top, Math.min(z0, zf) - W.over, Math.max(z0, zf) + W.over), COPING]);
        for (let x = a0; x <= a1; x += 0.4) SOLIDS.add(x, (z0 + zf) / 2, 0.28);
      } else {
        const xf = x0 + dx * T;
        stone.push([B(Math.min(x0, xf), Math.max(x0, xf), base, top - W.coping, a0 - T, a1 + T), '#ffffff']);
        c.push([B(Math.min(x0, xf) - W.over, Math.max(x0, xf) + W.over, top - W.coping, top, a0 - T - W.over, a1 + T + W.over), COPING]);
        for (let z = a0; z <= a1; z += 0.4) SOLIDS.add((x0 + xf) / 2, z, 0.28);
      }
    }
    // the open ends of the north and south runs at the garden's west and east corners: a short stone pier
    for (const x of [G.x0, G.x1]) for (const [z, s] of [[G.z0, -1], [G.z1, 1]] as [number, number][]) {
      const top = gh(x, z + s * 1.2) + W.top;
      stone.push([B(x - 0.25, x + 0.25, -0.3, top - W.coping, Math.min(z, z + s * W.thick), Math.max(z, z + s * W.thick)), '#ffffff']);
    }

    // ----- the strips of reddish earth between the roads' asphalt and the walls, worn, a few weeds (pairs 2 and 3)
    {
      const earth = (x: number, z: number): [number, number, number] => {
        const n = vnoise(x * 0.35, z * 0.35), m = hash(x * 2.3, z * 1.9);
        return n > 0.8 ? [0.47, 0.47, 0.3] : [0.6 + n * 0.08 + m * 0.03, 0.39 + n * 0.04, 0.28 + n * 0.03];
      };
      k.meshes.push(new THREE.Mesh(drape(G.x0 - 3, G.x1 + 3, KQ.hodasiEdge, G.z0 - W.thick, 0.5, 0.03, (x, z) => {
        const wall = x > G.jx0 && x < G.jx1 ? G.nz - W.thick : G.z0 - W.thick;
        if (z > wall + 0.02) return null;
        if (x > gate.x0 && x < gate.x1 && z > KQ.approach.z0) return null;
        return earth(x, z);
      }), groundCover()));
    }

    // ----- the ground inside: lawns, the square's pale paving, the paths; mottled, not a flat colour
    {
      const lawn = (x: number, z: number): [number, number, number] => {
        const n = vnoise(x * 0.22, z * 0.22), m = vnoise(x * 1.1 + 4, z * 1.1 - 2);
        if (n > 0.78 && m > 0.55) return [0.52, 0.48, 0.3];
        return [0.27 + n * 0.1 + m * 0.03, 0.43 + n * 0.08, 0.19 + n * 0.03];
      };
      const sand = (x: number, z: number): [number, number, number] => {
        const n = vnoise(x * 0.3, z * 0.3), m = hash(x * 1.7, z * 2.1);
        return [0.76 + n * 0.06 + m * 0.02, 0.7 + n * 0.05, 0.58 + n * 0.04];
      };
      const inside = (x: number, z: number) => (x > G.x0 && x < G.x1 && z > G.z0 && z < G.z1) || (x > G.jx0 && x < G.jx1 && z > G.nz && z < G.sz);
      const inSquare = (x: number, z: number) => x > Q.x0 && x < Q.x1 && z > Q.z0 && z < Q.z1;
      const L = KQ.landing;
      k.meshes.push(new THREE.Mesh(drape(G.x0, G.x1, G.nz, G.sz, 0.5, 0.05, (x, z) => {
        if (!inside(x, z)) return null;
        if (x > L.x0 - 0.1 && x < L.x1 + 0.1 && z > L.z0 - 0.1 && z < L.z1 + 0.1) return null;
        if (z < G.nz + 1.6 && x > gate.x0 && x < gate.x1) return null;
        if (inSquare(x, z)) return sand(x, z);
        if (z > KQ.ewPath.z0 && z < KQ.ewPath.z1) return sand(x, z);
        if (x > gate.x0 && x < gate.x1 && (z > Q.z1 || z < Q.z0)) return sand(x, z);
        return lawn(x, z);
      }), groundCover()));
      for (const m of k.meshes.slice(-2)) m.receiveShadow = true;
    }

    // ----- the lawns' low red-painted edges along the paths and the gate path (pair 3: red boundaries round the
    // lawn compartments)
    {
      const RED = '#a3382c';
      const edge = (x0: number, x1: number, z0: number, z1: number) => {
        const y = gh((x0 + x1) / 2, (z0 + z1) / 2);
        c.push([B(x0, x1, y - 0.05, y + 0.17, z0, z1), RED]);
      };
      for (const [a, b] of [[G.x0 + 0.3, Q.x0], [Q.x1, G.x1 - 0.3]]) { edge(a, b, KQ.ewPath.z0 - 0.15, KQ.ewPath.z0); edge(a, b, KQ.ewPath.z1, KQ.ewPath.z1 + 0.15); }
      for (const [z0, z1] of [[Q.z1, G.sz - 0.1], [G.nz + 1.7, Q.z0]] as [number, number][]) if (z1 > z0) { edge(gate.x0 - 0.15, gate.x0, z0, z1); edge(gate.x1, gate.x1 + 0.15, z0, z1); }
    }

    // ----- the square's white planter walls with low clipped hedges, open on the axes (pair 2: low white boundaries)
    {
      const PW = 0.7, ph = 0.42;
      const planter = (x0: number, x1: number, z0: number, z1: number) => {
        const y = gh((x0 + x1) / 2, (z0 + z1) / 2);
        c.push([B(x0, x1, y - 0.05, y + ph, z0, z1), '#ecebe5']);
        k.plain.push([B(x0 + 0.1, x1 - 0.1, y + ph, y + ph + 0.02, z0 + 0.1, z1 - 0.1), '#4a3a2c']);
        const along = x1 - x0 > z1 - z0, len = along ? x1 - x0 : z1 - z0, n = Math.max(1, Math.round(len / 0.9));
        for (let i = 0; i < n; i++) {
          const t = (i + 0.5) / n, px = along ? x0 + (x1 - x0) * t : (x0 + x1) / 2, pz = along ? (z0 + z1) / 2 : z0 + (z1 - z0) * t;
          c.push([new THREE.IcosahedronGeometry(0.42, 0).scale(along ? 1.3 : 0.75, 0.75, along ? 0.75 : 1.3).translate(X(px), y + ph + 0.22 + hash(px, pz) * 0.08, Z(pz)), ['#2f5226', '#365c2b', '#2a4a22'][i % 3]]);
        }
        for (let t = 0; t <= 1.001; t += 0.5 / Math.max(x1 - x0, z1 - z0)) SOLIDS.add(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, 0.35);
      };
      for (const [z, s] of [[Q.z0, 1], [Q.z1, -1]] as [number, number][]) {
        const za = s > 0 ? z : z - PW, zb = s > 0 ? z + PW : z;
        planter(Q.x0, gate.x0 - 0.6, za, zb); planter(gate.x1 + 0.6, Q.x1, za, zb);
      }
      for (const [x, s] of [[Q.x0, 1], [Q.x1, -1]] as [number, number][]) {
        const xa = s > 0 ? x : x - PW, xb = s > 0 ? x + PW : x;
        planter(xa, xb, Q.z0 + PW, KQ.ewPath.z0 - 0.4); planter(xa, xb, KQ.ewPath.z1 + 0.4, Q.z1 - PW);
      }
    }

    // ----- the round fountain at the centre: a white rim banded in blue inside, the water, the pedestal and the
    // sculpture of interlocking loops (pale in the newer photos; blue in the owner's earlier one)
    {
      const y = gh(cx, cz), R = KQ.fountain.r;
      const rim = new THREE.Shape().absarc(0, 0, R, 0, Math.PI * 2, false);
      rim.holes.push(new THREE.Path().absarc(0, 0, R - 0.38, 0, Math.PI * 2, true));
      c.push([new THREE.ExtrudeGeometry(rim, { depth: 0.6, bevelEnabled: false, curveSegments: 40 }).rotateX(-Math.PI / 2).translate(X(cx), y - 0.05, Z(cz)), '#f1efe9']);
      c.push([new THREE.CylinderGeometry(R - 0.37, R - 0.37, 0.16, 40, 1, true).translate(X(cx), y + 0.36, Z(cz)), '#3f86c4']);
      c.push([new THREE.CircleGeometry(R - 0.38, 40).rotateX(-Math.PI / 2).translate(X(cx), y + 0.38, Z(cz)), '#4c8fb4']);
      // a low step ring round it
      const step = new THREE.Shape().absarc(0, 0, R + 0.9, 0, Math.PI * 2, false);
      step.holes.push(new THREE.Path().absarc(0, 0, R - 0.1, 0, Math.PI * 2, true));
      c.push([new THREE.ExtrudeGeometry(step, { depth: 0.15, bevelEnabled: false, curveSegments: 40 }).rotateX(-Math.PI / 2).translate(X(cx), y - 0.05, Z(cz)), '#c9c0ac']);
      const pale = KQ.fountain.sculpture === 'pale', S1 = pale ? '#ebe8e0' : '#3d7fc4', S2 = pale ? '#dcd8ce' : '#f3f1ec', S3 = pale ? '#e4e0d6' : '#4a90d0';
      c.push([B(cx - 0.55, cx + 0.55, y + 0.3, y + 2.4, cz - 0.55, cz + 0.55), S1]);
      for (const yy of [0.9, 1.5, 2.0]) c.push([B(cx - 0.58, cx + 0.58, y + yy, y + yy + 0.18, cz - 0.58, cz + 0.58), S2]);
      c.push([B(cx - 1.3, cx + 1.3, y + 2.4, y + 2.7, cz - 1.3, cz + 1.3), S1]);
      // two tall loops twisted through each other
      c.push([new THREE.TorusGeometry(1.0, 0.17, 10, 30).scale(0.85, 1.25, 1).translate(X(cx) - 0.15, y + 4.05, Z(cz)), S3]);
      c.push([new THREE.TorusGeometry(0.8, 0.15, 10, 26).scale(0.85, 1.3, 1).rotateY(Math.PI / 2).rotateX(0.35).translate(X(cx) + 0.25, y + 3.85, Z(cz)), S2]);
      SOLIDS.add(cx, cz, R);
    }

    // ----- the ring of segmented features round the circle (the map): curved water basins east, west and south, a
    // curved planted bed north, eight round shrub beds between them
    {
      const Rg = KQ.ring, y = gh(cx, cz), d = Math.PI / 180;
      for (const [a, half, water] of [[90, Rg.half, true], [270, Rg.half, true], [180, Rg.northHalf, true], [0, Rg.northHalf, false]] as [number, number, boolean][]) {
        const a0 = (a - half) * d, a1 = (a + half) * d, inset = 0.32;
        c.push([sector(Rg.r0, Rg.r1, a0, a1, y - 0.05, 0.6), '#efede7']);
        c.push([sector(Rg.r0 + inset, Rg.r1 - inset, a0 + inset / Rg.r0, a1 - inset / Rg.r0, y + 0.551, 0.002), water ? '#4f94b8' : '#4a3b2d']);
        if (!water) for (let i = 0; i < 9; i++) {
          const aa = a0 + (a1 - a0) * ((i + 0.5) / 9), rr = (Rg.r0 + Rg.r1) / 2 + (hash(i, 3) - 0.5) * 1.6;
          c.push([new THREE.IcosahedronGeometry(0.55 + hash(i, 5) * 0.35, 0).scale(1.1, 0.8, 1.1).translate(X(cx + Math.sin(aa) * rr), y + 0.95, Z(cz - Math.cos(aa) * rr)), ['#3b6a2c', '#2f5a24', '#4d7a33'][i % 3]]);
        }
        for (let t = 0; t <= 1.001; t += 0.1) { const aa = a0 + (a1 - a0) * t; SOLIDS.add(cx + Math.sin(aa) * (Rg.r0 + Rg.r1) / 2, cz - Math.cos(aa) * (Rg.r0 + Rg.r1) / 2, (Rg.r1 - Rg.r0) / 2); }
      }
      for (const base of [0, 90, 180, 270]) for (const s of [-1, 1]) {
        const a = (base + s * Rg.beds) * d, bx = cx + Math.sin(a) * Rg.bedR, bz = cz - Math.cos(a) * Rg.bedR, by = gh(bx, bz);
        c.push([new THREE.CylinderGeometry(2.1, 2.1, 0.22, 24, 1, true).translate(X(bx), by + 0.08, Z(bz)), '#a3382c']);
        c.push([new THREE.CircleGeometry(2.05, 24).rotateX(-Math.PI / 2).translate(X(bx), by + 0.12, Z(bz)), '#4a3a2c']);
        for (let i = 0; i < 6; i++) {
          const aa = i * 1.05 + hash(bx, i) * 0.5, rr = i ? 1.2 : 0;
          c.push([new THREE.IcosahedronGeometry(0.6 + hash(i, bz) * 0.3, 1).scale(1.1, 0.85, 1.1).translate(X(bx + Math.cos(aa) * rr), by + 0.6 + hash(bx, i) * 0.2, Z(bz + Math.sin(aa) * rr)), ['#2f5a24', '#3d6b2d', '#5d8a3a', '#2a4c22'][(i + base) % 4]]);
        }
        SOLIDS.add(bx, bz, 2.0);
      }
    }

    // ----- the memorial approach from Hodasi Road (pair 1): tiles with pale worn repairs between low stone side walls
    // with a broad light coping; two steps up into the garden; the red-paved landing with its raised red edge
    {
      const A = KQ.approach, L = KQ.landing, y0 = gh((gate.x0 + gate.x1) / 2, A.z0 + 0.3);
      const tileTop = (z: number) => (z < G.nz - 0.6 ? y0 + 0.04 : H + 0.04);
      // the tiles: square terracotta, a few pale patches where they have been mended
      for (let z = A.z0; z < A.z1 - 0.01; z += 0.6) for (let x = gate.x0 + 0.05; x < gate.x1 - 0.06; x += 0.6) {
        const zz = Math.min(z + 0.58, A.z1), xx = Math.min(x + 0.58, gate.x1 - 0.05), t = tileTop(z + 0.3);
        if (z < G.nz - 0.6 && z + 0.6 > G.nz - 0.6) continue;
        const mend = hash(x * 3.1, z * 1.7) > 0.8;
        c.push([B(x, xx, t - 0.06, t, z, zz), mend ? '#d7cfc0' : hash(x, z) > 0.5 ? '#c07a55' : '#b8704d']);
      }
      // the bed under the tiles, the two steps up at the wall line
      c.push([B(gate.x0, gate.x1, y0 - 0.2, y0 - 0.02, A.z0, G.nz - 0.6), '#9b8a76']);
      c.push([B(gate.x0, gate.x1, y0 - 0.2, (y0 + H) / 2 + 0.02, G.nz - 0.6, G.nz - 0.3), '#c98a64'], [B(gate.x0, gate.x1, y0 - 0.2, H - 0.02, G.nz - 0.3, A.z1), '#b47250']);
      // the low side walls, stone with a broad pale coping
      for (const [xa, xb] of [[gate.x0 - 0.45, gate.x0], [gate.x1, gate.x1 + 0.45]]) {
        const top = Math.max(H, y0) + 0.55;
        stone.push([B(xa, xb, y0 - 0.3, top - 0.08, A.z0, A.z1 - 0.6), '#ffffff']);
        c.push([B(xa - 0.08, xb + 0.08, top - 0.08, top, A.z0 - 0.08, A.z1 - 0.6), COPING]);
        for (let z = A.z0; z <= A.z1 - 0.6; z += 0.4) SOLIDS.add((xa + xb) / 2, z, 0.3);
      }
      // the landing: red interlocking pavers on a raised slab, its raised red edge
      const ly = H + L.h;
      c.push([B(L.x0, L.x1, H - 0.3, ly, L.z0, L.z1), '#8f3a2e']);
      for (let z = L.z0 + 0.25; z < L.z1 - 0.2; z += 0.25) c.push([B(L.x0 + 0.3, L.x1 - 0.3, ly, ly + 0.004, z, z + 0.025), '#6f2a22']);
      for (const [a, b, p, q] of [[L.x0, L.x1, L.z1 - 0.25, L.z1], [L.x0, L.x0 + 0.25, L.z0, L.z1], [L.x1 - 0.25, L.x1, L.z0, L.z1], [L.x0, gate.x0 - 0.45, L.z0, L.z0 + 0.25], [gate.x1 + 0.45, L.x1, L.z0, L.z0 + 0.25]] as [number, number, number, number][]) c.push([B(a, b, ly, ly + 0.14, p, q), '#a2382b']);
      // the step up from the tiles onto the landing
      c.push([B(gate.x0, gate.x1, H - 0.2, H + L.h * 0.5, L.z0 - 0.35, L.z0), '#a7452f']);
      // the red-edged beds of small plants either side of the approach, the variegated plants, the flowering shrubs
      for (const [xa, xb] of [[gate.x0 - 3.4, gate.x0 - 0.5], [gate.x1 + 0.5, gate.x1 + 3.4]]) {
        const za = G.nz + 0.3, zb = L.z0 - 0.15, yb = H;
        for (const [a, b, p, q] of [[xa, xb, za, za + 0.15], [xa, xb, zb - 0.15, zb], [xa, xa + 0.15, za, zb], [xb - 0.15, xb, za, zb]] as [number, number, number, number][]) c.push([B(a, b, yb - 0.05, yb + 0.2, p, q), '#a3382c']);
        c.push([B(xa + 0.15, xb - 0.15, yb, yb + 0.1, za + 0.15, zb - 0.15), '#4a3a2c']);
        for (let i = 0; i < 7; i++) {
          const px = xa + 0.4 + hash(xa, i) * (xb - xa - 0.8), pz = za + 0.4 + hash(i, xa) * (zb - za - 0.8);
          if (i % 3 === 0) for (let j = 0; j < 7; j++) c.push([new THREE.ConeGeometry(0.05, 0.6, 3).translate(0, 0.3, 0).rotateZ(0.55).rotateY((j / 7) * Math.PI * 2).translate(X(px), yb + 0.1, Z(pz)), j % 2 ? '#c9c763' : '#5e8a3a']);
          else c.push([new THREE.IcosahedronGeometry(0.3 + hash(px, pz) * 0.2, 0).scale(1.2, 0.8, 1.2).translate(X(px), yb + 0.35, Z(pz)), i % 3 === 1 ? '#3b6a2c' : '#2f5a24']);
          if (i % 2) c.push([new THREE.IcosahedronGeometry(0.09, 0).translate(X(px) + 0.15, yb + 0.6, Z(pz)), '#e9e6f0']);
        }
      }
      // two palms framing the approach, close behind its side walls
      christmasPalm(fronds, trunks, O, gate.x0 - 1.3, KQ.landing.z0 - 0.5, 2.7, 3);
      christmasPalm(fronds, trunks, O, gate.x1 + 1.3, KQ.landing.z0 - 0.3, 2.9, 7);
      // the smaller palms on the lawns beyond (pair 1, the distance)
      christmasPalm(fronds, trunks, O, -6.5, -147.2, 3.6, 11);
      christmasPalm(fronds, trunks, O, 18.5, -147.6, 3.4, 13);
    }

    // ----- the memorial on the landing: a black upright slab bearing the portrait on a stepped stone plinth
    {
      const [mx, mz] = KQ.memorial, y = H + KQ.landing.h;
      const tiers: [number, number, number, string][] = [[1.0, 0.75, 0.16, '#d6cfbf'], [0.8, 0.55, 0.16, '#cfc7b6'], [0.62, 0.3, 0.24, '#bdb4a2']];
      let yy = y;
      for (const [hx, hz, th, col] of tiers) { c.push([B(mx - hx, mx + hx, yy, yy + th, mz - hz, mz + hz), col]); yy += th; }
      c.push([B(mx - 0.5, mx + 0.5, yy, yy + 1.32, mz - 0.08, mz + 0.08), '#111111']);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 1.26).rotateY(Math.PI).translate(X(mx), yy + 0.67, Z(mz - 0.082)), portrait());
      face.castShadow = false; k.meshes.push(face);
      SOLIDS.add(mx, mz, 1.0);
    }

    // ----- the dark standing statue on its rectangular pedestal (pair 2)
    {
      const [sx, sz] = KQ.statue, y = H + 0.02;
      stone.push([B(sx - 0.65, sx + 0.65, y - 0.1, y + 0.3, sz - 0.65, sz + 0.65), '#ffffff']);
      c.push([B(sx - 0.48, sx + 0.48, y + 0.3, y + 1.75, sz - 0.48, sz + 0.48), '#6d675e'], [B(sx - 0.56, sx + 0.56, y + 1.75, y + 1.88, sz - 0.56, sz + 0.56), '#7a746a']);
      const by = y + 1.88, BR = '#2a2724';
      for (const dx of [-0.11, 0.11]) c.push([new THREE.CylinderGeometry(0.075, 0.09, 0.9, 8).translate(X(sx + dx), by + 0.45, Z(sz)), BR]);
      c.push([new THREE.CylinderGeometry(0.2, 0.17, 0.72, 10).scale(1, 1, 0.7).translate(X(sx), by + 1.25, Z(sz)), BR]);
      for (const dx of [-0.27, 0.27]) c.push([new THREE.CylinderGeometry(0.05, 0.06, 0.66, 7).translate(X(sx + dx), by + 1.22, Z(sz)), BR]);
      c.push([new THREE.CylinderGeometry(0.06, 0.07, 0.12, 8).translate(X(sx), by + 1.66, Z(sz)), BR], [new THREE.SphereGeometry(0.12, 10, 8).scale(0.9, 1.1, 0.95).translate(X(sx), by + 1.82, Z(sz)), BR]);
      SOLIDS.add(sx, sz, 0.8);
    }

    // ----- the zebra crossings over Hodasi Road: broad white stripes along the road, across its width (pair 3)
    for (const [zx, zz] of KQ.zebras) {
      for (let z = zz - 2.7; z <= zz + 2.71; z += 1.0) {
        const y = gh(zx, z) + 0.045;
        k.plain.push([new THREE.PlaneGeometry(3.0, 0.5).rotateX(-Math.PI / 2).translate(X(zx), y, Z(z)), '#ecebe6']);
      }
    }

    // ----- the short blue-and-white bollard lights along the lawns inside the north wall and by the paths (pair 3)
    {
      const spots: [number, number][] = [];
      for (let x = -24; x < 38; x += 8.5) if (x < gate.x0 - 4 || x > gate.x1 + 4) spots.push([x, x > G.jx0 && x < G.jx1 ? G.nz + 2.2 : G.z0 + 2.2]);
      for (const x of [-22, -18, 31, 35]) for (const z of [KQ.ewPath.z0 - 0.6, KQ.ewPath.z1 + 0.6]) spots.push([x, z]);
      for (const [x, z] of spots) {
        const y = gh(x, z);
        c.push([new THREE.CylinderGeometry(0.1, 0.12, 0.62, 10).translate(X(x), y + 0.31, Z(z)), '#2f63b0'], [new THREE.CylinderGeometry(0.11, 0.11, 0.2, 10).translate(X(x), y + 0.72, Z(z)), '#f4f4f0'], [new THREE.CylinderGeometry(0.13, 0.13, 0.05, 10).translate(X(x), y + 0.845, Z(z)), '#2f63b0']);
        SOLIDS.add(x, z, 0.15);
      }
    }

    // ----- the shrubs and flowering plants inside the walls (pair 2: thick planting behind the stone edge), small
    // trees on the lawns, the leaning tree by the north-east corner (pair 3)
    {
      const shrub = (x: number, z: number, r: number, i: number) => {
        const y = gh(x, z);
        c.push([new THREE.IcosahedronGeometry(r, 1).scale(1.3, 0.6, 1.1).translate(X(x), y + r * 0.45, Z(z)), ['#2f5226', '#3a632d', '#2a4a22', '#46703a'][i % 4]]);
        if (i % 4 === 1) for (let j = 0; j < 5; j++) c.push([new THREE.IcosahedronGeometry(0.08, 0).translate(X(x) + Math.cos(j * 1.3) * r, y + r * 0.9, Z(z) + Math.sin(j * 1.3) * r * 0.8), '#c23b3b']);
      };
      let i = 0;
      for (let x = G.jx0 + 1; x < G.jx1 - 0.5; x += 1.6) if ((x < gate.x0 - 4 || x > gate.x1 + 4) && hash(x, 7) > 0.3) shrub(x, G.nz + 0.9, 0.4 + hash(x, 1) * 0.25, i++);
      for (let x = G.x0 + 1; x < G.x1 - 0.5; x += 1.8) if ((x < G.jx0 - 0.5 || x > G.jx1 + 0.5) && hash(x, 8) > 0.3) shrub(x, G.z1 - 0.9, 0.45 + hash(x, 2) * 0.25, i++);
      for (let x = G.jx0 + 1; x < G.jx1 - 0.5; x += 1.6) if ((x < gate.x0 - 1 || x > gate.x1 + 1) && hash(x, 9) > 0.3) shrub(x, G.sz - 0.9, 0.45 + hash(x, 3) * 0.25, i++);
      for (const [x, z] of [[-24.5, -150], [-24.5, -98.5], [36.5, -98.5]] as [number, number][]) broadleaf(k, trees, x, z, { h: 2.6, spread: 3.2, seed: x * 7 + z, origin: O });
      // the leaning tree: a slender trunk bending out toward the road, a light crown
      {
        const x = 24.2, z = -152.6, y = gh(x, z), pts: THREE.Vector3[] = [];
        for (let t = 0; t <= 1.001; t += 0.125) pts.push(new THREE.Vector3(X(x) - 1.6 * t * t, y + 4.6 * Math.sin(t * Math.PI * 0.42), Z(z) - 2.2 * t * t));
        c.push([new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.09, 6, false), '#5a4a3b']);
        const e = pts[pts.length - 1];
        for (let j = 0; j < 5; j++) trees.push([new THREE.IcosahedronGeometry(0.7 + hash(j, 9) * 0.4, 1).scale(1.3, 0.55, 1.3).translate(e.x + Math.cos(j * 1.4) * 0.9, e.y + 0.1 + hash(j, 4) * 0.4, e.z + Math.sin(j * 1.4) * 0.9), ['#3e5d2e', '#4d6b35', '#36552a'][j % 3]]);
        SOLIDS.add(x, z, 0.15);
      }
    }

    // ----- the mature broadleaf trees between the garden and the library that screen its north front (pair 2), from
    // the map's crowns
    for (const [x, z, h, s, seed] of [[-27.4, -70.4, 5.5, 13, 3], [-5, -75.5, 5, 12, 5], [34, -70, 5.5, 13, 7], [55, -64.5, 6, 14, 9], [48, -79, 4.5, 9, 13], [-42, -74, 5.5, 12, 15], [15.5, -79.5, 4, 7, 17], [70, -74, 5.5, 11, 19]] as [number, number, number, number, number][]) {
      broadleaf(k, trees, x, z, { h, spread: s, seed, origin: O, round: true });
    }

    stoneMeshOf(k, stone);
    const m = new THREE.Mesh(merge(c), concrete(0.25)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    const t = new THREE.Mesh(merge([...trees, ...trunks]), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 })); t.castShadow = true; t.receiveShadow = true; k.meshes.push(t);
    const f = new THREE.Mesh(merge(fronds), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide })); f.castShadow = true; k.meshes.push(f);
  },
};

/** the Kuffour Quadrangle (the owner's reconstruction brief) */
export const kuffourSite = createSite('kuffour-quadrangle', [kqSpec]);
