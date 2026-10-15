// The Diamond Jubilee Hall behind Jean Nelson Aka Hall, from the owner's Diamond Jubilee hostel brief
// (docs/diamond-jubilee/ledger.md; numbers in djplan.ts). In place of the generic two-storey block on the map outline:
// - four occupied levels (ground plus three) on every wing, round two open courts divided by the cross-connection;
// - warm white walls over a light beige base band; varied openings: broad louvred windows, narrow slits, short high
//   slots and solid piers (P01-P06), regular louvred bays on the courts' end walls (P01);
// - the four corner stair towers (M01's tank groups): a pale frame, close dark vertical fins with the flights and
//   landings seen behind them, a solid pale base, black tanks on top; open landings on the rest of the outer face; the
//   named tower (P03, R01-R06) carries DIAMOND / JUBILEE HALL and the 75 emblem on its pale strip;
// - the one entrance feature on the front (R09-R12): dark blue-grey glazing in a grey, charcoal and light panel border,
//   a thin flat canopy over the doors;
// - a low muted red-brown roof with thin fascias, hipped at the wing ends, the courts left open;
// - the courts: stacked corner landings, low concrete-edged beds and paver paths (P01, M01 3);
// - the frontage: interlocking pavers, kerbed lawn islands, the planted strip, the drain and verge, slim lights, the red
//   hydrant-like post; the rear: red earth, rough grass and scrub; the pale slab west and the detached small red-roof
//   building with its tank group (M01 6, 7). Unseen rooms, exact dimensions and hidden faces are provisional.
import * as THREE from 'three';
import { createSite, gableZ, render, tanks, type Block, type Kit, type Spec, type Style, type Rect } from './blocks';
import { box, canvas, speckle, type Part } from './modelkit';
import { flatMat, lawnMat, plane, rect } from './medkit';
import { coverOverlay, crownTiles, hash2, vnoise2, type Crown } from './scrubkit';
import { COURTS, DJ_AX, DJ_O, BED, DRAIN, EARTH, ENTRANCE, FORECOURT, HYDRANT, ISLANDS, LIGHTS, NORTH_APRON, PAD, PAD_SHED, SCRUB, SHED7, TANKS7, TOWERS, VERGE, WINGS, djLocal, djWorld, type P2, type R4 } from './djplan';

const ST = 3.1, FLOORS = 4;
/** the eave (blocks.ts wallTop: plinth, four storeys, band) and the stair towers' parapet top */
const EAVE = 0.4 + FLOORS * ST + 0.4, TOWER_TOP = EAVE + 2.8;
const WALL = '#f3f0e8', BASE = '#dcc6ab', FIN = '#1e2225', PALE = '#efece4', CLAD = '#5d6266', ROOF = '#7f4a3b';

// ---------- the facade styles (canvas 256 x 512: an upper storey over the ground storey; 3.1 m a storey) ----------
const VY = 256 / ST;
const wall = (g: CanvasRenderingContext2D) => {
  render(g, WALL);
  // the light beige base band of the ground storey (P01, P02: to about the ground-floor sills)
  g.fillStyle = BASE; g.fillRect(0, 512 - 0.95 * VY, 256, 0.95 * VY);
  g.fillStyle = '#cdb497'; g.fillRect(0, 512 - 0.95 * VY, 256, 2);
  speckle(g, 0, 512 - 0.95 * VY, 256, 0.95 * VY, 500, ['#d6bea2', '#e0ccb3']);
};
/** a louvred window: a light frame, dark blue-grey glass louvre blades, a centre mullion on the broad ones */
const louvres = (g: CanvasRenderingContext2D, [x, y, w, h]: Rect) => {
  for (const oy of [0, 256]) {
    g.fillStyle = 'rgba(80,72,64,0.25)'; g.fillRect(x - 4, y + oy - 3, w + 8, h + 7);
    g.fillStyle = '#d8dad7'; g.fillRect(x - 3, y + oy - 3, w + 6, h + 6);
    g.fillStyle = '#46515b'; g.fillRect(x, y + oy, w, h);
    for (let t = y + oy + 3; t < y + oy + h - 2; t += 7) { g.fillStyle = '#7b8791'; g.fillRect(x, t, w, 2); }
    if (w > 50) { g.fillStyle = '#d8dad7'; g.fillRect(x + w / 2 - 2, y + oy, 4, h); }
  }
};
const style = (bay: number, wins: Rect[]): Style => ({ bay, up: wins, ground: wins, draw: (g) => { wall(g); for (const r of wins) louvres(g, r); } });
const hx = (bay: number, m: number) => (m * 256) / bay;
const win = (bay: number, x0: number, x1: number, sill: number, head: number): Rect => [hx(bay, x0), 256 - head * VY, hx(bay, x1 - x0), (head - sill) * VY];
/** the room wings' outer and court faces: a broad louvred window, a narrow slit, a solid pier, a short high slot */
const ROOM = style(6, [win(6, 0.5, 2.0, 0.95, 2.3), win(6, 2.5, 2.95, 0.95, 2.3), win(6, 4.2, 5.2, 1.85, 2.3)]);
/** the courts' end walls (P01 1): regular broad louvred bays */
const COURT = style(3.2, [win(3.2, 0.9, 2.3, 0.95, 2.3)]);
/** the wing ends: mostly solid, one narrow slit a bay */
const END = style(5, [win(5, 2.2, 2.8, 0.95, 2.3)]);
const SHED: Style = { bay: 4, up: [], ground: [], draw: (g) => { render(g, '#e6e0d3'); } };

