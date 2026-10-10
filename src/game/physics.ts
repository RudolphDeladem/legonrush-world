// The Department of Physics and the chemistry buildings north of it, from the owner's photos and marked aerial
// (registered at 0.23 m/px; block engine: blocks.ts; the physics hill and its stair: relief.ts).
//
// Physics (photos 1 and 2): one-floor ranges round a court, up the hill from Danquah Avenue: the ground they stand on
// rises 1.5 m behind a low wall of rubble stone along the pavement and a grass bank, their walls on a stone plinth.
// White gone a little grey, a deep red-brown band round their foot with the paint flaking off its top edge, brown
// wooden louvred shutters, small square vents high under the eaves, orange tile gable roofs with dark bargeboards, a
// small window in each white gable; verandahs on posts along the court; the department's board at the corner.
// North of it (red line) a one-floor building as tall as two floors, like a factory: small oblong windows high up,
// ordinary wooden windows and doors below; a one-floor range beside it.
//
// Chemistry (owner's aerial): the one-floor ranges (black lines) look like the physics ones: the extension's U round
// the Frank Torto Building, the ranges across the middle; a covered walk on posts (green line) from the extension
// south to the chemistry block. The Frank Torto Building (purple; photos 3 and 4): five floors, white, the ground floor
// open on columns, a band of glazing on the first floor with the department's name over the ground floor, galleries on
// the floors above behind solid parapets, brown-framed windows; a stack of open landings at its west end; the tower on
// its east with stepped sills and brown-framed windows; its car park before it, trees the owner circled.
import * as THREE from 'three';
import { box, merge, speckle, tri2, type Part } from './modelkit';
import { BAND, PL, createSite, render, type Block, type Kit, type Spec, type Style } from './blocks';
import { concrete, panel, pierced, stoneMesh } from './concrete';
import { PASSAGES, SOLIDS } from './solids';
import { hipRoof } from './waccbip';
import { stairsOf } from './relief';
import { garden } from './gardens';
import { car } from './cc';

const TILE = '#b8583a', BARGE = '#3a2a22', WHITE_OLD = '#f0eee8', DADO = '#8a3a25';
const RISE = 1.5;
const hip = { gw: 0, tri: false }, open = { gw: 99, tri: false };

/** brown wooden louvred shutters, two leaves */
const shutter = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = 'rgba(90,80,70,0.25)'; g.fillRect(x - 5, y - 5, w + 10, h + 10);
  g.fillStyle = '#3b2418'; g.fillRect(x - 3, y - 3, w + 6, h + 6);
  for (let t = y; t < y + h; t += 8) { g.fillStyle = '#5c3a26'; g.fillRect(x, t, w, 5); g.fillStyle = '#2e1c12'; g.fillRect(x, t + 5, w, 3); }
  g.fillStyle = '#3b2418'; g.fillRect(x + w / 2 - 2, y, 4, h);
};
/** faded white, grime, the red-brown band at the foot flaking at its top edge */
const oldWall = (g: CanvasRenderingContext2D, dadoTop: number) => {
  render(g, WHITE_OLD);
  speckle(g, 0, 0, 256, 512, 700, ['rgba(140,134,120,0.18)', 'rgba(120,114,100,0.12)']);
  for (let i = 0; i < 12; i++) { const x = (i * 43) % 250, gr = g.createLinearGradient(0, 256, 0, 420); gr.addColorStop(0, 'rgba(120,114,100,0.18)'); gr.addColorStop(1, 'rgba(120,114,100,0)'); g.fillStyle = gr; g.fillRect(x, 256, 3 + (i % 3) * 2, 164); }
  g.fillStyle = DADO; g.fillRect(0, dadoTop, 256, 512 - dadoTop);
  speckle(g, 0, dadoTop, 256, 512 - dadoTop, 150, ['#7a3020', '#9a4430']);
  // the paint flaking off the top of the band in ragged patches here and there (photo 2)
  for (let i = 0; i < 4; i++) {
    const cx = 20 + ((i * 71) % 220), w = 10 + ((i * 23) % 22), d = 4 + ((i * 13) % 9);
    g.fillStyle = 'rgba(236,232,222,0.92)';
    g.beginPath(); g.moveTo(cx - w / 2, dadoTop - 1);
    for (let t = 0; t <= 6; t++) g.lineTo(cx - w / 2 + (w * t) / 6, dadoTop + d * (0.4 + (((i + 1) * (t + 3) * 7) % 10) / 16));
    g.lineTo(cx + w / 2, dadoTop - 1); g.closePath(); g.fill();
  }
};
/** the physics ranges: a shutter to a bay, a small vent high up */
const P_WALL: Style = {
  bay: 3.4, up: [], ground: [[96, 256 + 70, 64, 116]],
  draw: (g) => { oldWall(g, 512 - 62); shutter(g, 96, 256 + 70, 64, 116); g.fillStyle = '#2a211b'; g.fillRect(118, 256 + 22, 20, 14); },
};
/** with a door now and then, toward the court */
const P_DOOR: Style = {
  bay: 3.6, up: [], ground: [[30, 256 + 70, 60, 116], [140, 256 + 54, 70, 202]],
  draw: (g) => {
    oldWall(g, 512 - 62); shutter(g, 30, 256 + 70, 60, 116);
    g.fillStyle = '#3b2418'; g.fillRect(136, 256 + 50, 78, 206);
    g.fillStyle = '#6a4630'; g.fillRect(140, 256 + 54, 70, 202);
    g.fillStyle = '#4a2f20'; for (let y = 256 + 70; y < 500; y += 34) g.fillRect(144, y, 62, 3);
    g.fillStyle = '#2a211b'; g.fillRect(60, 256 + 22, 20, 14);
  },
};
/** the Chemistry Department Extension (owner's reference PDF, pages 25-29): cream walls gone grey, a tall window of two
 *  dark-brown louvred shutter leaves to a bay, some standing open on a dark room, the red-brown band at the foot */
const CX_WALL: Style = {
  bay: 3.6, up: [], ground: [[88, 256 + 46, 80, 150]],
  draw: (g) => {
    oldWall(g, 512 - 46);
    g.fillStyle = 'rgba(214,204,178,0.35)'; g.fillRect(0, 256, 256, 210);
    g.fillStyle = '#1d1712'; g.fillRect(84, 256 + 42, 88, 158);
    for (const [x, open] of [[88, false], [128, true]] as [number, boolean][]) {
      if (open) { g.fillStyle = '#2a2420'; g.fillRect(x, 256 + 46, 40, 150); continue; }
      for (let t = 256 + 46; t < 256 + 196; t += 8) { g.fillStyle = '#4e3020'; g.fillRect(x, t, 40, 5); g.fillStyle = '#2b1a10'; g.fillRect(x, t + 5, 40, 3); }
    }
    g.fillStyle = '#4e3020'; g.fillRect(170, 256 + 46, 14, 150);
  },
};
/** the tall one-floor building: a row of small oblong windows high up, shutters and doors below */
const P_TALL: Style = {
  bay: 3.4, up: [], ground: [[60, 256 + 24, 136, 26], [96, 256 + 120, 64, 84]],
  draw: (g) => {
    oldWall(g, 512 - 40);
    g.fillStyle = '#e2ded4'; g.fillRect(52, 256 + 18, 152, 38);
    g.fillStyle = '#1f1c1a'; g.fillRect(60, 256 + 24, 136, 26);
    g.fillStyle = '#5a4030'; for (let x = 60; x < 196; x += 34) g.fillRect(x, 256 + 24, 3, 26);
    shutter(g, 96, 256 + 120, 64, 84);
  },
};

