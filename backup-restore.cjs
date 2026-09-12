#!/usr/bin/env node
/* Browse and restore the data-file backups written by server.cjs.

   The backups themselves are only half a safety net. The other half is being
   able to find the right version at the moment you need it, which is never a
   calm moment -- so this prints row counts and dates rather than making you
   open a directory of hashed filenames and guess.

   Nothing here needs the server running, and nothing here deletes a backup.
   `restore` archives whatever it is about to overwrite, so restoring the wrong
   version is itself undoable.

   Usage:
     node backup-restore.cjs status
     node backup-restore.cjs list [file]
     node backup-restore.cjs restore <file> [version]
     node backup-restore.cjs rejected [file]

   Examples:
     node backup-restore.cjs list calendar-events.json
     node backup-restore.cjs restore calendar-events.json            # newest
     node backup-restore.cjs restore calendar-events.json 2026-08-16 # that day
*/
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const backupsDir = path.join(root, "backups");
const historyDir = path.join(backupsDir, "history");
const dailyDir = path.join(backupsDir, "daily");
const rejectedDir = path.join(backupsDir, "rejected");
const manualDir = path.join(backupsDir, "pre-restore");

// The set worth reporting on. Kept in step with DATA_FILE_POLICY in server.cjs;
// a file missing here is only missing from the report, never from the backups.
const DATA_FILES = [
  "calendar-events.json",
  "goals.json",
  "goal-log.json",
  "custom-choices.json",
  "app-settings.json",
  "learn-list.json",
  "shopping-list.json",
  "albums.json",
  "eyerest-log.json",
  "hud-log.json",
  "app-log.json",
  "task-log.json"
];

function readDir(dir) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

function describe(text) {
  try {
    const value = JSON.parse(text);
    if (Array.isArray(value)) return `${value.length} rows`;
    if (value && typeof value === "object") return `${Object.keys(value).length} keys`;
    return typeof value;
  } catch {
    return "UNPARSEABLE";
  }
}

// Stored filenames are UTC so they sort correctly, but nothing here should be
// read in UTC: at +07 an evening backup shows up as the previous day, which is
// precisely the wrong thing to tell someone hunting for "yesterday's calendar".
function localStamp(date, withTime = true) {
  const pad = (value) => String(value).padStart(2, "0");
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return withTime ? `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` : day;
}

function fileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Every stored version of one file, newest last, from both the per-write history
// and the daily snapshots. The two are listed together on purpose: which of them
// holds the version you want depends on how long ago the damage was, and that is
// exactly what you do not know yet when you come looking.
function versionsFor(name) {
  const rows = [];
  for (const file of readDir(path.join(historyDir, name)).filter((f) => f.endsWith(".json")).sort()) {
    rows.push({ kind: "history", label: file.replace(/\.json$/, ""), file: path.join(historyDir, name, file) });
  }
  for (const day of readDir(dailyDir).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort()) {
    const file = path.join(dailyDir, day, name);
    if (fs.existsSync(file)) rows.push({ kind: "daily", label: day, file });
  }
  return rows.map((row) => {
    const stat = fs.statSync(row.file);
    return { ...row, mtime: stat.mtime, size: stat.size, summary: describe(fs.readFileSync(row.file, "utf8")) };
  }).sort((a, b) => a.mtime - b.mtime);
}

function commandStatus() {
  console.log("Live data files and the backups behind them:\n");
  const pad = Math.max(...DATA_FILES.map((f) => f.length));
  for (const name of DATA_FILES) {
    const live = path.join(root, name);
    let current = "MISSING";
    let size = "";
    if (fs.existsSync(live)) {
      current = describe(fs.readFileSync(live, "utf8"));
      size = fileSize(fs.statSync(live).size);
    }
    const versions = versionsFor(name);
    const oldest = versions.length ? localStamp(versions[0].mtime, false) : "-";
    console.log(
      `  ${name.padEnd(pad)}  ${current.padEnd(12)} ${size.padStart(9)}   ` +
        `${String(versions.length).padStart(3)} backups, back to ${oldest}`
    );
  }
  const rejected = readDir(rejectedDir).filter((name) => readDir(path.join(rejectedDir, name)).length);
  if (rejected.length) {
    console.log(`\n  Refused writes are being held for: ${rejected.join(", ")}`);
    console.log("  Inspect with: node backup-restore.cjs rejected <file>");
  }
  console.log("");
}

