// The owner's Bani Hostel, PRESEC and IPS Road brief (Bani_PRESEC_IPS_Detailed_Claude_Brief: 20 street pairs, the
// annotated aerials R1-R4, the game map G1; numbers in bpiplan.ts; evidence, the old-to-new mapping and the deletions in
// docs/bani-presec-ips/evidence-audit.md). J.J. Rawlings Avenue (the screenshots' "Legon E Rd") from the Shell station
// near Pent north past the IPS Road junction and GOIL to the PRESEC gate and the side road into Bani:
// - the ground: open scrub and red soil, dry grass and shrubs on the parcels the game had as lawn (R2, R4; Pairs 2-6,
//   15-17), the compacted trading ground at the GOIL corner (Pairs 8, 9), the dusty side-road mouth (Pairs 16-18);
//   the generated palm avenue and lawn trees kept off them (only the trees the photographs show);
// - Pairs 1-6: the Shell pylon and the paved forecourt out to the road; the near palm; the skeletal billboard frame; the
//   tall billboard seen edge-on; the lattice towers and the line across the parcel; the distribution poles with their
//   crossarms and wires; the billboards along the corridor; the unroofed frame east of the avenue (provisional);
// - Pairs 7-10: the overhead signal arm on the approach; at the corner the block-paved walk, the stone-lined open drain
//   and its crossing slab, the white cabinets, the exposed rust-coloured frame, the covered stall roof, the kiosks, the
//   mast and the boards; the pale concrete roadside shelter at the "UPS" stop with its deep roof slab and rounded end
//   wall under its tall billboard, the horizontal board ahead (the generic blue shelters there are gone);
// - Pairs 11-14, 20: the signal arms at the PRESEC junction; PRESEC's gate (the pale span with PRESEC on red piers), the
//   splayed wing walls with the school's name, the blue stepped plinth, the white boundary wall, the stone-faced raised
//   verges, the walks and painted posts, the boards, the dense trees screening the school;
// - Pairs 15-19: the Bani blocks (the cream block with its dark red hip roof, the white block, the peach hostel blocks
//   with their weathered tiled roofs), the low block wall and the boards along the side road, the poles and wires, the
//   shaded gathering ground at the mouth, the two sheds, the elevated billboard; the low roadside shops and the "Presec"
//   stop's shelter (Pair 20).
import * as THREE from 'three';
import { createSite, render, type Kit, type Spec, type Style } from './blocks';
import { box, canvas, merge, type Part } from './modelkit';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { Bag, hash, tuft, vnoise, wallSolids } from './enkit';
import { broadleaf } from './nsiaroad';
import { drapeAt, groundCover } from './kuffourgarden';
import { BUILDINGS, NODE_XZ, ROADS } from './campusmap';
import { latticeTower, pavers, rod, run, wires, type V3 } from './upsa';
import { place, textPanel } from './fskit';
import { TOWERS } from './upsaplan';
import {
  AHEAD_BB, AV_HALF, BANI_CREAM, BANI_PEACH, BIG_BB, BOARDS, CORNER, FRAME, GATE, GATHER, LOW_WALL, PALM, PJ_BOARDS,
  POLES_W, POLE_OFF, ROADSIDE, ROADSIDE_OFF, SCRUB_E, SCRUB_W, SHEDS, SHELL_FRAME, SHELL_FRONT, SHELL_PYLON, SHELTER, SHELTER_BB,
  SIDE_BOARDS, SIDE_Z, SIG_IPS, SIG_PJ, TALL_BB, TOWERS_W, TRADE, WALL_H, WALL_N, WALL_S, WING, avDir, xE, xW,
} from './bpiplan';

const PLAIN: Style = { bay: 4, up: [], ground: [], draw: (g) => render(g, '#f1efe9') };

// ---------- the mapped roads and paths round the section, so the ground, the props and the trees keep off them ----------
const SEGS: [number, number, number, number, number][] = [];
for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++) {
  const ax = NODE_XZ[r.nodes[i] * 2], az = NODE_XZ[r.nodes[i] * 2 + 1], bx = NODE_XZ[r.nodes[i + 1] * 2], bz = NODE_XZ[r.nodes[i + 1] * 2 + 1];
  if (Math.max(ax, bx) < 640 || Math.min(ax, bx) > 1120 || Math.max(az, bz) < -1360 || Math.min(az, bz) > -540) continue;
  SEGS.push([ax, az, bx, bz, [9, 7.4, 6.2, 4.6, 2.6][r.cls] / 2]);
}
/** distance from (x, z) to the nearest mapped road or path edge (negative on it) */
const roadGap = (x: number, z: number) => {
  let best = Infinity;
  for (const [ax, az, bx, bz, h] of SEGS) {
    const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z) - h);
  }
  return best;
};
const inRing = (pts: Float32Array, x: number, z: number) => {
  let c = false;
  for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
    const xi = pts[i], zi = pts[i + 1], xj = pts[j], zj = pts[j + 1];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
};
const inBuilding = (x: number, z: number, pad = 0) => BUILDINGS.some((b) => x > b.minX - pad && x < b.maxX + pad && z > b.minZ - pad && z < b.maxZ + pad && (pad > 0 || inRing(b.pts, x, z)));
const inPoly = (pts: [number, number][], x: number, z: number) => {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
};

// ======================================================================================================
// shared builders: the ground, billboards, signals, poles
// ======================================================================================================
const hex = (h: string): [number, number, number] => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
const SOIL = hex('#a86f4a'), SOIL2 = hex('#b98d6c'), DUST = hex('#bba27e'), DRY = hex('#b9ad68'), GRASS = hex('#86a24a'), GREEN = hex('#6a8f38');
const mix = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
/** unmanaged scrub: red soil patches and tracks, dry yellow-green grass, greener clumps (R2, R4; Pairs 2-6, 15-17) */
const scrubCol = (x: number, z: number): [number, number, number] => {
  const n = vnoise(x * 0.045, z * 0.045), m = vnoise(x * 0.21 + 7, z * 0.21), f = vnoise(x * 0.9, z * 0.9);
  // (the soil in patches and worn tracks; the strip along the avenue's kerb stays grassed: Pairs 3-5)
  const kerb = Math.min(Math.abs(x - xW(z)), Math.abs(x - xE(z)));
  const soil = (n > 0.7 ? 0.8 : n > 0.6 ? ((n - 0.6) / 0.1) * 0.8 : 0) * Math.min(1, Math.max(0, (kerb - 9) / 8));
  const veg = mix(DRY, m > 0.55 ? GREEN : GRASS, Math.min(1, Math.max(0, (m - 0.3) * 2)));
  return mix(mix(veg, f > 0.5 ? SOIL2 : SOIL, soil), DUST, 0.08 * f);
};
/** compacted, dusty ground with sparse grass (the GOIL corner, the side-road mouth: Pairs 8, 9, 16-18) */
const dustCol = (x: number, z: number): [number, number, number] => {
  const n = vnoise(x * 0.12, z * 0.12), f = vnoise(x * 0.7, z * 0.7);
  return mix(mix(DUST, SOIL2, n * 0.6), GRASS, n > 0.7 ? (n - 0.7) * 2 : 0.05 * f);
};
/** a ground drape over a box, kept off the mapped roads and outlines and out of `skip` */
const LAWN = hex('#6c9a3e');
function ground(O: [number, number], r: [number, number, number, number], col: (x: number, z: number) => [number, number, number], skip: (x: number, z: number) => boolean = () => false, cell = 1.0) {
  // (blended into the lawn over an irregular margin at the box's edges, so no hard rectangle shows)
  const edge = (x: number, z: number) => Math.min(x - r[0], r[1] - x, z - r[2], r[3] - z) / (8 + vnoise(x * 0.08, z * 0.08) * 10);
  const g = drapeAt(O, r[0], r[1], r[2], r[3], cell, 0.04, (x, z) => (roadGap(x, z) < 0.6 || inBuilding(x, z) || skip(x, z) ? null : mix(LAWN, col(x, z), Math.min(1, Math.max(0, edge(x, z))))));
  const m = new THREE.Mesh(g, groundCover()); m.receiveShadow = true; m.userData.noCollide = true;
  return m;
}
/** scattered shrubs and tufts on scrub ground (not on roads or in outlines) */
function shrubs(b: Bag, r: [number, number, number, number], n: number, seed: number, skip: (x: number, z: number) => boolean = () => false) {
  for (let i = 0; i < n; i++) {
    const x = r[0] + hash(i, seed) * (r[1] - r[0]), z = r[2] + hash(seed, i * 1.3) * (r[3] - r[2]);
    if (roadGap(x, z) < 1.5 || inBuilding(x, z, 1) || skip(x, z)) continue;
    if (hash(i * 3.1, seed) < 0.55) tuft(b, x, z, 0.6 + hash(i, 4) * 0.8, ['#8f8f45', '#6f8a35', '#9a9150'][i % 3]);
    else {
      const s = 0.3 + hash(i, 7.7) * 0.55, col = ['#4f7a2c', '#5f8a33', '#476f27', '#6a7f36'][i % 4];
      b.leaf.push([new THREE.IcosahedronGeometry(s, 1).scale(1.3, 0.7, 1.15).translate(x - b.O[0], s * 0.45, z - b.O[1]), col]);
    }
  }
}

