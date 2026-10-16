// The N4 from the Legon overhead to Okponglo, rebuilt to the owner's Legon overhead to Okponglo correction brief
// (Pairs 1-16, the annotated aerials A01-A04; numbers in lfplan.ts, the raised ground in relief.ts, evidence in
// docs/legon-first-total/evidence-audit.md). East of the N4, north to south:
// - the trading corner at the side lane's mouth and the kiosk line along the east service road (Pairs 1-3): the curved
//   kerb and brick corner with its short striped posts, the umbrellas, canopy stalls and kiosks on bare red earth, the
//   light poster shop, the dark green kiosk, the long low shelter, the tall narrow board; the low shops north of the lane;
// - the Legon 1st frame over the rough open plot, the drain grate (Pair 4);
// - the TotalEnergies station (Pairs 5-8, 10): the open canopy and its pumps, the low grey takeaway building with its
//   CHICKEN MAN, pinkberry and DRIVE THRU fascia and its air-conditioning units, the service strip's open bays, the
//   forecourt, the access with its grass islands, striped posts, no-entry discs and STOP, the price pylon and the
//   restaurant pylons; Family Health beside it;
// - the raised plot behind its stained wall (Pairs 9, 15, 16): the small white building with the peeling red fascia,
//   the unfinished concrete frame, the empty blue billboard skeleton and the red frame, the access with its railing;
// - the corridor south (Pairs 11-14): the low concrete divider, the grass strip and its lamps, the long panelled
//   retaining wall and the wooded ground over it, the tiers and the two small red-roof structures, the dense scrub and
//   the lattice tower on the east, the planted separation of young trees and shrubs.
// Names and lettering are only what the photographs show legibly; the price display is the photograph's (editable).
import { dustySoil, onHardscape, ramp, soilMesh } from './soilground';
import * as THREE from 'three';
import { createSite, render, type Spec, type Style } from './blocks';
import { box, merge, type Part } from './modelkit';
import { NODE_XZ, ROADS } from './campusmap';
import { SOLIDS } from './solids';
import { Bag, hash, tuft, vnoise, wallSolids } from './enkit';
import { broadleaf } from './nsiaroad';
import { christmasPalm, drapeAt, groundCover } from './kuffourgarden';
import { groundHeight as gh } from './relief';
import { rod, run, latticeTower, type V3 } from './upsa';
import { concrete } from './concrete';
import { Pics, board, compactTree, pic, shrub, text, win } from './okponglo';
import { brick, divider, edges, hFrame, kerbLine, offLine, postBoard, ribbon, sane, spans, stall, streetLight, stripedPost, utilityPole } from './roadkit';
import {
  CORNER, DIVIDER, EAST_SCRUB, ESVC, LEGON1ST, LF_KEEP, N4_HALF, NB, OPEN_OUTLINES, PLANTED, PLOT, POLE_BOARD, RWALL, SB, SHELTER,
  SIDE_LANE_Z, STALLS, STATION, SVC_HALF, TALL_BOARD, TIER_HOUSES, TOWERS, WSVC, eastEdge, tierBack, eastKerb, westKerb, xAt, type Box, type P2,
} from './lfplan';

/** the mapped roads and paths near this work (their half widths), so plants, posts and walls keep off them */
const SEGS: [number, number, number, number, number][] = [];
for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++) {
  const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
  if (Math.max(ax, bx) < 760 || Math.min(ax, bx) > 1010 || Math.max(az, bz) < 130 || Math.min(az, bz) > 880) continue;
  SEGS.push([ax, az, bx, bz, [9, 7.4, 6.2, 4.6, 2.6][r.cls] / 2]);
}
const nearRoad = (x: number, z: number, pad: number) => SEGS.some(([ax, az, bx, bz, h]) => {
  const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(ax + dx * t - x, az + dz * t - z) < h + pad;
});
/** the stretches of a west-east line at z between x0 and x1 that keep clear of the mapped roads (a wall left open where
 *  a road passes through it) */
const clearRuns = (x0: number, x1: number, z: number, pad: number) => {
  const out: [number, number][] = []; let a = NaN;
  for (let x = x0; x <= x1 + 1e-6; x += 0.25) {
    const ok = !nearRoad(x, z, pad);
    if (ok && Number.isNaN(a)) a = x;
    if ((!ok || x + 0.25 > x1 + 1e-6) && !Number.isNaN(a)) { const b = ok ? x : x - 0.25; if (b - a > 0.6) out.push([a, b]); a = NaN; }
  }
  return out;
};

const drapeMesh = (g: THREE.BufferGeometry) => Object.assign(new THREE.Mesh(g, groundCover()), { receiveShadow: true, userData: { noCollide: true } });
const st = (bay: number, draw: (g: CanvasRenderingContext2D) => void): Style => ({ bay, up: [], ground: [], draw });
const PLAIN = st(3, (g) => render(g, '#ddd'));
const earth = (x: number, z: number): [number, number, number] => { const m = vnoise(x * 1.1, z * 1.1), n = vnoise(x * 0.2, z * 0.2); return n > 0.62 ? [0.48 + m * 0.05, 0.45 + m * 0.04, 0.3] : [0.62 + m * 0.07, 0.42 + m * 0.05, 0.3 + m * 0.03]; };
const worn = (x: number, z: number): [number, number, number] => { const m = vnoise(x * 0.7, z * 0.7), s = vnoise(x * 0.15, z * 0.15); const v = 0.58 + m * 0.08 - (s > 0.7 ? 0.08 : 0); return [v + 0.02, v, v - 0.03]; };
/** the scrub's floor: exposed soil coverage, bare in broad worn patches (soilground.ts) */
const scrubSoil = (x: number, z: number) => ramp(0.46, 0.64, vnoise(x * 0.25, z * 0.3));
const scrubGround = (x: number, z: number): [number, number, number] => { const m = vnoise(x * 0.9, z * 0.9), n = vnoise(x * 0.25, z * 0.3); return n > 0.6 ? [0.58 + m * 0.06, 0.43 + m * 0.04, 0.3] : n > 0.45 ? [0.5 + m * 0.06, 0.5 + m * 0.05, 0.32] : [0.36 + m * 0.06, 0.45 + m * 0.06, 0.24]; };

