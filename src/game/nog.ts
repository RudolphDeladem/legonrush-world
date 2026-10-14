// The Noguchi Memorial Institute for Medical Research and the West African Genetic Medicine Centre (the owner's
// Noguchi + WAGMC brief, docs/noguchi-wagmc/; numbers in nogplan.ts):
// - 03 the old square courtyard complex: a continuous dark pitched-roof ring (outer and inner slopes, hips at the
//   corners) round an open lawn court with straight pale paths and the small central hipped pavilion; the covered entry
//   link east to the curved loop;
// - 02 the Advanced Research Laboratories: the long two-storey wing under a grey-brown hipped roof with tall white piers
//   and dark louvred recesses, the white entrance frame round a recessed dark lobby at its west end, the pale flat service
//   block with its plant, the taller signed east end with external stair flights and balconies, the freestanding
//   NOGUCHI ADVANCED RESEARCH LABORATORIES sign in its kerbed island, block-paved parking with white bays;
// - 04 the small red courtyard building round its open green centre; 21 the red shed in the lawn; 17/18 the two
//   solar panel fields (the owner confirmed them) in low dark rows;
// - WAGMC: the two-storey white U under red-brown hipped roofs with dark fascias, tall glass at the inner corners and
//   slots at the wing ends, the thick white portal round the dark entrance, the pale platform, the salmon forecourt and
//   its bollards, the kerbed groundcover plots, the circular planted island, the asphalt drive and parking, the open
//   metal shade frames, the slim paired lamps, the white boundary wall with the gate structure, the rear service box.
// The trees and groundcover are in buildNogGrounds below; the small surrounding buildings take finishes (world.ts).
import * as THREE from 'three';
import { createSite, render, slab, window_, type Kit, type Spec, type Style } from './blocks';
import { box, canvas, speckle, type Part } from './modelkit';
import { SOLIDS } from './solids';
import { wallSolids } from './enkit';
import { BUILDINGS, ROADS, NODE_XZ } from './campusmap';
import { letters } from './letters';
import { hipRoof } from './waccbip';
import { coverOverlay, crownTiles, hash2, vnoise2, type Crown } from './scrubkit';
import { onSealed } from './ghlplan';
import { SILVER, asphaltMat, curtain, facing, lawnMat, plane, prism, rect, strip, type P2, type R4, mergeMeshes } from './medkit';
import { ARRAYS, CLUSTER_EXTRA, LAB, NG, NOG_CLUSTER, NOG_EARTH, NOG_LOTS, NOG_ROADS, RED04, RING, SHED21, WAG, WAG_BOUND, WAG_LOTS, WG, nogEarthDist, type LineRow } from './nogplan';
import { ugLocal } from './ugmcplan';

// ---------- facades ----------
/** the old ring: cream render, small dark windows (no side elevations supplied: provisional) */
const OLD_WALL: Style = {
  bay: 3.2, up: [[92, 92, 72, 86]], ground: [[92, 92, 72, 86]],
  draw: (g) => { render(g, '#ece5d4'); for (const y0 of [0, 256]) window_(g, [92, y0 + 92, 72, 86], '#d9d2c2', 2, 0); slab(g, 236, 20); },
};
/** the laboratory's long wing: tall white piers over a darker base, narrow dark louvred recesses between them (N03-N07) */
const LAB_PIERS: Style = {
  bay: 2.6, up: [[150, 0, 90, 256]], ground: [[150, 0, 90, 230]],
  draw: (g) => {
    g.fillStyle = '#f3f3f1'; g.fillRect(0, 0, 256, 512); speckle(g, 0, 0, 256, 512, 600, ['#eeeeec', '#f7f7f5']);
    g.fillStyle = '#3a3d40'; g.fillRect(148, 0, 94, 512);
    for (let y = 6; y < 512; y += 14) { g.fillStyle = '#5a5e62'; g.fillRect(150, y, 90, 6); }
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(148, 0, 6, 512);
    g.fillStyle = '#5b5550'; g.fillRect(0, 488, 256, 24);
  },
};
/** the tall signed end: pale blank wall, a few small square windows */
const LAB_END: Style = {
  bay: 4, up: [[110, 110, 36, 36]], ground: [[110, 110, 36, 36]],
  draw: (g) => { g.fillStyle = '#f2f2f0'; g.fillRect(0, 0, 256, 512); speckle(g, 0, 0, 256, 512, 500, ['#ececea', '#f6f6f4']); },
};
/** WAGMC: matte white walls, regular dark rectangular windows */
const WAG_WIN: Style = {
  bay: 3.2, up: [[86, 70, 84, 120]], ground: [[86, 70, 84, 120]],
  draw: (g) => { g.fillStyle = '#f1f1ef'; g.fillRect(0, 0, 256, 512); speckle(g, 0, 0, 256, 512, 800, ['#eaeae8', '#f6f6f4']); for (const y0 of [0, 256]) window_(g, [86, y0 + 70, 84, 120], '#2a2c2e', 2, 0.3); },
};
const PLAIN_SMALL: Style = {
  bay: 3, up: [[100, 100, 56, 70]], ground: [[100, 100, 56, 70]],
  draw: (g) => { render(g, '#efe9dc'); for (const y0 of [0, 256]) window_(g, [100, y0 + 100, 56, 70], '#d9d2c2', 2, 0); },
};

