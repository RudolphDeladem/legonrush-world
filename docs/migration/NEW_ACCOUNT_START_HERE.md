# LEGONRUSH — start here (new Claude account)

## Latest update: 2026-10-17 (read this first)

The run of 2026-10-15 → 10-17 (session branch `claude/legonrush-buildings-rebuild-jq9rwh`) ran out of credits after
batch 199. `main` is up to date with that branch. CI and Pages were green for every push, the last code commit being
`50310fc` (the Evandy basketball court). Nothing is half-finished. Batches 165–199 are one entry each in
`docs/handover/TASKS.md`. The chat of this run is not in the repository: the owner asked not to upload full chat
histories to the public repo. The decisions are in the per-brief docs below.

What this run did, newest first, with the folder holding each one's ledger and sheets:
- 199: Evandy basketball court markings (FIBA layout) (`docs/evandy-audit/images/court.jpg`).
- 198: the old single-storey residence east of Bani's south end, replacing three generic blocks; rusted roofs, gates
  (`src/game/oldhouse.ts`, `docs/old-residence/`).
- 197: the Evandy Hostel 45-page reconstruction audit, EV-001 to EV-024 (`docs/evandy-audit/ledger.md`). It covers the
  Main tank deck, the east range facing Bani, the glass and metal gates, Annex A and B tanks, the I05/I06 buildings and
  the market-style building. The audit's protected RED end (Main's west end) must stay untouched.
- 196: the abandoned concrete shell behind New Pent Block B (`src/game/shell.ts`).
- 195: the UGBS graduate building from the owner's video (`docs/ugbs-new/ledger.md`).
- 191–194: the New Pent blocks. A and B are identical and C is their mirror image, all built from Block A
  (`docs/pent-blocks/CORRECTION_BRIEF.md`).
- 190: campus labels and generic-building storeys (`docs/campus-labels/README.md`).
- 185–189: walking, rooms, gates and lodges (`docs/rooms-walking/`).
- 165–184: the 65-slide correction, the Diaspora halls, the Balme Library audit, soil and grass, the Legon Hall and
  Mensah Sarbah entrances, and the Okponglo junction (each has its folder under `docs/`).

Open items the owner has not yet answered:
- **Evandy:**
  - Annex A's door position (provisional, at the bend of the south bar).
  - Evandy's map entrance point for routes and the walk popup is still the old inferred point, not the new front door
    (data/geography/registry/access.json; needs `npm run geo`).
  - A second basketball hoop at the south end (offered).
  - The close-up views listed in `docs/evandy-audit/ledger.md`.
- **Old residence:** whether a room stands under the big tree at its north-east corner (the crop hides it). The gate
  positions were chosen, not shown.
- **Elsewhere:** the electricity pylon in front of New Pent Block C's entrance, Amerley Lane missing from the map, the
  TF hostel gate, Evandy Annex B's courtyard, and facade variety per New Pent wing.

How this run worked, which a new session should keep doing:
- **Before/after renders:** shoot the "before" set from the old build (`.preview/hdist`, port 5299). Build the "after"
  into a second outDir and serve it on port 5300, with a copy of `shoot.mjs` pointed at 5300
  (`npx vite build --config .preview/vite.halls.mts --outDir .preview/hdist2`;
  `npx vite preview ... --port 5300 --outDir .preview/hdist2`). Two builds can then be rendered side by side
  without stashing. Shots take 2–5 minutes each on software GL: run them in the background.
- **Registering an owner's aerial on the game:** fit an affine from 15–20 matched roof corners (see
  `src/game/evandyplan.ts`).
- **Generated hedges and props:** to keep them out of an area without changing the random sequence elsewhere, consume
  the same `rand()` calls and skip, as `life.ts` does for New Pent and Evandy.
- **The owner's style:** reply briefly and only about the current request; do not list earlier work. Push to the
  branch and to `main`, confirm CI and Pages, and send the before/after images.

---

Updated 2026-10-15, when account 1's third run (2026-10-13 15:41 → 10-15, batches 124–164) ran out of credits. The
history so far:
- account 1 (10-06 → 10-09): batches 1–63;
- account 2 (10-09 → 10-11): batches 64–96;
- account 1 again (10-11 → 10-13): batches 97–123;
- account 1's third run (10-13 → 10-15): batches 124–164.

Everything is in this repository, including the chat history of every account-1 run.

## For the owner: 5 steps

