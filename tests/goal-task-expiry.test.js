// Harness: extracts the real daily-goal task materializer and expiry sweep from
// app.js and runs them over a fabricated set of entries.
//
// The bug this guards: goal tasks were plain inbox items, and inbox carries
// forward, so four missed habits became eight, then twelve, and the real todo
// list was buried under undated copies of the same rows.
//
// Run with: node tests/goal-task-expiry.test.js
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

// Real source only. Anything stubbed below is a surface (save, render) or a
// clock, never a rule about which task expires.
const chunk =
  sliceBetween(appSource, "const TASK_SECTIONS = [", "const TASK_FILTERS", "task sections") +
  // normalizeTask() validates a task's calendar category against this list.
  sliceBetween(appSource, "const CALENDAR_CATEGORIES = [", "const CALENDAR_COLORS", "calendar categories") +
  sliceBetween(appSource, "function normalizeEstimateMinutes", "function sectionForTask", "normalizeTask") +
  sliceBetween(appSource, "function goalById", "function ruleForDate", "goal lookups") +
  sliceBetween(appSource, "function latestGoalEvent", "// Two-day grace", "latestGoalEvent") +
  sliceBetween(appSource, "function dailyGoalsWithSurface", "function morningRulePlanText", "materializer + sweep");

const load = new Function(
  "fixture",
  `
  const state = { entries: fixture.entries, currentDate: fixture.today };
  const goalsDoc = fixture.goalsDoc;
  const goalLog = fixture.goalLog;
  const saved = [];
  let taskCounter = 0;
  function todayISO() { return fixture.today; }
  function taskId() { taskCounter += 1; return "t" + taskCounter; }
  function ensureEntry(date) { if (!state.entries[date]) state.entries[date] = { date, tasks: null }; ensureTaskState(state.entries[date]); }
  function ensureTaskState(entry) {
    if (!entry.tasks) entry.tasks = {};
    for (const key of [...TASK_SECTION_KEYS, "completed", "discarded"]) {
      if (!Array.isArray(entry.tasks[key])) entry.tasks[key] = [];
    }
    return entry;
  }
  function logGoalEvent(event) { goalLog.push({ id: "e" + goalLog.length, ts: "2026-08-02T00:00:00.000Z", date: state.currentDate, ...event }); return event; }
  function saveEverywhere(options) { saved.push(...(options?.extraDates || [])); }
  function renderTasksView() {}
  function renderSidePanel() {}
  function renderCompletedOutput() {}
  ${chunk}
  return { state, goalLog, saved, taskExpiryDate, dailyGoalExpires, ensureDailyGoalTasks, expireDailyGoalTasks, refreshDailyGoalTasks };
`
);

