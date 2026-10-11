// The Jones-Quartey Building and La Road north of the avenue (the owner's main entrance brief, pairs 27-37; numbers in
// entrance.ts):
// - the K. A. B. Jones-Quartey Building: four tall white levels under a nearly flat projecting roof edge (low pale
//   metal roofs behind it). The south front a tall blank core standing forward with the name and four slot windows,
//   recessed bays of glass louvres either side between floor bands, blank white end walls, the ground floor open on
//   pilotis by the steps on the east (pair 32); the west side a long solid wall broken by groups of tall ribbed fins
//   (pair 33) into the recessed lightwell of the south-west corner (pair 34); the long east frontage over the parking:
//   broad blank upper panels between groups of narrow vertical fins, a dark gallery band, the fascia with the name, and
//   the open colonnade below with dark grilles behind its slender columns and a low white wall in front (pair 37); the
//   blue kiosk under its red roof before the south front; the grass strip and kerb along the parking (pairs 35, 37);
// - the red-earth approach across the lawn from the south-east (pairs 30, 31), long grass round it;
// - the one-storey white wings with red bases along La Road's east side (pairs 25, 27-29), the mural court among them:
//   its short white wall with the painted portrait, the paved court, the blue canopy, the big trees, a bin and a bench
//   (pairs 27, 28);
// - the Finance Directorate and Student Accounts Office: low white wings on a red base under dark roofs, their sign
//   on pale posts at the junction (pair 36).
import * as THREE from 'three';
import { BUILDINGS } from './campusmap';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { EN } from './entrance';
import { Bag, tuft, RED_BASE, SOFF, TILE, WALL, facesOf, gh, hash, lowWing, vnoise, wallSolids, type R4 } from './enkit';
import { gableTri } from './ias';
import { hipRoof } from './waccbip';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { letters } from './letters';
import { rectsOf } from './rectilinear';
import { SOLIDS } from './solids';
import type { Part } from './modelkit';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, WALL) };
const JO: [number, number] = [568.5, -58];

