// Audits the legacy campus map against the rebuilt one and writes data/geography/legacy-audit.json.
// Run by hand after a rebuild: node scripts/geography/compare-legacy.mjs [git revision of the legacy map]
// (default 9b5b773, the last commit before the geographic reconstruction).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { area, centroid, pointInRing, toLocal } from './lib.mjs';

const rev = process.argv[2] ?? '9b5b773';
const legacy = JSON.parse(execFileSync('git', ['show', `${rev}:src/data/legon-map.json`], { maxBuffer: 1 << 26 }).toString());
const now = JSON.parse(readFileSync('src/data/legon-map.json', 'utf8'));
const pairs = (a) => { const o = []; for (let i = 0; i < a.length; i += 2) o.push([a[i] / 10, a[i + 1] / 10]); return o; };
const km = (m) => {
  const out = {};
  for (const r of m.roads) {
    let l = 0;
    for (let i = 1; i < r.w.length; i++) l += Math.hypot(m.nodes[r.w[i] * 2] - m.nodes[r.w[i - 1] * 2], m.nodes[r.w[i] * 2 + 1] - m.nodes[r.w[i - 1] * 2 + 1]) / 10;
    out[r.c] = (out[r.c] ?? 0) + l / 1000;
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [['arterial', 'collector', 'local', 'service', 'footpath'][k], Math.round(v * 10) / 10]));
};
const campus = pairs(now.boundary);
const nodeBox = (m) => { const p = pairs(m.nodes); return { minX: Math.min(...p.map((q) => q[0])), maxX: Math.max(...p.map((q) => q[0])), minZ: Math.min(...p.map((q) => q[1])), maxZ: Math.max(...p.map((q) => q[1])) }; };
// share of the campus covered by each map's buildings/roads extent: sample the campus on a 25 m grid
const [LX0, LZ1] = toLocal(5.633, -0.199), [LX1, LZ0] = toLocal(5.668, -0.175);
let n = 0, inLegacy = 0;
for (let z = -2100; z < 3000; z += 25) for (let x = -2300; x < 2300; x += 25) if (pointInRing(campus, [x, z])) { n++; if (x >= LX0 && x <= LX1 && z >= LZ0 && z <= LZ1) inLegacy++; }
const bc = (m) => m.buildings.map((b) => centroid(pairs(b.p)));
const legacyB = bc(legacy), nowB = bc(now);
const near = (list, p, d) => list.some((q) => Math.abs(q[0] - p[0]) < d && Math.abs(q[1] - p[1]) < d);
const placeMoves = [], removed = [], added = [];
for (const p of legacy.places) {
  const q = now.places.find((r) => r.n === p.n);
  if (!q) { removed.push(p.n); continue; }
  const d = Math.hypot(q.x - p.x, q.z - p.z) / 10;
  if (d > 1 || q.k !== p.k) placeMoves.push({ name: p.n, movedM: Math.round(d), from: [Math.round(p.x / 10), Math.round(p.z / 10)], to: [Math.round(q.x / 10), Math.round(q.z / 10)], ...(q.k !== p.k && { kind: `${p.k} -> ${q.k}` }) });
}
for (const q of now.places) if (!legacy.places.some((p) => p.n === q.n)) added.push({ name: q.n, kind: q.k, at: [Math.round(q.x / 10), Math.round(q.z / 10)], inCampus: pointInRing(campus, [q.x / 10, q.z / 10]) });
const audit = {
  legacyRevision: rev,
  campusAreaCoveredByLegacyExtract: Math.round((inLegacy / n) * 1000) / 1000,
  legacyHadCampusBoundary: !!legacy.boundary, legacyHadZones: !!legacy.zones, legacyHadLandmarkRegistry: !!legacy.landmarks,
  extent: { legacy: nodeBox(legacy), now: nodeBox(now) },
  roads: { legacy: { count: legacy.roads.length, nodes: legacy.nodes.length / 2, km: km(legacy) }, now: { count: now.roads.length, nodes: now.nodes.length / 2, km: km(now) } },
  buildings: {
    legacy: legacy.buildings.length, now: now.buildings.length,
    legacyOnCampus: legacyB.filter((p) => pointInRing(campus, p)).length, nowOnCampus: nowB.filter((p) => pointInRing(campus, p)).length,
    legacyNotInNew: legacyB.filter((p) => !near(nowB, p, 2)).length,
    newNotInLegacy: nowB.filter((p) => !near(legacyB, p, 2)).length,
    satelliteDetectedAdded: now.buildings.filter((b) => b.m).length,
    footprintAreaKm2: { legacy: Math.round(legacy.buildings.reduce((s, b) => s + area(pairs(b.p)), 0) / 1e3) / 1e3, now: Math.round(now.buildings.reduce((s, b) => s + area(pairs(b.p)), 0) / 1e3) / 1e3 },
  },
  areas: { legacy: legacy.areas.reduce((m, a) => ((m[a.k] = (m[a.k] ?? 0) + 1), m), {}), now: now.areas.reduce((m, a) => ((m[a.k] = (m[a.k] ?? 0) + 1), m), {}) },
  places: { legacy: legacy.places.length, now: now.places.length, removed, added, changed: placeMoves.sort((a, b) => b.movedM - a.movedM) },
};
writeFileSync('data/geography/legacy-audit.json', JSON.stringify(audit, null, 1));
console.log(JSON.stringify({ ...audit, places: { ...audit.places, added: audit.places.added.length, changed: audit.places.changed.length } }, null, 1));
