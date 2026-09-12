// Harness: extracts the pegged-task rules from app.js -- which calendar blocks
// carry a task, where that task lives, and what moving the block does to its
// due date -- and runs them over a fabricated set of entries.
//
// What this guards: a peg writes to a file the user is not looking at. Both
// failures are silent. Too eager, and dragging an "actual" block or an archived
// plan quietly reschedules a task backwards into a day that already happened,
// or a block that merely shares a title hijacks a task nobody linked. Too shy,
// and the feature does nothing while the block sits there implying it did --
// which is worse than not having it, because the calendar then lies about when
// the work is due.
//
// The rightNow case is the one that looks like an edge and is not: every
// rightNow lookup goes to today's entry (taskStorageDate), so the rightNow
// lists left behind in old entries are dead storage. Moving one would write a
// due date into a list the app never reads back.
//
// Run with: node tests/task-peg.test.js
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

// Real source only: the task storage rules (which entry and section a task id
// resolves in) and the peg rules on top of them. Stubs below are storage
// plumbing and clocks, never decisions.
const chunk =
  sliceBetween(appSource, "function taskStorageDate", "function destinationForDueDate", "task storage helpers") +
  sliceBetween(appSource, "// The day a pegged task should be due", "/* Applies the follow", "peg rules");

const load = new Function(
  "fixture",
  `
  const TASK_SECTION_KEYS = ["rightNow", "today", "inbox", "upcoming"];
  const state = { entries: fixture.entries, currentDate: fixture.today };
  function todayISO() { return fixture.today; }
  function ensureEntry(date) {
    if (!state.entries[date]) state.entries[date] = { tasks: {} };
    const tasks = state.entries[date].tasks;
    for (const key of TASK_SECTION_KEYS) if (!Array.isArray(tasks[key])) tasks[key] = [];
  }
  function ensureTaskState() {}
  ${chunk}
  return { peggedTaskFollowTarget, findTaskRefById, peggedTaskDueDateChange, state };
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

const task = (id, extra = {}) => ({ id, text: id, dueDate: "", ...extra });
const block = (extra = {}) => ({
  id: "block-1",
  kind: "plan",
  title: "Write the brief",
  start: "2026-09-02T09:00",
  end: "2026-09-02T10:00",
  taskId: "",
  supersededAt: "",
  ...extra
});

const fixture = () => ({
  today: "2026-08-30",
  entries: {
    // A rightNow list left behind on a day that has passed: real shape, dead
    // storage. Nothing may resolve out of it.
    "2026-07-15": { tasks: { rightNow: [task("stale-right-now")], today: [], inbox: [], upcoming: [] } },
    "2026-08-20": { tasks: { rightNow: [], today: [], inbox: [task("inbox-task")], upcoming: [] } },
    "2026-08-30": {
      tasks: {
        rightNow: [task("live-right-now")],
        today: [task("today-task", { dueDate: "2026-08-30" })],
        inbox: [],
        upcoming: []
      }
    }
  }
});

const changeFor = (event, entries = fixture()) => {
  const api = load(entries);
  return api.peggedTaskDueDateChange(event, api.findTaskRefById(event.taskId));
};

// --- The follow itself -------------------------------------------------------

const moved = changeFor(block({ taskId: "today-task" }));
check(
  "a dated task follows its block to the new day",
  moved && moved.to === "2026-09-02" && moved.from === "2026-08-30" && moved.sectionKey === "today",
  JSON.stringify(moved)
);

check(
  "moving a block within its own day is not a reschedule",
  changeFor(block({ taskId: "today-task", start: "2026-08-30T14:00", end: "2026-08-30T15:00" })) === null
);

const dated = changeFor(block({ taskId: "inbox-task" }));
check(
  "an undated task pegged to a block gets that block's day",
  dated && dated.to === "2026-09-02" && dated.from === "2026-08-20" && dated.sectionKey === "inbox",
  JSON.stringify(dated)
);

// --- What must never move a task ---------------------------------------------

check(
  "an unlinked block never moves a task, whatever it is called",
  changeFor(block({ title: "today-task" })) === null
);

check(
  "an actual block is a record of work done, not a schedule",
  changeFor(block({ taskId: "today-task", kind: "actual" })) === null
);

check(
  "a deadline block does not reschedule the task it was placed for",
  changeFor(block({ taskId: "today-task", kind: "deadline" })) === null
);

check(
  "an archived plan block cannot drag a task back into the old plan",
  changeFor(block({ taskId: "today-task", supersededAt: "2026-08-29T22:00:00.000Z" })) === null
);

check(
  "a peg whose task is gone is a no-op, not a crash",
  changeFor(block({ taskId: "completed-yesterday" })) === null
);

// --- Where a task is allowed to be found -------------------------------------

const api = load(fixture());
check(
  "a rightNow list left in an old entry is dead storage",
  api.findTaskRefById("stale-right-now") === null
);

const live = api.findTaskRefById("live-right-now");
check(
  "today's rightNow list is live",
  live && live.sectionKey === "rightNow" && live.ref.date === "2026-08-30",
  JSON.stringify(live && live.sectionKey)
);

check(
  "a block with no start date pegs nothing",
  api.peggedTaskFollowTarget(block({ taskId: "today-task", start: "" })) === null
);

if (failures) {
  console.error(`${failures} check(s) failed`);
  process.exit(1);
}
console.log("All task-peg checks passed");
