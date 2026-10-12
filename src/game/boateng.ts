// E.A. Boateng Road (the owner's Legon Fire Station, Child Lab and E.A. Boateng Road brief; numbers in fsplan.ts):
// - R1, Pairs 1 and 2: the courtyard complex west of the road is a low perimeter of one-storey wings round an open court
//   (agprecinct.ts draws its north and south ranges): the east range along the road, low under its long red roof with
//   small dark openings, the narrower link in its middle with the passage through it; the court's grass panels split by
//   two north-south walks and one east-west walk that runs on through the passage to the road, one tree. Across the road
//   the low long building (osm:way/492099547): pale walls on a dark plinth, a shallow red roof with a dark fascia, its
//   north end a mostly blank wall with a door at one side and a small wall fitting, its east side divided by shallow
//   pilasters with small openings; the solar-style lamp in its garden, the clipped hedge along the avenue, a big tree on
//   the pavilion's side;
// - R2, Pairs 7-13, the cluster in the road's bend (agprecinct.ts draws its three low wings): CEDSA's perforated pale
//   screen along the south side toward the road on its red base, the gate in the middle (pale piers, the black gridded
//   gate, the small tiled cap, the fascia sign CENTRE FOR DISABILITY STUDIES AND ADVOCACY (CEDSA)), the notice panel
//   beside it, the dark worn forecourt; CEGENSA's gable at the east wing's north end (the sign, the small high vent, the
//   tall dark louvred opening under a small tiled awning, the planted bed with its pale kerb); the irregular tan stone
//   court north of the wings and the stone path from it to the road (the mapped service road, paved here), the planted
//   border and the tall conical shrubs, the patchy garden with its trees and small palms beside the path, the
//   freestanding CEGENSA direction sign with its arrow; west of the court the tall unmown grass and the worn earth track
//   across it (Pair 12). CEDSA and CEGENSA keep their own names; the map's business pin does not rename either.
import * as THREE from 'three';
import { BUILDINGS, NODE_XZ, ROADS, type Building } from './campusmap';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { box, canvas, merge, type Part } from './modelkit';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { Bag, FASCIA, hash, lowWing, tuft, vnoise, wallSolids, fanPalm, type R4 } from './enkit';
import { gableTri } from './ias';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { halfOf } from './lbplan';
import { flagMat, hall, louvreMat, patch, place, rect, roofMeshes, stripPoly, textPanel } from './fskit';
import { CEDSA, CEGENSA, CONIFERS, GRASS, R1, SIGN, SIGN_RY, TRACK, signPosts } from './fsplan';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#f1efe9') };
type P2 = [number, number];
const TILES = ['#a9563c', '#9c5236', '#b25e40'];

// ---------- the mapped roads near the work ----------
const segs: [number, number, number, number, number, number][] = [];
for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++) {
  const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
  if (Math.max(ax, bx) < 360 || Math.min(ax, bx) > 620 || Math.max(az, bz) < 120 || Math.min(az, bz) > 420) continue;
  segs.push([ax, az, bx, bz, halfOf(r), r.cls]);
}
/** distance from (x, z) to the nearest road's edge (negative on it); footways only with `paths`; roads the models pave
 *  themselves (in `skip`) not at all */
function clear(x: number, z: number, paths = false, skip?: (x: number, z: number) => boolean) {
  let best = 50;
  for (const [ax, az, bx, bz, h, cls] of segs) {
    if (cls === 4 && !paths) continue;
    const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    const px = ax + dx * t, pz = az + dz * t;
    if (skip?.(px, pz)) continue;
    best = Math.min(best, Math.hypot(px - x, pz - z) - h);
  }
  return best;
}
const inRing = (b: Building, x: number, z: number) => {
  let c = false;
  for (let i = 0, j = b.pts.length - 2; i < b.pts.length; j = i, i += 2) {
    const zi = b.pts[i + 1], zj = b.pts[j + 1];
    if ((zi > z) !== (zj > z) && x < ((b.pts[j] - b.pts[i]) * (z - zi)) / (zj - zi) + b.pts[i]) c = !c;
  }
  return c;
};
const inside = (x: number, z: number) => BUILDINGS.some((b) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ && inRing(b, x, z));

