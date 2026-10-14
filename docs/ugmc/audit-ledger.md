# UGMC audit (batch 157): what was corrected and what stays open

Source: the owner's 147-page UGMC audit, split into three PDFs (Part 1 pages 1-50, Part 2 51-100, Part 3 101-147).
I read all of it:
- the satellite registration (M1/M2);
- the source registers (R001-R047 aerial frames, A001-A042 photographs, G001-G089 game frames);
- the 89 chronological comparison pairs;
- detail plates 1-9;
- the feature ledger and the compulsory inspection rules;
- the issue register UGMC-001 to 019;
- the implementation prompt and the contact sheets.

The audit's A and R numbers are the same files as batch 136's E and A numbers: A024 = E24, A041 = E41, R038 = A38. So
the originals were checked at full resolution from `docs/handover/uploads/UGMC_Detailed_Annotated_Claude_Reconstruction_Brief.pdf`.

Labels: [VERIFIED] seen in the sources; [DECISION] a choice where the sources leave room; [ASSUMPTION] not surveyed.

Code:
- `src/game/ugmcplan.ts`: OPD bow, PT entrance numbers and outline, FENCE;
- `src/game/ugmc.ts`: trussCanopy, coveredRun, pipe, bands, perimeterFence and the 05/06 sections.

The map rings are regenerated with `node scripts/geography/med-corrections.mjs | python3 scripts/geography/med-corrections.py`,
then `npm run -s geo`.

## Done

