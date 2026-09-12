# Event Horizon

A local, single-user journaling app. Everything runs on your own machine and is
stored as plain files in this folder. There is no account, no cloud, and no
telemetry. It grew out of one person's daily journaling practice and this copy
is a cleaned-up base for making it your own.

**New here? Read [docs/FEATURES.md](docs/FEATURES.md)**: a walkthrough of every
feature with screenshots.

What it does:

- a daily journal **document** (rich text, dictation-friendly) per day
- **morning and night surveys**, with custom choices you add as you go and an
  in-app editor for the questions themselves (26 question types, no code)
- a **calendar** of plan vs. actual time blocks, color-coded by category, with
  deadlines, recurring events, re-planning, and optional two-way Google or
  Outlook calendar sync
- **tasks** with sections, priorities, estimates and completion tracking, which
  can be pegged to a calendar block so moving the block moves the task
- **goals** with a rule of the day, daily check-ins, and a monthly review
- a **rolodex** of the people you interact with, which ticks names it finds in
  what you wrote that day
- standing lists: **lessons from experience**, **learn-about list**,
  **shopping list**
- **trends** charts and a weekly digest built from all of the above
- on Windows, **global hotkeys** that capture a thought, a lesson, a thing to
  learn, a CBT thought record or an eye-rest break without opening the app,
  plus a floating **task HUD** and a **work mode** screen band with a pomodoro
- an optional **Spotify listening log**, if you want what you played on the
  record beside everything else
- daily Markdown exports and automatic local backups

## Running it

Requires [Node.js](https://nodejs.org) 18 or newer. No dependencies to install.

**On Windows**, double-click `windows\launch-journal.vbs`. It starts the local
server and opens the app in its own window. The hotkey capture tools and the
task HUD live in the same folder; see [windows/README.md](windows/README.md)
for the hotkeys and how to start everything at login.

**Anywhere else** (or if you prefer a terminal):

```bash
cd event-horizon
node server.cjs
```

Then open http://127.0.0.1:8787. On macOS, the `macos/` folder has a
double-clickable launcher and dialog-based capture scripts; see
[macos/README.md](macos/README.md).

## Where your data lives

Everything is written next to the code: `entries/YYYY-MM-DD.json` (one file per
day), `exports/YYYY-MM-DD.md`, `calendar-events.json`, `goals.json`,
`goal-log.json`, `people.json` (the rolodex), the list files
(`learn-list.json`, `shopping-list.json`), the eye-rest, HUD and work-mode logs,
`spotify-listens.json` if you connect Spotify, and `backups/` (automatic daily
snapshots and per-file history). Copy the folder and you have copied your
journal.

Two folders are yours but not worth sharing: `browser-profile-clean/` (the app
window's private browser profile) and `outbox/` (captures waiting for the
server). If you ever connect a calendar, `google-calendar-*.json` /
`outlook-calendar-*.json` hold your OAuth credentials and stay on this machine.

## Opening it on your phone

The server listens on this computer only. To use it from a phone on the same
network, start it with `JOURNAL_HOST=0.0.0.0` (PowerShell:
`$env:JOURNAL_HOST="0.0.0.0"; node server.cjs`), then open the address it prints
on the phone and "Add to Home Screen". There is no login, so only do this on a
network you trust, and never expose the port to the internet.

## The server has to be running

The page is served by `server.cjs` and there is no offline cache, on purpose. An
installed copy that booted from a cached shell with the server down would hold
nothing but the compiled-in defaults and push them over your real files the
moment the server answered. Without a cache the page simply does not load until
the server is up, which is the only safe behaviour. The Windows launchers start
the server for you.

The hotkey capture windows are the exception: they work with the server stopped,
parking what you typed in `outbox/` for the server to replay when it next
starts. Nothing typed into a capture window is lost to a process not running.

## Connecting Google or Outlook Calendar (optional)

The Settings view walks through it. You supply your own OAuth credentials. For
Google: create a project at console.cloud.google.com, enable the Calendar API,
create an OAuth client (Web application), add this redirect URI, then paste the
client ID and secret into Settings:

```text
http://127.0.0.1:8787/api/google-calendar/oauth/callback
```

Sync is two-way: provider events import into the app's calendar, and blocks you
create in the app are pushed back to the connected calendar. The Google scope
must be `calendar.events` (read **and** write) for the push half to work; a
connection made under a read-only scope stays one-way until you reconnect.

## Connecting Spotify (optional)

Also from Settings, and also with your own credentials: create an app at
developer.spotify.com, add this redirect URI, and paste the client ID and secret
into Settings.

```text
http://127.0.0.1:8787/api/spotify/oauth/callback
```

The server then asks Spotify every ten minutes what you have played and appends
it to `spotify-listens.json`. Spotify only ever hands back the last 50 plays, so
this is a log the server has to be running to keep; gaps while it is off are
gaps for good.

## Making it yours

The survey questions live at the top of `app.js` (`SCHEMA.surveys`), and the
calendar categories just above them. Both are meant to be edited; the format
is one line per question and the existing lines are the documentation. New
choices for a multiple-choice question can be added from inside the app without
touching code. For anything deeper, `LLM_README.md` is the full developer
reference, written for working on the app with an AI coding assistant, and
`AGENTS.md` is the entry point to hand one.
