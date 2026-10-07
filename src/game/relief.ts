// Local ground relief on an otherwise flat campus. Each zone is a flat floor sunk below the
// surrounding ground, with straight slopes rising back to ground level round it. Only the
// School of Engineering Sciences has one for now: the owner's photos and reference render
// show the building below the road, reached by going down a gentle hill from the road on
// the south.
//
// Everything that stands on the ground asks groundHeight(x, z): the ground patch, roads,
// verges, areas, props, the ridden route, the rider, rivals, coins and the camera. It is 0
// everywhere outside the zones, so the rest of the campus is untouched.
import * as THREE from 'three';

interface Zone {
  /** the sunken floor: x0..x1, z0..z1 (game metres) and how far below ground it is */
  x0: number; x1: number; z0: number; z1: number; depth: number;
  /** length of the slope on each side: west, east, north (z0 side), south (z1 side) */
  w: number; e: number; n: number; s: number;
}

const ZONES: Zone[] = [
  // School of Engineering Sciences: the building, its forecourt and the car park on the floor;
  // the access road from the main road on the south comes down the 28 m slope
  { x0: 372, x1: 498, z0: -458, z1: -372, depth: 4.5, w: 22, e: 20, n: 20, s: 28 },
];

/** the area each zone touches, floor and slopes */
export const RELIEF_BOXES = ZONES.map((z) => ({ x0: z.x0 - z.w, x1: z.x1 + z.e, z0: z.z0 - z.n, z1: z.z1 + z.s }));

/** Height of the ground at a point (0 on the flat campus, negative in a hollow). */
export function groundHeight(x: number, z: number) {
  let h = 0;
  for (const q of ZONES) {
    if (x < q.x0 - q.w || x > q.x1 + q.e || z < q.z0 - q.n || z > q.z1 + q.s) continue;
    // how far up the slope, 0 on the floor, 1 at its top: the steeper of the two directions wins
    const tx = x < q.x0 ? (q.x0 - x) / q.w : x > q.x1 ? (x - q.x1) / q.e : 0;
    const tz = z < q.z0 ? (q.z0 - z) / q.n : z > q.z1 ? (z - q.z1) / q.s : 0;
    const t = Math.min(1, Math.max(tx, tz));
    h = Math.min(h, -q.depth * (1 - t));
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
    if (o.name === 'relief-ground') return;
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
export function reliefGround(material: THREE.Material, tile: number, cell = 2) {
  const geos: THREE.BufferGeometry[] = [];
  for (const b of RELIEF_BOXES) {
    const nx = Math.ceil((b.x1 - b.x0) / cell), nz = Math.ceil((b.z1 - b.z0) / cell);
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const x = b.x0 + ((b.x1 - b.x0) * i) / nx, z = b.z0 + ((b.z1 - b.z0) * j) / nz;
      pos.push(x, groundHeight(x, z), z);
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
  const mesh = new THREE.Mesh(geos[0], material);
  mesh.receiveShadow = true;
  mesh.name = 'relief-ground';
  return mesh;
}
