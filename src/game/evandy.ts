// Evandy Hostel (the owner's Evandy brief, docs/evandy/; numbers in evandyplan.ts):
// - the wings on their mapped outlines, each separately: light cream walls with warm ochre pilaster strips, recessed
//   balcony modules with real slabs, solid lower walls and dark patterned railings, narrow louvred windows, open
//   gallery elevations toward the inner courts, red perforated-brick ventilation panels on the stair ends, terracotta
//   hipped roofs with small gables and arched recesses over selected balcony modules;
// - the main entrance bay between the frontage pair: paired ochre columns, three bands of gold-framed glazing with
//   outward-opening awning panes, the peaked pediment with its arch and UG EVANDY HALL, MAIN BLOCK over the recessed
//   door, shallow steps;
// - the pink-roof courtyard ring (affiliation unresolved), plain, round its open court;
// - the two-storey commercial block facing the road: central gabled arch, cream columns, the open upper gallery with
//   its light gold railing, shopfronts with grilles;
// - the frontage: the circular-pattern paving over the whole compound, oval kerbed planting islands, the fence (low
//   pale wall, square posts, dark vertical bars with pointed tops), the gatehouse, the swing gate, the notice shelter,
//   the EVANDY HOSTEL sign; the west yard's gravel and green basketball slab with its hoop; red-earth patches;
// - the environs: the unfinished open frame and its red-earth yard to the north, the sandy field and scrub to the east.
import * as THREE from 'three';
import { createSite, render, slab, window_, type Kit, type Spec, type Style } from './blocks';
import { box, canvas, speckle, tri2, type Part } from './modelkit';
import { SOLIDS } from './solids';
import { wallSolids } from './enkit';
import { BUILDINGS, ROADS, NODE_XZ } from './campusmap';
import { coverOverlay, crownTiles, hash2, vnoise2, type Crown } from './scrubkit';
import { mergeMeshes, mergedSite, prism, strip, type P2, type R4 } from './medkit';
import {
  ENTRY, FIELD, FRAME, GATEHOUSE, ISLANDS, PARKS, RED_YARD, RING, SCRUB, SHELTER, SHOPS, SIGN, SITE, TREES, WINGS, YARD, fit, type Wing,
} from './evandyplan';

const ST = 3.2, CREAM = '#efe6d2', CREAM_D = '#e3d6bb', OCHRE = '#d6ad55', RAIL = '#2b2622', GOLD = '#c9a85a';
const top = (floors: number) => 0.4 + floors * ST + 0.4;

// ---------- facades ----------
const wall = (g: CanvasRenderingContext2D, base = CREAM) => { render(g, base); speckle(g, 0, 0, 256, 512, 900, ['#e9dfca', '#f3ebd9', '#e5dac3']); };
/** a narrow louvred window: dark glass with thin horizontal slats in a pale frame */
const louvred = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = 'rgba(90,75,55,0.35)'; g.fillRect(x - 5, y - 5, w + 10, h + 10);
  g.fillStyle = '#f6efe0'; g.fillRect(x - 3, y - 3, w + 6, h + 6);
  g.fillStyle = '#2b3036'; g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(190,200,205,0.35)'; for (let t = y + 3; t < y + h; t += 7) g.fillRect(x + 1, t, w - 2, 2);
  g.fillStyle = '#f6efe0'; g.fillRect(x + w / 2 - 1, y, 2, h);
};
const pilaster = (g: CanvasRenderingContext2D, ochre: boolean) => { g.fillStyle = ochre ? OCHRE : CREAM_D; g.fillRect(0, 0, 13, 512); g.fillStyle = 'rgba(80,60,30,0.25)'; g.fillRect(13, 0, 2, 512); };
/** the balcony module: pilaster, a narrow window, the deep recess (room glazing behind) the geometry fronts */
const front = (ochre: boolean): Style => ({
  bay: 7.8, up: [[26, 60, 30, 120], [96, 50, 120, 150]], ground: [[26, 60, 30, 120], [96, 60, 130, 120]],
  draw: (g) => {
    wall(g); pilaster(g, ochre);
    for (const y0 of [0, 256]) louvred(g, 26, y0 + 60, 30, 120);
    // upper: the recess, dark shade with doors and windows behind
    g.fillStyle = '#6f675a'; g.fillRect(74, 14, 168, 226); g.fillStyle = '#4a443b'; g.fillRect(74, 14, 168, 40);
    window_(g, [96, 60, 70, 130], '#efe6d2', 2, 0.3); window_(g, [176, 70, 52, 110], '#efe6d2', 1, 0.3);
    // ground: under each balcony pair, two windows either side of the central dividing wall (R03: the fins run to the
    // ground)
    louvred(g, 86, 256 + 70, 62, 120); louvred(g, 172, 256 + 70, 62, 120);
    slab(g, 236, 20);
  },
});
const FRONT_O = front(true), FRONT = front(false);
/** the open corridor / gallery elevation: deep shade, doors behind, horizontal rails */
const GALLERY: Style = {
  bay: 3.4, up: [[60, 60, 60, 140]], ground: [[60, 60, 60, 140]],
  draw: (g) => {
    wall(g);
    for (const y0 of [0, 256]) {
      g.fillStyle = '#5c554a'; g.fillRect(18, y0 + 24, 220, 200); g.fillStyle = '#3e3932'; g.fillRect(18, y0 + 24, 220, 30);
      g.fillStyle = '#d9cfba'; g.fillRect(70, y0 + 70, 46, 150); g.fillStyle = '#2f343a'; g.fillRect(150, y0 + 90, 60, 70);
      g.fillStyle = '#efe6d2'; g.fillRect(18, y0 + 150, 220, 10); g.fillRect(18, y0 + 186, 220, 6); g.fillRect(18, y0 + 214, 220, 10);
      g.fillStyle = '#efe6d2'; g.fillRect(0, y0, 18, 256); g.fillRect(238, y0, 18, 256);
    }
    slab(g, 236, 20);
  },
};
/** red perforated-brick ventilation panels between pale piers (R04) */
const VENT: Style = {
  bay: 3, up: [], ground: [],
  draw: (g) => {
    wall(g);
    for (const y0 of [0, 256]) {
      g.fillStyle = '#a5523a'; g.fillRect(60, y0 + 30, 136, 190);
      for (let y = y0 + 34; y < y0 + 216; y += 12) for (let x = 64; x < 192; x += 12) { g.fillStyle = '#3d1f18'; g.fillRect(x, y, 7, 7); }
    }
    slab(g, 236, 20);
  },
};
/** the wings' plain ends and plain elevations: cream, regular windows */
const PLAIN: Style = {
  bay: 3.4, up: [[86, 70, 84, 110]], ground: [[86, 70, 84, 110]],
  draw: (g) => { wall(g); for (const y0 of [0, 256]) window_(g, [86, y0 + 70, 84, 110], '#f6efe0', 2, 0.3); g.fillStyle = 'rgba(160,110,80,0.35)'; g.fillRect(0, 0, 8, 512); slab(g, 236, 20); },
};
const END: Style = {
  bay: 3, up: [[110, 80, 36, 100]], ground: [[110, 80, 36, 100]],
  draw: (g) => { wall(g); for (const y0 of [0, 256]) louvred(g, 110, y0 + 80, 36, 100); slab(g, 236, 20); },
};
const styleOf = (k: Wing['south'] | Wing['ends'], ochre: boolean) => (k === 'balcony' ? (ochre ? FRONT_O : FRONT) : k === 'gallery' ? GALLERY : k === 'vent' ? VENT : k === 'plain' ? PLAIN : END);

