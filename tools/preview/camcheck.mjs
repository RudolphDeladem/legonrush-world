import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const cm = await server.ssrLoadModule('/src/game/campusmap.ts');
  const rt = await server.ssrLoadModule('/src/game/routes.ts');
  const to = cm.placeByName('Great Hall'), alt = cm.placeByName('Night Market');
  let n = 0, before = 0, after = 0, worst = [];
  for (const p of cm.PLACES) {
    const dest = p.name === to.name ? alt : to;
    const r = rt.exploreRoute(p, dest, 'cycle');
    if (!r) continue;
    n++;
    const pose = (d) => r.track.pose(d + r.lead, 0);
    let back = 6.2, b = pose(-back);
    if (cm.buildingNear(b.x, b.z, 1.2)) before++;
    while (back > 1.6 && cm.buildingNear(b.x, b.z, 1.2)) { back -= 0.8; b = pose(-back); }
    if (cm.buildingNear(b.x, b.z, 0.3)) for (const [db, side] of [[3, 5], [3, -5], [-2, 7], [-2, -7]]) { const c = r.track.pose(-db + r.lead, side); if (!cm.buildingNear(c.x, c.z, 0.3)) { b = c; break; } }
    if (cm.buildingNear(b.x, b.z, 0)) { after++; worst.push(p.name); }
  }
  console.log({ n, before, afterInside: after }, worst.slice(0, 10));
} finally { await server.close(); }
