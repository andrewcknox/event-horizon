#!/bin/bash
# Double-clickable launcher: starts the server if needed and opens the app in an
# app-mode browser window (Chrome if installed, otherwise the default browser).
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"

if ! ensure_server; then
  notify "The server would not start. Is Node installed? (node server.cjs)"
  exit 1
fi

if [ -d "/Applications/Google Chrome.app" ]; then
  # A dedicated profile keeps the app window separate from regular browsing.
  open -na "Google Chrome" --args --app="$BASE_URL" \
    --user-data-dir="$HOME/Library/Application Support/JournalCaptureBrowser" \
    --no-first-run --no-default-browser-check
else
  open "$BASE_URL"
fi
