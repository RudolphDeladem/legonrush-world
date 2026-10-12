// The Great Hall at the top of Legon Hill, rebuilt to the owner's Commonwealth and Great Hall brief (S3 to S6, O2, O3;
// block engine: blocks.ts; its entrance terrace and steps: relief.ts).
//
// The hall (the mapped Great Hall outline): a tall auditorium under a broad weathered red-tile hip roof, white walls with
// a row of high ventilation windows under the eaves; before it, facing east down the axis to Commonwealth, a lower
// entrance block whose portico of strong white piers frames several dark doors, a patterned band over them. Behind it
// (west, between the two road loops) the semicircular projection S4 shows: a curved wall ringed by columns under a
// curved roof. The hall stands on a stone-faced plinth; before the portico a raised entrance terrace, faced in stone,
// with shallow curved steps down its middle and a ramp at its north end (S6).
// Either side of the forecourt the low side wings (S4, S6: one storey, dark shutters, AC units) wrap round courts,
// joined to the hall's front; between their east ends the formal garden (S3): low hedged beds round a paved cross and
// a round bed, with the paired small buildings either side. Palms along the forecourt, broadleaf trees round it.
// The clock tower (landmarks.ts) stands south of the hall on its own mapped base (the outline the map had inside the hall
// was a misplacement of it).
// Heights, the tower's height and the steps' rises are read from the photographs, not measured.
import * as THREE from 'three';
import { createSite, render, window_, PL, type Block, type Kit, type Spec, type Style } from './blocks';
import { WHITE, box, canvas } from './modelkit';
import { stairsOf } from './relief';
import { broadleaf } from './nsiaroad';
import { wallSolids } from './enkit';
import { SOLIDS } from './solids';
import { garden } from './gardens';

const O: [number, number] = [-1010, 128];
const L = (x: number) => x - O[0], Lz = (z: number) => z - O[1];
const W = (x0: number, x1: number, z0: number, z1: number, floors: number, extra: Partial<Block> = {}): Block =>
  ({ x0: L(x0), x1: L(x1), z0: Lz(z0), z1: Lz(z1), floors, ...extra });

const ROOF = '#b25a3c', FASCIA = '#f6f2ea', STONE = '#a08b70', STONE_DARK = '#8a765e', SOFFIT = '#4d3d33';
const ST = 3.4;
/** the hall's floor: the hill's top (21 m, relief.ts) and the plinth */
const FLOOR = 22.2;

/** the auditorium's walls: plain render, a high dark ventilation window per bay under the eaves */
const GH_HALL: Style = {
  bay: 3.2,
  up: [[78, 20, 100, 60]],
  ground: [],
  draw: (g) => {
    render(g, '#f6f3ec');
    g.fillStyle = '#e9e4da'; g.fillRect(70, 12, 116, 76);
    g.fillStyle = '#2c2a28'; g.fillRect(78, 20, 100, 60);
    g.fillStyle = '#e9e4da'; for (const x of [111, 144]) g.fillRect(x, 20, 3, 60);
  },
};
/** the low wings: white, a dark louvred shutter per bay (S6) */
const GH_WING: Style = {
  bay: 2.8,
  up: [],
  ground: [],
  draw: (g) => {
    render(g, '#f5f2eb');
    for (const y0 of [60, 316]) {
      g.fillStyle = '#2f2823'; g.fillRect(92, y0, 72, 140);
      g.fillStyle = '#4a3b2f'; for (let y = y0 + 6; y < y0 + 136; y += 9) g.fillRect(96, y, 64, 4);
      g.fillStyle = '#e8e3d8'; g.fillRect(86, y0 + 140, 84, 8);
    }
  },
};
/** the entrance block's sides: two rows of dark windows */
const GH_SIDE: Style = {
  bay: 3.2,
  up: [[80, 70, 96, 110]],
  ground: [[80, 316, 96, 120]],
  draw: (g) => {
    render(g, '#f6f3ec');
    window_(g, [80, 70, 96, 110], '#3d3029', 2, 0.3);
    window_(g, [80, 316, 96, 120], '#3d3029', 2, 0.3);
  },
};

