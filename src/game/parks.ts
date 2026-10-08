// Open grounds the owner has described, drawn as models over their mapped areas (block engine: blocks.ts).
//
// The football park between the Akuafo Hall annexes and the Mensah Sarbah Hall annexes: worn bare soil with
// patches of grass left round the edges and in the corners, faded lines, and a pair of goalposts at either end
// (owner: the ground is mainly soil, not grass, and it has poles).
import * as THREE from 'three';
import { WHITE, box, canvas, rnd, speckle } from './modelkit';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { garden } from './gardens';

const PLAIN: Style = { bay: 3, up: [], ground: [], draw: (g) => render(g) };

// the mapped pitch (OSM): x 145.2..209.6, z 573.5..634
const P: [number, number, number, number] = [145.4, 209.4, 573.8, 633.8];
const PO: [number, number] = [(P[0] + P[1]) / 2, (P[2] + P[3]) / 2];
const W = P[1] - P[0], D = P[3] - P[2];

/** worn ground: laterite soil, grass surviving in patches (most at the edges), faint touchline and halfway line */
function wornGround() {
  const S = 512;
  return canvas(S, S, (g) => {
    g.fillStyle = '#b48357'; g.fillRect(0, 0, S, S);
    speckle(g, 0, 0, S, S, 14000, ['#a8784e', '#c0926a', '#9c6f48', '#bb8a60']);
    // grass patches: many and large near the edges, few and small in the middle and in the goalmouths
    for (let i = 0; i < 260; i++) {
      const x = rnd() * S, y = rnd() * S;
      const edge = Math.min(x, S - x, y, S - y) / (S / 2); // 0 at an edge, 1 in the middle
      const mouth = Math.abs(y - S / 2) < S * 0.18 && (x < S * 0.14 || x > S * 0.86);
      if (mouth || rnd() < edge * 0.85) continue;
      const r = (6 + rnd() * 26) * (1.2 - edge);
      g.fillStyle = ['#6f8f3c', '#7c9a45', '#647f36', '#88a24f'][(rnd() * 4) | 0];
      g.globalAlpha = 0.55 + rnd() * 0.4;
      g.beginPath();
      g.ellipse(x, y, r, r * (0.5 + rnd() * 0.6), rnd() * Math.PI, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
    // faded lines
    g.strokeStyle = 'rgba(236,232,220,0.35)'; g.lineWidth = 3;
    g.strokeRect(14, 14, S - 28, S - 28);
    g.beginPath(); g.moveTo(S / 2, 14); g.lineTo(S / 2, S - 14); g.stroke();
    g.beginPath(); g.arc(S / 2, S / 2, 42, 0, Math.PI * 2); g.stroke();
  });
}

/** a goal: two posts and a crossbar at x, facing +dir along x */
function goal(k: Kit, x: number, dir: number) {
  const half = 3.2, h = 2.3;
  for (const z of [-half, half]) k.plain.push([new THREE.CylinderGeometry(0.06, 0.06, h, 8).translate(x, h / 2, z), WHITE]);
  k.plain.push([new THREE.CylinderGeometry(0.06, 0.06, 2 * half, 8).rotateX(Math.PI / 2).translate(x, h, 0), WHITE]);
  // the back stays that held the net
  for (const z of [-half, half]) k.plain.push([box(x - dir * 1.2 - 0.03, x - dir * 1.2 + 0.03, 0, 1.0, z - 0.03, z + 0.03), '#d9d9d4']);
}

const footballPark: Spec = {
  name: 'Annexes football park',
  axis: [1, 0], origin: PO, storey: 3, style: PLAIN, roofColor: '#b8572f', fascia: WHITE, pitch: 0.4,
  blocks: [],
  keep: [[-W / 2, W / 2, -D / 2, D / 2]],
  covers: [PO],
  extras: (k: Kit) => {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: wornGround(), roughness: 1 }));
    ground.position.y = 0.025;
    ground.receiveShadow = true;
    k.meshes.push(ground);
    goal(k, -W / 2 + 2.5, 1);
    goal(k, W / 2 - 2.5, -1);
  },
};

