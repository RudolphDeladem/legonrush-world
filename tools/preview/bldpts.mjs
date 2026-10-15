import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const m = await server.ssrLoadModule('/src/game/campusmap.ts');
const [X0, X1, Z0, Z1] = process.argv[2].split(',').map(Number);
const out = [];
for (const b of m.BUILDINGS) if (b.maxX > X0 && b.minX < X1 && b.maxZ > Z0 && b.minZ < Z1) out.push({ id: b.id, name: b.name, h: b.height, pts: Array.from(b.pts).map((v) => +v.toFixed(1)) });
console.log(JSON.stringify(out));
await server.close();
