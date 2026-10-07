// Destination access: for every place in the master geography, where you actually get in
// (the entrance), where a rider or walker stops on the network in front of it (the arrival
// point) and where a car can drop you (the drop-off). Built from evidence, in this order:
//   1. curated entries in data/geography/registry/access.json (written sources, mapped axes)
//   2. OpenStreetMap entrance=* nodes on the footprint
//   3. gates on an area's outline (gardens, stadium grounds)
//   4. mapped footways / drives that run up to the footprint (OSM topology: "path access")
//   5. otherwise the frontage facing the nearest routable way (low confidence, marked inferred)
// Writes data/geography/legon-access.geojson and data/geography/access-report.json.
// Usage: node scripts/geography/build-access.mjs (after build-master.mjs)
import { readFileSync, writeFileSync } from 'node:fs';
import { readOsm, toLocal, lngLat, pointInRing, bbox, centroid, distToLine, Grid, refsToRing } from './lib.mjs';

const G = 'data/geography';
const master = JSON.parse(readFileSync(`${G}/legon-master.geojson`, 'utf8'));
const CURATED = JSON.parse(readFileSync(`${G}/registry/access.json`, 'utf8'));
const osm = readOsm('data/legon.osm');
const pt = ([lng, lat]) => toLocal(lat, lng);
const ringOf = (f) => f.geometry.coordinates[0].slice(0, -1).map(pt);
const r1 = (v) => Math.round(v * 10) / 10;
const byId = new Map(master.features.map((f) => [f.id, f]));

// ---------- the routable network (what the game rides on) ----------
const ways = master.features.filter((f) => (f.properties.layer === 'road' || f.properties.layer === 'path') && f.properties.game !== false)
  .map((f) => ({ id: f.id, cls: f.properties.cls, hw: f.properties.class, name: f.properties.name, pts: f.geometry.coordinates.map(pt) }));
// connected components on shared points (same rule as the game: identical decimetre coordinates)
const key = ([x, z]) => `${Math.round(x * 10)},${Math.round(z * 10)}`;
const parent = new Map();
const find = (k) => { while (parent.get(k) !== k) { parent.set(k, parent.get(parent.get(k))); k = parent.get(k); } return k; };
const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
for (const w of ways) for (const p of w.pts) { const k = key(p); if (!parent.has(k)) parent.set(k, k); }
for (const w of ways) for (let i = 1; i < w.pts.length; i++) union(key(w.pts[i - 1]), key(w.pts[i]));
const compSize = new Map();
for (const k of parent.keys()) { const r = find(k); compSize.set(r, (compSize.get(r) ?? 0) + 1); }
const MAIN = [...compSize.entries()].sort((a, b) => b[1] - a[1])[0][0];
const onMain = (w) => find(key(w.pts[0])) === MAIN;
const network = ways.filter(onMain);
const segGrid = new Grid(40);
const segs = [];
for (const w of network) for (let i = 0; i < w.pts.length - 1; i++) {
  const a = w.pts[i], b = w.pts[i + 1];
  segs.push({ w, i, a, b });
  segGrid.add(segs.length - 1, bbox([a, b]));
}

