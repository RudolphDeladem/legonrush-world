# Legon buildings: modelled from reference photos

LEGONRUSH draws every building footprint with one generic builder (`src/game/facades.ts`): cream walls
tiled with window bays, a plinth and a terracotta roof, with the height taken from the master geography.
Buildings are now being rebuilt **one group at a time** to match how they really look, with their real
height, entrances, windows and roof. A modelled building keeps its mapped footprint (routing, collisions and
the map still use it), the generic builder skips it, and its model is placed on the footprint.

| Step | Buildings | Model | Evidence |
| --- | --- | --- | --- |
| 1 | The Diaspora halls: Dr. Hilla Limann, Alexander Kwapong, Elizabeth Frances Sey, Jean Nelson Aka | `src/game/halls.ts` | owner photos (5) and description |
| 2 | Jubilee Hall, International Students Hostels 1 and 2 | `src/game/hostels.ts` | owner's marked layout, owner photos (3), earlier reference photos (5) |
| 3 | The banking square: bank compound (CBG, UMB, Stanbic, ATMs), Union Building (Ecobank), ADB / HFC | `src/game/banking.ts` | owner's labelled aerial, owner photos (3) |
| 4 | Mensah Sarbah Vikings Hostel, School of Law | `src/game/vikingslaw.ts` | owner photos (5), earlier layout photos (2) |
| 5 | School of Engineering Sciences, and the hill it stands below | `src/game/engineering.ts`, `src/game/relief.ts` | owner's marked layout, reference render, photos (2) |
| 6 | Diaspora Dome, International House, woods round the School of Law; no building between Kwapong and Sey | `src/game/dome.ts` | owner aerials (2, registered), photos (3) |
| 7 | Pentagon: Old Pent courts, the admin block, New Pent blocks A, B, C | `src/game/pentagon.ts` | owner's labelled aerial (registered), photos (3) |
| 8 | Commonwealth Hall, its stairway and gate houses, and Legon Hill | `src/game/commonwealth.ts`, `src/game/relief.ts` | owner's labelled aerial (registered), photos (4) |
| 9 | Volta Hall and the Volta Hall Annex | `src/game/volta.ts`, `src/game/relief.ts` | owner's marked aerial (registered), photos (3) |
| 10 | Mensah Sarbah Hall, Akuafo Hall, Legon Hall | `src/game/greathalls.ts`, `src/game/rectilinear.ts` | owner's photos (4, entrances marked), owner's panoramas (3), UG layout aerials |
| 11 | The Athletic Oval and its courts; Maison Française one floor | `src/game/athletics.ts` | owner's panoramas (2), registered atlas |
| 12 | Legon Hall Annex A, B, C, Akuafo Hall Annex A, B, C, D and Mensah Sarbah Annex A, B, C, D | `src/game/annexes.ts` | owner's photos (5) and top views (2), entrances marked |
| 13 | Central Cafeteria (CC), SRC Union Building, Standard Chartered ATM building | `src/game/cc.ts` | owner's photos and aerials (4), entrances marked |

Shared pieces (facade runs, roofs, merged parts, signs) are in `src/game/modelkit.ts`; buildings made of rectangular blocks (steps 2 to 13) use the engine in `src/game/blocks.ts` (each site lists its specs; `src/game/sites.ts` collects them).

## 1. The Diaspora halls

All four halls are one design. Each is built on its OSM footprint (confirmed by Google Open Buildings,
157 m × 79 m, courtyard 126 m × 45 m); only the orientation differs.

**Arrangement** (from the owner): the halls stand in a row in two facing pairs. Coming in from Jubilee Link,
**Dr. Hilla Limann** is the first hall; it faces **Alexander Kwapong**. Their front entrances face each other
across their car parks. Past a playing field, **Elizabeth Frances Sey** and **Jean Nelson Aka** face each other
the same way. Every hall also has a **back entrance**, on the opposite facade, with no car park.

**What the model has** (matched to the photos):

- **Height:** four storeys (ground + three), 3.15 m each on a 0.45 m plinth, a plain eave band, walls 13.5 m,
  roof ridge 18.2 m. The master geography now records 4 levels / 18 m for all four
  (`registry/corrections.json → heights`; OSM had Limann as 3 levels, the others were estimated).
- **Plan:** a closed quadrangle round a courtyard; wings 15-17 m deep (from the mapped courtyard ring).
- **Roof:** terracotta tiles, hipped at the outer corners, valleys round the courtyard, white fascia boards
  and soffits on both eaves.
- **Entrance pavilions** at the centre of both long facades (front and back are the same, as in the
  photos): a 10 m wide block standing 2.2 m forward of the facade, a front-facing gable with a white
  pediment and rake boards, a tall round-headed window over the top floors with bronze mullions and
  transoms, small flanking windows, a string course, and a porch: four slim white columns, a flat canopy
  with the hall's name, glass doors in bronze frames, a platform and two steps.
- **Facades:** white render; upper floors are recessed balconies behind solid white parapets with
  timber-framed windows at the back, between white piers and slab bands; the ground floor has dark timber
  louvred windows; the ends of the long facades are plain white. At night the windows and lobbies light up.
- **Stair towers:** white shafts with open stairwells (dark slots crossed by landing slabs) on the outer
  long facades and behind each pavilion on the courtyard side, rising through the eaves with two black
  water tanks on top; tank stands on the side-wing ridges; open stairwells on the courtyard faces.
- **Courtyard:** paving with planting along the walls and lawns, the portal-to-portal walk and a cross
  walk, a round fountain plaza in the middle, a teal volleyball court on one side and a green basketball
  court (red centre circle and keys, hoops) on the other, and trees.
- **Car parks** in front of each hall (OSM). The two OSM "car parks" behind Limann and Kwapong are drawn as
  paved forecourts (`registry/corrections.json → reclass`), since the back entrances have no car park.

**Entrances in the data:** see [LEGON_ENTRANCE_VERIFICATION.md](LEGON_ENTRANCE_VERIFICATION.md). The front
door is the middle of the facade facing the partner hall (`faces`), the back door the middle of the opposite
facade (`awayFrom`); `/geo/` shows both (open *Destination entrances* and pick a hall). Rides end at the front
door.

**Kept clear:** the courtyards, porches and stair towers are kept free of generated trees, hedges, benches
and people (`inDiasporaHall` in `life.ts`).

**Cost:** each hall is five meshes (window walls, plain render and trim, roof, glass, courtyard) plus two
sign planes; the four halls share one set of geometry, and each mesh is skipped beyond the fog like the
other buildings.

**Not modelled yet / open points (Diaspora halls)**

- The swimming pool the aerial shows in one courtyard, and the exact layout of planting and paths in each
  courtyard (all four use the same layout).
- The paved walkway across the car parks between facing portals.
- Window counts per bay are approximated (a 3.6 m bay).

## 2. Jubilee Hall and the International Students Hostels

The owner's satellite layout marks the three buildings, their entrances and the two car parks (between
ISH 2 and Jubilee, and between Jubilee and ISH 1). It was registered to the OSM footprints by roof colour
(2.8 px/m, 1° rotation); the ISH outlines land on their roofs, so the marks become map coordinates.
Each building is modelled as rectangular blocks measured from its footprint, with storeys, roof and a
facade style per face, plus the details below.

### ISH 1 and ISH 2 (one design)

- **Height:** four storeys of 3.1 m under a terracotta hipped roof with a dark fascia (photos; OSM had
  ISH 2 at 3 levels, ISH 1 was estimated). Master geography: 4 levels / 17 m.
- **Plan** (from the footprints, confirmed by the layout): two long bars joined by a spine near the east
  end, a short west wing on the south bar, and a courtyard between them. The spine's roof runs through
  between the bars' roofs, as the layout shows.
- **Annex:** a one-storey flat-roofed block fills the space between the bars at the east end, with water
  tanks and AC units on it (the light flat roof the layout shows there; not in OSM).
- **Facades:** north side a plain grid of wide dark windows between white piers and slab bands (owner's
  photo); south side recessed balconies with beige back walls and white parapets alternating with narrow
  stair windows, over a brown base (`international_students_hostel_1`).
