// The Institute of African Studies and its neighbours north and south of Danquah Avenue (the owner's main entrance
// brief, pairs 18-24 and 26; numbers in entrance.ts):
// - the Kwame Nkrumah Complex: a cross of two-storey white wings under terracotta roofs over dark fascias. The west front
//   two wings whose broad white gables face west either side of a recessed central entrance with its own small gable
//   (pair 20); the north-west wing's gable almost blank, the institution's name high on it, a row of small dark vents and
//   a single dark doorway (pair 23); the south front a projecting central block under its own white gable, the porch
//   below it carrying a balcony slab with the name on its parapet, the door between square columns, two-storey wings
//   either side whose bays alternate dark windows and narrow arched recesses between pilasters (pairs 21, 22, 24);
//   the stepped stone-faced terraces before it down to the brick walk along the avenue, steps up the middle, the
//   sculptured figures on their plinths in the planted court, the heavy tree by the steps; the brick parking apron and
//   the low stone walls with a pale coping on the west, the channel drain;
// - the detached one-storey pavilion south of the avenue: a broad hipped tiled roof on chunky round columns over a deep
//   veranda all round, a slate-blue fascia, dark lattice balustrades, a cream glazed core, a stone-faced plinth, a
//   projecting covered entrance toward the avenue, the University of Ghana sign on its posts, rough ground (18, 19);
// - the two-storey white building above the roadside bank east of the Institute: its gabled end toward the road with
//   the College of Education's sign, a recessed side veranda, a dark fascia; the bank in long grass (pair 26).
import * as THREE from 'three';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { EN } from './entrance';
import { Bag, tuft, FASCIA, RED_BASE, SOFF, TILE, WALL, facesOf, gh, hash, lowWing, openings, vnoise, wallSolids, type Face, type R4 } from './enkit';
import { hipRoof } from './waccbip';
import { broadleaf, stoneMeshOf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { letters } from './letters';
import { SOLIDS } from './solids';
import type { Part } from './modelkit';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, WALL) };
const IO: [number, number] = [576, 76];

/** a white gable triangle closing a roof's end: in the plane at (x = at unless alongX, then z = at), its outer face
 *  flush with it, spanning a0..a1 at the eave e and rising at `pitch` */
export function gableTri(b: Bag, alongX: boolean, at: number, out: number, a0: number, a1: number, e: number, pitch: number, col = WALL, thick = 0.3) {
  const am = (a0 + a1) / 2, s = new THREE.Shape([new THREE.Vector2(a0, e), new THREE.Vector2(a1, e), new THREE.Vector2(am, e + ((a1 - a0) / 2) * pitch)]);
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false });
  if (alongX) g.translate(-b.O[0], 0, at - b.O[1] - (out > 0 ? thick : 0));
  else g.rotateY(-Math.PI / 2).translate(at - b.O[0] + (out > 0 ? 0 : thick), 0, -b.O[1]);
  b.c.push([g, col]);
}

let archT: THREE.MeshStandardMaterial | null = null;
/** a narrow arched recess: dark, its head a round arch, on the white wall */
const archMat = () => (archT ??= new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide, transparent: true, alphaTest: 0.5, map: (() => {
  const c = document.createElement('canvas'); c.width = 64; c.height = 160; const g = c.getContext('2d')!;
  g.fillStyle = '#1d2124'; g.beginPath(); g.moveTo(6, 160); g.lineTo(6, 32); g.arc(32, 32, 26, Math.PI, 0); g.lineTo(58, 160); g.closePath(); g.fill();
  g.fillStyle = '#2c3236'; g.fillRect(14, 70, 36, 82);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})() }));

/** the bays of a two-storey Institute face: pilasters between them; each storey's bay a window (W), an arched recess (A),
 *  a pair of arched recesses (P), a blank bay (-), a door (D) */
function iasFace(b: Bag, arches: THREE.BufferGeometry[], F: Face, y0: number, ground: string, upper: string, fh = 3.5) {
  const n = Math.max(ground.length, upper.length), w = (F.a1 - F.a0) / n;
  const Bx = (a0: number, a1: number, ya: number, yb: number, d0: number, d1: number) => {
    const p = F.at + F.out * d0, q = F.at + F.out * d1, lo = Math.min(p, q), hi = Math.max(p, q);
    return F.alongX ? b.B(a0, a1, ya, yb, lo, hi) : b.B(lo, hi, ya, yb, a0, a1);
  };
  for (let i = 0; i <= n; i++) { const a = F.a0 + w * i; b.c.push([Bx(a - 0.17, a + 0.17, y0, y0 + 2 * fh, 0, 0.14), '#f6f4ee']); }
  b.c.push([Bx(F.a0, F.a1, y0 + fh - 0.12, y0 + fh + 0.12, 0, 0.1), '#ece8de']);
  for (const [row, y] of [[ground, y0], [upper, y0 + fh]] as [string, number][]) {
    for (let i = 0; i < row.length; i++) {
      const a = F.a0 + w * (i + 0.5), ch = row[i];
      if (ch === 'W') { b.win.push(b.plane(F.alongX, F.at + F.out * 0.03, F.out, a, Math.min(1.5, w * 0.55), y + 0.9, y + 2.6)); b.c.push([Bx(a - 0.85, a + 0.85, y + 0.82, y + 0.9, 0, 0.12), '#e4dfd4']); }
      else if (ch === 'A') arches.push(b.plane(F.alongX, F.at + F.out * 0.03, F.out, a, 0.75, y + 0.8, y + 2.85));
      else if (ch === 'P') for (const d of [-0.55, 0.55]) arches.push(b.plane(F.alongX, F.at + F.out * 0.03, F.out, a + d, 0.62, y + 0.8, y + 2.85));
      else if (ch === 'D') b.door.push(b.plane(F.alongX, F.at + F.out * 0.03, F.out, a, 1.6, y, y + 2.6));
    }
  }
}

