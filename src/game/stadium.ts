// The University of Ghana Sports Stadium and its neighbours, from the owner's aerial and photos (block engine:
// blocks.ts).
//
// - The stadium: a blue running track round a green football pitch, inside a bowl of green seating in four stands
//   (north and south curves, east side) with gaps at the corners for the entrances, "UG SPORTS" picked out in
//   white seats; the outer wall banded in red, white and grey stripes over a blue base, with leaping athletes on it;
//   four floodlight masts. On the west side, the main stand: red seats with a blue section in the middle in front of
//   a three-storey white building, under a raised roof cantilevered out over the seats. The main entrance is there.
// - South-west, the training track: blue, round a grass pitch (mapped outline).
// - North-west, the swimming pool on its white deck, and the two blue tennis courts in their green surround.
import * as THREE from 'three';
import { WHITE, box, canvas } from './modelkit';
import { createSite, render, window_, type Kit, type Spec, type Style } from './blocks';

// ---------- the stadium's plan: the track's outer edge, two straights along z and two half circles ----------
const CX = 776.5, CN = 1374, CS = 1448.5, R0 = 51;
const LS = CS - CN, LA = Math.PI * R0, PER = 2 * LS + 2 * LA;
const O: [number, number] = [CX, (CN + CS) / 2];
/** a point of the plan at arc length s along the track's outer edge (clockwise from the north end of the east
 *  straight), d metres outward; returns local x, z and the outward normal */
function at(s: number, d: number): [number, number, number, number] {
  s = ((s % PER) + PER) % PER;
  let x: number, z: number, nx: number, nz: number;
  if (s < LS) { x = CX + R0; z = CN + s; nx = 1; nz = 0; }
  else if (s < LS + LA) { const t = (s - LS) / R0; nx = Math.cos(t); nz = Math.sin(t); x = CX + R0 * nx; z = CS + R0 * nz; }
  else if (s < 2 * LS + LA) { x = CX - R0; z = CS - (s - LS - LA); nx = -1; nz = 0; }
  else { const t = Math.PI + (s - 2 * LS - LA) / R0; nx = Math.cos(t); nz = Math.sin(t); x = CX + R0 * nx; z = CN + R0 * nz; }
  return [x + nx * d - O[0], z + nz * d - O[1], nx, nz];
}
/** where each part of the bowl runs, by arc length (gaps of about 12 m at the corners for the entrances) */
const EAST: [number, number] = [6, 70];
const SOUTH: [number, number] = [LS + 0.12 * R0, LS + LA - 0.12 * R0];
const WEST: [number, number] = [LS + LA + 4.5, LS + LA + 68.5];
const NORTH: [number, number] = [2 * LS + LA + 0.12 * R0, PER - 0.12 * R0];

/** triangles collected by colour, each turned to face the way asked */
class Tris {
  by = new Map<string, number[]>();
  tri(col: string, a: number[], b: number[], c: number[], want: number[]) {
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const flip = n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0;
    const arr = this.by.get(col) ?? [];
    arr.push(...a, ...(flip ? c : b), ...(flip ? b : c));
    this.by.set(col, arr);
  }
  quad(col: string, a: number[], b: number[], c: number[], d: number[], want: number[]) { this.tri(col, a, b, c, want); this.tri(col, a, c, d, want); }
  into(k: Kit) {
    for (const [col, arr] of this.by) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
      g.computeVertexNormals();
      k.plain.push([g, col]);
    }
  }
}

