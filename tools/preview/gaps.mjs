import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const cm = await server.ssrLoadModule('/src/game/campusmap.ts');
  const rt = await server.ssrLoadModule('/src/game/routes.ts');
  const w = await server.ssrLoadModule('/src/game/junctions.ts');
  for (const [a, b] of [['Night Market', 'The Balme Library'], ['Volta Hall', 'Great Hall'], ['Jubilee Hall', 'Central Cafeteria, CC']]) {
    const r = rt.exploreRoute(cm.placeByName(a), cm.placeByName(b), 'cycle');
    const t0 = Date.now();
    const g = w.walkGaps(r.track, 3.8, [9, 7.4, 6.2, 4.6, 2.6]);
    console.log(a, '->', b, 'length', r.track.length, 'gaps L', g[0].length, 'R', g[1].length, Date.now() - t0, 'ms');
    console.log('  L', g[0].map(([x, y]) => `${x.toFixed(0)}-${y.toFixed(0)}`).join(' '));
    console.log('  R', g[1].map(([x, y]) => `${x.toFixed(0)}-${y.toFixed(0)}`).join(' '));
  }
} finally { await server.close(); }
