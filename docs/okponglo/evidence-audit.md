# Okponglo to the UG Stadium: the owner's correction brief

The brief is `Okponglo_UG_Stadium_Detailed_Claude_Brief.pdf`, 35 pages:
- pages 2-22: Pairs 1-21, each a game screenshot beside a street photograph, with the visible mistakes and five steps;
- pages 23-27: the annotated aerials A01-A05;
- pages 28-31: the game-map views M01-M04;
- pages 32-35: the four-part prompt.

| Piece | File |
| --- | --- |
| Models | `src/game/okponglo.ts` |
| Numbers | `src/game/okplan.ts` |
| The stadium-side banks' levels | `src/game/relief.ts` (`bankZone`) |
| Cameras | `src/game/okviews.ts` |
| The earlier corridor work it builds on | `src/game/labawaleshie.ts`, `src/game/lbplan.ts` |

The cameras are the preview views `okP01` ... `okP21`, the overheads `okTopN`, `okTopJ`, `okTopS` and the close views
`okClosePlaza`, `okCloseSign`, `okCloseLease`, `okCloseProVision`, `okCloseDiamed`, `okCloseCanopy`, `okCloseP21`. They
are placed from the aerials' arrows and matched by eye to the photographs, not surveyed.

## The images in this folder

Each `pairs-*.jpg` row is one pair: the owner's game screenshot, the street photograph, the game before, the game after
(the after and before from the same camera).

| Image | Pairs |
| --- | --- |
| `pairs-01-04.jpg` | the median group, the stadium-side bank, the long median view |
| `pairs-05-08.jpg` | First Eye Plaza front and corner, the low roof and grille, the forecourt and workshop |
| `pairs-09-12.jpg` | ALPHA LED, the 3D SIGN SHOP wide and close, the green wall |
| `pairs-13-16.jpg` | the open edge and frame, the median boards, Leasafric front and side |
| `pairs-17-21.jpg` | Pro Vision, Diamed and its blue neighbour from the N4 and McDan Drive, the stadium-side structures |
| `close-views.jpg` | the plaza name, the sign shop's letters, Leasafric's signage, the Pro Vision board, the Diamed banner and board, the blue balcony canopy, the curved roadside structures |
| `overheads.jpg` | the three overheads, before and after |

**Pair 12's mirrored game screenshot.** It is kept unchanged in the brief and in `pairs-09-12.jpg`. Its world direction
comes from the real photograph and A04 arrow 12. No flipped copy was needed: the camera `okP12` looks south-east from the
junction along the wall, as the photograph does.

**Pair 21.** Its reference is the replacement photograph, not the duplicate game image.

## Registration

The aerials are Google screenshots with north up. They were registered on outlines and roads the map already has.

| Aerial | Anchors | Scale |
| --- | --- | --- |
| A02 | First Eye Plaza's outline (osm:way/1518873623, the L with the jog on its west face), the N4's two carriageways, La-Bawaleshi Road | about 0.29 m/px |
| A03 | the corner outline south-east of the junction (osm:way/1289415410), La-Bawaleshi Road, McDan Drive | about 0.3 m/px |
| A04 | the corner outlines, Leasafric's green roof (osm:way/1184502304), the lane south of it | about 0.29 m/px |
| A05 | Leasafric's roof, the lane, McDan Drive | about 0.24 m/px |
| A01 | Leasafric across the N4 | |

**McDan Drive.** The road the game maps along the east of these plots, which it names Mbabane Avenue, is the aerials' McDan
Drive.

**The Diamed and blue targets.** At A05's own scale, its green target lies on the outline south of Pro Vision
(osm:way/1289415419) and its blue target on the next one (osm:way/1289415420). This agrees with the owner's circles in
Pair 18's game screenshot:
- the green circle is on the white banded block;
- the blue circle is on the yellow block;
- the game built those two outlines that way before.

The map's "Diamed Diagnostical" place point sits on Pro Vision's outline (osm:way/675704403). It is not followed, as the
brief says for map labels.

**The roundabout-like symbol (M03).** The junction is the mapped signalised crossing with its slip lanes and islands
from the earlier brief. It is kept as it is, because no reference here shows a roundabout.

