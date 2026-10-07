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
import { PAVE, TRIM, WHITE, box } from './modelkit';
import { PL, createSite, render, slab, tanks, window_, type Kit, type Spec, type Style } from './blocks';

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

/** a military training aeroplane in green camouflage (fuselage, low wings, tail, canopy, propeller), nose toward -x */
function aeroplane(k: Kit, cx: number, cz: number) {
  const G = '#4f6a3a', G2 = '#6f7f45', BEIGE = '#a99a6a';
  const y = 1.45;
  k.plain.push([new THREE.CylinderGeometry(0.62, 0.38, 7.4, 12).rotateZ(Math.PI / 2).translate(cx + 0.6, y, cz), G]);
  k.plain.push([new THREE.ConeGeometry(0.62, 1.2, 12).rotateZ(Math.PI / 2).translate(cx - 3.7, y, cz), G2]);
  k.plain.push([new THREE.SphereGeometry(0.62, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.6, 0.8, 0.9).translate(cx - 1.2, y + 0.35, cz), '#2c3a44']);
  k.plain.push([box(cx - 1.6, cx + 0.6, y - 0.4, y - 0.28, cz - 5, cz + 5), G], [box(cx - 1.2, cx, y - 0.4, y - 0.28, cz - 3.4, cz - 1.6), BEIGE], [box(cx - 1.2, cx, y - 0.4, y - 0.28, cz + 1.6, cz + 3.4), G2]);
  k.plain.push([box(cx + 3.6, cx + 4.6, y + 0.05, y + 0.15, cz - 1.8, cz + 1.8), G]);
  k.plain.push([box(cx + 3.7, cx + 4.7, y + 0.1, y + 1.5, cz - 0.06, cz + 0.06), G2]);
  k.plain.push([box(cx - 4.4, cx - 4.3, y - 1.0, y + 1.0, cz - 0.08, cz + 0.08), '#1b1b1b'], [box(cx - 4.4, cx - 4.3, y - 0.08, y + 0.08, cz - 1.0, cz + 1.0), '#1b1b1b']);
  for (const [x, z] of [[-1.2, -1.6], [-1.2, 1.6], [3.8, 0]] as [number, number][]) {
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
    // the forecourt in front of the porch
    k.plain.push([box(-14, 14, 0, 0.04, 28.7, 38), PAVE]);
  },
};

/** the School of Engineering Sciences */
export const engineeringSite = createSite('engineering', [engineering]);
