// The University of Ghana Basic School south of La Road, opposite Valco (owner's aerial, photo of a classroom block,
// photo of the entrance; block engine: blocks.ts).
//
// One-floor classroom blocks round sandy yards. The paint (owner's photo): white walls with a grey-blue band along
// the foot, red-brown wooden doors and louvred windows behind a verandah of square white columns with grey feet.
// Roofs as the aerial shows them: terracotta tiles on the blocks round the north-west court and the one beside it,
// dark brown sheets on the long blocks and the cross-shaped block, grey sheets on the small block and the one by the
// car park, pale sheets on the south-west block, and salmon-red sheets on the hall south of the car park.
//
// The entrance (owner's photo) faces Valco across La Road, on the road into the school: two red-brick pillars, a small
// gatehouse with a brown hipped roof on red pillars, a black iron sliding gate, the school's sign board on posts, a
// paved apron. The fence along La Road: a low wall of grey stone under a coping, white square pillars at intervals and
// black iron railings between them.
import * as THREE from 'three';
import { box, speckle } from './modelkit';
import { PL, createSite, type Block, type Kit, type Spec, type Style } from './blocks';
import { rectsOf } from './rectilinear';

const ORANGE = '#c0613f', BROWN = '#5c4a40', GREY = '#77736e', PALE = '#a8a095', HALL = '#cf6a5e';
const DADO = '#7f8c94', DOOR = '#8a4a2e';

/** the verandah side of a classroom block: white wall, grey band at the foot, a brown door and a louvred window to a
 *  bay, a white column with a grey foot between bays */
const CLASS_WALL: Style = {
  bay: 3.4,
  up: [], ground: [[150, 256 + 70, 76, 110]],
  draw: (g) => {
    g.fillStyle = '#f5f4f0'; g.fillRect(0, 0, 256, 512);
    speckle(g, 0, 0, 256, 512, 1500, ['#ecebe6', '#fbfaf7', '#e5e3dd']);
    // the shade of the verandah over the wall
    const sh = g.createLinearGradient(0, 256, 0, 330); sh.addColorStop(0, 'rgba(60,60,60,0.28)'); sh.addColorStop(1, 'rgba(60,60,60,0.05)');
    g.fillStyle = sh; g.fillRect(0, 256, 256, 256);
    // the grey band along the foot
    g.fillStyle = DADO; g.fillRect(0, 256 + 150, 256, 106);
    // the door and the window
    g.fillStyle = '#5d3320'; g.fillRect(56, 256 + 44, 70, 212);
    g.fillStyle = DOOR; g.fillRect(60, 256 + 48, 62, 208);
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(90, 256 + 48, 2, 208);
    g.fillStyle = '#3a3f44'; g.fillRect(150, 256 + 70, 76, 110);
    g.fillStyle = '#9aa1a6'; for (let y = 256 + 74; y < 256 + 180; y += 9) g.fillRect(150, y, 76, 3);
    // the column between bays
    g.fillStyle = '#fbfbf8'; g.fillRect(0, 256, 20, 256);
    g.fillStyle = DADO; g.fillRect(0, 256 + 150, 20, 106);
    // high vents under the eave
    g.fillStyle = '#4b4f54'; for (const x of [70, 150, 200]) g.fillRect(x, 256 + 12, 26, 14);
  },
};
/** the ends and backs: white over the grey band, a louvred window */
const PLAIN: Style = {
  bay: 3.6, up: [], ground: [[90, 256 + 70, 76, 100]],
  draw: (g) => {
    g.fillStyle = '#f5f4f0'; g.fillRect(0, 0, 256, 512);
    speckle(g, 0, 0, 256, 512, 1500, ['#ecebe6', '#fbfaf7', '#e5e3dd']);
    g.fillStyle = DADO; g.fillRect(0, 256 + 150, 256, 106);
    g.fillStyle = '#3a3f44'; g.fillRect(90, 256 + 70, 76, 100);
    g.fillStyle = '#9aa1a6'; for (let y = 256 + 74; y < 256 + 170; y += 9) g.fillRect(90, y, 76, 3);
  },
};

