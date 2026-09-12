# Event Horizon on macOS

Everything here assumes the repo lives somewhere stable (e.g. `~/event-horizon`)
and that Node.js 18+ is installed (`brew install node` or nodejs.org).

## First run

```bash
cd ~/event-horizon
chmod +x macos/*.sh macos/*.command
node server.cjs
```

Then open http://127.0.0.1:8787 — or just double-click `macos/launch-journal.command`
in Finder, which starts the server if needed and opens the app in its own window.
To launch at login: System Settings → General → Login Items → add
`launch-journal.command`.

## The capture scripts

Each one shows a small dialog and saves straight into the app, so you can log
something without opening the app first. They start the server themselves if it
is not running.

| Script | What it does |
| --- | --- |
| `capture-quick-journal.sh` | One dialog → a timestamped block in today's journal document |
| `capture-mistake.sh` | Logs a mistake; only the first prompt is required, reflection prompts optional |
| `capture-learn.sh` | Adds a topic or link to the "Learn About" list |
| `capture-cbt.sh` | Guided CBT thought record, saved into today's journal |
| `eyerest.sh` | Interval eye-rest reminder with a gong (runs in a terminal, Ctrl+C stops) |

## Binding global hotkeys

macOS has no built-in "run script on hotkey" the way a .ps1 + RegisterHotKey did
on Windows, but two stock options work:

**Shortcuts app (no extra software):**
1. Open Shortcuts → New Shortcut → add the action **Run Shell Script**.
2. Set the script to e.g. `~/event-horizon/macos/capture-mistake.sh`.
3. In the shortcut's settings (ⓘ), enable **Use as Quick Action**, then assign a
   keyboard shortcut under System Settings → Keyboard → Keyboard Shortcuts →
   Services.

**Hammerspoon (nicer, if you're happy to install it):**
```lua
hs.hotkey.bind({"ctrl", "alt"}, "J", function()
  hs.task.new(os.getenv("HOME") .. "/journal-capture/macos/capture-quick-journal.sh", nil):start()
end)
```

The first time a dialog or notification fires, macOS will ask you to grant the
runner (Shortcuts, Hammerspoon, or Terminal) automation/notification permission —
allow it once and it sticks.

## What was not ported

The Windows version had a floating always-on-top **Task HUD** (a native overlay
listing the day's tasks with checkboxes and celebration animations). That was
~2,000 lines of Windows-only UI code and has no direct shell-script equivalent
on macOS. The Tasks view inside the app covers the same ground; if you want a
real overlay again, Hammerspoon's `hs.canvas` or a small Swift menu-bar app
would be the natural way to rebuild it against the same endpoints
(`GET /api/tasks?date=`, `POST /api/tasks/complete`, `POST /api/tasks/undo` —
all documented in `LLM_README.md`).
