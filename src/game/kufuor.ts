// Behind Old Pent, from the owner's third reference PDF (pages 59-66; block engine: blocks.ts):
//
// - The Kufuor Centre for Leadership and Governance, abandoned unfinished: a bare concrete frame of three floors on
//   round columns, open between them, its front toward Annie Jiagge Road curved in tiers of round slab edges, the
//   top under a dark sheet roof edge; a few walls of grey blockwork filled in at the back with small window holes.
//   Beside it the round drum of the gate house, rendered but unpainted, under a deep conical roof of brown tiles.
//   Inside, red earth with heaps and scattered paving blocks. (Its sheet fence and rusted gate: hoarding below.)
// - Along Annie Jiagge Road from the Kufuor Centre south to the Pent entrance, the footway runs beside a long
//   hoarding of corrugated aluminium sheets plastered with posters (page 66).
// - The building behind Old Pent (the Y-shaped one behind Addis Ababa and Dar es Salaam, pages 57-60): four storeys
//   painted yellow under red roofs; on its west wing's end round balconies one over another and a black spiral stair
//   beside them; a rendered wall round its grounds. Its walls are painted by the generic builder (behindPentStyle);
//   this module adds the end with its balconies and stair, and the wall.
import * as THREE from 'three';
import type { Building } from './campusmap';
import { box, merge, type Part } from './modelkit';
import { createSite, type Spec } from './blocks';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { pentFenceX } from './pentagon';

const RAW = '#a9a59c', RAW2 = '#9a968c', BLOCKWORK = '#8f8b82';

