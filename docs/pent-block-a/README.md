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
