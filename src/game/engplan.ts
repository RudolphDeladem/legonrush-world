// Numbers for the ground round the School of Engineering Sciences (engground.ts), from the owner's satellite picture
// (docs/engineering-ses/, registered at 4.157 px/m) and the owner's words on it (2026-10-14): sidewalks where the map
// shows them, the track behind the school brown earth, low bush between the building and that track, thick forest
// beyond it up to Evandy. Pure data: science.ts reads the track (offAsphalt) as well as engground.ts.
import { ROADS, NODE_XZ } from './campusmap';

type P2 = [number, number];
const xz = (n: number): P2 => [NODE_XZ[n * 2], NODE_XZ[n * 2 + 1]];
const segDist = (x: number, z: number, [ax, az]: P2, [bx, bz]: P2) => {
  const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz, t = l ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l)) : 0;
  return Math.hypot(x - ax - dx * t, z - az - dz * t);
};

/** the footpath behind the school (mapped, class 4: from the road west of the car park round the back to Annie Jiagge
 *  Road), drawn as brown earth, not the pale path (the owner: "the thin road that passes behind the school is brown") */
export const ENG_TRACK_INDEX = ROADS.findIndex((r) => r.cls === 4 && r.nodes.some((n) => Math.hypot(xz(n)[0] - 419, xz(n)[1] + 485) < 2));
export const ENG_TRACK: P2[] = ENG_TRACK_INDEX >= 0 ? ROADS[ENG_TRACK_INDEX].nodes.map(xz) : [];
export const ENG_TRACK_HALF = 1.2;
/** on the track, short of its ends (where it meets the sealed roads, they keep their surface) */
export function onEngTrack(x: number, z: number) {
  if (ENG_TRACK.length < 2 || x < 355 || x > 506 || z > -425 || z < -545) return false;
  const [s, e] = [ENG_TRACK[0], ENG_TRACK[ENG_TRACK.length - 1]];
  if (Math.hypot(x - s[0], z - s[1]) < 5 || Math.hypot(x - e[0], z - e[1]) < 6) return false;
  for (let i = 1; i < ENG_TRACK.length; i++) if (segDist(x, z, ENG_TRACK[i - 1], ENG_TRACK[i]) < ENG_TRACK_HALF + 0.2) return true;
  return false;
}
/** the track's z at x (it runs west to east), for telling the bush behind the school from the forest beyond */
export function trackZ(x: number) {
  for (let i = 1; i < ENG_TRACK.length; i++) {
    const [ax, az] = ENG_TRACK[i - 1], [bx, bz] = ENG_TRACK[i];
    if (x >= Math.min(ax, bx) && x <= Math.max(ax, bx) && bx !== ax) return az + ((bz - az) * (x - ax)) / (bx - ax);
  }
  return NaN;
}

export const ENG_GROUND = {
  /** low bush between the back of the building and the track */
  bush: { x0: 396, x1: 503, z0: -540, z1: -456 },
  /** trees and bush between the east block and Annie Jiagge Road (the satellite) */
  east: { x0: 495.5, x1: 503, z0: -452, z1: -404 },
  /** the forest: north of the track (west of the track's start, north of z0w), up to Evandy Hostel's latitude, from the
   *  Botanical Gardens side to Annie Jiagge Road (the brief's wider satellite picture, the owner) */
  forest: { x0: 160, x1: 503, z0: -1250, zw: -470 },
  /** the service strip kept clear behind the building (m) */
  strip: 4.5,
  /** sidewalks (the satellite: pale strips along the lawns): which road, which side (1 left of its drawing direction,
   *  -1 right), the stretch (x or z range), and the inner and outer offsets from its centre line (m) */
  walks: [
    { at: [430, -339] as P2, side: 1, along: 'x' as const, range: [349, 505] as P2, off: [3.3, 5.0] as P2 },
    { at: [427, -357] as P2, side: 1, along: 'z' as const, range: [-374, -347] as P2, off: [2.5, 4.0] as P2 },
    { at: [427, -357] as P2, side: -1, along: 'z' as const, range: [-374, -347] as P2, off: [2.5, 4.0] as P2 },
    { at: [344.5, -400] as P2, side: -1, along: 'z' as const, range: [-428, -347] as P2, off: [3.3, 5.0] as P2 },
    { at: [510, -400] as P2, side: 1, along: 'z' as const, range: [-452, -347] as P2, off: [3.3, 5.0] as P2 },
  ],
};
/** the road a sidewalk runs beside: the mapped road nearest the point */
export function roadNear([x, z]: P2) {
  let best = -1, bd = Infinity;
  ROADS.forEach((r, ri) => {
    if (r.cls > 3) return;
    for (let i = 1; i < r.nodes.length; i++) { const d = segDist(x, z, xz(r.nodes[i - 1]), xz(r.nodes[i])); if (d < bd) { bd = d; best = ri; } }
  });
  return best;
}
