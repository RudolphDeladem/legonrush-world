// The banking square, modelled from the owner's labelled aerial and photos (all single storey).
//
// The bank compound: a ring of single-storey rooms round a courtyard car park, under one red roof
// that also covers verandas along the long sides and walkways along the short ones. CBG has the
// west wing (door on the south side, with steps, red pillars, a canopy sign and flags), UMB the
// south wing (a porch under a dark gable with the yellow umb logo), Stanbic the north-east corner and
// the north half of the east wing, entered from the north side. The ATM
// bay juts out at the north-west; the middle of the north wing is the big entrance to the
// courtyard car park.
//
// The Union Building, which houses Ecobank: a square core with two short wings on each side,
// hipped tile roofs with solar panels and a lantern over the middle; Ecobank's door is in the
// north notch, the Union Building's (sign: ALUMNI BUILDING) in the east notch.
//
// ADB and HFC (now Republic Bank): two red-roofed blocks beside the brown-roofed block OSM maps.
//
// The correction brief (65 slides, 2026-10-15): CalBank's porch and Prudential Bank's entrance on the compound, the
// west wing's wall with its air-conditioning units; Republic Bank and the UG Credit Union Building on the long block's
// west front over a block-paved forecourt behind a low rubble wall; Ecobank's door, steps, ramp, ATM and roadside sign.
import * as THREE from 'three';
import { PAVE, TRIM, WHITE, box, canvas, speckle } from './modelkit';
import { BAND, OV, PL, createSite, render, ringRoof, window_, type Block, type Face, type Kit, type Spec, type Style } from './blocks';
import { pave, pavers } from './upsa';
import { letters } from './letters';
import { stoneMesh } from './concrete';

// ---------- facades ----------
/** the compound's rooms: white render, a dark window in each bay over a red-brown base (owner's CBG photo) */
const BANK_WIN: Style = {
  bay: 3.6,
  up: [[66, 70, 124, 120]],
  ground: [[66, 70, 124, 120]],
  draw: (g) => {
    render(g);
    window_(g, [66, 70, 124, 120], '#4a4f56', 2, 0.32);
    window_(g, [66, 256 + 70, 124, 120], '#4a4f56', 2, 0.32);
    g.fillStyle = '#8e3f33'; g.fillRect(0, 490, 256, 22);
  },
};
/** UMB's wing (owner photo): the same windows in cream render */
const UMB_WIN: Style = {
  ...BANK_WIN,
  draw: (g) => {
    render(g, '#efe3c4');
    g.fillStyle = '#efe3c4'; g.fillRect(0, 0, 256, 512);
    window_(g, [66, 70, 124, 120], '#4a4f56', 2, 0.32);
    window_(g, [66, 256 + 70, 124, 120], '#4a4f56', 2, 0.32);
    g.fillStyle = '#8e3f33'; g.fillRect(0, 490, 256, 22);
  },
};
/** the Union Building: white walls, wide blue-tinted windows in blue frames (owner photo) */
const UNION_WIN: Style = {
  bay: 4.0,
  up: [[40, 60, 176, 150]],
  ground: [[40, 60, 176, 150]],
  draw: (g) => {
    render(g, '#f6f6f2');
    for (const y0 of [0, 256]) {
      const [x, y, w, h] = [40, y0 + 60, 176, 150];
      g.fillStyle = '#2a5d9a'; g.fillRect(x - 5, y - 5, w + 10, h + 10);
      const gl = g.createLinearGradient(0, y, 0, y + h);
      gl.addColorStop(0, '#6f9fd0'); gl.addColorStop(1, '#2d4f7c');
      g.fillStyle = gl; g.fillRect(x, y, w, h);
      g.fillStyle = '#2a5d9a';
      g.fillRect(x + w / 2 - 3, y, 6, h);
      g.fillRect(x, y + h * 0.62, w, 5);
      g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x + 8, y + 6, 30, h - 12);
    }
  },
};

/** a parked car (body, cabin, glass) for the courtyard car park */
export function car(k: Kit, x: number, z: number, along: 'x' | 'z', color: string) {
  const [l, w] = [4.3, 1.8];
  const [sx, sz] = along === 'x' ? [l, w] : [w, l];
  k.plain.push([box(x - sx / 2, x + sx / 2, 0.3, 1.0, z - sz / 2, z + sz / 2), color]);
  const [cx, cz] = along === 'x' ? [l * 0.55, w * 0.9] : [w * 0.9, l * 0.55];
  k.plain.push([box(x - cx / 2, x + cx / 2, 1.0, 1.45, z - cz / 2, z + cz / 2), '#2a323c']);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.plain.push([box(x + dx * sx * 0.32 - 0.3, x + dx * sx * 0.32 + 0.3, 0, 0.6, z + dz * sz * 0.45 - 0.15, z + dz * sz * 0.45 + 0.15), '#151515']);
}

/** the courtyard car park: asphalt with white bay lines, in the model frame */
function carPark(k: Kit, x0: number, x1: number, z0: number, z1: number) {
  const PPM = 10, W = Math.round((x1 - x0) * PPM), H = Math.round((z1 - z0) * PPM);
  const tex = canvas(W, H, (g) => {
    g.fillStyle = '#5d5f62'; g.fillRect(0, 0, W, H);
    speckle(g, 0, 0, W, H, W * H * 0.03, ['#55575a', '#67696c', '#4f5154']);
    g.fillStyle = '#e8e8e2';
    // bays along the west and east sides, nose to the wings
    for (let z = 2; z < z1 - z0 - 2; z += 2.6) { g.fillRect(0, z * PPM, 5 * PPM, 2); g.fillRect(W - 5 * PPM, z * PPM, 5 * PPM, 2); }
    g.fillStyle = '#d9c55a'; g.fillRect(W / 2 - 1, 2 * PPM, 3, H - 4 * PPM);
  });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, 0.05, (z0 + z1) / 2),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  m.receiveShadow = true;
  k.meshes.push(m);
}

