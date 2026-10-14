// The medical precinct's and Evandy's corrections (ugmcplan.ts, nogplan.ts, evandyplan.ts) as JSON on stdout, so that the
// map's collision rings match the models; med-corrections.py merges them into corrections.json:
// node scripts/geography/med-corrections.mjs | python3 scripts/geography/med-corrections.py
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const U = await server.ssrLoadModule('/src/game/ugmcplan.ts');
  const out = { reshape: [], exclude: [], addAreas: [], addWays: [] };
  const r1 = (v) => Math.round(v * 10) / 10;
  const world = (ring) => ring.map(([u, v]) => U.ugWorld(u, v).map(r1));
  const SRC = "the owner's UGMC brief (docs/ugmc/): Google satellite M1 registered at 2.55 px/m, traced on the precinct's grid";
  const reshape = [
    ['osm:way/1153076179', '01 Central Emergency & Diagnostics (UGMC)', 'core'],
    ['osm:way/1252865624', '02 Women & Children (UGMC)', 'wc'],
    ['osm:way/1114966056', '03 Outpatients & Administration (UGMC)', 'opd'],
    ['osm:way/1114966057', '04 Medical Training & Simulation Center (UGMC)', 'sim'],
    ['osm:way/1252865623', '05 Patient Tower group (UGMC)', 'pt'],
    ['osm:way/1138714888', '06 the long low building (UGMC; use unresolved)', 'long'],
  ];
  for (const [id, place, key] of reshape) out.reshape.push({ id, place, source: SRC, ring: world(U.OUTLINES[key]), reason: 'The mapped outline is a coarse rectangle (the brief: "do not remodel from the game map alone"); the ring follows the building the satellite and the aerial frames show, so that the bike stops at the walls the model draws (ugmc.ts).' });
  const excl = [
    ['ml:9c325e91-0170-430e-b5ec-3137f4a74e89', 'A detected fragment inside the Women & Children block (UGMC): the block is modelled whole (ugmc.ts).'],
    ['ml:e286a3e1-aa02-4804-aee0-085029791d46', 'A detected fragment inside the Women & Children block (UGMC): the block is modelled whole (ugmc.ts).'],
    ['ml:e597cad4-e28d-486e-bdf8-c2ac2a6eb33c', 'A detected fragment inside the Outpatients block\'s east wing (UGMC): the block is modelled whole (ugmc.ts).'],
    ['ml:38acf373-56d5-45fd-9881-205c6a95e451', 'A detected fragment inside the Outpatients block\'s east wing (UGMC): the block is modelled whole (ugmc.ts).'],
  ];
  for (const [id, reason] of excl) out.exclude.push({ id, reason });
  for (const l of U.LOTS) out.addAreas.push({ id: `owner:${l.name}`, class: 'parking', ring: world(l.ring), reason: `${SRC}: a marked car park of dark asphalt with rows of bays (the brief's parking ${l.name.slice(-2)}); the game map had no area there.` });
  // Noguchi and WAGMC (nogplan.ts)
  const N = await server.ssrLoadModule('/src/game/nogplan.ts');
  const nw = (F, ring) => ring.map(([u, v]) => F.world(u, v).map(r1));
  const NSRC = "the owner's Noguchi + WAGMC brief (docs/noguchi-wagmc/): Apple satellite M1/M2 registered at 2.617 / 2.242 px/m";
  out.reshape.push({ id: 'osm:way/1239491142', place: 'Noguchi Advanced Research Laboratories', source: NSRC, ring: nw(N.NG, N.LAB_OUTLINE), reason: 'The L follows the long wing, the taller signed end, the service block and the west arm on the satellite, kept clear of the mapped drives north and west of it, so that the bike stops at the walls the model draws (nog.ts).' });
  out.reshape.push({ id: 'ml:bb10dd81-3cd6-40d5-99d0-f8fac678746a', place: 'West African Genetic Medicine Centre', source: NSRC, ring: nw(N.WG, N.WAG_OUTLINE), reason: 'The game map had no WAGMC building (the brief: "a text label is not a building"); this detected fragment of its roof becomes the U the satellite and the drone frames show (two forward wings, the base with the portal, the rear extension).' });
  out.reshape.push({ id: 'osm:relation/10865322', place: 'the small red courtyard building by Noguchi (04)', source: NSRC, ring: nw(N.NG, [[N.RED04.outer[0], N.RED04.outer[2]], [N.RED04.outer[1], N.RED04.outer[2]], [N.RED04.outer[1], N.RED04.outer[3]], [N.RED04.outer[0], N.RED04.outer[3]]]), reason: 'Its mapped east end reached into the service road beside it; the ring follows the red roof on the satellite, 1.5 m shorter, clear of the road (its enclosed centre stays open in the model).' });
  for (const [id, reason] of [
    ['ml:b175b03a-e7b9-424f-918a-a04baebbcd1d', 'A detected fragment inside the Noguchi laboratory group: the group is modelled whole (nog.ts).'],
    ['ml:29306972-28b9-437c-9659-90ffc1c1516d', 'A detected fragment of the WAGMC roof: the building is modelled whole (nog.ts).'],
    ...['ml:029f9121-b36f-4fcb-bc09-498e237a7317', 'ml:286f3913-29d3-4e8c-8cd6-93b0543ae579', 'ml:7ff4d657-c785-4c0a-a3c3-5835fe61ce8f', 'ml:8aeb18d1-83d2-4f65-a1f5-c7114073cb36', 'ml:abc66d48-de80-4156-8695-b6917f04cb0f', 'ml:cce2ca95-db84-4278-97ec-5aeae0b331f3', 'ml:e0e0194a-5105-47b2-9cfd-606c10db506a', 'ml:366bf68f-c90a-4c21-aaec-1757e17a4577', 'ml:5b4e137d-917e-461e-aa56-7fa7484c9036'].map((id) => [id, 'Detected "buildings" inside the gridded panel fields behind Noguchi (the brief: "do not extrude panel fields into buildings"); the fields are modelled as low panel rows (nog.ts).']),
  ]) out.exclude.push({ id, reason });
  // the loop beside the old ring and the earth tracks (the owner's correction brief, 2026-10-14)
  const CSRC = "the owner's Noguchi + WAGMC correction brief (S03/S04, S17/S18; docs/noguchi-wagmc/correction-ledger.md), traced on Apple satellite M1 (2.617 px/m)";
  for (const id of ['osm:way/111440943', 'osm:way/1239491144']) out.exclude.push({ id, reason: `${CSRC}: the mapped figure of eight round the road is one paved loop on the satellite (S04), replaced by owner:noguchi-loop.` });
  out.exclude.push({ id: 'osm:way/111440926', reason: `${CSRC}: the road down from the north ends at the loop's top on the satellite and does not cross its lawn; replaced by owner:noguchi-road-north, the loop and the earth track south (owner:noguchi-loop-south).` });
  const way = (id, highway, pts, reason, open) => out.addWays.push({ id, highway, pts: pts.map(([x, z]) => [r1(x), r1(z)]), reason, ...(open && { open }) });
  way('owner:noguchi-road-north', 'residential', N.NOG_ROADS.north, `${CSRC}: the mapped road down from the north, ending at the loop's top where the satellite shows it entering.`, 'end');
  way('owner:noguchi-loop', 'service', N.NOG_ROADS.loop, `${CSRC}: the paved loop round the tree island and the kerbed lawn (S04).`);
  way('owner:noguchi-loop-south', 'track', N.NOG_ROADS.south, `${CSRC}: the mapped way's line south of the loop, unpaved on the satellite.`, 'end');
  out.exclude.push({ id: 'osm:way/690531803', reason: `${CSRC}: the mapped service road down WAGMC's east side ran 6-15 m west of the red earth strip the satellite shows outside the boundary, through the compound's grass and parking; replaced by owner:wagmc-east-strip, the drive in (owner:wagmc-drive-in, owner:wagmc-drive-se) and the earth track into the cluster (owner:wagmc-cluster-track).` });
  way('owner:wagmc-east-strip', 'track', N.NOG_ROADS.strip, `${CSRC}: the red earth strip outside WAGMC's east boundary, from the main road to the red-roofed cluster (S02's right-hand blue arrow, S18).`, 'end');
  way('owner:wagmc-drive-in', 'service', N.NOG_ROADS.driveIn, `${CSRC}: the drive in from the strip to the south-east parking strip (the mapped road's link).`);
  way('owner:wagmc-drive-se', 'service', N.NOG_ROADS.driveSE, `${CSRC}: the mapped road's line along the south-east strip to the south-west gap.`, 'end');
  way('owner:wagmc-cluster-track', 'track', N.NOG_ROADS.cluster, `${CSRC}: the mapped road's line beyond the south-west gap into the cluster, red earth on the satellite (S02's lower blue arrows).`, 'end');
  out.exclude.push({ id: 'osm:way/958782150', reason: `${CSRC}: the drive past the laboratories' portal ran through the portal frame; replaced by owner:noguchi-portal-drive, 3 m west, where the satellite and S11/S20 show the asphalt.` });
  way('owner:noguchi-portal-drive', 'service', N.NOG_ROADS.portalDrive, `${CSRC}: the drive round the sign island and past the portal, on the asphalt the satellite shows (S11, S20).`);
  for (const [id, place, ring] of N.CLUSTER_RINGS) out.reshape.push({ id, place: `the red-roofed cluster south of WAGMC: ${place}`, source: CSRC, ring: ring.map(([x, z]) => [r1(x), r1(z)]), reason: 'The mapped outline sat across the roof patches the satellite shows (S02\'s red outline); it now follows its own roof.' });
  way('owner:wagmc-corridor-track', 'track', N.NOG_ROADS.corridor, `${CSRC}: the second red-earth track of the corridor west of WAGMC, across the tree belt from the mapped one (S18's two blue arrows).`, 'end');
  for (const [F, lots] of [[N.NG, N.NOG_LOTS], [N.WG, N.WAG_LOTS]]) for (const l of lots) out.addAreas.push({ id: `owner:${l.name}`, class: 'parking', ring: nw(F, l.ring), reason: `${NSRC}: parking with marked bays (${l.name}); the game map had no area there.` });
  // Evandy Hostel (evandyplan.ts): the frontage parking along the fence and before the commercial block
  const E = await server.ssrLoadModule('/src/game/evandyplan.ts');
  E.PARKS.forEach((ring, i) => out.addAreas.push({ id: `owner:evandy-parking-${i + 1}`, class: 'parking', ring: ring.map(([x, z]) => [r1(x), r1(z)]), reason: "The owner's Evandy brief (docs/evandy/): cars parked along the fence in the paved frontage (P01, R14) and before the commercial block (R13); the game map had no area there." }));
  // the owner's second corrections (JQB, PRESEC, low buildings; docs/campus-corrections-2/): A14-A17, the small detected
  // block standing on Onyaa Road south of the School of Performing Arts, with no roof under it on the satellite (A17)
  out.exclude.push({ id: 'ml:56ac8af2-55a6-4373-84f0-ab8959185ae3', reason: "The owner's second corrections, A14-A17: a detected block standing on Onyaa Road (the owner: \"On road\"); the registered satellite A17 shows the road there and no roof, so it is dropped rather than moved." });
  out.reshape.push({ id: 'osm:way/665125655', place: 'the small block west of E.A. Boateng Road by the School of Performing Arts', source: "the owner's second corrections, A15-A17: Apple satellite A17 registered on the School of Performing Arts' roof and E.A. Boateng Road", ring: [[491.6, 227.4], [497.9, 227.4], [498.0, 237.7], [491.7, 237.7]], reason: 'Its mapped east wall stood on the road\'s edge (the owner: "On road"); the registered satellite puts the small red roof about 5.5 m further west, clear of the road and its footway.' });
  out.exclude.push({ id: 'osm:way/1184497719', reason: "The owner (Evandy correction, the circled picture): the small red-roofed hut drawn against the commercial block's north-west corner does not exist; deleted." });
  out.exclude.push({ id: 'ml:c4d6268e-fa99-4886-9242-72ece4361f46', reason: "The owner's James Topp Nelson Yankah Hall brief: the lower courtyard (06) is the open basketball court; this detected outline filled it with a building (\"no solid slab occupies the court\"); jtny.ts models the court." });
  process.stdout.write(JSON.stringify(out));
} finally { await server.close(); }
