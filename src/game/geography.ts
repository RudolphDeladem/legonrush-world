// The Department of Geography and Resource Development (the owner's 30-pair reconstruction brief, pairs 1-6, Map A),
// one building where the generic blocks stood:
// - the front range along Danquah Avenue, up on its terrace (relief.ts): the central entrance block a little taller under
//   its own hipped tiled roof, its recessed porch of three dark bays (a grilled window, the double door behind its gate, a
//   grilled window) between four white piers, the department's name on the band above them; the one-storey wings either
//   side, white on a red base under red tiles, dark grilled windows, AC units; at the west end the wing's deep veranda
//   of dark doorways between white piers (pair 2);
// - the broad weathered stair in two flights up to the porch between stone-faced planters, the worn slab apron, the
//   stone-faced retaining wall along the front with shrubs behind it;
// - the lawn to the avenue with its stepping slabs and garden lamp, the palm and shrubs by the stair (pair 1); red
//   earth and leaf litter under the trees to the west, the department's blue board (pair 2);
// - the covered corridor (pair 3): the range behind the garden, its tiled veranda floor raised above the grass,
//   square white posts on red feet, dark doors and high louvred windows, the ceiling and the deep eave; the open garden
//   with its low laterite edge;
// - the department's other ranges behind (the lecturers' office, the blocks round the back court), one storey.
// Proportions are read from the photographs; nothing was measured on site.
import * as THREE from 'three';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { Bag, FASCIA, RED_BASE, SOFF, TILE, WALL, facesOf, fanPalm, gh, hash, lowWing, openings, tuft, vnoise, wallSolids, type R4 } from './enkit';
import { hipRoof } from './waccbip';
import { broadleaf, stoneMeshOf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { stairsOf } from './relief';
import { SOLIDS } from './solids';
import type { Part } from './modelkit';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, WALL) };
const GO: [number, number] = [417, 91];
const HIP = { gw: 0, tri: false };
/** the terrace (relief.ts) and the front range on it */
const TER = { x0: 388.6, x1: 453.4, z0: 84.0, z1: 101.2 };
const FRONT = { x0: 390.6, x1: 451.4, back: 84.2, face: 96.8 };
/** the entrance block: its walls, the porch's back wall and the line of its piers */
const ENT = { x0: 409.6, x1: 424.4, back: 83.8, wall: 95.6, piers: 98.1 };
/** the covered corridor's range: rooms, then the veranda to the line of its posts */
const COR = { x0: 447.3, x1: 487.8, z0: 70.6, wall: 77.5, posts: 79.6, z1: 79.9 };
const STONE = '#ffffff', SLAB = '#8f897d', SLAB2 = '#7f796e';

