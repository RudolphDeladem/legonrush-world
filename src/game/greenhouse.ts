// The greenhouse north of the building with the stone base and the solar panels, east of the road past the K. Folson
// Building (the owner's marked aerial and street photo): a long tunnel of clear plastic film on hoops, its plants on
// benches seen through it, the door, a vent and a fan box in its south end; a black water tank on a steel stand by
// that end. It stands on the mapped outline (9.8 by 29.5 m, its long side a little east of north).
import * as THREE from 'three';
import { merge, type Part } from './modelkit';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { concrete } from './concrete';
import { SOLIDS } from './solids';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#eeeeee') };
// the outline's corners: (114.2, -409.3), (123.8, -411.4), (130.2, -382.6), (120.6, -380.5)
const O: [number, number] = [122.2, -396.0];
const L = 29.5, W = 9.8, SIDE = 0.8, RISE = 3.7;
/** the tunnel's section: up the vertical side, over the hoop, down the other side (local z, y) */
const section = (n = 18): [number, number][] => {
  const p: [number, number][] = [[-W / 2, 0]];
  for (let i = 0; i <= n; i++) { const a = Math.PI - (i / n) * Math.PI; p.push([(W / 2) * Math.cos(a), SIDE + RISE * Math.sin(a)]); }
  p.push([W / 2, 0]);
  return p;
};

const greenhouse: Spec = {
  name: 'greenhouse', axis: [-0.217, -0.976], origin: O, storey: 3, style: PLAIN, roofColor: '#cccccc', fascia: '#888888', pitch: 0.3,
  replaces: [O],
  blocks: [],
  keep: [[-L / 2 - 3.5, L / 2 + 0.5, -W / 2 - 0.5, W / 2 + 2.5]],
  extras: (k: Kit) => {
    const c: Part[] = [];
    const sec = section(), x0 = -L / 2, x1 = L / 2;
    // the film: the skin along the tunnel and its two ends, clear enough to see the benches inside
    const pos: number[] = [], idx: number[] = [];
    sec.forEach(([z, y]) => pos.push(x0, y, z, x1, y, z));
    for (let i = 0; i < sec.length - 1; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    const skin = new THREE.BufferGeometry();
    skin.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); skin.setIndex(idx); skin.computeVertexNormals();
    const shape = new THREE.Shape(sec.map(([z, y]) => new THREE.Vector2(z, y)));
    const end = new THREE.ShapeGeometry(shape);
    const ends = [end.clone().rotateY(Math.PI / 2).translate(x0, 0, 0), end.clone().rotateY(Math.PI / 2).translate(x1, 0, 0)];
    const film = new THREE.MeshStandardMaterial({ color: '#eef3ef', transparent: true, opacity: 0.38, roughness: 0.5, side: THREE.DoubleSide, depthWrite: false });
    const fm = new THREE.Mesh(merge([[skin, '#ffffff'], ...ends.map((g): Part => [g, '#ffffff'])]), film);
    fm.receiveShadow = true; fm.renderOrder = 2;
    k.meshes.push(fm);
    // the hoops, the purlin along the top, the base rails, the ends' frames
    for (let x = x0; x <= x1 + 1e-3; x += 2.45) {
      for (let i = 0; i < sec.length - 1; i++) {
        const [za, ya] = sec[i], [zb, yb] = sec[i + 1], l = Math.hypot(zb - za, yb - ya);
        c.push([new THREE.BoxGeometry(0.05, l + 0.02, 0.05).rotateX(Math.atan2(zb - za, yb - ya)).translate(x, (ya + yb) / 2, (za + zb) / 2), '#d7dad8']);
      }
    }
    for (const [z, y] of [[0, SIDE + RISE], [-W / 2, 0.1], [W / 2, 0.1], [-W / 2, SIDE], [W / 2, SIDE], [-W * 0.35, SIDE + RISE * 0.72], [W * 0.35, SIDE + RISE * 0.72]]) c.push([new THREE.BoxGeometry(L, 0.06, 0.06).translate(0, y, z), '#c9ccca']);
    // the south end (x0): the door in a dark frame, a white louvred vent, a grey fan box at the foot
    c.push([new THREE.BoxGeometry(0.08, 2.3, 0.08).translate(x0, 1.15, -0.95), '#55595c'], [new THREE.BoxGeometry(0.08, 2.3, 0.08).translate(x0, 1.15, 0.95), '#55595c'], [new THREE.BoxGeometry(0.08, 0.08, 1.98).translate(x0, 2.3, 0), '#55595c']);
    k.plain.push([new THREE.BoxGeometry(0.06, 0.6, 0.7).translate(x0 - 0.04, 2.0, 2.6), '#f2f2ee']);
    for (let y = 1.75; y < 2.3; y += 0.1) k.plain.push([new THREE.BoxGeometry(0.02, 0.02, 0.66).translate(x0 - 0.08, y, 2.6), '#a9adab']);
    k.plain.push([new THREE.BoxGeometry(0.5, 0.65, 0.8).translate(x0 - 0.3, 0.33, -3.2), '#b9bcbc']);
    // inside: two long benches with seedlings and potted plants, a path down the middle
    for (const z of [-2.6, 2.6]) {
      c.push([new THREE.BoxGeometry(L - 2, 0.06, 2.4).translate(0, 0.85, z), '#9a9f9c']);
      for (let x = x0 + 1.5; x < x1 - 1; x += 2.4) c.push([new THREE.BoxGeometry(0.06, 0.85, 2.2).translate(x, 0.42, z), '#8a8f8c']);
      for (let x = x0 + 1.4; x < x1 - 1.2; x += 0.6) for (let dz = -0.9; dz <= 0.9; dz += 0.6) {
        k.plain.push([new THREE.IcosahedronGeometry(0.2 + ((x * 7 + dz * 3) % 1 + 1) * 0.04, 0).scale(1, 0.8, 1).translate(x, 1.05, z + dz), ['#4f8a34', '#5e9a3c', '#3f7a2c'][Math.abs(Math.round(x * 3 + dz * 5)) % 3]]);
      }
    }
    k.plain.push([new THREE.BoxGeometry(L - 1, 0.02, 1.2).translate(0, 0.03, 0), '#8f8a80']);
    // the black water tank on its steel stand by the south end
    const tx = x0 - 1.4, tz = 3.6, th = 1.7;
    for (const [dx, dz] of [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]]) c.push([new THREE.BoxGeometry(0.06, th, 0.06).translate(tx + dx, th / 2, tz + dz), '#2a2a2a']);
    c.push([new THREE.BoxGeometry(1.25, 0.08, 1.25).translate(tx, th, tz), '#2a2a2a']);
    k.plain.push([new THREE.CylinderGeometry(0.6, 0.6, 1.25, 16).translate(tx, th + 0.67, tz), '#1c1c1c']);
    // the free-ridden bike stops at the film
    for (let x = x0; x <= x1; x += 0.5) for (const z of [-W / 2, W / 2]) SOLIDS.add(...k.world(x, z), 0.3);
    for (let z = -W / 2; z <= W / 2; z += 0.5) for (const x of [x0, x1]) SOLIDS.add(...k.world(x, z), 0.3);
    SOLIDS.add(...k.world(tx, tz), 0.9);
    const m = new THREE.Mesh(merge(c), concrete(0.15));
    m.castShadow = true; m.receiveShadow = true;
    k.meshes.push(m);
  },
};

/** the greenhouse east of the road past the K. Folson Building */
export const greenhouseSite = createSite('greenhouse', [greenhouse]);
