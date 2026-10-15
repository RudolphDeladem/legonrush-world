// Shared pieces for the medical precinct models (ugmc.ts, nog.ts): curtain walls, extrusions over site-frame polygons,
// planes with their own materials, parapets and roof plant, and the materials the photographs ask for (reflective
// gridded curtain glass, dark gridded roof panels, dark asphalt, manicured lawn).
import * as THREE from 'three';
import { type Kit } from './blocks';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { box, canvas, speckle } from './modelkit';

export type P2 = [number, number];
export type R4 = [number, number, number, number];
export const SILVER = '#b8bec4';

let CURTAIN: THREE.MeshStandardMaterial | null = null;
/** blue-grey reflective curtain wall: a regular dark mullion grid, sky and trees faintly in the panes (1 tile = 6 x 6 m) */
export const curtainMat = () => (CURTAIN ??= new THREE.MeshStandardMaterial({ roughness: 0.18, metalness: 0.35, side: THREE.DoubleSide, map: canvas(256, 256, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#6f8798'); gr.addColorStop(0.55, '#3d5160'); gr.addColorStop(1, '#2a3a46');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${150 + (i % 5) * 10},${175 + (i % 3) * 8},195,0.08)`; g.fillRect((i * 53) % 256, (i * 31) % 256, 40, 18); }
  g.fillStyle = '#1d252c'; for (let x = 0; x < 256; x += 64) g.fillRect(x, 0, 4, 256); for (let y = 0; y < 256; y += 60) g.fillRect(0, y, 256, 4);
  g.fillStyle = 'rgba(210,220,228,0.5)'; for (let x = 0; x < 256; x += 64) g.fillRect(x + 4, 0, 1, 256);
}) }));
let GRIDROOF: THREE.MeshStandardMaterial | null = null;
/** the dark gridded sloped roof features (02, 04): dark panels in a pale grid (their make is not established) */
export const gridRoofMat = () => (GRIDROOF ??= new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.25, side: THREE.DoubleSide, map: canvas(128, 128, (g) => {
  g.fillStyle = '#9aa3aa'; g.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 32) for (let x = 0; x < 128; x += 16) { g.fillStyle = (x + y) % 48 ? '#2b3a4a' : '#304255'; g.fillRect(x + 1, y + 1, 14, 30); }
}) }));
let ASPH: THREE.MeshStandardMaterial | null = null;
/** dark charcoal fine-textured asphalt for the lots */
export const asphaltMat = () => (ASPH ??= new THREE.MeshStandardMaterial({ roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, map: canvas(128, 128, (g) => {
  g.fillStyle = '#4a4d51'; g.fillRect(0, 0, 128, 128); speckle(g, 0, 0, 128, 128, 1800, ['#43464a', '#55585c', '#3d4044', '#5c5f63']);
}) }));
export const flatMat = (color: string, layer = 3) => new THREE.MeshStandardMaterial({ color, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -layer, polygonOffsetUnits: -layer });
let LAWN: THREE.MeshStandardMaterial | null = null;
/** manicured lawn: mown grain, a little tonal variation (laid in world metres, 4 m a tile) */
export const lawnMat = () => (LAWN ??= new THREE.MeshStandardMaterial({ roughness: 1, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, map: canvas(128, 128, (g) => {
  g.fillStyle = '#4f7a31'; g.fillRect(0, 0, 128, 128); speckle(g, 0, 0, 128, 128, 2600, ['#4a7330', '#56823a', '#46702c', '#5b8740', '#4d7834']);
  g.fillStyle = 'rgba(255,255,255,0.03)'; for (let x = 0; x < 128; x += 32) g.fillRect(x, 0, 16, 128);
}) }));

