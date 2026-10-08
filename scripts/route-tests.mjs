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
  for (const [n, x, z] of [['Cedi Conference Centre', -152.5, 10.6], ['University of Ghana Computing Systems (UGCS)', -111.8, -32.8], ['Department of Economics, University of Ghana', -43.8, 75.7], ['University of Ghana Bookshop', 58.7, 74.7], ['Faculty of Arts, Languages', -161, 98.5], ['Office of The Dean of Students', -55.6, 58.9], ['Legon Post Office', -58.6, 93.8], ['Standard Chartered', 70.2, 94.7], ['Absa (near Balme Library Fountain)', 78, 94.7], ['Standard Chartered ATM (near Balme Library Fountain)', 70.2, 106.3]]) {
    const e = ann(n);
    if (!e || Math.hypot(e[0] - x, e[1] - z) > 2) fail(`${n}: the entrance is not where the owner marks it`);
  }
  for (const [n, floors] of [['Department of Economics, University of Ghana', 2], ['Faculty of Arts, Languages', 2], ['University of Ghana Bookshop', 2], ['Office of The Dean of Students', 1], ['Legon Post Office', 1]]) {
    const b = BUILDINGS.find((x) => x.name === n);
    if (!b || (floors === 1 ? b.height > 5 : b.height < 7 || b.height > 10)) fail(`${n}: not ${floors === 1 ? 'a ground floor only' : 'two floors'} (owner's aerial)`);
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
  if (!nmModels.includes('Night Market') || !nmModels.includes('Supermart (Night Market)') || nmModels.length < 25) fail(`expected the market, the supermarket and the one-floor buildings round them, found ${nmModels.length} models`);
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
