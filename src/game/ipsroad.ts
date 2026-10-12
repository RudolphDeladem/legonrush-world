// IPS Road east of the UPSA junction to the UPSA Hostel (the owner's road-corridor brief, R01-R34, and the site brief,
// IMG-01 to IMG-16; positions in ipsplan.ts). The road itself is the mapped campus road (world.ts); this models its
// sides in their order eastward:
// - the north side: the tan herringbone paver sidewalk between its two kerbs (R13-R19), the weedy verge with the wooden
//   distribution poles and the streetlights on their curved arms (R05-R07, R16, IMG-12, IMG-13), and behind it the
//   boundary of the Presbyterian Boys' Senior High School: first the old grey block wall over scrub (R05-R07), then the
//   white wall with blue pilasters and the tall mesh fence of the sports ground (R08, R09, IMG-01, IMG-15), the
//   Presbyterian Worship Centre's signboard (IMG-01, only its legible lines), the arched gate between its two blue-roofed
//   gatehouses with the school's crest (IMG-02), and the open drain at the gate road's mouth (IMG-02, IMG-16, R21, R26);
// - between IPS Road and the frontage road south of it: the kerbed strip of red earth and dry grass with its scattered
//   trees and the cars parked on it near the hostel (IMG-04, IMG-14, R10-R12), continuing the junction's grass median;
// - the lattice transmission towers on the south side and the line between them (R14-R16, IMG-14);
// - the frontage road's south verge: a kerb and a red-earth shoulder before the open land and the compounds (the
//   compounds themselves: upsahostel.ts).
import * as THREE from 'three';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { box, merge, type Part } from './modelkit';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { Bag, gh, hash, tuft, vnoise } from './enkit';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { car } from './cc';
import { canvas } from './modelkit';
import { latticeTower, pavers, rod, run, strip, wires, type V3 } from './upsa';
import { CORRIDOR, FRONT_HALF, IPS_HALF, LAMP_OFF, NORTH_WALK, N_LAMPS, N_POLES, POLE_OFF, PRESEC, PRESEC_DRAIN, STRIP, TOWERS_E, zFront, zIps } from './ipsplan';
import { TOWERS } from './upsaplan';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#f1efe9') };
const O: [number, number] = [1525, -880];
const L = (x: number, z: number): [number, number] => [x - O[0], z - O[1]];
const BLUE = '#2f5d9e', WHITE = '#eeece6';

