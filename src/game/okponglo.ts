// The N4 from Okponglo to the University of Ghana Stadium, rebuilt to the owner's Okponglo to UG Stadium correction
// brief (Pairs 1-21, the annotated aerials A01-A05; numbers in okplan.ts, the banks' levels in relief.ts, evidence in
// docs/okponglo/evidence-audit.md). It builds over the earlier Legon Road and La Bawaleshie work (labawaleshie.ts,
// which still lays the median's kerbed ground, the verges, the junction and the neighbourhood's other buildings):
// - the median's planting: compact trees with short stems and foliage reaching low, crowns of different sizes with
//   uneven gaps north of the junction (Pairs 1, 2, 4); south of it the open stretch of low shrubs and saplings between
//   the boards (Pairs 13, 14); soil and worn paths through the grass; the boards that stand on it (the blue pylon, the
//   wooden A-frames, the INSTANT ADMISSION pylon, the KFC and visa boards);
// - the stadium side: the raised bank north of the junction behind its low rough stone face, dense varied shrubs, small
//   trees and the odd taller tree over it (Pair 3); opposite Leasafric the raised verge with its stone face, the cream
//   structure with its curved ends and grey inset panel, the blue structure beside it, the signboards and the street
//   light (Pair 21);
// - north of La-Bawaleshi Road on the east: First Eye Plaza (Pairs 5, 6) with its forecourt, kiosks and cabinet; the
//   low red-brown roofed structure behind its grille boundary (Pair 7); the ALPHA LED shop (Pair 9);
// - south of it: the signed corner shop (3D SIGN SHOP, Pairs 10, 11; its north face and the fenced gravel forecourt,
//   Pair 8), the taller mass behind it, the larger neighbour east of the forecourt; the long green wall round the planted
//   plot and the empty frame (Pairs 12, 13); the sidewalk along the frontage;
// - Leasafric (Pairs 15, 16), Pro Vision (Pair 17), Diamed and its blue neighbour (Pairs 18-20), each in its own
//   compound with its walls, gates, signs and planting.
// Names and lettering are only what the photographs show legibly; phone numbers, prices and fine print are not copied.
import * as THREE from 'three';
import { behindYardFence } from './jjplan';
import { NODE_XZ, ROADS } from './campusmap';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createSite, render, type Block, type Kit, type Spec, type Style } from './blocks';
import { box, canvas, merge, type Part } from './modelkit';
import { SOLIDS } from './solids';
import { Bag, fanPalm, hash, tuft, vnoise, wallSolids } from './enkit';
import { broadleaf } from './nsiaroad';
import { christmasPalm, drapeAt, groundCover } from './kuffourgarden';
import { groundHeight as gh } from './relief';
import { letters } from './letters';
import { pavers, rod, run, strip, type V3 } from './upsa';
import { concrete } from './concrete';
import { lattice } from './labawaleshie';
import { E_HALF, MEDIAN, SCRUB, W_HALF, xEast, xWest } from './lbplan';
import {
  ALPHA, BANKS, DIAMED, GREENWALL, LEASAFRIC, LOWROOF, MEDIAN_BOARDS, MEDIAN_RUNS, OK_KEEP, OK_OUTLINES, P21, PLAZA, PROVISION, SIGNSHOP,
  bankFace, bankTop, mcdanX, type Bank,
} from './okplan';

type P2 = [number, number];
const lazy = <T,>(f: () => T) => { let v: T | null = null; return () => (v ??= f()); };

// ======================================================================================================
// textured surfaces: one material per picture, geometry batched per material
// ======================================================================================================
const mats = new Map<string, THREE.MeshStandardMaterial>();
/** a picture as a material: w x h canvas pixels, drawn once */
export function pic(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, opts: { rough?: number; transparent?: boolean } = {}) {
  let m = mats.get(key);
  if (!m) {
    const t = canvas(w, h, draw);
    m = new THREE.MeshStandardMaterial({ map: t, roughness: opts.rough ?? 0.85, side: THREE.DoubleSide, transparent: !!opts.transparent, alphaTest: opts.transparent ? 0.4 : 0 });
    mats.set(key, m);
  }
  return m;
}
export class Pics {
  by = new Map<THREE.Material, THREE.BufferGeometry[]>();
  constructor(public O: P2) {}
  add(m: THREE.Material, g: THREE.BufferGeometry) { (this.by.get(m) ?? this.by.set(m, []).get(m)!).push(g); }
  /** a vertical picture from world (ax, az) to (bx, bz), y0..y1, its uv repeated u x v times; it faces the right of a->b
   *  as seen from above (a north of b faces west), stood `off` metres out that way */
  wall(m: THREE.Material, ax: number, az: number, bx: number, bz: number, y0: number, y1: number, u = 1, v = 1, off = 0) {
    const len = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / len, nz = (bx - ax) / len;
    const A = [ax - this.O[0] + nx * off, az - this.O[1] + nz * off], B = [bx - this.O[0] + nx * off, bz - this.O[1] + nz * off];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([A[0], y0, A[1], B[0], y0, B[1], B[0], y1, B[1], A[0], y1, A[1]], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, v], 2));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    g.computeVertexNormals();
    this.add(m, g);
  }
  /** a level picture (a roof, a floor): world box, at y */
  floor(m: THREE.Material, x0: number, x1: number, z0: number, z1: number, y: number, u = 1, v = 1) {
    const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * u, uv.getY(i) * v);
    this.add(m, g.translate((x0 + x1) / 2 - this.O[0], y, (z0 + z1) / 2 - this.O[1]));
  }
  finish(k: Kit) {
    for (const [m, list] of this.by) {
      // (merged keeping their uvs: the vertex-colour merge of modelkit.ts drops them)
      const me = new THREE.Mesh(mergeGeometries(list.map((g) => { for (const a of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(a)) g.deleteAttribute(a); return g; })), m);
      me.castShadow = true; me.receiveShadow = true;
      k.meshes.push(me);
    }
  }
}

// ---------- the pictures ----------
const speck = (g: CanvasRenderingContext2D, w: number, h: number, n: number, cols: string[], seed = 3) => {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) { g.fillStyle = cols[(r() * cols.length) | 0]; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
};
const prng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
/** rough stone of the retaining faces (Pairs 3, 21): grey and brown rubble, dark joints, 2 m to a repeat */
const RUBBLE = lazy(() => pic('rubble', 256, 128, (g) => {
  const r = prng(41);
  g.fillStyle = '#56504a'; g.fillRect(0, 0, 256, 128);
  for (let y = 0; y < 128; y += 14 + r() * 6) for (let x = -r() * 20; x < 256; x += 16 + r() * 22) {
    const v = 138 + r() * 62 | 0, w = 12 + r() * 20, h = 10 + r() * 8, warm = r() < 0.3 ? 14 : 0;
    g.fillStyle = `rgb(${v + 6 + warm},${v + warm / 2},${v - 8})`;
    g.beginPath(); g.moveTo(x + r() * 3, y + r() * 3); g.lineTo(x + w - r() * 3, y + r() * 2); g.lineTo(x + w, y + h - r() * 3); g.lineTo(x + r() * 4, y + h); g.closePath(); g.fill();
  }
  speck(g, 256, 128, 900, ['#3a3633', '#8c8478', '#6f675e'], 5);
  g.fillStyle = 'rgba(60,50,40,0.25)'; g.fillRect(0, 112, 256, 16);
}));
/** concrete slabs of the forecourts and sidewalks: grey squares, dark joints, stains (1.5 m to a repeat) */
export const SLABS = lazy(() => pic('slabs', 128, 128, (g) => {
  g.fillStyle = '#7d7972'; g.fillRect(0, 0, 128, 128);
  for (const [x, y] of [[0, 0], [64, 0], [0, 64], [64, 64]]) { g.fillStyle = ['#a29d94', '#9a958c', '#a8a39a', '#958f86'][(x + y) % 4 === 0 ? 0 : (x / 64 + y / 32) | 0]; g.fillRect(x + 2, y + 2, 60, 60); }
  speck(g, 128, 128, 500, ['#8a857c', '#b2ada3', '#6e6a63'], 7);
  g.fillStyle = 'rgba(70,60,50,0.18)'; g.fillRect(10, 70, 40, 18); g.fillRect(80, 12, 30, 22);
}));

// ---------- the walls' paint: one storey (the block styles) ----------
const W8 = '#2a3a48';
/** an aluminium-framed window with its glass and a sill; bars optional */
export const win = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, o: { frame?: string; glass?: string; bars?: boolean; panes?: number } = {}) => {
  g.fillStyle = o.frame ?? '#eeeeea'; g.fillRect(x - 5, y - 5, w + 10, h + 10);
  const gl = g.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, o.glass ?? '#6c8296'); gl.addColorStop(1, W8);
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = o.frame ?? '#eeeeea';
  const n = o.panes ?? 2;
  for (let i = 1; i < n; i++) g.fillRect(x + (w * i) / n - 2, y, 4, h);
  g.fillRect(x, y + h * 0.35, w, 3);
  if (o.bars) { g.fillStyle = '#2b2b2b'; for (let xx = x + 8; xx < x + w; xx += 12) g.fillRect(xx, y, 2, h); }
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x - 5, y + h + 5, w + 10, 4);
};
const st = (bay: number, draw: (g: CanvasRenderingContext2D) => void): Style => ({ bay, up: [], ground: [], draw });
const PLAZA_CREAM = '#efe4c9', ORANGE = '#e8622c';
/** the plaza's ground shops: light blue grille doors, a sign band over each (Pair 5) */
const PLAZA_SHOPS = st(3.4, (g) => {
  render(g, PLAZA_CREAM);
  win(g, 70, 70, 116, 110, { panes: 3, bars: true });
  g.fillStyle = '#d3cdbd'; g.fillRect(0, 256, 256, 256);
  g.fillStyle = '#273038'; g.fillRect(14, 330, 228, 182);
  g.fillStyle = '#8fc0d6'; for (let x = 18; x < 240; x += 9) g.fillRect(x, 334, 3, 178);
  g.fillStyle = '#7aaecb'; for (let y = 340; y < 512; y += 40) g.fillRect(14, y, 228, 3);
  const bands = ['#1f5fae', '#c62f2f', '#f2f2ee', '#2e8b4a', '#e7c21f'];
  g.fillStyle = bands[0]; g.fillRect(0, 270, 256, 50);
  g.fillStyle = '#f4f1e8'; g.fillRect(40, 288, 176, 12);
});
/** the gallery's back wall: office doors and windows behind the railing */
const PLAZA_GALLERY = st(3.4, (g) => {
  render(g, PLAZA_CREAM);
  for (const y0 of [0, 256]) {
    g.fillStyle = '#5a4a3c'; g.fillRect(30, y0 + 60, 64, 196);
    g.fillStyle = '#3d3229'; g.fillRect(36, y0 + 66, 52, 190);
    win(g, 130, y0 + 80, 96, 90, { panes: 2 });
  }
});
/** the enclosed top floor: discrete white-framed windows (Pairs 5, 6) */
const PLAZA_TOP = st(3.2, (g) => {
  render(g, PLAZA_CREAM);
  for (const y0 of [0, 256]) win(g, 76, y0 + 64, 104, 104, { panes: 3 });
});
const PLAZA_SIDE = st(4.2, (g) => { render(g, PLAZA_CREAM); for (const y0 of [0, 256]) win(g, 90, y0 + 70, 76, 90, { panes: 2 }); });
const PLAZA_BLANK = st(5, (g) => render(g, PLAZA_CREAM));

/** the sign shop: pink-cream upper wall with white-framed paired windows; brown roller shutters below (Pairs 10, 11) */
const SIGN_UP = st(3.0, (g) => {
  render(g, '#ecc9bd');
  win(g, 60, 66, 60, 100, { panes: 1, frame: '#f6f4ef' }); win(g, 136, 66, 60, 100, { panes: 1, frame: '#f6f4ef' });
  g.fillStyle = '#c99a8b'; g.fillRect(0, 256, 256, 256);
  g.fillStyle = '#6a3f2c'; g.fillRect(16, 300, 224, 212);
  g.fillStyle = '#8a5638'; for (let y = 304; y < 512; y += 9) g.fillRect(16, y, 224, 4);
  g.fillStyle = '#d9d2c4'; g.fillRect(40, 360, 46, 64); g.fillStyle = '#c64232'; g.fillRect(44, 366, 38, 26);
});
const SIGN_BACK = st(3.2, (g) => {
  render(g, '#ece3cf');
  win(g, 80, 60, 96, 110, { panes: 2, frame: '#6b4a33', glass: '#5d5348' });
  g.fillStyle = '#cfc5b0'; g.fillRect(0, 256, 256, 256);
  g.fillStyle = '#5f6266'; g.fillRect(24, 300, 208, 212);
  g.fillStyle = '#7b7f84'; for (let y = 304; y < 512; y += 9) g.fillRect(24, y, 208, 4);
});
/** the larger neighbour east of the forecourt (Pair 8): cream middle floor, the blue top floor, shops below */
const NEIGH_MID = st(3.2, (g) => {
  render(g, '#efe6d2');
  win(g, 70, 64, 116, 100, { panes: 3 });
  g.fillStyle = '#c8c1b2'; g.fillRect(0, 256, 256, 256);
  g.fillStyle = '#2d3136'; g.fillRect(20, 300, 216, 212);
  g.fillStyle = '#a8adb1'; g.fillRect(20, 300, 216, 90);
  g.fillStyle = ['#c62f2f', '#1f5fae', '#2e8b4a'][1]; g.fillRect(0, 266, 256, 28);
});
const NEIGH_TOP = st(3.2, (g) => { render(g, '#86b4d6'); win(g, 70, 64, 116, 100, { panes: 3 }); g.fillStyle = '#86b4d6'; g.fillRect(0, 256, 256, 256); });

/** the ALPHA LED shop's low yellow wing: gridded windows (Pair 9) */
const ALPHA_WING = st(3.0, (g) => {
  render(g, '#e9c95a');
  g.fillStyle = '#e9c95a'; g.fillRect(0, 256, 256, 256);
  g.fillStyle = '#f2efe6'; g.fillRect(52, 306, 152, 126);
  g.fillStyle = '#3b4650'; g.fillRect(58, 312, 140, 114);
  g.fillStyle = '#f2efe6'; for (let x = 58; x < 198; x += 23) g.fillRect(x, 312, 3, 114); for (let y = 312; y < 426; y += 19) g.fillRect(58, y, 140, 3);
});
const ALPHA_BODY = st(3.5, (g) => { render(g, '#d9cdb4'); g.fillStyle = '#d9cdb4'; g.fillRect(0, 256, 256, 256); });
/** the low structure south of the plaza: a dark open front behind the grille, plastered back wall (Pair 7) */
const LOW_FRONT = st(3.0, (g) => {
  render(g, '#b8704e');
  g.fillStyle = '#b8704e'; g.fillRect(0, 256, 256, 256);
  g.fillStyle = '#3b2c24'; g.fillRect(20, 300, 216, 212);
  g.fillStyle = '#5a4033'; g.fillRect(30, 320, 90, 192);
});
const LOW_BACK = st(3.0, (g) => { render(g, '#c98b66'); g.fillStyle = '#c98b66'; g.fillRect(0, 256, 256, 256); win(g, 96, 330, 64, 70, { bars: true, frame: '#d8d0c0' }); });

/** Leasafric: white infill between red framing, rectangular windows (Pairs 15, 16) */
const LEASE_UP = st(3.4, (g) => {
  render(g, '#f4f2ee');
  for (const y0 of [0, 256]) {
    g.fillStyle = '#c4232a'; g.fillRect(0, y0, 14, 256); g.fillRect(242, y0, 14, 256); g.fillRect(0, y0 + 236, 256, 20);
    win(g, 60, y0 + 70, 136, 110, { panes: 3, frame: '#f8f8f6', glass: '#7f95a8' });
  }
});
const LEASE_SIDE = st(4.0, (g) => {
  render(g, '#f4f2ee');
  for (const y0 of [0, 256]) {
    g.fillStyle = '#c4232a'; g.fillRect(0, y0, 12, 256); g.fillRect(244, y0, 12, 256); g.fillRect(0, y0 + 236, 256, 20);
    win(g, 74, y0 + 76, 108, 96, { panes: 2, frame: '#f8f8f6', glass: '#7f95a8' });
  }
});

