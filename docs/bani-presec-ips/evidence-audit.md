# Bani Hostel, PRESEC and IPS Road: evidence audit

The brief is `Bani_PRESEC_IPS_Detailed_Claude_Brief.pdf`. It has 20 street pairs, the annotated aerials R1-R4 and the
game map G1.

| Piece | File |
| --- | --- |
| Models | `src/game/banipresec.ts` |
| Numbers | `src/game/bpiplan.ts` |
| Cameras | `src/game/bpiviews.ts` |

The cameras are preview views:
- `bpi1`-`bpi20`, one per pair;
- the second arrow branches `bpi3b`, `bpi6b`, `bpi7b`, `bpi9b`, `bpi10b` and `bpi20b`;
- the overhead checks `bpiR1`-`bpiR4`;
- `bpiG1`, the whole section from above.

The comparison images are in this folder:
- `pairs/pairNN.jpg`, one per pair: the real photo, the owner's game screenshot, the game before, and the game after,
  from the same camera;
- `overhead-R1.jpg` ... `overhead-R4.jpg`: each aerial next to the game before and after, seen from above;
- `G1-coverage.png`: the loaded features, with `G1-owner-game-map.jpg` beside it.

The cameras sit at each arrow's tail and look along its head. The aerials were fitted to the map by the mapped roads and
outlines, so the camera positions are approximate, not surveyed. Several cameras were moved a few metres to keep them
on a carriageway:
- Pair 1: onto the forecourt by the road;
- Pairs 11 and 20: onto the northbound side, as their photographs show.

## Why the section looked generic: a data audit

The section's source data is complete in the master geography. What was missing was modelling, not data. The game
drew the mapped roads, but:
- every outline used the generic cream-and-red classroom template;
- every open parcel used the default lawn;
- `life.ts` added its generic props:
  - palm avenues along the main roads;
  - lawn trees;
  - the blue "UG SHUTTLE" shelter at every transport place.

The places that drew a shelter here are "UPS" at (981, -984), "UPSA Taxi Rank" at (1009, -928) and "Presec" at
(968, -1101).

**Loaded extent:** x 640 ... 1120, z -1360 ... -540, in game metres (x east, z south). It is shown in
`G1-coverage.png`.

**Transform:** the one transform `master-to-game` uses: x = (lng + 0.1871) x 110778.848, z = (5.6518 - lat) x 110574.

**Roads (source ids; road indices in `src/data/legon-map.json`):**

| Road | Index | Role |
| --- | --- | --- |
| J.J. Rawlings Avenue | 743 | southbound carriageway |
| J.J. Rawlings Avenue | 792 | northbound, south of z -1091 |
| J.J. Rawlings Avenue | 692 and 747 | northbound, north of z -1091 |
| IPS Road | 773 and 981 | the IPS Road junction |
| IPS Road | 1137 | the slip road at the GOIL corner |
| (unnamed) | 1338 | access loop at the GOIL corner |
| (unnamed) | 1337 | service road west of the avenue |
| (unnamed) | 1085 | the side road opposite PRESEC (z -1196) |
| (unnamed) | 690 | PRESEC's entry road from (1023, -1174) |
| (unnamed) | 1036, 1113 | Bani lanes |
| (unnamed) | 688, 824, 825 | the Shell forecourt roads |
| (footway) | 1393 | the walk along the avenue's west side |

Road names follow the source records, not the screenshots. The screenshots call the avenue "Legon E Rd", and R1 and R3
put an "IPS ROAD" label on it; the real IPS Road is the road running east from the junction.

**Outlines:**
- The Bani blocks by the avenue: osm:way/1334286313 and osm:way/1334286314.
- The Bani Hostel blocks: osm:way/1186044050, 1186044051, 1184497715 and 1184497716.
- Mellow Foods: osm:way/708263265.
- The courtyard buildings south of the side road: osm:relation/19263472 and 19263473, osm:way/1138519159.
- The station: the landuse the old map names "Oando", which is today's Shell (matched by geometry, R2).
- The tyre shop: osm:way/394252483 and 394252482.
- UGBS: osm:way/601016706.
- GOIL (`upsaplan.ts`).
- PRESEC's landuse: osm:way/339022268.

## Pairs to the aerials

| Pairs | Aerial | Place |
| --- | --- | --- |
| 1-6 | R2 | the Shell frontage and the open parcels, from about z -570 to z -760 |
| 7 | R1 | the approach to the IPS Road junction at z -830, both branches |
| 8, 9, 10 | R3 | the corner, the trading ground, the "UPS" shelter |
| 11-20 | R4 | the PRESEC junction, the gate, the Bani side road |

## Old to new

