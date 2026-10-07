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
| 3 | The banking square: bank compound (CBG, First Bank, Stanbic, ATMs), Union Building (Ecobank), ADB / HFC | `src/game/banking.ts` | owner's labelled aerial, owner photos (3) |

Shared pieces (facade runs, roofs, merged parts, signs) are in `src/game/modelkit.ts`; buildings made of rectangular blocks (steps 2 and 3) use the engine in `src/game/blocks.ts` (each site lists its specs; `src/game/sites.ts` collects them).

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
- **First Bank Ghana** (south wing, F): a door with a navy and gold FIRSTBANK canopy on the south side.
- **Stanbic** (north-east part, S): a door with a blue canopy on the east side under the veranda, and a Stanbic
  sign on the roof edge (the veranda roof hides the canopy from the road).
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

**Open points:** the First Bank and Stanbic door sides are inferred; the courtyard's parked cars are fixed props.
