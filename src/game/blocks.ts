// Buildings modelled from reference photos as sets of rectangular blocks (hostels.ts: Jubilee
// Hall and the International Students Hostels; banking.ts: the banking square).
//
// A site is a list of specs. Each spec stands on a mapped footprint (by name) or at a measured
// point, in its own frame (x along an axis, z across it); its blocks carry storeys, a roof and a
// facade style per face, and its extras add entrances and the details the photos show. The
// generic footprint builder skips the footprints a site replaces, and generated props keep out of
// the porches and annexes the models add.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BUILDINGS, type Building } from './campusmap';
import { buildingMaterials } from './facades';
import { groundShade, weathering } from './shading';
import { Facade, PLINTH, Roof, TANK, TRIM, WHITE, box, canvas, flat, flipWinding, merge, rnd, signTexture, speckle, type Part } from './modelkit';

// ---------- facade styles: one window bay, upper storey on top, ground storey below ----------
// (the canvas is 256 x 512: the top half is an upper storey, the bottom half the ground storey)
export type Rect = readonly [number, number, number, number];
export interface Style { bay: number; draw: (g: CanvasRenderingContext2D) => void; up: Rect[]; ground: Rect[] }

export const render = (g: CanvasRenderingContext2D, base = '#f7f5f0') => {
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 512);
  speckle(g, 0, 0, 256, 512, 3000, ['#eeebe3', '#ffffff', '#e8e4da']);
};
export const slab = (g: CanvasRenderingContext2D, y: number, h: number) => {
  g.fillStyle = '#f2efe8'; g.fillRect(0, y, 256, h);
  g.fillStyle = '#d3ccbf'; g.fillRect(0, y, 256, 2);
};
/** a dark glazed window with frame, mullions and a sill */
export const window_ = (g: CanvasRenderingContext2D, [x, y, w, h]: Rect, frame: string, cols: number, transom = 0.35) => {
  g.fillStyle = 'rgba(90,80,68,0.45)'; g.fillRect(x - 6, y - 6, w + 12, h + 12);
  g.fillStyle = frame; g.fillRect(x - 3, y - 3, w + 6, h + 6);
  const gl = g.createLinearGradient(0, y, 0, y + h);
  gl.addColorStop(0, '#53687c'); gl.addColorStop(0.5, '#27333f'); gl.addColorStop(1, '#161d25');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(255,255,255,0.08)';
  g.beginPath(); g.moveTo(x + w * 0.15, y); g.lineTo(x + w * 0.35, y); g.lineTo(x + w * 0.1, y + h); g.lineTo(x, y + h); g.fill();
  g.fillStyle = frame;
  for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - 2, y, 4, h);
  if (transom) g.fillRect(x, y + h * transom, w, 4);
  g.fillStyle = '#ffffff'; g.fillRect(x - 8, y + h + 3, w + 16, 7);
};

const LIT_BAYS = 8, LIT_FLOORS = 4;
function lightsFor(st: Style) {
  return canvas(LIT_BAYS * 32, LIT_FLOORS * 32, (g) => {
    g.fillStyle = '#000';
    g.fillRect(0, 0, LIT_BAYS * 32, LIT_FLOORS * 32);
    const k = 32 / 256;
    for (let i = 0; i < LIT_BAYS; i++) for (let r = 0; r < LIT_FLOORS; r++) {
      if (rnd() < 0.4) continue;
      g.globalAlpha = 0.6 + rnd() * 0.4;
      g.fillStyle = ['#ffcf7d', '#ffd99a', '#ffc46a', '#ffe7b8', '#cfe4ff'][(rnd() * 5) | 0];
      for (const [x, y, w, h] of r === LIT_FLOORS - 1 ? st.ground : st.up) g.fillRect(i * 32 + x * k, r * 32 + y * k, w * k, h * k);
      g.globalAlpha = 1;
    }
  });
}