let failures = 0;
const check = (label, condition) => {
  if (condition) {
    console.log(`PASS ${label}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${label}`);
};

const goalsDoc = {
  contextSchedule: [{ from: "2026-08-01", context: "travel" }],
  goals: [
    { id: "daily-linkedin", title: "15 LinkedIn points", type: "daily", surface: "task", taskText: "15 LinkedIn points", contexts: ["travel"], order: 1, estimateMinutes: 30, calendarCategory: "B" },
    { id: "daily-anki", title: "100 Anki cards", type: "daily", surface: "task", taskText: "100 Anki cards", contexts: ["travel"], order: 2 },
    { id: "daily-reading", title: "Reading", type: "daily", surface: "task", taskText: "Reading", contexts: ["travel"], order: 3, expires: false },
    { id: "daily-eye-rest", title: "Eye rest", type: "daily", surface: "survey", contexts: ["travel"], order: 4 }
  ]
};

const task = (over) => ({
  id: over.id,
  text: over.text,
  goalId: over.goalId || "",
  expiresOn: over.expiresOn || "",
  project: over.goalId ? "goal" : "",
  labels: [],
  priority: "p3",
  dueDate: "",
  createdAt: "2026-08-01T09:00:00.000Z",
  updatedAt: null,
  source: over.section || "inbox",
  sourceDate: over.sourceDate || "",
  completedAt: null,
  discardedAt: null
});

const fixture = () => ({
  today: "2026-08-02",
  goalsDoc: JSON.parse(JSON.stringify(goalsDoc)),
  goalLog: [
    { id: "m1", goalId: "daily-linkedin", date: "2026-08-01", kind: "materialize", value: true },
    { id: "m2", goalId: "daily-anki", date: "2026-08-01", kind: "materialize", value: true },
    { id: "m3", goalId: "daily-reading", date: "2026-08-01", kind: "materialize", value: true }
  ],
  entries: {
    "2026-08-01": {
      date: "2026-08-01",
      tasks: {
        rightNow: [task({ id: "a1", text: "15 LinkedIn points", goalId: "daily-linkedin", expiresOn: "2026-08-01", sourceDate: "2026-08-01", section: "rightNow" })],
        today: [],
        // No expiresOn: materialised before the field existed. The goal
        // definition has to backfill it or the pile-up on disk never clears.
        inbox: [
          task({ id: "a2", text: "100 Anki cards", goalId: "daily-anki", sourceDate: "2026-08-01" }),
          task({ id: "a3", text: "Reading", goalId: "daily-reading", sourceDate: "2026-08-01" }),
          task({ id: "a4", text: "message selena about the project", sourceDate: "2026-08-01" })
        ],
        upcoming: [],
        completed: [],
        discarded: []
      }
    }
  }
});

// --- the sweep ---------------------------------------------------------------
{
  const app = load(fixture());
  const touched = app.expireDailyGoalTasks();
  const day = app.state.entries["2026-08-01"].tasks;
  const discardedIds = day.discarded.map((item) => item.id);
  const misses = app.goalLog.filter((event) => event.kind === "miss");

  check("yesterday's expiring goal task is discarded", discardedIds.includes("a2"));
  check("the sweep reaches sections other than inbox", discardedIds.includes("a1") && !day.rightNow.length);
  check("a task with no expiresOn still expires via its goal", discardedIds.includes("a2"));
  check("a goal that opts out of expiry carries forward", day.inbox.some((item) => item.id === "a3"));
  check("a hand-typed task is never touched", day.inbox.some((item) => item.id === "a4"));
  check("one miss per expired goal", misses.length === 2);
  check("the miss is booked against the day it was for", misses.every((event) => event.date === "2026-08-01"));
  check("the discarded row keeps the date it was for", day.discarded.every((item) => item.expiresOn === "2026-08-01"));
  check("the sweep reports the dates it changed", touched.length === 1 && touched[0] === "2026-08-01");
}

// --- a day already answered elsewhere ----------------------------------------
{
  const data = fixture();
  data.goalLog.push({ id: "c1", goalId: "daily-anki", date: "2026-08-01", kind: "check", value: true });
  const app = load(data);
  app.expireDailyGoalTasks();
  const misses = app.goalLog.filter((event) => event.kind === "miss");
  check("a checked day is not also booked as a miss", misses.length === 1 && misses[0].goalId === "daily-linkedin");
}

// --- the row follows the evidence --------------------------------------------
// A check booked from the entry (the server settling a filled-in survey) has to
// take the task row with it. Discarding a row whose goal is checked leaves the
// task history saying "never did it" while the goal log says the opposite, and
// that disagreement is what made the August 2026 adherence numbers unreadable.
{
  const data = fixture();
  data.goalLog.push({
    id: "c1",
    goalId: "daily-anki",
    date: "2026-08-01",
    kind: "check",
    value: true,
    ts: "2026-08-01T18:00:00.000Z",
    source: "evidence"
  });
  const app = load(data);
  app.expireDailyGoalTasks();
  const day = app.state.entries["2026-08-01"].tasks;
  const done = day.completed.find((item) => item.id === "a2");

  check("a checked goal's task is completed, not discarded", Boolean(done));
  check("the discarded pile does not also hold it", !day.discarded.some((item) => item.id === "a2"));
  check("it is stamped with when the evidence landed", done && done.completedAt === "2026-08-01T18:00:00.000Z");
  check("it keeps the day it was for", done && done.expiresOn === "2026-08-01");
  check("the unchecked goal is still discarded", day.discarded.some((item) => item.id === "a1"));
}

// An explicit "no" is not evidence of yes: unticking the survey checkbox writes
// a check row with value false, and that day is still a miss.
{
  const data = fixture();
  data.goalLog.push({ id: "c1", goalId: "daily-anki", date: "2026-08-01", kind: "check", value: false });
  const app = load(data);
  app.expireDailyGoalTasks();
  const day = app.state.entries["2026-08-01"].tasks;
  check("a check of false does not complete the task", day.discarded.some((item) => item.id === "a2"));
  check(
    "and the day is still booked as a miss",
    app.goalLog.some((event) => event.kind === "miss" && event.goalId === "daily-anki")
  );
}

// Two materialised copies of one habit must not book the miss twice, or a day
// counts as two failed days in the review.
{
  const data = fixture();
  data.entries["2026-08-01"].tasks.inbox.push(
    task({ id: "a5", text: "100 Anki cards", goalId: "daily-anki", expiresOn: "2026-08-01", sourceDate: "2026-08-01" })
  );
  const app = load(data);
  app.expireDailyGoalTasks();
  const ankiMisses = app.goalLog.filter((event) => event.kind === "miss" && event.goalId === "daily-anki");
  check("a duplicated goal task books one miss, not two", ankiMisses.length === 1);
}

// --- today is left alone ------------------------------------------------------
{
  const data = fixture();
  data.today = "2026-08-01";
  const app = load(data);
  const touched = app.expireDailyGoalTasks();
  check("a task still inside its own day survives", !touched.length && app.state.entries["2026-08-01"].tasks.inbox.length === 3);
}

// --- materializing ------------------------------------------------------------
{
  const data = fixture();
  data.goalLog = [];
  data.today = "2026-08-01";
  data.entries["2026-08-01"].tasks = null;
  const app = load(data);
  const touched = app.ensureDailyGoalTasks();
  const made = app.state.entries["2026-08-01"].tasks.inbox;
  const again = app.ensureDailyGoalTasks();

  check("one task per task-surfaced daily goal", touched.length === 1 && made.length === 3);
  check("survey-surfaced goals do not become tasks", !made.some((item) => item.goalId === "daily-eye-rest"));
  check("expiring goals carry the day they are for", made.filter((item) => item.expiresOn === "2026-08-01").length === 2);
  check("a non-expiring goal carries no expiry", made.some((item) => item.goalId === "daily-reading" && !item.expiresOn));
  check("the goal's estimate reaches its task", made.find((item) => item.goalId === "daily-linkedin").estimateMinutes === 30);
  check("a goal with no estimate leaves the task unestimated", made.find((item) => item.goalId === "daily-anki").estimateMinutes === 0);
  check("the goal's calendar category reaches its task", made.find((item) => item.goalId === "daily-linkedin").calendarCategory === "B");
  check("a goal with no category leaves the task uncategorised", made.find((item) => item.goalId === "daily-anki").calendarCategory === "");
  check("a second pass creates nothing", !again.length && app.state.entries["2026-08-01"].tasks.inbox.length === 3);
}

// --- renaming a goal reaches the row already in the list ----------------------
{
  const data = fixture();
  data.today = "2026-08-01";
  data.goalsDoc.goals[1].taskText = "200 Anki cards";
  data.goalsDoc.goals[1].estimateMinutes = 20;
  const app = load(data);
  const touched = app.ensureDailyGoalTasks();
  const anki = app.state.entries["2026-08-01"].tasks.inbox.find((item) => item.goalId === "daily-anki");
  check("a renamed goal renames today's open task", anki.text === "200 Anki cards" && touched.length === 1);
  check("a re-estimated goal re-estimates today's open task", anki.estimateMinutes === 20);
}

// --- the goal's category backfills a blank but never overwrites a choice ------
{
  const data = fixture();
  data.today = "2026-08-01";
  // Materialised before the field existed: no category on the row at all.
  data.goalsDoc.goals[1].calendarCategory = "S";
  // Hand-set on the row today; the goal must not stamp over it on the next pass.
  data.entries["2026-08-01"].tasks.rightNow[0].calendarCategory = "A";
  const app = load(data);
  app.ensureDailyGoalTasks();
  const anki = app.state.entries["2026-08-01"].tasks.inbox.find((item) => item.goalId === "daily-anki");
  const linkedin = app.state.entries["2026-08-01"].tasks.rightNow[0];
  check("a goal's category backfills a task that has none", anki.calendarCategory === "S");
  check("a goal's category does not overwrite one set on the row", linkedin.calendarCategory === "A");
}

console.log(failures ? `\n${failures} goal-task check(s) failed` : "\nAll goal-task expiry checks passed");
process.exit(failures ? 1 : 0);
