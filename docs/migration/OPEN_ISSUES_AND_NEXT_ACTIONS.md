# LEGONRUSH — open issues and next actions

Labels: [VERIFIED] · [DECISION] · [PROPOSAL] · [INCOMPLETE] · [ASSUMPTION].

## 1. Awaiting the owner (decisions)

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

- Relief ground mesh ~432k triangles, never culled; shadows of 400 m life cells — performance on low-end phones.
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
