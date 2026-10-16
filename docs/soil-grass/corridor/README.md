# Soil, grass and pavement: revised correction order (Total to Okponglo Second Gate)

Source: the owner's revised brief `Legonrush_Soil_Grass_Correction_Brief_1.pdf` (58 pages). New instructions R-1 to
R-14 are followed by the retained evidence E-1 to E-44. All pages were read. The PDF stays in the owner's private
archive.

## Scope (R-2, stage 1)

The endpoints are taken from the project's own geography (`data/geography/legon-master.geojson`), converted to game
metres with the map's projection:

| Anchor | lat, lng | game x, z |
|---|---|---|
| Total | 5.647492, -0.178974 | 900, 476 |
| Okponglo (junction) | 5.640796, -0.178149 | 992, 1217 |
| Okponglo Second Gate | 5.6377339, -0.1773751 | 1077, 1555 |

- **Corridor:** the N4 (J.J. Rawlings Avenue) from z 476 to z 1555, every grass and soil area on both sides out to its
  real boundary (building, wall, fence, path), the median, and the junction's corner verges.
- **Segments:** 13 segments S01 to S13, 90 m apart, centred at z 480, 570, ..., 1560.

## Root cause (R-5, SOIL-07)

The corridor's soil came from two generators, each drawing a separate sheet over the terrain grass:

1. **`drapeAt`** (`kuffourgarden.ts`) with the `groundCover()` material: flat vertex colours, no texture, 3 cm over the
   ground. Its "grass" was a flat green unlike the terrain's textured grass, so every drape read as a sheet laid on the
   lawn. Its colour rules switched between two or three tones at hard noise thresholds, which gave the camouflage
   blotches, stamps and pale mottled plots.
2. **`coverOverlay`** (`scrubkit.ts`): a painted, partly transparent canvas texture, again a separate sheet.

Instances found in the corridor by instrumenting both generators in the running build: 20 drapes and 4 overlays.

| File | Instance (box x0-x1, z0-z1) | What it was | Action |
|---|---|---|---|
| `labawaleshie.ts` | the neighbourhood east of the N4 (990-1462, 958-1648) | camouflage of earth, pale "forecourt", green | soil ground |
| `labawaleshie.ts` | the scrub west of the N4 (860-985, 880-1186) | path band, flat green, dark green | soil ground (path bare, verge grass, scrub floor patchy) |
| `labawaleshie.ts` | the stadium-side verge (935-1060, 1262-1630) | three-tone blotches | soil ground, mostly grass |
| `labawaleshie.ts` | the 4 junction corner verges | pale stone and orange | soil ground |
| `okponglo.ts` | the median (905-1640) | bare patches as separate colour | soil ground |
| `okponglo.ts` | the bank by the stadium (960-1030, 1288-1426) | path, two tones | soil ground |
| `okponglo.ts` | First Eye Plaza frontage (996-1013, 1112-1196) | **soil 8 cm up on the slab paving** | **removed** (R-4) |
| `okponglo.ts` | the sign shop forecourt | gravel and soil two tones | soil ground (gravel over soil, no grass) |
| `okponglo.ts` | the strip behind the east footway (1258-1474) | two tones | soil ground |
| `okponglo.ts` | the McDan lane verge by Diamed | flat green, soil | soil ground |
| `legonfirst.ts` | the station forecourt (858-928, 432-512) | worn concrete with flat green islands | paving kept; islands moved to soil ground |
| `legonfirst.ts` | the raised plot's access (870-990, 499-608) | hard apron, gravel, scrub | apron kept as paving and cut at the road edge; plot to soil ground |
| `legonfirst.ts` | the divider between the carriageways | asphalt | kept (hardscape) |
| `legonfirst.ts` | the planted strip west (800-912, 410-860) | tones | soil ground |
| `legonfirst.ts` | the ground over the retaining wall (770-880) | three tones; covered the footpaths | soil ground; the footpaths now show |
| `legonfirst.ts` | the east scrub (880-990, 608-700) | rock and three tones | soil ground (rock patches grey) |
| `okgate.ts` | the bare plot by the Okponglo gate | overlay | soil ground |
| `jjyard.ts` | the yard, the opening, the field, the earth track | 3 overlays | soil ground |

The campus areas in the corridor (car parks, pitches, woods, a plaza) were checked and hold no soil.

## The repair (R-6, R-7)

The new shared module is `src/game/soilground.ts`.

- **One grass:** `campusGrass()` and `terrainGrass()` are the terrain grass, now one texture instance shared with the
  soil (`world.ts` uses them).
