// Pentagon (Pent), modelled from the owner's labelled aerial and photos (block engine: blocks.ts).
//
// Old Pent: four courts in a row, west to east from the entrance on Annie Jiagge Road (owner's third reference PDF)
// Addis Ababa, Dar es Salaam, (the admin block), Kampala and Nairobi, all one design: four three-storey white blocks round a cross of open gaps, joined
// by a central stair core that rises into a tower with a front gable and an arched window; terracotta
// hipped roofs with dark fascias, a red base, and a small tiled porch at the foot of the core on the
// north face (the entrance, toward the road). The admin block (Ghana Hostels) sits in the middle: two
// four-storey towers with front gables and brick-red corner panels either side of a recessed centre
// with a balcony, a tiled veranda along the ground floor and a gabled porch with a sunburst gable and
// the GHANA HOSTELS LTD sign.
//
// New Pent blocks A, B and C (one design): their wings are the mapped footprints, built by the
// generic builder at four storeys in cream with terracotta roofs (newPentStyle); this module adds each
// block's entrance pavilion (a projecting tower with an arched window under a front gable, over a
// columned porch with an arched opening and a small tile gable), facing the car park on the south.
import * as THREE from 'three';
import type { Building } from './campusmap';
import { PAVE, TRIM, WHITE, box, merge, tri2, type Part } from './modelkit';
import { breeze, concrete, panel } from './concrete';
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
      g.fillStyle = LOUVRE; g.fillRect(86, y0 + 58, 84, 120);
      g.fillStyle = '#34302b'; for (let y = y0 + 64; y < y0 + 176; y += 10) g.fillRect(88, y, 80, 4);
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
    keep: [[-9.5, 9.5, -24, -14], [-21, 21, 16, 26]],
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
            for (let yy = y + 0.12; yy < y + 1.5; yy += 0.16) k.plain.push([box(xm + dx - w + 0.05, xm + dx + w - 0.05, yy, yy + 0.04, zz - 0.02 + (s > 0 ? 0.03 : 0), zz + 0.02 - (s > 0 ? 0 : 0.03)), '#3a3530']);
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
      // ----- the back: the storerooms in the core's ground floor
      k.plain.push([box(-2.5, 2.5, 0, PL + CST - 0.2, 14, 14.03), DEEP_RED]);
      for (const x of [-2.4, -0.05, 2.25]) k.plain.push([box(x, x + 0.15, 0, PL + CST - 0.2, 14.03, 14.06), '#f3efe6']);
      for (const x of [-1.25, 1.15]) k.plain.push([box(x - 0.55, x + 0.55, 0, 2.2, 14.04, 14.07), '#8e2a22']);
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

/** the kiosk before Addis Ababa toward Dar es Salaam (owner's third reference PDF, pages 6 and 14): white boards over
 *  a dark red base, a rusty corrugated lean-to reaching out over its counter on the parking, the mobile-money boards
 *  along its eaves, a grilled window, kerbed beds of red and purple shrubs round it (Addis's court frame) */