/** a door with a canopy sign over it, on a wall facing +z (dir 1) or -z (dir -1) at z, centred on x */
function bankDoorZ(k: Kit, x: number, z: number, dir: 1 | -1, text: string, colors: [string, string], w = 3.2) {
  const f = (d: number) => z + dir * d;
  k.glass.push(box(x - w / 2, x + w / 2, PL, 3.0, Math.min(f(0), f(0.04)), Math.max(f(0), f(0.04))));
  k.plain.push([box(x - w / 2 - 0.12, x + w / 2 + 0.12, 3.0, 3.15, Math.min(f(0), f(0.1)), Math.max(f(0), f(0.1))), '#3a3d42']);
  k.plain.push([box(x - 0.05, x + 0.05, PL, 3.0, Math.min(f(0), f(0.08)), Math.max(f(0), f(0.08))), '#3a3d42']);
  // canopy box with the bank's sign on its front
  k.plain.push([box(x - w / 2 - 0.8, x + w / 2 + 0.8, 3.25, 3.85, Math.min(f(0), f(1.6)), Math.max(f(0), f(1.6))), colors[0]]);
  k.signs.push({ text, x, y: 3.55, z: f(1.61), ry: dir > 0 ? 0 : Math.PI, w: Math.min(w + 1.2, 4.2), colors });
  k.plain.push([box(x - w / 2 - 0.4, x + w / 2 + 0.4, 0, 0.3, Math.min(f(0), f(1.4)), Math.max(f(0), f(1.4))), PAVE]);
}
/** the same on a wall facing +x (dir 1) or -x (dir -1) at x, centred on z */
function bankDoorX(k: Kit, x: number, z: number, dir: 1 | -1, text: string, colors: [string, string], w = 3.2) {
  const f = (d: number) => x + dir * d;
  k.glass.push(box(Math.min(f(0), f(0.04)), Math.max(f(0), f(0.04)), PL, 3.0, z - w / 2, z + w / 2));
  k.plain.push([box(Math.min(f(0), f(0.1)), Math.max(f(0), f(0.1)), 3.0, 3.15, z - w / 2 - 0.12, z + w / 2 + 0.12), '#3a3d42']);
  k.plain.push([box(Math.min(f(0), f(1.6)), Math.max(f(0), f(1.6)), 3.25, 3.85, z - w / 2 - 0.8, z + w / 2 + 0.8), colors[0]]);
  k.signs.push({ text, x: f(1.61), y: 3.55, z, ry: dir > 0 ? Math.PI / 2 : -Math.PI / 2, w: Math.min(w + 1.2, 4.2), colors });
  k.plain.push([box(Math.min(f(0), f(1.4)), Math.max(f(0), f(1.4)), 0, 0.3, z - w / 2 - 0.4, z + w / 2 + 0.4), PAVE]);
}

const RED = '#b23b33', ONE = 1, STOREY = 3.6;
const eaveOf = () => PL + ONE * STOREY + BAND;

