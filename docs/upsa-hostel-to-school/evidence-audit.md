# UPSA Hostel to the UPSA academic core: evidence audit

Phase 0–2 of the owner's master prompt *LEGONRUSH UPSA Hostel to Campus*, written before any game code was changed.
Game frame: x metres east, z metres south of (5.6518 N, 0.1871 W); x = (lng + 0.1871) × 110778.848,
z = (5.6518 − lat) × 110574. Positions come from mapped geometry (OpenStreetMap via Overture). The photographs only
set appearance and order. Nothing here is a survey.

## 1. Inventory

| Item | What it is | Read / viewed |
| --- | --- | --- |
| `LEGONRUSH_UPSA_Hostel_to_Campus_Master_Prompt.txt` | the task: Phase 0 intake, route rules, deliverables | read in full |
| `LEGONRUSH_UPSA_Hostel_to_Campus_Reconstruction_Pack_2.zip` (24 files) | `README_FIRST.md`, `CLAUDE_CODE_MASTER_PROMPT.txt` (same text as the upload), `ONLINE_SOURCES.md` (S1–S15), `REFERENCE_REGISTER.csv`, the brief `.docx` (byte-identical to Brief 1), `REFERENCE_IMAGES_CONTACT_SHEET.jpg`, `user_uploaded_streetview/RW01–RW15`, `current_game/` (2 diagnostic sheets, G01–G06), `generated_diagrams/route_sequence_not_to_scale.png` | every file opened; all 15 RW frames viewed one by one at full size (RW10/RW11 rooftop sign zoomed) |
| `…Hostel_to_UPSA_Campus_Reconstruction_Brief_1.docx` | the corridor, gate and campus brief | read in full (pandoc) |
| `…UPSA_Junction_Reconstruction_Brief_2.docx` | the GOIL / UGBS junction at x ≈ 970 (J01–J14, F01–F18, B01–B06, G01–G06) | read; its images viewed as contact sheets. This junction is west of the hostel and was rebuilt in an earlier batch (`docs/LEGON_BUILDINGS.md`, "The UPSA junction"). Its rule that the junction is not a roundabout applies to that junction and is unaffected by this route. |
| two contact sheets in the message (RW01–RW15) | the same 15 frames | compared with the originals |

Online (12 Oct 2026): openstreetmap.org, Overpass, commons.wikimedia.org and upsa.edu.gh are blocked from this
environment (403 / DNS), so S6, S7, S9–S15 could not be opened. Used instead:
- **Overture Maps release 2026-09-23.1** (anonymous S3), which republishes OpenStreetMap ways with their ids. Fetched
  by `scripts/geography/fetch_upsa_extension.py` into `data/geography/sources/upsa-extension.geojson`.
- **Web search summaries:**
  - Presidency of Ghana and GNA reports on the *Abednego F. O. Amartey Towers*: two blocks of 10 levels joined by a
    bridge, commissioned December 2024. GNA's [outgoing VC report](https://gna.org.gh/2024/10/outgoing-upsa-vc-recounts-achievements/).
  - The UPSA history and building-naming articles: Central Administration, lecture blocks, Joshua Alabi Library,
    Auditorium.

## 2. Source hierarchy

1. The mapped roads, walls and footprints (OSM via Overture, ids kept), for position.
2. The owner's Street View frames RW01–RW15, for order along the road, appearance and the signs read in them.
3. Written sources, for identity only (the towers' name and storeys; the gate's blue-and-white canopy, fascia and
   gatehouse from S5–S7 and S13 as summarised in Brief 1 and ONLINE_SOURCES).
4. Inference, marked as such.

## 3. Coverage finding

The UPSA campus (OSM way 309660062, "University of Professional Studies, Accra": x 2138–2453, z −1262..−894) lies
almost wholly outside the current map. The map keeps the legacy box plus everything within 150 m of the UG boundary,
and IPS Road stops at x 1963.6. The roundabout, the dual carriageway, the gate and the campus are all missing.

**Decision:**
- add a separate, provenance-tagged *UPSA extension*:
  - its own source file and fetch script;
  - its own context box (x 1950–2559, z −1376..−635);
  - source tag `osm-via-overture-upsa`;
  - its own route tests.
- Nothing in the Legon sources is moved, re-labelled or re-identified.
- Features already in the map keep their ids and geometry. The extension only adds what is missing.

## 4. The route, with provenance and confidence

