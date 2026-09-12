// Harness: extracts the "Trends, second wave" helpers from app.js and runs them
// over fabricated data.
//
// What this guards: unlike the survey cards, none of these numbers can be
// eyeballed against a form. A plan/actual pair matched twice, a zero written
// where a value was simply never recorded, or a streak that steps over a miss
// all produce a plausible chart rather than an obvious error -- and the whole
// point of these cards is that they are believed. The three that matter most:
//
//   - each logged block is claimed by at most one planned block;
//   - "not recorded" never becomes a zero in the correlation table;
//   - a day the goal was not asked on neither breaks a streak nor extends it.
//
// Run with: node tests/trends-insights.test.js
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

// The real parsers and the real bucket counter come along rather than being
// re-typed here: a drift between the survey serialisation and these readers is
// exactly the failure this file is meant to catch.
const bucketChunk = sliceBetween(
  appSource,
  "function trendsBucketCounts(values, buckets)",
  "function trendsPlanLeadCounts",
  "trendsBucketCounts"
);
const parserChunk = sliceBetween(
  appSource,
  "function trendsSessionFilled(survey)",
  "function sliderPoints(",
  "trends parsers"
);
const splitChunk = sliceBetween(appSource, "function splitAnswer(value)", "function fieldAnswer(", "splitAnswer");
const insightChunk = sliceBetween(
  appSource,
  "const TRENDS_MAX_RANGE_DAYS",
  "/* --- Monthly review ---",
  "trends second wave"
);

