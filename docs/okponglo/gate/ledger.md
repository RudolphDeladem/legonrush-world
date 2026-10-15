# Okponglo entrance audit (batch 158)

Source: the owner's `Okponglo_Entrance_Correction_Audit.pdf` (64 pages: still pairs S01-S16, maps M1/M2, video frames
VF1-VF25, register OKP-001 to 016). All pages were read; the stills and maps were checked at full size.

Code:
- `src/game/okgateplan.ts`: the numbers;
- `src/game/okgate.ts`: the gatehouse, edges, lot and plot;
- `src/game/life.ts`, `bpiplan.ts`, `ipsplan.ts`, `lbplan.ts`: the generic pieces kept out, and the lot's cars;
- `scripts/geography/med-corrections.mjs`: the pond exclusion.

The comparison is `sheet.jpg`: game before, real, game after.

Labels: [VERIFIED] [DECISION] [ASSUMPTION].

## Registration
[VERIFIED] M2 registers north-up at about 3.3 px/m: x = 654 + (px − 75) / 3.3, z = 1232.5 + (py − 357) / 3.3. Its
anchors are New University Road, the N4 junction, the taxi lot's outline (osm:way/1339325946, x 674-784) and the
pavilion. The lot and pavilion land on the game's own outlines.

## Existence ledger
| Object | Decision | Evidence |
|---|---|---|
| Gatehouse (OKP-001) | Added at x 705, across the drive; roof 12.6 × 24.3 m. North side: white rooms over a wine base (round grille high on both approach faces, barred windows, door). Then the clear portal (the carriageway plus 1.9 m), and the south walk bay with two slender round columns and the broad end pier. Fascia with fret grille panels and the display (its picture not copied). Brown tiled hipped roof on 0.7 m eaves. No post in the lane. | [VERIFIED] S04, M1 1, M2 7. [ASSUMPTION] the rooms are on the north (M2's roof reaches further north); the column count and interior are hidden |
| Taxi lot (OKP-002, 015) | Kept as asphalt. Added white bays in three rows, two kerbed islands with trees, and cars standing in the bays. The lot's entry/cross road is kept clear. | [VERIFIED] S06, M1 2, M2 8. [DECISION] the row layout |
| Pavilion (OKP-014) | The map's solid block (osm:way/1326372690) replaced by an open pavilion: slender posts, low red hipped roof, benches. | [VERIFIED] S06, M1/M2 |
| Bare plot (OKP-003, 007) | Reddish soil and dry grass with sparse scrub, and the localized broadleaf group on M2 9. | [VERIFIED] S12, S14, S16, M1 4, M2 9 |
| Green kiosk (OKP-004) | Removed. The generic busy-spot kiosks, crowds and benches are kept off the area. | [VERIFIED] S12-S16 show none |
| Blue shelters (OKP-005) | Removed: the generic UG shuttle shelters at Legon Taxi Rank and the two Jubilee Drive stops. The slim sign frame on the plot verge is modelled instead, its plate left blank. | [VERIFIED] S16 |
| Pond (OKP-006) | Map area osm:way/700264510 excluded. | [VERIFIED] M1/M2 and S12-S16 show dry ground |
| Palm avenue, painted kerbs, generic lamps (OKP-008, 012, 013) | Generic pieces kept off the area. In their place: broadleaf trees from M2's crowns, two palms (by the gate and the lot), plain kerbs and slim road lamps. | [VERIFIED] S02, S04, S08, S10 |
| Footways and drain (OKP-009, 010) | Tan paver footways on both sides; the south one runs under the gate's walk bay. Behind the north footway, an open concrete channel with crossing slabs where entries cross. | [VERIFIED] S02, S04 |
| Stadium fence (OKP-011) | A light metal fence and planted strip along the stadium side. The stadium's lower facade is unchanged (not inspected close enough). | [VERIFIED] S02, S08, S10 |
| Billboard (OKP-013) | Not added: dated advertising (2024). | [DECISION] |
| Distant buildings (OKP-016) | Unchanged: none proven to stand on the open ground. | |

## Open
- The plot's dirt access track is still drawn as a paved game road (it runs far north beyond the crop).
- The stadium's lower base.
- Hidden gate details: the far-side openings and the exact support count.

## Tests run
- tsc ok; route tests ok; lens unchanged; NaN scan (7224 meshes) none bad; build ok; smoke ok.
- Road-blocking scan of every road in x 660-1000, z 1150-1300: none blocked (after fixing three: the lot's cross road, a
  tree on the back aisle, the drain across the plot's trail).
- Stuck scan: the only blocked cells beside roads are the open channel's rims (intended) and the N4's west verge beside
  road 761, from earlier work.

## Follow-up (batch 160, the owner's notes)
- The display over the portal is now an LED screen (`screen.jpg`). It plays a ten-second aerial loop of the game's own
  campus: slow sweeps over the Balme Library, Commonwealth Hall, the Great Hall and the Medical Centre. The loop is
  rendered from the game with `tools/preview/flyover.mjs` (120 frames at 12 fps, 480 × 128), encoded to
  `public/video/okgate-aerial.webm` and `.mp4`, muted and repeating. A still picture shows until the video plays.
- The footways along the drive are grey concrete pavement with joints, not tan.

## Footway follow-up (batch 163; the owner's five pictures, `footways-sheet.jpg`)
- **Earth on the drive [FIXED]:** the J.J. Rawlings earth track's ground counted a Jubilee Drive segment as track and
  painted earth over the asphalt. Now only class 3-4 roads count as track, and the box (`jjplan.ts` `EARTH_BOX`) stops at
  the north footway's back kerb.
- **Footways deleted (picture 1):** the south footway between the junction and the taxi rank zone is removed (x > 790).
  The stadium side keeps its plain kerb, the planted strip and the fence.
  - Also removed: the open channel behind the north footway and its crossing slabs (a second lane).
- **North footway kept [DECISION: pictures 2 and 5 show it]:** pictures 2 and 5 show a footway along the north side,
  by the plot. It is now one herringbone paver footway between a plain road kerb and a raised back kerb (0.25 m: a bike
  rolls over it), with no cross joints.
  - The back kerb is open where the earth track and the paths come in.
  - Where the drive splits it follows the westbound carriageway (road 1091).
  - At the north-west corner it turns onto the slip and ends against a pitched stone slab (picture 4).
  - The lamps stand behind the back kerb.
- **The junction approach (picture 3):** the kerb and footway fragments that lay between the split carriageways are
  replaced by one low concrete separator. The plot's soil stops at the back kerb.
- **Open question:** if the north footway should also go, it is one line in `okgate.ts` (`walk(nLine, ...)`).
- **Soil at the road edge (owner's follow-up) [FIXED]:** the plot's soil colour stopped behind the pavement, but its ground
  layer still ran over the westbound carriageway. Seen far off and at a low angle, the blurred texture leaked onto the
  asphalt as a red band. The layer's cells now end under the pavement, short of the road kerb. Probes along the whole
  drive and the corner find no ground layer on the asphalt.
