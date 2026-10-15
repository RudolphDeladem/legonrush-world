import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const S = await server.ssrLoadModule('/src/game/sites.ts');
  const R = await server.ssrLoadModule('/src/game/relief.ts');
  const [X0, X1, Z0, Z1] = process.argv[2].split(',').map(Number);
  for (const s of S.BLOCK_SITES) for (const f of s.frames()) if (f.cx > X0 && f.cx < X1 && f.cz > Z0 && f.cz < Z1) {
    const hs = []; for (const dx of [-25, 0, 25]) for (const dz of [-25, 0, 25]) hs.push(R.groundHeight(f.cx + dx, f.cz + dz));
    console.log(s.name ?? '?', '|', f.name, f.cx.toFixed(0), f.cz.toFixed(0), 'h0', R.groundHeight(f.cx, f.cz).toFixed(2), 'range', Math.min(...hs).toFixed(2), Math.max(...hs).toFixed(2));
  }
} finally { await server.close(); }
