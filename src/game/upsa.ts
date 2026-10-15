// The UPSA junction on IPS Road (the owner's field reference brief: field photos F01-F18, the UGBS reference photos,
// Street View frames, the GOIL photos; block engine: blocks.ts; the measured layout: upsaplan.ts).
//
// - The UGBS Graduate Building south of IPS Road, facing north over its car park to the road: five storeys, a long
//   main block between two end wings that stand forward of it. White walls ruled by grey bands and pilasters, the
//   windows in pairs, dark bronze frames and glass. In the middle of the front the full-height dark glass feature, three
//   strips between white piers, the middle one arched at the top, rising from the entrance canopy to a gable with the
//   UG | BS letters and "University of Ghana Business School"; the entrance under a canopy on round columns, steps and
//   ramps with steel railings. The wings end in steep white gables ruled in grey under red-brown roofs, their fronts
//   blank panels except the inner bays, open balconies storey above storey. A lower block behind (storeys not
//   photographed: four assumed).
// - Its grounds: grey herringbone pavers over the forecourt and the car parks (cars park there: corrections.json), the
//   flags; the white boundary wall along the road, square pillars with solid panels and balustraded bays; the gate on
//   the campus road: two piers under a beam with chamfered ends, the UGBS letters and crest and STEP INTO EXCELLENCE,
//   gatehouses with louvred windows either side, the blue-grey sliding gates parked open.
// - IPS Road: the kerbed grass median between the two carriageways where the mapped roads leave room for it; the tan
//   herringbone paver sidewalk along the south carriageway from the N4 junction east, stopping at the gate road and the
//   side roads; the H-frame concrete poles in the verge and their wires; the lattice transmission towers; wooden poles
//   along the north verge; traffic signals at the N4 junction corners.
// - GOIL north of the road: the shop and lube-bay block (orange LUBE BAY SERVICE box, charcoal and grey walls with
//   grilled windows, the GO cafe front), the long canopy with its GOIL fascia over two pump islands, the paved
//   forecourt and lanes; the pylon sign on its kerbed island between the way in and the way out; the ATM row (GCB,
//   Standard Chartered, National Investment Bank, Stanbic) on an orange tiled plinth, the yellow container shop, the
//   lattice telecom mast; the roadside workshops east of the station under rusty sheet roofs, tyres stacked before them.
import * as THREE from 'three';
import { box, merge, tri2, type Part } from './modelkit';
import { PL, createSite, render, type Kit, type Spec, type Style } from './blocks';
import { concrete } from './concrete';
import { hipRoof } from './waccbip';
import { SOLIDS } from './solids';
import { NODE_XZ, ROADS } from './campusmap';
import { ATM, CONTAINER, GATE, GOIL, GOIL_SIGN, H_POLES, MAST, SIGNALS, TOWERS, WALL_EAST, WALL_WEST, WOOD_POLES, wallZ } from './upsaplan';

export type V3 = [number, number, number];
const OPEN = { gw: 99, tri: false }, HIP = { gw: 0, tri: false };
const GRID = '#b2b5b7', WHITE = '#f3f2ee', BRONZE = '#3b2e25', ROOF = '#93503f', FASCIA = '#8d9296';

/** a square bar from a to b */
export const rod = (a: V3, b: V3, w: number) => {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  return new THREE.BoxGeometry(w, w, d.length()).lookAt(d).translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
};
/** a box along the ground from (ax, az) to (bx, bz), y0..y1, t thick, shifted `off` to the left of a->b */
export const run = (ax: number, az: number, bx: number, bz: number, y0: number, y1: number, t: number, off = 0) => {
  const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len;
  return new THREE.BoxGeometry(len, y1 - y0, t).rotateY(-Math.atan2(uz, ux)).translate((ax + bx) / 2 + uz * off, (y0 + y1) / 2, (az + bz) / 2 - ux * off);
};
/** overhead wires: one line per pair of end points, sagging `sag` in the middle */
export function wires(spans: [V3, V3][], sag: number) {
  const pos: number[] = [];
  for (const [a, b] of spans) {
    const n = 16;
    for (let i = 0; i < n; i++) {
      for (const t of [i / n, (i + 1) / n]) pos.push(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeBoundingSphere();
  const line = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#3a3a3a' }));
  line.name = 'upsa-wires';
  // (a line is not a mesh: the collision raster skips it; the fog culling only needs its bounds)
  return line as unknown as THREE.Mesh;
}

// ---------- materials: pavers laid herringbone, the median's grass ----------
const paverMats = new Map<string, THREE.MeshStandardMaterial>();
/** concrete pavers laid herringbone, one tile 4 m: tan (the sidewalks), grey (UGBS), dusty brown (GOIL), legon (the
 *  banking square, Night Market and banks: taupe, grey and brown stones mixed, the correction brief's ground reference) */
export function pavers(kind: 'tan' | 'grey' | 'goil' | 'legon' | 'redbrown') {
  let m = paverMats.get(kind);
  if (m) return m;
  const [base, cols] = {
    tan: ['#7c6a52', ['#c3a37c', '#b99872', '#caa984', '#b38f69', '#bf9e77']],
    grey: ['#605b55', ['#9b958c', '#908a81', '#a49e95', '#968f86', '#8a847b']],
    goil: ['#62574a', ['#a2917a', '#998871', '#a89781', '#94826b', '#9d8c76']],
    legon: ['#77706a', ['#9b9187', '#958f89', '#9c8b7b', '#969089', '#918577']],
    redbrown: ['#5c4136', ['#9a5f48', '#8d5a46', '#a06a52', '#946250', '#88604e']],
  }[kind] as [string, string[]];
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const g = cv.getContext('2d')!;
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let i = -4; i < 12; i++) for (let j = -4; j < 24; j++) {
    const x = i * 25.6 + (j % 2) * 12.8, y = j * 12.8;
    g.fillStyle = cols[(((i * 7 + j * 3) % 5) + 5) % 5];
    if ((i + j) % 2) g.fillRect(x + 1, y + 1, 23.6, 10.8); else g.fillRect(x + 1, y + 1, 10.8, 23.6);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  // drawn over the campus asphalt where they pave a lane (world.ts: the asphalt is layer 3), under a ridden route's road
  // (layer 5)
  m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -3.5, polygonOffsetUnits: -7 });
  paverMats.set(kind, m);
  return m;
}
let medianMat: THREE.MeshStandardMaterial | null = null;
/** the median's cut grass with bare red earth showing through (F02, F06, F09; Street View) */
export function medianGrass() {
  if (medianMat) return medianMat;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#6f8f3c'; g.fillRect(0, 0, 256, 256);
  let s = 7;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(150,86,52,${0.25 + r() * 0.35})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 6 + r() * 26, 4 + r() * 12, r() * 3, 0, Math.PI * 2); g.fill(); }
  for (let i = 0; i < 2500; i++) { g.fillStyle = ['#7f9f46', '#5d7f32', '#8aa552', '#a39a5a'][(r() * 4) | 0]; g.fillRect(r() * 256, r() * 256, 2, 3); }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  medianMat = new THREE.MeshStandardMaterial({ map: t, roughness: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
  return medianMat;
}
/** a flat paved rectangle (model frame), the texture laid in metres */
export function pave(k: Kit, x0: number, x1: number, z0: number, z1: number, mat: THREE.Material, y = 0.025, tile = 4) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / tile, p.getZ(i) / tile);
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; k.meshes.push(m);
}
/** a raised strip between two edges (lists of model-frame points), its top at y, faces down to the ground on both sides */
export function strip(k: Kit, a: [number, number][], b: [number, number][], y: number, mat: THREE.Material, edge: Part[], edgeCol: string, kerbs: [number, number] | null) {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i < a.length; i++) {
    pos.push(a[i][0], y, a[i][1], b[i][0], y, b[i][1]);
    uv.push(a[i][0] / 4, a[i][1] / 4, b[i][0] / 4, b[i][1] / 4);
    if (i) { const q = i * 2; idx.push(q - 2, q - 1, q, q - 1, q + 1, q); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  // (wound either way: the material is two-sided where it matters)
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; k.meshes.push(m);
  // the faces down the sides, the kerbs along them (`kerbs`: the kerb width on side a and side b, 0 for none)
  for (const [side, w] of [[a, kerbs?.[0] ?? 0], [b, kerbs?.[1] ?? 0]] as [[number, number][], number][]) {
    for (let i = 0; i < side.length - 1; i++) {
      const [ax, az] = side[i], [bx, bz] = side[i + 1];
      if (Math.hypot(bx - ax, bz - az) < 0.01) continue;
      edge.push([run(ax, az, bx, bz, 0, y, 0.04), edgeCol]);
      if (w) {
        const o = side === a ? -1 : 1;
        // the kerb sits on the strip's edge, inside it
        const [cx, cz] = [b[i][0] - a[i][0], b[i][1] - a[i][1]], l = Math.hypot(cx, cz) || 1;
        const sx = (cx / l) * (w / 2) * -o, sz = (cz / l) * (w / 2) * -o;
        edge.push([run(ax + sx, az + sz, bx + sx, bz + sz, 0, y + 0.06, w), edgeCol]);
      }
    }
  }
  // a face across each end
  edge.push([run(a[0][0], a[0][1], b[0][0], b[0][1], 0, y + (kerbs ? 0.06 : 0), 0.06), edgeCol]);
  const n = a.length - 1;
  edge.push([run(a[n][0], a[n][1], b[n][0], b[n][1], 0, y + (kerbs ? 0.06 : 0), 0.06), edgeCol]);
}

/** a lattice transmission tower at px, pz (model frame) on the ground (y 0): four tapering legs braced in bays, three
 *  pairs of cross-arms with their insulators, the earth-wire peak; returns the conductors' attachment points (the six
 *  insulator ends, then the peak) for the spans to the next tower */
export function latticeTower(c: Part[], px: number, pz: number, y0 = 0): V3[] {
  const steel = '#8c9194';
  const half = (y: number) => (y <= 20 ? 3.0 - (1.9 * y) / 20 : 1.1 - (0.25 * (y - 20)) / 11);
  const lv = [0, 4, 8, 12, 16, 20, 23.5, 27, 31];
  const P = (y: number, sx: number, sz: number): V3 => [px + sx * half(y), y0 + y, pz + sz * half(y)];
  const corners: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (let i = 0; i < lv.length - 1; i++) {
    const ya = lv[i], yb = lv[i + 1];
    for (let q = 0; q < 4; q++) {
      const [sx, sz] = corners[q], [tx, tz] = corners[(q + 1) % 4];
      c.push([rod(P(ya, sx, sz), P(yb, sx, sz), 0.16), steel]);
      c.push([rod(P(yb, sx, sz), P(yb, tx, tz), 0.08), steel]);
      c.push([rod(P(ya, sx, sz), P(yb, tx, tz), 0.06), steel], [rod(P(ya, tx, tz), P(yb, sx, sz), 0.06), steel]);
    }
  }
  const at: V3[] = [];
  for (const [y, reach] of [[20, 6.5], [23.5, 5.4], [27, 4.4]] as [number, number][]) {
    for (const s of [-1, 1]) {
      const tip: V3 = [px, y0 + y, pz + s * reach];
      for (const sx of [-1, 1]) c.push([rod(P(y, sx, s), tip, 0.08), steel], [rod(P(y - 1.6, sx, s), tip, 0.06), steel]);
      c.push([rod(tip, [tip[0], y0 + y - 1.7, tip[2]], 0.12), '#d9d6cc']);
      at.push([tip[0], y0 + y - 1.7, tip[2]]);
    }
  }
  const peak: V3 = [px, y0 + 33, pz];
  for (const [sx, sz] of corners) c.push([rod(P(31, sx, sz), peak, 0.08), steel]);
  at.push(peak);
  return at;
}

// ---------- the road lines the strips follow ----------
export function roadLine(cls: number, px: number, pz: number) {
  let best: [number, number][] = [], bd = Infinity;
  for (const r of ROADS) {
    if (r.cls !== cls) continue;
    const pts = r.nodes.map((n) => [NODE_XZ[n * 2], NODE_XZ[n * 2 + 1]] as [number, number]);
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2));
      const d = Math.hypot(ax + dx * t - px, az + dz * t - pz);
      if (d < bd) { bd = d; best = pts; }
    }
  }
  return best;
}
/** the line's z at x (lines that run west to east) */
export const zOn = (line: [number, number][], x: number) => {
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, az] = line[i], [bx, bz] = line[i + 1];
    if ((x - ax) * (x - bx) <= 0 && ax !== bx) return az + ((bz - az) * (x - ax)) / (bx - ax);
  }
  return NaN;
};

