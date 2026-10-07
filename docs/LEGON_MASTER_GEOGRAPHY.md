# Legon master geography

The authoritative geographic foundation of LEGONRUSH: where the University of Ghana's Legon campus
actually is, rebuilt from independent sources rather than patched from the old game map.

| What | Where |
| --- | --- |
| Authoritative dataset (WGS84 GeoJSON, every feature with sources and confidence) | `data/geography/legon-master.geojson` |
| Cross-source checks, landmark tests, conflicts | `data/geography/reconciliation-report.json` |
| Legacy map audit (old game map vs rebuilt) | `data/geography/legacy-audit.json` |
| Curated registries (landmarks, zones, naming, corrections) | `data/geography/registry/` |
| Source snapshots | `data/legon.osm`, `data/geography/sources/` |
| Build (no network, runs in CI) | `npm run geo` = `scripts/geography/build-master.mjs` then `master-to-game.mjs` |
| Source refresh (network, run by hand) | `scripts/geography/fetch_sources.py` |
| Game data generated from the master | `src/data/legon-map.json` |
| Visual inspection from above | `/geo/` (e.g. https://rudolphdeladem.github.io/legonrush-world/geo/) |

The rule this phase follows: **geography is authoritative; the 3D world adapts to it.** Nothing was
moved to look better in the game. Positions come from source geometry; the only hand-authored shapes
are the campus zones (which no source defines) and they are labelled as interpretive.

---

## 1. Sources used

| # | Source | What it contributed | How it was accessed |
| --- | --- | --- | --- |
| S1 | **OpenStreetMap** extract `data/legon.osm` (snapshot 2026-10-04) | Road network, footpaths, building footprints, named features, campus boundary (way 308668766), trotro routes | Already in the repo (Overpass export) |
| S2 | **OpenStreetMap via Overture Maps** release 2026-09-23.1 | 4,815 OSM features that the S1 extract had clipped off (roads, 930 buildings, land use, water) | Overture S3 (anonymous), `fetch_sources.py` |
| S3 | **Google Open Buildings v3** | 6,725 satellite-derived footprints on and around campus, used to validate every OSM footprint | GCS open bucket, streamed and clipped |
| S4 | **Microsoft ML Buildings / Google footprints via Overture** | 294 campus buildings present in imagery but missing from OSM | Overture S3 |
| S5 | **Overture places** (Meta, Microsoft, Foursquare, AllThePlaces) | 466 named points: an OSM-independent check of names and positions | Overture S3 |
| S6 | **UG Campus Map** by enkayyy97 (https://enkayyy97.github.io/ug-campus-map/) | 95 points of interest (`ug-campus-map-pois.json`) and its own campus outline (121 vertices) | Source repository `github.com/enkayyy97/ug-campus-map` (commit eb6bf72) |
| S7 | **University of Ghana official text** (old1.ug.edu.gh/node/38, mirrored at lawlibrary.ug.edu.gh/node/38) | Spatial relationships: Main Gate on the N4, University Avenue to Commonwealth Hall on Legon Hill, University Square and fountain facing Balme, Convocation Group on the summit, open-air theatre behind Commonwealth | Web search |
| S8 | **Radio Univers** (UG campus radio) Level-100 street guide | JQB behind the Institute of African Studies on the right from the gate; KAB opposite Law; N Block by Pol. Sci./Psychology; CC in front of Sarbah, opposite the Athletic Oval | Web search |
| S9 | **News and tourism sources**: Graphic Online (Banking Square next to the Night Market), UG news (Night Market), Visit Ghana and YEN (Botanical Gardens off the Atomic–Haatso road; the Vaughan Dam inside them), Ghana Remembers (stadium by the Okponglo lights on the Accra–Madina road), Meqasa (Registry, Great Hall and VC's residence on top of the hill) | Relationship claims | Web search |
| S10 | **Copernicus Sentinel-2 L2A** true colour, 7 clear scenes Nov 2025–Feb 2026 | Independent 10 m imagery: roads, open spaces, stadium, water; median composite in `public/geo/legon-sentinel2.webp` | AWS open data |
| S11 | **Copernicus GLO-30 DEM** | Terrain: Legon Hill summit, slopes (30 m grid, `copernicus-dem-30m.json`) | AWS open data |
| S12 | **ESA WorldCover 2021** | Land cover (tree cover, grassland, built-up) on campus, 329 polygons | AWS open data |
| — | Legacy LEGONRUSH map (`src/data/legon-map.json` at commit 9b5b773) | Treated as untrusted; used only for the audit and for the list of place names the game code depends on | git |

**Sources requested but not reachable from the build environment.** The environment's network policy
blocked direct access to Mapize, Apple Maps, uniRank, topographic-map.com, ug.edu.gh pages, the UG
Campus Map web page, openstreetmap.org/Overpass/Nominatim and all web map tile services. They were
handled as follows:

| Requested source | Status | Substitute |
| --- | --- | --- |
| Mapize | Blocked; not indexed in search | Not used. Its maps are built on OSM/Google data already covered by S1–S5. |
| Apple Maps (place IB47DFFF480F900DF) | Blocked | Not used. The inspector links every point to Apple Maps satellite so it can be checked by hand. |
| uniRank map | Blocked; search snippets only give the postal address (PO Box LG25) and a city-level point | Not used for positions. (A related snippet even gives the longitude as 0°11′7.8″ **E**: wrong hemisphere.) |
| topographic-map.com (Legon) | Blocked; not indexed | Copernicus GLO-30 DEM (S11), the dataset such sites are typically built on |
| UG Campus Map web page | Blocked | Its source repository (S6) |
| UG official pages | Pages blocked; text read through search results | S7 |
| Satellite/aerial imagery tiles (Esri, Google, Bing) | Blocked | Sentinel-2 composite (S10) and Google Open Buildings (S3), which is itself derived from high-resolution imagery |

`data/legon-geographic-corrections.json`, named in the brief, does not exist in the repository; there
was no earlier corrections file. The corrections registry now lives in `data/geography/registry/corrections.json`.

## 2. Source reliability

| Source | Reliability for geometry | Reliability for names | Notes |
| --- | --- | --- | --- |
| S1/S2 OpenStreetMap | **High** | High | Footprints agree with Google Open Buildings to a median 0.6 m east / 0.4 m south (1,204 matched buildings). Tagging is uneven (e.g. a fountain point named "Balme Library", a building named "lizalex"). |
| S3 Google Open Buildings | **High** for presence and outline | — | Machine-learned from imagery; misses buildings under canopy and merges terraces. Confidence ≥ 0.65 kept. |
| S4 Microsoft ML footprints | Medium-high | — | Same caveats; no confidence score. |
| S5 Overture places (Meta etc.) | Low-medium | Medium | Mostly within 15–60 m, but with gross errors: JQB 1.47 km off, the stadium 285 m off, a second "Night Market" by the Main Gate, "Sarbah Hall" on Akuafo. Never used to place anything, only to corroborate. |
| S6 UG Campus Map | Medium (4-decimal coordinates ≈ ±11 m) | High (campus-made) | Points typically 10–80 m from the building centroid. One point labelled "Business School" is the UGBS Graduate Campus. Its outline is a simplified trace of the OSM boundary (median 33 m apart, overlap IoU 0.93). |
| S7–S9 Written sources | — (relationships only) | High | Converted into testable claims (section 9), never into coordinates. |
| S10 Sentinel-2 | Medium (10 m pixels) | — | Confirms roads, large buildings, fields, water; too coarse for small footprints. |
| S11 DEM | Medium (30 m; surface model includes canopy and roofs) | — | Good for hill/valley structure. |
| S12 WorldCover | Medium | — | 2021 classification; buildings since then show as vegetation. |

Priority when sources disagree: geometry from OSM (validated by S3), unless S3/S10 contradict it;
names from S1, S6 and S7/S8; S5 last.

## 3. Geographic methodology

1. **Acquire** (`fetch_sources.py`): clip every source to the study extent and commit the snapshots,
   so the build is reproducible offline.
2. **Boundary first**: the OSM university polygon defines the campus; S6's outline is compared to it.
3. **Network**: all OSM highways from S1, plus S2 segments for the parts S1 clipped off; roads join
   only where they share a point (as in OSM). Junctions, roundabouts and gates are derived.
4. **Footprints**: every OSM footprint on campus is overlapped with S3 (0.5 m raster IoU).
   IoU ≥ 0.3 or ≥ 50 % coverage = confirmed. ML footprints (S4) fill campus buildings missing from OSM
   (≥ 60 m², confidence ≥ 0.8, not touching any OSM outline). Orientation comes from each footprint's
   minimum-area rectangle.
5. **Places**: the legacy naming algorithm is kept (so names the game uses survive), then every place
   is cross-checked against S5 and S6 for corroboration; same-name places far apart become conflicts.
6. **Landmark registry** (`registry/landmarks.json`): 51 entries. Each names the geometry that fixes it,
   name patterns for every other source, and claims from written sources. The build measures every
   source's distance, runs every claim (proximity, direction, side of a road, elevation, summit,
   containment) and assigns confidence. Registry positions override legacy place positions.
7. **Zones** are drawn by hand over S10 + S1 (no source defines them) and checked against their
   anchor places.
8. **Corrections** (`registry/corrections.json`) exclude source features only where independent
   evidence contradicts them; nothing is moved. `heights` overrides a building's storeys and height where
   reference photos contradict the source (the Diaspora halls: 4 storeys); `reclass` changes a ground
   area's use where the photos and the owner contradict it (the paved forecourts behind Limann and
   Kwapong, mapped as car parks). See [LEGON_BUILDINGS.md](LEGON_BUILDINGS.md).
9. **Export**: `master-to-game.mjs` produces the compact game JSON. The build fails if any place name
   the game code looks up disappears (`registry/naming.json` → `required`, 153 names).

## 4. Campus boundary

- Source: OSM way **308668766** (`amenity=university`, name "University of Ghana"), 100 vertices.
- Area **12.63 km²**, perimeter **16.2 km**. Extent 5.6262–5.6673 N, 0.2051–0.1693 W.
- UG Campus Map outline: median 33 m, 90th percentile 193 m from the OSM line, area overlap IoU 0.93.
  The larger gaps are where the UG Campus Map cuts corners (south-west diagonal, east of the N4).
- The east side is stepped: university land crosses the N4 (J.J. Rawlings Avenue) between roughly
  5.659 N and 5.643 N (UGBS Graduate Campus, University Hospital).
- **The legacy map covered only 72 % of the campus**: its OSM extract stopped at 5.633 N / 0.199 W /
  0.175 W, cutting off the UG Medical Centre and the southern tip, the western woodland and farms, and
  the eastern strip. It had no boundary at all.

## 5. Road network

1,550 road and path segments (414 of them OSM ways recovered via Overture), 1,207 junctions, 18 roundabouts, 22 gates and entrances.

| Class (OSM) | km | Game class |
| --- | --- | --- |
| trunk (+ links): J.J. Rawlings Avenue (N4, Legon–Madina road) | 9.8 | 0 arterial |
| secondary / tertiary (+ links): Haatso–Atomic Road, Legon By-Pass, La Bawaleshi Road, IPS Road, Agbogba Road, Jubilee Circle | 23.8 | 1 collector |
| unclassified / residential: Dr. J.B. Danquah Avenue (the University Avenue), Akuafo Road, campus crescents | 78.0 | 2 local |
| service / track | 74.4 | 3 lane |
| footway / path / steps | 38.2 | 4 footpath |

Key structure (all confirmed against Sentinel-2):

- **Dr. J.B. Danquah Avenue** = the University Avenue of the official text. It runs east–west from the
  **Main Gate** on the N4 (gate 5 m from the avenue, 88 m from the N4), through the **Balme Library
  fountain roundabout**, past Volta Hall and the halls, to **Commonwealth Hall** (139 m from the
  avenue's west end) and up Legon Hill. Elevation rises from 88 m at the gate to 129 m at Commonwealth
  and 148 m at the Great Hall.
- **J.J. Rawlings Avenue (N4)**: dual carriageway on the east edge; the Okponglo junction at its
  southern end (bus stops "Okponglo", "Okponglo Second Gate", Legon Taxi Rank).
- **Jubilee Circle / Jubilee Drive**: the southern collector to the new halls; OSM bus stops call the
  circle "Okponglo Roundabout", though the real Okponglo junction is on the N4 (recorded, not renamed).
- Roundabouts (18): on the avenue, the Balme fountain circle plus circles at the Legon Hall and Akuafo
  Hall junctions, Mekki Abass Circle inside the Main Gate and the avenue's junction with the N4; Jubilee
  Circle; Ephraim Amu Circle in the staff housing; the Botanical Gardens circle; two small circles on
  the Great Hall loop; Atomic Junction and Tewu Circle off campus (see `layer: roundabout`).
- Width: OSM `width`/`lanes` where mapped, otherwise class defaults (trunk 14 m … footway 2 m);
  recorded per road with its source (`widthSrc`).
- Parking aisles, mapped areas and private drives stay out of the game network, as before.

## 6. Pedestrian network

232 footpaths (12.4 km footway, 25.8 km path, steps). The densest walkway systems are around
University Square and the Balme Library forecourt, between the traditional halls, across the Athletic
Oval precinct, and in the Botanical Gardens (trails). Informal paths in the western woodland come from
OSM `highway=path` and are confidence **medium**: they are under canopy in the imagery and change
often. No dedicated cycleways are mapped on campus.

## 7. Building footprint reconstruction

| | Count |
| --- | --- |
| Buildings in the study extent | 2,827 (2,826 in the game; 1 excluded) |
| On campus | 1,761 (legacy: 1,175) |
| OSM footprints on campus checked against Google Open Buildings | 1,467 |
| … confirmed (IoU ≥ 0.3 or ≥ 50 % covered) | **1,326 (90.4 %)** |
| Median OSM→Google centroid offset | 0.6 m E, 0.4 m S (no systematic shift) |
| Recovered from OSM outside the legacy extract | 930 |
| Added from satellite ML footprints (campus, ≥ 60 m², not in OSM) | 294 (155 Microsoft, 139 Google) |
| Excluded as erroneous | 1 (`osm:way/765261444`, "lizalex", see section 11) |

Each building carries: footprint (with courtyards), category (residence, academic, civic, religious,
health, commercial, sport, housing, utility, unknown), name, OSM levels/height where mapped, a height
estimate only for halls (unchanged legacy rule), **orientation** (bearing of the long axis, length and
width from the minimum-area rectangle), area, sources, confidence and the satellite-validation score.
The 141 unconfirmed OSM footprints are mostly halls' outer rings (the courtyard dilutes the overlap,
e.g. Jubilee Hall), buildings under trees, and recent buildings; they remain in the map as medium
confidence and are listed in the report (`osmNotSeenBySatellite`).

## 8. Major areas

| Area | Geometry source | Notes |
| --- | --- | --- |
| **University Square** | Derived: forecourt between the Balme Library service road (way 278303088), the two service lanes (448104199, 448104193) and the fountain roundabout | Not a named feature in any source. 12 m from the fountain, 40 m from the library, 354 m north of the Athletic Oval (official text: "across from the square are sports fields and halls"). Confidence medium. |
| **Banking Square** | OSM relation 7226878 (bank complex) + parking way 492099498 | 37 m from the Night Market, as Graphic Online describes |
| **Night Market** | OSM way 773864855 (food court) | Overture duplicate near the Main Gate rejected |
| **Botanical Gardens** | OSM way 335456879, 91.6 ha | North of the core, on the Haatso–Atomic road (6 m) |
| **Vaughan Dam** | OSM way 215443236, 0.76 ha | The only open water in the gardens; see section 10 |
| **Athletic Oval** | OSM relation 7304443 (track) + pitches | Opposite the Central Cafeteria (CC 131 m south) |
| **UG Sports Stadium** | OSM way 1273337678 | By the Okponglo end of the N4 (154 m) |
| **Kuffour Quadrangle** | OSM way 448104179 | 97 m north of (behind) the Balme Library |
| **Balme Library Fountain** | OSM way 320067568 (434 m², in the avenue roundabout) | |
| **Amphitheatre (open-air theatre)** | OSM node 9660303973 | 129 m west of (behind) Commonwealth Hall, on the slope |
| Lawns, parks, courtyards | 31 grass/park polygons (95 ha incl. the gardens) | |
| Sports pitches and tracks | 32 pitches, 3 tracks | |
| Parking | 82 car parks (9.3 ha) | |
| Water | 26 bodies (6.7 ha): the Vaughan Dam, 12 aquaculture ponds in the north-west, the Legon Pool, pools; 22 drains/streams | |
| Woods | 4 OSM woods (488 ha): three small woods on campus and the Achimota Forest Reserve (483 ha) west of the campus | The on-campus western woodland is not mapped as wood in OSM; WorldCover shows it (master only, so the game does not plant a new forest) |
| Land cover (master only) | 329 WorldCover polygons: tree cover, shrubland, grassland, built-up | Reference for the later environment phase |

**Zones** (interpretive, `registry/zones.json`, confidence medium): Legon Hill and the Convocation
Group; central academic core; Main Gate and eastern academic strip; traditional halls and the Athletic
Oval; Night Market / Banking Square / international hostels; sports precinct; southern halls and
health sciences; UG Medical Centre and the southern edge; staff residential; northern hostels;
Botanical Gardens and northern woodland; western woodland, farms and research plots; east of the N4.
Every zone contains all its anchor places; the western woodland outline is the roughest (23 % of it
falls outside the boundary).

## 9. Landmark registry

51 landmarks, **48 high and 3 medium confidence, none low**; **all 37 written-source claims pass**.
Full per-source distances and claim results: `reconciliation-report.json` → `landmarks`.
Agreeing sources = sources within 150 m of the chosen geometry.

| Landmark | Lat, Lng | Elev. | Conf. | Agreeing sources | Claims tested (all pass) |
| --- | --- | --- | --- | --- | --- |
| Main Gate (Legon Main Entrance) | 5.65064, −0.18115 | 88 m | high | OSM | 88 m from the N4; 5 m from the University Avenue |
| University Avenue (Dr. J.B. Danquah Ave.) | — | — | medium | OSM | links the Main Gate (5 m) and Commonwealth Hall (139 m) |
| Great Hall | 5.65064, −0.19622 | 148 m | high | OSM, UG Map | 19 m from the DEM summit (149 m); 19 m above Commonwealth Hall |
| Registry / Central Administration | 5.65018, −0.19543 | 147 m | high | OSM, Overture | 81 m from the Great Hall; on the summit |
| Vice-Chancellor's Residence | 5.64958, −0.19709 | 141 m | high | OSM | on top of the hill |
| Balme Library | 5.65205, −0.18704 | 100 m | high | OSM, Overture, UG Map | 106 m north of the fountain; 95 m from the avenue |
| University Square | 5.65135, −0.18702 | 95 m | medium | (derived) | by the fountain; by the library; north of the Athletic Oval |
| Balme Library Fountain | 5.65110, −0.18703 | 95 m | high | OSM | on the avenue (12 m) |
| Kuffour Quadrangle | 5.65293, −0.18705 | 95 m | high | OSM | behind the library; by Plant & Environmental Biology |
| Banking Square | 5.64278, −0.18567 | 88 m | high | OSM, UG Map | 37 m from the Night Market |
| Night Market | 5.64211, −0.18559 | 85 m | high | OSM, Overture | 37 m from Banking Square |
| Athletic Oval | 5.64815, −0.18704 | 89 m | high | OSM, Overture | opposite the CC; across the avenue from the square |
| UG Sports Stadium | 5.63903, −0.18009 | 68 m | high | OSM, UG Map | by the Accra–Madina road |
| Botanical Gardens | 5.66212, −0.18626 | 71 m | high | OSM | on the Haatso–Atomic road; north of the core |
| Vaughan Dam | 5.66581, −0.18804 | 56 m | medium | — | inside the Botanical Gardens |
| School of Engineering Sciences | 5.65562, −0.18301 | 95 m | high | OSM, UG Map | |
| UG Business School | 5.65281, −0.18845 | 105 m | high | OSM, Overture | |
| UGBS Graduate Campus | 5.65871, −0.17759 | 87 m | high | OSM, Overture, UG Map | |
| Commonwealth Hall | 5.65073, −0.19255 | 129 m | high | OSM, UG Map | 29 m above Balme; amphitheatre behind it |
| Amphitheatre | 5.65064, −0.19371 | 134 m | high | OSM | west of (behind) Commonwealth |
| Legon Hall | 5.64959, −0.18821 | 97 m | high | OSM, Overture, UG Map | across the avenue from the square |
| Akuafo Hall | 5.64954, −0.18588 | 95 m | high | OSM, Overture, UG Map | across the avenue from the square |
| Volta Hall | 5.65181, −0.18950 | 105 m | high | OSM, Overture, UG Map | |
| Mensah Sarbah Hall | 5.64582, −0.18662 | 90 m | high | OSM, Overture, UG Map | CC in front of it |
| Central Cafeteria (CC) | 5.64697, −0.18709 | 92 m | high | OSM, UG Map | opposite the Athletic Oval |
| International Students Hostel 1 / 2 | 5.63976, −0.18515 / 5.64154, −0.18610 | 93 m | high | OSM, Overture, UG Map | |
| Valco Trust Hostel | 5.64476, −0.18688 | 92 m | high | OSM, Overture, UG Map | |
| JQB (Jones Quartey Building) | 5.65232, −0.18197 | 98 m | high | OSM, Overture, UG Map | near the Main Gate; north (right) of the avenue; behind the Institute of African Studies |
| Institute of African Studies | 5.65110, −0.18190 | 93 m | high | OSM, UG Map | north of the avenue, in front of JQB |
| KAB, School of Law, N Block, Performing Arts | see report | | high | OSM (+ UG Map / Overture) | KAB opposite Law; N Block by Psychology |
| UG Hospital, UGMC, Noguchi | see report | | high | OSM + others | |
| Limann, Kwapong, Sey, JNA, Jubilee halls | see report | 85–90 m | high | OSM, Overture, UG Map | |
| Pentagon, Bani, Evandy, TF/James Topp Nelson Yankah | see report | 70–84 m | high | OSM, Overture, UG Map | |
| Sports Directorate, Police Station, Radio Univers | see report | | high | OSM + others | |

## 10. Conflicting source information

Automatic conflicts (identical name, unique in both sources, > 300 m apart), from the report:

| Place | Our position (source) | Conflicting source | Gap |
| --- | --- | --- | --- |
| JQB Lecture Hall | north of the avenue by the Main Gate (OSM, UG Map, Radio Univers) | Meta places it at the northern hostels | 1,465 m |
| Dept. of Geography and Resource Development | east academic strip (OSM, UG Map) | Meta, by the Night Market | 1,081 m |
| International House | OSM relation 5912384 | Meta, south of the avenue | 595 m |
| School of Public Health | UG Map, by the southern halls | Meta, 500 m west | 512 m |
| Shell, Zoe Pharmacy | off-campus businesses | Meta | 443–4,077 m |

Registry-level conflicts:

- **University of Ghana Sports Stadium**: Meta 285 m off (on the N4); UG Map's "Sports Complex" 116 m
  off (a different, adjoining feature). OSM matches the stadium bowl in Sentinel-2.
- **Business School**: the UG Map's "Business School" point is 1.36 km from the OSM/Meta UGBS (beside
  the Balme Library); it is the UGBS Graduate Campus east of the N4.
