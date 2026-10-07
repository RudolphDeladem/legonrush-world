// Turns the authoritative geography (data/geography/legon-master.geojson) into the compact
// campus data the game loads (src/data/legon-map.json): road network, building footprints,
// ground areas, named places, plus the campus boundary, zones and landmark registry for the
// geography inspector (/geo/). Usage: node scripts/geography/master-to-game.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { LAT0, LNG0, toLocal } from './lib.mjs';

const master = JSON.parse(readFileSync('data/geography/legon-master.geojson', 'utf8'));
const accessFc = JSON.parse(readFileSync('data/geography/legon-access.geojson', 'utf8'));
const dm = (v) => Math.round(v * 10); // decimetres keep the JSON small
const pt = ([lng, lat]) => toLocal(lat, lng);
const flat = (ring) => ring.flatMap((c) => pt(c).map(dm));
const open = (ring) => ring.slice(0, -1); // GeoJSON rings repeat the first point
const Q = { high: undefined, medium: 1, low: 2 };
const by = (layer) => master.features.filter((f) => f.properties.layer === layer);

// ---------- destination access points become nodes on the roads they lie on ----------
// (inserted on the existing segment, so road geometry does not change)
const splits = new Map(); // road feature id -> [x, z][] to insert
const ACCESS = accessFc.features.filter((f) => f.properties.role === 'entrance');
for (const f of ACCESS) {
  const p = f.properties;
  for (const [pos, way] of [[p.arrival, p.arrivalWay], [p.dropoff, p.dropoffWay]]) if (pos && way) splits.set(way, [...(splits.get(way) ?? []), pt(pos)]);
}
function withSplits(id, line) {
  const extra = splits.get(id);
  if (!extra) return line;
  const out = [line[0]];
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, az] = line[i], [bx, bz] = line[i + 1];
    const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz;
    const on = extra.map((q) => ({ q, t: L ? ((q[0] - ax) * dx + (q[1] - az) * dz) / L : 0, d: L ? Math.abs((q[0] - ax) * dz - (q[1] - az) * dx) / Math.sqrt(L) : Infinity }))
      .filter((o) => o.t > 0 && o.t < 1 && o.d < 0.05).sort((a, b) => a.t - b.t);
    for (const o of on) out.push(o.q);
    out.push(line[i + 1]);
  }
  return out;
}
// keys of the points the source roads already have; an access point on one of them is a real junction node
const original = new Set();
for (const f of [...by('road'), ...by('path')]) if (f.properties.game !== false) for (const c of f.geometry.coordinates) original.add(pt(c).map(dm).join(','));
const accessKeys = new Set();
for (const f of ACCESS) for (const pos of [f.properties.arrival, f.properties.dropoff]) if (pos) { const k = pt(pos).map(dm).join(','); if (!original.has(k)) accessKeys.add(k); }

// ---------- road network: shared points become shared nodes ----------
const nodeIndex = new Map();
const nodes = [];
const roads = [];
const TRAIL = new Set(['path', 'track', 'bridleway']);
for (const f of [...by('road'), ...by('path')]) {
  const p = f.properties;
  if (p.game === false) continue;
  const w = withSplits(f.id, f.geometry.coordinates.map(pt)).map((c) => {
    const [x, z] = c.map(dm);
    const k = `${x},${z}`;
    if (!nodeIndex.has(k)) { nodeIndex.set(k, nodes.length / 2); nodes.push(x, z); }
    return nodeIndex.get(k);
  }).filter((n, i, a) => i === 0 || n !== a[i - 1]);
  if (w.length < 2) continue;
  const road = { c: p.cls, w };
  if (p.name) road.n = p.name;
  // surface for campus routing: 1 informal trail (path/track), 2 steps
  if (TRAIL.has(p.class)) road.k = 1;
  if (p.class === 'steps') road.k = 2;
  roads.push(road);
}
// access points: entrance, the node to ride to (arrival) and the node a car stops at (drop-off)
const nodeAt = (pos) => { const k = pt(pos).map(dm).join(','); if (!nodeIndex.has(k)) throw new Error(`access node ${k} is not on the network`); return nodeIndex.get(k); };
const TYPE = { 'public entrance': 'e', 'campus gate': 'g', pedestrian: 'p', 'drop-off': 'v', vehicle: 'v', gate: 'g', 'path access': 'p', 'inferred frontage': 'i', point: 'o', 'public open space': 's', 'hall entrance': 'h', "hall entrance (porters' lodge)": 'h' };
// footprint outlines of the priority destinations, so the inspector can show building -> entrance -> forecourt -> road
const fpById = new Map(master.features.filter((f) => f.geometry.type === 'Polygon').map((f) => [f.id, f]));
const PRIORITY_FP = (p) => {
  if (p.status === 'mapped' || p.status === 'inferred' || !p.footprint) return null;
  const f = fpById.get(p.footprint);
  return f ? flat(open(f.geometry.coordinates[0])) : null;
};
const access = ACCESS.map((f) => {
  const p = f.properties;
  const a = nodeAt(p.arrival), d = p.dropoff ? nodeAt(p.dropoff) : a;
  const STATUS = { verified: 'v', partial: 'p', unverified: 'u', inferred: 'i', mapped: 'm' };
  const fpRing = PRIORITY_FP(p);
  return {
    n: p.place, e: pt(f.geometry.coordinates).map(dm), a, ...(d !== a && { d }), t: TYPE[p.entranceType] ?? 'o', f: p.facing, ...(Q[p.confidence] && { q: Q[p.confidence] }),
    s: STATUS[p.status] ?? 'i',
    // forecourt waypoints from the arrival point to the entrance
    ...(p.via && { v: p.via.flatMap((c) => pt(c).map(dm)) }),
    ...(fpRing && { fp: fpRing }),
  };
}).sort((x, y) => (x.n < y.n ? -1 : 1));
const accessNodes = [...accessKeys].map((k) => nodeIndex.get(k)).filter((i) => i !== undefined).sort((x, y) => x - y);
const gates = accessFc.features.filter((f) => f.properties.role === 'campus-gate').map((f) => { const [x, z] = pt(f.geometry.coordinates).map(dm); return { id: f.properties.id, n: f.properties.name, x, z }; });

