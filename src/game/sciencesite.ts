// The science campus brief (the owner's nine game/photo pairs and three annotated maps; the adjustable numbers in
// science.ts). Built here:
// - the gable-fronted chemistry building east of the Chemistry Department (pair 2, Map 19 circled yellow): one tall
//   storey, white with a red plinth, its gable to the east with dark louvres between white posts under deep eaves with a
//   dark fascia, a narrow central glazed assembly; the lane before it, the approach with rounded kerbs round small lawn
//   islands, the department's sign on two posts, small trees and shrubs by the wall, dappled shade;
// - the Home Science Annex (pairs 3, 4, 6, 7, Map 20): a cross of laboratory wings round a court open to the sky, white,
//   thick piers, windows set deep in their surrounds behind black security grids, blank bays, groups of small high
//   louvres on the service wall, a broad projecting concrete roof edge (parapet) over shallow tiled roofs, a projecting
//   bay; the service canopy of corrugated sheet on thin posts over its raised concrete apron in the north-west corner,
//   doors behind grilles, AC condensers in cages; the black water tanks on their plinth; the big rough trees, red earth,
//   leaf litter, sparse grass and weeds;
// - the earth corridor from NSIA Road between the annex and LECIAD and its branch north (pair 5): compacted earth with
//   worn strips, stones and litter, no asphalt, kerbs or drains;
// - the ECOWAS building (pair 8): one storey, two hipped masses either side of a lower entrance gable, dark barred
//   windows, a recessed grilled entrance, a small dark sign; the stone-faced terrace with a pale coping and central steps;
//   AC condensers in cages; the brick forecourt with faint bay lines, kerbed lawn islands, clipped hedges, a few cars.
import * as THREE from 'three';
import { box, merge, speckle, type Part } from './modelkit';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { groundHeight } from './relief';
import { SC } from './science';
import { broadleaf, stoneMeshOf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { hipRoof } from './waccbip';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** planes merged keeping their texture coordinates */
const mergeUV = (gs: THREE.BufferGeometry[]) => mergeGeometries(gs.map((g) => (g.index ? g.toNonIndexed() : g)));

const gh = groundHeight;
const hash = (x: number, z: number) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
const vnoise = (x: number, z: number) => {
  const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const hip = { gw: 0, tri: false };
const tex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const mats: Record<string, THREE.MeshStandardMaterial> = {};
/** a window behind a black security grid (glass dark, the grid squares and a horizontal louvre division) */
const gridMat = () => (mats.grid ??= new THREE.MeshStandardMaterial({ roughness: 0.6, side: THREE.DoubleSide, map: tex(128, 128, (g) => {
  const gl = g.createLinearGradient(0, 0, 0, 128); gl.addColorStop(0, '#7a868d'); gl.addColorStop(1, '#3a4248');
  g.fillStyle = gl; g.fillRect(0, 0, 128, 128);
  g.fillStyle = 'rgba(30,34,38,0.45)'; for (let y = 6; y < 128; y += 9) g.fillRect(0, y, 128, 3);
  g.fillStyle = '#0c0c0c'; for (let x = 0; x <= 128; x += 16) g.fillRect(x - 1.5, 0, 3, 128); for (let y = 0; y <= 128; y += 16) g.fillRect(0, y - 1.5, 128, 3);
  g.fillRect(0, 0, 128, 6); g.fillRect(0, 122, 128, 6); g.fillRect(0, 0, 6, 128); g.fillRect(122, 0, 6, 128);
}) }));
/** small high louvres: dark horizontal slats */
const louvreMat = () => (mats.louvre ??= new THREE.MeshStandardMaterial({ roughness: 0.7, side: THREE.DoubleSide, map: tex(64, 64, (g) => {
  g.fillStyle = '#1c1c1b'; g.fillRect(0, 0, 64, 64);
  for (let y = 2; y < 64; y += 8) { g.fillStyle = '#4c4b47'; g.fillRect(2, y, 60, 3); }
  g.fillStyle = '#0e0e0e'; g.fillRect(0, 0, 64, 2); g.fillRect(0, 62, 64, 2);
}) }));
/** a door behind a black grille */
const doorMat = () => (mats.door ??= new THREE.MeshStandardMaterial({ roughness: 0.7, side: THREE.DoubleSide, map: tex(64, 128, (g) => {
  g.fillStyle = '#1b1814'; g.fillRect(0, 0, 64, 128);
  g.fillStyle = '#3a342c'; g.fillRect(6, 6, 52, 120);
  g.fillStyle = '#0b0b0b'; for (let x = 4; x < 64; x += 7) g.fillRect(x, 0, 2, 128); for (let y = 10; y < 128; y += 22) g.fillRect(0, y, 64, 3);
}) }));
/** the narrow glazed assembly (pair 2): three tall panels, horizontal framing */
const glazeMat = () => (mats.glaze ??= new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.2, side: THREE.DoubleSide, map: tex(96, 192, (g) => {
  const gl = g.createLinearGradient(0, 0, 0, 192); gl.addColorStop(0, '#6f7f8a'); gl.addColorStop(1, '#2a3238');
  g.fillStyle = gl; g.fillRect(0, 0, 96, 192);
  g.fillStyle = '#2a2826'; for (const x of [0, 31, 62, 93]) g.fillRect(x, 0, 4, 192); for (const y of [0, 62, 124, 188]) g.fillRect(0, y, 96, 4);
}) }));

/** a ground drape whose colours may carry a fourth value, its opacity: it fades into the lawn round it instead of ending
 *  in a hard edge */
function drapeFade(org: [number, number], x0: number, x1: number, z0: number, z1: number, cell: number, lift: number, col: (x: number, z: number) => number[] | null) {
  const nx = Math.max(1, Math.round((x1 - x0) / cell)), nz = Math.max(1, Math.round((z1 - z0) / cell));
  const pos: number[] = [], color: number[] = [], idx: number[] = [], keep: boolean[] = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = x0 + ((x1 - x0) * i) / nx, z = z0 + ((z1 - z0) * j) / nz, c = col(x, z);
    keep.push(!!c); pos.push(x - org[0], gh(x, z) + lift, z - org[1]);
    const cc = c ?? [0, 0, 0, 0]; color.push(cc[0] ** 2.2, cc[1] ** 2.2, cc[2] ** 2.2, cc[3] ?? 1);
  }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
    if (keep[a] && keep[b] && keep[c] && keep[d] && (color[a * 4 + 3] + color[b * 4 + 3] + color[c * 4 + 3] + color[d * 4 + 3]) > 0) idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(color, 4));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
const fadeCover = () => (mats.fade ??= new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, depthWrite: false, roughness: 1, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));

// ---------- the walls' surfaces ----------
/** white render, plain, a little stained, the plinth at its foot */
const plainWall = (plinth: string): Style => ({
  bay: 4, up: [], ground: [],
  draw: (g) => {
    render(g, '#f1efe9'); speckle(g, 0, 0, 256, 512, 600, ['rgba(120,114,100,0.12)', 'rgba(90,86,76,0.08)']);
    for (let i = 0; i < 6; i++) { const x = (i * 47) % 250, gr = g.createLinearGradient(0, 256, 0, 400); gr.addColorStop(0, 'rgba(100,96,86,0.16)'); gr.addColorStop(1, 'rgba(100,96,86,0)'); g.fillStyle = gr; g.fillRect(x, 256, 3 + (i % 3) * 2, 144); }
    g.fillStyle = plinth; g.fillRect(0, 512 - 22, 256, 22);
  },
});
const WALL_RED = plainWall('#9a3b2c'), WALL_GREY = plainWall('#c9c5bb');