/** one wall material per facade style, made on first use */
const wallMats = new Map<Style, THREE.MeshStandardMaterial>();
function wallMaterial(st: Style) {
  let m = wallMats.get(st);
  if (!m) {
    const lights = lightsFor(st);
    lights.channel = 1;
    lights.repeat.set(1 / LIT_BAYS, 1 / LIT_FLOORS);
    const map = canvas(256, 512, st.draw);
    m = weathering(groundShade(new THREE.MeshStandardMaterial({ map, roughness: 0.88, side: THREE.DoubleSide, emissive: '#ffffff', emissiveMap: lights, emissiveIntensity: 0 }), 2.2, 0.3, 'wall'), 'wall', 16, 0.3);
    m.emissiveIntensity = lightsOn ? 1.1 : 0;
    wallMats.set(st, m);
  }
  return m;
}
let lightsOn = false;
let mats: { plain: THREE.MeshStandardMaterial; glass: THREE.MeshStandardMaterial } | null = null;
function materials() {
  if (mats) return mats;
  mats = {
    plain: weathering(groundShade(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }), 2.2, 0.3, 'wall'), 'wall', 16, 0.3),
    glass: new THREE.MeshStandardMaterial({ color: '#28323d', roughness: 0.25, metalness: 0.3, emissive: '#ffd08a', emissiveIntensity: 0, side: THREE.DoubleSide }),
  };
  return mats;
}
/** Lit windows and lobbies of every block-modelled building after dark (called with the other night lights). */
export function setBlockLights(on: boolean) {
  lightsOn = on;
  for (const m of wallMats.values()) m.emissiveIntensity = on ? 1.1 : 0;
  if (mats) mats.glass.emissiveIntensity = on ? 0.9 : 0;
}

// ---------- building specs ----------
export type Face = 'x0' | 'x1' | 'z0' | 'z1';
export interface Block {
  x0: number; x1: number; z0: number; z1: number;
  floors: number;
  /** hip (default), flat, a gable roof whose ridge runs along z and ends inside a neighbour's roof, or none (a site-wide roof covers it) */
  roof?: 'hip' | 'flat' | 'crossZ' | 'none';
  /** roof colour of this block (default: the building's) */
  roofColor?: string;
  /** roof pitch of this block (default: the building's) */
  pitch?: number;
  /** facade style of a whole storey on every face (0 = ground), overriding the face styles */
  floorStyle?: Record<number, Style>;
  /** facade style per face (default: the building's) */
  faces?: Partial<Record<Face, Style>>;
}
export interface Spec {
  name: string;
  /** the model's x axis (along the footprint's long side) */
  axis: [number, number];
  /** model origin: a measured point, else the vertex mean of the footprint named \`footprint\` (default: name) */
  origin?: [number, number];
  footprint?: string;
  /** points inside other footprints this model replaces (unnamed or satellite-detected outlines) */
  replaces?: [number, number][];
  storey: number;
  style: Style;
  roofColor: string;
  fascia: string;
  pitch: number;
  blocks: Block[];
  /** entrances and the details the photos show, in the model frame */
  extras: (k: Kit) => void;
  /** areas kept clear of generated props (porches, annexes outside the footprint), model frame [x0, x1, z0, z1] */
  keep: [number, number, number, number][];
}
export interface Kit { plain: Part[]; glass: THREE.BufferGeometry[]; roof: Roof; signs: { text: string; x: number; y: number; z: number; ry: number; w: number; colors?: [string, string] }[]; meshes: THREE.Mesh[]; wallTop: (floors: number) => number; storey: number }

export const PL = 0.4, BAND = 0.4, OV = 0.8;
const MIRROR_Z = new THREE.Matrix4().makeScale(1, 1, -1);

