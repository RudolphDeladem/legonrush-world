// IPS Road from the UPSA Hostel to the University of Professional Studies, Accra, through its Main Gate to the academic
// core (the owner's brief and Street View frames RW01-RW15; numbers in upsacampusplan.ts; evidence and confidence in
// docs/upsa-hostel-to-school/evidence-audit.md). The roads, the roundabout, the campus and its buildings are the mapped
// UPSA extension (world.ts draws them); this models what the frames show along them, eastward:
// - on from the hostel corridor (ipsroad.ts) to the roundabout: the tan paver sidewalk on the north side, the weedy
//   verge, the poles and streetlights; the kerbed red-earth strip between IPS Road and the frontage road; the tyre
//   stalls on the red earth by the tower (RW07); the trees in the fork where the link to Trinity Avenue leaves (RW08);
// - the blue panel hoarding along the north side from PRESEC's white wall to the UPSA campus wall (RW06, RW08, RW09);
// - the roundabout's low kerbed island: red earth and grass, its spreading tree, a vendor's table and umbrella, a
//   billboard frame (RW09; the billboard's advertisement is not copied);
// - the divided road: the kerbed grass median (RW10, RW11), the south verge of red earth with its open concrete drain,
//   the wooden poles and their wires, the next lattice tower of the line (RW11), the north verge with its scrub and
//   streetlights, the "UPS" bus stop;
// - the UPSA campus wall either side of the Main Gate; the gate: the blue-and-white canopy over the entrance road with
//   the university's name on its fascia, a gatehouse in each outer bay, the lift barriers raised (appearance from the
//   written descriptions of the gate photographs: medium-low confidence);
// - the Abednego F. O. Amartey Towers: two white blocks of ten levels with blue glazing, joined by a bridge, the name on
//   the roof (RW10, RW11; footprint satellite-detected);
// - Prestige Hostel's name and its paved forecourt behind chained bollards (RW14);
// - at the academic core: the entrance canopy on the block's west front, the paved apron to it, trees round the
//   quadrangle.
import * as THREE from 'three';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { box, canvas, merge, type Part } from './modelkit';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { Bag, chainBollards, hash, tuft, vnoise, wallSolids } from './enkit';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { NODE_XZ, ROADS } from './campusmap';
import { latticeTower, medianGrass, pavers, rod, run, strip, wires, type V3 } from './upsa';
import { band, redEarth } from './ipsroad';
import { FRONT_HALF, IPS_HALF, LAMP_OFF, NORTH_WALK, POLE_OFF, TOWERS_E, zFront, zIps } from './ipsplan';
import {
  BUS_STOP, CORE, CW_HALF, FORK, GATE, HOARD_LINE, HOARDING, MEDIAN, PRESTIGE, QUAD, RING, SOUTH_VERGE, S_POLES, TOWER_S, TOWERS_AM, TYRES,
  WALL_E, WALL_H, WALL_W, WEST, zNorth, zSouth,
} from './upsacampusplan';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#f1efe9') };
const UPSA_BLUE = '#1f4f9a', WHITE = '#f2f1ec', GREY = '#cfcbc2';

/** the mapped roads round the route (their half widths by class, footways flagged), so the verges, walls and trees
 *  keep off them */
const SEGS: [number, number, number, number, number, boolean][] = [];
for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++) {
  const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
  if (Math.max(ax, bx) < 1830 || Math.min(ax, bx) > 2450 || Math.max(az, bz) < -1200 || Math.min(az, bz) > -790) continue;
  SEGS.push([ax, az, bx, bz, r.cls === 1 || r.cls === 0 ? 3.5 : [9, 7.4, 6.2, 4.6, 2.6][r.cls] / 2, r.cls === 4]);
}
/** clear of every mapped road (and, with paths, footways) by m metres */
const clear = (x: number, z: number, m: number, paths = false) => !SEGS.some(([ax, az, bx, bz, h, path]) => {
  if (path && !paths) return false;
  const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(ax + dx * t - x, az + dz * t - z) < h + m;
});
const HZ = HOARD_LINE;

