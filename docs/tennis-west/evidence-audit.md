# Commonwealth west tennis complex: evidence audit

The owner's brief `Commonwealth_West_Tennis_Court_Detailed_Claude_Brief.pdf` (2026-10-13, 13 pages; in
`docs/handover/uploads/`), its pictures in `refs/` (picture-01 … picture-12, numbered as in the brief). Code:
`src/game/tennisplan.ts` (numbers), `src/game/tennis.ts` (the model), `src/game/relief.ts` (the terrace),
`src/game/ghlandscape.ts` (the belt beyond the modelled ring of trees), cameras `src/game/tcviews.ts` (`tc*`).

Labels: [VERIFIED] checked against the map or the pictures; [DECISION] chosen here; [ASSUMPTION] estimated;
[INCOMPLETE] not established by the pictures, left adjustable or open.

Comparison sheets: `sheet-overhead.jpg` (Picture 12 against the game from above; the terrace from the road; the wall
from the higher ground), `sheet-game-views.jpg` (Pictures 9-11, the game before, against the same viewpoints now),
`sheet-court-level.jpg` (Pictures 1, 7, 8 against court-level views).

## What the game had

[VERIFIED] The map has two pitches here (osm, `areas` kind `pitch`): x -638.7..-622.6 and -620.6..-587.0, z -90.6..-55.4
(game metres, x east, z south), 180 m north of Commonwealth Hall's courts. `world.ts` drew every pitch with the mown
football stripes (`pitchTexture`), laid on the hill's slope (4.5 m of fall north to south across them), on open lawn;
the street trees along the curved road south of them included palms and orange-crowned flame trees; the mapped wood
east of the pitches was the only tree cover. Pictures 9-11 show exactly that.

## Registration (Picture 12)

- [VERIFIED] Picture 12 registers on the map at 2.69 px/m with no rotation, anchored on the hard court's enclosure (its
  west edge at pixel 275, north edge at 438 = the west pitch's x -638.7, z -90.6). The curved road, the dirt road along the
  north of the belt and the Research and Innovation compound's three blocks then fall on their mapped lines within 2-5 m.
- [VERIFIED] The hard court's enclosure is 16 m by 35 m in the picture, as the west pitch. The red-soil ground is about
  52 m wide: a line about 33.5 m from its west edge (= the east pitch's width) parts the two courts' ground from about
  16-18 m more red ground east of it, to the tree belt.
- [DECISION] Floor edges on the half metre (x -638.5..-570.5, z -90.5..-55.5), within 0.2 m of the mapped outlines,
  so the ground grid's vertices fall on the walls' faces.

## The model and its evidence

| Element | Evidence | What is modelled | Status |
|---|---|---|---|
| Court count | Pictures 1-7 are frames of one hard court (the brief); Picture 8 two red-soil courts with their own nets; Picture 12 | one hard court, two red-soil courts side by side, red ground east of them without lines | [VERIFIED] count; [INCOMPLETE] use of the east red strip |
| Sunken terrace | brief p.4; Pictures 1, 4, 7: the floor below grass and trees behind a stone face | one level floor at 6.2 m (the hill's scale) cut into the slope; the ground behind eases back to the hill over 10-14 m | [ASSUMPTION] floor level and band widths |
| Retaining walls | Pictures 1, 4, 5, 7: irregular tan, grey, reddish stones in mortar, exposed about 0.5-1.5 m against a 1.8 m player, stepping along a side, higher at corners | stone walls on all four sides, 0.5 m thick, exposed 0.6-1.6 m in runs (`TC.walls`), a capping course | [ASSUMPTION] every height and step position |
| Hard court | Pictures 1-7 | faded blue court in a pale green run-off; doubles and singles sidelines, baselines, service lines, centre service line (standard dimensions); tan and grey worn patches, scuffs, cracks as texture only | [VERIFIED] colours and line system; [ASSUMPTION] dimensions are the rules', not a survey |
| Red-soil courts | Picture 8 | matte orange-red earth, sweep arcs and foot marks, pale lines, two nets | [VERIFIED] |
| Nets | Picture 7 (hard), Picture 8 (red) | one per court across its centre, perpendicular to the long axis: green posts, dark fine mesh, pale tape, gentle sag | [VERIFIED] |
| Fence | Pictures 1, 4, 5, 6, 7 | chain-link on thin grey posts every 3 m, 3.4 m high, just inside the walls; top and bottom rails; diagonal braces at the corners and by the net line; a fence parting the hard court from the red ground; vines on the red side's fence (Picture 8) | [ASSUMPTION] height, spacing, brace positions |
| Mast and chair frame | Picture 8, left edge | a tall slender rust-red lattice mast and a plain dark chair-like frame at the red ground's west edge by the first net | [INCOMPLETE] side, spot and purpose; no lamp heads, wires or seats added |
| Tree belt | Pictures 1-8, 12 | broad mature crowns in a ring close behind the fence where the aerial is dense (`broadleaf`, low forks so the foliage comes down toward the fence), shrubs on the walls' tops, three round trees south of the red courts (Picture 12), and the belt beyond (including the mapped wood east of the courts, which was sparse) as instanced mature crowns with an understorey, from the aerial (`ghlandscape.ts`) | [VERIFIED] distribution; [ASSUMPTION] heights and species |
| Street trees | Pictures 10, 11 (orange crowns) | within the local scene, palms and flame trees become mahogany or neem (`inTcLocal`, chosen by position, so nothing else on the campus moves) | [DECISION] |
| Access | none shown | none modelled: the fence closes the complex | [INCOMPLETE] question below |
| Signs | the map label LEGON TENNIS CLUB (LTC), the owner's "TBC", the label CARLYD GROUP | no sign modelled | [DECISION] per the brief |

Collision: the fence's posts and mesh line, the net posts, the mast and the chair have round solids; trunks have solids;
foliage, shrubs and the court surfaces never stop the bike. The bike stays outside the fence.

## Checks

- Route lengths: unchanged (`lens.mjs`, identical before and after); route tests pass.
- Frame cost (preview, fog 70-340 m, no shadow pass): from the road south of the courts (camera tc10) 0.71 M triangles
  against 0.48 M before; the Commonwealth front (cw2) is 0.91 M for comparison. The ring of modelled trees, the terrace's
  finer ground and the instanced belt make up the difference.

## Open questions for the owner

1. Where is the way in: a gate in the fence, steps down the wall, a ramp? On which side?
2. The red ground east of the two red courts (about 16 m wide): a third court, a practice area, or open ground?
3. Which way did the video (Pictures 1-7) face? The walls' heights per side are estimated from those frames.
4. The tall lattice mast and the chair-like frame: which side of the red courts, and what is the mast?
5. The complex's name: the owner's "TBC", or LEGON TENNIS CLUB?
