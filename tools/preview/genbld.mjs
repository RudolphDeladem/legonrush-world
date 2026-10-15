import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const M = await server.ssrLoadModule('/src/game/campusmap.ts');
  const S = await server.ssrLoadModule('/src/game/sites.ts');
  const [X0, X1, Z0, Z1] = process.argv[2].split(',').map(Number);
  M.BUILDINGS.forEach((b, i) => {
    const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
    if (cx < X0 || cx > X1 || cz < Z0 || cz > Z1) return;
    const rep = S.BLOCK_SITES.filter((s) => s.replaces(b)).map((s) => s.name);
    const p = b.pts; let a = 0; for (let k = 0; k < p.length; k += 2) { const j = (k + 2) % p.length; a += p[k] * p[j + 1] - p[j] * p[k + 1]; }
    console.log(i, (b.name ?? '-').slice(0, 30), cx.toFixed(0), cz.toFixed(0), 'w', (b.maxX - b.minX).toFixed(0), 'd', (b.maxZ - b.minZ).toFixed(0), 'A', Math.abs(a / 2).toFixed(0), 'h', b.height ?? '', rep.join('|'));
  });
} finally { await server.close(); }
