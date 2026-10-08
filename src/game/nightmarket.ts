// The Night Market west of the banking square, and the one-floor buildings round it (owner's aerials, registered
// to the OSM footprints; block engine: blocks.ts).
//
// The market (circled blue) is not a set of buildings of rooms but market zones: rows of stall cubicles under
// sheet roofs on posts, red, blue, purple and orange, with lanes between them and a shade tree in the middle.
// On its east side, by the road opposite the banking square, the supermarket (circled black): one floor, a
// shopfront of glass under a canopy and SUPERMART in raised red letters on the wall. The market stood south
// of the banking square only while it was relocated for construction; that ground is grass, trees and soil now.
//
// Round it (circled yellow): one-floor buildings, a ground floor only, each under a roof the colour the aerial
// shows: rusty brown sheets, faded tan sheets or terracotta tiles.
import * as THREE from 'three';
import { WHITE, box, rnd } from './modelkit';
import { PL, createSite, render, window_, type Block, type Kit, type Spec, type Style } from './blocks';
import { rectsOf } from './rectilinear';
import { letters } from './letters';

// ---------- the supermarket ----------
// 2 m west of the roof on the aerial, so the entrance keeps a pavement in front of it, short of the road
const SM: [number, number, number, number] = [103, 114.2, 975.5, 1014];
const SMO: [number, number] = [(SM[0] + SM[1]) / 2, (SM[2] + SM[3]) / 2];
const SM_WALL: Style = {
  bay: 3.2, up: [], ground: [[90, 256 + 40, 76, 50]],
  draw: (g) => { render(g, '#f5f4ef'); window_(g, [90, 256 + 40, 76, 50], '#e2e2dc', 2, 0); },
};
/** the shopfront: glass from the plinth to the canopy, in a light frame */
const SHOPFRONT: Style = {
  bay: 2.4, up: [], ground: [[14, 256 + 40, 228, 196]],
  draw: (g) => {
    render(g, '#f5f4ef');
    window_(g, [14, 256 + 40, 228, 196], '#e4e6e8', 2, 0);
    // posters of the week's offers in the glass
    g.fillStyle = '#e8c12f'; g.fillRect(30, 256 + 150, 50, 66);
    g.fillStyle = '#d43a2c'; g.fillRect(36, 256 + 158, 38, 14);
  },
};
const supermart: Spec = {
  name: 'Supermart (Night Market)',
  axis: [1, 0], origin: SMO, storey: 4.6, style: SM_WALL, roofColor: '#b45a3a', fascia: '#f5f4ef', pitch: 0.3,
  replaces: [SMO],
  blocks: [{ x0: SM[0] - SMO[0], x1: SM[1] - SMO[0], z0: SM[2] - SMO[1], z1: SM[3] - SMO[1], floors: 1, faces: { x1: SHOPFRONT } }],
  keep: [[SM[1] - SMO[0], SM[1] - SMO[0] + 2, -6, 6]],
  extras: (k: Kit) => {
    const ex = SM[1] - SMO[0], dz = 994.7 - SMO[1];
    // the canopy over the doors, held off the wall on brackets: it stays over the pavement, short of the road
    k.plain.push([box(ex, ex + 1.6, 3.05, 3.3, dz - 4, dz + 4), '#1d7a3c']);
    k.plain.push([box(ex, ex + 1.6, 3.0, 3.05, dz - 4, dz + 4), '#e9e9e4']);
    for (const z of [dz - 3.5, dz, dz + 3.5]) k.plain.push([new THREE.BoxGeometry(1.9, 0.08, 0.08).rotateZ(0.6).translate(ex + 0.75, 2.55, z), '#d9d9d4']);
    // glazed sliding doors
    k.plain.push([box(ex, ex + 0.06, PL, PL + 2.5, dz - 1.6, dz + 1.6), '#9fb6c4']);
    k.plain.push([box(ex + 0.06, ex + 0.08, PL, PL + 2.5, dz - 0.03, dz + 0.03), '#e4e6e8']);
    k.plain.push([box(ex, ex + 1.6, 0, 0.12, dz - 4, dz + 4), '#cfc9bd']);
    // SUPERMART in raised red letters on the wall over the canopy, and again on the north end over the car park
    k.plain.push([box(ex, ex + 0.04, 3.55, 4.9, -12, 12), '#1d7a3c']);
    letters(k, 'SUPERMART', ex + 0.04, 4.22, 0, Math.PI / 2, 1.0, 0.18, '#d42a2a');
    const nz = SM[2] - SMO[1];
    letters(k, 'SUPERMART', 0, 3.7, nz, Math.PI, 0.75, 0.15, '#d42a2a');
    // trolleys parked along the wall by the door
    for (let i = 0; i < 3; i++) k.plain.push([box(ex + 0.3, ex + 1.1, 0.25, 1.0, dz + 4.4 + i * 0.35, dz + 4.65 + i * 0.35), '#9aa0a6']);
  },
};

