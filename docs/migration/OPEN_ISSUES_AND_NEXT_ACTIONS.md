# LEGONRUSH — open issues and next actions

Labels: [VERIFIED] · [DECISION] · [PROPOSAL] · [INCOMPLETE] · [ASSUMPTION].

## 0. Update 2026-10-13 (account 1's return, batches 97–121)

Settled since 2026-10-11: D1 (the migration docs were committed and pushed on the owner's approval, `8f9eaec`); D3
(README rewritten, `f579429`); D2 for the first account's material (the owner asked again for the chat history and
everything to be pushed; done in this handover). D4 and D5 stay open.

Not yet confirmed by the owner in play [INCOMPLETE]:
- **View map** in the pause menu and the **fly-over** camera (`7e114a0`): tested in a headless browser with a
  simulated ride and keyboard; not tried with a physical controller.
- **Okponglo** (`b2ca9b5`), the **Great Hall** (`8308d4b`) and **Commonwealth** corrections (`3228d30`): deployed, CI
  green, no feedback yet.

Unresolved by evidence (each listed in its own audit; no guess until the owner supplies more):
- Fire Station brief: the near-left gabled building with AC units in Pair 12, and the communications mast in Pair 14
  (owner: "leave both unresolved until verified"; `docs/LEGON_BUILDINGS.md` → Fire Station section).
- Nophil Heights has no mapped outline anywhere; its footprint is an estimate (`docs/LEGON_BUILDINGS.md` → IPS Road
  opposite UPSA).
- Bani/PRESEC: the unroofed frame east of the avenue (no outline in any source), the four Bani Hostel blocks not in any
  pair, the named Bani facilities, levels (`docs/bani-presec-ips/evidence-audit.md`).
- Commonwealth: storeys of the dining hall, wings and chapel; the links' sizes; no doors on links
  (`docs/commonwealth-correction/README.md`).
- Great Hall: every height read from photographs; clock faces on two sides only; the dark rounded object; the
  "...QUADRANGLE" sign (`docs/great-hall/evidence-audit.md`).
- Okponglo: every height and setback, the mast's spot, plot corners; the plaza's other signs not copied
  (`docs/okponglo/evidence-audit.md`).
- UPSA landmarks and the UPSA corridor: see `docs/upsa-landmarks/` and `docs/upsa-hostel-to-school/` evidence audits.

Known technical points from this period [VERIFIED]:
- `npm run smoke` times out inside the cloud container for environmental reasons (headless software rendering); it
  passes in CI. Use CI's result.
- Headless renders are slow (minutes per view); editing a file during a `multishot.mjs` run reloads the page and
  breaks the run.
- Specs marked `onGround` are not lifted by relief: their parts must use `groundHeight` directly.
- The modelkit `merge()` drops uvs; textured pieces use `mergeGeometries` (see `okponglo.ts` Pics).
- Never `pkill -f` with a pattern that appears in the same command line (it kills its own shell).

Next: the owner's next brief. Candidate areas not yet given a brief: the four Bani Hostel blocks, the rest of the
UPSA campus beyond the landmarks, the neighbourhoods off La Bawaleshie Road.

## 0b. Update 2026-10-13 (batches 124, 125)

Two briefs done in one batch each: the Commonwealth west tennis complex (`docs/tennis-west/evidence-audit.md`) and the
land behind the Great Hall (`docs/great-hall-landscape/evidence-audit.md`). Open for the owner: the tennis complex's way
in (no gate, stair or ramp is shown: the fence closes it), the east red strip's use, the mast, the name; the pale
clearing's function, an aerial south of z +487, the unmapped worn paths. New tool: `scripts/landcover/cover.py` reads an
aerial into a ground-cover grid (`src/game/landcover.ts`) for `scrubkit.ts` (painted ground, instanced crowns and tufts).

## 0c. Update 2026-10-13 (batch 126)

Loading rebuilt (background build, compacted geometry, freed CPU copies, phone textures): see the last section of
`docs/LEGON_BUILDINGS.md`. Open: confirm on a real phone and laptop; the pit by the pavement (Picture 7) was not located,
a wider screenshot is needed.

## 0d. Update 2026-10-13 (batches 127, 128, UPSA campus; published on the owner's word)

