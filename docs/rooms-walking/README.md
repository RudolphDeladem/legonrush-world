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
| Porter's lodges per family | `lodges.ts` | 26 computed; Sarbah, Evandy, Vikings and Valco use their modelled lodges (Vikings and Valco from the owner's photos); L01 indoor reception |
| Modelled gates open for a walker, stay open nearby and while in that building's room, close when clear, never through another person | `gates.ts`; Evandy, New Pent (3), Vikings, Valco Phases 1 and 2 | implemented, tested |
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

The owner's corrections of 2026-10-16: gates are never flat planes, they have shape and texture (most of them timber);
the hall's gate takes you through the entrance into the inner courtyards; the porter's lodge is inside, after the gate,
on the right going in (on the left at Evandy's main block, Hilla Limann and Elizabeth Sey); Evandy's main block, Annex
A and Annex B are open entrances with no gate; the gate opens as soon as the character on foot comes near.

- **Gateways through to the courts (`gateways.ts`).** At each hall built round courts (Commonwealth, Mensah Sarbah,
  Volta, Akuafo, Legon, Jubilee, the four Diaspora halls, Diamond Jubilee) the entrance is a real passage: the hall's
  own model is cut open along the entrance line from the street face to the court (every triangle in the passage's
  volume is clipped away exactly, nothing else), and the passage is lined: side walls with a dado, a soffit, cement
  paving, a framed opening with piers and a lintel on the street, a plain frame on the court side. The passage is open
  ground for the walker (`solids.ts` oriented passages), the court beyond it too. Where a porch stands in front of the
  outline (the Diaspora halls) the passage starts on the porch, inside its columns, and keeps its floor: the gate
  stands where the glass doors were. Commonwealth's passage is its recess's full 5 m (the grilled doors were 5 m
  across). Jubilee's long courtyard is drawn inside the map's outline (no hole), so it is registered as open ground
  from the model's own plan (`hostels.ts`). Diamond Jubilee's front doors lead into the building between its two
  courts: its gateway is 4 m to the right of the front, in line with a court; Jubilee's likewise 4 m to the right.
- **Gate leaves.** Two leaves hang in each gateway, hinged at its sides, meeting in the middle, swinging inward. Each
  hall has its own make, chosen once from four: vertical timber boards in a dark frame with a Z brace and strap hinges,
  framed timber panels with a spindle top, the dark steel grille, a painted steel sheet with a spear-headed bar top.
  Most are timber; the timber has a grain texture with knots and board joints in one of four stains. Every leaf opens
  when the character on foot is within 12 m and closes once they are 26 m away and the swing is clear (`gates.ts`).
- **Other halls and hostels.** Old Pent's four courts, the halls' annexes, ISH 1 and ISH 2 have a free-standing gate at the entrance: two
  piers with caps, a short wall either side, the leaves. Bani's entrance is on its driveway: a driveway
  gate stands across the driveway at the first place along the way in that is a gate's width, and it opens for the bike
  as well as for walkers (from 30 m, so it is open before the bike reaches it). New Pent, Vikings and both Valco phases
  keep the gates their sites already model. Evandy has no gate: its brown slot gate now stands open for good.
- **Lodges.** At the court halls the porter's lodge is a room in the passage's side wall, just inside the gate, with a
  counter window, glazing bars, a sill, key cubbies on its back wall, its door further along and the PORTER'S LODGE
  sign over the window: on the right going in, on the left at Limann and Elizabeth Sey. Mensah Sarbah keeps its modelled
  Administration and Porters' Lodge; Evandy its gatehouse; Valco and Vikings their entrance blocks. At the other
  residences the computed lodge is now always inside the gate (never before it), on the right where it fits.
- **Stairs.** The walker climbs any modelled step, porch or stair (`meshcollide.ts` walk grid: every level face of the
  drawn models is a surface to stand on; a riser up to 0.46 m is a step; anything between knee and head height above
  the feet stops them). Commonwealth's hill stairway and court flights, the Diaspora porches and the hostels' entrance
  steps all use it.

### Gates and porter's lodges at each entrance (as built; `tools/preview/lodgetable.mjs`)

The Diaspora halls and Diamond Jubilee also show their indoor reception (L01) on entering; their gateway's side wall
has the lodge window too (on the left at Limann and Elizabeth Sey). Two Old Pent courts have no lodge since lodges may
no longer stand before the gate and no place inside fits; TF's entrance opens onto an 18 m forecourt, too wide for a
gate, so it has none yet.

| Residence | Entrance | Gate | Lodge |
|---|---|---|---|
| Jean Nelson Aka Hall | main | passage to the court (21.6 m), panels gate | indoor reception (L01) |
| Hilla Limann Hall | main | passage to the court (20.3 m), boards gate | indoor reception (L01) |
| Elizabeth Frances Sey Hall | main | passage to the court (21 m), sheet gate | indoor reception (L01) |
| Alexander Kwapong Hall | main | passage to the court (23.1 m), panels gate | indoor reception (L01) |
| Diamond Jubilee Hall | front | passage to the court (9.7 m), boards gate (the gateway is 4 m to the right of the mapped entrance point, in line with the court) | indoor reception (L01) |
| Commonwealth Hall | main | passage to the court (11.6 m), panels gate | in the gateway's right wall, inside the gate |
| Mensah Sarbah Hall | main | passage to the court (14.5 m), panels gate | existing gatehouse reused |
| Volta Hall | main | passage to the court (11.2 m), boards gate | in the gateway's right wall, inside the gate |
| Akuafo Hall | main | passage to the court (17.5 m), boards gate | in the gateway's right wall, inside the gate |
| Legon Hall | main | passage to the court (17.4 m), panels gate | in the gateway's right wall, inside the gate |
| New Pent | main | the site's own gate | L04, left of the route, inside the gate |
| New Pent | new pent block b | the site's own gate | L04, left of the route, inside the gate |
| New Pent | new pent block c | the site's own gate | L04, right of the route, inside the gate |
| Old Pent | main | free-standing gate (boards) | L05, right of the route, inside the gate |
| Old Pent | nairobi court | free-standing gate (boards) | no clear place |
| Old Pent | kampala court | free-standing gate (boards) | no clear place |
| Old Pent | addis ababa court | free-standing gate (boards) | L05, right of the route, inside the gate |
| Evandy Hostel | main | open entrance | existing gatehouse reused |
| Bani Hostel | main | driveway gate (boards), opens for the bike too (a driveway gate across the entrance road: it opens for the bike as well as for walkers) | L07, right of the route, inside the gate |
| James Topp Nelson Yankah Hall (TF) | main | the driveway is 18 m wide at its narrowest: no gate placed | L08, left of the route, inside the gate |
| International Students Hostel 1 | main | free-standing gate (sheet) | L09, right of the route, inside the gate |
| International Students Hostel 2 | main | free-standing gate (panels) (the gate stands 20 m in from the entrance point, clear of the road) | L09, left of the route, inside the gate |
| Jubilee Hall | main | passage to the court (13 m), sheet gate (the gateway is 4 m to the right of the mapped entrance point, in line with the court) | in the gateway's right wall, inside the gate |
| Valco Trust Hostel Phase 1 | main | the site's own gate | existing gatehouse reused |
| Valco Trust Hostel Phase 2 | main | the site's own gate | existing gatehouse reused |
| Vikings Hall | main | the site's own gate | existing gatehouse reused |
| Akuafo Hall annexes | main | free-standing gate (sheet) | L13, right of the route, inside the gate |
| Akuafo Hall annexes | akuafo hall annex b | free-standing gate (sheet) (the gate stands 7 m in from the entrance point, clear of the road) | L13, right of the route, inside the gate |
| Akuafo Hall annexes | akuafo hall annex c | free-standing gate (sheet) (the gate stands 9 m in from the entrance point, clear of the road) | L13, right of the route, inside the gate |
| Akuafo Hall annexes | akuafo hall annex d | free-standing gate (sheet) | L13, left of the route, inside the gate |
| Mensah Sarbah annexes | main | free-standing gate (panels) (the gate stands 6 m out from the entrance point, clear of the road) | L13, right of the route, inside the gate |
| Mensah Sarbah annexes | mensah sarbah annex b | free-standing gate (panels) | L13, right of the route, inside the gate |
| Mensah Sarbah annexes | mensah sarbah annex c | free-standing gate (panels) | L13, left of the route, inside the gate |
| Mensah Sarbah annexes | mensah sarbah annex d | free-standing gate (panels) | L13, left of the route, inside the gate |
| Legon Hall annexes | main | free-standing gate (panels) | L13, right of the route, inside the gate |
| Legon Hall annexes | legon hall annex b | free-standing gate (panels) (the gate stands 8 m in from the entrance point, clear of the road) | L13, right of the route, inside the gate |
| Legon Hall annexes | legon hall annex c graduate hostel  | free-standing gate (panels) (the gate stands 12 m in from the entrance point, clear of the road) | L13, right of the route, inside the gate |
| Volta Hall Annex | main | free-standing gate (boards) | served by Volta Hall's lodge |

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

## Room activities, the character view and the controller (2026-10-16, second instructions)

- **Testing access:** every account can enter a room of each type at every hall and hostel (the hall's panel: "Testing:
  every hall's rooms are open to you", a room type and "Enter a room here"). `TEST_ALL_ROOMS` in `walkui.ts` turns it
  off before launch.
- **Character view:** in a room (and only there), V, the View button or the controller's top face button switches
  between the eye view and a view from behind the character; the four bike views are unchanged on the bike.
- **Activities:** at a free lower bed, Sleep (the room dims, the clock runs through the night, Wake up); at a desk or
  its chair, Sit and study (the character sits; the whole screen becomes the laptop: the monitor's frame, a desktop of
  files about the University of Ghana's history that open in windows, a taskbar and clock, Shut down returns to the
  room); at a shower or basin, or at the door where the bath is shared, Take a bath. The activity has its own button
  beside the use button (open, close), key F, the controller's left face button; E or Cross does whichever is shown.
- **Roommates:** real players in the room appear standing (online) or asleep (away) and can be clicked or chosen in the
  residents list to open a phone's messaging app (messages go over the room's live channel and are not saved). NPCs
  cannot be messaged, and they are not always asleep: by the room, bed and hour they sleep, read, study, stand, cook or
  are at the bath.
- **Controller:** Cross jumps on the bike (free ride and guided Explore ride), the left stick pulled down walks backward,
  the stick changes lanes and Cross jumps during the guided destination ride. The D-pad moves an on-screen pointer and
  Cross clicks under it; on a PlayStation pad the touchpad's press clicks and, once allowed (Controller panel, Chrome and
  Edge), the touchpad moves the pointer like a laptop's. Popups (the hall's "What would you like to do?") are moved
  through with the D-pad and chosen with Cross.
