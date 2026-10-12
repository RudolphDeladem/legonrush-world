// The University Fire Station at Legon and its car park by La Road (the owner's Legon Fire Station, Child Lab and E.A.
// Boateng Road brief, Pairs 3-6 and 14, the annotated aerial R3 and the game aerials G1-G5; numbers in fsplan.ts). The
// generic two- and three-storey classroom boxes the outlines produced are replaced by what the photographs show:
// - one station ensemble seen from three sides (Pairs 3-5): the low pale gable of the east building with the fire-service
//   lettering on it and the black ribbed water tank on its stand in front, the broad dark open-sided canopy on slender posts
//   over the drive, the second low pale gable of the long west building beyond it; the weathered pale boundary wall along
//   the car park with the planting at its foot, the vehicle opening on the mapped drive between pale piers, the railing
//   fence on a low wall with the SAFETY WEEK banner (Pair 4); the worn hardstanding of the yard; the low red railing and
//   its flower bed across the car park (Pair 5);
// - the small low shed beside the west building and the long low building by La Road, their own roofs;
// - the low office by the car park (Pair 6): off-white over a muted reddish-brown band, a low dark roof edge, the tall
//   pale door, barred windows with air-conditioning units under them, the block-paved strip along its front with short
//   painted posts, the hedge-lined earth access beside it, the pole and its wires;
// - La Road's east side (Pair 14): the block-paved footway behind a pale kerb, the contained drain opening at the kerb,
//   the low pale wall north of the long building.
// The canopy is a thin sheet on beams and posts, open on all sides; the drive under it stays rideable. Lettering is only
// what the photographs show legibly. Vehicles are left out (the drive stays clear).
import * as THREE from 'three';
import { BUILDINGS, NODE_XZ, ROADS, type Building } from './campusmap';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { box, merge, type Part } from './modelkit';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { Bag, hash, tuft, vnoise, wallSolids } from './enkit';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { rod, wires, type V3 } from './upsa';
import { halfOf } from './lbplan';
import { acUnit, hall, louvreMat, place, roofMeshes, textPanel, type R4 } from './fskit';
import { BOUND, CANOPY, LA, LA_ROAD, OFFICE, RAILING, ST, TANK, laOffset, laT, along } from './fsplan';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#f1efe9') };
type P2 = [number, number];
const WALL = '#eeebe3', GREY_BASE = '#cbc6ba', DARK = '#2f2a26';

// ---------- the outlines ----------
const inRing = (b: Building, x: number, z: number) => {
  let c = false;
  for (let i = 0, j = b.pts.length - 2; i < b.pts.length; j = i, i += 2) {
    const zi = b.pts[i + 1], zj = b.pts[j + 1];
    if ((zi > z) !== (zj > z) && x < ((b.pts[j] - b.pts[i]) * (z - zi)) / (zj - zi) + b.pts[i]) c = !c;
  }
  return c;
};
const at = ([x, z]: P2) => BUILDINGS.find((b) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ && inRing(b, x, z));
/** an outline as an oriented rectangle: its centre, its long axis (unit), its length and width */
function oriented(b: Building) {
  const p: P2[] = []; for (let i = 0; i < b.pts.length; i += 2) p.push([b.pts[i], b.pts[i + 1]]);
  let best = 0, ux = 1, uz = 0;
  for (let i = 0; i < p.length; i++) { const [ax, az] = p[i], [bx, bz] = p[(i + 1) % p.length], l = Math.hypot(bx - ax, bz - az); if (l > best) { best = l; ux = (bx - ax) / l; uz = (bz - az) / l; } }
  // point the axis south (or east) so a building's local x runs the same way every time
  if (uz < -1e-6 || (Math.abs(uz) < 1e-6 && ux < 0)) { ux = -ux; uz = -uz; }
  let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
  for (const [x, z] of p) { const a = x * ux + z * uz, c = -x * uz + z * ux; a0 = Math.min(a0, a); a1 = Math.max(a1, a); b0 = Math.min(b0, c); b1 = Math.max(b1, c); }
  const am = (a0 + a1) / 2, bm = (b0 + b1) / 2;
  return { cx: am * ux - bm * uz, cz: am * uz + bm * ux, ux, uz, L: a1 - a0, W: b1 - b0 };
}

