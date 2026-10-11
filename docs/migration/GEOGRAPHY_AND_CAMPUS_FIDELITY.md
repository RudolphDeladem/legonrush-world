# LEGONRUSH — geography and campus fidelity

The full technical record is `docs/LEGON_MASTER_GEOGRAPHY.md` (sources S1–S12, pipeline, reconciliation),
`docs/LEGON_DESTINATION_ACCESS.md` (entrances and routing), `docs/LEGON_ENTRANCE_VERIFICATION.md`,
`docs/CAMPUS_REFERENCE_AUDIT.md` (the reference PDFs) and `docs/LEGON_BUILDINGS.md` (every building). This file is the
summary a new account needs, with the rules that must not be broken.

Labels: [VERIFIED] · [DECISION] · [PROPOSAL] · [INCOMPLETE] · [ASSUMPTION].

## 1. The governing rule [DECISION]

**Geography is authoritative; the 3D world adapts to it.** Positions come from source geometry. Buildings, entrances
and relief are then corrected from the owner's own photographs, aerials and briefs, which override map sources where
the owner says so. Never move geography "to look better".

## 2. Coordinate frame [VERIFIED]

- Datum lat 5.6518, lng −0.1871. x = metres east, z = metres south:
  `x = (lng + 0.1871) · 110778.848`, `z = (5.6518 − lat) · 110574`.
- `src/data/legon-map.json` stores coordinates ×10 (decimetres).
- Heights: y up, metres; ground height from `relief.ts` (ZONES/STAIRS) plus the DEM-derived terrain.

## 3. Data and files [VERIFIED sizes 2026-10-11]

| Path | Size | Role |
|---|---|---|
| `data/legon.osm` | 4.6 MB | OpenStreetMap snapshot (2026-10-04) |
| `data/geography/sources/` | 4.5 MB | Overture, Google Open Buildings, ML buildings, places, UG Campus Map POIs (`ug-campus-map-pois.json`) and boundary, Copernicus DEM, Sentinel-2 composite metadata, ESA WorldCover |
| `data/geography/registry/corrections.json` | part of 416 KB | `exclude`, `heights`, `reshape`, `addAreas`, `addWays`, `reclass` — the owner's corrections in data form (indent 2, ASCII) |
| `data/geography/registry/access.json` | 84 KB | Curated entrances (indent 1); an entrance must be within 6 m of its footprint or `npm run geo` throws |
| `data/geography/registry/landmarks.json`, `naming.json`, `zones.json` | — | Landmarks, names, interpretive campus zones |
| `data/geography/legon-master.geojson` | 2.8 MB | Authoritative merged dataset |
| `data/geography/legon-access.geojson` | 344 KB | Entrances and access network |
| `data/geography/reconciliation-report.json`, `access-report.json`, `legacy-audit.json` | — | Checks |
| `src/data/legon-map.json` | 508 KB | Game map generated from the master |
| `public/geo/` | — | Inspector imagery (Sentinel-2 composite) |

Paths named in the migration request that do **not** exist [VERIFIED]:
- `data/ug-campus-map-pois.json` → actual: `data/geography/sources/ug-campus-map-pois.json`.
- `scripts/osm-campus.mjs` → not present; the pipeline is `scripts/geography/*.mjs` (+ `fetch_sources.py`).
- `src/game/landmark-replacements.ts` → not present; landmark handling is `src/game/landmarks.ts` plus
  `data/geography/registry/landmarks.json`, and modelled sites replace footprints via `replaces` in `src/game/sites.ts`.

## 4. Pipeline [VERIFIED `package.json`, `ci.yml`]

```
npm run geo   # build-master.mjs → build-access.mjs → master-to-game.mjs (no network)
```
CI re-runs it and fails if `src/data/legon-map.json`, `legon-master.geojson`, `reconciliation-report.json`,
`legon-access.geojson` or `access-report.json` differ from the committed files. **Always run `npm run geo` after any
registry edit and commit the regenerated outputs together.** Source refresh (`scripts/geography/fetch_sources.py`)
needs network and is run by hand only.

## 5. Fidelity rules learned from the owner [DECISION]

1. Entrances are the real doors/gates; a route ends at the right one.
2. A building footprint is replaced by **one** modelled site only (two caused the Basic School flicker; the route test
   fails on duplicates).
3. Relief zones must stay clear of roads (a ramp under a road tilts it — the NSIA Road bug); roads flat unless marked.
4. No asphalt over stairs; open passages must be rideable.
5. False footprints (satellite artefacts) are excluded in `corrections.json`, never deleted from sources (e.g. the
   main-entrance plaza footprint `ml:d5854760-…`, excluded 2026-10-11).
6. Phantom structures the owner marks are removed; withdrawn removals are restored (Volta substation/cottage/cage).
7. Aerial registrations are approximate (±1–2 m); the owner corrects by screenshot.
8. Comparison cameras per brief (e.g. `nsia.ts`, `kuffour.ts`, `science.ts`, `balmepent.ts`, `entrance.ts` `EN_VIEWS`
   en1–en37) document the views used to match photos; they are estimates, not surveys.

## 6. Coverage status

- Modelled areas: see `docs/handover/TASKS.md` (96 items) and `docs/LEGON_BUILDINGS.md` sections 1–74 [VERIFIED as
  documents].
- Most recent: main entrance precinct, IAS, JQB, La Road wings, Finance, Provost frontage, SPA, Drama Studio
  (section 74). Its unresolved measurements are listed at the end of section 74 [INCOMPLETE].
- Areas never sent by the owner remain as generic footprint buildings from the map [ASSUMPTION: no complete list of
  un-modelled buildings exists; build one with `tools/scratch/feat.py` and `sites.ts` if needed].

## 7. Checks that protect geography (run before every push)

`npm run geo` (if the registry changed) · `npm run test:routes` (owner checks per batch at the end of
`scripts/route-tests.mjs`; 9 low-confidence enclosed-courtyard destinations are known, not failures) ·
`node .preview/lens.mjs` (route lengths must not change unless intended) · `node .preview/camcheck.mjs`
(`afterInside: 0`).
