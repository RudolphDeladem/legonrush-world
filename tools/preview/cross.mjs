import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const m = await server.ssrLoadModule('/src/game/campusmap.ts');
const B = [[513, -1692], [607, -1692], [607, -1515], [513, -1515]];
const X = (a, b, c, d) => { const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])); return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b); };
for (const r of m.ROADS) { const pts = r.nodes.map((n) => [m.NODE_XZ[n * 2], m.NODE_XZ[n * 2 + 1]]); for (let i = 1; i < pts.length; i++) for (let j = 0; j < 3; j++) if (X(pts[i - 1], pts[i], B[j], B[j + 1])) console.log('road crosses side', j, r.name, r.kind, JSON.stringify([pts[i - 1], pts[i]].map(p=>p.map(v=>+v.toFixed(1))))); }
for (const a of m.AREAS) { const p = a.pts; for (let i = 0; i < p.length; i += 2) { const x = p[i], z = p[i + 1]; if (x > 505 && x < 615 && z > -1700 && z < -1508 && (Math.abs(z + 1692) < 3 || Math.abs(x - 607) < 3 || Math.abs(z + 1515) < 3)) { console.log('area near', a.kind, x.toFixed(1), z.toFixed(1)); break; } } }
for (const b of m.BUILDINGS) if (b.maxX > 505 && b.minX < 615 && b.maxZ > -1700 && b.minZ < -1508 && (b.minZ < -1690 || b.maxX > 605 || b.maxZ > -1517)) console.log('bld', b.name, b.minX.toFixed(1), b.maxX.toFixed(1), b.minZ.toFixed(1), b.maxZ.toFixed(1));
await server.close();
