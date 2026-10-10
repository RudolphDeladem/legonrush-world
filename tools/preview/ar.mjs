import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { AREAS, PLACES } = await server.ssrLoadModule('/src/game/campusmap.ts');
  const [x0,x1,z0,z1] = process.argv.slice(2).map(Number);
  AREAS.forEach((a, i) => { const p = []; for (let j = 0; j < a.pts.length; j += 2) p.push([a.pts[j], a.pts[j+1]]);
    if (p.some(([x,z]) => x>x0 && x<x1 && z>z0 && z<z1)) console.log(i, a.kind, p.map(([x,z])=>`${x.toFixed(1)},${z.toFixed(1)}`).join(' ')); });
  for (const p of PLACES) if (p.x>x0&&p.x<x1&&p.z>z0&&p.z<z1) console.log('place', p.name, p.kind, p.x, p.z);
} finally { await server.close(); }
