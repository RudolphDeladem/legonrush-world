# Great Hall: the owner's correction brief

The brief is `Great_Hall_Detailed_Claude_Brief.pdf`, 49 pages: the aerial A01, the game views G01-G10, the tour R01-R59,
eight correction sections and the four-part prompt.

| Piece | File |
| --- | --- |
| Model | `src/game/greathall.ts` |
| Numbers | `src/game/greathallplan.ts` |
| Levels and steps | `src/game/relief.ts` (`ghZones`, the Great Hall stairways) |
| Cameras | `src/game/ghviews.ts` |

The cameras are preview views `ghTop`, `ghTopC`, `ghG01`, `ghG03`, `ghG09`, `ghR54`, `ghR51`, `ghR15`, `ghR10`, `ghR25`,
`ghR34`, `ghR48`, `ghR58`, `ghR06` and `ghGarden`. Each image in this folder shows the reference, the game before and the
game after, from the matched camera:

| Image | Checks |
| --- | --- |
| `overhead-A01.jpg`, `overhead-courts-A01.jpg` | the layout from above, the hall at the top as in the aerial |
| `front-oblique-G01.jpg`, `side-oblique-G03.jpg`, `tower-side-G10.jpg` | the game's own drone angles |
| `portico-R54.jpg`, `upper-court-R51.jpg` | the hall's front and the upper court |
| `toward-gateway-R15.jpg` | the piers, the tanks and the gateway beyond |
| `side-wing-gable-R10.jpg` | the side wing's arched gable |
| `bust-walk-R25.jpg` | the lower court's bust walk |
| `arched-threshold-R34.jpg` | the gateway's arch and its steps |
| `stairs-R48.jpg` | the flights between the courts |
| `clock-tower-R58.jpg`, `tower-base-oriel-R06.jpg` | the tower |
| `approach-garden-A01.jpg` | the formal garden |

The camera positions are matched by eye, not surveyed.

## Registration of the aerial

A01 has no north arrow. It was registered on outlines the map already has; nothing was placed by a guessed compass
direction. The registration puts:
- the hall's west end at the image top;
- south on the image's left.

The anchors:

| Aerial | Map |
| --- | --- |
| The hall | osm:way/720486436 |
| The L-shaped wings round the upper court | osm:way/100307654 (north), 100307636 (south) |
| The transverse two-storey building with the central arch | osm:way/100307658, x -909.3 to -900.9 |
| Its pavilions | osm:way/492099539, 492099524 |
| The building south of the lower court (two crimson roofs in the aerial) | osm:way/492099530 |
| The outer buildings left and right of the gateway | the Cash office and the Public Affairs Directorate |
| The road crossing the axis below the semicircular garden | road 605, x -860 |
| The turning loop round that garden | road 606 |
| The two roads either side of the formal garden | roads 435 and 436, z 148.6 and 106 |
| The long buildings flanking the formal garden | osm:way/100307690 and 100307665, with the smaller buildings at their ends (osm:way/1051225976 and 565872087) |

## Sequence, top to bottom of A01 (west to east)

1. The hall and its tower.
2. The upper court between the wings.
3. The gap between the wings' east arms, with the piers and the tanks.
4. Two flights down to the lower court.
5. The lower court, with the bust walk on its south side.
6. The gateway building and its arch.
7. Paving down to the turning loop and its semicircular garden.
8. The cross road.
9. The formal garden between roads 435 and 436, to the bottom road.

The tour's order agrees with this sequence:
- R01-R10: the upper court;
- R11-R20: the way down past the piers;
- R21-R45: the lower court and its busts;
- R46-R50: back up the flights;
- R51-R54: the hall's front;
- R55-R59: the side court and the tower.

**What the previous model had wrong.** It put the formal garden in what is really the lower court, and drew the gateway
building and its pavilions as generic cream blocks.

## The through-road

**Cause.** The asphalt with lane markings in G01-G08 was not a mapped road. It was the ride's last leg to the entrance
(the curated access path) drawn as road by the route layer.

