import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const m = await server.ssrLoadModule('/src/game/campusmap.ts');
const [X0, X1, Z0, Z1] = process.argv[2].split(',').map(Number);
const out = [];
m.ROADS.forEach((r, i) => { const pts = r.nodes.map((n) => [+m.NODE_XZ[n * 2].toFixed(1), +m.NODE_XZ[n * 2 + 1].toFixed(1)]); if (pts.some(([x, z]) => x > X0 && x < X1 && z > Z0 && z < Z1)) out.push({ i, name: r.name, cls: r.cls, surface: r.surface, pts }); });
console.log(JSON.stringify(out));
await server.close();
