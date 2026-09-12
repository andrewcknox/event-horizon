param(
  [switch]$Remove
)

# Puts shortcuts to the hotkey listeners (and optionally the HUD) in your
# Startup folder so they come back after every login. Run from a PowerShell
# window in this folder:
#
#   powershell -ExecutionPolicy Bypass -File .\install-startup.ps1
#
# and the same with -Remove to take them out again. Nothing else is changed:
# these are ordinary .lnk files in
# %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup, and you can
# delete any of them by hand.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$startup = [Environment]::GetFolderPath("Startup")
$shell = New-Object -ComObject WScript.Shell

$entries = @(
  @{ Name = "Journal Quick Journal"; Script = "launch-quick-journal-capture.vbs" },
  @{ Name = "Journal Lessons Log"; Script = "launch-mistake-capture.vbs" },
  @{ Name = "Journal Learn Capture"; Script = "launch-learn-capture.vbs" },
  @{ Name = "Journal Thought Record"; Script = "launch-cbt-capture.vbs" },
  @{ Name = "Journal Eye Rest"; Script = "launch-eyerest-capture.vbs" },
  @{ Name = "Journal Task HUD"; Script = "launch-task-hud.vbs" },
  @{ Name = "Journal Work Mode"; Script = "launch-work-mode.vbs" }
)

foreach ($entry in $entries) {
  $linkPath = Join-Path $startup ($entry.Name + ".lnk")
  if ($Remove) {
    if (Test-Path -LiteralPath $linkPath) {
      Remove-Item -LiteralPath $linkPath -Force
      Write-Host "Removed $($entry.Name)"
    }
    continue
  }
  $target = Join-Path $scriptDir $entry.Script
  if (-not (Test-Path -LiteralPath $target)) {
    Write-Warning "Missing $target, skipped"
    continue
  }
  $link = $shell.CreateShortcut($linkPath)
  $link.TargetPath = "wscript.exe"
  $link.Arguments = '"' + $target + '"'
  $link.WorkingDirectory = $scriptDir
  $link.Description = $entry.Name
  $link.Save()
  Write-Host "Installed $($entry.Name)"
}

if (-not $Remove) {
  Write-Host ""
  Write-Host "Done. They start at your next login; to start them now, double-click the .vbs files."
}
