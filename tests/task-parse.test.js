// Harness: extracts parseTaskInput and its helpers from app.js and runs them
// over quick-add lines.
//
// What this guards: the parser decides what part of a typed line is the task
// and what part is metadata, and every mistake it makes is destructive in the
// same quiet way -- a word it wrongly claims disappears out of the title. The
// three shapes that matter: a bare number is not a time, a duration is not a
// date, and a token switched off in the preview goes back into the title
// exactly as typed.
//
// Run with: node tests/task-parse.test.js
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

// Everything from the month table through the end of the date parsing helpers,
// so the real date rules run rather than a copy of them.
const chunk = sliceBetween(appSource, "const TASK_MONTHS = {", "function taskStorageDate(", "task parsing");
const normalizeChunk = sliceBetween(appSource, "function normalizeTask(task, sectionKey)", "const TASK_MONTHS = {", "normalizeTask");
const categories = sliceBetween(appSource, "const CALENDAR_CATEGORIES = [", "const CALENDAR_COLORS", "categories");

const load = new Function(
  "fixture",
  `
  ${categories}
  const state = { currentDate: fixture.today, entries: {} };
  const todayISO = () => fixture.today;
  const normalize = (value) => value.toLowerCase();
  const taskId = () => "task-fixed";
  const normalizeEstimateMinutes = (value) => {
    const minutes = Math.round(Number(value) || 0);
    return Number.isFinite(minutes) && minutes > 0 ? Math.min(minutes, 1440) : 0;
  };
  const normalizeCalendarCategory = (value) => {
    const code = String(value || "").trim().toUpperCase();
    return CALENDAR_CATEGORIES.some((category) => category.code === code) ? code : "";
  };
  const TASK_COMPLETION_SURFACES = ["app", "hud"];
  const TASK_SECTION_KEYS = ["rightNow", "inbox", "today", "upcoming", "completed"];
  const formatEstimate = (minutes) => minutes + "m";
  const formatClockFromTime = (time) => time;
  const formatShortDate = (date) => date;
  const trendsCategoryLabel = (code) => (CALENDAR_CATEGORIES.find((c) => c.code === code) || {}).label || code;
  ${normalizeChunk}
  ${chunk}
  return { parseTaskInput, parseTaskDurationAt, parseTaskTimeAt, parseTaskCategoryAt };
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

// 2026-08-10 is a Monday.
const api = load({ today: "2026-08-10" });
const parse = (text, options) => api.parseTaskInput(text, "inbox", options);

// --- the whole line ---------------------------------------------------------
{
  const { task } = parse("write the quarterly brief 90m tomorrow 2pm /W #report @deep p1");
  check("the title keeps only the words", task.text === "write the quarterly brief", `got "${task.text}"`);
  check("a length becomes an estimate", task.estimateMinutes === 90);
  check("a date word becomes a due date", task.dueDate === "2026-08-11");
  check("a clock time becomes a due time", task.dueTime === "14:00", task.dueTime);
  check("a slash code becomes a calendar category", task.calendarCategory === "W");
  check("the hash is the project", task.project === "report");
  check("the at-sign is a label", task.labels.join() === "deep");
  check("p1 is the priority", task.priority === "p1");
}

// --- durations --------------------------------------------------------------
{
  const cases = [
    ["email people 45m", 45],
    ["email people 45 min", 45],
    ["email people 45 minutes", 45],
    ["gym 1h", 60],
    ["gym 1.5h", 90],
    ["gym 1h30", 90],
    ["gym 1h30m", 90],
    ["gym 2 hours", 120],
    ["gym for 2 hours", 120]
  ];
  for (const [line, minutes] of cases) {
    const { task } = parse(line);
    check(`"${line}" reads ${minutes} minutes`, task.estimateMinutes === minutes, String(task.estimateMinutes));
  }
  check('"for" is eaten with the duration', parse("gym for 2 hours").task.text === "gym", parse("gym for 2 hours").task.text);
  check("a bare number is not a duration", parse("read 5 pages").task.estimateMinutes === 0);
  check("a bare number stays in the title", parse("read 5 pages").task.text === "read 5 pages");
  check('"in 2 hours" is not a length', parse("call in 2 hours").task.estimateMinutes === 0, String(parse("call in 2 hours").task.estimateMinutes));
}

// --- times ------------------------------------------------------------------
{
  const cases = [
    ["standup 9am", "09:00"],
    ["standup 2pm", "14:00"],
    ["standup 2:30pm", "14:30"],
    ["standup 12am", "00:00"],
    ["standup 12pm", "12:00"],
    ["standup 14:30", "14:30"],
    ["standup at 3", "15:00"],
    ["standup at 9", "09:00"]
  ];
  for (const [line, time] of cases) {
    const { task } = parse(line);
    check(`"${line}" reads ${time}`, task.dueTime === time, task.dueTime);
  }
  check("a bare number without 'at' is not a time", parse("call 3 people").task.dueTime === "");
  check("a bare number without 'at' stays in the title", parse("call 3 people").task.text === "call 3 people");
  check("13pm is not a time", parse("thing 13pm").task.dueTime === "");
  check("'at' is eaten with the time", parse("standup at 3").task.text === "standup", parse("standup at 3").task.text);
}

// --- categories -------------------------------------------------------------
{
  check("a bare code works", parse("thing /W").task.calendarCategory === "W");
  check("a lowercase code works", parse("thing /e").task.calendarCategory === "E");
  check("a label prefix works", parse("thing /exercise").task.calendarCategory === "E");
  check("an unknown slash word is left in the title", parse("read w/ notes /zzzz").task.calendarCategory === "");
  check("an unknown slash word survives in the title", parse("thing /zzzz").task.text === "thing /zzzz", parse("thing /zzzz").task.text);
  check("a two-letter fragment is too short to guess a label", parse("thing /ex").task.calendarCategory === "");
}

// --- switching a token off --------------------------------------------------
{
  const first = parse("meet at 3 about p1 forms");
  const time = first.tokens.find((token) => token.kind === "time");
  const priority = first.tokens.find((token) => token.kind === "priority");
  check("recognitions are reported as tokens", Boolean(time) && Boolean(priority));
  check("a token carries the raw text it claimed", time.text === "at 3", time.text);

  const second = parse("meet at 3 about p1 forms", { disabled: new Set([time.key]) });
  check("a disabled token stops taking effect", second.task.dueTime === "");
  check("a disabled token goes back into the title verbatim", second.task.text === "meet at 3 about forms", `got "${second.task.text}"`);
  check("a disabled token is still listed so it can be switched back", second.tokens.some((token) => token.key === time.key && token.off));
  check("the other tokens are unaffected", second.task.priority === "p1");

  const both = parse("meet at 3 about p1 forms", { disabled: new Set([time.key, priority.key]) });
  check("two disabled tokens both return", both.task.text === "meet at 3 about p1 forms", `got "${both.task.text}"`);
  check("token keys are stable across parses", parse("meet at 3 about p1 forms").tokens.map((t) => t.key).join() === first.tokens.map((t) => t.key).join());
}

// --- regressions on what was already understood ------------------------------
{
  check("a plain line is left alone", parse("buy milk").task.text === "buy milk");
  check("a plain line recognises nothing", parse("buy milk").tokens.length === 0);
  check("'now' still routes to the focus stack", parse("fix build now").section === "rightNow");
  check("an ISO date still parses", parse("thing 2026-09-01").task.dueDate === "2026-09-01");
  check("'next monday' still parses", parse("thing next monday").task.dueDate === "2026-08-17", parse("thing next monday").task.dueDate);
  check("only the first date wins", parse("thing tomorrow friday").task.dueDate === "2026-08-11");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