const geoSpec: Spec = {
  name: 'Department of Geography and Resource Development', axis: [1, 0], origin: GO, storey: 3.4, style: PLAIN, roofColor: TILE, fascia: FASCIA, pitch: 0.45, plinth: RED_BASE,
  // the front range, the corridor range, the blocks round the back court, the lecturers' office
  replaces: [[420, 91], [467, 75], [427, 80], [408, 77], [417, 68], [438, 60], [494, 70]],
  onGround: true,
  blocks: [],
  keep: [[384 - GO[0], 500 - GO[0], 40 - GO[1], 113.2 - GO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(GO), st: Part[] = [], T = gh(417, 90);
    const M = (x: number, z: number): [number, number] => [x - GO[0], z - GO[1]];
    k.roof.c = new THREE.Color(TILE);

    // ---------- the front range ----------
    // the red plinth where the terrace ends behind the range (the back court is at the lawn's level)
    b.c.push([b.B(FRONT.x0 - 0.05, FRONT.x1 + 0.05, -0.3, T + 0.85, ENT.back - 0.05, FRONT.back + 0.3), RED_BASE]);
    const wing = (x0: number, x1: number, face: number, eave: number, pat: { front?: string; back?: string; end?: string; endAt?: 'x0' | 'x1' }) => {
      const r: R4 = [x0, x1, FRONT.back, face];
      b.c.push([b.B(x0, x1, T - 0.3, T + eave, FRONT.back, face), WALL]);
      b.c.push([b.B(x0 - 0.04, x1 + 0.04, T - 0.3, T + 0.85, FRONT.back - 0.04, face + 0.04), RED_BASE]);
      const F = facesOf(r);
      if (pat.front) openings(b, F.z1, pat.front, T);
      if (pat.back) openings(b, F.z0, pat.back, T);
      if (pat.end && pat.endAt) openings(b, F[pat.endAt], pat.end, T);
      // run-off stains under the eave
      for (let i = 0; i < Math.round((x1 - x0) / 3); i++) {
        const f = hash(x0 + i * 3.1, face), p = x0 + (x1 - x0) * ((i + f) / Math.round((x1 - x0) / 3));
        b.c.push([b.B(p, p + 0.12 + f * 0.25, T + eave - 1.2 - f, T + eave - 0.05, face - 0.02, face + 0.015), '#d8d2c4']);
      }
    };
    const WE = 3.5, EE = 4.5, over = 0.9;
    // the west wing: its veranda at the west end (pair 2), its closed face toward the entrance
    const VER = { x0: FRONT.x0, x1: 400.2, wall: 94.4 };
    wing(VER.x1, ENT.x0, FRONT.face, WE, { front: 'WA-W', back: 'W-WW-W' });
    b.c.push([b.B(VER.x0, VER.x1, T - 0.3, T + WE, FRONT.back, VER.wall), WALL]);
    b.c.push([b.B(VER.x0 - 0.04, VER.x1, T - 0.3, T + 0.85, FRONT.back - 0.04, VER.wall + 0.04), RED_BASE]);
    openings(b, facesOf([VER.x0, VER.x1, FRONT.back, VER.wall]).x0, 'W-W-W', T);
    openings(b, facesOf([VER.x0, VER.x1, FRONT.back, VER.wall]).z0, 'W-W', T);
    // the veranda: dark doorways in its back wall between the piers, its floor, the piers on red feet, a ceiling
    for (const x of [392.1, 395.4, 398.7]) b.door.push(b.plane(true, VER.wall + 0.04, 1, x, 1.6, T, T + 2.5));
    b.c.push([b.B(VER.x0, VER.x1, T - 0.3, T + 0.12, VER.wall, FRONT.face), '#c9c0b0']);
    for (const x of [VER.x0 + 0.3, 393.75, 397.05, VER.x1 - 0.1]) {
      b.c.push([b.B(x - 0.3, x + 0.3, T, T + WE, FRONT.face - 0.6, FRONT.face), WALL], [b.B(x - 0.33, x + 0.33, T, T + 0.75, FRONT.face - 0.63, FRONT.face + 0.03), RED_BASE]);
      SOLIDS.add(x, FRONT.face - 0.3, 0.4);
    }
    b.c.push([b.B(VER.x0, VER.x1, T + WE - 0.35, T + WE, FRONT.face - 0.6, FRONT.face), WALL]);
    b.c.push([b.B(VER.x0, VER.x1, T + WE - 0.42, T + WE - 0.35, VER.wall, FRONT.face), SOFF]);
    wallSolids(VER.x0, VER.wall, VER.x1, VER.wall); wallSolids(VER.x0, FRONT.back, VER.x0, VER.wall);
    // the east wing to the end of the range, its open porch on the east end (seen down the corridor, pair 3)
    const EP = 449.2;
    wing(ENT.x1, EP, FRONT.face, WE, { front: 'W-WA-W-W-WA-W-W', back: 'W-W-W-WW-W-W' });
    b.c.push([b.B(EP, FRONT.x1, T - 0.3, T + 0.12, FRONT.back, FRONT.face), '#c9c0b0']);
    openings(b, facesOf([ENT.x1, EP, FRONT.back, FRONT.face]).x1, 'WDW', T);
    for (const z of [FRONT.back + 0.3, 88.4, 92.6, FRONT.face - 0.3]) {
      b.c.push([b.B(FRONT.x1 - 0.6, FRONT.x1, T, T + WE, z - 0.3, z + 0.3), WALL], [b.B(FRONT.x1 - 0.63, FRONT.x1 + 0.03, T, T + 0.75, z - 0.33, z + 0.33), RED_BASE]);
      SOLIDS.add(FRONT.x1 - 0.3, z, 0.4);
    }
    b.c.push([b.B(EP, FRONT.x1, T + WE - 0.42, T + WE - 0.35, FRONT.back, FRONT.face), SOFF]);
    b.c.push([b.B(FRONT.x1 - 0.6, FRONT.x1, T + WE - 0.35, T + WE, FRONT.back, FRONT.face), WALL]);
    wallSolids(ENT.x1, FRONT.back, EP, FRONT.back); wallSolids(ENT.x1, FRONT.face, EP, FRONT.face); wallSolids(EP, FRONT.back, EP, FRONT.face);
    wallSolids(VER.x1, FRONT.face, ENT.x0, FRONT.face); wallSolids(VER.x0, FRONT.back, ENT.x0, FRONT.back);
    // the wings' roofs, hipped at both ends: the inner hips meet the entrance block's taller roof in a valley (their eaves
    // end inside the porch's side walls, so nothing shows in the porch)
    const rz0 = FRONT.back - over, rz1 = FRONT.face + over, re = T + WE - over * 0.42 * 0.5;
    hipRoof(k, M, FRONT.x0 - over, ENT.x0 + 0.4, rz0, rz1, re, 0.42, 'x', [HIP, HIP], b.c, FASCIA);
    hipRoof(k, M, ENT.x1 - 0.4, FRONT.x1 + over, rz0, rz1, re, 0.42, 'x', [HIP, HIP], b.c, FASCIA);
    for (const [a, c] of [[FRONT.x0 - over, ENT.x0], [ENT.x1, FRONT.x1 + over]]) b.c.push([b.B(a, c, re - 0.06, re, rz0, rz1), SOFF]);

    // ---------- the entrance block ----------
    b.c.push([b.B(ENT.x0, ENT.x1, T - 0.3, T + EE, ENT.back, ENT.wall), WALL]);
    b.c.push([b.B(ENT.x0 - 0.04, ENT.x1 + 0.04, T - 0.3, T + 0.85, ENT.back - 0.04, ENT.wall + 0.04), RED_BASE]);
    // the porch: its floor a step up from the apron, the side walls returned to the piers, the four piers, the band over
    // them carrying the name, the ceiling
    b.c.push([b.B(ENT.x0, ENT.x1, T - 0.3, T + 0.15, ENT.wall, ENT.piers), '#b9b1a3']);
    for (const [a, c] of [[ENT.x0, ENT.x0 + 0.5], [ENT.x1 - 0.5, ENT.x1]]) b.c.push([b.B(a, c, T, T + EE, ENT.wall, ENT.piers), WALL]);
    const piers = [ENT.x0 + 0.25, 414.5, 419.5, ENT.x1 - 0.25];
    for (const x of piers.slice(1, 3)) { b.c.push([b.B(x - 0.32, x + 0.32, T + 0.15, T + EE - 0.9, ENT.piers - 0.64, ENT.piers), '#f6f4ee']); SOLIDS.add(x, ENT.piers - 0.32, 0.4); }
    b.c.push([b.B(ENT.x0, ENT.x1, T + EE - 0.9, T + EE, ENT.piers - 0.5, ENT.piers), '#f3f0e8']);
    b.c.push([b.B(ENT.x0 + 0.5, ENT.x1 - 0.5, T + EE - 0.97, T + EE - 0.9, ENT.wall, ENT.piers - 0.5), SOFF]);
    k.signs.push({ text: 'DEPARTMENT OF GEOGRAPHY AND RESOURCE DEVELOPMENT', x: 417 - GO[0], y: T + EE - 0.42, z: ENT.piers + 0.02 - GO[1], ry: 0, w: 9.2, colors: ['#f3f0e8', '#45403a'] });
    // the three dark bays behind: grilled windows either side of the double door behind its gate, a grilled transom over each
    const bays = [[ENT.x0 + 0.5, 414.18], [414.82, 419.18], [419.82, ENT.x1 - 0.5]];
    bays.forEach(([a, c], i) => {
      const m = (a + c) / 2, w = c - a - 0.5;
      if (i === 1) b.door.push(b.plane(true, ENT.wall + 0.04, 1, m, w, T + 0.15, T + 2.75));
      else b.win.push(b.plane(true, ENT.wall + 0.04, 1, m, w, T + 0.75, T + 2.75));
      b.grille.push(b.plane(true, ENT.wall + 0.04, 1, m, w, T + 2.9, T + EE - 1.05));
      if (i !== 1) b.c.push([b.B(m - w / 2, m + w / 2, T + 0.15, T + 0.75, ENT.wall, ENT.wall + 0.05), '#e4dfd5']);
    });
    // the dark frames of the bays (white piers between them on the back wall)
    for (const x of [414.5, 419.5]) b.c.push([b.B(x - 0.32, x + 0.32, T + 0.15, T + EE - 0.97, ENT.wall, ENT.wall + 0.08), '#f6f4ee']);
    wallSolids(ENT.x0, ENT.back, ENT.x1, ENT.back); wallSolids(ENT.x0 + 0.5, ENT.wall, ENT.x1 - 0.5, ENT.wall);
    wallSolids(ENT.x0 + 0.25, ENT.wall, ENT.x0 + 0.25, ENT.piers - 0.2); wallSolids(ENT.x1 - 0.25, ENT.wall, ENT.x1 - 0.25, ENT.piers - 0.2);
    hipRoof(k, M, ENT.x0 - 0.7, ENT.x1 + 0.7, ENT.back - 0.7, ENT.piers + 0.7, T + EE - 0.15, 0.45, 'x', [HIP, HIP], b.c, FASCIA);
    b.c.push([b.B(ENT.x0 - 0.7, ENT.x1 + 0.7, T + EE - 0.21, T + EE - 0.15, ENT.piers, ENT.piers + 0.7), SOFF]);

    // ---------- the stair, the apron, the planters and the retaining wall ----------
    const s = stairsOf().find((q) => q.alongZ && q.z0 === 410.2)!;
    // the treads: one block for each run of the same height, weathered slabs of two greys, a dark worn nosing
    let u0 = s.x1, h0 = s.at(s.x1 + 0.01);
    const tread = (z0: number, z1: number, h: number) => {
      for (let x = s.z0; x < s.z1 - 0.01; x += 1.7) {
        const x1 = Math.min(s.z1, x + 1.7), c = hash(x, z0) > 0.5 ? SLAB : SLAB2;
        b.c.push([b.B(x, x1, -0.3, h, z0, z1), c]);
      }
      b.c.push([b.B(s.z0, s.z1, h - 0.03, h + 0.005, z1 - 0.06, z1), '#5f5a52']);
    };
    for (let u = s.x1 + 0.02; u <= s.x0 + 0.02; u += 0.02) {
      const h = u >= s.x0 ? 0 : s.at(u);
      if (Math.abs(h - h0) > 1e-3 || u >= s.x0) { tread(u0, Math.min(u, s.x0), h0); u0 = u; h0 = h; }
    }
    // the apron before the porch: worn slabs at the terrace's level
    for (let x = 407.4; x < 426.6 - 0.01; x += 1.2) for (let z = ENT.piers; z < TER.z1 - 0.01; z += 1.0) {
      const v = hash(x * 1.3, z * 2.1);
      b.c.push([b.B(x + 0.02, Math.min(426.6, x + 1.2) - 0.02, T - 0.2, T + 0.03 + v * 0.015, z + 0.02, Math.min(TER.z1, z + 1.0) - 0.02), v > 0.6 ? SLAB2 : v > 0.25 ? SLAB : '#b2ab9f']);
    }
    // the planters faced in laterite stone either side of the stair, stepping down with it, shrubs and a palm in them
    for (const [a, c] of [[407.4, s.z0], [s.z1, 426.6]]) {
      for (let z = s.x1; z < s.x0 - 0.01; z += 1.4) {
        const y = s.at(Math.min(s.x0 - 0.01, z + 0.7)) + 0.7;
        st.push([b.B(a, c, -0.3, y, z, Math.min(s.x0, z + 1.4)), STONE]);
        b.c.push([b.B(a + 0.15, c - 0.15, y, y + 0.04, z + 0.1, Math.min(s.x0, z + 1.4) - 0.1), '#4e3b2a']);
      }
      wallSolids(a, s.x1, a, s.x0); wallSolids(c, s.x1, c, s.x0); wallSolids(a, s.x0, c, s.x0);
    }
    // the retaining wall along the front of the terrace and round its west end, a low coping
    for (const [a, c] of [[TER.x0 - 0.3, 407.4], [426.6, TER.x1 + 0.2]]) {
      st.push([b.B(a, c, -0.3, T + 0.45, TER.z1 - 0.1, TER.z1 + 0.35), STONE]);
      b.c.push([b.B(a, c, T + 0.45, T + 0.52, TER.z1 - 0.12, TER.z1 + 0.37), '#b9b1a2']);
      wallSolids(a, TER.z1 + 0.15, c, TER.z1 + 0.15);
    }
    st.push([b.B(TER.x0 - 0.3, TER.x0 + 0.1, -0.3, T + 0.45, TER.z0, TER.z1 + 0.35), STONE]);
    wallSolids(TER.x0 - 0.1, TER.z0, TER.x0 - 0.1, TER.z1);
    // the beds on the terrace before the wings: dark soil, shrubs and long grass behind the wall
    k.meshes.push(new THREE.Mesh(drapeAt(GO, TER.x0, TER.x1, FRONT.face + 0.1, TER.z1 - 0.1, 0.5, 0.03, (x, z) => {
      if (x > 407.2 && x < 426.8) return null;
      const n = vnoise(x * 0.5, z * 0.5); return [0.33 + n * 0.08, 0.27 + n * 0.06, 0.18];
    }), groundCover()));
    for (let x = TER.x0 + 0.8; x < TER.x1 - 0.5; x += 1.3) {
      if (x > 406.6 && x < 427.4) continue;
      const r = hash(x, 3.3), z = FRONT.face + 1.6 + (r - 0.5) * 1.6;
      if (r > 0.3) b.leaf.push([new THREE.IcosahedronGeometry(0.55 + r * 0.5, 1).scale(1.3, 0.85, 1).translate(x - GO[0], T + 0.4 + r * 0.3, z - GO[1]), ['#3d6a2c', '#4a7633', '#355f28'][Math.floor(r * 3)]]);
      else tuft(b, x, z, 1.1, '#6d8a3c');
    }
    // the planters' shrubs (pair 4: the big bush left of the stair), a young palm right of it
    for (const [x, z, r] of [[408.6, 102.4, 1.3], [408.9, 104.3, 1.0], [425.2, 102.2, 1.0], [425.6, 103.9, 0.8]] as [number, number, number][]) {
      b.leaf.push([new THREE.IcosahedronGeometry(r, 1).scale(1.1, 1.0, 1.1).translate(x - GO[0], s.at(z) + 0.7 + r * 0.8, z - GO[1]), '#3f6d2d']);
    }

    // ---------- the lawn, the paths, the red earth to the west ----------
    k.meshes.push(new THREE.Mesh(drapeAt(GO, 374, 458, TER.z1 + 0.4, 113.2, 0.5, 0.03, (x, z) => {
      if (x > 407.2 && x < 426.8 && z < s.x0 + 0.1) return null;
      const n = vnoise(x * 0.25, z * 0.25), m = vnoise(x * 1.3, z * 1.3);
      // under the trees to the west: red earth strewn with dry leaves (pair 2)
      const earth = Math.min(1, Math.max(0, (404 - x) / 8 + (n - 0.5) * 0.8));
      const g: [number, number, number] = [0.33 + m * 0.06, 0.5 + n * 0.08, 0.2 + m * 0.04];
      const leaf = hash(Math.floor(x * 3), Math.floor(z * 3)) > 0.55 ? 0.08 : 0;
      const r: [number, number, number] = [0.47 + m * 0.1 - leaf, 0.33 + m * 0.07 - leaf * 0.8, 0.22 + n * 0.05 - leaf * 0.6];
      return [g[0] + (r[0] - g[0]) * earth, g[1] + (r[1] - g[1]) * earth, g[2] + (r[2] - g[2]) * earth];
    }), groundCover()));
    // stepping slabs across the lawn from the avenue's footway to the foot of the stair (pair 1)
    for (let t = 0; t <= 1.001; t += 1 / 7) {
      const x = 412.4 + (414.8 - 412.4) * t, z = 113.0 + (s.x0 + 0.5 - 113.0) * t, y = gh(x, z);
      b.c.push([new THREE.BoxGeometry(0.75, 0.06, 0.5).rotateY(0.3).translate(x - GO[0], y + 0.03, z - GO[1]), '#bdb7aa']);
    }
    // the garden lamp: a black lantern on a short post
    {
      const [x, z] = [419.6, 110.6], y = gh(x, z);
      b.c.push([new THREE.CylinderGeometry(0.05, 0.07, 0.75, 8).translate(x - GO[0], y + 0.37, z - GO[1]), '#1d1d1c']);
      b.c.push([b.B(x - 0.13, x + 0.13, y + 0.75, y + 1.05, z - 0.13, z + 0.13), '#2a2a28'], [new THREE.ConeGeometry(0.2, 0.16, 4).rotateY(Math.PI / 4).translate(x - GO[0], y + 1.13, z - GO[1]), '#1d1d1c']);
      b.win.push(b.plane(true, z + 0.135, 1, x, 0.18, y + 0.78, y + 1.02));
      SOLIDS.add(x, z, 0.12);
    }
    // the bed right of the stair's foot: a low palm among shrubs (pair 1)
    for (const [x, z, r] of [[427.6, 108.0, 0.8], [429.0, 107.6, 0.7], [428.2, 109.2, 0.75], [430.1, 108.8, 0.6], [426.6, 109.4, 0.55]] as [number, number, number][]) {
      b.leaf.push([new THREE.IcosahedronGeometry(r, 1).scale(1.2, 0.8, 1.2).translate(x - GO[0], gh(x, z) + r * 0.6, z - GO[1]), ['#335f27', '#3c6b2b', '#2f5523'][Math.floor(hash(x, z) * 3)]]);
    }
    fanPalm(b, 428.4, 108.4, 1.9, 31);
    // the department's board by the avenue (pair 2): a white head, the blue panel, two posts
    {
      const [x, z] = [380.6, 110.4], y = gh(x, z), ry = -1.2, sn = Math.sin(ry), cs = Math.cos(ry);
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 0.08).translate(0, 2.55, 0), new THREE.MeshStandardMaterial({ color: '#f4f4f1', roughness: 0.5 })));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.55, 0.08).translate(0, 1.55, 0), new THREE.MeshStandardMaterial({ color: '#1f2f7a', roughness: 0.5 })));
      for (const dx of [-0.7, 0.7]) g.add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.8, 0.08).translate(dx, 1.4, -0.08), new THREE.MeshStandardMaterial({ color: '#c9ccd0', roughness: 0.6 })));
      g.position.set(x - GO[0], y, z - GO[1]); g.rotation.y = ry; g.updateMatrix();
      for (const ch of [...g.children]) { ch.applyMatrix4(g.matrix); k.meshes.push(ch as THREE.Mesh); }
      const line = (text: string, yy: number, w: number, cols: [string, string]) => k.signs.push({ text, x: x - GO[0] + sn * 0.05, y: y + yy, z: z - GO[1] + cs * 0.05, ry, w, colors: cols });
      line('DEPARTMENT OF', 2.12, 0.9, ['#1f2f7a', '#ffffff']);
      line('GEOGRAPHY', 1.95, 0.75, ['#1f2f7a', '#ffffff']);
      line('& RESOURCE', 1.79, 0.75, ['#1f2f7a', '#ffffff']);
      line('DEVELOPMENT', 1.63, 0.9, ['#1f2f7a', '#ffffff']);
      line('COLLEGE OF HUMANITIES', 1.36, 1.1, ['#1f2f7a', '#e9e3b8']);
      line('UNIVERSITY OF GHANA', 1.24, 1.0, ['#1f2f7a', '#e9e3b8']);
      line('LEGON', 1.12, 0.35, ['#1f2f7a', '#e9e3b8']);
      for (const d of [-0.7, 0.7]) SOLIDS.add(x + cs * d, z - sn * d, 0.12);
    }
    // the slim blue notice by the east planter (pair 5; its text is not legible in the photograph)
    b.c.push([b.B(427.3, 427.36, gh(427.3, 101.8), gh(427.3, 101.8) + 2.0, 101.7, 101.76), '#c9ccd0']);
    b.c.push([b.B(427.0, 427.7, gh(427.3, 101.8) + 1.0, gh(427.3, 101.8) + 2.1, 101.77, 101.83), '#2559a8']);
    SOLIDS.add(427.33, 101.73, 0.1);

    // ---------- the covered corridor (pair 3) ----------
    const cy = gh(COR.x0 + 20, COR.z0 + 4), fy = cy + 0.45, ce = fy + 3.0;
    b.c.push([b.B(COR.x0, COR.x1, cy - 0.3, ce, COR.z0, COR.wall), WALL]);
    b.c.push([b.B(COR.x0 - 0.04, COR.x1 + 0.04, cy - 0.3, fy + 0.75, COR.z0 - 0.04, COR.wall + 0.04), RED_BASE]);
    const CF = facesOf([COR.x0, COR.x1, COR.z0, COR.wall]);
    // the veranda wall: dark doors and high louvred windows in turn, a dark timber cabinet or two against it
    const n = 12, step = (COR.x1 - COR.x0) / n;
    for (let i = 0; i < n; i++) {
      const a = COR.x0 + step * (i + 0.5);
      if (i % 3 === 1) {
        b.door.push(b.plane(true, COR.wall + 0.04, 1, a, 1.0, fy, fy + 2.2));
        b.c.push([b.B(a - 0.6, a + 0.6, fy + 2.2, fy + 2.35, COR.wall, COR.wall + 0.1), '#e6e2d8']);
      } else {
        b.win.push(b.plane(true, COR.wall + 0.04, 1, a, 1.0, fy + 1.1, fy + 2.6));
        b.c.push([b.B(a - 0.58, a + 0.58, fy + 1.02, fy + 1.1, COR.wall, COR.wall + 0.12), '#e2ddd2']);
      }
      if (i % 4 === 2) { b.c.push([b.B(a + 0.9, a + 1.6, fy, fy + 1.15, COR.wall, COR.wall + 0.45), '#4b3424']); SOLIDS.add(a + 1.25, COR.wall + 0.25, 0.4); }
    }
    openings(b, CF.z0, 'W-W-W-W-W-W-W-W', fy);
    openings(b, CF.x1, 'W-W', fy);
    // the veranda's floor: buff tiles a step up from the garden; the posts; the beam and the ceiling; the eave
    for (let x = COR.x0; x < COR.x1 - 0.01; x += 0.6) for (let z = COR.wall; z < COR.z1 - 0.01; z += 0.6) {
      const v = hash(x * 3.1, z * 1.7) * 0.05;
      b.c.push([b.B(x + 0.01, Math.min(COR.x1, x + 0.6) - 0.01, cy - 0.3, fy + v * 0.1, z + 0.01, Math.min(COR.z1, z + 0.6) - 0.01), v > 0.03 ? '#cbb59f' : '#d3c0aa']);
    }
    b.c.push([b.B(COR.x0, COR.x1, cy - 0.3, fy - 0.02, COR.z1 - 0.05, COR.z1 + 0.02), '#8f3b2b']);
    for (let x = COR.x0 + 0.5; x <= COR.x1 - 0.3; x += (COR.x1 - COR.x0 - 0.8) / 12) {
      b.c.push([b.B(x - 0.2, x + 0.2, fy, ce - 0.25, COR.posts - 0.2, COR.posts + 0.2), '#f6f4ee'], [b.B(x - 0.23, x + 0.23, fy, fy + 0.55, COR.posts - 0.23, COR.posts + 0.23), '#9b3b2b']);
      SOLIDS.add(x, COR.posts, 0.3);
    }
    b.c.push([b.B(COR.x0, COR.x1, ce - 0.3, ce, COR.posts - 0.22, COR.posts + 0.22), WALL]);
    b.c.push([b.B(COR.x0, COR.x1, ce - 0.36, ce - 0.3, COR.wall, COR.z1 + 0.8), SOFF]);
    // a strip light under the ceiling
    b.c.push([b.B(COR.x0 + 8, COR.x0 + 9.2, ce - 0.42, ce - 0.36, 78.5, 78.62), '#f4f4ee']);
    wallSolids(COR.x0, COR.z0, COR.x1, COR.z0); wallSolids(COR.x0, COR.wall, COR.x1, COR.wall); wallSolids(COR.x0, COR.z0, COR.x0, COR.wall); wallSolids(COR.x1, COR.z0, COR.x1, COR.wall);
    hipRoof(k, M, COR.x0 - 0.8, COR.x1 + 0.8, COR.z0 - 0.8, COR.z1 + 0.8, ce, 0.42, 'x', [HIP, HIP], b.c, FASCIA);
    // the garden before it: rough grass, bare patches, the low laterite edge along the veranda and across the garden,
    // the worn path cutting across it, young palms and cycads (pair 3)
    k.meshes.push(new THREE.Mesh(drapeAt(GO, 452, 489.2, COR.z1 + 0.1, 112.8, 0.5, 0.03, (x, z) => {
      if (x < 457.6 && z < TER.z1 + 0.5) return null;
      const n = vnoise(x * 0.35, z * 0.35), m = vnoise(x * 1.7, z * 1.7);
      const path = Math.abs((z - 81) - (x - 452) * 0.62) < 0.6 && z < 100;
      if (path || n > 0.68) return [0.56 + m * 0.08, 0.4 + m * 0.06, 0.28];
      return [0.36 + m * 0.07, 0.48 + n * 0.1, 0.2 + m * 0.05];
    }), groundCover()));
    for (const [a, c, z] of [[COR.x0 + 3, COR.x1, 87.6], [458, 486, 95.4]] as [number, number, number][]) {
      const y = gh((a + c) / 2, z);
      st.push([b.B(a, c, y - 0.2, y + 0.4, z - 0.15, z + 0.15), STONE]);
    }
    for (const [x, z, h, sd] of [[463, 84.6, 1.4, 1], [477, 90.5, 1.2, 2], [470, 99, 1.6, 3]] as [number, number, number, number][]) fanPalm(b, x, z, h, sd * 17);

    // ---------- the department's other ranges, one storey ----------
    // (the lecturers' office's mapped outline reaches into the lane on its north: its wall stands at the lane's edge)
    const back: [R4, Record<string, string>][] = [
      [[419.1, 435.3, 76.4, 83.6], { z0: 'W-W-W-W-W' }],
      [[403.9, 412.4, 73.0, 80.5], { x0: 'W-W-W', z0: 'W-W' }],
      [[414.8, 420.0, 60.2, 76.1], { x0: 'W-W-W-W-W', x1: 'W-W-W-W-W' }],
      [[432.6, 443.3, 42.2, 75.8], { x0: 'W-WA-W-W-W-W-W-W', x1: 'W-W-W-W-WA-W-W', z0: 'W-W' }],
      [[489.7, 499.2, 55.2, 89.8], { x0: 'W-WA-W-D-W-W-W-W-WA-W', x1: 'W-W-W-W-W-W-W-W-W', z1: 'WDW' }],
    ];
    for (const [r, faces] of back) lowWing(k, b, r, { eave: 3.4, pitch: 0.42, faces, y: gh((r[0] + r[1]) / 2, (r[2] + r[3]) / 2) });

    // ---------- trees: the big shade trees round the building ----------
    for (const [x, z, h, sp] of [[368, 104, 10, 15], [395.5, 109.5, 8.5, 12], [455, 107.5, 9, 13], [459, 90.5, 10.5, 14], [425, 70, 11, 13], [400, 66, 10, 13], [484, 101, 8, 12]] as [number, number, number, number][]) {
      broadleaf(k, b.leaf, x, z, { h, spread: sp, seed: x * 2 + z, origin: GO });
    }
    stoneMeshOf(k, st, [1.0, 0.8, 0.64]);
    b.finish(k, 0.35);
  },
};

export const geographySite = createSite('geography', [geoSpec]);