// ======================================================================================================
// the approach: hostel corridor to the gate
// ======================================================================================================
const AO: [number, number] = [2075, -880];
const A = (x: number, z: number): [number, number] => [x - AO[0], z - AO[1]];
const approach: Spec = {
  name: 'IPS Road to the UPSA Main Gate', axis: [1, 0], origin: AO, storey: 3, style: PLAIN, roofColor: '#3d6fa8', fascia: UPSA_BLUE, pitch: 0.5,
  blocks: [],
  onGround: true,
  // the sidewalk, the strip, the verges, the island, the median: no generated trees or lamps there
  keep: [[WEST.x0 - AO[0], 2300 - AO[0], -906 - AO[1], -850 - AO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(AO), c: Part[] = [], edge: Part[] = [], solid = (x: number, z: number, r: number) => SOLIDS.add(x, z, r);

    // ---------- on from the hostel corridor to the roundabout ----------
    const tan = pavers('tan');
    for (const r of band(WEST.x0, WEST.x1, (x) => zIps(x) - NORTH_WALK.from, (x) => zIps(x) - NORTH_WALK.from - NORTH_WALK.width, [])) {
      strip(k, r.map(([x, , o]) => A(x, o)), r.map(([x, a]) => A(x, a)), 0.14, tan, edge, '#d6d2c8', [0.16, 0.2]);
    }
    k.meshes.push(new THREE.Mesh(drapeAt(AO, WEST.x0, WEST.x1, -898, -886, 0.6, 0.03, (x, z) => {
      const zi = zIps(x) - NORTH_WALK.from - NORTH_WALK.width - 0.05, zo = zIps(x) - HOARDING.off + 0.15;
      if (!(z < zi && z > zo)) return null;
      const n = vnoise(x * 0.3, z * 0.6), m = vnoise(x * 1.7, z * 1.7);
      return n > 0.47 ? [0.56 + m * 0.08, 0.37 + m * 0.05, 0.24] : null;
    }), groundCover()));
    // the strip between IPS Road and the frontage road, closing as the two roads part for the roundabout
    for (const r of band(WEST.x0, 1950, (x) => zIps(x) + IPS_HALF + 0.05, (x) => zFront(x) - FRONT_HALF - 0.05, [])) {
      if (r.some(([, a, o]) => o - a < 1)) continue;
      strip(k, r.map(([x, a]) => A(x, a)), r.map(([x, , o]) => A(x, o)), 0.14, redEarth(), edge, GREY, [0.2, 0.2]);
    }
    for (const [x, t, h, sp] of [[1868, 0.5, 6, 8], [1907, 0.45, 6.5, 8], [1938, 0.5, 5.5, 7]] as [number, number, number, number][]) {
      const za = zIps(x) + IPS_HALF, zb = zFront(x) - FRONT_HALF;
      broadleaf(k, b.leaf, x, za + (zb - za) * t, { h, spread: sp, seed: x * 0.7 + 3, origin: AO, round: true });
    }
    for (let i = 0; i < 90; i++) {
      const x = WEST.x0 + hash(i, 31.1) * (1950 - WEST.x0), za = zIps(x) + IPS_HALF, zb = zFront(x) - FRONT_HALF, z = za + 0.6 + (zb - za - 1.2) * hash(37.3, i);
      tuft(b, x, z, 0.4 + hash(i, 4) * 0.6, ['#8d9450', '#a39a5a', '#7d8a44', '#b4a468'][i % 4], i + 2100);
    }
    // the frontage road's south kerb and red-earth shoulder up to the fork
    for (const r of band(WEST.x0, FORK.x - 2, (x) => zFront(x) + FRONT_HALF, (x) => zFront(x) + FRONT_HALF + 0.18, [])) {
      const pts = r.map(([x, a]) => A(x, a));
      for (let i = 0; i < pts.length - 1; i++) edge.push([run(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0, 0.15, 0.18, -0.09), GREY]);
    }
    k.meshes.push(new THREE.Mesh(drapeAt(AO, WEST.x0, FORK.x, -865, -850, 0.6, 0.03, (x, z) => {
      const z0 = zFront(x) + FRONT_HALF + 0.2, z1 = z0 + 6 + vnoise(x * 0.2, 2) * 4;
      if (!(z > z0 && z < z1)) return null;
      const m = vnoise(x * 1.3, z * 1.3);
      return [0.6 + m * 0.07, 0.38 + m * 0.05, 0.25];
    }), groundCover()));
    // the tyre stalls on the red earth by the tower (RW07): stacks of old tyres, a lean-to of planks under a tin roof
    for (const [i, [x, z]] of TYRES.entries()) {
      const n = 3 + Math.floor(hash(x, 2) * 4);
      for (let j = 0; j < n; j++) c.push([new THREE.TorusGeometry(0.34, 0.12, 6, 14).rotateX(Math.PI / 2).translate(x - AO[0] + (hash(j, i) - 0.5) * 0.08, 0.12 + j * 0.24, z - AO[1]), '#1d1e20']);
      if (i % 2) for (let j = 0; j < 2; j++) c.push([new THREE.TorusGeometry(0.34, 0.12, 6, 14).rotateX(Math.PI / 2).translate(x - AO[0] + 0.9, 0.12 + j * 0.24, z - AO[1] + 0.5), '#1d1e20']);
      solid(x, z, 0.5);
    }
    {
      const [px, pz] = A(1895, -861.5);
      for (const [dx, dz] of [[-1.4, -1], [1.4, -1], [-1.4, 1], [1.4, 1]]) c.push([box(px + dx - 0.06, px + dx + 0.06, 0, dz < 0 ? 2.5 : 2.2, pz + dz - 0.06, pz + dz + 0.06), '#6a5a48']);
      c.push([run(px - 1.6, pz - 1.15, px + 1.6, pz - 1.15, 2.45, 2.52, 0.04), '#8c8f90'], [box(px - 1.6, px + 1.6, 2.2, 2.5, pz - 1.2, pz + 1.2).rotateX(0), '#9a9d9e']);
      c.push([box(px - 1.3, px + 1.3, 0, 0.9, pz + 0.95, pz + 1.0), '#7a6650']);
      solid(1895, -861.5, 1.6);
    }
    // the fork's ground between the frontage road, the link and Trinity Avenue: scrub and a few trees (RW08)
    for (const [x, z, h, sp] of [[1946, -856, 7, 9], [1958, -846, 6, 8], [1966, -830, 7.5, 10]] as [number, number, number, number][]) {
      if (clear(x, z, 3)) broadleaf(k, b.leaf, x, z, { h, spread: sp, seed: x + z, origin: AO });
    }
    for (let i = 0; i < 60; i++) {
      const x = 1930 + hash(i, 41) * 45, z = -862 + hash(43, i) * 50;
      if (clear(x, z, 0.8)) tuft(b, x, z, 0.5 + hash(i, 44) * 0.7, ['#8d9450', '#7d8a44', '#a39a5a'][i % 3], i + 2400);
    }
    // poles and streetlights on the north verge, on from the corridor's (ipsplan.ts N_POLES, N_LAMPS)
    const poleAt = (x: number, z: number): V3[] => {
      const [px, pz] = A(x, z);
      c.push([new THREE.CylinderGeometry(0.11, 0.15, 9.5, 7).translate(px, 4.75, pz), '#6b5844'], [box(px - 0.06, px + 0.06, 8.8, 8.92, pz - 1.0, pz + 1.0), '#4f4234']);
      c.push([new THREE.CylinderGeometry(0.06, 0.06, 0.28, 6).translate(px, 9.05, pz - 0.8), '#e8e8e4'], [new THREE.CylinderGeometry(0.06, 0.06, 0.28, 6).translate(px, 9.05, pz + 0.8), '#e8e8e4']);
      solid(x, z, 0.2);
      return [[px, 9.15, pz - 0.8], [px, 9.15, pz + 0.8], [px, 7.6, pz]];
    };
    const lamp = (x: number, z: number, dir: 1 | -1) => {
      const [px, pz] = A(x, z), H = 8.5, reach = 2.2 * dir;
      c.push([new THREE.CylinderGeometry(0.07, 0.11, H, 8).translate(px, H / 2, pz), '#8d9398']);
      const arm: V3[] = [[px, H - 0.4, pz], [px, H + 0.25, pz + reach * 0.35], [px, H + 0.35, pz + reach * 0.75], [px, H + 0.3, pz + reach]];
      for (let i = 0; i < arm.length - 1; i++) c.push([rod(arm[i], arm[i + 1], 0.07), '#8d9398']);
      c.push([box(px - 0.16, px + 0.16, H + 0.12, H + 0.32, pz + reach - 0.3, pz + reach + 0.3), '#6f7579'], [box(px - 0.13, px + 0.13, H + 0.1, H + 0.12, pz + reach - 0.25, pz + reach + 0.25), '#f1efe2']);
      solid(x, z, 0.15);
    };
    {
      // (the first span hangs from the corridor's last pole, x 1828)
      const [qx, qz] = A(1828, zIps(1828) - POLE_OFF), last: V3[] = [[qx, 9.15, qz - 0.8], [qx, 9.15, qz + 0.8], [qx, 7.6, qz]];
      const poles = [last, ...[1872, 1916, 1950].map((x) => poleAt(x, zIps(x) - POLE_OFF))];
      const ps: [V3, V3][] = [];
      for (let i = 0; i < poles.length - 1; i++) for (let j = 0; j < 3; j++) ps.push([poles[i][j], poles[i + 1][j]]);
      k.meshes.push(wires(ps, 0.7));
      for (const x of [1851, 1896, 1941]) lamp(x, zIps(x) - LAMP_OFF, 1);
    }

    // ---------- the blue panel hoarding along the north side ----------
    for (let i = 0; i < HZ.length - 1; i++) {
      const [ax, az] = A(...HZ[i]), [bx, bz] = A(...HZ[i + 1]);
      const v = hash(HZ[i][0], 7);
      c.push([run(ax, az, bx, bz, 0.05, HOARDING.h, 0.06), v < 0.33 ? '#2f6fb3' : v < 0.66 ? '#2a66a8' : '#3374b8']);
      // the corrugation: thin ribs on the road side
      for (let t = 0.25; t < 1; t += 0.25) {
        const x = ax + (bx - ax) * t, z = az + (bz - az) * t;
        c.push([box(x - 0.03, x + 0.03, 0.05, HOARDING.h, z + 0.03, z + 0.06), '#2860a0']);
      }
      c.push([box(ax - 0.05, ax + 0.05, 0, HOARDING.h + 0.1, az - 0.12, az - 0.04), '#4b4f54']);
      wallSolids(HZ[i][0], HZ[i][1], HZ[i + 1][0], HZ[i + 1][1], 0.3);
    }
    // scrub and saplings behind it, banana plants and bushes on the verge before it (RW09, RW10)
    for (let i = 0; i < 160; i++) {
      const x = 1960 + hash(i, 51) * 190, zr = zNorth(Math.max(2000, x)), z0 = (Number.isNaN(zr) ? -892 : zr) - CW_HALF - 0.8, z = z0 - hash(52, i) * 5.5;
      if (!clear(x, z, 0.6)) continue;
      if (hash(i, 53) < 0.18) b.leaf.push([new THREE.IcosahedronGeometry(0.7 + hash(i, 54) * 0.8, 1).scale(1.3, 1.0, 1.3).translate(x - AO[0], 0.6, z - AO[1]), ['#4d7432', '#5a7d36', '#3f6a2c'][i % 3]]);
      else tuft(b, x, z, 0.5 + hash(i, 55) * 0.8, ['#8d9450', '#7d8a44', '#6b7a3a', '#a39a5a'][i % 4], i + 2600);
    }
    for (const [x, z] of [[2026, -905.5], [2071, -906.5], [2118, -905], [2142, -906]] as [number, number][]) broadleaf(k, b.leaf, x, z, { h: 9, spread: 11, seed: x, origin: AO });

    // ---------- the roundabout's island (RW09) ----------
    {
      const [cx, cz] = A(RING.x, RING.z), R = RING.island, n = 48;
      for (let i = 0; i < n; i++) {
        const t0 = (i / n) * Math.PI * 2, t1 = ((i + 1) / n) * Math.PI * 2;
        const ax = cx + Math.cos(t0) * R, az = cz + Math.sin(t0) * R, bx = cx + Math.cos(t1) * R, bz = cz + Math.sin(t1) * R;
        edge.push([run(ax, az, bx, bz, 0, 0.22, 0.25), i % 2 ? '#e4e2dc' : '#2b2b2b']);
      }
      k.meshes.push(new THREE.Mesh(drapeAt(AO, RING.x - R, RING.x + R, RING.z - R, RING.z + R, 0.6, 0.06, (x, z) => {
        const d = Math.hypot(x - RING.x, z - RING.z);
        if (d > R - 0.15) return null;
        const n2 = vnoise(x * 0.25, z * 0.25), m = vnoise(x * 1.5, z * 1.5);
        return n2 > 0.45 ? [0.58 + m * 0.07, 0.37 + m * 0.05, 0.24] : [0.42 + m * 0.06, 0.48 + m * 0.05, 0.25];
      }), groundCover()));
      broadleaf(k, b.leaf, RING.x - 3, RING.z + 2, { h: 10, spread: 14, seed: 77, origin: AO });
      for (const [dx, dz, h] of [[6, -5, 3], [-7, -6, 2.5], [8, 6, 2.8]] as [number, number, number][]) b.leaf.push([new THREE.IcosahedronGeometry(1.1, 1).scale(1.3, h / 2.4, 1.3).translate(cx + dx, h / 2, cz + dz), '#4f7a33']);
      for (let i = 0; i < 50; i++) { const a = hash(i, 61) * Math.PI * 2, r = Math.sqrt(hash(62, i)) * (R - 1.5); tuft(b, RING.x + Math.cos(a) * r, RING.z + Math.sin(a) * r, 0.5 + hash(i, 63) * 0.6, ['#8d9450', '#7d8a44', '#a39a5a'][i % 3], i + 2800); }
      // a vendor's table under a big umbrella on the island's west side, crates beside it
      {
        const vx = cx - 9, vz = cz + 4;
        c.push([box(vx - 0.9, vx + 0.9, 0.75, 0.82, vz - 0.5, vz + 0.5), '#7b5a3c']);
        for (const [dx, dz] of [[-0.8, -0.4], [0.8, -0.4], [-0.8, 0.4], [0.8, 0.4]]) c.push([box(vx + dx - 0.04, vx + dx + 0.04, 0, 0.75, vz + dz - 0.04, vz + dz + 0.04), '#5a4330']);
        c.push([new THREE.CylinderGeometry(0.03, 0.03, 2.4, 6).translate(vx, 1.2, vz), '#d8d8d8'], [new THREE.ConeGeometry(1.5, 0.5, 8).translate(vx, 2.45, vz), '#c8392f']);
        c.push([box(vx + 1.2, vx + 1.8, 0, 0.45, vz - 0.3, vz + 0.3), '#2f6fb3'], [box(vx + 1.25, vx + 1.75, 0.45, 0.9, vz - 0.25, vz + 0.25), '#e0b030']);
        solid(RING.x - 9, RING.z + 4, 1.4);
      }
      // a billboard frame on two steel legs on the east side, its face a plain blue panel (no advertisement copied)
      {
        const bx = cx + 9.5, bz = cz - 3;
        for (const dx of [-1.6, 1.6]) c.push([new THREE.CylinderGeometry(0.1, 0.1, 5, 8).translate(bx + dx, 2.5, bz), '#5d6266']);
        c.push([box(bx - 2.3, bx + 2.3, 3.2, 6.0, bz - 0.08, bz + 0.08), '#2d63b0'], [box(bx - 2.4, bx + 2.4, 3.1, 3.2, bz - 0.1, bz + 0.1), '#eceae4']);
        solid(RING.x + 9.5 - 1.6, RING.z - 3, 0.2); solid(RING.x + 9.5 + 1.6, RING.z - 3, 0.2);
      }
    }

    // ---------- the divided road: the median, the verges ----------
    {
      const runs: [number, number, number][][] = [];
      let cur: [number, number, number][] = [];
      for (let x = MEDIAN.x0; x <= MEDIAN.x1; x += 1) {
        const a = zNorth(x) + CW_HALF + 0.05, o = zSouth(x) - CW_HALF - 0.05;
        if (Number.isNaN(a) || Number.isNaN(o) || o - a < MEDIAN.min || !clear(x, (a + o) / 2, -0.3)) { if (cur.length > 1) runs.push(cur); cur = []; continue; }
        cur.push([x, a, o]);
      }
      if (cur.length > 1) runs.push(cur);
      for (const r of runs) strip(k, r.map(([x, a]) => A(x, a)), r.map(([x, , o]) => A(x, o)), 0.16, medianGrass(), edge, GREY, [0.2, 0.2]);
      for (let i = 0; i < 180; i++) {
        const x = MEDIAN.x0 + hash(i, 71) * (MEDIAN.x1 - MEDIAN.x0), a = zNorth(x) + CW_HALF + 0.5, o = zSouth(x) - CW_HALF - 0.5, z = a + (o - a) * hash(72, i);
        if (o - a < 0.6 || !runs.some((r) => x > r[0][0] + 0.5 && x < r[r.length - 1][0] - 0.5)) continue;
        tuft(b, x, z, 0.5 + hash(i, 73) * 0.7, ['#8d9450', '#a39a5a', '#7d8a44', '#b4a468'][i % 4], i + 3000);
      }
    }
    // the south verge: a kerb, red earth, the open drain with its concrete lips (RW10), where no lane or drive meets it
    {
      const zs = (x: number) => zSouth(x) + CW_HALF;
      for (let x = SOUTH_VERGE.x0; x < SOUTH_VERGE.x1; x += 2) {
        const za = zs(x), zb = zs(x + 2);
        if (Number.isNaN(za) || Number.isNaN(zb) || !clear(x + 1, (za + zb) / 2 + 1.2, 0.2)) continue;
        const [ax, az] = A(x, za), [bx, bz] = A(x + 2, zb);
        edge.push([run(ax, az, bx, bz, 0, 0.15, 0.18, -0.09), GREY]);
        const d0 = za + SOUTH_VERGE.drainOff, d1 = zb + SOUTH_VERGE.drainOff;
        if (!clear(x + 1, (d0 + d1) / 2, 0.8)) continue;
        const [px, pz] = A(x, d0), [qx, qz] = A(x + 2, d1), w = SOUTH_VERGE.drainW;
        edge.push([run(px, pz, qx, qz, 0.0, 0.02, w), '#2c2a26'], [run(px, pz, qx, qz, 0, 0.22, 0.15, w / 2 + 0.07), '#b9b4a8'], [run(px, pz, qx, qz, 0, 0.22, 0.15, -w / 2 - 0.07), '#b9b4a8']);
      }
      k.meshes.push(new THREE.Mesh(drapeAt(AO, SOUTH_VERGE.x0, SOUTH_VERGE.x1, -884, -858, 0.7, 0.03, (x, z) => {
        const z0 = zs(x) + 0.2, z1 = z0 + 5 + vnoise(x * 0.15, 3) * 4;
        if (Number.isNaN(z0) || !(z > z0 && z < z1) || !clear(x, z, 0.1)) return null;
        const m = vnoise(x * 1.3, z * 1.3), g = vnoise(x * 0.4, z * 0.9);
        return g > 0.62 ? [0.45 + m * 0.05, 0.47 + m * 0.05, 0.27] : [0.6 + m * 0.07, 0.38 + m * 0.05, 0.25];
      }), groundCover()));
      const poles: V3[][] = [];
      for (const x of S_POLES) {
        const z = zs(x) + 1.0;
        if (Number.isNaN(z) || !clear(x, z, 0.3)) continue;
        poles.push(poleAt(x, z));
      }
      const ps: [V3, V3][] = [];
      for (let i = 0; i < poles.length - 1; i++) for (let j = 0; j < 3; j++) ps.push([poles[i][j], poles[i + 1][j]]);
      if (ps.length) k.meshes.push(wires(ps, 0.7));
    }
    // the next lattice tower of the line, and the conductors from the tower at x 1893 (RW11)
    {
      const throwaway: Part[] = [];
      const [t0x, t0z] = TOWERS_E[TOWERS_E.length - 1];
      const from = latticeTower(throwaway, ...A(t0x, t0z)), to = latticeTower(c, ...A(...TOWER_S));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) solid(TOWER_S[0] + sx * 3, TOWER_S[1] + sz * 3, 0.45);
      k.meshes.push(wires(from.map((p, i) => [p, to[i]] as [V3, V3]), 7));
    }
    // streetlights on the north verge of the divided road, reaching over the north carriageway
    for (let x = 2010; x <= 2270; x += 45) { const z = zNorth(x) - CW_HALF - 1.4; if (!Number.isNaN(z) && clear(x, z, 0.3)) lamp(x, z, 1); }
    // the "UPS" bus stop (osm:node/4988349723): a shelter on the north verge facing the road, a bench, the stop's sign
    {
      const [sx, sz] = A(...BUS_STOP);
      for (const dx of [-1.6, 1.6]) for (const dz of [-0.7, 0.7]) c.push([box(sx + dx - 0.05, sx + dx + 0.05, 0, 2.6, sz + dz - 0.05, sz + dz + 0.05), '#6b7177']);
      c.push([box(sx - 1.9, sx + 1.9, 2.6, 2.7, sz - 1.0, sz + 1.0), '#2f6fb3'], [box(sx - 1.6, sx + 1.6, 0.9, 2.3, sz - 0.75, sz - 0.7), '#d9dcdf']);
      c.push([box(sx - 1.3, sx + 1.3, 0.45, 0.52, sz - 0.6, sz - 0.2), '#7b5a3c']);
      c.push([new THREE.CylinderGeometry(0.04, 0.04, 2.6, 6).translate(sx + 2.4, 1.3, sz + 0.6), '#6b7177'], [box(sx + 2.1, sx + 2.7, 2.2, 2.7, sz + 0.58, sz + 0.62), '#ffffff']);
      k.signs.push({ text: 'UPS', x: sx + 2.4, y: 2.45, z: sz + 0.63, ry: 0, w: 0.5, colors: ['#ffffff', '#1f4f9a'] });
      wallSolids(BUS_STOP[0] - 1.6, BUS_STOP[1] - 0.7, BUS_STOP[0] + 1.6, BUS_STOP[1] - 0.7, 0.2);
    }

    const m = new THREE.Mesh(merge(c), concrete(0.35)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    if (edge.length) { const e = new THREE.Mesh(merge(edge), concrete(0.2)); e.receiveShadow = true; k.meshes.push(e); }
    b.finish(k, 0.3);
  },
};

// ======================================================================================================
// the campus wall and the Main Gate
// ======================================================================================================
const GO: [number, number] = [(GATE.x0 + GATE.x1) / 2, (GATE.z0 + GATE.z1) / 2];
const G = (x: number, z: number): [number, number] => [x - GO[0], z - GO[1]];
const gate: Spec = {
  name: 'UPSA Main Gate', axis: [1, 0], origin: GO, storey: 3.2, style: PLAIN, roofColor: '#e9e8e3', fascia: UPSA_BLUE, pitch: 0,
  replaces: [[GATE.roadX + 0.5, (GATE.z0 + GATE.z1) / 2]],
  blocks: [],
  keep: [[GATE.x0 - 2 - GO[0], GATE.x1 + 2 - GO[0], GATE.z0 - 4 - GO[1], GATE.z1 + 2 - GO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(GO), c: Part[] = [];
    // ---- the campus wall: rendered cream panels between pilasters, a blue coping (colours assumed: UPSA's blue and
    // white), open where a road or drive passes ----
    for (const line of [WALL_W, WALL_E]) {
      for (let i = 0; i < line.length - 1; i++) {
        const [x0, z0] = line[i], [x1, z1] = line[i + 1], L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 3));
        for (let j = 0; j < n; j++) {
          const ax = x0 + ((x1 - x0) * j) / n, az = z0 + ((z1 - z0) * j) / n, bx = x0 + ((x1 - x0) * (j + 1)) / n, bz = z0 + ((z1 - z0) * (j + 1)) / n;
          if (![0, 0.5, 1].every((t) => clear(ax + (bx - ax) * t, az + (bz - az) * t, 0.5))) continue;
          const [px, pz] = G(ax, az), [qx, qz] = G(bx, bz);
          c.push([run(px, pz, qx, qz, 0, WALL_H, 0.22), '#e9e4d6'], [run(px, pz, qx, qz, 0, 0.35, 0.26), '#9c968a'], [run(px, pz, qx, qz, WALL_H, WALL_H + 0.1, 0.3), UPSA_BLUE]);
          c.push([box(px - 0.2, px + 0.2, 0, WALL_H + 0.25, pz - 0.2, pz + 0.2), '#e9e4d6'], [box(px - 0.22, px + 0.22, WALL_H + 0.25, WALL_H + 0.33, pz - 0.22, pz + 0.22), UPSA_BLUE]);
          wallSolids(ax, az, bx, bz, 0.25);
        }
      }
    }
    // ---- the gate ----
    const [x0, z0] = G(GATE.x0, GATE.z0), [x1, z1] = G(GATE.x1, GATE.z1), H = GATE.h;
    const [c0] = G(GATE.clear[0], 0), [c1] = G(GATE.clear[1], 0);
    // the gatehouses in the outer bays: white over a blue base, a sliding window and a door toward the road
    for (const [h0, h1, s] of [[x0 + 0.3, c0 - 0.3, 1], [c1 + 0.3, x1 - 0.3, -1]] as [number, number, number][]) {
      const zf = z0 + 1.2, zb = z1 - 1.2;
      c.push([box(h0, h1, 0, 3.0, zf, zb), WHITE], [box(h0 - 0.03, h1 + 0.03, 0, 0.7, zf - 0.03, zb + 0.03), UPSA_BLUE], [box(h0 - 0.15, h1 + 0.15, 3.0, 3.2, zf - 0.15, zb + 0.15), UPSA_BLUE]);
      const face = s > 0 ? h1 : h0, zm = (zf + zb) / 2;
      b.win.push(new THREE.PlaneGeometry(2.4, 1.1).rotateY((s * Math.PI) / 2).translate(face + s * 0.03, 1.75, zm - 2));
      b.door.push(new THREE.PlaneGeometry(0.95, 2.1).rotateY((s * Math.PI) / 2).translate(face + s * 0.03, 1.05, zm + 2.2));
      b.win.push(new THREE.PlaneGeometry(1.8, 1.0).translate((h0 + h1) / 2, 1.8, zb + 0.03));
      wallSolids(h0 + GO[0], zf + GO[1], h1 + GO[0], zf + GO[1], 0.3); wallSolids(h1 + GO[0], zf + GO[1], h1 + GO[0], zb + GO[1], 0.3);
      wallSolids(h1 + GO[0], zb + GO[1], h0 + GO[0], zb + GO[1], 0.3); wallSolids(h0 + GO[0], zb + GO[1], h0 + GO[0], zf + GO[1], 0.3);
    }
    // the canopy: white columns at its corners and either side of the road, a deep slab, the blue fascia all round
    for (const x of [x0 + 0.5, c0 - 0.35, c1 + 0.35, x1 - 0.5]) for (const z of [z0 + 0.5, z1 - 0.5]) {
      c.push([new THREE.CylinderGeometry(0.32, 0.36, H - 0.6, 14).translate(x, (H - 0.6) / 2, z), WHITE]);
      SOLIDS.add(x + GO[0], z + GO[1], 0.4);
    }
    c.push([box(x0 - 0.4, x1 + 0.4, H - 0.6, H - 0.45, z0 - 0.4, z1 + 0.4), '#e2e1dc'], [box(x0 - 0.5, x1 + 0.5, H - 0.45, H + 0.7, z0 - 0.5, z1 + 0.5), UPSA_BLUE]);
    c.push([box(x0 - 0.52, x1 + 0.52, H + 0.7, H + 0.85, z0 - 0.52, z1 + 0.52), WHITE]);
    // the crest panel standing up over the middle of the front, white with the blue UPSA letters
    c.push([box(-3.2, 3.2, H + 0.85, H + 2.3, z1 + 0.1, z1 + 0.5), WHITE]);
    k.signs.push({ text: 'UNIVERSITY OF PROFESSIONAL STUDIES, ACCRA', x: 0, y: H + 0.12, z: z1 + 0.53, ry: 0, w: 19.5, colors: [UPSA_BLUE, '#ffffff'] });
    k.signs.push({ text: 'UNIVERSITY OF PROFESSIONAL STUDIES, ACCRA', x: 0, y: H + 0.12, z: z0 - 0.53, ry: Math.PI, w: 19.5, colors: [UPSA_BLUE, '#ffffff'] });
    k.signs.push({ text: 'UPSA', x: 0, y: H + 1.58, z: z1 + 0.52, ry: 0, w: 4.4, colors: ['#ffffff', UPSA_BLUE] });
    // the lift barriers, their arms raised
    for (const [bx, s] of [[c0 + 0.35, 1], [c1 - 0.35, -1]] as [number, number][]) {
      const bz = (z0 + z1) / 2;
      c.push([box(bx - 0.18, bx + 0.18, 0, 1.05, bz - 0.18, bz + 0.18), '#e8e6e0'], [box(bx - 0.19, bx + 0.19, 0.9, 1.05, bz - 0.19, bz + 0.19), '#c8392f']);
      for (let i = 0; i < 6; i++) {
        const a: V3 = [bx + s * 0.1 + s * i * 0.12, 1.0 + i * 0.6, bz], e: V3 = [bx + s * 0.1 + s * (i + 1) * 0.12, 1.0 + (i + 1) * 0.6, bz];
        c.push([rod(a, e, 0.08), i % 2 ? '#c8392f' : '#f2f2f2']);
      }
      SOLIDS.add(bx + GO[0], bz + GO[1], 0.25);
    }
    // the short walls closing the gaps between the gatehouses and the campus wall's ends
    for (const [[ax, az], [bx, bz]] of [[WALL_W[WALL_W.length - 1], [GATE.x0 + 0.3, GATE.z1 - 1.2]], [WALL_E[0], [GATE.x1 - 0.3, GATE.z1 - 1.2]]] as [[number, number], [number, number]][]) {
      const [px, pz] = G(ax, az), [qx, qz] = G(bx, bz);
      if (Math.hypot(qx - px, qz - pz) < 0.3) continue;
      c.push([run(px, pz, qx, qz, 0, WALL_H, 0.22), '#e9e4d6'], [run(px, pz, qx, qz, WALL_H, WALL_H + 0.1, 0.3), UPSA_BLUE]);
      wallSolids(ax, az, bx, bz, 0.25);
    }
    const m = new THREE.Mesh(merge(c), concrete(0.25)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.finish(k, 0.25);
  },
};

// ======================================================================================================
// the Abednego F. O. Amartey Towers
// ======================================================================================================
const TW = TOWERS_AM, TO: [number, number] = [2181, -955];
const T = (r: [number, number, number, number]) => ({ x0: r[0] - TO[0], x1: r[1] - TO[0], z0: r[2] - TO[1], z1: r[3] - TO[1] });
const winBlue = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#9fb0c4'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  const gl = g.createLinearGradient(0, y, 0, y + h);
  gl.addColorStop(0, '#5a86c6'); gl.addColorStop(1, '#23467e');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = '#c9d3dd'; g.fillRect(x + w / 2 - 2, y, 4, h);
};
/** white walls, a pair of blue-glazed windows to a bay, a grey slab line each storey (RW10, RW11) */
const TOWER_FACE: Style = {
  bay: 3.6, up: [[34, 70, 80, 120], [142, 70, 80, 120]], ground: [[34, 256 + 70, 80, 120], [142, 256 + 70, 80, 120]],
  draw: (g) => { render(g, '#f4f4f1'); for (const y0 of [0, 256]) { g.fillStyle = '#d9dad6'; g.fillRect(0, y0, 256, 10); winBlue(g, 34, y0 + 70, 80, 120); winBlue(g, 142, y0 + 70, 80, 120); } },
};
const towers: Spec = {
  name: 'Abednego F. O. Amartey Towers', axis: [1, 0], origin: TO, storey: TW.storey, style: TOWER_FACE, roofColor: '#d7d6d0', fascia: '#e6e5e0', pitch: 0,
  replaces: [[2185, -956], [2172, -957]],
  covers: [[2178, -952]],
  blocks: [
    { ...T(TW.west), floors: TW.floors, roof: 'flat' },
    { ...T(TW.east), floors: TW.floors, roof: 'flat' },
    { ...T(TW.bridge), floors: TW.floors - 3, roof: 'flat', y: TW.storey * 2 },
  ],
  keep: [[TW.west[0] - 3 - TO[0], TW.east[1] + 3 - TO[0], TW.west[2] - 3 - TO[1], TW.east[3] + 3 - TO[1]]],
  extras: (k: Kit) => {
    const c: Part[] = [], top = k.wallTop(TW.floors);
    const e = T(TW.east), w = T(TW.west);
    // the east block's full-height blue curtain glazing at its south-west corner, standing a little proud (RW11)
    c.push([box(e.x0 - 0.05, e.x0 + 4.2, 0.6, top, e.z1 - 0.05, e.z1 + 0.25), '#2d5fa8']);
    for (let y = 3.4; y < top; y += TW.storey) c.push([box(e.x0 - 0.06, e.x0 + 4.25, y - 0.05, y + 0.05, e.z1 + 0.25, e.z1 + 0.3), '#b9c3cc']);
    // the parapets and the roof plant, the white sign frame on the east block's roof with the name toward IPS Road
    for (const r of [w, e]) {
      c.push([box(r.x0 - 0.1, r.x1 + 0.1, top, top + 1.0, r.z0 - 0.1, r.z0 + 0.15), '#ecebe6'], [box(r.x0 - 0.1, r.x1 + 0.1, top, top + 1.0, r.z1 - 0.15, r.z1 + 0.1), '#ecebe6']);
      c.push([box(r.x0 + 2, r.x0 + 5, top, top + 2.2, r.z0 + 3, r.z0 + 6), '#c9c8c2']);
    }
    c.push([box(e.x0 + 0.6, e.x1 - 0.6, top + 1.0, top + 2.4, e.z1 - 0.6, e.z1 - 0.4), '#f4f4f1']);
    k.signs.push({ text: 'ABEDNEGO F. O. AMARTEY TOWERS', x: (e.x0 + e.x1) / 2, y: top + 1.7, z: e.z1 - 0.38, ry: 0, w: e.x1 - e.x0 - 1.6, colors: ['#f4f4f1', '#1f3f88'] });
    // the bridge's glazing between the blocks
    const br = T(TW.bridge);
    c.push([box(br.x0, br.x1, TW.storey * 2 + 0.4, top - TW.storey, br.z1 - 0.02, br.z1 + 0.06), '#3b6aa8']);
    // the entrance canopy on the south front of each block
    for (const r of [w, e]) {
      const xm = (r.x0 + r.x1) / 2;
      // (only where the campus drive south of the blocks leaves room for its columns)
      if (![-2.2, 2.2].every((dx) => clear(xm + dx + TO[0], r.z1 + 2.2 + TO[1], 0.6))) continue;
      c.push([box(xm - 2.5, xm + 2.5, 3.2, 3.45, r.z1, r.z1 + 2.4), '#e2e1dc']);
      for (const dx of [-2.2, 2.2]) { c.push([box(xm + dx - 0.12, xm + dx + 0.12, 0, 3.2, r.z1 + 2.1, r.z1 + 2.35), '#e2e1dc']); SOLIDS.add(xm + dx + TO[0], r.z1 + 2.2 + TO[1], 0.2); }
    }
    const m = new THREE.Mesh(merge(c), concrete(0.2)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

// ======================================================================================================
// Prestige Hostel's front and the academic core's entrance
// ======================================================================================================
const PO: [number, number] = [(PRESTIGE.x0 + PRESTIGE.x1) / 2, PRESTIGE.z0];
const prestige: Spec = {
  name: 'Prestige Hostel front', axis: [1, 0], origin: PO, storey: 3.4, style: PLAIN, roofColor: '#c9c4ba', fascia: '#6d5a4a', pitch: 0,
  blocks: [],
  keep: [[PRESTIGE.x0 - PO[0], PRESTIGE.x1 - PO[0], -14, 0]],
  extras: (k: Kit) => {
    const b = new Bag(PO), w = PRESTIGE.x1 - PRESTIGE.x0;
    // the grey-paved forecourt, the chained bollards along its edge
    // (the PRESTIGE and HOSTEL letters are on the long block along the road, the owner's IPS Road opposite UPSA pack,
    // ipsopposite.ts; not repeated on this building behind it)
    const fz0 = -13.5;
    if (clear(PO[0], PO[1] + fz0 / 2, 0.5)) {
      const pv = new THREE.Mesh(new THREE.PlaneGeometry(w, -fz0).rotateX(-Math.PI / 2).translate(0, 0.03, fz0 / 2), pavers('grey'));
      pv.receiveShadow = true; k.meshes.push(pv);
    }
    chainBollards(b, [PRESTIGE.x0 + 1, PO[1] + fz0 + 0.5], [PRESTIGE.x1 - 4, PO[1] + fz0 + 0.5]);
    b.finish(k, 0.3);
  },
};

const CO: [number, number] = CORE.door;
const core: Spec = {
  name: 'UPSA academic core', axis: [1, 0], origin: CO, storey: 3.4, style: PLAIN, roofColor: '#c9c4ba', fascia: '#6d5a4a', pitch: 0,
  blocks: [],
  keep: [[-4, 0, -5, 5]],
  extras: (k: Kit) => {
    const b = new Bag(CO), c: Part[] = [];
    // the entrance canopy on the west front: a white slab with a blue fascia on four columns; the paved apron from the
    // drive's end to the door (the door's exact place inferred: the middle of that front at the mapped drive)
    // (a mapped service lane runs along the front 5.7 m out: the columns stand between it and the wall)
    c.push([box(-3.4, 0, 4.0, 4.35, -3.6, 3.6), '#e8e7e2'], [box(-3.5, 0, 4.35, 4.9, -3.7, 3.7), UPSA_BLUE]);
    for (const dz of [-3.2, 3.2]) for (const dx of [-2.6]) { c.push([new THREE.CylinderGeometry(0.2, 0.22, 4.0, 12).translate(dx, 2.0, dz), WHITE]); SOLIDS.add(CO[0] + dx, CO[1] + dz, 0.3); }
    b.door.push(new THREE.PlaneGeometry(2.4, 2.5).rotateY(-Math.PI / 2).translate(-0.05, 1.25, 0));
    const ap = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 6.6).rotateX(-Math.PI / 2).translate(-1.7, 0.035, 0), pavers('grey'));
    ap.receiveShadow = true; k.meshes.push(ap);
    // trees round the quadrangle, clear of its walks and the roads
    for (const [x, z] of [[QUAD.x0 + 2, QUAD.z0 - 3], [QUAD.x1 - 2, QUAD.z0 - 3], [QUAD.x0 - 3, (QUAD.z0 + QUAD.z1) / 2], [QUAD.x1 + 0.5, (QUAD.z0 + QUAD.z1) / 2 + 8], [QUAD.x0 + 18, QUAD.z1 + 3], [QUAD.x1 - 14, QUAD.z1 + 3]] as [number, number][]) {
      if (clear(x, z, 2.5, true)) broadleaf(k, b.leaf, x, z, { h: 8, spread: 9, seed: x * 0.3 + z, origin: CO });
    }
    const m = new THREE.Mesh(merge(c), concrete(0.2)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.finish(k, 0.25);
    void CW_HALF; void canvas;
  },
};

export const upsaCampusSite = createSite('upsa-campus', [approach, gate, towers, prestige, core]);
