# Okponglo junction (N4 / Legon E Rd, Jubilee Drive, La Bawaleshi Road)

Owner's brief: `LEGONRUSH_Junction_Correction_Prompt_v2.docx` plus video `IMG_9707.MP4` (a Street View screen
recording of Legon E Rd; 23 frames sampled every 2.5 s). Map centre 5.640796, -0.178149.
`comparison-sheet.jpg` sets the satellite against the game's top view, the owner's marked game view against the south
approach, and Street View against the north approach.

## Root cause

- The mapped carriageways are separate road ribbons, so ground showed between them in the middle of the junction.
- The `ISLANDS` loop in `labawaleshie.ts` painted pale corner and median drapes over any non-road ground within 9 m.
  Together these made the green triangles and wedges.
- `lbplan.ts` gave the south-bound carriageway a half-width of 3.3 m, but the road is drawn 9 m wide (half 4.5 m). The
  kerbed median therefore covered 1.2 m of the carriageway, which narrowed the approach and left tan diamonds on it.

## Fix

- A paved core: inside the junction box (x 958–1024, z 1195–1233), every 0.25 m cell that is enclosed by road (at least
  7 of 8 rays meet a road within 26 m) is paved with the game's asphalt.
- No island or median drape is drawn there, and the two median-nose drapes (`mn`, `ms`) are removed.
- The median gap is shortened from z 1190–1262 to z 1194–1234, so the kerbed medians reach the junction instead of
  stopping short and leaving a wedge. No new islands were invented.
- `W_HALF` is now 4.5, matching the drawn road.
- The approaches widen by up to 4 m on their outer side over their last ~26 m. The widening is tapered: it is on the
  north-bound and south-bound N4 approaches only, and no buildings are inside it.
- Signal posts keep their positions; their search skips the paved core.

## Width check

At the stop lines, 9 m of carriageway plus the 4 m flare makes about 13 m. At about 2.6 m per car side by side, that
fits 4–5 cars. This was measured on the clearance grid used to build the paving and checked in the top-down render.

## Files changed

- `src/game/labawaleshie.ts`: the paved core, the flares, the island drapes and the signal-post search.
- `src/game/lbplan.ts`: `W_HALF` and `MEDIAN.gap`.

## Checks

- Typecheck, `npm run geo`, `npm run test:routes` and `npm run build` pass.
- The camera check reports 0 cameras inside buildings.
- The road blockage scan matches its result before the change (the pre-existing hits are unchanged).
- Route lengths are unchanged.

## Uncertain or not done

- Stop lines and lane markings were not rebuilt.
- Frame rate was not measured. The core adds one merged mesh.
- Where the south median restarts (z 1234) is estimated from the satellite.
