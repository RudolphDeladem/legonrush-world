// Mensah Sarbah Vikings Hostel and the School of Law, modelled from the owner's photos (block engine: blocks.ts).
//
// Vikings Hostel: an L of two five-storey wings with balconies of real depth along their long sides (the correction
// brief, slides 57-65: white walls, solid white parapets, fins between pairs of bays, barred dark ground-floor openings),
// plain
// end walls with square windows and a column of glass-block stair windows, a terracotta base, and a
// hipped red roof. The main entrance is the single-storey VIKINGS HOSTEL block in the inner corner of
// the L, facing the car park; a second door is at the foot of the long wing's south end.
//
// School of Law: a four-storey long block in peach panelled render under a deep eave, a two-storey
// round entrance building at its west end (glass ground floor between white columns, a white band
// with the LAW crest, a ribbon of windows above) reached up wide steps from the courtyard, and a
// two-storey block with a tile roof to its south. The OSM outline was moved onto Google's footprint
// (corrections.json, reshape).
import * as THREE from 'three';
import { PAVE, WHITE, box } from './modelkit';
import { PL, createSite, render, slab, window_, type Kit, type Spec, type Style } from './blocks';
import { Bag } from './enkit';
import { pave, pavers } from './upsa';
import { car } from './banking';
import { broadleaf } from './nsiaroad';
import { gates, grilleLeaf } from './gates';
import { groundHeight } from './relief';

// ---------- Vikings Hostel ----------
const TERRACOTTA = '#b5573a';
/** long sides: white walls behind the balconies (built in 3D in the extras: the correction brief, slides 58-65), a dark door
 *  and a dark window to a bay; on the ground floor tall dark openings behind black bars */
const VIK_BAL: Style = {
  bay: 3.4,
  up: [[60, 40, 64, 150], [150, 50, 70, 80]],
  ground: [[40, 50, 80, 150], [150, 50, 70, 150]],
  draw: (g) => {
    render(g);
    window_(g, [60, 40, 64, 150], '#3a3d42', 1, 0);
    window_(g, [150, 50, 70, 80], '#3a3f45', 2, 0);
    window_(g, [40, 256 + 50, 80, 150], '#2b2e33', 2, 0);
    window_(g, [150, 256 + 50, 70, 150], '#2b2e33', 2, 0);
    g.fillStyle = '#121416';
    for (const [x0, w] of [[40, 80], [150, 70]]) for (let x = x0 + 6; x < x0 + w; x += 9) g.fillRect(x, 256 + 50, 2, 150);
    g.fillStyle = TERRACOTTA; g.fillRect(0, 470, 256, 42);
  },
};
/** end walls: white render with one square dark window per bay */
const VIK_END: Style = {
  bay: 2.8,
  up: [[82, 70, 92, 92]],
  ground: [[82, 60, 92, 92]],
  draw: (g) => {
    render(g);
    window_(g, [82, 70, 92, 92], '#3a3f45', 2, 0);
    window_(g, [82, 256 + 60, 92, 92], '#3a3f45', 2, 0);
    g.fillStyle = TERRACOTTA; g.fillRect(0, 470, 256, 42);
  },
};

