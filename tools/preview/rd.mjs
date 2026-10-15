import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const m = await server.ssrLoadModule('/src/game/campusmap.ts');
for (const r of m.ROADS) { const pts = r.nodes.map((n) => [m.NODE_XZ[n * 2], m.NODE_XZ[n * 2 + 1]]); if (pts.some(([x, z]) => x > 500 && x < 560 && z > -1240 && z < -1190)) console.log(r.kind ?? r.type, r.name, JSON.stringify(pts.map(([x, z]) => [+x.toFixed(1), +z.toFixed(1)]))); }
await server.close();