/** a face of a building in world coordinates: the plane (x when !alongX, else z), which way out, its span */
interface Face { at: number; alongX: boolean; out: 1 | -1; a0: number; a1: number }
/** boxes and planes laid on a face: a runs along it, d out from it */
const onFace = (F: Face, O: [number, number]) => {
  const Bx = (a0: number, a1: number, y0: number, y1: number, d0: number, d1: number) => {
    const p = F.at + F.out * d0, q = F.at + F.out * d1, [lo, hi] = [Math.min(p, q), Math.max(p, q)];
    return F.alongX ? box(a0 - O[0], a1 - O[0], y0, y1, lo - O[1], hi - O[1]) : box(lo - O[0], hi - O[0], y0, y1, a0 - O[1], a1 - O[1]);
  };
  const plane = (a: number, w: number, y: number, h: number, d: number) => {
    const g = new THREE.PlaneGeometry(w, h);
    if (F.alongX) { if (F.out < 0) g.rotateY(Math.PI); g.translate(a - O[0], y + h / 2, F.at + F.out * d - O[1]); }
    else { g.rotateY(F.out > 0 ? Math.PI / 2 : -Math.PI / 2); g.translate(F.at + F.out * d - O[0], y + h / 2, a - O[1]); }
    return g;
  };
  const pt = (a: number, d: number): [number, number] => (F.alongX ? [a, F.at + F.out * d] : [F.at + F.out * d, a]);
  return { Bx, plane, pt };
};

/** bays along a laboratory face: piers between them, and in each: W a window set deep in its surround behind a grid,
 *  H a higher, shorter window, B a blank bay, L a group of small high louvres, S a long louvre strip high up, D a door
 *  behind a grille with a barred window beside it */
function bays(F: Face, O: [number, number], kinds: string, e: number, c: Part[], planes: { grid: THREE.BufferGeometry[]; louvre: THREE.BufferGeometry[]; door: THREE.BufferGeometry[] }, pierD = 0.32) {
  const { Bx, plane, pt } = onFace(F, O), n = kinds.length, w = (F.a1 - F.a0) / n;
  const PIER = '#ecebe5', SUR = '#e6e4dd';
  for (let i = 0; i <= n; i++) { const a = F.a0 + w * i; c.push([Bx(a - 0.28, a + 0.28, 0, e, 0, pierD), PIER]); const [x, z] = pt(a, pierD / 2); SOLIDS.add(x, z, 0.3); }
  for (let i = 0; i < n; i++) {
    const a0 = F.a0 + w * i + 0.28, a1 = F.a0 + w * (i + 1) - 0.28, am = (a0 + a1) / 2, k = kinds[i], ww = a1 - a0;
    if (k === 'W' || k === 'H') {
      const [y0, y1] = k === 'W' ? [0.85, 2.75] : [1.45, 2.75], m = k === 'W' ? 0.25 : 0.45;
      // the surround: a deep head and sill and narrow cheeks, so the window sits in a recess
      c.push([Bx(a0, a1, y1, y1 + 0.35, 0, 0.3), SUR], [Bx(a0 - 0.02, a1 + 0.02, y0 - 0.12, y0, 0, 0.36), SUR]);
      c.push([Bx(a0, a0 + m, y0, y1, 0, 0.26), SUR], [Bx(a1 - m, a1, y0, y1, 0, 0.26), SUR]);
      planes.grid.push(plane(am, ww - 2 * m, y0, y1 - y0, 0.02));
    } else if (k === 'L') {
      const cnt = Math.max(2, Math.round(ww / 0.75)), lw = 0.5;
      for (let j = 0; j < cnt; j++) { const a = a0 + ((j + 0.5) * ww) / cnt; planes.louvre.push(plane(a, lw, 2.55, 0.32, 0.015)); c.push([Bx(a - lw / 2 - 0.04, a + lw / 2 + 0.04, 2.5, 2.55, 0, 0.08), SUR]); }
    } else if (k === 'S') {
      planes.louvre.push(plane(am, ww - 0.2, 2.3, 0.55, 0.015));
      c.push([Bx(a0, a1, 2.22, 2.3, 0, 0.12), SUR]);
    } else if (k === 'D') {
      planes.door.push(plane(a0 + 0.9, 1.4, 0.15, 2.3, 0.02));
      planes.grid.push(plane(a1 - 1.0, Math.max(0.8, ww - 2.6), 1.0, 1.5, 0.02));
      c.push([Bx(a0 + 0.12, a0 + 1.68, 2.45, 2.62, 0, 0.18), SUR]);
    }
  }
}

/** the broad concrete roof edge round a wing: a deep fascia standing out past the walls; the shallow tiled roof behind */
function roofEdge(c: Part[], O: [number, number], r: [number, number, number, number], top: number, depth: number, out: number) {
  const [x0, x1, z0, z1] = r, X = (x: number) => x - O[0], Z = (z: number) => z - O[1], ED = '#e4e1d8';
  c.push([box(X(x0 - out), X(x1 + out), top - depth, top, Z(z0 - out), Z(z0 - out + 0.22)), ED], [box(X(x0 - out), X(x1 + out), top - depth, top, Z(z1 + out - 0.22), Z(z1 + out)), ED]);
  c.push([box(X(x0 - out), X(x0 - out + 0.22), top - depth, top, Z(z0 - out), Z(z1 + out)), ED], [box(X(x1 + out - 0.22), X(x1 + out), top - depth, top, Z(z0 - out), Z(z1 + out)), ED]);
  // its soffit, shadowed, out to the walls
  c.push([box(X(x0 - out), X(x1 + out), top - depth - 0.02, top - depth + 0.08, Z(z0 - out), Z(z1 + out)), '#bdb9b0']);
  // weathering along the top: a dark band
  c.push([box(X(x0 - out - 0.01), X(x1 + out + 0.01), top - 0.12, top + 0.01, Z(z0 - out - 0.01), Z(z1 + out + 0.01)), '#8f8a80']);
}

