// The Shell filling station north-east of Old Pent and the tyre and mechanic shop beside it (the owner's Pent PDF,
// pages 6-16; the old map names them Oando and Michelin; block engine: blocks.ts).
//
// - The forecourt: herringbone brick paving; the canopy on white columns, its deep fascia yellow with a red stripe,
//   the Shell emblem at its corners; three pump islands with yellow and white pumps and their red V-Power boards.
// - The Shell Select shop on its west (the owner's violet mark): one floor, white, a red tiled hipped roof with a gable
//   at its south end, the front to the forecourt a band of yellow over a red stripe above shop windows and glazed
//   doors, the Select sign, blue bollards before it.
// - The tyre and mechanic shop north of the forecourt road (red mark): a white one-floor building behind a long canopy
//   on posts, its fascia a row of purple boards with tyre adverts, red tyre racks under it.
// - On the south edge: the red and black Sweet Top Bites container kiosk, a blue tent beside it, a coconut palm, a small
//   white store; the site closed by a short white wall (the black line on the owner's map) with an open way in on its
//   south side (blue).
import * as THREE from 'three';
import { box, merge, tri2, type Part } from './modelkit';
import { PL, createSite, render, type Spec, type Style } from './blocks';
import { concrete } from './concrete';
import { hipRoof } from './waccbip';
import { SOLIDS } from './solids';

const SO: [number, number] = [750, -605];
const X = (x: number) => x - SO[0], Z = (z: number) => z - SO[1];
const B = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(X(x0), X(x1), y0, y1, Z(z0), Z(z1));
const YELLOW = '#f2c21a', RED = '#d7261e', WALL = '#f2f2ef';

// ---------- the Shell Select shop ----------
const SH = [727.7, 742.0, -614.7, -588.6];
const SHOP_WALL: Style = { bay: 3.2, up: [], ground: [[60, 256 + 70, 136, 110]], draw: (g) => { render(g, WALL); g.fillStyle = '#2b3036'; g.fillRect(60, 256 + 70, 136, 110); g.fillStyle = '#5a5f63'; g.fillRect(0, 512 - 20, 256, 20); } };
const SHOP_FRONT: Style = {
  bay: 3.0, up: [], ground: [[16, 256 + 40, 224, 200]],
  draw: (g) => {
    render(g, WALL);
    const gl = g.createLinearGradient(0, 256 + 40, 0, 256 + 240); gl.addColorStop(0, '#6f8796'); gl.addColorStop(1, '#2c363d');
    g.fillStyle = gl; g.fillRect(16, 256 + 40, 224, 200);
    g.fillStyle = '#d9d9d6'; g.fillRect(126, 256 + 40, 4, 200); g.fillRect(16, 256 + 40, 224, 4);
    g.fillStyle = '#e9d27a'; for (let i = 0; i < 5; i++) g.fillRect(30 + i * 42, 256 + 90, 30, 100);
    g.fillStyle = '#4a4f53'; g.fillRect(0, 512 - 16, 256, 16);
  },
};
const shop: Spec = {
  name: 'Shell Select shop',
  axis: [1, 0], origin: [(SH[0] + SH[1]) / 2, (SH[2] + SH[3]) / 2], storey: 3.6, style: SHOP_WALL, roofColor: '#b94a32', fascia: '#3a2a22', pitch: 0.45,
  replaces: [[735, -601]],
  blocks: [{ x0: SH[0] - 734.85, x1: SH[1] - 734.85, z0: SH[2] + 601.65, z1: SH[3] + 601.65, floors: 1, roof: 'none', faces: { x1: SHOP_FRONT } }],
  keep: [[SH[1] - 734.85, SH[1] + 5 - 734.85, SH[2] + 601.65, SH[3] + 601.65]],
  extras: (k) => {
    const OX = 734.85, OZ = -601.65, b = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(x0 - OX, x1 - OX, y0, y1, z0 - OZ, z1 - OZ);
    const e = k.wallTop(1), c: Part[] = [];
    // the hipped roof, a gable over the south end
    hipRoof(k, (x, z) => [x - OX, z - OZ], SH[0] - 0.7, SH[1] + 0.7, SH[2] - 0.7, SH[3] + 0.7, e, 0.42, 'z', [{ gw: 0, tri: false }, { gw: 99, tri: false }], c, '#3a2a22');
    const top = e + ((SH[1] - SH[0]) / 2 + 0.7) * 0.42;
    k.plain.push([tri2([SH[0] - OX, e, SH[3] - OZ + 0.02], [SH[1] - OX, e, SH[3] - OZ + 0.02], [(SH[0] + SH[1]) / 2 - OX, top - 0.2, SH[3] - OZ + 0.02]), WALL]);
    // the yellow band with its red stripe along the front, the Select sign, the glazed doors, the bollards
    const fx = SH[1];
    c.push([b(fx, fx + 0.35, e - 1.4, e - 0.35, SH[2] + 3, SH[3] - 3), YELLOW], [b(fx + 0.35, fx + 0.37, e - 1.4, e - 1.2, SH[2] + 3, SH[3] - 3), RED]);
    k.plain.push([b(fx + 0.37, fx + 0.42, e - 1.6, e - 0.2, -603.5, -599.5), '#f7f7f4']);
    k.signs.push({ text: 'Select', x: fx + 0.43 - OX, y: e - 0.95, z: -601.5 - OZ, ry: Math.PI / 2, w: 3.4, colors: ['#f7f7f4', RED] });
    k.plain.push([b(fx, fx + 0.04, PL, PL + 2.4, -602.6, -600.6), '#202529'], [b(fx + 0.04, fx + 0.06, PL + 0.1, PL + 2.3, -602.5, -600.7), '#8fa7b4']);
    for (let z = SH[2] + 2.5; z < SH[3] - 2; z += 3.1) { k.plain.push([new THREE.CylinderGeometry(0.15, 0.15, 1.1, 10).translate(fx + 1.2 - OX, 0.55, z - OZ), '#2a44a8']); SOLIDS.add(fx + 1.2, z, 0.2); }
    c.push([b(fx, fx + 1.8, 0, 0.15, SH[2], SH[3]), '#c9c3b6']);
    const m = new THREE.Mesh(merge(c), concrete(0.2)); m.castShadow = true; k.meshes.push(m);
  },
};

