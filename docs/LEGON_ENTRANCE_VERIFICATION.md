# Legon entrance verification

Evidence-verified destination entrances for LEGONRUSH. This replaces geometric guesses ("nearest road",
"nearest frontage") for the priority destinations with entrances checked against evidence, and marks
every destination where the evidence is missing as **UNVERIFIED** instead of guessing.

Data: `data/geography/registry/access.json` (curated entries, evidence, references) →
`data/geography/legon-access.geojson` (built by `scripts/geography/build-access.mjs`, status per destination) →
`src/data/legon-map.json` (game). The master geography (`data/geography/legon-master.geojson`) was not changed.

## How entrances were verified

1. **Reference material supplied by the project owner** (`UG_BUILDINGS__LAYOUTS_AND_THEIR_STRUCTURES.zip`,
   42 labelled layouts and entrance photos, and the two-sheet satellite campus atlas).
2. **Georeferencing.** Each north-up layout image and each atlas sheet was registered to the game frame by
   matching its terracotta roofs to the OSM building footprints (scale + translation search, normalised
   overlap). The registrations line up OSM outlines with the imagery to within a few metres (correlation
   1.4–3.5 for the layouts, ~0.7 for the atlas core). This turns a photo-backed observation ("the arch in the
   north block", "the porch by the round stair tower") into a game-frame coordinate.
3. **Entrance photos** were matched to features visible in the registered layouts (forecourt paving,
   drop-off loops, car parks, gatehouse arches, stair towers).
4. **Written sources**: University of Ghana campus text, the Radio Univers Level-100 guide, UG gate
   directives, business listings (Legon Hall Porters Lodge on J. B. Danquah Road).
5. **OpenStreetMap** geometry: footways and drives that reach a door, drop-off loops, named car parks
   ("Sey frontage", "Banking Square Parking"), `entrance=*` nodes.

Every curated entrance is an OSM node, a point measured on registered imagery and snapped onto the named
footprint, or a footprint side fixed by a mapped axis/direction. Where the walk from the road to the door
crosses a forecourt or courtyard, the registry gives the **access path** (waypoints), so the sequence is
BUILDING → ENTRANCE → FORECOURT → ACCESS PATH → ARRIVAL POINT (road/path) → ROUTE.

### Status and confidence

| Status | Meaning | Confidence |
| --- | --- | --- |
| verified | the entrance itself is shown by a photo/layout or stated in writing, and tied to mapped geometry | high |
| partial | evidence fixes the side / approach (forecourt, car park, drop-off loop) but not the exact door | medium |
| unverified | priority destination with no usable evidence: the previous automatic result is kept and listed below | low, or medium where OSM maps an access road into the grounds |
| mapped / inferred | non-priority destinations: OSM access way (mapped, medium) or nearest frontage (inferred, low) | unchanged |

`npm run test:routes` fails if a priority destination is left as mapped/inferred, if a verified entrance is
not high confidence, or if any non-verified, non-mapped entrance claims high confidence.

**Priority destinations: 46 — verified 21, partial 14, unverified 11.** (The four Diaspora halls moved from partial to verified with the owner's photos; ISH 1 moved to verified and ISH 2 was added with the owner's marked layout; the banking square's banks were added with the owner's labelled aerial and photos; the School of Law and Vikings Hostel were verified with the owner's photos; see below.)

## Entrance verification table (BEFORE → AFTER)

Coordinates are game-frame metres (x east, z south of the datum 5.6518 N, 0.1871 W); `/geo/` → *Destination entrances* shows each one over the atlas.

| Destination | Current (before) entrance | Before confidence | Verified entrance (after) | Approach road / path | Arrival point | Status · confidence | Moved |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Legon Main Entrance | curated at (660, 113), arriving on Dr. J.B. Danquah Avenue | high | campus gate at (660, 113) | Dr. J.B. Danquah Avenue | (660, 113), facing 359° | **verified** · high | 0 m |
| The Balme Library | curated at (7, 7), arriving on service | medium | public entrance at (7, 7) | service | (7, 38), facing 359° | **verified** · high | 0 m |
| Great Hall | curated at (-1027, 128), arriving on service | medium | public entrance at (-993, 127) | service via forecourt path | (-889, 127), facing 328° | **verified** · high | 34 m |
| University Square | curated at (9, 61), arriving on footway | medium | public open space at (8, 52) | footway | (8, 58), facing 0° | **partial** · medium | 9 m |
| Balme Library Fountain | frontage at (14, 95), arriving on footway | low | public open space at (8, 61) | footway | (8, 58), facing 180° | **partial** · medium | 35 m |
| University of Ghana Registry | frontage at (-913, 184), arriving on service | low | public entrance at (-922, 184) | service | (-913, 202), facing 329° | **partial** · medium | 9 m |
| Kuffour Quadrangle | frontage at (-11, -142), arriving on footway | low | public open space at (6, -107) | footway | (6, -104), facing 0° | **partial** · medium | 39 m |
| University of Ghana banking square | partial: (157, 975), arriving on service | medium | public entrance at (160, 975) | service | (160, 961), facing 180° | **verified** · high | 3 m |
| Consolidated Bank Ghana (near Night Market) | mapped point north of the compound (on the road) | medium | public entrance at (134, 1020) | service | (132, 1026), facing 360° | **verified** · high | — |
| First Bank Ghana (Banking Square) | not on the map | — | public entrance at (160, 1020) | service | (160, 1026), facing 360° | **partial** · medium | — |
| Stanbic Bank | inferred frontage at the compound's south-east corner | low | public entrance at (181, 990) | service | (192, 989), facing 269° | **partial** · medium | — |
| Ecobank (near Night Market) | mapped OSM entrance in the east notch | high | public entrance at (242, 1018) | service | (240, 1004), facing 174° | **verified** · high | — |
| Union Building (Banking Square) | not on the map | — | public entrance at (257, 1026) | service | (260, 1026), facing 342° | **partial** · medium | — |
| Night Market | frontage at (126, 1034), arriving on Jubilee Link | low | public entrance at (167, 1034) | service | (167, 1026), facing 180° | **partial** · medium | 41 m |
| Legon Hall | area-entry at (-14, 189), arriving on footway | medium | hall entrance at (-147, 157) | Dr. J.B. Danquah Avenue | (-145, 137), facing 187° | **verified** · high | 137 m |
| Commonwealth Hall | curated at (-485, 118), arriving on service | medium | hall entrance at (-485, 118) | service | (-475, 118), facing 270° | **partial** · medium | 0 m |
| Akuafo Hall Main | area-entry at (204, 224), arriving on service | medium | hall entrance at (160, 156) | footway | (160, 146), facing 176° | **verified** · high | 81 m |
| Mensah Sarbah Hall | curated at (11, 609), arriving on service | medium | hall entrance (porters' lodge) at (11, 609) | service | (5, 598), facing 153° | **verified** · high | 0 m |
| Volta Hall | frontage at (-259, -4), arriving on service | low | hall entrance at (-259, 0) | service | (-248, 0), facing 266° | **partial** · medium | 4 m |
| Elizabeth Frances Sey Hall | partial: (-66, 1770), arriving on service | medium | hall entrance at (-64, 1774), back entrance at (4, 1734) | service | (-93, 1789), facing 61° | **verified** · high | 4 m |
| Alexander Kwapong Hall | partial: (180, 1621), arriving on service | medium | hall entrance at (186, 1631), back entrance at (117, 1670) | service | (210, 1616), facing 240° | **verified** · high | 11 m |
| Dr. Hilla Limann Hall | partial: (243, 1612), arriving on service | medium | hall entrance at (238, 1602), back entrance at (306, 1563) | service | (211, 1618), facing 60° | **verified** · high | 11 m |
| Jean Nelson Aka Hall | partial: (-116, 1803), arriving on service | medium | hall entrance at (-118, 1800), back entrance at (-186, 1840) | service | (-94, 1787), facing 241° | **verified** · high | 3 m |
| Pentagon Block A | frontage at (505, -612), arriving on Annie Jiagge Road | low | inferred frontage at (505, -612) | Annie Jiagge Road | (500, -612), facing 91° | **unverified** · low | 0 m |
| Jubilee Hall | verified: (134, 1301), arriving on Diaspora Path | high | hall entrance at (137, 1293) | footway via the portico | (162, 1288), facing 253° | **verified** · high | 8 m |
| School of Engineering Sciences | frontage at (458, -380), arriving on service | low | public entrance at (453, -380) | service | (453, -377), facing 358° | **verified** · high | 5 m |
| University of Ghana Business School | frontage at (-141, -132), arriving on service | low | public entrance at (-150, -132) | service | (-150, -137), facing 178° | **partial** · medium | 9 m |
| Institute of Africa Studies | frontage at (557, 79), arriving on service | low | inferred frontage at (557, 79) | service | (546, 80), facing 88° | **unverified** · low | 0 m |
| Jones Quartey Building, JQB | frontage at (593, -82), arriving on service | low | public entrance at (569, -29) | footway | (589, -21), facing 287° | **verified** · high | 58 m |
| K. A. Busia Building, KAB | frontage at (478, -130), arriving on Annie Jiagge Road | low | inferred frontage at (478, -130) | Annie Jiagge Road | (510, -131), facing 270° | **unverified** · low | 0 m |
| School of Law | partial: (469, -267), arriving on service | medium | public entrance at (441, -243) | service via the courtyard | (486, -243), facing 270° | **verified** · high | 37 m |
| Vikings Hostel | inferred frontage at (189, 816) (east end), arriving on service | low | hall entrance at (161, 841), second door at (152, 843) | service (car park) | (162, 848), facing 0° | **verified** · high | 39 m |
| N Block | frontage at (-34, -311), arriving on service | low | inferred frontage at (-34, -311) | service | (-44, -310), facing 90° | **unverified** · low | 0 m |
| University of Ghana Sports Stadium | frontage at (853, 1381), arriving on service | low | public entrance at (701, 1412) | service | (679, 1412), facing 90° | **partial** · medium | 155 m |
| Athletic Oval | frontage at (52, 355), arriving on service | low | public open space at (6, 489) | residential | (6, 503), facing 0° | **partial** · medium | 142 m |
| University of Ghana Botanical Gardens | osm-entrance at (-85, -1696), arriving on service | high | public entrance at (-85, -1696) | service | (-85, -1696), facing 180° | **verified** · high | 0 m |
| Vaughan Dam | frontage at (-145, -1572), arriving on path | low | inferred frontage at (-145, -1572) | path | (-147, -1575), facing 144° | **unverified** · low | 0 m |
| International Students Hostel 1, ISH 1 | partial: (210, 1307), arriving on service | medium | hall entrance at (214, 1305) | service | (212, 1296), facing 160° | **verified** · high | 5 m |
| International Students Hostel 2, ISH 2 | inferred frontage at (74, 1121) (NW corner), arriving on service | low | hall entrance at (127, 1155) | service | (143, 1167), facing 305° | **verified** · high | 63 m |
| Valco Trust Hostel Phase 1 | frontage at (63, 771), arriving on service | low | inferred frontage at (63, 771) | service | (64, 761), facing 173° | **unverified** · low | 0 m |
| Bani Hostel | area-entry at (816, -1240), arriving on service | medium | vehicle at (816, -1240) | service | (816, -1240), facing 180° | **unverified** · medium | 0 m |
| Evandy Hostel | frontage at (556, -1266), arriving on service | low | inferred frontage at (556, -1266) | service | (553, -1275), facing 173° | **unverified** · low | 0 m |
| James Topp Nelson Yankah Hall | area-entry at (509, -1593), arriving on service | medium | vehicle at (509, -1593) | service | (509, -1593), facing 180° | **unverified** · medium | 0 m |
| University of Ghana Hospital | area-entry at (1063, 94), arriving on service | medium | vehicle at (1063, 94) | service | (1063, 94), facing 180° | **unverified** · medium | 0 m |
| University of Ghana Medical Center Limited | area-entry at (87, 1966), arriving on service | medium | vehicle at (87, 1966) | service | (87, 1966), facing 90° | **unverified** · medium | 0 m |
| Central Cafeteria, CC | frontage at (-26, 553), arriving on service | low | public entrance at (2, 553) | residential | (2, 564), facing 0° | **partial** · medium | 28 m |

## Evidence and reason for each correction

### Legon Main Entrance — VERIFIED

- **Entrance:** campus gate; From the N4 (J.J. Rawlings Avenue) turn west into Dr. J.B. Danquah Avenue and pass the inbound lift gate at the gatehouse.
- **Evidence:** UG security directive: 'the Main gate (opposite the Legon Police Station)'; OSM permit lift gates at the gatehouse on the inbound carriageway; reference atlas shows the gatehouse straddling the avenue.
- **References:** atlas sheet 2
- **Correction:** confirmed (no move).

### The Balme Library — VERIFIED

- **Entrance:** public entrance; Along the avenue to the fountain roundabout, then north up the forecourt lanes to the library's south front.
- **Evidence:** UG: the fountain on the University Square 'overlooking the Balme Library'. Reference atlas (sheet 2): a paved forecourt runs on the fountain axis from the roundabout to the library's south facade; OSM forecourt lanes (ways 448104199, 448104193) frame it. The north side faces the Kuffour Quadrangle gardens.
- **References:** atlas sheet 2
- **Correction:** confirmed (no move).

### Great Hall — VERIFIED

- **Entrance:** public entrance; Up Legon Hill on the axial road from the east, stop at its turning loop, then cross the Convocation courtyard west to the hall's east front.
- **Evidence:** great_hall_and_directorate_4: the public front is the gable end with three doors at the end of a long paved courtyard with lawn panels between low flanking wings, the tower beside it. great_hall_and_directorate_3: the opposite (west) end is the curved, terraced end above the loop road. Reference atlas sheet 2: the paved courtyard lies east of the hall, between it and the axial road loop (OSM way 424526319). Previous entrance (west side, at the turning circles) was the back of the hall.
- **References:** `great_hall_and_directorate_2_labeled.png`, `great_hall_and_directorate_3_labeled.png`, `great_hall_and_directorate_4_labeled.png`, atlas sheet 2
- **Access path:** arrival → (-896,115) → (-920,115) → (-932,133) → (-985,133) → entrance
- **Stop:** outside the building
- **Secondary:** west turning circles (service / back of the hall) (vehicle): OSM turning circles on the summit loop at the curved west end
- **Correction:** moved 34 m from the previous curated entrance (medium confidence).

### University Square — PARTIAL

- **Entrance:** public open space; Ride onto the square's paths and stop in the middle of the square, between the library front and the fountain.
- **Evidence:** UG text: 'mid-way [along the avenue] is an open space, the University Square, with an ornamental fountain'. The square's outline is derived from the lanes that bound it (no source maps it).
- **References:** atlas sheet 2
- **Stop:** inside the open space
- **Correction:** moved 9 m from the previous curated entrance (medium confidence).

### Balme Library Fountain — PARTIAL

- **Entrance:** public open space; Viewed and reached from the University Square's south edge; the fountain sits on the avenue roundabout island.
- **Evidence:** OSM fountain polygon (way 320067568) inside the avenue roundabout; the square lies directly north of it.
- **References:** atlas sheet 2
- **Correction:** moved 35 m from the previous frontage entrance (low confidence).

### University of Ghana Registry — PARTIAL

- **Entrance:** public entrance; Up Legon Hill to the service road south of the Convocation Group and its car park.
- **Evidence:** OSM 'University of Ghana Registry' node lies inside this building (OSM names it 'Cash office'); Apple's 'University of Ghana Registry' label in reference atlas sheet 2 sits on the same block; OSM car park (way 720486435) and service road (way 720486437) adjoin its south side. Exact door not visible.
- **References:** atlas sheet 2
- **Correction:** moved 9 m from the previous frontage entrance (low confidence).

### Kuffour Quadrangle — PARTIAL

- **Entrance:** public open space; Behind (north of) the Balme Library; enter the formal garden from its south edge on the central path.
- **Evidence:** Radio Univers: 'Balme Library Gardens / Kuffuor Quadrangle', behind the library. Atlas sheet 2 shows the symmetric formal garden with its central axis aligned on the library.
- **References:** atlas sheet 2
- **Correction:** moved 39 m from the previous frontage entrance (low confidence).

### The banking square — VERIFIED / PARTIAL

The owner's labelled aerial (banks C, F and S circled, the ATM bay, the car-park entrance) was registered to the OSM
footprints by roof colour (4.2 px/m, 1° rotation); the compound, the star-shaped Union Building and the ADB block
land on their roofs, so the labels became map positions. Bank places were moved into the wings the owner labels
(registry landmarks with measured points; First Bank Ghana and the Union Building were added).

- **University of Ghana banking square — VERIFIED.** The big entrance to the courtyard car park in the middle of
  the compound's north wing (owner: the section marked in red), from the road along the north side.
- **Consolidated Bank Ghana (CBG) — VERIFIED.** The west wing (C); the door on the south side with steps, red
  pillars, a canopy sign and flags (owner photo), facing the way in from the Diaspora halls and the Night Market.
- **First Bank Ghana — PARTIAL.** The south wing (F); the door's side (south, on CBG's frontage) is inferred.
- **Stanbic Bank — PARTIAL.** The north-east part of the compound (S); the door's side (east, under the veranda,
  facing the road and its parking bays) is inferred.
- **Ecobank — VERIFIED.** The notch between the Union Building's two north wings (the owner's marked close-up);
  previously the OSM entrance node in the east notch.
