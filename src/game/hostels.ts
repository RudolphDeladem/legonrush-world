// Jubilee Hall and the International Students Hostels (ISH 1 and ISH 2), modelled from the
// owner's photos and marked layout, on their OSM footprints (the generic builder skips them).
//
// Each building is a set of rectangular blocks in its own frame (x along the footprint's long
// side, z across it), with its storeys, hipped or flat roof and the facade style of each face,
// plus the entrance and the details the photos show. Blocks were measured from the footprints;
// parts the footprints leave out (Jubilee's entrance block, the hostels' flat-roofed annex)
// from the registered layout.
//
// ISH 1 and ISH 2: one design, four storeys under a terracotta hipped roof. Two long bars joined
// by a spine, a short west wing and a flat-roofed annex between the bars at the east end. The
// north facade is a plain grid of dark windows, the south facade has recessed balconies with
// narrow stair windows between them. ISH 1 is entered by a small gabled porch on its north
// facade, ISH 2 by a flat canopy on its south facade; both face the car parks toward Jubilee Hall.
//
// Jubilee Hall: wings round a long courtyard, three storeys except the east wing along the car
// park, which has two, with gabled balcony bays on its courtyard side; the north wing's
// courtyard face has arched windows over an arcade. The entrance is in the south-east corner:
// a portico from the car park to the doors, a round white tower and a flat-roofed block with
// water tanks.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BUILDINGS, type Building } from './campusmap';
import { buildingMaterials } from './facades';
import { groundShade, weathering } from './shading';
import { Facade, PAVE, PLINTH, Roof, TANK, TRIM, WHITE, box, canvas, flat, flipWinding, merge, rnd, signTexture, speckle, type Part } from './modelkit';

// ---------- facade styles: one window bay, upper storey on top, ground storey below ----------
type Rect = readonly [number, number, number, number];
interface Style { bay: number; draw: (g: CanvasRenderingContext2D) => void; up: Rect[]; ground: Rect[] }

