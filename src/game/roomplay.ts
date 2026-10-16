// Being in the allocated room (the owner's instructions of 2026-10-16): after the blur from the entrance the character
// walks round the room on foot (first person), turns and looks freely, reaches the furniture and works the room's parts
// (curtains, louvres, the balcony door, cupboards, the fan), steps out onto a balcony where the category has one, and
// sees the real campus out of the windows and from the balcony.
//
// The room itself is built away from the campus (roomkit.ts, ROOM_ORIGIN), so no other interior exists anywhere. For
// the view out, roomPose() places it in its building: on a long face of the residence's footprint, at the floor its
// room number gives, the window wall (or balcony) facing out. Each frame the campus is drawn first from that same eye
// position in the world, then the room over it; only the window openings and the open balcony let the campus show.
import * as THREE from 'three';
import { ROOM_ORIGIN, type BuiltRoom, type Interactable } from './roomkit';
import { residenceById, type Accommodation } from './residence';
import { ACCESS, BUILDINGS, buildingAt, buildingNear, placeByName, type Building } from './campusmap';
import { groundHeight } from './relief';
import { buildWalker } from './walker';
import type { RiderLook } from './models';

// ---------- the room's place in its building ----------
export interface RoomPose {
  /** room-group world coordinates (round ROOM_ORIGIN) to campus world coordinates */
  matrix: THREE.Matrix4;
  /** the building face the room looks out of (campus world): a point on it and its outward direction */
  face: { x: number; y: number; z: number; nx: number; nz: number };
  floor: number;
  building: string;
}
const hashStr = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
function inPoly(pts: Float32Array, x: number, z: number) {
  let c = false;
  for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
    const xi = pts[i], zi = pts[i + 1], xj = pts[j], zj = pts[j + 1];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
/** the residence's building (for blocks, the block's own place where the map has one) */
function residenceBuilding(acc: Accommodation): Building | null {
  const r = residenceById(acc.buildingId);
  if (!r) return null;
  const bi = r.blocks && acc.blockId ? r.blocks.findIndex((b) => b.id === acc.blockId) : -1;
  const names = bi >= 0 && r.places.length === r.blocks!.length ? [r.places[bi], ...r.places] : r.places;
  const pts: [number, number][] = [];
  for (const n of names) { const p = placeByName(n); if (p) pts.push([p.x, p.z]); const a = ACCESS.get(n); if (a) { const f = (a.facing * Math.PI) / 180; for (const d of [4, 9]) pts.push([a.entrance[0] + Math.sin(f) * d, a.entrance[1] - Math.cos(f) * d]); } }
  for (const e of r.entrances) { const f = (e.facing * Math.PI) / 180; for (const d of [4, 9, 15]) pts.push([e.at[0] + Math.sin(f) * d, e.at[1] - Math.cos(f) * d]); }
  for (const [x, z] of pts) { const b = buildingAt(x, z) ?? buildingNear(x, z, 3); if (b) return b; }
  // (an unnamed footprint a little way from the place's point: the nearest corner within 20 m)
  let best: Building | null = null, bd = 20;
  for (const b of BUILDINGS) for (const [x, z] of pts.slice(0, 3)) {
    if (x < b.minX - bd || x > b.maxX + bd || z < b.minZ - bd || z > b.maxZ + bd) continue;
    for (let i = 0; i < b.pts.length; i += 2) { const d = Math.hypot(b.pts[i] - x, b.pts[i + 1] - z); if (d < bd) { bd = d; best = b; } }
  }
  return best;
}
/**
 * Where the allocated room is in its building: a face of the footprint long enough for it (chosen from the room ID, so
 * the same room is always in the same place), the floor from the room number (capped by the building's height), the
 * room's outer face on the building's face. Inferred placement: the sources give no room-by-room survey.
 */
export function roomPose(acc: Accommodation, built: BuiltRoom): RoomPose | null {
  const b = residenceBuilding(acc);
  if (!b) return null;
  const n = b.pts.length / 2, need = 6;
  const edges: { ax: number; az: number; bx: number; bz: number; L: number }[] = [];
  for (let i = 0; i < n; i++) {
    const ax = b.pts[i * 2], az = b.pts[i * 2 + 1], bx = b.pts[((i + 1) % n) * 2], bz = b.pts[((i + 1) % n) * 2 + 1], L = Math.hypot(bx - ax, bz - az);
    if (L >= need) edges.push({ ax, az, bx, bz, L });
  }
  if (!edges.length) return null;
  const h = hashStr(`${acc.buildingId}|${acc.blockId ?? ''}|${acc.roomId}`);
  const e = edges[h % edges.length];
  const t = 0.2 + ((h >>> 8) % 1000) / 1000 * 0.6;
  const ux = (e.bx - e.ax) / e.L, uz = (e.bz - e.az) / e.L;
  const px = e.ax + ux * e.L * t, pz = e.az + uz * e.L * t;
  let nx = uz, nz = -ux;
  if (inPoly(b.pts, px + nx * 0.6, pz + nz * 0.6)) { nx = -nx; nz = -nz; }
  // the floor: the room number's first digit (1 = one floor up), within the building's storeys (3.15 m each)
  const m = /(\d)(\d\d)$/.exec(acc.roomId), want = m ? +m[1] : 1;
  const storeys = Math.max(1, Math.floor(((b.height ?? 12) - 0.6) / 3.15));
  const floor = Math.min(want, storeys - 1);
  const y = groundHeight(px, pz) + 0.45 + Math.max(0, floor) * 3.15;
  // room local: the facade point and its outward direction (group coordinates round ROOM_ORIGIN)
  const fl = new THREE.Vector3(ROOM_ORIGIN.x + built.facade.x, ROOM_ORIGIN.y, ROOM_ORIGIN.z + built.facade.z);
  const ang = (x: number, z: number) => Math.atan2(x, z);
  const yaw = ang(nx, nz) - ang(built.facade.nx, built.facade.nz);
  // the room's face 0.1 m inside the building's face
  const world = new THREE.Vector3(px - nx * 0.1, y, pz - nz * 0.1);
  const matrix = new THREE.Matrix4().makeTranslation(world.x, world.y, world.z).multiply(new THREE.Matrix4().makeRotationY(yaw)).multiply(new THREE.Matrix4().makeTranslation(-fl.x, -fl.y, -fl.z));
  return { matrix, face: { x: world.x, y, z: world.z, nx, nz }, floor, building: b.name ?? acc.buildingId };
}

// ---------- the occupants ----------
export interface Occupant {
  bed: number;
  kind: 'you' | 'player' | 'npc';
  name: string;
  look?: RiderLook;
  /** a real resident who is not in the game now still owns the place */
  online?: boolean;
}
const NPC_LOOKS: RiderLook[] = [
  { gender: 'male', body: 'regular', skin: '#5a3a24', outfit: 'jersey', jersey: '#2e6db4', helmet: '#f5c518', accessories: [] },
  { gender: 'female', body: 'slim', skin: '#6b4226', outfit: 'hall-tee', jersey: '#c0392b', helmet: '#f5c518', accessories: [] },
  { gender: 'male', body: 'broad', skin: '#4a2f1d', outfit: 'hoodie', jersey: '#3d3d3d', helmet: '#f5c518', accessories: [] },
  { gender: 'female', body: 'regular', skin: '#7a4b2e', outfit: 'jersey', jersey: '#16a34a', helmet: '#f5c518', accessories: [] },
  { gender: 'male', body: 'slim', skin: '#3d2516', outfit: 'hall-tee', jersey: '#8e44ad', helmet: '#f5c518', accessories: [] },
];
/** an NPC's look from its seat in the room (stable for the same room and bed) */
export const npcLook = (roomKey: string, bed: number) => NPC_LOOKS[hashStr(`${roomKey}#${bed}`) % NPC_LOOKS.length];

// ---------- walking in the room ----------
const R = 0.22, EYE = 1.6, SPEED = 1.5;
const segDist = (px: number, pz: number, [ax, az, bx, bz]: [number, number, number, number]) => {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L2));
  return Math.hypot(px - ax - dx * t, pz - az - dz * t);
};

