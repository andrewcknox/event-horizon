const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = __dirname;
const entriesDir = path.join(root, "entries");
const entryHistoryDir = path.join(entriesDir, ".history");
const entryConflictsDir = path.join(entriesDir, ".conflicts");
const entryMediaDir = path.join(entriesDir, "media");
const exportsDir = path.join(root, "exports");
const customChoicesPath = path.join(root, "custom-choices.json");
const appSettingsPath = path.join(root, "app-settings.json");
const calendarEventsPath = path.join(root, "calendar-events.json");
const goalsPath = path.join(root, "goals.json");
const goalLogPath = path.join(root, "goal-log.json");
const eyeRestLogPath = path.join(root, "eyerest-log.json");
const hudLogPath = path.join(root, "hud-log.json");
const taskLogPath = path.join(root, "task-log.json");
const appLogPath = path.join(root, "app-log.json");
const learnListPath = path.join(root, "learn-list.json");
const shoppingListPath = path.join(root, "shopping-list.json");
const peoplePath = path.join(root, "people.json");
const googleCalendarConfigPath = path.join(root, "google-calendar-config.json");
const googleCalendarAuthPath = path.join(root, "google-calendar-auth.json");
// localId -> { googleEventId, updatedAt }. Kept beside the events rather than on
// them because a delete has to survive the local event disappearing: without a
// separate ledger there is nothing left to tell Google the block is gone.
const googleCalendarPushPath = path.join(root, "google-calendar-push.json");
const outlookCalendarConfigPath = path.join(root, "outlook-calendar-config.json");
const outlookCalendarAuthPath = path.join(root, "outlook-calendar-auth.json");
const spotifyConfigPath = path.join(root, "spotify-config.json");
const spotifyAuthPath = path.join(root, "spotify-auth.json");
// Append-only log of every track Spotify reports as played, one row per play.
// Spotify's recently-played endpoint only ever hands back the last 50 plays,
// so this file is the only place the listening history accumulates.
const spotifyListensPath = path.join(root, "spotify-listens.json");
const timezoneHistoryPath = path.join(root, "timezone-history.json");
const monthlyReviewsPath = path.join(root, "monthly-reviews.json");
const port = Number(process.env.PORT || 8787);
const host = process.env.JOURNAL_HOST || "127.0.0.1";
const taskSectionKeys = ["rightNow", "inbox", "today", "upcoming"];
// Surfaces a task can be completed from. Rows written before completion tracking
// existed have no completedVia at all, which is why there is no "unknown" member:
// absent means "not recorded", which is different from "recorded as unknown".
const taskCompletionSurfaces = new Set(["hud", "app"]);
// What the HUD reports about itself. "start"/"end" bracket a session; "show"/"hide"
// track tray visibility inside one; "complete"/"undo" mark task actions taken there.
const hudLogKinds = new Set(["start", "end", "show", "hide", "complete", "undo"]);
// What the app reports about itself. "start"/"end" bracket a page load,
// "hidden"/"visible" track tab focus inside one, "view" marks a view switch.
const appLogKinds = new Set(["start", "end", "hidden", "visible", "view"]);
const calendarCategoryCodes = new Set(["Z", "G", "F", "D", "S", "W", "B", "A", "R", "E", "H", "X", "V", "C", "Q", "T", "N"]);
const calendarRecurrences = new Set(["none", "daily", "weekly", "monthly"]);
// Read *and* write: the sync is two-way now. Plan blocks are pushed up to the
// calendar so they show on the phone, which the old .readonly scope could never
// do -- Google answers a POST under it with a 403 and nothing ever appeared.
// Changing this invalidates the granted scope on an existing connection, so the
// push stays off (see googleScopeAllowsWrite) until the account is reconnected.
const googleCalendarScope = "https://www.googleapis.com/auth/calendar.events";
const googleAuthEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
const googleTokenEndpoint = "https://oauth2.googleapis.com/token";
const googleCalendarApiBase = "https://www.googleapis.com/calendar/v3";
// offline_access is what makes Microsoft hand back a refresh token, so the app
// keeps working without re-consenting every hour.
const outlookCalendarScope = "offline_access Calendars.Read";
const outlookGraphApiBase = "https://graph.microsoft.com/v1.0";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  // Survey attachments. <audio>/<video> refuse to play a file served as
  // application/octet-stream, so a recording made in the app would upload fine
  // and then be silent on the way back without these.
  ".gif": "image/gif",
  // Audio-only WebM gets its own extension so it can be served as audio/webm.
  // The container is identical; the Content-Type is what <audio> reads.
  ".weba": "audio/webm",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".zip": "application/zip"
};

start();

async function start() {
  await fs.mkdir(entriesDir, { recursive: true });
  await fs.mkdir(entryHistoryDir, { recursive: true });
  await fs.mkdir(entryConflictsDir, { recursive: true });
  await fs.mkdir(entryMediaDir, { recursive: true });
  await fs.mkdir(exportsDir, { recursive: true });
  await sweepOrphanedTempFiles();
  const server = http.createServer(handleRequest);
  // Loopback by default. Set JOURNAL_HOST=0.0.0.0 to reach the app from a phone
  // on the same network (or put a VPN in front of it). Deliberately opt-in: this
  // server has no auth, so it must not bind a routable interface unless asked.
  // Hourly rather than at midnight: the app is not reliably running at any given
  // moment, so a sweep that only fires on a date boundary would miss whole days.
  // unref() so this timer never holds the process open.
  // Evidence first: settling a day from the entry is what stops the unanswered
  // sweep from filing a hole against a goal the journal already answered.
  const runGoalRollup = () => {
    settleEvidenceGoalBacklog()
      .catch(() => undefined)
      .then(() => finalizeUnansweredGoalDays())
      .catch(() => undefined);
  };
  runGoalRollup();
  setInterval(runGoalRollup, 60 * 60 * 1000).unref();
  server.listen(port, host, () => {
    console.log(`Event Horizon running at http://${host === "0.0.0.0" ? "127.0.0.1" : host}:${port}`);
    if (host === "0.0.0.0") {
      for (const address of lanAddresses()) {
        console.log(`  reachable on your network at http://${address}:${port}`);
      }
    }
    // A capture queued while this server was down is only a capture once it has
    // been replayed, so the drain runs the moment the port answers. The timer is
    // for the narrow case of a capture window queueing during these first
    // seconds; nothing is ever queued while the server is up and reachable.
    drainCaptureOutbox().catch(() => undefined);
    setInterval(() => drainCaptureOutbox().catch(() => undefined), 5 * 60 * 1000).unref();
    startSpotifyPoller();
  });
}

function lanAddresses() {
  const interfaces = require("node:os").networkInterfaces();
  const found = [];
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) found.push(entry.address);
    }
  }
  return found;
}

async function handleRequest(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
    if (url.pathname === "/api/entry" && req.method === "POST") {
      return await saveEntry(req, res);
    }
    if (url.pathname === "/api/entry" && req.method === "GET") {
      return await getEntry(url, res);
    }
    if (url.pathname === "/api/survey-image" && req.method === "POST") {
      return await saveSurveyImage(req, res);
    }
    if (url.pathname === "/api/survey-file" && req.method === "POST") {
      return await saveSurveyFile(req, res);
    }
    if (url.pathname === "/api/entries" && req.method === "GET") {
      return await getEntries(res);
    }
    if (url.pathname === "/api/custom-choices" && req.method === "GET") {
      return await getCustomChoices(res);
    }
    if (url.pathname === "/api/custom-choices" && req.method === "POST") {
      return await saveCustomChoices(req, res);
    }
    if (url.pathname === "/api/settings" && req.method === "GET") {
      return await getSettings(res);
    }
    if (url.pathname === "/api/settings" && req.method === "POST") {
      return await saveSettings(req, res);
    }
    if (url.pathname === "/api/calendar-events" && req.method === "GET") {
      return await getCalendarEvents(res);
    }
    if (url.pathname === "/api/calendar-events" && req.method === "POST") {
      return await saveCalendarEvents(req, res);
    }
    if (url.pathname === "/api/google-calendar/status" && req.method === "GET") {
      return await getGoogleCalendarStatus(res);
    }
    if (url.pathname === "/api/google-calendar/config" && req.method === "POST") {
      return await saveGoogleCalendarConfig(req, res);
    }
    if (url.pathname === "/api/google-calendar/connect" && req.method === "POST") {
      return await connectGoogleCalendar(res);
    }
    if (url.pathname === "/api/google-calendar/oauth/callback" && req.method === "GET") {
      return await handleGoogleCalendarCallback(url, res);
    }
    if (url.pathname === "/api/google-calendar/sync" && req.method === "POST") {
      return await syncGoogleCalendar(req, res);
    }
    if (url.pathname === "/api/google-calendar/disconnect" && req.method === "POST") {
      return await disconnectGoogleCalendar(res);
    }
    if (url.pathname === "/api/spotify/status" && req.method === "GET") {
      return await getSpotifyStatus(res);
    }
    if (url.pathname === "/api/spotify/config" && req.method === "POST") {
      return await saveSpotifyConfig(req, res);
    }
    if (url.pathname === "/api/spotify/connect" && req.method === "POST") {
      return await connectSpotify(res);
    }
    if (url.pathname === "/api/spotify/oauth/callback" && req.method === "GET") {
      return await handleSpotifyCallback(url, res);
    }
    if (url.pathname === "/api/spotify/sync" && req.method === "POST") {
      return await syncSpotifyNow(res);
    }
    if (url.pathname === "/api/spotify/disconnect" && req.method === "POST") {
      return await disconnectSpotify(res);
    }
    if (url.pathname === "/api/spotify/listens" && req.method === "GET") {
      return await getSpotifyListens(url, res);
    }
    if (url.pathname === "/api/outlook-calendar/status" && req.method === "GET") {
      return await getOutlookCalendarStatus(res);
    }
    if (url.pathname === "/api/outlook-calendar/config" && req.method === "POST") {
      return await saveOutlookCalendarConfig(req, res);
    }
    if (url.pathname === "/api/outlook-calendar/connect" && req.method === "POST") {
      return await connectOutlookCalendar(res);
    }
    if (url.pathname === "/api/outlook-calendar/oauth/callback" && req.method === "GET") {
      return await handleOutlookCalendarCallback(url, res);
    }
    if (url.pathname === "/api/outlook-calendar/sync" && req.method === "POST") {
      return await syncOutlookCalendar(req, res);
    }
    if (url.pathname === "/api/outlook-calendar/disconnect" && req.method === "POST") {
      return await disconnectOutlookCalendar(res);
    }
    if (url.pathname === "/api/tasks" && req.method === "GET") {
      return await getTasks(url, res);
    }
    if (url.pathname === "/api/tasks/complete" && req.method === "POST") {
      return await completeTask(req, res);
    }
    if (url.pathname === "/api/tasks/undo" && req.method === "POST") {
      return await undoTask(req, res);
    }
    if (url.pathname === "/api/mistakes" && req.method === "GET") {
      return await getMistakes(url, res);
    }
    if (url.pathname === "/api/mistakes" && req.method === "POST") {
      return await addMistake(req, res);
    }
    if (url.pathname === "/api/eyerest" && req.method === "POST") {
      return await addEyeRest(req, res);
    }
    if (url.pathname === "/api/work-session" && req.method === "POST") {
      return await addWorkSession(req, res);
    }
    if (url.pathname === "/api/eyerest-log" && req.method === "GET") {
      return await getEyeRestLog(url, res);
    }
    if (url.pathname === "/api/hud-log" && req.method === "GET") {
      return await getHudLog(url, res);
    }
    if (url.pathname === "/api/hud-log" && req.method === "POST") {
      return await appendHudLog(req, res);
    }
    if (url.pathname === "/api/app-log" && req.method === "GET") {
      return await getAppLog(url, res);
    }
    if (url.pathname === "/api/app-log" && req.method === "POST") {
      return await appendAppLog(req, res);
    }
    if (url.pathname === "/api/task-log" && req.method === "GET") {
      return await getTaskLog(url, res);
    }
    if (url.pathname === "/api/quick-journal" && req.method === "POST") {
      return await addQuickJournal(req, res);
    }
    if (url.pathname === "/api/learn-list" && req.method === "GET") {
      return await getLearnList(res);
    }
    if (url.pathname === "/api/learn-list" && req.method === "POST") {
      return await addLearnItem(req, res);
    }
    if (url.pathname === "/api/learn-list/update" && req.method === "POST") {
      return await updateLearnItem(req, res);
    }
    if (url.pathname === "/api/learn-list/delete" && req.method === "POST") {
      return await deleteLearnItem(req, res);
    }
    if (url.pathname === "/api/shopping-list" && req.method === "GET") {
      return await getShoppingList(res);
    }
    if (url.pathname === "/api/shopping-list" && req.method === "POST") {
      return await addShoppingItem(req, res);
    }
    if (url.pathname === "/api/shopping-list/update" && req.method === "POST") {
      return await updateShoppingItem(req, res);
    }
    if (url.pathname === "/api/shopping-list/delete" && req.method === "POST") {
      return await deleteShoppingItem(req, res);
    }
    if (url.pathname === "/api/people" && req.method === "GET") {
      return await getPeople(res);
    }
    if (url.pathname === "/api/people" && req.method === "POST") {
      return await savePeople(req, res);
    }
    if (url.pathname === "/api/goals" && req.method === "GET") {
      return await getGoals(res);
    }
    if (url.pathname === "/api/goals" && req.method === "POST") {
      return await saveGoals(req, res);
    }
    if (url.pathname === "/api/goal-log" && req.method === "GET") {
      return await getGoalLog(url, res);
    }
    if (url.pathname === "/api/goal-log" && req.method === "POST") {
      return await appendGoalLog(req, res);
    }
    if (url.pathname === "/api/monthly-review" && req.method === "GET") {
      return await getMonthlyReviews(res);
    }
    if (url.pathname === "/api/monthly-review" && req.method === "POST") {
      return await saveMonthlyReview(req, res);
    }
    if (url.pathname === "/api/monthly-review/export" && req.method === "POST") {
      return await exportMonthlyReviewXlsx(req, res);
    }
    if (url.pathname === "/api/timezone-history" && req.method === "GET") {
      return await getTimezoneHistory(res);
    }
    if (url.pathname === "/api/timezone-history" && req.method === "POST") {
      return await saveTimezoneHistory(req, res);
    }
    if (url.pathname === "/api/hud-goals" && req.method === "GET") {
      return await getHudGoals(url, res);
    }
    if (url.pathname === "/api/open-hud" && req.method === "POST") {
      return await openHud(url, res);
    }
    return await serveStatic(req, url, res);
  } catch (error) {
    // A refused write is not a server fault, and it must not read as one: the
    // caller needs the counts to tell the user what was about to be lost. Mapped
    // here rather than per-handler so a guarded write reached through any
    // endpoint -- a calendar sync, a list delete -- answers the same way.
    if (error instanceof DataWriteGuardError) {
      return sendJson(res, 409, { error: error.message, code: "data-write-guard", ...error.details });
    }
    sendJson(res, 500, { error: error.message || "Server error" });
  }
}

async function saveEntry(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const entry = payload.entry;
  if (!entry || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date || "")) {
    return sendJson(res, 400, { error: "Invalid entry date" });
  }
  const entryPath = path.join(entriesDir, `${entry.date}.json`);
  const exportPath = path.join(exportsDir, `${entry.date}.md`);
  const expectedRevision = Number(payload.expectedRevision);
  if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
    return sendJson(res, 428, { error: "Entry revision is required. Reload the app before saving." });
  }
  const currentEntry = await readEntryFile(entry.date);
  const currentRevision = entryRevision(currentEntry);
  if (expectedRevision !== currentRevision) {
    await archiveEntry(entryConflictsDir, entry.date, entry, `stale-r${expectedRevision}`, 50);
    return sendJson(res, 409, {
      error: "This entry changed in another window. The newer disk copy was kept and this attempted save was archived.",
      entry: currentEntry,
      revision: currentRevision
    });
  }
  ensureTaskState(entry);
  // Both of these diff the incoming entry against the copy already on disk, which
  // saveEntry has had to read anyway for the revision check. Doing it here rather
  // than in app.js is deliberate: the app saves continuously and would have to
  // thread "why did this change" through every edit path, whereas the two
  // versions sitting side by side say it for free.
  stampSurveyActivity(entry, currentEntry);
  const rescheduleEvents = diffTaskSchedules(entry, currentEntry);
  await archiveEntryHistory(currentEntry, entry, currentRevision);
  entry._revision = currentRevision + 1;
  entry._savedAt = new Date().toISOString();
  await writeJsonAtomic(entryPath, entry);
  if (rescheduleEvents.length) await queueTaskLogAppend(rescheduleEvents);
  // Filling in a survey is the check. Booking it here rather than in app.js is
  // what makes it true of the phone capture views and the HUD as well, and it
  // has to run after the write or the evidence read would see the old entry.
  await settleEvidenceGoals(entry.date);
  if (payload.customChoices) {
    await writeDataFile(customChoicesPath, payload.customChoices);
  }
  if (payload.exports && typeof payload.exports.markdown === "string") {
    await fs.writeFile(exportPath, payload.exports.markdown, "utf8");
  }
  sendJson(res, 200, {
    ok: true,
    entryPath,
    exportPath: payload.exports ? exportPath : null,
    revision: entry._revision,
    savedAt: entry._savedAt,
    entry
  });
}

// A survey has no submit button -- it is edited straight into the entry and saved
// continuously -- so "when did I finish the night survey?" has to be inferred
// rather than asked for. Every save that actually changed a survey answer moves
// `lastEditedAt`; the last one to land inside the day's own window becomes
// `finishedAt`. Revisiting a week-old entry updates lastEditedAt and editCount
// but leaves finishedAt alone, so it keeps meaning "when I filled this in", not
// "when I last touched the file".
//
// Prior values are read from the disk copy, never from the incoming entry: a
// browser tab loaded before this field existed would otherwise strip it on its
// next whole-entry save.
function stampSurveyActivity(entry, previousEntry) {
  const now = new Date();
  const nowIso = now.toISOString();
  for (const session of ["morning", "night"]) {
    const incoming = entry[session];
    if (!incoming || typeof incoming !== "object") continue;
    const previous = previousEntry && previousEntry[session] ? previousEntry[session] : null;
    const before = surveyFingerprint(previous);
    const after = surveyFingerprint(incoming);
    const stored = (previous && previous.surveyActivity) || {};
    if (before === after) {
      // Unchanged: carry the stored record forward untouched.
      if (Object.keys(stored).length) incoming.surveyActivity = stored;
      continue;
    }
    const editCount = Number(stored.editCount) || 0;
    incoming.surveyActivity = {
      firstEditedAt: stored.firstEditedAt || nowIso,
      lastEditedAt: nowIso,
      finishedAt: withinJournalDay(now, entry.date) ? nowIso : stored.finishedAt || null,
      editCount: editCount + 1
    };
  }
}

// Answers and their checkboxes, ignoring everything else on the session. The
// journal text lives on the same object and changes constantly; counting it
// would make every keystroke look like survey activity.
function surveyFingerprint(session) {
  if (!session || typeof session !== "object") return "";
  return JSON.stringify([session.survey || {}, session.checked || {}]);
}

// The night survey for a Wednesday is routinely filled in at 01:30 on Thursday,
// so a plain calendar-date comparison would call the most typical case
// out-of-session. The window runs to 06:00 the following morning, comfortably
// past the latest bedtime in the data and comfortably before the earliest
// wake-up.
const JOURNAL_DAY_END_HOUR = 6;

function withinJournalDay(when, date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return false;
  const [year, month, day] = date.split("-").map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day + 1, JOURNAL_DAY_END_HOUR, 0, 0, 0);
  return when >= start && when < end;
}

// A task that gets pushed to tomorrow six times and a task done the same hour
// are indistinguishable once it is over: `dueDate` only holds the latest value
// and `updatedAt` does not say what changed. These rows are the missing history.
// Only the open sections are compared -- a task landing in completed/discarded
// is an ending, not a reschedule, and is already recorded on the task itself.
function diffTaskSchedules(entry, previousEntry) {
  if (!previousEntry) return [];
  const before = openTaskIndex(previousEntry);
  const after = openTaskIndex(entry);
  const events = [];
  const ts = new Date().toISOString();
  for (const [taskId, next] of after) {
    const prior = before.get(taskId);
    if (!prior) continue;
    if (prior.section === next.section && prior.dueDate === next.dueDate) continue;
    events.push({
      id: crypto.randomUUID(),
      ts,
      date: entry.date,
      taskId,
      text: next.text,
      kind: "reschedule",
      fromSection: prior.section,
      toSection: next.section,
      fromDueDate: prior.dueDate,
      toDueDate: next.dueDate
    });
  }
  return events;
}

function openTaskIndex(entry) {
  const index = new Map();
  const tasks = (entry && entry.tasks) || {};
  for (const section of taskSectionKeys) {
    for (const task of Array.isArray(tasks[section]) ? tasks[section] : []) {
      if (!task || !task.id) continue;
      index.set(task.id, {
        section,
        dueDate: String(task.dueDate || ""),
        text: String(task.text || "")
      });
    }
  }
  return index;
}

function queueTaskLogAppend(events) {
  const run = taskLogWriteChain.then(async () => {
    const stored = await readJsonFile(taskLogPath, []);
    const rows = Array.isArray(stored) ? stored : [];
    rows.push(...events);
    await writeJsonFile(taskLogPath, rows);
    return events;
  });
  taskLogWriteChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function getTaskLog(url, res) {
  const stored = await readJsonFile(taskLogPath, []);
  const rows = Array.isArray(stored) ? stored : [];
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";
  const events = rows.filter((row) => (!from || row.date >= from) && (!to || row.date <= to));
  sendJson(res, 200, { events });
}

async function saveSurveyImage(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const date = String(payload.date || "");
  const questionId = String(payload.questionId || "").replace(/[^a-z0-9-]/gi, "").slice(0, 80);
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/=]+)$/i.exec(String(payload.dataUrl || ""));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !questionId || !match) {
    return sendJson(res, 400, { error: "Invalid survey picture" });
  }
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > 4_000_000) {
    return sendJson(res, 413, { error: "Picture is too large" });
  }
  const extension = match[1].toLowerCase() === "image/png" ? "png" : match[1].toLowerCase() === "image/webp" ? "webp" : "jpg";
  const dateDir = path.join(entryMediaDir, date);
  await fs.mkdir(dateDir, { recursive: true });
  const fileName = `${questionId}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${extension}`;
  await fs.writeFile(path.join(dateDir, fileName), buffer);
  sendJson(res, 200, { ok: true, url: `/entries/media/${date}/${fileName}` });
}