| Issue | What changed | Evidence |
|---|---|---|
| UGMC-001 curve direction | Each named curve was tested in plan. Signed recess s = dot(P - (A+B)/2, n), with n pointing into the forecourt. **01 Emergency** was already concave: the arc is centred in the forecourt, and its middle lies 5.3 m behind the chord. Kept. **03 Outpatients** was convex: its middle bulged 2 m toward the roundabout. It is now concave, with its middle 2.5 m behind the chord (`OPD.bow.bulge = -2.5`). The glass, its fill, the sign, the doors, the canopy and the collision ring all follow. 02 Women & Children's bay was not touched (the audit: no automatic reversal). | [VERIFIED] E25, E39, E14 (the sign's line and the top edge sag toward the middle), E32 |
| UGMC-002 canopies | Both clinical entrances now use one canopy type: a flat plate whose back follows the glass, a silver edge, two thick round silver posts, and the triangulated rods above (top chord, zigzag, stays back to the glass). This replaces the white fan with thin rods on 01 and the box on 03. 01's posts stand on the walk 1 m from the glass, so the drop-off drive under the plate stays clear. 03's posts stand 3 m out. | [VERIFIED] E32 (both canopies), E25, E39. [DECISION] 01's post offset: the drive runs about 4 m from its glass |
| UGMC-003 roof run | The triangular gold rods are now a covered run 2.6 m wide: low walls under a shallow corrugated gable (ribs across the run), on legs, with square caps where it turns, round the raised enclosure. | [VERIFIED] A38/R038 (tan corrugated runs round the enclosure with the black tank). [ASSUMPTION] the route is kept from batch 136 |
| UGMC-004 roof plant | Three large chiller housings with six fans each, and a separate pale pipe circuit on supports from them to the enclosure, passing under the run. The existing small units and ducts were kept. | [VERIFIED] R038 shows a bank of large housings with white pipes. [ASSUMPTION] the positions; R038 is oblique, not surveyed |
| UGMC-005 end glazing | Each tall end mass's entrance face now has one dark glazed strip up its middle, 2.2 m wide with a pane grid, and a glass door with a small hood at its foot. The broad wall fields either side are blank. The three black lines per face are gone. | [VERIFIED] E24, E41, detail plate 1 |
| UGMC-006 bands | Paired projecting bands at every floor round both end masses: a 0.34 m band projecting 0.32 m with a thin 0.12 m line above it. They break at the strip. The painted grey lines are gone from those faces. | [VERIFIED] E24, E41 |
| UGMC-007 portal | The thin slab across the recess is removed. A low panelled portal (5.8 m) now stands against the north end mass. Its closed part has a front screen with square openings, an end wall, panel joints and a fascia. Its open part is the drive-in shelter on two slender round columns, with the "5 Patient Tower" sign (gold badge) on its fascia. Behind it are the dark glazed two-storey base, its doors under the shelter, and the glazed bay up the block behind. The collision ring now leaves the shelter open to the doors. | [VERIFIED] E16, E24, E41, detail plate 2. [ASSUMPTION] the opening count and the shelter's depth (the photographs show 4-5 openings on a longer front; two fit the 7.5 m closed part) |
| UGMC-008 forecourt | Asphalt from the drop-off loop in under the shelter, a tan paver floor under it, and a tan paver walk along the south end mass. | [VERIFIED] E24, E41 |
| UGMC-009 planting | The curved shrub bed before the portal's closed part: green and red-leaved shrubs on soil, in a white pebble border, kept off the drive and solid to the bike. The small white-flowering tree. The white concrete bench by the south end mass, where E24 shows it. The sculpture was not placed: the audit says to confirm its side first. | [VERIFIED] E16, E24, E41 |
| UGMC-012 long low roof | The block's generic pitched tile roof is replaced by a shallow gable (2.1 m rise) of sheet roofing. Its seams run lengthwise, with a ridge cap. The building stays two storeys and unsigned. | [VERIFIED] M1 (lengthwise divisions), A38. [ASSUMPTION] the rise |
| Mast | The lattice mast moved from the north end mass to the south one: left of the entrance as seen from the drive. In E24 and E41 the tan core (01, to the north-west) is on the right, so the mast end is the south end. | [VERIFIED] E24, E41 |
| **Perimeter fence** (owner) | A fence round the UGMC community: a low concrete kerb, pale square posts every 3 m, and a dark palisade with spear tops, 2.1 m high, solid to the bike. Line: just inside the main road (behind both security posts), outside the east ring road (short of the red earth strip), round Building 7, along the south road, round the west car park (09), and back up outside the west road. Every road that crosses the line gets a gap: these are the gates (the main road's entries by North 1 and North 2, the ring and south roads, the west lot). | [VERIFIED] the owner; A37/A38 show the fence just inside the main road with the posts at the gates; E21 shows it beyond the east lot. [DECISION] the exact line on the other three sides |

## Not changed, and why

| Issue | Status |
|---|---|
| UGMC-010 road edges | Partly: new paving at 05's entrance only. Kerbs and walks on the other routes need each route registered to M1/M2 first. Open. |
| UGMC-011 parking | The lots already have rounded islands, bays and cars. Aisle, edge and young-tree detail per field is not yet registered. Open. |
| UGMC-013 P5 massing | Only the entrance (portal, recess, base) changed. The end masses' depths and the rear faces stay as they were, as the audit requires: no whole-block resize from a ground photograph. Probable; needs a plan or a matching elevation. |
| UGMC-014 finishes | Kept: tan panels with joints on 01/03, off-white panels, blue-grey glass. The tower ends now have panel joints only. |
| UGMC-015/016 Women & Children, crescent garden | Unverified in the game flight. Not changed; they need matched frontage and garden views. |
| UGMC-017 bridges | Already open below on slender supports (batch 136). Endpoints were not re-surveyed. |
| UGMC-018 training centre, security posts | Unverified. The posts stay where the owner placed them (North 1 east, North 2 north-west). They now stand inside the fence's gates. |
| UGMC-019 interiors and auxiliary views | Support only. Nothing was attached. |

The comparison sheet is `audit-sheet.jpg`: real, game before, game after.

## Tests run
- `npx tsc --noEmit -p .` ok.
- `npm run -s test:routes` ok. Ride lengths are unchanged against the last lens record.
- NaN scan round UGMC: 7199 meshes, none bad.
- Road-blocking scan of every road in the precinct (solids and mesh collision on the centre lines): none blocked inside
  the fence. Three WAGMC-side tracks outside it (roads 1349, 1352, 1354, u > 170) report hits from earlier batches;
  this batch did not touch them.
- Stuck scan: the only blocked cells beside roads are real geometry (the fence's kerb and posts, the shrub bed, the
  bench, walls, the roundabout's planting) and WAGMC-side features from earlier batches.
- The fence line against every mapped building: none within 1 m. Its south-east corner was pulled in to clear the
  E-shaped building beyond the ring road, and the gap there lets road 958 through.
- `npm run -s build` ok; `npm run -s smoke` ok.
