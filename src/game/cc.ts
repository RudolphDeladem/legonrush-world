// The Central Cafeteria (CC), the SRC Union Building and the Standard Chartered ATM building between
// them, south of the Athletic Oval, from the owner's photos and aerials (block engine: blocks.ts).
//
// CC: two floors. The ground floor is half sunk, like a basement: shops, a clinic and eating places
// behind shop fronts. The main floor above is reached up the broad stepped terrace along the north
// side (toward the oval road), with many doors along the top of it (owner's blue marks), and by the
// straight stair on the west end beside a green canopy; tall dark windows under a deep overhanging
// shallow roof of faded pink sheeting, carried on V-shaped concrete brackets.
// SRC Union Building, opposite the CC on the west: one floor round a planted courtyard, red tile roof.
// Between them, a few parked cars and the small one-floor Standard Chartered ATM building.
import * as THREE from 'three';
import { WHITE, box, flat } from './modelkit';
import { PL, createSite, render, ringRoof, window_, type Kit, type Spec, type Style } from './blocks';

const CC: [number, number, number, number] = [-26.2, 29.4, 515.7, 552.7];
const O: [number, number] = [(CC[0] + CC[1]) / 2, (CC[2] + CC[3]) / 2];
const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
const GROUND = 3.6, MAIN = 5.4;

/** the half-sunk ground floor: shop fronts, signboards over them */
const CC_SHOPS: Style = {
  bay: 4.2,
  up: [],
  ground: [[20, 256 + 70, 216, 170]],
  draw: (g) => {
    render(g, '#e9e6de');
    g.fillStyle = '#c0392b'; g.fillRect(20, 256 + 36, 104, 28);
    g.fillStyle = '#1f6fb8'; g.fillRect(132, 256 + 36, 104, 28);
    window_(g, [20, 256 + 70, 216, 170], '#5a5d63', 4, 0);
  },
};
/** the main floor: tall dark windows between white piers (owner's photo) */
const CC_MAIN: Style = {
  bay: 3.0,
  up: [[44, 20, 168, 226]],
  ground: [[44, 256 + 20, 168, 226]],
  draw: (g) => {
    render(g, '#f2f0ea');
    for (const y0 of [0, 256]) {
      g.fillStyle = '#3d4148'; g.fillRect(44, y0 + 20, 168, 226);
      g.fillStyle = '#9da3ab'; g.fillRect(44, y0 + 20, 168, 6); g.fillRect(126, y0 + 20, 4, 226);
    }
  },
};
/** a plain white wall with a few small windows */
const PLAIN: Style = {
  bay: 3.6,
  up: [[92, 80, 72, 70]],
  ground: [[92, 256 + 80, 72, 70]],
  draw: (g) => { render(g, '#f3f2ee'); for (const y0 of [0, 256]) window_(g, [92, y0 + 80, 72, 70], '#d9d8d2', 2, 0); },
};