// ======================================================================================================
// the UGBS Graduate Building
// ======================================================================================================
const win = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = 'rgba(70,70,70,0.3)'; g.fillRect(x - 6, y - 5, w + 12, h + 10);
  g.fillStyle = BRONZE; g.fillRect(x - 3, y - 3, w + 6, h + 6);
  const gl = g.createLinearGradient(0, y, 0, y + h);
  gl.addColorStop(0, '#6d6157'); gl.addColorStop(0.45, '#3b332d'); gl.addColorStop(1, '#221d1a');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(255,255,255,0.07)';
  g.beginPath(); g.moveTo(x + w * 0.2, y); g.lineTo(x + w * 0.4, y); g.lineTo(x + w * 0.15, y + h); g.lineTo(x, y + h); g.fill();
  g.fillStyle = BRONZE;
  for (let i = 1; i < 4; i++) g.fillRect(x + (w * i) / 4 - 2, y, 4, h);
  g.fillRect(x, y + h * 0.3, w, 3);
};
const band = (g: CanvasRenderingContext2D, y0: number) => { g.fillStyle = GRID; g.fillRect(0, y0 + 194, 256, 18); };
/** the main block's front and back: windows in pairs between grey pilasters, a grey band under each row */
const W_FRONT: Style = {
  bay: 6.4, up: [[26, 86, 92, 104], [138, 86, 92, 104]], ground: [[26, 256 + 86, 92, 104], [138, 256 + 86, 92, 104]],
  draw: (g) => { render(g, WHITE); for (const y0 of [0, 256]) { band(g, y0); g.fillStyle = GRID; g.fillRect(0, y0, 8, 256); g.fillRect(248, y0, 8, 256); win(g, 26, y0 + 86, 92, 104); win(g, 138, y0 + 86, 92, 104); } },
};
/** the wings' sides and backs and the block behind: one window to a bay */
const W_SIDE: Style = {
  bay: 3.4, up: [[82, 86, 92, 104]], ground: [[82, 256 + 86, 92, 104]],
  draw: (g) => { render(g, WHITE); for (const y0 of [0, 256]) { band(g, y0); g.fillStyle = GRID; g.fillRect(0, y0, 4, 256); g.fillRect(252, y0, 4, 256); win(g, 82, y0 + 86, 92, 104); } },
};
/** the wings' fronts: blank white panels in a grey grid */
const W_PANEL: Style = {
  bay: 4.2, up: [], ground: [],
  draw: (g) => {
    render(g, WHITE);
    for (const y0 of [0, 256]) { band(g, y0); g.fillStyle = GRID; g.fillRect(0, y0, 7, 256); g.fillRect(249, y0, 7, 256); g.fillStyle = '#dcdcd8'; g.fillRect(7, y0 + 96, 242, 3); }
  },
};

/** a white gable face from x0 to x1 at depth z under a roof of `pitch` that overhangs it by `over`: closed up to the
 *  roof's underside */
function gableFace(k: Kit, x0: number, x1: number, z: number, e: number, pitch: number, over: number) {
  const xc = (x0 + x1) / 2, lift = over * pitch, top = e + ((x1 - x0) / 2 + over) * pitch - 0.05;
  k.plain.push([tri2([x0, e + lift - 0.05, z], [x1, e + lift - 0.05, z], [xc, top, z]), WHITE]);
  k.plain.push([box(x0, x1, e, e + lift, z - 0.01, z + 0.01), WHITE]);
}