// ---------- materials ----------
let DISC: THREE.MeshStandardMaterial | null = null;
/** the signature paving: large grey-beige discs about 0.9 m across, slightly irregular, in reddish-tan joint (6 m a
 *  tile) */
const discMat = () => (DISC ??= new THREE.MeshStandardMaterial({ roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, map: canvas(256, 256, (g) => {
  g.fillStyle = '#8c5f4b'; g.fillRect(0, 0, 256, 256); speckle(g, 0, 0, 256, 256, 1600, ['#835846', '#976a55', '#7d5443']);
  let s = 7; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let j = -1; j < 8; j++) for (let i = -1; i < 7; i++) {
    const x = i * 42.7 + (j % 2) * 21.3 + (r() - 0.5) * 4, y = j * 37 + (r() - 0.5) * 4, rr = 18.5 + r() * 2, t = 128 + ((r() * 28) | 0);
    for (const [dx, dy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) {
      g.fillStyle = `rgb(${t},${t - 4},${t - 12})`; g.beginPath(); g.ellipse(x + dx, y + dy, rr, rr * 0.96, r() * 3, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.arc(x + dx - 4, y + dy - 4, rr * 0.5, 0, Math.PI * 2); g.fill();
    }
  }
}) }));
let GRAVEL: THREE.MeshStandardMaterial | null = null;
const gravelMat = () => (GRAVEL ??= new THREE.MeshStandardMaterial({ roughness: 1, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, map: canvas(128, 128, (g) => {
  g.fillStyle = '#8d9094'; g.fillRect(0, 0, 128, 128); speckle(g, 0, 0, 128, 128, 5000, ['#a3a6aa', '#6e7175', '#b6b8bb', '#7d8084', '#9a8f86']);
}) }));
let SOIL: THREE.MeshStandardMaterial | null = null;
const soilMat = () => (SOIL ??= new THREE.MeshStandardMaterial({ roughness: 1, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, map: canvas(64, 64, (g) => { g.fillStyle = '#8e5238'; g.fillRect(0, 0, 64, 64); speckle(g, 0, 0, 64, 64, 600, ['#844a32', '#9c5d3e', '#a98470']); }) }));
let SLAB: THREE.MeshStandardMaterial | null = null;
const slabMat = () => (SLAB ??= new THREE.MeshStandardMaterial({ color: '#3f9a8c', roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5 }));

/** a flat world-coordinate plane over a polygon (the site frames below are world-aligned: origin 0, axis [1, 0]) */
function flatPlane(k: Kit, pts: P2[], y: number, mat: THREE.Material, tile: number) {
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)))).rotateX(-Math.PI / 2).translate(0, y, 0);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / tile, p.getZ(i) / tile);
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.userData.noCollide = true; k.meshes.push(m);
}
const oval = (c: P2, a: number, b: number, n = 24): P2[] => Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return [c[0] + Math.cos(t) * a, c[1] + Math.sin(t) * b]; });

// ---------- a wing ----------
/** the balcony bays on a long face (R03, R08, P03): each bay a PAIR of recessed balconies divided by a central wall;
 *  that wall and the two side walls run from the ground to the eaves, standing out as deep as the balconies, so that
 *  on the ground floor they frame two windows; each balcony a slab with a solid lower wall and a dark patterned railing
 *  above it; on the top floor an arch over each balcony. The bay is the facade texture's: the recess spans 0.29-0.95. */
function balconies(k: Kit, x0: number, x1: number, z: number, out: 1 | -1, floors: number, gables: boolean, ochre: boolean) {
  const len = x1 - x0, n = Math.max(1, Math.round(len / 7.8)), b = len / n, parts: Part[] = [], d = 1.1, tf = 0.4 + floors * ST;
  for (let i = 0; i < n; i++) {
    const a0 = x0 + i * b + b * 0.29, a1 = x0 + i * b + b * 0.95, am = (a0 + a1) / 2, zf = z + out * d, zm = Math.min(z, zf), zM = Math.max(z, zf);
    // the side walls and the central dividing wall, ground to eaves
    for (const [ax, w] of [[a0, 0.14], [a1, 0.14], [am, 0.13]] as [number, number][]) parts.push([box(ax - w, ax + w, 0, tf, zm, zM), CREAM_D]);
    for (const [h0, h1] of [[a0 + 0.14, am - 0.13], [am + 0.13, a1 - 0.14]] as P2[]) {
      for (let f = 1; f < floors; f++) {
        const y = 0.4 + f * ST;
        parts.push([box(h0, h1, y - 0.18, y, zm, zM), CREAM]);
        // the solid lower wall, then the railing on it: rails, uprights and a run of crossed bars
        parts.push([box(h0, h1, y, y + 0.42, zf - out * 0.07 - 0.07, zf - out * 0.07 + 0.07), CREAM]);
        parts.push([box(h0, h1, y + 1.0, y + 1.04, zf - 0.03, zf + 0.03), RAIL], [box(h0, h1, y + 0.44, y + 0.47, zf - 0.03, zf + 0.03), RAIL]);
        for (let x = h0 + 0.2; x < h1 - 0.1; x += 0.42) {
          parts.push([box(x - 0.015, x + 0.015, y + 0.47, y + 1.0, zf - 0.02, zf + 0.02), RAIL]);
          parts.push([new THREE.BoxGeometry(0.02, 0.34, 0.02).rotateZ(0.6).translate(x + 0.21, y + 0.74, zf), RAIL], [new THREE.BoxGeometry(0.02, 0.34, 0.02).rotateZ(-0.6).translate(x + 0.21, y + 0.74, zf), RAIL]);
        }
      }
      // the arch over the top floor's balcony: a solid head with a half-round opening
      const yt = 0.4 + (floors - 1) * ST, w = h1 - h0, r = w / 2, ya = tf - 0.25 - r;
      const head = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(-w / 2, tf - 0.2 - ya), new THREE.Vector2(w / 2, tf - 0.2 - ya), new THREE.Vector2(w / 2, 0)]);
      head.holes.push(new THREE.Path().absarc(0, 0, r - 0.02, 0, Math.PI, false));
      parts.push([new THREE.ExtrudeGeometry(head, { depth: 0.18, bevelEnabled: false }).translate((h0 + h1) / 2, ya, zf - (out > 0 ? 0.18 : 0)), CREAM]);
      void yt;
    }
    // a small gable over every second bay, its roof running back into the main slope
    if (gables && i % 2 === 0) {
      const t = top(floors), w = (a1 - a0) / 2 + 0.3, xm = am, h = 1.9, zg = z + out * 0.5;
      parts.push([tri2([xm - w, t, zg], [xm + w, t, zg], [xm, t + h, zg]), CREAM], [tri2([xm + w, t, zg], [xm - w, t, zg], [xm, t + h, zg]), CREAM]);
      parts.push([new THREE.CircleGeometry(0.7, 12, 0, Math.PI).rotateY(out > 0 ? 0 : Math.PI).translate(xm, t + 0.25, zg + out * 0.02), ochre ? '#cdb37a' : '#d8ccb2']);
      const back = z - out * 3.2;
      k.roof.quad([xm - w - 0.25, t - 0.05, zg + out * 0.3], [xm - w - 0.25, t - 0.05, back], [xm, t + h + 0.2, back], [xm, t + h + 0.2, zg + out * 0.3]);
      k.roof.quad([xm + w + 0.25, t - 0.05, back], [xm + w + 0.25, t - 0.05, zg + out * 0.3], [xm, t + h + 0.2, zg + out * 0.3], [xm, t + h + 0.2, back]);
    }
  }
  k.plain.push(...parts);
}
let SLOT: THREE.MeshStandardMaterial | null = null;
/** the tall pale strip of the recessed slot: glass blocks in a fine grid (R18, P03, P04) */
const slotMat = () => (SLOT ??= new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvas(32, 256, (g) => {
  g.fillStyle = '#e9ecee'; g.fillRect(0, 0, 32, 256);
  g.fillStyle = 'rgba(150,165,175,0.55)'; for (let y = 0; y < 256; y += 8) g.fillRect(0, y, 32, 1); for (let x = 0; x < 32; x += 8) g.fillRect(x, 0, 1, 256);
}) }));
/** the recessed vertical slot (the owner's purple arrows on R18): a full-height pale glass-block strip set back between
 *  two ochre fins that stand out from the wall face, in the window column of the bay at u (model frame) */
