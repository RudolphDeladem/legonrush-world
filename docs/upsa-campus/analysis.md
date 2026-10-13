# UPSA campus refinement: analysis of the owner's material (before building)

The owner sent, on 2026-10-13, for "the refinement of upsa campus", saying one more file will follow before the build:

1. An Apple Maps hybrid satellite screenshot, north up (`refs/aerial-apple-hybrid.jpg`), with the frame link
   `maps.apple.com/frame?map=hybrid&center=5.660922,-0.165763&span=0.004144,0.007137`.
2. `UPSA_Campus_Visual_Survey_Claude_Reference_Pack.zip` (in `docs/handover/uploads/`): a 14-page brief (PDF and DOCX),
   a Claude prompt, a source-link sheet, a frame index, five contact sheets of a 3 min 34 s DroneStories aerial video and a
   "not a map" cluster diagram.
3. `New folder (2).zip` (in `docs/handover/uploads/` as `UPSA_campus_photos_and_video_New_folder_2.zip`): 40 photos taken
   on campus (`photo_1` to `photo_40`, exported 2026-10-13 18:43), 31 web pictures, and a 50 s screen recording of an
   AeroVision drone post dated **2025-06-23** (`refs/aerovision-2025-06-23-sheet.jpg`, one frame every 2.5 s).

Labels as in the other audits: [VERIFIED] [DECISION] [ASSUMPTION] [INCOMPLETE] [PROPOSAL].

## What each source is good for

- [VERIFIED] **The Apple aerial** is north-up and sharp. It registers on the game map at **2.42 px/m, no rotation**:
  x = 2359.7 + (px − 805) / 2.42, z = −969.6 + (py − 700) / 2.42 (game metres, x east, z south). The anchors are the
  round Administration (osm:way/1009392440), the cross-shaped Joshua Alabi Library (game outline 3046), Justice Aryeetey
  (the two-courtyard block, 254) and KOKA (523). All four land on their outlines within a few metres
  (`refs/registration-overlay.jpg`: red = game buildings, yellow = areas, cyan = roads). The campus outline's west edge
  (x ≈ 2138) falls on the edge of the woodland. Its capture date is not shown. [ASSUMPTION] It is recent: the towers
  are complete and there is earthwork east of the Administration.
- [VERIFIED] **The AeroVision drone post (2025-06-23)** shows the campus after the towers were commissioned (Dec 2024):
  - the large central car park with buses;
  - KOKA's blue glass;
  - the Astro Turf with its covered stand and floodlights;
  - the PROFESSIONAL CHRISTIAN UNION BUILDING sign;
  - the Administration's drum with the blue-roofed wings.
  This is the current state.
- [VERIFIED] **The DroneStories video in the pack is older.** The towers are under scaffolding, so it predates Dec 2024,
  as the pack itself warns. It is useful for adjacency only. The pack's `frames/` folder (214 frames) was not in the
  zip; only the contact sheets are.
- [VERIFIED] **The owner's 40 photos** are ground level and current. They show:
  - the towers' frontage on IPS Road (paved sidewalk, white wall with navy piers and black railings, blue-glass corner;
    photos 1–5);
  - the white-tiled portal (6);
  - the tower car park (7, 12);
  - the CIMG building with its blue stair tower and the "…J.N. MARTEY" sign (13–15);
  - paver paths and the dish drains (16, 19, 20, 24);
  - the Ewuntoma Medical Centre with its canopy (18);
  - the fenced hard courts with the red surround and green courts (22, 23);
  - the Astro Turf's fence, grass bank, red track edge and floodlights (17, 26, 28, 29, 33, 35, 36);
  - the PCU building's long front with blue glass and dark angled columns (27, 28, 29);
  - KOKA from the car park (31, 32);
  - KOKA's corners and its blue-glass curve (37–40);
  - a six-storey cream block with an arched top bay (34).
- [VERIFIED] **The web pictures** show the named buildings in finished state: the towers with their name, the library,
  the Administration, KOKA and the fountain court, the Astro Turf from above (`11715413_upsapark`), and the courts
  (`images (28)`).
- [INCOMPLETE] **Official pages** (upsa.edu.gh, Google Maps/Earth, OSM) cannot be opened from this environment (blocked
  in earlier batches too). The storeys and names below come from the pack's own quotations of them.

## The campus, feature by feature (aerial registered; positions in game metres)

