// Builds the authoritative geography of the University of Ghana, Legon from independent sources:
//   OpenStreetMap (data/legon.osm, plus OSM features outside that extract via Overture),
//   Google Open Buildings and Microsoft ML footprints, Overture places (Meta, Microsoft, Foursquare),
//   the UG Campus Map, ESA WorldCover, the Copernicus DEM and the curated registries in
//   data/geography/registry/ (landmarks with written-source claims, zones, naming rules).
// Writes data/geography/legon-master.geojson (WGS84) and data/geography/reconciliation-report.json.
// See docs/LEGON_MASTER_GEOGRAPHY.md. Usage: node scripts/geography/build-master.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import {
  LAT0, LNG0, M_LAT, M_LNG, toLocal, ringLocal, lngLat, readOsm, relationRings, refsToRing, refsToLine,
  area, centroid, pointInRing, bbox, distToLine, lineLength, orientation, overlap, Grid, nameMatch, normName,
} from './lib.mjs';

const G = 'data/geography';
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const osm = readOsm('data/legon.osm');
const SRC = {
  supplement: json(`${G}/sources/overture-osm-supplement.geojson`),
  ml: json(`${G}/sources/overture-ml-buildings.geojson`),
  places: json(`${G}/sources/overture-places.geojson`),
  gob: json(`${G}/sources/google-open-buildings.geojson`),
  worldcover: json(`${G}/sources/esa-worldcover-campus.geojson`),
  dem: json(`${G}/sources/copernicus-dem-30m.json`),
  s2: json(`${G}/sources/sentinel2-composite.json`),
  ugPois: json(`${G}/sources/ug-campus-map-pois.json`),
  ugBoundary: json(`${G}/sources/ug-campus-map-boundary.json`),
};
const REG = { landmarks: json(`${G}/registry/landmarks.json`), zones: json(`${G}/registry/zones.json`), naming: json(`${G}/registry/naming.json`), corrections: json(`${G}/registry/corrections.json`) };
const SUSPECT = new Map(REG.corrections.exclude.map((e) => [e.id, e.reason]));
/** storey counts and heights the reference photos contradict */
const HEIGHT_FIX = new Map((REG.corrections.heights ?? []).map((e) => [e.id, e]));
/** ground areas the reference photos show as something else (a hall's paved back forecourt mapped as a car park) */
const RECLASS = new Map((REG.corrections.reclass ?? []).map((e) => [e.id, e]));
/** outlines that sit off the building the satellite footprints and owner imagery show: replaced by the measured ring */
const RESHAPE = new Map((REG.corrections.reshape ?? []).map((e) => [e.id, e]));
const r1 = (v) => Math.round(v * 10) / 10;
const features = [];
const report = { sources: {}, boundary: {}, roads: {}, buildings: {}, areas: {}, places: {}, landmarks: [], zones: [], conflicts: [] };

// ---------- campus boundary and study extent ----------
const BOUNDARY_WAY = '308668766';
const campusWay = osm.ways.get(BOUNDARY_WAY);
if (!campusWay) throw new Error(`campus boundary way ${BOUNDARY_WAY} is missing from data/legon.osm`);
const CAMPUS = refsToRing(osm, campusWay.refs);
const CAMPUS_BOX = bbox(CAMPUS);
const inCampus = (p) => pointInRing(CAMPUS, p);
// the legacy extract (5.633-5.668 N, 0.199-0.175 W) plus everything within 150 m of the campus
const [LX0, LZ1] = toLocal(5.633, -0.199), [LX1, LZ0] = toLocal(5.668, -0.175);
const inLegacyBox = ([x, z]) => x >= LX0 && x <= LX1 && z >= LZ0 && z <= LZ1;
const inContext = (p) => inLegacyBox(p) || inCampus(p) || distToLine(p, CAMPUS, true) <= 150;
const anyInContext = (pts) => pts.some(inContext);

// UG Campus Map's own outline against the OSM one
{
  const ug = SRC.ugBoundary.boundary.map(([lat, lng]) => toLocal(lat, lng));
  const d = ug.map((p) => distToLine(p, CAMPUS, true)).sort((a, b) => a - b);
  let both = 0, either = 0;
  const B = bbox([...CAMPUS, ...ug]);
  for (let z = B.minZ; z < B.maxZ; z += 20) for (let x = B.minX; x < B.maxX; x += 20) {
    const a = inCampus([x, z]), b = pointInRing(ug, [x, z]);
    if (a && b) both++;
    if (a || b) either++;
  }
  report.boundary = {
    source: `OpenStreetMap way ${BOUNDARY_WAY} (amenity=university, name=University of Ghana)`,
    areaKm2: r1(area(CAMPUS) / 1e5) / 10,
    perimeterKm: r1(lineLength([...CAMPUS, CAMPUS[0]]) / 100) / 10,
    vertices: CAMPUS.length,
    ugCampusMap: { vertices: ug.length, medianDistanceM: r1(d[Math.floor(d.length / 2)]), p90DistanceM: r1(d[Math.floor(d.length * 0.9)]), maxDistanceM: r1(d[d.length - 1]), areaOverlapIoU: Math.round((both / either) * 1000) / 1000 },
    legacyExtractCoverage: (() => { let n = 0, inside = 0; for (let z = CAMPUS_BOX.minZ; z < CAMPUS_BOX.maxZ; z += 25) for (let x = CAMPUS_BOX.minX; x < CAMPUS_BOX.maxX; x += 25) if (inCampus([x, z])) { n++; if (inLegacyBox([x, z])) inside++; } return Math.round((inside / n) * 1000) / 1000; })(),
  };
}
features.push({ id: 'osm:way/308668766', layer: 'boundary', class: 'campus', name: 'University of Ghana, Legon campus', conf: 'high', src: ['osm', 'ug-campus-map'], ring: CAMPUS });

// ---------- DEM ----------
const DEM = SRC.dem;
const demAt = ([x, z]) => {
  const { x0, z0, step, cols, rows } = DEM.frame;
  const c = (x - x0) / step - 0.5, r = (z - z0) / step - 0.5;
  const c0 = Math.max(0, Math.min(cols - 2, Math.floor(c))), r0 = Math.max(0, Math.min(rows - 2, Math.floor(r)));
  const fc = Math.max(0, Math.min(1, c - c0)), fr = Math.max(0, Math.min(1, r - r0));
  const v = (i, j) => DEM.dm[j * cols + i] / 10;
  return v(c0, r0) * (1 - fc) * (1 - fr) + v(c0 + 1, r0) * fc * (1 - fr) + v(c0, r0 + 1) * (1 - fc) * fr + v(c0 + 1, r0 + 1) * fc * fr;
};
let SUMMIT = null;
{
  const { x0, z0, step, cols, rows } = DEM.frame;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const p = [x0 + (i + 0.5) * step, z0 + (j + 0.5) * step];
    if (!inCampus(p)) continue;
    const h = DEM.dm[j * cols + i] / 10;
    if (!SUMMIT || h > SUMMIT.h) SUMMIT = { p, h };
  }
}

