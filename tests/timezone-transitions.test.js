// Harness: runs the real conversion helpers and the real transition timeline
// out of app.js against moves that actually break things -- a westward hop that
// gives an hour back, an eastward one that takes a morning away, and the date
// line, which can delete a date outright.
//
// What this guards: every honest number in the app now comes out of
// dateZoneSegments(). The day's real length, the segmented hour grid, the
// work-hours totals and the goal-expiry sweep all read it, and none of them
// would throw if it were wrong -- a travel day would just quietly count as 24
// hours like any other, which is the exact error the whole feature exists to
// stop.
//
// The invariant that actually holds is about the *run* of dates, not one date:
// total real minutes across them = 1440 per date minus the offset change. The
// tempting shortcut -- "the travel day is 1440 minus the change" -- is only true
// when the move leaves the local date alone. Fly Bangkok to New York at 09:00
// and it is already the previous evening on arrival, so the eleven hours split:
// two of them lengthen the day before, nine stay on the travel day, and the
// travel day then gets a whole fresh New York day on top of them. The
// assertions below are written against the segments for that reason.
//
// The DST case is here because it is the same arithmetic with nobody moving:
// a spring-forward date really is 23 hours long, and any code dividing by 24
// is wrong twice a year even for someone who never leaves home.
//
// Run with: node tests/timezone-transitions.test.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");

const sliceBetween = (from, to, label) => {
  const a = appSource.indexOf(from);
  const b = appSource.indexOf(to, a);
  if (a === -1 || b === -1) throw new Error(`Could not extract ${label}`);
  return appSource.slice(a, b);
};

const conversions = sliceBetween("const ZONE_WALL_CLOCK_PATTERN", "function zoneOffsetLabel(", "conversion helpers");
const timeline = sliceBetween("const ZONE_TRANSITION_SOURCES", "function formatDateLine(", "transition timeline");

const load = (deviceZone, transitions) =>
  new Function(
    "deviceZone",
    "rows",
    `
    const shiftISODate = (dateString, days) => {
      const date = new Date(dateString + "T12:00:00Z");
      date.setUTCDate(date.getUTCDate() + days);
      return date.toISOString().slice(0, 10);
    };
    const normalizeCalendarDateTime = (value) => {
      const text = String(value || "").trim();
      if (/^\\d{4}-\\d{2}-\\d{2}$/.test(text)) return text + "T00:00";
      if (/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$/.test(text)) return text;
      return "";
    };
    let activeView = "document";
    const renderCalendarView = () => {};
    ${conversions}
    ${timeline}
    // The device zone is what the timeline falls back to with nothing recorded,
    // so the test has to own it rather than inherit the machine's.
    currentTimeZone = () => deviceZone;
    setZoneTransitions(rows);
    zoneTransitionsLoaded = true;
    return {
      dateZoneSegments,
      dateRealMinutes,
      zoneForDate,
      zoneAtInstant,
      isZoneTransitionDate,
      isShortZoneDate,
      zoneTransitionsOnDate,
      transitions: zoneTransitions,
      convertZoneWallClock,
      zoneWallClockToInstant,
      zoneOffsetMinutes
    };
    `
  )(deviceZone, transitions);

let failures = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures += 1;
    console.log(`FAIL ${label}\n  expected ${JSON.stringify(expected)}\n  actual   ${JSON.stringify(actual)}`);
  } else {
    console.log(`ok   ${label}`);
  }
};

/* --- Nothing recorded: the app behaves exactly as it did before ----------- */
{
  const tz = load("Asia/Bangkok", []);
  check("no log: one segment a day", tz.dateZoneSegments("2026-08-14").length, 1);
  check("no log: 24 hours", tz.dateRealMinutes("2026-08-14"), 1440);
  check("no log: not a transition date", tz.isZoneTransitionDate("2026-08-14"), false);
  check("no log: zone is the device zone", tz.zoneForDate("2026-08-14"), "Asia/Bangkok");
  check("no log: nothing is a short day", tz.isShortZoneDate("2026-08-14"), false);
}

/* --- DST, which is the same problem without going anywhere ---------------- */
{
  const tz = load("America/New_York", []);
  check("spring forward is 23 hours", tz.dateRealMinutes("2026-03-08"), 1380);
  check("fall back is 25 hours", tz.dateRealMinutes("2026-11-01"), 1500);
  check("an ordinary New York day", tz.dateRealMinutes("2026-06-15"), 1440);
}

