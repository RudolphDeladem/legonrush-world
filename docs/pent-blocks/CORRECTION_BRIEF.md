# New Pent Blocks A, B and C: detailed correction brief (2026-10-17)

The owner sent "LEGONRUSH_Pent_Block_Correction_Brief_DETAILED" (36 source slides, 61 pictures: aerial, real photos and
current-game screenshots) and a labelled aerial. The model is `src/game/newpent.ts` (block engine `blocks.ts`). The
placement comes from the project's map. The coloured outlines on the aerial were used only as a guide.

## Evidence checked

- **Aerial (slide 1):** Block B is the upper-left group, Block A the lower-left, and Block C lies east of Pent Road.
  A and B share one layout, with the car park and entrance on the Pent Road (east) side. Block C mirrors them: its
  car park and drive are on its west side, toward Pent Road. The game already places all three this way. The wings
  are the mapped outlines and were not moved.
- **Photos (slides 2-36):**
  - Four-storey wings under steep hipped terracotta roofs.
  - Cream render, a dark grey plinth and balcony bays with small brick panels.
  - Brick end walls, framed by pale vertical strips, with the tall arched stair window.
  - The front structures' brick fronts reach from the plinth to the eaves (slides 16, 35).
  - Red-brown interlocking pavers run along the blocks (slides 8-16).
  - The car parks are hardstand reaching the roads (slides 19-22, 30, 34, 36).
  - Paved drives lead to the grey steel gates in the brick walls along Pent Road (slides 21, 24).

## Changes

| Brief item | Before | After |
|---|---|---|
| Roof gables, ridges, eaves | shallow hips (pitch 0.42) | steeper hipped roofs (0.6), the ridges visible |
| Brick on the right elevations | brick faces with no frame | white render strips at both corners of every brick face, from base to eaves |
| Front structures' brick front | large louvre windows on the front's ground floor | brick from the grey plinth up, as slides 16 and 35 (`faceFirst` in `blocks.ts`); the large louvres stay on the sides |
| Pavers / lawn boundaries | lawn up to the walls | a 1.5 m apron of red-brown hexagonal pavers along the foot of every open wall |
| Parking on hardstand | lawn between the car parks and the roads | Block A's front and back car parks reach the road; the hardstand between Blocks A and B reaches the road, with a row of cars along its kerb |
| Gate and wall approach | lawn up to the gates | grey interlocking drives from Pent Road to the gates of Blocks A and B |
| Rails and posts | chain on posts round Block A's approach lawns | removed (not in slides 7 and 13); kerbs kept |
| Vegetation hiding facades | generic trees, hedge boxes and flower beds against the walls | none within 6 m of the walls (trees), 3 m (hedges) or 25 m (beds); the photographed trees (Block C's front, the car-park ends, Block A's approach) kept |

Unchanged:
- Positions, footprints and entrances.
- The kiosk, the generators and their shelters (slides 8, 23 and 31 show the white generator under its grey roof).
- The mast, the walls, the terrace with its low brick walls and grey caps, and the counter (slides 9, 10 and 13).
- Collisions and routes. The route and room tests pass.

## Comparable views (before | after)

Each pair is from the same camera.

![before and after 1](images/before-after-1.png)
![before and after 2](images/before-after-2.png)
![pavers and courtyard](images/after-pavers-courtyard.png)

## Open (needs another reference)

- The exact outline of each paved court inside the blocks. The aerial shows patterned gardens, a food court under a
  blue canopy in Block A and a white paved court in Block C. They are not modelled yet, because their extents cannot
  be measured from the stylised aerial.
- AC units and satellite dishes beyond the terrace already modelled. The photos show them, but not where on each wing.
