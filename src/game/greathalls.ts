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
// bars round long courts. Akuafo's entrance is the gatehouse on the north with a row of square windows
// under deep eaves, dark doors between white piers over a teal base, the gate (owner's blue mark) into
// the fountain court; Legon's is its north block, three arches on the ground floor with the entrance in
// the middle one (blue), a recessed balcony above, banners.
import * as THREE from 'three';
import { BUILDINGS, NODE_XZ, ROADS, type Building } from './campusmap';
import { PAVE, WHITE, box } from './modelkit';
import { PL, createSite, render, slab, window_, type Block, type Kit, type Spec, type Style } from './blocks';
import { garden } from './gardens';
import { rectsOf, type Rect } from './rectilinear';

const ROOF = '#b85a37', FASCIA = '#5a3a2c', STONE = '#8f7a63';

/** white render, dark windows in maroon frames (Sarbah, owner photo) */
const SARBAH_WIN: Style = {
  bay: 3.2,
  up: [[76, 58, 104, 120]],
  ground: [[76, 256 + 62, 104, 120]],
  draw: (g) => {
    render(g, '#f7f6f1');
    window_(g, [76, 58, 104, 120], '#7a2a24', 2, 0.3);
    slab(g, 238, 18);
    window_(g, [76, 256 + 62, 104, 120], '#7a2a24', 2, 0.3);
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
/** Akuafo and Legon: white render, dark windows in white frames */
const TWIN_WIN: Style = {
  bay: 3.2,
  up: [[74, 56, 108, 118]],
  ground: [[74, 256 + 60, 108, 118]],
  draw: (g) => {
    render(g, '#f7f6f2');
    window_(g, [74, 56, 108, 118], '#ecebe6', 2, 0.3);
    slab(g, 238, 18);
    window_(g, [74, 256 + 60, 108, 118], '#ecebe6', 2, 0.3);
    g.fillStyle = '#d6d0c4'; g.fillRect(0, 490, 256, 22);
  },
};
/** Akuafo's gatehouse: square dark windows above, dark doors between white piers over a teal base (owner photo) */
const AKUAFO_FRONT: Style = {
  bay: 3.0,
  up: [[64, 70, 128, 110]],
  ground: [[56, 256 + 40, 144, 200]],
  draw: (g) => {
    render(g, '#f7f6f2');
    window_(g, [64, 70, 128, 110], '#2f2a26', 3, 0);
    slab(g, 238, 18);
    g.fillStyle = '#3a2c22'; g.fillRect(56, 256 + 40, 144, 216);
    g.fillStyle = '#5a4434'; for (let x = 66; x < 196; x += 22) g.fillRect(x, 256 + 50, 14, 200);
    g.fillStyle = '#58b5a6'; g.fillRect(0, 440, 56, 72); g.fillRect(200, 440, 56, 72);
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
function joins(ps: Piece[], maxGap = 15): { r: Rect; floors: number; gate: boolean }[] {
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
    if (!r || ps.some((p) => p !== a && p !== b && overlaps(p.r, r!)) || out.some((o) => overlaps(o.r, r!))) continue;
    out.push({ r, floors: Math.min(a.floors, b.floors), gate: crossed(r) });
  }
  return out;
}
/** pieces and their joins as blocks in a frame at origin o; a gateway stands on an open passage 3.2 m high */
function blocksOf(ps: Piece[], o: [number, number], storey: number, joinFloors?: number) {
  const L = (r: Rect): Pick<Block, 'x0' | 'x1' | 'z0' | 'z1'> => ({ x0: r[0] - o[0], x1: r[1] - o[0], z0: r[2] - o[1], z1: r[3] - o[1] });
  const blocks: Block[] = ps.map((p) => ({ ...L(p.r), floors: p.floors, ...p.extra }));
  const js = joins(ps);
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
const twin = (name: string, o: [number, number], box_: [number, number, number, number], front: [number, number, number, number], skip: RegExp | null, drop: [number, number][], entrance: (k: Kit) => void, frontStyle: Style, min = 120): Spec => {
  const fps = footprints(...box_, min, skip, drop).filter(({ b }) => !inRect((b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2, front));
  const fr = footprints(...front, 120);
  const ps = [...piecesOf(fps, 2), ...piecesOf(fr, 2, { faces: { z0: frontStyle } }, fps.length)];
  const bl = blocksOf(ps, o, 3.3);
  return {
    name, axis: [1, 0], origin: o, storey: 3.3, style: TWIN_WIN, roofColor: ROOF, fascia: FASCIA, pitch: 0.5,
    replaces: pointsOf(ps),
    blocks: bl.blocks,
    keep: [],
    extras: (k) => { gateways(k, bl.gates); entrance(k); },
  };
};
const AO: [number, number] = [157, 165];
const akuafo = twin('Akuafo Hall Main', AO, [85, 215, 150, 390], [140, 175, 154, 174], null, [], (k) => {
  // the gate into the fountain court (owner's blue mark) on the north face of the gatehouse, z 156.3
  const z = 156.3 - AO[1];
  k.plain.push([box(-1.6, 1.6, 0, 3.0, z - 0.06, z - 0.02), '#2a221c']);
  k.plain.push([box(-1.9, 1.9, 3.0, 3.25, z - 0.1, z), WHITE]);
  k.plain.push([box(-4, 4, 0, 0.12, z - 5, z), '#b7a58c']);
  // the fountain court behind it
  const fz = 185 - AO[1];
  k.plain.push([new THREE.CylinderGeometry(7, 7, 0.5, 32).translate(0, 0.25, fz), '#cfc6b6']);
  k.plain.push([new THREE.CylinderGeometry(5.6, 5.6, 0.12, 32).translate(0, 0.52, fz), '#4f9cb8']);
  k.plain.push([new THREE.CylinderGeometry(0.6, 0.9, 1.6, 12).translate(0, 0.8, fz), '#e8e2d6']);
  k.plain.push([new THREE.CylinderGeometry(1.4, 0.4, 0.4, 14).translate(0, 1.7, fz), '#e8e2d6']);
  greenCourts(k, AO, [[128, 186, 222, 287], [128, 186, 301, 351]]);
  // (the small blocks in and round the south courts are part of the hall too, white like the rest: owner)
}, AKUAFO_FRONT, 60);

const LO: [number, number] = [-147, 165];
// (the hall mirrors Akuafo across the avenue's axis; the satellite-detected outline at (-82, 378) is not part of it)
const legon = twin('Legon Hall', LO, [-215, -50, 150, 390], [-165, -129, 154, 174], /Maison/, [[-82, 378]], (k) => {
  // the north front (z 156.6): three arches on the ground floor, the entrance in the middle one (owner's blue mark),
  // a recessed balcony above, banners either side
  const z = 156.6 - LO[1];
  for (const x of [-5, 0, 5]) {
    k.plain.push([box(x - 1.6, x + 1.6, 0, 2.4, z - 0.05, z - 0.01), x === 0 ? '#2a221c' : '#3d3632']);
    k.plain.push([new THREE.CircleGeometry(1.6, 16, 0, Math.PI).rotateY(Math.PI).translate(x, 2.4, z - 0.05), x === 0 ? '#2a221c' : '#3d3632']);
  }
  k.plain.push([box(-7.5, 7.5, PL + 3.3 + 0.1, PL + 3.3 + 0.25, z - 1.2, z), WHITE]);
  k.plain.push([box(-7.5, 7.5, PL + 3.3 + 0.25, PL + 3.3 + 1.2, z - 1.25, z - 1.15), WHITE]);
  for (const [x, c] of [[-7.8, '#2e7d4f'], [4.6, '#c98a2b'], [6.6, '#2f5d9a']] as [number, string][]) k.plain.push([box(x - 0.8, x + 0.8, 4.2, 7.0, z - 0.12, z - 0.08), c]);
  k.plain.push([box(-9, 9, 0, 0.1, z - 9, z), '#c9b8a0']);
  greenCourts(k, LO, [[-175, -119, 222, 287], [-175, -119, 298, 350]]);
}, TWIN_WIN);

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
