I'm continuing my LEGONRUSH project from another Claude account that ran out of credits. You have no memory of our
earlier work, so everything you need is in this repository (RudolphDeladem/legonrush-world). Please read carefully
before doing anything.

## What LEGONRUSH is

A browser bike game (Vite + TypeScript + Three.js) set on the real University of Ghana, Legon campus. Riders follow
routes between real campus destinations (Explore, races, hunts), with free ride, a drone view and a guide. It deploys
to GitHub Pages from `main` (`.github/workflows/deploy-pages.yml`); `ci.yml` runs the checks.

My current goal: rebuild the campus building by building from my photos, street views and marked aerial images,
with a perfect level of detail:
- painting and weathering (faded paint, grime, peeling, red-brown bands at the foot of walls);
- number of storeys, balconies, stairs, doors and open entrances;
- windows: wooden or glass, and their colour (many campus buildings have black or brown wooden louvred windows,
  others have glass in grey or brown frames);
- stone-like slabs and walls (rubble stone), roofs, the environment around each building;
- trees must be real trees (not grass), and ground relief (hills, terraces, stairs) must be right without
  breaking the routes or the riding.

## Read these first, in this order

1. `docs/handover/HANDOVER.md`: the project, how I work with you, architecture, checks, tools and current state.
2. `docs/LEGON_BUILDINGS.md`: sections 1–49 record every building batch and every decision I made, in detail.
3. `docs/handover/TASKS.md`: the 63 batches completed so far, in order.
4. `docs/handover/conversation-log.md`: our whole earlier conversation as text (my 64 messages and the replies).
   Skim it to learn how I describe things and what I corrected.
5. `docs/handover/IMAGE_INVENTORY.md` and `docs/handover/images/`: all 220 pictures I sent, each listed with the
   message it came with (the message explains what each coloured marking means). Open the pictures when you need
   them; I may also refer to them by number.
6. `docs/handover/uploads/UG_BUILDINGS__LAYOUTS_AND_THEIR_STRUCTURES.zip`: my buildings reference archive.
7. Copy `tools/preview/*` to `.preview/` (`mkdir -p .preview && cp tools/preview/* .preview/`) so the preview camera
   views and the check scripts work. `tools/scratch/` has the Python scripts used to line my aerial images up with
   the game map (`regimg.py`, `feat.py`, `plotmap.py`, `ia/fill.py`).

## How I work with you (keep exactly this workflow)

- I send one batch per message: numbered pictures (real photos, game screenshots, aerial images) with coloured
  markings (yellow, blue, green, violet, red, white arrows, etc.) and I explain what each colour means. You fix
  everything in the batch, perfectly, in one go.
- My words: "opened entrance" means an entrance with no door and no gate (an open passage you can walk through);
  "one floor" vs "storey"; "wooden windows" (not glass); "stone-like" means rubble stone; "uncompleted" means bare
  blockwork or an unfinished concrete frame.
- Things I care about: don't invent clutter (remove anything I didn't ask for if I mark it); the bike must never
  sink into the ground or be blocked by things that aren't there; trees must block the bike but grass between trees
  must be rideable; roads are flat unless I say otherwise; no asphalt over stairs; buildings connected where I say
  they are connected.
- For every batch:
  1. Study the pictures and work out where each marked thing is in the game (game frame: x = metres east,
     z = metres south of lat 5.6518, lng −0.1871; `x = (lng + 0.1871) · 110778.848`, `z = (5.6518 − lat) · 110574`).
  2. Model it (block engine `src/game/blocks.ts`, area files such as `physics.ts`, `balmewest.ts`,
     `earthscience.ts`, ground relief in `src/game/relief.ts`, map corrections in
     `data/geography/registry/corrections.json` and entrances in `access.json`).
  3. Render preview views (`npx vite --port 5299 --strictPort`, then `node .preview/shoot.mjs <outdir> view=NAME`)
     and look at them yourself; compare with my photos and fix what doesn't match.
  4. Run all checks: `npx tsc --noEmit -p .`, `npm run geo` (if the registry changed), `npm run test:routes`
     (add an owner check for the batch at the end of `scripts/route-tests.mjs`), `npm run build`, `npm run smoke`,
     `node .preview/lens.mjs` (route lengths must not change), `node .preview/camcheck.mjs` (`afterInside: 0`).
  5. Add a section to `docs/LEGON_BUILDINGS.md` describing the batch.
  6. Commit on the branch this session gives you, then push the same commit to `main` as well (fast-forward only),
     wait until the "CI" and "Deploy to GitHub Pages" runs for that commit succeed, and send me the renders.
     No pull requests.
  7. Reply with a short summary of what you changed for each of my markings.

## Where we stopped

All work is committed and deployed (last code batch: `57debee`; handover commit: `ef2123c`), CI and Pages green.
The last batch: the chemistry department's west entrance pavilion; the balcony porch moved to the Economics long block
by the Post Office; the French Department's doors and open passage; the chemistry extension's west side joined by
white screen walls with small square holes; an open passage through the Frank Torto Building's ground floor; the
one-floor building behind the Frank Torto Building; Nsia Road made flat beside Earth Science. Known loose ends are
listed in `HANDOVER.md` section 6.

## Your first reply

Don't change anything yet. Read the files above, set up `.preview/`, start the preview server and render one or two
existing views to prove the tools work. Then reply with:
- a short summary of the project and its architecture in your own words;
- the workflow you will follow for each batch;
- what the last batch changed;
- anything you could not find or could not run.

Then wait for my next batch of pictures.
