# Moving your Claude folders to Google Drive

This guide moves your **project folders**, **output folders**, and **skill
folders** off your computer's local disk and into Google Drive, while leaving a
link at each old location so Claude Code, Claude Cowork, and anything else
keeps working without reconfiguration.

Two scripts do the work:

| Your computer | Script |
|---------------|--------|
| Mac (or Linux) | [`tools/move-to-google-drive.sh`](tools/move-to-google-drive.sh) |
| Windows | [`tools/move-to-google-drive.ps1`](tools/move-to-google-drive.ps1) |

Both scripts are **dry-run by default**: they print what they would do and
change nothing until you add `--apply` (Mac) or `-Apply` (Windows).

## Before you start

1. **Install Google Drive for desktop** and sign in:
   <https://www.google.com/drive/download/>.
   After sign-in you get a synced folder:
   - Mac: `~/Library/CloudStorage/GoogleDrive-<your email>/My Drive`
   - Windows: `G:\My Drive` (the drive letter can differ)
2. **Pick "Mirror files"** for the folders you are about to move, or mark them
   *Available offline* afterwards. In the default "Stream files" mode the
   files live in the cloud and are pulled down on demand. That is fine for
   documents, but tools that scan a whole folder (Claude reading a skills
   directory, a project build, `git status`) get slow or fail when offline.
3. **Know where your folders are.** Typical locations:

   | What | Typical location |
   |------|------------------|
   | Claude Code / Cowork skills | `~/.claude/skills` (Mac) or `%USERPROFILE%\.claude\skills` (Windows) |
   | Project folders | wherever you keep them, e.g. `~/Projects` or `~/Documents/Projects` |
   | Cowork output folders | the folder you chose in Cowork settings, often under `~/Documents` |

   If you are unsure where Cowork writes outputs, open a recent output in
   Cowork and choose *Show in Finder* / *Show in Explorer*.

4. **Do not move all of `~/.claude`.** Only move `~/.claude/skills` (and
   `~/.claude/projects` if you want the memory files synced). The rest of that
   folder holds live session state and credentials that will corrupt if two
   machines or a sync conflict write to it at once.

5. **Git repositories are a special case.** Cloud sync and `.git` do not mix
   well: Drive can create "conflict copies" inside `.git` and break the repo.
   For a project that is a git repo, push it to GitHub and keep it local, or
   move it and accept that risk. Everything else (documents, outputs, skills)
   syncs cleanly.

## Mac

Open Terminal in this folder and run a dry run first:

```bash
chmod +x tools/move-to-google-drive.sh
./tools/move-to-google-drive.sh ~/.claude/skills ~/Projects "~/Documents/Claude Outputs"
```

Check the plan. When it looks right, apply it:

```bash
./tools/move-to-google-drive.sh --apply ~/.claude/skills ~/Projects "~/Documents/Claude Outputs"
```

If the script cannot find your Drive folder, pass it explicitly:

```bash
./tools/move-to-google-drive.sh --apply --drive "$HOME/Library/CloudStorage/GoogleDrive-you@example.com/My Drive/Claude" ~/.claude/skills
```

## Windows

Open PowerShell in this folder and run a dry run first:

```powershell
powershell -ExecutionPolicy Bypass -File tools\move-to-google-drive.ps1 `
    "$env:USERPROFILE\.claude\skills" "$env:USERPROFILE\Projects" "$env:USERPROFILE\Documents\Claude Outputs"
```

Check the plan. When it looks right, apply it:

```powershell
powershell -ExecutionPolicy Bypass -File tools\move-to-google-drive.ps1 -Apply `
    "$env:USERPROFILE\.claude\skills" "$env:USERPROFILE\Projects" "$env:USERPROFILE\Documents\Claude Outputs"
```

If the script cannot find your Drive folder, pass it explicitly with
`-Drive "G:\My Drive\Claude"`.

## What the scripts do, per folder

1. Copy the folder to `My Drive/Claude/<folder name>`.
2. Verify the copy is complete (a recursive diff on Mac, a robocopy list-only
   pass on Windows). If anything differs, the original is left untouched and
   the script stops.
3. Rename the original to `<folder>.pre-drive-backup`.
4. Create a link at the original path pointing into Google Drive (a symlink on
   Mac, a junction on Windows). Claude and every other app keep using the old
   path and now read and write straight into Drive.

Folders that are already links, already in Drive, or already have a backup
are skipped, so rerunning the script is safe.

## After it runs

- Watch the Google Drive icon in your menu bar or system tray until the
  upload finishes.
- Right-click `My Drive/Claude` in Drive and choose *Offline access* →
  *Available offline* (Stream mode) so everything stays readable without a
  connection.
- Open Claude Code or Cowork and confirm your skills and projects still show
  up. They should, since the paths did not change.
- When you are satisfied, delete the `*.pre-drive-backup` folders to reclaim
  disk space.

## Rolling back

Delete the link and put the backup back:

```bash
# Mac
rm ~/.claude/skills && mv ~/.claude/skills.pre-drive-backup ~/.claude/skills
```

```powershell
# Windows (a junction is removed with rmdir, which does not touch the target)
cmd /c rmdir "$env:USERPROFILE\.claude\skills"
Rename-Item "$env:USERPROFILE\.claude\skills.pre-drive-backup" "skills"
```

## Using the folders from a second computer

Install Google Drive for desktop on the other machine, sign in with the same
account, wait for `My Drive/Claude` to sync, then create the same links there
by hand (`ln -s` on Mac, `New-Item -ItemType Junction` on Windows) or simply
point Claude at the Drive path directly.