/** specks over a 256 px tile from a fixed hash (not the shared random sequence the campus is placed by) */
const grit = (g: CanvasRenderingContext2D, n: number, cols: string[]) => {
  for (let i = 0; i < n; i++) { const h = (a: number) => { const v = Math.sin(i * 12.9898 + a * 78.233) * 43758.5453; return v - Math.floor(v); }; g.fillStyle = cols[i % cols.length]; g.fillRect(h(1) * 256, h(2) * 256, 1 + h(3), 1 + h(4)); }
};
let HERRING: THREE.MeshStandardMaterial | null = null;
/** grey interlocking paver blocks laid in herringbone (0.2 x 0.1 m blocks; the owner's pictures of the Okponglo
 *  footways): lay it with herringboneUV so the courses run at 45 degrees to the street, 1.6 m a tile */
export const herringboneMat = () => (HERRING ??= new THREE.MeshStandardMaterial({ roughness: 0.93, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, map: canvas(256, 256, (g) => {
  g.fillStyle = '#a49d93'; g.fillRect(0, 0, 256, 256);
  const cols = ['#7f7a74', '#8a847d', '#76716b', '#8f877e', '#837c73', '#7a736b'], U = 16;
  const brick = (x: number, y: number, w: number, h: number, c: string) => {
    for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) { g.fillStyle = c; g.fillRect(x * U + ox + 1, y * U + oy + 1, w * U - 2, h * U - 2); }
  };
  // one band: a horizontal 2 x 1 block at (k, k) and a vertical 1 x 2 block at (k + 2, k - 1); the bands repeat every
  // 4 units across (the pattern's lattice (1, 1), (4, 0): 16 units, the canvas, is a whole period)
  for (let n = -4; n < 8; n++) for (let k = -4; k < 20; k++) {
    const x = k + 4 * n, y = k;
    brick(((x % 16) + 16) % 16, ((y % 16) + 16) % 16, 2, 1, cols[(k * 7 + n * 3 + 16) % cols.length]);
    brick((((x + 2) % 16) + 16) % 16, (((y - 1) % 16) + 16) % 16, 1, 2, cols[(k * 5 + n * 11 + 32) % cols.length]);
  }
  grit(g, 700, ['#6e6963', '#9a948b', '#85807a']);
}) }));
/** the world-space UV for herringboneMat: 1.6 m a tile, the courses at 45 degrees */
export const herringboneUV = (x: number, z: number): P2 => [(x + z) * 0.7071, (z - x) * 0.7071];
let COBBLE: THREE.MeshStandardMaterial | null = null;
/** pitched stone: irregular grey-brown stones set in dark mortar (the owner's picture 4, the junction corner), 2 m a tile */
export const cobbleMat = () => (COBBLE ??= new THREE.MeshStandardMaterial({ roughness: 0.95, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, map: canvas(256, 256, (g) => {
  g.fillStyle = '#5b544c'; g.fillRect(0, 0, 256, 256);
  const cols = ['#a39a8e', '#968c80', '#ada496', '#8d8377', '#b3a999', '#9c9284'];
  let i = 0;
  for (let y = 0; y < 256; y += 21) for (let x = (y / 21) % 2 ? -12 : 0; x < 256; x += 25) {
    const w = 18 + ((i * 37) % 7), h = 14 + ((i * 53) % 6), cx = x + ((i * 13) % 5), cy = y + ((i * 29) % 4);
    for (const ox of [-256, 0, 256]) {
      g.fillStyle = cols[i % cols.length];
      g.beginPath();
      g.moveTo(cx + ox + 2, cy); g.lineTo(cx + ox + w - 1, cy + 2); g.lineTo(cx + ox + w, cy + h - 2); g.lineTo(cx + ox + w / 2, cy + h); g.lineTo(cx + ox, cy + h - 3);
      g.closePath(); g.fill();
    }
    i++;
  }
  grit(g, 1200, ['#6d655b', '#b9b0a2', '#80786d']);
}) }));

