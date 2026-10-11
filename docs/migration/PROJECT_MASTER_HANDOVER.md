# LEGONRUSH — project master handover

Prepared 2026-10-11 at the end of the second Claude account's work (session `session_0114N9DgARn7EcRLZFQhCEdw`,
2026-10-09 → 2026-10-11). It supersedes nothing: the first account's handover in `docs/handover/` stays valid and is
referenced throughout. Read `NEW_ACCOUNT_START_HERE.md` first if you are a new Claude account.

Labels used in every migration document:

| Label | Meaning |
|---|---|
| **[VERIFIED]** | Checked in this audit (command output, file listing, GitHub API) on 2026-10-11. |
| **[DECISION]** | An owner decision recorded in the conversation or in `docs/LEGON_BUILDINGS.md`. |
| **[PROPOSAL]** | Suggested by Claude, not approved by the owner. |
| **[INCOMPLETE]** | Started or partly done; named gaps. |
| **[ASSUMPTION]** | Believed true but not checked; says how to check it. |

## 1. Identity

- **Name**: LEGONRUSH. Tagline **"The Campus Lifestyle Reimagined."**, kicker **"Ride. Race. Connect."** [VERIFIED:
  `index.html`, `src/main.ts`, `vite.config.ts` manifest].
- **What it is**: a browser 3D cycling game and social app set on the real University of Ghana, Legon campus, an
  installable PWA. Riders follow real routes between real destinations (Explore), ride freely, race, take part in
  events and challenges, and use community features.
- **Owner**: Rudolph Deladem (GitHub `RudolphDeladem`). The owner directs all work by sending batches of marked photos
  and PDF briefs.
- **Primary repository**: https://github.com/RudolphDeladem/legonrush-world (public) [VERIFIED].
- **Original repository**: https://github.com/RudolphDeladem/legonrush — older, **not synchronised**, must not be
  replaced or force-pushed [DECISION]. This audit could not open it (HTTP 403 through the container proxy; it is
  outside this session's GitHub scope) [VERIFIED limitation].
- **Live site**: https://rudolphdeladem.github.io/legonrush-world/ · **game** `/play/` · **geography inspector** `/geo/`.
  Deployed by the "Deploy to GitHub Pages" workflow; the last run for `303aff7` succeeded [VERIFIED via GitHub
  Actions API]. The container proxy blocks `github.io`, so the pages themselves were not fetched in this audit
  [VERIFIED limitation]. Check them by opening the links in a browser.
- **Owner's local copy**: `C:\Users\raudd\legonrush-world` (Windows) [ASSUMPTION: path given by the owner, not reachable
  from the cloud container].

## 2. State at handover [VERIFIED 2026-10-11]