// ---------- roads and paths ----------
// game class: 0 arterial, 1 collector, 2 local, 3 service lane, 4 footpath
const ROAD_CLASS = {
  motorway: 0, trunk: 0, trunk_link: 0, primary: 0, primary_link: 0,
  secondary: 1, secondary_link: 1, tertiary: 1, tertiary_link: 1,
  unclassified: 2, residential: 2, living_street: 2,
  service: 3, track: 3,
  path: 4, footway: 4, pedestrian: 4, cycleway: 4, steps: 4, bridleway: 4,
};
const WIDTH = { 0: 12, 1: 8, 2: 6, 3: 4, 4: 2 };
const DEFAULT_WIDTH = { trunk: 14, trunk_link: 7, primary: 10, secondary: 8, tertiary: 7, unclassified: 6, residential: 5.5, living_street: 5, service: 4, track: 3, pedestrian: 4, footway: 2, path: 1.5, steps: 2, cycleway: 2, bridleway: 2 };
const roadWidth = (t) => {
  const w = parseFloat(t.width);
  if (w > 0 && w < 40) return [w, 'osm-width'];
  const lanes = parseInt(t.lanes, 10);
  if (lanes > 0 && lanes < 9) return [r1(lanes * 3.3), 'osm-lanes'];
  return [DEFAULT_WIDTH[t.highway] ?? WIDTH[ROAD_CLASS[t.highway]], 'class-default'];
};
let roadCount = 0;
function addRoad(id, pts, t, src) {
  const cls = ROAD_CLASS[t.highway];
  if (cls === undefined || pts.length < 2 || !anyInContext(pts)) return;
  // same exclusions as the game always had: parking aisles, mapped areas and private drives stay out of the network
  const game = !(t.service === 'parking_aisle' || t.area === 'yes' || t.access === 'private');
  const [width, widthSrc] = roadWidth(t);
  const named = !!t.name;
  const onCampus = pts.some(inCampus);
  features.push({
    id, layer: cls === 4 ? 'path' : 'road', class: t.highway, cls, name: t.name, width, widthSrc,
    oneway: t.oneway === 'yes' || t.junction === 'roundabout' || undefined, junction: t.junction, service: t.service, surface: t.surface, game,
    // network geometry agrees with the Sentinel-2 composite; informal paths and tracks are the least stable
    conf: cls === 4 || t.highway === 'track' ? 'medium' : named || cls <= 2 ? 'high' : onCampus ? 'high' : 'medium',
    src: [src], line: pts,
  });
  roadCount++;
}
for (const w of osm.ways.values()) if (w.t.highway && w.refs.length >= 2) addRoad(`osm:way/${w.id}`, refsToLine(osm, w.refs), w.t, 'osm');
// Overture segments: OSM ways missing from the extract (legacy clipping)
const OV_HIGHWAY = (p) => {
  const c = p.class;
  if (!c || c === 'unknown') return null;
  if (p.subclass === 'link') return `${c}_link`;
  if (p.subclass === 'sidewalk' || p.subclass === 'crosswalk') return 'footway';
  return c;
};
const supplementIds = new Set();
for (const f of SRC.supplement.features) {
  const p = f.properties;
  if (p.layer !== 'segment' || p.subtype !== 'road') continue;
  const hw = OV_HIGHWAY(p);
  if (!hw || f.geometry.type !== 'LineString') continue;
  const t = { highway: hw, name: p.name ?? undefined, service: p.subclass === 'parking_aisle' ? 'parking_aisle' : p.subclass === 'driveway' ? 'driveway' : undefined };
  const id = `osm:${p.osm.startsWith('w') ? 'way' : 'relation'}/${p.osm.slice(1)}`;
  // a way split into several Overture segments keeps one id per piece
  let k = id, n = 1;
  while (supplementIds.has(k)) k = `${id}#${++n}`;
  supplementIds.add(k);
  addRoad(k, ringLocal(f.geometry.coordinates), t, 'osm-via-overture');
}

// junctions: where three or more road ends meet, and roundabouts
{
  const key = ([x, z]) => `${Math.round(x * 10)},${Math.round(z * 10)}`;
  const deg = new Map();
  for (const f of features) {
    if (f.layer !== 'road' || !f.game) continue;
    f.line.forEach((p, i) => {
      const k = key(p);
      const d = deg.get(k) ?? { p, n: 0, names: new Set(), cls: 9 };
      d.n += i === 0 || i === f.line.length - 1 ? 1 : 2;
      if (f.name) d.names.add(f.name);
      d.cls = Math.min(d.cls, f.cls);
      deg.set(k, d);
    });
  }
  let n = 0;
  for (const [k, d] of deg) {
    if (d.n < 3 || !inContext(d.p) || d.cls > 3) continue;
    features.push({ id: `junction:${k}`, layer: 'junction', class: d.n >= 4 ? 'crossroads' : 'tee', cls: d.cls, name: d.names.size > 1 ? [...d.names].sort().join(' / ') : undefined, conf: 'high', src: ['osm'], point: d.p });
    n++;
  }
  report.roads.junctions = n;
}
{
  // roundabouts: chains of junction=roundabout ways joined into one ring
  const rw = features.filter((f) => (f.layer === 'road') && (f.junction === 'roundabout' || f.junction === 'circular'));
  const used = new Set();
  const rings = [];
  for (const f of rw) {
    if (used.has(f)) continue;
    used.add(f);
    let pts = [...f.line];
    const names = new Set(f.name ? [f.name] : []);
    let grown = true;
    while (grown && Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) > 0.5) {
      grown = false;
      for (const g of rw) {
        if (used.has(g)) continue;
        const end = pts[pts.length - 1];
        if (Math.hypot(g.line[0][0] - end[0], g.line[0][1] - end[1]) < 0.5) { pts = pts.concat(g.line.slice(1)); used.add(g); grown = true; if (g.name) names.add(g.name); }
      }
    }
    rings.push({ pts, names, ids: [f.id] });
  }
  for (const r of rings) {
    const c = centroid(r.pts);
    const radius = r.pts.reduce((s, p) => s + Math.hypot(p[0] - c[0], p[1] - c[1]), 0) / r.pts.length;
    if (radius < 3) continue;
    features.push({ id: `roundabout:${Math.round(c[0])},${Math.round(c[1])}`, layer: 'roundabout', class: 'roundabout', name: [...r.names].sort().join(' / ') || undefined, radius: r1(radius), conf: 'high', src: ['osm'], point: c, line: r.pts });
  }
  report.roads.roundabouts = rings.length;
}
// gates and entrances
for (const [id, n] of osm.nodes) {
  if (!n.t || !inContext(n.p)) continue;
  if (n.t.barrier === 'gate' || n.t.barrier === 'lift_gate' || n.t.entrance === 'main' || /\bgate\b/i.test(n.t.name ?? '') && n.t.highway !== 'bus_stop')
    features.push({ id: `osm:node/${id}`, layer: 'gate', class: n.t.barrier ?? 'entrance', name: n.t.name, access: n.t.access, conf: 'high', src: ['osm'], point: n.p });
}
{
  const km = {};
  for (const f of features) if (f.layer === 'road' || f.layer === 'path') km[f.class] = (km[f.class] ?? 0) + lineLength(f.line) / 1000;
  report.roads.count = roadCount;
  report.roads.kmByClass = Object.fromEntries(Object.entries(km).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, r1(v)]));
  report.roads.fromSupplement = features.filter((f) => (f.layer === 'road' || f.layer === 'path') && f.src[0] === 'osm-via-overture').length;
}