/** a sculptured figure (dark brown): a body, arms, a head, on a stone plinth */
function figure(b: Bag, stone: Part[], x: number, z: number, h: number, yaw: number, seed: number) {
  const y = gh(x, z), X = x - b.O[0], Z = z - b.O[1], c = '#6b3f26', r = (i: number) => hash(seed + i, seed * 0.3 - i);
  stone.push([b.B(x - 0.4, x + 0.4, y, y + 0.45, z - 0.4, z + 0.4), '#fff']);
  const g: Part[] = [];
  g.push([new THREE.CylinderGeometry(0.13, 0.17, h * 0.42, 8).translate(0, h * 0.21 + 0.45, 0), c]);
  for (const s of [-1, 1]) g.push([new THREE.CylinderGeometry(0.07, 0.08, h * 0.42, 6).translate(s * 0.09, h * -0.0 + 0.45 + h * 0.21 - h * 0.21, 0).translate(0, h * 0.21 - h * 0.21, 0), c]);
  g.push([new THREE.CylinderGeometry(0.17, 0.12, h * 0.36, 8).translate(0, h * 0.6 + 0.45, 0), c]);
  for (const s of [-1, 1]) g.push([new THREE.CylinderGeometry(0.05, 0.06, h * 0.36, 6).rotateZ(s * (0.3 + r(s + 2) * 0.9)).translate(s * 0.25, h * 0.62 + 0.45, 0), c]);
  g.push([new THREE.SphereGeometry(0.12, 10, 8).scale(1, 1.2, 1).translate(0, h * 0.86 + 0.45, 0), c]);
  for (const [geo, col] of g) b.c.push([geo.rotateY(yaw).translate(X, y, Z), col]);
  SOLIDS.add(x, z, 0.5);
}

