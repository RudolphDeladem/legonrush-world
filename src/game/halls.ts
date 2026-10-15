// The four Diaspora halls (Dr. Hilla Limann, Alexander Kwapong, Elizabeth Frances Sey and
// Jean Nelson Aka): one design, built in facing pairs, modelled from the owner's photos; since the owner's Diaspora
// halls brief (2026-10-15) each keeps its own roof colour, entrance window and courtyard (LOOKS).
//
// Each hall is a four-storey quadrangle of white rendered rooms round a courtyard, under a
// terracotta hipped roof (hips at the outer corners, valleys at the inner ones). In the middle of
// both long facades stands the entrance pavilion: it steps forward from the facade, carries a
// front-facing gable, a tall round-headed window over the top two floors and a columned porch
// with glass doors. The front entrance faces the partner hall across their car parks; the back
// entrance (same pavilion) faces away and has no car park. Stair towers break the eaves with
// black water tanks on top. The courtyard holds a teal volleyball court and a green basketball
// court either side of a round fountain plaza on the portal-to-portal axis.
//
// The footprint (OSM, confirmed by Google Open Buildings) places and sizes each hall; the
// generic footprint builder skips these four. Courtyard and porches are kept clear of props.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BRONZE, DARK, Facade, PAVE, PLINTH, Roof, SOFFIT, TANK, TRIM, WHITE, box, canvas, flat, flipWinding, merge, rnd, signTexture, speckle, type Part } from './modelkit';
import { BUILDINGS, type Building } from './campusmap';
import { buildingMaterials } from './facades';
import { groundShade, weathering } from './shading';
import { pavers } from './upsa';

/** each hall and the hall its front entrance faces */
const PAIRS: Record<string, string> = {
  'Dr. Hilla Limann Hall': 'Alexander Kwapong Hall',
  'Alexander Kwapong Hall': 'Dr. Hilla Limann Hall',
  'Elizabeth Frances Sey Hall': 'Jean Nelson Aka Hall',
  'Jean Nelson Aka Hall': 'Elizabeth Frances Sey Hall',
};
const SIGN: Record<string, string> = {
  'Dr. Hilla Limann Hall': 'DR. HILLA LIMANN HALL',
  'Alexander Kwapong Hall': 'ALEXANDER KWAPONG HALL',
  'Elizabeth Frances Sey Hall': 'ELIZABETH FRANCES SEY HALL',
  'Jean Nelson Aka Hall': 'JEAN NELSON AKA HALL',
};
export const isDiasporaHall = (b: Building) => !!b.name && b.name in PAIRS;

/**
 * What tells the four halls apart (the owner's Diaspora halls brief, 2026-10-15: MAP-01 to MAP-05 satellites, REF-01 to
 * REF-17 photos; docs/diaspora-halls/). Courtyard features are placed in metres from the courtyard's middle: u toward
 * the hall's north end (the Jubilee Link end), v toward its front (the partner hall); every place is read from the
 * satellites, so it is an estimate to about 3 m.
 *  - roof: the satellite's roof colour (Elizabeth Sey's is dark brown, the others terracotta);
 *  - glazing: the entrance tower's window, a round-headed arch (Jean Nelson, REF-12/13/14/17; kept on Kwapong and Limann,
 *    which no photo shows) or a tall rectangular grid (Elizabeth Sey, REF-09);
 *  - court: the courtyard's plazas, courts, lawns, pavilions and trees as MAP-03/MAP-04 show them.
 */
type Feature =
  | { k: 'lawn' | 'plaza' | 'slab'; u0: number; u1: number; v0: number; v1: number }
  | { k: 'basket' | 'blue' | 'tennis'; u: number; v: number }
  | { k: 'fountain' | 'gazebo'; u: number; v: number }
  | { k: 'hut'; u: number; v: number; w: number; d: number }
  | { k: 'trees'; pts: [number, number, number][] };
interface Look { roof: string; glazing: 'arch' | 'grid'; court: Feature[]; /** a paved walk across the car parks to the partner's door, through the gap between the bays (MAP-04) */ walk?: boolean }
const LOOKS: Record<string, Look> = {
  // MAP-04: the blue court with two white circles in the north half, a small red-roofed pavilion at the north end on the
  // front side, trees and lawn in the middle, the plain concrete court in the south half
  'Alexander Kwapong Hall': { roof: '#b4573b', glazing: 'arch', walk: true, court: [
    { k: 'lawn', u0: -63.7, u1: -50, v0: -20, v1: 20 }, { k: 'lawn', u0: -22, u1: 22, v0: -20, v1: -4 }, { k: 'lawn', u0: -22, u1: 22, v0: 4, v1: 20 },
    { k: 'blue', u: 37, v: -3 }, { k: 'gazebo', u: 56, v: 15 }, { k: 'slab', u0: -46, u1: -26, v0: -16, v1: 6 },
    { k: 'trees', pts: [[-12, 12, 3.2], [-4, 15, 2.8], [8, 11, 3.4], [15, 15, 2.6], [-14, -11, 3], [2, -13, 3.4], [13, -10, 2.8], [-56, 12, 3], [-58, -10, 2.8], [52, -15, 2.6]] },
  ] },
  // MAP-04 and REF-01: the teal basketball court with red keys in the north half and its tiled gazebo, the small round
  // fountain in the middle, the pale square court on the back side, lawns and trees toward the south end
  'Dr. Hilla Limann Hall': { roof: '#bb5c3d', glazing: 'arch', walk: true, court: [
    { k: 'lawn', u0: -63.7, u1: -24, v0: 4, v1: 20 }, { k: 'lawn', u0: -63.7, u1: -30, v0: -20, v1: -4 }, { k: 'lawn', u0: 12, u1: 22, v0: -20, v1: 20 },
    { k: 'basket', u: 38, v: 0 }, { k: 'gazebo', u: 56, v: 14 }, { k: 'fountain', u: 0, v: 0 }, { k: 'slab', u0: -21, u1: -7, v0: -19, v1: -5 },
    { k: 'trees', pts: [[-30, 13, 3.4], [-42, 9, 3], [-52, 15, 3.4], [-58, -12, 3], [-44, -12, 2.8], [-34, -15, 3.2], [16, 15, 2.8], [16, -15, 2.8]] },
  ] },
  // MAP-03: a large pale plaza across the north end with a small red-roofed building in its back corner, lawns and paths in
  // the middle, the pale square court on the back side toward the south, dense trees at the south end
  'Elizabeth Frances Sey Hall': { roof: '#6e4b3a', glazing: 'grid', court: [
    { k: 'plaza', u0: 34, u1: 63.7, v0: -20, v1: 20 }, { k: 'hut', u: 52, v: -15, w: 9, d: 5 },
    { k: 'lawn', u0: 4, u1: 30, v0: -20, v1: -3 }, { k: 'lawn', u0: 4, u1: 30, v0: 3, v1: 20 }, { k: 'lawn', u0: -63.7, u1: -34, v0: -20, v1: 20 },
    { k: 'slab', u0: -24, u1: -10, v0: -18, v1: -4 },
    { k: 'trees', pts: [[-40, 14, 3.6], [-48, 6, 3.2], [-55, 15, 3.8], [-58, -4, 3.4], [-46, -14, 3.6], [-38, -6, 3], [-60, -15, 3.2], [16, 13, 2.6], [22, -12, 2.6]] },
  ] },
  // MAP-03: a pale plaza at the north end, trees in the middle, the small red-and-green court in the south half on the
  // front side, trees at the south end
  'Jean Nelson Aka Hall': { roof: '#c4633c', glazing: 'arch', court: [
    { k: 'plaza', u0: 36, u1: 63.7, v0: -20, v1: 20 },
    { k: 'lawn', u0: -6, u1: 32, v0: -20, v1: -3 }, { k: 'lawn', u0: -6, u1: 32, v0: 3, v1: 20 }, { k: 'lawn', u0: -63.7, u1: -38, v0: -20, v1: 20 },
    { k: 'tennis', u: -22, v: 7 },
    { k: 'trees', pts: [[10, 13, 3.4], [20, 9, 3], [26, -12, 3.2], [8, -14, 2.8], [-46, 12, 3.4], [-54, -6, 3.6], [-44, -14, 3], [-58, 14, 3]] },
  ] },
};
const DEFAULT_LOOK: Look = LOOKS['Alexander Kwapong Hall'];

