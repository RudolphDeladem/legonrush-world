// Shared pieces for the owner's Legon Fire Station, Child Lab and E.A. Boateng Road brief (firestation.ts, boateng.ts):
// a low gabled hall in a model frame (walls, base band, gable ends, a ribbed sheet or tiled roof on two slopes, fascia and
// barge boards), painted lettering and printed panels as textured planes, louvred openings, irregular flagstones.
import * as THREE from 'three';
import type { Kit } from './blocks';
import { canvas, type Part } from './modelkit';
import { Bag, hash } from './enkit';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type R4 = [number, number, number, number];

/** roof sheets: corrugated ribs running down the slope (sheet) or rows of clay tiles (tile), tinted by the colour */
const roofMats = new Map<string, THREE.MeshStandardMaterial>();
export function roofMat(col: string, kind: 'sheet' | 'tile' = 'sheet') {
  const key = col + kind;
  let m = roofMats.get(key);
  if (!m) {
    const map = canvas(128, 128, (g) => {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128);
      if (kind === 'sheet') {
        // ribs every 16 px (0.25 m at 4 m to the texture), a darker valley either side, rust streaks
        for (let x = 0; x < 128; x += 16) { g.fillStyle = '#d9d9d9'; g.fillRect(x, 0, 3, 128); g.fillStyle = '#bdbdbd'; g.fillRect(x + 3, 0, 2, 128); g.fillStyle = '#f4f4f4'; g.fillRect(x + 8, 0, 4, 128); }
        for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(110,70,40,${0.08 + hash(i, 3) * 0.12})`; g.fillRect(hash(i, 1) * 128, hash(2, i) * 64, 2 + hash(i, 4) * 5, 30 + hash(i, 5) * 60); }
      } else {
        for (let y = 0; y < 128; y += 16) { g.fillStyle = '#cfcfcf'; g.fillRect(0, y + 12, 128, 4); for (let x = (y / 16) % 2 ? 8 : 0; x < 128; x += 16) { g.fillStyle = '#e0e0e0'; g.fillRect(x, y, 2, 12); } }
        for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(60,40,30,${0.06 + hash(i, 7) * 0.1})`; g.fillRect(hash(i, 8) * 128, hash(9, i) * 128, 10, 8); }
      }
    });
    map.repeat.set(1 / 4, 1 / 4);
    m = new THREE.MeshStandardMaterial({ color: col, map, roughness: kind === 'sheet' ? 0.55 : 0.85, metalness: kind === 'sheet' ? 0.25 : 0, side: THREE.DoubleSide });
    roofMats.set(key, m);
  }
  return m;
}

/** a quad (a, b, c, d counter-clockwise seen from the front) with uvs in metres */
function quad(a: number[], b: number[], c: number[], d: number[], ua: number[], ub: number[], uc: number[], ud: number[]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([...ua, ...ub, ...uc, ...ua, ...uc, ...ud], 2));
  g.computeVertexNormals();
  return g;
}

export interface HallOpts {
  /** eave height above y, roof pitch (rise per run), overhang */
  eave: number; pitch: number; over?: number;
  /** wall colour; the lower band (height, colour) if any */
  wall: string; base?: [number, string];
  /** roof colour and kind; fascia and barge colour */
  roof: string; kind?: 'sheet' | 'tile'; fascia?: string;
  /** gable (true) or hip (false) at the low and the high end of the ridge */
  gables?: [boolean, boolean];
  /** the ridge's direction in the model frame */
  along: 'x' | 'z';
  y?: number;
  /** no walls (a roof on posts or piers) */
  open?: boolean;
}
/** a low hall on a rectangle of the model frame: its walls (parts), the gable triangles, the roof's two slopes (or hips) as
 *  textured sheets (roofs), fascia and barge boards; returns the ridge height */