// the auditorium, the entrance block before it (facing east), the projection behind
const AUD: [number, number, number, number] = [-1027.5, -998, 110, 148];
const ENT: [number, number, number, number] = [-998, -992.4, 112, 140];
const APSE = { x: -1027.5, z: 129, r: 9.5 };
/** the low wings (one storey; the mapped L-shaped outlines): each a long range along the outer side and an arm at its east
 *  end turning in toward the axis, so with the hall they wrap the forecourt's court; short links join them to the hall */
const WINGS: [number, number, number, number][] = [
  [-1003.4, -934.1, 92.8, 103.1], [-1003.4, -993.5, 103.1, 107.3], [-944, -934.2, 103.1, 116.4], [-1002, -994, 107.3, 110.2],
  [-1000.4, -934.6, 152, 164.1], [-942.2, -934.5, 137.4, 152], [-1001, -996.6, 147.8, 152],
];
/** the paired small buildings either side of the formal garden (mapped outlines) */
const PAIR: [number, number, number, number][] = [[-914.3, -896.9, 103, 111.7], [-914.3, -896.9, 144, 152.7]];

const steps = stairsOf().find((s) => s.x0 === -982 && s.x1 === -985)!;
const g = garden([-1060, -880, 80, 210]);

/** a band of dark lattice panels facing +x (the portico's frieze) */
let bandMat: THREE.MeshStandardMaterial | null = null;
const band = () => (bandMat ??= new THREE.MeshStandardMaterial({ roughness: 0.85, map: canvas(64, 32, (c) => {
  c.fillStyle = '#efeae0'; c.fillRect(0, 0, 64, 32);
  c.fillStyle = '#2d2925'; c.fillRect(4, 6, 56, 20);
  c.fillStyle = '#d8d1c4'; for (let x = 10; x < 60; x += 8) c.fillRect(x, 6, 2.5, 20);
}) }));

/** a hip roof over a rectangle (model frame) with deep eaves, a dark soffit and a white fascia */
function hipDeep(k: Kit, x0: number, x1: number, z0: number, z1: number, wall: number, pitch: number, over: number) {
  const X0 = x0 - over, X1 = x1 + over, Z0 = z0 - over, Z1 = z1 + over, e = wall - over * pitch * 0.4;
  const w = X1 - X0, d = Z1 - Z0, half = Math.min(w, d) / 2, top = e + half * pitch;
  if (w >= d) {
    const zm = (Z0 + Z1) / 2, r0 = [X0 + half, top, zm], r1 = [X1 - half, top, zm];
    k.roof.quad([X0, e, Z0], [X1, e, Z0], r1, r0); k.roof.quad([X1, e, Z1], [X0, e, Z1], r0, r1);
    k.roof.quad([X0, e, Z1], [X0, e, Z0], r0, r0); k.roof.quad([X1, e, Z0], [X1, e, Z1], r1, r1);
  } else {
    const xm = (X0 + X1) / 2, r0 = [xm, top, Z0 + half], r1 = [xm, top, Z1 - half];
    k.roof.quad([X1, e, Z0], [X1, e, Z1], r1, r0); k.roof.quad([X0, e, Z1], [X0, e, Z0], r0, r1);
    k.roof.quad([X0, e, Z0], [X1, e, Z0], r0, r0); k.roof.quad([X1, e, Z1], [X0, e, Z1], r1, r1);
  }
  for (const [a, b, c, dd] of [[X0, X1, Z0, z0], [X0, X1, z1, Z1], [X0, x0, z0, z1], [x1, X1, z0, z1]]) k.plain.push([box(a, b, e - 0.06, e, c, dd), SOFFIT]);
  for (const z of [Z0, Z1]) k.plain.push([box(X0, X1, e - 0.3, e + 0.03, z - 0.06, z + 0.06), FASCIA]);
  for (const x of [X0, X1]) k.plain.push([box(x - 0.06, x + 0.06, e - 0.3, e + 0.03, Z0, Z1), FASCIA]);
  return top;
}

