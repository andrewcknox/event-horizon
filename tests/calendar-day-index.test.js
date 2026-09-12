// Harness: runs the real day index and the real eventTouchesDate side by side
// over the stored calendar, and over fabricated events built to sit on the
// awkward boundaries.
//
// What this guards: eventsForDay() no longer tests every stored event against
// the day. It looks the day up in a map that was filled by solving
// eventTouchesDate's two comparisons for the day number, so the index is only
// correct while that arithmetic agrees with the function it replaced. A
// disagreement does not throw -- an event silently stops appearing on a day it
// belongs to, or appears on one it does not, which is the kind of thing you
// find out months later from a gap in a time sheet.
//
// The interesting cases are all at midnight: a block ending exactly at 00:00
// belongs to the day it ran through and not to the next one, because the day's
// end is exclusive. Events shorter than the snap are widened to it, so a
// zero-length block at 23:58 still reaches into the next day.
//
// Run with: node tests/calendar-day-index.test.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");

const sliceBetween = (from, to, label) => {
  const a = appSource.indexOf(from);
  const b = appSource.indexOf(to, a);
  if (a === -1 || b === -1) throw new Error(`Could not extract ${label}`);
  return appSource.slice(a, b);
};

const dateHelpers = sliceBetween("const CALENDAR_EPOCH_DATE", "function calendarEventSourceStart(", "calendar date helpers");
const dayIndex = sliceBetween("const CALENDAR_INDEX_MAX_SPAN_DAYS", "function eventsForDay(", "day index");
const touchTest = sliceBetween("function eventTouchesDate(", "function eventOccurrenceForDate(", "touch test");

const load = new Function(
  "events",
  `
  const CALENDAR_SNAP_MINUTES = 5;
  const state = { calendarEvents: events };
  const dateFromISO = (value) => new Date(value + "T12:00:00");
  const shiftISODate = (dateString, days) => {
    const date = new Date(dateString + "T12:00:00");
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };
  const calendarDateTimeToMinutes = (value) => {
    const [, time = "00:00"] = String(value || "").split("T");
    const [hour, minute] = time.split(":").map(Number);
    return (hour || 0) * 60 + (minute || 0);
  };
  const todayISO = () => "2026-08-16";
  ${dateHelpers}
  ${dayIndex}
  ${touchTest}
  // What eventsForDay() asks the index for, against what it used to scan for.
  const indexed = (date) => {
    const filed = calendarDayIndex().get(date) || [];
    return [...filed, ...calendarUnindexedEvents.filter((event) => eventTouchesDate(event, date))];
  };
  const scanned = (date) => state.calendarEvents.filter((event) => eventTouchesDate(event, date));
  return { indexed, scanned, shiftISODate, unindexedCount: () => (calendarDayIndex(), calendarUnindexedEvents.length) };
  `
);

let passed = 0;
let failed = 0;

const check = (name, ok, detail = "") => {
  if (ok) {
    passed += 1;
    return;
  }
  failed += 1;
  console.log(`FAIL ${name}${detail ? ` -- ${detail}` : ""}`);
};

// A stored event has no identity of its own here, so compare by what a day view
// would actually show: the same events, in the same order.
const keyOf = (event) => `${event.id}|${event.start}|${event.end}`;
const sameSet = (a, b) => {
  const left = a.map(keyOf).sort();
  const right = b.map(keyOf).sort();
  return left.length === right.length && left.every((value, index) => value === right[index]);
};

const sweep = (label, events, from, days) => {
  const api = load(events);
  let date = from;
  let mismatches = 0;
  let firstBad = "";
  let seen = 0;
  for (let i = 0; i < days; i += 1) {
    const indexed = api.indexed(date);
    const scanned = api.scanned(date);
    seen += scanned.length;
    if (!sameSet(indexed, scanned)) {
      mismatches += 1;
      if (!firstBad) firstBad = `${date}: index ${indexed.length} vs scan ${scanned.length}`;
    }
    date = api.shiftISODate(date, 1);
  }
  check(`${label} agrees with the scan across ${days} days`, mismatches === 0, firstBad);
  return seen;
};

// --- the real calendar -------------------------------------------------------

// This section replays the locally stored calendar as a regression fixture.
// A fresh install has no calendar-events.json yet, so it only runs once the
// calendar has data; the synthetic boundary checks below always run.
const storedCalendarPath = path.join(root, "calendar-events.json");
if (fs.existsSync(storedCalendarPath)) {
  const stored = JSON.parse(fs.readFileSync(storedCalendarPath, "utf8"));
  const storedEvents = Array.isArray(stored) ? stored : stored.events || [];
  check("the stored calendar was read", storedEvents.length > 0, `got ${storedEvents.length}`);

  // Two years back and one forward, so every stored event's span is crossed and
  // the empty stretches either side are covered too.
  const occurrences = sweep("the stored calendar", storedEvents, "2024-08-16", 1095);
  check("the sweep actually saw events", occurrences > 0, `saw ${occurrences}`);
} else {
  console.log("calendar-events.json not found -- skipping stored-calendar regression sweep.");
}

// --- boundaries --------------------------------------------------------------

const at = (id, start, end, extra = {}) => ({ id, title: id, start, end, recurrence: "none", ...extra });

const edges = [
  at("ends-at-midnight", "2026-03-10T22:00", "2026-03-11T00:00"),
  at("starts-at-midnight", "2026-03-12T00:00", "2026-03-12T01:00"),
  at("crosses-midnight", "2026-03-14T23:30", "2026-03-15T00:30"),
  at("whole-day", "2026-03-16T00:00", "2026-03-17T00:00"),
  at("zero-length", "2026-03-18T09:00", "2026-03-18T09:00"),
  at("zero-length-at-midnight", "2026-03-19T23:58", "2026-03-19T23:58"),
  at("backwards", "2026-03-20T10:00", "2026-03-20T09:00"),
  at("three-day", "2026-03-22T08:00", "2026-03-24T17:00"),
  at("weekly-repeat", "2026-03-02T09:00", "2026-03-02T10:00", { recurrence: "weekly", repeatDays: [1, 3] }),
  at("daily-repeat", "2026-03-04T07:00", "2026-03-04T07:30", { recurrence: "daily" }),
  at("long-span", "2026-01-01T09:00", "2026-12-31T17:00")
];
sweep("boundary events", edges, "2026-02-25", 400);

// The repeats and the year-long block are the ones the index refuses to file;
// everything else must have been filed, or the index is not doing its job.
const edgeApi = load(edges);
check("only the unfilable events are scanned", edgeApi.unindexedCount() === 3, `got ${edgeApi.unindexedCount()}`);

if (fs.existsSync(storedCalendarPath)) {
  const stored = JSON.parse(fs.readFileSync(storedCalendarPath, "utf8"));
  const storedEvents = Array.isArray(stored) ? stored : stored.events || [];
  const storedApi = load(storedEvents);
  check(
    "almost none of the stored calendar needs scanning",
    storedApi.unindexedCount() < storedEvents.length * 0.05,
    `${storedApi.unindexedCount()} of ${storedEvents.length} unfiled`
  );
}

// A day with nothing on it must come back empty rather than fall through to
// some other day's bucket. Earlier than every fixture above, the year-long
// block included.
const emptyDay = load(edges).indexed("2025-06-01");
check("an untouched day is empty", emptyDay.length === 0, `got ${emptyDay.length}`);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
