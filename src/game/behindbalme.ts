// Behind the Balme Library, from the owner's reference PDF of game views beside street photos
// (docs/CAMPUS_REFERENCE_AUDIT.md, pages 25-34; block engine: blocks.ts; the terrace: relief.ts):
//
// - The Chemistry Department Extension (pages 25-29; its ranges are modelled in physics.ts) stands about 1 m up behind
//   a retaining wall of rubble stone with a concrete cap, a thick clipped hedge along its top; below it a strip of
//   lawn, the kerbed pavement and the road, tall grey street lamps on single arms; on the north side toward Plant
//   Biology palms and young trees before the wall.
// - Across Cruise O'Brien Road from it, the uncompleted building and its hoarding, rebuilt from the owner's Kuffour
//   Quadrangle brief (pairs 4 and 5; numbers in kuffour.ts): a cream-grey concrete shell with thick piers, projecting
//   beam bands, big empty openings and a deep recess, a shallow dark hip roof with a broad pale-edged overhang; the pale
//   blue ribbed hoarding with poster clusters; brick paving round it and the apron, the kerb sweeping round the
//   corners, the open drain along the road, slim angular lights; slender drooping trees on its west. Along Cruise
//   O'Brien Road's east side the wall now stands set back above a grassy rise.
// - The Chemistry Department's two-floor building, joined to the ranges by the covered walk (pages 31-34): white over
//   a red-brown dado; along its west front toward the drive a verandah on slender white posts under a lean-to of
//   clay tiles, a band of louvres over its openings; the upper floor above it with a row of windows under a hipped
//   tile roof; at the north end a portico of three tall square columns rising the height of both floors before the
//   glazed doors, louvre panels high between them.
import * as THREE from 'three';
import { box, merge, speckle, type Part } from './modelkit';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { concrete, stoneMesh } from './concrete';
import { garden } from './gardens';
import { hipRoof } from './waccbip';
import { SOLIDS } from './solids';
import { KQ, croX } from './kuffour';

const TILE = '#a5502f', DADO = '#8e2f22', WHITE = '#f2f0ea';
const hip = { gw: 0, tri: false };
const frame = (O: [number, number]) => ({
  X: (x: number) => x - O[0], Z: (z: number) => z - O[1],
  B: (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(x0 - O[0], x1 - O[0], y0, y1, z0 - O[1], z1 - O[1]),
  M: (x: number, z: number): [number, number] => [x - O[0], z - O[1]],
});
const finish = (k: Kit, c: Part[], st: Part[] = [], strength = 0.25) => {
  stoneMesh(k, st);
  if (!c.length) return;
  const m = new THREE.Mesh(merge(c), concrete(strength));
  m.castShadow = true; m.receiveShadow = true;
  k.meshes.push(m);
};
/** a tall grey street lamp on a single arm reaching out over the road (dx: which way the arm points in x) */
const lamp = (c: Part[], B: ReturnType<typeof frame>['B'], X: (x: number) => number, Z: (z: number) => number, x: number, z: number, dx: number, dz: number) => {
  c.push([new THREE.CylinderGeometry(0.07, 0.12, 8.5, 8).translate(X(x), 4.25, Z(z)), '#9a9ea2']);
  c.push([B(Math.min(x, x + dx * 1.6) - 0.04, Math.max(x, x + dx * 1.6) + 0.04, 8.35, 8.45, Math.min(z, z + dz * 1.6) - 0.04, Math.max(z, z + dz * 1.6) + 0.04), '#9a9ea2']);
  c.push([B(x + dx * 1.6 - 0.25, x + dx * 1.6 + 0.25, 8.25, 8.4, z + dz * 1.6 - 0.12, z + dz * 1.6 + 0.12), '#e9e7da']);
  SOLIDS.add(x, z, 0.18);
};
const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, WHITE) };

