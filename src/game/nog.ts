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
//   gridded fields of low dark panel rows (function inferred);
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
import { crownTiles, hash2, vnoise2, type Crown } from './scrubkit';
import { SILVER, asphaltMat, curtain, facing, lawnMat, plane, prism, rect, strip, type P2, type R4, mergeMeshes } from './medkit';
import { ARRAYS, LAB, NG, NOG_LOTS, RED04, RING, SHED21, WAG, WAG_LOTS, WG } from './nogplan';
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
    // 21 the red shed
    { x0: SHED21[0], x1: SHED21[1], z0: SHED21[2], z1: SHED21[3], floors: 1, roofColor: '#b5452f', pitch: 0.4, faces: { z0: PLAIN_SMALL, z1: PLAIN_SMALL, x0: PLAIN_SMALL, x1: PLAIN_SMALL } },
  ],
  keep: [[ringI[0], ringI[1], ringI[2], ringI[3]], [RING.link[0], RING.link[1], RING.link[2], RING.link[3]], [RED04.court[0], RED04.court[1], RED04.court[2], RED04.court[3]],
    ...ARRAYS.map(({ r }) => r), [LAB.island[0], LAB.island[1], LAB.island[2], LAB.island[3]], ...NOG_LOTS.map((l) => { const us = l.ring.map((p) => p[0]), vs = l.ring.map((p) => p[1]); return [Math.min(...us), Math.max(...us), Math.min(...vs), Math.max(...vs)] as R4; })],
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
    // 04's open centre
    nPlane(k, rect(RED04.court), 0.04, lawnMat(), 4);
    // 17 / 18: low repeated rows of dark panels on light frames, pale aisles between (inferred: ground-mounted arrays)
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
const LS = LAB.storey, labTop = 0.4 + 2 * LS + 0.4, endTop = 0.4 + LAB.endFloors * LS + 0.4;
const lab: Spec = {
  name: 'Noguchi Advanced Research Laboratories',
  axis: NG.axis, origin: NG.origin, storey: LS, style: LAB_PIERS, roofColor: '#5b524b', fascia: '#3d3732', pitch: 0.33,
  blocks: [
    { x0: LAB.frame[1], x1: LAB.front[1], z0: LAB.front[2], z1: LAB.front[3], floors: 2 },
    { x0: LAB.front[0], x1: LAB.frame[1], z0: LAB.front[2] + 2.2, z1: LAB.front[3], floors: 2, roof: 'flat' },
    { x0: LAB.arm[0], x1: LAB.arm[1], z0: LAB.arm[2], z1: LAB.arm[3], floors: 2 },
    { x0: LAB.service[0], x1: LAB.service[1], z0: LAB.service[2], z1: LAB.service[3], floors: 2, roof: 'flat', faces: { z1: LAB_END, x1: LAB_END } },
    { x0: LAB.end[0], x1: LAB.end[1], z0: LAB.end[2], z1: LAB.end[3], floors: LAB.endFloors, roof: 'flat', faces: { z0: LAB_END, z1: LAB_END, x0: LAB_END, x1: LAB_END } },
  ],
  keep: [],
  extras: (k) => {
    // the white entrance frame round the recessed dark lobby (N02, N03)
    { const [x0, x1] = LAB.frame, z = LAB.front[2], h = 6.4;
      k.plain.push([box(x0 - 1, x0, 0, h, z - 0.4, z + 2.2), '#f6f6f4'], [box(x1, x1 + 1, 0, h, z - 0.4, z + 2.2), '#f6f6f4'], [box(x0 - 1, x1 + 1, h - 1.2, h, z - 0.4, z + 2.2), '#f6f6f4']);
      curtain(k, [[x0, z + 2.1], [x1, z + 2.1]], 0.3, h - 1.2);
      k.plain.push([box(x0, x1, 0, 0.25, z - 0.4, z + 2.2), '#d8d6d0']); }
    // the flat service roof and its plant, the end's parapet
    k.plain.push([box(LAB.service[0], LAB.service[1], labTop, labTop + 0.15, LAB.service[2], LAB.service[3]), '#d9d8d2'], [box(LAB.end[0], LAB.end[1], endTop, endTop + 0.6, LAB.end[2], LAB.end[2] + 0.3), '#e8e8e6']);
    for (let i = 0; i < 7; i++) k.plain.push([box(146 + i * 5, 148.4 + i * 5, labTop + 0.15, labTop + 1.4, -126, -123.6), '#cfd2d4']);
    // the signed east end: NOGUCHI over ADVANCED RESEARCH LABORATORIES (N05-N07)
    { const x = LAB.end[1] + 0.06, zc = (LAB.end[2] + LAB.end[3]) / 2;
      k.signs.push({ text: 'NOGUCHI', x, y: endTop - 3.0, z: zc - 1, ry: Math.PI / 2, w: 9, colors: ['#f2f2f0', '#4d7f9c'] });
      k.signs.push({ text: 'ADVANCED RESEARCH LABORATORIES', x, y: endTop - 4.6, z: zc - 1, ry: Math.PI / 2, w: 10.5, colors: ['#f2f2f0', '#4d7f9c'] }); }
    // the external stair flights, landings and balconies with dark railings on the end's south face (N06)
    { const z = LAB.end[3], x0 = LAB.end[0] + 2, x1 = LAB.end[1] - 2;
      for (let f = 1; f < LAB.endFloors; f++) {
        const y = 0.4 + f * LS;
        // the slab, then a railing of dark posts and two thin rails (open, not a solid band)
        k.plain.push([box(x0, x1, y - 0.25, y, z, z + 2.2), '#e9e9e7']);
        for (const yy of [y + 1.0, y + 0.5]) k.plain.push([box(x0, x1, yy - 0.025, yy + 0.025, z + 2.17, z + 2.23), '#2a2c2f'], [box(x0 - 0.03, x0 + 0.03, yy - 0.025, yy + 0.025, z, z + 2.2), '#2a2c2f'], [box(x1 - 0.03, x1 + 0.03, yy - 0.025, yy + 0.025, z, z + 2.2), '#2a2c2f']);
        for (let x = x0; x <= x1 + 0.01; x += 1.2) k.plain.push([box(x - 0.03, x + 0.03, y, y + 1.0, z + 2.17, z + 2.23), '#2a2c2f']);
      }
      for (let i = 0; i < 12; i++) k.plain.push([box(x0 - 4.5 + i * 0.35, x0 - 4.15 + i * 0.35, 0, 0.4 + i * 0.35, z + 0.2, z + 1.6), '#e2e2e0']);
      for (let i = 0; i <= 4; i++) k.plain.push([box(x0 - 4.5 + i * 1.1 - 0.03, x0 - 4.5 + i * 1.1 + 0.03, 0.4 + i * 0.38, 1.4 + i * 0.38, z + 1.57, z + 1.63), '#2a2c2f']);
      for (const [x, zz] of [[x0, z + 2.2], [x1, z + 2.2]] as P2[]) nSolid(x, zz, 0.4); }
    // the freestanding sign in its kerbed island: lawn, light kerb, small shrubs (ground), bollard lights (N02)
    { const [x0, x1, z0, z1] = LAB.island;
      k.plain.push([box(x0, x1, 0, 0.2, z0, z1), '#f0efea']);
      nPlane(k, rect([x0 + 0.3, x1 - 0.3, z0 + 0.3, z1 - 0.3]), 0.22, lawnMat(), 4);
      const [sx, sz] = LAB.sign, ry = facing(-0.95, -0.3);
      k.plain.push([new THREE.BoxGeometry(5.4, 2.6, 0.8).rotateY(ry).translate(sx, 1.5, sz), '#e7e5de'], [new THREE.BoxGeometry(5.6, 0.3, 1).rotateY(ry).translate(sx, 0.35, sz), '#d8d6cf']);
      const dx = Math.sin(ry), dz = Math.cos(ry);
      ['NOGUCHI', 'ADVANCED', 'RESEARCH', 'LABORATORIES'].forEach((t, i) => k.signs.push({ text: t, x: sx + dx * 0.42 - Math.cos(ry) * 0.9, y: 2.4 - i * 0.48, z: sz + dz * 0.42 + Math.sin(ry) * 0.9, ry, w: 0.45 * t.length * 0.62, colors: ['#e7e5de', '#9c998f'] }));
      nSolid(sx, sz, 1.6);
      for (let x = x0 + 2; x < x1; x += 6) { bollard(k, x, z0 + 0.8); bollard(k, x, z1 - 0.8); } }
    // the block-paved parking with white bays (N06)
    for (const l of NOG_LOTS) { nPlane(k, l.ring, 0.05, paverMat(), 3); bays(k, l.rows, l.across); }
    mergeMeshes(k);
  },
};

