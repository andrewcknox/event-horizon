#!/bin/bash
# Shared helpers for the macOS capture scripts. Source this, don't run it.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${JOURNAL_PORT:-8787}"
BASE_URL="http://127.0.0.1:$PORT"

server_running() {
  curl -s -o /dev/null --max-time 1 "$BASE_URL"
}

# Starts the server headlessly if it is not already up, and waits for it.
ensure_server() {
  if server_running; then return 0; fi
  (cd "$ROOT" && nohup node server.cjs >/dev/null 2>&1 &)
  for _ in $(seq 1 20); do
    sleep 0.25
    if server_running; then return 0; fi
  done
  return 1
}

# ask "Prompt" "default" -> echoes the answer; exits the script silently on Cancel.
ask() {
  local answer
  answer=$(osascript -e "text returned of (display dialog $(osa_quote "$1") default answer $(osa_quote "${2:-}") with title \"Event Horizon\")" 2>/dev/null) || exit 0
  printf '%s' "$answer"
}

# Same, but Cancel returns an empty string instead of exiting (for optional prompts).
ask_optional() {
  osascript -e "text returned of (display dialog $(osa_quote "$1") default answer \"\" with title \"Event Horizon\")" 2>/dev/null || true
}

notify() {
  osascript -e "display notification $(osa_quote "$1") with title \"Event Horizon\"" >/dev/null 2>&1
}

# AppleScript string literal with quotes/backslashes escaped.
osa_quote() {
  local s=${1//\\/\\\\}
  s=${s//\"/\\\"}
  printf '"%s"' "$s"
}

iso_now() {
  date -u +%Y-%m-%dT%H:%M:%SZ
}

post() {
  node "$ROOT/macos/post.cjs" "$@"
}