const iasSpec: Spec = {
  name: 'Institute of African Studies (Kwame Nkrumah Complex)', axis: [1, 0], origin: IO, storey: 3.5, style: PLAIN, roofColor: TILE, fascia: FASCIA, pitch: 0.5, plinth: '#c9c4b8',
  replaces: [[580, 76]],
  onGround: true,
  blocks: [],
  keep: [[540 - IO[0], 600 - IO[0], 48 - IO[1], 112 - IO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(IO), arches: THREE.BufferGeometry[] = [], stone: Part[] = [], I = EN.ias;
    const y0 = gh(576, 76) - 0.1, fh = 3.5, e = y0 + 2 * fh + 0.4, p = I.pitch, ov = 0.85;
    const NW: R4 = [557.4, 571.6, 61.6, 72.7], SW: R4 = [556.6, 571.2, 79.0, 91.2], SP: R4 = [571.2, 586.8, 56.0, 94.9];
    const NE: R4 = [586.7, 595.4, 55.9, 66.1], SE: R4 = [586.9, 595.3, 84.8, 94.7], NB: R4 = [580.6, 586.2, 52.8, 56.0], CS: R4 = [577.6, 589.4, 86.0, 97.9];
    for (const r of [NW, SW, SP, NE, SE, NB, CS]) {
      b.c.push([b.B(r[0], r[1], y0 - 0.6, e, r[2], r[3]), WALL]);
      b.c.push([b.B(r[0] - 0.03, r[1] + 0.03, y0 - 0.6, y0 + 0.35, r[2] - 0.03, r[3] + 0.03), '#d6d1c4']);
    }
    // ---- roofs ----
    const M = (x: number, z: number): [number, number] => [x - IO[0], z - IO[1]];
    k.roof.c = new THREE.Color(TILE);
    const roof = (r: R4, along: 'x' | 'z', ends: [number, number], ee = e, pp = p) => {
      hipRoof(k, M, r[0] - ov, r[1] + ov, r[2] - ov, r[3] + ov, ee - ov * pp * 0.5, pp, along, [{ gw: ends[0], tri: false }, { gw: ends[1], tri: false }], b.c, '#2d2622');
      b.c.push([b.B(r[0] - ov, r[1] + ov, ee - ov * pp * 0.5 - 0.06, ee - ov * pp * 0.5, r[2] - ov, r[3] + ov), SOFF]);
    };
    roof(SP, 'z', [0, 0]);
    roof(NW, 'x', [99, 99]); roof(SW, 'x', [99, 99]);
    roof(NE, 'x', [99, 0]); roof(SE, 'x', [99, 0]);
    roof(NB, 'x', [0, 0], e - 0.6, 0.45);
    roof(CS, 'z', [99, 99], e + 0.8, 0.62);
    // the white gables: the west front's two, the south front's central one (all under a dark fascia)
    const gtri = (alongX: boolean, at: number, out: number, a0: number, a1: number, ee: number, pp: number) => {
      gableTri(b, alongX, at, out, a0 - ov, a1 + ov, ee - ov * pp * 0.5, pp);
      // the bargeboards: dark boards along the two rakes
      const am = (a0 + a1) / 2, half = (a1 - a0) / 2 + ov, top = ee - ov * pp * 0.5 + half * pp;
      for (const s of [-1, 1]) {
        const P = new THREE.Vector3(...(alongX ? [am + s * half - IO[0], ee - ov * pp * 0.5, at + out * 0.08 - IO[1]] : [at + out * 0.08 - IO[0], ee - ov * pp * 0.5, am + s * half - IO[1]]) as [number, number, number]);
        const Q = new THREE.Vector3(...(alongX ? [am - IO[0], top, at + out * 0.08 - IO[1]] : [at + out * 0.08 - IO[0], top, am - IO[1]]) as [number, number, number]);
        const d = Q.clone().sub(P);
        b.c.push([new THREE.BoxGeometry(0.12, 0.42, d.length()).lookAt(d).translate((P.x + Q.x) / 2, (P.y + Q.y) / 2, (P.z + Q.z) / 2), '#2d2622']);
      }
    };
    gtri(false, NW[0], -1, NW[2], NW[3], e, p); gtri(false, SW[0], -1, SW[2], SW[3], e, p);
    gtri(true, CS[3], 1, CS[0], CS[1], e + 0.8, 0.62);
    // the west front's recessed central entrance: columns, its own small gable set back between the wings
    const WE: R4 = [565.5, 571.4, 72.7, 79.0];
    b.c.push([b.B(570.6, 571.4, y0, e - 0.4, WE[2], WE[3]), WALL]);
    roof([566.5, 571.4, 73.3, 78.4], 'x', [99, 99], e - 0.9, 0.62);
    gtri(false, 566.5, -1, 73.3, 78.4, e - 0.9, 0.62);
    for (const z of [73.8, 77.9]) { b.c.push([b.B(566.2, 566.8, y0, e - 1.0, z - 0.3, z + 0.3), '#f7f5ef']); SOLIDS.add(566.5, z, 0.35); }
    b.c.push([b.B(565.8, 571.4, y0 + fh - 0.15, y0 + fh + 0.2, WE[2], WE[3]), '#ece8de']);
    b.door.push(b.plane(false, 570.55, -1, 75.85, 2.0, y0, y0 + 2.6));
    b.win.push(b.plane(false, 570.55, -1, 75.85, 2.4, y0 + fh + 0.9, y0 + fh + 2.5));
    // ---- the faces ----
    const F = (r: R4) => facesOf(r);
    // west gables: the north-west one nearly blank (vents, a door, the name), the south-west with its window rows
    const nwW = F(NW).x0;
    for (const [a, w] of [[63.2, 1.1], [64.6, 1.1], [66.0, 1.1], [68.6, 1.1], [70.0, 1.1], [71.4, 1.1]] as [number, number][]) b.grille.push(b.plane(false, nwW.at - 0.03, -1, a, w * 0.9, y0 + 1.75, y0 + 2.3));
    b.door.push(b.plane(false, nwW.at - 0.03, -1, 67.3, 1.4, y0, y0 + 2.4));
    const nk = { ...k, plain: [] as Part[] } as Kit;
    letters(nk, 'KWAME NKRUMAH COMPLEX', nwW.at - 0.02 - IO[0], y0 + 5.6, 67.15 - IO[1], -Math.PI / 2, 0.36, 0.04, '#6e5a36', { wide: 0.72, gap: 0.3, stroke: 0.18 });
    letters(nk, 'INSTITUTE OF AFRICAN STUDIES', nwW.at - 0.02 - IO[0], y0 + 4.75, 67.15 - IO[1], -Math.PI / 2, 0.34, 0.04, '#6e5a36', { wide: 0.72, gap: 0.3, stroke: 0.18 });
    letters(nk, 'UNIVERSITY OF GHANA', nwW.at - 0.02 - IO[0], y0 + 4.15, 67.15 - IO[1], -Math.PI / 2, 0.2, 0.03, '#6e5a36', { wide: 0.72, gap: 0.3, stroke: 0.18 });
    for (const pt of nk.plain) b.c.push(pt);
    const swW = F(SW).x0;
    for (const [a, w, y, h] of [[80.6, 1.0, 1.0, 0.6], [82.0, 1.0, 1.0, 0.6], [83.4, 1.0, 1.0, 0.6], [85.2, 1.4, 0.4, 2.0], [87.4, 1.0, 1.0, 0.6], [88.8, 1.0, 1.0, 0.6], [90.0, 0.8, 1.0, 0.6], [84.0, 1.6, 4.4, 1.6], [87.2, 1.6, 4.4, 1.6]] as [number, number, number, number][]) b.win.push(b.plane(false, swW.at - 0.03, -1, a, w, y0 + y, y0 + y + h));
    // the long sides: pilasters, windows and arched recesses
    iasFace(b, arches, F(NW).z0, y0, 'WAWAW', 'WAWAW'); iasFace(b, arches, F(SW).z1, y0, 'WAWAW', 'WAWAW');
    iasFace(b, arches, F(NE).z0, y0, 'WAW', 'WAW'); iasFace(b, arches, F(NE).x1, y0, 'WAW', 'AWA');
    iasFace(b, arches, F(SE).x1, y0, 'WAW', 'AWA'); iasFace(b, arches, F(SE).z1, y0, 'WPW', 'WAW');
    iasFace(b, arches, F(SP).x1, y0, 'WAWAWAW', 'WAWAWAW');
    iasFace(b, arches, F(NB).z0, y0, 'D', 'W');
    iasFace(b, arches, { alongX: true, at: 94.9, out: 1, a0: 571.2, a1: 577.6 }, y0, 'WA', 'WA');
    // ---- the south entrance: the porch, the balcony slab and its parapet with the name, the door ----
    const pz = CS[3];
    b.c.push([b.B(578.0, 589.0, y0 + fh - 0.15, y0 + fh + 0.12, pz, pz + 2.4), '#f1eee6']);
    b.c.push([b.B(578.0, 589.0, y0 + fh + 0.12, y0 + fh + 1.05, pz + 2.2, pz + 2.4), '#f6f4ee']);
    for (const x of [578.0, 589.0]) b.c.push([b.B(x - 0.1, x + 0.1, y0 + fh + 0.12, y0 + fh + 1.05, pz, pz + 2.4), '#f6f4ee']);
    for (const x of [578.5, 581.6, 585.4, 588.5]) { b.c.push([b.B(x - 0.22, x + 0.22, y0, y0 + fh - 0.15, pz + 1.9, pz + 2.34), '#f7f5ef']); SOLIDS.add(x, pz + 2.1, 0.3); }
    const pk = { ...k, plain: [] as Part[] } as Kit;
    letters(pk, 'KWAME NKRUMAH COMPLEX', 583.5 - IO[0], y0 + fh + 0.82, pz + 2.42 - IO[1], 0, 0.24, 0.03, '#8a6a2e', { wide: 0.72, gap: 0.3, stroke: 0.2 });
    letters(pk, 'INSTITUTE OF AFRICAN STUDIES', 583.5 - IO[0], y0 + fh + 0.45, pz + 2.42 - IO[1], 0, 0.22, 0.03, '#8a6a2e', { wide: 0.72, gap: 0.3, stroke: 0.2 });
    for (const pt of pk.plain) b.c.push(pt);
    b.door.push(b.plane(true, pz + 0.03, 1, 583.5, 2.4, y0, y0 + 2.7));
    b.win.push(b.plane(true, pz + 0.03, 1, 579.6, 1.3, y0 + 0.9, y0 + 2.6)); b.win.push(b.plane(true, pz + 0.03, 1, 587.4, 1.3, y0 + 0.9, y0 + 2.6));
    b.win.push(b.plane(true, pz + 0.03, 1, 583.5, 2.0, y0 + fh + 1.4, y0 + fh + 2.6));
    // the south faces of the wings either side
    iasFace(b, arches, { alongX: true, at: SW[3], out: 1, a0: SW[0], a1: SW[1] }, y0, 'WAWAW', 'WAWAW');
    iasFace(b, arches, { alongX: true, at: SE[3], out: 1, a0: SE[0], a1: SE[1] }, y0, 'WAW', 'WAW');
    // the building's walls stop a bike
    for (const r of [NW, SW, SP, NE, SE, CS]) { wallSolids(r[0], r[2], r[1], r[2]); wallSolids(r[0], r[3], r[1], r[3]); wallSolids(r[0], r[2], r[0], r[3]); wallSolids(r[1], r[2], r[1], r[3]); }
    // ---- the stepped stone court before the south front ----
    const T = EN.iasTerrace, sx0 = 581.4, sx1 = 585.6;
    const tier = (z: number, top: number, x0: number, x1: number) => {
      for (const [a, c] of [[x0, sx0], [sx1, x1]]) {
        stone.push([b.B(a, c, top - 0.5, top + 0.02, z - 0.45, z), '#fff']);
        b.c.push([b.B(a - 0.05, c + 0.05, top + 0.02, top + 0.1, z - 0.5, z + 0.05), '#d9d2c3']);
        wallSolids(a, z - 0.2, c, z - 0.2, 0.3);
      }
      // the steps' cheek walls
      for (const x of [sx0 - 0.35, sx1]) stone.push([b.B(x, x + 0.35, top - 0.5, top + 0.3, z - 0.5, z + 2.2), '#fff']);
    };
    tier(101.5 + 0.3, T[1], 559.5, 596.5);
    tier(105.5 + 0.3, T[0], 562.0, 596.5);
    for (const x of [559.5, 596.2]) stone.push([b.B(x, x + 0.4, -0.3, T[1] + 0.05, 98, 105.9), '#fff']);
    // the ground: the brick walk along the avenue, paving on the terraces, lawns and planted beds
    k.meshes.push(new THREE.Mesh(drapeAt(IO, 550, 600, 106.0, 110.8, 0.25, 0.05, (x, z) => { const row = Math.floor(z / 0.11), col = Math.floor((x + (row % 2) * 0.11) / 0.22), t = hash(col, row) * 0.07; return [0.6 + t, 0.42 + t * 0.6, 0.33]; }), groundCover()));
    k.meshes.push(new THREE.Mesh(drapeAt(IO, 559.8, 596, 98.2, 105.5, 0.3, 0.04, (x, z) => {
      if (Math.abs(x - 583.5) < 2.3 || (z < 101.4 && x > 576 && x < 591)) { const t = hash(Math.floor(x / 0.9), Math.floor(z / 0.9)) * 0.08; return [0.62 - t, 0.6 - t, 0.55 - t]; }
      const n = vnoise(x * 0.4, z * 0.4);
      return n > 0.7 ? [0.42, 0.32, 0.22] : [0.3 + n * 0.08, 0.46 + n * 0.06, 0.2];
    }), groundCover()));
    // the sculptured figures: a group on the lawn of the middle terrace, single ones by the steps
    for (let i = 0; i < 5; i++) figure(b, stone, 564.5 + i * 1.5, 103.4 + (i % 2) * 0.9, 1.7 + hash(i, 5) * 0.4, -0.4 + i * 0.3, i * 13);
    figure(b, stone, 580.3, 100.4, 1.6, 0.2, 77); figure(b, stone, 592.5, 100.6, 1.7, -0.5, 91);
    // the planted beds and shrubs along the terraces, the pots by the steps
    for (let i = 0; i < 14; i++) {
      const x = 561 + i * 2.5 + hash(i, 1), z = 104.4 + hash(i, 2) * 0.8, s = 0.4 + hash(i, 3) * 0.35;
      if (Math.abs(x - 583.5) < 3 || (x > 563 && x < 572.5)) continue;
      b.leaf.push([new THREE.IcosahedronGeometry(s, 1).scale(1.2, 0.8, 1.1).translate(x - IO[0], gh(x, z) + s * 0.6, z - IO[1]), ['#3f6d2c', '#527f33', '#2f5a24'][i % 3]]);
    }
    for (const x of [580.6, 586.4]) b.c.push([new THREE.CylinderGeometry(0.42, 0.3, 0.75, 14).translate(x - IO[0], gh(x, 101.0) + 0.37, 101.0 - IO[1]), '#9a4a2c']);
    // the heavy tree by the steps (an intentional foreground occluder in pair 22), others round the building
    broadleaf(k, b.leaf, 591.2, 107.6, { h: 9.5, spread: 15, seed: 19, origin: IO });
    for (const [x, z, h, s] of [[552, 100, 8, 13], [549, 68, 7, 11], [598, 104, 8, 12], [600, 50, 8.5, 14]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x + z, origin: IO });
    // ---- the west apron: brick parking, the low stone walls with a pale coping round the lawns, the channel drain ----
    k.meshes.push(new THREE.Mesh(drapeAt(IO, 546.5, 556.2, 57.0, 93.0, 0.2, 0.08, (x, z) => {
      // herringbone-ish: alternate the course direction in small blocks
      const blk = (Math.floor(x / 0.44) + Math.floor(z / 0.44)) % 2, u = blk ? x : z, v = blk ? z : x;
      const row = Math.floor(v / 0.11), col = Math.floor((u + (row % 2) * 0.11) / 0.22), t = hash(col, row) * 0.08;
      return [0.5 + t, 0.47 + t, 0.44 + t];
    }), groundCover()));
    for (let z = 58; z <= 92; z += 0.5) b.grille.push(new THREE.PlaneGeometry(0.5, 0.45).rotateX(-Math.PI / 2).translate(546.3 - IO[0], 0.09, z - IO[1]));
    for (const [z0, z1] of [[57.5, 61.4], [72.9, 74.8], [77.0, 78.8], [91.4, 93.0]]) {
      stone.push([b.B(555.6, 556.3, -0.2, 0.75, z0, z1), '#fff']);
      b.c.push([b.B(555.55, 556.35, 0.75, 0.83, z0, z1), '#d9d2c3']);
    }
    stoneMeshOf(k, stone);
    const am = new THREE.Mesh(mergeArch(arches), archMat()); am.receiveShadow = true; k.meshes.push(am);
    b.finish(k);
  },
};
const mergeArch = (gs: THREE.BufferGeometry[]) => { const { mergeGeometries } = BGU; return mergeGeometries(gs.map((g) => (g.index ? g.toNonIndexed() : g))); };
import * as BGU from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// ---------- the pavilion south of the avenue (pairs 18, 19) ----------
const PO: [number, number] = [531, 162.5];
const pavilionSpec: Spec = {
  name: 'Pavilion by the Institute of African Studies', axis: [1, 0], origin: PO, storey: 3.4, style: PLAIN, roofColor: TILE, fascia: '#3c4652', pitch: 0.42,
  replaces: [[531.1, 162.6]],
  onGround: true,
  blocks: [],
  keep: [[512 - PO[0], 546 - PO[0], 146 - PO[1], 174 - PO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(PO), [x0, x1, z0, z1] = EN.pavilion, y = gh(531, 162.5), e = y + EN.pavilionEave, stone: Part[] = [];
    // the plinth: stone-faced, its top a pale screed; the veranda floor on it
    stone.push([b.B(x0, x1, y - 0.85, y, z0, z1), '#fff']);
    b.c.push([b.B(x0 - 0.04, x1 + 0.04, y - 0.02, y + 0.06, z0 - 0.04, z1 + 0.04), '#d8d0c0']);
    // the core: cream walls, broad dark-green glazing in cream frames, a door
    const C: R4 = [x0 + 2.6, x1 - 2.6, z0 + 2.6, z1 - 2.6];
    b.c.push([b.B(C[0], C[1], y, e, C[2], C[3]), '#efe7d6']);
    const gl = new THREE.MeshStandardMaterial({ color: '#2f4a3c', roughness: 0.15, metalness: 0.35 });
    const glass: THREE.BufferGeometry[] = [];
    for (const f of Object.values(facesOf(C))) {
      for (let a = f.a0 + 1.4; a < f.a1 - 1.0; a += 3.2) {
        glass.push(b.plane(f.alongX, f.at + f.out * 0.03, f.out, a + 0.9, 2.2, y + 0.35, y + 2.6));
        b.c.push([f.alongX ? b.B(a - 0.25, a + 2.05, y + 2.6, y + 2.75, f.at - 0.05, f.at + 0.05) : b.B(f.at - 0.05, f.at + 0.05, y + 2.6, y + 2.75, a - 0.25, a + 2.05), '#d9cfbb']);
      }
    }
    const gm = new THREE.Mesh(BGU.mergeGeometries(glass.map((g) => (g.index ? g.toNonIndexed() : g))), gl); k.meshes.push(gm);
    // the chunky round columns round the veranda, the lattice balustrades between them
    const cols: [number, number][] = [];
    for (let x = x0 + 0.7; x <= x1 - 0.6; x += (x1 - x0 - 1.4) / 5) cols.push([x, z0 + 0.7], [x, z1 - 0.7]);
    for (let z = z0 + 0.7 + (z1 - z0 - 1.4) / 4; z < z1 - 1; z += (z1 - z0 - 1.4) / 4) cols.push([x0 + 0.7, z], [x1 - 0.7, z]);
    for (const [cx, cz] of cols) { b.c.push([new THREE.CylinderGeometry(0.27, 0.3, e - y, 14).translate(cx - PO[0], (y + e) / 2, cz - PO[1]), '#efe9dc']); SOLIDS.add(cx, cz, 0.35); }
    const BAL = '#3a2a22';
    for (const [ax, az, bx, bz] of [[x0 + 0.7, z0 + 0.7, x1 - 0.7, z0 + 0.7], [x0 + 0.7, z1 - 0.7, x1 - 0.7, z1 - 0.7], [x0 + 0.7, z0 + 0.7, x0 + 0.7, z1 - 0.7], [x1 - 0.7, z0 + 0.7, x1 - 0.7, z1 - 0.7]]) {
      const L = Math.hypot(bx - ax, bz - az), alongX = az === bz;
      // a gap at the middle of the north side for the entrance
      for (const [t0, t1] of alongX && az < 162 ? [[0, L / 2 - 1.6], [L / 2 + 1.6, L]] : [[0, L]]) {
        const p0 = (alongX ? ax : az) + t0, p1 = (alongX ? ax : az) + t1;
        for (const yy of [y + 0.12, y + 0.92]) b.c.push([alongX ? b.B(p0, p1, yy, yy + 0.08, az - 0.05, az + 0.05) : b.B(ax - 0.05, ax + 0.05, yy, yy + 0.08, p0, p1), BAL]);
        for (let t = p0; t < p1 - 0.4; t += 0.8) {
          for (const s of [-1, 1]) {
            const g = new THREE.BoxGeometry(0.05, 1.05, 0.05).rotateZ(s * 0.72);
            if (!alongX) g.rotateY(Math.PI / 2);
            b.c.push([alongX ? g.translate(t + 0.4 - PO[0], y + 0.56, az - PO[1]) : g.translate(ax - PO[0], y + 0.56, t + 0.4 - PO[1]), BAL]);
          }
        }
        wallSolids(alongX ? p0 : ax, alongX ? az : p0, alongX ? p1 : ax, alongX ? az : p1, 0.25);
      }
    }
    // the broad hipped roof over everything, a deep slate-blue fascia, a pale soffit
    k.roof.c = new THREE.Color(TILE);
    const ov = 0.9;
    hipRoof(k, (x, z) => [x - PO[0], z - PO[1]], x0 - ov, x1 + ov, z0 - ov, z1 + ov, e, 0.42, 'x', [{ gw: 0, tri: false }, { gw: 0, tri: false }], b.c, '#3c4652');
    b.c.push([b.B(x0 - ov, x1 + ov, e - 0.55, e, z0 - ov, z0 - ov + 0.12), '#3c4652'], [b.B(x0 - ov, x1 + ov, e - 0.55, e, z1 + ov - 0.12, z1 + ov), '#3c4652']);
    b.c.push([b.B(x0 - ov, x0 - ov + 0.12, e - 0.55, e, z0 - ov, z1 + ov), '#3c4652'], [b.B(x1 + ov - 0.12, x1 + ov, e - 0.55, e, z0 - ov, z1 + ov), '#3c4652']);
    b.c.push([b.B(x0 - ov, x1 + ov, e - 0.06, e, z0 - ov, z1 + ov), '#e9e2d3']);
    // the projecting covered entrance toward the avenue: a short gabled roof on two columns, steps down off the plinth
    const ex0 = 528.4, ex1 = 534.4, ez0 = z0 - 3.2;
    for (const x of [ex0 + 0.3, ex1 - 0.3]) { b.c.push([new THREE.CylinderGeometry(0.25, 0.28, e - y + 0.35, 14).translate(x - PO[0], (y + e) / 2 - 0.1, ez0 + 0.4 - PO[1]), '#efe9dc']); SOLIDS.add(x, ez0 + 0.4, 0.33); }
    hipRoof(k, (x, z) => [x - PO[0], z - PO[1]], ex0 - 0.5, ex1 + 0.5, ez0 - 0.4, z0 + 0.4, e + 0.25, 0.55, 'z', [{ gw: 99, tri: false }, { gw: 99, tri: false }], b.c, '#3c4652');
    gableTri(b, true, ez0 - 0.4, -1, ex0 - 0.5, ex1 + 0.5, e + 0.25, 0.55, '#e9e2d3', 0.12);
    for (let i = 0; i < 3; i++) stone.push([b.B(529.6, 533.2, y - 0.85, y - 0.85 + (3 - i) * 0.28, z0 - 0.9 - i * 0.35, z0 - 0.55 - i * 0.35), '#fff']);
    // the sign on its pale frame (only its heading is readable)
    const [sx, sz] = [520.6, 151.2];
    for (const dx of [-0.75, 0.75]) b.c.push([b.B(sx + dx - 0.06, sx + dx + 0.06, gh(sx, sz), gh(sx, sz) + 2.6, sz - 0.06, sz + 0.06), '#e8e6e0']);
    b.c.push([b.B(sx - 0.85, sx + 0.85, gh(sx, sz) + 1.0, gh(sx, sz) + 2.5, sz - 0.04, sz + 0.04), '#f4f3ef']);
    k.signs.push({ text: 'UNIVERSITY OF GHANA', x: sx - PO[0], y: gh(sx, sz) + 2.2, z: sz - 0.06 - PO[1], ry: Math.PI, w: 1.5, colors: ['#f4f3ef', '#1d3f7a'] });
    for (let i = 0; i < 6; i++) b.c.push([b.B(sx - 0.6, sx - 0.6 + 0.6 + (i % 3) * 0.25, gh(sx, sz) + 1.2 + i * 0.12, gh(sx, sz) + 1.24 + i * 0.12, sz - 0.06, sz - 0.05), '#8c9096']);
    SOLIDS.add(sx - 0.75, sz, 0.15); SOLIDS.add(sx + 0.75, sz, 0.15);
    // the ground round it: reddish earth, sparse grass and weeds, scattered stones; a brick path to the entrance
    k.meshes.push(new THREE.Mesh(drapeAt(PO, 513, 546, 145.5, 175, 0.5, 0.03, (x, z) => {
      if (x > x0 - 0.1 && x < x1 + 0.1 && z > z0 - 0.1 && z < z1 + 0.1) return null;
      if (Math.abs(x - 531.4) < 1.2 && z < z0 && z > 140) { const row = Math.floor(z / 0.11), col = Math.floor((x + (row % 2) * 0.11) / 0.22), t = hash(col, row) * 0.08; return [0.58 + t, 0.4 + t, 0.32]; }
      const n = vnoise(x * 0.35, z * 0.35), m = hash(Math.floor(x * 2), Math.floor(z * 2));
      return n > 0.55 ? [0.55, 0.38, 0.25] : m > 0.8 ? [0.45, 0.43, 0.28] : [0.36 + n * 0.1, 0.45 + n * 0.06, 0.22];
    }), groundCover()));
    for (let i = 0; i < 40; i++) {
      const x = 513 + hash(i, 11) * 33, z = 146 + hash(i, 13) * 28;
      if (x > x0 - 1 && x < x1 + 1 && z > z0 - 1 && z < z1 + 1) continue;
      const h = 0.3 + hash(i, 17) * 0.5;
      if (i % 4) tuft(b, x, z, h, ['#6b7a3a', '#55702f', '#7d8a44'][i % 3]); else b.c.push([new THREE.IcosahedronGeometry(0.15 + h * 0.4, 0).translate(x - PO[0], gh(x, z) + 0.1, z - PO[1]), '#9a958a']);
    }
    for (const [x, z, s] of [[541.5, 160.5, 1.1], [520.5, 166, 0.8], [537, 172.5, 0.7]] as [number, number, number][]) b.leaf.push([new THREE.IcosahedronGeometry(s, 1).scale(1.3, 0.9, 1.1).translate(x - PO[0], gh(x, z) + s * 0.6, z - PO[1]), '#3f6a2c']);
    for (const [x, z, h, s] of [[515, 147, 8, 12], [544, 148, 7.5, 11], [516, 174, 8, 13]] as [number, number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: s, seed: x * 2 + z, origin: PO });
    stoneMeshOf(k, stone);
    b.finish(k);
  },
};

// ---------- the white building above the roadside bank (pair 26) ----------
const WO: [number, number] = [611, 65.5];
const whiteSpec: Spec = {
  name: 'College of Education building above the bank', axis: [1, 0], origin: WO, storey: 3.3, style: PLAIN, roofColor: '#6d5a50', fascia: '#2f2a28', pitch: 0.55,
  replaces: [[611.1, 65.4]],
  onGround: true,
  blocks: [],
  keep: [[598 - WO[0], 626 - WO[0], 52 - WO[1], 80 - WO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(WO), [x0, x1, z0, z1] = EN.whiteHouse, y = gh(611, 65), e = y + 6.6, pitch = 0.55, ov = 0.6;
    // the main block, its ridge along z, its gable to the south (toward the road); the lower west part behind the
    // recessed side veranda, its roof offset lower
    const MB: R4 = [x0 + 3.2, x1, z0, z1], VB: R4 = [x0, x0 + 3.2, z0 + 2, z1 - 3.5];
    b.c.push([b.B(MB[0], MB[1], y - 0.6, e, MB[2], MB[3]), WALL]);
    b.c.push([b.B(VB[0], VB[1], y - 0.6, y + 0.3, VB[2], VB[3]), '#d8d2c6']);
    b.c.push([b.B(VB[0] + 1.6, VB[1], y, e - 0.6, VB[2], VB[3]), WALL]);
    // the side veranda: a balcony slab and parapet on the upper floor, posts, recessed openings behind
    b.c.push([b.B(VB[0], VB[0] + 1.6, y + 3.1, y + 3.3, VB[2], VB[3]), '#efece4'], [b.B(VB[0], VB[0] + 0.15, y + 3.3, y + 4.3, VB[2], VB[3]), '#f4f2ec']);
    for (let z = VB[2] + 0.2; z <= VB[3]; z += (VB[3] - VB[2] - 0.4) / 4) { b.c.push([b.B(VB[0] + 0.05, VB[0] + 0.35, y, e - 0.6, z - 0.15, z + 0.15), '#f4f2ec']); SOLIDS.add(VB[0] + 0.2, z, 0.25); }
    for (let z = VB[2] + 1.6; z < VB[3] - 1; z += 3) for (const yy of [y, y + 3.3]) b.door.push(b.plane(false, VB[0] + 1.58, -1, z, 1.1, yy, yy + 2.3));
    k.roof.c = new THREE.Color('#6d5a50');
    hipRoof(k, (x, z) => [x - WO[0], z - WO[1]], MB[0] - ov, MB[1] + ov, MB[2] - ov, MB[3] + ov, e - ov * pitch * 0.5, pitch, 'z', [{ gw: 0, tri: false }, { gw: 99, tri: false }], b.c, '#2f2a28');
    gableTri(b, true, MB[3], 1, MB[0] - ov, MB[1] + ov, e - ov * pitch * 0.5, pitch);
    hipRoof(k, (x, z) => [x - WO[0], z - WO[1]], VB[0] - 0.5, VB[1] + 0.2, VB[2] - 0.5, VB[3] + 0.5, e - 0.8, 0.35, 'z', [{ gw: 0, tri: false }, { gw: 0, tri: false }], b.c, '#2f2a28');
    // the gable end: sparse tall narrow openings, the sign board high on the right
    const S = facesOf(MB).z1;
    for (const [a, yy, h] of [[MB[0] + 2.6, y + 0.6, 2.2], [MB[0] + 2.6, y + 3.8, 1.8], [MB[1] - 4.4, y + 3.9, 1.0], [MB[0] + 6.5, y + 0.4, 2.3]] as [number, number, number][]) b.win.push(b.plane(true, S.at + 0.03, 1, a, 0.8, yy, yy + h));
    b.c.push([b.B(MB[1] - 6.6, MB[1] - 1.2, y + 3.4, y + 5.6, S.at, S.at + 0.08), '#f7f7f4']);
    k.signs.push({ text: 'UNIVERSITY OF GHANA', x: MB[1] - 3.9 - WO[0], y: y + 5.1, z: S.at + 0.09 - WO[1], ry: 0, w: 4.8, colors: ['#f7f7f4', '#1d3f7a'] });
    for (let i = 0; i < 4; i++) b.c.push([b.B(MB[1] - 6.0, MB[1] - 2.0 - (i % 2) * 0.8, y + 3.7 + i * 0.22, y + 3.8 + i * 0.22, S.at + 0.08, S.at + 0.09), '#2a4f8a']);
    openings(b, facesOf(MB).x1, 'W-W-W-W', y); openings(b, facesOf(MB).x1, 'W-W-W-W', y + 3.3);
    wallSolids(MB[0], MB[2], MB[1], MB[2]); wallSolids(MB[0], MB[3], MB[1], MB[3]); wallSolids(MB[1], MB[2], MB[1], MB[3]); wallSolids(VB[0], VB[2], VB[0], VB[3], 0.3);
    // the bank toward the road: long grass, exposed red soil, a kerb of stone at its foot
    k.meshes.push(new THREE.Mesh(drapeAt(WO, 598, 628, z1 + 0.2, 101, 0.5, 0.04, (x, z) => {
      const n = vnoise(x * 0.3, z * 0.3);
      return n > 0.72 ? [0.6, 0.38, 0.24] : [0.38 + n * 0.12, 0.47 + n * 0.08, 0.22];
    }), groundCover()));
    for (let i = 0; i < 160; i++) {
      const x = 599 + hash(i, 21) * 28, z = z1 + 1 + hash(i, 23) * 24, h = 0.5 + hash(i, 25) * 0.7;
      tuft(b, x, z, h, ['#7d8a44', '#6b7a3a', '#8a9450'][i % 3]);
    }
    for (const [x, z, s] of [[606, 78.5, 1.2], [624, 76, 1.5], [600.5, 60, 1.1]] as [number, number, number][]) b.leaf.push([new THREE.IcosahedronGeometry(s, 1).scale(1.3, 0.9, 1.1).translate(x - WO[0], gh(x, z) + s * 0.6, z - WO[1]), '#3f6a2c']);
    b.finish(k);
  },
};
void lowWing; void RED_BASE; void FASCIA;

export const iasSite = createSite('african-studies', [iasSpec, pavilionSpec, whiteSpec]);
