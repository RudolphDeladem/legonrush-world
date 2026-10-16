# Walking, entrances, porter's lodges and allocated rooms

Sources: the owner's two volumes (A: gameplay; B: room and lodge construction atlas), the two-part room reference
pack, the Vikings double correction (V2, 2026-10-16: PDF and pack) and the owner's decisions of 2026-10-16 (below).
The owner's documents, videos and frames stay private: only derived layout data is in the repository
(`src/data/rooms.json`, layouts R01–R31 and S01–S04, rounded, with R08 replaced by the V2 correction;
`src/data/vikings-modules.json`, the V2 wet area and balcony modules). Observed references are kept apart from
proposed geometry; what is inferred is labelled so here and in the code.

## The owner's decisions of 2026-10-16

| Item | Done |
|---|---|
| TF (James Topp Nelson Yankah) room walls white | `residence.ts` paint `white`; the provisional grey is gone |
| Volta Hall Annex has no separate porter's lodge; Volta's lodge at the main hall's main entrance serves it | no lodge is built at the annex; its status reads "served by another lodge" (`lodgeAt: 'volta'`); the hall panel says so |
| Jubilee "2-in-1": the general two-person hostel room, two separate single beds, selectable | category `jub-2-in-1`, layout R02 (two singles), brown wooden singles as in the rest of Jubilee Hall |
| Get down and walk in Explore and Vibe Ride only | the menus offer it only there, and `Game.getDown` itself refuses everywhere else (races, missions, events, challenges, treasure hunts, the first ride) |
| Walk inside the allocated room and onto its balcony | first-person walking with collision (`roomplay.ts`) |
| Curtains and louvres | working curtains on glass (ISH) and louvre blades on their pivots (all other rooms) |
| Random roommates, NPCs for empty beds | `supabase/sql/50-rooms.sql` + `features/rooms.ts` (see "Roommates") |
| Privacy | only the player's own room is ever built; see "Privacy" |
| Gates, lodges, stairs | see "Entrances, gates, lodges and stairs" |

## What is in the game

| Part | Where | State |
|---|---|---|
| Get down and walk: Explore and Vibe Ride (pause menu, the free-ride pad's walk button); refused in races by the game itself | `main.ts` (`walkAllowed`), `Game.getDown` | implemented, verified in the app |
| The same character on foot; bike parked, one bike; remount within 3 m | `walker.ts`, `Game.getDown`, `rideBike` | implemented |
| Nearby list, beacon, "Enter X?" popup (4.5 m in, 7 m out, never while riding) | `ui/walkui.ts` | implemented |
| Hall panel: Enter my room, Set my accommodation, Walk around the open common area, Leave | `walkui.ts` | implemented |
| Accommodation in signup and the profile (25 residences, 69 categories, none unresolved) | `ui/accommodation.ts`, `residence.ts` | implemented |
| Blurred transition straight into the room (no corridor), and back | `walkui.ts` | implemented |
| Walking in the room: W/S or ↑/↓ walk, A/D step, ←/→ turn, drag (mouse or touch) or right stick to look, on-screen Walk/Back/turn buttons, left stick walks | `roomplay.ts`, `walkui.ts` | implemented |
| Collision with walls, window walls, parapets, closed doors and furniture (beds, desks, chairs, cupboards, sanitary fittings, kitchen fittings, drying rack); never outside the unit | `roomkit.ts` (walk data), `RoomPlay.free` | implemented, tested |
| One action at a time for the part within reach (1.5 m, roughly ahead, from the room side): curtains, louvres, balcony door, cupboards, fan | `roomkit.ts`, `RoomPlay.pick`, the "use" button / E / controller A | implemented, tested |
| Balconies only where the category has one: the Vikings double (V2), New Bani four, Evandy medium single; solid parapet with cap, side walls, the floor above over it | `roomkit.ts` | implemented |
| The real campus out of the windows and from the balcony: the room is placed on a face of its building at its floor, and the campus is drawn from the same eye before the room | `roomplay.ts` `roomPose`, `Game.renderRoom` | implemented, verified in the running game |
| Occupants: real roommates on their beds with their names, NPC roommates lying on the other beds (a small idle motion), never more than the capacity | `roomplay.ts`, `features/rooms.ts` | implemented |
| Room catalogue, paint, beds, stable allocation | `residence.ts` | implemented (`npm run test:rooms`) |
| Porter's lodges per family | `lodges.ts` | 28 computed, Sarbah and Evandy use their modelled lodges, L01 indoor reception; 2 pending (below) |
| Modelled gates open for a walker, stay open nearby and while in that building's room, close when clear, never through another person | `gates.ts`; Evandy's slot gate, New Pent's three steel gates | implemented, tested |
| Stairs on foot: Commonwealth's hill stairway and court flights (in the ground model), the Diaspora halls' porch steps; the walker and camera ease up and down | `Game.updateWalk`, `walksurf.ts` | implemented, tested |

## The room in its building (the view out)

`roomPose()` finds the residence's footprint (its block's place where the map has one), chooses a face of it long enough
for the room from the room ID (so the same room is always in the same place), takes the floor from the room number
(capped by the building's height, 3.15 m storeys over a 0.45 m plinth) and puts the room's outer face 0.1 m inside the
building's face. Each frame the campus is drawn from that eye position (sky, light and fog of the moment, so day and
night match the world), then the room over it. The campus camera's near plane starts 1.8 m beyond the building's face
along the view, so the building's own facade at the room (drawn panes, frames, balcony fronts standing proud of the
footprint) never covers the window. **Inferred:** which face and where along it; no room-by-room survey exists.

