// Harness: extracts the unlogged/unplanned hour counters from app.js and runs
// them over fabricated calendar data.
//
// What this guards: these two counters exist to be driven to zero, so a wrong
// number is worse than no number -- it either nags about hours that are covered
// or stays quiet about hours that are not. Four things have to hold. The window
// stops at the current minute, so a week that has not happened yet is never
// counted as missing. Overlapping blocks cover an hour once rather than paying
// for an empty one elsewhere. The 60% rule is a threshold, not a ceiling or a
// floor. And the hour in progress is judged on the minutes actually elapsed.
//
// Run with: node tests/hour-coverage.test.js
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

const chunk = sliceBetween(
  appSource,
  "const HOUR_COVERAGE_THRESHOLD",
  "// Reads \"clear\" at zero",
  "hour coverage helpers"
);

const load = new Function(
  "fixture",
  `
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
  // Day zero is arbitrary; only differences between days matter.
  const calendarDateToDayIndex = (date) =>
    Math.round((dateFromISO(date) - dateFromISO("2026-01-01")) / 86400000);
  ${sliceBetween(appSource, "function startOfWeek(", "function monthStart(", "startOfWeek")}
  // Mirrors eventOccurrenceForDate(): each day sees its own clipped slice.
  const eventsForDay = (date) =>
    (fixture.events || [])
      .filter((event) => event.date === date)
      .map((event) => ({
        kind: event.kind || "actual",
        allDay: Boolean(event.allDay),
        displayStartMinutes: event.from,
        displayEndMinutes: event.to
      }));
  ${chunk}
  return { coverageSummary, uncoveredHours, mergeCoverageSpans, coverageSpans, startOfCoverageWeek, startOfWeek, HOUR_COVERAGE_THRESHOLD };
  `
);

let pass = 0;
let fail = 0;
const check = (name, condition, detail = "") => {
  if (condition) {
    console.log(`PASS ${name}`);
    pass += 1;
  } else {
    console.log(`FAIL ${name}${detail ? `  -> ${detail}` : ""}`);
    fail += 1;
  }
};

const hhmm = (hour, minute = 0) => hour * 60 + minute;
// 2026-08-17 is a Monday, 2026-08-19 the Wednesday of that same week, and
// 2026-08-16 the Sunday that closes the week before it.
const block = (date, fromHour, toHour, kind = "actual", extra = {}) => ({
  date,
  from: hhmm(fromHour),
  to: hhmm(toHour),
  kind,
  ...extra
});

// --- the week starts on Monday ----------------------------------------------
{
  const api = load({ events: [] });
  check("Monday is its own week start", api.startOfCoverageWeek("2026-08-17") === "2026-08-17");
  check("Wednesday resolves back to Monday", api.startOfCoverageWeek("2026-08-19") === "2026-08-17");
  check(
    "Sunday closes the week it followed",
    api.startOfCoverageWeek("2026-08-16") === "2026-08-10",
    api.startOfCoverageWeek("2026-08-16")
  );
}

// --- the window stops now ---------------------------------------------------
{
  // Wednesday 19:00. Monday 00:00 to now is 2 whole days plus 19 hours = 67.
  const api = load({ events: [] });
  const summary = api.coverageSummary("2026-08-19", new Date("2026-08-19T19:00:00"));
  check("an empty week counts every elapsed hour as unlogged", summary.unlogged.week === 67, String(summary.unlogged.week));
  check("and the day counter stops at the same minute", summary.unlogged.day === 19, String(summary.unlogged.day));
  // Unplanned looks the other way: now to Sunday midnight is 5 hours plus 4 whole days = 101.
  check("nothing is planned either", summary.unplanned === 101, String(summary.unplanned));
  check("the week it reports is the Monday one", summary.weekStart === "2026-08-17", summary.weekStart);
}

{
  // Hours after now are not hours you failed to log.
  const api = load({ events: [] });
  const early = api.coverageSummary("2026-08-17", new Date("2026-08-17T01:00:00"));
  check("an hour into the week, one hour is missing", early.unlogged.week === 1, String(early.unlogged.week));
  const midnight = api.coverageSummary("2026-08-17", new Date("2026-08-17T00:00:00"));
  check("at the very start of the week, nothing is missing yet", midnight.unlogged.week === 0, String(midnight.unlogged.week));
}

