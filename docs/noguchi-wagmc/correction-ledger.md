# Noguchi and WAGMC: the owner's correction brief (batch 151)

Source: *Noguchi WAGMC Environment And Building Correction Brief* (29 pages, S01-S20, read page by page). Registration:
the brief's satellite views were matched to the earlier Apple view M1 (2.617 px/m, north up, `evidence-ledger.md`); every
trace below is in M1 pixels converted to game metres. Matched views: `correction-sheet.jpg` (real left, game right);
overhead: `correction-overhead.jpg` (M1 left, game top view right). Labels: VERIFIED (seen in the brief's pictures),
DECISION (the brief says so), ASSUMPTION (estimated).

## Identity (resolved before editing)
- WAGMC, the old square courtyard institute, the Advanced Research Laboratories and the red-roofed cluster stay separate.
- [VERIFIED] The laboratories' entrance portal faces **west**, toward the sign island (S20, S12, M1: the white portal
  frame on the west face, the kerbed lawns in front). The long pier facade of S08/S20 is the west face; the finned
  facade of S08 (left), S15 and S19 is the north face.
- [VERIFIED] The signed tower is the white building just **north of the north-west corner** (M1's white roof; S09 and S10
  show it standing apart at that end; S15/S19 show its sign face with the finned north face beyond). The game had a
  signed end at the east end instead; that east block is now the flat white rear volume S09 shows.
- [VERIFIED] The WAGMC label in S16 is anchored at WAGMC's forecourt, 230 m beyond the laboratory; it lines up over the
  laboratory only from that camera. Not moved.

## Ledger
| Group | Source | Done | Label |
|---|---|---|---|
| WAGMC compound | S02, S18, M1 | east boundary on the angle (u 27.7 at the road to 17.3 at the south wall) with the red earth strip outside it | VERIFIED |
| WAGMC parking | S01/S02, S05 | the broad apron replaced: elongated asphalt parking from the road gap to the south-east strip, aisles with the boundary's slant; rows of bays along the east edge, both sides of the kerbed planted strip (rounded end) and by the lower grass; the round kerbed island; the grass east of the parking in a kerb; the angled row along the south-east strip; pale paving along the west wall; lawn elsewhere; cars only in bays | VERIFIED layout; bay counts ASSUMPTION |
| WAGMC gate structure | earlier drone frames | moved to the parking's north-east corner, clear of the bays | ASSUMPTION |
| Loop (S03/S04) | S04, M1 | the mapped figure of eight through the lawn replaced by one rounded paved loop (traced), entered at its top; the road no longer crosses it; tree clump in the west half, one big tree over the middle, kerbed lawn; cars along the outer south and north edges; the track south of it earth | VERIFIED shape; tree heights ASSUMPTION |
| Red earth corridor (S17/S18) | S18 | both tracks of the corridor west of WAGMC earth (the second track added), soil either side, the tree belt between left green; the strip down WAGMC's east side (re-traced 6-15 m east of the mapped service road, which ran through the compound), its branches into the cluster | VERIFIED |
| Red-roofed cluster | S02, S18, M1 | five mapped outlines reshaped onto their roof patches (the red T in two parts, the grey roof, the pink pair, the teal roof); three unmapped roofs added (small salmon, long salmon, dark grey); mixed soil and scrub ground | VERIFIED positions; heights (one storey) ASSUMPTION |
| Laboratory roof and rear | S08, S09, S12 | one hipped dark roof over the L (overhang, dark fascia), the north arm's roof dying into the west arm's; the service block and the taller east block flat and white with fins and plant | VERIFIED |
| West face | S08, S20 | from north: the portal, the wide dark upper bay over it (slats at its north end), a wide blank pier, then 12 bays of a 2.25 m pier standing 0.45 m out and a 1 m slot with a framed window a floor, a dark spandrel and a grey shelf under each window | VERIFIED type; count read from S08 (12) |
| Portal | S08, S11, S20 | thick pale frame standing 4 m out with side returns, three grey inner columns between the two door pairs, two canopy strips stepping back, plant on top, recessed dark glazing, dark tiled entry floor, the drive moved 3 m west (it ran through the frame), a zebra crossing from the walk | VERIFIED; depths ASSUMPTION |
| North and inner faces | S08, S15, S19 | narrow white fins every 1.6 m over dark louvres | VERIFIED |
| Tower | S09, S10, S15, S19 | four storeys, blank pale walls; raised separate letters NOGUCHI over ADVANCED RESEARCH LABORATORIES, left aligned on the west face (no plates); three small windows; three stacked landings with dense bar rails and a return wall on the north face, doors behind; a ground stair with treads, stringer and rail to the first landing; low block beside it | VERIFIED features; storeys, the stair's run and the low block ASSUMPTION |
| Sign island | S20, M1 | two kerbed rounded lawns with the pale walk between them to the portal; the framed monument with a rough inset face and raised stacked letters; shrubs in a soil bed round it; the yellow flower band; short black bollards | VERIFIED |
| Parking by the tower | S15 | block paving with white bays kept, split either side of the tower | VERIFIED |

## Tests run (actual)
- typecheck, route tests ok, challenge routes unchanged (lens identical), build, smoke ride.
- No non-finite vertices in the scene.
- Stuck-bike scan over x 180-620, z 1700-2020: the new points are all against real walls (WAGMC's west and east
  boundary walls beside the tracks, the laboratory's north face within a metre of the mapped road, the portal legs).
- Frame (software renderer, 1280 x 760): laboratory front 348 draw calls / 8 ms (before 354 / 9 ms); WAGMC aerial
  199 / 11 ms (189 / 9 ms); loop 235 / 9 ms (237 / 9 ms).

## Unresolved
- Exact storey heights (laboratory 2 x 4.2 m, tower 4 x 4.2 m, east block 3), the stair's extent, hidden faces.
- The cluster's heights and openings; the WAGMC gate structure's real position.