const render = (g: CanvasRenderingContext2D, base = '#f7f5f0') => {
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 512);
  speckle(g, 0, 0, 256, 512, 3000, ['#eeebe3', '#ffffff', '#e8e4da']);
};
const slab = (g: CanvasRenderingContext2D, y: number, h: number) => {
  g.fillStyle = '#f2efe8'; g.fillRect(0, y, 256, h);
  g.fillStyle = '#d3ccbf'; g.fillRect(0, y, 256, 2);
};
/** a dark glazed window with frame, mullions and a sill */
const window_ = (g: CanvasRenderingContext2D, [x, y, w, h]: Rect, frame: string, cols: number, transom = 0.35) => {
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

/** ISH north facade (owner photo): a plain grid of wide dark windows between white piers and slab bands */
const ISH_GRID: Style = {
  bay: 3.5,
  up: [[34, 52, 188, 140]],
  ground: [[34, 52, 188, 150]],
  draw: (g) => {
    render(g);
    window_(g, [34, 52, 188, 140], '#3a3f45', 2, 0.3);
    slab(g, 226, 30);
    window_(g, [34, 256 + 52, 188, 150], '#3a3f45', 2, 0.3);
    g.fillStyle = 'rgba(80,60,40,0.35)'; g.fillRect(0, 500, 256, 12);
  },
};
/** ISH south facade: a recessed balcony (3.6 m) and a strip of wall with a tall narrow window (2 m) */
const ISH_BALCONY: Style = {
  bay: 5.6,
  up: [[44, 40, 92, 150], [196, 40, 26, 170]],
  ground: [[30, 48, 120, 160], [196, 48, 26, 160]],
  draw: (g) => {
    render(g);
    // balcony recess: beige back wall, a door and window, white parapet in front
    g.fillStyle = '#d6c6a0'; g.fillRect(14, 0, 150, 226);
    g.fillStyle = 'rgba(70,55,40,0.35)'; g.fillRect(14, 0, 150, 14);
    window_(g, [44, 40, 92, 150], '#5d4a36', 2, 0.25);
    g.fillStyle = '#f6f3ec'; g.fillRect(14, 150, 150, 76);
    g.fillStyle = '#ffffff'; g.fillRect(10, 146, 158, 8);
    g.fillStyle = 'rgba(70,60,50,0.3)'; g.fillRect(14, 154, 150, 3);
    window_(g, [196, 40, 26, 170], '#3a3f45', 1, 0);
    slab(g, 226, 30);
    // ground storey: wide dark windows over a brown base
    window_(g, [30, 256 + 48, 120, 160], '#5d4a36', 3, 0.3);
    window_(g, [196, 256 + 48, 26, 160], '#3a3f45', 1, 0);
    g.fillStyle = '#7b4a35'; g.fillRect(0, 488, 256, 24);
  },
};
/** Jubilee outer and courtyard faces: dark windows in white render, wide on the ground floor */
const JUB_WIN: Style = {
  bay: 3.3,
  up: [[62, 60, 132, 116]],
  ground: [[54, 64, 148, 128]],
  draw: (g) => {
    render(g);
    window_(g, [62, 60, 132, 116], '#2d3036', 3, 0.3);
    slab(g, 232, 24);
    window_(g, [54, 256 + 64, 148, 128], '#2d3036', 3, 0.3);
  },
};
/** Jubilee north wing, courtyard face (owner photo): round-headed windows over an open arcade */
const JUB_ARCH: Style = {
  bay: 3.3,
  up: [[70, 60, 116, 130]],
  ground: [[40, 50, 176, 206]],
  draw: (g) => {
    render(g);
    const arch = (x: number, y: number, w: number, h: number, col: string) => {
      g.fillStyle = col;
      g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); g.fill();
    };
    arch(64, 54, 128, 142, '#e7e1d5');
    arch(70, 60, 116, 130, '#263039');
    g.fillStyle = '#ffffff'; g.fillRect(56, 196, 144, 7);
    slab(g, 232, 24);
    arch(34, 256 + 44, 188, 212, '#ded7ca');
    arch(40, 256 + 50, 176, 206, '#3a3530');
  },
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

const STYLES = { ishGrid: ISH_GRID, ishBalcony: ISH_BALCONY, jubWin: JUB_WIN, jubArch: JUB_ARCH };
type StyleKey = keyof typeof STYLES;

let mats: { walls: Record<StyleKey, THREE.MeshStandardMaterial>; plain: THREE.MeshStandardMaterial; glass: THREE.MeshStandardMaterial } | null = null;
function materials() {
  if (mats) return mats;
  const walls = {} as Record<StyleKey, THREE.MeshStandardMaterial>;
  for (const [k, st] of Object.entries(STYLES) as [StyleKey, Style][]) {
    const lights = lightsFor(st);
    lights.channel = 1;
    lights.repeat.set(1 / LIT_BAYS, 1 / LIT_FLOORS);
    const map = canvas(256, 512, st.draw);
    walls[k] = weathering(groundShade(new THREE.MeshStandardMaterial({ map, roughness: 0.88, side: THREE.DoubleSide, emissive: '#ffffff', emissiveMap: lights, emissiveIntensity: 0 }), 2.2, 0.3, 'wall'), 'wall', 16, 0.3);
  }
  mats = {
    walls,
    plain: weathering(groundShade(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }), 2.2, 0.3, 'wall'), 'wall', 16, 0.3),
    glass: new THREE.MeshStandardMaterial({ color: '#28323d', roughness: 0.25, metalness: 0.3, emissive: '#ffd08a', emissiveIntensity: 0, side: THREE.DoubleSide }),
  };
  return mats;
}
/** Lit windows and lobbies after dark (called with the other night lights). */
export function setHostelLights(on: boolean) {
  if (!mats) return;
  for (const m of Object.values(mats.walls)) m.emissiveIntensity = on ? 1.1 : 0;
  mats.glass.emissiveIntensity = on ? 0.9 : 0;
}