// ---------- the Chemistry Department Extension's retaining wall, hedge, pavement and lamps ----------
const CXO: [number, number] = [100, -158];
const WALL_W = KQ.croEast.wallX, WALL_N = -153.2;
const cxGrounds: Spec = (() => {
  const { X, Z, B } = frame(CXO);
  return {
    name: 'Chemistry Department Extension terrace', axis: [1, 0], origin: CXO, storey: 3, style: PLAIN, roofColor: TILE, fascia: WHITE, pitch: 0.3,
    blocks: [],
    keep: [[X(100.5), X(108), Z(-153.5), Z(-96)], [X(100.5), X(208), Z(-159), Z(-152.5)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      // the wall of rubble stone up to the terrace, its concrete cap; the hedge along its top. Along Cruise O'Brien Road
      // it stands back from the road behind a narrow footway and a grassy rise (the owner's Kuffour Quadrangle brief,
      // pair 5; relief.ts raises the rise), so it shows only its upper part
      st.push([B(WALL_W, WALL_W + 0.45, 0, 1.15, WALL_N, -97.0), '#ffffff'], [B(WALL_W, 207.5, 0, 1.15, WALL_N, WALL_N + 0.45), '#ffffff']);
      c.push([B(WALL_W - 0.05, WALL_W + 0.5, 1.15, 1.25, WALL_N - 0.05, -97.0), '#c9c4b8'], [B(WALL_W - 0.05, 207.5, 1.15, 1.25, WALL_N - 0.05, WALL_N + 0.5), '#c9c4b8']);
      // the hedge: dense and irregular, its top rising and falling, darker and lighter clumps
      k.plain.push([B(WALL_W + 0.6, WALL_W + 1.9, 1.0, 2.2, WALL_N + 0.6, -98.0), '#2f5a26'], [B(WALL_W + 0.6, 206.5, 1.0, 2.35, WALL_N + 0.6, WALL_N + 2.0), '#2f5a26']);
      for (let z = WALL_N + 1; z < -98.5; z += 0.8) { const v = Math.sin(z * 1.7) * 0.5 + Math.sin(z * 0.43) * 0.5; k.plain.push([new THREE.IcosahedronGeometry(0.62 + v * 0.12, 0).scale(1, 0.85 + v * 0.25, 1.25).translate(X(WALL_W + 1.25), 2.25 + v * 0.3, Z(z)), (Math.round(z * 1.3) % 3) ? '#356329' : '#2b5322']); }
      for (let x = WALL_W + 1.6; x < 206; x += 1.1) k.plain.push([new THREE.IcosahedronGeometry(0.72, 0).scale(1.2, 0.8, 1).translate(X(x), 2.45 + ((x * 7) % 3) * 0.06, Z(WALL_N + 1.3)), (Math.round(x) % 3) ? '#356329' : '#2b5322']);
      for (let z = WALL_N; z <= -97; z += 0.4) SOLIDS.add(WALL_W + 0.22, z, 0.3);
      for (let x = WALL_W; x <= 207.5; x += 0.4) SOLIDS.add(x, WALL_N + 0.22, 0.3);
      // from the road out: its edge, a shallow gutter strip, the narrow footway; the grass rises beyond it to the wall
      const re = (z: number) => croX(z) + 3.1;
      for (let z = WALL_N - 3; z < -97; z += 2) {
        const z1 = Math.min(z + 2, -97), a = re(z), b = re(z1);
        const strip = (o0: number, o1: number, y: number, col: string) => {
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.Float32BufferAttribute([X(a + o0), y, Z(z), X(a + o1), y, Z(z), X(b + o0), y, Z(z1), X(b + o1), y, Z(z1)], 3));
          geo.setIndex([0, 1, 2, 1, 3, 2]); geo.computeVertexNormals(); c.push([geo, col]);
        };
        strip(0, 0.25, 0.025, '#8f8c86'); strip(0.25, KQ.croEast.foot, 0.06, '#aaa59b');
      }
      c.push([B(re(-130) + KQ.croEast.foot - 0.02, re(-130) + KQ.croEast.foot + 0.1, 0, 0.1, WALL_N - 3, -97), '#c9c5bb']);
      // slim angular street lights along the footway
      for (const z of [-140, -110]) angularLamp(c, X, Z, re(z) + 0.6, 0.06, z, -1, 0, 7.6);
      // the north side toward Plant Biology: palms and young trees before the wall, the lamps along J.K.M. Hodasi Road
      k.plain.push([B(104, 207.5, 0.02, 0.05, -159.2, WALL_N), '#5f7d3a']);
      const g = garden([100, 210, -162, -95]); g.reseed(251);
      for (let x = 112; x < 205; x += 11) g.palm(k, X(x), Z(-155.6), 3.4 + (x % 3) * 0.4);
      for (let x = 117.5; x < 200; x += 22) g.tree(k, X(x), Z(-156.4), 0.8);
      for (let x = 125; x < 205; x += 30) lamp(c, B, X, Z, x, -158.8, 0, -1);
      finish(k, c, st);
    },
  };
})();

// ---------- the uncompleted building across the road, in its blue hoarding (the owner's Kuffour Quadrangle brief,
// pairs 4 and 5; the adjustable numbers in kuffour.ts) ----------
const UO: [number, number] = [82, -125];
/** a slender tree of drooping foliage (pair 3: the tall narrow trees screening the hoarding, not tiers of cones): a
 *  straight trunk to near the top, hanging tufts of leaves round it in irregular clumps, wider low, thin at the top */