// ---------- buildings, for line-of-sight ----------
const buildings = master.features.filter((f) => f.properties.layer === 'building' && f.properties.game !== false).map((f) => ({ id: f.id, ring: ringOf(f), name: f.properties.name }));
buildings.forEach((b) => (b.box = bbox(b.ring)));
const bGrid = new Grid(50);
buildings.forEach((b, i) => bGrid.add(i, b.box));
const buildingAt = (p) => { for (const i of bGrid.query({ minX: p[0], maxX: p[0], minZ: p[1], maxZ: p[1] })) if (pointInRing(buildings[i].ring, p)) return buildings[i]; return null; };
/** does the straight line a->b pass through a building (other than `except`)? sampled every 0.5 m */
function blocked(a, b, except = null) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  for (let s = 0.5; s < len - 0.5; s += 0.5) {
    const p = [a[0] + ((b[0] - a[0]) * s) / len, a[1] + ((b[1] - a[1]) * s) / len];
    const hit = buildingAt(p);
    if (hit && hit !== except) return hit;
  }
  return null;
}
/** the nearest point on the routable network to p, optionally limited to some ways and to points visible from p */
function nearestOnNetwork(p, { maxDist = 250, filter = () => true, visibleFrom = null, except = null } = {}) {
  let best = null;
  for (let r = 40; r <= maxDist * 2 && !best; r *= 2) {
    for (const i of segGrid.query({ minX: p[0] - r, maxX: p[0] + r, minZ: p[1] - r, maxZ: p[1] + r })) {
      const s = segs[i];
      if (!filter(s.w)) continue;
      const dx = s.b[0] - s.a[0], dz = s.b[1] - s.a[1], L = dx * dx + dz * dz;
      const t = L ? Math.max(0, Math.min(1, ((p[0] - s.a[0]) * dx + (p[1] - s.a[1]) * dz) / L)) : 0;
      const q = [s.a[0] + t * dx, s.a[1] + t * dz];
      const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (d > maxDist || (best && d >= best.dist)) continue;
      if (visibleFrom && blocked(visibleFrom, q, except)) continue;
      if (buildingAt(q)) continue; // never stop inside a building
      best = { p: q, dist: d, way: s.w, seg: s.i, t, heading: Math.atan2(dx, -dz) };
    }
  }
  return best;
}
const bearing = (h) => Math.round(((h * 180) / Math.PI + 360) % 360);
const ROAD = (w) => w.cls <= 3 && w.hw !== 'track';

// ---------- footprints of destinations ----------
const ringById = new Map();
for (const f of master.features) if ((f.properties.layer === 'building' || f.properties.layer === 'area') && f.geometry.type === 'Polygon') ringById.set(f.id, { ring: ringOf(f), layer: f.properties.layer, f });
const landmarkById = new Map(master.features.filter((f) => f.properties.layer === 'landmark').map((f) => [f.id.slice(9), f]));
/** an OSM way that is neither a building nor a ground area in the master (e.g. a hall's precinct) */
function osmRing(id) {
  const m = id.match(/^osm:way\/(\d+)$/);
  const w = m && osm.ways.get(m[1]);
  if (!w || w.refs.length < 4 || w.refs[0] !== w.refs[w.refs.length - 1]) return null;
  return { id, ring: refsToRing(osm, w.refs), layer: 'area', precinct: true };
}
function footprintOf(place) {
  const p = place.properties;
  const lm = p.landmark ?? place.id.match(/^place:landmark:(.+)$/)?.[1];
  if (lm) {
    const g = landmarkById.get(lm)?.properties.geometry;
    if (g && ringById.has(g)) return { id: g, ...ringById.get(g) };
    if (g && osmRing(g)) return osmRing(g);
  }
  const src = place.id.replace(/^place:/, '').replace(/:[a-z0-9-]+$/, (m) => (/^:(way|relation|node)\//.test(m) ? m : ''));
  if (ringById.has(src)) return { id: src, ...ringById.get(src) };
  if (osmRing(src)) return osmRing(src);
  const at = pt(place.geometry.coordinates);
  const b = buildingAt(at);
  if (b) return { id: b.id, ring: b.ring, layer: 'building' };
  return null;
}

// ---------- evidence for entrances ----------
const entranceNodes = [];
// staircase entrances are internal stairs, not ways in from outside
for (const [id, n] of osm.nodes) if (n.t?.entrance && !/^(service|emergency|exit|no|staircase)$/.test(n.t.entrance)) entranceNodes.push({ id: `osm:node/${id}`, p: n.p, kind: n.t.entrance, name: n.t.name });
const gates = master.features.filter((f) => f.properties.layer === 'gate').map((f) => ({ id: f.id, p: pt(f.geometry.coordinates), props: f.properties }));

/** mapped ways that run up to (touch or enter) a footprint: OSM's own record of how a building is reached */
function accessWays(ring, footprintId) {
  const out = [];
  const B = bbox(ring);
  for (const i of segGrid.query({ minX: B.minX - 4, maxX: B.maxX + 4, minZ: B.minZ - 4, maxZ: B.maxZ + 4 })) {
    const s = segs[i];
    for (const [end, other] of [[s.a, s.b], [s.b, s.a]]) {
      const inside = pointInRing(ring, end);
      const d = inside ? 0 : distToLine(end, ring, true);
      if (d > 3.5) continue;
      // the way must arrive from outside: a vertex at the outline whose neighbour lies outside
      if (pointInRing(ring, other) && !inside) continue;
      out.push({ p: end, from: other, way: s.w, inside, d });
    }
  }
  // one candidate per way end
  const seen = new Set();
  return out.filter((c) => { const k = `${c.way.id}|${key(c.p)}`; if (seen.has(k)) return false; seen.add(k); return true; }).map((c) => ({ ...c, footprintId }));
}
/** where the line from `outside` toward `inside` first meets the ring */
function hitRing(ring, from, to) {
  let best = null;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    const d1x = to[0] - from[0], d1z = to[1] - from[1], d2x = b[0] - a[0], d2z = b[1] - a[1];
    const den = d1x * d2z - d1z * d2x;
    if (Math.abs(den) < 1e-9) continue;
    const t = ((a[0] - from[0]) * d2z - (a[1] - from[1]) * d2x) / den, u = ((a[0] - from[0]) * d1z - (a[1] - from[1]) * d1x) / den;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1 && (!best || t < best.t)) best = { t, p: [from[0] + t * d1x, from[1] + t * d1z] };
  }
  return best?.p ?? null;
}
const nearestOnRing = (ring, p) => {
  let best = null;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    const dx = b[0] - a[0], dz = b[1] - a[1], L = dx * dx + dz * dz;
    const t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L)) : 0;
    const q = [a[0] + t * dx, a[1] + t * dz], d = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (!best || d < best.d) best = { p: q, d };
  }
  return best;
};
/** a point just outside the footprint, `off` metres from entrance e toward `toward` */
const stepOut = (ring, e, toward, off = 2.5) => {
  const dx = toward[0] - e[0], dz = toward[1] - e[1], l = Math.hypot(dx, dz) || 1;
  let q = [e[0] + (dx / l) * off, e[1] + (dz / l) * off];
  for (let k = 0; k < 6 && pointInRing(ring, q); k++) q = [q[0] + (dx / l), q[1] + (dz / l)];
  return q;
};

