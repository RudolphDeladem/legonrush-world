# LEGONRUSH — Git and deployment runbook

Labels: [VERIFIED] · [DECISION] · [PROPOSAL] · [INCOMPLETE] · [ASSUMPTION].

## 1. Remotes and branches [VERIFIED 2026-10-11 via GitHub API]

| Ref | SHA | Meaning |
|---|---|---|
| `main` | `303aff7` | Production; every push runs CI and the Pages deploy |
| `claude/legonrush-buildings-rebuild-jq9rwh` | `303aff7` | Account 2's working branch (identical to `main`) |
| `claude/nifty-gauss-z13ch8` | `6114216` | Account 1's working branch; ancestor of `main` (kept for history) |
| `gh-pages` | `6a835e7` | Legacy; Pages now deploys from Actions, not this branch |

Remote: `origin https://github.com/RudolphDeladem/legonrush-world.git`. The original repo
`RudolphDeladem/legonrush` is separate and **must not** be pushed to or replaced [DECISION].

## 2. Workflows [VERIFIED `.github/workflows/`]

- `ci.yml` (push to `main`, PRs): `npm ci` → `npm run build` → browser (runner Chrome, else Playwright with a 10-minute
  limit) → `npm run smoke` → `npm run geo` + `git diff --exit-code` on the generated geography → `npm run test:routes`.
- `deploy-pages.yml` (push to `main`, manual dispatch): `npm run build` with `BASE_PATH=/legonrush-world/`, upload
  `dist`, `actions/deploy-pages`. Requires Settings → Pages → Source: "GitHub Actions".
- Latest runs for `303aff7`: CI #95 success, Deploy #94 success [VERIFIED].
- `netlify.toml` still exists; README still says Netlify — **stale** [VERIFIED]; GitHub Pages is the live host.

## 3. Checks before every push [DECISION]

```bash
npx tsc --noEmit -p .
npm run geo                 # only when data/geography/registry/* changed; commit the regenerated files
npm run test:routes
npm run build
npm run smoke               # needs a Chromium; also checks CSS brace balance
mkdir -p .preview && cp tools/preview/* .preview/   # once per clone (.preview is git-excluded)
node .preview/lens.mjs      # route lengths must not change (starts its own Vite in-process)
node .preview/camcheck.mjs  # afterInside: 0 (same)
# renders: npx vite --port 5299 --strictPort, then node .preview/shoot.mjs <outdir> view=NAME
```
Controller changes: `node scripts/gamepad-test.mjs` and `node scripts/gamepad-card-test.mjs` (dev server on 5299).

## 4. Publish a development batch (the usual flow) [DECISION]

```bash
git add -A && git commit -m "<what changed, in the owner's words>"
git fetch -q origin main && git merge-base --is-ancestor origin/main HEAD \
  && git push -u origin <working-branch> && git push origin HEAD:main
```
Then confirm the "CI" and "Deploy to GitHub Pages" runs for that SHA succeed. No pull requests. No model names in
commits or code. Commit messages end with the session's attribution lines.

## 5. Publish THIS migration package (awaiting owner approval — not done)

Only `docs/migration/` is new. Proposed commands, to run **only after the owner approves**:
```bash
git status --short                      # expect only ?? docs/migration/
git add docs/migration
git commit -m "Migration handover package for the next Claude account"
git push -u origin claude/legonrush-buildings-rebuild-jq9rwh
git push origin HEAD:main               # optional: also publish on main (triggers CI + Pages; docs only)
```
The docs contain no secrets and no full chat history (checked; see the final report).

## 6. Rollback

- Pages: re-run "Deploy to GitHub Pages" on an earlier commit (Actions → workflow → Run workflow on a ref), or
  `git revert <sha>` and push to `main`. Never force-push `main` [DECISION/safety].

## 7. Owner's Windows machine (manual; Claude cannot reach it)

Local copy `C:\Users\raudd\legonrush-world` [ASSUMPTION: path from the owner]. Bring it up to date without losing
local work:
```powershell
cd C:\Users\raudd\legonrush-world
git status                      # if anything is modified, commit or stash it first: git stash push -u -m "local"
git fetch origin
git switch main
git merge --ff-only origin/main # refuses if local main diverged: then ask before doing anything else
npm ci
npm run dev                     # http://localhost:5173
```
Full mirror backup (all branches and history) — see `ATTACHMENT_RECOVERY_CHECKLIST.md` §4.

## 8. Notes for a cloud session

- The container clones shallow; use `git fetch --unshallow` if full history is needed.
- `.preview/` is excluded through `.git/info/exclude` (not `.gitignore`); recreate it from `tools/preview/`.
- The container proxy blocks `*.github.io`; verify deployments through the Actions API instead.
