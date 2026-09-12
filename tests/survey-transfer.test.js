// Harness: extracts the real survey move/copy from app.js and runs it over a
// fabricated pair of entries.
//
// What this guards: a survey filled in against the wrong date is repaired by
// moving the whole block of answers onto another day, and every way that can go
// wrong is silent. A merge instead of a replace leaves half of Tuesday inside
// Wednesday and reads as a real day. Carrying `rulecheck`/`dailycheck` files one
// day's goal ticks under another's date. Dropping the `_` autofill markers lets
// the sleep and nap prefills refill a moved answer from the wrong day's
// calendar. And an undo that restores only one of the two days is worse than no
// undo at all.
//
// Run with: node tests/survey-transfer.test.js
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

// Real source only. Everything stubbed in the harness is a surface (save,
// render, confirm) or a label, never a rule about what moves.
const chunk =
  sliceBetween(appSource, "function cloneValue", "function sameValue", "cloneValue") +
  sliceBetween(appSource, "function stableStringify", "function entrySyncFingerprint", "stableStringify") +
  sliceBetween(appSource, "const SURVEY_TRANSFER_SKIP_KEYS", "function appendSurveyTransferPanel", "survey transfer");

const load = new Function(
  "fixture",
  `
  const state = { entries: fixture.entries, currentDate: fixture.currentDate, session: fixture.session };
  const SCHEMA = fixture.schema;
  const saved = [];
  const logged = [];
  let surveyTransferDirection = fixture.direction || "to";
  let surveyTransferDate = fixture.transferDate || "";
  let lastSurveyTransfer = null;
  const els = { saveStatus: { textContent: "" } };
  function confirm() { return fixture.confirmAnswer !== false; }
  function ensureEntry(date) {
    if (!state.entries[date]) state.entries[date] = { date, morning: null, night: null };
    for (const name of ["morning", "night"]) {
      if (!state.entries[date][name]) state.entries[date][name] = { survey: {}, checked: {} };
      if (!state.entries[date][name].survey) state.entries[date][name].survey = {};
      if (!state.entries[date][name].checked) state.entries[date][name].checked = {};
    }
  }
  function isQuestionVisibleOn(sessionName, questionId, dateString) {
    return !(fixture.hiddenOn || []).some((item) => item.date === dateString && item.id === questionId);
  }
  function surveyDisplayLabel(question) { return question.label; }
  function formatShortDate(date) { return date; }
  function logAppEvent(kind, extra) { logged.push({ kind, ...extra }); }
  function saveEverywhere(options) { saved.push(...(options?.extraDates || [])); }
  function renderSurveyForm() {}
  function renderOutputs() {}
  ${chunk}
  return {
    state,
    saved,
    logged,
    els,
    setDirection(value) { surveyTransferDirection = value; },
    setTransferDate(value) { surveyTransferDate = value; },
    lastTransfer() { return lastSurveyTransfer; },
    surveyAnswerCount,
    sessionSurveyAnswerCount,
    surveyAnswersHiddenOn,
    surveyTransferFingerprint,
    transferSurvey,
    undoSurveyTransfer,
    runSurveyTransfer
  };
`
);

let failures = 0;
const check = (label, actual, expected) => {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a === b) return;
  failures += 1;
  console.error(`FAIL ${label}\n  expected ${b}\n  actual   ${a}`);
};
const ok = (label, value) => check(label, Boolean(value), true);
// Deleting and re-adding a key reorders the object, which JSON.stringify shows
// and nothing downstream cares about. Undo is compared on content only.
const stable = (value) => {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
};

const schema = {
  surveys: {
    morning: [
      { id: "sleep", label: "Sleep" },
      { id: "intention-1", label: "Intention" },
      { id: "mood", label: "Mood" },
      { id: "ruleplan", label: "Rule plan" }
    ],
    night: [{ id: "mental", label: "Mental" }]
  }
};

const session = (survey, checked = {}) => ({ survey, checked });
const fixture = (overrides = {}) => ({
  currentDate: "2026-08-16",
  session: "morning",
  schema,
  entries: {
    "2026-08-16": {
      date: "2026-08-16",
      morning: session(
        {
          sleep: "Time I fell asleep: 23:10; Time I woke up: 07:00",
          "intention-1": "Finish the brief",
          _sleepCalendarAutofill: "1",
          rulecheck: "Rule of the day | kept"
        },
        { "morning-1": true }
      ),
      night: session({})
    },
    "2026-08-15": {
      date: "2026-08-15",
      morning: session({ mood: "Flat", dailycheck: "Anki" }, {}),
      night: session({})
    }
  },
  ...overrides
});

/* --- Moving ---------------------------------------------------------------- */

{
  const app = load(fixture());
  app.transferSurvey("2026-08-16", "2026-08-15", "morning", "move");
  const from = app.state.entries["2026-08-16"].morning;
  const to = app.state.entries["2026-08-15"].morning;

  check("move: answers land on the target", to.survey["intention-1"], "Finish the brief");
  check("move: autofill markers travel with their answer", to.survey._sleepCalendarAutofill, "1");
  check("move: checked travels", to.checked, { "morning-1": true });
  check("move: source is cleared", Object.keys(from.survey).sort(), ["rulecheck"]);
  check("move: source checked is cleared", from.checked, {});
  // The target's own goal mirror stays; the source's rulecheck never left.
  check("move: target keeps its own dailycheck", to.survey.dailycheck, "Anki");
  check("move: no rulecheck rides along", "rulecheck" in to.survey, false);
  // Replace, not merge: the target's own answer to a question the source never
  // answered must not survive underneath the moved block.
  check("move: target's prior answers are replaced", "mood" in to.survey, false);
}

