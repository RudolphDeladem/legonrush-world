// The Limbo ruin south of the K. A. Busia Building and the slabs beside Annie Jiagge Road north of JQB (the owner's
// Limbo brief: three game screenshots with the outlines circled, the aerial with the ruin circled in blue and the strip
// by the road marked with a purple arrow). The game drew both as two-storey blocks under red tile roofs; on the ground
// they are only foundations: bare concrete slabs on the mapped outlines, grey-beige with dark mould and lichen, cracked,
// with column stubs and their rusty rebar, a course or two of blockwork here and there and weeds in the joints. Round
// them, as the aerial shows:
// - Limbo: a dense belt of trees and undergrowth on the north (toward the Busia Building), the west (along the
//   residential road; the machine-detected outline there is the belt, not a building: corrections.json exclude) and the
//   east (along Annie Jiagge Road, thinning toward the south); in the court the north part bare red soil with grass, the
//   part beside and below the wing dense green; south of the ruin open red soil with grass in patches and a line of
//   scattered trees;
// - the strip by the road: two broken slabs (the top one and the lower one) lost in thick bushes, small trees and tall
//   grass between the road and the ruined compound east of it.
// Positions are the mapped outlines and roads; the vegetation's extent is read from the aerial (inferred, not measured).
import * as THREE from 'three';
import { BUILDINGS, NODE_XZ, ROADS, buildingNear, type Building } from './campusmap';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { canvas, merge, type Part } from './modelkit';
import { concrete } from './concrete';
import { Bag, hash, tuft, vnoise } from './enkit';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { rod } from './upsa';
import { halfOf } from './lbplan';
import { SOLIDS } from './solids';

type P2 = [number, number];
const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#f1efe9') };

/** the ground each part of the work draws (world x0, x1, z0, z1) */
export const LIMBO = { x0: 376, x1: 506, z0: -110, z1: 9 };
export const STRIP = { x0: 514, x1: 547, z0: -161, z1: -106 };
/** points inside the outlines that are foundations: the ring (osm:way/702279067), the west range and its wing
 *  (osm:way/975205017), the strip's top and lower slabs (ml:8758cc6d-..., ml:b04e3fa1-...) */
export const SLAB_PTS: { at: P2; h: number; strip: boolean }[] = [
  { at: [475, -60], h: 0.85, strip: false },
  { at: [404, -55], h: 0.85, strip: false },
  { at: [534, -153], h: 0.4, strip: true },
  { at: [534, -120], h: 0.4, strip: true },
];
/** foundation A (the owner's 20-picture corrections, Pictures 16-17, the blue outline): the unfinished site south of
 *  International House, between it and the Jones-Quartey Building. The satellite shows one low C of bare slabs: the north
 *  range (the outline the game built as a finished three-storey block, osm 1462's), the east range with its grid of low
 *  walls and the south range (the L outline the game built as a four-level frame), the court between them overgrown; the
 *  two small slabs west of it by the road are the strip's (above). The ground the work draws, and points inside the
 *  outlines. */
export const FOUND_A = { x0: 544.5, x1: 606, z0: -168, z1: -90 };
const A_PTS: P2[] = [[575, -154], [590, -132]];
/** the east range's grid of low wall stubs (the satellite's cells): its extent and the cell size */
const A_GRID = { x0: 580.5, x1: 594.5, z0: -144, z1: -114, cell: 3.6 };

/** the court inside the ring, and the wing that splits it */
const COURT = { x0: 404, x1: 465, z0: -74.5, z1: -39.5 };
const WING = { x0: 409, x1: 436.4, z0: -61, z1: -50 };

const inRing = (r: P2[], x: number, z: number) => {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, zi] = r[i], [xj, zj] = r[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
};
const ringOf = (b: Building): P2[] => { const r: P2[] = []; for (let i = 0; i < b.pts.length; i += 2) r.push([b.pts[i], b.pts[i + 1]]); return r; };
const holds = (b: Building, [x, z]: P2) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ && inRing(ringOf(b), x, z);
/** the foundations' outlines as the map has them */
export const SLABS = SLAB_PTS.flatMap((s) => { const b = BUILDINGS.find((o) => holds(o, s.at)); return b ? [{ ...s, b, ring: ringOf(b) }] : []; });
export const SLABS_A = A_PTS.flatMap((at) => { const b = BUILDINGS.find((o) => holds(o, at)); return b ? [{ at, h: 0.7, strip: false, b, ring: ringOf(b) }] : []; });
const onSlabA = (x: number, z: number) => SLABS_A.some((s) => x >= s.b.minX && x <= s.b.maxX && z >= s.b.minZ && z <= s.b.maxZ && inRing(s.ring, x, z));
const onSlab = (x: number, z: number, strip?: boolean) => SLABS.some((s) => (strip === undefined || s.strip === strip) && x >= s.b.minX && x <= s.b.maxX && z >= s.b.minZ && z <= s.b.maxZ && inRing(s.ring, x, z));
const slabDist = (x: number, z: number) => {
  let best = Infinity;
  for (const s of SLABS) {
    if (inRing(s.ring, x, z)) return -1;
    for (let i = 0, j = s.ring.length - 1; i < s.ring.length; j = i++) {
      const [ax, az] = s.ring[j], [bx, bz] = s.ring[i], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
      best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z));
    }
  }
  return best;
};