function commandList(name) {
  if (!name) {
    for (const file of DATA_FILES) {
      const count = versionsFor(file).length;
      if (count) console.log(`  ${file} — ${count} versions`);
    }
    console.log("\nFor one file: node backup-restore.cjs list <file>");
    return;
  }
  const versions = versionsFor(name);
  if (!versions.length) return console.log(`No backups stored for ${name}.`);
  console.log(`Stored versions of ${name}, oldest first:\n`);
  for (const version of versions) {
    console.log(
      `  ${localStamp(version.mtime)}  ` +
        `${version.kind.padEnd(7)} ${version.summary.padEnd(12)} ${fileSize(version.size).padStart(9)}  ${version.label}`
    );
  }
  const live = path.join(root, name);
  if (fs.existsSync(live)) console.log(`\n  live copy: ${describe(fs.readFileSync(live, "utf8"))}`);
  console.log(`\nRestore the newest with: node backup-restore.cjs restore ${name}`);
}

function commandRestore(name, wanted) {
  if (!name) throw new Error("restore needs a file name");
  const versions = versionsFor(name);
  if (!versions.length) throw new Error(`No backups stored for ${name}`);
  // Matched against the local stamp as well as the stored label, so the date a
  // user reads in `list` is the date they can type back into `restore`.
  const matches = wanted
    ? versions.filter((v) => v.label.startsWith(wanted) || localStamp(v.mtime).startsWith(wanted))
    : versions;
  if (!matches.length) throw new Error(`No stored version of ${name} matching "${wanted}"`);
  const chosen = matches[matches.length - 1];
  const live = path.join(root, name);

  // The copy being replaced goes somewhere durable first. Restoring the wrong
  // version is a normal thing to do when you are guessing at which one is right,
  // and it must not be the move that finally loses the data.
  if (fs.existsSync(live)) {
    fs.mkdirSync(path.join(manualDir, name), { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    fs.copyFileSync(live, path.join(manualDir, name, `${stamp}.json`));
  }
  fs.copyFileSync(chosen.file, live);
  console.log(`Restored ${name} from ${chosen.kind} ${chosen.label} (${chosen.summary}).`);
  console.log(`The copy it replaced is in backups/pre-restore/${name}/.`);
  console.log("Restart the server so it serves the restored file.");
}

function commandRejected(name) {
  const names = name ? [name] : readDir(rejectedDir);
  let found = false;
  for (const file of names) {
    const entries = readDir(path.join(rejectedDir, file)).filter((f) => f.endsWith(".json")).sort();
    if (!entries.length) continue;
    found = true;
    console.log(`\n${file} — writes the guard refused:\n`);
    for (const entry of entries) {
      const full = path.join(rejectedDir, file, entry);
      console.log(`  ${entry}  ${describe(fs.readFileSync(full, "utf8"))}`);
    }
  }
  if (!found) console.log("No refused writes are being held. Nothing has been blocked.");
  else console.log("\nThese were never written. To apply one, copy it over the live file yourself.");
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  switch (command) {
    case "status":
    case undefined:
      return commandStatus();
    case "list":
      return commandList(rest[0]);
    case "restore":
      return commandRestore(rest[0], rest[1]);
    case "rejected":
      return commandRejected(rest[0]);
    default:
      console.error(`Unknown command "${command}". Try: status | list | restore | rejected`);
      process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
