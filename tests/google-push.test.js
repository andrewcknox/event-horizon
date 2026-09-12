// Harness: extracts the push half of the Google Calendar sync -- the eligibility
// gate, the scope check, the local-block-to-Google-event mapper and the RRULE
// builder -- plus the googleEventId field from BOTH normalizers, and runs them
// over fabricated blocks.
//
// What this guards: the sync was import-only for its whole life. The scope was
// .readonly and no code path ever wrote to Google, so pressing the sync button
// could never put a plan block on the phone. The pieces below are what makes it
// two-way, and each has a way of failing silently:
//
//   - googleEventId must survive BOTH normalizers, same as supersededAt and
//     taskId. Missing from either side and the round-trip forgets which Google
//     event a block owns, so the next sync creates a duplicate instead of
//     updating -- and keeps doing it, forever, once per sync.
//   - Any factory that spreads an existing event under a NEW local id must
//     clear it, or two local blocks claim one Google event and overwrite each
//     other.
//   - The eligibility gate is what keeps 1,000-odd actuals and every archived
//     old plan off the calendar. A block that stops being a live plan block has
//     to be withdrawn, not merely skipped, which is why the gate is separate
//     from the "new enough to push" test.
//   - Google's all-day end date is exclusive. Off by one here and every all-day
//     block shows a day short.
//   - repeatDays is getDay() order (0 = Sunday). Mapped against a Monday-first
//     table, every weekly block lands on the wrong days.
//
// Run with: node tests/google-push.test.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
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

// --- the pieces under test ---------------------------------------------------

const pushSource = [
  sliceBetween(serverSource, "function googleScopeAllowsWrite(", "async function readGoogleCalendarPushMap(", "scope + eligibility gate"),
  sliceBetween(serverSource, "function googleEventFromPlanEvent(", "\nasync function disconnectGoogleCalendar(", "event mapper + rrule")
].join("\n");

const push = new Function(`
  // The mapper leans on these two; both are stubbed so the test does not depend
  // on the zone the machine running it happens to be set to.
  const currentTimeZone = () => "Asia/Bangkok";
  const isValidTimeZone = (zone) => ["Asia/Bangkok", "Asia/Taipei", "Europe/Oslo", "UTC"].includes(String(zone || ""));
  ${pushSource}
  return { googleScopeAllowsWrite, isPushablePlanEvent, googleEventFromPlanEvent, googleRecurrenceRules, addCalendarDays };
`)();

const planBlock = (overrides = {}) => ({
  id: "cal-1",
  title: "Write the brief",
  start: "2026-09-11T09:00",
  end: "2026-09-11T10:30",
  allDay: false,
  kind: "plan",
  tentative: false,
  supersededAt: "",
  location: "",
  link: "",
  notes: "",
  recurrence: "none",
  repeatDays: [],
  recurrenceEndDate: "",
  exceptionDates: [],
  zone: "",
  tz: "",
  source: "local",
  updatedAt: "2026-09-10T08:00:00.000Z",
  ...overrides
});

// --- the scope gate ----------------------------------------------------------

check(
  "the old read-only scope does not allow a push",
  push.googleScopeAllowsWrite("https://www.googleapis.com/auth/calendar.events.readonly") === false
);
check(
  "the events scope does",
  push.googleScopeAllowsWrite("https://www.googleapis.com/auth/calendar.events") === true
);
check(
  "the full calendar scope does",
  push.googleScopeAllowsWrite("https://www.googleapis.com/auth/calendar") === true
);
check(
  "a grant that carries both readonly and write still allows a push",
  push.googleScopeAllowsWrite("https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.events") === true
);
check("a missing scope does not", push.googleScopeAllowsWrite(undefined) === false);

// --- what is eligible --------------------------------------------------------

check("a live local plan block is pushable", push.isPushablePlanEvent(planBlock()) === true);
check("a logged actual is not", push.isPushablePlanEvent(planBlock({ kind: "actual" })) === false);
check("a deadline is not", push.isPushablePlanEvent(planBlock({ kind: "deadline" })) === false);
check(
  "an archived old plan is not, so a re-plan withdraws it from Google",
  push.isPushablePlanEvent(planBlock({ supersededAt: "2026-09-10T07:00:00.000Z" })) === false
);
check(
  "an imported Google event is not pushed back at the calendar it came from",
  push.isPushablePlanEvent(planBlock({ source: "google" })) === false
);
check(
  "nor is an imported Outlook event",
  push.isPushablePlanEvent(planBlock({ source: "outlook" })) === false
);
check("a titleless block is not", push.isPushablePlanEvent(planBlock({ title: "" })) === false);

// --- the mapping -------------------------------------------------------------

const timed = push.googleEventFromPlanEvent(planBlock({ notes: "Draft only", link: "https://example.com/doc" }), "primary");
check("a timed block carries seconds, as Google requires", timed.start.dateTime === "2026-09-11T09:00:00");
check("and its end", timed.end.dateTime === "2026-09-11T10:30:00");
check(
  "a floating block is pushed in this machine's zone",
  timed.start.timeZone === "Asia/Bangkok" && timed.end.timeZone === "Asia/Bangkok"
);
check("notes and link both reach the description", timed.description === "Draft only\n\nhttps://example.com/doc");
check("a normal block is confirmed and busy", timed.status === "confirmed" && timed.transparency === "opaque");
check(
  "the local id rides along so the event is identifiable without the ledger",
  timed.extendedProperties.private.journalAppEventId === "cal-1"
);

