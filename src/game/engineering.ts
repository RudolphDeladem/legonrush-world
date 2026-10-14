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
import { TRIM, WHITE, box, canvas, tri2 } from './modelkit';
import { concreteTexture } from './textures';
import { PL, createSite, render, slab, tanks, window_, type Kit, type Spec, type Style } from './blocks';
import { rubble } from './concrete';
import { groundHeight } from './relief';

// ---------- facades ----------
// (the owner's SES brief, 2026-10-14: front photos, the entrance photo, the photos at the jet's fence) dark charcoal
// window frames, not white; the front block in three bays between pilasters, one wide four-pane window a bay and storey;
// the wings' long faces alternating a window and a breeze-block panel; the wings' ends a breeze-block panel a bay
const FRAME = '#2e2a27';
/** a pale breeze-block screen: square openings in a cream grid inside a plain frame */
export function breeze(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cell = 14) {
  g.fillStyle = 'rgba(120,110,95,0.35)'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  g.fillStyle = '#efe9dc'; g.fillRect(x - 2, y - 2, w + 4, h + 4);
  g.fillStyle = '#e2dac9'; g.fillRect(x, y, w, h);
  const nx = Math.max(1, Math.floor(w / cell)), ny = Math.max(1, Math.floor(h / cell)), cw = w / nx, ch = h / ny;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const px = x + i * cw + cw * 0.18, py = y + j * ch + ch * 0.18;
    g.fillStyle = '#6f6253'; g.fillRect(px, py, cw * 0.64, ch * 0.64);
    g.fillStyle = 'rgba(255,250,240,0.55)'; g.fillRect(px, py, cw * 0.64, 2);
  }
}
/** the front block: pilasters at the bay edges, a floor band, one wide dark-framed window a bay */
const ENG_FRONT: Style = {
  bay: 6.3,
  up: [[70, 78, 116, 92]],
  ground: [[70, 78, 116, 92]],
  draw: (g) => {
    render(g, '#f7f5ef');
    for (const x of [0, 240]) { g.fillStyle = '#fcfbf7'; g.fillRect(x, 0, 16, 512); g.fillStyle = 'rgba(150,145,132,0.45)'; g.fillRect(x === 0 ? 16 : 238, 0, 2, 512); }
    for (const y0 of [0, 256]) window_(g, [70, y0 + 78, 116, 92], FRAME, 4, 0);
    slab(g, 230, 26);
    g.fillStyle = 'rgba(110,100,85,0.18)'; g.fillRect(0, 490, 256, 22);
  },
};
/** the wings' long faces: a window, then a breeze-block panel */
const ENG_WIN: Style = {
  bay: 4.4,
  up: [[22, 80, 92, 92]],
  ground: [[22, 80, 92, 92]],
  draw: (g) => {
    render(g, '#f7f5ef');
    for (const y0 of [0, 256]) { window_(g, [22, y0 + 80, 92, 92], FRAME, 3, 0); breeze(g, 142, y0 + 34, 94, 178); }
    slab(g, 230, 26);
  },
};
/** the wings' ends: one breeze-block panel a bay */
const ENG_SCREEN: Style = {
  bay: 5.6,
  up: [],
  ground: [],
  draw: (g) => {
    render(g, '#f7f5ef');
    for (const y0 of [0, 256]) breeze(g, 72, y0 + 34, 112, 178);
    slab(g, 230, 26);
  },
};
/** the stair towers: breeze-block screens across their faces */
const ENG_LATTICE: Style = {
  bay: 2.4,
  up: [],
  ground: [],
  draw: (g) => {
    render(g, '#f6f4ee');
    for (const y0 of [0, 256]) breeze(g, 18, y0 + 20, 220, 206, 18);
    slab(g, 232, 24);
  },
};
let LATTICE_MAT: THREE.MeshStandardMaterial | null = null;
const latticeMat = () => (LATTICE_MAT ??= new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide, map: canvas(128, 128, (g) => { g.fillStyle = '#e2dac9'; g.fillRect(0, 0, 128, 128); breeze(g, 0, 0, 128, 128, 16); }) }));