// ---------- the bank compound (model frame = map axes, origin at 158, 997) ----------
const compound: Spec = {
  name: 'University of Ghana banking square',
  axis: [1, 0], origin: [158, 997], storey: STOREY, style: BANK_WIN, roofColor: '#bf4a3c', fascia: TRIM, pitch: 0.3,
  blocks: [
    // north side: the north-west block and the ATM bay, the rooms either side of the car-park entrance, the north-east (Stanbic) block and bay
    { x0: -32.3, x1: -20.9, z0: -21.4, z1: -13.4, floors: ONE, roof: 'none' },
    { x0: -20.9, x1: -6, z0: -22, z1: -14.7, floors: ONE, roof: 'none' },
    { x0: -21.2, x1: -10.9, z0: -24.9, z1: -22, floors: ONE, roof: 'none' },
    { x0: 9, x1: 32.4, z0: -22, z1: -14.5, floors: ONE, roof: 'none' },
    { x0: 12.9, x1: 23, z0: -25.4, z1: -22, floors: ONE, roof: 'none' },
    // west wing (CBG), the south-west block and its bay; the rooms reach the road side under the roof's edge (the
    // correction brief, slide 3: a continuous wall of windows with air-conditioning units along its foot, no veranda)
    { x0: -20.9, x1: -10.7, z0: -14.7, z1: 14.8, floors: ONE, roof: 'none' },
    { x0: -32.3, x1: -20.9, z0: -13.4, z1: 14.8, floors: ONE, roof: 'none' },
    { x0: -33, x1: -10.6, z0: 14.8, z1: 23.1, floors: ONE, roof: 'none' },
    { x0: -20.9, x1: -10.6, z0: 23.1, z1: 25.3, floors: ONE, roof: 'none' },
    // south wing (UMB), the south-east block and its bay
    { x0: -10.6, x1: 14.8, z0: 14.5, z1: 23.1, floors: ONE, roof: 'none', faces: { z1: UMB_WIN } },
    { x0: 13.4, x1: 33.1, z0: 14.3, z1: 23.1, floors: ONE, roof: 'none' },
    { x0: 14.8, x1: 23.9, z0: 23.1, z1: 25.6, floors: ONE, roof: 'none' },
    // east wing (Stanbic's north half)
    { x0: 13.4, x1: 23.6, z0: -14.5, z1: 14.3, floors: ONE, roof: 'none' },
  ],
  keep: [[-33.6, 33.7, -27.4, 27.3]],
  extras: (k) => {
    const e = eaveOf();
    // one red roof over the rooms, the verandas and the walkways (owner aerial)
    ringRoof(k, [-33.6, 33.7, -26.0, 26.2], [-10.1, 12.8, -14.1, 13.9], e, 2.4);
    // verandas: slim posts along the outer roof line where OSM leaves the rooms open
    for (let z = -12.5; z <= 14; z += 4.5) k.plain.push([box(32.6, 32.9, 0, e, z - 0.15, z + 0.15), WHITE]);
    // the air-conditioning units along the foot of the west wall (slide 3)
    for (let z = -11.2; z <= 13; z += 2.6) {
      k.plain.push([box(-33.0, -32.3, 0.25, 0.95, z - 0.45, z + 0.45), '#e6e6e3'], [box(-33.04, -33.0, 0.4, 0.85, z - 0.3, z + 0.3), '#4a4d51']);
      k.plain.push([box(-32.95, -32.35, 0, 0.25, z - 0.4, z - 0.32), '#7d7f82'], [box(-32.95, -32.35, 0, 0.25, z + 0.32, z + 0.4), '#7d7f82']);
    }
    for (const x of [-30, -25, -8.5, 11.5, 26, 30]) k.plain.push([box(x - 0.15, x + 0.15, 0, e, -25.3, -25.0), WHITE]); // the gate stays open
    for (const x of [-31, -18, -2, 6, 11, 27, 31]) k.plain.push([box(x - 0.15, x + 0.15, 0, e, 25.2, 25.5), WHITE]); // clear of the CBG, CalBank and UMB doors
    k.plain.push([box(-33.4, 33.4, 0, 0.2, -26, -14.5), PAVE], [box(-33.4, 33.4, 0, 0.2, 14.5, 26), PAVE]);
    k.plain.push([box(-33.4, -20.9, 0, 0.2, -14.5, 14.5), PAVE], [box(23.6, 33.4, 0, 0.2, -14.5, 14.5), PAVE]);
    // the big entrance to the courtyard car park: gate pillars and a beam with the square's name
    for (const x of [-6, 9]) k.plain.push([box(x - 0.45, x + 0.45, 0, e - 0.3, -22.4, -21.6), WHITE], [box(x - 0.45, x + 0.45, 0, e - 0.3, -15.1, -14.3), WHITE]);
    k.plain.push([box(-6.4, 9.4, e - 1.3, e - 0.3, -22.3, -21.7), WHITE]);
    k.signs.push({ text: 'UNIVERSITY OF GHANA BANKING SQUARE', x: 1.5, y: e - 0.8, z: -22.31, ry: Math.PI, w: 9 });
    carPark(k, -10.7, 13.4, -14.7, 14.5);
    for (const [x, z, c] of [[-7.5, -9, '#e9e9ea'], [-7.5, -3.8, '#7a1e1e'], [-7.5, 4, '#2b3b5a'], [10.2, -6.4, '#c8ccd0'], [10.2, 1.4, '#1b1d22'], [10.2, 6.6, '#e9e9ea']] as [number, number, string][]) car(k, x, z, 'x', c);
    k.plain.push([new THREE.CylinderGeometry(0.2, 0.28, 2.6, 7).translate(-8.5, 1.3, 10.5), '#5b4330'], [new THREE.IcosahedronGeometry(2.4, 1).scale(1, 0.85, 1).translate(-8.5, 4, 10.5), '#2f5d27']);
    // ATM bay (owner: about two ATM machines), facing the road on the north side
    for (const x of [-18.3, -13.8]) {
      k.plain.push([box(x - 0.6, x + 0.6, 0, 2.0, -25.2, -24.9), '#d7d9dc']);
      k.glass.push(box(x - 0.35, x + 0.35, 1.1, 1.6, -25.25, -25.2));
      k.plain.push([box(x - 0.45, x + 0.45, 0.85, 0.95, -25.5, -25.2), '#2b2e33']);
    }
    k.signs.push({ text: 'ATM', x: -16, y: 3.25, z: -24.95, ry: Math.PI, w: 1.6, colors: ['#c8102e', '#ffffff'] });
    // CBG (west wing): its door on the south side with steps, red pillars, a canopy sign, flags and an ATM (owner photo)
    const cx = -24.5, cz = 23.1;
    k.glass.push(box(cx - 1.6, cx + 1.6, 0.9, 3.0, cz, cz + 0.04));
    for (const x of [cx - 0.8, cx, cx + 0.8]) k.plain.push([box(x - 0.04, x + 0.04, 0.9, 3.0, cz, cz + 0.08), '#8c9096']);
    for (const s of [-1, 1]) k.plain.push([box(cx + s * 2.6 - 0.3, cx + s * 2.6 + 0.3, 0.6, e - 0.2, cz + 2.0, cz + 2.6), RED]);
    k.plain.push([box(cx - 3.2, cx + 3.2, 3.1, 3.7, cz, cz + 2.7), '#9aa0a6']);
    k.signs.push({ text: 'CBG', x: cx, y: 3.4, z: cz + 2.71, ry: 0, w: 1.6, colors: ['#3b3f45', '#ffffff'] });
    for (let i = 0; i < 3; i++) k.plain.push([box(cx - 2.6 - i * 0.2, cx + 2.6 + i * 0.2, 0, 0.9 - i * 0.3, cz, cz + 1.4 + i * 0.45), '#a34b33']);
    for (const [x, cols] of [[cx - 6, ['#ce1126', '#fcd116', '#006b3f']], [cx - 5.2, ['#c8102e', '#c8102e', '#ffffff']]] as [number, string[]][]) {
      k.plain.push([new THREE.CylinderGeometry(0.05, 0.06, 6, 6).translate(x, 3, cz + 4.5), '#d8d8d8']);
      cols.forEach((c, i) => k.plain.push([box(x + 0.05, x + 1.3, 5.6 - i * 0.28, 5.88 - i * 0.28, cz + 4.48, cz + 4.52), c]));
    }
    k.plain.push([box(cx + 4.2, cx + 5.0, 0, 1.9, cz + 3.4, cz + 4.0), '#eef0f2'], [box(cx + 4.25, cx + 4.95, 1.9, 2.2, cz + 3.4, cz + 4.0), '#c8102e']);
    // UMB (south wing, owner photo): steps up to a porch on white pillars under a dark gable with the yellow umb logo
    {
      const ux = 2, uz = 23.1, CHAR = '#34373b', CREAM = '#efe3c4';
      k.glass.push(box(ux - 1.5, ux + 1.5, PL, 3.0, uz, uz + 0.04));
      k.plain.push([box(ux - 1.6, ux + 1.6, 3.0, 3.15, uz, uz + 0.1), '#5a5d62']);
      for (const s of [-1, 1]) k.plain.push([box(ux + s * 3.2 - 0.35, ux + s * 3.2 + 0.35, 0.6, e - 0.1, uz + 2.8, uz + 3.5), WHITE]);
      k.plain.push([box(ux - 3.7, ux + 3.7, e - 0.5, e, uz, uz + 3.6), CREAM]);
      // the dark gable: a front-facing pediment with louvre lines and the logo, a tile roof behind it
      const gy = e, gh = 2.4, gw = 4.2;
      k.plain.push([new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-gw, 0), new THREE.Vector2(gw, 0), new THREE.Vector2(0, gh)])).translate(ux, gy, uz + 3.62), CHAR]);
      for (let i = 1; i < 4; i++) k.plain.push([box(ux - gw * (1 - i / 4) + 0.2, ux + gw * (1 - i / 4) - 0.2, gy + (gh * i) / 4 - 0.03, gy + (gh * i) / 4 + 0.03, uz + 3.63, uz + 3.66), '#4a4e53']);
      k.roof.quad([ux - gw - 0.3, gy, uz + 3.8], [ux - gw - 0.3, gy, uz - 0.5], [ux, gy + gh + 0.1, uz - 0.5], [ux, gy + gh + 0.1, uz + 3.8]);
      k.roof.quad([ux + gw + 0.3, gy, uz - 0.5], [ux + gw + 0.3, gy, uz + 3.8], [ux, gy + gh + 0.1, uz + 3.8], [ux, gy + gh + 0.1, uz - 0.5]);
      k.signs.push({ text: 'umb', x: ux, y: gy + 0.85, z: uz + 3.68, ry: 0, w: 1.6, colors: [CHAR, '#f2c200'] });
      for (let i = 0; i < 3; i++) k.plain.push([box(ux - 2.2 - i * 0.2, ux + 2.2 + i * 0.2, 0, 0.6 - i * 0.2, uz, uz + 3.0 + i * 0.4), '#b0623f']);
    }
    // CalBank (the correction brief, slides 10-13): its porch in the south wing's face between the south-west bay and UMB's porch (slide 1 puts CalBank in the south-west part): a
    // deep dark louvred gable, a yellow band, white square columns, the white CalBank sign panel between them, tiled
    // steps up to a recessed dark-glass entry, a trimmed hedge beside the steps
    {
      const qx = -6.4, qz = 23.1, CHAR = '#2f3236', YEL = '#f3b31b';
      k.glass.push(box(qx - 1.4, qx + 1.4, PL, 3.0, qz - 0.6, qz - 0.56));
      k.plain.push([box(qx - 1.9, qx - 1.4, PL, 3.0, qz - 0.6, qz), WHITE], [box(qx + 1.4, qx + 1.9, PL, 3.0, qz - 0.6, qz), WHITE]);
      for (const s of [-1, 1]) k.plain.push([box(qx + s * 2.6 - 0.28, qx + s * 2.6 + 0.28, 0.6, e - 0.5, qz + 2.7, qz + 3.3), WHITE]);
      k.plain.push([box(qx - 3.5, qx + 3.5, e - 0.8, e, qz, qz + 3.5), YEL]);
      const gy = e, gh = 2.4, gw = 3.85;
      k.plain.push([new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-gw, 0), new THREE.Vector2(gw, 0), new THREE.Vector2(0, gh)])).translate(qx, gy, qz + 3.52), CHAR]);
      for (let i = 1; i < 9; i++) k.plain.push([box(qx - gw * (1 - i / 9) + 0.15, qx + gw * (1 - i / 9) - 0.15, gy + (gh * i) / 9 - 0.04, gy + (gh * i) / 9, qz + 3.53, qz + 3.58), '#45494e']);
      k.roof.quad([qx - gw - 0.3, gy, qz + 3.7], [qx - gw - 0.3, gy, qz - 0.5], [qx, gy + gh + 0.1, qz - 0.5], [qx, gy + gh + 0.1, qz + 3.7]);
      k.roof.quad([qx + gw + 0.3, gy, qz - 0.5], [qx + gw + 0.3, gy, qz + 3.7], [qx, gy + gh + 0.1, qz + 3.7], [qx, gy + gh + 0.1, qz - 0.5]);
      // the sign: a white panel under the band between the columns, the orange mark and the name
      k.plain.push([box(qx - 1.9, qx + 1.9, e - 1.75, e - 0.85, qz + 3.25, qz + 3.35), '#fbfbf8']);
      k.plain.push([box(qx - 1.75, qx - 1.25, e - 1.55, e - 1.05, qz + 3.35, qz + 3.38), '#ef7d1a']);
      k.signs.push({ text: 'CalBank', x: qx + 0.25, y: e - 1.3, z: qz + 3.36, ry: 0, w: 2.6, colors: ['#fbfbf8', '#2b2b2b'] });
      for (let i = 0; i < 3; i++) k.plain.push([box(qx - 2.1 - i * 0.15, qx + 2.1 + i * 0.15, 0, 0.6 - i * 0.2, qz, qz + 2.6 + i * 0.4), '#a9583a']);
      k.plain.push([box(qx - 3.4, qx - 2.5, 0, 0.8, qz + 0.3, qz + 2.4), '#3f7a35']);
    }
    // Prudential Bank (slides 14, 15): its entrance in the west face of the north-west block, by the Prudential place: a
    // recessed door with a gilt grille under the blue-lettered PRUDENTIAL BANK LTD. board, tiled steps
    {
      const px = -32.3, pz = -17.4;
      k.plain.push([box(px - 0.12, px, PL, 3.0, pz - 1.6, pz + 1.6), '#f4f2ec']);
      k.glass.push(box(px - 0.02, px + 0.02, PL, 2.7, pz - 1.0, pz + 1.0));
      for (let z = pz - 0.9; z <= pz + 0.9; z += 0.3) k.plain.push([box(px - 0.08, px - 0.04, PL, 2.7, z - 0.025, z + 0.025), '#c9a227']);
      k.plain.push([box(px - 0.2, px - 0.08, 2.75, 3.45, pz - 2.0, pz + 2.0), '#fbfbf8']);
      k.plain.push([box(px - 0.24, px - 0.2, 2.85, 3.35, pz - 1.85, pz - 1.4), '#1f5fa8']);
      k.signs.push({ text: 'PRUDENTIAL BANK LTD.', x: px - 0.21, y: 3.1, z: pz + 0.25, ry: -Math.PI / 2, w: 3.2, colors: ['#fbfbf8', '#1f5fa8'] });
      for (let i = 0; i < 2; i++) k.plain.push([box(px - 0.5 - i * 0.35, px, 0, 0.4 - i * 0.2, pz - 1.6 - i * 0.2, pz + 1.6 + i * 0.2), '#a9583a']);
    }
    // Stanbic: its door in the north face of the north-east corner block, toward the road and car park (owner's mark)
    bankDoorZ(k, 17, -25.4, -1, 'STANBIC BANK', ['#0a3ea8', '#ffffff']);
  },
};

