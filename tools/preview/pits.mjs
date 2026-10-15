import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const cm = await server.ssrLoadModule('/src/game/campusmap.ts');
const rel = await server.ssrLoadModule('/src/game/relief.ts');
const sc = await server.ssrLoadModule('/src/game/science.ts');
const W = [9, 7.4, 6.2, 4.6, 2.6], segs = [];
cm.ROADS.forEach((r) => { for (let k = 0; k < r.nodes.length - 1; k++) { const a = r.nodes[k], b = r.nodes[k + 1]; segs.push([cm.NODE_XZ[a*2], cm.NODE_XZ[a*2+1], cm.NODE_XZ[b*2], cm.NODE_XZ[b*2+1], W[r.cls] / 2]); } });
const clr = (x, z) => { let best = 6; for (const [ax, az, bx, bz, h] of segs) { if (Math.min(ax,bx) > x+12 || Math.max(ax,bx) < x-12 || Math.min(az,bz) > z+12 || Math.max(az,bz) < z-12) continue; const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))); best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z) - h); } return best; };
const hits = [];
for (const b of rel.RELIEF_BOXES) {
  if ((b.x1 - b.x0) * (b.z1 - b.z0) > 4e6) continue;
  for (let x = b.x0; x < b.x1; x += 1) for (let z = b.z0; z < b.z1; z += 1) {
    const c = clr(x, z); if (c > -0.15) continue;
    if (rel.inStairs(x, z) || !sc.offAsphalt(x, z)) continue;
    hits.push([x, z]);
  }
}
const cl = []; for (const [x, z] of hits) { const c = cl.find((k) => Math.abs(k.x - x) < 15 && Math.abs(k.z - z) < 15); if (c) c.n++; else cl.push({ x, z, n: 1 }); }
console.log(hits.length, JSON.stringify(cl.slice(0, 60)));
await server.close();
