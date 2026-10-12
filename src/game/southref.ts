// South of Danquah Avenue (the owner's main entrance brief; numbers in entrance.ts):
// - the College's Provost office frontage (pairs 1-3, Map A): a two-storey white central mass standing forward, its
//   recessed entrance behind four strong white piers, a row of dark upper windows, a hipped terracotta roof with a small
//   raised lantern; lower two-storey wings either side behind one-storey verandas under their own tiled porch roofs on
//   white columns, red bases; the long one-storey wings of the college running back from the forecourt on both sides;
//   the oval forecourt: the asphalt loop round a narrow oval bed of clipped yellow-green hedges and grass, low pale
//   kerbs, two conical shrubs by the entrance, parked cars; the College sign on pale supports by the forecourt; the big
//   spreading tree by the road and palms behind;
// - the School of Performing Arts beside La Road (additional image 1): low linked one-storey wings, white over a red
//   lower wall, rusty brown roofs, AC units, open tree spaces and red earth;
// - the Efua Sutherland Drama Studio (additional images 2, 3): a compact open-air theatre: the deep covered black stage
//   with its raised lip and steps, the dark back wall, the low white enclosing wall with its vertical slots round a worn
//   paved audience court open to the sky, a pale raised platform, the projecting entrance with its timber panel.
import * as THREE from 'three';
import { BUILDINGS } from './campusmap';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { EN } from './entrance';
import { Bag, FASCIA, RED_BASE, SOFF, TILE, WALL, gh, hash, lowWing, vnoise, wallSolids, type R4 } from './enkit';
import { gableTri } from './ias';
import { hipRoof } from './waccbip';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { rectsOf } from './rectilinear';
import { car } from './cc';
import { SOLIDS } from './solids';
import { fanPalm } from './enkit';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, WALL) };

