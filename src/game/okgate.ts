// The University of Ghana's Okponglo entrance on Jubilee Drive (Academic Freedom Road), from the owner's Okponglo entrance
// correction audit (docs/okponglo/gate/ledger.md; numbers in okgateplan.ts):
// - the gatehouse across the drive (S04): white side rooms over a wine base on the north (the round grille high on the
//   approach faces, barred openings, the door), the clear portal over the carriageway, the south walk bay with two slender
//   round columns and the broad end pier, the fascia with its fret grille panels and the display over the portal, the
//   brown tiled hipped roof on broad eaves;
// - the taxi lot (S06, Video Pair 2): its white bays, the kerbed tree islands, its cars in the bays; the open red-roof
//   waiting pavilion at its corner;
// - the drive's edges (S02, S04, S08, S10): plain kerbs, tan paver footways both sides, the open channel behind the north
//   footway with its crossing slabs at the entries, slim road lamps, the stadium side's planted strip and light metal fence;
// - the bare plot east of the lot (S12, S14, S16): reddish soil and dry grass, its localized tree group (buildOkGateGrounds).
import * as THREE from 'three';
import { createSite, type Kit, type Spec, type Style } from './blocks';
import { box, canvas, type Part } from './modelkit';
import { prism, strip } from './medkit';
import { hipRoof } from './waccbip';
import { SOLIDS } from './solids';
import { wallSolids } from './enkit';
import { NODE_XZ, ROADS } from './campusmap';
import { coverOverlay, crownTiles, hash2, vnoise2, type Crown } from './scrubkit';
import { DRIVE_HALF, FENCE_S, GATE, LOT, PALMS, PAVILION, PLOT, SIGN_FRAME, TREES, WALK, driveZ, lotWorld, type P2 } from './okgateplan';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => { g.fillStyle = '#f2f1ec'; g.fillRect(0, 0, 256, 512); } };
const WHITE = '#f2f1ec', WINE = '#7a2a2e', DARK = '#2b2d2f';

/** the gate frame to the world */
const gWorld = (u: number, v: number): P2 => [GATE.origin[0] + GATE.axis[0] * u - GATE.axis[1] * v, GATE.origin[1] + GATE.axis[1] * u + GATE.axis[0] * v];
const gSolid = (u: number, v: number, r: number) => { const [x, z] = gWorld(u, v); SOLIDS.add(x, z, r); };
const gWall = (a: P2, b: P2) => { const [x0, z0] = gWorld(...a), [x1, z1] = gWorld(...b); wallSolids(x0, z0, x1, z1, 0.3); };

/** the fascia's fret grille panel and the display's picture */
let FRET: THREE.MeshStandardMaterial | null = null;
const fretMat = () => (FRET ??= new THREE.MeshStandardMaterial({ roughness: 0.8, map: canvas(64, 64, (g) => {
  g.fillStyle = '#e9e7e1'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#3a3330'; g.fillRect(4, 4, 56, 56);
  g.strokeStyle = '#e9e7e1'; g.lineWidth = 3;
  for (const [a, b, c, d] of [[12, 12, 52, 12], [52, 12, 52, 52], [52, 52, 12, 52], [12, 52, 12, 20], [12, 20, 44, 20], [44, 20, 44, 44], [44, 44, 20, 44], [20, 44, 20, 28], [20, 28, 36, 28], [36, 28, 36, 36]]) { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }
}) }));
/** the display over the portal: an LED screen playing a ten-second aerial loop of the game's own campus (the Balme
 *  Library, Commonwealth Hall, the Great Hall, the Medical Centre; rendered from the game: public/video/okgate-aerial.*),
 *  muted and repeating; a still picture until the video plays (the owner: "it is a screen, not just a board") */