// ---------- pair 2: the gable-fronted building ----------
const GO: [number, number] = [182, -22.5];
const gableSpec: Spec = (() => {
  const G = SC.gable, X = (x: number) => x - GO[0], Z = (z: number) => z - GO[1];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
  return {
    name: 'Department of Chemistry, the gable-fronted building', axis: [1, 0], origin: GO, storey: G.eave - 0.8, style: WALL_RED, roofColor: '#4a3c34', fascia: '#2a2522', pitch: G.pitch, plinth: '#9a3b2c',
    replaces: [[181.5, -22.5]],
    blocks: [{ x0: X(G.x0), x1: X(G.x1), z0: Z(G.z0), z1: Z(G.z1), floors: 1, roof: 'none' }],
    keep: [[X(G.x0 - 1), X(212), Z(G.z0 - 4), Z(G.z1 + 4)]],
    extras: (k: Kit) => {
      const c: Part[] = [], e = k.wallTop(1), zm = (G.z0 + G.z1) / 2, half = (G.z1 - G.z0) / 2, o = G.over;
      const top = e + (half + o) * G.pitch;
      k.roof.c = new THREE.Color('#4a3c34');
      // the roof: its ridge along x, the west end into the wing behind, the east end a gable over deep eaves
      hipRoof(k, (x, z) => [X(x), Z(z)], G.x0, G.x1 + o, G.z0 - o, G.z1 + o, e - o * G.pitch, G.pitch, 'x', [{ gw: 99, tri: false }, { gw: 99, tri: false }], c, '#2a2522');
      // the gable: white posts dividing dark louvres in the triangle above the eaves line, a dark fascia (bargeboards)
      const gx = G.x1 + 0.02, tri = (zz: number) => e + (half - Math.abs(zz - zm)) * G.pitch;
      const pos: number[] = [], seg = 24;
      for (let i = 0; i < seg; i++) {
        const za = G.z0 + ((G.z1 - G.z0) * i) / seg, zb = G.z0 + ((G.z1 - G.z0) * (i + 1)) / seg;
        pos.push(X(gx), e, Z(za), X(gx), e, Z(zb), X(gx), tri(zb), Z(zb), X(gx), e, Z(za), X(gx), tri(zb), Z(zb), X(gx), tri(za), Z(za));
        pos.push(X(gx), e, Z(za), X(gx), tri(zb), Z(zb), X(gx), e, Z(zb), X(gx), e, Z(za), X(gx), tri(za), Z(za), X(gx), tri(zb), Z(zb));
      }
      const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.computeVertexNormals();
      c.push([gg, '#1c1b1a']);
      for (let zz = G.z0 + 0.6; zz < G.z1; zz += (G.z1 - G.z0 - 1.2) / 4) { const h = tri(zz); c.push([B(gx - 0.05, gx + 0.18, e - 0.1, h, zz - 0.18, zz + 0.18), '#f1efe9']); }
      for (let y = e + 0.12; y < top; y += 0.16) for (const s of [-1, 1]) { const w = half - (y - e) / G.pitch; if (w > 0.3) c.push([B(gx + 0.02, gx + 0.06, y, y + 0.05, zm + (s < 0 ? -w : 0), zm + (s < 0 ? 0 : w)), '#33302c']); }
      c.push([B(gx - 0.1, gx + 0.2, e - 0.2, e, G.z0, G.z1), '#f1efe9']);
      for (const s of [-1, 1]) {
        const p = new THREE.Vector3(X(G.x1 + o * 0.6), e - o * G.pitch - 0.05, Z(zm + s * (half + o))), q = new THREE.Vector3(X(G.x1 + o * 0.6), e + half * G.pitch + 0.06, Z(zm));
        const d = q.clone().sub(p); c.push([new THREE.BoxGeometry(0.16, 0.34, d.length()).lookAt(d).translate((p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2), '#2a2522']);
      }
      // the narrow glazed assembly at the middle, in a dark frame
      const gw = 3.6, gh0 = 0.45, gh1 = Math.min(e - 0.6, 6.0);
      c.push([B(gx, gx + 0.12, gh0 - 0.08, gh1 + 0.08, zm - gw / 2 - 0.08, zm + gw / 2 + 0.08), '#2a2826']);
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh1 - gh0).rotateY(Math.PI / 2).translate(X(gx + 0.13), (gh0 + gh1) / 2, Z(zm)), glazeMat());
      k.meshes.push(gl);
      // the department's sign on two pale posts beside the approach (the readable heading only)
      const [sx, sz] = SC.chemSign;
      for (const dz of [-0.75, 0.75]) c.push([B(sx - 0.06, sx + 0.06, 0, 3.4, sz + dz - 0.06, sz + dz + 0.06), '#e8e6e0']);
      c.push([B(sx - 0.04, sx + 0.04, 1.6, 3.2, sz - 0.9, sz + 0.9), '#f4f3ef']);
      c.push([B(sx + 0.04, sx + 0.06, 2.95, 3.1, sz - 0.85, sz + 0.85), '#1d3f7a']);
      k.signs.push({ text: 'DEPARTMENT OF CHEMISTRY', x: X(sx + 0.06), y: 2.7, z: Z(sz), ry: Math.PI / 2, w: 1.6, colors: ['#f4f3ef', '#1d3f7a'] });
      for (let i = 0; i < 6; i++) c.push([B(sx + 0.045, sx + 0.05, 1.8 + i * 0.12, 1.84 + i * 0.12, sz - 0.6, sz + 0.2 + (i % 2) * 0.3), '#8c9096']);
      SOLIDS.add(sx, sz - 0.75, 0.15); SOLIDS.add(sx, sz + 0.75, 0.15);
      // the approach: rounded kerbs round the small lawn islands either side of the path to the lane, exposed earth
      for (const [cx, cz, r, a0, a1] of [[205.4, -27.9, 2.6, Math.PI / 2, Math.PI], [205.4, -17.1, 2.6, Math.PI, Math.PI * 1.5]] as [number, number, number, number, number][]) {
        for (let i = 0; i < 10; i++) {
          const a = a0 + ((a1 - a0) * (i + 0.5)) / 10, x = cx + Math.cos(a) * r, z = cz - Math.sin(a) * r, len = (r * (a1 - a0)) / 10;
          c.push([new THREE.BoxGeometry(len + 0.03, 0.16, 0.16).rotateY(a + Math.PI / 2).translate(X(x), 0.06, Z(z)), '#d8d4ca']);
        }
      }
      for (const [z0, z1] of [[-33.5, -27.9 + 2.6], [-17.1 - 2.6, -11]]) c.push([B(205.3, 205.5, 0, 0.16, z0 > -30 ? z0 : z0, z1), '#d8d4ca']);
      // the ground by the wall: patchy grass, earth, leaves
      k.meshes.push(new THREE.Mesh(drapeAt(GO, G.x1 + 0.2, 205.2, G.z0 - 2, G.z1 + 2, 0.5, 0.03, (x, z) => {
        const n = vnoise(x * 0.4, z * 0.4), m = hash(Math.floor(x * 1.5), Math.floor(z * 1.5));
        if (Math.abs(z - zm) < 1.8 && x > G.x1 + 4) return null;
        return n > 0.66 || m > 0.86 ? [0.55, 0.43, 0.3] : [0.33 + n * 0.08, 0.46 + n * 0.05, 0.22];
      }), groundCover()));
      // the small trees and shrubs close to the wall; the big tree whose canopy shades the approach
      const t: Part[] = [];
      for (const [x, z, h] of [[G.x1 + 1.6, -27.6, 4.6], [G.x1 + 2.4, -16.4, 2.4]] as [number, number, number][]) {
        c.push([new THREE.CylinderGeometry(0.06, 0.09, h * 0.7, 6).translate(X(x), h * 0.35, Z(z)), '#5a4a3b']);
        for (let i = 0; i < 6; i++) t.push([new THREE.IcosahedronGeometry(0.5 + (i % 3) * 0.15, 0).scale(0.8, 1.2, 0.8).translate(X(x) + Math.cos(i * 1.9) * 0.4, h * (0.45 + i * 0.09), Z(z) + Math.sin(i * 1.9) * 0.4), ['#2f5a24', '#3d6b2d', '#4a7a33'][i % 3]]);
        SOLIDS.add(x, z, 0.15);
      }
      for (const [x, z, r] of [[G.x1 + 3.5, -15.0, 1.0], [G.x1 + 1.4, -24.0, 0.45], [G.x1 + 4.6, -13.2, 0.6]] as [number, number, number][]) t.push([new THREE.IcosahedronGeometry(r, 1).scale(1.2, 0.8, 1).translate(X(x), r * 0.7, Z(z)), '#3a632d']);
      broadleaf(k, t, 207.5, -31.5, { h: 5.5, spread: 12, seed: 23, origin: GO, round: true });
      const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
      const tm = new THREE.Mesh(merge(t), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 })); tm.castShadow = true; k.meshes.push(tm);
    },
  };
})();