- **Institute of African Studies**: Meta puts it 211 m south of the avenue by the School of Performing Arts.
- **Night Market**: a second Meta "Night Market" sits on the Main Gate cluster of shops (confidence 0.20).
- **Legon Hall**: OSM has two polygons named "Legon Hall" (main hall way 427645339 and the annexe block way 1548976998).
- **Balme Library**: an OSM point named "Balme Library" (node 6720686104) is tagged as the fountain and sits on it.
- **Soil Science**: two identical OSM footprints 232 m apart are both named "Soil Science"; both exist (Google confirms each).
- **"Okponglo Roundabout"**: OSM bus stops give this name to Jubilee Circle on campus; the Okponglo junction is on the N4.
- **"lizalex"**: an 8,486 m² OSM church building between Sey and Kwapong halls.
- **Vaughan Dam**: named only in written sources; no map names any water body.

## 11. Resolved conflicts

| Conflict | Resolution | Evidence |
| --- | --- | --- |
| JQB position | OSM / UG Map position kept; Meta rejected | Radio Univers: "close to the Main Entrance … behind the Institute of African Studies, on your right side when coming from the main gate" — all three tests pass |
| Institute of African Studies | UG Map position kept (OSM "African Studies Dept" 2 m away); Meta rejected | Same Radio Univers description: the institute sits between JQB and the avenue |
| Stadium | OSM kept; Meta rejected | Sentinel-2 stadium bowl; written: by the Okponglo lights on the Accra–Madina road |
| Business School | Both kept as separate places ("University of Ghana Business School", "UGBS Graduate Campus") | OSM + Meta agree on each |
| Night Market duplicate | Meta duplicate ignored | Banking Square relation (Graphic Online) |
| Legon Hall duplicate | Main hall = way 427645339; the other polygon excluded as a place (`naming.json`) | Overture and UG Map both within 71 m of the main hall |
| "Balme Library" fountain point | Excluded as a place | It is tagged and placed as the fountain |
| "lizalex" | Excluded from the game (`corrections.json`), kept flagged in the master | Google Open Buildings sees only small structures inside it; Sentinel-2 shows open ground; no other source |
| Vaughan Dam | Named on the OSM water body in the gardens (confidence medium) | Only open water in the gardens; visible in Sentinel-2; "the Vaughan dam where you can have a canoe ride" (YEN) |
| JQB spelling | "Jones Quartey Building" (OSM says "James") | Radio Univers |
| Botanical Gardens category | `landmark` (was `sport`) | It is a 92 ha garden, not a sports facility |