// ---------- resolve every destination ----------
const places = master.features.filter((f) => f.properties.layer === 'place');
const curatedByName = new Map(CURATED.destinations.map((d) => [d.place, d]));
const CAMPUS_GATE_NODES = new Set(CURATED.campusGates.flatMap((g) => g.osm.map((o) => `osm:${o}`)));
/** points where routable ways cross an area's outline, with the outside end of each crossing segment */
function areaCrossings(ring) {
  const out = [];
  const B = bbox(ring);
  for (const i of segGrid.query({ minX: B.minX - 2, maxX: B.maxX + 2, minZ: B.minZ - 2, maxZ: B.maxZ + 2 })) {
    const s = segs[i];
    const ia = pointInRing(ring, s.a), ib = pointInRing(ring, s.b);
    if (ia === ib) continue;
    const [outside, inside] = ia ? [s.b, s.a] : [s.a, s.b];
    const p = hitRing(ring, outside, inside);
    if (p) out.push({ p, outside, inside, way: s.w });
  }
  return out;
}
const out = [];
const problems = [];
const warnings = [];
const sourceOf = { curated: 0, 'osm-entrance': 0, gate: 0, 'path-access': 0, 'drive-access': 0, 'area-entry': 0, frontage: 0, point: 0 };
for (const place of places) {
  const name = place.properties.name;
  const at = pt(place.geometry.coordinates);
  const fp = footprintOf(place);
  const cur = curatedByName.get(name);
  let ent = null; // { p, type, method, evidence, conf, via? }
  // 1. curated
  if (cur) {
    const e = cur.entrance;
    let p = null;
    if (e.osm) { const n = osm.nodes.get(e.osm.replace('node/', '')); if (!n) throw new Error(`access ${name}: ${e.osm} missing`); p = n.p; }
    else if (e.gate) { const g = gates.find((q) => q.id === `osm:${e.gate}`); if (!g) throw new Error(`access ${name}: gate ${e.gate} missing`); p = g.p; }
    else if (e.axisFrom) {
      // the footprint side met by the line from a reference feature (e.g. the fountain the library faces)
      const ref = byId.get(e.axisFrom);
      const refRing = ref ? null : osmRing(e.axisFrom);
      if (!ref && !refRing) throw new Error(`access ${name}: ${e.axisFrom} missing`);
      const from = refRing ? centroid(refRing.ring) : ref.geometry.type === 'Polygon' ? centroid(ringOf(ref)) : pt(ref.geometry.coordinates);
      p = hitRing(fp.ring, from, centroid(fp.ring));
    } else if (e.wayEnd) {
      // where a named mapped way meets the footprint (crosses into an area, or runs up to a building)
      const cands = fp.layer === 'area' ? areaCrossings(fp.ring).filter((c) => c.way.id === `osm:${e.wayEnd}`) : accessWays(fp.ring, fp.id).filter((c) => c.way.id === `osm:${e.wayEnd}`);
      if (!cands.length) throw new Error(`access ${name}: way ${e.wayEnd} does not reach the footprint`);
      p = cands[0].p;
    } else if (e.building) {
      // the destination is entered through another mapped building (a hall's porters' lodge): its side facing the network
      const lodge = ringById.get(`osm:${e.building}`);
      if (!lodge) throw new Error(`access ${name}: ${e.building} missing`);
      let best = null;
      for (const v of lodge.ring) { const q = nearestOnNetwork(v, { maxDist: 120 }); if (q && (!best || q.dist < best.dist)) best = q; }
      p = best && nearestOnRing(lodge.ring, best.p).p;
    } else if (e.side) {
      // the middle of the footprint's side that faces a direction (compass), from mapped geometry
      const c = centroid(fp.ring), dir = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }[e.side];
      p = hitRing(fp.ring, [c[0] + dir[0] * 500, c[1] + dir[1] * 500], c);
    }
    if (!p) throw new Error(`access ${name}: curated entrance did not resolve`);
    ent = { p, type: cur.type, method: 'curated', evidence: cur.evidence, conf: cur.confidence ?? 'medium', cite: cur.cite };
  }
  if (!ent && fp) {
    // 2. OSM entrance nodes on the footprint
    const en = entranceNodes.filter((n) => (pointInRing(fp.ring, n.p) ? 0 : distToLine(n.p, fp.ring, true)) <= 3).sort((a, b) => (a.kind === 'main' ? -1 : 0) - (b.kind === 'main' ? -1 : 0))[0];
    if (en) ent = { p: en.p, type: en.kind === 'main' ? 'public entrance' : 'pedestrian', method: 'osm-entrance', evidence: `${en.id} entrance=${en.kind}`, conf: 'high' };
  }
  if (!ent && fp && fp.layer === 'area') {
    // 3. gates on the outline, else where the network crosses into the area
    const g = gates.filter((q) => !CAMPUS_GATE_NODES.has(q.id) && (distToLine(q.p, fp.ring, true) <= 6 || pointInRing(fp.ring, q.p)))[0];
    if (g) ent = { p: g.p, type: 'gate', method: 'gate', evidence: `${g.id} barrier=${g.props.class}`, conf: 'high' };
    else {
      // where mapped ways cross the outline from outside: roads first, then paths; the crossing nearest the place
      const crossings = areaCrossings(fp.ring).filter((c) => c.way.hw !== 'track');
      const best = crossings.sort((a, b) => (a.way.cls <= 2 ? 0 : a.way.cls === 3 ? 1 : 2) - (b.way.cls <= 2 ? 0 : b.way.cls === 3 ? 1 : 2) || Math.hypot(a.p[0] - at[0], a.p[1] - at[1]) - Math.hypot(b.p[0] - at[0], b.p[1] - at[1]))[0];
      if (best) ent = { p: best.p, type: best.way.cls === 4 ? 'path access' : 'vehicle', method: 'area-entry', evidence: `${best.way.id} (${best.way.hw}${best.way.name ? `, ${best.way.name}` : ''}) enters the area here`, conf: 'medium', via: { from: best.outside, way: best.way } };
    }
  }
  if (!ent && fp && fp.layer === 'building') {
    // 4. mapped ways running up to the building
    const cands = accessWays(fp.ring, fp.id).filter((c) => c.way.cls >= 3 && c.way.hw !== 'track');
    // footways first (front doors), then drives; dead ends (purpose-built approaches) before through-ways
    const score = (c) => (c.way.cls === 4 ? 0 : 10) + (c.way.hw === 'steps' ? 5 : 0) + c.d;
    const best = cands.sort((a, b) => score(a) - score(b))[0];
    if (best) {
      const footway = best.way.cls === 4;
      ent = { p: nearestOnRing(fp.ring, best.p).p, type: footway ? 'pedestrian' : 'drop-off', method: footway ? 'path-access' : 'drive-access', evidence: `${best.way.id} (${best.way.hw}) runs up to the building`, conf: 'medium', via: best };
    }
  }
  if (!ent && fp) {
    // 5. frontage: the side facing the nearest routable way, with a clear line between them
    let best = null;
    for (const v of fp.ring) {
      const q = nearestOnNetwork(v, { maxDist: 150 });
      if (q && (!best || q.dist < best.q.dist)) best = { v, q };
    }
    if (best) {
      const e = nearestOnRing(fp.ring, best.q.p).p;
      ent = { p: e, type: 'inferred frontage', method: 'frontage', evidence: 'no mapped entrance or access way: the side nearest the network', conf: 'low' };
    }
  }
  if (!ent) {
    // a point destination (bus stop, kiosk, shop without a footprint)
    ent = { p: at, type: 'point', method: 'point', evidence: 'mapped as a point', conf: 'medium' };
  }
  // an entrance mapped inside a building sits on its outline
  if (fp?.layer === 'building' && pointInRing(fp.ring, ent.p)) ent = { ...ent, p: nearestOnRing(fp.ring, ent.p).p };
  sourceOf[ent.method === 'curated' ? 'curated' : ent.method] = (sourceOf[ent.method === 'curated' ? 'curated' : ent.method] ?? 0) + 1;

  // ---------- arrival point on the network, visible from the entrance ----------
  const ownBuilding = fp?.layer === 'building' ? buildings.find((b) => b.id === fp.id) ?? null : null;
  const outside = fp?.layer === 'building' ? stepOut(fp.ring, ent.p, ent.via ? ent.via.from : centroid(fp.ring).map((v, i) => 2 * ent.p[i] - v)) : ent.p;
  let arr = null;
  if (cur?.arrival?.way) {
    arr = nearestOnNetwork(outside, { maxDist: 200, filter: (w) => w.id === `osm:${cur.arrival.way}` });
    if (!arr) throw new Error(`access ${name}: arrival way ${cur.arrival.way} not reachable`);
  }
  arr ??= nearestOnNetwork(outside, { maxDist: 200, visibleFrom: outside, filter: (w) => w.hw !== 'steps' });
  if (!arr && fp && ent.method !== 'curated' && ent.conf !== 'high' && !cur?.arrival) {
    // no clear line from that side: try every side of the footprint and take the closest clear approach
    let best = null;
    for (let i = 0; i < fp.ring.length; i++) {
      const a = fp.ring[i], b = fp.ring[(i + 1) % fp.ring.length];
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const o = stepOut(fp.ring, mid, [mid[0] + (b[1] - a[1]), mid[1] - (b[0] - a[0])]);
      if (pointInRing(fp.ring, o)) continue;
      const q = nearestOnNetwork(o, { maxDist: 150, visibleFrom: o, filter: (w) => w.hw !== 'steps' });
      if (q && (!best || q.dist < best.q.dist)) best = { q, mid, o };
    }
    if (best) { arr = best.q; ent = { ...ent, p: best.mid, evidence: `${ent.evidence}; the nearest side with a clear approach` }; }
  }
  arr ??= nearestOnNetwork(outside, { maxDist: 300 });
  if (!arr) { problems.push(`${name}: no network point within 300 m`); continue; }
  // vehicle drop-off: a proper road (not a footway or trail) in sight of the entrance
  const drop = nearestOnNetwork(outside, { maxDist: 200, filter: ROAD, visibleFrom: outside }) ?? nearestOnNetwork(outside, { maxDist: 400, filter: ROAD });
  const facing = Math.atan2(ent.p[0] - arr.p[0], -(ent.p[1] - arr.p[1]));
  const legBlocked = blocked(outside, arr.p);
  const rec = {
    place: name, placeId: place.id, kind: place.properties.class, footprint: fp?.id ?? null,
    entrance: ent.p, entranceType: ent.type, method: ent.method, evidence: ent.evidence, cite: ent.cite, confidence: ent.conf,
    arrival: arr.p, arrivalWay: arr.way.id, arrivalWayName: arr.way.name, arrivalWayClass: arr.way.hw, arrivalDistance: r1(arr.dist),
    approach: [bearing(arr.heading), bearing(arr.heading + Math.PI)], facing: bearing(facing),
    dropoff: drop?.p ?? null, dropoffWay: drop?.way.id ?? null, dropoffWayName: drop?.way.name, dropoffDistance: drop ? r1(drop.dist) : null,
    legClear: !legBlocked,
  };
  if (legBlocked) { rec.confidence = 'low'; rec.note = `the last few metres from the network to the entrance cross ${legBlocked.name ?? legBlocked.id} (an enclosed courtyard or a mapping gap)`; warnings.push(`${name}: ${rec.note}`); }
  if (buildingAt(arr.p)) problems.push(`${name}: arrival point inside a building`);
  out.push(rec);
}

