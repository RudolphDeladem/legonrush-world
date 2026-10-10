// The small one-floor buildings along Volta Hall Road before Volta Hall, toward the CEDI Conference Centre (owner's
// second reference PDF, pages 33-40), each modelled as the photos show it rather than as the generic cottage:
//
// - the substation: weathered whitewash stained orange at its foot by the red earth, an old red clay tile hipped roof,
//   wide double doors of dark timber with louvred panels and a yellow danger sign, a small timber window, a slatted
//   vent, a meter box and a switch box on the wall; south of it a pavilion of four steel posts under a red sheet
//   pyramid roof sheltering the standby generator in its cream box (owner's photos 404 and 406). The owner's
//   corrections PDF (page 4) moved it, with its generator, to where a cottage stood, and removed the cottage and the
//   cage under the big tree;
// - the wider cottage behind, weathered white under red tiles;
// - the bus stop (the owner's corrections PDF, page 3: the footprint mapped as "Rest station" is not a building).
import * as THREE from 'three';
import { box, merge, type Part } from './modelkit';
import { BAND, PL, createSite, render, type Kit, type Spec, type Style } from './blocks';
import { concrete } from './concrete';
import { hipRoof } from './waccbip';
import { garden } from './gardens';
import { SOLIDS } from './solids';

