param(
  [string]$Date = "",
  [int]$Port = 8787
)

# Starts the local server if needed, then the floating task HUD (task-hud.ps1).
# Run via launch-task-hud.vbs for a silent start; the app's "Open HUD" button
# on the Tasks view calls the same .vbs through POST /api/open-hud.

$ErrorActionPreference = "SilentlyContinue"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptDir
$url = "http://127.0.0.1:$Port"

if (-not $Date) {
  $Date = Get-Date -Format "yyyy-MM-dd"
}

# Find node.exe without hardcoding where it was installed. PATH first (the
# normal Node installer adds itself there), then the usual install folders.
function Resolve-NodeExe {
  $command = Get-Command node -ErrorAction SilentlyContinue
  if ($command -and $command.Source) { return $command.Source }
  $candidates = @(
    "$env:ProgramFiles\nodejs\node.exe",
    "${env:ProgramFiles(x86)}\nodejs\node.exe",
    "$env:LocalAppData\Programs\nodejs\node.exe",
    "$env:NVM_SYMLINK\node.exe"
  )
  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path -LiteralPath $candidate)) { return $candidate }
  }
  return "node"
}

$node = Resolve-NodeExe

function Test-JournalServer {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 1
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

function Start-JournalServer {
  if (Test-JournalServer) { return }
  Start-Process -FilePath $node -ArgumentList "server.cjs" -WorkingDirectory $root -WindowStyle Hidden
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 250
    if (Test-JournalServer) { break }
  }
}

Start-JournalServer

& (Join-Path $scriptDir "task-hud.ps1") -Date $Date -Port $Port