interface Bld { id: string; roof: string; ring: [number, number][] }
const BUILDINGS: Bld[] = [
  { id: 'osm:way/1184490337', roof: HALL, ring: [[-77.8, 1064.8], [-60.4, 1064.3], [-59.5, 1099.9], [-56.8, 1099.8], [-56.6, 1108.7], [-78.6, 1109.3], [-78.8, 1100.0], [-76.9, 1099.9]] },
  { id: 'osm:way/570550186', roof: PALE, ring: [[-185.1, 1071.0], [-151.6, 1070.5], [-151.4, 1082.8], [-184.9, 1083.3]] },
  { id: 'osm:way/572423839', roof: ORANGE, ring: [[-127.9, 1007.8], [-127.8, 1017.7], [-153.8, 1018.0], [-153.9, 1008.0]] },
  { id: 'osm:way/572423840', roof: GREY, ring: [[-102.0, 1006.6], [-92.3, 1006.1], [-92.0, 1012.0], [-101.7, 1012.5]] },
  { id: 'osm:way/572423841', roof: ORANGE, ring: [[-116.6, 1009.0], [-116.2, 984.8], [-107.2, 984.9], [-107.6, 1009.2]] },
  { id: 'osm:way/572423846', roof: GREY, ring: [[-17.8, 1039.2], [-17.8, 1028.8], [8.2, 1028.8], [8.2, 1039.2]] },
  { id: 'osm:way/572423848', roof: BROWN, ring: [[-23.4, 1016.2], [-22.1, 1049.7], [-34.6, 1050.2], [-36.0, 1016.7]] },
  { id: 'osm:way/572423850', roof: BROWN, ring: [[-118.1, 1027.2], [-75.7, 1026.0], [-75.4, 1035.7], [-117.8, 1037.0]] },
  { id: 'osm:way/572423853', roof: BROWN, ring: [[-190.8, 1026.4], [-154.3, 1026.5], [-154.3, 1037.3], [-190.8, 1037.3]] },
  { id: 'osm:way/572423854', roof: ORANGE, ring: [[-153.6, 983.9], [-153.6, 1007.7], [-164.9, 1007.7], [-164.9, 983.9]] },
  { id: 'osm:way/572423855', roof: ORANGE, ring: [[-168.3, 985.6], [-174.3, 985.6], [-174.4, 980.1], [-168.3, 980.0]] },
  { id: 'osm:way/572423857', roof: ORANGE, ring: [[-153.1, 983.9], [-153.3, 974.1], [-128.5, 973.6], [-128.3, 983.4]] },
  { id: 'osm:way/715088041', roof: BROWN, ring: [[-192.1, 1047.4], [-151.0, 1046.9], [-150.9, 1058.1], [-192.0, 1058.5]] },
  { id: 'osm:way/715088042', roof: BROWN, ring: [[-151.0, 1046.9], [-140.9, 1046.8], [-141.1, 1030.3], [-129.6, 1030.2], [-129.4, 1046.4], [-101.8, 1046.2], [-101.7, 1057.9], [-130.8, 1058.2], [-130.7, 1067.3], [-141.5, 1067.5], [-141.6, 1058.0], [-150.9, 1058.1]] },
  { id: 'osm:way/715088044', roof: BROWN, ring: [[-72.5, 1019.6], [-72.3, 1032.5], [-39.2, 1031.9], [-39.5, 1019.0]] },
  { id: 'osm:way/715088049', roof: BROWN, ring: [[-86.1, 974.7], [-85.7, 987.4], [-35.3, 985.8], [-35.8, 973.1]] },
];