function slot(k: Kit, u: number, z: number, out: 1 | -1, floors: number, ochre: boolean) {
  const tf = 0.4 + floors * ST, w = 1.0, dep = 0.45, col = ochre ? OCHRE : CREAM_D;
  k.plain.push([box(u - w / 2 - 0.3, u - w / 2, 0, tf, Math.min(z, z + out * dep), Math.max(z, z + out * dep)), col], [box(u + w / 2, u + w / 2 + 0.3, 0, tf, Math.min(z, z + out * dep), Math.max(z, z + out * dep)), col]);
  const g = new THREE.PlaneGeometry(w, tf - 0.6).translate(u, (tf - 0.6) / 2 + 0.6, z + out * 0.03);
  if (out < 0) g.rotateY(Math.PI).translate(2 * u, 0, 2 * z);
  const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) * (tf - 0.6) / 8);
  const m = new THREE.Mesh(g, slotMat()); m.receiveShadow = true; m.userData.noCollide = true; k.meshes.push(m);
}
function wingSpec(w: Wing): Spec {
  const f = fit(w.quad), ochre = !!w.ochre;
  const faces = { z1: styleOf(w.south, ochre), z0: styleOf(w.north, ochre), x0: styleOf(w.ends, ochre), x1: styleOf(w.ends, ochre) };
  return {
    name: `Evandy wing ${w.id}`, axis: f.axis, origin: f.c, storey: ST, style: PLAIN, roofColor: w.roof, fascia: '#efe7d6', pitch: 0.42,
    replaces: [f.c],
    blocks: [{ x0: f.x0, x1: f.x1, z0: f.z0, z1: f.z1, floors: w.floors, faces }],
    keep: [],
    extras: (k) => {
      if (w.south === 'balcony') balconies(k, f.x0, f.x1, f.z1, 1, w.floors, !!w.gables, ochre);
      // the recessed slot in the window column of the second bay from the wing's outer end (front-e: east; others: west)
      if (w.slot) { const n = Math.max(1, Math.round((f.x1 - f.x0) / 7.8)), b = (f.x1 - f.x0) / n, u = w.slot === 'x1' ? f.x1 - b + b * 0.13 : f.x0 + b + b * 0.13; slot(k, u, f.z1, 1, w.floors, ochre); }
      if (w.north === 'balcony') balconies(k, f.x0, f.x1, f.z0, -1, w.floors, !!w.gables, ochre);
      // the stacked small balconies on a balcony end (the west stair end, R04)
      if (w.ends === 'balcony') for (let fl = 1; fl < w.floors; fl++) { const y = 0.4 + fl * ST, zm = (f.z0 + f.z1) / 2;
        k.plain.push([box(f.x0 - 1.2, f.x0, y - 0.18, y, zm - 2, zm + 2), CREAM], [box(f.x0 - 1.25, f.x0 - 1.15, y, y + 1.0, zm - 2, zm + 2), RAIL], [box(f.x0 - 1.2, f.x0, y + 0.95, y + 1.0, zm - 2.05, zm - 1.95), RAIL], [box(f.x0 - 1.2, f.x0, y + 0.95, y + 1.0, zm + 1.95, zm + 2.05), RAIL]); }
      // downpipes at the ends of the long faces
      for (const x of [f.x0 + 0.4, f.x1 - 0.4]) for (const z of [f.z0 - 0.12, f.z1 + 0.12]) k.plain.push([new THREE.CylinderGeometry(0.06, 0.06, top(w.floors), 6).translate(x, top(w.floors) / 2, z), '#e4dccb']);
      mergeMeshes(k);
    },
  };
}

