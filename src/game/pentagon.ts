// Pentagon (Pent), modelled from the owner's labelled aerial and photos (block engine: blocks.ts).
//
// Old Pent: four courts in a row, west to east from the entrance on Annie Jiagge Road (owner's third reference PDF)
// Addis Ababa, Dar es Salaam, (the admin block), Kampala and Nairobi, all one design (court() below): four
// three-storey cream wings round a cross of open gaps, each wing's outer end a gabled pavilion with an arched recess,
// the stair core set back between them with breeze-block screens, a gabled porch at its foot on the road. The admin
// block (Ghana Hostels) sits in the middle (admin below). The entrance with its security post, the kiosk before Addis
// Ababa and the food building behind Nairobi are modelled here too.
//
// New Pent Blocks A, B and C are modelled in newpent.ts; leftover small footprints in their zone keep the generic
// builder in cream under terracotta (newPentStyle).
import * as THREE from 'three';
import type { Building } from './campusmap';
import { PAVE, TRIM, WHITE, box, merge, tri2, type Part } from './modelkit';
import { breeze, brickFace, concrete, panel } from './concrete';
import { hipRoof } from './waccbip';
import { SOLIDS } from './solids';
import { PL, createSite, gableZ, render, slab, window_, type Kit, type Spec, type Style } from './blocks';

const RED_BASE = '#b4523a', BRICK = '#a5533a', FASCIA = '#3a2c26';

/** the admin block: white render, wide white-framed windows */
const ADMIN_WIN: Style = {
  bay: 3.6,
  up: [[48, 70, 160, 100]],
  ground: [[40, 60, 176, 150]],
  draw: (g) => {
    render(g, '#f7f6f2');
    window_(g, [48, 70, 160, 100], '#f2f2ee', 3, 0.3);
    slab(g, 232, 24);
    window_(g, [40, 256 + 60, 176, 150], '#4a4038', 4, 0.25);
  },
};