/* Attachments for the file, audio and video question types. Kept separate from
   saveSurveyImage() rather than loosening its regex: that one re-encodes and
   caps at 4 MB because it is feeding an <img>, and a voice note needs neither.

   The extension is taken from the declared mime type, never from the uploaded
   file name, and the stored name is rebuilt from the question id. A name that
   arrived over the wire never reaches the filesystem. */
const SURVEY_FILE_EXTENSIONS = {
  "audio/webm": "weba",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "video/webm": "webm",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/csv": "csv",
  "text/markdown": "md",
  "application/json": "json",
  "application/zip": "zip",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx"
};

const SURVEY_FILE_MAX_BYTES = 25_000_000;

async function saveSurveyFile(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const date = String(payload.date || "");
  const questionId = String(payload.questionId || "").replace(/[^a-z0-9-]/gi, "").slice(0, 80);
  // MediaRecorder reports its type with codec parameters attached
  // ("audio/webm;codecs=opus"), so the parameters have to be matched and
  // discarded rather than rejected -- every in-app recording carries them.
  const match = /^data:([a-z0-9.+-]+\/[a-z0-9.+-]+)((?:;[a-z0-9.+="'-]+)*);base64,([a-z0-9+/=]+)$/i.exec(
    String(payload.dataUrl || "")
  );
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !questionId || !match) {
    return sendJson(res, 400, { error: "Invalid attachment" });
  }
  const mimeType = match[1].toLowerCase();
  const extension = SURVEY_FILE_EXTENSIONS[mimeType];
  if (!extension) {
    return sendJson(res, 415, { error: `${mimeType} attachments are not supported` });
  }
  const buffer = Buffer.from(match[3], "base64");
  if (!buffer.length) return sendJson(res, 400, { error: "The attachment was empty" });
  if (buffer.length > SURVEY_FILE_MAX_BYTES) {
    return sendJson(res, 413, { error: "That file is over 25 MB" });
  }
  const dateDir = path.join(entryMediaDir, date);
  await fs.mkdir(dateDir, { recursive: true });
  const fileName = `${questionId}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${extension}`;
  await fs.writeFile(path.join(dateDir, fileName), buffer);
  sendJson(res, 200, { ok: true, url: `/entries/media/${date}/${fileName}` });
}

async function getSettings(res) {
  try {
    const text = await fs.readFile(appSettingsPath, "utf8");
    sendJson(res, 200, JSON.parse(text));
  } catch {
    sendJson(res, 200, {});
  }
}

async function saveSettings(req, res) {
  const body = await readBody(req);
  const settings = JSON.parse(body || "{}");
  await writeDataFile(appSettingsPath, settings);
  sendJson(res, 200, { ok: true, path: appSettingsPath });
}

async function getCalendarEvents(res) {
  let text = null;
  try {
    text = await fs.readFile(calendarEventsPath, "utf8");
  } catch (error) {
    // No file yet is a genuinely empty calendar. Anything else -- a locked file,
    // a bad sector -- is not, and must not be reported as one: the app would
    // render an empty week and then POST that emptiness straight back.
    if (error?.code === "ENOENT") return sendJson(res, 200, { events: [] });
    return sendJson(res, 500, { error: `calendar-events.json could not be read: ${error.message}` });
  }
  try {
    sendJson(res, 200, { events: normalizeCalendarEvents(JSON.parse(text)) });
  } catch (error) {
    sendJson(res, 500, { error: `calendar-events.json is not valid JSON: ${error.message}` });
  }
}

async function saveCalendarEvents(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const events = normalizeCalendarEvents(payload.events || payload);
  // A guard refusal propagates to handleRequest(), which turns it into the 409
  // that postCalendarEvents() in app.js knows how to ask the user about.
  await writeDataFile(calendarEventsPath, events, { force: payload.force === true });
  sendJson(res, 200, { ok: true, path: calendarEventsPath, events });
}

async function getGoogleCalendarStatus(res) {
  const config = await readGoogleCalendarConfig();
  const auth = await readGoogleCalendarAuth();
  sendJson(res, 200, googleCalendarStatus(config, auth));
}

async function saveGoogleCalendarConfig(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const existing = await readGoogleCalendarConfig();
  const clientId = String(payload.clientId || existing.clientId || "").trim();
  const clientSecret = String(payload.clientSecret || existing.clientSecret || "").trim();
  const calendarId = String(payload.calendarId || existing.calendarId || "primary").trim() || "primary";
  const lookbackDays = clampNumber(payload.lookbackDays ?? existing.lookbackDays ?? 30, 0, 365);
  const lookaheadDays = clampNumber(payload.lookaheadDays ?? existing.lookaheadDays ?? 180, 1, 730);
  if (!clientId || !clientSecret) {
    return sendJson(res, 400, { error: "Google OAuth client ID and secret are required." });
  }
  const config = { clientId, clientSecret, calendarId, lookbackDays, lookaheadDays, updatedAt: new Date().toISOString() };
  await writeJsonFile(googleCalendarConfigPath, config);
  sendJson(res, 200, { ok: true, status: googleCalendarStatus(config, await readGoogleCalendarAuth()) });
}

async function connectGoogleCalendar(res) {
  const config = await readGoogleCalendarConfig();
  if (!config.clientId || !config.clientSecret) {
    return sendJson(res, 400, { error: "Save Google OAuth settings first." });
  }
  const auth = await readGoogleCalendarAuth();
  const state = crypto.randomBytes(18).toString("hex");
  await writeJsonFile(googleCalendarAuthPath, {
    ...auth,
    pendingState: state,
    pendingAt: new Date().toISOString()
  });
  const authUrl = new URL(googleAuthEndpoint);
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("redirect_uri", googleCalendarRedirectUri());
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", googleCalendarScope);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("include_granted_scopes", "true");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("state", state);
  sendJson(res, 200, { ok: true, authUrl: authUrl.toString(), redirectUri: googleCalendarRedirectUri() });
}

async function handleGoogleCalendarCallback(url, res) {
  const config = await readGoogleCalendarConfig();
  const auth = await readGoogleCalendarAuth();
  const error = url.searchParams.get("error");
  if (error) return sendGoogleCalendarCallbackPage(res, false, `Google returned: ${error}`);
  if (!config.clientId || !config.clientSecret) {
    return sendGoogleCalendarCallbackPage(res, false, "Google OAuth settings are missing.");
  }
  if (!auth.pendingState || url.searchParams.get("state") !== auth.pendingState) {
    return sendGoogleCalendarCallbackPage(res, false, "OAuth state did not match. Try connecting again.");
  }
  const code = url.searchParams.get("code");
  if (!code) return sendGoogleCalendarCallbackPage(res, false, "No authorization code was returned.");
  try {
    const token = await requestGoogleToken({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: googleCalendarRedirectUri(),
      grant_type: "authorization_code"
    });
    const now = Date.now();
    await writeJsonFile(googleCalendarAuthPath, {
      accessToken: token.access_token,
      refreshToken: token.refresh_token || auth.refreshToken || "",
      tokenType: token.token_type || "Bearer",
      scope: token.scope || googleCalendarScope,
      expiresAt: now + Number(token.expires_in || 3600) * 1000,
      connectedAt: auth.connectedAt || new Date().toISOString(),
      lastConnectedAt: new Date().toISOString(),
      lastSyncAt: auth.lastSyncAt || null,
      // Survives a reconnect on purpose. Losing it would re-arm the push and
      // make the next sync treat every block written since as brand new.
      pushSince: auth.pushSince || ""
    });
    sendGoogleCalendarCallbackPage(res, true, "Google Calendar is connected. You can close this tab.");
  } catch (errorCallback) {
    sendGoogleCalendarCallbackPage(res, false, errorCallback.message || "Could not finish Google Calendar connection.");
  }
}

async function syncGoogleCalendar(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const config = await readGoogleCalendarConfig();
  if (!config.clientId || !config.clientSecret) {
    return sendJson(res, 400, { error: "Save Google OAuth settings first." });
  }
  const accessToken = await googleCalendarAccessToken(config);
  const range = calendarSyncRange(config, payload);
  const calendarId = String(config.calendarId || "primary").trim() || "primary";
  let storedEvents = await readStoredCalendarEvents();

  // Push before pull. The pull has to know which Google events this app just
  // wrote so it can drop them instead of importing our own plan blocks back as
  // a second, provider-owned copy of themselves.
  const push = await pushPlanEventsToGoogle({ calendarId, accessToken, storedEvents, range });
  if (push.changed) storedEvents = push.events;

  const googleEvents = await fetchGoogleCalendarEvents(calendarId, accessToken, range);
  const existingById = new Map(storedEvents.map((event) => [event.id, event]));
  const imported = googleEvents.map((event) => {
    const existing = existingById.get(event.id);
    return normalizeCalendarEvent({
      ...event,
      kind: existing?.kind || event.kind,
      category: existing?.category || event.category,
      color: existing?.category ? categoryColor(existing.category) || event.color : existing?.color || event.color,
      exceptionDates: existing?.exceptionDates || event.exceptionDates
    });
  })
    .filter(Boolean)
    // Our own pushed plan blocks come back down this same pipe. Importing them
    // would put a read-only twin next to every block you can actually edit.
    .filter((event) => !push.pushedIds.has(event.providerId));
  const importedIds = new Set(imported.map((event) => event.id));
  const merged = storedEvents.filter((event) => {
    if (event.source !== "google" || event.calendarId !== calendarId) return true;
    if (importedIds.has(event.id)) return false;
    return !calendarEventOverlapsRange(event, range.timeMin, range.timeMax);
  });
  merged.push(...imported);
  const events = normalizeCalendarEvents(merged);
  await writeStoredCalendarEvents(events);
  const auth = await readGoogleCalendarAuth();
  await writeJsonFile(googleCalendarAuthPath, {
    ...auth,
    lastSyncAt: new Date().toISOString(),
    lastSyncCount: imported.length,
    lastPushed: { at: new Date().toISOString(), created: push.created, updated: push.updated, deleted: push.deleted, failed: push.failed }
  });
  sendJson(res, 200, {
    ok: true,
    events,
    imported: imported.length,
    pushed: { created: push.created, updated: push.updated, deleted: push.deleted, failed: push.failed },
    pushSkipped: push.skipped,
    pushErrors: push.errors.slice(0, 5),
    calendarId,
    timeMin: range.timeMin,
    timeMax: range.timeMax,
    status: googleCalendarStatus(config, await readGoogleCalendarAuth())
  });
}

/* --- Pushing plan blocks up to Google ---------------------------------------

   One direction only, and deliberately narrow: plan blocks, never actuals. The
   calendar on the phone is meant to answer "what am I meant to be doing", and
   1,000-odd logged actuals would bury that. A block becomes eligible the first
   time it is written after the push was switched on (auth.pushSince), so
   turning this on does not bulk-upload years of history; once a block is in the
   ledger it keeps tracking, including out of eligibility -- editing a plan into
   an actual, or archiving it in a re-plan, deletes it from Google.
--------------------------------------------------------------------------- */

// The push is off unless Google actually granted write access. A connection
// made under the old .readonly scope stays readable and answers every POST with
// a 403, so check the grant rather than discovering it one failed block at a
// time.
function googleScopeAllowsWrite(scope) {
  return String(scope || "")
    .split(/\s+/)
    .some((entry) => entry === "https://www.googleapis.com/auth/calendar" || entry === "https://www.googleapis.com/auth/calendar.events");
}

// A plan block, still current, and ours. An imported event is not pushed back to
// the provider it came from, and an archived old plan is not a plan any more.
function isPushablePlanEvent(event) {
  if (!event || event.kind !== "plan") return false;
  if (event.source && event.source !== "local") return false;
  if (event.supersededAt) return false;
  return Boolean(event.title && event.start);
}

async function readGoogleCalendarPushMap() {
  const stored = await readJsonFile(googleCalendarPushPath, {});
  return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
}

async function pushPlanEventsToGoogle({ calendarId, accessToken, storedEvents, range }) {
  const result = {
    created: 0,
    updated: 0,
    deleted: 0,
    failed: 0,
    errors: [],
    skipped: "",
    changed: false,
    events: storedEvents,
    pushedIds: new Set()
  };
  const auth = await readGoogleCalendarAuth();
  if (!googleScopeAllowsWrite(auth.scope)) {
    result.skipped = "reauthorize";
    return result;
  }

  // First sync after switching the push on only arms it. Nothing is eligible
  // yet, because nothing has been written since this instant -- which is what
  // "going forward only" means, and why the stamp is set before the passes run.
  let pushSince = auth.pushSince || "";
  if (!pushSince) {
    pushSince = new Date().toISOString();
    await writeJsonFile(googleCalendarAuthPath, { ...auth, pushSince });
  }

  const pushMap = await readGoogleCalendarPushMap();
  const byId = new Map(storedEvents.map((event) => [event.id, event]));
  const nextEvents = new Map(storedEvents.map((event) => [event.id, event]));
  let mapChanged = false;

  // Pass 1 -- withdraw. A block that was pushed and is no longer a live plan
  // block (deleted, archived, turned into an actual) has to come off Google too.
  for (const [localId, record] of Object.entries(pushMap)) {
    const event = byId.get(localId);
    if (event && isPushablePlanEvent(event) && record.calendarId === calendarId) continue;
    if (record.calendarId !== calendarId) continue;
    const removed = await deleteGoogleCalendarEvent(calendarId, accessToken, record.googleEventId, result);
    if (!removed) continue;
    result.deleted += 1;
    delete pushMap[localId];
    mapChanged = true;
  }

  // Pass 2 -- create and update, oldest first so a truncated run leaves the
  // near future done rather than a random scatter.
  const candidates = storedEvents
    .filter(isPushablePlanEvent)
    .filter((event) => {
      const record = pushMap[event.id];
      if (record && record.calendarId === calendarId) return record.updatedAt !== event.updatedAt;
      // A brand-new push is gated on both when the block was written and where
      // it sits: a mass edit of last year's calendar should not upload it.
      return String(event.updatedAt || "") >= pushSince && calendarEventOverlapsRange(event, range.timeMin, range.timeMax);
    })
    .sort((a, b) => a.start.localeCompare(b.start));

  // Google's per-minute write quota is the real ceiling here; a run that would
  // blow through it finishes next sync instead of failing halfway.
  const budget = 200;
  for (const event of candidates.slice(0, budget)) {
    const record = pushMap[event.id];
    const body = googleEventFromPlanEvent(event, calendarId);
    try {
      let googleEventId = record?.googleEventId || "";
      if (googleEventId) {
        const patched = await googleCalendarWrite("PUT", `${googleCalendarApiBase}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleEventId)}`, accessToken, body);
        // 404/410: the event was deleted on Google's side. Re-create rather than
        // leaving a ledger row pointing at nothing.
        if (patched === null) googleEventId = "";
        else result.updated += 1;
      }
      if (!googleEventId) {
        const created = await googleCalendarWrite("POST", `${googleCalendarApiBase}/calendars/${encodeURIComponent(calendarId)}/events`, accessToken, body);
        if (!created?.id) throw new Error("Google did not return an event id.");
        googleEventId = created.id;
        result.created += 1;
      }
      pushMap[event.id] = { googleEventId, updatedAt: event.updatedAt, calendarId };
      mapChanged = true;
      nextEvents.set(event.id, { ...event, googleEventId });
      result.changed = true;
    } catch (error) {
      result.failed += 1;
      if (result.errors.length < 5) result.errors.push(`${event.title}: ${error.message}`);
    }
  }
  if (candidates.length > budget) {
    result.errors.push(`${candidates.length - budget} more blocks are queued for the next sync.`);
  }

  for (const record of Object.values(pushMap)) {
    if (record.calendarId === calendarId) result.pushedIds.add(record.googleEventId);
  }
  if (mapChanged) await writeJsonFile(googleCalendarPushPath, pushMap);
  if (result.changed) result.events = [...nextEvents.values()];
  return result;
}

// Returns the parsed body, or null when the target is already gone. Everything
// else throws, so one bad block cannot look like a successful push.
async function googleCalendarWrite(method, url, accessToken, body) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (response.status === 404 || response.status === 410) return null;
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.error?.message || `Google Calendar write failed (${response.status})`);
  }
  return data;
}

async function deleteGoogleCalendarEvent(calendarId, accessToken, googleEventId, result) {
  if (!googleEventId) return true;
  const url = `${googleCalendarApiBase}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleEventId)}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  // Already gone counts as done; the ledger row is what we are really clearing.
  if (response.ok || response.status === 404 || response.status === 410) return true;
  result.failed += 1;
  if (result.errors.length < 5) result.errors.push(`Could not remove an event from Google (${response.status}).`);
  return false;
}

function googleEventFromPlanEvent(event, calendarId) {
  // A floating block means "this machine's clock", which is exactly what the
  // calendar shows it as; a pegged one carries the zone it was written in.
  const zone = event.tz || event.zone || currentTimeZone();
  const description = [event.notes, event.link].map((part) => String(part || "").trim()).filter(Boolean).join("\n\n");
  const body = {
    summary: event.title,
    description,
    location: String(event.location || ""),
    // A tentative block is an FYI: it should not make you look busy.
    status: event.tentative ? "tentative" : "confirmed",
    transparency: event.tentative ? "transparent" : "opaque",
    // Belt and braces alongside the ledger: if the ledger is ever lost, these
    // still say which app owns the event and which local block it came from.
    extendedProperties: { private: { journalAppEventId: event.id, journalAppCalendarId: calendarId } }
  };
  if (event.allDay) {
    const startDate = event.start.slice(0, 10);
    // Google's all-day end is exclusive; a one-day block ends the next morning.
    body.start = { date: startDate };
    body.end = { date: addCalendarDays(String(event.end || event.start).slice(0, 10) || startDate, 1) };
  } else {
    body.start = { dateTime: `${event.start}:00`, timeZone: zone };
    // The rare block that is itself a move lands in the zone it lands in.
    body.end = {
      dateTime: `${event.end || event.start}:00`,
      timeZone: event.zoneShift?.to && isValidTimeZone(event.zoneShift.to) ? event.zoneShift.to : zone
    };
  }
  const recurrence = googleRecurrenceRules(event, zone);
  if (recurrence.length) body.recurrence = recurrence;
  return body;
}

function addCalendarDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function googleRecurrenceRules(event, zone) {
  const dayCodes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  let rule = "";
  if (event.recurrence === "daily") rule = "RRULE:FREQ=DAILY";
  else if (event.recurrence === "weekly") {
    rule = "RRULE:FREQ=WEEKLY";
    // repeatDays is getDay() order, 0 = Sunday, same as dayCodes above.
    if (event.repeatDays?.length) rule += `;BYDAY=${event.repeatDays.map((day) => dayCodes[day]).filter(Boolean).join(",")}`;
  } else if (event.recurrence === "monthly") rule = "RRULE:FREQ=MONTHLY";
  else return [];
  if (event.recurrenceEndDate) rule += `;UNTIL=${event.recurrenceEndDate.replace(/-/g, "")}T235959Z`;
  const rules = [rule];
  if (event.exceptionDates?.length) {
    // A skipped occurrence is named by its own start, not by midnight, so the
    // time of day has to be carried over or Google ignores the exception.
    const time = String(event.start || "").slice(11, 16).replace(":", "");
    rules.push(event.allDay
      ? `EXDATE;VALUE=DATE:${event.exceptionDates.map((date) => date.replace(/-/g, "")).join(",")}`
      : `EXDATE;TZID=${zone}:${event.exceptionDates.map((date) => `${date.replace(/-/g, "")}T${time || "0000"}00`).join(",")}`);
  }
  return rules;
}

async function disconnectGoogleCalendar(res) {
  try {
    await fs.rm(googleCalendarAuthPath, { force: true });
    // The ledger goes with the token. Keeping it would make a later reconnect
    // try to PUT blocks under ids from an account it may no longer be signed
    // into, and every one of those is a 404 that re-creates a duplicate.
    await fs.rm(googleCalendarPushPath, { force: true });
  } catch {
    // The auth file is optional.
  }
  sendJson(res, 200, { ok: true, status: googleCalendarStatus(await readGoogleCalendarConfig(), {}) });
}

async function getOutlookCalendarStatus(res) {
  const config = await readOutlookCalendarConfig();
  const auth = await readOutlookCalendarAuth();
  sendJson(res, 200, outlookCalendarStatus(config, auth));
}

async function saveOutlookCalendarConfig(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const existing = await readOutlookCalendarConfig();
  const clientId = String(payload.clientId || existing.clientId || "").trim();
  const clientSecret = String(payload.clientSecret || existing.clientSecret || "").trim();
  const tenant = String(payload.tenant || existing.tenant || "common").trim() || "common";
  const calendarId = String(payload.calendarId || existing.calendarId || "primary").trim() || "primary";
  const lookbackDays = clampNumber(payload.lookbackDays ?? existing.lookbackDays ?? 30, 0, 365);
  const lookaheadDays = clampNumber(payload.lookaheadDays ?? existing.lookaheadDays ?? 180, 1, 730);
  if (!clientId || !clientSecret) {
    return sendJson(res, 400, { error: "Microsoft application (client) ID and client secret are required." });
  }
  const config = { clientId, clientSecret, tenant, calendarId, lookbackDays, lookaheadDays, updatedAt: new Date().toISOString() };
  await writeJsonFile(outlookCalendarConfigPath, config);
  sendJson(res, 200, { ok: true, status: outlookCalendarStatus(config, await readOutlookCalendarAuth()) });
}

async function connectOutlookCalendar(res) {
  const config = await readOutlookCalendarConfig();
  if (!config.clientId || !config.clientSecret) {
    return sendJson(res, 400, { error: "Save Outlook OAuth settings first." });
  }
  const auth = await readOutlookCalendarAuth();
  const state = crypto.randomBytes(18).toString("hex");
  await writeJsonFile(outlookCalendarAuthPath, {
    ...auth,
    pendingState: state,
    pendingAt: new Date().toISOString()
  });
  const authUrl = new URL(outlookAuthEndpoint(config));
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("redirect_uri", outlookCalendarRedirectUri());
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("response_mode", "query");
  authUrl.searchParams.set("scope", outlookCalendarScope);
  authUrl.searchParams.set("prompt", "select_account");
  authUrl.searchParams.set("state", state);
  sendJson(res, 200, { ok: true, authUrl: authUrl.toString(), redirectUri: outlookCalendarRedirectUri() });
}

async function handleOutlookCalendarCallback(url, res) {
  const config = await readOutlookCalendarConfig();
  const auth = await readOutlookCalendarAuth();
  const error = url.searchParams.get("error");
  if (error) {
    const description = url.searchParams.get("error_description") || "";
    return sendOutlookCalendarCallbackPage(res, false, `Microsoft returned: ${error}${description ? ` — ${description}` : ""}`);
  }
  if (!config.clientId || !config.clientSecret) {
    return sendOutlookCalendarCallbackPage(res, false, "Outlook OAuth settings are missing.");
  }
  if (!auth.pendingState || url.searchParams.get("state") !== auth.pendingState) {
    return sendOutlookCalendarCallbackPage(res, false, "OAuth state did not match. Try connecting again.");
  }
  const code = url.searchParams.get("code");
  if (!code) return sendOutlookCalendarCallbackPage(res, false, "No authorization code was returned.");
  try {
    const token = await requestOutlookToken(config, {
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: outlookCalendarRedirectUri(),
      grant_type: "authorization_code",
      scope: outlookCalendarScope
    });
    const now = Date.now();
    await writeJsonFile(outlookCalendarAuthPath, {
      accessToken: token.access_token,
      refreshToken: token.refresh_token || auth.refreshToken || "",
      tokenType: token.token_type || "Bearer",
      scope: token.scope || outlookCalendarScope,
      expiresAt: now + Number(token.expires_in || 3600) * 1000,
      connectedAt: auth.connectedAt || new Date().toISOString(),
      lastConnectedAt: new Date().toISOString(),
      lastSyncAt: auth.lastSyncAt || null
    });
    sendOutlookCalendarCallbackPage(res, true, "Outlook Calendar is connected. You can close this tab.");
  } catch (errorCallback) {
    sendOutlookCalendarCallbackPage(res, false, errorCallback.message || "Could not finish Outlook Calendar connection.");
  }
}

async function syncOutlookCalendar(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const config = await readOutlookCalendarConfig();
  if (!config.clientId || !config.clientSecret) {
    return sendJson(res, 400, { error: "Save Outlook OAuth settings first." });
  }
  const accessToken = await outlookCalendarAccessToken(config);
  const range = calendarSyncRange(config, payload);
  const calendarId = String(config.calendarId || "primary").trim() || "primary";
  const outlookEvents = await fetchOutlookCalendarEvents(calendarId, accessToken, range);
  const storedEvents = await readStoredCalendarEvents();
  const existingById = new Map(storedEvents.map((event) => [event.id, event]));
  const imported = outlookEvents.map((event) => {
    const existing = existingById.get(event.id);
    return normalizeCalendarEvent({
      ...event,
      kind: existing?.kind || event.kind,
      category: existing?.category || event.category,
      color: existing?.category ? categoryColor(existing.category) || event.color : existing?.color || event.color,
      exceptionDates: existing?.exceptionDates || event.exceptionDates
    });
  }).filter(Boolean);
  const importedIds = new Set(imported.map((event) => event.id));
  const merged = storedEvents.filter((event) => {
    if (event.source !== "outlook" || event.calendarId !== calendarId) return true;
    if (importedIds.has(event.id)) return false;
    return !calendarEventOverlapsRange(event, range.timeMin, range.timeMax);
  });
  merged.push(...imported);
  const events = normalizeCalendarEvents(merged);
  await writeStoredCalendarEvents(events);
  const auth = await readOutlookCalendarAuth();
  await writeJsonFile(outlookCalendarAuthPath, {
    ...auth,
    lastSyncAt: new Date().toISOString(),
    lastSyncCount: imported.length
  });
  sendJson(res, 200, {
    ok: true,
    events,
    imported: imported.length,
    calendarId,
    timeMin: range.timeMin,
    timeMax: range.timeMax,
    status: outlookCalendarStatus(config, await readOutlookCalendarAuth())
  });
}

async function disconnectOutlookCalendar(res) {
  try {
    await fs.rm(outlookCalendarAuthPath, { force: true });
  } catch {
    // The auth file is optional.
  }
  sendJson(res, 200, { ok: true, status: outlookCalendarStatus(await readOutlookCalendarConfig(), {}) });
}

/* --- Spotify listening log ----------------------------------------------------

   Logs what Spotify says was played, into spotify-listens.json. Same OAuth shape
   as the calendars (own client id + secret, tokens only on this machine), but
   the sync is a server-side timer rather than a button: Spotify's
   recently-played endpoint returns at most the last 50 plays and nothing older,
   so a poll that waits for the app to be open loses every long session it
   missed. Ten minutes is well inside the ~2.5 hours that 50 three-minute tracks
   last.

   Rows are keyed by playedAt + trackId. Spotify reports a play once the track
   ends (or after 30 seconds), stamped with when it started, and the same play
   comes back on every poll until it ages out of the 50, so the merge has to be
   idempotent. The `after` cursor is only an optimisation on top of that.

   Failures never throw out of the timer: they land in spotify-auth.json as
   lastError, and a rejected refresh token parks the poller (needsReconnect)
   instead of hammering the token endpoint every ten minutes until someone
   notices. */

const spotifyScope = "user-read-recently-played user-read-currently-playing";
const spotifyAuthEndpoint = "https://accounts.spotify.com/authorize";
const spotifyTokenEndpoint = "https://accounts.spotify.com/api/token";
const spotifyApiBase = "https://api.spotify.com/v1";
const SPOTIFY_POLL_MS = 10 * 60 * 1000;
let spotifySyncInFlight = null;

async function readSpotifyConfig() {
  return await readJsonFile(spotifyConfigPath, {});
}

async function readSpotifyAuth() {
  return await readJsonFile(spotifyAuthPath, {});
}

async function readSpotifyListens() {
  const stored = await readJsonFile(spotifyListensPath, []);
  return Array.isArray(stored) ? stored : [];
}

function spotifyRedirectUri() {
  // Spotify refuses "localhost" in a redirect URI; the loopback IP is required.
  return `http://127.0.0.1:${port}/api/spotify/oauth/callback`;
}

