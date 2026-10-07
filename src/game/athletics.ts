// The Athletic Oval between Legon Hall and Akuafo Hall, and the courts round it, from the owner's
// panoramas and the registered atlas (block engine: blocks.ts; the mapped track and pitches are drawn
// here instead of as flat areas, Spec.covers).
//
// The oval: a worn earth running track round a dry grass football pitch with its markings and goals,
// tiered concrete seating along the east side, trees along the north and west edges. West of it, north
// to south: a sand volleyball court below Maison Française, two tennis courts, and the big handball
// court; east of it, the two basketball courts along the road; north-east, the fenced basketball court
// by Akuafo.
import * as THREE from 'three';
import { box } from './modelkit';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { garden } from './gardens';

const O: [number, number] = [6.5, 402.5];
const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
const LINE = '#f4f3ee', EARTH = '#b39a70', DRY = '#93a35e', GREEN = '#4f8f5a', BLUE = '#3f7fb5', SAND = '#d9bc8c', CONCRETE = '#aaa69c';

/** a stadium outline (straights along z, half-width a, half-length b) as a shape in the x / -z plane */
function stadium(a: number, b: number, n = 24) {
  const s = new THREE.Shape(), r = a, h = b - a;
  s.moveTo(a, -h);
  for (let i = 0; i <= n; i++) { const t = (i / n) * Math.PI; s.lineTo(Math.cos(t) * r, -h - Math.sin(t) * r); }
  s.lineTo(-a, h);
  for (let i = 0; i <= n; i++) { const t = Math.PI + (i / n) * Math.PI; s.lineTo(Math.cos(t) * r, h - Math.sin(t) * r); }
  return s;
}
const path = (a: number, b: number) => new THREE.Path(stadium(a, b).getPoints());
/** a flat surface from a shape (with holes), y up */
const flatShape = (s: THREE.Shape, y: number) => new THREE.ShapeGeometry(s, 24).rotateX(-Math.PI / 2).translate(0, y, 0);
/** a painted line from (x0, z0) to (x1, z1), axis-aligned, w wide */
function line(k: Kit, x0: number, z0: number, x1: number, z1: number, y: number, w = 0.12, c = LINE) {
  k.plain.push([box(Math.min(x0, x1) - w / 2, Math.max(x0, x1) + w / 2, y, y + 0.01, Math.min(z0, z1) - w / 2, Math.max(z0, z1) + w / 2), c]);
}
/** a painted arc round (x, z), radius r, from angle a0 to a1 (radians, 0 = +x, toward +z) */
function arc(k: Kit, x: number, z: number, r: number, a0: number, a1: number, y: number, w = 0.12, c = LINE) {
  // (laid flat facing up: the ring's angle runs the other way once it is turned down onto the ground)
  k.plain.push([new THREE.RingGeometry(r - w / 2, r + w / 2, 32, 1, -a1, a1 - a0).rotateX(-Math.PI / 2).translate(x, y + 0.005, z), c]);
}
/** a rectangle outline */
const rectLines = (k: Kit, x0: number, x1: number, z0: number, z1: number, y: number, w = 0.12, c = LINE) => {
  line(k, x0, z0, x1, z0, y, w, c); line(k, x0, z1, x1, z1, y, w, c); line(k, x0, z0, x0, z1, y, w, c); line(k, x1, z0, x1, z1, y, w, c);
};
/** a court: a surround and a playing surface (model frame), returns the surface's top */
function court(k: Kit, r: [number, number, number, number], inner: [number, number, number, number], surround: string, surface: string) {
  k.plain.push([box(r[0], r[1], -0.2, 0.05, r[2], r[3]), surround]);
  k.plain.push([box(inner[0], inner[1], 0.05, 0.07, inner[2], inner[3]), surface]);
  return 0.07;
}
/** a basketball hoop standing at (x, z), the board facing +dir along z (or x when alongX) */
function hoop(k: Kit, x: number, z: number, dir: number, alongX = false) {
  const p = (dx: number, dz: number): [number, number] => (alongX ? [x + dz * dir, z + dx] : [x + dx, z + dz * dir]);
  const [px, pz] = p(0, -1.2), [bx, bz] = p(0, 0), [rx, rz] = p(0, 0.45);
  k.plain.push([new THREE.CylinderGeometry(0.08, 0.1, 3.4, 8).translate(px, 1.7, pz), '#3b3f46']);
  k.plain.push([box(Math.min(px, bx) - (alongX ? 0 : 0.05), Math.max(px, bx) + (alongX ? 0 : 0.05), 3.2, 3.3, Math.min(pz, bz) - (alongX ? 0.05 : 0), Math.max(pz, bz) + (alongX ? 0.05 : 0)), '#3b3f46']);
  k.plain.push([alongX ? box(bx - 0.03, bx + 0.03, 2.9, 3.95, bz - 0.9, bz + 0.9) : box(bx - 0.9, bx + 0.9, 2.9, 3.95, bz - 0.03, bz + 0.03), '#f4f3ee']);
  k.plain.push([new THREE.TorusGeometry(0.23, 0.02, 6, 16).rotateX(Math.PI / 2).translate(rx, 3.05, rz), '#d9531e']);
}
/** a net across a court: posts at (x0, z0) and (x1, z1), height h */
function net(k: Kit, x0: number, z0: number, x1: number, z1: number, h: number) {
  for (const [x, z] of [[x0, z0], [x1, z1]]) k.plain.push([new THREE.CylinderGeometry(0.05, 0.05, h + 0.1, 6).translate(x, (h + 0.1) / 2, z), '#3b3f46']);
  k.plain.push([box(Math.min(x0, x1), Math.max(x0, x1) + 0.02, h - 0.8, h, Math.min(z0, z1), Math.max(z0, z1) + 0.02), '#2a2c30']);
  k.plain.push([box(Math.min(x0, x1), Math.max(x0, x1) + 0.02, h - 0.06, h + 0.02, Math.min(z0, z1) - 0.01, Math.max(z0, z1) + 0.03), LINE]);
}
/** football goal: posts 7.32 m apart across x at z, the net running back toward -dir */
function goal(k: Kit, x: number, z: number, dir: number) {
  for (const s of [-1, 1]) {
    k.plain.push([box(x + s * 3.66 - 0.06, x + s * 3.66 + 0.06, 0, 2.44, z - 0.06, z + 0.06), LINE]);
    k.plain.push([box(x + s * 3.66 - 0.03, x + s * 3.66 + 0.03, 0, 1.0, z - dir * 1.8, z), '#d9d9d4']);
  }
  k.plain.push([box(x - 3.72, x + 3.72, 2.38, 2.5, z - 0.06, z + 0.06), LINE]);
  // the net: a dark mesh panel at the back, and the top
  k.plain.push([box(x - 3.66, x + 3.66, 0, 1.0, z - dir * 1.85, z - dir * 1.8), '#5a5d63']);
  k.plain.push([new THREE.PlaneGeometry(7.32, Math.hypot(1.8, 1.44)).rotateX(-Math.PI / 2 + dir * Math.atan2(1.44, 1.8)).translate(x, 1.72, z - dir * 0.9), '#6b6e74']);
}

