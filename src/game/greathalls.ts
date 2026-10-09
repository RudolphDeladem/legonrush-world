// Mensah Sarbah Hall, Akuafo Hall and Legon Hall, the halls round courts north and south of the
// avenue, modelled from the owner's photos and the UG layout aerials (block engine: blocks.ts). Their
// blocks are the mapped footprints, cut into rectangles (rectilinear.ts), each under its own tile
// hip roof; the entrance buildings are modelled from the photos.
//
// The halls are closed rings (owner's panoramas): every block is joined to the next, north, east,
// south and west. The mapped footprints leave gaps between them, so each gap up to 15 m between two
// facing blocks gets a joining block (`joins`); where a path runs through a gap, the join is a gateway
// raised over an open passage. The wider openings in the middle of the long courts stay open.
//
// Mensah Sarbah Hall: three-storey cross-shaped blocks (owner) round the court with the fountain,
// white with maroon window frames. The entrance (the owner's blue mark) is the Administration and
// Porters' Lodge on the north: two storeys, a hip roof with a small raised lantern, the gate in the
// middle of its front toward the semicircular drive, joined to the wings either side by lower links.
// Across the court on the south is the dining hall: one tall storey of seven louvred windows over a
// stone terrace and steps, a raised clerestory roof with the tall gold lantern, a doorway at each end,
// lower two-storey wings either side joined to the blocks (owner's photos and panorama).
//
// Akuafo Hall and Legon Hall, twins either side of the avenue: two-storey blocks (owner) in lanes and
// bars round long courts, white; Akuafo's base painted light green, Legon's cream (owner's photos). Each
// front block carries a loggia upstairs: three bays between white piers under a deep beam, brown louvred
// shutters (Akuafo) or dark barred windows (Legon) on its back wall, over a dark balcony ledge.
// Akuafo's ground floor stands forward under it: the gate (owner's blue mark) right of the middle with
// iron lattice gates and the lit hall inside, a lit window behind a grille, banners, flag poles; the gilded
// statue of the farmer and the hall's board in the garden to the east (yellow mark). Legon's ground floor is
// an arcade of three round arches, LEGON HALL with the crest over the middle one, the entrance in it (blue);
// a slab-paved forecourt with a flag pole, the raised planter with a fan palm and a big tree to the east.
import * as THREE from 'three';
import { BUILDINGS, NODE_XZ, ROADS, type Building } from './campusmap';
import { PAVE, WHITE, box } from './modelkit';
import { PL, createSite, louvre, render, slab, type Block, type Kit, type Spec, type Style } from './blocks';
import { garden } from './gardens';
import { rectsOf, type Rect } from './rectilinear';
import { AKUAFO_GALLERY, LEGON_GALLERY, galleryBlocks, galleryParts, type GalleryJob, type GalleryLook } from './galleries';

const ROOF = '#b85a37', FASCIA = '#5a3a2c', STONE = '#8f7a63';

/** white render, wooden louvred windows in maroon frames (Sarbah, owner photos: wooden, not glass) */
const SARBAH_WIN: Style = {
  bay: 3.2,
  up: [[76, 58, 104, 120]],
  ground: [[76, 256 + 62, 104, 120]],
  draw: (g) => {
    render(g, '#f7f6f1');
    louvre(g, [76, 58, 104, 120], '#7a2a24');
    slab(g, 238, 18);
    louvre(g, [76, 256 + 62, 104, 120], '#7a2a24');
  },
};
/** the lodge's court side: tall louvred windows in brown frames, one storey high (drawn across both floors) */
const LOUVRE = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#6b4a30'; g.fillRect(x - 6, y - 6, w + 12, h + 12);
  g.fillStyle = '#3a2a1e'; g.fillRect(x, y, w, h);
  g.fillStyle = '#8a6440';
  for (let t = y + 6; t < y + h; t += 12) g.fillRect(x + 4, t, w - 8, 5);
  g.fillStyle = '#6b4a30'; g.fillRect(x + w / 2 - 3, y, 6, h);
};
/** the dining hall's court side: one tall louvred window a bay, drawn through both floors so they read as one tall storey */
const DINING_TALL: Style = { bay: 4.2, up: [[70, 40, 116, 216]], ground: [[70, 256, 116, 220]], draw: (g) => { render(g, '#f8f7f3'); LOUVRE(g, 70, 40, 116, 436); } };
/** the dining hall's other faces: plain render with a high round window */
const DINING_PLAIN: Style = { bay: 4.2, up: [], ground: [], draw: (g) => { render(g, '#f8f7f3'); g.fillStyle = '#2b3440'; g.beginPath(); g.arc(128, 120, 26, 0, Math.PI * 2); g.fill(); } };
/** Akuafo and Legon: white render, wooden louvred windows (owner: wooden, not glass), the base painted (Akuafo light
 *  green, Legon cream) */
function twinWall(base: string): Style {
  return {
    bay: 3.2,
    up: [[74, 56, 108, 118]],
    ground: [[74, 256 + 60, 108, 118]],
    draw: (g) => {
      render(g, '#f5f4f0');
      louvre(g, [74, 56, 108, 118]);
      slab(g, 238, 18);
      louvre(g, [74, 256 + 60, 108, 118]);
      g.fillStyle = base; g.fillRect(0, 512 - 58, 256, 58);
      g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 512 - 60, 256, 2);
    },
  };
}
const AK_GREEN = '#a6d2b8', LG_CREAM = '#e4d5b2';
const AKUAFO_WALL = twinWall(AK_GREEN), LEGON_WALL = twinWall(LG_CREAM);
/** a brown louvred shutter window: slats in a dark frame, two leaves */
function shutter(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  g.fillStyle = '#2b211b'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  for (let t = y; t < y + h; t += 9) { g.fillStyle = '#6a4b35'; g.fillRect(x, t, w, 6); g.fillStyle = '#3d2c21'; g.fillRect(x, t + 6, w, 3); }
  g.fillStyle = '#2b211b'; g.fillRect(x + w / 2 - 2, y, 4, h);
}
/** Akuafo's front behind the loggia (owner's photos): upstairs the loggia's back wall, white, a brown louvred shutter
 *  window to a bay, shaded under the ceiling; downstairs (hidden by the porch block) the hall's wall */