const jqbSpec: Spec = {
  name: 'K. A. B. Jones-Quartey Building', axis: [1, 0], origin: JO, storey: 3.6, style: PLAIN, roofColor: '#c8c4b8', fascia: '#f2f0ea', pitch: 0.18,
  replaces: [[568.5, -58]],
  onGround: true,
  blocks: [],
  keep: [[536 - JO[0], 600 - JO[0], -90 - JO[1], -10 - JO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(JO), J = EN.jqb, y = gh(568.5, -58) - 0.05, H = y + J.floors * J.fh + 0.2;
    const X0 = J.x0, X1 = J.x1, Z0 = J.z0, ZS = J.z1;
    const W2 = '#f4f3ee', DARK = '#26292b';
    // ---- the body: its walls set back where the colonnade, the recessed bays and the fins stand ----
    b.c.push([b.B(X0 + 0.5, X1 - 2.4, y - 0.3, H, Z0 + 0.4, ZS - 1.0), W2]);
    b.c.push([b.B(X1 - 2.4, X1 - 0.5, y + 4.05, H, Z0 + 0.4, ZS - 1.0), W2]);
    // ---- the roof: a thin edge slab standing out all round, three low pale metal roofs behind it ----
    const ov = 1.0;
    b.c.push([b.B(X0 - ov, X1 + ov, H - 0.15, H + 0.3, Z0 - ov, ZS + ov), '#f1efe9']);
    b.c.push([b.B(X0 - ov, X1 + ov, H - 0.17, H - 0.12, Z0 - ov, ZS + ov), '#c9c6be']);
    k.roof.c = new THREE.Color('#c8c4b8');
    for (let i = 0; i < 3; i++) {
      const a = X0 + ((X1 - X0) * i) / 3, c = X0 + ((X1 - X0) * (i + 1)) / 3;
      hipRoof(k, (x, z) => [x - JO[0], z - JO[1]], a + 0.3, c - 0.3, Z0 + 0.5, ZS - 0.5, H + 0.3, 0.16, 'z', [{ gw: 0, tri: false }, { gw: 0, tri: false }], b.c, '#e9e6de');
    }
    // fins: groups of narrow deep vertical blades standing out from a face, dark glazing behind them
    const fins = (alongX: boolean, at: number, out: number, a0: number, a1: number, y0: number, y1: number, gap = 0.34) => {
      const n = Math.floor((a1 - a0) / gap);
      b.grille.push(b.plane(alongX, at + out * 0.02, out, (a0 + a1) / 2, a1 - a0, y0, y1));
      for (let i = 0; i <= n; i++) {
        const a = a0 + i * gap;
        b.c.push([alongX ? b.B(a - 0.05, a + 0.05, y0, y1, Math.min(at, at + out * 0.75), Math.max(at, at + out * 0.75)) : b.B(Math.min(at, at + out * 0.75), Math.max(at, at + out * 0.75), y0, y1, a - 0.05, a + 0.05), W2]);
      }
    };
    // ---- the east frontage over the parking (pair 37) ----
    const ex = X1 - 0.5, gal0 = y + 4.05, gal1 = y + 4.75, band1 = y + 5.6;
    // the open colonnade: dark decorative grilles on the set-back wall, slender columns, the low white wall in front
    b.grille.push(b.plane(false, X1 - 2.38, 1, (Z0 + ZS) / 2, ZS - Z0 - 1.6, y, gal0 - 0.1));
    for (let z = Z0 + 1.2; z < ZS - 1; z += 4.0) { b.c.push([b.B(X1 - 0.38, X1 - 0.02, y, gal0, z - 0.18, z + 0.18), W2]); SOLIDS.add(X1 - 0.2, z, 0.3); }
    b.c.push([b.B(X1 - 0.3, X1, y - 0.2, y + 1.15, Z0 + 0.4, ZS - 4), '#f1efe9']);
    for (let z = Z0 + 1.6; z < ZS - 5; z += 1.3) b.grille.push(b.plane(false, X1 + 0.01, 1, z, 0.9, y + 0.55, y + 0.68));
    wallSolids(X1 - 0.15, Z0 + 0.4, X1 - 0.15, ZS - 4, 0.25);
    b.c.push([b.B(X1 - 2.4, X1, gal0 - 0.15, gal0, Z0 + 0.4, ZS - 1.0), SOFF]);
    // the fascia with the name, the dark gallery band above it
    b.c.push([b.B(X1 - 0.2, X1 + 0.2, gal0, gal1, Z0 + 0.2, ZS - 0.8), '#f6f5f0']);
    const lk = { ...k, plain: [] as Part[] } as Kit;
    letters(lk, 'K. A. B. JONES-QUARTEY BUILDING', X1 + 0.21 - JO[0], (gal0 + gal1) / 2, -56 - JO[1], Math.PI / 2, 0.36, 0.04, '#8a6a2e', { wide: 0.72, gap: 0.32, stroke: 0.2 });
    for (const p of lk.plain) b.c.push(p);
    b.grille.push(b.plane(false, ex - 0.1, 1, (Z0 + ZS) / 2, ZS - Z0 - 1.2, gal1, band1));
    // above: broad blank panels standing forward between groups of fins (not all alike)
    const span = ZS - 1.0 - (Z0 + 0.4), groups = 6, gw = 3.6;
    const pw = (span - groups * gw) / (groups + 1);
    for (let i = 0; i <= groups; i++) {
      const p0 = Z0 + 0.4 + i * (pw + gw), p1 = p0 + pw;
      b.c.push([b.B(ex, X1 + 0.25, band1, H - 0.15, p0, p1), '#f7f6f2']);
      if (i < groups) fins(false, ex + 0.05, 1, p1 + 0.15, p1 + gw - 0.1 - (i % 3) * 0.25, band1 + 0.25, H - 0.5);
    }
    // ---- the west side: a long solid wall broken by groups of tall ribbed fins (pair 33) ----
    for (let z = Z0 + 4; z < ZS - 6; z += 10.5) fins(false, X0 + 0.48, -1, z, z + 3.4, y + 3.2, H - 0.6, 0.3);
    b.c.push([b.B(X0 + 0.3, X0 + 0.5, y - 0.3, H, Z0 + 0.4, ZS - 1.0), '#f6f5f0']);
    // ---- the north side: bands of louvred windows ----
    for (let f = 1; f < J.floors; f++) for (let x = X0 + 3; x < X1 - 4; x += 5) b.win.push(b.plane(true, Z0 + 0.38, -1, x + 1.5, 3.2, y + f * J.fh + 0.9, y + f * J.fh + 2.6));
    // ---- the south front (pair 32) ----
    const C0 = 562.1, C1 = 575.2, CZ = -29.1;
    // the signed core standing forward: blank, four slot windows, the name
    b.c.push([b.B(C0, C1, y - 0.3, H + 0.1, ZS - 1.2, CZ), '#f7f6f2']);
    for (const yy of [2.4, 5.6, 10.0, 12.6]) b.grille.push(b.plane(true, CZ + 0.02, 1, (C0 + C1) / 2, 2.4, y + yy, y + yy + 0.5));
    const ck = { ...k, plain: [] as Part[] } as Kit;
    letters(ck, 'K. A. B. JONES-QUARTEY BUILDING', (C0 + C1) / 2 - JO[0], y + 7.9, CZ + 0.02 - JO[1], 0, 0.34, 0.04, '#9a7a34', { wide: 0.7, gap: 0.32, stroke: 0.2 });
    for (const p of ck.plain) b.c.push(p);
    // ribbed sides of the core (the stair tower's fins in pair 34)
    for (const [x, s] of [[C0, -1], [C1, 1]] as [number, number][]) fins(false, x + s * 0.02, s, ZS - 1.0, CZ - 0.4, y + 3.0, H - 0.4, 0.28);
    // the recessed louvre bays either side: floor bands standing out, piers, glass louvres
    for (const [a0, a1] of [[551.0, C0], [C1, 586.4]]) {
      b.c.push([b.B(a0, a1, y - 0.3, H, ZS - 1.4, ZS - 1.0), W2]);
      for (let f = 1; f <= J.floors; f++) b.c.push([b.B(a0, a1, y + f * J.fh - 0.25, y + f * J.fh + 0.05, ZS - 1.0, ZS - 0.4), '#efede7']);
      const n = Math.max(2, Math.round((a1 - a0) / 3.3));
      for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; b.c.push([b.B(a - 0.15, a + 0.15, y + J.fh, H, ZS - 1.0, ZS - 0.5), W2]); }
      for (let f = 1; f < J.floors; f++) for (let i = 0; i < n; i++) {
        const a = a0 + ((a1 - a0) * (i + 0.5)) / n;
        b.win.push(b.plane(true, ZS - 0.98, 1, a, (a1 - a0) / n - 0.5, y + f * J.fh + 0.35, y + (f + 1) * J.fh - 0.45));
      }
    }
    // the ground floor: grilles on the west, pilotis and steps on the east
    b.grille.push(b.plane(true, ZS - 1.38, 1, (551 + C0) / 2, C0 - 551 - 0.8, y, y + 3.0));
    for (const x of [578.5, 582.3, 586.0]) { b.c.push([b.B(x - 0.25, x + 0.25, y, y + J.fh, ZS - 0.6, ZS - 0.1), W2]); SOLIDS.add(x, ZS - 0.35, 0.35); }
    b.grille.push(b.plane(true, ZS - 1.38, 1, (C1 + 586.4) / 2, 586.4 - C1 - 0.6, y, y + 3.0));
    for (let i = 0; i < 5; i++) b.c.push([b.B(588.0, 592.6, y - 0.3, y + 0.15 * (5 - i), ZS - 0.2 + i * 0.32, ZS + 0.12 + i * 0.32), '#c9c2b4']);
    // the blank end walls
    for (const [a0, a1] of [[X0 + 0.3, 551.0], [586.4, X1]]) b.c.push([b.B(a0, a1, y - 0.3, H, ZS - 1.4, ZS + 0.2), '#f7f6f2']);
    k.signs.push({ text: 'UNIVERSITY OF GHANA BOOKSHOP', x: 556.5 - JO[0], y: y + 3.25, z: ZS - 1.36 - JO[1], ry: 0, w: 2.6, colors: ['#1d3f7a', '#ffffff'] });
    // the walls stop a bike
    wallSolids(X0, Z0, X1, Z0); wallSolids(X0, Z0, X0, ZS); wallSolids(X0, ZS, C0, ZS); wallSolids(C0, CZ, C1, CZ); wallSolids(C1, ZS, X1, ZS);
    // ---- the kiosk before the south front: a blue box under a red mono-pitch roof on posts, a white low wall ----
    const [kx0, kx1, kz0, kz1] = [566.5, 571.9, -19.2, -14.8], ky = gh(569, -17);
    b.c.push([b.B(kx0 + 0.5, kx1 - 0.6, ky, ky + 2.2, kz0 + 0.4, kz1 - 0.8), '#1f4fa0']);
    b.c.push([b.B(kx0, kx1, ky, ky + 1.0, kz1 - 0.2, kz1), '#f1efe9']);
    for (const [px, pz] of [[kx0, kz0], [kx1, kz0], [kx0, kz1], [kx1, kz1]]) { b.c.push([b.B(px - 0.06, px + 0.06, ky, ky + 2.9, pz - 0.06, pz + 0.06), '#3a3a3a']); SOLIDS.add(px, pz, 0.12); }
    const roofG = new THREE.BoxGeometry(kx1 - kx0 + 1.2, 0.1, kz1 - kz0 + 1.2).rotateX(-0.12).translate((kx0 + kx1) / 2 - JO[0], ky + 3.05, (kz0 + kz1) / 2 - JO[1]);
    b.c.push([roofG, '#b4532f']);
    wallSolids(kx0 + 0.5, kz0 + 0.4, kx1 - 0.6, kz0 + 0.4, 0.3); wallSolids(kx0, kz1 - 0.1, kx1, kz1 - 0.1, 0.25);
    // ---- the grass strip and kerb along the parking (pair 37) ----
    k.meshes.push(new THREE.Mesh(drapeAt(JO, X1 + 0.05, X1 + 2.3, Z0, ZS + 1, 0.4, 0.04, (x, z) => { const n = vnoise(x, z * 0.5); return [0.33 + n * 0.08, 0.48 + n * 0.06, 0.2]; }), groundCover()));
    b.c.push([b.B(X1 + 2.3, X1 + 2.5, y - 0.1, y + 0.15, Z0, ZS + 1), '#cfc9bc']);
    // ---- the red-earth approach and the long-grass lawn south of the building (pairs 30, 31) ----
    const E = EN.earth;
    const dPath = (x: number, z: number) => {
      let best = Infinity;
      for (let i = 0; i < E.pts.length - 1; i++) {
        const [ax, az] = E.pts[i], [bx, bz] = E.pts[i + 1], vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
        best = Math.min(best, Math.hypot(x - ax - vx * t, z - az - vz * t));
      }
      return best;
    };
    k.meshes.push(new THREE.Mesh(drapeAt(JO, 536, 600, -28.5, 40, 0.5, 0.05, (x, z) => {
      const n = vnoise(x * 0.25, z * 0.25), m = hash(Math.floor(x * 2), Math.floor(z * 2)), d = dPath(x, z) - (n - 0.5) * 3;
      // the worn earth: the track (wider and ragged), and the strip before the south front
      if (d < E.half || (z < -21 && z > -28.5 && x > 548 && x < 598 && n > 0.25)) {
        const v = 0.04 * (m - 0.5), rut = Math.abs(d) < 0.7 ? -0.04 : 0;
        return [0.66 + v + rut, 0.36 + v + rut, 0.22 + v];
      }
      if (d < E.half + 1.4 && m > 0.45) return [0.56, 0.42, 0.26];
      // elsewhere the lawn itself shows (no patch with an edge)
      return null;
    }), groundCover()));
    for (let i = 0; i < 260; i++) {
      const x = 536 + hash(i, 31) * 64, z = -27 + hash(i, 37) * 66;
      if (dPath(x, z) < E.half + 0.6 || z < -20) continue;
      const h = 0.5 + hash(i, 41) * 0.8;
      tuft(b, x, z, h, ['#8a9450', '#7d8a44', '#9a9a58', '#6b7a3a'][i % 4]);
    }
    for (let i = 0; i < 30; i++) { const t = hash(i, 51), [ax, az] = E.pts[0], [bx, bz] = E.pts[E.pts.length - 1], x = ax + (bx - ax) * t + (hash(i, 53) - 0.5) * 5, z = az + (bz - az) * t + (hash(i, 57) - 0.5) * 5; b.c.push([new THREE.IcosahedronGeometry(0.08 + hash(i, 59) * 0.1, 0).translate(x - JO[0], gh(x, z) + 0.04, z - JO[1]), '#a7a196']); }
    // mature trees framing the building without hiding the lettering
    for (const [x, z, h, s] of [[540, -12, 8.5, 14], [556, 4, 9, 15], [585, 8, 8, 13], [598.5, -10, 9, 14], [600, -50, 8.5, 13], [600, -78, 9, 14], [540, -86, 8, 13]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x * 5 + z, origin: JO });
    b.finish(k);
  },
};