// ======================================================================================================
// R1: the courtyard's east range and court
// ======================================================================================================
const O1: P2 = [460, 183];
const court: Spec = {
  name: 'Courtyard complex east range and court', axis: [1, 0], origin: O1, storey: 3.3, style: PLAIN, roofColor: TILES[0], fascia: FASCIA, pitch: 0.45,
  replaces: [[487, 165], [487, 183], [487, 200]],
  blocks: [],
  onGround: true,
  // the court and its walks, the walk on to the road: no generic trees or lamps on them
  keep: [[R1.court[0] - O1[0], 507 - O1[0], R1.court[2] - O1[1], R1.court[3] - O1[1]]],
  extras: (k: Kit) => {
    const b = new Bag(O1);
    // the east range: one storey, its ridge along the road, small dark openings; the narrower link lower, the passage
    lowWing(k, b, R1.eastN, { eave: 3.3, along: 'z', roof: TILES[1], ends: [0, 0], over: 1.0, faces: { x1: 'w-w-W-w-w', x0: 'W-W-D-W-W', z0: 'w-W' } });
    lowWing(k, b, R1.eastS, { eave: 3.3, along: 'z', roof: TILES[1], ends: [0, 0], over: 1.0, faces: { x1: 'w-W-w-w-W', x0: 'W-D-W-W-W', z1: 'w-W' } });
    lowWing(k, b, R1.eastLink, { eave: 2.9, along: 'z', roof: TILES[2], ends: [0, 0], over: 0.8, faces: { x1: 'w---w', x0: 'w---w' } });
    const [p0, p1] = R1.passage;
    for (const x of [R1.eastLink[0], R1.eastLink[1]]) b.door.push(b.plane(false, x + (x === R1.eastLink[0] ? -0.04 : 0.04), x === R1.eastLink[0] ? -1 : 1, (p0 + p1) / 2, p1 - p0 - 0.4, 0, 2.4));
    // the court: grass panels between the walks; the walk east through the passage to the road
    const [cx0, cx1, cz0, cz1] = R1.court, hw = R1.walkW / 2;
    const onWalk = (x: number, z: number) => R1.walksX.some((wx) => Math.abs(x - wx) < hw) || Math.abs(z - R1.walkZ) < hw;
    k.meshes.push(new THREE.Mesh(drapeAt(O1, cx0, cx1, cz0, cz1, 0.3, 0.04, (x, z) => {
      const m = vnoise(x * 0.9, z * 0.9) * 0.05;
      if (onWalk(x, z)) return [0.77 + m, 0.71 + m, 0.6 + m];
      const n = vnoise(x * 0.25, z * 0.25);
      return n > 0.72 ? [0.47 + m, 0.46 + m, 0.3] : [0.37 + m, 0.5 + m, 0.25];
    }), groundCover()));
    k.meshes.push(new THREE.Mesh(drapeAt(O1, R1.eastLink[1], 507, R1.walkZ - hw, R1.walkZ + hw, 0.3, 0.04, (x, z) => (clear(x, z) < 0.1 ? null : [0.77 + vnoise(x, z) * 0.05, 0.71, 0.6])), groundCover()));
    // the walks' low edges, one tree in the south-middle panel (R1)
    for (const wx of R1.walksX) for (const s of [-1, 1]) b.c.push([b.B(wx + s * hw - 0.06, wx + s * hw + 0.06, 0, 0.08, cz0, cz1), '#cfc9bc']);
    for (const s of [-1, 1]) b.c.push([b.B(cx0, cx1, 0, 0.08, R1.walkZ + s * hw - 0.06, R1.walkZ + s * hw + 0.06), '#cfc9bc']);
    broadleaf(k, b.leaf, 444, 190.2, { h: 7.5, spread: 7, seed: 41, origin: O1, round: true });
    b.finish(k, 0.3);
  },
};

