// Gardens round the block-modelled halls (commonwealth.ts, volta.ts): trees, palms, bushes, hedges
// and potted plants as plain parts of a site's model, standing on the ground (Kit.ground), kept off
// the roads, the buildings and the areas a site keeps clear.
import * as THREE from 'three';
import { NODE_XZ, ROADS, buildingAt } from './campusmap';
import { box } from './modelkit';
import type { Kit } from './blocks';
import { SOLIDS } from './solids';

const LEAVES = ['#3a6b28', '#447a2e', '#355f24', '#2f5e22', '#4a7f30'];

/** a garden over a world rectangle [x0, x1, z0, z1]: its own repeatable random numbers and the roads near it */
export function garden([bx0, bx1, bz0, bz1]: [number, number, number, number]) {
  let seed = 7;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  // the roads (and footpaths) near the garden, which planting keeps off
  const roads: [number, number, number, number, number][] = [];
  for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++) {
    const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
    if (Math.max(ax, bx) < bx0 || Math.min(ax, bx) > bx1 || Math.max(az, bz) < bz0 || Math.min(az, bz) > bz1) continue;
    roads.push([ax, az, bx, bz, r.cls === 4 ? 2 : 6]);
  }
  const nearRoad = (x: number, z: number) => roads.some(([ax, az, bx, bz, w]) => {
    const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
    return Math.hypot(x - ax - dx * t, z - az - dz * t) < w;
  });
  /** on a carriageway or a path itself (a tree or palm a model places there is left out) */
  const onRoad = (x: number, z: number) => roads.some(([ax, az, bx, bz, w]) => {
    const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
    return Math.hypot(x - ax - dx * t, z - az - dz * t) < (w === 2 ? 1.3 : 3.8);
  });
  /** world rectangles kept clear of planting (blocks, walks, forecourts, stairways) */
  const clear: [number, number, number, number][] = [];
  const clearOf = (x: number, z: number) => !clear.some(([x0, x1, z0, z1]) => x > x0 && x < x1 && z > z0 && z < z1) && !buildingAt(x, z, 2) && !nearRoad(x, z);

  return {
    rand, clear, clearOf,
    /** start the random numbers again (each model the same every time it is built) */
    reseed: (n: number) => { seed = n; },
    /** n tries in a world rectangle, each kept if clear */
    scatter(x0: number, x1: number, z0: number, z1: number, n: number, put: (x: number, z: number) => void) {
      for (let i = 0; i < n; i++) {
        const x = x0 + rand() * (x1 - x0), z = z0 + rand() * (z1 - z0);
        if (clearOf(x, z)) put(x, z);
      }
    },
    /** a shade tree: trunk and a round crown */
    tree(k: Kit, x: number, z: number, s = 1) {
      const y = k.ground(x, z), h = (2.6 + rand() * 2.2) * s, r = (1.8 + rand() * 1.3) * s;
      if (onRoad(...k.world(x, z))) return;
      SOLIDS.add(...k.world(x, z), 0.3 * s + 0.1);
      k.plain.push([new THREE.CylinderGeometry(0.14 * s + 0.08, 0.26 * s + 0.08, h + 0.4, 5).translate(x, y + h / 2 - 0.2, z), '#5b4636']);
      const leaf = LEAVES[(rand() * LEAVES.length) | 0];
      k.plain.push([new THREE.IcosahedronGeometry(r, 1).scale(1, 0.72, 1).translate(x, y + h + r * 0.45, z), leaf]);
      k.plain.push([new THREE.IcosahedronGeometry(r * 0.62, 0).scale(1, 0.8, 1).translate(x + r * 0.5, y + h + r * 0.15, z - r * 0.3), leaf]);
    },
    /** a palm: tall grey trunk, green crownshaft, fronds */
    palm(k: Kit, x: number, z: number, h = 7) {
      const y = k.ground(x, z);
      if (onRoad(...k.world(x, z))) return;
      SOLIDS.add(...k.world(x, z), 0.3);
      k.plain.push([new THREE.CylinderGeometry(0.17, 0.26, h, 6).translate(x, y + h / 2, z), '#a39886']);
      k.plain.push([new THREE.CylinderGeometry(0.2, 0.21, 1.1, 5).translate(x, y + h + 0.55, z), '#6a8f3c']);
      for (let i = 0; i < 7; i++) {
        const f = new THREE.ConeGeometry(0.42, 3.2, 3, 1).rotateX(Math.PI / 2).translate(0, 0, 1.6).scale(1, 0.22, 1);
        f.rotateX(0.3 + (i % 3) * 0.2).rotateY((i / 7) * Math.PI * 2 + rand() * 0.3);
        k.plain.push([f.translate(x, y + h + 1.1, z), '#4f8a2f']);
      }
    },
    /** a bush, sometimes in flower */
    bush(k: Kit, x: number, z: number, r = 0.9) {
      const flower = rand() < 0.3;
      k.plain.push([new THREE.IcosahedronGeometry(r, 0).scale(1.2, 0.7, 1).translate(x, k.ground(x, z) + r * 0.45, z), flower ? ['#c2185b', '#e65100', '#f9a825'][(rand() * 3) | 0] : LEAVES[(rand() * LEAVES.length) | 0]]);
    },
    /** a hedge from (x0, z0) to (x1, z1), following the ground */
    hedge(k: Kit, x0: number, z0: number, x1: number, z1: number) {
      const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(len / 3));
      for (let i = 0; i < n; i++) {
        const ax = x0 + ((x1 - x0) * i) / n, az = z0 + ((z1 - z0) * i) / n, bx = x0 + ((x1 - x0) * (i + 1)) / n, bz = z0 + ((z1 - z0) * (i + 1)) / n;
        const y = k.ground((ax + bx) / 2, (az + bz) / 2);
        k.plain.push([box(Math.min(ax, bx) - 0.45, Math.max(ax, bx) + 0.45, y - 0.2, y + 0.9, Math.min(az, bz) - 0.45, Math.max(az, bz) + 0.45), '#3d6e2a']);
      }
    },
    /** a white pot with a leafy plant (Volta's walk) */
    pot(k: Kit, x: number, z: number) {
      const y = k.ground(x, z);
      k.plain.push([new THREE.CylinderGeometry(0.42, 0.3, 0.7, 10).translate(x, y + 0.35, z), '#f2f0ea']);
      k.plain.push([new THREE.IcosahedronGeometry(0.55, 0).scale(1, 0.9, 1).translate(x, y + 1.05, z), rand() < 0.3 ? '#7a2f3a' : '#3f7a2c']);
    },
  };
}
