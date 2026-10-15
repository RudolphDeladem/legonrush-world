// The Night Market west of the banking square, and the one-floor buildings round it (owner's aerials, registered
// to the OSM footprints; block engine: blocks.ts).
//
// The market (circled blue) is not a set of buildings of rooms but market zones: rows of stall cubicles under
// sheet roofs on posts, red, blue, purple and orange, with lanes between them and a shade tree in the middle.
// On its east side, by the road opposite the banking square, the long block with the supermarket (circled black):
// one floor, a braced canopy along the road front (the correction brief: see below). The market stood south
// of the banking square only while it was relocated for construction; that ground is grass, trees and soil now.
//
// Round it (circled yellow): one-floor buildings, a ground floor only, each under a roof the colour the aerial
// shows: rusty brown sheets, faded tan sheets or terracotta tiles.
import * as THREE from 'three';
import { WHITE, box, rnd } from './modelkit';
import { PL, createSite, render, window_, type Block, type Kit, type Spec, type Style } from './blocks';
import { rectsOf } from './rectilinear';
import { pave, pavers } from './upsa';
import { car } from './banking';

// ---------- the supermarket ----------
// (the correction brief, slides 2-6: the long block by Jubilee Drive is not a glass box under a green fascia but a low
// commercial block: white walls over a grey-green dado, barred dark windows, a hipped sheet roof whose lean-to canopy runs
// along the road front on slim dark braces over a paved walk, the ALL NEEDS SUPERMARKET board over the supermarket's
// doors; at its north end the Euburger corner unit: a yellow fascia with round food pictures wrapping the corner, grey
// cladding below, service windows. The destination keeps its name, Supermart (Night Market), so routes stay the same.)
// 2 m west of the roof on the aerial, so the entrance keeps a pavement in front of it, short of the road
const SM: [number, number, number, number] = [103, 114.2, 975.5, 1014];
const SMO: [number, number] = [(SM[0] + SM[1]) / 2, (SM[2] + SM[3]) / 2];
const DADO = '#6b776f';
/** white render over a grey-green dado, a barred dark window to a bay (slide 2) */
const SM_WALL: Style = {
  bay: 3.2, up: [], ground: [[78, 256 + 54, 100, 92]],
  draw: (g) => {
    render(g, '#f3f2ec');
    g.fillStyle = DADO; g.fillRect(0, 256 + 168, 256, 88);
    g.fillStyle = '#5c675f'; g.fillRect(0, 256 + 166, 256, 4);
    window_(g, [78, 256 + 54, 100, 92], '#e6e6e0', 2, 0);
    g.fillStyle = '#26292c';
    for (let x = 84; x < 178; x += 12) g.fillRect(x, 256 + 54, 3, 92);
    g.fillRect(78, 256 + 98, 100, 3);
  },
};
const CANOPY = 2.4, EB = -12.5;
const supermart: Spec = {
  name: 'Supermart (Night Market)',
  axis: [1, 0], origin: SMO, storey: 3.4, style: SM_WALL, roofColor: '#a3503b', fascia: '#efeee8', pitch: 0.26,
  replaces: [SMO],
  blocks: [{ x0: SM[0] - SMO[0], x1: SM[1] - SMO[0], z0: SM[2] - SMO[1], z1: SM[3] - SMO[1], floors: 1 }],
  keep: [[SM[1] - SMO[0], SM[1] - SMO[0] + CANOPY + 0.3, SM[2] - SMO[1], SM[3] - SMO[1]], [SM[0] - SMO[0], SM[1] - SMO[0], SM[2] - SMO[1] - 2, SM[2] - SMO[1]]],
  extras: (k: Kit) => {
    const ex = SM[1] - SMO[0], z0 = SM[2] - SMO[1], z1 = SM[3] - SMO[1], dz = 994.7 - SMO[1], top = k.wallTop(1);
    // the paved walk under the canopy, and the paving along the north end
    pave(k, ex, ex + CANOPY + 0.2, z0, z1, pavers('legon'), 0.03, 2);
    // the lean-to canopy along the road front, on slim dark braces from the wall (slides 2, 3, 5)
    const hi = top - 0.15, lo = top - 0.75, cz0 = EB, cz1 = z1 + 0.3;
    k.roof.quad([ex + CANOPY, lo, cz0], [ex + CANOPY, lo, cz1], [ex, hi, cz1], [ex, hi, cz0]);
    k.roof.quad([ex, hi - 0.05, cz0], [ex, hi - 0.05, cz1], [ex + CANOPY, lo - 0.05, cz1], [ex + CANOPY, lo - 0.05, cz0]);
    k.plain.push([box(ex + CANOPY - 0.04, ex + CANOPY + 0.06, lo - 0.28, lo + 0.02, cz0, cz1), '#ece9e2']);
    const ang = Math.atan2(lo - 0.08 - 1.9, CANOPY - 0.1), len = Math.hypot(CANOPY - 0.1, lo - 0.08 - 1.9);
    for (let z = cz0 + 0.6; z < cz1 - 0.3; z += 3.2) {
      k.plain.push([new THREE.BoxGeometry(len, 0.07, 0.07).rotateZ(ang).translate(ex + (CANOPY - 0.1) / 2, (1.9 + lo - 0.08) / 2, z), '#2b2e31']);
      k.plain.push([box(ex, ex + 0.08, 1.75, 2.0, z - 0.05, z + 0.05), '#2b2e31']);
    }
    // the supermarket's glazed double doors and the ALL NEEDS SUPERMARKET board on the canopy's edge over them (slide 5)
    k.glass.push(box(ex, ex + 0.05, PL, PL + 2.4, dz - 1.5, dz + 1.5));
    k.plain.push([box(ex, ex + 0.08, PL + 2.4, PL + 2.55, dz - 1.6, dz + 1.6), '#3a3d42'], [box(ex, ex + 0.08, PL, PL + 2.4, dz - 0.04, dz + 0.04), '#3a3d42']);
    k.plain.push([box(ex + CANOPY - 0.02, ex + CANOPY + 0.08, lo + 0.02, lo + 0.95, dz - 3.2, dz + 3.2), '#f6f6f2']);
    k.signs.push({ text: 'ALL NEEDS SUPERMARKET', x: ex + CANOPY + 0.09, y: lo + 0.48, z: dz, ry: Math.PI / 2, w: 6.2, colors: ['#f6f6f2', '#c32228'] });
    // the other shops' doors along the front: dark doors under the canopy
    for (const z of [-8.5, 8.5, 14.5]) k.plain.push([box(ex, ex + 0.07, PL, PL + 2.3, z - 0.55, z + 0.55), '#3b3027']);
    // Euburger at the north end (slides 4, 6): grey cladding to the sill, service windows, a yellow fascia with round food
    // pictures wrapping the corner and the name
    const nz = z0, wx = SM[0] - SMO[0];
    k.plain.push([box(wx, ex, PL, 1.1, nz - 0.08, nz), '#5d6266'], [box(ex, ex + 0.08, PL, 1.1, nz, EB), '#5d6266']);
    k.glass.push(box(wx + 1.2, ex - 0.8, 1.1, 2.35, nz - 0.05, nz), box(ex, ex + 0.05, 1.1, 2.35, nz + 0.8, EB - 0.6));
    for (let x = wx + 1.2; x <= ex - 0.7; x += 1.6) k.plain.push([box(x - 0.04, x + 0.04, 1.1, 2.35, nz - 0.09, nz), '#3a3d42']);
    for (let z = nz + 0.8; z <= EB - 0.5; z += 1.6) k.plain.push([box(ex, ex + 0.09, 1.1, 2.35, z - 0.04, z + 0.04), '#3a3d42']);
    k.plain.push([box(wx - 0.05, ex + 0.15, 2.35, top + 0.1, nz - 0.2, nz), '#f2c21b'], [box(ex, ex + 0.2, 2.35, top + 0.1, nz - 0.2, EB), '#f2c21b']);
    k.signs.push({ text: 'EUBURGER', x: 0, y: (2.35 + top) / 2, z: nz - 0.21, ry: Math.PI, w: 3.4, colors: ['#f2c21b', '#7a2a12'] });
    k.signs.push({ text: 'EUBURGER', x: ex + 0.21, y: (2.35 + top) / 2, z: (nz + EB) / 2 + 1.2, ry: Math.PI / 2, w: 2.6, colors: ['#f2c21b', '#7a2a12'] });
    const FOOD = ['#b8742f', '#e3cf9a', '#8a3a1c', '#d39a3c'];
    const disc = (x: number, y: number, z: number, ry: number, c: string) => {
      k.plain.push([new THREE.CylinderGeometry(0.46, 0.46, 0.03, 18).rotateX(Math.PI / 2).rotateY(ry).translate(x, y, z), '#fbfaf5']);
      k.plain.push([new THREE.CylinderGeometry(0.38, 0.38, 0.05, 18).rotateX(Math.PI / 2).rotateY(ry).translate(x, y, z), c]);
    };
    const yc = (2.35 + top) / 2;
    [wx + 0.9, wx + 2.0, ex - 2.0, ex - 0.9].forEach((x, i) => disc(x, yc, nz - 0.22, 0, FOOD[i]));
    [nz + 0.8, EB - 0.8].forEach((z, i) => disc(ex + 0.22, yc, z, Math.PI / 2, FOOD[(i + 2) % 4]));
  },
};