// ---------- helpers in the model frame ----------
type Face = { a: P2; b: P2; n: P2 };
/** the four faces of a rectangle: x0 (n -x), x1 (n +x), z0 (n -z), z1 (n +z); each runs from a to b */
const faces = ([x0, x1, z0, z1]: R4): Record<'x0' | 'x1' | 'z0' | 'z1', Face> => ({
  x0: { a: [x0, z0], b: [x0, z1], n: [-1, 0] }, x1: { a: [x1, z0], b: [x1, z1], n: [1, 0] },
  z0: { a: [x0, z0], b: [x1, z0], n: [0, -1] }, z1: { a: [x0, z1], b: [x1, z1], n: [0, 1] },
});
const flen = (f: Face) => Math.hypot(f.b[0] - f.a[0], f.b[1] - f.a[1]);
const at = (f: Face, s: number, o: number): P2 => { const l = flen(f); return [f.a[0] + ((f.b[0] - f.a[0]) * s) / l + f.n[0] * o, f.a[1] + ((f.b[1] - f.a[1]) * s) / l + f.n[1] * o]; };
/** an axis-aligned box between two corner points of the plan */
const ob = (p: P2, q: P2, y0: number, y1: number) => box(Math.min(p[0], q[0]), Math.max(p[0], q[0]) + 1e-3, y0, y1, Math.min(p[1], q[1]), Math.max(p[1], q[1]) + 1e-3);
/** a slab tilted along a face from (s0, y0) to (s1, y1), depth o0..o1 behind the face */
function flight(c: Part[], f: Face, s0: number, s1: number, y0: number, y1: number, o0: number, o1: number) {
  const l = Math.hypot(s1 - s0, y1 - y0), ang = Math.atan2(y1 - y0, s1 - s0), [mx, mz] = at(f, (s0 + s1) / 2, (o0 + o1) / 2);
  const along = Math.atan2(f.b[1] - f.a[1], f.b[0] - f.a[0]);
  c.push([new THREE.BoxGeometry(l, 0.16, Math.abs(o1 - o0)).rotateZ(ang).rotateY(-along).translate(mx, (y0 + y1) / 2, mz), '#cfcdc6']);
}
/** a canvas picture on a face (outward), s0..s1 along it, y0..y1, `o` off the face */
function picture(k: Kit, f: Face, s0: number, s1: number, y0: number, y1: number, o: number, draw: (g: CanvasRenderingContext2D) => void, w: number, h: number) {
  const map = canvas(w, h, draw);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(s1 - s0, y1 - y0), new THREE.MeshStandardMaterial({ map, roughness: 0.7 }));
  const [x, z] = at(f, (s0 + s1) / 2, o);
  m.position.set(x, (y0 + y1) / 2, z);
  m.rotation.y = Math.atan2(f.n[0], f.n[1]);
  m.castShadow = false; m.receiveShadow = true;
  k.meshes.push(m);
}

