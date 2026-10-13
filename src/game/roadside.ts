// The roadside plots either side of the Legon Road cutting (the owner's 30-pair reconstruction brief; numbers in
// roadsideplan.ts):
// - the planted strip west of the road north of the interchange (pairs 9-12, Map B): rough grass, trodden red earth
//   paths and an open earth clearing under mature trees, a gravel heap, the 50 sign, the pale boundary wall on its west
//   side, and beyond it the low one-storey ranges (white, red base, red tiles) in place of the generic two-storey blocks;
// - south of the interchange, west of the road (pairs 16, 21, one shared photograph): the long one-storey red-roofed
//   range beyond the service road; the overgrown plot with its telecom masts and the pole with its transformer (pair 17);
// - Legon City Mall (pairs 15, 20, Map C): a glazed mass of four storeys, taller at its south-west corner where its name
//   stands on the roof, across a gravel forecourt edged with posts;
// - east of the road (pairs 22-27, Map D): the police station compound's one-storey ranges round their courts, the
//   block-paved forecourt along its front with white bollards, red earth verges, the row of timber stalls and the kiosk
//   under its blue canopy at the corner; from the owner's 10-pair brief: the vehicle shelter on the shed's outline with the
//   rough strip before it (pair 5), and the kiosks against the police station's north wall (pair 6).
// Everything is placed from the brief's maps and photographs, none of it measured: positions are approximate.
import * as THREE from 'three';
import { segIndex, type Seg5 } from './seggrid';
import { BUILDINGS, NODE_XZ, ROADS } from './campusmap';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { Bag, RED_BASE, WALL, gh, hash, lowWing, tuft, vnoise, wallSolids, type R4 } from './enkit';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { rectsOf } from './rectilinear';
import { car } from './cc';
import { SOLIDS } from './solids';
import { canvas, type Part } from './modelkit';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { STRIP_WALL, WEST_STRIP, inWestStrip, westRoadX } from './roadsideplan';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, WALL) };