function spotifyStatus(config, auth, extra = {}) {
  return {
    configured: Boolean(config?.clientId && config?.clientSecret),
    connected: Boolean(auth?.refreshToken),
    needsReconnect: Boolean(auth?.needsReconnect),
    clientId: config?.clientId ? maskGoogleClientId(config.clientId) : "",
    redirectUri: spotifyRedirectUri(),
    scope: spotifyScope,
    pollMinutes: SPOTIFY_POLL_MS / 60_000,
    connectedAt: auth?.connectedAt || null,
    lastSyncAt: auth?.lastSyncAt || null,
    lastSyncCount: Number.isFinite(auth?.lastSyncCount) ? auth.lastSyncCount : null,
    lastError: auth?.lastError || null,
    lastErrorAt: auth?.lastErrorAt || null,
    nowPlaying: auth?.nowPlaying || null,
    ...extra
  };
}

async function getSpotifyStatus(res) {
  const [config, auth, listens] = await Promise.all([readSpotifyConfig(), readSpotifyAuth(), readSpotifyListens()]);
  sendJson(res, 200, spotifyStatus(config, auth, {
    totalListens: listens.length,
    recent: listens.slice(-8).reverse()
  }));
}

async function saveSpotifyConfig(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const existing = await readSpotifyConfig();
  const clientId = String(payload.clientId || existing.clientId || "").trim();
  const clientSecret = String(payload.clientSecret || existing.clientSecret || "").trim();
  if (!clientId || !clientSecret) {
    return sendJson(res, 400, { error: "Spotify client ID and secret are required." });
  }
  const config = { clientId, clientSecret, updatedAt: new Date().toISOString() };
  await writeJsonFile(spotifyConfigPath, config);
  sendJson(res, 200, { ok: true, status: spotifyStatus(config, await readSpotifyAuth()) });
}

async function connectSpotify(res) {
  const config = await readSpotifyConfig();
  if (!config.clientId || !config.clientSecret) {
    return sendJson(res, 400, { error: "Save Spotify settings first." });
  }
  const auth = await readSpotifyAuth();
  const state = crypto.randomBytes(18).toString("hex");
  await writeJsonFile(spotifyAuthPath, { ...auth, pendingState: state, pendingAt: new Date().toISOString() });
  const authUrl = new URL(spotifyAuthEndpoint);
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", spotifyRedirectUri());
  authUrl.searchParams.set("scope", spotifyScope);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("show_dialog", "true");
  sendJson(res, 200, { ok: true, authUrl: authUrl.toString(), redirectUri: spotifyRedirectUri() });
}

async function handleSpotifyCallback(url, res) {
  const config = await readSpotifyConfig();
  const auth = await readSpotifyAuth();
  const error = url.searchParams.get("error");
  if (error) return sendCalendarCallbackPage(res, false, `Spotify returned: ${error}`, "Spotify");
  if (!config.clientId || !config.clientSecret) {
    return sendCalendarCallbackPage(res, false, "Spotify settings are missing.", "Spotify");
  }
  if (!auth.pendingState || url.searchParams.get("state") !== auth.pendingState) {
    return sendCalendarCallbackPage(res, false, "OAuth state did not match. Try connecting again.", "Spotify");
  }
  const code = url.searchParams.get("code");
  if (!code) return sendCalendarCallbackPage(res, false, "No authorization code was returned.", "Spotify");
  try {
    const token = await requestSpotifyToken(config, {
      grant_type: "authorization_code",
      code,
      redirect_uri: spotifyRedirectUri()
    });
    await writeJsonFile(spotifyAuthPath, {
      accessToken: token.access_token,
      refreshToken: token.refresh_token || auth.refreshToken || "",
      tokenType: token.token_type || "Bearer",
      scope: token.scope || spotifyScope,
      expiresAt: Date.now() + Number(token.expires_in || 3600) * 1000,
      connectedAt: auth.connectedAt || new Date().toISOString(),
      lastConnectedAt: new Date().toISOString(),
      lastSyncAt: auth.lastSyncAt || null,
      lastSyncCount: auth.lastSyncCount ?? null,
      needsReconnect: false,
      lastError: null
    });
    sendCalendarCallbackPage(res, true, "Spotify is connected. Plays will be logged every 10 minutes while the journal server is running. You can close this tab.", "Spotify");
    // First pull straight away, so the panel has something to show.
    syncSpotifyListens().catch(() => undefined);
  } catch (errorCallback) {
    sendCalendarCallbackPage(res, false, errorCallback.message || "Could not finish Spotify connection.", "Spotify");
  }
}

async function requestSpotifyToken(config, params) {
  // Spotify wants the client credentials as HTTP Basic, not form fields.
  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const response = await fetch(spotifyTokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`
    },
    body: new URLSearchParams(params)
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!response.ok) {
    if (data.error === "invalid_grant") {
      const wrapped = new Error("Spotify rejected the saved sign-in (invalid_grant) -- connect the account again.");
      wrapped.code = "invalid_grant";
      throw wrapped;
    }
    throw new Error(data.error_description || data.error || `Spotify token request failed (${response.status})`);
  }
  return data;
}

async function spotifyAccessToken(config) {
  const auth = await readSpotifyAuth();
  if (auth.accessToken && Number(auth.expiresAt || 0) > Date.now() + 60_000) return auth.accessToken;
  if (!auth.refreshToken) throw new Error("Spotify is not connected.");
  const token = await requestSpotifyToken(config, { grant_type: "refresh_token", refresh_token: auth.refreshToken });
  const nextAuth = {
    ...auth,
    accessToken: token.access_token,
    // Spotify rotates the refresh token only sometimes; keep the old one when
    // the response carries none.
    refreshToken: token.refresh_token || auth.refreshToken,
    tokenType: token.token_type || auth.tokenType || "Bearer",
    scope: token.scope || auth.scope || spotifyScope,
    expiresAt: Date.now() + Number(token.expires_in || 3600) * 1000
  };
  await writeJsonFile(spotifyAuthPath, nextAuth);
  return nextAuth.accessToken;
}

async function spotifyApiGet(accessToken, pathname, params = {}) {
  const url = new URL(`${spotifyApiBase}${pathname}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (response.status === 204) return null;
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!response.ok) {
    const retry = response.headers.get("retry-after");
    const message = data?.error?.message || `Spotify API ${pathname} failed (${response.status})`;
    throw new Error(response.status === 429 && retry ? `${message}; retry after ${retry}s` : message);
  }
  return data;
}

// One row per play. Everything the analysis is likely to want is flattened so
// nobody has to walk Spotify's nested item shape later; uri/url stay so the
// track can be reopened.
function spotifyListenFromItem(item, loggedAt) {
  const track = item?.track || {};
  const playedAt = String(item?.played_at || "");
  const trackId = String(track.id || track.uri || "");
  if (!playedAt || !trackId) return null;
  const artists = Array.isArray(track.artists) ? track.artists : [];
  const images = Array.isArray(track.album?.images) ? track.album.images : [];
  return {
    id: `${playedAt}:${trackId}`,
    playedAt,
    loggedAt,
    trackId,
    track: String(track.name || ""),
    artists: artists.map((artist) => String(artist?.name || "")).filter(Boolean),
    artistIds: artists.map((artist) => String(artist?.id || "")).filter(Boolean),
    album: String(track.album?.name || ""),
    albumId: String(track.album?.id || ""),
    albumArt: images.length ? String(images[images.length - 1]?.url || "") : "",
    durationMs: Number(track.duration_ms || 0),
    explicit: Boolean(track.explicit),
    uri: String(track.uri || ""),
    url: String(track.external_urls?.spotify || ""),
    contextType: String(item?.context?.type || ""),
    contextUri: String(item?.context?.uri || "")
  };
}

// Idempotent merge, sorted by playedAt. Returns the rows that were new so the
// caller can count them; existing rows are never touched.
function mergeSpotifyListens(existing, incoming) {
  const seen = new Set(existing.map((row) => row.id));
  const added = [];
  for (const row of incoming) {
    if (!row || seen.has(row.id)) continue;
    seen.add(row.id);
    added.push(row);
  }
  if (!added.length) return { listens: existing, added };
  const listens = [...existing, ...added].sort((a, b) => a.playedAt.localeCompare(b.playedAt));
  return { listens, added };
}

function spotifyNowPlayingFromResponse(data) {
  if (!data || !data.item || data.currently_playing_type !== "track") return null;
  const row = spotifyListenFromItem({ track: data.item, played_at: new Date().toISOString(), context: data.context }, "");
  if (!row) return null;
  return {
    track: row.track,
    artists: row.artists,
    album: row.album,
    uri: row.uri,
    url: row.url,
    isPlaying: Boolean(data.is_playing),
    progressMs: Number(data.progress_ms || 0),
    durationMs: row.durationMs,
    seenAt: new Date().toISOString()
  };
}

// Only one pull at a time. A manual "Fetch now" landing while the timer's pull
// is mid-flight joins it rather than racing it for the same file.
function syncSpotifyListens() {
  if (spotifySyncInFlight) return spotifySyncInFlight;
  spotifySyncInFlight = runSpotifySync().finally(() => {
    spotifySyncInFlight = null;
  });
  return spotifySyncInFlight;
}

async function runSpotifySync() {
  const config = await readSpotifyConfig();
  const auth = await readSpotifyAuth();
  if (!config.clientId || !config.clientSecret) throw new Error("Save Spotify settings first.");
  if (!auth.refreshToken) throw new Error("Spotify is not connected.");
  if (auth.needsReconnect) throw new Error("Spotify needs to be connected again before it can sync.");
  try {
    const accessToken = await spotifyAccessToken(config);
    const existing = await readSpotifyListens();
    const last = existing.length ? existing[existing.length - 1] : null;
    const afterMs = last ? Date.parse(last.playedAt) : NaN;
    const params = { limit: 50 };
    if (Number.isFinite(afterMs)) params.after = afterMs;
    const recent = await spotifyApiGet(accessToken, "/me/player/recently-played", params);
    const loggedAt = new Date().toISOString();
    const incoming = (recent?.items || []).map((item) => spotifyListenFromItem(item, loggedAt));
    const { listens, added } = mergeSpotifyListens(existing, incoming);
    if (added.length) await writeDataFile(spotifyListensPath, listens);

    let nowPlaying = null;
    try {
      nowPlaying = spotifyNowPlayingFromResponse(await spotifyApiGet(accessToken, "/me/player/currently-playing"));
    } catch {
      // Cosmetic; the log is what matters.
    }
    const latest = await readSpotifyAuth();
    await writeJsonFile(spotifyAuthPath, {
      ...latest,
      lastSyncAt: loggedAt,
      lastSyncCount: added.length,
      lastError: null,
      lastErrorAt: null,
      nowPlaying
    });
    return { added: added.length, total: listens.length, nowPlaying };
  } catch (error) {
    const latest = await readSpotifyAuth();
    await writeJsonFile(spotifyAuthPath, {
      ...latest,
      lastError: error.message || String(error),
      lastErrorAt: new Date().toISOString(),
      needsReconnect: latest.needsReconnect || error.code === "invalid_grant"
    }).catch(() => undefined);
    throw error;
  }
}

async function syncSpotifyNow(res) {
  try {
    const result = await syncSpotifyListens();
    sendJson(res, 200, { ok: true, ...result, status: spotifyStatus(await readSpotifyConfig(), await readSpotifyAuth()) });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Spotify sync failed." });
  }
}

async function disconnectSpotify(res) {
  try {
    await fs.rm(spotifyAuthPath, { force: true });
  } catch {
    // The auth file is optional.
  }
  // The listens stay: they are the history, and a reconnect carries straight on.
  sendJson(res, 200, { ok: true, status: spotifyStatus(await readSpotifyConfig(), {}) });
}

// ?date=YYYY-MM-DD picks the plays that started on that local day (server
// clock), or ?from=<iso>&to=<iso> an explicit window. Newest first, capped.
async function getSpotifyListens(url, res) {
  const listens = await readSpotifyListens();
  const date = url.searchParams.get("date");
  let from = Date.parse(url.searchParams.get("from") || "");
  let to = Date.parse(url.searchParams.get("to") || "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
    const [y, m, d] = date.split("-").map(Number);
    from = new Date(y, m - 1, d).getTime();
    to = new Date(y, m - 1, d + 1).getTime();
  }
  const limit = clampNumber(url.searchParams.get("limit") || 500, 1, 5000);
  const rows = listens.filter((row) => {
    const at = Date.parse(row.playedAt);
    if (Number.isFinite(from) && at < from) return false;
    if (Number.isFinite(to) && at >= to) return false;
    return true;
  });
  sendJson(res, 200, { listens: rows.slice(-limit).reverse(), total: listens.length });
}

function startSpotifyPoller() {
  const tick = () => {
    readSpotifyAuth().then((auth) => {
      if (!auth.refreshToken || auth.needsReconnect) return;
      return syncSpotifyListens();
    }).catch((error) => {
      console.log(`Spotify sync failed: ${error.message || error}`);
    });
  };
  tick();
  setInterval(tick, SPOTIFY_POLL_MS).unref();
}

async function getTasks(url, res) {
  const date = validDateOrToday(url.searchParams.get("date"));
  await migrateDatedTasks();
  const entry = await readEntry(date);
  ensureMistakeState(entry);
  // Mistakes ride along with tasks so the client never adopts a revision without
  // the mistakes that revision contains. The fingerprint covers everything this
  // payload does not carry, so the client can tell whether the revision also
  // contains a change it cannot see. See syncTasksFromDisk in app.js.
  sendJson(res, 200, {
    date,
    tasks: entry.tasks,
    mistakes: entry.mistakes,
    revision: entryRevision(entry),
    savedAt: entry._savedAt || null,
    restFingerprint: entrySyncFingerprint(entry)
  });
}

async function getMistakes(url, res) {
  const date = validDateOrToday(url.searchParams.get("date"));
  const entry = await readEntry(date);
  ensureMistakeState(entry);
  sendJson(res, 200, { date, mistakes: entry.mistakes, revision: entryRevision(entry), savedAt: entry._savedAt || null });
}