// ---------- the mapped roads near the station (half widths as drawn; footways flagged) ----------
const segs: [number, number, number, number, number, number][] = [];
for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++) {
  const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
  if (Math.max(ax, bx) < 580 || Math.min(ax, bx) > 700 || Math.max(az, bz) < 280 || Math.min(az, bz) > 420) continue;
  segs.push([ax, az, bx, bz, halfOf(r), r.cls]);
}
/** distance from (x, z) to the nearest road's edge (negative on it); footways only with `paths` */
export function stClear(x: number, z: number, paths = false) {
  let best = 50;
  for (const [ax, az, bx, bz, h, cls] of segs) {
    if (cls === 4 && !paths) continue;
    const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z) - h);
  }
  return best;
}

/** block pavers in a stretcher bond: warm red-browns varying block by block (the office's frontage, La Road's footway) */
const blocks = (x: number, z: number): [number, number, number] => {
  const row = Math.floor(z / 0.1), col = Math.floor((x + (row % 2) * 0.1) / 0.2), h = hash(col, row);
  const j = Math.abs((((x + (row % 2) * 0.1) / 0.2) % 1)) < 0.07 || Math.abs((z / 0.1) % 1) < 0.08;
  return j ? [0.42, 0.36, 0.32] : [0.56 + h * 0.08, 0.36 + h * 0.05, 0.3 + h * 0.04];
};

