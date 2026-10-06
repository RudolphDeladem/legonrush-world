// Shared helpers for the Legon geography pipeline: the game's coordinate frame,
// an OpenStreetMap XML reader and the small amount of plane geometry the build needs.
// No dependencies: the build runs in CI with plain Node.
import { readFileSync } from 'node:fs';

// ---------- frame ----------
// Local tangent plane used by the game: metres from a fixed datum point, +x east, +z south.
// The datum (5.6518 N, 0.1871 W) is kept from the legacy map so saved positions stay valid;
// it is a coordinate origin, not a claim about where any building is.
export const LAT0 = 5.6518, LNG0 = -0.1871;
export const M_LAT = 110574, M_LNG = 111320 * Math.cos((LAT0 * Math.PI) / 180);
export const toLocal = (lat, lng) => [(lng - LNG0) * M_LNG, -(lat - LAT0) * M_LAT];
export const toLatLng = (x, z) => [LAT0 - z / M_LAT, LNG0 + x / M_LNG];
/** [lng, lat] pairs (GeoJSON order) -> local [x, z] */
export const ringLocal = (coords) => coords.map(([lng, lat]) => toLocal(lat, lng));
const r7 = (v) => Math.round(v * 1e7) / 1e7;
/** local [x, z] -> GeoJSON [lng, lat] rounded to ~1 cm */
export const lngLat = ([x, z]) => { const [lat, lng] = toLatLng(x, z); return [r7(lng), r7(lat)]; };

// ---------- OpenStreetMap XML ----------
const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const attrs = (s) => Object.fromEntries([...s.matchAll(/(\w[\w:]*)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const tagsOf = (body) => Object.fromEntries([...body.matchAll(/<tag k="([^"]*)" v="([^"]*)"\s*\/>/g)].map((m) => [m[1], unescape(m[2])]));

export function readOsm(path) {
  const xml = readFileSync(path, 'utf8');
  const nodes = new Map(); // id -> { lat, lng, p: [x, z], t? }
  for (const m of xml.matchAll(/<node ([^>]*?)(\/>|>([\s\S]*?)<\/node>)/g)) {
    const a = attrs(m[1]);
    const n = { lat: +a.lat, lng: +a.lon, p: toLocal(+a.lat, +a.lon) };
    if (m[3]) { const t = tagsOf(m[3]); if (Object.keys(t).length) n.t = t; }
    nodes.set(a.id, n);
  }
  const ways = new Map();
  for (const m of xml.matchAll(/<way ([^>]*?)>([\s\S]*?)<\/way>/g)) {
    const id = attrs(m[1]).id;
    const refs = [...m[2].matchAll(/<nd ref="(\d+)"\s*\/>/g)].map((r) => r[1]).filter((r) => nodes.has(r));
    ways.set(id, { id, refs, t: tagsOf(m[2]) });
  }
  const relations = new Map();
  for (const m of xml.matchAll(/<relation ([^>]*?)>([\s\S]*?)<\/relation>/g)) {
    const id = attrs(m[1]).id;
    const members = [...m[2].matchAll(/<member type="(\w+)" ref="(\d+)" role="([^"]*)"\s*\/>/g)].map((r) => ({ type: r[1], ref: r[2], role: r[3] }));
    relations.set(id, { id, members, t: tagsOf(m[2]) });
  }
  const timestamp = xml.match(/<meta osm_base="([^"]+)"/)?.[1];
  return { nodes, ways, relations, timestamp };
}

/** join a multipolygon relation's outer (or inner) member ways into closed rings of node refs */
export function relationRings(osm, rel, inner = false) {
  const parts = rel.members.filter((m) => m.type === 'way' && (m.role === 'inner') === inner && osm.ways.has(m.ref)).map((m) => [...osm.ways.get(m.ref).refs]);
  const rings = [];
  while (parts.length) {
    let ring = parts.shift();
    let grown = true;
    while (ring[0] !== ring[ring.length - 1] && grown) {
      grown = false;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i], end = ring[ring.length - 1];
        if (p[0] === end) ring = ring.concat(p.slice(1));
        else if (p[p.length - 1] === end) ring = ring.concat(p.slice(0, -1).reverse());
        else continue;
        parts.splice(i, 1);
        grown = true;
        break;
      }
    }
    if (ring.length >= 4 && ring[0] === ring[ring.length - 1]) rings.push(ring);
  }
  return rings;
}
/** node refs of a closed ring -> open list of local points */
export const refsToRing = (osm, refs) => refs.slice(0, refs[0] === refs[refs.length - 1] ? -1 : undefined).map((r) => osm.nodes.get(r).p);
export const refsToLine = (osm, refs) => refs.map((r) => osm.nodes.get(r).p);