export function mastTree(parts: Part[], X: (x: number) => number, Z: (z: number) => number, x: number, z: number, h: number, seed: number) {
  const r = (i: number) => { const v = Math.sin(seed * 91.7 + i * 12.9898) * 43758.5453; return v - Math.floor(v); };
  parts.push([new THREE.CylinderGeometry(0.07, 0.15, h * 0.92, 6).translate(X(x), h * 0.46, Z(z)), '#4d3d30']);
  const n = 34;
  for (let i = 0; i < n; i++) {
    const t = 0.12 + (i / n) * 0.86, a = r(i) * Math.PI * 2, out = (0.25 + r(i + 50) * 0.75) * (1.15 - t) * 1.35;
    const len = 0.9 + r(i + 90) * 1.1, wid = 0.35 + r(i + 130) * 0.25;
    // a tuft: a narrow cone hanging point down, a little splayed
    const g = new THREE.ConeGeometry(wid, len, 5).rotateX(Math.PI).rotateZ((r(i + 170) - 0.5) * 0.5).translate(X(x) + Math.cos(a) * out, h * t + len * 0.1, Z(z) + Math.sin(a) * out);
    parts.push([g, ['#2c4423', '#355229', '#273d1f', '#3d5a2c'][(i + seed) % 4]]);
  }
  parts.push([new THREE.ConeGeometry(0.22, 1.0, 5).translate(X(x) + (r(7) - 0.5) * 0.2, h + 0.3, Z(z)), '#355229']);
}
/** a slim angular street light (pairs 4 and 5): a grey pole, a short arm bent out at an angle, a flat head */
export function angularLamp(c: Part[], X: (x: number) => number, Z: (z: number) => number, x: number, y: number, z: number, dx: number, dz: number, h = 7.2) {
  c.push([new THREE.CylinderGeometry(0.055, 0.09, h, 8).translate(X(x), y + h / 2, Z(z)), '#9da1a5']);
  const ax = x + dx * 1.1, az = z + dz * 1.1, L = Math.hypot(1.1, 0.5);
  const arm = new THREE.CylinderGeometry(0.035, 0.035, L, 6).translate(0, L / 2, 0);
  arm.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx * 1.1, 0.5, dz * 1.1).normalize()));
  c.push([arm.translate(X(x), y + h - 0.05, Z(z)), '#9da1a5']);
  c.push([box(X(ax) - 0.32, X(ax) + 0.32, y + h + 0.32, y + h + 0.45, Z(az) - 0.14, Z(az) + 0.14).rotateY(0), '#7d8185'], [box(X(ax) - 0.28, X(ax) + 0.28, y + h + 0.3, y + h + 0.32, Z(az) - 0.11, Z(az) + 0.11), '#fff2cc']);
  SOLIDS.add(x, z, 0.15);
};
const unfinished: Spec = (() => {
  const { X, Z, B, M } = frame(UO);
  const S = KQ.shell, Hd = KQ.hoard;
  return {
    name: 'uncompleted building behind the Balme Library', axis: [1, 0], origin: UO, storey: S.storey, style: PLAIN, roofColor: '#34302d', fascia: '#d9d4c8', pitch: 0.25,
    blocks: [],
    keep: [[X(66), X(Hd.x1 + 4), Z(-160), Z(-88.5)]],
    extras: (k: Kit) => {
      const c: Part[] = [], dark: Part[] = [], trees: Part[] = [];
      const ST = S.storey, top = S.floors * ST + 0.3, e = top + 0.3;
      // ----- the shell (pair 4): a concrete frame gone cream-grey, thick piers, the floor slabs' edges standing out as
      // beam bands, walls of bare blockwork with big empty openings, a deep recess at the upper floor's east end; dark
      // inside (no interior is invented: a dark core behind the openings)
      const CON = '#cfc6b2', BLK = '#c2b9a5', BAND = '#d8d0bd';
      dark.push([B(S.x0 + 0.6, S.x1 - 0.6, 0.3, top, S.z0 + 0.6, S.z1 - 0.6), '#2b2622']);
      for (let f = 0; f <= S.floors; f++) { const y = f * ST; c.push([B(S.x0 - 0.38, S.x1 + 0.38, y, y + 0.42, S.z0 - 0.38, S.z1 + 0.38), f ? BAND : '#b9b09c']); }
      const recess = { x0: S.x1 - 4.2, depth: 2.4 };
      const faces: { a0: number; a1: number; at: number; alongX: boolean; out: number }[] = [
        { a0: S.x0, a1: S.x1, at: S.z1, alongX: true, out: 1 }, { a0: S.x0, a1: S.x1, at: S.z0, alongX: true, out: -1 },
        { a0: S.z0, a1: S.z1, at: S.x0, alongX: false, out: -1 }, { a0: S.z0, a1: S.z1, at: S.x1, alongX: false, out: 1 },
      ];
      for (const F of faces) {
        const n = Math.max(2, Math.round((F.a1 - F.a0) / 3.6)), bay = (F.a1 - F.a0) / n;
        for (let i = 0; i <= n; i++) {
          const t = F.a0 + bay * i;
          const [x0, x1, z0, z1] = F.alongX ? [t - 0.3, t + 0.3, F.at - 0.3, F.at + 0.3] : [F.at - 0.3, F.at + 0.3, t - 0.3, t + 0.3];
          c.push([B(x0 - 0.08, x1 + 0.08, 0, top, z0 - 0.08, z1 + 0.08), CON]);
          SOLIDS.add((x0 + x1) / 2, (z0 + z1) / 2, 0.4);
        }
        for (let i = 0; i < n; i++) for (let f = 0; f < S.floors; f++) {
          const b0 = F.a0 + bay * i + 0.3, b1 = F.a0 + bay * (i + 1) - 0.3, y0 = f * ST + 0.32, y1 = (f + 1) * ST;
          // the south face's upper floor at its east end stands back behind the line of piers: a deep shadowed recess
          const inRecess = F.alongX && F.out > 0 && f === S.floors - 1 && b0 >= recess.x0 - 0.4;
          const wd = inRecess ? recess.depth : 0.12;
          const W = (a: number, b: number, ya: number, yb: number) => {
            const d0 = F.at - F.out * wd, d1 = d0 - F.out * 0.22;
            c.push([F.alongX ? B(a, b, ya, yb, Math.min(d0, d1), Math.max(d0, d1)) : B(Math.min(d0, d1), Math.max(d0, d1), ya, yb, a, b), BLK]);
          };
          // big empty openings: most bays nearly open between sill and beam, a few walled with a smaller hole
          const wide = (i + f + (F.alongX ? 0 : 1)) % 3 !== 2;
          const sill = y0 + (wide ? 0.1 : 0.9), head = y1 - (wide ? 0.25 : 0.7), m = wide ? 0.12 : (b1 - b0) * 0.28;
          W(b0, b1, y0, sill); W(b0, b1, head, y1); W(b0, b0 + m, sill, head); W(b1 - m, b1, sill, head);
          if (f === 0 && !inRecess) for (let t = b0; t <= b1; t += 0.5) SOLIDS.add(F.alongX ? t : F.at, F.alongX ? F.at : t, 0.3);
        }
      }
      // the recess's floor edge and side wall
      c.push([B(recess.x0 - 0.3, S.x1, ST, ST + 0.32, S.z1 - recess.depth, S.z1), BAND]);
      // ----- the roof: a shallow dark hip with a broad overhang, its edge a deep pale fascia
      const o = S.over;
      k.roof.c = new THREE.Color('#34302d');
      hipRoof(k, M, S.x0 - o, S.x1 + o, S.z0 - o, S.z1 + o, e, 0.3, (S.x1 - S.x0) >= (S.z1 - S.z0) ? 'x' : 'z', [hip, hip], c, '#d9d4c8');
      for (const [a, b, p, q] of [[S.x0 - o, S.x1 + o, S.z0 - o - 0.05, S.z0 - o + 0.05], [S.x0 - o, S.x1 + o, S.z1 + o - 0.05, S.z1 + o + 0.05], [S.x0 - o - 0.05, S.x0 - o + 0.05, S.z0 - o, S.z1 + o], [S.x1 + o - 0.05, S.x1 + o + 0.05, S.z0 - o, S.z1 + o]] as [number, number, number, number][]) c.push([B(a, b, e - 0.26, e + 0.03, p, q), '#ddd8cc']);
      // the soffit under the overhang, shadowed
      dark.push([B(S.x0 - o, S.x1 + o, e - 0.02, e, S.z0 - o, S.z1 + o), '#5a5550']);
      // the site's bare ground inside the hoarding
      k.plain.push([B(Hd.x0, Hd.x1, 0.02, 0.05, Hd.z0, Hd.z1), '#8f7a62']);
      for (let i = 0; i < 40; i++) { const x = Hd.x0 + 1 + ((i * 37) % 97) / 97 * (Hd.x1 - Hd.x0 - 2), z = Hd.z0 + 1 + ((i * 61) % 89) / 89 * (Hd.z1 - Hd.z0 - 2); k.plain.push([new THREE.IcosahedronGeometry(0.35 + (i % 4) * 0.12, 0).scale(1.3, 0.5, 1.2).translate(X(x), 0.1, Z(z)), ['#7a6a4e', '#5f6b3a', '#8b7a5c'][i % 3]]); }

      // ----- the hoarding: pale blue corrugated sheet, ribbed, its panels varying a little in tint, worn and dented in
      // places, posts at the corners; poster clusters and torn remnants on the road sides (nothing readable)
      {
        const pts: [number, number][] = [[Hd.x0, Hd.z0], [Hd.x1, Hd.z0], [Hd.x1, Hd.z1], [Hd.x0, Hd.z1]];
        const tints = ['#8fb4d4', '#97bbd8', '#89aecf', '#9cbfdb', '#a9c1d1'];
        let seed = 3;
        const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
        for (let i = 0; i < 4; i++) {
          const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % 4];
          const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len, ox = uz, oz = -ux, ang = -Math.atan2(bz - az, bx - ax);
          const panels = Math.ceil(len / 1.05);
          for (let j = 0; j < panels; j++) {
            const t0 = (j / panels) * len, t1 = ((j + 1) / panels) * len, tm = (t0 + t1) / 2, h = Hd.h + (rnd() - 0.5) * 0.06;
            const worn = rnd() < 0.12;
            c.push([new THREE.BoxGeometry(t1 - t0 + 0.02, h, 0.04).rotateY(ang).translate(X(ax + ux * tm), h / 2, Z(az + uz * tm)), worn ? '#b3c3cc' : tints[(rnd() * tints.length) | 0]]);
            for (let t = t0 + 0.08; t < t1; t += 0.16) for (const s2 of [1, -1]) c.push([new THREE.BoxGeometry(0.05, h, 0.03).rotateY(ang).translate(X(ax + ux * t + ox * 0.03 * s2), h / 2, Z(az + uz * t + oz * 0.03 * s2)), '#7b9fc0']);
          }
          for (let t = 0; t <= len; t += 3) c.push([new THREE.BoxGeometry(0.09, Hd.h + 0.1, 0.09).translate(X(ax + ux * t - ox * 0.1), (Hd.h + 0.1) / 2, Z(az + uz * t - oz * 0.1)), '#6f7a80']);
          const n = Math.ceil(len / 0.4);
          for (let j = 0; j <= n; j++) SOLIDS.add(ax + ((bx - ax) * j) / n, az + ((bz - az) * j) / n, 0.25);
          // posters on the sides toward the roads and the apron (south, east, north): irregular clusters, some torn
          if (i === 3) continue;
          const cols = ['#d8b33a', '#2a3d78', '#b8402f', '#ece8dc', '#6a3b8c', '#2f7d55', '#e07a2f', '#1d1d1d', '#c9c1a6'];
          for (let t = 1 + rnd() * 2; t < len - 1.5; t += (i === 1 ? 1.6 : 2.6) + rnd() * 3.5) {
            const cnt = 3 + ((rnd() * 7) | 0), cw = 0.42, chh = 0.6, rows = 1 + ((rnd() * 2.2) | 0), y0 = 0.7 + rnd() * 0.4;
            for (let q = 0; q < cnt; q++) {
              const col = q % Math.ceil(cnt / rows), row = Math.floor(q / Math.ceil(cnt / rows));
              const pt = t + col * (cw + 0.04) + (rnd() - 0.5) * 0.08, py = y0 + row * (chh + 0.05) + (rnd() - 0.5) * 0.06;
              if (pt > len - 0.3 || py + chh > Hd.h - 0.1) continue;
              const torn = rnd() < 0.2, w = torn ? cw * (0.4 + rnd() * 0.4) : cw, hh = torn ? chh * (0.3 + rnd() * 0.5) : chh;
              const px = ax + ux * pt + ox * 0.07, pz = az + uz * pt + oz * 0.07;
              c.push([new THREE.BoxGeometry(w, hh, 0.01).rotateY(ang).translate(X(px), py + hh / 2, Z(pz)), torn ? '#e4e0d4' : cols[(rnd() * cols.length) | 0]]);
              if (!torn && rnd() < 0.5) c.push([new THREE.BoxGeometry(w * 0.8, hh * 0.25, 0.012).rotateY(ang).translate(X(px + ox * 0.004), py + hh * 0.7, Z(pz + oz * 0.004)), cols[(rnd() * cols.length) | 0]]);
            }
          }
        }
      }
      // ----- the ground round it: brick pavers between the hoarding and the kerb, the broad apron to the road on the
      // south; the raised kerb sweeping round the corners; along Cruise O'Brien Road a narrow footway and the open drain
      // beside the asphalt (kept outside the riding line), along Hodasi Road a narrow footway
      {
        const re = (z: number) => croX(z) - 3.8, kx = (z: number) => re(z) - 0.55, R = KQ.apron.kerbR, zs = KQ.apron.z1, zn = -162 + 3.8 + 0.2;
        const kerb: [number, number][] = [];
        for (let x = Hd.x0 - 3; x < kx(zs) - R; x += 1.5) kerb.push([x, zs]);
        for (let i = 0; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); kerb.push([kx(zs) - R + Math.sin(a) * R, zs - R + Math.cos(a) * R]); }
        for (let z = zs - R - 1.5; z > zn + R; z -= 2) kerb.push([kx(z), z]);
        for (let i = 0; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); kerb.push([kx(zn) - R + Math.cos(a) * R, zn + R - Math.sin(a) * R]); }
        for (let x = kx(zn) - R - 1.5; x > Hd.x0 - 3; x -= 1.5) kerb.push([x, zn]);
        for (let i = 0; i < kerb.length - 1; i++) {
          const [ax, az] = kerb[i], [bx, bz] = kerb[i + 1], len = Math.hypot(bx - ax, bz - az);
          c.push([new THREE.BoxGeometry(len + 0.02, 0.2, 0.2).rotateY(-Math.atan2(bz - az, bx - ax)).translate(X((ax + bx) / 2), 0.07, Z((az + bz) / 2)), i % 2 ? '#d6d2c8' : '#cbc7bc']);
        }
        // the brick paving inside the kerb, round the hoarding: a herringbone of small pavers suggested by their joints
        const inBrick = (x: number, z: number) => z > zn + 0.1 && z < zs - 0.1 && x > Hd.x0 - 3 && x < kx(z) - 0.1 && !(x > Hd.x0 && x < Hd.x1 && z > Hd.z0 && z < Hd.z1) &&
          !(x > kx(zs) - R && z > zs - R && Math.hypot(x - (kx(zs) - R), z - (zs - R)) > R - 0.1) && !(x > kx(zn) - R && z < zn + R && Math.hypot(x - (kx(zn) - R), z - (zn + R)) > R - 0.1);
        const pos: number[] = [], idx: number[] = [], col: number[] = [], uv: number[] = [];
        for (let z = zn; z < zs; z += 0.5) for (let x = Hd.x0 - 3; x < kx(z); x += 0.5) {
          if (!inBrick(x + 0.25, z + 0.25)) continue;
          const v = 0.55 + ((Math.sin(x * 12.9 + z * 78.2) * 43758.5) % 1 + 1) % 1 * 0.08, b = pos.length / 3;
          for (const [px, pz] of [[x, z], [x + 0.5, z], [x, z + 0.5], [x + 0.5, z + 0.5]]) { pos.push(X(px), 0.045, Z(pz)); uv.push(px, pz); col.push(v ** 2.2 * 1.25, (v * 0.8) ** 2.2 * 1.2, (v * 0.66) ** 2.2 * 1.2); }
          idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
        const brick = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, map: paverTex(), roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
        brick.receiveShadow = true; k.meshes.push(brick);
        // the open drain along Cruise O'Brien Road beside the asphalt (outside the riding line), the asphalt from it to
        // the road's mapped edge
        for (let z = zn + R; z < zs - R; z += 2) {
          const z1 = Math.min(z + 2, zs - R), a = re(z), b = re(z1);
          const strip = (o0: number, o1: number, y: number, col: string) => {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute([X(a + o0), y, Z(z), X(a + o1), y, Z(z), X(b + o0), y, Z(z1), X(b + o1), y, Z(z1)], 3));
            geo.setIndex([0, 2, 1, 1, 2, 3]); geo.computeVertexNormals(); c.push([geo, col]);
          };
          strip(-0.47, -0.08, 0.015, '#1a1816'); strip(-0.52, -0.47, 0.06, '#9c978e'); strip(-0.08, -0.03, 0.06, '#9c978e');
          strip(-0.03, 0.75, 0.02, '#4a4a4c');
        }
        // the asphalt sweeping round inside the kerb's curves at the two corners
        k.plain.push([B(kx(zn) - R, re(zn) + 0.75, 0.018, 0.03, -162 + 3.1, zn + R), '#4a4a4c'], [B(kx(zs) - R, re(zs) + 0.75, 0.018, 0.03, zs - R, -88 + 2.3), '#4a4a4c']);
        // along Hodasi Road: asphalt from the kerb to the road's mapped edge
        k.plain.push([B(Hd.x0 - 3, kx(zn) - R + 0.5, 0.02, 0.035, -162 + 3.1, zn - 0.1), '#4a4a4c']);
        // the slim angular street lights: at the apron's corner (pair 4), along the hoarding and at Hodasi Road (pair 5)
        for (const z of [-110.5, -133, -153.5]) angularLamp(c, X, Z, re(z) - 0.85, 0.06, z, 1, 0);
        // the young tree by the hoarding's north-east corner, over the sheeting (pair 5)
        const tx = Hd.x1 - 2.5, tz = Hd.z0 + 3;
        c.push([new THREE.CylinderGeometry(0.06, 0.1, 3.4, 6).translate(X(tx), 1.7, Z(tz)), '#5a4a3b']);
        for (let i = 0; i < 7; i++) trees.push([new THREE.IcosahedronGeometry(0.55 + (i % 3) * 0.15, 0).scale(1.2, 0.7, 1.2).translate(X(tx) + Math.cos(i * 1.7) * 0.8, 3.4 + (i % 3) * 0.35, Z(tz) + Math.sin(i * 1.7) * 0.8), ['#7fae45', '#6c9c3a', '#8dbb52'][i % 3]]);
        // the parked pickup on the apron (pair 4): a reference prop, removable (KQ.pickup)
        if (KQ.pickup) {
          const px = 76.5, pz = -104, P = '#2c2e31';
          c.push([B(px - 2.65, px + 2.65, 0.45, 1.15, pz - 0.92, pz + 0.92), P], [B(px - 0.9, px + 1.0, 1.15, 1.85, pz - 0.86, pz + 0.86), P]);
          dark.push([B(px - 0.85, px + 0.95, 1.2, 1.78, pz - 0.88, pz + 0.88), '#15181b']);
          c.push([B(px - 2.6, px - 0.95, 1.15, 1.28, pz - 0.9, pz - 0.82), P], [B(px - 2.6, px - 0.95, 1.15, 1.28, pz + 0.82, pz + 0.9), P], [B(px - 2.7, px - 2.6, 0.5, 1.28, pz - 0.9, pz + 0.9), P]);
          for (const [wx, wz] of [[px - 1.75, pz - 0.85], [px - 1.75, pz + 0.85], [px + 1.65, pz - 0.85], [px + 1.65, pz + 0.85]]) dark.push([new THREE.CylinderGeometry(0.42, 0.42, 0.28, 14).rotateX(Math.PI / 2).translate(X(wx), 0.42, Z(wz)), '#141414']);
          c.push([B(px + 2.62, px + 2.7, 0.55, 0.95, pz - 0.7, pz + 0.7), '#5d6166']);
          SOLIDS.add(px - 1.3, pz, 1.0); SOLIDS.add(px + 1.3, pz, 1.0);
        }
      }
      // ----- the slender trees on the hoarding's west (pair 3), leaving the end of the footpath from the west clear
      let sd = 1;
      for (let z = -151; z < -97; z += 3.4) if (Math.abs(z + 120) > 4) mastTree(trees, X, Z, 67.6 + ((sd * 7) % 3) * 0.3, z, 12 + (sd % 3) * 1.3, sd++);
      finish(k, c);
      const dm = new THREE.Mesh(merge(dark), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 })); dm.receiveShadow = true; k.meshes.push(dm);
      const tm = new THREE.Mesh(merge(trees), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 })); tm.castShadow = true; tm.receiveShadow = true; k.meshes.push(tm);
    },
  };
})();
let paverT: THREE.Texture | null = null;
/** small brick pavers: joints in a herringbone, 1 m to the texture */
function paverTex() {
  if (paverT) return paverT;
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = 'rgba(60,40,30,0.55)'; g.lineWidth = 1.5;
  for (let i = -8; i < 16; i++) for (let j = 0; j < 16; j++) {
    const x = i * 16 + j * 8, y = j * 8;
    g.strokeRect(((x % 128) + 128) % 128, y, 16, 8);
  }
  paverT = new THREE.CanvasTexture(cv); paverT.wrapS = paverT.wrapT = THREE.RepeatWrapping; paverT.colorSpace = THREE.SRGBColorSpace;
  return paverT;
}