// ---------- the one-storey wings along La Road's east side, the mural court, the Finance offices ----------
const LO: [number, number] = [660, 0];
/** a window pattern for a face of `len` metres: mostly windows, an AC unit here and there, a door now and then */
const pattern = (len: number, seed: number) => {
  const n = Math.max(1, Math.round(len / 3.1));
  let s = '';
  for (let i = 0; i < n; i++) { const h = hash(seed + i * 1.3, seed * 0.7 - i); s += h < 0.12 ? 'D' : h < 0.32 ? 'A' : h < 0.42 ? '-' : 'W'; }
  return s;
};
/** the La Road wings: footprints east of the road (x 636-690) between the College of Education and the gate wing */
const LA_WINGS = BUILDINGS.filter((bd) => bd.minX > 636 && bd.maxX < 690 && bd.minZ > -95 && bd.maxZ < 96);
const FIN_C: [number, number] = [654, -63];
const isFinance = (bd: (typeof LA_WINGS)[number]) => bd.minX < FIN_C[0] && bd.maxX > FIN_C[0] && bd.minZ < FIN_C[1] && bd.maxZ > FIN_C[1];
const ringOf = (bd: (typeof LA_WINGS)[number]) => { const r: [number, number][] = []; for (let i = 0; i < bd.pts.length; i += 2) r.push([bd.pts[i], bd.pts[i + 1]]); return r; };
/** a point well inside a footprint (the centre of its largest rectangle) */
const inner = (bd: (typeof LA_WINGS)[number]): [number, number] => {
  const rs = rectsOf(ringOf(bd)), r = rs.reduce((m, q) => ((q[1] - q[0]) * (q[3] - q[2]) > (m[1] - m[0]) * (m[3] - m[2]) ? q : m), rs[0]);
  return [(r[0] + r[1]) / 2, (r[2] + r[3]) / 2];
};

