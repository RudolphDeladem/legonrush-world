// Mensah Sarbah Vikings Hostel and the School of Law, modelled from the owner's photos (block engine: blocks.ts).
//
// Vikings Hostel: an L of two five-storey wings with balcony corridors along their long sides, plain
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
import { broadleaf } from './nsiaroad';

// ---------- Vikings Hostel ----------
const TERRACOTTA = '#b5573a';
/** long sides: a corridor balcony behind a solid white parapet, doors and windows at the back */
const VIK_BAL: Style = {
  bay: 3.4,
  up: [[60, 40, 64, 120], [150, 50, 70, 80]],
  ground: [[40, 50, 80, 130], [150, 60, 70, 100]],
  draw: (g) => {
    render(g);
    g.fillStyle = '#c9ac80'; g.fillRect(0, 0, 256, 226);
    g.fillStyle = 'rgba(50,40,30,0.5)'; g.fillRect(0, 0, 256, 22);
    window_(g, [60, 40, 64, 120], '#4a3d33', 1, 0);
    window_(g, [150, 50, 70, 80], '#3a3f45', 2, 0);
    g.fillStyle = '#f6f4ee'; g.fillRect(0, 140, 256, 86);
    g.fillStyle = '#ffffff'; g.fillRect(0, 136, 256, 8);
    g.fillStyle = 'rgba(70,60,50,0.3)'; g.fillRect(0, 144, 256, 3);
    slab(g, 226, 30);
    window_(g, [40, 256 + 50, 80, 130], '#3a3f45', 2, 0.3);
    window_(g, [150, 256 + 60, 70, 100], '#3a3f45', 2, 0.3);
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

const vikings: Spec = {
  name: 'Mensah Sarbah Vikings Hostel',
  axis: [1, 0], origin: [160, 817], storey: 3.0, style: VIK_BAL, roofColor: '#b0453c', fascia: '#4a3a35', pitch: 0.3,
  blocks: [
    { x0: -21.9, x1: -4, z0: -26, z1: 26.1, floors: 5, faces: { z0: VIK_END, z1: VIK_END } },
    { x0: -4, x1: 28.7, z0: -1.1, z1: 15.5, floors: 5, faces: { x1: VIK_END } },
    { x0: -4, x1: 11.5, z0: 15.5, z1: 23.5, floors: 1, roof: 'flat', faces: { z1: VIK_END, x1: VIK_END } },
  ],
  keep: [[-11, 13, 23.5, 27.5]],
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
    // the single-storey entrance block: a parapet, the VIKINGS HOSTEL sign board, its door at the left (owner's photo)
    const top = k.wallTop(1);
    k.plain.push([box(-4, 11.5, top, top + 0.7, 23.3, 23.6), WHITE], [box(11.3, 11.6, top, top + 0.7, 15.5, 23.6), WHITE]);
    k.plain.push([box(-0.5, 10.5, top - 0.9, top + 0.6, 23.5, 23.7), '#f4f2ec']);
    k.signs.push({ text: 'VIKINGS HOSTEL', x: 5, y: top - 0.1, z: 23.71, ry: 0, w: 5.2, colors: ['#f4f2ec', '#1f3a7a'] });
    k.glass.push(box(-0.7, 1.7, PL, 2.9, 23.5, 23.55));
    k.plain.push([box(-0.8, 1.8, 2.9, 3.05, 23.5, 23.6), '#3a3d42'], [box(-1.2, 2.2, 0, 0.2, 23.5, 25), PAVE]);
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
