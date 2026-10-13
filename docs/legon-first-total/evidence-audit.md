# Legon overhead to Okponglo: the owner's correction brief

The brief is `Legon_Overhead_to_Okponglo_Detailed_Claude_Brief.pdf` (a copy is in `docs/handover/uploads/`), 25 pages:
- pages 2-17: Pairs 1-16, each a game screenshot beside a street photograph, with the visible mistakes, the real target
  and four steps;
- pages 18-21: the annotated aerials A01-A04 (A01: Pairs 11-14; A02: 5-7, 15; A03: 1-4; A04: 8-10, 16);
- page 22: the game map M01;
- pages 23-25: the three-part prompt.

| Piece | File |
| --- | --- |
| Models | `src/game/legonfirst.ts` |
| Numbers | `src/game/lfplan.ts` |
| The raised plot, the retaining wall, its tiers and the east scrub's levels | `src/game/relief.ts` (`lfZones`) |
| Cameras | `src/game/lfviews.ts` |
| The check that drawn pieces never lose a vertex to NaN | `src/game/roadkit.ts` (`sane`) |
| Route checks | `scripts/route-tests.mjs` (the block before `const SNAP`) |

The cameras are the preview views `lfP01` ... `lfP16` and the overheads `lfTopN`, `lfTopS`, `lfTopW`. They are placed
from the aerials' arrows and matched by eye to the photographs, not surveyed.

## The images in this folder

Each `pairs-*.jpg` row is one pair: the street photograph, the game before, the game after. The before was taken at
the start of this work. A few cameras were moved later to match the photographs better, so a before and an after can
differ slightly in viewpoint.

| Image | Pairs |
| --- | --- |
| `pairs-01-04.jpg` | the trading corner, the side lane, the kiosk line and shelter, the Legon 1st frame |
| `pairs-05-08.jpg` | the station plot and Family Health, the takeaway building, the canopy, the access and pylons |
| `pairs-09-12.jpg` | the raised plot, the station from the reverse angle, the tiers and red-roof structures, the scrub |
| `pairs-13-16.jpg` | the planted separation, the divider and retaining wall, the weathered building close, the access |
| `overheads.jpg` | the three overheads after |

## Registration

The aerials are Google screenshots with north up, registered on outlines and roads the map already has: the N4's two
carriageways, both service roads, the side lane east of the trading corner, the station's mapped service strip
(osm ml 137514670), Family Health's outline, the small white building (osm 1195133819) and the frame (osm 603522791) on
the raised plot, the two small red-roof structures (osm 3028 and 2618). The divided highway, the side lane and the
access gaps in M01 agree with the map data, so no road was moved.

## One object per property

| Property | Pairs | Built as |
| --- | --- | --- |
| the trading corner and the kiosk line | 1, 2, 3 | one frontage: the curved kerb and brick corner, the posts, the stalls in order (`STALLS`), the long shelter on its outline |
| the Legon 1st frame and the open plot | 4 | the frame (`LEGON1ST`) and the rough plot reaching to Family Health |
| the TotalEnergies station | 5-8, 10 | one group (`STATION`): the takeaway building, the canopy and pumps, the service strip, the access, the pylons |
| Family Health | 5 | its mapped outline, kept as the large pale red-roof neighbour |
| the raised plot | 9, 15, 16 | the stained wall, the white building, the frame, the billboard skeleton, the red frame, the access (`PLOT`) |
| the corridor | 11-14 | the divider, the grass strip, the retaining wall and its tiers, the red-roof structures, the east scrub, the planted separation |

**The police compound north of the side lane.** It is already modelled with the 30-pair brief in `roadside.ts`, so it is
left as it is. An earlier draft of this work drew it a second time; the route tests caught the double outline and the
draft was dropped.

**Outlines cleared.** The machine-detected outlines 249 and 101 on the station's forecourt and 100, 37 and 67 on the raised
plot stand where the aerials and Pairs 9, 15 and 16 show open forecourt or bare ground. They are not built
(`OPEN_OUTLINES`).

## Corrections made

### The trading corner and the kiosk line (Pairs 1-3)

- The curved kerb round the side lane's mouth, the brick corner and footway, the short striped posts with dark and red
  bands; the lane is kept open.
