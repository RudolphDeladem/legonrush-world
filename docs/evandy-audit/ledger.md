# Evandy Hostel: detailed reconstruction audit, completion ledger

The owner's audit PDF of 2026-10-17 (Revision 2, 45 pages; Main Block, Annex A, Annex B) with its evidence: the real
top views I02/I03, the drone RW-V01, the game recordings GM-V01/GM-V02, the photographs I05-I11 and the correction
attachments I12/I13. Work is in `src/game/evandy.ts` and `src/game/evandyplan.ts`. The comparison sheets are in
`images/`.

## How the plan was measured

The real top view I03 was registered on the game map using its roofs. Twenty wing and ring corners were matched to
their mapped outlines and fitted with an affine transform: x = 516.98 + 0.11408 px + 0.00046 py,
z = -1342.12 + 0.0017 px + 0.11138 py. The mean residual is 1.5 m. Every new plan number in `evandyplan.ts` comes
from that registration: the Main strip, its 20 tanks, the east range, Annex A's connection and Annex B's seams.

I13 orientation: the frontage and its oval island lie to the left, Annex B is at the top centre with the unfinished
frame behind it, and Annex A is at the right. So the camera looks west, the BLUE side is Main's east side, and the
RED end is Main's west end. Bani lies east of Evandy, which agrees with the owner calling the BLUE side the one facing
Bani.

The I04 locator was matched with a game camera at (545, 2.6, -1216) looking toward (510, 1.5, -1240). The two
pictures agree: the Tropiks block and its stair are on the left, the basketball slab on the right, and the west wall
behind. BLUE and VIOLET lie on the gravel just north of the Tropiks block. The RED arrows mark the building on map
outline #17, beside the slab.

## The protected RED end

Main's west end was not edited, and nothing it shares was changed. That covers the west block, front-w's tower and
connector, the north link, their skins and balconies, the perforated panels, the VENT style and the junctions. The
only shared function touched is `balconies()`, which gains an optional skip that only Annex A's north bar uses.
`west-end-before-after.png` is a pixel difference of the same west-end views before and after (see Verification).

## Ledger

| ID | Item | Status | What changed / why not |
|---|---|---|---|
| EV-001 | Source authority, C12 is Main | Done | C12 is treated as Main's east (Bani) side only. No Annex B detail is taken from it. The RED end is locked (above). |
| EV-002 | Three complexes, open court | Kept, verified | Main at the road, A upper right, B upper left; the inter-complex court and its big tree are unchanged. |
| EV-003 | Main: four wings joined | Done | The central strip (I03) joins the four wings' inner ends. The east range joins their east ends past the east link. The west junctions were already joined. Both inner courts stay open. |
| EV-004 | Annex A: two bowed wings joined | Done | The central connection fills the gap between the two bent bars, x 604-623. Its edges follow the wings' own fitted faces. |
| EV-005 | Annex B: ring, courtyard open | Done | The courtyard is kept open. The north range is split into two hipped halves either side of the lower tank strip (I03). |
| EV-006 | Main tank section, lower | Done | A deck over the strip (I03's pinched hexagon) at the third-floor ceiling, a storey under the wings' eaves and about 7 m under their ridges. It carries 20 tanks, each where I03 shows a separate circle (two small ones). A stair tower stands behind the glazed bay at the front to the eaves. |
| EV-007 | Annex A tanks | Done | Eight tanks in two rows of four on A's connection, at the same lower level. |
| EV-008 | Annex B tanks | Done (levels provisional) | Four tanks on the north strip's flat roof, a storey down. Three plus five along the line where the south range meets the west and east ranges, on a slab in the roof valley (the top view does not resolve that level). The two existing tanks over the entrance are kept. |
| EV-009 | Main facade facing Bani (C12) | Done (fine profiles provisional) | A new flat-roofed east range along the wing ends, its outer face faceted as in I03. I13's long horizontal opening bands over solid parapets, a pier about every 4.2 m, pale floor bands, doors and louvred windows set back in the bands, grilled windows on the ground. The red perforated panels on the east link are withdrawn. Bay count, rails and openings behind need a closer BLUE-side view. |
| EV-010 | Annex A facade | Unchanged, open | No elevation evidence beyond the aerials. The wings keep their geometry; only the balconies under the new connection are omitted. A front oblique and a close typical bay are needed. |
| EV-011 | Annex B facade | Unchanged, open | B's outer and courtyard faces need their own close-ups. Nothing from C12 is used for B. |
| EV-012 | Main front entrance | Done | I11: the dark awning panes are withdrawn. The three glazing bands now have warm gold frames (five lights by two) over a cream sill. The ground entry is a recessed glass gate in gold frames, with the open leaf, the pier with its sign and the closed leaf. The entry leads into a through way (provisional) to the rear court. The yellow columns and the EVANDY pediment are kept. |
| EV-013 | Main rear metal gate | Done (pattern unverified) | At the rear end of the way through: a metal bar gate in the fence's bronze-brown (I11), its two leaves standing open (Evandy's entrances are open). The leaf count and bar pattern are unverified: there is no rear photograph. |
| EV-014 | Annex A glass gate | Done (placement confirmed) | The shared I09/I10 gate with ANNEX A over it, on the court face where the south bar's two arms meet. The owner's marked picture of batch 200 (the blue arrow down the middle of the south bar) puts the door there: confirmed, unchanged (`images/annex-a-door.jpg`). |
| EV-015 | Annex B glass gate | Done | The same gate in B's existing doorway (the middle of its south face, under its tanks, per the owner's earlier notes), with ANNEX B over the canopy. |
| EV-016 | BLUE (I05) | Done | Cream body north of the Tropiks block. Its east face, south to north: a carved timber double door on dark steps, a broad grilled window, a smaller grilled window; a low corrugated roof falling to the front over a pale fascia. |
| EV-017 | VIOLET (I06) | Done | Its body is on the same line and touches BLUE. Only the veranda comes forward: terracotta diamond lattice along the front and its end, slim pale posts, a low dark-brown fascia, dark glazing and doors behind, base planting. The blue service unit stands at the south end. |
| EV-018 | RED-arrow building | Done | The generic building on outline #17 is replaced by the low market-style building. The game drew it as one storey, not two; it is replaced either way. |
| EV-019 | Central opening | Done | An open aisle runs through the middle: east to west, 3 m wide, covered by the roof. The map outline is opened for the walker and the bike. |
| EV-020 | Closed sides, louvres, no blue roof | Done | Both halves are enclosed, with louvred windows (frames and angled blades) in the outer walls and ends and the units' doors on the aisle. There is no blue awning. |
| EV-021 | Roofs and paint | Done | B's roof is pinker (#d68b80) so it stays apart from the orange of Main and A. The cream and yellow placement is unchanged elsewhere. |
| EV-022 | Ground and surroundings | Partly | The new buildings stand on the yard's existing coarse grey gravel, which matches I05/I06. The compound's circular paving and the court's surfaces are unchanged: no evidence covers them beyond the frontage close-ups. |
| EV-023 | Clearance and joins | Done (see Verification) | The new solids follow the drawn walls. The way through Main and the market aisle are open; the decks touch the wings with no slit. |
| EV-024 | Verification | See below | |