const cc: Spec = {
  name: 'Central Cafeteria, CC',
  axis: [1, 0], origin: O, storey: GROUND, style: CC_SHOPS, roofColor: '#c98a7f', fascia: '#f2f0ea', pitch: 0.12,
  replaces: [O],
  blocks: [{ x0: X(CC[0]), x1: X(CC[1]), z0: Z(CC[2]), z1: Z(CC[3]), floors: 1, roof: 'none' }],
  keep: [[X(-26.2), X(4), Z(507.5), Z(515.7)], [X(-34), X(-26.2), Z(522), Z(546)]],
  extras: (k: Kit) => {
    const [x0, x1, z0, z1] = [X(CC[0]), X(CC[1]), Z(CC[2]), Z(CC[3])];
    const fl = PL + GROUND, top = fl + MAIN;
    // the main floor, set back a little on the north side where the terrace runs up to it
    mainFloor(k, x0, x1, z0 + 0.6, z1, fl, top);
    // the deep overhanging roof of faded pink sheeting, almost flat, with a white fascia
    const ov = 2.6, rise = 1.4, xm = (x0 + x1) / 2;
    k.roof.c = new THREE.Color('#c98a7f');
    k.roof.quad([x0 - ov, top, z0 - ov], [x1 + ov, top, z0 - ov], [x1 + ov - 8, top + rise, (z0 + z1) / 2], [x0 - ov + 8, top + rise, (z0 + z1) / 2]);
    k.roof.quad([x1 + ov, top, z1 + ov], [x0 - ov, top, z1 + ov], [x0 - ov + 8, top + rise, (z0 + z1) / 2], [x1 + ov - 8, top + rise, (z0 + z1) / 2]);
    k.roof.quad([x0 - ov, top, z1 + ov], [x0 - ov, top, z0 - ov], [x0 - ov + 8, top + rise, (z0 + z1) / 2], [x0 - ov + 8, top + rise, (z0 + z1) / 2]);
    k.roof.quad([x1 + ov, top, z0 - ov], [x1 + ov, top, z1 + ov], [x1 + ov - 8, top + rise, (z0 + z1) / 2], [x1 + ov - 8, top + rise, (z0 + z1) / 2]);
    for (const z of [z0 - ov, z1 + ov]) k.plain.push([box(x0 - ov, x1 + ov, top - 0.9, top + 0.05, z - 0.12, z + 0.12), '#f2f0ea']);
    for (const x of [x0 - ov, x1 + ov]) k.plain.push([box(x - 0.12, x + 0.12, top - 0.9, top + 0.05, z0 - ov, z1 + ov), '#f2f0ea']);
    k.plain.push([box(x0 - ov, x1 + ov, top - 0.95, top - 0.85, z0 - ov, z1 + ov), '#dcd8cf']);
    // V-shaped concrete brackets under the eaves along the north and south (owner's photo)
    for (const [z, s] of [[z0 + 0.6, -1], [z1, 1]] as [number, number][]) {
      for (let x = x0 + 1.5; x < x1; x += 3.0) {
        for (const d of [-1, 1]) k.plain.push([new THREE.BoxGeometry(0.22, 3.0, 0.3).rotateZ(d * 0.42).translate(x + d * 0.6, top - 1.6, z + s * 1.2), '#eeece6']);
      }
    }
    // ----- the stepped terrace up the north side to the main floor's doors (west half), a walkway along the rest
    const tx0 = x0, tx1 = X(4), n = 12, depth = 7.6, step = depth / n;
    for (let i = 0; i < n; i++) {
      const h = ((i + 1) / n) * fl;
      k.plain.push([box(tx0, tx1, 0, h, z0 - depth + i * step, z0 - depth + (i + 1) * step), i % 2 ? '#bfb4a2' : '#b5aa97']);
    }
    k.plain.push([box(tx0, tx1, 0, fl, z0 - 0.02, z0 + 0.6), '#bfb4a2']);
    k.plain.push([box(tx1, x1, fl - 0.25, fl, z0 - 2.2, z0 + 0.6), '#d9d5cc']);
    for (const [ax, bx] of [[tx1, x1]] as [number, number][]) k.plain.push([box(ax, bx, fl, fl + 1.0, z0 - 2.25, z0 - 2.15), '#4a4d52']);
    // handrails down the terrace (owner's photo)
    for (const x of [tx0 + 4, tx0 + 13, tx0 + 22]) {
      const len = Math.hypot(depth, fl), ang = Math.atan2(fl, depth);
      k.plain.push([new THREE.BoxGeometry(0.06, 0.06, len).rotateX(ang).translate(x, fl / 2 + 0.95, z0 - depth / 2), '#2e3136']);
      for (let i = 0; i <= 4; i++) k.plain.push([box(x - 0.03, x + 0.03, 0, (i / 4) * fl + 0.95, z0 - depth + (i / 4) * depth - 0.03, z0 - depth + (i / 4) * depth + 0.03), '#2e3136']);
    }
    // the doors along the top of the terrace, onto the main floor (owner's blue marks)
    for (let x = tx0 + 1.5; x < tx1 - 1; x += 3.0) k.plain.push([box(x - 0.8, x + 0.8, fl, fl + 2.6, z0 + 0.55, z0 + 0.6), '#2b3138']);
    // ----- the straight stair on the west end, down to the car park, and the green canopy beside it
    const sz0 = Z(523.5), sz1 = Z(529.5), slen = 7.6, sn = 12;
    for (let i = 0; i < sn; i++) {
      const h = ((sn - i) / sn) * fl;
      k.plain.push([box(x0 - (i + 1) * (slen / sn), x0 - i * (slen / sn), 0, h, sz0, sz1), i % 2 ? '#c4b8a5' : '#b9ad99']);
    }
    k.plain.push([box(x0 - slen, x0, fl + 0.9, fl + 1.0, sz0 - 0.05, sz0 + 0.05), '#2e3136']);
    k.plain.push([box(x0 - slen, x0, fl + 0.9, fl + 1.0, sz1 - 0.05, sz1 + 0.05), '#2e3136']);
    const gx0 = x0 - 5.5, gx1 = x0 - 0.3, gz0 = Z(531), gz1 = Z(536.5);
    for (const [x, z] of [[gx0, gz0], [gx1, gz0], [gx0, gz1], [gx1, gz1]]) k.plain.push([box(x - 0.06, x + 0.06, 0, 2.6, z - 0.06, z + 0.06), '#e8e8e4']);
    k.plain.push([box(gx0, gx1, 2.6, 2.75, gz0, gz1), '#1f7a4f']);
    k.plain.push([flat([[gx0, 2.75], [gx1, 2.75], [(gx0 + gx1) / 2, 3.5]], 0).translate(0, 0, gz0), '#1f7a4f']);
    k.signs.push({ text: 'CENTRAL CAFETERIA', x: x0 - 0.05, y: fl + MAIN - 1.2, z: Z(540), ry: -Math.PI / 2, w: 6.5, colors: ['#f2f0ea', '#7a2a24'] });
  },
};
/** the main floor's walls: tall windows on every face */
function mainFloor(k: Kit, x0: number, x1: number, z0: number, z1: number, y0: number, y1: number) {
  k.plain.push([box(x0, x1, y0 - 0.25, y0, z0, z1), '#e8e5dd']);
  const bay = 3.0;
  const run = (ax: number, az: number, bx: number, bz: number) => {
    const len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / bay)), ux = (bx - ax) / len, uz = (bz - az) / len;
    const nx = uz, nz = -ux; // outward for a counter-clockwise run
    k.plain.push([new THREE.BoxGeometry(len, y1 - y0, 0.25).rotateY(-Math.atan2(bz - az, bx - ax)).translate((ax + bx) / 2 - nx * 0.15, (y0 + y1) / 2, (az + bz) / 2 - nz * 0.15), '#f2f0ea']);
    for (let i = 0; i < n; i++) {
      const c = (i + 0.5) * (len / n), cx = ax + ux * c + nx * 0.02, cz = az + uz * c + nz * 0.02;
      k.plain.push([new THREE.BoxGeometry((len / n) * 0.64, (y1 - y0) * 0.78, 0.04).rotateY(-Math.atan2(bz - az, bx - ax)).translate(cx, y0 + (y1 - y0) * 0.45, cz), '#3d4148']);
    }
  };
  run(x0, z0, x1, z0); run(x1, z0, x1, z1); run(x1, z1, x0, z1); run(x0, z1, x0, z0);
}

