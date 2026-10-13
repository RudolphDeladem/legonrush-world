# Commonwealth Hall: the owner's correction brief

The brief is `Commonwealth_Hall_Correction_Prompt.pdf` (Pictures 1-6). The code is in `src/game/commonwealth.ts`. The
cameras are in `src/game/cwviews.ts`, as the preview views `cwcTop`, `cwcP1`, `cwcP1b`, `cwcP2`-`cwcP5`, `cwcLinkD`,
`cwcDining`, `cwcChapel`, `cwcLibrary` and `cwcWin`.

## Comparison images

Each image in this folder shows the owner's picture (where there is one), the game before and the game after, from the
same camera:

| Image | What it checks |
| --- | --- |
| `overhead-picture6.jpg` | the whole plan from above, next to Picture 6 |
| `picture1-south-range.jpg` | the south range and its junctions |
| `picture1-court.jpg` | the court, the crossbars and the retaining walls |
| `picture2-pharmacy-link.jpg` | the low link south of the pharmacy (mark g) |
| `picture3-entrance-link.jpg` | the low links either side of the entrance (marks e, f) |
| `picture4-stone-faces.jpg` | the stone faces and the steps along the drive |
| `picture5-terrace.jpg` | the front terrace close up |
| `link-d.jpg` | mark d |
| `links-a-b-c-dining.jpg` | marks a, b and c |
| `links-j-k-chapel.jpg` | marks j and k |
| `links-h-i-end-building.jpg` | marks h and i |
| `timber-windows.jpg` | the windows close up |

The camera positions are matched by eye and are not surveyed.

## The junctions repaired (Picture 6's short blue marks)

Each link is one storey, lower than the blocks it joins, under its own roof. It is set a little back from their faces
and reaches 0.15 m into both, so no slit of grass is left. Coordinates are in game metres (x east, z south).

| Mark | Joins | Link (x, z) | Roof |
| --- | --- | --- | --- |
| a | the west dining wing (osm:way/100307668) to the dining hall (osm:way/100307631) | x -620.55 to -616.05, z 64.4 to 72.0 | hip |
| b | the west dining wing to the north-west crossbar | x -634.4 to -625.6, z 72.85 to 81.45 | hip |
| c | the east dining wing (osm:way/100307692) to the north-east crossbar | x -580.9 to -571.7, z 71.85 to 78.75 | hip |
| d | the front north block to the north lane's front block | x -501.7 to -492.1, z 87.65 to 89.15 | flat (1.5 m deep) |
| e | the entrance block to the front block north of it | x -501.4 to -492.2, z 113.6 to 118.4 | hip |
| f | the entrance block to the front block south of it | x -501.4 to -492.2, z 136.4 to 141.4 | hip |
| g | the lower wing beside the pharmacy, on to the block south of it | x -502 to -490.5, z 159.5 to 167.55 | hip |
| h | the north stub to the end building | x -715.1 to -705.6, z 111.15 to 116.95 | hip |
| i | the end building to the south stub | x -715.1 to -705.6, z 137.45 to 143.15 | hip |
| j | the south-west crossbar to the chapel (osm:way/492731364) | x -625.15 to -620.35, z 184.6 to 192.9 | hip |
| k | the chapel to the south-east crossbar | x -590.85 to -583.05, z 184.6 to 191.6 | hip |

Notes on the marks:
- **e and f** were two-storey joins. They are now single-storey links, as Picture 3 shows.
- **g** was a 1.4 m slit between the lower wing and the next block (Picture 2's circle). The lower wing now runs on to
  that block.

**Now drawn as part of the hall.** These outlines were drawn by the generic builder until now, in cream paint with
glass windows: the "ochre" blocks.
- the dining hall (osm:way/100307631) and its two wings;
- the chapel;
- the prayer lounge (ml:4023e6d6);
- the block against the east wing's north side (ml:639f89d8), which touches the wing in Picture 6.

They now use the hall's white paint, timber windows and roofs, and links a-c and j-k attach to them.

## The exceptions, kept as they are

- **The two green-circled centre blocks.** These are the pavilions on the court walk, at x -634 to -624.1 and
  x -582.5 to -575. They stay detached, and no link touches them. The west pavilion is only 1.3 m from the south-west
  crossbar, so its eaves were shortened (0.8 m to 0.3 m) to keep a gap at roof level too.
- **The yellow-marked break south of the dining hall.** It stays open, and no link touches it: the open ground between
  the dining hall's south end (z 74.4) and the court, between the crossbars.
- **The east dining wing and the dining hall** are 6.8 m apart, with no blue mark between them. They are not joined.

## Material changes (scoped to Commonwealth Hall and its stairway)

Other buildings are unchanged: every material below is created in `commonwealth.ts`, and no shared material was edited.

- **Windows.** Every bay is now a brown timber louvred window (`louvre` from `blocks.ts`, frame `#5a3b28`) on both
  floors, on all faces: the lanes, bars, front blocks, links, dining hall, chapel and prayer lounge. There is no glass.
  - The entrance block's tall court-side windows and its upper glazing over the doors are timber louvres too.
  - The pavilions' windows were glass panes. They are now timber windows with frames, slats and mullions.
  - The pharmacy keeps its glazed doors. They are doors, not windows.
- **Paint.** The walls are white (`#f8f7f3`), with the engine's usual light wear. The ochre generic blocks are gone, as
  above.
- **Stone.** These are now irregular rubble stone: rough stones of varied size in earthy brown, reddish and grey, in dark
  joints and uneven courses, 2.5 m to a repeat, with uvs in metres on every face:
  - the plinths round every wall foot, which were taupe paint;
  - the front terrace's retaining wall;
  - the retaining walls across the courts and the stair cheeks;
  - the pharmacy's bay base and its planting terraces;
  - the stairway's side walls and the stone arches;
  - the forecourt's low walls and the crest plinth;
  - the gate houses' plinths;
  - the pavilions' bases.

  The copings stay pale stone.
- **Stairs.** Every flight is worn, textured dark brown, with darker nosings: the entrance steps, the court flights, the
  stairway up the hill and the pharmacy steps. The tread and riser geometry and the landings are unchanged. Stairs and
  stone use separate materials.
- **Unchanged:** the roofs, the planting (palms, bushes, hedges, trees on the terraces and slopes), the courts, the
  Bacchus statue and the amphitheatre.

## Collision

- **The links.** They are drawn walls, so they collide like the hall's other blocks (`meshcollide.ts`, knee to chest
  height). No mapped road or path crosses any link or any of the newly modelled outlines.
- **The newly modelled outlines.** They keep their map footprints, so they are solid as before.
- **Openings kept.** The walk through the courts, the pavilions' passages, the gaps round the pavilions and the break
  south of the dining hall stay open.
- **Tests.** `npm run test:routes`, the build, the smoke ride and the geography check all pass.

## Unresolved or estimated

- **Storeys.** The dining hall, its wings, the block against the east wing and the chapel are drawn as two storeys and the prayer lounge as one. The map
  has no storey count for them: its 11 m is the generic estimate for a residence.
- **The links' sizes.** Each link's width, depth and roof height are estimates. They are read from Picture 6's marks
  and the mapped outlines either side, not surveyed.
- **Mark d.** Its link is only 1.5 m deep, because the two front blocks are that close. It has a flat roof and plain
  ends.
- **The block against the east wing (ml:639f89d8).** Its outline is machine-detected, with no name or height.
- **Doors.** None of the links has a door modelled.
