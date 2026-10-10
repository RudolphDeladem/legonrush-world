// The graduate cluster west of the Nursing School, from the owner's reference PDF of game views beside street photos
// (docs/CAMPUS_REFERENCE_AUDIT.md, pages 5-20; block engine: blocks.ts):
//
// - The School of Graduate Studies (pages 5-6): one floor, white over a dark red dado, black-framed windows in pairs,
//   red-brown clay tile hipped roofs over its wings; in the middle of its south front a wide gable over an arched
//   porch lettered FREDERICK MARS... / SCHOOL OF GRADUATE STUDIES; an asphalt car park before it toward the road with a
//   kerbed island of young trees and RESERVED SGS boards; tall columnar ashoka trees and big shade trees.
// - The Doctorate building (pages 7-11), west of it across the road and the car park: two floors, white, big
//   black-framed windows on both floors, air-conditioners in a row at the foot, a double-height portico on two square
//   columns before the entrance with a blue board, a one-floor wing under a lean-to at its south end, low dark
//   red-brown roofs with deep eaves; a brick-paver car park between it and the Graduate School, palms and a white wall
//   with a red base along the Graduate School's gable end, bush along its north end toward the road.
// - The construction site beside it on the road west (pages 12-14): no finished building; a long maroon corrugated
//   hoarding braced by timber struts follows the road, a gravel apron at its gate, the project board on two posts, a
//   yellow CAUTION board, red-and-white posts along the road edge, a lamp post, a site shed roof behind the hoarding.
// - The Research and Innovation Complex (pages 14-20): two-floor white blocks under maroon hipped roofs round a court,
//   black-framed windows, a stone-clad feature wall framed in white on the east block's north end; a flat-roofed
//   security post with dark glazing at the gate, a brick-paved approach between white planter walls; a black steel
//   palisade fence on a low white wall round the whole site.
import * as THREE from 'three';
import { box, merge, speckle, tri2, type Part } from './modelkit';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { concrete, panel, rails, stoneMesh } from './concrete';
import { garden } from './gardens';
import { ashoka } from './biology';
import { hipRoof } from './waccbip';
import { SOLIDS } from './solids';

const WHITE = '#f3f2ed', DADO = '#8e2a22', TILE = '#9c4a2c', MAROON = '#6b2328', DARK_EAVE = '#3a2420';
const open = { gw: 99, tri: false }, hip = { gw: 0, tri: false };
type R4 = [number, number, number, number];

const grime = (g: CanvasRenderingContext2D, a = 0.1) => speckle(g, 0, 0, 256, 512, 400, [`rgba(120,116,106,${a})`, `rgba(150,146,136,${a})`]);
/** a black-framed window: frame, panes, glazing bars */
const blackWin = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cols = 2, glass = '#26313a') => {
  g.fillStyle = '#121212'; g.fillRect(x - 4, y - 4, w + 8, h + 8);
  g.fillStyle = glass; g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(160,180,195,0.22)'; g.fillRect(x + 3, y + 3, w * 0.35, h - 6);
  g.fillStyle = '#121212'; for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - 2, y, 4, h);
};
const acUnit = (g: CanvasRenderingContext2D, x: number, y: number) => {
  g.fillStyle = '#e8e9e7'; g.fillRect(x, y, 34, 24); g.fillStyle = '#8e9294'; g.beginPath(); g.arc(x + 12, y + 12, 8, 0, Math.PI * 2); g.fill();
};

/** the Graduate School: white over the dark red dado, a pair of black-framed windows per bay */
const GS_WALL: Style = {
  bay: 3.4, up: [], ground: [[64, 256 + 78, 128, 104]],
  draw: (g) => {
    render(g, WHITE); grime(g, 0.08);
    blackWin(g, 64, 256 + 78, 58, 104, 2); blackWin(g, 134, 256 + 78, 58, 104, 2);
    g.fillStyle = DADO; g.fillRect(0, 512 - 58, 256, 58);
  },
};
/** the Doctorate building: white, a wide black-framed window per bay on both floors, a thin red dado */
const DR_WALL: Style = {
  bay: 3.3, up: [[40, 56, 176, 120]], ground: [[40, 256 + 56, 176, 120]],
  draw: (g) => {
    render(g, '#f6f6f3'); grime(g, 0.05);
    for (const y0 of [0, 256]) blackWin(g, 40, y0 + 56, 176, 120, 3, '#1f262c');
    acUnit(g, 110, 512 - 64);
    g.fillStyle = '#9a2f26'; g.fillRect(0, 512 - 22, 256, 22);
  },
};
/** the Research and Innovation Complex: white, black-framed windows, tall on the upper floor */
const RIC_WALL: Style = {
  bay: 3.6, up: [[70, 40, 116, 150]], ground: [[60, 256 + 60, 136, 130]],
  draw: (g) => {
    render(g, '#f7f7f4'); grime(g, 0.04);
    blackWin(g, 70, 40, 116, 150, 2, '#1c2228'); blackWin(g, 60, 256 + 60, 136, 130, 3, '#1c2228');
    g.fillStyle = '#d9d6cf'; g.fillRect(0, 512 - 16, 256, 16);
  },
};