// ---------- the stair towers ----------
/** the named strip (R05, R06): DIAMOND reading down, JUBILEE HALL, the 75 emblem; navy on pale */
function nameStrip(g: CanvasRenderingContext2D) {
  g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, 128, 1024);
  g.fillStyle = '#1d2a44';
  g.save(); g.translate(64, 40); g.rotate(Math.PI / 2); g.font = 'bold 74px Georgia, serif'; g.textBaseline = 'middle'; g.fillText('DIAMOND', 0, 0); g.restore();
  g.font = 'bold 20px Georgia, serif'; g.textAlign = 'center'; g.fillText('JUBILEE', 64, 470); g.fillText('HALL', 64, 494);
  g.lineWidth = 6; g.strokeStyle = '#1d2a44'; g.beginPath(); g.arc(64, 600, 44, 0, Math.PI * 2); g.stroke();
  g.font = 'bold 54px Georgia, serif'; g.textBaseline = 'middle'; g.fillText('75', 64, 602);
  g.font = 'bold 13px Georgia, serif'; g.fillText('YEARS', 64, 662);
}
function tower(k: Kit, c: Part[], t: (typeof TOWERS)[number]) {
  const F = faces(t.r), [x0, x1, z0, z1] = t.r, T = TOWER_TOP, B = 3.4;
  // the solid pale base, its beige band; the dark shaft behind the screens; the roof slab
  c.push([box(x0, x1, 0, B, z0, z1), PALE], [box(x0 - 0.04, x1 + 0.04, 0, 0.95, z0 - 0.04, z1 + 0.04), BASE]);
  c.push([box(x0 + 1.1, x1 - 1.1, B, T - 0.6, z0 + 1.1, z1 - 1.1), '#666a6e'], [box(x0 + 0.2, x1 - 0.2, T - 0.9, T - 0.7, z0 + 0.2, z1 - 0.2), '#c9c4ba']);
  // the frame: corner piers and the parapet band
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]] as P2[]) c.push([box(x - 0.25 + (x === x0 ? 0.25 : -0.25), x + 0.25 + (x === x0 ? 0.25 : -0.25), 0, T, z - 0.25 + (z === z0 ? 0.25 : -0.25), z + 0.25 + (z === z0 ? 0.25 : -0.25)), PALE]);
  for (const f of Object.values(F)) c.push([ob(at(f, 0, 0), at(f, flen(f), -0.3), T - 1.0, T), PALE]);
  const end = F[t.end], side = F[t.side], sl = flen(side);
  // the screened part of the long face starts at the end face's corner
  const fromEnd = (t.end === 'x0') === (side.a[0] === x0), sScreen: P2 = fromEnd ? [0, sl * 0.68] : [sl * 0.32, sl], sRest: P2 = fromEnd ? [sl * 0.68, sl] : [0, sl * 0.32];
  const screens: [Face, P2][] = [[end, [0, flen(end)]], [side, sScreen]];
  for (const [f, [s0, s1]] of screens) {
    // the flights and landings behind the fins (seen through the gaps: P02, P04)
    for (let fl = 1; fl <= FLOORS; fl++) {
      const y = 0.4 + fl * ST;
      if (y > T - 1) break;
      c.push([ob(at(f, s0 + 0.3, -0.35), at(f, s1 - 0.3, -1.1), y - 0.18, y), '#d6d4cd']);
      flight(c, f, s0 + 0.6, s1 - 0.6, y - ST, y - ST / 2, -0.4, -0.75);
      flight(c, f, s1 - 0.6, s0 + 0.6, y - ST / 2, y, -0.75, -1.1);
    }
    // the close dark vertical fins, standing proud of the frame
    for (let s = s0 + 0.4; s < s1 - 0.2; s += 0.56) c.push([ob(at(f, s - 0.045, 0.08), at(f, s + 0.045, -0.24), B, T - 1.0), FIN]);
    c.push([ob(at(f, s0, 0.02), at(f, s1, -0.3), B - 0.25, B), PALE]);
  }
  // the rest of the long face: the named strip, or the open landings (P02, P04: stacked openings, rails)
  if (t.named) {
    c.push([ob(at(side, sRest[0], 0), at(side, sRest[1], -0.4), B, T - 1.0), PALE]);
    picture(k, side, sRest[0] + 0.15, sRest[1] - 0.15, 3.8, T - 1.4, 0.03, nameStrip, 128, 1024);
  } else {
    const [r0, r1] = sRest;
    c.push([ob(at(side, r0, -0.9), at(side, r1, -1.0), B, T - 1.0), PALE]);
    for (let fl = 1; fl <= FLOORS; fl++) {
      const y = 0.4 + fl * ST;
      if (y > T - 1) break;
      c.push([ob(at(side, r0, 0), at(side, r1, -0.9), y - 0.2, y + 0.05), PALE]);
      c.push([ob(at(side, r0 + 0.1, 0.0), at(side, r1 - 0.1, -0.05), y + 0.95, y + 1.02), '#9aa0a5']);
      for (let s = r0 + 0.3; s < r1 - 0.2; s += 0.5) c.push([ob(at(side, s - 0.02, 0), at(side, s + 0.02, -0.04), y + 0.05, y + 0.95), '#9aa0a5']);
      // a door into the landing's back wall
      c.push([ob(at(side, (r0 + r1) / 2 - 0.45, -0.88), at(side, (r0 + r1) / 2 + 0.45, -0.92), y + 0.05, y + 2.1), '#5c4a3c']);
    }
  }
  // the short returns: solid pale walls; on the named tower the return beside the front wing is grey cladding (R05)
  for (const key of ['x0', 'x1', 'z0', 'z1'] as const) {
    if (key === t.end || key === t.side) continue;
    const f = F[key];
    c.push([ob(at(f, 0, 0), at(f, flen(f), -0.3), B, T - 1.0), t.named && key === 'x1' ? CLAD : PALE]);
  }
  // the black tanks on the tower roof (P02, P05; M01's corner groups)
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, along = x1 - x0 > z1 - z0;
  tanks(k, along ? [[cx - 1.6, cz], [cx, cz], [cx + 1.6, cz]] : [[cx, cz - 1.6], [cx, cz], [cx, cz + 1.6]], T - 0.7, 0.75);
}

