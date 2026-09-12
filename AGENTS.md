# Agent notes

This is Event Horizon: a local single-user journaling app. One static page
(`index.html` + `app.js` + `styles.css`) served by a dependency-free Node server
(`server.cjs`) on http://127.0.0.1:8787, with all data in plain JSON files in
this folder.

Read `LLM_README.md` before making non-trivial changes. It documents the app
shape, the data files and their guard rules, the entry revision/merge model,
the calendar and timezone handling, and the conventions that are easy to lose
across context windows. The Windows hotkey capture windows, the task HUD and
their launchers live in `windows/` (PowerShell; every script finds the repo
root as the parent of its own folder); the macOS equivalents live in `macos/`.
`docs/FEATURES.md` is the user-facing tour.

Editing a capture script is not enough to change behavior. `mistake-capture.ps1`,
`quick-journal-capture.ps1`, `learn-capture.ps1`, `cbt-capture.ps1`,
`eyerest-capture.ps1` and `work-mode.ps1` run as background hotkey listeners that
read their script once at launch, so an edit does nothing until that listener is
killed and relaunched through its `launch-*.vbs`. The first four dot-source
`capture-outbox.ps1`, so a change to that file means restarting all of them.
Process list and instance mutex both lie about whether a listener came back; the
reliable check is a separate process trying to `RegisterHotKey` the combination,
where failing to take it is the proof a listener owns it. A stale listener is
invisible from the outside: the hotkey is still registered and the window still
opens, just with the old layout, which reads as "the hotkey is broken" rather
than "the process is old".

Run the tests with:

```bash
node tests/<name>.test.js
```

They are plain scripts (no framework) that extract functions from `app.js` /
`server.cjs` by string markers — if you rename or move marked code, update the
markers in the test rather than deleting the check.

House rules:

- The server must keep binding loopback only by default (it has no auth).
- Entry writes go through the revision/merge model; never let the client adopt
  a server revision without its data.
- Data files are guarded by `DATA_FILE_POLICY` in `server.cjs` (append-only /
  shrink guards + history copies). Respect it when adding new stores.
- After editing `server.cjs`, the server needs a restart; `app.js` and
  `styles.css` just need a reload. The PowerShell listeners in `windows/`
  must be restarted to pick up edits, and they fail silently
  (`$ErrorActionPreference = "SilentlyContinue"`): parse-check with
  `[System.Management.Automation.Language.Parser]::ParseFile` before shipping.
- Look at UI changes rendered, not just in the stylesheet: check that text
  does not run past its container (see "Check how the text lands" in
  `LLM_README.md`). The output-panel tab strip had exactly that bug.
- Be careful with task sync: `syncTasksFromDisk()` can re-render the task view
  while the user is typing; preserve the task-edit guard documented in
  `LLM_README.md` so add-task/edit fields are not wiped by polling.
