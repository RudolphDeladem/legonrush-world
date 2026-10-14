# Evandy ground-floor tapered partitions (batch 152)

Source: the owner's *Evandy Ground Floor Tapered Partition Correction Brief* (8 pages; G1 game, R1 real). Code:
`src/game/evandy.ts` (`FIN`, `taperedFin`, `groundWindow`, used in `balconies` for the frontage pair only).
Comparison: `sheet.jpg`.

| Item | Done | Label |
|---|---|---|
| Scope | the central divider of every ground-floor balcony bay on the main block frontage (front-w and front-e, south face); outer piers, the entrance columns, the upper floors' dividers and the other wings unchanged | DECISION (brief's scope guard) |
| Fin | replaces the plan wedge: an extruded side profile, constant 0.5 m wide across the facade, 1.1 m deep under the balcony slab (the balconies' front line), sloping back to a 0.3 m deep return 0.55 m high at the foot of the wall; joined to the slab's underside and the wall; collisions from the geometry itself (no old collider left) | VERIFIED shape (R1); dimensions ASSUMPTION |
| Windows | the two ground-floor openings either side of each fin, on the facade texture's openings: a 0.2 m reveal round them (recess), sill 1.2 m, head 3.05 m, dark frame with mullion and transom, dark glass, vertical security bars with three horizontal bars; the grey louvres there covered | VERIFIED type (R1); sizes ASSUMPTION |
| Louvre rule | the owner's earlier "all Evandy windows grey louvres" yields at these verified ground-floor bays to this brief | DECISION |

Tests run: typecheck, route tests ok, challenge routes unchanged, no non-finite vertices, stuck-bike scan along the
frontage (x 550-645, z -1240..-1210): no blocked spots, build, smoke ride.
Unmeasured: the fin's exact depths, the slab's thickness, hidden faces, the glazing behind the bars.
