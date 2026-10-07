// Local ground relief on an otherwise flat campus. Everything that stands on the ground asks
// groundHeight(x, z): the ground patch, roads, verges, areas, props, the ridden route, the rider,
// rivals, coins and the camera. It is 0 everywhere outside the zones, so the rest of the campus is
// untouched.
//
// Two kinds of zone:
// - a hollow: a flat floor sunk below the surrounding ground with straight slopes back up (the
//   School of Engineering Sciences, below the road on its south);
// - Legon Hill: a ridge along the University Avenue axis rising west from the end of the avenue,
//   gently through Commonwealth Hall and on to the Great Hall at the top (the shape of the
//   Copernicus DEM, eased), falling away to the sides. Commonwealth's stairway from the gate
//   houses to the drive climbs it in terraced flights (the ground there is the stair surface).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface Hollow {
  kind: 'hollow';
  /** the sunken floor: x0..x1, z0..z1 (game metres) and how far below ground it is */
  x0: number; x1: number; z0: number; z1: number; depth: number;
  /** length of the slope on each side: west, east, north (z0 side), south (z1 side) */
  w: number; e: number; n: number; s: number;
}
interface Hill {
  kind: 'hill';
  /** height along x (piecewise linear, 0 at both ends) */
  profile: [number, number][];
  /** the ridge line, how far either side it keeps its full height, and how far it then falls away */
  zc: number; full: number; fall: number;
  /** stairs: x from the foot (x0) up to the top (x1), z0..z1, in flights of `steps` steps of `tread` m */
  stairs?: { x0: number; x1: number; z0: number; z1: number; flights: number; steps: number; tread: number };
}
type Zone = Hollow | Hill;

const ZONES: Zone[] = [
  // School of Engineering Sciences: the building, its forecourt and the car park on the floor;
  // the access road from the main road on the south comes down the 28 m slope
  { kind: 'hollow', x0: 372, x1: 498, z0: -458, z1: -372, depth: 4.5, w: 22, e: 20, n: 20, s: 28 },
  // Legon Hill: the end of the avenue (x -362) at 0; Commonwealth's stairway climbs 9 m to the drive and
  // the front block (x -464 to -500); the hall rises 6 m more to its west end; the Great Hall's summit
  // about 21 m up; then down again behind it
  {
    kind: 'hill', zc: 128, full: 150, fall: 140,
    profile: [[-1260, 0], [-1160, 11], [-1060, 21], [-960, 21], [-900, 19.5], [-780, 16.5], [-740, 15.5], [-500, 9.3], [-488, 9], [-464, 9], [-372, 0], [-362, 0]],
    stairs: { x0: -372, x1: -464, z0: 118, z1: 138, flights: 7, steps: 9, tread: 0.4 },
  },
];

const boxOf = (q: Zone) => q.kind === 'hollow'
  ? { x0: q.x0 - q.w, x1: q.x1 + q.e, z0: q.z0 - q.n, z1: q.z1 + q.s }
  : { x0: Math.min(...q.profile.map((p) => p[0])), x1: Math.max(...q.profile.map((p) => p[0])), z0: q.zc - q.full - q.fall, z1: q.zc + q.full + q.fall };
/** the area each zone touches */
export const RELIEF_BOXES = ZONES.map(boxOf);

/** a hill's height along its axis */
function profileAt(p: [number, number][], x: number) {
  for (let i = 0; i < p.length - 1; i++) {
    const [ax, ah] = p[i], [bx, bh] = p[i + 1];
    if (x >= ax && x <= bx) return ah + ((bh - ah) * (x - ax)) / (bx - ax || 1);
  }
  return 0;
}
/** the top of a stairway's tread at x: flights of steps going up from x0 toward x1, landings between */
function stairAt(s: NonNullable<Hill['stairs']>, top: number, x: number) {
  const dir = Math.sign(s.x1 - s.x0), len = Math.abs(s.x1 - s.x0), u = (x - s.x0) * dir;
  if (u <= 0) return 0;
  if (u >= len) return top;
  const seg = len / s.flights, rise = top / s.flights, r = rise / s.steps, k = Math.floor(u / seg), w = u - k * seg;
  return k * rise + Math.min(s.steps, Math.floor(w / s.tread) + 1) * r;
}
/** where the stairs of a hill are, and the height of their top */
export function stairsOf() {
  return ZONES.flatMap((q) => (q.kind === 'hill' && q.stairs ? [{ ...q.stairs, top: profileAt(q.profile, q.stairs.x1), at: (x: number) => stairAt(q.stairs!, profileAt(q.profile, q.stairs!.x1), x) }] : []));
}

/** inside a stairway of the hill (its steps are modelled: the ground mesh keeps below them) */
export function inStairs(x: number, z: number) {
  return ZONES.some((q) => q.kind === 'hill' && !!q.stairs && z > q.stairs.z0 && z < q.stairs.z1 && x < Math.max(q.stairs.x0, q.stairs.x1) && x > Math.min(q.stairs.x0, q.stairs.x1));
}

