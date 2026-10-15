# Diamond Jubilee Hall, behind Jean Nelson Aka Hall (batch 162)

Source: the owner's `LEGONRUSH_Diamond_Jubilee_Hostel_Reconstruction.pdf` (35 pages: M01 satellite, M02 vector map,
P01-P07 photographs, R01-R12 real video frames, G01-G08 game frames, corrections DJ-01 to DJ-25). Every page was read
and the pictures were checked at full size. The comparison is `sheet.jpg`. Code: `src/game/djplan.ts` (every number)
and `src/game/diamondjubilee.ts` (the model and its grounds).

## Identity and registration (DJ-01, DJ-25)
- **Asset [VERIFIED]:** the unnamed map outline with two holes west of Jean Nelson Aka Hall (centre x −270, z 1856).
  It is the smaller double-court block beside Jean Nelson on M01 and M02. Jean Nelson and the other halls are not
  touched. The route HUD's "TO DIASPORA DOME" was a destination only. Nothing was renamed.
- **Frame:** x runs along the outline's long west edge from the north end, and z runs across it. Negative z faces the front
  (east), toward Jubilee Link and Jean Nelson.
- **M01 registration:** the four rooftop tank groups were matched to the outline's corner projections (fit within 0.9 m):
  - x = 0.1527 px + 0.2696 py − 181.66
  - z = −0.2453 px + 0.1415 py + 27.09
- **Metre basis:** the map outline (wing depths, courts, towers) and the game roads. Mapped lane 365 runs along the front
  13 m out, side road 366 runs on the cross-connection's axis, and Jubilee Link is 32 m out. No surveyed dimensions
  were supplied.

## The building
- **Massing (DJ-01, DJ-02, DJ-08):** four occupied levels on every wing (ground + 3; 3.1 m storeys, eave 13.2 m), in
  place of the two-storey block.
  - The wings follow the outline. The front wing is 8.5 m deep. The rear wing is 14.2 m deep and longer at both ends, as
    the outline shows. The north end, the cross-connection and the south end wings complete the ring.
  - Courts C1 (north) and C2 (south) are open to the sky. The cross-connection divides them.
- **Walls and colour (DJ-07):** warm white over a light beige base band to the ground-floor sills. The dark brown base
  is gone.
- **Openings (DJ-04):** grey-framed louvred glass, no white crosses.
  - Room wings: a broad louvred window, a narrow slit, a solid pier and a short high slot (6 m bay).
  - Courts' end walls: regular broad louvred bays (P01 1).
  - Wing ends: mostly solid, with one slit a bay.
  - [ASSUMPTION] the exact bay order of each elevation; the faces that cannot be seen repeat the seen ones.
- **Stair towers (DJ-03):** at the outline's four corner projections, where M01 shows the tank groups.
  - Each tower has a solid pale base, a pale frame of corner piers and a parapet, and close dark vertical fins with gaps.
  - The landings and diagonal flights show behind the fins, which wrap the outer corner. The rest of the long face has
    open landings with rails.
  - The tower rises 2.8 m above the eave and carries three black tanks.
  - The named tower is the north-east one, facing the forecourt (R01-R06). Its pale strip carries DIAMOND (reading down),
    JUBILEE HALL and the 75 emblem, with grey cladding on the return beside the front wing (R05).
  - [ASSUMPTION] the non-named towers' landing side and the rear towers' fin layout mirror the front ones (P02, P04).
- **Entrance (DJ-05):** one feature on the front, on the cross-connection's axis:
  - dark blue-grey glazing in a grey, charcoal and light panel border, rising to the roof;
  - a thin flat canopy with a dark edge;
  - glass doors in dark frames.
  - [DECISION] the position: on the mapped side road's axis, not seen on M01.
- **Roof (DJ-07):** low pitch (0.32), muted red-brown, with thin pale fascias.
  - The long wings are hipped at their ends.
  - The end wings and the cross-connection are gables whose ridges die into the long wings' roofs, so there are no bulky
    corner hips.
  - The courts stay open. Tanks sit only on the towers.
- **Courts (DJ-09, DJ-10):** pavers; four low concrete-edged beds with soil and small plants around the paths (P01 4;
  M01 3 is geometric). Stacked corner landings (P01 2) open at each floor with a rail and a door, on the long walls
  beside each corner. Downpipes on the long faces.
  - [ASSUMPTION] the bed layout is simplified, and is the same in both courts.

## The ground
- **Frontage (DJ-06):**
  - Grey-tan interlocking pavers over the whole forecourt and a north apron. Lane 365 and side road 366 are pavers
    there (`science.ts` `offAsphalt`); their routes are unchanged.
  - Kerbed lawn islands with young trees: a row before the building, with the entrance between two of them, and small
    squares east of the lane.
  - The planted strip along the front, with red-leaved accents.
  - The red hydrant-like post on the lawn left of the entrance (R10, R11).
  - Slim grey lights along the front walk and the forecourt's outer edge.
  - The open drain, with slabs at the side road, and the grass verge to Jubilee Link.
  - Generic trees, lamps, kiosks and painted kerbs stay out (`ownsDj`).
- **Rear (DJ-22, DJ-23):** red earth round the rear and both ends, thinning into rough grass at ragged edges. Beyond it,
  grouped low scrub (instanced bush) kept clear of the trail.
- **M01 6:** the pale slab west of the hostel with a small one-storey structure under a grey sheet roof.
  - [ASSUMPTION] its use is unresolved.
- **M01 7:** the detached small red-roof building and the black tank group on a slab, beyond the trail. They are separate
  from the hostel.

## Not modelled
- Scaffolds, aggregate piles and paver stacks: construction stage.
- Parked cars: they vary.
- The interiors and the room and corridor layout: unseen.

## Checks
- Typecheck, route tests and route lengths are unchanged (14 of 14).
- No NaN geometry.
- The road-blocking scan of the area is clear.
- The stuck scan: the verge lights were moved off Jubilee Link's edge. The remaining points are on the Jean Nelson side
  and were already there.
- The build and smoke tests pass.