// ---------- the entrance (R09-R12) ----------
function entranceFace(g: CanvasRenderingContext2D) {
  const W = 470, H = 695, mx = W / 10, PAN = ['#2f3337', '#6b7075', '#c8cbcd', '#8d9297', '#2f3337', '#c8cbcd'];
  g.fillStyle = '#9aa0a5'; g.fillRect(0, 0, W, H);
  const rowH = (ST / 3) * 50, groundTop = H - 3.4 * 50;
  for (let r = 0; r * rowH < groundTop; r++) for (let col = 0; col < 10; col++) {
    const x = col * mx, y = groundTop - (r + 1) * rowH;
    if (col >= 2 && col <= 7) {
      const gr = g.createLinearGradient(0, y, 0, y + rowH); gr.addColorStop(0, '#5a6c7c'); gr.addColorStop(1, '#2c3843');
      g.fillStyle = gr; g.fillRect(x, y, mx, rowH);
    } else { g.fillStyle = PAN[(r * 3 + col * 5) % PAN.length]; g.fillRect(x, y, mx, rowH); }
    g.fillStyle = '#1b1f23'; g.fillRect(x, y, 3, rowH); g.fillRect(x, y, mx, 3);
  }
  // the slab lines at the floors
  for (let fl = 1; fl < FLOORS; fl++) { g.fillStyle = '#d2d4d5'; g.fillRect(0, H - (0.4 + fl * ST) * 50 - 4, W, 8); }
  // the ground storey: glass doors in dark frames between light panels
  g.fillStyle = '#c8cbcd'; g.fillRect(0, groundTop, W, H - groundTop);
  g.fillStyle = '#2a3540'; g.fillRect(2 * mx, groundTop + 20, 6 * mx, H - groundTop - 20);
  g.fillStyle = '#15191d'; for (let col = 2; col <= 8; col++) g.fillRect(col * mx - 2, groundTop + 20, 5, H - groundTop - 20);
  g.fillRect(2 * mx, groundTop + 20, 6 * mx, 5);
}
function entrance(k: Kit, c: Part[]) {
  const [ex0, ex1] = ENTRANCE.x, z = WINGS.front[2], zo = z - ENTRANCE.out, top = EAVE + 0.7;
  c.push([box(ex0, ex1, 0, top, zo, z), '#b9bdc0'], [box(ex0 - 0.3, ex1 + 0.3, top, top + 0.3, zo - 0.3, z + 0.3), '#e3e4e2']);
  picture(k, { a: [ex0, zo], b: [ex1, zo], n: [0, -1] }, 0, ex1 - ex0, 0, top, 0.02, entranceFace, 470, 695);
  // the thin flat canopy over the doors, its dark edge
  c.push([box(ex0 + 1, ex1 - 1, 3.25, 3.42, zo - 2.6, zo), '#e9e9e6'], [box(ex0 + 1, ex1 - 1, 3.17, 3.42, zo - 2.66, zo - 2.56), '#3a3f44']);
}