const AK_LOGGIA: Style = {
  bay: 6.3,
  up: [[100, 56, 56, 120]],
  ground: [[74, 256 + 60, 108, 118]],
  draw: (g) => {
    AKUAFO_WALL.draw(g);
    g.fillStyle = '#f2f1ec'; g.fillRect(0, 0, 256, 238);
    const sh = g.createLinearGradient(0, 0, 0, 90); sh.addColorStop(0, 'rgba(70,64,56,0.35)'); sh.addColorStop(1, 'rgba(70,64,56,0)');
    g.fillStyle = sh; g.fillRect(0, 0, 256, 90);
    shutter(g, 100, 56, 56, 120);
  },
};
/** Legon's front behind the loggias and the arcade (owner's photos): upstairs the lit back wall of a loggia with two
 *  dark barred windows; downstairs the arcade's inner wall, white over cream, a lattice window lit from inside */
const LG_LOGGIA: Style = {
  bay: 6.33,
  up: [[46, 64, 54, 130], [156, 64, 54, 130]],
  ground: [[86, 256 + 50, 84, 130]],
  draw: (g) => {
    render(g, '#f6f6f3');
    for (const x of [46, 156]) {
      g.fillStyle = '#16191d'; g.fillRect(x - 4, 60, 62, 138);
      g.fillStyle = '#2b3138'; g.fillRect(x, 64, 54, 130);
      g.fillStyle = '#0d0f12'; for (let b = x + 6; b < x + 54; b += 8) g.fillRect(b, 64, 3, 130);
    }
    slab(g, 238, 18);
    g.fillStyle = LG_CREAM; g.fillRect(0, 256 + 150, 256, 106);
    g.fillStyle = '#121416'; g.fillRect(80, 256 + 44, 96, 142);
    g.fillStyle = '#cfe2ee'; g.fillRect(86, 256 + 50, 84, 130);
    g.fillStyle = '#121416';
    for (let x = 86; x < 170; x += 14) g.fillRect(x, 256 + 50, 3, 130);
    for (let y = 256 + 50; y < 256 + 180; y += 14) g.fillRect(86, y, 84, 3);
  },
};

/** the footprints in a box (larger than `min` m², not named in `skip`, not containing a `drop` point), as rings */
function footprints(x0: number, x1: number, z0: number, z1: number, min = 100, skip: RegExp | null = null, drop: [number, number][] = []) {
  const out: { b: Building; ring: [number, number][] }[] = [];
  for (const b of BUILDINGS) {
    const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
    if (cx < x0 || cx > x1 || cz < z0 || cz > z1 || (skip && b.name && skip.test(b.name))) continue;
    if (drop.some(([x, z]) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ)) continue;
    const ring: [number, number][] = [];
    for (let i = 0; i < b.pts.length; i += 2) ring.push([b.pts[i], b.pts[i + 1]]);
    let a = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
    if (Math.abs(a / 2) >= min) out.push({ b, ring });
  }
  return out;
}
/** a hall's pieces: rectangles (world) with their floors, and which footprint each came from */
interface Piece { r: Rect; floors: number; fp: number; extra?: Partial<Block> }
function piecesOf(fps: { ring: [number, number][] }[], floors: number, extra: Partial<Block> = {}, from = 0): Piece[] {
  return fps.flatMap(({ ring }, i) => rectsOf(ring).map((r) => ({ r, floors, fp: from + i, extra })));
}
/** a point inside each footprint (the middle of its biggest rectangle), for `replaces` */
function pointsOf(ps: Piece[]) {
  const best = new Map<number, Rect>();
  for (const { r, fp } of ps) { const b = best.get(fp); if (!b || (r[1] - r[0]) * (r[3] - r[2]) > (b[1] - b[0]) * (b[3] - b[2])) best.set(fp, r); }
  return [...best.values()].map((r) => [(r[0] + r[1]) / 2, (r[2] + r[3]) / 2] as [number, number]);
}
const overlaps = (a: Rect, b: Rect, e = 0.05) => a[0] < b[1] - e && b[0] < a[1] - e && a[2] < b[3] - e && b[2] < a[3] - e;
/** does a path or road cross the rectangle? (then a join over it is a gateway) */
function crossed(r: Rect) {
  const [x0, x1, z0, z1] = r;
  for (const road of ROADS) for (let i = 0; i < road.nodes.length - 1; i++) {
    const ax = NODE_XZ[road.nodes[i] * 2], az = NODE_XZ[road.nodes[i] * 2 + 1], bx = NODE_XZ[road.nodes[i + 1] * 2], bz = NODE_XZ[road.nodes[i + 1] * 2 + 1];
    if (Math.max(ax, bx) < x0 || Math.min(ax, bx) > x1 || Math.max(az, bz) < z0 || Math.min(az, bz) > z1) continue;
    for (let t = 0; t <= 1; t += 0.05) { const x = ax + (bx - ax) * t, z = az + (bz - az) * t; if (x > x0 && x < x1 && z > z0 && z < z1) return true; }
  }
  return false;
}
/**
 * The blocks joining a hall's pieces: between two pieces of different footprints that face each other
 * across a gap of up to `maxGap` m, over the width they share (a block end, 3 to 16 m), unless something
 * already stands in the gap. A join a path runs through is a gateway: raised over an open passage.
 */
function joins(ps: Piece[], maxGap = 15, avoid: Rect[] = []): { r: Rect; floors: number; gate: boolean }[] {
  const out: { r: Rect; floors: number; gate: boolean }[] = [];
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
    const a = ps[i], b = ps[j];
    if (a.fp === b.fp) continue;
    const [A, B] = [a.r, b.r];
    let r: Rect | null = null;
    const ox0 = Math.max(A[0], B[0]), ox1 = Math.min(A[1], B[1]), oz0 = Math.max(A[2], B[2]), oz1 = Math.min(A[3], B[3]);
    if (ox1 - ox0 >= 3 && ox1 - ox0 <= 16) {
      const g0 = A[3] <= B[2] ? A[3] : B[3] <= A[2] ? B[3] : NaN, g1 = A[3] <= B[2] ? B[2] : A[2];
      if (g1 - g0 > 0.2 && g1 - g0 <= maxGap) r = [ox0, ox1, g0, g1];
    } else if (oz1 - oz0 >= 3 && oz1 - oz0 <= 16) {
      const g0 = A[1] <= B[0] ? A[1] : B[1] <= A[0] ? B[1] : NaN, g1 = A[1] <= B[0] ? B[0] : A[0];
      if (g1 - g0 > 0.2 && g1 - g0 <= maxGap) r = [g0, g1, oz0, oz1];
    }
    if (!r || ps.some((p) => p !== a && p !== b && overlaps(p.r, r!)) || out.some((o) => overlaps(o.r, r!)) || avoid.some((v) => overlaps(v, r!))) continue;
    out.push({ r, floors: Math.min(a.floors, b.floors), gate: crossed(r) });
  }
  return out;
}
/** pieces and their joins as blocks in a frame at origin o; a gateway stands on an open passage 3.2 m high */
function blocksOf(ps: Piece[], o: [number, number], storey: number, joinFloors?: number, avoid: Rect[] = []) {
  const L = (r: Rect): Pick<Block, 'x0' | 'x1' | 'z0' | 'z1'> => ({ x0: r[0] - o[0], x1: r[1] - o[0], z0: r[2] - o[1], z1: r[3] - o[1] });
  const blocks: Block[] = ps.map((p) => ({ ...L(p.r), floors: p.floors, ...p.extra }));
  const js = joins(ps, 15, avoid);
  for (const j of js) {
    const floors = joinFloors ?? j.floors;
    blocks.push(j.gate ? { ...L(j.r), floors: Math.max(1, floors - 1), y: 3.2 } : { ...L(j.r), floors });
  }
  return { blocks, gates: js.filter((j) => j.gate).map((j) => L(j.r)), storey };
}
/** a gateway's open passage: a white lintel band and a dark soffit over it */
function gateways(k: Kit, gates: Pick<Block, 'x0' | 'x1' | 'z0' | 'z1'>[]) {
  for (const g of gates) {
    k.plain.push([box(g.x0, g.x1, 3.0, 3.25, g.z0, g.z1), '#3a3430']);
    k.plain.push([box(g.x0 - 0.05, g.x1 + 0.05, 3.0, 3.4, g.z0 - 0.05, g.z0 + 0.25), WHITE], [box(g.x0 - 0.05, g.x1 + 0.05, 3.0, 3.4, g.z1 - 0.25, g.z1 + 0.05), WHITE]);
  }
}
const inRect = (x: number, z: number, [x0, x1, z0, z1]: number[]) => x >= x0 && x <= x1 && z >= z0 && z <= z1;
const gs = garden([-220, 220, 140, 760]);