// ---------- Old Pent courts ----------
// court frame: x along the row (the courts are turned about 5 degrees), z to the south; the north face (the front, on
// the road) is z = -16, the back z = 16.
// From the owner's third reference PDF (Kampala's front and porch, Addis and Dar es Salaam from the road, Nairobi's
// back): three storeys of cream render with plain pilasters between the bays, a dark louvred window in each bay, a
// deep red base. Each of the four wings shows its outer end, front and back, as a gabled pavilion standing a little
// forward, a tall arched recess up its middle with a window in it on every floor, the roof's dark fascias; the wings
// themselves hipped. The middle (the stair core) stands back between them, breeze-block screens at its landings, its
// own low hip; at its foot the porch: a rendered gable on two cream columns over an arched opening, the court's
// plate (its initials and name) on the gable, a flight of steps between red kerbs edging beds of gravel. Before it a
// walk of brick pavers between kerbed lawns, a fan palm with a whitewashed trunk either side and a solar lamp; asphalt
// parking with marked bays along the rest of the front. At the back the stair core's ground floor holds storerooms
// behind red doors between white pilasters; a slab walk along the walls, the ground bare earth and leaf litter under
// the trees, a black water tank on its plinth.
const COURT_AXIS: [number, number] = [0.9964, -0.085];
const C3 = 3, CST = 3.2, CREAM = '#efe9da', CREAM2 = '#e9dfc4', DEEP_RED = '#a8382c', LOUVRE = '#1f1d1b';
/** Pent's metal fence and gates: cream painted bars (the owner's second Pent corrections) */
export const PENT_CREAM = '#ddd0ac';
/** cream render, a pilaster at each bay's edge, a dark louvred window in each bay, the deep red base */
const OLD_WIN: Style = {
  bay: 3.0,
  up: [[86, 58, 84, 120]],
  ground: [[86, 256 + 58, 84, 120]],
  draw: (g) => {
    render(g, CREAM);
    for (const y0 of [0, 256]) {
      g.fillStyle = '#f6f2e7'; g.fillRect(0, y0, 22, 256); g.fillRect(234, y0, 22, 256);
      g.fillStyle = 'rgba(120,110,90,0.22)'; g.fillRect(22, y0, 4, 256); g.fillRect(230, y0, 4, 256);
      g.fillStyle = '#d8d1bf'; g.fillRect(80, y0 + 52, 96, 132);
      // glass louvre blades in a dark frame (the owner: Pent's windows are glass louvres, dark grey to the eye)
      g.fillStyle = LOUVRE; g.fillRect(86, y0 + 58, 84, 120);
      for (let y = y0 + 62; y < y0 + 174; y += 9) { g.fillStyle = '#3d4246'; g.fillRect(89, y, 78, 6); g.fillStyle = '#565d62'; g.fillRect(89, y, 78, 1); g.fillStyle = '#1d2023'; g.fillRect(89, y + 6, 78, 2); }
      g.fillStyle = LOUVRE; g.fillRect(126, y0 + 58, 4, 120);
      g.fillStyle = '#e6e1d4'; g.fillRect(80, y0 + 180, 96, 6);
    }
    g.fillStyle = DEEP_RED; g.fillRect(0, 448, 256, 64);
  },
};
interface CourtMore { sign: string; initials: string; extras?: (k: Kit, M: (x: number, z: number) => [number, number]) => void }
function court(name: string, origin: [number, number], replaces: [number, number][], more: CourtMore): Spec {
  const M = (x: number, z: number): [number, number] => [x, z];
  return {
    name,
    axis: COURT_AXIS, origin, storey: CST, style: OLD_WIN, roofColor: '#b4532f', fascia: FASCIA, pitch: 0.45,
    replaces,
    blocks: [
      { x0: -19.5, x1: -2.5, z0: -16, z1: -1.5, floors: C3 },
      { x0: 2.5, x1: 19.5, z0: -16, z1: -1.5, floors: C3 },
      { x0: -19.5, x1: -2.5, z0: 1.5, z1: 16, floors: C3 },
      { x0: 2.5, x1: 19.5, z0: 1.5, z1: 16, floors: C3 },
      // the stair core, standing back between the wings
      { x0: -2.5, x1: 2.5, z0: -14, z1: 14, floors: C3, roof: 'none' },
    ],
    keep: [[-9.5, 9.5, -24, -14], [-21, 21, 16, 26], [-31, -19.5, -18, 18], [19.5, 31, -22, 18]],
    extras: (k) => {
      const e = k.wallTop(C3), c: Part[] = [];
      // the core's low hip
      hipRoof(k, M, -3.1, 3.1, -14.6, 14.6, e - 0.3, 0.45, 'z', [{ gw: 0, tri: false }, { gw: 0, tri: false }], c, FASCIA);
      // ----- the gabled pavilions on the wings' outer ends, front and back
      for (const xm of [-11, 11]) for (const s of [-1, 1]) {
        const f = s * 16, out = f + s * 0.5, hw = 4.2;
        c.push([box(xm - hw, xm + hw, 0, e, Math.min(f, out), Math.max(f, out)), CREAM]);
        k.plain.push([box(xm - hw - 0.01, xm + hw + 0.01, 0, 0.9, Math.min(f, out) - 0.01, Math.max(f, out) + 0.01), DEEP_RED]);
        // the cross gable: two tiled slopes back into the hipped roof, the cream gable, dark rakes
        const top = e + (hw + 0.5) * 0.6, za = out + s * 0.6, zb = s * 7.5;
        k.roof.c = new THREE.Color('#b4532f');
        k.roof.quad([xm - hw - 0.5, e, za], [xm - hw - 0.5, e, zb], [xm, top, zb], [xm, top, za]);
        k.roof.quad([xm + hw + 0.5, e, zb], [xm + hw + 0.5, e, za], [xm, top, za], [xm, top, zb]);
        k.plain.push([tri2([xm - hw, e - 0.02, out + s * 0.02], [xm + hw, e - 0.02, out + s * 0.02], [xm, top - 0.3, out + s * 0.02]), CREAM]);
        const rake = Math.hypot(hw + 0.5, top - e), ang = Math.atan2(top - e, hw + 0.5);
        for (const sx of [-1, 1]) k.plain.push([new THREE.BoxGeometry(rake, 0.32, 0.08).rotateZ(-sx * ang).translate(xm + (sx * (hw + 0.5)) / 2, (e + top) / 2, za), FASCIA]);
        k.plain.push([box(xm - hw - 0.5, xm + hw + 0.5, e - 0.28, e, za - 0.05, za + 0.05), FASCIA]);
        // the tall arched recess up the middle, a window in it on each floor; a window each side
        const fz = out + s * 0.012;
        k.plain.push([box(xm - 1.2, xm + 1.2, 0.9, e - 1.6, fz - 0.006, fz + 0.006), '#ddd3bb']);
        k.plain.push([new THREE.CircleGeometry(1.2, 18, 0, Math.PI).rotateY(s > 0 ? 0 : Math.PI).translate(xm, e - 1.6, fz), '#ddd3bb']);
        for (let fl = 0; fl < C3; fl++) {
          const y = PL + fl * CST + 0.7;
          for (const dx of [0, -2.9, 2.9]) {
            const w = dx === 0 ? 0.65 : 0.55, zz = out + s * 0.03;
            k.plain.push([box(xm + dx - w, xm + dx + w, y, y + 1.55, zz - 0.012, zz + 0.012), LOUVRE]);
            for (let yy = y + 0.12; yy < y + 1.5; yy += 0.16) k.plain.push([box(xm + dx - w + 0.05, xm + dx + w - 0.05, yy, yy + 0.09, zz - 0.02 + (s > 0 ? 0.03 : 0), zz + 0.02 - (s > 0 ? 0 : 0.03)), '#3d4246']);
          }
        }
      }
      // ----- the breeze-block screens at the core's landings, front and back
      for (const fz of [-14.03, 14.03]) panel([0, 0], k, breeze(), -1.6, fz, 1.6, fz, PL + CST + 0.4, e - 0.6, 0.4);
      // ----- the porch at the foot of the core
      const P0 = -18.2, pw = 2.3, ph = 3.3, ptop = ph + 1.5;
      c.push([box(-pw, pw, 0, 0.62, P0, -14), '#d9d2c2']);
      for (let i = 0; i < 4; i++) c.push([box(-1.8, 1.8, 0, 0.62 - 0.155 * i, P0 - 0.35 * (i + 1), P0 - 0.35 * i), '#e2ddd2']);
      for (const x of [-pw + 0.2, pw - 0.2]) c.push([box(x - 0.2, x + 0.2, 0.62, ph, P0 + 0.05, P0 + 0.45), CREAM2]);
      for (const x of [-pw, pw - 0.15]) c.push([box(x, x + 0.15, 0.62, ph, P0 + 0.45, -14), CREAM2]);
      c.push([box(-pw - 0.1, pw + 0.1, ph, ph + 0.35, P0 - 0.05, -14), CREAM2]);
      k.plain.push([new THREE.CircleGeometry(1.35, 18, 0, Math.PI).rotateY(Math.PI).translate(0, ph - 1.2, P0 + 0.04), '#cfc5a6']);
      k.plain.push([box(-1.9, 1.9, ph - 1.25, ph, P0 + 0.06, P0 + 0.1), '#e3dac0']);
      k.plain.push([tri2([-pw - 0.3, ph + 0.35, P0 - 0.06], [pw + 0.3, ph + 0.35, P0 - 0.06], [0, ptop, P0 - 0.06]), CREAM2]);
      k.roof.c = new THREE.Color('#d8cdb0');
      k.roof.quad([-pw - 0.35, ph + 0.33, P0 - 0.1], [-pw - 0.35, ph + 0.33, -14], [0, ptop, -14], [0, ptop, P0 - 0.1]);
      k.roof.quad([pw + 0.35, ph + 0.33, -14], [pw + 0.35, ph + 0.33, P0 - 0.1], [0, ptop, P0 - 0.1], [0, ptop, -14]);
      k.plain.push([box(-1.35, 1.35, ph + 0.45, ph + 0.85, P0 - 0.1, P0 - 0.07), '#f7f7f4']);
      k.signs.push({ text: more.sign, x: 0, y: ph + 0.6, z: P0 - 0.11, ry: Math.PI, w: 2.4, colors: ['#f7f7f4', '#1f2f5a'] });
      k.plain.push([new THREE.CylinderGeometry(0.2, 0.2, 0.03, 14).rotateX(Math.PI / 2).translate(0, ph + 1.05, P0 - 0.08), '#1f2f5a']);
      k.signs.push({ text: more.initials, x: 0, y: ph + 1.05, z: P0 - 0.1, ry: Math.PI, w: 0.3, colors: ['#1f2f5a', '#ffffff'] });
      // the door and glass-block window inside, the red kerbs and gravel beds either side of the steps
      k.plain.push([box(-0.6, 0.6, 0.62, 2.8, -14.03, -14.0), '#4a2f22'], [box(0.9, 1.9, 0.9, 2.8, -14.03, -14.0), '#2b3640']);
      for (const s of [-1, 1]) {
        const x0 = s > 0 ? pw : -pw - 2.2, x1 = s > 0 ? pw + 2.2 : -pw;
        k.plain.push([box(x0, x1, 0, 0.35, -16.4, -14), DEEP_RED], [box(x0 + 0.12, x1 - 0.12, 0.35, 0.37, -16.28, -14), '#8d8a84']);
      }
      // ----- the brick walls closing the gaps between the wings (the owner's Pent PDF, pages 4-5): at each side, between
      // the front and back wings, a wall of red brick in a grey frame with a metal door of vertical ribs in it; at the
      // back, between the back wings behind the stair core, the same wall without a door
      const brickWall = (alongX: boolean, at: number, a0: number, a1: number, door: boolean) => {
        const h = 2.6, B2 = (p0: number, p1: number, y0: number, y1: number, d0: number, d1: number) => alongX ? box(p0, p1, y0, y1, at + d0, at + d1) : box(at + d0, at + d1, y0, y1, p0, p1);
        c.push([B2(a0, a1, 0, 0.35, -0.16, 0.16), '#7f8285'], [B2(a0, a1, h, h + 0.15, -0.16, 0.16), '#8f9295']);
        for (const p of [a0, a1]) c.push([B2(p - (p === a0 ? 0 : 0.25), p + (p === a0 ? 0.25 : 0), 0, h + 0.15, -0.17, 0.17), '#8f9295']);
        const d0 = (a0 + a1) / 2 - 0.55, d1 = (a0 + a1) / 2 + 0.55;
        for (const [p0, p1] of door ? [[a0 + 0.25, d0], [d1, a1 - 0.25]] : [[a0 + 0.25, a1 - 0.25]]) {
          k.plain.push([B2(p0, p1, 0.35, h, -0.12, 0.12), '#a4482f']);
          for (let y = 0.5; y < h; y += 0.3) k.plain.push([B2(p0, p1, y, y + 0.02, -0.125, 0.125), '#c7b6a3']);
        }
        if (door) {
          // the gate built like Pent's cream metal fence: rails top and bottom, open bars between (the owner's second Pent
          // corrections PDF, page 11)
          for (const [y0, y1] of [[0.12, 0.2], [1.25, 1.31], [h - 0.2, h - 0.12]]) k.plain.push([B2(d0, d1, y0, y1, -0.04, 0.04), PENT_CREAM]);
          for (const p of [d0, d1 - 0.06]) k.plain.push([B2(p, p + 0.06, 0.08, h - 0.1, -0.04, 0.04), PENT_CREAM]);
          for (let p = d0 + 0.17; p < d1 - 0.08; p += 0.13) k.plain.push([B2(p, p + 0.028, 0.15, h - 0.15, -0.025, 0.025), PENT_CREAM]);
        }
        const n = Math.ceil((a1 - a0) / 0.5);
        for (let i = 0; i <= n; i++) { const p = a0 + ((a1 - a0) * i) / n; SOLIDS.add(...k.world(alongX ? p : at, alongX ? at : p), 0.2); }
      };
      for (const x of [-19.5, 19.5]) brickWall(false, x, -1.5, 1.5, true);
      brickWall(true, 15.85, -2.5, 2.5, false);
      // ----- before the front: brick walk, kerbed lawns, palms, lamp, asphalt parking with bays
      const gy = (x: number, z: number) => k.ground(x, z) + 0.02;
      k.plain.push([box(-1.9, 1.9, gy(0, -21) - 0.02, gy(0, -21), -23.5, P0 - 1.4), '#9d4f3a']);
      for (const s of [-1, 1]) {
        const xa = s * 2.1, xb = s * 9.2;
        k.plain.push([box(Math.min(xa, xb), Math.max(xa, xb), gy(s * 5, -20) - 0.02, gy(s * 5, -20) + 0.1, -23.4, -16.6), '#c9c6bd']);
        k.plain.push([box(Math.min(xa, xb) + 0.15, Math.max(xa, xb) - 0.15, gy(s * 5, -20) + 0.1, gy(s * 5, -20) + 0.12, -23.25, -16.75), '#4f8a36']);
        // a fan palm, its trunk whitewashed at the foot
        const px = s * 3.2, pz = -21.6, py = gy(px, pz);
        k.plain.push([new THREE.CylinderGeometry(0.17, 0.22, 6.5, 7).translate(px, py + 3.25, pz), '#6b5a48'], [new THREE.CylinderGeometry(0.23, 0.24, 1.3, 7).translate(px, py + 0.65, pz), '#f2f1ec']);
        for (let i = 0; i < 9; i++) k.plain.push([new THREE.CircleGeometry(2.3, 9, -0.5, 1.0).rotateX(-Math.PI / 2 + 0.45).rotateY((i / 9) * Math.PI * 2).translate(px, py + 6.5, pz), '#3f6b2b']);
        // parking on the rest of the front
        const qa = s * 9.4, qb = s * 19.5;
        k.plain.push([box(Math.min(qa, qb), Math.max(qa, qb), gy(s * 14, -20) - 0.02, gy(s * 14, -20), -23.4, -16), '#55565a']);
        for (let x = Math.min(qa, qb) + 0.3; x < Math.max(qa, qb); x += 2.6) k.plain.push([box(x, x + 0.1, gy(x, -20), gy(x, -20) + 0.01, -21.4, -16.4), '#e8e8e2']);
      }
      { const lx = -2.9, lz = -23.0, ly = gy(lx, lz);
        k.plain.push([new THREE.CylinderGeometry(0.07, 0.1, 7, 8).translate(lx, ly + 3.5, lz), '#c9cccf'], [box(lx - 0.3, lx + 0.3, ly + 6.8, ly + 7.0, lz - 0.6, lz + 0.6), '#2a2d31'], [box(lx - 0.18, lx + 0.18, ly + 4.8, ly + 5.5, lz - 0.12, lz + 0.12), '#e4e6e8']); }
      // ----- behind the back: the slab walk along the walls, bare earth and leaf litter, the black water tank
      k.plain.push([box(-19.5, 19.5, gy(0, 17) - 0.02, gy(0, 17), 16, 17.3), '#a9a59c']);
      for (let x = -19; x < 19.5; x += 1.3) k.plain.push([box(x, x + 0.05, gy(x, 17), gy(x, 17) + 0.005, 16, 17.3), '#8f8b83']);
      for (let x = -21; x < 21; x += 6) for (let z = 17.3; z < 25; z += 4) k.plain.push([box(x, x + 6, gy(x + 3, z + 2) - 0.02, gy(x + 3, z + 2) - 0.005, z, z + 4), ((x + z) | 0) % 3 ? '#8a6a4b' : '#7e6247']);
      { const tx = 13.5, tz = 20.5, ty = gy(tx, tz);
        k.plain.push([box(tx - 1.4, tx + 1.4, ty - 0.1, ty + 0.4, tz - 1.4, tz + 1.4), '#b9b4aa'], [new THREE.CylinderGeometry(1.15, 1.15, 2.6, 18).translate(tx, ty + 1.7, tz), '#18191b']);
        SOLIDS.add(...k.world(tx, tz), 1.3); }
      more.extras?.(k, M);
      const m = new THREE.Mesh(merge(c), concrete(0.3));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
}

/** the kiosk in the middle of the space between Addis Ababa and Dar es Salaam, by the road (owner's third reference PDF,
 *  pages 6 and 14; the owner's second Pent corrections: not before Addis's porch, and its counter faces west toward
 *  Addis, not the road): white boards over a dark red base, a rusty corrugated lean-to reaching out over its counter,
 *  the mobile-money boards along its eaves, a grilled window, kerbed beds of red and purple shrubs round it (built
 *  facing -z in its own frame, then turned to face west; Addis's court frame) */
function addisKiosk(k: Kit) {
  const CX = 24.6, CZ = -17.6, X0 = -2.3, X1 = 2.3, Z0 = -1.4, Z1 = 1.4, H = 2.5, y = k.ground(CX, CZ);
  const c: Part[] = [], p: Part[] = [];
  c.push([box(X0, X1, y, y + 0.85, Z0, Z1), '#6f2621']);
  c.push([box(X0, X1, y + 0.85, y + H, Z0, Z1), '#eeede7']);
  for (let x = X0 + 0.15; x < X1; x += 0.3) p.push([box(x, x + 0.03, y + 0.9, y + H - 0.05, Z0 - 0.015, Z0), '#cfcec7']);
  // the counter window with its grille, the lean-to over it, the boards along the eaves
  p.push([box(X0 + 1.2, X0 + 3.2, y + 1.1, y + 2.1, Z0 - 0.02, Z0), '#2b2d30']);
  for (let x = X0 + 1.25; x < X0 + 3.2; x += 0.16) p.push([box(x, x + 0.025, y + 1.1, y + 2.1, Z0 - 0.04, Z0 - 0.02), '#d9d9d4']);
  p.push([box(X0 + 1.1, X0 + 3.3, y + 1.05, y + 1.12, Z0 - 0.45, Z0), '#8a6a4a']);
  const roof = new THREE.BufferGeometry(), ra = y + H + 0.45, rb = y + H + 0.05;
  roof.setAttribute('position', new THREE.Float32BufferAttribute([X0 - 0.3, rb, Z1 + 0.2, X1 + 0.3, rb, Z1 + 0.2, X1 + 0.3, ra, Z0 - 1.3, X0 - 0.3, ra, Z0 - 1.3], 3));
  roof.setIndex([0, 2, 1, 0, 3, 2, 0, 1, 2, 0, 2, 3]); roof.computeVertexNormals();
  p.push([roof, '#8e5b3e']);
  for (const x of [X0 - 0.1, X1 + 0.1]) p.push([box(x - 0.04, x + 0.04, y, ra, Z0 - 1.25, Z0 - 1.17), '#3a3c3e']);
  // the turn: the kiosk's own -z (its front) to the court frame's -x (west), centred on CX, CZ
  const at = (u: number, v: number): [number, number] => [CX + v, CZ - u];
  for (const [x0, x1, col, text] of [[X0, X0 + 1.5, '#f5c400', 'MoMo'], [X0 + 1.55, X0 + 3.0, '#e60000', 'Telecel Cash'], [X0 + 3.05, X1, '#1f5fa8', 'AT Money']] as [number, number, string, string][]) {
    p.push([box(x0, x1, ra - 0.05, ra + 0.45, Z0 - 1.32, Z0 - 1.27), col]);
    const [sx, sz] = at((x0 + x1) / 2, Z0 - 1.33);
    k.signs.push({ text, x: sx, y: ra + 0.2, z: sz, ry: Math.PI * 1.5, w: (x1 - x0) * 0.85, colors: [col, col === '#f5c400' ? '#1b1b1b' : '#ffffff'] });
  }
  // the A-board and the beds round it
  p.push([new THREE.BoxGeometry(0.6, 1.0, 0.04).rotateX(0.2).translate(X1 + 0.6, y + 0.5, Z0 - 1.6), '#2a2a2a']);
  for (const [x0, x1, z0, z1] of [[X1 + 0.1, X1 + 2.4, Z0 - 0.2, Z1 + 0.2], [X0 - 0.4, X1 + 0.1, Z1, Z1 + 1.6]]) {
    p.push([box(x0, x1, y, y + 0.18, z0, z1), '#c7c3b8'], [box(x0 + 0.1, x1 - 0.1, y + 0.18, y + 0.2, z0 + 0.1, z1 - 0.1), '#5a4632']);
    for (let x = x0 + 0.5; x < x1 - 0.3; x += 0.8) for (let z = z0 + 0.5; z < z1 - 0.3; z += 0.9) p.push([new THREE.IcosahedronGeometry(0.38, 0).scale(1.2, 0.8, 1).translate(x, y + 0.45, z), (((x * 3 + z * 7) | 0) & 1) ? '#5d2b4f' : '#3f6a2e']);
  }
  for (const [g] of [...c, ...p]) g.rotateY(Math.PI / 2).translate(CX, 0, CZ);
  k.plain.push(...p);
  SOLIDS.add(...k.world(CX, CZ), 2.4);
  const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; k.meshes.push(m);
}

/** the concrete walk along Kampala's east side from the road on to the food joint behind (the owner's Pent PDF,
 *  pages 1-3; Kampala's court frame) */
function kampalaWalk(k: Kit) {
  for (let z = -18; z < 24; z += 2) { const y = k.ground(20.8, z + 1) + 0.03; k.plain.push([box(19.7, 21.9, y - 0.03, y, z, z + 2.02), CONCRETE_WALK]); }
}

/** behind Nairobi (owner's third reference PDF, pages 15-17): the ground spread with gravel; the blue standby generator
 *  under a corrugated lean-to on four thin posts behind the gap toward Kampala (Nairobi's court frame) */
function nairobiBack(k: Kit) {
  const gy = (x: number, z: number) => k.ground(x, z) + 0.03;
  for (let z = -2; z < 14; z += 4) k.plain.push([box(-29, -21.5, gy(-25, z + 2) - 0.02, gy(-25, z + 2), z, z + 4), '#958f85']);
  for (let x = -21; x < 21; x += 6) for (let z = 17.3; z < 30; z += 4) k.plain.push([box(x, x + 6, gy(x + 3, z + 2) - 0.02, gy(x + 3, z + 2), z, z + 4), ((x + z) | 0) % 2 ? '#9a948a' : '#8f897f']);
  // (behind the gap toward Kampala, beyond the slab walk along the backs: the owner's second Pent corrections, page 10)
  const gx = -24.5, gz = 21.5, y = gy(gx, gz);
  k.plain.push([box(gx - 1.9, gx + 1.9, y, y + 0.2, gz - 0.9, gz + 0.9), '#b9b4aa'], [box(gx - 1.7, gx + 1.7, y + 0.2, y + 1.9, gz - 0.7, gz + 0.7), '#21507e']);
  for (let x = gx - 1.5; x < gx + 1.6; x += 0.25) k.plain.push([box(x, x + 0.06, y + 0.5, y + 1.6, gz - 0.72, gz - 0.7), '#173b5e']);
  k.signs.push({ text: 'SDMO', x: gx - 0.6, y: y + 1.55, z: gz - 0.73, ry: Math.PI, w: 1.0, colors: ['#21507e', '#ffffff'] });
  for (const x of [gx - 2.3, gx + 2.3]) for (const z of [gz - 1.4, gz + 1.4]) k.plain.push([box(x - 0.04, x + 0.04, y, y + 2.7, z - 0.04, z + 0.04), '#8a8f92']);
  const r = new THREE.BufferGeometry();
  r.setAttribute('position', new THREE.Float32BufferAttribute([gx - 2.7, y + 2.85, gz - 1.9, gx + 2.7, y + 2.85, gz - 1.9, gx + 2.7, y + 2.55, gz + 1.9, gx - 2.7, y + 2.55, gz + 1.9], 3));
  r.setIndex([0, 2, 1, 0, 3, 2, 0, 1, 2, 0, 2, 3]); r.computeVertexNormals();
  k.plain.push([r, '#6c7a72']);
  SOLIDS.add(...k.world(gx, gz), 2.0);
}

// ---------- the Pent entrance on Annie Jiagge Road (owner's third reference PDF, pages 1-7 and 19-20) ----------
// Old Pent is fenced along Annie Jiagge Road by Pent's cream metal fence (pentFence below); the way in is the road along the
// courts' fronts. At its mouth: the security post on the south side before Addis Ababa (cream walls, a red tiled roof
// with its gables east and west, a grey door and a dark louvred window toward the court, a window on the road), the
// red and white gates swung back against the fence either side, grey bollards wrapped in posters on the
// footway, a poster-covered kiosk on the north side of the mouth (a rusty roof on thin posts over its counter), grey
// pavers, big shade trees, feather flags on the corner and the zebra crossing on Annie Jiagge Road south of it.
/** Annie Jiagge Road's centre line by Old Pent (from the map), x at a given z */
const annieX = (z: number) => {
  const p: [number, number][] = [[-488, 509], [-523, 505], [-537, 503], [-551, 501], [-575, 500], [-626, 500], [-643, 499], [-657, 498], [-737, 496], [-842, 492]];
  for (let i = 0; i < p.length - 1; i++) if (z <= p[i][0] && z >= p[i + 1][0]) return p[i][1] + ((p[i + 1][1] - p[i][1]) * (z - p[i][0])) / (p[i + 1][0] - p[i][0]);
  return z > p[0][0] ? p[0][1] : p[p.length - 1][1];
};
/** where the Pent palisade runs, east of the footway */
export const pentFenceX = (z: number) => annieX(z) + 7.2;
const EO: [number, number] = [512, -537];
const entrance: Spec = {
  name: 'Pent entrance and security post',
  axis: [1, 0], origin: EO, storey: 3, style: OLD_WIN, roofColor: '#9a3a2c', fascia: FASCIA, pitch: 0.5,
  onGround: true,
  blocks: [],
  keep: [[500 - EO[0], 522 - EO[0], -560 - EO[1], -505 - EO[1]]],
  extras: (k) => {
    const X = (x: number) => x - EO[0], Z = (z: number) => z - EO[1];
    const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
    const gy = (x: number, z: number) => k.ground(X(x), Z(z));
    const c: Part[] = [];
    // ----- the gates at the mouth (the fence itself: pentFence below), swung back against the fence either side: each
    // leaf a red frame, white upright bars, red braces zigzagging between the rails (the owner's photo of the gate,
    // second Pent corrections)
    const MOUTH = [-541.4, -533.9];
    for (const [za, zb] of [[MOUTH[1], MOUTH[1] + 3.2], [MOUTH[0], MOUTH[0] - 3.2]]) {
      const x = pentFenceX(za) + 0.35, y = gy(x, za), z0 = Math.min(za, zb), z1 = Math.max(za, zb);
      for (const [y0, y1] of [[0.15, 0.24], [1.3, 1.4]]) k.plain.push([B(x - 0.04, x + 0.04, y + y0, y + y1, z0, z1), '#c8261e']);
      for (const z of [z0, z1 - 0.08]) k.plain.push([B(x - 0.04, x + 0.04, y + 0.1, y + 1.45, z, z + 0.08), '#c8261e']);
      for (let z = z0 + 0.2; z < z1 - 0.1; z += 0.2) k.plain.push([B(x - 0.02, x + 0.02, y + 0.24, y + 1.3, z, z + 0.035), '#f4f4f1']);
      const n = 4, w = (z1 - z0) / n, L = Math.hypot(w, 1.06), ang = Math.atan2(w, 1.06);
      for (let i = 0; i < n; i++) k.plain.push([new THREE.BoxGeometry(0.05, L, 0.06).rotateX(i & 1 ? ang : -ang).translate(X(x + 0.04), y + 0.77, Z(z0 + (i + 0.5) * w)), '#c8261e']);
      SOLIDS.add(x, (za + zb) / 2, 0.2);
    }
    // ----- the security post south of the mouth, before Addis Ababa
    const SP = [514.3, 517.5, -532.6, -529.4], sy = gy(515.9, -531);
    c.push([B(SP[0] - 0.3, SP[1] + 0.3, sy - 0.2, sy + 0.35, SP[2] - 0.3, SP[3] + 0.6), '#c9c3b6']);
    c.push([B(SP[0], SP[1], sy + 0.35, sy + 2.85, SP[2], SP[3]), '#efe7d2']);
    k.plain.push([B(SP[0] - 0.01, SP[1] + 0.01, sy + 0.35, sy + 0.6, SP[2] - 0.01, SP[3] + 0.01), '#b5a78f']);
    // the door and louvred window toward the court, a window on the road and one on Annie Jiagge Road
    k.plain.push([B(516.1, 517.0, sy + 0.4, sy + 2.45, SP[3], SP[3] + 0.04), '#6d7680'], [B(514.6, 515.7, sy + 1.2, sy + 2.25, SP[3], SP[3] + 0.04), '#2a2826']);
    for (let y = sy + 1.28; y < sy + 2.2; y += 0.12) k.plain.push([B(514.65, 515.65, y, y + 0.05, SP[3] + 0.04, SP[3] + 0.06), '#45403a']);
    k.plain.push([B(514.6, 515.8, sy + 1.2, sy + 2.2, SP[2] - 0.04, SP[2]), '#2c3640'], [B(SP[0] - 0.04, SP[0], sy + 1.2, sy + 2.2, -531.8, -530.2), '#2c3640']);
    // the door on the face toward the road into Pent (the owner's second Pent corrections, picture 2), its frame and step
    k.plain.push([B(516.2, 517.25, sy + 0.35, sy + 2.5, SP[2] - 0.06, SP[2]), '#d9d2bd'], [B(516.3, 517.15, sy + 0.38, sy + 2.42, SP[2] - 0.08, SP[2] - 0.06), '#6d7680']);
    k.plain.push([B(516.95, 517.05, sy + 1.3, sy + 1.36, SP[2] - 0.12, SP[2] - 0.08), '#c9c9c9'], [B(516.0, 517.45, sy + 0.2, sy + 0.35, SP[2] - 0.6, SP[2] - 0.3), '#d4cfc4']);
    k.plain.push([B(516.0, 517.1, sy + 0.2, sy + 0.35, SP[3] + 0.3, SP[3] + 0.6), '#d4cfc4']);
    { const e = sy + 2.85, top = e + 1.2, x0 = SP[0] - 0.5, x1 = SP[1] + 0.5, z0 = SP[2] - 0.55, z1 = SP[3] + 0.55, zm = (z0 + z1) / 2;
      k.roof.c = new THREE.Color('#9a3a2c');
      k.roof.quad([X(x1), e, Z(z0)], [X(x0), e, Z(z0)], [X(x0), top, Z(zm)], [X(x1), top, Z(zm)]);
      k.roof.quad([X(x0), e, Z(z1)], [X(x1), e, Z(z1)], [X(x1), top, Z(zm)], [X(x0), top, Z(zm)]);
      for (const x of [SP[0], SP[1]]) k.plain.push([tri2([X(x), e, Z(SP[2])], [X(x), e, Z(SP[3])], [X(x), top - 0.2, Z(zm)]), '#efe7d2']);
      for (const x of [x0, x1]) for (const s of [-1, 1]) { const L = Math.hypot(z1 - zm, top - e); k.plain.push([new THREE.BoxGeometry(0.06, 0.22, L).rotateX(s * Math.atan2(top - e, z1 - zm)).translate(X(x), (e + top) / 2, Z(zm + (s * (z1 - zm)) / 2)), '#3a4652']); }
      k.plain.push([B(x0, x1, e - 0.18, e, z0 - 0.04, z0), '#3a4652'], [B(x0, x1, e - 0.18, e, z1, z1 + 0.04), '#3a4652']); }
    SOLIDS.add(515.9, -531, 2.2);
    // a plastic chair by the door
    k.plain.push([B(517.4, 517.9, sy + 0.35, sy + 0.8, -528.6, -528.1), '#2b62b8'], [B(517.4, 517.9, sy + 0.8, sy + 1.3, -528.1, -528.05), '#2b62b8']);
    // ----- grey pavers at the mouth and along the footway outside, the bollards wrapped in posters
    for (let z = -553; z < -520; z += 3) { const xa = annieX(z + 1.5) + 3.2, xb = pentFenceX(z + 1.5) - 0.1, y = gy((xa + xb) / 2, z + 1.5); k.plain.push([B(xa, xb, y - 0.02, y + 0.03, z, z + 3), '#8e8b86']); }
    for (const z of [-544.3, -542.4, -533.0, -531.0]) {
      const x = annieX(z) + 4.1, y = gy(x, z);
      k.plain.push([new THREE.CylinderGeometry(0.09, 0.09, 1.1, 10).translate(X(x), y + 0.55, Z(z)), '#9aa0a5'], [new THREE.CylinderGeometry(0.095, 0.095, 0.45, 10).translate(X(x), y + 0.6, Z(z)), (z * 10 | 0) % 2 ? '#3fa84a' : '#d8362c']);
      SOLIDS.add(x, z, 0.15);
    }
    // ----- the kiosk north of the mouth: poster-covered back and sides, a rusty roof on thin posts, a bench counter
    { const x0 = pentFenceX(-546) - 1.9, x1 = pentFenceX(-546) - 0.2, z0 = -549.2, z1 = -544.4, y = gy(x0, -546.8), h = 2.4;
      k.plain.push([B(x1 - 0.06, x1, y, y + h, z0, z1), '#6b4a36'], [B(x0, x1, y, y + h, z0, z0 + 0.05), '#6b4a36'], [B(x0, x1, y, y + h, z1 - 0.05, z1), '#6b4a36']);
      const posters = ['#e94b3c', '#f2c12e', '#2f7fd1', '#f4f1ea', '#7a3fb0', '#2f9e5a'];
      for (let i = 0; i < 14; i++) { const zz = z0 + 0.2 + ((i * 0.37) % (z1 - z0 - 0.6)), yy = y + 0.9 + ((i * 0.53) % 1.2); k.plain.push([B(x1 - 0.08, x1 - 0.06, yy, yy + 0.45, zz, zz + 0.35), posters[i % posters.length]]); }
      k.plain.push([B(x0 + 0.1, x1 - 0.1, y + 0.75, y + 0.82, z0 + 0.1, z1 - 0.1), '#7a5a3e']);
      for (const zz of [z0 + 0.1, z1 - 0.1]) k.plain.push([B(x0 - 0.04, x0 + 0.04, y, y + h + 0.1, zz - 0.04, zz + 0.04), '#3a3a3a']);
      const r = new THREE.BufferGeometry();
      r.setAttribute('position', new THREE.Float32BufferAttribute([X(x0 - 0.5), y + h + 0.05, Z(z0 - 0.2), X(x1 + 0.1), y + h + 0.25, Z(z0 - 0.2), X(x1 + 0.1), y + h + 0.25, Z(z1 + 0.2), X(x0 - 0.5), y + h + 0.05, Z(z1 + 0.2)], 3));
      r.setIndex([0, 2, 1, 0, 3, 2, 0, 1, 2, 0, 2, 3]); r.computeVertexNormals();
      k.plain.push([r, '#7b4b33']);
      SOLIDS.add((x0 + x1) / 2, (z0 + z1) / 2, 1.2); }
    // ----- the zebra crossing on Annie Jiagge Road south of the junction, the feather flags on the corner
    for (let i = 0; i < 8; i++) { const z = -526.5 + 0.0, xa = annieX(z) - 3.0 + i * 0.78, y = gy(xa, z); k.plain.push([B(xa, xa + 0.42, y + 0.02, y + 0.035, z - 1.6, z + 1.6), '#f2f2ee']); }
    for (const [x, z, col] of [[pentFenceX(-527) - 1.2, -527, '#f2b01e'], [pentFenceX(-524.5) - 1.2, -524.5, '#d8362c']] as [number, number, string][]) {
      const y = gy(x, z);
      k.plain.push([new THREE.CylinderGeometry(0.03, 0.03, 4.2, 6).translate(X(x), y + 2.1, Z(z)), '#9aa0a5'], [B(x - 0.02, x + 0.02, y + 1.6, y + 4.0, z, z + 0.7), col]);
    }
    // ----- the shade trees at the mouth
    for (const [x, z, s] of [[pentFenceX(-552) - 1.5, -552, 1.5], [519.5, -545.5, 1.3], [516.5, -524.5, 1.1]] as [number, number, number][]) {
      const y = gy(x, z);
      k.plain.push([new THREE.CylinderGeometry(0.3 * s, 0.45 * s, 5 * s, 7).translate(X(x), y + 2.5 * s, Z(z)), '#5b4636']);
      for (const [dx, dy, dz, r] of [[0, 6, 0, 3.4], [2, 5.5, -1.4, 2.4], [-2, 5.4, 1.5, 2.5]]) k.plain.push([new THREE.IcosahedronGeometry(r * s * 0.9, 1).scale(1, 0.7, 1).translate(X(x) + dx * s, y + dy * s, Z(z) + dz * s), '#355f27']);
      SOLIDS.add(x, z, 0.45 * s);
    }
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

// ---------- Pent's metal fence (the owner's second Pent corrections: the whole of Pent is fenced) ----------
// Cream-painted flat bars on two rails, posts of the same doubled bar, on a low kerb: no coloured pillars. It runs along
// Annie Jiagge Road from the corner behind Old Pent north past the entrance (the gates there) and on past Blocks A and
// B; behind Block B it turns east to Pent Road, and beyond Pent Road it runs along the back of Block C. Behind Old Pent
// it turns east from the road between the courts and the walled grounds of the yellow building to the drive into them,
// and beyond the drive runs on behind the admin block and Kampala, along the road there, to the food building.
const FO2: [number, number] = [560, -650];
/** the fence's runs, world x, z */
const PENT_FENCE_RUNS: [number, number][][] = (() => {
  const road = (za: number, zb: number) => { const r: [number, number][] = []; for (let z = za; z > zb; z -= 2.5) r.push([pentFenceX(z), z]); r.push([pentFenceX(zb), zb]); return r; };
  return [
    road(-468, -533.9),
    [...road(-541.4, -845), [611, -845]],
    [[626, -781.5], [737, -781.5]],
    [[pentFenceX(-483), -483], [619, -483]],
    [[626, -490.5], [664, -490.5], [680, -486], [687.4, -483]],
  ];
})();
const pentFenceSpec: Spec = {
  name: 'Pent metal fence',
  axis: [1, 0], origin: FO2, storey: 3, style: OLD_WIN, roofColor: '#888', fascia: '#888', pitch: 0.1,
  onGround: true,
  blocks: [],
  keep: [],
  extras: (k) => {
    const X = (x: number) => x - FO2[0], Z = (z: number) => z - FO2[1];
    const gy = (x: number, z: number) => k.ground(X(x), Z(z));
    /** a bar of the fence from a to b (world), its section w across and its height y0..y1 */
    const bar = (ax: number, az: number, bx: number, bz: number, w: number, y0: number, y1: number, col: string) => {
      const len = Math.hypot(bx - ax, bz - az);
      k.plain.push([new THREE.BoxGeometry(Math.max(len, w), y1 - y0, w).rotateY(Math.atan2(-(bz - az), bx - ax)).translate(X((ax + bx) / 2), (y0 + y1) / 2, Z((az + bz) / 2)), col]);
    };
    for (const run of PENT_FENCE_RUNS) for (let i = 0; i + 1 < run.length; i++) {
      const [ax, az] = run[i], [bx, bz] = run[i + 1], len = Math.hypot(bx - ax, bz - az);
      for (let t = 0; t < len - 0.01; t += 2.5) {
        const t1 = Math.min(len, t + 2.5), f0 = t / len, f1 = t1 / len;
        const x0 = ax + (bx - ax) * f0, z0 = az + (bz - az) * f0, x1 = ax + (bx - ax) * f1, z1 = az + (bz - az) * f1, y = gy(x0, z0), y1 = gy(x1, z1), ym = Math.min(y, y1);
        bar(x0, z0, x1, z1, 0.22, ym - 0.15, ym + 0.25, '#d8d1c0');
        bar(x0, z0, x0 + 0.001, z0, 0.09, ym, ym + 2.05, PENT_CREAM);
        for (const h of [0.5, 1.75]) bar(x0, z0, x1, z1, 0.05, ym + h, ym + h + 0.06, PENT_CREAM);
        const n = Math.round((t1 - t) / 0.13);
        for (let j = 1; j < n; j++) { const f = j / n, px = x0 + (x1 - x0) * f, pz = z0 + (z1 - z0) * f; bar(px, pz, px + ((x1 - x0) / (t1 - t)) * 0.04, pz + ((z1 - z0) / (t1 - t)) * 0.04, 0.02, ym + 0.25, ym + 1.95, PENT_CREAM); }
        for (let d = 0; d < t1 - t; d += 0.8) SOLIDS.add(x0 + ((x1 - x0) * d) / (t1 - t), z0 + ((z1 - z0) * d) / (t1 - t), 0.15);
      }
      bar(bx, bz, bx + 0.001, bz, 0.09, gy(bx, bz), gy(bx, bz) + 2.05, PENT_CREAM);
    }
  },
};

// ---------- behind Nairobi: the food joint (owner's third reference PDF, page 18; second Pent corrections, pages 13-14
// and the owner's marked top view) ----------
// The mapped footprint holds two parts. On the east the food building: one floor on a raised base, white walls over a
// deep red foot under a red sheet gable roof, red-painted steps up to its doors toward the courts. On the west a yard
// walled in white over a red foot: in its north half the black kiosk of dark grey aluminium sheet standing above the
// wall, its yellow board toward the courts; in its south half the white kiosk; between them the way through from the
// open entrance in the west wall (up red steps), and another open entrance in the north wall by the building. The
// concrete walk from the gap between Kampala and Nairobi runs down the yard's west side to the west entrance.
const FO: [number, number] = [712.35, -486.25];
const FOOD = [713.0, 724.4, -494.2, -478.3], YARD = [700.3, 713.0, -494.2, -478.3];
const CONCRETE_WALK = '#b5b1a8';
const FOOD_WALL: Style = {
  bay: 3.0, up: [], ground: [[90, 256 + 70, 76, 90]],
  draw: (g) => { render(g, '#f2f0ea'); g.fillStyle = '#2a2420'; g.fillRect(90, 256 + 70, 76, 90); g.fillStyle = '#5a4a3c'; for (let y = 256 + 76; y < 256 + 158; y += 9) g.fillRect(92, y, 72, 3); g.fillStyle = DEEP_RED; g.fillRect(0, 512 - 80, 256, 80); },
};
const food: Spec = {
  name: 'Pent food building behind Nairobi',
  axis: [1, 0], origin: FO, storey: 3.0, style: FOOD_WALL, roofColor: '#a8382c', fascia: '#4a3a30', pitch: 0.35, plinth: DEEP_RED,
  replaces: [[712, -486]],
  blocks: [{ x0: FOOD[0] - FO[0], x1: FOOD[1] - FO[0], z0: FOOD[2] - FO[1], z1: FOOD[3] - FO[1], floors: 1, roof: 'none' }],
  keep: [[688 - FO[0], FOOD[1] + 3 - FO[0], FOOD[2] - 4 - FO[1], FOOD[3] + 2 - FO[1]]],
  extras: (k) => {
    const X = (x: number) => x - FO[0], Z = (z: number) => z - FO[1];
    const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
    const e = k.wallTop(1), c: Part[] = [];
    const M = (x: number, z: number): [number, number] => [X(x), Z(z)];
    // the food building's red sheet gable roof, gables to the courts and to the road
    hipRoof(k, M, FOOD[0] - 0.6, FOOD[1] + 0.6, FOOD[2] - 0.6, FOOD[3] + 0.6, e, 0.35, 'z', [{ gw: 99, tri: false }, { gw: 99, tri: false }], c, '#4a3a30');
    const xm = (FOOD[0] + FOOD[1]) / 2, rise = ((FOOD[1] - FOOD[0]) / 2 + 0.6) * 0.35;
    for (const z of [FOOD[2], FOOD[3]]) k.plain.push([tri2([X(FOOD[0] - 0.5), e, Z(z)], [X(FOOD[1] + 0.5), e, Z(z)], [X(xm), e + rise - 0.1, Z(z)]), '#f2f0ea']);
    // red-painted steps up to the two doors toward the courts, white grille doors
    for (const dx of [716.0, 721.6]) {
      for (let i = 0; i < 3; i++) c.push([B(dx - 1.1, dx + 1.1, 0, PL - (PL / 3) * i, FOOD[2] - 0.4 * (i + 1), FOOD[2] - 0.4 * i), '#b23a2e']);
      k.plain.push([B(dx - 0.55, dx + 0.55, PL, PL + 2.2, FOOD[2] - 0.03, FOOD[2]), '#e9e7e0']);
      for (let x = dx - 0.5; x < dx + 0.55; x += 0.14) k.plain.push([B(x, x + 0.025, PL + 0.1, PL + 2.1, FOOD[2] - 0.05, FOOD[2] - 0.03), '#7d7a74']);
    }
    // ----- the yard: its walls with the two open entrances (north by the building, west between the kiosks), its
    // concrete floor, the black kiosk in the north half and the white kiosk in the south half
    { const [x0, x1, z0, z1] = YARD, h = 2.2, N = [709.6, 711.8], W = [-488.4, -484.4];
      const wallSeg = (a0: number, a1: number, b0: number, b1: number) => {
        c.push([B(a0, a1, 0, 0.9, b0, b1), '#b23a2e'], [B(a0, a1, 0.9, h, b0, b1), '#f1efe8'], [B(a0 - 0.03, a1 + 0.03, h, h + 0.08, b0 - 0.03, b1 + 0.03), '#e2ded4']);
        for (let x = a0; x <= a1; x += 0.8) for (let z = b0; z <= b1; z += 0.8) SOLIDS.add(x, z, 0.2);
      };
      wallSeg(x0, N[0], z0, z0 + 0.2); wallSeg(N[1], x1, z0, z0 + 0.2);
      wallSeg(x0, x0 + 0.2, z0, W[0]); wallSeg(x0, x0 + 0.2, W[1], z1);
      wallSeg(x0, x1, z1 - 0.2, z1);
      for (const [a0, a1] of [[N[0], N[0] + 0.15], [N[1] - 0.15, N[1]]]) k.plain.push([B(a0, a1, 0, h + 0.1, z0 - 0.02, z0 + 0.22), '#3a3a38']);
      for (const [b0, b1] of [[W[0], W[0] + 0.15], [W[1] - 0.15, W[1]]]) k.plain.push([B(x0 - 0.02, x0 + 0.22, 0, h + 0.1, b0, b1), '#3a3a38']);
      for (let i = 0; i < 3; i++) {
        c.push([B(N[0] - 0.2, N[1] + 0.2, 0, PL - (PL / 3) * i, z0 - 0.35 * (i + 1), z0 - 0.35 * i), '#b23a2e']);
        c.push([B(x0 - 0.35 * (i + 1), x0 - 0.35 * i, 0, PL - (PL / 3) * i, W[0] - 0.2, W[1] + 0.2), '#b23a2e']);
      }
      k.plain.push([B(x0 + 0.2, x1, 0.005, PL - 0.02, z0 + 0.2, z1 - 0.2), '#bdb9b0']);
      // the black kiosk, against the north wall, standing above it
      const BK = [701.0, 708.0, -493.9, -488.4];
      c.push([B(BK[0], BK[1], 0, 3.4, BK[2], BK[3]), '#3d4246']);
      for (let x = BK[0] + 0.1; x < BK[1]; x += 0.2) k.plain.push([B(x, x + 0.06, 2.2, 3.3, BK[2] - 0.02, BK[2]), '#2a2e31']);
      for (let z = BK[2] + 0.1; z < BK[3]; z += 0.2) k.plain.push([B(BK[0] - 0.02, BK[0], 2.2, 3.3, z, z + 0.06), '#2a2e31']);
      k.plain.push([B(BK[0] - 0.4, BK[1] + 0.4, 3.4, 3.52, BK[2] - 0.5, BK[3] + 0.4), '#8a6a4a'], [B(703.4, 705.6, 2.5, 3.1, BK[2] - 0.05, BK[2] - 0.02), '#f2c41e']);
      k.plain.push([B(703.0, 706.0, PL + 0.6, PL + 1.6, BK[3], BK[3] + 0.03), '#1f2225'], [B(702.9, 706.1, PL + 0.55, PL + 0.6, BK[3], BK[3] + 0.4), '#8a6a4a']);
      // the white kiosk in the south half, its door and window toward the way through
      const WK = [701.0, 708.0, -484.4, -478.7];
      c.push([B(WK[0], WK[1], 0, 3.0, WK[2], WK[3]), '#ebe7da']);
      for (let x = WK[0] + 0.1; x < WK[1]; x += 0.25) if (x < 703.8 || x > 705.0) k.plain.push([B(x, x + 0.06, PL, 2.9, WK[2] - 0.02, WK[2]), '#d6d1c2']);
      k.plain.push([B(703.9, 704.9, PL, PL + 2.1, WK[2] - 0.04, WK[2]), '#d9d6cc'], [B(705.6, 707.2, PL + 0.9, PL + 1.8, WK[2] - 0.03, WK[2]), '#2e3236']);
      k.plain.push([B(WK[0] - 0.3, WK[1] + 0.3, 3.0, 3.12, WK[2] - 0.5, WK[3] + 0.2), '#8a6a4a']);
      SOLIDS.add(704.5, -491.1, 3.2); SOLIDS.add(704.5, -481.5, 3.2); }
    // ----- the concrete walk from the gap between Kampala and Nairobi (it meets Kampala's walk) down the yard's west side
    // to the west entrance's steps
    k.plain.push([B(691.7, 698.8, 0.01, 0.045, -500.4, -498.2), CONCRETE_WALK], [B(696.6, 698.8, 0.01, 0.045, -498.2, -484.6), CONCRETE_WALK]);
    // the brick path along the east end and the gravel round it
    k.plain.push([B(FOOD[1] + 0.8, FOOD[1] + 2.3, 0.01, 0.04, FOOD[2] - 6, FOOD[3] + 1), '#a5563f']);
    k.plain.push([B(699.0, FOOD[1] + 0.8, 0.005, 0.02, FOOD[2] - 4, FOOD[2] - 1.3), '#9b9488']);
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; k.meshes.push(m);
  },
};

// ---------- the admin block, Ghana Hostels (frame: the courts' axis, origin at the footprint's middle) ----------
// From the owner's third reference PDF (pages 8-12, 29; the photos face south, so west is on their right): white render
// with white-framed sliding windows; on the east a wing of three storeys under a front gable; the middle four storeys,
// set back, a balcony railing along its top floor; on the west a tower of four storeys under a front gable, a vertical
// strip of facing brick up its front (a second strip up the east wing's inner corner), an arched loggia at its top on
// its west side. Along the ground floor the shops and offices behind deep red pillars and low red walls with steel
// railings, under a red tiled veranda; in it, west of the palms, the blue Ecobank ATM. The entrance: a gabled porch, the gable open timber work radiating like a
// sunburst over the GHL mark and GHANA HOSTELS LTD, on red columns, red brick steps up to it. Before it two royal
// palms with whitewashed feet in a bed of white gravel; the forecourt laterite and brick pavers, the cars parked under
// blue tensile shades either side.
const ADMIN_F = 4;
const admin: Spec = {
  name: 'Pent Admin Block',
  axis: COURT_AXIS, origin: [632, -514], storey: 3.4, style: ADMIN_WIN, roofColor: '#b0573a', fascia: FASCIA, pitch: 0.45,
  replaces: [[622, -515]],
  blocks: [
    { x0: -14.1, x1: -1.5, z0: -13, z1: 12.5, floors: ADMIN_F, roof: 'none' },
    { x0: 5.4, x1: 14.1, z0: -13.3, z1: 12.3, floors: ADMIN_F - 1, roof: 'none' },
    { x0: -1.5, x1: 5.4, z0: -11.2, z1: 12.3, floors: ADMIN_F, pitch: 0.35 },
  ],
  keep: [[-24, 24, -32, -13]],
  extras: (k) => {
    const eW = k.wallTop(ADMIN_F), eE = k.wallTop(ADMIN_F - 1), c: Part[] = [];
    // the front gables of the west wing and the east tower, roofs running back
    gableZ(k, -14.8, -0.8, -13.8, 13.2, eW, 0.55, [true, true]);
    gableZ(k, 4.7, 14.8, -14.1, 13, eE, 0.7, [true, true]);
    // the strips of facing brick
    // (drawn east to west so they face the front)
    panel([0, 0], k, brickFace(), -9.3, -13.03, -11.6, -13.03, 4.0, eW - 0.4, 1);
    panel([0, 0], k, brickFace(), 7.6, -13.33, 5.6, -13.33, 4.0, eE - 0.4, 1);
    // the arched loggia at the top of the west tower's side
    k.plain.push([box(-14.14, -14.1, eW - 3.3, eW - 0.5, -9.5, -6.5), '#3a3a38'], [new THREE.CircleGeometry(1.5, 14, 0, Math.PI).rotateY(-Math.PI / 2).translate(-14.15, eW - 1.4, -8), '#f4f3ef']);
    k.plain.push([box(-14.2, -14.1, eW - 3.3, eW - 2.3, -9.5, -6.5), '#c9cccf']);
    // the middle's balcony railing on the top floor
    { const y = PL + 3 * 3.4;
      k.plain.push([box(-1.5, 5.4, y - 0.1, y + 0.05, -12.3, -11.2), '#e9e7e1'], [box(-1.5, 5.4, y + 1.0, y + 1.06, -12.3, -12.24), '#8d9094']);
      for (let x = -1.3; x < 5.3; x += 0.2) k.plain.push([box(x - 0.015, x + 0.015, y, y + 1.0, -12.3, -12.26), '#8d9094']); }
    // ----- the ground floor: red pillars, low red walls with steel railings, the red tiled veranda
    const vy = 3.6, VZ = -16.2;
    k.roof.c = new THREE.Color('#b8603a');
    k.roof.quad([-15, vy - 0.6, VZ], [15, vy - 0.6, VZ], [15, vy + 0.4, -13.3], [-15, vy + 0.4, -13.3]);
    k.plain.push([box(-15, 15, vy - 0.82, vy - 0.6, VZ - 0.05, VZ + 0.05), '#f2efe6']);
    const posts = [-14.6, -10.2, -6.6, 6.8, 10.4, 14.6];
    for (const x of posts) c.push([box(x - 0.22, x + 0.22, 0, vy - 0.6, VZ + 0.1, VZ + 0.54), DEEP_RED]);
    for (let i = 0; i < posts.length - 1; i++) {
      const a = posts[i] + 0.22, b = posts[i + 1] - 0.22;
      if (a > -6.5 && b < 6.9) continue;
      c.push([box(a, b, 0, 1.0, VZ + 0.2, VZ + 0.44), DEEP_RED]);
      k.plain.push([box(a, b, 1.75, 1.8, VZ + 0.3, VZ + 0.34), '#c4c8cc']);
      for (let x = a + 0.4; x < b; x += 1.2) k.plain.push([box(x - 0.02, x + 0.02, 1.0, 1.78, VZ + 0.3, VZ + 0.34), '#c4c8cc']);
      for (const h of [1.25, 1.5]) k.plain.push([box(a, b, h, h + 0.025, VZ + 0.3, VZ + 0.34), '#c4c8cc']);
    }
    k.plain.push([box(-14.1, 14.1, 0, 0.18, VZ, -13), '#b3654c']);
    // the Ecobank ATM in its blue panel west of the palms, notice boards either side
    k.plain.push([box(-8.9, -7.1, 0.18, 2.7, -13.06, -13.0), '#1d5fa6'], [box(-8.4, -7.6, 0.9, 1.9, -13.12, -13.06), '#4a5056'], [box(-8.25, -7.75, 1.35, 1.75, -13.14, -13.12), '#7fb7d6']);
    k.signs.push({ text: 'Ecobank', x: -8.0, y: 2.35, z: -13.07, ry: Math.PI, w: 1.4, colors: ['#1d5fa6', '#ffffff'] });
    k.signs.push({ text: 'ATM', x: -8.0, y: 0.55, z: -13.07, ry: Math.PI, w: 0.6, colors: ['#1d5fa6', '#ffffff'] });
    for (const [x0, x1, col] of [[-10.6, -9.4, '#e7d9b0'], [-12.2, -11.0, '#d9534f'], [8.0, 9.4, '#f1e3c2']] as [number, number, string][]) k.plain.push([box(x0, x1, 1.0, 2.2, -13.34, -13.3), col]);
    // ----- the entrance porch: the sunburst gable over the sign, red columns, red brick steps
    const px0 = -2.2, px1 = 6.1, pz0 = -18.2, pz1 = -13, ph = 4.0, gx = (px0 + px1) / 2;
    for (const x of [px0 + 0.3, px1 - 0.3]) c.push([box(x - 0.25, x + 0.25, 0.3, ph, pz0 + 0.2, pz0 + 0.7), DEEP_RED]);
    k.plain.push([box(px0, px1, ph, ph + 0.8, pz0, pz1), '#f4f2ec']);
    gableZ(k, px0 - 0.4, px1 + 0.4, pz0 - 0.4, pz1, ph + 0.8, 0.6, [true, false]);
    for (let i = 0; i < 9; i++) {
      const a = (i / 8) * Math.PI;
      k.plain.push([new THREE.BoxGeometry(0.06, 1.9, 0.04).translate(0, 0.95, 0).rotateZ(Math.PI / 2 - a).translate(gx, ph + 0.85, pz0 + 0.18), '#8b6a4a']);
    }
    k.plain.push([box(gx - 0.35, gx + 0.35, ph + 0.95, ph + 1.45, pz0 + 0.12, pz0 + 0.16), '#3b3a36']);
    k.signs.push({ text: 'GHANA HOSTELS LTD', x: gx, y: ph + 0.4, z: pz0 - 0.01, ry: Math.PI, w: 4.2, colors: ['#f4f2ec', '#8a2a22'] });
    for (let i = 0; i < 4; i++) k.plain.push([box(px0 + 0.3 - i * 0.2, px1 - 0.3 + i * 0.2, 0, 0.32 - i * 0.08, pz0 - i * 0.4, pz1), '#a0553e']);
    k.glass.push(box(gx - 2.2, gx + 2.2, 0.3, 3.0, -11.24, -11.2));
    for (const x of [px0 - 0.6, px1 + 0.6]) k.plain.push([new THREE.CylinderGeometry(0.35, 0.25, 0.7, 10).translate(x, 0.35, pz1 - 0.5), '#f2f0ea'], [new THREE.IcosahedronGeometry(0.45, 0).translate(x, 0.95, pz1 - 0.5), '#4f8a35']);
    // ----- before it: brick pavers along the front, laterite beyond, the palms in white gravel, the blue shades
    const gy = (x: number, z: number) => k.ground(x, z);
    k.plain.push([box(-24, 24, gy(0, -17) - 0.02, gy(0, -17) + 0.02, -19.5, VZ), '#9a5644']);
    for (let x = -24; x < 24; x += 8) k.plain.push([box(x, x + 8, gy(x + 4, -25) - 0.02, gy(x + 4, -25) + 0.01, -31, -19.5), '#a06f52']);
    for (const [xa, xb] of [[-6.6, -2.4], [9.6, 13.6]]) {
      const y = gy((xa + xb) / 2, -21);
      k.plain.push([box(xa, xb, y, y + 0.22, -22.6, -19.8), '#d8d4ca'], [box(xa + 0.15, xb - 0.15, y + 0.22, y + 0.25, -22.45, -19.95), '#eeeeea']);
      for (const x of [xa + 1.2, xb - 1.2]) {
        k.plain.push([new THREE.CylinderGeometry(0.22, 0.3, 11, 9).translate(x, y + 5.5, -21.2), '#9d9a92'], [new THREE.CylinderGeometry(0.31, 0.32, 1.4, 9).translate(x, y + 0.7, -21.2), '#f4f4f1'], [new THREE.CylinderGeometry(0.24, 0.24, 1.2, 8).translate(x, y + 11.5, -21.2), '#6e8f3c']);
        for (let i = 0; i < 10; i++) k.plain.push([new THREE.ConeGeometry(0.5, 3.6, 3).rotateX(Math.PI / 2).translate(0, 0, 1.8).scale(1, 0.25, 1).rotateX(0.35 + (i % 3) * 0.25).rotateY((i / 10) * Math.PI * 2).translate(x, y + 12, -21.2), '#4f8a2f']);
        SOLIDS.add(...k.world(x, -21.2), 0.35);
      }
    }
    for (const [xa, xb] of [[-23.5, -17.5], [-17.2, -11.2], [8.6, 14.6], [14.9, 20.9]]) {
      const zb = -20.2, za = -26.2, y = gy((xa + xb) / 2, -23), xm = (xa + xb) / 2;
      // a curved post at the road side, its arm reaching over, the fabric dipping between the hems
      c.push([box(xm - 0.08, xm + 0.08, y, y + 2.9, za - 0.08, za + 0.08), '#e7e5df']);
      c.push([box(xm - 0.06, xm + 0.06, y + 2.8, y + 2.95, za, zb), '#e7e5df']);
      const P = (x: number, h: number, z: number): [number, number, number] => [x, y + h, z];
      const A = P(xa, 3.2, za), Bq = P(xb, 3.2, za), C = P(xb, 2.6, zb), D = P(xa, 2.6, zb), Mq = P(xm, 2.7, (za + zb) / 2);
      for (const [p, q] of [[A, Bq], [Bq, C], [C, D], [D, A]]) k.plain.push([tri2(p, q, Mq), '#1f62b8']);
      SOLIDS.add(...k.world(xm, za), 0.15);
    }
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

/** Old Pent courts, the admin block, the entrance and the food building behind Nairobi (New Pent: newpent.ts) */
export const pentagon = createSite('pentagon', [
  court('Addis Ababa Court', [540.5, -510], [[530, -501], [552, -502], [551, -520], [529, -517], [541, -509]], { sign: 'ADDIS ABABA COURT', initials: 'AC', extras: addisKiosk }),
  court('Dar es Salaam Court', [589.75, -514], [[579, -522], [579, -505], [600, -523], [601, -506], [591, -515]], { sign: 'DAR ES SALAAM COURT', initials: 'DC' }),
  court('Kampala Court', [672, -522.4], [[672, -525]], { sign: 'KAMPALA COURT', initials: 'KC', extras: kampalaWalk }),
  court('Nairobi Court', [722, -526.5], [[722, -529]], { sign: 'NAIROBI COURT', initials: 'NC', extras: nairobiBack }),
  admin,
  entrance,
  food,
  pentFenceSpec,
]);

/** where the New Pent blocks stand (the yellow zone on the owner's aerial) */
const NEW_PENT = [[507, 635, -839, -585], [632, 756, -797, -641]];
/** New Pent's wings: cream render and terracotta roofs (owner photo); undefined for every other building */
export function newPentStyle(b: Building) {
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  return NEW_PENT.some(([x0, x1, z0, z1]) => cx > x0 && cx < x1 && cz > z0 && cz < z1) ? { wall: '#f1e6cf', roof: '#b5532f' } : undefined;
}
