// Harness: extracts the real entry-sync helpers from app.js and server.cjs and
// replays the two-writer scenario that lost a night-survey `naps` value.
//
// Run with: node tests/entry-sync.test.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const serverSource = fs.readFileSync(path.join(root, "server.cjs"), "utf8");

const sliceBetween = (source, from, to, label) => {
  const a = source.indexOf(from);
  const b = source.indexOf(to, a);
  if (a === -1 || b === -1) throw new Error(`Could not extract ${label}`);
  return source.slice(a, b);
};

// The client's fingerprint pair, the three-way merge it relies on, and the task
// merge the poll runs on top of both. The real section list comes along so the
// harness cannot drift from TASK_SECTIONS.
const clientChunk =
  sliceBetween(appSource, "const TASK_SECTIONS = [", "const TASK_FILTERS", "task sections") +
  sliceBetween(appSource, "const ENTRY_SYNC_IGNORED_KEYS", "function isPlainObject", "client fingerprint") +
  sliceBetween(appSource, "function isPlainObject", "function applyMergedValue", "merge") +
  sliceBetween(appSource, "function mergeTasksFromServer", "// Append-only merge", "task merge");

// The server's copy of the fingerprint pair, which must agree exactly.
const serverChunk = sliceBetween(
  serverSource,
  "const ENTRY_SYNC_IGNORED_KEYS",
  "async function archiveEntry",
  "server fingerprint"
);

const loadClient = new Function(`
  function cloneValue(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }
  function sameValue(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  ${clientChunk}
  return { entrySyncFingerprint, stableStringify, mergeEntryVersions, mergeTasksFromServer, mergeTaskList };
`);
const loadServer = new Function(`
  ${serverChunk}
  return { entrySyncFingerprint, stableStringify };
`);

const client = loadClient();
const server = loadServer();

