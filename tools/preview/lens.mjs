import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const m = await server.ssrLoadModule('/src/features/challenges/model.ts');
  const out = {};
  for (const id of Object.keys(m.ROUTE_LENGTH)) { try { out[id] = [m.ROUTE_LENGTH[id], m.chRoute(id)?.build().length]; } catch (e) { out[id] = [m.ROUTE_LENGTH[id], 'ERR ' + e.message.slice(0, 80)]; } }
  console.log(JSON.stringify(out));
} finally { await server.close(); }