1. On the new account, open Claude Code on the web (https://claude.ai/code) and connect GitHub. The Claude GitHub app
   needs access to `RudolphDeladem/legonrush-world`.
2. Start a session on `RudolphDeladem/legonrush-world` (branch `main`).
3. Paste the prompt below as the first message.
4. Wait for its reply (it reports the checks and what it understood).
5. Send your next batch of marked pictures or a PDF/Word brief, as before.

You do **not** need to re-upload anything from before. The pictures you pasted are in `docs/handover/images/`
(1–841, indexed by `docs/handover/IMAGE_INVENTORY.md`); every PDF, Word brief, zip pack and prompt file you attached
to the first account is in `docs/handover/uploads/` under its own name. Account 2's private PDFs and chat stay in the
private backup zip it sent you (`ASSET_INVENTORY.md` §6).

## Ready-to-paste first prompt

```
I'm continuing my LEGONRUSH project from another Claude account. You have no memory of the earlier work; everything
you need is in this repository: https://github.com/RudolphDeladem/legonrush-world

LEGONRUSH — "The Campus Lifestyle Reimagined. Ride. Race. Connect." — is a browser 3D cycling game (Vite +
TypeScript + Three.js PWA, Supabase backend) set on the real University of Ghana, Legon campus and the roads round
it (UPSA, IPS Road, Okponglo, La Bawaleshie). Live: https://rudolphdeladem.github.io/legonrush-world/ (game at
/play/, geography inspector at /geo/).

Before doing anything:
1. Read CLAUDE.md, then docs/migration/NEW_ACCOUNT_START_HERE.md and docs/migration/PROJECT_MASTER_HANDOVER.md,
   then docs/handover/HANDOVER.md and docs/handover/TASKS.md (199 completed batches), then this file's "Latest update" section and the latest sections of
   docs/LEGON_BUILDINGS.md (from "Rendering: flicker and frame cost" to the end: the UPSA junction, the 30-pair
   brief, IPS Road, the Agriculture side, Commonwealth and the Great Hall, UPSA, La Bawaleshie, Limbo, the Fire
   Station, IPS Road opposite UPSA, UPSA landmarks, Bani/PRESEC, Okponglo, the in-ride map and fly-over camera).
2. Read docs/migration/PRODUCT_REQUIREMENTS_AND_DECISIONS.md, OPEN_ISSUES_AND_NEXT_ACTIONS.md,
   CONVERSATION_CONTEXT_AND_DECISION_LOG.md and GIT_AND_DEPLOYMENT_RUNBOOK.md.
3. Read docs/handover/conversation-log-3.md (my latest messages and your replies, 2026-10-13 → 10-15, batches
   124–164; the folded "Automatic context summary" blocks are the best short record), then skim
   conversation-log-2.md (10-09 → 10-13), to learn how I write briefs and what I corrected. Each recent brief has its
   own folder under docs/ with a ledger or evidence audit and a before/after sheet (latest: docs/okponglo/gate/,
   docs/diamond-jubilee/, docs/ugbs-new/, docs/jj-rawlings/, docs/ugmc/, docs/noguchi-wagmc/, docs/evandy/,
   docs/bani/, docs/jtny/, docs/campus-corrections/, docs/upsa-campus/, docs/engineering-ses/).
4. Copy the preview tools: mkdir -p .preview && cp tools/preview/* .preview/
5. Run the baseline checks without changing anything: npx tsc --noEmit -p . ; npm run test:routes ; npm run build ;
   npm run smoke. Report the results.
6. Tell me in a few lines what you understood: the project, how I work (batches of marked photos and PDF/Word
   briefs with game/real pairs and aerials, colour keys, full batch → render → test → commit → push to the branch
   and main → confirm CI and Pages), and what is open.

Rules:
- Geography is authoritative; my photos, briefs and marked aerials decide the buildings. No invented clutter, no
  guessed names or text; say what is estimated.
- The bike must never pass through walls, buildings or cars, and never be blocked by things that are not there.
- Controllers: computer only, nothing controller-related drawn on screen.
- Keep your progress messages short and about the area you are working on now; do not recap earlier batches (it
  costs me tokens). When you need my confirmation, show me preview renders.
- Always push and deploy after testing: push the commit to the working branch and to main (no pull requests), then
  confirm the CI and Pages runs.
- No model names in commits or code. Never put keys, passwords or tokens in the repo.
- Do not touch the separate original repository RudolphDeladem/legonrush. Never rewrite history or force-push main.
- Football/tennis games are developed separately and integrated later; 10,000+ concurrent players is a target
  that needs an architectural assessment, not a claim.

Then wait for my next batch.
```

## For Claude: orientation in 60 seconds

- State at handover (2026-10-15): `main` = this handover commit, on top of `2ad4a8d` ("Okponglo drive: herringbone
  pavement on the stadium side too…"). CI and Pages were `success` for `2ad4a8d`. The last working branch was
  `claude/wizardly-fermi-q6virk` (same commit as `main`). Use whatever branch your session assigns, and still push to
  `main` after the checks (`git push origin HEAD:main`), per the owner's workflow.
- The newest work (batches 124–164, one line each in `TASKS.md`):
  - Commonwealth west tennis complex; the land behind the Great Hall; loading without freezes.
  - UPSA campus (layout, facades, ground, planting, PCU brief); the School of Engineering Sciences; the main gate
    bridges.
  - UGMC, Noguchi and WAGMC (two briefs, a 147-page audit, tower and entrance follow-ups).
  - Evandy Hostel (43-page and eight-pair briefs, many marked follow-ups); Bani Hostel; James Topp Nelson Yankah Hall
    and its boundary.
  - Campus corrections (20 pictures, JQB/PRESEC); the J.J. Rawlings Avenue corridor.
  - The Okponglo entrance: the gatehouse with an LED screen looping a game fly-over, the taxi lot, the signals, and the
    drive's herringbone footways on both sides.
  - The new UGBS graduate building; the Diamond Jubilee Hall behind Jean Nelson Aka Hall.
- The last thing the owner asked for (batch 164) is done and deployed: the same herringbone pavement on both sides of
  Jubilee Drive from the gate to the Okponglo junction, and no red soil on the asphalt. Nothing is half-finished.
- Code for each area: one site file plus a `*plan.ts` with its numbers (e.g. `okponglo.ts`/`okplan.ts`,
  `greathall.ts`/`greathallplan.ts`, `banipresec.ts`/`bpiplan.ts`, `upsalandmarks.ts`/`upsalandmarksplan.ts`), the
  cameras in a `*views.ts` (`okviews.ts`, `pairviews.ts`, `ipsviews.ts`…), all listed in `sites.ts`.
- Per-brief evidence and open questions: `docs/<area>/evidence-audit.md` (bani-presec-ips, great-hall, okponglo,
  upsa-hostel-to-school, upsa-landmarks) or `README.md` (commonwealth-correction), with before/after sheets.
- The owner's pictures: `docs/handover/images/N.*`, found by row in `IMAGE_INVENTORY.md`. The owner's briefs:
  `docs/handover/uploads/`. Unpack a zip or docx into the scratchpad (never into the repo) to read it.
- Comparison cameras: `tools/preview/halls.html?view=<name>`; `multishot.mjs <outdir> view…` renders many in one page
  load against vite on port 5299. Do not edit files during a render run (HMR reloads the page). Headless rendering is
  slow: give screenshots minutes, not seconds.
- Read the owner's colour key in each message before modelling. Answer "has it been deployed?" with the CI and Pages
  run results. Long tasks: the owner often sends the next brief while you work; queue it and do it next.
- Use the labels VERIFIED / DECISION / PROPOSAL / INCOMPLETE / ASSUMPTION when reporting.
- Preview and check tools (copy `tools/preview/*` to `.preview/`; start vite first:
  `(setsid nohup npx vite --port 5299 --strictPort > /tmp/vite.log 2>&1 &)`):
  - `qshoot.mjs <outdir> '[{"name":"x","cam":"cam=x,h,z,tx,th,tz,fov","ids":[]}]'`: renders camera views (heights
    above the ground).
  - `rdlist.mjs x0,x1,z0,z1`: the game roads in a box (index, class, points).
  - `bid.mjs x,z` / `aid.mjs x,z`: the building or area under a point.
  - `probe.mjs cx,cz '[[x,z],…]'`: which meshes lie under points (for "what draws this?").
  - `roadblk.mjs x0,x1,z0,z1`: anything standing on a road.
  - `stuckraw.mjs x0,x1,z0,z1`: anything blocking within 3 m of a road; compare with the code before your change
    (`git stash`) to tell your blockers from older ones.
  - `nanall.mjs`: NaN geometry; copy it and edit its camera and name regex for an area.
  - `lens.mjs`: route lengths; must equal the previous run.
  - `flyover.mjs`: the gate screen's video.
- Checks before every push: `npx tsc --noEmit -p .`, `npm run -s test:routes`, the lens comparison, the NaN check,
  the road-blocking and stuck scans of the area, `npm run -s build`, `timeout 900 npm run -s smoke`. Then push to the
  branch and `main`, and poll the GitHub Actions runs for the commit until "CI" and "Deploy to GitHub Pages" succeed.
- Per batch: bump CLAUDE.md "(N so far)", append the batch to `docs/handover/TASKS.md`, and write the ledger and
  sheet in the brief's `docs/<area>/` folder.
- Ground layers (`coverOverlay`, scrubkit.ts) must not have cells over a road. The colour can be cut back, but the
  blurred far-off texture still leaks: keep the `cellIn` cells off the asphalt (the owner's batch 164 complaint).
- Do not edit `src` while a render runs: vite HMR reloads the page and kills it. Never use a bare `rm $VAR/*`.