const VIKINGS_ORIGIN: [number, number] = [160, 817];
const vikings: Spec = {
  name: 'Mensah Sarbah Vikings Hostel',
  axis: [1, 0], origin: VIKINGS_ORIGIN, storey: 3.0, style: VIK_BAL, roofColor: '#b0453c', fascia: '#4a3a35', pitch: 0.3,
  blocks: [
    { x0: -21.9, x1: -4, z0: -26, z1: 26.1, floors: 5, faces: { z0: VIK_END, z1: VIK_END } },
    { x0: -4, x1: 28.7, z0: -1.1, z1: 15.5, floors: 5, faces: { x1: VIK_END } },
    { x0: -4, x1: 11.5, z0: 15.5, z1: 23.5, floors: 1, roof: 'flat', faces: { z1: VIK_END, x1: VIK_END } },
  ],
  keep: [[-11, 14, 23.5, 27.5], [-26, 30.5, -30, 26]],
  extras: (k) => {
    // the terracotta base round both wings and the entrance block
    const base = (x0: number, x1: number, z0: number, z1: number) => {
      k.plain.push([box(x0 - 0.06, x1 + 0.06, 0, 1.15, z0 - 0.06, z0 + 0.02), TERRACOTTA], [box(x0 - 0.06, x1 + 0.06, 0, 1.15, z1 - 0.02, z1 + 0.06), TERRACOTTA]);
      k.plain.push([box(x0 - 0.06, x0 + 0.02, 0, 1.15, z0, z1), TERRACOTTA], [box(x1 - 0.02, x1 + 0.06, 0, 1.15, z0, z1), TERRACOTTA]);
    };
    base(-21.9, -4, -26, 26.1); base(-4, 28.7, -1.1, 15.5); base(-4, 11.5, 15.5, 23.5);
    // the stair's glass-block windows up both end walls of the long wing (owner's photo of the south end)
    for (const [z, d] of [[26.1, 1], [-26, -1]] as [number, number][]) for (let f = 0; f < 5; f++) {
      const y = PL + f * 3.0 + 1.6;
      k.plain.push([box(-19.3, -16.9, y, y + 0.7, Math.min(z, z + d * 0.06), Math.max(z, z + d * 0.06)), '#b9c6cc']);
      for (let x = -19.1; x < -17; x += 0.4) k.plain.push([box(x - 0.02, x + 0.02, y, y + 0.7, Math.min(z, z + d * 0.08), Math.max(z, z + d * 0.08)), '#e9eef0']);
    }
    // balconies with real depth on the long faces, floors 1-4 (slides 59, 63, 65): a slab with a pale underside, a solid
    // white parapet, short returns at the ends and fins between pairs of bays; the end walls stay plain
    const bal = (face: 'x0' | 'x1' | 'z0' | 'z1', at: number, a0: number, a1: number) => {
      const out = face === 'x0' || face === 'z0' ? -1 : 1, D = 1.4;
      const seg = (u0: number, u1: number, v0: number, v1: number, y0: number, y1: number, c: string) =>
        k.plain.push([face[0] === 'x' ? box(Math.min(v0, v1), Math.max(v0, v1), y0, y1, u0, u1) : box(u0, u1, y0, y1, Math.min(v0, v1), Math.max(v0, v1)), c]);
      for (let f = 1; f < 5; f++) {
        const y = PL + f * 3.0;
        seg(a0, a1, at, at + out * D, y - 0.18, y + 0.02, '#ecebe6');
        seg(a0, a1, at + out * (D - 0.12), at + out * D, y, y + 1.05, WHITE);
        seg(a0, a1, at + out * D - out * 0.02, at + out * (D + 0.02), y + 1.0, y + 1.08, '#e0ddd5');
        for (const u of [a0, a1]) seg(u - 0.06, u + 0.06, at, at + out * D, y, y + 1.05, WHITE);
        for (let u = a0 + 6.8; u < a1 - 1; u += 6.8) seg(u - 0.07, u + 0.07, at, at + out * D, y, y + 2.85, WHITE);
      }
    };
    bal('x0', -21.9, -25.4, 25.5); bal('x1', -4, -25.4, -1.7);
    bal('z0', -1.1, -3.4, 28.1); bal('z1', 15.5, -3.4, 28.1);
    // the single-storey entrance block (slide 59): a deep flat canopy over the front with VIKINGS HOSTEL on its fascia,
    // its door at the left (owner's photo), the curved planter in a red-brown wall at its corner
    const top = k.wallTop(1);
    k.plain.push([box(-4.4, 12.4, top - 0.05, top + 0.35, 23.5, 26.0), WHITE], [box(-4.4, 12.4, top - 0.12, top - 0.05, 23.5, 26.0), '#d9d5cc']);
    k.plain.push([box(11.3, 11.6, top, top + 0.35, 15.5, 23.6), WHITE]);
    k.signs.push({ text: 'VIKINGS HOSTEL', x: 4.5, y: top + 0.15, z: 26.01, ry: 0, w: 6.4, colors: ['#f7f4ec', '#1f3a7a'] });
    for (let i = 0; i < 12; i++) {
      const a0 = (i / 12) * Math.PI, a1 = ((i + 1) / 12) * Math.PI, r = 1.9;
      const cx = 11.5 + Math.cos((a0 + a1) / 2) * r, cz = 23.5 + Math.sin((a0 + a1) / 2) * r * 0.9;
      k.plain.push([new THREE.BoxGeometry(0.22, 0.6, r * (a1 - a0) + 0.05).rotateY(-(a0 + a1) / 2).translate(cx, 0.3, cz), '#9c3f2a']);
    }
    k.plain.push([new THREE.CylinderGeometry(1.75, 1.75, 0.5, 16, 1, false, 0, Math.PI).rotateY(Math.PI / 2).scale(1, 1, 0.9).translate(11.5, 0.25, 23.5), '#4a6b2f']);
    // the ground: block paving round the hostel and over the forecourt and car park (slides 58, 59, 63: paved up to the
    // walls, not lawn), cars nose-in to the east wing, a kerbed island with a red-leaved plant
    const pv = pavers('legon');
    pave(k, -26, -21.9, -30, 26, pv, 0.03, 2); pave(k, -21.9, 30, -30, -26, pv, 0.03, 2); pave(k, -4, 30, -26, -1.1, pv, 0.03, 2);
    pave(k, -21.9, 12, 26.1, 27.2, pv, 0.03, 2); pave(k, -4, 12, 15.5, 26.1, pv, 0.03, 2); pave(k, 12, 30, 15.5, 24.5, pv, 0.03, 2); pave(k, 28.7, 30.5, -1.1, 15.5, pv, 0.03, 2);
    for (let x = 14; x < 28; x += 2.8) k.plain.push([box(x - 0.04, x + 0.04, 0.04, 0.05, 15.6, 20.6), '#f2f2ee']);
    for (const [x, c] of [[15.4, '#9b1f24'], [18.2, '#e9e9ea'], [23.8, '#2b3b5a']] as [number, string][]) car(k, x, 18.2, 'z', c);
    k.plain.push([box(6.8, 9.6, 0, 0.18, 24.4, 26.6), '#e9e7e0'], [box(7.0, 9.4, 0.18, 0.22, 24.6, 26.4), '#4a6b2f']);
    for (let i = 0; i < 7; i++) k.plain.push([new THREE.BoxGeometry(0.06, 0.9, 0.5).rotateZ((i - 3) * 0.35).rotateY(i).translate(8.2, 0.65, 25.5), '#9e1f3c']);
    // the main entrance (the owner's photo of 2026-10-16, blue mark): a doorway at the block's left with a dark steel
    // grille gate in two leaves standing on the step, the shaded entrance hall behind it; the rest of the block, on the
    // right as one goes in, is the porter's lodge (orange mark), its window on the front
    k.plain.push([box(-1.2, 2.2, 0, 0.2, 23.5, 25), PAVE]);
    k.plain.push([box(-0.7, 1.7, 0.2, 2.75, 23.51, 23.53), '#2a2d31'], [box(-0.7, 1.7, 0.2, 0.22, 23.5, 23.9), '#8e8a82']);
    for (const [a, b] of [[-0.95, -0.7], [1.7, 1.95]]) k.plain.push([box(a, b, 0, 2.95, 23.5, 23.92), WHITE]);
    k.plain.push([box(-0.95, 1.95, 2.75, 2.95, 23.5, 23.92), WHITE]);
    k.glass.push(box(3.0, 5.6, 1.0, 2.4, 23.5, 23.55));
    k.plain.push([box(2.92, 5.68, 0.94, 1.0, 23.5, 23.68), '#d9d5cc'], [box(2.92, 5.68, 2.4, 2.46, 23.5, 23.58), '#3a3d42']);
    for (const x of [2.95, 4.3, 5.65]) k.plain.push([box(x - 0.03, x + 0.03, 1.0, 2.4, 23.5, 23.58), '#3a3d42']);
    // (the gate's leaves on the gate system, in the world: the frame is unrotated at the origin below)
    const [ox, oz] = VIKINGS_ORIGIN, y = groundHeight(ox + 0.5, oz + 23.9) + 0.2;
    for (const [hx, dir, open] of [[-0.7, 1, -1.45], [1.7, -1, 1.45]] as [number, number, number][]) {
      const leaf = grilleLeaf(1.2, 2.5); leaf.position.y = y;
      gates.register({ id: `vikings:main-gate${dir > 0 ? 'L' : 'R'}`, buildingId: 'vikings', hinge: [ox + hx, oz + 23.78], dir: [dir, 0], length: 1.2, open, leaf });
    }
    // the second door, at the foot of the long wing's south end (owner's photo, the small mark on the left)
    k.glass.push(box(-9.4, -7.6, PL, 2.8, 26.1, 26.15));
    k.plain.push([box(-9.5, -7.5, 2.8, 2.95, 26.1, 26.2), '#3a3d42'], [box(-10, -7, 0, 0.2, 26.1, 27.3), PAVE]);
  },
};

