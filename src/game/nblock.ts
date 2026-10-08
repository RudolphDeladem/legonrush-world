// The New N Block (NNB) and the GCB Lecture Building, from the owner's photos and marked aerial (block engine:
// blocks.ts; the GCB's raised ground, its stair: relief.ts).
//
// New N Block, its front (F) to the road on the south: one floor, a tall hall under a red corrugated gable roof with
// white gable ends and brown timber louvres in them, a white clerestory band of dark louvres along the top of its
// walls; round it a verandah under a lean-to of the same red sheets on square green columns, the floor raised on a
// white plinth; the walls green, dark doors along every side (the owner's blue marks: many entrances), dark windows
// with air-conditioners under them.
//
// GCB Lecture Building, south across the road and 2.4 m up the slope from it (owner's marked aerial and photos): two
// floors under a maroon corrugated hip roof with a gablet at each end and a cross gable over the middle, old white
// paint, only lightly weathered (owner: the white must still read as white). Across the whole north a deep gallery on both floors: round
// columns on the ground floor, a thick solid parapet round the cantilevered first floor, tall slender columns to the
// roof, the roof's beams standing out under the eaves, a stair under the gallery up to the first floor, a glazed room
// at its east end. Before it at road level, inside one square: a broad stair up the middle and two ramps that run out
// along the north edge and climb south along the sides to the gallery, planted wells inside them. On the west and the
// east the gates: the ground floor open under the upper floor's plain gable wall, a colonnade before a lit lobby.
import * as THREE from 'three';
import { box, merge, speckle, tri2, type Part } from './modelkit';
import { BAND, PL, createSite, render, type Block, type Kit, type Spec, type Style } from './blocks';
import { concrete, pane, wall } from './concrete';
import { garden } from './gardens';
import { stairsOf } from './relief';

// ---------- the New N Block ----------
const NO: [number, number] = [-95, -459];
const NX = (x: number) => x - NO[0], NZ = (z: number) => z - NO[1];
const GREEN = '#7fd3a6', COL = '#4fbf8a', NROOF = '#9e2f2c', NFASCIA = '#3d4650';
const RAISE = 0.6, NST = 5.2;
/** the hall's walls: green, a dark door and a dark window over an air-conditioner to a bay; above the verandah roof a
 *  white clerestory band with dark louvres */