## One object per property

| Property | Pairs | Built as |
| --- | --- | --- |
| First Eye Plaza | 5, 6 (and 1, 2 behind) | osm:way/1518873623: one model, three levels |
| the low red-brown roofed structure | 7 | no outline; its box in `LOWROOF`. The taller beige mass behind it stays the mapped osm:way/1518873624 |
| ALPHA LED | 9 | the box of the earlier "low yellow frontage" |
| the signed corner shop | 8, 10, 11 | osm:way/1289415410: its face to the N4 carries 3D SIGN SHOP; its face to the forecourt carries the 3D SIGNS fragment Pair 8 shows. The taller mass behind is osm:way/758602539 |
| the larger neighbour | 8 | no outline; set back behind the open forecourt (A03), clear of the mapped service way |
| the green wall's plot | 12, 13 | the wall, the planted plot, the empty frame, the mast |
| Leasafric | 15, 16 | osm:way/1184502304 and its compound |
| Pro Vision | 17 | osm:way/675704403 and its compound |
| Diamed | 18, 19 | osm:way/1289415419 and its compound |
| the blue neighbour | 18, 20 | osm:way/1289415420 and its compound |

**The neighbourhood's other outlines.** Every other outline stays with the neighbourhood's own builder from the earlier
brief.

**The earlier frontages removed.** The earlier brief's two frontages along La-Bawaleshi Road's south side are removed. A03
shows open, car-parked ground there; the larger neighbour, set back behind it, takes their place.

## Corrections made

### The median (Pairs 1, 2, 4, 13, 14)

**The trees.** The tall, wide-crowned trees are replaced by a planting plan (`okponglo.ts medianPlan`) along three runs
(`okplan.ts MEDIAN_RUNS`):
- **North of the junction:** compact trees on short stems, their foliage in irregular clusters reaching low. Crowns are
  2 to 3.7 m across and 2.6 to 4.5 m tall, with a few larger crowns of about 5-6 m.
- **The open stretch south of it (Pairs 13, 14):** low shrubs and the odd staked sapling.
- **Spacing:** uneven, with empty gaps and none on a board's spot.

Every crown stays inside the kerbs.

**The ground.** Soil patches and worn paths are drawn over the grass.

**The boards:**
- the tall blue pylon opposite the plaza;
- wooden A-frame stands;
- the narrow INSTANT ADMISSION pylon;
- a small red board;
- the green KFC board: the brand, Bolt Food and "Get this Colonel Special", with no price;
- the visa board: USA VISA, INTERVIEW DATE ASSISTANCE, with no phone number.

### The stadium side (Pairs 3, 21)

**North of the junction (Pair 3).**
- **The bank.** A raised bank (relief.ts) behind the worn path: about 1.15 m at its face, rising to about 2.3 m.
- **The face.** A low rough stone retaining face stands at the bank's foot, with a stone lip. It is solid to the bike.
- **The planting.**
  - dense, varied low shrubs, rough grass, small trees and the odd taller tree;
  - this replaces the repeated tall cone shrubs;
  - it runs on along the unraised scrub beyond the bank's ends.
- **Poles.** A power pole and a poster-covered pole stand at the foot.
- **Floodlights.** The stadium's floodlights stand behind.

**Opposite Leasafric (Pair 21).**
- **The verge.** A raised verge of about 0.85-1.15 m behind the red brick path, with the same stone face, a dusty worn path
  along its top, rough grass and low plants.
- **The cream structure.**
  - a broad horizontal top;
  - curved ends turning down to the ground, real quarter-ring geometry;
  - the body with its inset grey panel.
- **The blue structure.** Beside it: its own curved top and an upper panel with graphics.
- **Their function.** It is not established, so neither is modelled as a bus shelter and there are no benches.
- **Signs and lighting.** A cluster of four signboards of different sizes, frames and bases, and a street light.
- **Earlier pieces.** The existing roadside pieces there (the panel, the empty frame, the slender mast) now stand on the
  raised ground.

### North of La-Bawaleshi Road