// Append-only capture endpoint used by the Ctrl+Alt+W window. Only "what" is
// required; the outcome (good call / bad call) and the reflective columns are
// normally filled in later in the app. The endpoint and the entry key kept
// their "mistakes" name when the log went neutral on 2026-09-10 so that no
// entry on disk and no queued offline capture had to be rewritten.
async function addMistake(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  // A capture queued offline carries the id it was queued under. Answering a
  // replay of one already stored with ok/duplicate is what lets the capture
  // windows queue a POST that timed out without risking a second row.
  const captureId = String(payload.captureId || "");
  if (await captureAlreadyStored(captureId)) return sendJson(res, 200, { ok: true, duplicate: true });
  const what = String(payload.what || "").trim();
  if (!what) return sendJson(res, 400, { error: "A lesson needs at least 'what'" });
  const date = validDateOrToday(payload.date);
  const entry = await readEntry(date);
  ensureMistakeState(entry);
  // Two different clocks, and conflating them is what made the old `time` string
  // useless for analysis: `loggedAt` is when the row was typed, `ts` is when the
  // mistake actually happened. They match for the common case (capture it as it
  // happens), but a mistake logged three days late has an honest ts of null
  // rather than a timestamp that would land it in the wrong hour bucket.
  const now = new Date();
  const loggedAt = now.toISOString();
  const happenedToday = payload.happenedToday !== false;
  const mistake = {
    id: `mistake-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    time: payload.time ? String(payload.time) : happenedToday ? formatClockTime(now) : "",
    ts: happenedToday ? loggedAt : null,
    loggedAt,
    what,
    problem: String(payload.problem || "").trim(),
    why: String(payload.why || "").trim(),
    alternative: String(payload.alternative || "").trim(),
    nextTime: String(payload.nextTime || "").trim(),
    // "good" | "bad" | "" -- "" is captured-but-not-judged. Written explicitly
    // every time: a row with the key missing is read by the client as a legacy
    // pre-neutral row, i.e. a mistake.
    outcome: payload.outcome === "good" || payload.outcome === "bad" ? payload.outcome : "",
    // Always empty from here. Tagging the pattern is reflection work done later
    // in the app; the capture window stays one field. See MISTAKE_TAGS in app.js.
    tags: []
  };
  entry.mistakes.push(mistake);
  await writeEntry(entry);
  await rememberCaptureId(captureId);
  sendJson(res, 200, { ok: true, date, mistake, count: entry.mistakes.length, revision: entryRevision(entry) });
}

function ensureMistakeState(entry) {
  if (!Array.isArray(entry.mistakes)) entry.mistakes = [];
}

function formatClockTime(date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// Eye rest sessions (Ctrl+Alt+E, eyerest-capture.ps1) write two things: an
// "actual" category-H calendar event so the rest shows up alongside everything
// else on the day, and an append-only row in eyerest-log.json for trend
// analysis without cluttering the calendar/entry UI. The real elapsed time
// (endedAt - startedAt) is what gets logged, independent of whatever countdown
// length the window happened to be showing.
let calendarEventsWriteChain = Promise.resolve();
let eyeRestLogWriteChain = Promise.resolve();
let hudLogWriteChain = Promise.resolve();
let taskLogWriteChain = Promise.resolve();
let appLogWriteChain = Promise.resolve();

// Must stay identical to the checkbox label in eyerest-capture.ps1 - it is what
// tells the server a session's minutes were blind journaling.
const BLIND_JOURNALING_LABEL = "Blind journaling";

async function addEyeRest(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  // A capture queued offline carries the id it was queued under. Answering a
  // replay of one already stored with ok/duplicate is what lets the capture
  // windows queue a POST that timed out without risking a second row.
  const captureId = String(payload.captureId || "");
  if (await captureAlreadyStored(captureId)) return sendJson(res, 200, { ok: true, duplicate: true });
  const startedAt = new Date(payload.startedAt);
  const endedAt = new Date(payload.endedAt);
  if (Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime()) || endedAt <= startedAt) {
    return sendJson(res, 400, { error: "Invalid startedAt/endedAt" });
  }
  const restTypes = Array.isArray(payload.restTypes)
    ? payload.restTypes.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const note = String(payload.note || "").trim();
  const notes = [...restTypes, note].filter(Boolean).join("; ");
  const durationSeconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);

  const event = normalizeCalendarEvent({
    title: "Eye rest",
    start: toCalendarDateTime(startedAt),
    end: toCalendarDateTime(endedAt),
    kind: "actual",
    category: "H",
    notes
  });
  await queueCalendarEventAppend(event);

  // Blind journaling gets its own event beside the break, so the calendar shows
  // how many minutes of it there were rather than burying it in the Eye rest
  // notes. It deliberately spans the whole session, not the keystroke window
  // that /api/quick-journal timestamps the written block with: the break is the
  // sitting, and pauses between sentences are part of doing it.
  let journalEvent = null;
  if (restTypes.includes(BLIND_JOURNALING_LABEL)) {
    journalEvent = normalizeCalendarEvent({
      title: BLIND_JOURNALING_LABEL,
      start: toCalendarDateTime(startedAt),
      end: toCalendarDateTime(endedAt),
      kind: "actual",
      category: "H",
      notes: ""
    });
    await queueCalendarEventAppend(journalEvent);
  }

  const journalingGoal = journalEvent
    ? await completeJournalingGoalTask(validDateOrToday(toCalendarDateTime(startedAt).slice(0, 10)))
    : null;

  const logRow = {
    id: event.id,
    ts: new Date().toISOString(),
    date: validDateOrToday(toCalendarDateTime(startedAt).slice(0, 10)),
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    durationSeconds,
    restTypes,
    note
  };
  await queueEyeRestLogAppend(logRow);
  // The break itself is the evidence for the eye-rest habit, so the checkbox in
  // the night survey is now a shortcut rather than the only way to answer it.
  // Runs after the append or the evidence read would not see this session.
  await settleEvidenceGoals(logRow.date);

  await rememberCaptureId(captureId);
  sendJson(res, 200, { ok: true, event, journalEvent, journalingGoal, log: logRow });
}

/* Work mode (work-mode.ps1) closing a session. The event is deliberately
   **uncategorised** and hot pink: app.js resolves an event's colour as
   categoryColor(category) || event.color, so a category would win and the pink
   would never show. The pink is the whole point -- it is a to-do, not a record.
   You categorise it by hand later, and until you do it is the one colour on
   the calendar that means "this is not filed yet".

   #ff1493 rather than CSS hot pink #ff69b4, which is close enough to the Dating
   category's #f472b6 to be mistaken for it at a glance on a busy day. */
const WORK_SESSION_COLOR = "#ff1493";
// Below this, a session is a mis-click or a quick look at the band, not work.
// Measured on working time (elapsed minus any eye-rest break), because that is
// what "a 5 minute work period" means.
const WORK_SESSION_MIN_SECONDS = 5 * 60;

async function addWorkSession(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const captureId = String(payload.captureId || "");
  if (await captureAlreadyStored(captureId)) return sendJson(res, 200, { ok: true, duplicate: true });
  const startedAt = new Date(payload.startedAt);
  const endedAt = new Date(payload.endedAt);
  if (Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime()) || endedAt <= startedAt) {
    return sendJson(res, 400, { error: "Invalid startedAt/endedAt" });
  }
  const elapsedSeconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);
  const restSeconds = Math.min(
    Math.max(0, Math.round(Number(payload.restSeconds) || 0)),
    elapsedSeconds
  );
  const workedSeconds = elapsedSeconds - restSeconds;

  // Answered ok, not 400: a session too short to book is a normal outcome, and
  // a rejection would send a replayed one to outbox/rejected as if it were bad
  // data. work-mode.ps1 checks this too; this is the backstop for a replay.
  if (workedSeconds < WORK_SESSION_MIN_SECONDS) {
    await rememberCaptureId(captureId);
    return sendJson(res, 200, { ok: true, skipped: true, workedSeconds });
  }

  // Eye rest books its own H event across the same minutes, so a work session
  // containing one overlaps it on the calendar. Saying so in the notes is what
  // stops the block reading as solid work at categorisation time.
  const restMinutes = Math.round(restSeconds / 60);
  const notes = restMinutes > 0 ? `Includes ${restMinutes} min of eye rest.` : "";

  const event = normalizeCalendarEvent({
    title: "Work session",
    start: toCalendarDateTime(startedAt),
    end: toCalendarDateTime(endedAt),
    kind: "actual",
    category: "",
    color: WORK_SESSION_COLOR,
    notes
  });
  await queueCalendarEventAppend(event);
  await rememberCaptureId(captureId);
  sendJson(res, 200, { ok: true, event, workedSeconds });
}

// Blind journaling is the daily "Journaling" habit being done, so the break
// ticks the task off instead of leaving it in the list to be found and ticked
// again later. Resolved from goals.json by id first, then by name, so renaming
// the goal in the app does not silently break this.
const JOURNALING_GOAL_ID = "daily-journaling";
const JOURNALING_GOAL_NAME = "journaling";

async function findJournalingGoal() {
  const doc = await readJsonFile(goalsPath, emptyGoalsDoc);
  const goals = (Array.isArray(doc.goals) ? doc.goals : []).filter((goal) => goal && !goal.archived);
  return (
    goals.find((goal) => goal.id === JOURNALING_GOAL_ID) ||
    goals.find(
      (goal) =>
        goal.type === "daily" &&
        goal.surface === "task" &&
        String(goal.taskText || goal.title || "").trim().toLowerCase() === JOURNALING_GOAL_NAME
    ) ||
    null
  );
}

// Idempotent by design: a second blind-journaling break in the same day finds
// the check already booked and the task already in `completed`, and does
// nothing. Mirrors what completing the task in the app does (app.js
// completeTask -> logGoalEvent kind "check"), because the monthly review counts
// goal-log rows, not completed tasks.
async function completeJournalingGoalTask(date) {
  const goal = await findJournalingGoal();
  if (!goal) return null;

  const storedLog = await readJsonFile(goalLogPath, []);
  const rows = Array.isArray(storedLog) ? storedLog : [];
  const hasEvent = (kind) => rows.some((row) => row.goalId === goal.id && row.date === date && row.kind === kind);
  const alreadyChecked = rows.some(
    (row) => row.goalId === goal.id && row.date === date && row.kind === "check" && row.value
  );

  const entry = await readEntry(date);
  const now = new Date().toISOString();
  let taskCompleted = false;

  for (const section of taskSectionKeys) {
    const index = entry.tasks[section].findIndex((task) => task.goalId === goal.id);
    if (index === -1) continue;
    const [task] = entry.tasks[section].splice(index, 1);
    entry.tasks.completed.push({ ...task, source: section, previousIndex: index, completedAt: now });
    taskCompleted = true;
    break;
  }

  // No row to tick means the browser has not been open yet today, so the daily
  // goal never materialised. Writing it straight into `completed` - along with
  // the `materialize` event that ensureDailyGoalTasks uses as its duplicate
  // guard - is what stops the app from later adding an unchecked copy of a
  // habit that is already done.
  if (!taskCompleted && !entry.tasks.completed.some((task) => task.goalId === goal.id)) {
    entry.tasks.completed.push(
      normalizeTask(
        {
          text: goal.taskText || goal.title,
          goalId: goal.id,
          project: "goal",
          priority: "p3",
          sourceDate: date,
          estimateMinutes: goal.estimateMinutes,
          source: "inbox",
          previousIndex: 0,
          completedAt: now
        },
        "inbox"
      )
    );
    taskCompleted = true;
  }

  if (taskCompleted) await writeEntry(entry);

  const events = [];
  if (!alreadyChecked) {
    events.push(normalizeGoalEvent({ goalId: goal.id, date, kind: "check", value: true, source: "eyerest" }));
  }
  if (!hasEvent("materialize")) {
    events.push(normalizeGoalEvent({ goalId: goal.id, date, kind: "materialize", value: true, source: "eyerest" }));
  }
  if (events.length) await queueGoalLogAppend(events);

  return { goalId: goal.id, date, checked: !alreadyChecked, taskCompleted };
}

function toCalendarDateTime(date) {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

// Serialised the same way as queueGoalLogAppend: calendar-events.json has no
// per-write revision, so a chained read-modify-write is what keeps two eye-rest
// sessions logged back-to-back from clobbering each other. It does not protect
// against the browser's own full-array POST (saveCalendarEvents) landing in the
// same instant; that race already exists for calendar edits today.
function queueCalendarEventAppend(event) {
  const run = calendarEventsWriteChain.then(async () => {
    const stored = await readJsonFile(calendarEventsPath, []);
    const events = normalizeCalendarEvents(Array.isArray(stored) ? stored : []);
    events.push(event);
    events.sort((a, b) => (a.start !== b.start ? a.start.localeCompare(b.start) : a.title.localeCompare(b.title)));
    await writeJsonFile(calendarEventsPath, events);
    return event;
  });
  calendarEventsWriteChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function queueEyeRestLogAppend(row) {
  const run = eyeRestLogWriteChain.then(async () => {
    const stored = await readJsonFile(eyeRestLogPath, []);
    const rows = Array.isArray(stored) ? stored : [];
    rows.push(row);
    await writeJsonFile(eyeRestLogPath, rows);
    return row;
  });
  eyeRestLogWriteChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function getEyeRestLog(url, res) {
  const stored = await readJsonFile(eyeRestLogPath, []);
  const rows = Array.isArray(stored) ? stored : [];
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";
  const events = rows.filter((row) => (!from || row.date >= from) && (!to || row.date <= to));
  sendJson(res, 200, { events });
}

// The HUD (task-hud.ps1) is a separate process with no other trace: before this,
// the only evidence it had ever run was the window position in hud-settings.json.
// It now reports its own lifecycle here so "does having the HUD open change what
// I get done?" can be answered against work hours and completions instead of
// guessed at. Rows are append-only and deliberately thin -- a session is
// reconstructed by pairing a "start" with the "end" carrying the same sessionId,
// which survives a HUD that is killed without ever writing its "end".
function normalizeHudEvent(raw) {
  if (!raw || typeof raw !== "object") return null;
  const kind = hudLogKinds.has(raw.kind) ? raw.kind : "";
  if (!kind) return null;
  const seconds = Number(raw.durationSeconds);
  return {
    id: String(raw.id || crypto.randomUUID()),
    ts: typeof raw.ts === "string" && raw.ts ? raw.ts : new Date().toISOString(),
    date: validDateOrToday(raw.date),
    kind,
    // Ties every row from one HUD launch together. Generated by the HUD so rows
    // written by different processes on the same day stay distinguishable.
    sessionId: String(raw.sessionId || "").trim(),
    // Only meaningful on "end": wall-clock seconds the HUD was running.
    durationSeconds: Number.isFinite(seconds) && seconds >= 0 ? Math.round(seconds) : null,
    // Only meaningful on "complete": which task was checked off.
    taskId: String(raw.taskId || "").trim(),
    note: typeof raw.note === "string" ? raw.note : ""
  };
}

function queueHudLogAppend(events) {
  const run = hudLogWriteChain.then(async () => {
    const stored = await readJsonFile(hudLogPath, []);
    const rows = Array.isArray(stored) ? stored : [];
    const seen = new Set(rows.map((row) => row.id));
    const fresh = events.filter((event) => !seen.has(event.id));
    if (fresh.length) {
      rows.push(...fresh);
      await writeJsonFile(hudLogPath, rows);
    }
    return fresh;
  });
  hudLogWriteChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function appendHudLog(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const incoming = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.events)
      ? payload.events
      : [payload];
  const events = incoming.map(normalizeHudEvent).filter(Boolean);
  if (!events.length) return sendJson(res, 400, { error: "No valid HUD events" });
  const appended = await queueHudLogAppend(events);
  sendJson(res, 200, { ok: true, appended: appended.length, events: appended });
}

// The app had the same blind spot the HUD did: app-settings.json only ever holds
// the *last* activeView, so there was no way to ask when the app was actually
// open or where the time inside it went. Same shape as hud-log.json on purpose --
// one sessionId per page load, "start"/"end" bracketing it, "hidden"/"visible"
// for tab focus, and a "view" row each time the view changes.
function normalizeAppEvent(raw) {
  if (!raw || typeof raw !== "object") return null;
  const kind = appLogKinds.has(raw.kind) ? raw.kind : "";
  if (!kind) return null;
  const seconds = Number(raw.durationSeconds);
  return {
    id: String(raw.id || crypto.randomUUID()),
    ts: typeof raw.ts === "string" && raw.ts ? raw.ts : new Date().toISOString(),
    date: validDateOrToday(raw.date),
    kind,
    sessionId: String(raw.sessionId || "").trim(),
    // Which view was open. Free-form rather than an enum: app.js owns the view
    // list and a mismatch should not silently drop the row.
    view: String(raw.view || "").trim().slice(0, 40),
    durationSeconds: Number.isFinite(seconds) && seconds >= 0 ? Math.round(seconds) : null
  };
}

function queueAppLogAppend(events) {
  const run = appLogWriteChain.then(async () => {
    const stored = await readJsonFile(appLogPath, []);
    const rows = Array.isArray(stored) ? stored : [];
    const seen = new Set(rows.map((row) => row.id));
    const fresh = events.filter((event) => !seen.has(event.id));
    if (fresh.length) {
      rows.push(...fresh);
      await writeJsonFile(appLogPath, rows);
    }
    return fresh;
  });
  appLogWriteChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function appendAppLog(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const incoming = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.events)
      ? payload.events
      : [payload];
  const events = incoming.map(normalizeAppEvent).filter(Boolean);
  if (!events.length) return sendJson(res, 400, { error: "No valid app events" });
  const appended = await queueAppLogAppend(events);
  sendJson(res, 200, { ok: true, appended: appended.length, events: appended });
}

async function getAppLog(url, res) {
  const stored = await readJsonFile(appLogPath, []);
  const rows = Array.isArray(stored) ? stored : [];
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";
  const events = rows.filter((row) => (!from || row.date >= from) && (!to || row.date <= to));
  sendJson(res, 200, { events });
}

async function getHudLog(url, res) {
  const stored = await readJsonFile(hudLogPath, []);
  const rows = Array.isArray(stored) ? stored : [];
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";
  const events = rows.filter((row) => (!from || row.date >= from) && (!to || row.date <= to));
  sendJson(res, 200, { events });
}

// Quick journal (Ctrl+Alt+Q, quick-journal-capture.ps1) appends a timestamped
// block straight into the day's Document view so an idea captured away from
// the browser is there the next time it's opened, instead of living in a
// separate log nobody reads. This writes journalHtml directly rather than
// going through the editor, so it also has to keep entry.journal (the plain
// mirror docPlainText() rebuilds client-side - see the Document View
// Formatting notes in LLM_README.md) in sync by hand, using the same
// block-per-line convention.
async function addQuickJournal(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  // A capture queued offline carries the id it was queued under. Answering a
  // replay of one already stored with ok/duplicate is what lets the capture
  // windows queue a POST that timed out without risking a second row.
  const captureId = String(payload.captureId || "");
  if (await captureAlreadyStored(captureId)) return sendJson(res, 200, { ok: true, duplicate: true });
  const text = String(payload.text || "").trim();
  if (!text) return sendJson(res, 400, { error: "Quick journal needs some text" });
  const startedAt = new Date(payload.startedAt);
  const endedAt = new Date(payload.endedAt);
  if (Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime()) || endedAt < startedAt) {
    return sendJson(res, 400, { error: "Invalid startedAt/endedAt" });
  }
  const date = validDateOrToday(payload.date);
  const entry = await readEntry(date);
  if (typeof entry.journal !== "string") entry.journal = "";
  if (typeof entry.journalHtml !== "string") entry.journalHtml = "";

  // Optional caller-supplied heading. Eye rest (Ctrl+Alt+E) sends "Blind
  // journaling" so a block written with the eyes shut during a break is
  // distinguishable from a plain Ctrl+Alt+Q note once both are sitting in the
  // same day's document. Omitted by quick journal itself, which keeps the bare
  // time range it has always written.
  const title = String(payload.title || "").trim();
  const timeRange = `${formatClockTime(startedAt)} - ${formatClockTime(endedAt)}`;
  const label = title ? `${title}: ${timeRange}` : timeRange;
  const paragraphs = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const htmlBody = paragraphs.map((part) => `<p>${escapeHtml(part).replace(/\n/g, "<br>")}</p>`).join("");
  const htmlBlock = `<p><strong>${escapeHtml(label)}</strong></p>${htmlBody}`;
  const plainBlock = `${label}\n${paragraphs.join("\n\n")}`;

  entry.journalHtml = entry.journalHtml ? `${entry.journalHtml}<hr>${htmlBlock}` : htmlBlock;
  entry.journal = entry.journal ? `${entry.journal}\n\n---\n\n${plainBlock}` : plainBlock;

  await writeEntry(entry);
  await rememberCaptureId(captureId);
  sendJson(res, 200, { ok: true, date, revision: entryRevision(entry) });
}

// Things to learn about (Ctrl+Alt+L, learn-capture.ps1). A standing backlog,
// not a dated log: an item written in March is still worth reading in August,
// so it lives in its own learn-list.json and takes no part in the entry
// revision model (same rule as goals - see LLM_README "Goal state never touches
// entries/*.json"). Every write below is item-scoped and serialised through one
// chain, so the hotkey window and an open browser tab cannot clobber each
// other the way a full-array POST would.
let learnListWriteChain = Promise.resolve();

function normalizeLearnItem(raw) {
  const learned = Boolean(raw?.learned);
  return {
    id: String(raw?.id || crypto.randomUUID()),
    createdAt: typeof raw?.createdAt === "string" && raw.createdAt ? raw.createdAt : new Date().toISOString(),
    text: String(raw?.text || "").trim(),
    link: normalizeLearnLink(raw?.link),
    source: typeof raw?.source === "string" && raw.source ? raw.source : "app",
    learned,
    learnedAt: learned && typeof raw?.learnedAt === "string" ? raw.learnedAt : null
  };
}

// The raw string is kept even when it is not a usable URL - a half-remembered
// "that Feynman lectures site" is still the note the user meant to leave. The
// client is what decides whether it becomes a clickable link, and only ever
// for http/https.
function normalizeLearnLink(value) {
  const link = String(value || "").trim();
  if (!link) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(link)) return link;
  if (/^[^\s/]+\.[^\s/]+/.test(link)) return `https://${link}`;
  return link;
}

function queueLearnListWrite(mutate) {
  const run = learnListWriteChain.then(async () => {
    const stored = await readJsonFile(learnListPath, []);
    const items = (Array.isArray(stored) ? stored : []).map(normalizeLearnItem);
    const result = mutate(items);
    await writeJsonFile(learnListPath, items);
    return { items, result };
  });
  learnListWriteChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function getLearnList(res) {
  const stored = await readJsonFile(learnListPath, []);
  const items = (Array.isArray(stored) ? stored : []).map(normalizeLearnItem);
  sendJson(res, 200, { items });
}

async function addLearnItem(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  // A capture queued offline carries the id it was queued under. Answering a
  // replay of one already stored with ok/duplicate is what lets the capture
  // windows queue a POST that timed out without risking a second row.
  const captureId = String(payload.captureId || "");
  if (await captureAlreadyStored(captureId)) return sendJson(res, 200, { ok: true, duplicate: true });
  const item = normalizeLearnItem({
    text: payload.text,
    link: payload.link,
    createdAt: payload.createdAt,
    source: payload.source
  });
  if (!item.text && !item.link) {
    return sendJson(res, 400, { error: "Write something to learn about, or paste a link" });
  }
  const { items } = await queueLearnListWrite((list) => list.push(item));
  await rememberCaptureId(captureId);
  sendJson(res, 200, { ok: true, item, items });
}

async function updateLearnItem(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const id = String(payload.id || "");
  if (!id) return sendJson(res, 400, { error: "Missing id" });
  let updated = null;
  const { items } = await queueLearnListWrite((list) => {
    const target = list.find((entry) => entry.id === id);
    if (!target) return;
    if (payload.text !== undefined) target.text = String(payload.text).trim();
    if (payload.link !== undefined) target.link = normalizeLearnLink(payload.link);
    if (payload.learned !== undefined) {
      target.learned = Boolean(payload.learned);
      target.learnedAt = target.learned ? new Date().toISOString() : null;
    }
    updated = target;
  });
  if (!updated) return sendJson(res, 404, { error: "Item not found" });
  sendJson(res, 200, { ok: true, item: updated, items });
}

async function deleteLearnItem(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const id = String(payload.id || "");
  if (!id) return sendJson(res, 400, { error: "Missing id" });
  let removed = false;
  const { items } = await queueLearnListWrite((list) => {
    const index = list.findIndex((entry) => entry.id === id);
    if (index === -1) return;
    list.splice(index, 1);
    removed = true;
  });
  if (!removed) return sendJson(res, 404, { error: "Item not found" });
  sendJson(res, 200, { ok: true, items });
}

// Shopping list. Same rules as the learn list above: a standing cross-day list
// in its own shopping-list.json, no part in the entry revision model, every
// write item-scoped and serialised through one chain so two open windows
// cannot clobber each other.
let shoppingListWriteChain = Promise.resolve();

function normalizeShoppingItem(raw) {
  const bought = Boolean(raw?.bought);
  return {
    id: String(raw?.id || crypto.randomUUID()),
    createdAt: typeof raw?.createdAt === "string" && raw.createdAt ? raw.createdAt : new Date().toISOString(),
    text: String(raw?.text || "").trim(),
    source: typeof raw?.source === "string" && raw.source ? raw.source : "app",
    // Free text on purpose ("Costco", "amazon", "fb marketplace") - a fixed
    // vendor list would just fight how the list is actually written.
    where: String(raw?.where || "").trim(),
    // Lowercased so "Groceries" and "groceries" group as one category.
    tag: String(raw?.tag || "").trim().toLowerCase(),
    urls: Array.isArray(raw?.urls) ? raw.urls.map((u) => String(u).trim()).filter(Boolean) : [],
    bought,
    boughtAt: bought && typeof raw?.boughtAt === "string" ? raw.boughtAt : null
  };
}

function queueShoppingListWrite(mutate) {
  const run = shoppingListWriteChain.then(async () => {
    const stored = await readJsonFile(shoppingListPath, []);
    const items = (Array.isArray(stored) ? stored : []).map(normalizeShoppingItem);
    const result = mutate(items);
    await writeJsonFile(shoppingListPath, items);
    return { items, result };
  });
  shoppingListWriteChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function getShoppingList(res) {
  const stored = await readJsonFile(shoppingListPath, []);
  const items = (Array.isArray(stored) ? stored : []).map(normalizeShoppingItem);
  sendJson(res, 200, { items });
}

async function addShoppingItem(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const item = normalizeShoppingItem({
    text: payload.text,
    createdAt: payload.createdAt,
    source: payload.source,
    where: payload.where,
    tag: payload.tag,
    urls: payload.urls
  });
  if (!item.text) {
    return sendJson(res, 400, { error: "Write what to buy" });
  }
  const { items } = await queueShoppingListWrite((list) => list.push(item));
  sendJson(res, 200, { ok: true, item, items });
}

async function updateShoppingItem(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const id = String(payload.id || "");
  if (!id) return sendJson(res, 400, { error: "Missing id" });
  let updated = null;
  const { items } = await queueShoppingListWrite((list) => {
    const target = list.find((entry) => entry.id === id);
    if (!target) return;
    if (payload.text !== undefined) target.text = String(payload.text).trim();
    if (payload.where !== undefined) target.where = String(payload.where).trim();
    if (payload.tag !== undefined) target.tag = String(payload.tag).trim().toLowerCase();
    if (payload.urls !== undefined) {
      target.urls = Array.isArray(payload.urls) ? payload.urls.map((u) => String(u).trim()).filter(Boolean) : [];
    }
    if (payload.bought !== undefined) {
      target.bought = Boolean(payload.bought);
      target.boughtAt = target.bought ? new Date().toISOString() : null;
    }
    updated = target;
  });
  if (!updated) return sendJson(res, 404, { error: "Item not found" });
  sendJson(res, 200, { ok: true, item: updated, items });
}

async function deleteShoppingItem(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const id = String(payload.id || "");
  if (!id) return sendJson(res, 400, { error: "Missing id" });
  let removed = false;
  const { items } = await queueShoppingListWrite((list) => {
    const index = list.findIndex((entry) => entry.id === id);
    if (index === -1) return;
    list.splice(index, 1);
    removed = true;
  });
  if (!removed) return sendJson(res, 404, { error: "Item not found" });
  sendJson(res, 200, { ok: true, items });
}

function normalizePerson(raw) {
  const asStringList = (value) => (Array.isArray(value) ? value.map((item) => String(item || "").trim()).filter(Boolean) : []);
  return {
    id: String(raw?.id || ""),
    name: String(raw?.name || "").trim(),
    aliases: asStringList(raw?.aliases),
    tags: asStringList(raw?.tags),
    notes: String(raw?.notes || ""),
    created: /^\d{4}-\d{2}-\d{2}$/.test(String(raw?.created || "")) ? raw.created : "",
    archived: raw?.archived === true
  };
}

async function getPeople(res) {
  const stored = await readJsonFile(peoplePath, []);
  sendJson(res, 200, { people: (Array.isArray(stored) ? stored : []).map(normalizePerson).filter((person) => person.id && person.name) });
}

/* Whole-list replacement, like custom-choices: the registry is one small
   document edited from one screen, so per-row endpoints would only add merge
   states the client never produces. */
async function savePeople(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  if (!Array.isArray(payload.people)) return sendJson(res, 400, { error: "Expected a people array" });
  const people = payload.people.map(normalizePerson).filter((person) => person.id && person.name);
  await writeDataFile(peoplePath, people);
  sendJson(res, 200, { ok: true, people });
}

async function completeTask(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const date = validDateOrToday(payload.date);
  const section = taskSectionKeys.includes(payload.section) ? payload.section : "rightNow";
  const taskId = String(payload.taskId || "");
  const entry = await readEntry(date);
  const list = entry.tasks[section];
  const index = list.findIndex((task) => task.id === taskId);
  if (index === -1) return sendJson(res, 404, { error: "Task not found" });
  const [task] = list.splice(index, 1);
  // This endpoint exists for the HUD, so an unlabelled caller is the HUD. app.js
  // completes tasks in its own state and stamps "app" there.
  const via = taskCompletionSurfaces.has(payload.via) ? payload.via : "hud";
  entry.tasks.completed.push({
    ...task,
    source: section,
    previousIndex: index,
    completedAt: new Date().toISOString(),
    completedVia: via
  });
  await writeEntry(entry);
  sendJson(res, 200, { ok: true, date, tasks: entry.tasks, revision: entryRevision(entry), savedAt: entry._savedAt || null });
}

async function undoTask(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const date = validDateOrToday(payload.date);
  const entry = await readEntry(date);
  const task = entry.tasks.completed.pop();
  if (!task) return sendJson(res, 404, { error: "No completed task to undo" });
  const section = taskSectionKeys.includes(task.source) ? task.source : "rightNow";
  const restored = {
    id: task.id || `task-${Date.now()}`,
    text: task.text || "",
    project: task.project || "",
    labels: Array.isArray(task.labels) ? task.labels : [],
    priority: ["p1", "p2", "p3", "p4"].includes(task.priority) ? task.priority : "p4",
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(String(task.dueDate || "")) ? task.dueDate : "",
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const index = Math.min(Math.max(Number(task.previousIndex) || 0, 0), entry.tasks[section].length);
  entry.tasks[section].splice(index, 0, restored);
  await writeEntry(entry);
  sendJson(res, 200, { ok: true, date, tasks: entry.tasks, revision: entryRevision(entry), savedAt: entry._savedAt || null });
}

async function openHud(url, res) {
  const date = validDateOrToday(url.searchParams.get("date"));
  const scriptPath = path.join(root, "windows", "launch-task-hud.vbs");
  try {
    await fs.access(scriptPath);
  } catch {
    return sendJson(res, 500, { error: "HUD launcher not found" });
  }
  const child = spawn("wscript.exe", [
    scriptPath,
    date,
    String(port)
  ], {
    cwd: root,
    detached: true,
    stdio: "ignore",
    windowsHide: true
  });
  child.unref();
  sendJson(res, 200, { ok: true, date, pid: child.pid });
}

async function readEntry(date) {
  try {
    const entry = await readEntryFile(date);
    if (!entry) throw new Error("Entry not found");
    if (!entry.date) entry.date = date;
    ensureTaskState(entry);
    return entry;
  } catch {
    const entry = defaultEntry(date);
    await writeEntry(entry);
    return entry;
  }
}

async function writeEntry(entry) {
  ensureTaskState(entry);
  await fs.mkdir(entriesDir, { recursive: true });
  const currentEntry = await readEntryFile(entry.date);
  const currentRevision = entryRevision(currentEntry);
  await archiveEntryHistory(currentEntry, entry, currentRevision);
  entry._revision = currentRevision + 1;
  entry._savedAt = new Date().toISOString();
  await writeJsonAtomic(path.join(entriesDir, `${entry.date}.json`), entry);
}

async function readEntryFile(date) {
  try {
    return JSON.parse(await fs.readFile(path.join(entriesDir, `${date}.json`), "utf8"));
  } catch {
    return null;
  }
}

function entryRevision(entry) {
  const revision = Number(entry?._revision);
  return Number.isInteger(revision) && revision >= 0 ? revision : 0;
}

/* --- Entry sync fingerprint -------------------------------------------------

   `GET /api/tasks` carries tasks and mistakes, and syncTasksFromDisk() merges
   both before adopting the revision that contains them. Everything else in the
   entry is invisible to that poll, so a second writer -- the other browser
   window, or the phone PWA -- could change a survey answer, the revision would
   be adopted anyway, and the next whole-entry save would skip the 409 merge and
   overwrite it. A night-survey `naps` value was lost exactly this way.

   So the poll also carries a fingerprint of the parts it does not send. The
   client adopts the revision only when that still matches what it last knew the
   server held; otherwise it stays stale on purpose and lets the save take the
   three-way merge path. Keep this in sync with the copy in app.js -- the two
   must hash identically or every poll reports a phantom change.
--------------------------------------------------------------------------- */

const ENTRY_SYNC_IGNORED_KEYS = new Set(["tasks", "mistakes", "_revision", "_savedAt"]);

// Key order must not matter: the two sides build entries independently, and
// ordinary JSON.stringify would differ on insertion order alone.
function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    return encoded === undefined ? "null" : encoded;
  }
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

function entrySyncFingerprint(entry) {
  if (!entry || typeof entry !== "object") return "";
  const rest = {};
  for (const key of Object.keys(entry)) {
    if (ENTRY_SYNC_IGNORED_KEYS.has(key)) continue;
    rest[key] = entry[key];
  }
  const text = stableStringify(rest);
  // FNV-1a, with the length appended so a hash collision also has to match the
  // serialized size. A collision only degrades to the old behaviour, never worse.
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `${hash.toString(16)}-${text.length}`;
}

/* --- Entry history ----------------------------------------------------------

   The app saves on a 350 ms debounce, so a long editing session used to write a
   full pretty-printed copy of the entry per pause -- most of them identical to
   the one before. entries/.history had reached 5,533 files and 49 MB for 90 days
   of journal, and several dates sat pegged at the old 200-copy cap, which meant
   duplicates were pushing genuinely distinct older versions out of the window.
   Skipping unchanged copies is what makes the smaller cap an improvement rather
   than a loss: 30 *different* versions of a day is more recoverable history than
   200 copies of the same afternoon.
--------------------------------------------------------------------------- */

const ENTRY_HISTORY_COPIES = 30;

async function archiveEntryHistory(currentEntry, nextEntry, currentRevision) {
  if (!currentEntry) return;
  if (entryArchiveKey(currentEntry) === entryArchiveKey(nextEntry)) return;
  await archiveEntry(entryHistoryDir, nextEntry.date, currentEntry, `r${currentRevision}`, ENTRY_HISTORY_COPIES);
}

// _revision and _savedAt change on every save by construction, so leaving them in
// would make every entry look different and skip nothing.
function entryArchiveKey(entry) {
  if (!entry || typeof entry !== "object") return "";
  const rest = {};
  for (const key of Object.keys(entry)) {
    if (key === "_revision" || key === "_savedAt") continue;
    rest[key] = entry[key];
  }
  return stableStringify(rest);
}

async function archiveEntry(parentDir, date, entry, label, maxCopies) {
  if (!entry) return;
  const dateDir = path.join(parentDir, date);
  await fs.mkdir(dateDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const suffix = crypto.randomBytes(3).toString("hex");
  await fs.writeFile(path.join(dateDir, `${stamp}-${label}-${suffix}.json`), `${JSON.stringify(entry, null, 2)}\n`, "utf8");
  if (Number.isInteger(maxCopies) && maxCopies > 0) {
    const files = (await fs.readdir(dateDir)).filter((file) => file.endsWith(".json")).sort();
    await Promise.all(files.slice(0, Math.max(0, files.length - maxCopies)).map((file) => fs.unlink(path.join(dateDir, file))));
  }
}

async function writeJsonAtomic(filePath, value) {
  const tempPath = `${filePath}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  // On Windows the rename fails outright -- EPERM or EBUSY -- when a virus
  // scanner or the search indexer has the destination open for the moment it
  // takes to swap it. That is transient and retrying clears it. Without the
  // retry the save was simply lost and the temp file orphaned: 45 of them had
  // piled up in entries/ from 14 different server processes, each one a save the
  // app reported as failed for no reason the user could see.
  let lastError = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await fs.rename(tempPath, filePath);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 4) await delay(50 * (attempt + 1));
    }
  }
  // Never leave the temp file behind for the sweeper: at this point the write
  // has genuinely failed and the caller is about to hear about it.
  await fs.unlink(tempPath).catch(() => undefined);
  throw lastError;
}

/* --- Data file backups ------------------------------------------------------

   calendar-events.json is the only store for the calendar -- writeLocalSnapshot()
   leaves it out of localStorage deliberately -- and the client POSTs the whole
   array on every edit. That pair came within one click of erasing 856 events:
   the server had died, the app came up off the cached service-worker shell with
   an empty calendar, and the next edit would have written [] over the file.
   Nothing on disk would have remembered otherwise.

   Three layers, ordered by how much each actually saves you:

   1. The guard refuses the destructive write. A backup only helps once someone
      notices; a refusal means the damage never lands. Row counts are the signal:
      an array file shedding most of its rows in a single write is a bug or a
      dead server, not an edit.
   2. Pre-write history keeps what was on disk before every write, so a write the
      guard allows through is still reversible.
   3. A daily snapshot outlives history rotation. The calendar is written dozens
      of times a day, so its rotating copies span hours; the snapshot is what
      answers "what did this look like last month".

   The auth files are deliberately absent from the policy table below. They hold
   OAuth refresh tokens, and a backup system that quietly fans copies of a
   long-lived credential across dozens of files on disk is a worse problem than
   the one it set out to solve. They still get the atomic write. */

const backupsDir = path.join(root, "backups");
const backupHistoryDir = path.join(backupsDir, "history");
const backupDailyDir = path.join(backupsDir, "daily");
const backupRejectedDir = path.join(backupsDir, "rejected");
const DAILY_SNAPSHOT_KEEP_DAYS = 60;

// keep:  pre-write copies retained per file.
// guard: "append-only" for logs where any shrink at all is a bug; "shrink" for
//        files rows do legitimately leave, which refuse only a collapse; "none"
//        for files with no meaningful row count, which still get history.
// daily: false opts out of the daily snapshot.
//
// app-log.json and hud-log.json are the awkward pair: half a megabyte, written on
// every view switch, and append-only, so each daily copy is the previous one plus
// a few rows. Sixty of those is ~30 MB of near-duplicate telemetry, which is the
// bloat entries/.history already paid for once. They are also the least
// irreplaceable thing here -- derived telemetry, not anything the user wrote. The
// append-only guard is the part that actually protects them; two history copies
// are enough to undo a bad write, and the snapshot earns nothing.
//
// A file absent from this table gets the atomic write and nothing else.
const DATA_FILE_POLICY = {
  "calendar-events.json": { keep: 40, guard: "shrink" },
  "goals.json": { keep: 30, guard: "none" },
  "goal-log.json": { keep: 20, guard: "append-only" },
  "custom-choices.json": { keep: 20, guard: "none" },
  // Object-shaped (months keyed by YYYY-MM), so history is the protection.
  "monthly-reviews.json": { keep: 20, guard: "none" },
  "app-settings.json": { keep: 10, guard: "none" },
  "learn-list.json": { keep: 20, guard: "shrink" },
  "shopping-list.json": { keep: 20, guard: "shrink" },
  "people.json": { keep: 20, guard: "shrink" },
  // Few rows, each one load-bearing for a year of arithmetic: history is the
  // whole protection here, since the guard's row-count floor is never reached.
  "timezone-history.json": { keep: 20, guard: "shrink" },
  "eyerest-log.json": { keep: 20, guard: "append-only" },
  "spotify-listens.json": { keep: 10, guard: "append-only" },
  "task-log.json": { keep: 10, guard: "append-only" },
  "hud-log.json": { keep: 2, guard: "append-only", daily: false },
  "app-log.json": { keep: 2, guard: "append-only", daily: false }
};

// Under this many rows a proportion means nothing -- 3 -> 1 is an ordinary
// afternoon on the shopping list. The guard only forms an opinion once there is
// enough on disk that losing most of it would be a catastrophe.
const DATA_GUARD_MIN_ROWS = 20;
// Over it, one write may not drop more than this share of the rows. Half is far
// past any real edit (the destructive cases are all near-total) while still
// catching a truncated or empty payload.
const DATA_GUARD_MAX_LOSS = 0.5;

class DataWriteGuardError extends Error {
  constructor(message, details) {
    super(message);
    this.name = "DataWriteGuardError";
    this.details = details;
  }
}

function dataFilePolicy(filePath) {
  return DATA_FILE_POLICY[path.basename(filePath)] || null;
}

// Only arrays have a row count worth comparing. The object-shaped files get
// history and no guard, which is what "none" means in the table above.
function dataRowCount(value) {
  return Array.isArray(value) ? value.length : null;
}

function checkDataWriteGuard(filePath, previous, next, guard) {
  if (!guard || guard === "none") return;
  const before = dataRowCount(previous);
  const after = dataRowCount(next);
  if (before === null || after === null) return;
  if (before < DATA_GUARD_MIN_ROWS) return;
  if (after >= before) return;
  const lost = before - after;
  const details = { file: path.basename(filePath), before, after, lost, guard };
  if (guard === "append-only") {
    throw new DataWriteGuardError(`${details.file} only ever grows, but this write drops ${lost} of ${before} rows.`, details);
  }
  if (lost / before > DATA_GUARD_MAX_LOSS) {
    throw new DataWriteGuardError(`${details.file} would lose ${lost} of its ${before} rows in one write.`, details);
  }
}

/* Content-addressed, and compared against the newest copy only. The client POSTs
   the whole calendar whether or not the edit touched it, so most writes are
   byte-identical to what is already there; hashing keeps an idle afternoon from
   pushing the last genuinely different version out of the window. This is the
   same lesson entries/.history learned the expensive way -- 5,533 near-identical
   files, and the distinct older versions gone. */
async function archiveDataFile(dir, name, text, keep) {
  const hash = crypto.createHash("sha1").update(text).digest("hex").slice(0, 12);
  const targetDir = path.join(dir, name);
  await fs.mkdir(targetDir, { recursive: true });
  const existing = (await fs.readdir(targetDir).catch(() => [])).filter((file) => file.endsWith(".json")).sort();
  if (existing.length && existing[existing.length - 1].includes(hash)) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${stamp}-${hash}.json`;
  await fs.writeFile(path.join(targetDir, fileName), text, "utf8");
  if (Number.isInteger(keep) && keep > 0) {
    const files = [...existing, fileName].sort();
    await Promise.all(
      files
        .slice(0, Math.max(0, files.length - keep))
        .map((file) => fs.unlink(path.join(targetDir, file)).catch(() => undefined))
    );
  }
}

// Local date, not toISOString(): a snapshot taken at 01:29 belongs to the day the
// user is living, and the machine has already moved Taipei -> Bangkok once.
function backupDayISO(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/* One copy per file per calendar day, taken from the contents being replaced, so
   backups/daily/<date>/ holds that day's starting state. Skipped once the day's
   copy exists, which makes this a single access() on every write but the first
   of each day. */
async function snapshotDataFileDaily(name, text) {
  const dayDir = path.join(backupDailyDir, backupDayISO(new Date()));
  const target = path.join(dayDir, name);
  try {
    await fs.access(target);
    return;
  } catch {
    // Not taken yet today.
  }
  await fs.mkdir(dayDir, { recursive: true });
  await fs.writeFile(target, text, "utf8");
  const days = (await fs.readdir(backupDailyDir).catch(() => [])).filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day)).sort();
  await Promise.all(
    days
      .slice(0, Math.max(0, days.length - DAILY_SNAPSHOT_KEEP_DAYS))
      .map((day) => fs.rm(path.join(backupDailyDir, day), { recursive: true, force: true }).catch(() => undefined))
  );
}

/* The one way data files should be written. Guards, archives, then writes
   atomically. Pass { force: true } to mean "yes, really" -- the frontend sets it
   only after the user has confirmed the loss in so many words, because a guard
   that cannot be overridden is just a bug that blocks a deliberate edit. */
async function writeDataFile(filePath, value, options = {}) {
  const policy = dataFilePolicy(filePath);
  if (!policy) return await writeJsonAtomic(filePath, value);
  const name = path.basename(filePath);
  let previousText = null;
  try {
    previousText = await fs.readFile(filePath, "utf8");
  } catch {
    previousText = null;
  }
  if (previousText !== null) {
    let previous = null;
    try {
      previous = JSON.parse(previousText);
    } catch {
      // Unparseable on disk: there is nothing to compare against, and the copy
      // taken below is what makes overwriting it safe rather than final.
      previous = null;
    }
    if (previous !== null && !options.force) {
      try {
        checkDataWriteGuard(filePath, previous, value, policy.guard);
      } catch (error) {
        if (error instanceof DataWriteGuardError) {
          // Keep the refused payload. If the shrink really was intended this is
          // where it comes back from: the guard must never itself be the reason
          // a deliberate edit is lost.
          await archiveDataFile(backupRejectedDir, name, `${JSON.stringify(value, null, 2)}\n`, 20).catch(() => undefined);
        }
        throw error;
      }
    }
    await archiveDataFile(backupHistoryDir, name, previousText, policy.keep);
    if (policy.daily !== false) await snapshotDataFileDaily(name, previousText);
  }
  await writeJsonAtomic(filePath, value);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Orphans from before the retry above existed, plus anything a hard kill leaves
// mid-write. One hour is well clear of any live write, so a temp file older than
// that is certainly dead.
const TEMP_FILE_MAX_AGE_MS = 60 * 60 * 1000;

async function sweepOrphanedTempFiles() {
  const now = Date.now();
  for (const dir of [entriesDir, entryHistoryDir, entryConflictsDir, root]) {
    let files = [];
    try {
      files = await fs.readdir(dir);
    } catch {
      continue;
    }
    for (const file of files) {
      if (!file.endsWith(".tmp")) continue;
      const filePath = path.join(dir, file);
      try {
        const stat = await fs.stat(filePath);
        if (now - stat.mtimeMs < TEMP_FILE_MAX_AGE_MS) continue;
        await fs.unlink(filePath);
      } catch {
        // Gone already, or locked -- either way the next sweep can have it.
      }
    }
  }
}

async function migrateDatedTasks() {
  await fs.mkdir(entriesDir, { recursive: true });
  const files = await fs.readdir(entriesDir);
  const entries = new Map();
  const changed = new Set();
  for (const file of files) {
    if (!/^\d{4}-\d{2}-\d{2}\.json$/.test(file)) continue;
    try {
      const text = await fs.readFile(path.join(entriesDir, file), "utf8");
      const entry = JSON.parse(text);
      if (!entry.date) entry.date = file.slice(0, 10);
      ensureTaskState(entry);
      entries.set(entry.date, entry);
    } catch {
      // Broken entries are ignored by the normal list endpoint too.
    }
  }
  const ensureMigratedEntry = (date) => {
    if (!entries.has(date)) entries.set(date, defaultEntry(date));
    ensureTaskState(entries.get(date));
    return entries.get(date);
  };
  for (const [entryDate, entry] of entries) {
    for (const sectionKey of taskSectionKeys) {
      const list = entry.tasks[sectionKey];
      for (let index = list.length - 1; index >= 0; index -= 1) {
        const task = list[index];
        if (!task.dueDate || task.dueDate === entryDate) continue;
        list.splice(index, 1);
        const target = ensureMigratedEntry(task.dueDate);
        pushUniqueTask(target.tasks.today, task);
        changed.add(entryDate);
        changed.add(task.dueDate);
      }
    }
  }
  await Promise.all([...changed].map((date) => writeEntry(entries.get(date))));
}

function pushUniqueTask(list, task) {
  if (!list.some((item) => item.id === task.id)) list.push(task);
}

function defaultEntry(date) {
  return {
    date,
    morning: { text: "", checked: {}, survey: {}, customChoices: {}, processedAt: null },
    night: { text: "", checked: {}, survey: {}, customChoices: {}, processedAt: null },
    hours: {
      plan: Array(24).fill(""),
      reality: Array(24).fill(""),
      categories: Array(24).fill("")
    },
    tasks: defaultTasks(),
    mistakes: [],
    journal: ""
  };
}

function defaultTasks() {
  return { rightNow: [], inbox: [], today: [], upcoming: [], completed: [], discarded: [] };
}

async function readStoredCalendarEvents() {
  try {
    const text = await fs.readFile(calendarEventsPath, "utf8");
    return normalizeCalendarEvents(JSON.parse(text));
  } catch {
    return [];
  }
}

async function writeStoredCalendarEvents(events) {
  await writeDataFile(calendarEventsPath, normalizeCalendarEvents(events));
}

async function readGoogleCalendarConfig() {
  return await readJsonFile(googleCalendarConfigPath, {});
}

async function readGoogleCalendarAuth() {
  return await readJsonFile(googleCalendarAuthPath, {});
}

async function readOutlookCalendarConfig() {
  return await readJsonFile(outlookCalendarConfigPath, {});
}

async function readOutlookCalendarAuth() {
  return await readJsonFile(outlookCalendarAuthPath, {});
}

async function readJsonFile(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

// Every caller of this was a plain truncate-then-write, which loses the file
// outright if the process dies mid-write. Routing it through writeDataFile() also
// means the append-only logs, the lists and goals.json all get their history and
// their guard without each call site having to remember to ask.
async function writeJsonFile(filePath, data, options = {}) {
  await writeDataFile(filePath, data, options);
}

function googleCalendarRedirectUri() {
  return `http://127.0.0.1:${port}/api/google-calendar/oauth/callback`;
}

function googleCalendarStatus(config, auth) {
  return {
    configured: Boolean(config?.clientId && config?.clientSecret),
    connected: Boolean(auth?.refreshToken || (auth?.accessToken && Number(auth?.expiresAt || 0) > Date.now())),
    calendarId: config?.calendarId || "primary",
    lookbackDays: clampNumber(config?.lookbackDays ?? 30, 0, 365),
    lookaheadDays: clampNumber(config?.lookaheadDays ?? 180, 1, 730),
    clientId: config?.clientId ? maskGoogleClientId(config.clientId) : "",
    redirectUri: googleCalendarRedirectUri(),
    scope: googleCalendarScope,
    lastSyncAt: auth?.lastSyncAt || null,
    lastSyncCount: Number.isFinite(auth?.lastSyncCount) ? auth.lastSyncCount : null,
    connectedAt: auth?.connectedAt || null,
    // The app shows "reconnect to turn the push on" off the back of this: a
    // connection made under the old read-only scope is connected but one-way.
    canPush: googleScopeAllowsWrite(auth?.scope),
    pushSince: auth?.pushSince || null,
    lastPushed: auth?.lastPushed || null
  };
}

function maskGoogleClientId(clientId) {
  const text = String(clientId || "");
  if (text.length <= 12) return text ? "saved" : "";
  return `${text.slice(0, 6)}...${text.slice(-6)}`;
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, Math.round(number)));
}

async function requestGoogleToken(params) {
  const response = await fetch(googleTokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params)
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    // Google answers a dead refresh token with error_description "Bad Request",
    // which is how a sync that had been failing since the token expired went a
    // month looking like an ordinary hiccup. Say what it actually means, and
    // name the cause it almost always is: an OAuth consent screen left in
    // Testing, where Google expires the refresh token after seven days.
    if (data.error === "invalid_grant") {
      throw new Error("Google rejected the saved sign-in (invalid_grant) -- connect the account again. If this keeps happening after a week, set the OAuth consent screen to In production; in Testing, Google expires the refresh token every 7 days.");
    }
    throw new Error(data.error_description || data.error || `Google token request failed (${response.status})`);
  }
  return data;
}

async function googleCalendarAccessToken(config) {
  const auth = await readGoogleCalendarAuth();
  if (auth.accessToken && Number(auth.expiresAt || 0) > Date.now() + 60_000) return auth.accessToken;
  if (!auth.refreshToken) throw new Error("Google Calendar is not connected.");
  const token = await requestGoogleToken({
    refresh_token: auth.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token"
  });
  const nextAuth = {
    ...auth,
    accessToken: token.access_token,
    tokenType: token.token_type || auth.tokenType || "Bearer",
    scope: token.scope || auth.scope || googleCalendarScope,
    expiresAt: Date.now() + Number(token.expires_in || 3600) * 1000
  };
  await writeJsonFile(googleCalendarAuthPath, nextAuth);
  return nextAuth.accessToken;
}

function outlookCalendarRedirectUri() {
  return `http://127.0.0.1:${port}/api/outlook-calendar/oauth/callback`;
}

// "common" signs in both personal (outlook.com/hotmail) and work or school
// accounts; a specific tenant ID restricts sign-in to that organization.
function outlookAuthEndpoint(config) {
  return `https://login.microsoftonline.com/${encodeURIComponent(config?.tenant || "common")}/oauth2/v2.0/authorize`;
}

function outlookTokenEndpoint(config) {
  return `https://login.microsoftonline.com/${encodeURIComponent(config?.tenant || "common")}/oauth2/v2.0/token`;
}

function outlookCalendarStatus(config, auth) {
  return {
    configured: Boolean(config?.clientId && config?.clientSecret),
    connected: Boolean(auth?.refreshToken || (auth?.accessToken && Number(auth?.expiresAt || 0) > Date.now())),
    calendarId: config?.calendarId || "primary",
    tenant: config?.tenant || "common",
    lookbackDays: clampNumber(config?.lookbackDays ?? 30, 0, 365),
    lookaheadDays: clampNumber(config?.lookaheadDays ?? 180, 1, 730),
    clientId: config?.clientId ? maskGoogleClientId(config.clientId) : "",
    redirectUri: outlookCalendarRedirectUri(),
    scope: outlookCalendarScope,
    lastSyncAt: auth?.lastSyncAt || null,
    lastSyncCount: Number.isFinite(auth?.lastSyncCount) ? auth.lastSyncCount : null,
    connectedAt: auth?.connectedAt || null
  };
}

async function requestOutlookToken(config, params) {
  const response = await fetch(outlookTokenEndpoint(config), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params)
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.error_description || data.error || `Microsoft token request failed (${response.status})`);
  }
  return data;
}

