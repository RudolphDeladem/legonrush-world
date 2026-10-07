// The Diaspora Dome, north-west of the Lizalex Quadrangle (between Kwapong and Sey halls), and International House opposite the School of
// Law, modelled from the owner's photos and registered aerials (block engine: blocks.ts).
//
// Diaspora Dome: not a storey building but single-storey white marquee halls (a pitched white
// membrane roof over white walls with windows) round a lawn with paved paths and a round plaza, a
// few green-roofed cabins beside them, inside a dark green fence along the road.
//
// International House: a four-storey white block round a courtyard under a low dark-brown hipped
// roof; recessed bays of brown louvred windows on the upper floors, a strip of dark glazing on the
// ground floor, AC units; the entrance porch on the west face (toward the law-school road) has a
// tile roof and a white arched gable.
import * as THREE from 'three';
import { PAVE, WHITE, box, flat } from './modelkit';
import { PL, createSite, render, ringRoof, window_, type Kit, type Spec, type Style } from './blocks';

// ---------- Diaspora Dome ----------
/** marquee walls: white panels with a row of dark windows over a grey skirt (owner photos) */
const TENT_WALL: Style = {
  bay: 3.0,
  up: [[70, 80, 116, 70]],
  ground: [[70, 256 + 80, 116, 70]],
  draw: (g) => {
    render(g, '#f7f7f5');
    for (const y0 of [0, 256]) {
      g.fillStyle = 'rgba(160,160,160,0.5)'; g.fillRect(0, y0, 3, 256);
      window_(g, [70, y0 + 80, 116, 70], '#e8e8e6', 1, 0);
      g.fillStyle = '#8f9396'; g.fillRect(0, y0 + 226, 256, 30);
    }
  },
};

/** a marquee roof over x0..x1 (span) and z0..z1 (ridge along z): white membrane, grey ribs, white gable ends */
function tentRoof(k: Kit, x0: number, x1: number, z0: number, z1: number, eave: number, rise: number) {
  const xm = (x0 + x1) / 2, o = 0.3, half = (x1 - x0) / 2 + o, slope = Math.hypot(half, rise), ang = Math.atan2(rise, half);
  for (const s of [-1, 1]) {
    k.plain.push([new THREE.BoxGeometry(slope, 0.08, z1 - z0 + 2 * o).rotateZ(s * -ang).translate(xm + (s * half) / 2, eave + rise / 2, (z0 + z1) / 2), '#f4f5f4']);
    // the frame's ribs every 5 m
    for (let z = z0; z <= z1 + 0.01; z += 5) k.plain.push([new THREE.BoxGeometry(slope, 0.1, 0.12).rotateZ(s * -ang).translate(xm + (s * half) / 2, eave + rise / 2 + 0.04, Math.min(z, z1)), '#c9cbcc']);
  }
  for (const [z, d] of [[z0, -1], [z1, 1]] as [number, number][]) {
    const tri = flat([[x0, eave], [x1, eave], [xm, eave + rise]], 0);
    if (d < 0) tri.rotateY(Math.PI).translate(2 * xm, 0, 0);
    k.plain.push([tri.translate(0, 0, z + d * 0.02), '#f7f7f5']);
  }
}

/** a cabin with a green roof (owner photo) */
function cabin(k: Kit, x0: number, x1: number, z0: number, z1: number) {
  k.plain.push([box(x0, x1, 0, 2.5, z0, z1), '#eef0ee']);
  k.plain.push([box(x0 - 0.1, x1 + 0.1, 2.5, 2.8, z0 - 0.1, z1 + 0.1), '#3f8a46']);
  const long = x1 - x0 > z1 - z0;
  for (let t = 0.2; t < 0.9; t += 0.3) {
    if (long) k.glass.push(box(x0 + (x1 - x0) * t, x0 + (x1 - x0) * (t + 0.15), 1.0, 1.9, z1, z1 + 0.04));
    else k.glass.push(box(x1, x1 + 0.04, 1.0, 1.9, z0 + (z1 - z0) * t, z0 + (z1 - z0) * (t + 0.15)));
  }
}

const TENT_EAVE = PL + 3.6 + 0.4;
const TENTS: [number, number, number, number, number][] = [
  // x0, x1, z0, z1, ridge rise (the owner's aerial, registered: model frame, ridge along z)
  [-40, -14, -15, 23, 4.2],
  [-15.5, 3, -31.5, -17.5, 3.4],
  [12, 36, -21, 18, 4.2],
  [38, 55, -36, -21, 3.4],
];