## Verification

- **Renders:** the same 15 cameras before and after: `images/before-after-1.jpg` to `-5.jpg`. The real evidence beside
  the game after: `images/real-vs-game-1.jpg` to `-3.jpg` (I03, I13, I11, I04, I05, I06, I09, I08 and RW-V01).
- **The protected RED end:** `images/west-end-diff-1.jpg` and `-2.jpg` mark in red every pixel that differs between
  before and after, after a 3-pixel blur that removes the random texture speckle. The west block, front-w's tower, the
  connector and the north link show no change. The red areas are the new ancillary buildings, moving people and cars,
  Annex B's recoloured roof and one shadow-texel line on a wing face.
- **Checks:** `tsc --noEmit`, `npm run test:routes` and `npm run test:rooms` pass, and so does the production build.
- **Not run:** a walked traversal in the running game through the new way through Main, the market aisle and the
  gates. The openings are clear of drawn geometry and solids, and the market's outline is opened as a passage, but no
  one has walked or ridden through them.

## Smallest useful follow-up views

- Annex A: one front oblique and one close typical bay (its balcony and window profiles).
- Annex B: its outer and courtyard faces close up.
- Main facing Bani: a closer BLUE-side view (window, rail and recess profiles; the bay count).
- Main's rear entrance: straight on, for the gate's leaves and bars.
- Each tank-bearing section: a close oblique with the adjoining roof edge (levels and counts).
- BLUE and VIOLET: one oblique across the joint between the two bodies, and their unseen ends.
- The market-style building: a front or side view or a sketch of its intended size.

## Batch 200 (the owner's two marked pictures)

- **Court:** a second hoop at the south end. Both hoops now stand over the painted baskets (rim 1.575 m in from the
  baseline, the post just past it); the old one moved about a metre to its basket. A generated tree stood on the court
  over the north basket and is gone (`life.ts`: no trees on the court).
- **Workers' huts:** the three circled buildings round the unfinished frame behind Annex B (map outlines by the road and
  east of the frame) are the huts where the frame's workers rest and keep their things. Wine-red corrugated aluminium
  sheet walls and a low gable roof on each mapped outline, light timber corner posts, a sheet door on the side facing
  the frame, a small opening with a sheet flap on the other side (door side and opening chosen, not shown;
  `src/game/workersheds.ts`).
- **Annex A's door:** confirmed where it already stood (EV-014).
- **Checks:** route lengths and the stuck scan of the area unchanged from before; no road blocked; no NaN geometry.
  Sheet: `images/batch200-before-after.jpg`.
