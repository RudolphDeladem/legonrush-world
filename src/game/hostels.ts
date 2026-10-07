// Jubilee Hall and the International Students Hostels (ISH 1 and ISH 2), modelled from the
// owner's photos and marked layout, on their OSM footprints (the generic builder skips them).
//
// Each building is a set of rectangular blocks in its own frame (x along the footprint's long
// side, z across it), with its storeys, hipped or flat roof and the facade style of each face,
// plus the entrance and the details the photos show. Blocks were measured from the footprints;
// parts the footprints leave out (Jubilee's entrance block, the hostels' flat-roofed annex)
// from the registered layout.
//
// ISH 1 and ISH 2: one design, four storeys under a terracotta hipped roof. Two long bars joined
// by a spine, a short west wing and a flat-roofed annex between the bars at the east end. The
// north facade is a plain grid of dark windows, the south facade has recessed balconies with
// narrow stair windows between them. ISH 1 is entered by a small gabled porch on its north
// facade, ISH 2 by a flat canopy on its south facade; both face the car parks toward Jubilee Hall.
//
// Jubilee Hall: wings round a long courtyard, three storeys except the east wing along the car
// park, which has two, with gabled balcony bays on its courtyard side; the north wing's
// courtyard face has arched windows over an arcade. The entrance is in the south-east corner:
// a portico from the car park to the doors, a round white tower and a flat-roofed block with
// water tanks.
import * as THREE from 'three';
import { PAVE, TRIM, WHITE, box } from './modelkit';
import { PL, createSite, flatBlock, gableZ, render, slab, tanks, window_, type Block, type Kit, type Spec, type Style } from './blocks';

/** ISH north facade (owner photo): a plain grid of wide dark windows between white piers and slab bands */
const ISH_GRID: Style = {
  bay: 3.5,
  up: [[34, 52, 188, 140]],
  ground: [[34, 52, 188, 150]],
  draw: (g) => {
    render(g);
    window_(g, [34, 52, 188, 140], '#3a3f45', 2, 0.3);
    slab(g, 226, 30);
    window_(g, [34, 256 + 52, 188, 150], '#3a3f45', 2, 0.3);
    g.fillStyle = 'rgba(80,60,40,0.35)'; g.fillRect(0, 500, 256, 12);
  },
};
/** ISH south facade: a recessed balcony (3.6 m) and a strip of wall with a tall narrow window (2 m) */
const ISH_BALCONY: Style = {
  bay: 5.6,
  up: [[44, 40, 92, 150], [196, 40, 26, 170]],
  ground: [[30, 48, 120, 160], [196, 48, 26, 160]],
  draw: (g) => {
    render(g);
    // balcony recess: beige back wall, a door and window, white parapet in front
    g.fillStyle = '#d6c6a0'; g.fillRect(14, 0, 150, 226);
    g.fillStyle = 'rgba(70,55,40,0.35)'; g.fillRect(14, 0, 150, 14);
    window_(g, [44, 40, 92, 150], '#5d4a36', 2, 0.25);
    g.fillStyle = '#f6f3ec'; g.fillRect(14, 150, 150, 76);
    g.fillStyle = '#ffffff'; g.fillRect(10, 146, 158, 8);
    g.fillStyle = 'rgba(70,60,50,0.3)'; g.fillRect(14, 154, 150, 3);
    window_(g, [196, 40, 26, 170], '#3a3f45', 1, 0);
    slab(g, 226, 30);
    // ground storey: wide dark windows over a brown base
    window_(g, [30, 256 + 48, 120, 160], '#5d4a36', 3, 0.3);
    window_(g, [196, 256 + 48, 26, 160], '#3a3f45', 1, 0);
    g.fillStyle = '#7b4a35'; g.fillRect(0, 488, 256, 24);
  },
};
/** Jubilee outer and courtyard faces: dark windows in white render, wide on the ground floor */
const JUB_WIN: Style = {
  bay: 3.3,
  up: [[62, 60, 132, 116]],
  ground: [[54, 64, 148, 128]],
  draw: (g) => {
    render(g);
    window_(g, [62, 60, 132, 116], '#2d3036', 3, 0.3);
    slab(g, 232, 24);
    window_(g, [54, 256 + 64, 148, 128], '#2d3036', 3, 0.3);
  },
};
/** Jubilee north wing, courtyard face (owner photo): round-headed windows over an open arcade */
const JUB_ARCH: Style = {
  bay: 3.3,
  up: [[70, 60, 116, 130]],
  ground: [[40, 50, 176, 206]],
  draw: (g) => {
    render(g);
    const arch = (x: number, y: number, w: number, h: number, col: string) => {
      g.fillStyle = col;
      g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); g.fill();
    };
    arch(64, 54, 128, 142, '#e7e1d5');
    arch(70, 60, 116, 130, '#263039');
    g.fillStyle = '#ffffff'; g.fillRect(56, 196, 144, 7);
    slab(g, 232, 24);
    arch(34, 256 + 44, 188, 212, '#ded7ca');
    arch(40, 256 + 50, 176, 206, '#3a3530');
  },
};

