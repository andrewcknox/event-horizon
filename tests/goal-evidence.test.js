// Harness: extracts the real evidence rules from server.cjs and runs them over
// fabricated entries.
//
// The bug this guards: a daily goal could only be answered by its task row being
// ticked, so the log contradicted the entry sitting next to it -- a morning
// survey filled in on most days of a month could be booked as a handful of
// checks and more misses, because the row expired unticked while the answered
// survey was right there in the file. The rules below make the entry the answer.
//
// The other half of the contract matters just as much: no evidence must stay
// null and become an "unanswered" row, never a miss. Inventing failures is the
// same lie as flattering the rate, and the tests for that are at the bottom.
//
// Run with: node tests/goal-evidence.test.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const serverSource = fs.readFileSync(path.join(root, "server.cjs"), "utf8");

const sliceBetween = (source, from, to, label) => {
  const a = source.indexOf(from);
  const b = source.indexOf(to, a);
  if (a === -1 || b === -1) throw new Error(`Could not extract ${label}`);
  return source.slice(a, b);
};

// Real source only. Nothing here is re-implemented for the test.
const chunk = sliceBetween(
  serverSource,
  "// Slider blocks are stored as one",
  "const machineGoalSources",
  "evidence rules"
);

const { dailyGoalEvidence, surveyHasAnswer, surveyValueAnswered, coveredActualMinutes } = new Function(
  `${chunk}
  return { dailyGoalEvidence, surveyHasAnswer, surveyValueAnswered, coveredActualMinutes };`
)();