// ---------- dimensions (metres) ----------
/** plinth, storey height, storeys, top of the walls */
const PL = 0.45, ST = 3.15, FLOORS = 4;
const BAND = PL + FLOORS * ST; // 13.05: top of the last storey, then a plain eave band
const WALL = BAND + 0.45;
/** eave overhang, ridge height, window bay */
const OV = 0.9, RIDGE = 18.2, BAY = 3.6;
/** entrance pavilion: half width, how far it stands forward, gable eave half width and pitch */
const PW = 5, PP = 2.2, GW = 5.6, GP = 0.75;
const GA = WALL + GW * GP; // gable apex
/** stair towers: half width, how far they stand forward, distance from the middle as a share of the half length */
const TW = 2.25, TP = 1.2, TX = 0.53;

/** A hall's placement: centre, axes (local x along the length, local z out of the front), half sizes. */
interface Frame { name: string; cx: number; cz: number; yaw: number; ax: number; az: number; fx: number; fz: number; hx: number; hz: number; ix: number; iz: number; /** the local x sign of the north (Jubilee Link) end */ n: 1 | -1 }

function frameOf(b: Building, partner: Building | undefined): Frame {
  const P: [number, number][] = [];
  for (let i = 0; i < b.pts.length; i += 2) P.push([b.pts[i], b.pts[i + 1]]);
  const cx = P.reduce((s, p) => s + p[0], 0) / P.length, cz = P.reduce((s, p) => s + p[1], 0) / P.length;
  // the longest side gives the hall's length
  let lx = 1, lz = 0, best = 0;
  for (let i = 0; i < P.length; i++) {
    const [x0, z0] = P[i], [x1, z1] = P[(i + 1) % P.length], l = Math.hypot(x1 - x0, z1 - z0);
    if (l > best) { best = l; lx = (x1 - x0) / l; lz = (z1 - z0) / l; }
  }
  // the front faces the partner hall
  let fx = -lz, fz = lx;
  if (partner) {
    const px = (partner.minX + partner.maxX) / 2 - cx, pz = (partner.minZ + partner.maxZ) / 2 - cz;
    if (px * fx + pz * fz < 0) { fx = -fx; fz = -fz; }
  }
  // local x must be (fz, -fx) for a rotation about y that turns local +z onto the front
  const ax = fz, az = -fx;
  const ext = (pts: Float32Array, ux: number, uz: number) => {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < pts.length; i += 2) { const d = (pts[i] - cx) * ux + (pts[i + 1] - cz) * uz; lo = Math.min(lo, d); hi = Math.max(hi, d); }
    return (hi - lo) / 2;
  };
  const hole = b.holes[0];
  const hx = ext(b.pts, ax, az), hz = ext(b.pts, fx, fz);
  return { name: b.name!, cx, cz, yaw: Math.atan2(fx, fz), ax, az, fx, fz, hx, hz, ix: hole ? ext(hole, ax, az) : hx - 15, iz: hole ? ext(hole, fx, fz) : hz - 16, n: az < 0 ? 1 : -1 };
}

const FRAMES: Frame[] = BUILDINGS.filter(isDiasporaHall).map((b) => frameOf(b, BUILDINGS.find((o) => o.name === PAIRS[b.name!])));
/** where each hall stands and which way its front faces (local x along the length, z out of the front) */
export const diasporaFrames = (): readonly Readonly<Frame>[] => FRAMES;

/** into a hall's local frame */
const local = (f: Frame, x: number, z: number) => [(x - f.cx) * f.ax + (z - f.cz) * f.az, (x - f.cx) * f.fx + (z - f.cz) * f.fz];

/** Inside a Diaspora hall's courtyard, porches or stair towers: no trees, hedges, benches or people there. */
export function inDiasporaHall(x: number, z: number, pad = 0) {
  for (const f of FRAMES) {
    const [lx, lz] = local(f, x, z);
    if (Math.abs(lx) > f.hx + 8 + pad || Math.abs(lz) > f.hz + 8 + pad) continue;
    const ax = Math.abs(lx), az = Math.abs(lz);
    if (ax < f.ix + pad && az < f.iz + pad) return true; // courtyard
    if (ax < PW + 1.5 + pad && az > f.hz - 1 && az < f.hz + PP + 3.5 + pad) return true; // entrance pavilions and their steps
    if (Math.abs(ax - f.hx * TX) < TW + 1 + pad && az > f.hz - 1 && az < f.hz + TP + 1 + pad) return true; // stair towers
  }
  return false;
}

// ---------- textures ----------
/** window glass in a 256 x 256 storey cell (upper floors), and the ground floor's louvred windows */
const UP_WIN = [40, 32, 118, 122] as const, GROUND_WIN = [40, 34, 176, 176] as const;

/**
 * One window bay (3.6 m) of the facade: the top half is an upper storey (a recessed balcony
 * behind a solid white parapet, a timber-framed window at the back, white piers and a slab
 * band), the bottom half the ground storey (dark timber louvred windows).
 */