/** a white flat-roofed block with a parapet (annexes, entrance blocks) */
export function flatBlock(k: Kit, x0: number, x1: number, z0: number, z1: number, h: number, roofCol = '#c9c4ba') {
  k.plain.push([box(x0, x1, 0, h, z0, z1), WHITE]);
  k.plain.push([box(x0, x1, 0, PL, z0 - 0.05, z1 + 0.05), PLINTH]);
  k.plain.push([box(x0 + 0.2, x1 - 0.2, h, h + 0.02, z0 + 0.2, z1 - 0.2), roofCol]);
  for (const [a, b, c, d] of [[x0, x1, z0, z0 + 0.2], [x0, x1, z1 - 0.2, z1], [x0, x0 + 0.2, z0, z1], [x1 - 0.2, x1, z0, z1]]) k.plain.push([box(a, b, h, h + 0.7, c, d), TRIM]);
}
/** black polytanks on a roof */
export function tanks(k: Kit, pts: [number, number][], y: number, r = 0.7) {
  for (const [x, z] of pts) {
    k.plain.push([new THREE.CylinderGeometry(r, r, 1.4, 14).translate(x, y + 0.7, z), TANK]);
    k.plain.push([new THREE.SphereGeometry(r, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.3, 1).translate(x, y + 1.4, z), TANK]);
  }
}
/** a gable roof with its ridge along z, from z0 to z1, eaves at x0/x1; white pediments at the ends unless buried */
export function gableZ(k: Kit, x0: number, x1: number, z0: number, z1: number, eave: number, pitch: number, pediments: [boolean, boolean], arch = false) {
  const xc = (x0 + x1) / 2, top = eave + ((x1 - x0) / 2) * pitch;
  k.roof.quad([x0, eave, z1], [x0, eave, z0], [xc, top, z0], [xc, top, z1]);
  k.roof.quad([x1, eave, z0], [x1, eave, z1], [xc, top, z1], [xc, top, z0]);
  const inset = 0.6;
  for (const [i, z] of [[0, z0 + inset], [1, z1 - inset]] as [number, number][]) {
    if (!pediments[i]) continue;
    // shapes face +z; the z0 end is mirrored to face -z
    const out = (g: THREE.BufferGeometry, dz: number) => { if (i === 0) { g.applyMatrix4(MIRROR_Z); flipWinding(g); } return g.translate(0, 0, z + (i === 0 ? -dz : dz)); };
    k.plain.push([out(flat([[x0 + inset, eave], [x1 - inset, eave], [xc, top - inset * pitch]], 0), 0), WHITE]);
    if (arch) {
      // a round-headed opening in the gable (Jubilee's balcony bays)
      const r = Math.min(1.3, (x1 - x0) / 5);
      k.plain.push([out(new THREE.CircleGeometry(r, 16, 0, Math.PI).translate(xc, eave - 0.2, 0), 0.03), '#3a3430']);
    }
    // rake boards
    const rake = Math.hypot((x1 - x0) / 2, top - eave), ang = Math.atan2(top - eave, (x1 - x0) / 2);
    for (const sx of [-1, 1]) k.plain.push([new THREE.BoxGeometry(rake, 0.28, 0.1).translate(0, -0.1, 0).rotateZ(-sx * ang).translate(xc + (sx * (x1 - x0)) / 4, (eave + top) / 2, i === 0 ? z0 - 0.02 : z1 + 0.02), TRIM]);
  }
}

