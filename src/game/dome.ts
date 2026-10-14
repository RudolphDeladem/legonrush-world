// The Diaspora Dome, north-west of the Lizalex Quadrangle (between Kwapong and Sey halls), and International House opposite the School of
// Law, modelled from the owner's photos and registered aerials (block engine: blocks.ts).
//
// Diaspora Dome: not a storey building but single-storey white marquee halls (a pitched white
// membrane roof over white walls with windows) round a lawn with paved paths and a round plaza, a
// few green-roofed cabins beside them, inside a dark green fence along the road.
//
// International House: a four-storey white block round a courtyard under a low dark-brown hipped
// roof; recessed bays of glass windows in silver-grey frames on the upper floors (owner), a strip of glazing on the
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
// (the owner's 20-picture corrections, Pictures 10-12: the frontage is a finer rhythm than one window to a bay: each bay
// a wide framed window beside a narrow recessed vertical strip of plain white wall that runs from the ground to the eaves,
// with the air-conditioning units hung in the strips; the windows' curtains differ; a long terracotta roof; the entrance a
// projecting white porch under a broad low triangular pediment with a wine half-round panel over the recessed glazed
// doors; the blue INTERNATIONAL HOUSE sign high on the front; a paved forecourt before it to the road.)
const IH_W = '#f8f8f5';
const ihFace = (g: CanvasRenderingContext2D, y0: number, wy: number, wh: number, tint: string) => {
  // the recessed strip on the right of the bay: a shaded plain panel with a dark edge where it steps back
  g.fillStyle = '#e6e5e0'; g.fillRect(178, y0, 72, 256);
  g.fillStyle = 'rgba(60,55,50,0.28)'; g.fillRect(178, y0, 6, 256);
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(244, y0, 6, 256);
  // the wide window: three panes in a dark frame, the curtains behind
  window_(g, [16, y0 + wy, 150, wh], '#6d6a66', 3, 0);
  g.fillStyle = tint; g.fillRect(16, y0 + wy, 150, wh * 0.55);
  g.fillStyle = '#6d6a66'; for (const x of [16, 66, 116]) g.fillRect(x + 48, y0 + wy, 4, wh);
};
const IH_WIN: Style = {
  bay: 3.4,
  up: [[16, 64, 150, 104]],
  ground: [[16, 256 + 70, 150, 118]],
  draw: (g) => {
    render(g, IH_W);
    g.fillStyle = IH_W; g.fillRect(0, 0, 256, 512);
    ihFace(g, 0, 64, 104, 'rgba(176,140,70,0.45)');
    ihFace(g, 256, 70, 118, 'rgba(60,70,80,0.35)');
  },
};
/** a bay whose window has darker curtains (the frontage's windows differ, Pictures 11, 12) */
const IH_WIN2: Style = {
  ...IH_WIN,
  draw: (g) => {
    render(g, IH_W);
    g.fillStyle = IH_W; g.fillRect(0, 0, 256, 512);
    ihFace(g, 0, 64, 104, 'rgba(120,85,50,0.5)');
    ihFace(g, 256, 70, 118, 'rgba(60,70,80,0.35)');
  },
};

