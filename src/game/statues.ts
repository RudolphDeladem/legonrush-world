// The silver-painted figurative statues of the Balme Library front (the owner's Balme Library reconstruction audit,
// 2026-10-15: C18-C22, C29). Each figure is built from its own photo: posture, garment, props and base. A figure
// stands at the origin facing +z; its right hand is on the -x side. About 1.8 m tall on a low base; the roundabout's
// graduates are larger, on their tall plinth. Nothing here is measured: postures are read from the photos.
import * as THREE from 'three';
import { merge, type Part } from './modelkit';

type P = [number, number, number];
const V = (p: P) => new THREE.Vector3(...p);
const SILVER = '#a7abb1', SILVER_D = '#92979e';

/** a tapered round piece from a to b (radius r0 at a, r1 at b) */
function limb(a: P, b: P, r0: number, r1 = r0, seg = 9): THREE.BufferGeometry {
  const A = V(a), d = V(b).sub(A), len = d.length();
  const g = new THREE.CylinderGeometry(r1, r0, len, seg).translate(0, len / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
  return g.translate(A.x, A.y, A.z);
}
const ball = (p: P, r: number) => new THREE.SphereGeometry(r, 10, 8).translate(...p);

/** the joints of one figure; arms and legs as shoulder/hip, elbow/knee, hand/ankle */
interface Pose {
  hip: number; shoulder: number; lean?: number;
  rLeg: [P, P]; lLeg: [P, P]; rArm: [P, P]; lArm: [P, P];
  head?: P; garment: 'kit' | 'dress' | 'suit' | 'plain' | 'gown';
}

function figure(o: Pose, out: Part[]) {
  const c = SILVER, z = o.lean ?? 0, hy = o.hip, sy = o.shoulder;
  const sh = (s: number): P => [s * 0.19, sy, z];
  const hp = (s: number): P => [s * 0.095, hy, 0];
  // legs: thigh, shin, foot (the ankle's z picks the foot's direction: forward)
  for (const [s, [knee, ankle]] of [[-1, o.rLeg], [1, o.lLeg]] as [number, [P, P]][]) {
    const tr = o.garment === 'suit' || o.garment === 'plain' ? 0.08 : 0.075;
    out.push([limb(hp(s), knee, tr + 0.02, tr), c], [ball(knee, tr), c], [limb(knee, ankle, tr, 0.05), c]);
    if (o.garment === 'kit') out.push([limb([knee[0], knee[1] - 0.06, knee[2]], ankle, 0.068, 0.058), SILVER_D]);
    out.push([new THREE.BoxGeometry(0.1, 0.07, 0.25).translate(ankle[0], ankle[1] - 0.03, ankle[2] + 0.06), SILVER_D]);
  }
  // pelvis and torso (flattened front to back), neck and head
  out.push([new THREE.CylinderGeometry(0.17, 0.15, sy - hy + 0.05, 12).scale(1, 1, 0.62).translate(0, (sy + hy) / 2, z / 2), c]);
  out.push([new THREE.CylinderGeometry(0.15, 0.16, 0.16, 12).scale(1, 1, 0.65).translate(0, hy - 0.02, 0), c]);
  const head = o.head ?? [0, sy + 0.21, z];
  out.push([limb([0, sy - 0.02, z], [head[0] * 0.5, head[1] - 0.1, (head[2] + z) / 2], 0.055), c], [ball(head, 0.105).scale(1, 1, 1), c]);
  // arms: upper arm, forearm, hand
  for (const [s, [elbow, hand]] of [[-1, o.rArm], [1, o.lArm]] as [number, [P, P]][]) {
    const S = sh(s), sleeve = o.garment === 'kit' ? 0.065 : 0.058, gown = o.garment === 'gown';
    // a graduate's wide sleeve flares toward the elbow
    out.push([ball(S, gown ? 0.09 : 0.075), c], [limb(S, elbow, gown ? 0.085 : sleeve, gown ? 0.1 : 0.05), c], [limb(elbow, hand, 0.048, 0.04), c], [ball(hand, 0.05), c]);
  }
  // garments
  if (o.garment === 'kit') {
    // short-sleeved shirt over the shorts, the shorts flared over the thighs
    out.push([new THREE.CylinderGeometry(0.2, 0.2, 0.2, 12).scale(1, 1, 0.66).translate(0, hy - 0.05, 0), SILVER_D]);
  } else if (o.garment === 'dress') {
    // a long dress to mid-calf, a little fuller at the hem
    out.push([new THREE.CylinderGeometry(0.17, 0.3, hy - 0.26 + 0.12, 14).scale(1, 1, 0.72).translate(0, (hy + 0.12 + 0.26) / 2, 0.01), c]);
  } else if (o.garment === 'gown') {
    // a graduate's gown to the shins, its open front and wide sleeves; the stole down the chest
    out.push([new THREE.CylinderGeometry(0.19, 0.27, sy - 0.2, 14).scale(1, 1, 0.7).translate(0, (sy + 0.2) / 2 - 0.02, 0), c]);
    for (const s of [-1, 1]) out.push([new THREE.BoxGeometry(0.06, sy - 0.45, 0.02).translate(s * 0.07, (sy + 0.45) / 2, 0.205), SILVER_D]);
  } else if (o.garment === 'suit') {
    // the jacket to the hips, its lapels
    out.push([new THREE.CylinderGeometry(0.2, 0.2, sy - hy + 0.2, 12).scale(1, 1, 0.64).translate(0, (sy + hy - 0.2) / 2, z / 2), c]);
    for (const s of [-1, 1]) out.push([new THREE.BoxGeometry(0.05, 0.3, 0.02).rotateZ(s * 0.35).translate(s * 0.06, sy - 0.17, z / 2 + 0.13), SILVER_D]);
  }
}

/** the low base: a round disc on a square slab of pale stone (C19) */
function base(out: Part[], w = 0.9, disc = 0.36, layered = false) {
  out.push([new THREE.BoxGeometry(w, 0.12, w).translate(0, 0.06, 0), '#d8d4ca']);
  if (layered) out.push([new THREE.BoxGeometry(w * 0.8, 0.1, w * 0.8).translate(0, 0.17, 0), '#ccc8bf']);
  out.push([new THREE.CylinderGeometry(disc, disc, 0.07, 16).translate(0, layered ? 0.255 : 0.155, 0), SILVER_D]);
}

/** STAT-01 (C19, photo 53): a footballer in shirt, shorts and socks, the left leg bearing, the right foot on the ball before
 *  him, both arms held away from the body, hands low */
function footballer(out: Part[]) {
  base(out);
  const f: Part[] = [];
  figure({
    hip: 0.94, shoulder: 1.44, lean: 0.05, garment: 'kit',
    lLeg: [[0.12, 0.52, 0.1], [0.12, 0.09, -0.02]],
    rLeg: [[-0.15, 0.55, 0.13], [-0.2, 0.3, 0.12]],
    rArm: [[-0.34, 1.2, 0.07], [-0.42, 1.0, 0.15]],
    lArm: [[0.31, 1.18, 0.02], [0.39, 0.95, 0.12]],
    head: [0, 1.66, 0.07],
  }, f);
  f.push([ball([-0.2, 0.11, 0.23], 0.11), SILVER_D]);
  for (const [g, c] of f) out.push([g.translate(0, 0.19, 0), c]);
}

/** STAT-02 (C20, photo 18): a woman in a head-scarf and a long draped dress, one arm raised forward and up gripping a
 *  short cylinder that points down, her head turned up toward it; the other arm down under the drape. Which arm is
 *  raised is not fixed by the photo (open): the right is used. */
function draped(out: Part[]) {
  base(out, 0.8);
  const f: Part[] = [];
  figure({
    hip: 0.92, shoulder: 1.42, garment: 'dress',
    lLeg: [[0.08, 0.5, 0.03], [0.09, 0.09, 0.0]],
    rLeg: [[-0.08, 0.5, -0.02], [-0.1, 0.09, -0.05]],
    rArm: [[-0.17, 1.62, 0.25], [-0.12, 1.83, 0.46]],
    lArm: [[0.24, 1.15, -0.02], [0.24, 0.9, 0.05]],
    head: [0, 1.64, 0.03],
  }, f);
  // the cylinder held in the raised hand, pointing down
  f.push([limb([-0.12, 1.86, 0.48], [-0.12, 1.66, 0.5], 0.04, 0.035), SILVER_D]);
  // the scarf over the head and hanging down the back; the long drape from the shoulder to the knee on the right side
  f.push([new THREE.SphereGeometry(0.122, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.62).translate(0, 1.645, 0.0), SILVER]);
  f.push([new THREE.BoxGeometry(0.2, 0.42, 0.04).rotateX(0.18).translate(0, 1.43, -0.13), SILVER]);
  f.push([new THREE.BoxGeometry(0.06, 0.95, 0.24).rotateZ(-0.12).translate(-0.24, 1.0, -0.02), SILVER]);
  for (const [g, c] of f) out.push([g.translate(0, 0.19, 0), c]);
}

/** STAT-03 (C21, photo 14): a man in a suit standing upright, feet apart, holding a long rectangular object diagonally
 *  across his body, low at his right hip, high past his left shoulder (its identity is open) */
function suited(out: Part[]) {
  base(out, 0.95, 0.4, true);
  const f: Part[] = [];
  figure({
    hip: 0.96, shoulder: 1.46, garment: 'suit',
    lLeg: [[0.11, 0.5, 0.0], [0.13, 0.09, 0.02]],
    rLeg: [[-0.11, 0.5, 0.0], [-0.13, 0.09, 0.02]],
    rArm: [[-0.26, 1.17, 0.1], [-0.15, 1.04, 0.22]],
    lArm: [[0.25, 1.22, 0.14], [0.13, 1.34, 0.23]],
  }, f);
  const a = new THREE.Vector3(-0.55, 0.86, 0.25), b = new THREE.Vector3(0.48, 1.6, 0.24), d = b.clone().sub(a);
  f.push([new THREE.BoxGeometry(d.length(), 0.13, 0.06).rotateZ(Math.atan2(d.y, d.x)).translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2), SILVER_D]);
  for (const [g, c] of f) out.push([g.translate(0, 0.27, 0), c]);
}