const NB_WALL: Style = {
  bay: 3.6, up: [], ground: [[22, 256 + 104, 72, 118], [124, 256 + 120, 96, 48], [40, 256 + 16, 176, 46]],
  draw: (g) => {
    render(g, '#f4f4f1');
    g.fillStyle = GREEN; g.fillRect(0, 256 + 89, 256, 167);
    speckle(g, 0, 256 + 89, 256, 167, 600, ['#77cb9e', '#86d9ad']);
    // the clerestory louvres
    g.fillStyle = '#1e2226'; g.fillRect(40, 256 + 16, 176, 46);
    g.fillStyle = '#3a4046'; for (let y = 256 + 20; y < 256 + 62; y += 7) g.fillRect(40, y, 176, 2);
    // a dark door, a dark window, the air-conditioner under it
    // (the doors a metre wide, two leaves: owner)
    g.fillStyle = '#25282b'; g.fillRect(22, 256 + 104, 72, 152);
    g.fillStyle = '#3a3e42'; g.fillRect(57, 256 + 104, 2, 152);
    g.fillStyle = '#4a4e52'; g.fillRect(48, 256 + 170, 4, 10); g.fillRect(62, 256 + 170, 4, 10);
    g.fillStyle = '#d9dcdb'; g.fillRect(120, 256 + 116, 104, 56);
    g.fillStyle = '#20262c'; g.fillRect(124, 256 + 120, 96, 48);
    g.fillStyle = '#e8e8e6'; g.fillRect(146, 256 + 180, 54, 40);
    g.fillStyle = '#8f9497'; for (let x = 150; x < 196; x += 6) g.fillRect(x, 256 + 184, 2, 32);
  },
};
const CORE = { x0: -138, x1: -52, z0: -472, z1: -448.5 };
const OUT = { x0: -142, x1: -48.6, z0: -475.4, z1: -444.6 };
/** a lean-to round a core: from the outer eave up to the core's walls (four trapezoids meeting at the corners) */
function leanTo(k: Kit, o: number[], i: number[], eave: number, top: number) {
  const [ox0, ox1, oz0, oz1] = o, [ix0, ix1, iz0, iz1] = i;
  k.roof.quad([ox0, eave, oz0], [ox1, eave, oz0], [ix1, top, iz0], [ix0, top, iz0]);
  k.roof.quad([ox1, eave, oz1], [ox0, eave, oz1], [ix0, top, iz1], [ix1, top, iz1]);
  k.roof.quad([ox1, eave, oz0], [ox1, eave, oz1], [ix1, top, iz1], [ix1, top, iz0]);
  k.roof.quad([ox0, eave, oz1], [ox0, eave, oz0], [ix0, top, iz0], [ix0, top, iz1]);
}
const nBlock: Spec = {
  name: 'New N Block, NNB',
  axis: [1, 0], origin: NO, storey: NST, style: NB_WALL, roofColor: NROOF, fascia: NFASCIA, pitch: 0.28,
  plinth: '#f1f0ec',
  replaces: [[-95, -458], [-94.3, -482.3]],
  blocks: [{ x0: NX(CORE.x0), x1: NX(CORE.x1), z0: NZ(CORE.z0), z1: NZ(CORE.z1), floors: 1, roof: 'none', y: RAISE }],
  keep: [[NX(OUT.x0) - 1, NX(OUT.x1) + 1, NZ(OUT.z0) - 1, NZ(OUT.z1) + 2.5]],
  extras: (k: Kit) => {
    const ox0 = NX(OUT.x0), ox1 = NX(OUT.x1), oz0 = NZ(OUT.z0), oz1 = NZ(OUT.z1);
    const ix0 = NX(CORE.x0), ix1 = NX(CORE.x1), iz0 = NZ(CORE.z0), iz1 = NZ(CORE.z1);
    // the raised floor: a white plinth, grey screed, a step down in front of the doors on the south
    k.plain.push([box(ox0, ox1, 0, RAISE, oz0, oz1), '#f1f0ec'], [box(ox0 + 0.1, ox1 - 0.1, RAISE, RAISE + 0.02, oz0 + 0.1, oz1 - 0.1), '#a7a49c']);
    k.plain.push([box(ox0 + 4, ox1 - 4, 0, RAISE / 2, oz1, oz1 + 0.5), '#e9e7e1']);
    // the verandah's square green columns, every 4 m round the outside
    const eave = 3.6, H = RAISE + PL + NST;
    const cols = (ax: number, az: number, bx: number, bz: number) => {
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / 4));
      for (let i = 0; i <= n; i++) { const x = ax + ((bx - ax) * i) / n, z = az + ((bz - az) * i) / n; k.plain.push([box(x - 0.22, x + 0.22, RAISE, eave, z - 0.22, z + 0.22), COL]); }
    };
    cols(ox0 + 0.4, oz1 - 0.4, ox1 - 0.4, oz1 - 0.4); cols(ox0 + 0.4, oz0 + 0.4, ox1 - 0.4, oz0 + 0.4);
    cols(ox0 + 0.4, oz0 + 0.4, ox0 + 0.4, oz1 - 0.4); cols(ox1 - 0.4, oz0 + 0.4, ox1 - 0.4, oz1 - 0.4);
    // the lean-to round the hall, red sheets, a dark fascia, a white beam along the columns
    const O = [ox0 - 0.5, ox1 + 0.5, oz0 - 0.5, oz1 + 0.5], I = [ix0, ix1, iz0, iz1];
    leanTo(k, O, I, eave, RAISE + PL + 3.4);
    for (const [a, b, c, d] of [[O[0], O[1], O[2] - 0.05, O[2] + 0.05], [O[0], O[1], O[3] - 0.05, O[3] + 0.05], [O[0] - 0.05, O[0] + 0.05, O[2], O[3]], [O[1] - 0.05, O[1] + 0.05, O[2], O[3]]]) k.plain.push([box(a, b, eave - 0.3, eave + 0.02, c, d), NFASCIA]);
    for (const [a, b, c, d] of [[ox0, ox1, oz1 - 0.6, oz1 - 0.2], [ox0, ox1, oz0 + 0.2, oz0 + 0.6], [ox0 + 0.2, ox0 + 0.6, oz0, oz1], [ox1 - 0.6, ox1 - 0.2, oz0, oz1]]) k.plain.push([box(a, b, eave - 0.35, eave - 0.05, c, d), '#f4f4f1']);
    // the hall's gable roof, ridge east-west, white gable ends with brown timber louvres
    const half = (iz1 - iz0) / 2 + 0.6, zm = (iz0 + iz1) / 2, top = H + half * 0.28, X0 = ix0 - 0.6, X1 = ix1 + 0.6;
    k.roof.quad([X0, H, iz0 - 0.6], [X1, H, iz0 - 0.6], [X1, top, zm], [X0, top, zm]);
    k.roof.quad([X1, H, iz1 + 0.6], [X0, H, iz1 + 0.6], [X0, top, zm], [X1, top, zm]);
    for (const [x, s] of [[ix0, -1], [ix1, 1]] as [number, number][]) {
      k.plain.push([tri2([x, H, iz0], [x, H, iz1], [x, top - 0.15, zm]), '#f4f4f1']);
      k.plain.push([tri2([x + s * 0.03, H + 0.3, zm - 4], [x + s * 0.03, H + 0.3, zm + 4], [x + s * 0.03, top - 0.6, zm]), '#7a5a3c']);
      for (let y = H + 0.5; y < top - 0.8; y += 0.3) { const w = (4 * (top - 0.6 - y)) / (top - 0.6 - H - 0.3); k.plain.push([box(x + s * 0.04 - 0.02, x + s * 0.04 + 0.02, y, y + 0.06, zm - w, zm + w), '#4e3a28']); }
      k.plain.push([box(x - 0.6 * (s < 0 ? 1 : 0) - 0.05, x + 0.6 * (s > 0 ? 1 : 0) + 0.05, H - 0.1, H + 0.1, iz0 - 0.6, iz1 + 0.6), NFASCIA]);
    }
    k.plain.push([box(X0, X1, top - 0.05, top + 0.12, zm - 0.25, zm + 0.25), '#7e2422']);
    // the name board at the front, the washroom block's walls at the back are the generic builder's
    k.signs.push({ text: 'NEW N BLOCK', x: 0, y: H - 0.6, z: iz1 + 0.02, ry: 0, w: 3.6, colors: ['#f4f4f1', '#1d3f7a'] });
    // trees and bushes along the front by the road, a big shade tree at each end
    const g = garden([-150, -40, -480, -430]);
    g.reseed(23);
    for (let x = -136; x < -54; x += 9.5) if (Math.abs(x + 95) > 4) g.tree(k, NX(x), NZ(-441.4), 0.55 + g.rand() * 0.2);
    g.tree(k, NX(-146), NZ(-441), 1.6);
    g.tree(k, NX(-44), NZ(-440), 1.7);
  },
};