// ---------- materials ----------
let PAVERS: THREE.MeshStandardMaterial | null = null;
/** grey-beige interlocking blocks (N06) */
const paverMat = () => (PAVERS ??= new THREE.MeshStandardMaterial({ roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, map: canvas(128, 128, (g) => {
  g.fillStyle = '#8f8a80'; g.fillRect(0, 0, 128, 128);
  const cols = ['#b9b2a5', '#c3bcaf', '#ada699', '#bdb7ab'];
  for (let j = 0; j < 8; j++) for (let i = -1; i < 9; i++) { g.fillStyle = cols[(i * 3 + j * 5 + 8) % 4]; g.fillRect(i * 16 + (j % 2) * 8 + 1, j * 16 + 1, 14, 14); }
}) }));
let PANELS: THREE.MeshStandardMaterial | null = null;
/** dark panel modules in a pale frame grid */
const panelMat = () => (PANELS ??= new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.35, side: THREE.DoubleSide, map: canvas(128, 64, (g) => {
  g.fillStyle = '#c7cbcf'; g.fillRect(0, 0, 128, 64);
  for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) { g.fillStyle = '#26364d'; g.fillRect(i * 32 + 1, j * 32 + 1, 30, 30); g.fillStyle = 'rgba(160,190,220,0.18)'; g.fillRect(i * 32 + 2, j * 32 + 2, 12, 28); }
}) }));
let SALMON: THREE.MeshStandardMaterial | null = null;
/** the muted salmon forecourt (W18: its paving product unresolved) */
let DTILE: THREE.MeshStandardMaterial | null = null, PSLAB: THREE.MeshStandardMaterial | null = null, FLOWER: THREE.MeshStandardMaterial | null = null;
/** the dark tiled entry floor under the canopy (S11) */
const darkTileMat = () => (DTILE ??= new THREE.MeshStandardMaterial({ roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, map: canvas(64, 64, (g) => { g.fillStyle = '#4d5155'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#3f4347'; for (let i = 0; i < 64; i += 16) { g.fillRect(i, 0, 1, 64); g.fillRect(0, i, 64, 1); } }) }));
/** the pale pedestrian paving (S20) */
const paleSlabMat = () => (PSLAB ??= new THREE.MeshStandardMaterial({ roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, map: canvas(64, 64, (g) => { g.fillStyle = '#d3d0c7'; g.fillRect(0, 0, 64, 64); speckle(g, 0, 0, 64, 64, 300, ['#cbc8bf', '#dbd8cf']); g.fillStyle = 'rgba(120,115,105,0.4)'; for (let i = 0; i < 64; i += 21) { g.fillRect(i, 0, 1, 64); g.fillRect(0, i, 64, 1); } }) }));
/** the yellow flowering groundcover band (S20) */
const flowerMat = () => (FLOWER ??= new THREE.MeshStandardMaterial({ roughness: 1, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5, map: canvas(64, 64, (g) => { g.fillStyle = '#5b7a2c'; g.fillRect(0, 0, 64, 64); speckle(g, 0, 0, 64, 64, 900, ['#e2c22a', '#f0d540', '#cfae1f', '#6d8a32']); }) }));
let PALE: THREE.MeshStandardMaterial | null = null, BASE_LAWN: THREE.MeshStandardMaterial | null = null;
/** pale concrete paving slabs (S20, S02: the walks and the strip along WAGMC's west wall) */
const paleMat = () => (PALE ??= new THREE.MeshStandardMaterial({ roughness: 0.92, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, map: canvas(64, 64, (g) => { g.fillStyle = '#c9c5bb'; g.fillRect(0, 0, 64, 64); speckle(g, 0, 0, 64, 64, 300, ['#c2beb4', '#d0ccc2']); g.fillStyle = 'rgba(120,115,105,0.45)'; for (let i = 0; i < 64; i += 32) { g.fillRect(i, 0, 1, 64); g.fillRect(0, i, 64, 1); } }) }));
const salmonMat = () => (SALMON ??= new THREE.MeshStandardMaterial({ roughness: 0.92, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, map: canvas(64, 64, (g) => { g.fillStyle = '#c99482'; g.fillRect(0, 0, 64, 64); speckle(g, 0, 0, 64, 64, 400, ['#c08a78', '#d19e8c', '#bb8573']); }) }));

const nPlane = (k: Kit, pts: P2[], y: number, mat: THREE.Material, tile = 0) => plane(k, pts, y, mat, tile, NG.world);
const wPlane = (k: Kit, pts: P2[], y: number, mat: THREE.Material, tile = 0) => plane(k, pts, y, mat, tile, WG.world);
const nSolid = (u: number, v: number, r: number) => { const [x, z] = NG.world(u, v); SOLIDS.add(x, z, r); };
const wSolid = (u: number, v: number, r: number) => { const [x, z] = WG.world(u, v); SOLIDS.add(x, z, r); };
/** a slim black lamp pole with paired heads */
function lamp(k: Kit, x: number, z: number) {
  k.plain.push([new THREE.CylinderGeometry(0.06, 0.08, 5, 8).translate(x, 2.5, z), '#1f2124'], [box(x - 0.9, x + 0.9, 4.9, 5.0, z - 0.04, z + 0.04), '#1f2124']);
  for (const s of [-0.9, 0.9]) k.plain.push([box(x + s - 0.22, x + s + 0.22, 4.78, 4.92, z - 0.12, z + 0.12), '#2a2c2f']);
}
/** a short black bollard light */
const bollard = (k: Kit, x: number, z: number) => k.plain.push([new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8).translate(x, 0.4, z), '#1d1f22'], [new THREE.CylinderGeometry(0.11, 0.11, 0.08, 8).translate(x, 0.78, z), '#e9e4cf']);
/** white bay lines across a row of bays (site frame) */
function bays(k: Kit, rows: { v: P2; u: P2 }[], across = false) {
  const lines: Part[] = [];
  for (const r of rows) {
    if (across) { for (let v = r.v[0]; v <= r.v[1] + 0.01; v += 2.6) lines.push([box(r.u[0], r.u[1], 0.07, 0.085, v - 0.06, v + 0.06), '#f2f2ee']); continue; }
    for (let u = r.u[0]; u <= r.u[1] + 0.01; u += 2.6) lines.push([box(u - 0.06, u + 0.06, 0.07, 0.085, r.v[0], r.v[1]), '#f2f2ee']);
  }
  k.plain.push(...lines);
}

/** white bay lines along a row of bays given by its centre line (LineRow): a line every 2.6 m across the row, 5 m long,
 *  tilted for an angled row */
function lineBays(k: Kit, r: LineRow) {
  const L = Math.hypot(r.b[0] - r.a[0], r.b[1] - r.a[1]), du = (r.b[0] - r.a[0]) / L, dv = (r.b[1] - r.a[1]) / L, ry = Math.atan2(dv, du) * -1 + (r.tilt ?? 0);
  for (let t = 0; t <= L + 0.01; t += 2.6) k.plain.push([new THREE.BoxGeometry(0.14, 0.03, 5).rotateY(ry).translate(r.a[0] + du * t, 0.1, r.a[1] + dv * t), '#f2f2ee']);
}

// ---------- Noguchi: the ring, the pavilion, 04, the fields, the shed ----------
const RS = RING.storey, ringTop = 0.4 + RING.floors * RS + 0.4;
const ringO: R4 = [-RING.outer, RING.outer, RING.outerV[0], RING.outerV[1]], ringI: R4 = [ringO[0] + RING.band, ringO[1] - RING.band, ringO[2] + RING.band, ringO[3] - RING.band];
const noguchi: Spec = {
  name: 'Noguchi Memorial Institute for Medical Research',
  axis: NG.axis, origin: NG.origin, storey: RS, style: OLD_WALL, roofColor: '#4f4a46', fascia: '#3b3633', pitch: 0.42,
  replaces: [NG.world(0, -36), NG.world(1, -1), NG.world(-1, -130), NG.world(160, -136), NG.world(189, -110)],
  blocks: [
    // the ring's four bands (the roof over them is one continuous hipped band: extras)
    { x0: ringO[0], x1: ringO[1], z0: ringO[2], z1: ringI[2], floors: RING.floors, roof: 'none' },
    { x0: ringO[0], x1: ringO[1], z0: ringI[3], z1: ringO[3], floors: RING.floors, roof: 'none' },
    { x0: ringO[0], x1: ringI[0], z0: ringI[2], z1: ringI[3], floors: RING.floors, roof: 'none' },
    { x0: ringI[1], x1: ringO[1], z0: ringI[2], z1: ringI[3], floors: RING.floors, roof: 'none' },
    // the central pavilion
    { x0: RING.pavilion[0], x1: RING.pavilion[1], z0: RING.pavilion[2], z1: RING.pavilion[3], floors: 1, roofColor: '#4a4440', pitch: 0.5 },
    // 04 the red courtyard building round its open centre
    { x0: RED04.outer[0], x1: RED04.outer[1], z0: RED04.outer[2], z1: RED04.court[2], floors: 1, roofColor: '#a2412f', pitch: 0.45, faces: { z0: PLAIN_SMALL, z1: PLAIN_SMALL, x0: PLAIN_SMALL, x1: PLAIN_SMALL } },
    { x0: RED04.outer[0], x1: RED04.outer[1], z0: RED04.court[3], z1: RED04.outer[3], floors: 1, roofColor: '#a2412f', pitch: 0.45, faces: { z0: PLAIN_SMALL, z1: PLAIN_SMALL, x0: PLAIN_SMALL, x1: PLAIN_SMALL } },
    { x0: RED04.outer[0], x1: RED04.court[0], z0: RED04.court[2], z1: RED04.court[3], floors: 1, roofColor: '#a2412f', pitch: 0.45, faces: { z0: PLAIN_SMALL, z1: PLAIN_SMALL, x0: PLAIN_SMALL, x1: PLAIN_SMALL } },
    { x0: RED04.court[1], x1: RED04.outer[1], z0: RED04.court[2], z1: RED04.court[3], floors: 1, roofColor: '#a2412f', pitch: 0.45, faces: { z0: PLAIN_SMALL, z1: PLAIN_SMALL, x0: PLAIN_SMALL, x1: PLAIN_SMALL } },
    // the cluster's roofs without a mapped outline (CLUSTER_EXTRA)
    ...CLUSTER_EXTRA.map(({ r, roof }) => ({ x0: r[0], x1: r[1], z0: r[2], z1: r[3], floors: 1, roofColor: roof, pitch: 0.4, faces: { z0: PLAIN_SMALL, z1: PLAIN_SMALL, x0: PLAIN_SMALL, x1: PLAIN_SMALL } })),
    // 21 the red shed
    { x0: SHED21[0], x1: SHED21[1], z0: SHED21[2], z1: SHED21[3], floors: 1, roofColor: '#b5452f', pitch: 0.4, faces: { z0: PLAIN_SMALL, z1: PLAIN_SMALL, x0: PLAIN_SMALL, x1: PLAIN_SMALL } },
  ],
  keep: [[ringI[0], ringI[1], ringI[2], ringI[3]], [RING.link[0], RING.link[1], RING.link[2], RING.link[3]], [RED04.court[0], RED04.court[1], RED04.court[2], RED04.court[3]],
    ...ARRAYS.map(({ r }) => r), [LAB.island[0], LAB.island[1], LAB.island[2], LAB.island[3]], [LAB.tower[0] - 6, LAB.low[1] + 1, LAB.tower[2] - 5, LAB.tower[3] + 1], ...NOG_LOTS.map((l) => { const us = l.ring.map((p) => p[0]), vs = l.ring.map((p) => p[1]); return [Math.min(...us), Math.max(...us), Math.min(...vs), Math.max(...vs)] as R4; })],
  extras: (k) => {
    // the ring's roof: outer slopes up from the outer eaves, inner slopes up from the court's eaves, to a ridge round
    // the middle of the band, hips at the corners
    { const ov = 0.9, e = ringTop, rise = (RING.band / 2 + ov) * 0.42, r = e + rise;
      const O = [ringO[0] - ov, ringO[1] + ov, ringO[2] - ov, ringO[3] + ov], I = [ringI[0] + ov, ringI[1] - ov, ringI[2] + ov, ringI[3] - ov];
      const M = [(ringO[0] + ringI[0]) / 2, (ringO[1] + ringI[1]) / 2, (ringO[2] + ringI[2]) / 2, (ringO[3] + ringI[3]) / 2];
      k.roof.c = new THREE.Color('#4f4a46');
      k.roof.quad([O[0], e, O[2]], [O[1], e, O[2]], [M[1], r, M[2]], [M[0], r, M[2]]);
      k.roof.quad([O[1], e, O[2]], [O[1], e, O[3]], [M[1], r, M[3]], [M[1], r, M[2]]);
      k.roof.quad([O[1], e, O[3]], [O[0], e, O[3]], [M[0], r, M[3]], [M[1], r, M[3]]);
      k.roof.quad([O[0], e, O[3]], [O[0], e, O[2]], [M[0], r, M[2]], [M[0], r, M[3]]);
      k.roof.quad([I[1], e, I[2]], [I[0], e, I[2]], [M[0], r, M[2]], [M[1], r, M[2]]);
      k.roof.quad([I[1], e, I[3]], [I[1], e, I[2]], [M[1], r, M[2]], [M[1], r, M[3]]);
      k.roof.quad([I[0], e, I[3]], [I[1], e, I[3]], [M[1], r, M[3]], [M[0], r, M[3]]);
      k.roof.quad([I[0], e, I[2]], [I[0], e, I[3]], [M[0], r, M[3]], [M[0], r, M[2]]);
      // dark fascias round both eaves
      for (const R of [O, I]) for (const [a, b, c, d] of [[R[0], R[1], R[2], R[2]], [R[0], R[1], R[3], R[3]], [R[0], R[0], R[2], R[3]], [R[1], R[1], R[2], R[3]]]) k.plain.push([box(a - 0.06, b + 0.06, e - 0.35, e + 0.02, c - 0.06, d + 0.06), '#3b3633']); }
    // the court: lawn, the straight pale paths (a rectangle round the pavilion and the cross to the doors)
    nPlane(k, rect(ringI), 0.04, lawnMat(), 4);
    k.plain.push([strip([[-20, -19], [21, -19], [21, 20], [-20, 20], [-20, -19]], 0.05, 0.09, 0.8), '#d9d3c4'], [strip([[1, -29], [1, -9]], 0.05, 0.09, 0.8), '#d9d3c4'], [strip([[1, 6], [1, 29]], 0.05, 0.09, 0.8), '#d9d3c4'], [strip([[-29, -1.5], [-6, -1.5]], 0.05, 0.09, 0.8), '#d9d3c4'], [strip([[8, -1.5], [29, -1.5]], 0.05, 0.09, 0.8), '#d9d3c4']);
    // the covered entry link east to the curved loop
    { const [x0, x1, z0, z1] = RING.link;
      k.plain.push([box(x0, x1, 3.2, 3.5, z0, z1), '#e7e2d6'], [box(x0, x1, 3.45, 3.6, z0 - 0.1, z1 + 0.1), '#4f4a46']);
      for (const x of [x0 + 6, x1 - 0.4]) for (const z of [z0 + 0.3, z1 - 0.3]) { k.plain.push([box(x - 0.15, x + 0.15, 0, 3.2, z - 0.15, z + 0.15), '#e7e2d6']); nSolid(x, z, 0.25); } }
    // the loop beside the ring (the owner's correction brief, S03/S04): pale kerbs along both edges of its paving, the
    // inner island lawn (its trees: buildNogGrounds), the kerbed lawn in its east half
    { const L = NOG_ROADS.loop.map(([x, z]) => NG.local(x, z)), off = (d: number) => L.map((p, i) => {
        const a = L[(i + L.length - 2) % (L.length - 1)], b = L[(i + 1) % (L.length - 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1;
        return [p[0] - (dz / l) * d, p[1] + (dx / l) * d] as P2; });
      const inner = off(-2.3), outer = off(2.3);
      // (the ring's points run clockwise in the world: the left of travel is outward; pick by area)
      const area = (r: P2[]) => r.reduce((s, p, i) => s + p[0] * r[(i + 1) % r.length][1] - r[(i + 1) % r.length][0] * p[1], 0);
      const [inK, outK] = Math.abs(area(inner)) < Math.abs(area(outer)) ? [inner, outer] : [outer, inner];
      nPlane(k, inK, 0.03, lawnMat(), 4);
      k.plain.push([strip(inK, 0, 0.15, 0.12), '#dcd8ce'], [strip(outK.slice(0, -1).filter((_, i) => i !== 0), 0, 0.12, 0.1), '#dcd8ce']); }
    for (const { r: [a, b, c, d] } of CLUSTER_EXTRA) { const W = (u: number, v: number) => NG.world(u, v); wallSolids(...W(a, c), ...W(b, c), 0.3); wallSolids(...W(b, c), ...W(b, d), 0.3); wallSolids(...W(b, d), ...W(a, d), 0.3); wallSolids(...W(a, d), ...W(a, c), 0.3); }
    // 04's open centre
    nPlane(k, rect(RED04.court), 0.04, lawnMat(), 4);
    // 17 / 18: the solar fields (the owner): low repeated rows of dark panels on light frames, pale aisles between
    for (const { r, rows } of ARRAYS) {
      const [x0, x1, z0, z1] = r, pitch = (z1 - z0) / rows, d = Math.min(3.6, pitch - 1.4);
      for (let i = 0; i < rows; i++) {
        const za = z0 + i * pitch + 0.5, zb = za + d, g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute([x0, 1.5, za, x1, 1.5, za, x1, 0.5, zb, x0, 0.5, zb], 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, (x1 - x0) / 4, 0, (x1 - x0) / 4, 1, 0, 1], 2));
        g.setIndex([0, 2, 1, 0, 3, 2]); g.computeVertexNormals();
        const m = new THREE.Mesh(g, panelMat()); m.castShadow = true; m.userData.noCollide = true; k.meshes.push(m);
        for (let x = x0 + 1; x < x1; x += 4) { k.plain.push([box(x - 0.05, x + 0.05, 0, 1.45, za + 0.2, za + 0.3), '#9aa0a5'], [box(x - 0.05, x + 0.05, 0, 0.5, zb - 0.3, zb - 0.2), '#9aa0a5']); nSolid(x, (za + zb) / 2, 1.1); nSolid(x + 2, (za + zb) / 2, 1.1); }
      }
    }
    mergeMeshes(k);
  },
};

// ---------- Noguchi: the Advanced Research Laboratories ----------
// (the owner's correction brief, S07-S20, registered on M1; docs/noguchi-wagmc/correction-ledger.md)
// - the west face (S08, S10, S20): the portal at its north end, the wide dark upper bay over it, a wide blank pier, then
//   12 bays of a broad pale pier standing out of the wall and a narrow recessed slot with a framed window a floor and a
//   small grey shelf under each; the hipped dark roof over the L with its overhang and dark fascia;
// - the portal (S08, S11, S20): a thick pale frame standing 4 m out, its side returns, three grey inner columns between
//   the doors, the shallow canopy strips stepping back to the wall, the dark recessed glazing, the dark entry floor;
// - the north and inner faces (S08 left, S15, S19): narrow white fins over dark louvres;
// - the flat white rear volumes (S09, S12): the service block with its plant, the taller east block with fins;
// - the signed tower north of the north-west corner (S09, S10, S15, S19): pale and blank, the raised NOGUCHI and
//   ADVANCED RESEARCH LABORATORIES letters on its west face, three stacked landings with bar rails on its north face
//   joined to the ground by a stair, three small windows; the low block beside it (provisional);
// - before the portal (S20, M1): two kerbed lawns with the pale walk between them, the framed monument with its rough
//   face and raised letters, shrubs in a soil bed, a yellow flower band, short black bollard lights.
const LS = LAB.storey, labTop = 0.4 + 2 * LS + 0.4, endTop = 0.4 + LAB.endFloors * LS + 0.4, towTop = 0.4 + LAB.towerFloors * LS + 0.4;
/** a blank pale render (the piers, the tower, the end walls) */
const LAB_PALE: Style = { bay: 4, up: [], ground: [], draw: (g) => { g.fillStyle = '#efefec'; g.fillRect(0, 0, 256, 512); speckle(g, 0, 0, 256, 512, 700, ['#e9e9e6', '#f5f5f2']); g.fillStyle = '#8c8a85'; g.fillRect(0, 496, 256, 16); } };
/** the dark grey louvres behind the fins (horizontal slats) */
const LAB_LOUVRE: Style = { bay: 4, up: [], ground: [], draw: (g) => { g.fillStyle = '#3d4043'; g.fillRect(0, 0, 256, 512); for (let y = 4; y < 496; y += 11) { g.fillStyle = '#62676b'; g.fillRect(0, y, 256, 4); } g.fillStyle = '#8c8a85'; g.fillRect(0, 496, 256, 16); } };
let ROUGH: THREE.MeshStandardMaterial | null = null;
/** the monument's rough inset face (S20) */
const roughMat = () => (ROUGH ??= new THREE.MeshStandardMaterial({ roughness: 1, map: canvas(128, 64, (g) => { g.fillStyle = '#d9d7d0'; g.fillRect(0, 0, 128, 64); speckle(g, 0, 0, 128, 64, 1400, ['#c9c7bf', '#e6e4dd', '#bdbab2', '#d0cec6']); }) }));
/** fins along a face: boxes `w` wide standing `d` out of the face at `at` (alongX: the face runs along x at z = at) */
function fins(p: Part[], alongX: boolean, at: number, out: number, a0: number, a1: number, y1: number, step = 1.6, w = 0.35, d = 0.45) {
  for (let a = a0 + step / 2; a < a1; a += step) {
    const [o0, o1] = [Math.min(at, at + out * d), Math.max(at, at + out * d)];
    p.push([alongX ? box(a - w / 2, a + w / 2, 0.3, y1, o0, o1) : box(o0, o1, 0.3, y1, a - w / 2, a + w / 2), '#f3f3f0']);
  }
}
const [TU0, TU1, TV0, TV1] = LAB.tower;
const lab: Spec = {
  name: 'Noguchi Advanced Research Laboratories',
  axis: NG.axis, origin: NG.origin, storey: LS, style: LAB_PALE, roofColor: '#4d4a47', fascia: '#2f2d2b', pitch: 0.33,
  // (the lots' map areas are drawn here, not as the map's generic parking)
  covers: NOG_LOTS.map((l) => NG.world(l.ring.reduce((a, p) => a + p[0], 0) / l.ring.length, l.ring.reduce((a, p) => a + p[1], 0) / l.ring.length)),
  blocks: [
    // the L under its hipped roof (built in extras): the west arm whole, the north arm east of it
    { x0: LAB.front[0], x1: LAB.arm[1], z0: LAB.front[2], z1: LAB.arm[3], floors: 2, roof: 'none', faces: { x0: LAB_PALE, z0: LAB_LOUVRE, x1: LAB_LOUVRE, z1: LAB_PALE } },
    { x0: LAB.arm[1], x1: LAB.front[1], z0: LAB.front[2], z1: LAB.front[3], floors: 2, roof: 'none', faces: { z0: LAB_LOUVRE, z1: LAB_LOUVRE, x0: LAB_PALE, x1: LAB_PALE } },
    { x0: LAB.service[0], x1: LAB.service[1], z0: LAB.service[2], z1: LAB.service[3], floors: 2, roof: 'flat', faces: { z1: LAB_LOUVRE, x1: LAB_PALE, x0: LAB_PALE, z0: LAB_PALE } },
    { x0: LAB.end[0], x1: LAB.end[1], z0: LAB.end[2], z1: LAB.end[3], floors: LAB.endFloors, roof: 'flat', faces: { z0: LAB_LOUVRE, z1: LAB_LOUVRE, x0: LAB_PALE, x1: LAB_LOUVRE } },
    // the signed tower and the low block beside it
    { x0: TU0, x1: TU1, z0: TV0, z1: TV1, floors: LAB.towerFloors, roof: 'flat', faces: { x0: LAB_PALE, x1: LAB_PALE, z0: LAB_PALE, z1: LAB_PALE } },
    { x0: LAB.low[0], x1: LAB.low[1], z0: LAB.low[2], z1: LAB.low[3], floors: 1, roof: 'flat', faces: { x0: LAB_PALE, x1: LAB_PALE, z0: LAB_PALE, z1: LAB_PALE } },
  ],
  keep: [[LAB.portalOut - 1, LAB.front[0], LAB.portal[0] - 1, LAB.portal[1] + 1], [TU0 - 2, LAB.low[1] + 1, TV0 - 5, TV1 + 1]],
  extras: (k) => {
    const p: Part[] = [], u0 = LAB.front[0], ov = 1.2;
    // ---- the hipped roof over the L: the west arm hipped at both ends, the north arm hipped at its east end and dying
    // into the west arm's roof at its west end; dark fascias round the eaves ----
    k.roof.c = new THREE.Color('#4d4a47');
    hipRoof(k, (x, z) => [x, z], u0 - ov, LAB.arm[1] + ov, LAB.front[2] - ov, LAB.arm[3] + ov, labTop, 0.33, 'z', [{ gw: 0, tri: false }, { gw: 0, tri: false }], p, '#2f2d2b');
    hipRoof(k, (x, z) => [x, z], (u0 + LAB.arm[1]) / 2, LAB.end[0], LAB.front[2] - ov, LAB.front[3] + 0.3, labTop, 0.33, 'x', [{ gw: 99, tri: false }, { gw: 99, tri: false }], p, '#2f2d2b');
    for (const [a, b] of [[[u0 - ov, LAB.front[2] - ov], [LAB.end[0], LAB.front[2] - ov]], [[u0 - ov, LAB.front[2] - ov], [u0 - ov, LAB.arm[3] + ov]], [[u0 - ov, LAB.arm[3] + ov], [LAB.arm[1] + ov, LAB.arm[3] + ov]], [[LAB.arm[1] + ov, LAB.arm[3] + ov], [LAB.arm[1] + ov, LAB.service[3]]]] as [P2, P2][]) p.push([strip([a, b], labTop - 0.4, labTop + 0.02, 0.08), '#2f2d2b']);
    // ---- the west face ----
    const [pv0, pv1] = LAB.portal, po = LAB.portalOut, ph = 6.0;
    // the bays: a pier standing 0.45 out, then the slot: a framed window a floor, the dark spandrel, a grey shelf under each
    const { v0, n, w, pier } = LAB.bays;
    for (let i = 0; i < n; i++) {
      const a = v0 + i * w;
      p.push([box(u0 - 0.45, u0, 0, labTop - 0.1, a, a + pier), '#f1f1ee']);
      const s0 = a + pier, s1 = a + w;
      p.push([box(u0 - 0.04, u0, 0.3, labTop - 0.5, s0, s1), '#3e4245']);
      for (let fl = 0; fl < 2; fl++) {
        const y = 0.4 + fl * LS;
        p.push([box(u0 - 0.08, u0 - 0.04, y + 0.9, y + 3.4, s0 + 0.08, s1 - 0.08), '#8d9195']);
        k.glass.push(box(u0 - 0.1, u0 - 0.08, y + 1.0, y + 3.3, s0 + 0.16, s1 - 0.16));
        p.push([box(u0 - 0.12, u0 - 0.08, y + 2.1, y + 2.16, s0 + 0.16, s1 - 0.16), '#8d9195']);
        p.push([box(u0 - 0.65, u0, y + 0.72, y + 0.86, s0 - 0.05, s1 + 0.05), '#6f7377']);
      }
    }
    p.push([box(u0 - 0.45, u0, 0, labTop - 0.1, v0 + n * w, LAB.arm[3]), '#f1f1ee']);
    // the wide blank pier between the portal and the bays stands out as the others do
    p.push([box(u0 - 0.45, u0, 0, labTop - 0.1, pv1 + 0.5, v0), '#f1f1ee']);
    // the dark upper bay over the portal, from the corner to the blank pier, with vertical slats at its north end
    p.push([box(u0 - 0.03, u0, ph + 0.2, labTop - 0.3, LAB.front[2] + 0.3, pv1 + 0.5), '#2b2e31']);
    for (let v = LAB.front[2] + 0.5; v < LAB.front[2] + 3.4; v += 0.3) p.push([box(u0 - 0.2, u0, ph + 0.3, labTop - 0.4, v - 0.03, v + 0.03), '#5d6064']);
    // the portal: legs (thick side returns), header, the canopy strips stepping back, the inner columns, the doors
    p.push([box(po, u0, 0, ph, pv0, pv0 + 1.0), '#f2f2ef'], [box(po, u0, 0, ph, pv1 - 1.0, pv1), '#f2f2ef'], [box(po, u0, ph - 1.1, ph, pv0, pv1), '#f2f2ef']);
    p.push([box(po + 0.6, u0, ph, ph + 0.22, pv0 + 0.4, pv1 - 0.4), '#c9cbcc'], [box(po + 1.6, u0, ph + 0.22, ph + 0.42, pv0 + 0.8, pv1 - 0.8), '#b9bcbe'], [box(po + 0.3, u0, ph - 1.3, ph - 1.1, pv0 + 1, pv1 - 1), '#e2e2df']);
    for (const v of [pv0 + 3.2, pv0 + 6.5, pv0 + 9.8]) { p.push([box(po + 1.4, po + 1.9, 0, ph - 1.1, v - 0.25, v + 0.25), '#a9adb0']); nSolid(po + 1.65, v, 0.35); }
    for (const v of [pv0 + 0.5, pv1 - 0.5]) { const [ax, az] = NG.world(po + 0.2, v), [bx, bz] = NG.world(u0, v); wallSolids(ax, az, bx, bz, 0.55); }
    curtain(k, [[u0 - 0.06, pv0 + 1.0], [u0 - 0.06, pv1 - 1.0]], 0.15, ph - 1.2);
    for (const [a, b] of [[pv0 + 4.0, pv0 + 5.7], [pv0 + 7.3, pv0 + 9.0]]) p.push([box(u0 - 0.12, u0 - 0.06, 0.12, 2.5, a, b), '#25282a'], [box(u0 - 0.14, u0 - 0.1, 0.12, 2.5, (a + b) / 2 - 0.03, (a + b) / 2 + 0.03), '#9aa0a4']);
    nPlane(k, rect([po, u0, pv0 + 1.0, pv1 - 1.0]), 0.07, darkTileMat(), 1);
    // the plant on the canopy's roof (S11)
    for (const v of [pv0 + 2.5, pv1 - 3]) p.push([box(po + 2.6, po + 3.6, ph + 0.42, ph + 1.1, v - 0.6, v + 0.6), '#c3c6c8']);
    // ---- fins on the north face, the inner faces and the east block ----
    fins(p, true, LAB.front[2], -1, u0, LAB.end[0], labTop - 0.3);
    fins(p, true, LAB.end[2], -1, LAB.end[0], LAB.end[1], endTop - 0.2);
    fins(p, false, LAB.end[1], 1, LAB.end[2], LAB.end[3], endTop - 0.2);
    fins(p, false, LAB.arm[1], 1, LAB.service[3], LAB.arm[3], labTop - 0.3);
    fins(p, true, LAB.service[3], 1, LAB.arm[1], LAB.end[1], labTop - 0.3);
    // the south end of the west arm: two small windows a floor (provisional)
    for (let fl = 0; fl < 2; fl++) for (const u of [130, 137]) { p.push([box(u - 0.6, u + 0.6, 0.4 + fl * LS + 1.6, 0.4 + fl * LS + 2.8, LAB.arm[3], LAB.arm[3] + 0.06), '#8d9195']); k.glass.push(box(u - 0.5, u + 0.5, 0.4 + fl * LS + 1.7, 0.4 + fl * LS + 2.7, LAB.arm[3] + 0.06, LAB.arm[3] + 0.08)); }
    // the flat roofs: the service block's plant, the east block's parapet and plant
    p.push([box(LAB.service[0], LAB.service[1], labTop, labTop + 0.15, LAB.service[2], LAB.service[3]), '#d9d8d2']);
    for (let i = 0; i < 7; i++) p.push([box(146 + i * 5, 148.4 + i * 5, labTop + 0.15, labTop + 1.4, -126, -123.6), '#cfd2d4']);
    p.push([box(LAB.end[0], LAB.end[1], endTop, endTop + 0.6, LAB.end[2], LAB.end[2] + 0.3), '#e8e8e6'], [box(LAB.end[0], LAB.end[1], endTop, endTop + 0.6, LAB.end[3] - 0.3, LAB.end[3]), '#e8e8e6']);
    for (const u of [186, 191, 196]) p.push([box(u - 1.6, u + 1.6, endTop, endTop + 1.5, -133, -128), '#c5c8ca']);
    // ---- the signed tower ----
    p.push([box(TU0, TU1, towTop, towTop + 0.7, TV0, TV0 + 0.25), '#ececE9'], [box(TU0, TU1, towTop, towTop + 0.7, TV1 - 0.25, TV1), '#ececE9'], [box(TU0, TU0 + 0.25, towTop, towTop + 0.7, TV0, TV1), '#ececE9'], [box(TU1 - 0.25, TU1, towTop, towTop + 0.7, TV0, TV1), '#ececE9']);
    // the raised letters on the west face, NOGUCHI over ADVANCED RESEARCH LABORATORIES, left aligned (S19)
    letters(k, 'NOGUCHI', TU0 - 0.01, towTop - 2.4, TV0 + 0.8 + 3.4, -Math.PI / 2, 0.95, 0.09, '#d4d8db', { gap: 0.45, stroke: 0.22 });
    letters(k, 'ADVANCED RESEARCH LABORATORIES', TU0 - 0.01, towTop - 3.35, TV0 + 0.8 + 4.75, -Math.PI / 2, 0.36, 0.06, '#c9ced1', { wide: 0.9, gap: 0.35, stroke: 0.22 });
    // three small windows low on the west face (S15)
    for (const v of [TV1 - 3.2, TV1 - 2.3, TV1 - 1.4]) { p.push([box(TU0 - 0.05, TU0, 7.0, 7.9, v - 0.33, v + 0.33), '#8d9195']); k.glass.push(box(TU0 - 0.07, TU0 - 0.05, 7.08, 7.82, v - 0.26, v + 0.26)); }
    // the stacked landings on the north face: slab, a return wall at the east end, dense bar rails, doors behind
    const lv0 = TV0 - 1.8;
    for (let fl = 1; fl < LAB.towerFloors; fl++) {
      const y = 0.4 + fl * LS, la = TU0 + 0.3, lb = TU1 - 0.6;
      p.push([box(la - (fl === 1 ? 0 : 0), lb, y - 0.22, y, lv0, TV0), '#ebebe8'], [box(lb, TU1, y - 0.22, y + LS - 0.22, lv0, TV0), '#efefec']);
      for (let u = la + 0.06; u < lb; u += 0.13) p.push([box(u - 0.013, u + 0.013, y, y + 1.05, lv0 + 0.02, lv0 + 0.05), '#2b2d30']);
      for (let v = lv0 + 0.1; v < TV0; v += 0.13) p.push([box(la, la + 0.03, y, y + 1.05, v - 0.013, v + 0.013), '#2b2d30']);
      p.push([box(la, lb, y + 1.03, y + 1.08, lv0, lv0 + 0.06), '#2b2d30'], [box(la, la + 0.06, y + 1.03, y + 1.08, lv0, TV0), '#2b2d30']);
      for (const u of [TU0 + 2.2, TU0 + 6.2]) p.push([box(u - 0.5, u + 0.5, y, y + 2.3, TV0 - 0.04, TV0), '#2e3033']);
    }
    // the ground stair: one flight along the landings' edge from the east up to the first landing's west end, its
    // stringer wall, the rail on its open side
    { const y1 = 0.4 + LS, sa = TU0 + 3.0, sb = TU1 + 3.2, n2 = 24, sv0 = lv0 - 1.2;
      p.push([box(TU0 + 0.3, sa, y1 - 0.22, y1, sv0, lv0), '#ebebe8']);
      for (let i = 0; i < n2; i++) { const ua = sb - ((sb - sa) * (i + 1)) / n2, ub = sb - ((sb - sa) * i) / n2, y = (y1 * (i + 1)) / n2; p.push([box(ua, ub, y - 0.2, y, sv0, lv0), '#e5e5e2']); }
      p.push([box(sa, sb, 0, 0.5, sv0, sv0 + 0.12), '#e5e5e2']);
      const L = Math.hypot(sb - sa, y1); p.push([new THREE.BoxGeometry(L, 0.05, 0.05).rotateZ(-Math.atan2(y1, sb - sa)).translate((sa + sb) / 2, y1 / 2 + 1.0, sv0 + 0.03), '#2b2d30']);
      for (let i = 0; i <= 8; i++) { const u = sb - ((sb - sa) * i) / 8, y = (y1 * i) / 8; p.push([box(u - 0.02, u + 0.02, y, y + 1.0, sv0 + 0.01, sv0 + 0.05), '#2b2d30']); }
      for (let u = sa; u < sb; u += 0.8) nSolid(u, (sv0 + lv0) / 2, 0.7); }
    // the low block's door
    p.push([box(LAB.low[0] + 2, LAB.low[0] + 3.2, 0.1, 2.4, LAB.low[2] - 0.05, LAB.low[2]), '#2e3033']);
    k.plain.push(...p);
    // ---- before the portal: the walk, the two kerbed lawns, the flower band, the monument, bollards ----
    { const [w0, w1, wv0, wv1] = LAB.walk;
      nPlane(k, rect([w0, w1, wv0, wv1]), 0.05, paleSlabMat(), 2);
      for (const [a0, a1, b0, b1] of LAB.lawns) {
        const r = (b1 - b0) / 2, c = (b0 + b1) / 2, ring: P2[] = [];
        for (let i = 0; i <= 10; i++) { const t = -Math.PI / 2 + (i / 10) * Math.PI; ring.push([a1 - r + Math.cos(t) * r, c + Math.sin(t) * r]); }
        for (let i = 0; i <= 10; i++) { const t = Math.PI / 2 + (i / 10) * Math.PI; ring.push([a0 + r + Math.cos(t) * r, c + Math.sin(t) * r]); }
        k.plain.push([prism(ring, 0, 0.18), '#eeede8']);
        const inner = ring.map(([u, v]) => [(a0 + a1) / 2 + (u - (a0 + a1) / 2) * ((a1 - a0 - 0.5) / (a1 - a0)), c + (v - c) * ((b1 - b0 - 0.5) / (b1 - b0))] as P2);
        nPlane(k, inner, 0.2, lawnMat(), 4);
        for (let u = a0 + r; u < a1 - r; u += 2.2) for (const v of [b0 + 1.2, b1 - 1.2]) nSolid(u, v, 1.0);
        nSolid(a0 + r, c, r * 0.9); nSolid(a1 - r, c, r * 0.9);
      }
      // the yellow flower band along the north lawn's walk side (S20)
      const [a0, a1, , b1] = LAB.lawns[0];
      nPlane(k, rect([a0 + 4, a1 - 8, b1 - 1.6, b1 - 0.5]), 0.22, flowerMat(), 2);
      // the monument: a framed pale block, the rough inset face, the raised stacked letters (S20)
      const [sx, sz] = LAB.sign, ry = -Math.PI / 2 + 0.25, dx = Math.sin(ry), dz = Math.cos(ry), tx = Math.cos(ry), tz = -Math.sin(ry);
      k.plain.push([new THREE.BoxGeometry(5.4, 2.8, 0.9).rotateY(ry).translate(sx, 1.6, sz), '#e9e8e3'], [new THREE.BoxGeometry(5.6, 0.25, 1.0).rotateY(ry).translate(sx, 0.32, sz), '#d6d5cf']);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.1).rotateY(ry).translate(sx + dx * 0.41, 1.68, sz + dz * 0.41), roughMat()); face.receiveShadow = true; k.meshes.push(face);
      ['NOGUCHI', 'ADVANCED', 'RESEARCH', 'LABORATORIES'].forEach((t, i) => {
        const hw = (t.length * 1.25 - 0.35) * (0.34 / 1.4) / 2, off = -2.05 + hw;
        letters(k, t, sx + dx * 0.43 + tx * off, 2.45 - i * 0.46, sz + dz * 0.43 + tz * off, ry, 0.34, 0.05, '#a9a7a0', { wide: 0.9, gap: 0.35, stroke: 0.2 });
      });
      nSolid(sx, sz, 1.6);
      for (const [u, v] of [[114, -134], [114, -129.4], [100, -134], [100, -129.4], [88, -134], [88, -129.4]] as P2[]) { bollard(k, u, v); nSolid(u, v, 0.15); }
      // the zebra crossing over the drive from the walk to the portal (S11)
      for (let v = LAB.walk[2] + 0.25; v < LAB.walk[3]; v += 0.9) k.plain.push([box(116.4, 121.2, 0.06, 0.075, v, v + 0.45), '#f1f1ec']); }
    // the block-paved parking with white bays (S15); the loop's kerbside strips in asphalt
    for (const l of NOG_LOTS) { if (l.name.startsWith('noguchi-loop')) { nPlane(k, l.ring, 0.04, asphaltMat(), 6); continue; } nPlane(k, l.ring, 0.05, paverMat(), 3); bays(k, l.rows, l.across); }
    // the solid walls of the tower, the low block and the portal frame's outer corners (the tower is not on the map)
    for (const [a, b, c, d] of [LAB.tower, LAB.low]) { const W = (u: number, v: number) => NG.world(u, v); wallSolids(...W(a, c), ...W(b, c), 0.3); wallSolids(...W(b, c), ...W(b, d), 0.3); wallSolids(...W(b, d), ...W(a, d), 0.3); wallSolids(...W(a, d), ...W(a, c), 0.3); }
    mergeMeshes(k);
  },
};

// ---------- WAGMC ----------
const WS = WAG.storey, wagTop = 0.4 + WAG.floors * WS + 0.4;
const wagmc: Spec = {
  name: 'West African Genetic Medicine Centre',
  axis: WG.axis, origin: WG.origin, storey: WS, style: WAG_WIN, roofColor: '#7a3328', fascia: '#262626', pitch: 0.45,
  covers: WAG_LOTS.map((l) => WG.world(l.ring.reduce((a, p) => a + p[0], 0) / l.ring.length, l.ring.reduce((a, p) => a + p[1], 0) / l.ring.length)),
  replaces: [WG.world(-40, -18), WG.world(-45, 27)],
  blocks: [
    { x0: WAG.north[0], x1: WAG.north[1], z0: WAG.north[2], z1: WAG.north[3], floors: 2 },
    { x0: WAG.south[0], x1: WAG.south[1], z0: WAG.south[2], z1: WAG.south[3], floors: 2 },
    { x0: WAG.base[0], x1: WAG.base[1], z0: WAG.base[2], z1: WAG.base[3], floors: 2 },
    { x0: WAG.rear[0], x1: WAG.rear[1], z0: WAG.rear[2], z1: WAG.rear[3], floors: 2 },
    { x0: WAG.service[0], x1: WAG.service[1], z0: WAG.service[2], z1: WAG.service[3], floors: 1, roof: 'flat', faces: { z0: PLAIN_SMALL, z1: PLAIN_SMALL, x0: PLAIN_SMALL, x1: PLAIN_SMALL } },
  ],
  keep: [[WAG.wall[0], WAG.east[0][0], WAG.wall[2], WAG.wall[3]]],
  extras: (k) => {
    // the ground of the compound (the owner's correction brief, S02/S18): lawn over it all, the elongated parking on the
    // court side and the strip along the south-east wing in asphalt, the pale paving along the west wall; the bays; the
    // kerbed planted strip down the upper parking with its rounded end; the grass east of the parking in its kerb
    const bound: P2[] = [[WAG.wall[0], WAG.wall[2]], ...WAG.east, [WAG.wall[0], WAG.wall[3]]];
    // (the base lawn sits behind the asphalt: its own copy with a smaller depth offset)
    BASE_LAWN ??= Object.assign(lawnMat().clone(), { polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    wPlane(k, bound, 0.02, BASE_LAWN, 4);
    for (const p of [WAG.park, WAG.seStrip]) wPlane(k, p, 0.045, asphaltMat(), 6);
    wPlane(k, WAG.westPave, 0.05, paleMat(), 2);
    // the planted strip: a kerb round a rounded-ended strip along the aisles' slant, lawn inside
    { const { a, b, w } = WAG.midStrip, L = Math.hypot(b[0] - a[0], b[1] - a[1]), du = (b[0] - a[0]) / L, dv = (b[1] - a[1]) / L, r = w / 2;
      const P = (t: number, s: number): P2 => [a[0] + du * t - dv * s, a[1] + dv * t + du * s];
      const ring: P2[] = [P(0, -r), P(L - r, -r)];
      for (let i = 1; i < 10; i++) { const q = (i / 10) * Math.PI; ring.push(P(L - r + Math.sin(q) * r, -Math.cos(q) * r)); }
      ring.push(P(L - r, r), P(0, r));
      k.plain.push([prism(ring, 0, 0.16), '#dedbd2']);
      const inner: P2[] = [P(0.25, -r + 0.25), P(L - r, -r + 0.25), ...Array.from({ length: 9 }, (_, i) => { const q = ((i + 1) / 10) * Math.PI; return P(L - r + Math.sin(q) * (r - 0.25), -Math.cos(q) * (r - 0.25)); }), P(L - r, r - 0.25), P(0.25, r - 0.25)];
      wPlane(k, inner, 0.17, lawnMat(), 3);
      for (let t = 1; t < L - 0.5; t += 1.5) wSolid(...P(t, 0), r * 0.85); }
    k.plain.push([strip([...WAG.eastGrass, WAG.eastGrass[0]], 0, 0.14, 0.1), '#dedbd2']);
    for (const l of WAG_LOTS) { bays(k, l.rows, l.across); for (const r of l.lines ?? []) lineBays(k, r); }
    wPlane(k, rect(WAG.lawn), 0.06, lawnMat(), 4);
    // the portal: a thick white frame round the dark glazed entrance; the pale platform and steps; the salmon forecourt
    { const [x0, x1, z0, z1] = WAG.portal, h = wagTop + 1.2;
      k.plain.push([box(x0, x1, 0, h, z0, z0 + 1.2), '#f6f6f4'], [box(x0, x1, 0, h, z1 - 1.2, z1), '#f6f6f4'], [box(x0, x1, h - 1.4, h, z0, z1), '#f6f6f4']);
      curtain(k, [[x0 + 0.06, z0 + 1.2], [x0 + 0.06, z1 - 1.2]], 0.3, h - 1.4);
      k.plain.push([box(x0 + 0.12, x0 + 0.2, 0.45, 3.2, -1.6, 1.6), '#2b2d30']);
      // the lettering on the portal's top band, facing the court (the owner's photo, 2026-10-15)
      k.signs.push({ text: 'WAGMC GENOMIC MEDICINE BUILDING', x: x1 + 0.03, y: h - 0.5, z: -0.4, ry: Math.PI / 2, w: 9.6, colors: ['#f6f6f4', '#2b3140'] });
      k.signs.push({ text: 'WEST AFRICAN GENETIC MEDICINE CENTRE (WAGMC)', x: x1 + 0.03, y: h - 1.05, z: -0.4, ry: Math.PI / 2, w: 8.4, colors: ['#f6f6f4', '#2b3140'] });
      k.plain.push([new THREE.CylinderGeometry(0.42, 0.42, 0.04, 20).rotateZ(Math.PI / 2).translate(x1 + 0.03, h - 0.75, 5.0), '#2b3140'], [new THREE.CylinderGeometry(0.34, 0.34, 0.05, 20).rotateZ(Math.PI / 2).translate(x1 + 0.04, h - 0.75, 5.0), '#f6f6f4']);
      const [p0, p1, q0, q1] = WAG.platform;
      k.plain.push([box(x1, p1, 0, 0.45, q0, q1), '#dcd8cf'], [box(p1, p1 + 0.4, 0, 0.3, q0, q1), '#d4d0c7'], [box(p1 + 0.4, p1 + 0.8, 0, 0.15, q0, q1), '#d4d0c7']);
      wPlane(k, rect(WAG.forecourt), 0.08, salmonMat(), 2);
      for (let z = WAG.forecourt[2] + 0.5; z <= WAG.forecourt[3] - 0.5; z += 1.4) { k.plain.push([new THREE.CylinderGeometry(0.09, 0.09, 0.7, 8).translate(WAG.forecourt[1] - 0.3, 0.35, z), '#2a2c2f']); wSolid(WAG.forecourt[1] - 0.3, z, 0.12); } }
    // the kerbed groundcover plots (their planting: ground)
    for (const r of WAG.plots) { k.plain.push([box(r[0], r[1], 0, 0.18, r[2], r[3]), '#e2dfd7']); wPlane(k, rect([r[0] + 0.25, r[1] - 0.25, r[2] + 0.25, r[3] - 0.25]), 0.2, lawnMat(), 3); }
    // tall glass at the inner corners and slender slots at the wing ends
    for (const [x, z0, z1] of [[WAG.north[1] - 0.08, -24, -21], [WAG.south[1] - 0.08, 22.5, 25.5]] as [number, number, number][]) curtain(k, [[x + 0.12, z0], [x + 0.12, z1]], 0.4, wagTop - 0.4);
    for (const [x0, x1, z] of [[-36.2, -31, -11.1], [-36.2, -31, 12.1]] as [number, number, number][]) curtain(k, [[x0, z], [x1, z]], 0.4, wagTop - 0.4);
    // the circular planted island in its low pale kerb
    { const { c, r } = WAG.island;
      k.plain.push([new THREE.CylinderGeometry(r + 0.3, r + 0.3, 0.12, 36).translate(c[0], 0.06, c[1]), '#e6e3dc'], [new THREE.CylinderGeometry(r, r, 0.16, 36).translate(c[0], 0.08, c[1]), '#557a35']); }
    // the open metal-framed shade structures over the parking by the wing ends
    for (const [x0, x1, z0, z1] of WAG.shelters) {
      for (const x of [x0, x1]) for (const z of [z0, z1]) { k.plain.push([box(x - 0.07, x + 0.07, 0, 2.6, z - 0.07, z + 0.07), '#2c2e31']); wSolid(x, z, 0.15); }
      for (const z of [z0, z1]) k.plain.push([box(x0, x1, 2.55, 2.7, z - 0.06, z + 0.06), '#2c2e31']);
      for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 4) k.plain.push([box(x - 0.05, x + 0.05, 2.62, 2.72, z0, z1), '#2c2e31']);
    }
    for (const [x, z] of WAG.lamps) { lamp(k, x, z); wSolid(x, z, 0.15); }
    // the white boundary wall with its openings, the gate structure beside the approach
    { const [x0, x1, z0, z1] = WAG.wall, h = 2.2, runs: [P2, P2][] = [];
      const g = WAG.gaps;
      // (the east side on the angle, WAG.east, with the gap where the drive comes in from the strip)
      const E = WAG.east, ex = (v: number): P2 => { const i = v < E[1][1] ? 0 : 1; const [a, b] = [E[i], E[i + 1]]; return [a[0] + ((b[0] - a[0]) * (v - a[1])) / (b[1] - a[1]), v]; };
      runs.push([[x0, z0], [g.north[0], z0]], [[g.north[1], z0], E[0]], [E[0], E[1]], [E[1], ex(g.east[0])], [ex(g.east[1]), E[2]], [[x0, z0], [x0, z1]]);
      const south = [x0, ...g.south.flat(), E[2][0]];
      for (let i = 0; i < south.length; i += 2) runs.push([[south[i], z1], [south[i + 1], z1]]);
      for (const [a, b] of runs) {
        if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.5) continue;
        k.plain.push([strip([a, b], 0, h, 0.12), '#f1f0ec'], [strip([a, b], h, h + 0.12, 0.18), '#e3e1dc']);
        const [ax, az] = WG.world(...a), [bx, bz] = WG.world(...b); wallSolids(ax, az, bx, bz, 0.3);
      }
      const [q0, q1, r0, r1] = WAG.gate;
      k.plain.push([box(q0, q1, 0, 2.8, r0, r1), '#f1f0ec'], [box(q0 - 0.4, q1 + 0.4, 2.8, 3.1, r0 - 0.4, r1 + 0.4), '#e3e1dc']);
      k.glass.push(box(q0 - 0.02, q0, 1, 2.2, r0 + 0.8, r1 - 0.8)); }
    mergeMeshes(k);
  },
};

/** Noguchi, its laboratories and WAGMC */
export const nogSite = createSite('noguchi-wagmc', [noguchi, lab, wagmc]);

// ---------- planting ----------
const TREE = ['#3f6a2c', '#4b7733', '#355f28', '#557f37'];
const GROUND = ['#4d7032', '#557a35', '#5f8238'];
const segDist = (x: number, z: number, ax: number, az: number, bx: number, bz: number) => {
  const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz, t = l ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l)) : 0;
  return Math.hypot(x - ax - dx * t, z - az - dz * t);
};
/** the court's trees, the plots' groundcover and WAGMC's tree, the island's shrubs, and the mature trees round the
 *  institutes where the satellite shows crowns (NOG_TREES) */