// ---------- the low long building across the road (Pair 2) ----------
const O2: P2 = [563, 178];
const longBuilding: Spec = {
  name: 'Low long building by E.A. Boateng Road', axis: [1, 0], origin: O2, storey: 3.2, style: PLAIN, roofColor: TILES[0], fascia: '#262220', pitch: 0.22,
  replaces: [[563, 180]],
  blocks: [],
  onGround: true,
  keep: [[548 - O2[0], 580 - O2[0], 145 - O2[1], 152 - O2[1]]],
  extras: (k: Kit) => {
    const b = new Bag(O2), c: Part[] = [];
    const [x0, x1, z0, z1] = R1.long, eave = 3.0, pitch = 0.22;
    // shallow gable ends (the end in Pair 2 is a low triangle under a dark fascia); pale walls on a dark brown plinth
    lowWing(k, b, R1.long, { eave, pitch, along: 'z', roof: '#b0573a', ends: [9, 9], over: 0.7, base: 0.35, faces: { z0: 'D-----', x0: 'w-W-w-W-D-w-W-w-W-w-W-w', z1: 'w-W-w' } });
    for (const [e, z] of [[0, z0], [1, z1]] as [number, number][]) gableTri(b, true, z, e ? 1 : -1, x0, x1, eave, pitch * 0.97);
    lowWing(k, b, R1.longBay, { eave: 2.7, pitch: 0.3, along: 'z', roof: '#b0573a', ends: [0, 0], over: 0.5, base: 0.35, faces: { x0: 'w-w' } });
    // its plinth darker than the family's red band; the small horizontal fitting by the end's door
    b.c.push([b.B(x0 - 0.05, x1 + 0.05, -0.3, 0.36, z0 - 0.05, z1 + 0.05), '#6b4a3a']);
    b.c.push([b.B(x0 + 2.2, x0 + 3.3, 2.35, 2.5, z0 - 0.12, z0), '#d8d6cf']);
    // the east side: shallow pilasters dividing it, a small high opening in each bay
    for (let z = z0 + 0.2; z < z1; z += 4.4) b.c.push([b.B(x1, x1 + 0.16, 0, eave, z, z + 0.32), '#f3f1ea']);
    for (let z = z0 + 2.4; z < z1 - 1; z += 4.4) { b.win.push(b.plane(false, x1 + 0.04, 1, z, 0.7, 1.9, 2.5)); b.win.push(b.plane(false, x1 + 0.04, 1, z + 1.1, 0.5, 1.0, 1.6)); }
    // the solar-style lamp in the garden (Pair 2)
    const [lx, lz] = R1.lamp, X = lx - O2[0], Z = lz - O2[1];
    c.push([new THREE.CylinderGeometry(0.05, 0.07, 4.6, 8).translate(X, 2.3, Z), '#c9c9c6'], [box(X - 0.25, X + 0.25, 4.6, 4.68, Z - 0.35, Z + 0.35), '#2b3a55'], [box(X - 0.12, X + 0.12, 4.4, 4.6, Z - 0.12, Z + 0.12), '#e8e8e2']);
    SOLIDS.add(lx, lz, 0.08);
    // the clipped hedge along the garden's road side, low shrubs near the end wall, the big tree on the pavilion's side
    for (let x = 548.5; x < 580; x += 1.1) b.leaf.push([new THREE.BoxGeometry(1.2, 0.95, 1.0).translate(x - O2[0], 0.47, 147.6 - O2[1] + (hash(x, 2) - 0.5) * 0.1), ['#2f5a25', '#36652a'][Math.round(x) % 2]]);
    for (const [x, z, r] of [[561.5, 150.2, 0.6], [565.8, 150.4, 0.5], [568.4, 150.0, 0.7], [571.2, 151.5, 0.45]] as [number, number, number][]) b.leaf.push([new THREE.IcosahedronGeometry(r, 1).scale(1.2, 1.0, 1.2).translate(x - O2[0], r * 0.8, z - O2[1]), '#4b7a32']);
    b.leaf.push([new THREE.ConeGeometry(0.9, 3.4, 8).translate(567.2 - O2[0], 1.9, 150.6 - O2[1]), '#3f6a2a']);
    broadleaf(k, b.leaf, 549.5, 163, { h: 10, spread: 11, seed: 77, origin: O2 });
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.finish(k, 0.3);
  },
};