const laRoadSpec: Spec = {
  name: 'La Road wings and the mural court', axis: [1, 0], origin: LO, storey: 3.4, style: PLAIN, roofColor: TILE, fascia: '#4a3328', pitch: 0.45, plinth: RED_BASE,
  replaces: LA_WINGS.map(inner),
  onGround: true,
  blocks: [],
  keep: [[636 - LO[0], 690 - LO[0], -95 - LO[1], 96 - LO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(LO);
    LA_WINGS.forEach((bd, wi) => {
      const fin = isFinance(bd), rects = rectsOf(ringOf(bd));
      for (const [ri, r] of rects.entries()) {
        const seed = wi * 17 + ri * 5, along = r[1] - r[0] >= r[3] - r[2] ? 'x' : 'z';
        const faces = { z0: pattern(r[1] - r[0], seed), z1: pattern(r[1] - r[0], seed + 3), x0: pattern(r[3] - r[2], seed + 7), x1: pattern(r[3] - r[2], seed + 11) };
        // rectangles touching each other share one roof line (no faces where they meet)
        lowWing(k, b, r as R4, { eave: fin ? 3.2 : 3.4, faces, along, roof: fin ? '#5b5550' : TILE, y: gh((r[0] + r[1]) / 2, (r[2] + r[3]) / 2) });
      }
      // the Archaeology wing's west end toward the junction: a small gable-fronted white end (pair 36, right)
      if (bd.name?.startsWith('Department of Archaelogy')) gableTri(b, false, 638.1, -1, -12.2 - 0.9, -5.4 + 0.9, gh(640, -9) + 3.4 - 0.2, 0.45);
    });
    // the Finance sign on its pale posts at the junction (only the heading is readable)
    const [sx, sz] = [634.6, -48.2], sy = gh(sx, sz);
    for (const dz of [-0.85, 0.85]) b.c.push([b.B(sx - 0.07, sx + 0.07, sy, sy + 2.9, sz + dz - 0.07, sz + dz + 0.07), '#e8e6e0']);
    b.c.push([b.B(sx - 0.04, sx + 0.04, sy + 1.2, sy + 2.8, sz - 0.95, sz + 0.95), '#f4f3ef']);
    k.signs.push({ text: 'FINANCE DIRECTORATE', x: sx - 0.06 - LO[0], y: sy + 2.5, z: sz - LO[1], ry: -Math.PI / 2, w: 1.7, colors: ['#f4f3ef', '#1d3f7a'] });
    for (let i = 0; i < 5; i++) b.c.push([b.B(sx - 0.06, sx - 0.05, sy + 1.4 + i * 0.16, sy + 1.45 + i * 0.16, sz - 0.7, sz + 0.2 + (i % 2) * 0.4), '#8c9096']);
    SOLIDS.add(sx, sz - 0.85, 0.15); SOLIDS.add(sx, sz + 0.85, 0.15);
    // ---- the mural court (pairs 27, 28) ----
    const [mx0, mx1, mz0, mz1] = EN.muralCourt;
    k.meshes.push(new THREE.Mesh(drapeAt(LO, mx0, mx1, mz0, mz1, 0.25, 0.05, (x, z) => {
      const row = Math.floor(z / 0.2), col = Math.floor((x + (row % 2) * 0.15) / 0.3), t = hash(col, row) * 0.07, n = vnoise(x * 0.4, z * 0.4);
      return n > 0.78 ? [0.42, 0.33, 0.24] : [0.62 - t, 0.58 - t, 0.52 - t];
    }), groundCover()));
    // the short white wall with the portrait, facing the road
    const wy = gh(mx0 + 2, 55), wz0 = 50.2, wz1 = 55.4, wx = mx0 + 2.4;
    b.c.push([b.B(wx, wx + 0.25, wy, wy + 2.1, wz0, wz1), WALL], [b.B(wx - 0.03, wx + 0.28, wy, wy + 0.4, wz0, wz1), RED_BASE], [b.B(wx - 0.05, wx + 0.3, wy + 2.1, wy + 2.2, wz0 - 0.05, wz1 + 0.05), '#e3dfd5']);
    const mural = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.25).rotateY(-Math.PI / 2).translate(wx - 0.01 - LO[0], wy + 1.25, 53.6 - LO[1]), new THREE.MeshStandardMaterial({ map: portraitTex(), roughness: 0.8 }));
    k.meshes.push(mural);
    wallSolids(wx + 0.12, wz0, wx + 0.12, wz1, 0.25);
    // the blue canopy beyond: a tarpaulin on thin poles
    const cy = gh(664, 56);
    for (const [px, pz] of [[660, 52], [668, 52], [660, 60], [668, 60]]) { b.c.push([b.B(px - 0.05, px + 0.05, cy, cy + 2.7, pz - 0.05, pz + 0.05), '#8a8d90']); SOLIDS.add(px, pz, 0.1); }
    b.c.push([new THREE.BoxGeometry(9, 0.06, 9).rotateZ(0.06).translate(664 - LO[0], cy + 2.8, 56 - LO[1]), '#2a64b8']);
    // the green bin and the blue and white bench by the wall
    b.c.push([new THREE.CylinderGeometry(0.32, 0.28, 0.95, 12).translate(wx + 1.0 - LO[0], wy + 0.47, 56.4 - LO[1]), '#2f7d3a'], [new THREE.CylinderGeometry(0.34, 0.34, 0.08, 12).translate(wx + 1.0 - LO[0], wy + 0.98, 56.4 - LO[1]), '#24652e']);
    SOLIDS.add(wx + 1.0, 56.4, 0.35);
    b.c.push([b.B(wx + 1.8, wx + 2.3, wy + 0.42, wy + 0.5, 57.0, 58.8), '#f2f2f0'], [b.B(wx + 2.25, wx + 2.35, wy + 0.5, wy + 0.95, 57.0, 58.8), '#2a64b8']);
    for (const z of [57.1, 58.7]) b.c.push([b.B(wx + 1.85, wx + 2.3, wy, wy + 0.42, z - 0.04, z + 0.04), '#2a64b8']);
    // the very large trees round the court's entrance, their crowns closing over it, fallen leaves
    for (const [x, z, h, s] of [[636.8, 49.0, 9.5, 17], [637.5, 63.0, 10, 18], [652, 57, 8.5, 13], [636.5, 20, 8.5, 14], [636.8, 2, 9, 15], [636.5, -20, 8.5, 14], [636.7, 75, 9, 15]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x + z * 3, origin: LO });
    b.finish(k);
  },
};

