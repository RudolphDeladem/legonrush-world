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

## Revision 3 (owner's notes: "the space in between the double road is too big, each road can carry 5 cars"; brief v3 and the 360 screenshots)

`comparison-sheet-2.jpg`: top view, a raised view from the south, the four approaches, the 360 frame of the median
nose and the view before this revision.

- **Cause.** The two N4 carriageways are drawn on their mapped centre lines, which are about 20.8 m apart, and each is
  9 m wide. That left an 11 m strip of grass and red earth between them. The satellite, the Street View photo and the
  360 frames (3 and 12) show a narrow raised kerbed median with the signal mast on its nose.
- **Fix.** Between z 905 and 1640 (where the median runs, tapering over 30 m at each end), each carriageway's inner
  edge now reaches in to a median 2.4 m wide (`lbplan.ts` `MED_HALF`, `westInner`/`eastInner`). The outer kerbs stay at
  their mapped edges and the road graph is unchanged. This is done in the road mesh itself (`world.ts`), not as an
  overlay.
  - The median's kerbed strip, soil, planting and boards follow the new edges (`labawaleshie.ts`, `okponglo.ts`).
  - The signal masts on the median noses moved onto them, and their arms are longer.
  - The flares of the previous revision are removed; the widening replaces them.
  - The clearance tests in `life.ts`, `lbplan.ts` and `labawaleshie.ts` count the widened road, so nothing generated
    stands on it, and the old inner kerb is cut along it.
- **Width.** Each carriageway is about 13.3–13.7 m. Five test cars, 1.8 m wide and evenly spaced, were placed side by
  side on each approach and rendered. They fit with about 0.8 m between them. The test cars were removed afterwards.
- **Markings.** On the widened stretch the one centre line became two lane lines, a third and two thirds of the way
  across, as the satellite shows. There are no dashes across the junction box. There are zebra crossings on the four
  arms, as on the satellite and the Street View photo, laid only on the road. The paved core now spans z 1190–1240, so
  the last grass triangle by the south crossing is gone.
- **Checks.** Typecheck, geo, route tests and build pass. The camera check reports 0 views inside buildings. Route
  lengths are unchanged. The road blockage scan shows only the existing hits on road 864.
  - A scan of the widened carriageways for colliders finds none on the new strip. It does find existing colliders on
    the original carriageway's outer half near z 960, 1040, 1300 and 1380, which this change doesn't touch.
- **Uncertain.** The 2.4 m median width is read from the 360 frames by comparison with car widths, not measured. The
  median may be wider farther from the junction than the photos show.