// ---------- the Department of Physics ----------
const PO: [number, number] = [156, 79];
const PS = [106.2, 206.1, 91.0, 104.8], PWW = [106.3, 118.6, 52.9, 91.0], PN = [118.6, 197.8, 53.0, 65.2], ST1 = [157.7, 166.0, 83.2, 91.0], ST2 = [196.6, 206.1, 86.3, 91.0];
const PST = 3.4, PE = PL + PST + BAND;
const physics: Spec = (() => {
  const X = (x: number) => x - PO[0], Z = (z: number) => z - PO[1];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
  const M = (x: number, z: number): [number, number] => [X(x), Z(z)];
  const R = (r: number[], faces: Partial<Record<'x0' | 'x1' | 'z0' | 'z1', Style>> = {}): Block => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors: 1, roof: 'none', faces });
  return {
    name: 'Physics Department, University of Ghana',
    axis: [1, 0], origin: PO, storey: PST, style: P_WALL, roofColor: TILE, fascia: BARGE, pitch: 0.45, plinth: DADO,
    replaces: [[156, 79], [130, 98]],
    blocks: [R(PS, { z0: P_DOOR }), R(PWW, { x1: P_DOOR }), R(PN, { z1: P_DOOR }), R(ST1), R(ST2)],
    keep: [[X(100), X(212), Z(47), Z(113)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      /** a white gable with a small dark window in it, at x (ridge along x) or z (ridge along z) */
      const gable = (alongX: boolean, at: number, a: number, b: number, s: number) => {
        const top = PE + ((b - a) / 2 + 0.7) * 0.45, m = (a + b) / 2;
        if (alongX) {
          c.push([tri2([X(at), PE - 0.05, Z(a - 0.6)], [X(at), PE - 0.05, Z(b + 0.6)], [X(at), top - 0.1, Z(m)]), WHITE_OLD]);
          k.plain.push([B(at + s * 0.03 - 0.02, at + s * 0.03 + 0.02, PE + 0.5, PE + 1.3, m - 0.4, m + 0.4), '#2a211b']);
        } else {
          c.push([tri2([X(a - 0.6), PE - 0.05, Z(at)], [X(b + 0.6), PE - 0.05, Z(at)], [X(m), top - 0.1, Z(at)]), WHITE_OLD]);
          k.plain.push([B(m - 0.4, m + 0.4, PE + 0.5, PE + 1.3, at + s * 0.03 - 0.02, at + s * 0.03 + 0.02), '#2a211b']);
        }
      };
      // the roofs: gables, the court sides carried out over the verandahs
      hipRoof(k, M, PS[0] - 0.7, PS[1] + 0.7, PS[2] - 2.4, PS[3] + 0.7, PE, 0.42, 'x', [open, open], c, BARGE);
      gable(true, PS[0] - 0.6, PS[2] - 2.4, PS[3] + 0.7, -1); gable(true, PS[1] + 0.6, PS[2] - 2.4, PS[3] + 0.7, 1);
      hipRoof(k, M, PWW[0] - 0.7, PWW[1] + 2.4, PWW[2] - 0.7, PS[2], PE, 0.42, 'z', [open, open], c, BARGE);
      gable(false, PWW[2] - 0.6, PWW[0] - 0.7, PWW[1] + 2.4, -1);
      hipRoof(k, M, PWW[1], PN[1] + 0.7, PN[2] - 0.7, PN[3] + 2.4, PE, 0.42, 'x', [open, open], c, BARGE);
      gable(true, PN[1] + 0.6, PN[2] - 0.7, PN[3] + 2.4, 1);
      for (const r of [ST1, ST2]) hipRoof(k, M, r[0] - 0.7, r[1] + 0.7, r[2] - 0.7, PS[2], PE - 0.2, 0.42, 'z', [hip, open], c, BARGE);
      // verandah posts along the court, white with red-brown feet
      const posts = (x0: number, x1: number, z0: number, z1: number) => {
        const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 3.4));
        for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n, z = z0 + ((z1 - z0) * i) / n; c.push([B(x - 0.15, x + 0.15, 0, PE - 0.25, z - 0.15, z + 0.15), WHITE_OLD], [B(x - 0.17, x + 0.17, 0, 0.7, z - 0.17, z + 0.17), DADO]); }
      };
      posts(PWW[1] + 1.8, ST1[0] - 0.5, PS[2] - 1.8, PS[2] - 1.8); posts(ST1[1] + 0.5, ST2[0] - 0.5, PS[2] - 1.8, PS[2] - 1.8);
      posts(PWW[1] + 1.8, PN[1], PN[3] + 1.8, PN[3] + 1.8); posts(PWW[1] + 1.8, PWW[1] + 1.8, PN[3] + 1.8, PS[2] - 1.8);
      k.plain.push([B(PWW[1], PS[1] - 8, 0, 0.06, PS[2] - 2.2, PS[2]), '#b9b2a4'], [B(PWW[1], PN[1], 0, 0.06, PN[3], PN[3] + 2.2), '#b9b2a4'], [B(PWW[1], PWW[1] + 2.2, 0, 0.06, PN[3], PS[2]), '#b9b2a4']);
      // the stone plinth under every wall, down to the ground where the hill falls away
      for (const r of [PS, PWW, PN, ST1, ST2]) st.push([B(r[0] - 0.12, r[1] + 0.12, -RISE - 0.2, 0.35, r[2] - 0.12, r[3] + 0.12), '#ffffff']);
      // the low wall of rubble stone along the pavement at the foot of the grass bank, the turn up Cruise O'Brien Road
      const gy = (x: number, z: number) => k.ground(X(x), Z(z)) - RISE;
      for (let x = 100.5; x < 206; x += 3) st.push([B(x, Math.min(206, x + 3), gy(x + 1.5, 112.4) - 0.1, gy(x + 1.5, 112.4) + 0.45, 112.1, 112.6), '#ffffff']);
      for (let z = 50; z < 112.6; z += 3) st.push([B(100.6, 101.1, gy(100.8, z + 1.5) - 0.1, gy(100.8, z + 1.5) + 0.45, z, Math.min(112.6, z + 3)), '#ffffff']);
      // the stair up from the road's end to the door on the east (relief.ts)
      const s = stairsOf().find((q) => !q.alongZ && q.x0 === 207.6)!;
      for (let x = s.x1; x < s.x0 - 1e-3; x += 0.3) {
        const y = s.at(Math.min(s.x0 - 0.01, x + 0.15)) - RISE;
        c.push([B(x, Math.min(s.x0, x + 0.31), -RISE, y, s.z0, s.z1), '#cfcac0']);
      }
      for (const z of [s.z0 - 0.2, s.z1]) st.push([B(s.x1 - 0.3, s.x0, -RISE, 0.5, z, z + 0.2), '#ffffff']);
      // the department's board at the corner (photo 2), a wooden electricity pole
      const bx = 112.5, bz = 109.5, by = gy(bx, bz);
      for (const x of [bx - 1.1, bx + 1.1]) k.plain.push([B(x - 0.05, x + 0.05, by, by + 3.0, bz - 0.05, bz + 0.05), '#d9dcdf']);
      k.plain.push([B(bx - 1.25, bx + 1.25, by + 1.6, by + 3.2, bz + 0.05, bz + 0.12), '#f6f6f3']);
      k.signs.push({ text: 'UNIVERSITY OF GHANA', x: X(bx), y: by + 2.9, z: Z(bz) + 0.13, ry: 0, w: 2.2, colors: ['#f6f6f3', '#1d3f7a'] });
      k.signs.push({ text: 'SCHOOL OF PHYSICAL AND MATHEMATICAL SCIENCES', x: X(bx), y: by + 2.35, z: Z(bz) + 0.13, ry: 0, w: 2.2, colors: ['#f6f6f3', '#2a2a2a'] });
      k.signs.push({ text: 'DEPT. OF PHYSICS', x: X(bx), y: by + 1.9, z: Z(bz) + 0.13, ry: 0, w: 2.0, colors: ['#f6f6f3', '#1d3f7a'] });
      k.plain.push([new THREE.CylinderGeometry(0.12, 0.15, 9, 8).translate(X(104), gy(104, 110) + 4.5, Z(110)), '#8e8e78']);
      // the car park at the open east end of the court, facing Earth Science across the lane (owner's second reference
      // PDF, pages 16-20): a long flat roof of grey sheet on thin steel posts over bare red earth, a strip light under it,
      // the cars parked beneath; the court's lawn and the verandahs show through it
      const CP = [199.6, 205.4, 67.0, 85.6], cpH = 2.7;
      for (let x = 197.5; x < 207.5; x += 2) for (let z = 65.5; z < 88; z += 2) {
        const y = gy(x + 1, z + 1);
        k.plain.push([B(x, x + 2, y + 0.01, y + 0.04, z, Math.min(88, z + 2)), (((x + z) * 7) % 3) < 1 ? '#9a4a2c' : '#a5543a']);
      }
      const n = 4;
      for (let i = 0; i <= n; i++) for (const x of [CP[0] + 0.3, CP[1] - 0.3]) {
        const z = CP[2] + 0.3 + ((CP[3] - CP[2] - 0.6) * i) / n, y = gy(x, z);
        k.plain.push([B(x - 0.05, x + 0.05, y - 0.1, gy(205, 76) + cpH + (x < 202 ? 0.15 : 0), z - 0.05, z + 0.05), '#5c6266']);
      }
      { const y = gy(205, 76) + cpH, sheet = new THREE.BufferGeometry();
        // the sheet falls a little toward the lane; a channel along each edge
        sheet.setAttribute('position', new THREE.Float32BufferAttribute([X(CP[0] - 0.4), y + 0.25, Z(CP[2] - 0.3), X(CP[1] + 0.4), y - 0.02, Z(CP[2] - 0.3), X(CP[1] + 0.4), y - 0.02, Z(CP[3] + 0.3), X(CP[0] - 0.4), y + 0.25, Z(CP[3] + 0.3)], 3));
        sheet.setIndex([0, 2, 1, 0, 3, 2, 0, 1, 2, 0, 2, 3]); sheet.computeVertexNormals();
        k.plain.push([sheet, '#6f777b']);
        for (const [x, yy] of [[CP[0] - 0.4, y + 0.25], [CP[1] + 0.4, y - 0.02]]) k.plain.push([B(x - 0.06, x + 0.06, yy - 0.2, yy, CP[2] - 0.3, CP[3] + 0.3), '#4c5256']);
        k.plain.push([B(202.4, 202.6, y - 0.12, y + 0.05, 74, 76.4), '#f4f8ff']);
        // nose in under the roof, as the photos show (a silver one, a red one at the end)
        for (const [z, col, r] of [[71.6, '#c9ccd0', 0.04], [81.0, '#a11d1d', -0.05]] as const) {
          car(k, X(202.3), Z(z), col, gy(202.3, z) + 0.03, Math.PI / 2 + r);
          for (const x of [201.2, 203.4]) SOLIDS.add(x, z, 1.0);
        }
      }
      // air-conditioners in a few of the shutters along the road
      for (const x of [150, 162, 172, 182]) k.plain.push([B(x - 0.4, x + 0.4, 1.4, 1.95, PS[3], PS[3] + 0.3), '#e9ebeb']);
      stoneMesh(k, st);
      const m = new THREE.Mesh(merge(c), concrete(0.5));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

