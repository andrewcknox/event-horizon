// Harness: extracts the deadline nag logic from app.js -- which deadlines are
// upcoming, and whether work time is booked for them -- and runs it over a
// fabricated calendar.
//
// What this guards: the nag's whole contract is "shows until a time block is
// booked, then stops". Both halves fail silently -- a deadline that nags
// forever trains the list to be ignored, and one that clears on the wrong
// evidence (a past block, an actual block, someone else's block) hides real
// unplanned work. The recurrence cases matter the same way: a weekly problem
// set that stops nagging after week one is the bug the feature exists to stop.
//
// Run with: node tests/deadline-plan.test.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");

const sliceBetween = (source, from, to, label) => {
  const a = source.indexOf(from);
  const b = source.indexOf(to, a);
  if (a === -1 || b === -1) throw new Error(`Could not extract ${label}`);
  return source.slice(a, b);
};

// Real source only: the recurrence matcher the calendar itself uses, then the
// deadline helpers. Stubs below are clocks and formatters, never rules.
const chunk =
  sliceBetween(appSource, "function recurringEventTouchesDate", "function eventOccurrenceForDate", "recurrence matcher") +
  sliceBetween(appSource, "const DEADLINE_LOOKAHEAD_DAYS", "// One nag row", "deadline helpers");

const load = new Function(
  "fixture",
  `
  const state = { calendarEvents: fixture.events };
  const dateFromISO = (value) => new Date(value + "T12:00:00");
  const isoFromDate = (date) => {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
  };
  const shiftISODate = (value, days) => {
    const date = dateFromISO(value);
    date.setDate(date.getDate() + days);
    return isoFromDate(date);
  };
  function isoDateTimeFromDate() { return fixture.nowStamp; }
  function todayISO() { return fixture.nowStamp.slice(0, 10); }
  function formatClockFromTime(time) { return time; }
  ${chunk}
  return { nextDeadlineOccurrence, deadlinePlanEvents, upcomingDeadlineItems, deadlineDueLabel };
`
);

let failures = 0;
const check = (label, condition, detail = "") => {
  if (condition) {
    console.log(`PASS ${label}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${label}${detail ? `  -> ${detail}` : ""}`);
};

const deadline = (id, start, extra = {}) => ({
  id,
  kind: "deadline",
  title: id,
  start,
  end: start,
  allDay: false,
  recurrence: "none",
  repeatDays: [],
  recurrenceEndDate: "",
  exceptionDates: [],
  estimateMinutes: 0,
  ...extra
});

const planBlock = (deadlineId, start, extra = {}) => ({
  id: `block-${deadlineId}-${start}`,
  kind: "plan",
  title: `work on ${deadlineId}`,
  start,
  end: start,
  deadlineId,
  ...extra
});

// 2026-09-02 is a Wednesday.
const NOW = "2026-09-02T12:00";

{
  const api = load({ nowStamp: NOW, events: [deadline("ps1", "2026-09-17T23:59")] });
  const items = api.upcomingDeadlineItems();
  check("a future deadline with nothing booked nags", items.length === 1 && !items[0].planned);
  check("and knows when it is due", items[0]?.dueAt === "2026-09-17T23:59", items[0]?.dueAt);
}

{
  const api = load({ nowStamp: NOW, events: [deadline("old", "2026-08-20T17:00")] });
  check("a deadline already past is gone, not overdue-forever", api.upcomingDeadlineItems().length === 0);
}

{
  const api = load({
    nowStamp: NOW,
    events: [deadline("tonight", "2026-09-02T17:00"), deadline("this-morning", "2026-09-02T09:00")]
  });
  const items = api.upcomingDeadlineItems();
  check("due later today still nags; due this morning does not", items.length === 1 && items[0].event.id === "tonight");
}

{
  const api = load({
    nowStamp: NOW,
    events: [deadline("ps1", "2026-09-17T23:59"), planBlock("ps1", "2026-09-10T14:00")]
  });
  const items = api.upcomingDeadlineItems();
  check("a booked block from today onward counts as planned", items.length === 1 && items[0].planned);
}

{
  const api = load({
    nowStamp: NOW,
    events: [deadline("ps1", "2026-09-17T23:59"), planBlock("ps1", "2026-08-28T14:00")]
  });
  check(
    "a block in the past is history, so the deadline re-nags",
    api.upcomingDeadlineItems()[0]?.planned === false
  );
}

{
  const api = load({
    nowStamp: NOW,
    events: [
      deadline("ps1", "2026-09-17T23:59"),
      planBlock("ps2", "2026-09-10T14:00"),
      { ...planBlock("ps1", "2026-09-10T16:00"), kind: "actual" }
    ]
  });
  check(
    "someone else's block and an actual block both clear nothing",
    api.upcomingDeadlineItems()[0]?.planned === false
  );
}

{
  // Weekly problem set due Wednesdays 23:59, series anchored two weeks back.
  const weekly = deadline("weekly-ps", "2026-08-19T23:59", {
    recurrence: "weekly",
    repeatDays: [3]
  });
  const api = load({ nowStamp: NOW, events: [weekly] });
  const next = api.nextDeadlineOccurrence(weekly);
  check("a recurring deadline answers with its next occurrence", next?.dueAt === "2026-09-02T23:59", next?.dueAt);
}

{
  const weekly = deadline("weekly-ps", "2026-08-19T23:59", {
    recurrence: "weekly",
    repeatDays: [3],
    exceptionDates: ["2026-09-02"]
  });
  const api = load({ nowStamp: NOW, events: [weekly] });
  const next = api.nextDeadlineOccurrence(weekly);
  check("an exception date skips to the week after", next?.dueAt === "2026-09-09T23:59", next?.dueAt);
}

{
  const ended = deadline("last-term", "2026-05-06T23:59", {
    recurrence: "weekly",
    repeatDays: [3],
    recurrenceEndDate: "2026-06-24"
  });
  const api = load({ nowStamp: NOW, events: [ended] });
  check("a series past its end date stops nagging", api.nextDeadlineOccurrence(ended) === null);
}

{
  const allDay = deadline("essay", "2026-09-02T00:00", { allDay: true });
  const api = load({ nowStamp: NOW, events: [allDay] });
  const next = api.nextDeadlineOccurrence(allDay);
  check("an all-day deadline is due when the day ends, so it nags all day", next?.dueAt === "2026-09-02T23:59", next?.dueAt);
}

{
  const api = load({
    nowStamp: NOW,
    events: [deadline("later", "2026-11-20T23:59"), deadline("sooner", "2026-09-17T23:59")]
  });
  const items = api.upcomingDeadlineItems();
  check(
    "the nag list runs soonest first",
    items.map((item) => item.event.id).join(",") === "sooner,later",
    items.map((item) => item.event.id).join(",")
  );
}

if (failures) {
  console.error(`${failures} failure(s)`);
  process.exit(1);
}
console.log("All deadline-plan checks passed.");