// --- the 60% rule -----------------------------------------------------------
{
  const on = "2026-08-16";
const at = new Date("2026-08-16T03:00:00");
  const covered = (minutes) =>
    load({ events: [{ date: "2026-08-16", from: hhmm(0), to: hhmm(0, minutes), kind: "actual" }] })
      .coverageSummary(on, at).unlogged.day;
  // Three elapsed hours; only the first can be affected by a block inside it.
  check("35 of 60 minutes leaves the hour unlogged", covered(35) === 3, String(covered(35)));
  check("36 of 60 minutes is exactly enough", covered(36) === 2, String(covered(36)));
  check("a full hour is enough", covered(60) === 2, String(covered(60)));
  check("nothing at all leaves it unlogged", covered(0) === 3, String(covered(0)));
}

// --- the hour in progress ---------------------------------------------------
{
  // 30 minutes into the 02:00 hour, with all 30 logged. Judging that against a
  // full sixty would call a fully-logged half hour a gap.
  const api = load({ events: [{ date: "2026-08-16", from: hhmm(2), to: hhmm(2, 30), kind: "actual" }] });
  const summary = api.coverageSummary("2026-08-16", new Date("2026-08-16T02:30:00"));
  check("a fully logged part-hour is not a gap", summary.unlogged.day === 2, String(summary.unlogged.day));

  const half = load({ events: [{ date: "2026-08-16", from: hhmm(2), to: hhmm(2, 10), kind: "actual" }] });
  check(
    "but 10 of 30 elapsed minutes still is",
    half.coverageSummary("2026-08-16", new Date("2026-08-16T02:30:00")).unlogged.day === 3,
    String(half.coverageSummary("2026-08-16", new Date("2026-08-16T02:30:00")).unlogged.day)
  );
}

// --- overlapping blocks -----------------------------------------------------
{
  // Two blocks over the same hour cover it once. Summing their minutes would
  // reach 60 and wrongly pay for the empty hour beside it.
  const api = load({
    events: [
      { date: "2026-08-16", from: hhmm(0), to: hhmm(0, 40), kind: "actual" },
      { date: "2026-08-16", from: hhmm(0, 10), to: hhmm(0, 50), kind: "actual" }
    ]
  });
  const summary = api.coverageSummary("2026-08-16", new Date("2026-08-16T02:00:00"));
  check("overlapping blocks cover their hour once", summary.unlogged.day === 1, String(summary.unlogged.day));
  check(
    "the union is merged, not summed",
    JSON.stringify(api.mergeCoverageSpans([[0, 40], [10, 50], [100, 120]])) === "[[0,50],[100,120]]",
    JSON.stringify(api.mergeCoverageSpans([[0, 40], [10, 50], [100, 120]]))
  );
}

// --- what counts ------------------------------------------------------------
{
  // Monday 02:00. Behind now: an actual 00-01 and a plan 01-02. Ahead of now:
  // an actual 02-03 and a plan 03-04, with 166 hours left in the week.
  const api = load({
    events: [
      block("2026-08-17", 0, 1, "actual"),
      block("2026-08-17", 1, 2, "plan"),
      block("2026-08-17", 2, 3, "actual"),
      block("2026-08-17", 3, 4, "plan")
    ]
  });
  const summary = api.coverageSummary("2026-08-17", new Date("2026-08-17T02:00:00"));
  check("a plan block does not log an hour", summary.unlogged.day === 1, String(summary.unlogged.day));
  check("and an actual block does not plan one", summary.unplanned === 165, String(summary.unplanned));
}

{
  // An all-day block labels the day; it does not account for its hours.
  const api = load({ events: [{ date: "2026-08-16", from: 0, to: 1440, kind: "actual", allDay: true }] });
  check(
    "an all-day block does not log the day",
    api.coverageSummary("2026-08-16", new Date("2026-08-16T05:00:00")).unlogged.day === 5,
    String(api.coverageSummary("2026-08-16", new Date("2026-08-16T05:00:00")).unlogged.day)
  );
}

{
  // Sleep is logged time like anything else -- the question is whether the hour
  // is accounted for, not whether it was productive.
  const api = load({ events: [block("2026-08-16", 0, 6, "actual")] });
  const summary = api.coverageSummary("2026-08-16", new Date("2026-08-16T06:00:00"));
  check("a six-hour sleep block logs six hours", summary.unlogged.day === 0, String(summary.unlogged.day));
}