Legacy places moved to the verified registry position: Pentagon Block A 51 m, UG Business School 19 m
(snapped onto its building), Evandy Hostel 14 m, Registry 7 m. Soil Science moved 232 m to the twin
the UG Campus Map supports (see 12).

## 12. Unresolved uncertainties

- **Zones** are interpretive; no source defines campus precincts.
- **University Square's outline**: the official text names it but no map draws it; the derived
  forecourt may be smaller than what students call the square.
- **Registry vs Central Administration**: sources treat them as one Convocation Group; separate
  buildings are not distinguished.
- **Soil Science**: two identical OSM footprints are both named Soil Science; the UG Campus Map
  (±11 m) supports the western one. Which department occupies the eastern twin is not established.
- **School of Public Health**: UG Map vs Meta 512 m apart; only the UG Map position is used (low confidence).
- **International House**: OSM vs Meta 595 m apart; OSM kept (low confidence).
- **141 OSM footprints on campus not matched by satellite footprints**: either under canopy, recent,
  or wrong; kept as medium confidence.
- **The 294 ML footprints** have no names or heights; some may be sheds or kiosks.
- **Off-campus context** (outside the boundary + 150 m) is included only where the legacy map had it
  and is not validated.
- **Building heights**: only OSM-mapped heights/levels are real; hall heights are estimates.
- **Sources not reachable** (Mapize, Apple Maps, uniRank, topographic-map.com, high-resolution
  imagery) could not be compared directly; the inspector links every point to OSM, Google and Apple
  satellite views for manual checks.