// ---------- pairs 3, 4, 6, 7: the Home Science Annex ----------
const AO: [number, number] = [286, -111];
/** the wings as rectangles (the cross round its court): north, south, west, east */
const AN: [number, number, number, number] = [275.7, 295.4, -133.0, -115.0];
const AS: [number, number, number, number] = [276.0, 295.9, -104.0, -90.4];
const AW: [number, number, number, number] = [265.2, 279.0, -118.7, -103.4];
const AE: [number, number, number, number] = [291.0, 307.1, -118.1, -102.4];
/** the projecting bay on the west wing's west face (pairs 3 and 4) */
const ABAY: [number, number, number, number] = [263.4, 265.2, -114.8, -107.8];
const annexSpec: Spec = (() => {
  const A = SC.annex, X = (x: number) => x - AO[0], Z = (z: number) => z - AO[1];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
  const blk = (r: [number, number, number, number]) => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors: 1, roof: 'none' as const });
  return {
    name: 'Home Science Annex', axis: [1, 0], origin: AO, storey: 3.6, style: WALL_GREY, roofColor: '#b9705a', fascia: '#e4e1d8', pitch: A.roofPitch, plinth: '#c9c5bb',
    replaces: [[286, -111.4]],
    blocks: [blk(AN), blk(AS), blk(AW), blk(AE), blk(ABAY)],
    keep: [[X(250), X(322), Z(-150), Z(-82)]],
    extras: (k: Kit) => {
      const c: Part[] = [], planes = { grid: [] as THREE.BufferGeometry[], louvre: [] as THREE.BufferGeometry[], door: [] as THREE.BufferGeometry[] };
      const e = k.wallTop(1) - 0.2;
      const F = (at: number, alongX: boolean, out: 1 | -1, a0: number, a1: number): Face => ({ at, alongX, out, a0, a1 });
      // the faces and their bays (the photos: varied windows, blank bays, service walls)
      bays(F(AN[2], true, -1, AN[0], AN[1]), AO, 'LLBL', e, c, planes);           // north: the service wall, high louvres (pair 7)
      bays(F(AN[0], false, -1, AN[2], AW[2]), AO, 'SS', e + 0.6, c, planes);      // its west face over the canopy: the long louvre strip (pair 6)
      bays(F(AN[1], false, 1, AN[2], AE[2]), AO, 'WBW', e, c, planes);
      bays(F(AW[2], true, -1, AW[0], AN[0]), AO, 'DWD', e, c, planes);           // the west wing's north face under the canopy (pair 6)
      bays(F(AW[0], false, -1, AW[2], ABAY[2]), AO, 'W', e, c, planes);
      bays(F(AW[0], false, -1, ABAY[3], AW[3]), AO, 'B', e, c, planes);           // the blank bay beside the projecting bay (pair 4)
      bays(F(ABAY[0], false, -1, ABAY[2], ABAY[3]), AO, 'WH', e + 0.3, c, planes);
      bays(F(AW[3], true, 1, AW[0], AS[0]), AO, 'WHW', e, c, planes);            // the west wing's south face (pairs 3 and 4)
      bays(F(AS[0], false, -1, AS[2] + 0.6, AS[3]), AO, 'WWBW', e, c, planes);    // the south wing's west face
      bays(F(AS[3], true, 1, AS[0], AS[1]), AO, 'WHWBW', e, c, planes);           // its south face, on the corridor (pair 5)
      bays(F(AS[1], false, 1, AE[3], AS[3]), AO, 'WBW', e, c, planes);
      bays(F(AE[2], true, -1, AN[1], AE[1]), AO, 'WWW', e - 0.4, c, planes);      // the east wing's north face, lower (pair 7, left)
      bays(F(AE[1], false, 1, AE[2], AE[3]), AO, 'WHWW', e - 0.4, c, planes);
      bays(F(AE[3], true, 1, AS[1], AE[1]), AO, 'WBW', e - 0.4, c, planes);
      // the court open to the sky (its windows)
      const [cx0, cx1, cz0, cz1] = [AW[1], AE[0], AN[3], AS[2]];
      bays(F(cz0, true, 1, cx0, cx1), AO, 'WWW', e, c, planes); bays(F(cz1, true, -1, cx0, cx1), AO, 'WWW', e, c, planes);
      bays(F(cx0, false, 1, cz0, cz1), AO, 'WW', e, c, planes); bays(F(cx1, false, -1, cz0, cz1), AO, 'WW', e, c, planes);
      k.plain.push([B(cx0, cx1, 0.02, 0.05, cz0, cz1), '#7d8a4a']);
      // the broad roof edges, standing out past the walls; a little higher over the north wing and the bay, lower over
      // the east wing; the shallow tiled roofs behind them
      k.roof.c = new THREE.Color('#b9705a');
      for (const [r, top] of [[AN, e + 1.4], [AS, e + 0.8], [AW, e + 0.8], [AE, e + 0.4], [ABAY, e + 1.1]] as [[number, number, number, number], number][]) {
        roofEdge(c, AO, r, top, A.edge + 0.1, A.edge);
        hipRoof(k, (x, z) => [X(x), Z(z)], r[0] + 0.3, r[1] - 0.3, r[2] + 0.3, r[3] - 0.3, top - 0.25, A.roofPitch, r[1] - r[0] > r[3] - r[2] ? 'x' : 'z', [hip, hip], c, '#d8d4ca');
      }
      // the court's edges have no roof over the court itself
      // ----- the service canopy in the north-west corner (pair 6): its raised apron with a dark exposed face and chipped
      // edge, a step; corrugated sheet sloping out from the wall on thin posts, beams along, simple cross framing
      {
        const [x0, x1, z0, z1] = SC.canopy, H = SC.apronH, ax0 = AW[0] - 0.4, az0 = z0 - 2.2;
        c.push([B(ax0, AN[0], -0.3, H, az0, AW[2]), '#b5b0a5']);
        c.push([B(ax0 - 0.02, AN[0], -0.3, H - 0.04, az0 - 0.02, az0 + 0.02), '#55524c'], [B(ax0 - 0.02, ax0 + 0.02, -0.3, H - 0.04, az0, AW[2]), '#55524c']);
        for (let i = 0; i < 9; i++) { const x = ax0 + 0.5 + hash(i, 3) * (AN[0] - ax0 - 1); c.push([B(x, x + 0.25 + hash(i, 5) * 0.3, H - 0.08, H + 0.005, az0 - 0.01, az0 + 0.06), '#8d887e']); }
        c.push([B(x0 + 2.5, x0 + 4.3, -0.1, H / 2, az0 - 0.45, az0), '#a9a49a']);
        const yIn = 3.15, yOut = 2.7, P = '#8e9294';
        for (const x of [x0 + 0.2, (x0 + x1) / 2, x1 - 0.2]) { c.push([B(x - 0.045, x + 0.045, H, yOut, z0 + 0.25, z0 + 0.34), P]); SOLIDS.add(x, z0 + 0.3, 0.12); }
        c.push([B(x0, x1, yOut - 0.12, yOut, z0 + 0.22, z0 + 0.36), P]);
        for (const x of [x0 + 0.2, (x0 + x1) / 2, x1 - 0.2]) {
          const p = new THREE.Vector3(X(x), yOut, Z(z0 + 0.3)), q = new THREE.Vector3(X(x), yIn, Z(z1));
          const d = q.clone().sub(p); c.push([new THREE.BoxGeometry(0.08, 0.12, d.length()).lookAt(d).translate((p.x + q.x) / 2, (p.y + q.y) / 2 - 0.06, (p.z + q.z) / 2), P]);
        }
        // the sheets: ribs across the slope, worn rust-grey; the underside darker
        const n = Math.round((x1 - x0) / 0.18);
        for (let i = 0; i <= n; i++) {
          const x = x0 - 0.2 + ((x1 - x0 + 0.4) * i) / n, p = new THREE.Vector3(X(x), yOut + 0.06 + (i % 2) * 0.03, Z(z0 - 0.15)), q = new THREE.Vector3(X(x), yIn + 0.06 + (i % 2) * 0.03, Z(z1));
          const d = q.clone().sub(p); c.push([new THREE.BoxGeometry(0.2, 0.03, d.length()).lookAt(d).translate((p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2), (i % 7 === 3) ? '#8a6d55' : i % 2 ? '#9a978f' : '#a8a59c']);
        }
        c.push([B(x0 - 0.2, x1 + 0.2, yOut - 0.2, yOut + 0.16, z0 - 0.22, z0 - 0.1), '#7e7468']);
        // the underside of the sheets, rust-stained, between the beams
        { const p = new THREE.Vector3(X(x0 - 0.2), yOut - 0.01, Z(z0 - 0.1)), u = [X(x1 + 0.2), yOut - 0.01, Z(z0 - 0.1)], v = [X(x1 + 0.2), yIn - 0.01, Z(z1)], w = [X(x0 - 0.2), yIn - 0.01, Z(z1)];
          const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute([p.x, p.y, p.z, ...u, ...v, p.x, p.y, p.z, ...v, ...w, p.x, p.y, p.z, ...v, ...u, p.x, p.y, p.z, ...w, ...v], 3)); gg.computeVertexNormals(); c.push([gg, '#6f655a']); }
        // AC condensers in cages under it, by the doors
        for (const x of [x0 + 2.2, x0 + 3.4, x1 - 1.2]) {
          const y = H, z = AW[2] - 0.55;
          c.push([B(x - 0.42, x + 0.42, y, y + 0.62, z - 0.25, z + 0.25), '#d9dadb']);
          k.plain.push([new THREE.CircleGeometry(0.2, 12).translate(X(x), y + 0.32, Z(z) - 0.26).rotateY(0), '#3a3c3e']);
          for (let t = -0.48; t <= 0.49; t += 0.12) c.push([B(x + t - 0.01, x + t + 0.01, y, y + 0.72, z - 0.33, z - 0.31), '#2c2d2e']);
          c.push([B(x - 0.5, x + 0.5, y + 0.7, y + 0.74, z - 0.33, z + 0.3), '#2c2d2e']);
          SOLIDS.add(x, z, 0.5);
        }
        // a small sign by a door
        c.push([B(AW[0] + 6.2, AW[0] + 6.5, 1.6, 1.85, AW[2] - 0.03, AW[2]), '#c8322a']);
      }
      // ----- the water tanks on their raised pale plinth by the north wing's west end (pair 7): black, ribbed, with
      // simple piping; the meter boxes stacked beside them
      {
        const px0 = AN[0] + 0.2, px1 = AN[0] + 5.6, pz0 = AN[2] - 2.4, pz1 = AN[2];
        c.push([B(px0, px1, 0, 0.5, pz0, pz1), '#dedbd2']);
        for (const [i, [tx, tz]] of SC.tanks.entries()) {
          const r = 0.78 - (i === 2 ? 0.1 : 0), h = 1.9 - (i === 2 ? 0.25 : 0);
          c.push([new THREE.CylinderGeometry(r, r, h, 18).translate(X(tx), 0.5 + h / 2, Z(tz)), '#1d1e1f'], [new THREE.CylinderGeometry(r * 0.3, r * 0.3, 0.14, 12).translate(X(tx), 0.5 + h + 0.07, Z(tz)), '#1d1e1f']);
          for (let y = 0.75; y < 0.5 + h - 0.1; y += 0.32) c.push([new THREE.TorusGeometry(r + 0.01, 0.025, 4, 18).rotateX(Math.PI / 2).translate(X(tx), y, Z(tz)), '#2a2b2c']);
          SOLIDS.add(tx, tz, r);
        }
        c.push([B(px0 + 0.4, px1 - 0.3, 0.62, 0.68, pz1 - 0.25, pz1 - 0.18), '#5d6266'], [B(px1 - 0.4, px1 - 0.34, 0.5, 2.6, pz1 - 0.25, pz1 - 0.18), '#5d6266']);
        for (let i = 0; i < 6; i++) c.push([B(px1 - 1.5 + (i % 2) * 0.5, px1 - 1.05 + (i % 2) * 0.5, 0.8 + Math.floor(i / 2) * 0.5, 1.25 + Math.floor(i / 2) * 0.5, pz1 - 0.3, pz1 - 0.05), ['#e7e5df', '#cfcbc0', '#b8b3a6'][i % 3]]);
        SOLIDS.add((px0 + px1) / 2, (pz0 + pz1) / 2, 1.5);
      }
      // the window planes
      if (planes.grid.length) k.meshes.push(new THREE.Mesh(mergeUV(planes.grid), gridMat()));
      if (planes.louvre.length) k.meshes.push(new THREE.Mesh(mergeUV(planes.louvre), louvreMat()));
      if (planes.door.length) k.meshes.push(new THREE.Mesh(mergeUV(planes.door), doorMat()));
      const m = new THREE.Mesh(merge(c), concrete(0.5)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    },
  };
})();