async function outlookCalendarAccessToken(config) {
  const auth = await readOutlookCalendarAuth();
  if (auth.accessToken && Number(auth.expiresAt || 0) > Date.now() + 60_000) return auth.accessToken;
  if (!auth.refreshToken) throw new Error("Outlook Calendar is not connected.");
  const token = await requestOutlookToken(config, {
    refresh_token: auth.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
    scope: outlookCalendarScope
  });
  const nextAuth = {
    ...auth,
    accessToken: token.access_token,
    // Microsoft rotates refresh tokens: each refresh may hand back a new one,
    // and the old one eventually stops working, so always keep the latest.
    refreshToken: token.refresh_token || auth.refreshToken,
    tokenType: token.token_type || auth.tokenType || "Bearer",
    scope: token.scope || auth.scope || outlookCalendarScope,
    expiresAt: Date.now() + Number(token.expires_in || 3600) * 1000
  };
  await writeJsonFile(outlookCalendarAuthPath, nextAuth);
  return nextAuth.accessToken;
}

async function fetchOutlookCalendarEvents(calendarId, accessToken, range) {
  const events = [];
  // Asking Graph for local-time responses means the dateTime strings can be used
  // as-is, the same shape toLocalCalendarDateTime produces for Google events.
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const base = calendarId === "primary"
    ? `${outlookGraphApiBase}/me/calendarView`
    : `${outlookGraphApiBase}/me/calendars/${encodeURIComponent(calendarId)}/calendarView`;
  // calendarView expands recurring series into occurrences, matching the
  // singleEvents=true behavior the Google sync relies on.
  const first = new URL(base);
  first.searchParams.set("startDateTime", range.timeMin);
  first.searchParams.set("endDateTime", range.timeMax);
  first.searchParams.set("$top", "250");
  first.searchParams.set("$orderby", "start/dateTime");
  first.searchParams.set("$select", "id,subject,bodyPreview,start,end,isAllDay,isCancelled,location,webLink,onlineMeeting,createdDateTime,lastModifiedDateTime");
  let next = first.toString();
  while (next) {
    const response = await fetch(next, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Prefer: `outlook.timezone="${timeZone}"`
      }
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new Error(data.error?.message || `Outlook Calendar sync failed (${response.status})`);
    }
    for (const item of data.value || []) {
      const mapped = outlookEventToCalendarEvent(item, calendarId);
      if (mapped) events.push(mapped);
    }
    next = data["@odata.nextLink"] || "";
  }
  return events;
}

