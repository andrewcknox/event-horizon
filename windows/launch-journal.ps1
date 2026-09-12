$ErrorActionPreference = "SilentlyContinue"

# Starts the local server if it is not already running, then opens the app in
# its own app-style window (Edge or Chrome in --app mode, with a separate
# browser profile kept in browser-profile-clean/ so no extensions run in it).
# If the window is already open it is brought to the front instead.
# Run via launch-journal.vbs for a silent start.

$port = 8787
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptDir
$url = "http://127.0.0.1:$port"
$windowTitle = "Event Horizon"
$profileDir = Join-Path $root "browser-profile-clean"
$launcherMutex = New-Object System.Threading.Mutex($false, "Local\JournalCaptureLauncher")
$hasLauncherMutex = $false

try {
  $hasLauncherMutex = $launcherMutex.WaitOne(5000)
} catch [System.Threading.AbandonedMutexException] {
  $hasLauncherMutex = $true
}

if (-not $hasLauncherMutex) {
  exit
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

function Show-ExistingJournalWindow {
  $browserProcesses = Get-CimInstance Win32_Process | Where-Object {
    $_.Name -in @("msedge.exe", "chrome.exe") -and
    $_.CommandLine -and
    $_.CommandLine -like "*$profileDir*" -and
    $_.CommandLine -notlike "*--type=*"
  }

  foreach ($browserProcess in $browserProcesses) {
    $process = Get-Process -Id $browserProcess.ProcessId -ErrorAction SilentlyContinue
    if (-not $process -or $process.MainWindowHandle -eq 0) {
      continue
    }

    if (-not ("JournalWindow" -as [type])) {
      Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class JournalWindow {
  [DllImport("user32.dll")]
  public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")]
  public static extern bool SetForegroundWindow(IntPtr hWnd);
}
"@
    }

    [JournalWindow]::ShowWindowAsync($process.MainWindowHandle, 9) | Out-Null
    (New-Object -ComObject WScript.Shell).AppActivate($process.Id) | Out-Null
    [JournalWindow]::SetForegroundWindow($process.MainWindowHandle) | Out-Null
    return $true
  }

  return $false
}

Start-JournalServer

if (Show-ExistingJournalWindow) {
  $launcherMutex.ReleaseMutex()
  $launcherMutex.Dispose()
  exit
}

function Start-JournalWindow {
  if (-not (Test-Path -LiteralPath $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir | Out-Null
  }

  $edgePaths = @(
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:LocalAppData\Microsoft\Edge\Application\msedge.exe"
  )
  $chromePaths = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
  )

  foreach ($browser in ($edgePaths + $chromePaths)) {
    if ($browser -and (Test-Path -LiteralPath $browser)) {
      Start-Process -FilePath $browser -ArgumentList @(
        "--app=$url",
        "--user-data-dir=$profileDir",
        "--disable-extensions",
        "--disable-extensions-except=",
        "--disable-component-extensions-with-background-pages",
        "--no-first-run",
        "--no-default-browser-check",
        "--class=$windowTitle",
        "--window-size=1280,900"
      )
      return
    }
  }

  # No Edge or Chrome found: fall back to whatever the default browser is.
  Start-Process $url
}

Start-JournalWindow
$launcherMutex.ReleaseMutex()
$launcherMutex.Dispose()