const frame = (O: [number, number]) => ({
  X: (x: number) => x - O[0], Z: (z: number) => z - O[1],
  B: (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(x0 - O[0], x1 - O[0], y0, y1, z0 - O[1], z1 - O[1]),
  M: (x: number, z: number): [number, number] => [x - O[0], z - O[1]],
});
const finish = (k: Kit, c: Part[], st: Part[] = []) => {
  stoneMesh(k, st);
  if (!c.length) return;
  const m = new THREE.Mesh(merge(c), concrete(0.15));
  m.castShadow = true; m.receiveShadow = true;
  k.meshes.push(m);
};
/** asphalt with white bay lines */
const carPark = (k: Kit, B: ReturnType<typeof frame>['B'], [x0, x1, z0, z1]: R4, bays: { along: 'x' | 'z'; at: number; from: number; to: number; len: number }[], col = '#55575a') => {
  k.plain.push([B(x0, x1, 0.015, 0.04, z0, z1), col]);
  for (const b of bays) for (let t = b.from; t <= b.to; t += 2.6) {
    if (b.along === 'x') k.plain.push([B(t - 0.05, t + 0.05, 0.04, 0.045, Math.min(b.at, b.at + b.len), Math.max(b.at, b.at + b.len)), '#e9e9e4']);
    else k.plain.push([B(Math.min(b.at, b.at + b.len), Math.max(b.at, b.at + b.len), 0.04, 0.045, t - 0.05, t + 0.05), '#e9e9e4']);
  }
};

// ---------- the School of Graduate Studies ----------
const GS_O: [number, number] = [-401, -158];
const GS_RECTS: R4[] = [
  [-420.6, -380.6, -178.6, -169.2], // the long range at the back (north)
  [-404.8, -399.7, -169.2, -159.9], // the link south from it
  [-397.7, -379.8, -160.4, -149.3], // the east wing
  [-411.9, -397.7, -159.9, -142.0], // the middle block
  [-421.8, -411.9, -152.6, -141.4], // the south-west wing
  [-397.7, -391.0, -149.3, -142.2], // the small block south of the east wing
];
const PORCH: R4 = [-411.2, -397.7, -142.0, -138.2];
const gradSchool: Spec = (() => {
  const { X, Z, B, M } = frame(GS_O);
  return {
    name: 'Graduate School, Legon', axis: [1, 0], origin: GS_O, storey: 3.7, style: GS_WALL, roofColor: TILE, fascia: '#efede6', pitch: 0.5, plinth: DADO,
    blocks: GS_RECTS.map(([x0, x1, z0, z1]) => ({ x0: X(x0), x1: X(x1), z0: Z(z0), z1: Z(z1), floors: 1 })),
    keep: [[X(-422), X(-380), Z(-137), Z(-121)]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      const e = k.wallTop(1);
      // the porch: a wide gable to the south (the road) over an arched opening, its name on the gable, lamps either side
      k.roof.c = new THREE.Color(TILE);
      const top = hipRoof(k, M, PORCH[0] - 0.4, PORCH[1] + 0.4, PORCH[2] - 2, PORCH[3] - 0.5, e, 0.5, 'z', [hip, open], c, '#efede6');
      const [px0, px1, pz] = [PORCH[0] - 0.4, PORCH[1] + 0.4, PORCH[3] - 0.5], pm = (PORCH[0] + PORCH[1]) / 2;
      c.push([tri2([X(px0), e - 0.02, Z(pz)], [X(px1), e - 0.02, Z(pz)], [X(pm), top, Z(pz)]), '#f6f5f0']);
      for (const x of [PORCH[0], PORCH[1]]) c.push([B(x - 0.4, x + 0.4, 0, e, PORCH[2], PORCH[3]), '#f6f5f0']);
      // the front wall of the porch: piers either side of the arch
      const aw = 4.6, ah = 3.0;
      c.push([B(PORCH[0], pm - aw / 2, 0, e, PORCH[3] - 0.5, PORCH[3]), '#f6f5f0'], [B(pm + aw / 2, PORCH[1], 0, e, PORCH[3] - 0.5, PORCH[3]), '#f6f5f0']);
      const sp = ah - aw / 2, arch = new THREE.Shape();
      arch.moveTo(aw / 2, sp);
      for (let i = 1; i <= 16; i++) { const t = (i / 16) * Math.PI; arch.lineTo((aw / 2) * Math.cos(t), sp + (aw / 2) * Math.sin(t)); }
      arch.lineTo(-aw / 2, e); arch.lineTo(aw / 2, e); arch.closePath();
      c.push([new THREE.ExtrudeGeometry(arch, { depth: 0.5, bevelEnabled: false }).translate(X(pm), 0, Z(PORCH[3] - 0.5)), '#f6f5f0']);
      c.push([B(PORCH[0], PORCH[1], 0, 0.2, PORCH[2], PORCH[3] + 0.6), '#c9c3b5'], [B(PORCH[0], PORCH[1], 0, 0.6, PORCH[3] - 0.55, PORCH[3] + 0.02), DADO]);
      // inside the porch: the glazed doors, a lamp over them
      k.plain.push([B(pm - 1.2, pm + 1.2, 0.2, 2.6, PORCH[2] + 0.02, PORCH[2] + 0.06), '#2a2522']);
      k.glass.push(B(pm - 1.1, pm + 1.1, 0.3, 2.5, PORCH[2] + 0.06, PORCH[2] + 0.08));
      k.plain.push([B(pm - 2.3, pm + 2.3, e + 0.4, e + 1.4, pz + 0.02, pz + 0.05), '#f8f7f2']);
      k.signs.push({ text: 'FREDERICK MARSHALL BUILDING', x: X(pm), y: e + 1.1, z: Z(pz + 0.06), ry: 0, w: 3.6, colors: ['#f8f7f2', '#2b2b2b'] });
      k.signs.push({ text: 'SCHOOL OF GRADUATE STUDIES', x: X(pm), y: e + 0.65, z: Z(pz + 0.06), ry: 0, w: 3.4, colors: ['#f8f7f2', '#7a1f1a'] });
      for (const x of [pm - 2.9, pm + 2.9]) k.plain.push([B(x - 0.12, x + 0.12, e - 0.6, e - 0.3, pz + 0.05, pz + 0.25), '#ffe9a8']);
      // the car park before it toward the road, its island of young trees and a hedge, the RESERVED SGS boards
      carPark(k, B, [-421, -381, -137, -122], [{ along: 'x', at: -137, from: -419, to: -383, len: 5 }, { along: 'x', at: -122, from: -419, to: -405, len: -5 }]);
      c.push([B(-414, -392, 0, 0.2, -131, -128), '#c9c4b8']);
      k.plain.push([B(-413.7, -392.3, 0.2, 0.22, -130.7, -128.3), '#5f7d3a']);
      const g = garden([-430, -370, -190, -115]); g.reseed(211);
      g.hedge(k, X(-413.5), Z(-129.5), X(-392.5), Z(-129.5));
      for (const x of [-410, -404, -398]) g.tree(k, X(x), Z(-129.6), 0.55);
      for (const [x, z] of [[-417, -136.5], [-386, -136.5]]) {
        c.push([B(x - 0.03, x + 0.03, 0, 1.0, z - 0.03, z + 0.03), '#d9dcdf']);
        k.plain.push([B(x - 0.35, x + 0.35, 0.7, 1.15, z + 0.03, z + 0.05), '#f4f4f0']);
        k.signs.push({ text: 'RESERVED SGS', x: X(x), y: 0.92, z: Z(z + 0.06), ry: 0, w: 0.65, colors: ['#f4f4f0', '#b4282c'] });
      }
      // the trees round it: tall columnar ashokas at the corners of the front, big shade trees behind (north)
      for (const [x, z, h, s] of [[-424, -139, 14, 1], [-424.5, -134, 13, 2], [-377, -140, 14, 3], [-376.5, -135, 12, 4]] as [number, number, number, number][]) ashoka(k, X(x), Z(z), h, s);
      for (const [x, z, s] of [[-376, -176, 2.4], [-424, -176, 2.2], [-389, -186, 2.0]] as [number, number, number][]) g.tree(k, X(x), Z(z), s);
      // the Doctorate side (page 8): palms along its west gable end before a white wall with a red base
      for (let z = -176; z <= -145; z += 5.5) g.palm(k, X(-424.2), Z(z), 4.2 + (Math.abs(z) % 3) * 0.5);
      c.push([B(-423.4, -423.1, 0, 1.4, -178, -143), '#f2f1ec'], [B(-423.45, -423.05, 0, 0.45, -178, -143), DADO]);
      finish(k, c);
    },
  };
})();

// ---------- the Doctorate building ----------
const DR_O: [number, number] = [-452.8, -166.3];
const DR_MAIN: R4 = [-459.2, -446.4, -183.9, -148.6];
const doctorate: Spec = (() => {
  const { X, Z, B, M } = frame(DR_O);
  return {
    name: 'Doctorate building', axis: [1, 0], origin: DR_O, storey: 3.4, style: DR_WALL, roofColor: MAROON, fascia: DARK_EAVE, pitch: 0.24, plinth: '#9a2f26',
    replaces: [DR_O],
    blocks: [
      { x0: X(DR_MAIN[0]), x1: X(DR_MAIN[1]), z0: Z(DR_MAIN[2]), z1: Z(DR_MAIN[3]), floors: 2, roof: 'none' },
      { x0: X(-461.7), x1: X(-459.2), z0: Z(-174.5), z1: Z(-160.1), floors: 2, roof: 'none' },
      // the one-floor wing at the south end (toward the road) under its lean-to
      { x0: X(-458.4), x1: X(-447.2), z0: Z(-148.6), z1: Z(-143.6), floors: 1, roof: 'none' },
    ],
    keep: [[X(-447), X(-424), Z(-194), Z(-146)], [X(-462), X(-446), Z(-149), Z(-143)], [X(-468), X(-461), Z(-185), Z(-148)]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      const e1 = k.wallTop(1), e2 = k.wallTop(2);
      // low dark red-brown roofs with deep eaves over the main block and its west bay
      k.roof.c = new THREE.Color(MAROON);
      hipRoof(k, M, DR_MAIN[0] - 1.0, DR_MAIN[1] + 1.0, DR_MAIN[2] - 1.0, DR_MAIN[3] + 1.0, e2, 0.24, 'z', [hip, hip], c, DARK_EAVE);
      hipRoof(k, M, -462.6, -459.2, -175.3, -159.3, e2 - 0.3, 0.24, 'x', [hip, open], c, DARK_EAVE);
      // the south wing's lean-to, falling away from the main block
      k.roof.quad([X(-446.4), e1 + 0.5, Z(-148.6)], [X(-459.2), e1 + 0.5, Z(-148.6)], [X(-459.2), e1, Z(-142.9)], [X(-446.4), e1, Z(-142.9)]);
      c.push([B(-459.2, -446.4, e1 - 0.25, e1, -143.0, -142.8), DARK_EAVE]);
      // the double-height portico on the east front: two square white columns to the eaves, a flat canopy, the doors
      // in a recess, the blue board over them, a lamp
      const pz0 = -170.5, pz1 = -162.5, px = -443.0;
      for (const z of [pz0 + 0.4, pz1 - 0.4]) { c.push([B(px - 0.35, px + 0.35, 0, e2 - 0.3, z - 0.35, z + 0.35), '#f8f8f5']); SOLIDS.add(px, z, 0.4); }
      c.push([B(DR_MAIN[1], px + 0.5, e2 - 0.45, e2 - 0.1, pz0, pz1), '#f8f8f5']);
      k.roof.quad([X(px + 0.6), e2 - 0.1, Z(pz0 - 0.2)], [X(px + 0.6), e2 - 0.1, Z(pz1 + 0.2)], [X(DR_MAIN[1]), e2 + 0.6, Z(pz1 + 0.2)], [X(DR_MAIN[1]), e2 + 0.6, Z(pz0 - 0.2)]);
      k.roof.quad([X(px + 0.6), e2 - 0.1, Z(pz1 + 0.2)], [X(px + 0.6), e2 - 0.1, Z(pz0 - 0.2)], [X(DR_MAIN[1]), e2 + 0.6, Z(pz0 - 0.2)], [X(DR_MAIN[1]), e2 + 0.6, Z(pz1 + 0.2)]);
      k.plain.push([B(DR_MAIN[1] - 0.02, DR_MAIN[1] + 0.03, 0.2, 2.8, -167.8, -165.2), '#20262b']);
      k.glass.push(B(DR_MAIN[1] + 0.03, DR_MAIN[1] + 0.05, 0.3, 2.7, -167.7, -165.3));
      k.plain.push([B(DR_MAIN[1] + 0.03, DR_MAIN[1] + 0.06, 3.0, 3.5, -168.2, -164.8), '#1f4f9a']);
      k.signs.push({ text: 'DOCTORATE BUILDING', x: X(DR_MAIN[1] + 0.07), y: 3.25, z: Z(-166.5), ry: Math.PI / 2, w: 3.2, colors: ['#1f4f9a', '#ffffff'] });
      c.push([B(DR_MAIN[1], -442.4, 0, 0.18, pz0, pz1), '#c9c4b8']);
      k.plain.push([B(DR_MAIN[1] + 0.02, DR_MAIN[1] + 0.2, 2.9, 3.1, -164.0, -163.7), '#fff1c4']);
      // a row of air-conditioners at the foot of the east front, a bed of shrubs along it
      for (let z = -182; z < -150; z += 2.1) if (z < pz0 - 1 || z > pz1 + 1) c.push([B(DR_MAIN[1], DR_MAIN[1] + 0.35, 0.3, 0.85, z - 0.4, z + 0.4), '#e6e7e5']);
      const g = garden([-470, -420, -195, -135]); g.reseed(223);
      g.hedge(k, X(-445.6), Z(-183), X(-445.6), Z(-172)); g.hedge(k, X(-445.6), Z(-160), X(-445.6), Z(-150));
      // the brick-paver car park between it and the Graduate School, its bay lines, a round island with a clipped tree;
      // a blue car shelter far off at its south end
      k.plain.push([B(-438, -425, 0.015, 0.04, -186, -142), '#8b8378']);
      for (let z = -186; z < -142; z += 0.6) k.plain.push([B(-438, -425, 0.04, 0.042, z, z + 0.03), '#6f685e']);
      for (let z = -184; z <= -146; z += 2.6) k.plain.push([B(-430.5, -425.5, 0.042, 0.047, z - 0.05, z + 0.05), '#ececE7']);
      c.push([new THREE.CylinderGeometry(2.0, 2.0, 0.2, 18).translate(X(-434), 0.1, Z(-157)), '#c9c4b8']);
      k.plain.push([new THREE.CylinderGeometry(1.85, 1.85, 0.04, 18).translate(X(-434), 0.21, Z(-157)), '#5f7d3a']);
      g.tree(k, X(-434), Z(-157), 0.6);
      for (const [x, z] of [[-436, -193], [-428, -193], [-436, -188.5], [-428, -188.5]]) { c.push([B(x - 0.05, x + 0.05, 0, 2.6, z - 0.05, z + 0.05), '#cfd3d6']); SOLIDS.add(x, z, 0.12); }
      k.roof.c = new THREE.Color('#2856b8');
      k.roof.quad([X(-436.4), 2.6, Z(-188.1)], [X(-427.6), 2.6, Z(-188.1)], [X(-427.6), 2.9, Z(-193.4)], [X(-436.4), 2.9, Z(-193.4)]);
      k.roof.quad([X(-427.6), 2.6, Z(-188.1)], [X(-436.4), 2.6, Z(-188.1)], [X(-436.4), 2.9, Z(-193.4)], [X(-427.6), 2.9, Z(-193.4)]);
      // bush and young trees along the west side, seen from the road coming from the west (page 11)
      for (const [x, z, r] of [[-464, -182, 1.4], [-464.5, -177, 1.1], [-465, -158, 1.5], [-464, -152, 1.2], [-463.5, -186, 1.0]] as [number, number, number][]) k.plain.push([new THREE.IcosahedronGeometry(r, 1).scale(1.2, 0.85, 1).translate(X(x), r * 0.6, Z(z)), '#3f6a2c']);
      for (const [x, z] of [[-465.5, -170], [-465, -164]]) g.tree(k, X(x), Z(z), 0.7);
      finish(k, c);
    },
  };
})();

// ---------- the construction site on the road west of it ----------
const CS_O: [number, number] = [-548, -195];
/** the hoarding's line, its gate gap between points 1 and 2 (the gravel apron to the road there) */
const HOARD: [number, number][] = [[-567, -188], [-555, -180.5], [-549.5, -177.1], [-528, -168], [-525, -205], [-545, -222], [-570, -218]];
const site: Spec = (() => {
  const { X, Z, B } = frame(CS_O);
  return {
    name: 'construction site beside the Doctorate building', axis: [1, 0], origin: CS_O, storey: 3, style: RIC_WALL, roofColor: MAROON, fascia: DARK_EAVE, pitch: 0.3,
    blocks: [],
    keep: [[X(-572), X(-522), Z(-224), Z(-162)], [X(-593), X(-584), Z(-241), Z(-185)]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      // the maroon corrugated hoarding, 2.4 m, ribbed, braced on the outside by timber struts
      for (let i = 0; i < HOARD.length; i++) {
        if (i === 1) continue;
        const [ax, az] = HOARD[i], [bx, bz] = HOARD[(i + 1) % HOARD.length];
        const len = Math.hypot(bx - ax, bz - az), a = Math.atan2(bz - az, bx - ax), ux = (bx - ax) / len, uz = (bz - az) / len;
        c.push([new THREE.BoxGeometry(len, 2.4, 0.06).rotateY(-a).translate(X((ax + bx) / 2), 1.2, Z((az + bz) / 2)), '#5b1f25']);
        // the outward side: for this ring (clockwise in x-z) the outside is to the right of the direction
        const ox = uz, oz = -ux;
        for (let t = 0.4; t < len; t += 0.32) c.push([new THREE.BoxGeometry(0.06, 2.4, 0.04).translate(X(ax + ux * t + ox * 0.04), 1.2, Z(az + uz * t + oz * 0.04)), '#4d1a1f']);
        for (let t = 1.5; t < len - 0.5; t += 3.2) {
          const sx = ax + ux * t, sz = az + uz * t;
          c.push([new THREE.BoxGeometry(0.08, 2.6, 0.08).rotateX(0.55).rotateY(-Math.atan2(ox, oz)).translate(X(sx + ox * 0.7), 1.1, Z(sz + oz * 0.7)), '#b08a5a']);
        }
        const n = Math.ceil(len / 0.4);
        for (let j = 0; j <= n; j++) SOLIDS.add(ax + ((bx - ax) * j) / n, az + ((bz - az) * j) / n, 0.25);
      }
      // the site behind it: bare red earth, a shed roof on steel posts, stacked blocks, the first columns of the building
      const ring = HOARD.map(([x, z]) => new THREE.Vector2(X(x), -Z(z)));
      k.plain.push([new THREE.ShapeGeometry(new THREE.Shape(ring)).rotateX(-Math.PI / 2).translate(0, 0.03, 0), '#9a6a4c']);
      for (const [x, z] of [[-560, -200], [-552, -200], [-560, -192], [-552, -192]]) c.push([B(x - 0.08, x + 0.08, 0, 3.6, z - 0.08, z + 0.08), '#4a4d50']);
      k.roof.c = new THREE.Color('#8a9095');
      k.roof.quad([X(-561), 3.4, Z(-191)], [X(-551), 3.4, Z(-191)], [X(-551), 3.9, Z(-201)], [X(-561), 3.9, Z(-201)]);
      k.roof.quad([X(-551), 3.4, Z(-191)], [X(-561), 3.4, Z(-191)], [X(-561), 3.9, Z(-201)], [X(-551), 3.9, Z(-201)]);
      for (let x = -545; x <= -531; x += 4.5) for (let z = -214; z <= -198; z += 5) c.push([B(x - 0.2, x + 0.2, 0, 3.2, z - 0.2, z + 0.2), '#b9b4aa']);
      c.push([B(-546, -530, 0, 0.3, -215, -197), '#a9a49a']);
      for (let i = 0; i < 6; i++) c.push([B(-558 + i * 0.5, -557.6 + i * 0.5, 0, 0.8, -207, -205.5), '#b8b2a6']);
      // the gravel apron from the road to the gate, a pick-up at it
      k.plain.push([new THREE.ShapeGeometry(new THREE.Shape([[-557, -180], [-547, -173.5], [-545, -168.5], [-559, -175.5]].map(([x, z]) => new THREE.Vector2(X(x), -Z(z))))).rotateX(-Math.PI / 2).translate(0, 0.035, 0), '#a39e95']);
      // the project board on two posts and the CAUTION board under it, by the road
      const bx = -543.6, bz = -172.2;
      for (const dx of [-1.1, 1.1]) c.push([B(bx + dx - 0.05, bx + dx + 0.05, 0, 3.4, bz - 0.05, bz + 0.05), '#8f9396']);
      k.plain.push([B(bx - 1.25, bx + 1.25, 1.6, 3.3, bz + 0.05, bz + 0.09), '#f2f2ee'], [B(bx - 0.9, bx + 0.9, 2.55, 3.15, bz + 0.09, bz + 0.1), '#7d8a94']);
      k.signs.push({ text: 'ADMINISTRATION AND LEADERSHIP BLOCK', x: X(bx), y: 2.3, z: Z(bz + 0.11), ry: Math.PI, w: 2.2, colors: ['#f2f2ee', '#1d2a3a'] });
      k.signs.push({ text: 'LEGON LEADERSHIP ACADEMY', x: X(bx), y: 1.9, z: Z(bz + 0.11), ry: Math.PI, w: 2.0, colors: ['#f2f2ee', '#1d2a3a'] });
      c.push([B(bx + 0.4, bx + 0.48, 0, 1.4, bz + 0.4, bz + 0.48), '#3a3a3a']);
      k.plain.push([B(bx - 0.2, bx + 0.9, 0.7, 1.35, bz + 0.48, bz + 0.5), '#f2c81e']);
      k.signs.push({ text: 'CAUTION  AREA UNDER CONSTRUCTION', x: X(bx + 0.35), y: 1.02, z: Z(bz + 0.51), ry: Math.PI, w: 1.0, colors: ['#f2c81e', '#141414'] });
      SOLIDS.add(bx, bz, 1.3);
      // red-and-white posts along the road edge, a lamp post
      for (const [x, z] of [[-566, -185.3], [-561, -182], [-538, -169.5], [-533, -167.5], [-529, -165.8]]) {
        for (let y = 0; y < 1.2; y += 0.3) c.push([B(x - 0.06, x + 0.06, y, y + 0.15, z - 0.06, z + 0.06), '#f2f2ee'], [B(x - 0.06, x + 0.06, y + 0.15, y + 0.3, z - 0.06, z + 0.06), '#c0262a']);
        SOLIDS.add(x, z, 0.12);
      }
      c.push([new THREE.CylinderGeometry(0.08, 0.12, 8.5, 8).translate(X(-536), 4.25, Z(-170.5)), '#3f4448'], [B(-536.1, -534.6, 8.3, 8.45, -170.6, -170.4), '#3f4448']);
      // the dirt track between the hoarding and the Research and Innovation Complex's fence (page 14)
      k.plain.push([B(-592, -585, 0.02, 0.04, -240, -186), '#a87a58']);
      SOLIDS.add(-536, -170.5, 0.2);
      finish(k, c);
    },
  };
})();

// ---------- the Research and Innovation Complex ----------
const RIC_O: [number, number] = [-642, -228];
/** the blocks: centre, axis along the long side, length, width (the mapped outlines) */
const RIC_BLOCKS: { c: [number, number]; u: [number, number]; L: number; W: number; storey: number }[] = [
  { c: [-635.2, -241.3], u: [0.934, 0.358], L: 28.8, W: 15.2, storey: 3.6 },
  { c: [-618.05, -221.05], u: [0.371, -0.929], L: 37.3, W: 13.0, storey: 3.4 },
  { c: [-663.4, -234.7], u: [0.38, -0.925], L: 45.3, W: 13.1, storey: 3.4 },
];
/** the palisade's line round the site (the gate gap where the road enters, between the last point and the first) */
const RIC_FENCE: [number, number][] = [[-629, -190], [-598, -190], [-598, -266], [-688, -266], [-688, -190], [-638, -190]];
const ricBlock = (i: number): Spec => {
  const b = RIC_BLOCKS[i];
  return {
    name: i === 0 ? 'Research and Innovation Office Complex' : `Research and Innovation Complex block ${i + 1}`,
    axis: b.u, origin: b.c, storey: b.storey, style: RIC_WALL, roofColor: MAROON, fascia: '#f2f2ee', pitch: 0.45, plinth: '#d9d6cf',
    replaces: [b.c],
    blocks: [{ x0: -b.L / 2, x1: b.L / 2, z0: -b.W / 2, z1: b.W / 2, floors: 2 }],
    keep: [],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      const e = k.wallTop(2);
      if (i === 1) {
        // the stone-clad feature wall on the north end: rough stone framed in white, a deep window recess in it
        const x = -b.L / 2;
        st.push([box(x - 0.35, x - 0.05, 0.3, e - 0.6, -4.5, 4.5), '#ffffff']);
        c.push([box(x - 0.5, x - 0.05, 0.2, e - 0.2, -5.0, -4.5), '#f6f6f3'], [box(x - 0.5, x - 0.05, 0.2, e - 0.2, 4.5, 5.0), '#f6f6f3'], [box(x - 0.5, x - 0.05, e - 0.6, e - 0.2, -5.0, 5.0), '#f6f6f3']);
        c.push([box(x - 0.6, x - 0.35, 1.2, e - 1.6, -2.2, 2.2), '#f6f6f3']);
        k.plain.push([box(x - 0.36, x - 0.3, 1.4, e - 1.8, -2.0, 2.0), '#1c2228']);
        for (let z = -1.5; z <= 1.5; z += 1.0) k.plain.push([box(x - 0.38, x - 0.36, 1.4, e - 1.8, z - 0.03, z + 0.03), '#0e0f10']);
      }
      if (i === 0) {
        // the entrance on the court side: a canopy over glazed doors
        k.plain.push([box(-1.4, 1.4, 0.3, 2.9, b.W / 2, b.W / 2 + 0.03), '#1c2228']);
        c.push([box(-2.2, 2.2, 3.0, 3.25, b.W / 2, b.W / 2 + 2.0), '#f6f6f3']);
      }
      finish(k, c, st);
    },
  };
};
const ricGrounds: Spec = (() => {
  const { X, Z, B } = frame(RIC_O);
  return {
    name: 'Research and Innovation Complex grounds', axis: [1, 0], origin: RIC_O, storey: 3, style: RIC_WALL, roofColor: MAROON, fascia: '#f2f2ee', pitch: 0.3,
    blocks: [],
    keep: [[X(-690), X(-596), Z(-268), Z(-186)]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      // the black steel palisade on its low white wall all round, the gate gap where the road comes in
      for (let i = 0; i < RIC_FENCE.length - 1; i++) {
        const [ax, az] = RIC_FENCE[i], [bx, bz] = RIC_FENCE[i + 1], len = Math.hypot(bx - ax, bz - az), a = Math.atan2(bz - az, bx - ax);
        c.push([new THREE.BoxGeometry(len + 0.3, 0.6, 0.3).rotateY(-a).translate(X((ax + bx) / 2), 0.3, Z((az + bz) / 2)), '#f1f0eb']);
        c.push([new THREE.BoxGeometry(len + 0.3, 0.12, 0.38).rotateY(-a).translate(X((ax + bx) / 2), 0.03, Z((az + bz) / 2)), '#b27a52']);
        panel(RIC_O, k, rails(), ax, az, bx, bz, 0.6, 2.4, 0.16, 1.8);
        for (let t = 0; t <= len; t += 2.6) c.push([B(ax + ((bx - ax) * t) / len - 0.06, ax + ((bx - ax) * t) / len + 0.06, 0.6, 2.5, az + ((bz - az) * t) / len - 0.06, az + ((bz - az) * t) / len + 0.06), '#1c1d1f']);
        const n = Math.ceil(len / 0.4);
        for (let j = 0; j <= n; j++) SOLIDS.add(ax + ((bx - ax) * j) / n, az + ((bz - az) * j) / n, 0.25);
      }
      // the gate: white piers either side of the road, the security post on the east of it - flat roof with a deep white
      // fascia over dark glazing, a white planter wall with palms and shrubs before it
      for (const x of [-638.4, -628.6]) { c.push([B(x - 0.45, x + 0.45, 0, 2.6, -190.45, -189.55), '#f4f4f1']); SOLIDS.add(x, -190, 0.5); }
      const [s0, s1, t0, t1] = [-624, -615, -199, -192.5];
      c.push([B(s0, s1, 0, 0.3, t0, t1), '#d9d6cf'], [B(s0 + 0.2, s1 - 0.2, 0.3, 3.0, t0 + 0.2, t1 - 0.2), '#2a3036']);
      k.glass.push(B(s0 + 0.15, s1 - 0.15, 0.6, 2.8, t1 - 0.2, t1 - 0.15), B(s0 + 0.15, s0 + 0.2, 0.6, 2.8, t0 + 0.2, t1 - 0.2));
      c.push([B(s0 - 0.8, s1 + 0.8, 3.0, 3.7, t0 - 0.8, t1 + 0.8), '#f6f6f3'], [B(s0 - 0.3, s1 + 0.3, 3.7, 4.4, t0 + 0.5, t1 - 1.0), '#f6f6f3']);
      c.push([B(s0 - 0.6, s1, 0, 0.9, t1 + 0.9, t1 + 1.3), '#f6f6f3'], [B(s0 - 0.6, s0 - 0.2, 0, 0.9, t1 - 2, t1 + 1.3), '#f6f6f3'], [B(s0 - 0.6, s1, 0, 0.12, t1 + 0.9, t1 + 1.32), '#1c1d1f']);
      for (let j = 0; j < 4; j++) SOLIDS.add(s0 + 1 + j * 2.4, (t0 + t1) / 2, 1.6);
      const g = garden([-700, -590, -275, -180]); g.reseed(233);
      for (const [x, z] of [[-623, -189.5], [-619.5, -189.6], [-616, -189.5]]) g.palm(k, X(x), Z(z), 2.2);
      for (const [x, z] of [[-621.3, -189.8], [-617.8, -189.8]]) k.plain.push([new THREE.ConeGeometry(0.45, 1.5, 8).translate(X(x), 0.75, Z(z)), '#2f5428']);
      // the brick-paved approach in from the gate to the court
      k.plain.push([new THREE.ShapeGeometry(new THREE.Shape([[-639, -190], [-628, -190], [-641, -228], [-650, -226]].map(([x, z]) => new THREE.Vector2(X(x), -Z(z))))).rotateX(-Math.PI / 2).translate(0, 0.04, 0), '#9a8c7c']);
      // lawns, orange-flowering shrubs along the fence, slender lamp posts, trees outside
      for (let x = -682; x < -600; x += 9) for (const z of [-262, -194.5]) if (z === -262 || x < -642 || x > -612) k.plain.push([new THREE.IcosahedronGeometry(0.8, 1).scale(1.2, 0.8, 1).translate(X(x), 0.6, Z(z)), (x / 9) % 2 ? '#3f6a2c' : '#4b7a32']);
      for (let x = -679; x < -602; x += 13) k.plain.push([new THREE.IcosahedronGeometry(0.22, 0).translate(X(x + 1), 1.1, Z(-261.6)), '#e8833a']);
      for (const [x, z] of [[-645, -212], [-630, -214], [-660, -205], [-612, -205]]) { c.push([new THREE.CylinderGeometry(0.05, 0.07, 4.2, 6).translate(X(x), 2.1, Z(z)), '#d9dcdf'], [B(x - 0.5, x + 0.5, 4.1, 4.2, z - 0.06, z + 0.06), '#d9dcdf']); SOLIDS.add(x, z, 0.12); }
      for (const [x, z, s] of [[-690, -180, 2.6], [-600, -178, 2.4], [-700, -235, 2.2], [-592, -250, 2.0]] as [number, number, number][]) g.tree(k, X(x), Z(z), s);
      finish(k, c);
    },
  };
})();

