// The workers' sheds round the unfinished frame behind Evandy Hostel's Annex B (the owner, 2026-10-17, picture 1 of
// that day: the three small buildings drawn there as generic rendered blocks with tile roofs are the huts where the
// frame's workers rest and keep their things, built of wine-coloured aluminium roofing sheet like a small house).
// Each stands on its mapped outline (the west one by the road, the near and far ones east of the frame): walls and a
// low gable roof of wine-red corrugated sheet on a light frame, a sheet door toward the frame, a small opening with a
// sheet flap. The door's side and the opening are not shown by the picture (chosen).
import * as THREE from 'three';
import { BUILDINGS } from './campusmap';
import { createSite, type Spec, type Style } from './blocks';
import { box, canvas, type Part } from './modelkit';
import { wallSolids } from './enkit';

type P2 = [number, number];
/** a point inside each mapped outline (west by the road, east near, east far) */
const AT: P2[] = [[522.3, -1382], [601.7, -1349.4], [594, -1415]];
/** the frame the doors face (evandyplan FRAME's centre) */
const FRAME_C: P2 = [551, -1370];
const O: P2 = [560, -1385];
const inRing = (r: P2[], x: number, z: number) => { let o = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > z) !== (r[j][1] > z) && x < ((r[j][0] - r[i][0]) * (z - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) o = !o; return o; };
const OUTLINES: P2[][] = AT.flatMap(([x, z]) => {
  const b = BUILDINGS.find((b) => x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ);
  if (!b) return [];
  const r: P2[] = []; for (let i = 0; i < b.pts.length; i += 2) r.push([b.pts[i], b.pts[i + 1]]);
  return inRing(r, x, z) ? [r] : [];
});
const rnd = (i: number) => { const s = Math.sin(i * 57.3 + 21.9) * 43758.5453; return s - Math.floor(s); };

// ---------- the wine-red corrugated sheet ----------
let SHEET: THREE.MeshStandardMaterial | null = null;
/** ribs along the texture's u (2 m a tile), faded and chalky patches, a little rust at the laps */
const sheetMat = () => (SHEET ??= (() => {
  const t = canvas(256, 256, (g) => {
    g.fillStyle = 'rgb(116,36,46)'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 40; i++) { const x = rnd(i) * 256, y = rnd(i + 70) * 256, r = 10 + rnd(i + 140) * 40; g.fillStyle = i % 2 ? 'rgba(150,70,78,0.22)' : 'rgba(80,22,30,0.22)'; g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2); g.fill(); }
    for (let x = 0; x < 256; x += 10) { g.fillStyle = 'rgba(255,225,225,0.13)'; g.fillRect(x, 0, 4, 256); g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x + 6, 0, 3, 256); }
    for (let i = 0; i < 18; i++) { const x = rnd(i + 300) * 256; g.fillStyle = 'rgba(110,55,25,0.35)'; g.fillRect(x, 0, 2 + rnd(i) * 3, 8 + rnd(i + 9) * 20); }
    g.fillStyle = 'rgba(40,10,15,0.4)'; g.fillRect(0, 0, 256, 3);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, metalness: 0.3, side: THREE.DoubleSide });
})());

