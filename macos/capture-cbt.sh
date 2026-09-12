#!/bin/bash
# CBT thought record. Situation and automatic thought are required; the rest are
# optional and blank answers are left out of the record entirely. The result is
# saved as a "Thought record" block in today's journal document.
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

STARTED_AT=$(iso_now)
STARTED_DATE=$(date +%Y-%m-%d)

SITUATION=$(ask "Thought record — what was the situation?")
[ -z "$SITUATION" ] && exit 0
THOUGHT=$(ask "What was the automatic thought?")
[ -z "$THOUGHT" ] && exit 0

DISTORTION=$(ask_optional "Which distortion is this? (optional — e.g. catastrophising, mind reading, all-or-nothing)")
EVIDENCE_FOR=$(ask_optional "Evidence for the thought? (optional)")
EVIDENCE_AGAINST=$(ask_optional "Evidence against it? (optional)")
BALANCED=$(ask_optional "A more balanced thought? (optional)")
FEEL=$(ask_optional "How do you feel now? (optional)")

TEXT="Situation: $SITUATION

Automatic thought: $THOUGHT"
[ -n "$DISTORTION" ] && TEXT="$TEXT

Distortion: $DISTORTION"
[ -n "$EVIDENCE_FOR" ] && TEXT="$TEXT

Evidence for: $EVIDENCE_FOR"
[ -n "$EVIDENCE_AGAINST" ] && TEXT="$TEXT

Evidence against: $EVIDENCE_AGAINST"
[ -n "$BALANCED" ] && TEXT="$TEXT

Balanced thought: $BALANCED"
[ -n "$FEEL" ] && TEXT="$TEXT

How I feel now: $FEEL"

ensure_server || { notify "Event Horizon is not running and would not start."; exit 1; }
if post /api/quick-journal "date=$STARTED_DATE" "title=Thought record" \
  "text=$TEXT" "startedAt=$STARTED_AT" "endedAt=$(iso_now)"; then
  notify "Thought record saved."
else
  notify "Save failed — the server rejected it or is not running."
fi