export class RoomPlay {
  /** the character's feet (group-local x, z) and look */
  x = 0; z = 0; yaw = 0; pitch = -0.05;
  /** the working part within reach and in view, if any (one at a time) */
  focus: Interactable | null = null;
  readonly figures = new THREE.Group();
  private idle: { root: THREE.Object3D; t: number; arm: THREE.Object3D | null }[] = [];
  constructor(readonly built: BuiltRoom, readonly pose: RoomPose | null, readonly occupants: Occupant[], readonly roomKey: string) {
    const s = built.spawn.clone().sub(ROOM_ORIGIN);
    this.x = s.x; this.z = s.z; this.yaw = 0;
    if (!this.free(this.x, this.z)) {
      // (a spawn against furniture: the nearest clear spot)
      outer: for (let r = 0.1; r < 2; r += 0.1) for (let a = 0; a < Math.PI * 2; a += 0.4) if (this.free(s.x + Math.cos(a) * r, s.z + Math.sin(a) * r)) { this.x = s.x + Math.cos(a) * r; this.z = s.z + Math.sin(a) * r; break outer; }
    }
    this.figures.name = 'occupants';
    for (const o of occupants) if (o.kind !== 'you') this.addFigure(o);
    built.group.add(this.figures);
  }
  /** whether the character can stand at (x, z): on the floor of the unit, clear of walls, parapets and furniture */
  free(x: number, z: number) {
    const w = this.built.walk;
    if (!w.rects.some(([x0, z0, x1, z1]) => x >= x0 - 0.06 && x <= x1 + 0.06 && z >= z0 - 0.06 && z <= z1 + 0.06)) return false;
    for (const s of w.segs) if (segDist(x, z, s) < R) return false;
    for (const d of w.doors) if ((!d.door || !d.door.open) && segDist(x, z, d.seg) < R) return false;
    for (const [x0, z0, x1, z1] of w.boxes) if (x > x0 - 0.16 && x < x1 + 0.16 && z > z0 - 0.16 && z < z1 + 0.16) return false;
    return true;
  }
  /** a frame of walking and looking: fwd and strafe -1..1, turn -1..1 (keys), look -1..1 (a stick) */
  update(dt: number, fwd: number, strafe: number, turn: number, lookX: number, lookY: number) {
    this.yaw -= (turn * 2.0 + lookX * 2.2) * dt;
    this.pitch = Math.max(-1.1, Math.min(0.9, this.pitch - lookY * 1.5 * dt));
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw), rx = -fz, rz = fx;
    let mx = (fx * fwd + rx * strafe) * SPEED * dt, mz = (fz * fwd + rz * strafe) * SPEED * dt;
    const L = Math.hypot(mx, mz), cap = SPEED * dt;
    if (L > cap) { mx *= cap / L; mz *= cap / L; }
    if (L > 1e-5) {
      if (this.free(this.x + mx, this.z + mz)) { this.x += mx; this.z += mz; }
      else if (this.free(this.x + mx, this.z)) this.x += mx;
      else if (this.free(this.x, this.z + mz)) this.z += mz;
    }
    for (const it of this.built.interactables) it.update(dt);
    this.focus = this.pick();
    for (const f of this.idle) {
      f.t += dt;
      f.root.children[0].scale.set(1, 1 + Math.sin(f.t * 1.6) * 0.012, 1);
      if (f.arm) f.arm.rotation.x = -2.6 + Math.sin(f.t * 0.7) * 0.08;
    }
  }
  /** the nearest working part within reach (1.5 m) and roughly ahead, approached from the room side */
  private pick(): Interactable | null {
    let best: Interactable | null = null, bs = Infinity;
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
    for (const it of this.built.interactables) {
      const dx = it.at.x - this.x, dz = it.at.z - this.z, d = Math.hypot(dx, dz);
      if (it.kind === 'fan') { if (d < 1.0 && this.pitch > 0.2 && d < bs) { best = it; bs = d; } continue; }
      // (a window: the nearest point of its width; one leans over a bed to reach it)
      const reach = it.span ? segDist(this.x, this.z, it.span) : d;
      if (reach > 1.5) continue;
      if ((it.normal[0] || it.normal[1]) && it.normal[0] * -dx + it.normal[1] * -dz < 0) continue;
      // looking at it: toward its middle, or toward any part of a window's width
      let cos = d < 0.05 ? 1 : (fx * dx + fz * dz) / d;
      if (it.span) for (const t of [0.15, 0.5, 0.85]) { const qx = it.span[0] + (it.span[2] - it.span[0]) * t - this.x, qz = it.span[1] + (it.span[3] - it.span[1]) * t - this.z, qd = Math.hypot(qx, qz) || 1; cos = Math.max(cos, (fx * qx + fz * qz) / qd); }
      if (cos < 0.7) continue;
      const score = reach + (1 - cos) * 3;
      if (score < bs) { bs = score; best = it; }
    }
    return best;
  }
  interact() { const f = this.focus; if (!f) return null; f.toggle(); return f.label(); }
  /** the room camera: first person, at the character's eye */
  apply(cam: THREE.PerspectiveCamera) {
    cam.position.set(ROOM_ORIGIN.x + this.x, ROOM_ORIGIN.y + EYE, ROOM_ORIGIN.z + this.z);
    cam.lookAt(cam.position.x + Math.sin(this.yaw) * Math.cos(this.pitch), cam.position.y + Math.sin(this.pitch), cam.position.z + Math.cos(this.yaw) * Math.cos(this.pitch));
  }
  /**
   * The campus camera for the view out: the room camera carried into the world by the room's pose. Its near plane
   * starts 1.8 m beyond the building's face, so the building's own facade where the room is (drawn panes, frames,
   * balcony fronts standing proud of the footprint) never covers the openings; whatever is further out (the campus,
   * the building's other wings) is drawn as it is.
   */
  worldCamera(cam: THREE.PerspectiveCamera, out: THREE.PerspectiveCamera) {
    if (!this.pose) return false;
    cam.updateMatrixWorld();
    out.fov = cam.fov; out.aspect = cam.aspect; out.far = cam.far;
    const m = new THREE.Matrix4().multiplyMatrices(this.pose.matrix, cam.matrixWorld);
    m.decompose(out.position, out.quaternion, out.scale);
    const f = this.pose.face, dir = new THREE.Vector3(0, 0, -1).applyQuaternion(out.quaternion);
    const s = (f.x - out.position.x) * f.nx + (f.z - out.position.z) * f.nz;
    const cos = dir.x * f.nx + dir.z * f.nz;
    // (models stand a little proud of the map's footprints: balcony fronts, frames and panes up to ~1.5 m beyond it)
    out.near = s > 0 && cos > 0.05 ? Math.min(80, s / cos + 1.8) : 0.1;
    out.updateProjectionMatrix();
    out.updateMatrixWorld(true);
    return true;
  }
  private addFigure(o: Occupant) {
    const pl = this.built.places[o.bed];
    if (!pl) return;
    const w = buildWalker();
    w.setLook({ ...(o.look ?? npcLook(this.roomKey, o.bed)), accessories: [] });
    w.pose(0, 0);
    // lying on the mattress, face up, the head at the bed's head end; one arm raised (a phone or a book)
    const holder = new THREE.Group();
    w.root.rotation.x = Math.PI / 2;
    holder.add(w.root);
    const hx = pl.along === 'x' ? pl.head : 0, hz = pl.along === 'z' ? pl.head : 0;
    holder.rotation.y = Math.atan2(hx, hz);
    holder.position.set(pl.x - hx * 0.92, pl.h + 0.13, pl.z - hz * 0.92);
    this.figures.add(holder);
    // the walker's shoulder groups follow the hips (two each): the right arm is the last
    const arm = w.root.children.filter((c) => c instanceof THREE.Group).at(-1) ?? null;
    this.idle.push({ root: w.root, t: o.bed * 1.7, arm });
    if (o.kind === 'player') {
      // a real roommate's name over them
      const c = document.createElement('canvas'); c.width = 256; c.height = 48;
      const g = c.getContext('2d')!; g.fillStyle = 'rgba(10,16,32,.75)'; g.fillRect(0, 0, 256, 48); g.fillStyle = '#fff'; g.font = 'bold 24px sans-serif'; g.textAlign = 'center'; g.fillText(`${o.name}${o.online === false ? ' (offline)' : ''}`.slice(0, 22), 128, 32);
      const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false }));
      tag.scale.set(0.9, 0.17, 1); tag.position.set(pl.x, pl.h + 0.75, pl.z);
      this.figures.add(tag);
    }
  }
}

/** the buildings round which the rooms sit (for the checks): every residence finds its building */
export const residenceBuildingName = (acc: Accommodation) => residenceBuilding(acc)?.name ?? null;
export const BUILDING_COUNT = () => BUILDINGS.length;