const ST = 3.6, WX = 22.5, EX = 39.2, WF = -13.3, MF = -8.4, BACK = 13.0;
const grad: Spec = {
  name: 'UGBS Graduate Building',
  axis: [78.4, 0.7], origin: [1041, -737], storey: ST, style: W_SIDE, roofColor: ROOF, fascia: FASCIA, pitch: 0.2, plinth: '#8e9091',
  replaces: [[1041, -735], [1041, -710]],
  blocks: [
    { x0: -EX, x1: -WX, z0: WF, z1: BACK, floors: 5, roof: 'none', faces: { z0: W_PANEL } },
    { x0: -WX, x1: WX, z0: MF, z1: BACK, floors: 5, faces: { z0: W_FRONT, z1: W_FRONT } },
    { x0: WX, x1: EX, z0: WF, z1: BACK, floors: 5, roof: 'none', faces: { z0: W_PANEL } },
    { x0: -7.5, x1: 7.5, z0: BACK, z1: 40.4, floors: 4, pitch: 0.3 },
  ],
  keep: [[-EX - 1, EX + 1, WF - 1, 41], [-11, 11, -36, WF], [-49, -41, -20, -12]],
  extras: (k) => {
    const c: Part[] = [], e = k.wallTop(5), I = (x: number, z: number): [number, number] => [x, z];
    // ---- the wings: steep gable roofs, white gables ruled in grey front and back ----
    for (const [x0, x1] of [[-EX, -WX], [WX, EX]]) {
      hipRoof(k, I, x0 - 0.8, x1 + 0.8, WF - 0.8, BACK + 0.8, e, 0.55, 'z', [OPEN, OPEN], c, FASCIA);
      const xc = (x0 + x1) / 2, rise = ((x1 - x0) / 2) * 0.55;
      for (const [z, s] of [[WF, -1], [BACK, 1]]) {
        const zf = z + s * 0.03;
        gableFace(k, x0, x1, zf, e, 0.55, 0.8);
        c.push([box(x0 - 0.2, x1 + 0.2, e - 0.45, e, z, z + s * 0.3), GRID]);
        for (const sx of [-1, 1]) c.push([rod([xc + sx * ((x1 - x0) / 2 + 0.8), e - 0.08, z + s * 0.7], [xc, e + ((x1 - x0) / 2 + 0.8) * 0.55 - 0.08, z + s * 0.7], 0.3), GRID]);
        c.push([box(xc - 0.18, xc + 0.18, e, e + rise, zf, zf + s * 0.04), GRID]);
        c.push([box(x0 + 1.5, x1 - 1.5, e + rise * 0.42, e + rise * 0.42 + 0.16, zf, zf + s * 0.04), GRID]);
      }
    }
    // ---- the open balconies in the wings' inner front bays, storey above storey; glazed doors at the foot ----
    for (const [xa, xb] of [[-28.6, -WX], [WX, 28.6]]) {
      for (let s = 1; s < 5; s++) {
        const y0 = PL + s * ST;
        k.plain.push([box(xa, xb, y0, y0 + ST, WF - 0.03, WF - 0.01), '#77797a']);
        k.plain.push([box(xa + 1.2, xa + 2.4, y0 + 0.1, y0 + 2.3, WF - 0.05, WF - 0.03), BRONZE], [box(xa + 3.2, xb - 0.9, y0 + 1.0, y0 + 2.3, WF - 0.05, WF - 0.03), '#3a332e']);
        c.push([box(xa, xb, y0 - 0.05, y0 + 1.1, WF - 0.4, WF - 0.02), WHITE], [box(xa - 0.02, xb + 0.02, y0 + 1.05, y0 + 1.17, WF - 0.45, WF), GRID]);
        c.push([box(xa, xb, y0 + ST - 0.32, y0 + ST, WF - 0.4, WF), '#e8e7e2']);
      }
      for (const x of [xa, xb - 0.4]) c.push([box(x, x + 0.4, PL, e, WF - 0.42, WF), WHITE]);
      k.glass.push(box(xa + 0.8, xb - 0.8, PL, PL + 2.6, WF - 0.04, WF - 0.02));
    }
    // ---- the glass feature in the middle of the front, three strips between white piers, the middle one arched ----
    const fz = MF - 0.45, gy0 = PL + ST + 0.6, gy1 = e - 0.6;
    c.push([box(-6.6, 6.6, PL + ST - 0.1, e, fz, MF), WHITE]);
    for (const [x0, x1] of [[-6.6, -5.9], [-2.3, -1.45], [1.45, 2.3], [5.9, 6.6]]) c.push([box(x0, x1, PL + ST - 0.1, e, fz - 0.2, fz), WHITE]);
    const ar = 1.45, ay = gy1 - ar - 0.15;
    for (const [x0, x1, top] of [[-5.9, -2.3, gy1], [-1.45, 1.45, ay], [2.3, 5.9, gy1]]) {
      k.glass.push(box(x0, x1, gy0, top, fz - 0.03, fz - 0.01));
      for (let x = x0 + 0.9; x < x1 - 0.3; x += 0.9) k.plain.push([box(x - 0.03, x + 0.03, gy0, top, fz - 0.07, fz - 0.03), BRONZE]);
      for (let y = gy0; y <= top + 0.01; y += 1.2) k.plain.push([box(x0, x1, y - 0.03, y + 0.03, fz - 0.07, fz - 0.03), BRONZE]);
      for (let s = 1; s < 5; s++) { const y = PL + s * ST + ST; if (y < top) k.plain.push([box(x0, x1, y - 0.09, y + 0.09, fz - 0.08, fz - 0.03), '#2d2420']); }
    }
    k.glass.push(new THREE.CircleGeometry(ar, 24, 0, Math.PI).translate(0, ay, fz - 0.02));
    k.plain.push([new THREE.RingGeometry(ar - 0.04, ar + 0.06, 24, 1, 0, Math.PI).translate(0, ay, fz - 0.05), BRONZE]);
    // ---- the gable over it: UG | BS and the school's name; a short roof back into the main roof ----
    const gw = 8.0;
    hipRoof(k, I, -gw - 0.5, gw + 0.5, fz - 0.6, 4, e, 0.5, 'z', [OPEN, HIP], c, FASCIA);
    gableFace(k, -gw, gw, fz - 0.02, e, 0.5, 0.5);
    c.push([box(-gw - 0.3, gw + 0.3, e - 0.5, e, fz - 0.35, fz), GRID]);
    for (const sx of [-1, 1]) c.push([rod([sx * (gw + 0.5), e - 0.08, fz - 0.5], [0, e + (gw + 0.5) * 0.5 - 0.08, fz - 0.5], 0.32), GRID]);
    k.signs.push({ text: 'UG       BS', x: 0, y: e + 1.75, z: fz - 0.06, ry: Math.PI, w: 4.4, colors: [WHITE, '#1f3f99'] });
    k.signs.push({ text: 'University of Ghana Business School', x: 0, y: e + 0.75, z: fz - 0.06, ry: Math.PI, w: 7.2, colors: [WHITE, '#c0262d'] });
    // the crest between the letters
    k.plain.push([box(-0.36, 0.36, e + 1.38, e + 2.15, fz - 0.14, fz - 0.07), '#1f3f99'], [box(-0.24, 0.24, e + 1.5, e + 2.02, fz - 0.16, fz - 0.13), '#d9b23a']);
    // ---- the entrance: canopy on round columns, steps, ramps with railings, glazed doors ----
    const cz0 = MF - 4.4;
    c.push([box(-6.2, 6.2, PL + ST - 0.1, PL + ST + 0.4, cz0, MF), WHITE], [box(-6.25, 6.25, PL + ST - 0.1, PL + ST + 0.08, cz0 - 0.05, cz0 + 0.1), GRID]);
    for (const x of [-5.6, -1.9, 1.9, 5.6]) {
      c.push([new THREE.CylinderGeometry(0.27, 0.27, ST, 16).translate(x, PL + ST / 2 - 0.05, cz0 + 0.45), WHITE]);
      SOLIDS.add(...k.world(x, cz0 + 0.45), 0.35);
    }
    for (const [i, h] of [0.13, 0.27, PL].entries()) c.push([box(-4.6, 4.6, 0, h, cz0 - 1.2 + i * 0.4, MF), '#cdc9c1']);
    for (const s of [-1, 1]) {
      // the ramp from the landing down along the front, a railing on its outer edge
      const x0 = s * 4.6, x1 = s * 10.4, za = cz0 - 1.2, zb = cz0 + 0.2;
      const top = (x: number) => PL * (1 - (Math.abs(x) - 4.6) / 5.8);
      c.push([tri2([x0, PL, za], [x1, 0.02, za], [x0, 0.02, za]), '#cdc9c1'], [tri2([x0, PL, zb], [x1, 0.02, zb], [x0, 0.02, zb]), '#cdc9c1']);
      c.push([tri2([x0, PL, za], [x1, 0.02, za], [x1, 0.02, zb]), '#cdc9c1'], [tri2([x0, PL, za], [x1, 0.02, zb], [x0, PL, zb]), '#cdc9c1']);
      for (const z of [za + 0.05, zb - 0.05]) {
        c.push([rod([x0, top(x0) + 0.9, z], [x1, top(x1) + 0.9, z], 0.05), '#b9bec2']);
        for (let x = 4.8; x <= 10.3; x += 1.1) c.push([rod([s * x, top(s * x), z], [s * x, top(s * x) + 0.9, z], 0.05), '#b9bec2']);
      }
    }
    k.glass.push(box(-4.2, 4.2, PL, PL + ST - 0.5, MF - 0.04, MF - 0.02));
    for (const x of [-4.2, -2.1, 0, 2.1, 4.2]) k.plain.push([box(x - 0.05, x + 0.05, PL, PL + ST - 0.5, MF - 0.07, MF - 0.03), '#2d2420']);
    k.plain.push([box(-4.2, 4.2, PL + 2.4, PL + 2.5, MF - 0.07, MF - 0.03), '#2d2420']);
    // ---- the flags: the white UGBS flag left of the entrance (d5_21), three poles off the west wing (d5_20) ----
    const flag = (x: number, z: number, cols: string[]) => {
      c.push([new THREE.CylinderGeometry(0.05, 0.07, 9, 8).translate(x, 4.5, z), '#c9ccce']);
      cols.forEach((col, i) => k.plain.push([box(x + 0.08, x + 1.9, 8.8 - (i + 1) * (1.2 / cols.length), 8.8 - i * (1.2 / cols.length), z - 0.01, z + 0.01), col]));
      SOLIDS.add(...k.world(x, z), 0.15);
    };
    flag(-13, -17, ['#f7f7f4', '#f7f7f4']);
    k.plain.push([box(-12.25, -11.75, 8.05, 8.45, -17.03, -16.97), '#1f3f99']);
    flag(-43, -16, ['#ce1126', '#fcd116', '#006b3f']);
    k.plain.push([box(-42.2, -41.8, 8.0, 8.4, -16.03, -15.97), '#111111']);
    flag(-44.4, -16, ['#1f3f99', '#1f3f99']);
    flag(-45.8, -16, ['#f7f7f4', '#f7f7f4']);
    const m = new THREE.Mesh(merge(c), concrete(0.25)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

// ======================================================================================================
// the grounds, the wall, the gate; IPS Road's median, sidewalk, poles and wires
// ======================================================================================================
const GO: [number, number] = [1110, -850];
/** the car parks (world x0, x1, z0, z1): the long side first, as the parking areas in corrections.json */
export const UGBS_PARKS: [number, number, number, number][] = [
  [1004, 1031.5, -771.6, -757.6], [1050.5, 1097, -771.6, -757.6], [1005.5, 1036.8, -849, -780.5], [1043, 1107, -816.8, -779.8], [1043, 1107, -854.5, -823.6],
];
const grounds: Spec = {
  name: 'UGBS grounds and IPS Road',
  axis: [1, 0], origin: GO, storey: 3, style: W_SIDE, roofColor: ROOF, fascia: FASCIA, pitch: 0.3,
  blocks: [],
  covers: UGBS_PARKS.map(([x0, x1, z0, z1]) => [(x0 + x1) / 2, (z0 + z1) / 2]),
  // the sidewalk, the median and the verge stay clear of street trees and parked cars
  keep: [[960 - GO[0], 1100 - GO[0], -880 - GO[1], -855.5 - GO[1]], [1100 - GO[0], 1260 - GO[0], -880 - GO[1], -858 - GO[1]], [GATE.x - 14 - GO[0], GATE.x + 14 - GO[0], -867 - GO[1], -856 - GO[1]]],
  extras: (k) => {
    const L = (x: number, z: number): [number, number] => [x - GO[0], z - GO[1]];
    const c: Part[] = [], edge: Part[] = [];
    const solid = (x: number, z: number, r: number) => SOLIDS.add(x, z, r);
    // ---- the forecourt and the car parks: grey pavers, kerbed edges, the bays painted ----
    const grey = pavers('grey');
    const rect = (x0: number, x1: number, z0: number, z1: number) => {
      const [a, b] = L(x0, z0), [cc, d] = L(x1, z1);
      pave(k, a, cc, b, d, grey);
      for (const [p, q, r, s] of [[a, cc, b, b], [a, cc, d, d], [a, a, b, d], [cc, cc, b, d]]) c.push([box(p - 0.1, q + 0.1, 0, 0.12, r - 0.1, s + 0.1), '#d3d0c8']);
    };
    rect(999, 1098, -773.3, -746);
    for (const [x0, x1, z0, z1] of UGBS_PARKS.slice(2)) rect(x0, x1, z0, z1);
    // the bay lines where life.ts parks the cars: rows across the long side, 2.6 m bays
    for (const [x0, x1, z0, z1] of UGBS_PARKS) {
      const alongX = x1 - x0 >= z1 - z0, [u0, u1, w0, w1] = alongX ? [x0, x1, z0, z1] : [z0, z1, -x1, -x0];
      for (let w = w0 + 3; w < w1 - 2.5; w += 8) {
        for (let u = u0 + 0.7; u < u1 - 0.2; u += 2.6) {
          const [ax, az, bx, bz] = alongX ? [u, w - 2.4, u, w + 2.4] : [-(w - 2.4), u, -(w + 2.4), u];
          const [p, q] = L(ax, az), [r, s] = L(bx, bz);
          k.plain.push([box(Math.min(p, r) - 0.05, Math.max(p, r) + 0.05, 0.03, 0.045, Math.min(q, s) - 0.05, Math.max(q, s) + 0.05), '#e9e7df']);
        }
      }
    }
    // ---- the boundary wall: square pillars, solid panels, every third bay a balustrade ----
    let bay = 0;
    const wall = (pts: [number, number][]) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, az] = pts[i], [bx, bz] = pts[i + 1], len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 3.1));
        for (let j = 0; j <= n; j++) {
          const [px, pz] = L(ax + ((bx - ax) * j) / n, az + ((bz - az) * j) / n);
          c.push([box(px - 0.24, px + 0.24, 0, 2.2, pz - 0.24, pz + 0.24), '#dedad2'], [box(px - 0.3, px + 0.3, 2.2, 2.32, pz - 0.3, pz + 0.3), '#cfcac0']);
          if (j === n) break;
          const [qx, qz] = L(ax + ((bx - ax) * (j + 1)) / n, az + ((bz - az) * (j + 1)) / n);
          if (bay++ % 3 === 2) {
            c.push([run(px, pz, qx, qz, 0, 0.6, 0.22), '#dcd8cf'], [run(px, pz, qx, qz, 1.62, 1.8, 0.26), '#dcd8cf'], [run(px, pz, qx, qz, 0, 0.18, 0.24), '#a8a195']);
            const m = Math.round(Math.hypot(qx - px, qz - pz) / 0.26);
            for (let b = 1; b < m; b++) { const t = b / m; c.push([box(px + (qx - px) * t - 0.055, px + (qx - px) * t + 0.055, 0.6, 1.62, pz + (qz - pz) * t - 0.055, pz + (qz - pz) * t + 0.055), '#e3e0d8']); }
          } else {
            c.push([run(px, pz, qx, qz, 0, 1.95, 0.2), '#dcd8cf'], [run(px, pz, qx, qz, 1.9, 2.0, 0.26), '#cfcac0'], [run(px, pz, qx, qz, 0, 0.25, 0.22), '#a8a195']);
          }
        }
        const m = Math.ceil(len / 0.8);
        for (let j = 0; j <= m; j++) solid(ax + ((bx - ax) * j) / m, az + ((bz - az) * j) / m, 0.25);
      }
    };
    wall(WALL_WEST); wall(WALL_EAST);
    // ---- the gate: piers, the beam with chamfered ends, the letters; gatehouses; the sliding gates parked open ----
    {
      const [gx, gz] = L(GATE.x, GATE.z), o = GATE.open, p = GATE.pier, hx = o + p + GATE.house, cream = '#ece7dc';
      for (const s of [-1, 1]) {
        const x0 = gx + s * o, x1 = gx + s * (o + p);
        c.push([box(x0, x1, 0, 5.6, gz - 0.55, gz + 0.55), cream], [box(x0 - s * 0.05, x1 + s * 0.05, 0, 0.3, gz - 0.6, gz + 0.6), '#a8a195']);
        // the gatehouse, flat-roofed under a cornice, a louvred window to the road, a door on the gate side
        const h0 = gx + s * (o + p), h1 = gx + s * hx, f = gz + GATE.houseFront, b = gz + GATE.houseBack;
        c.push([box(h0, h1, 0, 3.3, f, b), cream], [box(h0 - s * 0.15, h1 + s * 0.15, 3.3, 3.6, f - 0.2, b + 0.2), '#dcd6ca'], [box(h0, h1, 0, 0.35, f - 0.03, b + 0.03), '#a8a195']);
        const wx = (h0 + h1) / 2;
        k.plain.push([box(wx - 0.8, wx + 0.8, 1.0, 2.2, f - 0.04, f - 0.01), '#4c5258']);
        for (let y = 1.08; y < 2.2; y += 0.14) k.plain.push([box(wx - 0.78, wx + 0.78, y, y + 0.06, f - 0.07, f - 0.03), '#6f767c']);
        k.plain.push([box(Math.min(h0, h0 + s * 0.04), Math.max(h0, h0 + s * 0.04), 0.35, 2.4, b - 2.0, b - 1.0), '#4a5a68']);
        // the chamfered beam end sloping down to the gatehouse roof
        const xe = gx + s * (o + p + 2.2);
        k.plain.push([tri2([x1, 5.6, gz - 0.62], [x1, 6.9, gz - 0.62], [xe, 3.6, gz - 0.62]), cream], [tri2([x1, 5.6, gz + 0.62], [x1, 6.9, gz + 0.62], [xe, 3.6, gz + 0.62]), cream]);
        const top = new THREE.BufferGeometry();
        top.setAttribute('position', new THREE.Float32BufferAttribute([x1, 6.9, gz - 0.62, xe, 3.6, gz - 0.62, xe, 3.6, gz + 0.62, x1, 6.9, gz - 0.62, xe, 3.6, gz + 0.62, x1, 6.9, gz + 0.62], 3));
        top.computeVertexNormals();
        k.plain.push([top, cream]);
        // the sliding gate, blue-grey steel, parked open behind the gatehouse wall line
        const ga = gx + s * (o + p + 0.2), gb = gx + s * (o + p + 4.6), gzz = gz + GATE.houseBack + 0.3;
        k.plain.push([box(Math.min(ga, gb), Math.max(ga, gb), 0.1, 1.5, gzz - 0.04, gzz + 0.04), '#5d7486']);
        for (let x = Math.min(ga, gb); x < Math.max(ga, gb); x += 0.16) k.plain.push([box(x, x + 0.04, 1.5, 2.3, gzz - 0.02, gzz + 0.02), '#5d7486']);
        k.plain.push([box(Math.min(ga, gb), Math.max(ga, gb), 2.25, 2.33, gzz - 0.03, gzz + 0.03), '#5d7486']);
        for (let x = h0; s > 0 ? x <= h1 : x >= h1; x += s * 0.8) { solid(x + GO[0], f + GO[1] + 0.3, 0.4); solid(x + GO[0], b + GO[1] - 0.3, 0.4); }
        solid((x0 + x1) / 2 + GO[0], gz + GO[1], 0.7);
      }
      c.push([box(gx - o - p, gx + o + p, 5.6, 6.9, gz - 0.62, gz + 0.62), cream], [box(gx - o - p, gx + o + p, 5.55, 5.65, gz - 0.65, gz + 0.65), '#cdc6b8']);
      // the letters and the crest stand on the beam; the motto on its face
      c.push([box(gx - 3.3, gx + 3.3, 6.9, 8.2, gz - 0.08, gz + 0.08), cream]);
      k.signs.push({ text: 'U  G       B  S', x: gx, y: 7.55, z: gz - 0.1, ry: Math.PI, w: 6.4, colors: [cream, '#1f3f99'] });
      k.plain.push([box(gx - 0.45, gx + 0.45, 7.0, 8.15, gz - 0.2, gz - 0.11), '#1f3f99'], [box(gx - 0.32, gx + 0.32, 7.15, 7.95, gz - 0.22, gz - 0.19), '#d9b23a']);
      k.plain.push([box(gx - 2.1, gx + 2.1, 6.0, 6.55, gz - 0.66, gz - 0.62), '#1f3f99']);
      k.signs.push({ text: 'STEP INTO EXCELLENCE', x: gx, y: 6.27, z: gz - 0.67, ry: Math.PI, w: 3.9, colors: ['#1f3f99', '#ffffff'] });
      // the paved way through the gate (d5_23)
      pave(k, gx - o + 0.1, gx + o - 0.1, -866.3 - GO[1], -846 - GO[1], grey);
    }
    // ---- IPS Road: the median between the carriageways, the sidewalk along the south one ----
    const ips = roadLine(1, 1080, -880), south = roadLine(2, 1080, -871);
    const tan = pavers('tan');
    {
      // the median: from the north carriageway's edge to the south one's, kerbed, where the roads leave a metre or more
      const gaps = [[GATE.x - GATE.open + 0.1, GATE.x + GATE.open - 0.1], [1161.5, 1173]];
      let a: [number, number][] = [], b: [number, number][] = [];
      const flush = () => { if (a.length > 1) strip(k, a, b, 0.14, medianGrass(), edge, '#cfcbc2', [0.2, 0.2]); a = []; b = []; };
      for (let x = 998; x <= 1300; x += 1) {
        const n = zOn(ips, x) + 3.75, s = zOn(south, x) - 3.15;
        if (!(s - n >= 1.0) || gaps.some(([g0, g1]) => x > g0 && x < g1)) { flush(); continue; }
        a.push(L(x, n)); b.push(L(x, s));
      }
      flush();
    }
    {
      // the sidewalk: 2 m of tan pavers beyond the kerb and drain line, narrowing where the wall comes close, open at
      // the gate road and the side roads (their driveways)
      const gaps = [[GATE.x - GATE.open + 0.3, GATE.x + GATE.open - 0.3], [1160.5, 1172.5], [1174.5, 1188]];
      let a: [number, number][] = [], b: [number, number][] = [];
      const flush = () => { if (a.length > 1) strip(k, a, b, 0.14, tan, edge, '#d6d2c8', [0, 0.16]); a = []; b = []; };
      for (let x = 961; x <= 1300; x += 1) {
        const line = x < 997.6 ? ips : south, zc = zOn(line, x), dz = (zOn(line, x + 0.5) - zOn(line, x - 0.5)) || 0;
        const l = Math.hypot(1, dz), nx = -dz / l, nz = 1 / l;
        const hx = GATE.open + GATE.pier + GATE.house + 0.2, clear = x > GATE.x - hx && x < GATE.x + hx ? 1.7 : 0.5;
        const outer = Math.min(6.05, (wallZ(x) - clear - zc) / nz);
        if (Number.isNaN(zc) || outer - 4.05 < 0.8 || gaps.some(([g0, g1]) => x > g0 && x < g1)) { flush(); continue; }
        a.push(L(x + nx * 4.05, zc + nz * 4.05)); b.push(L(x + nx * outer, zc + nz * outer));
      }
      flush();
    }
    // ---- the H-frame concrete poles in the verge, their wires ----
    const hp: V3[][] = [];
    for (const [x, z] of H_POLES) {
      const [px, pz] = L(x, z);
      for (const s of [-1, 1]) { c.push([new THREE.CylinderGeometry(0.11, 0.17, 11, 6).translate(px, 5.5, pz + s * 0.8), '#b9b5ad']); solid(x, z + s * 0.8, 0.25); }
      c.push([box(px - 0.06, px + 0.06, 10.05, 10.2, pz - 1.8, pz + 1.8), '#6d6f71'], [box(px - 0.06, px + 0.06, 8.45, 8.6, pz - 1.4, pz + 1.4), '#6d6f71']);
      const at: V3[] = [[px, 10.45, pz - 1.6], [px, 10.45, pz], [px, 10.45, pz + 1.6], [px, 8.85, pz - 1.2], [px, 8.85, pz + 1.2]];
      for (const [ax, ay, az] of at) c.push([new THREE.CylinderGeometry(0.06, 0.08, 0.3, 6).translate(ax, ay - 0.1, az), '#e8e8e4']);
      hp.push(at);
    }
    const spans: [V3, V3][] = [];
    for (let i = 0; i < hp.length - 1; i++) for (let j = 0; j < hp[i].length; j++) spans.push([hp[i][j], hp[i + 1][j]]);
    k.meshes.push(wires(spans, 0.9));
    // ---- the lattice transmission towers, the line between them ----
    const tw: V3[][] = [];
    for (const [x, z] of TOWERS) { const [px, pz] = L(x, z); tw.push(latticeTower(c, px, pz)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) solid(x + sx * 3, z + sz * 3, 0.45); }
    k.meshes.push(wires(tw[0].map((p, j) => [p, tw[1][j]] as [V3, V3]), 7));
    // ---- traffic signals at the N4 junction's corners ----
    const jx = 951.2, jz = -883.7;
    for (const [x, z] of SIGNALS) {
      const [px, pz] = L(x, z), yaw = Math.atan2(x - jx, z - jz);
      c.push([new THREE.CylinderGeometry(0.08, 0.1, 4.6, 8).translate(px, 2.3, pz), '#5f6366']);
      const head = (ry: number) => {
        const g: Part[] = [[box(-0.2, 0.2, 3.3, 4.35, -0.16, 0.16), '#1b1c1e'], [box(-0.32, 0.32, 3.2, 4.45, -0.19, -0.17), '#1b1c1e']];
        ['#d7261e', '#4a3a12', '#1f4d2a'].forEach((col, i) => g.push([new THREE.CircleGeometry(0.11, 12).translate(0, 4.17 - i * 0.33, 0.165), col]));
        for (const [geo, col] of g) k.plain.push([geo.rotateY(ry).translate(px, 0, pz), col]);
      };
      head(yaw); head(yaw + Math.PI / 2);
      solid(x, z, 0.2);
    }
    // ---- the wooden poles along the north verge of IPS Road, their two wires ----
    const wp: V3[][] = [];
    for (const [x, z] of WOOD_POLES) {
      const [px, pz] = L(x, z);
      c.push([new THREE.CylinderGeometry(0.11, 0.15, 9, 7).translate(px, 4.5, pz), '#6b5844'], [box(px - 0.06, px + 0.06, 8.3, 8.42, pz - 0.95, pz + 0.95), '#4f4234']);
      wp.push([[px, 8.55, pz - 0.75], [px, 8.55, pz + 0.75]]);
      solid(x, z, 0.2);
    }
    const ws: [V3, V3][] = [];
    for (let i = 0; i < wp.length - 1; i++) for (let j = 0; j < 2; j++) ws.push([wp[i][j], wp[i + 1][j]]);
    k.meshes.push(wires(ws, 0.8));
    const m = new THREE.Mesh(merge(c), concrete(0.35)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    if (edge.length) { const e = new THREE.Mesh(merge(edge), concrete(0.2)); e.receiveShadow = true; k.meshes.push(e); }
  },
};