**Now.**
- `greathallplan.ts` `GH_PAVED` is in `science.ts` `offAsphalt`, so the route lays no asphalt, kerbs, pavements or
  roadside trees in the compound.
- The access path runs from the turning loop:
  1. through the arch;
  2. across the lower court;
  3. up the north side flight;
  4. across the upper court to the portico steps.

  The points are in `registry/access.json` and `GH_VIA`.
- The gateway's outline is split either side of the passage (`registry/corrections.json`, reshape `parts`; the
  geography build now supports a split outline). The arch is open ground, not a solid footprint.
- The real roads outside are unchanged.

## Corrections made

**Levels** (relief.ts; the values are estimates read from the risers):

| Level | Height | Extent / reference |
| --- | --- | --- |
| Upper court | 21.0 m | the portico to the wings' east arms |
| Lower court | 19.5 m | |
| The hall's platform | 21.9 m | under the portico; five steps (R54) |
| The gateway's passage floor | 19.95 m | three threshold steps either side, red risers and dark edges (R34-R36) |

**Steps.**
- Two flights of five worn dark grey steps with a landing climb from the lower court to the upper (R46-R50).
- The lower flight is divided by a stone planter (R46, R47); the way up is either side of it.
- The steps are modelled as stairs, not a texture on flat ground, and there is no ramp through them. The bike climbs
  stairs as the game's other stairs (relief stairways).

**Stone and coping.**
- Irregular tan, ochre, grey and brown stone (a polygonal texture) on the planters, cheeks, retaining edges, pier bases
  and walls.
- Red coping is a separate part.
- The stairs here are dark grey from these photographs: Commonwealth's dark-brown rule is not carried over.

**The hall.**
- **High hall.** A high hall with the clerestory row under a broad weathered hip roof and a finial.
- **Aisles.** Lower aisles along both sides with long dark grilles under lean-to roofs (R04, R05, R58).
- **Front.**
  - The lower tiled canopy is over a deep portico of four tall white supports.
  - Behind them, the recessed entrance wall has the long grilles above each bay.
  - In R54's order from the top: Established 1948 with a round dark-edged feature either side, then GREAT HALL, then
    the dark doors.
- **Beside the portico.** The lower blocks with small square windows (R51-R53).
- **Behind.** The semicircular projection of the earlier brief (S4) is kept.

**The clock tower.**
- The rounded shaft is replaced by a rectangular white shaft at the upper court's corner beside the hall's front (A01).
- It has small square openings in a vertical series on its court face and its north face.
- The projecting window with its pointed red cap is low on its court face (R06-R08).
- It has a balustrade, the projecting square clock stage with a dark patterned surround, a cornice, the lantern stage and
  the red shaped cap.
- The old tower (`landmarks.ts`) is removed, and its flag with it.