export function hall(c: Part[], roofs: Map<string, THREE.BufferGeometry[]>, r: R4, o: HallOpts) {
  const [x0, x1, z0, z1] = r, y = o.y ?? 0, e = y + o.eave, over = o.over ?? 0.6, fas = o.fascia ?? '#2f2a26';
  const gables = o.gables ?? [true, true];
  if (!o.open) c.push([new THREE.BoxGeometry(x1 - x0, e - y + 0.3, z1 - z0).translate((x0 + x1) / 2, (y - 0.3 + e) / 2, (z0 + z1) / 2), o.wall]);
  if (o.base && !o.open) c.push([new THREE.BoxGeometry(x1 - x0 + 0.06, o.base[0] + 0.3, z1 - z0 + 0.06).translate((x0 + x1) / 2, y - 0.3 + (o.base[0] + 0.3) / 2, (z0 + z1) / 2), o.base[1]]);
  // canonical frame: a along the ridge, b across it
  const AX = o.along === 'x';
  const [A0, A1, B0, B1] = AX ? [x0, x1, z0, z1] : [z0, z1, x0, x1];
  const P = (a: number, yy: number, b: number) => (AX ? [a, yy, b] : [b, yy, a]);
  const half = (B1 - B0) / 2, bm = (B0 + B1) / 2, top = e + half * o.pitch, ee = e - over * o.pitch;
  const a0 = A0 - (gables[0] ? over : 0), a1 = A1 + (gables[1] ? over : 0);
  // hips pull the ridge in by the half width at a hipped end
  const r0 = gables[0] ? a0 : A0 + half, r1 = gables[1] ? a1 : A1 - half;
  const list = roofs.get(o.roof + (o.kind ?? 'sheet')) ?? (roofs.set(o.roof + (o.kind ?? 'sheet'), []).get(o.roof + (o.kind ?? 'sheet'))!);
  const slope = Math.hypot(half + over, (half + over) * o.pitch);
  for (const s of [-1, 1]) {
    const be = bm + s * (half + over);
    const ea0 = gables[0] ? a0 : A0 - over, ea1 = gables[1] ? a1 : A1 + over;
    let A = P(ea0, ee, be), B = P(ea1, ee, be), C = P(r1, top, bm), D = P(r0, top, bm);
    // keep the outward winding: flip for one slope (and for the swapped frame)
    if ((s > 0) === AX) [A, B, C, D] = [B, A, D, C];
    list.push(quad(A, B, C, D, [ea0, 0], [ea1, 0], [r1, slope], [r0, slope]));
    // the fascia along the eave
    const fa = P((ea0 + ea1) / 2, ee - 0.08, be);
    c.push([AX ? new THREE.BoxGeometry(ea1 - ea0, 0.22, 0.06).translate(fa[0], fa[1], fa[2]) : new THREE.BoxGeometry(0.06, 0.22, ea1 - ea0).translate(fa[0], fa[1], fa[2]), fas]);
  }
  for (const [i, g] of gables.entries()) {
    const at = i ? A1 : A0, out = i ? 1 : -1;
    if (g) {
      // the gable wall up to the ridge, the barge boards along the roof's edge
      const sh = new THREE.Shape([new THREE.Vector2(B0, e), new THREE.Vector2(B1, e), new THREE.Vector2(bm, top)]);
      const tri = new THREE.ShapeGeometry(sh);
      const pos = tri.attributes.position as THREE.BufferAttribute;
      for (let k = 0; k < pos.count; k++) { const bb = pos.getX(k), yy = pos.getY(k), p = P(at + out * 0.001, yy, bb); pos.setXYZ(k, p[0], p[1], p[2]); }
      tri.computeVertexNormals();
      c.push([tri, o.wall]);
      // and its back face, wound the other way
      const tri2 = tri.clone(), ix = tri2.index!;
      for (let k = 0; k < ix.count; k += 3) { const t = ix.getX(k + 1); ix.setX(k + 1, ix.getX(k + 2)); ix.setX(k + 2, t); }
      tri2.computeVertexNormals();
      c.push([tri2, o.wall]);
      for (const s of [-1, 1]) {
        const p0 = P(at + out * (over + 0.03), ee - 0.05, bm + s * (half + over)), p1 = P(at + out * (over + 0.03), top + 0.02, bm);
        const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
        const bar = new THREE.BoxGeometry(0.06, 0.24, L);
        bar.lookAt(new THREE.Vector3(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]));
        bar.translate((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2);
        c.push([bar, fas]);
      }
    } else {
      // a hip: one triangle slope at the end
      const E = AX ? (i ? A1 + over : A0 - over) : (i ? A1 + over : A0 - over), R = i ? r1 : r0;
      let A = P(E, ee, bm - (half + over)), B = P(E, ee, bm + (half + over)), C = P(R, top, bm);
      if ((i === 1) !== AX) [A, B] = [B, A];
      const g2 = new THREE.BufferGeometry();
      g2.setAttribute('position', new THREE.Float32BufferAttribute([...A, ...B, ...C], 3));
      g2.setAttribute('uv', new THREE.Float32BufferAttribute([bm - half - over, 0, bm + half + over, 0, bm, slope], 2));
      g2.computeVertexNormals();
      list.push(g2);
    }
  }
  // the soffit under the overhang
  c.push([new THREE.BoxGeometry(x1 - x0 + 2 * over, 0.04, z1 - z0 + 2 * over).translate((x0 + x1) / 2, ee - 0.02, (z0 + z1) / 2), '#ddd8cc']);
  return top;
}
/** every roof sheet gathered by colour, as meshes */
export function roofMeshes(k: Kit, roofs: Map<string, THREE.BufferGeometry[]>) {
  for (const [key, gs] of roofs) {
    if (!gs.length) continue;
    const kind = key.endsWith('tile') ? 'tile' : 'sheet', col = key.slice(0, key.length - kind.length);
    const me = new THREE.Mesh(mergeGeometries(gs), roofMat(col, kind)); me.castShadow = true; me.receiveShadow = true;
    k.meshes.push(me);
  }
}