function outlookEventToCalendarEvent(event, calendarId) {
  if (!event || event.isCancelled || !event.start?.dateTime) return null;
  const allDay = Boolean(event.isAllDay);
  const startText = String(event.start.dateTime);
  const endText = String(event.end?.dateTime || event.start.dateTime);
  const start = allDay ? `${startText.slice(0, 10)}T00:00` : startText.slice(0, 16);
  const end = allDay ? `${endText.slice(0, 10)}T00:00` : endText.slice(0, 16);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(start)) return null;
  const title = String(event.subject || "(No title)").trim() || "(No title)";
  const link = String(event.onlineMeeting?.joinUrl || event.webLink || "").trim();
  return {
    id: `outlook:${calendarId}:${event.id}`,
    title,
    start,
    end: end || start,
    allDay,
    kind: "plan",
    category: "",
    location: String(event.location?.displayName || "").trim(),
    link,
    notes: String(event.bodyPreview || "").replace(/\r\n/g, "\n").trim(),
    recurrence: "none",
    repeatDays: [],
    exceptionDates: [],
    color: "#0ea5e9",
    /* A synced block is a real instant that the fetch above already flattened
       into this machine's clock (that is what the Prefer header asks Graph for),
       so it is pegged rather than floating: it happened when it happened, and
       looking back at it from another country should show the clock that was on
       the wall there, not today's. All-day rows stay floating -- a date has no
       instant to peg to. */
    zone: allDay ? "" : currentTimeZone(),
    tz: allDay ? "" : currentTimeZone(),
    source: "outlook",
    calendarId,
    providerId: event.id || null,
    updatedAt: event.lastModifiedDateTime || new Date().toISOString(),
    createdAt: event.createdDateTime || event.lastModifiedDateTime || new Date().toISOString()
  };
}

function calendarSyncRange(config, payload) {
  const explicitMin = parseDateOrNull(payload.timeMin);
  const explicitMax = parseDateOrNull(payload.timeMax);
  if (explicitMin && explicitMax && explicitMax > explicitMin) {
    return { timeMin: explicitMin.toISOString(), timeMax: explicitMax.toISOString() };
  }
  const lookbackDays = clampNumber(config.lookbackDays ?? 30, 0, 365);
  const lookaheadDays = clampNumber(config.lookaheadDays ?? 180, 1, 730);
  const min = new Date();
  min.setDate(min.getDate() - lookbackDays);
  min.setHours(0, 0, 0, 0);
  const max = new Date();
  max.setDate(max.getDate() + lookaheadDays);
  max.setHours(23, 59, 59, 999);
  return { timeMin: min.toISOString(), timeMax: max.toISOString() };
}

function parseDateOrNull(value) {
  const date = new Date(String(value || ""));
  return Number.isNaN(date.getTime()) ? null : date;
}

async function fetchGoogleCalendarEvents(calendarId, accessToken, range) {
  const events = [];
  let pageToken = "";
  do {
    const url = new URL(`${googleCalendarApiBase}/calendars/${encodeURIComponent(calendarId)}/events`);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("showDeleted", "false");
    url.searchParams.set("maxResults", "2500");
    url.searchParams.set("timeMin", range.timeMin);
    url.searchParams.set("timeMax", range.timeMax);
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new Error(data.error?.message || `Google Calendar sync failed (${response.status})`);
    }
    for (const item of data.items || []) {
      const mapped = googleEventToCalendarEvent(item, calendarId);
      if (mapped) events.push(mapped);
    }
    pageToken = data.nextPageToken || "";
  } while (pageToken);
  return events;
}

function googleEventToCalendarEvent(event, calendarId) {
  if (!event || event.status === "cancelled" || !event.start) return null;
  const allDay = Boolean(event.start.date);
  const start = allDay ? `${event.start.date}T00:00` : toLocalCalendarDateTime(event.start.dateTime);
  const end = allDay
    ? `${event.end?.date || event.start.date}T00:00`
    : toLocalCalendarDateTime(event.end?.dateTime || event.start.dateTime);
  if (!start) return null;
  const title = String(event.summary || "(No title)").trim();
  const link = String(event.htmlLink || event.hangoutLink || "").trim();
  return {
    id: `google:${calendarId}:${event.id}`,
    title,
    start,
    end: end || start,
    allDay,
    kind: "plan",
    category: "",
    location: String(event.location || "").trim(),
    link,
    notes: stripGoogleText(event.description || ""),
    recurrence: "none",
    repeatDays: [],
    exceptionDates: [],
    color: "#3b82f6",
    // Same as the Outlook mapper: a synced instant is pegged, not floating. The
    // peg is the organiser's zone when Google names one, since that is what the
    // event actually means -- a 09:00 Taipei standup stays a Taipei 09:00 --
    // falling back to this machine's zone, which is what the clock above is in.
    zone: allDay ? "" : currentTimeZone(),
    tz: allDay ? "" : isValidTimeZone(event.start.timeZone) ? String(event.start.timeZone) : currentTimeZone(),
    source: "google",
    calendarId,
    providerId: event.id || null,
    updatedAt: event.updated || new Date().toISOString(),
    createdAt: event.created || event.updated || new Date().toISOString()
  };
}