/* --- The real move: Taipei -> Bangkok, an hour handed back ---------------- */
{
  const tz = load("Asia/Bangkok", [
    { id: "a", from: "Asia/Taipei", to: "Asia/Bangkok", at: "2026-08-14T13:20", source: "manual" }
  ]);
  const segments = tz.dateZoneSegments("2026-08-14");
  check("westward: two segments", segments.length, 2);
  check("westward: 25 hours lived", tz.dateRealMinutes("2026-08-14"), 1500);
  check("westward: first segment is Taipei midnight to 13:20", [segments[0].zone, segments[0].startMinutes, segments[0].endMinutes], ["Asia/Taipei", 0, 800]);
  check("westward: second picks up at 12:20 Bangkok", [segments[1].zone, segments[1].startMinutes, segments[1].endMinutes], ["Asia/Bangkok", 740, 1440]);
  check("westward: the hour is lived twice", segments[0].endMinutes - segments[1].startMinutes, 60);
  check("westward: it is a transition date", tz.isZoneTransitionDate("2026-08-14"), true);
  check("westward: labelled with the zone woken up in", tz.zoneForDate("2026-08-14"), "Asia/Taipei");
  check("westward: the day after is ordinary", tz.dateRealMinutes("2026-08-15"), 1440);
  check("westward: the day after is Bangkok", tz.zoneForDate("2026-08-15"), "Asia/Bangkok");
  check("westward: the day before is Taipei", tz.zoneForDate("2026-08-13"), "Asia/Taipei");
  check("westward: one transition on the date", tz.zoneTransitionsOnDate("2026-08-14").length, 1);
}

/* --- Eastward: Bangkok -> Tokyo, a morning taken away --------------------- */
{
  const tz = load("Asia/Tokyo", [
    { id: "a", from: "Asia/Bangkok", to: "Asia/Tokyo", at: "2026-09-01T08:00", source: "manual" }
  ]);
  const segments = tz.dateZoneSegments("2026-09-01");
  check("eastward: 22 hours lived", tz.dateRealMinutes("2026-09-01"), 1320);
  check("eastward: the gap is two hours", segments[1].startMinutes - segments[0].endMinutes, 120);
  check("eastward: nothing was lived between 08:00 and 10:00", [segments[0].endMinutes, segments[1].startMinutes], [480, 600]);
}

/* --- The long haul: Bangkok -> New York, a 35-hour day -------------------- */
{
  const tz = load("America/New_York", [
    { id: "a", from: "Asia/Bangkok", to: "America/New_York", at: "2026-08-20T09:00", source: "manual" }
  ]);
  // Landing at 22:00 on the 19th New York time is what splits the eleven hours
  // across two dates instead of piling them all onto the travel day.
  check("long haul: the 20th runs 33 hours", tz.dateRealMinutes("2026-08-20"), 1980);
  check("long haul: the 19th is lengthened to 26", tz.dateRealMinutes("2026-08-19"), 1560);
  check("long haul: eleven hours gained across the pair", tz.dateRealMinutes("2026-08-19") + tz.dateRealMinutes("2026-08-20") - 2 * 1440, 660);
  check("long haul: still two segments", tz.dateZoneSegments("2026-08-20").length, 2);
  check("long haul: the 20th starts in Bangkok", tz.zoneForDate("2026-08-20"), "Asia/Bangkok");
  check("long haul: the 21st is ordinary", tz.dateRealMinutes("2026-08-21"), 1440);
}

/* --- The date line, which can delete a date ------------------------------- */
{
  // UTC-12 to UTC+14 is the widest jump the map allows: 26 hours forward, so a
  // late-evening departure lands on the day after tomorrow and the day in
  // between is never lived at all.
  const tz = load("Pacific/Kiritimati", [
    { id: "a", from: "Etc/GMT+12", to: "Pacific/Kiritimati", at: "2026-03-09T23:00", source: "manual" }
  ]);
  check("date line: the 10th never happened", tz.dateZoneSegments("2026-03-10").length, 0);
  check("date line: no real time in it", tz.dateRealMinutes("2026-03-10"), 0);
  check("date line: it counts as a short day", tz.isShortZoneDate("2026-03-10"), true);
  check("date line: the 9th ended at 23:00", tz.dateRealMinutes("2026-03-09"), 1380);
  // Arrival is 01:00 on the 11th, so that date lost its first hour too.
  check("date line: the 11th starts an hour in", tz.dateRealMinutes("2026-03-11"), 1380);
  check("date line: 26 hours gone across the three", 3 * 1440 - (tz.dateRealMinutes("2026-03-09") + tz.dateRealMinutes("2026-03-10") + tz.dateRealMinutes("2026-03-11")), 1560);
}

