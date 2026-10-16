# Okponglo junction: strict correction (owner's brief of 2026-10-16)

Brief: `LEGONRUSH_Okponglo_Junction_Strict_Correction_Brief.pdf`, 23 pages. All 23 pages were read. The brief stays
private; only this derived record is in the repository.

The authority order follows page 2. D-01 (page 3), the locked counts (page 4) and U-01 (page 23) govern. The game's
earlier map, road mesh and lane paint were the before-state, not the target.

## What produced the error (RD-011)

The junction's road was not one controlled thing. Four sources produced it:

1. **The mapped road ribbons (`world.ts`).**
   - The N4's two one-way carriageways were drawn at their mapped 9 m and widened inward to the median
     (`lbplan.ts n4Widen`). That made a uniform 13.7 m from z 905 to z 1640, painted as three lanes the whole way: no
     widening and no merge.
   - The mapped slip roads (Jubilee Drive 865/867, La Bawaleshi Road 864/866) were drawn as separate diagonal ribbons
     through the corners.
   - The side roads were drawn as short separate carriageways (1091, 872, 868, 1094, 871, 1093) plus connectors across
     the box (754, 760, 869, 996, 986, 1090, 1096, 759, 1097).
2. **A "paved core" (`labawaleshie.ts`).** It filled whatever lay between those ribbons with asphalt, so the junction
   became a large square with no lane layout.
3. **The ridden route's own road layer (`world.ts buildRouteLayer`).** A tour or ride through Okponglo laid a 7.6 m
   road with white edge lines and **raised 0.12 m kerbed pavements** along the mapped slip-road line.
   - That is the band bending sideways across the junction mouth (E1, page 5).
   - Its kerbs are the thin raised strips between the turning lane and the road (RD-008, RD-010).
4. **The game map (`ui/mapview.ts`).** It drew the mapped slip roads and connectors as strokes, so it kept the old
   layout.

## What changed

All four sources now read one plan, `src/game/okjplan.ts`.

