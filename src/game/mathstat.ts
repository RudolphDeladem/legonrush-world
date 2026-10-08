// The Departments of Mathematics and Statistics, from the owner's three photos along the north front and their
// marked aerial (block engine: blocks.ts). One connected building, not three: the owner's aerial shows the blocks
// joined, and the three mapped outlines are reshaped to the roofs it shows (corrections.json).
//
// Old brutalist concrete painted white, long since gone grey: rain streaks under every slab edge, mottled stains,
// mildew at the foot of the walls. From west to east along the north front (the owner's arrow, photos 1 to 3):
//
// - The Mathematics block: a long bar of three floors under a red-painted roof slab. On its north face, toward its
//   car park, two floors of open galleries on cantilevered slabs with thin dark railings, the walls behind them
//   ochre with dark doors and windows between white piers; the ground floor white, red planters along its foot. A
//   blank end wall closes the west end.
// - The heavy block that joins it to the rest: three floors stepping out over each other on the north and west, an
//   inverted ziggurat of thick slab edges: a first-floor box with a breeze-block balustrade, a second-floor gallery
//   on columns, and a deep roof slab over all. Its west face, toward the car park, has the Mathematics door up a
//   flight of steps.
// - The main entrance (the owner's blue mark): glazed doors up five steps under the heavy block's overhang, red
//   planters and young palms beside them.
// - The Statistics block: two floors of breeze-block screens (round openings) on a red base and a first-floor
//   gallery on columns, then the tall part: a stair climbing the north face from east to west behind a sloping
//   parapet, a tall screen of vertical fins from the stair to the roof, and a glazed box on the top floor.
// - South of it: a glass-roofed hall (the pale blue roof in the aerial), a walled courtyard, and the long east block
//   (three floors, white galleries on its north face toward the east car park, blank east end), joined to the
//   Statistics block by a stair tower and a one-floor link.
import * as THREE from 'three';
import { box, canvas, merge, rnd, speckle, type Part } from './modelkit';
import { PL, createSite, type Block, type Kit, type Spec, type Style } from './blocks';
import { garden } from './gardens';
import { groundShade } from './shading';

const ST = 3.4;
const O: [number, number] = [330, -232];
/** a box given in world x and z */
const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(x0 - O[0], x1 - O[0], y0, y1, z0 - O[1], z1 - O[1]);
/** a block given in world x and z */
const blk = (x0: number, x1: number, z0: number, z1: number, floors: number, more: Partial<Block> = {}): Block =>
  ({ x0: x0 - O[0], x1: x1 - O[0], z0: z0 - O[1], z1: z1 - O[1], floors, roof: 'none', ...more });

// the paint: white gone grey, and the ochre and red the photos show
const OLD = '#ece9e1', EDGE = '#e3dfd5', FIN = '#d3d1cb', OCHRE = '#d2ad57', RED = '#a8483c', RAIL = '#2a2b2d', DOOR = '#4a2d21';
const ROOF_RED = '#b0584b', ROOF_PINK = '#d39b8d', ROOF_PALE = '#cdbcae', STEP = '#a39684';

