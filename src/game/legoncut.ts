// The Legon Road (N4) cutting at the main gate interchange (the owner's 30-pair brief: pairs 8, 13, 14, 18, 19, and the
// views across it, 15, 16, 21; the layout and levels: cutplan.ts; the ground: relief.ts):
// - the two retaining walls, faced with large patterned precast panels (chamfered blocks laid in staggered courses),
//   a projecting cornice and a concrete parapet along the top; the walls run the length of the cutting and down its
//   ramps, and continue under the bridges as their abutments;
// - the floor: concrete shoulders with a drain line at each wall's foot, the grass median between the carriageways
//   (red earth showing, low kerbs), the carriageways themselves being the campus asphalt laid down in the cutting;
// - inside the ring between its two bridges, the open bowl: its sides slope down to the road over rough stone pitching
//   (pair 13);
// - the ring's two bridges: decks spanning the cutting between the walls, their concrete parapets and steel pedestrian
//   railings over the drop (pair 8), the dark soffit, a patterned central pier on the median between the two openings
//   (pair 13);
// - the paired (Y-shaped) street lights along the top on both sides (pairs 16, 18, 19) and a block-paved footway
//   between each parapet and its service road where there is room.
import * as THREE from 'three';
import { createSite, type Spec, type Style } from './blocks';
import { box, merge, type Part } from './modelkit';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { CUT, CUT_Z, DECKS, cutDepth, cutDrop, deckAt, inBowl, laneE, laneW, onBowlSlope, serviceE, serviceW, wallE, wallW } from './cutplan';

const O: [number, number] = [777, 0];
const L = (x: number, z: number): [number, number] => [x - O[0], z - O[1]];
const STEP = 2.5;
const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => { g.fillStyle = '#ccc'; g.fillRect(0, 0, 256, 512); } };

