// The New N Block (NNB) and the GCB Lecture Building, from the owner's photos and marked aerial (block engine:
// blocks.ts; the GCB's raised ground, its stair: relief.ts).
//
// New N Block, its front (F) to the road on the south: one floor, a tall hall under a red corrugated gable roof with
// white gable ends and brown timber louvres in them, a white clerestory band of dark louvres along the top of its
// walls; round it a verandah under a lean-to of the same red sheets on square green columns, the floor raised on a
// white plinth; the walls green, dark doors along every side (the owner's blue marks: many entrances), dark windows
// with air-conditioners under them.
//
// GCB Lecture Building, south across the road and up the slope from it: two floors, white, brown-framed windows,
// a maroon corrugated hip roof with a gable across its middle over the west and east entrances (blue marks). On the
// north (toward the N Block) a deep gallery on both floors with slender columns under the roof's long eave, standing
// on a raised platform behind white retaining walls: a broad stair up the middle (blue stripes) and ramps either side
// along the walls (yellow). On the west a car park before the entrances, feather flags, a black water tank.
import * as THREE from 'three';
import { box, speckle } from './modelkit';
import { PL, createSite, render, type Block, type Kit, type Spec, type Style } from './blocks';
import { rectsOf } from './rectilinear';
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
  bay: 3.6, up: [], ground: [[30, 256 + 104, 36, 118], [110, 256 + 120, 100, 48], [40, 256 + 16, 176, 46]],
  draw: (g) => {
    render(g, '#f4f4f1');
    g.fillStyle = GREEN; g.fillRect(0, 256 + 89, 256, 167);
    speckle(g, 0, 256 + 89, 256, 167, 600, ['#77cb9e', '#86d9ad']);
    // the clerestory louvres
    g.fillStyle = '#1e2226'; g.fillRect(40, 256 + 16, 176, 46);
    g.fillStyle = '#3a4046'; for (let y = 256 + 20; y < 256 + 62; y += 7) g.fillRect(40, y, 176, 2);
    // a dark door, a dark window, the air-conditioner under it
    g.fillStyle = '#25282b'; g.fillRect(30, 256 + 104, 36, 152);
    g.fillStyle = '#3a3e42'; g.fillRect(47, 256 + 104, 2, 152);
    g.fillStyle = '#d9dcdb'; g.fillRect(106, 256 + 116, 108, 56);
    g.fillStyle = '#20262c'; g.fillRect(110, 256 + 120, 100, 48);
    g.fillStyle = '#e8e8e6'; g.fillRect(126, 256 + 180, 54, 40);
    g.fillStyle = '#8f9497'; for (let x = 130; x < 176; x += 6) g.fillRect(x, 256 + 184, 2, 32);
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
      const tri = new THREE.Shape([new THREE.Vector2(iz0, H), new THREE.Vector2(iz1, H), new THREE.Vector2(zm, top - 0.15)]);
      k.plain.push([new THREE.ShapeGeometry(tri).rotateY(s > 0 ? Math.PI / 2 : -Math.PI / 2).translate(x, 0, 0), '#f4f4f1']);
      const lv = new THREE.Shape([new THREE.Vector2(zm - 4, H + 0.3), new THREE.Vector2(zm + 4, H + 0.3), new THREE.Vector2(zm, top - 0.6)]);
      k.plain.push([new THREE.ShapeGeometry(lv).rotateY(s > 0 ? Math.PI / 2 : -Math.PI / 2).translate(x + s * 0.03, 0, 0), '#7a5a3c']);
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
const GO: [number, number] = [-139, -350];
const GX = (x: number) => x - GO[0], GZ = (z: number) => z - GO[1];
const GROOF = '#8e2b2b', GST = 3.8, GT = 2.4;
const GCB_WALL: Style = {
  bay: 3.4, up: [[44, 54, 168, 120]], ground: [[44, 256 + 58, 168, 120]],
  draw: (g) => {
    render(g, '#f5f5f2');
    for (const y0 of [0, 256]) {
      g.fillStyle = '#6b4a33'; g.fillRect(40, y0 + (y0 ? 54 : 50), 176, 128);
      g.fillStyle = '#2a3036'; g.fillRect(44, y0 + (y0 ? 58 : 54), 168, 120);
      g.fillStyle = '#6b4a33'; for (const x of [84, 128, 172]) g.fillRect(x - 2, y0 + 54, 4, 124);
      g.fillRect(44, y0 + 100, 168, 4);
      g.fillStyle = '#ffffff'; g.fillRect(36, y0 + 182, 184, 6);
    }
    g.fillStyle = '#cfccc4'; g.fillRect(0, 512 - 20, 256, 20);
  },
};
const GCB_RING: [number, number][] = [[-152.0, -390.1], [-123.2, -388.8], [-123.7, -379.1], [-119.3, -378.9], [-120.2, -359.6], [-123.9, -359.8], [-124.7, -342.9], [-121.1, -342.7], [-122.0, -324.2], [-125.7, -324.4], [-126.4, -309.0], [-155.3, -310.3], [-154.7, -324.6], [-158.5, -324.7], [-157.6, -344.4], [-154.3, -344.3], [-153.5, -361.3], [-156.9, -361.5], [-156.1, -380.5], [-152.5, -380.3]];
const gcbBlocks: Block[] = rectsOf(GCB_RING.map(([x, z]) => [GX(x), GZ(z)] as [number, number]), 1.0, 1.5).map(([x0, x1, z0, z1]) => ({ x0, x1, z0, z1, floors: 2, y: GT }));
const gcb: Spec = {
  name: 'GCB Lecture Building',
  axis: [1, 0], origin: GO, storey: GST, style: GCB_WALL, roofColor: GROOF, fascia: '#f1efea', pitch: 0.32,
  plinth: '#d8d5cd',
  replaces: [[-139, -350], [-145.6, -396.2]],
  blocks: gcbBlocks,
  keep: [[GX(-150), GX(-121), GZ(-416), GZ(-390)], [GX(-161), GX(-157), GZ(-362), GZ(-340)], [GX(-122), GX(-117), GZ(-362), GZ(-340)]],
  extras: (k: Kit) => {
    const ff = GT + PL + GST, eave = GT + k.wallTop(2);
    // the north gallery on both floors under the roof's long eave: slender columns, the first floor's slab with a
    // solid white parapet, a lean-to of the roof's sheets over it
    const gx0 = GX(-152), gx1 = GX(-123.2), gz1 = GZ(-390.1), gz0 = gz1 - 3.4;
    k.plain.push([box(gx0, gx1, ff - 0.3, ff, gz0, gz1), '#efeeea'], [box(gx0, gx1, ff, ff + 1.1, gz0, gz0 + 0.2), '#f6f6f3']);
    k.plain.push([box(gx0, gx0 + 0.2, ff, ff + 1.1, gz0, gz1), '#f6f6f3'], [box(gx1 - 0.2, gx1, ff, ff + 1.1, gz0, gz1), '#f6f6f3']);
    for (let x = gx0 + 0.3; x <= gx1 - 0.2; x += (gx1 - gx0 - 0.5) / 7) {
      k.plain.push([box(x - 0.15, x + 0.15, GT, ff - 0.3, gz0 + 0.3, gz0 + 0.6), '#f4f4f1']);
      k.plain.push([box(x - 0.12, x + 0.12, ff + 1.1, eave, gz0 + 0.3, gz0 + 0.54), '#f4f4f1']);
    }
    k.plain.push([box(gx0, gx1, GT, GT + 0.15, gz0, gz1), '#cfcac0']);
    k.roof.quad([gx0 - 0.8, eave - 1.1, gz0 - 0.8], [gx1 + 0.8, eave - 1.1, gz0 - 0.8], [gx1 + 0.8, eave, gz1 - 0.6], [gx0 - 0.8, eave, gz1 - 0.6]);
    k.plain.push([box(gx0 - 0.8, gx1 + 0.8, eave - 1.4, eave - 1.1, gz0 - 0.86, gz0 - 0.74), '#f1efea']);
    for (let x = gx0 + 3; x < gx1; x += 7) k.plain.push([box(x - 0.4, x + 0.4, ff - 0.34, ff - 0.3, gz0 + 1.2, gz0 + 1.6), '#fff6dc']);
    // the platform before the gallery: white retaining walls round it, the broad stair up the middle (blue stripes)
    // and a ramp along the wall either side (yellow), white parapets
    const st = stairsOf().find((s) => s.alongZ && s.z0 === -139)!;
    const pz0 = GZ(-407.5), px0 = GX(-148), px1 = GX(-122);
    k.plain.push([box(px0, px1, 0, GT, pz0, gz0), '#e9e8e3'], [box(px0, px1, GT, GT + 0.05, pz0, gz0), '#cfcac0']);
    for (let j = 0; j < st.flights * st.steps; j++) {
      const za = st.x0 + j * st.tread, y = st.at(za + st.tread / 2);
      k.plain.push([box(GX(st.z0), GX(st.z1), y - 0.2, y, GZ(za), GZ(za + st.tread + 0.02)), '#cfcac0']);
    }
    for (const x of [st.z0 - 0.3, st.z1]) {
      for (let j = 0; j < st.flights * st.steps; j++) { const za = st.x0 + j * st.tread, y = st.at(za + st.tread / 2); k.plain.push([box(GX(x), GX(x + 0.3), 0, y + 0.9, GZ(za), GZ(za + st.tread + 0.02)), '#f2f1ec']); }
    }
    for (const s of [-1, 1]) {
      // each ramp climbs along the north wall from its outer end toward the stair
      const xa = s < 0 ? px0 - 0.2 : px1 + 0.2, xb = s < 0 ? GX(st.z0) - 1.0 : GX(st.z1) + 1.0, zr = pz0 - 1.8;
      const len = Math.abs(xb - xa), a = Math.atan2(GT, len);
      k.plain.push([new THREE.BoxGeometry(Math.hypot(len, GT), 0.25, 1.8).rotateZ(s < 0 ? a : -a).translate((xa + xb) / 2, GT / 2, zr + 0.9), '#d4d0c7']);
      k.plain.push([new THREE.BoxGeometry(Math.hypot(len, GT), 1.0, 0.2).rotateZ(s < 0 ? a : -a).translate((xa + xb) / 2, GT / 2 + 0.6, zr), '#f2f1ec']);
      k.plain.push([box(Math.min(xa, xb), Math.max(xa, xb), 0, 0.5, zr - 0.1, zr + 1.8), '#e9e8e3']);
      k.plain.push([box(s < 0 ? xb - 1.4 : xb, s < 0 ? xb : xb + 1.4, 0, GT, zr, pz0), '#e9e8e3']);
    }
    // the parapet round the platform's edge, open at the stair
    k.plain.push([box(px0, GX(st.z0) - 0.3, GT, GT + 1.0, pz0, pz0 + 0.2), '#f6f6f3'], [box(GX(st.z1) + 0.3, px1, GT, GT + 1.0, pz0, pz0 + 0.2), '#f6f6f3']);
    k.plain.push([box(px0, px0 + 0.2, GT, GT + 1.0, pz0, gz0), '#f6f6f3'], [box(px1 - 0.2, px1, GT, GT + 1.0, pz0, gz0), '#f6f6f3']);
    // the gable across the middle over the west and east entrances
    const cz0 = GZ(-364), cz1 = GZ(-339), cx0 = GX(-158.8), cx1 = GX(-119.0), czm = (cz0 + cz1) / 2, chalf = (cz1 - cz0) / 2 + 0.8, ctop = eave + chalf * 0.42;
    k.roof.quad([cx0, eave, cz0 - 0.8], [cx1, eave, cz0 - 0.8], [cx1, ctop, czm], [cx0, ctop, czm]);
    k.roof.quad([cx1, eave, cz1 + 0.8], [cx0, eave, cz1 + 0.8], [cx0, ctop, czm], [cx1, ctop, czm]);
    for (const [x, s] of [[cx0 + 0.4, -1], [cx1 - 0.4, 1]] as [number, number][]) {
      const tri = new THREE.Shape([new THREE.Vector2(cz0, eave), new THREE.Vector2(cz1, eave), new THREE.Vector2(czm, ctop - 0.1)]);
      k.plain.push([new THREE.ShapeGeometry(tri).rotateY(s > 0 ? Math.PI / 2 : -Math.PI / 2).translate(x, 0, 0), '#f6f6f3']);
      k.plain.push([box(x - 0.4, x + 0.4, GT, eave, cz0, cz1), '#f6f6f3']);
    }
    // the entrances on the west and the east (blue marks): open lobbies, lit inside, under the gable
    for (const [x, s] of [[GX(-158.5), -1], [GX(-119.3), 1]] as [number, number][]) {
      const xf = x + s * 0.45;
      for (const zc of [GZ(-356.5), GZ(-348)]) {
        k.plain.push([box(xf - 0.03, xf + 0.03, GT, GT + 2.9, zc - 1.7, zc + 1.7), '#cdb990'], [box(xf - 0.05 * s, xf + 0.05 * s - 0.0001 * s, GT + 2.9, GT + 3.2, zc - 1.9, zc + 1.9), '#f6f6f3']);
        k.plain.push([box(xf - 0.06, xf + 0.06, GT, GT + 3.2, zc - 1.95, zc - 1.7), '#2d6fd1'], [box(xf - 0.06, xf + 0.06, GT, GT + 3.2, zc + 1.7, zc + 1.95), '#2d6fd1']);
      }
      k.plain.push([box(x + s * 0.3, x + s * 2.4, GT - 0.02, GT + 0.06, GZ(-362), GZ(-342)), '#bdb7aa']);
    }
    k.signs.push({ text: 'UG GCB LECTURE BUILDING', x: GX(-158.5) - 0.5, y: GT + 5.4, z: GZ(-330), ry: -Math.PI / 2, w: 3.6, colors: ['#f6f6f3', '#1d3f7a'] });
    // the black water tank on its stand at the north-west corner
    k.plain.push([box(GX(-157.4), GX(-154.6), GT, GT + 4.2, GZ(-389.4), GZ(-386.6)), '#efeeea']);
    k.plain.push([new THREE.CylinderGeometry(1.05, 1.05, 2.0, 16).translate(GX(-156), GT + 5.2, GZ(-388)), '#1b1c1f']);
    // feather flags along the car park's edge (blue, white, red)
    for (const [z, c] of [[-372, '#1f56b8'], [-366, '#f2f2ee'], [-340, '#c0392b'], [-334, '#1f56b8'], [-326, '#f2f2ee']] as [number, string][]) {
      const x = GX(-164.5), y0 = k.ground(x, GZ(z));
      k.plain.push([new THREE.CylinderGeometry(0.03, 0.03, 3.4, 6).translate(x, y0 + 1.7, GZ(z)), '#8a8d90']);
      k.plain.push([new THREE.BoxGeometry(0.03, 2.6, 0.7).translate(x, y0 + 2.0, GZ(z) + 0.38), c]);
    }
    // trees round it (owner's aerial): along the west edge and the east side
    const g = garden([-190, -100, -420, -300]);
    g.reseed(41);
    for (const [x, z, sc] of [[-162, -392, 1.4], [-167, -397, 1.2], [-114, -380, 1.6], [-113, -350, 1.5], [-114, -318, 1.4], [-160, -312, 1.2]]) g.tree(k, GX(x), GZ(z), sc);
  },
  onGround: true,
};

/** the New N Block and the GCB Lecture Building */
export const nBlockGcb = createSite('nblock-gcb', [nBlock, gcb]);