| Game object before | Decision | Now | Evidence |
| --- | --- | --- | --- |
| The lawn between the Shell forecourt and the avenue | reshape | paved forecourt to the kerb, a low planted kerb | Pair 1, R2 |
| (no pylon) | add | the Shell pylon with its emblem, prices (reference-date artwork) and FuelSave panel | Pair 1 |
| The palm avenue and lawn trees along the corridor | remove (kept off by the model's keep-out areas) | one mature drooping palm, sparse broadleaf scrub trees | Pairs 2-6, R2 |
| The lawn on the open parcels either side of the avenue | reshape | scrub: red soil patches, dry and green grass, shrubs, tufts | R2, Pairs 2-6 |
| (none) | add | the skeletal billboard frame (no panel) | Pair 2 |
| (none) | add | the tall billboard, edge-on, on a slim mast | Pair 5, R2's square |
| (none) | add | two lattice towers and their line, joined to the tower on the UGBS side | Pairs 3-5 sightlines (tower B at their intersection) |
| (none) | add | concrete distribution poles with crossarms and wires along the west verge | Pairs 1-4 |
| (none) | add | billboards on their own supports along the corridor, on the verges and in the median | Pairs 3, 6, 7 |
| (no outline in any source) | add, provisional | the unroofed frame: a ring wall and an open two-level column frame, its top left open | R2 only |
| (none) | add | the overhead signal arm with four heads over the approach | Pair 7, R1 |
| The blue shelter at "UPSA Taxi Rank", the lawn at the corner | remove / reshape | compacted trading ground, the block-paved walk, the stone-lined open drain and its crossing slab, three white cabinets, the exposed rust-coloured frame, the covered stall roof, kiosks, vendors' umbrellas (props), the tall mast, boards, trees | Pairs 8, 9, R3 |
| The blue shelter at "UPS" | replace | the pale concrete shelter: a deep roof slab, a rounded south end wall, a shaped north wall, the dark board, the hard apron; the tall portrait billboard behind it, the horizontal board ahead | Pair 10, R3 |
| (none) | add | two overhead signal arms at the PRESEC junction | Pairs 11, 20 |
| The straight spur toward the generic blocks | reshape | PRESEC's gate: the pale span with PRESEC on red piers and the crest; the splayed wing walls lettered PRESBYTERIAN BOYS SECONDARY SCHOOL; the blue stepped plinth; the white boundary wall along the avenue; the stone-faced raised verges; the paved walks and the painted posts; three portrait boards (artwork not copied); dense trees | Pairs 12-14, R4 |
| The generic blocks on osm:way/1334286313 and 1334286314 | reshape | the cream five-storey block with its dark red hip roof and AC units; the peach and pale four-storey block with its weathered tiled roof, screened by trees and conifers | Pairs 15-19, R4 |
| The blue shelter at "Presec" | replace | a low blue-roofed, poster-covered roadside shelter and three kiosks on the west verge | Pair 20 |
| (none) | add | the low grey block wall and its small boards along the side road, the poles and wires, the shaded gathering ground with its trees and benches, the dusty mouth, the elevated billboard | Pairs 15-19, R4 |

## Deletion list

**Removed:**
- **ml:9b53eda1-fc34-43c2-a0e3-7a0b484bb241** (excluded in `corrections.json`). This 38 m machine-detected bar along
  the side road's south side is, in R4, two small sheds with open ground between them, as Pairs 16, 17 and 19 show.
  The two sheds are modelled instead (provisional).
- **ml:0782e359-6e64-4fdb-b77a-1373e5234acd** (excluded). R4 shows open scrub crossed by a dirt track; no building.
- **The generic "UG SHUTTLE" shelters** at "UPS", "UPSA Taxi Rank" and "Presec" (`bpiplan.ts` MODELLED_STOPS). The
  places, their labels and routing are kept.
- **Generated palms, lawn trees and props** inside the model's keep-out areas.

**Not removed:**
- the school buildings inside PRESEC (screened by trees, not deleted);
- the courtyard buildings south of the side road;
- the four Bani Hostel blocks;
- Mellow Foods;
- every other outline in the extent.

## Unresolved, estimated or not supplied

- **The unroofed frame east of the avenue (R2).** It has no outline in OpenStreetMap, the UPSA extension, Overture or
  the machine-learned footprints: a source coverage gap. Its footprint is traced from R2. Its height (two levels),
  identity and construction state are not confirmed. It is not called UGBS.
- **The four Bani Hostel blocks** (osm:way/1186044050, 1186044051, 1184497715, 1184497716). They are in no pair, so they
  keep the generic model. Their storey count and paint are unverified.
- **Named Bani facilities.** The map pins (Bani Hostel, Bani Facility Block, Perseverance Block, Mr Wu's) are not
  attached to particular outlines.
- **Storeys.** The cream block's five and the peach block's four come from the visible floor bands. The ground floors
  are hidden.
- **Signals.** The head counts and facings are those visible in Pairs 7, 11 and 20. No timing or unseen heads are
  modelled.
- **Lattice towers.** Tower B (825, -699) is where three sightlines meet. Tower C (690, -692) is inferred from Pair 4's
  far tower.
- **Billboards.** The positions of those along the corridor are inferred. The artwork is generic, with no words or
  numbers copied.
- **Sign text.** Only PRESEC, PRESBYTERIAN BOYS SECONDARY SCHOOL and the Shell pylon are lettered. The small boards, the
  side-road boards and the portrait boards are left without text.
- **Levels.** No terrain survey was supplied. The drain depth (0.6 m), the stone verges (0.75 m) and the kerbs are
  adjustable estimates.
- **PRESEC's gate.** Its place is where the entry road crosses the school's mapped boundary. The splay of the wing walls
  is read from Pairs 13 and 14.