- **Union Building — PARTIAL.** The east notch (OSM entrance node), matching the owner's photo of the entrance with
  the ALUMNI BUILDING sign beside the Ecobank-blue wing; the photo's angle cannot be fixed on the map.
- **Not marked:** ADB and HFC (now Republic Bank) keep their previous entrances; Prudential, Access Bank, CalBank
  and UMB, which other sources place in the compound, are unchanged.

### Night Market — PARTIAL

- **Entrance:** public entrance; From the Banking Square side, into the north end of the stall rows.
- **Evidence:** Reference atlas sheet 1: the market is the angled rows of stall sheds south of the bank courtyard (OSM food court way 773864855); the rows open toward the Banking Square car park at their north end.
- **References:** atlas sheet 1, `banking_square_layout_labeled.png`
- **Correction:** moved 41 m from the previous frontage entrance (low confidence).

### Legon Hall — VERIFIED

- **Entrance:** hall entrance; Along the avenue's southern carriageway, turn into the paved forecourt on the hall's axis and stop at the north front.
- **Evidence:** Business listings place the Legon Hall Porters Lodge on J. B. Danquah Road (the avenue). legon_hall_layout (registered to OSM): the hall's spine footway (OSM 1186587902/614159986) runs north to this block; atlas sheet 2 shows a paved forecourt from the avenue to its north face. legon_hall_entrance photo: arched front with a paved forecourt. Note: Apple's 'Legon Hall' pin sits on OSM 'Maison Francais' to the east, which is a different building.
- **References:** `legon_hall_layout_labeled.png`, `legon_hall_entrance_labeled.png`, atlas sheet 2
- **Stop:** outside the building
- **Secondary:** Legon Hall Southern Gate (pedestrian): Apple label 'Legon Hall Southern Gate' in legon_hall_layout
- **Correction:** moved 137 m from the previous area-entry entrance (medium confidence).