| Source | Change |
|---|---|
| `okjplan.ts` (new) | The zone ledger, each carriageway's lane count along its length (widenings, merges), the concrete bay, the side arms' cross-sections, the four rounded corners, the stop lines and crossings. Queries: `okjSurface` (asphalt or bay), `okjOwns`/`okjRuns` (which mapped roads it replaces, and the cuts of all other roads at its kerb), `OKJ_SEGS` (clearance capsules), `okjMapPolys` (map), `okjIslands` (signal spots). |
| `okjunction.ts` (new) | Builds the asphalt (appended to the N4's road mesh, same material and lowering), the concrete bay mesh and all paint from the plan. |
| `world.ts` | The mapped N4 between z 905 and 1640, the junction's side-road pieces and slip roads are no longer drawn, and every other road is cut exactly at the new kerb. The N4 centre dashes there are gone (the plan paints the lanes). The route layer lays no road, lines, kerbed pavements, trees or lamps over the junction's road: the ride uses the real road. |
| `labawaleshie.ts` | The paved core and the old zebras, stop lines, arrows and yellow lines are removed. Clearance uses the new road. The signal posts stand on the new corner verges and the pulled-back median noses. The scrub and stadium-verge kerbs follow the new edge, round the bay. |
| `lbplan.ts` | `MEDIAN.gap` is now 1179.5 to 1257 (U-01). The mast-arm reaches span the new middle lanes. |
| `life.ts`, `soilground.ts` | Props, verges, drains and soil keep off the new road (`OKJ_SEGS`). No verge or drain strip is drawn on it. |
| `okponglo.ts` | The east frontage (plaza slabs, sidewalk, walls) starts at the new kerb. Where zone 4 widens, the frontage moves out with it. The sign shop's forecourt fence follows the rounded south-east corner. |
| `ui/mapview.ts` | The map draws the junction from the plan, true to scale, with the bay in concrete. The mapped slip roads and connectors are no longer on it. |

## Zone ledger (RD-001)

Coordinates are game metres (x east, z south). D-01's page-up is north. Traffic keeps right.

| Zone | World location | Direction | Far | Near | Transition (source) |
|---|---|---|---|---|---|
| 1 | N4 west carriageway, north of the junction | toward | 3 | 5 = 4 middle + 1 outer (top-left route to zone 6) | widening z 1090 to 1130 (RW-02 red marker, ~100 m north, by the GRA block) |
| 2 | N4 east carriageway, north | away | 3 | 4 = 3 middle + 1 joining outer (top-right route from zone 3) | merge z 1140 to 1110 |
| 3 | La Bawaleshi Road, east arm | two-way | 2 total (1 + 1) | 5 total = 2 in + 1 out middle + 2 outer (to zone 2; from zone 4) | taper x 1033 to 1055; joins the mapped road at x 1066.2 |
| 4 | N4 east carriageway, south | toward | 3 | 5 = 4 middle + 1 outer (bottom-right route to zone 3) | widening z 1340 to 1300 (RW-04 violet markers) |
| 5 | N4 west carriageway, south | away | 3 after the stop | 4 asphalt (3 + the outer lane from zone 6); 4 asphalt + 1 concrete along the bay | bay z 1307 (red) to 1422 (green), entry and exit tapers 15 m; outer lane merges z 1422 to 1447 |
| 6 | Jubilee Drive, west arm (taxi-rank side) | two-way | 2 total (1 + 1) | 5 total = 2 in + 1 out middle + 2 outer (from zone 1; to zone 5) | taper x 950 to 928; joins the mapped road at x 923.2 |

Other built values:

- **Lanes:** N4 lanes are 3.5 m. Arm lanes are 3.3 m near the junction and 3.7 m far out, so two lanes match the mapped 7.4 m road.
- **Median:** 2.4 m, alignment unchanged.
- **Corners:** kerb radius 12 m. The corner lane's guide is concentric, one lane in.
- **Stop lines:** zone 1 at z 1193.5, zone 4 at z 1243.5, zone 6 at x 955.5, zone 3 at x 1031.
- **Crossings:** beyond each stop line.
- **Junction centre:** (994.5, 1224.4).

## Counts as built (RD-002 to RD-007, RD-012)

`npx --yes tsx scripts/okj-counts.ts` counts the painted lines across a section, tracking each line ±4.6 m along
the road so dashes are not missed; arrows, stop lines and crossings are excluded. It also measures the asphalt and
concrete widths across the section. Output:

| Zone | Section | Built | Required |
|---|---|---|---|
| 1 | far, z 1050 | 3 lanes, 10.7 m | 3 |
| 1 | near, z 1150 | 5 lanes, 17.7 m | 5 = 4 + 1 |
| 2 | near, z 1175 | 4 lanes, 14.2 m | 4 = 3 + 1 |
| 2 | far, z 1080 | 3 lanes, 10.7 m | 3 |
| 4 | far, z 1390 | 3 lanes, 10.7 m | 3 |
| 4 | near, z 1290 | 5 lanes, 17.7 m | 5 = 4 + 1 |
| 5 | near, z 1285 | 4 lanes, 14.2 m | 4 asphalt |
| 5 | along the bay, z 1360 | 4 lanes, 14.2 m + concrete bay 3.1 m | 4 asphalt + 1 concrete |
| 5 | after the stop, z 1470 | 3 lanes, 10.7 m | 3 |
| 6 | near, x 951 | 5 total (2 westbound + 3 eastbound), 16.6 m | 5 total, 1 out + 2 in middle |
| 6 | far, x 925 | 2 total (1 + 1), 7.4 m | 2 total |
| 3 | near, x 1034 | 5 total (3 westbound + 2 eastbound), 16.7 m | 5 total, 2 in + 1 out middle |
| 3 | far, x 1064 | 2 total (1 + 1), 7.4 m | 2 total |

## Completion record

| Issue | Status | Files and data | Evidence |
|---|---|---|---|
| RD-001 source ledger | implemented | `okjplan.ts` header and `ZONES`; this file | ledger above |
| RD-002 zone 1 | implemented, verified | `okjplan.ts westLanes`, `okjunction.ts` | counts; `overhead-master.jpg`, `transitions.jpg` |
| RD-003 zone 2 | implemented, verified | `okjplan.ts eastLanes` | counts; `transitions.jpg` |
| RD-004 zone 3 | implemented, verified | `okjplan.ts armLanes/armEdges` | counts; `corners.jpg` |
| RD-005 zone 4 | implemented, verified | `okjplan.ts eastLanes` | counts; `transitions.jpg` |
| RD-006 zone 5 and bay | implemented, verified | `okjplan.ts bayWidth/bayOuter`, `okjunction.ts` bay mesh | counts; `bay.jpg` |
| RD-007 zone 6 | implemented, verified | `okjplan.ts armLanes/armEdges` | counts; `corners.jpg` |
| RD-008 outer routes, no thin separators | implemented, verified | `okjplan.ts CORNERS`; `world.ts` (slip ribbons and route kerbs removed); `life.ts` (no verge or drain on the road) | `corners.jpg`; obstruction and collision scans below |
| RD-009 alignment | implemented, verified | the N4 follows its mapped median line; arms follow the mapped roads and join them at their nodes | `overhead-master.jpg` |
| RD-010 materials and joins | implemented, verified | asphalt carriageway; concrete bay flush beside it (no kerb across its ends); median kerbed; outside pavement and verges follow the new kerb | `bay.jpg`; scans |
| RD-011 recurrence | implemented, verified | one plan feeds the mesh, paint, map, route layer and clearance; the earlier core, slip ribbons and N4 widening are no longer drawn | rebuilt from source; `map.jpg` |
| RD-012 verification | see Checks | | |
| RD-013 median tips | implemented, verified | `lbplan.ts MEDIAN.gap` 1187→1179.5 (upper, 7.5 m back), 1240→1257 (lower, 17 m back); kerb, soil, planting, boards and signal masts follow the gap | `median-tips.jpg` |

## Calibrated, not surveyed

D-01 is schematic, so the following are estimates rather than survey values:

- **Transition positions.** These were read from the owner's marked satellite views by their landmarks (RW-02: the
  Ghana Revenue Authority; RW-04: MoneyGram, Tasty Queen, Leasafric, NEWSZN). The image scale was estimated from the
  N4's width, about 0.4 m per pixel.