// ---------- the courts (P01; M01 2, 3) ----------
function court(k: Kit, c: Part[], [x0, x1, z0, z1]: R4) {
  plane(k, rect([x0, x1, z0, z1]), 0.04, paverMat(), 2, k.world);
  // the low concrete-edged beds round the paths (P01 4; M01 3's geometric layout)
  const W = x1 - x0, D = z1 - z0;
  const beds: R4[] = [[0.08, 0.42, 0.14, 0.44], [0.54, 0.92, 0.14, 0.44], [0.08, 0.34, 0.58, 0.86], [0.46, 0.92, 0.58, 0.86]].map(([a, b, cc, d]) => [x0 + a * W, x0 + b * W, z0 + cc * D, z0 + d * D]);
  for (const [a, b, cc, d] of beds) {
    for (const r of [[a, b, cc, cc + 0.25], [a, b, d - 0.25, d], [a, a + 0.25, cc, d], [b - 0.25, b, cc, d]] as R4[]) c.push([box(r[0], r[1], 0, 0.45, r[2], r[3]), '#b9ad9b']);
    c.push([box(a + 0.25, b - 0.25, 0, 0.36, cc + 0.25, d - 0.25), '#7a5a3e']);
    for (let x = a + 1; x < b - 0.6; x += 1.7) for (let zz = cc + 1; zz < d - 0.6; zz += 1.9) if (hash2(x, zz) > 0.45) c.push([new THREE.IcosahedronGeometry(0.35 + hash2(zz, x) * 0.2, 0).scale(1, 0.7, 1).translate(x, 0.6, zz), hash2(x + 1, zz) > 0.8 ? '#7d3340' : '#4f7d35']);
  }
  // the stacked corner landings (P01 2): on the long walls beside each corner, each floor open with a rail
  for (const [xa, dir] of [[x0, 1], [x1, -1]] as [number, number][]) for (const [zw, n] of [[z0, 1], [z1, -1]] as [number, number][]) {
    const xb = xa + dir * 2.8, lo = Math.min(xa, xb), hi = Math.max(xa, xb);
    c.push([box(lo, hi, 0.4, EAVE - 0.4, Math.min(zw, zw + n * 0.03), Math.max(zw, zw + n * 0.03)), '#c9c1b4']);
    for (const xj of [lo, hi]) c.push([box(xj - 0.15, xj + 0.15, 0.4, EAVE - 0.4, Math.min(zw, zw + n * 0.4), Math.max(zw, zw + n * 0.4)), WALL]);
    for (let fl = 0; fl < FLOORS; fl++) {
      const y = 0.4 + fl * ST;
      if (fl) {
        c.push([box(lo, hi, y - 0.2, y + 0.05, Math.min(zw, zw + n * 0.4), Math.max(zw, zw + n * 0.4)), WALL]);
        c.push([box(lo, hi, y + 0.95, y + 1.02, Math.min(zw + n * 0.36, zw + n * 0.4), Math.max(zw + n * 0.36, zw + n * 0.4)), '#9aa0a5']);
      }
      c.push([box(lo + 0.9, hi - 0.9, y + 0.05, y + 2.1, Math.min(zw, zw + n * 0.05), Math.max(zw, zw + n * 0.05)), '#5c4a3c']);
    }
  }
}

// ---------- materials ----------
let PAVER: THREE.MeshStandardMaterial | null = null;
/** grey and tan interlocking pavers (R02-R12, P06: a tight grey-brown block pattern), 2 m a tile */
const paverMat = () => (PAVER ??= new THREE.MeshStandardMaterial({ roughness: 0.92, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, map: canvas(256, 256, (g) => {
  g.fillStyle = '#5f5a53'; g.fillRect(0, 0, 256, 256);
  const cols = ['#8f877c', '#968b7d', '#80786e', '#9a8571', '#8a8276', '#93806c'];
  // herringbone: pairs of 0.2 x 0.1 m blocks turned each way (12.8 px a decimetre)
  for (let j = -2; j < 22; j++) for (let i = -2; i < 22; i++) {
    const x = i * 25.6 - j * 12.8, y = j * 12.8 + i * 12.8;
    const x0 = ((x % 256) + 256) % 256, y0 = ((y % 256) + 256) % 256;
    g.fillStyle = cols[(i * 7 + j * 3 + ((i * j) & 3)) % cols.length];
    g.fillRect(x0 + 1, y0 + 1, 24, 11); g.fillRect(x0 + 1 - 256, y0 + 1, 24, 11); g.fillRect(x0 + 1, y0 + 1 - 256, 24, 11);
    g.fillStyle = cols[(i * 5 + j * 11) % cols.length];
    g.fillRect(x0 + 1 + 12.8, y0 + 1 + 12.8, 11, 24); g.fillRect(x0 + 1 + 12.8 - 256, y0 + 1 + 12.8, 11, 24); g.fillRect(x0 + 1 + 12.8, y0 + 1 + 12.8 - 256, 11, 24);
  }
  speckle(g, 0, 0, 256, 256, 900, ['#7a7369', '#a39886', '#857c70']);
}) }));

