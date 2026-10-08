// The chalet-style blocks of Akuafo Hall and Legon Hall along the road south from the roundabout before the Balme
// Library, and Legon Hall's gable block beside its front, from the owner's photos (block engine: blocks.ts).
//
// White walls, a little weathered, dark brown wooden louvred shutters (wood, not glass: owner), steep gable roofs of
// orange-red clay tiles with deep overhangs, dark bargeboards, and the gable triangles clad in dark timber boards.
// The two-storey blocks nearest the avenue turn a gable to the road and carry a balcony with a solid white parapet on
// their side toward the avenue; the long blocks behind them run north-south under ridges along their length, a
// tiled lean-to over the ground floor along the road; small one-floor cottages with a door under the gable to the road.
// Legon's gable block east of its front (owner's photo): two floors, its gable end to the avenue with two shutters up
// and a lean-to porch over a lit door on the ground floor, air-conditioners along its west side, and a low covered
// passage with an iron lattice joining it to the front block.
import * as THREE from 'three';
import { box, speckle, tri2 } from './modelkit';
import { PL, createSite, louvre, render, type Kit, type Spec, type Style } from './blocks';
import { garden } from './gardens';

const TILE = '#c4623d', TIMBER = '#4a3526', BOARD = '#33251b', BARGE = '#2e241e', WALL = '#f3f1ea';
const ST = 3.1;
/** weathered white with wooden louvred shutters, a narrow pair to a bay; doors now and then on the ground floor */
const CHALET_WALL: Style = {
  bay: 3.0,
  up: [[88, 50, 80, 128]], ground: [[88, 256 + 60, 80, 120]],
  draw: (g) => {
    render(g, WALL);
    // rain-streaks from the sills, a darker foot
    for (let i = 0; i < 14; i++) { const x = (i * 53) % 256, y = i % 2 ? 190 : 446; g.fillStyle = `rgba(110,104,92,${0.06 + (i % 3) * 0.03})`; g.fillRect(x, y, 3 + (i % 4), 30 + (i * 17) % 60); }
    speckle(g, 0, 0, 256, 512, 600, ['rgba(140,134,120,0.25)']);
    louvre(g, [88, 50, 80, 128]);
    louvre(g, [88, 256 + 60, 80, 120]);
    const foot = g.createLinearGradient(0, 470, 0, 512); foot.addColorStop(0, 'rgba(120,100,80,0)'); foot.addColorStop(1, 'rgba(120,100,80,0.35)');
    g.fillStyle = foot; g.fillRect(0, 470, 256, 42);
  },
};
/** a ground floor with doors: a dark wooden door beside a louvred window */
const CHALET_DOORS: Style = {
  bay: 3.4,
  up: [[88, 50, 80, 128]], ground: [[150, 256 + 60, 70, 110]],
  draw: (g) => {
    CHALET_WALL.draw(g);
    g.fillStyle = WALL; g.fillRect(80, 256 + 50, 100, 150);
    g.fillStyle = '#2b1f17'; g.fillRect(40, 256 + 40, 64, 216);
    g.fillStyle = '#5a3f2c'; g.fillRect(44, 256 + 44, 56, 212);
    g.fillStyle = '#3a2a1e'; for (let y = 256 + 60; y < 500; y += 40) g.fillRect(48, y, 48, 3);
    louvre(g, [150, 256 + 60, 70, 110]);
  },
};

interface Chalet {
  /** footprint rectangle (world) */ r: [number, number, number, number];
  floors: number;
  /** the ridge runs along x or z */ ridge: 'x' | 'z';
  /** the side toward the road: its ground floor has doors (and the lean-to, the balcony's end) */ road: 'x0' | 'x1' | 'z0' | 'z1';
  balcony?: 'z0' | 'z1' | 'x0' | 'x1';
  leanTo?: boolean;
  legonGable?: boolean;
}
const CHALETS: Chalet[] = [
  // Akuafo's side, east of the road (owner's green mark, picture 4)
  { r: [26.6, 40.7, 160.7, 172.4], floors: 2, ridge: 'x', road: 'x0', balcony: 'z0' },
  { r: [24.1, 31.5, 174.7, 178.5], floors: 1, ridge: 'x', road: 'x0' },
  { r: [46.7, 57.5, 159.2, 187.0], floors: 2, ridge: 'z', road: 'x0', leanTo: true },
  { r: [23.5, 31.6, 200.5, 205.3], floors: 1, ridge: 'x', road: 'x0' },
  { r: [27.1, 42.1, 208.6, 221.3], floors: 2, ridge: 'x', road: 'x0', balcony: 'z1', leanTo: true },
  { r: [46.8, 57.6, 196.4, 222.2], floors: 2, ridge: 'z', road: 'x0', leanTo: true },
  // Legon's side, west of the road (owner's purple mark, picture 3)
  { r: [-33.6, -19.5, 157.8, 169.5], floors: 2, ridge: 'x', road: 'x1', balcony: 'z0' },
  { r: [-49.0, -38.1, 160.2, 187.9], floors: 2, ridge: 'z', road: 'x1', leanTo: true },
  { r: [-17.7, -10.0, 200.0, 205.1], floors: 1, ridge: 'x', road: 'x1' },
  { r: [-33.8, -19.7, 210.9, 222.6], floors: 2, ridge: 'x', road: 'x1', balcony: 'z1', leanTo: true },
  { r: [-49.0, -38.1, 196.1, 221.9], floors: 2, ridge: 'z', road: 'x1', leanTo: true },
  // Legon's gable block east of its front (owner's picture 2)
  { r: [-127.9, -116.7, 155.2, 182.6], floors: 2, ridge: 'z', road: 'z0', legonGable: true },
];

