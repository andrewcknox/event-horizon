# Shared offline outbox for the capture hotkeys: quick journal (Ctrl+Alt+Q),
# lessons from experience (Ctrl+Alt+W), learn list (Ctrl+Alt+L), eye rest (Ctrl+Alt+E) and the
# CBT thought record. Dot-sourced by each of those scripts.
#
# The line this exists to hold: the server being down must never cost a capture,
# and must never turn one into a chore about a background process. Before this,
# a failed POST left the window open saying "Event Horizon is not running -
# start it and press Ctrl+Enter again", which lands on the user mid-break with
# their eyes shut, holding five minutes of typing hostage to a node process they
# are not supposed to think about. Now the payload parks in outbox/ and the
# window closes exactly as it does online; server.cjs drains the directory the
# next time it starts.
#
# Queue on a *transport* failure only - the same rule as the browser queue in
# LLM_README "Offline writes queue and replay". A reply with a status code means
# the server saw the capture and said no, and replaying that forever would be a
# different bug, so those keep the old behaviour: window open, text intact.
#
# Every payload carries a captureId and the server records the ids it has
# stored. That is the only thing standing between a POST that timed out *after*
# the server had already written it and a duplicate row on replay - the one case
# a transport error cannot tell apart from a dead server.

$captureOutboxDir = Join-Path (Split-Path -Parent $PSScriptRoot) "outbox"
$captureQueuedStatus = "Event Horizon is not running - saved offline. It lands when you next start it."

function New-CaptureId {
  return [guid]::NewGuid().ToString("n")
}

function Get-CaptureOutboxCount {
  try {
    if (-not (Test-Path -LiteralPath $captureOutboxDir)) { return 0 }
    return @(Get-ChildItem -LiteralPath $captureOutboxDir -Filter "*.json" -File -ErrorAction Stop).Count
  } catch {
    return 0
  }
}

# Appended to a capture window's default status line, so a server that has been
# down for a week is visible at the moment the user is already looking at the
# window rather than only in a log they never open.
function Format-CaptureStatusWithOutbox {
  param([string]$Base)
  $pending = Get-CaptureOutboxCount
  if ($pending -lt 1) { return $Base }
  $noun = if ($pending -eq 1) { "capture" } else { "captures" }
  $waiting = "$pending $noun saved offline, waiting for Event Horizon."
  if (-not $Base) { return $waiting }
  return "$Base  -  $waiting"
}

# Hides a capture window after the "saved offline" line has had time to be read.
# Closing instantly would be indistinguishable from a normal log, and the one
# thing the user has to know is that this one did not reach the server.
function Start-CaptureNoticeHide {
  param(
    [Parameter(Mandatory = $true)][scriptblock]$Hide,
    [int]$Milliseconds = 1500
  )
  $noticeTimer = New-Object System.Windows.Threading.DispatcherTimer
  $noticeTimer.Interval = [TimeSpan]::FromMilliseconds($Milliseconds)
  $noticeTimer.Add_Tick({
    $noticeTimer.Stop()
    & $Hide
  }.GetNewClosure())
  $noticeTimer.Start()
}

function Save-CaptureToOutbox {
  param(
    [Parameter(Mandatory = $true)][string]$Endpoint,
    [Parameter(Mandatory = $true)][hashtable]$Payload
  )

  if (-not (Test-Path -LiteralPath $captureOutboxDir)) {
    New-Item -ItemType Directory -Path $captureOutboxDir -Force | Out-Null
  }

  $record = @{
    captureId = $Payload.captureId
    endpoint = $Endpoint
    queuedAt = (Get-Date).ToUniversalTime().ToString("o")
    payload = $Payload
  }

  # The name leads with the queue time so the server replays in the order things
  # were captured; eye rest depends on it, queueing the blind-journaling block
  # before the break it was written during.
  $stamp = (Get-Date).ToString("yyyyMMdd-HHmmss-fff")
  $suffix = [string]$Payload.captureId
  if ($suffix.Length -gt 8) { $suffix = $suffix.Substring(0, 8) }
  $fileName = "$stamp-$suffix.json"
  # Written as .json.tmp and renamed, because the server drains *.json: a file
  # only becomes visible to the replay once it is complete.
  $tempPath = Join-Path $captureOutboxDir "$fileName.tmp"
  $finalPath = Join-Path $captureOutboxDir $fileName
  # Not Set-Content -Encoding UTF8: on Windows PowerShell 5.1 that writes a BOM,
  # and JSON.parse on the other side refuses the file outright - the capture
  # would sit in the outbox forever, replayed and skipped on every start.
  [System.IO.File]::WriteAllText($tempPath, ($record | ConvertTo-Json -Depth 8), (New-Object System.Text.UTF8Encoding($false)))
  Move-Item -LiteralPath $tempPath -Destination $finalPath -Force
}

# True when the failure carries an HTTP response, i.e. the server answered and
# refused. Walks the inner exceptions because the shape differs between the
# WebException PowerShell 5.1 raises and what a wrapped call surfaces.
function Test-CaptureServerAnswered {
  param($ErrorRecord)
  $exception = $ErrorRecord.Exception
  while ($exception) {
    $response = $null
    try { $response = $exception.Response } catch { $response = $null }
    if ($response) { return $true }
    $exception = $exception.InnerException
  }
  return $false
}

# Returns @{ status = "sent" | "queued" | "rejected" | "failed"; response = ... }
#   sent     - the server took it
#   queued   - unreachable, parked in outbox/, treat the capture as logged
#   rejected - the server answered and said no, keep the window open
#   failed   - unreachable AND the outbox could not be written; nothing is safe
#              to close over, so the window must keep the text
function Invoke-CapturePost {
  param(
    [Parameter(Mandatory = $true)][string]$BaseUrl,
    [Parameter(Mandatory = $true)][string]$Endpoint,
    [Parameter(Mandatory = $true)][hashtable]$Payload,
    [int]$TimeoutSec = 4
  )

  if (-not $Payload.ContainsKey("captureId") -or -not $Payload.captureId) {
    $Payload.captureId = New-CaptureId
  }

  try {
    $response = Invoke-RestMethod `
      -Uri "$BaseUrl$Endpoint" `
      -Method POST `
      -ContentType "application/json" `
      -Body ($Payload | ConvertTo-Json -Depth 8) `
      -TimeoutSec $TimeoutSec
  } catch {
    if (Test-CaptureServerAnswered $_) {
      return @{ status = "rejected"; response = $null }
    }
    try {
      Save-CaptureToOutbox -Endpoint $Endpoint -Payload $Payload
      return @{ status = "queued"; response = $null }
    } catch {
      return @{ status = "failed"; response = $null }
    }
  }

  if (-not $response.ok) {
    return @{ status = "rejected"; response = $response }
  }
  return @{ status = "sent"; response = $response }
}