- **Invisible blockers:** the bridge footways' railing posts over the Legon Road cutting stopped the bike in the
  underpass below (they now stop only someone on the deck); the lamp glows that collided everywhere were fixed in the
  Okponglo batch. A full-width scan of every campus road found no other blocker on a road (the remaining stops are real
  ends: buildings, steps, car park ends).

## Remaining items

- **Real-player matching is not live** until `supabase/sql/50-rooms.sql` is run in the Supabase project; it was tested
  on a local PostgreSQL, not between two devices on the live project.
- **Valco Trust Phase 2:** its entrance block is drawn the same as Phase 1's (the owner's photo shows one of the two);
  confirm if Phase 2's differs.
- **Lodge positions** (other than Sarbah, Evandy, Valco and Vikings) are computed or placed in the gateway's side wall,
  not photo-registered; the gate makes are chosen per hall, not from photographs.
- **Diamond Jubilee and Jubilee gateways** stand 4 m beside the mapped entrance point, in line with a court, because
  the front doors lead into the building rather than straight into a court.
- **Evandy Annex B's courtyard** has no entrance of its own on the map (one entrance for the hostel), so no passage is
  cut there yet.
- **Room placement in the building** (face, position along it, floor) is inferred; the window view follows from it.
- **The Vikings double's wet area and balcony** offsets and sizes are the pack's proposed fit (V2_WET 2.4 × 2.3 m,
  V2_BAL 1.25 × 4.2 m, parapet 1.05 m), not measurements; its study-side louvres open onto an inferred light well.
- **Corridors and upper-floor common areas** are not modelled (the room opens straight from the entrance, as Volume A
  allows); the stairs implemented are the modelled outdoor ones listed above.
- **A Vibe Ride partner on foot** is not drawn walking (their position is shared only so gates never close on them).
- **Frame rate** in a room (two passes: campus, then room) was not measured on a phone.