// ---------- SRC Union Building: one floor round a planted courtyard ----------
const U: [number, number, number, number] = [-84.4, -52.2, 519.4, 550];
const UI: [number, number, number, number] = [-74, -62.6, 529.6, 539.8];
const UO: [number, number] = [(U[0] + U[1]) / 2, (U[2] + U[3]) / 2];
const ux = (x: number) => x - UO[0], uz = (z: number) => z - UO[1];
const union: Spec = {
  name: 'SRC Union Building',
  axis: [1, 0], origin: UO, storey: 3.6, style: PLAIN, roofColor: '#c4573a', fascia: '#f2f0ea', pitch: 0.45,
  replaces: [UO, [-56, 525]],
  blocks: [
    { x0: ux(U[0]), x1: ux(U[1]), z0: uz(U[2]), z1: uz(UI[2]), floors: 1, roof: 'none' },
    { x0: ux(U[0]), x1: ux(U[1]), z0: uz(UI[3]), z1: uz(U[3]), floors: 1, roof: 'none' },
    { x0: ux(U[0]), x1: ux(UI[0]), z0: uz(UI[2]), z1: uz(UI[3]), floors: 1, roof: 'none' },
    { x0: ux(UI[1]), x1: ux(U[1]), z0: uz(UI[2]), z1: uz(UI[3]), floors: 1, roof: 'none' },
  ],
  keep: [],
  extras: (k) => {
    const e = k.wallTop(1);
    ringRoof(k, [ux(U[0]) - 0.8, ux(U[1]) + 0.8, uz(U[2]) - 0.8, uz(U[3]) + 0.8], [ux(UI[0]) + 0.6, ux(UI[1]) - 0.6, uz(UI[2]) + 0.6, uz(UI[3]) - 0.6], e, 3.2);
    // the courtyard: paved cross walks between four planted beds (owner's aerial)
    const [cx0, cx1, cz0, cz1] = [ux(UI[0]), ux(UI[1]), uz(UI[2]), uz(UI[3])], cx = (cx0 + cx1) / 2, cz = (cz0 + cz1) / 2;
    k.plain.push([box(cx0, cx1, 0, 0.06, cz0, cz1), '#d8d2c5']);
    for (const [ax, bx] of [[cx0 + 0.6, cx - 0.9], [cx + 0.9, cx1 - 0.6]]) for (const [az, bz] of [[cz0 + 0.6, cz - 0.9], [cz + 0.9, cz1 - 0.6]]) {
      k.plain.push([box(ax, bx, 0, 0.35, az, bz), '#c9c3b5']);
      k.plain.push([box(ax + 0.2, bx - 0.2, 0.35, 0.4, az + 0.2, bz - 0.2), '#5b8f3e']);
    }
    // the entrance on the east face, toward the CC, under a small porch
    const x = ux(U[1]), z = uz(536);
    k.plain.push([box(x, x + 0.05, PL, PL + 2.6, z - 1.4, z + 1.4), '#2b2724']);
    k.plain.push([box(x, x + 2.2, PL + 2.8, PL + 3.0, z - 2.2, z + 2.2), WHITE]);
    for (const dz of [-2, 2]) k.plain.push([box(x + 1.9, x + 2.15, 0, PL + 2.8, z + dz - 0.12, z + dz + 0.12), WHITE]);
    k.signs.push({ text: 'SRC UNION BUILDING', x: x + 2.25, y: PL + 3.25, z, ry: Math.PI / 2, w: 3.6, colors: ['#f2f0ea', '#1f3a93'] });
  },
};

