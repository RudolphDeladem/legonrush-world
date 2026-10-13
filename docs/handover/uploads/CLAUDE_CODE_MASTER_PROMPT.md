# LEGONRUSH — IPS ROAD COMMERCIAL CORRIDOR RECONSTRUCTION (SEPARATE WORK PACKAGE)

Work in the existing LEGONRUSH repository. This task is a distinct corridor reconstruction package for the commercial frontage on IPS Road, opposite the school/campus area indicated by the user. Do NOT merge it into the prior UPSA campus landmark reconstruction brief or rename/replace any existing UPSA campus buildings.

## Reference set / observed assets
Use every image in `reference_images/`, the complete supplied `270_degree_corridor_reference_video.mp4`, and `video_keyframes/` as primary visual references. Inspect the entire video and all still images before coding.

Observed assets to reconstruct as distinct buildings:
1. **Nophil Heights** — a prominent corner commercial building. Reference cues: large white/light-grey upper volume projecting beyond lower floors; red raised roofline letters; large black horizontal ventilation louvres; narrow vertical windows below the upper projection; continuous metal balcony rails; ground-floor retail units and a large red-framed glazed corner shop. Use only features visible in references; do not invent inaccessible rear architecture.
2. **Prestige commercial block** — long multi-storey beige/tan and grey tiled frontage; repeated rectangular windows; deep horizontal slab/awning ledges; rooftop red “PRESTIGE” lettering; a central entrance bay with tall golden/yellow columns and reflective dark glazing; many individual ground-floor retail bays and a broad paved forecourt/parking apron. Treat it as a long street-facing building, not a campus academic block.
3. **Abednego F. O. Amartey Towers** — white multi-storey tower with a large blue reflective-glass curtain-wall face, narrow vertical blue-glazed strips, repeated window bands, white projecting slab edges, rooftop building name, gated perimeter/fence and a rough roadside verge. Use the reference images to determine the visible orientation and silhouette.
4. **Connecting IPS Road corridor** — model the street as a continuous place, not isolated building props. Include road surface, dusty/unsealed shoulder where shown, paved/herringbone commercial forecourts, curb and transitions, parked cars only as restrained background dressing, utility poles, overhead power/telecom wires, and the changing relationship between paved forecourts and road edge. Do not turn every forecourt into a sidewalk or extend campus paving where the images show dirt.

## Geography and implementation rules
- First inspect existing repository geography, road centerlines, footprints, POIs, scene architecture, render pipeline, tests and the current corridor location. Use authoritative project data and map/imagery evidence to establish placement. **Do not guess coordinates, building dimensions, road widths or distances.** If a position cannot be established, record the uncertainty and make the smallest reversible change.
- Keep the three named buildings as three unique assets with independent footprints, heights, facade materials, windows, signage and collision bounds. Do not reuse the same generic block mesh with different labels.
- Use efficient repeated facade modules/instancing where appropriate, but preserve silhouette and distinctive features. Use restrained signage based on the actual references. Text can be texture/mesh labels if the current renderer supports them; avoid unreadable floating text.
- Reconstruct the road and frontages with continuous pavement/forecourt/curb transitions. Prevent z-fighting, grass/asphalt flicker, raised strips, floating surfaces, gaps, and collision seams. Keep road surfaces slightly separated from terrain using the project's established elevation conventions, not arbitrary large offsets.
- Utility poles and wires should follow the observed corridor and avoid crossing gameplay paths at unsafe/awkward height. Do not add wires where unsupported by references.
- Cars and pedestrians are contextual dressing, not the main asset. Keep collision and performance sensible; do not block the playable route or create random clutter.
- Treat the screenshots/video as visual references only. Do not reproduce Google Maps UI, Street View arrows, phone status bars, logos from app UI, watermarks, screenshot borders or map controls as in-world assets.

## Protect existing game
- Preserve campus master geography, road/path geometry, entrance/access-point registries, challenge/race routes, route IDs, ghost recordings, leaderboards, collision rules and existing landmarks outside this scoped corridor.
- Do not move or remodel UGBS Graduate School, UPSA Hostel, Vice-Chancellor’s Ghana Office Complex, the UPSA Central Administration Block, Joshua Alabi Library, KOKA Auditorium or any previously reconstructed campus landmark as part of this task.
- Follow existing project conventions and architecture. Do not introduce a second conflicting source of truth for building positions.
- Keep changes scoped and reversible. Do not commit to `main`, push to `main`, or deploy production without explicit user approval. A feature branch is acceptable if project workflow permits.

## Required workflow
1. Inspect repo status and identify the exact target corridor from existing geometry and supplied context.
2. Review all reference images and watch the entire video. Make an evidence table mapping each feature to the source image/frame and confidence (high/medium/low).
3. Inspect existing footprint, road, scene and landmark systems. Reuse existing authoritative footprints when available; add only missing geometry.
4. Implement the three buildings and connecting street context as distinct, performance-conscious assets.
5. Run typecheck, unit/route/geography tests and production build. Add/update regression tests if new data/geometry is introduced.
6. Launch the relevant preview and visually inspect multiple angles and daylight/weather states if supported. Specifically inspect the whole corridor, not just the front facade; check for clipping, duplicated meshes, incorrect scale, floating surfaces, flicker, blocked routes and excessive draw calls.
7. Compare the result against the provided contact sheet and keyframes; correct discrepancies supported by evidence.
8. Report files changed, placement source, tests/build results, known uncertainties, branch/commit and push/deployment status. Do not claim success for checks that were not run.

## Acceptance criteria
- Nophil Heights, Prestige and Abednego F. O. Amartey Towers are visibly distinct and recognizable from their reference views.
- Correct long-versus-tower proportions and unique facade signatures are preserved.
- The road, paved forecourts, curbs/shoulders, utility poles and overhead wires read as one continuous corridor.
- No changes to unrelated campus geography or established route geometry.
- No significant flicker, z-fighting, floating buildings, ground gaps, broken collision or performance regression.
- Build/tests pass, or any failure is reported clearly with cause.
