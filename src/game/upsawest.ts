// The UPSA campus's second layer (the owner's two UPSA packs, docs/upsa-campus/: the Apple hybrid aerial, the AeroVision
// drone post of 2025-06-23, the DroneStories clips IMG_9677, the owner's 40 photos; numbers in upsawestplan.ts). The
// mapped outlines here were old machine-detected boxes on what is now the Astro Turf and the courts (excluded in
// corrections.json); the rest of the campus's generic blocks take UPSA's finish (world.ts upsaStyle). This models:
// - the Rev. J. K. Antwi Astro Turf: synthetic turf in bands across the pitch with the full set of white lines, a red
//   edge, goals, a welded-mesh fence on grey posts, floodlight masts; the stand of blue and white seats on its west side
//   with a small white pavilion among them;
// - west of it the fenced hard courts: a red surround, two green courts with basketball posts north, two green tennis
//   courts with nets south; and beside the towers a second red court;
// - behind the north goal the Professional Christian Union Building: a long white block of three storeys over a
//   colonnade of navy raking columns, a dark band along the top storey under the name, a blue glass bay at its east end;
// - north of the courts the six-storey block with its white frame and curved fins round blue windows; the long low block
//   with the grey metal roof south of the courts; the slate-roofed block at the four-storey group's west end; the round
//   fountain in that group's courtyard.
import * as THREE from 'three';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { canvas, type Part } from './modelkit';
import { hash, wallSolids, waterMat } from './enkit';
import { SOLIDS } from './solids';
import { COURTS_NW, COURT_TOWER, FIELD, FOUNTAIN, GREY, PCU, SLATE, STAND, TURF, WU } from './upsawestplan';

type R4 = [number, number, number, number];
const O: [number, number] = [2215, -1180];
const L = (x: number) => x - O[0], M = (z: number) => z - O[1];
const V = (x: number, y: number, z: number) => new THREE.Vector3(L(x), y, M(z));
const POST = '#8e9397', NAVY = '#1f3768', SEAT_B = '#2a5fae', SEAT_W = '#e6eaee';

/** a round rod between two points (world x, z) */
function rod(a: THREE.Vector3, b: THREE.Vector3, w: number) {
  const d = b.clone().sub(a);
  return new THREE.BoxGeometry(w, w, d.length()).lookAt(d).translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
}
const bx = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate(L((x0 + x1) / 2), (y0 + y1) / 2, M((z0 + z1) / 2));

/** a flat painted surface over [x0, x1, z0, z1], y above the ground */
function surface(k: Kit, [x0, x1, z0, z1]: R4, y: number, tex: THREE.Texture) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate(L((x0 + x1) / 2), y, M((z0 + z1) / 2));
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  m.receiveShadow = true;
  m.userData.noCollide = true;
  k.meshes.push(m);
}
/** a vertical see-through panel from a to b (fence mesh), y0..y1, the texture repeating every `rep` metres */
function panel(ax: number, az: number, bxw: number, bz: number, y0: number, y1: number, rep: number) {
  const len = Math.hypot(bxw - ax, bz - az), g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([L(ax), y0, M(az), L(bxw), y0, M(bz), L(bxw), y1, M(bz), L(ax), y1, M(az)], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, len / rep, 0, len / rep, (y1 - y0) / rep, 0, (y1 - y0) / rep], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals();
  return g;
}
function mergeAll(gs: THREE.BufferGeometry[]) {
  const n = gs.reduce((s, g) => s + g.attributes.position.count, 0), pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), idx: number[] = [];
  let o = 0;
  for (const g of gs) {
    pos.set(g.attributes.position.array as Float32Array, o * 3); uv.set(g.attributes.uv.array as Float32Array, o * 2);
    for (const i of g.index!.array) idx.push(i + o);
    o += g.attributes.position.count;
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); m.setIndex(idx); m.computeVertexNormals();
  return m;
}