/* --- Two moves inside one date -------------------------------------------- */
{
  const tz = load("Asia/Bangkok", [
    { id: "a", from: "Asia/Taipei", to: "Asia/Dubai", at: "2026-10-02T06:00", source: "manual" },
    { id: "b", from: "Asia/Dubai", to: "Asia/Bangkok", at: "2026-10-02T09:00", source: "manual" }
  ]);
  const segments = tz.dateZoneSegments("2026-10-02");
  check("two moves: three segments", segments.length, 3);
  check("two moves: zones in order", segments.map((segment) => segment.zone), ["Asia/Taipei", "Asia/Dubai", "Asia/Bangkok"]);
  // Taipei +8 -> Dubai +4 is four hours back, Dubai +4 -> Bangkok +7 is three
  // forward: net one hour back, so the date is 25 hours long.
  check("two moves: net one hour gained", tz.dateRealMinutes("2026-10-02"), 1500);
  check("two moves: both transitions found", tz.zoneTransitionsOnDate("2026-10-02").length, 2);
}

/* --- The rows themselves --------------------------------------------------- */
{
  const tz = load("Asia/Bangkok", [
    { id: "a", from: "Asia/Taipei", to: "Asia/Bangkok", at: "2026-08-14T13:20", source: "manual" },
    { id: "b", from: "Asia/Bangkok", to: "Asia/Bangkok", at: "2026-08-15T10:00", source: "manual" },
    { id: "c", from: "Not/AZone", to: "Asia/Tokyo", at: "2026-08-16T10:00", source: "manual" },
    { id: "d", from: "Asia/Bangkok", to: "Asia/Tokyo", at: "", source: "manual" }
  ]);
  check("a move to the same zone is not a move", tz.transitions.length, 1);
  check("the instant is derived from the clock", tz.transitions[0].atInstant, "2026-08-14T05:20:00.000Z");
  check("13:20 Taipei is 12:20 Bangkok", tz.convertZoneWallClock("2026-08-14T13:20", "Asia/Taipei", "Asia/Bangkok"), "2026-08-14T12:20");
}

/* --- One shift per event --------------------------------------------------- */
{
  const tz = load("Asia/Bangkok", [
    { id: "a", from: "Asia/Taipei", to: "Asia/Bangkok", at: "2026-08-14T13:20", eventId: "cal-1", source: "event" },
    { id: "b", from: "Asia/Taipei", to: "Asia/Bangkok", at: "2026-08-14T15:00", eventId: "cal-1", source: "event" }
  ]);
  check("the newest row for an event wins", tz.transitions.length, 1);
  check("and it is the later one", tz.transitions[0].at, "2026-08-14T15:00");
}

/* --- Durations across a move ----------------------------------------------

   The number that ends up in every hours total. Subtracting two clocks is right on an
   ordinary day and wrong on a travel day, and nothing about the wrong answer
   looks wrong. */
{
  const realMinutes = sliceBetween("function realMinutesBetweenClocks(", "function formatWorkDuration(", "duration helper");
  const durations = new Function(
    "segments",
    `
    const dateZoneSegments = () => segments;
    ${realMinutes}
    return realMinutesBetweenClocks;
    `
  );

  // Taipei -> Bangkok at 13:20: the clock goes back an hour, so 12:20-13:20 is
  // lived twice and the date runs 25 hours.
  const tz = load("Asia/Bangkok", [
    { id: "a", from: "Asia/Taipei", to: "Asia/Bangkok", at: "2026-08-14T13:20", source: "manual" }
  ]);
  const westward = durations(tz.dateZoneSegments("2026-08-14"));
  check("a block before the move is untouched", westward("2026-08-14", 8 * 60, 9 * 60), 60);
  check("a block after the move is untouched", westward("2026-08-14", 20 * 60, 21 * 60), 60);
  check("a block through the move gains the hour", westward("2026-08-14", 8 * 60, 17 * 60), 600);
  // The distinction the segment search exists for: sitting inside the repeated
  // hour is half an hour, running through it is ten.
  check("a block inside the repeated hour does not", westward("2026-08-14", 12 * 60 + 30, 13 * 60), 30);

  const east = load("Asia/Tokyo", [
    { id: "a", from: "Asia/Bangkok", to: "Asia/Tokyo", at: "2026-09-01T08:00", source: "manual" }
  ]);
  const eastward = durations(east.dateZoneSegments("2026-09-01"));
  check("eastward: a block through the move loses two hours", eastward("2026-09-01", 7 * 60, 12 * 60), 180);

  const ordinary = durations([]);
  check("with no segments it is plain clock subtraction", ordinary("2026-08-15", 9 * 60, 17 * 60), 480);
}

