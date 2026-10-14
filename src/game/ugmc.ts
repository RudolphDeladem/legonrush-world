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
import { WHITE, box, canvas, speckle, tri2, type Part } from './modelkit';
import { SOLIDS } from './solids';
import {
  BRIDGES, CORE, CORE_ARC, FLAGS, GARDEN, LETTER_LAWNS, LONG, LOOP, LOTS, OPD, OPD_BOW, POSTS, PT, ROUND, SIM, TOTEMS, UG, WC, WEST_CANOPY,
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
/** 05 tall ends: near blank, light horizontal bands, a narrow dark vertical strip */
const TOWER_END: Style = {
  bay: 5, up: [], ground: [],
  draw: (g) => { whitePanels(g); g.fillStyle = '#39434c'; g.fillRect(118, 0, 20, 512); g.fillStyle = 'rgba(150,180,200,0.3)'; g.fillRect(118, 0, 4, 512); },
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
    { x0: LONG[0], x1: LONG[1], z0: LONG[2], z1: LONG[3], floors: 2, roofColor: '#bfc3c5', pitch: 0.12, faces: { z0: GREY_LOW, z1: GREY_LOW, x0: GREY_LOW, x1: GREY_LOW } },
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
      // the shallow canopy on silver posts, its radiating braces up to the glass (E02, E20, A17)
      const can = arc(c, r - 0.1, 120, 154, 8), out = arc(c, r - 4.2, 120, 154, 8);
      k.plain.push([prism([...can, ...out.slice().reverse()], 4.5, 4.75), '#e3e6e8']);
      k.plain.push([strip(out, 4.45, 4.8, 0.1), SILVER]);
      for (const a of [124, 150]) { const [px, pz] = arc(c, r - 0.55, a, a, 0)[0]; k.plain.push([new THREE.CylinderGeometry(0.18, 0.18, 4.6, 12).translate(px, 2.3, pz), SILVER]); solid(px, pz, 0.25); }
      for (let i = 0; i <= 8; i += 2) { const [ax, az] = can[i], [bx, bz] = out[i], g = new THREE.CylinderGeometry(0.04, 0.04, Math.hypot(bx - ax, bz - az, 2.6), 6), d = new THREE.Vector3(bx - ax, -2.6, bz - az).normalize();
        g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d)); k.plain.push([g.translate((ax + bx) / 2, 4.75 + 1.3, (az + bz) / 2), SILVER]); }
      // glass doors at the foot of the curtain wall under the canopy
      k.glass.push(strip(arc(c, r - 0.12, 132, 142, 3), 0.3, 3.2, 0.05));
      badgeSign(k, 'Emergency & Diagnostics', '1', '#d4a017', mid[0] + nx * 0.25, top4 - 1.4, mid[1] + nz * 0.25, facing(nx, nz), 9.5);
    }
    // the roof: pale weathered membrane, chiller clusters, duct runs, the raised enclosure and the angular covered run
    k.plain.push([box(CORE.x0 + 0.3, -47.2, top4 + 0.02, top4 + 0.06, CORE.z0 + 0.3, CORE.z1 - 0.3), '#d9d8d2']);
    for (const [cx, cz, n, al] of [[-84, 24, 4, true], [-84, 66, 3, true], [-38, 66, 3, false], [-56, 70, 4, true]] as [number, number, number, boolean][]) for (let i = 0; i < n; i++) chiller(k, cx + (al ? (i % 2) * 2.8 : i * 1.6), cz + (al ? Math.floor(i / 2) * 1.8 : 0), top4 + 0.06, al);
    k.plain.push([box(-70, -60, top4, top4 + 3.4, 38, 48), '#e3e1da'], [box(-70.3, -59.7, top4 + 3.4, top4 + 3.6, 37.7, 48.3), '#c9c6bd']);
    tanks(k, [[-66, 43]], top4 + 3.6, 0.6);
    { const run: P2[] = [[-80, 30], [-72, 34], [-72, 52], [-58, 56], [-50, 50], [-50, 36], [-58, 30]];
      for (let i = 1; i < run.length; i++) { const [ax, az] = run[i - 1], [bx, bz] = run[i], l = Math.hypot(bx - ax, bz - az), ang = -Math.atan2(bz - az, bx - ax);
        const g = new THREE.CylinderGeometry(1.1, 1.1, l, 3, 1, false).rotateZ(Math.PI / 2).rotateY(ang).translate((ax + bx) / 2, top4 + 0.6, (az + bz) / 2); k.plain.push([g, '#d4b36d']); } }
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
      badgeSign(k, 'Outpatients & Administration', '3', '#1f6fc4', ax2 + nx * 0.15, h - 1.3, az2 + nz * 0.15, facing(nx, nz), 10.5);
      // the shallow canopy, its silver posts and triangulated rods (E39)
      const ux = dx / l, uz = dz / l, cw = 4.5, out = 2.6;
      const P = (s: number, o: number): [number, number, number] => [ax2 + ux * s + nx * o, 4.6, az2 + uz * s + nz * o];
      k.plain.push([new THREE.BoxGeometry(2 * cw, 0.22, out).rotateY(-Math.atan2(uz, ux)).translate(ax2 + nx * out / 2, 4.6, az2 + nz * out / 2), '#e3e6e8']);
      for (const s of [-cw + 0.6, cw - 0.6]) { const [px, , pz] = P(s, 1.7); k.plain.push([new THREE.CylinderGeometry(0.16, 0.16, 4.6, 12).translate(px, 2.3, pz), SILVER]); solid(px, pz, 0.3); }
      for (const s of [-cw, -cw / 3, cw / 3, cw]) { const [px, py, pz] = P(s * 0.9, out), [qx, , qz] = P(0, 0.1), d = new THREE.Vector3(qx - px, 3.4, qz - pz), g = new THREE.CylinderGeometry(0.035, 0.035, d.length(), 6);
        g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())); k.plain.push([g.translate((px + qx) / 2, py + 1.7, (pz + qz) / 2), SILVER]); }
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

    // ===== 05: the tall ends, the recessed dark bay and the low signed entrance, the mast, the badge =====
    for (const r of [PT.north, PT.west, PT.south, PT.mid] as R4[]) parapet(k, r, top4);
    parapet(k, PT.spine, 0.4 + 5 * ST + 0.4);
    { const tt = 0.4 + PT.towerFloors * ST + 0.4, [x0, x1, z0, z1] = PT.entrance;
      parapet(k, PT.towerN, tt); parapet(k, PT.towerS, tt);
      curtain(k, [[PT.mid[1] + 0.08, PT.towerN[3]], [PT.mid[1] + 0.08, PT.towerS[2]]], 0.3, top4);
      k.plain.push([box(PT.mid[1], x1, 4.4, 5.3, z0, z1), '#eef0ef'], [box(x1 - 0.3, x1, 3.8, 5.3, z0, z1), '#eef0ef']);
      k.signs.push({ text: 'Patient Tower', x: x1 + 0.02, y: 4.75, z: (z0 + z1) / 2, ry: Math.PI / 2, w: 4.6, colors: ['#4a5560', '#ffffff'] });
      k.signs.push({ text: '5', x: PT.towerN[1] + 0.06, y: tt - 2, z: PT.towerN[2] + 2.5, ry: Math.PI / 2, w: 1.5, colors: ['#5b6670', '#ffffff'] });
      // the lattice mast over the north end (E24, E41)
      const mx = (PT.towerN[0] + PT.towerN[1]) / 2, mz = (PT.towerN[2] + PT.towerN[3]) / 2;
      for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; k.plain.push([new THREE.CylinderGeometry(0.06, 0.08, 9, 5).translate(mx + Math.cos(a) * 0.6, tt + 4.5, mz + Math.sin(a) * 0.6), '#9aa0a5']); }
      for (let y = tt + 1; y < tt + 9; y += 1.2) k.plain.push([new THREE.TorusGeometry(0.6, 0.03, 4, 3).rotateX(Math.PI / 2).translate(mx, y, mz), '#9aa0a5']);
      for (const a of [0, 2.1, 4.2]) k.plain.push([box(mx + Math.cos(a) * 0.9 - 0.25, mx + Math.cos(a) * 0.9 + 0.25, tt + 7.5, tt + 8.6, mz + Math.sin(a) * 0.9 - 0.12, mz + Math.sin(a) * 0.9 + 0.12), '#d9dcde']);
      for (let i = 0; i < 6; i++) chiller(k, -88 + (i % 3) * 2.8, 96 + Math.floor(i / 3) * 2, top4, true); }
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
