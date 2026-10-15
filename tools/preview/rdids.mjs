import { readFileSync } from 'node:fs';
import { toLocal } from '../scripts/geography/lib.mjs';
const m = JSON.parse(readFileSync('data/geography/legon-master.geojson', 'utf8'));
const [X0, X1, Z0, Z1] = process.argv[2].split(',').map(Number);
for (const f of m.features) {
  if (!['road', 'path'].includes(f.properties.layer)) continue;
  const pts = f.geometry.coordinates.map(([lng, lat]) => toLocal(lat, lng).map((v) => +v.toFixed(1)));
  if (pts.some(([x, z]) => x > X0 && x < X1 && z > Z0 && z < Z1)) console.log(f.id, f.properties.class, f.properties.service ?? '', f.properties.game, JSON.stringify(pts));
}