// ---------- the Union Building with Ecobank (frame: the building's axes, origin at its lantern) ----------
const UAX: [number, number] = [0.949, -0.314];
/** solar panels on one slope of a block's hipped roof (side: the eave the slope comes down to) */
function panels(k: Kit, b: Block, side: Face, eave: number, pitch: number) {
  const X0 = b.x0 - OV, X1 = b.x1 + OV, Z0 = b.z0 - OV, Z1 = b.z1 + OV;
  const half = Math.min(X1 - X0, Z1 - Z0) / 2, ang = Math.atan(pitch);
  // across the slope from 25% to 80% of the way up; along it, clear of the hips
  const a0 = half * 0.25, a1 = half * 0.8, depth = (a1 - a0) / Math.cos(ang), y = eave + ((a0 + a1) / 2) * pitch + 0.1;
  let g: THREE.BufferGeometry;
  if (side === 'z0' || side === 'z1') {
    const s = side === 'z0' ? 1 : -1, z = (side === 'z0' ? Z0 : Z1) + s * (a0 + a1) / 2;
    g = new THREE.BoxGeometry(X1 - X0 - half * 2.2, 0.06, depth).rotateX(-s * ang).translate((X0 + X1) / 2, y, z);
  } else {
    const s = side === 'x0' ? 1 : -1, x = (side === 'x0' ? X0 : X1) + s * (a0 + a1) / 2;
    g = new THREE.BoxGeometry(depth, 0.06, Z1 - Z0 - half * 2.2).rotateZ(s * ang).translate(x, y, (Z0 + Z1) / 2);
  }
  k.plain.push([g, '#1f2c4d']);
}
const UNION_BLOCKS: Block[] = [
  { x0: -12.4, x1: 12.5, z0: -12.4, z1: 12.1, floors: ONE },
  { x0: -12.1, x1: -3.5, z0: -22.3, z1: -12.4, floors: ONE },
  { x0: 3.9, x1: 11.6, z0: -22.4, z1: -12.4, floors: ONE },
  { x0: 12.4, x1: 22.9, z0: -13.1, z1: -4.1, floors: ONE },
  { x0: 12.5, x1: 23.9, z0: 2.6, z1: 12.0, floors: ONE },
  { x0: 3.3, x1: 12.6, z0: 12.1, z1: 21.8, floors: ONE },
  { x0: -12.4, x1: -3.0, z0: 12.0, z1: 21.6, floors: ONE },
  { x0: -23, x1: -12.5, z0: -12.6, z1: -4.7, floors: ONE },
  { x0: -24.4, x1: -12.4, z0: 3.6, z1: 12.3, floors: ONE },
];
const union: Spec = {
  name: 'Union Building (Banking Square)',
  axis: UAX, origin: [245.4, 1030.3], storey: STOREY, style: UNION_WIN, roofColor: '#b2603f', fascia: TRIM, pitch: 0.32,
  replaces: [[232.5, 1016.2]],
  blocks: UNION_BLOCKS,
  keep: [[-12.1, 11.6, -25.4, -12.4], [12.5, 24, -4.1, 2.6]],
  extras: (k) => {
    const e = eaveOf();
    // the lantern over the middle: an octagonal drum with a gold cap (aerial)
    const top = e + 13.2 * 0.32;
    k.plain.push([new THREE.CylinderGeometry(3.6, 3.8, 1.6, 8).translate(0, top - 0.4, 0), '#f1eee6']);
    k.glass.push(new THREE.CylinderGeometry(3.65, 3.85, 0.9, 8, 1, true).translate(0, top - 0.4, 0));
    k.plain.push([new THREE.ConeGeometry(4.1, 1.8, 8).translate(0, top + 1.3, 0), '#d6c25a']);
    k.plain.push([new THREE.SphereGeometry(0.35, 10, 6).translate(0, top + 2.4, 0), '#e7d36a']);
    // solar panels on the wings (aerial)
    const B = UNION_BLOCKS;
    panels(k, B[1], 'x0', e, 0.32); panels(k, B[2], 'x1', e, 0.32); panels(k, B[3], 'z0', e, 0.32);
    panels(k, B[7], 'z0', e, 0.32); panels(k, B[8], 'z1', e, 0.32); panels(k, B[4], 'z1', e, 0.32);
    // Ecobank: its door in the north notch, between the two north wings (owner); from the correction brief's photos
    // (slides 43-56): blue-framed glass double doors under the teal Ecobank panel, concrete steps, a ramp with blue rails
    // up to the ATM under its blue awning beside the door, clipped hedges in beds either side, a block-paved court
    const zN = -12.4, BLUE = '#1f5fa8', TEAL = '#2a8ea3';
    const pv = pavers('legon');
    pave(k, -3.5, 3.9, -22.4, zN, pv, 0.03, 2);
    pave(k, -12.1, 11.6, -25.4, -22.4, pv, 0.03, 2);
    k.glass.push(box(-1.6, 1.6, 0.9, 3.0, zN - 0.04, zN));
    for (const x of [-1.65, 0, 1.65]) k.plain.push([box(x - 0.06, x + 0.06, 0.9, 3.0, zN - 0.08, zN), BLUE]);
    k.plain.push([box(-1.7, 1.7, 2.95, 3.08, zN - 0.08, zN), BLUE]);
    k.plain.push([box(-2.6, 2.6, 3.25, 4.35, zN - 0.22, zN - 0.08), TEAL]);
    k.signs.push({ text: 'Ecobank', x: 0, y: 3.8, z: zN - 0.23, ry: Math.PI, w: 3.4, colors: [TEAL, '#ffffff'] });
    for (let i = 0; i < 4; i++) k.plain.push([box(-1.9, 1.9, 0, 0.9 - i * 0.22, zN - 0.9 - i * 0.45, zN), '#b9b6ae']);
    // the ATM beside the door, under its blue awning, reached by a ramp with blue rails
    k.plain.push([box(2.35, 3.75, 0.9, 2.5, zN - 0.35, zN), '#d9dde0'], [box(2.6, 3.5, 1.5, 2.1, zN - 0.37, zN - 0.35), '#26323c']);
    k.plain.push([new THREE.CylinderGeometry(0.75, 0.75, 1.5, 12, 1, true, 0, Math.PI).rotateZ(Math.PI / 2).scale(1, 0.75, 1).translate(3.05, 2.85, zN - 0.05), BLUE]);
    const rise = 0.9, run = 5.5, ang = Math.atan2(rise, run), len = Math.hypot(rise, run);
    k.plain.push([new THREE.BoxGeometry(1.4, 0.12, len).rotateX(ang).translate(3.05, rise / 2, zN - 1.0 - run / 2), '#c4c1b9']);
    k.plain.push([box(2.35, 3.75, 0, 0.9, zN - 1.0, zN), '#c4c1b9']);
    for (const x of [2.32, 3.78]) {
      k.plain.push([new THREE.BoxGeometry(0.05, 0.05, len).rotateX(ang).translate(x, rise / 2 + 0.95, zN - 1.0 - run / 2), BLUE]);
      for (const t of [0, 0.5, 1]) k.plain.push([box(x - 0.025, x + 0.025, rise * (1 - t), rise * (1 - t) + 0.95, zN - 1.0 - run * t - 0.025, zN - 1.0 - run * t + 0.025), BLUE]);
    }
    // clipped hedges in kerbed beds before the wings (slides 49, 53, 54)
    for (const [x0, x1] of [[-11.8, -3.9], [4.2, 11.3]] as [number, number][]) {
      k.plain.push([box(x0, x1, 0, 0.15, -23.9, -22.6), '#e9e7e0'], [box(x0 + 0.15, x1 - 0.15, 0.15, 0.95, -23.75, -22.75), '#3c6a2e']);
    }
    // the Union Building: glass doors in the east notch over a block-paved forecourt, the ALUMNI BUILDING sign (owner photo)
    const xE = 12.45;
    k.glass.push(box(xE, xE + 0.04, PL, 3.0, -2.6, 1.2));
    for (const z of [-2.6, -0.7, 1.2]) k.plain.push([box(xE, xE + 0.08, PL, 3.0, z - 0.06, z + 0.06), '#2a5d9a']);
    k.signs.push({ text: 'ALUMNI BUILDING', x: xE + 0.05, y: 3.5, z: -0.7, ry: Math.PI / 2, w: 3.2, colors: ['#f4f4f0', '#1d2a3a'] });
    k.plain.push([box(xE, 23, 0, 0.12, -4.1, 2.6), '#b9b2a6']);
  },
};

