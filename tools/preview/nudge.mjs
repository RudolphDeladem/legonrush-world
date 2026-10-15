import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const cm = await server.ssrLoadModule('/src/game/campusmap.ts');
const W = [9, 7.4, 6.2, 4.6, 2.6];
const segs = [];
cm.ROADS.forEach((r) => { if (r.cls > 3) return; for (let k = 0; k < r.nodes.length - 1; k++) { const a = r.nodes[k], b = r.nodes[k + 1]; segs.push([cm.NODE_XZ[a*2], cm.NODE_XZ[a*2+1], cm.NODE_XZ[b*2], cm.NODE_XZ[b*2+1], W[r.cls] / 2]); } });
const near = (x, z) => { let best = null; for (const s of segs) { const [ax, az, bx, bz, h] = s, dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))); const px = ax + dx * t, pz = az + dz * t, d = Math.hypot(px - x, pz - z); const pen = h + 0.8 - d; if (!best || pen > best.pen) best = { pen, nx: (x - px) / (d || 1), nz: (z - pz) / (d || 1) }; } return best; };
const [X0, X1, Z0, Z1] = process.argv.slice(2).map(Number);
cm.BUILDINGS.forEach((b, i) => {
  if (b.maxX < X0 || b.minX > X1 || b.maxZ < Z0 || b.minZ > Z1) return;
  let worst = null;
  for (let k = 0; k < b.pts.length; k += 2) { const n = near(b.pts[k], b.pts[k + 1]); if (!worst || n.pen > worst.pen) worst = n; }
  if (worst.pen > 0) console.log(i, ((b.minX + b.maxX) / 2).toFixed(1), ((b.minZ + b.maxZ) / 2).toFixed(1), 'pen', worst.pen.toFixed(2), 'move', (worst.nx * worst.pen).toFixed(2), (worst.nz * worst.pen).toFixed(2));
});
await server.close();