// ---------- the GCB Lecture Building ----------
// (owner's marked aerial, registered at 0.25 m/px, and photos of its north and west sides; old white paint, never
// redone, only lightly weathered: the white must still read as white)
const GO: [number, number] = [-139, -350];
const GX = (x: number) => x - GO[0], GZ = (z: number) => z - GO[1];
/** a box given in world x and z */
const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(GX(x0), GX(x1), y0, y1, GZ(z0), GZ(z1));
const GROOF = '#8a2b2b', GST = 3.6, GT = 2.4;
/** the ground floor, the first floor and the eaves (the blocks' storeys: plinth, two storeys, the band) */
const F1 = GT + PL + GST, EAVE = GT + PL + 2 * GST + BAND;
const OLDW = '#efede6', TILES = '#bdb6a8';
const GCB_WIN: Style = {
  bay: 3.4, up: [[40, 48, 176, 132]], ground: [[40, 256 + 56, 176, 126]],
  draw: (g) => {
    wall(g, OLDW);
    pane(g, 40, 48, 176, 132, 3); pane(g, 40, 256 + 56, 176, 126, 3);
    g.fillStyle = '#d9d5cb'; g.fillRect(32, 184, 192, 6); g.fillRect(32, 256 + 186, 192, 6);
    // (a little weathering only: owner, the white must read as white)
    speckle(g, 0, 0, 256, 512, 300, ['rgba(120,116,104,0.18)']);
  },
};
/** the lobbies' back walls (open to the colonnades on the west and east): lit, posters and notice boards */
const LOBBY: Style = {
  bay: 3.0, up: [[0, 0, 256, 256]], ground: [[0, 256, 256, 256]],
  draw: (g) => {
    g.fillStyle = '#efe7d2'; g.fillRect(0, 0, 256, 512);
    const cols = ['#c0392b', '#1f56b8', '#f2f2ee', '#2e7d4f', '#e0a12b'];
    for (let i = 0; i < 4; i++) { g.fillStyle = cols[(i * 3) % 5]; g.fillRect(20 + i * 58, 256 + 70, 44, 110); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(24 + i * 58, 256 + 80, 36, 20); }
    g.fillStyle = '#3a3a38'; g.fillRect(0, 512 - 40, 256, 40);
  },
};
const W = (x0: number, x1: number, z0: number, z1: number, floors = 2, more: Partial<Block> = {}): Block => ({ x0: GX(x0), x1: GX(x1), z0: GZ(z0), z1: GZ(z1), floors, y: GT, roof: 'none', ...more });
const gcbBlocks: Block[] = [
  W(-156.5, -119.8, -380.5, -361.5),
  W(-158, -121, -344.3, -324.6),
  W(-155.3, -126, -324.6, -309.5),
  // the core between the west and east lobbies (the lobbies open to the colonnades)
  W(-146, -132, -361.5, -344.3, 1, { faces: { x0: LOBBY, x1: LOBBY } }),
];
/** a hip roof (ridge along z) whose ends rise to a small vertical gable under the ridge (the gablet the owner's photo
 *  shows at the north end), world x0..x1, z0..z1 at the eave */