Windows that face the building's face show the campus. A window on another wall (the Vikings double's study-side
louvres, the service modules' windows) opens onto a light well: an inferred shaft wall 1.1 m out, so the campus is never
seen through the building from the wrong side.

## Roommates

- **Server (authoritative):** `supabase/sql/50-rooms.sql`, generated from the catalogue by `scripts/rooms-sql.ts`.
  `claim_room(building, block, category)` keeps a player's place when they choose the same thing again (no reshuffle
  on sign-in, reload or entering the room), otherwise puts them in a random room of that building, block and exact
  category that has a free bed (so compatible players share: occupancy, AC or not, Old/New Pent and block variants are
  all part of the category), or opens a new room when all are full. A per-building lock and the keys (one row per bed,
  one place per player) stop simultaneous claims from overfilling a room. `room_roster()` shows a player their own room
  only; `leave_room()` gives a place up (choosing "I don't stay in a hall or hostel"). Signing out keeps the place.
- **Game:** `features/rooms.ts` claims the place when the player enters their room and saves the server's room and bed
  with the profile. Every bed nobody holds shows an NPC roommate; a real player who joins later takes one of those beds
  (the NPC is gone, nobody is moved, the capacity is never exceeded).
- **Tested:** `bash scripts/rooms-sql-test.sh` on a local PostgreSQL 16 (16 checks: stable re-claim; matching into the
  same room; a third player opening another room; AC and non-AC kept apart; other halls separate; foreign categories and
  missing blocks refused; 40 simultaneous claims filling exactly 10 four-person rooms with no room over four and no bed
  held twice; the roster showing only one's own room; a changed choice freeing the bed; a newcomer taking a free place
  rather than opening a room; `leave_room`).
- **Not live yet:** the SQL has to be run once in the Supabase project (SQL Editor: `supabase/sql/50-rooms.sql`, or the
  whole `supabase/run-all.sql`). Until then, and for guests, the game says plainly that the roommates are NPCs and that
  real-player matching needs signing in; it never presents that as matchmaking. The in-game roommate pictures below use
  the server's own rows from the PostgreSQL test fed into the running game; no two real devices were matched against the
  live project in this session.

## Privacy

Only the player's own room is built (away from the campus), with its own roommates; there is no other interior anywhere
to see or enter. From the room the campus shows only through its window openings and from its balcony; walls and
ceilings are complete and opaque (roofless drawings were construction illustrations only). From entrances, common areas
and stairs the halls are their exteriors. Side windows that do not face out open onto a light well.

## Entrances, gates, lodges and stairs

- **Gates (audit of the residence models):** modelled leaves exist at Evandy (the slot gate) and New Pent (three grey
  steel gates in the brick walls of Blocks A, B and C); both open for a walker and are on the gate system. Old Pent's
  red-and-white gates are drawn swung back (a genuinely open gateway) and stay so; every other residence entrance is an
  open doorway or gateway with no leaf.
- **Lodges:** see the list below. Mensah Sarbah's Administration and Porters' Lodge is already modelled from the owner's
  entrance photos, so no second lodge is built there; Evandy keeps its gatehouse (L06); the Diaspora halls and Diamond
  Jubilee show the indoor reception (L01) on entering. The other positions are computed (inside the entrance where
  there is room, to one side, clear of buildings, roads and solids), not taken from photographs.
- **Stairs:** walkers can use stairways (bikes still cannot). Commonwealth's hill stairway (9 m, eight flights through
  the gateway between the gate houses, then along the north side of the building in its top flights) and its court
  flights, and the Diaspora halls' porch and steps.