The UPSA campus's second layer (`docs/upsa-campus/evidence-ledger.md`). Published to `main` on the owner's word. Open for the owner: the towers' footprint (the aerial shows
two larger blocks west of the confirmed outline); Ewuntoma Medical Centre and the CIMG building's positions; the names of
the six-storey block and the four-storey group; the stand's roof. Batch 128 added the bush west of the wall and the campus's shade trees from the aerial . Next: paved
walks and drains along the Astro Turf and between the blocks (the owner's photos).

## 1. Awaiting the owner (decisions, as of 2026-10-11)

| # | Question | Why it matters |
|---|---|---|
| D1 | Approve committing and pushing `docs/migration/` (to the working branch, and optionally `main`)? | The owner ordered no commit/push without approval. |
| D2 | Keep `docs/handover/images/` (754 images, 112 MB) and `docs/handover/conversation-log.md` (account 1's full text chat) public? | Put there by the earlier owner decision; the new instruction says not to upload full chat histories or private image archives. Some images carry third-party watermarks. Removing them from the current tree does **not** remove them from Git history; a full removal needs a history rewrite (a destructive, separate decision). |
| D3 | Update the stale README (Netlify, "coming soon") and decide on `netlify.toml`? | Misleads new contributors; docs-only. |
| D4 | Football/tennis: where will the separate games live (own repo?) and what contract will they meet? | Needed before integration (see `FEATURE_AND_ROADMAP_STATUS.md` §4). |
| D5 | Commission the 10,000+ concurrent-player assessment? | Target only; no capability demonstrated (§5 there). |

## 2. Not verified (needs the owner or hardware)

- [INCOMPLETE] **Physical controllers**: only simulated tests ran. Owner to try a PS5/Xbox pad in Chrome/Edge on a
  computer; `?paddebug` shows what the browser reports. Rumble untested on hardware.
- [INCOMPLETE] **Latest general fixes** (walls/cars collision, flicker, camera, woodland trees, speed) — deployed, CI
  green; the owner has not yet confirmed them in play.
- [INCOMPLETE] **Main entrance brief** — deployed; open measurements (section 74 end of `docs/LEGON_BUILDINGS.md`):
  gatehouse depth and carriageway line, IAS terrace heights, JQB floor heights, pavilion sign wording, drama studio
  stage orientation, whether both black signs read "University of Ghana".
- [ASSUMPTION] Live pages load (`/`, `/play/`, `/geo/`): deploy succeeded, but the container cannot fetch `github.io`.
  Owner: open the three links once.
- [ASSUMPTION] Supabase database and Edge Functions match `supabase/` in the repo — not checkable from here.
- [ASSUMPTION] The original repo `RudolphDeladem/legonrush` is intact — could not be read (out of session scope).

## 3. Known technical issues (from the docs) [VERIFIED as recorded]

- Fixed 2026-10-12: the relief ground (~610k triangles) was one mesh drawn every frame and the 400 m life cells went
  whole into the shadow map; now 80 m ground tiles and 100 m life cells (see `docs/LEGON_BUILDINGS.md` → Rendering:
  flicker and frame cost). Remaining heavier items: the campus-wide instanced tree meshes still cast shadows as a whole.
- `balmewest.ts` French spec has a stale `keep` box (harmless).
- Aerial registrations ±1–2 m.
- Wall/screen pieces block via `SOLIDS` circles and now also via `meshcollide.ts`; foliage is excluded by colour
  (green-dominant) — an unusual green wall would not block [ASSUMPTION from the design of `meshcollide.ts`].
- Route tests print 9 low-confidence destinations (enclosed courtyards) — known, not failures.
- Container clones are shallow; `.preview/` must be recreated from `tools/preview/`.

## 4. Next actions (in order)

1. Owner: answer D1–D3; open the live links; test a physical controller; ride the main entrance and the latest fixes.
2. Owner: make the backups in `ATTACHMENT_RECOVERY_CHECKLIST.md` (claude.ai export, private zip, Git mirror) to
   `D:\LEGONRUSH-MIGRATION\` **before** this account or container is gone.
3. New account: start from `NEW_ACCOUNT_START_HERE.md`; run the checks once on a clean clone to confirm the baseline.
4. Continue batch work from the owner's next marked photos/brief.
5. Later: football/tennis integration; scale assessment.
