// The University of Ghana Medical Centre (the owner's UGMC brief, docs/ugmc/; numbers in ugmcplan.ts). One site in the
// precinct's own frame (U along the grid, V across it, origin at the main roundabout):
// - 01 Emergency & Diagnostics: the tan clinical core, its corner wrapped round the drop-off loop by a concave dark
//   curtain wall with the silver canopy, the equipment roof (chillers, ducts, the raised enclosure and its covered run);
// - 02 Women & Children: white wings with grey bands, discrete windows on the parking front and ribbon windows on the
//   garden side, the dark signed glass bay, the raised dark gridded sloped roof, the low portal over the curved drive;
// - 03 Outpatients & Administration: tan wings round an open lawn court, the bowed dark curtain wall and its canopy;
// - 04 Medical Training & Simulation Center: white flanks, the tall dark central bay with the sign, the glazed entrance;
// - 05 the Patient Tower group: white wings and courts, tall near-blank ends either side of the low signed entrance, the
//   lattice mast; 06 the long low-roofed building (use unresolved);
// - the dark glazed bridges with open ground below; the west drop-off canopy of 01;
// - the grounds the model frame suits: dark asphalt lots with white bays and rounded islands, the roundabout's planted
//   centre, the loop's lawn and flagpoles, the UGMC lawn letters, garden 10, the courts, the security posts and totems.
// The trees, shrubs and hedges are in ugmcground.ts.
import * as THREE from 'three';
import { createSite, render, slab, tanks, window_, type Kit, type Spec, type Style } from './blocks';
import { SILVER, asphaltMat, badgeSign, chiller, curtain, duct, facing, flatMat, gridRoofMat, lawnMat, offset, parapet, plane, prism, rect, strip, mergeMeshes } from './medkit';
import { NODE_XZ, ROADS } from './campusmap';
import { wallSolids } from './enkit';
import { WHITE, box, canvas, speckle, tri2, type Part } from './modelkit';
import { SOLIDS } from './solids';
import {
  BRIDGES, CORE, CORE_ARC, FENCE, FLAGS, GARDEN, LETTER_LAWNS, LONG, LOOP, LOTS, OPD, OPD_BOW, POSTS, PT, ROUND, SIM, TOTEMS, UG, WC, WEST_CANOPY,
  arc, ugWorld, type P2, type R4,
} from './ugmcplan';

const ST = UG.storey;
const TAN = '#d9c3a0', TAN_D = '#c7ad86', OFFW = '#eceeec', BAND_G = '#b9c0c6';

// ---------- facades ----------
/** tan stone-like panels: mottled, horizontal and vertical joints */
const tanPanels = (g: CanvasRenderingContext2D) => {
  g.fillStyle = TAN; g.fillRect(0, 0, 256, 512);
  speckle(g, 0, 0, 256, 512, 2600, ['#d2ba94', '#e0cba9', '#cfb58e', '#dcc6a2']);
  g.fillStyle = 'rgba(120,96,64,0.28)';
  for (let y = 0; y < 512; y += 64) g.fillRect(0, y, 256, 2);
  for (let x = 0; x < 256; x += 128) g.fillRect(x, 0, 2, 512);
};
/** 01: the core's long rows of narrow windows (ribbon of slits) */
const TAN_STRIP: Style = {
  bay: 3.2, up: [[18, 96, 220, 54]], ground: [[18, 96, 220, 54]],
  draw: (g) => { tanPanels(g); for (const y0 of [0, 256]) { g.fillStyle = '#5a5248'; g.fillRect(14, y0 + 92, 228, 62); for (let x = 20; x < 236; x += 22) window_(g, [x, y0 + 98, 14, 50], '#7d7466', 1, 0); } },
};
/** 03: tan wings with small vertical rectangular windows in rows */
const TAN_WIN: Style = {
  bay: 2.6, up: [[100, 86, 56, 96]], ground: [[100, 86, 56, 96]],
  draw: (g) => { tanPanels(g); for (const y0 of [0, 256]) window_(g, [100, y0 + 86, 56, 96], '#8a7e6c', 1, 0); },
};
/** white panels with thin seams and a cooler grey band at each floor */
const whitePanels = (g: CanvasRenderingContext2D) => {
  g.fillStyle = OFFW; g.fillRect(0, 0, 256, 512);
  speckle(g, 0, 0, 256, 512, 1200, ['#e6e9e8', '#f2f4f3', '#e1e4e3']);
  g.fillStyle = 'rgba(120,130,138,0.25)';
  for (let y = 0; y < 512; y += 85) g.fillRect(0, y, 256, 1);
  for (let x = 0; x < 256; x += 128) g.fillRect(x, 0, 1, 512);
  for (const y0 of [0, 256]) { g.fillStyle = BAND_G; g.fillRect(0, y0 + 222, 256, 18); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(0, y0 + 222, 256, 2); }
};
/** 02 parking front, 04 flanks, 05 wings: discrete rectangular windows */
const WHITE_WIN: Style = {
  bay: 3.4, up: [[64, 96, 128, 80]], ground: [[64, 96, 128, 80]],
  draw: (g) => { whitePanels(g); for (const y0 of [0, 256]) window_(g, [64, y0 + 96, 128, 80], '#d5d9dc', 3, 0); },
};
/** 02 garden side: long continuous ribbon windows */
const WHITE_RIBBON: Style = {
  bay: 4, up: [[0, 120, 256, 46]], ground: [[0, 120, 256, 46]],
  draw: (g) => {
    whitePanels(g);
    for (const y0 of [0, 256]) {
      g.fillStyle = '#3d4852'; g.fillRect(0, y0 + 118, 256, 50);
      g.fillStyle = 'rgba(160,190,210,0.25)'; g.fillRect(0, y0 + 118, 256, 14);
      g.fillStyle = '#c9ced2'; for (let x = 0; x < 256; x += 32) g.fillRect(x, y0 + 118, 3, 50);
      g.fillStyle = '#f5f6f6'; g.fillRect(0, y0 + 168, 256, 6);
    }
  },
};
/** 04 flanks: narrow vertical window groups */
const SIM_FLANK: Style = {
  bay: 3.6, up: [[70, 90, 116, 84]], ground: [[70, 90, 116, 84]],
  draw: (g) => { whitePanels(g); for (const y0 of [0, 256]) for (const x of [70, 116, 162]) window_(g, [x, y0 + 90, 26, 84], '#dfe2e4', 1, 0); },
};
/** 05 tall end masses: blank off-white panels with faint joints (the audit, UGMC-005/006: the bands project and the one
 *  glazed strip per entrance face is built as geometry, ugmc extras) */
const TOWER_END: Style = {
  bay: 5, up: [], ground: [],
  draw: (g) => {
    g.fillStyle = OFFW; g.fillRect(0, 0, 256, 512); speckle(g, 0, 0, 256, 512, 1400, ['#e4e7e6', '#f1f3f2', '#dde1e0']);
    g.fillStyle = 'rgba(120,130,138,0.18)'; for (let y = 0; y < 512; y += 128) g.fillRect(0, y, 256, 1); for (let x = 0; x < 256; x += 128) g.fillRect(x, 0, 1, 512);
  },
};
/** 06: plain light grey cladding with a few small windows */
const GREY_LOW: Style = {
  bay: 6, up: [[110, 110, 36, 36]], ground: [[110, 110, 36, 36]],
  draw: (g) => { g.fillStyle = '#d7dadb'; g.fillRect(0, 0, 256, 512); speckle(g, 0, 0, 256, 512, 900, ['#cfd2d3', '#e0e2e3']); g.fillStyle = 'rgba(110,115,120,0.3)'; for (let x = 0; x < 256; x += 16) g.fillRect(x, 0, 1, 512); for (const y0 of [0, 256]) window_(g, [110, y0 + 110, 36, 36], '#c9cdd0', 1, 0); slab(g, 240, 12); },
};