// ---------- the tyre and mechanic shop ----------
const ME = [780.1, 811.0, -646.4, -634.0];
const MECH_WALL: Style = { bay: 3.4, up: [], ground: [[90, 256 + 70, 76, 90]], draw: (g) => { render(g, WALL); g.fillStyle = '#2a2d30'; g.fillRect(90, 256 + 70, 76, 90); g.fillStyle = '#8b8e90'; g.fillRect(0, 512 - 24, 256, 24); } };
const MECH_FRONT: Style = { bay: 4.5, up: [], ground: [[30, 256 + 30, 196, 226]], draw: (g) => { render(g, WALL); g.fillStyle = '#25282b'; g.fillRect(30, 256 + 30, 196, 226); } };
const mechanic: Spec = {
  name: 'tyre and mechanic shop',
  axis: [1, 0], origin: [795.5, -640], storey: 3.4, style: MECH_WALL, roofColor: '#6d4a3a', fascia: '#3a2a22', pitch: 0.3,
  replaces: [[789, -639], [805, -639.5]],
  blocks: [{ x0: ME[0] - 795.5, x1: ME[1] - 795.5, z0: ME[2] + 640, z1: ME[3] + 640, floors: 1, faces: { z1: MECH_FRONT } }],
  keep: [[ME[0] - 795.5, ME[1] - 795.5, ME[3] + 640, ME[3] + 646]],
  extras: (k) => {
    const OX = 795.5, OZ = -640, b = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => box(x0 - OX, x1 - OX, y0, y1, z0 - OZ, z1 - OZ);
    const c: Part[] = [], zf = ME[3], zc = zf + 5.0, h = 3.4;
    // the canopy along the front on posts, its fascia of purple boards with tyre adverts
    c.push([b(ME[0], ME[1], h, h + 0.2, zf, zc), '#e9e9e6']);
    k.plain.push([b(ME[0], ME[1], h + 0.2, h + 1.3, zc - 0.1, zc), '#4b2c7a']);
    const ads: [string, string][] = [['Goodyear', '#f2c21a'], ['apollo TYRES', '#ffffff'], ['MICHELIN', '#f2c21a'], ['TYRES & CAMBER', '#ffffff'], ['BALANCING', '#ffffff'], ['024 464 9482', '#f2c21a']];
    ads.forEach(([t, col], i) => { const x = ME[0] + 2.6 + i * ((ME[1] - ME[0] - 5) / (ads.length - 1)); k.signs.push({ text: t, x: x - OX, y: h + 0.75, z: zc - OZ + 0.02, ry: 0, w: 4.0, colors: ['#4b2c7a', col] }); });
    for (let x = ME[0] + 0.3; x <= ME[1]; x += 5.1) { c.push([b(x - 0.1, x + 0.1, 0, h, zc - 0.4, zc - 0.2), '#d9d9d6']); SOLIDS.add(x, zc - 0.3, 0.2); }
    // red tyre racks and the tyres
    for (const x of [783, 787, 801, 806]) {
      for (const dx of [-0.8, 0.8]) k.plain.push([b(x + dx - 0.05, x + dx + 0.05, 0, 1.8, zf + 1.6, zf + 1.7), '#c8261e']);
      for (const y of [0.6, 1.2, 1.75]) k.plain.push([b(x - 0.85, x + 0.85, y - 0.05, y, zf + 1.2, zf + 2.0), '#c8261e']);
      for (let i = 0; i < 3; i++) k.plain.push([new THREE.TorusGeometry(0.3, 0.12, 6, 12).rotateY(Math.PI / 2).translate(x - 0.5 + i * 0.5 - OX, 0.95, zf + 1.6 - OZ), '#1b1b1b']);
      SOLIDS.add(x, zf + 1.6, 1.0);
    }
    k.plain.push([b(ME[0], ME[1], 0.01, 0.04, zf, zc + 2), '#9c5541']);
    const m = new THREE.Mesh(merge(c), concrete(0.3)); m.castShadow = true; k.meshes.push(m);
  },
};

