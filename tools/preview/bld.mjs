import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const cm = await server.ssrLoadModule('/src/game/campusmap.ts');
const W = [9, 7.4, 6.2, 4.6, 2.6];
const segs = [];
cm.ROADS.forEach((r) => { for (let k = 0; k < r.nodes.length - 1; k++) { const a = r.nodes[k], b = r.nodes[k + 1]; segs.push([cm.NODE_XZ[a*2], cm.NODE_XZ[a*2+1], cm.NODE_XZ[b*2], cm.NODE_XZ[b*2+1], W[r.cls] / 2, r.cls, r.name]); } });
const dist = (s, x, z) => { const [ax, az, bx, bz] = s, dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(ax + dx * t - x, az + dz * t - z); };
const [X0, X1, Z0, Z1] = process.argv.slice(2).map(Number);
cm.BUILDINGS.forEach((b, i) => {
  if (b.maxX < X0 || b.minX > X1 || b.maxZ < Z0 || b.minZ > Z1) return;
  let worst = Infinity, cls = -1;
  for (let k = 0; k < b.pts.length; k += 2) for (const s of segs) { if (s[5] === 4) continue; const d = dist(s, b.pts[k], b.pts[k + 1]) - s[4]; if (d < worst) { worst = d; cls = s[5]; } }
  console.log(i, b.name ?? '', 'h', b.height ?? '', b.minX.toFixed(0), b.maxX.toFixed(0), b.minZ.toFixed(0), b.maxZ.toFixed(0), 'roadgap', worst.toFixed(1), 'cls', cls);
});
await server.close();
