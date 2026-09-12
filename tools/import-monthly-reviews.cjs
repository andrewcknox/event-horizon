// One-time import of the pre-app monthly reviews from
// "New Years Goals Progress Check-In.xlsx" into monthly-reviews.json.
//
// Usage:
//   node tools/import-monthly-reviews.cjs [path-to-xlsx] [server]
//
// Defaults: the copy in Downloads, and http://127.0.0.1:8787. Writes go through
// POST /api/monthly-review (imported: true), so the server's serialised write
// chain and backup fan-out apply; the server must be running. Re-running
// replaces the imported months wholesale, which is what you want after fixing
// the sheet.
//
// Rows are matched to goals.json ids by normalised title so the review view can
// show past grades beside a live goal; unmatched rows are kept with their title
// alone. ALL-CAPS rows with empty grade columns are category headers.

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const xlsxPath = process.argv[2];
if (!xlsxPath) {
  console.error("Usage: node tools/import-monthly-reviews.cjs <workbook.xlsx> [server]");
  process.exit(1);
}
const server = process.argv[3] || "http://127.0.0.1:8787";
const goalsPath = path.join(__dirname, "..", "goals.json");

const SHEET_MONTHS = { Jan: "2026-01", Feb: "2026-02", Mar: "2026-03" };

function readZipEntries(buffer) {
  // End-of-central-directory is within the last 64KB + 22 bytes.
  let eocd = -1;
  const start = Math.max(0, buffer.length - 65558);
  for (let i = buffer.length - 22; i >= start; i -= 1) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Not a zip file (no end-of-central-directory)");
  const count = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let i = 0; i < count; i += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error("Bad central directory entry");
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + nameLength);
    entries.set(name, { method, compressedSize, localOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return {
    read(name) {
      const entry = entries.get(name);
      if (!entry) return null;
      const local = entry.localOffset;
      if (buffer.readUInt32LE(local) !== 0x04034b50) throw new Error(`Bad local header for ${name}`);
      const nameLength = buffer.readUInt16LE(local + 26);
      const extraLength = buffer.readUInt16LE(local + 28);
      const dataStart = local + 30 + nameLength + extraLength;
      const data = buffer.subarray(dataStart, dataStart + entry.compressedSize);
      if (entry.method === 0) return Buffer.from(data);
      if (entry.method === 8) return zlib.inflateRawSync(data);
      throw new Error(`Unsupported compression method ${entry.method} for ${name}`);
    }
  };
}

function decodeXmlText(value) {
  return String(value || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (m, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, "&");
}

function parseSharedStrings(xml) {
  if (!xml) return [];
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) =>
    decodeXmlText(
      [...match[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("")
    )
  );
}

function parseSheetRows(xml, shared) {
  const rows = [];
  for (const rowMatch of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = {};
    // Attribute order inside <c> is not fixed (r may come before or after t),
    // so take the whole tag and read the attributes out separately.
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cellMatch[1] || "";
      const body = cellMatch[2] || "";
      const column = /r="([A-Z]+)\d+"/.exec(attrs)?.[1];
      const type = /t="(\w+)"/.exec(attrs)?.[1] || "";
      if (!column) continue;
      let value = "";
      if (type === "inlineStr") {
        value = decodeXmlText([...body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(""));
      } else {
        const v = /<v>([\s\S]*?)<\/v>/.exec(body);
        if (v) value = type === "s" ? shared[Number(v[1])] ?? "" : decodeXmlText(v[1]);
      }
      cells[column] = value;
    }
    rows.push(cells);
  }
  return rows;
}

function normalizeTitle(title) {
  return String(title || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ").trim();
}

// goals.json titles are rewritten short forms of the sheet's prose rows
// ("100 Anki cards" vs "Get through the new anki backlog and keep it empty"),
// so exact title equality matches nothing. Instead: weight each word by how
// rare it is across the goal roster and score a sheet row against each goal by
// how much of the goal title's weight its words cover. Distinctive words
// (flashcards, stretching, inbox) decide; filler ("the", "every", "day")
// barely counts. A match needs both a real score and a clear win over the
// runner-up, because a wrong chip beside a goal is worse than no chip.
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "by", "at", "it", "its",
  "be", "is", "are", "was", "do", "did", "done", "have", "has", "had", "i", "my", "me", "im",
  "every", "each", "per", "day", "days", "daily", "week", "weekly", "month", "monthly",
  "keep", "go", "make", "up", "out", "not", "no", "when", "while", "that", "this",
  "some", "more", "least", "again", "already", "youre", "your", "you"
]);

function titleWords(title) {
  return normalizeTitle(title).split(" ").filter((word) => word && !STOPWORDS.has(word));
}

function buildGoalMatcher(goals) {
  const goalWordLists = goals.map((goal) => ({ id: goal.id, words: titleWords(goal.title) }));
  const documentFrequency = new Map();
  for (const { words } of goalWordLists) {
    for (const word of new Set(words)) documentFrequency.set(word, (documentFrequency.get(word) || 0) + 1);
  }
  const weight = (word) => 1 / (documentFrequency.get(word) || 1);
  return (sheetTitle) => {
    const rowWords = new Set(titleWords(sheetTitle));
    if (!rowWords.size) return "";
    let best = null;
    let second = 0;
    for (const { id, words } of goalWordLists) {
      if (!words.length) continue;
      let shared = 0;
      let total = 0;
      for (const word of new Set(words)) {
        const w = weight(word);
        total += w;
        if (rowWords.has(word)) shared += w;
      }
      const score = total ? shared / total : 0;
      if (!best || score > best.score) {
        second = best ? best.score : 0;
        best = { id, score };
      } else if (score > second) {
        second = score;
      }
    }
    if (!best || best.score < 0.55 || best.score - second < 0.15) return "";
    return best.id;
  };
}

function looksLikeCategoryHeader(cells) {
  const title = String(cells.A || "").trim();
  if (!title) return false;
  if (String(cells.B || "").trim() || String(cells.C || "").trim() || String(cells.D || "").trim()) return false;
  const letters = title.replace(/[^a-zA-Z]/g, "");
  return letters.length >= 3 && letters === letters.toUpperCase();
}

async function main() {
  const workbook = readZipEntries(fs.readFileSync(xlsxPath));
  const workbookXml = workbook.read("xl/workbook.xml").toString("utf8");
  const relsXml = workbook.read("xl/_rels/workbook.xml.rels").toString("utf8");
  const shared = parseSharedStrings(workbook.read("xl/sharedStrings.xml")?.toString("utf8"));

  const relTargets = new Map(
    [...relsXml.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)].map((match) => [match[1], match[2]])
  );
  const sheets = new Map(
    [...workbookXml.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)].map((match) => [
      match[1],
      relTargets.get(match[2])
    ])
  );

  let goals = [];
  try {
    goals = JSON.parse(fs.readFileSync(goalsPath, "utf8")).goals || [];
  } catch {
    console.warn("goals.json not readable — rows will import without goal ids");
  }
  const goalByTitle = new Map(goals.map((goal) => [normalizeTitle(goal.title), goal.id]));
  const fuzzyMatch = buildGoalMatcher(goals);

  for (const [sheetName, month] of Object.entries(SHEET_MONTHS)) {
    const target = sheets.get(sheetName);
    if (!target) {
      console.warn(`Sheet ${sheetName} not found — skipped`);
      continue;
    }
    const sheetXml = workbook.read(`xl/${target.replace(/^\//, "")}`).toString("utf8");
    const cellsRows = parseSheetRows(sheetXml, shared);
    const rows = [];
    for (const [index, cells] of cellsRows.entries()) {
      const title = String(cells.A || "").trim();
      if (!title) continue;
      // The column-header row ("Goal / How well did I do..."), wherever it sits.
      if (index === 0 && /how well/i.test(String(cells.B || ""))) continue;
      if (looksLikeCategoryHeader(cells)) {
        rows.push({ header: true, title });
        continue;
      }
      const gradeRaw = String(cells.B ?? "").trim();
      const grade = gradeRaw !== "" && Number.isFinite(Number(gradeRaw)) ? Number(gradeRaw) : null;
      // Non-numeric grades ("N/M") are notes, not numbers; keep them readable.
      const gradeNote = gradeRaw !== "" && grade === null ? `[${gradeRaw}] ` : "";
      rows.push({
        goalId: goalByTitle.get(normalizeTitle(title)) || fuzzyMatch(title),
        title,
        grade,
        explain: gradeNote + String(cells.C || "").trim(),
        change: String(cells.D || "").trim()
      });
    }
    const response = await fetch(`${server}/api/monthly-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, rows, imported: true })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`POST /api/monthly-review ${month} failed: ${response.status} ${detail}`);
    }
    const matched = rows.filter((row) => row.goalId).length;
    const goalsCount = rows.filter((row) => !row.header).length;
    console.log(`${sheetName} -> ${month}: ${goalsCount} rows (${matched} matched to goals.json ids)`);
  }
  console.log("Done.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