export function buildNogGrounds(trees: [number, number, number][]) {
  const crowns: Crown[] = [];
  const addN = (u: number, v: number, c: Omit<Crown, 'x' | 'z'>) => { const [x, z] = NG.world(u, v); crowns.push({ x, z, ...c }); };
  const addW = (u: number, v: number, c: Omit<Crown, 'x' | 'z'>) => { const [x, z] = WG.world(u, v); crowns.push({ x, z, ...c }); };
  for (const [u, v] of [[-14, -13], [12, -14], [-13, 13], [13, 14]] as P2[]) addN(u, v, { r: 4.2, h: 4, base: 2.4, trunk: 0.3, color: TREE[(u + v) & 3], seed: hash2(u, v), solid: true });
  // the shrubs in the soil bed round the monument and along the lawns' edges (S20), compact, the lawns' middles open
  { const [sx, sz] = LAB.sign; for (let i = 0; i < 22; i++) { const s = hash2(i, 7), a = (i / 22) * Math.PI * 2, r = 3.0 + s * 1.6; addN(sx + Math.cos(a) * r * 0.9, sz + Math.sin(a) * r * 0.55, { r: 0.35 + s * 0.15, h: 0.65, base: 0.2, trunk: 0, color: GROUND[(s * 3) | 0], seed: s }); } }
  for (const [a0, a1, b0, b1] of LAB.lawns) for (let u = a0 + 4; u < a1 - 4; u += 2.4) { const s = hash2(u, b0); addN(u, b0 + 1.1, { r: 0.4, h: 0.6, base: 0.2, trunk: 0, color: GROUND[(s * 3) | 0], seed: s }); if (b0 > -135) addN(u + 1.2, b1 - 1.1, { r: 0.4, h: 0.6, base: 0.2, trunk: 0, color: GROUND[(s * 3) | 0], seed: s }); }
  for (const r of WAG.plots) for (let u = r[0] + 0.8; u < r[1] - 0.5; u += 1.1) for (let v = r[2] + 0.7; v < r[3] - 0.5; v += 1.1) { const s = hash2(u * 3, v); addW(u, v, { r: 0.5, h: 0.35, base: 0.2, trunk: 0, color: GROUND[(s * 3) | 0], seed: s }); }
  addW(WAG.tree[0], WAG.tree[1], { r: 2.6, h: 3.2, base: 2.2, trunk: 0.2, color: TREE[1], seed: 0.3, solid: true });
  for (let a = 0; a < Math.PI * 2; a += 0.5) for (const r of [1.4, 3]) { const s = hash2(a, r); addW(WAG.island.c[0] + Math.cos(a) * r, WAG.island.c[1] + Math.sin(a) * r, { r: 0.7, h: 0.5, base: 0.16, trunk: 0, color: GROUND[(s * 3) | 0], seed: s }); }
  // the loop's island (S04): the tree clump in its west half, the one big tree over its middle
  for (const [x, z, r] of [[484.5, 1913.5, 4.2], [491.5, 1919, 3.8], [486, 1925, 3.4], [496, 1910.5, 3.2], [509, 1911, 5.2]] as [number, number, number][]) { const s = hash2(x, z); crowns.push({ x, z, r, h: r * 1.1 + 1, base: 2.2 + s, trunk: 0.32, color: TREE[(s * 4) | 0], seed: s, solid: true }); }
  // the mature trees (from the satellite's crowns), kept off roads and buildings
  const [cx, cz] = NG.world(80, 0);
  const segs: [number, number, number, number, number][] = [];
  for (const r of ROADS) for (let i = 1; i < r.nodes.length; i++) {
    const ax = NODE_XZ[r.nodes[i - 1] * 2], az = NODE_XZ[r.nodes[i - 1] * 2 + 1], bx = NODE_XZ[r.nodes[i] * 2], bz = NODE_XZ[r.nodes[i] * 2 + 1];
    if (Math.min(Math.abs(ax - cx), Math.abs(bx - cx)) > 400 || Math.min(Math.abs(az - cz), Math.abs(bz - cz)) > 400) continue;
    segs.push([ax, az, bx, bz, [4.5, 3.7, 3.1, 2.3, 1.3][r.cls]]);
  }
  const blds = BUILDINGS.filter((b) => Math.abs((b.minX + b.maxX) / 2 - cx) < 420 && Math.abs((b.minZ + b.maxZ) / 2 - cz) < 420);
  for (const [x, z, r] of trees) {
    if (segs.some(([ax, az, bx, bz, h]) => segDist(x, z, ax, az, bx, bz) < h + 1.5) || blds.some((b) => x > b.minX - 1.5 && x < b.maxX + 1.5 && z > b.minZ - 1.5 && z < b.maxZ + 1.5)) continue;
    const s = hash2(x, z), [u, v] = NG.local(x, z), [wu, wv] = WG.local(x, z);
    if ((u > RING.outer * -1 - 2 && u < RING.outer + 2 && v > RING.outerV[0] - 2 && v < RING.outerV[1] + 2) || (wu > WAG.wall[0] && wu < WAG.wall[1] && wv > WAG.wall[2] && wv < WAG.wall[3])) continue;
    if (ARRAYS.some(({ r: q }) => u > q[0] - 1 && u < q[1] + 1 && v > q[2] - 1 && v < q[3] + 1)) continue;
    // (the UGMC precinct is planted by ugmcground.ts)
    { const [gu, gv] = ugLocal(x, z); if (gu > -300 && gu < 130 && gv > -140 && gv < 215) continue; }
    crowns.push({ x, z, r: r * (0.85 + 0.3 * vnoise2(x / 9, z / 9)), h: r * 1.1 + 1, base: 2 + s * 2, trunk: 0.3, color: TREE[(s * 4) | 0], seed: s, solid: true });
  }
  const group = new THREE.Group();
  group.name = 'noguchi-grounds';
  // the red earth (the owner's correction brief, S02/S17/S18): the tracks themselves, compacted and a little paler down
  // the middle; the corridor west of WAGMC red soil either side of its two tracks with the tree belt between them left
  // green; the strip down WAGMC's east side; the cluster's mixed ground in patches; ragged edges, no kerbs
  { const inPoly = (p: P2[], x: number, z: number) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > z) !== (p[j][1] > z) && x < ((p[j][0] - p[i][0]) * (z - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; };
    const sd = (x: number, z: number, l: P2[]) => { let b = Infinity; for (let i = 1; i < l.length; i++) b = Math.min(b, segDist(x, z, l[i - 1][0], l[i - 1][1], l[i][0], l[i][1])); return b; };
    const [west, east] = [NOG_EARTH[0], NOG_EARTH[1]];
    const nb = BUILDINGS.filter((b) => b.maxX > 170 && b.minX < 560 && b.maxZ > 1820 && b.minZ < 2220), wb = WAG_BOUND();
    const color = (x: number, z: number): [number, number, number, number] | null => {
      if (onSealed(x, z, 0.4) || inPoly(wb, x, z) || nb.some((b) => x > b.minX - 0.5 && x < b.maxX + 0.5 && z > b.minZ - 0.5 && z < b.maxZ + 0.5)) return null;
      const n = vnoise2(x / 7, z / 7), m = vnoise2(x / 2.3 + 11, z / 2.3), d = nogEarthDist(x, z), t = hash2(Math.floor(x * 2), Math.floor(z * 2)) * 0.06;
      if (d < 2.1 + (m - 0.5) * 0.8) return d < 0.7 ? [168 - t * 200, 102 - t * 120, 66 - t * 80, 0.95] : [150 - t * 200, 84 - t * 120, 52 - t * 80, 0.95];
      // the corridor: soil out to about 9 m from the tracks, the belt between them (and a little either side) green
      const dw = sd(x, z, west), de = sd(x, z, east);
      if (Math.min(dw, de) < 7 + n * 5 && !(dw < 11.5 && de < 11.5 && Math.abs(dw - de) < 4 + m * 2)) return n > 0.32 ? [158 - t * 200, 90 - t * 120, 58 - t * 80, 0.82 + m * 0.15] : [120, 104, 62, 0.5];
      // the strip down the compound's east side and the cluster: soil in patches among the scrub
      if (sd(x, z, NOG_EARTH[2]) < 4 + n * 3 || (inPoly(NOG_CLUSTER, x, z) && n > 0.45)) return [160 - t * 200, 94 - t * 120, 60 - t * 80, 0.7 + m * 0.25];
      return null;
    };
    const soil = coverOverlay({ box: [176, 372, 1830, 2212], mpp: 0.5, cell: 2, tile: 98, color, cellIn: (x, z) => nogEarthDist(x, z) < 22 || inPoly(NOG_CLUSTER, x, z) });
    for (const m of soil) m.userData.noRelief = true;
    group.add(...soil); }
  group.userData.noRelief = true;
  group.add(...crownTiles(crowns, 100, 75));
  group.userData.crowns = crowns.length;
  return group;
}
