# Legon destination access and routing

> **Superseded for priority destinations by [LEGON_ENTRANCE_VERIFICATION.md](LEGON_ENTRANCE_VERIFICATION.md)**, which verifies entrances against the owner-supplied atlas and building references and marks unverified ones. The Great Hall row below (west façade) was wrong: the public front faces east onto the Convocation courtyard.

How LEGONRUSH gets you *to* a place on campus: which door, which side, which road, and where the
ride stops. This layer sits on top of the master geography ([LEGON_MASTER_GEOGRAPHY.md](LEGON_MASTER_GEOGRAPHY.md))
and does not change it.

| What | Where |
| --- | --- |
| Destination access registry (WGS84 GeoJSON: entrance, arrival, drop-off, approach, evidence, confidence) | `data/geography/legon-access.geojson` |
| Curated entrances and named campus gates (with citations) | `data/geography/registry/access.json` |
| Build and problems report | `scripts/geography/build-access.mjs`, `data/geography/access-report.json` |
| Game routing | `src/game/campusmap.ts` (`ACCESS`, `accessFor`, `findPathBetween`), `src/game/routes.ts` (`routeThrough`) |
| Representative journeys | `src/data/route-checks.ts` |
| Route tests | `npm run test:routes` (`scripts/route-tests.mjs`, race snapshot `scripts/race-routes.json`) |
| Visual check | `/geo/` inspector: "Route tester", "Destination access", "Campus gates", "Network: trails and steps" |

## 1. Audit of the routing before this change

Every ride in the game (Explore in all four ways, the Freshers' Tour, missions, event rides, races,
levels, challenges) and the map's "Directions" went through one function, `findPath(fromPoint, toPoint)`:

1. **Destinations were points.** A place's coordinate is the centroid of its building or area, a
   mapped node, or a UG Campus Map point. Nothing knew where a building is entered.
2. **The ride started and ended at the network vertex nearest that point** (`nearestNode`), with a
   25 m penalty on footpaths for bikes. "Nearest road = correct entrance" was assumed everywhere.
3. **Run-up and run-out were straight extrapolations** of the first and last segment (25 m and 40 m),
   regardless of what lay ahead.
4. **The map's "Directions"** drew the route to the nearest vertex and then a straight line "from the
   road to the door": to the centroid, through the building.
5. **Path selection**: one cost table per mode by road class; informal woodland trails, tracks and steps
   were treated like paved footways; taxis could be routed down footpaths at a high but finite cost.
6. **No difference by destination type**: halls, open spaces, gardens, gates and kiosks were all reached
   the same way. Campus gates were not modelled.

Results on the priority destinations (old stop → the evidence-based entrance):

| Destination | Old stop to entrance | Building in between? | Now (arrival to entrance) |
| --- | --- | --- | --- |
| Balme Library | 76 m, on the road **behind** (north of) the library | yes, the library | 31 m, forecourt road on the south front, facing the fountain |
| Botanical Gardens | 599 m, on a woodland trail inside the gardens | — | 0 m, the gardens' mapped main entrance on the Haatso–Atomic side |
| University Stadium | 157 m | — | 5 m |
| Mensah Sarbah Hall | 130 m | yes | 11 m, at the porters' lodge |
| Elizabeth Sey Hall | 128 m | yes, the hall | 32 m, facing "Sey frontage" |
| Alexander Kwapong Hall | 184 m | yes | 16 m |
| Commonwealth Hall | 95 m | yes | 10 m, its avenue side |
| Legon Hall / Akuafo Hall | 102 / 104 m | yes | 0 m, the mapped paths into the halls |
| Banking Square | 36 m | yes, the bank complex | 14 m, on its car park |
| University Hospital | 142 m | yes | 0 m |
| Pentagon Block A | 126 m | yes | 5 m |
| Main Gate | 18 m, inside the gatehouse | yes, the gatehouse | 0 m, at the inbound lift gate |

Representative journeys (ride):