- **One surface:** `soilGround()` is the same material as the terrain grass, with a soil blend on top.
- **`soilMesh(org, box, cell, e, tone)` follows the ownership model directly:**
  - **P** = `onHardscape`: every mapped road, lane and footway at its drawn half width, plus the N4's widened
    carriageways. P is applied before geometry is built, and cells are cut along its true curve.
  - **U** = the site's region (`e` is not null) minus P.
  - **E** = the exposed-soil coverage `e`, a smooth field.
  - Where E is 0 the mesh draws the terrain's own grass, with the same texture, the same world mapping and the same
    large patches. It is indistinguishable from the ground round it, so it has no rim, edge or sheet.
  - Where E rises, the soil shows. Its boundary is broken up at several world scales, the grass's darker blades hold on
    over its margin, and partly bare ground is a mix of clumps and bare spots. Only fully bare ground is plain soil.
  - The mesh lies on the ground height, 2.5 cm up, with the terrain's own depth offset: no excavation, no trench, no
    raised plate. It has no collision, and ground collision is unchanged.
- **Every corridor instance above was converted**, and the old overlay calls are gone from the corridor.
- **Soil colour:** a muted dusty red-brown with grain.
- **Out of scope:** areas outside the corridor still use the old generators, unchanged (R-7: scope limited to the
  named corridor).

## Coverage ledger (R-10)

**Views**
- Overhead at 95 m and rider height in both directions (southbound on the west carriageway, northbound on the east)
  for every segment: `segments-1.jpg` to `segments-7.jpg`, before beside after.
- Low grazing and outward views of the deep plots: `grazing-and-outward.jpg`, `grazing-retakes.jpg`.

**Status after this change** (all rendered from the current code)

| Segment | Left (west) | Right (east) | Median / islands |
|---|---|---|---|
| S01 z 480 (Total) | VERIFIED PASS: planted strip, scrub over the retaining wall; footpaths visible | VERIFIED PASS: station forecourt paving, its islands (grazing retake) | VERIFIED PASS: asphalt divider |
| S02 z 570 | VERIFIED PASS: planted strip, wall scrub | VERIFIED PASS: raised plot, apron cut at the road | VERIFIED PASS |
| S03 z 660 | VERIFIED PASS | VERIFIED PASS overhead; the east scrub's floor is hidden by dense shrubs at low height (grazing retake) | VERIFIED PASS |
| S04 z 750 | VERIFIED PASS | VERIFIED PASS: dusty opening broken up, edge wanders | VERIFIED PASS |
| S05 z 840 | VERIFIED PASS: yard floor (pale compacted soil, legitimate) | VERIFIED PASS: opening | VERIFIED PASS |
| S06 z 930 | VERIFIED PASS: yard, earth track | VERIFIED PASS | VERIFIED PASS: median soil in its kerbs |
| S07 z 1020 | VERIFIED PASS: scrub path and floor | VERIFIED PASS: neighbourhood | VERIFIED PASS |
| S08 z 1110 | VERIFIED PASS: scrub (grazing) | VERIFIED PASS: plaza slabs now clear | VERIFIED PASS |
| S09 z 1200 (junction) | VERIFIED PASS: gate plot (grazing) | VERIFIED PASS: corner verges, sign shop forecourt | VERIFIED PASS: noses, no soil on the crossings |
| S10 z 1290 | VERIFIED PASS: stadium verge, bank | VERIFIED PASS: neighbourhood, strip behind footway | VERIFIED PASS |
| S11 z 1380 | VERIFIED PASS: stadium verge (grazing) | VERIFIED PASS: strip by the Diamed wall (grazing retake) | VERIFIED PASS |
| S12 z 1470 | VERIFIED PASS | VERIFIED PASS: neighbourhood (grazing retake) | VERIFIED PASS |
| S13 z 1560 (Second Gate) | VERIFIED PASS | VERIFIED PASS | VERIFIED PASS |

## Acceptance gates (R-9)

| Gate | Result |
|---|---|
| G1 scope | PASS: z 476 to 1555 in 13 segments with no gap; the views overlap |
| G2 both sides | PASS: left and right inspected to their walls, fences and plot edges, overhead and outward |
| G3 soil under grass | PASS: no sheet over turf; where E is 0 the surface is the terrain grass itself |
| G4 protected surfaces | PASS: P mask on every soil mesh; the plaza-slab soil removed; the apron cut at the road; footpaths in the wall scrub now uncovered |
| G5 full footprint | PASS: cells are cut along P's and the region's true edges (no bounding boxes) |
| G6 ground continuity | PASS: on the ground height, no trench; collision unchanged; camera check: 0 views inside buildings |
| G7 persistence | PASS for the states the game has: the ground is built once per load, with no LOD, streaming or saved instances; the same code builds every load |
| G8 proof | before and after images above |

## Checks

- Typecheck, geography, route tests and build pass.
- Route lengths are unchanged.
- The camera check reports 0 views inside buildings.

## Open or uncertain

- Frame rate was not measured. The soil meshes replace the old drapes one for one, with the same cell sizes or finer
  (one extra texture lookup in their shader).
- The pale "dusty opening", the yard floor and the sign shop's gravel forecourt are kept as soil-family ground, as the
  earlier briefs described them. Whether any of them is really paved is not established.
- The station forecourt's mapped lane (a dark L) now shows through the worn concrete where the apron used to cover it.
  It is a mapped road.
