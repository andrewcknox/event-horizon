// Harness: extracts the real backup and guard code out of server.cjs and runs it
// against a scratch directory, so the assertions are about the shipped functions
// rather than a reimplementation of them.
//
// What this guards: on 2026-08-17 the server was down, the app came up from its
// cached shell with an empty calendar, and one drag would have POSTed [] over 856
// events. calendar-events.json has no second copy anywhere -- it is deliberately
// left out of the localStorage snapshot -- so that write would have been the end
// of it. Everything here exists to make that specific write impossible.
//
// The awkward part of a guard like this is that it has to say no to the
// catastrophe and yes to the ordinary bulk delete, and the two look similar from
// underneath. So the size cases are pinned from both directions: a small file
// shrinking to nothing is fine (a shopping list empties), a large one shrinking
// to nothing is not, and an append-only log may not shrink by a single row.
//
// Run with: node tests/data-backup.test.js
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const os = require("os");

const repoRoot = path.join(__dirname, "..");
const serverSource = fs.readFileSync(path.join(repoRoot, "server.cjs"), "utf8");

const sliceBetween = (source, from, to, label) => {
  const a = source.indexOf(from);
  const b = source.indexOf(to, a);
  if (a === -1 || b === -1) throw new Error(`Could not extract ${label}`);
  return source.slice(a, b);
};

// One slice from the atomic writer through to the end of the backup block. If
// any of these get renamed the extraction throws, which is the point: a silently
// skipped suite would be worse than a failing one.
const chunk = sliceBetween(
  serverSource,
  "async function writeJsonAtomic(",
  "function delay(ms)",
  "backup and guard block"
);

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "journal-backup-test-"));

const load = (root) =>
  new Function(
    "fs",
    "path",
    "crypto",
    "root",
    `
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    ${chunk}
    return {
      writeDataFile, checkDataWriteGuard, archiveDataFile, DataWriteGuardError,
      DATA_FILE_POLICY, DATA_GUARD_MIN_ROWS, DATA_GUARD_MAX_LOSS,
      backupHistoryDir, backupRejectedDir, backupDailyDir, backupDayISO
    };
    `
  )(fsp, path, crypto, root);

let pass = 0;
let fail = 0;
const check = (label, condition, detail = "") => {
  if (condition) {
    pass += 1;
    console.log(`  ok   ${label}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${label}${detail ? ` -- ${detail}` : ""}`);
  }
};

const rows = (count, from = 0) =>
  Array.from({ length: count }, (_, i) => ({ id: `e${i + from}`, start: "2026-08-10T09:00", title: `Event ${i + from}` }));