let SCREEN: THREE.MeshBasicMaterial | null = null;
const screenMat = () => {
  if (SCREEN) return SCREEN;
  const still = canvas(256, 68, (g) => {
    const gr = g.createLinearGradient(0, 0, 256, 68); gr.addColorStop(0, '#5f9a4a'); gr.addColorStop(0.5, '#d9c08a'); gr.addColorStop(1, '#6d9ac4');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 68);
    for (let i = 0; i < 30; i++) { g.fillStyle = i % 3 ? '#c0573f' : '#efe9dc'; g.fillRect((i * 37) % 240, 10 + ((i * 17) % 44), 12, 7); }
  });
  SCREEN = new THREE.MeshBasicMaterial({ map: still, toneMapped: false });
  if (typeof document !== 'undefined') {
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto'; v.crossOrigin = 'anonymous';
    for (const [f, type] of [['okgate-aerial.webm', 'video/webm'], ['okgate-aerial.mp4', 'video/mp4']]) { const src = document.createElement('source'); src.src = `${import.meta.env.BASE_URL}video/${f}`; src.type = type; v.appendChild(src); }
    const tex = new THREE.VideoTexture(v); tex.colorSpace = THREE.SRGBColorSpace;
    const m = SCREEN;
    v.addEventListener('playing', () => { m.map = tex; m.needsUpdate = true; }, { once: true });
    // (muted video may start at once; where a browser waits for a first touch, it starts then)
    const go = () => { v.play().catch(() => undefined); };
    go(); addEventListener('pointerdown', go, { once: true }); addEventListener('keydown', go, { once: true });
  }
  return SCREEN;
};
/** a flat panel facing ±U (side: +1 east, -1 west) on the gate's approach face, model frame */
const facePanel = (k: Kit, mat: THREE.Material, u: number, side: number, v0: number, v1: number, y0: number, y1: number) => {
  const g = new THREE.PlaneGeometry(v1 - v0, y1 - y0).rotateY(side > 0 ? Math.PI / 2 : -Math.PI / 2).translate(u + side * 0.02, (y0 + y1) / 2, (v0 + v1) / 2);
  k.meshes.push(new THREE.Mesh(g, mat));
};

// ======================================================================================================
// the gatehouse
// ======================================================================================================
const gatehouse: Spec = {
  name: 'Okponglo gatehouse', axis: GATE.axis, origin: GATE.origin, storey: 3, style: PLAIN, roofColor: '#9a4a33', fascia: WHITE, pitch: GATE.pitch,
  blocks: [],
  keep: [[GATE.u[0] - 2, GATE.u[1] + 2, GATE.v[0] - 1, GATE.v[1] + 1]],
  extras: (k) => {
    const p: Part[] = [], [U0, U1] = GATE.u, [V0, V1] = GATE.v, W = GATE.wall, B = GATE.beam;
    // ---- the side rooms on the north: white walls over the wine base ----
    { const [a, b, c, d] = GATE.rooms;
      p.push([box(a, b, 0, W, c, d), WHITE], [box(a - 0.04, b + 0.04, 0, 0.9, c - 0.04, d + 0.04), WINE]);
      gWall([a, c], [b, c]); gWall([b, c], [b, d]); gWall([b, d], [a, d]); gWall([a, d], [a, c]);
      // the portal-side face: the door between two barred windows
      p.push([box(-0.6, 0.6, 0, 2.3, d, d + 0.05), '#5b6466']);
      for (const u of [-3.4, 2.6]) { p.push([box(u, u + 1.0, 1.2, 2.6, d, d + 0.05), DARK]); for (let i = 1; i < 5; i++) p.push([box(u + i * 0.2 - 0.02, u + i * 0.2 + 0.02, 1.2, 2.6, d + 0.05, d + 0.08), WHITE]); }
      // the approach faces: the round grille high up, a barred window and the small sign below it
      for (const s of [-1, 1]) {
        const u = s > 0 ? b : a;
        p.push([new THREE.CylinderGeometry(0.72, 0.72, 0.06, 24).rotateZ(Math.PI / 2).translate(u + s * 0.02, 3.9, -9.6), DARK]);
        p.push([new THREE.TorusGeometry(0.72, 0.06, 6, 24).rotateY(Math.PI / 2).translate(u + s * 0.05, 3.9, -9.6), WHITE]);
        for (const o of [-0.36, 0, 0.36]) p.push([box(u + s * 0.04 - 0.02, u + s * 0.04 + 0.02, 3.2, 4.6, -9.6 + o - 0.02, -9.6 + o + 0.02), WHITE], [box(u + s * 0.04 - 0.02, u + s * 0.04 + 0.02, 3.9 + o - 0.02, 3.9 + o + 0.02, -10.3, -8.9), WHITE]);
        p.push([box(u - 0.03, u + 0.03, 1.2, 2.5, -12.2, -10.9), DARK], [box(u - 0.05, u + 0.05, 1.4, 1.9, -7.4, -6.6), '#2f5d8a']);
        p.push([box(u + s * 0.02 - 0.15, u + s * 0.02 + 0.15, 2.7, 3.2, -12.4, -11.6), '#d9dcde']);
      } }
    // ---- the south bay: the broad end pier on its wine base, two slender round columns each side of the walk ----
    { const [a, b, c, d] = GATE.pier;
      p.push([box(a, b, 0, W, c, d), WHITE], [box(a - 0.04, b + 0.04, 0, 0.9, c - 0.04, d + 0.04), WINE]);
      p.push([box(b + 0.01, b + 0.04, 2.6, 3.3, c + 0.6, d - 0.6), '#d4cfbf']);
      gWall([a, c], [b, c]); gWall([b, c], [b, d]); gWall([b, d], [a, d]); gWall([a, d], [a, c]);
      for (const u of [-5.4, 5.4]) { p.push([new THREE.CylinderGeometry(0.17, 0.17, W, 14).translate(u, W / 2, 6.7), WHITE]); gSolid(u, 6.7, 0.28); } }
    // ---- the fascia and soffit over the whole gate: its fret grille panels and the display over the portal ----
    p.push([box(U0, U1, W, B, V0, V1), WHITE], [box(U0 + 0.3, U1 - 0.3, W - 0.06, W, GATE.portal[0], GATE.walk[1]), '#e3e1da']);
    for (const s of [-1, 1]) {
      const u = s > 0 ? U1 : U0;
      for (const v of [-12.4, -10.9, -9.4, 9.0, 10.3]) facePanel(k, fretMat(), u, s, v - 0.55, v + 0.55, W + 0.2, W + 1.1);
      // the screen in its dark frame, the video's shape (3.75 : 1) over the portal
      p.push([box(Math.min(u - s * 0.06, u + s * 0.01), Math.max(u - s * 0.06, u + s * 0.01), W + 0.06, B - 0.06, -2.62, 1.62), '#1d1f22']);
      facePanel(k, screenMat(), u, s, -2.5, 1.5, W + 0.12, B - 0.12);
    }
    // ---- the brown tiled hipped roof on broad eaves ----
    k.roof.c = new THREE.Color('#9a4a33');
    hipRoof(k, (x, z) => [x, z], U0 - GATE.eave, U1 + GATE.eave, V0 - GATE.eave, V1 + GATE.eave, B, GATE.pitch, 'z', [{ gw: 0, tri: false }, { gw: 0, tri: false }], p, '#7a3a28');
    k.plain.push(...p);
  },
};