### Porter's lodges at each entrance

| Residence | Entrance | Family | Status | Where |
|---|---|---|---|---|
| Jean Nelson Aka Hall | main | L01 | indoor reception (L01) |  |
| Hilla Limann Hall | main | L01 | indoor reception (L01) |  |
| Elizabeth Frances Sey Hall | main | L01 | indoor reception (L01) |  |
| Alexander Kwapong Hall | main | L01 | indoor reception (L01) |  |
| Diamond Jubilee Hall | front | L01 | indoor reception (L01) |  |
| Commonwealth Hall | main | L02 | built | right of the route, outside the entrance (computed) |
| Mensah Sarbah Hall | main | L02 | existing lodge reused |  |
| Volta Hall | main | L02 | built | right of the route, outside the entrance (computed) |
| Akuafo Hall | main | L03 | built | left of the route, outside the entrance (computed) |
| Legon Hall | main | L03 | built | right of the route, outside the entrance (computed) |
| New Pent | main | L04 | built | left of the route, inside the entrance (computed) |
| New Pent | new pent block b | L04 | built | left of the route, inside the entrance (computed) |
| New Pent | new pent block c | L04 | built | right of the route, inside the entrance (computed) |
| Old Pent | main | L05 | built | right of the route, inside the entrance (computed) |
| Old Pent | nairobi court | L05 | built | right of the route, outside the entrance (computed) |
| Old Pent | kampala court | L05 | built | right of the route, outside the entrance (computed) |
| Old Pent | addis ababa court | L05 | built | right of the route, inside the entrance (computed) |
| Evandy Hostel | main | L06 | existing gatehouse reused |  |
| Bani Hostel | main | L07 | built | left of the route, inside the entrance (computed) |
| TF (James Topp Nelson Yankah) | main | L08 | built | left of the route, inside the entrance (computed) |
| ISH 1 | main | L09 | built | right of the route, outside the entrance (computed) |
| ISH 2 | main | L09 | built | left of the route, inside the entrance (computed) |
| Jubilee Hall | main | L10 | built | left of the route, inside the entrance (computed) |
| Valco Trust Phase 1 | main | L11 | no clear place |  |
| Valco Trust Phase 2 | main | L11 | built | right of the route, outside the entrance (computed) |
| Vikings Hall | main | L12 | no clear place |  |
| Akuafo annexes | main | L13 | built | left of the route, outside the entrance (computed) |
| Akuafo annexes | akuafo hall annex b | L13 | built | left of the route, inside the entrance (computed) |
| Akuafo annexes | akuafo hall annex c | L13 | built | right of the route, inside the entrance (computed) |
| Akuafo annexes | akuafo hall annex d | L13 | built | right of the route, outside the entrance (computed) |
| Mensah Sarbah annexes | main | L13 | built | right of the route, outside the entrance (computed) |
| Mensah Sarbah annexes | mensah sarbah annex b | L13 | built | right of the route, inside the entrance (computed) |
| Mensah Sarbah annexes | mensah sarbah annex c | L13 | built | left of the route, outside the entrance (computed) |
| Mensah Sarbah annexes | mensah sarbah annex d | L13 | built | left of the route, outside the entrance (computed) |
| Legon Hall annexes | main | L13 | built | left of the route, inside the entrance (computed) |
| Legon Hall annexes | legon hall annex b | L13 | built | left of the route, inside the entrance (computed) |
| Legon Hall annexes | legon hall annex c graduate hostel  | L13 | built | left of the route, inside the entrance (computed) |
| Volta Hall Annex | main | - | served by Volta Hall's lodge (owner) |  |

## Acceptance (2026-10-16 instructions, section 9)