const adMats: THREE.MeshStandardMaterial[] = [];
/** advertising artwork: colour fields, a portrait shape, blocks of type (no words, no phone numbers: not copied) */
function adMat(i: number) {
  const k = i % 6;
  if (!adMats[k]) {
    const pal = [['#d9282f', '#f6d000', '#ffffff'], ['#1f63b8', '#ffffff', '#f2a900'], ['#2f8f3a', '#f4f1e6', '#e03a2e'], ['#6a2b8c', '#f6c400', '#ffffff'], ['#101418', '#e7e7e7', '#d4232b'], ['#f07c1a', '#ffffff', '#1d3f8a']][k];
    const t = canvas(256, 128, (g) => {
      g.fillStyle = pal[0]; g.fillRect(0, 0, 256, 128);
      g.fillStyle = pal[1]; g.fillRect(0, 96, 256, 32);
      const fx = k % 2 ? 190 : 62;
      g.fillStyle = '#7a4a2c'; g.beginPath(); g.ellipse(fx, 52, 26, 32, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#2a1d16'; g.beginPath(); g.ellipse(fx, 30, 27, 16, 0, Math.PI, Math.PI * 2); g.fill();
      g.fillStyle = pal[1]; g.fillRect(fx - 40, 84, 80, 14);
      g.fillStyle = pal[2];
      const tx = k % 2 ? 18 : 120;
      for (let r = 0; r < 4; r++) g.fillRect(tx, 18 + r * 18, 110 - r * 18 - (hash(k, r) * 20), 10);
      g.fillStyle = pal[0]; for (let r = 0; r < 2; r++) g.fillRect(20 + r * 120, 104, 90, 8);
    });
    adMats[k] = new THREE.MeshStandardMaterial({ map: t, roughness: 0.7, side: THREE.DoubleSide });
  }
  return adMats[k];
}
/** a billboard on its own supports: the panel (artwork on the face, grey back), its frame, two legs or one mast; at
 *  (x, z) in the frame of origin O, facing `yaw` (0: +z) */
function billboard(k: Kit, c: Part[], O: [number, number], x: number, z: number, yaw: number, w: number, h: number, up: number, art: number, mast = false) {
  const px = x - O[0], pz = z - O[1], s = Math.sin(yaw), co = Math.cos(yaw);
  const P = (dx: number, y: number, dz: number) => new THREE.Vector3(px + dx * co + dz * s, y, pz - dx * s + dz * co);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), adMat(art));
  const at = P(0, up + h / 2, 0.06); panel.position.copy(at); panel.rotation.y = yaw; panel.castShadow = true;
  k.meshes.push(panel);
  c.push([new THREE.BoxGeometry(w + 0.25, h + 0.25, 0.1).rotateY(yaw).translate(px, up + h / 2, pz), '#6f7377']);
  if (mast) {
    const m = P(0, 0, -0.35);
    c.push([new THREE.CylinderGeometry(0.22, 0.28, up + h * 0.6, 10).translate(m.x, (up + h * 0.6) / 2, m.z), '#8a8f93']);
    SOLIDS.add(m.x + O[0], m.z + O[1], 0.4);
  } else {
    for (const dx of [-w * 0.3, w * 0.3]) {
      const m = P(dx, 0, -0.25);
      c.push([new THREE.BoxGeometry(0.22, up + h * 0.5, 0.22).translate(m.x, (up + h * 0.5) / 2, m.z), '#7a7f84']);
      SOLIDS.add(m.x + O[0], m.z + O[1], 0.25);
    }
    // a walkway under the panel, its rail
    const a = P(-w / 2, up - 0.1, -0.5), b2 = P(w / 2, up - 0.1, -0.5);
    c.push([rod([a.x, a.y, a.z], [b2.x, b2.y, b2.z], 0.1), '#6f7377']);
  }
}
/** an overhead signal: the mast at (x, z), the arm to armTo along x at 6.1 m, its heads (red, amber, green) facing yaw */
function signalArm(c: Part[], O: [number, number], s: { x: number; z: number; armTo: number; heads: number; yaw: number }) {
  const px = s.x - O[0], pz = s.z - O[1], ax = s.armTo - O[0], H = 6.1;
  c.push([new THREE.CylinderGeometry(0.14, 0.18, H + 0.4, 10).translate(px, (H + 0.4) / 2, pz), '#5f6366']);
  c.push([rod([px, H, pz], [ax, H, pz], 0.14), '#5f6366'], [rod([px, H - 1.4, pz], [px + (ax - px) * 0.35, H - 0.05, pz], 0.08), '#5f6366']);
  // a head on the mast itself, facing the same way, at driver height
  const head = (hx: number, y: number) => {
    const g: Part[] = [[box(-0.2, 0.2, y - 0.52, y + 0.52, -0.16, 0.16), '#1b1c1e'], [box(-0.3, 0.3, y - 0.62, y + 0.62, -0.19, -0.17), '#1b1c1e']];
    ['#d7261e', '#5a4612', '#1f4d2a'].forEach((col, i) => g.push([new THREE.CircleGeometry(0.11, 12).translate(0, y + 0.33 - i * 0.33, 0.165), col]));
    for (const [geo, col] of g) c.push([geo.rotateY(s.yaw).translate(hx, 0, pz), col]);
  };
  for (let i = 0; i < s.heads; i++) head(px + ((ax - px) * (i + 1)) / (s.heads + 0.4), H - 0.75);
  head(px, 3.2);
  SOLIDS.add(s.x, s.z, 0.3);
}
/** a concrete distribution pole with its crossarm and insulators; returns the three wire points */
function pole(c: Part[], O: [number, number], x: number, z: number, along: [number, number]): V3[] {
  const px = x - O[0], pz = z - O[1], H = 9, nx = -along[1], nz = along[0];
  c.push([new THREE.CylinderGeometry(0.11, 0.16, H, 7).translate(px, H / 2, pz), '#8d8a84']);
  c.push([rod([px - nx * 1.0, H - 0.6, pz - nz * 1.0], [px + nx * 1.0, H - 0.6, pz + nz * 1.0], 0.1), '#5d5a55']);
  const out: V3[] = [];
  for (const d of [-0.85, 0, 0.85]) {
    const p: V3 = [px + nx * d, H - 0.35, pz + nz * d];
    c.push([new THREE.CylinderGeometry(0.05, 0.05, 0.25, 6).translate(p[0], p[1] - 0.1, p[2]), '#d9d6cc']);
    out.push(p);
  }
  SOLIDS.add(x, z, 0.2);
  return out;
}
const finishParts = (k: Kit, c: Part[], strength = 0.25) => { if (!c.length) return; const m = new THREE.Mesh(merge(c), concrete(strength)); m.castShadow = true; m.receiveShadow = true; k.meshes.push(m); };

