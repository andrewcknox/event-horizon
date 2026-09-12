// The live drag preview: where paintCalendarBlockRange puts a block while a
// move or a resize is in flight.
//
// The bug this guards: a block is one day of an event, but the preview painted
// it from the event's own start. The morning half of an overnight sleep block
// (21:30 -> 06:00) therefore jumped into yesterday's column the instant either
// handle was dragged -- and when yesterday was not on screen (day view, or the
// first column of a week) it stayed put but slid to 89% down its own column,
// out of sight. Adjusting the length of a sleep block made it disappear.
//
// Run with: node tests/calendar-drag-preview.test.js

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

const EPOCH = "2020-01-01";
const dayIndex = (date) => Math.round((new Date(`${date}T00:00:00`) - new Date(`${EPOCH}T00:00:00`)) / 86400000);
const dayDate = (index) => new Date(new Date(`${EPOCH}T00:00:00`).getTime() + index * 86400000).toISOString().slice(0, 10);
const absolute = (date, clock) => dayIndex(date) * 1440 + Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3, 5));

// The one function under test, with the handful of things it reaches for stubbed.
const makePaint = (columns) => new Function(
  "CALENDAR_DAY_START_HOUR",
  "CALENDAR_DAY_END_HOUR",
  "CALENDAR_SNAP_MINUTES",
  "calendarDayIndexToDate",
  "document",
  "calendarEventTimeLabel",
  "absoluteMinutesToCalendarDateTime",
  `${sliceBetween(appSource, "/* Puts one block where a live drag says it is", "/* Lifts a block out of the overlap stack", "paintCalendarBlockRange")}
   return paintCalendarBlockRange;`
)(
  0,
  24,
  5,
  dayDate,
  {
    querySelector: (selector) => {
      const date = selector.match(/data-date="([^"]+)"/)?.[1];
      return columns[date] || null;
    }
  },
  () => "label",
  (minutes) => `${dayDate(Math.floor(minutes / 1440))}T00:00`
);

// Just enough of a block element for the paint to write to.
const makeBlock = (date, columns) => {
  const block = {
    isConnected: true,
    style: {},
    parentElement: columns[date],
    querySelector: () => null
  };
  columns[date].children.push(block);
  return block;
};

const makeColumns = (dates) => {
  const columns = {};
  for (const date of dates) {
    columns[date] = {
      dataset: { date },
      children: [],
      append(block) {
        block.parentElement = columns[date];
        columns[date].children.push(block);
      }
    };
  }
  return columns;
};

const percent = (value) => Number(String(value).replace("%", ""));
const heightPercent = (value) => Number(String(value).match(/([\d.]+)%/)?.[1]);

let pass = 0;
let fail = 0;
const check = (name, ok, detail = "") => {
  if (ok) {
    console.log(`PASS ${name}`);
    pass += 1;
    return;
  }
  console.log(`FAIL ${name}${detail ? ` -- ${detail}` : ""}`);
  fail += 1;
};

/* --- an ordinary same-day block still previews exactly as it did ---------- */
{
  const columns = makeColumns(["2026-09-10", "2026-09-11"]);
  const paint = makePaint(columns);
  const block = makeBlock("2026-09-11", columns);
  const start = absolute("2026-09-11", "09:00");
  const end = absolute("2026-09-11", "11:30");
  paint(block, start, end, null, { startAbsolute: start, endAbsolute: end });
  check("same-day block stays on its own column", block.parentElement.dataset.date === "2026-09-11", block.parentElement.dataset.date);
  check("same-day top is its start", percent(block.style.top).toFixed(2) === (9 / 24 * 100).toFixed(2), block.style.top);
  check("same-day height is its length", heightPercent(block.style.height).toFixed(2) === (2.5 / 24 * 100).toFixed(2), block.style.height);
}

/* --- the morning half of a sleep block, resized ---------------------------- */
{
  const columns = makeColumns(["2026-09-10", "2026-09-11"]);
  const paint = makePaint(columns);
  const block = makeBlock("2026-09-11", columns);
  // 21:30 yesterday -> 06:00 today, bottom handle dragged down to 06:45.
  const eventStart = absolute("2026-09-10", "21:30");
  const previewEnd = absolute("2026-09-11", "06:45");
  const dayStart = dayIndex("2026-09-11") * 1440;
  paint(block, eventStart, previewEnd, null, {
    startAbsolute: Math.max(dayStart, eventStart),
    endAbsolute: Math.min(dayStart + 1440, previewEnd)
  });
  check("overnight morning half stays on today's column", block.parentElement.dataset.date === "2026-09-11", block.parentElement.dataset.date);
  check("overnight morning half starts at midnight", percent(block.style.top) === 0, block.style.top);
  check("overnight morning half is as long as the drag", heightPercent(block.style.height).toFixed(2) === (6.75 / 24 * 100).toFixed(2), block.style.height);
}

/* --- the evening half, dragged past midnight, stops at the foot ----------- */
{
  const columns = makeColumns(["2026-09-10", "2026-09-11"]);
  const paint = makePaint(columns);
  const block = makeBlock("2026-09-10", columns);
  const eventStart = absolute("2026-09-10", "21:30");
  const previewEnd = absolute("2026-09-11", "02:00");
  const dayStart = dayIndex("2026-09-10") * 1440;
  paint(block, eventStart, previewEnd, null, {
    startAbsolute: Math.max(dayStart, eventStart),
    endAbsolute: Math.min(dayStart + 1440, previewEnd)
  });
  check("overnight evening half keeps its column", block.parentElement.dataset.date === "2026-09-10", block.parentElement.dataset.date);
  check(
    "overnight evening half is clipped at midnight",
    percent(block.style.top).toFixed(2) === (21.5 / 24 * 100).toFixed(2)
      && heightPercent(block.style.height).toFixed(2) === (2.5 / 24 * 100).toFixed(2),
    `${block.style.top} + ${block.style.height}`
  );
}

/* --- a move still carries the block to the day it is dropped on ----------- */
{
  const columns = makeColumns(["2026-09-10", "2026-09-11"]);
  const paint = makePaint(columns);
  const block = makeBlock("2026-09-10", columns);
  const start = absolute("2026-09-10", "09:00");
  const end = absolute("2026-09-10", "10:00");
  const delta = 1440 + 60; // a day and an hour later
  paint(block, start + delta, end + delta, null, { startAbsolute: start + delta, endAbsolute: end + delta });
  check("a move re-parents to the day it landed on", block.parentElement.dataset.date === "2026-09-11", block.parentElement.dataset.date);
  check("a move keeps its length", heightPercent(block.style.height).toFixed(2) === (1 / 24 * 100).toFixed(2), block.style.height);
}

/* --- a block dragged onto a day that is not on screen stays where it is --- */
{
  const columns = makeColumns(["2026-09-11"]);
  const paint = makePaint(columns);
  const block = makeBlock("2026-09-11", columns);
  const start = absolute("2026-09-12", "09:00");
  const end = absolute("2026-09-12", "10:00");
  paint(block, start, end, null, { startAbsolute: start, endAbsolute: end });
  check("no column for the target day leaves the block in place", block.parentElement.dataset.date === "2026-09-11", block.parentElement.dataset.date);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