/** lettering or a printed panel on a plane: lines of text (size as a fraction of the panel's height), on a background
 *  colour or on nothing (painted straight on the wall); the plane faces +z before it is turned */
export function textPanel(w: number, h: number, lines: { t: string; s: number; c: string; b?: boolean; f?: string }[], bg: string | null, draw?: (g: CanvasRenderingContext2D, W: number, H: number) => void) {
  const W = 1024, H = Math.max(64, Math.round((1024 * h) / w));
  const t = canvas(W, H, (g) => {
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, W, H); }
    draw?.(g, W, H);
    let y = 0;
    const total = lines.reduce((a, l) => a + l.s * 1.18, 0);
    y = (H - total * H) / 2;
    for (const l of lines) {
      const px = l.s * H;
      g.font = `${l.b ? 'bold ' : ''}${Math.round(px)}px ${l.f ?? 'Arial, Helvetica, sans-serif'}`;
      g.fillStyle = l.c; g.textAlign = 'center'; g.textBaseline = 'top';
      const m = g.measureText(l.t), sx = Math.min(1, (W * 0.94) / m.width);
      g.save(); g.translate(W / 2, y); g.scale(sx, 1); g.fillText(l.t, 0, 0); g.restore();
      y += px * 1.18;
    }
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: !bg, alphaTest: bg ? 0 : 0.3, roughness: 0.8, side: THREE.DoubleSide }));
  return m;
}
/** a plane facing out of a wall: at (x, y, z), turned to face the direction ry (0: +z) */
export function place(m: THREE.Mesh, x: number, y: number, z: number, ry: number) {
  m.position.set(x, y, z); m.rotation.y = ry; m.updateMatrix();
  return m;
}

let LOUVRE: THREE.MeshStandardMaterial | null = null;
/** a tall dark louvred shutter (the CEGENSA gable, the low wings: Pairs 9, 13) */
export const louvreMat = () => (LOUVRE ??= new THREE.MeshStandardMaterial({ roughness: 0.75, side: THREE.DoubleSide, map: canvas(64, 128, (g) => {
  g.fillStyle = '#e6e2d8'; g.fillRect(0, 0, 64, 128);
  g.fillStyle = '#1b1a19'; g.fillRect(4, 4, 56, 120);
  for (let y = 8; y < 122; y += 7) { g.fillStyle = '#3a3532'; g.fillRect(6, y, 52, 3); }
  g.fillStyle = '#0e0e0e'; g.fillRect(31, 4, 2, 120);
}) }));

