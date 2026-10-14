# Noguchi and WAGMC: the owner's reconstruction brief (batch 136)

Source: `docs/handover/uploads/Noguchi_WAGMC_Annotated_Claude_Reconstruction_Brief.pdf` (40 pages: Apple maps M1-M3,
Noguchi photographs N01-N07, WAGMC drone frames W01-W49). The comparison is `sheet.jpg`; the references are in `refs/`.
Code: `src/game/nogplan.ts`, `src/game/nog.ts`, `src/game/nogtrees.ts`, and `world.ts` (`medStyle`).

## Registration
- [VERIFIED] The Apple satellite views register on the game map, no rotation:
  - M1 at 2.617 px/m: x = 192.2 + px / 2.617, z = 1703.3 + py / 2.617;
  - M2 at 2.242 px/m: x = 191.2 + px / 2.242, z = 1703.8 + py / 2.242.
  - The anchors: the old courtyard ring (03), the red courtyard building (04), the laboratory L (02) and the road
    junctions.
- Two frames:
  - Noguchi's: origin at the ring's centre, 15° off east;
  - WAGMC's: origin at its circular island, 27° off east.

## WAGMC (the game had only a label and a fragment)
- [VERIFIED] Built at its real position as a two-storey white U:
  - two forward wings and the base with the portal;
  - the rear extension and the small flat service box;
  - continuous red-brown hipped roofs with dark fascias;
  - regular dark windows, tall glass at the inner corners, slots at the wing ends.
- [VERIFIED] The thick white portal frame round the dark entrance, the pale platform and steps.
- [VERIFIED] The ground in front:
  - the muted salmon forecourt with its bollard line;
  - the kerbed groundcover plots and the tree in the north one;
  - the circular planted island in its low pale kerb (not a UGMC roundabout);
  - the asphalt drive and yards, the parking with the open dark metal shade frames;
  - the slim paired lamps.
- [VERIFIED] The white boundary wall with the gate structure beside the approach.
- [ASSUMPTION] The wall's openings where the mapped service road crosses it.
- [VERIFIED] The lettering on the portal's top band, from the owner's photo (`refs/owner-wagmc-entrance.png`): the
  round logo, then WAGMC GENOMIC MEDICINE BUILDING over WEST AFRICAN GENETIC MEDICINE CENTRE (WAGMC). The full-height
  dark glazing fills the frame, with the doors at its foot (`wagmc-entrance-game.jpg`).
- Map: the fragment `ml:bb10dd81…` is reshaped to the U, and a second roof fragment is excluded.

## Noguchi
- [VERIFIED] 02, the Advanced Research Laboratories (N01-N07):
  - the long hipped grey-brown wing with tall white piers and dark louvred recesses over a darker base;
  - the white entrance frame round the recessed dark lobby;
  - the pale flat service block with its plant;
  - the taller signed end: NOGUCHI over ADVANCED RESEARCH LABORATORIES, with external stair flights and balconies
    with open dark railings;
  - the freestanding sign in its kerbed island with shrubs and black bollard lights;
  - block-paved parking with white bays.
- [ASSUMPTION] The heights are relative: the wing 2 × 4.2 m, the end 4 storeys.
- [VERIFIED] 03, the old courtyard complex:
  - a continuous dark pitched-roof ring (outer and inner slopes, hips) round an open lawn court;
  - straight pale paths and the small central hipped pavilion;
  - the covered entry link east to the curved loop;
  - no laboratory facade.
- [ASSUMPTION] 03 is two storeys of 3.5 m; no side elevations were supplied.
- [VERIFIED] 04, the small red courtyard building, is a ring round its open green centre. Its east end is pulled 1.5 m
  out of the service road.
- [VERIFIED] 17/18 are solar panel fields (the owner): low rows of dark panels on light frames with pale aisles. Nine
  detected "buildings" inside them are excluded.
- [VERIFIED] 21, the red shed in the lawn, is added. 05-16, 19, 20, 23, 24 and the mixed-roof compound 08 keep their
  mapped outlines with the roof colours M1/M2 show (`NOG_FINISH`). All are low and provisional.
- [VERIFIED] 1,183 mature trees are read from M2's dark green canopy, kept off the roads, buildings, arrays,
  compounds and UGMC.

## Unresolved
- [INCOMPLETE] The narrow stair tower in N01/N04 is not placed: its footprint is not matched.
- [INCOMPLETE] The exact heights of every satellite-only building.
- [INCOMPLETE] The WAGMC forecourt's paving product.
- [INCOMPLETE] Storey counts the owner may confirm: the laboratory's long wing (2) and tall end (4), and the old ring (2).
