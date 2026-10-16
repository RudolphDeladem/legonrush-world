// The Okponglo junction's road surface and paint, built from its plan (okjplan.ts; the owner's strict correction brief
// of 2026-10-16): the N4's carriageways through the median's stretch with their widenings and merges, the two side
// arms, the four rounded corners as one asphalt surface (no raised separator anywhere between a corner lane and the
// road), zone 5's concrete stopping bay flush beside the asphalt, and the lane lines, corner-lane guides, stop lines,
// crossings and arrows on the final geometry. world.ts lays the surface with the other roads and lowers it with them.
import * as THREE from 'three';
import { MEDIAN, WIDEN, eastInner, medianCap, westInner } from './lbplan';
import {
  ARM, CORNERS, CORNER_R, LANE, STOP, XM, ZEBRA, ZONES, armEdges, armLane, armLanes, bayOuter, bayWidth, clz, eInner, eLane, eOuter,
  eastLanes, hfN4, inGap, wInner, wLane, wOuter, westEdge, westLanes, type Corner,
} from './okjplan';

type P2 = [number, number];
interface Buf { pos: number[]; idx: number[] }
const buf = (): Buf => ({ pos: [], idx: [] });
/** a triangle facing up */
function tri(b: Buf, a: P2, c: P2, d: P2, y = 0) {
  const up = (c[1] - a[1]) * (d[0] - a[0]) - (c[0] - a[0]) * (d[1] - a[1]) > 0;
  const i = b.pos.length / 3;
  b.pos.push(a[0], y, a[1], ...(up ? [c[0], y, c[1], d[0], y, d[1]] : [d[0], y, d[1], c[0], y, c[1]]));
  b.idx.push(i, i + 1, i + 2);
}
const quad = (b: Buf, a: P2, c: P2, d: P2, e: P2, y = 0) => { tri(b, a, c, d, y); tri(b, a, d, e, y); };

/** the asphalt (appended to the N4's road mesh) and the concrete bay, as flat triangles at y 0 */
export function okjSurfaces(): { asphalt: Buf; bay: Buf } {
  const asphalt = buf(), bay = buf();
  // the carriageways, a quad a metre; the median's tips and the bay's ends exactly
  const zs = new Set<number>();
  for (let z = WIDEN.z0; z <= WIDEN.z1; z += 1) zs.add(z);
  // (and the median's rounded ends: asphalt under them, from where the half circles begin, so their corners are road)
  const c0 = medianCap(0).zc, c1 = medianCap(1).zc;
  for (const z of [...MEDIAN.gap, ...ZONES[5].bay, WIDEN.z1, c0, c1]) zs.add(z);
  const zl = [...zs].sort((a, b) => a - b);
  for (let i = 0; i < zl.length - 1; i++) {
    const z0 = zl[i], z1 = zl[i + 1], zm = (z0 + z1) / 2;
    if (zm > c0 && zm < c1) quad(asphalt, [wOuter(z0), z0], [eOuter(z0), z0], [eOuter(z1), z1], [wOuter(z1), z1]);
    else {
      quad(asphalt, [wOuter(z0), z0], [westInner(z0), z0], [westInner(z1), z1], [wOuter(z1), z1]);
      quad(asphalt, [eastInner(z0), z0], [eOuter(z0), z0], [eOuter(z1), z1], [eastInner(z1), z1]);
    }
    if (bayWidth(zm) > 0) quad(bay, [bayOuter(z0), z0], [wOuter(z0), z0], [wOuter(z1), z1], [bayOuter(z1), z1]);
  }
  // the arms, a quad a metre across the junction from one mapped road end to the other
  for (let x = ARM.x0; x < ARM.x1 - 1e-6; x += 1) {
    const x1 = Math.min(ARM.x1, x + 1), [a0, b0] = armEdges(x), [a1, b1] = armEdges(x1);
    quad(asphalt, [x, a0], [x1, a1], [x1, b1], [x, b0]);
  }
  // the corners: the fan from the kerbs' meeting point to the arc
  for (const k of CORNERS) for (let i = 0; i < k.arc.length - 1; i++) tri(asphalt, k.p, k.arc[i], k.arc[i + 1]);
  return { asphalt, bay };
}

