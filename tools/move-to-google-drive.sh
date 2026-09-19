#!/usr/bin/env bash
# Move folders (Claude projects, outputs, skills, anything) into Google Drive
# and leave a symlink behind so every tool keeps finding them at the old path.
#
# Usage:
#   ./tools/move-to-google-drive.sh [--drive DIR] [--apply] PATH [PATH ...]
#
#   --drive DIR   Destination root inside Google Drive.
#                 Default: "$HOME/Library/CloudStorage/GoogleDrive-*/My Drive/Claude" (macOS)
#                 or "$HOME/Google Drive/My Drive/Claude" (Linux / older installs).
#   --apply       Actually do it. Without --apply the script only shows the plan.
#
# What happens for each PATH:
#   1. cp -pR PATH -> DRIVE/<basename>  (copy, keep timestamps/permissions)
#   2. diff -rq PATH DRIVE/<basename>   (verify: byte-for-byte identical)
#   3. mv PATH PATH.pre-drive-backup    (original kept, delete it yourself later)
#   4. ln -s DRIVE/<basename> PATH      (old path now points into Drive)
#
# Example (macOS, Claude Code skills + a projects folder + Cowork outputs):
#   ./tools/move-to-google-drive.sh --apply \
#       ~/.claude/skills ~/Projects "~/Documents/Claude Outputs"

set -euo pipefail

DRIVE=""
APPLY=0
PATHS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --drive) DRIVE="$2"; shift 2 ;;
    --apply) APPLY=1; shift ;;
    -h|--help) sed -n '2,25p' "$0"; exit 0 ;;
    *) PATHS+=("$1"); shift ;;
  esac
done

if [[ ${#PATHS[@]} -eq 0 ]]; then
  echo "error: give at least one folder to move (see --help)" >&2
  exit 1
fi

# --- find the Google Drive folder -------------------------------------------
if [[ -z "$DRIVE" ]]; then
  for candidate in \
      "$HOME"/Library/CloudStorage/GoogleDrive-*/"My Drive" \
      "$HOME/Google Drive/My Drive" \
      "$HOME/Google Drive"; do
    if [[ -d "$candidate" ]]; then DRIVE="$candidate/Claude"; break; fi
  done
fi
if [[ -z "$DRIVE" ]]; then
  echo "error: could not find your Google Drive folder. Is Google Drive for desktop installed and signed in?" >&2
  echo "       Pass it explicitly: --drive \"/path/to/My Drive/Claude\"" >&2
  exit 1
fi
DRIVE_PARENT="$(dirname "$DRIVE")"
if [[ ! -d "$DRIVE_PARENT" ]]; then
  echo "error: $DRIVE_PARENT does not exist" >&2
  exit 1
fi

echo "Google Drive destination: $DRIVE"
[[ $APPLY -eq 1 ]] || echo "(dry run: add --apply to make changes)"
echo

move_one() {
  local src="$1"
  src="${src/#\~/$HOME}"                      # expand leading ~
  src="${src%/}"                              # strip trailing slash
  local name; name="$(basename "$src")"
  local dest="$DRIVE/$name"

  if [[ ! -d "$src" ]]; then
    echo "skip   $src  (not a directory)"; return
  fi
  if [[ -L "$src" ]]; then
    echo "skip   $src  (already a symlink -> $(readlink "$src"))"; return
  fi
  case "$src" in
    "$DRIVE_PARENT"/*) echo "skip   $src  (already inside Google Drive)"; return ;;
  esac
  if [[ -e "$dest" ]]; then
    echo "skip   $src  (destination already exists: $dest)"; return
  fi
  if [[ -e "$src.pre-drive-backup" ]]; then
    echo "skip   $src  (backup already exists: $src.pre-drive-backup)"; return
  fi

  local size; size="$(du -sh "$src" 2>/dev/null | cut -f1)"
  echo "move   $src  ($size)"
  echo "   ->  $dest"
  [[ $APPLY -eq 1 ]] || return 0

  mkdir -p "$dest"
  cp -pR "$src/." "$dest/"

  # Verify: every file must be byte-for-byte identical before we touch the original.
  local leftover
  leftover="$(diff -rq "$src" "$dest" 2>&1 || true)"
  if [[ -n "$leftover" ]]; then
    echo "error: verification found differences for $src; original left untouched:" >&2
    echo "$leftover" | head -20 >&2
    return 1
  fi

  mv "$src" "$src.pre-drive-backup"
  ln -s "$dest" "$src"
  echo "done   $src -> $dest   (backup: $src.pre-drive-backup)"
  echo
}

for p in "${PATHS[@]}"; do
  move_one "$p"
done

if [[ $APPLY -eq 1 ]]; then
  cat <<MSG

All done. Next:
  * Open Google Drive and confirm the folders finished uploading (no sync icon).
  * In Google Drive for desktop, right-click "$DRIVE" -> Offline access -> Available offline
    (or use "Mirror files" mode) so Claude can read them without a connection.
  * Once you are happy, delete the *.pre-drive-backup folders to reclaim space.
MSG
fi