function addisKiosk(k: Kit) {
  const X0 = 10.2, X1 = 14.8, Z0 = -21.0, Z1 = -18.2, H = 2.5, y = k.ground(12.5, -19.6);
  const c: Part[] = [];
  c.push([box(X0, X1, y, y + 0.85, Z0, Z1), '#6f2621']);
  c.push([box(X0, X1, y + 0.85, y + H, Z0, Z1), '#eeede7']);
  for (let x = X0 + 0.15; x < X1; x += 0.3) k.plain.push([box(x, x + 0.03, y + 0.9, y + H - 0.05, Z0 - 0.015, Z0), '#cfcec7']);
  // the counter window with its grille, the lean-to over it, the boards along the eaves
  k.plain.push([box(X0 + 1.2, X0 + 3.2, y + 1.1, y + 2.1, Z0 - 0.02, Z0), '#2b2d30']);
  for (let x = X0 + 1.25; x < X0 + 3.2; x += 0.16) k.plain.push([box(x, x + 0.025, y + 1.1, y + 2.1, Z0 - 0.04, Z0 - 0.02), '#d9d9d4']);
  k.plain.push([box(X0 + 1.1, X0 + 3.3, y + 1.05, y + 1.12, Z0 - 0.45, Z0), '#8a6a4a']);
  const roof = new THREE.BufferGeometry(), ra = y + H + 0.45, rb = y + H + 0.05;
  roof.setAttribute('position', new THREE.Float32BufferAttribute([X0 - 0.3, rb, Z1 + 0.2, X1 + 0.3, rb, Z1 + 0.2, X1 + 0.3, ra, Z0 - 1.3, X0 - 0.3, ra, Z0 - 1.3], 3));
  roof.setIndex([0, 2, 1, 0, 3, 2, 0, 1, 2, 0, 2, 3]); roof.computeVertexNormals();
  k.plain.push([roof, '#8e5b3e']);
  for (const x of [X0 - 0.1, X1 + 0.1]) k.plain.push([box(x - 0.04, x + 0.04, y, ra, Z0 - 1.25, Z0 - 1.17), '#3a3c3e']);
  for (const [x0, x1, col, text] of [[X0, X0 + 1.5, '#f5c400', 'MoMo'], [X0 + 1.55, X0 + 3.0, '#e60000', 'Telecel Cash'], [X0 + 3.05, X1, '#1f5fa8', 'AT Money']] as [number, number, string, string][]) {
    k.plain.push([box(x0, x1, ra - 0.05, ra + 0.45, Z0 - 1.32, Z0 - 1.27), col]);
    k.signs.push({ text, x: (x0 + x1) / 2, y: ra + 0.2, z: Z0 - 1.33, ry: Math.PI, w: (x1 - x0) * 0.85, colors: [col, col === '#f5c400' ? '#1b1b1b' : '#ffffff'] });
  }
  // the A-board and the beds round it
  k.plain.push([new THREE.BoxGeometry(0.6, 1.0, 0.04).rotateX(0.2).translate(X1 + 0.6, y + 0.5, Z0 - 1.6), '#2a2a2a']);
  for (const [x0, x1, z0, z1] of [[X0 - 2.6, X0 - 0.1, -21.6, -18.0], [X0 - 0.1, X1 + 0.6, Z1, -16.2]]) {
    k.plain.push([box(x0, x1, y, y + 0.18, z0, z1), '#c7c3b8'], [box(x0 + 0.1, x1 - 0.1, y + 0.18, y + 0.2, z0 + 0.1, z1 - 0.1), '#5a4632']);
    for (let x = x0 + 0.5; x < x1 - 0.3; x += 0.8) for (let z = z0 + 0.5; z < z1 - 0.3; z += 0.9) k.plain.push([new THREE.IcosahedronGeometry(0.38, 0).scale(1.2, 0.8, 1).translate(x, y + 0.45, z), (((x * 3 + z * 7) | 0) & 1) ? '#5d2b4f' : '#3f6a2e']);
  }
  SOLIDS.add(...k.world(12.5, -19.6), 2.4);
  const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; k.meshes.push(m);
}

/** behind Nairobi (owner's third reference PDF, pages 15-17): the blue standby generator under a corrugated lean-to
 *  on four thin posts, the ground spread with gravel (Nairobi's court frame) */