/** a round solid in the world at a model-frame point */
const solid = (u: number, v: number, r: number) => { const [x, z] = ugWorld(u, v); SOLIDS.add(x, z, r); };
const ugPlane = (k: Kit, pts: P2[], y: number, mat: THREE.Material, tile = 0): THREE.Mesh => plane(k, pts, y, mat, tile, ugWorld);

const top4 = 0.4 + 4 * ST + 0.4, top3 = 0.4 + 3 * ST + 0.4;

/** a silver rod between two model-frame points */
const rod = (k: Kit, a: [number, number, number], b: [number, number, number], r = 0.04, col = SILVER) => {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), g = new THREE.CylinderGeometry(r, r, d.length(), 6);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
  k.plain.push([g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), col]);
};

/** the clinical entrances' canopy (the audit, UGMC-002; E14, E25, E32, E39): a flat plate whose back follows the glass
 *  `wall`, two thick silver round posts `postO` m out from the glass, the triangulated rods above (a top chord between
 *  the post heads, a zigzag down to the plate, stays back to the glass). `mid` is the wall's middle, `n` the unit normal
 *  into the forecourt; model frame. */
function trussCanopy(k: Kit, wall: P2[], mid: P2, n: P2, cw: number, depth: number, y: number, postO: number) {
  const t: P2 = [-n[1], n[0]], at = (s: number, o: number): P2 => [mid[0] + t[0] * s + n[0] * o, mid[1] + t[1] * s + n[1] * o];
  const S = (p: P2) => (p[0] - mid[0]) * t[0] + (p[1] - mid[1]) * t[1], O = (p: P2) => (p[0] - mid[0]) * n[0] + (p[1] - mid[1]) * n[1];
  /** the glass's distance out along n at s along the canopy */
  const wallO = (s: number) => { for (let i = 1; i < wall.length; i++) { const sp = S(wall[i - 1]), sq = S(wall[i]); if (sp !== sq && (s - sp) * (s - sq) <= 0) { const f = (s - sp) / (sq - sp); return O(wall[i - 1]) + (O(wall[i]) - O(wall[i - 1])) * f; } } return 0; };
  const back: P2[] = [], front: P2[] = [];
  for (let i = 0; i <= 8; i++) { const s = -cw + (cw * i) / 4; back.push(at(s, wallO(s) + 0.08)); front.push(at(s, depth)); }
  k.plain.push([prism([...front, ...back.slice().reverse()], y, y + 0.22), '#e3e6e8'], [strip(front, y - 0.06, y + 0.34, 0.14), SILVER]);
  const top = y + 2.4, ps = cw - 1.4, P = (s: number) => at(s, wallO(s) + postO);
  for (const s of [-ps, ps]) { const [px, pz] = P(s); k.plain.push([new THREE.CylinderGeometry(0.3, 0.3, top, 16).translate(px, top / 2, pz), SILVER]); solid(px, pz, 0.42); }
  const [ax, az] = P(-ps), [bx, bz] = P(ps);
  rod(k, [ax, top - 0.1, az], [bx, top - 0.1, bz], 0.07);
  for (let i = 0; i < 6; i++) { const [x0, z0] = P(-ps + (2 * ps * i) / 6), [x1, z1] = P(-ps + (2 * ps * (i + 1)) / 6), up = i % 2 === 0; rod(k, [x0, up ? y + 0.25 : top - 0.1, z0], [x1, up ? top - 0.1 : y + 0.25, z1]); }
  for (const s of [-ps, -ps / 3, ps / 3, ps]) { const [px, pz] = P(s), [gx, gz] = at(s, wallO(s)); rod(k, [px, top - 0.1, pz], [gx, y + 0.22, gz]); rod(k, [px, top - 0.1, pz], [gx, top + 1.3, gz]); }
}

/** the corrugated sheet of 01's covered roof runs: ribs across the run (R038) */
let CORR: THREE.MeshStandardMaterial | null = null;
const corrMat = () => (CORR ??= new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.25, map: (() => {
  const t = canvas(64, 64, (g) => { g.fillStyle = '#cfb47e'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 16) { g.fillStyle = '#b59a68'; g.fillRect(0, y, 64, 5); g.fillStyle = '#e0c99a'; g.fillRect(0, y + 8, 64, 3); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })() }));
/** 01's angular covered run (the audit, UGMC-003; R030, R037, R038): a low walled run 2.6 m wide under a shallow
 *  corrugated gable, on short legs, with square caps where it turns; model frame */
