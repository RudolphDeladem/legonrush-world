# New Pent Block A: reconstruction (owner's brief, 2026-10-17)

The owner sent a strict reconstruction brief for Block A with five pictures:
- the roof plan (two red-marked sections are two storeys; the rest are four);
- the marked court photo looking at the porch;
- an aerial photo of the blocks;
- a top view of the site south of the block, with a legend (vehicle pavement / pedestrian walkway / lawn);
- a photo from the car park toward the entrance.

The model is `src/game/newpent.ts`. Block A's wings come from the map's outlines. Block B is built as A's copy and
Block C as its mirror image, per the owner's earlier decision.

## How the pictures were read

- **Roof plan (north up):**
  - Its wings line up with the map's outlines, at about 4.3 px/m across.
  - The two red-marked sections are the map's front structures: #2931, west, x 534-552; and #2930, east, x 573-591.
    Both were already two storeys.
- **Top view of the site:** registered on the map by four points: Annie Jiagge Road, the west face of the west front
  structure, the east face of the east front structure and Pent Road. All agree within 1-2 m at 2.83 px/m (8.5 px/m
  on a 3x enlargement). The east front structure's notch on its north-west corner shows as a paved corner in the top
  view, at the map's position.
- **The aerial photo** is of **Block B** seen from the south, not Block A:
  - The scrub behind it is the open ground toward Evandy, with the workers' huts.
  - Annie Jiagge Road runs away north on the left.
  - No Block B stands behind it.
  - The owner has said A and B are the same, so it serves for A's facades and roofs.

## Discrepancy report (before the changes)

