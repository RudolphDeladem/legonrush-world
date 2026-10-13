# LEGONRUSH — start here (new Claude account)

Updated 2026-10-13, when the first account (back from 2026-10-11 to 10-13) ran out of credits again. The history so
far: account 1 (10-06 → 10-09, batches 1–63), account 2 (10-09 → 10-11, batches 64–96), account 1 again
(10-11 → 10-13, batches 97–121). Everything is in this repository.

## For the owner: 5 steps

1. On the new account, open Claude Code on the web (https://claude.ai/code) and connect GitHub. The Claude GitHub app
   needs access to `RudolphDeladem/legonrush-world`.
2. Start a session on `RudolphDeladem/legonrush-world` (branch `main`).
3. Paste the prompt below as the first message.
4. Wait for its reply (it reports the checks and what it understood).
5. Send your next batch of marked pictures or a PDF/Word brief, as before.

You do **not** need to re-upload anything from before. The pictures you pasted are in `docs/handover/images/`
(1–775, indexed by `docs/handover/IMAGE_INVENTORY.md`); every PDF, Word brief, zip pack and prompt file you attached
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
   then docs/handover/HANDOVER.md and docs/handover/TASKS.md (121 completed batches), then the latest sections of
   docs/LEGON_BUILDINGS.md (from "Rendering: flicker and frame cost" to the end: the UPSA junction, the 30-pair
   brief, IPS Road, the Agriculture side, Commonwealth and the Great Hall, UPSA, La Bawaleshie, Limbo, the Fire
   Station, IPS Road opposite UPSA, UPSA landmarks, Bani/PRESEC, Okponglo, the in-ride map and fly-over camera).
2. Read docs/migration/PRODUCT_REQUIREMENTS_AND_DECISIONS.md, OPEN_ISSUES_AND_NEXT_ACTIONS.md,
   CONVERSATION_CONTEXT_AND_DECISION_LOG.md and GIT_AND_DEPLOYMENT_RUNBOOK.md.
3. Skim docs/handover/conversation-log-2.md (my latest messages and your replies, 2026-10-09 → 10-13) to learn how
   I write briefs and what I corrected. Each recent brief has its own folder under docs/ with an evidence audit.
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
- Always push and deploy after testing: push the commit to the working branch and to main (no pull requests), then
  confirm the CI and Pages runs.
- No model names in commits or code. Never put keys, passwords or tokens in the repo.
- Do not touch the separate original repository RudolphDeladem/legonrush. Never rewrite history or force-push main.
- Football/tennis games are developed separately and integrated later; 10,000+ concurrent players is a target
  that needs an architectural assessment, not a claim.

Then wait for my next batch.
```

## For Claude: orientation in 60 seconds

- State at handover: `main` = `7e114a0` ("View map in the pause menu and a fly-over camera view"), CI run
  38383733854 and Pages run 38383733849 both `success` (2026-10-13 10:29 UTC), plus this handover commit on top.
  The last working branch was `claude/nifty-gauss-z13ch8` (same commit as `main`). Use whatever branch your session
  assigns, and still push to `main` after the checks (`git push origin HEAD:main`), per the owner's workflow.
- The newest work (batches 97–121): flicker and lag fixes, the bars-across-roads regression, the UPSA junction
  (UGBS/GOIL), the N4 cutting at the main gate, IPS Road to the UPSA Hostel and on into UPSA (a provenance-tagged map
  extension), the Agriculture side, Commonwealth Hall and the Great Hall, La Bawaleshie and Okponglo, Limbo, the Fire
  Station, Bani/PRESEC, destination/FINISH banners, the pause menu's "View map" and the fly-over camera.
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