/** Pro Vision: the low stone-faced front structure (Pair 17), its arched window */
const STONE_FACE = st(3.2, (g) => {
  const r = prng(77);
  g.fillStyle = '#5b5047'; g.fillRect(0, 0, 256, 512);
  for (let y = 0; y < 512; y += 22) for (let x = -(y % 44 ? 18 : 0); x < 256; x += 34 + r() * 14) {
    const v = 105 + r() * 50 | 0; g.fillStyle = `rgb(${v + 22},${v + 6},${v - 8})`; g.fillRect(x + 2, y + 2, 30 + r() * 10, 18);
  }
  g.fillStyle = '#2c2a28'; g.fillRect(96, 330, 64, 120);
  g.beginPath(); g.arc(128, 330, 32, Math.PI, 0); g.fill();
  g.fillStyle = '#e8e2d2'; g.fillRect(92, 450, 72, 8);
});
/** the green plaster of Pro Vision's and Diamed's gabled houses: white edging, windows (Pairs 17-19) */
const GREEN_HOUSE = st(3.4, (g) => {
  render(g, '#93c58a');
  for (const y0 of [0, 256]) {
    g.fillStyle = '#93c58a'; g.fillRect(0, y0, 256, 256);
    g.fillStyle = '#f2f0e8'; g.fillRect(0, y0 + 246, 256, 10);
    win(g, 86, y0 + 70, 84, 104, { panes: 2, frame: '#f6f3ea', glass: '#55606a' });
  }
  speck(g, 256, 512, 1500, ['#86b97d', '#9ccf93', '#7fae78'], 9);
});
const GREEN_PLAIN = st(4, (g) => { render(g, '#93c58a'); g.fillStyle = '#93c58a'; g.fillRect(0, 0, 256, 512); speck(g, 256, 512, 1500, ['#86b97d', '#9ccf93'], 11); g.fillStyle = '#f2f0e8'; for (const y0 of [0, 256]) g.fillRect(0, y0 + 246, 256, 10); });
/** the blue neighbour (Pair 20): blue plaster, discrete window groups */
const BLUE_HOUSE = st(3.6, (g) => {
  g.fillStyle = '#8eb4d8'; g.fillRect(0, 0, 256, 512);
  speck(g, 256, 512, 1500, ['#82a9cf', '#9cc0e0', '#7c9fc4'], 13);
  for (const y0 of [0, 256]) { win(g, 80, y0 + 66, 96, 104, { panes: 2, frame: '#f4f4f0', glass: '#4f5d6a' }); g.fillStyle = '#e9eef2'; g.fillRect(0, y0 + 246, 256, 10); }
});

