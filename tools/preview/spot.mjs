import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const g = await server.ssrLoadModule('/src/game/ghlplan.ts');
// a dry/green spot with a dense cluster 8-14 m north of it, nothing dense within 5 m
const out = [];
for (let x = -1900; x < -1100; x += 4) for (let z = -600; z < 400; z += 4) {
  if (!g.inGhl(x, z)) continue;
  const [c] = g.ghCover(x, z); if (c !== 2 && c !== 3) continue;
  let near = 0, ahead = 0;
  for (let dx = -6; dx <= 6; dx += 2) for (let dz = -6; dz <= 6; dz += 2) if (g.ghCover(x + dx, z + dz)[0] === 1) near++;
  for (let dx = -8; dx <= 8; dx += 4) for (let dz = -16; dz <= -8; dz += 4) if (g.ghCover(x + dx, z + dz)[0] === 1) ahead++;
  if (near === 0 && ahead >= 9) out.push([x, z, ahead]);
}
console.log(out.length, out.slice(0, 12).map((p) => p.join(',')).join(' | '));
await server.close();