// ---------- ADB and HFC (Republic Bank) (frame: the block's axes, origin at 225, 950) ----------
const adbHfc: Spec = {
  name: 'ADB and Republic Bank (HFC) block',
  axis: UAX, origin: [225, 950], storey: STOREY, style: BANK_WIN, roofColor: '#b8743e', fascia: TRIM, pitch: 0.3,
  replaces: [[238, 950], [224, 942]],
  blocks: [
    // the two red-roofed blocks the aerial shows (not in OSM), and the brown-roofed block OSM maps
    { x0: -8.3, x1: 8.9, z0: -17.6, z1: -5.0, floors: ONE, roofColor: '#c0463d' },
    { x0: -11.2, x1: 3.6, z0: -4.9, z1: 22.4, floors: ONE, roofColor: '#c54a42' },
    { x0: 9.3, x1: 18.4, z0: -16, z1: 9.3, floors: ONE },
    { x0: 5.6, x1: 15.2, z0: -2.7, z1: 22.7, floors: ONE },
  ],
  keep: [[-17, 9, -18.4, 28]],
  extras: (k) => {
    // the long red-roofed block's west front (the correction brief, slides 24-37): Republic Bank and the UG Credit Union
    // Building in one low range: white over a grey dado, the blue Republic Bank board on the roof's edge, ENTRANCE over
    // glass doors, the blue ATM pod, the UG CREDIT UNION BUILDING letters at its north end; tiled steps along the front,
    // a raised bed with a white kerb and shrubs, flagpoles and a small booth at the south end (the frame's -x is west)
    const fx = -11.2, e = eaveOf(), BLUE = '#2a8fd0';
    k.plain.push([box(fx - 0.06, fx, 0, 1.0, -4.9, 22.4), '#8f9296']);
    k.plain.push([box(fx - 0.25, fx - 0.05, e - 0.3, e + 0.9, 5.5, 12.5), BLUE]);
    k.signs.push({ text: 'Republic Bank', x: fx - 0.26, y: e + 0.3, z: 9, ry: -Math.PI / 2, w: 5.8, colors: [BLUE, '#ffffff'] });
    k.glass.push(box(fx - 0.04, fx, PL, 2.7, 7.8, 10.2));
    k.plain.push([box(fx - 0.08, fx, PL, 2.7, 8.98, 9.02), '#3a3d42'], [box(fx - 0.1, fx, 2.75, 3.15, 7.6, 10.4), '#1f3a6a']);
    k.signs.push({ text: 'ENTRANCE', x: fx - 0.11, y: 2.95, z: 9, ry: -Math.PI / 2, w: 2.2, colors: ['#1f3a6a', '#ffffff'] });
    k.plain.push([box(fx - 0.7, fx, PL, 2.6, 5.4, 6.8), '#1f8fd6'], [box(fx - 0.72, fx - 0.7, 1.3, 1.9, 5.7, 6.5), '#26323c']);
    letters(k, 'UG', fx - 0.05, 2.45, 0.2, -Math.PI / 2, 0.4, 0.06, '#c9a227');
    letters(k, 'CREDIT UNION', fx - 0.05, 1.9, 0.2, -Math.PI / 2, 0.4, 0.06, '#c9a227');
    letters(k, 'BUILDING', fx - 0.05, 1.35, 0.2, -Math.PI / 2, 0.4, 0.06, '#c9a227');
    for (let i = 0; i < 3; i++) k.plain.push([box(fx - 0.9 - i * 0.5, fx, 0, 0.6 - i * 0.2, -4.4, 21.9), '#a9583a']);
    k.plain.push([box(fx - 4.2, fx - 2.6, 0, 0.35, -2, 6.6), '#ecebe5'], [box(fx - 4.05, fx - 2.75, 0.35, 0.4, -1.85, 6.45), '#4c3a2a']);
    k.plain.push([box(fx - 4.2, fx - 2.6, 0, 0.35, 11.4, 20), '#ecebe5'], [box(fx - 4.05, fx - 2.75, 0.35, 0.4, 11.55, 19.85), '#4c3a2a']);
    for (const z of [-0.8, 1.6, 4, 12.6, 15, 17.4, 19.2]) k.plain.push([new THREE.IcosahedronGeometry(0.55, 0).scale(1, 0.8, 1).translate(fx - 3.4, 0.75, z), '#46762f']);
    for (const [z, cols] of [[24.6, ['#ce1126', '#fcd116', '#006b3f']], [25.8, [BLUE, BLUE, '#ffffff']]] as [number, string[]][]) {
      k.plain.push([new THREE.CylinderGeometry(0.05, 0.06, 7, 6).translate(fx - 5, 3.5, z), '#d8d8d8']);
      cols.forEach((c, i) => k.plain.push([box(fx - 5.02, fx - 4.98, 6.5 - i * 0.3, 6.8 - i * 0.3, z, z + 1.4), c]));
    }
    k.plain.push([box(fx - 8.4, fx - 6.4, 0, 2.4, 24, 26), '#f3f2ec'], [box(fx - 8.6, fx - 6.2, 2.4, 2.55, 23.8, 26.2), '#2f5f9a']);
    // ADB (slide 33): its own front on the east block, green columns and the adb board, not Republic Bank's colours
    k.plain.push([box(18.4, 18.5, 2.9, 3.6, -5.2, -0.8), '#f4f4f0']);
    k.signs.push({ text: 'adb', x: 18.51, y: 3.25, z: -3, ry: Math.PI / 2, w: 1.6, colors: ['#f4f4f0', '#1d7a3c'] });
    for (const z of [-5.0, -1.0]) k.plain.push([box(18.4, 18.75, 0, 2.9, z - 0.18, z + 0.18), '#1d7a3c']);
    k.glass.push(box(18.4, 18.44, PL, 2.6, -4.2, -1.8));
    // white canopies on the south side (aerial); the doors' exact places are not marked
    for (const x of [-7, 0]) {
      k.plain.push([box(x - 2, x + 2, 3.0, 3.4, 22.4, 25), WHITE]);
      for (const s of [-1, 1]) k.plain.push([box(x + s * 1.8 - 0.12, x + s * 1.8 + 0.12, 0, 3.0, 24.6, 24.9), WHITE]);
      k.glass.push(box(x - 1.3, x + 1.3, PL, 2.9, 22.4, 22.44));
    }
  },
};