// ---------- the mapped roads near the work (half widths as drawn; footways flagged) ----------
const SG = 20;
const segs: [number, number, number, number, number, number][] = [];
const grid = new Map<string, number[]>();
for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++) {
  const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
  if (Math.max(ax, bx) < 340 || Math.min(ax, bx) > 620 || Math.max(az, bz) < -220 || Math.min(az, bz) > 40) continue;
  const k = segs.length;
  segs.push([ax, az, bx, bz, halfOf(r), r.cls]);
  for (let gx = Math.floor((Math.min(ax, bx) - 12) / SG); gx <= Math.floor((Math.max(ax, bx) + 12) / SG); gx++)
    for (let gz = Math.floor((Math.min(az, bz) - 12) / SG); gz <= Math.floor((Math.max(az, bz) + 12) / SG); gz++) {
      const key = `${gx},${gz}`;
      (grid.get(key) ?? grid.set(key, []).get(key)!).push(k);
    }
}
/** distance from (x, z) to the nearest road's edge (negative on it), within about 12 m; footways only with `paths` */
function clearance(x: number, z: number, paths = false) {
  let best = 12;
  for (const k of grid.get(`${Math.floor(x / SG)},${Math.floor(z / SG)}`) ?? []) {
    const [ax, az, bx, bz, h, cls] = segs[k];
    if (cls === 4 && !paths) continue;
    const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z) - h);
  }
  return best;
}

// ---------- where the ground is what (Limbo) ----------
type Zone = 'belt' | 'beltThin' | 'courtSoil' | 'courtGreen' | 'south' | 'open';
function zoneOf(x: number, z: number): Zone {
  if (x > COURT.x0 && x < COURT.x1 && z > COURT.z0 && z < COURT.z1) return z < WING.z0 + (vnoise(x * 0.2, 3) - 0.5) * 2 ? 'courtSoil' : 'courtGreen';
  if (z < -91.5 || x < 396.5) return 'belt';
  if (x > 486.5) return z < -24 + (vnoise(z * 0.1, 7) - 0.5) * 8 ? 'belt' : 'beltThin';
  if (z > -14.5) return 'south';
  return 'open';
}

export interface Tree { x: number; z: number; h: number; spread: number; round: boolean }
/** the trees the aerial shows (trunks are solid): Limbo's belts, the court's green part, the line south of the ruin,
 *  the strip's small trees */
export function limboTrees(): Tree[] {
  const out: Tree[] = [];
  const ok = (x: number, z: number, slab: number) => clearance(x, z, true) > 2.2 && slabDist(x, z) > slab && !buildingNear(x, z, 2);
  for (let gx = LIMBO.x0 + 2; gx < LIMBO.x1; gx += 6.5) for (let gz = LIMBO.z0 + 2; gz < LIMBO.z1; gz += 6.5) {
    const x = gx + (hash(gx, gz) - 0.5) * 4.5, z = gz + (hash(gz, gx) - 0.5) * 4.5, zone = zoneOf(x, z), r = hash(x * 0.7, z * 1.3);
    // (the owner's 20-picture corrections, Pictures 17-18: round the ruin the growth is mostly short shrubs, only a minority
    // of it taller trees; the belts are the undergrowth below, with a tree here and there)
    const p = { belt: 0.2, beltThin: 0.1, courtGreen: 0.3, courtSoil: 0.05, south: 0, open: 0 }[zone];
    if (r > p || !ok(x, z, zone === 'courtGreen' || zone === 'courtSoil' ? 1.2 : 1.6)) continue;
    const court = zone === 'courtGreen' || zone === 'courtSoil';
    out.push({ x, z, h: court ? 3.5 + hash(x, 3) * 2.5 : 4.5 + hash(x, 4) * 4, spread: court ? 4.5 + hash(z, 5) * 3 : 5.5 + hash(z, 6) * 3.5, round: hash(z, 9) < 0.5 });
  }
  // the line of scattered trees south of the ruin, by the red earth road (aerial)
  for (const [x, z] of [[396, 3.5], [407, 5], [423, 4], [447, 5.5], [471, 4.5], [495, 3]] as P2[]) if (ok(x, z, 2)) out.push({ x, z, h: 7 + hash(x, 1) * 4, spread: 7 + hash(x, 2) * 3, round: true });
  // the strip: small trees among the bushes, off the slabs
  for (let gx = STRIP.x0 + 3; gx < STRIP.x1; gx += 7) for (let gz = STRIP.z0 + 2; gz < STRIP.z1; gz += 7) {
    const x = gx + (hash(gx, gz) - 0.5) * 5, z = gz + (hash(gz, gx) - 0.5) * 5;
    if (hash(x, z) > 0.55 || !ok(x, z, 1.5)) continue;
    out.push({ x, z, h: 4 + hash(x, 7) * 4, spread: 4 + hash(z, 8) * 3, round: true });
  }
  return out;
}