// ---------- the Provost office frontage ----------
const AO: [number, number] = [372, 175];
const provostSpec: Spec = {
  name: 'College Provost office frontage', axis: [1, 0], origin: AO, storey: 3.5, style: PLAIN, roofColor: TILE, fascia: FASCIA, pitch: 0.45, plinth: RED_BASE,
  replaces: [[370, 183], [336, 181], [405, 184]],
  onGround: true,
  blocks: [],
  keep: [[326 - AO[0], 414 - AO[0], 140 - AO[1], 212 - AO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(AO), y = gh(372, 183) - 0.05, fh = 3.5, e = y + 2 * fh + 0.3;
    const CM: R4 = [360.8, 378.5, 175.4, 190.9], LW: R4 = [344.4, 360.8, 177.6, 189.2], RW: R4 = [378.4, 395.8, 177.6, 189.1];
    // the central mass: its front set back behind the four piers
    b.c.push([b.B(CM[0], CM[1], y - 0.3, e, CM[2] + 1.6, CM[3]), WALL]);
    for (const x of [CM[0] + 0.1, CM[1] - 0.1]) b.c.push([b.B(x - 0.35, x + 0.35, y - 0.3, e, CM[2], CM[2] + 1.6), WALL]);
    const piers = [364.05, 367.75, 371.55, 375.25];
    for (const x of piers) { b.c.push([b.B(x - 0.45, x + 0.45, y - 0.3, e - 0.1, CM[2], CM[2] + 0.9), '#f8f7f3']); SOLIDS.add(x, CM[2] + 0.45, 0.55); }
    b.c.push([b.B(CM[0], CM[1], y - 0.3, y + 0.55, CM[2] - 0.05, CM[3]), RED_BASE]);
    b.c.push([b.B(CM[0], CM[1], y + fh - 0.12, y + fh + 0.12, CM[2] + 1.55, CM[2] + 1.7), '#ece8de']);
    // upper windows in a row, the door with its grille, ground windows, the College sign over the door
    for (let x = 363.4; x < 378; x += 2.4) b.win.push(b.plane(true, CM[2] + 1.58, -1, x, 1.3, y + fh + 0.9, y + fh + 2.4));
    b.door.push(b.plane(true, CM[2] + 1.58, -1, 369.65, 2.4, y, y + 2.7));
    for (const x of [364.0, 375.3]) b.win.push(b.plane(true, CM[2] + 1.58, -1, x, 1.2, y + 0.9, y + 2.5));
    b.c.push([b.B(367.6, 371.7, y + 2.85, y + 3.25, CM[2] + 1.5, CM[2] + 1.58), '#1f4f9a']);
    k.signs.push({ text: 'COLLEGE OF BASIC AND APPLIED SCIENCES', x: 369.65 - AO[0], y: y + 3.05, z: CM[2] + 1.49 - AO[1], ry: Math.PI, w: 3.9, colors: ['#1f4f9a', '#ffffff'] });
    // the side wings: two storeys behind one-storey verandas under their own porch roofs on white columns
    for (const W of [LW, RW]) {
      b.c.push([b.B(W[0], W[1], y - 0.3, e - 0.4, W[2] + 2.4, W[3]), WALL]);
      b.c.push([b.B(W[0], W[1], y - 0.3, y + 0.6, W[2] + 2.35, W[3]), RED_BASE]);
      for (let x = W[0] + 1.2; x < W[1] - 0.6; x += 2.3) b.win.push(b.plane(true, W[2] + 2.38, -1, x, 1.2, y + fh + 0.9, y + fh + 2.3));
      for (let x = W[0] + 1.6; x < W[1] - 0.8; x += 3.2) b.win.push(b.plane(true, W[2] + 2.38, -1, x, 1.3, y + 0.9, y + 2.4));
      // the veranda: its floor, columns with red feet, the lean-to tiled roof
      b.c.push([b.B(W[0], W[1], y - 0.3, y + 0.15, W[2] - 0.2, W[2] + 2.4), '#d8d2c6']);
      for (let x = W[0] + 0.4; x <= W[1] - 0.3; x += (W[1] - W[0] - 0.7) / 5) {
        b.c.push([b.B(x - 0.15, x + 0.15, y, y + fh, W[2] - 0.05, W[2] + 0.25), '#f8f7f3'], [b.B(x - 0.19, x + 0.19, y, y + 0.55, W[2] - 0.09, W[2] + 0.29), RED_BASE]);
        SOLIDS.add(x, W[2] + 0.1, 0.25);
      }
      const pr = new THREE.BoxGeometry(W[1] - W[0] + 0.6, 0.1, 3.4).rotateX(0.32).translate((W[0] + W[1]) / 2 - AO[0], y + fh + 0.45, W[2] + 0.9 - AO[1]);
      b.c.push([pr, TILE]);
      for (let x = W[0] - 0.2; x < W[1] + 0.3; x += 0.3) b.c.push([new THREE.CylinderGeometry(0.045, 0.045, 3.4, 5).rotateX(Math.PI / 2 + 0.32).translate(x - AO[0], y + fh + 0.52, W[2] + 0.9 - AO[1]), '#a24c33']);
      b.c.push([b.B(W[0] - 0.3, W[1] + 0.3, y + fh - 0.12, y + fh, W[2] - 0.75, W[2] + 2.4), SOFF]);
      wallSolids(W[0], W[2] + 2.4, W[1], W[2] + 2.4);
    }
    wallSolids(CM[0], CM[2] + 1.6, CM[1], CM[2] + 1.6);
    // the roofs: the central mass's hip with its small raised lantern; the wings' hips a little lower
    k.roof.c = new THREE.Color(TILE);
    const M = (x: number, z: number): [number, number] => [x - AO[0], z - AO[1]];
    hipRoof(k, M, CM[0] - 0.8, CM[1] + 0.8, CM[2] - 0.8, CM[3] + 0.8, e - 0.2, 0.45, 'x', [{ gw: 0, tri: false }, { gw: 0, tri: false }], b.c, FASCIA);
    for (const W of [LW, RW]) hipRoof(k, M, W[0] - 0.8, W[1] + 0.8, W[2] + 1.6, W[3] + 0.8, e - 0.6, 0.45, 'x', [{ gw: 0, tri: false }, { gw: 0, tri: false }], b.c, FASCIA);
    const top = e - 0.2 + ((CM[3] - CM[2]) / 2 + 0.8) * 0.45;
    b.c.push([b.B(367.2, 372.1, top - 1.4, top + 0.25, 180.4, 184.6), '#f2efe7']);
    b.grille.push(b.plane(true, 180.38, -1, 369.65, 4.2, top - 1.0, top + 0.05));
    hipRoof(k, M, 366.7, 372.6, 179.9, 185.1, top + 0.25, 0.4, 'x', [{ gw: 0, tri: false }, { gw: 0, tri: false }], b.c, FASCIA);
    // the long one-storey wings running back from the forecourt
    for (const bd of BUILDINGS.filter((q) => (Math.abs(q.minX - 330.4) < 1 && q.minZ < 160) || (Math.abs(q.minX - 399.4) < 1 && q.minZ < 160))) {
      const ring: [number, number][] = []; for (let i = 0; i < bd.pts.length; i += 2) ring.push([bd.pts[i], bd.pts[i + 1]]);
      for (const r of rectsOf(ring)) lowWing(k, b, r as R4, { eave: 3.6, along: 'z', faces: { z0: 'W-W', x0: 'W-WA-W-W-WA-W-W-W-W-W-W-W-W-W', x1: 'W-W-W-WA-W-W-D-W-W-WA-W-W-W-W' }, y: gh((r[0] + r[1]) / 2, (r[2] + r[3]) / 2) });
    }
    // ---- the oval forecourt ----
    const O = EN.oval, [ocx, ocz] = O.c, inOval = (x: number, z: number, grow = 0) => ((x - ocx) / (O.rx + grow)) ** 2 + ((z - ocz) / (O.rz + grow)) ** 2 < 1;
    k.meshes.push(new THREE.Mesh(drapeAt(AO, 347, 397, 148.5, 175.4, 0.4, 0.04, (x, z) => {
      if (inOval(x, z, 0.4)) return null;
      // the drives to the avenue at either end of the forecourt, the loop, the parking along the sides
      if (z < 150.5 && !(Math.abs(x - 356) < 3.2 || Math.abs(x - 389) < 3.2)) return null;
      const n = vnoise(x * 0.3, z * 0.3); const v = 0.3 + n * 0.05; return [v, v * 0.98, v * 0.96];
    }), groundCover()));
    for (const [x0, z0] of [[352.6, 139.8], [385.6, 139.8]]) k.meshes.push(new THREE.Mesh(drapeAt(AO, x0, x0 + 6.8, z0, 150.6, 0.4, 0.04, () => [0.31, 0.3, 0.29]), groundCover()));
    // the bed: grass inside a low pale kerb; the clipped hedge round it, the inner hedge line across the middle
    k.meshes.push(new THREE.Mesh(drapeAt(AO, ocx - O.rx - 0.5, ocx + O.rx + 0.5, ocz - O.rz - 0.5, ocz + O.rz + 0.5, 0.25, 0.12, (x, z) => (inOval(x, z, 0.35) ? [0.34, 0.52, 0.22] : null)), groundCover()));
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2, x = ocx + Math.cos(a) * (O.rx + 0.35), z = ocz + Math.sin(a) * (O.rz + 0.35);
      const a2 = ((i + 1) / 72) * Math.PI * 2, x2 = ocx + Math.cos(a2) * (O.rx + 0.35), z2 = ocz + Math.sin(a2) * (O.rz + 0.35);
      const L = Math.hypot(x2 - x, z2 - z), ang = Math.atan2(z2 - z, x2 - x);
      b.c.push([new THREE.BoxGeometry(L + 0.02, 0.16, 0.16).rotateY(-ang).translate((x + x2) / 2 - AO[0], gh(x, z) + 0.08, (z + z2) / 2 - AO[1]), '#d8d4ca']);
      const hx = ocx + Math.cos(a) * (O.rx - 0.15), hz = ocz + Math.sin(a) * (O.rz - 0.15);
      b.c.push([new THREE.BoxGeometry(L * (O.rx - 0.15) / (O.rx + 0.35) + 0.08, 0.7, 0.55).rotateY(-ang).translate(hx - AO[0], gh(hx, hz) + 0.42, hz - AO[1]), i % 3 ? '#a9b83c' : '#9cae36']);
    }
    for (let x = ocx - O.rx + 2.5; x < ocx + O.rx - 2.5; x += 0.9) b.c.push([b.B(x - 0.46, x + 0.46, gh(x, ocz) + 0.1, gh(x, ocz) + 0.65, ocz - 0.3, ocz + 0.3), '#b3c23f']);
    for (let i = 0; i < 40; i++) SOLIDS.add(ocx + Math.cos((i / 40) * Math.PI * 2) * (O.rx - 0.2), ocz + Math.sin((i / 40) * Math.PI * 2) * (O.rz - 0.2), 0.45);
    // hedges along the front of the wings, the conical shrubs by the entrance, a small young tree
    for (const [x0, x1] of [[345, 360.2], [379, 395.4]]) for (let x = x0; x < x1; x += 0.9) b.c.push([b.B(x - 0.46, x + 0.46, gh(x, 175) + 0.1, gh(x, 175) + 0.85, 174.4, 175.1), '#9fb23a']);
    for (const x of [362.6, 380.0]) {
      const cy = gh(x, 174.2);
      b.c.push([new THREE.ConeGeometry(1.05, 4.2, 12).translate(x - AO[0], cy + 2.4, 174.2 - AO[1]), '#2f5a24'], [new THREE.CylinderGeometry(0.08, 0.1, 0.5, 6).translate(x - AO[0], cy + 0.25, 174.2 - AO[1]), '#5b4636']);
      SOLIDS.add(x, 174.2, 0.6);
    }
    // parked cars, restrained
    const ck = { ...k, plain: [] as [THREE.BufferGeometry, string][] } as Kit;
    for (const [x, z, col, ry] of [[352, 170.5, '#2b3b5a', 0], [355, 170.5, '#e9e9ea', 0], [391.5, 170.5, '#9aa1a8', 0], [394.5, 166, '#1b1d22', 0]] as [number, number, string, number][]) { car(ck, x - AO[0], z - AO[1], col, gh(x, z), ry); SOLIDS.add(x, z, 1.2); SOLIDS.add(x, z - 1.6, 1.0); SOLIDS.add(x, z + 1.6, 1.0); }
    for (const p of ck.plain) b.c.push(p);
    // the College sign on its pale supports by the forecourt (only its heading readable)
    const [sx, sz] = [393.8, 172.6], sy = gh(sx, sz), sg = new THREE.Group();
    sg.add(new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.2, 0.2).translate(0, 2.2, 0), new THREE.MeshStandardMaterial({ color: '#f6f6f3', roughness: 0.5 })));
    for (const dx of [-1.6, 1.6]) sg.add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.2, 0.28).translate(dx, 0.6, 0), new THREE.MeshStandardMaterial({ color: '#dcd8cf' })));
    sg.position.set(sx - AO[0], sy, sz - AO[1]); sg.rotation.y = 2.2;
    sg.updateMatrix(); for (const ch of [...sg.children]) { ch.applyMatrix4(sg.matrix); k.meshes.push(ch as THREE.Mesh); }
    k.signs.push({ text: 'UNIVERSITY OF GHANA', x: sx - AO[0] + Math.sin(2.2) * 0.11, y: sy + 2.75, z: sz - AO[1] + Math.cos(2.2) * 0.11, ry: 2.2, w: 3.4, colors: ['#f6f6f3', '#1f4f9a'] });
    for (let i = 0; i < 2; i++) SOLIDS.add(sx + Math.cos(2.2) * (i ? 1.6 : -1.6) * -1, sz + Math.sin(2.2) * (i ? 1.6 : -1.6), 0.3);
    // the big spreading tree by the road, smaller trees and palms behind the wings
    broadleaf(k, b.leaf, 388.5, 147.5, { h: 10, spread: 19, seed: 5, origin: AO });
    for (const [x, z, h, s] of [[344, 147, 8, 13], [400, 149, 8.5, 13]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x + z, origin: AO });
    for (const [x, z, h] of [[352, 196, 11], [388, 197, 12], [358, 200, 10.5], [395, 202, 11.5]] as [number, number, number][]) fanPalm(b, x, z, h, x * 3 + z);
    b.finish(k);
  },
};

