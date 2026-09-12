param(
  [int]$Minutes = 0,
  [int]$Port = 8787
)

# Starts work mode (work-mode.ps1): the green screen-edge band, the pomodoro
# timer and the distraction watch. Run via launch-work-mode.vbs for a silent
# start. Pass -Minutes to open straight into a timed sitting.

# Unlike launch-task-hud.ps1 this does not start server.cjs first, and that is
# deliberate even though work mode does post a session to it on switch-off. The
# band is drawn locally, the eye-rest handshake is a file on disk, and a closed
# session parks in outbox/ when the server is down, so work mode has to come up
# on a machine where the journal is not running at all rather than drag the
# server up behind it.

$ErrorActionPreference = "SilentlyContinue"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

& (Join-Path $scriptDir "work-mode.ps1") -Minutes $Minutes -Port $Port
