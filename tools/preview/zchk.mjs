import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const R = await server.ssrLoadModule('/src/game/relief.ts');
  R.RELIEF_BOXES.forEach((b, i) => { if (b.x1 > 365 && b.x0 < 700 && b.z1 > -343 && b.z0 < 105) { const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2; console.log(i, JSON.stringify(b), 'P', R.ajProfile(cz).toFixed(2), 'g', R.groundHeight(cx, cz).toFixed(2)); } });
  for (const [x, z] of [[510, -343], [510, -300], [510, -260], [510, -235], [510, -200], [510, -165], [510, -120], [510, -60], [510, 0], [510, 60], [510, 105], [510, 116], [560, -201], [568, -56], [440, -250], [460, -120], [445, -50], [600, -78]]) console.log('h', x, z, R.groundHeight(x, z).toFixed(2));
} finally { await server.close(); }
