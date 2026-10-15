import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const R = await server.ssrLoadModule('/src/game/relief.ts');
  const pts = JSON.parse(process.argv[2]);
  for (const [x, z] of pts) console.log(x, z, R.groundHeight(x, z).toFixed(2));
} finally { await server.close(); }
