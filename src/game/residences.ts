// Ground-floor buildings the owner has marked, and the wood round the lecturers' houses (block engine: blocks.ts).
//
// - Along the Volta Hall Road stretch north-west of CEDI (owner's aerial, circled blue): small one-floor buildings,
//   now modelled from the owner's photos in voltafront.ts.
// - Opposite the Business School's front, across the road: the Larway Oraca Building (circled yellow), four one-floor
//   wings in a cross round a small court under hipped red tiles, white walls with a white parapet gable on each wing's
//   end (owner's photo); its door on the south. South of it, the cross-shaped building circled purple: one floor,
//   white, red tiles, a gabled porch in the middle of its east front over glazed doors (owner's photo), entered there.
// - East of the Akuafo and Mensah Sarbah annexes, between Akuafo Road, E.A. Boateng Road and La Road (circled): the
//   lecturers' houses, all one floor, each with a front door, a little porch and a gate in its hedge toward its road,
//   standing in a wood: trees all through, the ground under them leaf litter and bare red earth, not lawn.
// - South of the UG Sports Stadium (circled yellow): houses of one floor, like bungalows, each door toward its road
//   (stadiumhouses.ts), and the Institute of African Studies chalets among them; west of the Diaspora Dome round F.K.
//   Apaloo Crescent, one-floor bungalows in a park of trees (diasporahouses.ts).
import * as THREE from 'three';
import { WHITE, box } from './modelkit';
import { PL, createSite, render, window_, type Block, type Kit, type Spec, type Style } from './blocks';
import { rectsOf } from './rectilinear';
import { garden } from './gardens';
import { STADIUM_HOUSES } from './stadiumhouses';
import { DIASPORA_HOUSES } from './diasporahouses';

const WALL: Style = {
  bay: 3.4, up: [], ground: [[86, 256 + 70, 84, 100]],
  draw: (g) => { render(g, '#f4f3ee'); window_(g, [86, 256 + 70, 84, 100], '#e1dfd8', 2, 0.3); g.fillStyle = '#8f7a63'; g.fillRect(0, 512 - 16, 256, 16); },
};
const WIDE: Style = {
  bay: 3.6, up: [], ground: [[30, 256 + 60, 196, 120]],
  draw: (g) => { render(g, '#f4f3ee'); window_(g, [30, 256 + 60, 196, 120], '#e1dfd8', 3, 0); g.fillStyle = '#c9c3b5'; g.fillRect(0, 512 - 16, 256, 16); },
};
const TILE = '#b5502f';
/** the Larway Oraca Building's walls (owner's side view): white gone grey in streaks, pilasters between the bays, a row
 *  of small dark windows high up, a dark grey foot */
const LARWAY_WALL: Style = {
  bay: 3.6, up: [], ground: [[60, 256 + 60, 40, 34], [108, 256 + 60, 40, 34], [156, 256 + 60, 40, 34]],
  draw: (g) => {
    render(g, '#eeede8');
    for (let i = 0; i < 22; i++) {
      const x = (i * 47) % 250, y = 256 + (i % 3) * 30, len = 60 + (i * 31) % 120, gr = g.createLinearGradient(0, y, 0, y + len);
      gr.addColorStop(0, `rgba(105,102,94,${0.18 + (i % 4) * 0.06})`); gr.addColorStop(1, 'rgba(105,102,94,0)');
      g.fillStyle = gr; g.fillRect(x, y, 3 + (i % 5) * 2, len);
    }
    g.fillStyle = '#e2e0d9'; g.fillRect(0, 256, 18, 256); g.fillRect(238, 256, 18, 256);
    g.fillStyle = 'rgba(90,88,82,0.25)'; g.fillRect(18, 256, 3, 256); g.fillRect(235, 256, 3, 256);
    for (const x of [60, 108, 156]) { g.fillStyle = '#d9d7d0'; g.fillRect(x - 4, 256 + 56, 48, 42); g.fillStyle = '#1e2124'; g.fillRect(x, 256 + 60, 40, 34); g.fillStyle = '#3a3f44'; g.fillRect(x + 19, 256 + 60, 2, 34); }
    g.fillStyle = '#9a978e'; g.fillRect(0, 512 - 22, 256, 22);
  },
};