// ---------- the slabs' faces ----------
const fbm = (x: number, z: number) => vnoise(x, z) * 0.55 + vnoise(x * 2.1 + 17, z * 2.1 - 9) * 0.3 + vnoise(x * 4.3 - 5, z * 4.3 + 21) * 0.15;
/** the top of the slabs in one picture over their extent: grey-beige concrete, the structural grid's joints, dark mould
 *  and lichen blotches (the aerial), cracks, weeds in the joints */
function topTexture(x0: number, x1: number, z0: number, z1: number, w: number, h: number) {
  const t = canvas(w, h, (g) => {
    const img = g.createImageData(w, h), d = img.data;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const x = x0 + ((x1 - x0) * (i + 0.5)) / w, z = z0 + ((z1 - z0) * (j + 0.5)) / h;
      const fine = hash(i, j) * 0.07 - 0.035, tone = vnoise(x * 0.35, z * 0.35) * 0.08;
      let r = 0.7 + tone + fine, gg = 0.67 + tone + fine, b = 0.6 + tone * 0.8 + fine;
      // the structural grid: joints every 4 m, a little darker and stained
      const jx = Math.abs(((x % 4) + 4) % 4 - 2), jz = Math.abs(((z % 4) + 4) % 4 - 2);
      if (Math.min(2 - jx, 2 - jz) < 0.07) { r -= 0.12; gg -= 0.11; b -= 0.1; }
      // the mould: large dark blotches with soft olive edges
      const m = fbm(x * 0.11, z * 0.11) + (vnoise(x * 0.5, z * 0.5) - 0.5) * 0.18;
      if (m > 0.5) {
        const k = Math.min(1, (m - 0.5) / 0.08);
        r = r * (1 - k) + (0.3 + fine) * k; gg = gg * (1 - k) + (0.3 + fine) * k; b = b * (1 - k) + (0.25 + fine) * k;
      } else if (m > 0.45) { const k = (m - 0.45) / 0.05; r -= 0.1 * k; gg -= 0.04 * k; b -= 0.12 * k; }
      // lichen and moss in spots
      const l = vnoise(x * 0.9 + 40, z * 0.9 - 13);
      if (l > 0.8) { r -= 0.12; gg -= 0.02; b -= 0.14; }
      const o = (j * w + i) * 4;
      d[o] = Math.max(0, Math.min(255, r * 255)); d[o + 1] = Math.max(0, Math.min(255, gg * 255)); d[o + 2] = Math.max(0, Math.min(255, b * 255)); d[o + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    // cracks, and weeds along some of them
    const px = (x: number) => ((x - x0) / (x1 - x0)) * w, pz = (z: number) => ((z - z0) / (z1 - z0)) * h;
    for (let c = 0; c < ((x1 - x0) * (z1 - z0)) / 18; c++) {
      let x = x0 + hash(c, 1.3) * (x1 - x0), z = z0 + hash(2.7, c) * (z1 - z0), a = hash(c, 5) * Math.PI * 2;
      g.strokeStyle = 'rgba(40,36,30,0.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(px(x), pz(z));
      for (let s = 0; s < 6; s++) { a += (hash(c, s) - 0.5) * 1.2; x += Math.cos(a) * 0.6; z += Math.sin(a) * 0.6; g.lineTo(px(x), pz(z)); }
      g.stroke();
      if (hash(c, 9) < 0.4) { g.fillStyle = ['#56702f', '#6b7d39', '#4a6328'][c % 3]; for (let s = 0; s < 6; s++) g.fillRect(px(x) + (hash(c, s + 20) - 0.5) * 8, pz(z) + (hash(s + 30, c) - 0.5) * 8, 2, 2); }
    }
  });
  t.anisotropy = 4;
  return t;
}
let SIDE: THREE.MeshStandardMaterial | null = null;
/** the slabs' edges: rough grey concrete streaked with dirt from the ground up */
const sideMat = () => (SIDE ??= new THREE.MeshStandardMaterial({ roughness: 0.95, map: (() => {
  const t = canvas(256, 64, (g) => {
    g.fillStyle = '#a49e92'; g.fillRect(0, 0, 256, 64);
    for (let i = 0; i < 900; i++) { g.fillStyle = ['#968f83', '#b2ac9f', '#8a8478'][i % 3]; g.fillRect(hash(i, 1) * 256, hash(2, i) * 64, 2, 2); }
    const gr = g.createLinearGradient(0, 64, 0, 0); gr.addColorStop(0, 'rgba(92,66,46,0.75)'); gr.addColorStop(0.5, 'rgba(92,66,46,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 64);
    for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(50,48,40,0.25)'; g.fillRect(hash(i, 4) * 256, 0, 3 + hash(i, 6) * 6, 30 + hash(7, i) * 34); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.25, 1);
  return t;
})() }));

/** a slab on an outline: its top at `h`, its edges from below the ground; the top's uvs place it in `ext`'s picture */
function slabMesh(ring: P2[], h: number, O: P2, ext: [number, number, number, number], top: THREE.Material) {
  const shape = new THREE.Shape(ring.map(([x, z]) => new THREE.Vector2(x - O[0], -(z - O[1]))));
  const g = new THREE.ExtrudeGeometry(shape, { depth: h + 0.3, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, -0.3, 0);
  const p = g.attributes.position as THREE.BufferAttribute, n = g.attributes.normal as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  const [x0, x1, z0, z1] = ext;
  for (let i = 0; i < p.count; i++) {
    if (Math.abs(n.getY(i)) < 0.5) { uv.setY(i, p.getY(i) + 0.3); continue; }
    uv.setXY(i, (p.getX(i) + O[0] - x0) / (x1 - x0), 1 - (p.getZ(i) + O[1] - z0) / (z1 - z0));
  }
  const me = new THREE.Mesh(g, [top, sideMat()]);
  me.castShadow = true; me.receiveShadow = true;
  return me;
}

/** the ruin's details on a slab: column stubs on the grid along its edges with rebar standing out, a few broken
 *  courses of blockwork, weeds and small bushes in the cracks and the mould */
function ruin(c: Part[], b: Bag, ring: P2[], h: number, seed: number, strip: boolean) {
  const O = b.O;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, az] = ring[j], [bx, bz] = ring[i], L = Math.hypot(bx - ax, bz - az);
    if (L < 2) continue;
    const ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
    // the inward side: the ring's winding decides it
    const midx = (ax + bx) / 2, midz = (az + bz) / 2, inw = inRing(ring, midx + nx * 0.8, midz + nz * 0.8) ? 1 : -1;
    for (let s = 0.6; s < L - 0.3; s += 4) {
      const r = hash(seed + i * 13.1, s);
      const x = ax + ux * s + nx * inw * 0.35, z = az + uz * s + nz * inw * 0.35;
      if (r < (strip ? 0.25 : 0.42)) {
        // a column stub broken off low
        const t = 0.2 + hash(s, seed + i) * (strip ? 0.5 : 1.1), w = 0.36;
        c.push([new THREE.BoxGeometry(w, t, w).rotateY(Math.atan2(-uz, ux)).translate(x - O[0], h + t / 2, z - O[1]), ['#a29c90', '#9a9488', '#aaa498'][(r * 30 | 0) % 3]]);
        for (let q = 0; q < 4; q++) {
          if (hash(q, s + seed) < 0.35) continue;
          const ox = (q % 2 ? 0.11 : -0.11), oz = (q < 2 ? 0.11 : -0.11), up = 0.35 + hash(q + s, seed) * 0.8, bend = (hash(s, q) - 0.5) * 0.5;
          c.push([rod([x - O[0] + ox, h + t - 0.05, z - O[1] + oz], [x - O[0] + ox + bend, h + t + up, z - O[1] + oz + bend * 0.6], 0.025), '#7a4a2e']);
        }
      } else if (r < (strip ? 0.4 : 0.6)) {
        // rebar alone where a column was cut flush
        for (let q = 0; q < 3; q++) c.push([rod([x - O[0] + (q - 1) * 0.12, h - 0.02, z - O[1]], [x - O[0] + (q - 1) * 0.14 + (hash(q, s) - 0.5) * 0.4, h + 0.3 + hash(s, q) * 0.5, z - O[1] + (hash(s + q, 2) - 0.5) * 0.3], 0.022), '#7d4c30']);
      }
    }
    // a few courses of blockwork left along part of the edge
    if (!strip && hash(seed, i * 7.7) < 0.55 && L > 5) {
      const a = L * (0.1 + hash(i, seed) * 0.4), e = Math.min(L - 0.5, a + 2 + hash(seed, i) * 7), hh = 0.2 * (1 + ((hash(i, 3) * 3) | 0));
      const cx = ax + ux * (a + e) / 2 + nx * inw * 0.2, cz = az + uz * (a + e) / 2 + nz * inw * 0.2;
      c.push([new THREE.BoxGeometry(e - a, hh, 0.2).rotateY(Math.atan2(-uz, ux)).translate(cx - O[0], h + hh / 2, cz - O[1]), '#8f8a80']);
    }
  }
  // weeds and small bushes growing out of the cracks
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const [x, z] of ring) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
  const n = ((x1 - x0) * (z1 - z0)) / (strip ? 2.5 : 9);
  const tb = new Bag(O);
  for (let i = 0; i < n; i++) {
    const x = x0 + hash(i, seed + 0.7) * (x1 - x0), z = z0 + hash(seed + 1.9, i) * (z1 - z0);
    if (!inRing(ring, x, z)) continue;
    const m = fbm(x * 0.11, z * 0.11);
    if (!strip && m < 0.45 && hash(i, 4) < 0.6) continue;
    if (hash(i, seed) < (strip ? 0.3 : 0.12)) {
      const rad = 0.3 + hash(i, 8) * (strip ? 0.9 : 0.5);
      b.leaf.push([new THREE.IcosahedronGeometry(rad, 0).scale(1.2, 0.9, 1.2).translate(x - O[0], h + rad * 0.6, z - O[1]), ['#4d7a31', '#5b7f36', '#3f6a2a', '#66803a'][i % 4]]);
    } else tuft(tb, x, z, 0.4 + hash(i, 6) * (strip ? 1.1 : 0.6), ['#7d8a44', '#6b7a3a', '#8d9450', '#5f7a35'][i % 4], seed * 3 + i);
  }
  for (const [g, col] of tb.leaf) b.leaf.push([g.translate(0, h, 0), col]);
}

/** undergrowth: bushes of mixed size and long grass, visual only (the bike pushes through) */
function bushes(b: Bag, x: number, z: number, i: number, tall: number, size = 1) {
  const O = b.O, rad = (0.5 + hash(i, 6) * 0.9) * size, up = 0.9 + hash(i, 7) * tall;
  b.leaf.push([new THREE.IcosahedronGeometry(rad, 1).scale(1.15, up, 1.15).translate(x - O[0], rad * up * 0.8, z - O[1]), ['#3f6a2a', '#4d7a31', '#36602a', '#557331', '#2f5526', '#46702d'][i % 6]]);
  if (hash(i, 12) < 0.5) b.leaf.push([new THREE.IcosahedronGeometry(rad * 0.75, 0).scale(1.2, up * 0.8, 1.2).translate(x - O[0] + 0.6, rad * up * 0.55, z - O[1] - 0.3), ['#5b7f36', '#46702d'][i % 2]]);
}

/** a big bush clump: several leafy masses from the ground up to `h`, about `w` across, no trunk showing */
function clump(b: Bag, x: number, z: number, h: number, w: number, i: number) {
  const O = b.O, cols = ['#3f6a2a', '#4d7a31', '#36602a', '#557331', '#2f5526', '#46702d'];
  for (let q = 0; q < 5; q++) {
    const a = hash(i, q * 3.1) * Math.PI * 2, d = q ? w * 0.28 * (0.6 + hash(q, i) * 0.6) : 0, r = (q ? 0.32 : 0.42) * w * (0.85 + hash(i + q, 2) * 0.3);
    const cy = q ? h * (0.3 + hash(q, i * 1.7) * 0.25) : h * 0.5, sy = (q ? h * 0.36 : h * 0.5) / r;
    b.leaf.push([new THREE.IcosahedronGeometry(r, 1).scale(1, sy, 1).translate(x + Math.cos(a) * d - O[0], cy, z + Math.sin(a) * d - O[1]), cols[(i + q) % 6]]);
  }
  SOLIDS.add(x, z, w * 0.18);
}

// ======================================================================================================
// Limbo
// ======================================================================================================
const LO: P2 = [445, -50];
const limbo: Spec = {
  name: 'Limbo ruin', axis: [1, 0], origin: LO, storey: 3, style: PLAIN, roofColor: '#9aa0a3', fascia: '#6d5a4a', pitch: 0.2,
  replaces: SLABS.filter((s) => !s.strip).map((s) => s.at),
  blocks: [],
  onGround: true,
  keep: [[LIMBO.x0 - LO[0], LIMBO.x1 - LO[0], LIMBO.z0 - LO[1], LIMBO.z1 - LO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(LO), c: Part[] = [];
    const ext: [number, number, number, number] = [394, 490, -94, -10];
    const top = new THREE.MeshStandardMaterial({ roughness: 0.96, map: topTexture(...ext, 768, 672) });
    for (const [i, s] of SLABS.entries()) if (!s.strip) { k.meshes.push(slabMesh(s.ring, s.h, LO, ext, top)); ruin(c, b, s.ring, s.h, 11 + i * 37, false); }

    // ---- the ground ----
    k.meshes.push(new THREE.Mesh(drapeAt(LO, LIMBO.x0, LIMBO.x1, LIMBO.z0, LIMBO.z1, 1.2, 0.03, (x, z) => {
      if (clearance(x, z, true) < 0.25) return null;
      const m = vnoise(x * 1.1, z * 1.1) * 0.06, n = vnoise(x * 0.12, z * 0.12), zone = zoneOf(x, z);
      const soil: [number, number, number] = [0.56 + m, 0.37 + m * 0.7, 0.26];
      const grass: [number, number, number] = [0.42 + m, 0.47 + m, 0.25];
      const under: [number, number, number] = [0.25 + m, 0.32 + m, 0.15];
      switch (zone) {
        case 'belt': return n > 0.7 ? grass : under;
        case 'beltThin': return n > 0.45 ? grass : [0.33 + m, 0.4 + m, 0.2];
        case 'courtSoil': return n > 0.55 ? grass : soil;
        case 'courtGreen': return under;
        case 'south': return n > 0.55 || vnoise(x * 0.3, z * 0.3) > 0.72 ? grass : soil;
        default: return n > 0.5 ? grass : [0.5 + m, 0.42 + m, 0.27];
      }
    }), groundCover()));

    // ---- the trees and the undergrowth ----
    for (const [i, t] of limboTrees().entries()) if (t.x < LIMBO.x1 + 1) broadleaf(k, b.leaf, t.x, t.z, { h: t.h, spread: t.spread, seed: i * 2.3 + 1, origin: LO, round: t.round });
    let n = 0;
    for (let i = 0; i < 20000 && n < 4600; i++) {
      const x = LIMBO.x0 + hash(i, 0.37) * (LIMBO.x1 - LIMBO.x0), z = LIMBO.z0 + hash(0.53, i) * (LIMBO.z1 - LIMBO.z0), zone = zoneOf(x, z);
      if (clearance(x, z, true) < 0.8 || slabDist(x, z) < 0.3 || buildingNear(x, z, 0.5)) continue;
      const r = hash(i, 5.1);
      if (zone === 'belt' || zone === 'courtGreen') {
        n++;
        if (r < 0.7) bushes(b, x, z, i, zone === 'courtGreen' ? 1.0 : hash(i, 13) < 0.15 ? 1.6 : 0.6, zone === 'belt' ? 0.95 : 0.9);
        else tuft(b, x, z, 0.8 + hash(i, 9) * 1.2, ['#7d8a44', '#6b7a3a', '#5f7a35', '#8d9450'][i % 4], i + 300);
      } else if (zone === 'beltThin' || zone === 'courtSoil') {
        if (r > 0.45) continue;
        n++;
        if (r < 0.12) bushes(b, x, z, i, 0.8);
        else tuft(b, x, z, 0.5 + hash(i, 9) * 0.9, ['#7d8a44', '#8d9450', '#a39a5a'][i % 3], i + 300);
      } else if (zone === 'south') {
        if (r > 0.18) continue;
        n++;
        tuft(b, x, z, 0.4 + hash(i, 9) * 0.6, ['#8d9450', '#a39a5a', '#7d8a44'][i % 3], i + 300);
      }
    }
    // the slabs' edges disappear into the undergrowth along the belts
    for (const s of SLABS) if (!s.strip) for (let i = 0, j = s.ring.length - 1; i < s.ring.length; j = i++) {
      const [ax, az] = s.ring[j], [bx, bz] = s.ring[i], L = Math.hypot(bx - ax, bz - az);
      for (let d = 0; d < L; d += 1.6) {
        const t = d / L, nx = -(bz - az) / L, nz = (bx - ax) / L;
        for (const sg of [-1, 1]) {
          const x = ax + (bx - ax) * t + nx * sg * 0.9, z = az + (bz - az) * t + nz * sg * 0.9, zone = zoneOf(x, z);
          if (onSlab(x, z) || clearance(x, z, true) < 1 || (zone !== 'belt' && zone !== 'courtGreen' && hash(x, z) > 0.25)) continue;
          bushes(b, x, z, (x * 13 + z * 7) | 0, 0.7);
        }
      }
    }

    const m = new THREE.Mesh(merge(c), concrete(0.6)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.finish(k, 0.3);
  },
};

// ======================================================================================================
// the strip by Annie Jiagge Road
// ======================================================================================================
const SO: P2 = [531, -134];
const strip: Spec = {
  name: 'the slabs by Annie Jiagge Road', axis: [1, 0], origin: SO, storey: 3, style: PLAIN, roofColor: '#9aa0a3', fascia: '#6d5a4a', pitch: 0.2,
  replaces: SLABS.filter((s) => s.strip).map((s) => s.at),
  blocks: [],
  onGround: true,
  keep: [[STRIP.x0 + 1.5 - SO[0], STRIP.x1 - SO[0], STRIP.z0 - SO[1], STRIP.z1 - SO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(SO), c: Part[] = [];
    const ext: [number, number, number, number] = [525, 543, -161, -113];
    const top = new THREE.MeshStandardMaterial({ roughness: 0.96, map: topTexture(...ext, 256, 640) });
    for (const [i, s] of SLABS.entries()) if (s.strip) { k.meshes.push(slabMesh(s.ring, s.h, SO, ext, top)); ruin(c, b, s.ring, s.h, 71 + i * 29, true); }
    // ---- the ground: dark undergrowth, bare red earth in patches round the slabs ----
    k.meshes.push(new THREE.Mesh(drapeAt(SO, STRIP.x0, STRIP.x1, STRIP.z0, STRIP.z1, 1.0, 0.03, (x, z) => {
      if (clearance(x, z, true) < 0.25 || (buildingNear(x, z) && !onSlab(x, z, true))) return null;
      const m = vnoise(x * 1.1, z * 1.1) * 0.06, n = vnoise(x * 0.18, z * 0.18), d = slabDist(x, z);
      if (d < 2.5 + (vnoise(x * 0.4, z * 0.4) - 0.5) * 3 && vnoise(x * 0.3 + 9, z * 0.3) > 0.5) return [0.56 + m, 0.38 + m * 0.6, 0.26];
      return n > 0.72 ? [0.4 + m, 0.45 + m, 0.24] : [0.26 + m, 0.33 + m, 0.16];
    }), groundCover()));
    // (the owner's 20-picture corrections, Picture 18's red circle: the clumps in front of the foundation keep about their
    // height but are bushes, dense to the ground, not trees on trunks)
    for (const [i, t] of limboTrees().entries()) if (t.x > STRIP.x0 - 1) clump(b, t.x, t.z, t.h * 0.7, t.spread * 0.75, i);
    // ---- the thick bushes, tall grass and creepers over the slabs' edges ----
    for (let i = 0; i < 4000; i++) {
      const x = STRIP.x0 + hash(i, 0.61) * (STRIP.x1 - STRIP.x0), z = STRIP.z0 + hash(0.29, i) * (STRIP.z1 - STRIP.z0);
      const sd = slabDist(x, z);
      if (clearance(x, z, true) < 0.9 || sd < 0.9 || (buildingNear(x, z, 0.4) && sd > 0.4)) continue;
      const r = hash(i, 5.3);
      if (r < 0.32) bushes(b, x, z, i, 2.2);
      else if (r < 0.9) tuft(b, x, z, 0.9 + hash(i, 9) * 1.4, ['#7d8a44', '#6b7a3a', '#5f7a35', '#8d9450'][i % 4], i + 900);
    }
    if (c.length) { const m = new THREE.Mesh(merge(c), concrete(0.6)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m); }
    b.finish(k, 0.3);
  },
};

// ======================================================================================================
// foundation A, south of International House
// ======================================================================================================
const AO: P2 = [575, -129];
const foundationA: Spec = {
  name: 'Foundation south of International House', axis: [1, 0], origin: AO, storey: 3, style: PLAIN, roofColor: '#9aa0a3', fascia: '#6d5a4a', pitch: 0.2,
  // (the south range's outline is already replaced by the carport's spec, tenpairs.ts)
  replaces: SLABS_A.slice(0, 1).map((s) => s.at),
  blocks: [],
  onGround: true,
  keep: [[FOUND_A.x0 - AO[0], FOUND_A.x1 - AO[0], FOUND_A.z0 - AO[1], FOUND_A.z1 - AO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(AO), c: Part[] = [];
    const ext: [number, number, number, number] = [546, 601, -164, -95];
    const top = new THREE.MeshStandardMaterial({ roughness: 0.96, map: topTexture(...ext, 512, 640) });
    for (const [i, s] of SLABS_A.entries()) { k.meshes.push(slabMesh(s.ring, s.h, AO, ext, top)); ruin(c, b, s.ring, s.h, 131 + i * 41, false); }
    // the east range's cells: low broken wall stubs on a grid, a course or three of blockwork
    const G = A_GRID, h = SLABS_A[1]?.h ?? 0.7;
    if (SLABS_A[1]) {
      for (let z = G.z0; z <= G.z1 + 0.01; z += G.cell) { const hh = 0.2 + hash(z, 3) * 0.4; c.push([new THREE.BoxGeometry(G.x1 - G.x0, hh, 0.2).translate((G.x0 + G.x1) / 2 - AO[0], h + hh / 2, z - AO[1]), '#8f8a80']); }
      for (const x of [G.x0, (G.x0 + G.x1) / 2, G.x1]) { const hh = 0.25 + hash(x, 5) * 0.35; c.push([new THREE.BoxGeometry(0.2, hh, G.z1 - G.z0).translate(x - AO[0], h + hh / 2, (G.z0 + G.z1) / 2 - AO[1]), '#8a857b']); }
    }
    // ---- the ground: the overgrown court and the bushy margins, worn soil at the edges ----
    k.meshes.push(new THREE.Mesh(drapeAt(AO, FOUND_A.x0, FOUND_A.x1, FOUND_A.z0, FOUND_A.z1, 1.0, 0.03, (x, z) => {
      if (clearance(x, z, true) < 0.25 || onSlabA(x, z) || (buildingNear(x, z) && !onSlabA(x, z))) return null;
      const m = vnoise(x * 1.1, z * 1.1) * 0.06, n = vnoise(x * 0.18, z * 0.18);
      if (n > 0.74) return [0.55 + m, 0.38 + m * 0.6, 0.26];
      return n > 0.5 ? [0.4 + m, 0.45 + m, 0.24] : [0.27 + m, 0.35 + m, 0.17];
    }), groundCover()));
    // ---- mostly low bushes and tall grass, a few small trees in the court (Picture 17: the court dense green) ----
    const aSlabDist = (x: number, z: number) => { let best = Infinity; for (const s of SLABS_A) { if (inRing(s.ring, x, z)) return -1; for (let i = 0, j = s.ring.length - 1; i < s.ring.length; j = i++) { const [ax, az] = s.ring[j], [bx, bz] = s.ring[i], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))); best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z)); } } return best; };
    for (const [x, z, hh, w] of [[566, -136, 5.5, 6], [572, -125, 4.5, 5], [561, -122, 6, 6.5], [574, -138, 4, 4.5]] as [number, number, number, number][]) if (aSlabDist(x, z) > 1.5 && !buildingNear(x, z, 1)) broadleaf(k, b.leaf, x, z, { h: hh, spread: w, seed: x + z * 3, origin: AO, round: true });
    for (let i = 0; i < 5000; i++) {
      const x = FOUND_A.x0 + hash(i, 0.71) * (FOUND_A.x1 - FOUND_A.x0), z = FOUND_A.z0 + hash(0.37, i) * (FOUND_A.z1 - FOUND_A.z0), sd = aSlabDist(x, z);
      if (clearance(x, z, true) < 0.9 || sd < 0.5 || buildingNear(x, z, 0.4)) continue;
      const r = hash(i, 6.1), court = x > 552 && x < 580 && z > -144 && z < -113;
      if (r < (court ? 0.4 : 0.22)) bushes(b, x, z, i, court ? 1.8 : 1.3, court ? 1.2 : 1);
      else if (r < 0.75) tuft(b, x, z, 0.7 + hash(i, 9) * 1.2, ['#7d8a44', '#6b7a3a', '#5f7a35', '#8d9450'][i % 4], i + 1700);
    }
    const m = new THREE.Mesh(merge(c), concrete(0.6)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.finish(k, 0.3);
  },
};

export const limboSite = createSite('limbo', [limbo, strip, foundationA]);