// ---------- weathering ----------
/** grime on a facade canvas: streaks running down from the window sills and slab lines, blotches, mildew */
function aged(g: CanvasRenderingContext2D, sills: number[]) {
  for (let i = 0; i < 26; i++) {
    const x = rnd() * 256, y = sills[(rnd() * sills.length) | 0], len = 30 + rnd() * 120, w = 2 + rnd() * 7;
    const gr = g.createLinearGradient(0, y, 0, y + len);
    gr.addColorStop(0, `rgba(80,78,70,${0.12 + rnd() * 0.25})`); gr.addColorStop(1, 'rgba(80,78,70,0)');
    g.fillStyle = gr; g.fillRect(x, y, w, len);
  }
  for (let i = 0; i < 18; i++) {
    const x = rnd() * 256, y = rnd() * 512, r = 8 + rnd() * 40;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(110,106,96,${0.06 + rnd() * 0.12})`); gr.addColorStop(1, 'rgba(110,106,96,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  const foot = g.createLinearGradient(0, 470, 0, 512);
  foot.addColorStop(0, 'rgba(60,62,50,0)'); foot.addColorStop(1, 'rgba(60,62,50,0.35)');
  g.fillStyle = foot; g.fillRect(0, 470, 256, 42);
  speckle(g, 0, 0, 256, 512, 900, ['rgba(70,70,64,0.35)', 'rgba(120,116,104,0.3)']);
}
const wall = (g: CanvasRenderingContext2D, c: string) => { g.fillStyle = c; g.fillRect(0, 0, 256, 512); speckle(g, 0, 0, 256, 512, 2500, ['#d9d6cc', '#e9e6de', '#cfccc2']); };
const pane = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cols = 2) => {
  g.fillStyle = '#3b3b38'; g.fillRect(x - 3, y - 3, w + 6, h + 6);
  const gl = g.createLinearGradient(0, y, 0, y + h);
  gl.addColorStop(0, '#4a535a'); gl.addColorStop(1, '#1d2126');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = '#3b3b38';
  for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - 2, y, 4, h);
};
const door = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#2e2622'; g.fillRect(x - 3, y - 3, w + 6, h + 3);
  g.fillStyle = DOOR; g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + w / 2 - 1, y, 2, h);
};
/** a gallery wall: a white pier, a narrow dark door and a wide two-pane window to a bay; the upper storeys painted
 *  in the given colour (ochre on the Mathematics block, white on the east block), the ground storey white */
function galleryWall(upper: string): Style {
  return {
    bay: 3.0,
    up: [[44, 36, 40, 196], [112, 36, 120, 130]],
    ground: [[44, 256 + 40, 40, 200], [112, 256 + 50, 120, 120]],
    draw: (g) => {
      wall(g, OLD);
      g.fillStyle = upper; g.fillRect(0, 0, 256, 256);
      speckle(g, 0, 0, 256, 256, 1200, ['rgba(150,120,60,0.25)', 'rgba(240,215,140,0.25)']);
      g.fillStyle = OLD; g.fillRect(0, 0, 22, 512);
      door(g, 44, 36, 40, 196); pane(g, 112, 36, 120, 130);
      door(g, 44, 256 + 40, 40, 200); pane(g, 112, 256 + 50, 120, 120);
      aged(g, [170, 236, 256 + 174, 500]);
    },
  };
}
const GAL_OCHRE = galleryWall(OCHRE), GAL_WHITE = galleryWall('#e4e1d8');
/** the other faces: weathered white with a row of dark windows to a storey */
const WIN: Style = {
  bay: 3.2, up: [[30, 70, 196, 100]], ground: [[30, 256 + 70, 196, 100]],
  draw: (g) => { wall(g, OLD); pane(g, 30, 70, 196, 100, 3); pane(g, 30, 256 + 70, 196, 100, 3); aged(g, [176, 256 + 176, 0, 256]); },
};
/** blank walls: end walls and the stair tower */
const BLANK: Style = { bay: 4, up: [], ground: [], draw: (g) => { wall(g, OLD); aged(g, [0, 128, 256, 384]); aged(g, [60, 300]); } };

/** the stain map for the concrete parts: mottling, rain streaks hanging from random heights, mildew specks */
function stains() {
  return canvas(512, 512, (g) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 160; i++) {
      const x = rnd() * 512, y = rnd() * 512, r = 10 + rnd() * 70;
      for (const [ox, oy] of [[0, 0], [512, 0], [-512, 0], [0, 512], [0, -512]]) {
        const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
        const a = 0.04 + rnd() * 0.1;
        gr.addColorStop(0, `rgba(118,116,106,${a})`); gr.addColorStop(1, 'rgba(118,116,106,0)');
        g.fillStyle = gr; g.fillRect(x + ox - r, y + oy - r, 2 * r, 2 * r);
      }
    }
    for (let i = 0; i < 170; i++) {
      const x = rnd() * 512, y = rnd() * 512, len = 30 + rnd() * 200, w = 2 + rnd() * 8;
      const a = 0.04 + rnd() * 0.14;
      for (const oy of [0, -512]) {
        const gr = g.createLinearGradient(0, y + oy, 0, y + oy + len);
        gr.addColorStop(0, `rgba(82,80,72,${a})`); gr.addColorStop(1, 'rgba(82,80,72,0)');
        g.fillStyle = gr; g.fillRect(x, y + oy, w, len);
      }
    }
    speckle(g, 0, 0, 512, 512, 2500, ['rgba(60,62,56,0.25)', 'rgba(100,98,90,0.2)', 'rgba(150,146,134,0.2)']);
  });
}
/** weathered concrete: vertex colours times the stain map, laid in world metres on every face */
let concreteMat: THREE.MeshStandardMaterial | null = null;
function concrete() {
  if (concreteMat) return concreteMat;
  const tex = stains();
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.msTex = { value: tex };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMsP;\nvarying vec3 vMsN;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvMsP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvMsN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMsP;\nvarying vec3 vMsN;\nuniform sampler2D msTex;')
      .replace('#include <map_fragment>', `#include <map_fragment>
  vec3 msA = abs(vMsN);
  vec2 msUv = msA.y > 0.6 ? vMsP.xz / 7.0 : vec2((msA.x > msA.z ? vMsP.z : vMsP.x) / 7.0, vMsP.y / 7.0);
  diffuseColor.rgb *= texture2D(msTex, msUv).rgb;`);
  };
  m.customProgramCacheKey = () => 'mathstat-concrete';
  return (concreteMat = groundShade(m, 2.2, 0.3, 'wall'));
}

// ---------- screens and railings (alpha-tested textures on planes) ----------
let breezeMat: THREE.MeshStandardMaterial | null = null;
/** breeze blocks: a grid of square blocks, each pierced by a round opening, with small openings at the corners */
const breeze = () => (breezeMat ??= (() => {
  const t = canvas(128, 128, (g) => {
    g.fillStyle = '#e1ded5'; g.fillRect(0, 0, 128, 128);
    speckle(g, 0, 0, 128, 128, 400, ['#cfccc2', '#bdb9ae']);
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(64, 64, 46, 0, Math.PI * 2); g.fill();
    for (const [x, y] of [[0, 0], [128, 0], [0, 128], [128, 128]]) { g.beginPath(); g.arc(x, y, 12, 0, Math.PI * 2); g.fill(); }
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = '#c8c4b8'; g.lineWidth = 4; g.strokeRect(2, 2, 124, 124);
  });
  return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.95 });
})());
let railMat: THREE.MeshStandardMaterial | null = null;
/** a thin dark railing: balusters 15 cm apart between a top and a bottom rail */
const rails = () => (railMat ??= (() => {
  const t = canvas(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.fillStyle = RAIL; g.fillRect(28, 0, 8, 64); g.fillRect(0, 0, 64, 6); g.fillRect(0, 56, 64, 6);
  });
  return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.4 });
})());
/** a textured plane from (ax, az) to (bx, bz) in world x/z, between heights y0 and y1, the texture tiled every `tile` m */
function panel(k: Kit, mat: THREE.Material, ax: number, az: number, bx: number, bz: number, y0: number, y1: number, tile: number, tileY = tile) {
  const len = Math.hypot(bx - ax, bz - az), h = y1 - y0;
  const geo = new THREE.PlaneGeometry(len, h);
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * len) / tile, (uv.getY(i) * h) / tileY);
  const m = new THREE.Mesh(geo, mat);
  m.position.set((ax + bx) / 2 - O[0], (y0 + y1) / 2, (az + bz) / 2 - O[1]);
  m.rotation.y = -Math.atan2(bz - az, bx - ax);
  m.castShadow = true;
  k.meshes.push(m);
}

// ---------- the parts ----------
/** open galleries on a north face from x0 to x1: cantilevered slabs with a thick upturned edge and a railing on
 *  the first and second floors, white piers at the wall, the ground-floor walk raised a step */
function galleries(c: Part[], k: Kit, x0: number, x1: number, zWall: number, zEdge: number) {
  c.push([B(x0, x1, 0, PL, zEdge, zWall), EDGE]);
  for (const f of [1, 2]) {
    const y = PL + f * ST;
    c.push([B(x0, x1, y - 0.32, y, zEdge, zWall), EDGE]);
    c.push([B(x0, x1, y, y + 0.42, zEdge, zEdge + 0.2), OLD]);
    panel(k, rails(), x0, zEdge + 0.1, x1, zEdge + 0.1, y + 0.42, y + 1.0, 0.15, 0.58);
  }
  for (let x = x0 + 0.2; x < x1; x += 6) c.push([B(x, x + 0.4, 0, PL + 3 * ST, zWall - 0.4, zWall), OLD]);
}

/** stepped decks on the heavy block's north face (x0..x1 at zN) and west face (z from zN to zS at xW): each storey
 *  steps out further than the one below, the roof slab furthest */
function decks(c: Part[], k: Kit, x0: number, x1: number, zN: number, xW: number, zS: number) {
  // first floor: a box with a solid parapet, breeze-block balustrade round the north-west corner
  const o1 = 1.2, y1 = PL + ST;
  c.push([B(xW - o1, x1, y1 - 0.4, y1, zN - o1, zN), EDGE], [B(xW - o1, xW, y1 - 0.4, y1, zN, zS), EDGE]);
  c.push([B(xW - o1 + 6, x1, y1, y1 + 1.2, zN - o1, zN - o1 + 0.25), OLD]);
  c.push([B(xW - o1, xW - o1 + 0.25, y1, y1 + 1.2, zN - o1 + 5.5, zS), OLD]);
  c.push([B(xW - o1, xW - o1 + 6, y1 + 1.0, y1 + 1.25, zN - o1, zN - o1 + 0.25), OLD], [B(xW - o1, xW - o1 + 0.25, y1 + 1.0, y1 + 1.25, zN - o1, zN - o1 + 5.5), OLD]);
  panel(k, breeze(), xW - o1, zN - o1 + 0.12, xW - o1 + 6, zN - o1 + 0.12, y1, y1 + 1.0, 0.4);
  panel(k, breeze(), xW - o1 + 0.12, zN - o1, xW - o1 + 0.12, zN - o1 + 5.5, y1, y1 + 1.0, 0.4);
  // second floor: further out, an upturned edge and a railing, columns up to the roof slab
  const o2 = 2.0, y2 = PL + 2 * ST;
  c.push([B(xW - o2, x1, y2 - 0.45, y2, zN - o2, zN), EDGE], [B(xW - o2, xW, y2 - 0.45, y2, zN, zS), EDGE]);
  c.push([B(xW - o2, x1, y2, y2 + 0.5, zN - o2, zN - o2 + 0.22), OLD], [B(xW - o2, xW - o2 + 0.22, y2, y2 + 0.5, zN - o2, zS), OLD]);
  panel(k, rails(), xW - o2, zN - o2 + 0.11, x1, zN - o2 + 0.11, y2 + 0.5, y2 + 1.0, 0.15, 0.5);
  panel(k, rails(), xW - o2 + 0.11, zN - o2, xW - o2 + 0.11, zS, y2 + 0.5, y2 + 1.0, 0.15, 0.5);
  for (const x of [xW + 4.5, xW + 11, xW + 17.5]) c.push([B(x - 0.2, x + 0.2, y2 + 0.5, PL + 3 * ST, zN - o2 + 0.3, zN - o2 + 0.7), OLD]);
  // the roof slab: the deepest overhang, a fascia over a metre deep, lamps in its soffit
  const o3 = 2.6, yr = PL + 3 * ST;
  c.push([B(xW - o3, x1, yr, yr + 1.2, zN - o3, zN), OLD], [B(xW - o3, xW, yr, yr + 1.2, zN, zS), OLD]);
  for (const x of [xW + 2, xW + 9, xW + 16]) k.plain.push([B(x - 0.5, x + 0.5, yr - 0.06, yr, zN - 1.4, zN - 1.2), '#f4f1e6']);
}

const SPEC: Spec = {
  name: 'Mathematics and Statistics departments',
  axis: [1, 0], origin: O, storey: ST, style: WIN, roofColor: ROOF_RED, fascia: OLD, pitch: 0.3,
  // the foot of the walls painted red, as on the screens and planters
  plinth: '#97483d',
  // the generic builder skips the three mapped outlines this model replaces (Mathematics, Statistics, east block)
  replaces: [[290, -225], [335, -240], [370, -221]],
  blocks: [
    // the Mathematics bar, galleries on its north face, blank west end
    blk(276.3, 310.8, -228.9, -219.6, 3, { faces: { z0: GAL_OCHRE, x0: BLANK } }),
    // the heavy block: the arm joining the bar, its east wing, the entrance bay
    blk(304.2, 310.8, -245.4, -228.9, 3),
    blk(310.8, 322, -245.0, -233.8, 3),
    blk(322, 328.3, -245.4, -230.8, 3),
    // the Statistics block: two floors of screens, then the tall part with the stair and fins, its south arm
    blk(328.3, 337, -245.4, -230.8, 2),
    blk(337, 350.4, -245.4, -230.8, 3),
    blk(338.6, 342, -230.8, -225.7, 3),
    // the one-floor link and the stair tower to the east block
    blk(342, 350.4, -230.6, -225.7, 1),
    blk(350.4, 355, -234.6, -225.7, 2, { faces: { z0: BLANK, x1: BLANK, x0: BLANK } }),
    // the east block, white galleries on its north face, blank east end
    blk(341.7, 386.7, -225.7, -217.3, 3, { faces: { z0: GAL_WHITE, x1: BLANK } }),
  ],
  keep: [
    [320 - O[0], 331 - O[0], -248.6 - O[1], -245 - O[1]], // the main steps
    [337 - O[0], 350.5 - O[0], -248.4 - O[1], -245 - O[1]], // the stair up the Statistics block
    [301 - O[0], 304.5 - O[0], -239 - O[1], -235 - O[1]], // the Mathematics door's steps
    [275 - O[0], 304.5 - O[0], -232.2 - O[1], -228.9 - O[1]], // the galleries and planters
    [355 - O[0], 387 - O[0], -228.4 - O[1], -225.7 - O[1]],
    [310.8 - O[0], 339 - O[0], -233.8 - O[1], -217 - O[1]], // the courtyards and the glass hall
    [386.7 - O[0], 388 - O[0], -228.4 - O[1], -217 - O[1]],
  ],
  extras: (k: Kit) => {
    const c: Part[] = [];
    const top = PL + 3 * ST; // 10.6

    // --- the Mathematics bar ---
    galleries(c, k, 276.3, 304.2, -228.9, -231.2);
    c.push([B(275.4, 310.8, top, top + 1.0, -231.6, -219.2), OLD]);
    c.push([B(275.7, 310.5, top + 1.0, top + 1.04, -231.3, -219.5), ROOF_RED]);
    // the blank end wall, standing proud of the galleries
    c.push([B(275.2, 276.3, 0, top + 1.2, -232.0, -219.2), OLD]);
    // red planters along the foot of the galleries
    for (const [a, b] of [[278, 284], [286.5, 293], [295, 302]]) c.push([B(a, b, 0, 0.6, -232.0, -231.3), RED]);
    // a banner hung from the first-floor railing
    k.plain.push([B(292.4, 293.6, 4.4, 6.6, -231.32, -231.28), '#1f4f9a'], [B(292.5, 293.5, 5.6, 6.3, -231.34, -231.33), '#f2f2f2']);

    // --- the heavy block: stepped decks on the north and west, the Mathematics door on the west ---
    decks(c, k, 304.2, 328.3, -245.4, 304.2, -231.2);
    c.push([B(310.8, 328.3, top, top + 1.2, -245.4, -233.4), OLD], [B(304.2, 310.8, top, top + 1.2, -245.4, -228.9), OLD], [B(322, 328.3, top, top + 1.2, -233.4, -230.8), OLD]);
    c.push([B(301.9, 322, top + 1.2, top + 1.24, -247.7, -229.1), ROOF_RED], [B(322, 328.6, top + 1.2, top + 1.24, -247.7, -231.0), ROOF_PALE]);
    for (const z of [-242.5, -240, -237.5, -235]) k.plain.push([B(323.2, 324.6, top + 1.24, top + 1.7, z - 0.6, z + 0.6), '#4a4c4e']);
    // the Mathematics door: dark wooden double doors with glazed tops, up a flight of steps from the car park
    k.plain.push([B(304.0, 304.2, 0.75, 3.35, -238.2, -235.8), '#f0ede4'], [B(303.92, 304.0, 0.8, 3.2, -238.0, -236.0), DOOR]);
    k.plain.push([B(303.9, 303.92, 2.2, 3.1, -237.9, -236.1), '#2b3138']);
    for (let i = 0; i < 4; i++) c.push([B(303.2 - 0.35 * i, 304.2, 0, 0.75 - 0.18 * i, -238.6, -235.4), STEP]);
    c.push([B(301.5, 304.2, 0, 0.6, -239.4, -238.6), RED]);

    // --- the main entrance: glazed doors up five steps, red planters, palms ---
    k.plain.push([B(323.4, 327.0, 0.9, 3.5, -245.5, -245.4), '#f0ede4']);
    k.plain.push([B(323.7, 326.7, 0.9, 3.3, -245.56, -245.5), '#1f262c'], [B(325.15, 325.25, 0.9, 3.3, -245.6, -245.56), '#9a9a96']);
    c.push([B(321.6, 328.6, 0, 0.9, -246.2, -245.4), STEP]);
    for (let i = 1; i <= 4; i++) c.push([B(321.6, 328.6, 0, 0.9 - 0.18 * i, -246.2 - 0.4 * i, -246.2 - 0.4 * (i - 1)), STEP]);
    c.push([B(320.0, 321.6, 0, 0.8, -248.0, -245.4), RED], [B(328.6, 329.4, 0, 0.8, -248.0, -246.2), RED]);
    k.signs.push({ text: 'MATHEMATICS · STATISTICS', x: 325.2 - O[0], y: 4.45, z: -246.62 - O[1], ry: Math.PI, w: 3.6, colors: ['#e9e6dd', '#3a3a3a'] });
    // the ENTRANCE board on a post by the steps
    k.plain.push([B(319.2, 319.3, 0, 1.5, -248.9, -248.8), '#2a2a2a']);
    k.signs.push({ text: 'ENTRANCE', x: 319.25 - O[0], y: 1.25, z: -248.95 - O[1], ry: Math.PI, w: 0.9, colors: ['#1d1d1d', '#ffffff'] });

    // --- the Statistics block, two floors: breeze-block screens on a red base, a gallery on columns ---
    c.push([B(328.3, 337, 0, 0.9, -246.1, -245.4), RED]);
    for (let i = 0; i <= 4; i++) { const x = 328.5 + i * 2.1; c.push([B(x - 0.13, x + 0.13, 0.9, 3.5, -246.1, -245.4), OLD]); }
    panel(k, breeze(), 328.5, -245.95, 336.9, -245.95, 0.9, 3.5, 0.4);
    c.push([B(328.3, 337, 3.4, 3.8, -246.9, -245.4), EDGE], [B(328.3, 337, 3.8, 4.8, -246.9, -246.6), OLD]);
    for (let x = 328.9; x < 336.8; x += 1.1) k.plain.push([new THREE.IcosahedronGeometry(0.26, 0).scale(1.2, 0.8, 1).translate(x - O[0], 4.95, -246.75 - O[1]), '#4a7f30']);
    for (const x of [328.7, 331.6, 334.4, 336.6]) c.push([B(x - 0.18, x + 0.18, 4.8, PL + 2 * ST, -246.8, -246.44), OLD]);
    c.push([B(328.3, 337, PL + 2 * ST, PL + 2 * ST + 1.0, -247.1, -230.8), OLD], [B(328.4, 336.9, PL + 2 * ST + 1.0, PL + 2 * ST + 1.04, -247.0, -230.9), ROOF_PINK]);

    // --- the tall part: the stair up the north face behind a sloping parapet, the fins, the glazed box ---
    const sx0 = 349.5, sx1 = 341, rise = PL + ST, n = 21, tread = (sx0 - sx1) / n;
    for (let i = 0; i < n; i++) c.push([B(sx0 - tread * (i + 1), sx0 - tread * i, Math.max(0, (rise * (i + 1)) / n - 0.35), (rise * (i + 1)) / n, -247.3, -245.4), STEP]);
    c.push([B(337.2, sx1, rise - 0.35, rise, -247.3, -245.4), STEP]);
    const slope = Math.atan2(rise, sx0 - sx1), sl = Math.hypot(rise, sx0 - sx1);
    c.push([new THREE.BoxGeometry(sl, 1.25 * Math.cos(slope), 0.22).rotateZ(-slope).translate((sx0 + sx1) / 2 - O[0], rise / 2 + 0.55, -247.3 - O[1]), OLD]);
    c.push([B(337.2, sx1, rise - 0.35, rise + 1.15, -247.42, -247.2), OLD]);
    // piers under the stair and breeze-block screens behind them, on a red base
    for (const x of [341.5, 344.5, 347.5]) c.push([B(x - 0.15, x + 0.15, 0, (rise * (sx0 - x)) / (sx0 - sx1) - 0.3, -247.3, -247.0), OLD]);
    c.push([B(337.2, 350.4, 0, 0.6, -245.6, -245.4), RED]);
    panel(k, breeze(), 337.4, -245.55, 345.5, -245.55, 0.6, 2.4, 0.4);
    // the fins: a tall screen of slender vertical fins from the stair's parapet to the roof
    for (let x = sx1 + 0.3; x < sx0; x += 0.42) {
      const yb = (rise * (sx0 - x)) / (sx0 - sx1) + 1.15;
      c.push([B(x - 0.05, x + 0.05, yb, top, -247.95, -247.35), FIN]);
    }
    c.push([B(337, 350.8, top, top + 0.8, -248.2, -230.8), OLD], [B(337.1, 350.7, top + 0.8, top + 0.84, -248.1, -230.9), ROOF_PINK]);
    // the glazed box on the top floor over the stair landing
    c.push([B(337.2, 341.2, PL + 2 * ST - 0.3, PL + 2 * ST, -246.6, -245.4), OLD]);
    for (const x of [337.3, 341.1]) c.push([B(x - 0.12, x + 0.12, PL + 2 * ST, top, -246.6, -246.3), OLD]);
    k.glass.push(B(337.4, 341.0, PL + 2 * ST + 0.1, top - 0.1, -246.5, -246.42));
    k.plain.push([B(337.4, 341.0, PL + 2 * ST + 1.3, PL + 2 * ST + 1.38, -246.54, -246.5), '#77746c']);
    // roofs of the south arm, the link and the stair tower
    c.push([B(338.6, 342, top, top + 0.8, -230.8, -225.7), OLD], [B(338.7, 341.9, top + 0.8, top + 0.84, -230.7, -225.8), ROOF_PINK]);
    c.push([B(342, 350.4, PL + ST + 0.4, PL + ST + 0.9, -230.6, -225.7), OLD], [B(342.1, 350.3, PL + ST + 0.9, PL + ST + 0.94, -230.5, -225.8), '#b6aa92']);
    c.push([B(350.2, 355.2, PL + 2 * ST + 0.4, PL + 2 * ST + 1.4, -234.8, -225.5), OLD]);

    // --- the east block ---
    galleries(c, k, 355, 386.7, -225.7, -228.0);
    c.push([B(341.5, 387.6, top, top + 1.0, -228.3, -217.0), OLD], [B(341.8, 387.3, top + 1.0, top + 1.04, -228.1, -217.2), ROOF_RED]);
    c.push([B(386.7, 387.8, 0, top + 1.2, -228.6, -217.0), OLD]);
    k.signs.push({ text: 'DEPARTMENT OF MATHEMATICS', x: 368 - O[0], y: PL + ST + 0.2, z: -228.02 - O[1], ry: Math.PI, w: 3.6, colors: ['#f1f1ee', '#2b3f8f'] });

    // --- the glass-roofed hall and the walled courtyard behind the Statistics block ---
    for (const x of [324.5, 331]) for (let z = -230.8; z <= -217.2; z += 2.7) c.push([B(x - 0.15, x + 0.15, 0, 4.0, z - 0.15, z + 0.15), OLD]);
    c.push([B(324.5, 331, 0, 0.9, -217.5, -217.2), OLD]);
    k.glass.push(B(324.42, 324.58, 0.9, 3.8, -230.8, -217.3), B(330.92, 331.08, 0.9, 3.8, -230.8, -217.3), B(324.5, 331, 0.9, 3.8, -217.38, -217.3));
    for (let z = -230.8, i = 0; z < -217.3; z += 1.5, i++) k.plain.push([B(324.2, 331.3, 4.0, 4.1, z, Math.min(-217.0, z + 1.5)), i % 2 ? '#8db3d9' : '#a6c6e4']);
    for (let z = -230.8; z <= -217; z += 3) k.plain.push([B(324.2, 331.3, 3.9, 4.0, z - 0.08, z + 0.08), '#e9e7e0']);
    k.plain.push([B(331, 338.6, 0.02, 0.06, -230.8, -218.6), '#8e8670']);
    c.push([B(331, 338.9, 0, 1.4, -218.8, -218.5), OLD], [B(338.6, 338.9, 0, 1.4, -225.7, -218.5), OLD]);

    const g = garden([300, 392, -255, -212]);
    g.reseed(53);
    // the inner court between the heavy block and the glass hall: grass and two trees
    g.tree(k, 316.5 - O[0], -226.5 - O[1], 0.9);
    g.tree(k, 321.4 - O[0], -222.2 - O[1], 0.8);
    // young palms by the main steps and at the corner of the car park, and the big tree north-east of the block
    g.palm(k, 319.6 - O[0], -250.2 - O[1], 3.2);
    g.palm(k, 330.6 - O[0], -249.6 - O[1], 3.4);
    g.palm(k, 299.6 - O[0], -241.4 - O[1], 3.0);
    g.tree(k, 355.5 - O[0], -246.5 - O[1], 1.5);
    // hedges along the east block's car park, and bushes in the planters
    g.hedge(k, 357 - O[0], -232.6 - O[1], 371 - O[0], -232.6 - O[1]);
    g.hedge(k, 374 - O[0], -232.6 - O[1], 386 - O[0], -232.6 - O[1]);
    for (const x of [279, 281.5, 288, 291, 297, 300]) g.bush(k, x - O[0], -231.65 - O[1], 0.55);

    const m = new THREE.Mesh(merge(c), concrete());
    m.castShadow = true; m.receiveShadow = true;
    k.meshes.push(m);
  },
};

/** the Mathematics and Statistics departments as one connected building */
export const mathStat = createSite('mathstat', [SPEC]);