// ---------- Republic Bank's forecourt and Ecobank's roadside sign (world axes) ----------
const RFO: [number, number] = [205, 962];
const rx = (x: number) => x - RFO[0], rz = (z: number) => z - RFO[1];
const frontage: Spec = {
  name: 'Republic Bank forecourt and Ecobank sign',
  axis: [1, 0], origin: RFO, storey: 3, style: BANK_WIN, roofColor: '#b8743e', fascia: TRIM, pitch: 0.3,
  blocks: [],
  keep: [[rx(194), rx(213), rz(947), rz(982)], [rx(286), rx(294), rz(1013), rz(1023)]],
  extras: (k) => {
    const pv = pavers('legon');
    // the forecourt between the road and the bank's front, block-paved, with bays painted on it (slides 25, 27, 36)
    pave(k, rx(196), rx(222), rz(947), rz(982), pv, 0.03, 2);
    pave(k, rx(193.4), rx(195.6), rz(949), rz(980), pavers('goil'), 0.035);
    for (let z = 951; z <= 975; z += 2.7) k.plain.push([box(rx(204), rx(209), 0.04, 0.05, rz(z) - 0.05, rz(z) + 0.05), '#f2f2ee']);
    for (const [z, c] of [[952.4, '#e9e9ea'], [957.8, '#2b3b5a'], [968.6, '#7a1e1e']] as [number, string][]) car(k, rx(206.5), rz(z), 'x', c);
    // the low wall of rubble stone under a pale coping along the road side, broken by steps by the sign (slides 28-30, 33)
    const wall = (z0: number, z1: number) => {
      stoneMesh(k, [[box(rx(195.6), rx(196.1), 0, 0.75, rz(z0), rz(z1)), '#ffffff']]);
      k.plain.push([box(rx(195.55), rx(196.15), 0.75, 0.85, rz(z0), rz(z1)), '#d9d4c8']);
    };
    wall(949, 966.4); wall(969.2, 980);
    for (let i = 0; i < 3; i++) k.plain.push([box(rx(195.6 - i * 0.0), rx(196.1 + i * 0.35), 0, 0.25 + i * 0.25, rz(966.5), rz(969.1)), '#c2bcb0']);
    // the tall blue roadside sign on its dark base, behind the wall (slides 28, 30)
    const sx = rx(198), sz = rz(964.6);
    k.plain.push([box(sx - 0.9, sx + 0.9, 0, 0.5, sz - 0.4, sz + 0.4), '#3a3d42']);
    k.plain.push([box(sx - 0.6, sx + 0.6, 0.5, 5.1, sz - 0.18, sz + 0.18), '#2a8fd0']);
    k.plain.push([box(sx - 0.62, sx + 0.62, 4.0, 4.9, sz - 0.2, sz + 0.2), '#f6f6f2']);
    k.signs.push({ text: 'Republic Bank', x: sx - 0.63, y: 4.45, z: sz, ry: -Math.PI / 2, w: 1.15, colors: ['#f6f6f2', '#2a8fd0'] });
    for (let y = 1.0; y < 3.8; y += 0.55) k.plain.push([box(sx - 0.62, sx + 0.62, y, y + 0.38, sz - 0.19, sz + 0.19), '#5fb3e3']);
    // Ecobank's roadside sign by the main road (slide 42): stacked teal panels on a post, beside a Norfolk pine (slides
    // 44, 46); the panels carry only what the photo shows legibly
    const ex = rx(290.5), ez = rz(1018);
    k.plain.push([box(ex - 0.12, ex + 0.12, 0, 4.6, ez - 0.12, ez + 0.12), '#2f3a44']);
    ([['Ecobank', 0.9, 1.7], ['LEGON', 0.55, 1.35], ['HOURS', 0.5, 1.2], ['24H ATM', 0.5, 1.2], ['Rapidtransfer', 0.5, 1.2]] as [string, number, number][])
      .reduce((y, [t, h, w]) => {
        k.plain.push([box(ex - 0.16, ex + 0.16, y - h, y, ez - w / 2, ez + w / 2), '#23708a']);
        k.signs.push({ text: t, x: ex - 0.17, y: y - h / 2, z: ez, ry: -Math.PI / 2, w: w * 0.92, colors: ['#23708a', '#ffffff'] });
        k.signs.push({ text: t, x: ex + 0.17, y: y - h / 2, z: ez, ry: Math.PI / 2, w: w * 0.92, colors: ['#23708a', '#ffffff'] });
        return y - h - 0.08;
      }, 4.9);
    k.plain.push([box(ex - 1.2, ex + 1.2, 0, 0.12, ez - 1.6, ez + 1.6), '#e9e7e0'], [box(ex - 1.1, ex + 1.1, 0.12, 0.5, ez - 1.5, ez + 1.5), '#3c6a2e']);
    const px = rx(284.5), pz = rz(1010.5);
    k.plain.push([new THREE.CylinderGeometry(0.12, 0.2, 9, 7).translate(px, 4.5, pz), '#5b4330']);
    for (let i = 0; i < 9; i++) {
      const y = 1.6 + i * 0.85, r = 1.9 - i * 0.18;
      k.plain.push([new THREE.CylinderGeometry(r, r * 1.05, 0.22, 8).translate(px, y, pz), '#2f5a2a']);
    }
  },
};

/** the banking square: the bank compound, the Union Building (Ecobank), the ADB / Republic Bank block and its forecourt */
export const banking = createSite('banking-square', [compound, union, adbHfc, frontage]);
