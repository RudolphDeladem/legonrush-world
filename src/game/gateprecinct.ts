// The main gate precinct (the owner's main entrance brief, pairs 4-17 and 25; numbers in entrance.ts):
// - the gatehouse east of the La Road roundabout (Mekki Abass Circle): a low white through-building spanning north-south
//   between Danquah Avenue's two carriageways, its central portal three tall openings divided by two slender columns
//   under a band of dark transom grilles, a solid pier either side with a round vent high up, a broad terracotta hipped
//   roof over deep eaves, and lower one-storey wings north and south on a red base (pairs 4, 5, 8, 17); the paved drive
//   through the portal;
// - the flag plaza east of it, between the carriageways and J.J. Rawlings Avenue: the long shallow fountain basin raised
//   in stone-faced walls, jets, a slab walk with grass seams on the axis, stepped stone-faced planters with clipped
//   shrubs and flowering beds, two lines of flagpoles, fan palms (pairs 7, 9, 13);
// - the black University of Ghana signs at the plaza's east corners: a polished black tile wall on a two-step black
//   base under a deep terracotta tiled canopy on pale end posts, raised gold letters (pair 6 and the close photograph);
// - the low one-storey wings north and south of the carriageways: white walls on a red base, sparse dark windows,
//   doors, AC units, hipped tiled roofs; the brick-paved footway along the north wing with the blue chain bollards, a
//   concrete drain at the road edge (pairs 10, 14, 15, 16), the bollards round the bend at the roundabout (pair 25);
// - the long low wing by the southern service edge and its 50 km/h sign, rough grass and red soil (pairs 11, 12);
// - big rough-barked trees whose crowns close over the gate-side streets, palms at the gate.
import * as THREE from 'three';
import { createSite, type Kit, type Spec, type Style } from './blocks';
import { render } from './blocks';
import { EN } from './entrance';
import { Bag, tuft, chainBollards, fanPalm, flagpole, gh, hash, lowWing, openings, vnoise, wallSolids, facesOf, FASCIA, RED_BASE, SOFF, TILE, WALL } from './enkit';
import { hipRoof } from './waccbip';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { letters } from './letters';
import { PASSAGES, SOLIDS } from './solids';
import { stoneMeshOf } from './nsiaroad';
import { merge, type Part } from './modelkit';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, WALL) };

const GO: [number, number] = [690, 128];

/** brick paving (stretcher bond in two tones) as a ground drape colour */
const brick = (x: number, z: number, along: 'x' | 'z' = 'x') => {
  const [u, v] = along === 'x' ? [x, z] : [z, x];
  const row = Math.floor(v / 0.11), col = Math.floor((u + (row % 2) * 0.11) / 0.22);
  const t = hash(col, row), n = vnoise(x * 0.3, z * 0.3);
  const base = [0.62 + t * 0.08 - n * 0.06, 0.36 + t * 0.05 - n * 0.04, 0.27 + t * 0.03];
  return base as [number, number, number];
};
/** worn asphalt */
const asphalt = (x: number, z: number): [number, number, number] => { const n = vnoise(x * 0.25, z * 0.25), m = hash(Math.floor(x * 2), Math.floor(z * 2)); const v = 0.3 + n * 0.06 + (m > 0.93 ? 0.05 : 0); return [v, v * 0.98, v * 0.95]; };
/** pale concrete slabs with grass seams */
const slabs = (x: number, z: number): [number, number, number] => {
  const sx = ((x % 1.2) + 1.2) % 1.2, sz = ((z % 1.2) + 1.2) % 1.2;
  if (sx < 0.14 || sz < 0.14) return [0.36, 0.5, 0.24];
  const t = hash(Math.floor(x / 1.2), Math.floor(z / 1.2)) * 0.06;
  return [0.74 - t, 0.68 - t, 0.58 - t];
};
/** rough grass with red soil patches */
const rough = (x: number, z: number): [number, number, number] => {
  const n = vnoise(x * 0.18, z * 0.18), m = vnoise(x * 0.9 + 3, z * 0.9);
  if (n > 0.68) return [0.6, 0.38, 0.24];
  return [0.32 + m * 0.12, 0.44 + m * 0.08, 0.2];
};

