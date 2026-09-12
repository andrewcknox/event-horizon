// Harness: extracts the auto-detected-people rules from app.js -- who counts as
// mentioned in a day, which mentions are safe to tick, and which are only safe
// to surface -- and runs them over fabricated days.
//
// What this guards: this list writes an answer the user reads back months
// later, and both failure directions are silent. Too eager, and a bare "Jordan"
// in the journal files the evening under whichever of the three Jordans happens
// to sort first, which then reads as fact forever. Too shy, and the feature
// does nothing while its notice implies it looked -- worse than no feature,
// because the absence of a name starts to mean something.
//
// The plan/actual split is the case that looks like an edge and is not: a block
// you meant to spend with someone is evidence of an intention, not of a day.
// Detecting off plans would tick people for evenings that never happened.
//
// Run with: node tests/interaction-detect.test.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");

const sliceBetween = (source, from, to, label) => {
  const a = source.indexOf(from);
  const b = source.indexOf(to, a);
  if (a === -1 || b === -1) throw new Error("Could not extract " + label);
  return source.slice(a, b);
};

// Real source only: the detector plus the two string helpers it leans on.
// Stubs below are storage plumbing (which events exist, what the journal says),
// never decisions about who was mentioned.
const chunk =
  sliceBetween(appSource, "function normalize(value) {", "function detectChoices", "normalize") +
  sliceBetween(appSource, "function escapeRegExp(value) {", "function extractForm", "escapeRegExp") +
  sliceBetween(appSource, "const INTERACTION_AUTO_KEY", "function appendInteractionControl", "interaction detection");

const load = new Function(
  "fixture",
  [
    "const state = { entries: fixture.entries };",
    "function eventsForDay(date) { return fixture.events.filter((event) => event.date === date); }",
    chunk,
    "return { detectInteractionMentions, interactionMentionSources, personNameForms, mentionsName,",
    "         readInteractionAuto, markInteractionAuto, INTERACTION_AUTO_KEY };"
  ].join("\n")
);

let failures = 0;
const check = (label, condition, detail) => {
  if (condition) {
    console.log("PASS " + label);
    return;
  }
  failures += 1;
  console.log("FAIL " + label + (detail ? " -- " + detail : ""));
};

// The registry shape that matters: display strings carrying the number prefixes
// and parentheticals that exist only to disambiguate this picker, aliases that
// are the name people actually write, and three Jordans so that first-name
// ambiguity is a real case rather than a hypothetical one. Everyone here is
// invented.
const PEOPLE = [
  { display: "2 Sam", person: { name: "Sam", aliases: ["2 Sam"] } },
  { display: "3 Mom", person: { name: "Mom", aliases: ["3 Mom"] } },
  { display: "7 Priya", person: { name: "Priya Raman", aliases: ["7 Priya"] } },
  { display: "Jordan (chess club)", person: { name: "Jordan (chess club)", aliases: [] } },
  { display: "Jordan Hale", person: { name: "Jordan Hale", aliases: [] } },
  { display: "Jordan Park", person: { name: "Jordan Park", aliases: [] } },
  { display: "Katya (book club)", person: { name: "Ekaterina", aliases: ["Katya (book club)"] } },
  { display: "Li Wenjie", person: { name: "Li Wenjie", aliases: [] } },
  { display: "Nadia Brooks", person: { name: "Nadia Brooks", aliases: [] } }
];

const DATE = "2026-08-30";
const APOS = String.fromCharCode(39);

const day = (spec) =>
  load({
    entries: { [DATE]: { journal: spec.journal || "" } },
    events: (spec.events || []).map((event) =>
      Object.assign({ date: DATE, kind: "actual", title: "", location: "", notes: "" }, event))
  });

const detect = (api) => api.detectInteractionMentions(PEOPLE, api.interactionMentionSources(DATE));
const names = (hits) => hits.map((hit) => hit.display).sort();
const confident = (hits) => names(hits.filter((hit) => !hit.ambiguous));
const unsure = (hits) => names(hits.filter((hit) => hit.ambiguous));

// --- what counts as a mention ------------------------------------------------
{
  const hits = detect(day({ journal: "Long call with Sam, then Mom rang." }));
  check("journal first names are found", confident(hits).join("|") === "2 Sam|3 Mom", confident(hits).join("|"));
  check("journal is named as the source", hits.every((hit) => hit.sources.join() === "journal"));
}

{
  const hits = detect(day({ events: [{ title: "Coffee with Priya" }] }));
  check("actual event titles are found", confident(hits).join("|") === "7 Priya", confident(hits).join("|"));
  check("events are named as the source", Boolean(hits[0]) && hits[0].sources.join() === "events");
}

{
  const hits = detect(day({ events: [
    { title: "Dinner", location: "Sam" + APOS + "s place" },
    { title: "Work", notes: "debrief with Nadia Brooks" }
  ] }));
  check("location and notes count as part of the event", confident(hits).join("|") === "2 Sam|Nadia Brooks", confident(hits).join("|"));
}

{
  const hits = detect(day({ journal: "Ran into Priya.", events: [{ title: "Lunch with Priya" }] }));
  check("both sources are reported when both name someone", Boolean(hits[0]) && hits[0].sources.join("+") === "events+journal", String(hits[0] && hits[0].sources));
}