// ---------- where the roads are (life.ts keeps its own grid; this one serves the placing here) ----------
const WIDTH = [9, 7.4, 6.2, 4.6, 2.6];
interface Seg { ax: number; az: number; bx: number; bz: number; half: number }
const SEGS: Seg[] = [];
ROADS.forEach((r) => {
  for (let k = 0; k < r.nodes.length - 1; k++) {
    const a = r.nodes[k], b = r.nodes[k + 1];
    SEGS.push({ ax: NODE_XZ[a * 2], az: NODE_XZ[a * 2 + 1], bx: NODE_XZ[b * 2], bz: NODE_XZ[b * 2 + 1], half: WIDTH[r.cls] / 2 });
  }
});
const segDist = (s: Seg, x: number, z: number) => {
  const dx = s.bx - s.ax, dz = s.bz - s.az, l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / l2));
  return Math.hypot(x - s.ax - dx * t, z - s.az - dz * t);
};
/** how far (x, z) is from the nearest road or path edge (negative on it) */
const SEG_NEAR = segIndex(SEGS.map((s) => [s.ax, s.az, s.bx, s.bz, s.half] as Seg5));
const clearance = (x: number, z: number) => SEG_NEAR(x, z, 40);
/** the distance from (x, z) to the nearest of a set of polylines */
const nearLine = (lines: [number, number][][], x: number, z: number) => {
  let best = 99;
  for (const l of lines) for (let i = 0; i < l.length - 1; i++) {
    const s = { ax: l[i][0], az: l[i][1], bx: l[i + 1][0], bz: l[i + 1][1], half: 0 };
    best = Math.min(best, segDist(s, x, z));
  }
  return best;
};
const ringOf = (b: { pts: Float32Array }) => { const r: [number, number][] = []; for (let i = 0; i < b.pts.length; i += 2) r.push([b.pts[i], b.pts[i + 1]]); return r; };
const footprint = (x0: number, x1: number, z0: number, z1: number) => BUILDINGS.find((b) => Math.abs(b.minX - x0) < 0.3 && Math.abs(b.maxX - x1) < 0.3 && Math.abs(b.minZ - z0) < 0.3 && Math.abs(b.maxZ - z1) < 0.3);
const centre = (b: { minX: number; maxX: number; minZ: number; maxZ: number; pts: Float32Array }): [number, number] => {
  // a point inside the outline: the middle of its first rectangle
  const r = rectsOf(ringOf(b))[0];
  return r ? [(r[0] + r[1]) / 2, (r[2] + r[3]) / 2] : [(b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2];
};
/** one-storey ranges on the given mapped outlines: white over a red base, tiled hipped roofs, windows, AC units, doors */
function lowRanges(k: Kit, b: Bag, outlines: { pts: Float32Array }[], o: { roof?: string; eave?: number; pitch?: number; seed?: number } = {}) {
  outlines.forEach((q, i) => {
    for (const r of rectsOf(ringOf(q))) {
      const alongX = r[1] - r[0] >= r[3] - r[2], len = Math.max(r[1] - r[0], r[3] - r[2]), n = Math.max(2, Math.round(len / 3));
      const pat = (s: number) => Array.from({ length: n }, (_, t) => { const h = hash(i * 7 + t + s, t * 3 + (o.seed ?? 0)); return h < 0.22 ? 'A' : h < 0.32 ? 'D' : h < 0.42 ? '-' : 'W'; }).join('');
      const end = r[1] - r[0] < r[3] - r[2] ? 'W-W' : 'W-W';
      lowWing(k, b, r as R4, { eave: o.eave ?? 3.3, pitch: o.pitch ?? 0.42, roof: o.roof, faces: alongX ? { z0: pat(1), z1: pat(2), x0: end, x1: end } : { x0: pat(1), x1: pat(2), z0: end, z1: end }, y: gh((r[0] + r[1]) / 2, (r[2] + r[3]) / 2) });
    }
  });
}
/** a thin strut from a to b (model frame) */
const strut = (a: THREE.Vector3, c: THREE.Vector3, t: number) => {
  const d = c.clone().sub(a);
  return new THREE.BoxGeometry(t, t, d.length()).lookAt(d).translate((a.x + c.x) / 2, (a.y + c.y) / 2, (a.z + c.z) / 2);
};

// ---------- the planted strip west of the road (pairs 9-12) ----------
const WO: [number, number] = [745, 312];
const WEST_RANGES = [footprint(686.8, 712.9, 266.5, 301.3), footprint(691.3, 706.6, 318.8, 332.9), footprint(712.3, 718.5, 319.4, 332.5), footprint(714.0, 719.3, 301.1, 312.1)].filter((b) => !!b);
/** the trodden paths through the strip (the mapped tracks there, drawn as red earth) */
const stripPaths = () => ROADS.filter((r) => r.cls === 4).map((r) => r.nodes.map((n) => [NODE_XZ[n * 2], NODE_XZ[n * 2 + 1]] as [number, number]))
  .filter((l) => l.some(([x, z]) => inWestStrip(x, z)));
const westSpec: Spec = {
  name: 'Planted strip west of Legon Road', axis: [1, 0], origin: WO, storey: 3.3, style: PLAIN, roofColor: '#b65a3c', fascia: '#4a3328', pitch: 0.42, plinth: RED_BASE,
  replaces: WEST_RANGES.map(centre),
  onGround: true,
  blocks: [],
  keep: [[718 - WO[0], 792 - WO[0], 162.5 - WO[1], 461.5 - WO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(WO);
    lowRanges(k, b, WEST_RANGES, { seed: 3 });
    // the ground: rough grass, red earth showing through in patches, the trodden paths and the clearing under the big tree
    const paths = stripPaths(), clear: [number, number, number] = [745, 396, 15];
    k.meshes.push(new THREE.Mesh(drapeAt(WO, 718, 800, 150, 475, 0.6, 0.035, (x, z) => {
      if (!inWestStrip(x, z)) return null;
      const n = vnoise(x * 0.22, z * 0.22), m = vnoise(x * 1.4, z * 1.4);
      // toward the drape's edge by the paved footway the grass takes over, so no earth patch ends in a straight line
      if (westRoadX(z) - WEST_STRIP.inset - x < 3 || z < WEST_STRIP.z0 + 3 || z > WEST_STRIP.z1 - 3) return null;
      const onPath = nearLine(paths, x, z) < 1.1 + n * 0.5, inClear = Math.hypot(x - clear[0], z - clear[1]) < clear[2] * (0.75 + n * 0.4);
      if (onPath || inClear || n > 0.66) return [0.56 + m * 0.08, 0.36 + m * 0.06, 0.24 + m * 0.03];
      // (the rough grass is the campus ground itself, so the earth's edges are ragged, never a straight line)
      return null;
    }), groundCover()));
    // the long grass in clumps where nobody walks
    for (let i = 0; i < 1500; i++) {
      const x = 720 + hash(i, 1.7) * 75, z = 152 + hash(2.3, i) * 320;
      if (!inWestStrip(x, z) || nearLine(paths, x, z) < 1.8 || Math.hypot(x - clear[0], z - clear[1]) < clear[2]) continue;
      tuft(b, x, z, 0.5 + hash(i, 9) * 0.6, ['#6f8a3a', '#7d9444', '#5f7d33', '#8d9a4e'][i % 4], i);
    }
    // mature trees (Map B: a loose belt down the strip, a big one over the clearing), kept off the paths
    const trees: [number, number, number, number][] = [[742, 182, 9, 13], [733, 208, 10, 14], [752, 228, 8.5, 12], [729, 250, 10, 15], [745, 270, 9, 13], [734, 293, 11, 15], [757, 305, 8, 11], [731, 322, 10, 14], [749, 340, 9, 13], [737, 368, 10, 14], [745, 396, 12, 19], [733, 418, 10, 14], [753, 428, 9, 13], [739, 452, 11, 15], [760, 455, 9, 12]];
    for (const [x, z, h, sp] of trees) if (inWestStrip(x, z) && clearance(x, z) > 1.2) broadleaf(k, b.leaf, x, z, { h, spread: sp, seed: x + z * 3, origin: WO });
    // the boundary wall: pale rendered panels between piers, a coping, the base stained with red earth
    for (const line of STRIP_WALL) for (let i = 0; i < line.length - 1; i++) {
      const [ax, az] = line[i], [cx, cz] = line[i + 1], L = Math.hypot(cx - ax, cz - az), n = Math.max(1, Math.round(L / 3));
      for (let j = 0; j < n; j++) {
        const t0 = j / n, t1 = (j + 1) / n, x0 = ax + (cx - ax) * t0, z0 = az + (cz - az) * t0, x1 = ax + (cx - ax) * t1, z1 = az + (cz - az) * t1;
        const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, y = gh(mx, mz), ang = Math.atan2(z1 - z0, x1 - x0), seg = L / n;
        b.c.push([new THREE.BoxGeometry(seg, 2.0, 0.2).rotateY(-ang).translate(mx - WO[0], y + 0.9, mz - WO[1]), hash(mx, mz) > 0.5 ? '#e7e2d4' : '#dfd9ca']);
        b.c.push([new THREE.BoxGeometry(seg, 0.5, 0.22).rotateY(-ang).translate(mx - WO[0], y + 0.05, mz - WO[1]), '#b98a6c']);
        b.c.push([new THREE.BoxGeometry(seg, 0.08, 0.3).rotateY(-ang).translate(mx - WO[0], y + 1.94, mz - WO[1]), '#cfc9ba']);
        b.c.push([new THREE.BoxGeometry(0.38, 2.2, 0.38).rotateY(-ang).translate(x0 - WO[0], gh(x0, z0) + 1.0, z0 - WO[1]), '#ece8dc']);
      }
      wallSolids(ax, az, cx, cz, 0.25);
    }
    // the gravel heap by the road (pair 9)
    for (const [x, z, r, h] of [[746.5, 167.5, 1.8, 0.9]] as [number, number, number, number][]) {
      if (clearance(x, z) < r) continue;
      const g = new THREE.ConeGeometry(r, h, 14, 2), p = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + (hash(i, 3) - 0.5) * 0.08);
      g.computeVertexNormals();
      b.c.push([g.translate(x - WO[0], gh(x, z) + h / 2 - 0.05, z - WO[1]), '#a8a39a']);
      SOLIDS.add(x, z, r * 0.7);
    }
    // the 50 sign beside the footway (pair 10): a red-ringed white disc on a grey post, facing the traffic
    {
      const [x, z] = [767.6, 213.6], y = gh(x, z), ry = 2.18;
      b.c.push([new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8).translate(x - WO[0], y + 1.3, z - WO[1]), '#8d9296']);
      const disc = (r: number, d: number, col: string, off: number) => b.c.push([new THREE.CylinderGeometry(r, r, d, 28).rotateX(Math.PI / 2).rotateY(ry).translate(x - WO[0] + Math.sin(ry) * off, y + 2.25, z - WO[1] + Math.cos(ry) * off), col]);
      disc(0.38, 0.03, '#c8202a', 0.05); disc(0.3, 0.03, '#f6f6f2', 0.07);
      k.signs.push({ text: '50', x: x - WO[0] + Math.sin(ry) * 0.09, y: y + 2.25, z: z - WO[1] + Math.cos(ry) * 0.09, ry, w: 0.32, colors: ['#f6f6f2', '#151515'] });
      SOLIDS.add(x, z, 0.1);
    }
    b.finish(k, 0.4);
  },
};

