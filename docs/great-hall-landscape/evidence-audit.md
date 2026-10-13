# Great Hall surrounding landscape: evidence audit

The owner's brief `Great_Hall_Surrounding_Landscape_Claude_Brief.pdf` (2026-10-13, 8 pages; in
`docs/handover/uploads/`), its pictures in `refs/` (picture-1 and picture-2, the two aerials; picture-3, the game map),
each with the work area marked in blue. Code: `scripts/landcover/cover.py` (the aerials read into ground-cover grids,
written to `src/game/landcover.ts`), `src/game/ghlplan.ts` (the work area, the earth tracks, the pale clearing),
`src/game/ghlandscape.ts` (the painted ground, the plants), `src/game/scrubkit.ts` (the shared kit), `src/game/science.ts`
(`offAsphalt`, `onEarth`), cameras `src/game/ghlviews.ts` (`ghl*`).

Labels: [VERIFIED] [DECISION] [ASSUMPTION] [INCOMPLETE], as in the other audits.

Comparison sheets: `sheet-overheads.jpg` (Pictures 1 and 2 against the game over the same extents, north up),
`sheet-low-views.jpg` (an open soil patch, the long track, short-stemmed clusters, the pale clearing, an overview against
the lawn before), `debug-boundary.jpg` (the registered work boundary and the left-alone compounds drawn over the top
views: a debug aid only, nothing of it is in the game).

## What the game had

[VERIFIED] From the Legon ByPass (x about -2005) east to the Great Hall's compound (x about -1060), and north to the
Research and Innovation compound and the tennis complex's belt (z about -710 to +490): one mown lawn, the game's grass
everywhere, no trees or shrubs at all (no wood or grove areas are mapped here), the mapped tracks and paths drawn as
pale concrete strips, three mapped service roads drawn as asphalt, and a 49 m square red-roofed building on the outline
south-west of the Great Hall. Pictures 1 and 2 show a mosaic instead.

## Registration

- [VERIFIED] Picture 1: 1.114 px/m, no rotation; Picture 2: 1.07 px/m, no rotation. Anchors: the Legon ByPass, the long
  north-south track (osm, 1.2 km, x about -1324), the pale rectangle (the 49 m outline), the dirt road from the tennis
  complex's corner to the grey patch (mapped as a service road), the tennis pitches, the Research and Innovation blocks.
  Overlaying every mapped road and outline on both pictures puts them on their features within a few metres; the two
  pictures agree with each other pixel for pixel where they overlap.
- [VERIFIED] Picture 3 is the game's flat map at 0.577 px/m; its blue boundary was read through the same anchors. Where the
  three marks disagree (Picture 3 leaves out the pale rectangle's surroundings that Picture 1 includes), the union is used.

## The work area and what it leaves alone

- [DECISION] `GHL_SCOPE`: the union of the three blue marks, traced in map coordinates (a work boundary, not a surveyed
  edge): from just east of the ByPass to the Great Hall's and the Vice Chancellor's compounds (following Picture 1's
  curve round them), north to about z -710 (Picture 2's top), east to the church compound (x about -430), round the tennis
  complex's belt (Picture 2's curve) and the Public Affairs Directorate.
- [DECISION] Left alone inside it: every building and every sealed road (cleared from the painting, kept clear of plants);
  the Research and Innovation compound (fenced, its lawn and parking: `GHL_EXCLUDE`); the sealed end of the road toward the
  School of Graduate Studies (Picture 12 of the tennis brief shows it grey).
- [VERIFIED] No aerial covers z > +487 (Picture 3's boundary runs on south to about +835): nothing is changed there
  ([INCOMPLETE]; a further aerial would be needed).

## Ground cover

- [VERIFIED] Every pixel of the two aerials classed by colour (`cover.py`: dense green, green low cover, dry olive cover,
  red-orange soil, pale bare ground, dark brown ground; the blue marks and the map's labels ignored), then each 4 m cell
  keeps its commonest class and how much of it is dense green. Picture 1 decides where both cover a cell.
- [DECISION] Painted over the grass at about 1 m a pixel, the patch edges loosened by up to 3 m of smooth noise so the
  grid never shows, speckled (straw and soil in the dry cover, dry grass on the soil), faded out over the last 10 m inside
  the boundary.
- [VERIFIED] The pale rectangle (49 m, its outline osm with no satellite footprint matching) is a flat pale ground surface
  in both aerials: the building is removed; the ground is painted pale from the aerial. [INCOMPLETE] its function (no pad,
  edging or facility is added). The small mapped buildings south of it stay.
- [DECISION] The bright grey patch north of the central track (Picture 2) stays ground of its own colour: no quarry, pit or
  structure.

## Tracks

- [VERIFIED] Every mapped path and track here, and the service roads here (the dirt road from the tennis complex's corner
  to the grey patch, the curve south to the pale rectangle, the short ones by the Vice Chancellor's compound), are earth in
  the aerials: drawn as compacted red-brown earth with a trampled verge, 1.8-3.8 m wide, instead of asphalt or concrete
  (`EARTH_ROADS`, `onEarthTrack`). The roads stay in the network: routes, lengths and turns are unchanged; a ridden route
  lays no asphalt over them; a free ride rolls a little slower on them as on the other earth tracks.
- [INCOMPLETE] The aerials show more worn paths than the map has; only the mapped ones are drawn (no new corridors are
  cleared). The curve from the Great Hall's west road south to the pale rectangle (osm service road) is not visible in the
  aerials under the canopy; it is kept, as earth.

## Plants

- [DECISION] By 8 m blocks of the cover grid: where two or more cells are dense green, a thicket or short-stemmed tree
  (radius 3.3-5 m, foliage from 0.2-1.6 m up, a third of them on a visible trunk), sometimes a second smaller shrub
  beside it; one dense cell, a smaller shrub or tree; in the fullest blocks now and then (6 %) a larger crown (radius 5-6.5
  m, foliage from about 2 m up); on the green low cover a shrub in about a fifth of the blocks and an occasional small
  tree; on the dry cover fewer and olive; on the red soil a few; on the dark brown ground two small dark shrubs.
  Deterministic (hashes of position). [ASSUMPTION] every height and radius: the aerials do not show trunks.
- [VERIFIED] Clusters and gaps follow the aerials; no rows, no grid, no identical tall trunks.
- Collision: trunks have round solids; foliage never stops the bike.
- Performance: about 20,600 crowns and 92,700 grass tufts, instanced per 100 m tile: a fuller crown and the tufts within
  about 110 m, a single blob beyond, nothing past the fog; the painted ground in 160 m tiles, culled past the fog.
  Measured in the preview (fog 70-340 m, no shadow pass): on the long track (ghlTrack) 0.30 M triangles against 0.14 M
  before, in a red soil opening (ghlSoil) 0.30 M against 0.14 M; the campus's busier views run 0.6-1.0 M.

## Checks

- Route lengths: unchanged (`lens.mjs`, identical before and after); route tests pass; the build passes.

## Open questions for the owner

1. Is the pale rectangle a sports court, a slab or bare ground? Is anything on it?
2. The land south of z +487 inside Picture 3's boundary (the strip between the residential rows): an aerial of it?
3. The many unmapped worn paths in the aerials: should any be added as tracks?
4. The service road shown on the map from the Great Hall's west road to the pale rectangle is not visible in the aerials:
   is it there?
