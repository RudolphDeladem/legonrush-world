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
| Porter's lodges per family at each configured entrance (L02–L05, L07–L13 built; L01 an indoor reception shown on arrival; L06 the existing Evandy gatehouse) | `game/lodges.ts` | implemented, placements provisional |
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

RESULTS

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
- Lodge placements are computed (inside the entrance, to one side, clear of buildings, roads and solids); they are
  not registered to photographs of each lodge.
- Walking is reachable from Explore rides only (not from races or timed modes).
- Frame rate in rooms and with lodges was not measured on a phone.