| Journey | Before | After |
| --- | --- | --- |
| Main Gate → Balme Library | 880 m, ending behind the library | 730 m, ending at the front |
| Balme Library → University Square | 317 m loop round the back | 54 m across the forecourt |
| Botanical Gardens → University Square | started 550 m inside the forest on trails | 2,194 m from the main entrance on the paved garden drive |
| Engineering → Balme Library | ended behind the library | 854 m, ends at the front |
| Main Gate → Great Hall | 1,950 m | 1,974 m, to the Great Hall drop-off |

## 2. The destination access registry

Every one of the 433 places has a record with: name, place and footprint id, **entrance** point and
type, how it was found (`method`) and the evidence, **arrival** point on the routable network (in sight
of the entrance) with the way it lies on, valid **approach** bearings along that way, **facing**
bearing (arrival → entrance), vehicle **drop-off** on a proper road, and confidence.

Entrances come from evidence, in this order (nothing is placed by hand without a reason):

| Method | Count | Confidence | Evidence |
| --- | --- | --- | --- |
| curated | 8 | high / medium | `registry/access.json`: written sources or named mapped features (cited per entry) |
| osm-entrance | 2 | high | OSM `entrance=*` node on the footprint (internal `staircase` entrances excluded) |
| gate | 2 | high | OSM gate on an area's outline (campus gates excluded) |
| path-access | 8 | medium | a mapped footway that runs up to the building |
| drive-access | 19 | medium | a mapped service drive that runs up to the building |
| area-entry | 11 | medium | where a mapped road or path enters the area (hall precincts, grounds) |
| frontage | 270 | low | inferred: the side nearest the network with a clear line of sight; no mapped access |
| point | 113 | medium | the destination is mapped as a point (kiosk, bus stop, shop) |

OpenStreetMap maps only four entrances on the whole extract, so most buildings can only be given an
inferred frontage. They are marked `low` and listed; better data (OSM entrance tags, site visits) will
upgrade them automatically.

### Curated entrances

| Destination | Entrance | Arrives on | Evidence |
| --- | --- | --- | --- |
| Main Gate | inbound lift gate (OSM node 5813545127) | Dr. J.B. Danquah Avenue | UG security directive: "the Main gate (opposite the Legon Police Station)"; two permit lift gates at the gatehouse |
| Balme Library | south façade, on the fountain axis | forecourt service road | UG: the fountain on the University Square "overlooking the Balme Library"; OSM forecourt lanes run from the fountain to the south front |
| University Square | south edge, on the avenue | the square's footways | UG: "mid-way [along the avenue] is an open space, the University Square" |
| Banking Square | façade facing "Banking Square Parking" | the car park drive | OSM car park named for the bank complex |
| Great Hall | west façade at the two turning circles | summit loop | OSM vehicle turning circles at the west façade (drop-off). Unresolved alternative: a ceremonial east front on the avenue axis |
| Commonwealth Hall | the gate in the entrance block at the top of the stairway, facing down the avenue | the drive in front of it; on foot, the stairway from the gate houses | owner's marked photos and aerial; UG: "the University Avenue extends to Commonwealth Hall" |
| Mensah Sarbah Hall | its "Administration and Porters' Lodge" | hall service loop | OSM building of that name; Radio Univers: the CC is "right in front of Mensah Sarbah Hall" |
| Elizabeth Sey Hall | façade facing "Sey frontage" | service road | OSM forecourt car park named "Sey frontage" |

### Campus gates (named from written sources)

| Gate | OSM | Evidence |
| --- | --- | --- |
| Main Gate | lift gates 5813545126, 5813545127 | "the Main gate (opposite the Legon Police Station)" |
| North Gate | lift gates 5020636345, 5713101589 | "close to the James Topp-Nelson Yankah Hall, Haatso Road" |
| Link Gate | lift gates 6012830263, 6343193979 | "the Link Gate" from the Achimota–Legon road |
| Okponglo (Stadium Road) entrance | lift gate 10649363065, swing gate 1269621500 | "the Stadium Road entrance at the Okponglo intersection ... open 24 hours to the general public" |
| South Gate | gate 2581150632 (medium) | "from Noguchi Memorial Institute ... to the N4"; which permit gate is meant is not stated |
| Evandy Gate | not mapped in OSM | "off the N4 Highway, opposite PRESEC" — recorded as missing |