### Commonwealth Hall — PARTIAL

- **Entrance:** hall entrance; Up the avenue to its western end at the hall.
- **Evidence:** UG: 'the University Avenue extends to Commonwealth Hall on Legon Hill'. commonwealth_hall_entrance_1-3: a porch at the top of wide steps from a drive where cars park. The oblique layout photos are not north-up, so which end they show cannot be fixed; the east end on the avenue axis is kept.
- **References:** `commonwealth_hall_entrance_1_labeled.png`, `commonwealth_hall_entrance_2_labeled.png`, `commonwealth_hall_entrance_3_labeled.png`, `commonwealth_hall_building_layout_1_labeled.png`, `commonwealth_hall_building_layout_2_labeled.png`
- **Correction:** confirmed (no move).

### Akuafo Hall Main — VERIFIED

- **Entrance:** hall entrance; Off the avenue's southern carriageway onto the forecourt footway, to the arched gatehouse that leads into the fountain court.
- **Evidence:** akuafo_hall_layout (registered to OSM): the forecourt footway (OSM 606687250 / 603522802) leaves the avenue and passes through the arch of this north block into the circular fountain court; akuafo_hall_entrance: stone-paved forecourt with curved paths and circular planters at the entrance. Previous entrance was an inferred point on the service road east of the hall.
- **References:** `akuafo_hall_layout_labeled.png`, `akuafo_hall_entrance_labeled.png`, atlas sheet 2
- **Stop:** outside the building
- **Correction:** moved 81 m from the previous area-entry entrance (medium confidence).