// ---------- pictures ----------
const POSTERS = () => pic('lfPosters', 256, 128, (g) => {
  g.fillStyle = '#e8e2d4'; g.fillRect(0, 0, 256, 128);
  const cols = ['#c8352b', '#1f5fae', '#e7c21f', '#2e8b4a', '#f2f2ee', '#7a3f9a', '#e86a2c'];
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) { g.fillStyle = cols[(r() * cols.length) | 0]; const x = r() * 236, y = r() * 100; g.fillRect(x, y, 18 + r() * 26, 20 + r() * 26); g.fillStyle = 'rgba(30,30,30,0.6)'; g.fillRect(x + 3, y + 4, 12, 3); }
});
const LEGON1ST_PANEL = () => board('legon1st', 256, 80, (g, w, h) => { g.fillStyle = '#e9e7df'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2a2a'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4); text(g, 'Legon 1st', w / 2, h / 2 + 2, 34, '#2a2a2a', 700); });
const STOP_MARK = () => pic('lfStop', 256, 96, (g) => { g.clearRect(0, 0, 256, 96); g.font = '800 78px Sora, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(235,235,230,0.72)'; g.fillText('STOP', 128, 52); g.fillStyle = 'rgba(80,80,80,0.5)'; for (let i = 0; i < 60; i++) g.fillRect((i * 37) % 256, (i * 23) % 96, 6, 3); }, { transparent: true });
const NO_ENTRY = () => board('noEntry', 64, 64, (g, w) => { g.clearRect(0, 0, w, w); g.fillStyle = '#d0201c'; g.beginPath(); g.arc(32, 32, 30, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.fillRect(10, 26, 44, 12); });
const PRICE_FACE = () => board('totalPrices', 96, 384, (g, w, h) => {
  g.fillStyle = '#f4f5f6'; g.fillRect(0, 0, w, h);
  // the brand's circle of colours and the name
  const ring = ['#e4002b', '#f7a600', '#2c9c3a', '#1d63b4', '#8a2a8f'];
  ring.forEach((col, i) => { g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.arc(w / 2, 46, 26 - i * 0.5, (i / 5) * Math.PI * 2, ((i + 1) / 5) * Math.PI * 2 + 0.2); g.stroke(); });
  text(g, 'TotalEnergies', w / 2, 96, 12, '#e4002b', 800);
  g.fillStyle = '#1d3f8a'; g.fillRect(8, 116, w - 16, 132);
  STATION.prices.forEach((p, i) => text(g, p, w / 2, 140 + i * 40, 26, '#ffffff', 700, 'center', 'monospace'));
  g.fillStyle = '#e4002b'; g.fillRect(8, 262, w - 16, 26); text(g, 'excellium', w / 2, 275, 13, '#fff', 700);
  g.fillStyle = '#2c9c3a'; g.fillRect(8, 296, w - 16, 26); text(g, 'Quartz', w / 2, 309, 13, '#fff', 700);
  g.fillStyle = '#d7d9dc'; g.fillRect(8, 330, w - 16, 44);
});
const CHICKEN_FACE = () => board('chickenPylon', 64, 320, (g, w, h) => {
  g.fillStyle = '#d6201f'; g.fillRect(0, 0, w, h);
  g.save(); g.translate(w / 2, h / 2); g.rotate(-Math.PI / 2); text(g, 'CHICKEN MAN', 0, 0, 30, '#ffd23a', 900); g.restore();
});
const PIZZA_FACE = () => board('pizzaPylon', 64, 256, (g, w, h) => {
  g.fillStyle = '#2f8a3a'; g.fillRect(0, 0, w, h);
  g.save(); g.translate(w / 2, h / 2); g.rotate(-Math.PI / 2); text(g, 'pinkberry', 0, 0, 30, '#ffffff', 800); g.restore();
});
const PIZZA_DISC = () => board('pizzaDisc', 96, 96, (g, w) => { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(w / 2, w / 2, 46, 0, Math.PI * 2); g.fill(); g.fillStyle = '#d6201f'; g.beginPath(); g.arc(w / 2, w / 2, 38, 0, Math.PI * 2); g.fill(); g.fillStyle = '#f2c23a'; g.beginPath(); g.moveTo(48, 20); g.lineTo(76, 70); g.lineTo(20, 70); g.closePath(); g.fill(); text(g, 'PIZZA', w / 2, 82, 11, '#fff', 800); });
/** the takeaway's west fascia: CHICKEN MAN on red, pinkberry on green, DRIVE THRU on red, white between (Pair 6) */
const TAKE_FASCIA = () => board('takeFascia', 512, 48, (g, w, h) => {
  g.fillStyle = '#f3f3f1'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#d6201f'; g.fillRect(70, 6, 120, 36); text(g, 'CHICKEN MAN', 130, 24, 17, '#ffd23a', 900);
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(40, 24, 20, 0, Math.PI * 2); g.fill(); g.fillStyle = '#d6201f'; g.beginPath(); g.arc(40, 24, 15, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3f9a42'; g.fillRect(212, 8, 110, 32); text(g, 'pinkberry', 267, 24, 17, '#ffffff', 800);
  g.fillStyle = '#d6201f'; g.fillRect(346, 8, 120, 32); text(g, 'DRIVE THRU', 406, 24, 16, '#ffffff', 900);
});
/** the takeaway's south shopfront fascia: the pizza logo, pinkberry, bonjour (Pair 7) */
const SOUTH_FASCIA = () => board('takeSouth', 512, 48, (g, w, h) => {
  g.fillStyle = '#f3f3f1'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#d6201f'; g.beginPath(); g.arc(30, 24, 18, 0, Math.PI * 2); g.fill(); text(g, 'PIZZA', 30, 25, 9, '#fff', 800);
  g.fillStyle = '#3f9a42'; g.fillRect(70, 10, 100, 28); text(g, 'pinkberry', 120, 24, 15, '#fff', 800);
  g.fillStyle = '#ffffff'; g.fillRect(330, 10, 100, 28); text(g, 'bonjour', 380, 24, 17, '#e4002b', 800);
});
/** the service strip's fascia boards: QUARTZ, auto service, a yellow board whose wording is not legible (left plain),
 *  wash (Pairs 6, 7) */
const STRIP_FASCIA = () => board('stripFascia', 1024, 48, (g, w, h) => {
  g.fillStyle = '#ecebe6'; g.fillRect(0, 0, w, h);
  text(g, 'QUARTZ', 70, 24, 20, '#c58b16', 900); text(g, 'auto service', 200, 24, 18, '#2a3a5a', 700);
  g.fillStyle = '#f2b614'; g.fillRect(320, 6, 230, 36); g.fillStyle = '#c0261e'; g.fillRect(330, 14, 200, 8); g.fillRect(330, 28, 140, 6);
  text(g, 'wash', 760, 24, 22, '#1f4fa0', 800);
});
const TOTAL_WORD = () => board('totalWord', 512, 64, (g, w, h) => { g.clearRect(0, 0, w, h); text(g, 'TotalEnergies', w / 2, h / 2 + 2, 52, '#e4002b', 900); });
const LEGON2 = () => board('legon2', 128, 32, (g, w, h) => { g.fillStyle = '#ecebe6'; g.fillRect(0, 0, w, h); text(g, 'LEGON 2', w / 2, h / 2 + 1, 18, '#3a3a3a', 700); });
const PANEL_WALL = () => pic('lfPanelWall', 256, 64, (g) => {
  // the long retaining face: large rectangular stone-like panels in courses, a band along the top, weathering (Pair 14)
  g.fillStyle = '#6c6255'; g.fillRect(0, 0, 256, 64);
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let row = 0; row < 3; row++) for (let x = -(row % 2) * 20; x < 256; x += 40) { const v = 168 + r() * 28 | 0; g.fillStyle = `rgb(${v + 10},${v},${v - 18})`; g.fillRect(x + 2, 12 + row * 17, 36, 15); }
  g.fillStyle = '#b9b0a0'; g.fillRect(0, 0, 256, 10); g.fillStyle = '#8c8272'; g.fillRect(0, 9, 256, 2);
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(70,55,40,${0.1 + r() * 0.2})`; g.fillRect(r() * 256, 10, 4 + r() * 12, 54); }
});
const STAINED = () => pic('lfStained', 256, 64, (g) => {
  // the raised plot's wall: plain concrete, stained and streaked, a joint every few metres (Pairs 9, 15)
  g.fillStyle = '#b5ad9e'; g.fillRect(0, 0, 256, 64);
  let s = 9; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '90,80,65' : '150,140,120'},${0.1 + r() * 0.25})`; g.fillRect(r() * 256, r() * 20, 3 + r() * 20, 20 + r() * 44); }
  g.fillStyle = '#6d665a'; for (let x = 0; x < 256; x += 64) g.fillRect(x, 0, 2, 64);
  g.fillStyle = 'rgba(60,70,40,0.35)'; g.fillRect(0, 54, 256, 10);
});

// ======================================================================================================
// the trading corner, the kiosk line, the Legon 1st plot
// ======================================================================================================
const NO: P2 = [840, 260];
const corner: Spec = {
  name: 'Legon First trading corner', axis: [1, 0], origin: NO, storey: 3, style: PLAIN, roofColor: '#888', fascia: '#888', pitch: 0.2,
  replaces: [[(SHELTER[0] + SHELTER[1]) / 2, (SHELTER[2] + SHELTER[3]) / 2]],
  blocks: [], keep: [], onGround: true,
  extras: (k) => {
    const c: Part[] = [], leaf: Part[] = [], wood: Part[] = [], b = new Bag(NO), P = new Pics(NO);
    const A = (x: number, z: number): [number, number] => [x - NO[0], z - NO[1]];
    const foot = CORNER.foot;
    // the brick footway along the east service road, its kerb; round the corner into the side lane
    const [fa, fb] = edges(ESVC, CORNER.z0 + CORNER.radius, CORNER.z1, SVC_HALF, SVC_HALF + foot);
    k.meshes.push(ribbon(NO, fa, fb, 0.12, brick()));
    kerbLine(c, NO, fa, 0.14);
    // the curved corner: a quarter round from the service road's kerb into the side lane's south kerb
    const cx = eastKerb(CORNER.z0 + CORNER.radius) + CORNER.radius, cz = SIDE_LANE_Z + 3.1 + CORNER.radius, arc: P2[] = [], arcOut: P2[] = [];
    for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * (Math.PI / 2); arc.push([cx + Math.cos(a) * CORNER.radius, cz + Math.sin(a) * CORNER.radius]); arcOut.push([cx + Math.cos(a) * (CORNER.radius - foot), cz + Math.sin(a) * (CORNER.radius - foot)]); }
    arc.reverse(); arcOut.reverse();
    k.meshes.push(ribbon(NO, arc, arcOut, 0.12, brick()));
    kerbLine(c, NO, arc, 0.14);
    // along the side lane's south kerb east to the back lane
    const laneA: P2[] = [], laneB: P2[] = [];
    for (let x = cx; x <= 829; x += 2) { laneA.push([x, SIDE_LANE_Z + 3.1]); laneB.push([x, SIDE_LANE_Z + 3.1 + foot]); }
    k.meshes.push(ribbon(NO, laneA, laneB, 0.12, brick()));
    kerbLine(c, NO, laneA, 0.14);
    // the short striped posts round the corner and along the start of the footway (Pairs 1, 2), the gaps to walk through
    for (let i = 0; i < CORNER.posts; i++) {
      const t = (i + 0.5) / CORNER.posts, a = Math.PI + t * (Math.PI / 2), r = CORNER.radius - 0.4;
      stripedPost(c, NO, cx + Math.cos(a) * r, cz + Math.sin(a) * r, { band: i % 3 ? '#3a3a3a' : '#c8261e' });
    }
    for (let z = CORNER.z0 + CORNER.radius + 3; z < CORNER.z0 + 30; z += 3.2) { const [x, zz] = offLine(ESVC, z, SVC_HALF + 0.35); stripedPost(c, NO, x, zz, { band: '#3a3a3a' }); }
    // the bare red earth behind the footway from the corner past the shelter, rough at its edges
    k.meshes.push(drapeMesh(drapeAt(NO, 812, 860, CORNER.z0, CORNER.z1 + 6, 0.8, 0.04, (x, z) => {
      const e = eastKerb(z) + foot, back = xAt([[824.0, 204.0], [834.7, 240.6], [841.1, 269.3], [847.4, 283.5], [852, 312]], z) - 2.3;
      if (x < e + 0.1 || x > back + 4 || z < SIDE_LANE_Z + 3.3 + foot) return null;
      return earth(x, z);
    })));
    // the stalls in their order along the frontage, their fronts to the road
    STALLS.forEach(([z, kind, w, d, h], i) => {
      const face = Math.atan2(0.18, -1); // west, a little south of west (square to the road)
      const [x, zz] = offLine(ESVC, z, SVC_HALF + foot + CORNER.strip[0] + d / 2 + (i % 3) * 0.6);
      stall(c, NO, kind, x, zz, face, w, d, h, i + 1, POSTERS(), (m, g) => P.add(m, g));
    });
    // a few stalls north of the side lane at the corner's west end (Pair 1, left)
    stall(c, NO, 'umbrella', 819.5, 199.0, Math.PI / 2, 2.8, 2.8, 2.5, 7);
    stall(c, NO, 'canopy', 824.5, 198.5, Math.PI / 2, 3.6, 3.0, 2.6, 8);
    k.meshes.push(drapeMesh(drapeAt(NO, 812, 836, 192, 202, 0.8, 0.04, (x, z) => (x > xAt(ESVC, z) + SVC_HALF + 0.5 ? earth(x, z) : null))));
    // the long low shelter on its outline: a shallow sheet roof on narrow supports, grilles between them (Pair 3)
    {
      const [x0, x1, z0, z1] = SHELTER, y = gh((x0 + x1) / 2, (z0 + z1) / 2), h = 2.7;
      const g = new THREE.BoxGeometry(x1 - x0 + 1.2, 0.1, z1 - z0 + 0.6).rotateZ(-0.05).translate((x0 + x1) / 2 - NO[0], y + h + 0.15, (z0 + z1) / 2 - NO[1]);
      c.push([g, '#8f969a']);
      for (let z = z0 + 0.4; z <= z1 - 0.3; z += 3.2) for (const x of [x0 + 0.3, x1 - 0.3]) { if (nearRoad(x, z, 0.2)) continue; c.push([box(x - 0.06 - NO[0], x + 0.06 - NO[0], y, y + h, z - 0.06 - NO[1], z + 0.06 - NO[1]), '#5f6366']); SOLIDS.add(x, z, 0.14); }
      // grilles along the back and the ends, open to the road
      // (the grille stops short where the back lane's end meets the shelter's corner, so the lane stays open)
      let gz0 = z0 + 0.4, gz1 = z1 - 0.4; while (gz0 < z1 - 1 && nearRoad(x1 - 0.3, gz0, 0.3)) gz0 += 0.35; while (gz1 > gz0 + 1 && nearRoad(x1 - 0.3, gz1, 0.3)) gz1 -= 0.35;
      for (let z = gz0; z < gz1; z += 0.35) c.push([box(x1 - 0.32 - NO[0], x1 - 0.28 - NO[0], y + 0.3, y + 2.3, z - 0.02 - NO[1], z + 0.02 - NO[1]), '#3e4144']);
      c.push([box(x1 - 0.35 - NO[0], x1 - 0.25 - NO[0], y + 2.3, y + 2.4, gz0 - NO[1], gz1 - NO[1]), '#3e4144']);
      wallSolids(x1 - 0.3, gz0, x1 - 0.3, gz1, 0.2);
      // counters inside
      for (let z = z0 + 2; z < z1 - 2; z += 5) c.push([box(x0 + 1.2 - NO[0], x0 + 2.2 - NO[0], y, y + 0.9, z - NO[1], z + 2.6 - NO[1]), '#8a6a48']);
    }
    // the tall narrow board with its red top on its single post (Pair 3); its face plain (no copy legible)
    {
      const [x, z] = offLine(ESVC, TALL_BOARD.z, SVC_HALF + TALL_BOARD.off), y = gh(x, z), [px, pz] = A(x, z);
      c.push([box(px - 0.08, px + 0.08, y, y + 3.0, pz - 0.08, pz + 0.08), '#6b6f72']);
      c.push([box(px - 0.1, px + 0.1, y + 3.0, y + 5.4, pz - 0.5, pz + 0.5), '#b9372d']);
      const g = new THREE.ConeGeometry(0.62, 0.9, 4).rotateY(Math.PI / 4).scale(0.2, 1, 1).translate(px, y + 5.85, pz);
      c.push([g, '#c8392d']);
      c.push([box(px - 0.12, px + 0.12, y + 3.3, y + 5.1, pz - 0.42, pz + 0.42), '#e9e4d6']);
      SOLIDS.add(x, z, 0.15);
    }
    // (north of the side lane is the police station compound, modelled with the 30-pair brief in roadside.ts: left as it is)
    // the mature leafy trees behind the trading line and round the parking (Pairs 1-3; the aerial's crowns)
    for (const [x, z, h, s] of [[862, 214, 7.5, 9], [876, 221, 8, 10], [886, 252, 7, 9], [879, 293, 7.5, 10], [890, 294, 7, 8], [851, 300, 6.5, 7]] as [number, number, number, number][]) if (!nearRoad(x, z, 1.2)) broadleaf(k, leaf, x, z, { h, spread: s, seed: x + z, origin: NO, round: true });

    // ---------- the Legon 1st frame and the open plot (Pair 4) ----------
    {
      const [x, z] = offLine(ESVC, LEGON1ST.z, SVC_HALF + LEGON1ST.off), y = gh(x, z), [px, pz] = A(x, z), L = LEGON1ST;
      // two dark posts, thin members round the empty rectangle, the small name panel at the top
      for (const s of [-L.w / 2, L.w / 2]) { c.push([box(px - 0.12, px + 0.12, y, y + L.h, pz + s - 0.12, pz + s + 0.12), '#2c2f33']); SOLIDS.add(x, z + s, 0.2); }
      for (const yy of [1.0, L.h - 0.9, L.h - 0.05]) c.push([box(px - 0.08, px + 0.08, y + yy - 0.08, y + yy, pz - L.w / 2, pz + L.w / 2), '#2c2f33']);
      c.push([box(px - 0.05, px + 0.05, y + L.h - 0.85, y + L.h - 0.1, pz - L.w / 2 + 0.1, pz + L.w / 2 - 0.1), '#3a3d41']);
      for (const s of [-1, 1]) P.wall(LEGON1ST_PANEL(), x + s * 0.06, z - s * (L.w / 2 - 0.2), x + s * 0.06, z + s * (L.w / 2 - 0.2), y + L.h - 0.82, y + L.h - 0.14, 1, 1, 0);
      // the rectangular drain grate at the kerb
      const [gx, gz] = offLine(ESVC, L.grate, SVC_HALF - 0.35), [qx, qz] = A(gx, gz), gy = gh(gx, gz);
      c.push([box(qx - 0.35, qx + 0.35, gy + 0.005, gy + 0.03, qz - 0.6, qz + 0.6), '#2a2b2c']);
      for (let i = -4; i <= 4; i++) c.push([box(qx - 0.33, qx + 0.33, gy + 0.03, gy + 0.045, qz + i * 0.13 - 0.03, qz + i * 0.13 + 0.03), '#4a4b4c']);
    }
    // the brick footway on along the plot, then the rough plot itself: scrub, bare earth, low plants
    const [pa, pb] = edges(ESVC, CORNER.z1, LEGON1ST.plot.z1, SVC_HALF, SVC_HALF + 2.2);
    k.meshes.push(ribbon(NO, pa, pb, 0.1, brick())); kerbLine(c, NO, pa, 0.13);
    const plotIn = (x: number, z: number) => z > LEGON1ST.plot.z0 && z < LEGON1ST.plot.z1 && x > eastKerb(z) + 2.6 && x < eastKerb(z) + LEGON1ST.plot.depth;
    k.meshes.push(drapeMesh(drapeAt(NO, 830, 910, LEGON1ST.plot.z0, LEGON1ST.plot.z1, 1.0, 0.04, (x, z) => (plotIn(x, z) ? scrubGround(x, z) : null))));
    for (let i = 0; i < 1400; i++) {
      const z = LEGON1ST.plot.z0 + 2 + hash(i, 0.31) * (LEGON1ST.plot.z1 - LEGON1ST.plot.z0 - 4), x = eastKerb(z) + 3.5 + hash(0.77, i) * (LEGON1ST.plot.depth - 5);
      if (!plotIn(x, z) || SOLIDS.at(x, z, 0.5) || nearRoad(x, z, 0.8)) continue;
      const r = hash(i, 4.1), y = gh(x, z);
      if (r < 0.62) tuft(b, x, z, 0.4 + hash(i, 5) * 0.8, ['#7d8a44', '#8d9450', '#a39a5a', '#6b7a3a', '#5f7a35'][i % 5], i + 9000);
      else if (r < 0.95) shrub(leaf, NO, x, z, y, 0.4 + hash(i, 6) * 0.9, i, ['#4e7a32', '#5b8438', '#3f6b2b', '#6a8a3e', '#7a8a40']);
      else compactTree(leaf, wood, NO, x, z, y, 2.4 + hash(i, 7) * 1.6, 1.8 + hash(i, 8) * 1.4, i);
    }
    const m = new THREE.Mesh(merge(sane([...c, ...wood], 'legon first')), concrete(0.25)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.leaf.push(...leaf);
    b.leaf = sane(b.leaf, 'legon first leaf'); b.c = sane(b.c, 'legon first'); k.plain.splice(0, k.plain.length, ...sane(k.plain, 'legon first plain'));
    b.finish(k, 0.25);
    P.finish(k);
  },
};

// ======================================================================================================
// the TotalEnergies station, Family Health, the raised plot
// ======================================================================================================
const SO: P2 = [905, 500];
const GREY = '#7d8084', PALE = '#ecebe6';
const TAKE_WALL: Style = st(3.2, (g) => {
  render(g, GREY);
  g.fillStyle = '#26292c'; g.fillRect(70, 300, 116, 110); g.fillStyle = '#3c4247'; g.fillRect(74, 304, 108, 50);
  g.fillStyle = '#5d6064'; g.fillRect(0, 490, 256, 22);
});
const STRIP_FRONT: Style = st(4.8, (g) => {
  render(g, '#e4e1d9');
  // a deep open bay between columns, its shadowed back
  g.fillStyle = '#2a2b2d'; g.fillRect(22, 280, 212, 232); g.fillStyle = '#3d3f42'; g.fillRect(40, 300, 176, 212);
  g.fillStyle = '#cfccc4'; g.fillRect(0, 256, 256, 24);
});
const STRIP_SIDE: Style = st(4, (g) => { render(g, '#e4e1d9'); g.fillStyle = '#b8b4ab'; g.fillRect(0, 490, 256, 22); });
const FH_WALL: Style = st(3.4, (g) => { render(g, '#efe7d4'); win(g, 70, 300, 116, 110, { frame: '#e8e4d8', panes: 3 }); g.fillStyle = '#cdbf9e'; g.fillRect(0, 490, 256, 22); });
const tk = STATION.takeaway, sp = STATION.strip;
const station: Spec = {
  name: 'TotalEnergies Legon 2', axis: [1, 0], origin: SO, storey: 3, style: TAKE_WALL, roofColor: '#9a9c9e', fascia: '#ecebe6', pitch: 0.15,
  replaces: [[(tk[0] + tk[1]) / 2, (tk[2] + tk[3]) / 2], [(sp[0] + sp[1]) / 2, (sp[2] + sp[3]) / 2], [919, 415], ...OPEN_OUTLINES, [(PLOT.white[0] + PLOT.white[1]) / 2, (PLOT.white[2] + PLOT.white[3]) / 2], [(PLOT.frame[0] + PLOT.frame[1]) / 2, (PLOT.frame[2] + PLOT.frame[3]) / 2]],
  onGround: true,
  blocks: [
    // the takeaway: one low grey storey, flat roof, the white fascia band
    { x0: tk[0] - SO[0], x1: tk[1] - SO[0], z0: tk[2] - SO[1], z1: tk[3] - SO[1], floors: 1, roof: 'flat', faces: {} },
    // the service strip: low and pale, its bays open to the forecourt (west)
    { x0: sp[0] - SO[0], x1: sp[1] - SO[0], z0: sp[2] - SO[1], z1: sp[3] - SO[1], floors: 1, roof: 'flat', faces: { x0: STRIP_FRONT, x1: STRIP_SIDE, z0: STRIP_SIDE, z1: STRIP_SIDE } },
    // Family Health: the large pale neighbour under its broad red roof (one tall storey; Pair 5)
    { x0: 892.4 - SO[0], x1: 946.5 - SO[0], z0: 399.8 - SO[1], z1: 430.3 - SO[1], floors: 1, roof: 'hip', roofColor: '#b0503c', pitch: 0.18, faces: { x0: FH_WALL, x1: FH_WALL, z0: FH_WALL, z1: FH_WALL } },
  ],
  keep: [],
  extras: (k) => {
    const c: Part[] = [], leaf: Part[] = [], wood: Part[] = [], b = new Bag(SO), P = new Pics(SO), fr: Part[] = [], tr: Part[] = [];
    const A = (x: number, z: number): [number, number] => [x - SO[0], z - SO[1]];
    const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(x0 - SO[0], x1 - SO[0], y0, y1, z0 - SO[1], z1 - SO[1]);
    const g0 = gh(900, 470);
    const [m0, m1] = STATION.mouth;
    const islandN = (x: number, z: number) => z > 431 && z < m0 - 0.5 && x > eastKerb(z) + 1.2 && x < 879 && Math.hypot(Math.max(0, x - 873), Math.max(0, 437 - z)) < 6.5;
    const islandS = (x: number, z: number) => z > m1 + 0.5 && z < 482 && x > eastKerb(z) + 1.2 && x < 879 && !(x > 874 && z < m1 + 5);
    // ---------- the forecourt: worn concrete, the grass islands at the access, the brick crossings ----------
    const [c0, c1, c2, c3] = STATION.court;
    k.meshes.push(drapeMesh(drapeAt(SO, c0 - 8, c1 + 4, c2, c3, 0.8, 0.035, (x, z) => {
      if (x < eastKerb(z) + 0.2) return null;
      if (islandN(x, z) || islandS(x, z)) return null;
      if (x > sp[0] - 0.2 && z > sp[2] && z < sp[3]) return null;
      return worn(x, z);
    })));
    // the grass islands at the access: the lawn's own ground, worn thin in spots (the owner's revised soil order)
    k.meshes.push(soilMesh(SO, c0 - 8, c1 + 4, c2, c3, 0.5, (x, z) => (islandN(x, z) || islandS(x, z) ? 0.1 + 0.6 * ramp(0.58, 0.74, vnoise(x * 0.5, z * 0.5)) : null)));
    // the islands' kerbs and the striped posts along their road edges (Pairs 5, 8, 10)
    for (const [z0, z1] of [[431.5, m0 - 0.5], [m1 + 0.5, 482]] as [number, number][]) {
      const pts: P2[] = []; for (let z = z0; z <= z1 + 0.01; z += 1.5) pts.push(offLine(ESVC, z, SVC_HALF + 1.2));
      kerbLine(c, SO, pts, 0.16, 0.25, '#c9c5bb');
      for (let i = 1; i < pts.length - 1; i += 2) if (!nearRoad(pts[i][0] + 0.5, pts[i][1], 0.1)) stripedPost(c, SO, pts[i][0] + 0.5, pts[i][1]);
    }
    for (let i = 0; i < 6; i++) { const a = (i / 5) * (Math.PI / 2), x = 873 + Math.cos(a) * 6, z = 437 - Math.sin(a) * 6; if (!nearRoad(x, z + 13, 0.1)) stripedPost(c, SO, x, z + 13, { band: '#c8261e' }); }
    for (let x = 866; x < 879; x += 2.2) for (const z of [m0 - 0.8, m1 + 0.8]) if (!nearRoad(x, z, 0.1)) stripedPost(c, SO, x, z);
    // the brick footway along the service road crossing the islands (Pair 10), its kerb
    const [fa, fb] = edges(ESVC, 400, PLOT.access[0] - 1, SVC_HALF, SVC_HALF + 2.0);
    k.meshes.push(ribbon(SO, fa, fb, 0.1, brick())); kerbLine(c, SO, fa.filter((p) => p[1] < m0 || p[1] > m1), 0.13);
    // STOP on the access (Pair 8), worn
    { const [sx, sz] = A(eastKerb(458) + 6.5, 458.7), y = gh(sx + SO[0], sz + SO[1]);
      const g = new THREE.PlaneGeometry(4.2, 1.6).rotateX(-Math.PI / 2).rotateY(Math.PI / 2).translate(sx, y + 0.06, sz); P.add(STOP_MARK(), g); }
    // ---------- the canopy: open, dark columns, the thin pale fascia with its red edge, the brand ----------
    {
      const [x0, x1, z0, z1] = STATION.canopy, h = STATION.canopyH, y = gh((x0 + x1) / 2, (z0 + z1) / 2);
      for (const x of [x0 + 4.5, x1 - 4.5]) for (const z of [z0 + 4.2, z1 - 4.2]) { c.push([B(x - 0.22, x + 0.22, y, y + h, z - 0.22, z + 0.22), '#3a3c3f']); SOLIDS.add(x, z, 0.35); }
      // the underside's beams and panels, the slab, the fascia
      c.push([B(x0, x1, y + h, y + h + 0.25, z0, z1), '#d9d8d3']);
      for (let x = x0 + 1; x < x1; x += 2.4) c.push([B(x - 0.08, x + 0.08, y + h - 0.2, y + h, z0 + 0.3, z1 - 0.3), '#9da0a3']);
      for (const z of [z0 + 4.2, z1 - 4.2]) c.push([B(x0 + 0.3, x1 - 0.3, y + h - 0.35, y + h, z - 0.15, z + 0.15), '#5a5d60']);
      const fy0 = y + h + 0.25, fy1 = fy0 + 0.75;
      for (const [a0, a1, b0, b1] of [[x0, x1, z0 - 0.06, z0], [x0, x1, z1, z1 + 0.06], [x0 - 0.06, x0, z0, z1], [x1, x1 + 0.06, z0, z1]] as Box[]) {
        c.push([B(a0, a1, fy0, fy1, b0, b1), PALE]);
        c.push([B(a0 - 0.01, a1 + 0.01, fy0 + 0.5, fy1, b0 - 0.01, b1 + 0.01), '#d81e1e']);
      }
      for (let x = x0 + 2; x < x1 - 1; x += 3.5) for (const z of [z0 + 2, z1 - 2]) k.plain.push([B(x, x + 1.4, y + h - 0.02, y + h, z - 0.3, z + 0.3), '#fffbe6']);
      // TotalEnergies raised along the west and north faces' tops, LEGON 2 on the west face
      P.wall(TOTAL_WORD(), x0 - 0.1, z1 - 2, x0 - 0.1, z0 + 2, fy1, fy1 + 1.1, 1, 1, 0);
      P.wall(TOTAL_WORD(), x0 + 2, z0 - 0.1, x1 - 2, z0 - 0.1, fy1, fy1 + 1.1, 1, 1, 0);
      P.wall(LEGON2(), x0 - 0.08, z1 - 4, x0 - 0.08, z1 - 6.4, fy0 + 0.08, fy0 + 0.46, 1, 1, 0);
      // the pump islands under it with the pumps, their hoses, the protective bases
      for (const z of [z0 + 4.2, z1 - 4.2]) {
        c.push([B(x0 + 3, x1 - 3, y, y + 0.2, z - 0.7, z + 0.7), '#cfccc4']);
        for (const x of [(x0 + x1) / 2 - 2.2, (x0 + x1) / 2 + 2.2]) {
          k.plain.push([B(x - 0.5, x + 0.5, y + 0.2, y + 1.9, z - 0.3, z + 0.3), '#f2f2f0'], [B(x - 0.51, x + 0.51, y + 1.6, y + 1.9, z - 0.31, z + 0.31), '#d81e1e'], [B(x - 0.3, x + 0.3, y + 1.0, y + 1.45, z - 0.32, z + 0.32), '#2c3640']);
          k.plain.push([rod([x + 0.5 - SO[0], y + 1.4, z - SO[1]], [x + 0.75 - SO[0], y + 0.5, z - SO[1]], 0.04), '#1b1b1b']);
          SOLIDS.add(x, z, 0.6);
        }
        for (const x of [x0 + 3.1, x1 - 3.1]) c.push([B(x - 0.3, x + 0.3, y + 0.2, y + 1.0, z - 0.3, z + 0.3), '#d81e1e']);
        // the small cabinets and the oil display (Pair 7)
        k.plain.push([B((x0 + x1) / 2 - 0.4, (x0 + x1) / 2 + 0.4, y + 0.2, y + 1.2, z - 0.25, z + 0.25), '#d6201f']);
      }
      // the round concrete planter bases in the open forecourt (Pair 7)
      for (const [x, z] of [[906, 486.5], [893, 488]] as P2[]) { if (nearRoad(x, z, 0.6)) continue; c.push([new THREE.CylinderGeometry(0.75, 0.9, 0.5, 14).translate(x - SO[0], gh(x, z) + 0.25, z - SO[1]), '#a39d92']); SOLIDS.add(x, z, 0.9); }
    }
    // ---------- the takeaway: the white fascia band and its signs, the air-conditioning units, the shopfront ----------
    {
      const [x0, x1, z0, z1] = tk, y = gh((x0 + x1) / 2, (z0 + z1) / 2), e = y + STATION.takeH;
      c.push([B(x0 - 0.12, x1 + 0.12, e - 0.1, e + 0.9, z0 - 0.12, z1 + 0.12), PALE]);
      P.wall(TAKE_FASCIA(), x0 - 0.14, z1 - 0.4, x0 - 0.14, z0 + 0.4, e - 0.02, e + 0.85, 1, 1, 0);
      P.wall(SOUTH_FASCIA(), x0 + 0.4, z1 + 0.14, x1 - 0.4, z1 + 0.14, e - 0.02, e + 0.85, 1, 1, 0);
      // a red pizza disc high on the north-west corner (Pair 6)
      P.wall(PIZZA_DISC(), x0 - 0.16, z0 + 1.6, x0 - 0.16, z0 + 0.4, e + 0.05, e + 1.25, 1, 1, 0);
      // the white units on the grey west face, the dark windows; the units on the roof
      for (const z of [z0 + 2.2, z0 + 3.4, z1 - 2.2]) c.push([B(x0 - 0.35, x0, y + 0.9, y + 1.55, z - 0.45, z + 0.45), '#f1f1ee'], [B(x0 - 0.36, x0 - 0.35, y + 1.0, y + 1.45, z - 0.28, z + 0.12), '#9a9c9e']);
      for (const [x, z] of [[x0 + 6, z0 + 4], [x0 + 10, z0 + 4]] as P2[]) c.push([B(x - 1.1, x + 1.1, e + 0.9, e + 1.8, z - 0.9, z + 0.9), '#c9cacb']);
      // the shopfront on the south face toward the pumps: glazing, a shallow canopy, tables (Pair 7)
      for (let x = x0 + 1; x < x1 - 1.5; x += 3) k.glass.push(B(x, x + 2.4, y + 0.3, y + 2.6, z1 + 0.01, z1 + 0.05));
      c.push([B(x0, x1, y + 2.9, y + 3.05, z1, z1 + 2.2), '#e8e6e0']);
      for (const x of [x0 + 0.3, x1 - 0.3]) { c.push([B(x - 0.06, x + 0.06, y, y + 2.9, z1 + 2.05, z1 + 2.15), '#3a3c3f']); SOLIDS.add(x, z1 + 2.1, 0.12); }
      for (let x = x0 + 2.5; x < x1 - 2; x += 3.5) { c.push([B(x - 0.4, x + 0.4, y + 0.72, y + 0.78, z1 + 0.6, z1 + 1.4), '#4fae4a'], [B(x - 0.04, x + 0.04, y, y + 0.72, z1 + 0.96, z1 + 1.04), '#4b4d50']); }
      // the drive-through's short railing along the north side (Pair 6)
      for (let x = x0 + 1; x < x1; x += 1.6) c.push([B(x - 0.04, x + 0.04, y, y + 1.0, z0 - 2.6, z0 - 2.5), '#c9c9c4']);
      c.push([B(x0 + 1, x1 - 0.5, y + 0.95, y + 1.02, z0 - 2.6, z0 - 2.5), '#c9c9c4']);
      wallSolids(x0 + 1, z0 - 2.55, x1 - 0.5, z0 - 2.55, 0.15);
    }
    // ---------- the service strip: its columns between the bays and the fascia boards (Pairs 6, 7) ----------
    {
      const [x0, x1, z0, z1] = sp, y = gh((x0 + x1) / 2, (z0 + z1) / 2), e = y + STATION.stripH;
      c.push([B(x0 - 0.15, x1 + 0.1, e - 0.1, e + 0.8, z0 - 0.1, z1 + 0.1), '#e9e7e1']);
      P.wall(STRIP_FASCIA(), x0 - 0.17, z1 - 0.5, x0 - 0.17, z0 + 0.5, e, e + 0.75, 1, 1, 0);
      for (const t of [2, 4, 6, 8]) k.plain.push([B(x1 - 4 - t, x1 - 2.5 - t, e + 0.8, e + 1.6, z0 + 3, z0 + 4.5), '#2d2f31']);
      // a blue laundry board at its south end (legible only as a blue board with white text: left plain)
      c.push([B(x0 - 0.3, x0 - 0.2, y + 2.6, y + 3.2, z1 - 3.5, z1 - 0.5), '#2f5fb0']);
    }
    // ---------- the pylons at the access (Pairs 8, 10): the price pylon south, the restaurant pylons north ----------
    {
      const [x, z, h] = STATION.pricePylon, y = gh(x, z);
      c.push([B(x - 0.55, x + 0.55, y, y + h, z - 0.35, z + 0.35), '#e2e3e5'], [B(x - 0.6, x + 0.6, y, y + 0.6, z - 0.42, z + 0.42), '#9a9da0']);
      P.wall(PRICE_FACE(), x - 0.36, z + 0.5, x - 0.36, z - 0.5, y + 1.0, y + h - 0.1, 1, 1, 0);
      P.wall(PRICE_FACE(), x + 0.36, z - 0.5, x + 0.36, z + 0.5, y + 1.0, y + h - 0.1, 1, 1, 0);
      SOLIDS.add(x, z, 0.7);
    }
    {
      const [x, z, h] = STATION.chickenPylon, y = gh(x, z);
      c.push([B(x - 0.3, x + 0.3, y, y + h, z - 0.08, z + 0.08), '#d6201f'], [B(x - 0.06, x + 0.06, y, y + 1.2, z - 0.06, z + 0.06), '#6b6f72']);
      P.wall(CHICKEN_FACE(), x - 0.32, z + 0.09, x + 0.32, z + 0.09, y + 1.2, y + h - 0.2, 1, 1, 0);
      P.wall(CHICKEN_FACE(), x + 0.32, z - 0.09, x - 0.32, z - 0.09, y + 1.2, y + h - 0.2, 1, 1, 0);
      P.wall(PIZZA_DISC(), x - 0.6, z + 0.1, x + 0.6, z + 0.1, y + h - 0.1, y + h + 1.1, 1, 1, 0);
      SOLIDS.add(x, z, 0.4);
      const [x2, z2, h2] = STATION.pizzaPylon, y2 = gh(x2, z2);
      c.push([B(x2 - 0.25, x2 + 0.25, y2, y2 + h2, z2 - 0.08, z2 + 0.08), '#2f8a3a']);
      P.wall(PIZZA_FACE(), x2 - 0.27, z2 + 0.09, x2 + 0.27, z2 + 0.09, y2 + 1.0, y2 + h2 - 0.2, 1, 1, 0);
      P.wall(PIZZA_FACE(), x2 + 0.27, z2 - 0.09, x2 - 0.27, z2 - 0.09, y2 + 1.0, y2 + h2 - 0.2, 1, 1, 0);
      P.wall(PIZZA_DISC(), x2 - 0.55, z2 + 0.1, x2 + 0.55, z2 + 0.1, y2 + h2, y2 + h2 + 1.1, 1, 1, 0);
      SOLIDS.add(x2, z2, 0.35);
    }
    // the no-entry discs at the exits (Pairs 8, 10)
    for (const [x, z] of [[872.5, 468.5], [876.5, 479.5], [874.0, 449.5]] as P2[]) {
      const y = gh(x, z);
      c.push([B(x - 0.04, x + 0.04, y, y + 2.1, z - 0.04, z + 0.04), '#8a8e91']);
      P.wall(NO_ENTRY(), x - 0.06, z + 0.32, x - 0.06, z - 0.32, y + 1.5, y + 2.14, 1, 1, 0);
      SOLIDS.add(x, z, 0.1);
    }
    // the low white wall along the south side (Pair 10), slender palms round the forecourt
    // (open where the plot's mapped access road passes through it)
    { const z = STATION.southWall; for (const [a, bb] of clearRuns(eastKerb(z) + 2.5, 924, z, 0.4)) { c.push([B(a, bb, g0, g0 + 0.8, z - 0.12, z + 0.12), '#efefea'], [B(a, bb, g0 + 0.8, g0 + 0.88, z - 0.16, z + 0.16), '#d6d3cb']); wallSolids(a, z, bb, z, 0.2); } }
    for (const [x, z, h] of [[884.5, 452.5, 7.5], [882.0, 436.5, 8], [919, 433, 7], [921, 509, 7.5], [868, 494, 6.5]] as [number, number, number][]) if (!nearRoad(x, z, 0.8)) christmasPalm(fr, tr, SO, x, z, h, x + z);
    // the utility frames and the communications support near the frontage (Pair 5)
    const poles: V3[][] = [];
    for (const z of [412, 424]) poles.push(hFrame(c, SO, eastKerb(z) + 3.6, z, 0, 9.5));
    lattice3(c, SO, 880, 425, 24);

    // ---------- the raised plot (Pairs 9, 15, 16) ----------
    const face = (z: number) => eastKerb(z) + PLOT.wallOff;
    // the brick sidewalk along it, the stained wall, tapering down at the access
    const [sa, sb2] = edges(ESVC, PLOT.access[0] - 1, PLOT.z1 + 8, SVC_HALF, SVC_HALF + PLOT.wallOff - 0.1);
    k.meshes.push(ribbon(SO, sa, sb2, 0.1, brick())); kerbLine(c, SO, sa, 0.13);
    for (let z = PLOT.access[1]; z < PLOT.z1; z += 2) {
      const z2 = Math.min(z + 2, PLOT.z1), xa = face(z), xb = face(z2), base = Math.min(gh(xa - 0.4, z), gh(xb - 0.4, z2));
      const ta = Math.min(1, (z - PLOT.access[1]) / PLOT.taper), tb = Math.min(1, (z2 - PLOT.access[1]) / PLOT.taper);
      const top = base + 0.35 + (PLOT.h + 0.25 - 0.35) * Math.max(ta, tb);
      P.wall(STAINED(), xb, z2, xa, z, base - 0.2, top, 1, Math.max(0.4, (top - base) / 1.2), 0);
      c.push([run(xa - SO[0] + 0.12, z - SO[1], xb - SO[0] + 0.12, z2 - SO[1], base - 0.2, top, 0.26), '#a9a192']);
      wallSolids(xa + 0.1, z, xb + 0.1, z2, 0.22); 
    }
    // the access: a broad hard apron up onto the plot, gravel, the railing and the short white posts (Pair 16)
    const plotIn = (x: number, z: number) => { const f = face(Math.min(PLOT.z1, Math.max(PLOT.access[0], z))); return !(x < f + (z < PLOT.access[1] ? -PLOT.wallOff + 0.2 : 0.3) || x > f + PLOT.depth); };
    const apron = (x: number, z: number) => z < PLOT.access[1] + 10 && x < face(Math.min(PLOT.z1, Math.max(PLOT.access[0], z))) + 22;
    // the apron: hard, and never past a mapped road's edge (the owner's revised soil order: no apron in the lane)
    k.meshes.push(drapeMesh(drapeAt(SO, 870, 990, PLOT.access[0] - 2, PLOT.z1 + 4, 0.8, 0.04, (x, z) => {
      if (!plotIn(x, z) || !apron(x, z) || onHardscape(x, z)) return null;
      return vnoise(x * 0.5, z * 0.5) > 0.55 ? [0.58, 0.56, 0.52] : worn(x, z);
    })));
    // beyond it the plot's ground: gravel and bare soil where it is worked, grass and scrub between
    k.meshes.push(soilMesh(SO, 870, 990, PLOT.access[0] - 2, PLOT.z1 + 4, 0.8, (x, z) => {
      if (!plotIn(x, z) || apron(x, z)) return null;
      const f = face(Math.min(PLOT.z1, Math.max(PLOT.access[0], z)));
      const worked = x < f + 30 ? ramp(0.4, 0.52, vnoise(x * 0.5, z * 0.5)) : 0;
      return Math.max(worked, ramp(0.47, 0.64, vnoise(x * 0.25, z * 0.3)));
    }, (x, z) => (x < face(Math.min(PLOT.z1, Math.max(PLOT.access[0], z))) + 30 && vnoise(x * 0.5, z * 0.5) > 0.45 ? [0.58, 0.54, 0.48] : dustySoil(x, z))));
    // (the railing and the posts leave the mapped access road open where it runs on south over the plot)
    for (const [ra, rb] of clearRuns(face(PLOT.access[1]) + 2, face(PLOT.access[1]) + 20, PLOT.access[1] - 0.3, 0.4)) {
      const z = PLOT.access[1] - 0.3;
      for (let x = ra; x <= rb + 1e-6; x += Math.max(0.5, (rb - ra) / Math.max(1, Math.round((rb - ra) / 2)))) { const y = gh(x, z); c.push([B(x - 0.04, x + 0.04, y, y + 1.1, z - 0.04, z + 0.04), '#c9c9c4']); }
      const y = gh((ra + rb) / 2, z); c.push([B(ra, rb, y + 1.05, y + 1.1, z - 0.03, z + 0.03), '#c9c9c4']);
      wallSolids(ra, z, rb, z, 0.15);
    }
    for (let i = 0; i < 6; i++) { const x = face(PLOT.access[1]) + 1.2 + i * 1.6; if (!nearRoad(x, PLOT.access[1] - 1.4, 0.3)) stripedPost(c, SO, x, PLOT.access[1] - 1.4, { band: '#e8e6e0', h: 0.9 }); }
    // the small white flat-roofed building, its peeling red fascia, the broad pale front; the unfinished frame
    {
      const [x0, x1, z0, z1] = PLOT.white, y = Math.min(gh(x0, z0), gh(x1, z1)), h = 3.3;
      c.push([B(x0, x1, y, y + h, z0, z1), '#eeece6']);
      c.push([B(x0 - 0.3, x1 + 0.3, y + h, y + h + 0.6, z0 - 0.3, z1 + 0.3), '#b5574a']);
      // patches where the red has peeled to the grey render
      for (let i = 0; i < 12; i++) { const t = hash(i, 3.3); c.push([B(x0 - 0.33 + t * (x1 - x0), x0 - 0.33 + t * (x1 - x0) + 0.4 + hash(i, 4) * 0.9, y + h + 0.1 + hash(i, 5) * 0.2, y + h + 0.45, z0 - 0.33, z0 - 0.3), '#c9c3b8']); }
      for (let i = 0; i < 6; i++) { const t = hash(i, 7.7); c.push([B(x0 - 0.33, x0 - 0.3, y + h + 0.1, y + h + 0.5, z0 + t * (z1 - z0), z0 + t * (z1 - z0) + 0.6), '#cfc9be']); }
      // the broad pale front (glazed or panelled, its function unknown) to the road, a small side opening
      k.glass.push(B(x0 - 0.04, x0 - 0.01, y + 0.4, y + 2.7, z0 + 1.2, z1 - 1.2));
      c.push([B(x0 - 0.06, x0 - 0.02, y + 0.35, y + 2.75, z0 + 1.15, z0 + 1.25), '#d9d6cc']);
      c.push([B(x0 + 2, x0 + 3, y + 1.2, y + 2.1, z0 - 0.03, z0), '#2b2d30']);
      wallSolids(x0, z0, x1, z0, 0.3); wallSolids(x0, z1, x1, z1, 0.3); wallSolids(x0, z0, x0, z1, 0.3); wallSolids(x1, z0, x1, z1, 0.3);
    }
    {
      // the unfinished concrete frame: columns, beams, a slab with open bays; no roof finish, no glazing
      const [x0, x1, z0, z1] = PLOT.frame, y = Math.min(gh(x0, z0), gh(x1, z1)), h = 3.0;
      for (const x of [x0, (x0 + x1) / 2, x1]) for (const z of [z0, (z0 + z1) / 2, z1]) { c.push([B(x - 0.15, x + 0.15, y, y + h + 0.6, z - 0.15, z + 0.15), '#9d978c']); SOLIDS.add(x, z, 0.25); }
      for (const z of [z0, (z0 + z1) / 2, z1]) c.push([B(x0 - 0.15, x1 + 0.15, y + h, y + h + 0.3, z - 0.15, z + 0.15), '#a39d92']);
      for (const x of [x0, x1]) c.push([B(x - 0.15, x + 0.15, y + h, y + h + 0.3, z0, z1), '#a39d92']);
      c.push([B(x0 + 0.2, x1 - 0.2, y + h + 0.3, y + h + 0.42, z0 + 0.2, (z0 + z1) / 2), '#8f897e']);
      // low blockwork between some columns, rods sticking up
      c.push([B(x0, x1, y, y + 1.0, z1 - 0.1, z1 + 0.1), '#b0aa9e']);
      for (const x of [x0, x1]) for (const z of [z0, z1]) for (const d of [-0.07, 0.07]) c.push([B(x + d - 0.01, x + d + 0.01, y + h + 0.6, y + h + 1.3, z - 0.01, z + 0.01), '#6a4b3a']);
    }
    // the pile of material, weeds, red earth patches over the plot; palms and trees behind
    { const x = 900, z = 535, y = gh(x, z); c.push([new THREE.SphereGeometry(1.4, 8, 6).scale(1.4, 0.45, 1).translate(x - SO[0], y, z - SO[1]), '#9fb3c9']); }
    for (let i = 0; i < 900; i++) {
      const z = PLOT.access[1] + 2 + hash(i, 0.13) * (PLOT.z1 - PLOT.access[1] - 4), x = face(z) + 1.5 + hash(0.29, i) * (PLOT.depth - 4);
      if (SOLIDS.at(x, z, 0.6) || nearRoad(x, z, 0.8) || (x > PLOT.white[0] - 1 && x < PLOT.frame[1] + 1 && z > PLOT.frame[2] - 1 && z < PLOT.white[3] + 1)) continue;
      const r = hash(i, 2.2), y = gh(x, z);
      if (x < face(z) + 26 && z < PLOT.access[1] + 12) continue;
      if (r < 0.75) tuft(b, x, z, 0.4 + hash(i, 5) * 0.9, ['#7d8a44', '#8d9450', '#a39a5a', '#6b7a3a'][i % 4], i + 12000);
      else if (r < 0.96) shrub(leaf, SO, x, z, y, 0.5 + hash(i, 6) * 1.0, i);
      else compactTree(leaf, wood, SO, x, z, y, 2.6 + hash(i, 7) * 2, 2 + hash(i, 8) * 1.5, i);
    }
    for (const [x, z, h] of [[948, 548, 9], [955, 560, 8.5], [944, 572, 9.5], [960, 540, 8], [936, 530, 7.5]] as [number, number, number][]) christmasPalm(fr, tr, SO, x, z, h, x * 2 + z);
    for (const [x, z] of [[930, 590], [952, 600], [965, 575]] as P2[]) broadleaf(k, leaf, x, z, { h: 6.5, spread: 8, seed: x + z, origin: SO, round: true });
    // the empty blue billboard skeleton on its post, the separate red frame (Pairs 9, 12, 15, 16): no advertisement
    {
      const [x, z, h] = PLOT.billboard, y = gh(x, z), [px, pz] = A(x, z);
      c.push([new THREE.CylinderGeometry(0.3, 0.35, h, 10).translate(px, y + h / 2, pz), '#3a7fb8']);
      const W = 10, H = 3.6, yb = y + h;
      for (const yy of [0, H / 2, H]) c.push([box(px - 0.08, px + 0.08, yb + yy - 0.08, yb + yy + 0.08, pz - W / 2, pz + W / 2), '#3a8ac4']);
      for (let s = -W / 2; s <= W / 2 + 0.01; s += W / 6) c.push([box(px - 0.06, px + 0.06, yb, yb + H, pz + s - 0.06, pz + s + 0.06), '#3a8ac4']);
      c.push([box(px - 0.6, px + 0.6, yb - 0.1, yb, pz - W / 2, pz + W / 2), '#2f6fa8']);
      SOLIDS.add(x, z, 0.4);
      const [rx, rz, rh] = PLOT.redFrame, ry = gh(rx, rz), [qx, qz] = A(rx, rz);
      for (const s of [-1.6, 1.6]) { c.push([box(qx - 0.1, qx + 0.1, ry, ry + rh, qz + s - 0.1, qz + s + 0.1), '#a33a2c']); SOLIDS.add(rx, rz + s, 0.18); }
      for (const yy of [rh - 2.4, rh - 1.2, rh]) c.push([box(qx - 0.07, qx + 0.07, ry + yy - 0.07, ry + yy + 0.07, qz - 1.7, qz + 1.7), '#a33a2c']);
    }
    // the utility frames along the plot's frontage, a wooden one with its transformer (Pairs 9, 15)
    for (const z of [516, 560, 600]) poles.push(hFrame(c, SO, face(z) - 1.0, z, 0, 9.5));
    spans(c, poles, 0.45);

    const m = new THREE.Mesh(merge(sane([...c, ...wood], 'legon first')), concrete(0.2)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.leaf.push(...leaf, ...fr);
    b.c.push(...tr);
    b.leaf = sane(b.leaf, 'legon first leaf'); b.c = sane(b.c, 'legon first'); k.plain.splice(0, k.plain.length, ...sane(k.plain, 'legon first plain'));
    b.finish(k, 0.25);
    P.finish(k);
  },
};
/** a slender three-legged lattice communications support (Pair 5) */
function lattice3(c: Part[], O: P2, x: number, z: number, h: number) {
  const y = gh(x, z), r = (yy: number) => 0.9 - (0.6 * yy) / h, P = (yy: number, i: number): V3 => [x - O[0] + r(yy) * Math.cos((i / 3) * Math.PI * 2), y + yy, z - O[1] + r(yy) * Math.sin((i / 3) * Math.PI * 2)];
  for (let yy = 0; yy < h; yy += 2.5) for (let i = 0; i < 3; i++) {
    c.push([rod(P(yy, i), P(Math.min(h, yy + 2.5), i), 0.08), '#a5aaad']);
    c.push([rod(P(yy, i), P(Math.min(h, yy + 2.5), (i + 1) % 3), 0.04), '#a5aaad']);
  }
  SOLIDS.add(x, z, 1.0);
}

// ======================================================================================================
// the corridor south to Okponglo: the divider, the strips, the retaining wall and tiers, the scrub, the lamps
// ======================================================================================================
const CO: P2 = [865, 640];
const tierHouse = (g: CanvasRenderingContext2D) => { render(g, '#efe6cf'); g.fillStyle = '#2b2d30'; g.fillRect(96, 330, 64, 60); };
const corridor: Spec = {
  name: 'Legon overhead to Okponglo corridor', axis: [1, 0], origin: CO, storey: 2.9, style: st(3.2, tierHouse), roofColor: '#b8473a', fascia: '#efe6cf', pitch: 0.32,
  replaces: TIER_HOUSES.map((t) => [(t[0] + t[1]) / 2, (t[2] + t[3]) / 2] as P2),
  onGround: true,
  blocks: TIER_HOUSES.map((t) => ({ x0: t[0] - CO[0], x1: t[1] - CO[0], z0: t[2] - CO[1], z1: t[3] - CO[1], floors: 1 })),
  keep: [],
  extras: (k) => {
    const c: Part[] = [], leaf: Part[] = [], wood: Part[] = [], b = new Bag(CO), P = new Pics(CO), fr: Part[] = [], tr: Part[] = [];
    const A = (x: number, z: number): [number, number] => [x - CO[0], z - CO[1]];
    // ---------- the low concrete divider, the median paved to it (Pair 14) ----------
    const mid = (z: number): P2 => { const a = offLine(SB, z, N4_HALF), o = offLine(NB, z, -N4_HALF); return [(a[0] + o[0]) / 2, z]; };
    const dpts: P2[] = []; for (let z = DIVIDER.z0; z <= DIVIDER.z1; z += 6) dpts.push(mid(z));
    divider(c, CO, dpts, DIVIDER.h);
    k.meshes.push(drapeMesh(drapeAt(CO, 820, 905, DIVIDER.z0 - 2, DIVIDER.z1 + 2, 0.6, 0.02, (x, z) => {
      const a = xAt(SB, z) + N4_HALF - 0.2, o = xAt(NB, z) - N4_HALF + 0.2;
      if (Number.isNaN(a) || Number.isNaN(o) || x < a || x > o) return null;
      const m = vnoise(x * 0.8, z * 0.8); return [0.25 + m * 0.03, 0.25 + m * 0.03, 0.26 + m * 0.03];
    })));
    // ---------- the grass strip between the southbound carriageway and the west service road: patchy grass and earth,
    // a low shrub now and then, the branching lamps with their small boards (Pairs 11, 14) ----------
    const stripIn = (x: number, z: number) => { const w = xAt(WSVC, z) + SVC_HALF + 0.3, e = xAt(SB, z) - N4_HALF - 0.3; return !Number.isNaN(w) && !Number.isNaN(e) && x > w && x < e; };
    k.meshes.push(soilMesh(CO, 800, 912, 410, PLANTED.z1, 0.8, (x, z) => (stripIn(x, z) ? ramp(0.5, 0.66, vnoise(x * 0.4, z * 0.15)) : null)));
    const boards = ['#2a5fb0', '#e07a22', '#2a5fb0', '#d8d4c8'];
    for (let z = 420, i = 0; z < PLANTED.z1 - 5; z += 34, i++) {
      const w = xAt(WSVC, z) + SVC_HALF, e = xAt(SB, z) - N4_HALF;
      if (Number.isNaN(w) || Number.isNaN(e) || e - w < 2) continue;
      streetLight(c, CO, (w + e) / 2, z, Math.atan2(0, 1), { twin: true, board: i % 2 ? boards[(i >> 1) % boards.length] : undefined });
    }
    for (let i = 0; i < 240; i++) {
      const z = 412 + hash(i, 6.1) * (PLANTED.z0 - 412), w = xAt(WSVC, z) + SVC_HALF + 0.8, e = xAt(SB, z) - N4_HALF - 0.8;
      if (Number.isNaN(w) || e - w < 1) continue;
      const x = w + hash(2.3, i) * (e - w);
      if (SOLIDS.at(x, z, 0.8) || nearRoad(x, z, 0.8)) continue;
      if (hash(i, 7.3) < 0.12) shrub(leaf, CO, x, z, gh(x, z), 0.5 + hash(i, 8) * 0.5, i);
      else tuft(b, x, z, 0.3 + hash(i, 9) * 0.4, ['#7d8a44', '#8d9450', '#6b7a3a'][i % 3], i + 15000);
    }
    // ---------- the planted separation farther south: short-stemmed young trees, shrubs, gaps (Pair 13) ----------
    for (let z = PLANTED.z0 + 3, i = 0; z < PLANTED.z1 - 3; z += 5 + hash(z, 1.1) * 7, i++) {
      const w = xAt(WSVC, z) + SVC_HALF + 0.6, e = xAt(SB, z) - N4_HALF - 0.6;
      if (Number.isNaN(w) || Number.isNaN(e) || e - w < 1.2 || hash(z, 4.2) < 0.2) continue;
      const x = w + (e - w) * (0.3 + hash(z, 3.3) * 0.4), y = gh(x, z);
      if (SOLIDS.at(x, z, 0.8) || nearRoad(x, z, 0.8)) continue;
      if (hash(z, 5.5) < 0.55) compactTree(leaf, wood, CO, x, z, y, 1.8 + hash(z, 6) * 1.6, Math.min(e - w, 1.2 + hash(z, 7) * 1.3), z);
      else shrub(leaf, CO, x, z, y, 0.5 + hash(z, 8) * 0.7, z);
    }
    // ---------- the long panelled retaining wall behind the west service road, the wooded ground over it (Pair 14);
    // the tiers where the two small structures stand (Pair 11) ----------
    const rface = (z: number) => westKerb(z) - RWALL.off;
    for (let z = RWALL.z0 - 6; z < RWALL.tiers.z1 + 6; z += 3) {
      const z2 = z + 3, xa = rface(z), xb = rface(z2);
      if (Number.isNaN(xa) || Number.isNaN(xb)) continue;
      const base = Math.min(gh(xa + 0.6, z), gh(xb + 0.6, z2));
      const tier = z >= RWALL.tiers.z0;
      const top = tier ? base + RWALL.tiers.h[0] + 0.15 : Math.max(gh(xa - 0.8, z), gh(xb - 0.8, z2)) + 0.2;
      if (top - base < 0.25) continue;
      P.wall(PANEL_WALL(), xa, z, xb, z2, base - 0.2, top, 1.5, Math.max(0.3, (top - base) / 2.2), 0);
      c.push([run(xa - CO[0] - 0.15, z - CO[1], xb - CO[0] - 0.15, z2 - CO[1], base - 0.2, top, 0.32), '#8c8272']);
      c.push([run(xa - CO[0] - 0.15, z - CO[1], xb - CO[0] - 0.15, z2 - CO[1], top, top + 0.12, 0.45), '#b9b0a0']);
      wallSolids(xa - 0.15, z, xb - 0.15, z2, 0.22);
      if (tier) {
        // the upper tier's wall a few metres back
        const ua = tierBack(z, xa), ub = tierBack(z2, xb), ubase = base + RWALL.tiers.h[0], utop = base + RWALL.tiers.h[1] + 0.15;
        P.wall(PANEL_WALL(), ua, z, ub, z2, ubase - 0.2, utop, 1.5, 0.4, 0);
        c.push([run(ua - CO[0] - 0.15, z - CO[1], ub - CO[0] - 0.15, z2 - CO[1], ubase - 0.2, utop, 0.3), '#8c8272'], [run(ua - CO[0] - 0.15, z - CO[1], ub - CO[0] - 0.15, z2 - CO[1], utop, utop + 0.1, 0.42), '#b9b0a0']);
        wallSolids(ua - 0.15, z, ub - 0.15, z2, 0.2);
      }
    }
    // the ground over the wall: rough grass and leaf litter, the mature spreading crowns, a tall sparse tree, shrubs
    k.meshes.push(soilMesh(CO, 770, 880, RWALL.z0, RWALL.tiers.z1 + 4, 1.0, (x, z) => {
      const f = rface(z); if (Number.isNaN(f) || x > f - 0.4 || x < f - RWALL.back) return null;
      return scrubSoil(x, z);
    }));
    for (let i = 0; i < 2600; i++) {
      const z = RWALL.z0 + 4 + hash(i, 0.53) * (RWALL.tiers.z1 - RWALL.z0 - 6), d = 1.2 + Math.pow(hash(0.61, i), 1.1) * (RWALL.back - 4), x = rface(z) - d;
      if (Number.isNaN(x) || SOLIDS.at(x, z, 0.8) || nearRoad(x, z, 0.8) || TIER_HOUSES.some(([a, bb, cc, dd]) => x > a - 2 && x < bb + 2 && z > cc - 2 && z < dd + 2)) continue;
      if (z > RWALL.tiers.z0 - 2 && d < 5) continue;
      const r = hash(i, 3.7), y = gh(x, z);
      if (r < 0.5) tuft(b, x, z, 0.5 + hash(i, 5) * 0.8, ['#7d8a44', '#8d9450', '#6b7a3a', '#5f7a35'][i % 4], i + 18000);
      else if (r < 0.88) shrub(leaf, CO, x, z, y, 0.6 + hash(i, 6) * 1.2, i, ['#3f6a2a', '#4d7a31', '#5b7f36', '#36602a', '#557331']);
      else if (r < 0.975) compactTree(leaf, wood, CO, x, z, y, 3 + hash(i, 10) * 2.5, 2.4 + hash(i, 11) * 2, i);
      else if (r < 0.996) broadleaf(k, leaf, x, z, { h: 5 + hash(i, 12) * 2.5, spread: 7 + hash(i, 13) * 4, seed: i, origin: CO });
      else broadleaf(k, leaf, x, z, { h: 11 + hash(i, 14) * 3, spread: 5, sparse: true, seed: i, origin: CO });
    }
    // the small unfinished concrete frame among the trees (Pair 14)
    {
      const x0 = 805.5, z0 = 524, y = gh(x0 + 2, z0 + 2); // (placed clear of the mapped footway 1513)
      for (const dx of [0, 3.5]) for (const dz of [0, 3]) { c.push([box(x0 + dx - 0.12 - CO[0], x0 + dx + 0.12 - CO[0], y, y + 2.8, z0 + dz - 0.12 - CO[1], z0 + dz + 0.12 - CO[1]), '#a19b90']); SOLIDS.add(x0 + dx, z0 + dz, 0.2); }
      c.push([box(x0 - 0.12 - CO[0], x0 + 3.62 - CO[0], y + 2.6, y + 2.85, z0 - 0.12 - CO[1], z0 + 0.12 - CO[1]), '#a19b90'], [box(x0 - 0.12 - CO[0], x0 + 3.62 - CO[0], y, y + 1.1, z0 + 2.9 - CO[1], z0 + 3.1 - CO[1]), '#b2aca0']);
    }
    // ---------- the east side south of the raised plot: dense scrub rising behind the verge, rock patches (Pair 12) ----
    const eIn = (x: number, z: number) => { const k0 = eastEdge(z); return !Number.isNaN(k0) && x > k0 + 2.4 && x < k0 + EAST_SCRUB.depth; };
    const rock = (x: number, z: number) => x < eastEdge(z) + 14 ? ramp(0.66, 0.74, vnoise(x * 0.35, z * 0.35)) : 0;
    k.meshes.push(soilMesh(CO, 880, 990, PLOT.z1 + 4, EAST_SCRUB.z1, 1.0, (x, z) => (eIn(x, z) ? Math.max(rock(x, z), scrubSoil(x, z)) : null), (x, z) => (rock(x, z) > 0.5 ? [0.56, 0.53, 0.48] : dustySoil(x, z))));
    for (let i = 0; i < 2600; i++) {
      const z = PLOT.z1 + 6 + hash(i, 0.83) * (EAST_SCRUB.z1 - PLOT.z1 - 8), d = 2.8 + Math.pow(hash(0.37, i), 1.2) * (EAST_SCRUB.depth - 4), x = eastEdge(z) + d;
      if (Number.isNaN(x) || SOLIDS.at(x, z, 0.8) || nearRoad(x, z, 0.8)) continue;
      const r = hash(i, 4.4), y = gh(x, z);
      if (r < 0.4) tuft(b, x, z, 0.5 + hash(i, 5) * 1.0, ['#7d8a44', '#8d9450', '#6b7a3a', '#a39a5a'][i % 4], i + 21000);
      else if (r < 0.86) shrub(leaf, CO, x, z, y, 0.7 + hash(i, 6) * 1.5, i, ['#3f6a2a', '#4d7a31', '#5b7f36', '#36602a', '#66803a', '#557331']);
      else if (r < 0.97) compactTree(leaf, wood, CO, x, z, y, 3 + hash(i, 10) * 2.2, 2.4 + hash(i, 11) * 1.8, i);
      // (the taller growth in the scrub: bushy, reaching low, not trees on bare trunks: Pair 12)
      else compactTree(leaf, wood, CO, x, z, y, 5 + hash(i, 12) * 1.8, 3.6 + hash(i, 13) * 1.6, i + 40000);
    }
    // exposed rock-like patches on the rising verge
    for (let i = 0; i < 18; i++) { const z = 612 + hash(i, 1.4) * 140, x = eastKerb(z) + 5 + hash(i, 2.4) * 8, y = gh(x, z); c.push([new THREE.DodecahedronGeometry(0.5 + hash(i, 3.4) * 0.6, 0).scale(1.5, 0.6, 1.1).translate(x - CO[0], y + 0.1, z - CO[1]), '#8f877a']); }
    // the lattice tower and its spans (Pairs 1, 12)
    for (const [x, z] of TOWERS) {
      if (Math.abs(z - CO[1]) > 200) continue;
      const at = latticeTower(c, x - CO[0], z - CO[1], gh(x, z));
      const far: V3[] = at.map((p) => [p[0] + 140, p[1] - 4, p[2] - 30]);
      for (let j = 0; j < 6; j++) { const q = at[j], f = far[j], n: V3 = [q[0] + (f[0] - q[0]) * 0.45, q[1] - 2.5, q[2] + (f[2] - q[2]) * 0.45]; c.push([rod(q, n, 0.035), '#262626']); }
      SOLIDS.add(x, z, 3.2);
    }
    // the pole billboard across the road from the planted separation (Pair 13); its face a picture panel, no copy
    {
      const [x, z] = POLE_BOARD, y = gh(x, z), [px, pz] = A(x, z);
      c.push([new THREE.CylinderGeometry(0.22, 0.28, 8, 10).translate(px, y + 4, pz), '#9da2a6']);
      c.push([box(px - 0.15, px + 0.15, y + 7.5, y + 11.5, pz - 1.6, pz + 1.6), '#e9e9e6']);
      c.push([box(px - 0.17, px + 0.17, y + 7.7, y + 11.3, pz - 1.45, pz + 1.45), '#4f8fc0']);
      SOLIDS.add(x, z, 0.35);
    }

    // ---------- along the whole stretch: branching street lights and utility poles on the east frontage ----------
    const epoles: V3[][] = [];
    for (let z = 215; z < 860; z += 38) {
      if (z > 430 && z < 520) continue; // (the station's own frontage)
      const k0 = eastKerb(z); if (Number.isNaN(k0)) continue;
      const lx = k0 + (z > PLOT.access[0] && z < PLOT.z1 ? PLOT.wallOff - 0.6 : z < 400 ? 2.3 : 1.6);
      if (!SOLIDS.at(lx, z, 1.0) && !nearRoad(lx, z, 0.3)) streetLight(c, CO, lx, z, Math.PI, { twin: z > 400 });
      const px = k0 + (z > PLOT.access[0] && z < PLOT.z1 ? PLOT.wallOff + 2.0 : z < 312 ? 13.5 : 4.2), pz = z + 19;
      if (pz < 860 && !(pz > 430 && pz < 520) && !SOLIDS.at(px, pz, 1.0) && !nearRoad(px, pz, 0.3)) epoles.push(utilityPole(c, CO, px, pz, 0, 9.5));
    }
    spans(c, epoles, 0.55);

    const m = new THREE.Mesh(merge(sane([...c, ...wood], 'legon first')), concrete(0.25)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
    b.leaf.push(...leaf, ...fr);
    b.c.push(...tr);
    b.leaf = sane(b.leaf, 'legon first leaf'); b.c = sane(b.c, 'legon first'); k.plain.splice(0, k.plain.length, ...sane(k.plain, 'legon first plain'));
    b.finish(k, 0.25);
    P.finish(k);
  },
};

/** the keep tiles (a model's keep boxes count only within 150 m of its origin, so the long boxes are laid as tiles) */
const KEEP_TILES: Spec[] = LF_KEEP.flatMap(([x0, x1, z0, z1], i) => {
  const nx = Math.ceil((x1 - x0) / 200), nz = Math.ceil((z1 - z0) / 200), out: Spec[] = [];
  for (let a = 0; a < nx; a++) for (let q = 0; q < nz; q++) {
    const ax = x0 + ((x1 - x0) * a) / nx, bx = x0 + ((x1 - x0) * (a + 1)) / nx, az = z0 + ((z1 - z0) * q) / nz, bz = z0 + ((z1 - z0) * (q + 1)) / nz;
    const org: P2 = [(ax + bx) / 2, (az + bz) / 2];
    out.push({ name: `legon first keep ${i}.${a}.${q}`, axis: [1, 0], origin: org, storey: 3, style: PLAIN, roofColor: '#9aa0a3', fascia: '#6d5a4a', pitch: 0.2, blocks: [], keep: [[ax - org[0], bx - org[0], az - org[1], bz - org[1]]], extras: () => undefined });
  }
  return out;
});

/** the Legon overhead to Okponglo stretch */
export const legonFirstSite = createSite('legon-first', [corner, station, corridor, ...KEEP_TILES]);