// ---------- the building ----------
const blocks: Block[] = [
  { ...b4(WINGS.front), faces: { z0: ROOM, z1: ROOM, x0: END, x1: END } },
  { ...b4(WINGS.rear), faces: { z0: ROOM, z1: ROOM, x0: END, x1: END } },
  { ...b4(WINGS.north), roof: 'none', faces: { x0: ROOM, x1: COURT, z0: END, z1: END } },
  { ...b4(WINGS.cross), roof: 'none', faces: { x0: COURT, x1: COURT, z0: END, z1: END } },
  { ...b4(WINGS.south), roof: 'none', faces: { x0: COURT, x1: ROOM, z0: END, z1: END } },
  // the pale slab's small structure (M01 6) and the detached red-roof building (M01 7): one storey
  { x0: PAD_SHED[0], x1: PAD_SHED[1], z0: PAD_SHED[2], z1: PAD_SHED[3], floors: 1, roofColor: '#9ea3a5', pitch: 0.25, faces: { x0: SHED, x1: SHED, z0: SHED, z1: SHED }, plinth: '#b8b1a5' },
  { x0: SHED7[0], x1: SHED7[1], z0: SHED7[2], z1: SHED7[3], floors: 1, roofColor: '#a2483a', pitch: 0.4, faces: { x0: SHED, x1: SHED, z0: SHED, z1: SHED }, plinth: '#b8b1a5' },
];
function b4([x0, x1, z0, z1]: R4): Block { return { x0, x1, z0, z1, floors: FLOORS }; }