// ---------- the one-floor buildings north of physics and round the chemistry buildings ----------
interface Range { name: string; rects: number[][]; tall?: boolean; ridge: ('x' | 'z')[]; replaces: [number, number][]; style?: Style; roof?: string; hipped?: boolean }
const RANGES: Range[] = [
  // north of physics: the tall one-floor building (red line) and the range beside it
  // (its west end toward the Balme Library, owner's reference PDF pages 37-38: a hipped roof of dark tiles, a group of
  // five tall narrow windows, a low flat-roofed link south to the next building, also hipped)
  { name: 'tall one-floor building north of physics', rects: [[112.5, 156.2, 6.4, 27.8]], tall: true, ridge: ['x'], replaces: [[134.3, 17.1]], roof: '#4f3428', hipped: true },
  { name: 'building between the tall building and physics', rects: [[113.5, 123.3, 32.2, 46.3]], ridge: ['z'], replaces: [[118.4, 39.2]], roof: '#4f3428', hipped: true },
  { name: 'range north of physics', rects: [[161.0, 196.4, 18.0, 25.5]], ridge: ['x'], replaces: [[178.7, 21.7]] },
  // the chemistry extension's U round the Frank Torto Building
  { name: 'Chemistry Department Extension', rects: [[108.2, 207.0, -149.7, -137.4], [108.0, 116.7, -137.4, -98.2], [116.7, 156.8, -109.4, -100.0]], ridge: ['x', 'z', 'x'], replaces: [[141.1, -118.9], [112, -120]], style: CX_WALL, roof: '#7a3a28' },
  // the ranges across the middle
  { name: 'chemistry range west', rects: [[106.0, 151.1, -74.6, -57.4]], ridge: ['x'], replaces: [[128.5, -66.0]] },
  // (moved 2 m west and its east end 3 m shorter, clear of the lane round the Frank Torto Building: owner)
  { name: 'chemistry range east', rects: [[159.3, 203.6, -75.9, -62.2], [159.3, 166.5, -80.8, -75.9], [194.1, 203.6, -80.8, -75.9]], ridge: ['x', 'z', 'z'], replaces: [[184.3, -69]] },
];
function range(r: Range): Spec {
  const xs = r.rects.flatMap((q) => [q[0], q[1]]), zs = r.rects.flatMap((q) => [q[2], q[3]]);
  const O: [number, number] = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2];
  const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
  const M = (x: number, z: number): [number, number] => [X(x), Z(z)];
  const st = r.tall ? 6.4 : 3.4, E = PL + st + BAND;
  return {
    name: r.name,
    axis: [1, 0], origin: O, storey: st, style: r.style ?? (r.tall ? P_TALL : P_WALL), roofColor: r.roof ?? TILE, fascia: BARGE, pitch: 0.42, plinth: DADO,
    replaces: r.replaces,
    blocks: r.rects.map((q, i) => ({ x0: X(q[0]), x1: X(q[1]), z0: Z(q[2]), z1: Z(q[3]), floors: 1, roof: 'none', faces: i === 0 && !r.tall && !r.style && !r.hipped ? { z1: P_DOOR } : r.tall && r.hipped ? { x0: C_BLANK } : {} })),
    keep: [],
    extras: (k: Kit) => {
      const c: Part[] = [];
      r.rects.forEach((q, i) => {
        const along = r.ridge[i];
        if (r.roof) k.roof.c = new THREE.Color(r.roof);
        const top = hipRoof(k, M, q[0] - 0.7, q[1] + 0.7, q[2] - 0.7, q[3] + 0.7, E, 0.42, along, i || r.hipped ? [hip, hip] : [open, open], c, BARGE);
        if (i === 0 && !r.hipped) for (const s of [-1, 1]) {
          if (along === 'x') { const x = s < 0 ? q[0] - 0.6 : q[1] + 0.6; c.push([tri2([X(x), E - 0.05, Z(q[2] - 0.7)], [X(x), E - 0.05, Z(q[3] + 0.7)], [X(x), top - 0.1, Z((q[2] + q[3]) / 2)]), WHITE_OLD]); }
          else { const z = s < 0 ? q[2] - 0.6 : q[3] + 0.6; c.push([tri2([X(q[0] - 0.7), E - 0.05, Z(z)], [X(q[1] + 0.7), E - 0.05, Z(z)], [X((q[0] + q[1]) / 2), top - 0.1, Z(z)]), WHITE_OLD]); }
        }
      });
      if (r.tall) for (const z of [6.4, 27.8]) for (let x = 117; x < 154; x += 9.3) k.plain.push([box(X(x) - 0.75, X(x) + 0.75, PL, PL + 2.5, Z(z) - 0.03, Z(z) + 0.03), '#5a3a26']);
      if (r.tall) {
        // the west end: five tall narrow windows in dark-green frames with glass louvres, side by side
        const wx = X(112.5);
        for (let i = 0; i < 5; i++) {
          const z = Z(13.2 + i * 1.15);
          k.plain.push([box(wx - 0.05, wx, PL + 0.6, PL + 4.6, z - 0.5, z + 0.5), '#24382c']);
          for (let y = PL + 0.75; y < PL + 4.5; y += 0.16) k.plain.push([box(wx - 0.08, wx - 0.05, y, y + 0.08, z - 0.42, z + 0.42), '#5d7a6a']);
        }
        k.plain.push([box(wx - 0.12, wx, PL + 0.45, PL + 0.6, Z(12.4), Z(18.6 + 0.4)), '#e9e6dd']);
        // the low flat-roofed link south to the next building
        k.plain.push([box(X(114.5), X(119), 0, 3.0, Z(27.8), Z(32.2)), WHITE_OLD], [box(X(114.4), X(119.1), 0, 0.6, Z(27.8), Z(32.2)), DADO], [box(X(114.2), X(119.3), 3.0, 3.25, Z(27.6), Z(32.4)), '#e4e0d6']);
        k.plain.push([box(X(114.45), X(114.5), 0.4, 2.4, Z(28.6), Z(31.4)), '#2b2622']);
        SOLIDS.add(116.7, 30, 2.2);
      }
      const m = new THREE.Mesh(merge(c), concrete(0.5));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
}

// ---------- the department's west entrance on Cruise O'Brien Road (owner's photo and yellow mark) ----------
// One floor, white with the red-brown band, an orange tile hip roof; the front recessed between two square white
// pillars with red-brown feet, the black wooden lattice double door in the middle of it under the department's name
// and the university's crest; dark shutters either side. It stands on a stone-faced base: steps up to the porch from
// a paved forecourt, stone-faced beds of flowering shrubs and agaves either side of them, and a short flight down
// from the forecourt to the road opposite the turning; palms and trees round it.
const CW = [112.4, 121.7, -92.0, -79.0];
const CR = 114.6, CZ = [-87.6, -83.4];
const CY = 0.6;
/** the line of the screen walls (owner's blue line on the aerial) */
const WX = 114.0;
const C_BLANK: Style = { bay: 3.4, up: [], ground: [], draw: (g) => oldWall(g, 512 - 62) };
const chemWest: Spec = (() => {
  const O: [number, number] = [117.0, -85.5];
  const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
  const M = (x: number, z: number): [number, number] => [X(x), Z(z)];
  const R = (r: number[], faces: Partial<Record<'x0' | 'x1' | 'z0' | 'z1', Style>> = {}): Block => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors: 1, roof: 'none', faces, y: CY });
  const E = CY + PL + 3.4 + BAND, F = CY + PL, zm = (CZ[0] + CZ[1]) / 2;
  return {
    name: 'Department of Chemistry west entrance',
    axis: [1, 0], origin: O, storey: 3.4, style: P_WALL, roofColor: TILE, fascia: BARGE, pitch: 0.42, plinth: DADO,
    replaces: [[117.0, -85.5]],
    // the body behind the porch, and the two ends either side of it
    blocks: [
      R([CR, CW[1], CW[2], CW[3]], { x0: C_BLANK }),
      R([CW[0], CR, CW[2], CZ[0]], { z1: C_BLANK }),
      R([CW[0], CR, CZ[1], CW[3]], { z0: C_BLANK }),
    ],
    keep: [[X(101), X(CW[0]), Z(-92), Z(-79)]],
    extras: (k: Kit) => {
      const c: Part[] = [], st: Part[] = [];
      hipRoof(k, M, CW[0] - 0.7, CW[1] + 0.7, CW[2] - 0.7, CW[3] + 0.7, E, 0.42, 'z', [hip, hip], c, BARGE);
      // the stone-faced base under the walls and the porch floor
      st.push([B(CW[0] - 0.15, CW[1] + 0.15, -0.2, CY, CW[2] - 0.15, CW[3] + 0.15), '#ffffff']);
      c.push([B(CW[0] - 0.15, CR, F - 0.04, F, CZ[0], CZ[1]), '#c9c4b8']);
      // the porch's ceiling, the two pillars at its mouth, the lintel across with the department's name and the crest
      c.push([B(CW[0], CR, E - 0.62, E - 0.55, CZ[0], CZ[1]), '#ebe8e0']);
      for (const z of [CZ[0] + 0.45, CZ[1] - 0.45]) c.push([B(CW[0] - 0.05, CW[0] + 0.45, F, E - 0.55, z - 0.25, z + 0.25), WHITE_OLD], [B(CW[0] - 0.08, CW[0] + 0.48, F, F + 0.6, z - 0.28, z + 0.28), DADO]);
      c.push([B(CW[0] - 0.08, CW[0] + 0.5, E - 0.95, E - 0.05, CZ[0], CZ[1]), WHITE_OLD]);
      k.plain.push([B(CW[0] - 0.1, CW[0] - 0.08, E - 0.88, E - 0.18, zm - 1.75, zm + 1.75), '#f6f6f3']);
      k.signs.push({ text: 'DEPARTMENT OF CHEMISTRY', x: X(CW[0]) - 0.11, y: E - 0.62, z: Z(zm) + 0.25, ry: -Math.PI / 2, w: 2.7, colors: ['#f6f6f3', '#1d3f7a'] });
      // the crest: a blue shield with a gold rim
      k.plain.push([B(CW[0] - 0.12, CW[0] - 0.1, E - 0.82, E - 0.24, zm - 1.62, zm - 1.12), '#e0b84a'], [B(CW[0] - 0.14, CW[0] - 0.12, E - 0.77, E - 0.29, zm - 1.57, zm - 1.17), '#1d3f8f']);
      k.plain.push([B(CW[0] - 0.15, CW[0] - 0.14, E - 0.62, E - 0.44, zm - 1.43, zm - 1.31), '#e0b84a']);
      // the black wooden lattice double door
      const dz0 = zm - 0.95, dz1 = zm + 0.95, dt = F + 2.55;
      k.plain.push([B(CR - 0.06, CR, F, dt + 0.12, dz0 - 0.12, dz1 + 0.12), '#2a1d14'], [B(CR - 0.08, CR - 0.02, F, dt, dz0, dz1), '#121110']);
      for (let z = dz0 + 0.19; z < dz1 - 0.1; z += 0.19) k.plain.push([B(CR - 0.12, CR - 0.06, F + 0.1, dt - 0.1, z - 0.025, z + 0.025), '#24201c']);
      for (let y = F + 0.25; y < dt - 0.1; y += 0.24) k.plain.push([B(CR - 0.12, CR - 0.06, y - 0.025, y + 0.025, dz0 + 0.05, dz1 - 0.05), '#24201c']);
      k.plain.push([B(CR - 0.14, CR - 0.06, F, dt, zm - 0.04, zm + 0.04), '#0d0c0b']);
      // a lamp in the porch ceiling
      k.plain.push([B(CW[0] + 0.8, CW[0] + 1.3, E - 0.68, E - 0.62, zm - 0.25, zm + 0.25), '#f6efd6']);
      // the forecourt: paved, its edges faced in stone, a little above the road
      const FX = [103.6, CW[0] - 0.15], FZ = [-91.0, -80.0], FY = 0.3;
      k.plain.push([B(FX[0], FX[1], FY - 0.05, FY, FZ[0], FZ[1]), '#cbc5b8']);
      for (let x = FX[0] + 1.2; x < FX[1]; x += 1.2) k.plain.push([B(x - 0.02, x + 0.02, FY, FY + 0.005, FZ[0], FZ[1]), '#b3ad9f']);
      st.push([B(FX[0], FX[1], -0.2, FY - 0.05, FZ[0], FZ[1]), '#ffffff']);
      // the steps up to the porch
      const n = 4, rise = (F - FY) / n;
      for (let i = 0; i < n; i++) c.push([B(CW[0] - 0.15 - 0.32 * (n - i), CW[0] - 0.15, FY, FY + rise * (i + 1), zm - 1.3, zm + 1.3), '#d2cdc2']);
      // the short flight down to the road opposite the turning, between stone cheeks
      for (let i = 0; i < 2; i++) c.push([B(FX[0] - 0.34 * (2 - i), FX[0], -0.1, (FY * (i + 1)) / 3, zm - 1.6, zm + 1.6), '#d2cdc2']);
      k.plain.push([B(100.3, FX[0] - 0.6, 0, 0.05, zm - 1.6, zm + 1.6), '#bdb7aa']);
      for (const z of [zm - 1.8, zm + 1.6]) st.push([B(FX[0] - 0.75, FX[0] + 0.3, -0.1, FY + 0.35, z, z + 0.2), '#ffffff']);
      // the stone-faced beds either side of the porch steps: flowering shrubs and agaves
      const g = garden([95, 125, -100, -70]);
      g.reseed(62);
      for (const [z0, z1] of [[FZ[0] + 0.3, zm - 1.5], [zm + 1.5, FZ[1] - 0.3]]) {
        const x0 = CW[0] - 3.4, x1 = CW[0] - 0.4;
        st.push([B(x0, x1, FY, FY + 0.55, z0, z1), '#ffffff']);
        k.plain.push([B(x0 + 0.15, x1 - 0.15, FY + 0.55, FY + 0.6, z0 + 0.15, z1 - 0.15), '#4a3a2a']);
        for (let z = z0 + 0.7; z < z1 - 0.4; z += 1.25) {
          const x = x0 + 0.8 + ((z * 7) % 1.4 + 1.4) % 1.4, flower = ((z * 13) | 0) % 3 === 0;
          k.plain.push([new THREE.IcosahedronGeometry(0.42, 0).scale(1.2, 0.75, 1).translate(X(x), FY + 0.82, Z(z)), ['#3f6f2c', '#4f7f34'][((z * 5) | 0) & 1]]);
          if (flower) for (let i = 0; i < 4; i++) k.plain.push([new THREE.IcosahedronGeometry(0.14, 0).translate(X(x) + 0.28 * Math.cos(i * 1.6), FY + 1.0 + 0.06 * (i & 1), Z(z) + 0.24 * Math.sin(i * 1.6)), i & 1 ? '#d6487e' : '#e8a33a']);
        }
        // an agave at each end: stiff grey-green blades
        for (const z of [z0 + 0.6, z1 - 0.6]) for (let i = 0; i < 7; i++) {
          const b = new THREE.ConeGeometry(0.09, 0.95, 3).translate(0, 0.47, 0).rotateZ(0.55).rotateY((i / 7) * Math.PI * 2);
          k.plain.push([b.translate(X(x1 - 0.55), FY + 0.6, Z(z)), '#6f8f74']);
        }
      }
      // palms by the road, shade trees round the building
      for (const z of [-93.5, -77.5]) g.palm(k, X(104.5), Z(z), 7.5);
      for (const [x, z] of [[108.5, -96.5], [109.0, -75.0], [124.5, -95.5]]) g.tree(k, X(x), Z(z), 1.3);
      // the screen walls joining it to the extension's west range on the north and the range on the south (owner's
      // blue line): one white wall pierced all over by small square holes, a coping on top, piers at the ends
      for (const [z0, z1] of [[-98.2, CW[2]], [CW[3], -74.6]]) {
        for (const x of [WX - 0.1, WX + 0.1]) panel(O, k, pierced(), x, z0, x, z1, CY - 0.1, CY + 2.9, 0.4);
        c.push([B(WX - 0.16, WX + 0.16, CY + 2.9, CY + 3.08, z0, z1), WHITE_OLD], [B(WX - 0.12, WX + 0.12, -0.1, CY + 0.15, z0, z1), WHITE_OLD]);
        for (const z of [z0 + 0.15, z1 - 0.15]) c.push([B(WX - 0.18, WX + 0.18, -0.1, CY + 2.95, z - 0.15, z + 0.15), WHITE_OLD]);
        for (let z = z0; z <= z1; z += 0.35) SOLIDS.add(WX, z, 0.25);
      }
      // air-conditioners in two of the shutters on the south end
      k.plain.push([B(116.6, 117.4, F + 1.0, F + 1.55, CW[2] - 0.3, CW[2]), '#e9ebeb']);
      stoneMesh(k, st);
      const m = new THREE.Mesh(merge(c), concrete(0.45));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

// ---------- the covered walk from the extension to the chemistry block (green line) ----------
const walk: Spec = (() => {
  const O: [number, number] = [156.5, -76];
  const z0 = -100.0, z1 = -48.0, x0 = 155.2, x1 = 157.8, h = 2.7;
  return {
    name: 'chemistry covered walk',
    axis: [1, 0], origin: O, storey: 3, style: P_WALL, roofColor: '#8a3a2c', fascia: BARGE, pitch: 0.3,
    blocks: [],
    keep: [[x0 - O[0] - 0.5, x1 - O[0] + 0.5, z0 - O[1], z1 - O[1]]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      for (let z = z0 + 0.3; z <= z1 - 0.2; z += 3.2) for (const x of [x0, x1]) c.push([box(x - O[0] - 0.12, x - O[0] + 0.12, 0, h, z - O[1] - 0.12, z - O[1] + 0.12), WHITE_OLD], [box(x - O[0] - 0.14, x - O[0] + 0.14, 0, 0.5, z - O[1] - 0.14, z - O[1] + 0.14), DADO]);
      const xm = (x0 + x1) / 2 - O[0];
      k.roof.quad([x0 - O[0] - 0.5, h, z1 - O[1]], [x0 - O[0] - 0.5, h, z0 - O[1]], [xm, h + 0.55, z0 - O[1]], [xm, h + 0.55, z1 - O[1]]);
      k.roof.quad([x1 - O[0] + 0.5, h, z0 - O[1]], [x1 - O[0] + 0.5, h, z1 - O[1]], [xm, h + 0.55, z1 - O[1]], [xm, h + 0.55, z0 - O[1]]);
      for (const x of [x0 - 0.5, x1 + 0.5]) c.push([box(x - O[0] - 0.05, x - O[0] + 0.05, h - 0.2, h + 0.02, z0 - O[1], z1 - O[1]), BARGE]);
      k.plain.push([box(x0 - O[0], x1 - O[0], 0, 0.06, z0 - O[1], z1 - O[1]), '#bdb7aa']);
      const m = new THREE.Mesh(merge(c), concrete(0.4));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

// ---------- the Frank Torto Building (purple line; photos 3 and 4) ----------
const TO: [number, number] = [168, -117];
const TB = [133.2, 185.6, -133.7, -115.5], TW = [185.5, 203.4, -135.2, -98.2];
const TST = 3.4;
/** the open passage through the ground floor, from the car park to the extension behind (owner) */
const TPX = [147.2, 151.0];
// the free-ridden bike rides through it (the columns either side still stop it)
PASSAGES.push([TPX[0] + 0.3, TPX[1] - 0.3, -134.4, -114.6]);
const glassBand = (g: CanvasRenderingContext2D, y: number, h: number, frame: string) => {
  g.fillStyle = frame; g.fillRect(0, y - 4, 256, h + 8);
  const gl = g.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, '#6a7c8a'); gl.addColorStop(1, '#1d242b');
  g.fillStyle = gl; g.fillRect(0, y, 256, h);
  g.fillStyle = frame; for (let x = 0; x < 256; x += 64) g.fillRect(x, y, 5, h);
};
/** the galleries' back walls: brown-framed windows and doors behind the parapets */
const T_GAL: Style = {
  bay: 3.6, up: [[10, 30, 236, 120]], ground: [[0, 256, 256, 256]],
  draw: (g) => {
    render(g, '#f4f4f1');
    glassBand(g, 30, 120, '#6b4a30');
    g.fillStyle = '#e9e8e3'; g.fillRect(0, 160, 256, 96);
    g.fillStyle = '#f4f4f1'; g.fillRect(0, 256, 256, 256);
    glassBand(g, 256 + 30, 160, '#2a2c2e');
  },
};
/** the first floor: a continuous band of glazing in dark frames */
const T_GLASS: Style = {
  bay: 3.6, up: [[0, 20, 256, 170]], ground: [],
  draw: (g) => { render(g, '#f4f4f1'); glassBand(g, 20, 170, '#2a2c2e'); },
};
/** the ends: blank white in panels, a small window or two */
const T_END: Style = {
  bay: 4.0, up: [], ground: [],
  draw: (g) => { render(g, '#f4f4f1'); speckle(g, 0, 0, 256, 512, 300, ['rgba(130,126,116,0.12)']); g.fillStyle = 'rgba(150,150,146,0.5)'; g.fillRect(0, 0, 256, 2); g.fillRect(0, 256, 256, 2); g.fillRect(0, 0, 2, 512); },
};
/** the tower: brown-framed windows set in white */
const T_TOWER: Style = {
  bay: 3.2, up: [[90, 60, 76, 110]], ground: [[90, 256 + 60, 76, 110]],
  draw: (g) => {
    render(g, '#f4f4f1');
    for (const y of [60, 256 + 60]) { g.fillStyle = '#7a4a2c'; g.fillRect(84, y - 6, 88, 122); const gl = g.createLinearGradient(0, y, 0, y + 110); gl.addColorStop(0, '#5e7080'); gl.addColorStop(1, '#1d242b'); g.fillStyle = gl; g.fillRect(90, y, 76, 110); }
  },
};
const torto: Spec = ((): Spec => {
  const X = (x: number) => x - TO[0], Z = (z: number) => z - TO[1];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
  const M = (x: number, z: number): [number, number] => [X(x), Z(z)];
  const UP = PL + TST, TOP = UP + 4 * TST + BAND, TT = PL + 5 * TST + BAND;
  return {
    name: 'Frank Torto Chemistry Building',
    axis: [1, 0], origin: TO, storey: TST, style: T_GAL, roofColor: '#c98a74', fascia: '#e9e8e3', pitch: 0.25, plinth: '#e9e8e3',
    replaces: [[168.8, -120.5]],
    blocks: <Block[]>[
      // the ground floor set back behind its columns, the four floors over it
      // (split round the open passage through it to the extension behind: owner)
      { x0: X(TB[0] + 2.2), x1: X(TPX[0]), z0: Z(TB[2] + 2.4), z1: Z(TB[3] - 2.4), floors: 1, roof: 'none', faces: { x0: T_END, x1: T_END } },
      { x0: X(TPX[1]), x1: X(TB[1]), z0: Z(TB[2] + 2.4), z1: Z(TB[3] - 2.4), floors: 1, roof: 'none', faces: { x0: T_END } },
      { x0: X(TB[0]), x1: X(TB[1]), z0: Z(TB[2]), z1: Z(TB[3]), floors: 4, roof: 'flat', y: UP - PL, faces: { x0: T_END }, floorStyle: { 0: T_GLASS } },
      { x0: X(TW[0]), x1: X(TW[1]), z0: Z(TW[2]), z1: Z(TW[3]), floors: 5, roof: 'none', faces: { x0: T_TOWER, x1: T_TOWER, z0: T_TOWER, z1: T_END } },
    ],
    keep: [[X(130), X(206), Z(-137), Z(-95)]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      // the columns under the floors above
      for (let x = TB[0] + 0.5; x < TB[1] - 0.5; x += 4.4) for (const z of [TB[2] + 0.4, TB[3] - 0.4]) c.push([B(x - 0.25, x + 0.25, 0, UP, z - 0.25, z + 0.25), '#f4f4f1']);
      c.push([B(TB[0], TB[1], UP - 0.4, UP, TB[2], TB[3]), '#ecebe6']);
      for (let x = TB[0] + 3; x < TB[1] - 2; x += 4.4) for (const z of [TB[2] + 1.2, TB[3] - 1.2]) k.plain.push([B(x - 0.4, x + 0.4, UP - 0.43, UP - 0.4, z - 0.15, z + 0.15), '#fff3d0']);
      // the open passage: no door, no gate; paved through to the extension behind, lamps in its ceiling
      k.plain.push([B(TPX[0], TPX[1], 0.02, 0.07, TB[2] - 3.6, TB[3] + 1.5), '#bdb7aa']);
      for (const z of [-128, -121]) k.plain.push([B(TPX[0] + 1.2, TPX[1] - 1.2, UP - 0.46, UP - 0.4, z - 0.3, z + 0.3), '#fff3d0']);
      // the department's name on the band over the ground floor, south and west
      k.signs.push({ text: 'UG DEPARTMENT OF CHEMISTRY - FRANK TORTO BUILDING', x: X(152), y: UP + 0.15, z: Z(TB[3]) + 0.05, ry: 0, w: 6.0, colors: ['#f4f4f1', '#1d3f7a'] });
      k.signs.push({ text: 'UG DEPARTMENT OF CHEMISTRY - FRANK TORTO BUILDING', x: X(TB[0]) - 0.05, y: UP + TST * 1.4, z: Z(-124.6), ry: -Math.PI / 2, w: 5.0, colors: ['#f4f4f1', '#1d3f7a'] });
      // the galleries on floors 2 to 4: slabs standing out past the face, solid parapets
      for (let f = 1; f < 4; f++) {
        const y = UP + f * TST;
        for (const [z0, z1, zp0, zp1] of [[TB[3], TB[3] + 1.3, TB[3] + 1.1, TB[3] + 1.3], [TB[2] - 1.3, TB[2], TB[2] - 1.3, TB[2] - 1.1]]) {
          c.push([B(TB[0], TB[1], y - 0.25, y, z0, z1), '#f4f4f1'], [B(TB[0], TB[1], y, y + 1.0, zp0, zp1), '#f4f4f1']);
        }
      }
      // the stack of open landings at the west end (photo 3): white frames round dark voids
      for (let f = 1; f < 5; f++) {
        const y = PL + f * TST;
        k.plain.push([B(TB[0] - 0.06, TB[0], y + 0.4, y + TST - 0.3, TB[3] - 3.2, TB[3] - 0.4), '#3a3a38']);
        c.push([B(TB[0] - 1.0, TB[0], y - 0.1, y + 0.25, TB[3] - 3.4, TB[3] - 0.2), '#f4f4f1']);
      }
      // rooftop: parapet, plant boxes at the west end, a low hip of pale tiles over the east part
      for (const [a, b, z0, z1] of [[TB[0], TB[1], TB[2], TB[2] + 0.2], [TB[0], TB[1], TB[3] - 0.2, TB[3]], [TB[0], TB[0] + 0.2, TB[2], TB[3]]]) c.push([B(a, b, TOP, TOP + 0.8, z0, z1), '#f4f4f1']);
      for (const x of [137, 142.5, 148]) c.push([B(x - 2, x + 2, TOP, TOP + 2.0, -131, -127), '#d9d7d0']);
      hipRoof(k, M, 155, TB[1] + 0.4, TB[2] - 0.4, TB[3] + 0.4, TOP + 0.2, 0.22, 'x', [hip, hip], c, '#e9e8e3');
      // the tower: stepped sills before its west windows, its roof
      for (let f = 0; f < 5; f++) {
        const y = PL + f * TST + 0.9;
        for (let z = TW[2] + 1.6; z < TW[3] - 1; z += 3.2) c.push([new THREE.BoxGeometry(0.9, 0.12, 2.8).rotateZ(-0.35).translate(X(TW[0]) - 0.35, y, Z(z)), '#f4f4f1']);
      }
      hipRoof(k, M, TW[0] - 0.6, TW[1] + 0.6, TW[2] - 0.6, TW[3] + 0.6, TT, 0.25, 'z', [hip, hip], c, '#e9e8e3');
      // its south end to the lane (owner's street photo): a stack of open landings in white frames at its west part,
      // the open ground floor under them, the department's board on the wall; hoods over the east windows
      for (let f = 0; f < 5; f++) {
        const y = PL + f * TST;
        k.plain.push([B(TW[0] + 1.2, TW[0] + 4.4, y + (f ? 0.9 : 0), y + TST - 0.35, TW[3] - 0.02, TW[3] + 0.01), f ? '#3c3c3a' : '#2c2c2a']);
        c.push([B(TW[0] + 1.0, TW[0] + 4.6, y + 0.75, y + 0.9, TW[3], TW[3] + 0.35), '#f4f4f1']);
        for (const x of [TW[0] + 1.0, TW[0] + 4.45]) c.push([B(x, x + 0.15, y, y + TST, TW[3], TW[3] + 0.35), '#f4f4f1']);
      }
      k.plain.push([B(TW[0] + 7.2, TW[0] + 13.2, PL + 2 * TST + 1.0, PL + 2 * TST + 2.0, TW[3], TW[3] + 0.05), '#f4f6f8']);
      k.plain.push([B(TW[0] + 7.4, TW[0] + 8.1, PL + 2 * TST + 1.2, PL + 2 * TST + 1.8, TW[3] + 0.05, TW[3] + 0.07), '#1d3f8f']);
      k.signs.push({ text: 'DEPARTMENT OF CHEMISTRY', x: X(TW[0] + 10.8), y: PL + 2 * TST + 1.65, z: Z(TW[3]) + 0.07, ry: 0, w: 4.4, colors: ['#f4f6f8', '#1d3f7a'] });
      k.signs.push({ text: 'FRANK TORTO BUILDING', x: X(TW[0] + 10.8), y: PL + 2 * TST + 1.25, z: Z(TW[3]) + 0.07, ry: 0, w: 3.6, colors: ['#f4f6f8', '#1d3f7a'] });
      for (let f = 1; f < 5; f++) for (let z = TW[2] + 1.6; z < TW[3] - 1; z += 3.2) c.push([B(TW[1], TW[1] + 0.5, PL + f * TST - 0.12, PL + f * TST, z - 1.2, z + 1.2), '#f4f4f1']);
      const m = new THREE.Mesh(merge(c), concrete(0.2));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

// ---------- the one-floor building on the lane behind the Frank Torto Building (owner's photo, violet) ----------
// White, under a flat roof whose slab stands out past the walls in a deep fascia, black iron grille doors in deep
// openings along its front to the lane, air-conditioners on the wall, a raised step along its foot.
// (pushed back 5.6 m east, off the lane and its pavement: owner)
const BT = [216.1, 222.5, -94.3, -84.5];
const BT_WALL: Style = {
  bay: 3.3, up: [], ground: [[100, 256 + 70, 56, 70]],
  draw: (g) => {
    render(g, '#f1f0ea'); speckle(g, 0, 0, 256, 512, 500, ['rgba(130,126,116,0.16)', 'rgba(110,106,96,0.1)']);
    for (let i = 0; i < 8; i++) { const x = (i * 37) % 250, gr = g.createLinearGradient(0, 256, 0, 400); gr.addColorStop(0, 'rgba(110,106,96,0.18)'); gr.addColorStop(1, 'rgba(110,106,96,0)'); g.fillStyle = gr; g.fillRect(x, 256, 3, 144); }
    g.fillStyle = '#2a2724'; g.fillRect(96, 256 + 66, 64, 78); g.fillStyle = '#4d4a46'; for (let x = 104; x < 160; x += 10) g.fillRect(x, 256 + 66, 2, 78);
    g.fillStyle = '#b9b5ab'; g.fillRect(0, 512 - 26, 256, 26);
  },
};
const behindTorto: Spec = (() => {
  const O: [number, number] = [219.3, -89.4];
  const X = (x: number) => x - O[0], Z = (z: number) => z - O[1];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
  const E = PL + 3.2 + BAND;
  return {
    name: 'building behind the Frank Torto Building',
    axis: [1, 0], origin: O, storey: 3.2, style: BT_WALL, roofColor: '#9a968c', fascia: '#f1f0ea', pitch: 0.1, plinth: '#b9b5ab',
    replaces: [[219.3, -89.4]],
    blocks: [{ x0: X(BT[0]), x1: X(BT[1]), z0: Z(BT[2]), z1: Z(BT[3]), floors: 1, roof: 'none', faces: { x0: T_END } }],
    keep: [],
    extras: (k: Kit) => {
      const c: Part[] = [];
      // the flat roof: its slab out past the walls, a deep fascia round it
      c.push([B(BT[0] - 0.9, BT[1] + 0.5, E - 0.1, E + 0.1, BT[2] - 0.5, BT[3] + 0.5), '#e6e4dd']);
      for (const [a, b, z0, z1] of [[BT[0] - 0.9, BT[1] + 0.5, BT[2] - 0.5, BT[2] - 0.35], [BT[0] - 0.9, BT[1] + 0.5, BT[3] + 0.35, BT[3] + 0.5], [BT[0] - 0.9, BT[0] - 0.75, BT[2] - 0.5, BT[3] + 0.5], [BT[1] + 0.35, BT[1] + 0.5, BT[2] - 0.5, BT[3] + 0.5]] as number[][]) c.push([B(a, b, E - 0.35, E + 0.45, z0, z1), '#f1f0ea']);
      // the front to the lane: black grille doors in deep white openings, a step along the foot, air-conditioners
      const fx = BT[0];
      c.push([B(fx - 0.6, fx, 0, PL, BT[2] - 0.2, BT[3] + 0.2), '#d6d2c8']);
      for (const zc of [-92.2, -88.6, -85.6]) {
        const w = zc === -85.6 ? 0.9 : 1.3;
        k.plain.push([B(fx - 0.02, fx, PL, PL + 2.5, zc - w, zc + w), '#16130f']);
        for (let z = zc - w + 0.1; z < zc + w; z += 0.16) k.plain.push([B(fx - 0.06, fx - 0.02, PL, PL + 2.5, z - 0.015, z + 0.015), '#2e2b28']);
        for (let y = PL + 0.3; y < PL + 2.5; y += 0.5) k.plain.push([B(fx - 0.06, fx - 0.02, y - 0.02, y + 0.02, zc - w, zc + w), '#2e2b28']);
        for (const z of [zc - w - 0.18, zc + w]) c.push([B(fx - 0.25, fx, PL, PL + 2.7, z, z + 0.18), '#f4f3ee']);
        c.push([B(fx - 0.25, fx, PL + 2.5, PL + 2.7, zc - w - 0.18, zc + w + 0.18), '#f4f3ee']);
      }
      for (const z of [-90.4, -87.1]) k.plain.push([B(fx - 0.3, fx, PL + 2.0, PL + 2.55, z - 0.4, z + 0.4), '#e9ebeb'], [B(fx - 0.31, fx - 0.3, PL + 2.08, PL + 2.47, z - 0.32, z + 0.32), '#9aa0a3']);
      const m = new THREE.Mesh(merge(c), concrete(0.6));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

/** the Department of Physics, the chemistry buildings, the Frank Torto Building */
export const physicsSite = createSite('physics-chemistry', [physics, ...RANGES.map(range), chemWest, walk, torto, behindTorto]);
