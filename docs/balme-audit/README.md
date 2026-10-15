# Balme Library reconstruction audit (2026-10-15): evidence ledger

Source: the owner's three-part audit (`Balme_Library_Reconstruction_Audit_Part1-3.pdf`, 146 pages, items C01-C29 /
BAL-001 to BAL-029). The PDFs stay in the owner's private archive (not in this repository). Comparison:
`comparison-sheet.jpg` (the audit's photo left, the game right). Owner: "pay attention to the statues and their
postures too, i need 100% mimicking".

Labels: **change** (done in this batch), **estimated**, **open** (left for a later batch or the owner).

| Item | Code | Change / state |
|---|---|---|
| C18 six statues | `statues.ts`, `balmepent.ts` BP.statueKinds, `balme.ts` | The six white pawns replaced by six different silver figures on low bases (square slab, round disc), placed from the elevated photo I030: west lawn, from the library end: footballer, upright figure, robed figure; east lawn: book-holder, draped woman, suited man. Facing south down the lawns. |
| C19 STAT-01 footballer | `statues.ts` footballer | Shirt, shorts and socks; the left leg bearing, the right foot on the ball before him; both arms held away from the body, hands low (I053). Placed by the cross wall (the photo's two stone tiers behind it). |
| C20 STAT-02 draped woman | `statues.ts` draped | Head-scarf, long dress, the drape down the side; one arm raised forward and up gripping a short cylinder pointing down, the head turned up to it (I018). **Open:** which arm (the right is used). |
| C21 STAT-03 suited man | `statues.ts` suited | Jacket with lapels and trousers, feet apart; a long rectangular object held diagonally across the body, low at his right hip, high past his left shoulder; layered pedestal (I014). The object is not named. |
| C29 STAT-04 book-holder | `statues.ts` bookHolder | Upright figure, a book held in one hand before the chest, the other arm down, at the owner's arrowed place by the east cross wall (I067). **Open:** a close photo would fix the hand and the book. |
| West lawn middle and near figures | `statues.ts` standing, robed | Read from I030 only: an upright figure with arms at the sides and a robed figure with arms a little out. **Open:** ground photos of both. |
| C22 roundabout group | `statues.ts` graduates, `balmepent.ts` | Two graduates side by side in mortarboards and gowns, their inner arms raised together to a ribbed torch with a flame, on a tall rectangular stone plinth with a plaque, larger than life, at the island's centre. **Estimated:** facing south (the approach). |
| C23 island planting | `balmepent.ts` | The ring of equal round bushes replaced by irregular shrub groups (some flowering red and yellow), prickly-pear cactus clumps, pale rocks round the plinth and two palms; lawn gaps kept. Kerb and drain unchanged. |
| C01 centre mass | `balme.ts` LIB_TALL | The tall window grid on the centre block removed: solid white wall with one small square opening high in each bay (the clerestory band of I043, I058). |
| C02 entrance | `balme.ts` library extras | A taller entrance pavilion with its own hipped tiled roof stands 1.4 m forward of the low ranges; the arch cut through its face with a pale border, THE BALME LIBRARY lettered round the arch's head, the grey roller shutter in the head, brown door leaves, narrow brown shuttered windows in white frames, glazed notice cases, stone-faced planter walls, red base. The low ranges either side have wide brown-framed windows high in the wall. |
| C03 clock tower | `balme.ts` | Square grey-blue patterned panel round a white dial with dot markers and a patterned centre; brown lattice windows in the stage below; brown balustrade with white posts; a small brown door onto the balcony; the lantern a white box with brown louvred shutters, a low red cap, a bulb finial and a slender rod (the tall red spire removed). |
| C07 octagon windows | `balme.ts` octagon, kiosks | The window strips on the four corner kiosks removed; one dark louvred octagon in the blank wall facing the road and a tall narrow octagon in each end wall; the red base a metre high; a finial ball on each roof. **Estimated:** the three kiosks no photo shows are given the same pattern as I032. |
| C08 screen wall | `balme.ts` screen | The coarse lattice replaced by a dense grid of small square holes (about 10 cm apart) over the red base, piers kept. |
| C11-C12 bookshop front | `balmewest.ts` bookshop | The front to the square rebuilt: the two-storey portico recessed between the two forward masses under the roof, two tall columns, the raised paved floor, the door with black grille leaves and the diamond grille over them, the white-and-blue UNIVERSITY OF GHANA BOOKSHOP board, a grilled window either side, a dark side door at each end, white pots with clipped shrubs; a round grilled vent high in each mass and a framed grilled window below; the wings with framed windows below and the open gallery above; the tiled lean-to and the strip of shop glass removed; hedges before the masses. |
| C13 benches | `balmewest.ts` | Three benches (cast white end frames, blue slats) on slabs before the north wing, facing the square. **Estimated:** count and spacing. |
| C14 forecourt | `balmewest.ts` forecourtTex | Worn warm slabs between pale strips with panels of irregular flat stone before the portico; kept clear of generic trees. |

Checks: typecheck, geography build, route tests, production build, route lengths unchanged, camera check (0 inside),
road scan round the library (only the two existing hits at roads 1508 and 1509, the same before this batch).

## Round 2 (same day)

| Item | Code | Change |
|---|---|---|
| C06 outer wings' ends | `balme.ts` OUTER_END | The gable ends of both four-storey outer wings no longer repeat the long window bands: separate narrow dark openings with wide solid wall between, light grey streaks under them; a low glazed projection across the foot of each south end (dark glazing between white piers, red base, tiled lean-to). **Estimated:** the projection on the west wing (I059 shows one end). |
| C15-C17 deck | `balme.ts` slabTex | Worn warm square slabs with dark joints on the pool deck round the pool and on the middle terrace, in place of the smooth pale surface. |
| C15, C27 stone panel and slab | `balme.ts` crazyTex | The panel of irregular flat stones in the paving south of the pool (I030), kept clear of trees; the sloped dark information slab on its brown stand at the pool's south end (I042). |

Comparison: `comparison-sheet-2.jpg`. Checks as round 1 (all clean; road scan unchanged).

## Round 3: Part 3 of the audit (the implementation prompt and the 67-photo appendix)

Part 3 (pages 101-146) restates each confirmed item with a mandatory acceptance check and holds every supplied photo
(RW-I001 to I067). Checked against it:

| Item | Code | Change / finding |
|---|---|---|
| C22 orientation | `balmepent.ts` | The oblique I037 (with I040, I041) shows the two graduates turned toward the library, and the front photo I066 has no library behind it: the group now faces north to the library (it faced south in round 1). |
| C25 drain | `balme.ts` herringTex | Along the west lane (the source segment of I055): a herringbone paver walkway outside the asphalt, the narrow open concrete drain between them with cover slabs every 8.5 m; flush with the ground, the lane and its entrances unchanged. |
| C26 parking | `balme.ts` cedi extras | The mapped car park north of the CEDI centre, across the road from the library's west wing (Street View I062-I065): grey interlocking pavers in place of plain concrete, a darker paver band and low kerb round its edge, white bay lines along both long sides. Cars stay as the life system parks them. |
| Acceptance checks C01-C03, C07, C08, C15-C21 | (rounds 1, 2) | Checked against the listed views: blank wall areas and the clerestory band (C01); the arch lettering, the reveal and the side openings (C02); the square surround, dial, balcony and caps (C03); isolated octagons with solid margins (C07); the dense masonry screen with its red base (C08); the separate basin, coping and walls (C15-C17); statue slots, limbs, props and bases, with unresolved identities flagged (C18-C21, C29). |

Comparison: `comparison-sheet-3.jpg`.

## Round 4: the owner's marked notes on rounds 2-3 (`owner/`)

| Note | Change |
|---|---|
| The perforated screen joining the buildings (blue arrow on I059) was missing | A screen wall (dense perforated panels, piers, red base) from the low inner east wing to the tall east wing's south-west corner, solid to riders. The glazed projection is now only on the outer part of that end, as I059 shows; the west wing's end (not photographed) has none. |
| The pavements were plain colours | Every paved surface round the library now carries the worn slab texture: the forecourt before the entrance (the mapped plaza), the entrance landing, the road-level paving round the sunken square and the side strips, as well as the deck and terrace (round 2). |
| I042 was taken from the footway at the arrow's tail; the middle section across the pool's south end does not exist | The stone wall across the deck's south end removed: the slab paving rises from the deck to the footway in one slope (relief.ts), low walls down its sides, the lawns' end walls kept; the irregular stone panel sits in the slope before the information slab, where I042 shows it from the footway. The route test that held that spot flat now checks the slope instead (the paving beside the lawns' ends stays flat). |

Comparison: `comparison-sheet-4.jpg`.

## Round 5: the owner's second set of notes (`owner/note-statue-facing.webp`, `owner/note-i063-game-pair.webp`)

| Note | Change |
|---|---|
| The roundabout group faces the wrong way: its front points to the road beside the Bookshop (two blue arrows) | The group turned to face east-north-east, toward the road beside the Bookshop. The marked aerial also shows the island's present state, now followed: a bed of shrubs and cactus round the plinth only (the outer clusters and the two palms removed), short dark bollard lights round the lawn, two flat dark plaques, dry patches in the grass. |
| I063's game pair is the library's west side opposite CEDI (the owner's game frame), not the CEDI car park | The car parks there (the strip before the library and the two lots across the road) paved in grey interlocking pavers with a darker edge band, clear of the roads; grass tufts kept off all the paving round the library (science.ts PAVED). The perforated screen wall added from the south-west kiosk to the west wing (I062, I063). CEDI's own car park keeps its pavers. |

Comparison: `comparison-sheet-5.jpg`.

## Round 6: the owner's notes on the tower and the fountain (`owner/note-tower.png`, `owner/note-fountain-beds.webp`)

| Note | Change |
|---|---|
| The thin pole at the top; every shape in the tower | The long slender rod over a red bulb finial; the lantern's tall flared red cap; the cap over the clocks painted red (not tiled) above a white cornice on small white brackets; the balcony set straight on the tiled cap (the white shaft below it removed); dark brown fascias under the tiled roofs; the centre block's top storey with one row of six square openings, the storeys below plain. |
| The walls round the fountain, their divisions; the beds at the south ends (yellow circles) | The two corner beds rebuilt from the aerial: a tall white square pedestal with cornice and bronze plaque and a white urn with handles on top, a clipped conifer either side, short runs of clipped hedge with orange-red flowers, a low brick planter, a black railing behind the pedestal, a green lamp post with four globes, the bed's road corner rounded with a white kerb (the white cylinders removed). The pool's rim pale with a thin dark water line; the walks and plaza in terracotta tiles with pale joints; the walls' copings thin and grey, not broad pale caps; lamp posts on the lawns' outer edges, the palms moved to those edges, runs of red-flowering shrubs along the lawns' inner edges. |

Comparison: `comparison-sheet-6.jpg`.

## Round 7: owner's notes (`owner/note7-*`)

| Note | Change |
|---|---|
| No paving outside the square on the west, east and north; the south closed by the beds' short white kerb at the road | The road-level slab strips round the square removed; the two corner beds now reach the road and their rounded white kerbs close the south end; the open slope between them stays. |
| The circled post is a white cylinder (the enhanced aerial had made it an urn on a pier) | Each bed's centrepiece is again a white cylinder with a flat overhanging cap (owner's photo). |
| Statues 25% larger | Every lawn statue and the roundabout's graduates scaled by 1.25 (`STATUE_SCALE`). |
| The figure before the footballer (owner's photo) | Rebuilt as the dancer: bare chest, a cloth wrapped at the waist with folds and a knot, fringed raffia bands at the ankles, knees bent with the left forward, elbows bent and fists held forward at the waist, head up, mouth open, on a disc and square slab. |

The mapped footway across the square's south end (map line 1508) now runs under the two beds; nothing solid blocks it.
Comparison: `comparison-sheet-7.jpg`. The red-circled west-lawn figure waits for the owner's photo.

## Not done yet (open, next)

C04 roof tile ageing and junctions, C05 courtyard galleries and AC units (needs registration), C09 the weathered service elevation, C10 the columned block (location pending), C24-C28 trees, drains,
parking, stone objects and surface ageing.