/** one roof over a ring of rooms: hips at the outer corners, valleys round the courtyard */
export function ringRoof(k: Kit, o: [number, number, number, number], i: [number, number, number, number], eave: number, rise: number, fc = TRIM) {
  const [ox0, ox1, oz0, oz1] = o, [ix0, ix1, iz0, iz1] = i;
  const rx0 = (ox0 + ix0) / 2, rx1 = (ox1 + ix1) / 2, rz0 = (oz0 + iz0) / 2, rz1 = (oz1 + iz1) / 2, top = eave + rise;
  const O = (x: number, z: number) => [x, eave, z], R = (x: number, z: number) => [x, top, z];
  k.roof.quad(O(ox0, oz0), O(ox1, oz0), R(rx1, rz0), R(rx0, rz0));
  k.roof.quad(O(ox1, oz1), O(ox0, oz1), R(rx0, rz1), R(rx1, rz1));
  k.roof.quad(O(ox1, oz0), O(ox1, oz1), R(rx1, rz1), R(rx1, rz0));
  k.roof.quad(O(ox0, oz1), O(ox0, oz0), R(rx0, rz0), R(rx0, rz1));
  k.roof.quad(O(ix0, iz0), O(ix1, iz0), R(rx1, rz0), R(rx0, rz0));
  k.roof.quad(O(ix1, iz1), O(ix0, iz1), R(rx0, rz1), R(rx1, rz1));
  k.roof.quad(O(ix1, iz0), O(ix1, iz1), R(rx1, rz1), R(rx1, rz0));
  k.roof.quad(O(ix0, iz1), O(ix0, iz0), R(rx0, rz0), R(rx0, rz1));
  // fascia boards round both eaves
  for (const [x0, x1, z0, z1] of [o, i]) {
    k.plain.push([box(x0, x1, eave - 0.3, eave + 0.03, z0 - 0.06, z0 + 0.06), fc], [box(x0, x1, eave - 0.3, eave + 0.03, z1 - 0.06, z1 + 0.06), fc]);
    k.plain.push([box(x0 - 0.06, x0 + 0.06, eave - 0.3, eave + 0.03, z0, z1), fc], [box(x1 - 0.06, x1 + 0.06, eave - 0.3, eave + 0.03, z0, z1), fc]);
  }
}

// ---------- frames ----------
interface Frame { spec: Spec; cx: number; cz: number; ux: number; uz: number; yaw: number }
function frameOf(spec: Spec): Frame | null {
  let cx: number, cz: number;
  if (spec.origin) [cx, cz] = spec.origin;
  else {
    const b = BUILDINGS.find((o) => o.name === (spec.footprint ?? spec.name));
    if (!b) return null;
    cx = 0; cz = 0;
    const n = b.pts.length / 2;
    for (let i = 0; i < b.pts.length; i += 2) { cx += b.pts[i]; cz += b.pts[i + 1]; }
    cx /= n; cz /= n;
  }
  const l = Math.hypot(spec.axis[0], spec.axis[1]), ux = spec.axis[0] / l, uz = spec.axis[1] / l;
  // local x -> (ux, uz), local z -> (-uz, ux)
  return { spec, cx, cz, ux, uz, yaw: Math.atan2(-uz, ux) };
}
const toLocal = (f: Frame, x: number, z: number) => [(x - f.cx) * f.ux + (z - f.cz) * f.uz, -(x - f.cx) * f.uz + (z - f.cz) * f.ux];
const inRing = (pts: Float32Array, x: number, z: number) => {
  let c = false;
  for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
    const zi = pts[i + 1], zj = pts[j + 1];
    if ((zi > z) !== (zj > z) && x < ((pts[j] - pts[i]) * (z - zi)) / (zj - zi) + pts[i]) c = !c;
  }
  return c;
};