// ISH: one design; the porch differs (ISH 1 north gable porch, ISH 2 south canopy)
const ishBlocks: Block[] = [
  { x0: -30.9, x1: 32.1, z0: -23.8, z1: -12.0, floors: 4 },
  { x0: -31.5, x1: 32.4, z0: 13.4, z1: 25.1, floors: 4, faces: { z1: ISH_BALCONY } },
  { x0: 1.8, x1: 15.8, z0: -17.9, z1: 19.3, floors: 4, roof: 'crossZ' },
  { x0: -31.7, x1: -19.5, z0: -3.9, z1: 13.4, floors: 4 },
];
function ishAnnex(k: Kit) {
  // the flat-roofed block between the bars at the east end, with tanks and AC units on it
  flatBlock(k, 15.8, 31.6, -12, 13.4, 4.2, '#bdb8ae');
  tanks(k, [[20, -6], [22, -6], [27, 6]], 4.2, 0.6);
  for (const [x, z] of [[25, -4], [28, -2], [20, 7]]) k.plain.push([box(x - 0.6, x + 0.6, 4.2, 5.0, z - 0.4, z + 0.4), '#d9d9d6']);
  k.glass.push(box(31.6, 31.65, PL, 2.8, -2, 2));
}
const ISH_KEEP: [number, number, number, number][] = [[15.8, 32.4, -12, 13.4]];