/** a vertical curtain-wall strip along a polyline (model frame), y0..y1, its texture in metres */
export function curtain(k: Kit, pts: P2[], y0: number, y1: number) {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  let u = 0;
  for (let i = 0; i < pts.length; i++) {
    if (i) u += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    pos.push(pts[i][0], y0, pts[i][1], pts[i][0], y1, pts[i][1]);
    uv.push(u / 6, y0 / 6, u / 6, y1 / 6);
    if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, curtainMat()); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  // light curved edge frames following the glass
  for (const p of [pts[0], pts[pts.length - 1]]) k.plain.push([box(p[0] - 0.25, p[0] + 0.25, 0, y1 + 0.3, p[1] - 0.25, p[1] + 0.25), '#e9ebec']);
  k.plain.push([strip(pts, y1, y1 + 0.35, 0.3), '#e9ebec']);
}
/** a polyline moved d metres sideways (to the right of its direction of travel in the model frame: +x when going +z) */
export const offset = (pts: P2[], d: number): P2[] => pts.map((p, i) => {
  const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1;
  return [p[0] - (dz / l) * d, p[1] + (dx / l) * d] as P2;
});
/** a thin band along a polyline (model frame), y0..y1, half-thickness t */
export function strip(pts: P2[], y0: number, y1: number, t: number) {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i], l = Math.hypot(bx - ax, bz - az);
    parts.push(new THREE.BoxGeometry(l + 0.05, y1 - y0, 2 * t).rotateY(-Math.atan2(bz - az, bx - ax)).translate((ax + bx) / 2, (y0 + y1) / 2, (az + bz) / 2));
  }
  return mergeParts(parts);
}
export const mergeParts = (parts: THREE.BufferGeometry[]) => {
  const pos: number[] = [], nrm: number[] = [];
  for (const p of parts) { const n = p.index ? p.toNonIndexed() : p; pos.push(...(n.attributes.position.array as Float32Array)); nrm.push(...(n.attributes.normal.array as Float32Array)); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  return g;
};
/** an extruded prism over a polygon (model frame), y0..y1 */
export function prism(pts: P2[], y0: number, y1: number) {
  // (consecutive repeated points make the extrusion's edge vectors NaN, and one NaN hides every part merged with it)
  const clean = pts.filter((p, i) => { const q = pts[(i + pts.length - 1) % pts.length]; return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-3; });
  const shape = new THREE.Shape(clean.map(([x, z]) => new THREE.Vector2(x, -z)));
  return new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, y0, 0);
}
/** a flat plane over a polygon (model frame) at y, its own material */
export function plane(k: Kit, pts: P2[], y: number, mat: THREE.Material, tile = 0, world: (u: number, v: number) => P2 = (u, v) => [u, v]) {
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)))).rotateX(-Math.PI / 2).translate(0, y, 0);
  if (tile) { const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) { const [wx, wz] = world(p.getX(i), p.getZ(i)); uv.setXY(i, wx / tile, wz / tile); } }
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.userData.noCollide = true; k.meshes.push(m);
  return m;
}
export const rect = ([x0, x1, z0, z1]: R4): P2[] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
/** a sign facing direction (dx, dz) of the model frame */
export const facing = (dx: number, dz: number) => Math.atan2(dx, dz);

/** a flat roof's parapet round a rectangle */
export function parapet(k: Kit, [x0, x1, z0, z1]: R4, top: number, col = '#e7e8e6', h = 0.9) {
  for (const r of [[x0, x1, z0, z0 + 0.3], [x0, x1, z1 - 0.3, z1], [x0, x0 + 0.3, z0, z1], [x1 - 0.3, x1, z0, z1]] as R4[]) k.plain.push([box(r[0], r[1], top, top + h, r[2], r[3]), col]);
}
/** a chiller: a grey box with two dark fans on top */
export function chiller(k: Kit, x: number, z: number, y: number, along: boolean) {
  const [w, d] = along ? [2.4, 1.2] : [1.2, 2.4];
  k.plain.push([box(x - w / 2, x + w / 2, y, y + 1.5, z - d / 2, z + d / 2), '#cfd2d4']);
  for (const s of [-0.5, 0.5]) k.plain.push([new THREE.CylinderGeometry(0.45, 0.45, 0.06, 12).translate(x + (along ? s * 1.1 : 0), y + 1.53, z + (along ? 0 : s * 1.1)), '#3b3f43']);
}
/** a duct run between points at height y */
export const duct = (k: Kit, pts: P2[], y: number, col = '#c8b38a') => k.plain.push([strip(pts, y, y + 0.8, 0.4), col]);
/** a sign with a coloured badge (the hospital's numbered blocks) */
export function badgeSign(k: Kit, text: string, badge: string, badgeCol: string, x: number, y: number, z: number, ry: number, w: number, bg = '#1e2933', fg = '#ffffff') {
  const dx = Math.cos(ry), dz = -Math.sin(ry);
  k.signs.push({ text: badge, x: x - dx * (w / 2 + 0.5), y, z: z - dz * (w / 2 + 0.5), ry, w: 0.9, colors: [badgeCol, '#ffffff'] });
  k.signs.push({ text, x, y, z, ry, w, colors: [bg, fg] });
}