| # | Leg | Geometry (game metres) | Source | Confidence |
| --- | --- | --- | --- | --- |
| 1 | **UPSA Hostel** (start): out of the central bay's door, across the grey-paved forecourt, through the gate | hostel osm:way/1217291474; door ≈ (1739.6, −805.4); gate on the hostel road at x 1731.2 | OSM outline; door from the existing model (owner's site brief IMG-03/04, R29/R30) | high (place), medium (door) |
| 2 | Frontage road east, south of the red-earth strip; IPS Road beyond it; PRESEC's wall, then the **blue panel hoarding** on the north side | frontage road osm:way/1499858648 (z −868) and the existing frontage line; IPS Road osm:way/515974988 (z −886) | OSM; RW01–RW06 (paver sidewalk and wall north, red earth south, poles, wires) | high (roads), medium (hoarding extent x 1845–2000: RW06, RW08, RW09) |
| 3 | Lattice tower in the strip; tyre stalls on the red earth | tower x 1893 (existing, inferred) | RW07, RW08 | medium |
| 4 | **Fork** at the tower: the link bears right (south-east) to Trinity Avenue; the ride keeps straight | link osm:way/1499858647 from (1916.9, −867.5) | OSM; RW08 | high |
| 5 | **Roundabout** at IPS Road / Trinity Avenue, a low kerbed island with a tree (counter-clockwise; in from the west at (1957.8, −867.5), out to the east at (1995.6, −867.8)) | ring osm:way/1491866764, /1491866766, /1491866767; centre ≈ (1976, −873), centreline radius ≈ 19 m | OSM ring; RW09 (curved island, tree, vendor clutter) | high (geometry), medium (island detail) |
| 6 | **Dual carriageway** east: eastbound south carriageway, grass median, westbound north carriageway | south osm:way/1492309154 (1995.6 → 2048.9, z −868..−877), then the IPS Road pieces to (2293.1, −881.5); north osm:way/515974987 (z −888); median 3.5–4 m | OSM; RW10, RW11 (grass median, open drain, red-earth verge south) | high |
| 7 | Roadside, north: the campus wall (osm:way/1009392392, x 2155–2278, z −902..−905), bushes, the **Abednego F. O. Amartey Towers** behind the Senior Members' Club House | towers on the Microsoft ML footprint x 2166–2196, z −963..−947, standing on the OSM pitch osm:way/1009392433, which they replaced | sign read in RW10/RW11; news (two 10-level blocks, a bridge); footprint ML | identity high, position medium-low |
| 8 | Roadside, south: Trinity Baptist Church / TBC Ghana and its forecourt; car-care and shop rows; Prestige Hostel (four storeys, paved apron, chained bollards); ATMs | Overture places: Trinity Baptist Church (2128, −830), TBC Ghana (2188, −872), prestige hostel (2197, −813), Paparelli's Pub (2224, −874), ATMs (2093, −858), (2159, −856); OSM footprints | RW12–RW14; Overture places | medium |
| 9 | **UPSA Main Gate**: wall gap x 2278–2300; the entrance road through a blue-and-white canopy with fascia, gatehouses and barrier | entrance road osm:way/1009392398 (2293.1, −881.5) → (2289.2, −924.5); canopy footprint osm:way/1009392399 (x 2279.8–2303.1, z −919.6..−906.5); walls osm:way/1009392392 / 1009392393; bus stop "UPS" osm:node/4988349723 at (2262, −891) | OSM; appearance from the sources' descriptions (photos not openable here) | high (position), medium-low (appearance) |
| 10 | Internal road north past AB Block, the car parks and the SRC area, east along z −1060, then north between the central quadrangle and the car-park strips | osm:way/358875195: (2289.2, −924.5) → (2277.9, −1000) → (2280.8, −1061.1) → (2363.4, −1060) → (2365.4, −1114.9) | OSM; places AB Block (2266, −948), UPSA SRC (2278, −1010), NB1 (2210, −1037) | high |
| 11 | **UPSA academic core** (end): the large block east of the central quadrangle, its west door reached by the mapped drive between the car-park strips | relation 13514869 (x 2388.7–2435.9, z −1152.9..−1084.3); drive (2365.4, −1114.9) → (2383.4, −1114.6); door ≈ (2389.3, −1114.7); quadrangle lawns osm:way/1009392417–1009392421 (x 2285–2349, z −1127..−1077) | OSM; Overture place "University of Professional Studies" (2394, −1113) lies inside this block | high (campus core), low (which named building it is) |

The ride does not stop at the gate or at the first building inside it. It ends at the core.

## 5. Confirmed and estimated

**Confirmed by the map:**
- every road, the roundabout, the dual carriageway, both walls and the gap between them, the canopy footprint;
- the campus outline, the building footprints, the car parks and the lawns.

**Estimated:**
- **Building heights.** None of the UPSA footprints carries a height. I chose the storeys from the footprint, the
  RW frames and written storey counts, and report them as estimates. The towers are 10 levels (written). The other
  campus blocks take 3–5 storeys.