// ---------- the School of Performing Arts (additional image 1) ----------
const SPO: [number, number] = [650, 255];
const SPA_WINGS = BUILDINGS.filter((q) => q.minX > 633 && q.maxX < 687 && q.minZ > 205 && q.maxZ < 306 && !(q.minX > 674.5 && q.minZ < 197));
const spaSpec: Spec = {
  name: 'School of Performing Arts', axis: [1, 0], origin: SPO, storey: 3.2, style: PLAIN, roofColor: '#7a4a32', fascia: '#4a3328', pitch: 0.25, plinth: RED_BASE,
  replaces: SPA_WINGS.map((q) => [(q.minX + q.maxX) / 2, (q.minZ + q.maxZ) / 2] as [number, number]),
  onGround: true,
  blocks: [],
  keep: [[633 - SPO[0], 690 - SPO[0], 200 - SPO[1], 306 - SPO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(SPO);
    SPA_WINGS.forEach((q, i) => {
      const ring: [number, number][] = []; for (let j = 0; j < q.pts.length; j += 2) ring.push([q.pts[j], q.pts[j + 1]]);
      for (const r of rectsOf(ring)) {
        const len = Math.max(r[1] - r[0], r[3] - r[2]), n = Math.max(2, Math.round(len / 3));
        const long = Array.from({ length: n }, (_, t) => (hash(i * 7 + t, t) < 0.35 ? 'A' : hash(t, i) < 0.1 ? 'D' : 'W')).join('');
        // a taller red lower wall here (the photo's red band about a metre up), rusty corrugated roofs at a low pitch
        lowWing(k, b, r as R4, { eave: 3.2, pitch: 0.22, base: 1.05, roof: '#7a4a32', faces: r[1] - r[0] >= r[3] - r[2] ? { z0: long, z1: long } : { x0: long, x1: long }, y: gh((r[0] + r[1]) / 2, (r[2] + r[3]) / 2) });
      }
    });
    // the paved walk along La Road and the red earth paths and yards between the wings, small shade trees
    k.meshes.push(new THREE.Mesh(drapeAt(SPO, 634.5, 676, 205, 300, 0.6, 0.04, (x, z) => {
      if (SPA_WINGS.some((q) => x > q.minX - 0.2 && x < q.maxX + 0.2 && z > q.minZ - 0.2 && z < q.maxZ + 0.2)) return null;
      const n = vnoise(x * 0.3, z * 0.3);
      return n > 0.45 ? [0.62, 0.4, 0.26] : [0.38 + n * 0.1, 0.46 + n * 0.06, 0.22];
    }), groundCover()));
    for (const [x, z, h, s] of [[652, 222, 7, 11], [660, 245, 8, 12], [655, 290, 7.5, 12], [668, 210, 8, 13]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x + z * 2, origin: SPO });
    for (const [x, z, h] of [[645, 230, 6], [647, 238, 6.5], [663, 262, 7]] as [number, number, number][]) fanPalm(b, x, z, h, x + z);
    b.finish(k);
  },
};

// ---------- the Efua Sutherland Drama Studio (additional images 2, 3) ----------
const DO: [number, number] = [598, 175];
const dramaSpec: Spec = {
  name: 'Efua Sutherland Drama Studio', axis: [1, 0], origin: DO, storey: 3.2, style: PLAIN, roofColor: '#9a4a30', fascia: '#2a2522', pitch: 0.3,
  replaces: [[598, 165]],
  onGround: true,
  blocks: [],
  keep: [[576 - DO[0], 622 - DO[0], 150 - DO[1], 200 - DO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(DO), y = gh(598, 178), BLACK = '#232527';
    // the stage house along the north: dark walls, the deep covered stage open to the court, its roof
    const ST: R4 = [586.0, 611.0, 156.6, 167.5];
    // (the owner's 30-pair brief, pair 7, the raised view from the south-east: a low dark rear range under a flat roof
    // with a thin pale edge, AC units on its face, not a tall hipped stage house)
    const SH = 5.0;
    b.c.push([b.B(ST[0], ST[1], y - 0.3, y + SH, ST[2], ST[2] + 1.2), BLACK]);
    for (const x of [ST[0], ST[1] - 0.5]) b.c.push([b.B(x, x + 0.5, y - 0.3, y + SH, ST[2], ST[3]), BLACK]);
    for (const x of [589.2, 607.4]) b.c.push([b.B(x - 0.45, x + 0.45, y + 2.6, y + 3.2, ST[2] + 1.2, ST[2] + 1.55), '#e4e4df'], [b.B(x - 0.3, x + 0.3, y + 2.7, y + 3.1, ST[2] + 1.55, ST[2] + 1.56), '#55595c']);
    // the stage floor raised, its lip and the steps down to the court
    b.c.push([b.B(ST[0] + 0.5, ST[1] - 0.5, y - 0.2, y + 0.75, ST[2] + 1.2, ST[3] + 1.0), '#a8724a']);
    b.c.push([b.B(ST[0] + 0.5, ST[1] - 0.5, y + 0.75, y + 0.85, ST[3] + 0.8, ST[3] + 1.05), '#8a5a38']);
    for (let i = 0; i < 3; i++) b.c.push([b.B(592 + i * 0.4, 605 - i * 0.4, y - 0.2, y + 0.25 * (3 - i), ST[3] + 1.0 + i * 0.35, ST[3] + 1.35 + i * 0.35), '#1d1e20']);
    // back-stage panels and doors (pale and yellow flats, a dark door)
    b.c.push([b.B(592, 596, y + 0.75, y + 3.6, ST[2] + 1.25, ST[2] + 1.35), '#e8d27a'], [b.B(597, 600, y + 0.75, y + 3.2, ST[2] + 1.25, ST[2] + 1.35), '#d9d1bf']);
    b.door.push(b.plane(true, ST[2] + 1.36, 1, 602.5, 1.2, y + 0.75, y + 2.9));
    // the roof over the stage: flat, a deep overhang toward the court, its dark deck behind a thin pale edge, a pale soffit
    b.c.push([b.B(ST[0] - 0.6, ST[1] + 0.6, y + SH, y + SH + 0.35, ST[2] - 0.6, ST[3] + 1.6), '#3a3734']);
    b.c.push([b.B(ST[0] - 0.65, ST[1] + 0.65, y + SH + 0.2, y + SH + 0.42, ST[3] + 1.5, ST[3] + 1.65), '#d9d4c9']);
    b.c.push([b.B(ST[0] - 0.6, ST[1] + 0.6, y + SH - 0.06, y + SH, ST[2] - 0.6, ST[3] + 1.6), SOFF]);
    // the black water tank on its stand behind the west end
    b.c.push([new THREE.CylinderGeometry(0.85, 0.85, 1.6, 14).translate(583.6 - DO[0], y + 3.2, 159.2 - DO[1]), '#1c1d1f']);
    for (const [dx, dz] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) b.c.push([b.B(583.6 + dx - 0.06, 583.6 + dx + 0.06, y, y + 2.4, 159.2 + dz - 0.06, 159.2 + dz + 0.06), '#5a5a58']);
    SOLIDS.add(583.6, 159.2, 0.9);
    wallSolids(ST[0], ST[2], ST[1], ST[2]); wallSolids(ST[0], ST[2], ST[0], ST[3]); wallSolids(ST[1], ST[2], ST[1], ST[3]);
    // the side wings (south-west and south-east arms): white, one storey, red-brown roofs; the dark curved wall east
    // (pair 7: rusty corrugated roofs at a low pitch, unequal, the west one behind a weathered pale parapet on its south end;
    // AC condensers on their walls)
    lowWing(k, b, [580.6, 586.0, 167.5, 179.7], { eave: 3.3, pitch: 0.14, over: 0.5, roof: '#8a5236', base: 0.4, faces: { x0: 'w-A', x1: 'W-W', z1: 'w-w' }, y });
    lowWing(k, b, [609.7, 617.7, 167.5, 179.9], { eave: 2.9, pitch: 0.08, over: 0.4, roof: '#7d4c34', base: 0.4, faces: { x0: 'WA', x1: 'A-W', z1: 'D' }, y });
    b.c.push([b.B(580.5, 586.1, y + 3.0, y + 3.9, 179.55, 179.85), '#e6e2d6'], [b.B(580.5, 586.1, y + 3.9, y + 3.98, 179.5, 179.9), '#8a6a4a']);
    // the low white enclosing wall round the court with its groups of vertical slots; the entrance on the south
    const cx = 598, cz = 180, R = 15.5, a0 = 0.35, a1 = Math.PI - 0.35, ent = Math.PI / 2;
    const seg = 22;
    for (let i = 0; i < seg; i++) {
      const t0 = a0 + ((a1 - a0) * i) / seg, t1 = a0 + ((a1 - a0) * (i + 1)) / seg, tm = (t0 + t1) / 2;
      if (Math.abs(tm - ent) < 0.075) continue;
      const p = [cx + Math.cos(t0) * R, cz + Math.sin(t0) * R * 0.85], q = [cx + Math.cos(t1) * R, cz + Math.sin(t1) * R * 0.85];
      const L = Math.hypot(q[0] - p[0], q[1] - p[1]), ang = Math.atan2(q[1] - p[1], q[0] - p[0]), mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2, wy = gh(mx, mz);
      b.c.push([new THREE.BoxGeometry(L + 0.05, 2.3, 0.3).rotateY(-ang).translate(mx - DO[0], wy + 1.0, mz - DO[1]), WALL]);
      b.c.push([new THREE.BoxGeometry(L + 0.06, 0.35, 0.32).rotateY(-ang).translate(mx - DO[0], wy - 0.05, mz - DO[1]), BLACK]);
      if (i % 3 === 1) for (let s = -2; s <= 2; s++) b.grille.push(new THREE.PlaneGeometry(0.1, 1.3).rotateY(-ang).translate(mx - DO[0] + Math.cos(ang) * s * 0.3 + Math.sin(ang) * 0.16, wy + 1.15, mz - DO[1] + Math.sin(ang) * s * 0.3 - Math.cos(ang) * 0.16));
      wallSolids(p[0], p[1], q[0], q[1], 0.3);
    }
    // straight runs from the arms' ends to the curve
    for (const [x, z0] of [[cx - R * Math.cos(a0), 179.7], [cx + R * Math.cos(a0), 179.9]] as [number, number][]) {
      const z1 = cz + Math.sin(a0) * R * 0.85, wy = gh(x, (z0 + z1) / 2);
      b.c.push([b.B(x - 0.15, x + 0.15, wy - 0.2, wy + 2.15, z0, z1), WALL]); wallSolids(x, z0, x, z1, 0.3);
    }
    // the projecting entrance: a timber panel in a frame under a small roof
    const ex = cx, ez = cz + R * 0.85, ey = gh(ex, ez);
    // (pair 7: a boxy timber-clad block projecting from the wall, a pale slab roof over it with a brown edge, an AC unit)
    b.c.push([b.B(ex - 2.4, ex - 1.9, ey - 0.2, ey + 3.0, ez - 0.6, ez + 1.2), '#f1efe9'], [b.B(ex + 1.9, ex + 2.4, ey - 0.2, ey + 3.0, ez - 0.6, ez + 1.2), '#f1efe9']);
    b.c.push([b.B(ex - 1.9, ex + 1.9, ey - 0.2, ey + 2.9, ez + 0.95, ez + 1.15), '#8a5a2e']);
    for (let x = ex - 1.8; x < ex + 1.8; x += 0.3) b.c.push([b.B(x, x + 0.04, ey, ey + 2.9, ez + 1.15, ez + 1.17), '#6e4524']);
    b.c.push([b.B(ex - 2.9, ex + 2.9, ey + 3.0, ey + 3.22, ez - 1.0, ez + 1.7), '#d8cfbd'], [b.B(ex - 2.95, ex + 2.95, ey + 2.9, ey + 3.05, ez - 1.05, ez + 1.75), '#7a4a26']);
    b.c.push([b.B(ex + 0.6, ex + 1.4, ey + 1.6, ey + 2.2, ez + 1.15, ez + 1.45), '#e2e2dd']);
    SOLIDS.add(ex - 2.15, ez + 0.3, 0.4); SOLIDS.add(ex + 2.15, ez + 0.3, 0.4);
    // the court: worn pale paving open to the sky, a raised pale polygonal platform, a drain channel
    k.meshes.push(new THREE.Mesh(drapeAt(DO, cx - R, cx + R, ST[3] + 1.0, cz + R * 0.85, 0.3, 0.04, (x, z) => {
      if (((x - cx) / R) ** 2 + ((z - cz) / (R * 0.85)) ** 2 > 1 && z > cz) return null;
      if (x < 586 || x > 609.7) return null;
      const t = hash(Math.floor(x / 1.1), Math.floor(z / 1.1)) * 0.08, n = vnoise(x * 0.4, z * 0.4) * 0.05;
      return [0.72 - t - n, 0.64 - t - n, 0.5 - t - n];
    }), groundCover()));
    const plat = new THREE.CylinderGeometry(5.2, 5.4, 0.3, 7).translate(cx + 2 - DO[0], y + 0.15, cz + 3 - DO[1]);
    b.c.push([plat, '#cdbf9e']);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; SOLIDS.add(cx + 2 + Math.cos(a) * 4.8, cz + 3 + Math.sin(a) * 4.8, 0.4); }
    // movable plastic chairs stacked by the wall
    for (let i = 0; i < 5; i++) b.c.push([b.B(612 + (i % 3) * 0.55, 612.45 + (i % 3) * 0.55, y, y + 0.9 + (i > 2 ? 0.3 : 0), 168.5 + Math.floor(i / 3) * 0.6, 168.95 + Math.floor(i / 3) * 0.6), '#e8e6e0']);
    // red earth round the outside, a tree or two over the wall
    k.meshes.push(new THREE.Mesh(drapeAt(DO, 578, 620, cz + 5, cz + R * 0.85 + 6, 0.5, 0.03, (x, z) => {
      if (((x - cx) / R) ** 2 + ((z - cz) / (R * 0.85)) ** 2 < 1.02) return null;
      const n = vnoise(x * 0.3, z * 0.3); return n > 0.4 ? [0.64, 0.4, 0.26] : [0.4, 0.47, 0.22];
    }), groundCover()));
    for (const [x, z, h, s] of [[619, 166, 8.5, 13], [580, 194, 8, 12], [617, 196, 7.5, 12]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x * 3 + z, origin: DO });
    b.finish(k);
    void gableTri; void FASCIA;
  },
};

export const southSite = createSite('south-references', [provostSpec, spaSpec, dramaSpec]);