/** STAT-04 (C29, the owner's arrowed figure in photo 52): an upright figure holding a book in one hand before the chest,
 *  the other arm down. The hand and the book's size are read from a small figure in the photo (open). */
function bookHolder(out: Part[]) {
  base(out, 0.8);
  const f: Part[] = [];
  figure({
    hip: 0.95, shoulder: 1.45, garment: 'plain',
    lLeg: [[0.1, 0.5, 0.0], [0.11, 0.09, 0.0]],
    rLeg: [[-0.1, 0.5, 0.0], [-0.11, 0.09, 0.0]],
    rArm: [[-0.25, 1.18, 0.06], [-0.08, 1.27, 0.2]],
    lArm: [[0.24, 1.17, 0.0], [0.26, 0.92, 0.03]],
  }, f);
  f.push([new THREE.BoxGeometry(0.2, 0.27, 0.05).rotateX(-0.25).translate(-0.06, 1.33, 0.23), SILVER_D]);
  for (const [g, c] of f) out.push([g.translate(0, 0.19, 0), c]);
}

/** the west lawn's near figure (the elevated reference only): a long robe to the feet, both arms held a little away
 *  from the sides. Its identity and props are open. */
function robed(out: Part[]) {
  base(out, 0.85);
  const f: Part[] = [];
  figure({
    hip: 0.94, shoulder: 1.44, garment: 'gown',
    lLeg: [[0.08, 0.5, 0.0], [0.1, 0.09, 0.02]],
    rLeg: [[-0.08, 0.5, 0.0], [-0.1, 0.09, 0.02]],
    rArm: [[-0.3, 1.18, 0.04], [-0.38, 0.95, 0.12]],
    lArm: [[0.3, 1.18, 0.04], [0.38, 0.95, 0.12]],
  }, f);
  for (const [g, c] of f) out.push([g.translate(0, 0.19, 0), c]);
}