let portraitT: THREE.CanvasTexture | null = null;
/** the painted portrait on the court's wall: a figure in red robes on a pale ground, a frame (generic, not a likeness) */
function portraitTex() {
  if (portraitT) return portraitT;
  const c = document.createElement('canvas'); c.width = 128; c.height = 100; const g = c.getContext('2d')!;
  g.fillStyle = '#efe8da'; g.fillRect(0, 0, 128, 100);
  g.fillStyle = '#b8402e'; g.beginPath(); g.ellipse(48, 82, 26, 26, 0, Math.PI, 0); g.fill(); g.fillRect(22, 80, 52, 20);
  g.fillStyle = '#5a3a24'; g.beginPath(); g.ellipse(48, 46, 13, 16, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1e1a18'; g.beginPath(); g.ellipse(48, 34, 14, 8, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#c9a54a'; g.fillRect(84, 30, 34, 4); g.fillRect(84, 40, 28, 3); g.fillRect(84, 48, 30, 3);
  g.strokeStyle = '#7a5a3a'; g.lineWidth = 3; g.strokeRect(2, 2, 124, 96);
  portraitT = new THREE.CanvasTexture(c); portraitT.colorSpace = THREE.SRGBColorSpace; return portraitT;
}
void facesOf;

export const jqbSite = createSite('jones-quartey', [jqbSpec, laRoadSpec]);
