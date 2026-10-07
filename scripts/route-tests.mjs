// Route tests: runs the game's own routing (through Vite) and fails when destination access or
// a representative journey is wrong. Usage: npm run test:routes   (UPDATE_RACES=1 to re-snapshot races)
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const failures = [];
const notes = [];
const fail = (m) => failures.push(m);
try {
  const cm = await server.ssrLoadModule('/src/game/campusmap.ts');
  const rt = await server.ssrLoadModule('/src/game/routes.ts');
  const { ROUTE_CHECKS } = await server.ssrLoadModule('/src/data/route-checks.ts');
  const { PLACES, ACCESS, BUILDINGS, ROADS, nodeXZ, nodeEdges, buildingAt, placeByName } = cm;

  // buildings the mapped network itself passes through (gatehouses, arcades): riding through them is real
  const passages = new Set();
  for (const r of ROADS) for (let k = 0; k < r.nodes.length - 1; k++) {
    const [ax, az] = nodeXZ(r.nodes[k]), [bx, bz] = nodeXZ(r.nodes[k + 1]);
    const len = Math.hypot(bx - ax, bz - az);
    for (let s = 0.5; s < len; s += 1) { const b = buildingAt(ax + ((bx - ax) * s) / len, az + ((bz - az) * s) / len); if (b) passages.add(b); }
  }
  const blockedAt = (x, z) => { const b = buildingAt(x, z); return b && !passages.has(b) ? b : null; };

  // the connected network, from the Main Gate's access point
  const reach = new Set([ACCESS.get('Legon Main Entrance').node]);
  for (const queue = [...reach]; queue.length;) for (const e of nodeEdges(queue.pop())) if (!reach.has(e.to)) { reach.add(e.to); queue.push(e.to); }

  // ---------- destination access: every place ----------
  let lowLegs = 0;
  for (const p of PLACES) {
    const a = ACCESS.get(p.name);
    if (!a) { fail(`${p.name}: no access point`); continue; }
    const [ax, az] = nodeXZ(a.node);
    if (!reach.has(a.node)) fail(`${p.name}: access point is not connected to the road/path network`);
    if (!reach.has(a.dropNode)) fail(`${p.name}: drop-off is not connected to the road network`);
    if (blockedAt(ax, az)) fail(`${p.name}: arrival point is inside ${blockedAt(ax, az).name ?? 'a building'}`);
    // the walk from the arrival point through the forecourt waypoints to the entrance must be clear (the entrance itself sits on the outline)
    const leg = [[ax, az], ...(a.via ?? []), a.entrance];
    let crossed = null;
    for (let i = 0; i < leg.length - 1 && !crossed; i++) {
      const [x0, z0] = leg[i], [x1, z1] = leg[i + 1], len = Math.hypot(x1 - x0, z1 - z0);
      const end = i === leg.length - 2 ? len - 1.5 : len;
      for (let s = 0.5; s < end; s += 0.5) { const b = blockedAt(x0 + ((x1 - x0) * s) / len, z0 + ((z1 - z0) * s) / len); if (b) { crossed = b; break; } }
    }
    if (crossed) { if (a.confidence === 'low') lowLegs++; else fail(`${p.name}: the way from the arrival point to the entrance crosses ${crossed.name ?? 'a building'}`); }
  }
  // evidence rules: verified means high, nothing unverified or inferred is presented as high
  const { readFileSync: rf } = await import('node:fs');
  const registry = JSON.parse(rf('data/geography/registry/access.json', 'utf8'));
  for (const n of registry.priority) {
    const a = ACCESS.get(n);
    if (!a) { fail(`priority destination ${n}: no access`); continue; }
    if (a.status === 'inferred' || a.status === 'mapped') fail(`priority destination ${n}: status ${a.status} (must be verified, partial or unverified)`);
  }
  for (const [n, a] of ACCESS) {
    if (a.status === 'verified' && a.confidence !== 'high') fail(`${n}: verified but confidence ${a.confidence}`);
    if (a.status !== 'verified' && a.confidence === 'high' && !['mapped'].includes(a.status)) fail(`${n}: ${a.status} but confidence high`);
  }
  // the Diaspora halls: front door in the middle of the facade facing the partner hall, back door in the middle of the opposite facade
  const halls = await server.ssrLoadModule('/src/game/halls.ts');
  const frames = halls.diasporaFrames();
  if (frames.length !== 4) fail(`expected 4 Diaspora halls, found ${frames.length}`);
  for (const f of frames) {
    const a = ACCESS.get(f.name);
    if (!a) { fail(`${f.name}: no access`); continue; }
    const loc = ([x, z]) => [(x - f.cx) * f.ax + (z - f.cz) * f.az, (x - f.cx) * f.fx + (z - f.cz) * f.fz];
    const [ex, ez] = loc(a.entrance);
    if (Math.abs(ex) > 1 || Math.abs(ez - f.hz) > 1) fail(`${f.name}: front entrance is not the middle of the front facade (${ex.toFixed(1)}, ${ez.toFixed(1)})`);
    const back = a.secondary?.[0];
    if (!back) fail(`${f.name}: no back entrance`);
    else { const [bx, bz] = loc(back); if (Math.abs(bx) > 1 || Math.abs(bz + f.hz) > 1) fail(`${f.name}: back entrance is not the middle of the back facade (${bx.toFixed(1)}, ${bz.toFixed(1)})`); }
    if (a.status !== 'verified') fail(`${f.name}: entrance status ${a.status}`);
  }
  const partner = { 'Dr. Hilla Limann Hall': 'Alexander Kwapong Hall', 'Elizabeth Frances Sey Hall': 'Jean Nelson Aka Hall' };
  for (const [x, y] of Object.entries(partner)) {
    const fx = frames.find((f) => f.name === x), fy = frames.find((f) => f.name === y);
    // fronts face each other: each hall's front axis points at the other hall
    if (fx && fy && ((fy.cx - fx.cx) * fx.fx + (fy.cz - fx.cz) * fx.fz <= 0 || (fx.cx - fy.cx) * fy.fx + (fx.cz - fy.cz) * fy.fz <= 0)) fail(`${x} and ${y} do not face each other`);
  }
  if (lowLegs) notes.push(`${lowLegs} low-confidence destinations have a building between the network and the entrance (enclosed courtyards / mapping gaps; listed in data/geography/access-report.json)`);

  // ---------- representative journeys ----------
  const check = (c, mode) => {
    const from = placeByName(c.from), to = placeByName(c.to);
    if (!from || !to) return fail(`${c.from} -> ${c.to}: unknown place`);
    const r = rt.exploreRoute(from, to, mode);
    const tag = `${c.from} -> ${c.to} (${mode})`;
    if (!r) return fail(`${tag}: no route`);
    if (r.length > c.maxLength) fail(`${tag}: ${r.length} m, longer than ${c.maxLength} m`);
    const fa = ACCESS.get(from.name), ta = ACCESS.get(to.name);
    const want = (a) => nodeXZ(mode === 'drive' ? a.dropNode : a.node);
    const s = r.track.pose(r.lead, 0), e = r.track.pose(r.lead + r.length, 0);
    const [sx, sz] = want(fa), [ex, ez] = want(ta);
    if (Math.hypot(s.x - sx, s.z - sz) > 3) fail(`${tag}: starts ${Math.round(Math.hypot(s.x - sx, s.z - sz))} m from the origin's access point`);
    if (Math.hypot(e.x - ex, e.z - ez) > 3) fail(`${tag}: ends ${Math.round(Math.hypot(e.x - ex, e.z - ez))} m from the destination's access point`);
    if (blockedAt(e.x, e.z)) fail(`${tag}: ends inside ${blockedAt(e.x, e.z).name ?? 'a building'}`);
    // the whole ride, run-up and run-out included, stays out of buildings
    for (let d = 0; d <= r.track.length; d += 1) {
      const p = r.track.pose(d, 0), b = blockedAt(p.x, p.z);
      if (b) { fail(`${tag}: ${d < r.lead ? 'run-up' : d > r.lead + r.length ? 'run-out' : 'ride'} crosses ${b.name ?? 'a building'} at ${Math.round(p.x)},${Math.round(p.z)}`); break; }
    }
    if (mode === 'drive') for (let d = 0; d <= r.length; d += 5) if (r.classAt(d) === 4) { fail(`${tag}: a taxi route uses a footpath`); break; }
    return r;
  };
  const lengths = [];
  for (const c of ROUTE_CHECKS) {
    const r = check(c, 'cycle');
    check(c, 'walk');
    check(c, 'drive');
    if (r) lengths.push(`${c.from} -> ${c.to}: ${r.length} m`);
  }

  // ---------- races never move by accident ----------
  const sig = (r) => { if (!r) return null; const s = r.track.pose(r.lead, 0), e = r.track.pose(r.lead + r.length, 0); return `${r.length} m ${s.x.toFixed(1)},${s.z.toFixed(1)} -> ${e.x.toFixed(1)},${e.z.toFixed(1)}`; };
  const lv = await server.ssrLoadModule('/src/features/levels.ts');
  const ch = await server.ssrLoadModule('/src/features/challenges/model.ts');
  const races = { [rt.CAMPUS_LOOP.id]: sig(rt.CAMPUS_LOOP) };
  for (const r of rt.RACES) races[r.id] = sig(rt.raceRoute(r));
  for (const l of lv.LEVELS) races[`level-${l.n}`] = sig(lv.levelRoute(l));
  for (const c of ch.CH_ROUTES) races[`challenge-${c.id}`] = sig(c.build());
  const SNAP = 'scripts/race-routes.json';
  if (process.env.UPDATE_RACES) writeFileSync(SNAP, `${JSON.stringify(races, null, 1)}\n`);
  const snap = JSON.parse(readFileSync(SNAP, 'utf8'));
  for (const [id, v] of Object.entries(snap)) if (races[id] !== v) fail(`race ${id} changed: ${v} -> ${races[id]}`);

  console.log(`destinations checked: ${PLACES.length}; journeys checked: ${ROUTE_CHECKS.length} x ride/walk/taxi; races checked: ${Object.keys(snap).length}`);
  for (const l of lengths) console.log(`  ${l}`);
  for (const n of notes) console.log(`note: ${n}`);
  void BUILDINGS;
} finally {
  await server.close();
}
if (failures.length) {
  console.error(`\n${failures.length} route test failure(s):\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
console.log('route tests: ok');
