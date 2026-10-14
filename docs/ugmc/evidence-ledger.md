# UGMC precinct: the owner's reconstruction brief (batch 136)

Source: `docs/handover/uploads/UGMC_Detailed_Annotated_Claude_Reconstruction_Brief.pdf` (49 pages: maps M1-M3, aerial
frames A01-A47, photographs E01-E42). The comparison is `sheet.jpg`; the key reference images are in `refs/`.
Code:
- `src/game/ugmcplan.ts`: the numbers;
- `src/game/ugmc.ts`: the model;
- `src/game/ugmcground.ts`: the planting;
- `src/game/medkit.ts`: shared pieces;
- `scripts/geography/med-corrections.mjs` and `.py`: the map corrections.

Labels: [VERIFIED] [DECISION] [ASSUMPTION] [INCOMPLETE].

## Registration
- [VERIFIED] Google satellite M1 registers on the game map at 2.55 px/m, no rotation:
  x = −155.5 + px / 2.55, z = 1933.7 + py / 2.55.
  - The game's roads land on the satellite's: the roundabout, the drop-off loops, the ring roads and the main road.
  - The scale bar agrees: 50 m ≈ 128 px.
- [DECISION] The precinct's own frame:
  - U runs along its grid (bearing 30° north of east), V across it;
  - the origin is the main roundabout.
  - Footprints were traced on that grid from M1, using ground edges, not leaning roof tops.

## Buildings (all on their real positions; the existing ids kept, their outlines reshaped to the traced rings)
| # | Block | Map id | Form | Height |
|---|---|---|---|---|
| 01 | Central Emergency & Diagnostics | osm:way/1153076179 | Tan clinical core. Its corner is cut by the concave dark curtain wall round the drop-off loop. Silver canopy with radiating braces; the "1 Emergency & Diagnostics" sign with a gold badge. The roof: chillers, ducts, the raised enclosure and the angular covered run. West drop-off canopy. | 4 storeys [ASSUMPTION from A03-A17] |
| 02 | Women & Children | osm:way/1252865624 | White wings with grey bands; ribbon windows on the garden side, discrete windows on the parking front. The dark bowed signed bay, the raised dark gridded sloped roof, the low portal over the curved drive, the green "2". | 4 storeys; inner block 2 |
| 03 | Outpatients & Administration | osm:way/1114966056 | Tan wings round an open lawn court with a diagonal path. The bowed dark curtain wall at the corner facing the roundabout; the canopy on silver posts with triangulated rods; the "3" sign. | 3 storeys |
| 04 | Medical Training & Simulation Center | osm:way/1114966057 | White flanks with narrow window groups; the tall dark central bay with the sign; the glazed entrance spread and its light canopy; the gridded roof feature. | 3 storeys |
| 05 | Patient Tower group | osm:way/1252865623 | White wings round courts. Tall near-blank ends either side of a recessed dark bay and the low "Patient Tower" entrance; the lattice mast; the "5" badge. | 4 storeys, ends 6 [ASSUMPTION from E24, E41] |
| 06 | Long low building (use unresolved) | osm:way/1138714888 | Light grey cladding under a shallow grey roof. | 2 storeys [ASSUMPTION] |

- The enclosed dark glazed bridges stand on slender supports, with open ground below: 02 to 01, and 01 to 03.
- Four detected fragments inside 02 and 03 are excluded, so the blocks stand whole.
- The surrounding small blocks take white walls and light flat roofs instead of generic red pitched roofs
  (`world.ts` `medStyle`).

## Grounds
- **Car parks:**
  - three lots (07 the north lot, 08 east of 05, 09 the large west lot) added as parking areas;
  - dark asphalt, white bays at 2.6 m, rounded beige islands with young trees;
  - cars only in bays (`lbplan.ts` `parkingSpots`).
- **Roundabout and loop:**
  - the roundabout's tan apron, white stone ring and dense low planting;
  - the drop-off loop's lawn with five flagpoles;
  - the UGMC letters planted in the lawns between 02 and 01.
- **Garden 10:** lawn, the crescent white-stone bed, the curved grey path with benches on pads, the clipped hedge
  along the road edges, thin tan strips.
- **Furniture:** the security posts (booths with oversailing roofs), the wayfinding totems, the hydrants.
- **Woodland:** the woodland outside the precinct to the west and north.

## Unresolved
- [INCOMPLETE] Exact storey counts, roof equipment layouts and the materials of the gridded roof features.
- [INCOMPLETE] 06's use.
- [INCOMPLETE] Which security post is North 1 and which is North 2.
- [ASSUMPTION] 09's bay rows are drawn at even spacing. M1 is soft there.
