// Harness: extracts the pieces that carry an archived ("superseded") plan --
// both normalizers, the day-column layout, and the deadline booking filter --
// and runs them over fabricated events.
//
// What this guards: supersededAt only works if BOTH normalizers keep it. Each
// one rebuilds the event object from scratch, so the field missing from either
// side means every old plan silently comes back to life (or dies) on the next
// save round-trip -- same failure mode as taskId/deadlineId, documented in
// LLM_README. The layout half guards the geometry contract: old plans collapse
// into rails on the left edge, the current plan starts to their right, an
// opened old plan lays out over the current plan's range and above it, and
// containment nesting never pairs blocks across plan generations. Finally, an
// archived block must not count as a deadline booking, or re-planning a day
// would leave its deadlines looking handled.
//
// Run with: node tests/plan-supersede.test.js
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

let pass = 0;
let fail = 0;
const check = (name, condition, detail = "") => {
  if (condition) {
    pass += 1;
    return;
  }
  fail += 1;
  console.log(`FAIL ${name}${detail ? `  -> ${detail}` : ""}`);
};

// --- the client normalizer keeps the field -----------------------------------

const loadAppNormalizer = new Function(`
  const splitLongCalendarTitle = (title, notes) => ({ title: String(title || "").trim(), notes: String(notes || "").trim() });
  const normalizeCalendarDateTime = (value) => {
    const text = String(value || "").trim();
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(text)) return text + "T00:00";
    if (/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$/.test(text)) return text;
    return "";
  };
  const isValidTimeZone = () => false;
  const normalizeEventZoneShift = () => null;
  const calendarViewZone = () => "";
  const zoneWallClockToInstant = () => 0;
  const convertZoneWallClock = (value) => value;
  const CALENDAR_CATEGORIES = [{ code: "W" }, { code: "C" }];
  const categoryColor = () => "";
  const CALENDAR_COLORS = ["#116b68"];
  const CALENDAR_RECURRENCE_OPTIONS = [{ value: "none" }, { value: "daily" }, { value: "weekly" }, { value: "monthly" }];
  const normalizeEstimateMinutes = (value) => Math.max(0, Math.round(Number(value) || 0));
  const calendarEventId = () => "generated-id";
  ${sliceBetween(appSource, "function normalizeCalendarEvent(", "// The instant an event's clock actually names", "app normalizer")}
  return normalizeCalendarEvent;
`);

// --- the server normalizer keeps the field -----------------------------------

const loadServerNormalizer = new Function(`
  const calendarCategoryCodes = new Set(["W", "C"]);
  const calendarRecurrences = new Set(["none", "daily", "weekly", "monthly"]);
  const normalizeEstimateMinutes = (value) => Math.max(0, Math.round(Number(value) || 0));
  const isValidTimeZone = () => false;
  const normalizeEventZoneShift = () => null;
  const normalizeTransitLog = () => [];
  const normalizeCalendarDateTime = (value) => {
    const text = String(value || "").trim();
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(text)) return text + "T00:00";
    if (/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$/.test(text)) return text;
    return "";
  };
  ${sliceBetween(serverSource, "function normalizeCalendarEvent(", "function normalizeCalendarDateTime(", "server normalizer")}
  return normalizeCalendarEvent;
`);

const base = { id: "e1", title: "Deep work", start: "2026-08-28T09:00", end: "2026-08-28T11:00" };
for (const [label, normalize] of [["app.js", loadAppNormalizer()], ["server.cjs", loadServerNormalizer()]]) {
  const kept = normalize({ ...base, kind: "plan", supersededAt: "2026-08-28T14:02:11.000Z" });
  check(`${label} keeps supersededAt on a plan`, kept.supersededAt === "2026-08-28T14:02:11.000Z", JSON.stringify(kept.supersededAt));
  const fresh = normalize({ ...base, kind: "plan" });
  check(`${label} defaults supersededAt to empty`, fresh.supersededAt === "", JSON.stringify(fresh.supersededAt));
  const actual = normalize({ ...base, kind: "actual", supersededAt: "2026-08-28T14:02:11.000Z" });
  check(`${label} drops supersededAt on an actual`, actual.supersededAt === "", JSON.stringify(actual.supersededAt));
  const roundTrip = normalize(normalize({ ...base, kind: "plan", supersededAt: "2026-08-28T14:02:11.000Z" }));
  check(`${label} is stable across repeated normalisation`, roundTrip.supersededAt === "2026-08-28T14:02:11.000Z");
}

// --- the layout: rails left, current plan right, opened plan on top ----------

const loadLayout = new Function(
  "events",
  "kindFilter",
  "expandedStamp",
  `
  const CALENDAR_SNAP_MINUTES = 5;
  const calendarEventStartMinutes = (event) => event.startMin;
  const calendarEventEndMinutes = (event) => event.endMin;
  ${sliceBetween(appSource, "const CALENDAR_OLD_PLAN_RAIL_WIDTH", "function nowLineForDates(", "layout")}
  return calendarTimedEventLayouts(events, kindFilter, expandedStamp);
  `
);