// ---------- WAGMC ----------
const WS = WAG.storey, wagTop = 0.4 + WAG.floors * WS + 0.4;
const wagmc: Spec = {
  name: 'West African Genetic Medicine Centre',
  axis: WG.axis, origin: WG.origin, storey: WS, style: WAG_WIN, roofColor: '#7a3328', fascia: '#262626', pitch: 0.45,
  replaces: [WG.world(-40, -18), WG.world(-45, 27)],
  blocks: [
    { x0: WAG.north[0], x1: WAG.north[1], z0: WAG.north[2], z1: WAG.north[3], floors: 2 },
    { x0: WAG.south[0], x1: WAG.south[1], z0: WAG.south[2], z1: WAG.south[3], floors: 2 },
    { x0: WAG.base[0], x1: WAG.base[1], z0: WAG.base[2], z1: WAG.base[3], floors: 2 },
    { x0: WAG.rear[0], x1: WAG.rear[1], z0: WAG.rear[2], z1: WAG.rear[3], floors: 2 },
    { x0: WAG.service[0], x1: WAG.service[1], z0: WAG.service[2], z1: WAG.service[3], floors: 1, roof: 'flat', faces: { z0: PLAIN_SMALL, z1: PLAIN_SMALL, x0: PLAIN_SMALL, x1: PLAIN_SMALL } },
  ],
  keep: [[WAG.wall[0], WAG.wall[1], WAG.wall[2], WAG.wall[3]]],
  extras: (k) => {
    // the ground of the compound: asphalt drive and yards, the grass strip along the north wall
    wPlane(k, rect(WAG.wall), 0.04, asphaltMat(), 6);
    wPlane(k, rect(WAG.lawn), 0.06, lawnMat(), 4);
    // the portal: a thick white frame round the dark glazed entrance; the pale platform and steps; the salmon forecourt
    { const [x0, x1, z0, z1] = WAG.portal, h = wagTop + 1.2;
      k.plain.push([box(x0, x1, 0, h, z0, z0 + 1.2), '#f6f6f4'], [box(x0, x1, 0, h, z1 - 1.2, z1), '#f6f6f4'], [box(x0, x1, h - 1.4, h, z0, z1), '#f6f6f4']);
      curtain(k, [[x0 - 0.1, z0 + 1.2], [x0 - 0.1, z1 - 1.2]], 0.3, h - 1.4);
      k.plain.push([box(x0 + 0.4, x0 + 0.5, 0.45, 3.2, -1.6, 1.6), '#2b2d30']);
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
      runs.push([[x0, z0], [g.north[0], z0]], [[g.north[1], z0], [x1, z0]], [[x1, z0], [x1, g.east[0]]], [[x1, g.east[1]], [x1, z1]], [[x0, z0], [x0, z1]]);
      const south = [x0, ...g.south.flat(), x1];
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
  for (let u = LAB.island[0] + 2; u < LAB.island[1] - 4; u += 1.6) for (const v of [-138.5, -134.5, -129, -125.5]) { const s = hash2(u, v); addN(u + s, v, { r: 0.45 + s * 0.2, h: 0.6, base: 0.22, trunk: 0, color: GROUND[(s * 3) | 0], seed: s }); }
  for (const r of WAG.plots) for (let u = r[0] + 0.8; u < r[1] - 0.5; u += 1.1) for (let v = r[2] + 0.7; v < r[3] - 0.5; v += 1.1) { const s = hash2(u * 3, v); addW(u, v, { r: 0.5, h: 0.35, base: 0.2, trunk: 0, color: GROUND[(s * 3) | 0], seed: s }); }
  addW(WAG.tree[0], WAG.tree[1], { r: 2.6, h: 3.2, base: 2.2, trunk: 0.2, color: TREE[1], seed: 0.3, solid: true });
  for (let a = 0; a < Math.PI * 2; a += 0.5) for (const r of [1.4, 3]) { const s = hash2(a, r); addW(WAG.island.c[0] + Math.cos(a) * r, WAG.island.c[1] + Math.sin(a) * r, { r: 0.7, h: 0.5, base: 0.16, trunk: 0, color: GROUND[(s * 3) | 0], seed: s }); }
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
  group.userData.noRelief = true;
  group.add(...crownTiles(crowns, 100, 75));
  group.userData.crowns = crowns.length;
  return group;
}