const load = new Function(
  "fixture",
  `
  const state = { entries: fixture.entries || {}, calendarEvents: fixture.calendarEvents || [] };
  const goalLog = fixture.goalLog || [];
  const todayISO = () => fixture.today;

  const shiftISODate = (date, days) => {
    const at = new Date(date + "T12:00:00Z");
    at.setUTCDate(at.getUTCDate() + days);
    return at.toISOString().slice(0, 10);
  };
  const dayIndex = (date) => Math.round(new Date(date + "T00:00:00Z").getTime() / 86400000);
  const toStamp = (absoluteMinutes) => {
    const day = Math.floor(absoluteMinutes / 1440);
    const minute = absoluteMinutes - day * 1440;
    const date = new Date(day * 86400000).toISOString().slice(0, 10);
    return date + "T" + String(Math.floor(minute / 60)).padStart(2, "0") + ":" + String(minute % 60).padStart(2, "0");
  };
  const absolute = (stamp) => dayIndex(stamp.slice(0, 10)) * 1440 + Number(stamp.slice(11, 13)) * 60 + Number(stamp.slice(14, 16));

  // Mirrors eventsForDay() for non-recurring events: occurrences are clipped to
  // the day, and a block running past midnight comes back ending at the next
  // day's 00:00. That clipping is what trendsDayBlocks has to read correctly.
  const eventsForDay = (date) => {
    const dayStart = dayIndex(date) * 1440;
    const dayEnd = dayStart + 1440;
    return state.calendarEvents
      .filter((event) => absolute(event.start) < dayEnd && Math.max(absolute(event.start) + 5, absolute(event.end)) > dayStart)
      .map((event) => ({
        ...event,
        start: toStamp(Math.max(absolute(event.start), dayStart)),
        end: toStamp(Math.min(Math.max(absolute(event.start) + 5, absolute(event.end)), dayEnd))
      }));
  };
  const calendarEventFullTitle = (event) => event.title || "";
  const categoryLabel = (code) => ({ W: "Work", X: "Waste", B: "Productive", G: "Family" })[code] || "";
  const trendsGoalArchived = (goalId) => Boolean(fixture.archived && fixture.archived.includes(goalId));
  const trendsGoalTitle = (goalId) => goalId;
  const trendsInBounds = (date, bounds) => date <= bounds.to && (!bounds.from || date >= bounds.from);
  const trendsShortDate = (date) => date;
  const formatWorkDuration = (minutes) => minutes + "m";

  ${bucketChunk}
  ${parserChunk}
  ${splitChunk}
  ${insightChunk}

  return {
    trendsRangeDateList, trendsDayBlocks, trendsMedian, trendsEstimatePairs,
    trendsEstimateBuckets, trendsEstimateByCategory, trendsCategoryMinutes,
    trendsVariableTable, trendsPearson, trendsCorrelations, trendsWordCount,
    trendsGoalDayStatus, trendsGoalStreaks, trendsHourMinutes, trendsHourEvents,
    TRENDS_MAX_RANGE_DAYS
  };
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

const TODAY = "2026-08-10";
const BOUNDS = { from: "2026-08-01", to: TODAY };

// --- day blocks -------------------------------------------------------------
{
  const api = load({
    today: TODAY,
    calendarEvents: [
      { id: "a", kind: "actual", category: "Z", title: "Sleep", start: "2026-08-04T22:00", end: "2026-08-05T06:30" },
      { id: "b", kind: "actual", category: "W", title: "Write", start: "2026-08-05T09:00", end: "2026-08-05T10:30" }
    ]
  });
  const first = api.trendsDayBlocks("2026-08-04");
  const second = api.trendsDayBlocks("2026-08-05");
  const sleepFirst = first.find((block) => block.title === "Sleep");
  const sleepSecond = second.find((block) => block.title === "Sleep");
  check("overnight block counts its evening minutes, not zero", sleepFirst.minutes === 120, `got ${sleepFirst && sleepFirst.minutes}`);
  check("overnight block counts its morning minutes on the next day", sleepSecond.minutes === 390, `got ${sleepSecond && sleepSecond.minutes}`);
  check("a same-day block measures normally", second.find((b) => b.title === "Write").minutes === 90);
}

// --- estimate pairing -------------------------------------------------------
{
  const api = load({
    today: TODAY,
    calendarEvents: [
      // Two identical plans on one day, and two logged blocks to match them.
      { id: "p1", kind: "plan", category: "W", title: "Brief", start: "2026-08-03T09:00", end: "2026-08-03T10:00" },
      { id: "p2", kind: "plan", category: "W", title: "Brief", start: "2026-08-03T14:00", end: "2026-08-03T15:00" },
      { id: "a1", kind: "actual", category: "W", title: "Brief", start: "2026-08-03T09:00", end: "2026-08-03T11:00" },
      { id: "a2", kind: "actual", category: "W", title: "Brief", start: "2026-08-03T14:00", end: "2026-08-03T14:30" },
      // A plan whose logged block only exists on another day must not pair.
      { id: "p3", kind: "plan", category: "B", title: "Tidy", start: "2026-08-04T09:00", end: "2026-08-04T10:00" },
      { id: "a3", kind: "actual", category: "B", title: "Tidy", start: "2026-08-06T09:00", end: "2026-08-06T09:30" }
    ]
  });
  const pairs = api.trendsEstimatePairs(BOUNDS);
  check("each logged block is claimed once", pairs.length === 2, `got ${pairs.length}`);
  check("ratios follow the pairing", JSON.stringify(pairs.map((p) => p.ratio).sort()) === JSON.stringify([0.5, 2]));
  check("a plan with no same-day match is dropped", !pairs.some((pair) => pair.title === "Tidy"));
}

{
  // taskId wins over the title, so a renamed block still scores against its own
  // plan rather than the identically titled one next to it.
  const api = load({
    today: TODAY,
    calendarEvents: [
      { id: "p1", kind: "plan", category: "W", title: "Draft", taskId: "t-1", start: "2026-08-03T09:00", end: "2026-08-03T10:00" },
      { id: "a1", kind: "actual", category: "W", title: "Draft the thing", taskId: "t-1", start: "2026-08-03T09:00", end: "2026-08-03T09:30" }
    ]
  });
  const pairs = api.trendsEstimatePairs(BOUNDS);
  check("taskId pairs a block whose title changed", pairs.length === 1 && pairs[0].ratio === 0.5);
}

{
  const api = load({ today: TODAY });
  const buckets = api.trendsEstimateBuckets([
    { ratio: 0.4 }, { ratio: 0.75 }, { ratio: 1 }, { ratio: 1.24 }, { ratio: 1.25 }, { ratio: 3 }
  ]);
  const value = (label) => (buckets.items.find((item) => item.label.startsWith(label)) || {}).value;
  check("¾ is the bottom of the close-to-plan bucket", value("Close to plan") === 3, JSON.stringify(buckets.items));
  check("1¼ tips into the over bucket", value("Up to twice") === 1);
  check("over double is its own bucket", value("More than twice") === 1);
  check("bucket total counts every pair", buckets.total === 6);
}

{
  const api = load({ today: TODAY });
  const byCategory = api.trendsEstimateByCategory([
    { category: "W", ratio: 2 }, { category: "W", ratio: 2 }, { category: "W", ratio: 2 },
    { category: "B", ratio: 1 }, { category: "B", ratio: 1 }
  ]);
  check("a category under the pair floor is withheld", byCategory.items.length === 1, JSON.stringify(byCategory.items));
  check("median ratio is reported as a percentage", byCategory.items[0].value === 200);
  check("the label carries the sample size", byCategory.items[0].label === "Work (3)", byCategory.items[0].label);
}

// --- planned against logged -------------------------------------------------
{
  const api = load({
    today: TODAY,
    calendarEvents: [
      { id: "p1", kind: "plan", category: "W", title: "A", start: "2026-08-03T09:00", end: "2026-08-03T12:00" },
      { id: "a1", kind: "actual", category: "W", title: "A", start: "2026-08-03T09:00", end: "2026-08-03T10:00" },
      { id: "a2", kind: "actual", category: "X", title: "B", start: "2026-08-03T20:00", end: "2026-08-03T22:00" },
      { id: "u1", kind: "actual", category: "", title: "Uncategorised", start: "2026-08-03T13:00", end: "2026-08-03T14:00" }
    ]
  });
  const items = api.trendsCategoryMinutes(BOUNDS);
  const work = items.find((item) => item.code === "W");
  const waste = items.find((item) => item.code === "X");
  check("planned and logged are kept apart", work.plan === 180 && work.actual === 60);
  check("a logged-only category still appears", waste.plan === 0 && waste.actual === 120);
  check("uncategorised blocks are left out", !items.some((item) => item.code === ""));
}

// --- correlations -----------------------------------------------------------
{
  const api = load({ today: TODAY });
  check("perfect agreement is +1", Math.abs(api.trendsPearson([[1, 2], [2, 4], [3, 6]]) - 1) < 1e-9);
  check("perfect opposition is −1", Math.abs(api.trendsPearson([[1, 6], [2, 4], [3, 2]]) + 1) < 1e-9);
  check("a flat variable has no correlation", api.trendsPearson([[1, 5], [2, 5], [3, 5]]) === null);
  check("one point is not a correlation", api.trendsPearson([[1, 2]]) === null);
}

{
  // Fourteen days: sleep rises, next-day joy rises with it. Work hours are only
  // logged on some days, and the days without a logged block must not enter the
  // table as zeros.
  const entries = {};
  const calendarEvents = [];
  for (let index = 0; index < 14; index += 1) {
    const date = `2026-07-${String(index + 1).padStart(2, "0")}`;
    const hours = 6 + index * 0.2;
    const joy = 1 + index * 0.2;
    entries[date] = {
      date,
      morning: { survey: { sleep: `Time I fell asleep: 23:00; Time I woke up: ${String(5 + Math.floor(hours - 6)).padStart(2, "0")}:00` } },
      night: { survey: { mental: `How much joy?: ${joy.toFixed(1)}` } },
      tasks: { completed: [] },
      mistakes: [],
      journal: "word ".repeat(index + 1)
    };
    if (index % 2 === 0) {
      calendarEvents.push({ id: `w${index}`, kind: "actual", category: "W", title: "Work", start: `${date}T09:00`, end: `${date}T12:00` });
    }
  }
  const api = load({ today: "2026-07-14", entries, calendarEvents });
  const bounds = { from: "2026-07-01", to: "2026-07-14" };
  const table = api.trendsVariableTable(bounds);
  const logged = table.get("2026-07-01");
  const notLogged = table.get("2026-07-02");
  check("a day with logged blocks gets its hours", logged.workHours === 3);
  check("a day with no logged block has no hours, not zero", notLogged.workHours === undefined, JSON.stringify(notLogged));
  check("journal words are counted", logged.journalWords === 1 && table.get("2026-07-04").journalWords === 4);

  const results = api.trendsCorrelations(bounds);
  check("correlations are found", results.length > 0);
  check("results are sorted strongest first", results.every((item, index) => index === 0 || Math.abs(results[index - 1].r) >= Math.abs(item.r)));
  check("every reported pair clears the minimum sample", results.every((item) => item.n >= 10));
  check("a lagged pair is labelled as next-day", results.some((item) => item.label.includes("next-day")));
  check("no variable is correlated with itself same-day", !results.some((item) => /^Sleep quality → sleep quality$/.test(item.label)));
}

// --- habit grid and streaks -------------------------------------------------
{
  const api = load({
    today: TODAY,
    goalLog: [
      // A miss later corrected to a check on the same day: newest wins, one
      // outcome per (goal, date).
      { goalId: "g1", date: "2026-08-01", kind: "miss", ts: "2026-08-01T22:00:00Z" },
      { goalId: "g1", date: "2026-08-01", kind: "check", ts: "2026-08-02T09:00:00Z" },
      { goalId: "g1", date: "2026-08-02", kind: "check", ts: "2026-08-02T22:00:00Z" },
      // 08-03 is simply not asked -- no row at all.
      { goalId: "g1", date: "2026-08-04", kind: "check", ts: "2026-08-04T22:00:00Z" },
      { goalId: "g1", date: "2026-08-05", kind: "materialize", ts: "2026-08-05T07:00:00Z" },
      { goalId: "g2", date: "2026-08-01", kind: "check", ts: "2026-08-01T22:00:00Z" },
      { goalId: "g2", date: "2026-08-02", kind: "miss", ts: "2026-08-02T22:00:00Z" },
      { goalId: "g2", date: "2026-08-03", kind: "check", ts: "2026-08-03T22:00:00Z" },
      { goalId: "gone", date: "2026-08-01", kind: "check", ts: "2026-08-01T22:00:00Z" }
    ],
    archived: ["gone"]
  });
  const byGoal = api.trendsGoalDayStatus();
  check("a corrected miss reads as done", byGoal.get("g1").get("2026-08-01") === "done");
  check("a materialised but unanswered day is pending", byGoal.get("g1").get("2026-08-05") === "pending");
  check("an archived goal is not graded", !byGoal.has("gone"));

  const g1 = api.trendsGoalStreaks(byGoal.get("g1"));
  check("an unasked day does not break the streak", g1.current === 3, JSON.stringify(g1));
  check("today's pending row does not break the streak", g1.longest === 3, JSON.stringify(g1));

  const g2 = api.trendsGoalStreaks(byGoal.get("g2"));
  check("a miss resets the current streak", g2.current === 1, JSON.stringify(g2));
  check("the best run survives a later miss", g2.longest === 1, JSON.stringify(g2));
}

// --- time of day ------------------------------------------------------------
{
  const api = load({
    today: TODAY,
    entries: {
      "2026-08-03": {
        date: "2026-08-03",
        tasks: { completed: [{ id: "t", completedAt: "2026-08-03T14:30:00" }] },
        mistakes: [{ id: "m", ts: "2026-08-03T21:15:00" }, { id: "m2", ts: null }],
        journal: ""
      }
    },
    calendarEvents: [
      { id: "a1", kind: "actual", category: "W", title: "Work", start: "2026-08-03T09:30", end: "2026-08-03T11:00" },
      { id: "p1", kind: "plan", category: "W", title: "Work", start: "2026-08-03T15:00", end: "2026-08-03T16:00" }
    ]
  });
  const hours = api.trendsHourMinutes(BOUNDS, ["W"]);
  check("a block is split across the hours it spans", hours[9] === 30 && hours[10] === 60, `9h=${hours[9]} 10h=${hours[10]}`);
  check("planned blocks stay out of the logged strip", hours[15] === 0);
  const events = api.trendsHourEvents(BOUNDS);
  check("completions land in their local hour", events.completions[14] === 1);
  check("a mistake with no timestamp is not placed", events.mistakes[21] === 1 && events.mistakes.reduce((a, b) => a + b, 0) === 1);
}

// --- range list -------------------------------------------------------------
{
  const api = load({
    today: TODAY,
    entries: { "2019-01-01": { date: "2019-01-01" } },
    calendarEvents: []
  });
  const list = api.trendsRangeDateList({ from: "", to: TODAY });
  check("all-time is capped", list.length === api.TRENDS_MAX_RANGE_DAYS, `got ${list.length}`);
  check("the cap trims the oldest end, never today", list[list.length - 1] === TODAY);
  check("the list runs oldest to newest", list[0] < list[1]);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
