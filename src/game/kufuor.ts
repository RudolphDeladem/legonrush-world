// Behind Old Pent, from the owner's third reference PDF (pages 59-66; block engine: blocks.ts):
//
// - The Kufuor Centre for Leadership and Governance, abandoned unfinished: a bare concrete frame of three floors on
//   round columns, open between them, its front toward Annie Jiagge Road curved in tiers of round slab edges, the
//   top under a dark sheet roof edge; a few walls of grey blockwork filled in at the back with small window holes.
//   Beside it the round drum of the gate house, rendered but unpainted, under a deep conical roof of brown tiles.
//   The site is closed by corrugated metal sheets, a sliding gate of timber slats in a steel frame at its west, a
//   curved herringbone-paved apron before the gate; inside, red earth with heaps and scattered paving blocks.
// - Along Annie Jiagge Road from the Kufuor Centre south to the Pent entrance, the footway runs beside a long
//   hoarding of corrugated aluminium sheets plastered with posters (page 66).
// - The building behind Old Pent (the Y-shaped one north of Addis Ababa and Dar es Salaam, pages 57-60): four storeys
//   painted yellow under red roofs; on its east end round balconies one over another and a black spiral stair beside
//   them, behind a palisade on square white concrete posts. Its walls are painted by the generic builder
//   (behindPentStyle); this module adds the end with its balconies and stair.
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
    // the round gate house south-west of it: a drum under a conical roof of brown tiles, the door on the gate side
    { const gx = X(535.5), gz = Z(-392.5);
      c.push([new THREE.CylinderGeometry(3.0, 3.0, 3.0, 24).translate(gx, y0 + 1.5, gz), '#c9c3b6']);
      c.push([new THREE.CylinderGeometry(3.4, 3.4, 2.6, 24).translate(gx, y0 + 4.3, gz), '#bfb9ac']);
      k.plain.push([new THREE.ConeGeometry(4.8, 2.4, 24).translate(gx, y0 + 6.8, gz), '#5b3a2c'], [new THREE.CylinderGeometry(4.8, 4.8, 0.2, 24, 1, true).translate(gx, y0 + 5.62, gz), '#f1efe8']);
      k.plain.push([box(gx - 3.05, gx - 2.98, y0, y0 + 2.4, gz - 0.7, gz + 0.7), '#2a2624']);
      SOLIDS.add(535.5, -392.5, 3.2); }
    for (const [x, z] of [[541, -381], [549, -381], [556, -381], [549, -375], [549, -387]]) SOLIDS.add(x, z, 3.0);
    // the ground inside: red earth, heaps of paving blocks
    k.plain.push([B(528, 566, y0 + 0.005, y0 + 0.03, -397, -364), '#a4583a']);
    for (const [x, z, n] of [[531.5, -386, 18], [544, -393.5, 12], [560, -370, 10]] as [number, number, number][]) {
      for (let i = 0; i < n; i++) { const dx = ((i * 37) % 13) / 5 - 1.3, dz = ((i * 53) % 11) / 5 - 1.1, h = ((i * 7) % 4) * 0.1; k.plain.push([B(x + dx, x + dx + 0.22, y0 + h, y0 + h + 0.1, z + dz, z + dz + 0.11), '#c2b49c']); }
      k.plain.push([B(x - 1.2, x + 1.2, y0, y0 + 0.6, z - 0.6, z + 0.6), '#b9ab93']);
    }
    // the corrugated sheets round the site, the timber gate on the west, the paved apron before it
    const W = [527.5, 566.5, -397.5, -363.5], G0 = -384.5, G1 = -378.5;
    const run = (ax: number, az: number, bx: number, bz: number) => {
      const len = Math.hypot(bx - ax, bz - az), geo = new THREE.PlaneGeometry(len, 2.4);
      const uv = geo.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setX(i, (uv.getX(i) * len) / 12);
      const m = new THREE.Mesh(geo, sheets());
      m.position.set(X((ax + bx) / 2), y0 + 1.2, Z((az + bz) / 2)); m.rotation.y = -Math.atan2(bz - az, bx - ax); m.castShadow = true;
      k.meshes.push(m);
      for (let t = 0; t <= len; t += 2.5) { const x = ax + ((bx - ax) * t) / len, z = az + ((bz - az) * t) / len; k.plain.push([B(x - 0.04, x + 0.04, y0, y0 + 2.45, z - 0.04, z + 0.04), '#6c6c66']); SOLIDS.add(x, z, 0.2); }
    };
    run(W[0], W[2], W[1], W[2]); run(W[1], W[2], W[1], W[3]); run(W[1], W[3], W[0], W[3]); run(W[0], W[3], W[0], G1); run(W[0], G0, W[0], W[2]);
    k.plain.push([B(W[0] - 0.1, W[0] + 0.1, y0, y0 + 2.6, G0, G1), '#3a3a38']);
    for (let z = G0 + 0.1; z < G1; z += 0.18) k.plain.push([B(W[0] - 0.08, W[0] + 0.08, y0 + 0.15, y0 + 2.45, z, z + 0.13), '#7a4a32']);
    for (let z = G0; z < G1; z += 0.6) SOLIDS.add(W[0], z, 0.2);
    { const g = new THREE.RingGeometry(3, 9, 20, 1, Math.PI * 0.5, Math.PI).rotateX(-Math.PI / 2).translate(X(W[0]), y0 + 0.03, Z((G0 + G1) / 2));
      k.plain.push([g, '#8f8a82']); }
    const m = new THREE.Mesh(merge(c), concrete(0.9)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

// ---------- the hoarding along Annie Jiagge Road from the Kufuor Centre to the Pent entrance ----------
const HO: [number, number] = [518, -420];
const hoarding: Spec = {
  name: 'hoarding along Annie Jiagge Road',
  axis: [1, 0], origin: HO, storey: 3, style: kufuor.style, roofColor: '#3a3532', fascia: '#2a2624', pitch: 0.2,
  onGround: true,
  blocks: [],
  keep: [[513 - HO[0], 527 - HO[0], -466 - HO[1], -362 - HO[1]]],
  extras: (k) => {
    const X = (x: number) => x - HO[0], Z = (z: number) => z - HO[1];
    // the sheets lean and buckle a little from panel to panel, as in the photo
    for (let z = -362; z > -466; z -= 2.4) {
      const z1 = Math.max(-466, z - 2.4), xa = pentFenceX(z), xb = pentFenceX(z1), y = k.ground(X(xa), Z(z));
      const geo = new THREE.PlaneGeometry(z - z1, 2.4);
      const uv = geo.attributes.uv as THREE.BufferAttribute;
      const off = ((z * 7) % 5 + 5) % 5 / 5;
      for (let i = 0; i < uv.count; i++) uv.setX(i, off + (uv.getX(i) * (z - z1)) / 12);
      const m = new THREE.Mesh(geo, sheets());
      m.position.set(X((xa + xb) / 2), y + 1.2, Z((z + z1) / 2));
      m.rotation.y = Math.PI / 2 + Math.atan2(xb - xa, z - z1); m.rotation.z = (((z * 13) | 0) % 3 - 1) * 0.03;
      m.castShadow = true;
      k.meshes.push(m);
      k.plain.push([box(X(xa) - 0.05, X(xa) + 0.05, y, y + 2.45, Z(z) - 0.05, Z(z) + 0.05), '#6c6c66']);
      SOLIDS.add(xa, z, 0.2); SOLIDS.add((xa + xb) / 2, (z + z1) / 2, 0.2);
    }
  },
};

// ---------- the building behind Old Pent: its east end with the round balconies and the spiral stair ----------
// frame: x out of the east end wall (which runs on a slant), z along it
const YO: [number, number] = [595.45, -467];
/** the yellow building's footprint (the Y north of Addis Ababa and Dar es Salaam) */
const isBehindPent = (b: Building) => b.minX > 546 && b.maxX < 599 && b.minZ > -475 && b.maxZ < -428 && b.maxX - b.minX > 40;
export const behindPentStyle = (b: Building) => (isBehindPent(b) ? { wall: '#ecd48a', roof: '#b4472f' } : undefined);
const yellow: Spec = {
  name: 'building behind Old Pent (east end)',
  axis: [0.93, -0.367], origin: YO, storey: 3.3, style: kufuor.style, roofColor: '#b4472f', fascia: '#3a2a22', pitch: 0.4,
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
    const sx = 2.2, sz = 2.4;
    k.plain.push([new THREE.CylinderGeometry(0.08, 0.08, 4 * 3.3, 8).translate(sx, y0 + 2 * 3.3, sz), '#1b1b1b']);
    for (let i = 0; i < 64; i++) {
      const a = i * 0.45, y = y0 + 0.2 + i * 0.2;
      k.plain.push([new THREE.BoxGeometry(0.9, 0.05, 0.3).translate(0.45, 0, 0).rotateY(a).translate(sx, y, sz), '#2a1d18']);
      k.plain.push([new THREE.BoxGeometry(0.02, 0.9, 0.02).translate(0.9, 0.45, 0).rotateY(a).translate(sx, y, sz), '#2a1d18']);
    }
    SOLIDS.add(...k.world(sx, sz), 1.0);
    // the palisade on square white concrete posts before it
    for (let z = -6; z <= 6; z += 2.4) {
      c.push([box(4.6, 4.95, y0, y0 + 2.4, z - 0.17, z + 0.17), '#e9e4d6']);
      for (let zz = z + 0.25; zz < z + 2.3 && zz < 6; zz += 0.16) k.plain.push([box(4.74, 4.78, y0, y0 + 2.0, zz, zz + 0.04), '#bfc3c6']);
      SOLIDS.add(...k.world(4.8, z), 0.3);
    }
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; k.meshes.push(m);
  },
};

/** the Kufuor Centre, the hoarding to the Pent entrance and the building behind Old Pent */
export const kufuorSite = createSite('kufuor', [kufuor, hoarding, yellow]);