function coveredRun(k: Kit, pts: P2[], y: number, base: number) {
  const sh = new THREE.Shape([new THREE.Vector2(-1.3, 0), new THREE.Vector2(1.3, 0), new THREE.Vector2(1.3, 0.85), new THREE.Vector2(0, 1.35), new THREE.Vector2(-1.3, 0.85)]);
  const geos: THREE.BufferGeometry[] = [];
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i], l = Math.hypot(bx - ax, bz - az);
    geos.push(new THREE.ExtrudeGeometry(sh, { depth: l, bevelEnabled: false }).rotateY(Math.atan2(bx - ax, bz - az)).translate(ax, y, az));
    for (let d = 1.5; d < l; d += 3) for (const o of [-1.1, 1.1]) { const x = ax + ((bx - ax) * d) / l + ((bz - az) / l) * o, z = az + ((bz - az) * d) / l - ((bx - ax) / l) * o; k.plain.push([box(x - 0.07, x + 0.07, base, y, z - 0.07, z + 0.07), '#9a8f7c']); }
  }
  const m = new THREE.Mesh(mergeGeometriesUV(geos), corrMat()); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  for (const [x, z] of pts.slice(1, -1)) k.plain.push([box(x - 1.45, x + 1.45, y, y + 1.4, z - 1.45, z + 1.45), '#c4a873']);
}
const mergeGeometriesUV = (geos: THREE.BufferGeometry[]) => {
  const pos: number[] = [], nrm: number[] = [], uv: number[] = [];
  for (const g0 of geos) { const g = g0.index ? g0.toNonIndexed() : g0; pos.push(...(g.attributes.position.array as Float32Array)); nrm.push(...(g.attributes.normal.array as Float32Array)); uv.push(...(g.attributes.uv.array as Float32Array)); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return g;
};
/** a pale pipe run on low supports (01's roof circuit, separate from the covered run) */
function pipe(k: Kit, pts: P2[], y: number, r = 0.18) {
  for (let i = 1; i < pts.length; i++) rod(k, [pts[i - 1][0], y, pts[i - 1][1]], [pts[i][0], y, pts[i][1]], r, '#eef0ee');
  for (const [x, z] of pts) k.plain.push([new THREE.SphereGeometry(r * 1.15, 8, 6).translate(x, y, z), '#eef0ee'], [box(x - 0.1, x + 0.1, top4, y - r, z - 0.1, z + 0.1), '#9aa0a5']);
}

/** paired projecting bands round a box at height y (the Patient Tower's end masses, UGMC-006; E24, E41), broken over
 *  [g0, g1] along V on the +U (entrance) face where the glazed strip runs */
function bands(k: Kit, [x0, x1, z0, z1]: R4, y: number, gap: P2) {
  const C = '#f3f4f3';
  for (const [h, p, dy] of [[0.34, 0.32, 0], [0.12, 0.16, 0.62]]) {
    const y0 = y + dy, y1 = y0 + h;
    k.plain.push([box(x0 - p, x1 + p, y0, y1, z0 - p, z0), C], [box(x0 - p, x1 + p, y0, y1, z1, z1 + p), C], [box(x0 - p, x0, y0, y1, z0, z1), C]);
    k.plain.push([box(x1, x1 + p, y0, y1, z0, gap[0]), C], [box(x1, x1 + p, y0, y1, gap[1], z1), C]);
  }
}

/** the perimeter fence round the community (FENCE): a low concrete kerb, pale square posts every 3 m and a dark
 *  palisade between them, 2.1 m; a gap wherever a road crosses its line (the gates) */
let PALI: THREE.MeshStandardMaterial | null = null;
const ROAD_HALF = [4.5, 3.7, 3.1, 2.3, 1.3];
function perimeterFence(k: Kit) {
  PALI ??= new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, alphaTest: 0.5, roughness: 0.6, metalness: 0.3, map: (() => {
    const t = canvas(32, 64, (g) => { g.clearRect(0, 0, 32, 64); g.fillStyle = '#3c4247'; g.fillRect(12, 2, 6, 62); g.fillRect(0, 6, 32, 4); g.fillRect(0, 52, 32, 4); g.beginPath(); g.moveTo(10, 3); g.lineTo(15, 0); g.lineTo(20, 3); g.fill(); });
    t.wrapS = THREE.RepeatWrapping; return t; })() });
  const xs = FENCE.map((p) => ugWorld(p[0], p[1])), X0 = Math.min(...xs.map((p) => p[0])) - 20, X1 = Math.max(...xs.map((p) => p[0])) + 20, Z0 = Math.min(...xs.map((p) => p[1])) - 20, Z1 = Math.max(...xs.map((p) => p[1])) + 20;
  const roads = ROADS.map((r) => ({ h: ROAD_HALF[r.cls] ?? 2, pts: r.nodes.map((n) => [NODE_XZ[n * 2], NODE_XZ[n * 2 + 1]] as P2) })).filter((r) => r.pts.some(([x, z]) => x > X0 && x < X1 && z > Z0 && z < Z1));
  const segD = (x: number, z: number, [ax, az]: P2, [bx, bz]: P2) => { const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)); return Math.hypot(x - ax - dx * f, z - az - dz * f); };
  const onRoad = (u: number, v: number) => { const [x, z] = ugWorld(u, v); return roads.some(({ h, pts }) => pts.some((p, i) => i > 0 && segD(x, z, pts[i - 1], p) < h + 1.6)); };
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 1; i < FENCE.length; i++) {
    const [au, av] = FENCE[i - 1], [bu, bv] = FENCE[i], L = Math.hypot(bu - au, bv - av), n = Math.max(1, Math.round(L / 3)), ang = -Math.atan2(bv - av, bu - au);
    for (let j = 0; j < n; j++) {
      const u0 = au + ((bu - au) * j) / n, v0 = av + ((bv - av) * j) / n, u1 = au + ((bu - au) * (j + 1)) / n, v1 = av + ((bv - av) * (j + 1)) / n, l = L / n;
      if (onRoad(u0, v0) || onRoad(u1, v1) || onRoad((u0 + u1) / 2, (v0 + v1) / 2)) continue;
      k.plain.push([new THREE.BoxGeometry(l, 0.3, 0.28).rotateY(ang).translate((u0 + u1) / 2, 0.15, (v0 + v1) / 2), '#d6d4cc']);
      for (const [u, v] of [[u0, v0], [u1, v1]]) k.plain.push([box(u - 0.12, u + 0.12, 0, 2.2, v - 0.12, v + 0.12), '#e4e2dc']);
      const b = pos.length / 3;
      pos.push(u0, 0.3, v0, u1, 0.3, v1, u1, 2.1, v1, u0, 2.1, v0); uv.push(0, 0, l / 0.16, 0, l / 0.16, 1, 0, 1); idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
      const [wx0, wz0] = ugWorld(u0, v0), [wx1, wz1] = ugWorld(u1, v1); wallSolids(wx0, wz0, wx1, wz1, 0.2);
    }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  k.meshes.push(new THREE.Mesh(g, PALI));
}

