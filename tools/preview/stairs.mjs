import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const r = await server.ssrLoadModule('/src/game/relief.ts');
const life = await server.ssrLoadModule('/src/game/life.ts').catch(() => null);
for (const s of r.stairsOf()) {
  const u0 = Math.min(s.x0, s.x1), u1 = Math.max(s.x0, s.x1);
  let n = 0, onRoad = 0;
  for (let u = u0 + 0.2; u < u1; u += 0.5) for (let c = s.z0 + 0.2; c < s.z1; c += 0.5) {
    const [x, z] = s.alongZ ? [c, u] : [u, c]; n++;
    if (life && life.roadClearance(x, z, 6, -1, true) < 0) onRoad++;
  }
  console.log(s.alongZ ? 'Z' : 'X', s.x0, s.x1, s.z0, s.z1, 'top', s.top.toFixed(2), 'foot', s.foot.toFixed(2), 'onRoad', onRoad + '/' + n);
}
await server.close();