// ======================================================================================================
// small helpers for the models: textured boards, coloured words, plants
// ======================================================================================================
/** a board's face as a picture: draw on a w x h canvas */
export const board = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) => pic(key, w, h, (g) => draw(g, w, h), { rough: 0.6 });
export const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, col: string, weight = 800, align: CanvasTextAlign = 'center', font = 'Sora, system-ui, sans-serif') => {
  g.font = `${weight} ${size}px ${font}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y);
};
/** a word in raised letters, each letter its own colour over a dark outline (3D SIGN SHOP, ALPHA LED) */
function colourWord(k: Kit, word: string, cols: string[], x: number, y: number, z: number, face: number, h: number, depth: number, o: { wide?: number; gap?: number; stroke?: number; outline?: string } = {}) {
  const wide = o.wide ?? 0.8, gap = o.gap ?? 0.35, stroke = o.stroke ?? 0.22, s = h / 1.4;
  const width = word.length * (wide + gap) - gap;
  const dx = Math.cos(face), dz = -Math.sin(face), nx = Math.sin(face), nz = Math.cos(face);
  [...word].forEach((ch, i) => {
    if (ch === ' ') return;
    const u = (i * (wide + gap) + wide / 2 - width / 2) * s;
    const cx = x + dx * u, cz = z + dz * u;
    if (o.outline) letters(k, ch, cx, y, cz, face, h, depth * 0.55, o.outline, { wide, gap, stroke: stroke + 0.14 });
    letters(k, ch, cx + nx * depth * 0.4, y, cz + nz * depth * 0.4, face, h, depth * 0.6, cols[i % cols.length], { wide, gap, stroke });
  });
}
/** a compact tree: a short stem, foliage in irregular clusters reaching low (the median, Pairs 1, 2, 4) */
export function compactTree(leaf: Part[], wood: Part[], O: P2, x: number, z: number, y: number, h: number, w: number, seed: number) {
  const X = x - O[0], Z = z - O[1], r = (i: number) => hash(seed + i * 1.31, seed * 0.43 - i);
  const stem = 0.45 + r(1) * 0.7;
  wood.push([new THREE.CylinderGeometry(0.07 + w * 0.012, 0.11 + w * 0.015, stem + 0.6, 6).translate(X, y + (stem + 0.6) / 2, Z), '#5a4838']);
  // two or three low limbs splitting at the stem's top
  for (let i = 0; i < 3; i++) {
    const a = r(3 + i) * 6.28, L = h * 0.45;
    wood.push([rod([X, y + stem, Z], [X + Math.cos(a) * w * 0.22, y + stem + L, Z + Math.sin(a) * w * 0.22], 0.07), '#56453a']);
  }
  const greens = ['#3f6b2b', '#4a7a31', '#365f26', '#557f36', '#2f5a24', '#5b8a3a'];
  const n = 7 + ((r(9) * 5) | 0);
  for (let i = 0; i < n; i++) {
    const t = i / n, a = r(20 + i) * 6.28, d = (0.15 + r(30 + i) * 0.3) * w;
    const cy = y + stem + 0.25 + (h - stem - 0.4) * (0.25 + r(40 + i) * 0.6), rad = (0.24 + r(50 + i) * 0.16) * w * (1 - t * 0.25);
    leaf.push([new THREE.IcosahedronGeometry(rad, 1).scale(1.1, 0.85, 1.1).translate(X + Math.cos(a) * d, cy, Z + Math.sin(a) * d), greens[(((i + (seed | 0)) % greens.length) + greens.length) % greens.length]]);
  }
  // a skirt of foliage low round the stem
  leaf.push([new THREE.IcosahedronGeometry(w * 0.3, 1).scale(1.3, 0.55, 1.3).translate(X, y + stem + 0.35, Z), '#3a6428']);
  SOLIDS.add(x, z, 0.16);
}
/** a low shrub: two or three clusters (the open stretch, Pairs 13, 14; the planted plots) */
export function shrub(leaf: Part[], O: P2, x: number, z: number, y: number, h: number, seed: number, cols = ['#4e7a32', '#5b8438', '#3f6b2b', '#6a8a3e']) {
  const X = x - O[0], Z = z - O[1], n = 2 + ((hash(seed, 1) * 2) | 0);
  for (let i = 0; i < n; i++) {
    const a = hash(seed, i + 3) * 6.28, d = h * 0.3 * hash(i, seed), rad = h * (0.42 + hash(seed + i, 7) * 0.2);
    leaf.push([new THREE.IcosahedronGeometry(rad, i === 0 ? 1 : 0).scale(1.2, 0.85, 1.2).translate(X + Math.cos(a) * d, y + rad * 0.8, Z + Math.sin(a) * d), cols[(((i + (seed | 0)) % cols.length) + cols.length) % cols.length]]);
  }
}
/** a boundary wall along a line: body, cap and base; its colours; a solid all along (`skip` leaves gates open) */
export function wallLine(c: Part[], O: P2, a: P2, b: P2, h: number, t: number, body: string, cap: string, base = '#77706a', solid = true) {
  const X = (p: P2): P2 => [p[0] - O[0], p[1] - O[1]], A = X(a), B = X(b), y = Math.min(gh(a[0], a[1]), gh(b[0], b[1]));
  c.push([run(A[0], A[1], B[0], B[1], y - 0.3, y + h, t), body]);
  c.push([run(A[0], A[1], B[0], B[1], y + h, y + h + 0.1, t + 0.08), cap]);
  c.push([run(A[0], A[1], B[0], B[1], y - 0.3, y + 0.25, t + 0.06), base]);
  if (solid) wallSolids(a[0], a[1], b[0], b[1], 0.22);
}
/** a point along a line from a to b at t (0..1) */
const lerp2 = (a: P2, b: P2, t: number): P2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** the east frontage line: off metres out from the northbound carriageway's edge, at z */
const eastLine = (z: number, off: number): P2 => [xEast(z) + E_HALF + off, z];
/** a run of wall along the east frontage from z0 to z1, broken into short straight pieces (the road bends a little) */
function frontWall(c: Part[], O: P2, off: number, z0: number, z1: number, h: number, t: number, body: string, cap: string, base?: string) {
  const n = Math.max(1, Math.round((z1 - z0) / 6));
  for (let i = 0; i < n; i++) wallLine(c, O, eastLine(z0 + ((z1 - z0) * i) / n, off), eastLine(z0 + ((z1 - z0) * (i + 1)) / n, off), h, t, body, cap, base);
}

/** the median's planting, south along each run (okplan.ts MEDIAN_RUNS): the plants' places, kinds and sizes (h tall,
 *  w across the crown). Uneven steps, gaps now and then, none on a board's spot; most trees compact with a few larger
 *  crowns; the open stretch shrubs and the odd sapling. Places from a hash, not a survey. */
export interface MedianPlant { x: number; z: number; kind: 'tree' | 'big' | 'sapling' | 'shrub'; h: number; w: number }
export function medianPlan(): MedianPlant[] {
  const out: MedianPlant[] = [];
  for (const r of MEDIAN_RUNS) {
    let z = r.z0 + 3;
    while (z < r.z1 - 3) {
      z += r.kind === 'trees' ? 6 + hash(z, 1.7) * 9 : 5 + hash(z, 2.9) * 8;
      if (z > MEDIAN.gap[0] - 4 && z < MEDIAN.gap[1] + 4) continue;
      const a = xWest(z) + W_HALF + 0.6, o = xEast(z) - E_HALF - 0.6, w = o - a;
      if (Number.isNaN(w) || w < 1.6) continue;
      if (hash(z, 4.4) < (r.kind === 'trees' ? 0.16 : 0.3)) continue;
      if (MEDIAN_BOARDS.some(([bz]) => Math.abs(bz - z) < 3)) continue;
      const x = a + w * (0.3 + hash(z, 3.1) * 0.4);
      if (r.kind === 'trees' && hash(z, 6.6) < 0.68) {
        const big = hash(z, 8.8) < r.big;
        out.push({ x, z, kind: big ? 'big' : 'tree', w: Math.min(w - 0.4, big ? 4.6 + hash(z, 9) * 1.2 : 2.0 + hash(z, 9) * 1.7), h: big ? 5.4 + hash(z, 10) * 1.2 : 2.6 + hash(z, 10) * 1.9 });
      } else if (r.kind === 'open' && hash(z, 7.7) < 0.12) out.push({ x, z, kind: 'sapling', h: 1.7 + hash(z, 3) * 0.6, w: 1.0 });
      else out.push({ x, z, kind: 'shrub', h: 0.5 + hash(z, 11) * (r.kind === 'open' ? 0.7 : 1.0), w: 1.2 });
    }
  }
  return out;
}

// ======================================================================================================
// the corridor: the median, the stadium-side banks, Pair 21's structures, the boards
// ======================================================================================================
const CO: P2 = [990, 1250];
const corridor: Spec = {
  name: 'Okponglo corridor', axis: [1, 0], origin: CO, storey: 3, style: st(3, (g) => render(g, '#ddd')), roofColor: '#888', fascia: '#888', pitch: 0.2,
  blocks: [], keep: [], onGround: true,
  extras: (k) => {
    const b = new Bag(CO), leaf: Part[] = [], wood: Part[] = [], c: Part[] = [], P = new Pics(CO);
    const A = (x: number, z: number): P2 => [x - CO[0], z - CO[1]];

    // ---------- the median's planting ----------
    const MY = 0.16; // the kerbed median's top (labawaleshie.ts)
    for (const pl of medianPlan()) {
      const y = gh(pl.x, pl.z) + MY;
      if (pl.kind === 'tree' || pl.kind === 'big') compactTree(leaf, wood, CO, pl.x, pl.z, y, pl.h, pl.w, pl.z);
      else if (pl.kind === 'sapling') {
        // a sapling with its stake
        compactTree(leaf, wood, CO, pl.x, pl.z, y, pl.h, pl.w, pl.z);
        wood.push([new THREE.CylinderGeometry(0.03, 0.03, 1.8, 5).translate(pl.x - CO[0] + 0.25, y + 0.9, pl.z - CO[1]), '#8a6a48']);
      } else shrub(leaf, CO, pl.x, pl.z, y, pl.h, pl.z);
    }
    // the median's soil: bare patches and worn paths across it, over the grass
    k.meshes.push(Object.assign(new THREE.Mesh(drapeAt(CO, 940, 1060, 905, 1640, 1.0, MY + 0.03, (x, z) => {
      if (z > MEDIAN.gap[0] - 1 && z < MEDIAN.gap[1] + 1) return null;
      const a = xWest(z) + W_HALF + 0.35, o = xEast(z) - E_HALF - 0.35;
      if (Number.isNaN(a) || x < a || x > o) return null;
      // (the owner's soil and grass brief: no worn crossbars, no repeated stamps: bare earth where the grass has worn
      // thin, in irregular patches of two scales, dry olive grass round their edges; the earth a muted dusty red-brown)
      const n = vnoise(x * 0.3, z * 0.09) * 0.7 + vnoise(x * 0.9 + 3.1, z * 0.5) * 0.3, m = vnoise(x * 2, z * 2);
      if (n > 0.64) return [0.52 + m * 0.05, 0.4 + m * 0.04, 0.3];
      if (n > 0.59) return [0.47 + m * 0.04, 0.45, 0.31];
      return null;
    }), groundCover()), { receiveShadow: true, userData: { noCollide: true } }));
    // the boards on the median
    for (const [z, kind] of MEDIAN_BOARDS) {
      const a = xWest(z) + W_HALF, o = xEast(z) - E_HALF, x = (a + o) / 2 + (kind === 'visa' ? -0.6 : kind === 'kfc' ? 0.4 : 0), y = gh(x, z) + MY;
      const [px, pz] = A(x, z);
      if (kind === 'bluePylon') {
        // a tall narrow blue pylon sign, its dark face to the north (Pair 2)
        c.push([box(px - 0.35, px + 0.35, y, y + 4.6, pz - 0.6, pz + 0.6), '#2a5fa8'], [box(px - 0.38, px + 0.38, y + 4.6, y + 4.8, pz - 0.64, pz + 0.64), '#1d4683']);
        c.push([box(px - 0.3, px + 0.3, y + 0.8, y + 4.3, pz - 0.62, pz - 0.6), '#3a3f4a']);
        SOLIDS.add(x, z, 0.6);
      } else if (kind === 'admission') {
        P.wall(board('admission', 64, 256, (g, w, h) => {
          g.fillStyle = '#e9ecef'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f3f7a'; g.fillRect(0, 0, w, 40);
          text(g, 'INSTANT', w / 2, 70, 13, '#1f3f7a'); text(g, 'ADMISSION', w / 2, 92, 10, '#1f3f7a');
          g.fillStyle = '#c8ccd2'; for (let yy = 120; yy < 240; yy += 18) g.fillRect(10, yy, w - 20, 6);
        }), x, z - 0.45, x, z + 0.45, y + 0.5, y + 3.2, 1, 1, 0.22);
        c.push([box(px - 0.2, px + 0.2, y, y + 3.4, pz - 0.5, pz + 0.5), '#b9bec4']);
        SOLIDS.add(x, z, 0.45);
      } else if (kind === 'aframe') {
        // a wooden A-frame stand (Pairs 1, 2)
        for (const s of [-1, 1]) c.push([rod([px - 0.5, y, pz + s * 0.5], [px, y + 1.6, pz + s * 0.45], 0.06), '#7a5a3a'], [rod([px + 0.5, y, pz + s * 0.5], [px, y + 1.6, pz + s * 0.45], 0.06), '#7a5a3a']);
        c.push([box(px - 0.42, px - 0.38, y + 0.6, y + 1.4, pz - 0.45, pz + 0.45), '#8b6b47']);
        SOLIDS.add(x, z, 0.5);
      } else if (kind === 'redBoard') {
        c.push([box(px - 0.06, px + 0.06, y, y + 3.2, pz - 0.05, pz + 0.05), '#6b6f72'], [box(px - 0.08, px + 0.08, y + 1.8, y + 3.3, pz - 0.7, pz + 0.7), '#c23a2e']);
        SOLIDS.add(x, z, 0.2);
      } else if (kind === 'kfc') {
        // the green KFC board on two posts (Pair 14): the brand and the visible line, no prices
        P.wall(board('kfc', 192, 256, (g, w, h) => {
          g.fillStyle = '#2fa95a'; g.fillRect(0, 0, w, h);
          g.fillStyle = '#ffffff'; g.fillRect(8, 8, 60, 20); text(g, 'Bolt Food', 38, 18, 10, '#2fa95a');
          g.fillStyle = '#c8102e'; g.fillRect(w - 46, 6, 38, 38); g.fillStyle = '#fff'; g.fillRect(w - 42, 10, 30, 14); text(g, 'KFC', w - 27, 34, 11, '#fff');
          text(g, 'Get this Colonel Special', w / 2, 66, 12, '#ffffff', 700);
          g.fillStyle = '#f2e6c8'; g.beginPath(); g.ellipse(w / 2, 160, 70, 52, 0, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#c9822f'; g.beginPath(); g.ellipse(w / 2 - 20, 160, 34, 24, 0.3, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#d8462e'; g.fillRect(w / 2 + 14, 132, 30, 50);
          g.fillStyle = '#ffffff'; g.fillRect(14, 222, 44, 22);
        }), x, z - 1.2, x, z + 1.2, y + 1.9, y + 4.6, 1, 1, 0.12);
        for (const dz of [-1.0, 1.0]) { c.push([box(px - 0.06, px + 0.06, y, y + 4.6, pz + dz - 0.06, pz + dz + 0.06), '#d8d8d4']); SOLIDS.add(x, z + dz, 0.15); }
        c.push([box(px - 0.08, px + 0.02, y + 1.85, y + 4.65, pz - 1.25, pz + 1.25), '#e9e9e4']);
      } else if (kind === 'visa') {
        // the visa board on its leaning post (Pair 14)
        P.wall(board('visa', 128, 160, (g, w, h) => {
          g.fillStyle = '#f4f4f6'; g.fillRect(0, 0, w, h);
          for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#b22234'; g.fillRect(20, 14 + i * 9, 88, 9); }
          g.fillStyle = '#3c3b6e'; g.fillRect(20, 14, 38, 36);
          text(g, 'USA VISA', w / 2, 92, 18, '#1d2f6b');
          text(g, 'INTERVIEW DATE', w / 2, 116, 10, '#1d2f6b', 700); text(g, 'ASSISTANCE', w / 2, 130, 10, '#1d2f6b', 700);
        }), x - 0.15, z - 0.8, x + 0.15, z + 0.8, y + 1.5, y + 3.1, 1, 1, 0.1);
        c.push([rod([px, y, pz], [px + 0.05, y + 3.0, pz + 0.12], 0.07), '#53575a']);
        SOLIDS.add(x, z, 0.15);
      }
    }

    // ---------- the banks on the stadium side: stone face, top, planting ----------
    const bankFaceMesh = (bk: Bank) => {
      for (let z = bk.z0 - bk.ends; z < bk.z1 + bk.ends; z += 2) {
        const z2 = Math.min(z + 2, bk.z1 + bk.ends), fa = bankFace(bk, z), fb = bankFace(bk, z2);
        const ha = gh(fa - 0.1, z), hb = gh(fb - 0.1, z2);
        if (Math.max(ha, hb) < 0.12) continue;
        // the rough stone face from below the path's level to the top, a rough lip over it
        // (stood at the foot of the face's slope, which the relief grid's 1 m cells spread over up to a metre, hiding it;
        // a rough lip over the top back to the face)
        const top = Math.max(ha, hb) + 0.1;
        P.wall(RUBBLE(), fb + 1.05, z2, fa + 1.05, z, -0.2, top, 1, Math.max(0.4, top / 1.0), 0);
        const [ax, az] = A(fa, z), [bx, bz] = A(fb, z2);
        c.push([run(ax + 0.55, az, bx + 0.55, bz, top - 0.12, top + 0.04, 1.15), '#7b7368']);
        c.push([run(ax + 0.9, az, bx + 0.9, bz, -0.2, top - 0.1, 0.25), '#5f584f']);
        wallSolids(fa + 0.95, z, fb + 0.95, z2, 0.2);
      }
    };
    bankFaceMesh(BANKS.north); bankFaceMesh(BANKS.south);

    // north (Pair 3): dense varied shrubs, small trees, now and then a taller tree, rough grass between
    {
      const bk = BANKS.north;
      let n = 0;
      for (let i = 0; i < 11000 && n < 3600; i++) {
        // (over the bank and on along the unraised scrub beyond its ends, SCRUB in lbplan.ts)
        const z = SCRUB.z0 + 2 + hash(i, 0.37) * (SCRUB.z1 - SCRUB.z0 - 4), d = 0.5 + Math.pow(hash(0.71, i), 1.25) * (bk.back + 10), x = bankFace(bk, z) - d;
        // (the J.J. Rawlings corridor brief, jjplan.ts: the scrub stops at the yard's enclosure)
        if (Number.isNaN(x) || SOLIDS_NEAR(x, z) || behindYardFence(x, z) || ON_TRAIL(x, z)) continue;
        n++;
        const y = gh(x, z), r = hash(i, 5.3), near = d < 9;
        if (r < (near ? 0.6 : 0.42)) shrub(leaf, CO, x, z, y, 0.5 + Math.pow(hash(i, 6), 1.6) * (near ? 1.3 : 1.1), i, ['#3f6a2a', '#4d7a31', '#5b7f36', '#36602a', '#66803a', '#557331', '#6f8b3c', '#7a8a40']);
        else if (r < 0.955) tuft(b, x, z, 0.6 + hash(i, 9) * 1.1, ['#7d8a44', '#8d9450', '#6b7a3a', '#a39a5a', '#5f7a35'][i % 5], i + 7000);
        else if (r < 0.99) compactTree(leaf, wood, CO, x, z, y, 2.6 + hash(i, 10) * 2.2, 2.0 + hash(i, 11) * 1.8, i);
        else broadleaf(k, leaf, x, z, { h: 4 + hash(i, 12) * 2.5, spread: 4.5 + hash(i, 13) * 3, seed: i, origin: CO, round: true });
      }
      // a power pole and a poster pole at the bank's foot (Pair 3)
      for (const z of [1062, 1096]) {
        const x = bankFace(bk, z) + 0.9, [px, pz] = A(x, z), y = gh(x, z);
        c.push([new THREE.CylinderGeometry(0.12, 0.16, 9, 7).translate(px, y + 4.5, pz), '#a9a69f'], [box(px - 0.9, px + 0.9, y + 8.4, y + 8.5, pz - 0.05, pz + 0.05), '#4f4234']);
        P.wall(board('posters' + z, 64, 192, (g, w, h) => {
          g.fillStyle = '#d8d2c4'; g.fillRect(0, 0, w, h);
          const cols = ['#e7c21f', '#1f5fae', '#f2f2ee', '#c62f2f', '#2e8b4a'];
          for (let j = 0; j < 4; j++) { g.fillStyle = cols[(j + z) % 5]; g.fillRect(6, 8 + j * 46, w - 12, 40); g.fillStyle = '#2a2a2a'; g.fillRect(14, 20 + j * 46, w - 28, 6); }
        }), x + 0.17, z + 0.4, x + 0.17, z - 0.4, y + 1.6, y + 4.4, 1, 1, 0);
        SOLIDS.add(x, z, 0.22);
      }
    }
    // south (Pair 21): rough grass and earth, worn paths, low plants; the structures on it
    {
      const bk = BANKS.south;
      k.meshes.push(Object.assign(new THREE.Mesh(drapeAt(CO, 960, 1030, bk.z0 - bk.ends, bk.z1 + bk.ends, 1.0, 0.04, (x, z) => {
        const d = bankFace(bk, z) - x;
        if (d < 0.25 || d > bk.back + 2) return null;
        const m = vnoise(x * 1.3, z * 1.3), n = vnoise(x * 0.2, z * 0.25);
        // a worn path along the top behind the face, dusty
        if (d > 0.6 && d < 2.0 + vnoise(z * 0.3, 2) * 0.8) return [0.64 + m * 0.05, 0.5 + m * 0.04, 0.36];
        return n > 0.55 ? [0.55 + m * 0.05, 0.44, 0.31] : [0.42 + m * 0.06, 0.48 + m * 0.05, 0.27];
      }), groundCover()), { receiveShadow: true, userData: { noCollide: true } }));
      for (let i = 0; i < 700; i++) {
        const z = bk.z0 + hash(i, 1.9) * (bk.z1 - bk.z0), x = bankFace(bk, z) - 2.4 - hash(2.1, i) * (bk.back - 3);
        if ((z > P21.blue.z0 - 2 && z < P21.cream.z1 + 2 && x > bankFace(bk, z) - 6) || P21.signs.some((s) => Math.abs(s - z) < 1.5)) continue;
        if (hash(i, 4) < 0.85) tuft(b, x, z, 0.4 + hash(i, 5) * 0.7, ['#7d8a44', '#8d9450', '#a39a5a', '#6b7a3a'][i % 4], i + 4000);
        else shrub(leaf, CO, x, z, gh(x, z), 0.5 + hash(i, 6) * 0.6, i);
      }
      // the cream structure: a broad horizontal top, curved ends down to the ground, the grey inset panel
      const cr = P21.cream, cx = bankFace(bk, (cr.z0 + cr.z1) / 2) - cr.back, cy = gh(cx, (cr.z0 + cr.z1) / 2);
      const [qx, q0] = A(cx, cr.z0), [, q1] = A(cx, cr.z1), CREAM = '#ddd6c6';
      // the broad top over the whole length, the curved ends turning down from it to the ground (a quarter ring in
      // profile, its leg standing on the verge), the body between them holding the inset panel
      const R = 1.5, T = 0.45, topY = cy + cr.h, zi0 = q0 + R, zi1 = q1 - R;
      c.push([box(qx - 0.6, qx + 0.6, topY - T, topY, zi0, zi1), CREAM]);
      for (const [zi, s] of [[zi0, -1], [zi1, 1]] as [number, number][]) {
        const sh = new THREE.Shape();
        sh.moveTo(0, topY); sh.absarc(0, topY - R, R, Math.PI / 2, 0, true); sh.lineTo(R, cy); sh.lineTo(R - T, cy); sh.lineTo(R - T, topY - R); sh.absarc(0, topY - R, R - T, 0, Math.PI / 2, false); sh.closePath();
        const g = new THREE.ExtrudeGeometry(sh, { depth: 1.2, bevelEnabled: false, curveSegments: 10 });
        // (the profile's x along z, outward from the body's end; extruded across the structure's depth)
        g.translate(0, 0, -0.6).rotateY(s > 0 ? -Math.PI / 2 : Math.PI / 2);
        c.push([g.translate(qx, 0, zi), CREAM]);
      }
      c.push([box(qx - 0.25, qx + 0.25, cy, topY - T, zi0 - 0.3, zi1 + 0.3), '#d4cdbd']);
      P.wall(board('greyPanel', 256, 96, (g, w, h) => {
        g.fillStyle = '#8c9094'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a7e82'; g.fillRect(6, 6, w - 12, h - 12);
        g.fillStyle = '#e8e6e0'; g.fillRect(40, 30, 30, 36); g.fillRect(180, 24, 24, 30);
      }), cx + 0.27, cr.z0 + R + 0.5, cx + 0.27, cr.z1 - R - 0.5, cy + 0.6, topY - T - 0.35, 1, 1, 0);
      SOLIDS.add(cx, (cr.z0 + cr.z1) / 2, 0.5); wallSolids(cx, cr.z0 + 0.8, cx, cr.z1 - 0.8, 0.45);
      // the blue structure beside it: its own curved profile and an upper panel with graphics
      const bl = P21.blue, bx = bankFace(bk, (bl.z0 + bl.z1) / 2) - bl.back, by = gh(bx, (bl.z0 + bl.z1) / 2);
      const [bpx, b0] = A(bx, bl.z0), [, b1] = A(bx, bl.z1);
      c.push([box(bpx - 0.35, bpx + 0.35, by, by + bl.h, b0 + 0.6, b1), '#2f6db5']);
      {
        const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0, bl.h); sh.absarc(0, bl.h - 1.6, 1.6, Math.PI / 2, Math.PI, false); sh.lineTo(-1.6, 0); sh.closePath();
        const g = new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: false, curveSegments: 10 }).translate(0, 0, -0.35).rotateY(-Math.PI / 2);
        c.push([g.translate(bpx, by, b0 + 0.6), '#2f6db5']);
      }
      P.wall(board('bluePanel', 128, 96, (g, w, h) => {
        g.fillStyle = '#2f6db5'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#e8f1fa'; g.beginPath(); g.arc(40, 48, 28, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#9fc6e8'; g.fillRect(76, 20, 40, 56);
      }), bx + 0.37, bl.z0 + 0.7, bx + 0.37, bl.z1 - 0.1, by + 1.2, by + bl.h - 0.2, 1, 1, 0);
      wallSolids(bx, bl.z0 + 0.4, bx, bl.z1, 0.4);
      // the signboards north of them: different sizes, frames and bases; their faces plain colour fields
      const sizes: [number, number, number, string][] = [[2.0, 2.6, 2.4, '#c8352b'], [1.6, 1.2, 1.6, '#f2f2ee'], [2.6, 1.6, 2.2, '#1f5fae'], [1.2, 1.0, 1.4, '#e7c21f']];
      P21.signs.forEach((z, j) => {
        const [w, h, y0, col] = sizes[j], x = bankFace(bk, z) - 1.6 - (j % 2) * 1.4, y = gh(x, z), [sx, sz] = A(x, z);
        for (const s of [-1, 1]) { c.push([box(sx - 0.05, sx + 0.05, y, y + y0 + h, sz + s * (w / 2 - 0.15) - 0.05, sz + s * (w / 2 - 0.15) + 0.05), '#5d6164']); SOLIDS.add(x, z + s * (w / 2 - 0.15), 0.12); }
        c.push([box(sx - 0.06, sx + 0.04, y + y0, y + y0 + h, sz - w / 2, sz + w / 2), '#e9e9e6']);
        c.push([box(sx + 0.04, sx + 0.08, y + y0 + 0.1, y + y0 + h - 0.1, sz - w / 2 + 0.1, sz + w / 2 - 0.1), col]);
        c.push([box(sx + 0.08, sx + 0.09, y + y0 + h * 0.35, y + y0 + h * 0.5, sz - w / 2 + 0.25, sz + w / 4), col === '#f2f2ee' ? '#c62f2f' : '#f4f1e8']);
      });
      // the street light with its arm over the road
      {
        const z = P21.lamp, x = bankFace(bk, z) - 0.8, y = gh(x, z), [lx, lz] = A(x, z);
        c.push([new THREE.CylinderGeometry(0.08, 0.13, 10, 8).translate(lx, y + 5, lz), '#9da2a6'], [rod([lx, y + 9.8, lz], [lx + 2.6, y + 10.3, lz], 0.08), '#9da2a6'], [box(lx + 2.3, lx + 3.1, y + 10.05, y + 10.25, lz - 0.2, lz + 0.2), '#d7d4cc']);
        SOLIDS.add(x, z, 0.18);
      }
    }

    const wm = new THREE.Mesh(merge([...c, ...wood]), concrete(0.25)); wm.castShadow = true; wm.receiveShadow = true; k.meshes.push(wm);
    b.leaf.push(...leaf);
    b.finish(k, 0.25);
    P.finish(k);
  },
};
/** a spot already taken by something solid (a pole, a board) */
const SOLIDS_NEAR = (x: number, z: number) => SOLIDS.at(x, z, 0.6);
/** the mapped footpaths through the west scrub (the walking path along the avenue: the J.J. Rawlings corridor brief, pair 5):
 *  kept clear of the scrub's plants */
const SCRUB_TRAILS = ROADS.filter((r) => r.cls === 4).map((r) => r.nodes.map((n) => [NODE_XZ[n * 2], NODE_XZ[n * 2 + 1]] as P2)).filter((p) => p.some(([x, z]) => x > 860 && x < 990 && z > 870 && z < 1190));
const ON_TRAIL = (x: number, z: number) => SCRUB_TRAILS.some((p) => p.some((q, i) => { if (!i) return false; const [ax, az] = p[i - 1], dx = q[0] - ax, dz = q[1] - az, f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(ax + dx * f - x, az + dz * f - z) < 1.9; }));

// ======================================================================================================
// the frontage north of La-Bawaleshi Road: First Eye Plaza, the low roofed structure, the ALPHA LED shop
// ======================================================================================================
const NO: P2 = [1022, 1160];
const L = (x: number) => x - NO[0], Lz = (z: number) => z - NO[1];
const blk = (x0: number, x1: number, z0: number, z1: number, floors: number, extra: Partial<Block> = {}): Block => ({ x0: L(x0), x1: L(x1), z0: Lz(z0), z1: Lz(z1), floors, ...extra });
const PS = 3.1;
const yG = 0, yM = PS + 0.4, yT = 2 * PS + 0.4; // the three stacked levels' bases (each block has its own plinth and band)
const p = PLAZA, front = p.front, rec = front + p.recess;
const north: Spec = {
  name: 'First Eye Plaza', axis: [1, 0], origin: NO, storey: PS, style: PLAZA_SIDE, roofColor: '#9a9a96', fascia: ORANGE, pitch: 0.12,
  replaces: [[1018, 1140], [1028, 1163]],
  blocks: [
    // ground floor shops, the gallery recessed behind its columns, the enclosed top floor; the deeper south end
    blk(front, p.back, p.north, p.deepZ, 1, { roof: 'none', y: yG, faces: { x0: PLAZA_SHOPS, z0: PLAZA_SHOPS } }),
    blk(front, p.backDeep, p.deepZ, p.south, 1, { roof: 'none', y: yG, faces: { x0: PLAZA_SHOPS, z1: PLAZA_SIDE } }),
    blk(rec, p.back, p.north, p.deepZ, 1, { roof: 'none', y: yM, faces: { x0: PLAZA_GALLERY } }),
    blk(rec, p.backDeep, p.deepZ, p.south, 1, { roof: 'none', y: yM, faces: { x0: PLAZA_GALLERY } }),
    blk(front, p.back, p.north, p.deepZ, 1, { roof: 'flat', y: yT, faces: { x0: PLAZA_TOP, z0: PLAZA_SIDE } }),
    blk(front, p.backDeep, p.deepZ, p.south, 1, { roof: 'flat', y: yT, faces: { x0: PLAZA_TOP } }),
    // the low structure south of the plaza (Pair 7)
    { ...blk(LOWROOF.x0, LOWROOF.x1, LOWROOF.z0, LOWROOF.z1, 1, { faces: { x0: LOW_FRONT, x1: LOW_BACK, z0: LOW_BACK, z1: LOW_BACK }, roofColor: '#8a3b2a', pitch: 0.28, y: -0.6 }) },
    // the ALPHA LED shop: the display stack and the low yellow wing (Pair 9)
    blk(ALPHA.x0, ALPHA.x1, ALPHA.z0, ALPHA.z1 - ALPHA.recess, 1, { roof: 'none', faces: { z1: ALPHA_BODY, x0: ALPHA_BODY, x1: ALPHA_BODY, z0: ALPHA_BODY } }),
    blk(ALPHA.x0, ALPHA.x1, ALPHA.z0, ALPHA.z1, 1, { roof: 'flat', y: PS + 0.4, faces: { z1: ALPHA_BODY, x0: ALPHA_BODY, x1: ALPHA_BODY, z0: ALPHA_BODY } }),
    blk(ALPHA.wing[0], ALPHA.wing[1], ALPHA.wingZ0, ALPHA.z1, 1, { roof: 'flat', faces: { z1: ALPHA_WING, x1: ALPHA_WING, z0: ALPHA_WING, x0: ALPHA_WING } }),
  ],
  keep: [[L(OK_KEEP[0][0]), L(OK_KEEP[0][1]), Lz(OK_KEEP[0][2]), Lz(OK_KEEP[0][3])], [L(1012), L(1048), Lz(1194), Lz(1216)]],
  extras: (k) => {
    const P = new Pics(NO), c = k.plain, b = new Bag(NO), leaf: Part[] = [];
    const top = yT + k.wallTop(1);
    // ---- the plaza's gallery: its floor slab, the soffit of the top floor over it, columns, railing ----
    for (const [z0, z1] of [[p.north, p.deepZ], [p.deepZ, p.south]]) {
      c.push([box(L(front), L(rec), yM, yM + 0.42, Lz(z0), Lz(z1)), '#d8d0bf'], [box(L(front) - 0.05, L(rec), yT, yT + 0.42, Lz(z0), Lz(z1)), '#d8d0bf']);
    }
    for (let z = p.north + 0.25; z <= p.south - 0.2; z += (p.south - p.north - 0.5) / 12) {
      if (z > p.feature.z0 - 0.3 && z < p.feature.z1 + 0.3) continue;
      c.push([box(L(front), L(front) + 0.4, yM + 0.4, yT, Lz(z) - 0.2, Lz(z) + 0.2), ORANGE]);
    }
    for (const [z0, z1] of [[p.north, p.feature.z0], [p.feature.z1, p.south]]) {
      c.push([box(L(front) + 0.05, L(front) + 0.1, yM + 1.3, yM + 1.36, Lz(z0), Lz(z1)), '#2d3033'], [box(L(front) + 0.05, L(front) + 0.1, yM + 0.75, yM + 0.8, Lz(z0), Lz(z1)), '#2d3033']);
      for (let z = z0 + 0.15; z < z1; z += 0.16) c.push([box(L(front) + 0.06, L(front) + 0.09, yM + 0.42, yM + 1.32, Lz(z) - 0.012, Lz(z) + 0.012), '#3a3d40']);
    }
    // ---- the parapet and its orange band along every face, the roof's water tanks ----
    const ring: P2[] = [[front, p.north], [p.back, p.north], [p.back, p.deepZ], [p.backDeep, p.deepZ], [p.backDeep, p.south], [front, p.south]];
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], bb = ring[(i + 1) % ring.length];
      c.push([run(L(a[0]), Lz(a[1]), L(bb[0]), Lz(bb[1]), top, top + p.parapet, 0.25, 0), PLAZA_CREAM]);
      c.push([run(L(a[0]), Lz(a[1]), L(bb[0]), Lz(bb[1]), top - 0.2, top + p.parapet, 0.32, 0), ORANGE]);
    }
    for (const [x, z] of [[1019, 1134], [1020.5, 1137]] as P2[]) c.push([new THREE.CylinderGeometry(0.75, 0.8, 1.5, 12).translate(L(x), top + 0.95, Lz(z)), '#1b1c1f']);
    // ---- the orange tiled central feature: tile grid, the blue glazed insets, FIRST EYE PLAZA on top ----
    const f = p.feature, fx0 = L(f.x0), fx1 = L(front) + 0.5, fz0 = Lz(f.z0), fz1 = Lz(f.z1);
    const tiles = pic('orangeTiles', 128, 128, (g) => {
      g.fillStyle = '#c24a1f'; g.fillRect(0, 0, 128, 128);
      for (let y = 0; y < 128; y += 32) for (let x = 0; x < 128; x += 32) { g.fillStyle = ['#ea6a33', '#e45f2a', '#ee7238', '#df5a27'][((x + y) / 32) % 4]; g.fillRect(x + 2, y + 2, 28, 28); }
    });
    P.wall(tiles, f.x0, f.z0, f.x0, f.z1, 0, f.top, (f.z1 - f.z0) / 1.0, f.top / 1.0, 0);
    P.wall(tiles, f.x0, f.z1, front + 0.5, f.z1, 0, f.top, (front + 0.5 - f.x0) / 1.0, f.top / 1.0, 0);
    P.wall(tiles, front + 0.5, f.z0, f.x0, f.z0, 0, f.top, (front + 0.5 - f.x0) / 1.0, f.top / 1.0, 0);
    c.push([box(fx0 + 0.02, fx1, f.top - 0.02, f.top, fz0 + 0.02, fz1 - 0.02), '#c94e22']);
    const blueGlass = pic('blueGlass', 64, 64, (g) => {
      g.fillStyle = '#1d3f9e'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#3d66d6'; for (let x = 0; x < 64; x += 16) g.fillRect(x + 2, 2, 12, 60);
      g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(4, 4, 20, 56);
    }, { rough: 0.3 });
    for (const [y0, y1] of [[yM + 1.0, yM + 2.9], [yT + 1.0, yT + 2.9]]) P.wall(blueGlass, f.x0, f.z0 + 0.6, f.x0, f.z1 - 0.6, y0, y1, 3, 1, 0.06);
    c.push([box(fx0 - 0.25, fx0, f.top - 1.0, f.top - 0.35, fz0 - 0.4, fz1 + 0.4), '#f1ece2']);
    letters(k, 'FIRST EYE PLAZA', fx0 - 0.27, f.top - 0.67, (fz0 + fz1) / 2, -Math.PI / 2, 0.42, 0.08, '#7a1d16', { wide: 0.78, gap: 0.32, stroke: 0.2 });
    // ---- the shop signs over the ground shops (colour bands; only the brand the photograph shows legibly) ----
    k.signs.push({ text: 'SAMSUNG', x: L(front) - 0.15, y: 3.05, z: Lz(1139.5), ry: -Math.PI / 2, w: 3.2, colors: ['#1f5fae', '#ffffff'] });
    k.signs.push({ text: 'FRIDAYS LUXURY', x: L(front) - 0.15, y: 3.05, z: Lz(1162.5), ry: -Math.PI / 2, w: 3.4, colors: ['#2a2a2a', '#f1d36b'] });
    k.signs.push({ text: 'EVEREST', x: L(front) - 0.15, y: 3.05, z: Lz(1154.0), ry: -Math.PI / 2, w: 2.4, colors: ['#f4f4f0', '#1f3f7a'] });
    // AC units and the service wires on the north side (Pair 6)
    for (const x of [1014.5, 1017.5, 1020.5]) c.push([box(L(x) - 0.4, L(x) + 0.4, yT + 1.6, yT + 2.15, Lz(p.north) - 0.35, Lz(p.north)), '#e4e4e0']);
    for (const x of [1015.5, 1019.5]) c.push([box(L(x) - 0.4, L(x) + 0.4, yM + 1.6, yM + 2.15, Lz(p.north) - 0.35, Lz(p.north)), '#e4e4e0']);
    // ---- the forecourt: concrete slabs from the kerb to the shops, worn patches; kiosks and canopies at the corner ----
    {
      const rows: [number, number, number][] = [], edge: Part[] = [];
      for (let z = 1112; z <= 1196.01; z += 2) rows.push([z, xEast(z) + E_HALF + 0.3, z < p.north ? 1011.5 : z <= p.south + 0.5 ? front - 0.05 : z < LOWROOF.gz1 + 0.3 ? LOWROOF.grille - 0.15 : ALPHA.x0 - 0.5]);
      strip(k, rows.map(([z, a]) => [L(a), Lz(z)] as P2), rows.map(([z, , o]) => [L(o), Lz(z)] as P2), 0.05, SLABS(), edge, '#b8b3a9', null);
      k.meshes.push(Object.assign(new THREE.Mesh(drapeAt(NO, 996, 1013, 1112, 1196, 0.6, 0.08, (x, z) => {
        if (x < xEast(z) + E_HALF + 0.4 || x > front - 0.2) return null;
        const m = vnoise(x * 1.7, z * 1.7);
        return vnoise(x * 0.25, z * 0.25) > 0.68 ? [0.6 + m * 0.05, 0.5 + m * 0.04, 0.38] : null;
      }), groundCover()), { receiveShadow: true, userData: { noCollide: true } }));
    }
    const kiosk = (x: number, z: number, w: number, d: number, h: number, roof: string, body: string, open = true) => {
      const X0 = L(x - w / 2), X1 = L(x + w / 2), Z0 = Lz(z - d / 2), Z1 = Lz(z + d / 2);
      if (open) {
        for (const [px, pz] of [[X0, Z0], [X1, Z0], [X0, Z1], [X1, Z1]]) c.push([box(px - 0.05, px + 0.05, 0, h, pz - 0.05, pz + 0.05), '#6a6d70']);
        c.push([box(X0 + 0.2, X1 - 0.2, 0, 0.9, Z0 + 0.2, Z1 - 0.2), body]);
      } else c.push([box(X0, X1, 0, h - 0.2, Z0, Z1), body]);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([X0 - 0.3, h + 0.25, Z0 - 0.3, X1 + 0.3, h - 0.15, Z0 - 0.3, X1 + 0.3, h - 0.15, Z1 + 0.3, X0 - 0.3, h + 0.25, Z0 - 0.3, X1 + 0.3, h - 0.15, Z1 + 0.3, X0 - 0.3, h + 0.25, Z1 + 0.3], 3));
      g.computeVertexNormals();
      c.push([g, roof]);
      const g2 = g.clone(); const pos = g2.attributes.position as THREE.BufferAttribute; for (let i = 0; i < pos.count; i += 3) { const ax = pos.getX(i + 1), ay = pos.getY(i + 1), az = pos.getZ(i + 1); pos.setXYZ(i + 1, pos.getX(i + 2), pos.getY(i + 2), pos.getZ(i + 2)); pos.setXYZ(i + 2, ax, ay, az); } g2.computeVertexNormals();
      c.push([g2, roof]);
      SOLIDS.add(x, z, Math.min(w, d) * 0.45);
    };
    kiosk(1004.5, 1121.5, 2.4, 2.0, 2.4, '#4f7d55', '#d9d4c6');
    kiosk(1007.4, 1124.6, 2.6, 2.2, 2.5, '#8a5a3c', '#c8b28c');
    kiosk(1003.8, 1127.6, 1.8, 1.6, 2.2, '#3d6ea8', '#e7c21f', false);
    kiosk(1008.0, 1129.8, 2.2, 1.8, 2.4, '#9aa0a3', '#d0c9b9');
    // the white electrical cabinet at the corner (Pair 6)
    c.push([box(L(1001.2), L(1002.4), 0, 1.3, Lz(1116.5), Lz(1117.3)), '#e2e2de'], [box(L(1001.1), L(1002.5), 1.3, 1.38, Lz(1116.4), Lz(1117.4)), '#cfcfca']);
    SOLIDS.add(1001.8, 1116.9, 0.6);

    // ---- the low structure's roof overhang supports and the grille boundary with its gate (Pair 7) ----
    const g0 = LOWROOF.gz0, g1 = LOWROOF.gz1, gx = L(LOWROOF.grille);
    const grilleRun = (za: number, zb: number, col: string, gate: boolean) => {
      c.push([box(gx - 0.12, gx + 0.12, 0, 0.35, Lz(za), Lz(zb)), '#9c968c']);
      c.push([box(gx - 0.04, gx + 0.04, 2.2, 2.28, Lz(za), Lz(zb)), col], [box(gx - 0.04, gx + 0.04, 0.4, 0.46, Lz(za), Lz(zb)), col]);
      for (let z = za + 0.06; z < zb; z += 0.14) c.push([box(gx - 0.015, gx + 0.015, 0.35, 2.2, Lz(z) - 0.015, Lz(z) + 0.015), col]);
      if (gate) c.push([box(gx - 0.05, gx + 0.05, 0.35, 2.3, Lz((za + zb) / 2) - 0.04, Lz((za + zb) / 2) + 0.04), col]);
      for (let z = za; z <= zb + 0.01; z += gate ? zb - za : 2.5) c.push([box(gx - 0.07, gx + 0.07, 0, 2.4, Lz(Math.min(z, zb)) - 0.07, Lz(Math.min(z, zb)) + 0.07), '#4a3227']);
      wallSolids(LOWROOF.grille, za, LOWROOF.grille, zb, 0.18);
    };
    grilleRun(g0, LOWROOF.gate[0], '#6b3b28', false);
    grilleRun(LOWROOF.gate[0], LOWROOF.gate[1], '#4d2c20', true);
    grilleRun(LOWROOF.gate[1], g1, '#6b3b28', false);
    for (const [za, xa, xb] of [[g0, LOWROOF.grille, p.front + 1], [g1, LOWROOF.grille, ALPHA.x0 - 1]] as [number, number, number][]) {
      c.push([box(L(xa), L(xb), 0, 0.35, Lz(za) - 0.12, Lz(za) + 0.12), '#9c968c'], [box(L(xa), L(xb), 2.2, 2.28, Lz(za) - 0.04, Lz(za) + 0.04), '#6b3b28']);
      for (let x = xa; x < xb; x += 0.14) c.push([box(L(x) - 0.015, L(x) + 0.015, 0.35, 2.2, Lz(za) - 0.015, Lz(za) + 0.015), '#6b3b28']);
      wallSolids(xa, za, xb, za, 0.18);
    }
    // palms and a tree behind the grille (Pair 7)
    for (const [x, z, h] of [[1036.5, 1173.5, 7.5], [1038, 1187, 8.5]] as [number, number, number][]) fanPalm(b, x, z, h, x + z);
    broadleaf(k, leaf, 1040, 1181, { h: 4.5, spread: 6, seed: 1181, origin: NO, round: true });

    // ---- the ALPHA LED shop: the display, its frame, the letters above, the green recessed entrance and its steps ----
    const ax0 = L(ALPHA.x0), ax1 = L(ALPHA.x1), az1 = Lz(ALPHA.z1), atop = PS + 0.4 + k.wallTop(1);
    c.push([box(ax0 + 0.6, ax1 - 0.6, 3.9, atop + 0.3, az1, az1 + 0.25), '#5f6266']);
    c.push([box(ax0 + 0.85, ax1 - 0.85, 4.1, 7.6, az1 + 0.25, az1 + 0.3), '#141619']);
    c.push([box(ax0 + 0.4, ax1 - 0.4, atop + 0.3, atop + 1.45, az1 - 0.1, az1 + 0.12), '#eceae4']);
    colourWord(k, 'ALPHA LED', ['#d8312a', '#e87a1f', '#2e8b4a', '#1f5fae', '#d8312a', '#ffffff', '#d8312a', '#2e8b4a', '#1f5fae'], (ax0 + ax1) / 2, atop + 0.88, az1 + 0.14, 0, 0.82, 0.12, { outline: '#2a2a2a', wide: 0.72, gap: 0.3 });
    // the entrance: the green shopfront at the back of the recess under the upper storey, its reveals and soffit, the sign
    // band, the steps up to it
    const rz = az1 - ALPHA.recess;
    c.push([box(ax0, ax1, PS + 0.4, PS + 0.85, rz, az1), '#cfc4ad']);
    for (const x of [ax0, ax1 - 0.45]) c.push([box(x, x + 0.45, 0, PS + 0.4, rz, az1), '#d9cdb4']);
    P.wall(pic('alphaShop', 128, 96, (g) => {
      g.fillStyle = '#1f6e45'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#7ec4a0'; g.fillRect(8, 30, 52, 60); g.fillRect(68, 30, 52, 60);
      g.fillStyle = '#16181b'; g.fillRect(4, 4, 120, 20); g.fillStyle = '#e43a2a'; for (let x = 10; x < 120; x += 8) g.fillRect(x, 10, 5, 8);
    }), ALPHA.x0 + 0.45, ALPHA.z1 - ALPHA.recess + 0.06, ALPHA.x1 - 0.45, ALPHA.z1 - ALPHA.recess + 0.06, 0.45, PS + 0.35, 1, 1, 0);
    for (let i = 0; i < ALPHA.steps; i++) c.push([box(ax0 + 0.45, ax1 - 0.45, 0, 0.15 * (ALPHA.steps - i), rz + i * 0.42, rz + (i + 1) * 0.42 + (i === ALPHA.steps - 1 ? 0.5 : 0)), '#b9b3a8']);
    // the low wall and the grey shed beside it, the palm behind the wing (Pair 9)
    c.push([box(L(ALPHA.wing[0]) + 0.3, L(ALPHA.wing[1]), 0, 0.9, az1 + 1.6, az1 + 1.85), '#e2c45a']);
    wallSolids(ALPHA.wing[0] + 0.3, ALPHA.z1 + 1.7, ALPHA.wing[1], ALPHA.z1 + 1.7, 0.18);
    c.push([box(L(1019.6), L(1023.3), 0, 2.5, Lz(1199.5), Lz(1205.8)), '#a9adb0'], [box(L(1019.3), L(1023.6), 2.5, 2.62, Lz(1199.2), Lz(1206.2)), '#8e9396']);
    SOLIDS.add(1021.4, 1202.6, 1.6);
    fanPalm(b, 1042.5, 1199.5, 9, 1199);

    b.leaf.push(...leaf);
    b.finish(k, 0.25);
    P.finish(k);
  },
};

// ======================================================================================================
// south of La-Bawaleshi Road: the signed corner shop and its forecourt, the block behind, the neighbour, the green wall
// ======================================================================================================
const SO: P2 = [1031.1, 1245.3];
const SAX: P2 = [0.9937, -0.1123];
const signShop: Spec = {
  name: '3D Sign Shop', axis: SAX, origin: SO, storey: 3.2, style: SIGN_UP, roofColor: '#6b6e70', fascia: '#3a3a3a', pitch: 0.1,
  replaces: [[1037, 1249.5]],
  blocks: [{ x0: 0, x1: 11.57, z0: 0, z1: 9.36, floors: SIGNSHOP.storeys, roof: 'flat' }],
  keep: [[-18, 14, -16, 0]],
  extras: (k) => {
    const c = k.plain, top = k.wallTop(SIGNSHOP.storeys), W = 11.57, D = 9.36;
    // the roof's overhang, its dark edge
    c.push([box(-0.7, W + 0.6, top, top + 0.22, -0.7, D + 0.5), '#cfc9bf'], [box(-0.75, W + 0.65, top - 0.05, top + 0.25, -0.75, -0.65), '#3a3a3a'], [box(-0.75, -0.65, top - 0.05, top + 0.25, -0.75, D + 0.55), '#3a3a3a']);
    // the dark fascia over the shutters on the face to the N4 and the face to the forecourt
    c.push([box(-0.45, -0.02, 3.0, 4.65, -0.45, D), '#1e1f22'], [box(-0.45, W, 3.0, 4.65, -0.45, -0.02), '#1e1f22']);
    // 3D SIGN SHOP: each letter its own colour over a dark outline (Pairs 10, 11; west face, reading north to south)
    colourWord(k, '3D SIGN SHOP', ['#e8442a', '#f5a623', '#000', '#f07f1d', '#f6d32a', '#3fae49', '#2f74c6', '#000', '#e8442a', '#9b3fb5', '#f6d32a', '#2f74c6'], -0.47, 3.85, D / 2, -Math.PI / 2, 1.3, 0.16, { outline: '#101010', wide: 0.62, gap: 0.16, stroke: 0.25 });
    // the confirmed fragment on the face to the forecourt (Pair 8): coloured logo blocks, then 3D SIGNS
    for (let i = 0; i < 4; i++) c.push([box(0.6 + i * 0.75, 1.2 + i * 0.75, 3.4, 4.2, -0.6, -0.47), ['#d8312a', '#2f74c6', '#f6d32a', '#2e8b4a'][i]]);
    colourWord(k, '3D SIGNS', ['#e8442a', '#f5a623', '#000', '#f07f1d', '#f6d32a', '#3fae49', '#2f74c6', '#9b3fb5'], 7.4, 3.8, -0.47, Math.PI, 0.7, 0.12, { outline: '#101010', wide: 0.72, gap: 0.28 });
    // the posters and small advertisements below the fascia
    for (const [z, col] of [[1.2, '#c62f2f'], [5.6, '#f2f2ee'], [7.4, '#e7c21f']] as [number, string][]) c.push([box(-0.06, -0.03, 1.2, 2.4, z, z + 0.9), col]);
  },
};
const BAX: P2 = [0.9926, -0.1211], BO: P2 = [1036.3, 1275.1];
const signBack: Spec = {
  name: 'Sign shop rear block', axis: BAX, origin: BO, storey: 3.2, style: SIGN_BACK, roofColor: '#6b6e70', fascia: '#3a3a3a', pitch: 0.1,
  replaces: [[1039.5, 1265.5]],
  blocks: [{ x0: 0, x1: 8.24, z0: -18.53, z1: 0, floors: SIGNSHOP.back, roof: 'flat' }],
  keep: [],
  extras: (k) => {
    const top = k.wallTop(SIGNSHOP.back);
    for (const [a, b2, c0, d] of [[0, 8.24, -18.53, -18.33], [0, 8.24, -0.2, 0], [0, 0.2, -18.53, 0], [8.04, 8.24, -18.53, 0]]) k.plain.push([box(a, b2, top, top + 0.8, c0, d), '#e2d8c2']);
    k.plain.push([new THREE.CylinderGeometry(0.7, 0.75, 1.5, 12).translate(5, top + 0.8, -12), '#1b1c1f']);
  },
};
// the larger neighbour east of the forecourt, the forecourt, the green wall, the empty frame, the sidewalk
const GO: P2 = [1040, 1290];
const NB = SIGNSHOP.neighbour;
const southFront: Spec = {
  name: 'Okponglo south frontage', axis: [1, 0], origin: GO, storey: 3.2, style: NEIGH_MID, roofColor: '#7c8286', fascia: '#5a5a5a', pitch: 0.1,
  blocks: [
    { x0: NB[0] - GO[0], x1: NB[1] - GO[0], z0: NB[2] - GO[1], z1: NB[3] - GO[1], floors: 2, roof: 'none' },
    { x0: NB[0] - GO[0], x1: NB[1] - GO[0], z0: NB[2] - GO[1], z1: NB[3] - GO[1], floors: 1, roof: 'flat', y: 2 * 3.2 + 0.4, floorStyle: { 0: NEIGH_TOP } },
  ],
  keep: [[1006 - GO[0], 1082 - GO[0], 1226 - GO[1], 1338 - GO[1]]],
  extras: (k) => {
    const c = k.plain, b = new Bag(GO), leaf: Part[] = [], fronds: Part[] = [], trunks: Part[] = [], P = new Pics(GO);
    const X = (x: number) => x - GO[0], Z = (z: number) => z - GO[1];
    // the neighbour's roof frame: an empty steel frame on its roof (Pair 8)
    const nt = 2 * 3.2 + 0.4 + k.wallTop(1);
    for (const dz of [0, 5]) c.push([box(X(NB[0] + 6) - 0.1, X(NB[0] + 6) + 0.1, nt, nt + 5, Z(NB[2] + 3 + dz) - 0.1, Z(NB[2] + 3 + dz) + 0.1), '#7a3a2c']);
    for (const y of [nt + 2.5, nt + 5]) c.push([box(X(NB[0] + 6) - 0.06, X(NB[0] + 6) + 0.06, y - 0.06, y + 0.06, Z(NB[2] + 3), Z(NB[2] + 8)), '#7a3a2c']);
    c.push([box(X(NB[0]) - 0.02, X(NB[1]) + 0.02, nt, nt + 0.7, Z(NB[2]) - 0.02, Z(NB[2]) + 0.18), '#86b4d6']);
    // ---- the forecourt (Pair 8): gravel and compacted soil, the wire-mesh fence with its posts and the open gate ----
    const fc = SIGNSHOP.forecourt;
    k.meshes.push(Object.assign(new THREE.Mesh(drapeAt(GO, fc.x0, fc.x1, fc.z0, fc.z1 + 0.5, 0.5, 0.04, (x, z) => {
      if (x < xEast(z) + E_HALF + 0.3) return null;
      const m = vnoise(x * 3, z * 3), n = vnoise(x * 0.4, z * 0.4);
      return n > 0.6 ? [0.58 + m * 0.05, 0.47 + m * 0.04, 0.35] : [0.6 + m * 0.1, 0.58 + m * 0.09, 0.53 + m * 0.08];
    }), groundCover()), { receiveShadow: true, userData: { noCollide: true } }));
    const mesh = pic('wireMesh', 64, 64, (g) => {
      g.clearRect(0, 0, 64, 64); g.strokeStyle = 'rgba(150,155,158,0.95)'; g.lineWidth = 2;
      for (let i = -64; i < 128; i += 10) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); g.beginPath(); g.moveTo(i, 64); g.lineTo(i + 64, 0); g.stroke(); }
    }, { transparent: true });
    const fence = (a: P2, bb: P2) => {
      const len = Math.hypot(bb[0] - a[0], bb[1] - a[1]), n = Math.max(1, Math.round(len / 2.5));
      for (let i = 0; i <= n; i++) { const q = lerp2(a, bb, i / n); c.push([box(X(q[0]) - 0.04, X(q[0]) + 0.04, 0, 2.1, Z(q[1]) - 0.04, Z(q[1]) + 0.04), '#8d9396']); }
      c.push([run(X(a[0]), Z(a[1]), X(bb[0]), Z(bb[1]), 2.05, 2.1, 0.04), '#8d9396']);
      P.wall(mesh, a[0], a[1], bb[0], bb[1], 0.05, 2.05, len / 0.8, 2.0 / 0.8, 0);
      wallSolids(a[0], a[1], bb[0], bb[1], 0.15);
    };
    const nwX = xEast(fc.z0) + E_HALF + 1.2;
    fence([nwX, fc.z0], [1028.5, fc.z0]);
    fence([1034.5, fc.z0], [fc.x1, fc.z0]);
    fence([nwX, fc.z0], [xEast(fc.z1) + E_HALF + 1.2, fc.z1]);
    // ---- the sidewalk along the frontage: interlocking blocks between the kerb and the walls, a rough verge ----
    const rows: [number, number, number][] = [];
    for (let z = 1258; z <= 1474; z += 2) rows.push([z, xEast(z) + E_HALF + 0.35, xEast(z) + E_HALF + 3.2]);
    const edge: Part[] = [];
    strip(k, rows.map(([z, a]) => [X(a), Z(z)] as P2), rows.map(([z, , o]) => [X(o), Z(z)] as P2), 0.06, pavers('grey'), edge, '#bdb8ae', null);
    if (edge.length) { const e = new THREE.Mesh(merge(edge), concrete(0.2)); e.receiveShadow = true; k.meshes.push(e); }
    k.meshes.push(Object.assign(new THREE.Mesh(drapeAt(GO, 1015, 1065, 1258, 1474, 1.0, 0.04, (x, z) => {
      const d = x - (xEast(z) + E_HALF);
      if (d < 3.3 || d > 4.5) return null;
      const m = vnoise(x * 2, z * 0.7);
      return m > 0.55 ? [0.45, 0.5, 0.28] : [0.58 + m * 0.05, 0.47, 0.34];
    }), groundCover()), { receiveShadow: true, userData: { noCollide: true } }));
    // ---- the long green wall round the planted plot (Pair 12), its return to the block behind the sign shop ----
    const gw = GREENWALL, GREEN = '#8fa58a';
    frontWall(c, GO, gw.off, gw.z0, gw.z1, gw.h, 0.25, GREEN, '#a7b8a2', '#6f7d6b');
    wallLine(c, GO, eastLine(gw.z0, gw.off), [gw.returnTo - 9.8, gw.z0], gw.h, 0.25, GREEN, '#a7b8a2', '#6f7d6b');
    wallLine(c, GO, eastLine(gw.z1, gw.off), [1066, gw.z1], gw.h, 0.25, GREEN, '#a7b8a2', '#6f7d6b');
    // stains along its foot
    P.wall(pic('wallStain', 128, 32, (g) => {
      g.clearRect(0, 0, 128, 32); const r = prng(5);
      for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(70,60,45,${0.15 + r() * 0.25})`; g.fillRect(r() * 128, 10 + r() * 22, 4 + r() * 10, 32); }
    }, { transparent: true }), gw.z0 > 0 ? eastLine(gw.z0, gw.off - 0.14)[0] : 0, gw.z0, eastLine(gw.z1, gw.off - 0.14)[0], gw.z1, -0.05, 0.8, (gw.z1 - gw.z0) / 4, 1, 0);
    // the planted plot behind it: palms and dense varied shrubs, a few trees
    for (let i = 0; i < 420; i++) {
      const z = gw.z0 + 2 + hash(i, 3.3) * (gw.z1 - gw.z0 - 4), x = eastLine(z, gw.off)[0] + 1.5 + hash(1.7, i) * 34;
      if (x > 1078) continue;
      const y = gh(x, z), r = hash(i, 8);
      if (r < 0.07) christmasPalm(fronds, trunks, GO, x, z, 6 + hash(i, 2) * 4, i);
      else if (r < 0.12) fanPalm(b, x, z, 7 + hash(i, 4) * 4, i);
      else if (r < 0.16) compactTree(leaf, trunks, GO, x, z, y, 3.5 + hash(i, 5) * 2.5, 3 + hash(i, 6) * 2, i);
      else if (r < 0.6) shrub(leaf, GO, x, z, y, 0.8 + hash(i, 7) * 1.4, i);
      else tuft(b, x, z, 0.6 + hash(i, 9), ['#7d8a44', '#8d9450', '#6b7a3a'][i % 3], i + 300);
    }
    // ---- the tall empty frame beside the wall (Pairs 12, 13): narrow members, its base; and the poster pillar ----
    {
      const [fx, fz] = eastLine(gw.frame, 3.0), col = '#7a3a2c', w = 4.6, y0 = 6.5, y1 = 11.5, px = X(fx), pz = Z(fz);
      for (const dz of [-w / 2, w / 2]) { c.push([box(px - 0.15, px + 0.15, 0, y1, pz + dz - 0.15, pz + dz + 0.15), col], [box(px - 0.35, px + 0.35, 0, 0.4, pz + dz - 0.35, pz + dz + 0.35), '#9c968c']); SOLIDS.add(fx, fz + dz, 0.35); }
      for (const y of [y0, (y0 + y1) / 2, y1]) c.push([box(px - 0.06, px + 0.06, y - 0.06, y + 0.06, pz - w / 2, pz + w / 2), col]);
      c.push([rod([px, y0, pz - w / 2], [px, y1, pz + w / 2], 0.06), col], [rod([px, y0, pz + w / 2], [px, y1, pz - w / 2], 0.06), col]);
      const [qx, qz] = eastLine(1308, 2.9);
      c.push([box(X(qx) - 0.35, X(qx) + 0.35, 0, 2.3, Z(qz) - 0.35, Z(qz) + 0.35), '#9d9a94']);
      P.wall(board('pillarPosters', 64, 128, (g, w2, h2) => { g.fillStyle = '#cfd2d6'; g.fillRect(0, 0, w2, h2); for (let j = 0; j < 9; j++) { g.fillStyle = ['#f2f2ee', '#dfe6ee', '#e7c21f', '#9fb6d0'][j % 4]; g.fillRect(4 + (j % 2) * 30, 6 + ((j / 2) | 0) * 28, 26, 24); } }), qx - 0.36, qz - 0.35, qx - 0.36, qz + 0.35, 0.3, 2.2, 1, 1, 0);
      SOLIDS.add(qx, qz, 0.45);
    }
    // ---- the lattice mast in the plot behind the wall (Pairs 8, 10-12: placed where the four views' bearings agree) ----
    lattice(c, X(SIGNSHOP.mast[0]), Z(SIGNSHOP.mast[1]), SIGNSHOP.mast[2], true);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) SOLIDS.add(SIGNSHOP.mast[0] + sx * 1.2, SIGNSHOP.mast[1] + sz * 1.2, 0.3);
    // ---- the paired poles and wires in front of the sign shop (Pairs 10, 11) ----
    for (const z of [1247.5, 1253]) {
      const [x] = eastLine(z, 1.4);
      for (const dx of [-0.35, 0.35]) { c.push([new THREE.CylinderGeometry(0.11, 0.15, 9.5, 7).translate(X(x + dx), 4.75, Z(z)), '#6b5844']); SOLIDS.add(x + dx, z, 0.18); }
      c.push([box(X(x) - 1.0, X(x) + 1.0, 8.6, 8.72, Z(z) - 0.06, Z(z) + 0.06), '#4f4234']);
    }
    const rest: Part[] = [...trunks];
    if (rest.length) { const m = new THREE.Mesh(merge(rest), concrete(0.25)); m.castShadow = true; k.meshes.push(m); }
    b.leaf.push(...leaf, ...fronds);
    b.finish(k, 0.25);
    P.finish(k);
  },
};