// ---------- south of the interchange, west of the road (pairs 16, 21 and 17) ----------
const SO: [number, number] = [700, -130];
const FRONTAGE = footprint(685.7, 694.0, -141.3, -86.7);
const southWestSpec: Spec = {
  name: 'Roadside west of Legon Road (south)', axis: [1, 0], origin: SO, storey: 3.3, style: PLAIN, roofColor: '#b65a3c', fascia: '#4a3328', pitch: 0.4, plinth: RED_BASE,
  replaces: FRONTAGE ? [centre(FRONTAGE)] : [],
  onGround: true,
  blocks: [],
  keep: [[670 - SO[0], 713 - SO[0], -210 - SO[1], -145 - SO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(SO);
    // the long one-storey range beyond the service road (pairs 16, 21): white, red base, a long red roof
    if (FRONTAGE) lowRanges(k, b, [FRONTAGE], { eave: 3.2, pitch: 0.4, seed: 11 });
    // a white van and a car parked along its front
    const ck = { ...k, plain: [] as Part[] } as Kit;
    for (const [x, z, col] of [[698.6, -118, '#f2f2f0'], [698.6, -104, '#8a9097']] as [number, number, string][]) if (clearance(x, z) > 1.3) { car(ck, x - SO[0], z - SO[1], col, gh(x, z), Math.PI / 2); SOLIDS.add(x, z, 1.2); SOLIDS.add(x, z - 1.6, 1.0); SOLIDS.add(x, z + 1.6, 1.0); }
    for (const p of ck.plain) b.c.push(p);
    // the overgrown plot (pair 17): rough grass and scrub over red earth, a trodden path, the masts behind
    k.meshes.push(new THREE.Mesh(drapeAt(SO, 672, 712, -208, -146, 0.6, 0.035, (x, z) => {
      if (clearance(x, z) < 0.1) return null;
      const n = vnoise(x * 0.25, z * 0.25), m = vnoise(x * 1.5, z * 1.5);
      const path = Math.abs(z - (-150 - (712 - x) * 0.55)) < 1.0 + n * 0.4;
      if (path || n > 0.66) return [0.6 + m * 0.07, 0.38 + m * 0.05, 0.24];
      return [0.35 + m * 0.07, 0.45 + n * 0.1, 0.19 + m * 0.04];
    }), groundCover()));
    for (let i = 0; i < 260; i++) {
      const x = 673 + hash(i, 4.1) * 38, z = -207 + hash(5.3, i) * 60;
      if (clearance(x, z) < 1) continue;
      if (hash(i, 8) < 0.3) b.leaf.push([new THREE.IcosahedronGeometry(0.7 + hash(i, 2) * 0.9, 1).scale(1.2, 0.85, 1.2).translate(x - SO[0], gh(x, z) + 0.5, z - SO[1]), ['#3f6b2c', '#4d7a33', '#5a8238'][i % 3]]);
      else tuft(b, x, z, 0.7 + hash(i, 6) * 0.7, ['#6f8a3a', '#7d9444', '#5f7d33'][i % 3], i);
    }
    for (const [x, z, h, sp] of [[684, -170, 9, 13], [676, -188, 8, 12], [700, -200, 10, 14]] as [number, number, number, number][]) if (clearance(x, z) > 1.2) broadleaf(k, b.leaf, x, z, { h, spread: sp, seed: x - z, origin: SO });
    // the telecom masts: square lattice towers tapering up, braced in bays, aerials at the top
    for (const [x, z, H, w0] of [[688, -197, 32, 2.4], [680, -203, 26, 2.0]] as [number, number, number, number][]) {
      const y = gh(x, z), X = x - SO[0], Z = z - SO[1], bays = Math.round(H / 3);
      const leg = (i: number, t: number) => { const w = w0 * (1 - t * 0.72), sx = i === 0 || i === 3 ? -1 : 1, sz = i < 2 ? -1 : 1; return new THREE.Vector3(X + sx * w / 2, y + t * H, Z + sz * w / 2); };
      for (let i = 0; i < 4; i++) b.c.push([strut(leg(i, 0), leg(i, 1), 0.12), '#9aa0a4']);
      for (let s = 0; s < bays; s++) {
        const t0 = s / bays, t1 = (s + 1) / bays;
        for (let i = 0; i < 4; i++) {
          const j = (i + 1) % 4;
          b.c.push([strut(leg(i, t1), leg(j, t1), 0.06), '#a3a8ac'], [strut(leg(i, t0), leg(j, t1), 0.05), '#a3a8ac']);
        }
      }
      for (const [dx, dz] of [[0.5, 0], [-0.5, 0.3], [0, -0.5]]) b.c.push([new THREE.BoxGeometry(0.3, 1.6, 0.12).translate(X + dx, y + H - 1.2, Z + dz), '#e9e9e6']);
      SOLIDS.add(x, z, w0 * 0.75);
    }
    // the timber pole by the road with its transformer and cross-arm (pair 17)
    {
      const [x, z] = [707.5, -152.5], y = gh(x, z);
      if (clearance(x, z) > 0.4) {
        b.c.push([new THREE.CylinderGeometry(0.12, 0.16, 10, 8).translate(x - SO[0], y + 5, z - SO[1]), '#5e4a37']);
        b.c.push([b.B(x - 1.2, x + 1.2, y + 9.1, y + 9.25, z - 0.06, z + 0.06), '#5e4a37']);
        b.c.push([new THREE.CylinderGeometry(0.32, 0.32, 0.9, 10).translate(x - SO[0] + 0.35, y + 7.2, z - SO[1]), '#6f7478']);
        SOLIDS.add(x, z, 0.2);
      }
    }
    b.finish(k, 0.4);
  },
};

// ---------- Legon City Mall (pairs 15, 20) ----------
const MO: [number, number] = [917, -180];
const MALL = footprint(872.6, 962.2, -225.9, -137.3);
let glassMat: THREE.MeshStandardMaterial | null = null;
/** blue-grey curtain wall: one tile a storey high (3.6 m) and a panel wide (1.5 m), pale mullions, a spandrel band */
const curtain = () => (glassMat ??= (() => {
  const t = canvas(64, 128, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#6f8fa6'); gr.addColorStop(0.55, '#3f5f78'); gr.addColorStop(1, '#2d4458');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 128);
    g.fillStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.moveTo(8, 0); g.lineTo(26, 0); g.lineTo(6, 110); g.lineTo(0, 110); g.fill();
    g.fillStyle = '#d6dadc'; g.fillRect(0, 0, 3, 128); g.fillRect(61, 0, 3, 128);
    g.fillStyle = '#c9ced1'; g.fillRect(0, 110, 64, 18);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.22, metalness: 0.35, side: THREE.DoubleSide });
})());
/** the four faces of a glazed block, texture coordinates in panels and storeys */
function glassBox(pos: number[], uv: number[], idx: number[], x0: number, x1: number, z0: number, z1: number, y0: number, y1: number) {
  const faces: [number, number, number, number][] = [[x0, z1, x1, z1], [x1, z1, x1, z0], [x1, z0, x0, z0], [x0, z0, x0, z1]];
  for (const [ax, az, cx, cz] of faces) {
    const L = Math.hypot(cx - ax, cz - az), n = pos.length / 3;
    pos.push(ax - MO[0], y0, az - MO[1], cx - MO[0], y0, cz - MO[1], cx - MO[0], y1, cz - MO[1], ax - MO[0], y1, az - MO[1]);
    uv.push(0, y0 / 3.6, L / 1.5, y0 / 3.6, L / 1.5, y1 / 3.6, 0, y1 / 3.6);
    idx.push(n, n + 2, n + 1, n, n + 3, n + 2);
  }
}
let linkMat: THREE.MeshStandardMaterial | null = null;
/** chain-link mesh: grey wire diamonds, see-through */
const chainLink = () => (linkMat ??= (() => {
  const t = canvas(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64); g.strokeStyle = 'rgba(150,156,160,0.95)'; g.lineWidth = 2.2;
    for (let i = -64; i < 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); g.beginPath(); g.moveTo(i + 64, 0); g.lineTo(i, 64); g.stroke(); }
  });
  t.repeat.set(1, 1);
  return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.4 });
})());
let nameT: THREE.CanvasTexture | null = null;
/** LEGON CITY ★★★ MALL: navy letters with the three coloured stars, standing free on the roof */
const mallNameTex = () => (nameT ??= (() => {
  const t = canvas(1024, 170, (g) => {
    g.clearRect(0, 0, 1024, 170); g.fillStyle = '#26306a'; g.font = 'bold 88px Arial'; g.textBaseline = 'middle'; g.textAlign = 'left';
    const a = 'LEGON CITY', c = 'MALL', wa = g.measureText(a).width, wc = g.measureText(c).width, gap = 130, x0 = (1024 - wa - gap - wc) / 2;
    g.fillText(a, x0, 96); g.fillText(c, x0 + wa + gap, 96);
    const star = (cx: number, cy: number, r: number, col: string) => { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++) { const an = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); } g.closePath(); g.fill(); };
    const sx = x0 + wa + gap / 2;
    star(sx - 30, 70, 32, '#d6262f'); star(sx + 10, 116, 28, '#2f9a3c'); star(sx + 30, 52, 24, '#f2c21b');
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
})());
const mallSpec: Spec = {
  name: 'Legon City Mall', axis: [1, 0], origin: MO, storey: 3.6, style: PLAIN, roofColor: '#9a9a96', fascia: '#5a5a58', pitch: 0.1,
  replaces: MALL ? [centre(MALL)] : [],
  onGround: true,
  blocks: [],
  // the forecourt is paved parking (the owner's mall correction brief): the mapped car park there is drawn here
  covers: [[845, -170]],
  keep: [[826 - MO[0], 963 - MO[0], -227 - MO[1], -136 - MO[1]]],
  extras: (k: Kit) => {
    if (!MALL) return;
    const b = new Bag(MO), pos: number[] = [], uv: number[] = [], idx: number[] = [], y = gh(917, -180);
    // (the owner's Legon City Mall correction brief: a broad multi-part complex, not repeated office modules. Seen from the
    // forecourt (west): the lighter, open left (north) wing over a passage, the darker central block with its large
    // window bands and the name on its roof, the glazed right (south) volume; the parts behind lower and grey)
    const kindOf = (r: number[]) => {
      const cx = (r[0] + r[1]) / 2, cz = (r[2] + r[3]) / 2;
      if (cz < -205 && cx < 891) return 'left';
      if (cx < 892 && cz > -164) return 'right';
      if (cx < 942 && cz > -207 && cz < -150) return 'centre';
      return 'back';
    };
    const LEVELS = { left: 4, centre: 5, right: 5, back: 4 } as const;
    let centreTop = y + 5 * 3.6, centreX = 888.4;
    for (const [ri, r] of rectsOf(ringOf(MALL)).map((q) => [q[0], q[1], q[2], q[1] > 925 ? Math.min(q[3], -139.9) : q[3]]).entries()) {
      const kind = kindOf(r), lv = kind === 'back' ? 3 + (ri % 2) : LEVELS[kind], top = y + lv * 3.6;
      const faces = (fn: (alongX: boolean, at: number, out: number, a0: number, a1: number) => void) => { fn(true, r[3], 1, r[0], r[1]); fn(true, r[2], -1, r[0], r[1]); fn(false, r[1], 1, r[2], r[3]); fn(false, r[0], -1, r[2], r[3]); };
      if (kind === 'right') glassBox(pos, uv, idx, r[0], r[1], r[2], r[3], y, top);
      else if (kind === 'centre') {
        // dark grey cladding, large rectangular window bands in an uneven rhythm
        centreTop = Math.max(centreTop, top); centreX = Math.min(centreX, r[0]);
        b.c.push([b.B(r[0], r[1], y, top, r[2], r[3]), '#4d4b58']);
        faces((alongX, at, out, a0, a1) => {
          const n = Math.max(1, Math.round((a1 - a0) / 6.5));
          for (let f = 1; f < lv; f++) for (let i = 0; i < n; i++) {
            const w = ((a1 - a0) / n) * (0.62 + 0.22 * hash(i + f, ri)), a = a0 + ((a1 - a0) * (i + 0.5)) / n;
            k.glass.push(b.plane(alongX, at + out * 0.03, out, a, w, y + f * 3.6 + 0.55, y + f * 3.6 + 3.0));
          }
        });
      } else if (kind === 'left') {
        // the lighter, more open wing: pale frame of columns and slab edges, glazing set back behind it, the passage below
        b.c.push([b.B(r[0] + 1.2, r[1] - 0.2, y + 3.6, top, r[2] + 0.2, r[3] - 0.2), '#c6c9cc']);
        faces((alongX, at, out, a0, a1) => {
          const inset = at - out * 1.0, n = Math.max(1, Math.round((a1 - a0) / 5));
          for (let f = 1; f < lv; f++) k.glass.push(b.plane(alongX, inset + out * 0.25, out, (a0 + a1) / 2, a1 - a0 - 1.5, y + f * 3.6 + 0.4, y + f * 3.6 + 3.2));
          for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; b.c.push([alongX ? b.B(a - 0.3, a + 0.3, y, top, Math.min(at, at - out * 0.6), Math.max(at, at - out * 0.6)) : b.B(Math.min(at, at - out * 0.6), Math.max(at, at - out * 0.6), y, top, a - 0.3, a + 0.3), '#e9eaea']); }
          for (let f = 1; f <= lv; f++) b.c.push([alongX ? b.B(a0, a1, y + f * 3.6 - 0.35, y + f * 3.6, Math.min(at, at - out * 0.9), Math.max(at, at - out * 0.9)) : b.B(Math.min(at, at - out * 0.9), Math.max(at, at - out * 0.9), y + f * 3.6 - 0.35, y + f * 3.6, a0, a1), '#e4e5e4']);
        });
        b.c.push([b.B(r[0] + 6, r[1] - 0.2, y, y + 3.6, r[2] + 0.2, r[3] - 0.2), '#bfc2c4'], [b.B(r[0] + 5.8, r[0] + 6.0, y, y + 3.4, r[2] + 0.2, r[3] - 0.2), '#2c2f33']);
      } else {
        b.c.push([b.B(r[0], r[1], y, top, r[2], r[3]), '#9a9ca0']);
        faces((alongX, at, out, a0, a1) => { for (let f = 1; f < lv; f++) b.win.push(b.plane(alongX, at + out * 0.02, out, (a0 + a1) / 2, a1 - a0 - 1.6, y + f * 3.6 + 0.9, y + f * 3.6 + 2.4)); });
      }
      // the ground floor's varied commercial frontage toward the forecourt and the road: shop glazing, a canopy, sign bands
      if (kind !== 'left' && r[0] < 893) {
        k.glass.push(b.plane(false, r[0] - 0.04, -1, (r[2] + r[3]) / 2, r[3] - r[2] - 1.0, y + 0.2, y + 3.0));
        b.c.push([b.B(r[0] - 1.6, r[0], y + 3.15, y + 3.35, r[2] + 0.3, r[3] - 0.3), '#d9d9d6']);
        const nb = Math.max(1, Math.round((r[3] - r[2]) / 5));
        for (let i = 0; i < nb; i++) { const z0 = r[2] + 0.4 + ((r[3] - r[2] - 0.8) * i) / nb, z1 = z0 + (r[3] - r[2] - 0.8) / nb - 0.3; b.c.push([b.B(r[0] - 0.12, r[0] - 0.02, y + 3.4, y + 4.1, z0, z1), ['#b8202a', '#e3b43a', '#2a64b8', '#3f8a3a', '#f2f2ee'][Math.floor(hash(i, ri) * 5)]]); }
      }
      const ring = (o: number, y0: number, y1: number, t: number, col: string) => {
        const [x0, x1, z0, z1] = [r[0] - o, r[1] + o, r[2] - o, r[3] + o];
        b.c.push([b.B(x0, x1, y0, y1, z0, z0 + t), col], [b.B(x0, x1, y0, y1, z1 - t, z1), col], [b.B(x0, x0 + t, y0, y1, z0, z1), col], [b.B(x1 - t, x1, y0, y1, z0, z1), col]);
      };
      ring(0.15, top, top + 1.0, 0.35, kind === 'centre' ? '#3e3d48' : '#cfcfca');
      b.c.push([b.B(r[0] + 0.2, r[1] - 0.2, top - 0.2, top + 0.15, r[2] + 0.2, r[3] - 0.2), '#8f8f8b']);
      wallSolids(r[0], r[2], r[1], r[2]); wallSolids(r[1], r[2], r[1], r[3]); wallSolids(r[1], r[3], r[0], r[3]); wallSolids(r[0], r[3], r[0], r[2]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, curtain()); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    // the name and its coloured emblem standing on the central block's roof at its front edge, facing the forecourt
    const st = centreTop + 1.0, sx = centreX + 0.6;
    for (const z of [-196, -184, -172]) b.c.push([b.B(sx + 0.1, sx + 0.25, st, st + 4.2, z - 0.1, z + 0.1), '#5a5c60']);
    k.meshes.push(new THREE.Mesh(new THREE.PlaneGeometry(30, 5).rotateY(-Math.PI / 2).translate(sx - MO[0], st + 2.6, -184 - MO[1]), new THREE.MeshBasicMaterial({ map: mallNameTex(), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide })));
    // the paved forecourt: interlocking pavers, parking bays along it, a few cars, lamp poles, curbs at the road
    k.meshes.push(new THREE.Mesh(drapeAt(MO, 826, 872.4, -209, -136, 0.25, 0.04, (x, z) => {
      if (clearance(x, z) < -0.05) return null;
      const row = Math.floor(z / 0.22), col = Math.floor((x + (row % 2) * 0.11) / 0.22), h = hash(col, row) * 0.06, n = vnoise(x * 0.3, z * 0.3) * 0.05;
      const bay = (Math.abs(((z + 200) % 2.6 + 2.6) % 2.6) < 0.1 && ((x > 836 && x < 841) || (x > 856 && x < 861))) || (Math.abs(x - 841) < 0.06 || Math.abs(x - 856) < 0.06);
      if (bay && z > -205 && z < -140) return [0.92, 0.92, 0.88];
      return [0.66 - h - n, 0.6 - h - n, 0.55 - h - n];
    }), groundCover()));
    for (const [x, z, col] of [[838.5, -196.2, '#2b2e33'], [838.5, -188.4, '#c9ccd0'], [838.5, -175.4, '#8a8f95'], [838.5, -162.4, '#a42c2c'], [858.5, -193.6, '#e4e4e0'], [858.5, -183.2, '#2b2e33'], [858.5, -167.6, '#2f5fa8'], [858.5, -154.6, '#c9ccd0']] as [number, number, string][]) car(k, x - MO[0], z - MO[1], col, gh(x, z), Math.PI / 2);
    for (const [x, z] of [[848.5, -200], [848.5, -170], [848.5, -145]]) { b.c.push([new THREE.CylinderGeometry(0.08, 0.12, 8, 8).translate(x - MO[0], gh(x, z) + 4, z - MO[1]), '#9aa0a5'], [b.B(x - 0.8, x + 0.8, gh(x, z) + 7.9, gh(x, z) + 8.05, z - 0.15, z + 0.15), '#5c6266']); SOLIDS.add(x, z, 0.15); }
    // the red-brown posts along its road edges, the chain-link mesh between them (pair 4: a light fence, not a wall)
    const posts = (pts: [number, number][]) => {
      let prev: [number, number] | null = null;
      for (const [x, z] of pts) {
        if (clearance(x, z) <= 0.4) { prev = null; continue; }
        b.c.push([new THREE.CylinderGeometry(0.05, 0.05, 1.8, 6).translate(x - MO[0], gh(x, z) + 0.9, z - MO[1]), '#7a3f2a']);
        SOLIDS.add(x, z, 0.08);
        if (prev) {
          const [px, pz] = prev, L = Math.hypot(x - px, z - pz), yy = (gh(x, z) + gh(px, pz)) / 2;
          const pg = new THREE.PlaneGeometry(L, 1.6), uv = pg.attributes.uv;
          for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * L * 3, uv.getY(i) * 1.6 * 3);
          mesh.push(pg.rotateY(-Math.atan2(z - pz, x - px)).translate((x + px) / 2 - MO[0], yy + 0.85, (z + pz) / 2 - MO[1]));
          b.c.push([new THREE.BoxGeometry(L, 0.03, 0.03).rotateY(-Math.atan2(z - pz, x - px)).translate((x + px) / 2 - MO[0], yy + 1.66, (z + pz) / 2 - MO[1]), '#8a8f93']);
          wallSolids(px, pz, x, z, 0.12);
        }
        prev = [x, z];
      }
    };
    const mesh: THREE.BufferGeometry[] = [];
    const west: [number, number][] = [], south: [number, number][] = [];
    for (let z = -207; z < -138; z += 3.2) west.push([827.5, z]);
    for (let x = 829; x < 862; x += 3.2) south.push([x, -137.5]);
    posts(west); posts(south);
    if (mesh.length) { const fm = new THREE.Mesh(mergeGeometries(mesh), chainLink()); fm.userData.noCollide = true; k.meshes.push(fm); }
    b.finish(k, 0.3);
  },
};