// ======================================================================================================
// R2: CEDSA's screen and gate, CEGENSA's gable and sign, the stone court and path, the tall grass
// ======================================================================================================
const O3: P2 = [425, 360];
/** the stone path from the court to the road along the mapped drive */
const PATH: P2[] = [[434.7, 343.0], [441.5, 352.4], [448.2, 361.9], [455.6, 371.6]];
const COURT_N: R4 = [406, 441, 339.8, 354.35];
const COURT_IN: R4 = [413.25, 425.55, 354.75, 366.0];
const BED_TO = (t: number, off: number): P2 => {
  // a point along the path, `off` to its east
  const [ax, az] = PATH[0], [bx, bz] = PATH[PATH.length - 1], dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz);
  return [ax + dx * t + (-dz / l) * -off, az + dz * t + (dx / l) * -off];
};

let SCREEN: THREE.MeshStandardMaterial | null = null;
/** CEDSA's screen: pale render pierced by narrow vertical slots in staggered columns, a red base band (one 3.6 m panel
 *  to the texture, 2.4 m high) */
const screenMat = () => (SCREEN ??= new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide, map: (() => {
  const t = canvas(360, 240, (g) => {
    g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, 360, 240);
    for (let i = 0; i < 300; i++) { g.fillStyle = ['#e7e4dc', '#f8f7f2'][i % 2]; g.fillRect(hash(i, 1) * 360, hash(2, i) * 200, 3, 3); }
    g.fillStyle = '#c4452e'; g.fillRect(0, 196, 360, 44);
    g.fillStyle = '#a63a28'; g.fillRect(0, 196, 360, 3);
    // two groups of slot columns per panel, staggered rows
    for (const gx of [30, 210]) for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      const x = gx + c * 32, y = 34 + r * 38 + (c % 2) * 16;
      g.fillStyle = '#1d1f20'; g.fillRect(x, y, 10, 26);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 10, y, 3, 26);
    }
    // the pier between panels
    g.fillStyle = '#e6e3db'; g.fillRect(170, 0, 14, 196);
  });
  t.wrapS = THREE.RepeatWrapping;
  return t;
})() }));
let GATE: THREE.MeshStandardMaterial | null = null;
/** the black gate: a tight rectangular grid of bars in a heavy frame (Pair 8) */
const gateMat = () => (GATE ??= new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.3, side: THREE.DoubleSide, map: canvas(128, 256, (g) => {
  g.fillStyle = '#0d0d0e'; g.fillRect(0, 0, 128, 256);
  g.fillStyle = '#3a3c3e'; for (let x = 10; x < 120; x += 9) g.fillRect(x, 10, 3, 236); for (let y = 10; y < 248; y += 9) g.fillRect(10, y, 108, 3);
  g.fillStyle = '#1a1b1c'; g.fillRect(0, 0, 128, 8); g.fillRect(0, 248, 128, 8); g.fillRect(0, 0, 8, 256); g.fillRect(120, 0, 8, 256); g.fillRect(61, 0, 6, 256);
}) }));