const dome: Spec = {
  name: 'Diaspora Dome',
  axis: [0.864, -0.503], origin: [0.2, 1582.2], storey: 3.6, style: TENT_WALL, roofColor: '#f4f5f4', fascia: '#c9cbcc', pitch: 0.3,
  blocks: TENTS.map(([x0, x1, z0, z1]) => ({ x0, x1, z0, z1, floors: 1, roof: 'none' as const })),
  keep: [[-49, 39, -50, 29], [49, 65, -50, 29], [39, 49, -50, -21]],
  extras: (k) => {
    for (const [x0, x1, z0, z1, rise] of TENTS) tentRoof(k, x0, x1, z0, z1, TENT_EAVE, rise);
    // the halls' doors onto the lawn (owner's marks): glass doors in a grey frame
    const door = (x: number, z: number, alongZ: boolean) => {
      if (alongZ) { k.glass.push(box(x - 0.04, x + 0.04, PL, 2.6, z - 1.1, z + 1.1)); k.plain.push([box(x - 0.08, x + 0.08, 2.6, 2.8, z - 1.25, z + 1.25), '#8f9396']); }
      else { k.glass.push(box(x - 1.1, x + 1.1, PL, 2.6, z - 0.04, z + 0.04)); k.plain.push([box(x - 1.25, x + 1.25, 2.6, 2.8, z - 0.08, z + 0.08), '#8f9396']); }
    };
    for (const z of [-12.7, -2.7, 7, 15.7]) door(-14, z, true);
    for (const z of [-13.7, -2.2, 7.5, 16.7]) door(12, z, true);
    door(-1.5, -17.5, false);
    // the lawn: paved paths in an X and a cross, and the round plaza with its cross (aerial)
    const P = '#d8d0bd', y = 0.05;
    const path = (ax: number, az: number, bx: number, bz: number, w = 2.4) => {
      const len = Math.hypot(bx - ax, bz - az);
      k.plain.push([new THREE.BoxGeometry(len, 0.06, w).rotateY(-Math.atan2(bz - az, bx - ax)).translate((ax + bx) / 2, y, (az + bz) / 2), P]);
    };
    path(-13, 0, 9, 0); path(0, -16, 0, 26); path(-13, -16, 9, 22, 2); path(9, -18, -13, 24, 2);
    k.plain.push([new THREE.CylinderGeometry(7, 7, 0.08, 40).translate(0, 0.06, 0), P]);
    k.plain.push([new THREE.CylinderGeometry(6.2, 6.2, 0.1, 40).translate(0, 0.07, 0), '#5f8a3e']);
    k.plain.push([box(-6.2, 6.2, 0, 0.12, -0.9, 0.9), P], [box(-0.9, 0.9, 0, 0.12, -6.2, 6.2), P]);
    k.plain.push([new THREE.CylinderGeometry(1.6, 1.6, 0.14, 24).translate(0, 0.08, 0), P]);
    // green-roofed cabins beside the halls (owner photo)
    cabin(k, -40, -28, -21, -18.5); cabin(k, 36.5, 39, 2, 14);
    // the dark green fence round the site; the front of the lawn is open (no gate), and the service road comes in on the east
    const FENCE = '#1f3d2c', h = 2.3;
    const fence = (ax: number, az: number, bx: number, bz: number) => {
      const len = Math.hypot(bx - ax, bz - az);
      k.plain.push([new THREE.BoxGeometry(len, h, 0.12).rotateY(-Math.atan2(bz - az, bx - ax)).translate((ax + bx) / 2, h / 2, (az + bz) / 2), FENCE]);
    };
    fence(-49, -50, 65, -50); fence(65, -50, 65, 29); fence(-49, -50, -49, 29);
    fence(-49, 29, -40, 29); fence(-40, 23, -40, 29); fence(36, 18, 36, 29); fence(36, 29, 39, 29); fence(49, 29, 65, 29);
  },
};

// ---------- International House ----------
/** upper floors: a recessed bay of brown louvred windows between white piers; ground floor: dark glazing */
const IH_WIN: Style = {
  bay: 3.4,
  up: [[56, 50, 144, 140]],
  ground: [[24, 70, 208, 120]],
  draw: (g) => {
    render(g, '#f8f8f5');
    // the recess round the window, shaded at the top
    g.fillStyle = '#e4e2dc'; g.fillRect(44, 24, 168, 200);
    g.fillStyle = 'rgba(70,60,50,0.25)'; g.fillRect(44, 24, 168, 12);
    g.fillStyle = '#6b4a2f'; g.fillRect(56, 50, 144, 140);
    g.fillStyle = '#a07a4e';
    for (let y = 56; y < 186; y += 9) { g.fillRect(60, y, 66, 4); g.fillRect(130, y, 66, 4); }
    g.fillStyle = '#6b4a2f'; g.fillRect(126, 50, 4, 140);
    g.fillStyle = '#ffffff'; g.fillRect(48, 196, 160, 8);
    g.fillStyle = '#f2f1ec'; g.fillRect(0, 232, 256, 24);
    window_(g, [24, 256 + 70, 208, 120], '#2a2d33', 4, 0.25);
  },
};