/* --- The divider the hour grid reads -------------------------------------- */
{
  const dividerChunk = sliceBetween("const ZONE_DIVIDER_PATTERN", "function ensureZoneDividersForDate(", "divider");
  const divider = new Function(`
    const zoneCityLabel = (zone) => String(zone || "").split("/").pop().replace(/_/g, " ");
    ${dividerChunk}
    return { zoneDividerLine, parseZoneDivider };
  `)();

  const line = divider.zoneDividerLine("Asia/Taipei", "Asia/Bangkok", "13:20", "12:20");
  check("the line reads as a sentence", line, "— time zone changed: Taipei → Bangkok, 13:20 becomes 12:20 —");
  check("and parses back", divider.parseZoneDivider(line), { from: "Taipei", to: "Bangkok", clock: "12:20" });
  // Typed by hand, or mangled by an export: still has to be recognised, because
  // an unrecognised divider silently merges two mornings into one grid.
  check("a hand-typed one still counts", divider.parseZoneDivider("- time zone changed: Taipei -> Bangkok, 13:20"), {
    from: "Taipei",
    to: "Bangkok",
    clock: "13:20"
  });
  check("an ordinary line is not a divider", divider.parseZoneDivider("09:00-10:00 gym"), null);
}

/* --- extractHours: both mornings survive ----------------------------------- */
{
  const hoursChunk = sliceBetween("function extractHours(", "function parseTimeRanges(", "extractHours");
  const rangesChunk = sliceBetween("function parseTimeRanges(", "function toMinutes(", "parseTimeRanges");
  const toMinutesChunk = sliceBetween("function toMinutes(", "function cleanActivity(", "toMinutes");
  const dividerChunk = sliceBetween("const ZONE_DIVIDER_PATTERN", "function ensureZoneDividersForDate(", "divider");
  const hours = new Function(`
    const zoneCityLabel = (zone) => String(zone || "").split("/").pop().replace(/_/g, " ");
    const appendUnique = (existing, value) => (existing ? (existing.includes(value) ? existing : existing + "; " + value) : value);
    const cleanActivity = (line) => line.replace(/^[\\d:\\s-]+(am|pm)?/i, "").trim();
    const categorize = () => "";
    ${toMinutesChunk}
    ${rangesChunk}
    ${dividerChunk}
    ${hoursChunk}
    return extractHours;
  `)();

  /* Bangkok to New York: the clock goes back eleven hours, so an evening in one
     zone is followed by a morning in the other. That backwards jump is what the
     crossed-noon rule was built to catch and what it gets wrong here -- it needs
     a jump of more than two hours to fire, which a short hop does not give it
     but a long haul does. */
  const travelDay = [
    "21:00-22:00 dinner before the flight",
    "— time zone changed: Bangkok → New York, 23:00 becomes 12:00 —",
    "08:00-09:00 second breakfast"
  ].join("\n");
  const parsed = hours(travelDay);
  check("the divider opens a second segment", parsed.segments.length, 2);
  check("and the second morning is still a morning", parsed.segments[1].plain[8], "second breakfast");
  check("not filed at 8 PM by the crossed-noon rule", parsed.segments[1].plain[20], "");
  check("the merged view holds both", parsed.plain[8], "second breakfast");

  // The same text without the divider is exactly the bug: the morning after
  // landing slides twelve hours into the evening, silently.
  const undivided = hours("21:00-22:00 dinner before the flight\n08:00-09:00 second breakfast");
  check("no divider, and the old heuristic still fires", undivided.plain[20], "second breakfast");
  check("leaving the morning empty", undivided.plain[8], "");
  check("an ordinary day is one segment", hours("09:00-10:00 gym").segments.length, 1);
}