const caseRoot = (name) => {
  const dir = path.join(scratch, name);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const historyFiles = (api, name) => {
  try {
    return fs.readdirSync(path.join(api.backupHistoryDir, name)).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return [];
  }
};

async function main() {
  {
    console.log("\nThe write that started all this:");
    const root = caseRoot("incident");
    const api = load(root);
    const live = path.join(root, "calendar-events.json");
    await api.writeDataFile(live, rows(856));

    let refused = null;
    try {
      await api.writeDataFile(live, []);
    } catch (error) {
      refused = error;
    }
    check("856 events cannot be replaced by nothing", refused instanceof api.DataWriteGuardError, String(refused));
    check("and the file on disk is untouched", readJson(live).length === 856, `${readJson(live).length} rows`);
    check("the refusal says what it would have cost", /856/.test(refused?.message || ""), refused?.message);
    check(
      "the refused payload is kept, not discarded",
      fs.readdirSync(path.join(api.backupRejectedDir, "calendar-events.json")).length === 1
    );
  }

  {
    console.log("\nWhat the guard must still allow:");
    const root = caseRoot("allowed");
    const api = load(root);
    const live = path.join(root, "calendar-events.json");

    await api.writeDataFile(live, rows(100));
    await api.writeDataFile(live, rows(60));
    check("a normal delete of 40 rows goes through", readJson(live).length === 60, `${readJson(live).length} rows`);

    // 60 -> 30 is exactly half, which is the boundary and must pass; the guard
    // only fires above DATA_GUARD_MAX_LOSS, not at it.
    await api.writeDataFile(live, rows(30));
    check("losing exactly half is allowed at the boundary", readJson(live).length === 30, `${readJson(live).length} rows`);

    const small = path.join(root, "shopping-list.json");
    await api.writeDataFile(small, rows(6));
    await api.writeDataFile(small, []);
    check("a short list may still be emptied completely", readJson(small).length === 0);

    await api.writeDataFile(live, rows(400, 1000));
    check("growth is never questioned", readJson(live).length === 400, `${readJson(live).length} rows`);
  }

  {
    console.log("\nAppend-only logs:");
    const root = caseRoot("append-only");
    const api = load(root);
    const live = path.join(root, "goal-log.json");
    await api.writeDataFile(live, rows(100));

    let refused = null;
    try {
      await api.writeDataFile(live, rows(99));
    } catch (error) {
      refused = error;
    }
    check("a log that only grows may not lose even one row", refused instanceof api.DataWriteGuardError, String(refused));
    check("the log is intact", readJson(live).length === 100, `${readJson(live).length} rows`);
  }

  {
    console.log("\nThe override, for when the delete was meant:");
    const root = caseRoot("force");
    const api = load(root);
    const live = path.join(root, "calendar-events.json");
    await api.writeDataFile(live, rows(856));
    await api.writeDataFile(live, [], { force: true });
    check("force writes the emptying through", readJson(live).length === 0);
    check(
      "and the 856 rows are still in history afterwards",
      historyFiles(api, "calendar-events.json").some(
        (file) => readJson(path.join(api.backupHistoryDir, "calendar-events.json", file)).length === 856
      )
    );
  }

  {
    console.log("\nPre-write history:");
    const root = caseRoot("history");
    const api = load(root);
    const live = path.join(root, "calendar-events.json");

    await api.writeDataFile(live, rows(30));
    await api.writeDataFile(live, rows(31));
    await api.writeDataFile(live, rows(32));
    const files = historyFiles(api, "calendar-events.json");
    check("each overwrite leaves the previous contents behind", files.length === 2, `${files.length} copies`);
    check(
      "and they hold what was replaced, not what replaced it",
      readJson(path.join(api.backupHistoryDir, "calendar-events.json", files[0])).length === 30
    );

    // The client POSTs the whole array on every edit, most of which change
    // nothing. Without this, an idle afternoon pushes the last genuinely
    // different version out of the window -- the way entries/.history once
    // reached 5,533 near-identical files.
    // The first of these does archive: rows(32) is live but has never been
    // copied yet. The three after it are the ones that must cost nothing.
    const before = historyFiles(api, "calendar-events.json").length;
    for (let i = 0; i < 4; i += 1) await api.writeDataFile(live, rows(32));
    check(
      "repeated identical writes consume one slot between them, not four",
      historyFiles(api, "calendar-events.json").length === before + 1,
      `${historyFiles(api, "calendar-events.json").length} vs ${before + 1}`
    );
  }

  {
    console.log("\nRotation:");
    const root = caseRoot("rotation");
    const api = load(root);
    const live = path.join(root, "hud-log.json");
    const keep = api.DATA_FILE_POLICY["hud-log.json"].keep;
    for (let i = 1; i <= keep + 6; i += 1) await api.writeDataFile(live, rows(i));
    const files = historyFiles(api, "hud-log.json");
    check(`history is capped at the policy's ${keep}`, files.length === keep, `${files.length} copies`);
    check(
      "and it is the oldest that are dropped",
      readJson(path.join(api.backupHistoryDir, "hud-log.json", files[files.length - 1])).length === keep + 5
    );
  }

  {
    console.log("\nDaily snapshots:");
    const root = caseRoot("daily");
    const api = load(root);
    const live = path.join(root, "calendar-events.json");
    for (let i = 1; i <= 5; i += 1) await api.writeDataFile(live, rows(20 + i));
    const today = api.backupDayISO(new Date());
    const snapshot = path.join(api.backupDailyDir, today, "calendar-events.json");
    check("the day gets a snapshot", fs.existsSync(snapshot));
    check(
      "holding the day's starting state, not its latest",
      readJson(snapshot).length === 21,
      `${readJson(snapshot).length} rows`
    );
    check("and only one per file per day", fs.readdirSync(path.join(api.backupDailyDir, today)).length === 1);

    // Half a megabyte, written on every view switch, and append-only: sixty
    // daily copies would be ~30 MB of near-duplicate telemetry for a file the
    // guard already protects from the only thing that can go wrong with it.
    const noisy = path.join(root, "app-log.json");
    for (let i = 1; i <= 4; i += 1) await api.writeDataFile(noisy, rows(30 + i));
    check(
      "the high-frequency logs stay out of the daily snapshots",
      !fs.existsSync(path.join(api.backupDailyDir, today, "app-log.json"))
    );
    check("but still keep their pre-write history", historyFiles(api, "app-log.json").length > 0);
  }

  {
    console.log("\nWhat is deliberately not backed up:");
    const root = caseRoot("secrets");
    const api = load(root);
    const live = path.join(root, "google-calendar-auth.json");
    await api.writeDataFile(live, { refreshToken: "secret-value" });
    await api.writeDataFile(live, { refreshToken: "rotated-value" });
    check("the file itself is still written", readJson(live).refreshToken === "rotated-value");
    check("but no copy of the old token is left on disk", historyFiles(api, "google-calendar-auth.json").length === 0);
    const spilled = fs.existsSync(api.backupDailyDir)
      ? fs.readdirSync(api.backupDailyDir).some((day) => fs.existsSync(path.join(api.backupDailyDir, day, "google-calendar-auth.json")))
      : false;
    check("and none in the daily snapshots either", !spilled);
  }

  {
    console.log("\nCorruption and crash safety:");
    const root = caseRoot("corrupt");
    const api = load(root);
    const live = path.join(root, "calendar-events.json");

    fs.writeFileSync(live, "{ this is not json", "utf8");
    await api.writeDataFile(live, rows(40));
    check("an unparseable file can still be written over", readJson(live).length === 40);
    check(
      "and the corrupt bytes are preserved rather than lost",
      historyFiles(api, "calendar-events.json").some((file) =>
        fs.readFileSync(path.join(api.backupHistoryDir, "calendar-events.json", file), "utf8").includes("this is not json")
      )
    );
    check("no temp files are left behind", fs.readdirSync(root).every((file) => !file.endsWith(".tmp")), fs.readdirSync(root).join(", "));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  fs.rmSync(scratch, { recursive: true, force: true });
  process.exit(fail ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  fs.rmSync(scratch, { recursive: true, force: true });
  process.exit(1);
});
