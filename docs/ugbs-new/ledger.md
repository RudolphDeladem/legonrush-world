# Okponglo signals and the new UGBS graduate building (batch 161)

Source: the owner's `LEGONRUSH_Okponglo_Signals_UGBS_Graduate_Block.pdf` (21 pages, pictures 1-11). All pages read;
pictures checked at full size. The comparison is `sheet.jpg`.

## Task A: the junction signals (TL-01 to 06)
- **Code:** `lbplan.ts` (`SIGNAL`, `SIGNALS`: every height, reach and direction is its own number) and `labawaleshie.ts` (the junction).
- **Replaced:** the short green island posts. Each approach now has a tall slender grey mast (7.2 m) with a joint,
  a brace and a long arm (6.6 m up) reaching over its lanes:
  - north median nose: arm 11.5 m west over the southbound lanes, facing north;
  - south median nose: arm 9.5 m east over the northbound lanes, facing south;
  - south-west corner: arm 8.5 m north over Jubilee Drive's eastbound lanes, facing west;
  - north-east corner: arm 11 m south over La Bawaleshie Road's westbound lanes, facing east.
- **Heads:** two dark heads stand on each arm on brackets, and a second head sits part way down the mast (2.9 m). Lenses
  and visors are on the face side only; the backs are plain housings.
- **Other corners:** the remaining two corners carry a tall pole with an upper and a lower head.
- **Calibration:** heights and reaches are matched to the carriageways' mapped widths; there are no metre values in the
  sources. Phasing is unchanged.
- **Status:** implemented and visually verified (the picture-1 heading, the northbound approach, the side view).
- **Arm clearance:** the arms sit above traffic; the masts and bases stand on the islands.

## Task B: the new UGBS graduate building (UG-01 to 16)
**Identity [VERIFIED].** The game had the old red-roof Graduate Block (the map's T outline, kept unchanged). The new building
was the provisional "unroofed frame" of an earlier brief (`banipresec.ts`), placed with no outline, about 45 m west of where
it stands. Picture 9 registers on the old block's outline: x = 1002 + (px − 385) / 3.73, z = −751 + (py − 195) / 3.73.
That puts the new building's rounded end at (975, −656). The frame is removed; the building is modelled there
(`ugbsnew.ts`, numbers `bpiplan.ts` `UGBS_NEW`).

**Current state (pictures 7/8):**
- **Rounded wing:** a convex projecting rounded wing (an elliptical plan, smooth), with four blue-glass bands between
  cream slab bands, dark mullions following the curve, a reddish ground storey with discrete tall glazed openings under
  a cream band, and a thin broad cream canopy with underside ribs and a generous overhang.
- **Core:** cream, with reddish vertical sections.
- **Rectangular wings (north and south):**
  - broad glazing with dark mullions and projecting cream slab bands;
  - inset terrace bays 1.6 m deep, with cream reveals, soffits and guard rails, at varying places floor by floor;
  - reddish end sections;
  - a reddish ground storey with tall openings;
  - the projecting pale cap.
- **North wing's cap:** a long cantilever to the north-west on an angled strut.
- **Levels:** ground plus four upper storeys. No extra floor, no red pitched roof.

**Site:**
- bare red-brown working ground inside the boundary (the yard east of the building left as ground, with no invented
  stores);
- rough grass at its edges;
- globe-topped site lights on the road side;
- the scrub shrubs and trees kept off the site.

**Status:** footprint and massing implemented and visually verified (overhead against picture 9; both picture-7/8 headings).

## Unresolved
- The facade behind the billboard (the central entrance).
- The rear and east faces (cream and reddish, provisional).
- The exact opening counts and the recess positions on unseen floors.
- The yard's current contents.
- The billboard itself: a dated advertisement, not added.
- Signal phase grouping.

## Tests run
- tsc ok; route tests ok; lens unchanged.
- Road-blocking scan round the building: none.
- Road-blocking scan at the junction: unchanged from before. Two pre-existing hits come from the chain-link fence of an
  earlier brief crossing the mapped slip lane at the south-east corner; reported, not changed here.
- NaN scan: 7358 meshes, none bad.
- build ok; smoke ok.
