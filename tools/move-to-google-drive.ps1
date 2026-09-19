<#
.SYNOPSIS
  Move folders (Claude projects, outputs, skills, anything) into Google Drive
  and leave a junction behind so every tool keeps finding them at the old path.

.USAGE
  powershell -ExecutionPolicy Bypass -File tools\move-to-google-drive.ps1 [-Drive DIR] [-Apply] PATH [PATH ...]

  -Drive DIR   Destination root inside Google Drive.
               Default: "G:\My Drive\Claude" (or whichever drive letter Google Drive uses).
  -Apply       Actually do it. Without -Apply the script only shows the plan.

  For each PATH:
    1. robocopy PATH -> DRIVE\<name>          (copy, keep timestamps)
    2. robocopy /L (list-only) verify         (nothing left to copy)
    3. Rename-Item PATH -> PATH.pre-drive-backup
    4. New-Item -ItemType Junction PATH -> DRIVE\<name>

  Example (Claude Code skills + a projects folder + Cowork outputs):
    powershell -ExecutionPolicy Bypass -File tools\move-to-google-drive.ps1 -Apply `
        "$env:USERPROFILE\.claude\skills" "$env:USERPROFILE\Projects" "$env:USERPROFILE\Documents\Claude Outputs"
#>
[CmdletBinding()]
param(
  [string]$Drive = "",
  [switch]$Apply,
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Paths
)

$ErrorActionPreference = "Stop"

if (-not $Paths -or $Paths.Count -eq 0) {
  Write-Error "Give at least one folder to move. See the header of this script for usage."
  exit 1
}

# --- find the Google Drive folder -------------------------------------------
if (-not $Drive) {
  $candidates = @()
  foreach ($d in (Get-PSDrive -PSProvider FileSystem)) {
    $candidates += Join-Path $d.Root "My Drive"
  }
  $candidates += Join-Path $env:USERPROFILE "Google Drive\My Drive"
  $candidates += Join-Path $env:USERPROFILE "Google Drive"
  foreach ($c in $candidates) {
    if (Test-Path -LiteralPath $c -PathType Container) { $Drive = Join-Path $c "Claude"; break }
  }
}
if (-not $Drive) {
  Write-Error "Could not find your Google Drive folder. Is Google Drive for desktop installed and signed in? Pass it with -Drive `"G:\My Drive\Claude`"."
  exit 1
}
$DriveParent = Split-Path -Parent $Drive
if (-not (Test-Path -LiteralPath $DriveParent -PathType Container)) {
  Write-Error "$DriveParent does not exist."
  exit 1
}

Write-Host "Google Drive destination: $Drive"
if (-not $Apply) { Write-Host "(dry run: add -Apply to make changes)" }
Write-Host ""

function Move-One([string]$src) {
  $src = [Environment]::ExpandEnvironmentVariables($src).TrimEnd('\')
  $name = Split-Path -Leaf $src
  $dest = Join-Path $Drive $name

  if (-not (Test-Path -LiteralPath $src -PathType Container)) { Write-Host "skip   $src  (not a directory)"; return }
  $item = Get-Item -LiteralPath $src -Force
  if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { Write-Host "skip   $src  (already a link/junction)"; return }
  if ($src.ToLower().StartsWith($DriveParent.ToLower())) { Write-Host "skip   $src  (already inside Google Drive)"; return }
  if (Test-Path -LiteralPath $dest) { Write-Host "skip   $src  (destination already exists: $dest)"; return }
  if (Test-Path -LiteralPath "$src.pre-drive-backup") { Write-Host "skip   $src  (backup already exists)"; return }

  $bytes = (Get-ChildItem -LiteralPath $src -Recurse -Force -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
  $size = if ($bytes) { "{0:N1} MB" -f ($bytes / 1MB) } else { "empty" }
  Write-Host "move   $src  ($size)"
  Write-Host "   ->  $dest"
  if (-not $Apply) { return }

  New-Item -ItemType Directory -Force -Path $Drive | Out-Null
  # /E copy subfolders incl. empty, /COPY:DT data+timestamps, /R:2 /W:2 retries, /NFL /NDL quieter output
  & robocopy $src $dest /E /COPY:DT /DCOPY:T /R:2 /W:2 /NFL /NDL /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "robocopy failed for $src (exit $LASTEXITCODE); original left untouched." }

  # Verify: list-only pass must find nothing to copy (exit code 0 = no differences).
  & robocopy $src $dest /E /L /R:0 /W:0 /NFL /NDL /NP /NJH /NJS | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Verification found differences for $src (robocopy /L exit $LASTEXITCODE); original left untouched." }

  Rename-Item -LiteralPath $src -NewName "$name.pre-drive-backup"
  New-Item -ItemType Junction -Path $src -Target $dest | Out-Null
  Write-Host "done   $src -> $dest   (backup: $src.pre-drive-backup)"
  Write-Host ""
}

foreach ($p in $Paths) { Move-One $p }

if ($Apply) {
  Write-Host ""
  Write-Host "All done. Next:"
  Write-Host "  * Open Google Drive and confirm the folders finished uploading (no sync icon)."
  Write-Host "  * In Google Drive for desktop, right-click `"$Drive`" -> Offline access -> Available offline"
  Write-Host "    (or switch to 'Mirror files') so Claude can read them without a connection."
  Write-Host "  * Once you are happy, delete the *.pre-drive-backup folders to reclaim space."
}
