// The School of Public Health (College of Health Sciences), from the owner's aerial and photo (block engine:
// blocks.ts). The buildings stand at an angle to the map grid; each is built in its own frame.
//
// Cream walls, big windows in dark frames (barred on the ground floor), a dark fascia under low hipped roofs of
// terracotta tiles. The long west and south wings are two floors (marked yellow); the wing along the east car park
// and the block north of it are three floors (marked white). The three-floor east front has the school's name over
// a forward bay in the middle, its door at the north end and a tall lattice screen beside it; the two-floor west
// wing has a door toward the west car park (both doors circled blue).
import * as THREE from 'three';
import { box } from './modelkit';
import { PL, createSite, render, type Block, type Kit, type Spec, type Style } from './blocks';
import { rectsOf } from './rectilinear';

const CREAM = '#efe7d3', FRAME = '#26221f', FASCIA = '#2b2622', TILE = '#a5522f';
/** a big window in a dark frame, glazing bars; on the ground floor, bars across it */
function sphWindow(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, barred: boolean) {
  g.fillStyle = FRAME; g.fillRect(x - 5, y - 5, w + 10, h + 10);
  const gl = g.createLinearGradient(0, y, 0, y + h);
  gl.addColorStop(0, '#4a5866'); gl.addColorStop(1, '#151b22');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = FRAME; g.fillRect(x + w / 2 - 2, y, 4, h); g.fillRect(x, y + h * 0.3, w, 4);
  if (barred) { g.fillStyle = 'rgba(30,28,26,0.85)'; for (let bx = x + 10; bx < x + w; bx += 14) g.fillRect(bx, y, 3, h); }
}
const SPH_WALL: Style = {
  bay: 3.4, up: [[58, 60, 140, 120]], ground: [[58, 256 + 66, 140, 120]],
  draw: (g) => {
    render(g, CREAM);
    sphWindow(g, 58, 60, 140, 120, false);
    sphWindow(g, 58, 256 + 66, 140, 120, true);
  },
};

interface Wing { id: string; name: string; floors: number; ring: [number, number][]; door?: [number, number]; front?: boolean }
const WINGS: Wing[] = [
  // the two-floor wings, west and south (OSM way 353697511)
  { id: '353697511', name: 'School of Public Health, west and south wings', floors: 2, door: [437.2, 1650.0],
    ring: [[453.6, 1621.2], [459.8, 1632.6], [453.1, 1636.2], [458.9, 1647.1], [461.9, 1645.5], [470.8, 1662.1], [466.7, 1664.3], [468.5, 1667.7], [502.2, 1649.9], [507.3, 1659.1], [499.0, 1663.5], [504.6, 1673.9], [495.5, 1678.7], [490.0, 1668.5], [471.2, 1678.4], [472.7, 1681.0], [464.9, 1685.2], [464.0, 1683.6], [448.0, 1692.1], [442.7, 1682.2], [457.1, 1674.6], [445.5, 1652.9], [442.7, 1654.4], [437.6, 1645.1], [440.3, 1643.6], [433.9, 1631.7]] },
  // the three-floor wing along the east car park, its front (way 714954252)
  { id: '714954252', name: 'School of Public Health', floors: 3, door: [510.0, 1632.0], front: true,
    ring: [[507.3, 1659.1], [512.8, 1669.0], [523.2, 1663.3], [496.7, 1615.8], [486.4, 1621.5], [502.2, 1649.9]] },
  // the three-floor block north of it (way 714954251)
  { id: '714954251', name: 'School of Public Health, north block', floors: 3,
    ring: [[480.1, 1619.4], [472.4, 1606.6], [494.3, 1593.6], [502.0, 1606.5]] },
];