// --- day versus week --------------------------------------------------------
{
  // Monday fully logged, Tuesday not. The day counter must not inherit Monday's.
  const api = load({ events: [block("2026-08-17", 0, 24, "actual")] });
  const summary = api.coverageSummary("2026-08-18", new Date("2026-08-18T04:00:00"));
  check("yesterday's cover does not count for today", summary.unlogged.day === 4, String(summary.unlogged.day));
  check("but the week keeps it", summary.unlogged.week === 4, String(summary.unlogged.week));
}

// --- the week being looked at, not the current one --------------------------
// Paging back a week and being told about this one makes the footer unreadable,
// since half of it would describe what is on screen and half would not.
{
  // Viewing Wed 2026-07-29, a fully elapsed week (Mon 07-27 to Sun 08-02), from
  // a "now" three weeks later. Nothing is logged, so all 168 hours are missing.
  const api = load({ events: [] });
  const summary = api.coverageSummary("2026-07-29", new Date("2026-08-19T19:00:00"));
  check("a past week is judged whole, not up to today's clock", summary.unlogged.week === 168, String(summary.unlogged.week));
  check("and its day is a whole day", summary.unlogged.day === 24, String(summary.unlogged.day));
  check("the week reported is the viewed one", summary.weekStart === "2026-07-27" && summary.weekEnd === "2026-08-02", `${summary.weekStart}..${summary.weekEnd}`);
  check("a finished week is not still running", summary.running === false, String(summary.running));
  check("and it has elapsed, so the chips show", summary.elapsed === true, String(summary.elapsed));
}

{
  // The week containing now still stops at this minute.
  const api = load({ events: [] });
  const summary = api.coverageSummary("2026-08-19", new Date("2026-08-19T19:00:00"));
  check("the current week is still clamped to now", summary.unlogged.week === 67, String(summary.unlogged.week));
  check("and reports itself as running", summary.running === true, String(summary.running));
}

{
  // Viewing a day earlier in the current week: that day is over, so it is judged
  // whole even though the week around it is not.
  const api = load({ events: [] });
  const summary = api.coverageSummary("2026-08-17", new Date("2026-08-19T19:00:00"));
  check("a finished day inside the running week is judged whole", summary.unlogged.day === 24, String(summary.unlogged.day));
  check("while the week still stops at now", summary.unlogged.week === 67, String(summary.unlogged.week));
}

{
  // The cursor on a day that has not happened yet, inside the running week.
  const api = load({ events: [] });
  const summary = api.coverageSummary("2026-08-21", new Date("2026-08-19T19:00:00"));
  check("a future day inside the running week has not elapsed", summary.dayElapsed === false, String(summary.dayElapsed));
  check("so it counts nothing of its own", summary.unlogged.day === 0, String(summary.unlogged.day));
  check("while the week it belongs to still counts", summary.unlogged.week === 67, String(summary.unlogged.week));
  check("and the week itself has elapsed", summary.elapsed === true, String(summary.elapsed));
}

{
  // A week that has not started has nothing unlogged, and saying "clear" about
  // it would claim credit for hours nobody has lived through. Unplanned is the
  // opposite: paging forward to plan next week is exactly when that count is
  // wanted, so the whole week is still to plan.
  const api = load({ events: [] });
  const summary = api.coverageSummary("2026-09-02", new Date("2026-08-19T19:00:00"));
  check("a future week has not elapsed", summary.elapsed === false, String(summary.elapsed));
  check("and counts nothing as unlogged", summary.unlogged.week === 0, String(summary.unlogged.week));
  check("while the whole week is still to plan", summary.unplanned === 168, String(summary.unplanned));
}

{
  // Today's own hours must not leak into a past week's totals.
  const api = load({
    events: [
      block("2026-07-27", 0, 24, "actual"),
      block("2026-08-19", 0, 19, "actual")
    ]
  });
  const past = api.coverageSummary("2026-07-29", new Date("2026-08-19T19:00:00"));
  check("a past week counts only its own blocks", past.unlogged.week === 144, String(past.unlogged.week));
}

{
  // The coverage week and the grid week have to be the same seven days, or the
  // chips would describe a different span from the grid they sit under.
  const api = load({ events: [] });
  check(
    "coverage weeks match the grid's weeks",
    ["2026-07-29", "2026-08-16", "2026-08-19", "2026-01-01"].every((date) => api.startOfCoverageWeek(date) === api.startOfWeek(date)),
    "one of these disagreed"
  );
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