// ---------- geometry ----------
function buildSpec(spec: Spec) {
  const facades = new Map<Style, Facade>();
  const fac = (k: Style) => { let f = facades.get(k); if (!f) facades.set(k, (f = new Facade())); return f; };
  const plain: Part[] = [];
  const glass: THREE.BufferGeometry[] = [];
  const roof = new Roof(new THREE.Color(spec.roofColor));
  const st = spec.storey;
  const wallTop = (floors: number) => PL + floors * st + BAND;
  const k: Kit = { plain, glass, roof, signs: [], meshes: [], wallTop, storey: st };

  /** one face of a block: window bays storey by storey, then plinth and eave band */
  const run = (ax: number, az: number, bx: number, bz: number, floors: number, style: Style, floorStyle?: Record<number, Style>) => {
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.5) return;
    for (let s = 0; s < floors; s++) {
      const S = floorStyle?.[s] ?? style, f = fac(S);
      const bays = Math.max(1, Math.round(len / S.bay));
      const y0 = PL + s * st;
      f.quad(ax, az, bx, bz, y0, y0 + st, bays, s === 0 ? 0 : 0.5, s === 0 ? 0.5 : 1, f.bays, f.bays + bays, s);
      f.bays += bays;
    }
    const ang = -Math.atan2(bz - az, bx - ax), mx = (ax + bx) / 2, mz = (az + bz) / 2, top = wallTop(floors);
    plain.push([new THREE.BoxGeometry(len + 0.1, PL, 0.2).rotateY(ang).translate(mx, PL / 2, mz), PLINTH]);
    plain.push([new THREE.BoxGeometry(len + 0.1, BAND, 0.12).rotateY(ang).translate(mx, top - BAND / 2, mz), WHITE]);
  };

  for (const b of spec.blocks) {
    const sty = (face: Face) => b.faces?.[face] ?? spec.style;
    run(b.x0, b.z0, b.x1, b.z0, b.floors, sty('z0'), b.floorStyle);
    run(b.x0, b.z1, b.x1, b.z1, b.floors, sty('z1'), b.floorStyle);
    run(b.x0, b.z0, b.x0, b.z1, b.floors, sty('x0'), b.floorStyle);
    run(b.x1, b.z0, b.x1, b.z1, b.floors, sty('x1'), b.floorStyle);
    const eave = wallTop(b.floors);
    roof.c = new THREE.Color(b.roofColor ?? spec.roofColor);
    const pitchB = b.pitch ?? spec.pitch;
    const X0 = b.x0 - OV, X1 = b.x1 + OV, Z0 = b.z0 - OV, Z1 = b.z1 + OV;
    if (b.roof === 'none') {
      // covered by a roof the extras build
    } else if (b.roof === 'flat') {
      plain.push([box(b.x0, b.x1, eave, eave + 0.2, b.z0, b.z1), '#c9c4ba']);
    } else if (b.roof === 'crossZ') {
      // ridge at the height of the bars it joins (their depth sets it), ends buried in their roofs
      const pitch = pitchB * (11.8 / (b.x1 - b.x0 + 2 * OV));
      gableZ(k, X0, X1, b.z0, b.z1, eave, pitch, [false, false]);
    } else {
      const w = X1 - X0, d = Z1 - Z0, half = Math.min(w, d) / 2, top = eave + half * pitchB;
      if (w >= d) {
        const zm = (Z0 + Z1) / 2, r0 = [X0 + half, top, zm], r1 = [X1 - half, top, zm];
        roof.quad([X0, eave, Z0], [X1, eave, Z0], r1, r0);
        roof.quad([X1, eave, Z1], [X0, eave, Z1], r0, r1);
        roof.quad([X0, eave, Z1], [X0, eave, Z0], r0, r0);
        roof.quad([X1, eave, Z0], [X1, eave, Z1], r1, r1);
      } else {
        const xm = (X0 + X1) / 2, r0 = [xm, top, Z0 + half], r1 = [xm, top, Z1 - half];
        roof.quad([X1, eave, Z0], [X1, eave, Z1], r1, r0);
        roof.quad([X0, eave, Z1], [X0, eave, Z0], r0, r1);
        roof.quad([X0, eave, Z0], [X1, eave, Z0], r0, r0);
        roof.quad([X1, eave, Z1], [X0, eave, Z1], r1, r1);
      }
      // fascia boards and soffits
      const fc = spec.fascia;
      plain.push([box(X0, X1, eave - 0.3, eave + 0.03, Z0 - 0.06, Z0 + 0.06), fc], [box(X0, X1, eave - 0.3, eave + 0.03, Z1 - 0.06, Z1 + 0.06), fc]);
      plain.push([box(X0 - 0.06, X0 + 0.06, eave - 0.3, eave + 0.03, Z0, Z1), fc], [box(X1 - 0.06, X1 + 0.06, eave - 0.3, eave + 0.03, Z0, Z1), fc]);
      plain.push([box(X0, X1, eave - 0.32, eave - 0.28, Z0, Z1), '#d8cfbf']);
    }
  }
  roof.c = new THREE.Color(spec.roofColor);
  spec.extras(k);
  return { facades, plain, glass, roof, signs: k.signs, meshes: k.meshes };
}

