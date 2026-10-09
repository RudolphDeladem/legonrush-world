import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const w = await server.ssrLoadModule('/src/game/westlegon.ts');
  const f = w.westLegon.frames();
  console.log(f.length, f.filter((x) => x.name.includes('4927297')).map((x) => `${x.name} ${x.cx.toFixed(1)},${x.cz.toFixed(1)}`).join(' | '));
} finally { await server.close(); }