const ugmc: Spec = {
  name: 'University of Ghana Medical Centre',
  axis: UG.axis, origin: UG.origin, storey: ST, style: WHITE_WIN, roofColor: '#d6d6d2', fascia: '#e9eae8', pitch: 0.12,
  // the lots: the model paves them (dark asphalt, bays, islands) and their cars always stand (life.ts)
  covers: LOTS.map((l) => { const us = l.ring.map((p) => p[0]), vs = l.ring.map((p) => p[1]); return ugWorld((Math.min(...us) + Math.max(...us)) / 2, (Math.min(...vs) + Math.max(...vs)) / 2); }),
  // the old outlines of 01-06 and the small ones inside them (their rings are reshaped to these models, corrections.json)
  replaces: [...POSTS.map(([u, v]) => ugWorld(u, v)), ugWorld(-60, 45), ugWorld(-56, -40), ugWorld(-40, -40), ugWorld(-55, -42), ugWorld(30, 60), ugWorld(45, 60), ugWorld(45, 68), ugWorld(40, -40), ugWorld(-64, 125), ugWorld(-130, 115)],
  blocks: [
    // 01 the core (tan, four storeys) less the curved corner (extras)
    { x0: CORE.x0, x1: -46.92, z0: CORE.z0, z1: CORE.z1, floors: 4, roof: 'flat', faces: { z0: TAN_STRIP, x0: TAN_STRIP, z1: TAN_STRIP, x1: TAN_STRIP } },
    { x0: -46.92, x1: CORE.x1, z0: 34.68, z1: CORE.z1, floors: 4, roof: 'flat', faces: { z0: TAN_STRIP, x1: TAN_STRIP, z1: TAN_STRIP, x0: TAN_STRIP } },
    // 02 Women & Children (white, four storeys; the inner block two)
    { x0: WC.front[0], x1: WC.front[1], z0: WC.front[2], z1: WC.front[3], floors: 4, roof: 'flat', faces: { x0: WHITE_RIBBON } },
    { x0: WC.west[0], x1: WC.west[1], z0: WC.west[2], z1: WC.west[3], floors: 4, roof: 'flat', faces: { x0: WHITE_RIBBON, x1: WHITE_RIBBON } },
    { x0: WC.east[0], x1: WC.east[1], z0: WC.east[2], z1: WC.east[3], floors: 4, roof: 'flat' },
    { x0: WC.eastS[0], x1: WC.eastS[1], z0: WC.eastS[2], z1: WC.eastS[3], floors: 4, roof: 'flat' },
    { x0: WC.south[0], x1: WC.south[1], z0: WC.south[2], z1: WC.south[3], floors: 4, roof: 'flat', faces: { z1: WHITE_RIBBON } },
    { x0: WC.inner[0], x1: WC.inner[1], z0: WC.inner[2], z1: WC.inner[3], floors: 2, roof: 'flat' },
    // 03 Outpatients & Administration (tan, three storeys) round the open court
    ...[OPD.north, OPD.west, OPD.east, OPD.south].map((r) => ({ x0: r[0], x1: r[1], z0: r[2], z1: r[3], floors: OPD.floors, roof: 'flat' as const, faces: { z0: TAN_WIN, z1: TAN_WIN, x0: TAN_WIN, x1: TAN_WIN } })),
    // 04 the training centre (white, three storeys)
    { x0: SIM.box[0], x1: SIM.box[1], z0: SIM.box[2], z1: SIM.box[3], floors: SIM.floors, roof: 'flat', faces: { z0: SIM_FLANK, z1: SIM_FLANK, x0: SIM_FLANK, x1: SIM_FLANK } },
    // 05 the Patient Tower group
    ...[PT.north, PT.west, PT.south, PT.mid].map((r) => ({ x0: r[0], x1: r[1], z0: r[2], z1: r[3], floors: PT.floors, roof: 'flat' as const })),
    { x0: PT.spine[0], x1: PT.spine[1], z0: PT.spine[2], z1: PT.spine[3], floors: 5, roof: 'flat' },
    ...[PT.towerN, PT.towerS].map((r) => ({ x0: r[0], x1: r[1], z0: r[2], z1: r[3], floors: PT.towerFloors, roof: 'flat' as const, faces: { z0: TOWER_END, z1: TOWER_END, x0: TOWER_END, x1: TOWER_END } })),
    // 06 the long low building under its shallow grey roof
    { x0: LONG[0], x1: LONG[1], z0: LONG[2], z1: LONG[3], floors: 2, roof: 'flat', faces: { z0: GREY_LOW, z1: GREY_LOW, x0: GREY_LOW, x1: GREY_LOW } },
  ],
  keep: [
    // the courts, lawns, lots and forecourts the model and ugmcground.ts furnish
    [-165, -90, -75, 14], [-95, -20, -8, 12], [-45, -2, -2, 32], [-16, 8, -18, 9], [7, 45, 30, 71], [-80, -48, 104, 145], [-28, -14, 100, 150],
    [-142, -30, -118, -83], [8, 50, 98, 162], [-266, -184, 15, 82.5], [-104.5, -93, 38, 58], [-27, -14, -45, -29],
  ],
  extras: (k) => {
    // ===== 01: the curved corner, its curtain wall, canopy, sign; the roof; the west canopy =====
    const fill: P2[] = [[-46.92, 12], ...CORE_ARC.slice(1, -1), [CORE.x1, 34.68], [-46.92, 34.68]];
    k.plain.push([prism(fill, 0, top4), TAN_D]);
    curtain(k, CORE_ARC.map(([x, z]) => { const c = CORE.arc.c, d = Math.hypot(x - c[0], z - c[1]); return [x - ((x - c[0]) / d) * 0.05, z - ((z - c[1]) / d) * 0.05] as P2; }), 0.3, top4 + 1.2);
    parapet(k, [CORE.x0, -46.92, CORE.z0, CORE.z1], top4, '#d8c6a6'); parapet(k, [-46.92, CORE.x1, 34.68, CORE.z1], top4, '#d8c6a6');
    { const c = CORE.arc.c, r = CORE.arc.r, mid = CORE_ARC[8], dx = c[0] - mid[0], dz = c[1] - mid[1], l = Math.hypot(dx, dz), nx = dx / l, nz = dz / l;
      // the flat canopy on two thick silver posts with the triangulated rods above it (the audit, UGMC-002; E32), its back
      // following the concave glass; the posts stand on the walk, the drop-off drive stays clear
      trussCanopy(k, CORE_ARC, mid, [nx, nz], 5.5, 3.6, 4.6, 1.0);
      // glass doors at the foot of the curtain wall under the canopy
      k.glass.push(strip(arc(c, r - 0.12, 132, 142, 3), 0.3, 3.2, 0.05));
      badgeSign(k, 'Emergency & Diagnostics', '1', '#d4a017', mid[0] + nx * 0.6, top4 - 1.4, mid[1] + nz * 0.6, facing(nx, nz), 9.5);
    }
    // the roof: pale weathered membrane, chiller clusters, duct runs, the raised enclosure and the angular covered run
    k.plain.push([box(CORE.x0 + 0.3, -47.2, top4 + 0.02, top4 + 0.06, CORE.z0 + 0.3, CORE.z1 - 0.3), '#d9d8d2']);
    for (const [cx, cz, n, al] of [[-84, 24, 4, true], [-84, 66, 3, true], [-38, 66, 3, false], [-56, 70, 4, true]] as [number, number, number, boolean][]) for (let i = 0; i < n; i++) chiller(k, cx + (al ? (i % 2) * 2.8 : i * 1.6), cz + (al ? Math.floor(i / 2) * 1.8 : 0), top4 + 0.06, al);
    k.plain.push([box(-70, -60, top4, top4 + 3.4, 38, 48), '#e3e1da'], [box(-70.3, -59.7, top4 + 3.4, top4 + 3.6, 37.7, 48.3), '#c9c6bd']);
    tanks(k, [[-66, 43]], top4 + 3.6, 0.6);
    // the angular covered run round the raised enclosure (corrugated, on legs), the large chiller housings and the separate
    // pale pipe circuit between them and the enclosure (the audit, UGMC-003/004; R038) [ASSUMPTION: positions from R038's
    // oblique view against M1, not surveyed]
    coveredRun(k, [[-80, 30], [-72, 34], [-72, 52], [-58, 56], [-50, 50], [-50, 36], [-58, 30]], top4 + 0.55, top4);
    for (const u of [-64, -60.5, -57]) {
      k.plain.push([box(u - 1.3, u + 1.3, top4, top4 + 0.25, 59.3, 65.5), '#9aa0a5'], [box(u - 1.2, u + 1.2, top4 + 0.25, top4 + 2.1, 59.5, 65.3), '#d3d6d8']);
      for (let i = 0; i < 3; i++) for (const o of [-0.6, 0.6]) k.plain.push([new THREE.CylinderGeometry(0.5, 0.5, 0.08, 14).translate(u + o, top4 + 2.14, 60.5 + i * 1.9), '#3b3f43']);
    }
    pipe(k, [[-64, 59.2], [-64, 48.1]], top4 + 0.3); pipe(k, [[-60.5, 59.2], [-60.5, 53.5], [-61.2, 52.6], [-61.2, 48.1]], top4 + 0.3);
    pipe(k, [[-57, 59.2], [-57, 57.6], [-52.2, 57.6], [-52.2, 44], [-59.9, 44]], top4 + 0.3);
    duct(k, [[-88, 30], [-88, 60], [-75, 60]], top4 + 0.4); duct(k, [[-45, 40], [-45, 74], [-30, 74]], top4 + 0.4); duct(k, [[-60, 16], [-90, 16]], top4 + 0.4, '#b9bdc0');
    // the west drop-off canopy on posts (M1: the short projecting block over the oval loop)
    { const [x0, x1, z0, z1] = WEST_CANOPY;
      k.plain.push([box(x0, x1, 4.6, 5.3, z0, z1), '#ecedeb'], [box(x0 - 0.05, x0 + 0.05, 4.4, 5.3, z0, z1), SILVER]);
      for (const z of [z0 + 0.6, z1 - 0.6]) { k.plain.push([box(x0 + 0.3, x0 + 0.7, 0, 4.6, z - 0.2, z + 0.2), WHITE]); solid(x0 + 0.5, z, 0.35); }
      k.signs.push({ text: 'EMERGENCY', x: x0 - 0.06, y: 5.0, z: (z0 + z1) / 2, ry: -Math.PI / 2, w: 4, colors: ['#c62828', '#ffffff'] }); }

    // ===== 02: the signed bay, the vertical glazing, the gridded sloped roof, the portal, the emblem =====
    { const [b0, b1] = WC.bay, z = WC.front[2], pts: P2[] = Array.from({ length: 7 }, (_, i) => { const t = i / 6; return [b0 + (b1 - b0) * t, z - 0.4 - Math.sin(Math.PI * t) * 1.4] as P2; });
      k.plain.push([prism([...pts, [b1, z + 0.5], [b0, z + 0.5]], 0, top4 + 1.4), '#2d3a45']);
      curtain(k, pts.map(([x, zz]) => [x, zz - 0.1] as P2), 0.3, top4 + 1.4);
      badgeSign(k, 'Women & Children', '2', '#2e9d4f', (b0 + b1) / 2, top4 - 1.6, z - 1.9, Math.PI, 7.5); }
    // full-height dark glazing at the signed corner and the wing ends
    for (const [x, z0, z1] of [[-90, -66.5, -63.5], [-90, -20, -16]] as [number, number, number][]) curtain(k, [[x - 0.12, z0], [x - 0.12, z1]], 0.3, top4);
    curtain(k, [[-24.5, -70.12], [-28.5, -70.12]], 0.3, top4);
    k.signs.push({ text: '2', x: WC.west[0] - 0.08, y: top4 - 1.6, z: -64.5, ry: -Math.PI / 2, w: 1.6, colors: ['#2e9d4f', '#ffffff'] });
    for (const r of [WC.front, WC.west, WC.east, WC.eastS, WC.south] as R4[]) parapet(k, r, top4);
    { const [x0, x1, z0, z1] = WC.gridRoof, y0 = top4 + 0.3, y1 = top4 + 4.2;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([x0, y0, z0, x1, y1, z0, x1, y1, z1, x0, y0, z1], 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, (x1 - x0) / 4, 0, (x1 - x0) / 4, (z1 - z0) / 4, 0, (z1 - z0) / 4], 2));
      g.setIndex([0, 2, 1, 0, 3, 2]); g.computeVertexNormals();
      const m = new THREE.Mesh(g, gridRoofMat()); m.castShadow = true; k.meshes.push(m);
      for (const z of [z0, z1]) k.plain.push([tri2([x0, y0 - 0.3, z], [x1, y0 - 0.3, z], [x1, y1, z]), '#e6e7e5'], [tri2([x1, y1, z], [x1, y0 - 0.3, z], [x0, y0 - 0.3, z]), '#e6e7e5']);
      k.plain.push([box(x1 - 0.3, x1, y0 - 0.3, y1, z0, z1), '#e6e7e5']); }
    for (let i = 0; i < 6; i++) chiller(k, -40 + (i % 3) * 2.8, -62 + Math.floor(i / 3) * 2, top4, true);
    { const [x0, x1, z0, z1] = WC.portal;
      k.plain.push([box(x0, x1, 4.6, 5.6, z0, z1), '#f1f2f1'], [box(x1 - 0.5, x1, 3.6, 5.6, z0, z1), '#f1f2f1']);
      for (const z of [z0 + 0.6, z1 - 0.6]) { k.plain.push([box(x1 - 0.9, x1 - 0.3, 0, 4.6, z - 0.3, z + 0.3), '#f1f2f1']); solid(x1 - 0.6, z, 0.45); }
      badgeSign(k, 'Women & Children', '2', '#2e9d4f', x1 + 0.02, 4.9, (z0 + z1) / 2 + 0.6, Math.PI / 2, 5.2, '#f1f2f1', '#2e9d4f');
      k.glass.push(box(x0 - 0.1, x0, 0.3, 3.2, z0 + 3, z1 - 3)); }

    // ===== 03: the bow, its curtain wall, canopy and sign; the court =====
    { const h = top3 + 2.2, fillPts: P2[] = [...OPD_BOW, [12, 32]];
      k.plain.push([prism(fillPts, 0, h), TAN_D]);
      curtain(k, offset(OPD_BOW, -0.12), 0.3, h);
      parapet(k, OPD.north, top3, '#d8c6a6'); parapet(k, OPD.west, top3, '#d8c6a6'); parapet(k, OPD.east, top3, '#d8c6a6'); parapet(k, OPD.south, top3, '#d8c6a6');
      const a = OPD.bow.a, b = OPD.bow.b, mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz), nx = dz / l, nz = -dx / l;
      const ax2 = mx + nx * OPD.bow.bulge, az2 = mz + nz * OPD.bow.bulge;
      badgeSign(k, 'Outpatients & Administration', '3', '#1f6fc4', ax2 + nx * 0.6, h - 1.3, az2 + nz * 0.6, facing(nx, nz), 10.5);
      // the flat canopy on two thick silver posts with the triangulated rods above it (E25, E39)
      trussCanopy(k, OPD_BOW, [ax2, az2], [nx, nz], 4.6, 4.2, 4.6, 3.0);
      const ux = dx / l, uz = dz / l;
      k.glass.push(new THREE.BoxGeometry(5, 2.9, 0.1).rotateY(-Math.atan2(uz, ux)).translate(ax2 - nx * 0.1, 1.75, az2 - nz * 0.1));
      // the court: lawn, the diagonal paver path and the paths along the wings
      ugPlane(k, rect(OPD.court), 0.04, lawnMat(), 4);
      k.plain.push([strip([[9, 33], [43, 69]], 0.05, 0.08, 1.1), '#b98c66'], [strip([[9, 34], [9, 69], [43, 69]], 0.05, 0.08, 0.9), '#b98c66']); }
    // roof units on 03
    for (let i = 0; i < 5; i++) chiller(k, 20 + i * 6, 22, top3, true);
    k.plain.push([box(48, 55, top3, top3 + 2.6, 40, 50), '#d8c6a6']);

    // ===== 04: the tall dark bay, the sign, the glazed entrance and its canopy, the gridded roof =====
    { const [b0, b1] = SIM.bay, z = SIM.box[3], h = top3 + 2.6, pts: P2[] = Array.from({ length: 7 }, (_, i) => { const t = i / 6; return [b0 + (b1 - b0) * t, z + 0.4 + Math.sin(Math.PI * t) * 1.2] as P2; });
      k.plain.push([prism([[b0, z - 0.5], ...pts, [b1, z - 0.5]], 0, h), '#28333d']);
      curtain(k, pts.map(([x, zz]) => [x, zz + 0.1] as P2), 0.3, h);
      k.signs.push({ text: 'Medical Training &', x: (b0 + b1) / 2, y: h - 1.3, z: z + 1.75, ry: 0, w: 6.4, colors: ['#26313b', '#ffffff'] });
      k.signs.push({ text: 'Simulation Center', x: (b0 + b1) / 2, y: h - 2.25, z: z + 1.75, ry: 0, w: 6.0, colors: ['#26313b', '#ffffff'] });
      // the lower dark glazed entrance spread and the light canopy on angled stays (E18)
      curtain(k, [[30.5, z + 0.15], [51.5, z + 0.15]], 0.3, 4.2);
      k.plain.push([box(37, 45, 3.9, 4.1, z, z + 2.4), '#e6e8ea']);
      for (const x of [38, 40.5, 43, 44]) { const g = new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6), d = new THREE.Vector3(0, 1.6, -2.0).normalize(); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d)); k.plain.push([g.translate(x, 4.8, z + 1.2), SILVER]); }
      parapet(k, SIM.box, top3);
      const [x0, x1, z0, z1] = SIM.gridRoof, y0 = top3 + 0.2, y1 = top3 + 3.2, g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([x0, y0, z1, x1, y0, z1, x1, y1, z0, x0, y1, z0], 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, (x1 - x0) / 4, 0, (x1 - x0) / 4, (z1 - z0) / 4, 0, (z1 - z0) / 4], 2));
      g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals();
      const m = new THREE.Mesh(g, gridRoofMat()); m.castShadow = true; k.meshes.push(m);
      k.plain.push([box(x0, x1, y0 - 0.2, y1, z0, z0 + 0.3), '#e6e7e5']);
      for (const x of [x0, x1]) k.plain.push([tri2([x, y0 - 0.2, z1], [x, y1, z0], [x, y0 - 0.2, z0]), '#e6e7e5'], [tri2([x, y0 - 0.2, z0], [x, y1, z0], [x, y0 - 0.2, z1]), '#e6e7e5']);
      for (let i = 0; i < 4; i++) chiller(k, 26 + i * 2.8, -58, top3, true); }

    // ===== 05: the end masses (one glazed strip each, paired bands), the glazed bay and base behind the recess, the low
    // panelled portal, the mast; the drive-in, pavers, the shrub bed (the audit, UGMC-005 to 009, 013; E16, E24, E41) =====
    for (const r of [PT.north, PT.west, PT.south, PT.mid] as R4[]) parapet(k, r, top4);
    parapet(k, PT.spine, 0.4 + 5 * ST + 0.4);
    { const tt = 0.4 + PT.towerFloors * ST + 0.4, E = PT.portal, hw = PT.strip / 2;
      for (const r of [PT.towerN, PT.towerS]) {
        const x1 = r[1], vc = (r[2] + r[3]) / 2;
        parapet(k, r, tt);
        // the one dark glazed strip up the middle of the entrance face, the door at its foot
        k.plain.push([box(x1 - 0.05, x1 + 0.02, 0, tt - 0.3, vc - hw, vc + hw), '#26303a']);
        curtain(k, [[x1 + 0.06, vc - hw], [x1 + 0.06, vc + hw]], 0, tt - 0.3);
        k.glass.push(box(x1 + 0.1, x1 + 0.16, 0.05, 2.5, vc - 0.85, vc + 0.85));
        k.plain.push([box(x1 + 0.08, x1 + 0.6, 2.55, 2.7, vc - 1.1, vc + 1.1), '#e9ebec']);
        for (let f = 1; f <= PT.towerFloors; f++) bands(k, r, 0.4 + f * ST - 0.45, [vc - hw - 0.25, vc + hw + 0.25]);
      }
      k.signs.push({ text: '5', x: PT.towerN[1] + 0.25, y: tt - 2, z: PT.towerN[2] + 2.5, ry: Math.PI / 2, w: 1.5, colors: ['#5b6670', '#ffffff'] });
      // the glazed bay up the block behind the recess, the dark glazed two-storey base with the doors under the portal
      curtain(k, [[PT.mid[1] + 0.08, PT.bay[0]], [PT.mid[1] + 0.08, PT.bay[1]]], 0.3, top4 + 0.6);
      { const [b0, b1, c0, c1] = PT.glassBase, h = 0.4 + 2 * ST;
        k.plain.push([box(b0, b1, 0, h, c0, c1), '#2d3a45'], [box(b0, b1 + 0.15, h, h + 0.4, c0, c1 + 0.15), '#e9ebec']);
        curtain(k, [[b1 + 0.06, c0], [b1 + 0.06, c1]], 0.3, h); curtain(k, [[b0, c1 + 0.06], [b1, c1 + 0.06]], 0.3, h);
        k.glass.push(box(b1 + 0.1, b1 + 0.16, 0.05, 2.6, E.vOpen + 1, E.v1 - 1)); }
      // the low panelled portal: the roof and fascia over the closed part and the open drive-in shelter, the closed part's
      // front screen with its square openings and its end wall, the two slender round columns, the panel joints, the sign
      const PC = '#d5d9dc', PJ = '#b7bdc2';
      k.plain.push([box(E.u0, E.u1, 4.6, E.h, E.v0, E.v1), PC]);
      { const x = E.u1, ops: P2[] = [[118.2, 120.2], [121.4, 123.4]];
        k.plain.push([box(x - 0.3, x, 0, 0.9, E.v0, E.vOpen), PC], [box(x - 0.3, x, 3.0, 4.6, E.v0, E.vOpen), PC]);
        let v = E.v0; for (const [a, b] of ops) { k.plain.push([box(x - 0.3, x, 0.9, 3.0, v, a), PC]); v = b; } k.plain.push([box(x - 0.3, x, 0.9, 3.0, v, E.vOpen), PC]);
        k.plain.push([box(E.u0, x, 0, 4.6, E.vOpen - 0.3, E.vOpen), PC]);
        for (let jv = E.v0 + 1.5; jv < E.v1; jv += 1.5) k.plain.push([box(x, x + 0.02, jv < E.vOpen ? 0 : 4.6, E.h, jv - 0.025, jv + 0.025), PJ]);
        k.plain.push([box(x, x + 0.02, 3.0, 3.05, E.v0, E.vOpen), PJ], [box(E.u0, x, E.h - 0.02, E.h + 0.04, E.v1, E.v1 + 0.02), PJ]); }
      for (const [cu, cv] of E.cols) { k.plain.push([new THREE.CylinderGeometry(0.2, 0.2, 4.6, 12).translate(cu, 2.3, cv), '#e9ebec']); solid(cu, cv, 0.3); }
      badgeSign(k, 'Patient Tower', '5', '#d4a017', E.u1 + 0.03, 5.2, (E.vOpen + E.v1) / 2, Math.PI / 2, 4.4, '#d5d9dc', '#2f3a44');
      // the lattice mast over the south end mass (left of the entrance seen from the drive: E24, E41)
      const mx = (PT.towerS[0] + PT.towerS[1]) / 2 + 2, mz = (PT.towerS[2] + PT.towerS[3]) / 2;
      for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; k.plain.push([new THREE.CylinderGeometry(0.06, 0.08, 9, 5).translate(mx + Math.cos(a) * 0.6, tt + 4.5, mz + Math.sin(a) * 0.6), '#9aa0a5']); }
      for (let y = tt + 1; y < tt + 9; y += 1.2) k.plain.push([new THREE.TorusGeometry(0.6, 0.03, 4, 3).rotateX(Math.PI / 2).translate(mx, y, mz), '#9aa0a5']);
      for (const a of [0, 2.1, 4.2]) k.plain.push([box(mx + Math.cos(a) * 0.9 - 0.25, mx + Math.cos(a) * 0.9 + 0.25, tt + 7.5, tt + 8.6, mz + Math.sin(a) * 0.9 - 0.12, mz + Math.sin(a) * 0.9 + 0.12), '#d9dcde']);
      for (let i = 0; i < 6; i++) chiller(k, -88 + (i % 3) * 2.8, 96 + Math.floor(i / 3) * 2, top4, true);
      // the drive in under the shelter (asphalt from the loop), the tan paver floor and the paver walk along the south end
      ugPlane(k, rect([E.u1, -29.3, E.vOpen + 0.1, E.v1 - 0.1]), 0.05, asphaltMat(), 6);
      ugPlane(k, rect([E.u0, E.u1, E.vOpen, E.v1]), 0.06, flatMat('#b98c66', 4));
      ugPlane(k, rect([PT.towerS[1], PT.towerS[1] + 2.6, E.v1, PT.towerS[3]]), 0.06, flatMat('#b98c66', 4));
      // the curved shrub bed in its white pebble border before the closed part, the small white-flowering tree, the bench
      k.plain.push([prism(PT.bed, 0, 0.22), '#4a3c2c'], [strip([...PT.bed, PT.bed[0]], 0, 0.2, 0.45), '#eeece6']);
      { const us = PT.bed.map((p) => p[0]), vs = PT.bed.map((p) => p[1]), inBed = (u: number, v: number) => { let c = false; for (let i = 0, j = PT.bed.length - 1; i < PT.bed.length; j = i++) { const [a, b] = PT.bed[i], [e, f] = PT.bed[j]; if (b > v !== f > v && u < ((e - a) * (v - b)) / (f - b) + a) c = !c; } return c; };
        let n = 0;
        for (let u = Math.min(...us) + 0.7; u < Math.max(...us); u += 1.0) for (let v = Math.min(...vs) + 0.7; v < Math.max(...vs); v += 1.0) {
          if (!inBed(u, v) || Math.hypot(u - PT.tree[0], v - PT.tree[1]) < 0.9) continue;
          const jit = ((n * 7919) % 13) / 26, col = ['#3d5e2b', '#7a2a36', '#4c6b30', '#8a3340'][n++ % 4];
          k.plain.push([new THREE.IcosahedronGeometry(0.55 + jit * 0.3, 1).scale(1.1, 0.75, 1.1).translate(u + jit - 0.25, 0.55, v - jit + 0.25), col]);
        }
        for (let i = 1; i < PT.bed.length; i++) { const [a0, b0] = ugWorld(...PT.bed[i - 1]), [a1, b1] = ugWorld(...PT.bed[i]); wallSolids(a0, b0, a1, b1, 0.3); } }
      { const [tu, tv] = PT.tree;
        k.plain.push([new THREE.CylinderGeometry(0.07, 0.1, 1.9, 6).translate(tu, 1.15, tv), '#6b5a48'], [new THREE.IcosahedronGeometry(1.1, 1).scale(1, 0.85, 1).translate(tu, 2.6, tv), '#4f7a35']);
        for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 0.75 + (i % 3) * 0.15; k.plain.push([new THREE.IcosahedronGeometry(0.16, 0).translate(tu + Math.cos(a) * r, 2.3 + (i % 4) * 0.25, tv + Math.sin(a) * r), '#f6f4ee']); }
        solid(tu, tv, 0.3); }
      { const [bu, bv] = PT.bench; k.plain.push([box(bu - 0.25, bu + 0.25, 0.38, 0.5, bv - 0.9, bv + 0.9), '#ecebe6'], [box(bu - 0.22, bu + 0.22, 0, 0.38, bv - 0.85, bv - 0.55), '#e2e1db'], [box(bu - 0.22, bu + 0.22, 0, 0.38, bv + 0.55, bv + 0.85), '#e2e1db']); solid(bu, bv, 0.6); }
    }
    // the courts of 05: lawn and paver paths
    for (const r of [[-80, -71, 104, 145], [-60, -48, 104, 117], [-60, -48, 132, 145]] as R4[]) ugPlane(k, rect(r), 0.04, lawnMat(), 4);

    // ===== the bridges: enclosed dark glazing on slender supports, open ground below =====
    for (const b of BRIDGES) {
      const [x0, x1, z0, z1] = b.r;
      k.plain.push([box(x0, x1, b.y0, b.y0 + 0.5, z0, z1), '#eceeed'], [box(x0, x1, b.y1, b.y1 + 0.4, z0, z1), '#eceeed']);
      const side = b.along === 'z' ? [[[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]] : [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]]];
      for (const s of side as [P2, P2][]) curtain(k, s, b.y0 + 0.5, b.y1);
      const L = b.along === 'z' ? z1 - z0 : x1 - x0;
      for (const t of [L / 3, (2 * L) / 3]) for (const o of [0.6, -0.6]) {
        const [px, pz] = b.along === 'z' ? [o > 0 ? x0 + 0.6 : x1 - 0.6, z0 + t] : [x0 + t, o > 0 ? z0 + 0.6 : z1 - 0.6];
        k.plain.push([new THREE.CylinderGeometry(0.22, 0.22, b.y0, 12).translate(px, b.y0 / 2, pz), SILVER]); solid(px, pz, 0.35);
      }
    }

    // ===== 06: the shallow gable over the long low building, its sheet seams running lengthwise (the audit, UGMC-012;
    // M1, R026, R030); low, independent of 05 =====
    { const [x0, x1, z0, z1] = LONG, ey = 0.4 + 2 * ST + 0.4, ry = ey + 2.1, xm = (x0 + x1) / 2, o = 0.4;
      const seam = canvas(128, 32, (g) => { g.fillStyle = '#c4c8ca'; g.fillRect(0, 0, 128, 32); speckle(g, 0, 0, 128, 32, 160, ['#bcc0c2', '#cbcfd1']); g.fillStyle = 'rgba(90,96,102,0.35)'; for (let x = 0; x < 128; x += 21) g.fillRect(x, 0, 1, 32); g.fillStyle = 'rgba(70,76,82,0.6)'; g.fillRect(0, 0, 2, 32); });
      seam.wrapS = seam.wrapT = THREE.RepeatWrapping;
      const mat = new THREE.MeshStandardMaterial({ map: seam, roughness: 0.7, metalness: 0.2, side: THREE.DoubleSide });
      for (const [xa, xb] of [[x0 - o, xm], [x1 + o, xm]]) {
        const ya = ey - 0.12, g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute([xa, ya, z0 - o, xb, ry, z0 - o, xb, ry, z1 + o, xa, ya, z1 + o], 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute([xa / 6, z0 / 6, xb / 6, z0 / 6, xb / 6, z1 / 6, xa / 6, z1 / 6], 2));
        g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals();
        const m = new THREE.Mesh(g, mat); m.castShadow = true; k.meshes.push(m);
      }
      for (const z of [z0, z1]) k.plain.push([tri2([x0, ey, z], [xm, ry, z], [x1, ey, z]), '#d7dadb'], [tri2([x1, ey, z], [xm, ry, z], [x0, ey, z]), '#d7dadb']);
      k.plain.push([box(xm - 0.2, xm + 0.2, ry - 0.05, ry + 0.12, z0 - o, z1 + o), '#aeb3b6']); }

    // ===== the perimeter fence round the community =====
    perimeterFence(k);

    // ===== the grounds =====
    // the lots: dark asphalt, white bays, the rounded beige islands with their kerbs
    for (const l of LOTS) {
      ugPlane(k, l.ring, 0.05, asphaltMat(), 6);
      const lines: Part[] = [];
      for (const r of l.rows) {
        if (l.across) { for (let v = r.v[0]; v <= r.v[1] + 0.01; v += 2.6) lines.push([box(r.u[0], r.u[1], 0.07, 0.085, v - 0.06, v + 0.06), '#eeeeea']); continue; }
        for (let u = r.u[0]; u <= r.u[1] + 0.01; u += 2.6) { if (l.gaps.some(([a, b]) => u > a && u < b)) continue; lines.push([box(u - 0.06, u + 0.06, 0.07, 0.085, r.v[0], r.v[1]), '#eeeeea']); }
      }
      k.plain.push(...lines);
      for (const [x0, x1, z0, z1] of l.islands) {
        const w = Math.min(x1 - x0, z1 - z0), h = 0.18;
        k.plain.push([box(x0 + w / 2, x1 - w / 2, 0, h, z0, z1), '#cdbf9f'], [new THREE.CylinderGeometry(w / 2, w / 2, h, 12).translate(x0 + w / 2, h / 2, (z0 + z1) / 2), '#cdbf9f'], [new THREE.CylinderGeometry(w / 2, w / 2, h, 12).translate(x1 - w / 2, h / 2, (z0 + z1) / 2), '#cdbf9f']);
      }
    }
    // the roundabout: planted centre, white stone ring, the tan kerbed apron
    { const [cx, cz] = ROUND.c, R = ROUND.inner;
      k.plain.push([new THREE.CylinderGeometry(R, R, 0.14, 40).translate(cx, 0.07, cz), '#c9a77c'], [new THREE.CylinderGeometry(R + 0.1, R + 0.1, 0.18, 40, 1, true).translate(cx, 0.09, cz), '#e8e5dd']);
      k.plain.push([new THREE.CylinderGeometry(7.2, 7.2, 0.3, 40).translate(cx, 0.15, cz), '#ebe8e0'], [new THREE.CylinderGeometry(6.2, 6.2, 0.38, 40).translate(cx, 0.19, cz), '#4b5a32']); }
    // the loop's lawn before 01 and 03 and its flagpoles
    { let cx = 0, cz = 0; for (const [x, z] of LOOP) { cx += x / LOOP.length; cz += z / LOOP.length; }
      const lawn = LOOP.map(([x, z]) => { const d = Math.hypot(x - cx, z - cz); return [x + ((cx - x) / d) * 3.4, z + ((cz - z) / d) * 3.4] as P2; });
      ugPlane(k, lawn, 0.05, lawnMat(), 4);
      for (const [x, z] of FLAGS) { k.plain.push([new THREE.CylinderGeometry(0.06, 0.08, 10, 8).translate(x, 5, z), '#d6d9dc']); solid(x, z, 0.15); }
      const cols = [['#ce1126', '#fcd116', '#006b3f'], ['#1f4f9a', '#ffffff', '#1f4f9a'], ['#ce1126', '#fcd116', '#006b3f'], ['#2e7d32', '#ffffff', '#2e7d32'], ['#ce1126', '#fcd116', '#006b3f']];
      FLAGS.forEach(([x, z], i) => cols[i].forEach((c, j) => k.plain.push([box(x + 0.08, x + 1.9, 9.3 - j * 0.4, 9.7 - j * 0.4, z - 0.02, z + 0.02), c]))); }
    // the UGMC letters planted in the lawns between 02 and 01 (M1)
    for (const { r, text } of LETTER_LAWNS) {
      const [x0, x1, z0, z1] = r, tex = canvas(512, Math.round((512 * (z1 - z0)) / (x1 - x0)), (g) => {
        g.fillStyle = '#4f7a31'; g.fillRect(0, 0, 512, g.canvas.height); speckle(g, 0, 0, 512, g.canvas.height, 3000, ['#4a7330', '#56823a', '#46702c', '#5b8740']);
        g.strokeStyle = '#d9d4c3'; g.lineWidth = 12; g.font = `700 ${Math.round(g.canvas.height * 0.8)}px Sora, system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.strokeText(text.split('').join(' '), 256, g.canvas.height / 2 + 4);
      });
      const m = ugPlane(k, rect(r), 0.05, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
      const uv = m.geometry.attributes.uv as THREE.BufferAttribute, p = m.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - x0) / (x1 - x0), 1 - (p.getZ(i) - z0) / (z1 - z0));
    }
    // garden 10: the lawn, the crescent bed in its white stone ring, the curved grey aggregate path, benches on pads, the
    // thin tan strips across the lawn
    { const G = GARDEN;
      ugPlane(k, rect(G.lawn), 0.04, lawnMat(), 4);
      const { c, r } = G.crescent, ring = arc(c, r, 90, 270, 20), inner = arc(c, r - 1.2, 90, 270, 20);
      k.plain.push([prism(ring, 0, 0.25), '#ece9e1'], [prism(inner, 0, 0.32), '#5d6f33']);
      const { c: pc, ru, rv, w } = G.path, outer: P2[] = [], inn: P2[] = [];
      for (let i = 0; i <= 48; i++) { const a = -Math.PI * 0.55 + (i / 48) * Math.PI * 1.1; outer.push([pc[0] + Math.cos(a) * (ru + w / 2), pc[1] + Math.sin(a) * (rv + w / 2)]); inn.push([pc[0] + Math.cos(a) * (ru - w / 2), pc[1] + Math.sin(a) * (rv - w / 2)]); }
      ugPlane(k, [...outer, ...inn.reverse()], 0.06, flatMat('#8f9396', 4));
      for (let i = 2; i <= 46; i += 6) { const a = -Math.PI * 0.55 + (i / 48) * Math.PI * 1.1, x = pc[0] + Math.cos(a) * (ru + w / 2 + 1.6), z = pc[1] + Math.sin(a) * (rv + w / 2 + 1.6), rot = -a;
        k.plain.push([new THREE.BoxGeometry(1.4, 0.06, 2.6).rotateY(rot).translate(x, 0.06, z), '#9a9ea0'], [new THREE.BoxGeometry(0.5, 0.45, 1.8).rotateY(rot).translate(x, 0.28, z), '#f4f4f2']); }
      k.plain.push([strip([[-113, -60], [-97, -14]], 0.05, 0.08, 0.3), '#c9a77c'], [strip([[-140, -50], [-96, -40]], 0.05, 0.08, 0.3), '#c9a77c']); }
    // the security posts: light booths with a flat oversailing roof on round columns, glazed sides (E28, E40)
    for (const [i, [x, z]] of POSTS.entries()) {
      k.plain.push([box(x - 3, x + 3, 0, 3.0, z - 2.2, z + 2.2), '#f2f2f0'], [box(x - 4.2, x + 4.2, 3.0, 3.6, z - 3.4, z + 3.4), '#f7f7f5']);
      k.glass.push(box(x - 3.02, x + 3.02, 0.9, 2.5, z - 1.6, z + 1.6));
      for (const [dx, dz] of [[-3.8, -3], [3.8, -3], [-3.8, 3], [3.8, 3]]) k.plain.push([new THREE.CylinderGeometry(0.15, 0.15, 3, 10).translate(x + dx, 1.5, z + dz), '#e9ebec']);
      k.signs.push({ text: `UGMC SECURITY POST NORTH ${i === 1 ? 1 : 2}`, x, y: 3.3, z: z - 3.42, ry: Math.PI, w: 6, colors: ['#3b4650', '#ffffff'] });
    }
    // the wayfinding totems: tall slim grey panels on pale bases with coloured shapes at the foot (E14, E18, E19)
    for (const [x, z] of TOTEMS) {
      k.plain.push([box(x - 0.6, x + 0.6, 0, 0.3, z - 0.3, z + 0.3), '#d9d6ce'], [box(x - 0.5, x + 0.5, 0.3, 4.2, z - 0.12, z + 0.12), '#4a535b']);
      for (const [dy, col] of [[0.7, '#3aa76d'], [1.1, '#2f7fd0'], [0.9, '#f2a33a']] as [number, string][]) k.plain.push([box(x - 0.3 + dy / 6, x + 0.1 + dy / 6, 0.4 + dy * 0.4, 0.8 + dy * 0.4, z - 0.14, z + 0.14), col]);
      solid(x, z, 0.5);
    }
    // red safety fixtures (hydrants) by the clinical blocks (E11, E12, E21)
    for (const [x, z] of [[-22, 50], [-14, 60], [-50, -4], [-95, 90], [20, 10]] as P2[]) { k.plain.push([new THREE.CylinderGeometry(0.16, 0.2, 0.8, 10).translate(x, 0.4, z), '#c62828'], [new THREE.SphereGeometry(0.17, 10, 6).translate(x, 0.82, z), '#c62828']); solid(x, z, 0.2); }
    // the tan paver walk from the roundabout's apron to 03's door across its lawn (E14)
    k.plain.push([strip([[4, 5], [9, 18]], 0.04, 0.08, 1.3), '#b98c66']);
    mergeMeshes(k);
  },
};

/** the UGMC precinct */
export const ugmcSite = createSite('ugmc', [ugmc]);
