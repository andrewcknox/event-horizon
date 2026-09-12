#!/bin/bash
# Learn-list capture: a topic or a link goes onto the standing "Learn About"
# list. Anything starting with http(s) is filed as a link.
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

INPUT=$(ask "What do you want to learn about? (text or a link)")
[ -z "$INPUT" ] && exit 0

TEXT="$INPUT"
LINK=""
case "$INPUT" in
  http://*|https://*) TEXT=""; LINK="$INPUT" ;;
esac

ensure_server || { notify "Event Horizon is not running and would not start."; exit 1; }
if post /api/learn-list "text=$TEXT" "link=$LINK" "createdAt=$(iso_now)" "source=hotkey"; then
  notify "Added to the learn list."
else
  notify "Save failed — the server rejected it or is not running."
fi