// ---------- the main entrance bay ----------
const entrance: Spec = {
  name: 'Evandy main block entrance', axis: [1, 0], origin: ENTRY.c, storey: ST, style: PLAIN, roofColor: '#c4633a', fascia: '#efe7d6', pitch: 0.42,
  blocks: [{ x0: -ENTRY.w / 2, x1: ENTRY.w / 2, z0: -ENTRY.d / 2, z1: ENTRY.d / 2 - 1.5, floors: 4, faces: { z1: END } }],
  keep: [[-5, 5, ENTRY.d / 2 - 1.5, ENTRY.d / 2 + 3]],
  extras: (k) => {
    const z = ENTRY.d / 2, t = top(4), parts: Part[] = [];
    // the paired columns, full height, each side of the glazing (R08: pale; R18, V3: ochre)
    for (const x of [-3.5, -2.85, 2.85, 3.5]) parts.push([new THREE.CylinderGeometry(0.26, 0.28, t, 14).translate(x, t / 2, z - 0.35), OCHRE]);
    // the front wall of the bay above the recessed ground entry: spandrels and the glazing bands, gold mullions
    parts.push([box(-3.2, 3.2, 3.6, t, z - 0.9, z - 0.7), CREAM]);
    for (let f = 1; f < 4; f++) {
      const y = 0.4 + f * ST + 0.4, h = ST - 1.0;
      k.glass.push(box(-2.3, 2.3, y, y + h, z - 0.68, z - 0.62));
      for (let x = -2.3; x <= 2.31; x += 0.92) parts.push([box(x - 0.05, x + 0.05, y, y + h, z - 0.66, z - 0.56), GOLD]);
      for (const yy of [y, y + h / 2, y + h]) parts.push([box(-2.35, 2.35, yy - 0.05, yy + 0.05, z - 0.66, z - 0.56), GOLD]);
      // the outward-opening awning panes across the middle row
      for (let x = -1.84; x <= 1.85; x += 0.92) { const pane = new THREE.BoxGeometry(0.86, h / 2 - 0.1, 0.04).translate(0, -(h / 2 - 0.1) / 2, 0).rotateX(-0.45).translate(x, y + h, z - 0.55); k.glass.push(pane); parts.push([box(x - 0.43, x + 0.43, y + h - 0.04, y + h, z - 0.6, z - 0.52), GOLD]); }
    }
    // the recessed ground entry: dark doors, the MAIN BLOCK sign, the shallow steps and the planters
    parts.push([box(-2.4, 2.4, 0, 0.4, z - 2.5, z), '#d9cdb5'], [box(-2.4, 2.4, 0, 0.2, z, z + 0.6), '#d9cdb5'], [box(-2.4, 2.4, 0, 0.1, z + 0.6, z + 1.2), '#d9cdb5']);
    parts.push([box(-1.6, 1.6, 0.4, 3.0, z - 2.5, z - 2.4), '#2e2a26'], [box(-0.03, 0.03, 0.4, 3.0, z - 2.42, z - 2.36), '#8a7d6a']);
    k.signs.push({ text: 'MAIN BLOCK', x: 0, y: 3.35, z: z - 0.68, ry: 0, w: 2.2, colors: ['#f4f1ea', '#203a78'] });
    for (const x of [-2.1, 2.1]) parts.push([new THREE.CylinderGeometry(0.35, 0.3, 0.5, 12).translate(x, 0.65, z - 0.5), '#b0583a']);
    // the pediment over the column pairs (R08, R03, R18): a pale pentagon (short upright sides, a peak), on it a white
    // semicircular band carrying EVANDY letter by letter along its curve, UG and HALL at the band's two feet, the
    // shaded half-round recess inside the band; drawn as one picture on the pediment's face, the solid behind it
    const pw = 4.1, pu = 1.4, ph = 4.3, zp = z - 0.3;
    const pent = new THREE.Shape([new THREE.Vector2(-pw, 0), new THREE.Vector2(pw, 0), new THREE.Vector2(pw, pu), new THREE.Vector2(0, ph), new THREE.Vector2(-pw, pu)]);
    parts.push([new THREE.ExtrudeGeometry(pent, { depth: 0.6, bevelEnabled: false }).translate(0, t, zp - 0.6), CREAM]);
    parts.push([strip([[-pw - 0.1, zp + 0.06], [pw + 0.1, zp + 0.06]], t - 0.2, t, 0.12), '#f5efe2']);
    { const W = 1024, H = Math.round((1024 * ph) / (2 * pw)), sx = W / (2 * pw), cx = W / 2, by = H - 2;
      const tex = canvas(W, H, (g) => {
        g.clearRect(0, 0, W, H);
        g.beginPath(); g.moveTo(0, by); g.lineTo(W, by); g.lineTo(W, by - pu * sx); g.lineTo(cx, by - ph * sx); g.lineTo(0, by - pu * sx); g.closePath();
        g.fillStyle = '#efe6d2'; g.fill(); g.strokeStyle = '#f7f2e6'; g.lineWidth = 10; g.stroke();
        const R0 = 2.05 * sx, R1 = 2.9 * sx, oy = by - 0.05 * sx;
        g.beginPath(); g.arc(cx, oy, R1, Math.PI, 0); g.arc(cx, oy, R0, 0, Math.PI, true); g.closePath(); g.fillStyle = '#fbf8f1'; g.fill();
        g.lineWidth = 4; g.strokeStyle = 'rgba(150,135,110,0.5)'; g.beginPath(); g.arc(cx, oy, R1, Math.PI, 0); g.stroke(); g.beginPath(); g.arc(cx, oy, R0, Math.PI, 0); g.stroke();
        const gr = g.createLinearGradient(0, oy - R0, 0, oy); gr.addColorStop(0, '#d6c9ad'); gr.addColorStop(1, '#efe6d2');
        g.beginPath(); g.arc(cx, oy, R0 - 6, Math.PI, 0); g.closePath(); g.fillStyle = gr; g.fill();
        g.beginPath(); g.arc(cx, oy, 1.55 * sx, Math.PI, 0); g.strokeStyle = '#f6f0e3'; g.lineWidth = 14; g.stroke();
        g.fillStyle = '#1f4fb0'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 ${Math.round(0.62 * sx)}px Sora, system-ui, sans-serif`;
        const Rm = (R0 + R1) / 2, letters = 'EVANDY';
        letters.split('').forEach((ch, i) => { const a = Math.PI * (0.78 - (i * 0.56) / (letters.length - 1)); g.save(); g.translate(cx + Math.cos(a) * Rm, oy - Math.sin(a) * Rm); g.rotate(Math.PI / 2 - a); g.fillText(ch, 0, 0); g.restore(); });
        g.font = `700 ${Math.round(0.4 * sx)}px Sora, system-ui, sans-serif`;
        for (const [txt, a] of [['UG', Math.PI * 0.91], ['HALL', Math.PI * 0.095]] as [string, number][]) { g.save(); g.translate(cx + Math.cos(a) * Rm, oy - Math.sin(a) * Rm); g.rotate(Math.PI / 2 - a); g.fillText(txt, 0, 0); g.restore(); }
      });
      const face = new THREE.Mesh(new THREE.PlaneGeometry(2 * pw, ph).translate(0, t + ph / 2, zp + 0.02), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5, roughness: 0.85 }));
      face.userData.noCollide = true; k.meshes.push(face); }
    // the column capitals under the pediment
    for (const x of [-3.5, -2.85, 2.85, 3.5]) parts.push([box(x - 0.36, x + 0.36, t - 0.25, t, z - 0.71, z + 0.01), '#f5efe2']);
    k.plain.push(...parts);
    // the bay's outer walls: solid to the bike (it stands between the two mapped wing outlines)
    const [cx, cz] = ENTRY.c, hw = ENTRY.w / 2, hd = ENTRY.d / 2;
    wallSolids(cx - hw, cz + hd - 0.3, cx + hw, cz + hd - 0.3, 0.45);
    wallSolids(cx - hw, cz - hd, cx + hw, cz - hd, 0.45);
    mergeMeshes(k);
  },
};

// ---------- the pink-roof ring ----------
const [ro0, ro1, rz0, rz1] = RING.outer, [rc0, rc1, rcz0, rcz1] = RING.court;
const ring: Spec = {
  name: 'Pink-roof courtyard block by Evandy', axis: [1, 0], origin: [(ro0 + ro1) / 2, (rz0 + rz1) / 2], storey: ST, style: PLAIN, roofColor: RING.roof, fascia: '#efe7d6', pitch: 0.42,
  replaces: [[560, -1290]],
  blocks: (() => {
    const cx = (ro0 + ro1) / 2, cz = (rz0 + rz1) / 2, L = (x: number) => x - cx, M = (z: number) => z - cz;
    return [
      { x0: L(ro0), x1: L(ro1), z0: M(rz0), z1: M(rcz0), floors: RING.floors },
      { x0: L(ro0), x1: L(ro1), z0: M(rcz1), z1: M(rz1), floors: RING.floors },
      { x0: L(ro0), x1: L(rc0), z0: M(rcz0), z1: M(rcz1), floors: RING.floors, roof: 'crossZ' as const },
      { x0: L(rc1), x1: L(ro1), z0: M(rcz0), z1: M(rcz1), floors: RING.floors, roof: 'crossZ' as const },
    ];
  })(),
  keep: [],
  extras: (k) => {
    const cx = (ro0 + ro1) / 2, cz = (rz0 + rz1) / 2;
    flatPlaneLocal(k, [[rc0 - cx, rcz0 - cz], [rc1 - cx, rcz0 - cz], [rc1 - cx, rcz1 - cz], [rc0 - cx, rcz1 - cz]], 0.05, gravelMat(), cx, cz);
    mergeMeshes(k);
  },
};
function flatPlaneLocal(k: Kit, pts: P2[], y: number, mat: THREE.Material, ox: number, oz: number) {
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)))).rotateX(-Math.PI / 2).translate(0, y, 0);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + ox) / 3, (p.getZ(i) + oz) / 3);
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.userData.noCollide = true; k.meshes.push(m);
}

// ---------- the commercial block ----------
const sf = fit(SHOPS.quad);
/** the commercial block's plain sides and back (R11, P05: blank cream walls, no windows) */
const SHOP_BLANK: Style = { bay: 6, up: [], ground: [], draw: (g) => { g.fillStyle = '#efe6d2'; g.fillRect(0, 0, 256, 512); speckle(g, 0, 0, 256, 512, 700, ['#e9dfca', '#f3ebd9']); g.fillStyle = 'rgba(150,130,100,0.25)'; g.fillRect(0, 300, 256, 2); } };
/** its front behind the walkway and the gallery: shopfronts with folding grilles below, the gallery's glazing above */
const SHOP: Style = {
  bay: 4, up: [[30, 40, 196, 170]], ground: [[30, 50, 196, 180]],
  draw: (g) => {
    g.fillStyle = '#f1e2b5'; g.fillRect(0, 0, 256, 512);
    window_(g, [26, 40, 204, 176], '#e9dcc0', 3, 0);
    g.fillStyle = '#37393c'; g.fillRect(26, 300, 204, 196);
    g.fillStyle = '#b39a5e'; for (let x = 30; x < 228; x += 9) g.fillRect(x, 300, 3, 196);
    for (let y = 312; y < 496; y += 30) { g.fillStyle = 'rgba(179,154,94,0.8)'; for (let x = 30; x < 228; x += 18) { g.fillRect(x, y, 9, 2); g.fillRect(x + 9, y + 15, 9, 2); } }
    g.fillStyle = '#efe6d2'; g.fillRect(0, 0, 10, 512); g.fillRect(246, 0, 10, 512);
  },
};
const shops: Spec = {
  name: 'Evandy commercial block', axis: sf.axis, origin: sf.c, storey: 3.3, style: SHOP_BLANK, roofColor: '#c4633a', fascia: '#efe7d6', pitch: 0.45,
  replaces: [sf.c],
  // the ground floor set back 2.4 m behind the walkway; the main roof is built here (gable ends, R11, P05)
  blocks: [{ x0: sf.x0, x1: sf.x1, z0: sf.z0, z1: sf.z1 - 2.4, floors: 2, roof: 'none', faces: { z1: SHOP } }],
  keep: [],
  extras: (k) => {
    const z = sf.z1, zw = sf.z1 - 2.4, y1 = 0.4 + 3.3, t = 0.4 + 2 * 3.3 + 0.4, parts: Part[] = [];
    const Z0 = sf.z0 - 0.7, Z1 = z + 0.9, X0 = sf.x0 - 0.5, X1 = sf.x1 + 0.5, zr = (Z0 + Z1) / 2, rise = ((Z1 - Z0) / 2) * 0.45;
    // the raised walkway with its step, the gallery floor over it (cantilevered: no columns along it, R06, R13)
    parts.push([box(sf.x0, sf.x1, 0, 0.35, zw, z + 0.2), '#cfc2a6'], [box(sf.x0, sf.x1, 0, 0.18, z + 0.2, z + 0.6), '#cfc2a6']);
    parts.push([box(sf.x0, sf.x1, y1 - 0.3, y1, zw, z - 0.55), CREAM]);
    // the gallery's front: a solid white band at the floor, the light gold railing with its looped panels on it
    parts.push([box(sf.x0 + 0.1, sf.x1 - 0.1, y1 - 0.75, y1 + 0.35, z - 0.75, z - 0.55), '#f6f1e6']);
    parts.push([box(sf.x0 + 0.1, sf.x1 - 0.1, y1 + 1.05, y1 + 1.1, z - 0.68, z - 0.62), GOLD], [box(sf.x0 + 0.1, sf.x1 - 0.1, y1 + 0.4, y1 + 0.44, z - 0.68, z - 0.62), GOLD]);
    for (let x = sf.x0 + 0.1; x < sf.x1 - 0.1; x += 1.0) {
      parts.push([box(x - 0.025, x + 0.025, y1 + 0.35, y1 + 1.1, z - 0.68, z - 0.62), GOLD]);
      parts.push([new THREE.BoxGeometry(0.02, 0.85, 0.02).rotateZ(0.88).translate(x + 0.5, y1 + 0.75, z - 0.65), GOLD], [new THREE.BoxGeometry(0.02, 0.85, 0.02).rotateZ(-0.88).translate(x + 0.5, y1 + 0.75, z - 0.65), GOLD]);
      parts.push([new THREE.TorusGeometry(0.13, 0.015, 4, 10).translate(x + 0.5, y1 + 0.75, z - 0.65), GOLD]);
    }
    // the four round cream columns: two pairs at the centre, at the front edge of the walkway, in front of the gallery
    // band and the shopfronts, from the walkway up to the eaves
    for (const x of [-2.45, -1.75, 1.75, 2.45]) {
      parts.push([new THREE.CylinderGeometry(0.21, 0.23, t - 0.35, 14).translate(x, 0.35 + (t - 0.35) / 2, z - 0.1), '#f1e3b8'], [box(x - 0.3, x + 0.3, t - 0.25, t, z - 0.4, z + 0.2), '#f6f1e6']);
      const [wx, wz] = [sf.c[0] + x * sf.axis[0] - (z - 0.1) * sf.axis[1], sf.c[1] + x * sf.axis[1] + (z - 0.1) * sf.axis[0]]; SOLIDS.add(wx, wz, 0.3);
    }
    // the board between the column pairs on the gallery front (R13: a white board with a pink script name)
    k.signs.push({ text: 'Waffle', x: 0, y: y1 + 0.75, z: z - 0.5, ry: 0, w: 2.6, colors: ['#f4f0f2', '#b0336e'] });
    parts.push([box(-1.42, 1.42, y1 + 0.2, y1 + 1.3, z - 0.56, z - 0.52), '#6f6a6e']);
    // the main roof: one long gabled roof parallel to the front, carried out over the gallery; gable walls at the ends
    k.roof.c = new THREE.Color('#c4633a');
    k.roof.quad([X1, t, Z1], [X0, t, Z1], [X0, t + rise, zr], [X1, t + rise, zr]);
    k.roof.quad([X0, t, Z0], [X1, t, Z0], [X1, t + rise, zr], [X0, t + rise, zr]);
    for (const x of [sf.x0, sf.x1]) parts.push([tri2([x, t, sf.z0], [x, t, zw], [x, t + rise * 0.9, zr]), '#efe6d2'], [tri2([x, t, zw], [x, t, sf.z0], [x, t + rise * 0.9, zr]), '#efe6d2']);
    // the boarded cream soffit under the eaves, the fascia with its row of shallow arches between brackets (R06)
    parts.push([box(X0, X1, t - 0.08, t, zw, Z1), '#e7d7a8'], [box(X0, X1, t - 0.45, t, Z1 - 0.12, Z1), '#f3ece0']);
    for (let x = sf.x0 + 1.6; x < sf.x1 - 1.0; x += 3.2) { if (Math.abs(x) < 3.2) continue; parts.push([new THREE.TorusGeometry(1.35, 0.1, 4, 12, Math.PI).scale(1, 0.3, 1).translate(x, t - 0.45, z - 0.2), '#f6f1e6'], [box(x - 1.65, x - 1.45, t - 1.0, t, z - 0.5, z + 0.1), '#f6f1e6']); }
    // the central front gable over the column pairs: its roof slopes, the plain cream gable face with the arch springing
    // from the column pairs
    const gw = 3.1, gh = 2.4, zf = z + 0.5, zb = zr;
    k.roof.quad([-gw - 0.35, t, zf + 0.2], [-gw - 0.35, t, zb], [0, t + gh + 0.15, zb], [0, t + gh + 0.15, zf + 0.2]);
    k.roof.quad([gw + 0.35, t, zb], [gw + 0.35, t, zf + 0.2], [0, t + gh + 0.15, zf + 0.2], [0, t + gh + 0.15, zb]);
    parts.push([tri2([-gw, t, zf], [gw, t, zf], [0, t + gh, zf]), '#efe6d2'], [tri2([gw, t, zf], [-gw, t, zf], [0, t + gh, zf]), '#efe6d2']);
    const arch = new THREE.Shape([new THREE.Vector2(-gw, 0), new THREE.Vector2(gw, 0), new THREE.Vector2(gw, 2.6), new THREE.Vector2(-gw, 2.6)]);
    arch.holes.push(new THREE.Path().moveTo(-1.45, 0).lineTo(1.45, 0).lineTo(1.45, 0.9).absarc(0, 0.9, 1.45, 0, Math.PI, false).lineTo(-1.45, 0));
    parts.push([new THREE.ExtrudeGeometry(arch, { depth: 0.35, bevelEnabled: false }).translate(0, t - 2.6, zf - 0.35), '#f3ece0']);
    k.plain.push(...parts);
    mergeMeshes(k);
  },
};

// ---------- the frontage, the yard and the environs (a world-aligned frame) ----------
const site: Spec = {
  name: 'Evandy Hostel grounds', axis: [1, 0], origin: [0, 0], storey: 3, style: PLAIN, roofColor: '#c4633a', fascia: '#efe7d6', pitch: 0.42,
  // the mapped basketball pitch and the frontage parking are drawn here
  covers: [[522, -1258], ...PARKS.map((r) => [(r[0][0] + r[1][0]) / 2, (r[0][1] + r[2][1]) / 2] as P2)],
  replaces: [],
  blocks: [],
  keep: [[SITE.x0, SITE.x1, SITE.z0, SITE.zFence + 3.5], [FRAME.box[0] - 2, FRAME.box[1] + 2, FRAME.box[2] - 2, FRAME.box[3] + 2]],
  extras: (k) => {
    const parts: Part[] = [];
    // the circular-pattern paving over the compound and out to the road before the gate and the shops
    flatPlane(k, [[SITE.x0, SITE.z0], [SITE.x1, SITE.z0], [SITE.x1, SITE.zFence], [SITE.x0, SITE.zFence]], 0.05, discMat(), 6);
    flatPlane(k, [[SITE.gate[0] - 6, SITE.zFence], [647, SITE.zFence], [647, -1199.4], [SITE.gate[0] - 6, -1199.4]], 0.05, discMat(), 6);
    flatPlane(k, [[SITE.westMouth[0], SITE.zFence], [SITE.westMouth[1], SITE.zFence], [SITE.westMouth[1], -1199.4], [SITE.westMouth[0], -1199.4]], 0.05, discMat(), 6);
    // the west yard: grey gravel, red-earth patches along its edges, the green slab and its hoop
    const [gx0, gx1, gz0, gz1] = YARD.box;
    flatPlane(k, [[gx0, gz0], [gx1, gz0], [gx1, gz1], [gx0, gz1]], 0.06, gravelMat(), 3);
    for (const [c, a, b] of [[[540, -1226], 9, 2.6], [[546, -1270], 4, 6], [[509, -1238], 2.4, 7]] as [P2, number, number][]) flatPlane(k, oval(c, a, b, 18), 0.07, soilMat(), 2);
    flatPlane(k, YARD.slab, 0.08, slabMat(), 4);
    { const [hx, hz] = YARD.hoop;
      parts.push([new THREE.CylinderGeometry(0.08, 0.1, 3.05, 8).translate(hx, 1.52, hz - 0.8), '#5b6066'], [box(hx - 0.06, hx + 0.06, 2.9, 3.0, hz - 0.8, hz + 0.1), '#5b6066'], [box(hx - 0.9, hx + 0.9, 2.9, 3.95, hz + 0.1, hz + 0.16), '#f2f2f0'], [new THREE.TorusGeometry(0.23, 0.02, 4, 12).rotateX(Math.PI / 2).translate(hx, 3.05, hz + 0.45), '#d8592c']);
      SOLIDS.add(hx, hz - 0.8, 0.25); }
    // the tree court's soil round the big tree
    flatPlane(k, oval(TREES[0].at, 7, 6, 20), 0.07, soilMat(), 2);
    // the oval planting islands in their pale kerbs (shrubs: buildEvandyGrounds)
    for (const { c, a, b } of ISLANDS) { parts.push([prism(oval(c, a, b), 0, 0.3), '#eeeae2']); parts.push([prism(oval(c, a - 0.2, b - 0.2), 0, 0.34), '#5a4535']); SOLIDS.add(c[0], c[1], Math.min(a, b)); for (const s of [-1, 1]) SOLIDS.add(c[0] + s * (a - b) * 0.7, c[1], b); }
    // the fence along the road: low pale wall, square posts with caps, dark vertical bars with pointed tops; the
    // openings at the west lane and the gate
    const fence = (xa: number, xb: number) => {
      const z = SITE.zFence;
      parts.push([box(xa, xb, 0, 0.6, z - 0.15, z + 0.15), '#ebe4d4'], [box(xa, xb, 0.6, 0.66, z - 0.18, z + 0.18), '#dcd3c0']);
      const n = Math.max(1, Math.round((xb - xa) / 2.8));
      for (let i = 0; i <= n; i++) { const x = xa + ((xb - xa) * i) / n; parts.push([box(x - 0.22, x + 0.22, 0, 1.9, z - 0.22, z + 0.22), '#efe9dc'], [box(x - 0.27, x + 0.27, 1.9, 2.0, z - 0.27, z + 0.27), '#dcd3c0']); }
      for (let x = xa + 0.12; x < xb; x += 0.14) parts.push([box(x - 0.018, x + 0.018, 0.66, 1.75, z - 0.02, z + 0.02), '#4a3a2c'], [new THREE.ConeGeometry(0.035, 0.1, 4).translate(x, 1.8, z), '#4a3a2c']);
      for (const y of [0.85, 1.6]) parts.push([box(xa, xb, y - 0.025, y + 0.025, z - 0.03, z + 0.03), '#4a3a2c']);
      wallSolids(xa, z, xb, z, 0.3);
    };
    fence(SITE.x0, SITE.westMouth[0]); fence(SITE.westMouth[1], SITE.gate[0]);
    // the boundary walls on the other sides: west along the road, north, east
    const wallRun = (a: P2, b: P2) => { parts.push([strip([a, b], 0, 2.2, 0.13), '#ece6d8'], [strip([a, b], 2.2, 2.32, 0.18), '#dcd3c0']); wallSolids(a[0], a[1], b[0], b[1], 0.3); };
    wallRun([SITE.x0, SITE.zFence], [SITE.x0, SITE.z0]); wallRun([SITE.x0, SITE.z0], [SITE.x1, SITE.z0]); wallRun([SITE.x1, SITE.z0], [SITE.x1, -1216]);
    // east of the gate: the curved pale entrance wall to the commercial block (R18)
    { const pts: P2[] = Array.from({ length: 7 }, (_, i) => { const t = (i / 6) * Math.PI / 2; return [SITE.gate[1] + 0.5 + Math.sin(t) * 1.0, SITE.zFence - (1 - Math.cos(t)) * 2.6] as P2; });
      parts.push([strip(pts, 0, 1.6, 0.14), '#f1ede4']); for (const p of pts) SOLIDS.add(p[0], p[1], 0.3); }
    // the gate: square pillars with lamp globes, two leaves of dark vertical bars swung open
    for (const x of SITE.gate) { parts.push([box(x - 0.35, x + 0.35, 0, 2.4, SITE.zFence - 0.35, SITE.zFence + 0.35), '#efe9dc'], [box(x - 0.42, x + 0.42, 2.4, 2.5, SITE.zFence - 0.42, SITE.zFence + 0.42), '#dcd3c0'], [new THREE.SphereGeometry(0.2, 10, 8).translate(x, 2.75, SITE.zFence), '#3b3631']); SOLIDS.add(x, SITE.zFence, 0.45); }
    for (const [x, s] of [[SITE.gate[0] + 0.4, 1], [SITE.gate[1] - 0.4, -1]] as [number, number][]) {
      const L = 4.2, a = -1.25, dx = Math.cos(a) * s, dz = Math.sin(a);
      for (let t = 0.1; t < L; t += 0.13) { const px = x + dx * t, pz = SITE.zFence + dz * t; parts.push([box(px - 0.02, px + 0.02, 0.1, 2.0, pz - 0.02, pz + 0.02), '#5a4a3a']); }
      for (const y of [0.15, 1.0, 2.0]) parts.push([strip([[x, SITE.zFence], [x + dx * L, SITE.zFence + dz * L]], y - 0.04, y + 0.04, 0.03), '#5a4a3a']);
      for (let t = 0.3; t < L; t += 0.6) SOLIDS.add(x + dx * t, SITE.zFence + dz * t, 0.25);
    }
    // the gatehouse: pale cream, red hipped tile roof, a door and a window, an entry pad with two steps (P05, P06)
    { const [x0, x1, z0, z1] = GATEHOUSE, h = 2.8, e = 0.6, xm = (x0 + x1) / 2, zm = (z0 + z1) / 2, rt = h + 1.5;
      parts.push([box(x0, x1, 0, h, z0, z1), '#efe8da'], [box(x0 - 0.05, x1 + 0.05, h - 0.25, h, z0 - 0.05, z1 + 0.05), '#e3d9c6']);
      k.roof.c = new THREE.Color('#b8502e');
      k.roof.quad([x0 - e, h, z1 + e], [x1 + e, h, z1 + e], [xm + 0.4, rt, zm], [xm - 0.4, rt, zm]);
      k.roof.quad([x1 + e, h, z0 - e], [x0 - e, h, z0 - e], [xm - 0.4, rt, zm], [xm + 0.4, rt, zm]);
      k.roof.quad([x0 - e, h, z0 - e], [x0 - e, h, z1 + e], [xm - 0.4, rt, zm], [xm - 0.4, rt, zm]);
      k.roof.quad([x1 + e, h, z1 + e], [x1 + e, h, z0 - e], [xm + 0.4, rt, zm], [xm + 0.4, rt, zm]);
      // the door on the court side, a louvred window on each of the other three walls (R11, P05, P06), sills under them
      parts.push([box(x0 + 0.6, x0 + 1.5, 0.3, 2.3, z0 - 0.04, z0), '#3c3d3a']);
      const win = (a: P2, b: P2) => { const cx = (a[0] + b[0]) / 2, cz = (a[1] + b[1]) / 2, along = a[1] === b[1];
        parts.push([along ? box(cx - 0.6, cx + 0.6, 1.0, 2.0, cz - 0.04, cz + 0.04) : box(cx - 0.04, cx + 0.04, 1.0, 2.0, cz - 0.6, cz + 0.6), '#2c3034']);
        for (let y = 1.08; y < 2.0; y += 0.13) parts.push([along ? box(cx - 0.56, cx + 0.56, y, y + 0.03, cz - 0.05, cz + 0.05) : box(cx - 0.05, cx + 0.05, y, y + 0.03, cz - 0.56, cz + 0.56), '#6b6f73']);
        parts.push([along ? box(cx - 0.7, cx + 0.7, 0.92, 1.0, cz - 0.1, cz + 0.1) : box(cx - 0.1, cx + 0.1, 0.92, 1.0, cz - 0.7, cz + 0.7), '#e3d9c6']); };
      win([x0 + 2.2, z1], [x1, z1]); win([x0, z0], [x0, z1]); win([x1, z0], [x1, z1]); win([x0 + 1.8, z0], [x1 - 0.2, z0]);
      parts.push([box(x0 - 0.2, x0 + 2.2, 0, 0.3, z0 - 1.6, z0), '#e4e0d6'], [box(x0 - 0.2, x0 + 2.2, 0, 0.15, z0 - 2.1, z0 - 1.6), '#e4e0d6']); }
    // the notice shelter: thin pale frame, weathered curved roof, the board, by the fence
    { const [x0, x1, z0, z1] = SHELTER, h = 2.5;
      for (const x of [x0, x1]) for (const z of [z0, z1]) parts.push([box(x - 0.05, x + 0.05, 0, h, z - 0.05, z + 0.05), '#e9e6df']);
      parts.push([box(x0 - 0.3, x1 + 0.3, h, h + 0.08, z0 - 0.4, z1 + 0.3), '#a98a62'], [box(x0 + 0.1, x1 - 0.1, 0.9, 2.1, z1 - 0.08, z1 - 0.02), '#2f3a5a']);
      for (let i = 0; i < 9; i++) parts.push([box(x0 + 0.4 + (i % 5) * 1.0, x0 + 1.1 + (i % 5) * 1.0, 1.2 + Math.floor(i / 5) * 0.45, 1.55 + Math.floor(i / 5) * 0.45, z1 - 0.1, z1 - 0.08), ['#e9c46a', '#f4a3b8', '#9ad0ec', '#f2f2f2'][i % 4]]);
      for (const x of [x0, x1]) SOLIDS.add(x, (z0 + z1) / 2, 0.2); }
    // the EVANDY HOSTEL sign: blue-grey base, the white slab on two posts
    { const [x, z] = SIGN;
      parts.push([box(x - 1.6, x + 1.6, 0, 0.75, z - 0.5, z + 0.5), '#6f8aa8'], [box(x - 1.15, x - 1.08, 0.75, 1.3, z - 0.03, z + 0.03), '#2f5ea8'], [box(x + 1.08, x + 1.15, 0.75, 1.3, z - 0.03, z + 0.03), '#2f5ea8'], [box(x - 1.2, x + 1.2, 1.3, 2.6, z - 0.05, z + 0.05), '#2f5ea8']);
      k.signs.push({ text: 'EVANDY', x, y: 2.15, z: z + 0.06, ry: 0, w: 2.0, colors: ['#ffffff', '#1f3d7a'] });
      k.signs.push({ text: 'HOSTEL', x, y: 1.7, z: z + 0.06, ry: 0, w: 2.0, colors: ['#ffffff', '#1f3d7a'] });
      SOLIDS.add(x - 1, z, 0.6); SOLIDS.add(x + 1, z, 0.6); }
    // 9 the unfinished open frame: grey concrete columns on a 5 m grid, floor slabs, a few infill panels, no roof
    { const [x0, x1, z0, z1] = FRAME.box, fh = 3.2;
      for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 4) for (let z = z0; z <= z1 + 0.01; z += (z1 - z0) / 13) { parts.push([box(x - 0.2, x + 0.2, 0, FRAME.floors * fh + 0.6, z - 0.2, z + 0.2), '#9fa1a0']); SOLIDS.add(x, z, 0.35); }
      for (let f = 1; f <= FRAME.floors; f++) parts.push([box(x0 - 0.3, x1 + 0.3, f * fh - 0.25, f * fh, z0 - 0.3, z1 + 0.3), '#b1b2ae']);
      for (let i = 0; i < 6; i++) { const z = z0 + 4 + i * 11; parts.push([box(x0 - 0.1, x0 + 0.1, 0, fh * 2, z, z + 5), '#c0b8a8']); }
      flatPlane(k, [[RED_YARD[0], RED_YARD[2]], [RED_YARD[1], RED_YARD[2]], [RED_YARD[1], RED_YARD[3]], [RED_YARD[0], RED_YARD[3]]], 0.05, soilMat(), 4); }
    k.plain.push(...parts);
    mergeMeshes(k);
  },
};

/** Evandy Hostel and its environs */
export const evandySite = mergedSite(createSite('evandy', [...WINGS.map(wingSpec), entrance, ring, shops, site]));

// ---------- planting and the ground round the compound ----------
const SHRUB = ['#4d7032', '#5c7f36', '#3f6428', '#6a8f3f'];
const TREE = ['#3f6a2c', '#4b7733', '#557f37'];
const SCRUBC = ['#56723a', '#647c3f', '#4b6634', '#7a8446'];
const segDist = (x: number, z: number, ax: number, az: number, bx: number, bz: number) => {
  const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz, t = l ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l)) : 0;
  return Math.hypot(x - ax - dx * t, z - az - dz * t);
};
export function buildEvandyGrounds() {
  const crowns: Crown[] = [];
  // the islands' clipped shrubs and spiky ornamentals
  for (const { c, a, b } of ISLANDS) for (let i = 0; i < 9; i++) { const t = (i / 9) * Math.PI * 2, r = i % 3 ? 0.55 : 0.2, s = hash2(c[0] + i, c[1]);
    crowns.push({ x: c[0] + Math.cos(t) * (a - 0.9) * r * 1.6, z: c[1] + Math.sin(t) * (b - 0.6) * r * 1.6, r: 0.6 + s * 0.3, h: 0.7 + s * 0.5, base: 0.34, trunk: 0, color: SHRUB[(s * 4) | 0], seed: s }); }
  // the short shrubs below the frontage windows
  for (let x = 556; x < 640; x += 3.1) { if (Math.abs(x - 597) < 5) continue; const z = x < 597 ? -1221.4 + (x - 556) * 0.175 : -1229 + (x - 600) * 0.257 + 0.8, s = hash2(x, 9);
    crowns.push({ x, z: z + 1.2, r: 0.6, h: 0.75, base: 0, trunk: 0, color: SHRUB[(s * 4) | 0], seed: s }); }
  // the court tree and the inner courts' trees
  for (const { at, r } of TREES) crowns.push({ x: at[0], z: at[1], r, h: r * 1.1, base: r * 0.6 + 1.5, trunk: 0.35, color: TREE[(hash2(at[0], at[1]) * 3) | 0], seed: hash2(at[1], at[0]), solid: true });
  // the scrub and woodland east of the compound round the open field (M2): patchy, the field left open
  const [s0, s1, t0, t1] = SCRUB, [fx, fz] = FIELD.c;
  const blds = BUILDINGS.filter((b) => b.maxX > s0 - 5 && b.minX < s1 + 5 && b.maxZ > t0 - 5 && b.minZ < t1 + 5);
  const segs: [number, number, number, number][] = [];
  for (const r of ROADS) for (let i = 1; i < r.nodes.length; i++) { const ax = NODE_XZ[r.nodes[i - 1] * 2], az = NODE_XZ[r.nodes[i - 1] * 2 + 1], bx = NODE_XZ[r.nodes[i] * 2], bz = NODE_XZ[r.nodes[i] * 2 + 1]; if (Math.max(ax, bx) > s0 - 10 && Math.min(az, bz) < t1 + 10 && Math.max(az, bz) > t0 - 10) segs.push([ax, az, bx, bz]); }
  for (let z = t0; z < t1 - 6; z += 4.2) for (let x = s0; x < s1; x += 4.2) {
    const px = x + (hash2(x, z) - 0.5) * 3.5, pz = z + (hash2(z, x) - 0.5) * 3.5;
    const d = Math.hypot((px - fx) / (FIELD.rx + 3), (pz - fz) / (FIELD.rz + 3));
    if (d < 1 || vnoise2(px / 14, pz / 14) < 0.35 || segs.some(([ax, az, bx, bz]) => segDist(px, pz, ax, az, bx, bz) < 5) || blds.some((b) => px > b.minX - 2 && px < b.maxX + 2 && pz > b.minZ - 2 && pz < b.maxZ + 2)) continue;
    const s = hash2(px * 3, pz), tree = s < 0.22;
    crowns.push(tree ? { x: px, z: pz, r: 3 + s * 6, h: 4, base: 2.5, trunk: 0.3, color: TREE[(s * 9) % 3 | 0], seed: s, solid: true } : { x: px, z: pz, r: 1.4 + s * 1.4, h: 1.3 + s * 1.2, base: 0, trunk: 0, color: SCRUBC[(s * 4) | 0], seed: s });
  }
  const group = new THREE.Group();
  group.name = 'evandy-grounds';
  group.userData.noRelief = true;
  group.add(...crownTiles(crowns, 100, 75));
  // the open sandy field and the patchy dry ground of the scrub, painted over the grass
  const over = coverOverlay({
    box: [s0, s1, t0, t1], mpp: 1, cell: 4, tile: 120,
    color: (x, z) => {
      const d = Math.hypot((x - fx) / FIELD.rx, (z - fz) / FIELD.rz) + (vnoise2(x / 7, z / 7) - 0.5) * 0.35;
      if (d < 1) return [196, 150, 104, 0.95];
      const n = vnoise2(x / 11, z / 11);
      return n < 0.4 ? [150, 120, 78, 0.5] : null;
    },
    cellIn: () => true,
  });
  for (const m of over) { m.userData.noRelief = true; group.add(m); }
  group.userData.crowns = crowns.length;
  return group;
}