const gateSpec: Spec = {
  name: 'Legon main gate', axis: [1, 0], origin: GO, storey: 3.4, style: PLAIN, roofColor: TILE, fascia: FASCIA, pitch: 0.42, plinth: RED_BASE,
  replaces: [[659.7, 128.0], [662.2, 102.3], [661.0, 153.7]],
  onGround: true,
  blocks: [],
  keep: [[635 - GO[0], 760 - GO[0], 90 - GO[1], 165 - GO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(GO), G = EN.gate;
    const zm = G.mid, p0 = zm - G.portal / 2, p1 = zm + G.portal / 2, n0 = p0 - G.pier, n1 = p1 + G.pier;
    // ---------- the gatehouse ----------
    // the piers either side of the portal: white on a red base, a round vent high on each face
    for (const [z0, z1] of [[n0, p0], [p1, n1]]) {
      b.c.push([b.B(G.x0, G.x1, 0, G.eave, z0, z1), WALL]);
      b.c.push([b.B(G.x0 - 0.04, G.x1 + 0.04, -0.2, 0.75, z0 - 0.04, z1 + 0.04), RED_BASE]);
      const zc = (z0 + z1) / 2;
      for (const [x, s] of [[G.x0, -1], [G.x1, 1]] as [number, number][]) {
        const ring = new THREE.TorusGeometry(0.52, 0.09, 8, 24).rotateY(Math.PI / 2).translate(x + s * 0.03 - GO[0], G.eave - 1.25, zc - GO[1]);
        b.c.push([ring, '#e8e4da']);
        b.grille.push(new THREE.CircleGeometry(0.47, 20).rotateY(s > 0 ? Math.PI / 2 : -Math.PI / 2).translate(x + s * 0.01 - GO[0], G.eave - 1.25, zc - GO[1]));
        // a tall narrow window low on the pier's face beside the portal
        b.win.push(b.plane(false, x + s * 0.02, s, zc + (z0 < zm ? -0.6 : 0.6), 0.7, 1.0, 2.6));
      }
      wallSolids(G.x0, z0, G.x1, z0); wallSolids(G.x0, z1, G.x1, z1);
    }
    // the portal: the beam over it carrying the transom band, its ceiling, the two slender columns, pilasters at the ends
    b.c.push([b.B(G.x0, G.x1, G.clear, G.eave, p0, p1), WALL]);
    b.c.push([b.B(G.x0 + 0.2, G.x1 - 0.2, G.clear - 0.05, G.clear, p0, p1), SOFF]);
    for (const x of [G.x0, G.x1]) {
      const s = x === G.x0 ? -1 : 1;
      // the transom band: six dark grilled panels between white mullions, set back in the beam
      for (let i = 0; i < 6; i++) {
        const za = p0 + 0.3 + ((G.portal - 0.6) * i) / 6, zb = p0 + 0.3 + ((G.portal - 0.6) * (i + 1)) / 6;
        b.grille.push(b.plane(false, x + s * 0.02, s, (za + zb) / 2, zb - za - 0.18, G.clear + 0.25, G.eave - 0.55));
      }
      b.c.push([b.B(x - 0.05, x + 0.05, G.clear, G.clear + 0.22, p0, p1), '#e3dfd5']);
    }
    for (const zc of [p0 + G.portal / 3, p0 + (2 * G.portal) / 3]) {
      for (const x of [G.x0 + 0.5, G.x1 - 0.5]) {
        b.c.push([new THREE.CylinderGeometry(0.22, 0.25, G.clear, 12).translate(x - GO[0], G.clear / 2, zc - GO[1]), WALL]);
        b.c.push([b.B(x - 0.32, x + 0.32, -0.1, 0.35, zc - 0.32, zc + 0.32), RED_BASE]);
        SOLIDS.add(x, zc, 0.3);
      }
    }
    // the portal floor: a raised threshold strip at each end, the drive through it in asphalt (below)
    for (const x of [G.x0 + 0.1, G.x1 - 0.1]) b.c.push([b.B(x - 0.12, x + 0.12, 0, 0.04, p0, p1), '#cfc8ba']);
    PASSAGES.push([G.x0 - 1.5, G.x1 + 1.5, p0 + 0.35, p1 - 0.35]);
    // the low wings of the gatehouse itself, beyond the piers
    lowWing(k, b, [G.x0 + 0.4, G.x1 - 0.4, G.z0, n0], { eave: G.wingEave, along: 'z', faces: { x0: 'W', x1: 'W', z0: 'wDw' }, ends: [0, 99] });
    lowWing(k, b, [G.x0 + 0.4, G.x1 - 0.4, n1, G.z1], { eave: G.wingEave, along: 'z', faces: { x0: 'W', x1: 'W', z1: 'wDw' }, ends: [99, 0] });
    // the broad roof over the piers and the portal: hipped, its ridge along z, deep eaves on a dark fascia
    k.roof.c = new THREE.Color(TILE);
    const o = G.over;
    hipRoof(k, (x, z) => [x - GO[0], z - GO[1]], G.x0 - o, G.x1 + o, n0 - o, n1 + o, G.eave - o * G.pitch * 0.4, G.pitch, 'z', [{ gw: 0, tri: false }, { gw: 0, tri: false }], b.c, FASCIA);
    b.c.push([b.B(G.x0 - o, G.x1 + o, G.eave - o * G.pitch * 0.4 - 0.07, G.eave - o * G.pitch * 0.4, n0 - o, n1 + o), SOFF]);
    // ---------- the drive through the portal, the forecourt west of the gate ----------
    k.meshes.push(new THREE.Mesh(drapeAt(GO, 646, 692, p0 + 0.6, p1 - 0.6, 0.5, 0.03, (x, z) => asphalt(x, z)), groundCover()));
    // ---------- the flag plaza ----------
    const [px0, px1, pz0, pz1] = EN.plaza, [bx0, bx1, bz0, bz1] = EN.basin;
    // the ground: slab walks with grass seams on the axis and round the basin, lawns with flower beds elsewhere
    k.meshes.push(new THREE.Mesh(drapeAt(GO, px0, px1, pz0, pz1, 0.3, 0.025, (x, z) => {
      if (x > bx0 - 0.4 && x < bx1 + 0.4 && z > bz0 - 0.4 && z < bz1 + 0.4) return null;
      const walk = (Math.abs(z - zm) < 1.8 && (x < bx0 || x > bx1)) || (x > bx0 - 2.6 && x < bx1 + 2.6 && z > bz0 - 2.6 && z < bz1 + 2.6) || Math.abs(x - (px0 + 3)) < 1.6;
      if (walk) return slabs(x, z);
      const n = vnoise(x * 0.5, z * 0.5), m = hash(Math.floor(x / 0.6), Math.floor(z / 0.6));
      // flowering beds: small scattered dots of colour in the darker planted patches, not blotches
      if (n > 0.66 && m > 0.82 && Math.abs(z - zm) > 6) return [[0.62, 0.22, 0.22], [0.7, 0.58, 0.2], [0.62, 0.38, 0.48]][Math.floor(hash(Math.floor(x * 3), Math.floor(z * 3)) * 3)] as [number, number, number];
      return n > 0.66 ? [0.24, 0.4, 0.17] : [0.3 + n * 0.08, 0.47 + n * 0.06, 0.2];
    }), groundCover()));
    // the basin: raised in stone-faced walls with a pale coping, water, the jets along its middle
    const bw = 0.45, bh = 0.55, stone: Part[] = [];
    for (const r of [[bx0, bx1, bz0 - bw, bz0], [bx0, bx1, bz1, bz1 + bw], [bx0 - bw, bx0, bz0 - bw, bz1 + bw], [bx1, bx1 + bw, bz0 - bw, bz1 + bw]]) {
      stone.push([b.B(r[0], r[1], 0, bh, r[2], r[3]), '#fff']);
      b.c.push([b.B(r[0] - 0.06, r[1] + 0.06, bh, bh + 0.08, r[2] - 0.06, r[3] + 0.06), '#d9d2c3']);
    }
    b.c.push([b.B(bx0, bx1, 0, 0.12, bz0, bz1), '#9aa4a2']);
    b.water.push(new THREE.PlaneGeometry(bx1 - bx0, bz1 - bz0).rotateX(-Math.PI / 2).translate((bx0 + bx1) / 2 - GO[0], bh - 0.12, (bz0 + bz1) / 2 - GO[1]));
    // a stepped inner tier at the east end (the photos' tiered fountain), the jets
    b.c.push([b.B(bx1 - 6, bx1, 0, bh + 0.25, bz0 + 1.2, bz1 - 1.2), '#cfc7b8']);
    b.water.push(new THREE.PlaneGeometry(5.4, bz1 - bz0 - 3.0).rotateX(-Math.PI / 2).translate(bx1 - 3 - GO[0], bh + 0.27, (bz0 + bz1) / 2 - GO[1]));
    for (let i = 0; i < 9; i++) {
      const x = bx0 + 2 + i * ((bx1 - bx0 - 10) / 8), h = 1.0 + (i % 3) * 0.35;
      b.spray.push(new THREE.CylinderGeometry(0.04, 0.16, h, 8, 1, true).translate(x - GO[0], bh - 0.1 + h / 2, zm - GO[1]));
      b.spray.push(new THREE.SphereGeometry(0.22, 8, 5).scale(1, 0.5, 1).translate(x - GO[0], bh - 0.1 + h, zm - GO[1]));
    }
    for (let i = 0; i < 24; i++) SOLIDS.add(bx0 + ((bx1 - bx0) * i) / 23, bz0 - 0.2, 0.35), SOLIDS.add(bx0 + ((bx1 - bx0) * i) / 23, bz1 + 0.2, 0.35);
    for (let z = bz0; z <= bz1; z += 0.6) SOLIDS.add(bx0 - 0.2, z, 0.35), SOLIDS.add(bx1 + 0.2, z, 0.35);
    // stepped stone-faced planters along the plaza's long sides, clipped shrubs and flowering beds in them
    for (const [z0, z1] of [[pz0 + 0.6, pz0 + 3.0], [pz1 - 3.0, pz1 - 0.6]]) {
      for (let x = px0 + 6; x < px1 - 5; x += 9.5) {
        // (the plaza's east end meets the ring road and Danquah Avenue's south carriageway: the planters stop short of
        // them rather than stand on the road; the owner's 10-pair brief, pair 9)
        if (z0 > 130 && x > 735) continue;
        const r: [number, number, number, number] = [x, Math.min(x + 7.5, 749.6), z0, z1];
        for (const [lift, ins] of [[0.45, 0], [0.8, 0.5]]) {
          stone.push([b.B(r[0] + ins, r[1] - ins, 0, lift, r[2] + ins, r[3] - ins), '#fff']);
          b.c.push([b.B(r[0] + ins - 0.04, r[1] - ins + 0.04, lift, lift + 0.06, r[2] + ins - 0.04, r[3] - ins + 0.04), '#d9d2c3']);
        }
        for (let i = 0, n = Math.round((r[1] - r[0] - 2) / 1.35) + 1; i < n; i++) {
          const sx = r[0] + 1 + i * 1.35, sz = (r[2] + r[3]) / 2 + (hash(sx, z0) - 0.5) * 0.6, s = 0.38 + hash(sx, i) * 0.2;
          b.leaf.push([new THREE.IcosahedronGeometry(s, 1).scale(1.2, 0.85, 1.1).translate(sx - GO[0], 0.86 + s * 0.6, sz - GO[1]), ['#3f6d2c', '#527f33', '#6a8c3a', '#c64a3a', '#e0b43a'][(i + Math.round(x)) % 5]]);
        }
        wallSolids(r[0], (r[2] + r[3]) / 2, r[1], (r[2] + r[3]) / 2, 1.1);
      }
    }
    stoneMeshOf(k, stone);
    // the flag lines along both long sides (several nations' colours; Ghana's at the middle), fan palms between
    const FLAGS = [['#ce1126', '#fcd116', '#006b3f'], ['#009a44', '#ffffff', '#009a44'], ['#1e5aa8', '#ffffff', '#1e5aa8'], ['#e8112d', '#ffffff', '#007a3d'],
      ['#ffcd00', '#0f47af', '#ffcd00'], ['#007a5e', '#ce1126', '#fcd116'], ['#ce1126', '#fcd116', '#006b3f'], ['#006233', '#ffffff', '#d21034'], ['#0c4076', '#ffffff', '#c8102e']];
    for (const z of [pz0 + 4.0, pz1 - 4.0]) {
      for (let i = 0; i < EN.flags; i++) {
        const x = px0 + 8 + i * ((px1 - px0 - 14) / (EN.flags - 1));
        flagpole(b, x, z, 8.5 + (i % 2) * 0.4, FLAGS[i % FLAGS.length], i % 3 === 1, z < zm ? -0.4 : 0.4);
      }
    }
    for (const [x, z, h] of [[px0 + 2.2, pz0 + 1.5, 9.5], [px0 + 2.2, pz1 - 1.5, 10.2], [px1 - 4, pz0 + 1.8, 8.8], [px1 - 4, pz1 - 4.2, 9.6], [G.x0 - 3.5, n0 - 1.2, 11], [G.x0 - 3.5, n1 + 1.2, 10.4], [G.x1 + 3.8, n0 - 1.4, 10.8], [G.x1 + 3.8, n1 + 1.4, 11.4]] as [number, number, number][]) fanPalm(b, x, z, h, x + z);
    // ---------- the black University of Ghana signs ----------
    for (const [sx, sz, yaw] of EN.signs) {
      const g = new THREE.Group();
      const parts: Part[] = [];
      const BLACK = '#121314', L = 6.2, H = 2.3;
      // the two-step base, the wall, the pale end posts carrying the canopy
      parts.push([new THREE.BoxGeometry(L + 1.4, 0.4, 2.2).translate(0, 0.2, 0), BLACK], [new THREE.BoxGeometry(L + 0.7, 0.4, 1.5).translate(0, 0.6, 0), '#1a1b1d']);
      parts.push([new THREE.BoxGeometry(L, H, 0.7).translate(0, 0.8 + H / 2, 0), BLACK]);
      // tile joints on the wall (a slightly lighter grid)
      for (let y = 1.25; y < 0.8 + H; y += 0.45) parts.push([new THREE.BoxGeometry(L + 0.01, 0.015, 0.71).translate(0, y, 0), '#2a2c2f']);
      for (let x = -L / 2 + 0.6; x < L / 2; x += 0.6) parts.push([new THREE.BoxGeometry(0.015, H, 0.71).translate(x, 0.8 + H / 2, 0), '#2a2c2f']);
      for (const s of [-1, 1]) parts.push([new THREE.BoxGeometry(0.35, H + 1.0, 0.35).translate(s * (L / 2 + 0.25), 0.8 + (H + 1.0) / 2, 0), '#e9e4d8']);
      const cm = new THREE.Mesh(merge(parts), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0.15 }));
      cm.castShadow = true; cm.receiveShadow = true; g.add(cm);
      // the canopy: a deep shallow-pitched tiled roof over the wall, a dark fascia, a pale soffit
      const top = 0.8 + H + 1.0, can: Part[] = [];
      for (const s of [-1, 1]) {
        const slope = new THREE.BoxGeometry(L + 1.6, 0.12, 1.6).rotateX(s * 0.32).translate(0, top + 0.35, s * 0.72);
        can.push([slope, TILE]);
        can.push([new THREE.BoxGeometry(L + 1.65, 0.28, 0.08).translate(0, top + 0.02, s * 1.48), '#2f2723']);
      }
      can.push([new THREE.BoxGeometry(L + 1.5, 0.06, 2.9).translate(0, top - 0.08, 0), '#e8e2d6']);
      // the tile ridges on the slopes
      for (let x = -L / 2 - 0.7; x <= L / 2 + 0.7; x += 0.28) for (const s of [-1, 1]) can.push([new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6).rotateX(Math.PI / 2 + s * 0.32).translate(x, top + 0.43, s * 0.72), '#a24c33']);
      const canopy = new THREE.Mesh(merge(can), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 })); canopy.castShadow = true; g.add(canopy);
      g.position.set(sx - GO[0], gh(sx, sz), sz - GO[1]); g.rotation.y = yaw;
      // gold raised letters, three lines, on both faces
      const lk = { ...k, plain: [] as Part[] } as Kit;
      for (const face of [0, Math.PI]) {
        const f = face === 0 ? 1 : -1;
        letters(lk, 'UNIVERSITY', 0, 2.55, f * 0.36, face, 0.42, 0.06, '#c9a54a', { wide: 0.8, gap: 0.28, stroke: 0.2 });
        letters(lk, 'OF', 0, 1.95, f * 0.36, face, 0.42, 0.06, '#c9a54a', { wide: 0.8, gap: 0.28, stroke: 0.2 });
        letters(lk, 'GHANA', 0, 1.35, f * 0.36, face, 0.42, 0.06, '#c9a54a', { wide: 0.8, gap: 0.28, stroke: 0.2 });
      }
      const lm = new THREE.Mesh(merge(lk.plain), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0.8 }));
      g.add(lm);
      g.updateMatrix(); for (const ch of [...g.children]) { ch.applyMatrix4(g.matrix); k.meshes.push(ch as THREE.Mesh); }
      const ca = Math.cos(yaw), sa = Math.sin(yaw);
      for (let t = -L / 2 - 0.6; t <= L / 2 + 0.6; t += 0.8) SOLIDS.add(sx + ca * t, sz - sa * t, 1.1);
    }
    // ---------- the wings north and south of the carriageways ----------
    const [NW, SW] = EN.wings;
    lowWing(k, b, NW, { eave: EN.wingEave, faces: { z1: 'WA-D-WWA-W-DW-WA-W-D-WAW', z0: 'W-W-WA-W-W-W-W-W', x0: 'WD', x1: 'W-W' } });
    lowWing(k, b, SW, { eave: EN.wingEave, faces: { z0: 'WAW-D-W-WA-W-DW-W-WA-W', z1: 'W-W-W-W-W-W-W-W', x0: 'W-W', x1: 'DW' } });
    // the brick-paved footway along the north wing's street front, the drain at the road edge, the blue chain bollards
    k.meshes.push(new THREE.Mesh(drapeAt(GO, NW[0] - 4, NW[1] + 3, NW[3] + 0.2, 109.2, 0.2, 0.06, (x, z) => brick(x, z)), groundCover()));
    b.c.push([b.B(NW[0] - 4, NW[1] + 3, 0, 0.12, 109.2, 109.45), '#c9c3b6']);
    b.c.push([b.B(NW[0] - 4, NW[1] + 3, -0.05, 0.02, 109.45, 109.8), '#4a4744']);
    for (const run of EN.bollards) chainBollards(b, run[0], run[1]);
    // the footway along the south wing
    k.meshes.push(new THREE.Mesh(drapeAt(GO, SW[0] - 3, SW[1] + 3, 147.3, SW[2] - 0.2, 0.2, 0.06, (x, z) => brick(x, z)), groundCover()));
    b.c.push([b.B(SW[0] - 3, SW[1] + 3, 0, 0.12, 147.1, 147.3), '#c9c3b6']);
    // ---------- trees: big rough-barked crowns over the gate-side streets; a few at the roundabout's bend ----------
    for (const [x, z, h, s] of [[648, 104.5, 7.5, 12], [668, 104.8, 8, 13], [690, 104.5, 7, 11], [700, 99, 8.5, 14], [636, 150.5, 7, 12], [690, 151, 7.5, 13],
      [705, 158, 8, 12], [644, 88, 8, 13], [716, 92, 9, 15]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x * 7 + z, origin: GO });
    b.finish(k);
  },
};