| Item | Value |
|---|---|
| Branch worked on | `claude/legonrush-buildings-rebuild-jq9rwh` |
| HEAD | `303aff7579587a4531a3bf96a01657bdb782c836` "Main entrance brief: comparison cameras moved…" |
| `origin/main` | same sha `303aff7` |
| `origin/claude/legonrush-buildings-rebuild-jq9rwh` | same sha `303aff7` |
| `origin/claude/nifty-gauss-z13ch8` | `6114216` (account 1's branch; an ancestor of `main`) |
| `origin/gh-pages` | `6a835e7` (legacy; Pages now deploys through Actions, not this branch) |
| Working tree before this package | clean |
| CI (`ci.yml`) and Pages deploy for `303aff7` | both `success` (runs 38136761026, 38136760954) |
| Clone in the container | shallow (`git rev-parse --is-shallow-repository` = true) |

Nothing from the development work is uncommitted. The only uncommitted files are this `docs/migration/` folder.

## 3. History in one page

| Period | Account | Work |
|---|---|---|
| 2026-10-06 → 10-09 | Account 1 (session on branch `claude/nifty-gauss-z13ch8`) | Authoritative campus geography pipeline, destination access and routing, then building-by-building reconstruction, batches 1–63 (`docs/handover/TASKS.md`). Handover written in `docs/handover/` (commit `ef2123c`, final `6114216`). |
| 2026-10-09 → 10-11 | Account 2 (this session, branch `claude/legonrush-buildings-rebuild-jq9rwh`) | Batches 64–96: passages, galleries, French Dept, churches, N Block, three reference PDFs (38/54/67 pages), Pent corrections, NSIA Road, Volta, Kuffour Quadrangle, science campus, Balme/Pent, NSIA hillside, game controllers, Map tab freeze, general fixes (collision with walls/cars, flicker, woodland trees, rumble, bike speed, camera), main entrance brief (37 pairs). Images 221–754. |
| 2026-10-11 | Account 2 | This migration package. |

Detailed per-batch records: `docs/LEGON_BUILDINGS.md` sections 1–74 plus the Explore and Game controllers sections.

## 4. Architecture summary

- **Stack** [VERIFIED `package.json`]: Vite 8, TypeScript 5.9, Three.js 0.186, vite-plugin-pwa 2, Supabase JS 2,
  Playwright 1.56 (dev; smoke tests and renders). Node 22 in CI.
- **Pages** (`vite.config.ts` inputs): `index.html` landing, `play/index.html` game, `geo/index.html` inspector.
  `BASE_PATH=/legonrush-world/` on Pages; `/` locally.
- **Game frame**: x = metres east, z = metres south of lat 5.6518, lng −0.1871
  (`x = (lng + 0.1871) · 110778.848`, `z = (5.6518 − lat) · 110574`). `src/data/legon-map.json` stores ×10.
- **Geography pipeline**: `npm run geo` → `scripts/geography/build-master.mjs` → `build-access.mjs` →
  `master-to-game.mjs`; inputs in `data/geography/registry/` (see `GEOGRAPHY_AND_CAMPUS_FIDELITY.md`).
- **3D world**: `src/game/` (89 files). `world.ts` builds the campus; `sites.ts` lists modelled building sites
  (BLOCK_SITES); `blocks.ts` is the block engine; `relief.ts` holds ground ZONES and STAIRS; `solids.ts` and
  `meshcollide.ts` stop the free-ridden bike; `Game.ts` is the loop, physics and camera; `life.ts`, `gardens.ts` trees.
- **App**: `src/main.ts` screens; `src/tabs/` (map, events, challenges, community, garage); `src/features/`
  (challenges, community, events, garage, map, life, money, shop, missions, achievements, treasure, vibe…).
- **Backend**: Supabase (`supabase/schema.sql`, `supabase/sql/00–40`, Edge Functions `cashout`, `challenge-submit`,
  `close-week`, `paystack-init`, `paystack-webhook`, `submit-run`). Money features stay "Coming soon" while
  `PAYSTACK_PUBLIC_KEY` is empty [VERIFIED].
- **Controllers**: `src/gamepad.ts`, `src/padmenu.ts` (see `docs/LEGON_BUILDINGS.md` → Game controllers).

## 5. How the owner works [DECISION]

1. The owner sends a batch: numbered photos/screenshots/aerials with coloured markings, or a PDF "reconstruction brief"
   of game/photo pairs plus maps with arrows.
2. Claude inspects before editing, models it, renders comparison views, runs every check, commits, pushes to the
   working branch and to `main`, waits for CI and Pages, and reports with renders.
3. No invented clutter; the bike must never be swallowed by the ground or blocked by things that are not there; it
   must be blocked by walls, buildings, cars and tree trunks; trees must look like trees; roads flat unless marked.
4. No pull requests; push the same commit to `main`. No model names in commits or code.

**Exception for this package**: the owner ordered *no commit and no push without approval* [DECISION 2026-10-11].

## 6. The migration package (this folder)

| File | Purpose |
|---|---|
| `NEW_ACCOUNT_START_HERE.md` | Entry point and the ready-to-paste first prompt for the next account. |
| `PROJECT_MASTER_HANDOVER.md` | This file. |
| `PRODUCT_REQUIREMENTS_AND_DECISIONS.md` | Product vision, requirements, owner decisions. |
| `GEOGRAPHY_AND_CAMPUS_FIDELITY.md` | Data sources, pipeline, fidelity rules, coordinate frame. |
| `VISUAL_DESIGN_AND_ASSET_SPECIFICATION.md` | Brand, UI, 3D modelling conventions, materials. |
| `FEATURE_AND_ROADMAP_STATUS.md` | What exists, what is partial, what is planned (football/tennis, 10,000+ players). |
| `GIT_AND_DEPLOYMENT_RUNBOOK.md` | Branches, checks, push/deploy, rollback, Windows commands. |
| `OPEN_ISSUES_AND_NEXT_ACTIONS.md` | Known issues, unverified items, next steps. |
| `CONVERSATION_CONTEXT_AND_DECISION_LOG.md` | Account 2's conversation summarised with decisions (no full chat). |
| `ASSET_INVENTORY.md` | Every asset family with location, size, public/private status. |
| `ATTACHMENT_RECOVERY_CHECKLIST.md` | Exporting chats, saving uploads, the `D:\LEGONRUSH-MIGRATION\` backup. |

Private material (owner PDFs, the account-2 text log) is **not** in the repository; it was delivered to the owner as a
separate private three-part zip (see `ASSET_INVENTORY.md` §6 and `ATTACHMENT_RECOVERY_CHECKLIST.md`).
