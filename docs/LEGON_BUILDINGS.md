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

Shared pieces (facade runs, roofs, merged parts, signs) are in `src/game/modelkit.ts`; buildings made of rectangular blocks (steps 2 to 6) use the engine in `src/game/blocks.ts` (each site lists its specs; `src/game/sites.ts` collects them).

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
