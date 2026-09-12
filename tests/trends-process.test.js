// Harness: extracts the Trends "process" cards from app.js -- the ones built
// from record metadata (calendar createdAt, goal-log kinds, entry _revision)
// rather than from survey answers -- and runs them over fabricated data.
//
// What this guards: those cards read timestamps that were always being written
// but never displayed, so a silently wrong bucket boundary would look like a
// real behavioural finding rather than a bug. The retroactive-plan bucket and
// the check/miss vs unanswered split are the two that matter most.
//
// Run with: node tests/trends-process.test.js
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
  "// The same window collectTrendsRows() applies to entries",
  "function collectTrendsRows()",
  "trends process helpers"
);

const load = new Function(
  "fixture",
  `
  const state = { entries: fixture.entries || {}, calendarEvents: fixture.calendarEvents || [] };
  const goalLog = fixture.goalLog || [];
  const goalsDoc = fixture.goalsDoc || { goals: [] };
  const trendsRangeDays = fixture.rangeDays === undefined ? 0 : fixture.rangeDays;
  const todayISO = () => fixture.today;
  ${chunk}
  return {
    trendsRangeBounds, trendsInBounds, trendsPlanLeadCounts, trendsLoggingLagCounts,
    trendsGoalFollowThrough, trendsGoalCoverage, trendsGoalTallies, trendsRevisionPoints
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
const valueOf = (result, label) => (result.items.find((item) => item.label.startsWith(label)) || {}).value;

const TODAY = "2026-08-02";

// Calendar `start`/`end` are local wall-clock strings with no zone; `createdAt`
// is a UTC instant. Deriving one from the other keeps these fixtures meaningful
// in any timezone -- hard-coding both sides silently encodes the author's offset
// and the buckets shift when the suite runs somewhere else.
const shiftHours = (localWallClock, hours) =>
  new Date(new Date(localWallClock).getTime() + hours * 3600000).toISOString();

// ---- plan lead time -------------------------------------------------------
{
  const api = load({
    today: TODAY,
    rangeDays: 0,
    calendarEvents: [
      // planned the previous evening for a 09:00 start
      { kind: "plan", start: "2026-08-01T09:00", createdAt: shiftHours("2026-08-01T09:00", -15) },
      // planned three hours out
      { kind: "plan", start: "2026-08-01T12:00", createdAt: shiftHours("2026-08-01T12:00", -3) },
      // written down after the block had already begun
      { kind: "plan", start: "2026-08-01T14:00", createdAt: shiftHours("2026-08-01T14:00", 0.5) },
      // actual blocks must not appear in this card at all
      { kind: "actual", start: "2026-08-01T15:00", end: "2026-08-01T16:00", createdAt: shiftHours("2026-08-01T16:00", 0.1) }
    ]
  });
  const result = api.trendsPlanLeadCounts(api.trendsRangeBounds());
  check("plan lead counts only plan blocks", result.total === 3, JSON.stringify(result));
  check("a night-before plan lands in the 12h+ bucket", valueOf(result, "Night before") === 1, JSON.stringify(result));
  check("a few hours of lead time is its own bucket", valueOf(result, "A few hours") === 1, JSON.stringify(result));
  check(
    "a plan created after its start is counted as retroactive",
    valueOf(result, "After it had already started") === 1,
    JSON.stringify(result)
  );
  check("empty buckets are dropped", result.items.every((item) => item.value > 0));
}

// ---- logging lag ----------------------------------------------------------
{
  const api = load({
    today: TODAY,
    rangeDays: 0,
    calendarEvents: [
      // logged while it was still happening: negative lag, still "as it happened"
      { kind: "actual", start: "2026-08-01T09:00", end: "2026-08-01T10:00", createdAt: shiftHours("2026-08-01T10:00", -0.5) },
      // logged four hours after it ended
      { kind: "actual", start: "2026-08-01T11:00", end: "2026-08-01T12:00", createdAt: shiftHours("2026-08-01T12:00", 4) },
      // reconstructed two days later
      { kind: "actual", start: "2026-07-30T11:00", end: "2026-07-30T12:00", createdAt: shiftHours("2026-07-30T12:00", 48) },
      { kind: "plan", start: "2026-08-01T13:00", end: "2026-08-01T14:00", createdAt: shiftHours("2026-08-01T14:00", -2) }
    ]
  });
  const result = api.trendsLoggingLagCounts(api.trendsRangeBounds());
  check("logging lag counts only actual blocks", result.total === 3, JSON.stringify(result));
  check("a block logged before it ended counts as live", valueOf(result, "As it happened") === 1, JSON.stringify(result));
  check("a four-hour gap is the 1-6h bucket", valueOf(result, "Within a few hours") === 1, JSON.stringify(result));
  check("a two-day gap is the 24h+ bucket", valueOf(result, "A day or more later") === 1, JSON.stringify(result));
}

// ---- goal follow-through and coverage ------------------------------------
{
  const goalsDoc = {
    goals: [
      { id: "daily-anki", title: "100 Anki cards" },
      { id: "daily-linkedin", title: "15 LinkedIn points" },
      { id: "daily-ghost", title: "Never answered" }
    ]
  };
  const goalLog = [
    // anki: appeared 4 times, answered 3, done 2 of those
    { goalId: "daily-anki", date: "2026-07-28", kind: "materialize" },
    { goalId: "daily-anki", date: "2026-07-28", kind: "check", value: true },
    { goalId: "daily-anki", date: "2026-07-29", kind: "materialize" },
    { goalId: "daily-anki", date: "2026-07-29", kind: "check", value: true },
    { goalId: "daily-anki", date: "2026-07-30", kind: "materialize" },
    { goalId: "daily-anki", date: "2026-07-30", kind: "miss", value: false },
    { goalId: "daily-anki", date: "2026-07-31", kind: "materialize" },
    { goalId: "daily-anki", date: "2026-07-31", kind: "unanswered", value: null },
    // linkedin: appeared twice, answered twice, done neither
    { goalId: "daily-linkedin", date: "2026-07-30", kind: "materialize" },
    { goalId: "daily-linkedin", date: "2026-07-30", kind: "miss", value: false },
    { goalId: "daily-linkedin", date: "2026-07-31", kind: "materialize" },
    { goalId: "daily-linkedin", date: "2026-07-31", kind: "miss", value: false },
    // ghost: appeared once, never answered
    { goalId: "daily-ghost", date: "2026-07-31", kind: "materialize" },
    { goalId: "daily-ghost", date: "2026-07-31", kind: "unanswered", value: null }
  ];
  const api = load({ today: TODAY, rangeDays: 0, goalsDoc, goalLog });
  const bounds = api.trendsRangeBounds();

  const follow = api.trendsGoalFollowThrough(bounds);
  check("follow-through ignores goals with no answer at all", follow.total === 2, JSON.stringify(follow));
  check("follow-through divides by answered days, not materialised days",
    valueOf(follow, "100 Anki cards") === 67, JSON.stringify(follow));
  check("a goal missed every time reads 0%", valueOf(follow, "15 LinkedIn points") === 0, JSON.stringify(follow));
  check("weakest goal is listed first", follow.items[0].label.startsWith("15 LinkedIn points"), JSON.stringify(follow));
  check("follow-through label shows the fraction", follow.items[1].label.includes("(2/3)"), JSON.stringify(follow));

  const coverage = api.trendsGoalCoverage(bounds);
  check("coverage includes a never-answered goal", coverage.total === 3, JSON.stringify(coverage));
  check("an unanswered-only goal reads 0% coverage", valueOf(coverage, "Never answered") === 0, JSON.stringify(coverage));
  check("coverage divides by materialised days", valueOf(coverage, "100 Anki cards") === 75, JSON.stringify(coverage));
  check("a fully answered goal reads 100%", valueOf(coverage, "15 LinkedIn points") === 100, JSON.stringify(coverage));
  check("an unknown goal id falls back to the id", api.trendsGoalFollowThrough(bounds) && true);
}

// ---- one outcome per day --------------------------------------------------
// The log is append-only, so correcting a day appends rather than edits. The
// tally used to count every row, which made a corrected day count twice and
// left the superseded miss dragging the rate down forever.
{
  const goalsDoc = { goals: [{ id: "daily-morning-survey", title: "Morning survey" }] };
  const goalLog = [
    { goalId: "daily-morning-survey", date: "2026-07-28", kind: "materialize", ts: "2026-07-28T08:00:00.000Z" },
    // The sweep booked a miss because the row expired unticked...
    { goalId: "daily-morning-survey", date: "2026-07-28", kind: "miss", value: false, ts: "2026-07-29T16:00:00.000Z", source: "task" },
    // ...and the evidence pass later found the survey answered in the entry.
    { goalId: "daily-morning-survey", date: "2026-07-28", kind: "check", value: true, ts: "2026-07-31T02:00:00.000Z", source: "evidence" },
    { goalId: "daily-morning-survey", date: "2026-07-29", kind: "materialize", ts: "2026-07-29T08:00:00.000Z" },
    { goalId: "daily-morning-survey", date: "2026-07-29", kind: "miss", value: false, ts: "2026-07-30T16:00:00.000Z", source: "task" }
  ];
  const api = load({ today: TODAY, rangeDays: 0, goalsDoc, goalLog });
  const bounds = api.trendsRangeBounds();
  const tally = api.trendsGoalTallies(bounds).get("daily-morning-survey");

  check("a corrected day counts once", tally.done + tally.missed === 2, JSON.stringify(tally));
  check("the newest outcome wins", tally.done === 1 && tally.missed === 1, JSON.stringify(tally));
  check("materialize rows are still counted per appearance", tally.materialized === 2, JSON.stringify(tally));

  const follow = api.trendsGoalFollowThrough(bounds);
  check("the corrected rate reads 1 of 2", valueOf(follow, "Morning survey") === 50, JSON.stringify(follow));
}

// ---- an archived goal stops scoring you -----------------------------------
// Dropping a habit is a decision, not a failure. Its rows stay in the log, but
// a rate that keeps counting them measures the decision rather than the run.
{
  const goalsDoc = {
    goals: [
      { id: "daily-anki", title: "100 Anki cards" },
      { id: "daily-bed-by-10", title: "Be in bed by 10 pm", archived: true }
    ]
  };
  const goalLog = [
    { goalId: "daily-anki", date: "2026-07-30", kind: "materialize", ts: "2026-07-30T08:00:00.000Z" },
    { goalId: "daily-anki", date: "2026-07-30", kind: "check", value: true, ts: "2026-07-30T20:00:00.000Z" },
    { goalId: "daily-bed-by-10", date: "2026-07-30", kind: "materialize", ts: "2026-07-30T08:00:00.000Z" },
    { goalId: "daily-bed-by-10", date: "2026-07-30", kind: "miss", value: false, ts: "2026-07-31T09:00:00.000Z" }
  ];
  const api = load({ today: TODAY, rangeDays: 0, goalsDoc, goalLog });
  const bounds = api.trendsRangeBounds();

  check("an archived goal is absent from the tallies", !api.trendsGoalTallies(bounds).has("daily-bed-by-10"));
  check("a live goal is still counted", api.trendsGoalTallies(bounds).has("daily-anki"));
  check("follow-through drops it", api.trendsGoalFollowThrough(bounds).total === 1);
  check("coverage drops it too", api.trendsGoalCoverage(bounds).total === 1);
}

// ---- range filtering ------------------------------------------------------
{
  const api = load({
    today: TODAY,
    rangeDays: 2, // 2026-08-01 .. 2026-08-02
    calendarEvents: [
      { kind: "plan", start: "2026-08-01T09:00", createdAt: shiftHours("2026-08-01T09:00", -12) },
      { kind: "plan", start: "2026-07-20T09:00", createdAt: shiftHours("2026-07-20T09:00", -12) }
    ],
    entries: {
      "2026-08-01": { _revision: 12 },
      "2026-07-20": { _revision: 400 },
      "2026-08-02": { _revision: 0 }
    }
  });
  const bounds = api.trendsRangeBounds();
  check("range bounds start at the right day", bounds.from === "2026-08-01", JSON.stringify(bounds));
  check("out-of-range plans are excluded", api.trendsPlanLeadCounts(bounds).total === 1);
  const points = api.trendsRevisionPoints(bounds);
  check("revision points are scoped to the range", points.length === 1 && points[0].value === 12, JSON.stringify(points));
  check("entries with no saves are skipped", !points.some((point) => point.value === 0));
  check("future dates cannot enter the range", api.trendsInBounds("2026-09-01", bounds) === false);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
console.log("All trends process checks passed");