// ======================================================================================================
// the station, its boundary and yard, the office, La Road's east side
// ======================================================================================================
const O: P2 = [655, 345];
const M = (x: number, z: number): P2 => [x - O[0], z - O[1]];
const A_OUT = at(ST.A), SHED = at(ST.shed), OFF = at(ST.office);
const station: Spec = {
  name: 'University Fire Station Legon', axis: [1, 0], origin: O, storey: 3, style: PLAIN, roofColor: '#9aa0a3', fascia: DARK, pitch: 0.2,
  replaces: [ST.A, ST.shed, ST.office],
  blocks: [],
  onGround: true,
  // the yard and the boundary's planting, the office's frontage and access, the railing's bed, La Road's east side to the
  // low wall: no generic trees, lamps or parked cars on them
  keep: [[628 - O[0], 680 - O[0], 343 - O[1], 368 - O[1]], [634 - O[0], 664 - O[0], 302 - O[1], 318.5 - O[1]], [629 - O[0], 647 - O[0], 318 - O[1], 323 - O[1]], [651 - O[0], 663 - O[0], 336.5 - O[1], 341 - O[1]], [612 - O[0], 634 - O[0], 333 - O[1], 358 - O[1]]],
  extras: (k: Kit) => {
    const b = new Bag(O), c: Part[] = [], roofs = new Map<string, THREE.BufferGeometry[]>();
    const R = (x0: number, x1: number, z0: number, z1: number): R4 => [x0 - O[0], x1 - O[0], z0 - O[1], z1 - O[1]];

    // ---------- gable A: the east building, its north gable to the car park (Pairs 3-5) ----------
    if (A_OUT) {
      const [x0, x1, z0, z1] = [A_OUT.minX + 0.2, A_OUT.maxX - 0.1, A_OUT.minZ + 0.1, A_OUT.maxZ - 0.1];
      hall(c, roofs, R(x0, x1, z0, z1), { along: 'z', eave: 3.4, pitch: 0.55, over: 0.5, wall: WALL, base: [0.45, GREY_BASE], roof: '#a2592d', fascia: '#3a2f28' });
      // the gable's front: the lettering (Pairs 3, 4: the legible lines only), the dark doorway, a window, a wall unit
      const xm = (x0 + x1) / 2;
      k.meshes.push(place(textPanel(6.4, 1.75, [
        { t: 'GHANA NATIONAL FIRE SERVICE', s: 0.2, c: '#1c1c1c', b: true },
        { t: 'UNIVERSITY OF GHANA - LEGON', s: 0.17, c: '#1c1c1c', b: true },
        { t: 'EMERGENCY 192', s: 0.26, c: '#b3201c', b: true },
      ], null), xm - O[0], 3.95, z0 - O[1] - 0.04, Math.PI));
      b.door.push(b.plane(true, z0 - 0.04, -1, xm - 0.6, 1.6, 0, 2.45));
      b.win.push(b.plane(true, z0 - 0.04, -1, x0 + 1.7, 1.2, 1.0, 2.2));
      acUnit(b, x0 + 3.3, 2.15, z0, 0, -1);
      // the long sides: windows and doors at intervals toward the drive and the trees
      for (let z = z0 + 4; z < z1 - 2; z += 4.2) {
        const door = Math.round((z - z0) / 4.2) % 4 === 1;
        if (door) b.door.push(b.plane(false, x0 - 0.04, -1, z, 1.1, 0, 2.2)); else b.win.push(b.plane(false, x0 - 0.04, -1, z, 1.3, 1.0, 2.3));
        b.win.push(b.plane(false, x1 + 0.04, 1, z, 1.2, 1.0, 2.2));
      }
    }

    // ---------- the small shed beside the west building ----------
    if (SHED) {
      const [x0, x1, z0, z1] = [SHED.minX + 0.1, SHED.maxX - 0.1, SHED.minZ + 0.1, SHED.maxZ - 0.1];
      hall(c, roofs, R(x0, x1, z0, z1), { along: 'z', eave: 2.9, pitch: 0.45, over: 0.4, wall: WALL, base: [0.4, GREY_BASE], roof: '#8f9396', fascia: DARK });
      b.door.push(b.plane(true, z0 - 0.04, -1, (x0 + x1) / 2, 1.1, 0, 2.15));
      b.win.push(b.plane(false, x0 - 0.04, -1, (z0 + z1) / 2, 1.1, 1.1, 2.1));
    }

    // ---------- the open canopy over the drive between the two buildings (Pairs 3-5) ----------
    {
      const { x0, x1, z0, z1, front, back } = CANOPY, post = '#3b3f42', y = (z: number) => front + ((z - z0) / (z1 - z0)) * (back - front);
      for (const z of [z0 + 0.3, (z0 + z1) / 2, z1 - 0.3]) for (const x of [x0, x1]) {
        c.push([box(x - O[0] - 0.07, x - O[0] + 0.07, 0, y(z), z - O[1] - 0.07, z - O[1] + 0.07), post]);
        SOLIDS.add(x, z, 0.12);
      }
      // the beams along both sides and across the front and back, the purlins under the sheet
      for (const x of [x0, x1]) c.push([rod([x - O[0], y(z0) - 0.12, z0 - O[1]], [x - O[0], y(z1) - 0.12, z1 - O[1]], 0.16), post]);
      for (const z of [z0 + 0.3, (z0 + z1) / 2, z1 - 0.3]) c.push([box(x0 - O[0] - 0.4, x1 - O[0] + 0.4, y(z) - 0.26, y(z) - 0.06, z - O[1] - 0.06, z - O[1] + 0.06), post]);
      for (let x = x0 + 1.5; x < x1 - 0.5; x += 1.5) c.push([rod([x - O[0], y(z0 - 0.6) - 0.02, z0 - O[1] - 0.6], [x - O[0], y(z1 + 0.6) - 0.02, z1 - O[1] + 0.6], 0.08), '#4a4f53']);
      // the sheet: one shallow slope falling to the back, overhanging all round
      const sx0 = x0 - O[0] - 0.7, sx1 = x1 - O[0] + 0.7, sz0 = z0 - O[1] - 0.8, sz1 = z1 - O[1] + 0.8, ya = y(z0 - 0.8) + 0.04, yb = y(z1 + 0.8) + 0.04;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([sx0, ya, sz0, sx1, ya, sz0, sx1, yb, sz1, sx0, ya, sz0, sx1, yb, sz1, sx0, yb, sz1], 3));
      const L = Math.hypot(sz1 - sz0, yb - ya);
      g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, sx1 - sx0, 0, sx1 - sx0, L, 0, 0, sx1 - sx0, L, 0, L], 2));
      g.computeVertexNormals();
      (roofs.get('#4b525asheet') ?? roofs.set('#4b525asheet', []).get('#4b525asheet')!).push(g);
      // its front edge flashing
      c.push([box(sx0, sx1, ya - 0.18, ya + 0.02, sz0 - 0.03, sz0 + 0.03), '#2e3236']);
    }

    // ---------- the black ribbed water tank on its stand (Pairs 3-5) ----------
    {
      const { x, z, r, h, stand } = TANK, X = x - O[0], Z = z - O[1];
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) { c.push([box(X + sx * 0.75 - 0.06, X + sx * 0.75 + 0.06, 0, stand, Z + sz * 0.75 - 0.06, Z + sz * 0.75 + 0.06), '#5a5d5f']); SOLIDS.add(x + sx * 0.75, z + sz * 0.75, 0.1); }
      for (const sx of [-1, 1]) c.push([rod([X + sx * 0.75, 0.3, Z - 0.75], [X + sx * 0.75, stand - 0.3, Z + 0.75], 0.04), '#5a5d5f'], [rod([X - 0.75, 0.3, Z + sx * 0.75], [X + 0.75, stand - 0.3, Z + sx * 0.75], 0.04), '#5a5d5f']);
      c.push([box(X - 1.0, X + 1.0, stand, stand + 0.12, Z - 1.0, Z + 1.0), '#6b6e70']);
      c.push([new THREE.CylinderGeometry(r, r, h, 24).translate(X, stand + 0.12 + h / 2, Z), '#141414']);
      for (let yy = stand + 0.35; yy < stand + h; yy += 0.32) c.push([new THREE.CylinderGeometry(r + 0.03, r + 0.03, 0.08, 24).translate(X, yy, Z), '#232323']);
      c.push([new THREE.SphereGeometry(r, 18, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.28, 1).translate(X, stand + 0.12 + h, Z), '#181818']);
      c.push([new THREE.CylinderGeometry(0.22, 0.22, 0.12, 12).translate(X, stand + 0.12 + h + 0.3, Z), '#101010']);
    }

    // ---------- the boundary along the car park ----------
    {
      const z = BOUND.z, [g0, g1] = BOUND.gate;
      // the weathered wall in front of A, returning past A's east side; its mould and run-off in patches
      const wallRun = (ax: number, az: number, bx: number, bz: number, h: number) => {
        const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2));
        for (let i = 0; i < n; i++) {
          const t0 = i / n, t1 = (i + 1) / n, p0: P2 = [ax + (bx - ax) * t0, az + (bz - az) * t0], p1: P2 = [ax + (bx - ax) * t1, az + (bz - az) * t1];
          const tint = ['#dcd9cf', '#d3d0c5', '#e2dfd6', '#cfccc1'][Math.floor(hash(p0[0], p0[1]) * 4)];
          const seg = (y0: number, y1: number, th: number, col: string) => {
            const [mx, mz] = [(p0[0] + p1[0]) / 2 - O[0], (p0[1] + p1[1]) / 2 - O[1]], len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
            c.push([new THREE.BoxGeometry(len + 0.02, y1 - y0, th).rotateY(-Math.atan2(p1[1] - p0[1], p1[0] - p0[0])).translate(mx, (y0 + y1) / 2, mz), col]);
          };
          seg(-0.2, h, 0.22, tint);
          seg(-0.2, 0.35 + hash(p0[1], p0[0]) * 0.5, 0.24, '#9b9a8f');
          if (hash(p0[0] + 3, p0[1]) < 0.5) seg(h - 0.9 - hash(p0[0], 9) * 0.6, h - 0.05, 0.235, '#b9b7ab');
          seg(h, h + 0.08, 0.3, '#e4e1d8');
        }
        wallSolids(ax, az, bx, bz, 0.25);
      };
      wallRun(g1 + 0.75, z, BOUND.east, z, 2.3);
      wallRun(BOUND.east, z, BOUND.east, BOUND.eastReturn, 2.3);
      // the piers either side of the vehicle opening
      for (const x of [g0 - 0.4, g1 + 0.4]) { c.push([box(x - O[0] - 0.36, x - O[0] + 0.36, 0, 2.7, z - O[1] - 0.36, z - O[1] + 0.36), '#ece9e1'], [box(x - O[0] - 0.42, x - O[0] + 0.42, 2.7, 2.84, z - O[1] - 0.42, z - O[1] + 0.42), '#d9d5cb']); SOLIDS.add(x, z, 0.45); }
      // west of the opening: the railing fence on a low wall, returning to the shed
      const fence = (ax: number, az: number, bx: number, bz: number) => {
        const L = Math.hypot(bx - ax, bz - az), ang = -Math.atan2(bz - az, bx - ax), mx = (ax + bx) / 2 - O[0], mz = (az + bz) / 2 - O[1];
        c.push([new THREE.BoxGeometry(L, 0.95, 0.24).rotateY(ang).translate(mx, 0.325, mz), '#dedbd2']);
        c.push([new THREE.BoxGeometry(L, 0.06, 0.3).rotateY(ang).translate(mx, 0.83, mz), '#e8e5dc']);
        const n = Math.max(1, Math.round(L / 0.14));
        for (let i = 0; i <= n; i++) { const x = ax + ((bx - ax) * i) / n - O[0], zz = az + ((bz - az) * i) / n - O[1]; c.push([box(x - 0.015, x + 0.015, 0.86, 2.3, zz - 0.015, zz + 0.015), '#1f2224']); }
        for (const yy of [1.15, 2.25]) c.push([new THREE.BoxGeometry(L, 0.05, 0.05).rotateY(ang).translate(mx, yy, mz), '#1f2224']);
        for (let i = 0; i <= Math.round(L / 2.6); i++) { const t = i / Math.max(1, Math.round(L / 2.6)), x = ax + (bx - ax) * t - O[0], zz = az + (bz - az) * t - O[1]; c.push([box(x - 0.18, x + 0.18, 0, 2.45, zz - 0.18, zz + 0.18), '#e6e3da']); }
        wallSolids(ax, az, bx, bz, 0.22);
      };
      fence(g0 - 0.75, z, BOUND.west, z);
      fence(BOUND.west, z, BOUND.west, BOUND.westReturn);
      // the SAFETY WEEK banner on the fence (Pair 4; only its major words are legible)
      k.meshes.push(place(textPanel(3.6, 1.3, [{ t: 'SAFETY WEEK', s: 0.36, c: '#f4d21c', b: true }], '#c42a20', (g, W, H) => { g.fillStyle = '#9b1d16'; g.fillRect(0, H * 0.82, W, H * 0.18); g.fillRect(0, 0, W, H * 0.12); }), 643.2 - O[0], 1.75, z - O[1] - 0.2, Math.PI));
      // the planting along the wall's foot and inside the fence (Pairs 3, 4): a kerbed strip of soil, tropical shrubs
      k.meshes.push(new THREE.Mesh(drapeAt(O, BOUND.west, BOUND.east, z - 2.2, z - 0.15, 0.4, 0.06, (x, zz) => {
        if (x > g0 - 1.2 && x < g1 + 1.2) return null;
        const m = vnoise(x * 1.3, zz * 1.3) * 0.06;
        return [0.4 + m, 0.3 + m, 0.22];
      }), groundCover()));
      for (const [x0, x1] of [[BOUND.west, g0 - 1.2], [g1 + 1.2, BOUND.east]]) {
        c.push([box(x0 - O[0], x1 - O[0], 0, 0.16, z - 2.35 - O[1], z - 2.2 - O[1]), '#c9c4b8']);
        for (let x = x0 + 0.6; x < x1 - 0.3; x += 0.9) {
          const i = Math.round(x * 3), zz = z - 1.2 + (hash(x, 3) - 0.5) * 0.8;
          if (hash(i, 5) < 0.55) {
            // broad-leaved tropical shrubs (Pairs 3, 4)
            for (let l = 0; l < 6; l++) { const a = (l / 6) * Math.PI * 2 + hash(i, l); b.leaf.push([new THREE.ConeGeometry(0.12, 1.0 + hash(l, i) * 0.6, 4).rotateZ(0.7).rotateY(a).translate(x - O[0] + Math.cos(a) * 0.35, 0.55, zz - O[1] - Math.sin(a) * 0.35), ['#3f6e2c', '#4d7d33', '#2f5c26'][l % 3]]); }
          } else b.leaf.push([new THREE.IcosahedronGeometry(0.5 + hash(i, 6) * 0.3, 1).scale(1.2, 0.9, 1.2).translate(x - O[0], 0.5, zz - O[1]), ['#3f6a2a', '#4d7a31', '#5b7f36'][i % 3]]);
          if (hash(i, 8) < 0.3) b.leaf.push([new THREE.IcosahedronGeometry(0.12, 0).translate(x - O[0] + 0.2, 0.95, zz - O[1]), ['#d64a7a', '#e6c23a', '#f2f2ee'][i % 3]]);
        }
      }
    }

    // ---------- the yard's worn hardstanding inside the boundary ----------
    k.meshes.push(new THREE.Mesh(drapeAt(O, BOUND.west + 0.2, BOUND.east - 0.2, BOUND.z + 0.2, CANOPY.z1 + 2, 0.5, 0.05, (x, z) => {
      if (stClear(x, z) < 0.15) return null;
      if (z > 354.5 && (x < CANOPY.x0 - 0.6 || x > CANOPY.x1 + 0.6) && !(x > 638.2 && x < 640.1)) return null;
      if (A_OUT && x > A_OUT.minX && z > A_OUT.minZ) return null;
      const m = vnoise(x * 0.8, z * 0.8) * 0.06, n = vnoise(x * 0.2, z * 0.2);
      return n > 0.62 ? [0.46 + m, 0.42 + m, 0.37] : [0.38 + m, 0.37 + m, 0.35 + m];
    }), groundCover()));

    // ---------- the low red railing and its flower bed across the car park (Pair 5) ----------
    {
      const { x0, x1, z } = RAILING, col = '#8e2f22';
      for (let x = x0; x <= x1 + 0.01; x += 1.5) c.push([box(x - O[0] - 0.03, x - O[0] + 0.03, 0, 1.05, z - O[1] - 0.03, z - O[1] + 0.03), col]);
      for (const yy of [0.5, 1.02]) c.push([box(x0 - O[0], x1 - O[0], yy - 0.03, yy + 0.03, z - O[1] - 0.03, z - O[1] + 0.03), col]);
      SOLIDS.add(x0, z, 0.06); SOLIDS.add(x1, z, 0.06); wallSolids(x0, z, x1, z, 0.08);
      k.meshes.push(new THREE.Mesh(drapeAt(O, x0 - 0.6, x1 + 0.6, z + 0.1, z + 1.7, 0.3, 0.06, (x, zz) => { const m = vnoise(x, zz) * 0.06; return [0.36 + m, 0.27 + m, 0.2]; }), groundCover()));
      c.push([box(x0 - 0.6 - O[0], x1 + 0.6 - O[0], 0, 0.14, z + 1.7 - O[1], z + 1.85 - O[1]), '#c9c4b8']);
      for (let x = x0; x < x1; x += 0.7) {
        const i = Math.round(x * 5);
        b.leaf.push([new THREE.IcosahedronGeometry(0.28 + hash(i, 2) * 0.25, 1).scale(1, 1.2, 1).translate(x - O[0], 0.35, z + 0.8 - O[1] + (hash(i, 3) - 0.5) * 0.6), ['#4b7a32', '#3f6a2a', '#5b8a3a'][i % 3]]);
        if (hash(i, 4) < 0.6) b.leaf.push([new THREE.IcosahedronGeometry(0.09, 0).translate(x - O[0] + 0.15, 0.62, z + 0.7 - O[1]), ['#e6c23a', '#c8324a', '#f3efe6'][i % 3]]);
      }
    }

    // ---------- the low office by the car park (Pair 6) ----------
    if (OFF) {
      const [x0, x1, z0, z1] = [OFF.minX + 0.1, OFF.maxX - 0.1, OFF.minZ + 0.1, OFF.maxZ - 0.1];
      hall(c, roofs, R(x0, x1, z0, z1), { along: 'x', eave: 3.0, pitch: 0.14, over: 0.55, wall: '#efede6', base: [0.85, '#8b4f3d'], roof: '#5a5550', fascia: '#26221f' });
      // the tall pale door on its west end, barred windows along the front with the wall units under them
      b.door.push(b.plane(false, x0 - 0.04, -1, (z0 + z1) / 2 + 0.6, 1.0, 0, 2.5));
      c.push([box(x0 - O[0] - 0.12, x0 - O[0] - 0.02, 0, 2.6, (z0 + z1) / 2 + 0.6 - O[1] - 0.62, (z0 + z1) / 2 + 0.6 - O[1] + 0.62), '#ece9df']);
      for (let x = x0 + 2.2, i = 0; x < x1 - 1; x += 3.1, i++) {
        b.win.push(b.plane(true, z1 + 0.04, 1, x, 1.3, 1.05, 2.3));
        b.grille.push(b.plane(true, z1 + 0.07, 1, x, 1.34, 1.03, 2.32));
        if (i % 2 === 0) acUnit(b, x + 0.9, 0.95, z1, 0, 1);
      }
      for (let x = x0 + 3; x < x1 - 1; x += 4) b.grille.push(b.plane(true, z0 - 0.07, -1, x, 1.2, 1.05, 2.2));
      // the block-paved strip along its front, the short painted posts at its edge
      const [px0, px1, pz0, pz1] = OFFICE.pave;
      k.meshes.push(new THREE.Mesh(drapeAt(O, px0, px1, pz0, pz1, 0.1, 0.05, blocks), groundCover()));
      c.push([box(px0 - O[0], px1 - O[0], 0, 0.12, pz1 - O[1], pz1 + 0.14 - O[1]), '#c9c4b8']);
      for (const [i, x] of OFFICE.posts.entries()) {
        const X = x - O[0], Z = OFFICE.postZ - O[1];
        for (let s = 0; s < 4; s++) c.push([new THREE.CylinderGeometry(0.075, 0.075, 0.24, 10).translate(X, 0.12 + s * 0.24, Z), ['#f1efe8', '#b5302a', '#f1efe8', '#2a2a2a'][(s + i) % 4]]);
        SOLIDS.add(x, OFFICE.postZ, 0.09);
      }
      // the hedge-lined earth access along its west side toward the long low building, the worn red earth before it
      k.meshes.push(new THREE.Mesh(drapeAt(O, 630, px0 + 0.2, OFFICE.hedgeZ[0], 321.5, 0.4, 0.04, (x, z) => {
        if (stClear(x, z, true) < 0.2) return null;
        if (z < 315.5 && (x < OFFICE.hedgeX[0] + 0.5 || x > OFFICE.hedgeX[1] - 0.5)) return null;
        const m = vnoise(x * 1.2, z * 1.2) * 0.06;
        return [0.47 + m, 0.32 + m * 0.6, 0.25];
      }), groundCover()));
      for (const hx of OFFICE.hedgeX) for (let z = OFFICE.hedgeZ[0]; z < OFFICE.hedgeZ[1]; z += 1.3) {
        if (hx === OFFICE.hedgeX[1] && z > 311.5) continue;
        b.leaf.push([new THREE.IcosahedronGeometry(0.75, 1).scale(1.05, 1.15, 1.05).translate(hx - O[0], 0.82, z - O[1]), ['#2f5a25', '#36652a', '#2b5223'][Math.round(z) % 3]]);
      }
      // the pole by the office's east end and its wires
      const [qx, qz] = OFFICE.pole, X = qx - O[0], Z = qz - O[1];
      c.push([new THREE.CylinderGeometry(0.11, 0.15, 8.5, 9).translate(X, 4.25, Z), '#8b7d6b'], [box(X - 0.8, X + 0.8, 7.9, 8.0, Z - 0.05, Z + 0.05), '#6e6252']);
      SOLIDS.add(qx, qz, 0.15);
      k.meshes.push(wires([[[X - 0.7, 7.95, Z], [x1 - O[0], 2.9, z1 - O[1]]], [[X + 0.7, 7.95, Z], [X + 34, 7.95, Z + 3]], [[X - 0.7, 7.95, Z], [X - 32, 7.6, Z - 2]]] as [V3, V3][], 0.5));
    }

    // ---------- La Road's east side past the station (Pair 14) ----------
    {
      const t0 = laT(333), t1 = laT(381);
      k.meshes.push(new THREE.Mesh(drapeAt(O, 596, 634, 333, 381, 0.12, 0.05, (x, z) => {
        const o = laOffset(x, z);
        if (o < LA.walk[0] || o > LA.walk[1] || stClear(x, z) < 0.05) return null;
        if (z > 354.5 && laOffset(x, z) > 6.0) return null;
        return blocks(x * 0.7 + z * 0.7, z * 0.7 - x * 0.7);
      }), groundCover()));
      // the pale kerb along the asphalt, broken by the drain opening
      const n = 60;
      for (let i = 0; i < n; i++) {
        const ta = t0 + ((t1 - t0) * i) / n, tb = t0 + ((t1 - t0) * (i + 1)) / n, [ax, az] = along(LA_ROAD, ta, LA.half + 0.1), [bx, bz] = along(LA_ROAD, tb, LA.half + 0.1);
        if (Math.abs((az + bz) / 2 - LA.drain) < 0.7) continue;
        const L = Math.hypot(bx - ax, bz - az);
        c.push([new THREE.BoxGeometry(L + 0.02, 0.24, 0.16).rotateY(-Math.atan2(bz - az, bx - ax)).translate((ax + bx) / 2 - O[0], 0.06, (az + bz) / 2 - O[1]), '#d3cec2']);
      }
      // the contained drain opening: a dark slot with a pale lip at the kerb (a visual only: no hole, no step)
      {
        const t = laT(LA.drain), [ax, az] = along(LA_ROAD, t - 0.012, LA.half + 0.25), [bx, bz] = along(LA_ROAD, t + 0.012, LA.half + 0.25), ang = -Math.atan2(bz - az, bx - ax);
        const L = Math.hypot(bx - ax, bz - az), mx = (ax + bx) / 2 - O[0], mz = (az + bz) / 2 - O[1];
        c.push([new THREE.BoxGeometry(L, 0.02, 0.42).rotateY(ang).translate(mx, 0.035, mz), '#141414']);
        c.push([new THREE.BoxGeometry(L + 0.2, 0.06, 0.06).rotateY(ang).translate(mx + Math.sin(-ang) * 0.24, 0.05, mz + Math.cos(-ang) * 0.24), '#bdb7ab']);
      }
      // the low pale wall north of the long building
      const wa = along(LA_ROAD, laT(LA.wallZ[0]), LA.wall), wb = along(LA_ROAD, laT(LA.wallZ[1]), LA.wall);
      for (let i = 0; i < 8; i++) {
        const p0 = [wa[0] + ((wb[0] - wa[0]) * i) / 8, wa[1] + ((wb[1] - wa[1]) * i) / 8], p1 = [wa[0] + ((wb[0] - wa[0]) * (i + 1)) / 8, wa[1] + ((wb[1] - wa[1]) * (i + 1)) / 8];
        const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), ang = -Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
        c.push([new THREE.BoxGeometry(L + 0.01, 1.3, 0.2).rotateY(ang).translate((p0[0] + p1[0]) / 2 - O[0], 0.45, (p0[1] + p1[1]) / 2 - O[1]), ['#e3e0d7', '#d8d4ca'][i % 2]]);
        c.push([new THREE.BoxGeometry(L + 0.01, 0.07, 0.28).rotateY(ang).translate((p0[0] + p1[0]) / 2 - O[0], 1.13, (p0[1] + p1[1]) / 2 - O[1]), '#efece4']);
      }
      wallSolids(wa[0], wa[1], wb[0], wb[1], 0.2);
      // mixed mature canopy behind it (not a palm avenue)
      for (const [x, z, h, s] of [[626.8, 342.5, 9, 9], [623.4, 352.5, 7.5, 7]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x + z, origin: O });
    }

    roofMeshes(k, roofs);
    const m = new THREE.Mesh(merge(c), concrete(0.35)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.finish(k, 0.35);
    void louvreMat; void tuft;
  },
};