const facadeAtlas = () =>
  canvas(256, 512, (g) => {
    g.fillStyle = '#f8f6f1';
    g.fillRect(0, 0, 256, 512);
    speckle(g, 0, 0, 256, 512, 3200, ['#efece4', '#ffffff', '#e9e5dc']);
    // ---- upper storey (y 0..256) ----
    // the balcony recess between the piers, shaded under the slab above
    const rec = g.createLinearGradient(0, 0, 0, 232);
    rec.addColorStop(0, '#6e675d'); rec.addColorStop(0.12, '#a69d90'); rec.addColorStop(1, '#bdb4a6');
    g.fillStyle = rec;
    g.fillRect(20, 0, 156, 232);
    // the wall between balconies: two small square vents (REF-02, REF-15)
    g.fillStyle = '#26292d';
    for (const [vx, vy] of [[198, 62], [222, 62], [198, 104], [222, 104]] as [number, number][]) g.fillRect(vx, vy, 16, 16);
    // the window at the back of the balcony: dark charcoal frame, tinted glass, mullions and a transom
    const [wx, wy, ww, wh] = UP_WIN;
    g.fillStyle = '#2b2e33';
    g.fillRect(wx - 6, wy - 6, ww + 12, wh + 12);
    const glass = g.createLinearGradient(0, wy, 0, wy + wh);
    glass.addColorStop(0, '#5d7286'); glass.addColorStop(0.5, '#2e3c4b'); glass.addColorStop(1, '#1d2631');
    g.fillStyle = glass;
    g.fillRect(wx, wy, ww, wh);
    g.fillStyle = 'rgba(255,255,255,0.09)';
    g.beginPath(); g.moveTo(wx + 20, wy); g.lineTo(wx + 56, wy); g.lineTo(wx + 16, wy + wh); g.lineTo(wx, wy + wh); g.lineTo(wx, wy + 50); g.fill();
    g.fillStyle = '#2b2e33';
    for (const x of [wx + ww / 3, wx + (2 * ww) / 3]) g.fillRect(x - 3, wy, 6, wh);
    g.fillRect(wx, wy + 38, ww, 5);
    // solid white parapet across the balcony, lit on top, a drip shadow under its coping
    g.fillStyle = '#f5f2eb';
    g.fillRect(20, 160, 156, 72);
    speckle(g, 20, 160, 156, 72, 400, ['#ebe7de', '#ffffff']);
    g.fillStyle = '#ffffff';
    g.fillRect(16, 156, 164, 8);
    g.fillStyle = 'rgba(80,70,60,0.28)';
    g.fillRect(20, 164, 156, 3);
    // slab band at the foot of the storey, and a shadow line on the piers' inner edges
    g.fillStyle = '#f2efe8';
    g.fillRect(0, 232, 256, 24);
    g.fillStyle = '#d6cfc2';
    g.fillRect(0, 232, 256, 2);
    g.fillStyle = 'rgba(60,50,40,0.18)';
    g.fillRect(20, 0, 4, 160);
    g.fillRect(172, 0, 4, 160);
    // ---- ground storey (y 256..512) ----
    const [gx, gy, gw, gh] = GROUND_WIN;
    const y0 = 256;
    g.fillStyle = '#b3aa9c';
    g.fillRect(gx - 8, y0 + gy - 8, gw + 16, gh + 16);
    g.fillStyle = '#6b4a2f';
    g.fillRect(gx - 3, y0 + gy - 3, gw + 6, gh + 6);
    g.fillStyle = '#4a3220';
    g.fillRect(gx, y0 + gy, gw, gh);
    // louvre slats in two leaves either side of a centre post
    g.fillStyle = '#7d5a3b';
    for (let y = y0 + gy + 6; y < y0 + gy + gh - 4; y += 9) { g.fillRect(gx + 4, y, gw / 2 - 8, 3); g.fillRect(gx + gw / 2 + 4, y, gw / 2 - 8, 3); }
    g.fillStyle = '#6b4a2f';
    g.fillRect(gx + gw / 2 - 3, y0 + gy, 6, gh);
    // sill and the slab line at the top of the ground storey
    g.fillStyle = '#ffffff';
    g.fillRect(gx - 12, y0 + gy + gh + 6, gw + 24, 8);
    g.fillStyle = 'rgba(70,60,50,0.3)';
    g.fillRect(gx - 12, y0 + gy + gh + 14, gw + 24, 3);
    g.fillStyle = '#f2efe8';
    g.fillRect(0, y0, 256, 14);
  });

/** Which windows glow after dark: one 32 px cell per bay and storey, the bottom row is the ground storey. */
const LIT_BAYS = 9;
const lightsTexture = () =>
  canvas(LIT_BAYS * 32, FLOORS * 32, (g) => {
    g.fillStyle = '#000';
    g.fillRect(0, 0, LIT_BAYS * 32, FLOORS * 32);
    const k = 32 / 256;
    for (let i = 0; i < LIT_BAYS; i++) for (let r = 0; r < FLOORS; r++) {
      const u = rnd();
      if (u < 0.38) continue;
      const [x, y, w, h] = r === FLOORS - 1 ? GROUND_WIN : UP_WIN;
      g.globalAlpha = 0.6 + rnd() * 0.4;
      g.fillStyle = u < 0.86 ? ['#ffcf7d', '#ffd99a', '#ffc46a', '#ffe7b8'][(rnd() * 4) | 0] : '#cfe4ff';
      g.fillRect(i * 32 + x * k, r * 32 + y * k, w * k, h * k);
      if (rnd() < 0.4) { g.globalAlpha = 0.6; g.fillStyle = '#000'; g.fillRect(i * 32 + (x + (rnd() < 0.5 ? 0 : w / 2)) * k, r * 32 + y * k, (w / 2) * k, h * k); }
      g.globalAlpha = 1;
    }
  });

/** The courtyard from above at 8 px/m: concrete paving, planting along the walls, and the hall's own lawns, plazas, courts
 *  and walks (LOOKS); n is the local x sign of the north end. */