let failures = 0;
const check = (label, condition) => {
  if (condition) {
    console.log(`PASS ${label}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${label}`);
};

const ctx = (overrides = {}) => ({
  date: "2026-08-05",
  entry: {},
  eyeRestSessions: new Map(),
  calendarEvents: [],
  ...overrides
});
const verdict = (goalId, over) => dailyGoalEvidence[goalId](ctx(over));

// --- what counts as an answered survey ------------------------------------
check("a plain answer is an answer", surveyValueAnswered("It was natural"));
check("an empty string is not", !surveyValueAnswered(""));
check("whitespace is not", !surveyValueAnswered("   "));
check(
  "an untouched slider block is not an answer",
  !surveyValueAnswered("How anxious?: ; How depressed?: ; How much joy?: ")
);
check(
  "one filled slider makes the block an answer",
  surveyValueAnswered("How anxious?: ; How depressed?: 1; How much joy?: ")
);
check(
  "a labelled time is an answer",
  surveyValueAnswered("Time I fell asleep: 01:30; Time I woke up: 07:10")
);
check(
  "an image-only rich field is an answer",
  surveyValueAnswered({ text: "", image: "data:image/png;base64,xx" })
);
check("an empty rich field is not", !surveyValueAnswered({ text: "", image: null }));

check(
  "autofill markers alone do not make a survey answered",
  !surveyHasAnswer({ survey: { _sleepCalendarAutofill: "1" } })
);
check(
  "a rule rating mirrored back does not make the night survey answered",
  !surveyHasAnswer({ survey: { rulecheck: "Close the laptop at 19:00: 4 - did fine", dailycheck: "" } })
);
check("no survey object at all is not answered", !surveyHasAnswer({}));
check("a real answer is answered", surveyHasAnswer({ survey: { quality: "Sleep quality: 3" } }));

// --- morning / night survey ------------------------------------------------
check(
  "morning survey filled in reads as done",
  verdict("daily-morning-survey", {
    entry: { morning: { survey: { sleep: "Time I fell asleep: 01:30; Time I woke up: 07:10" } } }
  }) === true
);
check(
  "morning survey left empty reads as not done",
  verdict("daily-morning-survey", { entry: { morning: { survey: {} } } }) === false
);
check(
  "night survey filled in reads as done",
  verdict("daily-night-survey", {
    entry: { night: { survey: { mental: "How anxious?: 2; How much joy?: 4" } } }
  }) === true
);
check(
  "a night survey holding only the derived mirrors reads as not done",
  verdict("daily-night-survey", {
    entry: { night: { survey: { rulecheck: "Phone in the kitchen: -3 - nope", dailycheck: "" } } }
  }) === false
);

// --- journaling ------------------------------------------------------------
const words = (count) => Array.from({ length: count }, (_, i) => `w${i}`).join(" ");
check("a real journal entry reads as done", verdict("daily-journaling", { entry: { journal: words(40) } }) === true);
check("twenty words is the floor", verdict("daily-journaling", { entry: { journal: words(20) } }) === true);
check(
  "a stray sentence fragment is not a journal entry",
  verdict("daily-journaling", { entry: { journal: words(19) } }) === false
);
check("no journal at all reads as not done", verdict("daily-journaling", { entry: {} }) === false);

// --- eye rest --------------------------------------------------------------
// Five sessions is the threshold that reproduces all three answers given by
// hand before the night-survey checkbox was removed: 5 -> yes, 4 -> no, 1 -> no.
const sessions = (pairs) => ({ eyeRestSessions: new Map(pairs) });
check("five sessions reads as done", verdict("daily-eye-rest", sessions([["2026-08-05", 5]])) === true);
check("four sessions does not", verdict("daily-eye-rest", sessions([["2026-08-05", 4]])) === false);
check("one session does not", verdict("daily-eye-rest", sessions([["2026-08-05", 1]])) === false);
check("no sessions at all does not", verdict("daily-eye-rest", {}) === false);
check(
  "sessions on another day do not count",
  verdict("daily-eye-rest", sessions([["2026-08-04", 9]])) === false
);

// --- hours logged ----------------------------------------------------------
// Both hours goals read the calendar, not entry.hours: that grid has been empty
// every day since before the goals went live, so scoring it would have booked a
// miss on every single date.
const block = (from, to, over = {}) => ({
  kind: "actual",
  start: `2026-08-05T${from}`,
  end: `2026-08-05T${to}`,
  title: "did a thing",
  category: "W",
  ...over
});
const calendar = (events) => ({ calendarEvents: events });

check(
  "seventeen described hours reads as logged",
  verdict("daily-qual-hours", calendar([block("00:00", "17:00")])) === true
);
check(
  "sixteen hours is the floor",
  verdict("daily-qual-hours", calendar([block("00:00", "16:00")])) === true
);
check(
  "a part-logged day does not count",
  verdict("daily-qual-hours", calendar([block("09:00", "18:00")])) === false
);
check("an empty calendar does not count", verdict("daily-qual-hours", {}) === false);
check(
  "an untitled block is not a description",
  verdict("daily-qual-hours", calendar([block("00:00", "20:00", { title: "  " })])) === false
);
check(
  "an uncategorised block is not a category",
  verdict("daily-quant-hours", calendar([block("00:00", "20:00", { category: "" })])) === false
);
// The case the two goals exist to tell apart: described all day, filed for less.
{
  // Twenty hours described, ten of them filed under a category.
  const day = calendar([block("00:00", "20:00", { category: "" }), block("00:00", "10:00")]);
  check("a day can be described but not categorised", verdict("daily-qual-hours", day) === true);
  check("and read as a miss on the quantitative goal", verdict("daily-quant-hours", day) === false);
}
check(
  "plans are not actuals",
  verdict("daily-qual-hours", calendar([block("00:00", "20:00", { kind: "plan" })])) === false
);

// Overlapping blocks are merged, not summed. Eye rest and the blind journaling
// inside it deliberately overlap, so summing durations would credit a day with
// hours it never logged.
check(
  "overlapping blocks count once",
  coveredActualMinutes([block("09:00", "12:00"), block("10:00", "11:00")], "2026-08-05") === 180
);
check(
  "touching blocks join up",
  coveredActualMinutes([block("09:00", "10:00"), block("10:00", "11:00")], "2026-08-05") === 120
);
check(
  "separate blocks add up",
  coveredActualMinutes([block("09:00", "10:00"), block("14:00", "15:00")], "2026-08-05") === 120
);
check(
  "a block running past midnight is clipped to the day",
  coveredActualMinutes(
    [{ kind: "actual", start: "2026-08-05T23:00", end: "2026-08-06T07:00" }],
    "2026-08-05"
  ) === 60
);
check(
  "a block from the day before is clipped too",
  coveredActualMinutes(
    [{ kind: "actual", start: "2026-08-04T22:00", end: "2026-08-05T02:00" }],
    "2026-08-05"
  ) === 120
);
check(
  "a malformed block is skipped, not counted",
  coveredActualMinutes([{ kind: "actual", start: "nope", end: "also nope" }], "2026-08-05") === 0
);

// --- the goals deliberately left out ---------------------------------------
// These leave no trace anywhere but the tick. Absent from the table is the
// correct state: they keep the old task semantics rather than getting a
// fabricated outcome.
for (const goalId of ["daily-flashcards", "daily-reading", "daily-day-plan"]) {
  check(`${goalId} has no evidence rule`, !dailyGoalEvidence[goalId]);
}
// A goal whose survey question measures something adjacent is left unmapped
// rather than guessed at.
check("daily-protein is left unmapped rather than guessed", !dailyGoalEvidence["daily-protein"]);
// Rules go with their goals when a goal is archived, rather than sitting here
// scoring something nobody is keeping.
for (const goalId of ["daily-bed-by-10", "daily-calendar"]) {
  check(`${goalId} was dropped along with its goal`, !dailyGoalEvidence[goalId]);
}

if (failures) {
  console.error(`\n${failures} goal-evidence check(s) failed`);
  process.exit(1);
}
console.log("\nAll goal-evidence checks passed");