/** the long low wing by the southern service edge (pairs 11, 12): one storey, white on a red base, its long east wall
 *  with a shallow tiled eave, dark windows and the shaded service doorway near the middle; rough grass, red soil, the
 *  worn concrete block and the gravel mound before it; the 50 km/h sign at the road edge */
const SO: [number, number] = [700, 235];
const serviceSpec: Spec = {
  name: 'Gate service wing', axis: [1, 0], origin: SO, storey: 3.4, style: PLAIN, roofColor: TILE, fascia: FASCIA, pitch: 0.45, plinth: RED_BASE,
  replaces: [[680.6, 234.3]],
  onGround: true,
  blocks: [],
  keep: [[672 - SO[0], 760 - SO[0], 195 - SO[1], 285 - SO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(SO), r: [number, number, number, number] = [675.0, 686.3, 196.0, 272.8];
    lowWing(k, b, r, { eave: 3.3, faces: { x1: 'W-WA-W-W-WD-W-W-WA-W-W-W-W-W-W-WA-W-W', x0: 'W-W-W-W-W-W-W-W-W' } });
    // the recessed shaded gateway in the east wall near the middle
    const F = facesOf(r).x1, zc = 228;
    b.grille.push(b.plane(false, r[1] + 0.03, 1, zc, 2.6, 0, 2.6));
    b.c.push([b.B(r[1], r[1] + 0.25, 2.6, 3.0, zc - 1.5, zc + 1.5), '#e3dfd5']);
    void F;
    // the ground before it: rough grass, red soil where it is worn, the concrete block and gravel mound
    k.meshes.push(new THREE.Mesh(drapeAt(SO, r[1] + 0.3, 752, 200, 282, 0.6, 0.03, (x, z) => rough(x, z)), groundCover()));
    b.c.push([b.B(728, 730.4, 0, 0.45, 226, 227.1), '#9c9a93']);
    b.c.push([new THREE.SphereGeometry(1.6, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.4, 0.45, 1).translate(735 - SO[0], gh(735, 222), 222 - SO[1]), '#8f8a82']);
    SOLIDS.add(729.2, 226.5, 1.1);
    // tall grass tufts
    for (let i = 0; i < 90; i++) {
      const x = r[1] + 2 + hash(i, 3) * 60, z = 200 + hash(i, 7) * 80, h = 0.5 + hash(i, 9) * 0.6;
      tuft(b, x, z, h, ['#6b7a3a', '#7d8a44', '#5b6a33'][i % 3]);
    }
    // the speed sign: a red-ringed white disc on a grey post
    const [sx, sz] = [747.5, 262];
    b.c.push([new THREE.CylinderGeometry(0.05, 0.05, 2.6, 8).translate(sx - SO[0], 1.3, sz - SO[1]), '#9a9c9e']);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24).rotateY(-Math.PI / 2 + 0.5).translate(sx - SO[0] - 0.06, 2.3, sz - SO[1]), new THREE.MeshStandardMaterial({ map: speedTex(), roughness: 0.6, side: THREE.DoubleSide }));
    k.meshes.push(disc);
    SOLIDS.add(sx, sz, 0.12);
    // mature trees layering over the wing
    for (const [x, z, h, s] of [[694, 205, 8, 14], [700, 232, 9, 15], [693, 258, 8.5, 14], [712, 214, 7.5, 12], [720, 268, 8, 13]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x * 3 + z, origin: SO });
    b.finish(k);
  },
};

let speedT: THREE.CanvasTexture | null = null;
function speedTex() {
  if (speedT) return speedT;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(64, 64, 62, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#d0202a'; g.lineWidth = 14; g.beginPath(); g.arc(64, 64, 54, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#111'; g.font = 'bold 58px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('50', 64, 68);
  speedT = new THREE.CanvasTexture(c); speedT.colorSpace = THREE.SRGBColorSpace; return speedT;
}

export const gateSite = createSite('main-gate', [gateSpec, serviceSpec]);
// (openings is re-exported for the other entrance sites that place windows on faces of their own)
export { openings };