export interface House { id: string; ring: [number, number][]; door: [number, number]; out: [number, number]; walk: number; roof?: string }
/** a one-floor building on its mapped outline, in its own square, with a door (and a walk to its road) */
function house(h: House, opts: { style?: Style; gate?: boolean; porch?: 'canopy' | 'gable'; name?: string } = {}): Spec {
  const n = h.ring.length;
  let cx = 0, cz = 0;
  for (const [x, z] of h.ring) { cx += x / n; cz += z / n; }
  let best = 0, ang = 0;
  for (let i = 0; i < n; i++) {
    const [ax, az] = h.ring[i], [bx, bz] = h.ring[(i + 1) % n], l = Math.hypot(bx - ax, bz - az);
    if (l > best) { best = l; ang = Math.atan2(bz - az, bx - ax); }
  }
  ang = ((ang % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
  const ux = Math.cos(ang), uz = Math.sin(ang);
  const loc = (x: number, z: number): [number, number] => [(x - cx) * ux + (z - cz) * uz, -(x - cx) * uz + (z - cz) * ux];
  const blocks: Block[] = rectsOf(h.ring.map(([x, z]) => loc(x, z)), 0.9, 1.2).map(([x0, x1, z0, z1]) => ({ x0, x1, z0, z1, floors: 1 }));
  const [dx, dz] = loc(...h.door);
  const ox = h.out[0] * ux + h.out[1] * uz, oz = -h.out[0] * uz + h.out[1] * ux;
  const face = Math.atan2(ox, oz);
  const b0 = blocks[0];
  return {
    name: opts.name ?? `house ${h.id}`,
    axis: [ux, uz], origin: [cx, cz], storey: 3.3, style: opts.style ?? WALL, roofColor: h.roof ?? TILE, fascia: '#f1efe9', pitch: 0.45,
    replaces: [[cx + ((b0.x0 + b0.x1) / 2) * ux - ((b0.z0 + b0.z1) / 2) * uz, cz + ((b0.x0 + b0.x1) / 2) * uz + ((b0.z0 + b0.z1) / 2) * ux]],
    blocks,
    keep: [[dx - 2 + ox * 1.5, dx + 2 + ox * 1.5, dz - 2 + oz * 1.5, dz + 2 + oz * 1.5]],
    extras: (k: Kit) => {
      const at = (geo: THREE.BufferGeometry, along: number, out: number, y: number) => geo.rotateY(face).translate(dx + oz * along + ox * out, y, dz - ox * along + oz * out);
      // the front door and a step
      k.plain.push([at(new THREE.BoxGeometry(1.1, 2.2, 0.08), 0, 0.04, PL + 1.1), '#5b3f2c']);
      k.plain.push([at(new THREE.BoxGeometry(2.0, 0.22, 1.2), 0, 0.6, 0.11), '#cfc8bb']);
      if (opts.porch === 'gable') {
        // a gabled porch on two posts over glazed doors (the purple building's east front)
        k.plain.push([at(new THREE.BoxGeometry(3.6, 2.4, 0.06), 0, 0.05, PL + 1.2), '#2d3640']);
        for (const s of [-1, 1]) k.plain.push([at(new THREE.BoxGeometry(0.35, 3.1, 0.35), s * 2.3, 3.2, 1.55), WHITE]);
        for (const s of [-1, 1]) k.plain.push([at(new THREE.BoxGeometry(2.9, 0.12, 4.0).rotateZ(-s * 0.5), s * 1.25, 1.7, 3.85), TILE]);
        k.plain.push([at(new THREE.BoxGeometry(5.6, 0.2, 3.6), 0, 1.7, 0.1), '#cfc8bb']);
      } else {
        k.plain.push([at(new THREE.BoxGeometry(2.2, 0.1, 1.3), 0, 0.65, 2.75), TILE]);
      }
      if (h.walk > 0.5) {
        // a laterite walk out to the road, and a gate in a low hedge across it
        k.plain.push([at(new THREE.BoxGeometry(1.4, 0.05, h.walk), 0, 1.2 + h.walk / 2, 0.025), '#b98a62']);
        if (opts.gate !== false) {
          const g = Math.min(h.walk, 8) + 1.2;
          for (const s of [-1, 1]) {
            k.plain.push([at(new THREE.BoxGeometry(4, 1.0, 0.6), s * 3.2, g, 0.5), '#3f6f30']);
            k.plain.push([at(new THREE.BoxGeometry(0.4, 1.5, 0.4), s * 0.95, g, 0.75), '#e9e6de']);
          }
          k.plain.push([at(new THREE.BoxGeometry(1.5, 1.1, 0.05), 0, g, 0.65), '#2f3a44']);
        }
      }
    },
  };
}

// (the small one-floor buildings along the Volta Hall Road stretch north-west of CEDI are modelled one by one from the
// owner's photos in voltafront.ts)

// ---------- opposite the Business School ----------
/** the Larway Oraca Building: four wings in a cross round a small court, linked round it */
const larway: Spec = (() => {
  const O: [number, number] = [-262.4, -194.2];
  const R = (x0: number, x1: number, z0: number, z1: number, floors = 1, more: Partial<Block> = {}): Block => ({ x0: x0 - O[0], x1: x1 - O[0], z0: z0 - O[1], z1: z1 - O[1], floors, ...more });
  return {
    name: 'Larway Oraca Building',
    axis: [1, 0], origin: O, storey: 3.4, style: LARWAY_WALL, roofColor: TILE, fascia: '#f1efe9', pitch: 0.42, plinth: '#8f8c84',
    replaces: [[-262, -178]],
    blocks: [
      R(-271.3, -255.9, -214.6, -204.2), R(-271.1, -255.6, -183.6, -173.7),
      R(-284.1, -271.1, -204.0, -183.2), R(-255.9, -240.5, -204.3, -183.6),
      // the low covered walks round the court, joining the wings
      R(-271.1, -255.9, -204.2, -200.2, 1, { roof: 'flat' }), R(-271.1, -255.9, -189.0, -183.6, 1, { roof: 'flat' }),
      R(-271.1, -269.7, -200.2, -189.0, 1, { roof: 'flat' }), R(-257.0, -255.9, -200.2, -189.0, 1, { roof: 'flat' }),
    ],
    keep: [[-266 - O[0], -260 - O[0], -173.7 - O[1], -169 - O[1]]],
    extras: (k: Kit) => {
      // the white parapet gable at the end of each wing (owner's photo), and the door on the south (owner's mark)
      const e = k.wallTop(1);
      for (const [x0, x1, z, dir] of [[-271.1, -255.6, -173.7, 1], [-271.3, -255.9, -214.6, -1]] as [number, number, number, number][]) {
        const w = x1 - x0, tri = new THREE.Shape([new THREE.Vector2(-w / 2 - 0.3, 0), new THREE.Vector2(w / 2 + 0.3, 0), new THREE.Vector2(0, 2.4)]);
        k.plain.push([new THREE.ExtrudeGeometry(tri, { depth: 0.5, bevelEnabled: false }).translate((x0 + x1) / 2 - O[0], e - 0.1, z - O[1] - (dir > 0 ? 0 : 0.5)), WHITE]);
      }
      for (const [z0, z1, x, dir] of [[-204, -183.2, -284.1, -1], [-204.3, -183.6, -240.5, 1]] as [number, number, number, number][]) {
        const w = z1 - z0, tri = new THREE.Shape([new THREE.Vector2(-w / 2 - 0.3, 0), new THREE.Vector2(w / 2 + 0.3, 0), new THREE.Vector2(0, 2.4)]);
        k.plain.push([new THREE.ExtrudeGeometry(tri, { depth: 0.5, bevelEnabled: false }).rotateY(Math.PI / 2).translate(x - O[0] - (dir > 0 ? 0.5 : 0), e - 0.1, (z0 + z1) / 2 - O[1]), WHITE]);
      }
      // the black water tank on its stand and a red box in the corner between the north and east wings (side view)
      const tx = -254.4 - O[0], tz = -206.0 - O[1];
      for (const [dx, dz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) k.plain.push([box(tx + dx - 0.05, tx + dx + 0.05, 0, 1.2, tz + dz - 0.05, tz + dz + 0.05), '#6d7175']);
      k.plain.push([box(tx - 0.95, tx + 0.95, 1.2, 1.3, tz - 0.95, tz + 0.95), '#6d7175']);
      k.plain.push([new THREE.CylinderGeometry(0.85, 0.85, 2.1, 16).translate(tx, 2.35, tz), '#1b1c1f']);
      k.plain.push([box(tx + 1.3, tx + 2.5, 0, 0.9, tz - 0.5, tz + 0.4), '#b8452f']);
      const dzz = -173.7 - O[1], dxx = -263.2 - O[0];
      k.plain.push([box(dxx - 1.2, dxx + 1.2, PL, PL + 2.4, dzz, dzz + 0.06), '#2d3640']);
      k.plain.push([box(dxx - 1.8, dxx + 1.8, 2.9, 3.15, dzz, dzz + 1.8), WHITE]);
      k.plain.push([box(dxx - 2.2, dxx + 2.2, 0, 0.15, dzz, dzz + 3), '#cfc8bb']);
      k.signs.push({ text: 'LARWAY ORACA BUILDING', x: dxx, y: 3.45, z: dzz + 1.82, ry: 0, w: 3.6, colors: ['#ffffff', '#1d2a6b'] });
    },
  };
})();
const PURPLE: House = { id: 'osm:way/773888688', ring: [[-265.1, -145.9],[-254.9, -146.0],[-254.8, -134.9],[-252.3, -134.9],[-252.2, -125.9],[-254.7, -125.9],[-254.6, -116.1],[-264.8, -116.0],[-264.8, -122.6],[-279.9, -122.4],[-280.0, -139.0],[-265.0, -139.1]], door: [-252.2, -129.4], out: [1.0, -0.011], walk: 0 };

// ---------- the lecturers' houses east of the annexes ----------
const LECTURERS: House[] = [
  { id: 'ml:ba95c5d9-4ee8-47ad-acf0-e8ddff060a94', ring: [[351.7, 430.0],[358.9, 430.2],[358.6, 443.5],[351.4, 443.4]], door: [351.5, 436.7], out: [-1.0, -0.022], walk: 24.8 },
  { id: 'osm:way/439690552', ring: [[425.5, 428.1],[436.7, 428.2],[436.7, 433.8],[425.5, 433.7]], door: [431.1, 428.1], out: [0.009, -1.0], walk: 28.2 },
  { id: 'osm:way/642127979', ring: [[280.4, 643.2],[300.6, 642.7],[300.5, 634.4],[280.2, 634.9]], door: [300.6, 638.5], out: [1.0, -0.012], walk: 39.4 }, // East Legon 8
  { id: 'osm:way/665126141', ring: [[384.8, 639.3],[384.9, 621.1],[415.8, 621.2],[415.7, 639.4]], door: [384.9, 630.2], out: [-1.0, -0.005], walk: 29.799999999999997 },
  { id: 'osm:way/665126142', ring: [[352.9, 548.8],[381.4, 548.9],[381.3, 570.6],[352.7, 570.4]], door: [367.1, 548.8], out: [0.004, -1.0], walk: 2.9000000000000004 },
  { id: 'osm:way/665126143', ring: [[433.9, 571.7],[465.7, 570.8],[466.3, 589.7],[434.5, 590.6]], door: [434.2, 581.2], out: [-0.999, 0.032], walk: 31.799999999999997 },
  { id: 'osm:way/665126149', ring: [[304.8, 502.8],[311.4, 503.0],[311.7, 506.6],[320.6, 506.4],[320.7, 513.4],[304.4, 513.5]], door: [316.1, 506.5], out: [-0.022, -1.0], walk: 0 }, // East Legon
  { id: 'osm:way/696169978', ring: [[259.4, 419.6],[267.6, 419.7],[267.5, 426.7],[270.7, 426.8],[270.6, 430.5],[274.4, 430.5],[274.3, 436.6],[270.9, 436.5],[270.9, 438.2],[259.2, 438.0]], door: [263.5, 419.6], out: [0.012, -1.0], walk: 13.100000000000001 },
  { id: 'osm:way/744897578', ring: [[333.3, 689.6],[333.5, 681.3],[351.9, 681.7],[352.2, 670.1],[365.1, 670.4],[365.0, 676.1],[361.4, 676.0],[361.0, 690.3]], door: [352.0, 675.9], out: [-1.0, -0.026], walk: 41.8 }, // East Legon 9
  { id: 'osm:way/744922439', ring: [[361.2, 424.7],[361.0, 438.9],[366.0, 440.7],[365.9, 445.8],[382.4, 446.0],[382.5, 441.1],[388.2, 441.2],[388.5, 424.0],[383.3, 423.9],[383.0, 439.0],[366.2, 438.7],[366.4, 424.7]], door: [385.9, 423.9], out: [0.019, -1.0], walk: 16.1 }, // East Legon 11
  { id: 'osm:way/744922440', ring: [[406.7, 502.1],[414.2, 526.0],[436.7, 519.5],[428.4, 494.7]], door: [417.5, 498.4], out: [-0.323, -0.946], walk: 0 }, // East Legon 6
  { id: 'osm:way/744922441', ring: [[255.2, 560.3],[256.5, 577.3],[264.1, 576.7],[263.5, 569.4],[277.2, 568.4],[277.8, 576.6],[284.1, 576.2],[282.7, 558.2]], door: [255.8, 568.8], out: [-0.997, 0.076], walk: 17.5 }, // East Legon 20
  { id: 'osm:way/744922442', ring: [[464.8, 424.3],[464.7, 438.6],[471.6, 438.7],[471.6, 436.3],[483.6, 436.4],[483.6, 438.4],[488.9, 438.5],[489.1, 424.7],[484.5, 424.6],[484.4, 430.1],[472.3, 430.0],[472.3, 424.3]], door: [486.2, 438.4], out: [-0.019, 1.0], walk: 0 },
  { id: 'osm:way/744967432', ring: [[297.3, 620.7],[298.1, 627.1],[309.4, 625.6],[308.6, 619.2]], door: [309.0, 622.4], out: [0.992, -0.124], walk: 54.6 }, // East Legon 8
];
/** the wood they stand in (8 m cells inside the owner's outline) */
const FOREST: [number, number][] = [[430,407],[438,407],[446,407],[454,407],[462,407],[470,407],[246,415],[254,415],[262,415],[270,415],[278,415],[286,415],[294,415],[302,415],[310,415],[318,415],[342,415],[350,415],[358,415],[366,415],[374,415],[382,415],[390,415],[398,415],[406,415],[414,415],[422,415],[430,415],[438,415],[446,415],[454,415],[462,415],[470,415],[478,415],[238,423],[246,423],[254,423],[262,423],[270,423],[278,423],[286,423],[294,423],[302,423],[310,423],[318,423],[326,423],[334,423],[342,423],[350,423],[358,423],[366,423],[374,423],[382,423],[390,423],[398,423],[406,423],[414,423],[422,423],[430,423],[438,423],[446,423],[454,423],[462,423],[470,423],[478,423],[486,423],[238,431],[246,431],[254,431],[262,431],[270,431],[278,431],[286,431],[294,431],[302,431],[310,431],[318,431],[326,431],[334,431],[342,431],[350,431],[358,431],[366,431],[374,431],[382,431],[390,431],[398,431],[406,431],[414,431],[422,431],[430,431],[438,431],[446,431],[454,431],[462,431],[470,431],[478,431],[486,431],[494,431],[238,439],[246,439],[254,439],[262,439],[270,439],[278,439],[286,439],[294,439],[302,439],[310,439],[318,439],[326,439],[334,439],[342,439],[350,439],[358,439],[366,439],[374,439],[382,439],[390,439],[398,439],[406,439],[414,439],[422,439],[430,439],[438,439],[446,439],[454,439],[462,439],[470,439],[478,439],[486,439],[494,439],[254,447],[262,447],[270,447],[278,447],[286,447],[294,447],[302,447],[310,447],[318,447],[326,447],[334,447],[342,447],[350,447],[358,447],[366,447],[374,447],[382,447],[390,447],[398,447],[406,447],[414,447],[422,447],[430,447],[438,447],[446,447],[454,447],[462,447],[470,447],[478,447],[486,447],[254,455],[262,455],[270,455],[278,455],[286,455],[294,455],[302,455],[310,455],[318,455],[326,455],[334,455],[342,455],[350,455],[358,455],[366,455],[374,455],[382,455],[390,455],[398,455],[406,455],[414,455],[422,455],[430,455],[438,455],[446,455],[454,455],[462,455],[470,455],[478,455],[486,455],[262,463],[270,463],[278,463],[286,463],[294,463],[302,463],[310,463],[318,463],[326,463],[334,463],[342,463],[350,463],[358,463],[366,463],[374,463],[382,463],[390,463],[398,463],[406,463],[414,463],[422,463],[430,463],[438,463],[446,463],[454,463],[462,463],[470,463],[478,463],[262,471],[270,471],[278,471],[286,471],[294,471],[302,471],[310,471],[318,471],[326,471],[334,471],[342,471],[350,471],[358,471],[366,471],[374,471],[382,471],[390,471],[398,471],[406,471],[414,471],[422,471],[430,471],[438,471],[446,471],[454,471],[462,471],[470,471],[262,479],[270,479],[278,479],[286,479],[294,479],[302,479],[310,479],[318,479],[326,479],[334,479],[342,479],[350,479],[358,479],[366,479],[374,479],[382,479],[390,479],[398,479],[406,479],[414,479],[422,479],[430,479],[438,479],[446,479],[454,479],[462,479],[262,487],[270,487],[278,487],[286,487],[294,487],[302,487],[310,487],[318,487],[326,487],[334,487],[342,487],[350,487],[358,487],[366,487],[374,487],[382,487],[390,487],[398,487],[406,487],[414,487],[422,487],[430,487],[438,487],[446,487],[454,487],[262,495],[270,495],[278,495],[286,495],[294,495],[302,495],[310,495],[318,495],[326,495],[334,495],[342,495],[350,495],[358,495],[366,495],[374,495],[382,495],[390,495],[398,495],[406,495],[414,495],[422,495],[430,495],[438,495],[446,495],[454,495],[262,503],[270,503],[278,503],[286,503],[294,503],[302,503],[310,503],[318,503],[326,503],[334,503],[342,503],[350,503],[358,503],[366,503],[374,503],[382,503],[390,503],[398,503],[406,503],[414,503],[422,503],[430,503],[438,503],[446,503],[262,511],[270,511],[278,511],[286,511],[294,511],[302,511],[310,511],[318,511],[326,511],[334,511],[342,511],[350,511],[358,511],[366,511],[374,511],[382,511],[390,511],[398,511],[406,511],[414,511],[422,511],[430,511],[438,511],[446,511],[454,511],[254,519],[262,519],[270,519],[278,519],[286,519],[294,519],[302,519],[310,519],[318,519],[326,519],[334,519],[342,519],[350,519],[358,519],[366,519],[374,519],[382,519],[390,519],[398,519],[406,519],[414,519],[422,519],[430,519],[438,519],[446,519],[454,519],[254,527],[262,527],[270,527],[278,527],[286,527],[294,527],[302,527],[310,527],[318,527],[326,527],[334,527],[342,527],[350,527],[358,527],[366,527],[374,527],[382,527],[390,527],[398,527],[406,527],[414,527],[422,527],[430,527],[438,527],[446,527],[454,527],[246,535],[254,535],[262,535],[270,535],[278,535],[286,535],[294,535],[302,535],[310,535],[318,535],[326,535],[334,535],[342,535],[350,535],[358,535],[366,535],[374,535],[382,535],[390,535],[398,535],[406,535],[414,535],[422,535],[430,535],[438,535],[446,535],[454,535],[246,543],[254,543],[262,543],[270,543],[278,543],[286,543],[294,543],[302,543],[310,543],[318,543],[326,543],[334,543],[342,543],[350,543],[358,543],[366,543],[374,543],[382,543],[390,543],[398,543],[406,543],[414,543],[422,543],[430,543],[438,543],[446,543],[454,543],[462,543],[246,551],[254,551],[262,551],[270,551],[278,551],[286,551],[294,551],[302,551],[310,551],[318,551],[326,551],[334,551],[342,551],[350,551],[358,551],[366,551],[374,551],[382,551],[390,551],[398,551],[406,551],[414,551],[422,551],[430,551],[438,551],[446,551],[454,551],[462,551],[254,559],[262,559],[270,559],[278,559],[286,559],[294,559],[302,559],[310,559],[318,559],[326,559],[334,559],[342,559],[350,559],[358,559],[366,559],[374,559],[382,559],[390,559],[398,559],[406,559],[414,559],[422,559],[430,559],[438,559],[446,559],[454,559],[462,559],[254,567],[262,567],[270,567],[278,567],[286,567],[294,567],[302,567],[310,567],[318,567],[326,567],[334,567],[342,567],[350,567],[358,567],[366,567],[374,567],[382,567],[390,567],[398,567],[406,567],[414,567],[422,567],[430,567],[438,567],[446,567],[454,567],[254,575],[262,575],[270,575],[278,575],[286,575],[294,575],[302,575],[310,575],[318,575],[326,575],[334,575],[342,575],[350,575],[358,575],[366,575],[374,575],[382,575],[390,575],[398,575],[406,575],[414,575],[422,575],[430,575],[438,575],[446,575],[454,575],[254,583],[262,583],[270,583],[278,583],[286,583],[294,583],[302,583],[310,583],[318,583],[326,583],[334,583],[342,583],[350,583],[358,583],[366,583],[374,583],[382,583],[390,583],[398,583],[406,583],[414,583],[422,583],[430,583],[438,583],[446,583],[454,583],[254,591],[262,591],[270,591],[278,591],[286,591],[294,591],[302,591],[310,591],[318,591],[326,591],[334,591],[342,591],[350,591],[358,591],[366,591],[374,591],[382,591],[390,591],[398,591],[406,591],[414,591],[422,591],[430,591],[438,591],[446,591],[454,591],[254,599],[262,599],[270,599],[278,599],[286,599],[294,599],[302,599],[310,599],[318,599],[326,599],[334,599],[342,599],[350,599],[358,599],[366,599],[374,599],[382,599],[390,599],[398,599],[406,599],[414,599],[422,599],[430,599],[438,599],[446,599],[262,607],[270,607],[278,607],[286,607],[294,607],[302,607],[310,607],[318,607],[326,607],[334,607],[342,607],[350,607],[358,607],[366,607],[374,607],[382,607],[390,607],[398,607],[406,607],[414,607],[422,607],[430,607],[438,607],[262,615],[270,615],[278,615],[286,615],[294,615],[302,615],[310,615],[318,615],[326,615],[334,615],[342,615],[350,615],[358,615],[366,615],[374,615],[382,615],[390,615],[398,615],[406,615],[414,615],[422,615],[430,615],[262,623],[270,623],[278,623],[286,623],[294,623],[302,623],[310,623],[318,623],[326,623],[334,623],[342,623],[350,623],[358,623],[366,623],[374,623],[382,623],[390,623],[398,623],[406,623],[414,623],[422,623],[278,631],[286,631],[294,631],[302,631],[310,631],[318,631],[326,631],[334,631],[342,631],[350,631],[358,631],[366,631],[374,631],[382,631],[390,631],[398,631],[406,631],[414,631],[422,631],[278,639],[286,639],[294,639],[302,639],[310,639],[318,639],[326,639],[334,639],[342,639],[350,639],[358,639],[366,639],[374,639],[382,639],[390,639],[398,639],[406,639],[414,639],[422,639],[262,647],[270,647],[278,647],[286,647],[294,647],[302,647],[310,647],[318,647],[326,647],[334,647],[342,647],[350,647],[358,647],[366,647],[374,647],[382,647],[390,647],[398,647],[406,647],[414,647],[262,655],[270,655],[278,655],[286,655],[294,655],[302,655],[310,655],[318,655],[326,655],[334,655],[342,655],[350,655],[358,655],[366,655],[374,655],[382,655],[390,655],[398,655],[406,655],[414,655],[270,663],[278,663],[286,663],[294,663],[302,663],[318,663],[326,663],[334,663],[342,663],[350,663],[358,663],[366,663],[374,663],[382,663],[390,663],[398,663],[406,663],[414,663],[262,671],[270,671],[278,671],[286,671],[294,671],[318,671],[326,671],[334,671],[342,671],[350,671],[358,671],[366,671],[374,671],[382,671],[318,679],[326,679],[334,679],[342,679],[350,679],[358,679],[366,679],[374,679],[318,687],[326,687],[334,687],[342,687],[350,687],[358,687],[366,687],[374,687],[318,695],[326,695],[334,695],[342,695],[350,695],[358,695],[366,695],[374,695],[318,703],[326,703],[334,703],[342,703],[350,703],[358,703],[366,703],[342,711],[350,711],[358,711],[366,711]];
const FO: [number, number] = [340, 560];
const wood: Spec = {
  name: 'lecturers\' wood',
  axis: [1, 0], origin: FO, storey: 3, style: WALL, roofColor: TILE, fascia: WHITE, pitch: 0.4,
  blocks: [],
  keep: [],
  extras: (k: Kit) => {
    const g = garden([180, 500, 390, 730]);
    g.reseed(29);
    // the floor of the wood: leaf litter and moss in shade, with patches of bare red earth (owner's aerial)
    const floor = ['#4f5d32', '#56603a', '#4a5a30', '#5e5a3a'];
    for (const [x, z] of FOREST) {
      const r = g.rand(), col = r < 0.12 ? '#a8714a' : floor[(g.rand() * floor.length) | 0];
      k.plain.push([box(x - FO[0] - 4.2, x - FO[0] + 4.2, 0.015 + r * 0.01, 0.03 + r * 0.01, z - FO[1] - 4.2, z - FO[1] + 4.2), col]);
    }
    // trees all through it, kept off the houses, the roads and the walks
    for (const [x, z] of FOREST) for (let i = 0; i < 2; i++) {
      if (i && g.rand() < 0.45) continue;
      const tx = x + (g.rand() - 0.5) * 7, tz = z + (g.rand() - 0.5) * 7;
      if (!g.clearOf(tx, tz)) continue;
      g.tree(k, tx - FO[0], tz - FO[1], 1.1 + g.rand() * 0.7);
    }
  },
};

/** the ground-floor buildings by Volta Hall Road and opposite the Business School, and the lecturers' houses in their wood */
export const residences = createSite('residences', [
  larway,
  house(PURPLE, { style: WIDE, porch: 'gable', name: 'Business School road cross building' }),
  ...LECTURERS.map((h) => house(h)),
  wood,
  // south of the UG Sports Stadium: one-floor houses, like bungalows (owner)
  ...STADIUM_HOUSES.map((h) => house(h, { name: `stadium house ${h.id}`, gate: h.walk < 12 })),
  // west of the Diaspora Dome round F.K. Apaloo Crescent: one-floor bungalows in a park of trees (owner)
  ...DIASPORA_HOUSES.map((h) => house(h, { name: `Apaloo Crescent house ${h.id}`, gate: h.walk < 12 })),
]);