// ---------- the Standard Chartered ATM building, between the CC and the Union Building ----------
const A: [number, number, number, number] = [-48.8, -43.8, 533.2, 544.1];
const AO: [number, number] = [(A[0] + A[1]) / 2, (A[2] + A[3]) / 2];
const atm: Spec = {
  name: 'Standard Chartered ATM (near SRC Union Building)',
  axis: [1, 0], origin: AO, storey: 3.0, style: PLAIN, roofColor: '#8a5a3c', fascia: '#5a3a2c', pitch: 0.45,
  replaces: [AO],
  blocks: [{ x0: A[0] - AO[0], x1: A[1] - AO[0], z0: A[2] - AO[1], z1: A[3] - AO[1], floors: 1 }],
  keep: [],
  extras: (k) => {
    // the ATMs on the east face, toward the CC, under the bank's blue and green band
    const x = A[1] - AO[0];
    k.plain.push([box(x, x + 0.06, PL + 2.2, PL + 3.0, -5.4, 5.4), '#0d6ab0']);
    k.plain.push([box(x + 0.01, x + 0.07, PL + 2.2, PL + 2.4, -5.4, 5.4), '#38a046']);
    for (const z of [-3, 0, 3]) {
      k.plain.push([box(x, x + 0.35, 0, 1.7, z - 0.45, z + 0.45), '#2f3540']);
      k.plain.push([box(x + 0.35, x + 0.38, 1.0, 1.45, z - 0.3, z + 0.3), '#7fb2d9']);
    }
    k.signs.push({ text: 'Standard Chartered', x: x + 0.1, y: PL + 2.6, z: 0, ry: Math.PI / 2, w: 3.4, colors: ['#0d6ab0', '#ffffff'] });
  },
};

/** a parked car: body, cabin with dark glass, wheels (model frame, facing along z) */
export function car(k: Kit, x: number, z: number, color: string, y = 0, ry = 0) {
  const parts: [THREE.BufferGeometry, string][] = [
    [box(-0.9, 0.9, 0.3, 1.0, -2.15, 2.15), color], [box(-0.8, 0.8, 1.0, 1.5, -1.1, 1.0), color], [box(-0.82, 0.82, 1.05, 1.42, -1.0, 0.9), '#2a3038'],
    ...[[-0.9, -1.4], [0.9, -1.4], [-0.9, 1.4], [0.9, 1.4]].map(([dx, dz]): [THREE.BufferGeometry, string] => [new THREE.CylinderGeometry(0.34, 0.34, 0.24, 12).rotateZ(Math.PI / 2).translate(dx, 0.34, dz), '#1b1c1f']),
  ];
  for (const [g, c] of parts) k.plain.push([g.rotateY(ry).translate(x, y, z), c]);
}
/** a few cars parked between the CC and the Union Building (owner: "not so many") */
const parking: Spec = {
  name: 'CC and Union Building car park',
  axis: [1, 0], origin: [-45, 526], storey: 3, style: PLAIN, roofColor: '#888', fascia: '#888', pitch: 0.1,
  blocks: [],
  keep: [[-6.5, 6.5, -6.4, 5.8]],
  extras: (k) => {
    const cols = ['#e9e9ea', '#1b1d22', '#9aa1a8', '#7a1e1e', '#2b3b5a'];
    [[-4.6, 0], [-2.2, 0], [2.6, 0], [5.0, 0.4]].forEach(([x, z], i) => car(k, x, z, cols[i]));
  },
};

/** the Central Cafeteria, the SRC Union Building and the Standard Chartered ATM building */
export const ccSite = createSite('cc', [cc, union, atm, parking]);