// ---------- the annex's grounds, the earth corridor and its branch north (pairs 3 to 7, 5) ----------
const corridorPts = (): [number, number][] => SC.corridor.pts.concat(SC.corridorNorth.slice(1));
/** distance from (x, z) to the earth tracks' centre lines */
function trackDist(x: number, z: number) {
  let best = Infinity;
  for (const line of [SC.corridor.pts, SC.corridorNorth]) for (let i = 0; i < line.length - 1; i++) {
    const [ax, az] = line[i], [bx, bz] = line[i + 1], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    best = Math.min(best, Math.hypot(x - ax - dx * t, z - az - dz * t));
  }
  return best;
}
/** inside the annex's wings (the ground there is under the floors) */
const inAnnex = (x: number, z: number) => [AN, AS, AW, AE, ABAY].some(([x0, x1, z0, z1]) => x > x0 - 0.2 && x < x1 + 0.2 && z > z0 - 0.2 && z < z1 + 0.2);
const annexGrounds: Spec = {
  name: 'Home Science Annex grounds', axis: [1, 0], origin: AO, storey: 3, style: WALL_GREY, roofColor: '#888', fascia: '#888', pitch: 0.1,
  onGround: true,
  blocks: [],
  keep: [],
  extras: (k: Kit) => {
    const X = (x: number) => x - AO[0], Z = (z: number) => z - AO[1];
    const trees: Part[] = [], c: Part[] = [];
    // the trees (the photos): the big rough-barked tree with low spreading limbs west of the west wing (pairs 3, 4);
    // the crowns along the corridor that close it into shade (pair 5); broadleaf trees round the service side (pairs 6, 7)
    const TREES: [number, number, number, number, number, boolean][] = [
      [254.5, -117.5, 4.4, 15, 3, false], [255.5, -136, 3.4, 9, 5, true], [279, -141, 3.6, 12, 7, false], [268, -140, 3.2, 8, 9, true],
      [252.5, -82, 3.4, 12, 11, true], [276, -80.5, 3.8, 11, 13, true], [297, -82.5, 3.2, 9, 15, true], [266, -70.5, 3.5, 10, 17, false],
      [304, -72, 3.4, 9, 19, true], [318, -82, 3.6, 10, 21, true], [311, -112, 3.6, 11, 23, true], [246, -90, 3.2, 8, 25, true],
    ];
    for (const [x, z, h, s, seed, round] of TREES) broadleaf(k, trees, x, z, { h, spread: s, seed, origin: AO, round, lean: seed === 3 ? 0.18 : undefined });
    const nearTree = (x: number, z: number) => TREES.reduce((m, [tx, tz, , s]) => Math.max(m, 1 - Math.hypot(x - tx, z - tz) / (s * 0.55)), 0);
    // the ground: compacted earth on the tracks (worn strips, irregular edges), red earth and leaf litter under the
    // trees, sparse grass elsewhere, weeds at the walls
    k.meshes.push(new THREE.Mesh(drapeFade(AO, 240, 322, -146, -68, 0.5, 0.035, (x, z) => {
      if (inAnnex(x, z)) return null;
      if (x > SC.canopy[0] - 1.3 && x < AN[0] && z > SC.canopy[2] - 2.4 && z < AW[2]) return null;
      const n = vnoise(x * 0.25, z * 0.25), m = vnoise(x * 1.3 + 5, z * 1.3 - 7), d = trackDist(x, z), edge = SC.corridor.half * (0.75 + n * 0.5);
      if (d < edge) {
        // the track: lighter worn strips either side of a grassier crown, darker at the edges
        const strip = Math.abs(Math.abs(d) - edge * 0.45) < 0.5 ? 0.06 : 0;
        if (d < 0.5 && m > 0.55) return [0.46, 0.46, 0.28];
        return [0.62 + strip + m * 0.05, 0.45 + strip * 0.8 + m * 0.03, 0.32 + strip * 0.6];
      }
      const t = nearTree(x, z);
      if (t > 0.25 && m < 0.35 + t * 0.6) return [0.57 + m * 0.06, 0.38 + m * 0.04, 0.27];
      if (d < edge + 1.4 && m > 0.5) return [0.55, 0.47, 0.3];
      // sparse, drier grass only near the trees and the walls; the open grass elsewhere is the campus lawn
      const nearWall = [AN, AS, AW, AE].some(([x0, x1, z0, z1]) => x > x0 - 2.5 && x < x1 + 2.5 && z > z0 - 2.5 && z < z1 + 2.5);
      if (t > 0.05 || nearWall) return [0.36 + n * 0.12 + m * 0.04, 0.47 + n * 0.06, 0.22 + n * 0.04, Math.min(1, 0.4 + t * 2 + (nearWall ? 0.6 : 0))];
      return [0.4, 0.5, 0.24, 0];
    }), fadeCover()));
    // leaf litter and a few stones on the earth
    for (let i = 0; i < 420; i++) {
      const x = 240 + hash(i, 1) * 82, z = -146 + hash(i, 2) * 78;
      if (inAnnex(x, z)) continue;
      const onTrack = trackDist(x, z) < SC.corridor.half, t = nearTree(x, z);
      if (!onTrack && t < 0.2) continue;
      const y = gh(x, z) + 0.045;
      if (i % 9 === 0 && onTrack) c.push([new THREE.IcosahedronGeometry(0.06 + hash(i, 4) * 0.08, 0).scale(1.2, 0.6, 1).translate(X(x), y, Z(z)), '#9b928a']);
      else c.push([new THREE.CircleGeometry(0.05 + hash(i, 5) * 0.07, 5).rotateX(-Math.PI / 2).translate(X(x), y, Z(z)), ['#7a5c34', '#9b7a44', '#5f4c2c', '#a88a52'][i % 4]]);
    }
    // weeds along the walls' feet; the small stump by the apron (pair 6)
    for (let i = 0; i < 160; i++) {
      const r = [AN, AS, AW, AE][i % 4], side = Math.floor(hash(i, 7) * 4), t = hash(i, 8);
      const [x, z] = side === 0 ? [r[0] + (r[1] - r[0]) * t, r[2] - 0.55] : side === 1 ? [r[0] + (r[1] - r[0]) * t, r[3] + 0.55] : side === 2 ? [r[0] - 0.55, r[2] + (r[3] - r[2]) * t] : [r[1] + 0.55, r[2] + (r[3] - r[2]) * t];
      if (inAnnex(x, z) || (x > SC.canopy[0] - 1.3 && x < AN[0] && z > SC.canopy[2] - 2.4 && z < AW[2])) continue;
      const y = gh(x, z), h = 0.25 + hash(i, 9) * 0.55;
      for (let j = 0; j < 4; j++) c.push([new THREE.ConeGeometry(0.04, h, 3).translate(0, h / 2, 0).rotateZ(0.35).rotateY(j * 1.6 + i).translate(X(x), y, Z(z)), j % 2 ? '#5f7f34' : '#4c6b2a']);
    }
    { const x = 263.2, z = -124.6, y = gh(x, z); c.push([new THREE.CylinderGeometry(0.2, 0.26, 0.6, 9).translate(X(x), y + 0.3, Z(z)), '#6e5f4e']); SOLIDS.add(x, z, 0.25); }
    // the narrow concrete paths that stay: from the apron west to the track round the annex
    c.push([box(X(258.5), X(SC.canopy[0] - 1.2), gh(262, -126) + 0.02, gh(262, -126) + 0.07, Z(-126.2), Z(-125.2)), '#b1aca1']);
    const m = new THREE.Mesh(merge(c), concrete(0.4)); m.receiveShadow = true; k.meshes.push(m);
    const t = new THREE.Mesh(merge(trees), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 })); t.castShadow = true; t.receiveShadow = true; k.meshes.push(t);
    void corridorPts;
  },
};