// ---------- School of Law ----------
// (the owner's 20-picture corrections, Pictures 4-7: light cream-tan panel cladding with its joint grid; the long block's
// openings differ floor by floor (Picture 5): the ground floor recessed behind piers with dark doors and openings, the
// first floor a row of small square openings, two to a bay, the second floor a squarish gridded window to a bay, the top
// floor a wider, lower gridded window to a bay with the air-conditioning units)
const PEACH = '#e9ceb0';
const panels = (g: CanvasRenderingContext2D, y0: number) => {
  g.fillStyle = 'rgba(150,110,80,0.3)';
  for (let x = 0; x < 256; x += 128) g.fillRect(x, y0, 2, 256);
  for (let y = 0; y < 256; y += 86) g.fillRect(0, y0 + y, 256, 2);
};
/** a gridded window: rows x cols panes in a dark frame */
const grid = (g: CanvasRenderingContext2D, r: [number, number, number, number], rows: number, cols: number) => {
  window_(g, r, '#4b3d32', cols, 0);
  g.fillStyle = '#4b3d32';
  for (let i = 1; i < rows; i++) g.fillRect(r[0], r[1] + (r[3] * i) / rows - 2, r[2], 4);
};
/** the ground floor behind its piers: dark doors and openings in the shade of the recess (the base style) */
const LAW_WIN: Style = {
  bay: 3.4,
  up: [[42, 60, 172, 96]],
  ground: [[34, 256 + 36, 188, 214]],
  draw: (g) => {
    render(g, PEACH);
    g.fillStyle = PEACH; g.fillRect(0, 0, 256, 512);
    panels(g, 0); panels(g, 256);
    grid(g, [42, 60, 172, 96], 2, 3);
    // the recess: shaded wall between the piers, a dark door or opening in it
    g.fillStyle = '#b89c80'; g.fillRect(22, 256 + 22, 212, 234);
    g.fillStyle = '#2a2622'; g.fillRect(70, 256 + 60, 116, 196);
    g.fillStyle = '#4b3d32'; for (const x of [70, 126, 182]) g.fillRect(x, 256 + 60, 4, 196);
  },
};
/** the second floor: a squarish gridded window to a bay */
const LAW_MID: Style = {
  bay: 3.4,
  up: [[74, 48, 108, 112]],
  ground: [[74, 256 + 48, 108, 112]],
  draw: (g) => {
    render(g, PEACH);
    g.fillStyle = PEACH; g.fillRect(0, 0, 256, 512);
    panels(g, 0); panels(g, 256);
    grid(g, [74, 48, 108, 112], 3, 3); grid(g, [74, 256 + 48, 108, 112], 3, 3);
  },
};
/** the first floor (owner photo): a row of small square openings, two to a bay */
const LAW_SQ: Style = {
  bay: 3.4,
  up: [[50, 112, 36, 36], [170, 112, 36, 36]],
  ground: [[50, 256 + 112, 36, 36], [170, 256 + 112, 36, 36]],
  draw: (g) => {
    render(g, PEACH);
    g.fillStyle = PEACH; g.fillRect(0, 0, 256, 512);
    panels(g, 0); panels(g, 256);
    for (const x of [50, 170]) { window_(g, [x, 112, 36, 36], '#4b3d32', 1, 0); window_(g, [x, 256 + 112, 36, 36], '#4b3d32', 1, 0); }
  },
};
/** the south block: cream-tan panels, smaller windows */
const LAW_LOW: Style = {
  bay: 3.2,
  up: [[86, 70, 84, 96]],
  ground: [[86, 70, 84, 110]],
  draw: (g) => {
    render(g, PEACH);
    g.fillStyle = PEACH; g.fillRect(0, 0, 256, 512);
    panels(g, 0); panels(g, 256);
    window_(g, [86, 70, 84, 96], '#4b3d32', 2, 0.3);
    window_(g, [86, 256 + 70, 84, 110], '#4b3d32', 2, 0.3);
  },
};