### Mensah Sarbah Hall — VERIFIED

- **Entrance:** hall entrance (porters' lodge); Along Mensah Sarbah Crescent into the semicircular drive in front of the porters' lodge archway.
- **Evidence:** mensah_sarbah_hall_main_2 (aerial): the gate building with its central archway faces a semicircular drive; mensah_sarbah_hall_layout (registered): that drive is OSM way 1540994843 and the gate building is OSM 'Administration and Porters' Lodge' (way 300288063). The large block with the cupola in main_1/main_3 is across the courtyard (the dining hall), not the entrance.
- **References:** `mensah_sarbah_hall_layout_labeled.png`, `mensah_sarbah_hall_main_1_labeled.png`, `mensah_sarbah_hall_main_2_labeled.png`, `mensah_sarbah_hall_main_3_labeled.png`
- **Stop:** outside the building
- **Correction:** confirmed (no move).

### Volta Hall — PARTIAL

- **Entrance:** hall entrance; Along Volta Hall Road into the semicircular drop-off loop in front of the east wing.
- **Evidence:** volta_hall_layout (registered to OSM): OSM maps a semicircular drop-off loop (way 1535119978) off Volta Hall Road directly in front of the east wing; volta_hall_entrance: an arched doorway at the top of a flight of steps up from a drive. The photo cannot be tied to the loop with certainty.
- **References:** `volta_hall_layout_labeled.png`, `volta_hall_entrance_labeled.png`
- **Correction:** moved 4 m from the previous frontage entrance (low confidence).

### The Diaspora halls (Dr. Hilla Limann, Alexander Kwapong, Elizabeth Frances Sey, Jean Nelson Aka) — VERIFIED

- **Entrances:** front entrance in the middle of the long facade that faces the partner hall (Limann ⇄ Kwapong,
  Sey ⇄ Jean Nelson Aka), arriving on the service road between their car parks; **back entrance** in the
  middle of the opposite facade (shown on `/geo/` as BACK / SECONDARY ENTRANCE; not routed to).
- **Evidence:** the owner: the four halls are one design built in facing pairs; each pair's front entrances face
  each other with car parks in front; Limann is the first hall on the way in and faces Kwapong; every hall also
  has a back entrance without a car park. Owner photos (an aerial of all four halls, a drone view of one hall's
  front and courtyard, two oblique drone views, a close view of the entrance): the entrance is the projecting
  gabled pavilion at the centre of each long facade, the fronts of a pair sit on one axis with a walkway across
  the car parks. Atlas sheet 1 shows the shared car parks (OSM ways 758589789-792, 765261438, 765261442).
- **Registry:** `entrance: { faces: <partner> }` and `secondary: [{ awayFrom: <partner> }]`, resolved by
  `scripts/geography/build-access.mjs` to the middle of the matching footprint side (no hand-placed points).
- **Correction:** the doors moved to the centre of the facade (3-11 m along the facade from the previous
  axis-based points). The two OSM "car parks" behind Limann (way 765262747) and Kwapong (way 765261445) are now
  paved forecourts (`registry/corrections.json → reclass`), so no parked cars stand at the back entrances.
- **Tests:** `npm run test:routes` checks the front door is the middle of the facade facing the partner, the
  back door the middle of the opposite facade, the pairs face each other, and rides Limann ⇄ Kwapong and
  JNA ⇄ Sey door to door.

### Pentagon Block A — UNVERIFIED

- **UNVERIFIED.** No reference image, written source or mapped access identifies this entrance. The previous automatic result is kept: frontage at (505, -612), arriving on Annie Jiagge Road, confidence low. It needs a photo or site check.

### Jubilee Hall — VERIFIED

- **Entrance:** hall entrance in the re-entrant corner at the south-east end (the notch in OSM relation 3697984), reached from the car park east of the hall through the portico beside the round white tower.
- **Evidence:** the owner's satellite layout of Jubilee, ISH 1 and ISH 2 with the entrances and car parks marked, registered to the OSM footprints by roof colour (2.8 px/m, 1° rotation; the ISH outlines land on their roofs): the Jubilee mark is in that corner. The owner's aerial photo shows the entrance block there (portico, round tower, flat roof with water tanks); jubilee_hall_4 and the earlier layout agree.
- **References:** owner's marked layout, owner's aerial and courtyard photos, `jubilee_hall_4_labeled.png`, `jubilee_hall_layout_labeled.png`
- **Correction:** the door moved 8 m into the corner from the previous point on the notch edge.

### School of Engineering Sciences — VERIFIED

- **Entrance:** public entrance; Up the straight access road from the south that ends at the school's forecourt.
- **Evidence:** engineering_school_layout (registered to OSM): a straight access road from the south ends at a paved forecourt in front of the south block, where Apple pins 'School of Engineering Sciences'; the car park is to the west.
- **References:** `engineering_school_layout_labeled.png`
- **Correction:** moved 5 m from the previous frontage entrance (low confidence).

### University of Ghana Business School — PARTIAL

- **Entrance:** public entrance; From the road north of the school, through its car park to the covered walkway along the north front.
- **Evidence:** business_school_layout (registered to OSM): the car park and access road lie along the north side, with a covered walkway on the north facade. Door not visible.
- **References:** `business_school_layout_labeled.png`
- **Correction:** moved 9 m from the previous frontage entrance (low confidence).

### Institute of Africa Studies — UNVERIFIED

- **UNVERIFIED.** No reference image, written source or mapped access identifies this entrance. The previous automatic result is kept: frontage at (557, 79), arriving on service, confidence low. It needs a photo or site check.

### Jones Quartey Building, JQB — VERIFIED

- **Entrance:** public entrance; From the avenue side by the footpaths that converge on the building's south front.
- **Evidence:** Radio Univers: JQB is 'close to the Main Entrance ... behind the Institute of African Studies, on your right side when coming from the main gate'. Atlas sheet 2 + OSM: the footpaths from the avenue side converge on the south face. Previous entrance was an inferred point at the north-east corner (the back).
- **References:** atlas sheet 2
- **Correction:** moved 58 m from the previous frontage entrance (low confidence).

### K. A. Busia Building, KAB — UNVERIFIED

- **UNVERIFIED.** No reference image, written source or mapped access identifies this entrance. The previous automatic result is kept: frontage at (478, -130), arriving on Annie Jiagge Road, confidence low. It needs a photo or site check.

### School of Law — VERIFIED

- **Entrance:** the glass doors at the foot of the round entrance building (the LAW crest above them), up wide steps from the paved courtyard, which opens to the road on the east.
- **Evidence:** the owner's two photos of the entrance (doors marked): the rotunda with the long four-storey block to its right and the tiled south block to its left. The law_school_layout photo, registered to Google Open Buildings' footprint (2 px/m), places the rotunda at the west end of the long block facing the courtyard.
- **Geometry correction:** the OSM outline of the School of Law sat about 10 m north-west of the building (Google's footprint overlapped it by 13%); it is replaced by Google's footprint, which matches the layout photo (`corrections.json → reshape`). The south block was shifted the same way.
- **Correction:** the door moved 37 m, from the east end of the old outline to the rotunda; status partial → verified.

### Vikings Hostel — VERIFIED

- **Entrance:** the single-storey VIKINGS HOSTEL block in the inner corner of the L, facing the car park on the south; a **second door** at the foot of the long wing's south end (shown on `/geo/`, not routed to).
- **Evidence:** the owner's front photo (the big entrance area and its door, and the second door, marked) and aerial (both marked): the entrance block lies south of the east wing and east of the long wing, as OSM maps it.
- **Correction:** moved 39 m from an inferred frontage at the east end of the east wing.

### N Block — UNVERIFIED

- **UNVERIFIED.** No reference image, written source or mapped access identifies this entrance. The previous automatic result is kept: frontage at (-34, -311), arriving on service, confidence low. It needs a photo or site check.

### University of Ghana Sports Stadium — PARTIAL

- **Entrance:** public entrance; From the road west of the stadium to the main (west) grandstand.
- **Evidence:** Atlas sheet 1: the covered main grandstand is on the west side of the bowl, facing the road and the gym centre. Spectator gates are not mapped.
- **References:** atlas sheet 1
- **Correction:** moved 155 m from the previous frontage entrance (low confidence).

### Athletic Oval — PARTIAL

- **Entrance:** public open space; From the road along the south side, facing the Central Cafeteria.
- **Evidence:** athletic_oval_labeled: paths enter the oval at its south end; Radio Univers: the CC is 'opposite Athletic Oval' (CC lies to the south).
- **References:** `athletic_oval_labeled.png`
- **Correction:** moved 142 m from the previous frontage entrance (low confidence).

### University of Ghana Botanical Gardens — VERIFIED

- **Entrance:** public entrance; From the Haatso-Atomic road side into the gardens' main entrance.
- **Evidence:** OSM entrance=main (node 2248903579) on the gardens' boundary; Visit Ghana: the gardens are 'off Atomic Haatso Main Road at Agbogba Junction'.
- **Correction:** confirmed (no move).

### Vaughan Dam — UNVERIFIED

- **UNVERIFIED.** No reference image, written source or mapped access identifies this entrance. The previous automatic result is kept: frontage at (-145, -1572), arriving on path, confidence low. It needs a photo or site check.

### International Students Hostel 1, ISH 1 — VERIFIED

- **Entrance:** the small gabled porch on the north facade, a little east of the middle, facing the car park shared with Jubilee Hall.
- **Evidence:** the owner's marked layout (registered as above) puts the entrance on ISH 1's north facade at 5.7 m east of its middle; the owner's photo of the hostel shows the gabled porch a little off-centre on the long four-storey facade behind the car park.
- **References:** owner's marked layout, owner's ISH photo, `international_students_hostel_2_labeled.png`
- **Correction:** moved 2 m along the facade; status partial → verified.

### International Students Hostel 2, ISH 2 — VERIFIED

- **Entrance:** a flat canopy on the south facade, east of the middle, at the corner of the car park between ISH 2 and Jubilee Hall.
- **Evidence:** the owner's marked layout (registered as above): the ISH 2 mark is on its south facade 7 m east of the middle. The owner: ISH 2 has the same structure as ISH 1. `international_students_hostel_1_labeled.png` shows the balconied facade with the flat entrance canopy and a car park in front.
- **References:** owner's marked layout, `international_students_hostel_1_labeled.png`
- **Correction:** new curated entry (added to the priority list); previously an inferred frontage at the hostel's north-west corner, 63 m away on the other side of the building.

### Valco Trust Hostel Phase 1 — UNVERIFIED

- **UNVERIFIED.** No reference image, written source or mapped access identifies this entrance. The previous automatic result is kept: frontage at (63, 771), arriving on service, confidence low. It needs a photo or site check.

### Bani Hostel — UNVERIFIED

- **UNVERIFIED.** No reference image, written source or mapped access identifies this entrance. The previous automatic result is kept: area-entry at (816, -1240), arriving on service, confidence medium. It needs a photo or site check.

### Evandy Hostel — UNVERIFIED

- **UNVERIFIED.** No reference image, written source or mapped access identifies this entrance. The previous automatic result is kept: frontage at (556, -1266), arriving on service, confidence low. It needs a photo or site check.

### James Topp Nelson Yankah Hall — UNVERIFIED

- **UNVERIFIED.** No reference image, written source or mapped access identifies this entrance. The previous automatic result is kept: area-entry at (509, -1593), arriving on service, confidence medium. It needs a photo or site check.

### University of Ghana Hospital — UNVERIFIED

- **UNVERIFIED.** No reference image, written source or mapped access identifies this entrance. The previous automatic result is kept: area-entry at (1063, 94), arriving on service, confidence medium. It needs a photo or site check.

### University of Ghana Medical Center Limited — UNVERIFIED

- **UNVERIFIED.** No reference image, written source or mapped access identifies this entrance. The previous automatic result is kept: area-entry at (87, 1966), arriving on service, confidence medium. It needs a photo or site check.

### Central Cafeteria, CC — PARTIAL

- **Entrance:** public entrance; From the road between the CC and Mensah Sarbah Hall.
- **Evidence:** Radio Univers: CC is 'right in front of Mensah Sarbah Hall and opposite Athletic Oval' (Sarbah lies south). Door not visible.
- **References:** atlas sheet 2
- **Correction:** moved 28 m from the previous frontage entrance (low confidence).

## Unverified destinations (please check)

| Destination | What is missing | Kept for now |
| --- | --- | --- |
| Pentagon Block A | Which of the Pentagon blocks/receptions students enter; OSM has a "Pentagon GHL Admin Office" on Pent Road but no door. | frontage (low) |
| Institute of Africa Studies | No footprint in OSM (a UG Campus Map point only); the building and its door cannot be identified on the atlas. | frontage (low) |
| K. A. Busia Building, KAB | No reference; KAB faces a lawn opposite the Law school, door side unknown. | frontage (low) |
| N Block | No reference; several access paths reach it. | frontage (low) |
| Vaughan Dam | Which shore/path visitors use (canoe landing) is not documented. | frontage (low) |
| Valco Trust Hostel Phase 1 | The supplied Valco photo shows the entrance facing a car park, but cannot be tied to Phase 1 (north block) or Phase 2 (south block). | frontage (low) |
| Bani Hostel | OSM maps the access road into the grounds; the door is not identified. | area-entry (medium) |
| Evandy Hostel | No reference. | frontage (low) |
| James Topp Nelson Yankah Hall | OSM maps the access road into the grounds; the door is not identified. | area-entry (medium) |
| University of Ghana Hospital | Outside the atlas coverage; OSM maps the access road into the hospital grounds. | area-entry (medium) |
| University of Ghana Medical Center Limited | Outside the high-resolution atlas; OSM maps the access road into the grounds. | area-entry (medium) |

Campus gates (Main, North, Link, Okponglo/Stadium Road, South) are mapped barrier nodes on the roads
themselves and are named from UG's published gate directive (`registry/access.json → campusGates`);
the Evandy Gate is not mapped in OpenStreetMap.

## Route verification

Run with the game's own routing (`npm run test:routes`, and `/geo/` → Route tester). Ride mode shown.

| Route | Length | Leaves on | Arrives on | Turns | Rider faces at the stop | Expected approach |
| --- | --- | --- | --- | --- | --- | --- |
| Legon Main Entrance → University Square | 718 m | Dr. J.B. Danquah Avenue (verified) | footpath (partial) | 4 | N | In through the Main Gate and west along the avenue to the square at the fountain. |
| Mensah Sarbah Hall → Great Hall | 1234 m | lane (verified) | lane + forecourt path (verified) | 8 | NW | Out of the Sarbah porters' lodge drive, north to the avenue and up Legon Hill to the Convocation courtyard. |
| University of Ghana Business School → University Square | 380 m | lane (partial) | footpath (partial) | 6 | N | From the UGBS car park round to the square on the avenue. |
| Night Market → Legon Main Entrance | 1198 m | lane (partial) | Dr. J.B. Danquah Avenue (verified) | 8 | E | North from the market past the halls to the avenue and east to the Main Gate. |
| Legon Main Entrance → The Balme Library | 730 m | Dr. J.B. Danquah Avenue (verified) | lane (verified) | 4 | N | In through the Main Gate, west along the avenue, ending on the forecourt road in front of the library (south side, facing the fountain). |
| Legon Main Entrance → Great Hall | 1698 m | Dr. J.B. Danquah Avenue (verified) | lane + forecourt path (verified) | 6 | NW | The avenue west past the Balme fountain and Commonwealth Hall, up the axial road on Legon Hill to its loop, then on foot across the Convocation courtyard to the Great Hall's east front. |
| The Balme Library → University Square | 52 m | lane (verified) | footpath (partial) | 2 | N | Out of the library front straight onto the square: a few dozen metres. |
| University Square → Night Market | 1160 m | footpath (partial) | lane (partial) | 10 | S | South across the avenue past the halls to the market frontage on Jubilee Link. |
| Great Hall → University of Ghana banking square | 1738 m | lane (verified) | lane (partial) | 12 | S | Down Legon Hill and south to the Banking Square car park, arriving facing the banks. |
| School of Engineering Sciences → The Balme Library | 852 m | lane (verified) | lane (verified) | 9 | N | From the engineering school to the library front, not the road behind it. |
| Commonwealth Hall → Great Hall | 608 m | lane (partial) | lane + forecourt path (verified) | 6 | NW | From the hall up the axial road to the Convocation courtyard and the Great Hall's east front. |
| Akuafo Hall Main → Night Market | 1072 m | footpath (verified) | lane (partial) | 5 | S | Out of the Akuafo gatehouse forecourt onto the avenue, then south past Sarbah and Valco to the north end of the market. |
| University of Ghana Botanical Gardens → University Square | 2194 m | lane (verified) | footpath (partial) | 12 | N | Out of the gardens by their main entrance road, through the gardens on the paved drive, not the woodland trails. |
| Mensah Sarbah Hall → Central Cafeteria, CC | 50 m | lane (verified) | local road (partial) | 1 | N | From the Sarbah porters' lodge to the CC right in front of it. |
| Volta Hall → The Balme Library | 330 m | lane (partial) | lane (verified) | 6 | N | A short ride east to the library front. |
| Legon Main Entrance → University of Ghana Sports Stadium | 1742 m | Dr. J.B. Danquah Avenue (verified) | lane (partial) | 5 | E | Through campus to the stadium in the south-east. |
| International Students Hostel 1, ISH 1 → Night Market | 378 m | lane (partial) | lane (partial) | 2 | S | The hostel and the market are neighbours. |
| Elizabeth Frances Sey Hall → Jones Quartey Building, JQB | 2360 m | lane (partial) | footpath (verified) | 11 | NW | From the southern halls (leaving by the Sey frontage) north to JQB by the Main Gate. |

Every journey is also checked as walk and taxi: the start and end are within 3 m of the access points,
no ride, run-up or run-out passes through a building footprint (forecourt paths included), taxis never use
footpaths, and all 33 race / level / challenge routes are unchanged (`scripts/race-routes.json`).

## Visual inspection

`/geo/` (live: https://rudolphdeladem.github.io/legonrush-world/geo/):

- **Destination entrances** list: click a destination to see its footprint (pink), **ENTRANCE** (diamond,
  coloured by status), **ACCESS PATH** (dashed), **ARRIVAL** (green square with the approach arrow) and
  **DROP-OFF** (orange).
- **Route tester**: pick a representative route; the **ROUTE**, **START**, turns and the point where the
  **RIDER STOPS** (with the direction the rider faces) are drawn over the atlas imagery.