const hall: Spec = {
  name: 'Great Hall',
  axis: [1, 0], origin: O, storey: ST, style: GH_HALL, roofColor: ROOF, fascia: FASCIA, pitch: 0.4,
  onGround: true,
  replaces: [[-1010.6, 132.6], [-960, 158], [-960, 97], [-1013, 158.9]],
  blocks: [
    W(...AUD, 3, { roof: 'none', y: FLOOR }),
    W(...ENT, 2, { roof: 'none', y: FLOOR, faces: { z0: GH_SIDE, z1: GH_SIDE, x1: GH_SIDE } }),
    ...WINGS.map((r) => W(...r, 1, { faces: { x0: GH_WING, x1: GH_WING, z0: GH_WING, z1: GH_WING }, roofColor: ROOF, pitch: 0.45 })),
  ],
  keep: [[L(-1040), L(-930), Lz(117), Lz(139.5)], [L(-940), L(-905), Lz(112), Lz(144)]],
  extras: (k) => {
    g.reseed(23);
    for (const r of [AUD, ENT, ...WINGS, ...PAIR]) g.clear.push([r[0] - 2, r[1] + 2, r[2] - 2, r[3] + 2]);
    g.clear.push([-1040, -930, 117, 140], [-940, -905, 112, 144], [-1040, -1016, 116, 142]);

    // the plinth round the hall and the entrance block, stone-faced
    for (const [x0, x1, z0, z1] of [AUD, ENT]) k.plain.push([box(L(x0) - 0.12, L(x1) + 0.12, FLOOR - 1.6, FLOOR + 0.05, Lz(z0) - 0.12, Lz(z1) + 0.12), STONE_DARK]);

    // the auditorium's roof, broad and deep-eaved
    const aWall = FLOOR + k.wallTop(3);
    k.roof.c = new THREE.Color(ROOF);
    hipDeep(k, L(AUD[0]), L(AUD[1]), Lz(AUD[2]), Lz(AUD[3]), aWall, 0.42, 1.4);

    // the entrance block: its roof, the portico of piers across the front with dark doors between, the band over them
    const eWall = FLOOR + k.wallTop(2) + 0.6, fx = L(ENT[1]);
    k.plain.push([box(L(ENT[0]), fx, FLOOR + k.wallTop(2) - 0.2, eWall, Lz(ENT[2]), Lz(ENT[3])), WHITE]);
    hipDeep(k, L(ENT[0]), fx + 2.2, Lz(ENT[2]), Lz(ENT[3]), eWall, 0.42, 1.3);
    const piers = 7, z0 = Lz(ENT[2]) + 1.0, z1 = Lz(ENT[3]) - 1.0, pw = 0.9;
    for (let i = 0; i < piers; i++) {
      const z = z0 + ((z1 - z0) * i) / (piers - 1);
      k.plain.push([box(fx + 1.2, fx + 2.2, FLOOR, eWall - 0.9, z - pw / 2, z + pw / 2), WHITE]);
      if (i < piers - 1) {
        const zn = z0 + ((z1 - z0) * (i + 1)) / (piers - 1), zm = (z + zn) / 2;
        k.plain.push([box(fx, fx + 0.08, FLOOR + PL, FLOOR + PL + 2.9, zm - 0.9, zm + 0.9), '#262120']);
        k.plain.push([box(fx + 0.08, fx + 0.12, FLOOR + PL, FLOOR + PL + 2.9, zm - 0.03, zm + 0.03), '#6d5844']);
        k.glass.push(box(fx, fx + 0.06, FLOOR + PL + ST + 0.6, FLOOR + PL + ST + 2.4, zm - 0.8, zm + 0.8));
      }
    }
    k.plain.push([box(fx, fx + 2.2, eWall - 0.9, eWall, Lz(ENT[2]) + 0.4, Lz(ENT[3]) - 0.4), WHITE]);
    k.plain.push([box(fx, fx + 2.2, FLOOR - 0.02, FLOOR + 0.06, Lz(ENT[2]) + 0.4, Lz(ENT[3]) - 0.4), '#cfc6b6']);
    {
      const geo = new THREE.PlaneGeometry(Lz(ENT[3]) - Lz(ENT[2]) - 1.6, 0.7).rotateY(Math.PI / 2).translate(fx + 2.22, eWall - 0.45, (Lz(ENT[2]) + Lz(ENT[3])) / 2);
      const uv = geo.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 16);
      k.meshes.push(new THREE.Mesh(geo, band()));
    }
    k.signs.push({ text: 'GREAT HALL', x: fx + 2.23, y: eWall - 1.25, z: 0, ry: Math.PI / 2, w: 3.4, colors: ['#f6f2ea', '#5a3b28'] });

    // the semicircular projection behind (S4): a curved wall, a ring of columns, a curved roof
    {
      const cx = L(APSE.x), cz = Lz(APSE.z), r = APSE.r, top = FLOOR + 7.2;
      k.plain.push([new THREE.CylinderGeometry(r + 2.6, r + 2.6, 1.6, 28, 1, false, Math.PI, Math.PI).translate(cx, FLOOR - 0.75, cz), STONE]);
      k.plain.push([new THREE.CylinderGeometry(r, r, top - FLOOR + 1.6, 28, 1, false, Math.PI, Math.PI).translate(cx, (top + FLOOR - 1.6) / 2, cz), WHITE]);
      for (let i = 0; i <= 8; i++) {
        const a = Math.PI + (i / 8) * Math.PI;
        k.plain.push([new THREE.CylinderGeometry(0.32, 0.36, top - FLOOR - 0.4, 10).translate(cx + Math.sin(a) * (r + 2.0), FLOOR + (top - FLOOR - 0.4) / 2, cz + Math.cos(a) * (r + 2.0)), '#f8f5ee']);
      }
      for (let i = 0; i < 6; i++) {
        const a = Math.PI + ((i + 0.5) / 6) * Math.PI;
        k.plain.push([box(-0.03, 0.03, FLOOR + PL, FLOOR + PL + 2.7, -0.8, 0.8).rotateY(a + Math.PI / 2).translate(cx + Math.sin(a) * (r + 0.02), 0, cz + Math.cos(a) * (r + 0.02)), '#2a2523']);
      }
      k.plain.push([new THREE.CylinderGeometry(r + 2.6, r + 2.6, 0.4, 28, 1, false, Math.PI, Math.PI).translate(cx, top, cz), FASCIA]);
      k.plain.push([new THREE.CylinderGeometry(0.6, r + 3.1, 3.2, 28, 1, false, Math.PI, Math.PI).translate(cx, top + 1.8, cz), ROOF]);
      for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; SOLIDS.add(...k.world(cx + Math.sin(a) * (r + 2.4), cz + Math.cos(a) * (r + 2.4)), 0.6); }
    }

    // the entrance terrace (relief.ts): its stone faces and coping, the curved steps down its middle, the ramp leaving its
    // north end eastward beside them
    {
      const tx0 = L(-1001.5), tx1 = L(-985), tz0 = Lz(111.5), tz1 = Lz(140.5), gy = 21, rz0 = 111.8, rz1 = 114.1;
      for (const [a, b, c, d] of [[tx1 - 0.2, tx1 + 0.35, Lz(rz1 + 0.1), Lz(steps.z0)], [tx1 - 0.2, tx1 + 0.35, Lz(steps.z1), tz1], [tx0, tx1 + 0.35, tz0 - 0.35, tz0 + 0.2], [tx0, tx1 + 0.35, tz1 - 0.2, tz1 + 0.35]]) {
        k.plain.push([box(a, b, gy - 0.4, FLOOR + 0.05, c, d), STONE]);
        k.plain.push([box(a - 0.05, b + 0.05, FLOOR + 0.05, FLOOR + 0.5, c, d), '#b9a78c']);
      }
      wallSolids(-985 + 0.1, rz1 + 0.1, -985 + 0.1, steps.z0, 0.35); wallSolids(-985 + 0.1, steps.z1, -985 + 0.1, 140.5, 0.35);
      k.plain.push([box(L(-992.4), tx1, FLOOR - 0.05, FLOOR + 0.04, tz0 + 0.2, tz1 - 0.2), '#cbbfac']);
      // curved steps: half-ellipses under the terrace's edge, each a step lower and wider
      const n = 5, rz = (steps.z1 - steps.z0) / 2, sz = Lz((steps.z0 + steps.z1) / 2);
      for (let i = 0; i < n; i++) {
        const f = (n - i) / n, h = gy + ((FLOOR - gy) * (i + 1)) / (n + 1);
        k.plain.push([new THREE.CylinderGeometry(3.0 * f, 3.0 * f, h - gy + 0.3, 28, 1, false, 0, Math.PI).scale(1, 1, rz / 3.0).translate(tx1, (h + gy - 0.3) / 2, sz), i % 2 ? '#d3c8b6' : '#c9bea9']);
      }
      // the ramp: from the terrace's level at its east edge down eastward to the forecourt, a low wall on its north side
      const r0 = L(-985), r1 = L(-976.5), run = Math.hypot(r1 - r0, FLOOR - gy), ang = Math.atan2(FLOOR - gy, r1 - r0);
      const ramp = new THREE.BoxGeometry(run, 0.3, Lz(rz1) - Lz(rz0)).rotateZ(-ang).translate((r0 + r1) / 2, (FLOOR + gy) / 2 - 0.12, Lz((rz0 + rz1) / 2));
      k.plain.push([ramp, '#c4b8a4']);
      const rw = new THREE.BoxGeometry(run, 0.9, 0.3).rotateZ(-ang).translate((r0 + r1) / 2, (FLOOR + gy) / 2 + 0.4, Lz(rz0) - 0.15);
      k.plain.push([rw, STONE]);
      k.plain.push([box(r0 - 0.2, r1, gy - 0.4, gy + 0.05, Lz(rz0) - 0.3, Lz(rz1)), STONE_DARK]);
    }

    /** paving in 2 m lengths along x, each on the ground at its middle (the hill falls gently east) */
    const pave = (x0: number, x1: number, z0: number, z1: number, col: string) => {
      for (let x = x0; x < x1 - 0.01; x += 2) { const b = Math.min(x1, x + 2), y = k.ground(L((x + b) / 2), Lz((z0 + z1) / 2)); k.plain.push([box(L(x), L(b) + 0.02, y - 0.4, y + 0.05, Lz(z0), Lz(z1)), col]); }
    };
    // the forecourt: paving from the steps east between the wings, planted beds along it, palms either side
    pave(-982, -941, 121, 135, '#cfc6b6');
    for (const z of [118.8, 137.2]) {
      for (let x = -980; x < -943; x += 4) {
        const y = k.ground(L(x + 2), Lz(z));
        k.plain.push([box(L(x), L(x + 4) + 0.02, y - 0.4, y + 0.4, Lz(z) - 1.0, Lz(z) + 1.0), STONE_DARK]);
        k.plain.push([box(L(x) + 0.1, L(x + 4) - 0.08, y + 0.4, y + 0.45, Lz(z) - 0.85, Lz(z) + 0.85), '#5b4636']);
      }
      for (let x = -978; x < -944; x += 2.3) g.bush(k, L(x), Lz(z), 0.5 + g.rand() * 0.25);
      for (let x = -976; x < -944; x += 9) g.palm(k, L(x), Lz(z < 128 ? 117.2 : 138.8), 8 + g.rand() * 2);
    }
    // the formal garden between the paired buildings (S3): hedged beds round a paved cross and a round bed
    {
      const gx0 = -932, gx1 = -912, gz0 = 114, gz1 = 141, gm = (gz0 + gz1) / 2, xm = (gx0 + gx1) / 2;
      pave(gx0, gx1, gm - 1.6, gm + 1.6, '#cfc6b6');
      pave(xm - 1.6, xm + 1.6, gz0, gz1, '#cfc6b6');
      for (const [a, b] of [[gx0, xm - 1.6], [xm + 1.6, gx1]] as [number, number][]) for (const [c, d] of [[gz0, gm - 1.6], [gm + 1.6, gz1]] as [number, number][]) {
        const y = k.ground(L((a + b) / 2), Lz((c + d) / 2));
        for (const [p, q, r, s] of [[a, b, c, c + 0.6], [a, b, d - 0.6, d], [a, a + 0.6, c, d], [b - 0.6, b, c, d]]) k.plain.push([box(L(p), L(q), y - 0.2, y + 0.55, Lz(r), Lz(s)), '#3d6e2a']);
        k.plain.push([box(L(a + 1.6), L(b - 1.6), y - 0.2, y + 0.3, Lz(c + 1.6), Lz(d - 1.6)), (a < xm) === (c < gm) ? '#7a3d4a' : '#c9a23a']);
      }
      const y = k.ground(L(xm), Lz(gm));
      k.plain.push([new THREE.CylinderGeometry(2.6, 2.6, 0.5, 24).translate(L(xm), y + 0.05, Lz(gm)), '#b9ad98']);
      k.plain.push([new THREE.CylinderGeometry(2.2, 2.2, 0.55, 24).translate(L(xm), y + 0.12, Lz(gm)), '#456f2d']);
    }
    // broadleaf trees round the hall and the wings, palms by the projection
    const trees: [THREE.BufferGeometry, string][] = [];
    for (const [x, z, h, s] of [[-1040, 112, 10, 14], [-1044, 139, 9.5, 13], [-1020, 172, 10, 15], [-990, 172, 9, 13], [-1018, 86, 10, 14], [-985, 84, 9, 13], [-950, 170, 9.5, 13], [-952, 86, 9, 12]] as [number, number, number, number][]) broadleaf(k, trees, x, z, { h, spread: s, seed: x * 2 + z, origin: O });
    for (const [x, z] of [[-1034, 116.5], [-1034, 141.5], [-1040.5, 124], [-1040.5, 134]]) g.palm(k, L(x), Lz(z), 9 + g.rand() * 2);
    for (const [geo, c] of trees) k.plain.push([geo, c]);
    g.scatter(-990, -946, 104, 115, 8, (x, z) => g.bush(k, L(x), Lz(z), 0.6 + g.rand() * 0.4));
    g.scatter(-995, -944, 141, 151, 8, (x, z) => g.bush(k, L(x), Lz(z), 0.6 + g.rand() * 0.4));
    // AC units on the wings' outer faces (S6)
    for (const x of [-990, -975, -961, -947]) for (const [z, s] of [[92.8, -1], [164.1, 1]] as [number, number][]) {
      const y = k.ground(L(x), Lz(z));
      k.plain.push([box(L(x) - 0.42, L(x) + 0.42, y + 2.3, y + 2.85, Lz(z) + s * 0.02, Lz(z) + s * 0.34), '#dcdcd6']);
      k.plain.push([box(L(x) - 0.3, L(x) + 0.3, y + 2.4, y + 2.75, Lz(z) + s * 0.34, Lz(z) + s * 0.36), '#4a4d50']);
    }
  },
};

/** the Great Hall, its wings, entrance terrace and garden */
export const greatHallSite = createSite('greathall', [hall]);