**First Eye Plaza (Pairs 5, 6).**
- **The levels.**
  - the ground shops behind light blue grilles with their sign bands;
  - the gallery level, set back 1.9 m behind orange columns and a railing, with a real floor slab and soffit;
  - the enclosed top floor with discrete white-framed windows;
  - the orange roof-edge fascia.
- **The central feature.** The orange tiled feature stands where the outline steps forward. It has two blue glazed insets
  and FIRST EYE PLAZA in raised letters on top.
- **The shop signs.** Only legible brands: SAMSUNG, EVEREST, FRIDAYS LUXURY. The phone number painted on the wall is not
  copied.
- **The side.** AC units on the side.
- **The forecourt.** Concrete slabs from the kerb with worn patches; four separate kiosks and canopies at the corner, each
  with its own roof slope; the white electrical cabinet.

**The low structure (Pair 7).**
- the low red-brown hip roof;
- the dark open front;
- the rust-brown grille line along the road on its concrete base, with its gate (its own solid) and returns to the plot
  corners;
- palms and a tree behind.

**ALPHA LED (Pair 9).**
- **The display stack.** The taller central stack has the dark near-square screen, switched off, in its frame. The panel
  above it carries ALPHA LED in coloured raised letters with dark outlines.
- **The entrance.** The green shop entrance is recessed 1.4 m under the upper storey, up three steps.
- **The wing.** The low yellow wing with gridded windows.
- **Beside it.** A low yellow wall, the grey shed and a palm.

### South of La-Bawaleshi Road

**The corner shop (Pairs 8, 10, 11).**
- **The building.** Two levels: brown roller shutters with posters, the pink-cream upper floor with white-framed paired
  windows, the projecting roof with its dark edge.
- **The fascia.** A dark fascia on its faces to the N4 and to the forecourt.
- **The letters.** 3D SIGN SHOP: each letter is its own colour (red, orange, yellow, green, blue, purple) over a dark
  outline, in shallow relief.
- **The forecourt face.** On the face to the forecourt, the coloured logo blocks and 3D SIGNS. The rest of that sign is
  not legible.
- **The block behind.** The taller three-level mass with brown-framed windows and a water tank.
- **Poles.** Two pairs of poles in front of the shop. The junction's signal posts are the earlier brief's.

**The forecourt and the neighbour (Pair 8).**
- **The forecourt.** Gravel and compacted soil inside a wire-mesh fence on thin posts. The fence is open where vehicles
  go in.
- **The neighbour.** The larger neighbour is three levels with a blue top floor and an empty frame on its roof.

**The green wall (Pairs 12, 13).**
- **The wall.** A sage-green plastered wall, 2.3 m, with its base, cap and foot stains. It runs along the frontage from
  the block behind the sign shop to Leasafric's car park, with returns at both ends.
- **The plot.** Behind it: palms, dense shrubs and a few trees.
- **The empty frame.** The tall empty rust-red frame on its bases, left empty, and a poster-covered pillar.
- **The mast.** The lattice mast seen from Pairs 8, 10, 11 and 12. It stands in the plot where those four views'
  bearings agree.
- **The sidewalk.** Grey interlocking blocks with a rough verge, from the junction to the blue neighbour.

### Leasafric (Pairs 15, 16)

**The office.** Two levels under a shallow green roof with broad eaves:
- red framing posts and bands, white walls, rectangular windows;
- LEASAFRIC GHANA in white raised letters on the red band;
- the vehicle advertisement ("Don't Buy It, JUST LEASE IT.") on the front and the south side;
- AC units on the south side.

**The compound.**
- the low wall of white panels between red posts, red coping, the vehicle advertisements on some panels, the blank ones
  left blank;
- the black vehicle gate (closed);
- the tall narrow white branding pylon;
- the blue shade over the car park;
- palms and clipped shrubs inside.

### Pro Vision (Pair 17)

**The buildings.**
- the low stone-faced front structure with its arched window and red-brown roof;
- the taller green gabled building behind it.

**The compound.**
- the cream wall with pillars and the dark security fence over it;
- the gold-toned ornate gate (closed);
- the freestanding board: Pro Vision and Consultants Limited with its logo. The fine print is grey lines, not invented
  text.
- the red-flowering bed along the wall;
- palms and the tall slender conifer.

