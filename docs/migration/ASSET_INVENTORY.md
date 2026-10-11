# LEGONRUSH — asset inventory

Every asset family, where it is, its size, whether it is public, and whether its preservation was verified.
Checked 2026-10-11 at `303aff7`. Labels: [VERIFIED] · [DECISION] · [PROPOSAL] · [INCOMPLETE] · [ASSUMPTION].

## 1. In the public repository (preserved by Git + GitHub) [VERIFIED]

| Asset | Path | Size / count |
|---|---|---|
| Source code (game, app, features) | `src/` (`src/game/` 89 files) | 4.7 MB |
| Static assets: brand, icons, photos, art, shots, geo imagery | `public/` (`brand/` 4, `icons/` 5, `photos/` 50, `art/` 20, `shots/` 16, `geo/`) | 6.3 MB |
| Geography data and sources | `data/` (`legon.osm` 4.6 MB, `geography/`) | 13 MB |
| Generated game map | `src/data/legon-map.json` | 508 KB |
| Supabase schema, SQL, Edge Functions | `supabase/` | 500 KB |
| Build/test/geography scripts | `scripts/` | 308 KB |
| Preview and registration tools | `tools/preview/` (13 files), `tools/scratch/` | 168 KB |
| Project documentation | `docs/*.md` (5 files) | — |
| Account 1 handover | `docs/handover/HANDOVER.md`, `NEW_SESSION_PROMPT.md`, `TASKS.md` | — |
| Account 1 text conversation log | `docs/handover/conversation-log.md` (64 owner messages) | 5,419 lines |
| Owner reference images, numbered 1–754 | `docs/handover/images/` | 754 files, 112 MB |
| Image index | `docs/handover/IMAGE_INVENTORY.md` (754 rows: file, size, message, date, excerpt) | — |
| Owner buildings reference archive | `docs/handover/uploads/UG_BUILDINGS__LAYOUTS_AND_THEIR_STRUCTURES.zip` | 14 MB |
| CI and deploy workflows | `.github/workflows/ci.yml`, `deploy-pages.yml` | — |
| Tracked files in total | `git ls-files` | 1,162 |

`docs/handover/images/` and `conversation-log.md` were published by the owner's earlier decision (account 1). Whether
they stay public is open question D2 in `OPEN_ISSUES_AND_NEXT_ACTIONS.md`.

## 2. Images 221–754 (account 2) [VERIFIED]

- 534 images from account 2 are in `docs/handover/images/` (rows 221–754 of `IMAGE_INVENTORY.md`). Most are pages
  and pictures extracted from the owner's PDFs, e.g. 670–754 from the main entrance brief.
- Pictures pasted straight into the chat: **78** were found in the session transcript. **38** are byte-identical to
  files in `docs/handover/images/`. The other **40** are not byte-identical; they may have been saved re-encoded, or
  not saved at all [ASSUMPTION: no per-image visual match was done]. **All 78 originals are in the private zip** (§6),
  so none depends on the repo copy.

## 3. Account 1's migration zips (uploaded to account 2) [VERIFIED]

Three zips: `legonrush-migration-1-docs-tools-uploads.zip` (14.5 MB), `-2-images-1-110.zip` (21.5 MB) and
`-3-images-111-220.zip` (20.7 MB). They were unpacked and every file was hashed:

- All images and uploads are byte-identical to files in the repo.
- 7 files differ: `HANDOVER.md`, `IMAGE_INVENTORY.md`, `TASKS.md`, `NEW_SESSION_PROMPT.md`, `tools/preview/halls.html`,
  `gh.mjs` and `shoot.mjs`. These are older versions of files that were later updated, and Git history keeps the older
  versions.

So the zips need no separate backup. They were not added to the private zip.

## 4. Generated outputs not kept in the repo

| Asset | Status |
|---|---|
| Comparison renders sent during the work (scratchpad PNGs) | Ephemeral container files. **Not preserved.** Regenerate them with `tools/preview/halls.html?view=…` and `shoot.mjs`. |
| Controls PDF (2026-10-10) | Delivered in the chat. **Not in the repo.** The table in `docs/LEGON_BUILDINGS.md` → Game controllers has the same content. |
| `dist/` build | Rebuilt by CI on every deploy. Gitignored. |
| Live deployment | GitHub Pages, from the "Deploy to GitHub Pages" run for `303aff7` (success) [VERIFIED via API]. |

## 5. Backend and external services (not in Git)

| Asset | Status |
|---|---|
| Supabase project (database rows, auth users, storage, deployed Edge Functions, secrets) | **Not backed up by this package.** No access from here. The owner should export it from the Supabase dashboard (database backup or `pg_dump`) and keep any service keys private. |
| Paystack account | Not configured in the code (the public key is empty). |
| GitHub repository settings (Pages source, Actions) | Live on GitHub. No export needed, but note Pages → Source = GitHub Actions. |

## 6. Private backup zip (delivered to the owner, NOT committed)

Built in the session scratchpad and sent to the owner as **three** files (the chat upload limit is 30 MiB):
`legonrush-private-backup-2026-10-11-part1.zip` (13.9 MB: log, chat images, docs), `-part2.zip` (28.0 MB: 3 PDFs),
`-part3.zip` (29.0 MB: 11 PDFs). Every part carries `README.txt` and the full `SHA256SUMS.txt`; unzip all three
into one folder.
Contents:

| Folder | Content |
|---|---|
| `owner-pdfs/` | The **14** owner PDF briefs uploaded to account 2 (≈56 MB) |
| `account2-chat-images/` | The 78 pictures pasted into account 2's chat, named `NNN_<UTC time>.<ext>` |
| `account2-conversation-log.md` | Account 2's text log: 49 owner messages and Claude's replies; tool calls and images left out |
| `docs-migration/` | A copy of this `docs/migration/` folder |
| `README.txt`, `SHA256SUMS.txt` | Explanation and checksums |

Its integrity was checked with `unzip -t` and `sha256sum -c` (see the final report). The owner must download it and
keep it, because the cloud container is deleted when the session ends.

## 7. Not preserved / not preservable from here

- The raw session transcript (`.jsonl`, 433 MB, with every tool call and embedded image). It is too large to deliver,
  and it holds internal tool output. The text log and the images carry the owner-facing content. To keep it anyway,
  see the claude.ai export in `ATTACHMENT_RECOVERY_CHECKLIST.md`.
- The owner's local copy `C:\Users\raudd\legonrush-world` and any `D:\` drive. Claude cannot reach them.
- The original repo `RudolphDeladem/legonrush`. It is outside this session's scope (HTTP 403), so it was not checked.
