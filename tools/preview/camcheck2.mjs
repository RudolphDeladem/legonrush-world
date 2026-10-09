import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const cm = await server.ssrLoadModule('/src/game/campusmap.ts');
  const rt = await server.ssrLoadModule('/src/game/routes.ts');
  for (const n of ['Legon Hall Annex C (Graduate Hostel)', 'Legon Hall Annex B']) {
    const r = rt.exploreRoute(cm.placeByName(n), cm.placeByName('Great Hall'), 'cycle');
    for (const d of [0, -1.6, -3, -6.2, 5]) { const p = r.track.pose(d + r.lead); const b = cm.buildingNear(p.x, p.z, 0); console.log(n, d, p.x.toFixed(1), p.z.toFixed(1), b ? (b.name ?? 'unnamed') : '-'); }
  }
} finally { await server.close(); }
