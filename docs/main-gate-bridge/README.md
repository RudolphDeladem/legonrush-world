# Main gate bridges: footway and the bowl's wall (batch 135)

The owner, 2026-10-14, with two game screenshots and two Google Street View frames (Sep 2024), in `refs/`.
Comparison: `sheet.jpg`. Code: `src/game/cutplan.ts` (`DECK_WALKS`), `src/game/legoncut.ts`, `src/game/science.ts`.

1. **The footway on the bridge in front of the main gate** (`owner-20.jpg` game, `owner-21.webp` real).
   - [VERIFIED] The real footway has two railings: the outer one over the drop, and an inner pipe railing between the
     footway and the road. It is grey concrete block paving on a kerb, with white bollards across its mouth.
   - Before, the game had only the outer railing, over the campus's pale path.
   - Now both bridges' footways are drawn this way: grey block paving 0.16 m up on a kerb, and the inner railing (posts
     every 2 m, a top rail and three below it), solid to the bike.
   - [DECISION] The camera in the Street View stands at the north bridge's west end looking east, so the three bollards
     stand there.
   - [ASSUMPTION] The south bridge's footway is drawn the same way without bollards; no picture shows its ends.
   - The deck's bare top beside the footway is toned to the road's grey.
2. **The wall along the island** (`owner-22.webp` real, `owner-23.jpg` game).
   - [VERIFIED] The real wall runs on from the cutting's parapet along the top of the slope inside the ring, behind the
     stone island with the chevrons, to the next bridge.
   - Before, the game's parapet stopped where the slope began (z ≈ 113 and 143). The slope's top edge was open, so
     anyone could walk off it.
   - Now the same parapet (0.3 m wall, 1.05 m high, with a cap) runs along the slope's top edge, 0.3 m back from it. It
     joins the west wall's parapet at both ends and is solid to the bike.

Checks: route lengths identical, route tests, build, smoke ride.