// ======================================================================================================
// the two long buildings at an angle to the grid: gable B (the long west building) and the building by La Road
// ======================================================================================================
function longHall(name: string, pt: P2, o: { roof: string; eave: number; pitch: number; door?: boolean }): Spec[] {
  const bd = at(pt);
  if (!bd) return [];
  const f = oriented(bd);
  return [{
    name, axis: [f.ux, f.uz], origin: [f.cx, f.cz], storey: 3, style: PLAIN, roofColor: o.roof, fascia: DARK, pitch: 0.2,
    replaces: [pt],
    blocks: [],
    onGround: true,
    keep: [],
    extras: (k: Kit) => {
      const b = new Bag([0, 0]), c: Part[] = [], roofs = new Map<string, THREE.BufferGeometry[]>();
      const x0 = -f.L / 2 + 0.1, x1 = f.L / 2 - 0.1, z0 = -f.W / 2 + 0.1, z1 = f.W / 2 - 0.1;
      hall(c, roofs, [x0, x1, z0, z1], { along: 'x', eave: o.eave, pitch: o.pitch, over: 0.5, wall: WALL, base: [0.45, GREY_BASE], roof: o.roof, fascia: DARK });
      // the north (or north-east) gable: a door, a small high vent, a lamp; windows along both long sides
      if (o.door) b.door.push(b.plane(false, x0 - 0.04, -1, 1.2, 1.2, 0, 2.3));
      b.grille.push(b.plane(false, x0 - 0.04, -1, 0, 0.6, o.eave + 0.6, o.eave + 1.0));
      c.push([box(x0 - 0.25, x0 - 0.02, o.eave - 0.4, o.eave - 0.15, -1.2, -0.9), '#d6d3cb']);
      for (let x = x0 + 3; x < x1 - 2; x += 4.2) {
        const i = Math.round((x - x0) / 4.2);
        if (i % 5 === 2) b.door.push(b.plane(true, z0 - 0.04, -1, x, 1.1, 0, 2.2)); else b.win.push(b.plane(true, z0 - 0.04, -1, x, 1.3, 1.0, 2.3));
        b.win.push(b.plane(true, z1 + 0.04, 1, x, 1.3, 1.0, 2.3));
      }
      roofMeshes(k, roofs);
      const m = new THREE.Mesh(merge(c), concrete(0.35)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
      b.finish(k, 0.35);
    },
  }];
}

export const fireStationSite = createSite('fire-station', [
  station,
  ...longHall('Long west building of the fire station', ST.B, { roof: '#9a9d9f', eave: 3.3, pitch: 0.5, door: true }),
  ...longHall('Long building by La Road', ST.road, { roof: '#a7a9a8', eave: 3.2, pitch: 0.45 }),
]);