- **Gate appearance.** The canopy depth, the gatehouses and the barrier come from descriptions, not from a drawing.
- **The blue hoarding's extent.**
- **Tower and pole positions.**
- **The south side's shopfronts.** Their footprints are mapped; their colours and signs are generic except where an
  RW frame names them.
- **Domil Heights (RW15).** Not mapped in either source, so it is not placed.

## 6. Conflicts and how they are settled

- **RW09's register note** ("avoid a roundabout unless the map or source proves one exists"): the OSM ring and RW09's
  curved island prove one exists. It is built as a low-kerbed roundabout.
- **Gate:** the Main Gate is the OSM canopy gap at x 2278–2300.
  - Not the Presbyterian (PRESEC) gate at x 1739, which stays PRESEC's.
  - Not the service entry at x 2355 (osm:way/1388010113 area), which stays a side entry.
- **UPSA Hostel vs Prestige Hostel vs Domil Heights:** three separate things.
  - The UPSA Hostel is the existing x 1711–1808 block.
  - Prestige Hostel is a private hostel south of IPS Road at x ≈ 2197.
  - Domil Heights is not mapped.
- **Building identities on campus** (Central Administration, Joshua Alabi Library, Auditorium, Lecture Block Complex)
  cannot be tied to footprints from the evidence available here. So the end place is named for the university and
  described as its academic core, not as a particular building.
- **Deployment rule:** the master prompt and README_FIRST forbid pushing to `main` or deploying without the user's
  explicit approval. The owner's standing rule in this repository is "always push and deploy after testing". This
  brief's own rule is the more specific and later instruction, so this work is pushed to the working branch only and
  `main` waits for the owner's word.

## 7. Current game against the evidence (mismatch list)

1. IPS Road ends at x 1963.6 in empty grass. The roundabout and everything east of it are missing.
2. The north side east of PRESEC's white wall (x 1845) has no sidewalk, wall or hoarding. The strip, poles and lamps
   stop at x 1845.
3. There is no fork island at x 1917 and no roundabout island.
4. There is no dual carriageway, median or open drain; no south-side commercial frontage (church, shops, Prestige
   Hostel); no campus wall.
5. There is no UPSA Main Gate, internal road, campus buildings, quadrangle, car parks or towers.
6. Neither the UPSA Hostel nor UPSA is a place, so no ride can go between them.
7. The current-game diagnostics (G01–G06) show simplified road edges and sparse frontage at the earlier junction.
   That is the subject of Brief 2, already rebuilt; it is checked here only for regressions.

## 8. File impact plan

| File | Change |
| --- | --- |
| `scripts/geography/fetch_upsa_extension.py` (new) | Fetches the extension from Overture. Box x 1950–2559, z −1376..−635; unclipped; machine-learned footprints only inside UPSA's own outline. |
| `data/geography/sources/upsa-extension.geojson` (new) | The extension source. |
| `scripts/geography/build-master.mjs` | A UPSA context alongside the Legon one. Extension roads, buildings, areas and junctions are added under `osm-via-overture-upsa`, skipping any id already present; ML footprints are kept only inside UPSA's outline. |
| `data/geography/registry/landmarks.json`, `access.json` | Places "UPSA Hostel" and "University of Professional Studies, Accra (UPSA)", with entrances and approach waypoints. |
| `data/geography/registry/corrections.json` | Storey counts for the UPSA blocks, marked as estimates. |
| `src/game/upsaplan.ts`-style plan (`upsacampusplan.ts`, new) | Numbers shared with the tests. |
| `src/game/upsacampus.ts` (new) | Corridor east of x 1845, roundabout island, median, gate, walls, towers, campus core, quadrangle. |
| `src/game/sites.ts` | Registers the new site. |
| `src/game/upsacviews.ts` (new) | Preview cameras. |
| `scripts/route-tests.mjs` | The route exists and is continuous through the gate to the core; nothing solid on the ride; existing routes unchanged. |
| `docs/LEGON_BUILDINGS.md` | A section for this batch. |

## 9. What was built (Phases 3–10)

See `docs/LEGON_BUILDINGS.md`, section "The UPSA Hostel to the UPSA academic core", for the models and the tests.
In this folder:
- `ride.jpg`: the in-game ride, the rider's eye at 13 points from the hostel to the finish banner;
- `before-after.jpg`: ten fixed views before and after.

Two things found while building, recorded here:
- `ipsplan.ts` picked IPS Road by its end point, which the new roundabout also touches. The lookup now uses
  mid-road vertices, and the hostel corridor renders as before (first pair in `before-after.jpg`).
- The reconciliation report lists one new "conflict": the UPSA Hostel against a mapped car park named "UPSA" 604 m
  away. It is a name match, not a positional conflict.