/* --- Copying --------------------------------------------------------------- */

{
  const app = load(fixture());
  app.transferSurvey("2026-08-16", "2026-08-15", "morning", "copy");
  check("copy: source keeps its answers", app.state.entries["2026-08-16"].morning.survey["intention-1"], "Finish the brief");
  check("copy: target gets them too", app.state.entries["2026-08-15"].morning.survey["intention-1"], "Finish the brief");
  // A copy shares no objects with its source, or editing one day would edit both.
  app.state.entries["2026-08-15"].morning.survey["intention-1"] = "Something else";
  check("copy: the two days are independent", app.state.entries["2026-08-16"].morning.survey["intention-1"], "Finish the brief");
}

/* --- Undo ------------------------------------------------------------------ */

{
  const app = load(fixture());
  const before = stable(app.state.entries);
  const record = app.transferSurvey("2026-08-16", "2026-08-15", "morning", "move");
  app.undoSurveyTransfer(record);
  check("undo: both days are exactly as they were", stable(app.state.entries), before);
  check("undo: writes both days back to disk", app.saved.sort(), ["2026-08-15", "2026-08-16"]);
}

{
  const app = load(fixture());
  const before = stable(app.state.entries["2026-08-15"]);
  const record = app.transferSurvey("2026-08-16", "2026-08-15", "morning", "copy");
  app.undoSurveyTransfer(record);
  check("undo copy: the overwritten day is restored", stable(app.state.entries["2026-08-15"]), before);
  check("undo copy: the source is untouched", app.state.entries["2026-08-16"].morning.survey["intention-1"], "Finish the brief");
}

/* --- The undo offer expires when the target is edited by hand -------------- */

{
  const app = load(fixture());
  const record = app.transferSurvey("2026-08-16", "2026-08-15", "morning", "move");
  check(
    "fingerprint: still matches straight after the move",
    app.surveyTransferFingerprint("2026-08-15", "morning"),
    record.resultFingerprint
  );
  app.state.entries["2026-08-15"].morning.survey["intention-1"] = "Edited by hand";
  ok(
    "fingerprint: a hand edit retires the undo",
    app.surveyTransferFingerprint("2026-08-15", "morning") !== record.resultFingerprint
  );
}

/* --- Counting answers ------------------------------------------------------ */

{
  const app = load(fixture());
  check("count: derived mirrors and markers do not count", app.sessionSurveyAnswerCount("2026-08-16", "morning"), 2);
  // An untouched slider block still carries every label, and that is not an answer.
  check("count: an untouched slider block is not an answer", app.surveyAnswerCount({ mood: "How anxious?: ; How much joy?: " }), 0);
  check("count: one filled label is", app.surveyAnswerCount({ mood: "How anxious?: 3; How much joy?: " }), 1);
  check("count: an image with no text counts", app.surveyAnswerCount({ photo: { text: "", image: "/x.jpg" } }), 1);
  check("count: an empty text/image block does not", app.surveyAnswerCount({ photo: { text: "  ", image: "" } }), 0);
}

/* --- Answers whose question the target day did not have -------------------- */

{
  const app = load(fixture({ hiddenOn: [{ date: "2026-08-15", id: "intention-1" }] }));
  check(
    "hidden: names the question the target day no longer shows",
    app.surveyAnswersHiddenOn(app.state.entries["2026-08-16"].morning.survey, "morning", "2026-08-15"),
    ["Intention"]
  );
  check(
    "hidden: nothing to say when the target shows them all",
    app.surveyAnswersHiddenOn(app.state.entries["2026-08-16"].morning.survey, "morning", "2026-08-14"),
    []
  );
}

/* --- The driver refuses the transfers that would destroy something --------- */

{
  const app = load(fixture());
  app.setTransferDate("2026-08-16");
  app.runSurveyTransfer("move");
  check("driver: refuses a transfer onto the day you are on", app.lastTransfer(), null);

  app.setTransferDate("");
  app.runSurveyTransfer("move");
  check("driver: refuses without a date", app.lastTransfer(), null);

  // Pulling from a day with nothing on it would blank the day you are on.
  app.setDirection("from");
  app.setTransferDate("2026-08-14");
  app.runSurveyTransfer("move");
  check("driver: refuses to pull an empty survey over a filled one", app.lastTransfer(), null);
  check("driver: the day you are on is untouched", app.state.entries["2026-08-16"].morning.survey["intention-1"], "Finish the brief");
}

{
  const app = load(fixture({ confirmAnswer: false }));
  app.setTransferDate("2026-08-15");
  app.runSurveyTransfer("move");
  check("driver: declining the overwrite prompt changes nothing", app.lastTransfer(), null);
  check("driver: the target keeps its answer", app.state.entries["2026-08-15"].morning.survey.mood, "Flat");
}

{
  const app = load(fixture());
  app.setTransferDate("2026-08-15");
  app.runSurveyTransfer("move");
  ok("driver: a confirmed move goes through", app.lastTransfer());
  check("driver: both days are saved", app.saved.sort(), ["2026-08-15", "2026-08-16"]);
  check("driver: the move is logged", app.logged[0], {
    kind: "survey-transfer",
    from: "2026-08-16",
    to: "2026-08-15",
    session: "morning",
    mode: "move"
  });
}

if (failures) {
  console.error(`\n${failures} check${failures === 1 ? "" : "s"} failed.`);
  process.exit(1);
}
console.log("survey-transfer: all checks passed.");
