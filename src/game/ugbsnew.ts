// The new UGBS graduate building south of the red-roof Graduate Block, from the owner's Okponglo signals and UGBS brief
// (docs/ugbs-new/ledger.md; numbers in bpiplan.ts UGBS_NEW). Its current state (pictures 7/8) over the older frame views:
// - the projecting convex rounded wing at the west: four blue-glass bands between cream slab bands, the ground storey
//   reddish with discrete tall glazed openings under a cream band, a thin broad cream canopy following the curve;
// - the opaque core behind it: cream surfaces with reddish vertical sections;
// - the rectangular wings (north, the one seen past the billboard in picture 7, and south): broad blue glazing between
//   dark mullions and cream slab bands, inset terrace bays with cream reveals and guard rails, reddish end sections, the
//   projecting pale cap with its outer cantilever and angled strut at the north-west corner;
// - the site: bare red-brown working ground inside the boundary, rough grass and shrubs at the road side, the globe-topped
//   site lights. Hidden faces, the central entrance and the rear are provisional (listed in the ledger).
import * as THREE from 'three';
import { createSite, type Kit, type Spec, type Style } from './blocks';
import { box, type Part } from './modelkit';
import { curtain, prism, strip } from './medkit';
import { SOLIDS } from './solids';
import { wallSolids } from './enkit';
import { coverOverlay, hash2, vnoise2 } from './scrubkit';
import { UGBS_NEW } from './bpiplan';

type P2 = [number, number];
type R4 = [number, number, number, number];
const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => { g.fillStyle = '#ece6d6'; g.fillRect(0, 0, 256, 512); } };
const CREAM = '#ece6d6', RED = '#9a4a3a', DARK = '#26323d', MULL = '#2b3036';
/** the floor levels: a taller ground storey, then four upper storeys; the roof at TOP */
const G = 4.2, ST = 3.6, TOP = G + 4 * ST;
const floorY = (f: number) => G + (f - 1) * ST;

const O: P2 = [1040, -655];
const L = (x: number, z: number): P2 => [x - O[0], z - O[1]];
const { round: R, core: CORE, north: NW, south: SW } = UGBS_NEW;

/** the rounded wing's outline (world): the west half of the ellipse, closed along x = R.east */
function dShape(grow = 0, n = 28): P2[] {
  const pts: P2[] = [[R.east, R.c[1] + R.rz + grow]];
  for (let i = 0; i <= n; i++) { const a = Math.PI / 2 + (i / n) * Math.PI; pts.push([R.c[0] + Math.cos(a) * (R.rx + grow), R.c[1] + Math.sin(a) * (R.rz + grow)]); }
  pts.push([R.east, R.c[1] - R.rz - grow]);
  return pts;
}
const arcOnly = (grow = 0, n = 28) => dShape(grow, n).slice(1, -1);

/** a glazed face of a rectangular wing, floor by floor: glass bays at the face, inset terrace bays set back with cream
 *  reveals and a rail; cream slab bands; the face runs from a to b (world), its outward normal n */
function glazedFace(c: Part[], k: Kit, a: P2, b: P2, n: P2, recess: number[][]) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]), nb = Math.max(1, Math.round(len / 3.6)), ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
  const at = (s: number, o: number): P2 => L(a[0] + ux * s + n[0] * o, a[1] + uz * s + n[1] * o);
  for (let f = 1; f <= 4; f++) {
    const y0 = floorY(f), y1 = y0 + ST;
    // the slab band at the floor, standing out a little
    c.push([strip([at(-0.3, 0.25), at(len + 0.3, 0.25)], y0 - 0.05, y0 + 0.42, 0.5), CREAM]);
    for (let i = 0; i < nb; i++) {
      const s0 = (len * i) / nb, s1 = (len * (i + 1)) / nb;
      if (recess[f - 1]?.includes(i)) {
        // the inset bay: glass 1.6 m back, cream reveals and soffit, a guard rail at the face
        curtain(k, [at(s0 + 0.15, -1.6), at(s1 - 0.15, -1.6)], y0 + 0.42, y1 - 0.05);
        for (const s of [s0 + 0.1, s1 - 0.1]) c.push([strip([at(s, 0), at(s, -1.6)], y0 + 0.42, y1, 0.2), CREAM]);
        c.push([strip([at(s0, -0.8), at(s1, -0.8)], y1 - 0.35, y1, 1.6), CREAM]);
        c.push([strip([at(s0, 0.05), at(s1, 0.05)], y0 + 1.05, y0 + 1.12, 0.06), '#d9dcdf']);
        for (let s = s0 + 0.4; s < s1; s += 0.9) c.push([strip([at(s, 0.05), at(s + 0.04, 0.05)], y0 + 0.42, y0 + 1.1, 0.04), '#d9dcdf']);
      } else {
        curtain(k, [at(s0, 0.02), at(s1, 0.02)], y0 + 0.42, y1 - 0.02);
        c.push([strip([at(s0 + 0.03, 0.06), at(s0 + 0.09, 0.06)], y0 + 0.42, y1, 0.06), MULL]);
      }
    }
  }
}