| # | Feature | Aerial position | Evidence | In the game now | Confidence |
|---|---|---|---|---|---|
| 1 | **Rev. J. K. Antwi Astro Turf** (500-seat; striped synthetic pitch, red track edge, fence, floodlights, covered stand on its west side) | x 2205–2279, z −1242..−1133 (pitch and surround) | aerial; AeroVision 17–25 s; photos 17, 26, 28, 29, 33, 35, 36; web `upsapark` | **missing**: five old outlines (23, 15, 39, 182, 87) stand where the pitch is | high (place and form) |
| 2 | **Hard courts** (red surround, green courts, fenced, one block of four) | x 2143–2188, z −1213..−1123 | aerial; photos 22, 23; web `images (28)` | two striped grass "pitches" (osm areas) roughly there | high |
| 3 | Building north of the courts (the "Western Union" pin) | x 2143–2176, z −1242..−1203 | aerial | generic outline 519/520 | medium (identity unknown) |
| 4 | **Professional Christian Union Building** (long front, blue-glass bay, dark angled columns, grey bands) | [ASSUMPTION] the long grey-roof block south of the pitch and courts, x 2149–2215, z −1115..−1098 | AeroVision 35–38 s (sign over the pitch's end); photos 27–29 (beyond the turf fence, paved walk) | generic red-roof block 521 | medium: the sign faces the pitch, and this is the only long block on the pitch's end |
| 5 | Courtyard complex with the red-roofed court, galleries and the "UPSA book shop" pin (U-05) | x 2139–2230, z −1098..−1005 | aerial; DroneStories 36–55 s | generic red-roof blocks 1988, 3044, 1986, 1987, 203 | high (form), low (names) |
| 6 | **Abednego F. O. Amartey Twin Towers** (two 10-storey blocks, bridges over five levels) | two tall blocks at x ≈ 2190–2258, z ≈ −997..−904. The aerial leans tall buildings, so the true footprints are smaller | aerial; photos 1–5, 7, 12; web `Twin-Towers`, `images (12)`, `(13)` | modelled on osm:way/885510985 (x 2220–2272, z −958..−943); the owner confirmed it in an earlier batch | identity high; footprint to recheck against the extra file |
| 7 | Hard court by the towers (red, with a blue court) | x 2145–2186, z −976..−953 | aerial | nothing | high |
| 8 | **Central quadrangle** ("We ♥ UPSA", fountain, walks) | x 2283–2374, z −1185..−1085 | aerial (dense trees), web `images (14)`, `(16)`, `(29)` | modelled; much sparser trees than the aerial | high |
| 9 | KOKA, Justice Aryeetey, Joshua Alabi Library, Central Administration, Main Entrance | as mapped | earlier batches; photos 6, 31, 32, 37–40 | modelled (batch 115) | high |
| 10 | Large central car parks (buses, rows of cars, tree islands) | x ≈ 2240–2330, z ≈ −1110..−945 | aerial; AeroVision 0–15 s | modelled as grey lots with cars | high |
| 11 | **Ewuntoma Medical Centre** (canopy front, white three-storey block) | [INCOMPLETE] not placed: UPSA puts it in the north-east, and photo 18 alone does not fix it | photo 18 | not named | low |
| 12 | **CIMG building** (white, blue stair tower, blue windows, four storeys) | [INCOMPLETE] not placed | photos 13–15 | not named | low |
| 13 | Six-storey cream block with an arched top bay (U-02); five-storey blue-and-white blocks | [INCOMPLETE] several candidates east and south of the quadrangle | photo 34; web `images (19)`, `(22)`, `(23)`, `(25)`, `(26)`, `(27)` | generic or modelled blocks | low |
| 14 | Woodland and bare red patches west of the campus wall | x < 2138 | aerial | flat lawn | high |
| 15 | Neighbourhood east and south (dense houses, small streets) | x > 2440, z > −900 | aerial | generic houses on the mapped outlines | as mapped |

## Main mismatches, in order of impact

1. [VERIFIED] **The Astro Turf is missing, and old buildings stand on its pitch.** These are outlines 23, 15, 39, 182 and
   87, and the generic houses built on them. This is the biggest error in the area.
2. [VERIFIED] **Most of the west half is generic two-storey red-roof houses.** That covers the PCU building, the
   courtyard complex and the blocks by the courts. The real campus there is white-and-blue, four to six storeys, with
   flat or low roofs (aerial; photos; AeroVision 27–38 s).
3. [VERIFIED] **The hard courts are striped grass.** In reality they are fenced red-and-green hard courts, the same in
   both places (#2, #7).
4. [VERIFIED] **The quadrangle and car parks are much barer than the aerial.** The aerial shows tree islands, shade
   trees and planted strips.
5. [VERIFIED] **The woodland west of the campus wall is lawn.**
6. [INCOMPLETE] **The towers' outline and the small blocks east of the quadrangle** need the extra file or a
   lean-corrected reading.

## Rules for the build (from the pack and the repository)

- [DECISION] The pack's rules hold, as they matched the earlier UPSA batches:
  - nothing is moved onto roads;
  - route geometry, ids, ghosts and records are untouched;
  - official storeys are used where quoted (towers 10, library 6, Justice Aryeetey 6, Student Centre 6); others are
    estimates;
  - names go only where a sign, label or official source supports them;
  - the old construction state is not modelled.
- **Push conflict, for the owner to settle.** The pack says not to push to `main` or deploy without explicit approval.
  The owner's standing rule in this repository is to push to the working branch and `main` after testing. The UPSA
  Hostel batch (110) followed the pack's rule and waited for the owner's word. The owner should say which applies here.

## Proposed order of work once the extra file arrives [PROPOSAL]

1. **Footprints.**
   - Remove the outlines on the pitch.
   - Add the Astro Turf: pitch, track edge, fence, floodlights and the covered stand.
   - Turn the two court areas into fenced hard courts.
   - Recheck the towers' footprint.
2. **Massing.**
   - The PCU building: long front, blue-glass bay, angled columns.
   - The courtyard complex: wings round open courts; the courtyards are kept open.
   - The other campus blocks: white and blue, four to six storeys as estimated, flat or low roofs instead of red-roof
     houses.
3. **Surfaces and planting.** Tree islands in the car parks, the quadrangle's trees, paver walks with dish drains, the
   grass banks by the pitch, the woodland west of the wall.
4. **Checks.** Routes and lengths unchanged; nothing solid on roads; multishot views against the aerial, the AeroVision
   frames and the photos.

## Questions for the owner

1. Which way does the push rule go for this brief: the working branch only, or `main` as usual?
2. The long block south of the pitch: is it the Professional Christian Union Building?
3. Where are the Ewuntoma Medical Centre and the CIMG building? A pin on the aerial would settle both.
4. Will the extra file carry building names or pins for the blocks east and south of the quadrangle?