const TIERS = 12, D0 = 4, D1 = 22, RISE = 0.62, H0 = 1.2;
const tierH = (j: number) => H0 + j * RISE;
/** the seating of one stand from s0 to s1: tiers of seats stepping up and out, a back walkway and the outer wall */
function stand(T: Tris, [s0, s1]: [number, number], seat: (s: number, j: number) => [string, string], outerWall: boolean) {
  const n = Math.max(2, Math.ceil((s1 - s0) / 2)), dd = (D1 - D0) / TIERS;
  for (let i = 0; i < n; i++) {
    const sa = s0 + ((s1 - s0) * i) / n, sb = s0 + ((s1 - s0) * (i + 1)) / n;
    for (let j = 0; j <= TIERS; j++) {
      const da = D0 + j * dd, db = j === TIERS ? D1 + 2 : da + dd, h = tierH(j), hp = j ? tierH(j - 1) : 0;
      const [tread, riser] = j === TIERS ? ['#d9d9d4', '#2a6fb5'] : seat((sa + sb) / 2, j);
      const [ax, az, nx, nz] = at(sa, da), [bx, bz] = at(sb, da), [cx, cz] = at(sb, db), [dx, dz] = at(sa, db);
      T.quad(tread, [ax, h, az], [bx, h, bz], [cx, h, cz], [dx, h, dz], [0, 1, 0]);
      T.quad(riser, [ax, hp, az], [bx, hp, bz], [bx, h, bz], [ax, h, az], [-nx, 0, -nz]);
    }
    // the low front wall at the foot of the seats
    const [fx, fz, nx, nz] = at(sa, D0 - 0.3), [gx, gz] = at(sb, D0 - 0.3);
    T.quad('#2a6fb5', [fx, 0, fz], [gx, 0, gz], [gx, H0, gz], [fx, H0, fz], [-nx, 0, -nz]);
    const [hx, hz] = at(sb, D0), [ix, iz] = at(sa, D0);
    T.quad('#f2f2ee', [fx, H0, fz], [gx, H0, gz], [hx, H0, hz], [ix, H0, iz], [0, 1, 0]);
    if (!outerWall) continue;
    // the top of the outer wall
    const top = tierH(TIERS) + 0.9, [ox, oz] = at(sa, D1 + 2), [px, pz] = at(sb, D1 + 2), [qx, qz] = at(sb, D1 + 2.4), [rx, rz] = at(sa, D1 + 2.4);
    T.quad('#f2f2ee', [ox, top, oz], [px, top, pz], [qx, top, qz], [rx, top, rz], [0, 1, 0]);
    T.quad('#f2f2ee', [ox, tierH(TIERS), oz], [px, tierH(TIERS), pz], [px, top, pz], [ox, top, oz], [-nx, 0, -nz]);
  }
}
/** the outer wall's band: red, white and grey stripes over a blue base, leaping athletes here and there */
let bandTex: THREE.Texture | null = null;
const band = () => (bandTex ??= canvas(256, 128, (g) => {
  g.fillStyle = '#f1f1ee'; g.fillRect(0, 0, 256, 128);
  for (let x = 0; x < 256; x += 32) { g.fillStyle = '#c4262e'; g.fillRect(x + 2, 8, 14, 96); g.fillStyle = '#9ea2a6'; g.fillRect(x + 20, 8, 6, 96); }
  g.fillStyle = '#2a5fae'; g.fillRect(0, 104, 256, 24);
  g.fillStyle = '#1b1b1b';
  // an athlete leaping: head, body, arms and legs
  g.beginPath(); g.arc(122, 34, 5, 0, Math.PI * 2); g.fill();
  g.lineWidth = 5; g.lineCap = 'round'; g.strokeStyle = '#1b1b1b';
  g.beginPath(); g.moveTo(120, 40); g.lineTo(112, 66); g.moveTo(118, 46); g.lineTo(136, 40); g.moveTo(117, 48); g.lineTo(100, 44);
  g.moveTo(112, 66); g.lineTo(128, 78); g.moveTo(112, 66); g.lineTo(98, 86); g.stroke();
}));
function outerBand(k: Kit, [s0, s1]: [number, number]) {
  const n = Math.max(2, Math.ceil((s1 - s0) / 2)), h = tierH(TIERS) + 0.9, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const s = s0 + ((s1 - s0) * i) / n, [x, z] = at(s, D1 + 2.4), u = (s - s0) / 8;
    pos.push(x, 0, z, x, h, z); uv.push(u, 0, u, 1);
    if (i) { const b = (i - 1) * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: band(), roughness: 0.8, side: THREE.DoubleSide }));
  m.castShadow = true; m.receiveShadow = true;
  k.meshes.push(m);
}
/** a flat shape on the ground from local x, z points (holes optional), y up */
function ground(k: Kit, pts: [number, number][], y: number, col: string, holes: [number, number][][] = []) {
  const sh = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  for (const h of holes) sh.holes.push(new THREE.Path(h.map(([x, z]) => new THREE.Vector2(x, -z))));
  k.plain.push([new THREE.ShapeGeometry(sh, 2).rotateX(-Math.PI / 2).translate(0, y, 0), col]);
}
const loop = (d: number, step = 2): [number, number][] => { const out: [number, number][] = []; for (let s = 0; s < PER; s += step) { const [x, z] = at(s, d); out.push([x, z]); } return out; };
/** a thin white line on the ground along a closed loop of points */
function line(k: Kit, pts: [number, number][], y: number, w = 0.08, closed = true) {
  const T = new Tris();
  for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % pts.length], l = Math.hypot(bx - ax, bz - az) || 1, nx = (-(bz - az) / l) * w / 2, nz = ((bx - ax) / l) * w / 2;
    T.quad('#f4f4f0', [ax + nx, y, az + nz], [bx + nx, y, bz + nz], [bx - nx, y, bz - nz], [ax - nx, y, az - nz], [0, 1, 0]);
  }
  T.into(k);
}

