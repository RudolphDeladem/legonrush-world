// aid.mjs x,z: the master feature ids (any polygon) containing each game point
import { readFileSync } from 'node:fs';
import { toLocal, pointInRing } from '../scripts/geography/lib.mjs';
const m = JSON.parse(readFileSync('data/geography/legon-master.geojson', 'utf8'));
for (const a of process.argv.slice(2)) {
  const [x, z] = a.split(',').map(Number);
  for (const f of m.features) {
    const g = f.geometry; if (!g || (g.type !== 'Polygon' && g.type !== 'MultiPolygon')) continue;
    const rings = g.type === 'Polygon' ? [g.coordinates[0]] : g.coordinates.map((p) => p[0]);
    for (const r of rings) { const loc = r.map(([lng, lat]) => toLocal(lat, lng)); if (pointInRing(loc, [x, z])) console.log(a, f.id ?? f.properties.id, JSON.stringify(f.properties).slice(0, 200)); }
  }
}
