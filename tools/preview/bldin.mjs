import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const m = await server.ssrLoadModule('/src/game/campusmap.ts');
const [X0, X1, Z0, Z1] = process.argv[2].split(',').map(Number);
for (const b of m.BUILDINGS) if (b.maxX > X0 && b.minX < X1 && b.maxZ > Z0 && b.minZ < Z1) console.log(b.id ?? '', b.name ?? '', b.minX.toFixed(1), b.maxX.toFixed(1), b.minZ.toFixed(1), b.maxZ.toFixed(1));
await server.close();