/** the south block's face toward the court (Pictures 5, 6): the upper floor blank panelling, windows on the ground
 *  floor only */
const LAW_LOW_E: Style = {
  bay: 3.2,
  up: [],
  ground: [[86, 256 + 70, 84, 110]],
  draw: (g) => {
    render(g, PEACH);
    g.fillStyle = PEACH; g.fillRect(0, 0, 256, 512);
    panels(g, 0); panels(g, 256);
    window_(g, [86, 256 + 70, 84, 110], '#4b3d32', 2, 0.3);
  },
};

/** an open cylinder wall (side only) round the rotunda's centre */
const ring = (r: number, y0: number, y1: number, cx: number, cz: number) => new THREE.CylinderGeometry(r, r, y1 - y0, 56, 1, true).translate(cx, (y0 + y1) / 2, cz);

const law: Spec = {
  name: 'School of Law',
  axis: [1, 0.009], origin: [447, -250], storey: 3.5, style: LAW_WIN, roofColor: '#b4553a', fascia: '#3b302a', pitch: 0.25,
  replaces: [[432, -223]],
  blocks: [
    { x0: -20.5, x1: 33.4, z0: -14.8, z1: -0.7, floors: 4, floorStyle: { 1: LAW_SQ, 2: LAW_MID } },
    { x0: -23.8, x1: -5.8, z0: 14.8, z1: 38.8, floors: 2, faces: { x0: LAW_LOW, x1: LAW_LOW_E, z0: LAW_LOW, z1: LAW_LOW }, roofColor: '#b9573b', pitch: 0.45 },
  ],
  keep: [[-36, 34, -1, 17], [-6, 39, -1, 39]],
  extras: (k) => {
    // the round entrance building (owner photos): centre and radius from Google's footprint and the layout photo (Picture 7
    // of the 20-picture corrections agrees). Its face (Pictures 5, 6): tall glazing in light gold-toned frames set back
    // behind square white piers, the doors in the middle; a solid white band with the crest and LAW; a continuous ribbon
    // of dark blue glazing; a deep white band on top. Only the part toward the court shows; the rest is inside the blocks.
    const cx = -19.2, cz = 0.75, r = 13.2, floor = 0.9, g1 = 5.0, b1 = 6.9, g2 = 8.3, top = 10.0;
    const GOLD = '#c9b07a', BAND = '#efede7';
    k.glass.push(ring(r - 0.7, floor, g1, cx, cz));
    for (let a = 0; a < 360; a += 4) {
      const t = (a * Math.PI) / 180, rr = r - 0.66;
      // the gold-toned frame: a mullion every 4 degrees (about 0.9 m), a transom at two-thirds of the height
      k.plain.push([new THREE.BoxGeometry(0.07, g1 - floor, 0.07).translate(cx + Math.cos(t) * rr, (floor + g1) / 2, cz + Math.sin(t) * rr), GOLD]);
    }
    k.plain.push([ring(r - 0.64, floor + (g1 - floor) * 0.66, floor + (g1 - floor) * 0.66 + 0.1, cx, cz), GOLD], [ring(r - 0.64, g1 - 0.12, g1, cx, cz), GOLD]);
    // the soffit of the recess under the band
    k.plain.push([new THREE.RingGeometry(r - 0.7, r + 0.05, 64).rotateX(Math.PI / 2).translate(cx, g1, cz), '#e2ddd2']);
    for (let a = 0; a < 360; a += 15) {
      const t = (a * Math.PI) / 180;
      k.plain.push([new THREE.BoxGeometry(0.75, g1 - floor, 0.75).rotateY(-t).translate(cx + Math.cos(t) * (r - 0.3), (floor + g1) / 2, cz + Math.sin(t) * (r - 0.3)), WHITE]);
    }
    k.plain.push([ring(r + 0.05, g1, b1, cx, cz), BAND]);
    k.plain.push([ring(r - 0.12, b1, g2, cx, cz), '#1d3355']);
    for (let a = 0; a < 360; a += 5) {
      const t = (a * Math.PI) / 180;
      k.plain.push([new THREE.BoxGeometry(0.12, g2 - b1, 0.12).translate(cx + Math.cos(t) * (r - 0.02), (b1 + g2) / 2, cz + Math.sin(t) * (r - 0.02)), '#e8e6e0']);
    }
    k.plain.push([ring(r + 0.25, g2, top, cx, cz), BAND], [ring(r + 0.3, g2 - 0.08, g2, cx, cz), '#d9d6ce']);
    k.plain.push([new THREE.CircleGeometry(r + 0.2, 48).rotateX(-Math.PI / 2).translate(cx, top - 0.3, cz), '#bdb6aa']);
    k.plain.push([new THREE.BoxGeometry(4, 0.6, 4).translate(cx + 2, top - 0.2, cz - 2), '#3b4652']);
    // the doors and the LAW crest face the courtyard
    const dx = 0.893, dz = 0.45, ry = Math.atan2(dx, dz);
    const at = (rr: number, y: number) => [cx + dx * rr, y, cz + dz * rr] as const;
    {
      // the doors between the two piers either side of the axis: dark leaves in the gold frame
      const [x, , z] = at(r - 0.62, 0);
      k.plain.push([new THREE.BoxGeometry(2.6, 2.6, 0.08).rotateY(ry).translate(x, floor + 1.3, z), '#20262e']);
      k.plain.push([new THREE.BoxGeometry(0.08, 2.6, 0.1).rotateY(ry).translate(x, floor + 1.3, z), GOLD]);
      const [sx, , sz] = at(r + 0.12, 0);
      k.signs.push({ text: 'LAW', x: sx, y: 5.6, z: sz, ry, w: 1.3, colors: ['#eceae4', '#7a5a2a'] });
      k.plain.push([new THREE.BoxGeometry(0.55, 0.65, 0.08).rotateY(ry).translate(sx, 6.3, sz), '#1f3a7a'], [new THREE.BoxGeometry(0.4, 0.15, 0.1).rotateY(ry).translate(sx, 6.45, sz), '#c9a227']);
    }
    // the plain white block between the drum and the south block (Picture 6, left of the drum): a flat-topped mass
    // below the drum's top band
    k.plain.push([box(-10.6, -5.8, 0, 7.6, 13.4, 16.4), '#f1efe9'], [box(-10.7, -5.7, 7.6, 7.85, 13.3, 16.5), '#e3e0d8']);
    // the broad shallow steps (Picture 5: five risers up to the landing) along the long block and round the drum
    const stone = '#cfc3ad', N = 5, tread = 0.5;
    k.plain.push([new THREE.CylinderGeometry(r + 1.6, r + 1.6, floor, 64).translate(cx, floor / 2, cz), stone]);
    k.plain.push([box(-8, 33.4, 0, floor, -0.7, 2.6), stone]);
    for (let i = 1; i <= N; i++) {
      const h = floor * (1 - i / (N + 1));
      k.plain.push([new THREE.CylinderGeometry(r + 1.6 + i * tread, r + 1.6 + i * tread, h, 64).translate(cx, h / 2, cz), stone]);
      k.plain.push([box(-8, 33.4, 0, h, 2.6, 2.6 + i * tread), stone]);
    }
    // the paved courtyard, open to the road on the east
    k.plain.push([box(-5.8, 39, 0, 0.04, 3.3, 38.8), PAVE]);
    // the dense tree crowns at the court's east side and south of it (Picture 7), clear of the steps and the approach
    const tb = new Bag([447, -250]);
    for (const [x, z, h, sp] of [[474, -243, 9, 12], [452, -216, 10, 14], [466, -219, 9.5, 13], [461, -207, 9, 12], [474, -212, 8.5, 10]] as [number, number, number, number][]) broadleaf(k, tb.leaf, x, z, { h, spread: sp, seed: x * 2 + z, origin: [447, -250] });
    tb.finish(k);
    // AC units on the long block's front (owner photos)
    for (const [x, f] of [[-2, 1], [6, 1], [14, 2], [22, 1], [29, 2], [3, 3], [18, 3], [26, 3]] as [number, number][]) {
      const y = PL + f * 3.5 + 0.6;
      k.plain.push([box(x - 0.45, x + 0.45, y, y + 0.6, -0.7, -0.4), '#e8e8e6']);
    }
    // the deep eave of the long block (owner photos): a wide soffit under the fascia
    const e4 = k.wallTop(4);
    k.plain.push([box(-21, 34.9, e4 - 0.36, e4 - 0.3, -16.3, 0.8), '#e6dccb']);
  },
};

/** Vikings Hostel and the School of Law */
export const vikingsLaw = createSite('vikings-law', [vikings, law]);
