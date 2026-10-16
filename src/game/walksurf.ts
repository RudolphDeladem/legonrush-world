// Raised surfaces a character on foot stands on (porches, steps): the terrain alone would sink their feet into them.
// Each is a rectangle in a building's own frame (origin cx, cz, turned by yaw as a THREE rotation.y) with its top's
// world height. The walk takes the highest top under the feet that is no more than a step above where they are.
export interface WalkSurface { cx: number; cz: number; yaw: number; x0: number; x1: number; z0: number; z1: number; top: number }
const SURFACES: (WalkSurface & { r2: number })[] = [];
export function addWalkSurface(s: WalkSurface) {
  const r = Math.hypot(Math.max(-s.x0, s.x1), Math.max(-s.z0, s.z1)) + 1;
  SURFACES.push({ ...s, r2: r * r });
}
/** the top of the raised surface under (x, z) reachable from height y (a step of up to `step` metres), or null */
export function walkSurfaceAt(x: number, z: number, y: number, step = 0.45): number | null {
  let best: number | null = null;
  for (const s of SURFACES) {
    const dx = x - s.cx, dz = z - s.cz;
    if (dx * dx + dz * dz > s.r2) continue;
    const c = Math.cos(s.yaw), n = Math.sin(s.yaw);
    const lx = dx * c - dz * n, lz = dx * n + dz * c;
    if (lx < s.x0 || lx > s.x1 || lz < s.z0 || lz > s.z1) continue;
    if (s.top <= y + step && (best === null || s.top > best)) best = s.top;
  }
  return best;
}
/** every registered surface (for checks) */
export const walkSurfaces = (): readonly WalkSurface[] => SURFACES;
