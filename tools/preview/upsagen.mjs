// generic buildings the game draws inside the UPSA campus (not replaced by a site model): node .preview/upsagen.mjs out.json
import { createServer } from 'vite';
import { writeFileSync } from 'node:fs';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { BUILDINGS } = await server.ssrLoadModule('/src/game/campusmap.ts');
  const { BLOCK_SITES } = await server.ssrLoadModule('/src/game/sites.ts');
  const { UPSA_LAND } = await server.ssrLoadModule('/src/game/upsawestplan.ts');
  const inPoly = (r, x, z) => { let o = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > z) !== (r[j][1] > z) && x < ((r[j][0] - r[i][0]) * (z - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) o = !o; return o; };
  const out = [];
  BUILDINGS.forEach((b, i) => {
    const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
    if (!inPoly(UPSA_LAND, cx, cz)) return;
    if (BLOCK_SITES.some((s) => s.replaces(b))) return;
    out.push({ i, box: [b.minX, b.maxX, b.minZ, b.maxZ].map((v) => Math.round(v * 10) / 10), pts: Array.from(b.pts).map((v) => Math.round(v * 10) / 10) });
  });
  writeFileSync(process.argv[2], JSON.stringify(out));
  console.log(out.length);
} finally { await server.close(); }