// ======================================================================================================
// the drive's edges, the taxi lot and its pavilion: one model in the world frame (origin O)
// ======================================================================================================
const O: P2 = [826, 1200];
const L = (x: number, z: number): P2 => [x - O[0], z - O[1]];
/** the other roads' centre lines near the work (the gaps in the channel and footways where they cross) */
const SIDE_ROADS = ROADS.map((r, i) => ({ i, cls: r.cls, pts: r.nodes.map((n) => [NODE_XZ[n * 2], NODE_XZ[n * 2 + 1]] as P2) }))
  .filter((r) => r.pts.some(([x, z]) => x > 660 && x < 990 && z > 1150 && z < 1300) && !(r.cls <= 1 && r.pts.every(([x, z]) => Math.abs(z - driveZ(x)) < 2.5)));
const segD = (x: number, z: number, [ax, az]: P2, [bx, bz]: P2) => { const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)); return Math.hypot(x - ax - dx * f, z - az - dz * f); };
const nearSideRoad = (x: number, z: number, r: number) => SIDE_ROADS.some(({ cls, pts }) => pts.some((q, i) => i > 0 && segD(x, z, pts[i - 1], q) < r + (cls <= 2 ? 3.2 : cls === 3 ? 2.3 : 1.3)));
const inGate = (x: number) => Math.abs(x - GATE.origin[0]) < GATE.u[1] + 0.4;

/** a band along the drive at offsets [o0, o1] (negative north) from x0 to x1, skipping where `skip` holds; y0..y1 */
function band(c: Part[], x0: number, x1: number, o0: number, o1: number, y0: number, y1: number, col: string, skip: (x: number, z: number) => boolean) {
  let run: P2[] = [];
  const om = (o0 + o1) / 2, flush = () => { if (run.length > 1) c.push([strip(run, y0, y1, Math.abs(o1 - o0)), col]); run = []; };
  for (let x = x0; x <= x1; x += 1) { const z = driveZ(x) + om; if (skip(x, z)) { flush(); continue; } run.push(L(x, z)); }
  flush();
}