// ======================================================================================================
// GOIL: the shop and lube bay, the canopy and pumps, the forecourt
// ======================================================================================================
const ORANGE = '#ee6a1c', GOIL_RED = '#b5262d';
const GOIL_WALL: Style = { bay: 3.6, up: [], ground: [], draw: (g) => { render(g, '#a3a7ab'); g.fillStyle = '#6d7175'; g.fillRect(0, 512 - 18, 256, 18); } };
const GOIL_FRONT: Style = {
  bay: 3.6, up: [], ground: [[70, 256 + 70, 116, 120]],
  draw: (g) => {
    render(g, '#a3a7ab');
    g.fillStyle = '#2e3134'; g.fillRect(70, 256 + 70, 116, 120);
    // the white security grille over the window
    g.strokeStyle = '#e7e7e4'; g.lineWidth = 4;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(70 + i * 23, 256 + 70); g.lineTo(70 + i * 23 + 20, 256 + 190); g.stroke(); g.beginPath(); g.moveTo(70 + i * 23 + 20, 256 + 70); g.lineTo(70 + i * 23, 256 + 190); g.stroke(); }
    g.strokeRect(70, 256 + 70, 116, 120);
    g.fillStyle = '#6d7175'; g.fillRect(0, 512 - 18, 256, 18);
  },
};
const [GX0, GX1, GZ0, GZ1] = GOIL.shop;
const goil: Spec = {
  name: 'GOIL filling station',
  axis: GOIL.axis, origin: GOIL.origin, storey: 3.6, style: GOIL_WALL, roofColor: '#7d7f80', fascia: ORANGE, pitch: 0.1,
  replaces: [GOIL.origin],
  blocks: [{ x0: -9, x1: GX1, z0: GZ0, z1: GZ1, floors: 1, roof: 'flat', faces: { z1: GOIL_FRONT } }],
  keep: [[-17, 17, -6, 38]],
  extras: (k) => {
    const c: Part[] = [], e = k.wallTop(1);
    // the orange fascia round the top of the block
    for (const [x0, x1, z0, z1] of [[-9, GX1, GZ0 - 0.06, GZ0 + 0.06], [-9, GX1, GZ1 - 0.06, GZ1 + 0.06], [GX1 - 0.06, GX1 + 0.06, GZ0, GZ1]]) c.push([box(x0, x1, e - 0.45, e + 0.05, z0 - 0.02, z1 + 0.02), ORANGE]);
    // the lube bay: a taller box clad in orange tiles, its open bay and the black sign over it
    c.push([box(GX0, -9, 0, 5.4, GZ0, GZ1), ORANGE]);
    for (let x = GX0 + 0.62; x < -9; x += 0.62) k.plain.push([box(x - 0.02, x + 0.02, 0, 5.4, GZ1, GZ1 + 0.02), '#d9581a']);
    for (let y = 0.6; y < 5.4; y += 0.6) k.plain.push([box(GX0, -9, y - 0.02, y + 0.02, GZ1, GZ1 + 0.02), '#d9581a']);
    k.plain.push([box(GX0 + 0.9, -9.9, 0, 3.6, GZ1 + 0.02, GZ1 + 0.04), '#29292a']);
    k.plain.push([box(GX0 + 1.0, -10.0, 3.75, 4.4, GZ1 + 0.04, GZ1 + 0.1), '#1d1d1d']);
    k.signs.push({ text: 'LUBE BAY SERVICE', x: (GX0 - 9) / 2 + 0.05, y: 4.07, z: GZ1 + 0.11, ry: 0, w: 3.2, colors: ['#1d1d1d', '#ffffff'] });
    // the charcoal wall section with its door; the GO cafe front at the east end
    k.plain.push([box(-9, -4.6, PL, e - 0.45, GZ1, GZ1 + 0.03), '#3a3e43'], [box(-7.4, -6.2, PL, 2.6, GZ1 + 0.03, GZ1 + 0.05), '#1e2023']);
    k.plain.push([box(6.2, GX1, 2.9, e + 0.4, GZ1 + 0.02, GZ1 + 0.3), '#e5461c']);
    k.signs.push({ text: 'GO  cafe', x: 10.4, y: 3.65, z: GZ1 + 0.31, ry: 0, w: 3.0, colors: ['#e5461c', '#ffffff'] });
    k.plain.push([new THREE.CircleGeometry(0.42, 20).translate(8.0, 3.65, GZ1 + 0.32), '#ffffff']);
    k.glass.push(box(6.6, GX1 - 0.6, PL, 2.7, GZ1 + 0.02, GZ1 + 0.04));
    for (let x = 6.6; x <= GX1 - 0.5; x += 0.5) k.plain.push([box(x - 0.025, x + 0.025, PL, 2.7, GZ1 + 0.05, GZ1 + 0.08), '#e7e7e4']);
    // ---- the canopy: orange-red columns, the slab, the orange fascia with the GOIL panels ----
    const [cx0, cx1, cz0, cz1] = GOIL.canopy, H = GOIL.canopyH;
    for (const [x, z] of GOIL.columns) {
      c.push([box(x - 0.28, x + 0.28, 0, H, z - 0.28, z + 0.28), '#d8401c'], [box(x - 0.42, x + 0.42, 0.2, 1.9, z - 0.42, z + 0.42), '#f08a1e']);
      SOLIDS.add(...k.world(x, z), 0.45);
    }
    c.push([box(cx0, cx1, H, H + 0.3, cz0, cz1), '#e4e5e6']);
    for (let x = cx0 + 1.5; x < cx1 - 1; x += 2.6) for (const z of [cz0 + 2.5, (cz0 + cz1) / 2, cz1 - 2.5]) k.plain.push([box(x - 0.35, x + 0.35, H - 0.02, H, z - 0.35, z + 0.35), '#fffbe8']);
    for (const [x0, x1, z0, z1] of [[cx0, cx1, cz0, cz0 + 0.1], [cx0, cx1, cz1 - 0.1, cz1], [cx0, cx0 + 0.1, cz0, cz1], [cx1 - 0.1, cx1, cz0, cz1]]) {
      k.plain.push([box(x0 - 0.02, x1 + 0.02, H + 0.3, H + 1.3, z0 - 0.02, z1 + 0.02), '#e8521c'], [box(x0 - 0.03, x1 + 0.03, H + 1.25, H + 1.4, z0 - 0.03, z1 + 0.03), '#f39a3a']);
    }
    for (const [z, ry, s] of [[cz1 + 0.05, 0, 1], [cz0 - 0.05, Math.PI, -1]] as [number, number, number][]) {
      const xm = (cx0 + cx1) / 2;
      k.plain.push([box(xm - 4.2, xm + 4.2, H + 0.32, H + 1.36, z - 0.03, z + 0.03), '#fbfbf8']);
      k.signs.push({ text: 'GOIL', x: xm + s * 1.1, y: H + 0.84, z: z + s * 0.04, ry, w: 2.6, colors: ['#fbfbf8', GOIL_RED] });
      k.plain.push([new THREE.CircleGeometry(0.42, 20).rotateY(ry).translate(xm - s * 2.2, H + 0.84, z + s * 0.05), '#f39a3a'], [new THREE.CircleGeometry(0.2, 16).rotateY(ry).translate(xm - s * 2.2, H + 0.84, z + s * 0.06), '#fbfbf8']);
    }
    // ---- the pump islands, two dispensers each ----
    for (const z of GOIL.islands) {
      c.push([box(GOIL.islandX[0], GOIL.islandX[1], 0, 0.22, z - 0.7, z + 0.7), '#cfccc5'], [box(GOIL.islandX[0] - 0.02, GOIL.islandX[1] + 0.02, 0.02, 0.2, z - 0.72, z + 0.72), '#f08a1e']);
      for (const x of [-1.6, 2.2]) {
        k.plain.push([box(x - 0.5, x + 0.5, 0.22, 2.1, z - 0.3, z + 0.3), '#f4f4f1'], [box(x - 0.51, x + 0.51, 1.75, 2.1, z - 0.31, z + 0.31), ORANGE], [box(x - 0.3, x + 0.3, 1.15, 1.6, z - 0.32, z + 0.32), '#2c3640']);
        for (const s of [-1, 1]) k.plain.push([new THREE.TorusGeometry(0.35, 0.025, 4, 10, Math.PI).rotateZ(Math.PI).translate(x + s * 0.55, 1.3, z), '#1b1b1b']);
        SOLIDS.add(...k.world(x, z), 0.6);
      }
    }
    // ---- the forecourt: dusty brown pavers from the shop to the lanes ----
    const brown = pavers('goil');
    pave(k, -17, 17, GZ1 + 0.1, 38, brown);
    pave(k, GX0 - 3, GX1 + 3, GZ0 - 3, GZ1 + 0.1, brown, 0.02);
    const m = new THREE.Mesh(merge(c), concrete(0.2)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

// ======================================================================================================
// the roadside north of IPS Road: the GOIL sign island, the ATM row, the container shop, the mast, the workshops
// ======================================================================================================
const RO: [number, number] = [1080, -905];
const roadside: Spec = {
  name: 'IPS Road north side',
  axis: [1, 0], origin: RO, storey: 2.8, style: GOIL_WALL, roofColor: '#5a4636', fascia: '#4b3b30', pitch: 0.1,
  replaces: [[1123, -905], [1080.5, -896]],
  blocks: [],
  keep: [
    [GOIL_SIGN.island[0] - 1 - RO[0], GOIL_SIGN.island[1] + 1 - RO[0], GOIL_SIGN.island[2] - 1 - RO[1], GOIL_SIGN.island[3] + 0.5 - RO[1]],
    [1072 - RO[0], 1093 - RO[0], -925 - RO[1], -906 - RO[1]], [1076 - RO[0], 1086 - RO[0], -900 - RO[1], -892 - RO[1]],
    [1110 - RO[0], 1137 - RO[0], -909 - RO[1], -896 - RO[1]],
  ],
  extras: (k) => {
    const L = (x: number, z: number): [number, number] => [x - RO[0], z - RO[1]];
    const c: Part[] = [];
    // the paved lanes in and out between the road and the forecourt
    const brown = pavers('goil');
    pave(k, ...((): [number, number, number, number] => { const [a, b] = L(1033.5, -918), [cc, d] = L(1057.5, -885.9); return [a, cc, b, d]; })(), brown, 0.03);
    // ---- the pylon sign on its island ----
    {
      const [ix0, ix1, iz0, iz1] = GOIL_SIGN.island, [a, b] = L(ix0, iz0), [cc, d] = L(ix1, iz1);
      c.push([box(a, cc, 0, 0.12, b, d), '#94573a']);
      for (const [p, q, r, s] of [[a, cc, b, b + 0.22], [a, cc, d - 0.22, d], [a, a + 0.22, b, d], [cc - 0.22, cc, b, d]]) c.push([box(p, q, 0, 0.2, r, s), '#e4e1da']);
      for (const [x, z] of [[a + 1.2, b + 1.5], [cc - 1.4, b + 2.6], [a + 1.6, d - 2.5], [cc - 1.2, d - 1.6]]) k.plain.push([new THREE.IcosahedronGeometry(0.55, 0).scale(1, 0.75, 1).translate(x, 0.5, z), '#4f7f35']);
      const [sx, sz] = L(GOIL_SIGN.x, GOIL_SIGN.z), w = 0.8, hw = 0.3;
      c.push([box(sx - hw, sx + hw, 0, 7.6, sz - w, sz + w), '#3d4246'], [box(sx - hw - 0.05, sx + hw + 0.05, 0, 0.6, sz - w - 0.05, sz + w + 0.05), '#2b2e31']);
      c.push([box(sx - hw - 0.02, sx + hw + 0.02, 5.3, 5.9, sz - w - 0.02, sz + w + 0.02), ORANGE]);
      for (const s of [-1, 1]) {
        const fx = sx + s * (hw + 0.03), ry = (s * Math.PI) / 2;
        k.signs.push({ text: 'GOIL', x: fx + s * 0.02, y: 6.45, z: sz, ry, w: 1.2, colors: ['#3d4246', '#ffffff'] });
        k.plain.push([new THREE.CircleGeometry(0.34, 18).rotateY(ry).translate(fx + s * 0.02, 7.15, sz), '#f6f6f2']);
        // the price panels (dark, their red figures not reproduced)
        for (let i = 0; i < 3; i++) {
          const y = 4.85 - i * 0.62;
          k.plain.push([box(fx - 0.01, fx + 0.01, y - 0.25, y + 0.25, sz - w + 0.12, sz + w - 0.12), '#141516']);
          for (let j = 0; j < 4; j++) k.plain.push([box(fx + s * 0.012 - 0.005, fx + s * 0.012 + 0.005, y - 0.15, y + 0.15, sz - 0.5 + j * 0.3, sz - 0.36 + j * 0.3), '#7a1f1a']);
        }
        k.plain.push([rod([fx + s * 0.015, 0.8, sz - w + 0.05], [fx + s * 0.015, 2.9, sz + w - 0.05], 0.18), '#f2c21a']);
      }
      SOLIDS.add(GOIL_SIGN.x, GOIL_SIGN.z, 1.0);
      // the feather flag beside it, and the small orange arrow signs at the island's ends
      const [fx, fz] = [sx + 1.4, sz + 1.7];
      c.push([new THREE.CylinderGeometry(0.03, 0.03, 4.2, 6).translate(fx, 2.1, fz), '#bfc3c6']);
      const flagG = new THREE.BufferGeometry();
      flagG.setAttribute('position', new THREE.Float32BufferAttribute([fx, 4.2, fz, fx, 1.2, fz, fx + 0.9, 3.8, fz + 0.3, fx, 1.2, fz, fx + 0.6, 1.5, fz + 0.2, fx + 0.9, 3.8, fz + 0.3], 3));
      flagG.computeVertexNormals();
      k.plain.push([flagG, ORANGE]);
      for (const [x, z] of [[sx - 1.6, d - 0.8], [sx + 1.6, d - 0.8]]) {
        c.push([box(x - 0.04, x + 0.04, 0, 0.9, z - 0.04, z + 0.04), '#9aa0a5']);
        k.plain.push([box(x - 0.3, x + 0.3, 0.9, 1.5, z - 0.03, z + 0.03), ORANGE]);
      }
    }
    // ---- the ATM row on its orange tiled plinth, facing the forecourt ----
    {
      const [ux, uz] = ATM.axis, yaw = Math.atan2(-uz, ux), [ox, oz] = L(ATM.x, ATM.z), hl = ATM.len / 2, d = ATM.depth / 2;
      const P = (g: THREE.BufferGeometry) => g.rotateY(yaw).translate(ox, 0, oz);
      c.push([P(box(-hl - 0.2, hl + 0.2, 0, 0.35, -d - 0.2, d + 0.4)), '#e48a3c']);
      for (let x = -hl; x < hl; x += 0.4) k.plain.push([P(box(x, x + 0.02, 0, 0.35, d + 0.4, d + 0.42)), '#b4672a']);
      c.push([P(box(-hl, hl, 0.35, 2.75, -d, -d + 0.1)), '#d9d7d1'], [P(box(-hl, -hl + 0.1, 0.35, 2.75, -d, d)), '#d9d7d1'], [P(box(hl - 0.1, hl, 0.35, 2.75, -d, d)), '#d9d7d1']);
      c.push([P(box(-hl, hl, 2.75, 2.85, -d, d)), '#d9d7d1']);
      // four booths: dark frames, glass, the machine inside each, the bank's wrap behind it
      const banks: [string, string, string][] = [['GCB', '#ffffff', '#c99b14'], ['Standard Chartered', '#ffffff', '#0b7a6a'], ['NATIONAL INVESTMENT BANK', '#ffffff', '#3c4a5a'], ['Stanbic Bank', '#1a49a8', '#ffffff']];
      const bw = ATM.len / 4;
      banks.forEach(([name, bg, fg], i) => {
        const x0 = -hl + i * bw, xm = x0 + bw / 2;
        k.plain.push([P(box(xm - 0.35, xm + 0.35, 0.35, 1.9, -d + 0.15, -d + 0.75)), '#9ea3a8'], [P(box(xm - 0.25, xm + 0.25, 1.35, 1.7, -d + 0.74, -d + 0.77)), '#1c2a38']);
        k.plain.push([P(box(x0 + 0.1, x0 + bw - 0.1, 0.35, 2.5, -d + 0.1, -d + 0.13)), i === 3 ? '#1a49a8' : i === 1 ? '#2a9a8a' : i === 0 ? '#f0b323' : '#e9edf2']);
        for (const x of [x0, x0 + bw]) k.plain.push([P(box(x - 0.05, x + 0.05, 0.35, 2.75, d - 0.08, d + 0.02)), '#3a2a22']);
        k.plain.push([P(box(x0 + 0.05, x0 + bw - 0.05, 2.3, 2.75, d - 0.04, d + 0.03)), '#f2f2ee']);
        k.plain.push([P(box(x0 + 0.05, x0 + bw - 0.05, 2.85, 3.35, d - 0.02, d + 0.06)), bg]);
        k.signs.push({ text: name, x: ox + Math.cos(yaw) * xm + Math.sin(yaw) * (d + 0.08), y: 3.1, z: oz - Math.sin(yaw) * xm + Math.cos(yaw) * (d + 0.08), ry: yaw, w: Math.min(1.7, 0.12 * name.length + 0.5), colors: [bg, fg] });
      });
      k.glass.push(P(box(-hl + 0.05, hl - 0.05, 0.35, 2.3, d - 0.03, d - 0.01)));
      // the light sheet roof on its frame over the west half
      c.push([P(box(-hl - 0.3, 0.6, 3.6, 3.68, -d - 0.5, d + 0.6)), '#b9b4aa']);
      for (const x of [-hl - 0.2, 0.5]) c.push([P(box(x - 0.04, x + 0.04, 2.85, 3.6, -d - 0.4, -d - 0.32)), '#6a5a4c']);
      for (let s = -3; s <= 3; s += 1.2) SOLIDS.add(ATM.x + s * ux, ATM.z + s * uz, 0.9);
      // the yellow container shop beside it, a sheet roof over its open front
      const [qx, qz] = L(CONTAINER.x, CONTAINER.z), Q = (g: THREE.BufferGeometry) => g.rotateY(yaw).translate(qx, 0, qz);
      c.push([Q(box(-3.05, 3.05, 0, 2.6, -1.22, 1.22)), '#f0c419']);
      for (let x = -2.9; x < 3; x += 0.3) k.plain.push([Q(box(x - 0.03, x + 0.03, 0.1, 2.5, 1.22, 1.25)), '#d8ab10']);
      k.plain.push([Q(box(-1.6, 1.6, 0.3, 2.2, 1.24, 1.27)), '#3b3a36']);
      c.push([Q(box(-3.3, 3.3, 2.7, 2.78, -1.4, 2.6)), '#8f8a80']);
      for (const x of [-3.1, 3.1]) c.push([Q(box(x - 0.04, x + 0.04, 0, 2.7, 2.42, 2.5)), '#6a5a4c']);
      for (let s = -2.6; s <= 2.6; s += 1.3) SOLIDS.add(CONTAINER.x + s * ux, CONTAINER.z + s * uz, 1.2);
    }
    // ---- the lattice telecom mast with its floodlight ----
    {
      const [mx, mz] = L(...MAST), hh = 0.45;
      const corners: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      for (let y = 0; y < 30; y += 2) {
        for (let q = 0; q < 4; q++) {
          const [sx, sz] = corners[q], [tx, tz] = corners[(q + 1) % 4];
          c.push([rod([mx + sx * hh, y, mz + sz * hh], [mx + sx * hh, y + 2, mz + sz * hh], 0.07), '#c3c6c8']);
          c.push([rod([mx + sx * hh, y, mz + sz * hh], [mx + tx * hh, y + 2, mz + tz * hh], 0.035), '#c3c6c8']);
        }
      }
      c.push([new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6).translate(mx, 31.2, mz), '#c3c6c8'], [box(mx - 0.5, mx + 0.5, 32.2, 32.8, mz - 0.25, mz + 0.25), '#e9e9e4']);
      k.plain.push([box(mx - 0.45, mx + 0.45, 32.25, 32.75, mz + 0.25, mz + 0.27), '#fff7d6']);
      for (const [sx, sz] of corners) SOLIDS.add(MAST[0] + sx * hh, MAST[1] + sz * hh, 0.2);
    }
    // ---- the small timber kiosk east of the ATMs (the mapped hut) ----
    {
      const [a, b] = L(1078.4, -897.7), [cc, d] = L(1082.7, -894.0);
      c.push([box(a, cc, 0, 2.5, b, d), '#7a5a3e']);
      for (let x = a + 0.3; x < cc; x += 0.3) k.plain.push([box(x - 0.02, x + 0.02, 0, 2.5, d, d + 0.02), '#5d4430']);
      c.push([box(a - 0.3, cc + 0.3, 2.5, 2.6, b - 0.3, d + 0.6), '#6d5a48']);
      k.plain.push([box(a + 0.8, cc - 0.8, 0.9, 1.9, d + 0.02, d + 0.04), '#2d2620']);
      SOLIDS.add(1080.5, -895.9, 2.2);
    }
    // ---- the workshops: blockwork and timber under rusty sheet roofs, steel grille fronts, tyres before them ----
    {
      const [a, b] = L(1111.9, -908.1), [cc, d] = L(1134.4, -902.0), front = d + 2.8;
      c.push([box(a, cc, 0, 1.2, b, d), '#9a8f84'], [box(a, cc, 1.2, 2.9, b, b + 0.15), '#6e5440'], [box(a, a + 0.15, 1.2, 2.9, b, d), '#6e5440'], [box(cc - 0.15, cc, 1.2, 2.9, b, d), '#6e5440']);
      const roof = new THREE.BufferGeometry();
      roof.setAttribute('position', new THREE.Float32BufferAttribute([a - 0.3, 3.3, b - 0.3, cc + 0.3, 3.3, b - 0.3, cc + 0.3, 2.55, front, a - 0.3, 3.3, b - 0.3, cc + 0.3, 2.55, front, a - 0.3, 2.55, front], 3));
      roof.computeVertexNormals();
      k.plain.push([roof, '#5b4535']);
      for (let x = a; x < cc; x += 1.1) k.plain.push([rod([x, 3.32, b - 0.3], [x, 2.57, front], 0.04), '#4a382c']);
      const bays = 5, bw = (cc - a) / bays;
      for (let i = 0; i < bays; i++) {
        const x0 = a + i * bw;
        if (i % 2 === 0) {
          for (let x = x0 + 0.15; x < x0 + bw - 0.1; x += 0.18) k.plain.push([box(x - 0.02, x + 0.02, 1.2, 2.9, d - 0.02, d), '#5b6f7f']);
          k.plain.push([box(x0 + 0.1, x0 + bw - 0.1, 0.1, 2.9, d - 0.3, d - 0.28), '#2a2622']);
        } else k.plain.push([box(x0 + 0.05, x0 + bw - 0.05, 1.2, 2.9, d - 0.15, d - 0.05), '#7a5c44']);
        c.push([box(x0 - 0.07, x0 + 0.07, 0, 2.7, front - 0.15, front - 0.01), '#5d4b3c']);
        SOLIDS.add(x0 + RO[0], front + RO[1] - 0.08, 0.15);
      }
      for (let x = a + 0.5; x < cc; x += 0.8) { SOLIDS.add(x + RO[0], b + RO[1] + 0.3, 0.5); SOLIDS.add(x + RO[0], d + RO[1] - 0.3, 0.5); }
      k.plain.push([box(a + 3, a + 4.4, 1.6, 2.4, front + 0.05, front + 0.08), '#f2f2ee']);
      for (const [x, n] of [[a + 1.2, 5], [a + 6.8, 4], [a + 12.5, 6], [cc - 2.0, 3]] as [number, number][]) {
        for (let i = 0; i < n; i++) k.plain.push([new THREE.TorusGeometry(0.34, 0.13, 6, 14).rotateX(Math.PI / 2).translate(x, 0.13 + i * 0.26, front + 0.6), '#1b1b1b']);
        SOLIDS.add(x + RO[0], front + 0.6 + RO[1], 0.5);
      }
    }
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

/** the UPSA junction: the UGBS Graduate Building and its grounds, IPS Road, GOIL and the roadside */
export const upsaSite = createSite('upsa-junction', [grad, grounds, goil, roadside]);