const MAIN_WALL: Style = {
  bay: 3.2, up: [[30, 40, 196, 150]], ground: [[30, 256 + 40, 196, 160]],
  draw: (g) => { render(g, '#f3f3f0'); window_(g, [30, 40, 196, 150], '#e2e4e6', 3, 0); window_(g, [30, 256 + 40, 196, 160], '#e2e4e6', 3, 0); },
};

const stadium: Spec = {
  name: 'University of Ghana Sports Stadium',
  axis: [1, 0], origin: O, storey: 3.8, style: MAIN_WALL, roofColor: '#d9d9d4', fascia: WHITE, pitch: 0.1,
  // the stand outlines (OSM) are drawn here
  replaces: [[708, 1412], [846, 1412], [778, 1299], [777, 1526]],
  // the mapped track and pitches are drawn here
  covers: [[731, 1410], [776, 1411]],
  // the main stand's building: three floors behind the seats
  blocks: [{ x0: 685.5 - CX, x1: 707.5 - CX, z0: 1380 - O[1], z1: 1444 - O[1], floors: 3, roof: 'flat' }],
  // the bowl and the main stand (the parking strips round it stay free for cars)
  keep: [[-91, 76, -115, 116]],
  extras: (k: Kit) => {
    // ---------- the field: the pitch inside the track, the blue track and the blue apron to the stands ----------
    ground(k, loop(-11.5), 0.03, '#4c9a3c');
    ground(k, loop(D0 - 0.3), 0.025, '#2f62b3', [loop(-11.5)]);
    for (let l = 1; l <= 7; l++) line(k, loop(-11.5 + l * 1.22, 3), 0.045, 0.06);
    line(k, loop(-11.5, 3), 0.045); line(k, loop(0, 3), 0.045);
    // the football pitch: touchlines, halfway line, centre circle, penalty areas and goals
    const hx = 34, hz = 52.5;
    line(k, [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]], 0.05, 0.12);
    line(k, [[-hx, 0], [hx, 0]], 0.05, 0.12, false);
    const circ: [number, number][] = []; for (let i = 0; i < 48; i++) circ.push([9.15 * Math.cos((i / 48) * Math.PI * 2), 9.15 * Math.sin((i / 48) * Math.PI * 2)]);
    line(k, circ, 0.05, 0.12);
    for (const s of [-1, 1]) {
      line(k, [[-20.15, s * hz], [-20.15, s * (hz - 16.5)], [20.15, s * (hz - 16.5)], [20.15, s * hz]], 0.05, 0.12, false);
      line(k, [[-9.16, s * hz], [-9.16, s * (hz - 5.5)], [9.16, s * (hz - 5.5)], [9.16, s * hz]], 0.05, 0.12, false);
      for (const x of [-3.66, 3.66]) k.plain.push([new THREE.CylinderGeometry(0.06, 0.06, 2.44, 8).translate(x, 1.22, s * hz), WHITE]);
      k.plain.push([new THREE.CylinderGeometry(0.06, 0.06, 7.32, 8).rotateZ(Math.PI / 2).translate(0, 2.44, s * hz), WHITE]);
    }
    // ---------- the bowl ----------
    const T = new Tris();
    const green = (): [string, string] => ['#1f8a4c', '#17683a'];
    stand(T, EAST, green, true);
    stand(T, SOUTH, green, true);
    stand(T, NORTH, green, true);
    // the main stand: red seats, a blue section in the middle
    const wm = (WEST[0] + WEST[1]) / 2;
    stand(T, WEST, (s) => (Math.abs(s - wm) < 9 ? ['#2a5fae', '#1f4785'] : ['#c4262e', '#931c22']), false);
    T.into(k);
    for (const part of [EAST, SOUTH, NORTH]) outerBand(k, part);
    // "UG SPORTS" in white seats across the east stand
    const words = canvas(512, 64, (g) => { g.clearRect(0, 0, 512, 64); g.fillStyle = '#ffffff'; g.font = 'bold 54px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('U G   S P O R T S', 256, 34); });
    const alpha = Math.atan(RISE / ((D1 - D0) / TIERS)), [ex, ez] = at((EAST[0] + EAST[1]) / 2, 13);
    const ws = new THREE.Mesh(new THREE.PlaneGeometry(40, 5).rotateY(-Math.PI / 2).rotateZ(-(Math.PI / 2 - alpha)), new THREE.MeshStandardMaterial({ map: words, transparent: true, alphaTest: 0.4, roughness: 0.8 }));
    ws.position.set(ex, tierH(6) + 0.25, ez);
    k.meshes.push(ws);
    // ---------- the main stand: the raised roof cantilevered out over the seats from the building's top ----------
    const mx0 = 685.5 - CX, roofFront = 716 - CX, zb0 = 1378 - O[1], zb1 = 1446 - O[1], yb = 14.2, yf = 16.6;
    const len = roofFront - mx0, ang = Math.atan2(yf - yb, len);
    k.plain.push([new THREE.BoxGeometry(Math.hypot(len, yf - yb), 0.45, zb1 - zb0).rotateZ(ang).translate((mx0 + roofFront) / 2, (yb + yf) / 2, (zb0 + zb1) / 2), '#e9e9e6']);
    k.plain.push([new THREE.BoxGeometry(0.3, 1.1, zb1 - zb0).translate(roofFront, yf - 0.3, (zb0 + zb1) / 2), '#f6f6f3']);
    for (let z = zb0 + 2; z <= zb1 - 2; z += 8) k.plain.push([box(mx0 + 0.5, mx0 + 1.1, 11.8, yb, z - 0.3, z + 0.3), '#f2f2ee']);
    // glass boxes along the top of the building, looking over the seats
    k.glass.push(box(707.5 - CX - 0.1, 707.5 - CX, 9.6, 12.8, zb0 + 6, zb1 - 6));
    // the main entrance on the west face: a canopy over glass doors
    const wx = mx0, wz = 1414 - O[1];
    k.plain.push([box(wx - 0.06, wx, 0.4, 3.2, wz - 3, wz + 3), '#2b3138']);
    k.plain.push([box(wx - 3, wx, 3.4, 3.7, wz - 4.5, wz + 4.5), '#e9e9e6']);
    k.signs.push({ text: 'UNIVERSITY OF GHANA SPORTS STADIUM', x: wx - 0.08, y: 9.5, z: wz, ry: -Math.PI / 2, w: 14, colors: ['#f3f3f0', '#1d2a6b'] });
    // ---------- floodlight masts outside the corners ----------
    for (const s of [LS + 0.25 * LA, LS + 0.75 * LA, 2 * LS + LA + 0.25 * LA, 2 * LS + LA + 0.75 * LA]) {
      const [x, z, nx, nz] = at(s, 30), h = 36;
      k.plain.push([new THREE.CylinderGeometry(0.35, 0.6, h, 10).translate(x, h / 2, z), '#b9bcbf']);
      k.plain.push([new THREE.BoxGeometry(5, 3, 0.4).rotateY(Math.atan2(-nx, -nz)).translate(x - nx * 0.6, h + 1, z - nz * 0.6), '#d7d9db']);
    }
  },
};

// ---------- the training track (mapped outline): blue round a grass pitch ----------
const TO: [number, number] = [630, 1560];
const TRACK_OUT: [number, number][] = [[549.2, 1516.1], [619.6, 1640.8], [627.9, 1637.1], [633.8, 1640.1], [639.7, 1642.2], [645.7, 1643.4], [655.4, 1643.9], [664.7, 1642.5], [673.1, 1639.6], [681.1, 1635.0], [687.7, 1629.3], [692.5, 1623.6], [696.6, 1616.8], [699.9, 1607.6], [701.3, 1599.3], [701.4, 1592.8], [700.2, 1586.5], [696.1, 1573.0], [657.4, 1502.0], [648.2, 1490.6], [634.9, 1481.2], [622.7, 1477.0], [612.7, 1476.0], [604.3, 1476.7], [597.2, 1478.4], [588.3, 1482.2], [582.6, 1485.8], [576.2, 1491.4], [572.1, 1496.2], [566.7, 1505.3], [562.9, 1517.0], [558.8, 1510.0]];
const TRACK_IN: [number, number][] = [[573.9, 1527.4], [574.6, 1519.4], [576.7, 1512.3], [579.8, 1506.2], [583.6, 1501.0], [587.4, 1497.3], [592.4, 1493.6], [598.4, 1490.6], [605.7, 1488.4], [615.9, 1487.7], [623.2, 1488.8], [629.3, 1490.9], [636.4, 1495.0], [645.0, 1503.2], [687.2, 1579.1], [689.7, 1591.2], [689.4, 1599.5], [686.9, 1608.7], [682.2, 1617.0], [678.2, 1621.5], [672.4, 1626.2], [667.7, 1628.9], [660.0, 1631.6], [651.0, 1632.6], [641.6, 1631.5], [634.3, 1628.9], [628.0, 1625.2], [619.6, 1617.7], [576.3, 1540.8]];
/** a ring offset outward by d (vertex normals of a counter-clockwise or clockwise ring, either way out) */
function offset(ring: [number, number][], d: number): [number, number][] {
  let a = 0; for (let i = 0; i < ring.length; i++) { const [x0, z0] = ring[i], [x1, z1] = ring[(i + 1) % ring.length]; a += x0 * z1 - x1 * z0; }
  const sgn = a > 0 ? -1 : 1;
  return ring.map((p, i) => {
    const q = ring[(i + ring.length - 1) % ring.length], r = ring[(i + 1) % ring.length];
    const e1 = [p[0] - q[0], p[1] - q[1]], e2 = [r[0] - p[0], r[1] - p[1]], l1 = Math.hypot(e1[0], e1[1]) || 1, l2 = Math.hypot(e2[0], e2[1]) || 1;
    const nx = (e1[1] / l1 + e2[1] / l2) / 2, nz = (-e1[0] / l1 - e2[0] / l2) / 2, nl = Math.hypot(nx, nz) || 1;
    return [p[0] + (sgn * nx * d) / nl, p[1] + (sgn * nz * d) / nl];
  });
}
const training: Spec = {
  name: 'University of Ghana Stadium Training Track',
  axis: [1, 0], origin: TO, storey: 3, style: MAIN_WALL, roofColor: '#d9d9d4', fascia: WHITE, pitch: 0.1,
  blocks: [],
  covers: [[630, 1560]],
  keep: [[549 - TO[0], 702 - TO[0], 1475 - TO[1], 1645 - TO[1]]],
  extras: (k: Kit) => {
    const L = (r: [number, number][]) => r.map(([x, z]) => [x - TO[0], z - TO[1]] as [number, number]);
    ground(k, L(TRACK_OUT), 0.025, '#2f62b3', [L(TRACK_IN)]);
    ground(k, L(TRACK_IN), 0.03, '#56a043');
    for (let l = 0; l <= 7; l++) line(k, L(offset(TRACK_IN, l * 1.22)), 0.045, 0.06);
    // the pitch's touchlines (mapped pitch, inset)
    line(k, L(offset([[576.3, 1540.8], [619.6, 1617.7], [687.2, 1579.1], [645.0, 1503.2]], -2)), 0.05, 0.12);
  },
};

// ---------- the swimming pool and the tennis courts, north-west ----------
const PO: [number, number] = [530, 1390];
const poolTennis: Spec = {
  name: 'University of Ghana Swimming Pool and Tennis Courts',
  axis: [1, 0], origin: PO, storey: 3, style: MAIN_WALL, roofColor: '#d9d9d4', fascia: WHITE, pitch: 0.1,
  blocks: [],
  covers: [[518, 1334], [549, 1438]],
  replaces: [[553, 1309]],
  keep: [[484 - PO[0], 562 - PO[0], 1300 - PO[1], 1350 - PO[1]], [529 - PO[0], 569 - PO[0], 1416 - PO[1], 1460 - PO[1]]],
  extras: (k: Kit) => {
    const X = (x: number) => x - PO[0], Z = (z: number) => z - PO[1];
    // the pool (owner's photo): blue water in a deck of orange-red tiles with a white edge, crazy stone paving beyond,
    // a hedge round it; at the west end the orange-red diving tower with four railed platforms and two springboards
    k.plain.push([box(X(486), X(549), 0, 0.12, Z(1319.5), Z(1348.5)), '#bfb3a0']);
    for (let i = 0; i < 60; i++) { const px = 487 + ((i * 37) % 61), pz = 1320.5 + ((i * 13) % 27); k.plain.push([box(X(px), X(px + 0.9), 0.12, 0.13, Z(pz), Z(pz + 0.7)), i % 3 ? '#a99c88' : '#cbbfac']); }
    k.plain.push([box(X(491.5), X(545.5), 0, 0.25, Z(1323.5), Z(1344.5)), '#c8573c']);
    k.plain.push([box(X(495), X(542), 0.1, 0.27, Z(1327), Z(1341)), '#3fb0e6']);
    for (const [a1, b1, c1, d1] of [[494.6, 542.4, 1326.6, 1327], [494.6, 542.4, 1341, 1341.4], [494.6, 495, 1327, 1341], [542, 542.4, 1327, 1341]]) k.plain.push([box(X(a1), X(b1), 0.25, 0.29, Z(c1), Z(d1)), '#f2f0ea']);
    for (let i = 1; i < 6; i++) { const z = Z(1327 + (14 * i) / 6); k.plain.push([box(X(497), X(540), 0.27, 0.28, z - 0.08, z + 0.08), '#1f4f9a']); }
    // starting blocks along the east end
    for (let i = 0; i < 6; i++) { const z = Z(1327 + (14 * (i + 0.5)) / 6); k.plain.push([box(X(542.6), X(543.4), 0.25, 0.85, z - 0.35, z + 0.35), '#eeeae2']); }
    // the diving tower: two orange-red legs, platforms at 3, 5, 7.5 and 10 m reaching out over the water, white rails,
    // a stair up the back; two springboards on plinths beside it
    const tx = X(492.6), tz = Z(1334);
    for (const dz of [-1.6, 1.6]) k.plain.push([box(tx - 2.6, tx - 1.4, 0, 11.2, tz + dz - 0.6, tz + dz + 0.6), '#c8573c']);
    for (const [h, reach] of [[3, 3.2], [5, 3.6], [7.5, 4], [10, 4.4]] as [number, number][]) {
      k.plain.push([box(tx - 2.8, tx + reach, h - 0.45, h, tz - 2.4, tz + 2.4), '#c8573c']);
      for (const [a1, b1, c1, d1] of [[tx - 2.8, tx + reach - 0.6, tz - 2.4, tz - 2.32], [tx - 2.8, tx + reach - 0.6, tz + 2.32, tz + 2.4]]) {
        k.plain.push([box(a1, b1, h + 0.95, h + 1.02, c1, d1), '#f2f2ee']);
        for (let x = a1; x <= b1; x += 0.9) k.plain.push([box(x - 0.03, x + 0.03, h, h + 1.0, c1, d1), '#f2f2ee']);
      }
    }
    for (let i = 0; i < 20; i++) k.plain.push([box(tx - 3.8, tx - 2.6, (i * 10) / 20, (i * 10) / 20 + 0.2, tz + 2.4 - (i % 2) * 0.1, tz + 3.4), '#b44c35']);
    for (const dz of [-4.6, 4.6]) {
      k.plain.push([box(tx - 1.5, tx + 0.5, 0, 1.0, tz + dz - 0.6, tz + dz + 0.6), '#c8573c']);
      k.plain.push([box(tx - 0.5, tx + 4.2, 1.0, 1.1, tz + dz - 0.3, tz + dz + 0.3), '#f4f4f0']);
    }
    // the pool house to the north-east: white walls under a red hipped roof, open on the pool side
    const hx0 = X(547), hx1 = X(560), hz0 = Z(1303), hz1 = Z(1315);
    k.plain.push([box(hx0, hx1, 0, 3.0, hz0, hz0 + 0.25), '#f3f1ec'], [box(hx0, hx0 + 0.25, 0, 3.0, hz0, hz1), '#f3f1ec'], [box(hx1 - 0.25, hx1, 0, 3.0, hz0, hz1), '#f3f1ec']);
    for (const x of [hx0 + 0.2, (hx0 + hx1) / 2, hx1 - 0.2]) k.plain.push([box(x - 0.2, x + 0.2, 0, 3.0, hz1 - 0.4, hz1), '#f3f1ec']);
    k.plain.push([box(hx0 - 0.6, hx1 + 0.6, 2.9, 3.1, hz0 - 0.6, hz1 + 0.6), '#7a3a26']);
    k.plain.push([new THREE.ConeGeometry(Math.hypot(hx1 - hx0, hz1 - hz0) / 2 + 0.8, 2.6, 4).rotateY(Math.PI / 4).scale(1, 1, (hz1 - hz0) / (hx1 - hx0)).translate((hx0 + hx1) / 2, 4.4, (hz0 + hz1) / 2), '#b9502f']);
    // the hedge round the pool's enclosure
    for (const [a1, b1, c1, d1] of [[485, 562, 1318.5, 1319.5], [485, 562, 1348.5, 1349.5], [485, 486, 1319.5, 1348.5]]) k.plain.push([box(X(a1), X(b1), 0, 1.1, Z(c1), Z(d1)), '#3f7a35']);
    // the tennis courts: a green surround, two blue courts with white lines, nets, a wire fence
    k.plain.push([box(X(530), X(568), 0, 0.04, Z(1417), Z(1459)), '#3f8f62']);
    for (const cx of [538, 558.5]) {
      const x0 = X(cx) - 5.49, x1 = X(cx) + 5.49, z0 = Z(1434.5) - 11.89, z1 = Z(1434.5) + 11.89;
      k.plain.push([box(x0, x1, 0.04, 0.06, z0, z1), '#2f62b3']);
      line(k, [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], 0.065, 0.07);
      line(k, [[x0 + 1.37, z0], [x0 + 1.37, z1]], 0.065, 0.06, false); line(k, [[x1 - 1.37, z0], [x1 - 1.37, z1]], 0.065, 0.06, false);
      line(k, [[x0 + 1.37, Z(1434.5) - 6.4], [x1 - 1.37, Z(1434.5) - 6.4]], 0.065, 0.06, false); line(k, [[x0 + 1.37, Z(1434.5) + 6.4], [x1 - 1.37, Z(1434.5) + 6.4]], 0.065, 0.06, false);
      line(k, [[X(cx), Z(1434.5) - 6.4], [X(cx), Z(1434.5) + 6.4]], 0.065, 0.06, false);
      k.plain.push([box(x0 - 0.5, x1 + 0.5, 0, 1.0, Z(1434.5) - 0.02, Z(1434.5) + 0.02), '#2a2a2a']);
    }
    for (const [a, b, c, d] of [[530, 568, 1417, 1417.1], [530, 568, 1458.9, 1459], [530, 530.1, 1417, 1459], [567.9, 568, 1417, 1459]]) {
      for (let t = 0; t <= 1.001; t += 0.1) k.plain.push([box(X(a + (b - a) * t) - 0.04, X(a + (b - a) * t) + 0.04, 0, 3.4, Z(c + (d - c) * t) - 0.04, Z(c + (d - c) * t) + 0.04), '#bfc3c7']);
      k.plain.push([box(X(a), X(b), 3.3, 3.4, Z(c), Z(d)), '#bfc3c7']);
    }
  },
};

/** the stadium, its training track, the pool and the tennis courts */
export const stadiumSite = createSite('stadium', [stadium, training, poolTennis]);