/* --- The wormhole reads like a ticket --------------------------------------

   A block that carries a move is typed the way its ticket reads: Start in the
   departure zone's clock, End in the destination's. Storage still keeps both
   endpoints in the start's zone, and zoneShiftEndFromTicket() is the one
   place a ticket end is rewritten into it. The date of an end typed as a bare
   clock is settled by instant -- first moment at or after departure wearing
   that clock -- because comparing clocks across two zones is exactly what the
   date line inverts. */
{
  const ticketChunk = sliceBetween("function zoneShiftEndFromTicket(", "function normalizeCalendarEvent(", "ticket end helper");
  const ticket = new Function(`
    const shiftISODate = (dateString, days) => {
      const date = new Date(dateString + "T12:00:00Z");
      date.setUTCDate(date.getUTCDate() + days);
      return date.toISOString().slice(0, 10);
    };
    ${conversions}
    ${ticketChunk}
    return { zoneShiftEndFromTicket, convertZoneWallClock };
  `)();
  const end = ticket.zoneShiftEndFromTicket;

  // Bangkok 09:00 to Taipei 12:30 is two and a half hours, stored as 11:30 Bangkok.
  check("ticket: eastward end stored in the start's zone", end("2026-08-20T09:00", "12:30", "Asia/Bangkok", { to: "Asia/Taipei" }), "2026-08-20T11:30");
  // And the editor shows that stored end as the ticket clock again.
  check("ticket: round-trips back to the ticket clock", ticket.convertZoneWallClock("2026-08-20T11:30", "Asia/Bangkok", "Asia/Taipei"), "2026-08-20T12:30");
  // Taipei 09:00 to Bangkok 10:40 is two hours forty.
  check("ticket: westward end stored in the start's zone", end("2026-08-20T09:00", "10:40", "Asia/Taipei", { to: "Asia/Bangkok" }), "2026-08-20T11:40");
  // A red-eye typed as bare clocks: 23:30 Bangkok to 01:40 Taipei must land on
  // the next date, not two hours before takeoff.
  check("ticket: an overnight arrival rolls to the next date", end("2026-08-20T23:30", "01:40", "Asia/Bangkok", { to: "Asia/Taipei" }), "2026-08-21T00:40");
  // The date line: Tokyo 17:00 to Los Angeles 10:00 reads backwards on paper
  // and is a nine-hour flight, on the same calendar date in Los Angeles.
  check("ticket: the date line does not double the flight", end("2026-08-20T17:00", "10:00", "Asia/Tokyo", { to: "America/Los_Angeles" }), "2026-08-21T02:00");
  // An explicit end date is trusted as the destination's date.
  check("ticket: an explicit end date is read in the destination", end("2026-08-20T11:00", "15:30", "America/Los_Angeles", { to: "Asia/Tokyo" }, "2026-08-21"), "2026-08-20T23:30");
  // Equal instants stand: 10:00 Taipei is 09:00 Bangkok, not a day later.
  check("ticket: an arrival at the departure instant does not roll", end("2026-08-20T09:00", "10:00", "Asia/Bangkok", { to: "Asia/Taipei" }), "2026-08-20T09:00");
  // No usable destination zone: the clock is kept as typed.
  check("ticket: no destination zone keeps the typed clock", end("2026-08-20T09:00", "12:30", "Asia/Bangkok", { to: "" }), "2026-08-20T12:30");
}

/* --- The transit log's hour rows -------------------------------------------

   One row per real elapsed hour of a move, each labelled with both wall
   clocks. Elapsed hours are zone-free, which is the whole point: the rows are
   what lets someone log a flight without reasoning about the wormhole. */
{
  const rowsChunk = sliceBetween("function transitHourRows(", "function normalizeCalendarEvent(", "transit hour rows");
  const transit = new Function(`
    ${conversions}
    ${rowsChunk}
    return { transitHourRows, zoneWallClockToInstant };
  `)();
  // The real journey: Bangkok 17:30 to Los Angeles 22:35 the same evening,
  // which is 19 hours and 5 minutes of actual time.
  const start = transit.zoneWallClockToInstant("2026-08-20T17:30", "Asia/Bangkok");
  const end = transit.zoneWallClockToInstant("2026-08-21T12:35", "Asia/Bangkok");
  const hours = transit.transitHourRows(start, end, "Asia/Bangkok", "America/Los_Angeles");
  check("transit: a 19h05 journey gets 20 rows", hours.length, 20);
  check("transit: hour 1 wears both clocks", [hours[0].fromClock, hours[0].toClock], ["17:30", "03:30"]);
  check("transit: the last row is the 5-minute tail", [hours[19].fromClock, hours[19].toClock, hours[19].minutes], ["12:30", "22:30", 5]);
  check("transit: a backwards range has no rows", transit.transitHourRows(end, start, "Asia/Bangkok", "America/Los_Angeles").length, 0);
}

console.log(failures ? `\n${failures} failing check(s)` : "\nAll timezone transition checks passed");
process.exit(failures ? 1 : 0);
