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
  // Jubilee Hall and the International Students Hostels: entrances where the owner's layout marks them
  const marked = { 'Jubilee Hall': [137.4, 1293.0], 'International Students Hostel 1, ISH 1': [214.0, 1305.4], 'International Students Hostel 2, ISH 2': [126.7, 1154.8] };
  for (const [n, [mx, mz]] of Object.entries(marked)) {
    const a = ACCESS.get(n);
    if (!a) { fail(`${n}: no access`); continue; }
    if (Math.hypot(a.entrance[0] - mx, a.entrance[1] - mz) > 2) fail(`${n}: entrance ${a.entrance.map((v) => v.toFixed(1))} is not where the owner's layout marks it`);
    if (a.status !== 'verified') fail(`${n}: entrance status ${a.status}`);
  }
  // the banking square: doors where the owner's labelled aerial and photos put them
  const banks = { 'University of Ghana banking square': [159.5, 975.0], 'Consolidated Bank Ghana (near Night Market)': [133.5, 1020.0], 'UMB': [160.0, 1020.1], 'Stanbic Bank': [175.0, 971.7], 'Ecobank (near Night Market)': [241.8, 1018.4], 'Union Building (Banking Square)': [257.0, 1025.7] };
  for (const [n, [mx, mz]] of Object.entries(banks)) {
    const a = ACCESS.get(n);
    if (!a) { fail(`${n}: no access`); continue; }
    if (Math.hypot(a.entrance[0] - mx, a.entrance[1] - mz) > 2) fail(`${n}: entrance ${a.entrance.map((v) => v.toFixed(1))} is not where the owner's photos put it`);
  }
  // CBG's door faces the way in from the Diaspora halls and the Night Market (south)
  if (ACCESS.get('Consolidated Bank Ghana (near Night Market)')?.entrance[1] < placeByName('Consolidated Bank Ghana (near Night Market)').z) fail('CBG: the entrance is not on the south side');
  // Vikings Hostel and the School of Law: doors where the owner's photos put them
  for (const [n, [mx, mz]] of Object.entries({ 'Mensah Sarbah Vikings Hostel': [160.5, 840.5], 'School of Law': [441.0, -243.3] })) {
    const a = ACCESS.get(n);
    if (!a) { fail(`${n}: no access`); continue; }
    if (Math.hypot(a.entrance[0] - mx, a.entrance[1] - mz) > 2) fail(`${n}: entrance ${a.entrance.map((v) => v.toFixed(1))} is not where the owner's photos put it`);
    if (a.status !== 'verified') fail(`${n}: entrance status ${a.status}`);
  }
  if (!ACCESS.get('Mensah Sarbah Vikings Hostel')?.secondary?.length) fail('Vikings Hostel: the second door (south end of the long wing) is missing');
  const vlModels = (await server.ssrLoadModule('/src/game/vikingslaw.ts')).vikingsLaw.frames();
  if (vlModels.length !== 2) fail(`expected Vikings Hostel and School of Law models, found ${vlModels.length}`);
  // the School of Engineering Sciences lies below the road (relief.ts): the hollow is there, and nowhere else
  const { groundHeight } = await server.ssrLoadModule('/src/game/relief.ts');
  if (!(groundHeight(452.7, -380) < -4)) fail(`engineering: the forecourt is not below the road (ground ${groundHeight(452.7, -380)})`);
  if (groundHeight(429, -339) !== 0) fail('engineering: the main road on the south is not at ground level');
  if (groundHeight(0, 0) !== 0 || groundHeight(160, 997) !== 0) fail('relief: the campus outside the hollow is not flat');
  const eng = ACCESS.get('School of Engineering Sciences');
  if (!eng || Math.hypot(eng.entrance[0] - 452.7, eng.entrance[1] + 380) > 2) fail('engineering: the entrance is not the porch on the front block');
  // no building in the field between Kwapong and Sey (owner); International House entered from the law-school road
  for (const [x, z] of [[105, 1685], [118, 1708], [-26, 1581]]) if (buildingAt(x, z)) fail(`a building stands between Kwapong and Sey at ${x},${z}`);
  const ih = ACCESS.get('International House');
  if (!ih || Math.hypot(ih.entrance[0] - 544, ih.entrance[1] + 202.5) > 2) fail('International House: the entrance is not the west porch');
  // the Diaspora Dome is north-west of the Lizalex Quadrangle (beside Kwapong, across the road), entered through its open front
  const dome = placeByName('Diaspora Dome'), domeA = ACCESS.get('Diaspora Dome');
  if (!dome || Math.hypot(dome.x - 0.2, dome.z - 1582.2) > 3) fail('Diaspora Dome is not beside Kwapong, north-west of the Lizalex Quadrangle');
  if (!domeA || Math.hypot(domeA.entrance[0] - 10.2, domeA.entrance[1] - 1601.4) > 2) fail('Diaspora Dome: the way in is not its open front');
  // Pentagon (owner): Old Pent courts west to east, the admin block in the middle, entrances on the marks
  const order = ['Dar es Salaam Court', 'Kampala Court', 'Pent Admin Block', 'Addis Ababa Court', 'Nairobi Court'].map((n) => placeByName(n));
  if (order.some((p) => !p)) fail('Pentagon: an Old Pent court or the admin block is missing');
  else for (let i = 1; i < order.length; i++) if (order[i].x <= order[i - 1].x) fail(`Pentagon: ${order[i].name} is not east of ${order[i - 1].name}`);
  const pentMarks = { 'New Pent Block A': [575.6, -628], 'New Pent Block B': [568.4, -766], 'New Pent Block C': [686.8, -698], 'Addis Ababa Court': [671.6, -538.8], 'Nairobi Court': [720.4, -544.4] };
  for (const [n, [mx, mz]] of Object.entries(pentMarks)) { const a = ACCESS.get(n); if (!a || Math.hypot(a.entrance[0] - mx, a.entrance[1] - mz) > 5) fail(`${n}: the entrance is not where the owner marks it`); }
  for (const n of ['Pent Admin Block', 'Dar es Salaam Court', 'Kampala Court', 'Addis Ababa Court', 'Nairobi Court']) { const a = ACCESS.get(n), p = placeByName(n); if (a && p && a.entrance[1] > p.z) fail(`${n}: the entrance is not on the north face`); }
  // Commonwealth Hall on Legon Hill (owner): the gate in the front block at the top of the stairway,
  // the gate houses at its foot; the hill rises from the avenue's end through the hall to the Great Hall
  const cw = ACCESS.get('Commonwealth Hall');
  if (!cw || Math.hypot(cw.entrance[0] + 491.1, cw.entrance[1] - 127.4) > 2) fail('Commonwealth Hall: the entrance is not the gate in the front block');
  if (!cw?.secondary?.some(([x, z]) => Math.hypot(x + 366, z - 128) < 3)) fail('Commonwealth Hall: the way in between the gate houses at the foot of the stairs is missing');
  if (!ROADS.some((r) => r.surface === 'steps' && r.name === 'Commonwealth Hall stairs')) fail('Commonwealth Hall: the stairway is not on the network');
  const [foot, forecourt, hallEnd, summit] = [groundHeight(-365, 128), groundHeight(-478, 128), groundHeight(-715, 128), groundHeight(-1010, 128)];
  if (!(foot === 0 && forecourt > 8 && hallEnd > forecourt + 4 && summit > hallEnd)) fail(`Legon Hill: the ground does not rise from the avenue (${foot}) up the stairs (${forecourt}) through the hall (${hallEnd}) to the Great Hall (${summit})`);
  if (groundHeight(-340, 128) !== 0 || groundHeight(-600, 600) !== 0) fail('Legon Hill: the avenue below the stairs or the campus beside the hill is not flat');
  if ((await server.ssrLoadModule('/src/game/commonwealth.ts')).commonwealth.frames().length !== 2) fail('expected the Commonwealth Hall and stairway models');
  const bankModels = (await server.ssrLoadModule('/src/game/banking.ts')).banking.frames();
  if (bankModels.length !== 3) fail(`expected the bank compound, the Union Building and the ADB/HFC block, found ${bankModels.length}`);
  const hostels = (await server.ssrLoadModule('/src/game/hostels.ts')).hostels.frames();
  if (hostels.length !== 3) fail(`expected Jubilee Hall, ISH 1 and ISH 2 models, found ${hostels.length}`);
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