/** A set of block-modelled buildings: build them, and tell the rest of the world where they are. */
export function createSite(name: string, specs: Spec[]) {
  const frames = specs.map(frameOf).filter((f): f is Frame => !!f);
  const named = new Set(specs.map((s) => s.footprint ?? s.name));
  const points = specs.flatMap((s) => s.replaces ?? []);
  return {
    /** the generic builder skips this footprint */
    replaces: (b: Building) => (!!b.name && named.has(b.name)) || points.some(([x, z]) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ && inRing(b.pts, x, z)),
    /** inside a porch, portico or annex a model adds outside the footprints: kept clear of props */
    keepsOut(x: number, z: number, pad = 0) {
      for (const f of frames) {
        if (Math.abs(x - f.cx) > 150 || Math.abs(z - f.cz) > 150) continue;
        const [lx, lz] = toLocal(f, x, z);
        for (const [x0, x1, z0, z1] of f.spec.keep) if (lx > x0 - pad && lx < x1 + pad && lz > z0 - pad && lz < z1 + pad) return true;
      }
      return false;
    },
    /** where each model stands (model frame: x along the axis) */
    frames: () => frames.map((f) => ({ name: f.spec.name, cx: f.cx, cz: f.cz, ux: f.ux, uz: f.uz })),
    /** every model placed in the world; meshes in userData.cullMeshes for fog culling */
    build() {
      const group = new THREE.Group();
      group.name = name;
      const { plain, glass } = materials();
      const roofMat = buildingMaterials().roof;
      const cull: THREE.Mesh[] = [];
      for (const f of frames) {
        const g = buildSpec(f.spec);
        const node = new THREE.Group();
        node.name = f.spec.name;
        node.position.set(f.cx, 0, f.cz);
        node.rotation.y = f.yaw;
        const add = (geo: THREE.BufferGeometry, m: THREE.Material, cast = true) => {
          const mesh = new THREE.Mesh(geo, m);
          mesh.castShadow = cast;
          mesh.receiveShadow = true;
          node.add(mesh);
          cull.push(mesh);
        };
        for (const [st, fac] of g.facades) add(fac.geometry(), wallMaterial(st));
        add(merge(g.plain), plain);
        if (g.glass.length) add(mergeGeometries(g.glass.map((x) => { const n = x.index ? x.toNonIndexed() : x; for (const a of Object.keys(n.attributes)) if (a !== 'position' && a !== 'normal') n.deleteAttribute(a); return n; })), glass, false);
        if (g.roof.pos.length) add(g.roof.geometry(), roofMat);
        for (const extra of g.meshes) { node.add(extra); cull.push(extra); }
        for (const s of g.signs) {
          const { tex, aspect } = signTexture(s.text, s.colors);
          const h = s.w / aspect;
          const sign = new THREE.Mesh(new THREE.PlaneGeometry(s.w, h), new THREE.MeshBasicMaterial({ map: tex }));
          sign.position.set(s.x, s.y, s.z);
          sign.rotation.y = s.ry;
          sign.name = 'model-sign';
          node.add(sign);
        }
        group.add(node);
      }
      group.updateMatrixWorld(true);
      group.userData.cullMeshes = cull;
      return group;
    },
  };
}