function chalet(c: Chalet): Spec {
  const [wx0, wx1, wz0, wz1] = c.r, o: [number, number] = [(wx0 + wx1) / 2, (wz0 + wz1) / 2];
  const x0 = wx0 - o[0], x1 = wx1 - o[0], z0 = wz0 - o[1], z1 = wz1 - o[1];
  const faces = { [c.road]: CHALET_DOORS };
  return {
    name: c.legonGable ? 'Legon Hall gable block' : `chalet ${o[0].toFixed(0)},${o[1].toFixed(0)}`,
    axis: [1, 0], origin: o, storey: ST, style: CHALET_WALL, roofColor: TILE, fascia: BARGE, pitch: 0.6,
    plinth: '#cfc9bb',
    replaces: [o],
    blocks: [{ x0, x1, z0, z1, floors: c.floors, roof: 'none', faces }],
    keep: c.legonGable ? [[-131.5 - o[0], x0, 160 - o[1], 171 - o[1]], [x0, x1, z0 - 3.5, z0]] : [],
    extras: (k: Kit) => {
      const eave = k.wallTop(c.floors), OV = 0.75, GO = 0.95, pitch = 0.62;
      // the gable roof: ridge along the long side, overhanging the gables, dark bargeboards
      const along = c.ridge === 'x';
      const [a0, a1, b0, b1] = along ? [x0, x1, z0, z1] : [z0, z1, x0, x1];
      const half = (b1 - b0) / 2 + OV, bm = (b0 + b1) / 2, top = eave + half * pitch;
      const P = (a: number, y: number, b: number) => (along ? [a, y, b] : [b, y, a]);
      if (along) {
        k.roof.quad(P(a0 - GO, eave, b0 - OV), P(a1 + GO, eave, b0 - OV), P(a1 + GO, top, bm), P(a0 - GO, top, bm));
        k.roof.quad(P(a1 + GO, eave, b1 + OV), P(a0 - GO, eave, b1 + OV), P(a0 - GO, top, bm), P(a1 + GO, top, bm));
      } else {
        k.roof.quad(P(a1 + GO, eave, b0 - OV), P(a0 - GO, eave, b0 - OV), P(a0 - GO, top, bm), P(a1 + GO, top, bm));
        k.roof.quad(P(a0 - GO, eave, b1 + OV), P(a1 + GO, eave, b1 + OV), P(a1 + GO, top, bm), P(a0 - GO, top, bm));
      }
      const ridgeBox = along ? box(a0 - GO, a1 + GO, top - 0.05, top + 0.14, bm - 0.18, bm + 0.18) : box(bm - 0.18, bm + 0.18, top - 0.05, top + 0.14, a0 - GO, a1 + GO);
      k.plain.push([ridgeBox, '#9c4a2c']);
      // the gable triangles clad in dark timber boards, bargeboards along the verges
      const slope = Math.atan(pitch), vl = Math.hypot(half, half * pitch);
      for (const [a, s] of [[a0, -1], [a1, 1]] as [number, number][]) {
        const geo = tri2(P(a + s * 0.03, eave, b0 - 0.02) as [number, number, number], P(a + s * 0.03, eave, b1 + 0.02) as [number, number, number], P(a + s * 0.03, top - 0.08, bm) as [number, number, number]);
        k.plain.push([geo, TIMBER]);
        for (let t = b0 + 0.4; t < b1 - 0.2; t += 0.45) {
          const h = (half - OV - Math.abs(t - bm)) * pitch;
          if (h <= 0.1) continue;
          k.plain.push([along ? box(a + s * 0.05 - 0.02, a + s * 0.05 + 0.02, eave, eave + h, t - 0.03, t + 0.03) : box(t - 0.03, t + 0.03, eave, eave + h, a + s * 0.05 - 0.02, a + s * 0.05 + 0.02), BOARD]);
        }
        for (const side of [-1, 1]) {
          const geoB = new THREE.BoxGeometry(vl + 0.1, 0.3, 0.08).rotateZ(side * slope).translate(bm - side * half / 2, (eave + top) / 2 - 0.1, 0);
          if (along) geoB.rotateY(-Math.PI / 2).translate(a + s * (GO - 0.02), 0, 0); else geoB.translate(0, 0, a + s * (GO - 0.02));
          k.plain.push([geoB, BARGE]);
        }
      }
      // the eaves' dark fascias along the long sides
      for (const b of [b0 - OV, b1 + OV]) k.plain.push([along ? box(a0 - GO, a1 + GO, eave - 0.25, eave + 0.02, b - 0.04, b + 0.04) : box(b - 0.04, b + 0.04, eave - 0.25, eave + 0.02, a0 - GO, a1 + GO), BARGE]);
      // the balcony: a slab on two posts on the side toward the avenue, a solid white parapet
      if (c.balcony && c.floors > 1) {
        const y = PL + ST, d = 1.6, sgn = c.balcony === 'z0' || c.balcony === 'x0' ? -1 : 1;
        const roadEnd = c.road === 'x0' ? x0 : x1, w = Math.min(6, (x1 - x0) * 0.5);
        const bx0 = c.road === 'x0' ? roadEnd : roadEnd - w, bx1 = c.road === 'x0' ? roadEnd + w : roadEnd;
        const zw = sgn < 0 ? z0 : z1, zf = zw + sgn * d;
        const [za, zb] = sgn < 0 ? [zf, zw] : [zw, zf];
        k.plain.push([box(bx0, bx1, y - 0.25, y, za, zb), '#e9e7e0'], [box(bx0, bx1, y, y + 1.05, sgn < 0 ? za : zb - 0.18, sgn < 0 ? za + 0.18 : zb), WALL]);
        k.plain.push([box(bx0, bx0 + 0.18, y, y + 1.05, za, zb), WALL], [box(bx1 - 0.18, bx1, y, y + 1.05, za, zb), WALL]);
        for (const x of [bx0 + 0.2, bx1 - 0.2]) k.plain.push([box(x - 0.15, x + 0.15, 0, y - 0.25, zf - sgn * 0.3 - 0.15, zf - sgn * 0.3 + 0.15), WALL]);
        k.plain.push([box(bx0 + 1, bx0 + 1.9, y + 0.05, y + 2.3, zw - 0.04 * sgn - 0.02, zw - 0.04 * sgn + 0.02), '#4a3526']);
      }
      // the tiled lean-to over the ground floor along the road side, on square posts
      if (c.leanTo) {
        const y = PL + ST - 0.2, d = 1.8;
        const geo = (len: number) => new THREE.BoxGeometry(len, 0.1, d + 0.3);
        if (c.road === 'x0' || c.road === 'x1') {
          const s = c.road === 'x0' ? -1 : 1, xw = s < 0 ? x0 : x1;
          k.plain.push([geo(z1 - z0).rotateY(Math.PI / 2).rotateZ(-s * 0.32).translate(xw + s * d / 2, y + 0.1, 0), TILE]);
          for (let z = z0 + 0.6; z <= z1 - 0.5; z += (z1 - z0 - 1.1) / Math.max(1, Math.round((z1 - z0) / 4))) k.plain.push([box(xw + s * (d - 0.15) - 0.13, xw + s * (d - 0.15) + 0.13, 0, y - 0.4, z - 0.13, z + 0.13), WALL]);
          k.plain.push([box(Math.min(xw, xw + s * d), Math.max(xw, xw + s * d), 0, 0.15, z0, z1), '#c9c1b2']);
        }
      }
      if (c.legonGable) {
        // the north gable end (owner's picture 2): a lean-to porch on the east half over a lit door and a square post,
        // a shutter on the west half below the two upstairs; air-conditioners along the west side; the low covered
        // passage with an iron lattice to the front block
        const zf = z0, xm = (x0 + x1) / 2;
        k.plain.push([new THREE.BoxGeometry(5.6, 0.1, 2.6).rotateX(0.3).translate(xm + 2.4, PL + ST - 0.1, zf - 1.2), '#5a3d2c']);
        k.plain.push([box(xm + 4.4, xm + 4.8, 0, PL + ST - 0.4, zf - 2.3, zf - 1.9), WALL], [box(xm - 0.2, xm + 0.2, 0, PL + ST - 0.4, zf - 2.3, zf - 1.9), WALL]);
        k.plain.push([box(xm + 1.4, xm + 3.0, 0.15, 2.6, zf - 0.04, zf), '#f7f1dc'], [box(xm + 1.6, xm + 2.8, 0.15, 2.4, zf - 0.05, zf - 0.04), '#2e2a26']);
        k.plain.push([box(xm + 3.6, xm + 4.0, 2.6, 2.9, zf - 0.14, zf), '#fff6d6']);
        k.plain.push([box(x0, x1, 0, 0.15, zf - 2.6, zf), '#bdb6a9']);
        for (const z of [z0 + 4, z0 + 7.5, z0 + 14]) k.plain.push([box(x0 - 0.38, x0, 2.0, 2.6, z - 0.4, z + 0.4), '#ecebe7'], [box(x0 - 0.4, x0 - 0.38, 2.12, 2.48, z - 0.3, z + 0.3), '#8d9196']);
        // the passage west to the front block: a low white wall, a lattice of dark bars, a tiled roof
        const px0 = -131.4 - o[0], px1 = x0, pz0 = 160.5 - o[1], pz1 = 170 - o[1];
        k.plain.push([box(px0, px1, 0, 0.9, pz0, pz0 + 0.25), WALL], [box(px0, px1, 3.0, 3.25, pz0, pz1), WALL]);
        for (let x = px0 + 0.15; x < px1; x += 0.25) k.plain.push([box(x - 0.025, x + 0.025, 0.9, 3.0, pz0 + 0.1, pz0 + 0.15), '#1e1e1e']);
        for (let y = 1.15; y < 3.0; y += 0.25) k.plain.push([box(px0, px1, y - 0.025, y + 0.025, pz0 + 0.1, pz0 + 0.15), '#1e1e1e']);
        k.plain.push([new THREE.BoxGeometry(px1 - px0 + 0.6, 0.1, pz1 - pz0 + 0.8).rotateX(-0.15).translate((px0 + px1) / 2, 3.5, (pz0 + pz1) / 2), '#5a3d2c']);
        // hedges and bushes before it, a bench
        const g = garden([-140, -110, 145, 190]);
        g.reseed(9);
        g.hedge(k, x0 + 0.5, zf - 3.2, xm - 0.6, zf - 3.2);
        g.hedge(k, x0 - 2.5, z0 + 3, x0 - 2.5, z0 + 12);
        k.plain.push([box(x1 + 1.5, x1 + 3.5, 0.4, 0.5, zf - 2, zf - 1.5), '#a89e90'], [box(x1 + 1.6, x1 + 1.8, 0, 0.4, zf - 2, zf - 1.5), '#8a8178'], [box(x1 + 3.2, x1 + 3.4, 0, 0.4, zf - 2, zf - 1.5), '#8a8178']);
      }
    },
  };
}