// ======================================================================================================
// Leasafric, Pro Vision, Diamed and its blue neighbour: the buildings on their outlines (rotated models), then their
// compounds (walls, gates, signs, planting) in one model
// ======================================================================================================
/** the plinth line of a block's first floor (the floor band's height) */
const PL1 = (k: Kit) => k.wallTop(1) - 0.4;
const LAX: P2 = [0.9825, -0.1865], LO: P2 = [1059.0, 1354.8];
const leasafric: Spec = {
  name: 'Leasafric Ghana', axis: LAX, origin: LO, storey: 3.4, style: LEASE_SIDE, roofColor: '#5f8a5a', fascia: '#f4f2ee', pitch: 0.2,
  replaces: [[1068, 1365]],
  blocks: [
    { x0: 0, x1: 13.94, z0: 0, z1: 21.5, floors: 2, faces: { x0: LEASE_UP } },
    { x0: 13.94, x1: 16.94, z0: 6.85, z1: 24.29, floors: 2 },
    { x0: 5.67, x1: 13.94, z0: 21.5, z1: 24.29, floors: 2 },
  ],
  keep: [],
  extras: (k) => {
    const c = k.plain, top = k.wallTop(2), P = new Pics([0, 0]);
    // the red framing: corner posts, the floor band round the front, the red band under the eaves
    for (const [x, z] of [[0, 0], [13.94, 0], [0, 21.5], [16.94, 24.29], [5.67, 24.29], [5.67, 21.5]] as P2[]) c.push([box(x - 0.3, x + 0.3, 0, top, z - 0.3, z + 0.3), '#c4232a']);
    c.push([box(-0.12, 0.05, PL1(k), PL1(k) + 0.45, 0, 21.5), '#c4232a'], [box(-0.12, 13.94, PL1(k), PL1(k) + 0.45, -0.12, 0.05), '#c4232a'], [box(5.67, 16.94, PL1(k), PL1(k) + 0.45, 24.24, 24.41), '#c4232a']);
    c.push([box(-0.35, 0.05, top - 1.1, top, -0.35, 21.85), '#c4232a']);
    // LEASAFRIC GHANA in white raised letters along it (Pair 15)
    letters(k, 'LEASAFRIC GHANA', -0.37, top - 0.55, 10.75, -Math.PI / 2, 0.8, 0.09, '#ffffff', { wide: 0.72, gap: 0.3, stroke: 0.27 });
    // the vehicle advertisements on the upper front and the south side (Pairs 15, 16: "Don't buy it, just lease it")
    const ad = board('leaseAd', 256, 96, (g, w, h) => {
      g.fillStyle = '#c4232a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6);
      text(g, "Don't Buy It,", 62, 34, 16, '#ffffff', 800); text(g, 'JUST LEASE IT.', 62, 58, 14, '#ffe7a0', 800);
      g.fillStyle = '#f2f2f2'; g.beginPath(); g.moveTo(130, 72); g.lineTo(140, 46); g.lineTo(196, 42); g.lineTo(226, 56); g.lineTo(238, 72); g.closePath(); g.fill();
      g.fillStyle = '#1a1a1a'; for (const x of [150, 214]) { g.beginPath(); g.arc(x, 74, 9, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#5b7389'; g.fillRect(150, 48, 50, 10);
    });
    P.wall(ad, -0.16, 2.6, -0.16, 9.8, PL1(k) + 0.6, top - 1.3, 1, 1, 0);
    P.wall(ad, 6.2, 24.45, 15.8, 24.45, PL1(k) + 0.6, top - 1.3, 1, 1, 0);
    // AC units on the south side (Pair 16)
    for (const x of [8.5, 11.5, 14.2]) c.push([box(x - 0.45, x + 0.45, 1.8, 2.4, 24.3, 24.65), '#e8e8e4']);
    P.finish(k);
  },
};
const PAX: P2 = [0.9746, -0.2239], PO: P2 = [1065.4, 1393.6];
const proVision: Spec = {
  name: 'Pro Vision', axis: PAX, origin: PO, storey: 3.0, style: GREEN_HOUSE, roofColor: '#8e4a33', fascia: '#efe9dc', pitch: 0.42,
  replaces: [[1072, 1400]],
  blocks: [
    // the low stone-faced front structure (Pair 17), its south return
    { x0: 0, x1: 9.55, z0: 0, z1: 22.49, floors: 1, faces: { x0: STONE_FACE, z0: STONE_FACE, z1: STONE_FACE, x1: STONE_FACE }, pitch: 0.36 },
    { x0: 9.55, x1: 13.09, z0: 16.05, z1: 22.49, floors: 1, faces: { x0: STONE_FACE, z0: STONE_FACE, z1: STONE_FACE, x1: STONE_FACE }, roof: 'flat' },
    // the taller green gabled building behind it
    { x0: 9.55, x1: 15.19, z0: 0, z1: 12.0, floors: 2 },
    { x0: 15.19, x1: 30.68, z0: 5.34, z1: 17.41, floors: 2, faces: { z1: GREEN_PLAIN } },
  ],
  keep: [],
  extras: (k) => {
    // the gable over the green building's front: a white-edged pediment under the hip's end
    const c = k.plain, e = k.wallTop(2);
    c.push([box(9.45, 9.6, e - 0.3, e + 0.05, -0.8, 12.8), '#efe9dc']);
    c.push([new THREE.CylinderGeometry(0.75, 0.8, 1.5, 12).translate(24, e + 1.6, 11), '#1b1c1f']);
  },
};
const DAX: P2 = [0.9944, -0.1056], DO: P2 = [1084.5, 1420.6];
const diamed: Spec = {
  name: 'Diamed', axis: DAX, origin: DO, storey: 3.2, style: GREEN_HOUSE, roofColor: '#8e4a33', fascia: '#f2f0e8', pitch: 0.45,
  replaces: [[1094, 1429]],
  blocks: [
    // the taller green gabled mass (its balcony on the south), the low front volume toward McDan Drive (Pairs 18, 19)
    { x0: 0, x1: 11, z0: 0, z1: 16.4, floors: 2 },
    { x0: 0, x1: 11, z0: 16.4, z1: 18.4, floors: 1, roof: 'none', faces: { x0: GREEN_PLAIN } },
    { x0: 11, x1: 18, z0: 0, z1: 18.4, floors: 1, pitch: 0.4 },
  ],
  keep: [],
  extras: (k) => {
    const c = k.plain, e1 = k.wallTop(1), e2 = k.wallTop(2);
    // the balcony over the south strip: its slab, the railing of cream balusters, the posts, the lean-to roof over it
    c.push([box(0, 11, e1 - 0.2, e1 + 0.05, 16.4, 18.4), '#e9e4d6']);
    for (let x = 0.3; x < 11; x += 0.22) c.push([box(x - 0.05, x + 0.05, e1, e1 + 0.95, 18.25, 18.35), '#e8dcc0']);
    c.push([box(0, 11, e1 + 0.95, e1 + 1.05, 18.2, 18.4), '#c9b996']);
    for (const x of [0.15, 5.5, 10.85]) c.push([box(x - 0.15, x + 0.15, e1, e2, 18.1, 18.4), '#f2f0e8']);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.6, e2 + 0.15, 16.0, 11.6, e2 + 0.15, 16.0, 11.6, e2 - 0.45, 19.1, -0.6, e2 + 0.15, 16.0, 11.6, e2 - 0.45, 19.1, -0.6, e2 - 0.45, 19.1], 3));
    g.computeVertexNormals(); k.roof.quad([-0.6, e2 - 0.45, 19.1], [11.6, e2 - 0.45, 19.1], [11.6, e2 + 0.15, 16.0], [-0.6, e2 + 0.15, 16.0]);
    // DIAMED on a white panel on the tall mass's face to the N4 (Pair 18), the water tank on its roof (Pair 19)
    c.push([box(-0.12, -0.03, e1 + 0.8, e1 + 2.0, 3.5, 12.5), '#f6f6f2']);
    letters(k, 'DIAMED', -0.14, e1 + 1.4, 8.0, -Math.PI / 2, 0.75, 0.07, '#2e7d3c', { wide: 0.8, gap: 0.35, stroke: 0.22 });
    c.push([new THREE.CylinderGeometry(0.8, 0.85, 1.6, 12).translate(6, e2 + 1.5, 7), '#1b1c1f']);
    c.push([box(17.98, 18.4, 1.4, 2.0, 6, 6.9), '#e6e6e2']);
  },
};
const BHX: P2 = [0.9991, -0.0418], BHO: P2 = [1080.8, 1447.2];
const blueHouse: Spec = {
  name: 'Blue house beside Diamed', axis: BHX, origin: BHO, storey: 3.4, style: BLUE_HOUSE, roofColor: '#7a4a36', fascia: '#eef2f5', pitch: 0.45,
  replaces: [[1095, 1456]],
  blocks: [
    { x0: 8, x1: 24, z0: 2, z1: 16, floors: 2 },
    { x0: 0, x1: 8, z0: 3, z1: 15, floors: 1, pitch: 0.4 },
    { x0: 24, x1: 28.7, z0: 0, z1: 5, floors: 1, pitch: 0.4 },
    { x0: 24, x1: 28.7, z0: 12, z1: 18.1, floors: 1, pitch: 0.4 },
  ],
  keep: [],
  extras: (k) => {
    // the rounded projecting balcony to McDan Drive (Pair 20): its curved floor slab, the curved railing, the column, the
    // round canopy over it with its thick rim; all real geometry
    const c = k.plain, e1 = k.wallTop(1), e2 = k.wallTop(2), cx = 24, cz = 9, R = 2.6;
    const half = (r: number, y0: number, y1: number) => new THREE.CylinderGeometry(r, r, y1 - y0, 24, 1, false, 0, Math.PI).translate(cx, (y0 + y1) / 2, cz);
    c.push([half(R, e1 - 0.25, e1 + 0.05), '#eef2f5']);
    c.push([new THREE.CylinderGeometry(R - 0.05, R - 0.05, 1.0, 24, 1, true, 0, Math.PI).translate(cx, e1 + 0.55, cz), '#5b4a3f']);
    for (let i = 0; i <= 14; i++) { const a = (i / 14) * Math.PI, x = cx + Math.sin(a) * (R - 0.1), z = cz + Math.cos(a) * (R - 0.1); c.push([box(x - 0.04, x + 0.04, e1, e1 + 1.05, z - 0.04, z + 0.04), '#3d342e']); }
    c.push([new THREE.CylinderGeometry(0.16, 0.18, e2 - 0.5, 10).translate(cx + R - 0.3, (e2 - 0.5) / 2, cz), '#eef2f5']);
    c.push([half(R + 0.45, e2 - 0.5, e2 - 0.1), '#7fa8d0'], [half(R + 0.3, e2 - 0.1, e2 + 0.05), '#e9eef3']);
    c.push([new THREE.CylinderGeometry(R + 0.47, R + 0.47, 0.42, 24, 1, true, 0, Math.PI).translate(cx, e2 - 0.3, cz), '#6f9cc8']);
    // the upper balcony's door behind it
    c.push([box(cx + 0.02, cx + 0.06, e1 + 0.1, e1 + 2.4, cz - 0.8, cz + 0.8), '#3c3a38']);
  },
};