// ---------- Mensah Sarbah Hall ----------
const SO: [number, number] = [5, 645];
const wings = piecesOf(footprints(-80, 90, 580, 700, 400, /Dining|Lodge/), 3);
/** the Administration and Porters' Lodge, the entrance (map x -4.3..14.1, z 609.1..622.7), two storeys */
const LODGE: Rect = [-4.3, 14.1, 609.1, 622.7];
/** the dining hall: the tall hall (map x -16.1..23.1, z 699..721.2) and its two-storey wings either side */
const HALL: Rect = [-16.1, 23.1, 699, 721.2];
const sarbahPieces: Piece[] = [
  ...wings,
  // the lodge and its links to the wings are two storeys; the hall's two floors read as one tall storey
  { r: LODGE, floors: 2, fp: 100 },
  { r: HALL, floors: 2, fp: 101, extra: { faces: { z0: DINING_TALL, x0: DINING_PLAIN, x1: DINING_PLAIN, z1: DINING_PLAIN }, roof: 'none' } },
  { r: [-33.2, -16.1, 703.1, 714.5], floors: 2, fp: 101 },
  { r: [23.1, 38.5, 705.8, 714.5], floors: 2, fp: 101 },
];
const sarbahBlocks = blocksOf(sarbahPieces, SO, 3.3);
const sarbah: Spec = {
  name: 'Mensah Sarbah Hall',
  axis: [1, 0], origin: SO, storey: 3.3, style: SARBAH_WIN, roofColor: ROOF, fascia: FASCIA, pitch: 0.5,
  replaces: [...pointsOf(wings), [4.9, 616], [3.5, 710], [-25, 709], [30, 710]],
  blocks: sarbahBlocks.blocks,
  keep: [[-8 - SO[0], 18 - SO[0], 600 - SO[1], 609.1 - SO[1]], [-20 - SO[0], 27 - SO[0], 690 - SO[1], 699 - SO[1]]],
  extras: (k) => {
    gateways(k, sarbahBlocks.gates);
    const X = (x: number) => x - SO[0], Z = (z: number) => z - SO[1];
    // ----- the lodge: the gate in the middle of its front (owner's blue mark), a small raised lantern on its roof
    const lx = X((LODGE[0] + LODGE[1]) / 2), lz0 = Z(LODGE[2]), ltop = k.wallTop(2) + ((LODGE[3] - LODGE[2]) / 2 + 0.8) * 0.5;
    k.plain.push([box(lx - 1.8, lx + 1.8, 0, 3.4, lz0 - 0.04, lz0), '#2a2420']);
    k.plain.push([new THREE.CircleGeometry(1.8, 16, 0, Math.PI).rotateY(Math.PI).translate(lx, 3.4, lz0 - 0.05), '#2a2420']);
    for (let x = -1.6; x <= 1.61; x += 0.32) k.plain.push([box(lx + x - 0.03, lx + x + 0.03, 0.1, 3.3, lz0 - 0.1, lz0 - 0.06), '#6d6d6d']);
    k.plain.push([box(lx - 3, lx + 3, 0, 0.18, lz0 - 2.5, lz0), PAVE]);
    k.roof.c = new THREE.Color(ROOF);
    const cy = ltop - 0.9;
    k.plain.push([box(lx - 2.6, lx + 2.6, cy, cy + 1.0, Z(616) - 2, Z(616) + 2), WHITE]);
    k.roof.quad([lx - 3, cy + 1, Z(616) - 2.4], [lx + 3, cy + 1, Z(616) - 2.4], [lx + 2, cy + 1.8, Z(616)], [lx - 2, cy + 1.8, Z(616)]);
    k.roof.quad([lx + 3, cy + 1, Z(616) + 2.4], [lx - 3, cy + 1, Z(616) + 2.4], [lx - 2, cy + 1.8, Z(616)], [lx + 2, cy + 1.8, Z(616)]);
    k.plain.push([new THREE.CylinderGeometry(0.35, 0.45, 1.3, 8).translate(lx, cy + 2.4, Z(616)), '#c8a24a']);
    k.plain.push([new THREE.ConeGeometry(0.5, 0.7, 8).translate(lx, cy + 3.4, Z(616)), '#c8a24a']);
    // ----- the dining hall: hip roof, the raised clerestory and the tall gold lantern; stone terrace, steps, end doors
    const [hx0, hx1, hz0, hz1] = [X(HALL[0]), X(HALL[1]), Z(HALL[2]), Z(HALL[3])];
    const e = k.wallTop(2) + 0.6, hxm = (hx0 + hx1) / 2, hzm = (hz0 + hz1) / 2;
    k.plain.push([box(hx0, hx1, k.wallTop(2), e, hz0, hz1), WHITE]);
    const ox = 0.8, half = (hz1 - hz0) / 2 + ox, top = e + half * 0.45;
    k.roof.quad([hx0 - ox, e, hz0 - ox], [hx1 + ox, e, hz0 - ox], [hx1 + ox - half, top, hzm], [hx0 - ox + half, top, hzm]);
    k.roof.quad([hx1 + ox, e, hz1 + ox], [hx0 - ox, e, hz1 + ox], [hx0 - ox + half, top, hzm], [hx1 + ox - half, top, hzm]);
    k.roof.quad([hx0 - ox, e, hz1 + ox], [hx0 - ox, e, hz0 - ox], [hx0 - ox + half, top, hzm], [hx0 - ox + half, top, hzm]);
    k.roof.quad([hx1 + ox, e, hz0 - ox], [hx1 + ox, e, hz1 + ox], [hx1 + ox - half, top, hzm], [hx1 + ox - half, top, hzm]);
    for (const z of [hz0 - ox, hz1 + ox]) k.plain.push([box(hx0 - ox, hx1 + ox, e - 0.3, e + 0.03, z - 0.06, z + 0.06), FASCIA]);
    for (const x of [hx0 - ox, hx1 + ox]) k.plain.push([box(x - 0.06, x + 0.06, e - 0.3, e + 0.03, hz0 - ox, hz1 + ox), FASCIA]);
    const cy2 = top - 1.6;
    k.plain.push([box(hxm - 8, hxm + 8, cy2, cy2 + 2.0, hzm - 3, hzm + 3), '#2e2a27']);
    k.roof.quad([hxm - 8.6, cy2 + 2, hzm - 3.6], [hxm + 8.6, cy2 + 2, hzm - 3.6], [hxm + 6, cy2 + 3.4, hzm], [hxm - 6, cy2 + 3.4, hzm]);
    k.roof.quad([hxm + 8.6, cy2 + 2, hzm + 3.6], [hxm - 8.6, cy2 + 2, hzm + 3.6], [hxm - 6, cy2 + 3.4, hzm], [hxm + 6, cy2 + 3.4, hzm]);
    const ly = cy2 + 3.2;
    k.plain.push([box(hxm - 1.1, hxm + 1.1, ly, ly + 1.4, hzm - 1.1, hzm + 1.1), '#2e2a27']);
    for (let t = 0; t < 3; t++) {
      const r = 0.95 - t * 0.22, y = ly + 1.4 + t * 1.25;
      k.plain.push([new THREE.CylinderGeometry(r, r + 0.1, 0.9, 8).translate(hxm, y + 0.45, hzm), '#d9b13c']);
      k.plain.push([new THREE.CylinderGeometry(r + 0.2, r + 0.2, 0.12, 8).translate(hxm, y + 0.95, hzm), '#f2efe6']);
    }
    k.plain.push([new THREE.ConeGeometry(0.4, 1.4, 8).translate(hxm, ly + 5.6, hzm), '#d9b13c']);
    // the stone terrace and steps on the court side (owner's photo and panorama)
    k.plain.push([box(hx0 + 4, hx1 - 4, 0, 1.0, hz0 - 4.5, hz0 - 3.3), STONE]);
    k.plain.push([box(hx0 + 1, hx1 - 1, 0, 0.5, hz0 - 3.3, hz0), '#bfb3a2']);
    for (let i = 0; i < 3; i++) k.plain.push([box(hxm - 4 - i * 0.5, hxm + 4 + i * 0.5, 0, 0.5 - i * 0.16, hz0 - 4.5 - i * 0.45, hz0 - 3.3), PAVE]);
    // a doorway at each end of the court side (the owner's two blue marks)
    for (const x of [hx0 + 1.6, hx1 - 1.6]) {
      k.plain.push([box(x - 0.8, x + 0.8, 0, 2.7, hz0 - 0.05, hz0 - 0.01), '#2a2420']);
      k.plain.push([box(x - 1.1, x + 1.1, 2.7, 2.9, hz0 - 0.3, hz0), WHITE]);
    }
    // the fountain in the middle of the court (layout: the star-shaped basin), the walks to it, palms and bushes
    const fx = 7.6 - SO[0], fz = 640 - SO[1];
    k.plain.push([new THREE.CylinderGeometry(4.2, 4.2, 0.55, 8).translate(fx, 0.27, fz), '#e3dccd']);
    k.plain.push([new THREE.CylinderGeometry(3.6, 3.6, 0.1, 8).translate(fx, 0.56, fz), '#4f9cb8']);
    k.plain.push([new THREE.CylinderGeometry(0.5, 0.8, 1.8, 10).translate(fx, 0.9, fz), '#efe9dc']);
    k.plain.push([box(fx - 1.4, fx + 1.4, -0.25, 0.08, 622.7 - SO[1], 694 - SO[1]), '#cfc3b0']);
    k.plain.push([box(-14 - SO[0], 23 - SO[0], -0.25, 0.08, fz - 1.4, fz + 1.4), '#cfc3b0']);
    gs.reseed(11);
    gs.scatter(-14, 23, 626, 692, 14, (x, z) => (Math.abs(x - 7.6) > 3 && Math.abs(z - 640) > 6 ? gs.palm(k, x - SO[0], z - SO[1], 5 + gs.rand() * 2.5) : undefined));
    gs.scatter(-14, 23, 626, 692, 18, (x, z) => gs.bush(k, x - SO[0], z - SO[1], 0.6 + gs.rand() * 0.4));
  },
};

