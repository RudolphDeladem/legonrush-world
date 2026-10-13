# LEGONRUSH — Add the second UPSA evidence layer (do not replace Pack 1)

I am supplying TWO separate reference packs:
- **Pack 1:** `UPSA_Campus_Visual_Survey_and_Claude_Rebuild_Brief` — the first video-overview survey and its timestamped frame evidence.
- **Pack 2:** `UPSA_Additional_Campus_Layer_Reference_Pack` — this additional still-image/supplementary-video layer.

Treat Pack 2 as an **additional independent evidence layer**, not an updated or replacement version of Pack 1. Keep both packs and their original source filenames intact. Do not merge them in a way that loses source provenance.

## Goal
Refine the UPSA school environment in LEGONRUSH using both packs plus the repository’s canonical geography and verified map/official references. Focus on correct building identity, footprint, orientation, massing, visible floor count, façade, entrances, forecourts, campus paths, fences, sports areas, landscaping and road-edge details.

## Required first steps
1. Read `CLAUDE.md`, `README.md`, geography docs and all existing UPSA-related implementation/data.
2. Locate the authoritative UPSA area, building footprints, access points and road/path geometry in the current repo.
3. Review both packs independently. For Pack 1, cite video frame timestamps. For Pack 2, cite original image filenames. Create an evidence ledger with source, observed cue, likely feature, confidence and unresolved question.
4. Verify building names and placement against official UPSA sources and map/satellite context. Recent photos may be newer than maps; maps may be stale. Do not let either source silently override the other.
5. Do not confuse UPSA Central Administration / Opoku Ampomah Building with the UPSA hostel blocks or UGBS Graduate Building opposite GOIL at UPSA Junction.

## Storeys and placement
- Count only storeys clearly visible in source views. If partially occluded, record “at least N visible storeys” or a range and flag uncertainty.
- Do not infer exact coordinates or compass direction from façade appearance alone.
- Use canonical geometry/map-matching to determine position. If sources conflict, document the conflict before changing anything.
- Do not assign names to similar-looking blocks without signage or reliable corroboration.

## Implementation safeguards
- Add/refine this UPSA area as a separate visual/geographic layer where appropriate. Do not replace Pack 1, its source files, or unrelated campus layers.
- Preserve existing canonical campus boundaries, road/path topology, gate/access points, IDs, collision geometry, race/challenge routes, ghosts, records and leaderboards.
- Separate visual-only refinements from authoritative geometry changes.
- Work on a working branch. Run type checks, relevant geography/route tests, production build and a visual smoke test.
- Do not push to `main` or deploy without explicit approval.

## Completion report
Report: features identified; source filenames/timestamps supporting each; storey counts and confidence; map/official sources checked; files changed; whether changes were visual-only or altered canonical geometry; tests/build/visual checks; unresolved ambiguities; commit hash and push status.