## 13. Coordinate system

- **Master dataset**: WGS84 (EPSG:4326), GeoJSON `[longitude, latitude]`, 7 decimals (~1 cm).
- **Game frame**: a local tangent plane in metres around the datum **5.6518 N, 0.1871 W**:
  `x = (lng − (−0.1871)) × 111320 × cos(5.6518°)` (110,779.6 m per degree, +x east),
  `z = −(lat − 5.6518) × 110574` (+z south). The datum is kept from the legacy map so saved progress
  and stored coordinates stay valid; it is a coordinate origin, not a claim about any building
  (the Balme Library's verified centroid is at x 6, z −28).
- Projection error of this plane against ellipsoidal distances over the campus: < 0.1 % (< 5 m over 5 km).
- Game JSON stores decimetres (`legon-map.json`); `toLatLng` / `fromLatLng` in `src/game/campusmap.ts`
  convert back.
- Elevations are metres above EGM2008 from a surface model (includes canopy and roofs); the game is
  still flat (terrain is a later phase).

## 14. Accuracy assumptions

| Feature | Expected horizontal accuracy |
| --- | --- |
| OSM footprints confirmed by Google Open Buildings | ≈ 1–2 m (median offset 0.7 m) |
| OSM road centrelines | ≈ 2–5 m (traced on imagery; agree with Sentinel-2 at 10 m) |
| Unconfirmed OSM footprints, ML footprints | ≈ 2–5 m, presence medium |
| Landmark points (centroids of their geometry) | as their geometry; points are centroids, not entrances |
| UG Campus Map-only places | ± 11 m rounding + placement error (typically 10–80 m) |
| Footpaths in woodland | 5–20 m |
| Zones | interpretive, tens of metres |
| Elevations | ± 2–5 m (30 m DEM, surface model) |

## 15. Geographic acceptance criteria

The build enforces these on every run (CI runs `npm run geo` and fails on any change or error):

1. The campus boundary is OSM way 308668766 and agrees with the UG Campus Map outline (IoU ≥ 0.9). ✔ 0.93
2. Every OSM footprint on campus is checked against Google Open Buildings; ≥ 85 % confirmed. ✔ 90.4 %
3. No systematic offset between OSM and satellite footprints (|median| < 2 m). ✔ 0.6 / 0.4 m
4. Every registry landmark resolves to source geometry; every written claim passes. ✔ 51 / 37 of 37
5. No landmark has low confidence. ✔
6. Every place name the game code looks up still exists (153 names). ✔ (the build stops otherwise)
7. Every zone contains its anchor places. ✔
8. The game map covers the whole campus boundary (legacy: 72 %). ✔ 100 %
9. The build is deterministic (byte-identical output on rerun). ✔

Visual criteria, checked in `/geo/` against the Sentinel-2 composite and external satellite views:

10. The road network overlays the visible roads (the avenue, the N4, Jubilee Circle, the halls' crescents). ✔
11. Great Hall / Commonwealth sit on the hill at the west end of the avenue; the Balme Library faces
    the fountain at the midpoint; halls and the Athletic Oval are south across the avenue; the Night
    Market, Banking Square and ISH are further south; the stadium is in the south-east by the N4; the
    Botanical Gardens and the Vaughan Dam are in the north. ✔
12. The legacy map overlay (`Legacy map` layer) shows what changed.

## Refreshing

```sh
python3 -m venv .venv-geo && .venv-geo/bin/pip install pyarrow shapely numpy pillow rasterio pyproj
.venv-geo/bin/python scripts/geography/fetch_sources.py     # refresh snapshots (network)
npm run geo                                                  # rebuild master + game data
node scripts/geography/compare-legacy.mjs                    # optional: legacy audit
```

To refresh OpenStreetMap, export the same area again (5.633–5.668 N, 0.199–0.175 W) to `data/legon.osm`.
Corrections that are really OpenStreetMap errors should also be fixed on openstreetmap.org.

Licences: OpenStreetMap (ODbL), Google Open Buildings (CC BY 4.0 / ODbL), Microsoft ML Buildings (ODbL),
Overture places (CDLA-Permissive-2.0), ESA WorldCover (CC BY 4.0), Copernicus DEM and Sentinel-2
(free and open; contains modified Copernicus Sentinel data 2025–2026).
