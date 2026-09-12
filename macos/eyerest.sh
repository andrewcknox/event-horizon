#!/bin/bash
# Eye-rest reminder: every WORK_MINUTES it plays the gong and shows a
# notification telling you to look away for REST_SECONDS. Run it in a terminal
# tab and stop it with Ctrl+C. (The Windows original drew a full-screen overlay;
# this port keeps just the cadence and the sound.)
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

WORK_MINUTES="${EYEREST_WORK_MINUTES:-20}"
REST_SECONDS="${EYEREST_REST_SECONDS:-315}"
GONG="$ROOT/assets/eyerest-gong.wav"

echo "Eye rest: every $WORK_MINUTES min, rest $REST_SECONDS s. Ctrl+C to stop."
while true; do
  sleep $((WORK_MINUTES * 60))
  [ -f "$GONG" ] && afplay "$GONG" &
  notify "Eye rest: look at something far away for $((REST_SECONDS / 60)) minutes."
  sleep "$REST_SECONDS"
  [ -f "$GONG" ] && afplay "$GONG" &
  notify "Eye rest over — back to it."
done
