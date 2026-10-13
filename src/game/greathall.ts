// The Great Hall complex on Legon Hill, rebuilt to the owner's Great Hall correction brief (the aerial A01, the tour
// R01-R59, the game views G01-G10; numbers in greathallplan.ts, levels and steps in relief.ts, evidence in
// docs/great-hall/evidence-audit.md). From the hall at the top of the aerial down to the approach garden:
// - the hall (osm:way/720486436): the high hall with its clerestory row under a broad weathered hip roof, the lower
//   aisles along its sides with long dark grilles under their own tiled roofs; at the front a lower tiled canopy over a
//   deep portico of four tall white supports, the recessed entrance wall with its grilles, the roundels, the Established
//   1948 plaque, the GREAT HALL sign and the dark doors, the steps up from the court; the lower blocks either side; the
//   semicircular projection behind it (the earlier brief's S4);
// - the clock tower at the court's corner: a rectangular shaft with small square openings, the projecting window with its
//   pointed red cap low on its court face, the parapet, the square clock stage, the lantern stage and the red cap;
// - the upper court: weathered slab paving, lawn panels, drain grates, patches of crazy paving, two big shade trees,
//   palms, flowering shrubs and pots; the low wings round it (the mapped L-shaped outlines) with verandas of white
//   columns, white walls over a pale cream band, brown timber shutters open on glazed windows, barred windows, doors;
//   an arched gable passage in the middle of each side wing;
// - the way down: square piers with lantern heads and red caps, black tanks on open stands at the arms' ends, two flights
//   of worn dark grey steps between planters of irregular stone with red coping, the lower one divided by a planter;
// - the lower court: the bust walk along its south side, raised planting beds, frangipani; a narrow veranda wing on its
//   north side; the gateway building (osm:way/100307658) at its east end: two storeys, the upper window row, the arch
//   through the middle with its thick reveals and gate leaves, the threshold steps with red risers; its pavilions, low
//   links, the covered walks out to the outer buildings;
// - the approach: paving down to the turning loop, the semicircular garden inside the loop, and the formal garden between
//   the two roads east of the cross road (a paved grid of lawn panels, a second square, flowering trees either side).
// Heights, the spans the map has no outline for and the planting's places are read from the references, not measured.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createSite, render, louvre as woodWin, type Block, type Kit, type Spec, type Style } from './blocks';
import { WHITE, box, canvas, flat } from './modelkit';
import { stairsOf } from './relief';
import { broadleaf } from './nsiaroad';
import { wallSolids } from './enkit';
import { SOLIDS } from './solids';
import { garden } from './gardens';
import { AXIS, BUSTS, GABLES, GH, OBJECT, PIERS, TANKS, TOWER } from './greathallplan';

const O: [number, number] = [-1010, 128];
const L = (x: number) => x - O[0], Lz = (z: number) => z - O[1];
const W = (x0: number, x1: number, z0: number, z1: number, floors: number, extra: Partial<Block> = {}): Block =>
  ({ x0: L(x0), x1: L(x1), z0: Lz(z0), z1: Lz(z1), floors, ...extra });

const ROOF = '#a4523a', ROOF_AGED = '#8e4936', FASCIA = '#f3efe6', SOFFIT = '#3d322b', WALL = '#f6f4ee', CREAM = '#e6d6a0';
const TIMBER = '#7a5236', TIMBER_D = '#4b3324', IRON = '#1c1d1f', COPING = '#a8452f', RISER_RED = '#9b3a2c', STEP_GREY = '#6c6964';
const GRANITE = '#8f8c87', BRONZE = '#5a4b3a', LAWN = '#66733b', SOIL = '#634631', SKIRT = '#8f3b2c';
const ST = 3.4;
const U = GH.upper.h, LO = GH.lower.h, FLOOR = GH.floor;

// ---------- the walls' paint and openings (one bay each; ground floor below 256, an upper floor above) ----------
/** white over a pale cream band with a dark skirting (the wings' walls, R25-R45) */
const banded = (g: CanvasRenderingContext2D, y0: number) => {
  g.fillStyle = CREAM; g.fillRect(0, y0 + 150, 256, 106);
  g.fillStyle = '#cdb985'; g.fillRect(0, y0 + 148, 256, 3);
  g.fillStyle = '#5a3d2f'; g.fillRect(0, y0 + 246, 256, 10);
};
/** brown timber louvred shutters open either side of a glazed casement (R29-R32) */
const shutterWin = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#26292c'; g.fillRect(x, y, w, h);
  g.fillStyle = '#7c8b92'; for (const xx of [x + 5, x + w / 2 + 2]) g.fillRect(xx, y + 5, w / 2 - 7, h - 10);
  g.fillStyle = TIMBER_D; g.fillRect(x + w / 2 - 2, y, 4, h); g.fillRect(x, y + h * 0.45, w, 4);
  for (const sx of [x - w / 2 - 3, x + w + 3]) {
    g.fillStyle = TIMBER_D; g.fillRect(sx, y, w / 2, h);
    g.fillStyle = TIMBER; for (let yy = y + 4; yy < y + h - 4; yy += 7) g.fillRect(sx + 3, yy, w / 2 - 6, 4);
  }
  g.fillStyle = '#e2dccf'; g.fillRect(x - 4, y + h, w + 8, 5);
};
/** a black-framed window with vertical bars over the glass (R38-R45) */
const barredWin = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = IRON; g.fillRect(x - 5, y - 5, w + 10, h + 10);
  g.fillStyle = '#8b989c'; g.fillRect(x, y, w, h);
  g.fillStyle = IRON; for (let xx = x + 7; xx < x + w - 2; xx += 11) g.fillRect(xx, y, 4, h);
};
/** a long dark grille: an opening behind close vertical bars (the hall's aisles and front, R04-R09, R54, R58) */
const grille = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#1f1d1c'; g.fillRect(x, y, w, h);
  g.fillStyle = '#5b5752'; for (let xx = x + 5; xx < x + w - 2; xx += 9) g.fillRect(xx, y + 3, 3, h - 6);
  g.fillStyle = '#e9e5dc'; g.fillRect(x - 3, y + h, w + 6, 6);
};
const door = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#2f241d'; g.fillRect(x - 4, y - 4, w + 8, h + 4);
  g.fillStyle = TIMBER_D; g.fillRect(x, y, w, h);
  g.fillStyle = '#5c4030'; for (const yy of [y + 12, y + h / 2 + 4]) { g.fillRect(x + 6, yy, w / 2 - 9, h / 2 - 22); g.fillRect(x + w / 2 + 3, yy, w / 2 - 9, h / 2 - 22); }
};
const style = (bay: number, draw: (g: CanvasRenderingContext2D) => void, up: [number, number, number, number][] = [], ground: [number, number, number, number][] = []): Style => ({ bay, up, ground, draw });
/** the veranda walls: shutters (R27-R33), barred windows (R38-R45), a door and a small window between (R38, R39) */
const VER_A = style(3.0, (g) => { render(g, WALL); banded(g, 256); shutterWin(g, 96, 256 + 66, 64, 96); }, [], [[96, 322, 64, 96]]);
const VER_B = style(3.0, (g) => { render(g, WALL); banded(g, 256); barredWin(g, 92, 256 + 62, 72, 90); }, [], [[92, 318, 72, 90]]);
const VER_C = style(3.6, (g) => { render(g, WALL); banded(g, 256); door(g, 46, 256 + 64, 56, 186); barredWin(g, 150, 256 + 70, 56, 62); }, [], [[150, 326, 56, 62]]);
/** the wings' outer faces: white over the cream band, a small brown louvred window (R18) */
const OUTER = style(3.4, (g) => { render(g, WALL); banded(g, 256); woodWin(g, [100, 256 + 70, 56, 84], TIMBER_D); }, [], [[100, 326, 56, 84]]);
/** the hall: plain white walls; the clerestory row under the eaves (R04-R09, R49-R54, R58) */
const HALL_PLAIN = style(3.2, (g) => { render(g, WALL); });
const CLERESTORY = style(2.7, (g) => {
  render(g, WALL);
  g.fillStyle = '#e8e3d8'; g.fillRect(86, 96, 84, 104);
  g.fillStyle = '#25272a'; g.fillRect(92, 102, 72, 92);
  g.fillStyle = '#e8e3d8'; g.fillRect(126, 102, 4, 92);
}, [[92, 102, 72, 92]]);
/** the aisles: long dark grilles on the upper floor, tall louvred openings below (R04, R05, R58) */
const AISLE = style(3.2, (g) => {
  render(g, WALL);
  grille(g, 18, 70, 220, 104);
  g.fillStyle = TIMBER_D; g.fillRect(92, 256 + 46, 72, 200);
  g.fillStyle = TIMBER; for (let y = 256 + 52; y < 256 + 240; y += 9) g.fillRect(96, y, 64, 4);
}, [], []);
/** the entrance wall in the portico: the long grilles above each bay; the doors, signs and roundels are modelled */
const FRONT = style(6.2, (g) => { render(g, WALL); grille(g, 16, 22, 224, 96); g.fillStyle = WALL; g.fillRect(0, 256, 256, 256); });
/** the lower blocks either side of the portico: small square dark windows (R51-R53) */
const SMALL = style(3.0, (g) => {
  render(g, WALL);
  for (const y of [86, 256 + 92]) { g.fillStyle = '#e4ded2'; g.fillRect(96, y - 6, 64, 72); g.fillStyle = '#2a2b2d'; g.fillRect(102, y, 52, 60); }
}, [[102, 86, 52, 60]], [[102, 348, 52, 60]]);
/** the gateway building: the upper window row (R15, R22), narrow louvred windows below (R34) */
const GATE = style(2.9, (g) => {
  render(g, WALL);
  g.fillStyle = '#e4ded2'; g.fillRect(92, 60, 72, 100); g.fillStyle = '#2b2a28'; g.fillRect(98, 66, 60, 88);
  g.fillStyle = TIMBER_D; g.fillRect(126, 66, 4, 88);
  g.fillStyle = '#e4ded2'; g.fillRect(88, 160, 80, 6);
  banded(g, 256);
}, [[98, 66, 60, 88]]);
const GATE_LOW = style(4.2, (g) => { render(g, WALL); banded(g, 256); woodWin(g, [114, 256 + 40, 28, 150], TIMBER_D); });
/** the pavilions beside the gateway: white, brown louvred windows (A01) */
const PAV = style(3.2, (g) => { render(g, WALL); banded(g, 256); woodWin(g, [92, 256 + 60, 72, 110], TIMBER_D); }, [], [[92, 316, 72, 110]]);

