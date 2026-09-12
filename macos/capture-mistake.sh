#!/bin/bash
# Mistake capture. The first dialog is the capture and it is enough on its own —
# reflection prompts follow but every one can be left blank or cancelled, so
# logging a mistake never costs more than one sentence in the moment.
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

WHAT=$(ask "What was the mistake?")
[ -z "$WHAT" ] && exit 0

PROBLEM=$(ask_optional "Why was it a problem? (optional — leave blank to skip)")
WHY=$(ask_optional "Why did it happen? (optional)")
ALTERNATIVE=$(ask_optional "What could you have done instead? (optional)")
NEXT_TIME=$(ask_optional "What will you try next time? (optional)")

ensure_server || { notify "Event Horizon is not running and would not start."; exit 1; }
if post /api/mistakes "date=$(date +%Y-%m-%d)" "happenedToday:=true" \
  "what=$WHAT" "problem=$PROBLEM" "why=$WHY" \
  "alternative=$ALTERNATIVE" "nextTime=$NEXT_TIME"; then
  notify "Mistake logged."
else
  notify "Save failed — the server rejected it or is not running."
fi
