# LEGONRUSH — handover for a new Claude account

Prepared 2026-10-09 at the end of the first account's work. Read this first, then `docs/LEGON_BUILDINGS.md` in the
repository (sections 1–49 record every building batch and the owner's decisions in detail).

## 1. The project

- **LEGONRUSH**: a browser bike game (Vite + TypeScript + Three.js) set on the University of Ghana, Legon campus.
  Riders follow routes between real campus destinations (Explore / races / hunts), with free ride, drone view and a
  guide.
- **Repository**: https://github.com/RudolphDeladem/legonrush-world (public). Live build: GitHub Pages, deployed by
  `.github/workflows/deploy-pages.yml` on every push to `main`; `ci.yml` runs the checks.
- **Current goal (owner)**: rebuild the campus building by building from the owner's photos, street views and marked
  aerials, "a perfect job": painting and weathering, storeys, balconies, stairs, windows (wood vs glass and their
  colour), doors, open entrances, stone slabs and walls, roofs, trees (trees must be trees, not grass), and correct
  ground relief (hills, terraces, stairs) without breaking routes or riding.
- Last commit when handed over: `57debee` on `main` (and on branch `claude/nifty-gauss-z13ch8`). All work so far is
  committed and deployed; CI and Pages were green.

## 2. How the owner works with Claude (keep doing this)

- The owner sends a batch: numbered pictures (photos, game screenshots, aerials) with **coloured markings**
  (yellow, blue, green, violet, red, white arrows, etc.) and a message saying what each colour means. Every request is
  answered by a full batch: model it, render it, test, commit, push, deploy, send renders.
- Owner vocabulary: "opened entrance" = an entrance with no door or gate (an open passage); "one floor" vs "storey";
  "wooden windows" (usually black or brown louvred/lattice) vs "glass"; "stone-like slabs/walls" = rubble stone
  (`stoneMesh`); "uncompleted" building = bare blockwork/frame.
- Owner preferences learned: no invented clutter (they ask to remove things they did not mark); the bike must never
  be swallowed by ground or blocked by things that are not there; trees must block the bike, grass with trees must be
  rideable; roads flat unless the owner says otherwise; no asphalt over stairs.
- **Git workflow used**: develop on `claude/nifty-gauss-z13ch8`, then push the same commit to `main`:
  `git fetch -q origin main && git merge-base --is-ancestor origin/main HEAD && git push -q -u origin claude/nifty-gauss-z13ch8 && git push -q origin HEAD:main`
  then wait for the "CI" and "Deploy to GitHub Pages" runs for that sha (GitHub Actions API) and send renders.
  No pull requests. No model names in commits or code. Commit messages end with the session's Co-Authored-By line.

## 3. Architecture (what a new session needs to know)

- **Game frame**: x = metres east, z = metres south of the datum lat 5.6518, lng −0.1871
  (`x = (lng + 0.1871) · 110778.848`, `z = (5.6518 − lat) · 110574`).
- **Geography pipeline**: `npm run geo` = `scripts/geography/build-master.mjs` → `build-access.mjs` →
  `master-to-game.mjs`. Inputs in `data/geography/registry/`:
  - `corrections.json` (indent 2, ASCII): `exclude` (buildings/roads/areas), `heights` (id, place label, levels,
    height, reason), `reshape`, `addAreas` (parking/plaza/wood/grove…), `addWays`, `reclass`.
  - `access.json` (indent 1): curated entrances; an entrance must lie within 6 m of its footprint or `geo` throws.
  - Outputs: `data/geography/legon-master.geojson`, `src/data/legon-map.json`.
- **Block engine** `src/game/blocks.ts`: `createSite(name, specs)`; a Spec has name, axis, origin, storey, style,
  roofColor, fascia, pitch, blocks, keep, extras(k), replaces, onGround, plinth. Blocks: x0..z1, floors, roof
  ('hip' | 'flat' | 'crossZ' | 'none'), faces, floorStyle, y (base height; used to make open passages under an upper
  floor). Facade canvas 256×512: top half upper storey, bottom half ground storey. Non-onGround specs are lifted as a
  whole by the ground height at their origin; draw at real ground with `k.ground(x,z) − lift`.
- Helpers: `hipRoof` (exported from `waccbip.ts`; ends: hip / open gable / boarded gable / gablet), `concrete.ts`
  (`concrete()` weathering, `stoneMesh` rubble stone, `panel`, `breeze`, `pierced` square-hole screen wall, `grille`,
  `rails`), `gardens.ts` (`garden().tree/palm/bush/hedge`, skip roads automatically), `solids.ts` (`SOLIDS.add` blocks
  the free-ride bike), `letters.ts`, `modelkit.ts`.
- **Relief** `src/game/relief.ts`: ZONES (hollow / terrace / hill with ramp widths w/e/n/s) and STAIRS (alongZ swaps
  the meaning of x/z fields). Keep zones clear of roads (a ramp under a road tilts it — the Nsia Road bug).
- **Sites list** `src/game/sites.ts` (BLOCK_SITES). A footprint must be replaced by only one site (two caused the
  Basic School flicker; the route test now fails on it).
- Per-area model files: `balme.ts`, `balmewest.ts` (French Dept, Economics/Post Office circle, Bookshop),
  `waccbip.ts`, `pharmacy.ts`, `labs.ts` (Food Science, Nursing, Animal Biology, unfinished blocks), `isserannex.ts`,
  `earthscience.ts`, `physics.ts` (Physics, chemistry ranges, chemistry west entrance, covered walk, Frank Torto,
  building behind it), `basicschool.ts`, `dome.ts`, `nblock.ts`, and many more (see `src/game/`).

## 4. Checks to run before every push

`npx tsc --noEmit -p .` · `npm run geo` (when the registry changes) · `npm run test:routes` (owner checks per batch
live at the end of `scripts/route-tests.mjs`) · `npm run build` · `npm run smoke`, plus the preview tools below:
`node .preview/lens.mjs` (route lengths must not change) and `node .preview/camcheck.mjs` (`afterInside: 0`).

## 5. Preview and registration tools (`tools/preview/`, `tools/scratch/`)

The first account kept these in `.preview/` (excluded from git); they are now committed under `tools/`. To use the
camera views, copy them back: `mkdir -p .preview && cp tools/preview/* .preview/` (halls.html is served at
`/.preview/halls.html`).

- `.preview/halls.html?view=NAME` — fixed camera views (`eye = V3(x,y,z); look = V3(...)`), served by
  `npx vite --port 5299 --strictPort`; `node .preview/shoot.mjs <outdir> view=NAME …` screenshots them with
  Playwright (Chromium). `view=rend&from=A&to=B&back=N` renders a route.
- `tools/scratch/regimg.py` — registers an owner aerial to the game frame (`regimg(path,cx,cz,smin,smax)`,
  `overlay(...)`); typical scale 0.22–0.25 m/px. `feat.py x0 x1 z0 z1 [layers]` lists map features in a box;
  `plotmap.py` draws the map; `ia/fill.py` turns owner-drawn tree outlines into wood rings.

## 6. Where things stand

- Completed batches 1–63 (list in `TASKS.md` in `docs/handover/`); details per batch in `docs/LEGON_BUILDINGS.md`.
- Last owner requests (all done and deployed): Chemistry west entrance pavilion; balcony porch moved to the Economics
  long block by the Post Office; French Dept doors and open passage; chemistry extension joined by pierced screen
  walls; open passage through Frank Torto; one-floor building behind Frank Torto; Nsia Road flat by Earth Science.
- Known loose ends / things to watch:
  - `balmewest.ts` French spec still has a stale `keep` box from the old porch position (harmless).
  - Aerial registrations are approximate (±1–2 m); the owner corrects by screenshot.
  - Wall/screen pieces block the bike via `SOLIDS` circles, not via building outlines.
  - The route tests print 9 low-confidence destinations (enclosed courtyards) — known, not failures.
- Next steps: wait for the owner's next batch of marked pictures.

## 7. Handover files (`docs/handover/`)

- `HANDOVER.md` (this file), `NEW_SESSION_PROMPT.md` (the first message used on the new account), `TASKS.md`.
- `conversation-log.md` — every owner message and Claude reply as text (64 owner messages), tool calls left out.
- `IMAGE_INVENTORY.md` — each of the 220 uploaded pictures with the owner message it came with.
- `images/` — the 220 original uploads (`1.jpg` … `220.png`), named as in the log.
- `uploads/UG_BUILDINGS__LAYOUTS_AND_THEIR_STRUCTURES.zip` — the owner's buildings reference archive.
- `tools/preview/`, `tools/scratch/` (repo root) — the preview and registration scripts.
- The raw session transcript (a 500 MB `.jsonl` with every tool call and embedded image) is not included: the text
  log and the original images carry the same content.
