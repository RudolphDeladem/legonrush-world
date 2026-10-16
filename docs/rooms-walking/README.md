# Walking, entrances, porter's lodges and allocated rooms

The owner's two volumes (A: gameplay; B: room and lodge construction atlas) and the two-part room reference pack.
They remain private: only the pack's derived room layout data is in the repository (`src/data/rooms.json`, layouts
R01–R31 and S01–S04, rounded). Observed references are kept apart from proposed layouts. Anything not settled by the
volumes is marked **pending** below and in the code; nothing is invented to close it.

## What is in the game

| Part | Where | State |
|---|---|---|
| Get down and walk (Explore rides; pause menu "Get down and walk", the free-ride pad's walk button) | `Game.getDown`, `updateWalk`, `rideBike`; `ui/walkui.ts` | implemented |
| The same character on foot (skin, body, outfit colour, hair or helmet, backpack) | `game/walker.ts` | implemented |
| Bike parked where you got down, not moving and not duplicated; remount only within 3 m | `Game.getDown`, `rideBike` | implemented |
| Nearby list (residences, halls and departments within 150 m, with left/right/ahead/behind), a beacon on the chosen one | `walkui.ts` | implemented |
| Entrance popup "Enter X?" at 4.5 m, gone beyond 7 m or on remounting, never while riding | `walkui.ts` | implemented |
| Hall panel: Enter my room, Set my accommodation, Walk around the open common area, Leave | `walkui.ts` | implemented |
| Departments and the Great Hall: no personal room, a "no interior" note | `walkui.ts` | implemented |
| Accommodation in signup (step after the hall, can be skipped) and in the profile (Change) | `ui/accommodation.ts`, `main.ts` | implemented |
| Room catalogue: 25 residences, 69 categories, 13 lodge families, room paint | `game/residence.ts` | implemented |
| Stable private room per character and choice; Valco kitchen group of 12 rooms | `residence.allocate` | implemented |
| Room interior built only for the allocated room, alone, away from the campus (privacy) | `game/roomkit.ts`, `Game.enterRoom` | implemented |
| Blurred transition from the entrance into the room and back, no corridor walk | `walkui.ts` | implemented |
| Room views: several fixed views per room plus drag to look round, Next view, Leave room | `Game.roomCamera`, `walkui.ts` | implemented |
| Porter's lodges per family at each configured entrance (29 built for L02–L05 and L07–L13; L01 an indoor reception shown on arrival; L06 the existing Evandy gatehouse) | `game/lodges.ts` | implemented, placements provisional |
| Porch and steps walkable at the Diaspora halls (the walker stands on them instead of sinking) | `game/walksurf.ts`, `halls.ts` | implemented there only |
| Entrance gate that opens for a walker, stays open while near or in that building's room, closes when clear | `game/gates.ts`; Evandy's slot gate | implemented for the one modelled leaf |

## Room rules (checked by `npx tsx scripts/room-tests.ts`)

- Every two-person room has two single beds; every four-person room has two bunk units.
- Traditional hall beds (Commonwealth, Sarbah, Volta, Akuafo, Legon) are brown wooden structures.
- Paint: white groups as listed; Bani blue (#a9c8e2); Evandy cream (#ecdcb8); TF **pending** (neutral grey, not a
  made-up final colour).
- Higher occupancies only where the volumes put them: Jubilee five-person, TF six and eight, ISH 1 and ISH 2
  converted eight.
- Annexes four; Valco one or two with en-suite shower and toilet and a communal kitchen per 12 rooms; New Pent
  1/2/4 with AC only in its single and double variants; Old Pent 2/4 without AC; Vikings' double AC variant; Evandy's
  inner-room three apart from the ordinary three; Bani's block variants.
- Changing hall or block clears an incompatible category; an invalid saved residence is cleared on load (legacy
  profiles keep everything else).

## Coverage

| Residence | Lodge | Entrances | Blocks | Categories |
|---|---|---|---|---|
| Jean Nelson Aka Hall | L01 | 1 | - | dia-2, dia-4 |
| Hilla Limann Hall | L01 | 1 | - | dia-2, dia-4 |
| Elizabeth Frances Sey Hall | L01 | 1 | - | dia-2, dia-4 |
| Alexander Kwapong Hall | L01 | 1 | - | dia-2, dia-4 |
| Diamond Jubilee Hall | L01 | 1 | - | dj-4, dj-2-ensuite, dj-1-ensuite, dj-1-shared |
| Commonwealth Hall | L02 | 1 | - | trad-1, trad-2, trad-3, trad-4 |
| Mensah Sarbah Hall | L02 | 1 | - | trad-1, trad-2, trad-3, trad-4 |
| Volta Hall | L02 | 1 | - | trad-1, trad-2, trad-3, trad-4 |
| Akuafo Hall | L03 | 1 | - | trad-1, trad-2, trad-3, trad-4 |
| Legon Hall | L03 | 1 | - | trad-1, trad-2, trad-3, trad-4 |
| New Pent | L04 | 3 | 3 | np-1-ac, np-1, np-2-ac, np-2, np-4 |
| Old Pent | L05 | 4 | - | op-2, op-4 |
| Evandy Hostel | L06 | 1 | 3 | ev-2, ev-3, ev-3-inner, ev-4, ev-1-std, ev-1-med-balcony, ev-1-small, ev-1-med |
| Bani Hostel | L07 | 1 | 8 | bani-4, bani-2-abc, bani-1-cd-kitchen, bani-1-ab-kitchen, bani-2-annex, bani-2-adm201, bani-1-d-middle, bani-1-d-side, bani-1-admin, bani-1-f-shared, bani-1-f-ac-shared, bani-1-f-ac-kitchen, bani-2-f101, bani-4-new |
| James Topp Nelson Yankah Hall (TF) | L08 | 1 | - | tf-2-sc, tf-4-sc, tf-4, tf-6, tf-8 |
| International Students Hostel 1 | L09 | 1 | - | ish-1, ish-2, ish-c2, ish-c3, ish-c4, ish-c8 |
| International Students Hostel 2 | L09 | 1 | - | ish-1, ish-2, ish-c2, ish-c3, ish-c4, ish-c8 |
| Jubilee Hall | L10 | 1 | 2 | jub-1, jub-2, jub-3, jub-4, jub-2-sc, jub-flat-2-1?, jub-w-3, jub-w-3-k, jub-w-4, jub-w-4-k, jub-w-5, jub-w-5-k |
| Valco Trust Hostel Phase 1 | L11 | 1 | - | valco-1, valco-2 |
| Valco Trust Hostel Phase 2 | L11 | 1 | - | valco-1, valco-2 |
| Vikings Hall | L12 | 1 | - | vk-1, vk-2, vk-2-ac, vk-4 |
| Akuafo Hall annexes | L13 | 4 | 4 | annex-4 |
| Mensah Sarbah annexes | L13 | 4 | 4 | annex-4 |
| Legon Hall annexes | L13 | 3 | 3 | annex-4 |
| Volta Hall Annex | - | 1 | - | annex-4 |

## Tests T01–T35

Run in the game (a production bundle of `tools/preview/walk.html`, software rendering): `walktest.mjs` (Jean Nelson
Aka Hall, a four-person Diaspora room), `gatetest.mjs` (Evandy's slot gate), `lodgeshot.mjs` (one lodge per family)
and `npm run test:rooms` (the catalogue rules). Software rendering draws a few frames a second, so the tests place the
walker by the entrance instead of walking the whole approach; the short walks they do make move and collide normally.

| Test | Result |
|---|---|
| T01 dismount and walk | pass on Explore rides (route and free ride); other modes do not offer it |
| T02 dismount beside an obstruction | pass: a clear side spot is searched; "no clear ground" is reported instead of a bad state; the bike stays parked, one bike |
| T03 no entry while riding or away from an entrance | pass (the popup only exists on foot, within 4.5 m) |
| T04 popup appears, clears on leaving or remounting | pass (in 4.5 m, out 7 m, one popup) |
| T05 nearby list | pass: buildings within 150 m with left/right/ahead/behind |
| T06 selecting a target | pass: beacon on the chosen entrance, no teleport, entry still needs the walk |
| T07 halls vs departments | pass: hall panel at residences; departments and the Great Hall get "no interior" |
| T08 enter the assigned room | pass: room JN230, layout R04, two bunks; same character and choice give the same room; no assignment asks for one |
| T09 smooth transition | pass: blur in and out, no corridor walk; a second enter while inside is refused |
| T10 look around | pass: several views per unit, drag/keys/stick, pitch limited, camera kept inside the room bounds |
| T11 leave the room | pass: back on foot at the entrance, bike where it was parked; riding again from beside it works |
| T12 common area and stairs | **partial**: open ground only; stairs and landings are not built |
| T13 riding still works after repeated cycles | pass in the test sequence (ride, walk, room, walk, ride); camera check 0 inside buildings, route lengths unchanged |
| T14 room colours | pass: white groups, Bani blue, Evandy cream; TF pending (neutral) |
| T15 gate opens for the walker | pass at Evandy (open within 6 m; the closed leaf no longer blocks the opening) |
| T16 a second entrance while walking | pass by design (no remount needed); only one modelled gate leaf exists to show it |
| T17 stays open nearby | pass (still open at 15 m) |
| T18 occupancy keeps it open | pass (open while in the Evandy room) |
| T19 closes when clear | pass (closed again at 40 m; closes only when the swing is clear of the walker and the bike) |
| T20 collision follows the leaf | pass (blocked when closed, clear when open) |
| T21 lodge just inside, one side | **partial**: 29 lodges built, 5 L01 indoor receptions, Evandy's gatehouse reused; Valco Phase 1 and Vikings have no ground between the frontage and the road (pending); Volta annex has no family |
| T22 13 family assignments | pass (`npm run test:rooms`) |
| T23 families stay consistent | pass: one fixed template per family, deterministic placement |
| T24 cycling and transitions after the additions | pass (as T13) |
| T25 changing hall or block | pass: options refresh, incompatible choice cleared |
| T26 annexes and Valco | pass: annexes four; Valco one or two, en-suite, kitchen group of 12 rooms |
| T27 New Pent, Old Pent, Vikings | pass |
| T28 Evandy and Bani variants | pass |
| T29 higher occupancies | pass: only Jubilee, TF, ISH 1 and ISH 2 |
| T30 traditional single and three | pass: small chamber; three = two outer and one inner place |
| T31 paint | pass (as T14); exteriors and lodges unchanged |
| T32 privacy | pass: only the allocated room is built, alone, and the campus is hidden while it is shown; no other interior exists to see |
| T33 room matches the selection | pass; changing the profile clears an incompatible room |
| T34 Valco kitchen grouping by rooms | pass |
| T35 legacy profiles | pass: the new field is optional; an invalid one is cleared without touching the rest |

## Pending (not settled by the volumes, or not done)

- TF (James Topp Nelson Yankah) room paint: pending; rendered neutral.
- Volta Hall Annex lodge family: not assigned; no lodge built there.
- Traditional two- and four-person inner split and the Jubilee "2-1" flat notation (`jub-flat-2-1`): shown in the
  form as unresolved and cannot be chosen.
- Common area: open ground round the hall only. Stairs, landings and the confirmed access bounds of corridors are
  not built, so T12's stair part is not met.
- Departmental stairs: not built.
- Gates: only Evandy's slot gate is a modelled leaf; other entrances have open gateways (nothing to swing).
- Old Pent court names as entrances: the alias is inferred from the map, not confirmed.
- Vikings double-room video: not in the pack; the Vikings double uses the volume's text only.
- Valco Phase 1 and Vikings: the building's front is 1 to 2.5 m from the road, so no lodge fits outside; their
  lodges are probably inside the ground floor, which the volumes do not confirm. No lodge is built there yet.
- Porches and steps are walkable only at the four Diaspora halls; at other entrances the walker stands at ground
  height and can look sunk into a raised porch.
- Lodge placements are computed (inside the entrance, to one side, clear of buildings, roads and solids); they are
  not registered to photographs of each lodge.
- Walking is reachable from Explore rides only (not from races or timed modes).
- Frame rate in rooms and with lodges was not measured on a phone.
