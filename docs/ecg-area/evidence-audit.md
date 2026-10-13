# The ECG area: the owner's correction brief

The brief is `ECG_Area_Detailed_Claude_Brief.pdf` (a copy is in `docs/handover/uploads/`), 26 pages:
- pages 2-19: Pairs 1-18, each a game screenshot beside a street photograph, with the visible mistakes, the real target
  and four steps (Pairs 1-10 from the first set, 11-18 from the ECG PDF's eight rows);
- pages 20-22: the annotated aerials A01-A03 (A01: Pairs 1-8; A02: 9-11, 18; A03: 12-17);
- page 23: the game map M01;
- pages 24-26: the three-part prompt.

| Piece | File |
| --- | --- |
| Models | `src/game/ecg.ts` |
| Numbers | `src/game/ecgplan.ts` |
| Cameras | `src/game/ecgviews.ts` |
| Route checks | `scripts/route-tests.mjs` (the block before `const SNAP`) |

The cameras are the preview views `ecP01` ... `ecP18` and the overheads `ecTopN`, `ecTopS`. They are placed from the
aerials' arrows and matched by eye to the photographs, not surveyed. The N4 runs in a cutting between z -305 and 405, so
the cameras of Pairs 2, 6, 9, 10 and 18 stand on the west service road or north of the cutting's end, where the
photographs were taken from road level.

## The images in this folder

Each `pairs-*.jpg` row is one pair: the street photograph, the game before, the game after. The before was taken at
the start of this work. A few cameras were moved later to match the photographs better, so a before and an after can
differ slightly in viewpoint.

| Image | Pairs |
| --- | --- |
| `pairs-01-04.jpg` | the utility corridor, the blue compound, the highway planting and the red-roof building, the ECG office across the highway |
| `pairs-05-08.jpg` | the cream building and the utility yard, the compound in its landscape, the divider north, the divider transition |
| `pairs-09-12.jpg` | the compound approach, the guardhouse and the stepped office, the tall white block, the ECG office and its neighbour |
| `pairs-13-15.jpg` | the ECG office close, the pitched-roof building and its entrance structures, the side access and the stalls |
| `pairs-16-18.jpg` | the canopies and kiosks, the stalls and the older blocks, the compound approach from the second set |
| `overheads.jpg` | the two overheads after |

## Registration

The aerials are Google screenshots with north up, registered on the map's own roads and outlines:
- the roads: the N4's two carriageways (786 and 443), the east service road (658), the west service road (617), the
  frontage road (176), the Ghana Water access lane (173), the guesthouse's side road (174) and the side access by the
  stalls (175);
- the outlines: the ECG office (317), the curved halls behind it (849, 850), the guesthouse block (2669) and its hut
  (853), the Ghana Water office (316, 851, 852), the low cream building (2622).

M01's roads agree with the map data, so no road was moved.

## One object per property

| Property | Pairs | Built as |
| --- | --- | --- |
| the ECG office | 4, 12, 13 | outline 317: the taller white slab at its south end, the blue-glass wing north of it (`ECG`) |
| the curved halls behind it | 13 | outlines 849, 850: low halls under yellow-green curved roofs (`VAULTS`) |
| the pitched-roof guesthouse | 4, 12, 14 | outline 2669: the white hall under the grey gable with the blue-glazed bay, the lower brown-roofed west part, the huts, the blue sign, the tank stand (`GUEST`) |
| the Ghana Water compound | 2, 6, 9, 10, 11, 18 | the blue wall and fence, the gate, the guardhouse, the stepped office (316, 851, 852) and its cap, the canopy, the court, the tower and the mast (`GW`) |
| the low cream building and the utility yard | 3, 5 | outline 2622 moved 3.4 m east, the smaller red-roof structure, the black picket fence, the yard (`SUB`) |
| the highway | 1, 3, 4, 7, 8 | the divider (`DIV`), the planted separation (`PLANT`), the utility corridor (`CORR`), the towers, the 50 signs |
| the trading frontage | 15, 16, 17 | twelve stalls (`STALLS`), the pole with its board, the rocks, the earth and the slab footway (`TRADE`) |

**The taller white block of the Ghana Water views.** Pairs 2, 6, 9, 11 and 18 show a tall plain white block behind the
blue fence. It is taken to be the ECG office's slab, which the aerials place there. This is inferred from the aerials, and
the photographs agree.

## Corrections made

### The ECG office (Pairs 4, 12, 13)

- **The slab.** A four-storey white slab with a narrow dark glazed recess up its east face and the small ECG marks high
  on it.
- **The wing.** A lower broad wing of blue reflective glass north of it, under a pale panelled fascia, its north end
  rounded, with the sloping upper glazing.
- **Along the road.** The low white frontage wall with posts and a railing, its gate, the planting, and the ECG GOES
  CASHLESS board. The board's other lines are not legible and are left as bands.
- **Behind.** The two low halls under their yellow-green curved roofs.

### The pitched-roof guesthouse (Pair 14)

- The white hall under the broad grey gable roof, the gable to the frontage road with the large blue-glazed bay; the lower
  west part under a brown roof.
- The separate low white entrance huts with pale green roofs, the blue vertical sign, the raised stand with two black
  tanks, the low wall and railing.

### The Ghana Water compound (Pairs 2, 6, 9, 10, 11, 18)

- The blue lower wall and thin blue metal fence along the west service road, open where the access lane passes. The blue
  gate posts and the two gate leaves stand open, each folded back beside its post.
- The detached guardhouse with blue lower walls under a blue hipped sheet roof.
- The stepped white two-level office with its raised flat cap, and the light canopy north of it.
- The hard court, the gravel verge with brick paving and short striped posts.
- The lattice tower on the verge, and the red and white mast behind the guardhouse.
- The sparse mature tree, banana plants and small palms.

### The low cream building and the utility yard (Pairs 3, 5)

- The low cream building with the red hipped roof and the smaller one north of it.
- The black picket fence with its gate along the east service road's sidewalk, and the yard with its gantries and tank.

### The highway (Pairs 1, 3, 4, 7, 8)

- **The divider.** The low concrete divider between the carriageways, dropping to a low kerb toward the cutting.
- **The planted separation.** Between the northbound carriageway and the east service road: short-stemmed compact trees
  and shrubs with gaps, and banded twin lamps. It replaces the tall thin palms.
- **The west strip.** Dry grass with a few shrubs.
- **The two 50 signs.** Circular speed-limit signs.
- **The utility corridor** east of the east service road: the grass verge, the brick sidewalk, the H-frames with their
  spans, the lattice towers, and rough scrub behind.

### The trading frontage (Pairs 15-17)

- Blue canopy stalls, a larger dark kiosk, small kiosks and rough shacks, each with its own size.
- They stand on bare earth beside a slab footway and a drain, with the concrete pole and its advertisement board.
- Large rough rocks, trees and palms.

### Trees and bushes

- **Trees.** Compact trees on short stems in the separation. A sparse broadleaf, banana plants and small palms in the
  compound.
- **Bushes.** Low rounded shrubs and tufts in the strips, the yard and the scrub.
- **A fix during this work.** A colour-pick bug drew some foliage white where a plant's seed was negative. Pairs 3, 4, 7
  and 8 showed it. The pick in `okponglo.ts` is now safe for any seed.

### The bike

- Every wall, fence, post, stall and trunk is solid.
- The route tests check that the stalls, the posts, the divider, the gate, the walls and the corners stand clear of the
  roads.
- `node .preview/solidroads.mjs` finds no solid of this work on a mapped road or path. The canopy was shortened 0.7 m and
  the gate leaves folded aside to clear the access lane.

## Assumed, and what would settle it

- Every height and every unmapped span; the stalls' and plants' places; the fence and gate lines from A02 and Pairs 9,
  10, 18.
- The slab's identity as the Ghana Water views' taller block (inferred).
- The split between the slab and the glass wing on outline 317, and between the guesthouse's hall and its west part.
- The second entrance hut, which the map has no outline for.
- The cream building moved 3.4 m east, because its mapped outline lies over the service road's kerb (estimated).
- Sign texts that are not legible, left as bands.
- *Would settle it:* the ECG and Ghana Water site plans; a closer photograph of the cashless board and the blue sign.
