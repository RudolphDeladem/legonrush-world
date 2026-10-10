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
  // the Balme Library above University Square and the pool (owner's photo): road before the library and side lanes up,
  // the middle terrace 1.2 m down, the pool deck 2.4 m down, the stairs climbing between them
  if (groundHeight(8, 38) !== 0 || [49, 60, 75, 92].some((z) => groundHeight(-10, z) !== 0 || groundHeight(27, z) !== 0)) fail('Balme: the road before the library or the side lanes are not at ground level');
  if (Math.abs(groundHeight(-4, 55) + 1.2) > 0.01 || Math.abs(groundHeight(-4, 78) + 2.4) > 0.01) fail('Balme: the middle terrace or the pool deck is not below the library');
  { let prev = -3, ok = true; for (let z = 61.5; z >= 43; z -= 0.2) { const h = groundHeight(8, z); if (h < prev - 1e-6) ok = false; prev = h; } if (!ok || prev !== 0) fail('Balme: the stairs do not climb steadily from the pool deck to the road'); }
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
  // Volta Hall (owner): the entrance on the front block's east face up its steps; the hall on its terrace,
  // the Annex at road level on its roof in the owner's aerial
  const vh = ACCESS.get('Volta Hall');
  if (!vh || Math.hypot(vh.entrance[0] + 258.9, vh.entrance[1] - 66) > 2) fail('Volta Hall: the entrance is not the blue mark on the front block');
  if (!(Math.abs(groundHeight(-290, 40) - 2.4) < 0.01 && groundHeight(-235, 66) === 0 && groundHeight(-219, 66) === 0)) fail('Volta Hall: the hall is not on its terrace above the forecourt and Volta Hall Road');
  if (buildingAt(-310, -80)?.name !== 'Volta Hall Annex') fail('Volta Hall Annex: the outline is not on its roof in the owner\'s aerial');
  if ((await server.ssrLoadModule('/src/game/volta.ts')).volta.frames().length !== 2) fail('expected the Volta Hall and Annex models');
  // Mensah Sarbah (owner): the gate in the middle of the lodge's front on the drive, the court-side doors either end
  const ms = ACCESS.get('Mensah Sarbah Hall');
  if (!ms || Math.hypot(ms.entrance[0] - 4.9, ms.entrance[1] - 609.1) > 2) fail('Mensah Sarbah Hall: the entrance is not the gate in the middle of the lodge');
  if ((await server.ssrLoadModule('/src/game/greathalls.ts')).greatHalls.frames().length !== 3) fail('expected the Mensah Sarbah, Akuafo and Legon models');
  // Explore: every destination ends the guided ride with its own stop (the arrived card: drone view, riding it yourself)
  const { guideFor } = await server.ssrLoadModule('/src/data/guide.ts');
  const balme = placeByName('The Balme Library');
  for (const to of PLACES.filter((p) => !guideFor(p.name) && p !== balme).slice(0, 25)) {
    const r = rt.exploreRoute(balme, to, 'cycle'), g = r && rt.guideStops(r);
    if (r && g[g.length - 1]?.place !== to) fail(`Explore: the ride to ${to.name} has no arrival stop`);
  }
  // the Athletic Oval (owner): open ground round the track and courts, and Maison Française north of it is one floor
  for (const [x, z] of [[0, 351], [-82, 378], [-75, 427], [66, 280]]) if (buildingAt(x, z)) fail(`Athletic Oval: a building stands on its fields at ${x},${z}`);
  const maison = BUILDINGS.find((b) => b.name === 'Maison Francais');
  if (!maison || maison.height > 5) fail('Maison Française (north of the Athletic Oval) is not one floor');
  if ((await server.ssrLoadModule('/src/game/athletics.ts')).athletics.frames().length !== 1) fail('expected the Athletic Oval model');
  // the Legon and Akuafo annexes (owner): Legon A and B entered on the north, Akuafo A and B face each other, C and D face each other
  const ann = (n) => ACCESS.get(n)?.entrance;
  for (const [n, x, z] of [['Legon Hall Annex A', -120.5, 424.8], ['Legon Hall Annex B', -120.5, 538.1], ['Legon Hall Annex C (Graduate Hostel)', -173, 497], ['Akuafo Hall Annex A', 156.6, 437.6], ['Akuafo Hall Annex B', 158.2, 524.5], ['Akuafo Hall Annex C', 196.6, 483.5], ['Akuafo Hall Annex D', 142, 488]]) {
    const e = ann(n);
    if (!e || Math.hypot(e[0] - x, e[1] - z) > 2) fail(`${n}: the entrance is not where the owner marks it`);
  }
  if (buildingAt(-124, 492)) fail('Legon Hall annexes: a building stands on the lawns east of Annex C (the owner: there is none)');
  if ((await server.ssrLoadModule('/src/game/annexes.ts')).annexes.frames().length !== 11) fail('expected the eleven annex models (Legon, Akuafo, Mensah Sarbah)');
  for (const [n, x, z] of [['Mensah Sarbah Annex A', 180.5, 662.9], ['Mensah Sarbah Annex B', 181.2, 749.3], ['Mensah Sarbah Annex C', 191.9, 709.8], ['Mensah Sarbah Annex D', 166.9, 708.3], ['Central Cafeteria, CC', -14, 515.7]]) {
    const e = ann(n);
    if (!e || Math.hypot(e[0] - x, e[1] - z) > 2) fail(`${n}: the entrance is not where the owner marks it`);
  }
  // the CC (two floors), the SRC Union Building (one) and the Standard Chartered ATM building between them (owner)
  const cc = BUILDINGS.find((b) => b.name === 'Central Cafeteria, CC'), src = BUILDINGS.find((b) => b.name === 'SRC Union Building');
  if (!cc || cc.height > 11 || !src || src.height > 5) fail('the CC is not two floors or the SRC Union Building not one');
  if (!placeByName('Standard Chartered ATM (near SRC Union Building)')) fail('the Standard Chartered ATM building between the CC and the Union Building is missing');
  // round the Balme Library (owner's marked aerial): CEDI entered on the west under the red canopy, Standard Chartered
  // (west) and Absa (east, by the road) doors on the north face of their one-floor building, the ATMs on its south face
  // (the Post Office's door and the long block's are where the owner's later photos show them: the porch in the west
  // gable, the portico on the car park)
  for (const [n, x, z] of [['Cedi Conference Centre', -152.5, 10.6], ['University of Ghana Computing Systems (UGCS)', -111.8, -32.8], ['Department of Economics, University of Ghana', -44, 77], ['University of Ghana Bookshop', 58.7, 74.7], ['Faculty of Arts, Languages', -165.9, 94.9], ['Office of The Dean of Students', -55.6, 58.9], ['Legon Post Office', -69.8, 102], ['Standard Chartered', 70.2, 94.7], ['Absa (near Balme Library Fountain)', 78, 94.7], ['Standard Chartered ATM (near Balme Library Fountain)', 70.2, 106.3]]) {
    const e = ann(n);
    if (!e || Math.hypot(e[0] - x, e[1] - z) > 2) fail(`${n}: the entrance is not where the owner marks it`);
  }
  for (const [n, floors] of [['Department of Economics, University of Ghana', 2], ['Faculty of Arts, Languages', 2], ['University of Ghana Bookshop', 2], ['Office of The Dean of Students', 1], ['Legon Post Office', 1]]) {
    const b = BUILDINGS.find((x) => x.name === n);
    if (!b || (floors === 1 ? b.height > 5 : b.height < 5.5 || b.height > 10)) fail(`${n}: not ${floors === 1 ? 'a ground floor only' : 'two floors'} (owner's aerial)`);
  }
  const balmeModels = (await server.ssrLoadModule('/src/game/balme.ts')).balmeSite.frames().map((f) => f.name);
  for (const n of ['Cedi Conference Centre', 'University of Ghana Computing Systems (UGCS)', 'Standard Chartered and Absa', 'The Balme Library', 'Balme Library wings', 'Balme Library pool', 'Kuffour Quadrangle fountain']) if (!balmeModels.includes(n)) fail(`missing the ${n} model`);
  { const u = BUILDINGS.find((b) => b.name === 'University of Ghana Computing Systems (UGCS)'); if (!u || u.height < 13 || u.height > 18) fail(`UGCS: height ${u?.height}, the owner's photo shows four floors`); }
  // the Balme Library (owner's photos): entered by the arched door in the middle of the south front
  { const e = ann('The Balme Library'); if (!e || Math.hypot(e[0] - 5.2, e[1] - 6.9) > 2) fail('The Balme Library: the entrance is not the arched door on the south front'); }
  // the Night Market (owner): west of the banking square, entered from the road on its east side; the supermarket on
  // that side; the old site south of the banking square is grass, trees and soil with no building
  for (const [n, x, z] of [['Night Market', 117.0, 1016.5], ['Supermart (Night Market)', 114.2, 994.7], ['Valco Trust Hostel Phase 1', 27.3, 770.7], ['Valco Trust Hostel Phase 2', 24.2, 847.0]]) {
    const e = ann(n);
    if (!e || Math.hypot(e[0] - x, e[1] - z) > 2) fail(`${n}: the entrance is not where the owner marks it`);
  }
  for (const [x, z] of [[145, 1050], [160, 1072], [176, 1078], [140, 1045]]) if (buildingAt(x, z)) fail(`the old Night Market site (${x},${z}) still has a building (the owner: grass, trees and soil)`);
  const nmModels = (await server.ssrLoadModule('/src/game/nightmarket.ts')).nightMarket.frames().map((f) => f.name);
  if (!nmModels.includes('Night Market') || !nmModels.includes('Supermart (Night Market)') || nmModels.length < 9) fail(`expected the market, the supermarket and the one-floor buildings round them (the Basic School's blocks are basicschool.ts's), found ${nmModels.length} models`);
  if ((await server.ssrLoadModule('/src/game/valco.ts')).valco.frames().length !== 2) fail('expected the two Valco Trust Hostel models');
  // the route's pavements stop where other roads join (a kerb across a road's mouth blocks it)
  {
    const { walkGaps } = await server.ssrLoadModule('/src/game/junctions.ts');
    const r = rt.exploreRoute(placeByName('Volta Hall'), placeByName('Great Hall'), 'cycle');
    const g = walkGaps(r.track, 3.8, [9, 7.4, 6.2, 4.6, 2.6]);
    if (g[0].length + g[1].length < 6) fail(`the route's pavements cross the roads that join it (only ${g[0].length + g[1].length} gaps from Volta Hall to the Great Hall)`);
  }
  // west of Legon Hall (owner): the Language Centre cluster at their heights, and the ground-floor bungalows behind it
  for (const [n, x, z] of [['Modern language department', -284.1, 258.6], ['Confusious Institute', -271.6, 305.1], ['Legon hall barbeque joint', -277, 351.2], ['Language Center', -258.3, 213.8], ['Career and councelling dept', -365.3, 264.9]]) {
    const e = ann(n);
    if (!e || Math.hypot(e[0] - x, e[1] - z) > 2) fail(`${n}: the entrance is not where the owner's photos put it`);
  }
  for (const [n, lo, hi] of [['Modern language department', 14, 20], ['Confusious Institute', 10, 14], ['Legon hall barbeque joint', 7, 10], ['Language Center', 7, 10], ['Career and councelling dept', 3, 5]]) {
    const b = BUILDINGS.find((q) => q.name === n);
    if (!b || b.height < lo || b.height > hi) fail(`${n}: height ${b?.height} is not the owner's (${lo}-${hi} m)`);
  }
  if ((await server.ssrLoadModule('/src/game/westlegon.ts')).westLegon.frames().length !== 24) fail('expected the four buildings by the Language Centre and the twenty bungalows and outbuildings behind them');
  // phone booths, not buildings, north of the banking square's car park; nothing close west of the Diaspora Dome;
  // the School of Public Health (owner): two-floor and three-floor wings, entered from the east car park
  if (buildingAt(142.7, 933) || buildingAt(-77.5, 1594.7) || buildingAt(165, 920)) fail('a building still stands where the owner says there is a phone booth or open ground (banking square, Diaspora Dome)');
  for (const [x, z] of [[435, 1600], [452, 1606], [430, 1618], [453, 1590]]) if (buildingAt(x, z)) fail(`School of Public Health: the structures circled purple (${x},${z}) are still there`);
  { const e = ann('School of Public Health'); if (!e || Math.hypot(e[0] - 506.8, e[1] - 1633.8) > 3) fail('School of Public Health: the entrance is not on the east front'); }
  if ((await server.ssrLoadModule('/src/game/publichealth.ts')).publicHealth.frames().length !== 3) fail('expected the three School of Public Health buildings');
  // the Business School (owner): entered at the foot of the open bay in the middle of the west front; three blocks
  { const e = ann('University of Ghana Business School'); if (!e || Math.hypot(e[0] - -193.4, e[1] - -117.8) > 2) fail('University of Ghana Business School: the entrance is not in the open bay of the west front'); }
  if ((await server.ssrLoadModule('/src/game/ugbs.ts')).ugbs.frames().length !== 3) fail('expected the Business School\'s three blocks');
  // the stadium (owner): entered at the main stand with the raised roof, on the west; the stadium models
  { const e = ann('University of Ghana Sports Stadium'); if (!e || Math.hypot(e[0] - 685.5, e[1] - 1414) > 3) fail('University of Ghana Sports Stadium: the entrance is not at the main stand on the west'); }
  if ((await server.ssrLoadModule('/src/game/stadium.ts')).stadiumSite.frames().length !== 4) fail('expected the stadium, the training track, the pool and tennis courts and the gymnasium');
  // car parks the owner pointed out: the School of Public Health's, east and west, and the Balme Library's either side of its forecourt
  { const parking = cm.AREAS.filter((a) => a.kind === 'parking'), inA = (a, x, z) => { let c = false; for (let i = 0, j = a.pts.length - 2; i < a.pts.length; j = i, i += 2) { const zi = a.pts[i + 1], zj = a.pts[j + 1]; if ((zi > z) !== (zj > z) && x < ((a.pts[j] - a.pts[i]) * (z - zi)) / (zj - zi) + a.pts[i]) c = !c; } return c; };
    for (const [n, x, z] of [['the School of Public Health east', 520, 1640], ['the School of Public Health west', 430, 1655], ['the Balme Library west', -40, 15], ['the Balme Library east', 60, 15]]) if (!parking.some((a) => inA(a, x, z))) fail(`no car park at ${n}`);
    if (!cm.AREAS.some((a) => a.kind === 'plaza' && inA(a, 7.5, 24))) fail('the Balme Library forecourt is not paved'); }
  // owner: no building north of Akuafo Annex A's slab; the paving round the Balme Library's sunken square is flat to
  // the walls (no slope outside them)
  if (buildingAt(132, 416)) fail('a building still stands beside Akuafo Hall Annex A (the owner: there is none)');
  { const { groundHeight: gh } = await server.ssrLoadModule('/src/game/relief.ts'); for (const [x, z] of [[-7.25, 70], [25.25, 70], [8, 94.2], [-9, 55]]) if (gh(x, z) !== 0) fail(`Balme: the paving at ${x},${z} slopes down (${gh(x, z).toFixed(2)})`); }
  // owner: one-floor buildings by Volta Hall Road, opposite the Business School and the lecturers' houses in their wood
  { const one = (x, z) => { const b = buildingAt(x, z); return b && b.height <= 5; };
    for (const [n, x, z] of [['the Volta Hall Road stretch', -198.6, -38.8], ['the Larway Oraca Building', -263, -178], ['the building opposite the Business School', -266, -135], ['a lecturer\'s house (East Legon 20)', 262, 560], ['a lecturer\'s house (East Legon 11)', 385.9, 426]]) if (!one(x, z)) fail(`${n} is not one floor (owner)`);
    const e = ann('Larway Oraca Building'); if (!e || Math.hypot(e[0] - -263.2, e[1] - -173.7) > 2) fail('Larway Oraca Building: the entrance is not on the south (owner)'); }
  // owner: the Mathematics and Statistics departments are one connected building of three floors, entered on the
  // north front (marked blue), with car parks in front of the Mathematics galleries and the east block
  { const chain = [[290, -225], [307, -238], [316, -240], [325, -240], [333, -240], [345, -240], [340, -228], [346, -228], [352, -230], [370, -221]];
    for (const [x, z] of chain) { const b = buildingAt(x, z); if (!b) fail(`Mathematics and Statistics: no building at ${x},${z} (the blocks must be connected)`); else if (b.height < 10) fail(`Mathematics and Statistics: the block at ${x},${z} is not three floors`); }
    const e = ann('Statistics'); if (!e || Math.hypot(e[0] - 325.2, e[1] - -247.4) > 2) fail('Statistics: the main entrance is not on the north front (owner)');
    const parking = cm.AREAS.filter((a) => a.kind === 'parking'), inA = (a, x, z) => { let c = false; for (let i = 0, j = a.pts.length - 2; i < a.pts.length; j = i, i += 2) { const zi = a.pts[i + 1], zj = a.pts[j + 1]; if ((zi > z) !== (zj > z) && x < ((a.pts[j] - a.pts[i]) * (z - zi)) / (zj - zi) + a.pts[i]) c = !c; } return c; };
    for (const [n, x, z] of [['the Mathematics galleries', 292, -236], ['the east block', 370, -237.5]]) if (!parking.some((a) => inA(a, x, z))) fail(`no car park in front of ${n}`);
    if ((await server.ssrLoadModule('/src/game/mathstat.ts')).mathStat.frames().length !== 1) fail('expected the Mathematics and Statistics model'); }
  // owner: ISSER, the RIPS building and Computer Science are one connected range of three floors; ISSER is
  // entered from the drive facing the Mathematics department, Computer Science on its wing's west face; the
  // Department of Plant Biology and the two small buildings behind the engineering school are one floor
  { for (const [x, z] of [[290, -290], [306, -297], [330, -296], [347, -296], [355, -310], [355, -290], [356, -279], [375, -287]]) { const b = buildingAt(x, z); if (!b) fail(`ISSER and Computer Science: no building at ${x},${z} (the blocks must be connected)`); else if (b.height < 10) fail(`ISSER and Computer Science: the block at ${x},${z} is not three floors`); }
    const e = ann('ISSER Building'); if (!e || Math.hypot(e[0] - 312.5, e[1] - -283.3) > 2) fail('ISSER Building: the entrance is not on the front facing the Mathematics department (owner)');
    const c = ann('Computer Science Dept'); if (!c || Math.hypot(c[0] - 349.6, c[1] - -309.5) > 2) fail('Computer Science Dept: the entrance is not on the wing\'s west face (owner)');
    for (const [n, x, z] of [['the Department of Plant Biology', 406, -314], ['a small building behind the engineering school', 524, -472], ['the other small building behind the engineering school', 535, -473]]) { const b = buildingAt(x, z); if (!b || b.height > 5) fail(`${n} is not one floor (owner)`); }
    if ((await server.ssrLoadModule('/src/game/issercs.ts')).isserCs.frames().length !== 1) fail('expected the ISSER and Computer Science model'); }
  // owner: south of CEDI the Faculty of Arts is two low floors (about half CEDI's height) and the building between
  // them four floors (about CEDI's height); Volta Hall's block by the Annex is straight and joins them; the
  // Innovation Enclave's six buildings are one floor, up on a terrace above the road with steps up to it
  { const fa = buildingAt(-140, 92), h4 = buildingAt(-121, 62), cedi = buildingAt(-130, 25);
    if (!fa || !cedi || fa.height > cedi.height * 0.55) fail('the Faculty of Arts south of CEDI is not about half its height (owner)');
    if (!h4 || !cedi || h4.height < cedi.height * 0.85 || h4.height > cedi.height * 1.1) fail('the four-floor building south of CEDI is not about CEDI\'s height (owner)');
    const link = buildingAt(-263.5, -33); if (!link || link.maxX - link.minX > 9.5) fail('Volta Hall: the block by the Annex is missing or skewed');
    const { groundHeight: gh } = await server.ssrLoadModule('/src/game/relief.ts');
    for (const x of [406, 425, 437, 457, 469, 488]) { const b = buildingAt(x, -312); if (!b || b.height > 5) fail(`Innovation Enclave: the building at x ${x} is not one floor (owner)`); if (Math.abs(gh(x, -312) - 2) > 0.01) fail(`Innovation Enclave: the building at x ${x} is not up on its terrace`); }
    if (Math.abs(gh(448.5, -331.5) - 1) > 0.5) fail('Innovation Enclave: no steps up from the road');
    if (gh(448.5, -338) !== 0) fail('Innovation Enclave: the road before the terrace is not at road level');
    if ((await server.ssrLoadModule('/src/game/enclave.ts')).enclave.frames().length !== 1) fail('expected the Innovation Enclave model'); }
  // owner: the paved ground before RIPS lies seven steps below the car park to its south, small stairs between
  // them, and neither has grass (both paved)
  { const { groundHeight: gh } = await server.ssrLoadModule('/src/game/relief.ts');
    if (Math.abs(gh(333, -280) + 1.26) > 0.05) fail('the ground before RIPS is not seven steps below the car park (owner)');
    if (gh(345, -270) !== 0) fail('the car park north of the Mathematics and Statistics departments is not at road level');
    const st = gh(338, -276.4); if (!(st > -1.26 && st < 0)) fail('no small stairs up from the ground before RIPS to the car park (owner)');
    // owner: the engineering school's hollow must not tip the main road or Annie Jiagge Road into its slope
    for (const [x, z] of [[430, -339], [470, -341], [500, -342.4], [505, -400], [506, -440]]) if (gh(x, z) !== 0) fail(`the road at ${x},${z} dips into the engineering school's hollow`);
    const inA = (a, x, z) => { let c = false; for (let i = 0, j = a.pts.length - 2; i < a.pts.length; j = i, i += 2) { const zi = a.pts[i + 1], zj = a.pts[j + 1]; if ((zi > z) !== (zj > z) && x < ((a.pts[j] - a.pts[i]) * (z - zi)) / (zj - zi) + a.pts[i]) c = !c; } return c; };
    for (const [n, x, z] of [['before RIPS', 333, -284], ['in the car park by Computer Science', 345, -270], ['between the car park and the Mathematics entrance', 325, -262]]) if (!cm.AREAS.some((a) => (a.kind === 'plaza' || a.kind === 'parking') && inA(a, x, z))) fail(`the ground ${n} is not paved (owner)`); }
  // owner: no structures east of Alexander Kwapong Hall toward Limann; the narrow rectangles round the gymnasium
  // are not structures; round the pool everything is one floor but the gym (two short floors); the houses south
  // of the stadium are one floor; trees round the pool and the tennis courts
  { for (const [x, z] of [[378, 1427], [407, 1424], [440, 1463], [375, 1505], [420, 1497], [446, 1489], [429, 1502]]) if (buildingAt(x, z)) fail(`a structure still stands east of Kwapong Hall at ${x},${z} (owner: none there)`);
    const inA = (a, x, z) => { let c = false; for (let i = 0, j = a.pts.length - 2; i < a.pts.length; j = i, i += 2) { const zi = a.pts[i + 1], zj = a.pts[j + 1]; if ((zi > z) !== (zj > z) && x < ((a.pts[j] - a.pts[i]) * (z - zi)) / (zj - zi) + a.pts[i]) c = !c; } return c; };
    for (const [x, z] of [[585, 1365], [638, 1368], [630, 1413], [643, 1422], [650, 1427], [605, 1426], [674, 1356], [684, 1351], [690, 1298], [710, 1299]]) if (cm.AREAS.some((a) => a.kind === 'parking' && inA(a, x, z)) || buildingAt(x, z)) fail(`the rectangle the owner marked at ${x},${z} is still there`);
    const maxi = buildingAt(520, 1381), gym = buildingAt(617, 1332);
    if (!maxi || maxi.height > 5) fail('Maxi Catering Services is not one floor (owner)');
    if (!gym || gym.height > 9 || gym.height < 7) fail('the UG Gymnasium is not two short floors (owner)');
    for (const [x, z] of [[933, 1682], [878, 1717], [788, 1797], [740, 1675], [846, 1619]]) { const b = buildingAt(x, z); if (!b || b.height > 5) fail(`the house south of the stadium at ${x},${z} is not one floor (owner)`); }
    for (const [x, z] of [[540, 1295], [575, 1310], [535, 1365], [500, 1430], [595, 1420], [620, 1400]]) if (!cm.AREAS.some((a) => a.kind === 'wood' && inA(a, x, z))) fail(`no trees at ${x},${z} round the pool and the tennis courts (owner)`); }
  // owner: the Institute of African Studies chalets and the bungalows round F.K. Apaloo Crescent are one floor in their
  // trees; the Basic School's entrance faces Valco across La Road, its blocks one floor, no building on its yard
  { const inA = (a, x, z) => { let c = false; for (let i = 0, j = a.pts.length - 2; i < a.pts.length; j = i, i += 2) { const zi = a.pts[i + 1], zj = a.pts[j + 1]; if ((zi > z) !== (zj > z) && x < ((a.pts[j] - a.pts[i]) * (z - zi)) / (zj - zi) + a.pts[i]) c = !c; } return c; };
    for (const [x, z] of [[-354, 1356.5], [-268, 1355], [-288, 1473], [-430, 1573], [-641, 1632]]) { const b = buildingAt(x, z); if (!b || b.height > 5) fail(`the bungalow by F.K. Apaloo Crescent at ${x},${z} is not one floor (owner)`); }
    for (const [x, z] of [[-350, 1430], [-560, 1600], [880, 1650], [760, 1760]]) if (!cm.AREAS.some((a) => (a.kind === 'grove' || a.kind === 'wood') && inA(a, x, z))) fail(`no trees at ${x},${z} (owner)`);
    const e = ann('University of Ghana Basic School'); if (!e || Math.hypot(e[0] - -113, e[1] - 899) > 3) fail('University of Ghana Basic School: the entrance is not the gate facing Valco (owner)');
    if (buildingAt(-68, 998)) fail('a building still stands on the Basic School yard (owner)');
    if ((await server.ssrLoadModule('/src/game/basicschool.ts')).basicSchool.frames().length < 16) fail('expected the Basic School blocks and its entrance'); }
  // owner: no structures north of Valco Phase 1 or between the phases; the building south-west of Phase 2 is one floor
  { for (const [x, z] of [[49.9, 743.1], [57.9, 755.7], [31.8, 755.8], [44.3, 799]]) if (buildingAt(x, z)) fail(`a structure still stands at Valco ${x},${z} (owner: none)`);
    const b = buildingAt(-59, 865); if (!b || b.height > 5) fail('the building south-west of Valco Phase 2 is not one floor (owner)'); }
  // owner: the GCB Lecture Building stands up the slope from the New N Block, a stair up to its north entrance; both
  // entered where the owner marks
  { const { groundHeight: gh } = await server.ssrLoadModule('/src/game/relief.ts');
    if (gh(-139, -350) < 2) fail('the GCB Lecture Building is not up the slope from the New N Block (owner)');
    if (gh(-95, -432) !== 0) fail('the road before the New N Block is not at road level');
    const st = gh(-136.2, -403); if (!(st > 0 && st < 2.4)) fail('no stair up to the GCB Lecture Building\'s north entrance (owner)');
    const n = ann('New N Block, NNB'); if (!n || Math.abs(n[1] - -444.6) > 2) fail('New N Block: the entrance is not on its front to the road (owner)');
    const g = ann('GCB Lecture Building'); if (!g || Math.hypot(g[0] - -136.2, g[1] - -390.1) > 3) fail('GCB Lecture Building: the entrance is not the north one up the stair (owner)');
    if ((await server.ssrLoadModule('/src/game/nblock.ts')).nBlockGcb.frames().length !== 2) fail('expected the New N Block and GCB models'); }
  // owner: the chalet blocks along the road south of the roundabout (two floors, cottages one) and Legon's gable block
  { for (const [x, z, f] of [[33.7, 166.6, 2], [27.8, 176.6, 1], [-26.6, 163.6, 2], [-13.8, 202.5, 1], [-122.3, 168.9, 2]]) { const b = buildingAt(x, z); if (!b || (f === 1 ? b.height > 6 : b.height < 8)) fail(`the chalet block at ${x},${z} is not ${f} floor(s) (owner)`); }
    if ((await server.ssrLoadModule('/src/game/chalets.ts')).chaletSite.frames().length !== 14) fail('expected the chalet blocks, the bridge between Akuafo\'s west blocks, Legon\'s gable block and the verges'); }
  // owner: WACCBIP entered up the stair at its front (F, to Volta Hall Road), three floors; the blue shades before it are
  // car parks, not buildings; the old shed one floor; the structures circled yellow gone, trees there
  { const inA = (a, x, z) => { let c = false; for (let i = 0, j = a.pts.length - 2; i < a.pts.length; j = i, i += 2) { const zi = a.pts[i + 1], zj = a.pts[j + 1]; if ((zi > z) !== (zj > z) && x < ((a.pts[j] - a.pts[i]) * (z - zi)) / (zj - zi) + a.pts[i]) c = !c; } return c; };
    const w = ann('West African Centre for Cell Biology of Infectious Pathogens, WACCBIP'); if (!w || Math.hypot(w[0] - -259.8, w[1] - -333.5) > 3) fail('WACCBIP: the entrance is not the front one up the stair (owner)');
    const b = buildingAt(-272.4, -335.1); if (!b || b.height < 11) fail('WACCBIP is not three floors (owner)');
    for (const [x, z] of [[-255, -343], [-255.7, -325], [-238.5, -350], [-238.7, -322]]) { if (buildingAt(x, z)) fail(`the car-park shade at ${x},${z} is drawn as a building (owner)`); if (!cm.AREAS.some((a) => a.kind === 'parking' && inA(a, x, z))) fail(`no car park under the shade at ${x},${z} (owner)`); }
    const sh = buildingAt(-238.6, -377.7); if (!sh || sh.height > 5.5) fail('the old shed north of WACCBIP is not one floor (owner)');
    for (const [x, z] of [[-276.7, -456.8], [-272.5, -494]]) { if (buildingAt(x, z)) fail(`the structure circled yellow at ${x},${z} still stands (owner)`); if (!cm.AREAS.some((a) => a.kind === 'wood' && inA(a, x, z))) fail(`no trees at ${x},${z} (owner)`); }
    if ((await server.ssrLoadModule('/src/game/waccbip.ts')).waccbipSite.frames().length !== 3) fail('expected WACCBIP, the old shed and the unfinished frame'); }
  // owner: south-west of the Balme Library, the Post Office entered by the porch in its west gable, the long block by
  // the portico on the car park; the Dean of Students and the Post Office one floor, the long block and the French
  // Department two
  { const p = ann('Legon Post Office'); if (!p || Math.hypot(p[0] - -69.8, p[1] - 102) > 3) fail('Legon Post Office: the entrance is not the porch in the west gable (owner)');
    const e = ann('Department of Economics, University of Ghana'); if (!e || Math.hypot(e[0] - -44, e[1] - 77) > 3) fail('the long block by the car park: the entrance is not the portico (owner)');
    for (const [x, z, f] of [[-58.5, 53, 1], [-59, 101, 1], [-34.5, 77, 2], [-114, 95, 2]]) { const b = buildingAt(x, z); if (!b || (f === 1 ? b.height > 5 : b.height < 6.5)) fail(`the building at ${x},${z} is not ${f} floor(s) (owner)`); }
    if ((await server.ssrLoadModule('/src/game/balmewest.ts')).balmeWest.frames().length !== 5) fail('expected the French Department, the Economic Policy office, its terrace walls, the buildings in the owner\'s white circle and the Bookshop'); }
  // owner: WACCBIP's back is the whole west range along the road behind it (the yellow mark), the road clear of it;
  // the School of Pharmacy entered from its car park, one-floor wings round a three-storey block
  { const b = buildingAt(-298, -332); if (!b || b.height < 11) fail('WACCBIP: the back range along the road behind it is missing (owner)');
    for (const z of [-350, -330, -315]) { if (buildingAt(-306.5, z)) fail(`the road behind WACCBIP at z ${z} runs into the building`); if (!ROADS.some((r) => r.nodes.some((n, i) => { if (!i) return false; const [ax, az] = nodeXZ(r.nodes[i - 1]), [bx, bz] = nodeXZ(n), dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((-308.4 - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(ax + dx * t + 308.4, az + dz * t - z) < 1.2; }))) fail(`the road behind WACCBIP is not at x -308 at z ${z} (owner's aerial)`); }
    const e = ann('School of Pharmacy'); if (!e || Math.hypot(e[0] - -252.9, e[1] - -245.2) > 3) fail('School of Pharmacy: the entrance is not the door off its car park (owner)');
    for (const [x, z, f] of [[-262, -245, 1], [-295, -245, 3], [-255, -241, 1], [-262, -261, 1]]) { const p = buildingAt(x, z); if (!p || (f === 1 ? p.height > 5 : p.height < 9)) fail(`the School of Pharmacy at ${x},${z} is not ${f} floor(s) (owner)`); }
    if ((await server.ssrLoadModule('/src/game/pharmacy.ts')).pharmacySite.frames().length !== 1) fail('expected the School of Pharmacy model'); }
  // owner: Food Science entered at the foot of its stair core facing the Larway Oraca Building, four floors; Nursing three;
  // the Animal Biology and Biodiversity ranges one floor, among the trees the owner circled
  { const inA = (a, x, z) => { let c = false; for (let i = 0, j = a.pts.length - 2; i < a.pts.length; j = i, i += 2) { const zi = a.pts[i + 1], zj = a.pts[j + 1]; if ((zi > z) !== (zj > z) && x < ((a.pts[j] - a.pts[i]) * (z - zi)) / (zj - zi) + a.pts[i]) c = !c; } return c; };
    const e = ann('Department of Nutrition and Food Sciences'); if (!e || Math.hypot(e[0] - -198.4, e[1] - -206) > 3) fail('Food Science: the entrance is not at the foot of the stair core on its front (owner)');
    for (const [x, z, lo, hi] of [[-185, -204, 12, 16], [-331, -190, 10, 13], [-90, -196, 0, 5.5], [-70, -270, 0, 5.5], [-148, -235, 0, 5.5]]) { const b = buildingAt(x, z); if (!b || b.height < lo || b.height > hi) fail(`the building at ${x},${z} is not the height the owner shows`); }
    for (const [x, z] of [[-80, -255], [-120, -220], [-28, -215], [-100, -180]]) if (!cm.AREAS.some((a) => a.kind === 'wood' && inA(a, x, z))) fail(`no trees at ${x},${z} round the Animal Biology ranges (owner)`);
    if ((await server.ssrLoadModule('/src/game/labs.ts')).labsSite.frames().length !== 5) fail('expected Food Science, Nursing, Animal Biology, the unfinished block building and the three-floor block north of Nursing');
    { const u = buildingAt(-189.6, -224.2); if (!u || u.height > 4) fail('the unfinished building north of Food Science is not one floor (owner)'); } }
  // owner: the ISSER Annex below the road toward the engineering school, entered at the porch the walk from there
  // reaches; three floors in its west wing, the huts and the east wing one floor; trees where the owner circled them
  { const inA = (a, x, z) => { let c = false; for (let i = 0, j = a.pts.length - 2; i < a.pts.length; j = i, i += 2) { const zi = a.pts[i + 1], zj = a.pts[j + 1]; if ((zi > z) !== (zj > z) && x < ((a.pts[j] - a.pts[i]) * (z - zi)) / (zj - zi) + a.pts[i]) c = !c; } return c; };
    const { groundHeight: gh } = await server.ssrLoadModule('/src/game/relief.ts');
    if (!(gh(285, -395) < -1)) fail('the ISSER Annex is not below the road toward the engineering school (owner)');
    if (gh(344, -390) !== 0 || gh(320, -333.5) !== 0) fail('the roads round the ISSER Annex are not at road level');
    const e = ann('Institute of Statistical and Social and Economic Research (ISSER) Annex'); if (!e || Math.hypot(e[0] - 301.5, e[1] - -365.5) > 3) fail('ISSER Annex: the entrance is not the porch the walk from the engineering school reaches (owner)');
    for (const [x, z, lo, hi] of [[250, -390, 11, 13], [301.4, -428.5, 0, 3.5], [320, -392.9, 0, 5], [149.5, -362.7, 0, 6]]) { const b = buildingAt(x, z); if (!b || b.height < lo || b.height > hi) fail(`the building at ${x},${z} is not the height the owner shows`); }
    for (const [x, z] of [[100, -450], [215, -460], [150, -405], [268, -425]]) if (!cm.AREAS.some((a) => a.kind === 'wood' && inA(a, x, z))) fail(`no trees at ${x},${z} round the ISSER Annex (owner)`);
    if ((await server.ssrLoadModule('/src/game/isserannex.ts')).isserAnnexSite.frames().length !== 3) fail('expected the ISSER Annex, the frame going up and the hall'); }
  // owner: Earth Science entered up the stair to the one-floor entrance block, its storey building three floors, the
  // ranges one floor, the whole on ground raised behind stone walls; the Bookshop and the Basic School modelled once
  { const { groundHeight: gh } = await server.ssrLoadModule('/src/game/relief.ts');
    if (!(gh(300, 60) > 1.2)) fail('Earth Science does not stand on its raised ground (owner)');
    const e = ann('Earth Science'); if (!e || Math.hypot(e[0] - 327.4, e[1] - 99) > 3) fail('Earth Science: the entrance is not the door up the front stair (owner)');
    for (const [x, z, lo, hi] of [[263.3, 40.1, 10, 14], [296.4, 38.1, 10, 14], [247, 73.9, 0, 5], [323.3, 91.7, 0, 5]]) { const b = buildingAt(x, z); if (!b || b.height < lo || b.height > hi) fail(`Earth Science at ${x},${z} is not the height the owner shows`); }
    if ((await server.ssrLoadModule('/src/game/earthscience.ts')).earthScienceSite.frames().length !== 1) fail('expected the Earth Science model');
    const S = (await server.ssrLoadModule('/src/game/sites.ts')).BLOCK_SITES;
    for (const b of BUILDINGS) if (S.filter((s) => s.replaces(b)).length > 1) fail(`the building at ${Math.round((b.minX + b.maxX) / 2)},${Math.round((b.minZ + b.maxZ) / 2)} is modelled twice (its walls flicker)`); }
  // owner: physics up the hill from Danquah Avenue, one floor; the tall one-floor building north of it; the chemistry
  // ranges one floor round the five-floor Frank Torto Building; the ISSER Annex car park keeps the walk to its porch clear
  { const { groundHeight: gh } = await server.ssrLoadModule('/src/game/relief.ts');
    if (!(gh(156, 79) > 1.2) || gh(150, 117) !== 0) fail('the Department of Physics is not up the hill from Danquah Avenue (owner)');
    for (const [x, z, lo, hi] of [[150, 98, 0, 5], [134.3, 17.1, 6.5, 8.5], [112, -120, 0, 5], [128.5, -66, 0, 5], [184.3, -69, 0, 5], [168.8, -120.5, 17, 20]]) { const b = buildingAt(x, z); if (!b || b.height < lo || b.height > hi) fail(`the building at ${x},${z} is not the height the owner shows`); }
    const inA = (a, x, z) => { let c = false; for (let i = 0, j = a.pts.length - 2; i < a.pts.length; j = i, i += 2) { const zi = a.pts[i + 1], zj = a.pts[j + 1]; if ((zi > z) !== (zj > z) && x < ((a.pts[j] - a.pts[i]) * (z - zi)) / (zj - zi) + a.pts[i]) c = !c; } return c; };
    for (const z of [-360, -350, -340]) if (cm.AREAS.some((a) => a.kind === 'parking' && inA(a, 301.5, z))) fail(`cars park on the walk to the ISSER Annex at z ${z} (owner)`);
    if ((await server.ssrLoadModule('/src/game/physics.ts')).physicsSite.frames().length !== 11) fail('expected physics, the chemistry ranges, the west entrance, the covered walk, the Frank Torto Building, the building behind it and the building between the tall building and physics');
    // the chemistry department's west entrance on its stone-faced base (owner's photo)
    { const b = buildingAt(117, -85.5); if (!b || b.height < 4.5 || b.height > 5.5) fail('the chemistry west entrance is not the one floor on its raised base the owner shows'); }
    { const b = buildingAt(219.3, -89.4); if (!b || b.height > 4.6) fail('the building behind the Frank Torto Building is not one floor (owner)'); }
    // Nsia Road runs flat past Earth Science's west wall, its kerb and pavement too (owner)
    { const { groundHeight } = await server.ssrLoadModule('/src/game/relief.ts'); for (const z of [30, 60, 98, 104]) for (const x of [235, 238.5, 240.2]) if (Math.abs(groundHeight(x, z)) > 0.02) fail(`Nsia Road by Earth Science is not flat at ${x},${z} (owner)`); } }
  // owner: the free-ridden bike rides through the open passages (Frank Torto Building, French Department); the lane
  // round the Frank Torto Building runs clear of the building behind it and the chemistry range east, pavements too;
  // LECIAD four storeys at its south block; the small square buildings west of it one floor
  {
    const so = await server.ssrLoadModule('/src/game/solids.ts');
    await server.ssrLoadModule('/src/game/physics.ts'); await server.ssrLoadModule('/src/game/balmewest.ts');
    const through = (x, z0, z1) => { for (let z = z0; z <= z1; z += 0.25) if (cm.buildingNear(x, z, 0.35) && !so.inPassage(x, z)) return false; return true; };
    if (!through(149.1, -136.4, -112)) fail('the bike cannot ride through the Frank Torto Building\'s open passage (owner)');
    if (!through(-172.75, 84.6, 95.0)) fail('the bike cannot ride through the French Department\'s open passage (owner)');
    if (!so.inPassage(149.1, -125) || so.inPassage(145, -125)) fail('the Frank Torto passage is not where the model has it');
    const lane = ROADS.find((r) => r.nodes.some((n) => { const [x, z] = nodeXZ(n); return Math.hypot(x - 209.5, z + 83.9) < 0.3; }));
    if (!lane) fail('the lane round the Frank Torto Building is missing');
    else for (let k = 0; k < lane.nodes.length - 1; k++) {
      const [ax, az] = nodeXZ(lane.nodes[k]), [bx, bz] = nodeXZ(lane.nodes[k + 1]), len = Math.hypot(bx - ax, bz - az);
      for (let s = 0; s <= len; s += 0.5) {
        const x = ax + ((bx - ax) * s) / len, z = az + ((bz - az) * s) / len;
        if (x < 195 || z < -95 || z > -45) continue;
        const b = cm.buildingNear(x, z, 5.5);
        if (b) { fail(`the lane round the Frank Torto Building runs within 5.5 m of ${b.name ?? 'a building'} at ${x.toFixed(1)},${z.toFixed(1)} (owner)`); break; }
      }
    }
    { const b = buildingAt(313, -25); if (!b || b.height < 14 || b.height > 17) fail('LECIAD is not four storeys at its south block (owner)'); }
    { const b = buildingAt(252.3, -12.9); if (!b || b.height > 4.6) fail('the small square building west of LECIAD is not one floor (owner)'); }
  }
  // owner: Legon's and Akuafo's outward faces have the open gallery upstairs (purple lines); Legon's long block east of
  // the front meets the gable block beside it; its north-west corner block joins the range down its west side
  {
    const gh = await server.ssrLoadModule('/src/game/greathalls.ts');
    const upper = (s) => s.blocks.filter((b) => b.y === 3.6 && b.floors === 1).length;
    if (upper(gh.legon) < 12) fail(`Legon Hall has ${upper(gh.legon)} gallery floors, fewer than the owner's purple lines (12)`);
    if (upper(gh.akuafo) < 11) fail(`Akuafo Hall has ${upper(gh.akuafo)} gallery floors, fewer than the owner's purple lines (11)`);
    for (const [x, z, what] of [[-114.7, 164, 'the gap east of Legon Hall\'s front'], [-198.6, 168, 'Legon Hall\'s west range by the north-west corner']]) if (!buildingAt(x, z)) fail(`${what} is open (owner: the buildings are joined)`);
  }
  // owner: the French Department and the Economic Policy Management office where the aerial shows them (west of their
  // old outlines); the office three floors; the French Department's door beside the passage pavilion
  {
    { const b = buildingAt(-180, 90); if (!b || !(b.name ?? '').includes('Faculty of Arts')) fail('the French Department is not where the owner\'s aerial shows it'); }
    if (!buildingAt(-146, 62)) fail('the Economic Policy office is not where the owner\'s aerial shows it');
    if (buildingAt(-100, 90) || buildingAt(-102, 60)) fail('the French Department or the Economic Policy office still stands on its old outline');
    { const b = buildingAt(-146, 62); if (!b || b.height < 11 || b.height > 14) fail('the Economic Policy Management office is not three floors (owner)'); }
    const fa = ACCESS.get('Faculty of Arts, Languages'); if (!fa || Math.hypot(fa.entrance[0] + 165.9, fa.entrance[1] - 94.7) > 2) fail('the Faculty of Arts is not entered by the door beside the passage (owner)');
  }
  // owner: the Faculty of Arts up behind its rubble-stone wall on Danquah Avenue, the stairs up from the footway; the
  // avenue, the footway and their pavements flat; the two hotspot comfort zones south of the loop
  {
    const rl = await server.ssrLoadModule('/src/game/relief.ts');
    if (Math.abs(rl.groundHeight(-150, 100) - 1) > 0.01 || Math.abs(rl.groundHeight(-130, 62) - 1) > 0.01) fail('the Faculty of Arts and the Economic Policy office do not stand on their raised ground (owner)');
    for (let x = -188; x <= -100; x += 4) for (const z of [108.5, 112, 114, 116, 118.5, 121]) if (!(z < 110.1 && x > -146.1 && x < -142.9) && rl.groundHeight(x, z) !== 0) fail(`Danquah Avenue or its footway is not flat at ${x},${z}`);
    if (!rl.stairsOf().some((q) => q.alongZ && q.z0 === -146 && q.top > 0.9 && q.foot < 0.1)) fail('no stairs up through the Faculty of Arts\' wall (owner)');
    if ((await server.ssrLoadModule('/src/game/hotspots.ts')).hotspotSite.frames().length !== 2) fail('expected the two hotspot comfort zones (owner)');
  }
  // owner: St. Thomas Aquinas, the Interdenominational Church and the open ground of red soil west of them
  {
    if ((await server.ssrLoadModule('/src/game/churches.ts')).churchSite.frames().length !== 6) fail('expected St. Thomas Aquinas, the Interdenominational Church, the Anglican church and hall, and the open grounds (owner)');
    for (const [x, z, what] of [[-356, -528, 'the Anglican church'], [-365, -464, 'the Anglican church hall']]) if (!buildingAt(x, z)) fail(`${what} is not where the owner's aerial shows it`);
    if (buildingAt(-416.8, -507.3)) fail('a building still stands on the Anglican car park (owner)');
    if (buildingAt(-373.8, -320)) fail('no paved yard between St. Thomas Aquinas and the house west of it (owner)');
    if (!buildingAt(-359.25, -306)) fail('St. Thomas Aquinas\' porch is not centred on its gable (owner)');
    { const b = buildingAt(-341, -335); if (!b || b.height < 9) fail('St. Thomas Aquinas\' east range (facing WACCBIP) is not two floors (owner)'); }
  }
  // owner: the N Block compound from the ten numbered views
  {
    const rl = await server.ssrLoadModule('/src/game/relief.ts');
    if ((await server.ssrLoadModule('/src/game/socsci.ts')).socSciSite.frames().length !== 10) fail('expected the N Block compound\'s ten models (owner)');
    // (corrected from the owner's photo of the court: the court and the range behind it are level; the ground round the
    // K. Folson Building lies 1.2 m below them, two stairs climb the bank, view 2)
    for (const [x, z] of [[40, -364], [40, -345], [6, -305], [80, -320], [-40, -320], [78, -372], [5, -383]]) if (rl.groundHeight(x, z) !== 0) fail(`the N Block compound is not level at ${x},${z} (owner)`);
    for (const [x, z] of [[60, -395], [45, -410], [75, -385]]) if (Math.abs(rl.groundHeight(x, z) + 1.2) > 0.01) fail(`the ground round the K. Folson Building is not 1.2 m below the court at ${x},${z} (owner)`);
    if (rl.stairsOf().filter((q) => q.alongZ && q.x0 === -377.1 && q.top - q.foot > 1.1).length !== 2) fail('expected the two stairs up the bank from the K. Folson Building (owner, view 2)');
    for (const [x, z, lo, hi, what] of [[60, -408, 8, 11, 'the K. Folson Building two storeys'], [78, -340, 0, 5.5, 'the long range one floor'], [-55, -350, 0, 5, 'Social Work one floor']]) { const b = buildingAt(x, z); if (!b || b.height < lo || b.height > hi) fail(`${what} (owner)`); }
    if (buildingAt(-14.3, -302.5)) fail('the phantom building on Ebenezer Laing Road is still there');
  }
  // owner: round the front of the N Block (eleven views): Plant Biology like Animal Biology, its entrance on the west;
  // the Centre for Biodiversity; the Ocean Margins Initiative; the ashoka row (no wood over the verge)
  {
    if ((await server.ssrLoadModule('/src/game/biology.ts')).biologySite.frames().length !== 3) fail('expected Plant Biology, the Centre for Biodiversity and the grounds round them (owner)');
    const pa = ACCESS.get('Department of Plant and Environmental Biology'); if (!pa || Math.hypot(pa.entrance[0] - 51.7, pa.entrance[1] + 217) > 2) fail('Plant Biology is not entered by its terrace on the west (owner, views 9 to 11)');
    const ca = ACCESS.get('Centre for Biodiversity Conservation Research'); if (!ca || Math.hypot(ca.entrance[0] + 26.2, ca.entrance[1] + 277.6) > 2) fail('the Centre for Biodiversity is not entered up its red stair (owner, view 2)');
    { const b = buildingAt(-177, -251); if (!b || b.height > 5) fail('the Ocean Margins Initiative is not one floor where the aerial shows it (owner, view 6)'); }
    const inA2 = (a, x, z) => { let c = false; for (let i = 0, j = a.pts.length - 2; i < a.pts.length; j = i, i += 2) { const zi = a.pts[i + 1], zj = a.pts[j + 1]; if ((zi > z) !== (zj > z) && x < ((a.pts[j] - a.pts[i]) * (z - zi)) / (zj - zi) + a.pts[i]) c = !c; } return c; };
    if (cm.AREAS.some((a) => a.kind === 'wood' && inA2(a, -90, -287))) fail('the verge before the biology complex is still a wood, not the ashoka row (owner, view 3)');
    for (const [x, z, what] of [[-365, -330, 'St. Thomas Aquinas'], [-370, -426, 'the Interdenominational Church']]) if (!buildingAt(x, z)) fail(`${what} is not where the owner's aerial shows it`);
    for (const [x, z] of [[-410, -380], [-440, -300]]) if (buildingAt(x, z)) fail(`a building stands on the open ground west of the churches at ${x},${z} (owner)`);
  }
  // owner: the corrections round the N Block: the market between the GCB and the N Block, the greenhouse, the woods
  // where a building had been mapped, the lane past Food and Nutrition running down to its north end
  {
    const rl = await server.ssrLoadModule('/src/game/relief.ts');
    const mk = (await server.ssrLoadModule('/src/game/market.ts')).marketSite, gr = (await server.ssrLoadModule('/src/game/greenhouse.ts')).greenhouseSite;
    if (!mk.keepsOut(-85, -312) || mk.frames().length !== 1) fail('the market between the GCB and the N Block is missing (owner)');
    if (gr.frames().length !== 1 || !gr.keepsOut(122.2, -396)) fail('the greenhouse is missing (owner)');
    if (buildingAt(21, -452)) fail('a building still stands in the woods east of the New N Block (owner)');
    const inA3 = (a, x, z) => { let c = false; for (let i = 0, j = a.pts.length - 2; i < a.pts.length; j = i, i += 2) { const zi = a.pts[i + 1], zj = a.pts[j + 1]; if ((zi > z) !== (zj > z) && x < ((a.pts[j] - a.pts[i]) * (z - zi)) / (zj - zi) + a.pts[i]) c = !c; } return c; };
    if (!cm.AREAS.some((a) => a.kind === 'wood' && inA3(a, 21, -452))) fail('the ground east of the New N Block is not woodland (owner)');
    const lane = [-167, -200, -230, -262].map((z) => rl.groundHeight(-160.3 - (z < -202.5 ? (z + 202.5) * 0.0406 : 0), z));
    if (!(lane[0] > -0.05 && lane[1] < lane[0] && lane[2] < lane[1] && lane[3] < -0.9)) fail(`the lane past Food and Nutrition does not run down to its north end (owner): ${lane.map((h) => h.toFixed(2))}`);
  }
  // owner's reference PDF (docs/CAMPUS_REFERENCE_AUDIT.md), the graduate cluster: the two-storey block circled green before
  // the Volta Hall Annex deleted; the Graduate School one floor; the Doctorate building two; a construction site, not a
  // building, beside it; the Research and Innovation Complex's blocks
  {
    const gs = (await server.ssrLoadModule('/src/game/westgrad.ts')).gradSite;
    if (gs.frames().length !== 7) fail('expected the Graduate School, the Doctorate building, the construction site and the Research and Innovation Complex (owner PDF)');
    if (buildingAt(-261.8, -96.7)) fail('the two-storey block circled green before the Volta Hall Annex is still there (owner PDF p. 23)');
    for (const [x, z] of [[-541.3, -201.7], [-550.2, -201.7]]) if (buildingAt(x, z)) fail(`a finished building stands on the construction site at ${x},${z} (owner PDF pp. 12-14)`);
    { const b = buildingAt(-402, -165); if (!b || b.height > 6.5) fail('the Graduate School is not one floor (owner PDF pp. 5-6)'); }
    { const b = buildingAt(-452.8, -166.3); if (!b || b.height < 6) fail('the Doctorate building is not two floors (owner PDF pp. 7-11)'); }
    if (!buildingAt(-298, -62) || !buildingAt(-635, -241)) fail('the Volta Hall Annex or the Research and Innovation Complex is missing');
    // second PDF, page 5: the two-storey block circled red between the Graduate School and the Nursing School deleted
    if (buildingAt(-361.3, -151.8)) fail('the two-storey block circled red near the Graduate School is still there (owner PDF 2 p. 5)');
  }
  // owner's reference PDF, behind the Balme Library: the Chemistry Extension up on its walled terrace, the uncompleted
  // building where the car park was, the Chemistry Department's two floors
  {
    const rl = await server.ssrLoadModule('/src/game/relief.ts');
    if (Math.abs(rl.groundHeight(150, -125) - 1) > 0.01 || rl.groundHeight(97.5, -125) !== 0 || rl.groundHeight(150, -162.5) !== 0) fail('the Chemistry Extension is not up on its terrace above Cruise O\'Brien and J.K.M. Hodasi Roads (owner PDF pp. 25-29)');
    if (rl.groundHeight(180, -92) !== 0) fail('the lane south of the Chemistry Extension is not at ground level');
    const bb = (await server.ssrLoadModule('/src/game/behindbalme.ts')).behindBalmeSite;
    if (bb.frames().length !== 3) fail('expected the Chemistry Extension terrace, the uncompleted building and the Chemistry Department (owner PDF)');
    if (cm.AREAS.some((a) => a.kind === 'parking' && a.pts.length && (() => { let c = false; for (let i = 0, j = a.pts.length - 2; i < a.pts.length; j = i, i += 2) { const zi = a.pts[i + 1], zj = a.pts[j + 1]; if ((zi > -130) !== (zj > -130) && 82 < ((a.pts[j] - a.pts[i]) * (-130 - zi)) / (zj - zi) + a.pts[i]) c = !c; } return c; })())) fail('the car park behind the Balme Library is still there (owner PDF p. 30)');
  }
  if ((await server.ssrLoadModule('/src/game/residences.ts')).residences.frames().length < 20) fail('expected the one-floor buildings and the lecturers\' houses with their wood');
  // Explore's free ride: a building blocks the bike by its real outline, not its bounding box (the lanes between
  // the Diaspora halls, set at an angle, and the roads to the Night Market lie inside the halls' boxes)
  for (const [x, z] of [[95, 1573], [-88, 1676], [210, 1509], [200, 1500]]) if (cm.buildingNear(x, z, 0.35)) fail(`free ride: the road at ${x},${z} is blocked by ${cm.buildingNear(x, z, 0.35).name ?? 'a building'}`);
  if (!cm.buildingNear(182.5, 1632.5, 0.35)) fail('free ride: a Diaspora hall (the east wing of Kwapong) does not block the bike');
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