// ---------- the old Night Market site, south of the banking square ----------
// (owner: the market stood here only while it was relocated for construction; now grass, trees and bare soil)
const OO: [number, number] = [166, 1075];
const oldMarket: Spec = {
  name: 'old Night Market ground',
  axis: [1, 0], origin: OO, storey: 3, style: PLAIN, roofColor: '#b8572f', fascia: WHITE, pitch: 0.4,
  blocks: [],
  keep: [],
  extras: (k: Kit) => {
    // worn patches of bare soil where the stalls stood
    const soil = new THREE.MeshStandardMaterial({ color: '#a97c55', roughness: 1 });
    for (const [x, z, rx, rz, a] of [[140, 1050, 9, 6, 0.4], [158, 1075, 11, 7, -0.3], [176, 1080, 7, 5, 0.9], [185, 1100, 8, 6, 0.2], [150, 1092, 6, 4, -0.8]]) {
      const m = new THREE.Mesh(new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2).scale(rx, 1, rz).rotateY(a), soil);
      m.position.set(x - OO[0], 0.02, z - OO[1]);
      m.receiveShadow = true;
      k.meshes.push(m);
    }
    const g = garden([120, 215, 1030, 1120]);
    g.reseed(41);
    g.scatter(128, 205, 1036, 1114, 22, (x, z) => g.tree(k, x - OO[0], z - OO[1], 0.9 + g.rand() * 0.5));
  },
};

// ---------- the phone booths north of the banking square's car park ----------
// (owner: the two square structures there are not buildings but phone booths for making calls)
const BO: [number, number] = [168, 932];
const phoneBooths: Spec = {
  name: 'banking square phone booths',
  axis: [1, 0], origin: BO, storey: 3, style: PLAIN, roofColor: '#b8572f', fascia: WHITE, pitch: 0.4,
  blocks: [],
  keep: [[142.6 - BO[0] - 4, 142.6 - BO[0] + 4, 930.5 - BO[1] - 4, 930.5 - BO[1] + 4], [193.7 - BO[0] - 4, 193.7 - BO[0] + 4, 933 - BO[1] - 4, 933 - BO[1] + 4]],
  extras: (k: Kit) => {
    for (const [wx, wz] of [[142.6, 930.5], [193.7, 933]]) {
      const x = wx - BO[0], z = wz - BO[1], h = 3, r = 3.2;
      // an open square shelter: a slab, four posts and a flat roof of dark panels in a light frame (the aerial's grid)
      k.plain.push([box(x - r - 0.3, x + r + 0.3, 0, 0.15, z - r - 0.3, z + r + 0.3), '#cfc9bd']);
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.plain.push([box(x + sx * r - 0.1, x + sx * r + 0.1, 0, h, z + sz * r - 0.1, z + sz * r + 0.1), '#d9d9d4']);
      k.plain.push([box(x - r - 0.2, x + r + 0.2, h, h + 0.12, z - r - 0.2, z + r + 0.2), '#d9d9d4']);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        const px = x - r + 0.15 + (i * (2 * r - 0.3)) / 4, pz = z - r + 0.15 + (j * (2 * r - 0.3)) / 4, s = (2 * r - 0.3) / 4 - 0.12;
        k.plain.push([box(px, px + s, h + 0.12, h + 0.16, pz, pz + s), '#3b4a5c']);
      }
      // the telephones: four payphones on a pillar in the middle, one to a side
      k.plain.push([box(x - 0.3, x + 0.3, 0.15, 2.2, z - 0.3, z + 0.3), '#e9e6de']);
      for (const [dx, dz, w, d] of [[0.42, 0, 0.12, 0.5], [-0.42, 0, 0.12, 0.5], [0, 0.42, 0.5, 0.12], [0, -0.42, 0.5, 0.12]]) {
        k.plain.push([box(x + dx - w / 2, x + dx + w / 2, 1.1, 1.7, z + dz - d / 2, z + dz + d / 2), '#1f5fa8']);
      }
      k.signs.push({ text: 'PHONE', x, y: h - 0.35, z: z + r + 0.22, ry: 0, w: 1.6, colors: ['#1f5fa8', '#ffffff'] });
    }
  },
};

/** open grounds drawn from the owner's descriptions */
export const parks = createSite('parks', [footballPark, oldMarket, phoneBooths]);