// ---------- building specs ----------
type Face = 'x0' | 'x1' | 'z0' | 'z1';
interface Block {
  x0: number; x1: number; z0: number; z1: number;
  floors: number;
  /** hip (default), flat, or a gable roof whose ridge runs along z and ends inside a neighbour's roof */
  roof?: 'hip' | 'flat' | 'crossZ';
  /** facade style per face (default: the building's) */
  faces?: Partial<Record<Face, StyleKey>>;
}
interface Spec {
  name: string;
  /** long axis of the footprint (x of the model), pointing east-ish */
  axis: [number, number];
  storey: number;
  style: StyleKey;
  roofColor: string;
  fascia: string;
  pitch: number;
  blocks: Block[];
  /** entrances and the details the photos show, in the model frame */
  extras: (k: Kit) => void;
  /** areas kept clear of generated props (porches, annexes outside the footprint), model frame [x0, x1, z0, z1] */
  keep: [number, number, number, number][];
}
interface Kit { plain: Part[]; glass: THREE.BufferGeometry[]; roof: Roof; signs: { text: string; x: number; y: number; z: number; ry: number; w: number }[]; wallTop: (floors: number) => number; storey: number }

const PL = 0.4, BAND = 0.4, OV = 0.8;
const MIRROR_Z = new THREE.Matrix4().makeScale(1, 1, -1);