const building: Spec = {
  name: 'UGBS new graduate building', axis: [1, 0], origin: O, storey: ST, style: PLAIN, roofColor: CREAM, fascia: CREAM, pitch: 0,
  blocks: [], onGround: true,
  keep: [[UGBS_NEW.site[0] - O[0], UGBS_NEW.site[1] - O[0], UGBS_NEW.site[2] - O[1], UGBS_NEW.site[3] - O[1]]],
  extras: (k) => {
    const c: Part[] = [];
    // ===== the rounded wing =====
    { const inner = dShape(-0.35).map(([x, z]) => L(x, z));
      c.push([prism(inner, 0, TOP), DARK]);
      const arc = arcOnly(0.02).map(([x, z]) => L(x, z)), band = arcOnly(0.25).map(([x, z]) => L(x, z));
      for (let f = 1; f <= 4; f++) {
        const y0 = floorY(f);
        curtain(k, arc, y0 + 0.42, y0 + ST - 0.02);
        c.push([strip(band, y0 - 0.05, y0 + 0.42, 0.5), CREAM]);
        // dark mullions following the curve
        for (let i = 0; i < arc.length; i += 2) c.push([box(arc[i][0] - 0.05, arc[i][0] + 0.05, y0 + 0.42, y0 + ST, arc[i][1] - 0.05, arc[i][1] + 0.05), MULL]);
      }
      // the ground storey: reddish infill, discrete tall glazed openings, the cream band over it
      const gArc = arcOnly(0.15, 40).map(([x, z]) => L(x, z));
      c.push([strip(gArc, 0, G - 0.6, 0.3), RED], [strip(band, G - 0.6, G - 0.05, 0.5), CREAM]);
      for (let i = 3; i < gArc.length - 2; i += 5) { const [x, z] = gArc[i]; c.push([box(x - 0.8, x + 0.8, 0.1, G - 0.9, z - 0.8, z + 0.8).translate(0, 0, 0), '#35506a']); }
      // the thin broad canopy following the curve, its underside ribs
      const can = dShape(2.4).map(([x, z]) => L(x, z));
      c.push([prism(can, TOP + 0.15, TOP + 0.55), CREAM]);
      const rim = arcOnly(2.3).map(([x, z]) => L(x, z));
      for (let i = 0; i < rim.length; i += 2) { const [x, z] = rim[i], [cx, cz] = L(...R.c); c.push([strip([[x, z], [x + (cx - x) * 0.18, z + (cz - z) * 0.18]], TOP + 0.05, TOP + 0.15, 0.08), '#d6cfbd']); }
      const ring = dShape(0.4); for (let i = 1; i < ring.length; i++) wallSolids(ring[i - 1][0], ring[i - 1][1], ring[i][0], ring[i][1], 0.3); }
    // ===== the opaque core: cream with reddish vertical sections =====
    { const [x0, x1, z0, z1] = CORE, [a0, b0] = L(x0, z0), [a1, b1] = L(x1, z1);
      c.push([box(a0, a1, 0, TOP + 1.2, b0, b1), CREAM]);
      for (const z of [b0 + 2, b1 - 4]) c.push([box(a0 - 0.08, a0, 0, TOP + 1.2, z, z + 2), RED]);
      c.push([box(a0 - 0.3, a1 + 0.3, TOP + 1.2, TOP + 1.5, b0 - 0.3, b1 + 0.3), CREAM]);
      wallSolids(x0, z0, x1, z0, 0.3); wallSolids(x1, z0, x1, z1, 0.3); wallSolids(x0, z1, x1, z1, 0.3); wallSolids(x0, z0, x0, z1, 0.3); }
    // ===== the rectangular wings =====
    const wing = (r: R4, faces: { a: P2; b: P2; n: P2; recess: number[][] }[], cap: { ext?: R4; strut?: [number, number, number, number, number, number] }) => {
      const [x0, x1, z0, z1] = r, [a0, b0] = L(x0, z0), [a1, b1] = L(x1, z1);
      c.push([box(a0 + 0.3, a1 - 0.3, 0, TOP, b0 + 0.3, b1 - 0.3), DARK]);
      // the unglazed faces: cream with reddish sections (provisional where unseen)
      c.push([box(a0 + 0.35, a1 - 0.35, G, TOP, b0 + 0.35, b1 - 0.35), CREAM]);
      for (const f of faces) glazedFace(c, k, f.a, f.b, f.n, f.recess);
      // reddish end sections, the ground storey's reddish infill and tall openings, the cream band over it
      c.push([box(a0, a0 + 2.2, G, TOP, b0 - 0.05, b0 + 0.3), RED], [box(a1 - 2.2, a1, G, TOP, b1 - 0.3, b1 + 0.05), RED]);
      c.push([box(a0 + 0.1, a1 - 0.1, 0, G - 0.6, b0 + 0.1, b1 - 0.1), RED], [box(a0 - 0.2, a1 + 0.2, G - 0.6, G, b0 - 0.2, b1 + 0.2), CREAM]);
      for (const f of faces) { const len = Math.hypot(f.b[0] - f.a[0], f.b[1] - f.a[1]), ux = (f.b[0] - f.a[0]) / len, uz = (f.b[1] - f.a[1]) / len;
        for (let s = 3; s < len - 2; s += 5) { const [x, z] = L(f.a[0] + ux * s + f.n[0] * 0.12, f.a[1] + uz * s + f.n[1] * 0.12); c.push([box(x - (uz ? 0.06 : 0.8), x + (uz ? 0.06 : 0.8), 0.1, G - 0.9, z - (ux ? 0.06 : 0.8), z + (ux ? 0.06 : 0.8)), '#35506a']); } }
      // the projecting pale cap, its cantilever and strut
      c.push([box(a0 - 1.2, a1 + 1.2, TOP, TOP + 0.55, b0 - 1.2, b1 + 1.2), CREAM]);
      if (cap.ext) { const [e0, e1, f0, f1] = cap.ext, [p0, q0] = L(e0, f0), [p1, q1] = L(e1, f1); c.push([box(p0, p1, TOP + 0.05, TOP + 0.5, q0, q1), CREAM]); for (let x = p0 + 0.5; x < p1; x += 1.2) c.push([box(x - 0.04, x + 0.04, TOP - 0.05, TOP + 0.05, q0, q1), '#cfc8b5']); }
      if (cap.strut) { const [sx, sy, sz, ex, ey, ez] = cap.strut, [lsx, lsz] = L(sx, sz), [lex, lez] = L(ex, ez), d = new THREE.Vector3(lex - lsx, ey - sy, lez - lsz), g = new THREE.CylinderGeometry(0.09, 0.09, d.length(), 8);
        g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())); c.push([g.translate((lsx + lex) / 2, (sy + ey) / 2, (lsz + lez) / 2), '#5d6166']); }
      wallSolids(x0, z0, x1, z0, 0.3); wallSolids(x1, z0, x1, z1, 0.3); wallSolids(x0, z1, x1, z1, 0.3); wallSolids(x0, z0, x0, z1, 0.3);
    };
    // the north wing: its west face toward the avenue (picture 7: the inset bays at varying places floor by floor) and
    // its north face; the cap's long projection north-west with the angled strut (picture 7 callout 4, picture 8 callout 4)
    wing(NW, [
      { a: [NW[0], NW[2]], b: [NW[0], NW[3]], n: [-1, 0], recess: [[2], [0, 4], [1, 3], [5]] },
      { a: [NW[1], NW[2]], b: [NW[0], NW[2]], n: [0, -1], recess: [[], [3], [], [1]] },
    ], { ext: [NW[0] - 4.5, NW[0] + 6, NW[2] - 5.5, NW[2] - 1.2], strut: [NW[0] + 0.2, TOP - 4, NW[2] - 0.2, NW[0] - 3.8, TOP + 0.05, NW[2] - 4.8] });
    // the south wing: its west face beside the rounded wing and its south face
    wing(SW, [
      { a: [SW[0], SW[3]], b: [SW[0], SW[2]], n: [-1, 0], recess: [[1], [], [3], []] },
      { a: [SW[0], SW[3]], b: [SW[1], SW[3]], n: [0, 1], recess: [[4], [1, 6], [3], [8]] },
    ], {});
    // ===== the site: globe-topped site lights along the road side (pictures 7, 8) =====
    for (let z = -690; z <= -624; z += 13) { const x = 955, [lx, lz] = L(x, z); c.push([box(lx - 0.05, lx + 0.05, 0, 3.6, lz - 0.05, lz + 0.05), '#3a3d40'], [new THREE.SphereGeometry(0.22, 10, 8).translate(lx, 3.8, lz), '#f4f2ea']); SOLIDS.add(x, z, 0.15); }
    k.plain.push(...c);
  },
};