const ev = (id, startMin, endMin, extra = {}) => ({ id, kind: "plan", supersededAt: "", startMin, endMin, ...extra });
const STAMP_A = "2026-08-28T10:00:00.000Z";
const STAMP_B = "2026-08-28T14:00:00.000Z";

// No archived plans: geometry identical to the original contract.
{
  const current = [ev("a", 540, 660), ev("b", 700, 760, { kind: "actual" })];
  const layouts = loadLayout(current, "both", null);
  const a = layouts.get(current[0]);
  const b = layouts.get(current[1]);
  check("with no old plans, plans still span 0 to 0.42 in both mode", a.x0 === 0 && a.x1 === 0.42, `${a.x0}..${a.x1}`);
  check("and actuals still span 0.58 to 1", b.x0 === 0.58 && b.x1 === 1, `${b.x0}..${b.x1}`);
  check("and no rails are reported", (layouts.oldPlanRails || []).length === 0);
}

// Two archived generations stack as rails, oldest leftmost, current plan clear of them.
{
  const events = [
    ev("old-a", 540, 660, { supersededAt: STAMP_A }),
    ev("old-b", 540, 600, { supersededAt: STAMP_B }),
    ev("cur", 540, 660)
  ];
  const layouts = loadLayout(events, "plan", null);
  const rails = layouts.oldPlanRails;
  check("one rail per archive stamp", rails.length === 2, String(rails.length));
  check("rails are ordered oldest first", rails[0].stamp === STAMP_A && rails[1].stamp === STAMP_B);
  check("the older rail sits further left", rails[0].x0 < rails[1].x0, `${rails[0].x0} vs ${rails[1].x0}`);
  const oldA = layouts.get(events[0]);
  const cur = layouts.get(events[2]);
  check("an archived block is a sliver inside its rail", oldA.sliver && oldA.x0 === rails[0].x0 && oldA.x1 === rails[0].x1);
  check("the current plan starts to the right of the strip", cur.x0 > rails[1].x1, `${cur.x0} vs ${rails[1].x1}`);
  check("the current plan is not marked", !cur.sliver && !cur.oldPlanOpen);
}

// Opening one generation lays it out over the current plan's range, above it.
{
  const events = [
    ev("old-a", 540, 660, { supersededAt: STAMP_A }),
    ev("old-b", 540, 600, { supersededAt: STAMP_B }),
    ev("cur", 540, 660)
  ];
  const layouts = loadLayout(events, "plan", STAMP_A);
  const open = layouts.get(events[0]);
  const closed = layouts.get(events[1]);
  const cur = layouts.get(events[2]);
  check("the opened block is marked open, not sliver", open.oldPlanOpen && !open.sliver);
  check("it spans the current plan's range", open.x0 === cur.x0 && open.x1 === cur.x1, `${open.x0}..${open.x1} vs ${cur.x0}..${cur.x1}`);
  check("it stacks above the current plan", open.depth >= 6 && open.depth > cur.depth, `depth ${open.depth} vs ${cur.depth}`);
  check("the other generation stays a sliver", closed.sliver && !closed.oldPlanOpen);
  check("its rail reports open", layouts.oldPlanRails.find((rail) => rail.stamp === STAMP_A).open === true);
}

// Containment never nests across generations: an old block wrapping a current
// one must not become its parent (it would drag it into the rail).
{
  const events = [
    ev("old-wrap", 480, 720, { supersededAt: STAMP_A }),
    ev("cur-inside", 540, 600)
  ];
  const layouts = loadLayout(events, "plan", null);
  const inside = layouts.get(events[1]);
  check("a current block inside an old one keeps the full current range", inside.x0 > 0.05 && inside.x1 === 1 && inside.insetPx === 0, `${inside.x0}..${inside.x1} inset ${inside.insetPx}`);
  check("and the old wrapper stays a sliver", layouts.get(events[0]).sliver === true);
}

// --- an archived block is not a deadline booking -----------------------------

const loadDeadlinePlans = new Function(
  "events",
  `
  const state = { calendarEvents: events };
  const todayISO = () => "2026-08-28";
  ${sliceBetween(appSource, "function deadlinePlanEvents(", "function upcomingDeadlineItems(", "deadlinePlanEvents")}
  return deadlinePlanEvents;
  `
);

{
  const booked = { id: "p1", kind: "plan", supersededAt: "", deadlineId: "d1", start: "2026-08-29T09:00" };
  const archived = { id: "p2", kind: "plan", supersededAt: STAMP_A, deadlineId: "d1", start: "2026-08-30T09:00" };
  const deadlinePlanEvents = loadDeadlinePlans([booked, archived]);
  const bookings = deadlinePlanEvents("d1");
  check("a current linked block still books the deadline", bookings.length === 1 && bookings[0].id === "p1", JSON.stringify(bookings.map((b) => b.id)));
  const onlyArchived = loadDeadlinePlans([archived])("d1");
  check("an archived linked block does not", onlyArchived.length === 0, String(onlyArchived.length));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
