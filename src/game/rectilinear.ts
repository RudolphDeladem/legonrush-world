// Rectangles from a mapped footprint whose sides run (nearly) along two axes: the halls built round
// courts (Mensah Sarbah, Akuafo, Legon) are crosses, Ls and bars, which the block engine (blocks.ts)
// builds as rectangular blocks, each with its own roof.
//
// The ring's coordinates are clustered (sides a few decimetres off square line up), the grid of
// cells between them is kept where the ring covers it, and cells are merged into rectangles: first
// along x in each row, then rows with the same span are stacked.

export type Rect = [number, number, number, number];

function cluster(vals: number[], tol: number) {
  const s = [...vals].sort((a, b) => a - b), out: number[] = [];
  let group: number[] = [];
  for (const v of s) {
    if (group.length && v - group[group.length - 1] > tol) { out.push(group.reduce((a, b) => a + b) / group.length); group = []; }
    group.push(v);
  }
  if (group.length) out.push(group.reduce((a, b) => a + b) / group.length);
  return out;
}
const nearest = (vals: number[], v: number) => vals.reduce((b, x) => (Math.abs(x - v) < Math.abs(b - v) ? x : b), vals[0]);
function inside(ring: [number, number][], x: number, z: number) {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}

/** the rectangles [x0, x1, z0, z1] that make up a rectilinear ring (coordinates within `tol` merged); slivers under `min` m dropped */
export function rectsOf(ring: [number, number][], tol = 0.9, min = 1.5): Rect[] {
  const xs = cluster(ring.map((p) => p[0]), tol), zs = cluster(ring.map((p) => p[1]), tol);
  const snapped = ring.map(([x, z]) => [nearest(xs, x), nearest(zs, z)] as [number, number]);
  const nx = xs.length - 1, nz = zs.length - 1;
  const cell = (i: number, j: number) => inside(snapped, (xs[i] + xs[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2);
  // runs along x in each row
  const rows: [number, number][][] = [];
  for (let j = 0; j < nz; j++) {
    const runs: [number, number][] = [];
    for (let i = 0; i < nx; i++) {
      if (!cell(i, j)) continue;
      if (runs.length && runs[runs.length - 1][1] === i) runs[runs.length - 1][1] = i + 1;
      else runs.push([i, i + 1]);
    }
    rows.push(runs);
  }
  // stack rows with the same run
  const out: Rect[] = [];
  const used = rows.map((r) => r.map(() => false));
  for (let j = 0; j < nz; j++) rows[j].forEach(([a, b], k) => {
    if (used[j][k]) return;
    used[j][k] = true;
    let j1 = j + 1;
    for (; j1 < nz; j1++) {
      const m = rows[j1].findIndex(([c, d], q) => c === a && d === b && !used[j1][q]);
      if (m < 0) break;
      used[j1][m] = true;
    }
    const r: Rect = [xs[a], xs[b], zs[j], zs[j1]];
    if (r[1] - r[0] >= min && r[3] - r[2] >= min) out.push(r);
  });
  return out;
}