Sources: [Graphic Online, UG blocks access routes](https://www.graphic.com.gh/news/general-news/univ-of-ghana-blocks-access-routes-to-public.html),
[Citi FM, chaos at UG over blocked roads](https://citifmonline.com/2014/03/chaos-at-ug-over-blocked-roads/),
[UG, security access gate building](https://old1.ug.edu.gh/node/70293),
[UG, the Legon campus](https://old1.ug.edu.gh/node/38),
[Radio Univers Level-100 guide](https://univers.ug.edu.gh/finding-your-way-on-the-streets-of-legon-a-level-100-guide/).

## 3. Routing now

- **Destination journeys** (Explore: walk / ride / taxi / shuttle, Freshers' Tour, missions, event
  rides, the map's Ride and Directions) leave from the origin's access point and stop at the
  destination's: `origin entrance → arrival point → network → arrival point → destination entrance`.
  Taxis and the shuttle use the drop-off on a proper road.
- **Costs** (`findPathBetween`): by road class as before, plus surface: bikes treat informal trails
  (OSM `path`, `track`) as 2.2× and steps as 25× as long, walkers barely mind, taxis never use footpaths,
  trails or steps. Private roads stay out of the network. Permit gates are passable (students ride
  through them).
- **Start and arrival**: the ride passes exactly through the origin and destination access points (no
  corner rounding there). The run-up comes out of the origin's entrance; the run-out leads toward the
  destination's entrance and stops 1.5 m short of the door, so after the finish line the rider rolls up
  to and faces the entrance. Where the entrance is on the road itself, the run-out follows the network
  onward instead of a straight line.
- **Neighbours sharing one frontage** (e.g. the banks on Banking Square) fall back to the previous
  nearest-vertex way so a short hop still works.
- **Races, levels and challenges are unchanged.** Best times and ghosts are stored per route id and
  compared on route length, so their geometry is frozen: they keep the original nearest-vertex
  construction, and the access points added to the network are removed from their lines. The route
  tests compare all 33 against `scripts/race-routes.json`. Moving races onto access points is a
  separate decision (it needs a ghost/leaderboard version bump).
- **Explore UX is unchanged**: same screens and buttons; "Take Me There" now ends at the entrance.

## 4. Geographic issues found (documented, not changed)

The master geography was not edited. Findings for a future geographic correction pass:

- **Network through buildings** (`access-report.json → networkPassagesThroughBuildings`, 15 cases):
  the Main Gate gatehouse (real: the road passes under it), Akuafo Hall Annex B (a footway through
  the block), **Vice Chancellor's Crescent through an unnamed building on Legon Hill** (likely an OSM
  error or an unmapped covered passage), a mall car park and some off-campus cases. Riding through them
  is allowed by the tests because the source network does.
- **JQB's only OSM entrance is `entrance=staircase` in the middle of the building** (an internal stair,
  not a door).
- **The Registry node sits inside a building named "Cash office"**; the Registry block itself is not
  named in OSM.
- **Evandy Gate is not mapped** in OSM; the South Gate and the Okponglo gates are mapped without names.
- **Nine places have a building between the network and their entrance** (stalls inside Jubilee
  Hall's courtyard, the Information Studies block, hotels off campus): enclosed courtyards or missing
  paths; listed in `access-report.json → warnings`, confidence low.

## 5. Acceptance (enforced by `npm run test:routes`, in CI)

The route tests fail if any of these breaks:

1. Every place has an access point.
2. Every arrival and drop-off is connected to the road/path network (reachable from the Main Gate).
3. No arrival point is inside a building.
4. The way from the arrival point to a non-low-confidence entrance does not cross a building.
5. Each representative journey (14 × ride, walk, taxi) exists, is shorter than its ceiling, starts
   within 3 m of the origin's access point and ends within 3 m of the destination's.
6. No ride, run-up or run-out passes through a building footprint (except buildings the mapped network
   itself passes through).
7. No taxi route uses a footpath.
8. No race, level or challenge route moves (33 snapshots).

`npm run geo` also stops if a curated entrance cannot be resolved or an access point cannot be placed.