const edges: Spec = {
  name: 'Okponglo entrance edges and taxi lot', axis: [1, 0], origin: O, storey: 3, style: PLAIN, roofColor: '#a8432f', fascia: '#efe6cf', pitch: 0.35,
  blocks: [],
  // the open red-roof pavilion replaces the map's solid outline
  replaces: [[(PAVILION[0] + PAVILION[1]) / 2, (PAVILION[2] + PAVILION[3]) / 2]],
  keep: [],
  extras: (k) => {
    const c: Part[] = [], h = DRIVE_HALF;
    // ---- kerbs (plain concrete), tan paver footways both sides, the open channel behind the north footway ----
    const nK = (x: number, z: number) => inGate(x) || nearSideRoad(x, z, 0.5);
    for (const s of [-1, 1]) {
      band(c, WALK.x0, WALK.x1, s * (h + 0.02), s * (h + 0.22), 0, 0.14, '#cbc5b6', nK);
      band(c, WALK.x0, WALK.x1, s * (h + 0.22), s * (h + 0.22 + WALK.w), 0.03, 0.1, '#bcb9b1', (x, z) => (s < 0 && inGate(x)) || nearSideRoad(x, z, 0.5));
    }
    // the pavement's joints across both footways (grey concrete slabs, S02/S04)
    for (const s of [-1, 1]) for (let x = WALK.x0; x <= WALK.x1; x += 1.2) {
      const o = s * (h + 0.22 + WALK.w / 2), z = driveZ(x) + o;
      if ((s < 0 && inGate(x)) || nearSideRoad(x, z, 0.5)) continue;
      const [lx, lz] = L(x, z); c.push([box(lx - 0.025, lx + 0.025, 0.1, 0.104, lz - WALK.w / 2, lz + WALK.w / 2), '#9a978f']);
    }
    // (the south footway runs on under the gate's walk bay)
    { const d0 = h + 0.22 + WALK.w, d1 = d0 + WALK.drain, skip = (x: number, z: number) => inGate(x) || nearSideRoad(x, z, 1.5);
      band(c, WALK.x0, WALK.x1, -d0, -(d0 + 0.14), 0, 0.34, '#bdb8ab', skip);
      band(c, WALK.x0, WALK.x1, -(d1 - 0.14), -d1, 0, 0.34, '#bdb8ab', skip);
      band(c, WALK.x0, WALK.x1, -(d0 + 0.14), -(d1 - 0.14), 0.01, 0.03, '#3d3a31', skip);
      // the crossing slabs where an entry crosses the channel, with their slots (S04)
      for (let x = WALK.x0; x <= WALK.x1; x += 1) {
        const z = driveZ(x) - (d0 + d1) / 2;
        if (inGate(x) || !nearSideRoad(x, z, 1.5)) continue;
        const [lx, lz] = L(x, z);
        c.push([box(lx - 0.5, lx + 0.5, 0, 0.12, lz - (d1 - d0) / 2 - 0.15, lz + (d1 - d0) / 2 + 0.15), '#cfcabd'], [box(lx - 0.04, lx + 0.04, 0.12, 0.125, lz - 0.3, lz + 0.3), '#6e6a60']);
      } }
    // ---- slim road lamps along the north footway (S08, S10); the stadium's floodlights are its own ----
    for (let x = 690; x < 968; x += 34) {
      const z = driveZ(x) - (h + 0.22 + WALK.w - 0.35);
      if (inGate(x) || nearSideRoad(x, z, 1)) continue;
      const [lx, lz] = L(x, z);
      c.push([new THREE.CylinderGeometry(0.06, 0.09, 9, 8).translate(lx, 4.5, lz), '#9da3a8'], [box(lx - 0.08, lx + 0.08, 8.85, 8.95, lz, lz + 1.6), '#9da3a8'], [box(lx - 0.15, lx + 0.15, 8.7, 8.9, lz + 1.3, lz + 1.9), '#d8dcdf']);
      SOLIDS.add(x, z, 0.15);
    }
    // ---- the slim sign frame on the plot's verge (S12-S16): two posts and a cross bar, the plate left blank ----
    { const [x, z] = SIGN_FRAME, [lx, lz] = L(x, z);
      for (const o of [-0.45, 0.45]) c.push([box(lx + o - 0.03, lx + o + 0.03, 0, 2.2, lz - 0.03, lz + 0.03), '#8d9296']);
      c.push([box(lx - 0.5, lx + 0.5, 1.5, 1.55, lz - 0.03, lz + 0.03), '#8d9296'], [box(lx - 0.4, lx + 0.4, 1.7, 2.15, lz - 0.02, lz + 0.02), '#d7d9da']);
      SOLIDS.add(x, z, 0.5); }
    // ---- the stadium side: the planted strip and the light metal boundary fence (S02, S08, S10) ----
    { const off = FENCE_S.off; let prev: P2 | null = null;
      for (let x = FENCE_S.x0; x <= FENCE_S.x1; x += 2.5) {
        const z = driveZ(x) + off;
        if (nearSideRoad(x, z, 1)) { prev = null; continue; }
        const [lx, lz] = L(x, z);
        c.push([box(lx - 0.05, lx + 0.05, 0, 1.9, lz - 0.05, lz + 0.05), '#c9ced2']);
        if (prev) {
          const [px, pz] = prev;
          for (const y of [0.25, 1.75]) c.push([strip([L(px, pz), [lx, lz]], y, y + 0.05, 0.05), '#c9ced2']);
          for (let t = 0.2; t < 2.5; t += 0.2) { const qx = px + ((x - px) * t) / 2.5, qz = pz + ((z - pz) * t) / 2.5, [mx, mz] = L(qx, qz); c.push([box(mx - 0.012, mx + 0.012, 0.25, 1.8, mz - 0.012, mz + 0.012), '#c9ced2']); }
          wallSolids(px, pz, x, z, 0.15);
        }
        prev = [x, z];
        if (hash2(x, 3) < 0.45) { const sz = driveZ(x) + h + 0.22 + WALK.w + 1.4 + hash2(x, 5) * 2.5, [sx, sl] = L(x + 1, sz); c.push([new THREE.IcosahedronGeometry(0.55 + hash2(x, 7) * 0.35, 0).scale(1.3, 0.7, 1.3).translate(sx, 0.35, sl), hash2(x, 9) < 0.5 ? '#4f7a32' : '#6a8a3e']); }
      } }
    // ---- the taxi lot: white bays, the kerbed tree islands ----
    { const P = (s: number, t: number) => L(...lotWorld(s, t)), inIsland = (s: number, _t0 = 99) => LOT.islands.some(([a, b]) => s > a - 0.6 && s < b + 0.6) || (LOT.gaps.some(([a, b]) => s > a && s < b));
      for (const [t0, t1, s0, s1] of LOT.rows) {
        for (let s = s0; s <= s1 + 0.01; s += 2.6) { if (inIsland(s, t0)) continue; c.push([strip([P(s, t0), P(s, t1)], 0.06, 0.075, 0.12), '#eeeeea']); }
        c.push([strip([P(s0, t0 < 3 ? t1 : t0), P(s1, t0 < 3 ? t1 : t0)], 0.06, 0.075, 0.12), '#eeeeea']);
      }
      for (const [a, b] of LOT.islands) {
        const r = (b - a) / 2, sm = (a + b) / 2, ring: P2[] = [], t0 = 11 + r, t1 = 21 - r;
        for (let i = 0; i <= 10; i++) { const q = Math.PI + (i / 10) * Math.PI; ring.push(P(sm + Math.cos(q) * r, t0 + Math.sin(q) * r)); }
        for (let i = 0; i <= 10; i++) { const q = (i / 10) * Math.PI; ring.push(P(sm + Math.cos(q) * r, t1 + Math.sin(q) * r)); }
        c.push([prism(ring, 0, 0.18), '#d9d4c7']);
        const inner = ring.map(([x, z]) => { const [cx, cz] = P(sm, 16), d = Math.hypot(x - cx, z - cz); return [x + ((cx - x) / d) * 0.3, z + ((cz - z) / d) * 0.3] as P2; });
        c.push([prism(inner, 0.18, 0.24), '#5f6b3a']);
        for (let t = t0; t <= t1 + 0.01; t += 2) { const [wx, wz] = lotWorld(sm, t); SOLIDS.add(wx, wz, r + 0.1); }
      } }
    // ---- the open red-roof waiting pavilion: slender posts, a low hipped roof, a concrete floor (S06) ----
    { const [x0, x1, z0, z1] = PAVILION, [a0, b0] = L(x0, z0), [a1, b1] = L(x1, z1);
      c.push([box(a0, a1, 0, 0.15, b0, b1), '#cfcabd']);
      for (const x of [a0 + 0.3, (a0 + a1) / 2, a1 - 0.3]) for (const z of [b0 + 0.3, b1 - 0.3]) { c.push([new THREE.CylinderGeometry(0.08, 0.08, 2.7, 8).translate(x, 1.35, z), '#e9e7e1']); SOLIDS.add(x + O[0], z + O[1], 0.15); }
      for (let i = 0; i < 3; i++) c.push([box(a0 + 1.5 + i * 4, a0 + 3.5 + i * 4, 0.42, 0.5, b0 + 0.6, b0 + 1.0), '#8a8f94']);
      k.roof.c = new THREE.Color('#a8432f');
      hipRoof(k, (x, z) => [x, z], a0 - 0.5, a1 + 0.5, b0 - 0.5, b1 + 0.5, 2.7, 0.35, 'x', [{ gw: 0, tri: false }, { gw: 0, tri: false }], c, '#7a3a28'); }
    k.plain.push(...c);
  },
};