// ---------- Akuafo Hall and Legon Hall (twins) ----------
const TWIN_ST = 3.6;
/**
 * A twin hall: its footprints as blocks under tile hips, the base painted in `wall`; the foremost piece of the front
 * footprint takes `frontStyle` on its north face (the back of the loggias), the entrance model stands before it.
 * (Both fronts face north, so a viewer facing one has east on the left.)
 */
/** an outward face with the gallery upstairs (owner's purple lines): a world point inside the block, the face, and
 *  optionally the stretch of it (world, along the face) the gallery runs */
interface Gal { at: [number, number]; side: 'x0' | 'x1' | 'z0' | 'z1'; range?: [number, number] }
const twin = (name: string, o: [number, number], box_: [number, number, number, number], front: [number, number, number, number], skip: RegExp | null, drop: [number, number][], entrance: (k: Kit) => void, frontStyle: Style, wall: Style, roof: string, plinth: string, keep: [number, number, number, number][], min = 120, gals: Gal[] = [], look: GalleryLook = LEGON_GALLERY): Spec => {
  const fps = footprints(...box_, min, skip, drop).filter(({ b }) => !inRect((b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2, front));
  const fr = footprints(...front, 120);
  const frontPieces = piecesOf(fr, 2, {}, fps.length);
  // the piece standing furthest forward (the middle of the front, whose north face is behind the loggias)
  const fore = frontPieces.reduce((m, p) => (p.r[2] < m.r[2] - 0.01 || (Math.abs(p.r[2] - m.r[2]) < 0.01 && p.r[1] - p.r[0] > m.r[1] - m.r[0]) ? p : m), frontPieces[0]);
  fore.extra = { faces: { z0: frontStyle } };
  const ps = [...piecesOf(fps, 2), ...frontPieces];
  // (no join over Legon's gable block beside the front, modelled in chalets.ts)
  const bl = blocksOf(ps, o, TWIN_ST, undefined, [[-131.4, -116.7, 155.2, 182.6]]);
  // the galleries on the outward faces: each block split into its ground floor and the upper floor set back
  const jobs: GalleryJob[] = [];
  for (const g of gals) {
    const lx = g.at[0] - o[0], lz = g.at[1] - o[1];
    const i = bl.blocks.findIndex((b) => b.y === undefined && b.floors === 2 && lx > b.x0 && lx < b.x1 && lz > b.z0 && lz < b.z1);
    if (i < 0) throw new Error(`${name}: no block for the gallery at ${g.at}`);
    const off = g.side === 'z0' || g.side === 'z1' ? o[0] : o[1];
    const { blocks, job } = galleryBlocks(bl.blocks[i], g.side, TWIN_ST, look, wall, g.range && [g.range[0] - off, g.range[1] - off]);
    bl.blocks.splice(i, 1, ...blocks);
    jobs.push(job);
  }
  return {
    name, axis: [1, 0], origin: o, storey: TWIN_ST, style: wall, roofColor: roof, fascia: FASCIA, pitch: 0.5, plinth,
    replaces: pointsOf(ps),
    blocks: bl.blocks,
    keep,
    extras: (k) => { gateways(k, bl.gates); entrance(k); for (const j of jobs) galleryParts(k, j, look, { pitch: 0.5, fascia: FASCIA }); },
  };
};
const WHITE_T = '#f4f3ef', LEDGE = '#3a3532', IRON = '#1b1c1e';
/** a dark iron lattice (a grid of flat bars) filling a rectangle in the plane z (model frame), facing -z */
function lattice(k: Kit, x0: number, x1: number, y0: number, y1: number, z: number, cell = 0.22) {
  k.plain.push([box(x0, x1, y0, y0 + 0.05, z - 0.03, z), IRON], [box(x0, x1, y1 - 0.05, y1, z - 0.03, z), IRON]);
  for (let x = x0; x <= x1 + 1e-6; x += cell) k.plain.push([box(x - 0.02, x + 0.02, y0, y1, z - 0.03, z), IRON]);
  for (let y = y0; y <= y1 + 1e-6; y += cell) k.plain.push([box(x0, x1, y - 0.02, y + 0.02, z - 0.03, z), IRON]);
}
/** a flag pole at a model point */
const flagPole = (k: Kit, x: number, z: number, h = 9) => k.plain.push([new THREE.CylinderGeometry(0.05, 0.08, h, 8).translate(x, h / 2, z), '#d9d9d6'], [new THREE.SphereGeometry(0.1, 8, 6).translate(x, h + 0.05, z), '#c9b25a']);
/**
 * The loggia over a porch block (Akuafo, Legon): the front of the ground floor stands forward of the footprint from
 * F to P, its top the balcony with a dark ledge; piers rise from it to a deep beam under the eaves, framing three bays
 * whose back wall is the footprint's face (the front style's upper storey). Returns the heights.
 */
function loggia(k: Kit, x0: number, x1: number, F: number, P: number, endW: number, pierW: number) {
  const G = PL + TWIN_ST, eave = k.wallTop(2), bw = (x1 - x0) / 3;
  k.plain.push([box(x0 - 0.08, x1 + 0.08, G, G + 0.16, F - 0.1, P), LEDGE]);
  for (const [a, b] of [[x0, x0 + endW], [x1 - endW, x1], [x0 + bw - pierW / 2, x0 + bw + pierW / 2], [x0 + 2 * bw - pierW / 2, x0 + 2 * bw + pierW / 2]]) k.plain.push([box(a, b, G + 0.16, eave - 0.7, F, P), WHITE_T]);
  k.plain.push([box(x0 - 0.08, x1 + 0.08, eave - 0.7, eave, F - 0.05, P), WHITE_T]);
  k.plain.push([box(x0 - 0.1, x1 + 0.1, eave - 0.3, eave + 0.02, F - 0.11, F - 0.05), FASCIA]);
  k.plain.push([box(x0 - 0.1, x1 + 0.1, eave, eave + 0.04, F - 0.11, P - 0.6), FASCIA]);
  // the loggias' ceilings, a light in each
  for (let i = 0; i < 3; i++) k.plain.push([box(x0 + bw * i + 0.6, x0 + bw * (i + 1) - 0.6, eave - 0.73, eave - 0.7, F + 0.5, F + 0.62), '#fff6dc']);
  return { G, eave, bw };
}

const AO: [number, number] = [157, 165];
const AK_ROOF = '#b4532f';
// the front block's middle (x 147.9..167, north face z 156.2) carries the loggia; its porch stands 1.6 m forward
const AK = { x0: 147.9 - AO[0], x1: 167 - AO[0], P: 156.2 - AO[1], F: 154.6 - AO[1] };
export const akuafo = twin('Akuafo Hall Main', AO, [85, 215, 150, 390], [140, 175, 154, 174], null, [], (k) => {
  const { x0, x1, P, F } = AK, xm = (x0 + x1) / 2;
  const X = (x: number) => x - AO[0], Z = (z: number) => z - AO[1];
  // the porch block: white over a light green base (owner's photos)
  k.plain.push([box(x0, x1, 1.15, PL + TWIN_ST, F, P), WHITE_T], [box(x0 - 0.02, x1 + 0.02, 0, 1.15, F - 0.02, P), AK_GREEN]);
  loggia(k, x0, x1, F, P, 0.9, 0.7);
  const f = F - 0.01;
  // the gate (owner's blue mark), right of the middle as seen from the car park (west): a white surround, the lit hall inside, iron lattice gates
  // folded back either side, a step; a lamp over it and a small plaque
  const d0 = xm - 3.4, d1 = xm - 0.4;
  k.plain.push([box(d0 - 0.2, d1 + 0.2, 0, 2.95, f - 0.05, f), '#fbfaf6']);
  k.plain.push([box(d0, d1, 0.12, 2.8, f - 0.06, f - 0.05), '#9fd8c6']);
  k.plain.push([box(d0 + 0.6, d1 - 0.6, 0.12, 2.0, f - 0.065, f - 0.06), '#e8d8a8']);
  lattice(k, d0, d0 + 0.7, 0.12, 2.8, f - 0.07);
  lattice(k, d1 - 0.7, d1, 0.12, 2.8, f - 0.07);
  k.plain.push([box(d0 - 0.4, d1 + 0.4, 0, 0.14, f - 0.9, f), '#bdb6aa']);
  k.plain.push([box((d0 + d1) / 2 - 0.35, (d0 + d1) / 2 + 0.35, 3.05, 3.2, f - 0.25, f), '#fffbe6']);
  k.plain.push([box((d0 + d1) / 2 - 0.4, (d0 + d1) / 2 + 0.4, 3.4, 3.85, f - 0.07, f - 0.05), '#d8d4ca']);
  // the lit window left of the gate behind its iron grille, and a small one on the right
  k.plain.push([box(xm + 3.0, xm + 6.4, 1.0, 2.75, f - 0.05, f), '#fbfaf6'], [box(xm + 3.2, xm + 6.2, 1.15, 2.6, f - 0.06, f - 0.05), '#eef4ef']);
  lattice(k, xm + 3.2, xm + 6.2, 1.6, 2.6, f - 0.07, 0.18);
  k.plain.push([box(xm - 8.2, xm - 7.3, 1.0, 2.5, f - 0.05, f), '#eef4ef']);
  for (const x of [xm + 7.2, xm + 1.6, xm - 4.4, xm - 9.0]) k.plain.push([box(x - 0.08, x + 0.08, 3.0, 3.18, f - 0.14, f), '#ece9e0']);
  // banners: the hall week hanging over the balcony on the left, the farmers' expo on the right, the 70th anniversary
  // stand before the left window
  k.plain.push([box(xm + 2.8, xm + 6.6, 2.85, 4.75, f - 0.12, f - 0.08), '#2f5b3e']);
  k.signs.push({ text: 'AKUAFO HALL WEEK', x: xm + 4.7, y: 3.8, z: f - 0.13, ry: Math.PI, w: 3.4, colors: ['#2f5b3e', '#f0e7c8'] });
  k.plain.push([box(xm - 6.8, xm - 5.0, 1.55, 4.7, f - 0.12, f - 0.08), '#e9eadf']);
  k.signs.push({ text: 'FARMERS EXPO', x: xm - 5.9, y: 4.1, z: f - 0.13, ry: Math.PI, w: 1.6, colors: ['#2e7d3a', '#ffffff'] });
  k.plain.push([box(xm + 3.1, xm + 6.1, 0.05, 1.6, f - 0.42, f - 0.36), '#f3f3ef']);
  k.signs.push({ text: 'AKUAFO HALL @ 70', x: xm + 4.6, y: 1.2, z: f - 0.43, ry: Math.PI, w: 2.8, colors: ['#f3f3ef', '#2f7d3a'] });
  k.plain.push([new THREE.CylinderGeometry(0.22, 0.17, 0.45, 10).translate(d1 + 0.6, 0.22, f - 0.4), '#ece6d8'], [new THREE.IcosahedronGeometry(0.3, 0).translate(d1 + 0.6, 0.7, f - 0.4), '#4f8a35']);
  // the paved walk along the front, grey pavers
  k.plain.push([box(X(139), X(176), 0, 0.05, F - 1.6, F), '#9a958c']);
  // flag poles either end of the porch
  flagPole(k, X(145.6), F - 1.0); flagPole(k, X(169.2), F - 1.0);
  // the iron lattice gate between the front block and its west neighbour
  lattice(k, X(137.9), X(141.6), 0, 2.4, Z(158.5), 0.3);
  k.plain.push([box(X(137.7), X(137.9), 0, 2.6, Z(158.3), Z(158.6)), WHITE_T], [box(X(141.6), X(141.8), 0, 2.6, Z(158.3), Z(158.6)), WHITE_T]);
  // the statue of the farmer east of the front (owner's yellow mark): gilded, a hoe over his shoulder, on a plinth
  const sx = X(176.4), sz = Z(153.2), gold = '#b6a13a';
  k.plain.push([box(sx - 0.6, sx + 0.6, 0, 0.9, sz - 0.6, sz + 0.6), '#d9d4c8'], [box(sx - 0.7, sx + 0.7, 0.9, 1.0, sz - 0.7, sz + 0.7), '#bfb8aa']);
  k.plain.push([new THREE.CylinderGeometry(0.13, 0.15, 0.95, 8).translate(sx - 0.14, 1.48, sz), gold], [new THREE.CylinderGeometry(0.13, 0.15, 0.95, 8).translate(sx + 0.14, 1.48, sz), gold]);
  k.plain.push([new THREE.CylinderGeometry(0.3, 0.26, 0.85, 10).translate(sx, 2.35, sz), gold], [new THREE.SphereGeometry(0.17, 12, 10).translate(sx, 2.95, sz), gold]);
  k.plain.push([new THREE.CylinderGeometry(0.07, 0.07, 0.8, 6).rotateZ(0.3).translate(sx - 0.38, 2.3, sz), gold], [new THREE.CylinderGeometry(0.07, 0.07, 0.75, 6).rotateZ(-2.6).translate(sx + 0.34, 2.75, sz), gold]);
  k.plain.push([new THREE.CylinderGeometry(0.035, 0.035, 1.6, 6).rotateZ(0.9).translate(sx + 0.55, 3.1, sz - 0.05), '#7d6a2a'], [box(sx + 1.05, sx + 1.3, 3.35, 3.7, sz - 0.08, sz - 0.02), '#7d6a2a']);
  // the hall's board east of the statue: UNIVERSITY OF GHANA, AKUAFO HALL, the crests, on two white posts
  const bx = X(181.5), bz = Z(151.6);
  for (const s of [-1, 1]) k.plain.push([box(bx + s * 1.6 - 0.1, bx + s * 1.6 + 0.1, 0, 3.4, bz - 0.1, bz + 0.1), '#f3f3f0']);
  k.plain.push([box(bx - 2.0, bx + 2.0, 1.4, 3.6, bz - 0.06, bz + 0.06), '#f7f7f4']);
  k.plain.push([box(bx - 1.85, bx - 1.25, 2.7, 3.4, bz - 0.08, bz - 0.06), '#1d3f7a'], [box(bx - 1.85, bx - 1.25, 1.65, 2.35, bz - 0.08, bz - 0.06), '#2f6a9a']);
  k.signs.push({ text: 'UNIVERSITY OF GHANA', x: bx + 0.35, y: 3.05, z: bz - 0.08, ry: Math.PI, w: 2.9, colors: ['#f7f7f4', '#1d3f7a'] });
  k.signs.push({ text: 'AKUAFO HALL', x: bx + 0.2, y: 2.1, z: bz - 0.08, ry: Math.PI, w: 2.5, colors: ['#f7f7f4', '#1d3f7a'] });
  // the garden round the statue and the board: flowering bushes, a low rail, a tree
  gs.reseed(31);
  for (const [x, z] of [[174.5, 151.2], [178.4, 151.6], [179.5, 154.4], [183.8, 154.2], [175.2, 155.6]]) gs.bush(k, X(x), Z(z), 0.7);
  k.plain.push([box(X(174), X(186), 0.85, 0.9, Z(149.6), Z(149.7)), '#8a8d90']);
  for (const x of [174, 177, 180, 183, 186]) k.plain.push([box(X(x) - 0.03, X(x) + 0.03, 0, 0.9, Z(149.6), Z(149.7)), '#8a8d90']);
  gs.tree(k, X(186.5), Z(156.5), 1.3);
  // the fountain court behind
  const fz = 185 - AO[1];
  k.plain.push([new THREE.CylinderGeometry(7, 7, 0.5, 32).translate(0, 0.25, fz), '#cfc6b6']);
  k.plain.push([new THREE.CylinderGeometry(5.6, 5.6, 0.12, 32).translate(0, 0.52, fz), '#4f9cb8']);
  k.plain.push([new THREE.CylinderGeometry(0.6, 0.9, 1.6, 12).translate(0, 0.8, fz), '#e8e2d6']);
  k.plain.push([new THREE.CylinderGeometry(1.4, 0.4, 0.4, 14).translate(0, 1.7, fz), '#e8e2d6']);
  greenCourts(k, AO, [[128, 186, 222, 287], [128, 186, 301, 351]]);
  // (the small blocks in and round the south courts are part of the hall too, white like the rest: owner)
}, AK_LOGGIA, AKUAFO_WALL, AK_ROOF, '#8fc0a3', [[147.9 - 157, 167 - 157, 152.8 - 165, 156.2 - 165], [172 - 157, 189 - 157, 148 - 165, 157 - 165]], 60, [
  // the outward faces with galleries (owner's purple lines on the aerial; picture 2)
  { at: [90, 165], side: 'z0' }, { at: [90, 216], side: 'z1' }, { at: [210, 190], side: 'x1' }, { at: [210, 209], side: 'x1' },
  { at: [130, 255], side: 'x0' }, { at: [182, 255], side: 'x1' }, { at: [130, 325], side: 'x0' }, { at: [182, 325], side: 'x1' },
  { at: [138, 357], side: 'z1', range: [136.6, 150.3] }, { at: [155, 357], side: 'z1' }, { at: [170, 358], side: 'z1', range: [161.4, 176.8] },
], AKUAFO_GALLERY);

const LO: [number, number] = [-147, 165];
const LG_ROOF = '#8c4a32';
const LG = { x0: -156.7 - LO[0], x1: -137.7 - LO[0], P: 156.6 - LO[1], F: 154.6 - LO[1] };
// (the hall mirrors Akuafo across the avenue's axis; the satellite-detected outline at (-82, 378) is not part of it)
// (the gable block east of the front, at (-122.3, 168.9), is modelled from the owner's photo in chalets.ts)
export const legon = twin('Legon Hall', LO, [-215, -50, 150, 390], [-165, -129, 154, 174], /Maison/, [[-82, 378], [-122.3, 168.9]], (k) => {
  const { x0, x1, P, F } = LG, xm = (x0 + x1) / 2;
  const X = (x: number) => x - LO[0], Z = (z: number) => z - LO[1];
  const G = PL + TWIN_ST, r = 1.75, spring = 1.35, bw = (x1 - x0) / 3;
  // the arcade's front wall (owner's photos): three round arches, white over a cream base, 0.45 m thick
  const sh = new THREE.Shape();
  sh.moveTo(x0, 0); sh.lineTo(x0, G); sh.lineTo(x1, G); sh.lineTo(x1, 0);
  for (let i = 2; i >= 0; i--) {
    const c = x0 + bw * (i + 0.5);
    sh.lineTo(c + r, 0); sh.lineTo(c + r, spring); sh.absarc(c, spring, r, 0, Math.PI, false); sh.lineTo(c - r, 0);
  }
  sh.lineTo(x0, 0);
  const wallGeo = new THREE.ExtrudeGeometry(sh, { depth: 0.45, bevelEnabled: false, curveSegments: 18 }).translate(0, 0, F);
  k.plain.push([wallGeo, '#f1f0eb']);
  // the cream base on the piers between the arches, front and inside faces
  const piers: [number, number][] = [[x0, x0 + bw * 0.5 - r]];
  for (let i = 0; i < 2; i++) piers.push([x0 + bw * (i + 0.5) + r, x0 + bw * (i + 1.5) - r]);
  piers.push([x0 + bw * 2.5 + r, x1]);
  for (const [a, b] of piers) k.plain.push([box(a - 0.01, b + 0.01, 0, 1.3, F - 0.02, F + 0.47), LG_CREAM]);
  // the arcade: a tiled floor a step up, a ceiling with lights
  k.plain.push([box(x0, x1, 0, 0.15, F, P), '#cbc4b4'], [box(x0 + 0.4, x1 - 0.4, G - 0.12, G, F + 0.45, P), '#f6f5f1']);
  for (let i = 0; i < 3; i++) k.plain.push([box(x0 + bw * (i + 0.5) - 0.6, x0 + bw * (i + 0.5) + 0.6, G - 0.15, G - 0.12, F + 1.2, F + 1.3), '#fff8e2']);
  loggia(k, x0, x1, F, P, 1.2, 0.9);
  // LEGON HALL over the middle arch: black letters board lit from behind, the crest between the words, EST. 1952 below
  const f = F - 0.01;
  k.plain.push([box(xm - 2.9, xm + 2.9, spring + r + 0.15, spring + r + 0.85, f - 0.1, f), '#141414']);
  k.signs.push({ text: 'LEGON', x: xm + 1.6, y: spring + r + 0.5, z: f - 0.11, ry: Math.PI, w: 2.0, colors: ['#141414', '#ffffff'] });
  k.signs.push({ text: 'HALL', x: xm - 1.6, y: spring + r + 0.5, z: f - 0.11, ry: Math.PI, w: 1.6, colors: ['#141414', '#ffffff'] });
  k.plain.push([box(xm - 0.42, xm + 0.42, spring + r + 0.05, spring + r + 1.0, f - 0.14, f - 0.1), '#c9dcef'], [box(xm - 0.3, xm + 0.3, spring + r + 0.15, spring + r + 0.9, f - 0.15, f - 0.14), '#3a6a9a']);
  // lights over the side arches and under the balcony
  for (const x of [xm - bw, xm + bw]) k.plain.push([box(x - 0.8, x + 0.8, spring + r + 0.35, spring + r + 0.45, f - 0.08, f), '#fffbea']);
  // the entrance in the middle arch (owner's blue mark): the lit hall inside, a black lattice gate, a mat, a step
  k.plain.push([box(xm - 1.2, xm + 1.2, 0.15, 2.9, P - 0.08, P - 0.02), '#4f9fd8']);
  k.plain.push([box(xm - 1.0, xm + 0.2, 0.15, 2.6, P - 0.1, P - 0.08), '#e8edf2']);
  lattice(k, xm + 0.2, xm + 1.2, 0.15, 2.9, P - 0.1, 0.2);
  lattice(k, xm - 1.2, xm + 1.2, 2.3, 2.9, P - 0.09, 0.2);
  k.plain.push([box(xm - 1.3, xm + 1.3, 0.15, 0.17, F + 0.5, P), '#55524f']);
  k.plain.push([box(x0, x1, 0, 0.08, F - 0.5, F), '#bfb7a7']);
  // the paved forecourt of square slabs before it
  k.plain.push([box(X(-166), X(-128), 0, 0.04, Z(141), F - 0.5), '#c7bfae']);
  for (let x = -166; x <= -128; x += 1.2) k.plain.push([box(X(x) - 0.02, X(x) + 0.02, 0.04, 0.045, Z(141), F - 0.5), '#a59d8d']);
  for (let z = 141; z <= 154; z += 1.2) k.plain.push([box(X(-166), X(-128), 0.04, 0.045, Z(z) - 0.02, Z(z) + 0.02), '#a59d8d']);
  // the flag pole on the forecourt, west of the middle; RESERVED signs; the welcome banner stand
  flagPole(k, X(-143.4), Z(150.5), 10);
  for (const [x, z] of [[-150.2, 146.5], [-142.4, 146.8]]) k.plain.push([new THREE.BoxGeometry(0.9, 0.6, 0.05).rotateX(0.3).translate(X(x), 0.55, Z(z)), '#3e4d5c'], [new THREE.BoxGeometry(0.9, 0.6, 0.05).rotateX(-0.3).translate(X(x), 0.55, Z(z) + 0.3), '#3e4d5c']);
  k.plain.push([box(X(-139.3), X(-138.3), 0, 2.1, Z(153.0), Z(153.1)), '#f2f2ee']);
  k.signs.push({ text: 'APOSA-LEGON', x: X(-138.8), y: 1.8, z: Z(152.99), ry: Math.PI, w: 0.95, colors: ['#1d3f7a', '#ffffff'] });
  // the raised planter east of the front, before the gap to the east block (owner's photos): a low dark stone wall
  // round a fan palm and bushes, a bench; a hedge before the east block's gable; a big tree beyond
  const P0 = -136.6, P1 = -129.2, Q0 = 146.5, Q1 = 154.5;
  k.plain.push([box(X(P0), X(P1), 0, 0.7, Z(Q0), Z(Q0) + 0.4), '#56524d'], [box(X(P0), X(P1), 0, 0.7, Z(Q1) - 0.4, Z(Q1)), '#56524d']);
  k.plain.push([box(X(P0), X(P0) + 0.4, 0, 0.7, Z(Q0), Z(Q1)), '#56524d'], [box(X(P1) - 0.4, X(P1), 0, 0.7, Z(Q0), Z(Q1)), '#56524d']);
  k.plain.push([box(X(P0) + 0.4, X(P1) - 0.4, 0, 0.5, Z(Q0) + 0.4, Z(Q1) - 0.4), '#4a3b2c']);
  gs.reseed(17);
  gs.palm(k, X(-133.2), Z(150.4), 6.5);
  for (const [x, z] of [[-135.2, 148.2], [-130.8, 152.6], [-131, 148.4]]) gs.bush(k, X(x), Z(z), 0.8);
  gs.hedge(k, X(-127.6), Z(153.6), X(-117.2), Z(153.6));
  k.plain.push([box(X(-128.4), X(-126.4), 0.35, 0.45, Z(148), Z(148.5)), '#a89e90'], [box(X(-128.3), X(-128.1), 0, 0.35, Z(148), Z(148.5)), '#8a8178'], [box(X(-126.7), X(-126.5), 0, 0.35, Z(148), Z(148.5)), '#8a8178']);
  gs.tree(k, X(-121), Z(146.5), 1.9);
  gs.palm(k, X(-160), Z(151), 8);
  greenCourts(k, LO, [[-175, -119, 222, 287], [-175, -119, 298, 350]]);
}, LG_LOGGIA, LEGON_WALL, LG_ROOF, '#d4c29a', [[-166 - -147, -128 - -147, 141 - 165, 156.6 - 165], [-137 - -147, -128.8 - -147, 146 - 165, 155 - 165]], 85, [
  // the outward faces with galleries (owner's purple lines on the aerial; picture 3)
  { at: [-195, 156], side: 'z0' }, { at: [-198.5, 168], side: 'x0' }, { at: [-199, 192], side: 'x0' }, { at: [-194, 214], side: 'z1' },
  { at: [-82, 164], side: 'z0' }, { at: [-84, 213], side: 'z1' },
  { at: [-173, 250], side: 'x0' }, { at: [-122, 255], side: 'x1' }, { at: [-172, 320], side: 'x0' }, { at: [-122, 325], side: 'x1' },
  { at: [-160, 355], side: 'z1', range: [-166.8, -152.2] }, { at: [-130, 356], side: 'z1', range: [-141.9, -126.6] },
], LEGON_GALLERY);

/** the long courts between the lanes: a walk down the middle, lawns, palms and bushes */
function greenCourts(k: Kit, o: [number, number], courts: [number, number, number, number][]) {
  gs.reseed(Math.round(o[0]));
  for (const [x0, x1, z0, z1] of courts) {
    const xm = (x0 + x1) / 2 - o[0];
    k.plain.push([box(xm - 1.6, xm + 1.6, -0.25, 0.08, z0 - o[1], z1 - o[1]), '#cfc3b0']);
    for (let z = z0 + 4; z < z1 - 2; z += 9) for (const s of [-1, 1]) gs.palm(k, xm + s * 6 - 0, z - o[1], 5.5 + gs.rand() * 2);
    gs.scatter(x0 + 2, x1 - 2, z0 + 2, z1 - 2, 10, (x, z) => gs.bush(k, x - o[0], z - o[1], 0.6 + gs.rand() * 0.4));
  }
}

/** Mensah Sarbah Hall, Akuafo Hall and Legon Hall */
export const greatHalls = createSite('great-halls', [sarbah, akuafo, legon]);