// ---------- the market zones ----------
// (the owner's two photos of the market inside and the correction brief: the stall rows are open sheds of white masonry
// partitions under a silver corrugated roof on timber purlins and slim black steel posts, red panels at the row ends, a
// concrete floor; the lanes between them are block-paved; the shops along the lane by the road keep roller shutters and
// blue canopies over their fronts)
const MO: [number, number] = [98, 1016];
const mx = (x: number) => x - MO[0], mz = (z: number) => z - MO[1];
const GOODS = ['#e8c12f', '#d43a2c', '#2f7fc8', '#3f9a4a', '#f08a2c', '#8a4fb0', '#f4f1ea', '#6b4a33'];
const SHEET = '#a8adb0', TIMBER = '#8a5f3a', STEEL = '#1f2123', PART = '#f3f1ec', ENDRED = '#b5352c';
/** a sheet roof on posts over a row of stalls: a low ridge along the row, eaves at 2.9 m, timber purlins under it */
function sheetRoof(k: Kit, x0: number, x1: number, z0: number, z1: number, color: string, alongZ: boolean) {
  const eave = 2.9, rise = 0.6, o = 0.4;
  const L = (alongZ ? z1 - z0 : x1 - x0) + 2 * o, half = (alongZ ? x1 - x0 : z1 - z0) / 2 + o;
  const slope = Math.hypot(half, rise), ang = Math.atan2(rise, half);
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  for (const s of [-1, 1]) {
    const g = alongZ
      ? new THREE.BoxGeometry(slope, 0.06, L).rotateZ(-s * ang).translate(cx + (s * half) / 2, eave + rise / 2, cz)
      : new THREE.BoxGeometry(L, 0.06, slope).rotateX(s * ang).translate(cx, eave + rise / 2, cz + (s * half) / 2);
    k.plain.push([g, color]);
    // purlins: timber battens along the row under each slope, and the ridge beam
    for (const f of [0.3, 0.7]) {
      const d = s * half * f, y = eave + rise * (1 - f) - 0.1;
      if (alongZ) k.plain.push([box(cx + d - 0.05, cx + d + 0.05, y - 0.1, y, cz - L / 2, cz + L / 2), TIMBER]);
      else k.plain.push([box(cx - L / 2, cx + L / 2, y - 0.1, y, cz + d - 0.05, cz + d + 0.05), TIMBER]);
    }
  }
  if (alongZ) k.plain.push([box(cx - 0.07, cx + 0.07, eave + rise - 0.25, eave + rise - 0.05, cz - L / 2, cz + L / 2), TIMBER]);
  else k.plain.push([box(cx - L / 2, cx + L / 2, eave + rise - 0.25, eave + rise - 0.05, cz - 0.07, cz + 0.07), TIMBER]);
}
/**
 * A row of stall cubicles x0..x1, z0..z1 (model frame): a concrete slab, a back wall on the `back` side, white masonry
 * partitions every 3 m with red panels at the row's ends, counters and goods along the open front, slim black steel posts
 * and a silver sheet roof; `awning`: a blue canopy over the open front (the shops along the lane, owner's photo)
 */