### Diamed and the blue neighbour (Pairs 18-20)

**Diamed.**
- **The building.**
  - the taller green gabled mass, with its balcony of cream balusters under a lean-to;
  - the low front volume toward McDan Drive;
  - DIAMED on a white panel on its face to the N4;
  - the water tank.
- **The wall to the N4.**
  - its white ornate gate;
  - the long green FIBROID and REHABILITATION banner, a printed graphic;
  - the DIAMED board on its frame behind the wall.
- **The wall to McDan Drive.**
  - green panels with white angular outlines;
  - white metal fence portions above;
  - razor wire;
  - the open drive between white posts with globe lamps;
  - hexagonal paving.
- **The McDan Drive board.** The blue board: the H, ALTERNATIVE MEDICINE SPECIALIST HOSPITAL and DIAMED, the lines the
  photograph shows.
- **Planting.** The tree screening the balcony and the narrow tall tree by the N4 wall.

**The blue neighbour.**
- **The house.** Blue plaster under a brown tiled hip roof, with lower roof returns.
- **The balcony.** The rounded projecting balcony to McDan Drive, all real geometry:
  - its curved floor slab;
  - the curved railing;
  - the column;
  - the round canopy over it with its thick rim.
- **The compound.**
  - the high blue wall with pillars and razor wire;
  - the black vehicle gate;
  - its gate to the N4;
  - banana plants and shrubs;
  - outside on McDan Drive, the grass bank, the broken segmented concrete drain edge, and the worn drive.

**The divider.** A wall divides the two plots. It is left open where the mapped drive from McDan Drive crosses.

### Collisions

The walls, retaining faces, closed gates, posts, poles, boards, kiosks and the cream and blue structures are solid
(`wallSolids` and `SOLIDS`). The open drives, the forecourts and the sidewalks stay rideable.

## Checks

`npm run test:routes` has an Okponglo section. It checks:
- **Models.** The ten models exist.
- **Outlines.** Each photographed property's outline is found once and built by this work.
- **The median.**
  - at least 15 trees, of which at most a fifth are large crowns;
  - no compact tree over 4.6 m;
  - no plant over a carriageway;
  - no tree in the open stretch;
  - every board stands on the median.
- **The banks.** Both banks are raised at their tops, with the road and the path at road level.
- **The walls.**
  - the frontage walls stand off the roads and out of every outline;
  - the McDan Drive walls stand off the road, except at the open drive;
  - the plots' divider leaves the mapped drive open.
- **Pair 21.** The cream and blue structures stand on the raised verge.
- **Neighbour and mast.** Both keep off the roads.
- **Rides.** The rides along the N4 and La-Bawaleshi Road pass no wall.

The earlier La Bawaleshie checks still pass, with:
- its picks;
- its frontages;
- its posts off the roads;
- every neighbourhood outline built by a model.

## Unresolved, estimated or not supplied

**Measurements.** None is surveyed. These are read from the photographs, and each is a number in `okplan.ts`:
- every height: the banks, the walls, the storeys, the frame, the mast;
- every setback;
- every span the map has no outline for: the low roofed structure, ALPHA LED, the larger neighbour, the compounds' plot
  lines;
- the median plants' places and sizes.

**Names and text.**
- The plaza's other shop signs and the painted phone number are not copied.
- Neither are the blurred contact details, the KFC price, the visa phone number, the Pro Vision fine print, or the
  vehicle panels' small text.
- The 3D SIGNS fragment on the forecourt face is all of that sign that is legible.

**Positions.**
- **The mast.** Its spot comes from four views' bearings, not a survey.
- **The Pro Vision and Diamed signs.** The aerials' business markers do not fix entrances: each gate is placed from its
  photograph, and Diamed's McDan Drive gate where its mapped drive comes in.
- **Plot boundaries.** The compounds' side and back walls follow the plot lines as far as the aerials show them. Their
  exact corners are not established.

**Not modelled.**
- **Structures.** The function of the cream and blue roadside structures; interiors; hidden rooms and floor layouts;
  signal timings; underground services.
- **Transient things.** Vehicles, vendors, umbrellas and pedestrians are temporary and not modelled.