// ---------- the market zones ----------
const MO: [number, number] = [98, 1016];
const mx = (x: number) => x - MO[0], mz = (z: number) => z - MO[1];
const GOODS = ['#e8c12f', '#d43a2c', '#2f7fc8', '#3f9a4a', '#f08a2c', '#8a4fb0', '#f4f1ea', '#6b4a33'];
/** a sheet roof on posts over a row of stalls: a low ridge along the row, eaves at 2.9 m */
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
  }
}
/**
 * A row of stall cubicles x0..x1, z0..z1 (model frame): a slab, a back wall on the `back` side, partitions
 * every 3 m, counters and goods along the open front, posts and a sheet roof.
 */
function stalls(k: Kit, x0: number, x1: number, z0: number, z1: number, roof: string, back: 'x0' | 'x1' | 'z0' | 'z1') {
  const alongZ = back === 'x0' || back === 'x1';
  k.plain.push([box(x0, x1, 0, 0.15, z0, z1), '#c9c3b5']);
  const [a0, a1] = alongZ ? [z0, z1] : [x0, x1];
  const n = Math.max(1, Math.round((a1 - a0) / 3)), step = (a1 - a0) / n;
  // the back wall and the partitions
  if (back === 'x0') k.plain.push([box(x0, x0 + 0.15, 0, 2.6, z0, z1), '#ece7da']);
  if (back === 'x1') k.plain.push([box(x1 - 0.15, x1, 0, 2.6, z0, z1), '#ece7da']);
  if (back === 'z0') k.plain.push([box(x0, x1, 0, 2.6, z0, z0 + 0.15), '#ece7da']);
  if (back === 'z1') k.plain.push([box(x0, x1, 0, 2.6, z1 - 0.15, z1), '#ece7da']);
  const front = back === 'x0' ? x1 : back === 'x1' ? x0 : back === 'z0' ? z1 : z0;
  for (let i = 0; i <= n; i++) {
    const t = a0 + i * step;
    if (alongZ) k.plain.push([box(x0, x1, 0, 2.6, t - 0.06, t + 0.06), '#e4ded0']);
    else k.plain.push([box(t - 0.06, t + 0.06, 0, 2.6, z0, z1), '#e4ded0']);
    // posts carrying the roof at the open front
    if (alongZ) k.plain.push([box(front - 0.07, front + 0.07, 0, 2.95, t - 0.07, t + 0.07), '#8d8f91']);
    else k.plain.push([box(t - 0.07, t + 0.07, 0, 2.95, front - 0.07, front + 0.07), '#8d8f91']);
  }
  // in each cubicle: a counter at the front, goods stacked on it and on shelves behind; a few shutters down
  for (let i = 0; i < n; i++) {
    const c0 = a0 + i * step + 0.15, c1 = a0 + (i + 1) * step - 0.15;
    if (rnd() < 0.18) {
      const shutter = ['#3d6fb0', '#2f8a4a', '#b8442e', '#8c8f93'][(rnd() * 4) | 0];
      if (alongZ) k.plain.push([box(front - 0.04, front + 0.04, 0.15, 2.5, c0, c1), shutter]);
      else k.plain.push([box(c0, c1, 0.15, 2.5, front - 0.04, front + 0.04), shutter]);
      continue;
    }
    const inward = back === 'x0' || back === 'z0' ? -1 : 1;
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
  keep: [[mx(76), mx(102), mz(984), mz(1057)], [mx(102), mx(114), mz(1015), mz(1056)]],
  extras: (k: Kit) => {
    // zones from the owner's aerial: the blue stall in the north-west corner, the grey-blue lean-to along the
    // west side, the long red rows, the red block north of the tree, the purple rows south of it and the three
    // orange sheds along the lane by the supermarket
    // the gaps between the rows are at least twice what they first were (owner): 1 m between neighbouring rows, a
    // 2 m lane between the two red rows that face each other, 2 m and 3.8 m lanes, 1 m between the orange sheds
    stalls(k, mx(79), mx(84.5), mz(985.5), mz(993.5), '#4b5fae', 'x0');
    stalls(k, mx(77.8), mx(80.8), mz(1004), mz(1024), '#8c9bb0', 'x0');
    stalls(k, mx(81.8), mx(85.3), mz(997), mz(1046), '#b4503b', 'x0');
    stalls(k, mx(87.3), mx(90.8), mz(997), mz(1046), '#b4503b', 'x1');
    stalls(k, mx(92.8), mx(101.5), mz(997), mz(1003.5), '#b4503b', 'z0');
    stalls(k, mx(92.8), mx(97), mz(1022), mz(1046), '#6a5aa6', 'x0');
    stalls(k, mx(100.8), mx(104), mz(1022), mz(1046), '#5266b5', 'x1');
    stalls(k, mx(106), mx(113.6), mz(1016), mz(1028.75), '#d8844f', 'x1');
    stalls(k, mx(106), mx(113.6), mz(1029.75), mz(1044.25), '#d8844f', 'x1');
    stalls(k, mx(106), mx(113.6), mz(1045.25), mz(1055), '#d8844f', 'x1');
    // the shade tree in the middle, and benches under it
    k.plain.push([new THREE.CylinderGeometry(0.35, 0.45, 3.6, 8).translate(mx(97.5), 1.8, mz(1013)), '#6b4a33']);
    k.plain.push([new THREE.IcosahedronGeometry(4.2, 1).scale(1, 0.75, 1).translate(mx(97.5), 5.6, mz(1013)), '#3f7a35']);
    for (const s of [-1, 1]) k.plain.push([box(mx(95) , mx(100), 0, 0.45, mz(1013) + s * 2.6 - 0.25, mz(1013) + s * 2.6 + 0.25), '#8a6a48']);
  },
};

// ---------- the one-floor buildings round the market (owner: circled yellow) ----------
const BROWN = '#6d5945', TAN = '#b4a084', TILE = '#b5683f';
const ROUND: [string, [number, number][]][] = [
  [BROWN, [[-58.7, 951.0],[-46.6, 953.9],[-48.5, 961.8],[-60.6, 958.8]]], // ml:69ab5c5b-fe55-4448-8aa0-e5a4fe4e91e0 (aerial #65623e)
  [BROWN, [[55.8, 1044.9],[49.0, 1044.7],[50.0, 1024.0],[56.7, 1024.4]]], // ml:7f6d90c8-ed53-4517-bcff-bd2e260d4c30 (aerial #454b34)
  [TAN, [[-76.9, 1003.4],[-76.5, 992.6],[-58.8, 993.2],[-59.2, 1003.9]]], // ml:f3ead4b6-6f26-4091-9a5e-b76f96a67f13 (aerial #b5a182)
  [TILE, [[-77.8, 1064.8],[-60.4, 1064.3],[-59.5, 1099.9],[-56.8, 1099.8],[-56.6, 1108.7],[-78.6, 1109.3],[-78.8, 1100.0],[-76.9, 1099.9]]], // osm:way/1184490337 (aerial #b27964)
  [TILE, [[-185.1, 1071.0],[-151.6, 1070.5],[-151.4, 1082.8],[-184.9, 1083.3]]], // osm:way/570550186 (aerial #b49675)
  [TILE, [[-127.9, 1007.8],[-127.8, 1017.8],[-153.8, 1018.0],[-153.9, 1008.0]]], // osm:way/572423839 (aerial #a27555)
  [TAN, [[-102.0, 1006.6],[-92.3, 1006.1],[-92.0, 1012.0],[-101.7, 1012.5]]], // osm:way/572423840 (aerial #b19c7f)
  [TILE, [[46.4, 977.2],[36.2, 976.6],[37.8, 950.6],[48.0, 951.3]]], // osm:way/572423842 (aerial #ad9070)
  [TILE, [[45.5, 1010.5],[33.8, 1009.6],[35.8, 984.4],[47.5, 985.3]]], // osm:way/572423843 (aerial #c0987a)
  [BROWN, [[15.8, 1044.4],[16.0, 1034.0],[41.9, 1034.5],[41.7, 1044.9]]], // osm:way/572423845 (aerial #75634c)
  [BROWN, [[-17.8, 1039.2],[-17.8, 1028.8],[8.2, 1028.8],[8.2, 1039.2]]], // osm:way/572423846 (aerial #8d7f6a)
  [BROWN, [[-23.4, 1016.2],[-22.1, 1049.7],[-34.6, 1050.2],[-36.0, 1016.7]]], // osm:way/572423848 (aerial #71634d)
  [BROWN, [[-118.1, 1027.2],[-75.7, 1026.0],[-75.4, 1035.7],[-117.8, 1037.0]]], // osm:way/572423850 (aerial #6b5d47)
  [BROWN, [[-190.8, 1026.4],[-154.3, 1026.5],[-154.3, 1037.3],[-190.8, 1037.2]]], // osm:way/572423853 (aerial #726048)
  [TILE, [[-153.6, 983.9],[-153.6, 1007.7],[-164.9, 1007.7],[-164.9, 983.9]]], // osm:way/572423854 (aerial #a27052)
  [BROWN, [[-168.3, 985.6],[-174.3, 985.6],[-174.4, 980.1],[-168.3, 980.0]]], // osm:way/572423855 (aerial #676448)
  [TILE, [[-153.1, 983.9],[-153.3, 974.1],[-128.5, 973.6],[-128.3, 983.4]]], // osm:way/572423857 (aerial #b3805e)
  [BROWN, [[-192.1, 1047.4],[-151.0, 1047.0],[-150.9, 1058.1],[-192.0, 1058.5]]], // osm:way/715088041 (aerial #6b5840)
  [BROWN, [[-151.0, 1047.0],[-140.9, 1046.8],[-141.1, 1030.3],[-129.6, 1030.2],[-129.4, 1046.4],[-101.8, 1046.2],[-101.7, 1057.9],[-130.8, 1058.2],[-130.7, 1067.3],[-141.5, 1067.5],[-141.6, 1058.0],[-150.9, 1058.1]]], // osm:way/715088042 (aerial #695d41)
  [BROWN, [[-72.5, 1019.6],[-72.3, 1032.5],[-39.2, 1031.9],[-39.5, 1019.0]]], // osm:way/715088044 (aerial #6c5c44)
  [BROWN, [[-86.1, 974.7],[-85.7, 987.4],[-35.4, 985.8],[-35.8, 973.0]]], // osm:way/715088049 (aerial #6b5d47)
  [BROWN, [[42.6, 1061.0],[44.4, 1071.1],[50.4, 1070.1],[48.6, 1059.9]]], // osm:way/773864850 (aerial #44412f)
  [TAN, [[50.5, 1048.6],[50.6, 1051.5],[40.7, 1051.7],[42.2, 1048.7]]], // osm:way/773864851 (aerial #987f65)
  [BROWN, [[32.5, 1019.9],[32.1, 1027.5],[38.3, 1027.8],[38.8, 1020.3]]], // osm:way/773864852 (aerial #867356)
  [TILE, [[-116.6, 1009.0],[-116.2, 984.8],[-107.2, 984.9],[-107.6, 1009.2]]], // osm:way/572423841 (orange tiles on the aerial; added by hand: the roof read as part of the yellow line)
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