// ======================================================================================================
// R2, Pairs 1-6: the Shell frontage, the open parcels, the utilities, the billboards
// ======================================================================================================
const CO: [number, number] = [860, -700];
const corridor: Spec = {
  name: 'J.J. Rawlings Avenue: Shell frontage and the open parcels', axis: [1, 0], origin: CO, storey: 3, style: PLAIN, roofColor: '#c9c4ba', fascia: '#6d5a4a', pitch: 0,
  blocks: [],
  onGround: true,
  // no generated lawn trees, palms or props on the open parcels and the frontage (only the photographed ones)
  keep: [[SCRUB_W[0] - CO[0], SCRUB_W[1] - CO[0], SCRUB_W[2] - CO[1], SCRUB_W[3] - CO[1] + 30], [SCRUB_E[0] - CO[0], SCRUB_E[1] - CO[0], SCRUB_E[2] - CO[1], SCRUB_E[3] - CO[1]], [870 - CO[0], 960 - CO[0], -880 - CO[1], -700 - CO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(CO), c: Part[] = [];
    const nearShell = (x: number, z: number) => x < 816 && z > -652;
    // ---- the ground: scrub and red soil either side of the avenue (R2), the station kept as the station model has it ----
    k.meshes.push(ground(CO, SCRUB_W, scrubCol, (x, z) => nearShell(x, z) || inPoly(SHELL_FRONT, x, z)));
    k.meshes.push(ground(CO, SCRUB_E, scrubCol, (x, z) => x > SHELL_FRAME.block[0] - 1 && x < SHELL_FRAME.block[1] + 1 && z > SHELL_FRAME.block[2] - 1 && z < SHELL_FRAME.block[3] + 1));
    k.meshes.push(ground(CO, [880, 950, -880, -700], scrubCol));
    shrubs(b, SCRUB_W, 520, 11, nearShell); shrubs(b, SCRUB_E, 260, 23); shrubs(b, [880, 950, -880, -700], 160, 37);
    for (const [x, z, h] of [[790, -700, 5], [826, -760, 4.5], [770, -735, 6], [840, -672, 4], [960, -660, 5.5], [990, -610, 6]] as [number, number, number][]) {
      if (roadGap(x, z) > 3 && !inBuilding(x, z, 2)) broadleaf(k, b.leaf, x, z, { h, spread: h * 0.9, sparse: true, seed: x + z, origin: CO });
    }
    // ---- Pair 1: the paved forecourt out to the road walk (no lawn setback), the low kerb and the planted strip ----
    {
      const pv = new THREE.ShapeGeometry(new THREE.Shape(SHELL_FRONT.map(([x, z]) => new THREE.Vector2(x - CO[0], -(z - CO[1]))))).rotateX(-Math.PI / 2).translate(0, 0.03, 0);
      const p = pv.attributes.position, uv = pv.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 2, p.getZ(i) / 2);
      const m = new THREE.Mesh(pv, pavers('grey')); m.receiveShadow = true; k.meshes.push(m);
      // the planted strip along the road edge, broken at the way in and out
      for (const [z0, z1] of [[-620.5, -606], [-600.5, -592]]) c.push([run(816.6 - CO[0], z0 - CO[1], 814.8 - CO[0], z1 - CO[1], 0, 0.16, 0.22), '#c9c4ba']);
    }
    // ---- the Shell pylon: a tall white panel, the emblem at its top, the price boards, the FuelSave panel (Pair 1;
    // the prices are reference-date artwork) ----
    {
      const x = SHELL_PYLON.x - CO[0], z = SHELL_PYLON.z - CO[1], yaw = 1.15, H = 9.2;
      c.push([new THREE.BoxGeometry(1.7, H, 0.45).rotateY(yaw).translate(x, H / 2, z), '#f2f2ef'], [new THREE.BoxGeometry(2.2, 0.4, 1.1).rotateY(yaw).translate(x, 0.2, z), '#9a9da0']);
      const face = textPanel(1.6, H - 0.3, [], null, (g, W, Hh) => {
        g.fillStyle = '#f2f2ef'; g.fillRect(0, 0, W, Hh);
        const cx = W / 2, cy = Hh * 0.1, r = W * 0.36;
        g.fillStyle = '#d7261e'; g.beginPath(); g.arc(cx, cy + r * 0.4, r * 1.05, Math.PI, 0); g.lineTo(cx + r * 0.5, cy + r * 1.2); g.lineTo(cx - r * 0.5, cy + r * 1.2); g.closePath(); g.fill();
        g.fillStyle = '#f6c400'; g.beginPath(); g.arc(cx, cy + r * 0.4, r * 0.88, Math.PI, 0); g.lineTo(cx + r * 0.42, cy + r * 1.05); g.lineTo(cx - r * 0.42, cy + r * 1.05); g.closePath(); g.fill();
        g.strokeStyle = '#d7261e'; g.lineWidth = W * 0.025; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(cx, cy + r * 1.0); g.lineTo(cx + i * r * 0.35, cy - r * 0.35); g.stroke(); }
        for (let i = 0; i < 2; i++) {
          const y = Hh * (0.27 + i * 0.075);
          g.fillStyle = '#ffffff'; g.fillRect(W * 0.05, y, W * 0.4, Hh * 0.05);
          g.fillStyle = '#1b1b1b'; g.fillRect(W * 0.5, y, W * 0.45, Hh * 0.05);
          g.fillStyle = '#e8352a'; g.font = `bold ${Math.round(Hh * 0.04)}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(i ? '14.35' : '14.10', W * 0.72, y + Hh * 0.025);
        }
        g.fillStyle = '#f6c400'; g.fillRect(W * 0.08, Hh * 0.64, W * 0.84, Hh * 0.17);
        g.fillStyle = '#d7261e'; g.font = `bold ${Math.round(W * 0.15)}px Arial`; g.textAlign = 'center'; g.fillText('Shell', W / 2, Hh * 0.68); g.fillText('FuelSave', W / 2, Hh * 0.76);
      });
      const s = Math.sin(yaw), co = Math.cos(yaw);
      k.meshes.push(place(face, x + s * 0.24, H / 2 + 0.1, z + co * 0.24, yaw));
      const back = face.clone(); k.meshes.push(place(back, x - s * 0.24, H / 2 + 0.1, z - co * 0.24, yaw + Math.PI));
      SOLIDS.add(SHELL_PYLON.x, SHELL_PYLON.z, 0.9);
    }
    // ---- Pair 2: the mature palm with the broad drooping crown; the skeletal billboard frame ----
    {
      const [x, z] = [PALM[0] - CO[0], PALM[1] - CO[1]], h = 11;
      for (let i = 0; i < 6; i++) { const y0 = (i * h) / 6, l = 0.06 * i; c.push([new THREE.CylinderGeometry(0.2, 0.24, h / 6 + 0.05, 8).translate(x + l, y0 + h / 12, z + l * 0.4), '#7c7062']); }
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + hash(i, 3) * 0.3, droop = 0.35 + hash(i, 5) * 0.7;
        b.leaf.push([new THREE.ConeGeometry(0.55, 4.6, 3).rotateX(Math.PI / 2).translate(0, 0, 2.3).scale(1, 0.18, 1).rotateX(droop).rotateY(a).translate(x + 0.36, h, z + 0.15), i % 2 ? '#4a7a2a' : '#5b8a34']);
      }
      SOLIDS.add(PALM[0], PALM[1], 0.4);
      const F = FRAME, fx = F.x - CO[0], fz = F.z - CO[1], s = Math.sin(F.ry), co = Math.cos(F.ry);
      const P = (dx: number, y: number): V3 => [fx + dx * co, y, fz - dx * s];
      for (const dx of [-F.w / 2, F.w / 2]) { c.push([rod(P(dx, 0), P(dx, F.up + F.h), 0.24), '#8b2f23']); SOLIDS.add(P(dx, 0)[0] + CO[0], P(dx, 0)[2] + CO[1], 0.3); }
      for (const y of [F.up, F.up + F.h / 2, F.up + F.h]) c.push([rod(P(-F.w / 2, y), P(F.w / 2, y), 0.14), '#4e5458']);
      for (let i = 0; i < 4; i++) { const x0 = -F.w / 2 + (i * F.w) / 4, x1 = x0 + F.w / 4; c.push([rod(P(x0, F.up), P(x1, F.up + F.h), 0.08), '#4e5458'], [rod(P(x0, F.up + F.h), P(x1, F.up), 0.08), '#4e5458']); }
      for (let i = 1; i < 4; i++) c.push([rod(P(-F.w / 2 + (i * F.w) / 4, F.up), P(-F.w / 2 + (i * F.w) / 4, F.up + F.h), 0.1), '#4e5458']);
      // a scrap of the old panel still hanging (the photograph's torn poster)
      c.push([box(-0.6, 0.6, 0, 3.0, -0.03, 0.03).rotateY(F.ry).translate(P(F.w * 0.1, 0)[0], F.up + 1.2, P(F.w * 0.1, 0)[2]), '#c9a7a0']);
      // the small roadside board on its painted posts
      const [bx, bz] = [813 - CO[0], -628 - CO[1]];
      for (const dz of [-0.5, 0.5]) c.push([box(bx - 0.04, bx + 0.04, 0, 1.2, bz + dz - 0.04, bz + dz + 0.04), '#e6e6e2']);
      c.push([box(bx - 0.05, bx + 0.05, 1.0, 1.7, bz - 0.7, bz + 0.7), '#ececea']);
    }
    // ---- Pair 5: the tall billboard edge-on on its slim mast ----
    billboard(k, c, CO, TALL_BB.x, TALL_BB.z, TALL_BB.ry, TALL_BB.w, TALL_BB.h, TALL_BB.up, 3, true);
    // ---- the billboards along the corridor ----
    BOARDS.forEach(([x, z, yaw, w, h, up], i) => billboard(k, c, CO, x, z, yaw, w, h, up, i));
    // ---- the lattice towers across the parcel and their line on to the tower on the UGBS side ----
    {
      const ats = TOWERS_W.map(([x, z]) => latticeTower(c, x - CO[0], z - CO[1]));
      const east = latticeTower([], TOWERS[0][0] - CO[0], TOWERS[0][1] - CO[1]);
      for (const [p, q] of [[ats[1], ats[0]], [ats[0], east]]) k.meshes.push(wires(p.map((a, j) => [a, q[j]] as [V3, V3]), 6));
      for (const [x, z] of TOWERS_W) for (const sx of [-1, 1]) for (const sz of [-1, 1]) SOLIDS.add(x + sx * 2.8, z + sz * 2.8, 0.45);
    }
    // ---- the distribution poles along the west verge, their wires ----
    {
      const tops = POLES_W.map((z) => pole(c, CO, xW(z) - POLE_OFF, z, avDir(z)));
      const spans: [V3, V3][] = [];
      for (let i = 0; i < tops.length - 1; i++) for (let j = 0; j < 3; j++) spans.push([tops[i][j], tops[i + 1][j]]);
      k.meshes.push(wires(spans, 0.8));
    }
    // ---- the unroofed frame east of the avenue (R2; no outline in any source: provisional, height unconfirmed) ----
    {
      const F = SHELL_FRAME, [x0, x1, z0, z1] = F.block.map((v, i) => v - CO[i < 2 ? 0 : 1]) as [number, number, number, number], L = 3.4;
      for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 8) for (let z = z0; z <= z1 + 0.01; z += (z1 - z0) / 7) {
        c.push([box(x - 0.2, x + 0.2, 0, F.levels * L, z - 0.2, z + 0.2), '#bdb8ae']);
      }
      // (a slab at the lower level only; the top open, its beams exposed: R2 shows it unroofed)
      for (let l = 1; l < F.levels; l++) c.push([box(x0 - 0.2, (x0 + x1) / 2, l * L - 0.25, l * L, (z0 + z1) / 2, z1 + 0.2), '#c9c4ba']);
      for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 8) c.push([box(x - 0.18, x + 0.18, F.levels * L - 0.45, F.levels * L, z0, z1), '#bdb8ae']);
      for (const z of [z0, z1]) c.push([box(x0, x1, F.levels * L - 0.45, F.levels * L, z - 0.18, z + 0.18), '#bdb8ae']);
      for (const [a0, a1, b0, b1] of [[x0, x1, z0, z0 + 0.25], [x0, x1, z1 - 0.25, z1], [x0, x0 + 0.25, z0, z1], [x1 - 0.25, x1, z0, z1]]) c.push([box(a0, a1, 0, 1.4, b0, b1), '#a9a49a']);
      const rx = F.ring.x - CO[0], rz = F.ring.z - CO[1];
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * Math.PI * 2, a2 = ((i + 1) / 40) * Math.PI * 2;
        if (i > 8 && i < 13) continue;
        c.push([run(rx + Math.cos(a) * F.ring.r, rz + Math.sin(a) * F.ring.r, rx + Math.cos(a2) * F.ring.r, rz + Math.sin(a2) * F.ring.r, 0, 4.2, 0.4), '#c3beb4']);
        c.push([run(rx + Math.cos(a) * (F.ring.r - 3), rz + Math.sin(a) * (F.ring.r - 3), rx + Math.cos(a2) * (F.ring.r - 3), rz + Math.sin(a2) * (F.ring.r - 3), 0, 2.2, 0.3), '#bdb8ae']);
      }
      wallSolids(F.block[0], F.block[2], F.block[1], F.block[2], 0.3); wallSolids(F.block[0], F.block[3], F.block[1], F.block[3], 0.3);
      wallSolids(F.block[0], F.block[2], F.block[0], F.block[3], 0.3); wallSolids(F.block[1], F.block[2], F.block[1], F.block[3], 0.3);
    }
    finishParts(k, c);
    b.finish(k, 0.25);
  },
};

// ======================================================================================================
// R1/R3, Pairs 7-10: the IPS Road junction's signal arm, the GOIL corner, the "UPS" concrete shelter
// ======================================================================================================
const JO: [number, number] = [975, -930];
const junction: Spec = {
  name: 'IPS Road junction: the GOIL corner and the UPS shelter', axis: [1, 0], origin: JO, storey: 3, style: PLAIN, roofColor: '#c9c4ba', fascia: '#6d5a4a', pitch: 0,
  blocks: [],
  onGround: true,
  keep: [[TRADE[0] - JO[0], TRADE[1] - JO[0], TRADE[2] - JO[1] - 90, TRADE[3] - JO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(JO), c: Part[] = [];
    signalArm(c, JO, SIG_IPS);
    // ---- the ground: the compacted trading ground and its grass patches (Pairs 8, 9; R3) ----
    k.meshes.push(ground(JO, TRADE, dustCol, (x) => x > 1032));
    k.meshes.push(ground(JO, [962, 1000, -1050, -962], scrubCol));
    shrubs(b, [962, 1000, -1050, -962], 120, 51);
    // ---- the block-paved walk along the slip road, the stone-lined open drain beside it, the crossing slab ----
    const W = CORNER.walk, pv: THREE.BufferGeometry[] = [];
    for (let i = 0; i < W.length - 1; i++) {
      const [ax, az] = W[i], [bx, bz] = W[i + 1], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = uz, nz = -ux;
      // (the walk on the road side, the drain behind it, away from the road)
      const g = new THREE.PlaneGeometry(L + 0.2, CORNER.walkW).rotateX(-Math.PI / 2).rotateY(-Math.atan2(uz, ux)).translate((ax + bx) / 2 - JO[0] + nx * 1.2, 0.05, (az + bz) / 2 - JO[1] + nz * 1.2);
      const uv = g.attributes.uv as THREE.BufferAttribute; for (let j = 0; j < uv.count; j++) uv.setXY(j, uv.getX(j) * (L + 0.2) / 2, uv.getY(j) * CORNER.walkW / 2);
      pv.push(g);
      const d = CORNER.drainOff, dw = CORNER.drainW;
      const isSlab = i === 2;
      for (const side of [-1, 1]) c.push([run(ax - JO[0] + nx * (d + side * (dw / 2 + 0.15)), az - JO[1] + nz * (d + side * (dw / 2 + 0.15)), bx - JO[0] + nx * (d + side * (dw / 2 + 0.15)), bz - JO[1] + nz * (d + side * (dw / 2 + 0.15)), -0.6, 0.12, 0.3), '#8f8a80']);
      c.push([run(ax - JO[0] + nx * d, az - JO[1] + nz * d, bx - JO[0] + nx * d, bz - JO[1] + nz * d, -0.62, -0.5, dw), '#4a4a44']);
      b.water.push(new THREE.PlaneGeometry(L, dw * 0.8).rotateX(-Math.PI / 2).rotateY(-Math.atan2(uz, ux)).translate((ax + bx) / 2 - JO[0] + nx * d, -0.45, (az + bz) / 2 - JO[1] + nz * d));
      if (isSlab) {
        const mx = (ax + bx) / 2, mz = (az + bz) / 2;
        c.push([run(mx - ux * CORNER.slab - JO[0] + nx * d, mz - uz * CORNER.slab - JO[1] + nz * d, mx + ux * CORNER.slab - JO[0] + nx * d, mz + uz * CORNER.slab - JO[1] + nz * d, 0.02, 0.2, dw + 0.9), '#b2ada3']);
      }
    }
    for (const g of pv) { const m = new THREE.Mesh(g, pavers('grey')); m.receiveShadow = true; k.meshes.push(m); }
    // ---- the white utility cabinets at the back edge ----
    for (const [x, z] of CORNER.cabinets) {
      c.push([box(x - JO[0] - 0.6, x - JO[0] + 0.6, 0, 1.75, z - JO[1] - 0.38, z - JO[1] + 0.38), '#ecece8'], [box(x - JO[0] - 0.64, x - JO[0] + 0.64, 1.75, 1.85, z - JO[1] - 0.42, z - JO[1] + 0.42), '#c9c9c4']);
      c.push([box(x - JO[0] - 0.62, x - JO[0] + 0.62, 0, 0.18, z - JO[1] - 0.4, z - JO[1] + 0.4), '#9a968e']);
      SOLIDS.add(x, z, 0.6);
    }
    // ---- the exposed rust-coloured post-and-beam frame with its shallow roof pieces (kept open, not completed) ----
    {
      const [x0, x1, z0, z1] = CORNER.frame.map((v, i) => v - JO[i < 2 ? 0 : 1]) as [number, number, number, number], H = 3.2, RUST = '#8a4626';
      for (const x of [x0, (x0 + x1) / 2, x1]) for (const z of [z0, z1]) { c.push([box(x - 0.08, x + 0.08, 0, H, z - 0.08, z + 0.08), RUST]); SOLIDS.add(x + JO[0], z + JO[1], 0.15); }
      for (const z of [z0, z1]) c.push([box(x0 - 0.1, x1 + 0.1, H - 0.14, H, z - 0.08, z + 0.08), RUST]);
      for (const x of [x0, (x0 + x1) / 2, x1]) c.push([box(x - 0.07, x + 0.07, H - 0.14, H, z0, z1), RUST]);
      c.push([box(x0 - 0.1, (x0 + x1) / 2 + 0.4, H, H + 0.04, z0 - 0.2, (z0 + z1) / 2), '#9aa3a8'], [box(x0 + 1.2, x1 - 0.8, H + 0.04, H + 0.08, (z0 + z1) / 2 + 0.6, z1 + 0.2), '#7f8a8e']);
      c.push([box(x0 + 0.3, x0 + 2.5, 0, 0.9, z1 - 0.8, z1 - 0.2), '#6e5b3a']);
    }
    // ---- the covered stall roof among the trees (R3: the green roof), its posts; the small kiosks ----
    {
      const [x0, x1, z0, z1] = CORNER.stall.map((v, i) => v - JO[i < 2 ? 0 : 1]) as [number, number, number, number];
      for (const x of [x0, x1]) for (const z of [z0, z1]) { c.push([box(x - 0.07, x + 0.07, 0, 2.6, z - 0.07, z + 0.07), '#5b5f60']); SOLIDS.add(x + JO[0], z + JO[1], 0.15); }
      const r = new THREE.BufferGeometry();
      r.setAttribute('position', new THREE.Float32BufferAttribute([x0 - 0.3, 2.9, z0 - 0.3, x1 + 0.3, 2.9, z0 - 0.3, x1 + 0.3, 2.5, z1 + 0.3, x0 - 0.3, 2.9, z0 - 0.3, x1 + 0.3, 2.5, z1 + 0.3, x0 - 0.3, 2.5, z1 + 0.3], 3));
      r.computeVertexNormals(); c.push([r, '#3f7a52']);
      for (const [x, z, yaw] of CORNER.kiosks) {
        const px = x - JO[0], pz = z - JO[1];
        c.push([new THREE.BoxGeometry(1.5, 2.1, 1.1).rotateY(yaw).translate(px, 1.05, pz), ['#2d5ea8', '#d6c08a', '#c8392f'][(x | 0) % 3]], [new THREE.BoxGeometry(2.0, 0.07, 1.8).rotateY(yaw).translate(px, 2.2, pz), '#8a9196']);
        c.push([new THREE.BoxGeometry(1.2, 0.6, 0.04).rotateY(yaw).translate(px + Math.sin(yaw) * 0.57, 1.3, pz + Math.cos(yaw) * 0.57), '#1d1f22']);
        SOLIDS.add(x, z, 0.8);
      }
      // the vendors' umbrellas (reference-date props; Pairs 8, 9)
      for (const [x, z, col] of CORNER.umbrellas) {
        const px = x - JO[0], pz = z - JO[1];
        c.push([new THREE.CylinderGeometry(0.03, 0.03, 2.3, 6).translate(px, 1.15, pz), '#d9d9d6'], [new THREE.ConeGeometry(1.4, 0.55, 12).translate(px, 2.35, pz), col]);
      }
    }
    // ---- the tall mast behind, the boards, the trees ----
    { const [mx, mz] = [CORNER.mast[0] - JO[0], CORNER.mast[1] - JO[1]]; c.push([new THREE.CylinderGeometry(0.16, 0.3, 18, 8).translate(mx, 9, mz), '#a3a7aa'], [box(mx - 0.5, mx + 0.5, 15.5, 17.5, mz - 0.1, mz + 0.1), '#d6d6d2']); SOLIDS.add(CORNER.mast[0], CORNER.mast[1], 0.35); }
    CORNER.boards.forEach(([x, z, yaw, w, h, up], i) => billboard(k, c, JO, x, z, yaw, w, h, up, i + 2));
    for (const [x, z, h, sp] of CORNER.trees) broadleaf(k, b.leaf, x, z, { h, spread: sp, seed: x * 0.7 + z, origin: JO });
    // ---- Pair 10: the pale concrete roadside shelter at the "UPS" stop, under its tall billboard ----
    {
      const S = SHELTER, z = S.z, [dx, dz] = avDir(z), nx = -dz, nz = dx; // (nx, nz) points east, away from the road
      const cx = xE(z) + nx * S.off - JO[0], cz = z + nz * S.off - JO[1];
      const P = (a: number, d: number): [number, number] => [cx + dx * a + nx * d, cz + dz * a + nz * d];
      const L = S.len, D = S.depth, PALE = '#d9d4c8';
      // the back wall and the low bench wall, the deep roof slab projecting toward the road
      const [bx0, bz0] = P(-L / 2, D / 2), [bx1, bz1] = P(L / 2, D / 2);
      c.push([run(bx0, bz0, bx1, bz1, 0, S.h, 0.35), PALE]);
      const [rx0, rz0] = P(-L / 2 - 0.4, 0), [rx1, rz1] = P(L / 2 + 0.4, 0);
      c.push([run(rx0, rz0, rx1, rz1, S.h, S.h + S.slab, D + S.over * 2), '#e1ddd2']);
      c.push([run(...P(-L / 2 + 1, D / 2 - 0.6), ...P(L / 2 - 1, D / 2 - 0.6), 0, 0.5, 0.5), '#bdb8ad']);
      // the shaped support wall at the north end, the rounded wall at the south end (Pair 10)
      c.push([run(...P(L / 2 - 0.2, D / 2), ...P(L / 2 - 0.2, -D / 2 + 0.6), 0, S.h, 0.4), PALE]);
      for (let i = 0; i < 10; i++) {
        const a0 = (i / 10) * Math.PI, a1 = ((i + 1) / 10) * Math.PI, R = D / 2;
        const [p0x, p0z] = P(-L / 2 - Math.sin(a0) * R * 0.9, Math.cos(a0) * R), [p1x, p1z] = P(-L / 2 - Math.sin(a1) * R * 0.9, Math.cos(a1) * R);
        c.push([run(p0x, p0z, p1x, p1z, 0, S.h, 0.32), PALE]);
      }
      // the dark board on the back wall under the slab, the hard apron before it
      c.push([run(...P(-L / 2 + 2, D / 2 - 0.2), ...P(L / 2 - 2.5, D / 2 - 0.2), 1.2, 2.9, 0.06), '#5a6670']);
      const apron = new THREE.PlaneGeometry(L + 4, 6.5).rotateX(-Math.PI / 2).rotateY(-Math.atan2(dz, dx));
      const [ax, az] = P(0, -1.2); apron.translate(ax, 0.045, az);
      const am = new THREE.Mesh(apron, pavers('grey')); am.receiveShadow = true; k.meshes.push(am);
      const wx = (a: number, d: number) => { const [x, zz] = P(a, d); return [x + JO[0], zz + JO[1]] as [number, number]; };
      wallSolids(...wx(-L / 2, D / 2), ...wx(L / 2, D / 2), 0.3); wallSolids(...wx(L / 2 - 0.2, D / 2), ...wx(L / 2 - 0.2, -D / 2 + 0.6), 0.3);
      wallSolids(...wx(-L / 2 - 1.2, 0), ...wx(-L / 2, D / 2), 0.3);
      // the tall portrait billboard behind it, the horizontal board ahead (farther north)
      const B = SHELTER_BB, [bdx, bdz] = avDir(B.z);
      billboard(k, c, JO, xE(B.z) + -bdz * B.off, B.z + bdx * B.off, Math.atan2(bdx, bdz) + Math.PI, B.w, B.h, B.up, 4, true);
      const A = AHEAD_BB, [adx, adz] = avDir(A.z);
      billboard(k, c, JO, xE(A.z) + -adz * A.off, A.z + adx * A.off, Math.atan2(adx, adz) + Math.PI, A.w, A.h, A.up, 1);
    }
    finishParts(k, c);
    b.finish(k, 0.25);
  },
};


// ======================================================================================================
// R4, Pairs 11-14: the PRESEC junction's signal arms, the gate, the wing walls, the boundary, the verges, the trees
// ======================================================================================================
const PO: [number, number] = [GATE.x, GATE.z];
const [GU, GW] = [GATE.dir, [-GATE.dir[1], GATE.dir[0]] as [number, number]]; // into the school; across the road (south)
/** a point of the gate's frame: a along the entry road (+ into the school), w across it (+ south) */
const gp = (a: number, w: number): [number, number] => [GATE.x + GU[0] * a + GW[0] * w, GATE.z + GU[1] * a + GW[1] * w];
const presec: Spec = {
  name: 'PRESEC gate and boundary on J.J. Rawlings Avenue', axis: [1, 0], origin: PO, storey: 3, style: PLAIN, roofColor: '#c9c4ba', fascia: '#6d5a4a', pitch: 0,
  blocks: [],
  onGround: true,
  keep: [[-22, 4, -30, 26], [-14, 2, -70, -14]],
  extras: (k: Kit) => {
    const b = new Bag(PO), c: Part[] = [], L = (x: number, z: number): [number, number] => [x - PO[0], z - PO[1]];
    for (const s of SIG_PJ) signalArm(c, PO, s);
    const half = GATE.open / 2, H = GATE.h, RED = '#c5352b', WHITE = '#f1f0ea', BLUE = '#1f3f8a';
    // ---- the gate: two red piers each side, the pale span with PRESEC on both faces, the red frame, the crest ----
    const yaw = Math.atan2(GU[0], GU[1]) + Math.PI; // the span's face toward the avenue
    for (const w of [-half, half]) for (const da of [-0.5, 0.5]) {
      const [x, z] = L(...gp(da, w + Math.sign(w) * 0.5));
      c.push([new THREE.BoxGeometry(0.8, H + 0.8, 0.8).rotateY(yaw).translate(x, (H + 0.8) / 2, z), RED]);
      SOLIDS.add(x + PO[0], z + PO[1], 0.6);
    }
    {
      const [x, z] = L(...gp(0, 0)), span = GATE.open + 2.6;
      c.push([new THREE.BoxGeometry(span, 1.3, 0.7).rotateY(yaw).translate(x, H + 0.1, z), WHITE]);
      c.push([new THREE.BoxGeometry(span + 0.4, 0.22, 1.6).rotateY(yaw).translate(x, H + 0.86, z), RED]);
      c.push([new THREE.BoxGeometry(1.2, 1.0, 0.3).rotateY(yaw).translate(x, H + 1.5, z), WHITE]);
      for (const f of [1, -1]) {
        const [ox, oz] = [-GU[0] * 0.37 * f, -GU[1] * 0.37 * f];
        k.meshes.push(place(textPanel(6.2, 1.1, [{ t: 'PRESEC', s: 0.82, c: BLUE, b: true, f: 'Georgia, "Times New Roman", serif' }], null), x + ox, H + 0.1, z + oz, f > 0 ? yaw : yaw + Math.PI));
        const crest = textPanel(1.0, 0.9, [], null, (g, W, Hh) => { g.fillStyle = BLUE; g.beginPath(); g.moveTo(W * 0.1, 0); g.lineTo(W * 0.9, 0); g.lineTo(W * 0.9, Hh * 0.55); g.quadraticCurveTo(W * 0.5, Hh, W * 0.1, Hh * 0.55); g.closePath(); g.fill(); g.fillStyle = RED; g.fillRect(W * 0.44, Hh * 0.1, W * 0.12, Hh * 0.6); g.fillRect(W * 0.25, Hh * 0.28, W * 0.5, Hh * 0.1); });
        k.meshes.push(place(crest, x - GU[0] * 0.17 * f, H + 1.5, z - GU[1] * 0.17 * f, f > 0 ? yaw : yaw + Math.PI));
      }
    }
    // ---- the splayed wing walls with the school's name, the white boundary walls on along the avenue ----
    const wingEnd = (s: number): [number, number] => { const [px, pz] = gp(0, s * (half + 1)); const d = s < 0 ? [-0.554, -0.832] : [-0.832, 0.554]; return [px + d[0] * WING, pz + d[1] * WING]; };
    const wall = (ax: number, az: number, bx: number, bz: number, h = WALL_H) => {
      const [px, pz] = L(ax, az), [qx, qz] = L(bx, bz);
      c.push([run(px, pz, qx, qz, 0, h, 0.25), WHITE], [run(px, pz, qx, qz, h, h + 0.08, 0.32), '#d8d6cf'], [run(px, pz, qx, qz, 0, 0.3, 0.3), '#c9c6bd']);
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / 3.2));
      for (let i = 0; i <= n; i++) { const x = px + ((qx - px) * i) / n, z = pz + ((qz - pz) * i) / n; c.push([box(x - 0.2, x + 0.2, 0, h + 0.25, z - 0.2, z + 0.2), WHITE]); }
      wallSolids(ax, az, bx, bz, 0.25);
    };
    for (const s of [-1, 1]) {
      const [ax, az] = gp(0, s * (half + 1)), [bx, bz] = wingEnd(s);
      wall(ax, az, bx, bz, 2.6);
      // the lettering on the wing's outer face (Pairs 13, 14)
      const ux = bx - ax, uz = bz - az, l = Math.hypot(ux, uz), nx = (s < 0 ? uz : -uz) / l, nz = (s < 0 ? -ux : ux) / l;
      const [mx, mz] = L((ax + bx) / 2, (az + bz) / 2);
      const fy = Math.atan2(nx, nz);
      k.meshes.push(place(textPanel(9.6, 1.6, [{ t: 'PRESBYTERIAN BOYS', s: 0.4, c: BLUE, b: true }, { t: 'SECONDARY SCHOOL', s: 0.4, c: BLUE, b: true }], null), mx + nx * 0.16, 1.45, mz + nz * 0.16, fy));
      if (s < 0) {
        // the blue stepped plinth before the north wing, its small urn on top
        const px = mx + nx * 2.4, pz = mz + nz * 2.4;
        [[2.8, 0], [2.1, 0.4], [1.4, 0.8]].forEach(([w, y]) => c.push([new THREE.BoxGeometry(w, 0.4, w).rotateY(fy).translate(px, y + 0.2, pz), '#2456b0']));
        c.push([new THREE.CylinderGeometry(0.22, 0.3, 0.6, 12).translate(px, 1.5, pz), '#d9c27a'], [new THREE.SphereGeometry(0.28, 12, 8).translate(px, 1.95, pz), '#d9c27a']);
        SOLIDS.add(px + PO[0], pz + PO[1], 1.5);
      }
    }
    for (const [line, s] of [[WALL_N, -1], [WALL_S, 1]] as [[number, number][], number][]) {
      const pts = [wingEnd(s), ...line];
      for (let i = 0; i < pts.length - 1; i++) wall(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
    }
    // ---- the stone-faced raised verges along the entry road and before the north wall, the paved walks ----
    const stone = (ax: number, az: number, bx: number, bz: number) => {
      const [px, pz] = L(ax, az), [qx, qz] = L(bx, bz);
      c.push([run(px, pz, qx, qz, 0, 0.75, 0.45), '#8d877c'], [run(px, pz, qx, qz, 0.75, 0.82, 0.55), '#b4ada0']);
      const n = Math.ceil(Math.hypot(qx - px, qz - pz) / 0.55);
      for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = px + (qx - px) * t, z = pz + (qz - pz) * t; c.push([box(x - 0.24, x + 0.24, 0.05 + (i % 3) * 0.22, 0.27 + (i % 3) * 0.22, z - 0.24, z + 0.24), ['#7d776c', '#a39b8e', '#938b7f'][i % 3]]); }
      wallSolids(ax, az, bx, bz, 0.3);
    };
    const pave = (pts: [number, number][]) => {
      const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x - PO[0], -(z - PO[1]))))).rotateX(-Math.PI / 2).translate(0, 0.045, 0);
      const p = g.attributes.position, uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 2, p.getZ(i) / 2);
      const m = new THREE.Mesh(g, pavers('grey')); m.receiveShadow = true; k.meshes.push(m);
    };
    for (const s of [-1, 1]) {
      const [ax, az] = gp(-15, s * 5.0), [bx, bz] = gp(-2.2, s * 5.0);
      stone(ax, az, bx, bz);
      pave([gp(-16, s * 2.5), gp(-1, s * 2.5), gp(-1, s * 4.7), gp(-16, s * 4.7)]);
      // the painted posts along the walk's edge (grey with orange bands)
      for (let a = -14.5; a < -3; a += 1.8) {
        const [x, z] = L(...gp(a, s * 2.75));
        c.push([new THREE.CylinderGeometry(0.09, 0.1, 0.95, 8).translate(x, 0.475, z), '#6d6f72']);
        for (const y of [0.55, 0.78]) c.push([new THREE.CylinderGeometry(0.1, 0.1, 0.09, 8).translate(x, y, z), '#e0692a']);
      }
    }
    // before the north boundary wall: the walk at road level and the stone edge of the raised verge (Pair 14)
    {
      const [wx, wz] = wingEnd(-1), north = [WALL_N[1], WALL_N[2]], off = 4;
      const run2 = (a: [number, number], b2: [number, number]) => { const dx = b2[0] - a[0], dz = b2[1] - a[1], l = Math.hypot(dx, dz), nx = dz / l, nz = -dx / l; return [[a[0] + nx * off, a[1] + nz * off], [b2[0] + nx * off, b2[1] + nz * off]] as [[number, number], [number, number]]; };
      let prev: [number, number] = [wx, wz];
      for (const q of north as [number, number][]) { const [a, b2] = run2(prev, q); stone(a[0], a[1], b2[0], b2[1]); prev = q; }
    }
    // ---- the portrait boards by the entry road (Pair 12) ----
    PJ_BOARDS.forEach(([x, z, yw], i) => billboard(k, c, PO, x, z, yw, 1.5, 3.0, 0.5, i + 1));
    // ---- the dense trees inside the boundary, screening the school (Pairs 12-14) ----
    const TREES: [number, number, number][] = [[1049, -1186, 13], [1048, -1157, 12], [1057, -1196, 14], [1061, -1149, 13], [1054, -1216, 12], [1060, -1238, 14],
      [1066, -1262, 13], [1072, -1286, 14], [1043, -1137, 12], [1036, -1112, 13], [1027, -1090, 12], [1070, -1175, 15], [1078, -1205, 14], [1068, -1128, 13],
      [1046, -1178, 10], [1045, -1163, 10], [1052, -1228, 11], [1057, -1252, 11], [1063, -1274, 12], [1039, -1123, 10], [1050, -1146, 11], [1056, -1170, 12],
      [1064, -1188, 12], [1074, -1155, 13], [1084, -1182, 14], [1082, -1232, 13], [1074, -1250, 12]];
    for (const [x, z, h] of TREES) broadleaf(k, b.leaf, x, z, { h, spread: h * 1.05, seed: x * 1.3 + z, origin: PO });
    // and outside the boundary south of the entry, along the verge (Pairs 11, 12)
    for (const [x, z, h] of [[1022, -1118, 10], [1025, -1140, 11], [1018, -1100, 9]] as [number, number, number][]) if (roadGap(x, z) > 3) broadleaf(k, b.leaf, x, z, { h, spread: h, seed: x + z, origin: PO });
    finishParts(k, c);
    b.finish(k, 0.25);
  },
};

// ======================================================================================================
// R4, Pairs 15-20: the Bani side road, its wall and boards, the gathering ground, the sheds, the billboard, the
// roadside shops and the "Presec" stop
// ======================================================================================================
const BO: [number, number] = [930, -1200];
const baniSide: Spec = {
  name: 'Bani side road opposite PRESEC', axis: [1, 0], origin: BO, storey: 3, style: PLAIN, roofColor: '#c9c4ba', fascia: '#6d5a4a', pitch: 0,
  blocks: [],
  onGround: true,
  replaces: [],
  keep: [[945 - BO[0], 995 - BO[0], -1300 - BO[1], -1090 - BO[1]], [860 - BO[0], 945 - BO[0], -1192 - BO[1], -1090 - BO[1]], [860 - BO[0], 960 - BO[0], -1206 - BO[1], -1186 - BO[1]]],
  extras: (k: Kit) => {
    const b = new Bag(BO), c: Part[] = [], L = (x: number, z: number): [number, number] => [x - BO[0], z - BO[1]];
    // ---- the ground: the dusty mouth and verges, the open scrub south of the side road, the soil north of it ----
    k.meshes.push(ground(BO, [940, 996, -1222, -1186], dustCol));
    k.meshes.push(ground(BO, [860, 990, -1190, -1090], scrubCol));
    k.meshes.push(ground(BO, [945, 990, -1300, -1222], dustCol));
    shrubs(b, [860, 990, -1190, -1090], 320, 71, (x, z) => x > SHEDS[0][0] - 1 && x < SHEDS[1][1] + 1 && z > -1187 && z < -1179);
    shrubs(b, [945, 990, -1300, -1222], 90, 83);
    for (const [x, z, h] of [[902, -1150, 7], [930, -1120, 6], [880, -1110, 8], [948, -1165, 6.5], [915, -1170, 5.5], [960, -1135, 7]] as [number, number, number][]) {
      if (roadGap(x, z) > 3 && !inBuilding(x, z, 2)) broadleaf(k, b.leaf, x, z, { h, spread: h, sparse: true, seed: x + z, origin: BO });
    }
    // ---- the low grey block wall along the north side, broken where the Bani lane leaves; the boards on posts ----
    const wz = SIDE_Z - 6.4;
    for (const [x0, x1] of [[LOW_WALL[0], 894], [903.5, LOW_WALL[1]]]) {
      const [px, pz] = L(x0, wz), [qx] = L(x1, wz);
      c.push([box(px, qx, 0, 1.15, pz - 0.12, pz + 0.12), '#9a9890'], [box(px, qx, 1.15, 1.22, pz - 0.16, pz + 0.16), '#86847c']);
      for (let x = px; x <= qx; x += 3) c.push([box(x - 0.2, x + 0.2, 0, 1.3, pz - 0.2, pz + 0.2), '#8f8d85']);
      wallSolids(x0, wz, x1, wz, 0.25);
    }
    SIDE_BOARDS.forEach((x, i) => {
      const [px, pz] = L(x, wz + 1.1), lean = (hash(i, 2) - 0.5) * 0.12, w = 1.0 + hash(i, 5) * 0.8;
      for (const d of [-w * 0.35, w * 0.35]) c.push([box(px + d - 0.04, px + d + 0.04, 0, 2.0, pz - 0.04, pz + 0.04).rotateZ(lean), '#5d5f60']);
      c.push([box(px - w / 2, px + w / 2, 1.4, 2.2, pz - 0.03, pz + 0.03).rotateZ(lean), ['#f2f2ee', '#2d5ea8', '#f2f2ee', '#d6c08a', '#f2f2ee'][i % 5]]);
      SOLIDS.add(x, wz + 1.1, 0.25);
    });
    // ---- the poles with crossarms along the side road, their wires (Pairs 17, 19) ----
    {
      const tops = [960, 935, 910, 885, 860].map((x) => pole(c, BO, x, SIDE_Z - 4.6, [1, 0]));
      const spans: [V3, V3][] = [];
      for (let i = 0; i < tops.length - 1; i++) for (let j = 0; j < 3; j++) spans.push([tops[i][j], tops[i + 1][j]]);
      k.meshes.push(wires(spans, 0.7));
    }
    // ---- the shaded gathering ground at the mouth's north corner: the trees, the benches ----
    {
      const [x0, x1, z0, z1] = GATHER;
      for (const [x, z, h] of [[965, -1209, 7.5], [977, -1206, 8.5], [971, -1213, 6.5]] as [number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: h * 1.1, seed: x * 2 + z, origin: BO });
      for (const [x, z, yw] of [[967, -1204.5, 0.1], [974, -1210.5, 1.4], [980.5, -1210, 0.2]] as [number, number, number][]) {
        const [px, pz] = L(x, z);
        for (const q of [box(-1.1, 1.1, 0.42, 0.48, -0.22, 0.22), box(-1.0, -0.9, 0, 0.42, -0.2, 0.2), box(0.9, 1.0, 0, 0.42, -0.2, 0.2)]) c.push([q.rotateY(yw).translate(px, 0, pz), '#6b4f35']);
        SOLIDS.add(x, z, 0.7);
      }
      void x0; void x1; void z0; void z1;
    }
    // ---- the two small sheds on the south side (R4; provisional) ----
    for (const [x0, x1, z0, z1] of SHEDS) {
      const [px0, pz0] = L(x0, z0), [px1, pz1] = L(x1, z1);
      c.push([box(px0, px1, 0, 2.3, pz0, pz1), '#c9c4b6'], [box(px0 - 0.3, px1 + 0.3, 2.3, 2.4, pz0 - 0.4, pz1 + 0.5), '#9aa2a6']);
      wallSolids(x0, z0, x1, z0, 0.3); wallSolids(x0, z1, x1, z1, 0.3); wallSolids(x0, z0, x0, z1, 0.3); wallSolids(x1, z0, x1, z1, 0.3);
    }
    // ---- the elevated billboard over the corridor (Pairs 15, 16) ----
    billboard(k, c, BO, BIG_BB.x, BIG_BB.z, BIG_BB.yaw, BIG_BB.w, BIG_BB.h, BIG_BB.up, 5, true);
    // ---- the low roadside shops and the "Presec" stop's shelter on the west verge (Pair 20) ----
    for (const [i, r] of ROADSIDE.entries()) {
      const [dx, dz] = avDir(r.z), nx = dz, nz = -dx; // west, away from the road
      const cx = xW(r.z) + nx * ROADSIDE_OFF, cz = r.z + nz * ROADSIDE_OFF, [px, pz] = L(cx, cz), fy = Math.atan2(-nx, -nz);
      // (a: along the road, northward; d: away from the road, westward)
      const Q = (a: number, d: number): [number, number] => [px + dx * a + nx * d, pz + dz * a + nz * d];
      const ry = Math.atan2(-dz, dx); // a box's x along the road, its +z toward the road
      const bx = (x0: number, x1: number, y0: number, y1: number, d0: number, d1: number) => box(x0, x1, y0, y1, -d1, -d0).rotateY(ry).translate(px, 0, pz);
      if (r.kind === 'shelter') {
        for (const a2 of [-r.len / 2 + 0.3, r.len / 2 - 0.3]) for (const d of [-1.1, 1.1]) { const [qx, qz] = Q(a2, d); c.push([box(qx - 0.06, qx + 0.06, 0, 2.7, qz - 0.06, qz + 0.06), '#2456b0']); }
        c.push([bx(-r.len / 2 - 0.3, r.len / 2 + 0.3, 2.7, 2.85, -1.6, 1.6), '#3a6fb8']);
        c.push([bx(-r.len / 2, r.len / 2, 0.2, 2.4, 1.05, 1.15), '#e9e7e0'], [bx(-r.len / 2 + 0.6, r.len / 2 - 0.6, 0.42, 0.5, 0.4, 0.95), '#8a8f93']);
        for (const a2 of [-1.6, 1.6]) { const [qx, qz] = Q(a2, 1.02); const pm = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), adMat(a2 > 0 ? 2 : 3)); pm.position.set(qx, 1.4, qz); pm.rotation.y = fy; k.meshes.push(pm); }
        const [w0x, w0z] = Q(-r.len / 2, 1.1), [w1x, w1z] = Q(r.len / 2, 1.1);
        wallSolids(w0x + BO[0], w0z + BO[1], w1x + BO[0], w1z + BO[1], 0.25);
      } else {
        c.push([bx(-r.len / 2, r.len / 2, 0, 2.5, -1.2, 1.2), ['#2f63b0', '#3b74c4', '#d5d0c4'][i % 3]], [bx(-r.len / 2 - 0.4, r.len / 2 + 0.4, 2.5, 2.62, -1.4, 1.8), '#8a9196']);
        const [qx, qz] = Q(0, -1.23); const pm = new THREE.Mesh(new THREE.PlaneGeometry(r.len * 0.8, 1.3), adMat(i)); pm.position.set(qx, 1.6, qz); pm.rotation.y = fy; k.meshes.push(pm);
        SOLIDS.add(cx, cz, Math.max(1.2, r.len / 2));
      }
    }
    // ---- the leafy median trees north of the junction and the frontage trees (Pair 15), clear of the carriageways ----
    for (let z = -1112; z > -1185; z -= 13) {
      const x = (xW(z) + 0.6 * ((xE(z) - xW(z)) * 0.5)) + 1;
      if (roadGap(x, z) > 2.5) broadleaf(k, b.leaf, x, z, { h: 6 + hash(z, 1) * 2, spread: 5.5, seed: z, origin: BO });
    }
    finishParts(k, c);
    b.finish(k, 0.25);
  },
};

// ======================================================================================================
// the Bani blocks (R4 outlines; Pairs 15-19)
// ======================================================================================================
const winDark = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: string) => {
  g.fillStyle = frame; g.fillRect(x - 5, y - 5, w + 10, h + 10);
  const gl = g.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, '#3b4552'); gl.addColorStop(1, '#161c24');
  g.fillStyle = gl; g.fillRect(x, y, w, h); g.fillStyle = frame; g.fillRect(x + w / 2 - 2, y, 4, h);
};
/** the cream block (Pairs 15, 16, 18): cream walls, a pale floor band, a dark two-pane window to a bay */
const CREAM: Style = {
  bay: 3.0, up: [[78, 62, 100, 128]], ground: [[78, 256 + 62, 100, 128]],
  draw: (g) => { render(g, '#e2d3ac'); for (const y0 of [0, 256]) { g.fillStyle = '#f1ead6'; g.fillRect(0, y0, 256, 16); g.fillStyle = '#cbbd99'; g.fillRect(0, y0 + 16, 256, 3); winDark(g, 78, y0 + 62, 100, 128, '#efe8d6'); } },
};
/** the peach and pale block (Pair 19): peach walls with pale pilaster strips, dark windows in white frames */
const PEACH: Style = {
  bay: 3.4, up: [[80, 66, 96, 124]], ground: [[80, 256 + 66, 96, 124]],
  draw: (g) => { render(g, '#e2ab86'); g.fillStyle = '#efe2cc'; g.fillRect(0, 0, 26, 512); g.fillRect(230, 0, 26, 512); for (const y0 of [0, 256]) { g.fillStyle = '#efe2cc'; g.fillRect(0, y0, 256, 14); winDark(g, 80, y0 + 66, 96, 124, '#f4efe4'); } },
};
/** AC units on a face, where the photographs show them scattered (Pair 18) */
function acUnits(k: Kit, faces: { x0: number; x1: number; z: number; out: number }[], floors: number, storey: number, seed: number) {
  const c: Part[] = [];
  for (const f of faces) for (let fl = 0; fl < floors; fl++) for (let x = f.x0 + 1.5; x < f.x1 - 1; x += 3) {
    if (hash(x * 0.7 + fl, seed) > 0.22) continue;
    const y = fl * storey + 2.2;
    c.push([box(x - 0.4, x + 0.4, y, y + 0.55, Math.min(f.z, f.z + f.out * 0.38), Math.max(f.z, f.z + f.out * 0.38)), '#e4e4e0'], [box(x - 0.25, x + 0.25, y + 0.12, y + 0.43, f.z + f.out * 0.385, f.z + f.out * 0.39), '#4d5257']);
  }
  finishParts(k, c, 0.2);
}
const CR = BANI_CREAM, CRO = CR.pt;
const cream: Spec = {
  name: 'Bani block (cream, dark red hip roof)', axis: [1, 0], origin: CRO, storey: 3.1, style: CREAM, roofColor: '#7f2a22', fascia: '#efe8d6', pitch: 0.5,
  replaces: [CR.pt],
  blocks: [
    { x0: 908 - CRO[0], x1: 941 - CRO[0], z0: -1249.6 - CRO[1], z1: -1231.5 - CRO[1], floors: CR.floors },
    { x0: 925.5 - CRO[0], x1: 941 - CRO[0], z0: -1262.5 - CRO[1], z1: -1249.6 - CRO[1], floors: CR.floors },
  ],
  keep: [],
  extras: (k: Kit) => acUnits(k, [{ x0: 908 - CRO[0], x1: 941 - CRO[0], z: -1231.5 - CRO[1], out: 1 }], CR.floors, 3.1, 7),
};
const PE = BANI_PEACH, PEO = PE.pt;
const peachBlock: Spec = {
  name: 'Bani block (peach and pale, weathered tiled hip roof)', axis: [1, 0], origin: PEO, storey: 3.1, style: PEACH, roofColor: '#94503a', fascia: '#efe2cc', pitch: 0.55,
  replaces: [PE.pt],
  blocks: [{ x0: 876.2 - PEO[0], x1: 894.2 - PEO[0], z0: -1263.9 - PEO[1], z1: -1231.7 - PEO[1], floors: PE.floors }],
  keep: [],
  extras: (k: Kit) => {
    // the trees, palms and narrow conifer-like crowns screening its lower floors from the side road (Pair 19)
    const b = new Bag(PEO);
    for (const [x, z, h] of [[884, -1214, 9], [872, -1210, 7.5], [896, -1212, 8]] as [number, number, number][]) broadleaf(k, b.leaf, x, z, { h, spread: h * 0.9, seed: x + z * 2, origin: PEO });
    for (const [x, z] of [[878, -1222], [891, -1224]] as [number, number][]) {
      b.c.push([new THREE.CylinderGeometry(0.12, 0.16, 3, 6).translate(x - PEO[0], 1.5, z - PEO[1]), '#5a4a3b']);
      b.leaf.push([new THREE.ConeGeometry(1.3, 9, 7).translate(x - PEO[0], 7, z - PEO[1]), '#3f6a2a']);
      SOLIDS.add(x, z, 0.3);
    }
    b.finish(k, 0.25);
  },
};

export const baniPresecSite = createSite('bani-presec-ips', [corridor, junction, presec, baniSide, cream, peachBlock]);