function stalls(k: Kit, x0: number, x1: number, z0: number, z1: number, roof: string, back: 'x0' | 'x1' | 'z0' | 'z1', awning = false) {
  const alongZ = back === 'x0' || back === 'x1';
  k.plain.push([box(x0, x1, 0, 0.15, z0, z1), '#cfcac0']);
  const [a0, a1] = alongZ ? [z0, z1] : [x0, x1];
  const n = Math.max(1, Math.round((a1 - a0) / 3)), step = (a1 - a0) / n;
  // the back wall and the partitions
  if (back === 'x0') k.plain.push([box(x0, x0 + 0.2, 0, 2.6, z0, z1), PART]);
  if (back === 'x1') k.plain.push([box(x1 - 0.2, x1, 0, 2.6, z0, z1), PART]);
  if (back === 'z0') k.plain.push([box(x0, x1, 0, 2.6, z0, z0 + 0.2), PART]);
  if (back === 'z1') k.plain.push([box(x0, x1, 0, 2.6, z1 - 0.2, z1), PART]);
  const front = back === 'x0' ? x1 : back === 'x1' ? x0 : back === 'z0' ? z1 : z0;
  for (let i = 0; i <= n; i++) {
    const t = a0 + i * step, col = i === 0 || i === n ? ENDRED : PART;
    // (only the front pier at a row's end is red, the low wall behind it white, as in the owner's photo)
    // the partition: a white masonry pier at the front, a lower wall behind it (owner's photo)
    const f = front, b = back === 'x0' ? x0 : back === 'x1' ? x1 : back === 'z0' ? z0 : z1, piece = Math.sign(b - f) * 0.45;
    if (alongZ) {
      k.plain.push([box(Math.min(f, f + piece), Math.max(f, f + piece), 0, 2.3, t - 0.13, t + 0.13), col]);
      k.plain.push([box(Math.min(f + piece, b), Math.max(f + piece, b), 0, 1.9, t - 0.11, t + 0.11), PART]);
    } else {
      k.plain.push([box(t - 0.13, t + 0.13, 0, 2.3, Math.min(f, f + piece), Math.max(f, f + piece)), col]);
      k.plain.push([box(t - 0.11, t + 0.11, 0, 1.9, Math.min(f + piece, b), Math.max(f + piece, b)), PART]);
    }
    // slim black steel posts carrying the roof at the open front
    if (alongZ) k.plain.push([box(front - 0.05, front + 0.05, 0, 2.95, t - 0.05, t + 0.05), STEEL]);
    else k.plain.push([box(t - 0.05, t + 0.05, 0, 2.95, front - 0.05, front + 0.05), STEEL]);
  }
  const inward = back === 'x0' || back === 'z0' ? -1 : 1;
  if (awning) {
    // a blue canvas canopy over the open front, sloping out over the lane
    const o0 = front, o1 = front - inward * 1.6, y0 = 2.7, y1 = 2.25, L = a1 - a0;
    const ang = Math.atan2(y0 - y1, 1.6), w = Math.hypot(1.6, y0 - y1);
    k.plain.push([alongZ
      ? new THREE.BoxGeometry(w, 0.04, L).rotateZ(inward * ang).translate((o0 + o1) / 2, (y0 + y1) / 2, (a0 + a1) / 2)
      : new THREE.BoxGeometry(L, 0.04, w).rotateX(-inward * ang).translate((a0 + a1) / 2, (y0 + y1) / 2, (o0 + o1) / 2), '#2f62b0']);
    k.plain.push([alongZ ? box(Math.min(o1, o1 + inward * 0.04), Math.max(o1, o1 + inward * 0.04), y1 - 0.25, y1, a0, a1) : box(a0, a1, y1 - 0.25, y1, Math.min(o1, o1 + inward * 0.04), Math.max(o1, o1 + inward * 0.04)), '#f2f2ee']);
  }
  // in each cubicle: a counter at the front, goods stacked on it and on shelves behind; a few grey roller shutters down
  for (let i = 0; i < n; i++) {
    const c0 = a0 + i * step + 0.15, c1 = a0 + (i + 1) * step - 0.15;
    if (rnd() < (awning ? 0.35 : 0.18)) {
      if (alongZ) k.plain.push([box(front - 0.04, front + 0.04, 0.15, 2.5, c0, c1), '#8f9396']);
      else k.plain.push([box(c0, c1, 0.15, 2.5, front - 0.04, front + 0.04), '#8f9396']);
      continue;
    }
    const f0 = front + inward * 0.1, f1 = front + inward * 0.7;
    if (alongZ) k.plain.push([box(Math.min(f0, f1), Math.max(f0, f1), 0.15, 1.0, c0, c1), '#b89a6e']);
    else k.plain.push([box(c0, c1, 0.15, 1.0, Math.min(f0, f1), Math.max(f0, f1)), '#b89a6e']);
    for (let j = 0; j < 4; j++) {
      const u = c0 + 0.2 + rnd() * (c1 - c0 - 0.6), hh = 0.2 + rnd() * 0.3, col = GOODS[(rnd() * GOODS.length) | 0];
      const v0 = front + inward * (0.15 + rnd() * 0.35);
      if (alongZ) k.plain.push([box(v0 - 0.15, v0 + 0.15, 1.0, 1.0 + hh, u, u + 0.4), col]);
      else k.plain.push([box(u, u + 0.4, 1.0, 1.0 + hh, v0 - 0.15, v0 + 0.15), col]);
    }
  }
  sheetRoof(k, x0, x1, z0, z1, roof, alongZ);
}
const market: Spec = {
  name: 'Night Market',
  axis: [1, 0], origin: MO, storey: 3, style: SM_WALL, roofColor: '#b4503b', fascia: WHITE, pitch: 0.2,
  // the satellite-detected outlines of the stall rows
  replaces: [[85, 1030], [97, 1030]],
  blocks: [],
  keep: [[mx(76), mx(102), mz(984), mz(1057)], [mx(102), mx(116.5), mz(1014), mz(1057)], [mx(101), mx(116.5), mz(966), mz(975.5)]],
  extras: (k: Kit) => {
    // the ground: block paving over the whole market, its lanes and the walk along the roadside shops (owner: paved,
    // not lawn), and the paved car park before the long block's north end (slides 7, 8)
    const pv = pavers('legon');
    pave(k, mx(76), mx(103), mz(984), mz(1057), pv, 0.03, 2);
    pave(k, mx(103), mx(116.5), mz(1014), mz(1057), pv, 0.03, 2);
    pave(k, mx(101), mx(116.5), mz(966), mz(975.5), pv, 0.03, 2);
    for (const [x, c] of [[104.6, '#e9e9ea'], [107.4, '#2b3b5a'], [113, '#8d9196']] as [number, string][]) car(k, mx(x), mz(970.6), 'z', c);
    // zones from the owner's aerial: the blue stall in the north-west corner, the grey-blue lean-to along the
    // west side, the long red rows, the red block north of the tree, the purple rows south of it and the three
    // orange sheds along the lane by the supermarket
    // the gaps between the rows are at least twice what they first were (owner): 1 m between neighbouring rows, a
    // 2 m lane between the two red rows that face each other, 2 m and 3.8 m lanes, 1 m between the orange sheds
    stalls(k, mx(79), mx(84.5), mz(985.5), mz(993.5), SHEET, 'x0');
    stalls(k, mx(77.8), mx(80.8), mz(1004), mz(1024), SHEET, 'x0');
    stalls(k, mx(81.8), mx(85.3), mz(997), mz(1046), SHEET, 'x0');
    stalls(k, mx(87.3), mx(90.8), mz(997), mz(1046), SHEET, 'x1');
    stalls(k, mx(92.8), mx(101.5), mz(997), mz(1003.5), SHEET, 'z0');
    stalls(k, mx(92.8), mx(97), mz(1022), mz(1046), SHEET, 'x0');
    stalls(k, mx(100.8), mx(104), mz(1022), mz(1046), SHEET, 'x1');
    stalls(k, mx(106), mx(113.6), mz(1016), mz(1028.75), '#9c4f3a', 'x1', true);
    stalls(k, mx(106), mx(113.6), mz(1029.75), mz(1044.25), '#9c4f3a', 'x1', true);
    stalls(k, mx(106), mx(113.6), mz(1045.25), mz(1055), '#9c4f3a', 'x1', true);
    // the shade tree in the middle, and benches under it
    k.plain.push([new THREE.CylinderGeometry(0.35, 0.45, 3.6, 8).translate(mx(97.5), 1.8, mz(1013)), '#6b4a33']);
    k.plain.push([new THREE.IcosahedronGeometry(4.2, 1).scale(1, 0.75, 1).translate(mx(97.5), 5.6, mz(1013)), '#3f7a35']);
    for (const s of [-1, 1]) k.plain.push([box(mx(95) , mx(100), 0, 0.45, mz(1013) + s * 2.6 - 0.25, mz(1013) + s * 2.6 + 0.25), '#8a6a48']);
  },
};

