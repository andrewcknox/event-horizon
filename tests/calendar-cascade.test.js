// Overlap layout: the shorter block is always on top, and a block whose head is
// covered gets its text pushed down below the cover.
//
// The bug this guards: a short block was drawn underneath any longer block that
// opened after it and ran past it, leaving it a sliver of head and a 14px leak
// -- a half-hour call put inside a three-hour work block became unviewable and
// unselectable.
//
// Run with: node tests/calendar-cascade.test.js

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

const loadLayout = new Function(
  "events",
  "kindFilter",
  `
  const CALENDAR_SNAP_MINUTES = 5;
  const calendarEventStartMinutes = (event) => event.startMin;
  const calendarEventEndMinutes = (event) => event.endMin;
  ${sliceBetween(appSource, "const CALENDAR_OLD_PLAN_RAIL_WIDTH", "function nowLineForDates(", "layout")}
  return calendarTimedEventLayouts(events, kindFilter, null);
  `
);

let pass = 0;
let fail = 0;
const check = (name, ok, detail = "") => {
  if (ok) {
    console.log(`PASS ${name}`);
    pass += 1;
  } else {
    console.log(`FAIL ${name}${detail ? `  -> ${detail}` : ""}`);
    fail += 1;
  }
};

const ev = (id, startMin, endMin, extra = {}) => ({ id, kind: "plan", supersededAt: "", startMin, endMin, ...extra });
const lay = (events) => {
  const layouts = loadLayout(events, "plan");
  return Object.fromEntries(events.map((event) => [event.id, layouts.get(event)]));
};

// The reported case: a long block opening a few minutes after a short one.
{
  const l = lay([ev("call", 540, 570), ev("work", 545, 720)]);
  check("a short block is on top of a longer one that opens after it", l.call.depth > l.work.depth, `call ${l.call.depth} vs work ${l.work.depth}`);
  check("the short block keeps its full text", l.call.headCover === 0, String(l.call.headCover));
  check("the long block's text starts where the short one ends", l.work.headCover === 25, String(l.work.headCover));
  check("the block on top is stepped right", l.call.insetPx === 14 && l.work.insetPx === 0, `${l.call.insetPx} / ${l.work.insetPx}`);
}

// Short block wholly inside a long one that opened first: on top, as before.
{
  const l = lay([ev("work", 540, 720), ev("call", 600, 630)]);
  check("a short block inside a long one is on top", l.call.depth > l.work.depth);
  check("and the long block's title is not covered", l.work.headCover === 0, String(l.work.headCover));
}

// Same start: the shorter is on top and the longer one's text moves below it.
{
  const l = lay([ev("work", 540, 720), ev("call", 540, 570)]);
  check("on a shared start the shorter block is on top", l.call.depth > l.work.depth);
  check("the longer block's text starts below the shorter one", l.work.headCover === 30, String(l.work.headCover));
}

// Plain partial overlap of equal lengths: the later one is on top and the
// earlier keeps its head.
{
  const l = lay([ev("a", 540, 600), ev("b", 570, 630)]);
  check("equal lengths: the later block is on top", l.b.depth > l.a.depth);
  check("the earlier block keeps its title", l.a.headCover === 0 && l.b.headCover === 0);
}

// A cover starting later than the slack does not move the text.
{
  const l = lay([ev("work", 540, 720), ev("call", 560, 590)]);
  check("a cover well below the head leaves the text alone", l.work.headCover === 0, String(l.work.headCover));
}

// Chained covers keep pushing: the second call would hide the text where the
// first one left it.
{
  const l = lay([ev("call1", 540, 570), ev("work", 545, 720), ev("call2", 570, 585)]);
  check("both calls are above the work block", l.call1.depth > l.work.depth && l.call2.depth > l.work.depth);
  check("the work block's text clears both calls", l.work.headCover === 40, String(l.work.headCover));
}

// Three deep: a short block over a medium one over a long one.
{
  const l = lay([ev("long", 540, 780), ev("medium", 600, 700), ev("short", 620, 640)]);
  check("levels stack by length", l.long.level === 0 && l.medium.level === 1 && l.short.level === 2, `${l.long.level}/${l.medium.level}/${l.short.level}`);
  check("insets step with the level", l.short.insetPx === 28, String(l.short.insetPx));
}

// Two blocks that do not overlap sit at the same level even when one is shorter.
{
  const l = lay([ev("a", 540, 600), ev("b", 600, 615)]);
  check("touching blocks do not cascade", l.a.level === 0 && l.b.level === 0);
}

// A cover that swallows the whole block leaves it with no text room, never a
// negative one.
{
  const l = lay([ev("a", 540, 600), ev("b", 540, 600)]);
  const under = l.a.depth < l.b.depth ? l.a : l.b;
  check("a duplicate span covers the whole head, clamped to the block", under.headCover === 60, String(under.headCover));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
