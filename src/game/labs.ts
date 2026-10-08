// Round the Larway Oraca Building, from the owner's photos and marked aerial (block engine: blocks.ts):
//
// The Department of Nutrition and Food Science, east across Volta Hall Road, its front to the Larway Oraca Building
// (photos 1 and 2): a ground floor clad in white ribbed panels, three floors of board-marked concrete over it, each
// standing out over the one below with a dark gap under it, small square windows scattered in them, the paint and
// concrete washed and streaked grey; in the middle of the front a stair core between two tall square columns that rise
// to a flat canopy over the roof, the lit entrance at its foot; a recessed bay with windows and an air-conditioner on
// the second floor; before it a brick-paved car park under a blue tensile shade.
//
// The School of Nursing and Midwifery, west of the Larway Oraca Building (photo 3): white, three floors, the ground
// floor set back behind square columns, lit, grilles across its openings; on both floors above continuous balconies
// with solid parapets pierced by a row of slots, stepping forward round the middle; glass louvre windows; a flat roof
// with a deep white fascia and lamps on it; a lawn before it with an island of bush and agave, benches, palms.
//
// The Department of Animal Biology and Conservation Science and the Centre for Biodiversity Conservation Research
// (photo 4 and the owner's top view): one floor, long white ranges under hipped tile roofs round courtyards, piers
// between pairs of dark windows; trees all round and in the courts (the owner's red circles, areas in
// corrections.json); along J.K.M. Hodasi Road a brick-paved walk between two low walls faced in rubble stone, young
// palms in the verge.
import * as THREE from 'three';
import { box, canvas, merge, speckle, tri2, type Part } from './modelkit';
import { BAND, PL, createSite, render, type Block, type Kit, type Spec, type Style } from './blocks';
import { concrete } from './concrete';
import { garden } from './gardens';

/** rain streaks hanging down a facade canvas from the top of each storey */
const streaks = (g: CanvasRenderingContext2D, n: number, a: number, tops: number[]) => {
  for (let i = 0; i < n; i++) {
    const x = (i * 53 + (i % 7) * 17) % 252, y = tops[i % tops.length] + (i % 5) * 6, len = 60 + ((i * 41) % 170), w = 2 + (i % 4) * 2;
    const gr = g.createLinearGradient(0, y, 0, y + len);
    gr.addColorStop(0, `rgba(96,94,88,${a * (0.5 + (i % 3) * 0.25)})`); gr.addColorStop(1, 'rgba(96,94,88,0)');
    g.fillStyle = gr; g.fillRect(x, y, w, len);
  }
};