/** the new UGBS graduate building */
export const ugbsNewSite = createSite('ugbs-new', [building]);

/** the site's bare red-brown working ground, with rough grass at its edges (world frame) */
export function buildUgbsNewGrounds() {
  const group = new THREE.Group();
  group.name = 'ugbs-new-grounds';
  const [x0, x1, z0, z1] = UGBS_NEW.site;
  const color = (x: number, z: number): [number, number, number, number] | null => {
    const e = Math.min(x - x0, x1 - x, z - z0, z1 - z);
    if (e < 0) return null;
    const n = vnoise2(x / 6, z / 6), t = hash2(Math.floor(x * 2), Math.floor(z * 2)) * 0.06;
    // (rough grass thinning into the working ground at the edges, blended, not stamped: the owner's soil and grass brief)
    const gr = Math.min(1, Math.max(0, 1 - (e - 1 - n * 3) / 3));
    return [150 - 32 * gr - t * 200, 92 + 30 * gr - t * 120, 62 + 8 * gr - t * 80, 0.9 - 0.25 * gr];
  };
  const soil = coverOverlay({ box: [x0, x1, z0, z1], mpp: 0.5, cell: 2, tile: 106, color, pixelEdge: true, cellIn: (x, z) => x > x0 && x < x1 && z > z0 && z < z1 });
  for (const m of soil) m.userData.noRelief = true;
  group.add(...soil);
  return group;
}