// ---------- the forecourt, the canopy and pumps, the kiosks on the south edge, the wall ----------
const forecourt: Spec = {
  name: 'Shell filling station',
  axis: [1, 0], origin: SO, storey: 3, style: SHOP_WALL, roofColor: '#b94a32', fascia: '#3a2a22', pitch: 0.3,
  onGround: true,
  blocks: [],
  keep: [[X(712), X(813), Z(-652), Z(-574)]],
  extras: (k) => {
    const c: Part[] = [];
    // herringbone brick paving over the forecourt and before the shop
    const pave = (x0: number, x1: number, z0: number, z1: number) => {
      const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2);
      const uv = g.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * (x1 - x0)) / 4, (uv.getY(i) * (z1 - z0)) / 4);
      const m = new THREE.Mesh(g, herring()); m.position.set(X((x0 + x1) / 2), 0.025, Z((z0 + z1) / 2)); m.receiveShadow = true; k.meshes.push(m);
    };
    pave(751.5, 771.0, -620.5, -590.5); pave(742.2, 745.5, -616, -588); pave(724, 770, -583, -577.5);
    // the canopy: white columns, the slab, its fascia yellow with a red stripe, the Shell emblems at the corners
    const C = [754.5, 770.5, -616.0, -595.0], ch = 6.2;
    for (const x of [757.5, 762.5, 767.5]) for (const z of [-611.5, -599.5]) { c.push([B(x - 0.3, x + 0.3, 0, ch, z - 0.3, z + 0.3), WALL]); SOLIDS.add(x, z, 0.4); }
    c.push([B(C[0], C[1], ch, ch + 0.5, C[2], C[3]), '#e9e9e6']);
    for (const [x0, x1, z0, z1] of [[C[0], C[1], C[2] - 0.05, C[2] + 0.05], [C[0], C[1], C[3] - 0.05, C[3] + 0.05], [C[0] - 0.05, C[0] + 0.05, C[2], C[3]], [C[1] - 0.05, C[1] + 0.05, C[2], C[3]]]) {
      k.plain.push([B(x0, x1, ch + 0.5, ch + 1.3, z0, z1), YELLOW], [B(x0 - 0.01, x1 + 0.01, ch + 0.5, ch + 0.68, z0 - 0.01, z1 + 0.01), RED], [B(x0 - 0.01, x1 + 0.01, ch + 1.3, ch + 1.45, z0 - 0.01, z1 + 0.01), '#f4f4f1']);
    }
    for (const [x, z] of [[C[0], C[2]], [C[1], C[2]], [C[0], C[3]], [C[1], C[3]]]) {
      k.plain.push([B(x - 0.6, x + 0.6, ch + 0.4, ch + 1.7, z - 0.6, z + 0.6), '#f7f7f4']);
      for (const [ry, dx, dz] of [[0, 0, 0.61], [Math.PI, 0, -0.61], [Math.PI / 2, 0.61, 0], [-Math.PI / 2, -0.61, 0]] as [number, number, number][]) {
        k.plain.push([new THREE.CircleGeometry(0.42, 16, 0, Math.PI).rotateY(ry).translate(X(x) + dx, ch + 0.85, Z(z) + dz), YELLOW]);
      }
    }
    for (let x = C[0] + 1; x < C[1]; x += 3) k.plain.push([B(x, x + 1.5, ch - 0.02, ch, -608, -603), '#fffbe6']);
    // the pump islands with their pumps and V-Power boards
    for (const z of [-611.5, -605.5, -599.5]) {
      c.push([B(758.5, 766.5, 0, 0.22, z - 0.6, z + 0.6), '#d7d7d3']);
      for (const x of [760, 765]) {
        k.plain.push([B(x - 0.45, x + 0.45, 0.22, 2.0, z - 0.35, z + 0.35), '#f4f4f1'], [B(x - 0.46, x + 0.46, 1.6, 2.0, z - 0.36, z + 0.36), YELLOW], [B(x - 0.3, x + 0.3, 1.0, 1.5, z - 0.37, z + 0.37), '#2c3640']);
        SOLIDS.add(x, z, 0.6);
      }
      k.plain.push([B(762.2, 762.8, 3.2, 4.0, z - 0.05, z + 0.05), RED]);
      k.signs.push({ text: 'V-Power', x: X(762.5), y: 3.6, z: Z(z) + 0.06, ry: 0, w: 0.55, colors: [RED, '#ffffff'] });
      k.plain.push([B(762.47, 762.53, 0.22, 3.2, z - 0.03, z + 0.03), '#9aa0a5']);
    }
    // the Sweet Top Bites container kiosk, the blue tent, the palm, the small white store
    { const x0 = 736.5, x1 = 742.5, z0 = -581.0, z1 = -578.6;
      c.push([B(x0, x1, 0, 2.6, z0, z1), '#1b1b1b']);
      k.plain.push([B(x0 - 0.1, x1 + 0.1, 2.6, 3.4, z0 - 0.05, z0 + 0.1), RED]);
      k.signs.push({ text: 'SWEET TOP BITES', x: X((x0 + x1) / 2), y: 3.0, z: Z(z0) - 0.06, ry: Math.PI, w: 4.0, colors: [RED, '#ffffff'] });
      const g = new THREE.BufferGeometry(), y0 = 2.5, y1 = 2.1;
      g.setAttribute('position', new THREE.Float32BufferAttribute([X(x0), y0, Z(z0), X(x1), y0, Z(z0), X(x1), y1, Z(z0 - 1.4), X(x0), y1, Z(z0 - 1.4)], 3));
      g.setIndex([0, 2, 1, 0, 3, 2, 0, 1, 2, 0, 2, 3]); g.computeVertexNormals(); k.plain.push([g, '#e8352a']);
      k.plain.push([B(x0 + 0.5, x1 - 0.5, 0.9, 1.9, z0 - 0.02, z0), '#3a3f44']);
      SOLIDS.add(739.5, -579.8, 3.0); }
    { const x0 = 729.0, x1 = 735.6, z0 = -581.5, z1 = -577.8;
      k.plain.push([B(x0, x1, 2.4, 2.6, z0, z1), '#1f4fa8'], [B(x0, x1, 0.6, 2.4, z1 - 0.05, z1), '#1f4fa8']);
      for (const x of [x0, x1]) for (const z of [z0, z1]) k.plain.push([B(x - 0.04, x + 0.04, 0, 2.4, z - 0.04, z + 0.04), '#9aa0a5']);
      SOLIDS.add(732.3, -579.6, 2.4); }
    { const px = X(744.2), pz = Z(-578.4), h = 9;
      k.plain.push([new THREE.CylinderGeometry(0.17, 0.25, h, 7).translate(px, h / 2, pz), '#8a7d6b']);
      for (let i = 0; i < 11; i++) k.plain.push([new THREE.ConeGeometry(0.45, 3.6, 3).rotateX(Math.PI / 2).translate(0, 0, 1.8).scale(1, 0.22, 1).rotateX(0.25 + (i % 3) * 0.2).rotateY((i / 11) * Math.PI * 2).translate(px, h + 0.2, pz), '#4c8a2f']);
      SOLIDS.add(744.2, -578.4, 0.3); }
    c.push([B(754.5, 760.0, 0, 2.6, -581.2, -578.0), WALL]);
    k.plain.push([B(754.4, 760.1, 2.6, 2.8, -581.3, -577.9), '#5b3f8a']);
    for (let x = 755; x < 759.5; x += 0.9) k.plain.push([B(x, x + 0.7, 0.2, 2.2, -581.25, -581.2), '#a9adb1']);
    SOLIDS.add(757.2, -579.6, 2.5);
    // the short white wall round the site (the black line), the open way in on the south (blue)
    const wall = (ax: number, az: number, bx: number, bz: number) => {
      const len = Math.hypot(bx - ax, bz - az), a = Math.atan2(bz - az, bx - ax);
      c.push([new THREE.BoxGeometry(len, 1.0, 0.22).rotateY(-a).translate(X((ax + bx) / 2), 0.5, Z((az + bz) / 2)), WALL]);
      c.push([new THREE.BoxGeometry(len, 0.08, 0.3).rotateY(-a).translate(X((ax + bx) / 2), 1.04, Z((az + bz) / 2)), '#d6d3cb']);
      const n = Math.ceil(len / 0.8);
      for (let i = 0; i <= n; i++) SOLIDS.add(ax + ((bx - ax) * i) / n, az + ((bz - az) * i) / n, 0.2);
    };
    wall(714, -576.5, 761.0, -576.5); wall(766.0, -576.5, 812, -576.5); wall(714, -576.5, 714, -628); wall(714, -628, 776, -650); wall(776, -650, 812, -650);
    const m = new THREE.Mesh(merge(c), concrete(0.2)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m);
  },
};

let herrMat: THREE.MeshStandardMaterial | null = null;
/** red-brown brick pavers laid herringbone, one tile 4 m */
function herring() {
  if (herrMat) return herrMat;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#5e3a30'; g.fillRect(0, 0, 256, 256);
  const cols = ['#8e4a3a', '#97513f', '#83463a', '#9b5845', '#7e4334'];
  for (let i = -4; i < 12; i++) for (let j = -4; j < 24; j++) {
    const x = i * 25.6 + (j % 2) * 12.8, y = j * 12.8;
    g.fillStyle = cols[(i * 7 + j * 3 + 100) % 5];
    if ((i + j) % 2) g.fillRect(x + 1, y + 1, 23.6, 10.8); else g.fillRect(x + 1, y + 1, 10.8, 23.6);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  herrMat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
  return herrMat;
}

/** the Shell filling station, its shop, the tyre and mechanic shop */
export const fuelSite = createSite('fuel-station', [shop, mechanic, forecourt]);