const TILE = '#b4553a', FASCIA = '#3d2a20', ST = 3.0;
const hip = { gw: 0, tri: false };
/** whitewash weathered grey, stained orange up from its foot by the red earth splashed on it */
const WEATHERED: Style = {
  bay: 3.4, up: [], ground: [],
  draw: (g) => {
    render(g, '#efece4');
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(120,116,104,${0.04 + (i % 5) * 0.012})`; g.fillRect((i * 53) % 256, 256 + ((i * 97) % 200), 8 + (i % 4) * 6, 30 + (i % 3) * 20); }
    const gr = g.createLinearGradient(0, 512 - 120, 0, 512);
    gr.addColorStop(0, 'rgba(206,120,64,0)'); gr.addColorStop(0.55, 'rgba(206,112,58,0.55)'); gr.addColorStop(1, 'rgba(190,96,46,0.85)');
    g.fillStyle = gr; g.fillRect(0, 512 - 120, 256, 120);
  },
};
/** white, a row of small dark windows high in the wall (the washroom) */
const WASH: Style = {
  bay: 1.6, up: [], ground: [[70, 256 + 40, 110, 70]],
  draw: (g) => {
    render(g, '#f4f3ef');
    g.fillStyle = '#1e2124'; g.fillRect(70, 256 + 40, 110, 70);
    const gr = g.createLinearGradient(0, 512 - 40, 0, 512); gr.addColorStop(0, 'rgba(150,140,120,0)'); gr.addColorStop(1, 'rgba(150,130,110,0.5)');
    g.fillStyle = gr; g.fillRect(0, 512 - 40, 256, 40);
  },
};

/** a site on a world rectangle, its frame centred on it */
function small(name: string, r: [number, number, number, number], style: Style, extras: (k: Kit, f: Frame) => void, keep: [number, number, number, number][] = []): Spec {
  const O: [number, number] = [(r[0] + r[1]) / 2, (r[2] + r[3]) / 2];
  const f: Frame = {
    X: (x) => x - O[0], Z: (z) => z - O[1],
    B: (x0, x1, y0, y1, z0, z1) => box(x0 - O[0], x1 - O[0], y0, y1, z0 - O[1], z1 - O[1]),
    M: (x, z) => [x - O[0], z - O[1]],
  };
  return {
    name, axis: [1, 0], origin: O, storey: ST, style, roofColor: TILE, fascia: FASCIA, pitch: 0.45, plinth: '#c98a5c',
    replaces: [O],
    blocks: [{ x0: f.X(r[0]), x1: f.X(r[1]), z0: f.Z(r[2]), z1: f.Z(r[3]), floors: 1, roof: 'none' }],
    keep: keep.map(([x0, x1, z0, z1]) => [f.X(x0), f.X(x1), f.Z(z0), f.Z(z1)]),
    extras: (k) => {
      const c: Part[] = [];
      hipRoof(k, f.M, r[0] - 0.7, r[1] + 0.7, r[2] - 0.7, r[3] + 0.7, PL + ST + BAND, 0.45, r[1] - r[0] > r[3] - r[2] ? 'x' : 'z', [hip, hip], c, FASCIA);
      extras(k, f);
      if (c.length) { const m = new THREE.Mesh(merge(c), concrete(0.4)); m.castShadow = true; k.meshes.push(m); }
    },
  };
}
interface Frame {
  X: (x: number) => number; Z: (z: number) => number;
  B: (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => THREE.BufferGeometry;
  M: (x: number, z: number) => [number, number];
}
/** a small window in a dark timber frame on a wall facing west (x) or north/south (z) */
function win(k: Kit, f: Frame, onX: boolean, at: number, s: number, a: number, b: number, y0: number, y1: number) {
  if (onX) k.plain.push([f.B(at + s * 0.01, at + s * 0.06, y0, y1, a, b), '#3a2a20'], [f.B(at + s * 0.06, at + s * 0.07, y0 + 0.08, y1 - 0.08, a + 0.08, b - 0.08), '#20262b']);
  else k.plain.push([f.B(a, b, y0, y1, at + s * 0.01, at + s * 0.06), '#3a2a20'], [f.B(a + 0.08, b - 0.08, y0 + 0.08, y1 - 0.08, at + s * 0.06, at + s * 0.07), '#20262b']);
}

// ---------- the substation and its generator pavilion ----------
// (moved by the owner's corrections PDF, page 4, to where the cottage stood, which is gone: corrections.json)
const SUB: [number, number, number, number] = [-213.3, -205.8, -39.8, -29.0];
const substation = small('substation on Volta Hall Road', SUB, WEATHERED, (k, f) => {
  const x = SUB[0], zm = (SUB[2] + SUB[3]) / 2;
  // the double doors of dark timber, louvred panels top and foot, the danger sign
  k.plain.push([f.B(x - 0.06, x, PL, PL + 2.5, zm - 1.4, zm + 1.4), '#3b2a1f']);
  for (const [y0, y1] of [[PL + 0.15, PL + 0.6], [PL + 2.0, PL + 2.4]]) for (let y = y0; y < y1; y += 0.09) k.plain.push([f.B(x - 0.09, x - 0.06, y, y + 0.04, zm - 1.3, zm + 1.3), '#2a1d15']);
  k.plain.push([f.B(x - 0.08, x - 0.06, PL + 0.6, PL + 2.0, zm - 0.02, zm + 0.02), '#22170f'], [f.B(x - 0.1, x - 0.07, PL + 1.15, PL + 1.6, zm + 0.25, zm + 0.7), '#f3c614']);
  win(k, f, true, x, -1, SUB[2] + 1.2, SUB[2] + 1.9, PL + 1.0, PL + 2.0);
  // a slatted vent high by the door, the meter box and the switch box
  k.plain.push([f.B(x - 0.08, x, PL + 1.3, PL + 2.2, SUB[3] - 1.6, SUB[3] - 0.9), '#3a2a20']);
  for (let y = PL + 1.4; y < PL + 2.1; y += 0.16) k.plain.push([f.B(x - 0.12, x - 0.08, y, y + 0.06, SUB[3] - 1.55, SUB[3] - 0.95), '#3a2a20']);
  k.plain.push([f.B(x - 0.2, x, PL + 1.6, PL + 1.95, SUB[3] - 0.7, SUB[3] - 0.45), '#e9e9e6'], [f.B(x - 0.25, x, PL + 0.5, PL + 1.0, SUB[3] - 0.35, SUB[3] + 0.25), '#e4e5e2']);
  // the pavilion to the south: four steel posts, the red sheet pyramid roof, the generator in its cream box
  const P = [-212.4, -207.0, -27.2, -22.0], gz = (P[2] + P[3]) / 2, py = k.ground(f.X(-209.7), f.Z(gz));
  for (const px of [P[0], P[1]]) for (const pz of [P[2], P[3]]) { k.plain.push([f.B(px - 0.05, px + 0.05, py, py + 2.7, pz - 0.05, pz + 0.05), '#4a4f53']); SOLIDS.add(px, pz, 0.12); }
  k.plain.push([new THREE.ConeGeometry(Math.hypot(P[1] - P[0], P[3] - P[2]) / 2 + 0.9, 1.3, 4, 1, true).rotateY(Math.PI / 4).scale((P[1] - P[0]) / (P[3] - P[2]), 1, 1).translate(f.X((P[0] + P[1]) / 2), py + 3.3, f.Z(gz)), '#b23a32']);
  k.plain.push([f.B(P[0] - 0.6, P[1] + 0.6, py + 2.6, py + 2.68, P[2] - 0.6, P[2] - 0.5), '#2e2f31'], [f.B(P[0] - 0.6, P[1] + 0.6, py + 2.6, py + 2.68, P[3] + 0.5, P[3] + 0.6), '#2e2f31']);
  k.plain.push([f.B(-211.4, -208.0, py, py + 0.2, gz - 0.8, gz + 0.8), '#2b2c2e'], [f.B(-211.3, -208.1, py + 0.2, py + 1.75, gz - 0.75, gz + 0.75), '#e8e3d2']);
  for (let xx = -211.1; xx < -210.2; xx += 0.1) k.plain.push([f.B(xx, xx + 0.05, py + 0.4, py + 1.5, gz - 0.8, gz - 0.75), '#9b9789']);
  SOLIDS.add(-209.7, gz, 1.6);
  // the big tree behind it
  { const tx = f.X(-205.4), tz = f.Z(-44.2), ty = k.ground(tx, tz);
    k.plain.push([new THREE.CylinderGeometry(0.35, 0.6, 6, 7).translate(tx, ty + 3, tz), '#4c3d30']);
    for (const [dx, dy, dz, r] of [[0, 8, 0, 4.4], [2.6, 7.2, -1.8, 3.0], [-2.4, 7.0, 2.0, 3.2], [1.0, 9.6, 1.4, 2.6]]) k.plain.push([new THREE.IcosahedronGeometry(r, 1).scale(1, 0.72, 1).translate(tx + dx, ty + dy, tz + dz), '#2f5a24']);
    SOLIDS.add(-205.4, -44.2, 0.7); }
}, [[-213, -206, -28.5, -21]]);

// ---------- the wider cottage behind ----------
const WIDE: [number, number, number, number] = [-200.7, -184.1, -46.4, -30.6];
const wide = small('cottage behind Volta Hall Road', WIDE, WEATHERED, (k, f) => {
  for (const z of [-44, -40.5, -36.5, -33]) win(k, f, true, WIDE[0], -1, z, z + 1.0, PL + 0.9, PL + 2.1);
  for (const xx of [-198, -194.5, -190.5, -187]) win(k, f, false, WIDE[3], 1, xx, xx + 1.0, PL + 0.9, PL + 2.1);
  const zm = -38.5;
  k.plain.push([f.B(WIDE[0] - 0.1, WIDE[0], PL, PL + 2.3, zm - 0.6, zm + 0.6), '#5a3d28']);
});

// ---------- the bus stop before Volta Hall (owner's corrections PDF, page 3: not a building but a small bus station) ----------
// An open shelter on the verge of Volta Hall Road: a hipped roof of red tiles on four timber posts, a bench under it,
// boards with notices on its back, a sign on a post by the kerb.
const BS: [number, number] = [-214.4, 5.6];
const busStop: Spec = {
  name: 'bus stop before Volta Hall',
  axis: [1, 0], origin: BS, storey: 3, style: WASH, roofColor: '#b0503a', fascia: FASCIA, pitch: 0.45,
  onGround: true,
  blocks: [],
  keep: [[-3, 3, -5, 5]],
  extras: (k) => {
    const y = k.ground(0, 0), c: Part[] = [];
    const X0 = -1.4, X1 = 1.4, Z0 = -3.2, Z1 = 3.2, h = 2.5;
    c.push([box(X0 - 0.3, X1 + 0.3, y - 0.1, y + 0.15, Z0 - 0.3, Z1 + 0.3), '#cfc9bc']);
    for (const px of [X0, X1]) for (const pz of [Z0, Z1]) { c.push([box(px - 0.1, px + 0.1, y, y + h, pz - 0.1, pz + 0.1), '#6b4a30']); SOLIDS.add(...k.world(px, pz), 0.15); }
    c.push([box(X0 - 0.15, X1 + 0.15, y + h - 0.2, y + h, Z0 - 0.15, Z1 + 0.15), '#5a3d28']);
    hipRoof(k, (x, z) => [x, z], X0 - 0.7, X1 + 0.7, Z0 - 0.7, Z1 + 0.7, y + h, 0.5, 'z', [hip, hip], c, FASCIA);
    // the back screen of boards with notices, the bench
    // (its open side to the road on the west, the screen at its back)
    k.plain.push([box(X1 - 0.05, X1 + 0.05, y + 0.6, y + 2.1, Z0 + 0.3, Z1 - 0.3), '#7a5a3e']);
    const cols = ['#e9e4d8', '#1f4fa8', '#d8362c', '#f2c400', '#2f9e5a'];
    for (let i = 0; i < 7; i++) k.plain.push([box(X1 - 0.07, X1 - 0.05, y + 1.0 + (i % 2) * 0.5, y + 1.4 + (i % 2) * 0.5, Z0 + 0.6 + i * 0.75, Z0 + 1.1 + i * 0.75), cols[i % cols.length]]);
    k.plain.push([box(X1 - 0.65, X1 - 0.2, y + 0.45, y + 0.52, Z0 + 0.4, Z1 - 0.4), '#8a6a4a']);
    for (const z of [Z0 + 0.6, 0, Z1 - 0.6]) k.plain.push([box(X1 - 0.46, X1 - 0.38, y, y + 0.45, z - 0.04, z + 0.04), '#3a3a3a']);
    // the bus-stop sign on a post toward the road
    k.plain.push([box(X0 - 1.28, X0 - 1.2, y, y + 2.8, Z1 + 0.6, Z1 + 0.68), '#9aa0a5'], [box(X0 - 1.5, X0 - 1.0, y + 2.2, y + 2.7, Z1 + 0.68, Z1 + 0.71), '#1f5fa8']);
    k.signs.push({ text: 'BUS STOP', x: X0 - 1.25, y: y + 2.45, z: Z1 + 0.72, ry: 0, w: 0.45, colors: ['#1f5fa8', '#ffffff'] });
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; k.meshes.push(m);
  },
};

// ---------- the Fidelity Bank ATM below the French Department, on the footway of Danquah Avenue ----------
// (owner's second reference PDF, pages 40-43) The enclosure stands on a tiled plinth before the west wing's south end:
// two orange pillars and a white panel round the grey machine, the deep orange canopy over them with ATM | FIDELITY BANK
// on dark bands. The footway is paved in grey blocks all the way from the stone wall under the French Department to
// the kerb (no strip of grass), a concrete platform with steps and a ramp running down along the wall, a drain of
// steel grates along the kerb, a yellow and black barrier at the road.
const FO: [number, number] = [-185, 110.5];
const fidelity: Spec = {
  name: 'Fidelity Bank ATM (Danquah Avenue)',
  axis: [1, 0], origin: FO, storey: 3, style: WASH, roofColor: TILE, fascia: FASCIA, pitch: 0.4,
  onGround: true,
  blocks: [],
  keep: [[-198 - FO[0], -150 - FO[0], 108.2 - FO[1], 113.2 - FO[1]]],
  extras: (k) => {
    const X = (x: number) => x - FO[0], Z = (z: number) => z - FO[1];
    const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
    const c: Part[] = [];
    // the paving, the herringbone of grey blocks suggested by a few darker courses
    k.plain.push([B(-198, -150, 0.01, 0.06, 108.3, 112.75), '#8f8d88']);
    for (let x = -197.6; x < -150; x += 1.2) k.plain.push([B(x, x + 0.05, 0.06, 0.065, 108.3, 112.75), '#7b7975']);
    // the concrete platform against the wall, its steps down to the footway and the ramp down along the wall
    c.push([B(-181.6, -177.6, 0, 0.95, 108.3, 110.0), '#d4d0c6']);
    for (let i = 0; i < 3; i++) c.push([B(-181.2, -178.0, 0, 0.95 - 0.32 * (i + 1) + 0.32, 110.0, 110.0 + 0.32 * (i + 1)), '#cdc9be']);
    { const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([X(-187.0), 0.06, Z(108.3), X(-181.6), 0.95, Z(108.3), X(-181.6), 0.95, Z(109.5), X(-187.0), 0.06, Z(109.5)], 3));
      g.setIndex([0, 2, 1, 0, 3, 2]); g.computeVertexNormals(); c.push([g, '#d4d0c6']);
      const side = new THREE.BufferGeometry();
      side.setAttribute('position', new THREE.Float32BufferAttribute([X(-187.0), 0.0, Z(109.5), X(-181.6), 0.0, Z(109.5), X(-181.6), 0.95, Z(109.5)], 3));
      side.setIndex([0, 1, 2, 0, 2, 1]); side.computeVertexNormals(); c.push([side, '#c9c5ba']); }
    k.plain.push([B(-184.2, -184.1, 0.06, 1.2, 109.0, 109.1), '#a4a7aa']);
    for (const x of [-181.4, -180.4, -179.4, -178.4]) SOLIDS.add(x, 109.2, 0.6);
    // the drain of steel grates along the kerb
    for (let x = -192; x < -151; x += 1.25) k.plain.push([B(x, x + 1.15, 0.01, 0.05, 112.8, 113.3), '#3a2e26']);
    // the yellow and black barrier at the road
    for (const x of [-196.5, -193.5]) k.plain.push([B(x - 0.04, x + 0.04, 0, 1.05, 113.45, 113.53), '#1a1a1a']);
    for (const y of [0.45, 0.95]) for (let x = -196.5; x < -193.5; x += 0.5) k.plain.push([B(x, x + 0.5, y, y + 0.07, 113.45, 113.53), ((x + 196.5) / 0.5) & 1 ? '#1a1a1a' : '#e8b416']);
    SOLIDS.add(-195, 113.5, 0.3);
    // the ATM enclosure on its plinth, facing the road
    const A = [-192.4, -189.6, 108.7, 110.5], top = 3.05;
    k.plain.push([B(A[0] - 0.3, A[1] + 0.3, 0, 0.32, A[2] - 0.2, A[3] + 0.6), '#d9d6cf'], [B(A[0] - 0.3, A[1] + 0.3, 0.32, 0.36, A[2] - 0.2, A[3] + 0.6), '#bfbcb5']);
    c.push([B(A[0], A[0] + 0.75, 0.36, top - 0.55, A[2] + 0.35, A[3]), '#e2621f'], [B(A[1] - 0.75, A[1], 0.36, top - 0.55, A[2] + 0.35, A[3]), '#e2621f']);
    c.push([B(A[0] - 0.12, A[0], 0.36, top - 0.55, A[2], A[3]), '#efefec'], [B(A[0], A[1], 0.36, top - 0.55, A[2], A[2] + 0.35), '#d9561a']);
    c.push([B(A[0] - 0.3, A[1] + 0.3, top - 0.55, top, A[2] - 0.2, A[3] + 0.45), '#e2621f']);
    k.plain.push([B(A[0] + 0.75, A[1] - 0.75, 0.36, 2.0, A[2] + 0.35, A[2] + 0.85), '#5b5f63'], [B(A[0] + 0.85, A[1] - 0.85, 1.2, 1.7, A[2] + 0.85, A[2] + 0.88), '#8c9196'], [B(A[0] + 0.95, A[1] - 0.95, 1.3, 1.6, A[2] + 0.88, A[2] + 0.9), '#2d4f6e']);
    k.plain.push([B(A[0] + 0.75, A[1] - 0.75, 2.0, 2.45, A[2] + 0.35, A[2] + 0.4), '#2a2a2c']);
    k.plain.push([B(A[0] - 0.1, A[1] + 0.1, top - 0.45, top - 0.1, A[3] + 0.45, A[3] + 0.48), '#2c2c2e']);
    k.signs.push({ text: 'ATM  FIDELITY BANK', x: X((A[0] + A[1]) / 2), y: top - 0.27, z: Z(A[3] + 0.49), ry: 0, w: 2.6, colors: ['#2c2c2e', '#ffffff'] });
    k.plain.push([B(A[0] - 0.33, A[0] - 0.3, top - 0.45, top - 0.1, A[2], A[3] + 0.3), '#2c2c2e']);
    k.signs.push({ text: 'ATM  FIDELITY BANK', x: X(A[0] - 0.34), y: top - 0.27, z: Z((A[2] + A[3]) / 2 + 0.15), ry: -Math.PI / 2, w: 1.9, colors: ['#2c2c2e', '#ffffff'] });
    for (const x of [A[0] + 0.37, A[1] - 0.37]) k.plain.push([B(x - 0.2, x + 0.2, 1.1, 2.0, A[3] + 0.001, A[3] + 0.02), '#2c2c2e']);
    SOLIDS.add(-191, 109.6, 1.5);
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

// ---------- BESTIES, the restaurant before Legon Hall, across Dr. J.B. Danquah Avenue from the Fidelity ATM ----------
// (owner's second reference PDF, pages 44-45, placed by the owner's corrections PDF, page 7: not at Volta Hall) One
// floor: white walls over a red foot, a glazed door and windows with the menus in them toward the avenue, a deep dark
// grey fascia with BESTIES in red bulb letters; a forecourt of bare red earth with a menu board and an old tree stump,
// and at its drive a black lift barrier with a yellow-banded pole and a red STOP sign.
const BE = [-196.0, -186.0, 141.5, 148.0];
const BO: [number, number] = [-191, 144.75];
const W_BESTIES: Style = {
  bay: 2.6, up: [], ground: [[60, 256 + 50, 136, 150]],
  draw: (g) => {
    render(g, '#f5f4f0');
    g.fillStyle = '#26292c'; g.fillRect(56, 256 + 46, 144, 158);
    const gl = g.createLinearGradient(0, 256 + 50, 0, 256 + 200); gl.addColorStop(0, '#5d6a73'); gl.addColorStop(1, '#2a3238');
    g.fillStyle = gl; g.fillRect(60, 256 + 50, 136, 150);
    g.fillStyle = '#e9d9b8'; g.fillRect(70, 256 + 70, 40, 60);
    g.fillStyle = '#a3302a'; g.fillRect(0, 512 - 40, 256, 40);
  },
};
const W_BESTIES_SIDE: Style = { bay: 3, up: [], ground: [], draw: (g) => { render(g, '#f5f4f0'); g.fillStyle = '#a3302a'; g.fillRect(0, 512 - 40, 256, 40); } };
const besties: Spec = {
  name: 'BESTIES restaurant',
  axis: [1, 0], origin: BO, storey: 3.0, style: W_BESTIES_SIDE, roofColor: '#5a5d60', fascia: '#3b3e42', pitch: 0.1,
  blocks: [{ x0: BE[0] - BO[0], x1: BE[1] - BO[0], z0: BE[2] - BO[1], z1: BE[3] - BO[1], floors: 1, roof: 'flat', faces: { z0: W_BESTIES } }],
  keep: [[-199 - BO[0], -183 - BO[0], 139.5 - BO[1], 150.5 - BO[1]]],
  extras: (k) => {
    const X = (x: number) => x - BO[0], Z = (z: number) => z - BO[1];
    const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
    const e = PL + 3.0 + BAND, zf = BE[2];
    // the dark fascia round the top, its name in red bulb letters toward the avenue
    k.plain.push([B(BE[0] - 0.2, BE[1] + 0.2, e - 0.6, e + 0.9, zf - 0.25, BE[3] + 0.2), '#3b3e42']);
    k.signs.push({ text: 'BESTIES', x: X(-191), y: e + 0.15, z: Z(zf - 0.26), ry: Math.PI, w: 3.4, colors: ['#3b3e42', '#e0262c'] });
    // the glazed door with its menus, the step
    k.plain.push([B(-191.9, -190.1, PL, PL + 2.3, zf - 0.05, zf), '#24272a'], [B(-191.8, -190.2, PL + 0.1, PL + 2.2, zf - 0.06, zf - 0.05), '#6e8090'], [B(-191.6, -191.1, PL + 0.8, PL + 1.5, zf - 0.07, zf - 0.06), '#f2e2c0']);
    k.plain.push([B(-192.2, -189.8, 0, PL, zf - 1.2, zf), '#c4beb2']);
    // the forecourt of red earth to the avenue's footway, the menu board and the stump
    k.plain.push([B(-198, -184, 0.005, 0.03, 139.6, zf - 1.2), '#b4683f']);
    { const mx = X(-194.5), mz = Z(140.6);
      for (const sgn of [-1, 1]) k.plain.push([new THREE.BoxGeometry(0.9, 1.3, 0.04).rotateX(sgn * 0.18).translate(mx, 0.62, mz + sgn * 0.12), sgn < 0 ? '#e8e6e0' : '#d7d3cb']);
      k.plain.push([B(-194.85, -194.15, 0.6, 1.1, 140.43, 140.45), '#9a3b22']);
      k.signs.push({ text: 'BURGER', x: mx, y: 0.95, z: mz - 0.26, ry: Math.PI, w: 0.6, colors: ['#ffffff', '#1b1b1b'] });
      SOLIDS.add(-194.5, 140.6, 0.5); }
    k.plain.push([new THREE.CylinderGeometry(0.55, 0.7, 0.55, 9).translate(X(-198.5), 0.27, Z(146)), '#d8d2c4']);
    SOLIDS.add(-198.5, 146, 0.7);
    // the lift barrier across the drive by its east side: a black post, the pole banded yellow and black, the STOP sign
    const px = -184.2, pz = 140.3, len = 5.0;
    k.plain.push([B(px - 0.12, px + 0.12, 0, 1.15, pz - 0.12, pz + 0.12), '#1b1b1b'], [B(px - 0.35, px + 0.35, 0, 0.3, pz - 0.3, pz + 0.3), '#cfcac0']);
    for (let i = 0; i < 8; i++) k.plain.push([B(px - 0.05, px + 0.05, 0.95, 1.05, pz + 0.2 + (i * len) / 8, pz + 0.2 + ((i + 1) * len) / 8), i & 1 ? '#1b1b1b' : '#e8b416']);
    for (let i = 1; i < 5; i++) k.plain.push([B(px - 0.03, px + 0.03, 0.2, 0.95, pz + i, pz + i + 0.05), '#1b1b1b']);
    k.plain.push([B(px - 0.04, px + 0.04, 0.2, 0.25, pz + 0.2, pz + len), '#1b1b1b'], [B(px - 0.08, px + 0.08, 0, 1.0, pz + len + 0.2, pz + len + 0.36), '#1b1b1b']);
    k.plain.push([new THREE.CylinderGeometry(0.42, 0.42, 0.03, 8).rotateZ(Math.PI / 2).rotateX(Math.PI / 8).translate(X(px + 0.06), 1.0, Z(pz + 1.6)), '#c8201f']);
    k.signs.push({ text: 'STOP', x: X(px + 0.09), y: 1.0, z: Z(pz + 1.6), ry: Math.PI / 2, w: 0.55, colors: ['#c8201f', '#ffffff'] });
    for (let z = pz; z <= pz + len; z += 1.0) SOLIDS.add(px, z, 0.15);
  },
};

/** the small buildings along Volta Hall Road before Volta Hall */
export const voltaFrontSite = createSite('volta-front', [substation, wide, busStop, fidelity, besties]);
