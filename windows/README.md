# Event Horizon on Windows

Everything here assumes the repo lives somewhere stable (for example
`C:\Users\<you>\event-horizon`) and that [Node.js](https://nodejs.org) 18 or
newer is installed with the "add to PATH" option the installer offers by
default. Nothing else needs installing: the scripts are plain PowerShell and use
only what ships with Windows 10/11.

## First run

Double-click `launch-journal.vbs`. It starts the local server if it is not
already running and opens the app in its own window (Edge or Chrome in app mode,
with a separate browser profile so no extensions run inside it). If the window is
already open it is brought to the front instead.

If you would rather see what is going on, open a terminal in the repo folder and
run:

```powershell
node server.cjs
```

then open http://127.0.0.1:8787 in any browser.

The first time you run a `.vbs` file Windows may ask whether you trust it. They
are all in this folder and do nothing but start the matching `.ps1` script
without a console window; open them in Notepad if you want to check.

## The hotkey capture windows

Each of these is a small background listener. Start it once (double-click the
`.vbs`) and it waits, invisible, until you press its hotkey anywhere in
Windows. Then a small window appears, you type, press **Ctrl+Enter**, and focus
goes back to whatever you were doing. Esc hides the window without discarding
what you typed.

| Hotkey | Script | What it does |
| --- | --- | --- |
| **Ctrl+Alt+Q** | `launch-quick-journal-capture.vbs` | Quick journal: one box, anything you type lands as a timestamped block in today's Document view. Pressing the hotkey again re-opens the same draft. |
| **Ctrl+Alt+W** | `launch-mistake-capture.vbs` | Lessons from experience: "what I did" is the only required box, plus an optional "went well / went badly" you can leave undecided; the reflection boxes (problem, why, alternative, next time) can be filled in later in the app. It began as a mistakes-only log, which is why the script, the mutex and the API endpoint are all still named for mistakes. |
| **Ctrl+Alt+L** | `launch-learn-capture.vbs` | Learn-about list: a topic or a pasted link goes on the standing "things to learn about" list. |
| **Ctrl+Alt+C** | `launch-cbt-capture.vbs` | Thought record: a guided Daily Mood Log (upsetting event, emotions before/after, negative thoughts with distortions and a rational response, outcome). Only the event and the first thought are required. It lands in today's Document. |
| **Ctrl+Alt+E** | `launch-eyerest-capture.vbs` | Eye rest: a countdown with a gong, a box you can type into with your eyes shut ("blind journaling"), and a quick review of the break. Logs an Eye rest block on the calendar and the notes into the Document. |

If a hotkey is already taken by another program, the quick journal, learn,
thought record and eye rest listeners try a fallback combination and tell you
which one they got in a one-time message box; the lessons listener tells you
Ctrl+Alt+W is taken and asks you to pick another. To change a hotkey
permanently, edit the `Modifiers`/`Key` lines near the bottom of the matching
`*-capture.ps1` file (the comment there explains the codes).

The capture windows work with the server stopped. If Event Horizon is not
running when you press Ctrl+Enter, the window says "saved offline", parks the
capture in the `outbox\` folder, and closes as normal. The server replays the
outbox the next time it starts, so nothing typed into a capture window is ever
lost to a background process not running.

## The task HUD

`launch-task-hud.vbs` opens a small always-on-top window listing the "Do right
now" tasks from the Tasks view, each with a checkmark. Ticking one completes it
in the app (and plays a short celebration animation; switch those off in the
app's Settings if you prefer). Drag it wherever you like; its position, size and
row count persist in `hud-settings.json`. **Ctrl+Z** in the HUD undoes the last
completion. The "Open HUD" button on the Tasks view starts it too.

## Work mode

`launch-work-mode.vbs` starts a background listener on **Ctrl+Alt+F**. Pressing
it draws a thin green band around the edge of the screen for as long as you are
working, so the state is visible without a window to look at, and it doubles as
a pomodoro timer: press Ctrl+Alt+F again (or pass `-Minutes` to the launcher) to
open a timed sitting. If you switch to something the watch counts as a
distraction, the band flashes.

Switching work mode off books the sitting on the calendar as a hot-pink **Work
session** with no category. That is deliberate: an uncategorised block is a
to-do, not a record -- it says "this happened, decide what it was" and stays the
one colour on the calendar that means "not filed yet" until you categorise it.

The session survives a crash. Work mode heartbeats to `work-session-state.json`
while it runs and books whatever was left over the next time it starts, so a
reboot in the middle of a long sitting costs the part after the restart, not the
whole thing. When the server is down the closed session parks in `outbox\` like
any other capture.

## Starting everything at login

Run this once from a PowerShell window in this folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\install-startup.ps1
```

It puts shortcuts to the five capture listeners, the HUD and work mode in your
Startup folder, so they come back after every login. Run it again with `-Remove` to take
them out. They are ordinary shortcuts in
`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`, so you can also
delete any of them by hand.

The server itself is started on demand by whichever launcher runs first, so it
does not need its own startup entry.

## Where things are written

All of the scripts write next to the code, one level up from this folder:
`entries\`, `exports\`, `outbox\`, `eyerest-log.json`, `eyerest-settings.json`,
`hud-settings.json`, `work-mode-settings.json`, `work-mode-log.json`,
`browser-profile-clean\` (the app window's browser profile). See the main [README](../README.md) for the full list of data files.

## Stopping a listener

They have no window to close. Either sign out, or end the `powershell.exe`
process whose command line mentions the script name (Task Manager, Details tab,
add the "Command line" column), then start it again from the `.vbs`.

## If a hotkey does nothing

1. Check the listener is running (see above). Each one refuses to start twice,
   so a second double-click is harmless.
2. Another program may own the combination. The listener would have said so
   when it started; try the fallback it named.
3. PowerShell scripts can take 20 to 60 seconds to start the first time after
   login (they compile a small amount of C# on the way up). Give it a minute.