const djSpec: Spec = {
  name: 'Diamond Jubilee Hall', axis: DJ_AX, origin: DJ_O, storey: ST, style: ROOM, roofColor: ROOF, fascia: '#efeeea', pitch: 0.32,
  plinth: '#d3bd9f', blocks,
  replaces: [djWorld(-20, -18), djWorld(-20, 12)],
  keep: [[-66, 56, -27, -22], [-66, -52, -22, -4], [-64, 54, 19.8, 23], [PAD[0], PAD[1], PAD[2], PAD[3]], [86, 100, -7, 16]],
  extras: (k) => {
    const c: Part[] = [];
    // the cross roofs over the end wings and the cross-connection: gables whose ridges die into the long wings' roofs
    // (one ridge height with the front wing's; no hips at the court corners)
    const rise = ((WINGS.front[3] - WINGS.front[2]) / 2 + 0.8) * 0.32;
    for (const w of [WINGS.north, WINGS.cross, WINGS.south]) {
      const X0 = w[0] - 0.8, X1 = w[1] + 0.8;
      gableZ(k, X0, X1, -18, 10, EAVE, rise / ((X1 - X0) / 2), [false, false]);
      for (const x of [X0, X1]) c.push([box(x - 0.06, x + 0.06, EAVE - 0.3, EAVE + 0.03, -13, 4.8), '#efeeea']);
    }
    for (const t of TOWERS) tower(k, c, t);
    entrance(k, c);
    for (const r of COURTS) court(k, c, r);
    // downpipes on the long faces (P01, P02)
    for (const x of [-40, -28, -16, 8, 20, 32]) {
      c.push([box(x - 0.06, x + 0.06, 0, EAVE - 0.2, WINGS.front[2] - 0.16, WINGS.front[2] - 0.04), '#e8e8e4']);
      c.push([box(x - 0.06, x + 0.06, 0, EAVE - 0.2, WINGS.rear[3] + 0.04, WINGS.rear[3] + 0.16), '#e8e8e4']);
    }

    // ===== the frontage =====
    const P = paverMat(), lawn = lawnMat();
    plane(k, rect(FORECOURT), 0.035, P, 2, k.world);
    plane(k, rect(NORTH_APRON), 0.035, P, 2, k.world);
    const kerb = (r: R4, h = 0.15, col = '#cfccc4') => {
      const [a, b, cc, d] = r;
      for (const q of [[a, b, cc, cc + 0.15], [a, b, d - 0.15, d], [a, a + 0.15, cc, d], [b - 0.15, b, cc, d]] as R4[]) c.push([box(q[0], q[1], 0, h, q[2], q[3]), col]);
    };
    for (const r of ISLANDS) { plane(k, rect([r[0] + 0.15, r[1] - 0.15, r[2] + 0.15, r[3] - 0.15]), 0.12, lawn, 4, k.world); kerb(r); }
    // the planted strip along the front: a low kerb, soil, shrubs with red-leaved accents (R08, R10)
    for (const [a, b] of BED.runs) {
      kerb([a, b, BED.z[0], BED.z[1] + 0.2], 0.2);
      c.push([box(a + 0.15, b - 0.15, 0, 0.16, BED.z[0] + 0.15, BED.z[1]), '#6e5138']);
      for (let x = a + 0.8; x < b - 0.5; x += 1.3) c.push([new THREE.IcosahedronGeometry(0.42 + hash2(x, 3) * 0.2, 0).scale(1, 0.8, 0.7).translate(x, 0.5, (BED.z[0] + BED.z[1]) / 2), hash2(x, 7) > 0.72 ? '#7d3340' : hash2(x, 9) > 0.5 ? '#4f7d35' : '#5d8a3c']);
    }
    // the drain along the forecourt's outer edge: an open concrete channel, slabs over it at the side road
    { const [d0, d1] = DRAIN.z, [g0, g1] = VERGE.gap;
      for (const [a, b] of [[FORECOURT[0], g0], [g1, FORECOURT[1]]] as P2[]) {
        c.push([box(a, b, 0, 0.1, d0, d0 + 0.12), '#bdb9b0'], [box(a, b, 0, 0.1, d1 - 0.12, d1), '#bdb9b0'], [box(a, b, 0, 0.02, d0 + 0.12, d1 - 0.12), '#3b3a37']);
      }
      c.push([box(g0, g1, 0, 0.06, d0, d1), '#a9a59c']);
      for (let x = g0 + 0.5; x < g1; x += 0.5) c.push([box(x - 0.03, x + 0.03, 0.06, 0.065, d0 + 0.05, d1 - 0.05), '#55534f']); }
    // the grass verge to Jubilee Link (broken at road 366)
    for (const [a, b] of [[VERGE.x[0], VERGE.gap[0]], [VERGE.gap[1], VERGE.x[1]]] as P2[]) plane(k, rect([a, b, VERGE.z[0], VERGE.z[1]]), 0.05, lawn, 4, k.world);
    // the slim lights: a grey pole, a short arm, a flat head
    for (const [x, z] of LIGHTS) {
      const out = z > -40 ? -1 : 1;
      c.push([box(x - 0.06, x + 0.06, 0, 6.8, z - 0.06, z + 0.06), '#80868b'], [box(x - 0.04, x + 0.04, 6.6, 6.68, Math.min(z, z + out * 1.1), Math.max(z, z + out * 1.1)), '#80868b']);
      c.push([box(x - 0.16, x + 0.16, 6.45, 6.62, z + out * 1.1 - 0.3, z + out * 1.1 + 0.3), '#d9dcde']);
    }
    // the red hydrant-like post on the lawn by the entrance
    { const [x, z] = HYDRANT;
      c.push([new THREE.CylinderGeometry(0.14, 0.17, 0.75, 12).translate(x, 0.5, z), '#c4271f'], [new THREE.SphereGeometry(0.15, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).translate(x, 0.87, z), '#c4271f']);
      c.push([new THREE.CylinderGeometry(0.06, 0.06, 0.42, 8).rotateZ(Math.PI / 2).translate(x, 0.62, z), '#c4271f'], [box(x - 0.25, x + 0.25, 0.1, 0.16, z - 0.25, z + 0.25), '#9a9890']); }

    // ===== the rear and the detached pieces =====
    c.push([box(PAD[0], PAD[1], 0, 0.14, PAD[2], PAD[3]), '#bfb9ad']);
    c.push([box(TANKS7[0] - 3.6, TANKS7[0] + 3.6, 0, 0.3, TANKS7[1] - 2.6, TANKS7[1] + 2.6), '#b5afa4']);
    tanks(k, [[-2.2, -1.3], [0, -1.3], [2.2, -1.3], [-2.2, 1.3], [0, 1.3], [2.2, 1.3]].map(([a, b]) => [TANKS7[0] + a, TANKS7[1] + b] as P2), 0.3, 0.9);
    k.plain.push(...c);
  },
};

export const djSite = createSite('diamond-jubilee', [djSpec]);