// ---------- textures ----------
/** the turf: bands across the pitch (IMG_9677j 46 s: parallel to the goal line), the red edge, the white lines */
function turfTexture() {
  const [x0, x1, z0, z1] = TURF.turf, e = TURF.edge, px = 8;
  const W = Math.round((x1 - x0 + 2 * e) * px), H = Math.round((z1 - z0 + 2 * e) * px);
  const t = canvas(W, H, (g) => {
    g.fillStyle = '#b4513f'; g.fillRect(0, 0, W, H);
    const X = (x: number) => (x - x0 + e) * px, Z = (z: number) => (z - z0 + e) * px;
    const bands = 14, bh = (z1 - z0) / bands;
    for (let i = 0; i < bands; i++) { g.fillStyle = i % 2 ? '#3f8a3a' : '#2f7330'; g.fillRect(X(x0), Z(z0 + i * bh), (x1 - x0) * px, bh * px + 1); }
    // a fine grain of fibres and wear in the goalmouths
    for (let i = 0; i < 9000; i++) { g.fillStyle = hash(i, 3) < 0.5 ? 'rgba(20,50,20,0.12)' : 'rgba(150,190,120,0.1)'; g.fillRect(X(x0) + hash(i, 1) * (x1 - x0) * px, Z(z0) + hash(2, i) * (z1 - z0) * px, 2, 2); }
    // the lines: touchlines and goal lines, halfway line, centre circle and spot, penalty and goal areas, spots, arcs
    const I = FIELD.inset, fx0 = x0 + I, fx1 = x1 - I, fz0 = z0 + I, fz1 = z1 - I, cx = (fx0 + fx1) / 2, cz = (fz0 + fz1) / 2;
    g.strokeStyle = '#f2f4ef'; g.lineWidth = 0.12 * px;
    g.strokeRect(X(fx0), Z(fz0), (fx1 - fx0) * px, (fz1 - fz0) * px);
    g.beginPath(); g.moveTo(X(fx0), Z(cz)); g.lineTo(X(fx1), Z(cz)); g.stroke();
    g.beginPath(); g.arc(X(cx), Z(cz), 9.15 * px, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#f2f4ef'; g.beginPath(); g.arc(X(cx), Z(cz), 0.25 * px, 0, Math.PI * 2); g.fill();
    for (const s of [-1, 1]) {
      const gz = s < 0 ? fz0 : fz1;
      g.strokeRect(X(cx - 20.15), Z(s < 0 ? gz : gz - 16.5), 40.3 * px, 16.5 * px);
      g.strokeRect(X(cx - 9.16), Z(s < 0 ? gz : gz - 5.5), 18.32 * px, 5.5 * px);
      const sz = gz - s * 11;
      g.beginPath(); g.arc(X(cx), Z(sz), 0.25 * px, 0, Math.PI * 2); g.fill();
      const a = Math.acos(5.5 / 9.15);
      g.beginPath(); g.arc(X(cx), Z(sz), 9.15 * px, s < 0 ? Math.PI / 2 - a : -Math.PI / 2 - a, s < 0 ? Math.PI / 2 + a : -Math.PI / 2 + a); g.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 8;
  return t;
}
/** a red surround with green courts: basketball (keys, centre circle, three-point arcs) or tennis lines */
function courtsTexture(outer: R4, courts: { r: R4; kind: 'basket' | 'tennis'; col: string }[]) {
  const [x0, x1, z0, z1] = outer, px = 10, W = Math.round((x1 - x0) * px), H = Math.round((z1 - z0) * px);
  const t = canvas(W, H, (g) => {
    g.fillStyle = '#b5584a'; g.fillRect(0, 0, W, H);
    // worn patches in the paint (IMG_9677j 12-16 s)
    for (let i = 0; i < 260; i++) { g.fillStyle = hash(i, 7) < 0.5 ? 'rgba(90,60,50,0.12)' : 'rgba(220,170,150,0.12)'; g.beginPath(); g.ellipse(hash(i, 1) * W, hash(2, i) * H, 6 + hash(i, 3) * 20, 4 + hash(i, 4) * 14, hash(i, 5) * 3, 0, 6.28); g.fill(); }
    const X = (x: number) => (x - x0) * px, Z = (z: number) => (z - z0) * px;
    g.lineWidth = 0.08 * px; g.strokeStyle = '#f1f1ec';
    for (const { r: [a0, a1, b0, b1], kind, col } of courts) {
      g.fillStyle = col; g.fillRect(X(a0), Z(b0), (a1 - a0) * px, (b1 - b0) * px);
      for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(200,220,200,0.1)'; g.beginPath(); g.ellipse(X(a0) + hash(i, a0) * (a1 - a0) * px, Z(b0) + hash(b0, i) * (b1 - b0) * px, 5 + hash(i, 9) * 14, 4 + hash(i, 8) * 9, 0, 0, 6.28); g.fill(); }
      const cx = (a0 + a1) / 2, cz = (b0 + b1) / 2;
      if (kind === 'basket') {
        const hw = Math.min(7.5, (a1 - a0) / 2 - 0.3), hl = Math.min(14, (b1 - b0) / 2 - 0.3);
        g.strokeRect(X(cx - hw), Z(cz - hl), 2 * hw * px, 2 * hl * px);
        g.beginPath(); g.moveTo(X(cx - hw), Z(cz)); g.lineTo(X(cx + hw), Z(cz)); g.stroke();
        g.beginPath(); g.arc(X(cx), Z(cz), 1.8 * px, 0, 6.28); g.stroke();
        for (const s of [-1, 1]) {
          const ez = cz + s * hl;
          g.strokeRect(X(cx - 2.45), Z(s < 0 ? ez : ez - 5.8), 4.9 * px, 5.8 * px);
          g.beginPath(); g.arc(X(cx), Z(ez - s * 1.575), 6.75 * px, s < 0 ? 0 : Math.PI, s < 0 ? Math.PI : 2 * Math.PI); g.stroke();
        }
      } else {
        const hd = 10.97 / 2, hs = 8.23 / 2, hl = 23.77 / 2, sv = 6.4;
        g.strokeRect(X(cx - hd), Z(cz - hl), 2 * hd * px, 2 * hl * px);
        for (const s of [-1, 1]) {
          g.beginPath(); g.moveTo(X(cx + s * hs), Z(cz - hl)); g.lineTo(X(cx + s * hs), Z(cz + hl)); g.stroke();
          g.beginPath(); g.moveTo(X(cx - hs), Z(cz + s * sv)); g.lineTo(X(cx + hs), Z(cz + s * sv)); g.stroke();
        }
        g.beginPath(); g.moveTo(X(cx), Z(cz - sv)); g.lineTo(X(cx), Z(cz + sv)); g.stroke();
      }
    }
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 8;
  return t;
}
/** welded mesh (the turf's fence: rectangular, photos 26, 33) or chain-link diamonds (the courts, photo 23) */
function meshTexture(welded: boolean) {
  const t = canvas(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.strokeStyle = 'rgba(140,146,150,0.95)'; g.lineWidth = welded ? 2 : 2.2;
    if (welded) { g.strokeRect(0, 0, 64, 64); g.beginPath(); g.moveTo(32, 0); g.lineTo(32, 64); g.stroke(); }
    else for (const o of [-64, 0, 64]) { g.beginPath(); g.moveTo(o, 0); g.lineTo(o + 64, 64); g.stroke(); g.beginPath(); g.moveTo(o + 64, 0); g.lineTo(o, 64); g.stroke(); }
  });
  t.anisotropy = 4;
  return t;
}
const meshMat = (welded: boolean) => new THREE.MeshStandardMaterial({ map: meshTexture(welded), transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: 0.6, metalness: 0.3, alphaTest: 0.04 });

/** a fence round a rectangle (or along given runs): posts every `bay` metres, top and bottom rails, the mesh, solids */
function fence(k: Kit, runs: [number, number, number, number][], h: number, bay: number, welded: boolean, metal: Part[]) {
  const panels: THREE.BufferGeometry[] = [];
  for (const [ax, az, bxw, bz] of runs) {
    const len = Math.hypot(bxw - ax, bz - az), n = Math.max(1, Math.round(len / bay));
    for (let i = 0; i <= n; i++) {
      const x = ax + ((bxw - ax) * i) / n, z = az + ((bz - az) * i) / n;
      metal.push([rod(V(x, 0, z), V(x, h + 0.05, z), 0.07), POST]);
      SOLIDS.add(x, z, 0.12);
    }
    metal.push([rod(V(ax, h, az), V(bxw, h, bz), 0.045), POST]);
    metal.push([rod(V(ax, 0.1, az), V(bxw, 0.1, bz), 0.03), POST]);
    panels.push(panel(ax, az, bxw, bz, 0.04, h, welded ? 0.25 : 0.1));
    wallSolids(ax, az, bxw, bz, 0.25);
  }
  const m = new THREE.Mesh(mergeAll(panels), meshMat(welded)); m.renderOrder = 2;
  k.meshes.push(m);
}
const ring = ([x0, x1, z0, z1]: R4): [number, number, number, number][] => [[x0, z0, x1, z0], [x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0]];

/** a floodlight mast at (x, z): a grey pole, a dark frame of lamps turned toward (tx, tz) */
function mast(metal: Part[], x: number, z: number, h: number, tx: number, tz: number) {
  metal.push([new THREE.CylinderGeometry(0.16, 0.28, h, 8).translate(L(x), h / 2, M(z)), '#a9adb1']);
  const yaw = Math.atan2(tx - x, tz - z);
  const head = (g: THREE.BufferGeometry) => g.rotateX(-0.35).rotateY(yaw).translate(L(x), h + 0.6, M(z));
  metal.push([head(new THREE.BoxGeometry(2.8, 1.5, 0.25)), '#4a4e52']);
  for (let r = 0; r < 2; r++) for (let q = 0; q < 4; q++) metal.push([head(new THREE.BoxGeometry(0.55, 0.5, 0.1).translate(-1.05 + q * 0.7, -0.35 + r * 0.7, 0.15)), '#eef0f2']);
  SOLIDS.add(x, z, 0.35);
}
/** goal posts and crossbar on the line at z, centred on x, facing the pitch */
function goal(metal: Part[], x: number, z: number, s: number) {
  for (const dx of [-3.66, 3.66]) metal.push([new THREE.CylinderGeometry(0.06, 0.06, 2.44, 8).translate(L(x + dx), 1.22, M(z)), '#f4f4f2']);
  metal.push([new THREE.CylinderGeometry(0.06, 0.06, 7.32, 8).rotateZ(Math.PI / 2).translate(L(x), 2.44, M(z)), '#f4f4f2']);
  // the frame behind the net
  for (const dx of [-3.66, 3.66]) metal.push([rod(V(x + dx, 2.44, z), V(x + dx, 0.05, z - s * 1.8), 0.04), '#d9dbdc']);
  metal.push([rod(V(x - 3.66, 0.05, z - s * 1.8), V(x + 3.66, 0.05, z - s * 1.8), 0.04), '#d9dbdc']);
}

// ---------- facades ----------
const blueWin = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = '#f4f5f5'; g.fillRect(x - 5, y - 5, w + 10, h + 10);
  const gl = g.createLinearGradient(0, y, 0, y + h);
  gl.addColorStop(0, '#7fb2e8'); gl.addColorStop(0.45, '#2f6cc0'); gl.addColorStop(1, '#1d4a8c');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = '#eef0f1'; g.fillRect(x + w / 2 - 2, y, 4, h); g.fillRect(x, y + h * 0.3, w, 4);
};
/** white walls, a wide blue window to a bay, a pale slab band each storey */
const BLUE_FACE: Style = {
  bay: 3.4, up: [[40, 60, 176, 130]], ground: [[40, 256 + 60, 176, 130]],
  draw: (g) => { render(g, '#f6f6f3'); for (const y0 of [0, 256]) { g.fillStyle = '#e3e3df'; g.fillRect(0, y0 + 236, 256, 20); blueWin(g, 40, y0 + 60, 176, 130); } },
};
/** the six-storey block: a white frame, curved fins between the bays (shaded as a concave face), blue windows */
const FIN_FACE: Style = {
  bay: 4.2, up: [[56, 70, 144, 120]], ground: [[56, 256 + 70, 144, 120]],
  draw: (g) => {
    render(g, '#f4f4f1');
    for (const y0 of [0, 256]) {
      for (const [x, d] of [[0, 1], [256, -1]] as const) {
        const gr = g.createLinearGradient(x, 0, x + d * 44, 0);
        gr.addColorStop(0, '#f8f8f6'); gr.addColorStop(0.6, '#d7d8d6'); gr.addColorStop(1, '#eeeeec');
        g.fillStyle = gr; g.fillRect(Math.min(x, x + d * 44), y0, 44, 256);
      }
      g.fillStyle = '#e0e0dc'; g.fillRect(0, y0 + 232, 256, 24);
      blueWin(g, 56, y0 + 70, 144, 120);
    }
  },
};
/** the PCU building's upper floor: blue windows in white */
const PCU_FACE: Style = BLUE_FACE;
/** its top storey: the dark grey band of glazing under the name (IMG_9677j 46 s) */
const PCU_BAND: Style = {
  bay: 3.8, up: [], ground: [],
  draw: (g) => { for (const y0 of [0, 256]) { g.fillStyle = '#f2f2ef'; g.fillRect(0, y0, 256, 256); g.fillStyle = '#3b4148'; g.fillRect(0, y0 + 60, 256, 120); g.fillStyle = '#555c64'; g.fillRect(0, y0 + 60, 256, 6); } },
};
/** its ground floor behind the colonnade: dark glazing, doors */
const PCU_GROUND: Style = {
  bay: 3.8, up: [[20, 30, 216, 210]], ground: [[20, 256 + 30, 216, 210]],
  draw: (g) => { render(g, '#eeeeeb'); for (const y0 of [0, 256]) { g.fillStyle = '#28323d'; g.fillRect(20, y0 + 30, 216, 210); g.fillStyle = '#c9ccce'; g.fillRect(126, y0 + 30, 4, 210); } },
};

// ---------- the specs ----------
const [tx0, tx1, tz0, tz1] = TURF.turf, e = TURF.edge, fo = e + TURF.fence.off;
const F: R4 = [tx0 - fo, tx1 + fo, tz0 - fo, tz1 + fo];
const turfSpec: Spec = {
  name: 'Rev. J. K. Antwi Astro Turf', axis: [1, 0], origin: O, storey: 3.4, style: BLUE_FACE, roofColor: '#d8d8d3', fascia: '#eeeeea', pitch: 0,
  blocks: [{ x0: L(STAND.x0), x1: L(STAND.x1), z0: M(STAND.pav[0]), z1: M(STAND.pav[1]), floors: 2, roof: 'flat' }],
  keep: [[L(F[0]) - 1, L(F[1]) + 1, M(F[2]) - 1, M(F[3]) + 1], [L(STAND.x0), L(STAND.x1), M(STAND.z0), M(STAND.z1)]],
  extras: (k: Kit) => {
    surface(k, [tx0 - e, tx1 + e, tz0 - e, tz1 + e], 0.05, turfTexture());
    const metal: Part[] = [];
    fence(k, ring(F), TURF.fence.h, TURF.fence.bay, true, metal);
    // a low concrete upstand under the fence (photos 17, 28, 29)
    for (const [ax, az, bxw, bz] of ring(F)) metal.push([bx(Math.min(ax, bxw) - 0.12, Math.max(ax, bxw) + 0.12, 0, 0.35, Math.min(az, bz) - 0.12, Math.max(az, bz) + 0.12), '#c9c6bf']);
    const cx = (tx0 + tx1) / 2;
    goal(metal, cx, tz0 + FIELD.inset, -1);
    goal(metal, cx, tz1 - FIELD.inset, 1);
    // floodlight masts: the four corners and two along the east walk
    const cz = (tz0 + tz1) / 2;
    for (const [x, z] of [[F[0] - 1.2, F[2] - 1.2], [F[1] + 1.2, F[2] - 1.2], [F[0] - 1.2, F[3] + 1.2], [F[1] + 1.2, F[3] + 1.2], [F[1] + 1.2, cz - 25], [F[1] + 1.2, cz + 25]] as [number, number][]) mast(metal, x, z, TURF.mastH, cx, cz);
    // the stand: tiers of seats stepping up westward from the fence, rows of blue and white, a back wall, either side of
    // the pavilion
    const { x0, x1, z0, z1, tiers, rise, pav } = STAND, tread = (x1 - x0 - 0.3) / tiers;
    for (const [a, b] of [[z0, pav[0]], [pav[1], z1]] as [number, number][]) {
      for (let t = 0; t < tiers; t++) {
        const xa = x1 - (t + 1) * tread, xb = x1 - t * tread, y = (t + 1) * rise;
        metal.push([bx(xa, xb, 0, y - 0.12, a, b), '#cfccc4']);
        metal.push([bx(xa + 0.1, xb - 0.2, y - 0.12, y + 0.05, a + 0.2, b - 0.2), t % 2 ? SEAT_W : SEAT_B]);
      }
      metal.push([bx(x0, x0 + 0.3, 0, tiers * rise + 1.1, a, b), '#ecebe6']);
      for (const z of [a, b]) metal.push([bx(x0, x1, 0, tiers * rise + 1.1, z - 0.12, z + 0.12), '#ecebe6']);
      wallSolids(x0 + 0.15, a, x0 + 0.15, b, 0.3);
    }
    k.plain.push(...metal);
  },
};

const NWC = COURTS_NW, TWC = COURT_TOWER;
const courtsSpec: Spec = {
  name: 'UPSA hard courts', axis: [1, 0], origin: O, storey: 3.4, style: BLUE_FACE, roofColor: '#d8d8d3', fascia: '#eeeeea', pitch: 0,
  blocks: [],
  // the mapped pitches drawn as grass stripes here
  covers: [[2175, -1160], [2177, -1120], [2177, -959]],
  keep: [[L(NWC.outer[0]) - 1, L(NWC.outer[1]) + 1, M(NWC.outer[2]) - 1, M(NWC.outer[3]) + 1], [L(TWC.outer[0]) - 1, L(TWC.outer[1]) + 1, M(TWC.outer[2]) - 1, M(TWC.outer[3]) + 1]],
  extras: (k: Kit) => {
    surface(k, NWC.outer, 0.05, courtsTexture(NWC.outer, [...NWC.north.map((r) => ({ r, kind: 'basket' as const, col: '#3f8a5a' })), ...NWC.south.map((r) => ({ r, kind: 'tennis' as const, col: '#4a9566' }))]));
    surface(k, TWC.outer, 0.05, courtsTexture(TWC.outer, [{ r: TWC.court, kind: 'tennis', col: '#3a8f86' }]));
    const metal: Part[] = [];
    fence(k, [...ring(NWC.outer), [NWC.outer[0], NWC.midZ, NWC.outer[1], NWC.midZ]], NWC.fenceH, 3, false, metal);
    fence(k, ring(TWC.outer), TWC.fenceH, 3, false, metal);
    // basketball posts at both ends of the north courts: a grey pole, a white board, an orange ring
    for (const [a0, a1, b0, b1] of NWC.north) {
      const cx = (a0 + a1) / 2;
      for (const [z, s] of [[b0, 1], [b1, -1]] as [number, number][]) {
        metal.push([new THREE.CylinderGeometry(0.09, 0.11, 3.4, 8).translate(L(cx), 1.7, M(z - s * 0.6)), '#2c4f86']);
        metal.push([rod(V(cx, 3.2, z - s * 0.6), V(cx, 3.2, z + s * 0.9), 0.08), '#2c4f86']);
        metal.push([bx(cx - 0.9, cx + 0.9, 2.9, 3.95, z + s * 0.9 - 0.03, z + s * 0.9 + 0.03), '#f2f2f0']);
        metal.push([new THREE.TorusGeometry(0.23, 0.02, 4, 12).rotateX(Math.PI / 2).translate(L(cx), 3.05, M(z + s * 1.25)), '#e2672a']);
        SOLIDS.add(cx, z - s * 0.6, 0.2);
      }
    }
    // tennis nets: posts and a dark band (the south courts and the tower court)
    for (const [a0, a1, b0, b1] of [...NWC.south, TWC.court]) {
      const along = a1 - a0 > b1 - b0, cx = (a0 + a1) / 2, cz = (b0 + b1) / 2, hw = 10.97 / 2 + 0.9;
      const [p, q] = along ? [[cx, cz - hw], [cx, cz + hw]] : [[cx - hw, cz], [cx + hw, cz]];
      for (const [x, z] of [p, q]) metal.push([new THREE.CylinderGeometry(0.05, 0.05, 1.07, 6).translate(L(x), 0.53, M(z)), '#3a4a3a']);
      metal.push([along ? bx(cx - 0.01, cx + 0.01, 0.05, 0.95, cz - hw, cz + hw) : bx(cx - hw, cx + hw, 0.05, 0.95, cz - 0.01, cz + 0.01), '#2a2f2c']);
      metal.push([along ? bx(cx - 0.03, cx + 0.03, 0.9, 0.99, cz - hw, cz + hw) : bx(cx - hw, cx + hw, 0.9, 0.99, cz - 0.03, cz + 0.03), '#f1f1ec']);
    }
    k.plain.push(...metal);
  },
};

/** the Professional Christian Union Building: a long white block, the colonnade along the south face, the glass bay */
const PO: [number, number] = [(PCU.x0 + PCU.x1) / 2, (PCU.z0 + PCU.z1) / 2];
const pl = (x: number) => x - PO[0], pm = (z: number) => z - PO[1];
const pcuSpec: Spec = {
  name: 'Professional Christian Union Building', axis: [1, 0], origin: PO, storey: PCU.storey, style: PCU_FACE, roofColor: '#d9d8d3', fascia: '#eeeeea', pitch: 0,
  blocks: [{ x0: pl(PCU.x0), x1: pl(PCU.x1 - PCU.bay), z0: pm(PCU.z0), z1: pm(PCU.z1), floors: PCU.floors, roof: 'flat', floorStyle: { 0: PCU_GROUND, 2: PCU_BAND } }],
  keep: [[pl(PCU.x0), pl(PCU.x1), pm(PCU.z0), pm(PCU.z1) + 2.6]],
  extras: (k: Kit) => {
    const top = PCU.floors * PCU.storey + 0.5, zf = pm(PCU.z1), xb = pl(PCU.x1 - PCU.bay), xe = pl(PCU.x1);
    // the blue glass bay at the east end, full height, a white frame round it
    const blue = new THREE.Mesh(new THREE.BoxGeometry(xe - xb, top + 1.2, PCU.z1 - PCU.z0).translate((xb + xe) / 2, (top + 1.2) / 2, 0), new THREE.MeshStandardMaterial({ color: '#2d63b5', roughness: 0.15, metalness: 0.45 }));
    blue.castShadow = blue.receiveShadow = true;
    k.meshes.push(blue);
    // its mullions and floor lines on the south face
    for (let x = xb + 1.5; x < xe - 0.5; x += 1.5) k.plain.push([new THREE.BoxGeometry(0.08, top + 1.0, 0.06).translate(x, (top + 1.2) / 2, zf + 0.03), '#9fb6d4']);
    for (let y = PCU.storey; y < top; y += PCU.storey) k.plain.push([new THREE.BoxGeometry(xe - xb, 0.12, 0.06).translate((xb + xe) / 2, y, zf + 0.03), '#9fb6d4']);
    k.plain.push([new THREE.BoxGeometry(0.5, top + 1.4, 0.5).translate(xb, (top + 1.4) / 2, zf), '#f2f2ee']);
    k.plain.push([new THREE.BoxGeometry(0.5, top + 1.4, 0.5).translate(xe, (top + 1.4) / 2, zf), '#f2f2ee']);
    // the canopy over the colonnade at the first floor, and the raking navy columns in pairs under it
    const yc = PCU.storey;
    k.plain.push([new THREE.BoxGeometry(xb - pl(PCU.x0), 0.35, 2.4).translate((pl(PCU.x0) + xb) / 2, yc + 0.17, zf + 1.2), '#f2f2ee']);
    for (let x = pl(PCU.x0) + 3.5; x < xb - 2; x += 6.2) {
      for (const s of [-1, 1]) k.plain.push([rod(new THREE.Vector3(x + s * 1.1, 0, zf + 2.1), new THREE.Vector3(x + s * 0.25, yc, zf + 1.9), 0.32), NAVY]);
      SOLIDS.add(PO[0] + x - 1.1, PO[1] + zf + 2.1, 0.25); SOLIDS.add(PO[0] + x + 1.1, PO[1] + zf + 2.1, 0.25);
    }
    // the name along the top storey (IMG_9677j 20-46 s; the Annual Report 2024 photograph)
    k.signs.push({ text: 'PROFESSIONAL CHRISTIAN UNION BUILDING', x: (pl(PCU.x0) + xb) / 2, y: top - 0.2, z: zf + 0.08, ry: 0, w: 30, colors: ['#f2f2ef', '#1f3f8a'] });
  },
};

const blockSpec = (name: string, r: { x0: number; x1: number; z0: number; z1: number; floors: number }, style: Style, roof: 'flat' | 'hip', roofColor: string, pitch: number): Spec => {
  const o: [number, number] = [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2];
  return {
    name, axis: [1, 0], origin: o, storey: 3.4, style, roofColor, fascia: '#eeeeea', pitch,
    blocks: [{ x0: r.x0 - o[0], x1: r.x1 - o[0], z0: r.z0 - o[1], z1: r.z1 - o[1], floors: r.floors, roof }],
    keep: [[r.x0 - o[0] - 1, r.x1 - o[0] + 1, r.z0 - o[1] - 1, r.z1 - o[1] + 1]],
    extras: () => {},
  };
};
// the six-storey block replaces the mapped outline south of it (osm:way/1009392430), which the aerial shows as its own
// south part and the courts' corner
const wuSpec: Spec = { ...blockSpec('UPSA block north of the hard courts', WU, FIN_FACE, 'flat', '#d6d6d1', 0), replaces: [[2151, -1205]] };
const greySpec = blockSpec('UPSA low block south of the hard courts', GREY, BLUE_FACE, 'hip', '#b9bec2', 0.12);
const slateSpec = blockSpec('UPSA slate-roofed block', SLATE, BLUE_FACE, 'hip', '#4d5966', 0.32);

/** the round fountain in the courtyard: a low white rim, water, a jet */
const fountainSpec: Spec = {
  name: 'UPSA courtyard fountain', axis: [1, 0], origin: [FOUNTAIN.x, FOUNTAIN.z], storey: 3, style: BLUE_FACE, roofColor: '#d8d8d3', fascia: '#eeeeea', pitch: 0,
  blocks: [],
  keep: [[-FOUNTAIN.r - 1, FOUNTAIN.r + 1, -FOUNTAIN.r - 1, FOUNTAIN.r + 1]],
  extras: (k: Kit) => {
    k.plain.push([new THREE.CylinderGeometry(FOUNTAIN.r, FOUNTAIN.r + 0.1, 0.55, 28, 1, true), '#e7e4dc']);
    k.plain.push([new THREE.TorusGeometry(FOUNTAIN.r, 0.16, 6, 28).rotateX(Math.PI / 2).translate(0, 0.55, 0), '#f0eee8']);
    k.plain.push([new THREE.CylinderGeometry(0.35, 0.5, 1.1, 10).translate(0, 0.55, 0), '#e7e4dc']);
    const w = new THREE.Mesh(new THREE.CircleGeometry(FOUNTAIN.r - 0.1, 28).rotateX(-Math.PI / 2).translate(0, 0.4, 0), waterMat());
    w.userData.noCollide = true;
    k.meshes.push(w);
    SOLIDS.add(FOUNTAIN.x, FOUNTAIN.z, FOUNTAIN.r);
  },
};

export const upsaWestSite = createSite('upsa-west', [turfSpec, courtsSpec, pcuSpec, wuSpec, greySpec, slateSpec, fountainSpec]);