/** Height of the ground at a point (0 on the flat campus, negative in a hollow, positive on the hill). */
export function groundHeight(x: number, z: number) {
  let h = 0;
  for (let i = 0; i < ZONES.length; i++) {
    const q = ZONES[i], bx = RELIEF_BOXES[i];
    if (x < bx.x0 || x > bx.x1 || z < bx.z0 || z > bx.z1) continue;
    if (q.kind === 'hollow') {
      // how far up the slope, 0 on the floor, 1 at its top: the steeper of the two directions wins
      const tx = x < q.x0 ? (q.x0 - x) / q.w : x > q.x1 ? (x - q.x1) / q.e : 0;
      const tz = z < q.z0 ? (q.z0 - z) / q.n : z > q.z1 ? (z - q.z1) / q.s : 0;
      const t = Math.min(1, Math.max(tx, tz));
      h = Math.min(h, -q.depth * (1 - t));
    } else {
      const s = q.stairs;
      if (s && z > s.z0 && z < s.z1 && x <= Math.max(s.x0, s.x1) && x >= Math.min(s.x0, s.x1)) { h += stairAt(s, profileAt(q.profile, s.x1), x); continue; }
      const d = Math.abs(z - q.zc), t = d <= q.full ? 1 : d >= q.full + q.fall ? 0 : 1 - (d - q.full) / q.fall;
      h += profileAt(q.profile, x) * t * t * (3 - 2 * t);
    }
  }
  return h;
}

const inBox = (x: number, z: number, pad = 0) => RELIEF_BOXES.some((b) => x > b.x0 - pad && x < b.x1 + pad && z > b.z0 - pad && z < b.z1 + pad);

/** Adds points every `step` metres to the parts of a polyline inside a relief zone, so it can follow the slope. */
export function densify(pts: [number, number][], step = 2): [number, number][] {
  if (pts.length < 2 || !pts.some(([x, z]) => inBox(x, z, 40))) return pts;
  const out: [number, number][] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1], [bx, bz] = pts[i];
    const len = Math.hypot(bx - ax, bz - az);
    const n = inBox(ax, az, 5) || inBox(bx, bz, 5) || inBox((ax + bx) / 2, (az + bz) / 2, 5) ? Math.ceil(len / step) : 1;
    for (let k = 1; k <= n; k++) out.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
  }
  return out;
}

/**
 * Sets the ground under everything in a group: a merged world-space mesh has each vertex dropped
 * by the ground height at its x, z; an instanced mesh each instance by the height under its origin;
 * a placed object (a model, a sign, an arch) as a whole by the height under its position.
 */
export function applyRelief(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const m = new THREE.Matrix4(), v = new THREE.Vector3(), I = new THREE.Matrix4();
  const visit = (o: THREE.Object3D) => {
    if (o.name === 'relief-ground' || o.userData.noRelief) return;
    if (o !== root && !o.matrix.equals(I)) {
      // a placed object: it stands where its origin is
      o.getWorldPosition(v);
      const h = groundHeight(v.x, v.z);
      if (h !== 0) { o.position.y += h; o.updateMatrixWorld(true); }
      return;
    }
    const mesh = o as THREE.Mesh;
    if ((mesh as THREE.InstancedMesh).isInstancedMesh) {
      const im = mesh as THREE.InstancedMesh;
      let touched = false;
      for (let i = 0; i < im.count; i++) {
        im.getMatrixAt(i, m);
        const e = m.elements, h = groundHeight(e[12], e[14]);
        if (h !== 0) { e[13] += h; im.setMatrixAt(i, m); touched = true; }
      }
      if (touched) { im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); }
    } else if (mesh.isMesh && mesh.geometry) {
      const geo = mesh.geometry;
      if (!geo.boundingBox) geo.computeBoundingBox();
      const bb = geo.boundingBox!;
      if (RELIEF_BOXES.some((b) => bb.max.x > b.x0 && bb.min.x < b.x1 && bb.max.z > b.z0 && bb.min.z < b.z1)) {
        const pos = geo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
          const h = groundHeight(pos.getX(i), pos.getZ(i));
          if (h !== 0) pos.setY(i, pos.getY(i) + h);
        }
        pos.needsUpdate = true;
        geo.computeBoundingBox();
        geo.computeBoundingSphere();
      }
    }
    for (const c of o.children) visit(c);
  };
  visit(root);
}

/**
 * The ground over the relief zones: a grid that follows groundHeight, in the campus grass
 * material (its UVs line up with the flat ground tiles: u = x / tile, v = -z / tile).
 */
export function reliefGround(material: THREE.Material, tile: number) {
  const geos: THREE.BufferGeometry[] = [];
  for (const b of RELIEF_BOXES) {
    const cell = (b.x1 - b.x0) * (b.z1 - b.z0) > 200000 ? 4 : 2;
    const nx = Math.ceil((b.x1 - b.x0) / cell), nz = Math.ceil((b.z1 - b.z0) / cell);
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const x = b.x0 + ((b.x1 - b.x0) * i) / nx, z = b.z0 + ((b.z1 - b.z0) * j) / nz;
      pos.push(x, groundHeight(x, z) - (inStairs(x, z) ? 0.6 : 0), z);
      uv.push(x / tile, -z / tile);
    }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i, c = a + nx + 1;
      idx.push(a, c, a + 1, a + 1, c, c + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    geos.push(g);
  }
  const mesh = new THREE.Mesh(geos.length > 1 ? mergeGeometries(geos) : geos[0], material);
  mesh.receiveShadow = true;
  mesh.name = 'relief-ground';
  return mesh;
}
