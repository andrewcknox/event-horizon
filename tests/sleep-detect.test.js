// Harness: extracts the real detection functions from app.js and runs them
// against synthetic calendar events (stubbing only the calendar plumbing).
const fs = require("fs");
const path = require("path");
const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

const sliceBetween = (from, to) => {
  const a = appSource.indexOf(from);
  const b = appSource.indexOf(to, a);
  if (a === -1 || b === -1) throw new Error(`Could not extract ${from}`);
  return appSource.slice(a, b);
};

const chunk = sliceBetween("const SLEEP_MAX_WAKE_GAP_MINUTES", "function appendSleepDetectionNote");

// Supporting helpers with the same semantics as app.js
function dateFromISO(d) { return new Date(`${d}T12:00:00`); }
function shiftISODate(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
const CALENDAR_EPOCH_DATE = "1970-01-01";
function calendarDateToDayIndex(date) {
  return Math.round((dateFromISO(date) - dateFromISO(CALENDAR_EPOCH_DATE)) / 86400000);
}
const CALENDAR_SNAP_MINUTES = 5;
function calendarDateTimeToMinutes(value) {
  const [, time = "00:00"] = String(value || "").split("T");
  const [hour, minute] = time.split(":").map(Number);
  return (hour || 0) * 60 + (minute || 0);
}
function calendarDateTimeToAbsoluteMinutes(value) {
  const [date] = String(value || "").split("T");
  return calendarDateToDayIndex(date) * 1440 + calendarDateTimeToMinutes(value);
}
function calendarEventSourceStart(event) { return event.sourceStart || event.start; }
function calendarEventSourceEnd(event) { return event.sourceEnd || event.end; }

// Stubbed event store: the real actualSleepSegments consumes these.
let TEST_EVENTS = [];
function eventsForDay(date) {
  const dayStart = calendarDateToDayIndex(date) * 1440;
  const dayEnd = dayStart + 1440;
  return TEST_EVENTS.filter((e) =>
    calendarDateTimeToAbsoluteMinutes(e.start) < dayEnd && calendarDateTimeToAbsoluteMinutes(e.end) > dayStart);
}

eval(chunk);

const D = "2026-07-29";
const P = "2026-07-28";
let nextId = 0;
const ev = (d1, c1, d2, c2, extra = {}) =>
  ({ id: `t${nextId++}`, category: "Z", kind: "actual", start: `${d1}T${c1}`, end: `${d2}T${c2}`, ...extra });

let failures = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) console.log(`  expected ${JSON.stringify(expected)}\n  actual   ${JSON.stringify(actual)}`);
}

// 1. User's exact case: asleep 19:00, awake 03:00-04:00, asleep 04:00-08:00 = one night
TEST_EVENTS = [ev(P, "19:00", D, "03:00"), ev(D, "04:00", D, "08:00")];
let n = detectNightSleep(D);
check("mid-night wake-up chains", {
  fell: sleepClock(n.fellAsleep), wake: sleepClock(n.finalWake), wakeUps: n.wakeUps, awake: n.awakeMinutes
}, { fell: "19:00", wake: "08:00", wakeUps: 1, awake: 60 });

// 2. User's other case: night 23:00-08:00, then nap 09:00-09:30 = nap, not part of night
TEST_EVENTS = [ev(P, "23:00", D, "08:00"), ev(D, "09:00", D, "09:30")];
n = detectNightSleep(D);
check("morning nap not chained", { fell: sleepClock(n.fellAsleep), wake: sleepClock(n.finalWake), wakeUps: n.wakeUps },
  { fell: "23:00", wake: "08:00", wakeUps: 0 });
check("morning nap detected as nap", detectNapsForDate(D), [{ start: "09:00", end: "09:30" }]);

// 3. Evening nap before tonight's sleep stays a nap for today
TEST_EVENTS = [ev(P, "23:30", D, "07:30"), ev(D, "19:00", D, "20:00"), ev(D, "23:00", shiftISODate(D, 1), "07:00")];
check("evening nap is today's nap", detectNapsForDate(D), [{ start: "19:00", end: "20:00" }]);
n = detectNightSleep(shiftISODate(D, 1));
check("tomorrow's night ignores evening nap", { fell: sleepClock(n.fellAsleep), wakeUps: n.wakeUps }, { fell: "23:00", wakeUps: 0 });

// 4. Afternoon nap, long gap from morning wake
TEST_EVENTS = [ev(P, "23:00", D, "07:00"), ev(D, "14:00", D, "15:30")];
check("afternoon nap detected", detectNapsForDate(D), [{ start: "14:00", end: "15:30" }]);
n = detectNightSleep(D);
check("afternoon nap not in night", sleepClock(n.finalWake), "07:00");

// 5. Two mid-night wake-ups; fragmented night
TEST_EVENTS = [ev(P, "22:00", P, "23:30"), ev(D, "00:15", D, "03:00"), ev(D, "03:45", D, "07:15")];
n = detectNightSleep(D);
check("fragmented night chains fully", {
  fell: sleepClock(n.fellAsleep), wake: sleepClock(n.finalWake), wakeUps: n.wakeUps, awake: n.awakeMinutes
}, { fell: "22:00", wake: "07:15", wakeUps: 2, awake: 90 });

// 6. No sleep events at all
TEST_EVENTS = [];
check("no events -> null", detectNightSleep(D), null);
check("no events -> no naps", detectNapsForDate(D), []);

// 7. Back-to-back Z blocks logged separately merge into one night
TEST_EVENTS = [ev(P, "23:00", D, "02:00"), ev(D, "02:00", D, "07:00")];
n = detectNightSleep(D);
check("touching blocks merge into one night", { wakeUps: n.wakeUps, wake: sleepClock(n.finalWake) }, { wakeUps: 0, wake: "07:00" });

// 8. Multi-day event seen from both days is not double-counted
TEST_EVENTS = [ev(P, "23:00", D, "07:00")];
check("multi-day event dedupes", actualSleepSegments(P, D).length, 1);

// 9. Plan-kind and non-Z events are ignored
TEST_EVENTS = [ev(P, "23:00", D, "07:00", { kind: "plan" }), ev(P, "22:00", D, "06:00", { category: "W" })];
check("plan/non-Z ignored", detectNightSleep(D), null);

// 10. Nap overlap matcher: hand-adjusted nap suppresses calendar twin
check("overlap match", napRangesOverlap({ start: "14:05", end: "14:50" }, { start: "14:00", end: "15:30" }), true);
check("no overlap", napRangesOverlap({ start: "09:00", end: "09:30" }, { start: "14:00", end: "15:30" }), false);

process.exit(failures ? 1 : 0);

