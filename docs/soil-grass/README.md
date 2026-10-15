# Red soil and grass correction brief (2026-10-15): ledger

Source: the owner's `Legonrush_Soil_Grass_Correction_Brief.pdf` (44 pages; six game stills, one real target RW-I07, a
2 min ride from the construction area past Okponglo to Diamed; issues SOIL-01 to SOIL-08). The PDF stays in the owner's
private archive. Comparison: `before-after-sheet.jpg`.

## What was found in the code (SOIL-07)

Two shared generators drew the soil:
- `drapeAt` (kuffourgarden.ts), used by 136 ground drapes campus-wide: a grid of vertex-coloured cells that kept only
  cells whose four corners were all covered. Every soil edge was a staircase of whole cells, the "puzzle strips" and
  notched ends of the stills.
- `coverOverlay` (scrubkit.ts): a painted texture on 2 m cells, drawn only where a cell's centre was in: the plots'
  outer edges notched in 2 m steps; inside, hard two-tone thresholds made the cream-and-orange stamps.
The Okponglo median's own colour rule also painted a worn "path" band every 32 m: the repeated crossbars.

## Changes

| Issue | Change |
|---|---|
| SOIL-01 puzzle strips | `drapeAt` now cuts a partly covered cell along the drape's own edge (found by halving the cell's side six times) instead of dropping it: smooth natural outlines everywhere the generator is used. The median's periodic crossbars removed; its bare patches come from two scales of noise. |
| SOIL-02 soil at grass level | The drapes and overlays already lie on the ground surface a few centimetres up with depth offset (no raised plates); unchanged. |
| SOIL-03 off asphalt and kerbs | The new cut never extends past where the colour rule stops (each drape's rule already ends inside the kerbs), so no spill onto kerbs or roads; overlays opt in to `pixelEdge`, their texture's alpha (null outside the plot) draws the edge at 0.5 m instead of 2 m cells. |
| SOIL-04 paving | Unchanged paving kept clear. **Open:** the pale ground by the Okponglo corner building (the 11 s apron) is not yet identified as paving or soil. |
| SOIL-05 washed blankets | The Okponglo plot, the UGBS building site and the J.J. Rawlings yard and field blend soil and dry grass smoothly instead of two flat tones; the plot thins out over its last 3 m. |
| SOIL-06 grass and soil agree | Bare earth only where the cover rule says so; the lawn under it shows round the patches; tufts stay off sealed ground (unchanged). |
| SOIL-07 corridor audit | The shared fix applies to the whole corridor (and every other drape on campus); the corridor's own rules (median, plot, yard, site) were retuned. |
| SOIL-08 checks | Typecheck, geography, route tests, build, route lengths unchanged, camera check; before/after renders at aerial and rider height. Frame rate not measured. |

## Open

1. The pale apron by the Okponglo corner building (11 s): paving or bare ground?
2. How much of the median should be bare: tuned to roughly a third; the real target shows about half in places.
