// plan.mjs out.json "x0,x1,z0,z1": every building (index, name, ring) and road polyline in the box, for plotting
import { createServer } from 'vite';
import { writeFileSync } from 'node:fs';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const M = await server.ssrLoadModule('/src/game/campusmap.ts');
  const [X0, X1, Z0, Z1] = process.argv[3].split(',').map(Number);
  const inb = (x, z) => x > X0 && x < X1 && z > Z0 && z < Z1;
  const roads = M.ROADS.map((r) => ({ name: r.name, cls: r.cls, pts: r.nodes.map((i) => M.nodeXZ(i)) })).filter((r) => r.pts.some(([x, z]) => inb(x, z)));
  const blds = M.BUILDINGS.map((b, i) => ({ i, name: b.name, pts: Array.from(b.pts), h: b.height })).filter((b) => b.pts.some((v, j) => j % 2 === 0 && inb(v, b.pts[j + 1])));
  const areas = M.AREAS.map((a) => ({ kind: a.kind, pts: Array.from(a.pts) })).filter((a) => a.pts.some((v, j) => j % 2 === 0 && inb(v, a.pts[j + 1])));
  writeFileSync(process.argv[2], JSON.stringify({ box: [X0, X1, Z0, Z1], roads, blds, areas }));
} finally { await server.close(); }