// ---------- the Department of Nutrition and Food Science ----------
const FO: [number, number] = [-185, -204];
const FST = 3.2;
/** board-marked concrete, grey and streaked, small square windows, the dark gap under each floor */
const fsBand = (holes: [number, number][]): Style => ({
  bay: 4.2, up: holes.map(([x, y]) => [x, y, 22, 22] as const), ground: [],
  draw: (g) => {
    g.fillStyle = '#d3d1c9'; g.fillRect(0, 0, 256, 512);
    for (let y = 0; y < 512; y += 11) { g.fillStyle = 'rgba(120,118,110,0.18)'; g.fillRect(0, y, 256, 1); }
    for (let x = 0; x < 256; x += 64) { g.fillStyle = 'rgba(120,118,110,0.12)'; g.fillRect(x, 0, 1, 512); }
    speckle(g, 0, 0, 256, 512, 900, ['rgba(90,88,82,0.2)', 'rgba(235,233,226,0.3)']);
    streaks(g, 46, 0.55, [8, 264]);
    for (const [x, y] of holes) { g.fillStyle = '#e6e4dc'; g.fillRect(x - 3, y - 3, 28, 28); g.fillStyle = '#17191b'; g.fillRect(x, y, 22, 22); }
    g.fillStyle = '#2a2a28'; g.fillRect(0, 0, 256, 16);
  },
});
const FS_A = fsBand([[40, 70], [180, 110]]), FS_B = fsBand([[110, 90], [210, 60]]), FS_C = fsBand([[70, 120]]);
/** the ground floor's white ribbed cladding, washed and stained */
const FS_GROUND: Style = {
  bay: 3.0, up: [], ground: [],
  draw: (g) => {
    g.fillStyle = '#e7e6e1'; g.fillRect(0, 0, 256, 512);
    for (let x = 0; x < 256; x += 12) { g.fillStyle = 'rgba(150,148,140,0.35)'; g.fillRect(x, 0, 2, 512); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(x + 3, 0, 2, 512); }
    streaks(g, 30, 0.35, [0, 256]);
    g.fillStyle = 'rgba(80,90,70,0.3)'; g.fillRect(0, 490, 256, 22);
    g.fillStyle = '#2a2a28'; g.fillRect(0, 256, 256, 14);
  },
};
const FS_MAIN = [-195.7, -171.6, -213.9, -194.5], FS_CORE = [-198.4, -195.7, -209.5, -202.6];
const foodScience: Spec = (() => {
  const X = (x: number) => x - FO[0], Z = (z: number) => z - FO[1];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
  const fl = { 0: FS_GROUND, 1: FS_A, 2: FS_B, 3: FS_C };
  const blk = (r: number[], more: Partial<Block> = {}): Block => ({ x0: X(r[0]), x1: X(r[1]), z0: Z(r[2]), z1: Z(r[3]), floors: 4, roof: 'flat', floorStyle: fl, ...more });
  const H = PL + 4 * FST + BAND;
  return {
    name: 'Department of Nutrition and Food Sciences',
    axis: [1, 0], origin: FO, storey: FST, style: FS_A, roofColor: '#8f8a80', fascia: '#bdb9b0', pitch: 0.3, plinth: '#a9a79f',
    blocks: [blk(FS_MAIN), blk(FS_CORE, { floorStyle: { 0: FS_GROUND, 1: FS_GROUND, 2: FS_GROUND, 3: FS_GROUND } })],
    keep: [[X(-216.5), X(-198.4), Z(-214.5), Z(-182)]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      const [x0, x1, z0, z1] = FS_MAIN;
      // each upper floor stands out over the one below: a concrete lip round the building at its foot
      for (let f = 1; f <= 3; f++) {
        const y = PL + f * FST;
        c.push([B(x0 - 0.45, x1 + 0.45, y - 0.05, y + 0.3, z0 - 0.45, z0), '#c9c7bf'], [B(x0 - 0.45, x1 + 0.45, y - 0.05, y + 0.3, z1, z1 + 0.45), '#c9c7bf']);
        c.push([B(x0 - 0.45, x0, y - 0.05, y + 0.3, z0, z1), '#c9c7bf'], [B(x1, x1 + 0.45, y - 0.05, y + 0.3, z0, z1), '#c9c7bf']);
      }
      c.push([B(x0 - 0.45, x1 + 0.45, H - 0.3, H + 0.5, z0 - 0.45, z0), '#c9c7bf'], [B(x0 - 0.45, x1 + 0.45, H - 0.3, H + 0.5, z1, z1 + 0.45), '#c9c7bf']);
      c.push([B(x0 - 0.45, x0, H - 0.3, H + 0.5, z0, z1), '#c9c7bf'], [B(x1, x1 + 0.45, H - 0.3, H + 0.5, z0, z1), '#c9c7bf']);
      // the stair core: two tall square columns up to the flat canopy over the roof
      for (const z of [FS_CORE[2] + 0.3, FS_CORE[3] - 0.3]) c.push([B(-199.1, -198.4, 0, H + 1.6, z - 0.32, z + 0.32), '#b9b6ad']);
      c.push([B(-199.6, -193.4, H + 1.6, H + 2.25, -210.6, -201.5), '#c4c1b8'], [B(-197.8, -194.2, H + 0.3, H + 1.6, -209.0, -203.1), '#cfcdc5']);
      k.plain.push([B(-199.55, -193.45, H + 1.55, H + 1.6, -210.5, -201.6), '#3a3a38']);
      // the lit entrance at its foot
      k.plain.push([B(-198.45, -198.4, PL, PL + 2.6, -208.4, -203.7), '#f3ead2']);
      k.glass.push(B(-198.5, -198.46, PL, PL + 2.6, -208.3, -203.8));
      for (const z of [-208.3, -206.0, -203.8]) k.plain.push([B(-198.55, -198.45, PL, PL + 2.6, z - 0.04, z + 0.04), '#3a3d40']);
      k.plain.push([B(-200.2, -198.4, 0, 0.12, -208.6, -203.5), '#b9b6ae']);
      for (const z of [-209.6, -202.4]) k.plain.push([new THREE.CylinderGeometry(0.3, 0.22, 0.6, 10).translate(X(-199.6), 0.3, Z(z)), '#f2f0ea'], [new THREE.IcosahedronGeometry(0.4, 0).translate(X(-199.6), 0.85, Z(z)), '#3f7a2c']);
      // the recessed bay on the second floor at the north end of the front: windows, an air-conditioner
      const y2 = PL + 2 * FST;
      k.plain.push([B(-195.75, -195.7, y2 + 0.1, y2 + FST - 0.3, -213.6, -209.8), '#5a5852']);
      k.glass.push(B(-195.8, -195.76, y2 + 0.9, y2 + 2.4, -213.3, -210.1));
      k.plain.push([B(-195.8, -195.76, y2 + 0.9, y2 + 2.4, -213.3, -211.9), '#e9dfb4']);
      k.plain.push([B(-196.2, -195.75, y2 + 0.2, y2 + 0.75, -211.6, -210.8), '#eceeee']);
      c.push([B(-196.0, -195.7, y2, y2 + 1.0, -213.9, -209.6), '#d3d1c9']);
      // a row of windows along the second floor of the south side (photo 2)
      for (let x = -192; x < -174; x += 2.6) { k.glass.push(B(x, x + 2.0, y2 + 0.9, y2 + 2.3, z1 + 0.01, z1 + 0.04)); k.plain.push([B(x - 0.06, x + 2.06, y2 + 0.84, y2 + 2.36, z1, z1 + 0.02), '#2a2c2e']); }
      // a low hedge along the front, a clipped bush by the corner, the department's board on two posts
      const g = garden([-230, -165, -240, -175]);
      g.reseed(19);
      g.hedge(k, X(-196.6), Z(-213.5), X(-196.6), Z(-210.2));
      g.hedge(k, X(-196.6), Z(-202.0), X(-196.6), Z(-195.2));
      k.plain.push([new THREE.ConeGeometry(0.9, 2.2, 10).translate(X(-197.3), 1.1, Z(-196.4)), '#3c6e2a']);
      for (const z of [-215.8, -213.8]) k.plain.push([new THREE.CylinderGeometry(0.05, 0.05, 3.0, 8).translate(X(-212.5), 1.5, Z(z)), '#8a8d90']);
      k.plain.push([B(-212.55, -212.45, 1.4, 2.9, -216.0, -213.6), '#f2f2ee']);
      k.signs.push({ text: 'DEPARTMENT OF NUTRITION AND FOOD SCIENCE', x: X(-212.6), y: 2.2, z: Z(-214.8), ry: -Math.PI / 2, w: 2.2, colors: ['#f2f2ee', '#1d3f7a'] });
      // the brick-paved car park before the south-west corner, the blue tensile shade over its bays (photo 2)
      const tex = canvas(128, 128, (gg) => {
        gg.fillStyle = '#857f76'; gg.fillRect(0, 0, 128, 128);
        const cols = ['#a39c92', '#988f84', '#aaa398', '#8f877c'];
        for (let i = 0; i < 8; i++) for (let j = 0; j < 16; j++) { gg.fillStyle = cols[(i * 3 + j) % 4]; gg.fillRect(i * 16 + (j % 2) * 8 + 1, j * 8 + 1, 14, 6); }
      });
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      const pv = new THREE.PlaneGeometry(16, 15).rotateX(-Math.PI / 2).translate(X(-207.5), 0.05, Z(-189.5));
      const uv = pv.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 8, uv.getY(i) * 7.5);
      const pm = new THREE.Mesh(pv, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
      pm.receiveShadow = true;
      k.meshes.push(pm);
      for (const z of [-194.6, -190.0, -185.4]) {
        c.push([B(-213.4, -213.2, 0, 2.6, z - 0.1, z + 0.1), '#f1f1ee']);
        c.push([new THREE.BoxGeometry(5.2, 0.12, 0.12).rotateZ(-0.12).translate(X(-210.8), 2.75, Z(z)), '#f1f1ee']);
      }
      for (const [za, zb] of [[-194.6, -190.0], [-190.0, -185.4]]) {
        const A: [number, number, number] = [X(-213.3), 3.0, Z(za)], Bq: [number, number, number] = [X(-213.3), 3.0, Z(zb)], C: [number, number, number] = [X(-208.2), 2.4, Z(zb)], D: [number, number, number] = [X(-208.2), 2.4, Z(za)];
        const M: [number, number, number] = [X(-210.8), 2.5, Z((za + zb) / 2)];
        for (const [p, q] of [[A, Bq], [Bq, C], [C, D], [D, A]]) k.plain.push([tri2(p, q, M), '#1f62b8']);
      }
      const m = new THREE.Mesh(merge(c), concrete(1.6));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

// ---------- the School of Nursing and Midwifery ----------
const NO: [number, number] = [-331.5, -190];
const NG = 3.6, NST = 3.3;
const N_TOP: Style = {
  bay: 3.6, up: [[30, 60, 196, 130]], ground: [[30, 256 + 60, 196, 130]],
  draw: (g) => {
    render(g, '#f5f5f2');
    for (const y0 of [0, 256]) {
      g.fillStyle = '#2c2e30'; g.fillRect(26, y0 + 56, 204, 138);
      for (let i = 0; i < 3; i++) {
        const x = 30 + i * 66, lit = i === 1;
        for (let y = y0 + 60; y < y0 + 188; y += 9) { g.fillStyle = lit ? '#d8c27a' : '#5f707c'; g.fillRect(x, y, 62, 6); g.fillStyle = lit ? '#a8904c' : '#3a4650'; g.fillRect(x, y + 6, 62, 3); }
      }
    }
  },
};
const N_GROUND: Style = {
  bay: 4.5, up: [], ground: [[20, 256 + 40, 216, 216]],
  draw: (g) => {
    render(g, '#efefec');
    g.fillStyle = '#2a2c2e'; g.fillRect(20, 256 + 40, 216, 216);
    g.fillStyle = '#d9d0a8'; g.fillRect(28, 256 + 48, 200, 120);
    g.strokeStyle = '#1a1b1c'; g.lineWidth = 3;
    for (let x = 28; x < 230; x += 14) { g.beginPath(); g.moveTo(x, 256 + 48); g.lineTo(x, 512); g.stroke(); }
    for (const y of [256 + 100, 256 + 170]) { g.beginPath(); g.moveTo(20, y); g.lineTo(236, y); g.stroke(); }
  },
};
const nursing: Spec = (() => {
  const X = (x: number) => x - NO[0], Z = (z: number) => z - NO[1];
  const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
  const XS = [-355.0, -308.0], ZN = -198.9, ZS = -180.9;
  const upZ = [ZN + 1.4, ZS - 2.1];
  const U = PL + NG, TOP = U + 2 * NST + BAND;
  return {
    name: 'School Of Nursing and Midwifery',
    axis: [1, 0], origin: NO, storey: NST, style: N_TOP, roofColor: '#cfcdc6', fascia: '#f5f5f2', pitch: 0.2, plinth: '#f2f2ef',
    blocks: [
      { x0: X(XS[0] + 1.2), x1: X(XS[1] - 1.2), z0: Z(ZN + 1.6), z1: Z(ZS - 3.6), floors: 1, roof: 'none', faces: { x0: N_GROUND, x1: N_GROUND, z0: N_GROUND, z1: N_GROUND }, floorStyle: { 0: N_GROUND } },
      { x0: X(XS[0]), x1: X(XS[1]), z0: Z(upZ[0]), z1: Z(upZ[1]), floors: 2, roof: 'none', y: U - PL + 0.0 },
    ],
    keep: [[X(XS[0]) - 1, X(XS[1]) + 1, Z(ZS) - 0.5, Z(ZS) + 3]],
    extras: (k: Kit) => {
      const c: Part[] = [];
      // the floors over the set-back ground floor, the soffit lit
      c.push([B(XS[0], XS[1], U - 0.35, U + 0.05, ZN, ZS), '#f2f2ef']);
      for (let x = XS[0] + 2.5; x < XS[1] - 1; x += 4.5) for (const z of [ZS - 1.5, ZN + 0.9]) k.plain.push([B(x - 0.35, x + 0.35, U - 0.38, U - 0.35, z - 0.15, z + 0.15), '#fff3d0']);
      // square columns along the open ground floor
      for (let x = XS[0] + 0.5; x <= XS[1] - 0.4; x += 4.5) for (const z of [ZS - 0.6, ZN + 0.5]) c.push([B(x - 0.28, x + 0.28, 0, U - 0.35, z - 0.28, z + 0.28), '#f4f4f1']);
      // the balconies on both upper floors: the slab, a solid parapet pierced by a row of slots; round the middle of
      // the south front they step out a further metre
      const mid = [-339.0, -324.0];
      for (let f = 0; f < 2; f++) {
        const y = U + f * NST;
        for (const [side, zw, ze] of [[1, upZ[1], ZS], [-1, upZ[0], ZN]] as [number, number, number][]) {
          const segs: [number, number, number][] = side > 0 ? [[XS[0], mid[0], ze], [mid[0], mid[1], ze + 1.0], [mid[1], XS[1], ze]] : [[XS[0], XS[1], ze]];
          for (const [a, b, zo] of segs) {
            const [lo, hi] = [Math.min(zw, zo), Math.max(zw, zo)];
            c.push([B(a, b, y - 0.3, y, lo, hi), '#f4f4f1']);
            const zp0 = side > 0 ? zo - 0.18 : zo, zp1 = side > 0 ? zo : zo + 0.18;
            c.push([B(a, b, y, y + 0.35, zp0, zp1), '#f4f4f1'], [B(a, b, y + 0.6, y + 1.0, zp0, zp1), '#f4f4f1']);
            for (let x = a + 0.3; x < b - 0.4; x += 0.9) c.push([B(x, x + 0.6, y + 0.35, y + 0.6, zp0, zp1), '#f4f4f1']);
            k.plain.push([B(a, b, y + 0.35, y + 0.6, (zp0 + zp1) / 2 - 0.02, (zp0 + zp1) / 2 + 0.02), '#2a2c2e']);
          }
          if (side > 0) for (const x of mid) c.push([B(x - 0.09, x + 0.09, y, y + 1.0, ze, ze + 1.0), '#f4f4f1']);
          for (const x of XS) c.push([B(x - 0.09, x + 0.09, y, y + 1.0, Math.min(zw, ze), Math.max(zw, ze)), '#f4f4f1']);
        }
      }
      // the flat roof: a deep white fascia standing out all round, lamps on it
      c.push([B(XS[0] - 1.0, XS[1] + 1.0, TOP - 0.1, TOP + 0.9, ZN - 1.0, ZS + 1.0), '#f6f6f3']);
      k.plain.push([B(XS[0] - 0.9, XS[1] + 0.9, TOP + 0.9, TOP + 0.95, ZN - 0.9, ZS + 0.9), '#bdbab2']);
      for (let x = XS[0] + 3; x < XS[1] - 2; x += 6.5) k.plain.push([B(x - 0.25, x + 0.25, TOP + 0.2, TOP + 0.45, ZS + 1.0, ZS + 1.15), '#d8d8d4']);
      // the lawn before it: an island of bush and agave with two dry flower stalks, benches, palms
      const g = garden([-370, -295, -205, -160]);
      g.reseed(71);
      for (const [x, z, r] of [[-345.5, -173.5, 1.6], [-343.6, -172.4, 1.2], [-347.2, -172.0, 1.1]] as [number, number, number][]) k.plain.push([new THREE.IcosahedronGeometry(r, 1).scale(1.2, 0.8, 1).translate(X(x), r * 0.6, Z(z)), '#355f24']);
      for (const [x, z] of [[-342.4, -171.8], [-348.4, -173.6]]) for (let i = 0; i < 12; i++) k.plain.push([new THREE.ConeGeometry(0.07, 1.4, 3).translate(0, 0.7, 0).rotateZ(0.5 + (i % 3) * 0.15).rotateY((i / 12) * Math.PI * 2).translate(X(x), 0, Z(z)), '#5d7f4a']);
      for (const [x, z, h] of [[-346.2, -174.2, 7.5], [-344.8, -173.0, 6.2]] as [number, number, number][]) {
        k.plain.push([new THREE.CylinderGeometry(0.04, 0.06, h, 5).translate(X(x), h / 2, Z(z)), '#9a8f7a']);
        for (let y = h * 0.55; y < h; y += 0.9) k.plain.push([new THREE.BoxGeometry(0.9, 0.03, 0.03).rotateY(y).translate(X(x), y, Z(z)), '#9a8f7a']);
      }
      for (const x of [-361.5, -358.6]) {
        k.plain.push([B(x - 1.1, x + 1.1, 0.42, 0.5, -175.4, -174.9), '#2f5fa8'], [B(x - 1.1, x + 1.1, 0.5, 0.95, -175.45, -175.35), '#2f5fa8']);
        for (const dx of [-0.95, 0.95]) k.plain.push([B(x + dx - 0.05, x + dx + 0.05, 0, 0.45, -175.4, -174.9), '#2a2c2e']);
      }
      g.palm(k, X(-306.5), Z(-172.5), 6.5);
      g.palm(k, X(-305.0), Z(-176.0), 5.0);
      g.tree(k, X(-362), Z(-185), 1.8);
      const m = new THREE.Mesh(merge(c), concrete(0.12));
      m.castShadow = true; m.receiveShadow = true;
      k.meshes.push(m);
    },
  };
})();

// ---------- Animal Biology and the Centre for Biodiversity: one-floor ranges round courts ----------
const AO: [number, number] = [-90, -230];
const A_WALL: Style = {
  bay: 3.2, up: [], ground: [[50, 256 + 70, 56, 104], [150, 256 + 70, 56, 104]],
  draw: (g) => {
    render(g, '#f2f1ec');
    streaks(g, 14, 0.25, [256]);
    g.fillStyle = '#e4e2db'; g.fillRect(0, 256, 22, 256); g.fillRect(234, 256, 22, 256);
    g.fillStyle = 'rgba(90,88,82,0.22)'; g.fillRect(22, 256, 3, 256); g.fillRect(231, 256, 3, 256);
    for (const x of [50, 150]) { g.fillStyle = '#d6d4cc'; g.fillRect(x - 5, 256 + 65, 66, 114); g.fillStyle = '#1d2024'; g.fillRect(x, 256 + 70, 56, 104); g.fillStyle = '#3a4048'; g.fillRect(x + 27, 256 + 70, 2, 104); g.fillRect(x, 256 + 110, 56, 2); }
    g.fillStyle = '#a7a39a'; g.fillRect(0, 512 - 18, 256, 18);
  },
};
const animal: Spec = (() => {
  const X = (x: number) => x - AO[0], Z = (z: number) => z - AO[1];
  const R = (x0: number, x1: number, z0: number, z1: number): Block => ({ x0: X(x0), x1: X(x1), z0: Z(z0), z1: Z(z1), floors: 1 });
  return {
    name: 'Department of Animal Biology and Conservation Science',
    axis: [1, 0], origin: AO, storey: 3.5, style: A_WALL, roofColor: '#a65b3c', fascia: '#efede6', pitch: 0.4, plinth: '#a7a39a',
    replaces: [[-130, -197], [-148, -230], [-70, -270], [-108, -252]],
    blocks: [
      // the Centre for Biodiversity along the north, Nature and Food beside the north court
      R(-113.2, -24.9, -277.5, -263.3), R(-113.2, -102.7, -262.5, -242.4),
      // the west range by the car park, its arm east
      R(-154.7, -142.3, -266.5, -202.7), R(-142.6, -136.4, -240.5, -229.7),
      // the range across the middle, the two ranges down either side of the court, the range along the south and the
      // two wings beyond it toward the road
      R(-118.9, -23.8, -239.9, -229.6), R(-108.6, -98.3, -229.6, -202.7), R(-53.0, -40.4, -229.6, -202.7),
      R(-156.0, -26.7, -202.7, -191.0), R(-108.1, -96.6, -191.0, -176.7), R(-52.3, -40.3, -191.0, -176.4),
    ],
    keep: [[X(-155), X(-28), Z(-168.6), Z(-163.9)]],
    extras: (k: Kit) => {
      const st: Part[] = [];
      // a covered walk round the court on posts (its edge is lit at night)
      for (const [x0, x1, z0, z1] of [[-98.3, -53.0, -229.6, -227.6], [-98.3, -53.0, -204.7, -202.7], [-98.3, -96.3, -227.6, -204.7], [-55.0, -53.0, -227.6, -204.7]]) {
        k.plain.push([box(X(x0), X(x1), 3.3, 3.45, Z(z0), Z(z1)), '#c9c4b8'], [box(X(x0), X(x1), 0, 0.1, Z(z0), Z(z1)), '#c2bdb2']);
      }
      for (let x = -96.5; x < -54; x += 3.4) for (const z of [-227.8, -204.5]) k.plain.push([box(X(x) - 0.12, X(x) + 0.12, 0, 3.3, Z(z) - 0.12, Z(z) + 0.12), '#efede6']);
      // the walk along J.K.M. Hodasi Road (photo 4): brick paving between two low walls faced in rubble stone, young
      // palms in the verge
      const tex = canvas(128, 128, (g) => {
        g.fillStyle = '#6f6a62'; g.fillRect(0, 0, 128, 128);
        for (let i = 0; i < 8; i++) for (let j = 0; j < 16; j++) { g.fillStyle = ['#8d867b', '#7f786d', '#958e83', '#857e73'][(i + j * 3) % 4]; g.fillRect(i * 16 + (j % 2) * 8 + 1, j * 8 + 1, 14, 6); }
      });
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      const len = 125, x0 = -154, z0 = -168.1, z1 = -165.6;
      const pv = new THREE.PlaneGeometry(len, z1 - z0).rotateX(-Math.PI / 2).translate(X(x0 + len / 2), 0.06, Z((z0 + z1) / 2));
      const uv = pv.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len / 2, uv.getY(i) * 1.25);
      const pm = new THREE.Mesh(pv, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
      pm.receiveShadow = true;
      k.meshes.push(pm);
      for (const [za, zb, h] of [[z1, z1 + 0.4, 0.35], [z0 - 0.45, z0, 0.55]] as [number, number, number][]) {
        st.push([box(X(x0), X(x0 + len), 0, h, Z(za), Z(zb)), '#ffffff']);
        k.plain.push([box(X(x0) - 0.05, X(x0 + len) + 0.05, h, h + 0.09, Z(za) - 0.05, Z(zb) + 0.05), '#bdb8ac']);
      }
      const g = garden([-160, -20, -300, -160]);
      g.reseed(83);
      // the trees the owner circled in the courts and round the ranges (the generic woods keep off the complex's
      // bounding box, so they are planted here): broad crowns close together, clear of the ranges and the walks
      const RANGES: number[][] = [[-113.2, -24.9, -277.5, -263.3], [-113.2, -102.7, -262.5, -242.4], [-154.7, -142.3, -266.5, -202.7], [-142.6, -136.4, -240.5, -229.7],
        [-118.9, -23.8, -239.9, -229.6], [-108.6, -98.3, -229.6, -202.7], [-53.0, -40.4, -229.6, -202.7], [-156.0, -26.7, -202.7, -191.0], [-108.1, -96.6, -191.0, -176.7], [-52.3, -40.3, -191.0, -176.4]];
      const clear = (x: number, z: number, m: number) => !RANGES.some(([a, b, c, d]) => x > a - m && x < b + m && z > c - m && z < d + m);
      const ZONES: number[][] = [[-134.3, -124.7, -241.5, -232.6], [-136, -110, -229, -211.5], [-90, -58, -220.6, -206], [-40, -15, -229, -203.5],
        [-139, -72, -189.5, -170], [-66, -53, -189.5, -170], [-39.5, -28.7, -189.5, -179]];
      for (const [a, b, c, d] of ZONES) {
        const n = Math.max(1, Math.round(((b - a) * (d - c)) / 45));
        // (in the main court, clear of the covered walk round it)
        for (let i = 0, put = 0; i < n * 4 && put < n; i++) {
          const x = a + g.rand() * (b - a), z = c + g.rand() * (d - c);
          if (!clear(x, z, 2.8) || (z > -229.6 && z < -202.7 && x > -97.5 && x < -53.5 && (x < -95 || x > -56 || z < -227 || z > -205))) continue;
          g.tree(k, X(x), Z(z), 1.1 + g.rand() * 0.7);
          put++;
        }
      }
      for (let x = -148; x < -32; x += 9 + (Math.abs(x) % 3)) g.palm(k, X(x), Z(-164.9), 2.2 + (Math.abs(x * 7) % 10) / 10);
      const sm = new THREE.Mesh(merge(st), stoneMat());
      sm.castShadow = true; sm.receiveShadow = true;
      k.meshes.push(sm);
    },
  };
})();

/** rubble stone facing in world metres (as round the Balme Library's south-west, balmewest.ts) */
let stone: THREE.MeshStandardMaterial | null = null;
function stoneMat() {
  if (stone) return stone;
  let s = 5;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const tex = canvas(256, 256, (g) => {
    g.fillStyle = '#6d665a'; g.fillRect(0, 0, 256, 256);
    const cols = ['#b49a7a', '#a08868', '#c2ad8e', '#8f7a62', '#b8a58a', '#c8b79a', '#d1bf9c'];
    for (let j = 0; j < 8; j++) for (let i = 0; i < 7; i++) {
      const cx = i * 37 + (j % 2) * 18 + r() * 8, cy = j * 32 + r() * 6, rx = 14 + r() * 6, ry = 11 + r() * 5, n = 6 + ((r() * 3) | 0), col = cols[(r() * cols.length) | 0];
      for (const [ox, oy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) {
        g.beginPath();
        for (let q = 0; q < n; q++) { const a = (q / n) * Math.PI * 2 + r() * 0.3, f = 0.75 + r() * 0.3; g[q ? 'lineTo' : 'moveTo'](cx + ox + Math.cos(a) * rx * f, cy + oy + Math.sin(a) * ry * f); }
        g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = 'rgba(40,36,30,0.55)'; g.lineWidth = 2; g.stroke();
      }
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.stTex = { value: tex };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vStP;\nvarying vec3 vStN;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvStP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvStN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vStP;\nvarying vec3 vStN;\nuniform sampler2D stTex;')
      .replace('#include <map_fragment>', `#include <map_fragment>
  vec3 stA = abs(vStN);
  vec2 stUv = stA.y > 0.6 ? vStP.xz / 1.6 : vec2((stA.x > stA.z ? vStP.z : vStP.x) / 1.6, vStP.y / 1.6);
  diffuseColor.rgb *= texture2D(stTex, stUv).rgb;`);
  };
  m.customProgramCacheKey = () => 'rubble-stone-labs';
  return (stone = m);
}

/** Food Science, Nursing, and Animal Biology with the Centre for Biodiversity */
export const labsSite = createSite('labs', [foodScience, nursing, animal]);
