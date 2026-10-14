// The bush behind the School of Engineering Sciences (the owner's SES brief, 2026-10-14: "dense bush/forest just a few
// metres behind the building"; its satellite picture: scrub and trees from the back of the complex north to the forest,
// and a strip of trees between the east block and Annie Jiagge Road). A dense undergrowth line of instanced low-poly
// shrub crowns with a few short trees among them (scrubkit.ts: instanced per tile, a fuller crown near the camera and a
// single blob further off), kept a service strip clear of the building, off the tracks and roads, and short of Annie
// Jiagge Road. Only the trees' trunks are solid; the shrubs never block the bike.
import * as THREE from 'three';
import { BUILDINGS, ROADS, nodeXZ } from './campusmap';
import { crownTiles, hash2, vnoise2, type Crown } from './scrubkit';

/** where the bush grows (game metres): behind the complex up to the forest, and the strip east of the east block */
export const ENG_BUSH = {
  back: { x0: 398, x1: 503, z0: -532, z1: -456 },
  east: { x0: 495.5, x1: 503, z0: -452, z1: -404 },
  /** the service strip kept clear behind the building (m) */
  strip: 4.5,
};
const GREENS = ['#4f7a35', '#5d8a3c', '#46702f', '#6b8f45', '#557f37'];

const segDist = (x: number, z: number, ax: number, az: number, bx: number, bz: number) => {
  const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz, t = l ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l)) : 0;
  return Math.hypot(x - ax - dx * t, z - az - dz * t);
};

export function buildEngineeringBush() {
  const { back, east, strip } = ENG_BUSH;
  const near = (x: number, z: number) => x > back.x0 - 30 && x < back.x1 + 30 && z > back.z0 - 30 && z < east.z1 + 30;
  // the roads and tracks round it, and the outlines (the school, the shed behind it, the houses)
  const segs: [number, number, number, number][] = [];
  for (const r of ROADS) for (let i = 1; i < r.nodes.length; i++) {
    const [ax, az] = nodeXZ(r.nodes[i - 1]), [bx, bz] = nodeXZ(r.nodes[i]);
    if (near(ax, az) || near(bx, bz)) segs.push([ax, az, bx, bz]);
  }
  const blds = BUILDINGS.filter((b) => near((b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2));
  const clear = (x: number, z: number, r: number) =>
    !segs.some(([ax, az, bx, bz]) => segDist(x, z, ax, az, bx, bz) < r + 3.2) &&
    !blds.some((b) => x > b.minX - strip - r && x < b.maxX + strip + r && z > b.minZ - strip - r && z < b.maxZ + strip + r);
  const crowns: Crown[] = [];
  const fill = (a: { x0: number; x1: number; z0: number; z1: number }, step: number) => {
    for (let z = a.z0; z < a.z1; z += step) for (let x = a.x0; x < a.x1; x += step) {
      const px = x + (hash2(x, z) - 0.5) * step * 0.9, pz = z + (hash2(z, x) - 0.5) * step * 0.9;
      // a few gaps where the noise is low, so the line reads as bush, not a hedge
      if (vnoise2(px / 9, pz / 9) < 0.22) continue;
      const tree = hash2(px * 3, pz) < 0.14, seed = hash2(px, pz * 3);
      const r = tree ? 2.4 + hash2(pz, px * 5) * 1.2 : 1.3 + hash2(pz, px * 5) * 1.1;
      if (!clear(px, pz, tree ? 1 : r * 0.6)) continue;
      crowns.push(tree
        ? { x: px, z: pz, r, h: 2.6 + seed * 1.6, base: 2.2 + seed * 1.2, trunk: 0.22, color: GREENS[(seed * 5) | 0], seed, solid: true }
        : { x: px, z: pz, r, h: 1.5 + seed * 1.6, base: 0, trunk: 0, color: GREENS[(seed * 5) | 0], seed });
    }
  };
  fill(back, 2.6);
  fill(east, 2.8);
  const group = new THREE.Group();
  group.name = 'engineering-bush';
  group.userData.noRelief = true;
  group.add(...crownTiles(crowns, 60, 75));
  group.userData.crowns = crowns.length;
  return group;
}