// ---------- east of the road: the police station compound, its forecourt, the stalls (pairs 22-27) ----------
const EO: [number, number] = [855, 120];
const COMPOUND = BUILDINGS.filter((q) => q.minX > 820 && q.maxX < 892 && q.minZ > 60 && q.maxZ < 196);
/** the long open market shed by the road (pair 22) */
const SHED = footprint(819.4, 845.6, 14.0, 25.7);
/** the kiosk under its blue canopy at the corner (pair 23): a small mapped outline */
const KIOSK = footprint(891.0, 899.7, 33.6, 40.8);
const eastSpec: Spec = {
  name: 'Police station compound and roadside stalls', axis: [1, 0], origin: EO, storey: 3.3, style: PLAIN, roofColor: '#b65a3c', fascia: '#4a3328', pitch: 0.42, plinth: RED_BASE,
  replaces: [...COMPOUND.map(centre), ...(SHED ? [centre(SHED)] : []), ...(KIOSK ? [centre(KIOSK)] : [])],
  onGround: true,
  blocks: [],
  keep: [[814 - EO[0], 905 - EO[0], 10 - EO[1], 200 - EO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(EO);
    lowRanges(k, b, COMPOUND, { eave: 3.2, pitch: 0.42, seed: 7 });
    // the courts: grass and a tree in each, as Map D shows
    for (const [x, z] of [[842.5, 77], [842, 120], [842, 152], [842, 178]] as [number, number][]) if (!COMPOUND.some((q) => x > q.minX && x < q.maxX && z > q.minZ && z < q.maxZ)) broadleaf(k, b.leaf, x, z, { h: 7, spread: 8, seed: x + z, origin: EO, round: true });
    // the forecourt along the compound's front: grey block paving, a dark kerb, white bollards at the road edge
    k.meshes.push(new THREE.Mesh(drapeAt(EO, 813, 826, 58, 196, 0.5, 0.04, (x, z) => {
      if (clearance(x, z) < 0.2 || COMPOUND.some((q) => x > q.minX - 0.3 && x < q.maxX + 0.3 && z > q.minZ - 0.3 && z < q.maxZ + 0.3)) return null;
      const h = hash(Math.floor(x * 5), Math.floor(z * 2.5)) * 0.06;
      return [0.6 - h, 0.57 - h, 0.53 - h];
    }), groundCover()));
    for (let z = 60; z < 195; z += 2.6) {
      // (the road's edge here, then a metre in)
      let x = 813; while (x < 826 && clearance(x, z) < 0.6) x += 0.25;
      if (x >= 825 || COMPOUND.some((q) => x > q.minX - 1 && x < q.maxX + 1 && z > q.minZ - 1 && z < q.maxZ + 1)) continue;
      b.c.push([new THREE.CylinderGeometry(0.09, 0.1, 0.9, 8).translate(x - EO[0], gh(x, z) + 0.45, z - EO[1]), '#efefea'], [new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8).translate(x - EO[0], gh(x, z) + 0.7, z - EO[1]), '#c8302a']);
      SOLIDS.add(x, z, 0.12);
    }
    // red earth verges: north of the compound by the stalls, south of it by the end building (pair 27)
    k.meshes.push(new THREE.Mesh(drapeAt(EO, 812, 905, 10, 60, 0.6, 0.035, (x, z) => {
      if (clearance(x, z) < 0.15) return null;
      const n = vnoise(x * 0.3, z * 0.3), m = vnoise(x * 1.6, z * 1.6);
      return n > 0.72 ? [0.42 + m * 0.05, 0.47 + m * 0.06, 0.22] : [0.5 + m * 0.07, 0.35 + m * 0.05, 0.24 + m * 0.03];
    }), groundCover()));
    k.meshes.push(new THREE.Mesh(drapeAt(EO, 820, 900, 191, 202, 0.6, 0.035, (x, z) => {
      if (clearance(x, z) < 0.15 || COMPOUND.some((q) => x > q.minX - 0.2 && x < q.maxX + 0.2 && z > q.minZ - 0.2 && z < q.maxZ + 0.2)) return null;
      const n = vnoise(x * 0.3, z * 0.3); return [0.62 + n * 0.06, 0.4 + n * 0.05, 0.26];
    }), groundCover()));
    // the vehicle shelter on the shed's outline (the owner's 10-pair brief, pair 5, which replaces the open market shed
    // with its row of painted panels): a long shallow sheet-metal roof on slender posts, cars standing under it
    if (SHED) {
      // (its east end stops short of the lane that cuts its mapped corner)
      const [x0, x1, z0, z1] = [SHED.minX + 0.3, SHED.maxX - 3.0, SHED.minZ + 0.3, SHED.maxZ - 0.3], y = gh((x0 + x1) / 2, (z0 + z1) / 2), H = 2.7;
      for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 5) for (const z of [z0, z1]) {
        if (clearance(x, z) < 0.3) continue;
        const h = H + (z === z0 ? 0.35 : 0);
        b.c.push([b.B(x - 0.05, x + 0.05, y, y + h, z - 0.05, z + 0.05), '#6d7378']); SOLIDS.add(x, z, 0.08);
        if (z === z0) b.c.push([new THREE.BoxGeometry(0.06, 0.08, z1 - z0).rotateX(-Math.atan2(0.35, z1 - z0)).translate(x - EO[0], y + H + 0.18, (z0 + z1) / 2 - EO[1]), '#6d7378']);
      }
      const roof = new THREE.BoxGeometry(x1 - x0 + 1.0, 0.04, z1 - z0 + 1.2).rotateX(-Math.atan2(0.35, z1 - z0)).translate((x0 + x1) / 2 - EO[0], y + H + 0.24, (z0 + z1) / 2 - EO[1]);
      b.c.push([roof, '#a9adaf']);
      for (let x = x0 + 0.5; x < x1 - 0.5; x += 3.1) b.c.push([b.B(x, x + 0.08, y + H + 0.26, y + H + 0.3, z0 - 0.5, z1 + 0.5), hash(x, 3) > 0.6 ? '#8a6a52' : '#9ca0a2']);
      for (const [x, col] of [[823.5, '#c9ccd0'], [828.8, '#2b2e33'], [834.2, '#a42c2c'], [839.0, '#e4e4e0']] as [number, string][]) if (x < x1 - 1) car(k, x - EO[0], (z0 + z1) / 2 + 0.6 - EO[1], col, gh(x, 20), 0);
    }
    // the rough foreground between the lane and the avenue (pair 5): the small kiosk on the left, the low masonry
    // partitions (part broken), a patch of broken pavers, the blue tarp over a simple stall on the right, the big tree
    {
      const ky = gh(822.5, 39);
      b.c.push([b.B(821.0, 824.0, ky, ky + 2.3, 37.6, 40.2), '#5d86a8'], [b.B(820.9, 824.1, ky, ky + 0.35, 37.5, 40.3), '#8a6a52']);
      b.c.push([new THREE.BoxGeometry(3.8, 0.05, 3.4).rotateX(0.1).translate(822.5 - EO[0], ky + 2.45, 38.9 - EO[1]), '#9a7a5e']);
      b.c.push([b.B(821.6, 823.4, ky + 1.0, ky + 1.9, 40.2, 40.24), '#1f2a30'], [b.B(821.5, 823.5, ky + 0.95, ky + 1.0, 40.2, 40.7), '#b7a48c']);
      wallSolids(821.0, 38.9, 824.0, 38.9, 1.3);
      for (const [ax, az, cx, cz, h] of [[826.5, 36.5, 830.5, 36.8, 0.9], [831.8, 37.0, 834.5, 37.2, 0.6], [826.4, 36.6, 826.6, 41.5, 0.8], [836.5, 35.8, 836.7, 39.4, 1.0]] as [number, number, number, number, number][]) {
        const L = Math.hypot(cx - ax, cz - az), n = Math.max(1, Math.round(L / 0.4)), yy = gh(ax, az);
        for (let i = 0; i < n; i++) {
          const t = (i + 0.5) / n, hh = h * (0.55 + 0.45 * hash(i + ax, az));
          b.c.push([new THREE.BoxGeometry(L / n + 0.01, hh, 0.2).rotateY(-Math.atan2(cz - az, cx - ax)).translate(ax + (cx - ax) * t - EO[0], yy + hh / 2, az + (cz - az) * t - EO[1]), hash(i, ax) > 0.5 ? '#a9a49a' : '#b8b3a8']);
        }
        wallSolids(ax, az, cx, cz, 0.15);
      }
      k.meshes.push(new THREE.Mesh(drapeAt(EO, 824.5, 829.5, 41.5, 45.0, 0.25, 0.05, (x, z) => {
        const row = Math.floor(z / 0.2), col = Math.floor((x + (row % 2) * 0.1) / 0.2), h = hash(col, row);
        return h < 0.22 ? null : [0.6 - h * 0.08, 0.56 - h * 0.08, 0.5 - h * 0.08];
      }), groundCover()));
      const ty = gh(847, 41);
      for (const [px, pz] of [[845, 38.5], [849.5, 38.5], [845, 43.5], [849.5, 43.5]]) { b.c.push([b.B(px - 0.04, px + 0.04, ty, ty + 2.4 + (pz < 40 ? 0.2 : 0), pz - 0.04, pz + 0.04), '#8a8d90']); SOLIDS.add(px, pz, 0.08); }
      b.c.push([new THREE.BoxGeometry(5.2, 0.04, 5.6).rotateX(0.05).translate(847.25 - EO[0], ty + 2.55, 41 - EO[1]), '#2a64b8']);
      b.c.push([b.B(845.6, 848.9, ty + 0.75, ty + 0.82, 39.0, 40.2), '#7a5c40']);
      for (let j = 0; j < 5; j++) b.c.push([new THREE.SphereGeometry(0.13, 6, 4).translate(845.9 + j * 0.65 - EO[0], ty + 0.92, 39.6 - EO[1]), ['#c4302a', '#d8a030', '#4f8a2e', '#c4302a', '#e0c040'][j]]);
      SOLIDS.add(847.2, 39.6, 1.0);
      if (clearance(817.5, 41) > 1.0) broadleaf(k, b.leaf, 817.5, 41, { h: 10, spread: 16, seed: 31, origin: EO });
      const py = gh(843, 47);
      b.c.push([new THREE.CylinderGeometry(0.1, 0.14, 8, 8).translate(843 - EO[0], py + 4, 47 - EO[1]), '#5a4a3b']); SOLIDS.add(843, 47, 0.2);
      for (let i = 0; i < 40; i++) { const x = 815 + hash(i, 61) * 40, z = 34 + hash(i, 67) * 15; if (clearance(x, z) > 0.5) tuft(b, x, z, 0.3 + hash(i, 71) * 0.4, ['#7d8a44', '#8a9450', '#6b7a3a'][i % 3]); }
      for (let i = 0; i < 30; i++) { const x = 815 + hash(i, 81) * 40, z = 34 + hash(i, 83) * 15, r = 0.08 + hash(i, 85) * 0.14; if (clearance(x, z) > 0.3) b.c.push([new THREE.IcosahedronGeometry(r, 0).translate(x - EO[0], gh(x, z) + r * 0.4, z - EO[1]), '#a49c8e']); }
    }
    // the kiosks and stalls against the police station's north wall (pair 6, opposite the strip across the avenue): small
    // separate structures of different heights and widths, timber and painted sheet-metal fronts, low corrugated roofs
    // pitched to the front at irregular fascias, open fronts with counters and produce, raised rough thresholds and
    // broken steps, gaps between them; compacted reddish earth before them; the police station's own wall behind
    {
      k.meshes.push(new THREE.Mesh(drapeAt(EO, 822, 866, 57.5, 86.2, 0.6, 0.035, (x, z) => {
        if (clearance(x, z) < 0.15 || COMPOUND.some((q) => x > q.minX - 0.2 && x < q.maxX + 0.2 && z > q.minZ - 0.2 && z < q.maxZ + 0.2)) return null;
        const n = vnoise(x * 0.35, z * 0.35), m = vnoise(x * 1.7, z * 1.7);
        return n > 0.78 ? [0.44 + m * 0.05, 0.47 + m * 0.06, 0.23] : [0.56 + m * 0.07, 0.38 + m * 0.05, 0.26 + m * 0.03];
      }), groundCover()));
      const STALLS: [number, number, number, number, string][] = [
        // x0, width, depth, front height, cladding
        [829.4, 3.4, 3.6, 2.5, '#8a5a3e'], [833.6, 2.8, 3.0, 2.3, '#3f6f9a'], [837.6, 4.2, 4.0, 2.8, '#b8b2a4'], [843.0, 3.0, 3.2, 2.4, '#a8412e'],
        [847.2, 3.6, 3.8, 2.6, '#7a6a52'], [852.0, 2.6, 2.8, 2.2, '#4f7a52'], [855.8, 4.0, 3.4, 2.7, '#9a7a5e'],
      ];
      const WZ = 86.3;
      for (const [i, [x0, w, d, h, col]] of STALLS.entries()) {
        const x1 = x0 + w, zb = WZ - 0.05, zf = WZ - d, y = gh(x0 + w / 2, zf + d / 2), back = h + 0.45 + hash(i, 3) * 0.3;
        // threshold slab, a broken step in front of some
        b.c.push([b.B(x0 - 0.1, x1 + 0.1, y - 0.1, y + 0.18, zf - 0.15, zb), '#a59f93']);
        if (hash(i, 5) > 0.4) b.c.push([b.B(x0 + 0.4 + hash(i, 7), x0 + 1.6 + hash(i, 7), y - 0.1, y + 0.09, zf - 0.6, zf - 0.15), '#9a948a']);
        // side and back walls of sheet or timber, the counter at the open front
        for (const x of [x0, x1 - 0.06]) b.c.push([new THREE.BoxGeometry(0.06, back - 0.1, d).translate(x + 0.03 - EO[0], y + (back - 0.1) / 2 + 0.18, zf + d / 2 - EO[1]), col]);
        b.c.push([b.B(x0, x1, y + 0.18, y + back, zb - 0.06, zb), col]);
        for (let x = x0 + 0.25; x < x1; x += 0.25) b.c.push([b.B(x, x + 0.03, y + 0.2, y + back - 0.1, zb - 0.09, zb - 0.06), '#4a3a2e']);
        b.c.push([b.B(x0 + 0.1, x1 - 0.1, y + 0.18, y + 0.95, zf + 0.1, zf + 0.5), hash(i, 9) > 0.5 ? '#6b5440' : '#8c8f92']);
        for (let j = 0; j < Math.floor(w / 0.55); j++) b.c.push([new THREE.SphereGeometry(0.12, 6, 4).translate(x0 + 0.35 + j * 0.55 - EO[0], y + 1.05, zf + 0.3 - EO[1]), ['#c4302a', '#d8a030', '#4f8a2e', '#e0c040'][(i + j) % 4]]);
        // the corrugated roof falling to the front over a short awning, its fascia uneven
        const ov = 0.6 + hash(i, 11) * 0.5, L = Math.hypot(d + ov, back - h), g = new THREE.BoxGeometry(w + 0.3, 0.05, L).rotateX(-Math.atan2(back - h, d + ov)).translate(x0 + w / 2 - EO[0], y + (h + back) / 2 + 0.2, zb - (d + ov) / 2 - EO[1]);
        b.c.push([g, ['#8c5b3c', '#9c8c74', '#a9adaf', '#7d5a42'][i % 4]]);
        for (let x = x0; x < x1; x += 0.3) b.c.push([new THREE.BoxGeometry(0.04, 0.03, L).rotateX(-Math.atan2(back - h, d + ov)).translate(x - EO[0], y + (h + back) / 2 + 0.24, zb - (d + ov) / 2 - EO[1]), '#6b4a36']);
        for (const x of [x0 + 0.05, x1 - 0.05]) { b.c.push([b.B(x - 0.04, x + 0.04, y, y + h + 0.1, zf - ov + 0.1, zf - ov + 0.18), '#5a4a3c']); SOLIDS.add(x, zf - ov + 0.14, 0.08); }
        wallSolids(x0, zf + 0.3, x1, zf + 0.3, Math.min(0.5, w / 4));
        wallSolids(x0, zf, x0, zb, 0.2); wallSolids(x1, zf, x1, zb, 0.2);
      }
      // a white connecting wall with a steel gate farther back, between the stalls and the next range east
      const gy = gh(862, 76);
      b.c.push([b.B(861.9, 862.2, gy, gy + 2.2, 66, 72.5), '#ecebe6'], [b.B(861.9, 862.2, gy, gy + 2.2, 77.5, 86.3), '#ecebe6'], [b.B(861.85, 862.25, gy + 2.2, gy + 2.32, 66, 86.3), '#d9d6ce']);
      b.c.push([b.B(862.0, 862.08, gy + 0.05, gy + 2.0, 72.6, 77.4), '#3d4448']);
      wallSolids(862.05, 66, 862.05, 86.3, 0.2);
      for (const [x, z, h, sp] of [[826.5, 62, 9, 13], [858, 60.5, 8.5, 12]] as [number, number, number, number][]) if (clearance(x, z) > 1.2) broadleaf(k, b.leaf, x, z, { h, spread: sp, seed: x + z, origin: EO });
    }
    // the row of timber stalls (pair 24): uneven rusty corrugated roofs on poles, tables of produce under them; small
    // and light, each its own little frame
    for (let i = 0; i < 9; i++) {
      const x = 852 + i * 3.6 + (hash(i, 2) - 0.5) * 0.6, z = 41 + (hash(2, i) - 0.5) * 1.2, w = 2.6 + hash(i, 7) * 0.8, d = 2.4, y = gh(x, z), h = 2.3 + hash(i, 4) * 0.4;
      if (clearance(x, z) < 2) continue;
      for (const [dx, dz] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) b.c.push([b.B(x + dx - 0.05, x + dx + 0.05, y, y + h + (dz > 0 ? 0.3 : 0), z + dz - 0.05, z + dz + 0.05), '#6b5440']);
      b.c.push([new THREE.BoxGeometry(w + 0.6, 0.05, d + 0.8).rotateX(0.12).translate(x - EO[0], y + h + 0.15, z - EO[1]), hash(i, 9) > 0.4 ? '#8c5b3c' : '#9c8c74']);
      b.c.push([b.B(x - w / 2 + 0.2, x + w / 2 - 0.2, y + 0.75, y + 0.82, z - d / 2 + 0.1, z - d / 2 + 0.9), '#7a5c40']);
      for (let j = 0; j < 4; j++) b.c.push([new THREE.SphereGeometry(0.13, 6, 4).translate(x - w / 2 + 0.5 + j * 0.5, y + 0.92, z - d / 2 + 0.5), ['#c4302a', '#d8a030', '#4f8a2e', '#c4302a'][j]]);
      if (hash(i, 11) > 0.5) b.c.push([b.B(x - w / 2 + 0.1, x + w / 2 - 0.1, y + 0.3, y + 1.9, z + d / 2 - 0.05, z + d / 2), '#a8442e']);
      SOLIDS.add(x, z, Math.min(w, d) * 0.45);
    }
    // the kiosk under its blue canopy at the corner (pair 23)
    if (KIOSK) {
      const [x0, x1, z0, z1] = [KIOSK.minX + 1.5, KIOSK.maxX - 2.5, KIOSK.minZ + 1.0, KIOSK.maxZ - 1.5], y = gh((x0 + x1) / 2, (z0 + z1) / 2);
      b.c.push([b.B(x0, x1, y, y + 2.4, z0, z1), '#efefe9'], [b.B(x0, x1, y, y + 0.5, z0 - 0.02, z1 + 0.02), '#c23a2c']);
      b.door.push(b.plane(false, x0 - 0.02, -1, (z0 + z1) / 2, 1.2, y + 0.9, y + 2.0));
      b.c.push([new THREE.BoxGeometry(x1 - x0 + 3.2, 0.06, z1 - z0 + 2.4).rotateZ(0.1).translate((x0 + x1) / 2 - 1.0 - EO[0], y + 2.75, (z0 + z1) / 2 - EO[1]), '#2f6fc0']);
      for (const [px, pz] of [[x0 - 2.4, z0 - 1.0], [x0 - 2.4, z1 + 1.0]]) { b.c.push([b.B(px - 0.05, px + 0.05, y, y + 2.6, pz - 0.05, pz + 0.05), '#cfd2d4']); SOLIDS.add(px, pz, 0.1); }
      wallSolids(x0, z0, x1, z0); wallSolids(x1, z0, x1, z1); wallSolids(x1, z1, x0, z1); wallSolids(x0, z1, x0, z0);
    }
    for (const [x, z, h, sp] of [[884, 26, 9, 13], [858, 18, 8, 11], [902, 60, 9, 12]] as [number, number, number, number][]) if (clearance(x, z) > 1.2) broadleaf(k, b.leaf, x, z, { h, spread: sp, seed: x * 3 + z, origin: EO });
    b.finish(k, 0.4);
  },
};

export const roadsideSite = createSite('roadside', [westSpec, southWestSpec, mallSpec, eastSpec]);
