// The School of Engineering Sciences, modelled from the owner's layout photo, reference render and
// photos (block engine: blocks.ts). It stands in a hollow below the road (relief.ts).
//
// Four-storey white blocks under orange-brown tile roofs with black fascias: the front block on the
// south (the entrance), a west block, an east block and a block at the back round a light well,
// joined by white stair towers faced with lattice breeze-block screens, tall arched windows and
// black water tanks on their flat roofs. The entrance is a porch on white columns under a tile roof,
// with SCHOOL OF ENGINEERING in blue capitals on its band. East of the front block a military
// training aeroplane stands on a pad inside a metal mesh fence. The car park is on the west.
import * as THREE from 'three';
import { PAVE, TRIM, WHITE, box, tri2 } from './modelkit';
import { PL, createSite, render, slab, tanks, window_, type Kit, type Spec, type Style } from './blocks';
import { rubble } from './concrete';
import { groundHeight } from './relief';

// ---------- facades ----------
/** the blocks: white render with panel lines, a pair of dark windows in white frames per bay */
const ENG_WIN: Style = {
  bay: 3.6,
  up: [[40, 70, 76, 96], [140, 70, 76, 96]],
  ground: [[40, 70, 76, 110], [140, 70, 76, 110]],
  draw: (g) => {
    render(g, '#f8f8f5');
    g.fillStyle = 'rgba(150,150,140,0.35)';
    g.fillRect(0, 0, 3, 512); g.fillRect(126, 0, 3, 512);
    for (const y0 of [0, 256]) for (const x of [40, 140]) window_(g, [x, y0 + 70, 76, y0 ? 110 : 96], '#f2f2ee', 2, 0.35);
    slab(g, 230, 26);
  },
};
/** the stair towers: a lattice breeze-block screen (small square openings in a white grid) */
const ENG_LATTICE: Style = {
  bay: 2.4,
  up: [],
  ground: [],
  draw: (g) => {
    render(g, '#f4f4f0');
    for (const y0 of [0, 256]) {
      g.fillStyle = '#d9d9d2'; g.fillRect(16, y0 + 18, 224, 214);
      for (let y = y0 + 22; y < y0 + 228; y += 18) for (let x = 20; x < 236; x += 18) {
        g.fillStyle = '#5d6166'; g.fillRect(x, y, 12, 12);
        g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x, y, 12, 2);
      }
    }
    slab(g, 232, 24);
  },
};

const STOREY = 3.4, F = 4, BLACK = '#202124';

/** the jet trainer on its pad (owner's third reference PDF, page 66: the game had it facing the wrong way): a slim
 *  fuselage camouflaged sand, brown and green over a pale blue-grey belly, nose toward +x (east), a bubble canopy, the
 *  jet pipe at the tail, straight wings, the Ghana roundel on the rear fuselage and the tricolour flash on the fin */