| # | What was wrong | What the references show | Fix | File, kind |
|---|---|---|---|---|
| 1 | The middle of the block had gaps between the wings (only two short linking pieces, #2932 and #2933). | Roof plan: a continuous run of small hipped roofs from the north-west wing down to the long south wing, and from the north-east wing down to it. | Four four-storey linking blocks fill the gaps (`A_LINKS`). Each is plain render with a louvred window a bay, under its own hipped roof. | `newpent.ts`, geometry |
| 2 | A generic two-storey block stood in the inner court (map #163, x 572-591, z -663..-650). | Roof plan: open court there. | Replaced by nothing (`A_COURT_GONE`). | `newpent.ts`, geometry |
| 3 | No dormers. | Roof plan: small light squares on the north eaves of five wings. Aerial photo: small white dormer faces with dark openings breaking the eave. | 14 dormers at the plan's positions: a white face with a dark louvred opening and a small hipped tile roof running back into the slope. | `newpent.ts`, geometry |
| 4 | The front structures' roofs were plain hips. | Aerial photo: a small hipped roof stands forward over the white stair strip of the low front structure. | A small steep hip over each front structure's stair strip (Block A). | `newpent.ts`, geometry |
| 5 | The court: a branch angled back from the path to the west wing, a branch out to the east wing, young thin trees. | Top view and marked photo: a paved forecourt across the porch's front, running east into the corner beside the east front structure. The straight path to the drive. The right branch leaves on the diagonal to the east front structure's corner and runs along the car park's west edge to the drive. Large leafy trees on the lawns. A paved plaza where the path meets the drive. | Rebuilt that way. 5 mature trees where the top view has crowns, the conical shrub at the forecourt's edge, two lamp posts left of the path. The bin by the lamp and the KEEP OFF THE GRASS sign come from the car-park photo. | `newpent.ts` (`blockACourt`), environment |
| 6 | One wide car park before both front structures; lawn south of the service road. | Top view: a car park before the east front structure, a long one beside it along Pent Road joining the car park below the road. Across the service road a hardstand with a row of bays along its south kerb, going on west to Annie Jiagge Road. A kerbed lawn strip with a row of broad trees to the road. | Rebuilt that way: concrete car parks with painted bays, the hardstand and bays, the kerb, the tree row. | `newpent.ts`, environment |
| 7 | The low-walled terrace stood east of the west front structure. | Top view and aerial photo: the walled yard is the inside corner between the west front structure's narrow part and its broad south end. | Moved there with its food cabinet. Its open side is to the court. | `newpent.ts`, environment |
| 8 | Lawn west of the west front structure. | Top view: a grey paved yard there, a walkway down the lawn west of it to the drive, and a walkway along Pent Road on the bank. | Added. | `newpent.ts`, environment |

Kept, because they already match the references:
- The wings' footprints, which are the map's.
- The storeys: two on the front structures, four on all the rest.
- The entrance tower and porch, rebuilt from the owner's entrance photos in earlier batches.
- The brick end walls with their stair strips.
- The balconies and their brick panels.

## Not changed elsewhere

- **Block B and Block C** keep their current design. This brief asks for Block A only. All Block A changes are A-only:
  the links, the dormers, the roof bumps and the court.
- **Roads, routes, the terrain and other buildings** are unchanged.
- **Generated trees** stay off Block A's grounds by skipping them after their random numbers are drawn (`life.ts`),
  so nothing elsewhere moves. Block A's 14 removed car bays still count in the shared car sequence, so Block B's and
  C's cars stay where they were.

## Verification

Before | after sheet from the same cameras (left: before, right: after): `before-after-1.jpg` to `-5.jpg`:
1. Entrance from the path.
2. Front three-quarter.
3. The long south wing's facade over the east front structure.
4. The side, showing two storeys against four.
5. The roofs from the north.
6. The court from above.
7. Cycling height on the drive.
8. The aerial photo's view.
9. Top-down (north up).
10. The car-park photo's view.

Checks:
- **Route lengths:** identical to before (`lens.mjs`).
- **Route and room tests:** pass.
- **Road blocking:** nothing new on a road in x 500-630, z -700..-545.
- **NaN geometry:** none.
- **Stuck scan, x 300-800, z -900..-400, compared with the code before the change:** the only new blocked points are
  the new parked cars beside the drive, which should block the bike. Three older points are gone.
- **Build:** passes.
- **Performance (software GL, same cameras, before → after):**

  | Camera | Draw calls | Triangles |
  |---|---|---|
  | Court | 752 → 767 | 2,441,388 → 2,444,260 |
  | Aerial | 1,245 → 1,242 | 3,412,398 → 3,415,232 |
  | Cycling | 1,161 → 1,166 | 3,100,424 → 3,103,274 |

  Frame times are within noise. The pavers of each colour and each paved surface are merged into one mesh, and the
  dormers go into the wings' merged parts.

## Estimates and open questions

- **Dormer side (ASSUMPTION):** the roof plan puts the dormers on the north eaves, and they are built there. The aerial
  photo (of Block B) shows dormers on the slopes facing the camera, which is the south side. Please confirm which side,
  or both.
- **Linking blocks (ESTIMATE):** heights and faces. No photograph shows them. They are four storeys like the rest
  ("the rest are 4"), with plain faces.
- **Small structure in the west yard (OPEN):** the top view shows a small tan structure in the yard west of the front
  structure. It is not modelled: its height and use are unknown.
- **The two kerbed islands at the car parks' mouths (OPEN):** the top view puts them over the mapped service road, so
  they are left out.
- **Positions (ESTIMATE):** the trees are placed from the top view's crowns, about ±1.5 m. The plaza's width is read
  from the car-park photo.
- **Service road (OPEN):** the road south of the tree belt is about 10 m nearer the block in the top view than on the
  map. Roads were not moved. The tree belt fills the gap.
- **Wider references useful next:** a view of a linking block's face from the inner courts; and a photo of the long
  south wing's north face, which shows the dormers.

## Strict visual corrections (owner's report "Block A Visual Differences and Strict Corrections", 2026-10-17)

The report brought three new real views of Block A. View 2 is the classic front elevation. View 4 is the west wing's
brick end wall with the low-walled yard. View 6 is the side passage. Views 1 and 6 also include game screenshots.

### What the photographs settle, and the changes

**Porch (views 2 and 3):**
- **Height:** the porch is two storeys. Its side roofs meet the tower at the second floor's slab. In the game its eaves
  stood at 4.6 m; now 6.5 m.
- **Arch:** wider (2.3 m) and taller. Its head rises into the pediment inside a moulded frame.
- **Beams:** they now cross at the photo's two levels.
- **Over the gates:** the first floor's open gallery, in shade, behind a parapet.
- **The sign** moves up into the taller pediment.
- **Block A only:** an option of `entrance()`; Blocks B and C keep theirs.

**The walk across the porch front (view 6):**
- **Where the photo was taken:** from the corner beside the east front structure, looking west. The porch's columns
  are on the right, and the brick end wall of the west wing is at the far end.
- **What it is:** a narrow grey concrete walk between lawns. It is not the wide red forecourt of the previous batch.
- **Now:** a 2.7 m grey walk from that corner to the west wing's wall.

**The junction (view 2):**
- **Position:** about 9 m before the porch.
- **Left branch:** angles back west into the low-walled yard. The yard's opening is now at the north end of its east
  side, where the branch arrives (views 3 and 4: the low brick walls with their caps, the orange cabinet).
- **Right branch:** goes out east on the diagonal of the top view to the car park's edge.
- **Lawn islands:** small ones lie between the branches and the walk. The conical shrub stands on the left island by
  the porch.

**Lamps (views 2 and 6):** by the junction left of the path, by the east front structure along the walk, and at the
drive with the bin.

**Trees:** the court trees and the tree belt now have trunks forking into limbs and spreading crowns of many small
rounded clumps in several greens. They replace the few large faceted balls. They are kept off the facades and the
walk.

**Named comparison cameras:** `src/game/paviews.ts`, used by `tools/preview/halls.html?view=pa...`. They are:
`paFront`, `paFront34`, `paEndWall`, `paJunction`, `paSidePassage`, `paCourtHigh`, `paRoofs`, `paTop`, `paCycle`.
Each is matched by eye to its photograph.

### Checked and found already matching

- **The tower:** the gabled middle with the round-headed recess (a real 0.7 m recess) over open landings, the open
  landings behind parapets on the left, and the louvred windows on the right.
- **The brick end walls:** full-height brick planes with white corner strips.
- **The low brick walls of the yard:** physical walls with caps.

### Verification

Sheets: `corrections-1.jpg` to `-3.jpg` show each reference photo beside the game before (decbd8b) and after, from
the named camera. `corrections-4.jpg` shows the other cameras before and after.

- **Route lengths:** identical.
- **Route and room tests:** pass.
- **Road blocking and NaN geometry:** none.
- **Stuck scan, x 300-800, z -900..-400:** identical to the previous batch.
- **Build:** passes.
- **Performance:** draw calls are unchanged (768 against 767 over the court). Triangles are up 3% from the leafier
  trees: 2.52 M against 2.44 M over the court.

### Not done, and why (needs evidence or the owner)

- **Per-wing facade variety (views 1 and 3):**
  - The left wing's balconies are grouped with their brick inserts around the windows. The right wing has a different
    pattern and a recessed open strip.
  - These are visible only on the wings facing the court in view 2, and only partly.
  - All wings still share one balcony-and-window design. Changing it per wing needs one straight-on photo of each
    wing face.
- **View 5's camera position (ESTIMATE):** the left-foreground columns are read as the east front structure's own
  colonnade.
- **Ground-floor detail:** the jambs and frames of the open bays on the front structures' sides are not modelled
  beyond the existing louvred openings.

## Ground, parking, balconies and windows (owner's three briefs, 2026-10-18)

The owner sent three briefs:
- "Block A Ground Parking Pathway Strict Prompt": a marked ground plan with the legend vehicle / pedestrian / lawn,
  and a game view.
- "Block A Balconies Windows CarPark Design Brief": a real photo of the long car park and a real entrance photo.
- "Block A Annotated Balcony Window Correction Guide": the front photo with seven numbered areas.

They also said that every car park round Pent is asphalt.

### Ground and parking (the ground plan, registered at 8.2 px/m on a 3x enlargement)

**Asphalt:**
- Every car park round New Pent is now asphalt. That covers Block A's, the car park below Pent Road, and the pads at
  Blocks B and C.
- Block A's car parks and the drive use a restrained worn-asphalt texture: dark grey-brown, a fine aggregate speckle
  and a few broad patches. The car parks of Blocks B and C, and the one below Pent Road, are flat dark grey without it.
- Block A's car parks have no painted bay lines: the car-park photo shows none. The other car parks keep their lines.

**Car parks:**
- **Before the east front structure:** x 573.6-589.5, out to the drive.
- **The long one:** x 590.7-610.8. It now starts at the main wing's south face. Its cars stand along the building
  side, with a clear manoeuvring area. By the retaining wall there is only one car, near the steps (the photo).
- **Kerbs:** a kerbed strip separates the two car parks.

**Islands:** two curved, kerbed planted islands sit at the car parks' mouths, each with trees. The plan draws them
reaching about 3 m over the mapped service road. They are kept the same length but shallower, north of the road. The
road was not moved.

**At the path's foot:**
- The path runs on narrow to the drive. The plaza is gone.
- Two short parking bays stand either side of it, each with a car.

**West of the west front structure:**
- An asphalt apron is open to the drive.
- The drive's north edge runs on to Annie Jiagge Road, with the lawn's corner rounded behind a kerb.
- Kerbs run along the drive wherever the lawns meet it.
- Two trees stand on the lawn west of the apron (the plan's dense group).

**Generated street lamps:** none in the car parks, islands or bays (`life.ts`). No random number is drawn in that
loop, so nothing elsewhere moves.

### Balconies and windows (the car-park photo of the long south wing, the front photos)

The generic window grid is removed from all of Block A's balconied faces. Those walls are now plain warm off-white
render (`NP_A_WALL`), and every opening is geometry (`aFacade`, `aSide`).

**Balconies in mirrored pairs (not one to every bay):**
- A shallow projecting slab (0.95 m), with a low cream parapet and cheeks.
- On the parapet, a small brick panel pierced by two round holes.
- Behind it, a dark louvred window in a charcoal frame standing proud.
- A panel of facing brick beside the window, on the side away from its partner.
- A group is about 7.2 m along the face: the photo shows four balconies in two pairs across the south face.

**Between the pairs:** plain wall with a narrow vertical ventilation slot.

**Ground floor:** grilled windows with sills where the balconies stand above.

**Coverage:**
- Every open stretch of a face is covered, including faces that a neighbouring part of the outline only partly
  covers. The old rule skipped those whole.
- The front structures' ground floors keep their large louvred openings.

**Unchanged:** the entrance, the tower and the brick end walls.

### Verification

Sheets: `ground-1.jpg` (the plan and the car-park photo against before/after), `facade-1.jpg` (the front and entrance
photos against before/after) and `ground-2.jpg` (the mouths and islands, the west face, the court and cycling height).
New cameras: `paGround`, `paLots`, `paCarPark`, `paWestFace`.

- **Route lengths:** identical.
- **Route and room tests:** pass.
- **Road blocking and NaN geometry:** none.
- **Build:** passes.
- **Stuck scan:** the new points are the parked cars in the two short bays at the path's foot and on the drive. A few
  older points are gone.
- **Performance:** draw calls are unchanged (769 against 768 over the court). Triangles are up about 9% (2.76 M
  against 2.52 M over the court) from the window and balcony geometry. Frame times are unchanged.

### Uncertain / open

- **Wing differences:** the annotated guide's areas 6 and 7 show the left and right wings differing. The photos show
  only parts of the faces (trees, angles), so all of Block A's balconied faces share the pair module. One straight-on
  photo per wing face would allow wing-specific groups.
- **Group length (ESTIMATE):** the 7.2 m group is read from the car-park photo's proportions.
- **Islands:** shortened to stay off the mapped road (above).