// ---------- textured surfaces: slab paving, crazy paving, irregular stone, worn treads ----------
const lazy = <T,>(f: () => T) => { let v: T | null = null; return () => (v ??= f()); };
const prng = (s: number) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
/** weathered rectangular slabs in rows, joints and stains (R01-R17), 3 m to a repeat */
const slabMat = lazy(() => {
  const t = canvas(256, 256, (g) => {
    const r = prng(19);
    g.fillStyle = '#76726b'; g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 51.2) {
      for (let x = -r() * 60; x < 256;) {
        const w = 50 + r() * 44, v = 138 + r() * 34 | 0;
        g.fillStyle = `rgb(${v},${v - 3},${v - 9})`; g.fillRect(x + 1.5, y + 1.5, w - 3, 48);
        g.fillStyle = 'rgba(62,58,50,0.16)'; for (let i = 0; i < 9; i++) g.fillRect(x + r() * w, y + r() * 44, 4 + r() * 16, 2 + r() * 8);
        x += w;
      }
    }
  });
  t.repeat.set(1 / 3, 1 / 3);
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
});
/** random polygonal stones in mortar (a Voronoi pattern), `metres` to a repeat */
const voronoi = (seed: number, cols: string[], mortar: string, cells: number, metres: number) => {
  const N = 256, r = prng(seed), pts: [number, number, number][] = [];
  const n = Math.round(Math.sqrt(cells));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) pts.push([(i + 0.15 + r() * 0.7) * (N / n), (j + 0.15 + r() * 0.7) * (N / n), (r() * cols.length) | 0]);
  const rgb = cols.map((c) => new THREE.Color(c)), m = new THREE.Color(mortar);
  const t = canvas(N, N, (g) => {
    const img = g.createImageData(N, N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let d1 = 1e9, d2 = 1e9, c = 0;
      for (const [px, py, k] of pts) for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
        const d = (x - px - ox) ** 2 + (y - py - oy) ** 2;
        if (d < d1) { d2 = d1; d1 = d; c = k; } else if (d < d2) d2 = d;
      }
      const edge = Math.sqrt(d2) - Math.sqrt(d1) < 2.4, col = edge ? m : rgb[c], f = edge ? 1 : 0.9 + ((x * 7 + y * 13) % 17) / 85;
      const o = (y * N + x) * 4;
      img.data[o] = col.r * 255 * f; img.data[o + 1] = col.g * 255 * f; img.data[o + 2] = col.b * 255 * f; img.data[o + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  });
  t.repeat.set(1 / metres, 1 / metres);
  return t;
};
/** the retaining faces and planters: irregular tan, ochre, grey and brown stones with dark joints (R46-R50) */
const stoneMat = lazy(() => new THREE.MeshStandardMaterial({ map: voronoi(5, ['#c9a676', '#bf9157', '#a9a196', '#8d6c4e', '#d4bc93', '#b98252', '#9a8f80', '#c4a06e'], '#5d4f43', 30, 1.6), roughness: 0.95 }));
/** the patches of crazy paving set into the courts (R11-R14, R35-R37) */
const crazyMat = lazy(() => new THREE.MeshStandardMaterial({ map: voronoi(11, ['#b9a39a', '#9f9690', '#c4b2a2', '#8f8580', '#a8907f', '#b6aca0'], '#77706a', 36, 1.8), roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
/** broad worn dark grey treads (R46-R50), 1 m to a repeat */
const treadMat = lazy(() => {
  const t = canvas(128, 128, (g) => {
    const r = prng(3);
    g.fillStyle = '#625f5a'; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${r() > 0.5 ? '150,146,138' : '40,38,36'},${0.1 + r() * 0.18})`; g.fillRect(r() * 128, r() * 128, 2 + r() * 12, 1 + r() * 3); }
  });
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 });
});
/** uvs in metres by each face's direction, so a texture keeps its scale on every face */
function metreUV(g: THREE.BufferGeometry) {
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv as THREE.BufferAttribute | undefined;
  if (!uv || !n) return g;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    if (ay > 0.7) uv.setXY(i, p.getX(i), p.getZ(i)); else if (ax > 0.7) uv.setXY(i, p.getZ(i), p.getY(i)); else uv.setXY(i, p.getX(i), p.getY(i));
  }
  uv.needsUpdate = true;
  return g;
}
/** the textured parts, merged per material at the end of the model */
const TX = new Map<THREE.Material, THREE.BufferGeometry[]>();
const tx = (mat: THREE.Material, g: THREE.BufferGeometry) => {
  const n = g.index ? g.toNonIndexed() : g;
  if (!n.attributes.normal) n.computeVertexNormals();
  for (const a of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(a)) n.deleteAttribute(a);
  (TX.get(mat) ?? TX.set(mat, []).get(mat)!).push(metreUV(n));
};
function flushTx(k: Kit) {
  for (const [mat, gs] of TX) {
    const m = new THREE.Mesh(mergeGeometries(gs), mat);
    m.receiveShadow = true; m.castShadow = mat !== slabMat() && mat !== crazyMat();
    k.meshes.push(m);
  }
  TX.clear();
}

// ---------- the buildings' outlines (world x, z) ----------
/** the hall: the high hall, its aisles, the entrance block behind the portico, the lower blocks either side of it */
const NAVE: [number, number, number, number] = [-1026.5, -1000.5, 116, 141];
const AISLE_N: [number, number, number, number] = [-1026.5, -1000.5, 110.2, 116];
const AISLE_S: [number, number, number, number] = [-1020.4, -1000.5, 141, 148.2];
const NARTHEX: [number, number, number, number] = [-1000.5, -994.6, 118.6, 138.6];
const SIDE_N: [number, number, number, number] = [-1000.5, -993.6, 110.6, 118.6];
const SIDE_S: [number, number, number, number] = [-1000.5, -993.6, 138.6, 143.6];
const APSE = { x: -1027.5, z: 129, r: 9.5 };
/** the portico's four tall supports (R50-R54) and its depth */
const COLS = [-9.3, -3.1, 3.1, 9.3].map((d) => AXIS + d);
const PORTICO = { x0: -994.6, x1: -991.4 };

/** the wings round the upper court (the mapped L outlines): the rooms behind the verandas (each veranda in front is
 *  modelled), the arched gable passages left out of the ranges */
const NORTH = { range: [-1003.4, -934.2, 92.8, 103.1], arm: [-944, -934.2, 103.1, 116.4], link: [-1003.4, -993.5, 103.1, 110.4], wall: 100.6, armWall: -941.6 };
const SOUTH = { range: [-1001, -934.5, 152, 164.1], arm: [-942.2, -934.5, 137.4, 152], link: [-1001, -996.6, 147.8, 152], wall: 154.4, armWall: -939.8 };
const WINGS: Block[] = [
  // the north range: the link to the hall's front, two lengths either side of the gable passage; the east arm
  W(-1003.4, -993.5, 92.8, 107.3, 1, { faces: { z1: VER_C, x1: VER_C }, roof: 'none' }),
  W(-1002, -994, 107.3, 110.4, 1, { faces: { x1: VER_A }, roof: 'none' }),
  W(-993.5, -972, 92.8, 100.6, 1, { faces: { z1: VER_A, x0: OUTER, x1: OUTER, z0: OUTER }, roof: 'none' }),
  W(-966, -934.2, 92.8, 100.6, 1, { faces: { z1: VER_B, x0: OUTER, x1: OUTER, z0: OUTER }, roof: 'none' }),
  W(-941.6, -934.2, 100.6, 116.4, 1, { faces: { x0: VER_C, z1: OUTER, x1: OUTER }, roof: 'none' }),
  // the south range
  W(-1001, -996.6, 147.8, 164.1, 1, { faces: { z0: VER_C, x1: VER_C }, roof: 'none' }),
  W(-996.6, -993.5, 152, 164.1, 1, { faces: { z0: VER_C, x1: VER_C }, roof: 'none' }),
  W(-993.5, -972, 154.4, 164.1, 1, { faces: { z0: VER_A, x0: OUTER, x1: OUTER, z1: OUTER }, roof: 'none' }),
  W(-966, -934.5, 154.4, 164.1, 1, { faces: { z0: VER_B, x0: OUTER, x1: OUTER, z1: OUTER }, roof: 'none' }),
  W(-939.8, -934.5, 137.4, 154.4, 1, { faces: { x0: VER_C, z0: OUTER, x1: OUTER }, roof: 'none' }),
];
/** the lower court: the bust wing on its south side (osm:way/492099530: the shuttered and the barred lengths, its veranda
 *  on the court), the narrow veranda wing on its north side (no map outline: the aerial's roof), the covered link between
 *  the bust wing and the south pavilion */
const BUST_WING = { x0: -933.5, x1: -918.1, z0: 144.4, wall: 147.0, z1: 162.1 };
const NORTH_LOW = { x0: -933.5, x1: -914.6, z0: 111.8, wall: 114.6, z1: 116.4 };
const LOWER: Block[] = [
  W(BUST_WING.x0, -925.8, BUST_WING.wall, BUST_WING.z1, 1, { faces: { z0: VER_A, x0: OUTER, z1: OUTER }, roof: 'none' }),
  W(-925.8, BUST_WING.x1, BUST_WING.wall, BUST_WING.z1, 1, { faces: { z0: VER_B, x1: OUTER, z1: OUTER }, roof: 'none' }),
  W(NORTH_LOW.x0, NORTH_LOW.x1, NORTH_LOW.z0, NORTH_LOW.wall, 1, { faces: { z1: VER_C, z0: OUTER, x0: OUTER }, roof: 'none' }),
];
/** the gateway building: its two halves either side of the passage, the upper floor over it; its pavilions and the low
 *  links between */
const G = GH.gate;
const GATEWAY: Block[] = [
  W(G.x0, G.x1, G.z0, G.arch[0], 2, { faces: { x0: GATE, x1: GATE, z0: GATE, z1: GATE_LOW }, floorStyle: { 0: GATE_LOW }, roof: 'none' }),
  W(G.x0, G.x1, G.arch[1], G.z1, 2, { faces: { x0: GATE, x1: GATE, z0: GATE_LOW, z1: GATE }, floorStyle: { 0: GATE_LOW }, roof: 'none' }),
  W(-914.5, -897.1, 103, 111.7, 1, { faces: { x0: PAV, x1: PAV, z0: PAV, z1: PAV } }),
  W(-914.3, -896.9, 144, 152.7, 1, { faces: { x0: PAV, x1: PAV, z0: PAV, z1: PAV } }),
  W(-908.4, -902.0, 111.7, G.z0 + 0.1, 1, { faces: { x0: GATE_LOW, x1: GATE_LOW } }),
  W(-908.4, -902.0, G.z1 - 0.1, 144.05, 1, { faces: { x0: GATE_LOW, x1: GATE_LOW } }),
];
const HALL_BLOCKS: Block[] = [
  W(...NAVE, 4, { roof: 'none', y: FLOOR, floorStyle: { 3: CLERESTORY }, faces: { x0: HALL_PLAIN, x1: HALL_PLAIN, z0: HALL_PLAIN, z1: HALL_PLAIN } }),
  W(...AISLE_N, 2, { roof: 'none', y: FLOOR, faces: { z0: AISLE, x0: AISLE, x1: AISLE } }),
  W(...AISLE_S, 2, { roof: 'none', y: FLOOR, faces: { z1: AISLE, x0: AISLE, x1: AISLE } }),
  W(...NARTHEX, 2, { roof: 'none', y: FLOOR, faces: { x1: FRONT } }),
  W(...SIDE_N, 2, { y: U, faces: { x1: SMALL, z0: SMALL, x0: SMALL }, pitch: 0.42, roofColor: ROOF }),
  W(...SIDE_S, 2, { y: U, faces: { x1: SMALL, z1: SMALL, x0: SMALL }, pitch: 0.42, roofColor: ROOF }),
];

const g = garden([-1060, -760, 70, 190]);

/** a hip roof over a rectangle (model frame) with eaves `over` deep: a dark soffit and edge, a white fascia */
function hipRoof(k: Kit, x0: number, x1: number, z0: number, z1: number, wall: number, pitch: number, over: number, col = ROOF) {
  const X0 = x0 - over, X1 = x1 + over, Z0 = z0 - over, Z1 = z1 + over, e = wall - over * pitch * 0.4;
  const w = X1 - X0, d = Z1 - Z0, half = Math.min(w, d) / 2, top = e + half * pitch;
  k.roof.c = new THREE.Color(col);
  if (w >= d) {
    const zm = (Z0 + Z1) / 2, r0 = [X0 + half, top, zm], r1 = [X1 - half, top, zm];
    k.roof.quad([X0, e, Z0], [X1, e, Z0], r1, r0); k.roof.quad([X1, e, Z1], [X0, e, Z1], r0, r1);
    k.roof.quad([X0, e, Z1], [X0, e, Z0], r0, r0); k.roof.quad([X1, e, Z0], [X1, e, Z1], r1, r1);
  } else {
    const xm = (X0 + X1) / 2, r0 = [xm, top, Z0 + half], r1 = [xm, top, Z1 - half];
    k.roof.quad([X1, e, Z0], [X1, e, Z1], r1, r0); k.roof.quad([X0, e, Z1], [X0, e, Z0], r0, r1);
    k.roof.quad([X0, e, Z0], [X1, e, Z0], r0, r0); k.roof.quad([X1, e, Z1], [X0, e, Z1], r1, r1);
  }
  for (const [a, b, c, dd] of [[X0, X1, Z0, z0], [X0, X1, z1, Z1], [X0, x0, z0, z1], [x1, X1, z0, z1]]) k.plain.push([box(a, b, e - 0.07, e - 0.01, c, dd), SOFFIT]);
  for (const z of [Z0, Z1]) k.plain.push([box(X0, X1, e - 0.26, e + 0.03, z - 0.05, z + 0.05), SOFFIT]);
  for (const x of [X0, X1]) k.plain.push([box(x - 0.05, x + 0.05, e - 0.26, e + 0.03, Z0, Z1), SOFFIT]);
  return top;
}
/** a lean-to roof along x (model frame): high at the wall line z = `at`, down to the eave over z = `far`, its ends
 *  hipped back to the wall */
function leanTo(k: Kit, a0: number, a1: number, at: number, far: number, hi: number, lo: number, col = ROOF) {
  k.roof.c = new THREE.Color(col);
  const d = Math.abs(far - at);
  k.roof.quad([a0, lo, far], [a1, lo, far], [a1 - d * 0.5, hi, at], [a0 + d * 0.5, hi, at]);
  k.roof.quad([a0, lo, at], [a0, lo, far], [a0 + d * 0.5, hi, at], [a0 + d * 0.5, hi, at]);
  k.roof.quad([a1, lo, far], [a1, lo, at], [a1 - d * 0.5, hi, at], [a1 - d * 0.5, hi, at]);
  k.plain.push([box(a0, a1, lo - 0.25, lo + 0.03, far - 0.05, far + 0.05), SOFFIT]);
}
/** a surface turned to face inward (seen from inside a curve) */
function inward(geo: THREE.BufferGeometry) {
  const ix = geo.index!, n = geo.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < ix.count; i += 3) { const a = ix.getX(i + 1); ix.setX(i + 1, ix.getX(i + 2)); ix.setX(i + 2, a); }
  for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
  return geo;
}
/** a wall with an arched opening through it (model frame): across x (the wall in the z-y plane at x = at, `thick`
 *  toward +x) or across z; the opening o0..o1 springing at `spring` into a half circle; `col` its paint */
function archWall(k: Kit, acrossX: boolean, at: number, c0: number, c1: number, y0: number, y1: number, o0: number, o1: number, spring: number, thick: number, col = WALL) {
  // the wall's outline runs round the opening (a notch from the foot, its head a half circle)
  const r = (o1 - o0) / 2, cm = (o0 + o1) / 2, s = new THREE.Shape();
  s.moveTo(c0, y0); s.lineTo(o0, y0); s.lineTo(o0, spring); s.absarc(cm, spring, r, Math.PI, 0, true);
  s.lineTo(o1, y0); s.lineTo(c1, y0); s.lineTo(c1, y1); s.lineTo(c0, y1); s.lineTo(c0, y0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false, curveSegments: 14 });
  // across x: the shape's u along z, its thickness from x = at back to at - thick; across z: u along x, at .. at + thick
  if (acrossX) geo.rotateY(-Math.PI / 2).translate(at, 0, 0); else geo.translate(0, 0, at);
  k.plain.push([geo, col]);
  // the arch's reveal: the curved underside through the wall's thickness
  const rv = inward(new THREE.CylinderGeometry(r, r, thick, 14, 1, true, 0, Math.PI)).rotateZ(Math.PI / 2);
  if (acrossX) rv.translate(at - thick / 2, spring, cm); else rv.rotateY(Math.PI / 2).translate(cm, spring, at + thick / 2);
  k.plain.push([rv, '#ece6da']);
}
/** a modelled stairway (relief.ts) in the model frame: each step a block down into the ground, a tread on top */
type Stair = ReturnType<typeof stairsOf>[number];
function drawSteps(k: Kit, s: Stair, body: string, tread: THREE.Material | string, nose?: string) {
  const dir = Math.sign(s.x1 - s.x0);
  for (const q of s.segs) {
    const xa = L(s.x0 + dir * q.u0), xb = L(s.x0 + dir * q.u1), a = Math.min(xa, xb), b = Math.max(xa, xb);
    k.plain.push([box(a, b, q.h - 1.4, q.h - 0.05, Lz(s.z0), Lz(s.z1)), body]);
    const t = box(a, b, q.h - 0.05, q.h + 0.01, Lz(s.z0), Lz(s.z1));
    if (typeof tread === 'string') k.plain.push([t, tread]); else tx(tread, t);
    if (nose && !q.landing) { const xn = L(s.x0 + dir * q.u0); k.plain.push([box(xn - 0.06, xn + 0.06, q.h - 0.04, q.h + 0.025, Lz(s.z0), Lz(s.z1)), nose]); }
  }
}
/** a stone-faced wall or planter (world box) from y0 to y1 with red coping on top (R46-R50) */
function stoneWall(k: Kit, x0: number, x1: number, z0: number, z1: number, y0: number, y1: number, coping = true) {
  tx(stoneMat(), box(L(x0), L(x1), y0, y1, Lz(z0), Lz(z1)));
  if (coping) k.plain.push([box(L(x0) - 0.06, L(x1) + 0.06, y1, y1 + 0.12, Lz(z0) - 0.06, Lz(z1) + 0.06), COPING]);
}
/** flowering shrubs: oleander pink, ixora red, a green mass with the flowers on it (R46-R50) */
function flowers(k: Kit, x: number, z: number, y: number, r: number, col: string) {
  const rr = g.rand;
  k.plain.push([new THREE.IcosahedronGeometry(r, 1).scale(1.15, 0.8, 1).translate(L(x), y + r * 0.55, Lz(z)), ['#3f6e2a', '#4a7a30'][(rr() * 2) | 0]]);
  for (let i = 0; i < 7; i++) {
    const a = rr() * Math.PI * 2, d = r * (0.4 + rr() * 0.6);
    k.plain.push([new THREE.IcosahedronGeometry(r * 0.22, 0).translate(L(x) + Math.cos(a) * d, y + r * (0.7 + rr() * 0.6), Lz(z) + Math.sin(a) * d), col]);
  }
}
/** a frangipani: a short pale trunk forking into crooked limbs, leaf tufts at their ends, a few flowers (R21-R27, R55) */
function frangipani(k: Kit, x: number, z: number, s = 1, bloom = '#f4efe1') {
  const y = k.ground(L(x), Lz(z)), rr = g.rand, X = L(x), Z = Lz(z);
  SOLIDS.add(x, z, 0.35);
  k.plain.push([new THREE.CylinderGeometry(0.2 * s, 0.28 * s, 1.5 * s, 7).translate(X, y + 0.75 * s, Z), '#8c857b']);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + rr() * 0.8, len = (2.0 + rr() * 1.2) * s, tilt = 0.5 + rr() * 0.35;
    const dx = Math.cos(a) * Math.sin(tilt) * len, dz = Math.sin(a) * Math.sin(tilt) * len, dy = Math.cos(tilt) * len;
    const limb = new THREE.CylinderGeometry(0.08 * s, 0.15 * s, len, 5).translate(0, len / 2, 0);
    limb.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz).normalize())));
    k.plain.push([limb.translate(X, y + 1.4 * s, Z), '#918a80']);
    const tx0 = X + dx, ty = y + 1.4 * s + dy, tz = Z + dz;
    k.plain.push([new THREE.IcosahedronGeometry((0.9 + rr() * 0.4) * s, 1).scale(1.2, 0.7, 1.2).translate(tx0, ty + 0.3 * s, tz), ['#5d7d34', '#55752f', '#64843a'][(rr() * 3) | 0]]);
    for (let j = 0; j < 3; j++) k.plain.push([new THREE.IcosahedronGeometry(0.16 * s, 0).translate(tx0 + (rr() - 0.5) * 1.4 * s, ty + 0.6 * s, tz + (rr() - 0.5) * 1.4 * s), bloom]);
  }
}
/** a pot: red clay round (the verandas, R27-R45) or white square (the courts, R10-R16), a plant in it */
function pot(k: Kit, x: number, z: number, red: boolean, lift = 0) {
  const y = k.ground(L(x), Lz(z)) + lift, X = L(x), Z = Lz(z);
  if (red) k.plain.push([new THREE.CylinderGeometry(0.3, 0.22, 0.55, 10).translate(X, y + 0.28, Z), '#b24c36']);
  else k.plain.push([box(X - 0.33, X + 0.33, y, y + 0.6, Z - 0.33, Z + 0.33), '#efede7']);
  if (red) for (let i = 0; i < 4; i++) k.plain.push([new THREE.IcosahedronGeometry(0.2, 0).scale(1, 1.6, 0.5).rotateY(i * 1.6).translate(X + Math.cos(i * 1.6) * 0.12, y + 0.85 + (i % 2) * 0.15, Z + Math.sin(i * 1.6) * 0.12), '#4f8a35']);
  else {
    k.plain.push([new THREE.CylinderGeometry(0.05, 0.07, 1.3, 5).translate(X, y + 1.25, Z), '#8b7f6c']);
    for (let i = 0; i < 8; i++) k.plain.push([new THREE.ConeGeometry(0.1, 0.8, 3, 1).rotateX(Math.PI / 2).translate(0, 0, 0.4).scale(1, 0.3, 1).rotateX(0.75 + (i % 2) * 0.3).rotateY((i / 8) * Math.PI * 2).translate(X, y + 1.9, Z), '#4f8a2f']);
  }
  SOLIDS.add(x, z, red ? 0.3 : 0.4);
}
/** a portrait bust: a grey stone pedestal, the bronze bust, a pale ring of stones round its foot (R25-R45); each a
 *  little different; the plaque named only where the close-up is legible */
function bust(k: Kit, x: number, z: number, i: number, name?: string) {
  const y = k.ground(L(x), Lz(z)), X = L(x), Z = Lz(z), v = (n: number) => ((i * 37 + n * 11) % 10) / 10;
  k.plain.push([new THREE.CylinderGeometry(0.62, 0.66, 0.06, 14).translate(X, y + 0.03, Z), '#e7e5df']);
  for (let j = 0; j < 9; j++) { const a = (j / 9) * Math.PI * 2 + i; k.plain.push([new THREE.IcosahedronGeometry(0.09, 0).translate(X + Math.cos(a) * 0.5, y + 0.08, Z + Math.sin(a) * 0.5), '#f2f1ec']); }
  const ph = 1.05 + v(1) * 0.2;
  k.plain.push([box(X - 0.3, X + 0.3, y, y + ph, Z - 0.3, Z + 0.3), GRANITE]);
  k.plain.push([box(X - 0.33, X + 0.33, y + ph, y + ph + 0.05, Z - 0.33, Z + 0.33), '#a29f99']);
  // the bronze: a block with the plaque, the shoulders, the neck and the head
  const b = y + ph + 0.05, sw = 0.5 + v(2) * 0.14;
  k.plain.push([box(X - 0.22, X + 0.22, b, b + 0.3, Z - 0.18, Z + 0.18), BRONZE]);
  k.plain.push([new THREE.CylinderGeometry(sw / 2 - 0.05, sw / 2, 0.36, 12, 1).scale(1, 1, 0.48).translate(X, b + 0.48, Z), BRONZE]);
  k.plain.push([new THREE.CapsuleGeometry(0.11, sw - 0.24, 3, 8).rotateZ(Math.PI / 2).scale(1, 0.75, 0.95).translate(X, b + 0.66, Z), BRONZE]);
  k.plain.push([box(X - 0.05, X + 0.05, b + 0.5, b + 0.66, Z - 0.125, Z - 0.11), '#e8e4da']);
  k.plain.push([new THREE.CylinderGeometry(0.065, 0.075, 0.14, 8).translate(X, b + 0.8, Z), BRONZE]);
  k.plain.push([new THREE.SphereGeometry(0.125 + v(3) * 0.02, 12, 10).scale(0.9, 1.2, 1.05).translate(X, b + 0.98, Z - 0.01), '#4a4034']);
  k.plain.push([new THREE.SphereGeometry(0.13 + v(3) * 0.02, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.6).scale(0.92, 0.9, 1.05).translate(X, b + 1.0, Z + 0.005), '#3a3229']);
  if (name) k.signs.push({ text: name, x: X, y: b + 0.15, z: Z - 0.185, ry: Math.PI, w: 0.4, colors: ['#4a4035', '#e3d5b4'] });
  SOLIDS.add(x, z, 0.45);
}
/** the hall's clock face: a dark patterned square border round a white dial (R58, R59) */
const clockMat = lazy(() => new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvas(128, 128, (c) => {
  c.fillStyle = '#2a2724'; c.fillRect(0, 0, 128, 128);
  c.fillStyle = '#8a7a5c'; for (let i = 6; i < 122; i += 10) { c.fillRect(i, 3, 5, 5); c.fillRect(i, 120, 5, 5); c.fillRect(3, i, 5, 5); c.fillRect(120, i, 5, 5); }
  c.fillStyle = '#f2eee4'; c.beginPath(); c.arc(64, 64, 46, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#2a2724'; c.lineWidth = 3; c.stroke();
  c.fillStyle = '#2a2724'; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; c.fillRect(64 + Math.sin(a) * 38 - 2, 64 - Math.cos(a) * 38 - 2, 4, 4); }
  c.lineCap = 'round'; c.lineWidth = 5; c.beginPath(); c.moveTo(64, 64); c.lineTo(84, 52); c.stroke();
  c.lineWidth = 3.5; c.beginPath(); c.moveTo(64, 64); c.lineTo(60, 30); c.stroke();
}) }));

// ---------- the parts of the model, each drawn in the extras ----------
function hallParts(k: Kit) {
  // the plinth round the hall: dark grey (R50-R54)
  for (const [x0, x1, z0, z1] of [NAVE, AISLE_N, AISLE_S]) k.plain.push([box(L(x0) - 0.1, L(x1) + 0.1, U - 0.6, FLOOR + 0.35, Lz(z0) - 0.1, Lz(z1) + 0.1), '#5e5852']);
  // the high hall's broad hip roof with a finial (R49-R53), the aisles' lean-to roofs below the clerestory
  const nWall = FLOOR + k.wallTop(4), aWall = FLOOR + k.wallTop(2);
  const top = hipRoof(k, L(NAVE[0]), L(NAVE[1]), Lz(NAVE[2]), Lz(NAVE[3]), nWall, 0.52, 1.3, ROOF_AGED);
  k.plain.push([new THREE.ConeGeometry(0.22, 1.4, 6).translate(L((NAVE[0] + NAVE[1]) / 2), top + 0.6, Lz((NAVE[2] + NAVE[3]) / 2)), '#7a3a28']);
  leanTo(k, L(AISLE_N[0]) - 0.8, L(AISLE_N[1]), Lz(NAVE[2]), Lz(AISLE_N[2]) - 0.9, nWall - 3.6, aWall - 0.1);
  leanTo(k, L(AISLE_S[0]) - 0.8, L(AISLE_S[1]), Lz(NAVE[3]), Lz(AISLE_S[3]) + 0.9, nWall - 3.6, aWall - 0.1);
  // the entrance block: the wall behind the portico rises to the canopy; the lower tiled canopy over the portico, below
  // the clerestory, a dark edge under its eaves (R49-R54)
  const fx = L(NARTHEX[1]), cz0 = Lz(NARTHEX[2]) - 0.6, cz1 = Lz(NARTHEX[3]) + 0.6, eave = FLOOR + 8.5;
  k.plain.push([box(L(NARTHEX[0]), fx, FLOOR + k.wallTop(2) - 0.1, FLOOR + 11.0, Lz(NARTHEX[2]), Lz(NARTHEX[3])), WALL]);
  k.roof.c = new THREE.Color(ROOF);
  const cx0 = L(-996.6), cx1 = L(-990.4), hi = FLOOR + 11.3;
  k.roof.quad([cx0, hi, cz0 + 1.5], [L(NAVE[1]), hi + 0.25, cz0 + 1.5], [L(NAVE[1]), hi + 0.25, cz1 - 1.5], [cx0, hi, cz1 - 1.5]);
  k.roof.quad([cx1, eave, cz1], [cx1, eave, cz0], [cx0, hi, cz0 + 1.5], [cx0, hi, cz1 - 1.5]);
  k.roof.quad([cx1, eave, cz0], [cx0, eave + 0.3, cz0], [cx0, hi, cz0 + 1.5], [cx0, hi, cz0 + 1.5]);
  k.roof.quad([cx0, eave + 0.3, cz1], [cx1, eave, cz1], [cx0, hi, cz1 - 1.5], [cx0, hi, cz1 - 1.5]);
  k.plain.push([box(cx1 - 0.08, cx1 + 0.05, eave - 0.3, eave + 0.03, cz0, cz1), SOFFIT]);
  k.plain.push([box(fx, cx1, eave - 0.12, eave - 0.05, cz0, cz1), '#f1ede4']);
  // the portico: four tall square supports, the beam across them, the ceiling under the canopy
  const px = L(-992.0);
  for (const z of COLS) {
    k.plain.push([box(px - 0.42, px + 0.42, FLOOR, FLOOR + 8.3, Lz(z) - 0.42, Lz(z) + 0.42), WALL]);
    k.plain.push([box(px - 0.5, px + 0.5, FLOOR, FLOOR + 0.3, Lz(z) - 0.5, Lz(z) + 0.5), '#dcd6ca']);
    SOLIDS.add(-992.0, z, 0.55);
  }
  k.plain.push([box(px - 0.5, px + 0.5, FLOOR + 8.0, eave - 0.05, cz0 + 0.3, cz1 - 0.3), WALL]);
  // the doors in the three bays, the GREAT HALL sign over the middle one, the Established 1948 plaque above it with a
  // round dark-edged feature either side (R54: in this order from the top)
  for (let i = 0; i < 3; i++) {
    const zc = (COLS[i] + COLS[i + 1]) / 2, w = i === 1 ? 1.4 : 1.1;
    k.plain.push([box(fx, fx + 0.06, FLOOR, FLOOR + 3.0, Lz(zc) - w, Lz(zc) + w), '#241d18']);
    k.plain.push([box(fx + 0.06, fx + 0.1, FLOOR, FLOOR + 3.0, Lz(zc) - 0.03, Lz(zc) + 0.03), '#5c4636']);
    k.plain.push([box(fx, fx + 0.12, FLOOR + 3.0, FLOOR + 3.15, Lz(zc) - w - 0.1, Lz(zc) + w + 0.1), '#e6e1d6']);
  }
  k.signs.push({ text: 'GREAT HALL', x: fx + 0.08, y: FLOOR + 3.55, z: Lz(AXIS), ry: Math.PI / 2, w: 2.0, colors: ['#2b2621', '#f2eee5'] });
  k.signs.push({ text: 'Established 1948', x: fx + 0.08, y: FLOOR + 4.75, z: Lz(AXIS), ry: Math.PI / 2, w: 2.3, colors: ['#2b2621', '#d9b45a'] });
  for (const d of [-1.9, 1.9]) {
    k.plain.push([new THREE.CylinderGeometry(0.34, 0.34, 0.08, 18).rotateZ(Math.PI / 2).translate(fx + 0.04, FLOOR + 4.75, Lz(AXIS + d)), '#2a2725']);
    k.plain.push([new THREE.CylinderGeometry(0.22, 0.22, 0.1, 18).rotateZ(Math.PI / 2).translate(fx + 0.05, FLOOR + 4.75, Lz(AXIS + d)), '#8b8478']);
  }
  // the platform under the portico: paving, its stone faces either side of the steps; the steps (R54)
  k.plain.push([box(L(GH.platform.x0), L(GH.platform.x1), FLOOR - 0.05, FLOOR + 0.02, Lz(GH.platform.z0), Lz(GH.platform.z1)), '#b9b3a8']);
  const pz0 = GH.porticoSteps.z0, pz1 = GH.porticoSteps.z1;
  for (const [a, b] of [[GH.platform.z0, pz0], [pz1, GH.platform.z1]]) stoneWall(k, -990.9, GH.platform.x1, a, b, U - 0.3, FLOOR - 0.12);
  for (const z of [GH.platform.z0, GH.platform.z1]) stoneWall(k, GH.platform.x0 + 7, GH.platform.x1, z - 0.15, z + 0.15, U - 0.3, FLOOR - 0.12);
  const ps = stairsOf().find((s) => s.x0 === GH.porticoSteps.x0)!;
  drawSteps(k, ps, STEP_GREY, '#8d8981');

  // the semicircular projection behind the hall (the earlier brief's S4): a curved wall, a ring of columns, a curved roof
  const cx = L(APSE.x), cz = Lz(APSE.z), r = APSE.r, at = FLOOR + 7.2;
  k.plain.push([new THREE.CylinderGeometry(r + 2.6, r + 2.6, 1.6, 28, 1, false, Math.PI, Math.PI).translate(cx, FLOOR - 0.75, cz), '#9a8a74']);
  k.plain.push([new THREE.CylinderGeometry(r, r, at - FLOOR + 1.6, 28, 1, false, Math.PI, Math.PI).translate(cx, (at + FLOOR - 1.6) / 2, cz), WHITE]);
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI + (i / 8) * Math.PI;
    k.plain.push([new THREE.CylinderGeometry(0.32, 0.36, at - FLOOR - 0.4, 10).translate(cx + Math.sin(a) * (r + 2.0), FLOOR + (at - FLOOR - 0.4) / 2, cz + Math.cos(a) * (r + 2.0)), '#f8f5ee']);
  }
  k.plain.push([new THREE.CylinderGeometry(r + 2.6, r + 2.6, 0.4, 28, 1, false, Math.PI, Math.PI).translate(cx, at, cz), FASCIA]);
  k.plain.push([new THREE.CylinderGeometry(0.6, r + 3.1, 3.2, 28, 1, false, Math.PI, Math.PI).translate(cx, at + 1.8, cz), ROOF_AGED]);
  for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; SOLIDS.add(...k.world(cx + Math.sin(a) * (r + 2.4), cz + Math.cos(a) * (r + 2.4)), 0.6); }
}

/** the clock tower: a rectangular white shaft with flat faces and explicit corners (R58, R59, A01) */
function towerParts(k: Kit) {
  const T = TOWER, x0 = L(T.x0), x1 = L(T.x1), z0 = Lz(T.z0), z1 = Lz(T.z1), xm = (x0 + x1) / 2, zm = (z0 + z1) / 2, b = U;
  const P = 0.32, S0 = b + T.stage[0], S1 = b + T.stage[1];
  k.plain.push([box(x0 - 0.12, x1 + 0.12, b - 0.4, b + 0.5, z0 - 0.12, z1 + 0.12), '#5e5852']);
  k.plain.push([box(x0, x1, b, b + T.shaft, z0, z1), WALL]);
  // the small square openings in a vertical series on the court (east) face and the north face (R58, R59)
  for (let y = b + 9; y < b + T.shaft - 1.5; y += 2.6) {
    k.plain.push([box(x1, x1 + 0.03, y, y + 0.45, zm - 0.22, zm + 0.22), '#24211f']);
    k.plain.push([box(xm - 0.22, xm + 0.22, y + 1.3, y + 1.75, z0 - 0.03, z0), '#24211f']);
  }
  // the projecting window with its pointed red cap low on the court face (R06-R08, R52)
  {
    const oy = b + 4.4, ox = x1, w = 0.85;
    k.plain.push([new THREE.CylinderGeometry(0.75, 0.25, 0.9, 4, 1).rotateY(Math.PI / 4).scale(0.9, 1, 1.4).translate(ox + 0.32, oy - 0.45, zm), WALL]);
    k.plain.push([box(ox, ox + 0.75, oy, oy + 2.4, zm - w, zm + w), WALL]);
    k.plain.push([box(ox + 0.75, ox + 0.78, oy + 0.35, oy + 2.1, zm - w + 0.18, zm + w - 0.18), '#2c2f33']);
    for (const d of [-0.28, 0.28]) k.plain.push([box(ox + 0.78, ox + 0.81, oy + 0.35, oy + 2.1, zm + d - 0.03, zm + d + 0.03), '#f2efe8']);
    k.plain.push([box(ox + 0.78, ox + 0.81, oy + 1.15, oy + 1.21, zm - w + 0.18, zm + w - 0.18), '#f2efe8']);
    k.plain.push([box(ox - 0.02, ox + 0.92, oy + 2.4, oy + 2.55, zm - w - 0.1, zm + w + 0.1), '#ece7dc']);
    k.plain.push([new THREE.ConeGeometry(1.0, 1.35, 4).rotateY(Math.PI / 4).scale(0.62, 1, 1.25).translate(ox + 0.42, oy + 3.2, zm), '#a33d2a']);
    k.plain.push([new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5).translate(ox + 0.42, oy + 4.05, zm), '#7c2f22']);
  }
  // the ledge and the balustrade under the clock stage, the stage projecting, its cornice (R58, R59)
  k.plain.push([box(x0 - 0.4, x1 + 0.4, b + T.shaft, b + T.shaft + 0.22, z0 - 0.4, z1 + 0.4), '#ece7dc']);
  for (const [a0, a1, c, alongX] of [[x0 - 0.3, x1 + 0.3, z0 - 0.3, true], [x0 - 0.3, x1 + 0.3, z1 + 0.3, true], [z0 - 0.3, z1 + 0.3, x0 - 0.3, false], [z0 - 0.3, z1 + 0.3, x1 + 0.3, false]] as [number, number, number, boolean][]) {
    for (let a = a0 + 0.2; a < a1 - 0.1; a += 0.38) k.plain.push([alongX ? box(a - 0.06, a + 0.06, b + T.shaft + 0.22, S0 - 0.12, c - 0.06, c + 0.06) : box(c - 0.06, c + 0.06, b + T.shaft + 0.22, S0 - 0.12, a - 0.06, a + 0.06), '#f2efe8']);
  }
  k.plain.push([box(x0 - 0.36, x1 + 0.36, S0 - 0.12, S0, z0 - 0.36, z1 + 0.36), '#ece7dc']);
  k.plain.push([box(x0 - P, x1 + P, S0, S1, z0 - P, z1 + P), WALL]);
  k.plain.push([box(x0 - 0.5, x1 + 0.5, S1, S1 + 0.3, z0 - 0.5, z1 + 0.5), '#ece7dc']);
  // the clock in its square dark surround on the faces the references show (east and north); the other two plain
  const cs = 3.3, cy = (S0 + S1) / 2;
  const east = new THREE.PlaneGeometry(cs, cs).rotateY(Math.PI / 2).translate(x1 + P + 0.02, cy, zm);
  const north = new THREE.PlaneGeometry(cs, cs).rotateY(Math.PI).translate(xm, cy, z0 - P - 0.02);
  for (const p of [east, north]) { const m = new THREE.Mesh(p, clockMat()); m.castShadow = false; k.meshes.push(m); }
  // the lantern stage: corner piers, dark openings; the red shaped cap and its finial (A01, R58)
  const lw = 1.9, ly0 = S1 + 0.3, ly1 = b + T.lantern;
  k.plain.push([box(xm - lw + 0.25, xm + lw - 0.25, ly0, ly1, zm - lw + 0.25, zm + lw - 0.25), '#2a2623']);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.plain.push([box(xm + dx * lw - 0.3, xm + dx * lw + 0.3, ly0, ly1, zm + dz * lw - 0.3, zm + dz * lw + 0.3).translate(-dx * 0.3, 0, -dz * 0.3), WALL]);
  k.plain.push([box(xm - lw - 0.15, xm + lw + 0.15, ly1, ly1 + 0.25, zm - lw - 0.15, zm + lw + 0.15), '#ece7dc']);
  const prof = [[0.01, 0], [2.6, 0], [2.4, 0.35], [1.9, 0.9], [1.25, 1.6], [0.8, 2.25], [0.45, 2.75], [0.12, 3.0], [0.01, 3.05]].map(([r, y]) => new THREE.Vector2(r, y));
  k.plain.push([new THREE.LatheGeometry(prof, 4).rotateY(Math.PI / 4).translate(xm, ly1 + 0.25, zm), '#a83f2b']);
  k.plain.push([new THREE.SphereGeometry(0.16, 8, 6).translate(xm, ly1 + 3.45, zm), '#7c2f22']);
  k.plain.push([new THREE.CylinderGeometry(0.03, 0.04, 0.9, 5).translate(xm, ly1 + 3.9, zm), '#5a4a3a']);
}

/** the wings' verandas: the floor a step up with its red edge, white columns at varied spacing, the ceiling; the roofs
 *  over the whole outlines (R24-R45) */
function veranda(k: Kit, alongX: boolean, a0: number, a1: number, wall: number, edge: number, eave: number, base: number, skip: [number, number][] = []) {
  const s = Math.sign(edge - wall), lo = Math.min(wall, edge), hi = Math.max(wall, edge);
  const B = (p0: number, p1: number, y0: number, y1: number, c0: number, c1: number) => (alongX ? box(L(p0), L(p1), y0, y1, Lz(c0), Lz(c1)) : box(L(c0), L(c1), y0, y1, Lz(p0), Lz(p1)));
  k.plain.push([B(a0, a1, base - 0.3, base + 0.15, lo, hi), '#bdb6aa']);
  k.plain.push([B(a0, a1, base - 0.3, base + 0.16, edge - s * 0.12 - 0.06, edge - s * 0.12 + 0.06), SKIRT]);
  k.plain.push([B(a0, a1, eave - 0.1, eave - 0.04, lo, hi), '#f1ede4']);
  // the columns: about 3 m apart, the spacing varying a little, none in a passage
  let i = 0;
  for (let a = a0 + 0.4; a <= a1 - 0.3; a += 2.8 + ((i++ * 0.47) % 0.8)) {
    if (skip.some(([p, q]) => a > p - 0.5 && a < q + 0.5)) continue;
    const c = edge - s * 0.35;
    k.plain.push([B(a - 0.18, a + 0.18, base + 0.15, eave - 0.1, c - 0.18, c + 0.18), '#fbfaf6']);
    SOLIDS.add(...(alongX ? [a, c] : [c, a]) as [number, number], 0.25);
  }
}
function wingParts(k: Kit) {
  const eave = U + k.wallTop(1);
  // north and south ranges, their east arms; the links into the hall's front
  for (const [w, sgn] of [[NORTH, 1], [SOUTH, -1]] as [typeof NORTH, number][]) {
    const [x0, x1, z0, z1] = w.range, [ax0, ax1, az0, az1] = w.arm, [lx0, lx1, lz0, lz1] = w.link;
    hipRoof(k, L(x0), L(x1), Lz(z0), Lz(z1), eave, 0.5, 0.7);
    hipRoof(k, L(ax0), L(ax1), Lz(az0), Lz(az1), eave, 0.5, 0.7);
    hipRoof(k, L(lx0), L(lx1), Lz(lz0), Lz(lz1), eave, 0.5, 0.7);
    const edge = sgn > 0 ? z1 : z0, gb = GABLES[sgn > 0 ? 0 : 1];
    veranda(k, true, -993.5, ax0, w.wall, edge, eave, U, [[gb.x0, gb.x1]]);
    veranda(k, false, az0, az1, w.armWall, ax0, eave, U);
  }
  // the arched gable passage in the middle of each side wing: a taller gabled block across the range, its gable on the
  // court, the arch through it on both faces, a blank plaque over the arch (the photographs' lettering is not legible)
  for (const gb of GABLES) {
    const x0 = L(gb.x0), x1 = L(gb.x1), z0 = Lz(gb.z0), z1 = Lz(gb.z1), wt = U + 5.0, xm = (x0 + x1) / 2;
    for (const [a, b] of [[x0, x0 + 0.5], [x1 - 0.5, x1]]) k.plain.push([box(a, b, U, wt, z0, z1), WALL]);
    for (const z of [z0, z1 - 0.45]) archWall(k, false, z, x0 + 0.5, x1 - 0.5, U, wt, xm - 1.3, xm + 1.3, U + 2.1, 0.45);
    k.plain.push([box(x0 + 0.5, x1 - 0.5, U + 3.45, U + 3.55, z0, z1), '#ece6da']);
    const zf = gb.face === gb.z1 ? z1 : z0, out = gb.face === gb.z1 ? 1 : -1;
    k.plain.push([box(xm - 1.6, xm + 1.6, U + 3.7, U + 4.3, zf - 0.02 + (out > 0 ? 0 : -0.04), zf + 0.04 + (out > 0 ? 0 : -0.02)), '#e9e4d8']);
    // the gable roof, ridge across the range, the white pediment on the court
    const pitch = 0.6, half = (x1 - x0) / 2 + 0.6, ridge = wt + half * pitch;
    k.roof.c = new THREE.Color(ROOF);
    k.roof.quad([x0 - 0.6, wt, z1 + 0.6], [x0 - 0.6, wt, z0 - 0.6], [xm, ridge, z0 - 0.6], [xm, ridge, z1 + 0.6]);
    k.roof.quad([x1 + 0.6, wt, z0 - 0.6], [x1 + 0.6, wt, z1 + 0.6], [xm, ridge, z1 + 0.6], [xm, ridge, z0 - 0.6]);
    for (const z of [z0, z1]) k.plain.push([flat([[x0, wt], [x1, wt], [xm, ridge - 0.2]], 0).translate(0, 0, z + (z === z0 ? 0.01 : -0.01)), WALL]);
    k.plain.push([box(x0 - 0.6, x1 + 0.6, wt - 0.25, wt + 0.03, zf + out * 0.6 - 0.05, zf + out * 0.6 + 0.05), SOFFIT]);
  }
  // the AC units on the wings' outer faces (the earlier brief's S6)
  for (const x of [-990, -975, -961, -947]) for (const [z, s] of [[92.8, -1], [164.1, 1]] as [number, number][]) {
    const y = k.ground(L(x), Lz(z));
    k.plain.push([box(L(x) - 0.42, L(x) + 0.42, y + 2.3, y + 2.85, Lz(z) + s * 0.02, Lz(z) + s * 0.34), '#dcdcd6']);
    k.plain.push([box(L(x) - 0.3, L(x) + 0.3, y + 2.4, y + 2.75, Lz(z) + s * 0.34, Lz(z) + s * 0.36), '#4a4d50']);
  }
}

function lowerCourtParts(k: Kit) {
  const eave = LO + k.wallTop(1);
  // the bust wing: two crimson roofs side by side over it (A01), its veranda on the court; the narrow north wing; the
  // covered link from the bust wing to the south pavilion
  const bw = BUST_WING, zm = (bw.z0 + bw.z1) / 2;
  hipRoof(k, L(bw.x0), L(bw.x1), Lz(bw.z0), Lz(zm), eave, 0.45, 0.6, '#8f2b33');
  hipRoof(k, L(bw.x0), L(bw.x1), Lz(zm), Lz(bw.z1), eave, 0.45, 0.6, '#8f2b33');
  veranda(k, true, bw.x0, bw.x1, bw.wall, bw.z0, eave, LO);
  const nl = NORTH_LOW;
  hipRoof(k, L(nl.x0), L(nl.x1), Lz(nl.z0), Lz(nl.z1), eave, 0.5, 0.6);
  veranda(k, true, nl.x0, nl.x1, nl.wall, nl.z1, eave, LO);
  {
    const x0 = bw.x1, x1 = -914.3, y = LO;
    k.plain.push([box(L(x0) - 0.2, L(x1) + 0.2, eave, eave + 0.22, Lz(bw.z0), Lz(bw.wall)), '#d9d4c8']);
    for (const x of [x0 + 0.4, x1 - 0.4]) { k.plain.push([box(L(x) - 0.17, L(x) + 0.17, y, eave, Lz(bw.z0) + 0.2, Lz(bw.z0) + 0.54), '#fbfaf6']); SOLIDS.add(x, bw.z0 + 0.37, 0.25); }
  }
  // the bust walk: a lawn strip before the veranda, a clipped hedge along it behind the busts, the busts once each, a
  // white-edged concrete walk to the veranda between some of them (R25-R45)
  k.plain.push([box(L(bw.x0), L(-911.2), LO - 0.2, LO + 0.05, Lz(141.6), Lz(bw.z0)), LAWN]);
  g.hedge(k, L(bw.x0 + 0.5), Lz(bw.z0 - 0.35), L(-918.5), Lz(bw.z0 - 0.35));
  BUSTS.forEach((b, i) => bust(k, b.x, b.z, i, b.name));
  for (const x of [-927.2, -920.2, -913.2]) frangipani(k, x, 141.9, 1.05);
  // red pots along the verandas (R27-R45)
  for (let x = bw.x0 + 1.5; x < bw.x1 - 0.5; x += 3.1) pot(k, x, bw.z0 + 1.4, true, 0.15);
  for (let x = nl.x0 + 2; x < nl.x1 - 0.5; x += 3.8) pot(k, x, nl.z1 - 1.0, true, 0.15);
  // the court: pale paving, patches of crazy paving, raised planting beds of stone with red coping and red flowers
  tx(slabMat(), new THREE.PlaneGeometry(GH.lower.x1 - GH.lower.x0 + 1.4, 141.6 - nl.z1).rotateX(-Math.PI / 2).translate(L((GH.lower.x0 + GH.lower.x1 + 1.4) / 2), LO + 0.03, Lz((nl.z1 + 141.6) / 2)));
  for (const [x, z, w, d] of [[-930, 138.5, 2.4, 3.0], [-917.5, 132.5, 3.2, 2.2], [-915.5, 120.0, 2.6, 2.6], [-926.0, 119.4, 2.2, 2.6]]) tx(crazyMat(), new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2).translate(L(x), LO + 0.04, Lz(z)));
  for (const [x, z] of [[-918, 119.4], [-918, 137.6]]) {
    stoneWall(k, x - 1.6, x + 1.6, z - 0.8, z + 0.8, LO - 0.2, LO + 0.6);
    k.plain.push([box(L(x - 1.5), L(x + 1.5), LO + 0.6, LO + 0.66, Lz(z - 0.7), Lz(z + 0.7)), SOIL]);
    flowers(k, x - 0.7, z, LO + 0.66, 0.55, '#d0312d'); flowers(k, x + 0.7, z, LO + 0.66, 0.5, '#e0443a');
  }
  // the drain grates in the paving (R01-R17)
  for (const [x, z] of [[-929, 126.8], [-921.5, 131.8], [-916, 125.5], [-926, 135], [-921, 118.5]]) grate(k, x, z, LO);
}
/** a rectangular inset drain grate, flush with the paving */
function grate(k: Kit, x: number, z: number, y: number, alongX = true) {
  const [a, b] = alongX ? [0.5, 0.2] : [0.2, 0.5];
  k.plain.push([box(L(x) - a, L(x) + a, y + 0.02, y + 0.05, Lz(z) - b, Lz(z) + b), '#3a3734']);
  for (let i = -3; i <= 3; i++) k.plain.push([alongX ? box(L(x) + i * 0.13 - 0.025, L(x) + i * 0.13 + 0.025, y + 0.05, y + 0.06, Lz(z) - b + 0.04, Lz(z) + b - 0.04) : box(L(x) - a + 0.04, L(x) + a - 0.04, y + 0.05, y + 0.06, Lz(z) + i * 0.13 - 0.025, Lz(z) + i * 0.13 + 0.025), '#77736d']);
}

function upperCourtParts(k: Kit) {
  // weathered slab paving over the court and on into the gap to the stairs; lawn panels set into it in a grid, the axis
  // walk between them; crazy-paving patches; drain grates (A01, R01-R17, R51-R53)
  const px0 = -990.6, px1 = NORTH.arm[0], cz0 = NORTH.range[3], cz1 = SOUTH.range[2];
  tx(slabMat(), new THREE.PlaneGeometry(px1 - px0, cz1 - cz0).rotateX(-Math.PI / 2).translate(L((px0 + px1) / 2), U + 0.03, Lz((cz0 + cz1) / 2)));
  tx(slabMat(), new THREE.PlaneGeometry(GH.courtStairs.x1 - px1, SOUTH.arm[2] - NORTH.arm[3]).rotateX(-Math.PI / 2).translate(L((px1 + GH.courtStairs.x1) / 2), U + 0.03, Lz((NORTH.arm[3] + SOUTH.arm[2]) / 2)));
  const rows: [number, number][] = [[-986.5, -977.5], [-975, -966], [-963, -954]];
  const cols: [number, number][] = [[106.2, 113.8], [116.6, 123.0], [134.2, 140.6], [143.4, 149.6]];
  for (const [x0, x1] of rows) for (const [z0, z1] of cols) {
    k.plain.push([box(L(x0), L(x1), U - 0.2, U + 0.06, Lz(z0), Lz(z1)), (x0 + z0) % 2 > 1 ? '#6f7a40' : LAWN]);
    k.plain.push([box(L(x0) - 0.08, L(x1) + 0.08, U - 0.2, U + 0.08, Lz(z0) - 0.08, Lz(z0) + 0.02), '#c9c4b8']);
  }
  for (const [x, z, w, d] of [[-970.5, 125.3, 3.0, 2.0], [-958.5, 131.5, 2.6, 2.4], [-982, 131.9, 2.2, 2.0], [-947, 120, 2.8, 2.2], [-950, 145.5, 2.2, 2.6]]) tx(crazyMat(), new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2).translate(L(x), U + 0.04, Lz(z)));
  for (const [x, z] of [[-980, 124.2], [-972, 133], [-964, 124.2], [-956, 133], [-948, 124.2], [-985, 115], [-985, 142], [-960, 104.6], [-960, 151.2]]) grate(k, x, z, U);
  // the planting: two big shade trees in the court's lower half, flowering shrubs at the panels' corners, small palms in
  // white square pots, palms along the wings (A01, R01-R16, R51-R53)
  const parts: [THREE.BufferGeometry, string][] = [];
  for (const [x, z] of [[-958.5, 119.8], [-958.5, 137.4]]) broadleaf(k, parts, x, z, { h: 8.5, spread: 11, seed: x + z * 3, origin: O });
  for (const [geo, c] of parts) k.plain.push([geo, c]);
  for (const [x, z, c] of [[-986, 114.6, '#e58fb0'], [-986, 142.4, '#e58fb0'], [-976, 114.6, '#d0312d'], [-976, 142.4, '#e58fb0'], [-965, 114.6, '#e58fb0'], [-965, 142.4, '#d0312d']] as [number, number, string][]) flowers(k, x, z, U, 0.8, c);
  for (const [x, z] of [[-988.6, 121.5], [-988.6, 136.3], [-968.2, 124.0], [-968.2, 133.4], [-952.5, 124.0], [-952.5, 133.4], [-944.5, 121.2], [-944.5, 135.9]]) pot(k, x, z, false);
  for (const [x, z] of [[-980, 104.6], [-952, 151.4]]) pot(k, x, z, true);
  for (const [x, z] of [[-1012, 88.5], [-1006, 88.4], [-1012, 168.5]]) g.palm(k, L(x), Lz(z), 12 + g.rand() * 3);
  // the dark rounded object on its white segmented base (R51-R53: its function is not established)
  {
    const x = L(OBJECT.x), z = Lz(OBJECT.z), y = U;
    for (const d of [-0.85, 0, 0.85]) k.plain.push([box(x + d - 0.38, x + d + 0.38, y, y + 0.55, z - 0.55, z + 0.55), '#f1efe9']);
    k.plain.push([new THREE.CylinderGeometry(0.82, 0.82, 2.5, 16).rotateZ(Math.PI / 2).translate(x, y + 1.35, z), '#1e2022']);
    for (const d of [-1.25, 1.25]) k.plain.push([new THREE.SphereGeometry(0.82, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2).rotateZ(d < 0 ? Math.PI / 2 : -Math.PI / 2).scale(0.25, 1, 1).translate(x + d, y + 1.35, z), '#1e2022']);
    k.plain.push([new THREE.CylinderGeometry(0.03, 0.03, 2.2, 5).translate(x + 0.9, y + 1.1, z + 0.86), '#c9c9c4']);
    SOLIDS.add(OBJECT.x, OBJECT.z, 1.4);
  }
}

/** the way down between the courts: the retaining edge, the piers, the tanks, the two flights between planters */
function stairParts(k: Kit) {
  const cs = GH.courtStairs, st = stairsOf().find((s) => s.x0 === cs.x0 && s.x1 === cs.x1)!;
  drawSteps(k, st, '#57544f', treadMat(), '#3e3c39');
  // the cheek planters either side, stepping down with the flights: stone with red coping, soil and flowers (R46-R50)
  const dir = Math.sign(st.x1 - st.x0);
  for (const [z0, z1] of [[cs.z0 - 1.9, cs.z0], [cs.z1, cs.z1 + 1.9]]) {
    for (const q of st.segs) {
      const xa = st.x0 + dir * q.u0, xb = st.x0 + dir * q.u1;
      stoneWall(k, Math.min(xa, xb), Math.max(xa, xb) + 0.01, z0, z1, LO - 0.3, q.h + 0.55);
      if (q.landing) {
        k.plain.push([box(L(Math.min(xa, xb)) + 0.15, L(Math.max(xa, xb)) - 0.15, q.h + 0.67, q.h + 0.72, Lz(z0 + 0.15), Lz(z1 - 0.15)), SOIL]);
        flowers(k, (xa + xb) / 2, (z0 + z1) / 2, q.h + 0.72, 0.6, (z0 + q.h) % 2 > 1 ? '#e58fb0' : '#d0312d');
      }
    }
    wallSolids(st.x0, (z0 + z1) / 2, st.x1, (z0 + z1) / 2, 0.8);
  }
  // the planter dividing the lower flight (R46, R47): the way up is either side of it
  {
    const xa = cs.x0, xb = cs.x0 - 2.25, z0 = AXIS - 2.6, z1 = AXIS + 1.4, y = st.at(xb) + 0.6;
    stoneWall(k, xb, xa, z0, z1, LO - 0.3, y);
    k.plain.push([box(L(xb) + 0.15, L(xa) - 0.15, y + 0.12, y + 0.18, Lz(z0 + 0.15), Lz(z1 - 0.15)), SOIL]);
    flowers(k, (xa + xb) / 2, z0 + 1.0, y + 0.18, 0.7, '#e58fb0'); flowers(k, (xa + xb) / 2, z1 - 1.0, y + 0.18, 0.6, '#d0312d');
    wallSolids(xa, (z0 + z1) / 2, xb, (z0 + z1) / 2, (z1 - z0) / 2);
  }
  // the retaining edge across the gap beside the stairs, its stone face down to the lower court, planters on top
  for (const [z0, z1] of [[NORTH.arm[3], cs.z0 - 1.9], [cs.z1 + 1.9, SOUTH.arm[2]]]) {
    if (z1 - z0 < 0.3) continue;
    stoneWall(k, cs.x1 - 0.1, cs.x1 + 0.5, z0, z1, LO - 0.3, U + 0.55);
    wallSolids(cs.x1 + 0.2, z0, cs.x1 + 0.2, z1, 0.4);
  }
  // the square white piers on stone bases, lantern heads and red caps (R11-R20)
  for (const [x, z] of PIERS) {
    const X = L(x), Z = Lz(z), y = U;
    stoneWall(k, x - 0.85, x + 0.85, z - 0.85, z + 0.85, y - 0.3, y + 0.45);
    k.plain.push([box(X - 0.48, X + 0.48, y + 0.57, y + 4.6, Z - 0.48, Z + 0.48), WALL]);
    k.plain.push([box(X - 0.55, X + 0.55, y + 4.6, y + 4.75, Z - 0.55, Z + 0.55), '#ece7dc']);
    k.plain.push([box(X - 0.4, X + 0.4, y + 4.75, y + 5.55, Z - 0.4, Z + 0.4), '#2b2a28']);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.plain.push([box(X + dx * 0.4 - 0.06, X + dx * 0.4 + 0.06, y + 4.75, y + 5.55, Z + dz * 0.4 - 0.06, Z + dz * 0.4 + 0.06), '#1a1918']);
    k.plain.push([new THREE.LatheGeometry([[0.01, 0], [0.82, 0], [0.62, 0.18], [0.4, 0.38], [0.18, 0.6], [0.04, 0.8], [0.01, 0.82]].map(([r, h]) => new THREE.Vector2(r, h)), 4).rotateY(Math.PI / 4).translate(X, y + 5.55, Z), '#a83f2b']);
    SOLIDS.add(x, z, 0.95);
  }
  // the black tanks on open metal stands against the arms' ends (R11-R20)
  for (const [x, z] of TANKS) {
    const X = L(x), Z = Lz(z), y = U, hgt = 2.7;
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.plain.push([box(X + dx * 0.72 - 0.04, X + dx * 0.72 + 0.04, y, y + hgt, Z + dz * 0.72 - 0.04, Z + dz * 0.72 + 0.04), IRON]);
    for (const yy of [y + 0.9, y + 1.8]) for (const [a, b, c, d] of [[-0.72, 0.72, -0.72, -0.72], [-0.72, 0.72, 0.72, 0.72], [-0.72, -0.72, -0.72, 0.72], [0.72, 0.72, -0.72, 0.72]]) k.plain.push([box(X + Math.min(a, b) - 0.03, X + Math.max(a, b) + 0.03, yy, yy + 0.05, Z + Math.min(c, d) - 0.03, Z + Math.max(c, d) + 0.03), IRON]);
    k.plain.push([box(X - 0.85, X + 0.85, y + hgt, y + hgt + 0.08, Z - 0.85, Z + 0.85), IRON]);
    k.plain.push([new THREE.CylinderGeometry(0.72, 0.72, 1.5, 16).translate(X, y + hgt + 0.83, Z), '#1d1f21']);
    k.plain.push([new THREE.CylinderGeometry(0.22, 0.3, 0.16, 12).translate(X, y + hgt + 1.66, Z), '#1d1f21']);
    for (const yy of [0.35, 0.75, 1.15]) k.plain.push([new THREE.TorusGeometry(0.725, 0.025, 4, 18).rotateX(Math.PI / 2).translate(X, y + hgt + 0.08 + yy, Z), '#2b2d30']);
    for (let yy = y + 0.3; yy < y + hgt; yy += 0.35) k.plain.push([box(X + 0.72, X + 0.76, yy, yy + 0.04, Z - 0.22, Z + 0.22), IRON]);
    SOLIDS.add(x, z, 1.0);
  }
}

function gatewayParts(k: Kit) {
  const x0 = L(G.x0), x1 = L(G.x1), floor = G.floor, wt = floor + k.wallTop(2), a0 = Lz(G.arch[0]), a1 = Lz(G.arch[1]), am = (a0 + a1) / 2;
  // one hip roof over the whole building (A01)
  hipRoof(k, x0, x1, Lz(G.z0), Lz(G.z1), wt, 0.5, 0.8);
  // the arch on both faces: thick reveals round a half circle, the passage ceiling, the gate leaves open against the
  // passage's sides (R15, R17, R22, R34-R36)
  for (const x of [x0 + 0.55, x1]) archWall(k, true, x, a0, a1, floor, floor + ST, am - 1.3, am + 1.3, floor + 2.1, 0.55);
  // the upper floor over the passage: the walls closing the gap between the two halves, its window in the row on each face
  k.plain.push([box(x0, x1, floor + ST, wt, a0 - 0.02, a1 + 0.02), WALL]);
  for (const [x, s] of [[x0, -1], [x1, 1]] as [number, number][]) {
    k.plain.push([box(x + s * 0.0, x + s * 0.04, floor + ST + 1.15, floor + ST + 2.55, am - 0.42, am + 0.42), '#2b2a28']);
    k.plain.push([box(Math.min(x, x + s * 0.06), Math.max(x, x + s * 0.06), floor + ST + 1.05, floor + ST + 1.13, am - 0.5, am + 0.5), '#e4ded2']);
  }
  k.plain.push([box(x0 + 0.55, x1 - 0.55, floor + ST - 0.05, floor + ST + 0.05, a0, a1), '#ece6da']);
  for (const z of [a0 + 0.05, a1 - 0.13]) k.plain.push([box(x0 + 0.65, x0 + 1.95, floor + 0.05, floor + 2.95, z, z + 0.08), TIMBER_D]);
  k.plain.push([box(x0, x1, floor - 0.05, floor + 0.02, a0, a1), '#b4aea4']);
  // the passage's walls: white over the cream band
  for (const z of [a0 + 0.01, a1 - 0.01]) k.plain.push([box(x0 + 0.55, x1 - 0.55, floor, floor + 1.4, z - 0.005, z + 0.005), CREAM]);
  // the threshold steps either side: red risers and dark edges (R34-R36)
  for (const q of [GH.gateStepsW, GH.gateStepsE]) drawSteps(k, stairsOf().find((s) => s.x0 === q.x0)!, RISER_RED, '#55524e', '#2b2927');
  // the pad before each face beside the steps: stone faced, a red edge
  for (const [xa, xb] of [[G.pad[0], G.x0], [G.x1, G.pad[1]]]) for (const [za, zb] of [[G.z0 - 1.7, GH.gateStepsW.z0], [GH.gateStepsW.z1, G.z1 + 1.4]]) {
    const xe = xa === G.pad[0] ? xa : xb;
    stoneWall(k, xe - 0.15, xe + 0.15, za, zb, LO - 0.3, floor - 0.08, false);
    k.plain.push([box(L(xe) - 0.2, L(xe) + 0.2, floor - 0.08, floor + 0.02, Lz(za), Lz(zb)), RISER_RED]);
    k.plain.push([box(L(xa), L(xb), floor - 0.05, floor + 0.02, Lz(za), Lz(zb)), '#b4aea4']);
  }
  // the covered walks out from the pavilions to the outer buildings (A01's long grey roofs): flat roofs on thin posts
  for (const [z0, z1] of [[86.9, 103], [152.7, 174]]) {
    const xa = -911.4, xb = -908.4;
    for (let z = z0 + 0.4; z < z1; z += 3.2) for (const x of [xa + 0.2, xb - 0.2]) {
      const y = k.ground(L(x), Lz(z));
      k.plain.push([box(L(x) - 0.1, L(x) + 0.1, y, y + 2.7, Lz(z) - 0.1, Lz(z) + 0.1), '#f2f0ea']);
      SOLIDS.add(x, z, 0.15);
    }
    const y0 = k.ground(L(-910), Lz(z0)), y1 = k.ground(L(-910), Lz(z1)), y = Math.max(y0, y1) + 2.7;
    k.plain.push([box(L(xa) - 0.3, L(xb) + 0.3, y, y + 0.18, Lz(z0), Lz(z1)), '#a9a8a3']);
    k.plain.push([box(L(xa) - 0.3, L(xb) + 0.3, y - 0.12, y, Lz(z0), Lz(z1)), '#f2f0ea']);
  }
}

/** a world rectangle of paving or lawn laid on the ground (it follows the hill's slope) */
function drape(k: Kit, x0: number, x1: number, z0: number, z1: number, mat: THREE.Material | string, lift = 0.03) {
  const nx = Math.max(1, Math.ceil(x1 - x0)), nz = Math.max(1, Math.ceil(z1 - z0));
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz).rotateX(-Math.PI / 2).translate(L((x0 + x1) / 2), 0, Lz((z0 + z1) / 2));
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setY(i, k.ground(p.getX(i), p.getZ(i)) + lift);
  geo.computeVertexNormals();
  if (typeof mat === 'string') k.plain.push([geo, mat]); else tx(mat, geo);
}
function approachParts(k: Kit) {
  // the paving from the gateway's east steps down to the turning loop, low stone walls with red coping either side
  drape(k, -897.9, -889.6, 121.6, 135.6, slabMat());
  for (const z of [121.4, 135.8]) for (let x = -897.6; x < -890; x += 2) {
    const y = k.ground(L(x + 1), Lz(z));
    stoneWall(k, x, x + 2.02, z - 0.2, z + 0.2, y - 0.3, y + 0.45);
  }
  for (const [x, z] of [[-894, 119.5], [-894, 137.8], [-891, 119.2], [-891, 138.0]]) flowers(k, x, z, k.ground(L(x), Lz(z)), 0.7, '#e58fb0');
  // the semicircular garden inside the turning loop (A01): a paved arc round a half lawn, its curved side west
  {
    const cx = -866.5, cz = AXIS, y = k.ground(L(cx), Lz(cz));
    const ring = new THREE.RingGeometry(6.4, 8.4, 24, 1, Math.PI / 2, Math.PI).rotateX(-Math.PI / 2).translate(L(cx), 0, Lz(cz));
    const lawn = new THREE.CircleGeometry(6.4, 24, Math.PI / 2, Math.PI).rotateX(-Math.PI / 2).translate(L(cx), 0, Lz(cz));
    for (const [geo, lift] of [[ring, 0.04], [lawn, 0.05]] as [THREE.BufferGeometry, number][]) {
      const p = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) p.setY(i, k.ground(p.getX(i), p.getZ(i)) + lift);
      geo.computeVertexNormals();
    }
    tx(slabMat(), ring);
    k.plain.push([lawn, LAWN]);
    for (let i = 0; i <= 8; i++) { const a = Math.PI / 2 + (i / 8) * Math.PI; flowers(k, cx + Math.cos(a) * 5.6, cz - Math.sin(a) * 5.6, y, 0.5, i % 2 ? '#d0312d' : '#f2c14e'); }
    for (const [x, z] of [[-878, 115], [-878, 142], [-871, 110.5], [-871, 146.5], [-882, 128.6]]) frangipani(k, x, z, 1.15);
  }
  // the formal garden between the two roads east of the cross road (A01's lower half): a paved approach strip, a paved
  // grid with three rows of lawn panels, a second square with its lawn and the panels beside it, the paving on to the
  // bottom road; low clipped edges; flowering trees down both sides
  const gz0 = AXIS - 12.6, gz1 = AXIS + 12.6;
  drape(k, -856.4, -851, AXIS - 5.5, AXIS + 5.5, slabMat());
  drape(k, -851, -813, gz0, gz1, slabMat());
  const zc: [number, number][] = [[gz0 + 2.0, gz0 + 7.2], [gz0 + 8.8, gz1 - 8.8], [gz1 - 7.2, gz1 - 2.0]];
  for (let r = 0; r < 3; r++) {
    const xa = -849 + r * 11.9, xb = xa + 10.3;
    for (const [za, zb] of zc) {
      drape(k, xa, xb, za, zb, LAWN, 0.06);
      for (const [p, q, s, t] of [[xa, xb, za - 0.25, za], [xa, xb, zb, zb + 0.25], [xa - 0.25, xa, za, zb], [xb, xb + 0.25, za, zb]]) {
        const y = k.ground(L((p + q) / 2), Lz((s + t) / 2));
        k.plain.push([box(L(p), L(q), y - 0.1, y + 0.32, Lz(s), Lz(t)), '#3d6e2a']);
      }
    }
  }
  drape(k, -813, -806, AXIS - 3.2, AXIS + 3.2, slabMat());
  drape(k, -806, -791, AXIS - 7.5, AXIS + 7.5, slabMat());
  drape(k, -802.2, -794.8, AXIS - 3.7, AXIS + 3.7, LAWN, 0.06);
  for (const [za, zb] of [[gz0 + 1, AXIS - 8.5], [AXIS + 8.5, gz1 - 1]]) drape(k, -811.5, -803, za, zb, LAWN, 0.06);
  drape(k, -791, -775, AXIS - 4.5, AXIS + 4.5, slabMat());
  for (let x = -854; x < -778; x += 6.5) for (const z of [110.6, 144.0]) frangipani(k, x + (z > 128 ? 3 : 0), z, 1.1);
  for (const [x, z] of [[-845, 114.3], [-830, 114.3], [-815, 114.3], [-845, 142.9], [-830, 142.9], [-815, 142.9]]) flowers(k, x, z, k.ground(L(x), Lz(z)), 0.8, '#e58fb0');
}

const hall: Spec = {
  name: 'Great Hall',
  axis: [1, 0], origin: O, storey: ST, style: OUTER, roofColor: ROOF, fascia: FASCIA, pitch: 0.45,
  onGround: true, plinth: '#5a4a40',
  // the hall, its wings, the tower's former base, the gateway building's two halves, its pavilions, the bust wing
  replaces: [[-1010.6, 132.6], [-960, 158], [-960, 97], [-1013, 158.9], [-905, 122], [-905, 135], [-906, 107.3], [-906, 148.3], [-926, 153]],
  blocks: [...HALL_BLOCKS, ...WINGS, ...LOWER, ...GATEWAY],
  // the courts, the approach and the formal garden keep the generic trees and props out
  keep: [[L(-1004), L(-894), Lz(90), Lz(166)], [L(-900), L(-860), Lz(106), Lz(151)], [L(-860), L(-771), Lz(107), Lz(149)]],
  extras: (k) => {
    g.reseed(23);
    TX.clear();
    for (const b of [...HALL_BLOCKS, ...WINGS, ...LOWER, ...GATEWAY]) g.clear.push([b.x0 + O[0] - 1.5, b.x1 + O[0] + 1.5, b.z0 + O[1] - 1.5, b.z1 + O[1] + 1.5]);
    g.clear.push([-1004, -894, 90, 166], [-900, -860, 106, 151], [-860, -771, 107, 149]);
    hallParts(k);
    towerParts(k);
    wingParts(k);
    upperCourtParts(k);
    stairParts(k);
    lowerCourtParts(k);
    gatewayParts(k);
    approachParts(k);
    // broadleaf trees round the hall outside the wings (A01's canopy)
    const trees: [THREE.BufferGeometry, string][] = [];
    for (const [x, z, h, s] of [[-1040, 112, 10, 14], [-1044, 139, 9.5, 13], [-1020, 172, 10, 15], [-990, 172, 9, 13], [-1018, 86, 10, 14], [-985, 84, 9, 13], [-950, 170, 9.5, 13], [-952, 86, 9, 12]] as [number, number, number, number][]) broadleaf(k, trees, x, z, { h, spread: s, seed: x * 2 + z, origin: O });
    for (const [x, z] of [[-1034, 116.5], [-1034, 141.5], [-1040.5, 124], [-1040.5, 134]]) g.palm(k, L(x), Lz(z), 9 + g.rand() * 2);
    for (const [geo, c] of trees) k.plain.push([geo, c]);
    flushTx(k);
  },
};

/** the buildings either side of the formal garden (A01's lower half): the two long single-storey tiled ranges
 *  (osm:way/100307690, 100307665) and the smaller buildings at their east ends (osm:way/1051225976, 565872087), white,
 *  brown louvred windows, hip roofs. Their storeys are read from the aerial; no names or uses are assigned here. */
const LONG = style(3.3, (g) => { render(g, WALL); woodWin(g, [96, 256 + 56, 64, 110], TIMBER_D); woodWin(g, [96, 56, 64, 110], TIMBER_D); }, [[96, 56, 64, 110]], [[96, 312, 64, 110]]);
const approachRanges: Spec = {
  name: 'Great Hall approach ranges', axis: [1, 0], origin: O, storey: 4.0, style: LONG, roofColor: ROOF, fascia: FASCIA, pitch: 0.55,
  onGround: true, plinth: '#5a4a40',
  replaces: [[-832, 94], [-832, 160], [-794.6, 95.2], [-796, 161]],
  blocks: [W(-855.2, -810.1, 89.2, 98.6, 1), W(-854.6, -809.5, 155.7, 164.3, 1), W(-800.2, -789.0, 89.6, 100.8, 2, { pitch: 0.5 }), W(-804.8, -787.1, 154.4, 167.4, 2, { pitch: 0.5 })],
  keep: [],
  extras: () => {},
};

/** the Great Hall, its tower, its courts, its gateway and its approach garden */
export const greatHallSite = createSite('greathall', [hall, approachRanges]);
