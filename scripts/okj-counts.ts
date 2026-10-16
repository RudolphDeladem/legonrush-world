// Counts the Okponglo junction's lanes at a transverse section of each zone, before and after its transition, from the
// built paint (okjunction.ts) and the built surface (okjplan.ts): the brief's mandatory count gates (RD-012).
// Run: npx --yes tsx scripts/okj-counts.ts
import { okjPaint } from '../src/game/okjunction';
import { armEdges, clz, eInner, eOuter, okjSurface, wInner, wOuter } from '../src/game/okjplan';
import { eastInner, westInner } from '../src/game/lbplan';

type P2 = [number, number];
// (the lines only: the arrows and stop lines are not lanes)
const { white } = okjPaint({ arrows: false, stops: false });
const tris: [P2, P2, P2][] = [];
for (let i = 0; i < white.idx.length; i += 3) {
  const v = (k: number): P2 => [white.pos[white.idx[k] * 3], white.pos[white.idx[k] * 3 + 2]];
  tris.push([v(i), v(i + 1), v(i + 2)]);
}
const G = 2, grid = new Map<string, number[]>();
tris.forEach((t, k) => {
  const xs = t.map((p) => p[0]), zs = t.map((p) => p[1]);
  for (let i = Math.floor(Math.min(...xs) / G); i <= Math.floor(Math.max(...xs) / G); i++)
    for (let j = Math.floor(Math.min(...zs) / G); j <= Math.floor(Math.max(...zs) / G); j++) { const key = `${i},${j}`; if (!grid.has(key)) grid.set(key, []); grid.get(key)!.push(k); }
});
const painted = (x: number, z: number) => (grid.get(`${Math.floor(x / G)},${Math.floor(z / G)}`) ?? []).some((k) => {
  const [a, b, c] = tris[k], s = (p: P2, q: P2) => (q[0] - p[0]) * (z - p[1]) - (q[1] - p[1]) * (x - p[0]);
  const d1 = s(a, b), d2 = s(b, c), d3 = s(c, a);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
});
/** lanes across [a, b] at `at` (along x for the N4, z for an arm): painted lines found within ±4.6 m along the road (the
 *  dashes repeat every 9 m), plus one; and the concrete width across the section */
function count(n4: boolean, at: number, a: number, b: number, ref: (v: number) => number) {
  const hit: number[] = [];
  for (let u = a + 0.6; u < b - 0.6; u += 0.05) {
    let on = false;
    for (let t = -4.6; t <= 4.6 && !on; t += 0.25) { const w = u + ref(at + t) - ref(at); on = n4 ? painted(w, at + t) : painted(at + t, w); }
    if (on) hit.push(u);
  }
  let lines = 0;
  hit.forEach((u, i) => { if (i === 0 || u - hit[i - 1] > 0.6) lines++; });
  let bay = 0, asphalt = 0;
  for (let u = a - 6; u < b + 6; u += 0.05) { const s = n4 ? okjSurface(u, at) : okjSurface(at, u); if (s === 2) bay += 0.05; if (s === 1) asphalt += 0.05; }
  if (process.env.DBG) { const cl: string[] = []; hit.forEach((u, i) => { if (i === 0 || u - hit[i - 1] > 0.6) cl.push(u.toFixed(2)); }); console.log(at, a.toFixed(2), b.toFixed(2), cl.join(' ')); }
  return { lanes: lines + 1, bay: +bay.toFixed(1), width: +(b - a).toFixed(1) };
}
const rows: [string, string, number, string, string][] = [];
const n4 = (zone: string, what: string, z: number, side: 'w' | 'e', want: string) => {
  const r = side === 'w' ? count(true, z, wOuter(z), westInner(z), westInner) : count(true, z, eastInner(z), eOuter(z), eastInner);
  rows.push([zone, what, z, `${r.lanes} lanes, ${r.width} m${r.bay ? ` + concrete bay ${r.bay} m` : ''}`, want]);
};
const arm = (zone: string, what: string, x: number, want: string) => {
  const [a, b] = armEdges(x), c = clz(x);
  const n = count(false, x, a, c, clz), s = count(false, x, c, b, clz);
  rows.push([zone, what, x, `${n.lanes + s.lanes} total (${n.lanes} north/westbound + ${s.lanes} south/eastbound), ${(b - a).toFixed(1)} m`, want]);
};
n4('1', 'far (north of the widening)', 1050, 'w', '3');
n4('1', 'near (approach)', 1150, 'w', '5 = 4 middle + 1 outer');
n4('2', 'near (by the junction)', 1175, 'e', '4 = 3 middle + 1 joining outer');
n4('2', 'far (beyond the merge)', 1080, 'e', '3');
n4('4', 'far (south of the widening)', 1390, 'e', '3');
n4('4', 'near (approach)', 1290, 'e', '5 = 4 middle + 1 outer');
n4('5', 'near (by the junction)', 1285, 'w', '4 asphalt');
n4('5', 'along the bay', 1360, 'w', '4 asphalt + 1 concrete');
n4('5', 'after the stop', 1470, 'w', '3');
arm('6', 'near (by the junction)', 951, '5 total: 2 in + 1 out middle, 2 outer');
arm('6', 'far (Jubilee Drive)', 925, '2 total, 1 each way');
arm('3', 'near (by the junction)', 1033, '5 total: 2 in + 1 out middle, 2 outer');
arm('3', 'far (La Bawaleshi Road)', 1064, '2 total, 1 each way');
for (const r of rows) console.log(`zone ${r[0]} | ${r[1]} | at ${r[2]} | ${r[3]} | required ${r[4]}`);
void eInner; void wInner;