// ---------- the one-floor buildings round the market (owner: circled yellow) ----------
const BROWN = '#6d5945', TAN = '#b4a084', TILE = '#b5683f';
// (the Basic School's blocks south of the market are modelled in basicschool.ts, not here: a second model of the same
// walls fought it and the paint flickered, owner)
const ROUND: [string, [number, number][]][] = [
  [BROWN, [[-58.7, 951.0],[-46.6, 953.9],[-48.5, 961.8],[-60.6, 958.8]]], // ml:69ab5c5b-fe55-4448-8aa0-e5a4fe4e91e0 (aerial #65623e)
  [BROWN, [[55.8, 1044.9],[49.0, 1044.7],[50.0, 1024.0],[56.7, 1024.4]]], // ml:7f6d90c8-ed53-4517-bcff-bd2e260d4c30 (aerial #454b34)
  [TAN, [[-76.9, 1003.4],[-76.5, 992.6],[-58.8, 993.2],[-59.2, 1003.9]]], // ml:f3ead4b6-6f26-4091-9a5e-b76f96a67f13 (aerial #b5a182)
  [TILE, [[46.4, 977.2],[36.2, 976.6],[37.8, 950.6],[48.0, 951.3]]], // osm:way/572423842 (aerial #ad9070)
  [TILE, [[45.5, 1010.5],[33.8, 1009.6],[35.8, 984.4],[47.5, 985.3]]], // osm:way/572423843 (aerial #c0987a)
  [BROWN, [[15.8, 1044.4],[16.0, 1034.0],[41.9, 1034.5],[41.7, 1044.9]]], // osm:way/572423845 (aerial #75634c)
  [BROWN, [[42.6, 1061.0],[44.4, 1071.1],[50.4, 1070.1],[48.6, 1059.9]]], // osm:way/773864850 (aerial #44412f)
  [TAN, [[50.5, 1048.6],[50.6, 1051.5],[40.7, 1051.7],[42.2, 1048.7]]], // osm:way/773864851 (aerial #987f65)
  [BROWN, [[32.5, 1019.9],[32.1, 1027.5],[38.3, 1027.8],[38.8, 1020.3]]], // osm:way/773864852 (aerial #867356)
];
const SHED: Style = {
  bay: 3.4, up: [], ground: [[86, 256 + 70, 84, 96]],
  draw: (g) => {
    render(g, '#efe9dc');
    window_(g, [86, 256 + 70, 84, 96], '#d9d3c4', 2, 0.3);
    g.fillStyle = '#9a7b5a'; g.fillRect(0, 256 + 236, 256, 20);
  },
};
function oneFloor([roof, ring]: [string, [number, number][]], i: number): Spec {
  const n = ring.length;
  let cx = 0, cz = 0;
  for (const [x, z] of ring) { cx += x / n; cz += z / n; }
  let axis: [number, number] = [1, 0];
  const blocks: Block[] = [];
  const sheet = roof !== TILE;
  if (n === 4) {
    // a rectangle at any angle: its long side sets the model's axis
    let best = 0, ax = 1, az = 0;
    for (let j = 0; j < 4; j++) {
      const [x0, z0] = ring[j], [x1, z1] = ring[(j + 1) % 4], l = Math.hypot(x1 - x0, z1 - z0);
      if (l > best) { best = l; ax = (x1 - x0) / l; az = (z1 - z0) / l; }
    }
    axis = [ax, az];
    const loc = ring.map(([x, z]) => [(x - cx) * ax + (z - cz) * az, -(x - cx) * az + (z - cz) * ax]);
    const xs = loc.map((p) => p[0]), zs = loc.map((p) => p[1]);
    blocks.push({ x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), floors: 1 });
  } else for (const [x0, x1, z0, z1] of rectsOf(ring)) blocks.push({ x0: x0 - cx, x1: x1 - cx, z0: z0 - cz, z1: z1 - cz, floors: 1 });
  // a point inside the footprint for the generic builder to skip: the middle of its first block
  const b0 = blocks[0], mx0 = (b0.x0 + b0.x1) / 2, mz0 = (b0.z0 + b0.z1) / 2;
  const inside: [number, number] = [cx + mx0 * axis[0] - mz0 * axis[1], cz + mx0 * axis[1] + mz0 * axis[0]];
  return {
    name: `round the Night Market ${i + 1}`,
    axis, origin: [cx, cz], storey: 3.4, style: SHED, roofColor: roof, fascia: sheet ? '#8a7a66' : '#efe9dc', pitch: sheet ? 0.2 : 0.42,
    replaces: [inside],
    blocks,
    keep: [],
    extras: () => {},
  };
}

/** the Night Market, its supermarket and the one-floor buildings round it */
export const nightMarket = createSite('nightmarket', [market, supermart, ...ROUND.map(oneFloor)]);