**The wings round the upper court.**
- One storey, under hip roofs with dark eaves.
- Verandas of white columns at varying spacing, a raised floor with a red edge, and a white ceiling.
- White walls over a pale cream band and a dark skirting (Commonwealth's all-white rule does not apply).
- The openings vary: brown timber shutters open on glazed windows, black barred windows, and doors with small windows.
- In the middle of each side wing is a taller gable passage, its arch open through it (R02, R03, R10, R53, R55).
- The AC units on the outer faces are kept (earlier brief, S6).

**The way down.**
- Two square white piers on stone bases, with lantern heads and red caps.
- Two black tanks on open angle-iron stands with ladders, at the arms' ends (R11-R20).

**The lower court.**
- **Bust walk.** On the south side: twelve bronze busts on grey stone pedestals, each with a pale ring of stones, in a
  lawn strip before a clipped hedge and the veranda (R25-R45). Each bust is placed once.
- **Bust wing.** Its two crimson roofs are from the aerial; its veranda faces the court, with red pots.
- **North side.** A narrow veranda wing.
- **Court.** Raised beds of stone with red coping and red flowers, patches of crazy paving, drain grates, and frangipani.

**The gateway building.**
- Two storeys, with the upper window row on both faces (R15, R22).
- The arch through the middle, with thick reveals, the passage ceiling and the gate leaves open against its sides.
- Narrow brown louvred windows below.
- Its pavilions with low links to it, and the covered walks out to the outer buildings.

**The upper court.**
- Weathered slab paving, a grid of lawn panels with the axis walk between them, patches of crazy paving and drain grates.
- Two big shade trees in its lower half (A01), flowering shrubs, and small palms in white square pots.
- The dark rounded object on its white segmented base (R51-R53). Its function is not established.

**The approach.**
- Paving and low stone walls from the gateway down to the loop.
- The semicircular garden inside the loop: a paved arc round a half lawn, flowers, frangipani.
- The formal garden between roads 435 and 436:
  - a paved approach strip;
  - a paved grid with three rows of lawn panels in clipped edges;
  - a second square with its lawn and side panels;
  - paving on to the bottom road;
  - flowering trees down both sides.
- The flanking long buildings are one storey with hip roofs, and the buildings at their east ends two storeys.

## Busts

Plaques are transcribed only where the close-up is legible:

| Tour frame | Plaque |
| --- | --- |
| R28 | EBENEZER ODURO OWUSU (2016-2021) |
| R29 | CLIFFORD NII-BOI TAGOE |
| R30 | IVAN ADDAE-MENSAH (1996-2002) |
| R40 | DAVID MOWBRAY BALME, Principal 1948-57 |
| R44 | ...ASENSO-OKYERE (2002-06); the first name is not legible |
| R45 | ERNEST ARYEETEY (2010-2016) |

- **Count.** The other six close-ups (R31-R33, R41-R43) are left as blank plaques. The twelve close-ups are taken as
  twelve different busts.
- **Order.** Their order along the walk is not established. The modelled order follows the tour: the shuttered wall
  behind R28-R33, the barred windows behind R40-R45.

## Checks

`npm run test:routes` has a Great Hall section. It checks:
- the levels of the upper court, the lower court, the portico and the passage;
- the two flights, with a landing;
- the portico and threshold steps;
- no asphalt in the courts;
- that the access path goes through the arch, up the flights and across the upper court;
- that the ride from Commonwealth Hall passes through the arch and nowhere else in the gateway's span;
- that the tower is a rectangular shaft outside the hall's outline, and the cylindrical tower is gone;
- that the busts are placed once each.

The rides to the Great Hall from Mensah Sarbah Hall, the Main Entrance and Commonwealth Hall, and from it to the banking
square, stay out of buildings.

## Unresolved, estimated or not supplied

**Measurements.**
- Every height and level is read from the photographs, not measured: the courts, the steps' counts, the hall, the tower
  (to about 43 m), the wings and the gateway.
- So are the spans that have no outline in the map: the narrow wing on the lower court's north side, the links, and the
  covered walks.

**The tower.**
- **Clock faces.** Clocks are on the east and north faces, the faces seen from the court. The other two are left plain,
  because no reference shows them.
- **Old base.** The machine-detected base the tower stood on before (ml:4f0b9b5e) stays out of the model. The aerial
  shows only canopy there.

**The hall.**
- **Ramp.** The earlier brief's ramp at the entrance terrace's north end is not carried over: that terrace is replaced
  by the portico's platform and steps.

**The courts.**
- **The dark rounded object** (R51-R53): its function is not established; it is modelled as seen.
- **The sign over the side wings' arches:** "...QUADRANGLE" is not fully legible, so it is a blank plaque.
- **The thin overhead wire and the distant mast** (R17, R58): not modelled, because their ends are not established.
- **Event tents and crowds:** treated as temporary and not modelled.

**Buildings and roofs.**
- **The crimson roofs** of the building south of the lower court are as the aerial shows them. They may be painted
  metal; their material is not established.
- **The flanking long buildings:** their storeys are read from the aerial. No names or uses are assigned.

**Interiors.** No auditorium seating, stage, ceiling, hidden rooms or tower interiors are modelled.
