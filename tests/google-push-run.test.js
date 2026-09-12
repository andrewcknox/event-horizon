// Harness: extracts pushPlanEventsToGoogle() and the two write helpers it calls,
// hands them a fake Google that records every request, and runs whole syncs over
// fabricated blocks and ledgers.
//
// What this guards: the mapping is covered next door in google-push.test.js.
// This is the orchestration, where the expensive failures live -- every one of
// them writes real events into a real calendar and none of them throws:
//
//   - "Going forward only" means the first sync arms the push and uploads
//     nothing. Get this wrong and turning the feature on dumps every plan block
//     in the file onto the calendar.
//   - A block already in the ledger must be updated in place, never re-created.
//     A single stray POST here becomes a duplicate that never goes away, and
//     repeats once per sync forever.
//   - A block that stops being a live plan block -- deleted, archived by a
//     re-plan, turned into an actual -- has to be withdrawn from Google. Merely
//     skipping it leaves it on the phone permanently.
//   - Nothing may be re-sent when nothing changed. The push is on the sync
//     button, so an unchanged block that still PUTs would burn the write quota
//     on every press.
//   - pushedIds has to name every event the ledger owns, not just the ones this
//     run touched, or the pull that follows imports our own blocks back as
//     read-only twins.
//
// Run with: node tests/google-push-run.test.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const serverSource = fs.readFileSync(path.join(root, "server.cjs"), "utf8");

const sliceBetween = (source, from, to, label) => {
  const a = source.indexOf(from);
  const b = source.indexOf(to, a);
  if (a === -1 || b === -1) throw new Error(`Could not extract ${label}`);
  return source.slice(a, b);
};

let pass = 0;
let fail = 0;
const check = (name, condition, detail = "") => {
  if (condition) {
    pass += 1;
    console.log(`PASS ${name}`);
    return;
  }
  fail += 1;
  console.log(`FAIL ${name}${detail ? `  -> ${detail}` : ""}`);
};

const source = [
  sliceBetween(serverSource, "function googleScopeAllowsWrite(", "async function readGoogleCalendarPushMap(", "gates"),
  sliceBetween(serverSource, "async function pushPlanEventsToGoogle(", "\nfunction googleEventFromPlanEvent(", "push run"),
  sliceBetween(serverSource, "function googleEventFromPlanEvent(", "\nasync function disconnectGoogleCalendar(", "mapper")
].join("\n");

// Builds an isolated run: its own fake Google, its own auth, its own ledger.
// Everything the extracted code touches outside itself is injected here, so a
// test can assert on exactly what went over the wire.
function makeRun({ auth, pushMap = {}, googleFails = new Set(), missingOnGoogle = new Set() }) {
  const calls = [];
  let created = 0;
  const written = {};
  const factory = new Function("context", `
    const {
      authFile, pushMapFile, calls, googleCalendarApiBase, currentTimeZone, isValidTimeZone,
      calendarEventOverlapsRange, fetch, writeJsonFile, readGoogleCalendarAuth, readGoogleCalendarPushMap,
      googleCalendarAuthPath, googleCalendarPushPath
    } = context;
    ${source}
    return pushPlanEventsToGoogle;
  `);
  const authFile = { ...auth };
  const push = factory({
    authFile,
    pushMapFile: pushMap,
    calls,
    googleCalendarApiBase: "https://api.test/calendar/v3",
    googleCalendarAuthPath: "auth",
    googleCalendarPushPath: "ledger",
    currentTimeZone: () => "Asia/Bangkok",
    isValidTimeZone: (zone) => String(zone || "").includes("/"),
    // The range gate is exercised in its own case below; here every block is in
    // range unless the test says otherwise.
    calendarEventOverlapsRange: (event) => event.start >= "2026-01-01",
    readGoogleCalendarAuth: async () => ({ ...authFile }),
    readGoogleCalendarPushMap: async () => JSON.parse(JSON.stringify(pushMap)),
    writeJsonFile: async (file, data) => {
      written[file] = data;
      if (file === "auth") Object.assign(authFile, data);
    },
    fetch: async (url, options = {}) => {
      const method = options.method || "GET";
      const body = options.body ? JSON.parse(options.body) : null;
      calls.push({ method, url: String(url), summary: body?.summary });
      const id = String(url).split("/events/")[1];
      if (googleFails.has(body?.summary)) {
        return { ok: false, status: 403, text: async () => JSON.stringify({ error: { message: "Insufficient permission" } }) };
      }
      if (id && missingOnGoogle.has(decodeURIComponent(id))) {
        return { ok: false, status: 404, text: async () => "" };
      }
      created += 1;
      // Ids are numbered by call, not by success, so a re-create after a 404
      // cannot accidentally hand back the id it just replaced.
      return { ok: true, status: 200, text: async () => JSON.stringify({ id: id ? decodeURIComponent(id) : `g-${calls.length}` }) };
    }
  });
  return { push, calls, written, ledger: pushMap };
}

