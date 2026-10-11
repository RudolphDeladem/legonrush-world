import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try { const g = (await server.ssrLoadModule('/src/game/relief.ts')).groundHeight; const a = process.argv.slice(2).map(Number);
  for (let i = 0; i < a.length; i += 2) console.log(a[i], a[i + 1], g(a[i], a[i + 1]).toFixed(3)); } finally { await server.close(); }