/** the Okponglo entrance */
export const okGateSite = createSite('okponglo-gate', [gatehouse, edges]);

// ======================================================================================================
// the bare plot and the trees (world frame)
// ======================================================================================================
const inPoly = (p: P2[], x: number, z: number) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > z) !== (p[j][1] > z) && x < ((p[j][0] - p[i][0]) * (z - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; };
/** the plot's reddish soil, dry grass in patches, its tracks a little paler; trees and the lot's broadleaf crowns */
export function buildOkGateGrounds() {
  const group = new THREE.Group();
  group.name = 'okponglo-gate-grounds';
  const color = (x: number, z: number): [number, number, number, number] | null => {
    if (!inPoly(PLOT, x, z) || nearSideRoad(x, z, -0.5)) return null;
    const n = vnoise2(x / 8, z / 8), m = vnoise2(x / 2.5 + 7, z / 2.5), t = hash2(Math.floor(x * 2), Math.floor(z * 2)) * 0.07;
    // the raised dry patch under the tree group keeps its scrub; the rest soil with dry grass in patches
    if (n > 0.62) return [128 - t * 200, 118 - t * 160, 66 - t * 80, 0.75];
    return [164 - t * 200, 104 - t * 140, 70 - t * 90, 0.82 + m * 0.15];
  };
  const soil = coverOverlay({ box: [800, 976, 1108, 1236], mpp: 0.5, cell: 2, tile: 88, color, cellIn: (x, z) => inPoly(PLOT, x, z) });
  for (const m of soil) m.userData.noRelief = true;
  group.add(...soil);
  const crowns: Crown[] = TREES.map(([x, z, r], i) => { const s = hash2(x, z); return { x, z, r, h: r * 1.15 + 1, base: 2.2 + s * 1.5, trunk: 0.25 + r * 0.03, color: ['#3f6b2b', '#4e7a32', '#456f2e', '#5b8438'][i % 4], seed: s, solid: true }; });
  // sparse low scrub over the plot (not a garden, not a forest)
  for (let i = 0; i < 70; i++) {
    const x = 812 + hash2(i, 1) * 150, z = 1118 + hash2(i, 2) * 108;
    if (!inPoly(PLOT, x, z) || nearSideRoad(x, z, 2)) continue;
    crowns.push({ x, z, r: 0.6 + hash2(i, 3) * 0.6, h: 0.9 + hash2(i, 4) * 0.6, base: 0, trunk: 0, color: hash2(i, 5) < 0.5 ? '#6f7a3c' : '#7c7a46', seed: hash2(i, 6), solid: false });
  }
  group.add(...crownTiles(crowns, 100, 75));
  // the palms by the gate and the lot
  for (const [x, z] of PALMS) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 8, 7).translate(0, 4, 0), new THREE.MeshStandardMaterial({ color: '#7a6a55', roughness: 0.9 })));
    const fr = new THREE.MeshStandardMaterial({ color: '#4e7a32', roughness: 0.8, side: THREE.DoubleSide });
    for (let i = 0; i < 9; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 3.2).translate(0, 1.5, 0).rotateX(1.0).rotateY((i / 9) * Math.PI * 2), fr); f.position.y = 7.9; g.add(f); }
    g.position.set(x, 0, z); g.userData.noCollide = true; group.add(g); SOLIDS.add(x, z, 0.25);
  }
  return group;
}