function block(b: Bld): Spec {
  const n = b.ring.length;
  let cx = 0, cz = 0;
  for (const [x, z] of b.ring) { cx += x / n; cz += z / n; }
  let best = 0, ang = 0;
  for (let i = 0; i < n; i++) {
    const [ax, az] = b.ring[i], [bx, bz] = b.ring[(i + 1) % n], l = Math.hypot(bx - ax, bz - az);
    if (l > best) { best = l; ang = Math.atan2(bz - az, bx - ax); }
  }
  ang = ((ang % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
  const ux = Math.cos(ang), uz = Math.sin(ang);
  const loc = (x: number, z: number): [number, number] => [(x - cx) * ux + (z - cz) * uz, -(x - cx) * uz + (z - cz) * ux];
  const blocks: Block[] = rectsOf(b.ring.map(([x, z]) => loc(x, z)), 0.9, 1.2).map(([x0, x1, z0, z1]) => {
    // the long sides are the verandahs, the short sides plain
    const long = x1 - x0 >= z1 - z0;
    return { x0, x1, z0, z1, floors: 1, faces: long ? { z0: CLASS_WALL, z1: CLASS_WALL, x0: PLAIN, x1: PLAIN } : { x0: CLASS_WALL, x1: CLASS_WALL, z0: PLAIN, z1: PLAIN } };
  });
  const b0 = blocks[0];
  return {
    name: `Basic School block ${b.id}`,
    axis: [ux, uz], origin: [cx, cz], storey: 3.4, style: PLAIN, roofColor: b.roof, fascia: '#f3f2ee', pitch: 0.38,
    plinth: '#6f7a81',
    replaces: [[cx + ((b0.x0 + b0.x1) / 2) * ux - ((b0.z0 + b0.z1) / 2) * uz, cz + ((b0.x0 + b0.x1) / 2) * uz + ((b0.z0 + b0.z1) / 2) * ux]],
    blocks,
    keep: [],
    extras: (k: Kit) => {
      // the verandah columns standing proud of the long walls, white with grey feet
      for (const bl of blocks) {
        const long = bl.x1 - bl.x0 >= bl.z1 - bl.z0;
        const len = long ? bl.x1 - bl.x0 : bl.z1 - bl.z0, nb = Math.max(1, Math.round(len / 3.4));
        for (let i = 0; i <= nb; i++) {
          const t = (long ? bl.x0 : bl.z0) + (len * i) / nb;
          for (const side of [-1, 1]) {
            const w = long ? (side < 0 ? bl.z0 - 0.45 : bl.z1 + 0.45) : (side < 0 ? bl.x0 - 0.45 : bl.x1 + 0.45);
            const [x, z] = long ? [t, w] : [w, t];
            k.plain.push([box(x - 0.17, x + 0.17, 0, k.wallTop(1) - 0.1, z - 0.17, z + 0.17), '#f7f7f3']);
            k.plain.push([box(x - 0.19, x + 0.19, 0, 0.9, z - 0.19, z + 0.19), DADO]);
          }
        }
      }
    },
  };
}

// ---------- the entrance and the fence along La Road ----------
const GO: [number, number] = [-113, 900.5];
const STONE = '#8f8b82', PILLAR = '#f2f1ec', RAIL = '#1d1e20', BRICK = '#b5532f';
/** the fence from x0 to x1 along z (world x, model z = 0): stone wall, white pillars, iron railings */
function fence(k: Kit, x0: number, x1: number) {
  const X = (x: number) => x - GO[0];
  k.plain.push([box(X(x0), X(x1), 0, 0.85, -0.22, 0.22), STONE], [box(X(x0), X(x1), 0.85, 0.95, -0.27, 0.27), '#6f6b64']);
  // stone courses
  for (let x = x0 + 0.5; x < x1; x += 0.9) k.plain.push([box(X(x), X(x + 0.04), 0.05, 0.8, -0.23, 0.23), '#7d796f']);
  const n = Math.max(1, Math.round((x1 - x0) / 3.4));
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    k.plain.push([box(X(x) - 0.24, X(x) + 0.24, 0, 2.2, -0.24, 0.24), PILLAR], [box(X(x) - 0.29, X(x) + 0.29, 2.2, 2.32, -0.29, 0.29), '#dcdad3']);
    if (i < n) {
      const a = x + 0.24, b = x0 + ((x1 - x0) * (i + 1)) / n - 0.24;
      for (const y of [1.0, 1.95]) k.plain.push([box(X(a), X(b), y, y + 0.05, -0.03, 0.03), RAIL]);
      for (let t = a + 0.12; t < b; t += 0.14) k.plain.push([box(X(t) - 0.015, X(t) + 0.015, 0.95, 2.05, -0.015, 0.015), RAIL]);
    }
  }
}
const entrance: Spec = {
  name: 'University of Ghana Basic School entrance',
  axis: [1, 0], origin: GO, storey: 3, style: PLAIN, roofColor: '#6b3f2a', fascia: '#f3f2ee', pitch: 0.4,
  blocks: [],
  keep: [[-150 - GO[0], -20 - GO[0], -1, 7]],
  extras: (k: Kit) => {
    const X = (x: number) => x - GO[0];
    // the fence along La Road, open at the gate and at the road to the roundabout
    fence(k, -147, -117.6);
    fence(k, -104.4, -16.5);
    fence(k, -5.5, 2);
    // the gate: two red-brick pillars with white caps, a black sliding gate drawn back along the fence inside
    for (const x of [-117.4, -108.6]) {
      k.plain.push([box(X(x) - 0.35, X(x) + 0.35, 0, 2.6, -0.35, 0.35), BRICK], [box(X(x) - 0.42, X(x) + 0.42, 2.6, 2.75, -0.42, 0.42), '#efe9e0']);
      for (let y = 0.3; y < 2.6; y += 0.32) k.plain.push([box(X(x) - 0.36, X(x) + 0.36, y, y + 0.03, -0.36, 0.36), '#8e3f24']);
    }
    for (let t = -108.2; t < -104.6; t += 0.13) k.plain.push([box(X(t) - 0.02, X(t) + 0.02, 0.1, 2.0, 0.55, 0.59), RAIL]);
    for (const y of [0.15, 1.05, 1.95]) k.plain.push([box(X(-108.3), X(-104.5), y, y + 0.06, 0.53, 0.61), RAIL]);
    // the gatehouse inside the gate on the east: red pillars at its corners, light walls, a brown hipped roof
    const hx0 = X(-104), hx1 = X(-100.4), hz0 = 1.2, hz1 = 4.2;
    k.plain.push([box(hx0 + 0.2, hx1 - 0.2, 0, 2.5, hz0 + 0.2, hz1 - 0.2), '#e9e4da']);
    for (const [x, z] of [[hx0, hz0], [hx1, hz0], [hx0, hz1], [hx1, hz1]]) k.plain.push([box(x - 0.2, x + 0.2, 0, 2.6, z - 0.2, z + 0.2), BRICK]);
    k.plain.push([box(hx0 + 0.6, hx0 + 1.6, 0.9, 1.8, hz0 + 0.15, hz0 + 0.2), '#2b3036']);
    k.plain.push([new THREE.ConeGeometry(Math.hypot(hx1 - hx0, hz1 - hz0) / 2 + 0.5, 1.2, 4).rotateY(Math.PI / 4).scale(1, 1, (hz1 - hz0) / (hx1 - hx0)).translate((hx0 + hx1) / 2, 3.2, (hz0 + hz1) / 2), '#6b3f2a']);
    // the yellow and blue shade beside the gatehouse
    k.plain.push([new THREE.ConeGeometry(0.9, 1.9, 4).translate(X(-106.2), 0.95, 2.4), '#f2d03a'], [new THREE.ConeGeometry(0.55, 1.95, 4).rotateY(0.8).translate(X(-106.2), 0.98, 2.4), '#2f3f9a']);
    // the paved apron of brick pavers from the road through the gate
    k.plain.push([box(X(-119), X(-99), -0.02, 0.04, -2.5, 5), '#a9806a']);
    // the school's sign board on two posts inside the fence west of the gate
    for (const x of [-122.6, -120.4]) k.plain.push([box(X(x) - 0.05, X(x) + 0.05, 0, 2.6, 1.0, 1.1), '#c9ccd0']);
    k.plain.push([box(X(-122.9), X(-120.1), 1.4, 2.7, 0.94, 1.0), '#f6f6f3']);
    k.signs.push({ text: 'UNIVERSITY OF GHANA BASIC SCHOOL', x: X(-121.5), y: 2.3, z: 0.92, ry: Math.PI, w: 2.6, colors: ['#f6f6f3', '#1d3f7a'] });
  },
};

/** the Basic School's blocks, its entrance and its fence */
export const basicSchool = createSite('basicschool', [...BUILDINGS.map(block), entrance]);