// campus gates with their names from written sources
const campusGates = CURATED.campusGates.map((g) => {
  const ids = g.osm.map((o) => `osm:${o}`);
  const pts = g.osm.map((o) => osm.nodes.get(o.replace('node/', ''))).filter((n) => n?.t?.barrier).map((n) => n.p);
  if (pts.length !== ids.length) throw new Error(`campus gate ${g.name}: ${g.osm.join(', ')} are not all mapped barriers`);
  const p = [pts.reduce((s, q) => s + q[0], 0) / pts.length, pts.reduce((s, q) => s + q[1], 0) / pts.length];
  return { ...g, point: p };
});

// ---------- write ----------
const feature = (id, geometry, properties) => ({ type: 'Feature', id, properties, geometry });
const fc = {
  type: 'FeatureCollection',
  metadata: {
    title: 'University of Ghana, Legon: destination access registry',
    generator: 'scripts/geography/build-access.mjs',
    crs: 'EPSG:4326',
    methods: {
      curated: 'data/geography/registry/access.json: written sources or mapped geometry (cited)',
      'osm-entrance': 'OpenStreetMap entrance=* node on the footprint',
      gate: 'OpenStreetMap gate on the area outline',
      'area-entry': 'where a mapped road or path enters the area',
      'path-access': 'a mapped footway that runs up to the building',
      'drive-access': 'a mapped service drive that runs up to the building',
      frontage: 'inferred: the side nearest the network, no mapped access (low confidence)',
      point: 'the destination is mapped as a point',
    },
  },
  features: [
    ...out.flatMap((a) => [
      feature(`access:${a.placeId}`, { type: 'Point', coordinates: lngLat(a.entrance) }, { role: 'entrance', ...a, entrance: undefined, arrival: lngLat(a.arrival), dropoff: a.dropoff && lngLat(a.dropoff) }),
    ]),
    ...campusGates.map((g) => feature(`gate:${g.id}`, { type: 'Point', coordinates: lngLat(g.point) }, { role: 'campus-gate', ...g, point: undefined })),
  ],
};
writeFileSync(`${G}/legon-access.geojson`, JSON.stringify(fc));
const byConf = out.reduce((m, a) => ((m[a.confidence] = (m[a.confidence] ?? 0) + 1), m), {});
const report = {
  destinations: out.length, byMethod: sourceOf, byConfidence: byConf, campusGates: campusGates.length, problems, warnings,
  curated: out.filter((a) => a.method === 'curated').map((a) => ({ place: a.place, type: a.entranceType, arrivalOn: a.arrivalWayName ?? a.arrivalWayClass, arrivalDistance: a.arrivalDistance, facing: a.facing })),
  furthestArrivals: [...out].sort((a, b) => b.arrivalDistance - a.arrivalDistance).slice(0, 15).map((a) => ({ place: a.place, method: a.method, arrivalDistance: a.arrivalDistance })),
  networkPassagesThroughBuildings: (() => {
    const list = [];
    for (const w of network) for (let i = 0; i < w.pts.length - 1; i++) {
      const a = w.pts[i], b = w.pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      for (let s = 0.5; s < len; s += 1) { const p = [a[0] + ((b[0] - a[0]) * s) / len, a[1] + ((b[1] - a[1]) * s) / len]; const hit = buildingAt(p); if (hit && !list.some((l) => l.way === w.id && l.building === hit.id)) list.push({ way: w.id, wayName: w.name, building: hit.id, buildingName: hit.name }); }
    }
    return list;
  })(),
};
writeFileSync(`${G}/access-report.json`, JSON.stringify(report, null, 1));
if (problems.length) throw new Error(`destination access problems:\n  ${problems.join('\n  ')}`);
console.log(`access: ${out.length} destinations (${Object.entries(sourceOf).filter(([, v]) => v).map(([k, v]) => `${k} ${v}`).join(', ')}), confidence ${JSON.stringify(byConf)}, ${campusGates.length} campus gates`);