const PPM = 8;
function courtyardTexture(ix: number, iz: number, look: Look, n: 1 | -1) {
  const W = Math.round(2 * ix * PPM), H = Math.round(2 * iz * PPM);
  const X = (u: number) => (n * u + ix) * PPM, Y = (v: number) => (v + iz) * PPM;
  const rect = (g: CanvasRenderingContext2D, u0: number, v0: number, u1: number, v1: number) => {
    const xa = X(u0), xb = X(u1);
    g.fillRect(Math.min(xa, xb), Y(v0), Math.abs(xb - xa), (v1 - v0) * PPM);
  };
  const t = canvas(W, H, (g) => {
    // concrete paving slabs
    g.fillStyle = '#cbc4b6';
    g.fillRect(0, 0, W, H);
    speckle(g, 0, 0, W, H, W * H * 0.02, ['#c1baab', '#d6d0c3', '#bab3a5']);
    g.fillStyle = 'rgba(120,110,95,0.25)';
    for (let x = 0; x < W; x += 1.2 * PPM) g.fillRect(x, 0, 1, H);
    for (let y = 0; y < H; y += 1.2 * PPM) g.fillRect(0, y, W, 1);
    const lawn = (u0: number, v0: number, u1: number, v1: number, c: string) => {
      g.fillStyle = c; rect(g, u0, v0, u1, v1);
      const xa = Math.min(X(u0), X(u1));
      speckle(g, xa, Y(v0), Math.abs(u1 - u0) * PPM, (v1 - v0) * PPM, Math.abs(u1 - u0) * (v1 - v0) * 12, ['#264a1f', '#3f7232', '#2f5a26', '#4a7e3a']);
    };
    // planting beds along the walls
    lawn(-ix, -iz, ix, -iz + 2.5, '#2f5626'); lawn(-ix, iz - 2.5, ix, iz, '#2f5626');
    lawn(-ix, -iz, -ix + 2.5, iz, '#2f5626'); lawn(ix - 2.5, -iz, ix, iz, '#2f5626');
    const line = (u0: number, v0: number, u1: number, v1: number) => { g.beginPath(); g.moveTo(X(u0), Y(v0)); g.lineTo(X(u1), Y(v1)); g.stroke(); };
    for (const f of look.court) {
      if (f.k === 'lawn') lawn(f.u0, f.v0, f.u1, f.v1, '#3f7232');
      else if (f.k === 'plaza') { g.fillStyle = '#d9d4c9'; rect(g, f.u0, f.v0, f.u1, f.v1); g.strokeStyle = 'rgba(120,110,95,0.35)'; g.lineWidth = 1; for (let u = f.u0; u < f.u1; u += 2.4) line(u, f.v0, u, f.v1); }
      else if (f.k === 'slab') { g.fillStyle = '#d4d0c8'; rect(g, f.u0, f.v0, f.u1, f.v1); g.strokeStyle = '#eceae4'; g.lineWidth = 2; line(f.u0 + 1, f.v0 + 1, f.u1 - 1, f.v0 + 1); line(f.u0 + 1, f.v1 - 1, f.u1 - 1, f.v1 - 1); line(f.u0 + 1, f.v0 + 1, f.u0 + 1, f.v1 - 1); line(f.u1 - 1, f.v0 + 1, f.u1 - 1, f.v1 - 1); }
      else if (f.k === 'fountain') {
        g.fillStyle = '#d9d3c6'; g.beginPath(); g.arc(X(f.u), Y(f.v), 7.5 * PPM, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#a89f8f'; g.lineWidth = 3;
        for (const r of [7.4, 5.2]) { g.beginPath(); g.arc(X(f.u), Y(f.v), r * PPM, 0, Math.PI * 2); g.stroke(); }
      } else if (f.k === 'basket' || f.k === 'blue') {
        // a 28 x 15 m court: teal with red keys and circles (Limann), or blue with white circles (Kwapong)
        const [base, key] = f.k === 'basket' ? ['#3f9e86', '#c4574c'] : ['#3f7fb2', '#e9eef2'];
        g.fillStyle = '#bab2a3'; rect(g, f.u - 16, f.v - 9.5, f.u + 16, f.v + 9.5);
        g.fillStyle = base; rect(g, f.u - 14, f.v - 7.5, f.u + 14, f.v + 7.5);
        g.fillStyle = key;
        for (const s of [-1, 0, 1]) { g.beginPath(); g.arc(X(f.u + s * 9), Y(f.v), (s ? 2.6 : 1.8) * PPM, 0, Math.PI * 2); f.k === 'basket' || !s ? g.fill() : null; }
        if (f.k === 'basket') for (const s of [-1, 1]) rect(g, Math.min(f.u + s * 14, f.u + s * 8.2), f.v - 2.45, Math.max(f.u + s * 14, f.u + s * 8.2), f.v + 2.45);
        g.strokeStyle = '#f4f7f2'; g.lineWidth = 2;
        line(f.u - 14, f.v - 7.5, f.u + 14, f.v - 7.5); line(f.u - 14, f.v + 7.5, f.u + 14, f.v + 7.5); line(f.u - 14, f.v - 7.5, f.u - 14, f.v + 7.5); line(f.u + 14, f.v - 7.5, f.u + 14, f.v + 7.5);
        line(f.u, f.v - 7.5, f.u, f.v + 7.5);
        for (const s of [-1, 0, 1]) { g.beginPath(); g.arc(X(f.u + s * 9), Y(f.v), (s ? 2.6 : 1.8) * PPM, 0, Math.PI * 2); g.stroke(); }
      } else if (f.k === 'tennis') {
        // a red surround with a green 24 x 11 m playing area (MAP-03)
        g.fillStyle = '#b8574a'; rect(g, f.u - 15, f.v - 8, f.u + 15, f.v + 8);
        g.fillStyle = '#4a8f5a'; rect(g, f.u - 12, f.v - 5.5, f.u + 12, f.v + 5.5);
        g.strokeStyle = '#f4f7f2'; g.lineWidth = 2;
        line(f.u - 12, f.v - 5.5, f.u + 12, f.v - 5.5); line(f.u - 12, f.v + 5.5, f.u + 12, f.v + 5.5); line(f.u - 12, f.v - 5.5, f.u - 12, f.v + 5.5); line(f.u + 12, f.v - 5.5, f.u + 12, f.v + 5.5);
        line(f.u, f.v - 5.5, f.u, f.v + 5.5); line(f.u - 6.4, f.v, f.u + 6.4, f.v); line(f.u - 6.4, f.v - 4.1, f.u - 6.4, f.v + 4.1); line(f.u + 6.4, f.v - 4.1, f.u + 6.4, f.v + 4.1);
      }
    }
    // the portal-to-portal walk and the cross walk, a little lighter, drawn over the lawns
    g.fillStyle = '#d8d2c5';
    rect(g, -1.8, -iz, 1.8, iz);
    rect(g, -ix + 2.5, -1.5, ix - 2.5, 1.5);
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

// ---------- materials ----------
let mats: { wall: THREE.MeshStandardMaterial; plain: THREE.MeshStandardMaterial; glass: THREE.MeshStandardMaterial } | null = null;
function materials() {
  if (mats) return mats;
  const lights = lightsTexture();
  lights.channel = 1;
  lights.repeat.set(1 / LIT_BAYS, 1 / FLOORS);
  mats = {
    wall: weathering(groundShade(new THREE.MeshStandardMaterial({ map: facadeAtlas(), roughness: 0.88, side: THREE.DoubleSide, emissive: '#ffffff', emissiveMap: lights, emissiveIntensity: 0 }), 2.2, 0.3, 'wall'), 'wall', 16, 0.3),
    plain: weathering(groundShade(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }), 2.2, 0.3, 'wall'), 'wall', 16, 0.3),
    glass: new THREE.MeshStandardMaterial({ color: '#2b3a4a', roughness: 0.2, metalness: 0.35, emissive: '#ffd08a', emissiveIntensity: 0, side: THREE.DoubleSide }),
  };
  return mats;
}

/** Lit windows and lobbies after dark (called with the other night lights). */
export function setHallLights(on: boolean) {
  if (!mats) return;
  mats.wall.emissiveIntensity = on ? 1.1 : 0;
  mats.glass.emissiveIntensity = on ? 0.9 : 0;
}

// ---------- geometry ----------
/** One hall in its local frame: length along x, front facing +z, ground at y = 0. */
function hallGeometry(hx: number, hz: number, ix: number, iz: number, look: Look, n: 1 | -1) {
  const fac = new Facade();
  const plain: Part[] = [];
  const glass: THREE.BufferGeometry[] = [];
  const roof = new Roof(new THREE.Color(look.roof));
  const rx = (hx + ix) / 2, rz = (hz + iz) / 2;
  /** roof height at a distance from the outer (or inner) eave line, long wings */
  const pitch = (RIDGE - WALL) / (hz + OV - rz);
  const tx = hx * TX;

  /**
   * A facade run from A to B (local x, z), windows bay by bay; `blank` spans (metres from A)
   * are left plain (end walls, behind pavilions and towers).
   */
  const run = (ax: number, az: number, bx: number, bz: number, blank: [number, number][]) => {
    const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len;
    const cuts = [...blank].sort((p, q) => p[0] - q[0]);
    const spans: [number, number, boolean][] = [];
    let t = 0;
    for (const [s0, s1] of cuts) { if (s0 > t + 0.5) spans.push([t, s0, true]); spans.push([Math.max(t, s0), s1, false]); t = Math.max(t, s1); }
    if (len > t + 0.5) spans.push([t, len, true]); else if (spans.length) spans[spans.length - 1][1] = len;
    for (const [s0, s1, win] of spans) {
      const x0 = ax + ux * s0, z0 = az + uz * s0, x1 = ax + ux * s1, z1 = az + uz * s1;
      if (!win) {
        // plain render, standing 5 cm proud so it never fights a neighbouring window bay
        const g = new THREE.BoxGeometry(s1 - s0, BAND - PL, 0.1).rotateY(-Math.atan2(uz, ux)).translate((x0 + x1) / 2, (PL + BAND) / 2, (z0 + z1) / 2);
        plain.push([g, WHITE]);
        continue;
      }
      const bays = Math.max(1, Math.round((s1 - s0) / BAY));
      for (let k = 0; k < FLOORS; k++) {
        const y0 = PL + k * ST;
        fac.quad(x0, z0, x1, z1, y0, y0 + ST, bays, k === 0 ? 0 : 0.5, k === 0 ? 0.5 : 1, fac.bays, fac.bays + bays, k);
      }
      fac.bays += bays;
    }
    // plinth and the plain eave band, the length of the run
    const ang = -Math.atan2(uz, ux), mx = (ax + bx) / 2, mz = (az + bz) / 2;
    plain.push([new THREE.BoxGeometry(len + 0.1, PL, 0.22).rotateY(ang).translate(mx, PL / 2, mz), PLINTH]);
    plain.push([new THREE.BoxGeometry(len + 0.1, WALL - BAND, 0.14).rotateY(ang).translate(mx, (BAND + WALL) / 2, mz), WHITE]);
    plain.push([new THREE.BoxGeometry(len + 0.1, 0.16, 0.24).rotateY(ang).translate(mx, BAND, mz), TRIM]);
  };

  // outer facades: plain ends on the long sides, pavilions and stair towers in front of plain wall
  const L = 2 * hx, D = 2 * hz;
  const longBlanks: [number, number][] = [[0, 5.5], [L - 5.5, L], [hx - PW, hx + PW], [hx - tx - TW, hx - tx + TW], [hx + tx - TW, hx + tx + TW]];
  run(-hx, hz, hx, hz, longBlanks);
  run(-hx, -hz, hx, -hz, longBlanks);
  run(hx, -hz, hx, hz, [[0, 3], [D - 3, D]]);
  run(-hx, -hz, -hx, hz, [[0, 3], [D - 3, D]]);
  // courtyard facades: the towers behind the pavilions stand in front of plain wall
  run(-ix, iz, ix, iz, [[ix - TW, ix + TW]]);
  run(-ix, -iz, ix, -iz, [[ix - TW, ix + TW]]);
  run(ix, -iz, ix, iz, []);
  run(-ix, -iz, -ix, iz, []);

  // ---- main roof: hips at the outer corners, valleys round the courtyard ----
  const O = (sx: number, sz: number) => [sx * (hx + OV), WALL, sz * (hz + OV)];
  const R = (sx: number, sz: number) => [sx * rx, RIDGE, sz * rz];
  const I = (sx: number, sz: number) => [sx * (ix - OV), WALL, sz * (iz - OV)];
  for (const E of [O, I]) {
    roof.quad(E(-1, 1), E(1, 1), R(1, 1), R(-1, 1));
    roof.quad(E(1, -1), E(-1, -1), R(-1, -1), R(1, -1));
    roof.quad(E(1, 1), E(1, -1), R(1, -1), R(1, 1));
    roof.quad(E(-1, -1), E(-1, 1), R(-1, 1), R(-1, -1));
  }
  // fascia boards round both eave edges, soffits between the eave edge and the wall
  for (const [ex, ez, wx, wz] of [[hx + OV, hz + OV, hx, hz], [ix - OV, iz - OV, ix, iz]]) {
    for (const s of [-1, 1]) {
      plain.push([box(-ex, ex, WALL - 0.32, WALL + 0.04, s * ez - 0.07, s * ez + 0.07), TRIM]);
      plain.push([box(s * ex - 0.07, s * ex + 0.07, WALL - 0.32, WALL + 0.04, -ez, ez), TRIM]);
      plain.push([box(-Math.max(ex, wx), Math.max(ex, wx), WALL - 0.34, WALL - 0.3, s * wz, s * ez), SOFFIT]);
      plain.push([box(s * wx, s * ex, WALL - 0.34, WALL - 0.3, -Math.max(ez, wz), Math.max(ez, wz)), SOFFIT]);
    }
  }

  /** roof height over a point of a long wing, `d` metres in from its outer eave edge */
  const roofAt = (d: number) => WALL + Math.max(0, d) * pitch;

  // ---- entrance pavilions, front (s = 1) and back (s = -1): mirror images ----
  const porch = (s: number) => {
    const P: Part[] = [];
    const G: THREE.BufferGeometry[] = [];
    const zf = hz + PP; // pavilion face
    const zb = hz + OV - (GA - WALL) / pitch; // where the gable ridge runs into the main roof
    P.push([box(-PW, PW, 0, WALL, hz - 0.5, zf), WHITE]);
    P.push([box(-PW - 0.05, PW + 0.05, 0, PL, hz, zf + 0.05), PLINTH]);
    // pediment under the gable
    P.push([flat([[-PW, WALL], [PW, WALL], [PW, WALL + (GW - PW) * GP], [0, GA - 0.05], [-PW, WALL + (GW - PW) * GP]], zf), WHITE]);
    // gable roof (mirrored by hand: roof quads are not in P), rake boards and a cornice at the eave
    const zo = zf + 0.5;
    const q = (x: number, y: number, z: number) => [x, y, s * z];
    if (s > 0) {
      roof.quad(q(-GW, WALL, zo), q(-GW, WALL, zb), q(0, GA, zb), q(0, GA, zo));
      roof.quad(q(GW, WALL, zb), q(GW, WALL, zo), q(0, GA, zo), q(0, GA, zb));
    } else {
      roof.quad(q(-GW, WALL, zb), q(-GW, WALL, zo), q(0, GA, zo), q(0, GA, zb));
      roof.quad(q(GW, WALL, zo), q(GW, WALL, zb), q(0, GA, zb), q(0, GA, zo));
    }
    const rake = Math.hypot(GW, GA - WALL), ang = Math.atan2(GA - WALL, GW);
    for (const sx of [-1, 1]) P.push([new THREE.BoxGeometry(rake, 0.32, 0.1).translate(0, -0.12, 0).rotateZ(-sx * ang).translate((sx * GW) / 2, (WALL + GA) / 2, zo + 0.02), TRIM]);
    P.push([box(-PW - 0.12, PW + 0.12, WALL - 0.3, WALL, zf, zf + 0.14), TRIM]);
    // string course over the porch
    P.push([box(-PW - 0.06, PW + 0.06, 5.55, 5.8, zf, zf + 0.12), '#ebe5d9']);
    // porch: platform and steps, four slim columns, a flat canopy, glass doors behind
    P.push([box(-4.2, 4.2, 0, PL, zf, zf + 1.8), PAVE]);
    P.push([box(-3.2, 3.2, 0, 0.3, zf + 1.8, zf + 2.2), PAVE]);
    P.push([box(-3.2, 3.2, 0, 0.15, zf + 2.2, zf + 2.6), PAVE]);
    for (const x of [-3.6, -1.25, 1.25, 3.6]) {
      P.push([new THREE.CylinderGeometry(0.17, 0.19, 4.6, 10).translate(x, PL + 2.3, zf + 1.45), WHITE]);
      P.push([box(x - 0.26, x + 0.26, PL, PL + 0.25, zf + 1.19, zf + 1.71), TRIM]);
    }
    P.push([box(-4.0, 4.0, 5.05, 5.45, zf, zf + 1.75), TRIM]);
    G.push(box(-3.0, 3.0, PL, 4.8, zf, zf + 0.04));
    for (const x of [-3.05, -1.5, 0, 1.5, 3.05]) P.push([box(x - 0.06, x + 0.06, PL, 4.8, zf, zf + 0.08), BRONZE]);
    P.push([box(-3.05, 3.05, 3.3, 3.42, zf, zf + 0.08), BRONZE]);
    P.push([box(-3.15, 3.15, 4.8, 5.05, zf, zf + 0.1), BRONZE]);
    if (look.glazing === 'grid') {
      // Elizabeth Sey (REF-09): a tall rectangular window of dark glass in a grid of dark frames over the upper floors
      const y0 = 6.3, y1 = 12.4, w = 2.1;
      G.push(box(-w, w, y0, y1, zf, zf + 0.03));
      P.push([box(-w - 0.3, w + 0.3, y0 - 0.3, y1 + 0.3, zf, zf + 0.02), '#ece6da']);
      P.push([box(-w - 0.5, w + 0.5, y0 - 0.5, y0 - 0.3, zf, zf + 0.2), TRIM]);
      for (const x of [-w, -w / 3, w / 3, w]) P.push([box(x - 0.06, x + 0.06, y0, y1, zf + 0.03, zf + 0.1), '#2b2e33']);
      for (const y of [y0, 8.35, 10.4, y1]) P.push([box(-w, w, y - 0.06, y + 0.06, zf + 0.03, zf + 0.1), '#2b2e33']);
    } else {
      // the tall round-headed window over the top two floors
      const r = 1.9, y0 = 6.3, yc = 10.6;
      const archPts = (rr: number, lo: number): [number, number][] => {
        const pts: [number, number][] = [[-rr, lo], [rr, lo]];
        for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI; pts.push([Math.cos(a) * rr, yc + Math.sin(a) * rr]); }
        return pts;
      };
      G.push(flat(archPts(r, y0), zf + 0.03));
      const frame = new THREE.Shape(archPts(r + 0.32, y0 - 0.32).map(([x, y]) => new THREE.Vector2(x, y)));
      frame.holes.push(new THREE.Path(archPts(r, y0).map(([x, y]) => new THREE.Vector2(x, y)).reverse()));
      P.push([new THREE.ShapeGeometry(frame).translate(0, 0, zf + 0.05), '#ece6da']);
      P.push([box(-r - 0.5, r + 0.5, y0 - 0.5, y0 - 0.3, zf, zf + 0.2), TRIM]); // sill
      P.push([box(-0.06, 0.06, y0, yc + r, zf + 0.03, zf + 0.1), BRONZE]);
      for (const x of [-0.95, 0.95]) P.push([box(x - 0.05, x + 0.05, y0, yc + Math.sqrt(r * r - x * x), zf + 0.03, zf + 0.09), BRONZE]);
      for (const y of [7.75, 9.2, yc]) P.push([box(-r, r, y - 0.05, y + 0.05, zf + 0.03, zf + 0.09), BRONZE]);
      for (const a of [Math.PI / 4, (3 * Math.PI) / 4]) P.push([new THREE.BoxGeometry(r, 0.08, 0.06).translate(r / 2, 0, 0).rotateZ(a).translate(0, yc, zf + 0.06), BRONZE]);
    }
    // small windows either side of the arch on the upper floors
    for (const x of [-3.7, 3.7]) for (let k = 2; k < FLOORS; k++) {
      const y = PL + k * ST + 0.9;
      G.push(box(x - 0.5, x + 0.5, y, y + 1.4, zf, zf + 0.03));
      P.push([box(x - 0.62, x + 0.62, y - 0.12, y, zf, zf + 0.12), TRIM]);
    }
    if (s < 0) {
      const flip = new THREE.Matrix4().makeScale(1, 1, -1);
      for (const [g] of P) { g.applyMatrix4(flip); flipWinding(g); }
      for (const g of G) { g.applyMatrix4(flip); flipWinding(g); }
    }
    plain.push(...P);
    glass.push(...G);
  };
  porch(1);
  porch(-1);

  // ---- stair towers: white shafts with open stair glazing that break the eaves, water tanks on top ----
  const tower = (xc: number, zw: number, out: number, roofTop: number, door: boolean) => {
    // zw: wall line, out: +1 or -1 (which way the tower faces)
    const zf = zw + out * TP, zbk = zw - out * 3;
    const top = roofTop + 0.9;
    plain.push([box(xc - TW, xc + TW, 0, top, Math.min(zf, zbk), Math.max(zf, zbk)), WHITE]);
    plain.push([box(xc - TW - 0.12, xc + TW + 0.12, top - 0.25, top + 0.08, Math.min(zf, zbk) - 0.12, Math.max(zf, zbk) + 0.12), TRIM]);
    plain.push([box(xc - TW - 0.05, xc + TW + 0.05, 0, PL, Math.min(zf, zf - out * 0.1), Math.max(zf, zf + out * 0.05)), PLINTH]);
    // the stairwell: a dark slot with landing slabs every half storey
    const zs = zf + out * 0.02;
    plain.push([box(xc - 1.25, xc + 1.25, door ? PL + 2.9 : 1.2, BAND - 0.3, Math.min(zs, zs + out * 0.04), Math.max(zs, zs + out * 0.04)), DARK]);
    for (let y = PL + ST / 2; y < BAND - 0.4; y += ST / 2) plain.push([box(xc - 1.3, xc + 1.3, y - 0.11, y + 0.11, Math.min(zs, zs + out * 0.1), Math.max(zs, zs + out * 0.1)), WHITE]);
    if (door) glass.push(box(xc - 1.1, xc + 1.1, PL, PL + 2.6, Math.min(zs, zs + out * 0.03), Math.max(zs, zs + out * 0.03)));
    // two black polytanks on the flat top
    for (const dx of [-0.95, 0.95]) {
      plain.push([new THREE.CylinderGeometry(0.72, 0.72, 1.35, 14).translate(xc + dx, top + 0.08 + 0.68, (zf + zbk) / 2), TANK]);
      plain.push([new THREE.SphereGeometry(0.72, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.3, 1).translate(xc + dx, top + 0.08 + 1.35, (zf + zbk) / 2), TANK]);
    }
  };
  const outerTop = roofAt(OV + 3);
  for (const s of [-1, 1]) for (const sx of [-1, 1]) tower(sx * tx, s * hz, s, outerTop, false);
  // behind each pavilion, on the courtyard side
  for (const s of [-1, 1]) tower(0, s * iz, -s, outerTop, true);
  // rooftop tank stands on the side wings, near the corners of the courtyard
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * rx, z = sz * (iz - 4);
    plain.push([box(x - 1.7, x + 1.7, RIDGE - 1.8, RIDGE + 0.9, z - 1.7, z + 1.7), WHITE]);
    plain.push([box(x - 1.82, x + 1.82, RIDGE + 0.7, RIDGE + 0.98, z - 1.82, z + 1.82), TRIM]);
    plain.push([new THREE.CylinderGeometry(0.75, 0.75, 1.4, 14).translate(x, RIDGE + 1.68, z), TANK]);
  }
  // open stairwells on the courtyard faces of the long wings
  for (const s of [-1, 1]) for (const sx of [-1, 1]) {
    const x = sx * (ix - 6), z = s * iz - s * 0.03;
    plain.push([box(x - 1.2, x + 1.2, PL + 2.9, BAND - 0.3, Math.min(z, z - s * 0.06), Math.max(z, z - s * 0.06)), DARK]);
    for (let y = PL + ST / 2; y < BAND - 0.4; y += ST / 2) plain.push([box(x - 1.25, x + 1.25, y - 0.11, y + 0.11, Math.min(z, z - s * 0.12), Math.max(z, z - s * 0.12)), WHITE]);
    glass.push(box(x - 1.0, x + 1.0, PL, PL + 2.6, Math.min(z, z - s * 0.05), Math.max(z, z - s * 0.05)));
  }

  // ---- courtyard: the hall's own fountain, hoops, nets, pavilions and trees (LOOKS) ----
  const NU = (u: number) => n * u;
  const tree = (x: number, z: number, r: number) => {
    plain.push([new THREE.CylinderGeometry(0.18, 0.26, 2.6, 7).translate(x, 1.3, z), '#5b4330']);
    plain.push([new THREE.IcosahedronGeometry(r, 1).scale(1, 0.82, 1).translate(x, 2.4 + r * 0.7, z), r > 3.1 ? '#2f5d27' : '#3d7030']);
  };
  for (const f of look.court) {
    if (f.k === 'fountain') {
      const x = NU(f.u), z = f.v;
      plain.push([new THREE.CylinderGeometry(3.1, 3.2, 0.6, 28).translate(x, 0.3, z), '#e9e4da']);
      plain.push([new THREE.CylinderGeometry(2.8, 2.8, 0.05, 28).translate(x, 0.52, z), '#4f8fbf']);
      plain.push([new THREE.CylinderGeometry(0.7, 0.9, 1.3, 16).translate(x, 1.1, z), '#e9e4da']);
      plain.push([new THREE.CylinderGeometry(1.4, 0.5, 0.35, 18).translate(x, 1.9, z), '#e9e4da']);
      plain.push([new THREE.SphereGeometry(0.42, 12, 8).translate(x, 2.35, z), '#c9c2b4']);
    } else if (f.k === 'basket' || f.k === 'blue') {
      // hoops at both ends of the court
      for (const s of [-1, 1]) {
        const x = NU(f.u + s * 15.2), hoopX = NU(f.u + s * 12.4), d = Math.sign(x - hoopX);
        plain.push([new THREE.CylinderGeometry(0.1, 0.1, 3.3, 8).translate(x, 1.65, f.v), '#3a3e45']);
        plain.push([box(Math.min(x, hoopX + d * 1.2), Math.max(x, hoopX + d * 1.2), 3.2, 3.3, f.v - 0.06, f.v + 0.06), '#3a3e45']);
        plain.push([box(Math.min(hoopX + d * 1.15, hoopX + d * 1.2), Math.max(hoopX + d * 1.15, hoopX + d * 1.2), 2.9, 3.95, f.v - 0.9, f.v + 0.9), '#f4f4f2']);
        plain.push([new THREE.TorusGeometry(0.23, 0.025, 6, 16).rotateX(Math.PI / 2).translate(hoopX + d * 0.85, 3.05, f.v), '#e0602a']);
      }
    } else if (f.k === 'tennis') {
      for (const s of [-1, 1]) plain.push([new THREE.CylinderGeometry(0.05, 0.05, 1.07, 8).translate(NU(f.u), 0.53, f.v + s * 6.2), '#3a3e45']);
      plain.push([box(NU(f.u) - 0.02, NU(f.u) + 0.02, 0.15, 0.95, f.v - 6.2, f.v + 6.2), '#22252a']);
    } else if (f.k === 'gazebo') {
      // a round open pavilion under an eight-sided tiled roof on white posts (REF-01, the red spot of MAP-04)
      const x = NU(f.u), z = f.v;
      plain.push([new THREE.CylinderGeometry(3.2, 3.3, 0.3, 16).translate(x, 0.15, z), '#d9d3c6']);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; plain.push([new THREE.CylinderGeometry(0.13, 0.13, 2.5, 8).translate(x + Math.cos(a) * 2.8, 1.55, z + Math.sin(a) * 2.8), WHITE]); }
      plain.push([new THREE.CylinderGeometry(2.85, 2.85, 0.9, 16, 1, true).translate(x, 0.75, z), '#efe9dc']);
      plain.push([new THREE.ConeGeometry(4.1, 2.4, 8).translate(x, 4.0, z), '#c25b33']);
    } else if (f.k === 'hut') {
      // the small one-storey building in the plaza's corner, under a red roof (MAP-03)
      const x = NU(f.u), z = f.v, w = f.w / 2, d = f.d / 2;
      plain.push([box(x - w, x + w, 0, 3.2, z - d, z + d), WHITE]);
      plain.push([box(x - w - 0.4, x + w + 0.4, 3.2, 3.45, z - d - 0.4, z + d + 0.4), '#b5452f']);
      plain.push([box(x - 0.6, x + 0.6, 0.1, 2.3, z + d, z + d + 0.05), DARK]);
    } else if (f.k === 'trees') for (const [u, v, r] of f.pts) tree(NU(u), v, r);
  }
  // ---- at the front: clipped shrub beds along the facade either side of the pavilion (REF-09, REF-12); on Kwapong and
  // Limann, palms in kerbed planters along the walk across the car parks (MAP-04, REF-12, REF-17) ----
  for (const sx of [-1, 1]) {
    const x0 = sx * (PW + 1.5), x1 = sx * (PW + 13);
    plain.push([box(Math.min(x0, x1), Math.max(x0, x1), 0, 0.18, hz + 0.1, hz + 1.1), '#e6e3dc']);
    for (let x = Math.min(x0, x1) + 0.6; x < Math.max(x0, x1) - 0.4; x += 1.2) plain.push([new THREE.IcosahedronGeometry(0.55, 0).scale(1, 0.75, 1).translate(x, 0.55, hz + 0.6), '#3c6a2e']);
  }
  if (look.walk) for (let z = hz + PP + 7; z < hz + 24; z += 6) for (const sx of [-1, 1]) {
    const x = sx * 3.6;
    plain.push([box(x - 0.6, x + 0.6, 0, 0.2, z - 0.6, z + 0.6), '#e6e3dc'], [box(x - 0.48, x + 0.48, 0.2, 0.24, z - 0.48, z + 0.48), '#5b4632']);
    plain.push([new THREE.CylinderGeometry(0.16, 0.24, 5.5, 7).translate(x, 2.75, z), '#8a7a62']);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      plain.push([new THREE.BoxGeometry(2.4, 0.05, 0.45).translate(1.1, 0, 0).rotateZ(-0.45).rotateY(a).translate(x, 5.5, z), '#4c7f32']);
    }
  }
  return { fac, plain, glass, roof };
}

