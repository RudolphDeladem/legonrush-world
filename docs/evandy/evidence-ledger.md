# Evandy Hostel: the owner's reconstruction brief (batch 138)

Source: `docs/handover/uploads/Evandy_Hostel_Annotated_Claude_Reconstruction_Brief.pdf` (43 pages): the game map M1, the
Apple satellite M2, 20 video frames (V1 aerial, V2 internal court, V3 close facade), 13 photographs (R02-R18) and 5
panoramas (P01-P06). The comparison is `sheet.jpg`; the references are in `refs/`.

Code:
- `src/game/evandyplan.ts`: the numbers;
- `src/game/evandy.ts`: the models and the planting;
- `science.ts`, `inEvandy`: the compound's lanes are paved, not asphalt;
- `lbplan.ts`, `evandySpots`: the cars;
- `scripts/geography/med-corrections.mjs`: the two parking areas.

Labels: [VERIFIED] [DECISION] [ASSUMPTION] [INCOMPLETE].

## Registration
- [VERIFIED] M2 registers on the hostel's own roofs at 3.82 px/m, no rotation: x = 470.7 + px / 3.82,
  z = −1413.7 + py / 3.82.
  - The mapped outlines land on the satellite's roofs within about 2-3 m: the pink ring, the three orange pairs, the
    small blocks. They are OSM ways confirmed by Google Open Buildings.
- [INCOMPLETE] On that registration the satellite puts the west road and the bottom road about 12 m closer to the
  buildings than the game's mapped roads.
  - [DECISION] The roads stay as mapped: they carry the routes, and the brief says to keep existing coordinates.
  - As a result the game's frontage, between the fence and the main block, is about 8 m deeper than the real one.
- [DECISION] No outline is moved or reshaped. Every model stands on its mapped outline.
- The overlay of the game's outlines on M2: see the last row of `sheet.jpg`.

## Targets 1-11 (M2)
| # | Target | In the game now | Evidence |
|---|---|---|---|
| 1 | Lower frontage pair, the main block | Two wings (osm:way/719059759, …761) with the entrance bay between them | R03, R08, P01-P04 |
| 2 | Inner pair | Two wings (…760, …762) behind the narrow inner courts | V1, M2 |
| 3 | Upper pair beside the pink ring | Two bent bars (…763, osm:way/1138519162), each as its two arms | V1, M2 |
| 4 | Pink-roof courtyard ring | Plain cream walls, pink hipped roofs, the court open and gravelled; no name, affiliation unresolved | V1, M2, R16 |
| 5 | Tree-centred court | Kept open: the big tree on red soil, circular paving round it | V1, M2 |
| 6 | Paved frontage strip | Circular paving, cars along the fence, oval islands | P01, R11, R14 |
| 7 | Map-left road | Unchanged (see Registration) | M1, M2 |
| 8 | Bottom road | Unchanged; the fence, gate and sign face it | M1, M2, R02, R18 |
| 9 | Unfinished open frame | Grey concrete columns and slabs, 4 levels, no roof, on its red-earth yard | M2, V1 18.00 s |
| 10 | Open dirt field | The sandy field painted irregular, the scrub and trees round it | M2, V1 |
| 11 | Small lower-edge roof | The two-storey commercial block (osm:way/1184497717) | R06, R13, P04, P05 |

## Buildings
- [VERIFIED] The wings:
  - light cream walls; recessed balcony modules with real slabs, solid lower walls, side walls and dark patterned
    railings;
  - narrow louvred windows, and wide louvred windows on the main front's ground floor;
  - open gallery elevations toward the inner courts;
  - small gables with arched recesses over every second balcony module;
  - terracotta hipped roofs and downpipes.
- [VERIFIED] The front wings and the entrance columns carry warm ochre vertical strips (R18, V3). R08 shows them pale:
  the photographs record different dates.
- [VERIFIED] The west stair end (outline 734): stacked small balconies on its end, red perforated-brick ventilation
  panels on its sides (R04).
- [DECISION] The small east link (2894) has the same ventilation sides.
- [VERIFIED] The main entrance bay between the frontage pair:
  - paired columns;
  - three bands of gold-framed glazing with outward-opening awning panes;
  - the peaked pediment with its arch and the readable lettering UG · EVANDY · HALL (R08);
  - MAIN BLOCK over the recessed door, shallow steps, planters.
  - The bay stands between two mapped outlines, so its walls are made solid separately.
- [VERIFIED] The commercial block (R06, R13):
  - two storeys under a red roof, with a central gabled arch;
  - round cream columns, the open upper gallery with a light gold looped railing;
  - shopfronts with grilles behind a raised threshold.
  - [DECISION] The shop boards are neutral; their text is not legible.
- [ASSUMPTION] Heights: every residential wing and the ring are ground plus three. R03/R08 confirm this for the main
  frontage. The internal wings' tiers and the ring's height are not separately confirmed.

## Frontage and grounds
- [VERIFIED] The signature circular paving covers the compound and the aprons before the gate and the shops: large
  grey-beige discs in reddish-tan joint, as a texture.
- [VERIFIED] The west yard:
  - grey gravel with red-earth patches;
  - the green basketball slab (the mapped pitch) with one hoop. Its line markings are not drawn: they are not legible.
- [VERIFIED] The oval islands in pale kerbs, with shrubs and spiky plants (R11, R14, P01).
- [VERIFIED] The fence along the road: a low pale wall, square posts with caps, dark vertical bars with pointed tops.
- [VERIFIED] The gate area (R02, R18, P05, P06):
  - the gate between lamp pillars, its two leaves swung open;
  - the curved pale wall to the commercial block;
  - the cream gatehouse with its red hipped roof, door, window and step pad;
  - the notice shelter;
  - the blue EVANDY HOSTEL sign outside.
- [VERIFIED] The order along the road from west to east: shelter, gatehouse, gate, curved wall, commercial block.
- [VERIFIED] The cars stand in the frontage along the fence and before the shops. The compound's internal lanes are
  paved; the routes are unchanged.
- [VERIFIED] The court tree, the trees in the inner courts, the shrubs below the frontage windows; scrub and trees
  east of the compound round the open sandy field.

## Checks
- Unchanged: route lengths (lens).
- Passing: the route tests, the build and the smoke ride.
- Collision sweep over the compound: only the islands and a visible bench block the roadside.
- Performance, before → after (software renderer, same cameras): aerial 171 → 212 draw calls, 334k → 502k triangles,
  13 → 9 ms; frontage 138 → 178 calls, 359k → 561k triangles, 11 → 8 ms. The wings are merged across models by
  material (`medkit.ts` `mergedSite`).

## Unresolved
- [INCOMPLETE] The roads-to-buildings offset described under Registration.
- [INCOMPLETE] The pink ring's affiliation and the unfinished frame's status.
- [INCOMPLETE] The exact court adjacency of the V2 and V3 views.
- [INCOMPLETE] The internal wings' storey counts.
- [ASSUMPTION] The small mapped outline 735 behind the commercial block keeps a generic finish.
- The scaffolding in V3 is left out, as a temporary condition.