function nairobiBack(k: Kit) {
  const gy = (x: number, z: number) => k.ground(x, z) + 0.03;
  for (let x = -21; x < 21; x += 6) for (let z = 17.3; z < 30; z += 4) k.plain.push([box(x, x + 6, gy(x + 3, z + 2) - 0.02, gy(x + 3, z + 2), z, z + 4), ((x + z) | 0) % 2 ? '#9a948a' : '#8f897f']);
  const gx = -10, gz = 24.5, y = gy(gx, gz);
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
// Old Pent is fenced along Annie Jiagge Road by white palisade on deep red posts; the way in is the road along the
// courts' fronts. At its mouth: the security post on the south side before Addis Ababa (cream walls, a red tiled roof
// with its gables east and west, a grey door and a dark louvred window toward the court, a window on the road), the
// red and white trellis gates swung back against the fence either side, grey bollards wrapped in posters on the
// footway, a poster-covered kiosk on the north side of the mouth (a rusty roof on thin posts over its counter), grey
// pavers, big shade trees, feather flags on the corner and the zebra crossing on Annie Jiagge Road south of it.
/** Annie Jiagge Road's centre line by Old Pent (from the map), x at a given z */
const annieX = (z: number) => {
  const p: [number, number][] = [[-488, 509], [-523, 505], [-537, 503], [-551, 501], [-575, 500]];
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
    // ----- the palisade along the road, south and north of the mouth
    const MOUTH = [-541.4, -533.9];
    const run = (za: number, zb: number) => {
      for (let z = za; z > zb; z -= 2.5) {
        const z1 = Math.max(zb, z - 2.5), xa = pentFenceX(z), xb = pentFenceX(z1), y = gy(xa, z);
        c.push([B(xa - 0.12, xa + 0.12, y - 0.1, y + 1.9, z - 0.12, z + 0.12), DEEP_RED]);
        k.plain.push([B(Math.min(xa, xb) - 0.1, Math.max(xa, xb) + 0.1, y - 0.1, y + 0.3, z1, z), '#d9d6cf']);
        for (const h of [0.45, 1.55]) k.plain.push([B(Math.min(xa, xb) - 0.02, Math.max(xa, xb) + 0.02, y + h, y + h + 0.05, z1, z), '#f4f4f1']);
        for (let zz = z - 0.12; zz > z1; zz -= 0.14) { const xx = xa + ((xb - xa) * (z - zz)) / (z - z1 || 1); k.plain.push([B(xx - 0.02, xx + 0.02, y + 0.3, y + 1.75, zz - 0.02, zz + 0.02), '#f4f4f1']); }
        for (let zz = z; zz > z1; zz -= 0.8) SOLIDS.add(xa + ((xb - xa) * (z - zz)) / (z - z1 || 1), zz, 0.15);
      }
    };
    run(-468, MOUTH[1]); run(MOUTH[0], -588);
    // the trellis gates, red frames and white diagonals, swung back against the fence either side of the mouth
    for (const [za, zb] of [[MOUTH[1], MOUTH[1] + 3.2], [MOUTH[0], MOUTH[0] - 3.2]]) {
      const x = pentFenceX(za) + 0.35, y = gy(x, za);
      k.plain.push([B(x - 0.04, x + 0.04, y + 0.15, y + 1.35, Math.min(za, zb), Math.max(za, zb)), '#c8261e']);
      for (let i = 0; i < 6; i++) { const z = Math.min(za, zb) + (i + 0.5) * 0.53; k.plain.push([new THREE.BoxGeometry(0.05, 1.3, 0.06).rotateX(i & 1 ? 0.75 : -0.75).translate(X(x + 0.05), y + 0.75, Z(z)), '#f4f4f1']); }
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
    k.plain.push([B(514.9, 516.9, sy + 1.2, sy + 2.2, SP[2] - 0.04, SP[2]), '#2c3640'], [B(SP[0] - 0.04, SP[0], sy + 1.2, sy + 2.2, -531.8, -530.2), '#2c3640']);
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

// ---------- behind Nairobi: the low building where food is sold (owner's third reference PDF, page 18) ----------
// One floor on a raised base: white walls over a deep red foot; on the west a red sheet gable roof; in the middle a
// raised box of dark vertical boards under a shallow roof, a small sign on it; on the east plain white under a low
// grey roof. Red-painted steps climb to its doors on the side toward the courts; a brick path along it, gravel round.
const FO: [number, number] = [712.35, -486.25];
const FOOD = [700.3, 724.4, -494.2, -478.3];
const FOOD_WALL: Style = {
  bay: 3.0, up: [], ground: [[90, 256 + 70, 76, 90]],
  draw: (g) => { render(g, '#f2f0ea'); g.fillStyle = '#2a2420'; g.fillRect(90, 256 + 70, 76, 90); g.fillStyle = '#5a4a3c'; for (let y = 256 + 76; y < 256 + 158; y += 9) g.fillRect(92, y, 72, 3); g.fillStyle = DEEP_RED; g.fillRect(0, 512 - 80, 256, 80); },
};
const food: Spec = {
  name: 'Pent food building behind Nairobi',
  axis: [1, 0], origin: FO, storey: 3.0, style: FOOD_WALL, roofColor: '#a8382c', fascia: '#4a3a30', pitch: 0.35, plinth: DEEP_RED,
  replaces: [[712, -486]],
  blocks: [{ x0: FOOD[0] - FO[0], x1: FOOD[1] - FO[0], z0: FOOD[2] - FO[1], z1: FOOD[3] - FO[1], floors: 1, roof: 'none' }],
  keep: [[FOOD[0] - 3 - FO[0], FOOD[1] + 3 - FO[0], FOOD[2] - 4 - FO[1], FOOD[3] + 2 - FO[1]]],
  extras: (k) => {
    const X = (x: number) => x - FO[0], Z = (z: number) => z - FO[1];
    const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
    const e = k.wallTop(1), c: Part[] = [];
    const M = (x: number, z: number): [number, number] => [X(x), Z(z)];
    // the west part's red sheet gable roof, the timber box in the middle, the east part's low grey roof
    hipRoof(k, M, FOOD[0] - 0.6, 709.5, FOOD[2] - 0.6, FOOD[3] + 0.6, e, 0.35, 'z', [{ gw: 99, tri: false }, { gw: 99, tri: false }], c, '#4a3a30');
    for (const z of [FOOD[2], FOOD[3]]) k.plain.push([tri2([X(FOOD[0] - 0.5), e, Z(z)], [X(709.4), e, Z(z)], [X((FOOD[0] + 709.4) / 2), e + 4.6 * 0.35, Z(z)]), '#f2f0ea']);
    c.push([B(709.5, 717.5, e, e + 1.5, FOOD[2] + 1.5, FOOD[3] - 1.5), '#2a2622']);
    for (let x = 709.6; x < 717.5; x += 0.35) k.plain.push([B(x, x + 0.06, e + 0.05, e + 1.45, FOOD[2] + 1.47, FOOD[2] + 1.5), '#45403a']);
    k.roof.c = new THREE.Color('#5b5f60');
    k.roof.quad([X(709.2), e + 1.5, Z(FOOD[2] + 1.2)], [X(717.8), e + 1.5, Z(FOOD[2] + 1.2)], [X(717.8), e + 1.8, Z(FOOD[3] - 1.2)], [X(709.2), e + 1.8, Z(FOOD[3] - 1.2)]);
    k.plain.push([B(711.5, 714.5, e + 0.5, e + 1.2, FOOD[2] + 1.4, FOOD[2] + 1.47), '#e8c23a']);
    k.roof.quad([X(709.5), e, Z(FOOD[2] - 0.6)], [X(FOOD[1] + 0.6), e, Z(FOOD[2] - 0.6)], [X(FOOD[1] + 0.6), e + 0.6, Z((FOOD[2] + FOOD[3]) / 2)], [X(709.5), e + 0.6, Z((FOOD[2] + FOOD[3]) / 2)]);
    k.roof.quad([X(FOOD[1] + 0.6), e, Z(FOOD[3] + 0.6)], [X(709.5), e, Z(FOOD[3] + 0.6)], [X(709.5), e + 0.6, Z((FOOD[2] + FOOD[3]) / 2)], [X(FOOD[1] + 0.6), e + 0.6, Z((FOOD[2] + FOOD[3]) / 2)]);
    // red-painted steps up to the two doors on the north, white grille doors
    for (const dx of [704.0, 719.5]) {
      for (let i = 0; i < 3; i++) c.push([B(dx - 1.1, dx + 1.1, 0, PL - (PL / 3) * i, FOOD[2] - 0.4 * (i + 1), FOOD[2] - 0.4 * i), '#b23a2e']);
      k.plain.push([B(dx - 0.55, dx + 0.55, PL, PL + 2.2, FOOD[2] - 0.03, FOOD[2]), '#e9e7e0']);
      for (let x = dx - 0.5; x < dx + 0.55; x += 0.14) k.plain.push([B(x, x + 0.025, PL + 0.1, PL + 2.1, FOOD[2] - 0.05, FOOD[2] - 0.03), '#7d7a74']);
    }
    // the brick path along the east end and the gravel round it
    k.plain.push([B(FOOD[1] + 0.8, FOOD[1] + 2.3, 0.01, 0.04, FOOD[2] - 6, FOOD[3] + 1), '#a5563f']);
    k.plain.push([B(FOOD[0] - 2.5, FOOD[1] + 0.8, 0.005, 0.02, FOOD[2] - 4, FOOD[2] - 1.3), '#9b9488']);
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; k.meshes.push(m);
  },
};

// ---------- the admin block (frame: the courts' axis, origin at the footprint's middle) ----------
const ADMIN_F = 4;
const admin: Spec = {
  name: 'Pent Admin Block',
  axis: COURT_AXIS, origin: [632, -514], storey: 3.4, style: ADMIN_WIN, roofColor: '#b0573a', fascia: FASCIA, pitch: 0.45,
  replaces: [[622, -515]],
  blocks: [
    { x0: -14.1, x1: -1.5, z0: -13, z1: 12.5, floors: ADMIN_F, roof: 'none' },
    { x0: 5.4, x1: 14.1, z0: -13.3, z1: 12.3, floors: ADMIN_F, roof: 'none' },
    { x0: -1.5, x1: 5.4, z0: 3.4, z1: 12.3, floors: ADMIN_F - 1, pitch: 0.35 },
  ],
  keep: [[-16, 16, -19, -13]],
  extras: (k) => {
    const e = k.wallTop(ADMIN_F);
    // the two towers: front-facing gables (owner photo), roofs running back
    gableZ(k, -14.8, -0.8, -13.8, 13.2, e, 0.55, [true, true]);
    gableZ(k, 4.7, 14.8, -14.1, 13, e, 0.7, [true, true]);
    // brick-red panels up the towers' outer corners
    for (const [x0, x1] of [[-14.1, -12.1], [12.1, 14.1]] as [number, number][]) k.plain.push([box(x0, x1, PL, e - 0.3, -13.4, -13.25), BRICK]);
    // the recessed centre: a balcony with a railing on the second and third floors
    for (const f of [2, 3]) {
      const y = PL + f * 3.4;
      k.plain.push([box(-1.5, 5.4, y - 0.1, y + 0.05, -1, 3.4), '#e9e7e1']);
      k.plain.push([box(-1.5, 5.4, y + 1.0, y + 1.08, -1, -0.9), '#4a4d52']);
      for (let x = -1.3; x < 5.3; x += 0.25) k.plain.push([box(x - 0.02, x + 0.02, y, y + 1.0, -1, -0.95), '#4a4d52']);
    }
    // the tiled veranda along the ground floor
    const vy = 3.6;
    k.roof.c = new THREE.Color('#b8603a');
    k.roof.quad([-15, vy - 0.6, -16.2], [15, vy - 0.6, -16.2], [15, vy + 0.4, -13.3], [-15, vy + 0.4, -13.3]);
    for (const x of [-14.6, -9, -4.5, 9.5, 14.6]) k.plain.push([box(x - 0.15, x + 0.15, 0, vy - 0.6, -16.1, -15.8), WHITE]);
    // the gabled porch between the towers, with the sunburst gable and the sign
    const px0 = -2.2, px1 = 6.1, pz0 = -18.2, pz1 = -13, ph = 4.0;
    for (const x of [px0 + 0.3, px1 - 0.3]) k.plain.push([box(x - 0.25, x + 0.25, 0.3, ph, pz0 + 0.2, pz0 + 0.7), WHITE]);
    k.plain.push([box(px0, px1, ph, ph + 0.8, pz0, pz1), '#f1e7d2']);
    gableZ(k, px0 - 0.4, px1 + 0.4, pz0 - 0.4, pz1, ph + 0.8, 0.6, [true, false]);
    const gx = (px0 + px1) / 2;
    for (let i = 0; i < 7; i++) {
      const a = (i / 6) * Math.PI;
      k.plain.push([new THREE.BoxGeometry(0.06, 1.9, 0.04).translate(0, 0.95, 0).rotateZ(Math.PI / 2 - a).translate(gx, ph + 0.85, pz0 + 0.18), '#8b6a4a']);
    }
    k.signs.push({ text: 'GHANA HOSTELS LTD', x: gx, y: ph + 0.4, z: pz0 - 0.01, ry: Math.PI, w: 4.2, colors: ['#3b3a36', '#f4ead2'] });
    for (let i = 0; i < 3; i++) k.plain.push([box(px0 + 0.3 - i * 0.2, px1 - 0.3 + i * 0.2, 0, 0.3 - i * 0.1, pz0 - i * 0.4, pz1), PAVE]);
    k.glass.push(box(gx - 2.2, gx + 2.2, 0.3, 3.0, -13.04, -13));
  },
};

// ---------- New Pent entrance pavilions (frame: map axes, origin at the owner's mark, front to +z) ----------
const NEW_F = 4, NEW_STOREY = 3.4;
function pavilion(name: string, at: [number, number]): Spec {
  return {
    name,
    axis: [1, 0], origin: at, storey: NEW_STOREY, style: OLD_WIN, roofColor: '#b5532f', fascia: FASCIA, pitch: 0.5,
    blocks: [],
    keep: [[-5, 5, -1.5, 6]],
    extras: (k) => {
      const CREAM = '#efe4cc', e = PL + NEW_F * NEW_STOREY + 0.4;
      // the projecting tower, the height of the block, with an arched window high up and a front gable
      k.plain.push([box(-4.2, 4.2, 0, e, -1.5, 2.5), CREAM]);
      gableZ(k, -4.8, 4.8, -2, 3.1, e, 0.6, [false, true]);
      k.glass.push(box(-0.8, 0.8, e - 3.4, e - 1.2, 2.5, 2.54));
      k.plain.push([new THREE.CircleGeometry(0.8, 14, 0, Math.PI).translate(0, e - 1.2, 2.55), '#2b3a48']);
      k.plain.push([box(-1.1, 1.1, e - 3.6, e - 3.4, 2.5, 2.7), TRIM]);
      // a balcony row above the porch
      k.glass.push(box(-3, 3, PL + 2 * NEW_STOREY + 0.6, PL + 2 * NEW_STOREY + 2.4, 2.5, 2.54));
      k.plain.push([box(-3.2, 3.2, PL + 2 * NEW_STOREY + 0.5, PL + 2 * NEW_STOREY + 1.4, 2.5, 2.75), CREAM]);
      // the porch: columns, an arched opening, a small tile gable over it (owner photo)
      for (const x of [-3.6, -1.4, 1.4, 3.6]) k.plain.push([box(x - 0.25, x + 0.25, 0, 3.6, 4.9, 5.4), CREAM]);
      k.plain.push([box(-4, 4, 3.6, 4.4, 2.5, 5.5), CREAM]);
      k.plain.push([new THREE.CircleGeometry(1.15, 16, 0, Math.PI).translate(0, 2.45, 5.42), '#3b2e26']);
      gableZ(k, -4.4, 4.4, 2.5, 5.9, 4.4, 0.55, [false, true]);
      k.plain.push([box(-4, 4, 0, 0.2, 2.5, 6), '#b9805a']);
      k.glass.push(box(-1.6, 1.6, 0.2, 3.0, 2.5, 2.54));
      k.plain.push([box(-4.25, 4.25, 0, 1.0, 2.5, 2.56), RED_BASE]);
    },
  };
}

/** Old Pent courts, the admin block and the New Pent entrance pavilions */
export const pentagon = createSite('pentagon', [
  court('Addis Ababa Court', [540.5, -510], [[530, -501], [552, -502], [551, -520], [529, -517], [541, -509]], { sign: 'ADDIS ABABA COURT', initials: 'AC', extras: addisKiosk }),
  court('Dar es Salaam Court', [589.75, -514], [[579, -522], [579, -505], [600, -523], [601, -506], [591, -515]], { sign: 'DAR ES SALAAM COURT', initials: 'DC' }),
  court('Kampala Court', [672, -522.4], [[672, -525]], { sign: 'KAMPALA COURT', initials: 'KC' }),
  court('Nairobi Court', [722, -526.5], [[722, -529]], { sign: 'NAIROBI COURT', initials: 'NC', extras: nairobiBack }),
  admin,
  entrance,
  food,
  pavilion('New Pent Block A', [575.6, -628]),
  pavilion('New Pent Block B', [568.4, -766]),
  pavilion('New Pent Block C', [686.8, -698]),
]);

/** where the New Pent blocks stand (the yellow zone on the owner's aerial) */
const NEW_PENT = [[507, 635, -839, -585], [632, 756, -797, -641]];
/** New Pent's wings: cream render and terracotta roofs (owner photo); undefined for every other building */
export function newPentStyle(b: Building) {
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  return NEW_PENT.some(([x0, x1, z0, z1]) => cx > x0 && cx < x1 && cz > z0 && cz < z1) ? { wall: '#f1e6cf', roof: '#b5532f' } : undefined;
}
