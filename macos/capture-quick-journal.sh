#!/bin/bash
# Quick journal capture: one dialog, straight into today's journal document.
# Bind to a global hotkey (see macos/README.md).
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

STARTED_AT=$(iso_now)
TEXT=$(ask "Quick journal — what happened?")
[ -z "$TEXT" ] && exit 0

ensure_server || { notify "Event Horizon is not running and would not start."; exit 1; }
if post /api/quick-journal "startedAt=$STARTED_AT" "endedAt=$(iso_now)" "text=$TEXT"; then
  notify "Journal entry saved."
else
  notify "Save failed — the server rejected it or is not running."
fi