const intlHouse: Spec = {
  name: 'International House',
  axis: [1, 0], origin: [571.4, -201], storey: 3.3, style: IH_WIN, roofColor: '#b65a3a', fascia: '#ece8e0', pitch: 0.3,
  blocks: [
    { x0: -20.4, x1: 20.4, z0: -20, z1: -9.2, floors: 4, roof: 'none' },
    { x0: -20.4, x1: 20.4, z0: 9.6, z1: 20, floors: 4, roof: 'none', floorStyle: { 2: IH_WIN2 } },
    { x0: -20.4, x1: -13.2, z0: -9.2, z1: 9.6, floors: 4, roof: 'none', floorStyle: { 1: IH_WIN2 } },
    { x0: 6.1, x1: 20.4, z0: -9.2, z1: 9.6, floors: 4, roof: 'none' },
  ],
  keep: [[-33, -20.4, -31, 26]],
  extras: (k) => {
    const e = k.wallTop(4);
    ringRoof(k, [-21.2, 21.2, -20.8, 20.8], [-12.4, 5.3, -8.4, 8.8], e, 2.6, '#ece8e0');
    // AC units hung in the recessed strips (Pictures 11, 12): a strip is the last 0.95 m of each 3.4 m bay
    const strip = (x0: number, i: number) => x0 + i * 3.4 + 2.9;
    for (const [i, f] of [[0, 1], [2, 2], [3, 1], [5, 3], [7, 1], [8, 2], [10, 2], [11, 1]] as [number, number][]) {
      const x = strip(-20.4, i), y = PL + f * 3.3 + 0.4;
      if (x > 20) continue;
      k.plain.push([box(x - 0.4, x + 0.4, y, y + 0.55, 20, 20.32), '#e9e9e6'], [box(x - 0.4, x + 0.4, y, y + 0.55, -20.32, -20), '#e9e9e6']);
    }
    for (const [i, f] of [[1, 1], [2, 3], [4, 2], [6, 1], [8, 3], [9, 1]] as [number, number][]) {
      const z = strip(-20, i), y = PL + f * 3.3 + 0.4;
      if (z > 19.6 || Math.abs(z + 0.6) < 4.2) continue;
      k.plain.push([box(-20.72, -20.4, y, y + 0.55, z - 0.4, z + 0.4), '#e9e9e6']);
    }
    // the entrance porch on the west face, its middle on the front's middle bay: white side walls and front piers, the
    // glazed doors recessed behind them, a broad low pediment over it with the wine half-round in its tympanum
    const zc = -0.6, hw = 3.4, x0 = -24.0, x1 = -20.4, ph = 3.6, ap = 2.2;
    k.plain.push([box(x0 - 0.6, x1, 0, 0.3, zc - hw - 0.6, zc + hw + 0.6), PAVE]);
    for (const s of [-1, 1]) k.plain.push([box(x0, x1, 0.3, ph, zc + s * hw - (s > 0 ? 0.7 : 0), zc + s * hw + (s < 0 ? 0.7 : 0)), WHITE]);
    k.plain.push([box(x0, x1, ph - 0.5, ph, zc - hw, zc + hw), WHITE]);
    k.glass.push(box(x1 - 1.2, x1 - 1.16, 0.3, ph - 0.5, zc - hw + 0.7, zc + hw - 0.7));
    for (const z of [zc - 1.3, zc, zc + 1.3]) k.plain.push([box(x1 - 1.25, x1 - 1.1, 0.3, ph - 0.5, z - 0.05, z + 0.05), '#3a3a3a']);
    k.plain.push([box(x0, x1 - 1.2, ph - 0.62, ph - 0.5, zc - hw + 0.7, zc + hw - 0.7), '#e3e0d8']);
    // the pediment: a triangular white face toward the road over a shallow tiled top
    const pw = hw + 0.5, py = ph;
    const ped = flat([[-pw, 0], [pw, 0], [0, ap]], 0).rotateY(-Math.PI / 2).translate(x0 - 0.12, py, zc);
    k.plain.push([ped, '#fbfaf6']);
    const halfDisc = new THREE.CircleGeometry(1.75, 24, 0, Math.PI).rotateY(-Math.PI / 2).translate(x0 - 0.16, py + 0.12, zc);
    k.plain.push([halfDisc, '#7a2a2c']);
    k.plain.push([box(x0 - 0.18, x0 - 0.1, py, py + 0.12, zc - pw, zc + pw), '#efece5']);
    k.roof.c = new THREE.Color('#b65a3a');
    k.roof.quad([x0 - 0.15, py, zc - pw], [x0 - 0.15, py + ap, zc], [x1, py + ap, zc], [x1, py, zc - pw]);
    k.roof.quad([x0 - 0.15, py + ap, zc], [x0 - 0.15, py, zc + pw], [x1, py, zc + pw], [x1, py + ap, zc]);
    // the blue sign high on the front, right of the porch as seen from the road (Pictures 11, 12)
    k.signs.push({ text: 'INTERNATIONAL HOUSE', x: -20.48, y: PL + 3 * 3.3 + 0.2, z: 5.2, ry: -Math.PI / 2, w: 5.0, colors: ['#1f3f8a', '#f2f4f8'] });
    // the paved forecourt from the facade to the road: grey-beige blocks, a low stone-faced planter at the south-west
    // corner (Picture 12's foreground), a palm in it
    k.plain.push([box(-32.2, -20.4, 0, 0.05, -30.5, 25.5), "#bdb6a8"]);
    k.plain.push([box(-31.8, -27.5, 0, 0.55, 18.5, 24.8), "#a49c8c"], [box(-31.5, -27.8, 0.55, 0.62, 18.8, 24.5), "#5f7a3a"]);
  },
};

/** the Diaspora Dome and International House */
export const domeHouse = createSite('dome-house', [dome, intlHouse]);