// ---------- the Chemistry Department's two-floor building on the covered walk ----------
const CDO: [number, number] = [156.4, -22.4];
const CD: [number, number, number, number] = [151.6, 163.4, -47.9, 3.2];
const VX = 149.4;
/** white over the red-brown dado; a pair of windows to a bay (the ground floor behind the verandah, the floor over it) */
const CD_WALL: Style = {
  bay: 3.2, up: [[30, 70, 90, 116], [136, 70, 90, 116]], ground: [[40, 256 + 60, 70, 130], [146, 256 + 40, 60, 216]],
  draw: (g) => {
    render(g, '#f4f2ec');
    speckle(g, 0, 0, 256, 512, 400, ['rgba(120,116,106,0.1)', 'rgba(150,146,136,0.1)']);
    for (const x of [30, 136]) { g.fillStyle = '#1b1a18'; g.fillRect(x, 70, 90, 116); g.fillStyle = '#f4f2ec'; g.fillRect(x + 43, 70, 4, 116); g.fillRect(x, 120, 90, 4); }
    g.fillStyle = '#1f1d1a'; g.fillRect(40, 256 + 60, 70, 130); g.fillStyle = '#d8d3c6'; g.fillRect(40, 256 + 120, 70, 3);
    g.fillStyle = '#5a3b26'; g.fillRect(146, 256 + 40, 60, 216);
    g.fillStyle = DADO; g.fillRect(0, 512 - 40, 256, 40);
  },
};
const chemDept: Spec = (() => {
  const { X, Z, B, M } = frame(CDO);
  return {
    name: 'Chemistry Department, University of Ghana', axis: [1, 0], origin: CDO, storey: 3.5, style: CD_WALL, roofColor: TILE, fascia: '#efede6', pitch: 0.45, plinth: DADO,
    blocks: [{ x0: X(CD[0]), x1: X(CD[1]), z0: Z(CD[2]), z1: Z(CD[3]), floors: 2, roof: 'none' }],
    keep: [[X(146.5), X(CD[0]), Z(CD[2]), Z(CD[3])]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      const e1 = k.wallTop(1), e2 = k.wallTop(2);
      k.roof.c = new THREE.Color(TILE);
      hipRoof(k, M, CD[0] - 0.9, CD[1] + 0.9, CD[2] - 0.9, CD[3] + 0.9, e2, 0.45, 'z', [hip, hip], c, '#3a2a22');
      // the verandah along the west front: its floor a step up, slender white posts, the band of louvres over the
      // openings, the lean-to of tiles over it falling from under the upper floor's windows
      c.push([B(VX, CD[0], 0, 0.3, CD[2] + 7.5, CD[3]), '#c9c3b5'], [B(VX - 0.05, CD[0], 0, 0.3, CD[2] + 7.5, CD[3]), DADO]);
      for (let z = CD[2] + 8; z <= CD[3] - 0.2; z += 3.2) { c.push([B(VX + 0.05, VX + 0.3, 0.3, e1 - 0.5, z - 0.12, z + 0.12), '#f6f5f0']); SOLIDS.add(VX + 0.17, z, 0.2); }
      c.push([B(VX, CD[0], e1 - 0.95, e1 - 0.5, CD[2] + 7.5, CD[3]), '#f2f0ea']);
      for (let y = e1 - 0.9; y < e1 - 0.55; y += 0.09) k.plain.push([B(VX - 0.03, VX, y, y + 0.05, CD[2] + 7.5, CD[3]), '#3a3632']);
      k.roof.quad([X(VX - 0.6), e1 - 0.45, Z(CD[3] + 0.6)], [X(VX - 0.6), e1 - 0.45, Z(CD[2] + 7.5)], [X(CD[0]), e1 + 0.45, Z(CD[2] + 7.5)], [X(CD[0]), e1 + 0.45, Z(CD[3] + 0.6)]);
      k.roof.quad([X(VX - 0.6), e1 - 0.45, Z(CD[2] + 7.5)], [X(VX - 0.6), e1 - 0.45, Z(CD[3] + 0.6)], [X(CD[0]), e1 + 0.45, Z(CD[3] + 0.6)], [X(CD[0]), e1 + 0.45, Z(CD[2] + 7.5)]);
      c.push([B(VX - 0.65, VX - 0.55, e1 - 0.7, e1 - 0.42, CD[2] + 7.5, CD[3] + 0.6), '#3a2a22']);
      // the portico at the north end: three tall square columns the height of both floors, louvre panels high up
      // between them, a deep white head; the glazed doors behind with grilles; steps up
      const pz0 = CD[2], pz1 = CD[2] + 7.5;
      for (const z of [pz0 + 0.5, (pz0 + pz1) / 2, pz1 - 0.5]) { c.push([B(VX - 2.6, VX - 1.9, 0.3, e2 - 0.4, z - 0.35, z + 0.35), '#f8f7f3']); SOLIDS.add(VX - 2.25, z, 0.4); }
      c.push([B(VX - 2.8, CD[0], e2 - 0.9, e2 - 0.1, pz0 - 0.2, pz1 + 0.2), '#f8f7f3']);
      c.push([B(VX - 2.9, CD[0], 0, 0.3, pz0, pz1), '#c9c3b5'], [B(VX - 3.4, VX - 2.9, 0, 0.15, pz0, pz1), '#b9b3a5']);
      for (const [za, zb] of [[pz0 + 0.85, (pz0 + pz1) / 2 - 0.35], [(pz0 + pz1) / 2 + 0.35, pz1 - 0.85]]) {
        for (let y = e2 - 3.4; y < e2 - 1.0; y += 0.16) k.plain.push([B(VX - 2.3, VX - 2.2, y, y + 0.09, za, zb), '#3a3632']);
        k.plain.push([B(VX - 2.32, VX - 2.18, e2 - 3.45, e2 - 3.35, za, zb), '#f8f7f3']);
      }
      for (const z of [pz0 + 1.8, pz1 - 1.8]) {
        k.plain.push([B(CD[0] - 0.02, CD[0] + 0.02, 0.3, 2.6, z - 0.7, z + 0.7), '#1b1a18']);
        for (let y = 0.5; y < 2.5; y += 0.3) k.plain.push([B(CD[0] - 0.05, CD[0] - 0.02, y, y + 0.05, z - 0.65, z + 0.65), '#8a8a86']);
      }
      for (const z of [pz0 + 3.75]) k.plain.push([B(CD[0] - 0.05, CD[0], e1 + 0.3, e2 - 1.2, z - 1.2, z + 1.2), '#e6d58a']);
      // the drive looping before it, agaves and shrubs, a palm
      const g = garden([135, 170, -55, 10]); g.reseed(261);
      for (const [x, z] of [[146.2, -20], [146.5, -6]]) for (let i = 0; i < 12; i++) k.plain.push([new THREE.ConeGeometry(0.08, 1.2, 3).translate(0, 0.6, 0).rotateZ(0.6).rotateY((i / 12) * Math.PI * 2).translate(X(x), 0, Z(z)), '#6d8f5c']);
      for (const [x, z, r] of [[146.0, -30, 1.1], [146.3, -12, 0.9], [145.8, 1, 1.2]] as [number, number, number][]) k.plain.push([new THREE.IcosahedronGeometry(r, 1).scale(1.2, 0.85, 1).translate(X(x), r * 0.6, Z(z)), '#3f6a2c']);
      g.palm(k, X(144.5), Z(-44), 7.5);
      finish(k, c);
    },
  };
})();

/** behind the Balme Library: the Chemistry Extension's wall and hedge, the uncompleted building, the Chemistry
 *  Department's two-floor building */
export const behindBalmeSite = createSite('behind-balme', [cxGrounds, unfinished, chemDept]);