function hipGablet(k: Kit, x0: number, x1: number, z0: number, z1: number, e: number, pitch: number, gw: number) {
  const [X0, X1, Z0, Z1] = [GX(x0), GX(x1), GZ(z0), GZ(z1)];
  const half = (X1 - X0) / 2, xm = (X0 + X1) / 2, top = e + half * pitch, h1 = e + (half - gw) * pitch;
  const zr0 = Z0 + half - gw, zr1 = Z1 - half + gw;
  k.roof.quad([X0, e, Z0], [X1, e, Z0], [xm + gw, h1, zr0], [xm - gw, h1, zr0]);
  k.roof.quad([X1, e, Z1], [X0, e, Z1], [xm - gw, h1, zr1], [xm + gw, h1, zr1]);
  k.roof.quad([X0, e, Z1], [X0, e, Z0], [xm - gw, h1, zr0], [xm - gw, h1, zr1]);
  k.roof.quad([X1, e, Z0], [X1, e, Z1], [xm + gw, h1, zr1], [xm + gw, h1, zr0]);
  k.roof.quad([xm - gw, h1, zr1], [xm - gw, h1, zr0], [xm, top, zr0 - 0.6], [xm, top, zr1 + 0.6]);
  k.roof.quad([xm + gw, h1, zr0], [xm + gw, h1, zr1], [xm, top, zr1 + 0.6], [xm, top, zr0 - 0.6]);
  // the gablets: dark timber triangles with a vent, red bargeboards
  for (const [z, s] of [[zr0, -1], [zr1, 1]] as [number, number][]) {
    k.plain.push([tri2([xm - gw, h1, z + s * 0.05], [xm + gw, h1, z + s * 0.05], [xm, top, z + s * 0.05]), '#4a2f26']);
    k.plain.push([tri2([xm - gw * 0.4, h1 + 0.2, z + s * 0.1], [xm + gw * 0.4, h1 + 0.2, z + s * 0.1], [xm, h1 + (top - h1) * 0.6, z + s * 0.1]), '#1f1d1c']);
  }
  k.plain.push([new THREE.BoxGeometry(0.3, 0.14, zr1 - zr0 + 1.2).translate(xm, top + 0.04, (zr0 + zr1) / 2), '#6d2020']);
  return top;
}
const gcb: Spec = {
  name: 'GCB Lecture Building',
  axis: [1, 0], origin: GO, storey: GST, style: GCB_WIN, roofColor: GROOF, fascia: '#efece4', pitch: 0.3,
  plinth: '#cbc6ba',
  onGround: true,
  replaces: [[-139, -350], [-145.6, -396.2]],
  blocks: gcbBlocks,
  keep: [[GX(-152), GX(-119), GZ(-417), GZ(-393)], [GX(-158.5), GX(-146), GZ(-362), GZ(-343.5)], [GX(-132), GX(-120), GZ(-362), GZ(-343.5)]],
  extras: (k: Kit) => {
    /** the weathered white parts: old paint, washed out */
    const c: Part[] = [];
    const col = (x: number, z: number, y0: number, y1: number, r: number) => c.push([new THREE.CylinderGeometry(r, r, y1 - y0, 16).translate(GX(x), (y0 + y1) / 2, GZ(z)), OLDW]);

    // ---- the gallery across the north (owner: deep, the whole width, on both floors) ----
    const gx0 = -156.5, gx1 = -119.8, gzE = -393.8, gzW = -380.5;
    const xs = Array.from({ length: 8 }, (_, i) => gx0 + 2 + (i * (gx1 - gx0 - 4)) / 7);
    k.plain.push([B(gx0, gx1, GT - 0.05, GT + 0.06, -395, gzW), TILES]);
    for (const x of xs) col(x, -391.6, GT, F1 - 0.45, 0.3);
    // the first floor: a deep slab cantilevered past the ground columns, a thick solid parapet round it
    c.push([B(gx0, gx1, F1 - 0.45, F1, gzE, gzW), OLDW]);
    c.push([B(gx0, gx1, F1 - 0.5, F1 + 1.15, gzE - 0.05, gzE + 0.25), OLDW]);
    c.push([B(gx0 - 0.05, gx0 + 0.25, F1 - 0.5, F1 + 1.15, gzE, gzW), OLDW], [B(gx1 - 0.25, gx1 + 0.05, F1 - 0.5, F1 + 1.15, gzE, gzW), OLDW]);
    c.push([B(gx0, gx1, F1 + 1.15, F1 + 1.25, gzE - 0.1, gzE + 0.3), '#d6d2c8']);
    k.plain.push([B(gx0 + 0.25, gx1 - 0.25, F1, F1 + 0.04, gzE + 0.25, gzW), TILES]);
    for (const x of xs) for (const z of [-390.5, -385]) k.plain.push([B(x - 0.5, x + 0.5, F1 - 0.5, F1 - 0.46, z - 0.1, z + 0.1), '#fff6dc']);
    // the upper gallery: tall slender columns to the roof; under the eaves the beams the roof rests on, their ends
    // standing out past the soffit, a beam across over the columns (the owner's orange mark)
    for (const x of xs) col(x, -392.6, F1, EAVE, 0.22);
    c.push([B(-158.6, -118.4, EAVE - 0.08, EAVE, -395.4, gzW), '#e8e5dd']);
    for (const x of [gx0 + 0.3, ...xs, gx1 - 0.3]) c.push([B(x - 0.18, x + 0.18, EAVE - 0.6, EAVE - 0.08, -395.6, gzW), OLDW]);
    c.push([B(gx0, gx1, EAVE - 0.65, EAVE - 0.08, -392.85, -392.35), OLDW], [B(gx0, gx1, EAVE - 0.65, EAVE - 0.08, -386.7, -386.3), OLDW]);
    for (const x of xs) k.plain.push([B(x - 0.4, x + 0.4, EAVE - 0.7, EAVE - 0.66, -389.6, -389.3), '#fff6dc']);
    // the enclosed room at the east end of the upper gallery, a big window to the north
    c.push([B(-126.2, gx1 - 0.25, F1, EAVE - 0.6, -393.4, gzW), OLDW]);
    k.plain.push([B(-125.6, -120.8, F1 + 1.2, EAVE - 1.4, -393.48, -393.4), '#3d3a36']);
    k.glass.push(B(-125.4, -121.0, F1 + 1.35, EAVE - 1.55, -393.52, -393.48));
    for (const x of [-124.3, -123.2, -122.1]) k.plain.push([B(x - 0.04, x + 0.04, F1 + 1.35, EAVE - 1.55, -393.56, -393.52), '#3d3a36']);
    // the stair under the gallery up to the first floor (owner's green mark), a solid balustrade along it
    const n = 22, run = 0.45, sx = -126.8;
    for (let i = 0; i < n; i++) {
      const y = GT + ((F1 - GT) * (i + 1)) / n, xa = sx - run * (i + 1), xb = sx - run * i;
      k.plain.push([B(xa, xb, y - 0.18, y, -383.6, -381.3), '#cfc9bd']);
      c.push([B(xa, xb, y - 0.4, y + 1.0, -383.75, -383.55), OLDW]);
    }
    c.push([B(sx - run * n, sx, GT, GT + 0.4, -383.6, -381.3), OLDW]);

    // ---- before the gallery, at road level: the stair up the middle and the two ramps (owner's red square) ----
    const st = stairsOf().find((s) => s.alongZ && s.z0 === -138.7)!;
    for (let z = st.x0; z < st.x1 - 1e-3; z += 0.45) {
      const y = st.at(Math.min(st.x1 - 0.01, z + 0.22));
      c.push([B(st.z0, st.z1, 0, y, z, Math.min(st.x1, z + 0.46)), '#d4cfc4']);
      for (const x of [st.z0 - 0.25, st.z1]) c.push([B(x, x + 0.25, 0, y + 0.95, z, Math.min(st.x1, z + 0.46)), OLDW]);
    }
    // each ramp starts by the foot of the stair, runs out along the north edge, turns and climbs south along the
    // outer edge to the gallery (the owner's green arrows); solid white parapets both sides; a planted well inside
    const RW = 2, zN = -413.3, zS = -395, rise1 = 1.0;
    for (const s of [-1, 1]) {
      const xi = s < 0 ? st.z0 - 0.25 : st.z1 + 0.25, xo = s < 0 ? -148.8 : -123.1;
      const xc0 = Math.min(xi, xo), xc1 = Math.max(xi, xo);
      // the run out along the north edge
      const n1 = Math.ceil((xc1 - xc0) / 0.5);
      for (let i = 0; i < n1; i++) {
        const t0 = i / n1, t1 = (i + 1) / n1, xa = s < 0 ? xi - (xi - xo) * t0 : xi + (xo - xi) * t0, xb = s < 0 ? xi - (xi - xo) * t1 : xi + (xo - xi) * t1;
        const y = rise1 * (t0 + t1) / 2, [a, b] = [Math.min(xa, xb), Math.max(xa, xb)];
        c.push([B(a, b, 0, y, zN, zN + RW), '#d4cfc4']);
        c.push([B(a, b, 0, y + 1.0, zN - 0.22, zN), OLDW], [B(a, b, 0, y + 1.0, zN + RW, zN + RW + 0.2), OLDW]);
      }
      // the turn, level
      const ta = s < 0 ? xo : xo - RW, tb = s < 0 ? xo + RW : xo;
      c.push([B(Math.min(ta, tb), Math.max(ta, tb), 0, rise1, zN, zN + RW), '#d4cfc4']);
      c.push([B(Math.min(ta, tb) - 0.2, Math.max(ta, tb) + 0.2, 0, rise1 + 1.0, zN - 0.22, zN), OLDW]);
      // the climb south along the outer edge
      const n2 = Math.ceil((zS - zN - RW) / 0.5), xA = Math.min(ta, tb), xB = Math.max(ta, tb);
      for (let i = 0; i < n2; i++) {
        const za = zN + RW + ((zS - zN - RW) * i) / n2, zb = zN + RW + ((zS - zN - RW) * (i + 1)) / n2, y = rise1 + ((GT - rise1) * (i + 0.5)) / n2;
        c.push([B(xA, xB, 0, y, za, zb), '#d4cfc4']);
        c.push([B(xA - 0.2, xA, 0, y + 1.0, za, zb), OLDW], [B(xB, xB + 0.2, 0, y + 1.0, za, zb), OLDW]);
      }
      // the well inside the ramp: a low kerb round a planted bed
      const wx0 = s < 0 ? xB + 0.2 : xi, wx1 = s < 0 ? xi : xA - 0.2;
      k.plain.push([B(wx0, wx1, 0, 0.25, zN + RW + 0.2, zS), '#4f6b34']);
    }
    // the retaining walls under the gallery's edge and round the raised ground (north, west, east), stained
    c.push([B(-160.3, st.z0 - 0.25, 0, GT + 0.12, -395.3, -394.9), OLDW], [B(st.z1 + 0.25, -117.2, 0, GT + 0.12, -395.3, -394.9), OLDW]);
    c.push([B(-160.3, -159.95, 0, GT + 0.12, -395.3, -360), OLDW], [B(-117.55, -117.2, 0, GT + 0.12, -395.3, -306), OLDW]);
    k.plain.push([B(-151.5, -119.6, -0.02, 0.05, -416.5, -413.5), '#c9c3b5']);
    k.plain.push([B(-119.8, -117.55, GT - 0.02, GT + 0.04, -394.9, -306), TILES], [B(-159.95, -156.5, GT - 0.02, GT + 0.04, -394.9, -361.5), TILES]);

    // ---- the west and east gates (owner's yellow lines): the ground floor open under the upper floor, a colonnade
    // before a lit lobby, never closed ----
    c.push([B(-157.5, -120.5, F1 - 0.45, EAVE, -361.5, -344.3), OLDW]);
    for (const s of [-1, 1]) {
      const xc = s < 0 ? -157.1 : -120.9, xb = s < 0 ? -146 : -132, xf = s < 0 ? -154 : -124;
      const [lx0, lx1] = s < 0 ? [xc - 0.4, xb] : [xb, xc + 0.4];
      k.plain.push([B(lx0, lx1, GT - 0.03, GT + 0.06, -361.5, -344.3), TILES]);
      c.push([B(lx0, lx1, F1 - 0.55, F1 - 0.45, -361.5, -344.3), '#ebe8e0']);
      c.push([B(xc - 0.3, xc + 0.3, F1 - 1.0, F1 - 0.45, -361.5, -344.3), OLDW]);
      for (const z of [-359.8, -355.4, -350.4, -346.0]) col(xc, z, GT, F1 - 1.0, 0.32);
      for (const z of [-358.5, -352.9, -347.3]) k.plain.push([B((xc + xb) / 2 - 1.2, (xc + xb) / 2 + 1.2, F1 - 0.6, F1 - 0.56, z - 0.15, z + 0.15), '#fff6dc']);
      // glass shopfronts at the ends of the lobby's front, the middle left open
      for (const [z0, z1] of [[-361.3, -358.6], [-347.0, -344.5]]) {
        k.glass.push(B(xf - 0.03, xf + 0.03, GT + 0.1, F1 - 0.7, z0, z1));
        k.plain.push([B(xf - 0.05, xf + 0.05, GT, GT + 0.12, z0, z1), '#3a3a38'], [B(xf - 0.05, xf + 0.05, F1 - 0.75, F1 - 0.6, z0, z1), '#3a3a38']);
      }
      // the stalls of a fair in the lobby: tables of goods, roll-up banners
      const xm = (xf + xb) / 2;
      for (const [z, cc] of [[-357.5, '#c0392b'], [-353, '#1f56b8'], [-348.5, '#2e7d4f']] as [number, string][]) {
        k.plain.push([B(xm - 0.8, xm + 0.8, GT + 0.7, GT + 0.78, z - 1.2, z + 1.2), '#f2efe8'], [B(xm - 0.75, xm + 0.75, GT, GT + 0.7, z - 1.15, z + 1.15), cc]);
        k.plain.push([B(xm - 0.3, xm + 0.3, GT + 0.78, GT + 1.1, z - 0.6, z), '#e0a12b'], [B(xm - 0.3, xm + 0.3, GT + 0.78, GT + 1.0, z + 0.2, z + 0.8), '#7a4bb0']);
      }
      for (const z of [-360.2, -345.4]) k.plain.push([B(xf + s * 0.4 - 0.02, xf + s * 0.4 + 0.02, GT, GT + 2.1, z - 0.4, z + 0.4), s < 0 ? '#c0392b' : '#1f56b8']);
    }
    // the cross gable over the middle: the white gable walls rising above the eaves, red sheet cladding in the triangle
    const cz0 = -362.3, cz1 = -343.5, czm = (cz0 + cz1) / 2, ctop = EAVE + ((cz1 - cz0) / 2) * 0.5;
    k.roof.quad([GX(-158.4), EAVE, GZ(cz0)], [GX(-119.6), EAVE, GZ(cz0)], [GX(-119.6), ctop, GZ(czm)], [GX(-158.4), ctop, GZ(czm)]);
    k.roof.quad([GX(-119.6), EAVE, GZ(cz1)], [GX(-158.4), EAVE, GZ(cz1)], [GX(-158.4), ctop, GZ(czm)], [GX(-119.6), ctop, GZ(czm)]);
    for (const [x, s] of [[-157.5, -1], [-120.5, 1]] as [number, number][]) {
      const xf = GX(x) + s * 0.04;
      k.plain.push([tri2([xf, EAVE, GZ(cz0) + 0.3], [xf, EAVE, GZ(cz1) - 0.3], [xf, ctop - 0.2, GZ(czm)]), '#9a2f2f']);
      for (let z = cz0 + 0.8; z < cz1 - 0.5; z += 0.5) { const h = ((cz1 - cz0) / 2 - Math.abs(z - czm)) * 0.5 - 0.3; if (h > 0.1) k.plain.push([B(x + s * 0.06 - 0.02, x + s * 0.06 + 0.02, EAVE, EAVE + h, z - 0.04, z + 0.04), '#7e2424']); }
      c.push([B(x - 0.15, x + 0.15, EAVE - 0.4, EAVE + 0.9, cz0 + 0.8, cz1 - 0.8), OLDW]);
    }
    k.plain.push([B(-158.6, -119.4, ctop - 0.05, ctop + 0.12, czm - 0.2, czm + 0.2), '#6d2020']);
    // the main roof: a hip over the whole, a gablet at each end (owner's photo), the eaves' fascia
    hipGablet(k, -159, -118.5, -395.4, -308.7, EAVE, 0.45, 4);
    c.push([B(-159, -118.5, EAVE - 0.35, EAVE + 0.02, -395.5, -395.3), '#e8e5dd'], [B(-159, -118.5, EAVE - 0.35, EAVE + 0.02, -308.8, -308.6), '#e8e5dd']);
    c.push([B(-159.1, -158.9, EAVE - 0.35, EAVE + 0.02, -395.4, -308.7), '#e8e5dd'], [B(-118.6, -118.4, EAVE - 0.35, EAVE + 0.02, -395.4, -308.7), '#e8e5dd']);

    // ---- round it ----
    k.signs.push({ text: 'UG GCB LECTURE BUILDING', x: GX(-158.1) - 0.05, y: GT + 5.6, z: GZ(-330), ry: -Math.PI / 2, w: 3.6, colors: ['#f6f6f3', '#1d3f7a'] });
    // the black water tank on its stand by the west wing
    c.push([B(-159.6, -157.6, GT, GT + 3.4, -372, -370), OLDW]);
    k.plain.push([new THREE.CylinderGeometry(1.0, 1.0, 1.9, 16).translate(GX(-158.6), GT + 4.35, GZ(-371)), '#1b1c1f']);
    for (const [z, cc] of [[-356, '#1f56b8'], [-350, '#f2f2ee'], [-340, '#c0392b'], [-334, '#1f56b8'], [-326, '#f2f2ee']] as [number, string][]) {
      const x = GX(-164.5), y0 = k.ground(x, GZ(z));
      k.plain.push([new THREE.CylinderGeometry(0.03, 0.03, 3.4, 6).translate(x, y0 + 1.7, GZ(z)), '#8a8d90']);
      k.plain.push([new THREE.BoxGeometry(0.03, 2.6, 0.7).translate(x, y0 + 2.0, GZ(z) + 0.38), cc]);
    }
    const g = garden([-190, -100, -420, -300]);
    g.reseed(41);
    for (const [x, z, sc] of [[-163, -400, 1.4], [-168, -397, 1.2], [-113, -382, 1.6], [-113, -350, 1.5], [-113, -318, 1.4], [-162, -312, 1.2]]) g.tree(k, GX(x), GZ(z), sc);

    const m = new THREE.Mesh(merge(c), concrete(0.12));
    m.castShadow = true; m.receiveShadow = true;
    k.meshes.push(m);
  },
};

/** the New N Block and the GCB Lecture Building */
export const nBlockGcb = createSite('nblock-gcb', [nBlock, gcb]);