// ---------- pair 8: the ECOWAS building, one storey, and its forecourt ----------
const EO: [number, number] = [349, -110];
/** its wings round the court (the mapped outline) */
const EW: [number, number, number, number][] = [
  [335.0, 349.1, -131.3, -116.0], [349.1, 369.5, -124.0, -116.0], [355.0, 369.5, -116.0, -109.9], [355.0, 362.8, -109.9, -88.7],
  [327.7, 355.0, -103.0, -96.7], [334.8, 341.0, -116.0, -103.0], [327.7, 334.8, -109.3, -96.7], [348.7, 355.0, -96.7, -88.8],
];
const ECO_WALL: Style = {
  bay: 3.4, up: [], ground: [[70, 256 + 70, 116, 104]],
  draw: (g) => {
    render(g, '#f0eee8'); speckle(g, 0, 0, 256, 512, 900, ['rgba(120,114,100,0.16)', 'rgba(150,144,128,0.12)', 'rgba(90,86,76,0.1)']);
    for (let i = 0; i < 5; i++) { const x = (i * 59) % 240; const gr = g.createLinearGradient(0, 256, 0, 420); gr.addColorStop(0, 'rgba(110,104,92,0.2)'); gr.addColorStop(1, 'rgba(110,104,92,0)'); g.fillStyle = gr; g.fillRect(x, 256, 4, 164); }
    g.fillStyle = '#e2ded4'; g.fillRect(62, 256 + 62, 132, 120);
    g.fillStyle = '#1e2420'; g.fillRect(70, 256 + 70, 116, 104);
    g.fillStyle = '#3d4a40'; for (let x = 70; x < 186; x += 29) g.fillRect(x, 256 + 70, 3, 104); for (let y = 256 + 70; y < 256 + 174; y += 21) g.fillRect(70, y, 116, 3);
    g.fillStyle = '#9a9a92'; g.fillRect(0, 512 - 18, 256, 18);
  },
};
const ecowasSpec: Spec = (() => {
  const X = (x: number) => x - EO[0], Z = (z: number) => z - EO[1];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
  const T = SC.ecowas.terrace;
  return {
    name: 'ECOWAS Coastal & Marine Resources', axis: [1, 0], origin: EO, storey: 3.4, style: ECO_WALL, roofColor: '#7f4a36', fascia: '#ece9e1', pitch: 0.48, plinth: '#9a9a92',
    replaces: [[348.9, -110.1]],
    blocks: EW.map((r) => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors: 1, roof: 'none' as const })),
    keep: [[X(326), X(372), Z(-152), Z(-86)]],
    covers: [[360, -141]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [], e = k.wallTop(1);
      // the roofs: worn tiles, darker and lighter by turns (not one even orange); the two big hipped masses on the north
      // front either side of the entrance
      const tiles = ['#7f4a36', '#8a5440', '#74432f', '#8e5a45'];
      EW.forEach((r, i) => {
        k.roof.c = new THREE.Color(tiles[i % tiles.length]);
        hipRoof(k, (x, z) => [X(x), Z(z)], r[0] - 0.7, r[1] + 0.7, r[2] - 0.7, r[3] + 0.7, e, 0.48, r[1] - r[0] >= r[3] - r[2] ? 'x' : 'z', [hip, hip], c, '#ece9e1');
      });
      // the entrance between them: a lower gable facing north over a recessed, grilled entrance and the small dark sign
      const gx0 = 349.4, gx1 = 355.4, gz0 = -128.6, gz1 = -124.0, ge = e - 0.5, gm = (gx0 + gx1) / 2, gt = ge + ((gx1 - gx0) / 2 + 0.5) * 0.55;
      c.push([B(gx0, gx0 + 0.4, 0, ge, gz0, gz1), '#f0eee8'], [B(gx1 - 0.4, gx1, 0, ge, gz0, gz1), '#f0eee8'], [B(gx0, gx1, ge - 0.6, ge, gz0, gz0 + 0.3), '#f0eee8']);
      k.roof.c = new THREE.Color('#7a4632');
      k.roof.quad([X(gx0 - 0.5), ge, Z(gz1)], [X(gx0 - 0.5), ge, Z(gz0 - 0.6)], [X(gm), gt, Z(gz0 - 0.6)], [X(gm), gt, Z(gz1)]);
      k.roof.quad([X(gx1 + 0.5), ge, Z(gz0 - 0.6)], [X(gx1 + 0.5), ge, Z(gz1)], [X(gm), gt, Z(gz1)], [X(gm), gt, Z(gz0 - 0.6)]);
      { const pos = [X(gx0 - 0.3), ge, Z(gz0 - 0.55), X(gx1 + 0.3), ge, Z(gz0 - 0.55), X(gm), gt - 0.05, Z(gz0 - 0.55)];
        const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.computeVertexNormals(); c.push([gg, '#f0eee8']); }
      for (const s of [-1, 1]) { const p = new THREE.Vector3(X(gm + s * ((gx1 - gx0) / 2 + 0.5)), ge - 0.05, Z(gz0 - 0.6)), q = new THREE.Vector3(X(gm), gt + 0.05, Z(gz0 - 0.6)); const d = q.clone().sub(p); c.push([new THREE.BoxGeometry(0.12, 0.26, d.length()).lookAt(d).translate((p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2), '#2e2a27']); }
      k.plain.push([B(gx0 + 0.6, gx1 - 0.6, 0.55, 2.9, gz1 - 0.04, gz1 - 0.02), '#1b1d1c']);
      for (let x = gx0 + 0.7; x < gx1 - 0.6; x += 0.18) k.plain.push([B(x, x + 0.025, 0.55, 2.9, gz1 - 0.1, gz1 - 0.06), '#0d0d0d']);
      k.plain.push([B(gm - 1.0, gm + 1.0, ge - 0.5, ge - 0.08, gz0 - 0.02, gz0), '#25324a']);
      for (let i = 0; i < 3; i++) k.plain.push([B(gm - 0.8, gm + 0.8 - i * 0.3, ge - 0.2 - i * 0.08, ge - 0.18 - i * 0.08, gz0 - 0.03, gz0 - 0.02), '#c9cdd4']);
      // the stone-faced terrace before it, its pale coping, the central steps down to the forecourt
      const TH = SC.ecowas.terraceH;
      st.push([B(T[0], T[1], -0.2, TH - 0.08, T[2], T[3]), '#ffffff']);
      c.push([B(T[0] - 0.05, T[1] + 0.05, TH - 0.08, TH, T[2] - 0.05, T[3]), '#dcd8cc']);
      for (let i = 0; i < 3; i++) { const sz = T[2] - 0.35 * (i + 1); c.push([B(gm - 1.6, gm + 1.6, 0, TH - (i + 1) * (TH / 4), sz, sz + 0.35), '#cfcabe']); }
      SOLIDS.add(T[0] + 1.2, (T[2] + T[3]) / 2, 1.2); SOLIDS.add(T[1] - 1.2, (T[2] + T[3]) / 2, 1.2);
      // AC condensers in cages below the windows on the front
      for (const [x, z] of [[338.5, -131.3], [345.8, -131.3], [364.5, -124.0]] as [number, number][]) {
        c.push([B(x - 0.42, x + 0.42, 0.25, 0.85, z - 0.55, z - 0.05), '#d9dadb'], [B(x - 0.48, x + 0.48, 0.2, 0.25, z - 0.62, z), '#9a968c']);
        for (let t = -0.45; t <= 0.46; t += 0.12) c.push([B(x + t - 0.01, x + t + 0.01, 0.25, 0.95, z - 0.64, z - 0.62), '#2c2d2e']);
        c.push([B(x - 0.48, x + 0.48, 0.93, 0.96, z - 0.64, z), '#2c2d2e']);
        SOLIDS.add(x, z - 0.3, 0.5);
      }
      // the hedges along the front and the terrace
      for (const [x0, x1, z] of [[335.5, 348.6, -132.4], [356.5, 368.6, -125.0], [T[0], gm - 1.8, T[2] - 0.6], [gm + 1.8, T[1], T[2] - 0.6]] as [number, number, number][]) {
        for (let x = x0 + 0.5; x < x1; x += 0.9) c.push([new THREE.IcosahedronGeometry(0.5 + hash(x, z) * 0.15, 1).scale(1.2, 0.75, 0.9).translate(X(x), 0.42, Z(z)), ['#2f5a24', '#3d6b2d', '#335f27'][Math.round(x * 3) % 3]]);
      }
      // ----- the forecourt: small brick pavers in a herringbone, faint bay lines; kerbed lawn islands with clipped
      // hedges; a few parked cars
      {
        const [fx0, fx1, fz0, fz1] = SC.forecourt;
        const isles: [number, number, number, number][] = [[341, 347.5, -148.5, -145], [357.5, 364, -146, -142.5]];
        const pos: number[] = [], col: number[] = [], uv: number[] = [], idx: number[] = [];
        for (let z = fz0; z < fz1; z += 0.5) for (let x = fx0; x < fx1; x += 0.5) {
          if (isles.some(([a, b, p, q]) => x + 0.25 > a && x + 0.25 < b && z + 0.25 > p && z + 0.25 < q)) continue;
          const v = 0.56 + vnoise(x * 0.3, z * 0.3) * 0.1, bI = pos.length / 3;
          for (const [px, pz] of [[x, z], [x + 0.5, z], [x, z + 0.5], [x + 0.5, z + 0.5]]) { pos.push(X(px), gh(px, pz) + 0.045, Z(pz)); uv.push(px, pz); col.push((v * 1.02) ** 2.2, (v * 0.8) ** 2.2, (v * 0.66) ** 2.2); }
          idx.push(bI, bI + 2, bI + 1, bI + 1, bI + 2, bI + 3);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
        const brick = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, map: paverTex(), roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
        brick.receiveShadow = true; k.meshes.push(brick);
        for (let x = 340; x < 371; x += 2.6) k.plain.push([B(x - 0.04, x + 0.04, 0.05, 0.052, -139.5, -134.5), '#cfc6b4']);
        for (const [a, b, p, q] of isles) {
          c.push([B(a, b, 0, 0.16, p, p + 0.15), '#d6d2c8'], [B(a, b, 0, 0.16, q - 0.15, q), '#d6d2c8'], [B(a, a + 0.15, 0, 0.16, p, q), '#d6d2c8'], [B(b - 0.15, b, 0, 0.16, p, q), '#d6d2c8']);
          k.plain.push([B(a + 0.15, b - 0.15, 0.03, 0.12, p + 0.15, q - 0.15), '#5c7d36']);
          for (let x = a + 0.8; x < b - 0.4; x += 1.1) c.push([new THREE.IcosahedronGeometry(0.62 + hash(x, p) * 0.2, 1).scale(1.25, 0.8, 1.1).translate(X(x), 0.6, Z((p + q) / 2)), ['#3d6b2d', '#4a7a33', '#335f27'][Math.round(x) % 3]]);
          SOLIDS.add((a + b) / 2, (p + q) / 2, Math.min(b - a, q - p) / 2);
        }
        // a few cars, reference props only (a partial one at the right of the camera)
        const car = (x: number, z: number, yaw: number, colr: string) => {
          const g1 = new THREE.BoxGeometry(4.5, 0.75, 1.8).translate(0, 0.65, 0), g2 = new THREE.BoxGeometry(2.4, 0.6, 1.6).translate(-0.2, 1.3, 0);
          for (const gg of [g1, g2]) { gg.rotateY(yaw); gg.translate(X(x), 0, Z(z)); }
          c.push([g1, colr], [g2, '#2a2f34']);
          for (const [dx, dz] of [[-1.4, -0.85], [-1.4, 0.85], [1.4, -0.85], [1.4, 0.85]]) { const w = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 12).rotateX(Math.PI / 2).translate(dx, 0.34, dz); w.rotateY(yaw); w.translate(X(x), 0, Z(z)); c.push([w, '#151515']); }
          SOLIDS.add(x, z, 1.4);
        };
        car(369.0, -137.5, Math.PI / 2, '#b9bcc0'); car(341.5, -136.5, Math.PI / 2, '#3e4a5a');
      }
      stoneMeshOf(k, st);
      const m = new THREE.Mesh(merge(c), concrete(0.4)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
      // trees over the forecourt's edges (the photo's leafy foreground)
      const t: Part[] = [];
      broadleaf(k, t, 337.5, -151.5, { h: 3.4, spread: 9, seed: 31, origin: EO, round: true });
      broadleaf(k, t, 373.5, -128, { h: 3.6, spread: 10, seed: 33, origin: EO, round: true });
      const tm = new THREE.Mesh(merge(t), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 })); tm.castShadow = true; k.meshes.push(tm);
    },
  };
})();