// ---------- the telecommunication mast compound between WACCBIP and the School of Pharmacy (pages 24-25) ----------
// across Volta Hall Road from the lane between them: a white steel palisade round a gravel yard, equipment cabinets,
// a slim mast with its antenna panels; a purple notice board on posts and a street lamp by the road, trees about
const MAST_O: [number, number] = [-193, -283];
const mast: Spec = (() => {
  const { X, Z, B } = frame(MAST_O);
  const [x0, x1, z0, z1] = [-200, -186, -287.5, -278.5];
  return {
    name: 'telecommunication mast compound', axis: [1, 0], origin: MAST_O, storey: 3, style: RIC_WALL, roofColor: MAROON, fascia: '#f2f2ee', pitch: 0.3,
    blocks: [],
    keep: [[X(x0 - 1), X(x1 + 1), Z(z0 - 1), Z(z1 + 3)]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      k.plain.push([B(x0, x1, 0.02, 0.05, z0, z1), '#a7a399']);
      // the palisade: white pales with pointed heads on two rails, posts at intervals
      const sides: [number, number, number, number][] = [[x0, z0, x1, z0], [x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0]];
      for (const [ax, az, bx, bz] of sides) {
        const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len;
        for (let t = 0.1; t < len; t += 0.16) {
          const x = ax + ux * t, z = az + uz * t;
          c.push([B(x - 0.03, x + 0.03, 0, 2.3, z - 0.03, z + 0.03), '#eceeef'], [new THREE.ConeGeometry(0.05, 0.14, 4).translate(X(x), 2.37, Z(z)), '#eceeef']);
        }
        for (const y of [0.4, 2.0]) c.push([new THREE.BoxGeometry(len, 0.06, 0.05).rotateY(-Math.atan2(bz - az, bx - ax)).translate(X((ax + bx) / 2), y, Z((az + bz) / 2)), '#dcdfe0']);
        for (let t = 0; t <= len; t += 2.4) c.push([B(ax + ux * t - 0.06, ax + ux * t + 0.06, 0, 2.5, az + uz * t - 0.06, az + uz * t + 0.06), '#d9dcdd']);
        const n = Math.ceil(len / 0.4);
        for (let j = 0; j <= n; j++) SOLIDS.add(ax + ((bx - ax) * j) / n, az + ((bz - az) * j) / n, 0.22);
      }
      // the cabinets on their plinth, cable trays
      c.push([B(-198.5, -190, 0, 0.3, -285.5, -282), '#b9b5ac']);
      for (const [x, w, h, col] of [[-197.2, 1.6, 2.0, '#e9eaea'], [-194.8, 1.2, 1.7, '#d4d6d6'], [-192.6, 1.6, 2.0, '#e9eaea']] as [number, number, number, string][]) c.push([B(x - w / 2, x + w / 2, 0.3, 0.3 + h, -285, -283.2), col]);
      c.push([B(-198.5, -190, 2.4, 2.5, -284.4, -284.0), '#8e9294']);
      // the mast: a slim tapering pole, a ring of antenna panels near its top, a dish and a lamp
      const mx = -188.5, mz = -281;
      c.push([new THREE.CylinderGeometry(0.22, 0.42, 26, 10).translate(X(mx), 13, Z(mz)), '#c3c6c8']);
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; c.push([new THREE.BoxGeometry(0.3, 1.6, 0.12).rotateY(-a).translate(X(mx + Math.cos(a) * 0.55), 24.4, Z(mz + Math.sin(a) * 0.55)), '#e9eaea']); }
      c.push([new THREE.CylinderGeometry(0.9, 0.9, 0.08, 12).translate(X(mx), 23.3, Z(mz)), '#9a9ea0']);
      c.push([new THREE.CylinderGeometry(0.4, 0.4, 0.15, 14).rotateZ(Math.PI / 2).translate(X(mx - 0.5), 21.0, Z(mz)), '#e9eaea']);
      SOLIDS.add(mx, mz, 0.5);
      // the purple notice board on two posts by the road, the street lamp
      for (const dz of [-0.8, 0.8]) c.push([B(-202.2, -202.1, 0, 2.2, -283 + dz - 0.05, -283 + dz + 0.05), '#3a3a3a']);
      k.plain.push([B(-202.3, -202.22, 1.0, 2.1, -284, -282), '#5b2d8a']);
      k.signs.push({ text: 'UNIVERSITY OF GHANA', x: X(-202.31), y: 1.7, z: Z(-283), ry: -Math.PI / 2, w: 1.8, colors: ['#5b2d8a', '#ffffff'] });
      SOLIDS.add(-202.2, -283, 0.9);
      c.push([new THREE.CylinderGeometry(0.07, 0.11, 9, 8).translate(X(-183.5), 4.5, Z(-277.5)), '#c3c6c8'], [B(-183.6, -182.0, 8.85, 9.0, -277.6, -277.4), '#c3c6c8']);
      SOLIDS.add(-183.5, -277.5, 0.2);
      const g = garden([-215, -175, -300, -265]); g.reseed(241);
      g.tree(k, X(-205), Z(-291), 2.4); g.tree(k, X(-181), Z(-290), 1.8);
      finish(k, c);
    },
  };
})();
/** the mast compound across Volta Hall Road from WACCBIP and the School of Pharmacy */
export const mastSite = createSite('mast-compound', [mast]);

/** the School of Graduate Studies, the Doctorate building, the construction site and the Research and Innovation Complex */
export const gradSite = createSite('graduate-cluster', [gradSchool, doctorate, site, ricBlock(0), ricBlock(1), ricBlock(2), ricGrounds]);
