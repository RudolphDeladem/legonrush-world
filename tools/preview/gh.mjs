import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const r = await server.ssrLoadModule('/src/game/relief.ts');
  for (const [x, z] of [[-300, 258], [-266, 214], [-290, 344], [-440, 290], [-470, 520], [-350, 261], [-260, 436], [-395, 479]]) console.log(x, z, r.groundHeight(x, z).toFixed(2));
} finally { await server.close(); }