let paverT: THREE.Texture | null = null;
/** small brick pavers: joints in a herringbone, 1 m to the texture */
function paverTex() {
  if (paverT) return paverT;
  paverT = tex(128, 128, (g) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(60,40,30,0.55)'; g.lineWidth = 1.5;
    for (let i = -8; i < 16; i++) for (let j = 0; j < 16; j++) g.strokeRect((((i * 16 + j * 8) % 128) + 128) % 128, j * 8, 16, 8);
  });
  paverT.wrapS = paverT.wrapT = THREE.RepeatWrapping;
  return paverT;
}

// ---------- pair 1: the paved passage between the Frank Torto tower and the one-floor building ----------
const PO: [number, number] = [210, -90];
const passageSpec: Spec = {
  name: 'Frank Torto passage', axis: [1, 0], origin: PO, storey: 3, style: WALL_GREY, roofColor: '#888', fascia: '#888', pitch: 0.1,
  onGround: true,
  blocks: [],
  keep: [[203.5 - PO[0], 216 - PO[0], -101 - PO[1], -80 - PO[1]]],
  extras: (k: Kit) => {
    const P = SC.passage;
    // asphalt right up to the low building's front (no lawn between), a little patched and worn
    k.meshes.push(new THREE.Mesh(drapeAt(PO, 203.5, P.x1 - 0.65, P.z0, P.z1, 0.5, 0.028, (x, z) => {
      const n = vnoise(x * 0.5, z * 0.5), m = hash(Math.floor(x * 2), Math.floor(z * 2));
      return [0.29 + n * 0.04 + (m > 0.93 ? 0.05 : 0), 0.29 + n * 0.04, 0.3 + n * 0.04];
    }), groundCover()));
    // the trees over and behind the low building that close the sky (pair 1)
    const t: Part[] = [];
    for (const [x, z, h, sp, seed] of [[226.5, -97.5, 5.5, 13, 41], [228, -86, 6, 12, 43], [224.5, -78.5, 5, 10, 45]] as [number, number, number, number, number][]) broadleaf(k, t, x, z, { h, spread: sp, seed, origin: PO, round: true });
    const tm = new THREE.Mesh(merge(t), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 })); tm.castShadow = true; k.meshes.push(tm);
  },
};