- Umbrellas over tables, open stalls under canopies and enclosed kiosks (the dark green and red one, the light
  poster-covered shop) in their order on bare red earth behind the footway, each with its own size and roof.
- The long low shelter on its outline: a shallow sheet roof on narrow supports, grilles along the back, counters.
- The tall narrow board with its red top, the branching lamps, the poles and wires, mature leafy trees behind.

### The Legon 1st frame and the open plot (Pair 4)

- The tall dark open frame on thin members, the small pale "Legon 1st" panel at the top, nothing below.
- Patchy scrub, bare earth and low plants instead of lawn and blocks; the drain grate at the kerb.

### The TotalEnergies station (Pairs 5-8, 10)

- The low grey takeaway building with its white fascia (CHICKEN MAN, pinkberry, DRIVE THRU), its air-conditioning units
  and dark windows; the shopfront on its south face.
- The open canopy on dark columns with its thin pale fascia, red edge, TotalEnergies lettering and visible underside; two
  pump islands under it.
- The low pale service strip with its deep open bays.
- The broad access: grass islands with brick crossings, striped posts, no-entry discs, STOP on the access, the price
  pylon (the photograph's prices, editable) and the Chicken Man and Pizzaman pylons; the low white wall on the south side,
  slender palms; worn concrete forecourt.

### The raised plot (Pairs 9, 15, 16)

- The stained concrete wall along the brick sidewalk holding the plot about a metre up, tapering down at the access
  (`relief.ts` raises the plot behind the wall face).
- The small white flat-roofed building with its peeling red fascia, the unfinished concrete frame with open bays, worn
  paving, red earth, weeds and a pile of material.
- The empty blue billboard skeleton and the separate red frame, with no advertising faces; the railing and the white
  posts at the access.

### The corridor south (Pairs 11-14)

- The low concrete divider between the carriageways; the grass strip and its twin lamps with small boards.
- The long panelled retaining wall behind the west service road, the wooded ground over it (mature spreading crowns, a
  tall sparse tree, shrubs, the small unfinished frame among the trees), stepping down in two tiers where the two small
  cream red-roof structures stand (Pair 11).
- The dense scrub rising behind the east verge, the lattice tower and the wires (Pair 12).
- The planted separation farther south: short-stemmed young trees and shrubs with gaps (Pair 13).

### Trees and bushes

- **Trees.** Compact trees on short stems (`compactTree`), a few broad leafy crowns where the photographs show mature
  trees, one tall sparse tree on the wooded ground, slender palms at the station only.
- **Bushes.** Low rounded shrubs (`shrub`) and grass tufts on the scrub, the plot and the separations. They are never used
  where the photographs show trees.
- The tall stylised palms and the large coloured ornamental trees of the old scene are gone from this stretch.

### The bike

- Every wall, fence, post, kiosk and trunk is solid.
- `node .preview/solidroads.mjs` checks for solids on the map's roads and footpaths.
  - The first run of this work had 338 new ones. The shelter's grille ran onto the back lane's end, the station's south
    wall and the plot's railing crossed the mapped access road, a palm and a lamp stood on service roads, the upper tier
    wall crossed the mapped footway, and trees and shrubs stood on footpaths.
  - All are fixed. The walls are open where the mapped roads pass, the upper tier stands behind the footway
    (`tierBack`), and plants keep off the paths (`nearRoad`).
  - None remains. The 345 hits left were there before this work.

## Assumed, and what would settle it

- Every height, setback and unmapped span; the stalls' spots and sizes; the plants' places.
- The retaining wall's height (about 1.7 m) and its tiers' steps (0.8 m and 1.6 m), read from Pairs 11 and 14.
- The raised plot's height (about 0.95 m), from Pair 16's wall and sidewalk.
- The station's canopy and takeaway footprints come from the aerial's roofs. The service strip uses its mapped outline.
- The red frame's spot, moved 12 m east onto the plot behind the wall so that it stands clear of the service road.
- The small unfinished frame among the trees, placed 6.5 m west of where it was first drawn to keep the mapped footway
  open.
- *Would settle it:* a measured section of the retaining wall and the plot's wall; the station's site plan.