// ---------- the compounds ----------
const CPO: P2 = [1080, 1420];
const mcdanWall = (z: number): P2 => [mcdanX(z) - 3.1 - DIAMED.mcdanOff, z];
const compounds: Spec = {
  name: 'Leasafric to Diamed compounds', axis: [1, 0], origin: CPO, storey: 3, style: st(3, (g) => render(g, '#ddd')), roofColor: '#888', fascia: '#888', pitch: 0.2,
  blocks: [],
  keep: [[1032 - CPO[0], 1126 - CPO[0], 1330 - CPO[1], 1474 - CPO[1]]],
  extras: (k) => {
    const c = k.plain, b = new Bag(CPO), leaf: Part[] = [], fronds: Part[] = [], trunks: Part[] = [], P = new Pics(CPO);
    const X = (x: number) => x - CPO[0], Z = (z: number) => z - CPO[1];
    const RED = '#c4232a', WHITE = '#f4f3ef';
    // ---------------- Leasafric (Pairs 15, 16) ----------------
    {
      const L0 = LEASAFRIC, off = L0.wallOff;
      // white panels between red posts, red coping; vehicle advertisements on some panels; blank panels left blank
      const adPics = [
        board('leaseWallA', 128, 64, (g, w, h) => { g.fillStyle = '#f2c21a'; g.fillRect(0, 0, w, h); g.fillStyle = '#c4232a'; g.fillRect(0, 0, 40, h); text(g, 'LEASE', 20, 32, 10, '#fff'); g.fillStyle = '#f7f7f7'; g.fillRect(52, 22, 60, 22); g.fillStyle = '#222'; for (const x of [62, 100]) { g.beginPath(); g.arc(x, 46, 6, 0, 7); g.fill(); } }),
        board('leaseWallB', 128, 64, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#c4232a'; g.fillRect(0, h - 14, w, 14); g.fillStyle = '#d9dde2'; g.fillRect(28, 12, 74, 30); g.fillStyle = '#2f5f9e'; g.fillRect(34, 18, 62, 8); }),
        board('leaseWallC', 128, 64, (g, w, h) => { g.fillStyle = '#c4232a'; g.fillRect(0, 0, w, h); text(g, '20% DEPOSIT', 64, 14, 10, '#fff'); g.fillStyle = '#eeeeee'; g.fillRect(30, 26, 70, 24); g.fillStyle = '#222'; for (const x of [42, 88]) { g.beginPath(); g.arc(x, 52, 6, 0, 7); g.fill(); } }),
      ];
      const seg = (z0: number, z1: number, ads: boolean) => {
        const n = Math.max(1, Math.round((z1 - z0) / 2.8));
        for (let i = 0; i < n; i++) {
          const za = z0 + ((z1 - z0) * i) / n, zb = z0 + ((z1 - z0) * (i + 1)) / n, a = eastLine(za, off), bb = eastLine(zb, off);
          wallLine(c, CPO, a, bb, L0.wallH, 0.22, WHITE, RED, '#9a958c');
          c.push([box(X(a[0]) - 0.2, X(a[0]) + 0.2, 0, L0.wallH + 0.3, Z(a[1]) - 0.2, Z(a[1]) + 0.2), RED]);
          if (ads && i % 2 === 0 && hash(za, 3) < 0.8) P.wall(adPics[i % 3], a[0] - 0.13, za + 0.3, bb[0] - 0.13, zb - 0.3, 0.2, L0.wallH - 0.08, 1, 1, 0);
        }
        const e = eastLine(z1, off); c.push([box(X(e[0]) - 0.2, X(e[0]) + 0.2, 0, L0.wallH + 0.3, Z(e[1]) - 0.2, Z(e[1]) + 0.2), RED]);
      };
      seg(L0.z0, L0.gate[0], false);
      seg(L0.gate[1], L0.z1, true);
      // the black vehicle gate (closed): two leaves in a frame, a solid of its own
      const g0 = eastLine(L0.gate[0], off), g1 = eastLine(L0.gate[1], off);
      c.push([run(X(g0[0]), Z(g0[1]), X(g1[0]), Z(g1[1]), 0.05, 2.0, 0.08), '#1d1e20']);
      for (let t = 0; t <= 1.001; t += 1 / 8) { const q = lerp2(g0, g1, t); c.push([box(X(q[0]) - 0.1, X(q[0]) - 0.04, 0.05, 2.0, Z(q[1]) - 0.03, Z(q[1]) + 0.03), '#2c2d30']); }
      wallSolids(g0[0], g0[1], g1[0], g1[1], 0.2);
      // the tall narrow white branding pylon beside it
      {
        const [px, pz] = eastLine(L0.pylon, off - 1.0);
        c.push([box(X(px) - 0.3, X(px) + 0.3, 0, 6.4, Z(pz) - 0.55, Z(pz) + 0.55), '#f6f6f3'], [box(X(px) - 0.32, X(px) + 0.32, 0.6, 5.0, Z(pz) + 0.1, Z(pz) + 0.3), RED]);
        P.wall(board('leasePylon', 64, 64, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f4f9a'; g.fillRect(14, 8, 36, 36); text(g, 'L', 32, 27, 26, '#fff'); g.fillStyle = RED; g.fillRect(0, 52, w, 8); }), px - 0.33, pz - 0.5, px - 0.33, pz + 0.5, 5.2, 6.3, 1, 1, 0);
        SOLIDS.add(px, pz, 0.6);
      }
      // the side boundaries back to McDan Drive (plain), the blue shade over the car park, palms and clipped shrubs
      wallLine(c, CPO, eastLine(L0.z1, off), mcdanWall(L0.z1), 1.8, 0.2, WHITE, '#d9d6cf');
      {
        const [x0, x1, z0, z1] = [1042, 1049.5, 1335.5, 1343.5];
        for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]] as P2[]) { c.push([box(X(px) - 0.05, X(px) + 0.05, 0, 3.0, Z(pz) - 0.05, Z(pz) + 0.05), '#8a8f92']); SOLIDS.add(px, pz, 0.12); }
        const mx = X((x0 + x1) / 2), mz = Z((z0 + z1) / 2);
        for (const [a, bb] of [[[X(x0), Z(z0)], [X(x1), Z(z0)]], [[X(x1), Z(z0)], [X(x1), Z(z1)]], [[X(x1), Z(z1)], [X(x0), Z(z1)]], [[X(x0), Z(z1)], [X(x0), Z(z0)]]] as [P2, P2][]) {
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute([a[0], 3.0, a[1], bb[0], 3.0, bb[1], mx, 3.9, mz], 3)); g.computeVertexNormals();
          const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute([a[0], 3.0, a[1], mx, 3.9, mz, bb[0], 3.0, bb[1]], 3)); g2.computeVertexNormals();
          c.push([g, '#2f6fb8'], [g2, '#2f6fb8']);
        }
      }
      for (const [x, z, h] of [[1053.5, 1357.5, 8.5], [1054.5, 1366, 9.5], [1056.5, 1374.5, 8], [1049.5, 1381.5, 7]] as [number, number, number][]) christmasPalm(fronds, trunks, CPO, x, z, h, x + z);
      for (let i = 0; i < 18; i++) { const z = L0.gate[1] + 1.5 + i * 1.8; if (z > L0.z1 - 1) break; const [x] = eastLine(z, off + 0.9); shrub(leaf, CPO, x, z, 0, 0.8 + hash(i, 2) * 0.5, i, ['#3f6b2b', '#4a7a31', '#2f5a24']); }
    }
    // ---------------- Pro Vision (Pair 17) ----------------
    {
      const V = PROVISION, off = V.wallOff, CREAM = '#e9e1cd';
      const seg = (z0: number, z1: number) => {
        const n = Math.max(1, Math.round((z1 - z0) / 3));
        for (let i = 0; i < n; i++) {
          const za = z0 + ((z1 - z0) * i) / n, zb = z0 + ((z1 - z0) * (i + 1)) / n, a = eastLine(za, off), bb = eastLine(zb, off);
          wallLine(c, CPO, a, bb, V.wallH, 0.24, CREAM, '#d8cfb8', '#a59c88');
          // the dark security fence over the wall
          for (let t = 0.1; t < 1; t += 0.1) { const q = lerp2(a, bb, t); c.push([box(X(q[0]) - 0.015, X(q[0]) + 0.015, V.wallH + 0.1, V.wallH + 0.95, Z(q[1]) - 0.015, Z(q[1]) + 0.015), '#1f2022']); }
          c.push([run(X(a[0]), Z(a[1]), X(bb[0]), Z(bb[1]), V.wallH + 0.88, V.wallH + 0.94, 0.04), '#1f2022']);
        }
        for (const z of [z0, z1]) { const e = eastLine(z, off); c.push([box(X(e[0]) - 0.28, X(e[0]) + 0.28, 0, V.wallH + 0.5, Z(e[1]) - 0.28, Z(e[1]) + 0.28), CREAM], [box(X(e[0]) - 0.34, X(e[0]) + 0.34, V.wallH + 0.5, V.wallH + 0.62, Z(e[1]) - 0.34, Z(e[1]) + 0.34), '#d8cfb8']); }
      };
      seg(V.z0, V.gate[0]);
      seg(V.gate[1], V.z1);
      // the gold-toned ornate gate: bars rising to an arch, scrolls, the middle seam
      const g0 = eastLine(V.gate[0], off), g1 = eastLine(V.gate[1], off), GOLD = '#a8843c';
      for (let t = 0.03; t < 1; t += 0.045) {
        const q = lerp2(g0, g1, t), h = 2.0 + Math.sin(t * Math.PI) * 0.45;
        c.push([box(X(q[0]) - 0.02, X(q[0]) + 0.02, 0.05, h, Z(q[1]) - 0.02, Z(q[1]) + 0.02), GOLD]);
      }
      for (const y of [0.3, 1.0, 1.7]) c.push([run(X(g0[0]), Z(g0[1]), X(g1[0]), Z(g1[1]), y, y + 0.07, 0.05), GOLD]);
      for (let t = 0.1; t < 1; t += 0.2) { const q = lerp2(g0, g1, t); c.push([new THREE.TorusGeometry(0.16, 0.025, 4, 10).rotateY(Math.PI / 2).translate(X(q[0]), 1.35, Z(q[1])), GOLD]); }
      wallSolids(g0[0], g0[1], g1[0], g1[1], 0.2);
      // the freestanding Pro Vision Consultants Limited board at the gate, on its two posts (fine print not copied)
      {
        const zc = V.gate[1] + 1.4, [bx] = eastLine(zc, off - 1.1);
        for (const dz of [-0.85, 0.85]) { c.push([box(X(bx) - 0.06, X(bx) + 0.06, 0, 3.6, Z(zc + dz) - 0.06, Z(zc + dz) + 0.06), '#d9d9d6']); SOLIDS.add(bx, zc + dz, 0.12); }
        c.push([box(X(bx) - 0.04, X(bx) + 0.06, 1.3, 3.6, Z(zc) - 1.05, Z(zc) + 1.05), '#e8e8e6']);
        P.wall(board('proVision', 128, 144, (g, w, h) => {
          g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
          g.fillStyle = '#1f4f9a'; g.beginPath(); g.arc(18, 22, 12, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(18, 22, 6, 0, Math.PI * 2); g.fill();
          g.save(); g.transform(1, 0, -0.2, 1, 0, 0); text(g, 'Pro Vision', 74, 20, 20, '#1d2f6b', 700, 'center', 'Georgia, serif'); g.restore();
          text(g, 'Consultants Limited', 70, 40, 10, '#1d2f6b', 600, 'center', 'Georgia, serif');
          g.fillStyle = '#c3c8cf'; for (let y = 60; y < 130; y += 10) g.fillRect(14, y, 70 + ((y * 7) % 30), 3);
          g.fillStyle = '#c62f2f'; g.fillRect(96, 124, 24, 12);
        }), bx - 0.07, zc - 1.0, bx - 0.07, zc + 1.0, 1.35, 3.55, 1, 1, 0);
      }
      // the continuous flowerbed along the wall's foot; palms and the tall slender conifer inside
      for (let z = V.gate[1] + 2.8; z < V.z1 - 0.5; z += 0.7) {
        const [x] = eastLine(z, off - 0.55);
        shrub(leaf, CPO, x, z, 0, 0.45 + hash(z, 1) * 0.35, z * 10, hash(z, 4) < 0.5 ? ['#c8283a', '#3f6b2b', '#e05a7a'] : ['#3f6b2b', '#d63c3c', '#4a7a31']);
      }
      for (const [x, z, h] of [[1058, 1400, 8], [1061, 1411.5, 9], [1087, 1395.5, 7.5]] as [number, number, number][]) christmasPalm(fronds, trunks, CPO, x, z, h, x * 3 + z);
      {
        const [x, z] = [1093.5, 1416.0], X0 = X(x), Z0 = Z(z);
        trunks.push([new THREE.CylinderGeometry(0.14, 0.3, 17, 7).translate(X0, 8.5, Z0), '#5d4a3a']);
        for (let j = 0; j < 9; j++) { const y = 4 + j * 1.45, r = 2.0 - j * 0.18; leaf.push([new THREE.CylinderGeometry(r * 0.2, r, 0.9, 9).translate(X0, y, Z0), j % 2 ? '#2e5a2c' : '#376a33']); }
        SOLIDS.add(x, z, 0.35);
      }
      // the lane north of it and its boundary back to McDan Drive
      wallLine(c, CPO, eastLine(V.z0, off), [1064, V.z0], V.wallH, 0.24, CREAM, '#d8cfb8');
      wallLine(c, CPO, [1081.5, V.z0 - 0.4], mcdanWall(V.z0 - 0.4), V.wallH, 0.24, CREAM, '#d8cfb8');
    }
    // ---------------- Diamed (Pairs 18, 19) and the blue neighbour (Pairs 18, 20) ----------------
    {
      const D = DIAMED, off = D.wallOff, GREEN = '#86bf7c';
      // the wall to the N4: white and green, the white ornate gate at its north end, the long banner on its face
      const n4 = (z0: number, z1: number, body: string, cap: string, h: number) => frontWall(c, CPO, off, z0, z1, h, 0.24, body, cap, '#8f8a80');
      n4(PROVISION.z1, D.n4Gate[0], '#f0efe8', GREEN, 2.0);
      n4(D.n4Gate[1], D.split, '#f0efe8', GREEN, 2.0);
      {
        const g0 = eastLine(D.n4Gate[0], off), g1 = eastLine(D.n4Gate[1], off);
        for (let t = 0.04; t < 1; t += 0.06) { const q = lerp2(g0, g1, t); c.push([box(X(q[0]) - 0.025, X(q[0]) + 0.025, 0.05, 2.1, Z(q[1]) - 0.025, Z(q[1]) + 0.025), '#dcdcd8']); }
        for (const y of [0.4, 1.2, 2.0]) c.push([run(X(g0[0]), Z(g0[1]), X(g1[0]), Z(g1[1]), y, y + 0.08, 0.06), '#e8e8e4']);
        for (const q of [g0, g1]) c.push([box(X(q[0]) - 0.32, X(q[0]) + 0.32, 0, 2.6, Z(q[1]) - 0.32, Z(q[1]) + 0.32), '#f2f2ee']);
        wallSolids(g0[0], g0[1], g1[0], g1[1], 0.2);
      }
      const ba = eastLine(D.banner[0], off - 0.14), bb = eastLine(D.banner[1], off - 0.14);
      P.wall(board('fibroid', 512, 48, (g, w, h) => {
        g.fillStyle = '#2f8a3f'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8f3e4'; g.fillRect(0, 0, w, 3); g.fillRect(0, h - 3, w, 3);
        g.fillStyle = '#f0d9c8'; g.beginPath(); g.arc(22, 24, 18, 0, 7); g.fill();
        text(g, 'FIBROID', 92, 30, 20, '#ffffff', 900);
        for (let i = 0; i < 9; i++) { g.fillStyle = ['#d9e9f5', '#f5e1d0', '#e9eef2'][i % 3]; g.beginPath(); g.arc(160 + i * 26, 30, 11, 0, 7); g.fill(); g.fillStyle = '#5a4a3a'; g.beginPath(); g.arc(160 + i * 26, 27, 5, 0, 7); g.fill(); }
        text(g, 'REHABILITATION', 416, 13, 13, '#ffffff', 900);
        for (let i = 0; i < 6; i++) { g.fillStyle = '#e9eef2'; g.beginPath(); g.arc(372 + i * 22, 33, 9, 0, 7); g.fill(); }
      }), ba[0], ba[1], bb[0], bb[1], 0.35, 1.95, 1, 1, 0);
      // the DIAMED board on its frame behind the wall (Pair 18)
      {
        const z = 1431.5, [x] = eastLine(z, off + 2.2);
        for (const dz of [-1.6, 1.6]) { c.push([box(X(x) - 0.05, X(x) + 0.05, 0, 4.4, Z(z + dz) - 0.05, Z(z + dz) + 0.05), '#d9d9d6']); SOLIDS.add(x, z + dz, 0.12); }
        P.wall(board('diamedBoard', 128, 32, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); text(g, 'DIAMED', w / 2, 17, 22, '#2e7d3c', 900); }), x - 0.06, z - 1.8, x - 0.06, z + 1.8, 3.4, 4.3, 1, 1, 0);
      }
      // the wall to McDan Drive: green panels with white angular outlines, white posts, the metal fence portions, razor
      // wire, the white entrance posts with their globe lamps at the open drive (Pair 19)
      const deco = pic('diamedDeco', 128, 64, (g) => {
        g.fillStyle = '#8cc17f'; g.fillRect(0, 0, 128, 64);
        g.strokeStyle = '#f6f6f2'; g.lineWidth = 6;
        for (const x0 of [8, 72]) { g.beginPath(); g.moveTo(x0, 6); g.lineTo(x0 + 24, 58); g.lineTo(x0 + 48, 6); g.stroke(); g.beginPath(); g.moveTo(x0 + 12, 6); g.lineTo(x0 + 24, 34); g.lineTo(x0 + 36, 6); g.stroke(); }
        g.fillStyle = '#f6f6f2'; g.fillRect(0, 0, 4, 64); g.fillRect(124, 0, 4, 64);
      });
      const mcRun = (z0: number, z1: number, h: number, pic0: THREE.Material | null, body: string, wire: boolean) => {
        const n = Math.max(1, Math.round((z1 - z0) / 2.6));
        for (let i = 0; i < n; i++) {
          const za = z0 + ((z1 - z0) * i) / n, zb = z0 + ((z1 - z0) * (i + 1)) / n, a = mcdanWall(za), bb2 = mcdanWall(zb);
          wallLine(c, CPO, a, bb2, h, 0.24, body, '#f2f2ee', '#8f8a80');
          if (pic0) P.wall(pic0, bb2[0] + 0.13, zb, a[0] + 0.13, za, 0.2, h - 0.05, 1, 1, 0);
          c.push([box(X(a[0]) - 0.25, X(a[0]) + 0.25, 0, h + 0.3, Z(za) - 0.25, Z(za) + 0.25), body === GREEN ? '#f4f4f0' : body]);
          if (wire) for (let t = 0.05; t < 1; t += 0.1) { const q = lerp2(a, bb2, t); c.push([new THREE.TorusGeometry(0.2, 0.012, 3, 10).rotateY(Math.PI / 2 + 0.35).translate(X(q[0]), h + 0.5, Z(q[1])), '#9aa0a4']); }
        }
      };
      mcRun(PROVISION.z1, D.gate[0], 1.7, deco, GREEN, true);
      mcRun(D.gate[1], D.split, 1.7, deco, GREEN, true);
      for (const z of [D.gate[0], D.gate[1]]) {
        const [x] = mcdanWall(z);
        c.push([box(X(x) - 0.35, X(x) + 0.35, 0, 2.5, Z(z) - 0.35, Z(z) + 0.35), '#f6f6f2'], [new THREE.SphereGeometry(0.32, 12, 8).translate(X(x), 2.85, Z(z)), '#f8f8f4']);
        SOLIDS.add(x, z, 0.45);
      }
      // the white metal fence portions over the green wall
      for (let z = PROVISION.z1 + 0.3; z < D.split; z += 0.25) { if (z > D.gate[0] - 0.3 && z < D.gate[1] + 0.3) continue; const [x] = mcdanWall(z); c.push([box(X(x) - 0.012, X(x) + 0.012, 1.8, 2.35, Z(z) - 0.012, Z(z) + 0.012), '#ecece8']); }
      // the hexagonal paving of the drive from McDan Drive in (Pair 19)
      const hex = pic('hexPaving', 128, 128, (g) => {
        g.fillStyle = '#6c6a66'; g.fillRect(0, 0, 128, 128);
        for (let row = -1; row < 6; row++) for (let col = -1; col < 6; col++) {
          const cx = col * 28 + (row % 2 ? 14 : 0), cy = row * 24;
          g.fillStyle = ['#9d9a93', '#a7a39b', '#938f88'][(row + col + 6) % 3];
          g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; g.lineTo(cx + Math.cos(a) * 13, cy + Math.sin(a) * 13); } g.closePath(); g.fill();
        }
      }, { rough: 0.95 });
      const [mx] = mcdanWall((D.gate[0] + D.gate[1]) / 2);
      P.floor(hex, 1100.5, mcdanX((D.gate[0] + D.gate[1]) / 2) - 3.0, D.gate[0] - 0.4, D.gate[1] + 0.4, 0.05, 6, 2);
      void mx;
      // the McDan Drive board: blue, the white H, the name and the line the photograph shows
      {
        const z = D.gate[1] + 1.2, [x] = mcdanWall(z);
        const bx = x + 1.4;
        c.push([box(X(bx) - 0.07, X(bx) + 0.07, 0, 3.2, Z(z) - 0.07, Z(z) + 0.07), '#1f4f9a']);
        P.wall(board('diamedMcdan', 64, 160, (g, w, h) => {
          g.fillStyle = '#1f4f9a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2f6fa'; g.fillRect(4, 4, w - 8, h - 8);
          g.fillStyle = '#c62f2f'; g.beginPath(); g.arc(w / 2, 18, 11, 0, 7); g.fill(); text(g, 'H', w / 2, 19, 13, '#fff');
          text(g, 'ALTERNATIVE', w / 2, 40, 7, '#1d2f6b'); text(g, 'MEDICINE', w / 2, 49, 7, '#1d2f6b'); text(g, 'SPECIALIST', w / 2, 58, 7, '#1d2f6b'); text(g, 'HOSPITAL', w / 2, 67, 7, '#1d2f6b');
          g.fillStyle = '#2e8b4a'; g.fillRect(8, 78, w - 16, h - 88); text(g, 'DIAMED', w / 2, 90, 9, '#fff');
          g.fillStyle = '#e9d9c4'; g.beginPath(); g.arc(w / 2 + 8, 128, 14, 0, 7); g.fill();
        }), bx + 0.08, z + 0.6, bx + 0.08, z - 0.6, 0.6, 3.1, 1, 1, 0);
        SOLIDS.add(bx, z, 0.15);
      }
      // the tree screening the balcony, the narrow tall tree by the N4 wall, the grass and soil verge (Pairs 18, 19)
      broadleaf(k, leaf, 1104.5, 1440.5, { h: 4.5, spread: 5, seed: 1440, origin: CPO, round: true });
      {
        const [x, z] = [1058.5, 1444.5], X0 = X(x), Z0 = Z(z);
        trunks.push([new THREE.CylinderGeometry(0.12, 0.22, 6, 7).translate(X0, 3, Z0), '#5d4a3a']);
        for (let j = 0; j < 7; j++) leaf.push([new THREE.IcosahedronGeometry(0.62 - j * 0.04, 1).scale(1, 2.2, 1).translate(X0 + (hash(j, 1) - 0.5) * 0.3, 3 + j * 1.7, Z0), j % 2 ? '#2c5428' : '#355f2c']);
        SOLIDS.add(x, z, 0.3);
      }
      // the divider between the two plots, white on Diamed's side
      wallLine(c, CPO, eastLine(D.split, off), [D.splitGap[0], D.split], 2.0, 0.24, '#f0efe8', GREEN);
      wallLine(c, CPO, [D.splitGap[1], D.split], mcdanWall(D.split), 2.0, 0.24, '#f0efe8', GREEN);
      wallLine(c, CPO, eastLine(PROVISION.z1, off), mcdanWall(PROVISION.z1), 2.0, 0.24, '#e9e1cd', '#d8cfb8');
      // ---- the blue neighbour: the high blue wall with its pillars, the black gate, razor wire; the wall to the N4 ----
      const BLUE = '#8cb3d9';
      mcRun(D.split, D.blueGate[0], 2.6, null, BLUE, true);
      mcRun(D.blueGate[1], D.z1, 2.6, null, BLUE, true);
      {
        const g0 = mcdanWall(D.blueGate[0]), g1 = mcdanWall(D.blueGate[1]);
        c.push([run(X(g0[0]), Z(g0[1]), X(g1[0]), Z(g1[1]), 0.05, 2.5, 0.08), '#17181a']);
        for (const t of [0, 0.5, 1]) { const q = lerp2(g0, g1, t); c.push([box(X(q[0]) - 0.06, X(q[0]) + 0.06, 0.05, 2.55, Z(q[1]) - 0.05, Z(q[1]) + 0.05), '#2b2c2f']); }
        for (const [t0, t1] of [[0.05, 0.45], [0.55, 0.95]]) { const a = lerp2(g0, g1, t0), bq = lerp2(g0, g1, t1); c.push([rod([X(a[0]) + 0.06, 0.4, Z(a[1])], [X(bq[0]) + 0.06, 2.1, Z(bq[1])], 0.05), '#2b2c2f'], [rod([X(a[0]) + 0.06, 2.1, Z(a[1])], [X(bq[0]) + 0.06, 0.4, Z(bq[1])], 0.05), '#2b2c2f']); }
        for (const q of [g0, g1]) c.push([box(X(q[0]) - 0.4, X(q[0]) + 0.4, 0, 2.9, Z(q[1]) - 0.4, Z(q[1]) + 0.4), BLUE]);
        wallSolids(g0[0], g0[1], g1[0], g1[1], 0.2);
      }
      n4(D.split, D.blueN4Gate[0], BLUE, '#eef2f5', 2.2);
      n4(D.blueN4Gate[1], D.z1, BLUE, '#eef2f5', 2.2);
      {
        const g0 = eastLine(D.blueN4Gate[0], off), g1 = eastLine(D.blueN4Gate[1], off);
        c.push([run(X(g0[0]), Z(g0[1]), X(g1[0]), Z(g1[1]), 0.05, 2.2, 0.08), '#1f2023']);
        wallSolids(g0[0], g0[1], g1[0], g1[1], 0.2);
      }
      wallLine(c, CPO, eastLine(D.z1, off), mcdanWall(D.z1), 2.2, 0.24, BLUE, '#eef2f5');
      // banana plants and shrubs inside the blue wall (Pair 20)
      const banana = (x: number, z: number, h: number, seed: number) => {
        const X0 = X(x), Z0 = Z(z);
        trunks.push([new THREE.CylinderGeometry(0.12, 0.18, h * 0.6, 7).translate(X0, h * 0.3, Z0), '#6f8a42']);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + hash(seed, i), L = h * 0.55;
          const blade = new THREE.PlaneGeometry(0.55, L).translate(0, L / 2, 0).rotateX(-0.9 - hash(i, seed) * 0.4).rotateY(a).translate(X0, h * 0.55, Z0);
          leaf.push([blade, i % 2 ? '#5a9a3a' : '#4c8a32']);
        }
        SOLIDS.add(x, z, 0.2);
      };
      for (const [x, z] of [[1111.5, 1449], [1110, 1461.5], [1112, 1467], [1108, 1470.5], [1100.5, 1468.5]] as P2[]) banana(x, z, 3.2 + hash(x, z) * 1.2, x + z);
      for (let i = 0; i < 10; i++) { const z = D.split + 1 + i * 2.6; const [x] = mcdanWall(z); shrub(leaf, CPO, x - 1.2, z, 0, 0.9 + hash(i, 3) * 0.9, i + 50); }
      // outside the blue wall on McDan Drive: the grass bank and the broken segmented concrete drain edge, the drive's
      // worn paving down to the road (Pair 20)
      for (let z = D.split; z < D.z1; z += 1.1) {
        if (z > D.blueGate[0] - 0.6 && z < D.blueGate[1] + 0.6) continue;
        const x = mcdanX(z) - 3.1 - 0.35, tilt = (hash(z, 5) - 0.5) * 0.25;
        c.push([box(-0.12, 0.12, -0.1, 0.22, -0.48, 0.48).rotateX(tilt).translate(X(x), 0, Z(z)), '#b9b5ad']);
      }
      k.meshes.push(Object.assign(new THREE.Mesh(drapeAt(CPO, 1100, 1125, PROVISION.z1, D.z1, 0.6, 0.05, (x, z) => {
        const w = mcdanWall(z)[0], e = mcdanX(z) - 3.1;
        if (x < w + 0.2 || x > e - 0.2) return null;
        const m = vnoise(x * 2, z * 2);
        if (z > D.blueGate[0] - 0.4 && z < D.blueGate[1] + 0.4) return [0.62 + m * 0.06, 0.48 + m * 0.04, 0.36];
        if (z > D.gate[0] - 0.4 && z < D.gate[1] + 0.4) return null;
        return m > 0.7 ? [0.6, 0.48, 0.35] : [0.36 + m * 0.06, 0.52 + m * 0.05, 0.25];
      }), groundCover()), { receiveShadow: true, userData: { noCollide: true } }));
    }
    const m = new THREE.Mesh(merge(trunks), concrete(0.25)); m.castShadow = true; k.meshes.push(m);
    b.leaf.push(...leaf, ...fronds);
    b.finish(k, 0.25);
    P.finish(k);
  },
};

void OK_OUTLINES; void SLABS; void PL1;

export const okpongloSite = createSite('okponglo', [corridor, north, signShop, signBack, southFront, leasafric, proVision, diamed, blueHouse, compounds]);