// ---------- materials ----------
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  draw(cv.getContext('2d')!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
};
let seed = 11;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
let panelMat: THREE.MeshStandardMaterial | null = null;
/** the retaining walls' facing: chamfered precast blocks about 3 m by 1.5 m in staggered courses, weathered; one tile 6 m */
function panels() {
  if (panelMat) return panelMat;
  const map = canvasTex(512, 512, (g) => {
    g.fillStyle = '#8f877a'; g.fillRect(0, 0, 512, 512);
    const W = 256, H = 128, c = 22;
    for (let row = 0; row < 4; row++) for (let col = -1; col < 3; col++) {
      const x = col * W + (row % 2 ? W / 2 : 0) + 4, y = row * H + 4, w = W - 8, h = H - 8;
      const tone = 168 + ((rnd() * 26) | 0);
      // the block: an octagon (chamfered corners), its raised face lit from above
      const poly = (inset: number) => { g.beginPath(); g.moveTo(x + c + inset, y + inset); g.lineTo(x + w - c - inset, y + inset); g.lineTo(x + w - inset, y + c + inset); g.lineTo(x + w - inset, y + h - c - inset); g.lineTo(x + w - c - inset, y + h - inset); g.lineTo(x + c + inset, y + h - inset); g.lineTo(x + inset, y + h - c - inset); g.lineTo(x + inset, y + c + inset); g.closePath(); };
      g.fillStyle = `rgb(${tone - 34},${tone - 40},${tone - 52})`; poly(0); g.fill();
      g.fillStyle = `rgb(${tone + 14},${tone + 8},${tone - 6})`; poly(3); g.fill();
      g.fillStyle = `rgb(${tone},${tone - 6},${tone - 20})`; poly(9); g.fill();
      for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '70,64,56' : '235,228,214'},${0.08 + rnd() * 0.12})`; g.fillRect(x + rnd() * w, y + rnd() * h, 2 + rnd() * 3, 2 + rnd() * 3); }
    }
    // rain streaks and grime
    for (let i = 0; i < 110; i++) { const x = rnd() * 512, l = 40 + rnd() * 220; const gr = g.createLinearGradient(0, 0, 0, l); gr.addColorStop(0, 'rgba(60,56,48,0.24)'); gr.addColorStop(1, 'rgba(60,56,48,0)'); g.fillStyle = gr; g.fillRect(x, rnd() * 512, 2 + rnd() * 5, l); }
  });
  panelMat = new THREE.MeshStandardMaterial({ map, roughness: 0.92, side: THREE.DoubleSide });
  return panelMat;
}
let grassMat: THREE.MeshStandardMaterial | null = null;
/** the median: rough grass with red earth and litter showing (pairs 18, 19) */
function medianGrass() {
  if (grassMat) return grassMat;
  const map = canvasTex(256, 256, (g) => {
    g.fillStyle = '#6c8a3a'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 46; i++) { g.fillStyle = `rgba(152,88,52,${0.25 + rnd() * 0.4})`; g.beginPath(); g.ellipse(rnd() * 256, rnd() * 256, 5 + rnd() * 24, 3 + rnd() * 10, rnd() * 3, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 2600; i++) { g.fillStyle = ['#7d9d45', '#5b7c31', '#90a957', '#a39a5a', '#4f6e2a'][(rnd() * 5) | 0]; g.fillRect(rnd() * 256, rnd() * 256, 2, 3 + rnd() * 3); }
  });
  grassMat = new THREE.MeshStandardMaterial({ map, roughness: 1, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
  return grassMat;
}
let stoneMat: THREE.MeshStandardMaterial | null = null;
/** rough stone pitching: grey angular stones bedded in sandy earth (pair 13); one tile 3 m */
function pitching() {
  if (stoneMat) return stoneMat;
  const map = canvasTex(256, 256, (g) => {
    g.fillStyle = '#b39f80'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 140; i++) {
      const x = rnd() * 256, y = rnd() * 256, r = 7 + rnd() * 11, n = 5 + ((rnd() * 3) | 0), t = 110 + ((rnd() * 60) | 0);
      g.fillStyle = `rgb(${t},${t - 4},${t - 10})`;
      g.beginPath();
      for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2 + rnd() * 0.5, rr = r * (0.7 + rnd() * 0.4); k ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      g.closePath(); g.fill();
      g.fillStyle = 'rgba(40,36,30,0.35)'; g.fillRect(x - r * 0.6, y + r * 0.45, r * 1.2, 2);
    }
  });
  stoneMat = new THREE.MeshStandardMaterial({ map, roughness: 1, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
  return stoneMat;
}
let paveMat: THREE.MeshStandardMaterial | null = null;
/** grey concrete block paving on the footways at the top (pair 11) */
function blockPaving() {
  if (paveMat) return paveMat;
  const map = canvasTex(256, 256, (g) => {
    g.fillStyle = '#6f6c66'; g.fillRect(0, 0, 256, 256);
    for (let j = 0; j < 16; j++) for (let i = -1; i < 9; i++) { const t = 150 + ((rnd() * 30) | 0); g.fillStyle = `rgb(${t},${t - 3},${t - 8})`; g.fillRect(i * 32 + (j % 2) * 16 + 1, j * 16 + 1, 30, 14); }
  });
  paveMat = new THREE.MeshStandardMaterial({ map, roughness: 0.95, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
  return paveMat;
}

// ---------- geometry helpers (model frame) ----------
/** a box along the ground from a to b, y0..y1, t thick, its middle shifted `off` along (nx, nz) */
const run = (ax: number, az: number, bx: number, bz: number, y0: number, y1: number, t: number) => {
  const len = Math.hypot(bx - ax, bz - az) || 0.01, ux = (bx - ax) / len, uz = (bz - az) / len;
  return new THREE.BoxGeometry(len + 0.02, y1 - y0, t).rotateY(-Math.atan2(uz, ux)).translate((ax + bx) / 2, (y0 + y1) / 2, (az + bz) / 2);
};
/** collects quads and strips with world-metre UVs (u along, v up or across) */
class Sheet {
  pos: number[] = []; uv: number[] = []; idx: number[] = [];
  /** a vertical quad from a to b, y0..y1 at each end, u from u0 (metres along) */
  wall(a: [number, number], b: [number, number], ya: [number, number], yb: [number, number], u0: number, tile = 4) {
    const n = this.pos.length / 3, l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    this.pos.push(a[0], ya[0], a[1], b[0], yb[0], b[1], b[0], yb[1], b[1], a[0], ya[1], a[1]);
    this.uv.push(u0 / tile, ya[0] / tile, (u0 + l) / tile, yb[0] / tile, (u0 + l) / tile, yb[1] / tile, u0 / tile, ya[1] / tile);
    this.idx.push(n, n + 1, n + 2, n, n + 2, n + 3);
  }
  /** a flat or sloping quad given by four corners (x, y, z), texture laid by x, z */
  quad(p: [number, number, number][], tile = 4) {
    const n = this.pos.length / 3;
    for (const [x, y, z] of p) { this.pos.push(x, y, z); this.uv.push(x / tile, z / tile); }
    this.idx.push(n, n + 1, n + 2, n, n + 2, n + 3);
  }
  mesh(mat: THREE.Material) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setIndex(this.idx);
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat);
    m.receiveShadow = true;
    return m;
  }
}

const spec: Spec = {
  name: 'Legon Road cutting',
  axis: [1, 0], origin: O, storey: 3, style: PLAIN, roofColor: '#888888', fascia: '#888888', pitch: 0.2,
  // heights are its own (the road's floor, the decks): the model is not lifted as a whole
  onGround: true,
  blocks: [],
  keep: [],
  extras: (k) => {
    const walls = new Sheet(), grass = new Sheet(), stones = new Sheet(), paving = new Sheet();
    const c: Part[] = [];
    const zs: number[] = [];
    for (let z = CUT_Z[0]; z <= CUT_Z[1] + 1e-6; z += STEP) zs.push(Math.min(z, CUT_Z[1]));
    const onDeck = (x: number, z: number) => !!deckAt(x, z);
    // ---- the two walls: the panelled face, the cornice and the parapet; under a bridge the face rises to its soffit ----
    for (const side of [-1, 1] as const) {
      const wx = (z: number) => (side < 0 ? wallW(z) : wallE(z));
      let u = 0;
      for (let i = 0; i < zs.length - 1; i++) {
        const za = zs[i], zb = zs[i + 1], xa = wx(za), xb = wx(zb), da = cutDepth(za), db = cutDepth(zb);
        const len = Math.hypot(xb - xa, zb - za);
        const mz = (za + zb) / 2, mx = (xa + xb) / 2;
        // in the ring's bowl the sides slope instead (below)
        if (side < 0 && onBowlSlope(mx - 0.6, mz)) { u += len; continue; }
        if (da < 0.05 && db < 0.05) { u += len; continue; }
        const under = onDeck(mx - side * 0.6, mz);
        const top = under ? -CUT.deck : 0.05;
        const A = L(xa, za), B = L(xb, zb);
        walls.wall(A, B, [-da, top], [-db, top], u, 6);
        u += len;
        if (under) continue;
        // the cornice standing out over the road, the parapet on top
        const inA = L(xa - side * 0.28, za), inB = L(xb - side * 0.28, zb);
        c.push([run(inA[0], inA[1], inB[0], inB[1], -0.35, 0.08, 0.56), '#c9c2b4']);
        const pA = L(xa + side * 0.15, za), pB = L(xb + side * 0.15, zb);
        c.push([run(pA[0], pA[1], pB[0], pB[1], 0.05, 0.95, 0.3), '#cfc8ba'], [run(pA[0], pA[1], pB[0], pB[1], 0.95, 1.05, 0.38), '#bdb6a8']);
        for (let t = 0; t < 1; t += 0.32) SOLIDS.add(xa + (xb - xa) * t + side * 0.15, za + (zb - za) * t, 0.25);
      }
    }
    // ---- the floor: shoulders and their drains, the grass median with its kerbs ----
    for (let i = 0; i < zs.length - 1; i++) {
      const za = zs[i], zb = zs[i + 1], ya = -cutDepth(za), yb = -cutDepth(zb);
      if (ya > -0.05 && yb > -0.05) continue;
      const strip = (x0a: number, x1a: number, x0b: number, x1b: number, dy: number, col: string) => {
        const g = new THREE.BufferGeometry(), [p0, q0] = L(x0a, za), [p1] = L(x1a, za), [p2, q2] = L(x0b, zb), [p3] = L(x1b, zb);
        g.setAttribute('position', new THREE.Float32BufferAttribute([p0, ya + dy, q0, p1, ya + dy, q0, p3, yb + dy, q2, p0, ya + dy, q0, p3, yb + dy, q2, p2, yb + dy, q2], 3));
        g.computeVertexNormals();
        if (g.attributes.normal.getY(0) < 0) { const a = g.attributes.position.array as Float32Array; for (const o of [0, 3]) for (let k = 0; k < 3; k++) { const t = a[(o + 1) * 3 + k]; a[(o + 1) * 3 + k] = a[(o + 2) * 3 + k]; a[(o + 2) * 3 + k] = t; } g.computeVertexNormals(); }
        c.push([g, col]);
      };
      const wwA = wallW(za), wwB = wallW(zb), weA = wallE(za), weB = wallE(zb);
      const lwA = laneW(za) - 4.5, lwB = laneW(zb) - 4.5, reA = laneE(za) + 4.5, reB = laneE(zb) + 4.5;
      if (lwA - wwA > 0.05) strip(wwA, lwA, wwB, lwB, -0.01, '#a19d94');
      if (weA - reA > 0.05) strip(reA, weA, reB, weB, -0.01, '#a19d94');
      strip(wwA, wwA + 0.55, wwB, wwB + 0.55, 0.005, '#4a4740');
      strip(weA - 0.55, weA, weB - 0.55, weB, 0.005, '#4a4740');
      const m0a = laneW(za) + 4.5, m1a = laneE(za) - 4.5, m0b = laneW(zb) + 4.5, m1b = laneE(zb) - 4.5;
      if (m1a - m0a > 0.6) {
        const [a0, az0] = L(m0a + 0.2, za), [a1] = L(m1a - 0.2, za), [b0, bz0] = L(m0b + 0.2, zb), [b1] = L(m1b - 0.2, zb);
        grass.quad([[a0, ya + 0.16, az0], [a1, ya + 0.16, az0], [b1, yb + 0.16, bz0], [b0, yb + 0.16, bz0]]);
        for (const [xa, xb] of [[m0a + 0.1, m0b + 0.1], [m1a - 0.1, m1b - 0.1]]) {
          const [p, q] = L(xa, za), [r, s] = L(xb, zb);
          c.push([run(p, q, r, s, Math.min(ya, yb) - 0.05, (ya + yb) / 2 + 0.2, 0.2), '#c8c3b8']);
        }
      }
    }
    // ---- the bowl inside the ring: stone pitching down to the road ----
    // (on the ground grid's own whole-metre cells, which the ground leaves out here)
    const R = CUT.ring, cell = 1;
    for (let x = Math.floor(R.x - R.r); x < R.x + R.r; x += cell) for (let z = Math.floor(R.z0); z < R.z1; z += cell) {
      const cx = x + cell / 2, cz = z + cell / 2;
      if (!onBowlSlope(cx, cz) || cutDrop(cx, cz) <= 0.02) continue;
      const P = (px: number, pz: number): [number, number, number] => { const [a, b] = L(px, pz); return [a, -cutDrop(px, pz) + 0.02, b]; };
      stones.quad([P(x, z), P(x + cell, z), P(x + cell, z + cell), P(x, z + cell)], 3);
    }
    // ---- the bridges: decks, their parapets and railings over the drop, the soffit, the central pier ----
    for (const d of DECKS) {
      const shape = new THREE.Shape(d.pts.map(([x, z]) => { const [a, b] = L(x, z); return new THREE.Vector2(a, -b); }));
      const top = new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2).translate(0, d.h - 0.04, 0);
      const bottom = new THREE.ShapeGeometry(shape).rotateX(Math.PI / 2).translate(0, d.h - CUT.deck, 0);
      // (the top is the road's asphalt between its parapets, as the photographs show it; the footway draws its paving over it)
      c.push([top, '#57554f'], [bottom, '#6f6c66']);
      for (let i = 0; i < d.pts.length; i++) {
        const [ax, az] = d.pts[i], [bx, bz] = d.pts[(i + 1) % d.pts.length];
        const A = L(ax, az), B = L(bx, bz), mx = (ax + bx) / 2, mz = (az + bz) / 2;
        c.push([run(A[0], A[1], B[0], B[1], d.h - CUT.deck, d.h - 0.04, 0.12), '#c4beb2']);
        // the long sides over the cutting or the bowl carry a parapet and a railing; the ends sit on the ground
        if (Math.abs(bx - ax) < 0.1) continue;
        const over = cutDrop(mx, mz) > 1 || cutDrop(mx, mz + 1.2) > 1 || cutDrop(mx, mz - 1.2) > 1;
        if (!over) continue;
        c.push([run(A[0], A[1], B[0], B[1], d.h - 0.04, d.h + 0.6, 0.3), '#cdc6b8'], [run(A[0], A[1], B[0], B[1], d.h + 0.6, d.h + 0.68, 0.36), '#bab3a5']);
        const len = Math.hypot(B[0] - A[0], B[1] - A[1]), n = Math.max(1, Math.round(len / 1.6));
        for (let j = 0; j <= n; j++) { const t = j / n, x = A[0] + (B[0] - A[0]) * t, z = A[1] + (B[1] - A[1]) * t; c.push([box(x - 0.04, x + 0.04, d.h + 0.68, d.h + 1.3, z - 0.04, z + 0.04), '#8b9197']); }
        c.push([run(A[0], A[1], B[0], B[1], d.h + 1.22, d.h + 1.3, 0.07), '#8b9197'], [run(A[0], A[1], B[0], B[1], d.h + 0.98, d.h + 1.03, 0.05), '#8b9197']);
      }
      // the pier on the median under the deck: its run is where the deck lies over the median line
      let z0 = Infinity, z1 = -Infinity;
      for (let z = 80; z < 175; z += 0.25) { const xm = (laneW(z) + laneE(z)) / 2; if (deckAt(xm, z) === d) { z0 = Math.min(z0, z); z1 = Math.max(z1, z); } }
      if (z1 > z0) {
        const fy = -cutDepth((z0 + z1) / 2), py = d.h - CUT.deck;
        for (const s of [-0.5, 0.5]) {
          const A = L((laneW(z0) + laneE(z0)) / 2 + s, z0 + 0.6), B = L((laneW(z1) + laneE(z1)) / 2 + s, z1 - 0.6);
          walls.wall(A, B, [fy, py], [fy, py], 0, 6);
        }
        for (const z of [z0 + 0.6, z1 - 0.6]) { const xm = (laneW(z) + laneE(z)) / 2, A = L(xm - 0.5, z), B = L(xm + 0.5, z); walls.wall(A, B, [fy, py], [fy, py], 0, 6); }
      }
    }
    // ---- the paired street lights along the top, and the block-paved footways ----
    for (const side of [-1, 1] as const) {
      for (let z = CUT_Z[0] + 20; z < CUT_Z[1] - 10; z += 38) {
        const w = side < 0 ? wallW(z) : wallE(z), x = w + side * 1.1, sx = side < 0 ? serviceW(z) : serviceE(z);
        if (cutDepth(z) < 1 || onDeck(x, z) || inBowl(x, z) || (sx && Math.abs(x - sx) < 4.0)) continue;
        const [px, pz] = L(x, z);
        c.push([new THREE.CylinderGeometry(0.09, 0.14, 9, 8).translate(px, 4.5, pz), '#9aa0a5']);
        for (const s of [-1, 1]) {
          const a: [number, number, number] = [px, 9, pz], b: [number, number, number] = [px + s * 1.3, 10.1, pz];
          const dv = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
          c.push([new THREE.BoxGeometry(0.08, 0.08, dv.length()).lookAt(dv).translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), '#9aa0a5']);
          c.push([box(b[0] - 0.35, b[0] + 0.35, 10.0, 10.18, pz - 0.16, pz + 0.16), '#5c6266'], [box(b[0] - 0.3, b[0] + 0.3, 9.97, 10.0, pz - 0.12, pz + 0.12), '#f4efd8']);
        }
        SOLIDS.add(x, z, 0.2);
      }
      // the footway: from the parapet out toward the service road, where it leaves room
      for (let i = 0; i < zs.length - 1; i++) {
        const za = zs[i], zb = zs[i + 1];
        const ga = side < 0 ? serviceW(za) : serviceE(za), gb = side < 0 ? serviceW(zb) : serviceE(zb);
        if (!ga || !gb || cutDepth(za) < 0.3) continue;
        const wa = side < 0 ? wallW(za) : wallE(za), wb = side < 0 ? wallW(zb) : wallE(zb);
        const room = Math.min(Math.abs(ga - wa), Math.abs(gb - wb)) - 3.1 - 0.4;
        if (room < 0.9) continue;
        const wdt = Math.min(2.2, room), o = side * 0.32;
        if (onDeck(wa + side, za) || onDeck(wb + side, zb) || inBowl(wa + side, za) || inBowl(wb + side, zb)) continue;
        const a0 = L(wa + o, za), a1 = L(wa + o + side * wdt, za), b0 = L(wb + o, zb), b1 = L(wb + o + side * wdt, zb);
        paving.quad([[a0[0], 0.13, a0[1]], [a1[0], 0.13, a1[1]], [b1[0], 0.13, b1[1]], [b0[0], 0.13, b0[1]]], 4);
        c.push([run(a1[0], a1[1], b1[0], b1[1], -0.05, 0.16, 0.14), '#cfcac0']);
      }
    }
    k.meshes.push(walls.mesh(panels()), grass.mesh(medianGrass()), stones.mesh(pitching()), paving.mesh(blockPaving()));
    const m = new THREE.Mesh(merge(c), concrete(0.6)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

/** the Legon Road cutting and its bridges */
export const legonCutSite = createSite('legon-road-cutting', [spec]);