let FLAG: THREE.MeshStandardMaterial | null = null;
/** irregular tan flagstones in mortar joints (the R2 court and path: Pairs 9-11, 13), world uvs at 4 m to the texture */
export const flagMat = () => (FLAG ??= (() => {
  const map = canvas(512, 512, (g) => {
    g.fillStyle = '#8f7a63'; g.fillRect(0, 0, 512, 512);
    // stones: a jittered grid of seeds, each pixel to its nearest seed (wrapping), shrunk from the joints
    const N = 11, seeds: [number, number, string][] = [];
    const tones = ['#c9a283', '#b9967a', '#d0ae90', '#a98a70', '#c6a688', '#b3a08c', '#a9927c', '#cdb59a', '#9f8b78', '#bf9d7e'];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) seeds.push([(i + 0.15 + hash(i, j) * 0.7) * (512 / N), (j + 0.15 + hash(j + 9, i) * 0.7) * (512 / N), tones[(i * 7 + j * 3) % tones.length]]);
    const img = g.getImageData(0, 0, 512, 512), d = img.data;
    const rgb = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const cols = seeds.map((s) => rgb(s[2]));
    for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
      let b1 = 1e9, b2 = 1e9, k1 = 0;
      for (let k = 0; k < seeds.length; k++) {
        let dx = Math.abs(x - seeds[k][0]), dy = Math.abs(y - seeds[k][1]);
        if (dx > 256) dx = 512 - dx; if (dy > 256) dy = 512 - dy;
        const dd = dx * dx + dy * dy;
        if (dd < b1) { b2 = b1; b1 = dd; k1 = k; } else if (dd < b2) b2 = dd;
      }
      const o = (y * 512 + x) * 4, edge = Math.sqrt(b2) - Math.sqrt(b1);
      if (edge < 3) { d[o] = 118; d[o + 1] = 104; d[o + 2] = 88; continue; }
      const n = (hash(x >> 2, y >> 2) - 0.5) * 18;
      d[o] = cols[k1][0] + n; d[o + 1] = cols[k1][1] + n; d[o + 2] = cols[k1][2] + n;
    }
    g.putImageData(img, 0, 0);
  });
  map.repeat.set(1 / 4, 1 / 4);
  return new THREE.MeshStandardMaterial({ map, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
})());

/** a flat patch of a surface over the ground: rectangles and polygons (world, flat ground) with world uvs */
export function patch(O: [number, number], polys: [number, number][][], y: number) {
  const gs: THREE.BufferGeometry[] = [];
  for (const p of polys) {
    const sh = new THREE.Shape(p.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ShapeGeometry(sh).rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); uv.setXY(i, x, -z); pos.setXYZ(i, x - O[0], y, z - O[1]); }
    gs.push(g);
  }
  return mergeGeometries(gs);
}
export const rect = ([x0, x1, z0, z1]: R4): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
/** a strip along a polyline, w wide (world), as a polygon */
export function stripPoly(pts: [number, number][], w: number): [number, number][] {
  const L: [number, number][] = [], R: [number, number][] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1;
    L.push([pts[i][0] - (dz / l) * w / 2, pts[i][1] + (dx / l) * w / 2]); R.push([pts[i][0] + (dz / l) * w / 2, pts[i][1] - (dx / l) * w / 2]);
  }
  return [...L, ...R.reverse()];
}
/** a short air-conditioning unit on a wall: the box and its dark grille (b's frame, the face's outward direction) */
export function acUnit(b: Bag, x: number, y: number, z: number, nx: number, nz: number) {
  const w = 0.8, h = 0.55, d = 0.3;
  const g = new THREE.BoxGeometry(nx ? d : w, h, nx ? w : d).translate(x - b.O[0] + nx * d / 2, y, z - b.O[1] + nz * d / 2);
  b.c.push([g, '#dcdcd6']);
  b.c.push([new THREE.BoxGeometry(nx ? 0.02 : w * 0.7, h * 0.7, nx ? w * 0.7 : 0.02).translate(x - b.O[0] + nx * (d + 0.01), y, z - b.O[1] + nz * (d + 0.01)), '#4a4d50']);
}