- **Lane widths, corner radius and taper lengths.**
- **Median tips.** These sit about 13 to 14 m before the stop lines, as U-01's purple lines do relative to the junction.
  The upper tip moved 7.5 m and the lower tip 17 m, because the lower stop line moved south with the wider south-west
  corner. Each tip is clearly past its old white-arrow end.
- **Middle-lane arrows.** These keep the earlier pattern: left by the median or divider, straight in the others. D-01
  does not settle them. The corner lanes carry right-turn arrows, which D-01's red routes do define.
- **Zone 5 exit order.** The bay's exit taper (z 1407 to 1422) comes before the outer lane's merge (z 1422 to 1447).
- **Bus shelter.** No bus shelter is modelled at the bay: the game had none there, and the brief says not to design one.

## Checks (RD-012)

Ran and passed:

- **Typecheck:** `npx tsc --noEmit -p .`
- **Project tests:** `npm run test:rooms`, `npm run geo`, `npm run test:routes`, `npm run build`.
- **Camera check:** 437 places, 0 views inside buildings.
- **Route lengths:** unchanged from before this work (`.preview/lens.mjs`).
- **Count gates:** all 13 sections above (`scripts/okj-counts.ts`, run on the built paint).
- **Collision on the road:** the game's own solids and mesh colliders were sampled every 0.5 m over the whole new road
  surface (59,896 points, `.preview/okjcoll.mjs`). Result: **0 blocked**. The first run found and led to these fixes:
  - the stadium-side banks' stone faces inside the zone 1 widening and the zone 5 bay (`okplan.ts`: they now keep their
    distance from the new kerb);
  - the median's red board on the removed tail (`okponglo.ts`);
  - the street lamps' invisible night-glow cones, which the mesh collider counted as solid everywhere on campus
    (`life.ts`: now non-colliding).
- **Renders:** overhead before and after, every transition, all four corners, the bay's entry, surface and exit, both
  median tips, rider-height passes along the four approaches and a corner lane, the game map, and a ride through the
  junction (`overhead-master.jpg`, `transitions.jpg`, `corners.jpg`, `bay.jpg`, `median-tips.jpg`, `map.jpg`).
  - The renders found the Okponglo drive's low raised separator inside the new zone 6 arm and its footways on the old
    edges. The separator is removed, and the footways follow the new kerbs round the corners (`okgate.ts`).

Not completed:

- **Triangle-level scan for objects under 0.3 m on the road** (a kerb or a low strip). It was written
  (`.preview/okjscan.mjs`) but does not finish under software rendering in this container. Low objects were checked
  through the code paths that draw them (the route layer, the road edges, the separator and the footways) and in the
  renders.
- **Riding the junction by hand in the browser.** The route tests ride every tour, and the collision scan covers every
  lane and corner.
