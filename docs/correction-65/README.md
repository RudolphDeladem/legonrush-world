# Correction brief, 65 slides (2026-10-15): evidence ledger

Source: `docs/handover/uploads/LEGONRUSH_Correction_Brief_Detailed_All_65_Slides.docx` (the owner's brief built on
CORRECTION FILE.pptx, 65 slides), plus the owner's two photos of the Night Market inside (pictures 842-843). Work
packages WP-01 to WP-06. The slides are kept in `slides/` (s01-s65, the full-slide images from the brief's appendix).

Labels: **evidence** (what a slide shows), **change** (what the game now does), **estimated** (a number or place the
sources do not fix), **open** (left for the owner).

| Item | Record / code | Evidence | Change | Kind |
|---|---|---|---|---|
| Long block west of Jubilee Drive (Supermart) | `nightmarket.ts` supermart spec, place "Supermart (Night Market)" | S1 (aerial: All Needs at its north), S2, S3, S5 (low block, braced canopy, grey dado, barred windows, cars in front) | Glass curtain, green fascia and SUPERMART letters removed; white walls over a grey-green dado, barred dark windows, hipped rusty-red sheet roof, lean-to canopy along the road front on dark braces over a paved walk; ALL NEEDS SUPERMARKET board over the doors. The destination keeps its name so routes do not change. | facade, ground, signage |
| Euburger | same spec, north end | S4, S6 (yellow fascia with round food pictures wrapping the corner, grey cladding, service windows, low roof) | Corner unit at the block's north end: yellow fascia on both faces with the name and food discs, grey cladding to the sill, glazed service windows. | facade, signage |
| Market stalls | `nightmarket.ts` market spec | Owner's photos 842-843; S7, S8, S16-S19 | Rows rebuilt as open sheds: white masonry partitions, red piers at row ends, slim black steel posts, silver corrugated roofs on timber purlins, concrete floors; the three roadside shops with blue canopies and roller shutters. Layout and lane widths unchanged (owner's earlier spacing). | structure, material |
| Market ground | market spec | Owner: "don't assume most places are lawn"; photos 842-843; S7, S8 | Block paving over the whole market, its lanes, the walk along the roadside shops and a paved car park before the long block's north end (three cars). | ground |
| Generic kiosks, umbrellas, crowds | `life.ts` busy spots | S16 "REMOVE ALL WRONG STRUCTURES", S7, S8, S19 | No generic busy-spot props in the strip x 40-300, z 900-1110 (market, banking square, Republic Bank, Ecobank, the old market ground). Street trees, lamps and the modelled stalls stay. | props |
| Bank compound west wall | `banking.ts` compound | S3 (continuous wall of windows with AC units, no veranda), S1 roof | West rooms reach the roof's edge (no veranda posts on the west); a row of AC units along the wall's foot. East veranda unchanged. | massing |
| CalBank | `banking.ts` compound; `access.json` "CalBank" | S1 (CalBank in the south-west part), S10-S13 | Porch in the south wing between the south-west bay and UMB's porch: dark louvred gable, yellow band, white columns, white CalBank panel, tiled steps, hedge. Entrance added to the access registry (status partial). **Estimated:** the exact bay. | facade, access |
| UMB | `banking.ts` | Owner's earlier photo (umb_front) | Unchanged (its porch is the owner's earlier evidence; the brief does not show UMB). **Open:** whether UMB still trades there. | — |
| Prudential Bank | `banking.ts` compound; `access.json` "Prudential Bank" (partial) | S14, S15 | Entrance on the north-west block's road face at the map's Prudential point: blue-lettered PRUDENTIAL BANK LTD. board, recessed door with a gilt grille, tiled steps. **Estimated:** the bay; the flagpoles of S14 are not placed (no room before the road). | facade, access |
| Republic Bank and UG Credit Union | `banking.ts` adbHfc spec (the long red-roofed block) | S24 (aerial: long block, ADB to its east, parking west), S25-S27, S34-S36 | West front: grey dado, blue Republic Bank board on the roof edge, ENTRANCE over glass doors, blue ATM pod, UG CREDIT UNION BUILDING letters at the north end, tiled steps, raised beds with white kerbs, flagpoles and a booth at the south end. Kept one range with two identities, as in S25/S26. | facade, signage |
| Republic Bank forecourt | `banking.ts` frontage spec | S25, S27-S32, S36 | Block-paved forecourt with painted bays and three cars; a low rubble-stone wall with coping and steps along the road's footway; the tall blue roadside sign by the steps. **Estimated:** the wall is freestanding (0.85 m) because the game's ground there is flat; the photos show it retaining a raised forecourt. | ground, signage |
| ADB | adbHfc spec, east block | S33 | Its own front on the east block: green columns, the adb board. | facade |
| Ecobank | `banking.ts` union spec (the cross-shaped building), place "Ecobank (near Night Market)" | S40 (aerial), S42-S56 | Roof tiles darker red-brown; door court paved; blue-framed glass doors under the teal Ecobank panel; concrete steps; ramp with blue rails to the ATM under a blue awning beside the door; clipped hedges in kerbed beds before the wings. The lantern and the Union Building's east door are unchanged. | facade, ground |
| Ecobank roadside sign | frontage spec | S42, S46 | Stacked teal panels on a post by the main road (Ecobank, LEGON, HOURS, 24H ATM, Rapidtransfer: only the legible panels), a hedge bed, one Norfolk pine. **Estimated:** the sign's spot along the road. | signage, planting |
| Ecobank parking | — | S48, S50 | **Open:** the loop driveway north of the building matches the curved island of S50, but the bays' exact place is not fixed by the sources; the loop is left as mapped. | — |
| Legon Basic School fence | `basicschool.ts` boundary spec | S21 ("FENCE THE LEGON BASIC SCHOOL"), S22 | The existing railing fence (rubble base, square pillars, black railings) carried round the grounds: La Road west of the stub road, the west side by Barimah Road, the south side inside the southern road, the east side by the road east of the hall, the lane south of the car park and the road from the roundabout; open at every road or lane into the grounds. **Estimated:** the east side's line (no source shows it). | boundary, collision |
| Vikings Hostel | `vikingslaw.ts` vikings spec | S58-S65 | Beige painted corridor replaced by white walls behind 3D balconies (slab with pale underside, solid white parapet, returns, fins every two bays) on both wings' long faces, floors 1-4; barred dark ground-floor openings; deep flat canopy over the entrance block with VIKINGS HOSTEL on its fascia; curved red-brown planter; block paving round the building and over the car park, painted bays, three cars, a kerbed island with a red-leaved plant. Footprint, storeys and entrances unchanged. | facade, ground |

## Checks

See the commit message of this batch: typecheck, geography build, route tests, production build, route lengths
(`.preview/lens.mjs`), the camera check and the bike-blocking checks.

## Open points for the owner

1. Is the CalBank porch in the right bay of the south wing, and is UMB still there?
2. Prudential Bank's flagpoles and forecourt (S14) need a photo showing where they stand relative to the road.
3. Republic Bank's forecourt is raised behind its wall in the photos; the game's ground there is flat.
4. The Basic School's east boundary (between the hall's road and the roundabout) is estimated.
5. Ecobank's parking bays along the loop: a photo from above or the loop's inside would fix them.