// ---------------------------------------------------------------------------------------------------------------
// paint
// ---------------------------------------------------------------------------------------------------------------
const Y = 0.03;
/** a line of width w along the points (solid), or dashed `on` metres every `on + off` */
function line(b: Buf, pts: P2[], w: number, on = 0, off = 0) {
  let s0 = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az);
    if (L < 1e-4) continue;
    const ux = (bx - ax) / L, uz = (bz - az) / L, nx = (-uz * w) / 2, nz = (ux * w) / 2;
    const piece = (t0: number, t1: number) => {
      const p0: P2 = [ax + ux * t0, az + uz * t0], p1: P2 = [ax + ux * t1, az + uz * t1];
      quad(b, [p0[0] - nx, p0[1] - nz], [p1[0] - nx, p1[1] - nz], [p1[0] + nx, p1[1] + nz], [p0[0] + nx, p0[1] + nz], Y);
    };
    if (!on) piece(0, L);
    else {
      // (the pattern runs on along the whole line, round its bends)
      const P = on + off;
      for (let k = Math.floor(s0 / P); ; k++) {
        const a = k * P - s0;
        if (a >= L) break;
        const lo = Math.max(0, a), hi = Math.min(L, a + on);
        if (hi > lo) piece(lo, hi);
      }
    }
    s0 += L;
  }
}
/** points along z from z0 to z1 at x(z), every 2 m (and only where `keep` holds: runs) */
function alongZ(x: (z: number) => number, z0: number, z1: number, keep: (z: number) => boolean = () => true): P2[][] {
  const runs: P2[][] = [];
  let cur: P2[] = [];
  const n = Math.max(1, Math.ceil(Math.abs(z1 - z0) / 2));
  for (let i = 0; i <= n; i++) {
    const z = z0 + ((z1 - z0) * i) / n;
    if (keep(z) && !Number.isNaN(x(z))) cur.push([x(z), z]);
    else { if (cur.length > 1) runs.push(cur); cur = []; }
  }
  if (cur.length > 1) runs.push(cur);
  return runs;
}
function alongX(z: (x: number) => number, x0: number, x1: number, keep: (x: number) => boolean = () => true): P2[][] {
  return alongZ(z, x0, x1, keep).map((r) => r.map(([a, b]): P2 => [b, a]));
}
/** a corner lane's guide: the arc a lane in from the kerb, concentric with it */
function cornerGuide(k: Corner, w: number): P2[] {
  const a1 = Math.atan2(k.t1[1] - k.c[1], k.t1[0] - k.c[0]);
  let a2 = Math.atan2(k.t2[1] - k.c[1], k.t2[0] - k.c[0]);
  while (a2 - a1 > Math.PI) a2 -= Math.PI * 2;
  while (a1 - a2 > Math.PI) a2 += Math.PI * 2;
  const out: P2[] = [];
  for (let i = 0; i <= 24; i++) { const a = a1 + ((a2 - a1) * i) / 24; out.push([k.c[0] + Math.cos(a) * (CORNER_R + w), k.c[1] + Math.sin(a) * (CORNER_R + w)]); }
  return out;
}
const corner = (key: Corner['key']) => CORNERS.find((k) => k.key === key)!;