const g = garden([-110, 110, 240, 500]);
/** (the site has no walls of its own) */
const PLAIN: Style = { bay: 3, up: [], ground: [], draw: (c) => render(c) };

const oval: Spec = {
  name: 'Athletic Oval',
  axis: [1, 0], origin: O, storey: 3, style: PLAIN, roofColor: '#b85a37', fascia: '#5a3a2c', pitch: 0.5,
  blocks: [],
  // the mapped track, the pitches round it and the sand court are drawn here
  covers: [[6.5, 402.5], [-64, 377], [-78, 376], [-71, 424], [86, 430], [86, 378], [70, 275]],
  keep: [[-60, 60, -95, 95], [X(-90), X(-50), Z(300), Z(452)], [X(74), X(97), Z(360), Z(448)], [X(45), X(93), Z(254), Z(296)]],
  extras: (k) => {
    g.reseed(3);
    // ---------- the oval: earth track round the dry grass infield (track lanes 7 m) ----------
    const A = 44.5, B = 85.5, W = 7;
    const track = stadium(A, B);
    track.holes.push(path(A - W, B - W));
    k.plain.push([flatShape(track, 0.05), EARTH]);
    k.plain.push([flatShape(stadium(A - W, B - W), 0.04), DRY]);
    // the track's edges, faint
    for (const [a, b] of [[A - 0.15, B - 0.15], [A - W + 0.15, B - W + 0.15]]) {
      const ring = stadium(a, b);
      ring.holes.push(path(a - 0.12, b - 0.12));
      k.plain.push([flatShape(ring, 0.06), '#d8cfba']);
    }
    // the football pitch: 60 m x 100 m along the oval, its markings and goals
    const PW = 30, PL = 50, y = 0.05;
    rectLines(k, -PW, PW, -PL, PL, y);
    line(k, -PW, 0, PW, 0, y);
    arc(k, 0, 0, 9.15, 0, Math.PI * 2, y);
    for (const s of [-1, 1]) {
      const zg = s * PL;
      rectLines(k, -20.15, 20.15, Math.min(zg, zg - s * 16.5), Math.max(zg, zg - s * 16.5), y);
      rectLines(k, -9.15, 9.15, Math.min(zg, zg - s * 5.5), Math.max(zg, zg - s * 5.5), y);
      // the arc of the penalty area: the part of the 9.15 m circle round the spot outside the box
      const c = Math.asin(5.5 / 9.15);
      arc(k, 0, zg - s * 11, 9.15, s < 0 ? c : Math.PI + c, s < 0 ? Math.PI - c : 2 * Math.PI - c, y);
      goal(k, 0, zg, s);
    }
    // tiered concrete seating along the east side and round the south-east bend (owner's panoramas)
    for (const [z0, z1] of [[-60, -38], [-34, -12], [-8, 14], [18, 40], [44, 62]] as [number, number][]) {
      for (let t = 0; t < 4; t++) k.plain.push([box(A + 3 + t * 0.85, A + 3.9 + t * 0.85, 0, 0.45 * (t + 1), z0, z1), t % 2 ? CONCRETE : '#b7b3a9']);
    }
    for (let i = 0; i < 6; i++) {
      const a = 0.15 + (i / 6) * 1.1, h = B - A, r = A + 3;
      for (let t = 0; t < 3; t++) {
        const rr = r + t * 0.85;
        k.plain.push([new THREE.BoxGeometry(0.85, 0.45 * (t + 1), 6).translate(0, 0.225 * (t + 1), 0).rotateY(-a).translate(Math.cos(a) * (rr + 0.42), 0, h + Math.sin(a) * (rr + 0.42)), t % 2 ? CONCRETE : '#b7b3a9']);
      }
    }
    // ---------- west of the oval: the sand court, the two tennis courts and the handball court ----------
    // sand volleyball (below Maison Française): x -79..-59, z 303..331
    court(k, [X(-79), X(-59), Z(303), Z(331)], [X(-77), X(-61), Z(305), Z(329)], GREEN, SAND);
    rectLines(k, X(-73), X(-65), Z(309), Z(325), 0.08, 0.08, '#2f5d9a');
    net(k, X(-74), Z(317), X(-64), Z(317), 2.43);
    // two tennis courts side by side: x -84..-57, z 365..387
    court(k, [X(-85), X(-56.5), Z(364.5), Z(387.5)], [X(-83.5), X(-71.5), Z(366.5), Z(385.5)], GREEN, BLUE);
    k.plain.push([box(X(-70), X(-58), 0.05, 0.07, Z(366.5), Z(385.5)), BLUE]);
    for (const [x0, x1] of [[-83.5, -71.5], [-70, -58]] as [number, number][]) {
      rectLines(k, X(x0) + 0.5, X(x1) - 0.5, Z(367), Z(385), 0.08, 0.08);
      line(k, X(x0) + 1.8, Z(367), X(x0) + 1.8, Z(385), 0.08, 0.08);
      line(k, X(x1) - 1.8, Z(367), X(x1) - 1.8, Z(385), 0.08, 0.08);
      line(k, X(x0) + 1.8, Z(371), X(x1) - 1.8, Z(371), 0.08, 0.08);
      line(k, X(x0) + 1.8, Z(381), X(x1) - 1.8, Z(381), 0.08, 0.08);
      line(k, (X(x0) + X(x1)) / 2, Z(371), (X(x0) + X(x1)) / 2, Z(381), 0.08, 0.08);
      net(k, X(x0) + 0.2, Z(376), X(x1) - 0.2, Z(376), 1.07);
    }
    // the fence round the tennis courts
    fence(k, X(-85), X(-56.5), Z(364.5), Z(387.5), 3);
    // the handball court (owner's panorama: blue on green, goal areas at both ends): x -84..-57, z 398..448
    court(k, [X(-84.5), X(-56.5), Z(397.5), Z(448.5)], [X(-80.5), X(-60.5), Z(403), Z(443)], GREEN, BLUE);
    const hx = X(-70.5), y2 = 0.08;
    rectLines(k, hx - 10, hx + 10, Z(403), Z(443), y2);
    line(k, hx - 10, Z(423), hx + 10, Z(423), y2);
    arc(k, hx, Z(423), 3, 0, Math.PI * 2, y2);
    for (const [zg, s] of [[Z(403), 1], [Z(443), -1]] as [number, number][]) {
      arc(k, hx, zg, 6, s > 0 ? 0 : Math.PI, s > 0 ? Math.PI : 2 * Math.PI, y2);
      arc(k, hx, zg, 9, s > 0 ? 0.25 : Math.PI + 0.25, s > 0 ? Math.PI - 0.25 : 2 * Math.PI - 0.25, y2, 0.08);
      for (const dx of [-1.5, 1.5]) k.plain.push([box(hx + dx - 0.05, hx + dx + 0.05, 0, 2, zg - 0.05, zg + 0.05), LINE]);
      k.plain.push([box(hx - 1.55, hx + 1.55, 1.95, 2.05, zg - 0.05, zg + 0.05), LINE]);
      k.plain.push([box(hx - 1.5, hx + 1.5, 0, 2, zg - s * 1.0, zg - s * 0.95), '#5a5d63']);
    }
    // ---------- east of the oval: the two basketball courts along the road ----------
    for (const [z0, z1] of [[364, 392], [415, 445]] as [number, number][]) {
      court(k, [X(77), X(94), Z(z0), Z(z1)], [X(78.5), X(92.5), Z(z0) + 1.2, Z(z1) - 1.2], '#c0563f', BLUE);
      const cx = X(85.5), cz = (Z(z0) + Z(z1)) / 2;
      rectLines(k, X(78.8), X(92.2), Z(z0) + 1.5, Z(z1) - 1.5, 0.08, 0.08);
      line(k, X(78.8), cz, X(92.2), cz, 0.08, 0.08);
      arc(k, cx, cz, 1.8, 0, Math.PI * 2, 0.08, 0.08);
      hoop(k, cx, Z(z0) + 0.8, 1);
      hoop(k, cx, Z(z1) - 0.8, -1);
    }
    // ---------- north-east, by Akuafo: the fenced basketball court ----------
    court(k, [X(47.5), X(91.5), Z(256.5), Z(293.5)], [X(55.5), X(83.5), Z(267.5), Z(282.5)], GREEN, '#5d9ccc');
    rectLines(k, X(55.8), X(83.2), Z(267.8), Z(282.2), 0.08, 0.08);
    line(k, X(69.5), Z(267.8), X(69.5), Z(282.2), 0.08, 0.08);
    arc(k, X(69.5), Z(275), 1.8, 0, Math.PI * 2, 0.08, 0.08);
    hoop(k, X(54.6), Z(275), 1, true);
    hoop(k, X(84.4), Z(275), -1, true);
    fence(k, X(47.5), X(91.5), Z(256.5), Z(293.5), 3.5);
    // ---------- trees along the north and west edges of the oval, and between the courts ----------
    const clear: [number, number, number, number][] = [[-38, 51, 312, 493], [-86, -55, 300, 452], [76, 95, 362, 447], [46, 93, 255, 295]];
    g.clear.push(...clear.map(([x0, x1, z0, z1]) => [x0 - 1, x1 + 1, z0 - 1, z1 + 1] as [number, number, number, number]));
    for (let x = -36; x < 52; x += 6.5) g.tree(k, X(x + g.rand() * 2), Z(306 + g.rand() * 3), 1.1 + g.rand() * 0.4);
    for (let z = 330; z < 470; z += 8) g.tree(k, X(-50 + g.rand() * 2), Z(z + g.rand() * 3), 1 + g.rand() * 0.4);
    g.scatter(-55, -46, 300, 470, 14, (x, z) => g.tree(k, X(x), Z(z), 0.9 + g.rand() * 0.4));
    g.scatter(55, 75, 330, 470, 18, (x, z) => g.tree(k, X(x), Z(z), 0.9 + g.rand() * 0.5));
  },
};

/** a wire fence round a rectangle: posts every 3 m and a faint mesh */
function fence(k: Kit, x0: number, x1: number, z0: number, z1: number, h: number) {
  const side = (ax: number, az: number, bx: number, bz: number) => {
    const len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 3));
    for (let i = 0; i <= n; i++) k.plain.push([new THREE.CylinderGeometry(0.04, 0.04, h, 6).translate(ax + ((bx - ax) * i) / n, h / 2, az + ((bz - az) * i) / n), '#e8e8e4']);
    k.plain.push([box(Math.min(ax, bx), Math.max(ax, bx) + 0.02, h - 0.06, h, Math.min(az, bz), Math.max(az, bz) + 0.02), '#d6d6d2']);
  };
  side(x0, z0, x1, z0); side(x0, z1, x1, z1); side(x0, z0, x0, z1); side(x1, z0, x1, z1);
}

/** the Athletic Oval and its courts */
export const athletics = createSite('athletics', [oval]);
