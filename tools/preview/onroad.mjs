import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const M = await server.ssrLoadModule('/src/game/campusmap.ts');
  const S = await server.ssrLoadModule('/src/game/sites.ts');
  const [X0, X1, Z0, Z1] = process.argv[2].split(',').map(Number);
  const HW = [9, 7.4, 6.2, 4.6, 2.6];
  const segs = [];
  for (const r of M.ROADS) for (let i = 0; i < r.nodes.length - 1; i++) { const [ax, az] = M.nodeXZ(r.nodes[i]), [bx, bz] = M.nodeXZ(r.nodes[i + 1]); segs.push([ax, az, bx, bz, HW[r.cls] / 2, r.cls, r.name]); }
  M.BUILDINGS.forEach((b, i) => {
    const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
    if (cx < X0 || cx > X1 || cz < Z0 || cz > Z1) return;
    const rep = S.BLOCK_SITES.some((s) => s.replaces(b));
    const p = b.pts; let a = 0; for (let k = 0; k < p.length; k += 2) { const j = (k + 2) % p.length; a += p[k] * p[j + 1] - p[j] * p[k + 1]; }
    // the worst overlap: road edge distance from the outline's points and edge midpoints (inside the outline: the road centre)
    let worst = 99, which = '';
    const pts = []; for (let k = 0; k < p.length; k += 2) { const j = (k + 2) % p.length; pts.push([p[k], p[k + 1]], [(p[k] + p[j]) / 2, (p[k + 1] + p[j + 1]) / 2]); }
    for (const [x, z] of pts) for (const [ax, az, bx, bz, h, cls, nm] of segs) {
      if (cls > 3) continue;
      const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
      const d = Math.hypot(ax + dx * t - x, az + dz * t - z) - h;
      if (d < worst) { worst = d; which = `${cls}:${nm ?? '-'}`; }
    }
    console.log(i, rep ? 'SITE' : 'gen ', (b.name ?? '-').slice(0, 24).padEnd(24), cx.toFixed(0), cz.toFixed(0), 'A', Math.abs(a / 2).toFixed(0), 'road', worst.toFixed(1), which);
  });
} finally { await server.close(); }