const STOREY = 3.4, F = 4, BLACK = '#202124';

/** the Aermacchi MB-339 on its pad (the owner's SES brief: the School's report names the type; the photos at its fence
 *  and from the front lawn): a slim trainer, nose forward, tandem bubble canopy, low wings with a
 *  slight sweep and tip tanks, a swept fin with the Ghana flag; dark green over tan/gold camouflage, a pale belly and a
 *  pale nose tip; yellow jack stands under the wings. Built nose along +x, turned by `yaw`; full size (10.97 m long, 10.86 m over the tip tanks) and
 *  scaled to `s` so that it stands clear inside the mapped compound. */
function aeroplane(k: Kit, cx: number, cz: number, s: number, yaw = 0) {
  const TAN = '#b8963f', GREEN = '#34462c', BELLY = '#b9c1c4', YEL = '#e2b51a';
  const parts: [THREE.BufferGeometry, string][] = [];
  const add = (g: THREE.BufferGeometry, c: string) => parts.push([g, c]);
  const Y = 1.75;
  // the fuselage: the body, the tapered tail cone, the nose cone with its pale tip
  add(new THREE.CylinderGeometry(0.62, 0.62, 4.0, 16).rotateZ(Math.PI / 2).scale(1, 1.12, 1).translate(0.5, Y, 0), TAN);
  add(new THREE.CylinderGeometry(0.62, 0.34, 3.5, 16).rotateZ(Math.PI / 2).scale(1, 1.12, 1).translate(-3.25, Y + 0.05, 0), TAN);
  add(new THREE.ConeGeometry(0.62, 3.0, 16).rotateZ(-Math.PI / 2).scale(1, 1.12, 1).translate(4.0, Y - 0.06, 0), GREEN);
  add(new THREE.SphereGeometry(0.14, 10, 8).translate(5.48, Y - 0.06, 0), '#d5e0e8');
  add(new THREE.CircleGeometry(0.3, 12).rotateY(-Math.PI / 2).translate(-5.01, Y + 0.05, 0), '#161616');
  // the camouflage: dark green patches over the top and sides, the pale belly underneath
  for (const [x, y, z, sx, sy, sz] of [[1.6, 0.2, 0.15, 1.2, 0.5, 0.6], [-0.8, 0.22, -0.12, 1.4, 0.48, 0.62], [-2.9, 0.18, 0.1, 1.1, 0.4, 0.5], [-0.2, 0.0, 0.3, 0.9, 0.5, 0.4], [-1.9, 0.05, -0.3, 1.0, 0.45, 0.38]]) add(new THREE.SphereGeometry(1, 14, 8).scale(sx, sy, sz).translate(x, Y + y, z), GREEN);
  add(new THREE.SphereGeometry(1, 16, 8).scale(3.6, 0.32, 0.52).translate(0, Y - 0.42, 0), BELLY);
  // the tandem canopy, its frame and the side intakes
  add(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.7, 0.62, 0.5).translate(1.6, Y + 0.5, 0), '#2a3842');
  add(box(1.35, 1.45, Y + 0.5, Y + 1.12, -0.48, 0.48), '#2b2b2b');
  for (const z of [-1, 1]) add(box(-0.2, 1.0, Y - 0.15, Y + 0.25, z * 0.62 - 0.12, z * 0.62 + 0.12), '#2f3a2a');
  // the wings: low, a slight sweep, thin; tip tanks
  const wing = new THREE.Shape([[0.9, -0.5], [0.05, -5.05], [-1.3, -5.05], [-1.6, -0.5], [-1.6, 0.5], [-1.3, 5.05], [0.05, 5.05], [0.9, 0.5]].map(([x, z]) => new THREE.Vector2(x, z)));
  add(new THREE.ExtrudeGeometry(wing, { depth: 0.12, bevelEnabled: false }).rotateX(Math.PI / 2).translate(0, Y - 0.38, 0), TAN);
  for (const [x0, x1, z0, z1] of [[-1.1, -0.1, 1.6, 3.6], [-1.3, -0.3, -3.8, -2.2]]) add(box(x0, x1, Y - 0.37, Y - 0.25, z0, z1), GREEN);
  for (const z of [-1, 1]) {
    add(new THREE.CapsuleGeometry(0.3, 1.7, 4, 12).rotateZ(Math.PI / 2).translate(-0.55, Y - 0.32, z * 5.2), TAN);
    add(new THREE.SphereGeometry(0.31, 10, 6).scale(0.9, 0.5, 0.6).translate(-0.3, Y - 0.12, z * 5.2), GREEN);
  }
  // the tailplane, the swept fin and its Ghana flag (red, gold, green bands with the black star)
  const tail = new THREE.Shape([[-4.1, -0.3], [-4.75, -2.05], [-5.25, -2.05], [-5.2, -0.3], [-5.2, 0.3], [-5.25, 2.05], [-4.75, 2.05], [-4.1, 0.3]].map(([x, z]) => new THREE.Vector2(x, z)));
  add(new THREE.ExtrudeGeometry(tail, { depth: 0.08, bevelEnabled: false }).rotateX(Math.PI / 2).translate(0, Y + 0.25, 0), TAN);
  const fin = new THREE.Shape([[-3.3, 0], [-4.65, 1.55], [-5.3, 1.55], [-5.05, 0]].map(([x, y]) => new THREE.Vector2(x, y)));
  add(new THREE.ExtrudeGeometry(fin, { depth: 0.1, bevelEnabled: false }).translate(0, Y + 0.45, -0.05), GREEN);
  for (const z of [-0.056, 0.056]) {
    for (const [i, c] of [[0, '#c8261e'], [1, '#f2c400'], [2, '#1f7a3a']] as [number, string][]) add(box(-4.85, -4.3, Y + 1.6 - i * 0.14, Y + 1.74 - i * 0.14, z - 0.004, z + 0.004), c);
    add(box(-4.6, -4.54, Y + 1.43, Y + 1.49, z - 0.006, z + 0.006), '#111111');
  }
  // the undercarriage on the pad, and the yellow jack stands under the wings
  for (const [x, z] of [[3.6, 0], [-0.6, -1.25], [-0.6, 1.25]] as [number, number][]) {
    add(box(x - 0.05, x + 0.05, 0.3, Y - 0.4, z - 0.05, z + 0.05), '#3a3a3a');
    add(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12).rotateX(Math.PI / 2).translate(x, 0.3, z), '#141414');
  }
  for (const z of [-3.3, 3.3]) {
    const top = new THREE.Vector3(-0.5, Y - 0.4, z);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2, foot = new THREE.Vector3(-0.5 + Math.cos(a) * 0.55, 0, z + Math.sin(a) * 0.55), d = top.clone().sub(foot);
      const leg = new THREE.CylinderGeometry(0.035, 0.035, d.length(), 6);
      leg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()));
      add(leg.translate((top.x + foot.x) / 2, (top.y + foot.y) / 2, (top.z + foot.z) / 2), YEL);
    }
  }
  for (const [g, c] of parts) k.plain.push([g.rotateY(yaw).scale(s, s, s).translate(cx, 0.15, cz), c]);
}