function aeroplane(k: Kit, cx: number, cz: number) {
  const SAND = '#b49a6a', BROWN = '#7a5a3a', G = '#4f6a3a', BELLY = '#9fb0b8';
  const y = 1.55;
  // the fuselage: thickest at the cockpit, tapering to the jet pipe, the camouflage above, the pale belly below
  k.plain.push([new THREE.CylinderGeometry(0.6, 0.42, 6.6, 14).rotateZ(-Math.PI / 2).translate(cx - 0.3, y, cz), SAND]);
  // the camouflage patches over the top, the pale belly underneath
  for (const [x, z, sx, sz, col] of [[1.4, 0.15, 1.3, 0.5, BROWN], [-0.8, -0.2, 1.2, 0.55, G], [-2.4, 0.2, 0.9, 0.45, BROWN]] as [number, number, number, number, string][]) k.plain.push([new THREE.SphereGeometry(1, 12, 6).scale(sx, 0.35, sz).translate(cx + x, y + 0.36, cz + z), col]);
  k.plain.push([new THREE.SphereGeometry(1, 14, 6).scale(3.0, 0.3, 0.5).translate(cx - 0.2, y - 0.33, cz), BELLY]);
  k.plain.push([new THREE.ConeGeometry(0.6, 1.6, 14).rotateZ(-Math.PI / 2).translate(cx + 3.8, y, cz), SAND]);
  k.plain.push([new THREE.CircleGeometry(0.36, 12).rotateY(-Math.PI / 2).translate(cx - 3.62, y, cz), '#1b1b1b']);
  k.plain.push([new THREE.SphereGeometry(0.55, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.9, 0.75, 0.85).translate(cx + 1.7, y + 0.38, cz), '#2c3a44']);
  // the straight wings with tip tanks, the tailplane and the fin with its flash
  k.plain.push([box(cx - 0.6, cx + 1.1, y - 0.35, y - 0.25, cz - 5, cz + 5), SAND], [box(cx - 0.4, cx + 0.6, y - 0.34, y - 0.24, cz - 3.6, cz - 1.4), G], [box(cx - 0.3, cx + 0.8, y - 0.34, y - 0.24, cz + 1.6, cz + 3.8), BROWN]);
  for (const s of [-1, 1]) k.plain.push([new THREE.CapsuleGeometry(0.2, 1.3, 4, 10).rotateZ(Math.PI / 2).translate(cx + 0.3, y - 0.28, cz + s * 5.05), SAND]);
  k.plain.push([box(cx - 3.6, cx - 2.6, y + 0.08, y + 0.16, cz - 1.8, cz + 1.8), SAND]);
  k.plain.push([tri2([cx - 3.7, y + 0.2, cz], [cx - 2.2, y + 0.4, cz], [cx - 3.75, y + 1.7, cz]), G]);
  for (const [h, col] of [[1.25, '#c8261e'], [1.0, '#f2c400'], [0.75, '#1f7a3a']] as [number, string][]) for (const s of [-1, 1]) k.plain.push([box(cx - 3.68, cx - 3.3, y + h, y + h + 0.2, cz + s * 0.03 - 0.01, cz + s * 0.03 + 0.01), col]);
  // the roundel on each side of the rear fuselage: red, yellow and green rings
  for (const s of [-1, 1]) for (const [r, col, d] of [[0.34, '#c8261e', 0.0], [0.24, '#f2c400', 0.005], [0.14, '#1f7a3a', 0.01]] as [number, string, number][]) {
    k.plain.push([new THREE.CircleGeometry(r, 16).rotateY(s > 0 ? 0 : Math.PI).translate(cx - 2.2, y + 0.05, cz + s * (0.5 + d)), col]);
  }
  // the undercarriage
  for (const [x, z] of [[0.0, -1.5], [0.0, 1.5], [3.0, 0]] as [number, number][]) {
    k.plain.push([box(cx + x - 0.05, cx + x + 0.05, 0.3, y - 0.3, cz + z - 0.05, cz + z + 0.05), '#3a3a3a']);
    k.plain.push([new THREE.CylinderGeometry(0.3, 0.3, 0.18, 12).rotateX(Math.PI / 2).translate(cx + x, 0.3, cz + z), '#141414']);
  }
}

/** a metal mesh fence round a rectangle: posts and two rails, with the mesh as thin dark bars */
function meshFence(k: Kit, x0: number, x1: number, z0: number, z1: number, h = 1.8) {
  const POST = '#8c9196', MESH = '#5d6267';
  const side = (ax: number, az: number, bx: number, bz: number) => {
    const len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 2.5));
    for (let i = 0; i <= n; i++) {
      const x = ax + ((bx - ax) * i) / n, z = az + ((bz - az) * i) / n;
      k.plain.push([box(x - 0.05, x + 0.05, 0, h + 0.1, z - 0.05, z + 0.05), POST]);
    }
    const along = bx !== ax;
    for (const y of [0.15, h]) k.plain.push([along ? box(ax, bx, y - 0.03, y + 0.03, az - 0.02, az + 0.02) : box(ax - 0.02, ax + 0.02, y - 0.03, y + 0.03, az, bz), POST]);
    // the mesh: vertical wires every 0.25 m and horizontal wires every 0.3 m (openings between them)
    for (let t = 0.25; t < len; t += 0.25) {
      const x = ax + ((bx - ax) * t) / len, z = az + ((bz - az) * t) / len;
      k.plain.push([box(x - 0.012, x + 0.012, 0.15, h, z - 0.012, z + 0.012), MESH]);
    }
    for (let y = 0.45; y < h; y += 0.3) k.plain.push([along ? box(ax, bx, y - 0.012, y + 0.012, az - 0.012, az + 0.012) : box(ax - 0.012, ax + 0.012, y - 0.012, y + 0.012, az, bz), MESH]);
  };
  side(x0, z0, x1, z0); side(x0, z1, x1, z1); side(x0, z0, x0, z1); side(x1, z0, x1, z1);
  // the low white wall the fence stands on, and the posts' tops cranked outward (owner's photo)
  for (const [a0, a1, b0, b1] of [[x0, x1, z0 - 0.12, z0 + 0.12], [x0, x1, z1 - 0.12, z1 + 0.12], [x0 - 0.12, x0 + 0.12, z0, z1], [x1 - 0.12, x1 + 0.12, z0, z1]]) k.plain.push([box(a0, a1, 0, 0.45, b0, b1), '#ecebe6']);
  for (const [x, z, dx, dz] of [[x0, z0, -1, -1], [x1, z0, 1, -1], [x0, z1, -1, 1], [x1, z1, 1, 1], [(x0 + x1) / 2, z0, 0, -1], [(x0 + x1) / 2, z1, 0, 1]]) {
    k.plain.push([new THREE.BoxGeometry(0.06, 0.6, 0.06).rotateZ(-dx * 0.6).rotateX(dz * 0.6).translate(x + dx * 0.15, h + 0.35, z + dz * 0.15), POST]);
  }
}