Pictures are game captures (software rendering in a test browser), in `evidence/`. The harnesses are in
`tools/preview/` (copy to `.preview/`): `apptest.mjs` (the real app, a development build with the dev-only
`__rideTest` hook), `roomcampus.mjs` and `roomsuite.mjs` (rooms in the running game with the campus outside),
`roomplay.html` + `roomwalk.mjs` (the same production room builder and room play in a light scene), `gatetest.mjs`,
`stairtest.mjs`, `lodgeshot.mjs`; `vite.walk.mts` builds the test pages as a production bundle (the dev server is too
slow for a full campus in software rendering). Software rendering draws one or two frames a second, so the tests
step the game's own walking and room code directly where a smooth walk would take minutes.

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Get down and walk in Explore | pass: pause menu offers it; walker beside the parked bike | `modes-explore-vibe-race.jpg` (top) |
| 2 | Get down and walk in Vibe Ride | pass: offered and works with the ride chat bar and the partner present (fake live channel between pages, development build) | `modes-explore-vibe-race.jpg` (middle) |
| 3 | Unavailable in races | pass: no walk button on the race's pause menu or pad; `Game.getDown` returns "not during a race" when called directly; keys do nothing | `modes-explore-vibe-race.jpg` (bottom) |
| 4 | Enter the room and walk round it | pass: popup → hall panel → set accommodation → Enter my room in the real interface; walking with keys and buttons; collision with furniture, walls and closed doors tested (never outside the unit) | `app-walk-to-room.jpg`, `vikings-double-light-scene.jpg` |
| 5 | Balcony and back | pass: Vikings double, New Bani four, Evandy medium single; door opened with E or the button, out onto the balcony, held by the parapet, back inside; with the door closed the balcony cannot be reached | `vikings-double-campus.jpg`, `rooms-windows-balconies-1.jpg`, `app-walk-to-room.jpg` |
| 6 | Curtains | pass: ISH single, "Open curtains" / "Close curtains" from within reach; the glass stays; the campus through it | `rooms-windows-balconies-1.jpg` (bottom) |
| 7 | Louvres | pass: "Open louvres" / "Close louvres", blades turning on their pivots, the frame and wall line solid | `vikings-double-campus.jpg`, `rooms-windows-balconies-1/2.jpg` |
| 8 | Real exterior views | pass: the campus from each room's place in its building (Vikings, Commonwealth, Evandy, Bani, Jubilee, ISH 1, TF, Jean Nelson); side windows onto a light well | `vikings-double-campus.jpg`, `rooms-windows-balconies-*.jpg`, `tf-jeannelson-roommates.jpg` |
| 9 | Compatible real-player roommates | pass on a local PostgreSQL (16 checks, including 40 simultaneous sign-ups); the server's rows shown in the running game. **Not yet live:** the SQL is not installed in the Supabase project | `roommates.jpg`, `scripts/rooms-sql-test.sh` |
| 10 | NPC filling | pass: every bed nobody holds shows an NPC (one player in a four: three NPCs; two players: two NPCs) | `roommates.jpg`, `app-walk-to-room.jpg` |
| 11 | A real player replaces an NPC | pass: the third player takes the free bed; the NPC on it is gone; capacity never exceeded | `roommates.jpg` |
| 12 | Stable room and bed after reconnecting | pass: claiming again returns the same room and bed (L234, bed 1) | `roommates.jpg`, SQL test |
| 13 | White TF walls, Jubilee 2-in-1, no Volta Annex lodge | pass: TF `#f4f3ee`; `jub-2-in-1` two brown wooden singles, selectable; the annex entrance has no lodge (Volta's L02 lodge at its main entrance) | `tf-jeannelson-roommates.jpg`, `rooms-windows-balconies-2.jpg`, `volta-annex-stairs.jpg` |
| 14 | Privacy, gates, stairs | pass: one room only, opaque shell, light wells; four modelled gates open near, hold, close when clear and stay open while another person stands in the gateway; Commonwealth's hill stairway (9 m) and court flights up and down, eased | `gates.jpg`, `volta-annex-stairs.jpg` |

Automated checks run for this change: typecheck, `npm run test:rooms`, `bash scripts/rooms-sql-test.sh`, `npm run geo`,
`npm run test:routes`, `npm run build`, the camera check (0 inside buildings) and route lengths (unchanged).

## Remaining items

- **Real-player matching is not live** until `supabase/sql/50-rooms.sql` is run in the Supabase project; it was tested
  on a local PostgreSQL, not between two devices on the live project.
- **Valco Trust Hostel Phase 1 and Vikings Hall lodges:** the building fronts are 1–2.5 m from the road, so no lodge
  fits outside; their lodges are probably inside the ground floor. Pictures from the owner would place them.
- **Lodge positions** (other than Sarbah, Evandy and L01) are computed, not photo-registered.
- **Room placement in the building** (face, position along it, floor) is inferred; the window view follows from it.
- **The Vikings double's wet area and balcony** offsets and sizes are the pack's proposed fit (V2_WET 2.4 × 2.3 m,
  V2_BAL 1.25 × 4.2 m, parapet 1.05 m), not measurements; its study-side louvres open onto an inferred light well.
- **Corridors and upper-floor common areas** are not modelled (the room opens straight from the entrance, as Volume A
  allows); the stairs implemented are the modelled outdoor ones listed above.
- **A Vibe Ride partner on foot** is not drawn walking (their position is shared only so gates never close on them).
- **Frame rate** in a room (two passes: campus, then room) was not measured on a phone.
