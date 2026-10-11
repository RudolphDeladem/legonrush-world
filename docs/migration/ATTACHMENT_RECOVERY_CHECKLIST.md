# LEGONRUSH — attachment recovery and backup checklist

These are manual steps for the owner. Claude runs in a cloud container and cannot reach the owner's Windows PC, the
`D:\` drive or the claude.ai account settings. Do these steps **before** the old account or this session is closed.
Tick each box when it is done.

## 1. Export the conversations

### 1a. Official claude.ai data export (every chat on the account)
1. Sign in to the **old** account at https://claude.ai.
2. Open **Settings → Privacy** and choose **Export data**. The menu wording may differ slightly; look for "Export data".
3. Claude sends an email with a download link. The link expires, so download the `.zip` promptly.
4. Save it to `D:\LEGONRUSH-MIGRATION\01-Claude-Web-Export\`.
- [ ] Export requested  - [ ] Zip downloaded  - [ ] Zip opens (`conversations.json` inside)

The export covers claude.ai chats. Claude Code **cloud sessions** like this one may not be included in full. That is
why §1b and §2 exist.

### 1b. Claude Code `/export`
- In a Claude Code session (terminal, desktop or web), type `/export`. It saves or copies the current conversation as
  text. In a cloud session, save the text it gives into
  `D:\LEGONRUSH-MIGRATION\02-Claude-Code-Session-Records\`.
- Session link for this work (account 2): https://claude.ai/code/session_0114N9DgARn7EcRLZFQhCEdw
- [ ] `/export` text saved (optional; the private zip already holds a cleaned text log)

### 1c. Session records (transcripts)
- Claude Code keeps each session's transcript as a `.jsonl` file under `~/.claude/projects/<project>/`. For this
  session, that file is inside the cloud container (433 MB) and is deleted with the container.
- On a **local** Claude Code installation, the same folder is on your PC: `C:\Users\<you>\.claude\projects\`. Copy it
  to `02-Claude-Code-Session-Records\` if you ran Claude Code locally.
- [ ] Local `.claude\projects` copied (if any)

## 2. The private backup zip from this session
- Download the three files **`legonrush-private-backup-2026-10-11-part1.zip`**, **`-part2.zip`** and **`-part3.zip`**.
  Claude sent them as files in this conversation.
- Save them to `D:\LEGONRUSH-MIGRATION\03-Private-Attachments\` and unzip all three into the **same** folder.
- Verify the checksums. In PowerShell, inside the unzipped folder:
  ```powershell
  Get-Content SHA256SUMS.txt | ForEach-Object {
    $h,$f = $_ -split '\s+',2; $f = $f.TrimStart('*')
    if ((Get-FileHash -Algorithm SHA256 $f).Hash.ToLower() -ne $h) { "BAD  $f" } }
  ```
  No output means every file matches.
- [ ] All three parts downloaded  - [ ] Checksums OK (105 files)

The original files are also on your own devices: the 14 PDFs you uploaded, and the photos you pasted. If any
download fails, gather them from where you made them.

## 3. Recommended folder layout on `D:\`

```
D:\LEGONRUSH-MIGRATION\
  01-Claude-Web-Export\           claude.ai official export zip (old account)
  02-Claude-Code-Session-Records\ /export text, local .claude\projects copies
  03-Private-Attachments\         the three backup parts, unzipped together (PDFs, chat images, text log)
  04-Git-Repository-Mirror\       legonrush-world.git (mirror), legonrush.git (mirror of the original repo)
  05-Working-Copy-Snapshot\       copy of C:\Users\raudd\legonrush-world including uncommitted work
  06-Supabase-Backup\             database dump / dashboard backup (keep private; no keys in shared places)
  07-Verification-Reports\        checksums and git verification outputs from §6
```
Create it with:
```powershell
'01-Claude-Web-Export','02-Claude-Code-Session-Records','03-Private-Attachments','04-Git-Repository-Mirror',
'05-Working-Copy-Snapshot','06-Supabase-Backup','07-Verification-Reports' |
  ForEach-Object { New-Item -ItemType Directory -Force -Path "D:\LEGONRUSH-MIGRATION\$_" }
```

## 4. Mirror the Git repositories (all branches, tags, history)
```powershell
cd D:\LEGONRUSH-MIGRATION\04-Git-Repository-Mirror
git clone --mirror https://github.com/RudolphDeladem/legonrush-world.git
git clone --mirror https://github.com/RudolphDeladem/legonrush.git
git -C legonrush-world.git bundle create ..\legonrush-world.bundle --all
git -C legonrush.git bundle create ..\legonrush.bundle --all
```
A mirror is read-only backup storage. Never push from it. To restore, run `git clone legonrush-world.bundle`.
- [ ] Both mirrors made  - [ ] Bundles made

## 5. Snapshot the local working copy (keeps uncommitted work)
```powershell
cd C:\Users\raudd\legonrush-world
git status > D:\LEGONRUSH-MIGRATION\07-Verification-Reports\local-git-status.txt
robocopy C:\Users\raudd\legonrush-world D:\LEGONRUSH-MIGRATION\05-Working-Copy-Snapshot\legonrush-world /E /XD node_modules dist /R:1 /W:1 /LOG:D:\LEGONRUSH-MIGRATION\07-Verification-Reports\robocopy.log
```
This does not change the working copy. `node_modules` and `dist` are skipped because `npm ci` and `npm run build`
recreate them.
- [ ] Snapshot copied  - [ ] `robocopy.log` shows no failures

## 6. Verify
```powershell
cd D:\LEGONRUSH-MIGRATION
git -C 04-Git-Repository-Mirror\legonrush-world.git rev-parse main    # expect 303aff7579587a4531a3bf96a01657bdb782c836 or newer
git -C 04-Git-Repository-Mirror\legonrush-world.git branch -a > 07-Verification-Reports\branches.txt
Get-ChildItem -Recurse -File 03-Private-Attachments | Get-FileHash -Algorithm SHA256 |
  Export-Csv 07-Verification-Reports\private-attachments-sha256.csv -NoTypeInformation
```
- [ ] `main` SHA as expected  - [ ] Reports saved

## 7. Supabase (optional but recommended)
In the Supabase dashboard, open the project → **Database → Backups**, or use `pg_dump` with the connection string.
Save the result in `06-Supabase-Backup\`. **Never** put service-role keys, database passwords or Paystack secret keys
into the repo or these docs.

## 8. Keep a second copy
Copy `D:\LEGONRUSH-MIGRATION\` to a second place: an external drive, or a private cloud folder. Keep it private,
because it holds the chat log and the private PDFs.