// A plan is an intention. Ticking off one would record evenings that never were.
{
  check("plans are not evidence", detect(day({ events: [{ title: "Coffee with Priya", kind: "plan" }] })).length === 0);
}

// --- what must NOT count -----------------------------------------------------
{
  const hits = detect(day({ journal: "The samosas were sold out, and mommy blogs are a genre." }));
  check("names only match whole words", hits.length === 0, JSON.stringify(names(hits)));
}

{
  const hits = detect(day({ journal: "Sam" + APOS + "s dog got out." }));
  check("a possessive still counts", confident(hits).join("|") === "2 Sam");
}

// "Li" on its own is a syllable, not a mention. The full name still finds them.
{
  const hits = detect(day({ journal: "A li is an old unit of distance." }));
  check("two-letter first names are not matched bare", hits.length === 0, JSON.stringify(names(hits)));
}
{
  const hits = detect(day({ journal: "Coffee with Li Wenjie." }));
  check("a short first name is still found by full name", confident(hits).join("|") === "Li Wenjie");
}

// --- ambiguity ---------------------------------------------------------------
{
  const hits = detect(day({ journal: "Saw Jordan tonight." }));
  check("a shared first name surfaces every candidate", unsure(hits).join("|") === "Jordan (chess club)|Jordan Hale|Jordan Park", unsure(hits).join("|"));
  check("a shared first name ticks no one", confident(hits).length === 0, confident(hits).join("|"));
}

{
  const hits = detect(day({ journal: "Saw Jordan Hale tonight." }));
  check("a full name settles its own first name", confident(hits).join("|") === "Jordan Hale", confident(hits).join("|"));
  check("the other Jordans are dropped, not left dangling", unsure(hits).length === 0, unsure(hits).join("|"));
}

// Archived people are never offered, but they are still who the user means
// half the time. The case that prompted this: one Jordan left on the list, two
// retired, and the evening belonged to a retired one.
{
  const pool = PEOPLE.filter((item) => item.display === "Jordan Park").concat([
    { display: "Jordan Hale", person: { name: "Jordan Hale", aliases: [] }, offered: false },
    { display: "Jordan (chess club)", person: { name: "Jordan (chess club)", aliases: [] }, offered: false }
  ]);
  const api = day({ events: [{ title: "Walked around with Jordan" }] });
  const hits = api.detectInteractionMentions(pool, api.interactionMentionSources(DATE));
  check("an archived namesake still makes a first name ambiguous", unsure(hits).join("|") === "Jordan Park", unsure(hits).join("|"));
  check("the last Jordan standing is not ticked by default", confident(hits).length === 0, confident(hits).join("|"));
  check("archived people are never returned as hits", hits.every((hit) => hit.display === "Jordan Park"));
}

// ...and when the day names the archived one outright, the mention is spent:
// the one still on the list must not inherit it.
{
  const pool = PEOPLE.filter((item) => item.display === "Jordan Park").concat([
    { display: "Jordan Hale", person: { name: "Jordan Hale", aliases: [] }, offered: false }
  ]);
  const api = day({ events: [{ title: "Walked around with Jordan Hale" }] });
  const hits = api.detectInteractionMentions(pool, api.interactionMentionSources(DATE));
  check("a resolved mention does not fall through to the survivor", hits.length === 0, JSON.stringify(names(hits)));
}

// --- aliases -----------------------------------------------------------------
{
  check("the registry name is matched, not just the picker label",
    confident(detect(day({ journal: "Ekaterina came by." }))).join("|") === "Katya (book club)");
  check("the picker label is matched too",
    confident(detect(day({ journal: "Katya came by." }))).join("|") === "Katya (book club)");
}

// Nobody writes a number prefix or a disambiguating parenthetical in a
// sentence, so neither can be part of what the detector looks for.
{
  const api = day({});
  check("number prefixes are stripped", api.personNameForms("7 Priya", null)[0].full === "priya");
  check("parentheticals are stripped", api.personNameForms("Ravi (exchange student)", null)[0].full === "ravi");
  const quoted = "Max " + String.fromCharCode(34) + "Ace" + String.fromCharCode(34) + " Rivera";
  check("quoted nicknames become words", api.personNameForms(quoted, null)[0].words.join("|") === "max|ace|rivera");
}

// --- the once-per-day marker -------------------------------------------------
{
  const api = day({});
  const survey = {};
  check("no marker reads as nobody auto-ticked", api.readInteractionAuto(survey).length === 0);
  api.markInteractionAuto(survey, ["2 Sam"]);
  api.markInteractionAuto(survey, ["2 Sam", "3 Mom"]);
  check("the marker is a set, not a log", api.readInteractionAuto(survey).join("|") === "2 Sam|3 Mom", api.readInteractionAuto(survey).join("|"));
  check("the marker stays out of surveyAnswerCount", api.INTERACTION_AUTO_KEY.charAt(0) === "_");
  survey[api.INTERACTION_AUTO_KEY] = "{not json";
  check("a corrupt marker degrades to nobody", api.readInteractionAuto(survey).length === 0);
}

console.log(failures ? "\n" + failures + " FAILED" : "\nAll passed");
process.exit(failures ? 1 : 0);
