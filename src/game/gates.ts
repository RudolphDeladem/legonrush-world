// Entrance gates that open for a walking character (the owner's Volume A section 11): a gate leaf registered by the
// site that models it swings open when the character on foot comes near its entrance, stays open while they remain in
// the vicinity (and while they are in that building's room or common area, which may be modelled elsewhere), and
// closes smoothly once they have genuinely left and the swing is clear. Riding past never opens it. Its collision
// follows the leaf: closed it blocks the opening, open it lies along its open position.
import * as THREE from 'three';

export interface GateSpec {
  id: string;
  /** the residence ID the gate belongs to (residence.ts) */
  buildingId: string;
  /** the hinge (world x, z) and the closed leaf's direction from it (unit x, z) and length */
  hinge: [number, number];
  dir: [number, number];
  length: number;
  /** radians it swings open (sign: the way it opens) */
  open: number;
  /** the leaf, built with its hinge at the local origin and the leaf along local +x when closed */
  leaf: THREE.Object3D;
  /** opens within this distance of the hinge; closes beyond exit (metres, working values) */
  near?: number;
  exit?: number;
}
interface Gate extends GateSpec { t: number; want: boolean; baseYaw: number }

class Gates {
  readonly group = new THREE.Group();
  private list: Gate[] = [];
  /** the building whose room or common area the character is in (it keeps that building's gates open) */
  private occupied: string | null = null;
  private last: { x: number; z: number } | null = null;
  constructor() { this.group.name = 'entrance gates'; }
  register(g: GateSpec) {
    const baseYaw = -Math.atan2(g.dir[1], g.dir[0]);
    g.leaf.position.set(g.hinge[0], g.leaf.position.y, g.hinge[1]);
    g.leaf.rotation.y = baseYaw;
    this.group.add(g.leaf);
    this.list.push({ near: 9, exit: 26, ...g, t: 0, want: false, baseYaw });
  }
  get all() { return this.list.map((g) => ({ id: g.id, buildingId: g.buildingId, open: g.t })); }
  occupy(buildingId: string | null) { this.occupied = buildingId; }
  /** the walking character's position, or null while they are in a room elsewhere (the gates keep their state) */
  update(dt: number, at: { x: number; z: number } | null, bike?: { x: number; z: number }) {
    if (at) this.last = at;
    for (const g of this.list) {
      const p = at ?? this.last, d = p ? Math.hypot(p.x - g.hinge[0], p.z - g.hinge[1]) : Infinity;
      if (this.occupied === g.buildingId || d < g.near!) g.want = true;
      else if (d > g.exit!) {
        // close only when the swing is clear of the character and the bike
        const clear = (q: { x: number; z: number } | null | undefined) => !q || Math.hypot(q.x - g.hinge[0], q.z - g.hinge[1]) > g.length + 0.6;
        if (clear(p) && clear(bike)) g.want = false;
      }
      const target = g.want ? 1 : 0;
      g.t += Math.sign(target - g.t) * Math.min(Math.abs(target - g.t), dt * 0.8);
      const e = g.t * g.t * (3 - 2 * g.t);
      g.leaf.rotation.y = g.baseYaw + g.open * e;
    }
  }
  /** whether a point is blocked by a gate leaf where it stands now */
  blocked(x: number, z: number) {
    for (const g of this.list) {
      const dx = x - g.hinge[0], dz = z - g.hinge[1];
      if (dx * dx + dz * dz > (g.length + 0.5) ** 2) continue;
      const a = Math.atan2(g.dir[1], g.dir[0]) - g.open * (g.t * g.t * (3 - 2 * g.t));
      const ux = Math.cos(a), uz = Math.sin(a), t = Math.max(0, Math.min(g.length, dx * ux + dz * uz));
      if (Math.hypot(dx - ux * t, dz - uz * t) < 0.25) return true;
    }
    return false;
  }
}
export const gates = new Gates();