/** corrugated sheet as a canvas texture: vertical ribs, streaks of rust, and posters on it */
let sheetMat: THREE.MeshStandardMaterial | null = null;
function sheets() {
  if (sheetMat) return sheetMat;
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const g = c.getContext('2d')!;
  for (let x = 0; x < 512; x += 8) { g.fillStyle = (x / 8) % 2 ? '#a9aeb2' : '#c8cdd0'; g.fillRect(x, 0, 8, 128); }
  let s = 5;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(140,80,40,${0.15 + r() * 0.25})`; g.fillRect(r() * 512, r() * 60, 6 + r() * 20, 30 + r() * 70); }
  const cols = ['#1f4fa8', '#e9e4d8', '#c8261e', '#2f9e5a', '#f2c400', '#1b1b1b', '#7a3fb0'];
  for (let i = 0; i < 16; i++) {
    const x = r() * 480, y = 20 + r() * 60, w = 18 + r() * 14, h = 24 + r() * 14;
    g.fillStyle = cols[(r() * cols.length) | 0]; g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(x + 3, y + 4, w - 6, 3); g.fillRect(x + 3, y + h - 8, w - 6, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  sheetMat = new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.3 });
  return sheetMat;
}

// ---------- the Kufuor Centre (frame: map axes) ----------
const KO: [number, number] = [548, -380];
/** the gate house, and the rusted gate in the roadside sheets north of it (z from, to) */
const GH: [number, number] = [519.2, -392.2], GATE: [number, number] = [-401.4, -395.6];
const kufuor: Spec = {
  name: 'The Kufuor Centre For Leadership and Governance',
  axis: [1, 0], origin: KO, storey: 3.5, style: { bay: 3, up: [], ground: [], draw: (g) => { g.fillStyle = RAW; g.fillRect(0, 0, 256, 512); } }, roofColor: '#3a3532', fascia: '#2a2624', pitch: 0.2,
  onGround: true,
  replaces: [[549, -384]],
  blocks: [],
  keep: [[527 - KO[0], 568 - KO[0], -398 - KO[1], -362 - KO[1]]],
  extras: (k) => {
    const X = (x: number) => x - KO[0], Z = (z: number) => z - KO[1];
    const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
    const y0 = k.ground(0, 0), c: Part[] = [];
    const F = [0, 3.6, 7.2, 10.8];
    // the main frame: the floor slabs over the footprint's body, columns on a 4 m grid, open between
    for (const f of F.slice(1)) c.push([B(540.5, 557, y0 + f - 0.3, y0 + f, -387.8, -373), RAW]);
    for (let x = 541; x <= 556.6; x += 3.9) for (let z = -387.4; z <= -373.4; z += 3.5) c.push([new THREE.CylinderGeometry(0.22, 0.22, F[3], 10).translate(X(x), y0 + F[3] / 2, Z(z)), RAW2]);
    // the curved front toward the road (west): tiers of round slab edges on columns, a half drum at each floor
    for (const [i, f] of F.slice(1).entries()) {
      const r = 6.2 - i * 0.6;
      c.push([new THREE.CylinderGeometry(r, r, 0.45, 28, 1, false, Math.PI, Math.PI).translate(X(540.5), y0 + f - 0.2, Z(-380.5)), RAW]);
      for (let a = Math.PI * 1.1; a < Math.PI * 1.95; a += Math.PI * 0.2) c.push([new THREE.CylinderGeometry(0.2, 0.2, f - 0.4, 8).translate(X(540.5) + Math.sin(a) * (r - 0.4), y0 + (f - 0.4) / 2, Z(-380.5) + Math.cos(a) * (r - 0.4)), RAW2]);
    }
    // the top: a dark sheet roof edge over the curved front, flat over the body
    c.push([new THREE.CylinderGeometry(5.2, 5.4, 0.35, 28, 1, false, Math.PI, Math.PI).translate(X(540.5), y0 + F[3] + 1.6, Z(-380.5)), '#3a3532']);
    c.push([B(540.5, 557, y0 + F[3] + 1.45, y0 + F[3] + 1.75, -387.8, -373), '#3a3532']);
    for (let x = 542; x < 556; x += 3.9) c.push([B(x - 0.15, x + 0.15, y0 + F[3], y0 + F[3] + 1.5, -387.4, -387.1), RAW2], [B(x - 0.15, x + 0.15, y0 + F[3], y0 + F[3] + 1.5, -373.7, -373.4), RAW2]);
    // blockwork filled in along the back (east) and part of the north, with small window holes
    for (const f of F.slice(0, 3)) {
      c.push([B(556.6, 557.0, y0 + f, y0 + f + 3.3, -387.6, -373.2), BLOCKWORK]);
      c.push([B(548, 556.6, y0 + f, y0 + f + 3.3, -373.4, -373.0), BLOCKWORK]);
      for (let z = -386; z < -374; z += 3) k.plain.push([B(557.0, 557.05, y0 + f + 1.4, y0 + f + 2.2, z, z + 0.9), '#2a2826']);
      for (let x = 549; x < 556; x += 3) k.plain.push([B(x, x + 0.9, y0 + f + 1.4, y0 + f + 2.2, -373.0, -372.95), '#2a2826']);
    }
    // stair cores rising through the frame
    c.push([B(552.5, 556.6, y0, y0 + F[3] + 1.5, -387.6, -384.4), BLOCKWORK]);
    // the round gate house on the roadside line, the gate beside it to the north (the owner's second Pent corrections,
    // page 1: the blue mark): a drum under a conical roof of brown tiles, the door on the gate side
    { const gx = X(GH[0]), gz = Z(GH[1]);
      c.push([new THREE.CylinderGeometry(3.0, 3.0, 3.0, 24).translate(gx, y0 + 1.5, gz), '#c9c3b6']);
      c.push([new THREE.CylinderGeometry(3.4, 3.4, 2.6, 24).translate(gx, y0 + 4.3, gz), '#bfb9ac']);
      k.plain.push([new THREE.ConeGeometry(4.8, 2.4, 24).translate(gx, y0 + 6.8, gz), '#5b3a2c'], [new THREE.CylinderGeometry(4.8, 4.8, 0.2, 24, 1, true).translate(gx, y0 + 5.62, gz), '#f1efe8']);
      k.plain.push([box(gx - 0.7, gx + 0.7, y0, y0 + 2.4, gz - 3.05, gz - 2.98), '#2a2624']);
      SOLIDS.add(GH[0], GH[1], 3.2); }
    for (const [x, z] of [[541, -381], [549, -381], [556, -381], [549, -375], [549, -387]]) SOLIDS.add(x, z, 3.0);
    // the ground inside: red earth, heaps of paving blocks
    k.plain.push([B(528, 566, y0 + 0.005, y0 + 0.03, -397, -364), '#a4583a']);
    for (const [x, z, n] of [[531.5, -386, 18], [544, -393.5, 12], [560, -370, 10]] as [number, number, number][]) {
      for (let i = 0; i < n; i++) { const dx = ((i * 37) % 13) / 5 - 1.3, dz = ((i * 53) % 11) / 5 - 1.1, h = ((i * 7) % 4) * 0.1; k.plain.push([B(x + dx, x + dx + 0.22, y0 + h, y0 + h + 0.1, z + dz, z + dz + 0.11), '#c2b49c']); }
      k.plain.push([B(x - 1.2, x + 1.2, y0, y0 + 0.6, z - 0.6, z + 0.6), '#b9ab93']);
    }
    const m = new THREE.Mesh(merge(c), concrete(0.9)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

// ---------- the sheet fence round the Kufuor Centre's ground (the owner's second Pent corrections, page 1: the red line;
// the sheets that boxed the centre in on its other sides are gone) ----------
// Along Annie Jiagge Road from the corner behind Old Pent south past the gate house, the long hoarding of corrugated
// aluminium sheets plastered with posters, the rusted gate of slats in it just north of the gate house with the curved
// paved apron before it on the footway (page 8); at the south end it turns east along the ground's south side to the
// small building there.
const HO: [number, number] = [518, -420];
const hoarding: Spec = {
  name: 'hoarding along Annie Jiagge Road',
  axis: [1, 0], origin: HO, storey: 3, style: kufuor.style, roofColor: '#3a3532', fascia: '#2a2624', pitch: 0.2,
  onGround: true,
  blocks: [],
  keep: [[513 - HO[0], 527 - HO[0], -466 - HO[1], -360 - HO[1]], [513 - HO[0], 584 - HO[0], -364 - HO[1], -359 - HO[1]]],
  extras: (k) => {
    const X = (x: number) => x - HO[0], Z = (z: number) => z - HO[1];
    /** the sheets from a to b (world), in panels that lean and buckle a little from one to the next, as in the photo */
    const sheetRun = (ax: number, az: number, bx: number, bz: number) => {
      const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2.4));
      for (let i = 0; i < n; i++) {
        const xa = ax + ((bx - ax) * i) / n, za = az + ((bz - az) * i) / n, xb = ax + ((bx - ax) * (i + 1)) / n, zb = az + ((bz - az) * (i + 1)) / n;
        const y = k.ground(X(xa), Z(za)), len = L / n, geo = new THREE.PlaneGeometry(len, 2.4);
        const uv = geo.attributes.uv as THREE.BufferAttribute;
        const off = ((((xa + za) * 7) % 5) + 5) % 5 / 5;
        for (let j = 0; j < uv.count; j++) uv.setX(j, off + (uv.getX(j) * len) / 12);
        const m = new THREE.Mesh(geo, sheets());
        m.position.set(X((xa + xb) / 2), y + 1.2, Z((za + zb) / 2));
        m.rotation.y = -Math.atan2(zb - za, xb - xa); m.rotation.z = ((((xa * 5 + za * 13) | 0) % 3) - 1) * 0.03;
        m.castShadow = true;
        k.meshes.push(m);
        k.plain.push([box(X(xa) - 0.05, X(xa) + 0.05, y, y + 2.45, Z(za) - 0.05, Z(za) + 0.05), '#6c6c66']);
        SOLIDS.add(xa, za, 0.2); SOLIDS.add((xa + xb) / 2, (za + zb) / 2, 0.2);
      }
    };
    const F = pentFenceX, SOUTH = -362, ghN = GH[1] - 3.4, ghS = GH[1] + 3.4;
    sheetRun(F(-466), -466, F(GATE[0]), GATE[0]);
    sheetRun(F(ghS), ghS, F(SOUTH), SOUTH);
    sheetRun(F(SOUTH), SOUTH, 583, SOUTH);
    // the rusted gate between the sheets and the gate house: slats in a steel frame, rust streaked
    { const x = F(-398), y = k.ground(X(x), Z(-398));
      k.plain.push([box(X(x) - 0.1, X(x) + 0.1, y, y + 2.6, Z(GATE[0]), Z(GATE[0]) + 0.12), '#3a3a38'], [box(X(x) - 0.1, X(x) + 0.1, y, y + 2.6, Z(GATE[1]) - 0.12, Z(GATE[1])), '#3a3a38']);
      k.plain.push([box(X(x) - 0.06, X(x) + 0.06, y + 2.4, y + 2.5, Z(GATE[0]), Z(GATE[1])), '#4a3a30'], [box(X(x) - 0.06, X(x) + 0.06, y + 0.12, y + 0.2, Z(GATE[0]), Z(GATE[1])), '#4a3a30']);
      for (const z of [GATE[0] + 1.45, GATE[0] + 2.9, GATE[0] + 4.35]) k.plain.push([box(X(x) - 0.07, X(x) + 0.07, y + 0.12, y + 2.5, Z(z) - 0.04, Z(z) + 0.04), '#4a3a30']);
      for (let z = GATE[0] + 0.15; z < GATE[1] - 0.1; z += 0.2) k.plain.push([box(X(x) - 0.05, X(x) + 0.05, y + 0.22, y + 2.38, Z(z), Z(z) + 0.14), (((z * 10) | 0) % 3) ? '#7a4a32' : '#8a5236']);
      for (let z = GATE[0]; z < GATE[1]; z += 0.6) SOLIDS.add(x, z, 0.2);
      const g = new THREE.RingGeometry(1.5, 6.5, 20, 1, Math.PI * 0.5, Math.PI).rotateX(-Math.PI / 2).translate(X(x), y + 0.03, Z((GATE[0] + GATE[1]) / 2));
      k.plain.push([g, '#8f8a82']); }
  },
};

// ---------- the building behind Old Pent: the end with the round balconies and the spiral stair ----------
// The owner's second Pent corrections (pages 1-4): they are on the end of the west wing, toward Annie Jiagge Road (the
// white arrows on the top view), not on the east end. Frame: x out of that end wall (which runs on a slant), z along it.
const YO: [number, number] = [550.2, -467.3];
/** the yellow building's footprint (the Y behind Addis Ababa and Dar es Salaam) */
const isBehindPent = (b: Building) => b.minX > 546 && b.maxX < 599 && b.minZ > -475 && b.maxZ < -428 && b.maxX - b.minX > 40;
export const behindPentStyle = (b: Building) => (isBehindPent(b) ? { wall: '#ecd48a', roof: '#b4472f' } : undefined);
const yellow: Spec = {
  name: 'building behind Old Pent (west end)',
  axis: [-0.928, -0.371], origin: YO, storey: 3.3, style: kufuor.style, roofColor: '#b4472f', fascia: '#3a2a22', pitch: 0.4,
  onGround: true,
  blocks: [],
  keep: [[-2, 6, -6, 6]],
  extras: (k) => {
    const y0 = k.ground(0, 0), c: Part[] = [];
    // the round balconies, one to a floor, with steel railings; a dark door to each
    for (let f = 1; f < 4; f++) {
      const y = y0 + f * 3.3 + 0.4;
      c.push([new THREE.CylinderGeometry(1.5, 1.5, 0.3, 20, 1, false, 0, Math.PI).translate(0, y, 0), '#ecd48a']);
      c.push([new THREE.CylinderGeometry(1.5, 1.5, 0.75, 20, 1, true, 0, Math.PI).translate(0, y + 0.5, 0), '#ecd48a']);
      k.plain.push([box(0.0, 0.06, y + 0.15, y + 2.3, -0.6, 0.6), '#3a2a22']);
      k.plain.push([new THREE.TorusGeometry(1.5, 0.03, 4, 20, Math.PI).rotateX(-Math.PI / 2).rotateY(-Math.PI / 2).translate(0, y + 1.0, 0), '#3a2a22']);
    }
    // the spiral stair beside them: a black column, its treads winding up, a rail
    const sx = 2.2, sz = -2.4;
    k.plain.push([new THREE.CylinderGeometry(0.08, 0.08, 4 * 3.3, 8).translate(sx, y0 + 2 * 3.3, sz), '#1b1b1b']);
    for (let i = 0; i < 64; i++) {
      const a = i * 0.45, y = y0 + 0.2 + i * 0.2;
      k.plain.push([new THREE.BoxGeometry(0.9, 0.05, 0.3).translate(0.45, 0, 0).rotateY(a).translate(sx, y, sz), '#2a1d18']);
      k.plain.push([new THREE.BoxGeometry(0.02, 0.9, 0.02).translate(0.9, 0.45, 0).rotateY(a).translate(sx, y, sz), '#2a1d18']);
    }
    SOLIDS.add(...k.world(sx, sz), 1.0);
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; k.meshes.push(m);
  },
};

// ---------- the wall round the yellow building's grounds (the owner's second Pent corrections, pages 5-7) ----------
// Cream render over a grey foot under a coping, round the building and its car park east of it; on the north the drive
// from behind Old Pent comes in through an opening (Pent's metal fence runs along outside it: pentagon.ts).
const WO: [number, number] = [585, -453];
const YARD = [543, 628, -480, -426], DRIVE = [619, 628];
const yardWall: Spec = {
  name: 'wall round the grounds of the building behind Old Pent',
  axis: [1, 0], origin: WO, storey: 3, style: kufuor.style, roofColor: '#888', fascia: '#888', pitch: 0.1,
  onGround: true,
  blocks: [],
  keep: [],
  extras: (k) => {
    const X = (x: number) => x - WO[0], Z = (z: number) => z - WO[1], c: Part[] = [];
    const seg = (ax: number, az: number, bx: number, bz: number) => {
      const len = Math.hypot(bx - ax, bz - az), ang = Math.atan2(-(bz - az), bx - ax);
      for (let t = 0; t < len - 0.01; t += 3) {
        const t1 = Math.min(len, t + 3), x0 = ax + ((bx - ax) * t) / len, z0 = az + ((bz - az) * t) / len, x1 = ax + ((bx - ax) * t1) / len, z1 = az + ((bz - az) * t1) / len;
        const y = Math.min(k.ground(X(x0), Z(z0)), k.ground(X(x1), Z(z1))), mx = X((x0 + x1) / 2), mz = Z((z0 + z1) / 2), l = t1 - t;
        c.push([new THREE.BoxGeometry(l, 0.5, 0.26).rotateY(ang).translate(mx, y + 0.1, mz), '#a9a59c']);
        c.push([new THREE.BoxGeometry(l, 2.0, 0.22).rotateY(ang).translate(mx, y + 1.35, mz), '#ece3c9']);
        c.push([new THREE.BoxGeometry(l + 0.04, 0.1, 0.3).rotateY(ang).translate(mx, y + 2.4, mz), '#d9cfb3']);
        c.push([new THREE.BoxGeometry(0.34, 2.5, 0.34).rotateY(ang).translate(X(x0), y + 1.2, Z(z0)), '#e4dac0']);
        for (let d = 0; d < l; d += 0.8) SOLIDS.add(x0 + ((x1 - x0) * d) / l, z0 + ((z1 - z0) * d) / l, 0.2);
      }
    };
    const [x0, x1, z0, z1] = YARD;
    seg(x0, z0, DRIVE[0], z0); seg(DRIVE[1], z0, x1, z0); seg(x1, z0, x1, z1); seg(x1, z1, x0, z1); seg(x0, z1, x0, z0);
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

/** the Kufuor Centre, its sheet fence along Annie Jiagge Road, the building behind Old Pent and the wall round it */
export const kufuorSite = createSite('kufuor', [kufuor, hoarding, yellow, yardWall]);