const WRITE_SCOPE = "https://www.googleapis.com/auth/calendar.events";
const RANGE = { timeMin: "2026-01-01T00:00:00.000Z", timeMax: "2027-01-01T00:00:00.000Z" };

const block = (overrides = {}) => ({
  id: "cal-1",
  title: "Write the brief",
  start: "2026-09-11T09:00",
  end: "2026-09-11T10:30",
  allDay: false,
  kind: "plan",
  tentative: false,
  supersededAt: "",
  notes: "",
  link: "",
  location: "",
  recurrence: "none",
  repeatDays: [],
  exceptionDates: [],
  zone: "",
  tz: "",
  source: "local",
  updatedAt: "2026-09-10T08:00:00.000Z",
  ...overrides
});

const run = (opts, events) => {
  const harness = makeRun(opts);
  return harness.push({ calendarId: "primary", accessToken: "t", storedEvents: events, range: RANGE })
    .then((result) => ({ result, calls: harness.calls, written: harness.written, ledger: harness.ledger }));
};

(async () => {
  // --- a read-only connection is inert ---------------------------------------

  {
    const { result, calls } = await run(
      { auth: { scope: "https://www.googleapis.com/auth/calendar.events.readonly", pushSince: "2026-01-01T00:00:00.000Z" } },
      [block()]
    );
    check("a read-only connection pushes nothing at all", calls.length === 0);
    check("and says why, so the app can offer a reconnect", result.skipped === "reauthorize");
  }

  // --- switching it on arms it, and uploads nothing --------------------------

  {
    const { result, calls, written } = await run({ auth: { scope: WRITE_SCOPE } }, [block(), block({ id: "cal-2" })]);
    check("the first sync uploads nothing, so turning the push on is not a bulk backfill", calls.length === 0);
    check("it stamps pushSince instead", Boolean(written.auth?.pushSince));
    check("and reports a clean run", result.created === 0 && result.failed === 0);
  }

  // --- a block written after that goes up -----------------------------------

  const armed = { scope: WRITE_SCOPE, pushSince: "2026-09-01T00:00:00.000Z" };

  {
    const { result, calls, written } = await run({ auth: armed }, [block()]);
    check("a block written since goes up as a create", calls.length === 1 && calls[0].method === "POST");
    check("with its title", calls[0].summary === "Write the brief");
    check("counted as created", result.created === 1 && result.updated === 0);
    check("the ledger records the Google id", written.ledger["cal-1"]?.googleEventId === "g-1");
    check("and the local block carries it too, so the app can see it was pushed", result.events[0].googleEventId === "g-1");
    check("the pull is told to skip it", result.pushedIds.has("g-1"));
  }

  {
    const { calls } = await run({ auth: armed }, [block({ updatedAt: "2026-08-01T00:00:00.000Z" })]);
    check("a block last written before the push was switched on stays put", calls.length === 0);
  }

  {
    const harness = makeRun({ auth: armed });
    const out = await harness.push({
      calendarId: "primary",
      accessToken: "t",
      // Out of the sync window: a mass edit of old blocks must not upload them.
      storedEvents: [block({ start: "2020-04-01T09:00", end: "2020-04-01T10:00" })],
      range: RANGE
    });
    check("a freshly edited block outside the sync window stays put", harness.calls.length === 0 && out.created === 0);
  }

  // --- what is never eligible ------------------------------------------------

  {
    const { calls } = await run({ auth: armed }, [
      block({ id: "a", kind: "actual" }),
      block({ id: "b", kind: "deadline" }),
      block({ id: "c", supersededAt: "2026-09-09T00:00:00.000Z" }),
      block({ id: "d", source: "google" })
    ]);
    check("actuals, deadlines, archived plans and imported events never go up", calls.length === 0);
  }

  // --- second run, nothing changed ------------------------------------------

  {
    const ledger = { "cal-1": { googleEventId: "g-1", updatedAt: "2026-09-10T08:00:00.000Z", calendarId: "primary" } };
    const { result, calls } = await run({ auth: armed, pushMap: ledger }, [block()]);
    check("an unchanged block is not re-sent", calls.length === 0);
    check("but the pull is still told to skip it", result.pushedIds.has("g-1"));
  }

  // --- second run, the block was edited -------------------------------------

  {
    const ledger = { "cal-1": { googleEventId: "g-1", updatedAt: "2026-09-10T08:00:00.000Z", calendarId: "primary" } };
    const { result, calls, written } = await run(
      { auth: armed, pushMap: ledger },
      [block({ title: "Write the brief (moved)", updatedAt: "2026-09-10T09:00:00.000Z" })]
    );
    check("an edited block is updated in place, never re-created", calls.length === 1 && calls[0].method === "PUT");
    check("at its own Google id", calls[0].url.endsWith("/events/g-1"));
    check("counted as an update", result.updated === 1 && result.created === 0);
    check("and the ledger moves on to the new revision", written.ledger["cal-1"].updatedAt === "2026-09-10T09:00:00.000Z");
  }

  // --- withdrawal ------------------------------------------------------------

  {
    const ledger = { "cal-1": { googleEventId: "g-1", updatedAt: "2026-09-10T08:00:00.000Z", calendarId: "primary" } };
    const { result, calls, written } = await run({ auth: armed, pushMap: ledger }, []);
    check("a deleted block is removed from Google", calls.length === 1 && calls[0].method === "DELETE");
    check("counted as a delete", result.deleted === 1);
    check("and dropped from the ledger", !written.ledger["cal-1"]);
    check("and no longer hidden from the pull", !result.pushedIds.has("g-1"));
  }

  {
    const ledger = { "cal-1": { googleEventId: "g-1", updatedAt: "2026-09-10T08:00:00.000Z", calendarId: "primary" } };
    const { result, calls } = await run(
      { auth: armed, pushMap: ledger },
      [block({ supersededAt: "2026-09-10T09:00:00.000Z" })]
    );
    check("archiving a day's plan takes its blocks off Google too", calls.length === 1 && calls[0].method === "DELETE" && result.deleted === 1);
  }

  {
    const ledger = { "cal-1": { googleEventId: "g-1", updatedAt: "2026-09-10T08:00:00.000Z", calendarId: "primary" } };
    const { calls } = await run({ auth: armed, pushMap: ledger }, [block({ kind: "actual" })]);
    check("logging a plan as done takes the plan off Google", calls.length === 1 && calls[0].method === "DELETE");
  }

  // --- the event was deleted on Google's side --------------------------------

  {
    const ledger = { "cal-1": { googleEventId: "g-1", updatedAt: "2026-09-10T08:00:00.000Z", calendarId: "primary" } };
    const { result, calls, written } = await run(
      { auth: armed, pushMap: ledger, missingOnGoogle: new Set(["g-1"]) },
      [block({ updatedAt: "2026-09-10T09:00:00.000Z" })]
    );
    check(
      "a block deleted from Google's side is re-created, not left as a dead ledger row",
      calls.length === 2 && calls[0].method === "PUT" && calls[1].method === "POST"
    );
    check("and the ledger points at the new event", written.ledger["cal-1"].googleEventId !== "g-1");
    check("counted as a create", result.created === 1 && result.updated === 0);
  }

  // --- one bad block does not sink the run -----------------------------------

  {
    const { result } = await run(
      { auth: armed, googleFails: new Set(["Bad one"]) },
      [block({ id: "a", title: "Bad one" }), block({ id: "b", title: "Good one" })]
    );
    check("a block Google refuses is counted, not thrown", result.failed === 1 && result.created === 1);
    check("and named, so the app can say which", result.errors[0].startsWith("Bad one:"));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
