# J.J. Rawlings Avenue corridor (batch 159)

Source: the owner's `LEGONRUSH_JJ_Rawlings_Corridor_Corrections.pdf` (24 pages: pairs 1-6, satellites 13/14, the vector
map 15, the annotated overview 16). All pages were read; every picture was checked at full size.

Code:
- `src/game/jjplan.ts`: the numbers;
- `src/game/jjyard.ts`: the models and the ground;
- hooks in `labawaleshie.ts` (the yard's sheds; the scrub ground stops at the enclosure), `okponglo.ts` (the scrub
  planting stops at the enclosure and keeps off the mapped verge path), `ghlplan.ts` (the earth track), `life.ts` and
  `ipsplan.ts` (generic trees, kiosks, lamps and painted kerbs kept out);
- `scripts/geography/med-corrections.mjs`: the two pitches excluded.

The comparison is `sheet.jpg`: game before, real, game after.

Labels: [VERIFIED] [DECISION] [ASSUMPTION] [UNRESOLVED].

## Registration
[VERIFIED] Picture 13 registers north-up at 2.19 px/m: x = 779 + (px − 245) / 2.19, z = 684 + (py − 78) / 2.19.
- Anchors: the walled compound with two roofs north-west of the yard, and the GRA block (osm:way/758602538).
- Checks: the yard's red-roof building lands on the mapped outline (x 867-893, z 949-982); picture 14's centre pitch lands
  on the game's pitch at (632, 784).
- Picture 15 is the game's vector map: its three northern pitches are kept. Its two southern pitches
  (osm:way/758602542, …543) lie on the yard's south-west and the bare field, where both satellites show no pitch:
  excluded.

## Issue ledger
| Picture | Issue | Action | Status |
|---|---|---|---|
| 13, 16 | Yard floor | Pale compacted soil over the yard polygon, darker where worked; the bare field west of it in dry grass and soil | implemented and visually verified (overhead) |
| 13 | Grey rows | Low grey masses in four groups, matching the rows' direction and spacing, kept off the roads; their use is [UNRESOLVED] | implemented and visually verified (overhead) |
| 13, 6 | Service buildings | The compound's sheds in the yard are one storey, weathered grey; the mapped L outline has the red metal roof (callout 2). No upper floors. | implemented and visually verified (overhead) |
| 5 | Enclosure | Blue-grey sheet panels on posts with two grey wall portions, behind the scrub and the walking path; solid to the bike. The wall portions' positions are a [DECISION]. | implemented and visually verified |
| 5, 6 | Machine | A yellow mobile-crane silhouette with its boom raised over the enclosure; no brand, no pit | implemented and visually verified |
| 5 | Container | A green container by the enclosure | implemented, not verified (behind the scrub in the matched view) |
| 5, 6 | Scrub | The scrub west of the avenue now stops at the enclosure instead of running 37 m back over the yard. Its plants keep off the mapped walking path (trail 1423), which was blocked at 19 points before. | implemented and visually verified |
| 2, 3 | Dirt opening | A dusty tan opening off the avenue's east edge, with no kerb across its mouth | implemented and visually verified |
| 2, 3, 4 | Billboard | One pole, frame and poster (purple and white, no words copied) at the opening's north-west corner, its face to the south-west | implemented and visually verified (pairs 3, 4) |
| 2, 3, 4 | Fence, pots, trees | An open frame fence with posts and two rails, its framed gate swung back; terracotta pots and black tyre planters with small plants under the trees and along the road; small slender trees | implemented and visually verified (pairs 3, 4) |
| 3, 4 | Walking strip | A grey slab strip with joints along the avenue's east kerb from z 735 to 905 | implemented and visually verified |
| 2 | Hard surface south of the opening | A grey pad; its extent is a [DECISION] | implemented, not verified |
| 1 | GRA frontage | A grey forecourt; a railing on a low wall with posts and an entrance gap; the GRA sign on its post. The cream block is kept. | implemented and visually verified |
| 13, 16 | Earth track | Game roads 30 and 1516 (to the yard from Jubilee Drive, and on north) drawn as earth | implemented and visually verified (overhead) |
| 1, 4 | Poles and wires | The existing poles and wires are kept | retained |

## Unresolved
- The grey rows' function; the yard's use (no quarry is claimed).
- The sheds' heights and openings.
- The office south of the opening.
- The north scrub's exact extent.
- The GRA's window count and storeys (the truck hides them).

## Tests run
- tsc ok; route tests ok; lens unchanged.
- NaN scan: 7239 meshes, none bad.
- Road-blocking scan of every road and path in x 720-1000, z 730-1250: none blocked.
- Stuck scan: the only blocked cells beside roads are the raised bank's stone face along the west kerb and the median
  planting, both from earlier batches.
- build ok; smoke ok.