/** the model's own meshes merged into one per material (curtain strips, lawns, lots, panel rows: each a draw call
 *  otherwise); call at the end of a spec's extras */
export function mergeMeshes(k: Kit) {
  const groups = new Map<THREE.Material, THREE.Mesh[]>();
  for (const m of k.meshes) {
    const mat = m.material as THREE.Material;
    if (Array.isArray(m.material) || !m.matrix.equals(new THREE.Matrix4())) continue;
    (groups.get(mat) ?? groups.set(mat, []).get(mat)!).push(m);
  }
  for (const [mat, list] of groups) {
    if (list.length < 2) continue;
    const geos = list.map((m) => { const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone(); for (const a of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(a)) g.deleteAttribute(a); if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2)); return g; });
    const merged = mergeGeometries(geos);
    if (!merged) continue;
    const mesh = new THREE.Mesh(merged, mat);
    mesh.castShadow = list.some((m) => m.castShadow); mesh.receiveShadow = true; mesh.userData.noCollide = list.every((m) => m.userData.noCollide);
    k.meshes = k.meshes.filter((m) => !list.includes(m));
    k.meshes.push(mesh);
  }
}

/** a site whose separately framed models (Evandy's wings, each on its own axis) are merged after building: every mesh
 *  that shares a material (and its shadow and collision flags) across the models becomes one mesh in world space, so
 *  that ten wings draw like one model */
export function mergedSite<T extends { buildSteps: () => Generator<string | void, THREE.Group> }>(site: T): T {
  return {
    ...site,
    build() { const it = this.buildSteps(); let r = it.next(); while (!r.done) r = it.next(); return r.value; },
    *buildSteps() {
      const group: THREE.Group = yield* site.buildSteps();
      group.updateMatrixWorld(true);
      const buckets = new Map<string, { mat: THREE.Material; cast: boolean; noCollide: boolean; geos: THREE.BufferGeometry[]; meshes: THREE.Mesh[] }>();
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh || (m as unknown as THREE.InstancedMesh).isInstancedMesh || Array.isArray(m.material) || (m.material as THREE.Material).type === 'MeshBasicMaterial') return;
        const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
        g.applyMatrix4(m.matrixWorld);
        const attrs = Object.keys(g.attributes).sort().join(',');
        const key = `${(m.material as THREE.Material).uuid}|${m.castShadow}|${!!m.userData.noCollide}|${attrs}`;
        const b = buckets.get(key) ?? buckets.set(key, { mat: m.material as THREE.Material, cast: m.castShadow, noCollide: !!m.userData.noCollide, geos: [], meshes: [] }).get(key)!;
        b.geos.push(g); b.meshes.push(m);
      });
      const cull: THREE.Mesh[] = [];
      for (const b of buckets.values()) {
        if (b.meshes.length < 2) { cull.push(...b.meshes); continue; }
        const merged = mergeGeometries(b.geos);
        if (!merged) { cull.push(...b.meshes); continue; }
        for (const m of b.meshes) m.removeFromParent();
        const mesh = new THREE.Mesh(merged, b.mat);
        mesh.castShadow = b.cast; mesh.receiveShadow = true; mesh.userData.noCollide = b.noCollide;
        group.add(mesh); cull.push(mesh);
      }
      group.traverse((o) => { if ((o as THREE.Mesh).isMesh && !cull.includes(o as THREE.Mesh)) cull.push(o as THREE.Mesh); });
      group.userData.cullMeshes = cull;
      return group;
    },
  };
}