/** the jet's compound fence on a low concrete kerb (the photos at its fence): chain-link on galvanised posts with their
 *  tops cranked outward, and along the front (south, toward the forecourt) green welded-mesh panels with a double gate */
function jetFence(k: Kit, x0: number, x1: number, z0: number, z1: number, h = 2.0) {
  const POST = '#9a9fa4', LINK = '#7d8388', GREENF = '#2f5d3a', KERB = '#cfccc4';
  const side = (ax: number, az: number, bx: number, bz: number, welded: boolean) => {
    const len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 2.5)), ux = (bx - ax) / len, uz = (bz - az) / len;
    const at = (t: number): [number, number] => [ax + ux * t, az + uz * t];
    const bar = (t0: number, t1: number, y0: number, y1: number, r: number, c: string) => {
      const [p0x, p0z] = at(t0), [p1x, p1z] = at(t1);
      k.plain.push([box(Math.min(p0x, p1x) - r, Math.max(p0x, p1x) + r, y0, y1, Math.min(p0z, p1z) - r, Math.max(p0z, p1z) + r), c]);
    };
    for (let i = 0; i <= n; i++) bar((len * i) / n, (len * i) / n, 0, h + 0.1, 0.05, welded ? GREENF : POST);
    const gate = welded ? [len / 2 - 1.3, len / 2 + 1.3] : null;
    for (const y of [0.5, h]) bar(0, len, y - 0.025, y + 0.025, 0.02, welded ? GREENF : POST);
    // the mesh: welded panels in narrow upright openings, the chain-link finer both ways
    const step = welded ? 0.2 : 0.12;
    for (let t = step; t < len; t += step) bar(t, t, 0.45, h, 0.008, welded ? GREENF : LINK);
    for (let y = 0.45 + (welded ? 0.5 : 0.12); y < h; y += welded ? 0.5 : 0.12) bar(0, len, y - 0.007, y + 0.007, 0.007, welded ? GREENF : LINK);
    if (gate) {
      // the gate's frame, its meeting stiles and the latch
      for (const t of [gate[0], len / 2, gate[1]]) bar(t, t, 0.45, h + 0.05, 0.035, GREENF);
      bar(gate[0], gate[1], h - 0.03, h + 0.03, 0.03, GREENF);
      const [lx, lz] = at(len / 2 + 0.12);
      k.plain.push([box(lx - 0.06, lx + 0.06, 1.05, 1.25, lz - 0.06, lz + 0.06), '#c9ccd0']);
    }
    // the kerb the fence stands on
    bar(0, len, 0, 0.45, 0.12, KERB);
  };
  side(x0, z0, x1, z0, false); side(x0, z0, x0, z1, false); side(x1, z0, x1, z1, false); side(x0, z1, x1, z1, true);
  for (const [x, z, dx, dz] of [[x0, z0, -1, -1], [x1, z0, 1, -1], [x0, z1, -1, 1], [x1, z1, 1, 1]]) {
    k.plain.push([new THREE.BoxGeometry(0.06, 0.6, 0.06).rotateZ(-dx * 0.6).rotateX(dz * 0.6).translate(x + dx * 0.15, h + 0.35, z + dz * 0.15), POST]);
  }
}