- **Entrances** (owner's marks): ISH 1, the small gabled porch (cream walls, tile gable, white pediment)
  on the north facade, facing the car park it shares with Jubilee; ISH 2, the flat entrance canopy on the
  south facade, facing the car park between it and Jubilee. Signs on both.

### Jubilee Hall

- **Height:** three storeys of 3.2 m, except the **east wing along the car park, which has two** (owner).
  Master geography: 3 levels / 14 m (OSM had 2 levels for the whole hall).
- **Plan:** wings round a long courtyard, from the footprint: east wing, north wing with its north-east
  and north-west corner blocks, west wing, south wing and the south-west jog.
- **Roofs:** brown-orange tiles, hipped per block, as the photos show.
- **East wing:** two storeys; on the courtyard side four gabled balcony bays (white gables with a
  round-headed opening, recessed balconies with tan stone parapets), owner photos.
- **North wing, courtyard side:** round-headed windows over an open arcade (owner's courtyard photo).
- **Other faces:** dark windows in white render, wider on the ground floor.
- **Entrance corner** (owner's mark and aerial photo): the doors in the re-entrant corner at the south
  end of the east wing under a flat brown porch roof on white columns; a portico from the car park
  (white posts and beams with a brown band, the hall's sign); the round white tower beside it, open at the
  top; and a flat-roofed block with roof railings and two black water tanks against the east wing.
- **Courtyard:** two tank stands, a tree, a covered walk with a red roof along the west wing; the hut in
  the courtyard is the mapped Didi Jollof.

**Kept clear:** porches, the portico and the annexes are kept free of generated props (`inHostelModel`).

**Open points:** the 2-storey/3-storey split of the north wing's corner blocks is read from the courtyard
photo; the hostels' annex height (one storey) is read from the layout only.

## 3. The banking square

The owner's labelled aerial was registered to the OSM footprints by roof colour (4.2 px/m, 1° rotation). All
three buildings are **single storey** (owner; master geography now records 1 level for each).

### The bank compound

- **Plan:** a ring of rooms round a courtyard, from the OSM footprint (a ring with notches). Where the footprint
  leaves the long sides open, the aerial shows the roof carrying on: they are **verandas** (posts along the roof
  line); the short sides have covered walkways between projecting bays.
- **Roof:** one red roof over everything, hipped at the outer corners, valleys round the courtyard (aerial; the
  owner's CBG photo shows the red roof and white render).
- **Courtyard:** the car park (asphalt, bays, parked cars, a tree), reached through the **big entrance in the middle
  of the north wing** (owner, marked red): gate pillars and a beam with the square's name.
- **CBG** (west wing, labelled C): the door on the south side (owner), with red-tiled steps, two red pillars, a
  grey canopy with the CBG sign, the Ghana and CBG flags and an ATM kiosk, as in the owner's photo.
- **UMB** (south wing, F; first labelled First Bank Ghana, corrected by the owner): cream render, steps up to a porch on
  white pillars under a dark charcoal gable with louvre lines and the yellow umb logo (owner photo).
- **Stanbic** (north-east part, S): a door with a blue STANBIC BANK canopy in the north face of the north-east corner
  block, toward the road and car park (owner's close-up).
- **ATMs** (the owner's purple section): the bay that juts out at the north-west, with two ATM machines facing the
  road and an ATM sign.
- **Facades:** white render, a dark window in each bay over a red-brown base.

### The Union Building (Ecobank)

- **Plan** (OSM footprint, matches the aerial): a square core with two short wings on each side and notches
  between them; a lantern over the middle (OSM maps it as a small round courtyard).
- **Roofs:** light terracotta, hipped per wing, with solar panels; the lantern is an octagonal drum with a gold cap.
- **Facades:** white walls with wide blue-tinted windows in blue frames (owner photo).
- **Entrances:** Ecobank in the north notch (owner's marked close-up), glass doors under a blue canopy with the
  ECOBANK sign; the Union Building in the east notch, glass doors in blue frames, the ALUMNI BUILDING sign, a
  block-paved forecourt (owner photo).

### ADB and HFC (Republic Bank)

- OSM maps only the brown-roofed block on the east side; the aerial shows **two red-roofed blocks** beside it
  (the northern one about 17 m × 13 m, the southern 15 m × 27 m), added from the registered aerial. White
  canopies on the south side. The banks' doors are not marked, so their entrances are unchanged.

**Open points:** the courtyard's parked cars are fixed props.

## 4. Mensah Sarbah Vikings Hostel and the School of Law

### Mensah Sarbah Vikings Hostel

- **Name:** renamed from *Vikings Hostel* (owner) to tell it apart from Mensah Sarbah Hall (nicknamed Vikings) and its annexes.

- **Height:** five storeys (owner; master geography: 5 levels / 18 m).
- **Plan** (OSM footprint, matches the owner's aerial): an L of a long north-south wing and an east wing, with
  the single-storey entrance block in the inner corner.
- **Facades:** the long sides have corridor balconies behind solid white parapets with beige back walls (owner
  photos); the end walls are plain white with square windows and a column of glass-block stair windows; a
  terracotta base runs round the building; hipped red roof with a dark fascia.
- **Entrances** (owner's marks): the VIKINGS HOSTEL block (sign board, door at its left) facing the car park; a
  second door at the foot of the long wing's south end.

### School of Law

- **Height** (owner photos): the long block is **four storeys** (a tall glazed ground floor, a floor of small
  square windows, two floors of gridded windows) under a deep eave; the round entrance building is **two** (a
  glass ground floor between white columns, a white band with the LAW crest, a ribbon of windows); the south
  block is **two** under a tile roof.
- **Footprint:** OSM's outline sat about 10 m off; it is replaced by Google Open Buildings' footprint, which
  matches the owner's layout photo (long block, rotunda at its west end, south block); `corrections.json →
  reshape`.
- **Finish:** peach render in large panels, dark-framed windows, AC units on the courtyard front.
- **Entrance** (owner's marks): the rotunda's glass doors, up wide steps from the paved courtyard that opens to
  the road on the east; the steps run along the long block too.

**Open points:** the rotunda's radius and the courtyard's extent are read from the layout photo.

## 5. The School of Engineering Sciences

- **Height:** four storeys of 3.4 m (owner photos and render); the stair towers rise a little above the eaves.
- **Plan** (OSM footprint, matches the layout): the front block on the south (the entrance), a west block, an east
  block and a block at the back round a light well, joined by stair towers and links.
- **Roofs:** orange-brown tile, hipped, with black fascias; the towers have flat roofs with black water tanks.
- **Facades:** white render with panel lines and pairs of dark windows in white frames; the towers are faced with
  lattice breeze-block screens and have tall arched windows down their fronts.
- **Entrance** (owner's mark): the porch on white columns under a tile roof in the middle of the front block, its
  band lettered SCHOOL OF ENGINEERING in blue capitals; steps and glass doors behind.
- **Aeroplane** (the owner's green mark, east of the front block): a military training aeroplane in green
  camouflage on a concrete pad inside a metal mesh fence (posts, rails, wires with openings between them). The
  OSM outline there is replaced by the model.
- **Car park** (red mark): the mapped car park on the west, with parked cars.

### The hill (`src/game/relief.ts`)

The campus was flat. The school stands below the road: the building, its forecourt and the car park lie on a floor
**4.5 m below** the surrounding ground, with straight slopes back up to it (28 m on the south, about 20 m on the
other sides). The access road from the main road on the south goes down the slope.

`groundHeight(x, z)` is 0 everywhere else. The ground over the zone is its own mesh (the flat ground has a hole for
it); roads are given extra points inside the zone so they follow the slope; one pass lowers every merged mesh,
instanced prop and placed model in the zone (roads, verges, car parks, trees, lamps, parked cars, the model);
the rider, rivals, coins, treasures, puddles, grass tufts and the chase camera follow the ground. Route tests
check that the forecourt is below the road, the main road is at ground level and the rest of the campus is flat.

## 6. Diaspora Dome, International House, and corrections round them

### Diaspora Dome

Across the road **north-west of the Lizalex Quadrangle** (the open ground between Alexander Kwapong and Elizabeth Sey
halls), beside Kwapong. The four Diaspora halls are identical, so the owner's aerial was first tied to the wrong hall
(the dome was drawn west of Jean Nelson Aka); the owner's labelled map fixed it, and the model moved by the exact
Jean Nelson Aka-to-Kwapong offset. The Google footprint there, drawn as a two-storey block, is the dome itself and stays
replaced by the model; the outline west of Jean Nelson Aka, wrongly removed before, is back.

**Not a storey building**: four single-storey white marquee halls (pitched white membrane roofs with grey ribs and
white gable ends, white walls with a row of windows over a grey skirt) round a lawn with paved paths in an X and a
cross and a round plaza with a cross in it; green-roofed cabins; a dark green fence along the sides and back.

**Entrances** (owner's marks): the front of the lawn between the two big halls is **open to the road, no gate**; the
halls have **several doors onto the lawn**: four on each big hall's lawn side and one on the small hall at the back.
The service road on the east comes in through a gap in the fence. Rides end in the open front.

### No building between Kwapong and Sey

Three satellite-detected outlines in the field between Alexander Kwapong Hall and Elizabeth Sey Hall were drawn as
two-storey blocks; the owner says there is no building there and the aerial of the four halls shows the field, a
road and parked buses. They are excluded (`corrections.json → exclude`).

### International House

- **Height:** four storeys (owner photo; master geography 4 levels / 15 m).
- **Plan** (OSM footprint, matches the registered aerial): a square block round an off-centre courtyard.
- **Roof:** one low dark-brown hipped roof over the ring, valleys round the courtyard.
- **Facades:** white, recessed bays of brown louvred windows on the upper floors, a strip of dark glazing on the
  ground floor, AC units.
- **Entrance** (owner's mark): the porch on the west face toward the law-school road: a tile hipped roof, a white
  arched gable with a dark brown arch, glass doors, the name board.

### Woods round the School of Law and International House

The owner's aerial circles three wooded zones (west and south of the School of Law, east of International House).
They are added as wood areas measured on the registered aerial (`corrections.json → addAreas`); woods are planted
more densely than before so they read as woodland.

## 7. Pentagon (Pent)

The owner's labelled aerial was registered to the OSM footprints (2.5 px/m).

**Names** (owner): New Pent *Block A, B, C*; Old Pent courts west to east (coming from Engineering) *Dar es Salaam,
Kampala*, the admin block, *Addis Ababa, Nairobi*. The source names had the courts in a different order and are
corrected in `naming.json`; the code's references and aliases follow.

### Old Pent courts (one design)

- **Height:** three storeys (owner photo).
- **Plan:** four white blocks (about 17 m × 15 m) round a cross of open gaps, joined by a central stair core; the
  courts are turned about 5° like the row. Dar es Salaam and Kampala are mapped as four squares and a core,
  Addis Ababa and Nairobi as one outline each; all four use the same model.
- **Look:** white render, pairs of dark windows in brown frames, a red base, terracotta hipped roofs with dark
  fascias; the core rises into a tower with a front gable and an arched window.
- **Entrance:** a small tiled porch on white posts at the foot of the core, on the north face toward the road.

### The admin block (Ghana Hostels)

- Four storeys: two towers with front gables and brick-red corner panels either side of a recessed centre with a
  railed balcony; a tiled veranda along the ground floor; the gabled porch with a sunburst gable and the GHANA
  HOSTELS LTD sign, on the north face (owner photo and mark).

### New Pent blocks A, B, C (one design)

- **Wings:** the mapped footprints, now four storeys (master geography 4 levels / 15 m) in cream render with
  terracotta roofs (`newPentStyle`).
- **Entrance pavilion** (owner photo and marks): a projecting tower the height of the block with an arched window
  under a front gable and a balcony row, over a columned porch with an arched opening and a small tile gable,
  facing the car park on the south.

**Open points:** the New Pent wings keep the generic window pattern (cream render, brown-framed windows); the
brick-red panels on some walls are not modelled.

## 8. Commonwealth Hall and Legon Hill

The owner's aerial (the purple-marked layout) was registered to the OSM and Google footprints by roof colour
(IoU 0.47; the image's bottom is east, toward the stairs).

### The hill (`src/game/relief.ts`)

Commonwealth stands on **Legon Hill**, which rises west from the end of University Avenue (x = -362, still level
with the campus) through the hall to the Great Hall at the top (the shape of the Copernicus DEM, eased): about
**9 m** at the drive in front of the gate, **15.5 m** at the hall's west end, **21 m** at the Great Hall, then down
behind it; it falls away to the sides over 140 m. The **stairway** from the gate houses to the drive climbs the
9 m in **seven flights of nine steps** with landings between (the ground there is the stair surface, so the rider
walking up climbs step by step; the ground mesh keeps just under the modelled steps). The Great Hall's tower and
everything else on the hill stand on it. Route tests check the rise from the avenue to the forecourt, through the
hall and on to the Great Hall, and that the avenue below the stairs and the campus beside the hill stay flat.

### The approach

- **Gate houses** (owner photo, picture 1): two single-storey white houses with dark hip roofs and blue signs either
  side of the foot of the stairway, set back from the road loop at the end of the avenue (they once stood over it); low stone walls and paving between them. The way in between them is
  a secondary entrance of the hall (`access.json → secondary`, `free`: it stays where the owner marks it rather than
  snapping to the hall's outline).
- **Stairway** (owner photos): mapped as a footway of steps (`corrections.json → addWays`, snapped onto the road at
  the foot and the drive at the top); modelled step by step between stone walls that step with it, palms either
  side, two pools on the first landing, and the **stone arches** under the forecourt at the top, which the walk
  passes on the north.
- **Forecourt:** red paving in front of the gate with the crest ring, a low stone wall along its edge; the drive
  crosses it.

### The hall

- **Heights** (owner): the **front** row, entrance included, is **two storeys**; inside, the **horizontal** blocks
  on the owner's aerial (the purple lines: the crossbars either side of the central court and the shorter stubs
  further along) are **three storeys**, one floor above the **vertical lanes**, which are **two storeys**
  (`corrections.json → heights`).
- **Plan** (registered aerial): two pairs of lanes run west from the front row, a long crossbar either side of the
  central court, stubs across the lanes further along, two-storey pavilions on the central walk (a passage through
  each), the library across the walk at the top of the court, the amphitheatre beyond it.
- **On the hill:** every block stands on the ground under it; the lanes are built in lengths between the bars that
  cross them, so they step up the slope (`Spec.onGround` in `blocks.ts`).
- **Entrance** (owner's red and blue marks, pictures 1 to 3): the gate in the middle of the two-storey entrance
  block, facing east down the stairs: a portico of two white columns under a lattice frieze, stone plinths with the
  hall crest either side of the steps; on the court side tall narrow windows through the upper floor over a canopy
  slab; a lantern and a brick stack on the roof. The lanes end either side of it in gables facing the forecourt.
- **Look:** white render, dark windows in brown frames, orange tile hip roofs with white eaves.
- **Gardens:** lawns, hedges, flowering bushes and palms along the walk through the courts; trees and bushes all
  round the hall and on the slopes either side of the stairway.

**Open points:** the dining hall and the chapel keep the generic builder; the amphitheatre is drawn from the aerial only.

## 9. Volta Hall and the Volta Hall Annex

The owner's aerial (north up) was registered to the OSM footprints (0.27 m/px); the hall's outlines land on their
roofs.

- **Heights** (owner): every part of the hall is **two storeys**, the green-marked blocks included; only the
  **Annex** (circled yellow, north of the hall) has **four** (`corrections.json → heights`).
- **The Annex's outline** sat 12.4 m east of its roof on the aerial (the rest of the hall fits); it is moved onto the
  roof with its shape unchanged (`corrections.json → reshape`, which now takes the holes too). Modelled as four
  storeys of white render with long bands of windows (owner photo), balconies along the court sides, low tile roofs;
  a court open to the west and a closed one; a door on the south face where the hall's walk arrives.
- **Plan:** two lanes north-south round the central court with bars across their north ends, blocks across their
  south ends either side of the walk, the front block with the entrance, the blocks closing the south court, and the
  west block with its wings; white render, dark windows in white frames, terracotta hip roofs with dark fascias.
- **On a terrace** (`relief.ts`, the terrace kind of zone): the hall stands **2.4 m above Volta Hall Road**, its
  east front over a stone retaining wall with a hedge along the top; the Annex to the north is at road level. The
  terrace is two rectangles over the hall's blocks only (the courts and the east front; the west block), so the lawn
  corner south-west of the hall and the road round it stay at road level.
- **The ground mesh** (`reliefGround`): each patch of ground is drawn by one grid only, 2 m cells on the hill and 1 m
  on terraces and hollows, with slopes eased at the top and the foot. Two grids used to overlap at Volta and the
  foot of Legon Hill, and the hill's coarse one rode up to a metre above the true ground there (grass over the road,
  a rider half sunk).
- **Entrance** (owner's blue marks, pictures 1 to 3): on the east face of the front block: an arched doorway with its
  gate under a small tile canopy, round windows either side above it and the hall's name board, at the top of a
  **short flight of steps** (three flights of five) between stone walls with planters and palms at the foot.
- **The climb** (picture 3): a two-storey building stands either side of it (the owner's purple mark) on the paved
  forecourt, which runs from Volta Hall Road to the foot of the steps (`corrections.json → addWays`, a footway whose
  end at the steps is open). Rides stop at the foot of the steps.
- **Courts** (picture 4): a paved walk lined with white pots runs north through the courts toward the Annex, with
  lawns, palms and bushes either side; trees round the hall.

The garden pieces (trees, palms, bushes, hedges, pots) are shared with Commonwealth Hall in `src/game/gardens.ts`.

## 10. Mensah Sarbah Hall, Akuafo Hall and Legon Hall

These halls' blocks are their mapped footprints, cut into rectangles (`src/game/rectilinear.ts`: the ring's
coordinates are lined up, the grid between them kept where the ring covers it, and cells merged into rectangles),
each under its own tile hip roof.

**Closed rings** (owner's panoramas): every block of these halls is joined to the next, north, east, south and
west. The mapped footprints leave gaps between them, so each gap of up to 15 m between two facing blocks gets a
joining block of the lower of the two heights; where a path runs through the gap, the join is a gateway raised over
an open passage. The wide openings in the middle of the long courts stay open, as the panoramas show.

- **Mensah Sarbah Hall:** the four cross-shaped blocks round the court have **three floors** (owner); white with
  maroon window frames; the fountain in the middle of the court with walks to it, palms and bushes.
  - **Entrance** (owner's blue mark on the aerial and the panorama): the **Administration and Porters' Lodge** on the
    north, two storeys with a small lantern on its hip roof, the **gate** in the middle of its front toward the
    semicircular drive, joined to the wings either side.
  - **Dining hall**, across the court on the south: one tall storey of seven tall louvred windows over a stone
    terrace and steps, a raised clerestory roof with the tall **gold lantern**, a doorway at each end, and lower
    two-storey wings either side joined to the south arms (owner's court photo and panorama). An earlier version
    put this building's look on the lodge; the panorama shows the two apart.
- **Akuafo Hall and Legon Hall** (twins either side of the avenue): **two-storey** blocks (owner), in lanes and bars
  round long courts with a walk down the middle, palms and bushes, all joined into one ring. **Akuafo's** entrance is
  the gatehouse on the north (the owner's blue mark on the panorama): square windows under the eaves, dark doors
  between white piers over a teal base, the gate into the round fountain court. **Legon's** is its north block:
  three arches on the ground floor with the entrance in the middle one (blue), a recessed balcony above, banners.

## 11. The Athletic Oval

Between Legon Hall and Akuafo Hall, south of Maison Française (owner's panoramas; the mapped track and pitches are
drawn by the model instead of as flat areas, `Spec.covers`).

- **The oval:** a worn earth running track round a dry grass **football pitch** with its markings and two goals;
  tiered concrete **seating** along the east side and round the south-east bend; trees along the north and west.
- **West of it**, north to south: the **sand volleyball** court below Maison Française, the two fenced **tennis**
  courts, a small single-storey shed, and the big **handball** court (blue on green, goal areas at both ends).
- **East**, along the road: two **basketball** courts; **north-east**, by Akuafo, the third basketball court. Each
  basketball court (and the tennis courts) has a **chain-link wire fence** round it: galvanised posts every 3 m, a top
  rail and the diamond wire mesh (owner).
- **Maison Française**, the building on the oval's north side (circled yellow by the owner), is **one floor**.
- Five satellite-detected outlines drawn as buildings on the pitch, the courts and the strip between them are
  excluded (`corrections.json → exclude`); satellite-detected outlines can now take a height from the owner too.

## 12. The Legon Hall, Akuafo Hall and Mensah Sarbah Hall annexes

Either side of the Athletic Oval (owner's photos and top views, entrances marked).

- **Legon Annex A and B** and **Akuafo Annex A and B** share one design: **six floors**, a long slab with open
  galleries (walkways with railings, floors 2 to 6) along its north face, and a shorter stair tower of the same
  height against that face, plain with slit windows; flat roofs.
  - **Legon A and B** face the same way: the entrance is on the ground floor at the **east end of the north
    (gallery) face** (owner's marks); dark grey railings. Walks added from the road reach them
    (`corrections.json → addWays`).
  - **Akuafo A and B** face each other: A's entrance on its **south face**, B's at the **foot of its stair tower on
    the north face**, both in line with the tower (owner's photo); white with blue piers and teal railings, the
    slab's **ground floor shops**, billboards on the west ends.
- **Akuafo Annex C and D**: **four floors**, facing each other across a lawn, cream with blue window panels and white
  gallery slabs on the court side, red tile hip roofs, a wing on the outer side of each (D's with water tanks). Their
  **entrances face each other** in the middle of the court sides (owner's mark on C).
- **Legon Annex C** (the Graduate Hostel, circled by the owner): the long block west of A and B with its wings,
  **two floors**, dark roofs; its gate on the long block's east face (owner's mark).
- The long rectangular building mapped on the lawns east of Annex C does not exist (owner) and is excluded.

- **Mensah Sarbah Annex A, B, C and D** (east of the hall, just past Akuafo's): the same four buildings as Akuafo's,
  laid out, labelled, painted and entered the same way (owner): A and B six floors facing each other, C and D four
  floors facing each other across the lawn.

## 13. The Central Cafeteria (CC), the SRC Union Building and the Standard Chartered ATM

South of the Athletic Oval (owner's photos and aerials).

- **CC:** **two floors**. The ground floor is half sunk, like a basement, with shops, a clinic and eating places;
  the main floor above is reached up the broad **stepped terrace** along the north side (toward the oval road),
  with **many doors** along the top of it (owner's marks; the CC's entrance is there), and by the straight stair on
  the west end beside a green canopy. Tall dark windows under a deep overhanging shallow roof of faded pink sheeting
  on V-shaped concrete brackets.
- **SRC Union Building**, opposite the CC on the west: **one floor** round a planted courtyard, red tile roof, its
  door toward the CC.
- Between them, **a few parked cars** and the small one-floor **Standard Chartered ATM** building (a new place on the
  map), its ATMs facing the CC.

## 14. Round the Balme Library: CEDI, UGCS and the blocks by the square

From the owner's marked aerial (CEDI in yellow, UGCS in purple, two-floor blocks circled red, ground-floor blocks
circled black, entrances in blue) and photos of CEDI from the west, the east and above. The aerial is not evenly
scaled, and Google Open Buildings agrees with the OSM footprints, so the footprints stay where they are and the blue
marks are placed in proportion on them.

- **CEDI Conference Centre, east face** (owner's photo from the Balme Library side): round **columns** the height of
  both floors stand out from the wall under a deep **stepped entablature**; a tall **portico** on two big columns at
  the north end shelters the east doors; the name, *UG CEDI Conference Centre, Department of Economics*, stands on a
  plaque on top of the entablature over the middle; small square windows upstairs, tall brown-framed windows below.
  A **taller block** with small square windows rises at the **south** end, set back from the east front; the raked
  auditorium roof rises at the north end.
- **UGCS** (owner's photo from CEDI): **four floors**, white, windows in brown frames in a regular grid under a long
  orange-tiled roof with a brown fascia; at the west end a flat-topped bay with a blank board and barred openings
  below it; the entrance porch under a tiled roof along the ground floor, toward CEDI.
- **CEDI Conference Centre:** a big white hall of **two tall storeys**, rows of tall narrow windows in pairs, a
  **pink hipped roof** inside a white parapet, and a raked white stage tower at the north end. The **main entrance is
  on the west face toward Volta Hall**, a porch under a red canopy (owner's photo, marked); the east face toward the
  Balme Library carries the name over a second set of doors.
- **UGCS:** entered on its south face, toward CEDI.
- **Two floors** (red): the Department of Economics (entered on the west), the University of Ghana Bookshop
  (entered on the east, on the road) and the Faculty of Arts.
- **Ground floor only** (black): the Office of the Dean of Students (entered on the south) and the Legon Post Office
  opposite it (entered on the north).
- **Standard Chartered and Absa** share one **one-floor** building south of the Bookshop: Standard Chartered on the
  west, Absa on the east by Cruise O'Brien Road, both doors on the north face (owner's marks). **Standard
  Chartered's ATMs** are on the south face, toward Legon Hall and Akuafo Hall.
- The Economic Policy Management Programme Office is entered in the notch in the middle of its south face, reached
  along the gap between it and the Faculty of Arts.

## 15. The Balme Library

From the owner's photos: the front from the south (close up, and from the far end of the long pool), a top view
from the south, the north-west corner, and the back from the round fountain in the Kuffour Quadrangle. The model
follows the OSM outline (relation 7304886) and its five courtyards, which match the roof plan on the owner's
aerial. The heights vary from part to part:

- **Front (south):** a **one-floor entrance range** with the **round-arched door** under "THE BALME LIBRARY",
  windows and notice boards either side, up a flight of steps (the Explore entrance). Either side, the **two-floor
  inner wings** run the whole depth of the library and end in hipped pavilions just forward of the entrance.
- **Centre:** a tall **centre block** with tall narrow windows under a broad hipped roof. A square stage with three
  windows a side rises from it, then the **clock tower** with a railed balcony and four clock faces, a small hipped
  cap, an open lantern and the **red spire**, about 34 m up.
- **Two-floor ranges** across the middle and along the north close the courtyards.
- **Four-floor outer wings** east and west (owner's photos of the west side, facing CEDI): bands of wide dark windows,
  a maroon base, a tiled roof along each wing with **dark boarded gable ends**, and a small **lantern** on the ridge.
  At the middle of each, a **one-floor gatehouse** under a steep pyramid roof (a dark doorway on the west), joined to
  small **pyramid-roofed kiosks** at the corners by white **perforated screen walls** on a maroon base; a porch under a
  tiled lean-to on the west wing near its south end.
- **In front:** the library **stands above** University Square and the long pool (owner's photo from the pool): the
  road before the library and the side lanes stay up; the square's **middle terrace** is 1.2 m down and the **pool
  deck** 2.4 m down, each behind a laterite **stone retaining wall** with white planters along its top, and the
  **central stairs** climb in two flights from the pool to the road (`relief.ts`: two hollows and a stairway along z;
  stairways can now climb along z and from a foot below the ground). A white statue stands on the upper level east
  of the stairs. The long pool on the library's axis, in a dark stone kerb with white planters along both sides and
  a row of jets, sits on the deck.
- **Behind (north), in the Kuffour Quadrangle:** the round fountain with a blue-banded rim, a blue-and-white pedestal
  and the blue sculpture of interlocking rings.

## 16. The Night Market, the supermarket and the one-floor buildings round them

From the owner's aerials of the current market (circled blue, the supermarket circled black) and of the area round it
(circled yellow), registered to the OSM footprints (the bank compound at 4.9 px/m, the wider area at 3.6 px/m).

- **Where:** **west of the banking square**, across the road from the bank compound (`owner:night-market`). The earlier
  map placed it **south of the banking square**, where the market stood only while it was relocated for construction:
  that ground is now **grass, trees and bare soil**, and its five buildings are excluded.
- **The market:** **one floor**, not buildings of rooms but **market zones**: rows of stall cubicles under sheet roofs
  on posts (red, blue, purple and grey-blue, and three orange sheds along the lane by the supermarket), counters and
  goods at the open fronts, a few shutters down, lanes between the rows and a shade tree with benches in the middle.
  The gaps between the rows are **at least twice** the first ones (owner: room to walk through): 1 m between
  neighbouring rows and between the orange sheds, a 2 m lane between the two red rows that face each other, and 2 m
  and 3.8 m lanes further east.
  Explore enters it from the road on its east side, between the supermarket and the stall rows.
- **Supermart:** the long one-floor **supermarket** on the market's east side, by the road: a glass shopfront with the
  week's offers, glazed sliding doors under a green canopy, and **SUPERMART** in **raised red letters** standing out
  from the wall (and again on the north end over the car park). It is a destination of its own,
  *Supermart (Night Market)*, entered by those doors. It stands **2 m west of the roof on the aerial** so that its
  entrance keeps a pavement before the road: the canopy is held off the wall on brackets and ends over the pavement,
  short of the road (owner). Its outline is set by `corrections.json → reshape`, which now also corrects
  satellite-detected outlines.
- **Round the market (circled yellow):** every building is **one floor**, a ground floor only, under a roof the
  **colour the aerial shows**, sampled roof by roof: rusty brown sheets, faded tan sheets or terracotta tiles.

## 17. Valco Trust Hostel, Phase 1 and Phase 2

From the owner's photo (Phase 1's entrance marked blue): two long slabs of **five floors** under low hipped roofs of
orange tiles, white walls with pilasters between pairs of wide dark windows and small square vents, a maroon base, and
a stair bay with tall narrow windows over a flat entrance porch.

- **Phase 1** is entered on its **north face**, through the porch under the stair bay a little east of the middle.
- **Phase 2** stands **back to back** with Phase 1 (owner), so it is entered on its **south face**, the same block
  turned round.

## 18. The football park between the Akuafo and Mensah Sarbah annexes

The open ground between the two sets of annexes (owner): **mainly bare soil**, worn by play, with **patches of grass**
left round the edges and in the corners, faded lines, and a pair of **goalposts** at either end. It replaces the flat
green pitch that was drawn there.

## 19. West of Legon Hall: the Language Centre, its neighbours and the bungalows behind them

From the owner's map of the area, two photos from the air and an aerial of the houses behind (circled white),
registered to the OSM footprints at 2.8 px/m (`src/game/westlegon.ts`).

- **Department of Modern Languages:** **four floors**, a cross of hipped **red** roofs (the corners a floor lower)
  with a **glass lantern** where they meet; on the east, toward its car park, a glazed bay between tall columns and a
  car-port canopy (the entrance).
- **Confucius Institute**, south of it: a long block of **three floors** under a weathered **dark** sheet roof; its
  door at the east end, off the lane from the road.
- **The solar-roofed building** south again (the map's *Legon hall barbeque joint*): **two floors**, a red hipped roof
  carrying **solar panels**, an arcade at its west end and a **porch under a small dark-red gable** on the south (the
  entrance).
- **Language Centre**, north-east by the road: **two floors** under orange tiles with a small raised roof over the
  middle; its door on the east face. Two small orange-roofed buildings near it are one floor.
- **The bungalows** (circled white): every building in the zone is an ordinary **ground-floor house**, built round a
  small courtyard, with its **outbuildings**; all under red tiles, each with **one door** (a step and a little
  canopy) on the side toward the nearest road. The *Career and councelling dept* is one of these houses. The houses
  on Legon Hill's slope stand on the ground.

## 20. The School of Public Health

From the owner's aerial (registered to the OSM footprints at 4.0 px/m) and photo of the three-floor front
(`src/game/publichealth.ts`). The buildings stand at an angle to the map grid; each is built in its own frame.

- **Two floors** (marked yellow): the long west wing and the south wing, round the inner court.
- **Three floors** (marked white): the wing along the east car park and the block north of it.
- **How it is built:** cream walls, big windows in **dark frames** (barred on the ground floor), a **dark fascia**
  under low hipped roofs of **terracotta** tiles. The east front has **SCHOOL OF PUBLIC HEALTH** over a forward bay
  in the middle, its **door at the north end** with a tall **lattice screen** beside it, and air-conditioning units
  along its foot. Explore enters there, from the east car park; the two-floor west wing has a second door toward the
  west car park (both circled blue).
- The four structures circled purple, north-west of the school, are **gone** (`corrections.json → exclude`).

## 21. Smaller corrections

- **Phone booths, banking square:** the two square structures north of the banking square's car park are not
  buildings but **phone booths**: square booths **walled on three sides**, open only on the face with the PHONE sign
  for people to walk in, under a flat roof of dark panels, with four payphones on a pillar in the middle
  (`parks.ts`). The satellite outline drawn as a building there is excluded, and so is the building that stood
  **between the two booths**: there is none.
- **Waiting shed, La Road:** north-west of the booths, on the verge right by La Road, a low one-floor **waiting shed**
  where people sit and wait for cars: a slab, a back wall and side panels, a bench and a flat roof, open to the road.
- **Diaspora Dome:** the building drawn **west of the dome** is excluded: there is no building that close to it.

## 22. The University of Ghana Business School

From the owner's photos (the front and the north side from the north-west corner, the front face on, the middle and
east blocks from the north car park) and the owner's aerial marking the **front (F) on the west**, toward the car
park by the road, and the side the owner calls **west (W) on the north**, toward the big car park (`src/game/ugbs.ts`).

- **Main block** (white): three floors and a fourth **set back** under a **deep flat roof slab** that overhangs all
  round; low red hipped roofs, a flat patch and a small red-roofed **penthouse** on top.
- **Front (west):** north to south, a white panel and a tall **perforated concrete screen**, the **open bay** the
  height of the building (floor slabs, columns; the *University of Ghana | UGBS (College of Humanities)* sign on the
  first-floor parapet; the two **computer laboratories** standing out on the second floor, with their windows and
  signs), a wider screen, and a big **blank panel** scored in squares. The **entrance** is the glass doors at the foot
  of the open bay (Explore goes there from the west car park). Flagpoles on the lawn to the south.
- **North side (W):** bands of windows between white piers, **balconies** standing out on the first floor, barred
  windows on the ground floor.
- **Middle block** (beige concrete, north-east of the main block): a big **grid of white-framed windows** over three
  floors in a deep beige surround, AC units in it, a recessed ground floor of white grilles and glass, and an **open
  storey** on the roof under a flat frame on posts.
- **East block** ('UGBS extention', beige): five floors of deep-set windows between projecting fins under a flat
  overhanging roof. Its OSM outline wrapped round the middle block; it is reshaped to the rectangle the aerial shows.

## 23. The University of Ghana Sports Stadium, its training track, the pool and the tennis courts

From the owner's aerial of the area and photos of the stadium from outside and of the main stand
(`src/game/stadium.ts`).

- **The stadium:** a blue running track round a green football pitch (lines, penalty areas, goals), inside a bowl of
  **green seating** in three stands (north and south curves, the east side, *UG SPORTS* picked out in white seats),
  with gaps at the corners for the entrances. The outer wall is banded in **red, white and grey stripes** over a blue
  base, with leaping athletes on it; four **floodlight masts** stand outside the corners.
- **The main stand** (west): red seats with a blue section in the middle, in front of a three-floor white building
  under the **raised roof** cantilevered out over the seats. The **main entrance** is on its west face, under a
  canopy, with the stadium's name over it (the owner: the main entrance is on the side with the raised roof). Its
  mapped outline is extended to the building the aerial shows.
- **The training track** to the south-west: blue round a grass pitch, on the mapped outline.
- **The swimming pool** (lane lines, a diving board, a white deck) and the two **blue tennis courts** in their green
  surround and wire fence, to the north-west. Satellite outlines on the courts and on the track are excluded.

## 24. Car parks

The owner: places with car parks have them, and there are cars in them.

- **Parked cars:** every mapped car park is now filled to 65 to 90 per cent (it was 35 to 75 per cent, with a cap
  of 60 cars a car park and 700 on the campus; now 220 and 2,600).
- **School of Public Health:** its car parks along the east side, along the west side by the road and south of the
  entrance are added from the owner's aerial.
- **The Balme Library:** a car park along the front of each pair of wings, and a second row of bays by the road on
  each side of the forecourt (the owner's top view, marked P).

## 25. The ground before the Balme Library

From the owner's top view: the roads, the **concrete forecourt** before the entrance (marked yellow, now a paved
area from the road to the door), the car parks either side of it, and **trees** everywhere else, with shaded leaf
litter under them rather than lawn. The only **lawn** is in the sunken square round the pool, with rows of palms on
it either side.

## 26. Corrections (Akuafo, the Balme Library's paving, the pool)

- **Akuafo Hall Annex A:** the satellite outline north of the annex's slab, west of its stair tower, is excluded:
  there is no building on that side.
- **Akuafo Hall Main:** the small blocks in and round its south courts were drawn by the generic builder in cream;
  they are part of the hall's model now, white like the rest (`greathalls.ts`: the twin takes footprints from 60 m²).
- **The Balme Library's square:** everything at road level round the sunken square is **paving**, not lawn: the strip
  before the upper wall round the head of the stairs, the strips between the lanes and the side walls, and the area
  south of the pool to the roundabout. Each level now **drops at its retaining wall** (no slope outside the wall:
  `relief.ts` slopes 0.5 m, under the wall), a wall closes the pool deck on the south, and the footway that crossed
  the square through the walls is excluded (`corrections.json → exclude` now drops ways too).
- **The swimming pool** (owner's photo): blue water in a deck of orange-red tiles with a white edge, crazy stone
  paving beyond and a hedge round it, starting blocks at the east end, and at the west end the **orange-red diving
  tower** with platforms at 3, 5, 7.5 and 10 m, white rails and a stair, two springboards beside it; the pool house
  to the north-east, white under a red hipped roof, open toward the pool.

## 27. Ground-floor buildings and the lecturers' houses in their wood

From the owner's aerials (registered to the OSM footprints) and photos (`src/game/residences.ts`):

- **Volta Hall Road stretch**, north-west of CEDI (circled blue): the small buildings are **one floor**, each with
  its door toward the road.
- **Opposite the Business School's front:** the **Larway Oraca Building** (circled yellow), four one-floor wings in a
  cross round a small court, white with a white parapet gable at each wing's end under red tiles, entered on the
  **south** (owner's mark: Explore goes there); and south of it the **cross-shaped building** (circled purple), one
  floor, white with big windows, entered by the **gabled porch** in the middle of its east front (owner's photo).
- **The lecturers' houses** east of the Akuafo and Mensah Sarbah annexes, between Akuafo Road, E.A. Boateng Road and
  La Road (circled): all **one floor**, each with a front door and a little porch, a laterite walk out to its road and
  a **gate** in a low hedge across it, on the side toward the road. They stand in a **wood**: trees all through the
  outlined area (kept off the houses, the roads and the walks), the ground under them leaf litter and moss with
  patches of bare red earth, not lawn.

## 28. The Mathematics and Statistics departments

From the owner's aerial (picture 4, registered to Google Open Buildings) and three photos taken along the arrow
on it, west to east along the north front (`src/game/mathstat.ts`). **One connected building**, not three: the
three mapped outlines (Mathematics Dept, Statistics, and the east block, now named **Mathematics and Statistics
Department**) are reshaped to the roofs on the aerial and meet edge to edge (`corrections.json`: reshape).

- **The paint:** old white concrete gone grey, stained and streaked: rain streaks under every slab edge, mottled
  patches, mildew at the foot of the walls; red paint on the plinths, planters and the screens' base.
- **The Mathematics block** (photo 1): a long bar of **three floors** under a red-painted roof slab. On its north
  face two floors of open galleries on cantilevered slabs with thick edges and thin dark railings, the walls behind
  them **ochre**, with dark doors and windows between white piers; the ground floor white, red planters along it,
  and a blank end wall at the west end. Its **car park** is in front, with cars.
- **The heavy block** joining it to the rest (photos 1 and 2): three floors stepping out over each other on the
  north and west: a first-floor box with a **breeze-block** balustrade at the corner, a second-floor gallery on
  columns, a deep roof slab. The **Mathematics door** (wooden double doors up four steps) is on its west face,
  toward the car park.
- **The main entrance** (the owner's blue mark, photo 2): glazed doors up five steps under the overhang, red
  planters and young palms beside them, an ENTRANCE board by the steps; a paved forecourt to the road. Explore goes
  here for Statistics.
- **The Statistics block** (photos 2 and 3): two floors of breeze-block screens with round openings on a red base
  and a first-floor gallery on columns, then the three-floor part with a **stair climbing the north face** from
  east to west behind a sloping parapet, a **tall screen of vertical fins** from the stair to the roof, and a
  **glazed box** on the top floor.
- **Behind it:** a glass-roofed hall (pale blue on the aerial), a walled courtyard, an inner court with trees, and
  the **east block** (three floors, white galleries toward the **east car park**, blank east end), joined by a
  stair tower and a one-floor link.

Parked cars now keep clear of a building by its real outline, not its bounding box (the Mathematics car park lies
inside the L of the Mathematics outline's box).

## 29. ISSER, the RIPS building and Computer Science; one-floor buildings

From the owner's four photos (`src/game/issercs.ts`); the layout from Google Open Buildings' roofs. **One
connected range** north of the Mathematics and Statistics departments: ISSER, the RIPS building, a link and the
Computer Science wing and east block meet edge to edge (`corrections.json`: reshape), all **three floors**.

- **ISSER** (fresh white paint): brown louvred windows deep-set between projecting piers, a deep ledge along the
  first floor and a band along the second, air-conditioners on the ledges. The **entrance** (owner's blue mark)
  is at the head of the drive from the road by the Mathematics department: glazed doors up three steps under a
  canopy reading INSTITUTE OF STATISTICAL, SOCIAL AND ECONOMIC RESEARCH, hedges either side of the drive. At the
  back the ground floor is set in behind columns under the floors above, a stair tower faced with lattice blocks
  stands out, and cars park nose-in along it on asphalt.
- **RIPS**, east of ISSER: galleries on solid parapets toward the drive; a car park along its back.
- **Computer Science** (old white paint, washed grey, streaked and peeling): the tall wing's south end is the
  front in the owner's first photo: barred windows below, a long window band with curtains, a blank stained wall
  above, louvred vents between piers on its sides, a small room on the roof with a satellite dish. The
  department's **door** (owner's blue mark) is a porch on the wing's west face, past the back of ISSER. East of
  the wing: a stair tower behind tall vertical fins, the east block with balconies (solid parapets, grilled
  windows, air-conditioners), and before it the **diesel generator house** (blue fascia, orange doors behind
  lattice grilles) and a car shed under a red-brown sheet roof.
- **One floor** (owner): the Department of Plant (and Environmental) Biology east of Computer Science, and the
  two small square buildings behind (north of) the School of Engineering Sciences.

## 30. South of CEDI, Volta Hall's link, the Innovation Enclave

- **South of the CEDI Conference Centre** (owner's aerial): the Faculty of Arts building (circled red) is two
  low floors, about half CEDI's height; the H-shaped building between them (circled violet) is four floors,
  about CEDI's height.
- **White, not cream:** every building round the Balme Library (CEDI, the faculties, the University Square blocks)
  and round Volta Hall is painted white (`world.ts`: the generic buildings there take white walls).
- **Volta Hall:** the block between the hall's east lane and the Annex was drawn skewed from a satellite outline;
  it is a straight white two-floor block joining the two (`volta.ts`, `corrections.json`: reshape).
- **The Innovation Enclave** (`src/game/enclave.ts`), south of the School of Engineering Sciences, up the hill:
  six one-floor buildings (the westmost is the Department of Plant Biology) on a terrace 2 m above the road
  behind a white retaining wall, climbed by three flights of steps (the middle one wide; `relief.ts`). Each
  runs north-south with its gable end to the road: white walls with a **wine-red border** round the foot, a
  gable roof of wine-red metal sheets, and a verandah on white square columns along the side with the doors
  (the owner's blue lines: many wooden doors, windows behind black grilles), a brick-paved walk along it.
  Lawns between the buildings, crossed by paved walks. The east building has the **UG logo** on its gable to the
  road and **INNOVATION ENCLAVE** in raised blue letters on the wall by its steps; the university's sign board
  stands before the middle buildings. Explore goes up the west steps to the Department of Plant Biology's doors.

## 31. ISSER's entrance and windows, the RIPS sign, the ground before RIPS

- **ISSER's windows** are louvred in silver-grey aluminium, not brown (owner).
- **ISSER's entrance** (owner's close photo): a lobby set in under a canopy whose deep, slightly tilted fascia
  carries INSTITUTE OF STATISTICAL, SOCIAL AND ECONOMIC RESEARCH in raised grey letters; glazed doors and a side
  light in silver frames on the left, the framed ISSER emblem and a small blue sign on the white back wall, big
  potted plants and an air-conditioner on the lobby floor, lamps in the canopy's soffit; four wide tiled steps with
  stainless rails running on past the canopy to the left; on the right a raised step edged in dark red with a
  steel railing; an EXIT sign on a post before the steps (`issercs.ts`; raised letters: `letters.ts`).
- **RIPS** has a white sign board on its second-floor parapet: REGIONAL INSTITUTE FOR on the first line,
  POPULATION STUDIES (RIPS) under it.
- **The ground before RIPS** (between ISSER and Computer Science) is paved, not grass, and a little downhill:
  about three steps (0.5 m) below the car park to its south, with a kerb along the drop and **small stairs** up
  at the end of the drive (`relief.ts`). **The car park** from there to the Mathematics and Statistics departments'
  north front is concrete throughout, no grass.

## 32. Ground fixes; Computer Science's door; seven steps before RIPS

- **The engineering school's hollow** no longer reaches the main road on its south or Annie Jiagge Road on its
  east: the slope levels out a few metres short of both, so neither road tips into it (`relief.ts`).
- **Grass through the roads:** on slopes the ground grid sinks out of sight under every road and path, the route's
  road follows the ground across its width as well as along it, and the road verges are laid in 3 m pieces that
  follow the ground. Car parks and paved areas over relief are cut finely so they follow the slopes too
  (`world.ts`, `life.ts`).
- **The Innovation Enclave's wall** stands clear of the road's verge and drain, which stay at road level.
- **Commonwealth Hall's red forecourt** follows the ground and goes under the road and the footpath across it.
- **Computer Science's door** (owner's marked aerial: the blue mark where the yellow arrow ends) is on the wing's
  west face further north, reached down the service road west of RIPS and east along a paved way by the car park
  behind ISSER and RIPS. The ground the owner circled purple there is **trees**, not grass (woods north of RIPS,
  north-west, west and south-west of ISSER, east of the Computer Science wing).
- **Before RIPS** the paved ground now drops **seven steps (1.26 m)** below the car park to its south, behind a
  retaining face with a coping, the seven-step stairs at the end of the drive; big shade trees stand over the
  concrete car park.

## 33. Grass on the Pent to engineering road

- **Grass tufts** (the blades laid round the camera as you ride, `tufts.ts`) were kept off the mapped roads by their
  real widths, but the ridden route's road is wider (7.6 m plus pavements) and rounds its bends: on the ride from
  Pent to the engineering school about 90 tufts stood on the road (at the start by Pent and on the descent into the
  engineering school), re-laid as the camera moved, so the grass seemed to follow the rider. Tufts now keep off the
  current route's road and pavements (`Game.setRoute`).
- **Kerbs and drains** of the campus roads stop short of the side roads a route turns into: the route's rounded
  bend overruns the mapped corner, and the black and white kerb and the drain showed across the road there.

## 34. Cleared structures; the sports area; the houses south of the stadium

- **East of Alexander Kwapong Hall**, toward Limann (owner's game map, circled green): no structures; the seven
  satellite-detected or mapped outlines there are excluded (`corrections.json`).
- **Round the UG Gymnasium** (owner's game map, marked green): the narrow rectangles (mapped as car-park strips) and
  the small outline among them are not there; excluded. Areas can now be excluded like buildings and roads
  (`build-master.mjs`).
- **The pool, gym and other structures** (owner's aerial): everything is one floor (Maxi Catering, the pool house)
  except the pool and the **gym**: two short floors, modelled from the owner's photo (`stadium.ts`): white walls on a
  dark red base, a band of dark windows high in the walls, air-conditioners below, terracotta hipped roofs on the four
  arms of the cross and a raised dark clerestory over the middle under its own hip, red steps up to glazed doors
  under a white canopy on its south front.
- **Trees, not grass** (owner's red outlines): woods round the pool, the gym, the Maxi Catering building and the
  tennis courts. On aerials, dark green clumped canopy with shadows is trees; smooth light green is grass.
- **South of the UG Sports Stadium** (owner's game map, circled yellow): 33 houses, all one floor like bungalows,
  each with its door on the side facing its nearest road and a laterite walk out to it, a gate in a low hedge where
  the road is near (`stadiumhouses.ts`, `residences.ts`).

## 35. The African Studies chalets, the Apaloo Crescent bungalows, the UG Basic School

- **Institute of African Studies chalets** (owner's aerial, circled yellow, registered to the chalets' outlines):
  every building one floor, doors toward the road, roofs in the colours the aerial shows (red-pink sheets, Yiri
  Lodge's orange tiles). Trees all through the area (a grove), dense woods between the chalets, car parks with cars
  among the northern chalets, before the Institute and before Yiri Lodge.
- **West of the Diaspora Dome round F.K. Apaloo Crescent** (owner's aerial, circled yellow): 28 one-floor bungalows,
  each door on the side facing its road with a walk out to it; dark grey sheet roofs in the middle, terracotta to the
  west, as the aerial shows (`diasporahouses.ts`). They stand in a park of trees on grass: a new area kind, a
  **grove** (trees spaced on lawn), beside the **wood** (dense trees over a dark floor).
- **UG Basic School** (`basicschool.ts`, owner's aerial and two photos): one-floor classroom blocks, white with a
  grey-blue band along the foot, red-brown doors and louvred windows behind verandahs of square white columns with
  grey feet. Roofs as on the aerial: terracotta round the north-west court, dark brown sheets on the long blocks and
  the cross-shaped block, grey on the small blocks, pale on the south-west block, salmon-red on the hall south of the
  car park. A building outline on the north yard (none there) is excluded. **The entrance faces Valco** across La
  Road: red-brick gate pillars with white caps, a black iron sliding gate, a small gatehouse with a brown hipped roof
  on red pillars, the yellow and blue shade, the school's sign board, a paved apron; **the fence** along La Road is a
  stone wall under a coping with white square pillars and black iron railings. Big shade trees in the yards.

## 36. Valco cleared; the fronts of Akuafo Hall and Legon Hall

- **Valco** (owner's game map): the four satellite-detected outlines north of Phase 1 and between the phases (circled
  green) are not there and are excluded; the small building south-west of Phase 2 (circled purple) is one floor.
- **Akuafo Hall and Legon Hall** (owner's photos of both fronts, `greathalls.ts`): every block white, Akuafo's base
  painted **light green**, Legon's **cream**; storeys 3.6 m. Both fronts face north (a viewer facing one has east on
  the left). Each front block's middle carries a **loggia** upstairs: three bays between white piers under a deep beam
  and dark fascia, over a dark balcony ledge, lit ceilings; its back wall has brown louvred shutters (Akuafo) or dark
  barred windows (Legon).
- **Akuafo**: the ground floor stands forward under the loggia. The **gate** (owner's blue mark) right of the middle as
  seen from the car park: a white surround, iron lattice gates folded back, the lit teal hall inside, a lamp and a
  plaque over it; the lit window behind its iron grille east of it, a small window to the west; banners (the hall week
  over the balcony, the farmers' expo, the 70th anniversary stand); flag poles either end; the iron lattice gate in the
  gap to the west; the **gilded statue of the farmer** with his hoe on a plinth (owner's yellow mark) and the hall's
  board UNIVERSITY OF GHANA / AKUAFO HALL in the garden to the east; car parks with cars before it, either side of the
  walk to the gate.
- **Legon**: the ground floor is an **arcade of three round arches**, white over cream, a lattice window lit from
  inside in each bay and the **entrance** (owner's blue mark) in the middle one behind a black lattice gate; LEGON HALL in
  white on a black board with the crest over the middle arch, lights over the side arches. A forecourt of square slabs
  with a flag pole and RESERVED signs, the APOSA-LEGON banner at the east end, and east of the front the raised planter
  with a low dark stone wall, a fan palm, bushes and a bench, a hedge before the east block's gable, a big tree beyond.

## 37. The New N Block and the GCB Lecture Building

From the owner's photos and marked aerial (registered to the footprints at 0.25 m/px; `src/game/nblock.ts`).

- **New N Block** (front F to the road on the south): one tall floor; a hall under a red corrugated gable roof
  (ridge east-west) with white gable ends and brown timber louvres in them, a white clerestory band of dark louvres
  along the top of its walls; a verandah all round under a lean-to of the same red sheets with a dark fascia, on square
  green columns, its floor raised on a white plinth; green walls with dark doors along every side (the owner's
  entrances), dark windows with air-conditioners under them. Car parks with cars north and west of it, trees west and
  north-east, small trees along its front by the road.
- **GCB Lecture Building**, south across the road and **2.4 m up the slope** from it (`relief.ts`: its ground, the
  platform before its north side and the car park on its west): two floors, white, brown-framed windows, a maroon
  corrugated hip roof with a gable across its middle over the west and east entrances (owner's blue marks: lit lobbies
  under the big white gable wall). On the north (N) a deep gallery on both floors with slender columns and a solid
  parapet under the roof's long eave, on the platform behind white retaining walls: the **broad stair** up the middle
  (blue stripes) and a **ramp** along the wall either side (yellow), white parapets. On the west (W) the car park with
  cars before the entrances, feather flags, a black water tank on a stand; trees east and north-west.

## 38. Wooden windows in the halls; the chalet blocks; Legon's gable block

- **Wooden windows** (owner: the halls' windows are wooden, not glass): Legon, Akuafo, Mensah Sarbah (maroon
  surrounds) and Volta Hall now show dark brown wooden louvred windows with horizontal slats, two leaves, a white
  sill (`blocks.ts: louvre`).
- **The road south from the roundabout before the Balme Library** (owner's aerial, purple and green marks, and two
  photos; `chalets.ts`): Akuafo's blocks on its east, Legon's on its west, chalet-style: weathered white walls, wooden
  shutters, steep orange-red tile gable roofs with deep overhangs and dark bargeboards, the gables clad in dark timber
  boards. The two-storey blocks nearest the avenue turn a gable to the road with a balcony (solid white parapet, two
  posts) on the side toward the avenue; the long blocks behind run north-south with a tiled lean-to on posts over the
  ground floor along the road; one-floor cottages with a door under the gable to the road. Tall royal palms on Legon's
  side, clipped golden hedges on Akuafo's.
- **Legon Hall's gable block** east of its front (owner's picture 2): two floors under a steep tile gable roof, its
  timber-clad gable end to the avenue with shutters up and a lean-to porch over a lit door, air-conditioners along its
  west side, hedges and a bench, and a low covered passage with an iron lattice joining it to the front block.

## 39. The GCB Lecture Building rebuilt; wider doors at the New N Block

From the owner's marked aerial (registered at 0.25 m/px) and photos of the north and west sides (`nblock.ts`):

- **Old paint, lightly weathered:** the white was never redone, but it must still read as white (owner: the first
  weathering was ten times too strong): a faint stain map (`concrete(0.12)`) and a few specks on the facades.
- **The gallery** (purple mark) across the whole north, about 13 m deep: round columns on the ground floor, the first
  floor cantilevered past them behind a thick solid parapet, tall slender columns up to the roof, the roof's beams
  standing out under the eaves with a beam across over the columns (orange mark), lights in the ceilings; a stair under
  the gallery up to the first floor (green mark); a glazed room at the east end of the upper gallery.
- **The stair and ramps** (red square), at road level before the gallery: the broad stair up the middle (in flights
  with landings), and on each side a ramp that starts by the foot of the stair, runs out along the north edge, turns
  and climbs south along the outer edge to the gallery (green arrows); solid parapets both sides, a planted well inside.
  The gallery and the ground round the building are 2.4 m up behind stained white retaining walls.
- **The west and east gates** (yellow lines): the ground floor is open under the upper floor's plain gable wall,
  a colonnade of round columns before a lit lobby with shopfronts, stalls and banners (never closed); over it a cross
  gable with red sheet cladding in its triangle. The main roof is a hip with a gablet at each end.
- **New N Block:** the doors are twice as wide (about a metre, two leaves).

## 40. WACCBIP, its car-park shades, the old shed, the unfinished frame

From the owner's marked aerial (front F to Volta Hall Road, back B; registered at 0.25 m/px) and photos of the front,
the back, the unfinished frame and the old shed (`waccbip.ts`):

- **West African Centre for Cell Biology of Infectious Pathogens (WACCBIP):** three storeys of bright white paint,
  hardly weathered, on a ground floor raised a metre, under dark red hip roofs with a dark louvred gablet at the ends
  of the wings and over the front pavilion. Between the two wings, deep **galleries on every floor** (the owner's large
  balconies): solid white parapets, columns to the eaves, lights under the slabs; in the middle the pavilion with round
  columns at its corners, a **broad stair** up to the entrance in a white surround (entered here, from the drive; the blue round it on the owner's photos is their mark, not paint),
  WACCBIP on its parapet. Paired dark windows, lit at dusk; a tall glazed stair window up the east end of each wing;
  air-conditioners on the outer walls.
- **The back** (owner's yellow mark on the aerial, photo 4) is the whole west face: one long range along the road behind
  the building, 12 m further west than the OSM outline (the road moved about 3 m west to where the aerial shows it),
  its two arms reaching east to the spine either side of a planted light well, their gablets at the two ends of the
  back. Plain white upper floor; a tall black-framed window over two floors near each end, a slit window and a
  two-pane window upstairs, a barred window by the door, two pilasters, wall lamps, a white vent and an
  air-conditioner; the entrance up three steps between white planters, a collapsible lattice gate across the top of its opening over the glass door, a gold strip light and the centre's **full board** over it as it reads (University of Ghana and WACCBIP marks, the centre's name, African Centre of Excellence, the Department of Biochemistry, Cell & Molecular Biology (Annex), the College of Basic & Applied Sciences, the addresses), a
  brown grille window above, iron grilles each side; palms beside it, the raised box on the roof over it; brick paving
  to the road with a post and chain.
- **Before the front:** interlocking brick paving; the four **blue tensile shades on white curved posts** (red marks)
  are car parks with cars under them, not buildings; the drive runs between the two rows of shades; grass islands of
  yuccas by the road, the centre's board, lamp posts.
- **The old shed** (white mark): one floor, old clay tiles gone dark with moss, white paint stained and mouldy, paint
  gone in patches, old plank doors (one shut with a louvre at its head, one standing open on a dark room), louvred
  windows, a bush grown over its south-east corner.
- **The unfinished building** (green mark): a raw grey concrete frame, columns and beams under a first-floor slab,
  column stubs with their rebar above it, some bays walled in blockwork, weeds and young trees inside.
- **Cleared:** the structures circled yellow are gone; trees there, north of WACCBIP round the shed, and east of
  Volta Hall Road across from it.

## 41. South-west of the Balme Library: the French Department, the Post Office and their neighbours

From the owner's marked aerial (circled white, view directions marked; registered at 0.25 m/px) and five photos
(`balmewest.ts`). All of them white with **black wooden louvred windows** (wood, not glass), orange clay tile roofs
with gable ends boarded in dark timber, and low walls and platforms **faced in rubble stone** under a concrete cap
(the owner's yellow marks).

- **French Department** (the Faculty of Arts' H-shaped block west of W.E.B. Dubois Road; photo 1): two floors. At the
  south end of its east wing, toward the corner of Dubois Road and Danquah Avenue: a porch on two columns under a
  first-floor balcony with a solid white parapet, steps up between two stone-faced planters; a loggia upstairs in the
  range's south face.
- **The long block on the Balme square** (photos 2 and 5): two floors, a deep red band round its foot, gables to the
  roads north and south, a raised lantern with a band of dark louvres over its middle; on the car-park side a portico
  of two tall columns before the door (entered here), verandahs on square columns along the upper floor either side,
  two black water tanks.
- **Office of the Dean of Student Affairs** (photo 2; outline lengthened 5 m west to its roof): one floor along the
  road, its name on the road side, the internal mail office's door at its east end, a hedge before it, a stone-faced
  bed along its south; the university's board at the corner (blue arrow).
- **University Post Office** (photo 3): one floor, faded white with the red band peeling at its foot, darker old tiles,
  plain white gables with wide dark bargeboards; UNIVERSITY POST OFFICE over the porch in its west gable (entered here,
  up two stone-faced steps), its red door, black grilles each side, red post boxes; a verandah on square columns along
  the north side with the wall of red post boxes under a canopy and the stone-faced platform before it.
- **The car park** between them, asphalt with two rows of bays; the **yellow GCB ATM** kiosk with its blue roof on it,
  the **red and white lattice mast** behind it; trees along the square and the road, palms by the Post Office.

## 42. The School of Pharmacy; the Larway Oraca Building's sides

From the owner's photos: the pharmacy's side to the road from WACCBIP, a closer view of its three-storey block, its
front with the doors marked blue (`pharmacy.ts`); a side view of the Larway Oraca Building (`residences.ts`).

- **School of Pharmacy** (layout corrected in section 44): one-floor wings under maroon sheet roofs round a car park open to Volta Hall Road: the long
  north wing (white, a red band round its foot, wide glass windows with curtains in light aluminium frames, boarded
  panels between, an air-conditioner under each), the south and west wings; on the car park side covered walks on slim
  posts, lit, with doors, windows, notices and potted plants. At the back of the car park the **three-storey block**,
  its paint grey and patched, panel lines across it, black-framed glass windows, a taller middle bay with a ribbon of
  glass under its own hip; before it the one-floor front wing with the school's **two doors** (entered at the one
  under the middle bay) and its banner; black water tanks on a stand beside it; a tree and yuccas on the lawn by the
  road. A second, shifted outline of the south wing is dropped.
- **Larway Oraca Building:** its walls gone grey in streaks, pilasters between the bays, rows of small dark windows
  high in the wall, a dark grey foot; a black water tank on a stand and a red box in the corner by the north wing.

## 43. Food Science, the School of Nursing, Animal Biology and the Centre for Biodiversity

From the owner's photos and top view (`labs.ts`; the trees in `corrections.json`):

- **Department of Nutrition and Food Science** (east across Volta Hall Road, its front to the Larway Oraca Building):
  a ground floor clad in white ribbed panels and three floors of board-marked concrete over it, each standing out over
  the one below with a dark gap under it, small square windows scattered in them, everything washed and streaked grey;
  in the middle of the front the stair core between two tall square columns rising to a flat canopy over the roof, the
  **lit entrance** at its foot (entered here); a recessed bay with windows and an air-conditioner on the second floor;
  a row of windows along the south side; a hedge, the department's board, and the brick-paved car park under a blue
  tensile shade before its south-west corner.
- **School of Nursing and Midwifery** (west of the Larway Oraca Building): white; three floors, the ground floor set back
  behind square columns, lit, grilles across its openings; continuous **balconies** on both upper floors, solid
  parapets pierced by a row of slots, stepping out round the middle of the south front; glass louvre windows; a flat
  roof with a deep white fascia and lamps; on the lawn an island of bush and agave with two dry flower stalks, blue
  benches, palms.
- **Animal Biology and Conservation Science, the Centre for Biodiversity** (and Nature and Food beside them): **one
  floor**, long white ranges under hipped tile roofs round the courts, piers between pairs of dark windows, a covered
  walk round the main court; **trees** wherever the owner circled them, in the courts and all round, so that from the
  road the buildings barely show; along J.K.M. Hodasi Road a brick-paved walk between two low walls faced in rubble
  stone, young palms in the verge.

## 44. The pharmacy's layout; WACCBIP's board; the GCB stair and ramps; riding through woods; an unfinished building

- **School of Pharmacy, laid out from the owner's top view** (registered at 0.25 m/px, `pharmacy.ts`): the
  **three-storey block is the L along the west** (marked yellow): its range along the back with a flat-roofed bay at
  its north end, and its arm east into a paved court with planters, a little taller under its own hip. Everything
  else is one floor: the wings along the north and the south, and at the back of the car park the front wing with the
  school's two doors (entered at the north one), the flat link north of it carrying the black water tanks.
- **WACCBIP's back entrance** carries the centre's **full board** as it reads, a gold strip light under it, a
  collapsible lattice gate across the top of the opening, the university's plate on the glass door and a camera. The
  blue round both of WACCBIP's doors on the owner's photos marks the entrances; it was never paint, and is gone.
- **GCB Lecture Building:** a ridden route that climbs a modelled stair lays **no asphalt over the steps** or the
  platform beyond them (`world.ts → buildRouteLayer`), so the white stair shows; each **ramp starts 1.6 m clear of the
  stair's side wall**, so a wheelchair turns onto it freely. A model's tree is never planted on a road (`gardens.ts`):
  the two that stood on the lane north-west of the building are moved into the wood beside it.
- **Free ride:** the grass of a wood is rideable between its trees (the wooded lawns round the GCB Lecture Building);
  every trunk still stops the bike, which slides round it.
- **The building beside Food Science** (north of it) is **unfinished**: one floor of bare grey sandcrete blockwork,
  no paint, no roof, empty door and window openings under concrete lintels, two cross walls making three rooms,
  bare columns with their rebar standing out, a ring beam begun on one side, weeds inside, sand and new blocks
  stacked by it.

## 45. The ISSER Annex, the frame going up beside it, and the hall with the stone dado

From the owner's marked aerial (registered at 0.25 m/px) and photos from the air, from the road toward the engineering
school, of the building site and of the hall (`isserannex.ts`; the ground in `relief.ts`, the trees in
`corrections.json`):

- **ISSER Annex:** white walls, dark windows in white frames, terracotta tiles with dark brown fascias, the whole
  compound **1.2 m down** below the road to the engineering school (owner: like the engineering school, below the
  hill). **Three floors** in the west wing, a gabled porch with a maroon panel at its south end; **two floors** in the
  long range along the car park, a small gabled porch in its middle (**entered here**: the owner's blue arrow, the walk
  from the engineering school along the road and up through the car park), more doors along it and along the west
  wing's court (blue marks); the **conference hall** behind it, two tall floors under a big hip; the east wing **one
  floor**; paved courts with planters, a covered walk north of the hall.
- **The huts** (purple marks): three open one-floor shelters, white columns under pyramid tile roofs, benches round
  three sides and a round table, on a paved plaza between white bench walls and small trees; bare red earth beyond.
- Palms along the front, cars filling the car park (its west end too; two car rows the satellite outlines took for
  buildings are dropped), a **white fence** along the road on the east: square piers, a low wall and black fret panels,
  a hedge outside it.
- **The frame going up** west of the annex (yellow mark): a two-storey concrete frame, its ground floor open between
  the columns, the first floor propped with orange shores, rebar over the top slab, behind **blue corrugated
  hoarding** (dark sheets at the west end of the front), the contractor's MARLEYROSSI boards and site notices, a gate,
  red and white barriers, sand, gravel and blocks, red earth round it, a tree before it.
- **The hall beyond it** (red mark): one floor, white walls over a **rubble-stone dado** with a red line at its foot,
  white panelled double doors up a stone step (the owner's blue marks), a breeze-block screen, a panel of glass
  blocks, small dark windows, air-conditioners in black cages; an orange-red sheet hip roof with a raised gable over
  the west end, a dark louvred vent in it, solar panels; a big tree and a red earth track before it.
- **Trees** wherever the owner circled them light green.

## 46. WACCBIP's board at the front; International House's windows; the Bookshop; Earth Science; the Basic School

- **WACCBIP:** the centre's full board, the gold strip light, the lattice gate, the university's plate and the camera
  are on the **front entrance** (by the car-park shades), over the door up the stair; the back door keeps a plainer
  board.
- **International House:** its windows are **glass in silver-grey frames**, not brown wood (owner).
- **University of Ghana Bookshop** (owner's street view; `balmewest.ts`): the twin of the long block across the square,
  two floors, orange tiles, gables boarded in dark timber, the lantern over its middle; a tiled pent roof along its west
  side over tall dark shop windows; at its south end the entrance under a first-floor balcony with a solid parapet, up a
  step from a platform **faced in rubble stone** (yellow marks) between low red railings; a stone-faced bed along the
  west front.
- **Department of Earth Science** (owner's marked aerial and photos; `earthscience.ts`, ground in `relief.ts`): the whole
  complex on ground raised 1.5 m behind **rubble-stone retaining walls**.
  - The **storey building** (yellow): one connected building of three floors, a long bar along the north, a taller cross
    block in its middle with a porch of tall columns, two arms south; white, **glass windows in grey frames**, a deep red
    band round its foot; along its back **galleries on both upper floors behind railings of square-gridded metal
    bars**, over a covered walk on columns with red feet; interlocking paving down to the road behind.
  - The **one-floor ranges** (violet) connected without gaps round the courtyard (west, middle, front, east), white,
    **black wooden lattice windows**, verandahs on square white columns with red feet.
  - The **entrance** (blue): the one-floor entrance block in the middle of the front, its door between two columns with
    black lattice windows either side and the department's name over it; the **broad stair** up to it in two flights
    between planters faced in stone, palms in them; the department's board beside it; trees in front and on the east.
- **UG Basic School:** the paint flickered because its blocks were modelled twice (an older one-floor model of the
  buildings round the Night Market covered them too); they are modelled once now, and a check keeps any footprint from
  being modelled twice. The fence along La Road is a low wall of **rubble stone** under a coping, white pillars, black
  railings (owner's photo of the entrance).

## 47. Physics, the chemistry buildings and the Frank Torto Building; the ISSER car park; Earth Science's door

From the owner's photos and marked aerial of the chemistry buildings (registered at 0.23 m/px; `physics.ts`, the hill
in `relief.ts`):

- **Department of Physics:** one-floor ranges round a court, **1.5 m up the hill** from Danquah Avenue: a grass bank
  down to a **low wall of rubble stone** along the pavement (and up Cruise O'Brien Road), the walls on a stone plinth,
  a stone retaining wall and steps up from the lane on the east to its door. Faded white, a deep red-brown band round
  the foot with the paint flaking off in patches, **brown wooden louvred shutters**, small square vents under the eaves,
  orange tile gable roofs with dark bargeboards and a small window in each white gable, verandahs on posts round the
  court, the department's board at the corner, a wooden electricity pole.
- **North of it** (red line): a one-floor building **as tall as two floors**, small oblong windows high up, wooden
  shutters and doors below; a one-floor range beside it.
- **Chemistry** (black lines): the extension's U round the Frank Torto Building and the ranges across the middle, all
  one floor, like the physics ranges; a **covered walk** on posts under a tile roof (green line) from the extension to
  the chemistry block; trees where the owner circled them; the car park before the Frank Torto Building.
- **Frank Torto Building** (purple; photos 3 and 4): five floors, white, the ground floor set back behind columns, a
  band of glazing on the first floor, the department's name over the ground floor and on the west end, galleries on
  the floors above behind solid parapets with brown-framed windows, a stack of open landings at the west end, plant on
  the roof; the tower on its east with stepped sills and brown-framed windows.
- **ISSER Annex car park:** cars in two rows, along the palms and along the south edge, the aisle and the walk to the
  porch clear (they had covered it).
- **Earth Science:** the entrance porch stands on the front range's face, so its door (between the lattice windows)
  shows.

## 48. The chemistry department's west entrance; the porch by the Post Office; the French Department's doors

From the owner's street photo, marked aerial and photos of the French Department and the long block by the UG Post
Office (`physics.ts`, `balmewest.ts`):

- **Department of Chemistry, west entrance** (yellow; on Cruise O'Brien Road, opposite the turning): one floor, white
  with the red-brown band, an orange tile hip roof, standing on a **stone-faced base**. Its front is recessed between
  **two square white pillars with red-brown feet**, the **black wooden lattice double door** in the middle under a
  lintel with **DEPARTMENT OF CHEMISTRY** and the university's crest, a lamp in the porch ceiling; dark wooden
  shutters either side. Steps up to the porch from a **paved forecourt** with **stone-faced beds** of flowering shrubs
  and agaves either side, and a short flight down between stone cheeks to a paved apron at the road; palms by the
  road and shade trees round it.
- **The porch with the balcony over it** (violet) is no longer on the French Department: it stands on the **south
  gable of the Economics long block beside the Post Office** (green), in the gable's third bay: two columns, a
  balcony with a solid parapet over the doors, black double doors below and above, three steps, beds of rubble
  stone either side.
- **French Department** (blue and yellow): a **door at the west end of the west wing's south end**, on a step; an
  **open passage** through the range's ground floor beside the west wing, with no door or gate, through to the court
  behind (paved, a white lintel each side under the upper floor, a lamp in its ceiling); a **door just east of it**.

## 49. The chemistry extension joined up; the Frank Torto passage and the building behind it; Nsia Road by Earth Science

From the owner's marked aerial, game screenshots and street photo (`physics.ts`, `relief.ts`, `earthscience.ts`):

- **The west side of the chemistry extension is closed** (blue line): a single white **screen wall pierced all over by
  small square holes**, with a coping and end piers, joins the west entrance to the extension's west range on the
  north and to the range on the south. The bike can't pass it.
- **Frank Torto Building:** an **open passage** (no door, no gate) through its ground floor at the west end of the
  car-park side, between two columns, paved through to the extension behind, with lamps in its ceiling (blue circle).
  The tower's south end to the lane (street photo) has a stack of open landings in white frames at its west part and
  the **DEPARTMENT OF CHEMISTRY / FRANK TORTO BUILDING** board; its east side has windows with hoods over them.
- **The building behind it** (violet, along the lane east of the tower): **one floor**, white, under a flat roof with
  a deep fascia, **black iron grille doors** in deep white openings, air-conditioners on the wall, a step along its
  foot (it had been drawn as two floors).
- **Nsia Road by Earth Science is flat** (red): the raised ground and its rubble-stone wall stand clear of the road and
  its pavement, so the road no longer rises at its edge or swallows the bike. The kerb and gutter strip that had been
  pushed up the bank (violet) is gone; they run flat along the road.

## 50. LECIAD and the small buildings west of it; the lane round the Frank Torto Building; riding through the passages

From the owner's game screenshots, street photo (taken from the west at night) and marked aerial, registered to
LECIAD's outline at 0.225 m/px (`liciad.ts`, `physics.ts`, `solids.ts`, `Game.ts`):

- **Riding through the open passages** (blue): the free-ridden bike was stopped at the Frank Torto Building's open
  passage, because a building's outline blocks the bike wherever no mapped path runs through it. An open passage now
  lets it through (`solids.ts → PASSAGES`, checked in `Game.ts → freeBlocked`); the columns and walls either side still
  stop it. The French Department's open passage (section 48) gets the same.
- **The lane round the Frank Torto Building** (red): the building behind the Frank Torto Building and the east end of
  the chemistry range east stood on the ridden road and its pavement at the bend. The building behind is pushed back
  5.6 m east; the range is moved 2 m west (clear of the covered walk) with its east end 3 m shorter
  (`corrections.json → reshape`). Road and pavements now pass at least 5.5 m clear of both.
- **LECIAD** (violet; mapped "LECIAD, Legon"): four parts round a paved service court full of air-conditioning
  condensers: the broad **south block, four storeys** (the tallest and nearest in the photo); the **west wing**, the
  **north-east wing** and the range between them (a cross gable buried in its neighbours' roofs), **three storeys**;
  a flat-roofed strip on the east side. **Cream walls** with pale piers and slab lines, the **red-brown band** round
  their foot, **glass windows in dark frames** set in white surrounds (in pairs on the south block),
  air-conditioners on the walls, **terracotta hip roofs** on dark fascias (as the aerial shows). Glass doors under a
  flat canopy on two columns in the west wing's west face; a small door under a canopy at the north-east wing's west end.
- **The two small square buildings** (white; the same design): **one floor**, white walls about **15 % dirty** from the
  road (grime splashed up from the foot, streaks from the eaves), the **red-brown band** at the foot, a low **gable roof
  of dark sheets** with dark barge boards, the **dark barred door** in the west face (blue) on a step and a **small square
  window** high beside it. The southern one's detected outline is moved onto its roof in the aerial; the northern one
  has no mapped outline, so its walls block the bike through `SOLIDS`.
- **The power plant** (light green): a generator (cream canopy, dark louvres, an exhaust stack) on a concrete pad under a
  dark hipped roof on six black posts.
- **The tree** (red): a big shade tree east of the first small building, its wide dark crown over that building's roof.

## 51. The galleries on Legon's and Akuafo's outward faces; Legon's front joined up; the Bookshop's railings gone

From the owner's marked aerial of the two halls (purple lines on the outward faces), night photos of an outward face of
each hall and game screenshots (`galleries.ts`, `greathalls.ts`, `chalets.ts`, `balmewest.ts`):

- **The outward faces** (purple lines): the upper floor is an **open gallery**. The wall below runs up into a **solid
  parapet**, **square pillars** rise from it to a deep beam under the eaves, and the upper floor's wall stands 1.9 m
  back with a **dark door** (fanlight over it) to each room over a painted base, **blue at Legon**, **light green at
  Akuafo**; lamps in the gallery ceiling, walls closing its ends. The ground floor's windows are covered by **black
  wooden burglar-proofing**: a fret of squares and crosses at Legon, upright bars at Akuafo (photos). The tile hip roof
  still runs out over the gallery to the outer face. Each marked block is split into its ground floor and the set-back
  upper floor (`galleryBlocks`), with the gallery and roof added by `galleryParts`.
  - Legon: the north faces of the north-west corner block and the long block east of the front; the west faces of the
    range down the hall's west side; the south faces of the long block behind it and of the small block at the west
    end; the outer faces of the four long lanes; the south faces along the bottom of the hall.
  - Akuafo: the north and south faces of the long west blocks; the east faces of the blocks on the east side; the
    outer faces of the four long lanes; the south faces along the bottom; the west faces of the long roadside blocks
    (chalets.ts; their lean-to replaced by the gallery), joined by an upper-floor **bridge over the footpath** between them.
  - The entrances are not changed.
- **Legon's small blocks** at the north-west and on the west side, too small for the hall's model before, are now part
  of it (`min` 85 m²); the north-west corner block's outline runs down the west side to the range below it (the aerial's
  roofs), and the joins add the links between them, so the hall is closed there.
- **The gap beside Legon's front** (violet): the long block east of the front now runs west to the gable block beside
  the entrance (`reshape`); no join is built over the gable block itself.
- **The University Bookshop**: the red railings on its entrance platform are gone (owner).

## 52. The French Department rebuilt where the aerial shows it; the Economic Policy Management office

From the owner's aerial of the CEDI Conference Centre, the Economic Policy Management office (green) and the French
Department, registered to the conference centre and the roads at 0.235 m/px, and street photos of the office's east
side and of the French Department's south and west sides (`balmewest.ts`, `galleries.ts`, `blocks.ts`):

- **Both buildings stood east of where they are**: the French Department 9.4 m east and 3.9 m south, the office 8.8 m
  east (Google Open Buildings agreed with the mapped outlines only 39 % and 45 %). Both outlines are moved onto their
  roofs (`reshape`), and the curated entrances with them.
- **French Department**: the west wing, the one-floor pavilion with the open passage, the two-storey range and the
  east wing, as the roofs show. White walls with the wine band at the foot, black wooden windows.
  - The west wing's south end (photo 3) is hipped and has **one door** (blue) under a small hood and a **small window
    over it** (violet), no other windows; a low rubble-stone platform along its foot.
  - **The open passage** (blue) is the one-floor pavilion between the west wing and the range: its own tiled hip roof,
    white square pillars with wine feet either side of the open way, dark lattice panels lit yellow behind them, a
    yellow-framed lattice gate folded back, paved through; the bike rides through it.
  - The range's south face (photo 4): its west end a gable boarded in dark timber over the pavilion; a black shutter and
    a barred window upstairs, the **door** (blue) with its grille and transom, the department's plate and an
    air-conditioner beside it; the **balcony** upstairs further east: pillars, a parapet, barred windows lit behind over
    a yellow base; black lattice windows below.
  - The west wing's west face (photo 5): the **balconies** upstairs with **yellow-footed pillars** and pilasters under
    them down the ground floor, barred windows behind, the wine band at the foot.
  - Before it: the paved walk from the road to the passage and along the range, the School of Languages board, shrubs
    and flowering bushes, a potted plant, the big tree before the west wing's south end.
- **Economic Policy Management Programme office** (green): **three floors** (photo 2; an earlier note had four), **fully white** with no coloured band at its foot (owner), an H of
  two wings and the block between them under hip roofs of dark old tiles; white walls a little streaked, **wide glass
  windows in dark frames divided by bars** into small panes, air-conditioners, its board on the east face, the
  entrance in the middle of the south side under a flat canopy. Before its east face a brick walk with a stone kerb, a
  clipped conifer, round shrubs, flowering bushes and a shade tree.
- A block's plinth can now take its own colour (`Block.plinth`): the upper floors behind the galleries no longer show
  the base colour as a band under the gallery floor.

## 53. The Faculty of Arts up behind its stone wall; UGCS's back stair; the two hotspot comfort zones

From the owner's street photo of the Faculty of Arts from before Legon Hall, a photo of the back of UGCS, a marked
aerial south of the loop at the end of the avenue (registered to the avenue and the loop at 0.3 m/px) and night photos
of the two hotspot comfort zones (`relief.ts`, `balmewest.ts`, `balme.ts`, `hotspots.ts`):

- **The Faculty of Arts stands up the slope from Danquah Avenue** (yellow): it and the Economic Policy Management
  office stand on ground 1 m above the road, behind a **rubble-stone retaining wall** with a concrete cap along the road
  (kept back behind the footway and its pavement, so the avenue, the footway and the route stay flat) and down the
  east side, where it edges the office's brick walk; on the west the ground slopes down to the lane. **The stairs**
  (green) climb through the wall from the footway, where the path from the avenue meets it, and a paved walk runs up to
  a door in the middle of the range. The range's loggia runs along most of its south face (the photo).
- **UGCS's back** (toward the Business School): the **open stair painted red-brown** up the west end of the north face,
  a landing by a door at each floor, two flights between floors with solid parapets, a canopy over the top landing,
  posts under it; a red-brown band at the foot of the walls; air-conditioners; the board on its posts; the green
  generator.
- **The hotspot comfort zones** south of the loop, beside the lanes to the Athletic Oval, both facing the loop:
  new, white; two levels: a solid block each side (the stair up to the deck at the west one, a tall grey louvred vent
  and planters at the east one), the open sitting area between them on the ground floor and the deck above behind a
  black railing; a deep band under the eaves with the board; a dark brown hip roof on a white fascia; two steel struts
  in a V from one foot up to the band; paved fronts and walks from the loop, trees round them.
  - **University of Ghana Alumni Association** (yellow): UNIVERSITY OF GHANA ALUMNI ASSOCIATION / HOTSPOT COMFORT ZONE on
    dark brown.
  - **First Bank Ghana** (red): FIRST BANK GHANA / HOTSPOT COMFORT ZONE on navy over a warm brown band, the ceilings
    painted blue with a yellow frame round the deck's opening, ceiling fans, a colourful mural of patterns and faces.

## 54. St. Thomas Aquinas Catholic Church, the Legon Interdenominational Church and the open ground west of them

From the owner's marked aerial (registered to the Interdenominational Church at 0.235 m/px) and street photos of St.
Thomas Aquinas' east side (toward the back of WACCBIP) and the Interdenominational Church from its gate and its car
park (`churches.ts`; outlines moved onto the roofs in the aerial: `corrections.json reshape`, phantom outlines removed).

- **St. Thomas Aquinas**: the church, one tall storey under a brown-red tile hip roof with a broad white fascia, its
  porch and doors on the south to a paved court with a lawn strip and a statue; round its north, east and west the
  lower flat-roofed range: white over a **khaki base**, wide dark windows, a white railing round its roof, the door up
  steps with black handrails in its east face; tall white fins on the church's north-east; the **screen of pierced
  blocks** south of the range; a covered walk on posts at the north-east corner. West of it the long two-storey house
  under red tile hip roofs, a small house with a dark roof north-west. Car parks of grey pavers east and south, palms
  along the range, the big rain tree south-east of the church. Along the road a **low white wall with dark grey piers
  and white railings stepped along the top**; a wall of pierced blocks to the Interdenominational Church on the north.
- **Legon Interdenominational Church**: the church, two storeys high under a **steep dark brown tile roof**, its white
  gable to the car park on the east with the **lavender pentagon panel and fan window**, louvred windows either side,
  a lavender band low down, the entrance on a landing between rubble-stone panels with **two white ramps** sweeping down
  either side behind solid white parapets; the lower hall behind it under orange tiles; south of it the two-storey
  cross-shaped block (louvred windows up, glazed doors lit below), the small links, and the **gabled building in
  scaffolding** with its gable faced in stone. A hedge along the church; the car parks of grey pavers with **round
  planters in white kerbs**, palms and trees. Along the road a **red brick wall on brick piers**, the **black iron gates**
  hung on brick piers carrying **white globe lamps**.
- **The open ground west of both** (green line): read cell by cell (2 m) from the aerial: **red laterite soil**, soil
  with grass, and dry grass, softened into patches, with bushes and trees where the aerial shows them; the small water
  tank and the white shed on it.

## 55. UGCS's stair to the east end; the Anglican church and its hall; the open ground behind the three churches

From the owner's game screenshot (green: where UGCS's stair belongs), street photos of the Anglican church hall (yellow)
and church (blue), and a marked aerial (registered to the Interdenominational Church and St. Thomas Aquinas at 0.45 m/px)
(`balme.ts`, `churches.ts`):

- **UGCS's red-brown stair** stands at the **east** end of its back face (it had been put at the west): the landings
  and doors by the east end wall, the board on its posts east of the stair, the generator further west.
- **The Anglican church** (blue; its outline moved 5 m east and 6 m north onto its roof): one tall storey under a
  **steep roof of maroon sheets** with deep eaves, hipped at the west; the **white gable to the road** with the big
  **stained-glass window** (a cross, the figure in red, panes of gold, blue and red in white frames) over **three small
  arched windows**, lit, a door and steps under them; the long sides a band of **pierced blocks** under the eaves over
  white wall and dark windows between pillars; a porch on two pillars on the south toward the paved court and its bays.
- **The hall** (yellow; its outline redrawn from the roofs): a tall single storey of **cool white walls between
  pilasters**, small windows high, air-conditioners to the road, a **maroon hip roof with a small louvred gablet** at
  each end of its ridge, the **arched glazed entrance** lit in its north face to the paved court, steps; the wing north of
  its west end; the **two-storey block** on its west under red tiles.
- **Trees**: **Norfolk Island pines** by the hall's entrance, south of the church and in the car park; **bushy coconut
  palms** between the church and the road; shade trees north of the church.
- **Along the road**: a **low red brick wall, white piers, maroon iron railings arched along their tops**; at the drive,
  **three red brick piers with white globe lamps** and an IN plate: **the drive's gate swung open inward, the gate beside
  it shut** (owner); the church's navy board with yellow lines outside; flowering bushes; numbered parking bays of grey
  pavers with yellow lines outside the fence. The car park west of the church (a phantom building removed there) and
  the paved court between church and hall.
- **The open ground behind the three churches** (red line): read cell by cell (3 m) from the aerial: **red soil** mostly,
  dry grass in patches, the tracks across it, bushes and trees, the woods to the north round the Miracle Centre; roads
  and paths through it left clear; the part read before at 2 m kept.

## 56. St. Thomas Aquinas from its photos: the front, the porch, the court, the house; the gates open

From the owner's photos of St. Thomas Aquinas' front, the house beside it (its open corner and its verandah side), a
game screenshot of the gateway from the road, and a screenshot of the Anglican church (`churches.ts`):

- **The church's front** (photo 1): its **gable to the court** (the roof hipped at the north), white over a
  **yellow-beige base**, the middle stepped forward between two broad piers, the **stained-glass window** high in the
  gable; maroon barge boards, red-brown sheets. The **porch**: a steep maroon gable on **two pairs of round columns**,
  white over a yellow foot, a **timber ceiling** under it, the **wooden double door** (blue) in the front and windows
  either side; the church narrowed to its roof in the aerial, the porch centred on the gable.
- **The court**: big square slabs of **terracotta-coloured concrete with grass in the joints**; the lawn on its west
  behind a white kerb, pink oleanders, potted plants; the central lawn strip and statue drawn before are gone.
- The east range's south end: the **arched wooden door** (blue) up steps, an air-conditioner; windows in **dark brown
  wooden frames** on all the church's ranges.
- **The house west of the church** (photos 2 and 3), pulled back to leave the **narrow paved yard** between them:
  cream walls, a **base of terracotta brick**, brown-framed windows below, **glass louvre blade windows in white frames**
  above, maroon fascias under the red tiles; at its north-east corner the **open corner under the balcony**: two tall
  round columns, the **three open entrances** (blue) with glass doors behind, the balcony's terracotta brick band and
  brown railing, a raised platform with steps and potted plants. Along its south part the **verandah** on dark brown
  posts, its floor raised, **steps with black scrolled railings** up to the doors, beds of red, orange and yellow flowers
  behind a white kerb, a balcony at the south end, the **gravel car park** before it.
- **The gateway from the road** (picture 4): where the service lane comes in, the fence now stops at two dark piers and
  a **metal gate of horizontal slats** stands **open**, both leaves swung in.
- **The Anglican church**: its walls and the gable are **cream**, the gable the building's own wall under the roof's
  edge (not part of the roof); **both its gates now open**.

## 57. St. Thomas Aquinas: the photos put on the right buildings; the court concrete

The owner pointed out that two photos had been put on the wrong buildings (`churches.ts`):

- **The range facing the back of WACCBIP** (the east range by the gravel car park; the owner's yellow mark) is the
  **two-storey building with the verandah**: cream, **glass louvre blade windows** upstairs, a balcony at its south end,
  its ground floor behind the **verandah on dark brown posts**, its floor raised, **steps with black scrolled railings** up
  to the doors (blue), beds of red, orange and yellow flowers behind a white kerb; red-brown tiles with maroon fascias;
  the **gravel car park** before it. (It had been a one-floor flat-roofed range; the verandah had been put on the house
  west of the church.)
- **The house west of the church** (the owner's photo with three entrances in blue): white over a **terracotta brick
  base**, big brown-framed windows on both floors; its **open porch** before the north part's east face, where the south
  part stands forward: two tall round columns, white over a yellow foot, **three open entrances** with glass doors behind,
  the **balcony** over it with its terracotta brick band, brown railing and a glass door, the roof over it; the raised
  paved platform with steps and potted plants; the narrow yard of grey pavers to the church.
- **The court before the church** is **concrete paving in big squares** (grey, a little grass in the joints), not red.

## 58. The N Block compound from ten numbered views

From the owner's aerial of the N Block compound with ten numbered, coloured view lines (registered to the N Block at
0.287 m/px; the map's outlines already sat on the roofs) and a PDF of a street photo for each view (`socsci.ts`,
`relief.ts`):

- **N Block** (view 6): the tall hall in the middle, its **gable to Ebenezer Laing Road**, a **band of dark louvred
  windows** high on the white wall over the verandah, dark grey walls below with black doors and windows; one-floor
  wings either side; a **verandah on grey square columns** along the front and round the wings; red-brown corrugated
  roofs; the paved walk to the hall's glass doors, clipped hedges, two conifers, a yellow-flowered bush.
- **The east wing is the NASCO ICT Literacy Project** (view 9): its verandah's columns flare into a flat white frame,
  the board on it.
- **The long range on the east car park** (views 1 and 8): one floor, **white over a dark grey base**, red-brown
  corrugated gable roof; on the east louvred windows and air-conditioners and a **pitched rubble-stone bank** along its
  north half; on the west its eaves on **diagonal brackets** and **metal lattice grilles** over the windows and doors; a
  bed of agaves before its south end.
- **The K. Folson Building** (views 3 and 4; the board reads DEPARTMENT OF POLITICAL SCIENCE and DEPARTMENT OF
  PHILOSOPHY): an L of **two storeys, white piers between dark grey panels** holding louvred windows in black frames,
  air-conditioners in steel cages, red-brown roofs with white gables; **glass-block panels** at the west end of the
  north face, the **black water tank on its steel stand** with a ladder; its entrance near the north end of the east
  face under a small canopy, the board on two posts.
- **The raised ground at the north-east** (view 2; relief.ts): the range behind the court (one floor, white over a dark
  red base, louvred windows) and the ground east of it stand **1.2 m up** behind rubble-stone faces, **pitched rubble-stone
  banks** down to the lane on the east, the **stair between dark red cheek walls** up to the platform with the **blue
  tent**.
- **The court** (view 7, the panorama): **concrete pavers**, the **big rain trees**, the **red hexagonal kiosk** with
  benches, the **blue canopy** with its benches.
- **West** (view 5): the **Department of Social Work**, one floor, its **verandah on dark posts with diagonal braces**,
  a dark old roof, the **LIBRARY** board; the **School of Social Sciences**, one floor, white, a **bright red roof**, the
  porch at its west end with the **UG SSS** board, hedges.
- **North-west** (view 10): the **Information Studies** blocks, one floor, white, **dark roofs**, louvred windows,
  air-conditioners; a row of trees along the north edge, groups of big trees between the buildings.
- The car parks (east, before the K. Folson Building, between the N Block and the long range, west) are kept **nearly
  empty** as the photos show them; a phantom outline on Ebenezer Laing Road removed.

## 59. The N Block front, the GCB's back, Plant and Animal Biology from eleven numbered views

From the owner's aerial (picture 1, `images/271.jpg`) with eleven numbered view lines and a PDF of street photos
(`images/272-285.jpg`; view 2 has two photos, view 8 three) (`biology.ts`, `labs.ts`, `nblock.ts`):

- **Plant and Animal Biology are the same building type** (the owner's key note: the two lines marked view 8 show the
  same street view and the same structure). Both are built from one kit, `bioBlocks` / `bioParts`: long one-floor
  ranges, white with a red-brown base, **hipped red-brown tile roofs**, open **verandahs on white columns with red-brown
  feet** along the court sides, and rows of louvred windows. Animal Biology (`labs.ts`) now uses the kit; Plant Biology
  is new.
- **Plant Biology entrance** (view 10): the **entrance terrace** on its west side, with **steps between rubble-stone
  walls**, two **Norfolk pines** and clipped round trees, pots and a bench, the lit glazed door. The asphalt car park
  in front has empty bays and a round bed with a tree (view 11). Entrance in `access.json`.
- **Centre for Biodiversity Conservation Research** (view 2, two photos): a one-floor block on a **rubble-stone base**,
  a **dark brown tile gable roof** with a deep brown fascia, its sign and windows on the east gable, a **red stair with
  black rails** on the north face. In front: a **white pierced screen wall** with stone beds and steps, the **open black
  gate**, the board, asphalt. It is no longer part of Animal Biology's footprint, and it has its own entrance.
- **Ocean Margins Initiative** (view 6): a small flat-roofed box with a **deep white fascia**, its name, a red base,
  a glass door and a blue plaque, caged air-conditioners, a red cordyline. Next to it is a **blue shed with a red roof**,
  and **ashoka trees** (tall, columnar, drooping).
- **The ashoka row** (view 3): a dense row of ashokas along the road south of Animal Biology, on a low kerb; the
  generic wood mapped there was removed.
- **The GCB's back / the Students Financial Aid Office** (view 5): white galleries on round and square columns with a
  dark band, a parapet, a brown soffit, the **drum** with its sign, and an **open stair** along the front with a steel
  rail. A white wall with a purple bed and young trees runs in front.
- **The lane** (view 7): the **rubble-stone retaining wall** along its west side, with a grass wedge on top.
- **The avenue's median** (views 1 and 4): grass, **brick paving strips** along both kerbs, **conifers** and **tall
  lamp poles** every 14 m. The generic street trees no longer grow on it (the median is kept clear).

## 60. Corrections round the N Block: the market, the greenhouse, the woods, the court and its levels, the lane

From five marked pictures and a PDF of three photos (`images/286-293.jpg`; `market.ts`, `greenhouse.ts`, `socsci.ts`,
`relief.ts`, `biology.ts`, `corrections.json`):

- **The market between the GCB and the N Block** (picture 1, green circle; picture 2): north of Ebenezer Laing Road,
  on bare earth under tall trees with thin trunks and flat feathery crowns: **two stalls under orange canopies** (the
  near one with a counter of printed panels and coolers), a **white and a blue tent** behind them, **rows of blue
  benches on concrete posts** west of the footpath to the north, a grassy hump along the road, a utility pole with
  posters. The generic woods keep off it (`keep`).
- **The greenhouse** (picture 1, yellow; picture 3, blue): the mapped block east of the road past the K. Folson
  Building is a **tunnel of clear plastic film on hoops**, 9.8 by 29.5 m, its benches of plants seen through the film,
  the door, a louvred vent and a fan box in its south end, a **black water tank on a steel stand** beside it.
- **The woods east of the New N Block** (picture 4, red box): no building there (the mapped one is excluded); the
  ground is woodland (`owner:woods-nnb-east`).
- **Levels of the N Block compound** (picture 5 and the court photo): the court and the range behind it (the
  **Department of Psychology**) are **level with the road** (batch 58 had raised the range 1.2 m above the court;
  wrong). The ground **north of them round the K. Folson Building lies 1.2 m lower**, below a **pitched bank of rubble
  stone** along the north of the range and of the platform before the long range; the car park east of the long range
  falls toward it (its bank grows to the north).
- **The two stairs and the blue tent** (picture 5): the stairs between dark red cheek walls climb the bank **south**,
  one into the lane between the range and the long range, one before the range; the **blue tent stands on the platform
  before the north end of the long range** (it had been put north of the range's east end, by the K. Folson Building).
- **The Department of Psychology** (PDF picture 1, blue arrow): on the court side a **verandah on white square posts**,
  a white band under the eaves, **grey walls** below with barred windows and grey doors, a darker **grey base** (it had
  a wine base); its board UNIVERSITY OF GHANA DEPARTMENT OF PSYCHOLOGY. Its north side keeps the dark red base the view-2
  photo shows.
- **The court** (PDF picture 1): the **two huge rain trees** (yellow arrows) with massive trunks forking low; the
  **memorial** (red arrow), a block of grey granite with a black plaque, the blue U on a red stand behind it, the
  RESERVED H.O.D. board; the **trunks of felled trees cut into rough blocks**, piled under the big tree (orange); the
  stump of a felled tree in the paving; the open court with no tree in the middle.
- **The POSSA canopy** (PDF picture 1 image 2, green arrow): a low **hipped roof of grey-brown corrugated sheet** on
  thin white posts, a **deep blue fascia lettered 2023/2024 POSSA EXECUTIVES**, swags of purple and white striped cloth
  slung from its corners to the posts, rows of blue steel benches.
- **The lane past the Department of Nutrition and Food Sciences** (PDF picture 2): it **runs down toward its north
  end** (about 1 m), below the lawn held up behind its rubble-stone wall (the wall grows taller to the north), and
  climbs gently back along its leg east to Animal Biology.

## 61. The 38-page reference PDF: game views beside street photos

The owner's PDF pairs game screenshots with photographs of the same places. The page-by-page audit, with what each
page shows, the corrections and what stays uncertain, is `docs/CAMPUS_REFERENCE_AUDIT.md`; the images are
`images/294-362.jpg`.

**West of the Volta Hall Annex**
- The **two-storey block circled green before the Volta Hall Annex is deleted**.
- **Graduate School**: one floor with its arched porch, its car park and its trees.
- **Doctorate building**: two floors, with the portico and the paver car park.
- **Construction site**: a hoarding with boards and striped posts, not two finished blocks.
- **Research and Innovation Complex**: maroon hipped two-floor blocks, the stone feature wall, the palisade and the
  security post.
- **Nursing School**: its north front onto the car park, and the three-floor block across that car park.
- **Volta Hall Annex**: the louvred east front between plain range ends, the wall, the gate and the red lattice water
  tower.
- **Mast compound** between WACCBIP and the School of Pharmacy (`westgrad.ts`, `labs.ts`, `volta.ts`).

**Behind and east of the Balme Library**
- **Chemistry Extension**: up on its walled, hedged terrace, with paired shutters, street lamps and pavement.
- **Uncompleted building**: in its blue hoarding, where the car park was.
- **Chemistry Department**: two floors, with its verandah and the three-column portico.
- **Balme Library east side**: the four-floor arm with its entrance, the tower with the glazed stair, and the
  octagonal window of the study room.
- **Building west of Physics**: a hipped roof, the five tall windows and the link (`behindbalme.ts`, `physics.ts`,
  `balme.ts`, `relief.ts`).

## 62. The second reference PDF (54 pages): corrections, then further places

The owner's second PDF pairs more game screenshots with street photos. The audit, page by page, is Part 2 of
`docs/CAMPUS_REFERENCE_AUDIT.md`; the images are `images/363-424.jpg`.

**Corrections first (pages 1-7)**
- **Volta Hall Annex**: the louvred side is its back, toward the Graduate School (west), behind a wall with a gate and
  the red lattice water tower. The front, with balconies, faces the Business School across a white wall with its gate.
- **The two-storey block circled red near the Graduate School is deleted** (`corrections.json`).
- **Nursing School**: its back reads as one connected building. The name board is on the east end.
- **The silver aluminium-sheet fence** runs from the west end along the back of the car park to the Pharmacy block's
  back, closing the passage north toward St. Thomas Aquinas (`volta.ts`, `labs.ts`).

**Further places (pages 8-54)**
- **The lane from Physics to Frank Torto**: climbs to a crest by the turning to LECIAD, then falls to the Chemistry
  Extension and Frank Torto. LECIAD's ground stands higher behind a bank (`relief.ts`).
- **Physics car park**: at the court's open east end, toward Earth Science. A flat sheet roof on steel posts over
  red earth, a strip light, cars under it (`physics.ts`).
- **Absa**: the front on the east under the gable with the absa disc. The ATM porch with two red ATMs under its tiled
  lean-to, three steps, a ramp with a steel rail, the guard booth, and the yard behind black iron bars with its tree
  and covered dish. A stone bed under the south windows, the red board on the corner lawn (`balme.ts`).
- **The building opposite Absa**: one floor, dark tiles, a timber gable on the west. A sheet lean-to over the
  generators, the railing along the kerb, the dish, the blue tank and the lattice mast (`balme.ts`).
- **The Bookshop's back**: the middle's centre set back between two piers with round windows, two columns under the
  roof. The north range's upper floor is a verandah. Air-conditioners and the water tanks in their pen
  (`balmewest.ts`).
- **Volta Hall**:
  - The front steps are grey, between rubble-stone walls, with a stone planter splitting the upper flights.
  - Beds, a tall clipped conifer, a red post box, and the reserved bays (TUTOR, DEPUTY SENIOR TUTOR) on darker pavers.
  - The south side toward History stands on a two-tier rubble-stone wall over Volta Road, with its green name board.
    The terrace now drops there instead of sloping as a grass bank (`volta.ts`, `relief.ts`).
- **The small buildings on Volta Hall Road** (`voltafront.ts`), each modelled from its photo instead of the one
  generic cottage (`residences.ts` no longer builds them):
  - the substation with its timber double doors and danger sign, and the generator under a red pyramid pavilion;
  - the cottage and the red iron cage under the big tree;
  - the wider cottage;
  - the washroom ("Rest station") with its lantern roof.
- **Fidelity Bank ATM**: on the Danquah Avenue footway below the French Department's west wing. Orange pillars, a
  white panel, the canopy with ATM | FIDELITY BANK, a tiled plinth. The footway is paved to the kerb; a platform with
  steps and a ramp runs down along the wall, with grates along the kerb and a yellow and black barrier
  (`voltafront.ts`).
- **BESTIES**: a one-floor front on Volta Hall's south flank toward Volta Hall Road. A dark fascia with red letters, a
  glazed door, a red foot, a red-earth forecourt with its menu board and stump, and a black lift barrier with a
  yellow-banded pole and a STOP sign (`voltafront.ts`).
- **Athletic Oval basketball seating**, on the north of the two courts east of the oval:
  - six rows of red bucket seats on a grey steel frame along the side toward the track;
  - welded mesh panels on square posts;
  - the scoreboard and an orange bench (`athletics.ts`).
- **Back of Akuafo Hall Main**, the court between the south wings:
  - hexagonal pavers out to the road, with concrete strips holding steel drain grates;
  - the lawn 0.45 m up behind a low white concrete edge, with three steps up and a slab walk to the cross range;
  - clipped bushes and hedges (`greathalls.ts`, `relief.ts`).

**Not modelled**
- **The Legon Hall restaurant (page 46).** The caption names a small restaurant before Legon Hall's north-west side,
  but no photo of it is in the PDF. The captions of pages 46-50 sit one picture off: page 46's screenshot and page
  47's photo are the oval seating; pages 48-49 show the back of Akuafo.
- **Roofs.** The photos show darker, older tiles on several of these buildings than the game's orange; the hall
  roofs keep the colours set earlier.

## 63. The third reference PDF (67 pages): the Pentagon, New Pent, the Kufuor Centre, Engineering

The owner's third PDF pairs game views with street photos of the Pentagon and its surroundings. The audit is Part 3 of
`docs/CAMPUS_REFERENCE_AUDIT.md`; the images are `images/425-514.jpg`.

**The order of the Old Pent courts (the owner, first).** From the entrance on Annie Jiagge Road, west to east:
**Addis Ababa, Dar es Salaam, the admin block, Kampala, Nairobi.** These are OSM's own labels; the earlier rename
that swapped them is gone (`naming.json`), and the entrances, route checks and tests follow.

**Old Pent** (`pentagon.ts`)
- **The courts**:
  - three storeys of cream render with pilasters and dark louvred windows over a deep red base;
  - each wing's end, front and back, is a gabled pavilion with a tall arched recess;
  - the stair core is set back between the wings, with breeze-block screens, and has no tower;
  - the porch has a rendered gable with the court's plate (KAMPALA COURT, KC, and so on), an arch, steps between
    red kerbs, a brick walk, kerbed lawns, fan palms with whitewashed trunks, a solar lamp and marked parking;
  - at the back: storerooms behind red doors, a slab walk, bare earth, a black water tank.
- **The entrance**:
  - the security post in front of Addis Ababa: cream walls, a red tiled roof, a door and louvred window toward the
    court;
  - the white palisade on red posts along Annie Jiagge Road, and the red and white trellis gates swung back;
  - poster-wrapped bollards, the poster kiosk on the north side, pavers, shade trees, feather flags and the zebra
    crossing.
- **The kiosk between Addis Ababa and Dar es Salaam**: white boards over a dark red base, a rusty lean-to over the
  counter, the MoMo / Telecel Cash / AT Money boards, and beds of shrubs.
- **Behind Nairobi**: the blue generator under its lean-to on gravel, and the low food building with its red base,
  red steps, grille doors, red sheet gable and timber clerestory.
- **The Ghana Hostels admin block**:
  - the four-storey west tower and the three-storey east wing under front gables, with strips of facing brick;
  - the arched loggia and the top-floor balcony;
  - red pillars and railings along the shops under the red tiled veranda;
  - the blue **Ecobank ATM**;
  - the sunburst porch on red columns, the royal palms in white gravel, and the blue tensile shades over the parking.

**New Pent Blocks A, B and C** (`newpent.ts`). The owner says B is behind A, in the same orientation and of the same
design, and C is the same design too, so every four-storey wing in the zone is built to one design:
- white walls over a dark grey base, with balconies carrying brick panels on the long sides;
- end walls faced in brick, with the white stair strip and its arched head;
- red-brown hipped roofs.

Round the blocks:
- each block's entrance: a white tower with an open arched loggia over a gabled porch reading BLOCK A, B or C
  (Block A's moved west of the mark, clear of the wing beside it);
- brick walls with grey piers and steel gates along Pent Road, and the transformer;
- the generators under sheet roofs (Block C's on cream columns on a raised platform);
- the red and white lattice mast;
- the yellow **Boba** kiosk with its seats, by Block C only.

**Behind Old Pent** (`kufuor.ts`)
- **The Kufuor Centre for Leadership and Governance**, unfinished:
  - a bare concrete frame of three floors on round columns, the curved tiers of its front, a dark roof edge, and
    blockwork at the back;
  - the round gate house under a conical tiled roof;
  - corrugated sheets along the road and the south side, the rusted slat gate, red earth and heaps of paving blocks
    (corrected in section 66).
- **The hoarding** of poster-covered corrugated sheets along Annie Jiagge Road from the Kufuor Centre to the Pent
  entrance.
- **The building behind Old Pent** (the Y behind Addis Ababa and Dar es Salaam): four storeys, yellow, red roofs,
  with round balconies and a black spiral stair on its west wing's end (moved there in section 66).

**Engineering** (`engineering.ts`, `enclave.ts`)
- **The jet trainer** now faces east, the right way round: sand, brown and green camouflage, a pale belly, the Ghana
  roundel and tail flash, tip tanks, on its pad behind a mesh fence on a low white wall.
- **The bank below the main road** is faced in pitched rubble stone, with brick paving along its foot.
- **The Innovation Enclave's buildings** (the small buildings in front of Engineering) have broken roofs: the gable
  over the enclosed part, and the verandah's roof running on at a shallower pitch.

**Uncertain**
- Which building the spiral stair belongs to (pages 57-58 are captioned "west side of Block C"; the photo shows a
  yellow building that matches the one behind Old Pent).
- The positions of the generators, the transformer and the mast are from the photos, not measured.
- The page 67 caption speaks of four small buildings; the game has six there, and all six now have the broken roof.

## 64. Corrections after the third PDF (the owner's message and corrections PDF)

The owner's pictures are `images/515-530.jpg`.

- **Volta Hall Annex**:
  - every long side now has recessed balconies with black railings, as in the owner's street photo;
  - the windows are glass, divided by bars of black-painted wood;
  - white slab edges stand out at each upper floor, with white piers between the bays (`volta.ts`).
- **Nursing School**: the block north of it (violet on the owner's top view) is part of the school, not a separate
  green-windowed building. It is joined to the main block by the entrance core (yellow):
  - the core has small balconies stacked over the lit door, with the second name board;
  - the tall blank stair tower stands at the north block's corner;
  - the north block has three floors of white wall with small windows and air-conditioners, and the shed with blue
    doors at its foot;
  - the main block stands on columns all along its north side, and the car park lies east of the north block
    (`labs.ts`).
- **Research and Innovation Complex**: the security post moved to the west of the gate, on the left as you come in
  (`westgrad.ts`).
- **Plant Biology and Animal Biology**: the fronts now have their rows of square white pillars with red-brown feet
  under the roof carried out over them:
  - Plant Biology on its south front toward J.K.M. Hodasi Road and the Chemistry Extension;
  - Animal Biology on its west front toward the Department of Nutrition and Food Sciences (`biology.ts`, `labs.ts`).
- **The building before Volta Hall mapped as "Rest station"** is an open bus stop: a tiled roof on four timber posts,
  a bench, a notice board and the sign.
- **The small buildings before Volta Hall**:
  - the cottage north of the substation is removed, along with the iron cage under the big tree;
  - the substation and its generator pavilion moved into its place (`corrections.json`, `voltafront.ts`).
- **BESTIES** is not at Volta Hall. It now stands before Legon Hall's west block, across Dr. J.B. Danquah Avenue from
  the Fidelity ATM, with its forecourt and STOP barrier.
- **The building opposite Absa**: the generators under their lean-to moved to the back; the front has two big
  satellite dishes behind the railing (`balme.ts`).
- **Behind Old Pent**: the small buildings on the lane from Annie Jiagge Road are removed (the owner circled two; a
  third footprint stood directly behind the first).
- **New Pent**:
  - each block's front structure is lower, its whole front faced in brick with the white stair strip and arched
    window, its sides white with balconies; the same on Blocks A, B and C;
  - the brick walls with cream-white pillars run only from one wing to the next along Pent Road, with a grey steel
    gate: on Blocks A and B the gate is near the north wing, and Block A's generator stands beside it; on Block C's
    west side the wall runs from the generator's platform to the transformer, its gate on the brick drive
    (`newpent.ts`).

## 65. The Pent Hall corrections PDF (27 pages)

The owner's pictures are `images/531-562.jpg`. All the Old Pent courts share one design, and so do all the New Pent
blocks, so each change below is made once for every court or block.

- **Old Pent courts** (`pentagon.ts`):
  - the windows are glass louvre blades;
  - the gaps between the side wings are closed by red brick walls in a grey frame, each with a ribbed red metal
    door;
  - the back is closed by the same brick wall without a door;
  - the storerooms that stood behind the courts are gone.
- **Behind Nairobi**:
  - the generator stands where the small tent was, and gravel covers the gap;
  - a brick-paved walk runs along Kampala's ground walls toward the food joint.
- **The food building**: on its west end, a white annex wall with a red base and two open doorways with red steps.
  Behind it stand two aluminium kiosks, one dark with a yellow board and one silver, under timber-edged roofs. A
  brick walk leads to it.
- **The filling station** (mapped "Oando", `fuelstation.ts`):
  - a Shell forecourt on herringbone paving, its canopy with yellow and red fascia and Shell emblems, and three pump
    islands with V-Power boards;
  - the **Shell Select** supermarket with its red hip roof, yellow band and glazed doors;
  - the tyre and mechanic shop east of it under its canopy, with purple banners (Goodyear, Apollo, Michelin) and
    tyre racks;
  - the Sweet Top Bites container, a blue tent, a palm and a small white store;
  - a short white wall round the site, with the open entrance on the south.
- **The Boba kiosk** is rebuilt from the photo: a small box with a serving window and painted drinks, a yellow
  awning, the "BoBa" board on the roof, high tables with stools, black planters with spiky palms, a lamp and turf
  (`newpent.ts`).
- **New Pent blocks** (`newpent.ts`):
  - every window section has a balcony: a slab, a brick parapet and side cheeks;
  - the front structure's ground floor has large windows instead of balconies;
  - the windows are glass louvre blades.
- **Block A**:
  - the brick fence walls join the building behind the generator, on Block B too;
  - the front right is an open passage with no gate;
  - the front left is a terrace on red hex pavers, with low brick walls and grey caps.
- **The road to Block B** runs up on a hill 1.3 m above Block A's car park, behind a pink retaining wall:
  - seven steps lead up from the gravel car park, between cheek walls with rails;
  - benches and trees stand on the road;
  - the road ramps back down to Pent Road (`relief.ts` terrace and stairs).

## 66. The second Pent corrections (the owner's message, the 15-page PDF and the top view of the food joint)

The owner's pictures are `images/563-581.jpg`.

- **Windows**: the glass louvres of every Pent building, old and new, are dark grey, as they look from outside
  (`pentagon.ts`, `newpent.ts`).
- **Car parks** (`newpent.ts`), concrete with marked bays and parked cars:
  - before Block A's front structures, toward the road;
  - below the rise behind Block A (the gravel replaced);
  - before Block B's front structures, either side of its entrance;
  - along the drive on Block C's west side.
- **The MoMo kiosk** stands in the middle of the space between Addis Ababa and Dar es Salaam, by the road, its counter
  and lean-to facing west toward Addis Ababa.
- **The entrance**:
  - the two gates are red frames with white upright bars and red braces zigzagging between the rails;
  - the security post has a door on its face toward the road into Pent.
- **Pent's fence** is cream metal: flat bars on two rails, with no red pillars. It runs:
  - along Annie Jiagge Road from behind Old Pent, past the entrance and Blocks A and B;
  - behind Block B east to Pent Road, and beyond Pent Road along the back of Block C;
  - behind Old Pent, between the courts and the yellow building's grounds, to the drive into them;
  - beyond the drive, behind the admin block and Kampala, to the food joint.
- **The gates in the brick walls between the Old Pent wings** are built like the fence: cream bars with open gaps.
- **The wood behind the School of Engineering Sciences**, seen from the Pent entrance, fills the ground west of Annie
  Jiagge Road up to the school (`corrections.json`).
- **The yellow building behind Old Pent** (`kufuor.ts`):
  - its round balconies and spiral stair are on the end of its west wing, toward Annie Jiagge Road (the owner's
    arrows on the top view), not on the east end;
  - a cream rendered wall closes its grounds and car park, with the drive coming in on the north.
- **The Kufuor Centre's sheet fence** follows the owner's red line:
  - it runs along Annie Jiagge Road from the corner behind Old Pent, then turns east along the south side to the small
    building there;
  - the rusted slat gate is in the roadside run, just north of the round gate house, which now stands on that line;
  - the sheets that boxed the centre in on its other sides are gone.
- **Behind Kampala**: the blue generator stands behind the gap between Kampala and Nairobi, beyond the slab walk.
- **The Shell station's south edge**, west to east (the owner's photo from the forecourt):
  - the small white store, then the open way in;
  - the Sweet Top Bites restaurant (black, red awning, its name on a red lattice on the roof) with the delivery
    motorbikes before it;
  - the blue tent, a small kiosk and the palm (`fuelstation.ts`).
- **The food joint behind Nairobi** (the owner's top view): the mapped footprint holds two parts.
  - On the east, the food building under its red gable roof.
  - On the west, a yard walled in white over red, with the black kiosk in its north half and the white kiosk in its
    south half.
  - The yard has two open entrances up red steps: one in the north wall by the building, one in the west wall between
    the kiosks.
  - The walk from the gap between Kampala and Nairobi, and along Kampala, is concrete.

## 67. NSIA Road by the Frank Torto Building (the owner's reconstruction brief)

The brief has six game/photo pairs and an overhead map; the pictures are `images/582-594.jpg`. Its priority is the
topography: a lower paved corridor beside higher planted ground, with retaining walls, banks and shaded road edges,
built as geometry with collision rather than painted on a flat plane. Nothing here is surveyed. The photos give
relative levels and local edges only, so every number is a calibration value in `src/game/nsia.ts`, read by the
terrain, the models, the route layer and the comparison cameras.

**The layout from the map.** NSIA Road runs north–south at x 235, from J.K.M. Hodasi Road (z −162) to the Danquah
Avenue roundabout. West of it lie the Chemistry complex and the narrow lane at x≈210, the "lower corridor". The tree
belt lies between the lane and NSIA Road, with a short road joining them at z −26. The cross-shaped Home Science Annex
is to the north-east, LECIAD to the south-east. No new roads were added.

**Terrain** (`relief.ts`):
- The lane keeps the owner's earlier profile: a crest of 2.0 m from z −40 to −5.
- **The tree belt** stands a wall's height above the lane:
  - its top is the lane's height plus the wall's exposed height (1.1 m);
  - the wall falls to 0.12 m over its last 10 m into the corner by the connecting road;
  - a bank closes its north end toward the low building by the car park.
- **NSIA Road** runs in its own cut:
  - flat 4.6 m either side of its centre, easing into the ground beside it over a 3.5 m bank;
  - a gentle hump of 1.45 m at most along it, with no hill invented;
  - flat past Earth Science, and level with J.K.M. Hodasi Road at its north end;
  - so the belt on the west and LECIAD's ground on the east stand 1.0–1.8 m above it.
- **On NSIA's east side** a short stretch (z −50 to −42) is held by a wall instead of the bank, its ends easing into
  the bank.
- **The connecting road** and **the road east to LECIAD** have their own gentle profiles (about 7 %) into NSIA's cut.
  Where two cuts meet, the nearer road's line decides the ground, so the junctions have no step.
- **The low flat-roofed building** by the car park sits on its own flat pad. A plain concrete retaining edge holds back
  the higher ground on its south side.

**Models** (`nsiaroad.ts`, `physics.ts`):
- **Pair 1, the Frank Torto Building:**
  - weathered cream-grey concrete instead of white;
  - flat roofs behind parapets (the pale hipped roofs removed);
  - on the tower, broad piers and a recessed strip of dark windows in each storey, with a smaller framed opening below;
  - a column of perforated ventilation screens up the south end beside the department's sign.
  - The low building has grille doors, a white roller shutter and a dark opening on its south front, and the car park
    has two small planted islands in round kerbs.
- **Pair 2, the lower corridor:**
  - the stone-faced retaining wall along the lane's east side: irregular warm tan, rust, brown and pale stones in dark
    mortar, laid in world space over 2.6 m with a drifting tint so the pattern does not repeat obviously; a dark coping;
  - dark asphalt from the lane to the wall's foot;
  - on the right, the porch on the chemistry range's end: a broad white pier either side, a shallow flat roof with a
    reddish fascia, a black gate grid, the concrete apron and its narrow open drain along the road.
- **Pair 3, the raised grove:**
  - the dry belt behind the wall, its broadleaf trees rooted on the upper ground;
  - the greenish telecommunications mast with its pale antenna panels and cable.
- **Pair 4, the verge before the chemistry range,** looking west along the car-park road:
  - reddish bare soil under the big tree, with leaf litter, roots and a few weeds;
  - the long grated drain along the road's edge: concrete lips, a dark channel, transverse bars;
  - the low dark planting strip across its west end;
  - the range's cream wall and dark red foot on the left.
- **Pair 5, the corner:**
  - the wall losing its height into the bank;
  - the kerb sweeping round from the lane into the connecting road;
  - the reddish path worn down the bank to it;
  - two slim lit poles and a small sign on the belt.
- **Pair 6, NSIA Road's east bank:**
  - the dry bank rising from the kerb to the big tree and LECIAD's service buildings;
  - the short retained stretch at its north end.
- **Ground cover:** straw-brown and olive grass with blotches of reddish earth on the belt and the banks.
- **Trees:**
  - broadleaf trees with high forks and overlapping crowns, one pruned and sparse;
  - within the area, generic palms and flame trees become broadleaf trees.

**The ride:**
- **Plain stretch:** along the route the road has no edge lines, centre dashes, pavements or decorative trees
  (`world.ts`).
- **Wall placement:** the wall stands just outside the ridden route's road (lane centre + 4.0 m), so the road stays flat
  across beside it.
- **Blocking:** the wall blocks the free ride, by its collision line and by the bank-steepness rule. The drain does not
  block it.
- **Slope:** the bike now pitches with the grade under its wheels, eased, in both route and free rides (`Game.ts`).
- **Tests:** the route tests check the wall's height and taper, NSIA's cut, the grade of every local road, flatness
  across the ridden road beside the wall, and Explore rides both ways with no jolts.

**Comparison cameras:** `?view=pair1` … `pair6` in `tools/preview/halls.html`, with `&route=1` to draw the ridden route.
They read `NSIA_VIEWS` in `nsia.ts`. Their stations and headings are provisional, matched to landmarks.

**Still unmeasured:**
- the wall's real height and line;
- NSIA Road's profile and its grade;
- the belt's levels;
- the real width of the lane.

Two jolts on the Explore rides were there before this work: the climb to Frank Torto's door over the Chemistry
Extension terrace's edge, and Physics' steps.

## 68. Volta Hall: the front restored and the south-east section (the owner's corrections, set 1)

The pictures are `images/595-598.jpg`.

**The front (picture 1).** In an earlier batch the owner asked for the building circled blue among the small
buildings before Volta Hall to be deleted and the violet one moved into its place. The owner now says that was a
mistake, so the section is back as it was (`voltafront.ts`): the substation and its pavilion, the cottage with the red
iron cage and the big tree, beside the bus stop, the wide building, the fidelity building and BESTIES. In the registry
the exclusion of `osm:way/773887685` and the reshape of `osm:way/665124067` are removed again, and the cottage keeps
its one floor (4.5 m).

**The south-east section (images 2-4: the yellow arrows along the south side and round the east end)**
(`volta.ts`, `relief.ts`):

- **Massing.** The section is three parts joined to the hall:
  - the long south block, with cream walls, grilled openings upstairs, big black grille windows below, and a dark
    weathered tile roof;
  - the gable wing between it and the east end, its gable to the south;
  - the porch building at the east end, raised onto its own terrace and joined to the hall's terrace. Its west half is
    a deep porch on three columns, with grille windows behind. Upstairs there is a balcony with a solid parapet and a
    dark capping, and the upper rooms are set back behind it under a dark hip roof with a deep overhang.
- **The retaining wall** is a real two-tier stone structure, not a smooth face. It is made of irregular brown, tan and
  reddish-grey stones (the NSIA Road stone), with pale ledges at each tier. It runs along the south side from x −336
  to −241, then returns up the east end, with collision all along.
- **Planting.** Dense dark-green shrubs with red flowers grow along its foot. There is a palm by the porch building,
  and broadleaf trees stand along Volta Road, placed so the building stays visible.
- **The sign.** The Volta Road sign is moved to where the photo shows it.
- **Roof colour.** The satellite view shows terracotta roofs. The photo was taken at dusk, where they read dark. The
  roofs are a darker weathered tile as a compromise.

## 69. The Kuffour Quadrangle, Hodasi Road, Cruise O'Brien Road and the Plant Biology frontage (the owner's brief)

The brief has seven game/photo pairs and a layout map (image 15); the pictures are `images/599-613.jpg`. The work
followed the brief's order: layout first, then levels, then massing, then details. The adjustable numbers are in
`src/game/kuffour.ts`:

- the garden's outline and height;
- the walls;
- the approach, the landing, the memorial and the statue;
- the fountain and the ring of features round it;
- the zebra crossings;
- the shell and the hoarding;
- the kerbs and the drain;
- the east verge's rise;
- the veranda;
- the edging strip;
- the AC bay;
- the plain road stretches;
- the seven comparison cameras (`KQ_VIEWS`, `view=kq1` to `kq7` in the preview).

The map was matched to the game at 4.23 px/m with north up. Nothing is surveyed.

**The garden** (`kuffourgarden.ts`; the old fountain spec has left `balme.ts`):

- **Outline and walls.** The outline comes from the map. A low wall of warm irregular stone with a pale coping runs
  along Hodasi Road and along the road to the south. It jogs out toward the roads in the middle and is open on the
  axis.
- **Ground.** The garden stands 0.4 m above the roads (`relief.ts`, on a 0.5 m grid so the walls hide the banks). On
  the west and east it falls gently to the paths. A strip of worn reddish earth lies between the asphalt and the wall.
- **Inside.** A paved square sits behind white planter walls with low hedges.
  - The round fountain at its centre carries the sculpture of interlocking loops. It is **pale**, as in the brief's
    newer photos; the owner's earlier photo shows it blue, and `KQ.fountain.sculpture` switches between the two.
  - Round it is the ring of segmented features from the map: curved water basins to the east, west and south, a
    curved planted bed to the north, and eight round shrub beds edged in red.
  - Outside the square are the lawns, the east–west path and the path to the south gate, with low red-painted
    edging. There are short blue-and-white bollard lights, shrubs with red flowers behind the walls, a few small trees,
    and the leaning tree by the north-east corner (pair 3).

**The monuments, kept as three separate objects:**

- **The memorial approach (pair 1).** From Hodasi Road a terracotta tiled floor, with pale mended patches, runs
  between low stone side walls with a broad light coping. Two steps lead up to the red-paved landing with its raised
  red edge. On the landing stands the black upright memorial on a three-tier pale plinth. Its face carries a portrait
  in a thin frame; no inscription is invented, only faint lines where the photo shows lettering. Two Christmas palms
  frame it, about 3 m tall like the photo's. Beside the approach are red-edged beds of variegated plants and flowering
  shrubs.
- **The statue (pair 2).** A dark standing figure on a rectangular stone pedestal stands west of the landing.
- **The sculpture** is on the fountain at the centre.

**Hodasi Road.** There are two zebra crossings: one on the approach's axis and one at x 26.4 from the map (pair 3). The
generic kerbs, drains, lamps and route paint are off along Hodasi Road and Cruise O'Brien Road here
(`KQ.plain`: `world.ts` and `life.ts`).

**The library (pair 2).**

- A two-floor pavilion now stands forward of the north range before the tower, with round-arched dark openings below
  and its own hipped roof. The north front no longer reads as one repeated-window slab.
- Mature broadleaf trees with rounder, denser crowns (a new `round` option on `broadleaf`) stand between the road and
  the library and screen its north front.

**The unfinished building and its hoarding (pairs 4 and 5)** (`behindbalme.ts`, rebuilt):

- **The shell** is placed from the map's pale roof at x 70.6–81.4, z −133 to −116.4. It is a cream-grey concrete frame
  with thick piers and the floor slabs' edges as projecting bands. The blockwork walls have big empty openings, and
  there is a deep shadowed recess at the upper floor's east end. A dark core sits behind the openings; no interior is
  invented and there is no scaffolding. The roof is a shallow dark hip with a 1.3 m overhang and a pale fascia.
- **The hoarding** is pale blue ribbed sheet in panels of slightly varying tints, with worn panels and posts. Posters
  hang in irregular clusters with torn remnants, on the sides facing the roads, and nothing on them is readable.
- **The ground round it.**
  - Small brick pavers run round the hoarding, and the broad brick apron lies to the south.
  - A raised kerb sweeps round both corners, with the asphalt following it inside the curves.
  - Along Cruise O'Brien Road there is an open drain beside the asphalt, outside the riding line.
  - There are slim angular street lights, and a young tree over the sheeting.
  - A parked pickup sits on the apron. It is a removable prop (`KQ.pickup`).
  - The row of tall trees west of the hoarding is now slender, irregular drooping trees (`mastTree`) instead of
    stacked cones.

**Cruise O'Brien Road's east side (pair 5).** From the road out there is the edge, a gutter strip and a narrow footway.
Then a grassy rise (a second terrace in `relief.ts`) climbs to the rubble wall, which now stands set back at x 105.6
and shows its upper part. The dense hedge on top rises and falls. The slim angular lights stand on the footway.

**The Plant Biology frontage (pairs 6 and 7)** (`biology.ts`):

- **The veranda.** A veranda now runs along the west wing's east face into the inside corner. Its slender white
  columns with red feet stand in front of the wall, and it has its own low roof with a reddish beam.
- **The enclosed return.** The wing's south end is a separate range, so its roof turns the other way. Its plain face
  has the tall narrow dark opening.
- **The south front** behind the verandas has dark-framed windows divided by horizontal bars, alternating with dark
  doors.
- **Details.** An air conditioner is fixed to the wall at one bay. A narrow concrete edging runs between the verge and
  the lawn, and the verge has patchy dry grass and red earth.
- **Trees and shrubs.** Large shrubs stand against the walls. There is a slender forked tree before the corner and
  dense broadleaf crowns further east. The tree that stood inside the wing is gone, and no generic tree or lamp stands
  on the frontage.

**Checks.** The route tests now check:

- the garden is raised;
- Hodasi Road and Cruise O'Brien Road are at road level across the riding width;
- the walls and hoarding stand clear of the roads;
- the east wall stands set back above its rise;
- Explore rides along both roads both ways are smooth.

**Assumptions and what would help.**

- **Cameras.** They are estimated from landmarks (the wall's jog, the tree row, the tower). Pair 3's station, between
  the map's crossing at x 26 and the photo's crossing near the camera, is the least certain.
- **The statue.** Seen from pair 2's station, its position in the photo coincides with the memorial's bearing. It is
  placed just west of the landing so the two read as separate objects. From pair 1 it shows beside the right palm
  where the photo shows fronds.
- **The shell.** Its footprint follows the map's pale roof, not the hoarding's middle.
- **Still needed:** the garden wall's height and the step at the approach, the north road's lane positions, the
  shell's real footprint and floor heights, and the department's veranda depth.

## 70. The science campus: Frank Torto, the Chemistry gable, the Home Science Annex, ECOWAS, behind Computer Science (the owner's nine-pairs brief)

The brief has nine game/photo pairs and three annotated maps; the pictures are `images/614-634.jpg`. The work followed
the brief's order: blockout first, then the nine camera views, then details. The adjustable numbers are in
`src/game/science.ts`. The nine comparison cameras are `SC_VIEWS` (`view=sc1` to `sc9` in the preview). Most of the
scene is in `sciencesite.ts`.

**Where each map falls in the game.**

- **Map 19** (about 4.6 px/m): the circled building is the square block east of the Chemistry Department, at x 166–197
  and z −35 to −10.
- **Map 20** (4.2 px/m): the cross is the Home Science Annex. The courtyard building is ECOWAS Coastal & Marine
  Resources, and the complex below is LECIAD.
- **Map 21**: the yard east of the Computer Science east block, at x 394–412 and z −300 to −268.

**Pair 1, the Frank Torto passage** (`physics.ts`).

- **The tower's south end.** The end of the tower now stands back behind a front wall, so the stack of open landings
  toward the west is real. There are deep openings with a slab and parapet at each floor and dark stair flights
  rising diagonally inside, with no interior beyond. The perforated screen there is gone.
- **The wall.** Broad white wall planes stand between proud vertical concrete members, under the parapet. The
  department's board stays where it was.
- **The passage.** Asphalt now runs from the lane right up to the one-floor building's front, so there is no lawn gap.
- **The one-floor building.** It gains a ventilation-block panel, small lamps over the doors and a threshold and
  drainage edge.
- **Trees.** Trees stand over and behind it.

**Pair 2, the Chemistry gable building.**

- **Massing.** The two-floor placeholder is replaced by one tall storey. It is white with a red plinth and joins the
  wing behind it.
- **Roof.** A dark pitched roof runs east–west with deep eaves and a dark fascia.
- **The east gable.** Dark louvres sit between white structural posts. The narrow glazed assembly at the middle has
  three panels and horizontal framing.
- **Surroundings.** The department's sign stands on two pale posts, and only its heading is written. There are
  rounded kerbs round the lawn islands of the approach, small trees and shrubs by the wall, and a big tree shading it.

**Pairs 3, 4, 6 and 7, the Home Science Annex.** It is rebuilt as a cross of laboratory wings round a court open to
the sky.

- **Walls.** White, with thick piers between the bays. The windows sit deep in their surrounds behind black security
  grids, with a horizontal louvre division.
- **Bays.** They vary by face: wide windows, higher shorter windows and blank bays. The north wing's service wall has
  groups of small high louvres. The wall over the canopy has a long louvre strip, and the doors stand behind grilles.
- **Roof edge.** A broad concrete edge stands out past the walls at slightly different heights over each wing. Shallow
  tiled roofs sit behind it, so the roof is not all flat and not a continuous tiled strip.
- **Projecting bay.** One stands on the west wing (pairs 3 and 4).
- **The service canopy (pair 6).** It sits in the north-west corner and is separate from the main roof: corrugated
  sheet on thin posts with beams and cross framing, and a worn fascia and underside. It stands on a raised concrete
  apron with a dark exposed front face, chipped edges and a step. AC condensers stand in cages, and there is a small
  stump in front.
- **The water tanks (pair 7).** Black ribbed tanks stand on a raised pale plinth at the north wing's west end, with
  simple piping and meter boxes.
- **Ground.**
  - The big rough tree west of the west wing, and crowns along the corridor and round the service side.
  - Red earth and leaf litter under the trees, and weeds at the walls' feet.
  - The ground drape fades into the lawn instead of ending in a hard edge.

**Pair 5, the earth corridor.**

- **The tracks.** The mapped road from NSIA Road to LECIAD, and its branch north between the annex and ECOWAS, are now
  compacted earth. It has worn strips, irregular grassy edges, stones and litter.
- **What is gone.** There is no asphalt, kerb, drain, lamp or route paint there (`SC.earth`; `world.ts` and
  `life.ts` skip those stretches).
- **Riding.** The free ride rolls a little slower and rougher off the roads and on the tracks (`Game.ts`). Leaves and
  stones have no collision.

**Pair 8, ECOWAS.**

- **Massing.** The three-floor placeholder is replaced by one storey along the mapped outline. Its tiles are worn and
  varied, with two big hipped masses on the north front.
- **The entrance.** A lower entrance gable stands between them over a recessed, grilled entrance and a small dark sign
  (no wording guessed).
- **Before it.** A stone-faced terrace with a pale coping and central steps, AC condensers in cages and hedges.
- **The forecourt.** Brick pavers in a herringbone with faint bay lines and kerbed lawn islands. The asphalt spur and
  the grey car park are gone, and a few cars stand as props.

**Pair 9, behind Computer Science** (`issercs.ts`, `sciencesite.ts`).

- **The east block's east end.** Barred windows, small low openings, heavy solid bands at the floors, wall-mounted AC
  units and dark runoff stains.
- **The yard.** It is compacted reddish earth with litter under two mature trees and a smaller one. It has:
  - a low concrete channel along the building's foot;
  - simple wooden tables and benches as removable props, with room to ride between them;
  - the pale freestanding wall at the right;
  - weeds at the edges.

**Checks.** The route tests now check:

- the corridor and its branch are earth and the forecourt is brick;
- rides between LECIAD and the annex both ways are smooth along the corridor;
- the Frank Torto passage is clear;
- the six science models exist.

**Assumptions and what would help.**

- **Cameras.** They are estimated from the maps and landmarks. Pairs 3 and 4 share the big tree and the west wing's
  projecting bay; which face the photos show (the west face or the south face) is the least certain.
- **Gable building.** The eaves height (6.6 m) and pitch come from the photo's proportions.
- **Annex.** The roofs behind its parapets are assumed shallow, since the map shows tiles behind the edges.
- **ECOWAS.** The court's size is from the map.
- **Still needed:** the gable building's wall height; the annex's parapet heights and window sizes; the canopy's depth;
  ECOWAS's front setback and terrace height; a photo looking back toward the Frank Torto passage's far end.

## 71. New Pent corrections (the owner's five pictures)

The pictures are `images/635-639.jpg`.

- **Block B's entrance** stands in the middle between its two brick-ended front structures, as Block A's does (the two
  blocks share one design). It was pushed to the right. The small mapped four-storey piece in the middle
  (`osm:way/744998452`) is excluded; the entrance model draws the tower there. Its access point moved to match.
- **The Boba kiosk** moved to Block C's west side by Pent Road, where the tree was (picture 3), with its serving window,
  awning and logo board facing west to the road (picture 5, red square and arrow). The turf, high tables, planters and
  lamp came with it. The tree now stands on the corner where the kiosk was.
- **The road between Blocks A and B is level.** The rise, its retaining wall, steps and benches are gone from it.
- **The rise is along Pent Road** (yellow arrows): Block A's car park between its east side and Pent Road lies 1.3 m
  below the road behind the rendered retaining wall, with the steps up to the road, cars along it and trees at its
  ends (`relief.ts`: a hollow at x 597-619, z -633 to -606).

## 72. The Balme front and the Pentagon (the owner's eleven-pairs brief)

The pictures are `images/640-662.jpg`. The adjustable numbers and the eleven cameras (`BP_VIEWS`, `view=bp1` to
`bp11`) are in `src/game/balmepent.ts`. The map (image 23) matched the game at about 2.95 px/m, Pent Road at x 625.

- **The Balme pool and forecourt (pairs 1 and 2).** Only the pool and its pale walking strips are down on the deck
  2.4 m below the road; the lawns either side are raised to the middle terrace's level (1.2 m down) behind low walls of
  warm irregular stone with a pale coping, not brown planes. The outer walls along the side lanes have a short flight of
  steps through them. The pool is green-grey water with ripples, a dark rim, a strip of white stones along its south
  edge and paving beyond it; five jets in a row with light spray, switchable (`BP.jets`). White tapered pots with small
  palms line both margins, pale statues stand on the lawns, and the two short white cylinders with dark tops stand at the
  south end.
- **The roundabout island (pair 11, a 2014 reference state):** the lawn raised behind a pale curb, the open drain
  outside it and a pale outer edge, as continuous rings; small clipped shrubs; no generic tree, bench or people on it.
- **New Pent (pairs 3 to 7).** The front structures are two floors under their roofs, below the four-floor wings. Each
  entrance tower now has open landing bays across its front behind white parapets and one tall arched opening at the
  top under the gable (no twin arches); the porch stands on slender pale supports with dark feet under an open arch.
  Before Block A's entrance the asphalt is gone: red-brown paths between kerbed lawn islands with a chain on posts,
  small trees, shrubs, the service strip and three AC condensers on the brick wall. Before Block C's south front,
  asphalt parking with the two mature trees in kerbed beds and slim lamps.
- **Kampala Court (pair 8):** the tall palm east of the porch and the blue curved fabric car canopy on its thin frame.
- **The entrance before Addis Ababa Court (pair 10):** the guardhouse's roof reaches out further; the grey panelled door
  with the dark louvres beside it on the face toward the way in, small tiled steps; asphalt and paving round it.
- **The administration block (pair 9)** already matched the brief's structure and is unchanged.
- **Assumptions and what would help:** the pool's south paving width and the lawns' level are read from the photos;
  the roundabout's island radius is the mapped one; pairs 3 and 6 still show the Boba kiosk because the owner placed it
  there. Still needed: the lawn height above the pool deck, the guardhouse's size, and a current photo of the roundabout.

## 73. The NSIA Road hillside to J.K.M. Hodasi Road and the low building by the Frank Torto Building

The pictures are `images/663-665.jpg`. The numbers are in `src/game/nsia.ts` (`NSIA.north`).

- **The hill's extent.** The raised planted ground beside NSIA Road ended at z -79 (the blue arrow). It now continues to
  J.K.M. Hodasi Road (the yellow arrow), as two terrace zones in `relief.ts`: east of the low building from the old
  belt's end to the end of the passage (1.35 m), then across from the Frank Torto tower to NSIA Road's cut, its top
  following a profile: 1.35 m at the passage end, rising over the planted slope to about 2.3 m, easing to 1.5 m and
  then down a 6.5 m bank to Hodasi Road's level clear of its riding width. On the west it meets the Chemistry
  Extension's terrace (1.0 m) round the Frank Torto Building.
- **The passage.** A low stone wall with a dark coping holds the hill at the passage's end, so the rise reads from the
  passage beside the tower; the passage's asphalt runs to its foot. Dense, irregular broadleaf trees and shrubs stand on
  the hill, with dry ground cover, and no generic trees.
- **NSIA Road** rises gently along this stretch (0 at the Hodasi junction, 0.3 m at z -130, 0.48 m at z -95, then the
  existing profile) in its own cut, its banks easing into the hill; the junction stays level.
- **The low building** on the passage: a deep fascia with weathering streaks, a projecting eave along the whole front
  over its openings, and (from the south) a narrow black grille door, the large panel of ventilation blocks, a convex
  mirror on its bracket, a second narrow grille door, a dark recessed door, an air conditioner, small lamps and a step
  along its foot, instead of the row of large grille panels.
- **The stone wall at the passage's end** (the owner's follow-up, `images/666-668.jpg`): the passage's asphalt runs on
  to the wall north of the low building, not grass; the wall is built like the NSIA lane wall (irregular stones, a stone
  top back over the edge, a dark coping), its face standing in front of the terrain's edge so the slope stays hidden
  behind it, across the passage's end and turning north along the low building's north end; no grass tufts on the
  paved passage; shrubs and trees set back from the wall.
- **Moved north** (the owner's next picture, `images/669.jpg`): the wall and the hill's front now stand at the far end of
  the passage, the wall touching the east end of the Chemistry Extension's north range (its red roof) at z -137.4; the
  passage is level asphalt from the lane to it along the tower; along NSIA Road the planted strip east of the low
  building runs on at 1.35 m up to the wall's line, the wall turning along it.
- **Checks.** The route tests check that the hill continues along NSIA Road at five points, that it rises over a metre
  at the passage end, that Hodasi Road is level at the junction and that NSIA Road north of the LECIAD road is smooth to
  ride across its width.
- **Estimates:** every height here (the wall at 1.35 m, the top at 2.3 m, the road's rise) is calibrated against the
  passage photo, not surveyed.

## 74. The main entrance brief: the gate, the Institute of African Studies, the Jones-Quartey Building, the Provost office

The owner's 52-page brief (images 670-754): 37 game/photo pairs, Map A for pairs 1-3 and three corrected maps of blue
arrows for pairs 4-37, four further photographs. Numbers in `src/game/entrance.ts` (`EN`); the 37 comparison cameras
`EN_VIEWS` (`?view=en1` ... `en37` in `tools/preview/halls.html`), set along the owner's arrows (the maps matched to the
game at about 7 px/m for Map 1, 5.9 for Map 2, 5 for Map 3 and 7 for Map A). Shared pieces in `enkit.ts`.

- **The main gate** (`gateprecinct.ts`, pairs 4-17): east of the La Road roundabout (Mekki Abass Circle), between
  Danquah Avenue's two one-way carriageways, a low white through-building spanning north-south: the portal of three tall
  openings between two slender columns under six dark transom grilles, a pier either side with a round vent, a broad
  hipped terracotta roof over deep eaves, lower one-storey wings on a red base; the paved drive through the portal (a
  passage: the bike rides through it). The old pillar gate over the road is gone (landmarks.ts).
- **The flag plaza** east of the gate: the long fountain basin raised in stone-faced walls with a stepped tier and jets,
  slab walks with grass seams, stepped stone-faced planters with clipped shrubs and flowers, two lines of flagpoles,
  fan palms; the satellite footprint drawn there as a building is excluded (corrections.json).
- **The black University of Ghana signs** at the plaza's east corners (pair 6 and the close photograph): polished black
  tile wall on a two-step black base, a deep tiled canopy on pale end posts, raised gold letters on both faces. Two, as
  the aerial shows two dark structures at the corners.
- **The low wings** north and south of the carriageways (pairs 10, 14-16): one storey, white over a red base, sparse
  dark windows, doors, AC units, hipped tiled roofs; the brick footway along the north wing with the blue chain
  bollards, round the bend to La Road (pair 25); the long low wing by the southern service edge with the 50 km/h sign,
  rough grass and red soil (pairs 11, 12).
- **The Institute of African Studies** (`ias.ts`, pairs 18-24): the Kwame Nkrumah Complex as a cross of two-storey
  wings; the west front's twin white gables either side of the recessed entrance with its own small gable; the
  north-west gable nearly blank with the name, small vents and one door (pair 23); the south front's central gabled
  block over the porch with the name on the balcony parapet; bays of dark windows and narrow arched recesses between
  pilasters; the building on a 0.9 m terrace, a 0.45 m middle terrace before it, stone-faced retaining walls, steps up
  the middle (relief.ts), the sculptured figures, the heavy tree by the steps; the brick parking apron, low stone walls
  and the channel drain on the west.
- **The pavilion** south of the avenue (pairs 18, 19): one storey on a stone-faced 0.75 m plinth, a broad hipped roof on
  round columns over a deep veranda, slate-blue fascia, dark lattice balustrades, a glazed core, the covered entrance
  toward the avenue, the University of Ghana sign; rough ground.
- **The white building above the bank** (pair 26): two storeys, its gable end toward the road with the College of
  Education's sign, a recessed side veranda; the bank rising 1.4 m gently over 22 m (relief.ts) in long grass.
- **The Jones-Quartey Building** (`jqb.ts`, pairs 30-37): four white levels under a thin projecting roof edge (low pale
  metal roofs behind); the south front's signed core with four slot windows, recessed louvre bays, blank end walls,
  pilotis and steps; the west side's groups of tall fins; the east frontage's blank panels between fin groups, the dark
  gallery band, the fascia with K. A. B. JONES-QUARTEY BUILDING, the colonnade with dark grilles behind and the low white
  wall; the blue kiosk under its red roof; the grass strip and kerb along the parking. The red-earth approach over the
  lawn (the mapped paths there drawn as earth: `EN.earthBox`, slower to ride), long grass round it.
- **La Road's east side**: every footprint there drawn as one-storey white wings on a red base with tiled roofs
  (pairs 27-29); the mural court among them with its short white wall and painted portrait (generic, not a likeness),
  the paved court, the blue canopy, the big trees, a bin and a bench; the **Finance Directorate** (pair 36) as low wings
  under dark roofs with its sign on pale posts at the junction, the gable-fronted end of the Archaeology wing beside it.
- **The Provost office frontage** (`southref.ts`, pairs 1-3): the central two-storey mass behind four piers, the lantern
  on its hipped roof, the College sign over the door; two-storey wings behind one-storey verandas on white columns; the
  long one-storey college wings either side; the oval forecourt: asphalt loop, kerbed oval bed with clipped hedges,
  conical shrubs, cars, the College sign on pale supports, the big tree by the road.
- **The School of Performing Arts** beside La Road: low linked one-storey wings, red lower walls, rusty brown roofs, red
  earth between. **The Efua Sutherland Drama Studio**: the covered black stage with its lip and steps, the low white
  enclosing wall with vertical slots round the paved court open to the sky, the raised pale platform, the timber-panel
  entrance.

Not resolved from the photos (each would need the photo or measurement named): the gatehouse's true depth and the
carriageways' exact line round it (an oblique aerial or a measurement of the portal); the Institute's terrace heights
(a photo along the south front at the steps); the JQB's floor heights (a measured storey or a photo with a person by the
south core); the pavilion's sign wording (a closer photo); the drama studio's stage orientation (an aerial looking
north); whether the two black signs are both "University of Ghana" (a photo of the north-east one).

## Explore: drone view

When an Explore ride arrives, at **any** destination on the map (one the guide has no entry for gets a plain
description from the map), the arrived card offers **Drone view**: the camera climbs from behind the rider and
circles 95 m out and 60 m above the destination, looking down at it (it turns more slowly with reduced motion).
**Back to street view** returns to the rider; **Done** ends the tour as before.

## Explore: leaving a destination

Riding on from a destination (choose the next place on the arrived card), the countdown starts with the rider on the
bike at the start line on the road. The chase camera is never inside a building: where the way behind the rider runs
back to the door it comes in closer and higher, and where the door opens right onto the road it looks on from one side
(`Game.ts`, checked for every destination on the map).

## Route pavements at junctions

The ridden route's raised pavements **stop wherever another road joins or crosses the route**, with a kerb face closing
each end, so no kerb runs across the mouth of a side road or the road ahead where the route turns
(`junctions.ts → walkGaps`; footpaths that meet the pavement keep it).

## Explore: ride it yourself

When an Explore ride **on a bike** arrives, at any destination, the arrived card also offers **Ride it yourself**: the route lets go of the
bike and the rider steers it anywhere a bike can go (`Game.freeRide`).

- **Pedal** (↑ / W / Space): **one tap** and the rider keeps pedalling, with no need to tap again; the Pedal button
  stays lit while pedalling.
- **Steer** by holding ◀ / ▶ (or ← → / A D) while riding; the bike turns more tightly when slow.
- **Brake** (↓ / S): **a tap** stops pedalling and brings the bike to a stop; **holding** it on once stopped rolls the
  bike **backwards** (the button reads Reverse; steering swings the bike the other way, as when walking it back);
  letting go stops it. Pedalling only ends with the brake.
- The bike slows uphill and rolls on downhill. **Every mapped road and path is rideable end to end**: only a
  stairway closes it (a tree at its edge, a wood or water area mapped across it, or a building outline it runs
  through, such as an archway or a gate canopy, doesn't). Off the roads, buildings (by their real outlines,
  `buildingNear`; their bounding boxes, used for placing props, cover the roads round a building set at an angle
  such as the Diaspora halls), trees and palms (campus, gardens and the route's own; `src/game/solids.ts`), water and
  banks too steep to ride stop it, forwards or backwards; it slides along an edge it meets at an angle. A wood's
  grass is rideable between its trees (owner: the wooded lawns round the GCB Lecture Building); every trunk stops
  the bike and it slides round it.
  The chase camera follows; it never passes into a building: when one stands between the rider and the camera (the
  controller's look, a tight spot), the camera comes in to just short of it.
- **What stops the bike** (owner: no bike passes through walls, buildings or cars): besides the map's outlines and the
  trunks, everything the models draw between knee and chest height — walls, fences, planters, parked cars, benches,
  kiosks, posts — on the roads as well as off them (`src/game/meshcollide.ts`: the drawn geometry rasterised into a
  0.35 m grid tile by tile round the rider; leaves and long grass never stop it).
- **Bike speed** (Explore and Vibe rides, and riding it yourself after one): Normal, or Faster (30% quicker), on the
  speed box and in the pause menu; remembered.
- **Finish ride** ends the ride as arriving does.

## Rendering: flicker and frame cost

- **Road and grass flicker** (owner): the grass, areas, paths, asphalt, road paint and the ridden route's road are flat
  layers on one plane that stack by polygon offset alone. Since the logarithmic depth buffer went in (general fixes,
  batch 95) the shader writes the depth itself and GL ignores polygon offset, so those layers fought each other: road
  edge lines broken up, grass through the road. `logdepth.ts` carries each material's polygon offset into the log depth
  (factor × the depth's slope across the pixel + units × one 24-bit depth step), as the hardware would; a uniform per
  material, one shader variant per kind. Low-end devices (no log depth) keep the hardware offset.
- **Frame cost**: the relief ground (about 610k triangles) was one mesh drawn every frame wherever the rider was; it is
  now cut into 80 m tiles sharing the same vertices and normals, so only the tiles in view are drawn. Campus-life props
  and verges are merged per 100 m cell instead of 400 m, so the sun's 60 m shadow box takes only the cells near the
  rider. Measured on the guest ride at the start (software renderer, high-end path): triangles drawn per frame
  1.51M → 0.36M, draw calls 356 → 273. Geometry, positions, collisions and routes are unchanged (the same triangles,
  batched differently; route lengths and the route tests unchanged).

## Fixes: the bars across the roads; the drains and kerbs opposite junctions

- **Raised bars across roads, paths and grass** (owner's report): the main entrance brief (commit `9c3cf48`) added the
  Institute of African Studies stair at the top of `relief.ts → STAIRS`. Three models picked their stair by its order in
  that list: the Balme Library steps (the first stair along z), Commonwealth Hall's stairway (`stairsOf()[0]`) and Volta
  Hall (`stairsOf()[1]`). From then on each built its stone walls, coping and paving from another stair's coordinates:
  the University Square walls and paving ran some 590 m east across the roads and lawns, Commonwealth's stairway walls
  some 460 m, and Volta's steps were built again on the Commonwealth avenue. Each now finds its own stair by its
  coordinates, as the other models already did; a route test checks the three are found. No legitimate wall moved.
- **Drains and kerbs missing opposite T-junctions** (owner's report): the open drains, verges and raised kerbs along
  the campus roads (`life.ts`) were cut wherever another road came within about 8 m, and a side road ending at the
  junction is that close to the far side too, so both sides lost their drain and kerb at every T-junction. Another
  road now cuts them only where it reaches that side of the road; the openings where roads join are kept.
- **The route's pavement** belongs to the ridden route and ends where the route ends (riding on in free ride); its ends
  now get the kerb face its gaps already had, instead of stopping open.


## Game controllers

On a computer, any controller the browser's Gamepad API reports drives the bike as the keyboard does: PS5 DualSense, PS4
DualShock, Xbox, and generic USB or Bluetooth pads (`src/gamepad.ts`, menus in `src/padmenu.ts`). The PS5 layout is
the reference for what each control does; the button names in the pause menu follow the controller in use (Cross/Circle/Square/
Triangle, A/B/X/Y, or position names such as "Bottom button" for an unknown pad).

| Control | Free ride | Races and road rides | Explore tour |
| --- | --- | --- | --- |
| Left stick | steer (dead zone, response curve, smoothing) | flick: change lane | — |
| R2 / RT | pedal, analog: a part press rides slower | pedal | — |
| L2 / LT | brake, as hard as pressed; held at a standstill, reverse after the reverse delay | brake (bikes with brakes) | — |
| Right stick | look around; eases back behind when let go | look around | look around |
| Triangle / Y | camera view: chase, far, close, fly-over (from above, following the bike) | same | same |
| Circle / B | held: back on the nearest road, facing along it | — | back in menus |
| Square / X | bell | bell | bell |
| Cross / A | confirm in menus | jump | continue / choose |
| L1 / LB | look behind while held | same | same |
| R1 / RB | — | boost | — |
| R3 | recenter the camera | same | same |
| D-pad | menus only: moves the focus between buttons; left/right change a focused slider | | |
| Create / View | big map | same | same |
| Options / Menu | pause / resume | same | same |

- **Detection**: connecting, disconnecting (also mid-ride), several controllers (the one last used drives), the
  controller already plugged in when the page opens (some browsers report it only after a button press).
- **Nothing on screen**: playing with a controller shows no controller overlay or guide; the ride's screen is the same
  as with the keyboard. The pause menu's controls line lists the controller's buttons while one is in use.
- **Disconnect or pause**: every held input is let go (steer, pedal, brake, look); the keys carry on as before.
- **Keys and controller together**: the left stick steers only while the controller is the device in use, so a key
  press is never overridden.
- **Rumble**: with the Vibration setting on, a controller in use rumbles hard on a crash and knocks briefly on hitting a
  wall, a building or a car (Chrome and Edge drive the DualSense, DualShock 4 and Xbox pads; Firefox's haptic actuators
  otherwise; untested on hardware).
- **Pause → Controller** (when a controller is connected): steering and camera sensitivity, left and right stick dead
  zones, steering smoothing, trigger dead zone, reverse delay, invert look left/right and up/down; any action can be moved to another button
  (press the action, then the new button; the two swap, so no button does two things). Saved in the browser, remaps
  per controller model. Reset restores the defaults.
- **Non-standard pads**: they use the same button numbers (most generic pads follow them); a D-pad reported as a hat
  switch (axes 6/7) still works in menus; anything else is fixed by remapping.
- **Diagnostics**: `?paddebug` in the address shows what the browser reports (buttons, axes, mapping) and what the
  game reads from it.
- **Tested** with a simulated controller in Chromium (`scripts/gamepad-test.mjs`); no physical controller was
  connected while building this, so real-hardware behaviour (per-browser button numbering, trigger ranges, Bluetooth
  reconnects) is not verified.

## The UPSA junction: UGBS Graduate Building, GOIL, IPS Road

The owner's field reference brief: field photos F01–F18, six UGBS reference photos (d5_19–d5_24), Street View frames
along IPS Road and the GOIL photos (d4). Code: `src/game/upsa.ts` (models), `src/game/upsaplan.ts` (positions shared
with the route tests). Preview views: `upsaApproach`, `upsaFacade`, `upsaPair`, `upsaJunction`, `upsaWalk`,
`upsaMedian`, `upsaGate`, `upsaGoil`, `upsaObl`, `upsaTop`.

Placement: the map puts GOIL north of IPS Road (z ≈ −955) and the UGBS Graduate Campus south of it (the building at
z ≈ −737, facing north over its car park). The Street View frames agree (heading west, GOIL on the right; the building
seen over the wall from the GOIL side).

**From the photographs**
- The Graduate Building: five storeys; the main block between two end wings that stand about 5 m forward (the mapped
  footprint); white walls with grey bands and pilasters, the windows in pairs with dark bronze frames; the central
  dark glass feature (three strips between white piers, the middle one arched) from the canopy to the eaves; the gable
  above it with "UG | BS" in blue and "University of Ghana Business School" in red; the entrance canopy on four round
  columns, steps, ramps with steel railings; the wings' steep white gables ruled in grey under red-brown roofs, their
  fronts blank panels except the inner bays, which carry open balconies on the four upper storeys; lit windows at night
  (d5_22). The paved forecourt and car park with cars (d5_20, d5_24); a white flag left of the entrance (d5_21).
- The boundary wall: white concrete, square pillars, solid panels and balustraded bays (Street View, F04).
- The gate (d5_23): two piers under a beam with chamfered ends, the UGBS letters with the crest, STEP INTO EXCELLENCE,
  gatehouses with louvred windows either side, blue-grey sliding gates, a paved road through it.
- IPS Road: a dual carriageway with a kerbed grass median (F02, F05, F06, F09; the older Street View shows the same
  median dry and red-earthed); a tan herringbone paver sidewalk along the south carriageway with a grass verge, H-frame
  concrete poles in the verge and their wires (F07, F08, F12); lattice transmission towers (Street View, F07, F10,
  F15); wooden poles along the north verge; traffic signals at the N4 junction (F01).
- GOIL: the long canopy with its orange fascia and white GOIL panels over the pumps, orange-red columns; the shop block
  with the orange-tiled LUBE BAY SERVICE box, charcoal and grey walls with grilled windows and the GO cafe front (d4_06);
  the pylon sign on its kerbed island between the way in and the way out, with the feather flag (Street View); the ATM
  row of GCB, Standard Chartered, National Investment Bank and Stanbic booths on an orange tiled plinth (d4_08); the
  yellow container shop and the lattice telecom mast beside them (Street View at the way out, F05, F06); the roadside
  workshops east of the station with grille fronts and tyres (Street View heading east).

**Approximated or assumed** (no measurement in the brief)
- Storey height 3.6 m, so the eaves are at 18.8 m and the wing gables at about 23.8 m; the wing roof pitch and the
  central gable's size are judged from the photos.
- The block behind the Graduate Building (mapped, not photographed): four storeys assumed.
- The ordering of the shop block's parts (lube bay at the west end, the GO cafe at the east) follows the one photo;
  the canopy's size and position between the forecourt lanes are fitted to the mapped lanes.
- The car parks' extents are fitted between the mapped aisles; the bays are marked where the game parks the cars.
- The gate's opening is 12 m between the piers, wider than the photo suggests (about 8–9 m): a ride turning west onto
  the service road just outside the gate otherwise runs through the west pier.
- The ATM row stands about 5 m east of the mapped ATM points (a ride to them runs out past its arrival node toward
  them); the container and mast stand beside it as in the Street View frame.
- The transmission towers' spots (x 972 and x 1290 on the UGBS side) and the H-pole and wooden-pole spacing are placed
  from the photographs, not measured. The pylon sign's price panels are drawn dark: the figures are not legible.
- The median is drawn only where the mapped carriageways leave a metre or more between them (east of about x 1060):
  west of that the two mapped roads overlap, though the photos show the median continuing to the merge.
- The north side of IPS Road has no paver sidewalk in the photographs, so none is drawn there.
- The wall runs along the UGBS landuse outline's north edge from x 985 to the gate, and 16 m east of it (d5_23).

**Map changes** (`corrections.json`): the Microsoft ML footprint `ml:fe2da66f…` in the middle of the car park is
excluded (the Street View frame over the wall and d5_20 show open parking there); heights for the Graduate Building
(5 storeys), the block behind it (4, assumed), the GOIL block (1), the workshops (1) and the small hut east of the ATMs
(1); five parking areas `owner:ugbs-graduate-parking-1..5`.

**Engine change**: past the campus-wide limit of parked cars, car parks that a modelled site paves and marks itself
still fill (`life.ts`); before, the last UGBS car park stood empty. No other car park changes (checked: the five
car parks already over the limit elsewhere stay as they were).

**Checks** (`scripts/route-tests.mjs`): the four models are built; the excluded block stays out; no pole, tower leg,
signal, canopy column, pump, pier, kiosk or mast stands on a mapped road; and none on any ride between Goil, Stanbic,
the ATM, the UGBS Graduate Campus, the UPSA Taxi Rank and Presec, in either direction.

## The 30-pair reconstruction brief: Geography, the Legon Road cutting, the roadside plots, the Jones-Quartey Building

The owner's PDF (`University_of_Ghana_30_Pair_Reconstruction_Brief_and_Claude_Prompt.pdf`): thirty game-vs-real pairs
on five annotated maps (A: pairs 1-7, B: 9-14, C: 15-22, D: 8 and 23-27, E: 28-30). The blue arrows place the views;
they are not objects in the world. Nothing in the brief is a survey: every position and size below is read from the
maps and photographs and is approximate.

**Comparison cameras** (`src/game/pairviews.ts`, preview `halls.html?view=pair01` … `pair30`): one per pair, placed
from its arrow, matched by eye to its photograph; heights are above the ground under the eye. Pair 7 is raised (15 m:
the photograph is taken from above). Pairs 16 and 21 share one real photograph: one frontage is modelled and the two
cameras follow the two arrows (the second placement is an assumption). Moved in this batch: 1, 3-6 (on the Geography
entrance, x 417), 22-26 (pair 23's old eye was inside a mapped outline; 24 nearer the stalls; 25 and 26 on the service
road), 29 (at the foot of the real stair).

### Geography (pairs 1-6; `geography.ts`, terrace and stair in `relief.ts`)
Replaces the generic blocks of the department (the front range, the corridor range, the back-court blocks, the
lecturers' office) with one building.
- **From the photographs**: the front range up a broad stair from the lawn on Danquah Avenue; the central entrance
  block a little taller under its own hipped roof; the recessed porch of three dark bays (grilled windows either side,
  the double door behind its gate in the middle) between white piers; the department's name on the band above them;
  one-storey wings, white on a red base under red tiles, dark windows and AC units; the deep veranda with dark doorways
  at the west end (pair 2); the two-flight weathered stair between laterite stone-faced planters, the worn slab apron,
  the stone-faced retaining wall with shrubs behind it; the lawn with stepping slabs, the garden lamp and the palm bed
  (pair 1); red earth and leaf litter to the west and the blue department board, only its legible lines (pair 2); the
  covered corridor (pair 3): tiled floor a step above the garden, square white posts on red feet, dark doors and high
  louvred windows, the ceiling and eave, the open garden with its low laterite edge.
- **Assumed**: the terrace rise of 1.4 m (two flights of five steps read from pairs 4-6); the entrance block 15 m wide
  and its porch 2.5 m deep; the stair 13.6 m wide with a 1 m landing; the open porch at the east end of the front range
  (seen far off down the corridor in pair 3); the back-court blocks and the lecturers' office as plain one-storey
  ranges on their mapped outlines (not photographed); tree positions.
- **Would settle it**: a frontal photo of the stair with a person on it (rise and width), the porch's depth (a photo
  from inside it), one photo of the back court.

### Pair 7: the low compound by the junction (`southref.ts`, the Efua Sutherland Drama Studio)
The raised photograph shows the drama studio's compound from the south-east. The game's generic white block in the
middle of the open court (a Microsoft ML outline, now excluded) is gone; the rear range is low and dark under a flat
roof with a thin pale edge and AC units (was a tall hipped stage house); the side wings carry rusty corrugated roofs at
low, unequal pitches, the west one behind a pale parapet; the entrance is a boxy timber-clad block under a pale slab
roof; a black water tank stands behind. The long range west of it is one storey (it showed as a two-storey mass).
*Would settle it*: a ground photo of the rear range (its height) and of the entrance block.

### The Legon Road cutting (pairs 8, 13, 14, 18, 19; `cutplan.ts`, `legoncut.ts`, `relief.ts`, `Game.ts`, `world.ts`)
Committed earlier in this batch: J.J. Rawlings Avenue's two carriageways run 7 m down between patterned retaining
walls from z −305 to 255, ramping back at both ends, under the interchange ring's two bridges; the ring's inner west
slope is stone-pitched. Riders, rivals, coins, cameras and the route layer follow the right level (the deck or the road
below, by heading); the free ride keeps its level and is not stopped on a deck by what stands on the road below. The
depth (7 m), the wall lines (sampled from the mapped carriageways and service roads) and the deck outlines are
parameters in `cutplan.ts`. *Would settle it*: the clearance under a bridge (a photo with a vehicle under it) and the
wall height at one point.

### The roadside plots (`roadside.ts`, `roadsideplan.ts`)
- **Pairs 9-12** (the planted strip west of the road north of the interchange): rough grass over red earth, the
  strip's mapped footpaths drawn as trodden red earth (the free ride is rougher on them; the paved footway along the
  road stays), the open earth clearing under a big tree (pair 12), mature trees kept off the paths, the gravel heap
  (pair 9), the 50 sign (pair 10), the pale boundary wall on the west side beside its path, open where the path to the
  houses passes (pairs 11, 12). The ranges beyond are one storey: the mapped office and the dance practical venue are
  modelled; the houses behind the wall are one storey by height correction.
- **Pairs 16, 21** (one photograph): the long one-storey red-roofed range west of the service road, a van and a car
  in front; the College of Education ranges behind it one storey (they were not in the photograph).
- **Pair 17**: the overgrown plot with its trodden path, the two lattice telecom masts and the timber pole with its
  transformer.
- **Pairs 15, 20, 22**: Legon City Mall as a glazed mass of four storeys, six at its south-west corner where its name
  stands on the roof, over its gravel forecourt (the mapped car park, edged with posts); the shops north of the
  forecourt one storey; the open market shed on the east side of the road (pair 22).
- **Pairs 23-27**: the police station compound's ranges one storey round their courts (white, red base, red tiles),
  the block-paved forecourt with white bollards along its front, red earth verges, the row of timber stalls with
  corrugated roofs and the kiosk under its blue canopy at the north-east corner (each stall a small separate frame).
- **Assumed**: the boundary wall's line (beside the mapped path, Map B); the masts' spots and heights (32 and 26 m);
  the mall's heights and the extent of its tall corner (the mapped outline is the whole complex); the stalls' count and
  spacing; the 50 sign's spot; which mapped outlines are the shed and the kiosk.
- **Would settle it**: a photo along the boundary wall; the mall's storey count from the street; one photo of the
  stall row from the road junction; a photo of the masts from the road.

### The Jones-Quartey Building (pairs 28-30; `jqb.ts`, the car park slope in `relief.ts`)
- Pair 29: the real stair at the south end of the east colonnade, nine broad warm terrazzo steps up into the covered
  colonnade (its floor now stands 1.3 m up behind its low white wall), the stone-clad wall on its west carried on along
  the colonnade, white square columns on the east, the ceiling over it. The bike stops at its foot (the stair is not
  flattened; the routes go round by the lawn and the road).
- Pair 30: the car park east of the building falls about 1.2 m to the north over some 24 m, its low end held below the
  road on the north by a low concrete edge.
- Pair 28: the tree that stood in front of the camera moved aside; the model of the front (blank signed core, louvre
  bays, kiosk, colonnade) was already as the photo shows.
- **Would settle it**: the stair's rise (a photo with a person on it) and the car park's fall (a level reading).

**Map changes** (`corrections.json`): excluded the ML outline inside the drama studio's court; one-storey heights for
the range west of the studio, the houses and ranges west of the planted strip, the College of Education and
Archaeology ranges, the shops north of the mall's forecourt.

**Checks**: route tests (every journey's and race's ground continuous, the cutting rides) pass; no new solid stands on
a mapped road or path (`tools/preview/solidroads.mjs` over the new models); route lengths unchanged; cameras outside
buildings. The comparison renders are taken in one page load with `tools/preview/multishot.mjs`.

**Known, left as is**: the cutting's east parapet north of the south bridge (z 155-205) stands up to 0.75 m inside the
mapped edge of the east slip road (J.J. Rawlings Avenue's connector); the road stays passable. Moving the wall line
there would change the cutting's geometry and wants a photo or measurement of that stretch first.

## IPS Road from the UPSA junction to the UPSA Hostel; the hostel and the Vice Chancellors Ghana Office Complex

The owner's two briefs of 12 October 2026: `LEGONRUSH_UPSA_Junction_to_Hostel_Road_Focused_Brief.docx` (the road,
R01-R34) and `LEGONRUSH_IPS_Road_Site_Reconstruction_Brief_1.docx` (the sites, IMG-01 to IMG-16). The ZIP reference pack
the briefs mention was not supplied; the images embedded in the two documents were used. Code: `src/game/ipsplan.ts`
(positions), `src/game/ipsroad.ts` (the corridor), `src/game/upsahostel.ts` (the hostel and the VCG office),
`src/game/ipsviews.ts` (comparison cameras `ips01`-`ips14`). Nothing here is surveyed.

**Where things are, from the project data**
- IPS Road is the mapped road osm:way/515974988 (class 1); the parallel road 13-18 m south of it is osm:way/1499858648
  (OSM "unclassified"): near the junction the earlier field photos show the two as a dual carriageway with a grass
  median (upsa.ts); further east the photos (IMG-04, IMG-14, R10-R12) show the strip between them as kerbed red earth
  with trees and parked cars, and the southern road as the frontage road of the compounds.
- The north side of the corridor is the Presbyterian Boys' Senior High School (OSM landuse "Presbyterian Boys' Senior
  High School", x 998-2158); its arched gate is where the mapped school road (x 1739) leaves IPS Road. The sign by the
  wall reads PRESBYTERIAN CHURCH OF GHANA / PRESBYTERIAN WORSHIP CENTRE / PWC, PRESEC - LEGON (IMG-01).
- UPSA Hostel: the Overture place "UPSA Hostel" (x 1736, z -798) lies in osm:way/1217291474, whose outline matches the
  photographed front exactly (end wings forward, the middle set back, a small central bay). osm:way/394252035 to the
  east is modelled as the hostel's second block (IMG-03, R10, R11). The red-roofed one-storey building at the gate is
  osm:way/1217291473 (Overture places "Chef Wagon", "Empomart" nearby).
- VCG office: osm:way/1217291476, west of the hostel ("No. 6 IPS Road, adjacent to UPSA Hostel", vcg.edu.gh; the
  photos put it west of the hostel). Its stepped side faces north to the road: the mapped outline steps out twice there
  (the forward volume, then the canopy's footprint).

**From the photographs**
- North sidewalk: tan pavers laid herringbone between a road kerb and an outer kerb (R13-R19), from x 1205 to past the
  hostel, open at the school's gate road; a weedy verge with red earth, wooden distribution poles with three wires,
  streetlights with a curved arm over the road (R05-R07, R16).
- The school's boundary: the old grey block wall over scrub (R05-R07), then the white wall with blue pilasters, coping
  and base, and the tall green chain-link fence of the sports ground behind it (R08, R09, IMG-15); the arched gate
  between two white gatehouses with blue bases, blue metal pyramid roofs, brown windows and the school's crest, the
  iron gates folded open (IMG-02); the open drain with concrete lips at the gate road's mouth, passing under the road
  (IMG-02, IMG-16).
- The strip: kerbed red earth with dry grass, small spreading trees, a big mature tree by the hostel, a few cars.
- The transmission line continues from the junction's tower (x 1290) to towers at x 1608 and 1893 (R14-R16, IMG-14).
- The hostel: cream, ten storeys (IMG-04, R29); the wings' fronts in louvre strips, balcony recesses and pairs of small
  windows; the central bay a storey taller with larger blue-glazed windows, UPSA HOSTEL, the fanlight in its gable, the
  entrance canopy; low red-brown hipped roofs; the white wall-and-railing fence and gate, the grey-paved forecourt.
- The VCG office: white, four storeys, flat roof; the forward volume with its row of windows over the large dark window;
  the layered canopy on two square columns over recessed dark glazing; the blue sign VICE CHANCELLORS GHANA / OFFICE
  COMPLEX on the top storey; the compound wall with its zig-zag top between square pillars and the black railing; the
  black gate leaves swung open; the red-roofed gatehouse; brick-paved forecourt and side drive (IMG-05 to IMG-09, R28).

**Assumed** (no photograph or data for it)
- The hostel's courtyard and its galleries (the outline is solid in OSM; a 56 m deep block of rooms is taken to be a
  ring round a courtyard; no courtyard photo came with these briefs) and its back; the east block's floor count (nine)
  and its colour; storey heights (2.9 m hostel, 3.6 m office).
- Wall lines (9.4 m north of IPS Road's centre; the compounds' front walls at z -852.6 and -848.6, matched to the mapped
  drives and the shop's front); the VCG compound's side walls; where the old grey wall becomes the white one (x 1555);
  the mesh fence's extent; tower, pole and streetlight spacing; the strip's trees.
- The large outline osm:way/1217291472 (x 1474-1553, the same OSM mapping batch as the hostel) is left as the generic
  block: no photograph shows it.

**Engine changes**: `ipsplan.ownsEdges` marks the edges a model draws itself along IPS Road (the junction's median and
south sidewalk from upsa.ts, this corridor's sidewalk, verge and strip). There the campus's generic verge-and-drain
strips (`life.ts`) and a ridden route's generic pavements, trees and lamps (`world.ts`) are not drawn: before, a ridden
route laid its own pavement over the median and sidewalk (the brief's R31-R34). The route keeps its road and markings.
The compounds' paved courts are listed in `PAVED_BOXES` (`science.ts` offAsphalt): their mapped drives are paved there,
not asphalt. `upsa.ts` exports its helpers (pavers, kerbed strips, wires, `latticeTower`) for reuse.

**Checks** (`scripts/route-tests.mjs`): the three models are built; no pole, lamp, tower leg, gate pier or post stands on
a mapped road or on the ride along IPS Road in either direction; the school's, the VCG's and the hostel's gates clear
their roads. `tools/preview/solidroads.mjs` found no new solid on a road or path in the corridor except the VCG
office's own mapped outline, which overlaps its side drive (osm:way/754146795) by 0.24 m in the map data.

**Would settle it**: a photo of the hostel's courtyard and of its back; the hostel's gate from the road side at close
range; a photo along the school's wall where the grey wall meets the white one; the VCG compound's side and back walls.

## The owner's three pictures (the JQB lane, the overhead crossing) and the 10-pair brief

The owner's message of 12 October 2026: three game screenshots with circled faults, then
`Campus_reconstruction_10_pairs_Claude_brief_1.pdf` (ten game/Street View pairs, a plan of the overhead crossing with
purple, yellow and blue arrows). Comparison cameras `ten01`-`ten10` (`src/game/tenviews.ts`, `halls.html?view=ten01`).
New models in `src/game/tenpairs.ts`; changes in `jqb.ts`, `roadside.ts`, `cutplan.ts`, `legoncut.ts`,
`gateprecinct.ts`; map changes in `corrections.json`. Nothing here is surveyed.

**The three pictures**
- *The mural court by the Archaeology lane* (picture 1): the court's short white wall with the portrait now runs north
  to the south wall of the wing beside it (it stopped 2.8 m short).
- *The overhead crossing* (picture 2): each bridge deck carried its parapet and railing along the whole of a long edge,
  so where an edge ran on over the ground it lay across the slip road north of the ring (osm R713 at z 92) and the east
  service road south of it (R717 at z 155). The parapet and railing now stand only along the stretch over the drop, a
  little past the wall line onto its parapet.
- *The Finance sign* (picture 3): it stood inside La Road's mapped width (x 634.6). It now stands in the grass between the
  Archaeology wing and the Finance range (x 640.7, z -47.3), facing the road; a route test checks its posts are off the
  road.

**The 10 pairs**
- *Pairs 1, 2, GCB Bank near Ernest Chemist* (osm:way/603522794): one low bank, the same model from both cameras. The road
  front: silver-white panel cladding with joints, a broad blue band, blue vertical zones at the ends, the dark recessed
  central entrance, the square GCB emblem block over it, three shallow steps, the ramp with its railing on the right.
  The south side: the deep vertical blue-glass recess in its frame, the projecting canopy on two posts over the stairs,
  the short ramp, the GCB sign on the roof edge at the south-west corner, three flags on slender poles, planted islands
  with low shrubs on the paved approach. Before the road front: rough pale-brown earth with sparse weeds, the low stained
  concrete wall (gaps at the steps and the ramp) with a narrow drain, three mature trees, three timber poles with their
  wires, a dark parked car. *Not modelled*: the red roofs and scaffolded framework behind the bank (no mapped outline
  there; they would need a position).
- *Pair 3, the parcel behind the bank*: the five outlines in it are excluded (two Google ML outlines and three OSM
  ways, which had been made one storey in the 30-pair batch); the ground is red-brown earth with tall grass, paler
  worn patches, low mounds, stones and broken blocks, banana plants and trees; the small pale shed well back on its
  mapped outline (one storey, a low gable roof with a dark edge, few openings). The mall shows beyond on the left.
- *Pair 4, GMI Motors and Legon City Mall*: the two outlines north of the forecourt are one low white showroom (turned
  onto their skewed outlines) with large dark display windows and the red GMI MOTORS fascia; the building west of them
  is one storey (heights). The mall is no longer one all-glass box: its rectangles alternate dark blue glazing with light
  grey panelled blocks with dark window bands and shopfronts, at stepped heights (3 to 6 storeys); the name stays on the
  tall corner. The forecourt's red-brown posts carry a chain-link mesh (a light fence).
- *Pair 5, the strip south of the bank*: the open market shed with its row of painted panels is now a vehicle shelter
  (a long shallow sheet roof on slender posts, cars under it); before it, beyond the lane, the small blue kiosk, low
  masonry partitions (part broken), a patch of broken pavers, the blue tarp over a simple produce stall, a big tree, a
  pole, stones and weeds on red earth.
- *Pair 6, against the police station's north wall*: the three generic houses there are excluded (one carried the place
  name Pilosoft Services); seven small separate kiosks and stalls stand against the range's north wall: different
  widths and heights, timber and painted sheet fronts, low corrugated roofs falling to the front over short awnings,
  counters with produce, rough thresholds and broken steps, gaps between them; compacted red earth before them; a white
  wall with a steel gate farther back; two trees.
- *Pair 7, the low frontage west of the gate* (osm:way/452701539, Ghana Dance Ensemble): the generic two-storey block is
  now a low white range on a red-brown base under weathered red tiles, with the deep dark passage behind square piers
  and grilles in the middle of its east front; at its north end the taller two-storey gable-ended block with the round
  high vent in its gable and glazed notice boards on its front. Before it: worn grass and earth, the low stone-edged
  bed, a conical shrub, the gravel heap, broad trees and two fan palms. *Assumed*: which mapped building the photograph
  shows (the one the game's camera centred on, approached from the police station's side along Danquah Avenue); the tall
  block's depth (the north 7.7 m of the outline).
- *Pair 8, the Jones-Quartey parking*: the large outline north of the parking (osm:way/744988918) is an unfinished
  concrete frame: exposed columns on a 6 m grid, four slab levels with bare beams and edges, open bays, bars standing out
  of the top columns, an unrendered blockwork stair core; no walls, glazing or roof. The light carport on the court's east
  side: thin posts along its edge, a shallow sheet roof cantilevered over the bays, cars under it. *Assumed*: the frame's
  level count (four, from the photograph) on the whole of the outline.
- *Pair 9, the overhead crossing*: the lowered road now runs on south of the ring to where the east carriageway meets the
  east service road (the cutting's south end moved from z 255 to z 405; its deep run to z 315; the wall lines sampled
  from the mapped roads every 5 m as before); the north approach is unchanged (the purple arrow). The east wall stands at
  its least offset from the carriageway there, as it does north of z 270 (the service road runs against it). On the
  ring's west side: the island's stone edge along the top of its slope, four black-and-yellow chevron boards toward the
  traffic coming off Danquah Avenue, the blue keep-right sign at its nose. The plaza's two planters that stood on the ring
  road and the south carriageway are gone and the corner one shortened (gateprecinct.ts).
- *Pair 10, the Finance Directorate and Students Accounts Office* (the mapped range and block east of La Road): one
  storey, white over a red lower wall, aged dark grey-brown tiled gable roofs (the block's ridge running into the range's
  roof, the ridges level), white gables with small vents; the road face in an uneven rhythm of barred windows and
  recessed doors with a step, an AC condenser; the range's road wall kept 1.3 m back from the outline, which reached La
  Road's edge. The sign on two posts with the crest, UNIVERSITY OF GHANA, FINANCE DIRECTORATE, STUDENTS ACCOUNTS OFFICE
  (the small lines below left as unreadable bands); the corroded rectangular gate frame between the range and the
  Archaeology wing; long grass; a broad tree across the road.

**Checks**: route tests (new: the Finance sign's posts off every road; no building left in the parcel or the stall yard;
the cutting's south approach to z 405 at full depth to z 300); every ride's ground continuous; route lengths unchanged;
cameras outside buildings; `solidroads.mjs` over the new models: nothing new on a road (the Archaeology wing's west wall
solids at the edge of La Road and a cutting parapet post at the north bridge, both earlier, remain).

**Would settle it**: the GCB Bank's depth and the buildings behind it (an aerial or a photo from the north); the mall's
storey counts per block (a photo from the north-east); the unfinished frame's true outline and level count (a photo from
its west); the Dance Ensemble block's north end (a photo from the north); where the cutting's south ramp really meets the
ground (a photo along the road at the trotro station).

## The Agriculture side: the 16-pair brief (east block, Child Study Centre, Biotechnology Centre, WACCI, Akuafo Road)

The owner's `University_of_Ghana_16_Pair_Annotated_Reconstruction_Brief_and_Claude_Prompt.pdf`: sixteen game/real pairs
(pair 4 with the owner's corrected game image), the numbered-arrow aerial, a drone view of the WACCI building, the
unannotated area map and the game map. The aerial is registered to the game by E.A. Boateng Road (x 510), Onyaa Road
(z 264) and Akuafo Road (x 235). Cameras `ag01`-`ag16` (`src/game/agviews.ts`); models in `src/game/agric.ts`; owned
road edges in `src/game/agplan.ts` (read by `ipsplan.ownsEdges`). Nothing here is surveyed.

- *Pairs 1-4, the long east block* (osm:way/492099506, east of E.A. Boateng Road): one connected two-level building
  (two storeys of 3.6 m) under red corrugated metal roofs: a long hip over the middle and cross-gables over both ends at
  the same ridge, white gables, a deep black fascia over 1.2 m eaves. The long sides: an upper storey of larger and
  smaller dark windows (some in pairs) and high horizontal vents in an uneven sequence; a lower storey of doors, grilled
  windows, dark recessed open bays between white piers and blank wall. The north side: asphalt from E.A. Boateng Road to
  the east hardstand (drawn as a surface, not a routed road; it is not in the map data), a narrow concrete edge, the long
  weathered corrugated hoarding on timber posts close to the road. The east end: two dark entrance recesses, the raised
  landing with steps and black rails, varied upper glazing and narrow vents; the worn hardstand with dusty margins and
  weeds; the two small outlines on it as the low shelter under a hipped corrugated roof and the sheet-metal enclosure; the
  temporary panels; the large branching tree; a white pickup (a prop). *Assumed*: the cross-gables' extent (17 m), the
  window sequence, the hoarding's line and gaps.
- *Pair 5, the Child Study Centre* (osm:way/300288059): the two-storey block is now low: a one-storey gable-fronted
  building facing the yard with colour-blocked lower walls (red, blue, yellow, green), a door and windows, and a connected
  lower rear range; the yard north of it to Onyaa Road is pale gravel curving round a bare planted island with red and
  green edging, a row of painted tyres, a small slide, a swing frame and a blue canopy; the green weld-mesh fence and the
  tall two-leaf mesh gate (closed) on a concrete threshold. *Assumed*: the yard's extent (from the outline to the road).
- *Pair 6, Agriculture Economics and Agribusiness* (osm:way/300288064): one storey; a 3 m covered veranda along its west
  side under the hipped roof, square white columns with red-brown feet, the tiled floor a step up, black shuttered
  windows and doors, a plaque, potted plants, a bench; short steps at the north end; the raised planted bed with its low
  laterite edge and a narrow paved strip before it.
- *Pairs 7-9, the Biotechnology Centre* (osm:way/300288065, L-shaped): one two-level building: the west wing gabled to
  the north (the tall mostly blank white gable with a dark bargeboard edge, the sign BIOTECHNOLOGY CENTRE / UNIVERSITY OF
  GHANA / LEGON with the crest, two wall-mounted AC units, the barred entrance recess and its step, the red-brown base)
  and the long south wing under tiles; an upper dark window band and lower barred windows and entrances on the long
  sides. Before the gable: the narrow central path, the clipped hedge either side, four pruned trees in wells, short
  turf; the paved parking toward the road with cars and a white bus (props).
- *Pairs 10-13, the West Africa Centre for Crop Improvement building* (osm:way/1138519163): five masses on the mapped
  outline (the west wing and the east block four levels, the west projection and the east end three) under their own
  hipped terracotta roofs, on a raised base. The front (from the road the east block is on the left): stacked white
  patterned screens over the windows of the east block, the central recess with narrow dark glazing and canopy lines, the
  tall three-level glazed entrance in the west wing between deep white piers with mullions, doors and steps. The rear:
  the projecting wing's four tiers of windows with metal balcony rails. The black tanks on a pale plinth at the south-east;
  the low service wing on the small outline at the front corner; the pale interlocking-paver forecourt to Onyaa Road with
  bay lines, three curbed planted islands, a light carport on the east side and cars; the big tree at the forecourt's
  west side; behind, imperfect grass with reddish patches, utility covers and a narrow path along the west side. The
  machine-detected outline in the forecourt is excluded and the two buildings east of it are one storey (corrections).
  *Assumed*: which mass carries which front element (from the outline's recesses and the photographs), the levels of the
  west projection and the east end (three).
- *Pair 14, the low roadside group* (the three outlines east of Akuafo Road, west of WACCI): one storey, white on red
  bases, weathered tiled gables toward the road, two roof heights on the first (the lower gabled wing with its grilled
  front and dark door), the breeze-block wall section, a hedge; the worn asphalt apron to the road with the huge tree in
  its curbed island and a small sign.
- *Pairs 15, 16, Akuafo Road*: on its west side the shallow open drain at the asphalt's edge and the broad brick footway
  (z 141-262); at the Onyaa Road junction the curved brick pavement and kerb round the south-east corner; the green sheet
  fence round the plot north-east of the junction (a gap at x 262-268), slim poles and a round sign; Soil Science (osm:way/394125202)
  as low gabled and hipped wings on red bases set back behind the trees, a porch, the freestanding board (its lines
  unreadable); four big trunks with roots and wide crowns, earth under them.

**Checks**: route tests (new: the seven models are built, nothing left in the WACCI forecourt, no ride routed through
the Child Study Centre's yard); every ride's ground continuous; route lengths unchanged; cameras outside buildings;
`solidroads.mjs`: nothing on a road or path in the area.

**Would settle it**: the east block's north road (is it mapped as a road?) and its roof plan (a straight-down aerial);
the WACCI building's level heights and the west projection (a photo from the west); the Child Study Centre yard's extent
and the rear range (a photo from inside the gate); the Biotechnology Centre's south wing (a photo from the south); the
green fence's line round the corner plot.

## The owner's four pictures (GCB Bank, the overhead crossing) and the Legon City Mall / GM Motors brief

**The four pictures**
- *The building beside GCB Bank near Ernest Chemist* (circled for deletion): the machine-detected outline between
  J.J. Rawlings Avenue's east carriageway and the service road by the Legon Second bus stop
  (ml:8ed8c673-8118-417f-8347-83a82143475c) is excluded; the bus stop stays.
- *The GCB sign*: the tall sign on its two legs at the bank's north-west corner by the road: the white head with the
  emblem (on both faces), the yellow and orange lower panel with "Legon Branch" and "24/7 ATM Banking" (the smaller lines
  left unreadable); cars nosed in on the red earth either side (`tenpairs.ts`).
- *The island at the overhead crossing* (pictures 3, 4): the ring's west slope now begins 3.4 m inside its edge
  (`CUT.ring.shelf`, cutplan.ts); the level semicircle in front of it is heaped stone gravel between the ring's kerb and a
  low concrete parapet at the top of the slope, the chevron boards and the keep-right sign on it.
- *The space between the overhead and the gate* (the red arrows): the ring road's west arc was one narrow lane between the
  island and the plaza. The plaza's east end is pulled back to x 745.5 (`EN.plaza`), and the asphalt runs out to it with
  a kerb, a broad two-lane curve; the plaza's corner palm is moved off Danquah Avenue's south carriageway. The edge
  strips there are the model's own (agplan.ts).

**The Legon City Mall and GM Motors brief** (`Legon_City_Mall_GM_Motors_correction_brief.pdf`; cameras `mall1`,
`mall3`, `mall5`, `mall6` in tenviews.ts)
- *The mall* (roadside.ts): seen from its forecourt, the lighter open left (north) wing: a pale frame of columns and
  slab edges with the glazing set back and the passage below; the darker central block, dark grey cladding with large
  window bands in an uneven rhythm, five levels; the glazed right (south) volume; the parts behind lower and grey. The
  ground floor toward the forecourt: shop glazing, a canopy and coloured sign bands (no invented shop names). The name
  LEGON CITY with the three coloured stars and MALL stands free on the central block's roof at its front edge. The
  forecourt is interlocking pavers with parking bays, cars, lamp poles; the chain-link fence on its red-brown posts stays.
- *GMI Motors* is now the low signed frontage on the circled building (osm:way/665125606, the blue arrows): flat-roofed,
  the long pale sign fascia with red trim and the red lettering, a front of dark glazing between slender mullions; a
  gravelly forecourt to the open lot with modest posts and a mesh rail, a few cars. The two outlines east of it, farther
  back toward the mall, where the GMI model stood before, are the separate plain low structure of the green arrow: pale
  walls, a few dark openings, a shallow roof, no sign. The open lot south of GMI is gravel and earth, not lawn.
- *The roadside cluster* (images 3, 4) on the south side of the lane to the mall (osm R593) at x 792-811: a kerb, the
  compacted vehicle strip, a raised concrete slab, the shelter (a shallow sheet roof on slender posts, mesh and grille
  sides, stacked tyres, a drum and a box under it), the tall advertising panel on two posts, a small sign panel, dense
  trees and banana plants behind.

*Assumed*: which mall rectangles form the three parts (by their place in the mapped outline) and their levels (4, 5, 5);
the sign's width (30 m); the cluster's exact spot along the lane (image 3's arrow); the low structure's height.
*Would settle it*: a photo of the mall from the north-west (the left wing's depth); a photo along the lane past the
cluster.

## The Commonwealth Hall and Great Hall brief (pairs 1-7, S1-S8, M1)

(`Commonwealth_Great_Hall_reconstruction_brief.pdf`; cameras `cw1` ... `cw7`, `cwAxis`, `cwGreat`, `cwStairs` in
cwviews.ts, preview halls.html.)

**The hill's levels** (relief.ts `CW_LEVELS`, S8 and its stair diagram): four flights with level walks between them.
The first is the entrance's broad steps (8, weathered red) from the asphalt parking up to the front terrace (10.5 m,
1.5 m above the drive) under the whole front row; the front row, the entrance block and the first court stand on it.
The other three climb the walk at the long crossbars (to 11.7 m), at the second crossbars (12.9 m) and at the stubs
beyond (14.2 m, to the end building). Each level is flat (terrace and hollow set against the hill); across the courts
at each flight's foot a stone retaining wall with a coping, open where the walk climbs, stone cheeks either side of the
steps; the walk's slabs lie on each level. The bike meets the walls as walls and climbs the steps as steps.

**The approach** (pair 2): the stairway from the gate houses is uneven now (`plan`): four street steps, a level landing
8.4 m long through the gateway, then flights of 9, 9, 8, 8, 7, 7 and 6 steps with level walks of 11 to 9.5 m between
them, the flights shorter higher up. The gateway: white piers either side of the opening at the road and at the back of
the landing, short white walls joining them; the gate houses' aged gable roofs with their ends to the road and a
stone-faced plinth. Palms beside each landing above the gateway, the pools on the second landing.

**The front** (pairs 1, 3, 4): one entrance asset: the chimney and lantern are gone; a broad weathered red-tile hip roof
with 1.7 m eaves over a dark soffit, the patterned ventilation band under them across the front; the doorway set back
between strong white piers that rise through both floors, the dark grilled doors with the name over them, the upper
floor's dark glazing in the recess. Short joining blocks close the gaps between the entrance block and the wings (the
aerial's continuous front). The forecourt's orange slab and painted circle are gone: asphalt parking from the foot of the
steps to the drive with bay lines and a few cars (props, the walk to the steps left free), aged stone paving from the
drive to the top of the stairway; one crest on its stone plinth front-left of the steps; palms at the parking's ends; the
front terrace's stone-faced edge with low planting at its foot. *The pharmacy* is the south lane's gabled end
(Joepharma, pair 4): deep red-tile eaves 1.5 m past the gable over a dark underside, three small high vents in the
gable, narrow dark louvred shutters on both floors, the entrance bay standing forward with its glazed doors and the
PHARMACY sign, its walls below the terrace's level faced in stone, steps down to the parking apron between two tiers of
stone-faced planting beds with shrubs and a small palm; the lower one-storey wing beside it to the south.

**The courts** (S7, S8): Bacchus (a bronze figure, one arm raised, on a tapered stone plinth) in the first court beside
the walk, between the palms, facing back east toward the rear of the entrance block.

**The Great Hall** (greathall.ts; S3 to S6, O2, O3): the auditorium under a broad weathered red-tile hip roof with deep
eaves, white walls with a row of high dark ventilation windows; before it the two-storey entrance block, a portico of
seven strong white piers with dark doors between them and the patterned band over them; behind it, between the two road
loops, the semicircular projection (a curved wall ringed by columns under a curved roof). The hall stands on a
stone-faced plinth; before the portico the raised entrance terrace (1.2 m, relief.ts), stone-faced, with shallow curved
steps down its middle and a ramp leaving its north end. The side wings are the mapped L-shaped outlines, one storey, dark
shutters and AC units, joined to the hall by short links; with the hall they wrap the forecourt (paving, planted beds,
palms). Between the wings' east ends the formal garden: hedged beds round a paved cross and a round bed, between the
paired small buildings. The clock tower now stands on its own mapped base south of the hall (landmarks.ts), not inside
it. The two machine-detected outlines on the forecourt's axis are excluded (S5 shows open paving there).

**J.K.M. Hodasi Road's bend** (hodasi.ts; pairs 5-7; M1 places them on this road west of the Volta Hall Annex, not on
Commonwealth's drive): the dashed centre line on the bend (world.ts), a concrete kerb along both edges, the narrow brick
footway on the west side with two utility covers and a few slender poles, tall mixed grass and scrub on darker earth on
the east verge, mature broadleaf trees close along both sides with their crowns over the road, and a deeper screen with
an understorey to the east so that the Annex and its water tower show only through gaps. The generic verges and drains
stay out there (agplan.ts `HODASI`). The road's line is the mapped one (the fork with the side road is real and kept).

*Assumed*: every rise and level (10.5, 11.7, 12.9, 14.2 m; the Great Hall's terrace 1.2 m), the stair counts and landing
lengths, the flights' exact places along the walk, the statue's spot on the blue mark, the tower's height, the
projection's radius and the wings' height. *Would settle it*: a photo along the walk at each flight (the step count and
wall height); a side photo of the Great Hall's curved projection; a measured height of the tower.

## The finish-line and destination banners; the Crop Improvement and Agriculture Precinct brief

**Banners** (`UG_Campus_Racing_and_Destination_Banners_Claude_Brief.pdf`; banners.ts, world.ts `buildRouteLayer`): the
dark posts and beam at the end of every ride are gone. The route layer now knows what its finish is
(`finishKind`, set in Game.ts from the route's kind): an explore ride ends under a destination banner (white columns on
stone-clad feet outside the kerbs, a white board with navy ends and a gold rule carrying that destination's own name from
the game data, wrapped to two lines when long, readable from both directions, its underside 5 m above the road); a race
ends under the FINISH banner (two light square truss towers with red-and-white chequered flags, a truss across the top,
the FINISH board between chequered ends, the chequered line on the road). The race's completion is the existing finish
check at the same line (`d >= route.length`, once); no crest is drawn (the project has none, and none is invented). The
start keeps its white gate unchanged (world.ts `gate`). The posts stand outside the riding lanes and are not solid.
`.preview/finishshot.mjs` shoots the rider's view of both.

**Crop Improvement and Agriculture Precinct** (`Crop_Improvement_and_Agriculture_Precinct_reconstruction_brief.pdf`;
agprecinct.ts; cameras `crop1`, `crop2`, `crop4`, `crop6`, `crop7`, `crop9` in cropviews.ts). The generic classroom
boxes are replaced by the low white family (white render on a red lower band, weathered red tile hips and gables with
deep eaves, smaller dark windows, louvres and doors varying by face), each mass on its mapped outline with its own
storey count:
- *The department group north of Onyaa Road* (pictures 6 to 9; the old generic outlines 165, 1689, 1696, 1770-1772,
  1764 Agric Science Extension, 1683, 1598, 1599, 202, 1699, 1794, 1797): low front wings with gable ends to the road;
  the two long middle buildings one storey at their ends and two in their middle lengths; the U of wings round a court;
  the Agric Science Extension under a broad deep roof; the rear row in two lengths with a covered passage between; the
  far east rows one and two storeys. Patchy grass, bare earth under the trees and in the courts (not on the verges),
  narrow concrete walks through the courts, mature trees of varied crowns. The College of Agric and Consumer Science,
  Soil Science and Agriculture Economics keep their models.
- *East of the WACCI forecourt* (pictures 2 to 5; the game's camera shows these beyond the forecourt's carport, the
  brief's "west side"): the low hipped block, the compact annex behind it under a broad aged hip with sparse openings
  and a wall unit, its small gabled neighbour, the gabled wing farther east with a shaded veranda (the detached
  two-storey box, now one storey); a narrow path from the yard to the black tanks on their plinth (agric.ts).
- *By the Child Study Centre* (picture 1): the two-storey block brought down to one storey in the family, and the two
  neighbouring generic outlines with it.

*Assumed*: the storey counts per mass, the split points of the long buildings, the angled outline 202 squared to its
main axis, which side of WACCI pictures 2 and 3 show (from the game screenshot's carport). *Would settle it*: the
missing picture 10 (the real top layout), for the courts' exact spacing.

## The UPSA Hostel to the UPSA academic core: IPS Road, the Main Gate and the campus

The owner's brief *LEGONRUSH UPSA Hostel to Campus*: master prompt, reconstruction pack 2 (Street View frames
RW01–RW15, register, online sources), Brief 1 (hostel to campus) and Brief 2 (the GOIL/UGBS junction, rebuilt
earlier). The evidence audit came first: `docs/upsa-hostel-to-school/evidence-audit.md` holds the inventory, the
source hierarchy, the route with provenance and confidence, the conflicts and the mismatch list. The ride's frames and
the before/after views are in the same folder (`ride.jpg`, `before-after.jpg`).

**A separate UPSA extension of the map.** UPSA lay beyond the study extent: IPS Road stopped at x 1963.6, and the
roundabout and everything east of it was missing.
- `scripts/geography/fetch_upsa_extension.py` writes `data/geography/sources/upsa-extension.geojson`: OpenStreetMap
  via Overture 2026-09-23.1, ids kept, box x 1950–2559, z −1376..−635. Machine-learned footprints are kept only
  inside UPSA's own outline, osm:way/309660062.
- `build-master.mjs` adds its roads, buildings and areas under `osm-via-overture-upsa`, skipping any id already in
  the map. Vertices within 0.3 m of a mapped road's vertex snap to it. Booktrust Street, cut at the old extent's
  edge, takes its whole line.
- No existing feature moved or changed id. The only geometry change is Booktrust Street's longer line.
- The divided IPS Road and the roundabout are one-way for riders, in their mapped direction: counter-clockwise, the
  south carriageway eastbound, the north one westbound. This is a flag only these extension roads carry, so every
  Legon route and race rides as before.
- Places "UPSA Hostel" and "University of Professional Studies, Accra (UPSA)" (registry landmarks with access
  entries).
- `ipsplan.ts` now picks IPS Road and the frontage road by mid-road vertices. Its old end-point lookup would have
  caught a piece of the new roundabout.

**The ride** (1004 m; `.preview/upsaride.mjs` rides it in the game):
1. out of the hostel's central bay across its forecourt;
2. east on IPS Road;
3. counter-clockwise round the roundabout at Trinity Avenue;
4. east on the south carriageway;
5. left through the Main Gate;
6. north on the campus road past AB Block and the car parks, then east along the quadrangle's south side and north
   to the drive;
7. it ends at the west front of the block east of the central quadrangle (osm:relation/13514869).

**Models** (upsacampus.ts; numbers in upsacampusplan.ts; cameras `upsa1` … `upsa12` in upsacviews.ts):
- *On from the hostel corridor* (RW01–RW08): the tan paver sidewalk, the weedy verge, the poles and streetlights;
  the kerbed red-earth strip; tyre stacks and a plank lean-to on the red earth by the tower; scrub and trees in the
  fork.
- *The blue panel hoarding* along the north side from PRESEC's white wall to the campus wall (RW06, RW08, RW09).
- *The roundabout's island* (RW09): kerbed black and white; red earth and grass; a spreading tree; a vendor's table
  under an umbrella; a billboard frame with a plain panel (no advertisement copied).
- *The divided road* (RW10, RW11): the kerbed grass median; the south verge's red earth with its open concrete drain
  (left out where the mapped lay-bys run); the wooden poles and wires; the next lattice tower at x 2176, west of the
  shop row's lay-by. On the north verge: scrub, bushes, streetlights and the "UPS" bus stop shelter.
- *The campus wall* on its mapped lines either side of the gate, open where drives pass.
- *The Main Gate* on the mapped canopy outline (osm:way/1009392399):
  - a blue-and-white canopy on white columns, its fascia reading UNIVERSITY OF PROFESSIONAL STUDIES, ACCRA both
    ways, a UPSA panel over the front;
  - a gatehouse in each outer bay;
  - lift barriers, raised, 12 m clear between them over the 4 m entrance road.
- *The Abednego F. O. Amartey Towers* (name read in RW10/RW11; two blocks of ten levels joined by a bridge):
  - white with blue-glazed windows and the east block's blue curtain strip, the name on the roof;
  - on the satellite-detected footprint behind the Senior Members' Club House, which OSM still maps as a pitch.
- *Prestige Hostel* (RW14): four storeys, its name, the grey-paved forecourt and chained bollards.
- *The shop row and the Trinity Baptist Church complex*: two storeys (registry heights).
- *At the core*: an entrance canopy on four columns between the mapped service lane and the wall, the paved apron,
  and trees round the quadrangle.

**Tests:** `npm run test:routes` adds the UPSA checks:
- both places exist where mapped;
- the ride is about 1000 m and continuous;
- it passes the roundabout's south side, the eastbound carriageway, the Main Gate, the campus road and the
  quadrangle, in that order, and never the north carriageway;
- it finishes at the core's drive;
- no modelled solid stands on the ride or on a road;
- the gate clears its road;
- the canopy and the towers' outlines are modelled;
- one-way roads exist only in the extension.

`.preview/solidroads.mjs` finds no solid on a road in the area.

*Assumed*:
- The walls' colours (UPSA's blue and white).
- The gate's depth, its gatehouses and its barriers: the gate photographs (Wikimedia Commons, UPSA's posts) could
  not be opened from this environment, so the gate follows the written descriptions.
- The extent of the hoarding.
- The tower and pole spots.
- The storeys of the campus blocks (generic heights).
- The towers' position (a satellite footprint).
- Which named building the end block is: the place is named for the university, not for a building.

Domil Heights (RW15) is not mapped in either source and is not placed.

*Would settle it*:
- a photo of the gate from IPS Road;
- the campus wall's colour;
- a site plan naming the core's blocks.

## Legon Road by the stadium, the La Bawaleshie junction and its neighbourhood (19 pairs)

The owner's brief *Legon Road and La Bawaleshie Reconstruction Brief*: 19 game/street-view pairs and six additional
references:
- Reference 1: the annotated real aerial with the pair arrows.
- Reference 3: the La Bawaleshie satellite crop.
- References 2 and 4: the game maps, used only to find assets.
- References 5 and 6: the flawed game aerials.

Code:
- `src/game/labawaleshie.ts` (models) and `src/game/lbplan.ts` (positions shared with the tests);
- the stadium's outer screen and floodlights in `stadium.ts`;
- the car-park fill hook in `life.ts`;
- cameras `lb1` … `lb19`, `lbRef5`, `lbRef6` and `lbTop` in `lbviews.ts`.

Comparisons are in `docs/legon-road-la-bawaleshie/`:
- `pairs-before-after-real.jpg`: game before, game after and the owner's photo for every pair;
- `aerials-before-after.jpg`: the two aerials matching References 5 and 6, and the top view aligned to Reference 1.

**Where the pairs are.** The brief's "Legon Road" is the game's J.J. Rawlings Avenue (the N4) at x ≈ 930–1060:
- the stadium lies to its west, and the La Bawaleshie junction is at (1001, 1203);
- Pairs 1–4 are north of the junction: the photographs are taken from the southbound (west) carriageway looking across
  the wide median at the east frontage;
- Pairs 5–14 are round the junction and the stadium;
- Pairs 15–16 share one spot south of the stadium approach;
- Pairs 17–19 are at the mouth of La Bawaleshie Road (Reference 3).

**Old to new**

| Before | After |
| --- | --- |
| 195 mapped outlines east of the N4 (both sides of La Bawaleshie Road) drawn with the campus template (white walls, red tile hips) | Built as the local fabric (see the rules below), and drawn over compacted earth and dust with worn grass patches and paved forecourts by the roads instead of lawn |
| Nine of those outlines, singled out by the photographs (`PICKS`) | Modelled to their photographs (see the list below) |
| No outline where Pairs 11 and 17–19 show shops (the map's gaps on both sides of La Bawaleshie Road just east of the junction) | Six frontages added, with their extents estimated (`MASSES`), listed below |
| Eight outlines of the compound west of the N4 drawn as campus blocks | Low grey and white sheds under blue and grey sheet roofs: the background roofs beyond the scrub (Pair 3) |
| The median: plain lawn | Kerbed patchy grass and red earth, young planted trees every 19 m, shrubs between |
| West of the N4 north of the junction: an open lawn, read as a campus (Pair 3) | A dense scrub of bushes of mixed height, tall weeds and a few small trees on dark ground; a kerb and a narrow worn red path along the road. It is kept clear of the pond and the mapped footway |
| The stadium-side verge: lawn, with a car grid behind it | The red brick path along the road, rough grass and bare earth, the steel palisade along the car parks' service road with young trees, panel billboards on single posts, two empty rust-red steel frames, a slender lattice mast (Pair 14) |
| The stadium car parks: 65–90% full of cars | About 10% full, as in the aerial and Pair 8; the paved and marked lots now show |
| The stadium's outer wall: a band of red, white and grey stripes on a blue base, 9.5 m high | A 13.5 m screen of muted red and pale fins (the athletes kept) over a pale grey concourse frame with dark openings, as in Pairs 6, 8 and 14. The four floodlights now carry large rectangular lamp arrays. The separate segments and the gaps at the corners stay: the photographs show them too (Pair 14) |
| The junction: bare corners, palms and generic trees | A signal post on each of the four corners and on both median noses; worn stone paving round them; the utility cabinet and black-and-yellow bollards at the north-west corner (Pairs 5–7, 10). The mapped slip lanes and approaches cover the corner islands at their drawn widths, so the posts stand on the corners, not on islands |
| — | Poles and wires along both sides of La Bawaleshie Road and the N4's east frontage; the pole-mounted transformer with its stay and cabinet by the corner (Pair 19); the lattice communications mast behind the beige block (Pairs 1, 2) |

**The fabric's rules**
- Storeys come from the footprint's size and whether it fronts a road: sheds under 35 m², up to four storeys for large
  frontage blocks.
- Walls take the local colours.
- Roofs are flat behind parapets (most with water tanks) or low metal hips.
- Faces toward a road get shop bays with roller shutters and rows of plain sign bands; some get awnings or upper
  galleries.

**The photographed buildings (`PICKS`)**
- *Pairs 1, 2:* the beige institutional block by the Ghana Revenue Authority, with its tall dark grey face wrapping
  the north-west corner and few openings.
- *Pair 4:* the cream three-storey block with orange corner pilasters, an orange stair face and dark window bands.
- *Pair 11:* the taller beige mass behind the yellow frontage.
- *Pairs 12, 19:* the two-level retail corner south-east of the junction, with upper windows, shop bays and the
  orange lower wall.
- The Diamed outline: two storeys, white with a blue band.
- *Pairs 15, 16:* the commercial block at the shared 15–16 view; the green gable-front building; the pale building
  with the red trim. Tall narrow trees beside them.

**The added frontages (`MASSES`, extents estimated)**
- the low yellow frontage with its dark display face (Pairs 11, 17);
- two small metal-roofed shops (Pair 17);
- a cream two-level shop block with a gallery (Pair 18);
- the blue frontage beside the corner block (Pair 19);
- a cream commercial block (Pairs 18, 19).

**Checks:** `npm run test:routes` adds:
- every pole, mast, frame, cabinet and the transformer stands off the roads;
- the added frontages touch no road and no mapped outline;
- every signal spot has ground for its post;
- every neighbourhood outline is built by the model, not the template;
- the nine photographed outlines are found;
- the rides along the N4 and La Bawaleshie Road pass no solid;
- the stadium lots' fill.

`.preview/solidroads.mjs` over x 700–1470, z 850–1660 finds no solid on a road or footway. Every existing route,
race and challenge keeps its length.

*Assumed*:
- The storeys, colours and roofs of the fabric (rules from size and frontage, not per building) and of the added
  frontages.
- The added frontages' extents.
- The signal heads' layout.
- The billboard, frame and mast spots.
- The scrub's depth (46 m).
- The beige block's dark face covering the north end.

No business names are written: the signs are colour bands, and no legible lettering in the photographs was copied.

*Would settle it*:
- a site plan of the La Bawaleshie corner plots (the map lacks the frontages east of the junction);
- the signal layout from above;
- the beige block's other faces.

## The Limbo ruin and the slabs by Annie Jiagge Road (the owner's Limbo brief)

The brief: three game screenshots with outlines circled in red, and the aerial (picture 4) with the Limbo ruin circled
in blue and the strip by the road marked with a purple arrow. The game drew both as two-storey blocks under red tile
roofs. On the ground they are only foundations. The model is `limbo.ts`, its cameras `limboviews.ts` (preview views
limbo1, limbo2, limbo3, limboTop, limboStrip, limboSouth). Before and after: `docs/limbo/before-after.jpg`.

**The foundations** (the mapped outlines, kept as they are; still solid to the bike):
- the Limbo ring south of the K. A. Busia Building (osm:way/702279067) and its west range with the wing into the court
  (osm:way/975205017): bare slabs 0.85 m high;
- the strip by Annie Jiagge Road north of JQB, its top and lower slabs (ml:8758cc6d-..., ml:b04e3fa1-...): broken slabs
  0.4 m high.

Their tops are grey-beige concrete with the 4 m structural grid's joints, large dark mould and lichen blotches as the
aerial shows, cracks and weeds. Round the edges: column stubs broken off low with rusty rebar standing out, rebar alone
where a column was cut flush, a course or a few of blockwork along part of some edges, tufts and small bushes growing out
of the cracks.

**The ground round Limbo** (from the aerial):
- a dense belt of trees and undergrowth along the north (toward the Busia Building), the west (along the residential
  road) and the east (along Annie Jiagge Road, thinning to scattered trees and grass toward the south);
- in the court, the north part bare red soil with grass in patches; the part east of the wing and the south part
  dense green with small trees;
- south of the ruin, open red soil with grass in patches and a line of six scattered trees by the red earth road.

**The strip**: thick bushes, small trees and tall grass between the road and the ruined compound east of it, bare red
earth in patches by the slabs.

The machine-detected outline west of the ring (ml:6efd5aa8-..., drawn as a narrow two-storey block) is the tree belt,
not a building, so it is dropped (`corrections.json` exclude).

**Checks:** `npm run test:routes` adds:
- the four outlines are found and built by the model, not the template;
- no building stands in the west belt;
- every tree stands off the roads;
- the rides along Annie Jiagge Road pass no tree.

*Assumed*:
- the slabs' heights;
- the column grid and where stubs, rebar and blockwork stand;
- the belts' and the court's extents (read from the aerial, not measured);
- the trees' sizes.

The ruined compound east of the strip (x 547–599) is left as it was: it was not circled, and its frame was modelled from
an earlier photograph.

*Would settle it*: ground photographs of the ruin's edges and of the strip.

## The Legon Fire Station, the Child Lab vicinity and E.A. Boateng Road (14 pairs, R1-R3, G1-G6)

The brief: `Legon_Fire_Station_Child_Lab_Detailed_Claude_Brief.pdf`, with 14 game/real pairs and three annotated real
aerials:
- R1: Pairs 1-2;
- R2: Pairs 7-13;
- R3: Pairs 3-6 and 14.

It also has five game aerials (G1-G5) and a game map crop (G6). The models are `firestation.ts` and `boateng.ts`, with
shared pieces in `fskit.ts`, numbers in `fsplan.ts` and cameras in `fsviews.ts` (preview views `fs1`-`fs14`,
`fsG1`-`fsG5`, `fsR1`-`fsR3`).

Comparison sheets are in `docs/fire-station-child-lab/`: `pairs-1-7.jpg`, `pairs-8-14.jpg` (before, after, real) and
`aerials-before-after.jpg`. The before renders use the first camera estimates; some cameras were tuned afterwards, so
a few before/after framings differ.

**Registration.** Each real crop was matched to the mapped outlines and roads on its own:
- R3 by the long buildings and the dance venue's roofs;
- R1 by the courtyard ranges and E.A. Boateng Road;
- R2 by the cluster's outline and the road's bend.

Arrow tails gave the camera zones and heads gave the directions.

**Old to new (by mapped outline):**

| Outline | Was | Now |
| --- | --- | --- |
| osm:way/773861741 | generic block | gable A: low pale gable, rusty sheet roof, the fire-service lettering, the doorway and wall unit (`firestation.ts` station) |
| osm:way/492099511 | generic two/three-storey block | gable B: the long low west building, grey sheet roof (`firestation.ts` long west building) |
| osm:way/603522789 | generic block | the small low shed beside B |
| osm:way/430197440 | generic block | the long low building by La Road, pale sheet roof |
| osm:way/492099542 | generic block | the low office (Pair 6) |
| osm:way/492099499 (mapped name "Soil Science") | generic tall block | the courtyard's low east range, its link and passage (`boateng.ts` court) |
| osm:way/492099515 | two storeys (`agprecinct.ts`) | one storey (R1: a low perimeter round the court) |
| osm:way/492099547 | generic hip block, big windows | the low long building, shallow gables (`boateng.ts`) |
| osm:way/439690551 | three low wings (`agprecinct.ts`), hip at the east wing's north end | the same wings, the east wing's north end now CEGENSA's gable |

The CEDSA screen and gate, the stone court and path, the CEGENSA sign and the planting are new pieces in `boateng.ts`.

**The station (Pairs 3-6, 14).** One ensemble seen from three angles:
- gable A, with the lettering and the black ribbed tank on its stand in front;
- the broad dark open canopy over the mapped drive between A and B: a thin sheet on beams and slender posts, open-sided;
- gable B behind the railing fence;
- the weathered pale wall with planting along the car park, and the vehicle opening on the drive between pale piers;
- the railing fence on a low wall, with the SAFETY WEEK banner (only its major words are legible);
- the worn hardstanding yard;
- the low red railing and flower bed across the car park (Pair 5).

Lettering is only what the photographs show legibly: GHANA NATIONAL FIRE SERVICE, UNIVERSITY OF GHANA - LEGON and
EMERGENCY 192. No numbers are invented.

The office (Pair 6):
- off-white over a reddish-brown band, low dark roof edge;
- the tall pale door, barred windows with wall units under them;
- block paving along its front, short painted posts;
- the hedge-lined red earth access beside it;
- a pole with wires.

La Road's east side (Pair 14):
- a block-paved footway behind a pale kerb;
- a contained drain opening at the kerb (visual only, no hole or step);
- a low pale wall;
- two mature broadleaf trees instead of palms.

The mapped access spur into the car park is real (R3), so it is kept. The fire engine and cars are left out so the
drive stays clear; the yard keeps generic parked cars out.

**R1 (Pairs 1, 2).**
- The courtyard complex is low all round:
  - the east range is one storey, with small dark openings and a narrower link with a passage;
  - the north range comes down from two storeys to one;
  - the open court has grass panels between two north-south walks and one east-west walk that runs on through the
    passage to the road, with one tree.
- Across the road, the low long building:
  - a shallow red gable roof with a dark fascia, and pale walls on a dark plinth;
  - the north end is mostly blank, with a door at one side and a small wall fitting;
  - the east side has pilasters and small openings;
  - the solar lamp, the clipped hedge, and the big tree on the pavilion's side.
- The veranda pavilion keeps its existing model.

**R2 (Pairs 7-13).**
- CEDSA:
  - the perforated screen on its red base along the cluster's south side;
  - the central gate: piers, black grid, small tiled cap, and the fascia CENTRE FOR DISABILITY STUDIES AND ADVOCACY (CEDSA);
  - the notice panel (pictures only; its words are not legible);
  - the dark forecourt.
- CEGENSA:
  - the east wing's north end is now a gable, with the sign, the high vent, the tall louvred opening and the small
    tiled awning;
  - a kerbed bed in front of it.
- The irregular tan stone court north of the wings and in their inner court.
- The mapped service road from the court to E.A. Boateng Road is drawn as a stone path (`fsplan.ts` `FS_PAVED` and
  `science.ts` `offAsphalt`). It is still ridden, and its last metres at the road stay asphalt.
- A planted border, three tall conical shrubs, and a patchy garden with trees and small palms.
- The CEGENSA direction sign with its red arrow (contact lines left out).
- West of the court (Pair 12): a worn earth track across tall unmown grass.

CEGENSA's destination moves from the Biotechnology Centre's outline to the signed cluster (`landmarks.json`
`cegensa`); its entrance is now at the gable. CEDSA and CEGENSA keep separate names, and the map's IT business pin does
not rename either.

**Checks.** `npm run test:routes` adds:
- every replaced outline is built by a model;
- the posts, piers, tank legs, canopy posts and signs clear every road;
- the station drive and the R2 drive are ridden without passing a solid;
- CEGENSA sits on the cluster.

`.preview/solidroads.mjs` over the three zones finds no new solid on a road. The three it lists are older generic trees
outside this work.

*Cross-checked and left unresolved* (the owner's instruction: no guess, no change until confirmed):
- **Pair 12's near-left gable with the air-conditioning units.** The only outline near the camera on that side is the
  Biotechnology Centre's east end (osm:way/300288065, labelled LT3 on R2). R2 shows its roof hipped, while the
  photograph shows a gable, and no other mapped outline within 40 m fits. Identity not established.
- **Pair 14's communications mast.** It lies beyond R3's frame, up La Road. No OSM, Overture or registry feature maps a
  mast or tower there. Position not established.

*Assumed* (adjustable in `fsplan.ts`):
- which buildings are gables A and B (from the canopy's breadth, the mapped drive between them and the tank's shadow
  in R3);
- the canopy's extent and heights;
- the wall line and the gate opening;
- the tank's spot;
- the railing's spot;
- the courtyard walks' spacing;
- storey heights and roof pitches;
- the stone court's extent.

*Deferred, with questions for the owner*:
- Pair 12's near-left gable with the air-conditioning units: the R2 arrow does not tell which building it is.
- Pair 14's communications mast: its spot is not evidenced.

*Not done*: the ruined compound and other neighbours outside the marked targets are unchanged. The east building's long
rear and B's southern length are kept low and plain (not seen in the photographs).

## IPS Road opposite UPSA: Prestige and Nophil Heights (the owner's reference pack)

The pack: `LEGONRUSH_IPS_Road_Opposite_UPSA_Reference_Pack.zip`, with nine stills, a 17 s, 270° Street View recording
(September 2024) and the brief. It is a separate pack from the UPSA campus landmarks.

The model is `ipsopposite.ts`, with cameras in `ipsoppviews.ts` (preview views `ipso1`-`ipso7`, `ipsoTop`). The
comparison sheet is `docs/ips-opposite-upsa/before-after-reference.jpg`.

**Placement.** The recording pans clockwise from one point on the south side of IPS Road:
- the unfinished tan block and Nophil Heights (south-east);
- the long Prestige block (west, along the road);
- the road;
- across to the Abednego F. O. Amartey Towers and the UPSA board (north).

That puts the panorama by the east end of the mapped row osm:way/885510982, with the side street at x 2266 and
Nophil Heights on the corner beyond it.

**Prestige** (osm:way/885510982, which the game drew as a generic two-storey "shop row"):
- four storeys of tan panels between grey projecting slab bands, a grey cap, framed windows, a few sashes open, and
  grey pilasters;
- shops on the ground floor behind roller shutters, under coloured sign boards (no invented names);
- the entrance bay (still 04): tall ochre columns, recessed dark blue glazing, a projecting canopy with a small emblem;
- red roof letters: PRESTIGE east of the bay and HOSTEL west of it, as stills 02, 04 and 07 show them;
- the paved forecourt to the lay-by.

The PRESTIGE HOSTEL sign the UPSA corridor work had put on the building behind (osm:way/1238177036, which carries the
OSM "prestige hostel" point) is removed. The name is on the road frontage, not repeated behind it. That building keeps
its four storeys, forecourt and bollards.

**Nophil Heights** (stills 01, 08; recording frames 1-6):
- a glazed retail ground floor, with a red-framed glazed corner unit and dark cladding on one shopfront;
- a recessed level of narrow vertical windows behind a continuous balcony rail;
- the off-white upper box projecting 1.5 m over the road face and the side-street face, with its grid of large dark
  louvred panels and small fixtures;
- red NOPHIL HEIGHTS letters on top of the front and the side;
- a broad paved apron.

*Its position is the owner's, not mapped.* The owner confirmed the name from the Street View still (the letters
read NOPHIL HEIGHTS) and its corner, just east of the side street beside the Prestige block's east end. No footprint
source has an outline there: OSM, the UPSA extension, Overture and Google/Microsoft ML footprints all leave the corner
empty. The nearest outline, osm:way/1009392387, is 56 m further east. Its 16 x 13.4 m size is therefore an estimate,
made from the recording against the Prestige bays and the side street. Its walls carry their own collision.

**The towers** move to their mapped outline (owner's correction). The Abednego F. O. Amartey Towers' model
(`upsacampus.ts`) now stands on osm:way/885510985 (x 2220-2272, z -958..-943), north of IPS Road opposite the Prestige
block's east end. This matches the UPSA pack's satellite map (image 20) and this pack's recording.

The outline is one 52 m rectangle: the two blocks at its ends and the joining part set back between them (the split is
read from the photographs). The east block's road face carries the large blue reflective curtain wall with its mullions
and white slab edges; the west block has narrow vertical blue strips.

The machine-detected outline they first stood on (ml:73e6ceb9, x 2166-2196) is the red tennis court in image 20, so it
is excluded (`corrections.json`). The mapped pitch there is drawn again. The model was moved, not duplicated.

**Streetscape.** The south verge's red earth, drain, poles and wires (`upsacampus.ts`) are kept. The paved forecourts are
new. No parked cars are baked in.

**Checks.** `npm run test:routes` adds:
- the row is built by the model;
- Nophil Heights stands clear of every road and mapped outline;
- the side street and the lay-by are still ridden.

`.preview/solidroads.mjs` over the frontage finds no solid on a road.

*Assumed*:
- Nophil's spot and size (16 x 13.4 m) and its storey heights;
- Prestige's storey heights (3.8 m and 3.2 m);
- the entrance bay's position along the row (x 2210);
- the letters' sizes.

*Would settle it*: Nophil Heights' measured outline, and whether the unfinished tan block east of it should be
modelled.

## UPSA landmarks: the new Main Entrance, KOKA, Justice Aryeetey, the Administration, the Library (the owner's pack)

The pack is `LEGONRUSH_UPSA_Landmark_Reconstruction_Brief.docx`, with 35 embedded images. It is a separate pack from
the IPS Road opposite UPSA work. The evidence, the landmark-to-outline table and the confidence of each part are in
`docs/upsa-landmarks/evidence-audit.md`; the comparison sheets are in the same folder.

The models are in `upsalandmarks.ts`, with their numbers in `upsalandmarksplan.ts` and their cameras in
`upsalmviews.ts` (preview views `upsl1`-`upsl11`, `upslTop`). Every landmark stands on its mapped outline.

**The new Main Entrance** (osm:way/1009392399) replaces the older blue-and-white canopy gate and its banner. It is a
white square-tiled portal:
- the quarter arch sweeps from the ground on the west up to the header, over a deep soffit with skylights;
- the tall tiled block on the east has blue windows;
- the outer fascia carries the name, the motto, "UPSA" and the crest;
- under the arch: the booth and the raised barriers; at its foot, the ramp with black rails, and the planting bed;
- paving runs either side of the road.

The road's opening is unchanged and open its whole height. `upsacampus.ts` keeps only the campus wall.

**Kofi Ohene-Konadu Auditorium (KOKA)** (osm:way/1009392441):
- the white tiled side masses with slot windows;
- the broad convex blue glass curtain wall over the dark-column entrance;
- the blue metal roof;
- the paved forecourt.

**The court.** The fountain, with its stepped orange rim, sits where the quadrangle's mapped walks meet. Benches stand
beside the walks, and the "We love UPSA" letters stand on the lawn.

**The Justice Aryeetey Building** (osm:relation/13514869, to KOKA's right as one faces it) has six storeys round its two
courtyards. Blue strips run up its west front. The central blue bay has an arched cap over the main entrance, where the
UPSA ride ends.

**The Opoku Ampomah Building / Central Administration** (osm:way/1009392440):
- the drum, with the curved blue glass band facing the car park;
- the OPOKU AMPOMAH BUILDING band under the glass, and the grey CENTRAL ADMINISTRATION band over the entrance;
- "UPSA" on the roof edge.

Its wings (osm:way/376818534, osm:way/885510988) have blue cladding panels under pale blue hipped roofs.

**The Joshua Alabi Library** (osm:way/885510989) has six storeys on its mapped plan. The taller central bay faces the
road on the north, with:
- the arched window and the pediment;
- the blue columns;
- the JOSHUA ALABI LIBRARY sign.

**The Abednego F. O. Amartey Twin Towers** are unchanged: they stay on osm:way/885510985 (the IPS Road work).

**Not supplied.** The brief names three things the upload did not include:
- `reference_images/document_ready/`;
- `ONLINE_SOURCE_REGISTER.csv`;
- the contact sheet.

**Estimates.** All heights, the gate's lane arrangement, KOKA's rear and the library's front (the north face, from the
map) are estimates. They are documented in the audit.

## J.J. Rawlings Avenue from Shell to PRESEC and Bani (the owner's Bani, PRESEC and IPS Road brief)

The brief is `Bani_PRESEC_IPS_Detailed_Claude_Brief.pdf`, with 20 street pairs and the aerials R1-R4 and G1. The models
are in `banipresec.ts`, with their numbers in `bpiplan.ts` and their cameras in `bpiviews.ts` (preview views `bpi1`-`bpi20`
and the overheads `bpiR1`-`bpiR4`, `bpiG1`). Evidence, the old-to-new mapping, the deletions and the open questions are
in `docs/bani-presec-ips/evidence-audit.md`; the per-pair comparisons and the coverage check are in the same folder.

The section's map data was complete. The game had drawn it with generic models: lawn, palm avenues, classroom blocks
and the blue shuttle shelters. This pass rebuilds it from the photographs, on the mapped roads and outlines.

**Pairs 1-6** (R2):
- the Shell pylon and the forecourt paved out to the road;
- the open scrub and red soil on both sides of the avenue, in place of lawn;
- one drooping palm, the skeletal billboard frame, and the tall edge-on billboard;
- the lattice towers and their line, the poles with crossarms and their wires, and billboards along the corridor;
- the unroofed frame east of the avenue. It has no outline in any source, so it is provisional and its height is
  unconfirmed.

**Pairs 7-10** (R1, R3):
- the overhead signal arm at the IPS Road junction;
- at the GOIL corner: the paved walk, the stone-lined drain and its crossing slab, the white cabinets, the exposed rust
  frame, the stall roof, kiosks, umbrellas, the mast and boards;
- the pale concrete shelter at the "UPS" stop, under its tall billboard.

The blue shelters there are removed.

**Pairs 11-14, 20** (R4):
- the signal arms at the PRESEC junction;
- PRESEC's gate: the PRESEC span on red piers, the lettered wing walls, the blue plinth, the white boundary wall, the
  stone-faced verges, the walks and posts;
- dense trees screening the school;
- the roadside shops and the "Presec" stop's shelter.

**Pairs 15-19** (R4):
- the cream five-storey Bani block (osm:way/1334286313) and the peach four-storey block (osm:way/1334286314);
- the low wall and boards along the side road, its poles, the shaded gathering ground, two sheds, and the elevated
  billboard.

Two false machine-detected outlines are excluded (`corrections.json`). The four Bani Hostel blocks are in no pair and
keep the generic model.

## Commonwealth Hall: the owner's correction brief (Pictures 1-6)

The details are in `docs/commonwealth-correction/README.md`, with before and after images. The code is in
`commonwealth.ts`, and the cameras are `cwcTop` ... `cwcWin` in `cwviews.ts`.

**Links.** Single-storey links, under their own roofs, now stand at all 11 of Picture 6's short blue marks:
- a-c: the dining wings to the dining hall and the crossbars;
- d-g: along the front (e and f were two-storey joins and are now low);
- h, i: the end building to the stubs;
- j, k: the chapel to the crossbars.

Each link is lower than the blocks it joins and reaches into both, so no grass slit is left.

**Exceptions kept:**
- the two green-circled pavilions stay detached (the west one's eaves shortened to keep a gap at roof level);
- the break south of the dining hall stays open.

**Newly modelled.** The dining hall, its wings, the block against the east wing, the chapel and the prayer lounge were
on the generic cream template. They are now part of the hall model. Their storeys are estimates.

**Materials** (scoped to this model):
- brown timber louvred windows everywhere, with no glass, including the entrance's upper glazing and the pavilions;
- white paint;
- irregular rubble stone on the plinths, retaining walls, cheeks, terraces, the stairway's walls and the arches;
- worn, textured dark-brown stairs on every flight, the pharmacy steps included.

The planting is kept.

## The Great Hall precinct: the owner's correction brief (A01, R01-R59, G01-G10)

The evidence, the registration, the comparison images and the open questions are in `docs/great-hall/evidence-audit.md`.
The code is in `greathall.ts`, the numbers in `greathallplan.ts`, the levels and steps in `relief.ts`, and the cameras
`gh*` in `ghviews.ts`. This supersedes the Great Hall paragraph of the Commonwealth and Great Hall brief above.

**The through-road.** The asphalt and lane markings through the court were the route's last leg drawn as road. The
compound is now paved, and the route lays no road there. The way in runs:
1. through the gateway building's arch (its outline is split at the passage);
2. across the lower court;
3. up two flights of worn dark grey steps between stone planters with red coping;
4. across the upper court to the portico's steps.

**The hall.**
- the high hall with its clerestory, under a broad weathered hip roof, and aisles with long grilles;
- the lower tiled canopy over four tall white supports;
- the entrance wall with its grilles, the roundels, Established 1948 and GREAT HALL, and the dark doors.

**The clock tower.** A rectangular white shaft at the upper court's corner, with:
- small square openings and the projecting window with its pointed red cap;
- the balustrade, the square clock stage and the red cap.

The cylindrical tower is gone.

**The upper court.**
- **Wings.** One storey, with white-columned verandas, white walls over a cream band, brown shutters, barred windows and
  doors, and an arched gable passage in the middle of each side wing.
- **Court.** Slab paving with lawn panels, grates, crazy-paving patches, two big shade trees, and the dark rounded
  object on its white base.
- **The way down.** The lantern piers and the black tanks on their stands.

**The lower court.**
- **Bust walk.** Twelve busts, six with legible plaques.
- **Wings.** The crimson-roofed bust wing and a narrow north wing.
- **Court.** Raised beds and frangipani.

**The gateway building.** Two storeys, with the window row and the arch with its reveals, gate leaves and red-riser
steps. Its pavilions, the links and the covered walks are also modelled.

**The approach.**
- the semicircular garden inside the turning loop;
- the formal garden between the two roads east of the cross road: a paved grid of lawn panels, a second square, and
  flowering trees;
- the long single-storey ranges either side of it.

## Okponglo to the UG Stadium: the owner's correction brief (Pairs 1-21, A01-A05, M01-M04)

The evidence, the registration, the comparison images and the open questions are in `docs/okponglo/evidence-audit.md`.
The code is in `okponglo.ts`, the numbers in `okplan.ts`, the stadium-side banks in `relief.ts` (`bankZone`), and the
cameras `ok*` in `okviews.ts`. It builds over the Legon Road and La Bawaleshie work above (labawaleshie.ts), which keeps
the median's kerbed ground, the verges, the junction and the neighbourhood's other buildings.

**The median.**
- Compact trees on short stems with foliage reaching low, crowns of different sizes and a few larger ones, uneven gaps,
  north of the junction (Pairs 1, 2, 4).
- The open stretch south of it: low shrubs and saplings between the KFC and visa boards (Pairs 13, 14).
- Soil patches and worn paths; the blue pylon, the A-frames and the INSTANT ADMISSION pylon.

**The stadium side.**
- North of the junction: a raised bank behind a low rough stone face, dense varied shrubs over it (Pair 3).
- Opposite Leasafric: the raised verge with the same face, the cream structure with its curved ends and grey inset
  panel, the blue structure, the signboards and the street light (Pair 21).

**North of La-Bawaleshi Road.**
- First Eye Plaza: ground shops behind grilles, the gallery set back behind orange columns and a railing, the top floor's
  discrete windows, the orange tiled central feature with blue insets and FIRST EYE PLAZA on it; the forecourt's slabs,
  kiosks and cabinet (Pairs 5, 6).
- The low red-brown roofed structure behind its grille and gate (Pair 7).
- ALPHA LED: the display stack, the dark screen, the coloured letters, the recessed green entrance up its steps, the low
  yellow wing (Pair 9).

**South of La-Bawaleshi Road.**
- The corner shop with 3D SIGN SHOP in coloured relief letters on its dark fascia, 3D SIGNS on its face to the fenced
  gravel forecourt, the taller block behind it, the larger neighbour set back (Pairs 8, 10, 11).
- The long green wall round the planted plot, the empty frame, the lattice mast (Pairs 12, 13).
- Leasafric's red-and-white office under its green roof, LEASAFRIC GHANA, the panel wall, the black gate and the pylon
  (Pairs 15, 16).
- Pro Vision's stone-faced front and green gabled building, the cream wall and security fence, the gold gate and the
  board (Pair 17).
- Diamed's green gabled house, the FIBROID and REHABILITATION banner, the decorative wall on McDan Drive; the blue
  neighbour's rounded balcony canopy, high blue wall and black gate (Pairs 18-20).

*Assumed*: every height, setback and unmapped span; the median plants' places; the mast's spot from four views'
bearings. *Would settle it*: a measured section of the stadium-side banks; the plots' boundaries; a clearer crop of the
forecourt sign of Pair 8.

## In-ride map and the fly-over camera (owner)

**View map** (pause menu): the campus map full screen over the paused ride (`src/features/map/ridemap.ts`, the same map
as the Map tab): where the rider is and which way they face (the yellow arrow), the ride's route in blue and its
destination's red pin (not in races). Drag, pinch, the wheel or the + and - buttons look around; the locate button comes
back to the rider. "Back to ride", Escape or M close it and return to the pause menu with the ride exactly where it was
(Continue then carries on; nothing is restarted). With a controller: the left stick moves the map, R2 and L2 zoom, R3
finds the rider, Options, Create or Circle close it. Nothing on the map starts another ride.

**Fly-over camera**: Triangle / Y now cycles chase, far, close and fly-over. The fly-over hangs about 30 m above the
ground and 11 m behind the bike, looking down on it as it moves and turning with its heading, in free rides, guided
rides and races; the right stick still turns it round the bike.

## Legon overhead to Okponglo: the owner's correction brief (Pairs 1-16, A01-A04, M01)

The evidence, the registration, the comparison images and the open questions are in
`docs/legon-first-total/evidence-audit.md`. The code is in `legonfirst.ts`, the numbers in `lfplan.ts`, the raised plot,
the retaining wall's ground and the east scrub's rise in `relief.ts` (`lfZones`), and the cameras `lf*` in `lfviews.ts`.

**The trading corner and the kiosk line (Pairs 1-3).** The curved kerb and brick corner at the side lane's mouth with
its short striped posts; umbrellas, canopy stalls and kiosks on bare red earth; the long low shelter on its outline; the
tall narrow board. The police compound north of the lane stays as `roadside.ts` built it.

**The Legon 1st frame (Pair 4).** The tall dark open frame with the small name panel, over a rough open plot.

**The TotalEnergies station (Pairs 5-8, 10).** One group: the low grey takeaway building with CHICKEN MAN, pinkberry and
DRIVE THRU and its air-conditioning units; the open red-trimmed canopy over two pump islands; the service strip's open
bays; the access with its grass islands, striped posts, no-entry discs, STOP, the price pylon and the restaurant pylons.
Family Health stays on its outline.

**The raised plot (Pairs 9, 15, 16).** The stained wall holding the plot about a metre up, tapering at the access; the
small white building with the peeling red fascia, the unfinished frame, the empty blue billboard skeleton, the red frame,
the railing and white posts.

**The corridor (Pairs 11-14).** The low concrete divider; the grass strip and its lamps; the long panelled retaining wall
with the wooded ground over it, stepping down in two tiers under the two small red-roof structures; the dense scrub and
the lattice tower on the east; the planted separation of short-stemmed young trees and shrubs.

*Assumed*: every height, setback and unmapped span; the stalls' and plants' places; the wall's and the tiers' heights
from Pairs 11, 14 and 16. *Would settle it*: a measured section of the retaining wall; the station's site plan.

## The ECG area: the owner's correction brief (Pairs 1-18, A01-A03, M01)

The evidence, the registration, the comparison images and the open questions are in `docs/ecg-area/evidence-audit.md`.
The code is in `ecg.ts`, the numbers in `ecgplan.ts`, and the cameras `ec*` in `ecgviews.ts`.

**The ECG office (Pairs 4, 12, 13).** One building on outline 317: the four-storey white slab with its narrow dark glazed
recess and ECG marks, the lower broad blue-glass wing north of it with its rounded end and pale fascia; the frontage wall,
the planting, the ECG GOES CASHLESS board; the two halls under yellow-green curved roofs behind (849, 850).

**The guesthouse (Pair 14).** The white hall under the grey gable with the blue-glazed bay, the lower brown-roofed west
part, the green-roofed entrance huts, the blue sign, the tank stand.

**The Ghana Water compound (Pairs 2, 6, 9-11, 18).** The blue wall and fence open at the access lane, the gate posts and
open leaves, the blue-roofed guardhouse, the stepped white office with its cap, the canopy, the court, the striped posts,
the lattice tower and the red and white mast, the banana plants and palms.

**The low cream building and the yard (Pairs 3, 5).** The red hipped roof, moved 3.4 m east off the service road's kerb
(estimated); the black picket fence and the utility yard.

**The highway (Pairs 1, 3, 4, 7, 8).** The low divider dropping toward the cutting, the planted separation, the 50 signs,
the utility corridor with its H-frames and towers.

**The trading frontage (Pairs 15-17).** Twelve stalls of five kinds on bare earth, the slab footway and drain, the pole
with its board, the rocks.

*Assumed*: every height and unmapped span; the slab as the Ghana Water views' taller block (inferred); the slab and wing
split; the second hut; illegible sign lines left as bands. *Would settle it*: the ECG and Ghana Water site plans.

## The Commonwealth west tennis complex: the owner's correction brief (Pictures 1-12)

The evidence, the registration and the open questions are in `docs/tennis-west/evidence-audit.md` (the pictures in
`docs/tennis-west/refs/`). The code is in `tennis.ts`, the numbers in `tennisplan.ts`, the terrace in `relief.ts`
(`tcGround`), the belt beyond the modelled trees in `ghlandscape.ts`, and the cameras `tc*` in `tcviews.ts`.

**What was wrong.** The two mapped pitches north of Commonwealth Hall were drawn as striped football grass on the
hill's open slope, under a few palms and orange flame trees (Pictures 9-11).

**The terrace (brief p.4; Pictures 1, 4, 7).** One level floor cut into the slope, held on all four sides by stone
retaining walls of irregular tan, grey and reddish stones; their exposed height steps along each side (about 0.6 to 1.6
m, higher at the corners); the ground behind them eases back up to the hill.

**The courts (Pictures 1-8, 12).** West, the hard court: faded blue in a pale green run-off, the full line system, worn
patches, scuffs and cracks as texture, one net. East, the red-soil ground: two courts side by side with their own nets,
and red ground on to the trees (Picture 12) without lines. Chain-link fence on thin posts with braces, a fence between
the two surfaces, vines on the red side; the lattice mast and the chair-like frame plainly (Picture 8).

**The belt (Pictures 5-8, 12).** Broad mature crowns and shrubs close round the fence where the aerial is dense, the
three round trees south of the red courts, the belt beyond as instanced crowns from the aerial; palms and flame trees in
the local scene become broadleaf street trees.

*Assumed*: the floor's level, every wall height and step, the fence's height, the trees' heights; the mast's spot.
*Open*: the way in (no gate, stair or ramp is shown: none modelled), the use of the east red strip, the name.

## The land behind the Great Hall: the owner's landscape correction brief (Pictures 1-3)

The evidence, the registration and the open questions are in `docs/great-hall-landscape/evidence-audit.md` (the pictures
in `docs/great-hall-landscape/refs/`). The aerials are read into ground-cover grids by `scripts/landcover/cover.py`
(written to `landcover.ts`); the work area, the earth tracks and the pale clearing are in `ghlplan.ts`; the painted
ground and the plants in `ghlandscape.ts` with `scrubkit.ts`; the cameras `ghl*` in `ghlviews.ts`.

**What was wrong.** From the Legon ByPass to the Great Hall's compound the game had one mown lawn, the mapped tracks as
concrete strips and asphalt, and a 49 m red-roofed building on an outline the aerials show as a pale flat clearing.

**Now.** The aerials' mosaic over the whole marked area: dense thickets and short-stemmed tree clusters with open gaps,
low green cover, dry olive cover, exposed red-orange soil, dark brown ground with small shrubs; the mapped tracks as
narrow worn earth (routes unchanged); the pale clearing as ground; grass tufts and a fine ground grain near the camera.

*Assumed*: every plant's height and trunk (the aerials do not show them; the owner's short-stem preference is the
baseline). *Open*: the pale clearing's function; the land south of z +487 (no aerial); unmapped worn paths.

## Loading, the tilted block behind Volta, the Great Hall's neighbours (the owner's nine pictures)

**Loading (Pictures 1-4).** On a laptop the splash stayed for a long time, then Chrome's "Page Unresponsive"; on phones the
page crashed and reloaded ("A problem repeatedly occurred"). The cause: the whole campus was built, compiled and uploaded
in one blocking run of about a minute, and it kept every vertex array twice (on the CPU and on the GPU), about 1 GB of
heap. Now (`Game.buildWorld`, `world.buildCampusAsync`, `memory.ts`, `lite.ts`):

- the menu shows at once; the campus builds in slices of about 40 ms (each block site a frame at a time), and a ride
  started early waits on the loading screen until it is ready;
- normals and colours are stored as bytes, and every vertex array is dropped from the CPU once it is on the GPU (the
  collision meshes keep their positions); heap after loading about 360 MB, against about 1070 MB;
- shaders are compiled before the campus joins the scene, and the buffers are uploaded in batches of about 150k vertices
  to an off-screen 1x1 target, so the first frame does not stall;
- on phones and devices with four cores or fewer, canvas textures of 256x256 and over are half size;
- the block sites' lit-window pictures are shared by window layout (1184 textures to 1026; on a phone about 214 MB of
  textures, against well over twice that before the halving);
- the loading bar fills with the build's real progress instead of looping (in the preview the looping bar slowed the
  build five-fold on four software cores: each composite waited on the GPU work);
- slow loops found by profiling made fast (road-clearance and building lookups by grid, the flag Voronoi, the red-earth
  ground mask's resolution).

Measured in the headless software renderer (much slower than a real GPU; `tools/preview/load.mjs`, `prodride.mjs`,
`texlist.mjs`): the production build shows the menu at about 5 s and has the campus built and uploaded at about 35 s, the
page answering between slices (longest single task about 2 s; before, one task of about 60 s before anything showed).
The upload draws are empty (a zero draw range: buffers and programs set up, no vertex shaded).
[INCOMPLETE] not measured on a real phone or laptop: the owner's check is needed.

**The tilted block (Pictures 5, 6).** A generic block behind Volta Hall, north-west, facing Commonwealth Hall, stood on
the terrace's slope and followed it. Every generic building now stands level: its floor at the highest ground under its
outline, a plinth down to the lowest.

**The pit (Picture 7).** [INCOMPLETE] The circled grass by the pavement was not found from the crop: the
Commonwealth/Volta junction, the University Avenue verges and a scan of every off-road ground cell (depressions under
the road level) show nothing there. A wider screenshot or the map position is needed.

**The Great Hall's neighbours (Pictures 8, 9).** The generic buildings round the Great Hall (x -1130..-540, z -30..300) had
the campus's glazed windows; they now have the hall's white walls and brown timber louvres (`louvreFacadeTexture`). Two
blocks whose outlines reached into the road (about -787, 105 and -824, 75) are pulled back to 0.5 m clear of its edge
(`PULL_BACK` in `campusmap.ts`). [ASSUMPTION] the precinct's extent.

## UPSA campus, the second layer: the Astro Turf, the courts, the PCU building (the owner's two UPSA packs)

The evidence, the ledger and the conflicts are in `docs/upsa-campus/evidence-ledger.md`. The first look, before the
second pack arrived, is in `analysis.md`. The aerial's registration and the comparison sheets are there too. Numbers are
in `upsawestplan.ts` and the models in `upsawest.ts`; the campus blocks' finish is `world.ts` `upsaStyle`.

**What was wrong.**
- No Astro Turf: five machine-detected boxes and a service road stood on it.
- The hard courts were striped grass.
- The PCU building and three other blocks were missing.
- The campus's blocks were cream two-storey houses under red hipped roofs.

**Now.**
- **The turf.** Bands across the pitch, the full lines, goals, a red edge, a welded-mesh fence on a low upstand, six
  floodlight masts, and the stand of blue and white seats with its pavilion on the west side.
- **The courts.** The four courts in one red surround: basketball north, tennis south, chain-link fences. The tower
  court is beside the towers.
- **The PCU building.** Three storeys over the navy raking colonnade, the dark band under its name, and the blue glass
  bay at the east end, behind the north goal.
- **Three new blocks.** The six-storey block with its curved fins, the low grey-roofed block, the slate-roofed block.
- **The courtyard group.** Its red, green and tan roofs and the round fountain.
- **Every other campus block.** White, blue windows, a flat roof behind a parapet.

*Map changes.* Excluded with their reasons in `corrections.json`:
- seven phantom outlines;
- OSM outline osm:way/1009392429;
- the service road osm:way/626139046.

Route lengths are identical and access is unchanged.

*Assumed.*
- The PCU building's depth.
- The six-storey block's footprint.
- Every storey count not counted in a clip.
- The masts' spots.

*Open.*
- The towers' footprint.
- Ewuntoma and CIMG.
- The unnamed blocks.
- The bush west of the wall (next).

Published to `main` on the owner's word (2026-10-13).

## UPSA planting: the bush west of the wall and the campus's shade trees (from the owner's aerial)

The owner's Apple aerial is read into a 2 m ground-cover grid by `scripts/landcover/cover.py` (`UPSA_COVER`, the same
classes as the Great Hall's land; here a cell counts as dense green below a brightness of 0.31, since crowns are darker
than lawns in this capture). `upsagreen.ts` uses the grid in two places.

**West of the campus wall.** From x 2028 to 2135, the aerial's mosaic is painted over the grass: the thicket floor, the
green and dry cover, and the bare red and pale patches. On it stand crowns by the dense green: trees on short trunks
where it is thickest, low bushes round them, and scattered shrubs on the open patches. Every clip of the UPSA packs
shows this bush up to the wall (`docs/upsa-campus/sheet-green.jpg`).

**On the campus.** Shade trees stand only where the aerial shows crowns, clear of the roads, the paths, the buildings,
the car-park bays and the models' pitch and courts. That is mostly round the quadrangle and on the lawns.

*Assumed.* Every plant's height and trunk. *Incomplete.* The bush continues west beyond the aerial's edge; nothing is
drawn past it.

Route lengths are identical; the route tests, the build and the smoke ride pass. Published to `main` on the owner's word (2026-10-13).

## UPSA layout and facade corrections (the owner: "check and make correction to the upsa building layout and facade")

Every outline was rechecked on the owner's aerial at four times its size with a 10 m grid. The findings and their
evidence are in `docs/upsa-campus/evidence-ledger.md` (batch 129).

- **Twin towers.** Two ten-storey blocks on the two mapped slabs (osm:way/885510985 south, osm:way/885510984 north), with
  glazed bridges over five levels between them, instead of both blocks side by side on the south slab. The blue curtain
  wall and the LED screen are on the south block. The names are on the roofs.
- **Four-storey group.** Its outlines were 17-25 m east of the roofs and are reshaped onto them (`corrections.json`
  reshape). One stray outline on the courtyard is excluded. The walls are white with open galleries and railings,
  doors and blue windows in their shade (`textures.ts` galleryFacadeTexture, `facades.ts` gallery). The slate block and
  the fountain are moved to the aerial.
- **Stand and grey-roofed block.** The stand is against the courts' fence, with the walk between it and the pitch fence.
  The grey-roofed block has its full length. The dead-end way through both is excluded.

*Not changed.* KOKA's outline: the aerial's lean is ambiguous. The small house by the tower court: it would land on its
road loop.

## UPSA ground, planting and facades from the DroneStories frames (the owner)

The ledger is in `docs/upsa-campus/evidence-ledger.md` (batch 130) and the comparison in `sheet-ground-facades.jpg`.

- **The campus's ground.** Painted from the owner's aerial (`upsagreen.ts`): concrete and asphalt forecourts, red earth
  round the works east of the Administration, lawn only where the aerial is green, as in frames 166-203.
- **The quadrangle.** Lawn under shade trees round its walks and pond (frames 206-211).
- **Justice Aryeetey Building.** Low rust-brown hipped roofs (frames 132, 137).
- **The Opoku Ampomah drum.** Its dark glass band runs round the whole drum (frames 167-176).

## UPSA: the PCU brief, the generic structures and the car parks (the owner)

Evidence and ids are in `docs/upsa-campus/evidence-ledger.md` (batch 131); the comparison is
`docs/upsa-campus/pcu-brief/sheet-pcu.jpg`.

- The block circled REMOVE (osm:way/1009392442) and 13 more outlines with no building under them in the aerial are
  excluded. A car park is added between the Astro Turf and KOKA.
- The green slab across the view was the chase camera inside a tree crown. Foliage near the camera is no longer drawn
  (`shading.ts` `nearCut`).
- The PCU Building is rebuilt from the photos:
  - tiles;
  - a ground-floor colonnade with white columns and raking navy columns;
  - three gallery levels, the top one slatted;
  - the name along the top edge;
  - the blue glass end with its cross.

  Round it: the herringbone paver path along the pitch's east fence, the kerb, the dry grass verge, the forecourt with
  its drain.
- Open, with game views sent to the owner: KOKA's north section, the block on the earthworks east of the
  Administration, the blue rectangle east of KOKA.
- On the working branch only; not on `main` until the owner approves.


## School of Engineering Sciences: the correction brief (the owner)

Evidence and ids are in `docs/engineering-ses/evidence-ledger.md` (batch 132). The comparison is
`docs/engineering-ses/sheet.jpg`.

- **Placement:** the building is unchanged; the satellite confirms it. The jet's pad and fence move onto the
  compound's mapped outline (1026), which ends an invisible wall beside the old pad.
- **Facade:**
  - dark-framed four-pane windows, one per pilastered bay on the front block;
  - window and breeze-block bays on the wings' long faces, breeze-block screens on the wings' ends;
  - cream breeze-block towers with an arched screen at the top of each front.
- **Entrance:** a maroon gable porch with a pale soffit, the sign SCHOOL OF ENGINEERING SCIENCES, a tiled landing
  and steps, red-brown herringbone pavers.
- **Jet:** an Aermacchi MB-339 in green and tan with tip tanks, the Ghana flag on its fin and yellow stands under the
  wings, nose east. The fence is chain-link with a green welded-mesh gate on the front.
- **Car park:** about a fifth full, as in the satellite.
- **Bush:** a dense, instanced bush belt behind the school and along Annie Jiagge Road.
