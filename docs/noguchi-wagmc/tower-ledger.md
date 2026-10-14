# Noguchi tower, end block, neighbour and entrance (batch 153)

Source: the owner's *Noguchi Tower End Block And Entrance Correction Brief* (12 pages, Pictures 1-7). Code:
`src/game/nogplan.ts` (`LAB.tower`, `LAB.towerH`, `LAB.low`, `LAB.endFloors`), `src/game/nog.ts` (the lab spec's
extras). Comparison: `tower-sheet.jpg` (brief left, game right).

| ID | Done | Label |
|---|---|---|
| T01 tower (blue site, Pictures 1, 2, 4) | the broad signed block at this site replaced by a slim tower 5 x 6.7 m, 20 m high (about twice the laboratory's eaves): a blank pale blade on its west face, its top sloping up to the north; a thin blade at the north edge; the open bay between with four dark projecting landing slabs, bar rails on their open edges, lit panels behind; a dark base; a thin mast. No lettering, windows or stair on it | VERIFIED form; height, footprint, landing levels ASSUMPTION |
| B01 signed end block (violet, Pictures 1, 3, 4) | the east end block 4 storeys, plain pale faces (fins removed), parapet; raised NOGUCHI over ADVANCED RESEARCH LABORATORIES on its north face; three small windows lower on the west side; three railed landings on its east face at the north corner | VERIFIED placement (owner); face detail from Picture 3 |
| B02 one-floor neighbour (yellow, Pictures 4, 7) | the low block beside the tower enlarged (12 x 13.5 m): one floor, flat roof, parapet, a pale plant-enclosure screen and units on the roof, blank walls, a downpipe and a door | VERIFIED one floor (owner); footprint ASSUMPTION |
| E01 entrance (Pictures 5, 6) | the closed side legs and stepped strips removed; the front beam on discrete square posts (corner post, three posts, the wider end leg) with open bays; the pier at the wall with a darker panel; a second frame behind, higher; dark roof infill at two levels; a small light curved connector and a dark one; top returns only; recessed glazing and doors; dark tiled floor | VERIFIED type; spacing ASSUMPTION |

Tests run: typecheck, route tests ok, challenge routes unchanged, no non-finite vertices, stuck-bike scan round the
laboratory (the only blocked points are the laboratory's north wall beside the mapped road and the portal's corner
posts, both real), build, smoke ride.
Unresolved: the tower's height, plan and landing levels; B02's hidden footprint; the canopy's exact spacing.