/** the paving round the school: the same concrete as the car park (the owner, on the satellite picture: "the car park and
 *  all pavement around the school are the same color as the pavement on the car park"; world.ts draws car parks in
 *  this colour and texture, 5 m a repeat in world space) */
let PAVE_MAT: THREE.MeshStandardMaterial | null = null;
function carParkPaving(k: Kit, x0: number, x1: number, z0: number, z1: number, y = 0.05) {
  PAVE_MAT ??= new THREE.MeshStandardMaterial({ color: '#b9bbbf', map: concreteTexture(), roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  const pos = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  const [ox, oz] = ORIGIN;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + ox) / 5, (pos.getZ(i) + oz) / 5);
  const m = new THREE.Mesh(g, PAVE_MAT);
  m.receiveShadow = true; m.userData.noCollide = true; k.meshes.push(m);
}
const ORIGIN: [number, number] = [453, -415];

// model frame: map axes, origin at (453, -415); z grows to the south
const engineering: Spec = {
  name: 'School of Engineering Sciences',
  axis: [1, 0], origin: ORIGIN, storey: STOREY, style: ENG_WIN, roofColor: '#c46f3c', fascia: BLACK, pitch: 0.5,
  replaces: [[476, -395]],
  blocks: [
    // front block (the entrance; pilastered bays), west, east and back blocks (window and screen bays; the wings' ends
    // screened)
    { x0: -9.3, x1: 9.5, z0: 5, z1: 28.7, floors: F, faces: { z1: ENG_FRONT, x0: ENG_FRONT, x1: ENG_FRONT } },
    { x0: -38.6, x1: -21.2, z0: -34, z1: 5, floors: F, faces: { z1: ENG_SCREEN, z0: ENG_SCREEN } },
    { x0: 20.3, x1: 38.3, z0: -34, z1: 8, floors: F, faces: { z1: ENG_SCREEN, z0: ENG_SCREEN } },
    { x0: -12.8, x1: 12.4, z0: -36.4, z1: -11, floors: F },
    // stair towers and links between the blocks, round the light well
    { x0: -21.2, x1: -9.3, z0: -8, z1: 8, floors: F, roof: 'flat', faces: { z1: ENG_LATTICE, z0: ENG_LATTICE } },
    { x0: 9.5, x1: 20.3, z0: -8, z1: 8, floors: F, roof: 'flat', faces: { z1: ENG_LATTICE, z0: ENG_LATTICE } },
    { x0: -12.8, x1: -8, z0: -11, z1: 5, floors: F, roof: 'flat', faces: { x1: ENG_LATTICE } },
    { x0: 6.6, x1: 12.4, z0: -11, z1: 5, floors: F, roof: 'flat', faces: { x0: ENG_LATTICE } },
  ],
  // the paved forecourt and the jet's compound stay clear of generated trees and tufts
  keep: [[-13, 33, 25.5, 40], [-12.5, -9.3, 5, 28.7], [16, 30, 13, 27]],
  extras: (k) => {
    const top = k.wallTop(F);
    // the towers rise a little above the eaves with parapets, black tanks on top; on the top floor of each front an
    // arched breeze-block screen in a white frame (the front photos)
    for (const [x0, x1] of [[-21.2, -9.3], [9.5, 20.3]] as [number, number][]) {
      k.plain.push([box(x0, x1, top, top + 1.6, -8, 8), WHITE]);
      k.plain.push([box(x0 - 0.1, x1 + 0.1, top + 1.6, top + 1.8, -8.1, 8.1), TRIM]);
      const xm = (x0 + x1) / 2, yb = PL + (F - 1) * STOREY, r = 1.25, yc = yb + 1.85;
      for (const x of [xm - r, xm + r]) k.plain.push([box(x - 0.13, x + 0.13, yb + 0.15, yc, 8, 8.16), TRIM]);
      k.plain.push([new THREE.TorusGeometry(r, 0.13, 6, 18, Math.PI).scale(1, 1, 0.6).translate(xm, yc, 8.08), TRIM]);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(r - 0.08, 18, 0, Math.PI).translate(xm, yc, 8.04), latticeMat());
      disc.userData.noCollide = true; k.meshes.push(disc);
      tanks(k, [[xm - 2, -2], [xm + 2, -2], [xm, 3]], top + 1.6, 0.85);
    }
    // the entrance porch (the entrance photo): square white columns, a low gable roof in maroon sheet with a pale boarded
    // soffit, the white beam with SCHOOL OF ENGINEERING SCIENCES in blue capitals, a tiled landing up two steps
    const z0 = 28.7, z1 = 35.1, x0 = -5.2, x1 = 4.6, ph = 3.6, xm = (x0 + x1) / 2;
    for (const x of [x0 + 0.3, x1 - 0.3]) for (const z of [z1 - 0.3, (z0 + z1) / 2]) k.plain.push([box(x - 0.25, x + 0.25, 0.3, ph + 0.6, z - 0.25, z + 0.25), WHITE]);
    k.plain.push([box(x0, x1, ph, ph + 0.6, z1 - 0.45, z1), WHITE]);
    for (const x of [x0, x1 - 0.3]) k.plain.push([box(x, x + 0.3, ph, ph + 0.6, z0, z1), WHITE]);
    const eave = ph + 0.6, hw = (x1 - x0) / 2 + 0.55, rise = 1.25, Z1 = z1 + 0.55, L = Math.hypot(hw, rise), ang = Math.atan2(rise, hw), D = Z1 - z0;
    for (const sd of [-1, 1]) {
      k.plain.push([new THREE.BoxGeometry(L, 0.12, D).rotateZ(-sd * ang).translate(xm + (sd * hw) / 2, eave + rise / 2 + 0.08, z0 + D / 2), '#7e2a26']);
      k.plain.push([new THREE.BoxGeometry(L, 0.04, D - 0.1).rotateZ(-sd * ang).translate(xm + (sd * hw) / 2, eave + rise / 2 - 0.02, z0 + D / 2 - 0.05), '#ece6da']);
    }
    k.signs.push({ text: 'SCHOOL OF ENGINEERING SCIENCES', x: xm, y: ph + 0.3, z: z1 + 0.01, ry: 0, w: 7.4, colors: ['#ffffff', '#1f3f8a'] });
    // the tiled landing, the steps down to the pavers, and the dark doors into the front block
    k.plain.push([box(x0, x1, 0, 0.3, z0, z1), '#d6ad86']);
    for (let i = 0; i < 2; i++) k.plain.push([box(x0 + 0.6 + i * 0.3, x1 - 0.6 - i * 0.3, 0, 0.2 - i * 0.1, z1, z1 + 0.45 + i * 0.4), '#d0a882']);
    k.glass.push(box(xm - 2, xm + 2, 0.3, 3.0, z0, z0 + 0.05));
    for (const x of [xm - 2, xm, xm + 2]) k.plain.push([box(x - 0.06, x + 0.06, 0.3, 3.0, z0, z0 + 0.08), '#2a2826']);
    k.plain.push([box(xm - 2, xm + 2, 2.94, 3.06, z0, z0 + 0.08), '#2a2826']);
    // the Aermacchi MB-339 on its pad in the compound east of the front block: the pad and the fence on the mapped
    // outline of the compound (osm, the outline the bike stops at); the jet faces the way the building faces, south,
    // nose toward the compound's gate (the owner, 2026-10-14: "the jet and the building face same direction")
    const ax0 = 17.5, ax1 = 28.5, az0 = 14.3, az1 = 25.5;
    k.plain.push([box(ax0, ax1, 0, 0.15, az0, az1), '#d3d0c8']);
    jetFence(k, ax0, ax1, az0, az1);
    aeroplane(k, (ax0 + ax1) / 2, (az0 + az1) / 2, 0.85, -Math.PI / 2);
    // the bank up to the main road south of the forecourt (owner's third reference PDF, page 67, from the ground floor):
    // faced in pitched rubble stone, paving along its foot (the car park's colour, the owner), the lawn and shrubs on
    // top; either side of the access
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
      for (const [a0, a1] of [[376, 421], [432, 500]]) k.plain.push([box(a0 - 453, a1 - 453, groundHeight(440, -373.5) - lift - 0.02, groundHeight(440, -373.5) - lift + 0.05, -374.5 + 415, -372.2 + 415), '#b9bbbf']); }
    // the forecourt and the paving round the front block and the jet's compound, in the car park's concrete (the owner's
    // satellite picture: grey all along the front, between the car park and the front block, and before the compound)
    carParkPaving(k, -13, 33, 28.7, 40);
    carParkPaving(k, 9.5, 33, 25.5, 28.7);
    carParkPaving(k, -12.5, -9.3, 5, 28.7);
    k.plain.push([box(33, 33.2, 0, 0.14, 25.5, 40), '#c4c0b6']);
  },
};

/** the School of Engineering Sciences */
export const engineeringSite = createSite('engineering', [engineering]);
