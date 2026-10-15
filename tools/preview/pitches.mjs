import { readFileSync } from 'node:fs';
import { toLocal } from '../scripts/geography/lib.mjs';
const m = JSON.parse(readFileSync('data/geography/legon-master.geojson', 'utf8'));
const [X0,X1,Z0,Z1,cls] = process.argv[2].split(',');
for (const f of m.features) {
  const p = f.properties; if (cls && p.class !== cls) continue;
  const g = f.geometry; if (!g || g.type !== 'Polygon') continue;
  const loc = g.coordinates[0].map(([lng, lat]) => toLocal(lat, lng));
  const cx = loc.reduce((s, q) => s + q[0], 0) / loc.length, cz = loc.reduce((s, q) => s + q[1], 0) / loc.length;
  if (cx > +X0 && cx < +X1 && cz > +Z0 && cz < +Z1) console.log(f.id, p.layer, p.class, p.name ?? '', Math.round(cx), Math.round(cz), JSON.stringify(loc.map(q=>q.map(Math.round))).slice(0,160));
}
