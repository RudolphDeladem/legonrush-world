// Turns the authoritative geography (data/geography/legon-master.geojson) into the compact
// campus data the game loads (src/data/legon-map.json): road network, building footprints,
// ground areas, named places, plus the campus boundary, zones and landmark registry for the
// geography inspector (/geo/). Usage: node scripts/geography/master-to-game.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { LAT0, LNG0, toLocal } from './lib.mjs';

const master = JSON.parse(readFileSync('data/geography/legon-master.geojson', 'utf8'));
const dm = (v) => Math.round(v * 10); // decimetres keep the JSON small
const pt = ([lng, lat]) => toLocal(lat, lng);
const flat = (ring) => ring.flatMap((c) => pt(c).map(dm));
const open = (ring) => ring.slice(0, -1); // GeoJSON rings repeat the first point
const Q = { high: undefined, medium: 1, low: 2 };
const by = (layer) => master.features.filter((f) => f.properties.layer === layer);

// ---------- road network: shared points become shared nodes ----------
const nodeIndex = new Map();
const nodes = [];
const roads = [];
for (const f of [...by('road'), ...by('path')]) {
  const p = f.properties;
  if (p.game === false) continue;
  const w = f.geometry.coordinates.map((c) => {
    const [x, z] = pt(c).map(dm);
    const k = `${x},${z}`;
    if (!nodeIndex.has(k)) { nodeIndex.set(k, nodes.length / 2); nodes.push(x, z); }
    return nodeIndex.get(k);
  }).filter((n, i, a) => i === 0 || n !== a[i - 1]);
  if (w.length < 2) continue;
  const road = { c: p.cls, w };
  if (p.name) road.n = p.name;
  roads.push(road);
}

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
  imagery: { src: 'geo/legon-sentinel2.webp', x0: img.x0, z0: img.z0, x1: img.x1, z1: img.z1, credit: 'Contains modified Copernicus Sentinel data 2025-2026' },
};
writeFileSync('src/data/legon-map.json', JSON.stringify(json));
console.log(`roads ${roads.length} (nodes ${nodes.length / 2}), buildings ${buildings.length}, areas ${areas.length}, places ${places.length}, zones ${zones.length}, landmarks ${landmarks.length}, ${(JSON.stringify(json).length / 1024).toFixed(0)} KB`);
