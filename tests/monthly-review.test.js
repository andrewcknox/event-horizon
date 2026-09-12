// Harness: extracts the real monthly-review helpers from app.js and checks the
// pieces that decide what lands in the exported workbook — the one-outcome-per-
// goal-day reader contract, the evidence line, and the sheet-shape rows
// (including that imported months keep their own order and that unmatched
// imported rows are never dropped).
//
// Run with: node tests/monthly-review.test.js
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

const chunk =
  sliceBetween(appSource, "function reviewMonthDays", "async function loadMonthlyReviews", "month days") +
  sliceBetween(appSource, "function reviewNormalizeTitle", "function reviewSetAnswer", "review helpers");

const load = new Function(
  "goalsDoc",
  "goalLog",
  "monthlyReviews",
  "trendsGoalStreaks",
  "trendsShortDate",
  `
  ${chunk}
  return { reviewGoalsForMonth, reviewSavedRow, reviewPastGrades, reviewMonthOutcomes, reviewEvidenceText, reviewSheetRows, reviewUnmatchedRows };
`
);

let failures = 0;
function check(name, condition, detail) {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL ${name}${detail ? ` -- ${detail}` : ""}`);
  }
}

const goalsDoc = {
  ruleSchedule: { "2026-08-02": "rule-x", "2026-08-09": "rule-x", "2026-08-20": "rule-y" },
  goals: [
    { id: "rule-x", title: "Rule X", category: "RULES", type: "rule", activeFrom: "2026-07-26" },
    { id: "daily-a", title: "Habit A", category: "HABITS", type: "daily", activeFrom: "2026-07-26" },
    { id: "daily-old", title: "Retired habit", category: "HABITS", type: "daily", activeFrom: "2026-07-26", activeTo: "2026-08-10", archived: true },
    { id: "daily-sep", title: "September-only", category: "HABITS", type: "daily", activeFrom: "2026-09-01" }
  ]
};

const goalLog = [
  // daily-a: a false miss on the 3rd, corrected later by the evidence sweep —
  // the newest row must win, so the day counts once, as done.
  { goalId: "daily-a", date: "2026-08-03", kind: "miss", ts: "2026-08-03T21:00:00Z" },
  { goalId: "daily-a", date: "2026-08-03", kind: "check", ts: "2026-08-07T09:00:00Z" },
  { goalId: "daily-a", date: "2026-08-04", kind: "check", ts: "2026-08-04T21:00:00Z" },
  { goalId: "daily-a", date: "2026-08-05", kind: "miss", ts: "2026-08-05T21:00:00Z" },
  { goalId: "daily-a", date: "2026-08-06", kind: "unanswered", ts: "2026-08-09T02:00:00Z" },
  // materialize-only day: pending, not counted either way.
  { goalId: "daily-a", date: "2026-08-08", kind: "materialize", ts: "2026-08-08T08:00:00Z" },
  // outside the month: must not leak in.
  { goalId: "daily-a", date: "2026-07-30", kind: "check", ts: "2026-07-30T21:00:00Z" },
  // rule ratings.
  { goalId: "rule-x", date: "2026-08-02", kind: "rating", value: 3, ts: "2026-08-02T22:00:00Z" },
  { goalId: "rule-x", date: "2026-08-09", kind: "rating", value: -1, ts: "2026-08-09T22:00:00Z" }
];

const monthlyReviews = {
  months: {
    "2026-02": {
      imported: true,
      rows: [
        { header: true, title: "HABITS" },
        { goalId: "daily-a", title: "Habit A long prose from the sheet", grade: 4, explain: "went well", change: "" },
        { title: "Row from before the app", grade: -2, explain: "", change: "" }
      ]
    },
    "2026-08": {
      rows: [
        { goalId: "daily-a", title: "Habit A", grade: 2, explain: "solid", change: "keep" },
        { title: "Row from before the app", grade: 1, explain: "carried", change: "" }
      ]
    }
  }
};

// Real streak walker not needed for these checks; a tiny stand-in keeps the
// harness independent of the trends section's own extraction rules.
const trendsGoalStreaks = (days) => {
  let longest = 0;
  let run = 0;
  for (const date of [...days.keys()].sort()) {
    if (days.get(date) === "done") {
      run += 1;
      if (run > longest) longest = run;
    } else run = 0;
  }
  return { current: 0, longest };
};
const trendsShortDate = (date) => date.slice(5);

const api = load(goalsDoc, goalLog, monthlyReviews, trendsGoalStreaks, trendsShortDate);

// 1. Month scoping.
const goals = api.reviewGoalsForMonth("2026-08");
check("a goal retired mid-month is still reviewed", goals.some((g) => g.id === "daily-old"));
check("a goal starting next month is not", !goals.some((g) => g.id === "daily-sep"));

// 2. Reader contract.
const outcomes = api.reviewMonthOutcomes("daily-a", "2026-08");
check("a corrected miss counts as done", outcomes.get("2026-08-03")?.outcome === "done");
check("a materialize-only day is pending", outcomes.get("2026-08-08")?.outcome === "pending");
check("other months stay out", !outcomes.has("2026-07-30"));

// 3. Evidence line.
const evidence = api.reviewEvidenceText(goalsDoc.goals[1], "2026-08");
check("evidence counts one outcome per day", evidence.includes("2 done · 1 missed · 1 unanswered"), evidence);
const ruleEvidence = api.reviewEvidenceText(goalsDoc.goals[0], "2026-08");
check("rule evidence carries the schedule count", ruleEvidence.includes("rule of the day 2×"), ruleEvidence);
check("rule evidence averages ratings", ruleEvidence.includes("avg +1.0"), ruleEvidence);

// 4. Sheet rows.
const sheet = api.reviewSheetRows("2026-08");
check("header row leads", sheet[0].cells[0] === "Goal");
check(
  "unmatched imported rows are appended, never dropped",
  sheet.some((row) => row.cells[0] === "Row from before the app"),
  JSON.stringify(sheet.map((r) => r.cells[0]))
);
const imported = api.reviewSheetRows("2026-02");
check("an imported month keeps its own order", imported[1].header === true && imported[2].cells[0].startsWith("Habit A long"), JSON.stringify(imported));

// 5. Past grades.
const past = api.reviewPastGrades(goalsDoc.goals[1], "2026-08");
check("past grades read imported months by goal id", past.includes("Feb +4"), past);

console.log(failures ? `\n${failures} failing check(s)` : "\nAll monthly-review checks passed");
process.exit(failures ? 1 : 0);
