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
  such as the Diaspora halls), trees and palms (campus, gardens and the route's own; `src/game/solids.ts`), woods,
  water and banks too steep to ride stop it, forwards or backwards; it slides along an edge it meets at an angle.
  The chase camera follows.
- **Finish ride** ends the ride as arriving does.