/** along the road: tall royal palms on Legon's side (owner's picture 3), clipped golden hedges on Akuafo's (picture 4) */
const verges: Spec = {
  name: 'south road verges',
  axis: [1, 0], origin: [5, 190], storey: 3, style: CHALET_WALL, roofColor: TILE, fascia: BARGE, pitch: 0.5,
  blocks: [],
  keep: [],
  extras: (k: Kit) => {
    const X = (x: number) => x - 5, Z = (z: number) => z - 190;
    const g = garden([-60, 70, 140, 240]);
    g.reseed(13);
    for (const [x, z, h] of [[-12, 152, 15], [-14.5, 176, 14], [-36, 192, 13], [-13, 194, 16], [-15, 228, 14], [-54, 152, 12], [17, 150, 13]] as [number, number, number][]) g.palm(k, X(x), Z(z), h);
    for (const [z0, z1] of [[158, 172], [180, 198], [207, 224]]) {
      k.plain.push([box(X(21.4), X(22.4), 0, 0.75, Z(z0), Z(z1)), '#b3b23a'], [box(X(21.5), X(22.3), 0.75, 0.85, Z(z0) + 0.1, Z(z1) - 0.1), '#c4c24a']);
    }
    for (const [x, z] of [[-6, 180], [-7, 212], [44, 192], [20, 232]]) g.tree(k, X(x), Z(z), 1.3);
  },
};

/** the chalet-style blocks along the road south of the roundabout, and Legon Hall's gable block */
export const chaletSite = createSite('chalets', [...CHALETS.map(chalet), verges]);