let failures = 0;
function check(name, condition, detail) {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL ${name}${detail ? ` -- ${detail}` : ""}`);
  }
}

const baseEntry = () => ({
  date: "2026-07-29",
  morning: { survey: { sleep: "Time I fell asleep: 11:30" } },
  night: {
    survey: {
      naps: "08:40-09:00",
      _napsCalendarAutofill: "1"
    }
  },
  tasks: { rightNow: [], today: [], inbox: [{ id: "t1", text: "a" }] },
  mistakes: [],
  _revision: 225,
  _savedAt: "2026-07-29T13:01:26.123Z"
});

// 1. The two implementations must agree, or every poll reports a phantom change.
check(
  "client and server fingerprints agree",
  client.entrySyncFingerprint(baseEntry()) === server.entrySyncFingerprint(baseEntry()),
  `${client.entrySyncFingerprint(baseEntry())} vs ${server.entrySyncFingerprint(baseEntry())}`
);

// 2. Key insertion order must not matter: the two sides build entries independently.
const reordered = JSON.parse(JSON.stringify(baseEntry()));
const shuffled = {};
for (const key of Object.keys(reordered).reverse()) shuffled[key] = reordered[key];
check(
  "fingerprint is stable across key order",
  client.entrySyncFingerprint(shuffled) === server.entrySyncFingerprint(baseEntry())
);

// 3. What the poll already carries must not move the fingerprint, or the client
//    would refuse to adopt a revision that only changed tasks or mistakes.
const withCarried = baseEntry();
withCarried.tasks.today.push({ id: "t2", text: "new" });
withCarried.mistakes.push({ id: "m1", what: "captured externally" });
withCarried._revision = 226;
withCarried._savedAt = "2026-07-29T13:02:42.549Z";
check(
  "tasks, mistakes and revision are ignored",
  client.entrySyncFingerprint(withCarried) === client.entrySyncFingerprint(baseEntry())
);

// 4. A survey answer the poll cannot carry must move it.
const otherWriter = baseEntry();
otherWriter.night.survey.naps = "13:00-13:30";
check(
  "a survey change is detected",
  client.entrySyncFingerprint(otherWriter) !== client.entrySyncFingerprint(baseEntry())
);

// 5. The regression itself. Another writer sets `naps`; this client never had
//    it. The poll must refuse the revision, and the 409 merge must then keep the
//    other writer's value instead of overwriting it with this client's blank.
const serverEntry = baseEntry();
serverEntry._revision = 226;

const clientBase = baseEntry(); // what this client last knew the server held
delete clientBase.night.survey.naps;
delete clientBase.night.survey._napsCalendarAutofill;

const clientLocal = JSON.parse(JSON.stringify(clientBase)); // untouched by the user

const restInSync = client.entrySyncFingerprint(clientBase) === server.entrySyncFingerprint(serverEntry);
check("poll refuses a revision it cannot account for", restInSync === false);

const merged = client.mergeEntryVersions(clientBase, clientLocal, serverEntry);
check("merge reports no conflict", merged.conflicts.length === 0, JSON.stringify(merged.conflicts));
check(
  "merge keeps the other writer's naps",
  merged.value.night.survey.naps === "08:40-09:00",
  JSON.stringify(merged.value.night.survey)
);
check(
  "merge keeps the autofill marker",
  merged.value.night.survey._napsCalendarAutofill === "1"
);

// 6. A genuine two-sided edit must still be reported rather than silently picked.
const bothEdited = JSON.parse(JSON.stringify(clientBase));
bothEdited.night.survey.naps = "20:00-20:30";
const conflicting = client.mergeEntryVersions(clientBase, bothEdited, serverEntry);
check("a real conflict is still surfaced", conflicting.conflicts.length > 0);

// 7. Once this client is back in step, the revision is adopted again -- otherwise
//    every save would 409 forever.
check(
  "an in-step client still adopts the revision",
  client.entrySyncFingerprint(baseEntry()) === server.entrySyncFingerprint(serverEntry)
);

/* --- The task-merge regression ----------------------------------------------
   "Tasks keep getting removed from Do right now": the poll assigned the disk copy
   over entry.tasks, so any task added since the last successful save was dropped
   the moment a poll landed -- guaranteed whenever a save was failing. --------- */

const emptyTasks = () => ({ rightNow: [], today: [], inbox: [], upcoming: [], completed: [], discarded: [] });
const task = (id, text) => ({ id, text, priority: "p4", dueDate: "", labels: [] });
const ids = (list) => list.map((item) => item.id).join(",");

// 8. The bug itself: added here, not yet on disk, and the poll must keep it.
const baseTasks = emptyTasks();
const localAdded = emptyTasks();
localAdded.rightNow = [task("new-1", "presentation backlog")];
const keptAdd = client.mergeTasksFromServer(baseTasks, localAdded, emptyTasks());
check("a task added since the last save survives the poll", ids(keptAdd.rightNow) === "new-1", ids(keptAdd.rightNow));

// 9. Quick-add puts a rightNow task at the front, and the HUD reads that row.
const baseTwo = emptyTasks();
baseTwo.rightNow = [task("old-1", "a"), task("old-2", "b")];
const localFront = emptyTasks();
localFront.rightNow = [task("new-1", "urgent"), task("old-1", "a"), task("old-2", "b")];
const frontMerged = client.mergeTasksFromServer(baseTwo, localFront, baseTwo);
check("an added task keeps its position", ids(frontMerged.rightNow) === "new-1,old-1,old-2", ids(frontMerged.rightNow));

// 10. A task the HUD completed is gone from disk and must not come back.
const serverCompleted = emptyTasks();
serverCompleted.rightNow = [task("old-2", "b")];
serverCompleted.completed = [{ ...task("old-1", "a"), source: "rightNow" }];
const afterHud = client.mergeTasksFromServer(baseTwo, JSON.parse(JSON.stringify(baseTwo)), serverCompleted);
check("a task completed in the HUD stays completed", ids(afterHud.rightNow) === "old-2", ids(afterHud.rightNow));

// 11. Both at once: the HUD completed one while this window added another.
const localAddedTwo = emptyTasks();
localAddedTwo.rightNow = [task("new-1", "urgent"), task("old-1", "a"), task("old-2", "b")];
const both = client.mergeTasksFromServer(baseTwo, localAddedTwo, serverCompleted);
check(
  "an added task and a HUD completion both land",
  ids(both.rightNow) === "new-1,old-2" && ids(both.completed) === "old-1",
  `${ids(both.rightNow)} / ${ids(both.completed)}`
);

// 12. A task deleted here must not be resurrected by a poll that races the save.
const localDeleted = emptyTasks();
localDeleted.rightNow = [task("old-1", "a")];
const afterDelete = client.mergeTasksFromServer(baseTwo, localDeleted, baseTwo);
check("a task deleted here is not resurrected", ids(afterDelete.rightNow) === "old-1", ids(afterDelete.rightNow));

// 13. With no base, an unsaved add and a remote removal are indistinguishable, so
//     the disk copy has to stand.
const noBase = client.mergeTasksFromServer(undefined, localAdded, emptyTasks());
check("without a base the disk copy stands", ids(noBase.rightNow) === "", ids(noBase.rightNow));

/* --- The wedge ---------------------------------------------------------------
   A leaf both sides edited used to abort the save for good: the revision and the
   base never advanced, so every later save 409'd on the same leaf and no task
   ever reached disk again from that window. -------------------------------- */

// 14. Same sentence at two keystrokes -- the real r50/r51 pair from 2026-07-30.
const typingBase = { morning: { survey: { dreams: "Song: sign crushes motorist, " } } };
const typingLocal = { morning: { survey: { dreams: "Song: sign crushes motorist, KayCyy -- Make Sure You're Loved\nDream: none" } } };
const typingRemote = { morning: { survey: { dreams: "Song: sign crushes motorist, KayCyy -- " } } };
const typed = client.mergeEntryVersions(typingBase, typingLocal, typingRemote);
check("a keystroke continuation is not a conflict", typed.conflicts.length === 0, JSON.stringify(typed.conflicts));
check(
  "the later keystroke wins",
  typed.value.morning.survey.dreams === typingLocal.morning.survey.dreams,
  typed.value.morning.survey.dreams
);
check(
  "the continuation rule is symmetric",
  client.mergeEntryVersions(typingBase, typingRemote, typingLocal).value.morning.survey.dreams ===
    typingLocal.morning.survey.dreams
);

// 15. A genuinely divergent leaf still has to resolve, or saving wedges. Swapping
//     local and remote is how performEntrySave() gets the disk value for it.
const divergentBase = { morning: { survey: { awake: "0:00", dreams: "same" } } };
const divergentLocal = { morning: { survey: { awake: "0:04", dreams: "mine" } } };
const divergentRemote = { morning: { survey: { awake: "0:09", dreams: "same" } } };
const reported = client.mergeEntryVersions(divergentBase, divergentLocal, divergentRemote);
check("a divergent leaf is still reported", reported.conflicts.includes("morning.survey.awake"), JSON.stringify(reported.conflicts));
const recovered = client.mergeEntryVersions(divergentBase, divergentRemote, divergentLocal);
check("the retry takes the disk value for it", recovered.value.morning.survey.awake === "0:09", recovered.value.morning.survey.awake);
check("the retry still keeps this window's untouched-remotely edit", recovered.value.morning.survey.dreams === "mine");

// 16. The quick-journal race: /api/quick-journal appended a block to the
//     document on disk while this window held an unsaved mid-document edit.
//     Neither string extends the other (the edit was mid-text), so the old
//     divergent-leaf rule resolved disk-side on retry and the typing was lost.
//     Now the appended suffix is carried onto the edited copy — both survive.
const qjBase = {
  journalHtml: "<p>morning pages</p><p>lunch with T</p>",
  journal: "morning pages\nlunch with T"
};
const qjLocal = {
  journalHtml: "<p>morning pages, edited mid-doc</p><p>lunch with T</p>",
  journal: "morning pages, edited mid-doc\nlunch with T"
};
const qjRemote = {
  journalHtml: "<p>morning pages</p><p>lunch with T</p><hr><p><strong>14:02 - 14:03</strong></p><p>quick note</p>",
  journal: "morning pages\nlunch with T\n\n---\n\n14:02 - 14:03\nquick note"
};
const qjMerged = client.mergeEntryVersions(qjBase, qjLocal, qjRemote);
check("a server append onto an edited document is not a conflict", qjMerged.conflicts.length === 0, JSON.stringify(qjMerged.conflicts));
check(
  "the appended block lands after the local edit",
  qjMerged.value.journalHtml === qjLocal.journalHtml + "<hr><p><strong>14:02 - 14:03</strong></p><p>quick note</p>",
  qjMerged.value.journalHtml
);
check(
  "the plain mirror carries the same append",
  qjMerged.value.journal === qjLocal.journal + "\n\n---\n\n14:02 - 14:03\nquick note",
  qjMerged.value.journal
);
check(
  "the append rule is symmetric across the retry swap",
  client.mergeEntryVersions(qjBase, qjRemote, qjLocal).value.journalHtml === qjMerged.value.journalHtml
);
// A non-journal leaf must never be glued together this way.
const glueBase = { morning: { survey: { dreams: "abc" } } };
const glueLocal = { morning: { survey: { dreams: "axc" } } };
const glueRemote = { morning: { survey: { dreams: "abc + more" } } };
check(
  "no other field gets the append treatment",
  client.mergeEntryVersions(glueBase, glueLocal, glueRemote).conflicts.includes("morning.survey.dreams")
);

console.log(failures ? `\n${failures} failing check(s)` : "\nAll entry-sync checks passed");
process.exit(failures ? 1 : 0);