/** a mesh from quads (four corners each) with their uvs */
function quads(list: { p: [number, number, number][]; uv: [number, number][] }[]) {
  const pos: number[] = [], uv: number[] = [];
  for (const q of list) for (const i of [0, 1, 2, 0, 2, 3]) { pos.push(...q.p[i]); uv.push(...q.uv[i]); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, sheetMat()); m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** eave height, the roof's pitch (rise over run), its overhang */
const EAVE = 2.4, PITCH = 0.25, OVH = 0.3;

const sheds: Spec = {
  name: "Workers' sheds by the unfinished frame behind Evandy", axis: [1, 0], origin: O, storey: 3, style: { bay: 4, up: [], ground: [], draw: (g) => { g.fillStyle = '#74242e'; g.fillRect(0, 0, 256, 512); } } as Style,
  roofColor: '#74242e', fascia: '#74242e', pitch: 0, blocks: [], onGround: true,
  replaces: AT,
  keep: OUTLINES.map((r) => { const xs = r.map((p) => p[0] - O[0]), zs = r.map((p) => p[1] - O[1]); return [Math.min(...xs) - 1.5, Math.max(...xs) + 1.5, Math.min(...zs) - 1.5, Math.max(...zs) + 1.5] as [number, number, number, number]; }),
  extras: (k) => {
    const p: Part[] = [];
    OUTLINES.forEach((ring, si) => {
      const r: P2[] = ring.map(([x, z]) => [x - O[0], z - O[1]]);
      const n = r.length;
      // the ring wound so that each edge's outward normal is (dz, -dx)
      let area = 0; for (let i = 0; i < n; i++) { const [ax, az] = r[i], [bx, bz] = r[(i + 1) % n]; area += ax * bz - bx * az; }
      if (area < 0) r.reverse();
      const edge = (i: number) => { const a = r[i], b = r[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]); return { a, b, L, ux: (b[0] - a[0]) / L, uz: (b[1] - a[1]) / L }; };
      // a low gable, its ridge along the shed's long axis (its longest edge) over the middle
      let li = 0; for (let i = 1; i < n; i++) if (edge(i).L > edge(li).L) li = i;
      const { ux, uz } = edge(li);
      const vOf = (x: number, z: number) => -x * uz + z * ux;
      const vs = r.map(([x, z]) => vOf(x, z)), v0 = Math.min(...vs), v1 = Math.max(...vs);
      const vm = (v0 + v1) / 2, hw = (v1 - v0) / 2;
      const top = (x: number, z: number) => EAVE + PITCH * (hw - Math.abs(vOf(x, z) - vm));
      let base = Infinity; for (const [x, z] of r) base = Math.min(base, k.ground(x, z));
      const Y = (y: number) => base + y;
      // the walls: each edge from a little under the ground up to the roof's underside, split under the ridge (the
      // gable ends)
      const walls: { p: [number, number, number][]; uv: [number, number][] }[] = [];
      const wall = (a: P2, b: P2, u0: number) => {
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ta = top(a[0], a[1]), tb = top(b[0], b[1]);
        walls.push({ p: [[a[0], Y(-0.2), a[1]], [b[0], Y(-0.2), b[1]], [b[0], Y(tb), b[1]], [a[0], Y(ta), a[1]]] as [number, number, number][], uv: [[u0, -0.1], [u0 + L / 2, -0.1], [u0 + L / 2, tb / 2], [u0, ta / 2]] as [number, number][] });
      };
      for (let i = 0; i < n; i++) {
        const { a, b } = edge(i), va = vOf(a[0], a[1]) - vm, vb = vOf(b[0], b[1]) - vm;
        if (va * vb < 0) { const t = va / (va - vb), m: P2 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; wall(a, m, 0); wall(m, b, Math.hypot(m[0] - a[0], m[1] - a[1]) / 2); }
        else wall(a, b, 0);
        wallSolids(a[0] + O[0], a[1] + O[1], b[0] + O[0], b[1] + O[1], 0.25);
      }
      k.meshes.push(quads(walls));
      // the roof: the outline pushed out by the overhang (mitred corners), cut along the ridge into its two slopes; the
      // ribs run down the slopes
      const out: P2[] = r.map((q, i) => {
        const e0 = edge((i - 1 + n) % n), e1 = edge(i), n0: P2 = [e0.uz, -e0.ux], n1: P2 = [e1.uz, -e1.ux];
        const mx = n0[0] + n1[0], mz = n0[1] + n1[1], d = mx * n1[0] + mz * n1[1] || 1;
        return [q[0] + (mx * OVH) / d, q[1] + (mz * OVH) / d];
      });
      /** the part of a ring on one side of the ridge (s: -1 below vm, 1 above) */
      const half = (ring: P2[], s: number) => {
        const o: P2[] = [], f = (q: P2) => s * (vOf(q[0], q[1]) - vm);
        for (let i = 0; i < ring.length; i++) {
          const a = ring[i], b = ring[(i + 1) % ring.length], fa = f(a), fb = f(b);
          if (fa >= 0) o.push(a);
          if (fa * fb < 0) { const t = fa / (fa - fb); o.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
        }
        return o;
      };
      const roof: { p: [number, number, number][]; uv: [number, number][] }[] = [];
      for (const s of [-1, 1]) {
        const hp = half(out, s);
        if (hp.length < 3) continue;
        const tg = new THREE.ShapeGeometry(new THREE.Shape(hp.map(([x, z]) => new THREE.Vector2(x, z))));
        const pos = tg.attributes.position as THREE.BufferAttribute, idx = tg.index!;
        for (let t = 0; t < idx.count; t += 3) {
          const c = [idx.getX(t), idx.getX(t + 1), idx.getX(t + 2)].map((j) => { const x = pos.getX(j), z = pos.getY(j); return { x, z, y: Y(top(x, z) + 0.06) }; });
          const uvq = (q: { x: number; z: number }): [number, number] => [(q.x * ux + q.z * uz) / 2, vOf(q.x, q.z) / 2];
          roof.push({ p: [[c[0].x, c[0].y, c[0].z], [c[1].x, c[1].y, c[1].z], [c[2].x, c[2].y, c[2].z], [c[2].x, c[2].y, c[2].z]] as [number, number, number][], uv: [uvq(c[0]), uvq(c[1]), uvq(c[2]), uvq(c[2])] });
        }
      }
      k.meshes.push(quads(roof));
      // the corner posts (light timber, weathered)
      for (let i = 0; i < n; i++) { const [x, z] = r[i]; p.push([box(x - 0.05, x + 0.05, Y(0), Y(top(x, z)), z - 0.05, z + 0.05), '#6a5642']); }
      // the door: on the long side facing the frame, a sheet leaf in a timber frame, a hasp; a small opening with a
      // propped sheet flap on the opposite side
      let di = -1, best = Infinity;
      for (let i = 0; i < n; i++) { const e = edge(i); if (e.L < 3) continue; const mx = (e.a[0] + e.b[0]) / 2, mz = (e.a[1] + e.b[1]) / 2, d = Math.hypot(mx - (FRAME_C[0] - O[0]), mz - (FRAME_C[1] - O[1])); if (d < best) { best = d; di = i; } }
      const onEdge = (i: number, t: number, w: number, y0: number, y1: number, off: number, col: string) => {
        const e = edge(i), nx = e.uz, nz = -e.ux, x = e.a[0] + e.ux * t + nx * off, z = e.a[1] + e.uz * t + nz * off;
        const g = new THREE.BoxGeometry(w, y1 - y0, 0.05).rotateY(-Math.atan2(e.uz, e.ux)).translate(x, Y((y0 + y1) / 2), z);
        p.push([g, col]);
      };
      if (di >= 0) {
        const t = edge(di).L * (0.3 + rnd(si) * 0.2);
        onEdge(di, t, 1.2, 0, 2.15, 0.03, '#6a5642');
        onEdge(di, t, 1.0, 0.05, 2.05, 0.06, '#5e1d26');
        onEdge(di, t + 0.38, 0.06, 1.0, 1.15, 0.1, '#3a3a3a');
        const oi = (di + Math.floor(n / 2)) % n, oe = edge(oi);
        if (oe.L > 3) { onEdge(oi, oe.L * 0.5, 1.0, 1.1, 1.7, 0.03, '#2a2422'); onEdge(oi, oe.L * 0.5, 1.0, 1.7, 1.78, 0.05, '#6a5642'); }
      }
    });
    k.plain.push(...p);
  },
};

/** the workers' sheds by the unfinished frame behind Evandy */
export const workerShedsSite = createSite('evandy-workers-sheds', [sheds]);