// ---------- buildings ----------
const isResidence = (t) => t.tourism === 'hostel' || t.building === 'dormitory' || /\b(hall|hostel|annex)\b/i.test(t.name ?? '') && !/great hall|lecture|dining|dinning|library|assembly/i.test(t.name ?? '');
function buildingCategory(t) {
  const n = t.name ?? '';
  if (isResidence(t)) return 'residence';
  if (/church|chapel|mosque|cathedral|temple/.test(t.building ?? '') || t.amenity === 'place_of_worship') return 'religious';
  if (/hospital|clinic|doctors|pharmacy/.test(t.amenity ?? '') || /hospital|clinic|medical/i.test(n)) return 'health';
  if (/registry|administration|admin|post office|police|fire|porters/i.test(n) || t.office || /police|fire_station|post_office|townhall/.test(t.amenity ?? '')) return 'civic';
  if (/university|college|school|library|research|kindergarten/.test(t.amenity ?? '') || /university|college|school/.test(t.building ?? '') || /dep(artmen)?t|school|faculty|institute|centre|center|college|lab|library|lecture|block|studies|science|archive|auditorium/i.test(n)) return 'academic';
  if (t.shop || /restaurant|cafe|fast_food|bank|marketplace|food_court|pub|bar/.test(t.amenity ?? '') || /retail|commercial|kiosk|supermarket/.test(t.building ?? '') || /bank|market|cafeteria|canteen|shop/i.test(n)) return 'commercial';
  if (t.leisure || /sports_hall|stadium|grandstand|pavilion/.test(t.building ?? '')) return 'sport';
  if (/^(house|detached|residential|apartments|semidetached_house|bungalow|terrace)$/.test(t.building ?? '')) return 'housing';
  if (/garage|garages|shed|hut|service|toilets|transformer_tower|water_tower|roof|carport|storage_tank|construction/.test(t.building ?? '') || t.man_made) return 'utility';
  return 'unknown';
}
function buildingHeight(t, pts) {
  const height = parseFloat(t.height), levels = parseFloat(t['building:levels']);
  if (height > 0) return [Math.round(height), 'osm-height'];
  if (levels > 0) return [Math.round(levels * 3.4 + 1), 'osm-levels'];
  // halls without a mapped height: Valco 3 storeys (meqasa), others estimated from footprint size (unchanged from the legacy map)
  if (isResidence(t)) return [Math.round((/valco/i.test(t.name ?? '') ? 3 : area(pts) > 1200 ? 4 : 3) * 3.4 + 1), 'estimated-residence'];
  return [undefined, undefined];
}
const buildings = [];
function addBuilding(id, rings, t, src) {
  const reshape = RESHAPE.get(id);
  const [outer, ...holes] = reshape ? [reshape.ring.map(([x, z]) => [x, z]), ...rings.slice(1)] : rings;
  if (outer.length < 3) return;
  const c = centroid(outer);
  if (!anyInContext(outer)) return; // like the legacy extract: anything reaching into the study area
  const fix = HEIGHT_FIX.get(id);
  const [h, hSrc] = fix ? [fix.height, 'reference-photos'] : buildingHeight(t, outer);
  const b = {
    id, layer: 'building', class: buildingCategory(t), osmBuilding: t.building, name: t.name, levels: fix?.levels ?? (t['building:levels'] ? +t['building:levels'] : undefined),
    height: h, heightSrc: hSrc, area: Math.round(area(outer)), orient: orientation(outer), onCampus: inCampus(c),
    src: [src], ring: outer, holes, c, box: bbox(outer),
  };
  buildings.push(b);
}
for (const w of osm.ways.values()) {
  if (!w.t.building || w.t.building === 'construction' || w.t.building === 'roof' || w.t.building === 'no') continue;
  if (w.refs.length < 4 || w.refs[0] !== w.refs[w.refs.length - 1]) continue;
  addBuilding(`osm:way/${w.id}`, [refsToRing(osm, w.refs)], w.t, 'osm');
}
for (const rel of osm.relations.values()) {
  if (rel.t.type !== 'multipolygon' || !rel.t.building) continue;
  const inners = relationRings(osm, rel, true).map((r) => refsToRing(osm, r));
  relationRings(osm, rel).forEach((r, i) => {
    const outer = refsToRing(osm, r);
    addBuilding(`osm:relation/${rel.id}${i ? `#${i + 1}` : ''}`, [outer, ...inners.filter((h) => pointInRing(outer, h[0]))], rel.t, 'osm');
  });
}
const polysOf = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);
const dropClosing = (ring) => ring.slice(0, -1);
for (const f of SRC.supplement.features) {
  const p = f.properties;
  if (p.layer !== 'building') continue;
  polysOf(f.geometry).forEach((poly, i) => {
    const [outer, ...inner] = poly.map((r) => ringLocal(dropClosing(r)));
    addBuilding(`osm:${p.osm.startsWith('w') ? 'way' : 'relation'}/${p.osm.slice(1)}${i ? `#${i + 1}` : ''}`, [outer, ...inner], { building: p.class ?? 'yes', name: p.name ?? undefined, height: p.height ?? undefined, 'building:levels': p.floors ?? undefined }, 'osm-via-overture');
  });
}
// validate OSM footprints against Google Open Buildings (satellite-derived, independent of OSM)
const gob = SRC.gob.features.flatMap((f) => polysOf(f.geometry).map((poly) => { const ring = ringLocal(dropClosing(poly[0])); return { ring, box: bbox(ring), conf: f.properties.confidence }; }));
const gobGrid = new Grid(60);
gob.forEach((g, i) => gobGrid.add(i, g.box));
const bGrid = new Grid(60);
buildings.forEach((b, i) => bGrid.add(i, b.box));
let validated = 0, checked = 0;
const offsets = [];
for (const b of buildings) {
  if (!b.onCampus) { b.conf = 'medium'; continue; }
  checked++;
  let bestIoU = 0, cover = 0, best = null;
  for (const i of gobGrid.query(b.box)) {
    const g = gob[i];
    const cell = b.area > 2500 ? 1 : 0.5;
    const o = overlap(b.ring, g.ring, cell);
    if (!o.inter) continue;
    cover += o.inter / o.a;
    const iou = o.inter / (o.a + o.b - o.inter);
    if (iou > bestIoU) { bestIoU = iou; best = g; }
  }
  b.gobIoU = Math.round(bestIoU * 100) / 100;
  b.gobCover = Math.round(Math.min(1, cover) * 100) / 100;
  b.validated = bestIoU >= 0.3 || cover >= 0.5;
  if (b.validated) { validated++; b.src.push('google-open-buildings'); }
  if (bestIoU >= 0.3 && best) { const gc = centroid(best.ring); offsets.push([gc[0] - b.c[0], gc[1] - b.c[1]]); }
  b.conf = b.validated ? 'high' : 'medium';
}
// machine-learned footprints fill campus buildings missing from OSM
let mlAdded = 0;
const mlRejected = { offCampus: 0, small: 0, lowConfidence: 0, overlapsOsm: 0 };
for (const f of SRC.ml.features) {
  const p = f.properties;
  for (const poly of polysOf(f.geometry)) {
    const ring = ringLocal(dropClosing(poly[0]));
    const c = centroid(ring), a = area(ring), box = bbox(ring);
    if (!inCampus(c)) { mlRejected.offCampus++; continue; }
    if (a < 60) { mlRejected.small++; continue; }
    if (p.confidence != null && p.confidence < 0.8) { mlRejected.lowConfidence++; continue; }
    let hit = false;
    for (const i of bGrid.query(box)) if (overlap(ring, buildings[i].ring, 1).inter > 0) { hit = true; break; }
    if (hit) { mlRejected.overlapsOsm++; continue; }
    buildings.push({ id: `ml:${p.id}`, layer: 'building', class: 'unknown', area: Math.round(a), orient: orientation(ring), onCampus: true, src: [p.dataset === 'Google Open Buildings' ? 'google-open-buildings' : 'microsoft-ml-buildings'], conf: 'medium', mlConfidence: p.confidence ?? undefined, ring, holes: [], c, box });
    mlAdded++;
  }
}
{
  const n = buildings.length;
  const by = (k) => Object.fromEntries(Object.entries(buildings.reduce((m, b) => ((m[b[k]] = (m[b[k]] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]));
  const med = (arr) => { const s = [...arr].sort((a, b) => a - b); return r1(s[Math.floor(s.length / 2)] ?? 0); };
  report.buildings = {
    total: n, onCampus: buildings.filter((b) => b.onCampus).length,
    bySource: by('_src'),
    osmOnCampusChecked: checked, osmValidatedByGoogleOpenBuildings: validated, validatedShare: Math.round((validated / checked) * 1000) / 1000,
    medianCentroidOffsetToGoogleM: { x: med(offsets.map((o) => o[0])), z: med(offsets.map((o) => o[1])), n: offsets.length },
    mlAdded, mlRejected,
    byCategory: by('class'), byConfidence: by('conf'),
  };
  for (const b of buildings) b._src = b.src[0];
  report.buildings.bySource = by('_src');
  for (const b of buildings) delete b._src;
  report.buildings.osmNotSeenBySatellite = buildings.filter((b) => b.onCampus && b.validated === false && b.area >= 150).map((b) => ({ id: b.id, name: b.name, area: b.area })).sort((a, b) => b.area - a.area).slice(0, 40);
}
for (const b of buildings) {
  delete b.box;
  if (SUSPECT.has(b.id)) { b.suspect = SUSPECT.get(b.id); b.conf = 'low'; b.game = false; }
  features.push(b);
}
report.buildings.excludedAsErroneous = [...SUSPECT.keys()];

// ---------- areas: open spaces, sports, parking, water, woods ----------
function areaClass(t) {
  if (t.leisure === 'pitch' || t.leisure === 'stadium') return ['pitch', t.leisure];
  if (t.leisure === 'track' || t.leisure === 'sports_centre') return ['track', t.leisure];
  if (t.amenity === 'parking') return ['parking', 'parking'];
  if (t.natural === 'water' || t.leisure === 'swimming_pool' || t.landuse === 'reservoir' || t.landuse === 'basin') return ['water', t.water ?? t.leisure ?? t.natural ?? t.landuse];
  if (t.natural === 'wood' || t.landuse === 'forest') return ['wood', t.natural ?? t.landuse];
  if (t.leisure === 'park' || t.leisure === 'garden' || t.landuse === 'grass' || t.landuse === 'recreation_ground' || t.leisure === 'playground' || t.landuse === 'village_green' || t.natural === 'grassland' || t.natural === 'scrub') return ['grass', t.leisure ?? t.landuse ?? t.natural];
  if (t.place === 'square' || (t.highway === 'pedestrian' && t.area === 'yes') || t.amenity === 'marketplace' || t.amenity === 'food_court' || t.amenity === 'fountain') return ['plaza', t.place ?? t.amenity ?? 'pedestrian'];
  if (t.landuse) return ['landuse', t.landuse];
  if (t.amenity && /university|college|school|hospital|kindergarten/.test(t.amenity)) return ['landuse', t.amenity];
  return null;
}
const areas = [];
function addArea(id, rings, t, src) {
  const fix = RECLASS.get(id);
  const cls = fix ? [fix.class, fix.subclass] : areaClass(t);
  if (!cls || rings[0].length < 3) return;
  if (id === `osm:way/${BOUNDARY_WAY}`) return;
  const [outer, ...holes] = rings;
  const c = centroid(outer);
  if (!anyInContext(outer)) return;
  areas.push({ id, layer: 'area', class: cls[0], subclass: cls[1], name: t.name, area: Math.round(area(outer)), conf: fix ? 'medium' : 'high', src: [src], ring: outer, holes, c, ...(fix && { note: `mapped as ${areaClass(t)?.[0] ?? 'unclassified'}; ${fix.reason}` }) });
}
for (const w of osm.ways.values()) {
  if (w.t.building || w.refs.length < 4 || w.refs[0] !== w.refs[w.refs.length - 1]) continue;
  if (w.t.highway && w.t.area !== 'yes') continue;
  addArea(`osm:way/${w.id}`, [refsToRing(osm, w.refs)], w.t, 'osm');
}
for (const rel of osm.relations.values()) {
  if (rel.t.type !== 'multipolygon' || rel.t.building) continue;
  const inners = relationRings(osm, rel, true).map((r) => refsToRing(osm, r));
  relationRings(osm, rel).forEach((r, i) => {
    const outer = refsToRing(osm, r);
    addArea(`osm:relation/${rel.id}${i ? `#${i + 1}` : ''}`, [outer, ...inners.filter((h) => pointInRing(outer, h[0]))], rel.t, 'osm');
  });
}
const OV_AREA_TAG = (p) => {
  const c = p.class;
  if (p.layer === 'water') return { natural: 'water', water: c, leisure: c === 'swimming_pool' ? 'swimming_pool' : undefined };
  if (['pitch', 'stadium', 'track', 'sports_centre', 'park', 'garden', 'playground'].includes(c)) return { leisure: c };
  if (c === 'parking') return { amenity: 'parking' };
  if (['grass', 'forest', 'recreation_ground', 'reservoir', 'basin', 'farmland', 'residential', 'commercial', 'retail', 'industrial', 'cemetery'].includes(c)) return { landuse: c };
  if (['wood', 'scrub', 'grassland'].includes(c)) return { natural: c };
  return null;
};
for (const f of SRC.supplement.features) {
  const p = f.properties;
  if (p.layer !== 'landuse' && p.layer !== 'water') continue;
  const t = OV_AREA_TAG(p);
  if (!t) continue;
  polysOf(f.geometry).forEach((poly, i) => addArea(`osm:${p.osm.startsWith('w') ? 'way' : 'relation'}/${p.osm.slice(1)}${i ? `#${i + 1}` : ''}`, poly.map((r) => ringLocal(dropClosing(r))), { ...t, name: p.name ?? undefined }, 'osm-via-overture'));
}
// areas the owner's imagery shows and the sources lack (corrections.json: addAreas)
for (const a of REG.corrections.addAreas ?? []) {
  const ring = a.ring.map(([x, z]) => [x, z]);
  areas.push({ id: a.id, layer: 'area', class: a.class, subclass: a.class, area: Math.round(area(ring)), conf: 'medium', src: ['owner-imagery'], ring, holes: [], c: centroid(ring), note: a.reason });
}
// University Square: the forecourt between the Balme Library and the avenue fountain, bounded by mapped lanes
{
  const lanes = ['448104199', '448104193', '278303088'].map((id) => osm.ways.get(id));
  if (lanes.some((w) => !w)) throw new Error('University Square lanes missing from data/legon.osm');
  const west = Math.max(...lanes[0].refs.map((r) => osm.nodes.get(r).p[0]));
  const east = Math.min(...lanes[1].refs.slice(-2).map((r) => osm.nodes.get(r).p[0]));
  const north = Math.max(...lanes[2].refs.map((r) => osm.nodes.get(r).p[1]).filter((z) => z > -100 && z < 200));
  const fountain = osm.ways.get('320067568');
  const south = Math.min(...fountain.refs.map((r) => osm.nodes.get(r).p[1]));
  const ring = [[west, north], [east, north], [east, south], [west, south]];
  areas.push({ id: 'derived:university-square', layer: 'area', class: 'plaza', subclass: 'square', name: 'University Square', area: Math.round(area(ring)), conf: 'medium', src: ['osm-derived', 'ug-legon-campus'], ring, holes: [], c: centroid(ring), note: 'forecourt bounded by OSM ways 448104199, 448104193, 278303088 and the fountain roundabout (way 320067568)' });
}
{
  const by = {};
  for (const a of areas) { by[a.class] = by[a.class] ?? { count: 0, ha: 0 }; by[a.class].count++; by[a.class].ha = r1(by[a.class].ha + a.area / 1e4); }
  report.areas = by;
}
for (const a of areas) features.push(a);

// ---------- water lines and land cover ----------
for (const w of osm.ways.values()) {
  if (!w.t.waterway || w.refs.length < 2) continue;
  const line = refsToLine(osm, w.refs);
  if (anyInContext(line)) features.push({ id: `osm:way/${w.id}`, layer: 'waterway', class: w.t.waterway, name: w.t.name, conf: 'medium', src: ['osm'], line });
}
for (const f of SRC.supplement.features) {
  const p = f.properties;
  if (p.layer === 'water' && f.geometry.type === 'LineString') features.push({ id: `osm:${p.osm.startsWith('w') ? 'way' : 'relation'}/${p.osm.slice(1)}`, layer: 'waterway', class: p.class, name: p.name ?? undefined, conf: 'medium', src: ['osm-via-overture'], line: ringLocal(f.geometry.coordinates) });
}
SRC.worldcover.features.forEach((f, i) => {
  for (const poly of polysOf(f.geometry)) features.push({ id: `esa-worldcover:${i}`, layer: 'landcover', class: f.properties.class, ha: f.properties.ha, conf: 'medium', src: ['esa-worldcover'], ring: ringLocal(dropClosing(poly[0])), holes: poly.slice(1).map((r) => ringLocal(dropClosing(r))) });
});

// ---------- places ----------
const named = []; // { name, t, x, z, from, size, id }
const LEGACY_GROUND = new Set(['pitch', 'track', 'parking', 'water', 'wood']);
for (const b of buildings) if (b.name && !SUSPECT.has(b.id) && b.src[0] !== 'google-open-buildings' && b.src[0] !== 'microsoft-ml-buildings') named.push({ name: b.name, t: b.tags ?? {}, x: b.c[0], z: b.c[1], from: 'building', size: b.area, id: b.id, fam: 'osm' });
// legacy behaviour: building tags feed the place kind
{
  const tagById = new Map();
  for (const w of osm.ways.values()) tagById.set(`osm:way/${w.id}`, w.t);
  for (const r of osm.relations.values()) tagById.set(`osm:relation/${r.id}`, r.t);
  for (const n of named) n.t = tagById.get(n.id) ?? { building: 'yes' };
}
for (const w of osm.ways.values()) {
  if (w.refs.length < 4 || w.refs[0] !== w.refs[w.refs.length - 1] || w.t.building || !w.t.name) continue;
  if (!(w.t.amenity || w.t.leisure || w.t.tourism || w.t.landuse === 'education')) continue;
  if (LEGACY_GROUND.has(areaClass(w.t)?.[0])) continue; // pitches, car parks, water and woods are ground, not destinations (as before)
  const pts = refsToRing(osm, w.refs);
  const [x, z] = centroid(pts);
  if (inContext([x, z])) named.push({ name: w.t.name, t: w.t, x, z, from: 'area', size: area(pts), id: `osm:way/${w.id}`, fam: 'osm' });
}
for (const rel of osm.relations.values()) {
  if (rel.t.type !== 'multipolygon' || rel.t.building || !rel.t.name) continue;
  const rings = relationRings(osm, rel);
  if (!rings.length) continue;
  const pts = refsToRing(osm, rings[0]);
  const [x, z] = centroid(pts);
  if (inContext([x, z])) named.push({ name: rel.t.name, t: rel.t, x, z, from: 'area', size: area(pts), id: `osm:relation/${rel.id}`, fam: 'osm' });
}
for (const a of areas) if (a.name && a.src[0] === 'osm-via-overture' && !LEGACY_GROUND.has(a.class)) named.push({ name: a.name, t: { leisure: a.subclass }, x: a.c[0], z: a.c[1], from: 'area', size: a.area, id: a.id, fam: 'osm' });
// trotro lines that stop at each node (route=bus relations)
const linesAt = new Map();
const lineEnds = {};
for (const rel of osm.relations.values()) {
  if (rel.t.type !== 'route' || rel.t.route !== 'bus' || !rel.t.ref) continue;
  lineEnds[rel.t.ref] = [...new Set([...(lineEnds[rel.t.ref] ?? []), rel.t.from, rel.t.to].filter(Boolean))];
  for (const m of rel.members) if (m.type === 'node') linesAt.set(m.ref, new Set([...(linesAt.get(m.ref) ?? []), rel.t.ref]));
}
for (const [id, n] of osm.nodes) {
  const t = n.t;
  if (!t?.name || !inContext(n.p)) continue;
  if (t.amenity || t.shop || t.tourism || t.office || t.leisure || t.highway === 'bus_stop' || t.building) named.push({ id: `osm:node/${id}`, osmNode: id, name: t.name, t, x: n.p[0], z: n.p[1], from: 'node', size: 0, fam: 'osm' });
}
const EXCLUDE = REG.naming.exclude.map((e) => { const [re, id] = e.split('@'); return { re: new RegExp(re, 'i'), id: id ? (id.startsWith('node') || id.startsWith('way') || id.startsWith('relation') ? `osm:${id}` : id) : null }; });
const excluded = (c) => EXCLUDE.some((e) => e.re.test(c.name) && (!e.id || e.id === c.id));

const KIND_RULES = [
  ['landmark', (n) => /^(the )?(great hall|balme library|legon main entrance|university of ghana registry)$|quadrangle|fountain|night market/i.test(n)],
  ['worship', (n, t) => t.amenity === 'place_of_worship' || /church|mosque|chapel|kingdom hall|prayer/i.test(n)],
  ['transport', (n, t) => t.highway === 'bus_stop' || /bus_station|taxi/.test(t.amenity ?? '')],
  ['bank', (n, t) => /bank|atm|bureau_de_change|payment/.test(t.amenity ?? '') || /bank|credit union|forex/i.test(n)],
  ['food', (n, t) => /restaurant|fast_food|cafe|food_court|marketplace|pub|bar/.test(t.amenity ?? '') || /cafeteria|dining|dinning|canteen|jollof|kebab|joint|food court|food vendor|restaurant|pizza|night market/i.test(n)],
  ['hall', (n, t) => (t.tourism === 'hostel' || t.building === 'dormitory' || /\b(hall|hostel|annex|pentagon|pent|ish ?\d?|international house|valco|bani|evandy|courts)\b/i.test(n)) && !/great hall|assembly|lecture|library|ict|laundr|admin|office|isser|provost|science|family|chapel|washroom|porters/i.test(n)],
  ['health', (n, t) => /hospital|clinic|doctors|pharmacy/.test(t.amenity ?? '') || /hospital|clinic|pharmacy|\bchemist\b|medical/i.test(n)],
  ['sport', (n, t) => !!t.leisure || /stadium|sports|oval|pitch|gym|field|fitness/i.test(n)],
  ['academic', (n, t) => /university|college|school|library/.test(t.amenity ?? t.building ?? '') || /dep(artmen)?t|school|faculty|institute|centre|center|college|lab|library|lecture|jqb|block|building|studies|science|archive|chemistry|physics|statistics|math/i.test(n)],
];
const kindOf = (n, t) => (KIND_RULES.find(([, f]) => f(n, t)) ?? ['other'])[0];
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\b(the|of|and|dr|department|dept|university|ghana|legon|ug)\b/g, ' ').replace(/\s+/g, ' ').trim();
const SKIP = /^(office|offices|block [a-f]|blocke|east legon( \d+)?|18|cafeteria|rest station)$/i;
const rank = { building: 0, area: 1, node: 2, list: 3 };
named.sort((a, b) => rank[a.from] - rank[b.from] || b.size - a.size || (a.id < b.id ? -1 : 1));
const places = [];
for (const c of named) {
  const name = c.name.replace(/\s+/g, ' ').trim();
  if (SKIP.test(name) || name.length < 3 || excluded({ ...c, name })) continue;
  const key = norm(name);
  if (places.some((p) => (norm(p.n) === key && Math.hypot(p.x - c.x, p.z - c.z) < 300) || (Math.hypot(p.x - c.x, p.z - c.z) < 150 && norm(p.n).startsWith(key) && /^( (hall|building|block|centre|center))+$/.test(norm(p.n).slice(key.length))))) continue;
  const place = { n: name, k: kindOf(name, c.t), x: c.x, z: c.z, id: c.id, src: ['osm'] };
  const lines = c.osmNode && linesAt.get(c.osmNode);
  if (lines) place.l = [...lines].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  places.push(place);
}
// places only the UG Campus Map knows about
const words = (s) => new Set(norm(s).split(' ').filter((w) => w.length > 2));
let ugAdded = 0;
const ugPois = SRC.ugPois.map((poi) => {
  const name = poi.name.replace(/ - (Research|Educational|Training|College).*$/, '').replace(/\(ISSER$/, '(ISSER)').trim();
  const [x, z] = toLocal(poi.lat, poi.lng);
  return { name, x, z };
});
for (const poi of ugPois) {
  const w = words(poi.name);
  const match = places.some((p) => {
    if (Math.hypot(p.x - poi.x, p.z - poi.z) > 250) return false;
    const pw = words(p.n);
    return [...w].filter((v) => pw.has(v)).length / Math.max(1, Math.min(w.size, pw.size)) >= 0.6;
  });
  if (match || excluded({ name: poi.name, id: 'ugmap' })) continue;
  places.push({ n: poi.name, k: kindOf(poi.name, {}), x: poi.x, z: poi.z, id: `ug-campus-map:${normName(poi.name).replace(/ /g, '-')}`, src: ['ug-campus-map'] });
  ugAdded++;
}
// same name in several spots (banks, canteens): add the nearest well-known place
const ANCHOR = new Set(['landmark', 'hall', 'academic', 'sport', 'health']);
const byName = new Map();
for (const p of places) byName.set(p.n, [...(byName.get(p.n) ?? []), p]);
for (const [name, list] of byName) {
  if (list.length < 2) continue;
  for (const p of list) {
    let best = null, bd = Infinity;
    for (const q of places) {
      if (q.n === name || !ANCHOR.has(q.k) || byName.get(q.n).length > 1 || q.n.length > 28) continue;
      const d = Math.hypot(q.x - p.x, q.z - p.z);
      if (d < bd) { bd = d; best = q; }
    }
    if (best) p.n = `${name} (near ${best.n.replace(/^The /, '')})`;
  }
}
const seen = new Map();
for (const p of places) { const c = (seen.get(p.n) ?? 0) + 1; seen.set(p.n, c); if (c > 1) p.n = `${p.n} ${c}`; }
for (const p of places) if (REG.naming.rename[p.n]) p.n = REG.naming.rename[p.n];
// the footprint keeps the same name as its place
for (const b of buildings) if (b.name && REG.naming.rename[b.name]) b.name = REG.naming.rename[b.name];
// names the game depends on are pinned to their source feature, so a new neighbour cannot rename them
for (const p of places) if (REG.naming.pin?.[p.id]) p.n = REG.naming.pin[p.id];

// ---------- landmark registry: resolve, cross-check, test claims ----------
const placeByName = (re) => places.find((p) => new RegExp(re, 'i').test(p.n));
const featureById = new Map(features.map((f) => [f.id, f]));
const roadLines = (re) => features.filter((f) => (f.layer === 'road') && f.name && new RegExp(re, 'i').test(f.name)).map((f) => f.line);
const ovPlaces = SRC.places.features.map((f) => { const [lng, lat] = f.geometry.coordinates; const [x, z] = toLocal(lat, lng); return { name: f.properties.name, x, z, dataset: f.properties.dataset, confidence: f.properties.confidence }; });
// every named OSM feature, including sports grounds and car parks that are not place candidates
const osmNamed = [...named.map((c) => ({ name: c.name, x: c.x, z: c.z, id: c.id })), ...areas.filter((a) => a.name && LEGACY_GROUND.has(a.class)).map((a) => ({ name: a.name, x: a.c[0], z: a.c[1], id: a.id }))];
const LM = new Map();
for (const l of REG.landmarks.landmarks) {
  const g = l.geometry;
  let pos = null, ring = null, geomId = null, line = null;
  if (g.osm) {
    geomId = `osm:${g.osm}`;
    const f = featureById.get(geomId) ?? features.find((q) => q.id === geomId);
    if (f?.ring) { ring = f.ring; pos = centroid(ring); }
    else if (g.osm.startsWith('node/')) {
      const n = osm.nodes.get(g.osm.slice(5));
      if (!n) throw new Error(`landmark ${l.id}: ${g.osm} missing from data/legon.osm`);
      pos = n.p;
      if (g.snapToBuilding) {
        const b = buildings.find((q) => q.src[0] === 'osm' && pointInRing(q.ring, pos));
        if (b) { ring = b.ring; geomId = b.id; pos = centroid(ring); }
      }
    } else if (g.osm.startsWith('way/') && osm.ways.has(g.osm.slice(4))) {
      ring = refsToRing(osm, osm.ways.get(g.osm.slice(4)).refs); pos = centroid(ring);
    } else throw new Error(`landmark ${l.id}: ${g.osm} not found`);
  } else if (g.derived) {
    const f = features.find((q) => q.id === `derived:${g.derived}`);
    ring = f.ring; pos = centroid(ring); geomId = f.id;
  } else if (g.road) {
    const ls = roadLines(g.road);
    if (!ls.length) throw new Error(`landmark ${l.id}: road ${g.road} not found`);
    line = ls; geomId = `road:${g.road}`;
    const all = ls.flat();
    pos = all[Math.floor(all.length / 2)];
  } else if (g.at) {
    // a point measured on owner-supplied imagery registered to the OSM footprints
    pos = g.at; geomId = `measured:${l.id}`;
  } else if (g.place) {
    const p = placeByName(g.place);
    if (!p) throw new Error(`landmark ${l.id}: place ${g.place} not found`);
    pos = [p.x, p.z]; geomId = p.id;
  }
  LM.set(l.id, { l, pos, ring, line, geomId });
}
function evalClaim(self, test) {
  const other = test.other && LM.get(test.other);
  if (test.other && !other) return { pass: false, detail: `unknown landmark ${test.other}` };
  const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const nearestOnLines = (p, lines) => { let best = Infinity, at = null; for (const ln of lines) for (let i = 0; i < ln.length - 1; i++) { const [ax, az] = ln[i], [bx, bz] = ln[i + 1]; const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz; const t = L ? Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - az) * dz) / L)) : 0; const q = [ax + t * dx, az + t * dz]; const e = d(p, q); if (e < best) { best = e; at = q; } } return { dist: best, at }; };
  // distance from a landmark to something: to its outline when it has one
  const reach = (L, p) => (L.ring ? (pointInRing(L.ring, p) ? 0 : distToLine(p, L.ring, true)) : d(L.pos, p));
  switch (test.type) {
    case 'near': { const m = Math.min(d(self.pos, other.pos), self.ring ? reach(self, other.pos) : Infinity, other.ring ? reach(other, self.pos) : Infinity); return { pass: m <= test.within, value: Math.round(m), detail: `${Math.round(m)} m apart (limit ${test.within} m)` }; }
    case 'near-place': { const p = placeByName(test.place); if (!p) return { pass: false, detail: `place ${test.place} not found` }; const m = d(self.pos, [p.x, p.z]); return { pass: m <= test.within, value: Math.round(m), detail: `${Math.round(m)} m from ${p.n} (limit ${test.within} m)` }; }
    case 'near-road': { const ls = roadLines(test.road); if (!ls.length) return { pass: false, detail: `road ${test.road} not found` }; const pts = self.ring ? [self.pos, ...self.ring] : [self.pos]; const m = Math.min(...pts.map((p) => nearestOnLines(p, ls).dist)); return { pass: m <= test.within, value: Math.round(m), detail: `${Math.round(m)} m from the road (limit ${test.within} m)` }; }
    case 'side-of-road': { const ls = roadLines(test.road); const { at } = nearestOnLines(self.pos, ls); const north = self.pos[1] < at[1]; const ok = test.side === 'north' ? north : !north; return { pass: ok, detail: `${north ? 'north' : 'south'} of the road by ${Math.round(Math.abs(self.pos[1] - at[1]))} m` }; }
    case 'direction': {
      const dx = self.pos[0] - other.pos[0], dz = self.pos[1] - other.pos[1];
      const along = { north: -dz, south: dz, east: dx, west: -dx }[test.dir];
      return { pass: along >= (test.min ?? 0), value: Math.round(along), detail: `${Math.round(along)} m ${test.dir} of ${other.l.name} (need ${test.min ?? 0} m)` };
    }
    case 'near-summit': { const m = d(self.pos, SUMMIT.p); const m2 = self.ring ? Math.min(m, reach(self, SUMMIT.p)) : m; return { pass: m2 <= test.within, value: Math.round(m2), detail: `${Math.round(m2)} m from the DEM high point (${SUMMIT.h.toFixed(0)} m) (limit ${test.within} m)` }; }
    case 'higher-than': { const a = demAt(self.pos), b = demAt(other.pos); return { pass: a - b >= test.by, value: Math.round(a - b), detail: `${a.toFixed(0)} m vs ${b.toFixed(0)} m at ${other.l.name} (need +${test.by} m)` }; }
    case 'inside': { const ok = other.ring && pointInRing(other.ring, self.pos); return { pass: !!ok, detail: ok ? `inside ${other.l.name}` : `outside ${other.l.name}` }; }
    case 'road-links': { const ls = self.line ?? roadLines(test.road); const a = LM.get(test.a), b = LM.get(test.b); const da = Math.min(nearestOnLines(a.pos, ls).dist, a.ring ? Math.min(...a.ring.map((p) => nearestOnLines(p, ls).dist)) : Infinity); const db = Math.min(nearestOnLines(b.pos, ls).dist, b.ring ? Math.min(...b.ring.map((p) => nearestOnLines(p, ls).dist)) : Infinity); return { pass: da <= test.within && db <= test.within, detail: `${a.l.name} ${Math.round(da)} m, ${b.l.name} ${Math.round(db)} m from the road (limit ${test.within} m)` }; }
    default: return { pass: false, detail: `unknown test ${test.type}` };
  }
}
for (const [id, L] of LM) {
  const { l } = L;
  const sources = {};
  const best = (list, res) => {
    if (!res?.length) return undefined;
    let out = null;
    for (const c of list) {
      if (!res.some((r) => new RegExp(r, 'i').test(c.name))) continue;
      const dist = Math.hypot(c.x - L.pos[0], c.z - L.pos[1]);
      if (!out || dist < out.distanceM) out = { name: c.name, distanceM: Math.round(dist), dataset: c.dataset };
    }
    return out ?? { found: false };
  };
  sources.osm = best(osmNamed, l.match.osm);
  sources.overture = best(ovPlaces, l.match.overture);
  sources.ugCampusMap = best(ugPois, l.match.ugmap);
  // all matching Overture entries, so wrong duplicates are visible
  const ovAll = (l.match.overture ?? []).length ? ovPlaces.filter((c) => l.match.overture.some((r) => new RegExp(r, 'i').test(c.name))).map((c) => ({ name: c.name, dataset: c.dataset, distanceM: Math.round(Math.hypot(c.x - L.pos[0], c.z - L.pos[1])) })) : [];
  const agree = Object.entries(sources).filter(([, s]) => s && s.distanceM !== undefined && s.distanceM <= 150).map(([k]) => k);
  const claims = (l.claims ?? []).map((c) => ({ cite: c.cite, text: c.text, test: c.test.type, ...evalClaim(L, c.test) }));
  const failed = claims.filter((c) => !c.pass).length;
  const fromOsm = (L.geomId ?? '').startsWith('osm:') || agree.includes('osm');
  const independent = agree.filter((k) => k !== 'osm').length + (claims.length && !failed ? 1 : 0);
  L.conf = failed ? 'low' : fromOsm && independent >= 1 ? 'high' : 'medium';
  if (l.maxConfidence === 'medium' && L.conf === 'high') L.conf = 'medium';
  const [lat, lng] = [LAT0 - L.pos[1] / M_LAT, LNG0 + L.pos[0] / M_LNG];
  report.landmarks.push({
    id, name: l.name, category: l.category, importance: l.importance, geometry: L.geomId, lat: +lat.toFixed(6), lng: +lng.toFixed(6), x: Math.round(L.pos[0]), z: Math.round(L.pos[1]),
    elevationM: Math.round(demAt(L.pos)), confidence: L.conf, sourcesAgreeingWithin150m: agree, sources, overtureMatches: ovAll.length > 1 ? ovAll : undefined, claims, notes: l.notes,
  });
  if (L.ring || L.pos) features.push({ id: `landmark:${id}`, layer: 'landmark', class: l.category, name: l.name, aliases: l.aliases, importance: l.importance, kind: l.kind ?? undefined, geometry: L.geomId, conf: L.conf, src: ['registry', ...new Set(agree)], point: L.pos, elevation: Math.round(demAt(L.pos)) });
}
// registry landmarks are the authority for where their place sits
let moved = 0, added = 0;
for (const [, L] of LM) {
  const { l } = L;
  if (!l.kind) continue;
  let p = places.find((q) => q.n === l.name);
  if (!p) { p = { n: l.name, k: REG.naming.kind[l.name] ?? l.kind, x: L.pos[0], z: L.pos[1], id: `landmark:${l.id}`, src: ['registry'] }; places.push(p); added++; continue; }
  if (Math.hypot(p.x - L.pos[0], p.z - L.pos[1]) > 1) { p.movedFrom = [Math.round(p.x), Math.round(p.z)]; p.x = L.pos[0]; p.z = L.pos[1]; moved++; }
  p.landmark = l.id;
}
for (const p of places) if (REG.naming.kind[p.n]) p.k = REG.naming.kind[p.n];

// corroboration of every place by the other source families
const famOf = (p) => (p.src[0] === 'ug-campus-map' ? 'ug-campus-map' : p.src[0] === 'registry' ? 'registry' : 'osm');
const conflicts = [];
const nameCount = new Map();
for (const [fam, list] of [['osm', osmNamed], ['overture', ovPlaces], ['ug-campus-map', ugPois]])
  for (const c of list) { const k = `${fam}|${normName(c.name)}`; nameCount.set(k, (nameCount.get(k) ?? 0) + 1); }
for (const p of places) {
  const fams = new Set([famOf(p)]);
  const near = (list, fam) => {
    const base = p.n.replace(/ \(near .*\)$/, '');
    for (const c of list) {
      const m = nameMatch(base, c.name);
      if (m < 0.75) continue;
      const dist = Math.hypot(c.x - p.x, c.z - p.z);
      if (dist <= 150) fams.add(fam);
      // a conflict: the very same name, unique in both sources, far apart
      else if (dist > 300 && normName(base) === normName(c.name) && !/ \(near /.test(p.n) && (nameCount.get(`${fam}|${normName(c.name)}`) ?? 0) === 1 && places.filter((q) => normName(q.n) === normName(base)).length === 1) conflicts.push({ place: p.n, at: [Math.round(p.x), Math.round(p.z)], other: c.name, source: fam === 'overture' ? `overture/${c.dataset}` : fam, otherAt: [Math.round(c.x), Math.round(c.z)], distanceM: Math.round(dist) });
    }
  };
  if (famOf(p) !== 'osm') near(osmNamed, 'osm');
  near(ovPlaces, 'overture');
  if (famOf(p) !== 'ug-campus-map') near(ugPois, 'ug-campus-map');
  p.fams = [...fams].sort();
  const lm = p.landmark && LM.get(p.landmark);
  p.conf = lm ? lm.conf : fams.size >= 2 ? 'high' : 'medium';
}
const placeConflicts = new Set(conflicts.map((c) => c.place));
for (const p of places) if (!p.landmark && placeConflicts.has(p.n) && p.fams.length < 2) p.conf = 'low';
// every place name the game looks up must still exist
if (process.env.DEBUG_PLACES) for (const p of places) if (new RegExp(process.env.DEBUG_PLACES).test(p.n)) console.log('place', p.n, p.k, Math.round(p.x), Math.round(p.z), p.id);
const missing = REG.naming.required.filter((n) => !places.some((p) => p.n === n));
if (missing.length) throw new Error(`places the game needs are missing: ${missing.join(', ')}`);
report.places = {
  total: places.length, fromOsm: places.filter((p) => p.src[0] === 'osm').length, fromUgCampusMap: ugAdded, addedFromRegistry: added, movedToRegistryPosition: moved,
  byConfidence: places.reduce((m, p) => ((m[p.conf] = (m[p.conf] ?? 0) + 1), m), {}),
  requiredNamesChecked: REG.naming.required.length,
  moved: places.filter((p) => p.movedFrom).map((p) => ({ name: p.n, from: p.movedFrom, to: [Math.round(p.x), Math.round(p.z)], distanceM: Math.round(Math.hypot(p.x - p.movedFrom[0], p.z - p.movedFrom[1])) })),
};
report.conflicts = conflicts.sort((a, b) => b.distanceM - a.distanceM);
places.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : a.n < b.n ? -1 : 1));
for (const p of places) features.push({ id: `place:${p.id}${places.filter((q) => q.id === p.id).length > 1 ? `:${normName(p.n).replace(/ /g, '-')}` : ''}`, layer: 'place', class: p.k, name: p.n, lines: p.l, landmark: p.landmark, conf: p.conf, src: p.src, corroboratedBy: p.fams, point: [p.x, p.z] });

// ---------- zones ----------
for (const z of REG.zones.zones) {
  const ring = z.xz;
  const inside = places.filter((p) => pointInRing(ring, [p.x, p.z]));
  const missingAnchors = z.anchors.filter((a) => !inside.some((p) => p.n === a));
  let n = 0, out = 0;
  const B = bbox(ring);
  for (let zz = B.minZ; zz < B.maxZ; zz += 20) for (let xx = B.minX; xx < B.maxX; xx += 20) if (pointInRing(ring, [xx, zz])) { n++; if (!inCampus([xx, zz])) out++; }
  report.zones.push({ id: z.id, name: z.name, kind: z.kind, ha: Math.round(area(ring) / 1e4), shareOutsideCampus: Math.round((out / n) * 100) / 100, places: inside.length, buildings: buildings.filter((b) => pointInRing(ring, b.c)).length, anchorsMissing: missingAnchors });
  features.push({ id: `zone:${z.id}`, layer: 'zone', class: z.kind, name: z.name, anchors: z.anchors, rationale: z.rationale, conf: 'medium', src: ['registry'], ring });
}

// ---------- acceptance criteria (docs/LEGON_MASTER_GEOGRAPHY.md, section 15) ----------
{
  const fail = [];
  if (report.boundary.ugCampusMap.areaOverlapIoU < 0.9) fail.push(`boundary IoU with the UG Campus Map ${report.boundary.ugCampusMap.areaOverlapIoU} < 0.9`);
  if (report.buildings.validatedShare < 0.85) fail.push(`only ${report.buildings.validatedShare} of OSM campus footprints confirmed by satellite`);
  const off = report.buildings.medianCentroidOffsetToGoogleM;
  if (Math.abs(off.x) >= 2 || Math.abs(off.z) >= 2) fail.push(`systematic OSM/satellite offset ${off.x}, ${off.z} m`);
  for (const l of report.landmarks) {
    if (l.confidence === 'low') fail.push(`landmark ${l.id} has low confidence`);
    for (const c of l.claims) if (!c.pass) fail.push(`landmark ${l.id}: claim failed (${c.detail})`);
  }
  for (const z of report.zones) if (z.anchorsMissing.length) fail.push(`zone ${z.id} is missing ${z.anchorsMissing.join(', ')}`);
  if (fail.length) throw new Error(`geographic acceptance criteria failed:\n  ${fail.join('\n  ')}`);
}

// ---------- write ----------
report.sources = {
  osm: { file: 'data/legon.osm', snapshot: osm.timestamp, ways: osm.ways.size, nodes: osm.nodes.size, extent: '5.633-5.668 N, 0.199-0.175 W' },
  overtureOsmSupplement: { file: `${G}/sources/overture-osm-supplement.geojson`, features: SRC.supplement.features.length, release: SRC.supplement.metadata.source },
  mlBuildings: { file: `${G}/sources/overture-ml-buildings.geojson`, features: SRC.ml.features.length },
  googleOpenBuildings: { file: `${G}/sources/google-open-buildings.geojson`, features: SRC.gob.features.length },
  overturePlaces: { file: `${G}/sources/overture-places.geojson`, features: SRC.places.features.length },
  ugCampusMap: { pois: SRC.ugPois.length, boundaryVertices: SRC.ugBoundary.boundary.length },
  worldcover: { features: SRC.worldcover.features.length },
  dem: { grid: `${DEM.frame.cols}x${DEM.frame.rows} @ ${DEM.frame.step} m`, summit: { x: Math.round(SUMMIT.p[0]), z: Math.round(SUMMIT.p[1]), m: Math.round(SUMMIT.h) } },
  sentinel2: { scenes: SRC.s2.scenes, image: SRC.s2.image },
};
const geom = (f) => {
  if (f.ring) return { type: 'Polygon', coordinates: [f.ring, ...(f.holes ?? [])].map((r) => [...r, r[0]].map(lngLat)) };
  if (f.line) return { type: 'LineString', coordinates: f.line.map(lngLat) };
  return { type: 'Point', coordinates: lngLat(f.point) };
};
const LAYER_ORDER = ['boundary', 'zone', 'landcover', 'area', 'waterway', 'road', 'path', 'roundabout', 'junction', 'gate', 'building', 'landmark', 'place'];
features.sort((a, b) => LAYER_ORDER.indexOf(a.layer) - LAYER_ORDER.indexOf(b.layer) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
const OMIT = new Set(['ring', 'holes', 'line', 'point', 'c', 'box', 'onCampus']);
const out = {
  type: 'FeatureCollection',
  metadata: {
    title: 'University of Ghana, Legon: master geography',
    generator: 'scripts/geography/build-master.mjs',
    crs: 'EPSG:4326 (WGS84 longitude, latitude)',
    gameFrame: { datum: [LAT0, LNG0], metresPerDegreeLat: M_LAT, metresPerDegreeLng: +M_LNG.toFixed(3), axes: 'x = metres east of the datum, z = metres south of the datum' },
    extent: 'the legacy OSM extract (5.633-5.668 N, 0.199-0.175 W) plus everything within 150 m of the OSM campus boundary',
    sources: report.sources,
    layers: LAYER_ORDER,
    confidence: { high: 'two or more independent sources agree (or OSM geometry confirmed by satellite footprints / written claims)', medium: 'one reliable source, or interpretive (zones, derived shapes)', low: 'sources conflict or a written claim fails' },
    trotroLines: Object.fromEntries(Object.entries(lineEnds).sort((a, b) => a[0].localeCompare(b[0], 'en', { numeric: true }))),
    imagery: { ...SRC.s2.frame, image: SRC.s2.image, scenes: SRC.s2.scenes },
    license: 'Contains OpenStreetMap data (ODbL), Google Open Buildings (CC-BY-4.0), Microsoft ML Buildings (ODbL), Overture Maps places (CDLA-Permissive-2.0), ESA WorldCover 2021 (CC-BY-4.0), Copernicus DEM and modified Copernicus Sentinel data.',
  },
  features: features.map((f) => ({ type: 'Feature', id: f.id, properties: Object.fromEntries(Object.entries(f).filter(([k, v]) => !OMIT.has(k) && k !== 'id' && v !== undefined && !(Array.isArray(v) && !v.length))), geometry: geom(f) })),
};
writeFileSync(`${G}/legon-master.geojson`, JSON.stringify(out));
writeFileSync(`${G}/reconciliation-report.json`, JSON.stringify(report, null, 1));
const byLayer = features.reduce((m, f) => ((m[f.layer] = (m[f.layer] ?? 0) + 1), m), {});
console.log(Object.entries(byLayer).map(([k, v]) => `${k} ${v}`).join(', '));
console.log(`buildings: ${report.buildings.osmValidatedByGoogleOpenBuildings}/${report.buildings.osmOnCampusChecked} OSM footprints confirmed by Google Open Buildings, ${mlAdded} added from ML footprints`);
console.log(`landmarks: ${report.landmarks.filter((l) => l.confidence === 'high').length} high, ${report.landmarks.filter((l) => l.confidence === 'medium').length} medium, ${report.landmarks.filter((l) => l.confidence === 'low').length} low; claims ${report.landmarks.flatMap((l) => l.claims).filter((c) => c.pass).length}/${report.landmarks.flatMap((l) => l.claims).length} pass`);
console.log(`places ${places.length} (moved ${moved}, added ${added}), conflicts ${conflicts.length}; ${(JSON.stringify(out).length / 1024 / 1024).toFixed(1)} MB`);