// ---------- pair 9: the shaded earth yard behind (east of) Computer Science ----------
const YO: [number, number] = [402, -284];
const yardSpec: Spec = {
  name: 'yard behind Computer Science', axis: [1, 0], origin: YO, storey: 3, style: WALL_GREY, roofColor: '#888', fascia: '#888', pitch: 0.1,
  onGround: true,
  blocks: [],
  keep: [[SC.yard[0] - YO[0], SC.yard[1] - YO[0], SC.yard[2] - YO[1], SC.yard[3] - YO[1]]],
  extras: (k: Kit) => {
    const [x0, x1, z0, z1] = SC.yard, X = (x: number) => x - YO[0], Z = (z: number) => z - YO[1];
    const c: Part[] = [], t: Part[] = [];
    // the two mature trees whose crowns close over the yard, and a smaller one
    const TREES: [number, number, number, number, number][] = [[398.8, -287.5, 3.4, 13, 51], [407.5, -278.5, 3.0, 12, 53], [410.5, -295, 3.6, 9, 55]];
    for (const [x, z, h, sp, seed] of TREES) broadleaf(k, t, x, z, { h, spread: sp, seed, origin: YO, round: seed !== 51 });
    // compacted reddish earth, worn routes, litter; grass and weeds toward the edges; it fades into the lawn
    k.meshes.push(new THREE.Mesh(drapeFade(YO, x0, x1 + 4, z0, z1 + 4, 0.5, 0.035, (x, z) => {
      const n = vnoise(x * 0.3, z * 0.3), m = vnoise(x * 1.2 + 3, z * 1.2 - 5), e = Math.min(x - x0, x1 + 4 - x, z - z0, z1 + 4 - z);
      const a = Math.max(0, Math.min(1, e / 3));
      if (m > 0.7 && n > 0.5) return [0.38, 0.47, 0.24, a];
      return [0.62 + m * 0.06, 0.38 + m * 0.04, 0.26, a];
    }), fadeCover()));
    for (let i = 0; i < 260; i++) {
      const x = x0 + hash(i, 21) * (x1 - x0), z = z0 + hash(i, 22) * (z1 - z0), y = gh(x, z) + 0.045;
      c.push([new THREE.CircleGeometry(0.05 + hash(i, 23) * 0.07, 5).rotateX(-Math.PI / 2).translate(X(x), y, Z(z)), ['#7a5c34', '#9b7a44', '#5f4c2c', '#a88a52'][i % 4]]);
    }
    // the low narrow concrete channel along the building's foot
    c.push([box(X(x0 + 0.9), X(x0 + 1.3), gh(x0 + 1, -285), gh(x0 + 1, -285) + 0.12, Z(-298), Z(-280.8)), '#b5b0a5'], [box(X(x0 + 0.95), X(x0 + 1.25), gh(x0 + 1, -285) + 0.06, gh(x0 + 1, -285) + 0.121, Z(-298), Z(-280.8)), '#3a3733']);
    // simple wooden tables and benches (removable props), with gaps to ride between
    const WOOD = '#6a4e36', WOOD2 = '#5a4230';
    for (const [x, z, yaw] of [[397.2, -282.5, 0.1], [397.6, -278.0, -0.05], [402.8, -281.0, 0.2], [404.5, -286.6, -0.15], [399.8, -292.0, 0.05]] as [number, number, number][]) {
      const y = gh(x, z), top = new THREE.BoxGeometry(1.9, 0.06, 0.8).translate(0, 0.76, 0);
      const parts: THREE.BufferGeometry[] = [top];
      for (const [dx, dz] of [[-0.85, -0.32], [-0.85, 0.32], [0.85, -0.32], [0.85, 0.32]]) parts.push(new THREE.BoxGeometry(0.07, 0.74, 0.07).translate(dx, 0.37, dz));
      for (const s2 of [-1, 1]) parts.push(new THREE.BoxGeometry(1.8, 0.05, 0.28).translate(0, 0.45, s2 * 0.7), new THREE.BoxGeometry(0.06, 0.44, 0.06).translate(-0.8, 0.22, s2 * 0.7), new THREE.BoxGeometry(0.06, 0.44, 0.06).translate(0.8, 0.22, s2 * 0.7));
      parts.forEach((g, i) => { g.rotateY(yaw); g.translate(X(x), y, Z(z)); c.push([g, i ? WOOD2 : WOOD]); });
      SOLIDS.add(x, z, 1.0);
    }
    // the pale freestanding wall at the right (pair 9), stained at its foot
    { const x = 409.8, za = -285.5, zb = -282.4, y = gh(x, -284);
      c.push([box(X(x - 0.12), X(x + 0.12), y, y + 2.3, Z(za), Z(zb)), '#d8cf9f'], [box(X(x - 0.13), X(x + 0.13), y, y + 0.35, Z(za), Z(zb)), '#a3946a']);
      for (let z = za; z <= zb; z += 0.4) SOLIDS.add(x, z, 0.2); }
    // weeds at the edges
    for (let i = 0; i < 90; i++) {
      const side = i % 3, x = side === 0 ? x0 + 0.5 + hash(i, 31) * 0.8 : x0 + hash(i, 32) * (x1 - x0), z = side === 0 ? z0 + hash(i, 33) * (z1 - z0) : side === 1 ? z0 + 0.6 : z1 - 0.6 + hash(i, 34);
      const y = gh(x, z), h = 0.3 + hash(i, 35) * 0.5;
      for (let j = 0; j < 4; j++) c.push([new THREE.ConeGeometry(0.05, h, 3).translate(0, h / 2, 0).rotateZ(0.3).rotateY(j * 1.6 + i).translate(X(x), y, Z(z)), j % 2 ? '#5f7f34' : '#4c6b2a']);
    }
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    const tm = new THREE.Mesh(merge(t), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 })); tm.castShadow = true; tm.receiveShadow = true; k.meshes.push(tm);
  },
};

/** the science campus brief's buildings and grounds */
export const scienceSite = createSite('science-campus', [passageSpec, gableSpec, annexSpec, annexGrounds, ecowasSpec, yardSpec]);
