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
import * as THREE from 'three';
import { PAVE, TRIM, WHITE, box, canvas, speckle } from './modelkit';
import { BAND, OV, PL, createSite, render, ringRoof, window_, type Block, type Face, type Kit, type Spec, type Style } from './blocks';

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
function car(k: Kit, x: number, z: number, along: 'x' | 'z', color: string) {
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
    // west wing (CBG), the south-west block and its bay
    { x0: -20.9, x1: -10.7, z0: -14.7, z1: 14.8, floors: ONE, roof: 'none' },
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
    for (let z = -12.5; z <= 14; z += 4.5) {
      k.plain.push([box(-32.9, -32.6, 0, e, z - 0.15, z + 0.15), WHITE]);
      k.plain.push([box(32.6, 32.9, 0, e, z - 0.15, z + 0.15), WHITE]);
    }
    for (const x of [-30, -25, -8.5, 11.5, 26, 30]) k.plain.push([box(x - 0.15, x + 0.15, 0, e, -25.3, -25.0), WHITE]); // the gate stays open
    for (const x of [-31, -18, -7, -2, 6, 11, 27, 31]) k.plain.push([box(x - 0.15, x + 0.15, 0, e, 25.2, 25.5), WHITE]); // clear of the CBG and UMB doors
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
  axis: UAX, origin: [245.4, 1030.3], storey: STOREY, style: UNION_WIN, roofColor: '#c98a62', fascia: TRIM, pitch: 0.32,
  replaces: [[232.5, 1016.2]],
  blocks: UNION_BLOCKS,
  keep: [[-3.5, 3.9, -24, -12.4], [12.5, 24, -4.1, 2.6]],
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
    // Ecobank: its door in the north notch, between the two north wings (owner)
    const zN = -12.4;
    k.glass.push(box(-2.2, 2.2, PL, 3.0, zN - 0.04, zN));
    k.plain.push([box(-3.4, 3.8, 3.1, 3.7, zN - 2.4, zN), '#0a5aa6']);
    k.signs.push({ text: 'ECOBANK', x: 0.2, y: 3.4, z: zN - 2.41, ry: Math.PI, w: 3.2, colors: ['#0a5aa6', '#ffffff'] });
    k.plain.push([box(-3.4, 3.8, 0, 0.25, zN - 3, zN), PAVE]);
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
  keep: [[-12, 9, -18.4, 27]],
  extras: (k) => {
    // white canopies on the south side (aerial); the doors' exact places are not marked
    for (const x of [-7, 0]) {
      k.plain.push([box(x - 2, x + 2, 3.0, 3.4, 22.4, 25), WHITE]);
      for (const s of [-1, 1]) k.plain.push([box(x + s * 1.8 - 0.12, x + s * 1.8 + 0.12, 0, 3.0, 24.6, 24.9), WHITE]);
      k.glass.push(box(x - 1.3, x + 1.3, PL, 2.9, 22.4, 22.44));
    }
  },
};

/** the banking square: the bank compound, the Union Building (Ecobank) and the ADB / HFC block */
export const banking = createSite('banking-square', [compound, union, adbHfc]);