/** the paint: white lines and arrows, yellow edge lines, as flat triangles a little over the road */
export function okjPaint(o: { arrows?: boolean; stops?: boolean } = {}): { white: Buf; yellow: Buf } {
  const white = buf(), yellow = buf();
  const W = 0.14, DASH: [number, number] = [3, 6], GUIDE: [number, number] = [1.5, 1.5];
  const nw = corner('nw'), ne = corner('ne'), sw = corner('sw'), se = corner('se');

  // ---- the N4's lane lines: line k between lane k and k + 1, counted from the median, where both lanes exist ----
  // zone 1 (west, north): k 1-3 down to the stop line, k 4 (the corner lane's edge) down to the corner, then round it
  for (let k = 1; k <= 4; k++) {
    const zEnd = k < 4 ? STOP.n : nw.t1[1];
    for (const r of alongZ((z) => westInner(z) - k * wLane(z), WIDEN.z0, zEnd, (z) => westLanes(z) >= k + 0.6)) line(white, r, W, ...DASH);
  }
  line(white, cornerGuide(nw, LANE), W, ...GUIDE);
  // zone 2 (east, north): k 1-2 up from the crossing, k 3 (the joining lane's edge) from the corner up to the merge
  for (let k = 1; k <= 3; k++) {
    const zEnd = k < 3 ? ZEBRA.n[0] : ne.t1[1];
    for (const r of alongZ((z) => eastInner(z) + k * eLane(z), WIDEN.z0, zEnd, (z) => eastLanes(z) >= k + 0.6)) line(white, r, W, ...DASH);
  }
  line(white, cornerGuide(ne, LANE), W, ...GUIDE);
  // zone 4 (east, south): k 1-3 from the stop line, k 4 (the corner lane's edge) from the corner
  for (let k = 1; k <= 4; k++) {
    const zStart = k < 4 ? STOP.s : se.t1[1];
    for (const r of alongZ((z) => eastInner(z) + k * eLane(z), zStart, WIDEN.z1, (z) => eastLanes(z) >= k + 0.6)) line(white, r, W, ...DASH);
  }
  line(white, cornerGuide(se, LANE), W, ...GUIDE);
  // zone 5 (west, south): k 1-2 from the crossing, k 3 (the outer lane from zone 6) from the corner to the merge
  for (let k = 1; k <= 3; k++) {
    const zStart = k < 3 ? ZEBRA.s[1] : sw.t1[1];
    for (const r of alongZ((z) => westInner(z) - k * wLane(z), zStart, WIDEN.z1, (z) => westLanes(z) >= k + 0.6)) line(white, r, W, ...DASH);
  }
  line(white, cornerGuide(sw, LANE), W, ...GUIDE);
  // the bay's edge along the asphalt: a broken line, the bay itself concrete
  for (const r of alongZ(wOuter, ZONES[5].bay[0], ZONES[5].bay[3], (z) => bayWidth(z) > 0.3)) line(white, r, 0.2, 1, 1);

  // ---- the arms: the direction divider, the lane lines, the corner lanes' edges ----
  const hfA = (x: number) => Math.hypot(1, (clz(x + 3) - clz(x - 3)) / 6);
  const laneZ = (x: number, n: number) => clz(x) + n * armLane(x) * hfA(x);
  // Jubilee Drive (zone 6): the divider solid from the crossing out to the mapped road; north: 1 out + the corner
  // lane from zone 1; south: 2 in + the corner lane to zone 5
  for (const r of alongX(clz, ARM.x0 + 0.5, ZEBRA.w[0])) line(white, r, 0.16);
  for (const r of alongX((x) => laneZ(x, -1), ARM.x0, nw.t2[0], (x) => armLanes(x)[0] >= 1.6)) line(white, r, W, ...DASH);
  for (const r of alongX((x) => laneZ(x, 1), ARM.x0, STOP.w, (x) => armLanes(x)[1] >= 1.6)) line(white, r, W, ...DASH);
  for (const r of alongX((x) => laneZ(x, 2), ARM.x0, sw.t2[0], (x) => armLanes(x)[1] >= 2.6)) line(white, r, W, ...DASH);
  // La Bawaleshi Road (zone 3): north: 2 in + the corner lane to zone 2; south: 1 out + the corner lane from zone 4
  for (const r of alongX(clz, ZEBRA.e[1], ARM.x1 - 0.5)) line(white, r, 0.16);
  for (const r of alongX((x) => laneZ(x, -1), STOP.e, ARM.x1, (x) => armLanes(x)[0] >= 1.6)) line(white, r, W, ...DASH);
  for (const r of alongX((x) => laneZ(x, -2), ne.t2[0], ARM.x1, (x) => armLanes(x)[0] >= 2.6)) line(white, r, W, ...DASH);
  for (const r of alongX((x) => laneZ(x, 1), se.t2[0], ARM.x1, (x) => armLanes(x)[1] >= 1.6)) line(white, r, W, ...DASH);

  // ---- the stop lines across each approach's middle lanes ----
  const stopN = STOP.n, stopS = STOP.s;
  if (o.stops !== false) {
  line(white, [[westInner(stopN) - 4 * wLane(stopN), stopN], [westInner(stopN), stopN]], 0.4);
  line(white, [[eastInner(stopS), stopS], [eastInner(stopS) + 4 * eLane(stopS), stopS]], 0.4);
  line(white, [[STOP.w, clz(STOP.w)], [STOP.w, laneZ(STOP.w, 2)]], 0.4);
  line(white, [[STOP.e, laneZ(STOP.e, -2)], [STOP.e, clz(STOP.e)]], 0.4);
  }

  // ---- the pedestrian crossings on the four arms, stripes 0.5 m wide every 1.1 m, the full width of the road ----
  const zebraZ = ([z0, z1]: P2) => { const zc = (z0 + z1) / 2; for (let x = wOuter(zc) + 0.4; x + 0.5 < eOuter(zc) - 0.3; x += 1.1) line(white, [[x + 0.25, z0], [x + 0.25, z1]], 0.5); };
  const zebraX = ([x0, x1]: P2) => { const xc = (x0 + x1) / 2, [a, b] = armEdges(xc); for (let z = a + 0.4; z + 0.5 < b - 0.3; z += 1.1) line(white, [[x0, z + 0.25], [x1, z + 0.25]], 0.5); };
  if (o.stops !== false) { zebraZ(ZEBRA.n); zebraZ(ZEBRA.s); zebraX(ZEBRA.w); zebraX(ZEBRA.e); }

  // ---- arrows: the corner lanes turn right (D-01's red routes); the middle lanes keep the earlier pattern (left by the
  // median or the divider, straight in the others), which D-01 does not settle (the brief, unmeasured details) ----
  const ARROW: Record<'S' | 'L' | 'R', P2[]> = {
    S: [[0, -0.15], [3.2, -0.15], [3.2, 0.15], [0, -0.15], [3.2, 0.15], [0, 0.15], [3.2, -0.5], [4.5, 0], [3.2, 0.5]],
    L: [[0, -0.15], [2.5, -0.15], [2.5, 0.15], [0, -0.15], [2.5, 0.15], [0, 0.15], [2.2, -1.0], [2.5, -1.0], [2.5, 0.15], [2.2, -1.0], [2.5, 0.15], [2.2, 0.15], [1.85, -1.0], [2.35, -1.7], [2.85, -1.0]],
    R: [[0, -0.15], [2.5, -0.15], [2.5, 0.15], [0, -0.15], [2.5, 0.15], [0, 0.15], [2.2, -0.15], [2.5, -0.15], [2.5, 1.0], [2.2, -0.15], [2.5, 1.0], [2.2, 1.0], [1.85, 1.0], [2.35, 1.7], [2.85, 1.0]],
  };
  /** an arrow at (x, z) pointing along (fx, fz) (a: forward, b: to the driver's right) */
  const arrow = (kind: 'S' | 'L' | 'R', x: number, z: number, fx: number, fz: number) => {
    if (o.arrows === false) return;
    const p = ARROW[kind].map(([a, b]): P2 => [x + fx * (a - 2.2) - fz * b, z + fz * (a - 2.2) + fx * b]);
    for (let i = 0; i < p.length; i += 3) tri(white, p[i], p[i + 1], p[i + 2], Y);
  };
  for (const back of [7, 28]) {
    // zone 1 (heading south, +z: the driver's right is west, -x)
    const z1 = STOP.n - back, hz = hfN4(z1);
    for (let k = 0; k < 5; k++) arrow(k === 0 ? 'L' : k === 4 ? 'R' : 'S', westInner(z1) - (k + 0.5) * wLane(z1), z1, 0, 1);
    // zone 4 (heading north, -z: the driver's right is east)
    const z4 = STOP.s + back;
    for (let k = 0; k < 5; k++) arrow(k === 0 ? 'L' : k === 4 ? 'R' : 'S', eastInner(z4) + (k + 0.5) * eLane(z4), z4, 0, -1);
    void hz;
  }
  // zone 6 (heading east: the driver's right is south) and zone 3 (heading west: right is north)
  { const x = STOP.w - 7; for (let k = 0; k < 3; k++) arrow(k === 0 ? 'L' : k === 2 ? 'R' : 'S', x, laneZ(x, k + 0.5), 1, 0); }
  { const x = STOP.e + 7; for (let k = 0; k < 3; k++) arrow(k === 0 ? 'L' : k === 2 ? 'R' : 'S', x, laneZ(x, -(k + 0.5)), -1, 0); }

  // ---- yellow: along the median's kerbs (and on from its pulled-back tips to the junction, the two directions' divide)
  // and along the carriageways' outer kerbs, not across the junction ----
  for (const r of alongZ((z) => westInner(z) - 0.3, WIDEN.z0 + WIDEN.ramp, STOP.n)) line(yellow, r, 0.16);
  for (const r of alongZ((z) => eastInner(z) + 0.3, WIDEN.z0 + WIDEN.ramp, ZEBRA.n[0])) line(yellow, r, 0.16);
  for (const r of alongZ((z) => westInner(z) - 0.3, ZEBRA.s[1], WIDEN.z1 - WIDEN.ramp)) line(yellow, r, 0.16);
  for (const r of alongZ((z) => eastInner(z) + 0.3, STOP.s, WIDEN.z1 - WIDEN.ramp)) line(yellow, r, 0.16);
  for (const r of alongZ((z) => westEdge(z) + 0.35, WIDEN.z0 + WIDEN.ramp, nw.t1[1])) line(yellow, r, 0.16);
  for (const r of alongZ((z) => eOuter(z) - 0.35, WIDEN.z0 + WIDEN.ramp, ne.t1[1])) line(yellow, r, 0.16);
  for (const r of alongZ((z) => westEdge(z) + 0.35, sw.t1[1], WIDEN.z1 - WIDEN.ramp)) line(yellow, r, 0.16);
  for (const r of alongZ((z) => eOuter(z) - 0.35, se.t1[1], WIDEN.z1 - WIDEN.ramp)) line(yellow, r, 0.16);
  void XM; void eInner; void wInner;
  return { white, yellow };
}

/** the meshes: the bay (concrete) and the paint, for world.ts to add with the roads */
export function okjMeshes(concreteMap: THREE.Texture) {
  const geo = (b: Buf) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3)); g.setIndex(b.idx); g.computeVertexNormals(); return g; };
  const { bay } = okjSurfaces();
  const bg = geo(bay);
  const p = bg.attributes.position, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { uv[i * 2] = p.getX(i) / 4; uv[i * 2 + 1] = p.getZ(i) / 4; }
  bg.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const bayMat = new THREE.MeshStandardMaterial({ color: '#d8d4cb', map: concreteMap, roughness: 0.92, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 });
  const bayMesh = new THREE.Mesh(bg, bayMat);
  bayMesh.name = 'okponglo-bus-bay';
  bayMesh.receiveShadow = true;
  const { white, yellow } = okjPaint();
  const paint = [[white, '#e9e6dc'], [yellow, '#e2b62a']].map(([b, col]) => {
    const m = new THREE.Mesh(geo(b as Buf), new THREE.MeshStandardMaterial({ color: col as string, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 }));
    m.receiveShadow = true;
    m.name = 'okponglo-paint';
    return m;
  });
  return { bay: bayMesh, paint, material: bayMat };
}