// model frame: map axes, origin at (453, -415); z grows to the south
const engineering: Spec = {
  name: 'School of Engineering Sciences',
  axis: [1, 0], origin: [453, -415], storey: STOREY, style: ENG_WIN, roofColor: '#c46f3c', fascia: BLACK, pitch: 0.5,
  replaces: [[476, -395]],
  blocks: [
    // front block (the entrance), west, east and back blocks
    { x0: -9.3, x1: 9.5, z0: 5, z1: 28.7, floors: F },
    { x0: -38.6, x1: -21.2, z0: -34, z1: 5, floors: F },
    { x0: 20.3, x1: 38.3, z0: -34, z1: 8, floors: F },
    { x0: -12.8, x1: 12.4, z0: -36.4, z1: -11, floors: F },
    // stair towers and links between the blocks, round the light well
    { x0: -21.2, x1: -9.3, z0: -8, z1: 8, floors: F, roof: 'flat', faces: { z1: ENG_LATTICE, z0: ENG_LATTICE } },
    { x0: 9.5, x1: 20.3, z0: -8, z1: 8, floors: F, roof: 'flat', faces: { z1: ENG_LATTICE, z0: ENG_LATTICE } },
    { x0: -12.8, x1: -8, z0: -11, z1: 5, floors: F, roof: 'flat', faces: { x1: ENG_LATTICE } },
    { x0: 6.6, x1: 12.4, z0: -11, z1: 5, floors: F, roof: 'flat', faces: { x0: ENG_LATTICE } },
  ],
  keep: [[-6, 6, 28.7, 38], [21, 39, 10, 23.5]],
  extras: (k) => {
    const top = k.wallTop(F);
    // the towers rise a little above the eaves with parapets, arched windows down their fronts, black tanks on top
    for (const [x0, x1] of [[-21.2, -9.3], [9.5, 20.3]] as [number, number][]) {
      k.plain.push([box(x0, x1, top, top + 1.6, -8, 8), WHITE]);
      k.plain.push([box(x0 - 0.1, x1 + 0.1, top + 1.6, top + 1.8, -8.1, 8.1), TRIM]);
      const xm = (x0 + x1) / 2;
      for (let f = 1; f < F; f++) {
        const y = PL + f * STOREY + 0.5;
        k.glass.push(box(xm - 0.7, xm + 0.7, y, y + 2.0, 8, 8.04));
      }
      k.plain.push([new THREE.CircleGeometry(0.7, 12, 0, Math.PI).translate(xm, PL + (F - 1) * STOREY + 2.5, 8.05), '#2b3a48']);
      tanks(k, [[xm - 2, -2], [xm + 2, -2], [xm, 3]], top + 1.6, 0.85);
    }
    // the entrance porch (photos, render): white columns, a hipped tile roof, the band with the school's name
    const z0 = 28.7, z1 = 35.1, x0 = -5.2, x1 = 4.6, ph = 3.6;
    for (const x of [x0 + 0.3, x1 - 0.3]) for (const z of [z1 - 0.3, (z0 + z1) / 2]) k.plain.push([box(x - 0.25, x + 0.25, 0.3, ph, z - 0.25, z + 0.25), WHITE]);
    k.plain.push([box(x0, x1, ph, ph + 0.7, z0, z1), WHITE]);
    k.plain.push([box(x0 - 0.05, x1 + 0.05, ph + 0.55, ph + 0.7, z0, z1 + 0.05), BLACK]);
    const eave = ph + 0.7, rise = 1.6, X0 = x0 - 0.6, X1 = x1 + 0.6, Z1 = z1 + 0.6, xm = (x0 + x1) / 2;
    k.roof.quad([X0, eave, Z1], [X1, eave, Z1], [xm + 1, eave + rise, z0], [xm - 1, eave + rise, z0]);
    k.roof.quad([X0, eave, z0], [X0, eave, Z1], [xm - 1, eave + rise, z0], [xm - 1, eave + rise, z0]);
    k.roof.quad([X1, eave, Z1], [X1, eave, z0], [xm + 1, eave + rise, z0], [xm + 1, eave + rise, z0]);
    k.signs.push({ text: 'SCHOOL OF ENGINEERING', x: xm, y: ph + 0.3, z: z1 + 0.01, ry: 0, w: 6.4, colors: ['#ffffff', '#1f4fa8'] });
    // floor, steps and glass doors into the front block
    k.plain.push([box(x0, x1, 0, 0.3, z0, z1), '#b9805a']);
    for (let i = 0; i < 2; i++) k.plain.push([box(x0 + 1 + i * 0.3, x1 - 1 - i * 0.3, 0, 0.2 - i * 0.1, z1, z1 + 0.5 + i * 0.4), PAVE]);
    k.glass.push(box(xm - 2, xm + 2, 0.3, 3.0, z0, z0 + 0.05));
    for (const x of [xm - 2, xm, xm + 2]) k.plain.push([box(x - 0.05, x + 0.05, 0.3, 3.0, z0, z0 + 0.08), '#3a3d42']);
    // the aeroplane on its pad inside the mesh fence, east of the front block (layout photo, green)
    const ax0 = 23.2, ax1 = 37, az0 = 12.2, az1 = 21.4;
    k.plain.push([box(ax0, ax1, 0, 0.15, az0, az1), '#c9c6bd']);
    meshFence(k, ax0, ax1, az0, az1);
    aeroplane(k, (ax0 + ax1) / 2 + 0.4, (az0 + az1) / 2);
    // the bank up to the main road south of the forecourt (owner's third reference PDF, page 67, from the ground floor):
    // faced in pitched rubble stone, brick paving along its foot, the lawn and shrubs on top; either side of the access
    // road down from the main road
    { const lift = k.ground(0, 0), rub = rubble(), g = new THREE.BufferGeometry(), pos: number[] = [], uv: number[] = [], idx: number[] = [];
      const xs: number[] = [], zs: number[] = [];
      for (let x = 376; x <= 500.01; x += 2) xs.push(x);
      for (let z = -372.2; z <= -360.01; z += 1.2) zs.push(z);
      for (const z of zs) for (const x of xs) { pos.push(x - 453, groundHeight(x, z) - lift + 0.03, z + 415); uv.push(x / 2.5, (z + groundHeight(x, z) * 2) / 2.5); }
      for (let j = 0; j < zs.length - 1; j++) for (let i = 0; i < xs.length - 1; i++) {
        if (xs[i] > 421 && xs[i] < 432) continue;
        const a = j * xs.length + i, b = a + 1, c = a + xs.length, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(new Array(pos.length).fill(1), 3)); g.setIndex(idx); g.computeVertexNormals();
      const m = new THREE.Mesh(g, rub); m.receiveShadow = true; k.meshes.push(m);
      for (const [a0, a1] of [[376, 421], [432, 500]]) k.plain.push([box(a0 - 453, a1 - 453, groundHeight(440, -373.5) - lift - 0.02, groundHeight(440, -373.5) - lift + 0.05, -374.5 + 415, -372.2 + 415), '#a5563f']); }
    // the forecourt in front of the porch
    k.plain.push([box(-14, 14, 0, 0.04, 28.7, 38), PAVE]);
  },
};

/** the School of Engineering Sciences */
export const engineeringSite = createSite('engineering', [engineering]);
