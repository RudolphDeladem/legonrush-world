import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { rectsOf } = await server.ssrLoadModule('/src/game/rectilinear.ts');
  const ring = [[-379.8, 368.5],[-377.9, 372.8],[-382.2, 374.8],[-384.2, 370.5]];
  let cx = 0, cz = 0; for (const [x, z] of ring) { cx += x / 4; cz += z / 4; }
  let best = 0, ang = 0;
  for (let i = 0; i < 4; i++) { const [ax, az] = ring[i], [bx, bz] = ring[(i + 1) % 4], l = Math.hypot(bx - ax, bz - az); if (l > best) { best = l; ang = Math.atan2(bz - az, bx - ax); } }
  ang = ((ang % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
  const ux = Math.cos(ang), uz = Math.sin(ang);
  const loc = ring.map(([x, z]) => [(x - cx) * ux + (z - cz) * uz, -(x - cx) * uz + (z - cz) * ux]);
  console.log(JSON.stringify({ang, loc, r: rectsOf(loc, 0.9, 1.2)}));
} finally { await server.close(); }