const SPECS: Spec[] = [
  {
    name: 'International Students Hostel 1, ISH 1',
    axis: [60.3, -21.2], storey: 3.1, style: ISH_GRID, roofColor: '#b2512d', fascia: '#3b3430', pitch: 0.5,
    blocks: ishBlocks,
    keep: [...ISH_KEEP, [1.5, 10, -29, -23.8]],
    extras: (k) => {
      ishAnnex(k);
      // the small gabled porch on the north facade (owner photo), a little east of the middle
      const x = 5.7, z = -23.8, d = 3.6, w = 3.4, eave = 3.7;
      for (const s of [-1, 1]) k.plain.push([box(x + s * w - 0.35, x + s * w + 0.35, 0, eave, z - d, z), '#ecdfbd']);
      k.plain.push([box(x - w, x + w, eave - 0.45, eave, z - d, z), '#ecdfbd']);
      k.plain.push([box(x - w - 0.2, x + w + 0.2, 0, 0.3, z - d - 0.6, z), PAVE]);
      gableZ(k, x - w - 0.5, x + w + 0.5, z - d - 0.5, z + 0.3, eave, 0.55, [true, false]);
      k.glass.push(box(x - 2.4, x + 2.4, 0.3, 3.0, z - 0.05, z));
      k.signs.push({ text: 'INTERNATIONAL STUDENTS HOSTEL 1', x, y: eave - 0.22, z: z - d - 0.01, ry: Math.PI, w: 5.6 });
    },
  },
  {
    name: 'International Students Hostel 2, ISH 2',
    axis: [60.3, -21.2], storey: 3.1, style: ISH_GRID, roofColor: '#b2512d', fascia: '#3b3430', pitch: 0.5,
    blocks: ishBlocks,
    keep: [...ISH_KEEP, [2, 12.5, 25.1, 29]],
    extras: (k) => {
      ishAnnex(k);
      // the flat entrance canopy on the south facade, east of the middle
      const x = 7.1, z = 25.1;
      k.plain.push([box(x - 3.2, x + 3.2, 3.2, 3.9, z, z + 2.4), WHITE]);
      for (const s of [-1, 1]) k.plain.push([box(x + s * 2.9 - 0.15, x + s * 2.9 + 0.15, 0, 3.2, z + 2.1, z + 2.4), WHITE]);
      k.plain.push([box(x - 3.4, x + 3.4, 0, 0.3, z, z + 3), PAVE]);
      k.glass.push(box(x - 2.2, x + 2.2, 0.3, 3.0, z, z + 0.05));
      k.signs.push({ text: 'INTERNATIONAL STUDENTS HOSTEL 2', x, y: 3.55, z: z + 2.41, ry: 0, w: 5.6 });
    },
  },
  {
    name: 'Jubilee Hall',
    axis: [36.3, 103.2], storey: 3.2, style: JUB_WIN, roofColor: '#b0744c', fascia: '#f3efe6', pitch: 0.45,
    blocks: [
      // east wing along the car park: two storeys (owner); gabled balcony bays on its courtyard side
      { x0: -26.8, x1: 67.3, z0: -52.6, z1: -34.5, floors: 2 },
      { x0: -42, x1: -26.8, z0: -52.6, z1: -34.5, floors: 3 },
      // north wing: arched windows over an arcade on the courtyard side
      { x0: -42, x1: -26.8, z0: -34.5, z1: 2.4, floors: 2, faces: { x1: JUB_ARCH } },
      { x0: -45, x1: -22.4, z0: 2.4, z1: 15.4, floors: 3 },
      { x0: -49.5, x1: -39.8, z0: 10.8, z1: 22.1, floors: 3 },
      // west wing, the south-west jog and the south wing: three storeys
      { x0: -28, x1: 59.9, z0: 10.1, z1: 21.5, floors: 3 },
      { x0: 52.5, x1: 63.6, z0: 2.2, z1: 10.4, floors: 3 },
      { x0: 63.6, x1: 77.2, z0: -36.3, z1: 15.9, floors: 3 },
    ],
    keep: [[49, 78, -65, -36]],
    extras: (k) => {
      const e2 = k.wallTop(2);
      // gabled balcony bays on the east wing's courtyard side (owner photos), one every 20 m
      for (const x of [-15, 5, 25, 45]) {
        const z = -34.5;
        k.plain.push([box(x - 3.6, x + 3.6, 0, e2, z, z + 2.2), WHITE]);
        // the recessed balcony: a dark recess with tan stone parapets on each floor
        k.plain.push([box(x - 2.6, x + 2.6, PL, e2 - 0.5, z + 2.2, z + 2.24), '#3b3631']);
        for (let f = 0; f < 2; f++) {
          const y = PL + f * k.storey;
          k.plain.push([box(x - 2.7, x + 2.7, y, y + 1.0, z + 2.24, z + 2.4), '#c4a273']);
          k.plain.push([box(x - 2.8, x + 2.8, y + 1.0, y + 1.12, z + 2.2, z + 2.45), TRIM]);
        }
        gableZ(k, x - 4.1, x + 4.1, -53.2, z + 2.8, e2, 0.6, [true, true], true);
      }
      // a covered walk with a red roof along the west wing's courtyard face
      const w0 = -22, w1 = -4, wz = 10.1;
      k.roof.quad([w1, 2.6, wz - 4], [w0, 2.6, wz - 4], [w0, 3.6, wz], [w1, 3.6, wz]);
      for (let x = w0 + 1; x <= w1 - 1; x += 4) k.plain.push([box(x - 0.1, x + 0.1, 0, 2.6, wz - 3.9, wz - 3.7), WHITE]);
      // courtyard: two tank stands and a tree (the hut in the courtyard is the mapped Didi Jollof)
      for (const [x, z] of [[-22.8, -15.5], [54.7, -19.9]] as [number, number][]) {
        k.plain.push([box(x - 2, x + 2, 0, 1.2, z - 1.2, z + 1.2), '#8f8a82']);
        tanks(k, [[x - 1.1, z], [x + 1.1, z]], 1.2, 0.75);
      }
      k.plain.push([new THREE.CylinderGeometry(0.25, 0.35, 3, 7).translate(12, 1.5, -23.9), '#5b4330']);
      k.plain.push([new THREE.IcosahedronGeometry(3.2, 1).scale(1, 0.85, 1).translate(12, 4.8, -23.9), '#2f5d27']);
      // ---- the entrance corner (owner aerial photo, marked layout) ----
      // doors in the re-entrant corner at the south end of the east wing, under a flat porch roof
      const zN = -52.6, zS = -36.3, xD = 67.3;
      k.glass.push(box(xD, xD + 0.05, PL, 3.0, -47, -40));
      for (const z of [-47, -43.5, -40]) k.plain.push([box(xD + 0.02, xD + 0.1, PL, 3.0, z - 0.07, z + 0.07), '#4a3a2c']);
      k.plain.push([box(xD, 77.2, 3.3, 3.7, zN, zS), TRIM]);
      k.plain.push([box(xD + 0.2, 77.0, 3.7, 3.75, zN + 0.2, zS - 0.2), '#9c7656']);
      for (const [x, z] of [[76.8, -38], [76.8, -45], [76.8, -52]] as [number, number][]) k.plain.push([new THREE.CylinderGeometry(0.18, 0.2, 3.3, 10).translate(x, 1.65, z), WHITE]);
      k.plain.push([box(xD, 77.6, 0, 0.18, -53, zS), PAVE]);
      // the portico from the car park: white posts and beams with a brown band, a flat roof
      const pz0 = -63.5, pz1 = zN, px0 = 69, px1 = 77;
      for (const x of [px0, 73, px1]) k.plain.push([box(x - 0.2, x + 0.2, 0, 3.6, pz0, pz0 + 0.4), WHITE]);
      for (const z of [-58]) for (const x of [px0, px1]) k.plain.push([box(x - 0.2, x + 0.2, 0, 3.6, z - 0.2, z + 0.2), WHITE]);
      k.plain.push([box(px0 - 0.3, px1 + 0.3, 3.6, 4.15, pz0 - 0.3, pz1), WHITE]);
      k.plain.push([box(px0 - 0.32, px1 + 0.32, 3.6, 3.85, pz0 - 0.32, pz0 + 0.1), '#7a5236']);
      k.plain.push([box(px0, px1, 0, 0.15, pz0, pz1), PAVE]);
      // the round white tower beside it, open at the top
      k.plain.push([new THREE.CylinderGeometry(4, 4, 7.8, 28, 1, true).translate(61.5, 3.9, -58.5), WHITE]);
      k.plain.push([new THREE.CylinderGeometry(3.7, 3.7, 0.2, 28).translate(61.5, 6.6, -58.5), '#4a4038']);
      k.plain.push([new THREE.CylinderGeometry(4.15, 4.15, 0.3, 28, 1, true).translate(61.5, 7.7, -58.5), TRIM]);
      for (let i = 0; i < 6; i++) {
        const a = Math.PI * (0.75 + i * 0.18);
        k.glass.push(box(-0.4, 0.4, 2.0, 5.6, -0.04, 0.04).translate(0, 0, 4.02).rotateY(a).translate(61.5, 0, -58.5));
      }
      // the flat-roofed block with water tanks and roof railings, against the east wing
      flatBlock(k, 50, 58.5, -64, zN, k.wallTop(2) - 0.3);
      tanks(k, [[52.5, -58], [55.5, -58]], k.wallTop(2) - 0.3);
      for (let f = 0; f < 2; f++) k.glass.push(box(51, 57.5, PL + 0.9 + f * k.storey, PL + 2.3 + f * k.storey, -64.05, -64));
      k.signs.push({ text: 'JUBILEE HALL', x: 73, y: 3.73, z: pz0 - 0.33, ry: Math.PI, w: 4.2 });
    },
  },
];

/** Jubilee Hall and ISH 1 and 2 */
export const hostels = createSite('hostels', SPECS);