const cluster: Spec = {
  name: 'CEDSA and CEGENSA by E.A. Boateng Road', axis: [1, 0], origin: O3, storey: 3.3, style: PLAIN, roofColor: TILES[0], fascia: FASCIA, pitch: 0.45,
  blocks: [],
  onGround: true,
  // the stone court and path, the garden beside it, the forecourt, the tall grass: no generic trees, lamps or cars there
  keep: [[404 - O3[0], 446 - O3[0], 338 - O3[1], 368 - O3[1]], [433 - O3[0], 458 - O3[0], 340 - O3[1], 380 - O3[1]], [404 - O3[0], 438 - O3[0], 376 - O3[1], 394 - O3[1]], [GRASS.x0 - O3[0], GRASS.x1 - O3[0], GRASS.z0 - O3[1], GRASS.z1 - O3[1]]],
  extras: (k: Kit) => {
    const b = new Bag(O3), c: Part[] = [], roofs = new Map<string, THREE.BufferGeometry[]>();
    const X = (x: number) => x - O3[0], Z = (z: number) => z - O3[1];

    // ---------- CEDSA's screen, gate and forecourt (Pairs 7, 8) ----------
    {
      const { z, x0, x1, h, gate: [g0, g1], panel: [p0, p1] } = CEDSA, sm = screenMat();
      const screen = (ax: number, bx: number) => {
        // both faces of the screen as textured planes, its top coping, its thickness
        for (const s of [-1, 1]) {
          const g = new THREE.PlaneGeometry(bx - ax, h).translate(X((ax + bx) / 2), h / 2, Z(z) + s * 0.1);
          if (s < 0) g.rotateY(0);
          const uv = g.attributes.uv as THREE.BufferAttribute;
          for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * ((bx - ax) / 3.6));
          const me = new THREE.Mesh(g, sm); me.receiveShadow = true; k.meshes.push(me);
        }
        c.push([box(X(ax), X(bx), h, h + 0.1, Z(z) - 0.14, Z(z) + 0.14), '#e9e6de'], [box(X(ax), X(bx), -0.2, 0.05, Z(z) - 0.1, Z(z) + 0.1), '#a63a28']);
        wallSolids(ax, z, bx, z, 0.2);
      };
      screen(x0, g0 - 0.6); screen(g1 + 0.6, x1);
      // the returns back to the wings, plain render on the red base
      for (const [x, zb] of [[x0, CEDSA.back[0]], [x1, CEDSA.back[1]]] as [number, number][]) {
        c.push([box(X(x) - 0.1, X(x) + 0.1, -0.2, h, Z(zb), Z(z)), '#f0eee8'], [box(X(x) - 0.12, X(x) + 0.12, -0.2, 0.45, Z(zb), Z(z)), '#c4452e']);
        wallSolids(x, zb, x, z, 0.2);
      }
      // the gate: pale piers on the red base, the black gridded leaves (closed), the small tiled cap, the fascia sign
      for (const x of [g0 - 0.3, g1 + 0.3]) {
        c.push([box(X(x) - 0.3, X(x) + 0.3, -0.2, 2.95, Z(z) - 0.3, Z(z) + 0.3), '#f3f1eb'], [box(X(x) - 0.32, X(x) + 0.32, -0.2, 0.5, Z(z) - 0.32, Z(z) + 0.32), '#c4452e']);
        SOLIDS.add(x, z + 0.3, 0.3);
      }
      const gate = new THREE.Mesh(new THREE.PlaneGeometry(g1 - g0, 2.35).translate(X((g0 + g1) / 2), 1.2, Z(z) + 0.02), gateMat());
      k.meshes.push(gate);
      c.push([box(X(g0), X(g1), 2.35, 2.95, Z(z) - 0.12, Z(z) + 0.12), '#f3f1eb'], [box(X(g0), X(g1), -0.05, 0.03, Z(z) - 0.3, Z(z) + 0.4), '#bdb8ad']);
      wallSolids(g0, z, g1, z, 0.2);
      hall(c, roofs, [X(g0 - 0.9), X(g1 + 0.9), Z(z) - 0.85, Z(z) + 0.85], { along: 'x', eave: 3.0, pitch: 0.5, over: 0.25, wall: '#f3f1eb', roof: '#a9563c', kind: 'tile', fascia: '#5a3a2c', gables: [false, false], open: true });
      k.meshes.push(place(textPanel(4.3, 0.32, [{ t: '■ CENTRE FOR DISABILITY STUDIES AND ADVOCACY (CEDSA)', s: 0.62, c: '#20242a', b: true }], '#f5f4ef'), X((g0 + g1) / 2), 2.72, Z(z) + 0.32, 0));
      // the notice panel beside the gate: a printed banner on a frame (its wording is not legible: pictures and bands only)
      k.meshes.push(place(textPanel(p1 - p0, 1.7, [], '#f4f3ef', (g, W, H) => {
        g.fillStyle = '#2c5aa0'; g.fillRect(0, 0, W, H * 0.16);
        for (let i = 0; i < 6; i++) { g.fillStyle = ['#8a9a7c', '#b7a48a', '#6f8bb0', '#c9b6a0', '#90a4ae', '#a6987e'][i]; g.fillRect(W * (0.05 + (i % 3) * 0.31), H * (0.24 + Math.floor(i / 3) * 0.36), W * 0.27, H * 0.3); }
        g.fillStyle = '#d24a3a'; g.fillRect(0, H * 0.94, W, H * 0.06);
      }), X((p0 + p1) / 2), 1.4, Z(z) + 0.13, 0));
      // the dark worn forecourt from the screen to the road, leaves scattered on it
      k.meshes.push(new THREE.Mesh(drapeAt(O3, 404.5, 437.5, z + 0.12, 399, 0.4, 0.05, (x, zz) => {
        if (clear(x, zz) < 0.1) return null;
        const m = vnoise(x * 1.5, zz * 1.5) * 0.05, n = vnoise(x * 0.3, zz * 0.3) * 0.04;
        return [0.27 + m + n, 0.26 + m + n, 0.25 + m];
      }), groundCover()));
    }

    // ---------- CEGENSA's gable (Pair 9): the sign, the high vent, the louvred opening and its awning, the bed ----------
    {
      // (in front of the wing's wall face and its red band, agprecinct.ts)
      const zf = CEGENSA.face - 0.12, xm = (CEGENSA.x0 + CEGENSA.x1) / 2;
      k.meshes.push(place(textPanel(3.3, 1.15, [
        { t: 'CEGENSA', s: 0.36, c: '#2a4f8f', b: true },
        { t: 'Centre For Gender Studies And Advocacy', s: 0.12, c: '#2a4f8f' },
        { t: 'UNIVERSITY OF GHANA', s: 0.12, c: '#1d2a44', b: true },
      ], '#f5f5f1', (g, W, H) => { g.fillStyle = '#2a4f8f'; g.fillRect(0, H * 0.9, W, H * 0.1); g.fillStyle = '#2a4f8f'; g.fillRect(0, 0, W, H * 0.04); }), X(xm), 3.3, Z(zf) - 0.02, Math.PI));
      c.push([box(X(xm) - 0.28, X(xm) + 0.28, 4.18, 4.5, Z(zf) - 0.05, Z(zf)), '#1b1b1b']);
      const lv = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.85).rotateY(Math.PI).translate(X(xm), 1.55, Z(zf) - 0.01), louvreMat());
      k.meshes.push(lv);
      // the small tiled awning over the louvres, below the sign
      const aw = new THREE.BoxGeometry(1.5, 0.08, 0.6).rotateX(-0.35).translate(X(xm), 2.68, Z(zf) - 0.3);
      c.push([aw, '#a9563c'], [box(X(xm) - 0.75, X(xm) + 0.75, 2.52, 2.6, Z(zf) - 0.56, Z(zf) - 0.5), '#7e3f2c']);
      // the bed before the gable: soil, flowering shrubs and low plants behind a pale kerb that curves round it
      const bz0 = CEGENSA.face - 2.6;
      k.meshes.push(new THREE.Mesh(drapeAt(O3, CEGENSA.x0 - 0.8, CEGENSA.x1 + 0.6, bz0, CEGENSA.face - 0.05, 0.25, 0.07, (x, zz) => {
        const m = vnoise(x * 1.4, zz * 1.4) * 0.06;
        return [0.38 + m, 0.29 + m, 0.21];
      }), groundCover()));
      c.push([box(X(CEGENSA.x0 - 0.8), X(CEGENSA.x1 + 0.6), 0, 0.2, Z(bz0) - 0.14, Z(bz0)), '#e1ddd2']);
      for (const x of [CEGENSA.x0 - 0.8, CEGENSA.x1 + 0.6]) c.push([box(X(x) - 0.07, X(x) + 0.07, 0, 0.2, Z(bz0), Z(CEGENSA.face)), '#e1ddd2']);
      for (let x = CEGENSA.x0 - 0.3, i = 0; x < CEGENSA.x1 + 0.3; x += 0.75, i++) {
        const zz = bz0 + 0.9 + (hash(i, 2) - 0.5) * 0.8;
        b.leaf.push([new THREE.IcosahedronGeometry(0.3 + hash(i, 3) * 0.35, 1).scale(1.1, 1.0, 1.1).translate(X(x), 0.35, Z(zz)), ['#3f6a2a', '#4d7a31', '#2f5c26', '#5b8a3a'][i % 4]]);
        if (hash(i, 4) < 0.55) b.leaf.push([new THREE.IcosahedronGeometry(0.1, 0).translate(X(x) + 0.12, 0.62, Z(zz)), ['#d8343f', '#f1c232', '#f4f0e8', '#e05a8a'][i % 4]]);
      }
    }

    // ---------- the stone court, the inner court and the path to the road (Pairs 9-11, 13) ----------
    {
      const polys: [number, number][][] = [rect(COURT_N), rect(COURT_IN), stripPoly(PATH, 5.2)];
      const me = new THREE.Mesh(patch(O3, polys, 0.04), flagMat()); me.receiveShadow = true; k.meshes.push(me);
      // the pale kerb along the path's west side, the garden beyond it (Pair 13)
      for (let i = 0; i < PATH.length - 1; i++) {
        const [ax, az] = PATH[i], [bx, bz] = PATH[i + 1], dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz), nx = dz / l, nz = -dx / l;
        const o = 2.7;
        c.push([new THREE.BoxGeometry(l + 0.05, 0.22, 0.16).rotateY(-Math.atan2(dz, dx)).translate(X((ax + bx) / 2 - nx * o), 0.07, Z((az + bz) / 2 - nz * o)), '#e3dfd5']);
      }
      // the planted border at the court's east side along the path (Pair 11)
      const bedPts: P2[] = [];
      for (let t = 0.08; t <= 0.46; t += 0.04) bedPts.push(BED_TO(t, 3.6));
      for (const [i, [x, z]] of bedPts.entries()) {
        b.leaf.push([new THREE.IcosahedronGeometry(0.32 + hash(i, 5) * 0.3, 1).translate(X(x), 0.35, Z(z)), ['#3f6a2a', '#4d7a31', '#5b8a3a'][i % 3]]);
        if (hash(i, 6) < 0.6) b.leaf.push([new THREE.IcosahedronGeometry(0.1, 0).translate(X(x) + 0.15, 0.68, Z(z)), ['#f1c232', '#d8343f', '#e05a8a'][i % 3]]);
      }
      k.meshes.push(new THREE.Mesh(drapeAt(O3, 436, 449, 343, 360, 0.25, 0.06, (x, z) => {
        const along = bedPts.some(([bx, bz]) => Math.hypot(x - bx, z - bz) < 0.9);
        return along ? [0.38 + vnoise(x, z) * 0.06, 0.29, 0.21] : null;
      }), groundCover()));
      // the tall conical shrubs along the east wing (Pairs 10, 11)
      for (const [i, [x, z]] of CONIFERS.entries()) {
        b.leaf.push([new THREE.ConeGeometry(0.75, 4.6 + i * 0.3, 10).translate(X(x), 2.6 + i * 0.15, Z(z)), ['#2b4a26', '#2f5228', '#284524'][i]]);
        b.c.push([b.B(x - 0.08, x + 0.08, 0, 0.5, z - 0.08, z + 0.08), '#4f4236']);
        SOLIDS.add(x, z, 0.25);
      }
    }

    // ---------- the patchy garden beside the path, its trees and small palms (Pair 13) ----------
    {
      const inGarden = (x: number, z: number) => {
        if (x < 433.3 || x > 452 || z < 352 || z > 377.4) return false;
        if (x < 436.6 && z > 367.8) return false;
        // west of the path's kerb only
        const [ax, az] = PATH[0], [bx, bz] = PATH[PATH.length - 1], dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz);
        return ((x - ax) * dz - (z - az) * dx) / l < -2.85;
      };
      k.meshes.push(new THREE.Mesh(drapeAt(O3, 433.3, 452, 352, 377.4, 0.6, 0.05, (x, z) => {
        if (!inGarden(x, z) || clear(x, z) < 0.3) return null;
        const m = vnoise(x * 1.1, z * 1.1) * 0.05, n = vnoise(x * 0.4, z * 0.4);
        return n > 0.62 ? [0.48 + m, 0.4 + m, 0.27] : [0.36 + m, 0.47 + m, 0.24];
      }), groundCover()));
      for (const [x, z, h, s] of [[437.6, 372.4, 9, 8], [441.2, 376.0, 8, 7]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x * 3 + z, origin: O3 });
      fanPalm(b, 439.6, 366.6, 1.4, 5); fanPalm(b, 441.4, 362.4, 1.5, 9);
      for (let i = 0; i < 60; i++) {
        const x = 433.5 + hash(i, 1.3) * 18, z = 352 + hash(2.1, i) * 25;
        if (!inGarden(x, z)) continue;
        tuft(b, x, z, 0.22 + hash(i, 4) * 0.25, ['#7d8a44', '#6b7a3a', '#8d9450'][i % 3], i + 4000);
      }
    }

    // ---------- the CEGENSA direction sign by the path (Pair 13) ----------
    {
      const [sx, sz] = SIGN, w = 2.0, h = 1.45, y0 = 1.0;
      const panel = textPanel(w, h, [
        { t: 'CEGENSA', s: 0.25, c: '#2a2f86', b: true, f: 'Impact, Arial Black, sans-serif' },
        { t: 'Centre For Gender Studies', s: 0.085, c: '#2a2f86', b: true },
        { t: 'And Advocacy.', s: 0.085, c: '#2a2f86', b: true },
        { t: 'UNIVERSITY OF GHANA', s: 0.1, c: '#1c1c3c', b: true },
        { t: 'COLLEGE OF HUMANITIES', s: 0.065, c: '#1c1c3c' },
        { t: ' ', s: 0.18, c: '#000' },
      ], '#f7f7f4', (g, W, H) => {
        // the red arrow pointing right (the contact lines under the names are not legible: left out)
        g.fillStyle = '#c8202a'; g.fillRect(W * 0.3, H * 0.86, W * 0.3, H * 0.035); g.beginPath(); g.moveTo(W * 0.6, H * 0.82); g.lineTo(W * 0.68, H * 0.877); g.lineTo(W * 0.6, H * 0.935); g.fill();
        g.strokeStyle = '#c9c9c4'; g.lineWidth = 8; g.strokeRect(0, 0, W, H);
      });
      k.meshes.push(place(panel, X(sx), y0 + h / 2, Z(sz), SIGN_RY));
      const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: '#e9e9e4', roughness: 0.8 }));
      k.meshes.push(place(back, X(sx) - Math.sin(SIGN_RY) * 0.03, y0 + h / 2, Z(sz) - Math.cos(SIGN_RY) * 0.03, SIGN_RY + Math.PI));
      for (const [px, pz] of signPosts()) { c.push([new THREE.CylinderGeometry(0.045, 0.05, y0 + h + 0.1, 8).translate(X(px), (y0 + h + 0.1) / 2, Z(pz)), '#d9d9d4']); SOLIDS.add(px, pz, 0.06); }
    }

    // ---------- west of the court: the worn earth track across the tall unmown grass (Pair 12) ----------
    {
      const tr = stripPoly(TRACK, 1.7);
      const onTrack = (x: number, z: number) => {
        for (let i = 0; i < TRACK.length - 1; i++) {
          const [ax, az] = TRACK[i], [bx, bz] = TRACK[i + 1], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
          if (Math.hypot(ax + dx * t - x, az + dz * t - z) < 0.95) return true;
        }
        return false;
      };
      void tr;
      k.meshes.push(new THREE.Mesh(drapeAt(O3, 362, 406, 339.5, 353, 0.25, 0.05, (x, z) => (onTrack(x, z) && x < 405.4 ? [0.6 + vnoise(x * 2, z * 2) * 0.06, 0.39, 0.26] : null)), groundCover()));
      k.meshes.push(new THREE.Mesh(drapeAt(O3, GRASS.x0, GRASS.x1, GRASS.z0, GRASS.z1, 0.8, 0.04, (x, z) => {
        if (onTrack(x, z) || inside(x, z) || clear(x, z, true) < 0.4) return null;
        const m = vnoise(x * 0.9, z * 0.9) * 0.05;
        return [0.46 + m, 0.5 + m, 0.28];
      }), groundCover()));
      for (let i = 0; i < 2600; i++) {
        const x = GRASS.x0 + hash(i, 0.71) * (GRASS.x1 - GRASS.x0), z = GRASS.z0 + hash(0.43, i) * (GRASS.z1 - GRASS.z0);
        if (onTrack(x, z) || inside(x, z) || clear(x, z, true) < 0.6) continue;
        tuft(b, x, z, 0.7 + hash(i, 5) * 0.7, ['#8d9450', '#7d8a44', '#a39a5a', '#6b7a3a'][i % 4], i + 6000);
      }
    }

    roofMeshes(k, roofs);
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.finish(k, 0.3);
  },
};

export const boatengSite = createSite('ea-boateng', [court, longBuilding, cluster]);
