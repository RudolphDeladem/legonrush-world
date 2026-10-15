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

## Not done yet (open, next)

C04 roof tile ageing and junctions, C05 courtyard galleries and AC units (needs registration), C09 the weathered service elevation, C10 the columned block (location pending), C24-C28 trees, drains,
parking, stone objects and surface ageing.