// ---------- plane geometry (rings are open lists of [x, z]) ----------
export function signedArea(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length]; s += x0 * z1 - x1 * z0; }
  return s / 2;
}
export const area = (pts) => Math.abs(signedArea(pts));
export function centroid(pts) {
  let a = 0, cx = 0, cz = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const f = x0 * z1 - x1 * z0;
    a += f; cx += (x0 + x1) * f; cz += (z0 + z1) * f;
  }
  if (Math.abs(a) < 1e-6) return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
  return [cx / (3 * a), cz / (3 * a)];
}
export function pointInRing(pts, [x, z]) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
export function bbox(pts) {
  let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
  for (const [x, z] of pts) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (z < minZ) minZ = z; if (z > maxZ) maxZ = z; }
  return { minX, minZ, maxX, maxZ };
}
export const bboxOverlap = (a, b) => a.minX <= b.maxX && b.minX <= a.maxX && a.minZ <= b.maxZ && b.minZ <= a.maxZ;
export function segDist([px, pz], [ax, az], [bx, bz]) {
  const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz;
  const t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l)) : 0;
  return Math.hypot(px - ax - t * dx, pz - az - t * dz);
}
/** distance from a point to a polyline (or to a ring's edges when closed = true) */
export function distToLine(p, pts, closed = false) {
  let d = Infinity;
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) d = Math.min(d, segDist(p, pts[i], pts[(i + 1) % pts.length]));
  return d;
}
export const lineLength = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

/** convex hull (monotone chain) */
export function hull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
/**
 * Minimum-area enclosing rectangle: the footprint's main axis.
 * bearing = compass direction of the long side in degrees, 0-180 (0 = north-south, 90 = east-west).
 */
export function orientation(pts) {
  const h = hull(pts);
  let best = { area: Infinity };
  for (let i = 0; i < h.length; i++) {
    const [x0, z0] = h[i], [x1, z1] = h[(i + 1) % h.length];
    const a = Math.atan2(z1 - z0, x1 - x0);
    const c = Math.cos(a), s = Math.sin(a);
    let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
    for (const [x, z] of h) { const u = x * c + z * s, v = -x * s + z * c; minU = Math.min(minU, u); maxU = Math.max(maxU, u); minV = Math.min(minV, v); maxV = Math.max(maxV, v); }
    const ar = (maxU - minU) * (maxV - minV);
    if (ar < best.area) best = { area: ar, a, l: maxU - minU, w: maxV - minV };
  }
  if (!Number.isFinite(best.area)) return { bearing: 0, length: 0, width: 0 };
  let ang = best.a + (best.l < best.w ? Math.PI / 2 : 0);
  // compass bearing of the long axis: x east, z south -> bearing measured from north (-z) clockwise
  let bearing = (Math.atan2(Math.cos(ang), -Math.sin(ang)) * 180) / Math.PI;
  bearing = ((bearing % 180) + 180) % 180;
  return { bearing: Math.round(bearing), length: Math.round(Math.max(best.l, best.w) * 10) / 10, width: Math.round(Math.min(best.l, best.w) * 10) / 10 };
}

/**
 * Overlap of two polygons by rasterising both on a fine grid (cell metres).
 * Returns { inter, a, b } areas in m². Good to ~1-2% for building-sized shapes.
 */
export function overlap(pa, pb, cell = 0.5) {
  const A = bbox(pa), B = bbox(pb);
  const minX = Math.min(A.minX, B.minX), minZ = Math.min(A.minZ, B.minZ), maxX = Math.max(A.maxX, B.maxX), maxZ = Math.max(A.maxZ, B.maxZ);
  if (!bboxOverlap(A, B)) return { inter: 0, a: area(pa), b: area(pb) };
  let inter = 0;
  const ix0 = Math.max(A.minX, B.minX), ix1 = Math.min(A.maxX, B.maxX), iz0 = Math.max(A.minZ, B.minZ), iz1 = Math.min(A.maxZ, B.maxZ);
  for (let z = iz0 + cell / 2; z < iz1; z += cell) for (let x = ix0 + cell / 2; x < ix1; x += cell) if (pointInRing(pa, [x, z]) && pointInRing(pb, [x, z])) inter++;
  void minX; void minZ; void maxX; void maxZ;
  return { inter: inter * cell * cell, a: area(pa), b: area(pb) };
}

/** uniform grid index over bounding boxes */
export class Grid {
  constructor(cell = 100) { this.cell = cell; this.m = new Map(); }
  add(i, b) {
    const c = this.cell;
    for (let x = Math.floor(b.minX / c); x <= Math.floor(b.maxX / c); x++)
      for (let z = Math.floor(b.minZ / c); z <= Math.floor(b.maxZ / c); z++) {
        const k = `${x},${z}`;
        let l = this.m.get(k);
        if (!l) this.m.set(k, (l = []));
        l.push(i);
      }
  }
  query(b) {
    const c = this.cell, out = new Set();
    for (let x = Math.floor(b.minX / c); x <= Math.floor(b.maxX / c); x++)
      for (let z = Math.floor(b.minZ / c); z <= Math.floor(b.maxZ / c); z++) for (const i of this.m.get(`${x},${z}`) ?? []) out.add(i);
    return out;
  }
}

/** loose name comparison: lower case, no punctuation, no filler words */
export const normName = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ')
  .replace(/\b(the|of|and|dr|department|dept|university|ghana|legon|ug|hall|hostel|building)\b/g, ' ').replace(/\s+/g, ' ').trim();
export const nameWords = (s) => new Set(normName(s).split(' ').filter((w) => w.length > 2));
/** share of the shorter name's words found in the other */
export function nameMatch(a, b) {
  const A = nameWords(a), B = nameWords(b);
  if (!A.size || !B.size) return normName(a) === normName(b) && normName(a) !== '' ? 1 : 0;
  const common = [...A].filter((w) => B.has(w)).length;
  return common / Math.min(A.size, B.size);
}