function wing(w: Wing): Spec {
  const n = w.ring.length;
  let cx = 0, cz = 0;
  for (const [x, z] of w.ring) { cx += x / n; cz += z / n; }
  let best = 0, ang = 0;
  for (let i = 0; i < n; i++) {
    const [ax, az] = w.ring[i], [bx, bz] = w.ring[(i + 1) % n], l = Math.hypot(bx - ax, bz - az);
    if (l > best) { best = l; ang = Math.atan2(bz - az, bx - ax); }
  }
  ang = ((ang % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
  const ux = Math.cos(ang), uz = Math.sin(ang);
  const loc = (x: number, z: number): [number, number] => [(x - cx) * ux + (z - cz) * uz, -(x - cx) * uz + (z - cz) * ux];
  const ring = w.ring.map(([x, z]) => loc(x, z));
  const blocks: Block[] = rectsOf(ring, 1.0, 1.5).map(([x0, x1, z0, z1]) => ({ x0, x1, z0, z1, floors: w.floors }));
  // the door: on the outline's side nearest the marked point, facing out
  let door: { x: number; z: number; nx: number; nz: number; ex: number; ez: number; a: [number, number]; b: [number, number] } | null = null;
  if (w.door) {
    const [px, pz] = loc(...w.door);
    let bd = Infinity;
    for (let i = 0; i < n; i++) {
      const a = ring[i], b = ring[(i + 1) % n], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz);
      const t = Math.max(0.15, Math.min(0.85, ((px - a[0]) * dx + (pz - a[1]) * dz) / (l * l)));
      const qx = a[0] + dx * t, qz = a[1] + dz * t, d = Math.hypot(px - qx, pz - qz);
      if (d < bd) {
        bd = d;
        let nx = dz / l, nz = -dx / l;
        // outward: away from the middle of the nearest block
        const blk = blocks.reduce((m, bk) => (Math.hypot((bk.x0 + bk.x1) / 2 - qx, (bk.z0 + bk.z1) / 2 - qz) < Math.hypot((m.x0 + m.x1) / 2 - qx, (m.z0 + m.z1) / 2 - qz) ? bk : m), blocks[0]);
        if ((qx - (blk.x0 + blk.x1) / 2) * nx + (qz - (blk.z0 + blk.z1) / 2) * nz < 0) { nx = -nx; nz = -nz; }
        door = { x: qx, z: qz, nx, nz, ex: dx / l, ez: dz / l, a, b };
      }
    }
  }
  const b0 = blocks[0];
  const keep: [number, number, number, number][] = door ? [[door.x - 3 + door.nx * 2, door.x + 3 + door.nx * 2, door.z - 3 + door.nz * 2, door.z + 3 + door.nz * 2]] : [];
  return {
    name: w.name,
    axis: [ux, uz], origin: [cx, cz], storey: 3.5, style: SPH_WALL, roofColor: TILE, fascia: FASCIA, pitch: 0.35,
    replaces: [[cx + ((b0.x0 + b0.x1) / 2) * ux - ((b0.z0 + b0.z1) / 2) * uz, cz + ((b0.x0 + b0.x1) / 2) * uz + ((b0.z0 + b0.z1) / 2) * ux]],
    blocks,
    keep,
    extras: (k: Kit) => {
      const e = k.wallTop(w.floors);
      // the dark fascia band round every block under the eaves
      for (const b of blocks) for (const [a0, a1, c0, c1] of [[b.x0, b.x1, b.z0 - 0.05, b.z0], [b.x0, b.x1, b.z1, b.z1 + 0.05], [b.x0 - 0.05, b.x0, b.z0, b.z1], [b.x1, b.x1 + 0.05, b.z0, b.z1]]) k.plain.push([box(a0, a1, e - 0.55, e, c0, c1), FASCIA]);
      if (!door) return;
      const face = Math.atan2(door.nx, door.nz);
      const at = (geo: THREE.BufferGeometry, along: number, out: number, y: number) =>
        geo.rotateY(face).translate(door!.x + door!.ex * along + door!.nx * out, y, door!.z + door!.ez * along + door!.nz * out);
      // a recessed doorway in a light surround, a step and a ramp
      k.plain.push([at(new THREE.BoxGeometry(2.4, 2.9, 0.12), 0, 0.06, PL + 1.45), '#f6f2e8']);
      k.plain.push([at(new THREE.BoxGeometry(1.8, 2.4, 0.06), 0, 0.14, PL + 1.2), '#1c1f24']);
      k.plain.push([at(new THREE.BoxGeometry(2.6, 0.2, 1.4), 0, 0.8, 0.1), '#c9c1b2']);
      if (!w.front) return;
      // the front: the forward bay with the school's name in the middle, and the lattice screen by the door
      const [ax, az] = door.a, [bx, bz] = door.b;
      const mx = (ax + bx) / 2, mz = (az + bz) / 2, len = Math.hypot(bx - ax, bz - az);
      const mid = (geo: THREE.BufferGeometry, out: number, y: number) => geo.rotateY(face).translate(mx + door!.nx * out, y, mz + door!.nz * out);
      k.plain.push([mid(new THREE.BoxGeometry(9, e - PL, 0.7), 0.35, PL + (e - PL) / 2), CREAM]);
      for (let f = 0; f < w.floors; f++) for (const s of [-1, 1]) {
        k.plain.push([mid(new THREE.BoxGeometry(3.5, 2.0, 0.06).translate(s * 2.1, 0, 0), 0.71, PL + f * 3.5 + 1.7), FRAME]);
        k.plain.push([mid(new THREE.BoxGeometry(3.2, 1.7, 0.06).translate(s * 2.1, 0, 0), 0.74, PL + f * 3.5 + 1.7), '#3a4752']);
        k.plain.push([mid(new THREE.BoxGeometry(0.08, 1.7, 0.06).translate(s * 2.1, 0, 0), 0.78, PL + f * 3.5 + 1.7), FRAME]);
      }
      k.signs.push({ text: 'SCHOOL OF PUBLIC HEALTH', x: mx + door.nx * 0.76, y: PL + 3.5 * 2 - 0.25, z: mz + door.nz * 0.76, ry: face, w: 6.5, colors: ['#ffffff', '#1f2a66'] });
      // the lattice screen: a tall grid of dark bars standing off the wall, beside the door toward the end
      const side = Math.sign((door.x - mx) * door.ex + (door.z - mz) * door.ez) || 1;
      const lx = side * Math.min(len / 2 - 1.5, Math.abs((door.x - mx) * door.ex + (door.z - mz) * door.ez) + 3.2);
      const lat = (geo: THREE.BufferGeometry) => geo.rotateY(face).translate(mx + door!.ex * lx + door!.nx * 0.3, 0, mz + door!.ez * lx + door!.nz * 0.3);
      for (let i = 0; i <= 4; i++) k.plain.push([lat(new THREE.BoxGeometry(0.08, e - 3.6, 0.08).translate(-1 + i * 0.5, 3.6 + (e - 3.6) / 2 - 0.4, 0)), FRAME]);
      for (let y = 3.6; y < e - 0.6; y += 0.7) k.plain.push([lat(new THREE.BoxGeometry(2.08, 0.08, 0.08).translate(0, y, 0)), FRAME]);
      // air-conditioning units along the foot of the front
      for (let t = -len / 2 + 2; t < len / 2 - 2; t += 3.4) k.plain.push([new THREE.BoxGeometry(0.8, 0.6, 0.35).rotateY(face).translate(mx + door.ex * t + door.nx * 0.3, 0.35, mz + door.ez * t + door.nz * 0.3), '#e8e8e6']);
    },
  };
}

/** the School of Public Health's three buildings */
export const publicHealth = createSite('publichealth', WINGS.map(wing));