/** the west lawn's middle figure (the elevated reference only): standing upright, arms at the sides (open) */
function standing(out: Part[]) {
  base(out, 0.8);
  const f: Part[] = [];
  figure({
    hip: 0.95, shoulder: 1.45, garment: 'plain',
    lLeg: [[0.1, 0.5, 0.0], [0.11, 0.09, 0.0]],
    rLeg: [[-0.1, 0.5, 0.0], [-0.11, 0.09, 0.0]],
    rArm: [[-0.25, 1.17, 0.02], [-0.26, 0.92, 0.06]],
    lArm: [[0.25, 1.17, 0.02], [0.26, 0.92, 0.06]],
  }, f);
  for (const [g, c] of f) out.push([g.translate(0, 0.19, 0), c]);
}

export type StatueKind = 'football' | 'draped' | 'suited' | 'book' | 'robed' | 'standing';
const BUILD: Record<StatueKind, (o: Part[]) => void> = { football: footballer, draped, suited, book: bookHolder, robed, standing };

let mat: THREE.MeshStandardMaterial | null = null;
/** silver paint: a little metallic sheen, not a mirror */
export const statueMat = () => (mat ??= new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.5, roughness: 0.38 }));

/** one statue at (x, y, z) facing the direction `yaw` (radians about +y; 0 faces +z) */
export function statue(kind: StatueKind, x: number, y: number, z: number, yaw = 0): THREE.Mesh {
  const parts: Part[] = [];
  BUILD[kind](parts);
  const m = new THREE.Mesh(merge(parts.map(([g, c]) => [g.rotateY(yaw).translate(x, y, z), c] as Part)), statueMat());
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** C22 (photo I066): two graduates side by side in caps and gowns, their inner arms raised together to a tall ribbed
 *  torch with a flame between their heads, on a tall rectangular stone plinth. Larger than life. */
export function graduates(x: number, y: number, z: number, yaw = 0): THREE.Mesh[] {
  const plinth: Part[] = [];
  const PH = 1.75;
  plinth.push([new THREE.BoxGeometry(1.7, PH, 1.25).translate(0, PH / 2, 0), '#cbc5b8']);
  plinth.push([new THREE.BoxGeometry(1.84, 0.1, 1.38).translate(0, PH + 0.05, 0), '#d9d4c8']);
  plinth.push([new THREE.BoxGeometry(0.62, 0.3, 0.02).translate(0, PH * 0.62, 0.63), '#8f8a80']);
  const p = new THREE.Mesh(merge(plinth.map(([g, c]) => [g.rotateY(yaw).translate(x, y, z), c] as Part)), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }));
  p.castShadow = true; p.receiveShadow = true;
  const f: Part[] = [];
  const S = 1.18;
  // the man on the left (seen from the front), his left arm raised holding the torch
  const man: Part[] = [];
  figure({
    hip: 0.95, shoulder: 1.46, garment: 'gown',
    lLeg: [[0.1, 0.5, 0.0], [0.12, 0.09, 0.02]], rLeg: [[-0.1, 0.5, 0.0], [-0.12, 0.09, 0.02]],
    rArm: [[-0.25, 1.17, 0.04], [-0.24, 0.93, 0.1]],
    lArm: [[0.31, 1.6, 0.1], [0.3, 1.86, 0.12]],
  }, man);
  // the woman on the right, her right arm raised to the torch beside his hand
  const woman: Part[] = [];
  figure({
    hip: 0.9, shoulder: 1.38, garment: 'gown',
    lLeg: [[0.09, 0.48, 0.0], [0.1, 0.09, 0.02]], rLeg: [[-0.09, 0.48, 0.0], [-0.1, 0.09, 0.02]],
    rArm: [[-0.3, 1.54, 0.1], [-0.34, 1.8, 0.12]],
    lArm: [[0.24, 1.12, 0.05], [0.25, 0.9, 0.1]],
  }, woman);
  // mortarboards: the flat square top on a band
  for (const [parts, h] of [[man, 1.67], [woman, 1.59]] as [Part[], number][]) {
    parts.push([new THREE.CylinderGeometry(0.11, 0.11, 0.07, 12).translate(0, h + 0.07, 0), SILVER_D]);
    parts.push([new THREE.BoxGeometry(0.32, 0.025, 0.32).rotateY(Math.PI / 4).translate(0, h + 0.115, 0), SILVER_D]);
  }
  for (const [g, c] of man) f.push([g.translate(-0.36, 0, 0), c]);
  for (const [g, c] of woman) f.push([g.translate(0.36, 0, 0), c]);
  // the torch: a ribbed shaft from the joined hands up to a flame
  for (let i = 0; i < 3; i++) f.push([new THREE.CylinderGeometry(0.06 - i * 0.004, 0.065 - i * 0.004, 0.1, 10).translate(-0.06, 1.8 + i * 0.11, 0.12), i % 2 ? SILVER : SILVER_D]);
  f.push([new THREE.CylinderGeometry(0.09, 0.05, 0.12, 10).translate(-0.06, 2.17, 0.12), SILVER]);
  f.push([new THREE.ConeGeometry(0.1, 0.28, 8).translate(-0.06, 2.37, 0.12), SILVER]);
  const g = new THREE.Mesh(merge(f.map(([gg, c]) => [gg.translate(0, 0.02, 0).scale(S, S, S).translate(0, PH + 0.1, 0).rotateY(yaw).translate(x, y, z), c] as Part)), statueMat());
  g.castShadow = true; g.receiveShadow = true;
  return [p, g];
}
