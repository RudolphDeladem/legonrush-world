# LEGONRUSH — start here (new Claude account)

## For the owner: 5 steps

1. Finish the backups in `ATTACHMENT_RECOVERY_CHECKLIST.md`, while the old account still works.
2. On the new account, open Claude Code on the web (https://claude.ai/code) and connect GitHub. The Claude GitHub app
   needs access to `RudolphDeladem/legonrush-world`.
3. Start a session on `RudolphDeladem/legonrush-world`.
4. Paste the prompt below as the first message.
5. Send your next batch of marked pictures or a PDF brief, as before.

You do **not** need to re-upload the old images. They are in the repo (`docs/handover/images/`, indexed by
`IMAGE_INVENTORY.md`). Re-upload a private PDF only if the new account needs to read it again.

## Ready-to-paste first prompt

```
I'm continuing my LEGONRUSH project from another Claude account. You have no memory of the earlier work; everything
you need is in this repository: https://github.com/RudolphDeladem/legonrush-world

LEGONRUSH — "The Campus Lifestyle Reimagined. Ride. Race. Connect." — is a browser 3D cycling game (Vite +
TypeScript + Three.js PWA, Supabase backend) set on the real University of Ghana, Legon campus. Live:
https://rudolphdeladem.github.io/legonrush-world/ (game at /play/, geography inspector at /geo/).

Before doing anything:
1. Read CLAUDE.md, then docs/migration/NEW_ACCOUNT_START_HERE.md and docs/migration/PROJECT_MASTER_HANDOVER.md,
   then docs/handover/HANDOVER.md, docs/handover/TASKS.md (96 completed batches) and the latest sections of
   docs/LEGON_BUILDINGS.md (73, 74, Explore, Game controllers).
2. Read docs/migration/PRODUCT_REQUIREMENTS_AND_DECISIONS.md, OPEN_ISSUES_AND_NEXT_ACTIONS.md and
   GIT_AND_DEPLOYMENT_RUNBOOK.md.
3. Copy the preview tools: mkdir -p .preview && cp tools/preview/* .preview/
4. Run the baseline checks without changing anything: npx tsc --noEmit -p . ; npm run test:routes ; npm run build ;
   npm run smoke ; node .preview/lens.mjs ; node .preview/camcheck.mjs. Report the results.
5. Tell me in a few lines what you understood: the project, how I work (batches of marked photos and PDF briefs,
   colour keys, full batch → render → test → commit → push to the branch and main → confirm CI and Pages), and
   what is open.

Rules:
- Geography is authoritative; my photos and marked aerials decide the buildings. No invented clutter.
- The bike must never pass through walls, buildings or cars, and never be blocked by things that are not there.
- Controllers: computer only, nothing controller-related drawn on screen.
- No pull requests: push the same commit to the working branch and to main, then confirm CI and the Pages deploy.
- No model names in commits or code. Never put keys, passwords or tokens in the repo.
- Do not touch the separate original repository RudolphDeladem/legonrush.
- Football/tennis games are developed separately and integrated later; 10,000+ concurrent players is a target
  that needs an architectural assessment, not a claim.

Then wait for my next batch.
```

## For Claude: orientation in 60 seconds

- State at handover: `main` = `303aff7`, CI and Pages green (2026-10-11). Account 2's branch is
  `claude/legonrush-buildings-rebuild-jq9rwh`. Use whatever branch your session assigns, and still push to `main`
  after the checks, per the owner's workflow.
- The newest work: main entrance brief (`entrance.ts`, `gateprecinct.ts`, `ias.ts`, `jqb.ts`, `southref.ts`,
  `enkit.ts`), general fixes (`meshcollide.ts`, log depth, `clearCamera`, woodland trees, rumble, bike speed), game
  controllers (`gamepad.ts`, `padmenu.ts`).
- The owner's photos are in `docs/handover/images/N.*`. Find a picture by its row in `IMAGE_INVENTORY.md`.
- Comparison cameras: `tools/preview/halls.html?view=<name>` (for example `en1`…`en37`); `shoot.mjs` renders them.
- Read the owner's colour key in each message before modelling. Answer "has it been deployed?" with the CI and Pages
  run results.
- Use the labels VERIFIED / DECISION / PROPOSAL / INCOMPLETE / ASSUMPTION when reporting.