const intlHouse: Spec = {
  name: 'International House',
  axis: [1, 0], origin: [571.4, -201], storey: 3.3, style: IH_WIN, roofColor: '#5b3b2e', fascia: '#3a2a22', pitch: 0.3,
  blocks: [
    { x0: -20.4, x1: 20.4, z0: -20, z1: -9.2, floors: 4, roof: 'none' },
    { x0: -20.4, x1: 20.4, z0: 9.6, z1: 20, floors: 4, roof: 'none' },
    { x0: -20.4, x1: -13.2, z0: -9.2, z1: 9.6, floors: 4, roof: 'none' },
    { x0: 6.1, x1: 20.4, z0: -9.2, z1: 9.6, floors: 4, roof: 'none' },
  ],
  keep: [[-28.5, -20.4, -7.5, 4.5]],
  extras: (k) => {
    const e = k.wallTop(4);
    ringRoof(k, [-21.2, 21.2, -20.8, 20.8], [-12.4, 5.3, -8.4, 8.8], e, 2.6, '#3a2a22');
    // AC units here and there on the faces (owner photo)
    for (const [x, f] of [[-15, 1], [-6, 2], [3, 1], [11, 3], [16, 2], [-10, 3]] as [number, number][]) {
      const y = PL + f * 3.3 + 0.5;
      k.plain.push([box(x - 0.45, x + 0.45, y, y + 0.6, 20, 20.3), '#e8e8e6'], [box(x - 0.45, x + 0.45, y, y + 0.6, -20.3, -20), '#e8e8e6']);
    }
    // the entrance porch on the west face (owner photo and aerial): single storey, glass front
    const x0 = -27.4, x1 = -20.4, z0 = -4.6, z1 = 2.7, ph = 3.4;
    k.plain.push([box(x0, x1, 0, 0.3, z0, z1), PAVE]);
    k.glass.push(box(x0 - 0.02, x0 + 0.02, 0.3, 2.9, z0 + 0.4, z1 - 0.4));
    for (const z of [z0 + 0.4, -0.95, z1 - 0.4]) k.plain.push([box(x0 - 0.05, x0 + 0.2, 0.3, ph, z - 0.18, z + 0.18), WHITE]);
    k.plain.push([box(x0 - 0.1, x1, ph, ph + 0.5, z0 - 0.1, z1 + 0.1), WHITE]);
    // a tile hipped roof over the north part of the porch
    const re = ph + 0.5, rr = 1.3, xm = (x0 + x1) / 2;
    k.roof.c = new THREE.Color('#b8603a');
    k.roof.quad([x0 - 0.5, re, z0 - 0.5], [x0 - 0.5, re, -0.2], [xm, re + rr, -1.5], [xm, re + rr, z0 + 1.2]);
    k.roof.quad([x1, re, -0.2], [x1, re, z0 - 0.5], [xm, re + rr, z0 + 1.2], [xm, re + rr, -1.5]);
    k.roof.quad([x1, re, z0 - 0.5], [x0 - 0.5, re, z0 - 0.5], [xm, re + rr, z0 + 1.2], [xm, re + rr, z0 + 1.2]);
    // the white arched gable over the south part, facing the road, with a dark brown arch in it
    const gx = x0 - 0.15, gz0 = -0.2, gz1 = z1 + 0.1, gzm = (gz0 + gz1) / 2, gw = (gz1 - gz0) / 2;
    const gable = flat([[-gw, re], [gw, re], [gw, re + 0.9], [0, re + 1.9], [-gw, re + 0.9]], 0).rotateY(-Math.PI / 2).translate(gx, 0, gzm);
    k.plain.push([gable, '#fbfaf6']);
    const arch = new THREE.CircleGeometry(1.15, 18, 0, Math.PI).translate(0, re - 0.25, 0).rotateY(-Math.PI / 2).translate(gx - 0.03, 0, gzm);
    k.plain.push([arch, '#5b3b2e']);
    k.plain.push([box(gx - 0.05, gx + 0.05, re - 0.3, re, gz0, gz1), '#5b3b2e']);
    k.signs.push({ text: 'INTERNATIONAL HOUSE', x: x0 - 0.12, y: ph + 0.25, z: -2.6, ry: -Math.PI / 2, w: 3.2, colors: ['#ffffff', '#5b3b2e'] });
  },
};

/** the Diaspora Dome and International House */
export const domeHouse = createSite('dome-house', [dome, intlHouse]);