function toLocalCalendarDateTime(value) {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function stripGoogleText(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function calendarEventOverlapsRange(event, timeMin, timeMax) {
  const start = calendarDateTimeToDate(event.start);
  const end = calendarDateTimeToDate(event.end || event.start);
  const min = new Date(timeMin);
  const max = new Date(timeMax);
  if (!start || !end || Number.isNaN(min.getTime()) || Number.isNaN(max.getTime())) return false;
  return start < max && end > min;
}

function calendarDateTimeToDate(value) {
  const text = String(value || "");
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text)) return new Date(text);
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function categoryColor(code) {
  const colors = {
    Z: "#1f2933",
    G: "#a855f7",
    F: "#c084fc",
    D: "#f472b6",
    S: "#60a5fa",
    W: "#f59e0b",
    B: "#22d3ee",
    A: "#86efac",
    R: "#f87171",
    E: "#2563eb",
    H: "#e5e7eb",
    X: "#ef4444",
    V: "#fbbf24",
    C: "#fb923c",
    Q: "#d1d5db",
    T: "#4ade80",
    N: "#f0abfc"
  };
  return colors[code] || "";
}

function sendGoogleCalendarCallbackPage(res, ok, message) {
  return sendCalendarCallbackPage(res, ok, message, "Google Calendar");
}

function sendOutlookCalendarCallbackPage(res, ok, message) {
  return sendCalendarCallbackPage(res, ok, message, "Outlook Calendar");
}

function sendCalendarCallbackPage(res, ok, message, provider) {
  const title = ok ? `${provider} Connected` : `${provider} Connection Failed`;
  const escapedTitle = escapeHtml(title);
  const escapedMessage = escapeHtml(message);
  res.writeHead(ok ? 200 : 400, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapedTitle}</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; font: 16px system-ui, sans-serif; background: #f6f5ef; color: #1d2528; }
      main { max-width: 520px; padding: 28px; border: 1px solid #d6d4ca; border-radius: 8px; background: #fffefa; box-shadow: 0 18px 60px rgba(0,0,0,.14); }
      h1 { margin: 0 0 10px; font-size: 24px; }
      p { line-height: 1.5; }
      button { min-height: 38px; padding: 0 14px; border-radius: 8px; border: 1px solid #116b68; background: #116b68; color: white; font-weight: 700; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapedTitle}</h1>
      <p>${escapedMessage}</p>
      <button type="button" onclick="window.close()">Close</button>
    </main>
  </body>
</html>`);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ensureTaskState(entry) {
  if (!entry.tasks) entry.tasks = defaultTasks();
  for (const key of [...taskSectionKeys, "completed", "discarded"]) {
    if (!Array.isArray(entry.tasks[key])) entry.tasks[key] = [];
  }
  for (const key of taskSectionKeys) {
    entry.tasks[key] = entry.tasks[key].map((task) => normalizeTask(task, key));
  }
  entry.tasks.completed = entry.tasks.completed.map((task) => normalizeTask(task, task.source || "today"));
  entry.tasks.discarded = entry.tasks.discarded.map((task) => normalizeTask(task, task.source || "today"));
}

// Mirrors app.js.
function normalizeEstimateMinutes(value) {
  const minutes = Math.round(Number(value) || 0);
  if (!Number.isFinite(minutes) || minutes <= 0) return 0;
  return Math.min(minutes, 1440);
}

function normalizeTask(task, sectionKey) {
  const source = task && typeof task === "object" ? task : {};
  const labels = Array.isArray(source.labels) ? source.labels : [];
  const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(String(source.dueDate || "")) ? source.dueDate : "";
  return {
    id: source.id || `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: String(source.text || ""),
    // Mirrors app.js: links a materialised task back to its daily goal.
    goalId: String(source.goalId || "").trim(),
    // Mirrors app.js: the last date the task is for. Blank carries forward.
    expiresOn: /^\d{4}-\d{2}-\d{2}$/.test(String(source.expiresOn || "")) ? source.expiresOn : "",
    // Mirrors app.js: expected duration, used to size a calendar block. 0 = none.
    estimateMinutes: normalizeEstimateMinutes(source.estimateMinutes),
    // Mirrors app.js: the category the placed block is filed under. "" = let the
    // app guess from the text at placement time.
    calendarCategory: calendarCategoryCodes.has(String(source.calendarCategory || "").trim().toUpperCase())
      ? String(source.calendarCategory).trim().toUpperCase()
      : "",
    project: String(source.project || "").trim(),
    labels: labels.map((label) => String(label || "").trim()).filter(Boolean),
    priority: ["p1", "p2", "p3", "p4"].includes(source.priority) ? source.priority : "p4",
    dueDate,
    // Mirrors app.js: HH:MM the task is meant to start, from quick-add ("2pm").
    // Advisory only -- it seeds the placement bubble; the calendar block remains
    // the record of when the work is actually booked.
    dueTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(String(source.dueTime || "")) ? String(source.dueTime) : "",
    createdAt: source.createdAt || new Date().toISOString(),
    updatedAt: source.updatedAt || null,
    source: source.source || sectionKey || "inbox",
    sourceDate: /^\d{4}-\d{2}-\d{2}$/.test(String(source.sourceDate || "")) ? source.sourceDate : "",
    previousIndex: source.previousIndex,
    completedAt: source.completedAt || null,
    // Mirrors app.js: which surface checked the task off. Null on anything
    // completed before this was tracked, and on tasks that are not complete.
    completedVia: taskCompletionSurfaces.has(source.completedVia) ? source.completedVia : null,
    discardedAt: source.discardedAt || null
  };
}

function normalizeCalendarEvents(input) {
  const source = Array.isArray(input) ? input : [];
  return source.map(normalizeCalendarEvent).filter(Boolean).sort((a, b) => {
    if (a.start !== b.start) return a.start.localeCompare(b.start);
    return a.title.localeCompare(b.title);
  });
}

// Mirror of the app.js normaliser; see the long note there for what the three
// zone fields mean and why only one side of the wire re-localises.
function normalizeEventZoneShift(raw) {
  if (!raw || typeof raw !== "object") return null;
  const from = isValidTimeZone(raw.from) ? String(raw.from).trim() : "";
  const to = isValidTimeZone(raw.to) ? String(raw.to).trim() : "";
  if (!from || !to || from === to) return null;
  const when = String(raw.when || "end").trim();
  return { from, to, when: when === "start" || /^\d{2}:\d{2}$/.test(when) ? when : "end" };
}

function normalizeTransitLog(raw) {
  const rows = Array.isArray(raw) ? raw.slice(0, 48).map((line) => String(line || "").trim()) : [];
  while (rows.length && !rows[rows.length - 1]) rows.pop();
  return rows;
}

function normalizeCalendarEvent(event) {
  if (!event || typeof event !== "object") return null;
  const title = String(event.title || "").trim();
  const start = normalizeCalendarDateTime(event.start);
  if (!title || !start) return null;
  const end = normalizeCalendarDateTime(event.end) || start;
  const category = calendarCategoryCodes.has(event.category) ? event.category : "";
  const repeatDays = Array.isArray(event.repeatDays)
    ? [...new Set(event.repeatDays.map(Number).filter((day) => day >= 0 && day <= 6))].sort((a, b) => a - b)
    : [];
  const exceptionDates = Array.isArray(event.exceptionDates)
    ? [...new Set(event.exceptionDates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))))].sort()
    : [];
  const kind = event.kind === "actual" ? "actual" : event.kind === "deadline" ? "deadline" : "plan";
  return {
    id: String(event.id || `cal-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    title,
    start,
    // Mirrors app.js: a deadline is a moment, so its end is pinned to its start.
    end: kind === "deadline" ? start : end < start ? start : end,
    allDay: Boolean(event.allDay),
    kind,
    // Mirrors app.js: only a plan event can be tentative (FYI / optional).
    tentative: kind === "plan" && Boolean(event.tentative),
    // Mirrors app.js: when this plan block was archived by a re-plan; empty
    // means it is the current plan. Dropping it here would silently resurrect
    // every old plan on the next save.
    supersededAt: kind === "plan" && event.supersededAt ? String(event.supersededAt).trim() : "",
    // Mirrors app.js: on a deadline, how long the work is expected to take.
    estimateMinutes: normalizeEstimateMinutes(event.estimateMinutes),
    // Mirrors app.js: the task this block was placed from, if any.
    taskId: String(event.taskId || "").trim(),
    // Mirrors app.js: the deadline this plan block was placed from, if any.
    // Like taskId, dropping it here would silently un-plan deadlines on save.
    deadlineId: String(event.deadlineId || "").trim(),
    category,
    workCategory: String(event.workCategory || "").trim(),
    workAssignedBy: String(event.workAssignedBy || "").trim(),
    location: String(event.location || "").trim(),
    link: String(event.link || "").trim(),
    notes: String(event.notes || "").trim(),
    recurrence: calendarRecurrences.has(event.recurrence) ? event.recurrence : "none",
    repeatDays,
    recurrenceEndDate: /^\d{4}-\d{2}-\d{2}$/.test(String(event.recurrenceEndDate || "")) ? String(event.recurrenceEndDate) : "",
    exceptionDates,
    color: /^#[a-f0-9]{6}$/i.test(String(event.color || "")) ? event.color : "#116b68",
    /* Preserved, never converted. app.js re-localises a pegged event into the
       zone it was lived in; doing the same here would be actively wrong, because
       the server is one process serving a laptop in one zone and a phone that may
       still be set to another, and whichever asked last would win. The file keeps
       what the client wrote and lets each client read it in its own terms. */
    zone: isValidTimeZone(event.zone) ? String(event.zone).trim() : "",
    tz: isValidTimeZone(event.tz) ? String(event.tz).trim() : "",
    zoneShift: normalizeEventZoneShift(event.zoneShift),
    // Mirrors app.js: one line per real hour of a move, index = hours since
    // the start instant. Preserved, never interpreted.
    transitLog: normalizeTransitLog(event.transitLog),
    source: String(event.source || "local"),
    calendarId: String(event.calendarId || "local"),
    providerId: event.providerId ? String(event.providerId) : null,
    // Mirrors app.js: the Google event this local plan block was pushed up as.
    // Dropping it here would leave the push ledger as the only record, and any
    // client that re-saved the event would look like it had never been pushed.
    googleEventId: event.googleEventId ? String(event.googleEventId) : "",
    updatedAt: event.updatedAt || new Date().toISOString(),
    createdAt: event.createdAt || event.updatedAt || new Date().toISOString()
  };
}

function normalizeCalendarDateTime(value) {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return `${text}T00:00`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text)) return text;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(text)) return text.slice(0, 16);
  return "";
}

function validDateOrToday(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return value;
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

/* --- Time zones -------------------------------------------------------------

   Mirror of the block in app.js; see the long note there for why wall clock
   cannot do arithmetic across a move and why Intl is the source of truth for
   offsets. Kept identical on purpose -- the server writes the same transition
   rows the app does, and a divergence here would show up as durations that
   disagree depending on which side computed them.
--------------------------------------------------------------------------- */

const zoneWallClockPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const zoneOffsetFormatters = new Map();

function isValidTimeZone(zone) {
  const name = String(zone || "").trim();
  if (!name) return false;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: name });
    return true;
  } catch {
    return false;
  }
}

function currentTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function zoneOffsetFormatter(zone) {
  let formatter = zoneOffsetFormatters.get(zone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    zoneOffsetFormatters.set(zone, formatter);
  }
  return formatter;
}

function zoneOffsetMinutes(zone, ms = Date.now()) {
  if (!isValidTimeZone(zone)) return -new Date(ms).getTimezoneOffset();
  const parts = {};
  for (const part of zoneOffsetFormatter(zone).formatToParts(new Date(ms))) parts[part.type] = part.value;
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second)
  );
  return Math.round((asUTC - ms) / 60000);
}

function zoneWallClockToInstant(wall, zone) {
  const text = String(wall || "").trim();
  if (!zoneWallClockPattern.test(text)) return NaN;
  const naive = Date.UTC(
    Number(text.slice(0, 4)),
    Number(text.slice(5, 7)) - 1,
    Number(text.slice(8, 10)),
    Number(text.slice(11, 13)),
    Number(text.slice(14, 16))
  );
  if (!isValidTimeZone(zone)) return naive + new Date(naive).getTimezoneOffset() * 60000;
  const guess = naive - zoneOffsetMinutes(zone, naive) * 60000;
  const settled = naive - zoneOffsetMinutes(zone, guess) * 60000;
  // A clock inside a DST gap has no instant; the two-pass result lands before
  // the gap, so a failed round trip falls back to the forward shift. See app.js.
  return instantToZoneWallClock(settled, zone) === text ? settled : guess;
}

function instantToZoneWallClock(ms, zone) {
  if (!Number.isFinite(ms)) return "";
  const offset = isValidTimeZone(zone) ? zoneOffsetMinutes(zone, ms) : -new Date(ms).getTimezoneOffset();
  return new Date(ms + offset * 60000).toISOString().slice(0, 16);
}

function convertZoneWallClock(wall, fromZone, toZone) {
  const text = String(wall || "").trim();
  if (!zoneWallClockPattern.test(text)) return text;
  if (!fromZone || !toZone || fromZone === toZone) return text;
  if (!isValidTimeZone(fromZone) || !isValidTimeZone(toZone)) return text;
  return instantToZoneWallClock(zoneWallClockToInstant(text, fromZone), toZone);
}

/* --- The transition log -----------------------------------------------------

   timezone-history.json is the record of every time the ground moved: one row
   per zone change, each pinned to a single instant. A row is deliberately not
   "from this date I lived in Bangkok" -- a date cannot say which of a travel
   day's two mornings came first, and the hours a move adds or removes land
   inside a date, not between two of them.

   `at` is wall clock in the zone being *left*, because that is the clock you
   were reading when you left. `atInstant` is derived from it on every
   normalisation rather than trusted from the payload: the wall clock is what a
   person types and edits, so it has to be the one that wins, or correcting a
   time in Settings would leave the arithmetic pointing at the old moment.
--------------------------------------------------------------------------- */

const zoneTransitionSources = new Set(["event", "manual", "seed", "device"]);

function zoneTransitionId() {
  return `tz-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeZoneTransition(raw) {
  if (!raw || typeof raw !== "object") return null;
  const from = String(raw.from || "").trim();
  const to = String(raw.to || "").trim();
  // A move to the zone you are already in is not a move. Dropping it here keeps
  // the timeline free of rows that would render as a zero-length segment.
  if (!isValidTimeZone(from) || !isValidTimeZone(to) || from === to) return null;
  const at = normalizeCalendarDateTime(raw.at);
  if (!at) return null;
  const instant = zoneWallClockToInstant(at, from);
  if (!Number.isFinite(instant)) return null;
  return {
    id: String(raw.id || zoneTransitionId()),
    from,
    to,
    at,
    atInstant: new Date(instant).toISOString(),
    // Set when a calendar block carries the shift, so editing or deleting the
    // flight can find its row again instead of leaving an orphan behind.
    eventId: String(raw.eventId || "").trim(),
    source: zoneTransitionSources.has(raw.source) ? raw.source : "manual",
    // A row whose clock is a guess -- the seed, or a device flip noticed hours
    // later. The app asks about these instead of quietly counting them.
    approximate: Boolean(raw.approximate),
    note: String(raw.note || "").trim(),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString()
  };
}

function normalizeZoneTransitions(input) {
  const rows = (Array.isArray(input) ? input : []).map(normalizeZoneTransition).filter(Boolean);
  // One shift per event: the block is the source of truth, so a stale duplicate
  // left by an earlier save loses to the newest row carrying that id.
  const byEvent = new Map();
  for (const row of rows) if (row.eventId) byEvent.set(row.eventId, row);
  const seen = new Set();
  const kept = [];
  for (const row of rows) {
    if (row.eventId) {
      if (seen.has(row.eventId) || byEvent.get(row.eventId) !== row) continue;
      seen.add(row.eventId);
    }
    kept.push(row);
  }
  return kept.sort((a, b) => (a.atInstant === b.atInstant ? a.id.localeCompare(b.id) : a.atInstant.localeCompare(b.atInstant)));
}

/* Rows written once, on the first read of a machine that has no file yet. Empty
   here: a fresh install has no zone history. If you are importing data that was
   lived in more than one zone, add each past move as a row -- with
   `approximate: true` when the clock is a guess, which puts a "set the time"
   prompt in Settings rather than pretending 12:00 was the moment. */
const SEED_ZONE_TRANSITIONS = [];

async function readZoneTransitions() {
  const stored = await readJsonFile(timezoneHistoryPath, null);
  if (stored === null) {
    const seeded = normalizeZoneTransitions(SEED_ZONE_TRANSITIONS);
    await writeJsonFile(timezoneHistoryPath, seeded).catch(() => undefined);
    return seeded;
  }
  return normalizeZoneTransitions(stored);
}

// The zone in force at an instant, walking the log forward. Before the first
// row you were in whatever zone that row says you left.
function zoneAtInstant(transitions, ms, fallbackZone) {
  let zone = transitions.length ? transitions[0].from : fallbackZone;
  for (const row of transitions) {
    if (Date.parse(row.atInstant) <= ms) zone = row.to;
    else break;
  }
  return zone || fallbackZone;
}

/* The device zone is evidence, not testimony. A laptop opened in a new country
   proves you are there now; it cannot say when you crossed, and a VPN or a
   machine that simply had not been opened in a week can make it say the wrong
   thing entirely. So a mismatch becomes a question the app asks -- never a row
   this function writes. */
async function getTimezoneHistory(res) {
  const transitions = await readZoneTransitions();
  const deviceZone = currentTimeZone();
  const knownZone = zoneAtInstant(transitions, Date.now(), deviceZone);
  const suggestion =
    deviceZone !== knownZone && isValidTimeZone(deviceZone)
      ? { from: knownZone, to: deviceZone, noticedAt: new Date().toISOString() }
      : null;
  sendJson(res, 200, { transitions, deviceZone, knownZone, suggestion });
}

async function saveTimezoneHistory(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const transitions = normalizeZoneTransitions(payload.transitions);
  await writeJsonFile(timezoneHistoryPath, transitions);
  sendJson(res, 200, { transitions, deviceZone: currentTimeZone() });
}

async function getCustomChoices(res) {
  try {
    const text = await fs.readFile(customChoicesPath, "utf8");
    sendJson(res, 200, JSON.parse(text));
  } catch {
    sendJson(res, 200, {});
  }
}

async function saveCustomChoices(req, res) {
  const body = await readBody(req);
  const customChoices = JSON.parse(body || "{}");
  await writeDataFile(customChoicesPath, customChoices);
  sendJson(res, 200, { ok: true, path: customChoicesPath });
}

// --- Monthly reviews --------------------------------------------------------
// The −5..+5 monthly retrospective that used to live in "New Years Goals
// Progress Check-In.xlsx". Object-shaped: { months: { "2026-08": { rows,
// updatedAt, imported? } } }. Rows carry goalId when they map to goals.json and
// always carry title, so imported months from before the app can still render.
// Writes are month-scoped and serialised through one chain (the learn-list
// pattern): the review view saving August must not clobber an import of March
// landing at the same moment. Takes no part in the entry revision model.

let monthlyReviewWriteChain = Promise.resolve();

function normalizeMonthlyReviewRow(raw) {
  const grade = Number(raw?.grade);
  return {
    goalId: typeof raw?.goalId === "string" ? raw.goalId : "",
    title: String(raw?.title || "").trim(),
    header: raw?.header === true,
    grade: Number.isFinite(grade) && !raw?.header ? Math.max(-5, Math.min(5, grade)) : null,
    explain: String(raw?.explain || ""),
    change: String(raw?.change || "")
  };
}

function queueMonthlyReviewWrite(mutate) {
  const run = monthlyReviewWriteChain.then(async () => {
    const stored = await readJsonFile(monthlyReviewsPath, { version: 1, months: {} });
    const doc = stored && typeof stored === "object" && !Array.isArray(stored) ? stored : { version: 1, months: {} };
    if (!doc.months || typeof doc.months !== "object") doc.months = {};
    mutate(doc);
    await writeJsonFile(monthlyReviewsPath, doc);
    return doc;
  });
  monthlyReviewWriteChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function getMonthlyReviews(res) {
  const stored = await readJsonFile(monthlyReviewsPath, { version: 1, months: {} });
  const doc = stored && typeof stored === "object" && !Array.isArray(stored) ? stored : { version: 1, months: {} };
  if (!doc.months || typeof doc.months !== "object") doc.months = {};
  sendJson(res, 200, doc);
}

async function saveMonthlyReview(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const month = String(payload.month || "");
  if (!/^\d{4}-\d{2}$/.test(month)) return sendJson(res, 400, { error: "month must be YYYY-MM" });
  if (!Array.isArray(payload.rows)) return sendJson(res, 400, { error: "rows must be an array" });
  const rows = payload.rows.map(normalizeMonthlyReviewRow).filter((row) => row.title || row.goalId);
  const doc = await queueMonthlyReviewWrite((current) => {
    current.months[month] = {
      rows,
      imported: payload.imported === true || current.months[month]?.imported === true || undefined,
      updatedAt: new Date().toISOString()
    };
  });
  sendJson(res, 200, { ok: true, month, months: doc.months });
}

// The workbook shape the user's review sheet has always had: four columns, one
// ALL-CAPS category row above each group. The client sends the rows already in
// sheet order; this end only wraps them into a valid .xlsx. Excel treats a
// missing styles part as corrupt, which is why the minimal one is included.
async function exportMonthlyReviewXlsx(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const month = String(payload.month || "");
  if (!/^\d{4}-\d{2}$/.test(month)) return sendJson(res, 400, { error: "month must be YYYY-MM" });
  if (!Array.isArray(payload.rows) || !payload.rows.length) {
    return sendJson(res, 400, { error: "rows must be a non-empty array" });
  }
  const sheetName = String(payload.sheetName || month).replace(/[\[\]:*?/\\]/g, "").slice(0, 31) || month;
  const rows = payload.rows.map((row) => (Array.isArray(row) ? row : Array.isArray(row?.cells) ? row.cells : [])).slice(0, 500);
  const buffer = buildXlsxWorkbook(sheetName, rows);
  const fileName = `monthly-review-${month}.xlsx`;
  res.writeHead(200, {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="${fileName}"`,
    "Content-Length": buffer.length,
    "Cache-Control": "no-store"
  });
  res.end(buffer);
}

function xlsxEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // Control characters are illegal in XML 1.0 and Excel refuses the file.
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
}

function xlsxColumnName(index) {
  let name = "";
  let n = index;
  do {
    name = String.fromCharCode(65 + (n % 26)) + name;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return name;
}

function buildXlsxWorkbook(sheetName, rows) {
  const rowXml = rows
    .map((cells, rowIndex) => {
      const cellXml = cells
        .map((value, cellIndex) => {
          const ref = `${xlsxColumnName(cellIndex)}${rowIndex + 1}`;
          if (typeof value === "number" && Number.isFinite(value)) {
            return `<c r="${ref}"><v>${value}</v></c>`;
          }
          const text = String(value ?? "");
          if (!text) return "";
          // Wrap-text style (s="1") on strings so long Explain cells stay readable.
          return `<c r="${ref}" s="1" t="inlineStr"><is><t xml:space="preserve">${xlsxEscape(text)}</t></is></c>`;
        })
        .filter(Boolean)
        .join("");
      return `<row r="${rowIndex + 1}">${cellXml}</row>`;
    })
    .join("");
  const sheetXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<cols><col min="1" max="1" width="58" customWidth="1"/><col min="2" max="2" width="12" customWidth="1"/>` +
    `<col min="3" max="4" width="48" customWidth="1"/></cols>` +
    `<sheetData>${rowXml}</sheetData></worksheet>`;
  const workbookXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ` +
    `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<sheets><sheet name="${xlsxEscape(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`;
  const workbookRels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    `</Relationships>`;
  const rootRels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
    `</Relationships>`;
  const stylesXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>` +
    `<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>` +
    `<borders count="1"><border/></borders>` +
    `<cellStyleXfs count="1"><xf/></cellStyleXfs>` +
    `<cellXfs count="2"><xf/><xf applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf></cellXfs>` +
    `</styleSheet>`;
  const contentTypesXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
    `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
    `</Types>`;
  return buildZipArchive([
    ["[Content_Types].xml", contentTypesXml],
    ["_rels/.rels", rootRels],
    ["xl/workbook.xml", workbookXml],
    ["xl/_rels/workbook.xml.rels", workbookRels],
    ["xl/styles.xml", stylesXml],
    ["xl/worksheets/sheet1.xml", sheetXml]
  ]);
}

// A stored (uncompressed) zip is all a .xlsx needs and keeps this dependency-free.
const zipCrcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function zipCrc32(buffer) {
  let crc = 0xffffffff;
  for (let index = 0; index < buffer.length; index += 1) {
    crc = zipCrcTable[(crc ^ buffer[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZipArchive(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const now = new Date();
  const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2)) & 0xffff;
  const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;
  for (const [name, content] of files) {
    const nameBuffer = Buffer.from(name, "utf8");
    const data = Buffer.from(content, "utf8");
    const crc = zipCrc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8); // stored, no compression
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, nameBuffer, data);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(dosTime, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuffer.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, nameBuffer);
    offset += local.length + nameBuffer.length + data.length;
  }
  const centralSize = centralParts.reduce((size, part) => size + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, ...centralParts, end]);
}

// --- Goals -----------------------------------------------------------------
// Goal state deliberately lives outside entries/*.json and takes no part in the
// entry revision model. Check-ins are append-only events, so there is no merge
// path to get wrong (see LLM_README "Never let the client adopt a revision
// without the data") and an offline client can safely replay a queue later.

const emptyGoalsDoc = {
  version: 1,
  contexts: ["travel", "davis", "dc"],
  contextSchedule: [],
  backlogGraceDays: 2,
  ruleSchedule: {},
  goals: []
};

// "materialize" records that a daily goal's task was created for a date; it is
// the guard against making it twice. An unknown kind falls back to "check", so
// omitting one here does not fail loudly — it silently books a habit as done.
// "unanswered" is deliberately not "miss". A goal that materialised and was never
// responded to is a hole in the record, and calling it a failure would invent
// data; calling it nothing at all leaves the denominator wrong in the flattering
// direction. It is its own kind so a rate can be computed honestly:
// checks / (checks + misses) is adherence, unanswered is coverage.
const goalEventKinds = new Set(["check", "count", "rating", "miss", "undo", "materialize", "unanswered"]);
// Kinds that count as the user having responded to a materialised goal.
const goalResponseKinds = new Set(["check", "count", "rating", "miss", "undo"]);
// How far back the nightly sweep will look. Anything older than this was either
// already resolved or is never going to be.
const GOAL_ROLLUP_LOOKBACK_DAYS = 30;
let goalLogWriteChain = Promise.resolve();

async function getGoals(res) {
  sendJson(res, 200, await readJsonFile(goalsPath, emptyGoalsDoc));
}

async function saveGoals(req, res) {
  const body = await readBody(req);
  const doc = JSON.parse(body || "{}");
  if (!doc || typeof doc !== "object" || !Array.isArray(doc.goals)) {
    return sendJson(res, 400, { error: "goals payload must include a goals array" });
  }
  doc.updatedAt = new Date().toISOString();
  await writeJsonFile(goalsPath, doc);
  sendJson(res, 200, { ok: true, path: goalsPath });
}

async function getGoalLog(url, res) {
  const stored = await readJsonFile(goalLogPath, []);
  const rows = Array.isArray(stored) ? stored : [];
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";
  const events = rows.filter((row) => (!from || row.date >= from) && (!to || row.date <= to));
  sendJson(res, 200, { events });
}

async function appendGoalLog(req, res) {
  const body = await readBody(req);
  const payload = JSON.parse(body || "{}");
  const incoming = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.events)
      ? payload.events
      : [payload];
  const events = incoming.map(normalizeGoalEvent).filter(Boolean);
  if (!events.length) return sendJson(res, 400, { error: "No valid goal events" });
  const appended = await queueGoalLogAppend(events);
  sendJson(res, 200, { ok: true, appended: appended.length, events: appended });
}

// Materialising a daily goal writes a "materialize" row; responding to it writes
// a check/miss/rating/count. A day where the goal appeared and was simply ignored
// wrote nothing at all, so those days were invisible rather than counted -- which
// is why goal adherence looked better than it was. This closes the books on days
// that are far enough past the backlog grace window to be settled, writing one
// "unanswered" row per goal that never got a response.
//
// Runs at startup and hourly. It is idempotent: a day that already has a response
// or an unanswered row for a goal is skipped, so re-running never double-counts.
async function finalizeUnansweredGoalDays() {
  const doc = await readJsonFile(goalsPath, emptyGoalsDoc);
  const grace = Math.max(0, Number(doc.backlogGraceDays ?? 2) || 0);
  const stored = await readJsonFile(goalLogPath, []);
  const rows = Array.isArray(stored) ? stored : [];

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - grace);
  const earliest = new Date(cutoff);
  earliest.setDate(earliest.getDate() - GOAL_ROLLUP_LOOKBACK_DAYS);

  const materialized = new Map();
  const answered = new Set();
  for (const row of rows) {
    if (!row || !row.goalId || !row.date) continue;
    const key = `${row.date}|${row.goalId}`;
    if (row.kind === "materialize") materialized.set(key, row);
    else if (goalResponseKinds.has(row.kind) || row.kind === "unanswered") answered.add(key);
  }

  const events = [];
  for (const [key, row] of materialized) {
    if (answered.has(key)) continue;
    const day = new Date(`${row.date}T00:00:00`);
    if (Number.isNaN(day.getTime()) || day >= cutoff || day < earliest) continue;
    events.push(
      normalizeGoalEvent({
        goalId: row.goalId,
        date: row.date,
        kind: "unanswered",
        value: null,
        source: "rollup"
      })
    );
  }
  if (events.length) await queueGoalLogAppend(events);
  return events.length;
}

// ---------------------------------------------------------------------------
// Evidence-backed daily goals
//
// A daily goal used to be answerable only by its task row being ticked, which
// let the log contradict the entry sitting next to it: the morning survey was
// filled in on 19 of 22 days but the log read 2 checks and 4 misses, because
// the row expired unticked while the answered survey was right there in the
// entry. Where the entry (or the eye-rest log) already proves what happened,
// that record is the answer and the tick is only a shortcut to it.
//
// A rule returns true (did it), false (demonstrably did not) or null (this day
// holds no evidence either way). null must never become a miss: that is the
// same lie in the other direction, and "unanswered is coverage, not failure"
// is already the rule the rollup sweep works to.
//
// Goals absent from this table keep the old semantics exactly -- Anki, LinkedIn,
// Chinese reading and the day plan leave no trace anywhere but the tick, so for
// them the expiring task genuinely is the answer.

// Slider blocks are stored as one "Label: value; Label: value" string, and an
// untouched block still carries every label. Answered means at least one label
// got a value.
function surveyValueAnswered(value) {
  // Attachment answers (file, audio, video) carry a `files` array beside the
  // same `text`/`image` keys textImage uses. A voice note with nothing typed
  // next to it is an answer.
  if (value && typeof value === "object") {
    return Boolean(String(value.text || "").trim() || value.image || (Array.isArray(value.files) && value.files.length));
  }
  const text = String(value ?? "").trim();
  if (!text) return false;
  if (!text.includes(":")) return true;
  return text.split(";").some((part) => {
    const colon = part.indexOf(":");
    return colon === -1 ? Boolean(part.trim()) : Boolean(part.slice(colon + 1).trim());
  });
}

// `rulecheck` and `dailycheck` are mirrors the app writes back from goal-log
// rows, not answers typed by hand (see LLM_README, "Goal state never touches
// entries"). Counting them would let rating a rule masquerade as having filled
// in the night survey. Keys starting with "_" are calendar-autofill flags.
const derivedSurveyKeys = new Set(["rulecheck", "dailycheck"]);

function surveyHasAnswer(session) {
  const survey = session && typeof session === "object" ? session.survey : null;
  if (!survey || typeof survey !== "object") return false;
  return Object.entries(survey).some(
    ([key, value]) =>
      !key.startsWith("_") && !derivedSurveyKeys.has(key) && surveyValueAnswered(value)
  );
}

// A stray sentence left in the box is not a journal entry. Twenty words is the
// shortest thing in the history that reads as one.
const journalMinWords = 20;
// Eye rest lost its night-survey checkbox once eyerest-capture.ps1 started
// logging every break, so a session count is now the only available bar. Five
// is not arbitrary: it is the threshold that reproduces all three answers that
// were given by hand before the checkbox went (5 sessions -> yes, 4 -> no,
// 1 -> no). It is a proxy for "every 30 minutes" and a weak one; see the
// LLM_README note before treating a green day as the habit actually held.
const eyeRestMinSessions = 5;
// Both hours goals are answered by the calendar, not by entry.hours -- that
// grid has been empty every day since well before the goals went live, while
// the same days carry 6-23 hours of `actual` events. Sixteen hours of the day
// accounted for is where a partial log stops and a real one starts.
const hoursLoggedMinMinutes = 16 * 60;

function journalWordCount(entry) {
  return String((entry && entry.journal) || "").split(/\s+/).filter(Boolean).length;
}

function surveyLabelValue(text, labelPrefix) {
  for (const part of String(text || "").split(";")) {
    const colon = part.indexOf(":");
    if (colon === -1) continue;
    if (part.slice(0, colon).trim().toLowerCase().startsWith(labelPrefix.toLowerCase())) {
      return part.slice(colon + 1).trim();
    }
  }
  return "";
}

// Minutes of `date` covered by actual events passing `keep`, clipped to the day
// and merged rather than summed. Summing would double-count by design: an eye
// rest and the blind journaling inside it deliberately overlap, and a day with
// four such pairs would look like eight hours of logging it never had.
function coveredActualMinutes(events, date, keep) {
  const dayStart = new Date(`${date}T00:00`);
  const dayEnd = new Date(`${date}T00:00`);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const spans = [];
  for (const event of events) {
    if (!event || event.kind !== "actual") continue;
    if (keep && !keep(event)) continue;
    const start = new Date(String(event.start || ""));
    const end = new Date(String(event.end || ""));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;
    const from = Math.max(start.getTime(), dayStart.getTime());
    const to = Math.min(end.getTime(), dayEnd.getTime());
    if (to > from) spans.push([from, to]);
  }
  spans.sort((a, b) => a[0] - b[0]);
  let total = 0;
  let cursor = null;
  for (const [from, to] of spans) {
    if (!cursor) {
      cursor = [from, to];
      continue;
    }
    if (from <= cursor[1]) {
      cursor[1] = Math.max(cursor[1], to);
      continue;
    }
    total += cursor[1] - cursor[0];
    cursor = [from, to];
  }
  if (cursor) total += cursor[1] - cursor[0];
  return total / 60000;
}

function clockToMinutes(text) {
  const match = /(\d{1,2}):(\d{2})/.exec(String(text || ""));
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

// ctx: { date, entry, eyeRestSessions, calendarEvents }
const dailyGoalEvidence = {
  "daily-morning-survey": (ctx) => surveyHasAnswer(ctx.entry && ctx.entry.morning),
  "daily-night-survey": (ctx) => surveyHasAnswer(ctx.entry && ctx.entry.night),
  "daily-journaling": (ctx) => journalWordCount(ctx.entry) >= journalMinWords,
  "daily-eye-rest": (ctx) => (ctx.eyeRestSessions.get(ctx.date) || 0) >= eyeRestMinSessions,
  // "Writing out what I did" -- the hours of the day carrying a description.
  "daily-qual-hours": (ctx) =>
    coveredActualMinutes(ctx.calendarEvents, ctx.date, (event) =>
      Boolean(String(event.title || "").trim())
    ) >= hoursLoggedMinMinutes,
  // "The categories like work and travel and sleep" -- the hours filed under
  // one. A day can pass the qualitative test and fail this one -- described
  // for 22 hours but categorised for only 15 -- which is exactly the
  // difference the two goals exist to tell apart.
  "daily-quant-hours": (ctx) =>
    coveredActualMinutes(ctx.calendarEvents, ctx.date, (event) =>
      Boolean(String(event.category || "").trim())
    ) >= hoursLoggedMinMinutes
};

// Outcomes this file wrote itself may be revised when the evidence disagrees;
// an answer the user gave on a surface never is. That boundary is what lets the
// sweep correct its own historical false misses without ever overwriting a
// deliberate tick.
const machineGoalSources = new Set(["task", "rollup", "evidence"]);

async function readEyeRestSessions() {
  const stored = await readJsonFile(eyeRestLogPath, []);
  const rows = Array.isArray(stored) ? stored : [];
  const counts = new Map();
  for (const row of rows) {
    const date = String((row && (row.date || row.ts)) || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    counts.set(date, (counts.get(date) || 0) + 1);
  }
  return counts;
}

async function readCalendarActuals() {
  const stored = await readJsonFile(calendarEventsPath, []);
  const rows = Array.isArray(stored) ? stored : stored && Array.isArray(stored.events) ? stored.events : [];
  return rows.filter((row) => row && row.kind === "actual");
}

// Books what the entry proves, for one date. `closeBooks` is off on the live
// save path -- during the day a survey that is not filled in yet is not a miss,
// it is simply not filled in yet -- and on for the rollup sweep, which runs
// only over days already past the backlog grace window.
async function settleEvidenceGoals(date, options = {}) {
  const closeBooks = Boolean(options.closeBooks);
  const doc = options.doc || (await readJsonFile(goalsPath, emptyGoalsDoc));
  const goals = Array.isArray(doc.goals) ? doc.goals : [];
  const context = goalContextOn(doc, date);
  const active = goals.filter(
    (goal) =>
      goal &&
      goal.type === "daily" &&
      dailyGoalEvidence[goal.id] &&
      goalAppliesOnDate(goal, date, context)
  );
  if (!active.length) return [];

  const rows = options.rows || (await readJsonFile(goalLogPath, []));
  const log = Array.isArray(rows) ? rows : [];
  const latestResponse = new Map();
  for (const row of log) {
    if (!row || row.date !== date || !goalResponseKinds.has(row.kind)) continue;
    const found = latestResponse.get(row.goalId);
    if (!found || String(row.ts) >= String(found.ts)) latestResponse.set(row.goalId, row);
  }

  // Each cross-day source is read only if some active goal needs it, so the
  // common case (surveys and journaling) still touches one file. The backlog
  // sweep passes `sources` so thirty days do not re-read the same two.
  const needs = (id) => active.some((goal) => goal.id === id);
  const sources = options.sources || {};
  if (needs("daily-eye-rest") && !sources.eyeRestSessions) {
    sources.eyeRestSessions = await readEyeRestSessions();
  }
  if ((needs("daily-qual-hours") || needs("daily-quant-hours")) && !sources.calendarEvents) {
    sources.calendarEvents = await readCalendarActuals();
  }
  const ctx = {
    date,
    entry: await readEntry(date),
    eyeRestSessions: sources.eyeRestSessions || new Map(),
    calendarEvents: sources.calendarEvents || []
  };

  const events = [];
  for (const goal of active) {
    let verdict = null;
    try {
      verdict = dailyGoalEvidence[goal.id](ctx);
    } catch {
      // A malformed answer is missing evidence, not a failed day.
      verdict = null;
    }
    const previous = latestResponse.get(goal.id) || null;
    if (previous && !machineGoalSources.has(String(previous.source || ""))) continue;
    if (verdict === true) {
      if (previous && previous.kind === "check" && previous.value) continue;
      events.push(
        normalizeGoalEvent({ goalId: goal.id, date, kind: "check", value: true, source: "evidence" })
      );
      continue;
    }
    if (!closeBooks) continue;
    if (verdict === false) {
      if (previous && previous.kind === "miss") continue;
      events.push(
        normalizeGoalEvent({ goalId: goal.id, date, kind: "miss", value: false, source: "evidence" })
      );
      continue;
    }
    // No evidence either way. Say so once, so the goal has coverage without a
    // fabricated outcome, and leave any earlier response alone.
    if (previous) continue;
    if (log.some((row) => row && row.date === date && row.goalId === goal.id && row.kind === "unanswered")) {
      continue;
    }
    events.push(
      normalizeGoalEvent({ goalId: goal.id, date, kind: "unanswered", value: null, source: "evidence" })
    );
  }
  if (events.length) await queueGoalLogAppend(events);
  return events;
}

function shiftDate(date, days) {
  const [year, month, day] = String(date).split("-").map(Number);
  const moved = new Date(year, month - 1, day + days);
  const pad = (value) => String(value).padStart(2, "0");
  return `${moved.getFullYear()}-${pad(moved.getMonth() + 1)}-${pad(moved.getDate())}`;
}

// Every day from the earliest active daily goal up to the backlog grace edge,
// so a stretch where the browser was never opened still gets settled from the
// entries that were written on the phone.
async function settleEvidenceGoalBacklog() {
  const doc = await readJsonFile(goalsPath, emptyGoalsDoc);
  const goals = Array.isArray(doc.goals) ? doc.goals : [];
  const starts = goals
    .filter((goal) => goal && goal.type === "daily" && dailyGoalEvidence[goal.id] && goal.activeFrom)
    .map((goal) => goal.activeFrom)
    .sort();
  if (!starts.length) return 0;

  const grace = Math.max(0, Number(doc.backlogGraceDays ?? 2) || 0);
  const today = validDateOrToday("");
  const last = shiftDate(today, -grace - 1);
  const lookback = shiftDate(today, -(GOAL_ROLLUP_LOOKBACK_DAYS + grace));
  let date = starts[0] > lookback ? starts[0] : lookback;
  let written = 0;
  const rows = await readJsonFile(goalLogPath, []);
  const log = Array.isArray(rows) ? rows : [];
  const sources = {};
  while (date <= last) {
    const events = await settleEvidenceGoals(date, { closeBooks: true, doc, rows: log, sources });
    for (const event of events) log.push(event);
    written += events.length;
    date = shiftDate(date, 1);
  }
  return written;
}

function normalizeGoalEvent(raw) {
  if (!raw || typeof raw !== "object") return null;
  const goalId = String(raw.goalId || "").trim();
  if (!goalId) return null;
  return {
    id: String(raw.id || crypto.randomUUID()),
    ts: typeof raw.ts === "string" && raw.ts ? raw.ts : new Date().toISOString(),
    date: validDateOrToday(raw.date),
    goalId,
    kind: goalEventKinds.has(raw.kind) ? raw.kind : "check",
    value: raw.value === undefined ? true : raw.value,
    note: typeof raw.note === "string" ? raw.note : "",
    source: typeof raw.source === "string" && raw.source ? raw.source : "app"
  };
}

// Serialised through a promise chain so concurrent appends cannot read-modify-write
// over each other. Ids already present are skipped, which makes replaying a queued
// batch from an offline client idempotent.
function queueGoalLogAppend(events) {
  const run = goalLogWriteChain.then(async () => {
    const stored = await readJsonFile(goalLogPath, []);
    const rows = Array.isArray(stored) ? stored : [];
    const seen = new Set(rows.map((row) => row.id));
    const fresh = events.filter((event) => !seen.has(event.id));
    if (fresh.length) {
      rows.push(...fresh);
      await writeJsonFile(goalLogPath, rows);
    }
    return fresh;
  });
  goalLogWriteChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

// Everything the HUD needs for a date, already filtered. The HUD is PowerShell;
// reimplementing context resolution and active-goal filtering there would mean
// two copies of the same rules drifting apart, so it stays here and the HUD just
// renders what it is handed.
async function getHudGoals(url, res) {
  const date = validDateOrToday(url.searchParams.get("date"));
  const doc = await readJsonFile(goalsPath, emptyGoalsDoc);
  const stored = await readJsonFile(goalLogPath, []);
  const log = Array.isArray(stored) ? stored : [];
  const goals = Array.isArray(doc.goals) ? doc.goals : [];
  const context = goalContextOn(doc, date);

  const latestFor = (goalId, kind) => {
    let found = null;
    for (const event of log) {
      if (event.goalId !== goalId || event.date !== date) continue;
      if (kind && event.kind !== kind) continue;
      if (!found || String(event.ts) >= String(found.ts)) found = event;
    }
    return found;
  };

  const ruleGoal = goals.find((goal) => goal.id === ((doc.ruleSchedule || {})[date] || "")) || null;
  const daily = goals
    .filter((goal) => goal.type === "daily" && goalAppliesOnDate(goal, date, context))
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .map((goal) => {
      const event = latestFor(goal.id, "check");
      return {
        id: goal.id,
        title: goalTitleFor(goal, context),
        done: Boolean(event && event.value)
      };
    });

  sendJson(res, 200, {
    date,
    context,
    rule: ruleGoal ? { id: ruleGoal.id, title: ruleGoal.title } : null,
    ruleRated: Boolean(ruleGoal && latestFor(ruleGoal.id, "rating")),
    daily,
    remaining: daily.filter((goal) => !goal.done).length
  });
}

function goalContextOn(doc, date) {
  let context = "";
  for (const row of doc.contextSchedule || []) {
    if (row && row.from && date >= row.from) context = row.context;
  }
  return context;
}

function goalAppliesOnDate(goal, date, context) {
  if (!goal || goal.archived) return false;
  if (goal.activeFrom && date < goal.activeFrom) return false;
  if (goal.activeTo && date > goal.activeTo) return false;
  if (!context || !Array.isArray(goal.contexts) || !goal.contexts.length) return true;
  return goal.contexts.includes(context);
}

function goalTitleFor(goal, context) {
  return (goal.contextLabels && goal.contextLabels[context]) || goal.title;
}

function normalizeChoice(value) {
  return String(value || "").trim().toLowerCase();
}

async function getEntry(url, res) {
  const date = url.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return sendJson(res, 400, { error: "Invalid date" });
  }
  const entryPath = path.join(entriesDir, `${date}.json`);
  try {
    const text = await fs.readFile(entryPath, "utf8");
    const entry = JSON.parse(text);
    ensureTaskState(entry);
    sendJson(res, 200, entry);
  } catch {
    sendJson(res, 404, { error: "Entry not found" });
  }
}

async function getEntries(res) {
  await fs.mkdir(entriesDir, { recursive: true });
  const files = await fs.readdir(entriesDir);
  const entries = {};
  for (const file of files) {
    if (!/^\d{4}-\d{2}-\d{2}\.json$/.test(file)) continue;
    try {
      const text = await fs.readFile(path.join(entriesDir, file), "utf8");
      const entry = JSON.parse(text);
      ensureTaskState(entry);
      if (entry?.date) entries[entry.date] = entry;
    } catch {
      // Skip broken saved entries.
    }
  }
  sendJson(res, 200, { entries });
}

async function serveStatic(req, url, res) {
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const cleanPath = path.normalize(decodeURIComponent(requested)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, cleanPath);
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) throw new Error("Not a file");
    const ext = path.extname(filePath).toLowerCase();
    // The app-style window is long-lived and, without revalidation, Edge
    // heuristically cached app.js/index.html and kept running an old bundle
    // after edits -- which once made the survey views look like they had been
    // replaced. A stale client is genuinely dangerous here, since it can clobber
    // newer entry data on save, so the browser must still check with the server
    // before running anything.
    //
    // no-store said that by forbidding storage outright, which also forbade
    // revalidating: every phone load re-downloaded app.js and styles.css whole,
    // ~550 KB over the network before the first paint. no-cache keeps the check
    // and drops the download -- the request still goes to the server every time,
    // but an unchanged file comes back as a 304 with no body. Size and mtime
    // identify the file: any edit moves both.
    const etag = `W/"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
    const headers = {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-cache, must-revalidate",
      ETag: etag
    };
    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304, headers);
      res.end();
      return;
    }
    const data = await fs.readFile(filePath);
    res.writeHead(200, headers);
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) {
        reject(new Error("Request too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

/* --- Capture outbox -----------------------------------------------------------

   The offline half of the hotkey captures (see windows/capture-outbox.ps1). A capture
   window that cannot reach this server parks its payload in outbox/ and closes
   as if it had been logged, because the alternative -- holding the dialog open
   until the server is back -- makes every capture only as reliable as a process
   the user is not supposed to think about. This drains the directory when the
   server comes up, and every five minutes after in case a window queued
   something while it was still starting.

   Replay is idempotent through captureId: the four capture endpoints record the
   ids they have stored and answer a repeat with { ok, duplicate } instead of
   writing a second row. That is what makes it safe to queue a POST that timed
   out *after* the server had already written it -- the ambiguous case no
   transport error can tell apart from a dead server. Same rule as the browser
   queue in LLM_README "Offline writes queue and replay", one layer down.

   A queued capture this server rejects is moved to outbox/rejected/ rather than
   deleted. It is bad data by then, but it is still something the user typed with
   their eyes shut, and the whole point of this file is that nothing typed into a
   capture window is ever thrown away by a machine.
--------------------------------------------------------------------------- */

const captureOutboxDir = path.join(root, "outbox");
const captureOutboxRejectedDir = path.join(captureOutboxDir, "rejected");
const captureIdsPath = path.join(root, "capture-ids.json");
// Dedupe state, not a record of anything: enough ids to cover a replay and no
// more. Deleting the file costs at worst one duplicated capture.
const CAPTURE_ID_MEMORY = 500;
// A queued file may only name an endpoint a capture window actually posts to.
// The outbox is a directory on disk, so this is the line that stops it being a
// way to reach the rest of the API.
const captureOutboxEndpoints = new Set([
  "/api/quick-journal",
  "/api/mistakes",
  "/api/learn-list",
  "/api/eyerest",
  "/api/work-session"
]);
let captureIdWriteChain = Promise.resolve();
let captureOutboxDraining = false;

async function captureAlreadyStored(captureId) {
  if (!captureId) return false;
  const stored = await readJsonFile(captureIdsPath, []);
  return Array.isArray(stored) && stored.includes(captureId);
}

function rememberCaptureId(captureId) {
  if (!captureId) return Promise.resolve();
  const run = captureIdWriteChain.then(async () => {
    const stored = await readJsonFile(captureIdsPath, []);
    const ids = Array.isArray(stored) ? stored.filter((id) => typeof id === "string") : [];
    if (ids.includes(captureId)) return;
    ids.push(captureId);
    await writeJsonFile(captureIdsPath, ids.slice(-CAPTURE_ID_MEMORY));
  });
  captureIdWriteChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function postToSelf(endpoint, payload) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify(payload), "utf8");
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        path: endpoint,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": body.length }
      },
      (res) => {
        let text = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          text += chunk;
        });
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = JSON.parse(text || "{}");
          } catch {
            parsed = null;
          }
          resolve({ status: res.statusCode || 0, body: parsed });
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(10_000, () => req.destroy(new Error("Replay timed out")));
    req.end(body);
  });
}

async function quarantineCaptureOutboxFile(filePath, name, why) {
  try {
    await fs.mkdir(captureOutboxRejectedDir, { recursive: true });
    await fs.rename(filePath, path.join(captureOutboxRejectedDir, name));
    console.warn(`Queued capture ${name} was rejected on replay (${why}); kept in outbox/rejected`);
  } catch {
    // Nothing to do but leave it where it is. A file that cannot be moved is
    // still a file that has not been lost.
  }
}

async function drainCaptureOutbox() {
  if (captureOutboxDraining) return;
  captureOutboxDraining = true;
  try {
    let names;
    try {
      names = await fs.readdir(captureOutboxDir);
    } catch {
      return;
    }
    // Names lead with the queue timestamp, so this replays in the order the
    // captures were written. It matters for eye rest, which queues the blind
    // journaling block and then the break it was written during.
    const queued = names.filter((name) => name.endsWith(".json")).sort();
    if (!queued.length) return;
    console.log(`Replaying ${queued.length} queued capture${queued.length === 1 ? "" : "s"}`);
    for (const name of queued) {
      const filePath = path.join(captureOutboxDir, name);
      let record = null;
      try {
        // Tolerate a BOM: anything writing these files from PowerShell is one
        // wrong -Encoding away from adding one, and a capture must not be lost
        // to a byte the parser dislikes.
        record = JSON.parse((await fs.readFile(filePath, "utf8")).replace(/^﻿/, ""));
      } catch {
        // Half-written or hand-edited. Left alone rather than dropped: a partial
        // file is a bug to look at, not something to delete on its behalf.
        continue;
      }
      const endpoint = String(record?.endpoint || "");
      if (!captureOutboxEndpoints.has(endpoint) || !record?.payload || typeof record.payload !== "object") {
        await quarantineCaptureOutboxFile(filePath, name, "unknown endpoint or payload");
        continue;
      }
      let result;
      try {
        result = await postToSelf(endpoint, record.payload);
      } catch {
        // Still unreachable, which on loopback means this server is going down.
        // Everything left keeps its place in line.
        return;
      }
      if (result.status === 200 && result.body?.ok) {
        await fs.rm(filePath, { force: true });
        continue;
      }
      if (result.status >= 400 && result.status < 500) {
        await quarantineCaptureOutboxFile(filePath, name, `HTTP ${result.status}`);
        continue;
      }
      // 5xx or an unparseable answer: this server is unhappy, not this capture.
      return;
    }
  } finally {
    captureOutboxDraining = false;
  }
}