let earthMat: THREE.MeshStandardMaterial | null = null;
/** the strip's red earth: packed laterite with tyre-worn patches and tufts of dry and green grass (IMG-04, R10-R12) */
function redEarth() {
  if (earthMat) return earthMat;
  let s = 19;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const t = canvas(256, 256, (g) => {
    g.fillStyle = '#9a5a37'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${150 + r() * 40},${80 + r() * 30},${48 + r() * 20},0.35)`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 8 + r() * 30, 5 + r() * 14, r() * 3, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 22; i++) { g.fillStyle = `rgba(${110 + r() * 50},${120 + r() * 40},${60 + r() * 20},${0.35 + r() * 0.3})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 6 + r() * 22, 4 + r() * 10, r() * 3, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 1800; i++) { g.fillStyle = ['#b0703f', '#7d4a2c', '#a58a52', '#6f7d3a', '#c08a58'][(r() * 5) | 0]; g.fillRect(r() * 256, r() * 256, 2, 2); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  // (drawn over the ground like the median: the same small offset)
  earthMat = new THREE.MeshStandardMaterial({ map: t, roughness: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
  return earthMat;
}
let meshMat: THREE.MeshStandardMaterial | null = null;
/** green chain-link mesh, seen through (the sports ground's fence, IMG-01, IMG-15) */
function chainLink() {
  if (meshMat) return meshMat;
  const t = canvas(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.strokeStyle = 'rgba(52,84,62,0.9)'; g.lineWidth = 2;
    for (let i = -64; i < 128; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); g.beginPath(); g.moveTo(i + 64, 0); g.lineTo(i, 64); g.stroke(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  meshMat = new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.8 });
  return meshMat;
}

/** samples along x of a band beside a road line: [x, zInner, zOuter] for x0..x1 every metre, skipping the gaps */
function band(x0: number, x1: number, inner: (x: number) => number, outer: (x: number) => number, gaps: [number, number][]) {
  const runs: [number, number, number][][] = [];
  let cur: [number, number, number][] = [];
  for (let x = x0; x <= x1 + 1e-6; x += 1) {
    const a = inner(x), b = outer(x);
    if (Number.isNaN(a) || Number.isNaN(b) || gaps.some(([g0, g1]) => x > g0 && x < g1)) { if (cur.length > 1) runs.push(cur); cur = []; continue; }
    cur.push([x, a, b]);
  }
  if (cur.length > 1) runs.push(cur);
  return runs;
}

const corridor: Spec = {
  name: 'IPS Road corridor', axis: [1, 0], origin: O, storey: 3, style: PLAIN, roofColor: '#3d6fa8', fascia: '#2f5d9e', pitch: 0.5,
  blocks: [],
  onGround: true,
  // the sidewalk, the strip, the verges: no generated trees or lamps there (the model places its own)
  keep: [[CORRIDOR.x0 - O[0], CORRIDOR.x1 - O[0], -900 - O[1], -858 - O[1]]],
  extras: (k: Kit) => {
    const b = new Bag(O), c: Part[] = [], edge: Part[] = [], solid = (x: number, z: number, r: number) => SOLIDS.add(x, z, r);
    const gate = PRESEC.gate, wz = (x: number) => zIps(x) - PRESEC.wallOff;

    // ---------- the north sidewalk: tan herringbone pavers between two kerbs, open at the school's gate road ----------
    const tan = pavers('tan');
    for (const r of band(NORTH_WALK.x0, NORTH_WALK.x1, (x) => zIps(x) - NORTH_WALK.from, (x) => zIps(x) - NORTH_WALK.from - NORTH_WALK.width, [[gate.x - 2.3 - 1.6, gate.x + 2.3 + 1.6]])) {
      // (outer edge first: the strip's top then faces up on this, the north, side of the road)
      strip(k, r.map(([x, , o]) => L(x, o)), r.map(([x, a]) => L(x, a)), 0.14, tan, edge, '#d6d2c8', [0.16, 0.2]);
    }
    // the weedy verge between the sidewalk and the wall: red earth and dry grass, tufts, the odd shrub (R05-R09)
    k.meshes.push(new THREE.Mesh(drapeAt(O, CORRIDOR.x0, CORRIDOR.x1, -897, -886, 0.6, 0.03, (x, z) => {
      const zi = zIps(x) - NORTH_WALK.from - NORTH_WALK.width - 0.05, zo = wz(x) + 0.15;
      if (!(z < zi && z > zo) || Math.abs(x - gate.x) < gate.half + 0.2) return null;
      const n = vnoise(x * 0.3, z * 0.6), m = vnoise(x * 1.7, z * 1.7);
      // (bare red earth in patches, the rest the campus grass itself: no flat coloured band)
      return n > 0.47 ? [0.56 + m * 0.08, 0.37 + m * 0.05, 0.24] : null;
    }), groundCover()));
    for (let i = 0; i < 520; i++) {
      const x = CORRIDOR.x0 + hash(i, 3.7) * (CORRIDOR.x1 - CORRIDOR.x0), t = hash(9.1, i), z = zIps(x) - NORTH_WALK.from - NORTH_WALK.width - 0.3 - t * 2.1;
      if (Math.abs(x - gate.x) < gate.half + 3 || Number.isNaN(z)) continue;
      if (hash(i, 5) < 0.12) b.leaf.push([new THREE.IcosahedronGeometry(0.5 + hash(i, 8) * 0.5, 1).scale(1.2, 0.9, 1.2).translate(x - O[0], 0.45, z - O[1]), ['#4d7432', '#5d7f38', '#6a8540'][i % 3]]);
      else tuft(b, x, z, 0.5 + hash(i, 2) * 0.7, ['#8d9450', '#7d8a44', '#a39a5a', '#6b7a3a'][i % 4], i);
    }

    // ---------- the PRESEC boundary ----------
    // the old grey block wall (R05-R07): rendered blocks gone dark with weather, a pilaster every 3 m, scrub behind it
    const wallRun = (x0: number, x1: number, h: number, panel: string, pier: string, base: string, cap: string | null) => {
      const n = Math.max(1, Math.round((x1 - x0) / 3));
      for (let j = 0; j < n; j++) {
        const a = x0 + ((x1 - x0) * j) / n, e = x0 + ((x1 - x0) * (j + 1)) / n;
        const [ax, az] = L(a, wz(a)), [ex, ez] = L(e, wz(e));
        const v = hash(a, 1.3) * 0.12;
        c.push([run(ax, az, ex, ez, 0, h, 0.22), shade(panel, v)], [run(ax, az, ex, ez, 0, 0.4, 0.26), base]);
        if (cap) c.push([run(ax, az, ex, ez, h, h + 0.1, 0.3), cap]);
        c.push([box(ax - 0.2, ax + 0.2, 0, h + 0.18, az - 0.2, az + 0.2), pier]);
      }
      const [ex, ez] = L(x1, wz(x1));
      c.push([box(ex - 0.2, ex + 0.2, 0, h + 0.18, ez - 0.2, ez + 0.2), pier]);
      for (let x = x0; x <= x1; x += 0.8) solid(x, wz(x), 0.25);
    };
    wallRun(PRESEC.oldWall[0], PRESEC.oldWall[1], 2.1, '#77736c', '#6c6862', '#5a5650', null);
    // the white wall with blue pilasters, blue coping and base (IMG-01, IMG-02, IMG-15); open at the gate
    wallRun(PRESEC.whiteWall[0], gate.x - gate.half - 0.7 - gate.house, 2.2, WHITE, BLUE, BLUE, BLUE);
    wallRun(gate.x + gate.half + 0.7 + gate.house, PRESEC.whiteWall[1], 2.2, WHITE, BLUE, BLUE, BLUE);
    // the sports ground's tall mesh fence behind the wall: steel posts, a top rail, green chain-link (IMG-01, IMG-15)
    {
      const [m0, m1] = PRESEC.mesh, back = 1.2, H = 6.5, pos: number[] = [], uv: number[] = [], idx: number[] = [];
      for (let x = m0; x <= m1 + 1e-6; x += 3.5) {
        const [px, pz] = L(x, wz(x) - back);
        c.push([new THREE.CylinderGeometry(0.05, 0.06, H, 6).translate(px, H / 2, pz), '#5e6b62']);
        solid(x, wz(x) - back, 0.12);
      }
      for (let x = m0; x < m1 - 1e-6; x += 3.5) {
        const xb = Math.min(m1, x + 3.5), [ax, az] = L(x, wz(x) - back), [bx, bz] = L(xb, wz(xb) - back), n = pos.length / 3;
        pos.push(ax, 2.3, az, bx, 2.3, bz, bx, H, bz, ax, H, az);
        uv.push(0, 0, (xb - x) / 1.2, 0, (xb - x) / 1.2, (H - 2.3) / 1.2, 0, (H - 2.3) / 1.2);
        idx.push(n, n + 1, n + 2, n, n + 2, n + 3);
        c.push([run(ax, az, bx, bz, H - 0.06, H, 0.06), '#5e6b62'], [run(ax, az, bx, bz, 4.4, 4.45, 0.04), '#5e6b62']);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
      const me = new THREE.Mesh(g, chainLink()); me.userData.noCollide = true; k.meshes.push(me);
    }
    // the arched gate (IMG-02): the arch springing from its two piers over the road, the open iron gates, and either side a
    // small gatehouse, white over a blue base, its brown window and the school's crest toward the road, a blue metal roof
    {
      const zg = wz(gate.x), [gx, gz] = L(gate.x, zg), R = gate.half + 0.35, spring = 3.4;
      for (const s of [-1, 1]) {
        const px = gx + s * (gate.half + 0.35);
        c.push([box(px - 0.35, px + 0.35, 0, spring, gz - 0.35, gz + 0.35), WHITE], [box(px - 0.38, px + 0.38, 0, 0.5, gz - 0.38, gz + 0.38), BLUE]);
        solid(gate.x + s * (gate.half + 0.35), zg, 0.5);
        // the gatehouse
        const h0 = gx + s * (gate.half + 0.7), h1 = gx + s * (gate.half + 0.7 + gate.house), f = gz + 1.0, bk = gz - 2.4;
        const [xa, xb] = [Math.min(h0, h1), Math.max(h0, h1)];
        c.push([box(xa, xb, 0, 2.9, bk, f), WHITE], [box(xa - 0.02, xb + 0.02, 0, 0.6, bk - 0.02, f + 0.02), BLUE], [box(xa - 0.1, xb + 0.1, 2.85, 3.0, bk - 0.1, f + 0.1), BLUE]);
        const roof = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).scale(xb - xa + 1.0, 1.25, f - bk + 1.0).translate((xa + xb) / 2, 3.0 + 0.62, (bk + f) / 2);
        c.push([roof, '#3d6fa8']);
        const wx = (xa + xb) / 2 + s * 0.2;
        b.c.push([box(wx - 0.55, wx + 0.55, 1.2, 2.1, f, f + 0.05), '#6b4a2e'], [box(wx - 0.62, wx + 0.62, 1.12, 2.18, f - 0.01, f + 0.03), BLUE]);
        // the crest: a blue shield with the white cross under the window
        b.c.push([box(wx - 0.3, wx + 0.3, 0.75, 1.05, f + 0.05, f + 0.07), '#1f3f88'], [new THREE.ConeGeometry(0.3, 0.32, 3).rotateZ(Math.PI).rotateX(Math.PI / 2).scale(1, 1, 0.1).translate(wx, 0.6, f + 0.06), '#1f3f88']);
        b.c.push([box(wx - 0.04, wx + 0.04, 0.48, 1.02, f + 0.075, f + 0.085), '#f2f2f2'], [box(wx - 0.22, wx + 0.22, 0.79, 0.85, f + 0.075, f + 0.085), '#f2f2f2']);
        for (let x = Math.min(h0, h1); x <= Math.max(h0, h1); x += 0.7) { solid(x + O[0], f + O[1] - 0.3, 0.4); solid(x + O[0], bk + O[1] + 0.3, 0.4); }
        // the iron gate leaf, folded back open against the inside of the pier line
        const lx0 = gx + s * (gate.half - 0.1), lx1 = gx + s * (gate.half - 0.25), zl0 = gz - 0.3, zl1 = gz - 4.0;
        for (let t = 0; t <= 1.001; t += 1 / 18) { const z = zl0 + (zl1 - zl0) * t; c.push([box(Math.min(lx0, lx1) - 0.02, Math.min(lx0, lx1) + 0.02, 0.1, 2.3 + Math.sin(t * Math.PI) * 0.5, z - 0.02, z + 0.02), '#2a2d30']); }
        c.push([box(Math.min(lx0, lx1) - 0.03, Math.min(lx0, lx1) + 0.03, 1.2, 1.28, Math.min(zl0, zl1), Math.max(zl0, zl1)), '#2a2d30']);
      }
      // the arch: a white rib of segments on a half circle
      const seg = 18;
      for (let i = 0; i < seg; i++) {
        const t0 = (Math.PI * i) / seg, t1 = (Math.PI * (i + 1)) / seg;
        c.push([rod([gx - Math.cos(t0) * R, spring + Math.sin(t0) * R, gz], [gx - Math.cos(t1) * R, spring + Math.sin(t1) * R, gz], 0.55), '#eceae4']);
      }
    }
    // the Presbyterian Worship Centre's signboard before the wall (IMG-01): two white posts, a cream board, the church's
    // name in blue, the crest, the centre's name and its place in red (the service times are not legible: not drawn)
    {
      const x = PRESEC.sign, z = wz(x) + 1.3, [px, pz] = L(x, z);
      for (const dx of [-1.3, 1.3]) { c.push([box(px + dx - 0.07, px + dx + 0.07, 0, 3.4, pz - 0.07, pz + 0.07), '#e8e6e0']); solid(x + dx, z, 0.12); }
      c.push([box(px - 1.45, px + 1.45, 1.9, 3.5, pz + 0.07, pz + 0.12), '#d9d3bf'], [box(px - 1.5, px + 1.5, 1.85, 3.55, pz + 0.05, pz + 0.08), '#cfc8b4']);
      k.signs.push({ text: 'PRESBYTERIAN CHURCH OF GHANA', x: px, y: 3.28, z: pz + 0.13, ry: 0, w: 2.5, colors: ['#d9d3bf', '#23376e'] });
      k.signs.push({ text: 'PRESBYTERIAN WORSHIP CENTRE', x: px, y: 2.55, z: pz + 0.13, ry: 0, w: 2.5, colors: ['#d9d3bf', '#b2322b'] });
      k.signs.push({ text: 'PWC, PRESEC - LEGON', x: px, y: 2.3, z: pz + 0.13, ry: 0, w: 1.6, colors: ['#d9d3bf', '#b2322b'] });
      b.c.push([box(px - 0.12, px + 0.12, 2.75, 3.08, pz + 0.12, pz + 0.14), '#1f3f88']);
    }
    // the open drain along the inside of the sidewalk at the gate road's mouth, its concrete lips; a culvert takes it
    // under the road (IMG-02, IMG-16)
    for (const [d0, d1] of [[PRESEC_DRAIN.x0, gate.x - 2.4], [gate.x + 2.4, PRESEC_DRAIN.x1]]) {
      const zc = (x: number) => zIps(x) - NORTH_WALK.from - NORTH_WALK.width - 0.55;
      const [ax, az] = L(d0, zc(d0)), [ex, ez] = L(d1, zc(d1));
      edge.push([run(ax, az, ex, ez, 0.02, 0.03, 0.55), '#2c2a26'], [run(ax, az, ex, ez, 0, 0.2, 0.14, 0.34), '#b9b4a8'], [run(ax, az, ex, ez, 0, 0.2, 0.14, -0.34), '#b9b4a8']);
      for (const [x, z] of [[d0, zc(d0)], [d1, zc(d1)]]) { const [qx, qz] = L(x, z); edge.push([box(qx - 0.07, qx + 0.07, 0, 0.32, qz - 0.42, qz + 0.42), '#a9a397']); }
    }
    // trees behind the old wall (inside the school's grounds, R05-R07): mature broad canopies and a tall slim one
    for (const [x, d, h, sp] of [[1236, 15, 10, 14], [1281, 19, 9, 13], [1342, 14, 11, 15], [1401, 18, 10, 14], [1452, 13, 9.5, 12], [1497, 20, 11, 15], [1534, 14, 9, 12], [1792, 16, 10, 13], [1836, 14, 9, 12]] as [number, number, number, number][]) {
      broadleaf(k, b.leaf, x, zIps(x) - PRESEC.wallOff - d, { h, spread: sp, seed: x * 1.3 + d, origin: O });
    }
    {
      const x = 1310, z = wz(x) - 3.2, [px, pz] = L(x, z);
      c.push([new THREE.CylinderGeometry(0.16, 0.24, 9, 7).translate(px, 4.5, pz), '#5a4a3b']);
      b.leaf.push([new THREE.CylinderGeometry(0.4, 1.3, 10, 9).translate(px, 10.5, pz), '#2f5326'], [new THREE.ConeGeometry(0.9, 3.2, 9).translate(px, 17, pz), '#33582a']);
      solid(x, z, 0.3);
    }

    // ---------- the wooden distribution poles and the streetlights on the north verge ----------
    const poles: V3[][] = [];
    for (const x of N_POLES) {
      const z = zIps(x) - POLE_OFF, [px, pz] = L(x, z);
      c.push([new THREE.CylinderGeometry(0.11, 0.15, 9.5, 7).translate(px, 4.75, pz), '#6b5844'], [box(px - 0.06, px + 0.06, 8.8, 8.92, pz - 1.0, pz + 1.0), '#4f4234']);
      c.push([new THREE.CylinderGeometry(0.06, 0.06, 0.28, 6).translate(px, 9.05, pz - 0.8), '#e8e8e4'], [new THREE.CylinderGeometry(0.06, 0.06, 0.28, 6).translate(px, 9.05, pz + 0.8), '#e8e8e4']);
      poles.push([[px, 9.15, pz - 0.8], [px, 9.15, pz + 0.8], [px, 7.6, pz]]);
      solid(x, z, 0.2);
    }
    const ps: [V3, V3][] = [];
    for (let i = 0; i < poles.length - 1; i++) for (let j = 0; j < 3; j++) ps.push([poles[i][j], poles[i + 1][j]]);
    k.meshes.push(wires(ps, 0.7));
    for (const x of N_LAMPS) {
      const z = zIps(x) - LAMP_OFF, [px, pz] = L(x, z), H = 8.5, reach = 2.2;
      c.push([new THREE.CylinderGeometry(0.07, 0.11, H, 8).translate(px, H / 2, pz), '#8d9398']);
      // the arm curving out over the road (south, +z), the luminaire at its end
      const arm: V3[] = [[px, H - 0.4, pz], [px, H + 0.25, pz + reach * 0.35], [px, H + 0.35, pz + reach * 0.75], [px, H + 0.3, pz + reach]];
      for (let i = 0; i < arm.length - 1; i++) c.push([rod(arm[i], arm[i + 1], 0.07), '#8d9398']);
      c.push([box(px - 0.16, px + 0.16, H + 0.12, H + 0.32, pz + reach - 0.25, pz + reach + 0.35), '#6f7579'], [box(px - 0.13, px + 0.13, H + 0.1, H + 0.12, pz + reach - 0.2, pz + reach + 0.3), '#f1efe2']);
      solid(x, z, 0.15);
    }

    // ---------- the strip between IPS Road and the frontage road: red earth, kerbed, open at the side roads ----------
    for (const r of band(STRIP.x0, STRIP.x1, (x) => zIps(x) + IPS_HALF + 0.05, (x) => zFront(x) - FRONT_HALF - 0.05, STRIP.gaps)) {
      if (r.some(([, a, o]) => o - a < 1)) continue;
      strip(k, r.map(([x, a]) => L(x, a)), r.map(([x, , o]) => L(x, o)), 0.14, redEarth(), edge, '#cfcbc2', [0.2, 0.2]);
    }
    // its trees: small spreading ones at uneven spacing, a big mature one by the hostel (IMG-03, IMG-04, R10, R11)
    const inStrip = (x: number, z: number, m: number) => z > zIps(x) + IPS_HALF + m && z < zFront(x) - FRONT_HALF - m && !STRIP.gaps.some(([g0, g1]) => x > g0 - m && x < g1 + m);
    for (const [x, t, h, sp] of [[1338, 0.5, 6, 8], [1419, 0.4, 5.5, 7], [1487, 0.6, 6.5, 8], [1561, 0.45, 6, 8], [1604, 0.55, 6.5, 9], [1642, 0.4, 7, 9], [1689, 0.5, 6.5, 8], [1714, 0.5, 9, 13], [1757, 0.45, 6.5, 9], [1781, 0.55, 7, 9], [1823, 0.5, 6, 8]] as [number, number, number, number][]) {
      const za = zIps(x) + IPS_HALF, zb = zFront(x) - FRONT_HALF, z = za + (zb - za) * t;
      if (!inStrip(x, z, 1.5)) continue;
      broadleaf(k, b.leaf, x, z, { h, spread: sp, seed: x * 0.7 + 3, origin: O, round: true });
    }
    for (let i = 0; i < 380; i++) {
      const x = STRIP.x0 + hash(i, 13.1) * (STRIP.x1 - STRIP.x0), za = zIps(x) + IPS_HALF, zb = zFront(x) - FRONT_HALF, z = za + 0.6 + (zb - za - 1.2) * hash(17.3, i);
      if (!inStrip(x, z, 0.4)) continue;
      tuft(b, x, z, 0.4 + hash(i, 4) * 0.6, ['#8d9450', '#a39a5a', '#7d8a44', '#b4a468'][i % 4], i + 500);
    }
    // the cars parked on the earth near the hostel (IMG-04, IMG-14): a few, nose to the frontage road
    {
      const ck = { ...k, plain: [] as Part[] } as Kit;
      for (const [x, col] of [[1696, '#9aa0a6'], [1703.5, '#2c3e63'], [1750.5, '#e6e6e4'], [1764, '#1d1f24']] as [number, string][]) {
        const z = (zIps(x) + IPS_HALF + zFront(x) - FRONT_HALF) / 2;
        if (!inStrip(x, z, 1.2)) continue;
        car(ck, x - O[0], z - O[1], col, 0.14, 0);
        solid(x, z, 1.2); solid(x, z - 1.6, 1.0); solid(x, z + 1.6, 1.0);
      }
      for (const p of ck.plain) c.push(p);
    }

    // ---------- the frontage road's south side: a kerb, a red-earth shoulder before the open land ----------
    for (const r of band(STRIP.x0, CORRIDOR.x1, (x) => zFront(x) + FRONT_HALF, (x) => zFront(x) + FRONT_HALF + 0.18, [[1659, 1668.6], [1726.4, 1736]])) {
      const pts = r.map(([x, a]) => L(x, a));
      for (let i = 0; i < pts.length - 1; i++) edge.push([run(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0, 0.15, 0.18, -0.09), '#cfcbc2']);
    }
    k.meshes.push(new THREE.Mesh(drapeAt(O, STRIP.x0, 1648, -867, -852, 0.6, 0.03, (x, z) => {
      const z0 = zFront(x) + FRONT_HALF + 0.2, z1 = z0 + 3.2 + vnoise(x * 0.2, 1) * 3;
      if (!(z > z0 && z < z1)) return null;
      const m = vnoise(x * 1.3, z * 1.3);
      return [0.6 + m * 0.07, 0.38 + m * 0.05, 0.25];
    }), groundCover()));
    // scrub and bushes on the open land before the compounds (R07, R09)
    for (let i = 0; i < 70; i++) {
      const x = 1320 + hash(i, 21) * 325, z = zFront(x) + FRONT_HALF + 4 + hash(22, i) * 16;
      if (hash(i, 23) < 0.45) b.leaf.push([new THREE.IcosahedronGeometry(0.7 + hash(i, 24) * 0.9, 1).scale(1.3, 0.8, 1.3).translate(x - O[0], 0.5, z - O[1]), ['#4d7432', '#5a7d36', '#667f3c'][i % 3]]);
      else tuft(b, x, z, 0.7 + hash(i, 25) * 0.6, ['#8d9450', '#7d8a44', '#a39a5a'][i % 3], i + 900);
    }

    // ---------- the transmission towers and their line, on from the junction's last tower ----------
    const throwaway: Part[] = [];
    const towers: V3[][] = [latticeTower(throwaway, ...L(TOWERS[TOWERS.length - 1][0], TOWERS[TOWERS.length - 1][1]))];
    for (const [x, z] of TOWERS_E) {
      towers.push(latticeTower(c, ...L(x, z)));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) solid(x + sx * 3, z + sz * 3, 0.45);
    }
    const ts: [V3, V3][] = [];
    for (let i = 0; i < towers.length - 1; i++) for (let j = 0; j < towers[i].length; j++) ts.push([towers[i][j], towers[i + 1][j]]);
    k.meshes.push(wires(ts, 7));

    const m = new THREE.Mesh(merge(c), concrete(0.35)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    if (edge.length) { const e = new THREE.Mesh(merge(edge), concrete(0.2)); e.receiveShadow = true; k.meshes.push(e); }
    b.finish(k, 0.3);
    void gh;
  },
};

/** a colour a little darker by v (0..1) */
function shade(hex: string, v: number) {
  const c = new THREE.Color(hex).multiplyScalar(1 - v);
  return `#${c.getHexString()}`;
}

export const ipsSite = createSite('ips-road', [corridor]);