// ---------- buildings ----------
const buildings = [];
for (const f of by('building')) {
  const p = f.properties;
  if (p.game === false) continue;
  const [outer, ...holes] = f.geometry.coordinates;
  const b = { p: flat(open(outer)) };
  if (p.height) b.h = p.height;
  if (p.name) b.n = p.name;
  if (holes.length) b.i = holes.map((h) => flat(open(h)));
  if (p.src[0] === 'google-open-buildings' || p.src[0] === 'microsoft-ml-buildings') b.m = 1; // satellite-detected only
  if (p.validated === false) b.u = 1; // on campus, but no satellite footprint matches the OSM outline
  if (p.conf === 'low') b.q = 2;
  buildings.push(b);
}

// ---------- ground areas the 3D world draws ----------
// drawn in this order, so pitches and pools inside parks stay visible
const GAME_AREAS = ['grass', 'wood', 'plaza', 'parking', 'pitch', 'track', 'water'];
const areas = [];
for (const f of by('area').sort((a, b) => GAME_AREAS.indexOf(a.properties.class) - GAME_AREAS.indexOf(b.properties.class))) {
  const p = f.properties;
  if (!GAME_AREAS.includes(p.class)) continue;
  areas.push({ k: p.class, p: flat(open(f.geometry.coordinates[0])) });
}

// ---------- places ----------
const places = by('place').map((f) => {
  const p = f.properties;
  const [x, z] = pt(f.geometry.coordinates);
  return { n: p.name, k: p.class, x: dm(x), z: dm(z), ...(p.lines && { l: p.lines }), ...(Q[p.conf] && { q: Q[p.conf] }) };
});

// ---------- inspector layers ----------
const boundary = flat(open(by('boundary')[0].geometry.coordinates[0]));
const zones = by('zone').map((f) => ({ id: f.id.replace(/^zone:/, ''), n: f.properties.name, k: f.properties.class, p: flat(open(f.geometry.coordinates[0])) }));
const landmarks = by('landmark').map((f) => {
  const p = f.properties;
  const [x, z] = pt(f.geometry.coordinates);
  return { id: f.id.replace(/^landmark:/, ''), n: p.name, x: dm(x), z: dm(z), i: p.importance, ...(Q[p.conf] && { q: Q[p.conf] }) };
});
const img = master.metadata.imagery;

const json = {
  attribution: 'Map data © OpenStreetMap contributors (ODbL), Google Open Buildings (CC BY 4.0), Microsoft ML Buildings (ODbL), Overture Maps; extra places from the UG Campus Map by enkayyy97.',
  origin: [LAT0, LNG0],
  nodes,
  roads,
  buildings,
  areas,
  lines: master.metadata.trotroLines,
  places,
  boundary,
  zones,
  landmarks,
  access,
  /** nodes that exist only as access points: legacy race routing ignores them */
  accessNodes,
  gates,
  imagery: { src: 'geo/legon-sentinel2.webp', x0: img.x0, z0: img.z0, x1: img.x1, z1: img.z1, credit: 'Contains modified Copernicus Sentinel data 2025-2026' },
};
writeFileSync('src/data/legon-map.json', JSON.stringify(json));
console.log(`roads ${roads.length} (nodes ${nodes.length / 2}), access ${access.length}, buildings ${buildings.length}, areas ${areas.length}, places ${places.length}, zones ${zones.length}, landmarks ${landmarks.length}, ${(JSON.stringify(json).length / 1024).toFixed(0)} KB`);