const pegged = push.googleEventFromPlanEvent(planBlock({ tz: "Asia/Taipei" }), "primary");
check("a pegged block keeps the zone it was written in", pegged.start.timeZone === "Asia/Taipei");

const moving = push.googleEventFromPlanEvent(
  planBlock({ tz: "Asia/Bangkok", zoneShift: { from: "Asia/Bangkok", to: "Europe/Oslo", when: "end" } }),
  "primary"
);
check(
  "a block that is itself a move ends in the zone it lands in",
  moving.start.timeZone === "Asia/Bangkok" && moving.end.timeZone === "Europe/Oslo"
);

const tentative = push.googleEventFromPlanEvent(planBlock({ tentative: true }), "primary");
check(
  "an FYI block does not make you look busy",
  tentative.status === "tentative" && tentative.transparency === "transparent"
);

const allDay = push.googleEventFromPlanEvent(
  planBlock({ allDay: true, start: "2026-09-11T00:00", end: "2026-09-11T00:00" }),
  "primary"
);
check("an all-day block pushes as a date, not a time", allDay.start.date === "2026-09-11" && !allDay.start.dateTime);
check(
  "and its end is exclusive, so a one-day block is one day long",
  allDay.end.date === "2026-09-12"
);
check("day arithmetic crosses a month end", push.addCalendarDays("2026-09-30", 1) === "2026-10-01");
check("and a year end", push.addCalendarDays("2026-12-31", 1) === "2027-01-01");

// --- recurrence --------------------------------------------------------------

check("a one-off block carries no rule", push.googleRecurrenceRules(planBlock(), "Asia/Bangkok").length === 0);

const weekly = push.googleRecurrenceRules(
  // 1 = Monday, 3 = Wednesday in getDay() order.
  planBlock({ recurrence: "weekly", repeatDays: [1, 3] }),
  "Asia/Bangkok"
);
check("a weekly block maps getDay() indexes to the right BYDAY codes", weekly[0] === "RRULE:FREQ=WEEKLY;BYDAY=MO,WE");

const sunday = push.googleRecurrenceRules(planBlock({ recurrence: "weekly", repeatDays: [0, 6] }), "Asia/Bangkok");
check("and gets the week's two edges right", sunday[0] === "RRULE:FREQ=WEEKLY;BYDAY=SU,SA");

const ended = push.googleRecurrenceRules(
  planBlock({ recurrence: "daily", recurrenceEndDate: "2026-12-31" }),
  "Asia/Bangkok"
);
check("a series with an end date stops there", ended[0] === "RRULE:FREQ=DAILY;UNTIL=20261231T235959Z");

const skipped = push.googleRecurrenceRules(
  planBlock({ recurrence: "weekly", repeatDays: [1], exceptionDates: ["2026-09-21"] }),
  "Asia/Bangkok"
);
check(
  "a skipped occurrence is named by its own start time, not midnight",
  skipped[1] === "EXDATE;TZID=Asia/Bangkok:20260921T090000"
);

const skippedAllDay = push.googleRecurrenceRules(
  planBlock({ allDay: true, recurrence: "daily", exceptionDates: ["2026-09-21"] }),
  "Asia/Bangkok"
);
check("an all-day skip is a bare date", skippedAllDay[1] === "EXDATE;VALUE=DATE:20260921");

const monthly = push.googleRecurrenceRules(planBlock({ recurrence: "monthly" }), "Asia/Bangkok");
check("monthly maps through too", monthly[0] === "RRULE:FREQ=MONTHLY");

// --- the field survives both normalizers -------------------------------------

// The two normalizers are checked the cheap way -- by reading the field back out
// of the source -- because loading either one whole drags in most of its file.
// What matters is only that neither rebuild drops it.
check(
  "app.js keeps googleEventId when it rebuilds an event",
  /googleEventId: event\.googleEventId \? String\(event\.googleEventId\) : ""/.test(
    sliceBetween(appSource, "function normalizeCalendarEvent(", "\n// The instant an event's clock actually names", "app.js normalizer")
  ),
  "the client would forget which Google event a block owns on every save"
);
check(
  "server.cjs keeps it too",
  /googleEventId: event\.googleEventId \? String\(event\.googleEventId\) : ""/.test(
    sliceBetween(serverSource, "function normalizeCalendarEvent(", "\nfunction normalizeCalendarDateTime(", "server normalizer")
  ),
  "the file would forget it on every write"
);

// Every factory that spreads an existing event under a fresh local id has to
// clear the field, or two blocks claim one Google event.
const clearingFactories = (appSource.match(/googleEventId: ""/g) || []).length;
check(
  "every cloning factory clears googleEventId",
  clearingFactories >= 4,
  `found ${clearingFactories} of the 4 expected (blank event, detach, split, plan-to-actual)`
);

// --- the pull drops what the push just wrote ---------------------------------

check(
  "the importer skips events this app pushed, so a block has no read-only twin",
  /!push\.pushedIds\.has\(event\.providerId\)/.test(serverSource),
  "our own plan blocks would come back down as a second, undraggable copy"
);
check(
  "the push runs before the pull, so pushedIds is current when the filter reads it",
  serverSource.indexOf("const push = await pushPlanEventsToGoogle(") < serverSource.indexOf("const googleEvents = await fetchGoogleCalendarEvents("),
  "a freshly created event would be imported as a duplicate on the sync that made it"
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