/** Every Diaspora hall, placed on its footprint; meshes listed in userData.cullMeshes for fog culling. */
export function buildDiasporaHalls() {
  const group = new THREE.Group();
  group.name = 'diaspora-halls';
  const { wall, plain, glass } = materials();
  const roofMat = buildingMaterials().roof;
  const cull: THREE.Mesh[] = [];
  const cache = new Map<string, { hz: number; walls: THREE.BufferGeometry; plain: THREE.BufferGeometry; glass: THREE.BufferGeometry; roof: THREE.BufferGeometry; court: THREE.Texture }>();
  for (const f of FRAMES) {
    // (each hall now has its own roof colour, entrance window and courtyard: one geometry per hall)
    const key = f.name;
    let geo = cache.get(key);
    if (!geo) {
      const look = LOOKS[f.name] ?? DEFAULT_LOOK;
      const h = hallGeometry(f.hx, f.hz, f.ix, f.iz, look, f.n);
      geo = { hz: f.hz, walls: h.fac.geometry(), plain: merge(h.plain), glass: mergeGeometries(h.glass.map((g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal') n.deleteAttribute(k); return n; })), roof: h.roof.geometry(), court: courtyardTexture(f.ix, f.iz, look, f.n) };
      cache.set(key, geo);
    }
    const hall = new THREE.Group();
    hall.name = f.name;
    hall.position.set(f.cx, 0, f.cz);
    hall.rotation.y = f.yaw;
    const add = (g: THREE.BufferGeometry, m: THREE.Material, cast = true) => {
      const mesh = new THREE.Mesh(g, m);
      mesh.castShadow = cast;
      mesh.receiveShadow = true;
      hall.add(mesh);
      cull.push(mesh);
      return mesh;
    };
    add(geo.walls, wall);
    add(geo.plain, plain);
    add(geo.glass, glass, false);
    add(geo.roof, roofMat);
    // red-brown pavers at both entrances (the apron under the steps) and, on Kwapong and Limann, the walk across the car
    // parks to the partner hall's door (the Diaspora brief: paved forecourts, not lawn, before the entrances)
    const pv = pavers('redbrown');
    const apron = (z0: number, z1: number, w: number) => {
      const g = new THREE.PlaneGeometry(2 * w, z1 - z0).rotateX(-Math.PI / 2).translate(0, 0.035, (z0 + z1) / 2);
      const pa = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < pa.count; i++) uv.setXY(i, pa.getX(i) / 2, pa.getZ(i) / 2);
      add(g, pv, false);
    };
    apron(f.hz, f.hz + PP + 4.5, 7.5); apron(-(f.hz + PP + 4.5), -f.hz, 7.5);
    if ((LOOKS[f.name] ?? DEFAULT_LOOK).walk) apron(f.hz + PP + 4.5, f.hz + 24, 2.4);
    const courtMat = new THREE.MeshStandardMaterial({ map: geo.court, roughness: 0.92, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    add(new THREE.PlaneGeometry(2 * f.ix, 2 * f.iz).rotateX(-Math.PI / 2).translate(0, 0.05, 0), courtMat, false);
    // the hall's name on both porch canopies
    const { tex, aspect } = signTexture(SIGN[f.name] ?? f.name.toUpperCase());
    const signMat = new THREE.MeshBasicMaterial({ map: tex });
    const w = Math.min(7.6, 0.34 * aspect), h = w / aspect;
    for (const sd of [1, -1]) {
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(w, h), signMat);
      sign.name = 'hall-sign';
      sign.position.set(0, 5.25, sd * (geo.hz + PP + 1.76));
      sign.rotation.y = sd > 0 ? 0 : Math.PI;
      hall.add(sign);
    }
    group.add(hall);
  }
  group.updateMatrixWorld(true);
  group.userData.cullMeshes = cull;
  return group;
}