/** a white flat-roofed block with a parapet (annexes, entrance blocks) */
function flatBlock(k: Kit, x0: number, x1: number, z0: number, z1: number, h: number, roofCol = '#c9c4ba') {
  k.plain.push([box(x0, x1, 0, h, z0, z1), WHITE]);
  k.plain.push([box(x0, x1, 0, PL, z0 - 0.05, z1 + 0.05), PLINTH]);
  k.plain.push([box(x0 + 0.2, x1 - 0.2, h, h + 0.02, z0 + 0.2, z1 - 0.2), roofCol]);
  for (const [a, b, c, d] of [[x0, x1, z0, z0 + 0.2], [x0, x1, z1 - 0.2, z1], [x0, x0 + 0.2, z0, z1], [x1 - 0.2, x1, z0, z1]]) k.plain.push([box(a, b, h, h + 0.7, c, d), TRIM]);
}
/** black polytanks on a roof */
function tanks(k: Kit, pts: [number, number][], y: number, r = 0.7) {
  for (const [x, z] of pts) {
    k.plain.push([new THREE.CylinderGeometry(r, r, 1.4, 14).translate(x, y + 0.7, z), TANK]);
    k.plain.push([new THREE.SphereGeometry(r, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.3, 1).translate(x, y + 1.4, z), TANK]);
  }
}
/** a gable roof with its ridge along z, from z0 to z1, eaves at x0/x1; white pediments at the ends unless buried */
function gableZ(k: Kit, x0: number, x1: number, z0: number, z1: number, eave: number, pitch: number, pediments: [boolean, boolean], arch = false) {
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

// ISH: one design; the porch differs (ISH 1 north gable porch, ISH 2 south canopy)
const ishBlocks: Block[] = [
  { x0: -30.9, x1: 32.1, z0: -23.8, z1: -12.0, floors: 4 },
  { x0: -31.5, x1: 32.4, z0: 13.4, z1: 25.1, floors: 4, faces: { z1: 'ishBalcony' } },
  { x0: 1.8, x1: 15.8, z0: -17.9, z1: 19.3, floors: 4, roof: 'crossZ' },
  { x0: -31.7, x1: -19.5, z0: -3.9, z1: 13.4, floors: 4 },
];
function ishAnnex(k: Kit) {
  // the flat-roofed block between the bars at the east end, with tanks and AC units on it
  flatBlock(k, 15.8, 31.6, -12, 13.4, 4.2, '#bdb8ae');
  tanks(k, [[20, -6], [22, -6], [27, 6]], 4.2, 0.6);
  for (const [x, z] of [[25, -4], [28, -2], [20, 7]]) k.plain.push([box(x - 0.6, x + 0.6, 4.2, 5.0, z - 0.4, z + 0.4), '#d9d9d6']);
  k.glass.push(box(31.6, 31.65, PL, 2.8, -2, 2));
}
const ISH_KEEP: [number, number, number, number][] = [[15.8, 32.4, -12, 13.4]];

const SPECS: Spec[] = [
  {
    name: 'International Students Hostel 1, ISH 1',
    axis: [60.3, -21.2], storey: 3.1, style: 'ishGrid', roofColor: '#b2512d', fascia: '#3b3430', pitch: 0.5,
    blocks: ishBlocks,
    keep: [...ISH_KEEP, [1.5, 10, -29, -23.8]],
    extras: (k) => {
      ishAnnex(k);
      // the small gabled porch on the north facade (owner photo), a little east of the middle
      const x = 5.7, z = -23.8, d = 3.6, w = 3.4, eave = 3.7;
      for (const s of [-1, 1]) k.plain.push([box(x + s * w - 0.35, x + s * w + 0.35, 0, eave, z - d, z), '#ecdfbd']);
      k.plain.push([box(x - w, x + w, eave - 0.45, eave, z - d, z), '#ecdfbd']);
      k.plain.push([box(x - w - 0.2, x + w + 0.2, 0, 0.3, z - d - 0.6, z), PAVE]);
      gableZ(k, x - w - 0.5, x + w + 0.5, z - d - 0.5, z + 0.3, eave, 0.55, [true, false]);
      k.glass.push(box(x - 2.4, x + 2.4, 0.3, 3.0, z - 0.05, z));
      k.signs.push({ text: 'INTERNATIONAL STUDENTS HOSTEL 1', x, y: eave - 0.22, z: z - d - 0.01, ry: Math.PI, w: 5.6 });
    },
  },
  {
    name: 'International Students Hostel 2, ISH 2',
    axis: [60.3, -21.2], storey: 3.1, style: 'ishGrid', roofColor: '#b2512d', fascia: '#3b3430', pitch: 0.5,
    blocks: ishBlocks,
    keep: [...ISH_KEEP, [2, 12.5, 25.1, 29]],
    extras: (k) => {
      ishAnnex(k);
      // the flat entrance canopy on the south facade, east of the middle
      const x = 7.1, z = 25.1;
      k.plain.push([box(x - 3.2, x + 3.2, 3.2, 3.9, z, z + 2.4), WHITE]);
      for (const s of [-1, 1]) k.plain.push([box(x + s * 2.9 - 0.15, x + s * 2.9 + 0.15, 0, 3.2, z + 2.1, z + 2.4), WHITE]);
      k.plain.push([box(x - 3.4, x + 3.4, 0, 0.3, z, z + 3), PAVE]);
      k.glass.push(box(x - 2.2, x + 2.2, 0.3, 3.0, z, z + 0.05));
      k.signs.push({ text: 'INTERNATIONAL STUDENTS HOSTEL 2', x, y: 3.55, z: z + 2.41, ry: 0, w: 5.6 });
    },
  },
  {
    name: 'Jubilee Hall',
    axis: [36.3, 103.2], storey: 3.2, style: 'jubWin', roofColor: '#b0744c', fascia: '#f3efe6', pitch: 0.45,
    blocks: [
      // east wing along the car park: two storeys (owner); gabled balcony bays on its courtyard side
      { x0: -26.8, x1: 67.3, z0: -52.6, z1: -34.5, floors: 2 },
      { x0: -42, x1: -26.8, z0: -52.6, z1: -34.5, floors: 3 },
      // north wing: arched windows over an arcade on the courtyard side
      { x0: -42, x1: -26.8, z0: -34.5, z1: 2.4, floors: 2, faces: { x1: 'jubArch' } },
      { x0: -45, x1: -22.4, z0: 2.4, z1: 15.4, floors: 3 },
      { x0: -49.5, x1: -39.8, z0: 10.8, z1: 22.1, floors: 3 },
      // west wing, the south-west jog and the south wing: three storeys
      { x0: -28, x1: 59.9, z0: 10.1, z1: 21.5, floors: 3 },
      { x0: 52.5, x1: 63.6, z0: 2.2, z1: 10.4, floors: 3 },
      { x0: 63.6, x1: 77.2, z0: -36.3, z1: 15.9, floors: 3 },
    ],
    keep: [[49, 78, -65, -36]],
    extras: (k) => {
      const e2 = k.wallTop(2);
      // gabled balcony bays on the east wing's courtyard side (owner photos), one every 20 m
      for (const x of [-15, 5, 25, 45]) {
        const z = -34.5;
        k.plain.push([box(x - 3.6, x + 3.6, 0, e2, z, z + 2.2), WHITE]);
        // the recessed balcony: a dark recess with tan stone parapets on each floor
        k.plain.push([box(x - 2.6, x + 2.6, PL, e2 - 0.5, z + 2.2, z + 2.24), '#3b3631']);
        for (let f = 0; f < 2; f++) {
          const y = PL + f * k.storey;
          k.plain.push([box(x - 2.7, x + 2.7, y, y + 1.0, z + 2.24, z + 2.4), '#c4a273']);
          k.plain.push([box(x - 2.8, x + 2.8, y + 1.0, y + 1.12, z + 2.2, z + 2.45), TRIM]);
        }
        gableZ(k, x - 4.1, x + 4.1, -53.2, z + 2.8, e2, 0.6, [true, true], true);
      }
      // a covered walk with a red roof along the west wing's courtyard face
      const w0 = -22, w1 = -4, wz = 10.1;
      k.roof.quad([w1, 2.6, wz - 4], [w0, 2.6, wz - 4], [w0, 3.6, wz], [w1, 3.6, wz]);
      for (let x = w0 + 1; x <= w1 - 1; x += 4) k.plain.push([box(x - 0.1, x + 0.1, 0, 2.6, wz - 3.9, wz - 3.7), WHITE]);
      // courtyard: two tank stands and a tree (the hut in the courtyard is the mapped Didi Jollof)
      for (const [x, z] of [[-22.8, -15.5], [54.7, -19.9]] as [number, number][]) {
        k.plain.push([box(x - 2, x + 2, 0, 1.2, z - 1.2, z + 1.2), '#8f8a82']);
        tanks(k, [[x - 1.1, z], [x + 1.1, z]], 1.2, 0.75);
      }
      k.plain.push([new THREE.CylinderGeometry(0.25, 0.35, 3, 7).translate(12, 1.5, -23.9), '#5b4330']);
      k.plain.push([new THREE.IcosahedronGeometry(3.2, 1).scale(1, 0.85, 1).translate(12, 4.8, -23.9), '#2f5d27']);
      // ---- the entrance corner (owner aerial photo, marked layout) ----
      // doors in the re-entrant corner at the south end of the east wing, under a flat porch roof
      const zN = -52.6, zS = -36.3, xD = 67.3;
      k.glass.push(box(xD, xD + 0.05, PL, 3.0, -47, -40));
      for (const z of [-47, -43.5, -40]) k.plain.push([box(xD + 0.02, xD + 0.1, PL, 3.0, z - 0.07, z + 0.07), '#4a3a2c']);
      k.plain.push([box(xD, 77.2, 3.3, 3.7, zN, zS), TRIM]);
      k.plain.push([box(xD + 0.2, 77.0, 3.7, 3.75, zN + 0.2, zS - 0.2), '#9c7656']);
      for (const [x, z] of [[76.8, -38], [76.8, -45], [76.8, -52]] as [number, number][]) k.plain.push([new THREE.CylinderGeometry(0.18, 0.2, 3.3, 10).translate(x, 1.65, z), WHITE]);
      k.plain.push([box(xD, 77.6, 0, 0.18, -53, zS), PAVE]);
      // the portico from the car park: white posts and beams with a brown band, a flat roof
      const pz0 = -63.5, pz1 = zN, px0 = 69, px1 = 77;
      for (const x of [px0, 73, px1]) k.plain.push([box(x - 0.2, x + 0.2, 0, 3.6, pz0, pz0 + 0.4), WHITE]);
      for (const z of [-58]) for (const x of [px0, px1]) k.plain.push([box(x - 0.2, x + 0.2, 0, 3.6, z - 0.2, z + 0.2), WHITE]);
      k.plain.push([box(px0 - 0.3, px1 + 0.3, 3.6, 4.15, pz0 - 0.3, pz1), WHITE]);
      k.plain.push([box(px0 - 0.32, px1 + 0.32, 3.6, 3.85, pz0 - 0.32, pz0 + 0.1), '#7a5236']);
      k.plain.push([box(px0, px1, 0, 0.15, pz0, pz1), PAVE]);
      // the round white tower beside it, open at the top
      k.plain.push([new THREE.CylinderGeometry(4, 4, 7.8, 28, 1, true).translate(61.5, 3.9, -58.5), WHITE]);
      k.plain.push([new THREE.CylinderGeometry(3.7, 3.7, 0.2, 28).translate(61.5, 6.6, -58.5), '#4a4038']);
      k.plain.push([new THREE.CylinderGeometry(4.15, 4.15, 0.3, 28, 1, true).translate(61.5, 7.7, -58.5), TRIM]);
      for (let i = 0; i < 6; i++) {
        const a = Math.PI * (0.75 + i * 0.18);
        k.glass.push(box(-0.4, 0.4, 2.0, 5.6, -0.04, 0.04).translate(0, 0, 4.02).rotateY(a).translate(61.5, 0, -58.5));
      }
      // the flat-roofed block with water tanks and roof railings, against the east wing
      flatBlock(k, 50, 58.5, -64, zN, k.wallTop(2) - 0.3);
      tanks(k, [[52.5, -58], [55.5, -58]], k.wallTop(2) - 0.3);
      for (let f = 0; f < 2; f++) k.glass.push(box(51, 57.5, PL + 0.9 + f * k.storey, PL + 2.3 + f * k.storey, -64.05, -64));
      k.signs.push({ text: 'JUBILEE HALL', x: 73, y: 3.73, z: pz0 - 0.33, ry: Math.PI, w: 4.2 });
    },
  },
];
const MODELLED = new Set(SPECS.map((s) => s.name));
export const isHostelModel = (b: Building) => !!b.name && MODELLED.has(b.name);

// ---------- frames ----------
interface Frame { spec: Spec; cx: number; cz: number; ux: number; uz: number; yaw: number }
const FRAMES: Frame[] = [];
for (const spec of SPECS) {
  const b = BUILDINGS.find((o) => o.name === spec.name);
  if (!b) continue;
  let cx = 0, cz = 0;
  const n = b.pts.length / 2;
  for (let i = 0; i < b.pts.length; i += 2) { cx += b.pts[i]; cz += b.pts[i + 1]; }
  cx /= n; cz /= n;
  const l = Math.hypot(spec.axis[0], spec.axis[1]), ux = spec.axis[0] / l, uz = spec.axis[1] / l;
  // local x -> (ux, uz), local z -> (-uz, ux)
  FRAMES.push({ spec, cx, cz, ux, uz, yaw: Math.atan2(-uz, ux) });
}
const toLocal = (f: Frame, x: number, z: number) => [(x - f.cx) * f.ux + (z - f.cz) * f.uz, -(x - f.cx) * f.uz + (z - f.cz) * f.ux];
/** where each modelled building stands (model frame: x along the long side) */
export const hostelFrames = () => FRAMES.map((f) => ({ name: f.spec.name, cx: f.cx, cz: f.cz, ux: f.ux, uz: f.uz }));

/** Inside a porch, portico or annex these models add outside the footprints: kept clear of props. */
export function inHostelModel(x: number, z: number, pad = 0) {
  for (const f of FRAMES) {
    if (Math.abs(x - f.cx) > 150 || Math.abs(z - f.cz) > 150) continue;
    const [lx, lz] = toLocal(f, x, z);
    for (const [x0, x1, z0, z1] of f.spec.keep) if (lx > x0 - pad && lx < x1 + pad && lz > z0 - pad && lz < z1 + pad) return true;
  }
  return false;
}

// ---------- geometry ----------
function buildSpec(spec: Spec) {
  const facades = new Map<StyleKey, Facade>();
  const fac = (k: StyleKey) => { let f = facades.get(k); if (!f) facades.set(k, (f = new Facade())); return f; };
  const plain: Part[] = [];
  const glass: THREE.BufferGeometry[] = [];
  const roof = new Roof(new THREE.Color(spec.roofColor));
  const st = spec.storey;
  const wallTop = (floors: number) => PL + floors * st + BAND;
  const k: Kit = { plain, glass, roof, signs: [], wallTop, storey: st };

  /** one face of a block: window bays storey by storey, then plinth and eave band */
  const run = (ax: number, az: number, bx: number, bz: number, floors: number, style: StyleKey) => {
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.5) return;
    const S = STYLES[style], f = fac(style);
    const bays = Math.max(1, Math.round(len / S.bay));
    for (let s = 0; s < floors; s++) {
      const y0 = PL + s * st;
      f.quad(ax, az, bx, bz, y0, y0 + st, bays, s === 0 ? 0 : 0.5, s === 0 ? 0.5 : 1, f.bays, f.bays + bays, s);
    }
    f.bays += bays;
    const ang = -Math.atan2(bz - az, bx - ax), mx = (ax + bx) / 2, mz = (az + bz) / 2, top = wallTop(floors);
    plain.push([new THREE.BoxGeometry(len + 0.1, PL, 0.2).rotateY(ang).translate(mx, PL / 2, mz), PLINTH]);
    plain.push([new THREE.BoxGeometry(len + 0.1, BAND, 0.12).rotateY(ang).translate(mx, top - BAND / 2, mz), WHITE]);
  };

  for (const b of spec.blocks) {
    const sty = (face: Face) => b.faces?.[face] ?? spec.style;
    run(b.x0, b.z0, b.x1, b.z0, b.floors, sty('z0'));
    run(b.x0, b.z1, b.x1, b.z1, b.floors, sty('z1'));
    run(b.x0, b.z0, b.x0, b.z1, b.floors, sty('x0'));
    run(b.x1, b.z0, b.x1, b.z1, b.floors, sty('x1'));
    const eave = wallTop(b.floors);
    const X0 = b.x0 - OV, X1 = b.x1 + OV, Z0 = b.z0 - OV, Z1 = b.z1 + OV;
    if (b.roof === 'flat') {
      plain.push([box(b.x0, b.x1, eave, eave + 0.2, b.z0, b.z1), '#c9c4ba']);
    } else if (b.roof === 'crossZ') {
      // ridge at the height of the bars it joins (their depth sets it), ends buried in their roofs
      const pitch = spec.pitch * (11.8 / (b.x1 - b.x0 + 2 * OV));
      gableZ(k, X0, X1, b.z0, b.z1, eave, pitch, [false, false]);
    } else {
      const w = X1 - X0, d = Z1 - Z0, half = Math.min(w, d) / 2, top = eave + half * spec.pitch;
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
  spec.extras(k);
  return { facades, plain, glass, roof, signs: k.signs };
}

/** Jubilee Hall and ISH 1 and 2, placed on their footprints; meshes in userData.cullMeshes for fog culling. */
export function buildHostels() {
  const group = new THREE.Group();
  group.name = 'hostels';
  const { walls, plain, glass } = materials();
  const roofMat = buildingMaterials().roof;
  const cull: THREE.Mesh[] = [];
  for (const f of FRAMES) {
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
    for (const [key, fac] of g.facades) add(fac.geometry(), walls[key]);
    add(merge(g.plain), plain);
    if (g.glass.length) add(mergeGeometries(g.glass.map((x) => { const n = x.index ? x.toNonIndexed() : x; for (const a of Object.keys(n.attributes)) if (a !== 'position' && a !== 'normal') n.deleteAttribute(a); return n; })), glass, false);
    add(g.roof.geometry(), roofMat);
    for (const s of g.signs) {
      const { tex, aspect } = signTexture(s.text);
      const h = s.w / aspect;
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(s.w, h), new THREE.MeshBasicMaterial({ map: tex }));
      sign.position.set(s.x, s.y, s.z);
      sign.rotation.y = s.ry;
      sign.name = 'hostel-sign';
      node.add(sign);
    }
    group.add(node);
  }
  group.updateMatrixWorld(true);
  group.userData.cullMeshes = cull;
  return group;
}