/** the red earth round the rear and the ends, the rough grass and scrub beyond (P04, P05; M01 6) */
export function buildDjGrounds() {
  const group = new THREE.Group();
  group.name = 'diamond-jubilee-grounds';
  const inR = ([a, b, c, d]: R4, x: number, z: number) => x > a && x < b && z > c && z < d;
  const color = (wx: number, wz: number): [number, number, number, number] | null => {
    const [x, z] = djLocal(wx, wz);
    if (inR(FORECOURT, x, z) || inR(NORTH_APRON, x, z)) return null;
    const n = vnoise2(wx / 9, wz / 9), m = vnoise2(wx / 2.5 + 7, wz / 2.5), t = hash2(Math.floor(wx * 2), Math.floor(wz * 2)) * 0.06;
    // ragged outer edges: the earth and the scrub thin into the grass (not drawn rectangles)
    const fe = vnoise2(wx / 4, wz / 4) * 8;
    if (inR(EARTH, x, z) && Math.min(x - EARTH[0], EARTH[1] - x) < fe && z > 19.8 + 0) return null;
    if (inR(SCRUB, x, z) && Math.min(x - SCRUB[0], SCRUB[1] - x, SCRUB[3] - z) < fe) return null;
    if (inR(EARTH, x, z)) {
      // red earth worn bare near the walls and on the access, rough grass tufting through further out
      const edge = Math.min(z - 19.8, x < -52 ? -52 - x : 99, x > 49 ? x - 49 : 99);
      if (n + (m - 0.5) * 0.3 > 0.62 && edge > 6) return [150 - t * 200, 140 - t * 160, 80 - t * 90, 0.8];
      return [172 - t * 200, 98 - t * 140, 64 - t * 90, 0.95];
    }
    if (inR(SCRUB, x, z)) return n > 0.55 ? [168 - t * 200, 104 - t * 140, 68 - t * 90, 0.85] : [132, 128, 70, 0.7];
    return null;
  };
  const cellIn = (wx: number, wz: number) => { const [x, z] = djLocal(wx, wz); return (inR(EARTH, x, z) || inR(SCRUB, x, z)) && !inR(FORECOURT, x, z) && !inR(NORTH_APRON, x, z); };
  const soil = coverOverlay({ box: [-400, -180, 1760, 1990], mpp: 0.5, cell: 2, tile: 115, color, cellIn });
  for (const m of soil) m.userData.noRelief = true;
  group.add(...soil);
  // the scrub: grouped low bush beyond the earth (not tall trees), clear of the trail and the detached pieces
  const TRAIL: P2[] = [[-315.8, 1974], [-274.9, 1938.5], [-263.6, 1929.6], [-220.2, 1900.1], [-209.1, 1899.7], [-201.5, 1909.5], [-196, 1921.8], [-181, 1947.6]];
  const trailGap = (x: number, z: number) => {
    let d = 1e9;
    for (let i = 1; i < TRAIL.length; i++) {
      const [ax, az] = TRAIL[i - 1], [bx, bz] = TRAIL[i], dx = bx - ax, dz = bz - az, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
      d = Math.min(d, Math.hypot(ax + dx * u - x, az + dz * u - z));
    }
    return d;
  };
  const crowns: Crown[] = [];
  for (let x = SCRUB[0] + 1; x < SCRUB[1]; x += 2.6) for (let z = SCRUB[2] + 1; z < SCRUB[3]; z += 2.6) {
    const jx = x + (hash2(x, z) - 0.5) * 2, jz = z + (hash2(z, x) - 0.5) * 2, [wx, wz] = djWorld(jx, jz);
    if (vnoise2(wx / 11, wz / 11) < 0.48 || trailGap(wx, wz) < 3.5) continue;
    crowns.push({ x: wx, z: wz, r: 0.9 + hash2(jx, 5) * 0.9, h: 1.1 + hash2(jz, 6) * 0.9, base: 0, trunk: 0, color: ['#5d7034', '#6b7a3c', '#56692f', '#7a7d45'][Math.floor(hash2(jx, jz) * 4)], seed: hash2(jx, 2) });
  }
  // the young trees on the forecourt's islands and the verge (R01-R03)
  for (const [i, r] of ISLANDS.entries()) {
    const [wx, wz] = djWorld((r[0] + r[1]) / 2, (r[2] + r[3]) / 2);
    crowns.push({ x: wx, z: wz, r: 1.3 + hash2(i, 1) * 0.5, h: 1.8, base: 1.9, trunk: 0.09, color: '#4e7a32', seed: hash2(i, 4), solid: true });
  }
  group.add(...crownTiles(crowns, 100, 75));
  return group;
}
